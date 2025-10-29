import { MongoClient, Db, Collection } from 'mongodb'
import { createHash } from 'crypto'

interface DatabaseConnection {
  client: MongoClient
  db: Db
  isConnected: boolean
}

class DatabaseManager {
  private static instance: DatabaseManager
  private connection: DatabaseConnection | null = null
  private connectionString: string
  private dbName: string
  private connectionPool: Map<string, MongoClient> = new Map()
  private maxPoolSize: number = 10
  private connectionTimeout: number = 30000

  private constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    this.dbName = process.env.DATABASE_NAME || 'healis_production'
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public async connect(): Promise<DatabaseConnection> {
    if (this.connection?.isConnected) {
      return this.connection
    }

    try {
      const client = new MongoClient(this.connectionString, {
        maxPoolSize: this.maxPoolSize,
        serverSelectionTimeoutMS: this.connectionTimeout,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        writeConcern: { w: 'majority' }
      })

      await client.connect()
      const db = client.db(this.dbName)

      // Test connection
      await db.admin().ping()

      this.connection = {
        client,
        db,
        isConnected: true
      }

      console.log(`✅ Connected to MongoDB: ${this.dbName}`)
      return this.connection

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error)
      throw new Error(`Database connection failed: ${error}`)
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection?.client) {
      await this.connection.client.close()
      this.connection.isConnected = false
      console.log('🔌 Disconnected from MongoDB')
    }
  }

  public async getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
    const connection = await this.connect()
    return connection.db.collection<T>(collectionName)
  }

  public async executeTransaction<T>(
    operations: (session: any) => Promise<T>
  ): Promise<T> {
    const connection = await this.connect()
    const session = connection.client.startSession()

    try {
      let result: T
      await session.withTransaction(async () => {
        result = await operations(session)
      })
      return result!
    } finally {
      await session.endSession()
    }
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    latency: number
    connections: number
    database: string
  }> {
    const startTime = Date.now()
    
    try {
      const connection = await this.connect()
      await connection.db.admin().ping()
      
      const latency = Date.now() - startTime
      const serverStatus = await connection.db.admin().serverStatus()
      
      return {
        status: 'healthy',
        latency,
        connections: serverStatus.connections?.current || 0,
        database: this.dbName
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        connections: 0,
        database: this.dbName
      }
    }
  }
}

// Repository Pattern for Data Access
export abstract class BaseRepository<T> {
  protected collection: Collection<T>
  protected collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  protected async getCollection(): Promise<Collection<T>> {
    if (!this.collection) {
      this.collection = await DatabaseManager.getInstance().getCollection<T>(this.collectionName)
    }
    return this.collection
  }

  public async findById(id: string): Promise<T | null> {
    const collection = await this.getCollection()
    const result = await collection.findOne({ _id: id } as any)
    return result as T | null
  }

  public async findMany(filter: any = {}, options: any = {}): Promise<T[]> {
    const collection = await this.getCollection()
    const results = await collection.find(filter, options).toArray()
    return results as T[]
  }

  public async create(document: Omit<T, '_id'>): Promise<T> {
    const collection = await this.getCollection()
    const result = await collection.insertOne(document as any)
    return { ...document, _id: result.insertedId } as T
  }

  public async updateById(id: string, update: Partial<T>): Promise<T | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: id } as any,
      { $set: update },
      { returnDocument: 'after' }
    )
    return result as T | null
  }

  public async deleteById(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id } as any)
    return result.deletedCount > 0
  }

  public async count(filter: any = {}): Promise<number> {
    const collection = await this.getCollection()
    return await collection.countDocuments(filter)
  }

  public async aggregate(pipeline: any[]): Promise<any[]> {
    const collection = await this.getCollection()
    return await collection.aggregate(pipeline).toArray()
  }
}

// Specific Repositories
export class PatientRepository extends BaseRepository<any> {
  constructor() {
    super('patients')
  }

  public async findByEmail(email: string) {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  public async findCriticalPatients() {
    const collection = await this.getCollection()
    return await collection.find({
      'priority': { $in: ['CRITICAL', 'EMERGENCY'] },
      'status': 'Waiting'
    }).toArray()
  }

  public async getTriageStatistics() {
    const collection = await this.getCollection()
    return await collection.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          avgWaitTime: { $avg: '$waitTime' }
        }
      }
    ]).toArray()
  }
}

export class MedicineRepository extends BaseRepository<any> {
  constructor() {
    super('medicines')
  }

  public async findLowStock() {
    const collection = await this.getCollection()
    return await collection.find({
      $expr: { $lte: ['$inventory.currentStock', '$inventory.minThreshold'] }
    }).toArray()
  }

  public async findExpiringSoon(days: number = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    const collection = await this.getCollection()
    return await collection.find({
      'expiryInfo.expiryDate': { $lte: futureDate }
    }).toArray()
  }

  public async updateStock(medicineId: string, quantity: number, operation: 'add' | 'subtract') {
    const collection = await this.getCollection()
    const updateOperation = operation === 'add' 
      ? { $inc: { 'inventory.currentStock': quantity } }
      : { $inc: { 'inventory.currentStock': -quantity } }
    
    return await collection.findOneAndUpdate(
      { medicineId },
      updateOperation,
      { returnDocument: 'after' }
    )
  }
}

export class LabTestRepository extends BaseRepository<any> {
  constructor() {
    super('labtests')
  }

  public async findPendingTests() {
    const collection = await this.getCollection()
    return await collection.find({ status: 'Pending' })
      .sort({ priority: 1, bookingDate: 1 })
      .toArray()
  }

  public async getTechnicianWorkload() {
    const collection = await this.getCollection()
    return await collection.aggregate([
      {
        $match: { status: 'In Progress' }
      },
      {
        $group: {
          _id: '$assignedTechnician',
          currentLoad: { $sum: 1 },
          avgProcessingTime: { $avg: '$estimatedDuration' }
        }
      }
    ]).toArray()
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance()
export const patientRepo = new PatientRepository()
export const medicineRepo = new MedicineRepository()
export const labTestRepo = new LabTestRepository()
