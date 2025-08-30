/**
 * Configuration for ha-ingestor API integration
 */

export interface APIConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  enableLogging: boolean
  enableMetrics: boolean
}

export const getAPIConfig = (): APIConfig => {
  return {
    baseUrl: import.meta.env.VITE_HA_INGESTOR_API_URL || 'http://localhost:8000',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
    enableLogging: import.meta.env.VITE_API_ENABLE_LOGGING === 'true',
    enableMetrics: import.meta.env.VITE_API_ENABLE_METRICS === 'true'
  }
}

export const API_ENDPOINTS = {
  ROOT: '/',
  HEALTH: '/health',
  READY: '/ready',
  METRICS: '/metrics',
  EVENTS: '/api/events',
  METRICS_DATA: '/api/metrics',
  EXPORT: '/api/export',
  QUERY: '/api/query'
} as const

export const TIME_RANGES = {
  ONE_HOUR: '1h',
  SIX_HOURS: '6h',
  ONE_DAY: '24h',
  ONE_WEEK: '7d',
  ONE_MONTH: '30d',
  THREE_MONTHS: '90d',
  ONE_YEAR: '1y'
} as const

export const AGGREGATION_TYPES = {
  NONE: 'none',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  XML: 'xml'
} as const

export const DATA_TYPES = {
  EVENTS: 'events',
  METRICS: 'metrics',
  METADATA: 'metadata',
  DEVICES: 'devices',
  INTEGRATIONS: 'integrations'
} as const

export const DEFAULT_QUERY_OPTIONS = {
  limit: 100,
  offset: 0,
  sort_by: '_time',
  sort_order: 'desc' as const,
  aggregate: 'none' as const
}

export const API_ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to ha-ingestor API',
  TIMEOUT: 'API request timed out',
  INVALID_RESPONSE: 'Invalid response from API',
  RATE_LIMITED: 'API rate limit exceeded',
  UNAUTHORIZED: 'Unauthorized access to API',
  NOT_FOUND: 'API endpoint not found',
  INTERNAL_ERROR: 'Internal API error'
} as const
