/**
 * AI ASSISTANT CONTEXT: Type definitions for InfluxDB data structures
 * based on the ha-ingestor schema. These types ensure type safety when
 * working with Home Assistant historical data.
 */

// Base InfluxDB record structure
export interface BaseInfluxRecord {
  _time: string
  _measurement: string
  _field: string
  _value: any
}

// Common tags available on all measurements
export interface CommonTags {
  entity_id: string
  domain: string
  source: 'mqtt' | 'websocket'
  location?: string
  device_class?: string
  friendly_name?: string
  manufacturer?: string
  model?: string
}

// Sensor reading from ha_sensor_reading measurement
export interface SensorReading extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_sensor_reading'
  _value: number
  unit_of_measurement: string
  device_class: 'temperature' | 'humidity' | 'pressure' | 'battery' | 'illuminance' | 'power' | string
  state: string
  last_updated: string
  last_changed: string
}

// State change from ha_state measurement  
export interface StateChange extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_state'
  _value: string
  state: string
  last_updated: string
  last_changed: string
  attributes?: Record<string, any>
}

// Energy usage from ha_energy_usage measurement
export interface EnergyUsage extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_energy_usage'
  _value: number
  unit_of_measurement: 'W' | 'kW' | 'Wh' | 'kWh'
  state: string
}

// Binary sensor from ha_binary_sensor measurement
export interface BinarySensor extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_binary_sensor' 
  _value: 'on' | 'off'
  device_class?: 'motion' | 'door' | 'window' | 'occupancy' | 'connectivity' | string
  state: 'on' | 'off'
}

// Switch state from ha_switch measurement
export interface SwitchState extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_switch'
  _value: 'on' | 'off'
  state: 'on' | 'off'
}

// Light state from ha_light measurement  
export interface LightState extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_light'
  _value: 'on' | 'off'
  state: 'on' | 'off'
  brightness?: number
  color_temp?: number
  rgb_color?: [number, number, number]
}

// Climate data from ha_climate measurement
export interface ClimateData extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_climate'
  _value: number | string
  current_temperature?: number
  target_temperature?: number
  hvac_mode?: 'heat' | 'cool' | 'auto' | 'off'
  hvac_action?: 'heating' | 'cooling' | 'idle'
}

// Automation triggered from ha_automation_triggered measurement
export interface AutomationTriggered extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_automation_triggered'
  _value: number
  automation_id: string
  trigger_source: string
}

// Service call from ha_call_service measurement
export interface ServiceCall extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_call_service'
  _value: number
  service: string
  service_data?: Record<string, any>
}

// Consolidated entity data from ha_entities measurement
export interface EntityData extends BaseInfluxRecord, CommonTags {
  _measurement: 'ha_entities'
  _value: any
  state: string
  attributes: Record<string, any>
}

// System metrics
export interface SystemMetrics extends BaseInfluxRecord {
  _measurement: 'system_metrics'
  _value: number
  metric_type: 'cpu' | 'memory' | 'disk' | 'network'
  host: string
}

// Performance metrics
export interface PerformanceMetrics extends BaseInfluxRecord {
  _measurement: 'performance_metrics'
  _value: number
  operation: string
  duration_ms: number
}

// Connection logs
export interface ConnectionLog extends BaseInfluxRecord {
  _measurement: 'connection_logs'
  _value: string
  status: 'connected' | 'disconnected' | 'error'
  source: 'mqtt' | 'websocket' | 'influxdb'
}

// Error logs
export interface ErrorLog extends BaseInfluxRecord {
  _measurement: 'error_logs'
  _value: string
  error_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  component: string
}

// Union type for all measurement types
export type InfluxRecord = 
  | SensorReading
  | StateChange
  | EnergyUsage
  | BinarySensor
  | SwitchState
  | LightState
  | ClimateData
  | AutomationTriggered
  | ServiceCall
  | EntityData
  | SystemMetrics
  | PerformanceMetrics
  | ConnectionLog
  | ErrorLog

// Query filter options
export interface QueryOptions {
  device_class?: string
  domain?: string
  location?: string
  entity_id?: string
  manufacturer?: string
  model?: string
  aggregate?: 'hourly' | 'daily' | 'weekly'
  limit?: number
}

// Query result wrapper
export interface QueryResult<T = InfluxRecord> {
  data: T[]
  total?: number
  hasMore?: boolean
}

// Time range options
export type TimeRange = 
  | '5m' | '15m' | '30m' 
  | '1h' | '6h' | '12h' 
  | '1d' | '3d' | '7d' 
  | '30d' | '90d'

// Aggregation functions
export type AggregateFunction = 
  | 'mean' | 'sum' | 'count' | 'min' | 'max' 
  | 'first' | 'last' | 'stddev'

// Device activity summary
export interface DeviceActivity {
  entity_id: string
  domain: string
  friendly_name?: string
  state_changes: number
  last_seen: string
  device_class?: string
}

// Analytics data for dashboard
export interface AnalyticsData {
  totalEvents: number
  activeDevices: number
  energyUsage: number
  errorCount: number
  systemHealth: 'good' | 'warning' | 'error'
}

// Real-time data subscription
export interface RealtimeData {
  timestamp: string
  entity_id: string
  domain: string
  old_state?: string
  new_state: string
  attributes?: Record<string, any>
}

// Export configuration for settings
export interface InfluxDBConfig {
  url: string
  token: string
  org: string
  bucket: string
  timeout?: number
  retryAttempts?: number
}

// Connection status
export interface ConnectionStatus {
  connected: boolean
  lastCheck: string
  latency?: number
  error?: string
}

// Data freshness check result
export interface DataFreshnessResult {
  measurement: string
  lastDataPoint: string
  recordCount: number
  isStale: boolean
}

// Pagination for large datasets
export interface PaginationOptions {
  page: number
  limit: number
  offset?: number
}

// Sort options
export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Complete query configuration
export interface QueryConfig extends QueryOptions {
  timeRange: TimeRange
  pagination?: PaginationOptions
  sort?: SortOptions
  includeMetadata?: boolean
}