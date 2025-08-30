/**
 * AI ASSISTANT CONTEXT: Error handling and logging service for ha-cleanup.
 * Provides centralized error handling with user-friendly messages and logging.
 * 
 * Key features:
 * - Centralized error handling and logging
 * - User-friendly error messages
 * - Error categorization and severity levels
 * - Retry logic for transient errors
 * - Connection error handling
 */

export enum ErrorCategory {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  QUERY = 'query',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError {
  id: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  userMessage: string
  originalError?: Error
  timestamp: Date
  component?: string
  metadata?: Record<string, any>
  retryable?: boolean
}

export class ErrorHandler {
  private static errors: AppError[] = []
  private static listeners: Array<(error: AppError) => void> = []

  /**
   * Handle and categorize errors
   */
  static handle(error: Error | string, component?: string, metadata?: Record<string, any>): AppError {
    const appError = this.categorizeError(error, component, metadata)
    this.logError(appError)
    this.notifyListeners(appError)
    return appError
  }

  /**
   * Categorize and create AppError from Error or string
   */
  private static categorizeError(
    error: Error | string, 
    component?: string, 
    metadata?: Record<string, any>
  ): AppError {
    const errorMessage = typeof error === 'string' ? error : error.message
    const originalError = typeof error === 'string' ? undefined : error

    let category = ErrorCategory.UNKNOWN
    let severity = ErrorSeverity.MEDIUM
    let userMessage = 'An unexpected error occurred'
    let retryable = false

    // InfluxDB connection errors
    if (errorMessage.includes('Connection refused') || errorMessage.includes('ECONNREFUSED')) {
      category = ErrorCategory.CONNECTION
      severity = ErrorSeverity.HIGH
      userMessage = 'Unable to connect to InfluxDB. Please check your connection settings.'
      retryable = true
    }
    // Authentication errors
    else if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid token')) {
      category = ErrorCategory.AUTHENTICATION
      severity = ErrorSeverity.HIGH
      userMessage = 'Authentication failed. Please check your InfluxDB token.'
      retryable = false
    }
    // Query syntax errors
    else if (errorMessage.includes('Invalid Flux query') || errorMessage.includes('syntax error')) {
      category = ErrorCategory.QUERY
      severity = ErrorSeverity.MEDIUM
      userMessage = 'There was an error with the data query. Please try again.'
      retryable = true
    }
    // Timeout errors
    else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      category = ErrorCategory.TIMEOUT
      severity = ErrorSeverity.MEDIUM
      userMessage = 'The request timed out. Please try again.'
      retryable = true
    }
    // Network errors
    else if (errorMessage.includes('Network Error') || errorMessage.includes('fetch failed')) {
      category = ErrorCategory.NETWORK
      severity = ErrorSeverity.MEDIUM
      userMessage = 'Network error occurred. Please check your internet connection.'
      retryable = true
    }
    // Validation errors
    else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      category = ErrorCategory.VALIDATION
      severity = ErrorSeverity.LOW
      userMessage = 'Invalid input provided. Please check your settings.'
      retryable = false
    }

    return {
      id: this.generateErrorId(),
      category,
      severity,
      message: errorMessage,
      userMessage,
      originalError,
      timestamp: new Date(),
      component,
      metadata,
      retryable
    }
  }

  /**
   * Log error to console and storage
   */
  private static logError(error: AppError): void {
    const logLevel = error.severity === ErrorSeverity.CRITICAL ? 'error' :
                    error.severity === ErrorSeverity.HIGH ? 'error' :
                    error.severity === ErrorSeverity.MEDIUM ? 'warn' : 'info'

    console[logLevel](`[${error.category.toUpperCase()}] ${error.message}`, {
      id: error.id,
      component: error.component,
      timestamp: error.timestamp,
      metadata: error.metadata,
      originalError: error.originalError
    })

    // Store error for later retrieval
    this.errors.push(error)
    
    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors.shift()
    }
  }

  /**
   * Add error listener for UI notifications
   */
  static addErrorListener(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Notify all listeners about new error
   */
  private static notifyListeners(error: AppError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error)
      } catch (err) {
        console.error('Error in error listener:', err)
      }
    })
  }

  /**
   * Get all stored errors
   */
  static getErrors(category?: ErrorCategory, component?: string): AppError[] {
    let filteredErrors = [...this.errors]
    
    if (category) {
      filteredErrors = filteredErrors.filter(error => error.category === category)
    }
    
    if (component) {
      filteredErrors = filteredErrors.filter(error => error.component === component)
    }
    
    return filteredErrors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Clear all errors
   */
  static clearErrors(): void {
    this.errors = []
  }

  /**
   * Clear errors by category or component
   */
  static clearErrorsBy(category?: ErrorCategory, component?: string): void {
    this.errors = this.errors.filter(error => {
      if (category && error.category === category) return false
      if (component && error.component === component) return false
      return true
    })
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): Record<ErrorCategory, number> {
    const stats: Record<ErrorCategory, number> = {
      [ErrorCategory.CONNECTION]: 0,
      [ErrorCategory.AUTHENTICATION]: 0,
      [ErrorCategory.QUERY]: 0,
      [ErrorCategory.TIMEOUT]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.UNKNOWN]: 0
    }

    this.errors.forEach(error => {
      stats[error.category]++
    })

    return stats
  }

  /**
   * Generate unique error ID
   */
  private static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Retry utility for handling transient errors
 */
export class RetryHandler {
  /**
   * Retry an async function with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number
      baseDelay?: number
      maxDelay?: number
      backoffFactor?: number
      shouldRetry?: (error: Error) => boolean
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      shouldRetry = (error) => {
        const appError = ErrorHandler.handle(error, 'retry-handler')
        return appError.retryable || false
      }
    } = options

    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          throw lastError
        }

        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        )

        console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms delay`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}