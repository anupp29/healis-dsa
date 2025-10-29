import { dbManager } from './database'
import { createHash } from 'crypto'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_API = 'external_api',
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  timestamp: Date
  stackTrace?: string
  additionalData?: Record<string, any>
}

export interface SystemError {
  id: string
  message: string
  code: string
  severity: ErrorSeverity
  category: ErrorCategory
  context: ErrorContext
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  occurrenceCount: number
  firstOccurrence: Date
  lastOccurrence: Date
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: SystemError[] = []
  private maxQueueSize = 10000
  private alertThresholds = {
    [ErrorSeverity.CRITICAL]: 1,
    [ErrorSeverity.HIGH]: 5,
    [ErrorSeverity.MEDIUM]: 20,
    [ErrorSeverity.LOW]: 100
  }

  private constructor() {
    this.setupGlobalErrorHandlers()
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.handleCriticalError(error, {
        category: ErrorCategory.SYSTEM,
        message: 'Uncaught Exception',
        context: { timestamp: new Date() }
      })
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.handleCriticalError(new Error(String(reason)), {
        category: ErrorCategory.SYSTEM,
        message: 'Unhandled Promise Rejection',
        context: { timestamp: new Date(), promise: promise.toString() }
      })
    })
  }

  public async handleError(
    error: Error,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context: Partial<ErrorContext> = {}
  ): Promise<string> {
    const errorId = this.generateErrorId()
    const fullContext: ErrorContext = {
      ...context,
      timestamp: context.timestamp || new Date(),
      stackTrace: error.stack
    }

    const systemError: SystemError = {
      id: errorId,
      message: error.message,
      code: this.generateErrorCode(category, error.name),
      severity,
      category,
      context: fullContext,
      resolved: false,
      occurrenceCount: 1,
      firstOccurrence: fullContext.timestamp,
      lastOccurrence: fullContext.timestamp
    }

    await this.processError(systemError)
    return errorId
  }

  private async handleCriticalError(
    error: Error,
    details: {
      category: ErrorCategory
      message: string
      context: Partial<ErrorContext>
    }
  ): Promise<void> {
    console.error('🚨 CRITICAL SYSTEM ERROR:', error)
    
    await this.handleError(error, ErrorSeverity.CRITICAL, details.category, details.context)
    
    // For critical errors, we might want to:
    // 1. Send immediate alerts
    // 2. Create incident tickets
    // 3. Notify on-call engineers
    // 4. Potentially shut down affected services
  }

  private async processError(systemError: SystemError): Promise<void> {
    try {
      // Check if this error has occurred before
      const existingError = await this.findSimilarError(systemError)
      
      if (existingError) {
        await this.updateExistingError(existingError.id, systemError)
      } else {
        await this.storeNewError(systemError)
      }

      // Add to in-memory queue
      this.addToQueue(systemError)

      // Check if we need to send alerts
      await this.checkAlertThresholds(systemError)

      // Log to console based on severity
      this.logToConsole(systemError)

    } catch (processingError) {
      console.error('Failed to process error:', processingError)
      // Fallback: at least log to console
      console.error('Original error:', systemError)
    }
  }

  private async findSimilarError(systemError: SystemError): Promise<SystemError | null> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('system_errors')
      
      const similar = await collection.findOne({
        code: systemError.code,
        message: systemError.message,
        category: systemError.category,
        resolved: false
      })

      return similar as SystemError | null
    } catch (error) {
      console.error('Failed to find similar error:', error)
      return null
    }
  }

  private async updateExistingError(errorId: string, newError: SystemError): Promise<void> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('system_errors')
      
      await collection.updateOne(
        { id: errorId },
        {
          $inc: { occurrenceCount: 1 },
          $set: { lastOccurrence: newError.context.timestamp },
          $push: { contexts: newError.context }
        }
      )
    } catch (error) {
      console.error('Failed to update existing error:', error)
    }
  }

  private async storeNewError(systemError: SystemError): Promise<void> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('system_errors')
      
      await collection.insertOne({
        ...systemError,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to store new error:', error)
    }
  }

  private addToQueue(systemError: SystemError): void {
    this.errorQueue.push(systemError)
    
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  private async checkAlertThresholds(systemError: SystemError): Promise<void> {
    const threshold = this.alertThresholds[systemError.severity]
    
    if (systemError.occurrenceCount >= threshold) {
      await this.sendAlert(systemError)
    }
  }

  private async sendAlert(systemError: SystemError): Promise<void> {
    // In a real implementation, this would:
    // 1. Send emails to on-call engineers
    // 2. Create Slack/Teams notifications
    // 3. Create incident tickets in JIRA/ServiceNow
    // 4. Send SMS for critical errors
    
    console.log(`🚨 ALERT: ${systemError.severity.toUpperCase()} error threshold reached`, {
      errorId: systemError.id,
      message: systemError.message,
      occurrenceCount: systemError.occurrenceCount
    })
  }

  private logToConsole(systemError: SystemError): void {
    const logMessage = `[${systemError.severity.toUpperCase()}] ${systemError.category}: ${systemError.message}`
    
    switch (systemError.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨', logMessage, systemError.context)
        break
      case ErrorSeverity.HIGH:
        console.error('❌', logMessage)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️', logMessage)
        break
      case ErrorSeverity.LOW:
        console.info('ℹ️', logMessage)
        break
    }
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateErrorCode(category: ErrorCategory, errorName: string): string {
    const categoryCode = category.toUpperCase().replace('_', '')
    return `${categoryCode}_${errorName.toUpperCase().replace(/\s+/g, '_')}`
  }

  // Public methods for error reporting
  public async reportDatabaseError(error: Error, context: Partial<ErrorContext> = {}): Promise<string> {
    return this.handleError(error, ErrorSeverity.HIGH, ErrorCategory.DATABASE, context)
  }

  public async reportAuthenticationError(error: Error, context: Partial<ErrorContext> = {}): Promise<string> {
    return this.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.AUTHENTICATION, context)
  }

  public async reportValidationError(error: Error, context: Partial<ErrorContext> = {}): Promise<string> {
    return this.handleError(error, ErrorSeverity.LOW, ErrorCategory.VALIDATION, context)
  }

  public async reportSecurityError(error: Error, context: Partial<ErrorContext> = {}): Promise<string> {
    return this.handleError(error, ErrorSeverity.CRITICAL, ErrorCategory.SECURITY, context)
  }

  public async reportBusinessLogicError(error: Error, context: Partial<ErrorContext> = {}): Promise<string> {
    return this.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.BUSINESS_LOGIC, context)
  }

  // Error resolution
  public async resolveError(errorId: string, resolvedBy: string, resolution: string): Promise<boolean> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('system_errors')
      
      const result = await collection.updateOne(
        { id: errorId },
        {
          $set: {
            resolved: true,
            resolvedAt: new Date(),
            resolvedBy,
            resolution,
            updatedAt: new Date()
          }
        }
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Failed to resolve error:', error)
      return false
    }
  }

  // Analytics and reporting
  public async getErrorStatistics(timeRange: { start: Date; end: Date }): Promise<{
    totalErrors: number
    errorsBySeverity: Record<ErrorSeverity, number>
    errorsByCategory: Record<ErrorCategory, number>
    resolvedErrors: number
    averageResolutionTime: number
    topErrors: Array<{ message: string; count: number }>
  }> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('system_errors')
      
      const pipeline = [
        {
          $match: {
            firstOccurrence: {
              $gte: timeRange.start,
              $lte: timeRange.end
            }
          }
        },
        {
          $group: {
            _id: null,
            totalErrors: { $sum: 1 },
            resolvedErrors: {
              $sum: { $cond: ['$resolved', 1, 0] }
            },
            errorsBySeverity: {
              $push: '$severity'
            },
            errorsByCategory: {
              $push: '$category'
            },
            resolutionTimes: {
              $push: {
                $cond: [
                  '$resolved',
                  { $subtract: ['$resolvedAt', '$firstOccurrence'] },
                  null
                ]
              }
            },
            topErrors: {
              $push: {
                message: '$message',
                count: '$occurrenceCount'
              }
            }
          }
        }
      ]

      const result = await collection.aggregate(pipeline).toArray()
      
      if (result.length === 0) {
        return {
          totalErrors: 0,
          errorsBySeverity: {} as Record<ErrorSeverity, number>,
          errorsByCategory: {} as Record<ErrorCategory, number>,
          resolvedErrors: 0,
          averageResolutionTime: 0,
          topErrors: []
        }
      }

      const data = result[0]
      
      // Process severity breakdown
      const errorsBySeverity = data.errorsBySeverity.reduce((acc: any, severity: ErrorSeverity) => {
        acc[severity] = (acc[severity] || 0) + 1
        return acc
      }, {})

      // Process category breakdown
      const errorsByCategory = data.errorsByCategory.reduce((acc: any, category: ErrorCategory) => {
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

      // Calculate average resolution time
      const validResolutionTimes = data.resolutionTimes.filter((time: number | null) => time !== null)
      const averageResolutionTime = validResolutionTimes.length > 0
        ? validResolutionTimes.reduce((sum: number, time: number) => sum + time, 0) / validResolutionTimes.length
        : 0

      // Get top errors
      const topErrors = data.topErrors
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10)

      return {
        totalErrors: data.totalErrors,
        errorsBySeverity,
        errorsByCategory,
        resolvedErrors: data.resolvedErrors,
        averageResolutionTime: averageResolutionTime / (1000 * 60), // Convert to minutes
        topErrors
      }

    } catch (error) {
      console.error('Failed to get error statistics:', error)
      throw error
    }
  }

  public getRecentErrors(limit: number = 50): SystemError[] {
    return this.errorQueue.slice(-limit)
  }

  public async getUnresolvedErrors(): Promise<SystemError[]> {
    try {
      const db = await dbManager.connect()
      const collection = db.db.collection('system_errors')
      
      return await collection.find({ resolved: false })
        .sort({ lastOccurrence: -1 })
        .limit(100)
        .toArray() as SystemError[]
    } catch (error) {
      console.error('Failed to get unresolved errors:', error)
      return []
    }
  }

  // Health check
  public getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    recentCriticalErrors: number
    recentHighErrors: number
    queueSize: number
    unresolvedErrors: number
  } {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const recentErrors = this.errorQueue.filter(error => 
      error.lastOccurrence >= oneHourAgo
    )
    
    const recentCriticalErrors = recentErrors.filter(error => 
      error.severity === ErrorSeverity.CRITICAL
    ).length
    
    const recentHighErrors = recentErrors.filter(error => 
      error.severity === ErrorSeverity.HIGH
    ).length

    const unresolvedErrors = this.errorQueue.filter(error => !error.resolved).length

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (recentCriticalErrors > 0 || recentHighErrors > 10) {
      status = 'unhealthy'
    } else if (recentHighErrors > 5 || unresolvedErrors > 50) {
      status = 'degraded'
    }

    return {
      status,
      recentCriticalErrors,
      recentHighErrors,
      queueSize: this.errorQueue.length,
      unresolvedErrors
    }
  }
}

