import { InfluxDB } from '@influxdata/influxdb-client'
import { ErrorHandler, RetryHandler } from './error-handler'

export interface InfluxDBConfig {
  url?: string
  token?: string
  org?: string
  bucket?: string
  timeout?: number
  retryAttempts?: number
}

export interface QueryOptions {
  device_class?: string
  domain?: string
  location?: string
  entity_id?: string
  aggregate?: 'hourly' | 'daily' | 'weekly'
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

/**
 * AI ASSISTANT CONTEXT: InfluxDB client for ha-cleanup application.
 * Provides read-only access to Home Assistant historical data from ha-ingestor.
 * 
 * Key features:
 * - Read-only access to InfluxDB using connection details from guide
 * - Type-safe query methods for different data types
 * - Support for time ranges and filtering options
 * - Error handling and connection management
 * - Follows the schema and patterns from INFLUXDB_READONLY_ACCESS_GUIDE.md
 */
export class InfluxDBClient {
  private influxDB!: InfluxDB
  private queryApi: any
  private config: Required<InfluxDBConfig>
  private isConnected: boolean = false
  private lastConnectionCheck: Date | null = null

  constructor(config: InfluxDBConfig = {}) {
    // Default configuration from the InfluxDB guide
    this.config = {
      url: config.url || 'http://localhost:8086',
      token: config.token || 'your_readonly_token',
      org: config.org || 'myorg',
      bucket: config.bucket || 'ha_events',
      timeout: config.timeout || 30000, // 30 seconds
      retryAttempts: config.retryAttempts || 3
    }

    this.initializeClient()
  }

  private initializeClient(): void {
    try {
      this.influxDB = new InfluxDB({
        url: this.config.url,
        token: this.config.token,
        timeout: this.config.timeout
      })

      this.queryApi = this.influxDB.getQueryApi(this.config.org)
    } catch (error) {
      ErrorHandler.handle(error as Error, 'InfluxDBClient.initialize')
      throw error
    }
  }

  /**
   * Execute query with error handling and retry logic
   */
  private async executeQuery(query: string, context: string): Promise<any[]> {
    try {
      return await RetryHandler.withRetry(
        async () => {
          const result = await this.queryApi.queryRaw(query)
          this.isConnected = true
          this.lastConnectionCheck = new Date()
          return result
        },
        {
          maxAttempts: this.config.retryAttempts,
          shouldRetry: (error) => {
            const appError = ErrorHandler.handle(error, `InfluxDBClient.${context}`)
            return appError.retryable || false
          }
        }
      )
    } catch (error) {
      this.isConnected = false
      ErrorHandler.handle(error as Error, `InfluxDBClient.${context}`, { query })
      throw error
    }
  }

  /**
   * Check connection health
   */
  async checkConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      await this.executeQuery(`
        from(bucket: "${this.config.bucket}")
          |> range(start: -1m)
          |> limit(n: 1)
      `, 'checkConnection')
      
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
   * Get temperature sensor readings
   */
  async getTemperatureSensors(timeRange: string): Promise<SensorReading[]> {
    const query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "ha_sensor_reading")
        |> filter(fn: (r) => r.device_class == "temperature")
        |> filter(fn: (r) => r._field == "value")
    `
    return this.executeQuery(query, 'getTemperatureSensors')
  }

  /**
   * Get sensor readings with optional filtering
   */
  async getSensorReadings(timeRange: string, options: QueryOptions = {}): Promise<SensorReading[]> {
    let query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "ha_sensor_reading")
        |> filter(fn: (r) => r._field == "value")
    `

    if (options.device_class) {
      query += `|> filter(fn: (r) => r.device_class == "${options.device_class}")\n`
    }

    if (options.location) {
      query += `|> filter(fn: (r) => r.location == "${options.location}")\n`
    }

    if (options.entity_id) {
      query += `|> filter(fn: (r) => r.entity_id == "${options.entity_id}")\n`
    }

    if (options.aggregate) {
      const window = options.aggregate === 'hourly' ? '1h' : 
                    options.aggregate === 'daily' ? '1d' : '1w'
      query += `|> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)\n`
    }

    return this.executeQuery(query, 'getSensorReadings')
  }

  /**
   * Get entity state changes
   */
  async getStateChanges(timeRange: string, options: QueryOptions = {}): Promise<StateChange[]> {
    let query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "ha_state")
        |> filter(fn: (r) => r._field == "state")
    `

    if (options.domain) {
      query += `|> filter(fn: (r) => r.domain == "${options.domain}")\n`
    }

    if (options.entity_id) {
      query += `|> filter(fn: (r) => r.entity_id == "${options.entity_id}")\n`
    }

    query += `|> sort(columns: ["_time"], desc: true)\n`

    return this.executeQuery(query, 'getStateChanges')
  }

  /**
   * Get energy usage data
   */
  async getEnergyUsage(timeRange: string, options: QueryOptions = {}): Promise<EnergyUsage[]> {
    let query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "ha_energy_usage")
        |> filter(fn: (r) => r._field == "value")
    `

    if (options.aggregate) {
      const window = options.aggregate === 'hourly' ? '1h' : 
                    options.aggregate === 'daily' ? '1d' : '1w'
      query += `|> aggregateWindow(every: ${window}, fn: sum, createEmpty: false)\n`
    }

    return this.executeQuery(query, 'executeQuery')
  }

  /**
   * Get device activity summary
   */
  async getDeviceActivity(timeRange: string): Promise<DeviceActivity[]> {
    const query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "ha_state")
        |> filter(fn: (r) => r._field == "state")
        |> group(columns: ["entity_id", "domain"])
        |> count()
        |> sort(columns: ["_value"], desc: true)
    `
    return this.executeQuery(query, 'executeQuery')
  }

  /**
   * Get recent activity with limit
   */
  async getRecentActivity(limit: number = 100): Promise<StateChange[]> {
    const query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "ha_state")
        |> filter(fn: (r) => r._field == "state")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: ${limit})
    `
    return this.executeQuery(query, 'executeQuery')
  }

  /**
   * Check data freshness - health check query
   */
  async checkDataFreshness(): Promise<any[]> {
    const query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -5m)
        |> filter(fn: (r) => r._measurement == "ha_sensor_reading")
        |> count()
    `
    return this.executeQuery(query, 'executeQuery')
  }

  /**
   * Check data volume - monitoring query
   */
  async checkDataVolume(): Promise<any[]> {
    const query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "ha_sensor_reading")
        |> aggregateWindow(every: 5m, fn: count, createEmpty: false)
    `
    return this.executeQuery(query, 'executeQuery')
  }

  /**
   * Get light states
   */
  async getLightStates(timeRange: string): Promise<StateChange[]> {
    const query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "ha_light")
        |> filter(fn: (r) => r._field == "state")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `
    return this.executeQuery(query, 'executeQuery')
  }

  /**
   * Get automation execution events
   */
  async getAutomationEvents(timeRange: string): Promise<any[]> {
    const query = `
      from(bucket: "${this.config.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "ha_automation_triggered")
        |> filter(fn: (r) => r._field == "count")
        |> sort(columns: ["_time"], desc: true)
    `
    return this.executeQuery(query, 'executeQuery')
  }

  /**
   * Close the InfluxDB connection
   * Note: InfluxDB client manages connections automatically
   */
  close(): void {
    // InfluxDB client manages connections automatically
    // No explicit close needed for read-only operations
  }
}