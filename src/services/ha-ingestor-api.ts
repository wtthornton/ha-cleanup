import { ErrorHandler, RetryHandler } from './error-handler'

export interface HAIngestorConfig {
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
}

export interface TimeRange {
  value: string
  label: string
}

export interface QueryOptions {
  device_class?: string
  domain?: string
  location?: string
  entity_id?: string
  aggregate?: 'none' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface SensorReading {
  _time: string
  _value: number
  entity_id: string
  domain: string
  device_class: string
  unit_of_measurement: string
  location?: string
  friendly_name?: string
}

export interface StateChange {
  _time: string
  _value: string
  entity_id: string
  domain: string
  friendly_name?: string
  last_changed: string
  last_updated: string
}

// API response format for events
export interface APIEvent {
  id: string
  timestamp: string
  domain: string
  entity_id: string
  event_type: string
  state: string
  attributes: Record<string, any>
  source: string
  correlation_id?: string
}

export interface EnergyUsage {
  _time: string
  _value: number
  entity_id: string
  unit_of_measurement: string
}

export interface DeviceActivity {
  entity_id: string
  domain: string
  _value: number
}

export interface APIResponse<T> {
  data: T[]
  total_count: number
  page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
  time_range?: string
  filters_applied?: Record<string, any>
}

// Specific response types
export interface EventsResponse extends APIResponse<APIEvent> {}

export interface MetricsResponse {
  data: any[]
  metric_type: string
  time_range: string
  aggregation: string
  total_points: number
}

export interface ExportResponse {
  status: string
  format: string
  data_type: string
  time_range: string
  record_count: number
  file_size?: number
}

export interface QueryResponse {
  status: string
  query: string
  execution_time_ms: number
  result_count: number
  data: any[]
}

/**
 * AI ASSISTANT CONTEXT: ha-ingestor API client for ha-cleanup application.
 * Provides access to Home Assistant data through the centralized ha-ingestor API.
 * 
 * Key features:
 * - RESTful API access to ha-ingestor endpoints
 * - Type-safe query methods for different data types
 * - Support for time ranges and filtering options
 * - Error handling and connection management
 * - Follows the API-first architecture pattern
 */
export class HAIngestorAPIClient {
  private config: Required<HAIngestorConfig>
  private isConnected: boolean = false
  private lastConnectionCheck: Date | null = null

  constructor(config: HAIngestorConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:8000',
      timeout: config.timeout || 30000, // 30 seconds
      retryAttempts: config.retryAttempts || 3
    }
  }