// Utility functions for common error scenarios
export class ErrorUtils {
  private static errorHandler = ErrorHandler.getInstance()

  public static async handleDatabaseOperation<T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<{ success: boolean; data?: T; errorId?: string }> {
    try {
      const data = await operation()
      return { success: true, data }
    } catch (error) {
      const errorId = await this.errorHandler.reportDatabaseError(error as Error, context)
      return { success: false, errorId }
    }
  }

  public static async handleAPICall<T>(
    apiCall: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<{ success: boolean; data?: T; errorId?: string }> {
    try {
      const data = await apiCall()
      return { success: true, data }
    } catch (error) {
      const errorId = await this.errorHandler.handleError(
        error as Error,
        ErrorSeverity.MEDIUM,
        ErrorCategory.EXTERNAL_API,
        context
      )
      return { success: false, errorId }
    }
  }

  public static validateInput(
    input: any,
    schema: any,
    context: Partial<ErrorContext> = {}
  ): { valid: boolean; errors?: string[]; errorId?: string } {
    try {
      // This would integrate with a validation library like Joi or Yup
      // For now, basic validation
      if (!input) {
        throw new Error('Input is required')
      }
      
      return { valid: true }
    } catch (error) {
      const errorId = this.errorHandler.reportValidationError(error as Error, context)
      return { valid: false, errors: [error.message], errorId }
    }
  }
}

export const errorHandler = ErrorHandler.getInstance()
