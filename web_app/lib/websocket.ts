import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { verify } from 'jsonwebtoken'
import { dbManager } from './database'

interface SocketUser {
  userId: string
  role: string
  department: string
  socketId: string
}

interface RealTimeEvent {
  type: string
  data: any
  timestamp: Date
  userId?: string
  department?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

class WebSocketManager {
  private static instance: WebSocketManager
  private io: SocketIOServer | null = null
  private connectedUsers: Map<string, SocketUser> = new Map()
  private departmentRooms: Map<string, Set<string>> = new Map()
  private eventQueue: RealTimeEvent[] = []
  private maxQueueSize = 1000

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  public initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    this.setupEventHandlers()
    console.log('✅ WebSocket server initialized')
  }

  private setupEventHandlers(): void {
    if (!this.io) return

    this.io.use(this.authenticateSocket.bind(this))

    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`)

      socket.on('join-department', (department: string) => {
        this.joinDepartmentRoom(socket.id, department)
      })

      socket.on('leave-department', (department: string) => {
        this.leaveDepartmentRoom(socket.id, department)
      })

      socket.on('subscribe-updates', (subscriptions: string[]) => {
        subscriptions.forEach(subscription => {
          socket.join(subscription)
        })
      })

      socket.on('patient-update', (data) => {
        this.handlePatientUpdate(socket, data)
      })

      socket.on('medicine-alert', (data) => {
        this.handleMedicineAlert(socket, data)
      })

      socket.on('lab-test-update', (data) => {
        this.handleLabTestUpdate(socket, data)
      })

      socket.on('emergency-alert', (data) => {
        this.handleEmergencyAlert(socket, data)
      })

      socket.on('disconnect', () => {
        this.handleDisconnection(socket.id)
        console.log(`🔌 User disconnected: ${socket.id}`)
      })
    })
  }

  private async authenticateSocket(socket: any, next: any): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      
      const user: SocketUser = {
        userId: decoded.userId,
        role: decoded.role,
        department: decoded.department,
        socketId: socket.id
      }

      this.connectedUsers.set(socket.id, user)
      socket.user = user

      next()
    } catch (error) {
      next(new Error('Invalid authentication token'))
    }
  }

  private joinDepartmentRoom(socketId: string, department: string): void {
    if (!this.departmentRooms.has(department)) {
      this.departmentRooms.set(department, new Set())
    }
    this.departmentRooms.get(department)!.add(socketId)
    
    if (this.io) {
      this.io.sockets.sockets.get(socketId)?.join(`department:${department}`)
    }
  }

  private leaveDepartmentRoom(socketId: string, department: string): void {
    const room = this.departmentRooms.get(department)
    if (room) {
      room.delete(socketId)
      if (room.size === 0) {
        this.departmentRooms.delete(department)
      }
    }

    if (this.io) {
      this.io.sockets.sockets.get(socketId)?.leave(`department:${department}`)
    }
  }

  private handleDisconnection(socketId: string): void {
    const user = this.connectedUsers.get(socketId)
    if (user) {
      // Remove from department rooms
      this.departmentRooms.forEach((room, department) => {
        if (room.has(socketId)) {
          room.delete(socketId)
          if (room.size === 0) {
            this.departmentRooms.delete(department)
          }
        }
      })

      this.connectedUsers.delete(socketId)
    }
  }

  // Event Handlers
  private async handlePatientUpdate(socket: any, data: any): Promise<void> {
    const event: RealTimeEvent = {
      type: 'PATIENT_UPDATE',
      data,
      timestamp: new Date(),
      userId: socket.user.userId,
      department: socket.user.department,
      priority: data.priority || 'medium'
    }

    await this.processEvent(event)
    
    // Broadcast to relevant departments
    this.broadcastToDepartment('emergency', 'patient-update', data)
    this.broadcastToDepartment('nursing', 'patient-update', data)
    
    // If critical, broadcast to all admins
    if (data.priority === 'CRITICAL') {
      this.broadcastToRole('admin', 'critical-patient-alert', data)
    }
  }

  private async handleMedicineAlert(socket: any, data: any): Promise<void> {
    const event: RealTimeEvent = {
      type: 'MEDICINE_ALERT',
      data,
      timestamp: new Date(),
      userId: socket.user.userId,
      priority: data.alertType === 'OUT_OF_STOCK' ? 'high' : 'medium'
    }

    await this.processEvent(event)
    
    // Broadcast to pharmacy and admin
    this.broadcastToDepartment('pharmacy', 'medicine-alert', data)
    this.broadcastToRole('admin', 'medicine-alert', data)
  }

  private async handleLabTestUpdate(socket: any, data: any): Promise<void> {
    const event: RealTimeEvent = {
      type: 'LAB_TEST_UPDATE',
      data,
      timestamp: new Date(),
      userId: socket.user.userId,
      department: 'laboratory'
    }

    await this.processEvent(event)
    
    // Broadcast to laboratory and requesting doctor
    this.broadcastToDepartment('laboratory', 'lab-test-update', data)
    if (data.requestingDoctor) {
      this.broadcastToUser(data.requestingDoctor, 'lab-test-result', data)
    }
  }

  private async handleEmergencyAlert(socket: any, data: any): Promise<void> {
    const event: RealTimeEvent = {
      type: 'EMERGENCY_ALERT',
      data,
      timestamp: new Date(),
      userId: socket.user.userId,
      priority: 'critical'
    }

    await this.processEvent(event)
    
    // Broadcast emergency to all relevant departments
    this.broadcastToAll('emergency-alert', data)
    
    // Log emergency event
    await this.logEmergencyEvent(event)
  }

  // Broadcasting Methods
  public broadcastToDepartment(department: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`department:${department}`).emit(event, {
        ...data,
        timestamp: new Date(),
        source: 'system'
      })
    }
  }

  public broadcastToRole(role: string, event: string, data: any): void {
    if (this.io) {
      this.connectedUsers.forEach((user, socketId) => {
        if (user.role === role) {
          this.io!.to(socketId).emit(event, {
            ...data,
            timestamp: new Date(),
            source: 'system'
          })
        }
      })
    }
  }

  public broadcastToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.connectedUsers.forEach((user, socketId) => {
        if (user.userId === userId) {
          this.io!.to(socketId).emit(event, {
            ...data,
            timestamp: new Date(),
            source: 'system'
          })
        }
      })
    }
  }

  public broadcastToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, {
        ...data,
        timestamp: new Date(),
        source: 'system'
      })
    }
  }

  // Event Processing
  private async processEvent(event: RealTimeEvent): Promise<void> {
    // Add to queue
    this.eventQueue.push(event)
    
    // Maintain queue size
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift()
    }

    // Process based on priority
    if (event.priority === 'critical') {
      await this.processCriticalEvent(event)
    }

    // Store in database for audit
    await this.storeEvent(event)
  }

  private async processCriticalEvent(event: RealTimeEvent): Promise<void> {
    // Immediate processing for critical events
    console.log(`🚨 CRITICAL EVENT: ${event.type}`, event.data)
    
    // Could trigger additional systems like:
    // - SMS alerts
    // - Email notifications
    // - Integration with hospital paging systems
    // - Automatic escalation procedures
  }

  private async storeEvent(event: RealTimeEvent): Promise<void> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('realtime_events')
      
      await collection.insertOne({
        ...event,
        processed: true,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Failed to store real-time event:', error)
    }
  }

  private async logEmergencyEvent(event: RealTimeEvent): Promise<void> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('emergency_logs')
      
      await collection.insertOne({
        ...event,
        severity: 'EMERGENCY',
        requiresResponse: true,
        responseDeadline: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Failed to log emergency event:', error)
    }
  }

  // Analytics and Monitoring
  public getConnectionStats(): {
    totalConnections: number
    departmentBreakdown: Record<string, number>
    roleBreakdown: Record<string, number>
    eventQueueSize: number
  } {
    const departmentBreakdown: Record<string, number> = {}
    const roleBreakdown: Record<string, number> = {}

    this.connectedUsers.forEach(user => {
      departmentBreakdown[user.department] = (departmentBreakdown[user.department] || 0) + 1
      roleBreakdown[user.role] = (roleBreakdown[user.role] || 0) + 1
    })

    return {
      totalConnections: this.connectedUsers.size,
      departmentBreakdown,
      roleBreakdown,
      eventQueueSize: this.eventQueue.length
    }
  }

  public getRecentEvents(limit: number = 50): RealTimeEvent[] {
    return this.eventQueue.slice(-limit)
  }

  // Health Check
  public healthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    connections: number
    queueSize: number
    uptime: number
  } {
    const connections = this.connectedUsers.size
    const queueSize = this.eventQueue.length
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (queueSize > this.maxQueueSize * 0.8) {
      status = 'degraded'
    }
    
    if (queueSize >= this.maxQueueSize || !this.io) {
      status = 'unhealthy'
    }

    return {
      status,
      connections,
      queueSize,
      uptime: process.uptime()
    }
  }
}

// Real-time Data Synchronization
export class RealTimeSync {
  private wsManager: WebSocketManager

  constructor() {
    this.wsManager = WebSocketManager.getInstance()
  }

  // Patient Management Sync
  public syncPatientUpdate(patientData: any): void {
    this.wsManager.broadcastToDepartment('emergency', 'patient-sync', {
      type: 'PATIENT_UPDATE',
      patient: patientData,
      timestamp: new Date()
    })

    this.wsManager.broadcastToDepartment('nursing', 'patient-sync', patientData)
  }

  public syncTriageUpdate(triageData: any): void {
    this.wsManager.broadcastToAll('triage-update', {
      type: 'TRIAGE_UPDATE',
      data: triageData,
      timestamp: new Date()
    })
  }

  // Medicine Management Sync
  public syncMedicineInventory(medicineData: any): void {
    this.wsManager.broadcastToDepartment('pharmacy', 'inventory-sync', {
      type: 'INVENTORY_UPDATE',
      medicine: medicineData,
      timestamp: new Date()
    })
  }

  public syncStockAlert(alertData: any): void {
    this.wsManager.broadcastToRole('admin', 'stock-alert', {
      type: 'STOCK_ALERT',
      alert: alertData,
      priority: alertData.severity,
      timestamp: new Date()
    })
  }

  // Lab Management Sync
  public syncLabTestUpdate(testData: any): void {
    this.wsManager.broadcastToDepartment('laboratory', 'lab-sync', {
      type: 'LAB_TEST_UPDATE',
      test: testData,
      timestamp: new Date()
    })
  }

  public syncTestResults(resultData: any): void {
    // Notify requesting doctor
    if (resultData.requestingDoctor) {
      this.wsManager.broadcastToUser(resultData.requestingDoctor, 'test-results', {
        type: 'TEST_RESULTS',
        results: resultData,
        timestamp: new Date()
      })
    }

    // Notify lab department
    this.wsManager.broadcastToDepartment('laboratory', 'results-ready', resultData)
  }

  // System-wide Sync
  public syncSystemAlert(alertData: any): void {
    this.wsManager.broadcastToAll('system-alert', {
      type: 'SYSTEM_ALERT',
      alert: alertData,
      priority: alertData.priority || 'medium',
      timestamp: new Date()
    })
  }

  public syncDashboardMetrics(metricsData: any): void {
    this.wsManager.broadcastToRole('admin', 'metrics-update', {
      type: 'METRICS_UPDATE',
      metrics: metricsData,
      timestamp: new Date()
    })
  }
}

export const wsManager = WebSocketManager.getInstance()
export const realTimeSync = new RealTimeSync()