  /**
   * Execute API request with error handling and retry logic
   */
  private async executeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    context: string
  ): Promise<T> {
    try {
      return await RetryHandler.withRetry(
        async () => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

          try {
            const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
              ...options,
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json',
                ...options.headers,
              },
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            this.isConnected = true
            this.lastConnectionCheck = new Date()

            return await response.json()
          } catch (error) {
            clearTimeout(timeoutId)
            throw error
          }
        },
        {
          maxAttempts: this.config.retryAttempts,
          shouldRetry: (error) => {
            const appError = ErrorHandler.handle(error, `HAIngestorAPIClient.${context}`)
            return appError.retryable || false
          }
        }
      )
    } catch (error) {
      this.isConnected = false
      ErrorHandler.handle(error as Error, `HAIngestorAPIClient.${context}`, { endpoint })
      throw error
    }
  }

  /**
   * Check connection health
   */
  async checkConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      await this.executeRequest('/health', {}, 'checkConnection')
      
      const latency = Date.now() - startTime
      this.isConnected = true
      this.lastConnectionCheck = new Date()
      
      return { connected: true, latency }
    } catch (error) {
      this.isConnected = false
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { connected: false, error: errorMessage }
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; lastCheck: Date | null } {
    return {
      connected: this.isConnected,
      lastCheck: this.lastConnectionCheck
    }
  }

  /**
   * Get events from the API
   */
  async getEvents(timeRange: string, options: QueryOptions = {}): Promise<EventsResponse> {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: (options.limit || 100).toString(),
      offset: (options.offset || 0).toString(),
      sort_by: options.sort_by || '_time',
      sort_order: options.sort_order || 'desc'
    })

    if (options.domain) {
      params.append('domain', options.domain)
    }

    if (options.entity_id) {
      params.append('entity_id', options.entity_id)
    }

    return this.executeRequest<EventsResponse>(
      `/api/events?${params.toString()}`,
      {},
      'getEvents'
    )
  }

  /**
   * Get metrics from the API
   */
  async getMetrics(
    metricType: string, 
    timeRange: string, 
    options: QueryOptions = {}
  ): Promise<MetricsResponse> {
    const params = new URLSearchParams({
      metric_type: metricType,
      time_range: timeRange,
      aggregation: options.aggregate || 'none'
    })

    if (options.domain) {
      params.append('domain', options.domain)
    }

    if (options.entity_id) {
      params.append('entity_id', options.entity_id)
    }

    return this.executeRequest<MetricsResponse>(
      `/api/metrics?${params.toString()}`,
      {},
      'getMetrics'
    )
  }

  /**
   * Get sensor readings with optional filtering
   */
  async getSensorReadings(timeRange: string, options: QueryOptions = {}): Promise<SensorReading[]> {
    const response = await this.getMetrics('general', timeRange, options)
    
    // Transform the metrics response to match the expected SensorReading format
    return response.data.map(item => ({
      _time: item.timestamp || item._time,
      _value: item.value || item._value,
      entity_id: item.entity_id,
      domain: item.domain,
      device_class: item.device_class,
      unit_of_measurement: item.unit,
      location: item.location,
      friendly_name: item.friendly_name
    }))
  }

  /**
   * Get temperature sensor readings
   */
  async getTemperatureSensors(timeRange: string): Promise<SensorReading[]> {
    const response = await this.getMetrics('general', timeRange, {
      device_class: 'temperature'
    })
    
    return response.data.map(item => ({
      _time: item.timestamp || item._time,
      _value: item.value || item._value,
      entity_id: item.entity_id,
      domain: item.domain,
      device_class: item.device_class,
      unit_of_measurement: item.unit,
      location: item.location,
      friendly_name: item.friendly_name
    }))
  }

  /**
   * Get entity state changes
   */
  async getStateChanges(timeRange: string, options: QueryOptions = {}): Promise<StateChange[]> {
    const response = await this.getEvents(timeRange, options)
    
    // Transform the events response to match the expected StateChange format
    return response.data.map(item => ({
      _time: item.timestamp,
      _value: item.state,
      entity_id: item.entity_id,
      domain: item.domain,
      friendly_name: item.attributes?.friendly_name,
      last_changed: item.timestamp,
      last_updated: item.timestamp
    }))
  }

  /**
   * Get energy usage data
   */
  async getEnergyUsage(timeRange: string, options: QueryOptions = {}): Promise<EnergyUsage[]> {
    const response = await this.getMetrics('energy_usage', timeRange, options)
    
    return response.data.map(item => ({
      _time: item.timestamp || item._time,
      _value: item.value || item._value,
      entity_id: item.entity_id,
      unit_of_measurement: item.unit
    }))
  }

  /**
   * Get device activity summary
   */
  async getDeviceActivity(timeRange: string): Promise<DeviceActivity[]> {
    const response = await this.getMetrics('device_activity', timeRange)
    
    return response.data.map(item => ({
      entity_id: item.entity_id,
      domain: item.domain,
      _value: item.value || item._value
    }))
  }

  /**
   * Get recent activity with limit
   */
  async getRecentActivity(limit: number = 100): Promise<StateChange[]> {
    const response = await this.getEvents('1h', { limit })
    
    return response.data.map(item => ({
      _time: item.timestamp,
      _value: item.state,
      entity_id: item.entity_id,
      domain: item.domain,
      friendly_name: item.attributes?.friendly_name,
      last_changed: item.timestamp,
      last_updated: item.timestamp
    }))
  }

  /**
   * Export data in various formats
   */
  async exportData(
    format: 'json' | 'csv' | 'xml',
    dataType: 'events' | 'metrics',
    timeRange: string,
    options: QueryOptions = {}
  ): Promise<ExportResponse> {
    const exportRequest = {
      format,
      time_range: timeRange,
      data_type: dataType,
      domain: options.domain,
      entity_id: options.entity_id,
      include_metadata: true
    }

    return this.executeRequest<ExportResponse>(
      '/api/export',
      {
        method: 'POST',
        body: JSON.stringify(exportRequest)
      },
      'exportData'
    )
  }

  /**
   * Execute custom Flux query
   */
  async executeCustomQuery(query: string, timeout: number = 30): Promise<QueryResponse> {
    const queryRequest = {
      query,
      timeout
    }

    return this.executeRequest<QueryResponse>(
      '/api/query',
      {
        method: 'POST',
        body: JSON.stringify(queryRequest)
      },
      'executeCustomQuery'
    )
  }

  /**
   * Check data freshness - health check query
   */
  async checkDataFreshness(): Promise<any[]> {
    const query = `from(bucket: "ha_events") |> range(start: -5m) |> filter(fn: (r) => r._measurement == "ha_sensor_reading") |> count()`
    const response = await this.executeCustomQuery(query, 10)
    return response.data
  }

  /**
   * Check data volume - monitoring query
   */
  async checkDataVolume(): Promise<any[]> {
    const query = `from(bucket: "ha_events") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "ha_sensor_reading") |> aggregateWindow(every: 5m, fn: count, createEmpty: false)`
    const response = await this.executeCustomQuery(query, 10)
    return response.data
  }

  /**
   * Get light states
   */
  async getLightStates(timeRange: string): Promise<StateChange[]> {
    const response = await this.getEvents(timeRange, { domain: 'light' })
    
    return response.data.map(item => ({
      _time: item.timestamp,
      _value: item.state,
      entity_id: item.entity_id,
      domain: item.domain,
      friendly_name: item.attributes?.friendly_name,
      last_changed: item.timestamp,
      last_updated: item.timestamp
    }))
  }

  /**
   * Get automation execution events
   */
  async getAutomationEvents(timeRange: string): Promise<any[]> {
    const query = `from(bucket: "ha_events") |> range(start: -${timeRange}) |> filter(fn: (r) => r._measurement == "ha_automation_triggered") |> filter(fn: (r) => r._field == "count") |> sort(columns: ["_time"], desc: true)`
    const response = await this.executeCustomQuery(query, 30)
    return response.data
  }

  /**
   * Get API information
   */
  async getAPIInfo(): Promise<any> {
    return this.executeRequest<any>('/', {}, 'getAPIInfo')
  }

  /**
   * Close the API client
   */
  close(): void {
    // No explicit close needed for HTTP API client
    this.isConnected = false
  }
}
