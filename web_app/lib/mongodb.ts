import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Healthcare Database Helper Functions
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db('healis_healthcare')
}

export async function getPatients() {
  const db = await getDatabase()
  return await db.collection('patients').find({}).toArray()
}

export async function getAppointments() {
  const db = await getDatabase()
  return await db.collection('appointments').find({}).toArray()
}

export async function getMedicalRecords() {
  const db = await getDatabase()
  return await db.collection('medical_records').find({}).toArray()
}

export async function getHospitals() {
  const db = await getDatabase()
  return await db.collection('hospitals').find({}).toArray()
}

// Real-time data insertion for demonstration
export async function insertSampleData() {
  const db = await getDatabase()
  
  // Sample Indian Healthcare Data
  const samplePatients = [
    {
      patientId: 'PT240001',
      fullName: 'Rajesh Kumar Sharma',
      age: 45,
      gender: 'Male',
      city: 'Mumbai',
      condition: 'Hypertension',
      priority: 7,
      phoneNumber: '+91-9876543210',
      email: 'rajesh.sharma@email.com',
      createdAt: new Date()
    },
    {
      patientId: 'PT240002',
      fullName: 'Priya Nair',
      age: 32,
      gender: 'Female',
      city: 'Kochi',
      condition: 'Diabetes Type 2',
      priority: 5,
      phoneNumber: '+91-9876543211',
      email: 'priya.nair@email.com',
      createdAt: new Date()
    },
    {
      patientId: 'PT240003',
      fullName: 'Amit Singh Patel',
      age: 28,
      gender: 'Male',
      city: 'Delhi',
      condition: 'Chest Pain',
      priority: 9,
      phoneNumber: '+91-9876543212',
      email: 'amit.patel@email.com',
      createdAt: new Date()
    }
  ]

  const sampleAppointments = [
    {
      patientId: 'PT240001',
      patientName: 'Rajesh Kumar Sharma',
      doctorName: 'Dr. Anil Sharma',
      specialty: 'Cardiology',
      appointmentDate: new Date('2024-10-30'),
      appointmentTime: '10:00',
      status: 'Scheduled',
      hospital: 'AIIMS Delhi'
    },
    {
      patientId: 'PT240002',
      patientName: 'Priya Nair',
      doctorName: 'Dr. Meera Iyer',
      specialty: 'Endocrinology',
      appointmentDate: new Date('2024-10-30'),
      appointmentTime: '11:00',
      status: 'Confirmed',
      hospital: 'Apollo Chennai'
    }
  ]

  const sampleHospitals = [
    {
      id: 'AIIMS_DEL',
      name: 'All India Institute of Medical Sciences',
      city: 'New Delhi',
      state: 'Delhi',
      type: 'Government',
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'],
      capacity: 2500,
      currentLoad: 85,
      coordinates: { lat: 28.5672, lng: 77.2100 }
    },
    {
      id: 'APOLLO_CHN',
      name: 'Apollo Hospitals',
      city: 'Chennai',
      state: 'Tamil Nadu',
      type: 'Private',
      specialties: ['Cardiac Surgery', 'Transplant', 'Oncology'],
      capacity: 1000,
      currentLoad: 72,
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    {
      id: 'FORTIS_MUM',
      name: 'Fortis Hospital',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'Private',
      specialties: ['Emergency', 'Trauma', 'Critical Care'],
      capacity: 800,
      currentLoad: 90,
      coordinates: { lat: 19.0760, lng: 72.8777 }
    }
  ]

  try {
    await db.collection('patients').insertMany(samplePatients)
    await db.collection('appointments').insertMany(sampleAppointments)
    await db.collection('hospitals').insertMany(sampleHospitals)
    console.log('Sample healthcare data inserted successfully!')
  } catch (error) {
    console.log('Data already exists or error:', error)
  }
}
