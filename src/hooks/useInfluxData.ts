import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { 
  HAIngestorAPIClient, 
  SensorReading, 
  StateChange, 
  EnergyUsage, 
  DeviceActivity,
  QueryOptions,
  EventsResponse,
  MetricsResponse,
  ExportResponse,
  QueryResponse
} from '@/services/ha-ingestor-api'

// Create a singleton instance of the ha-ingestor API client
let apiClient: HAIngestorAPIClient | null = null

const getAPIClient = (): HAIngestorAPIClient => {
  if (!apiClient) {
    // Use environment variables or default configuration
    apiClient = new HAIngestorAPIClient({
      baseUrl: import.meta.env.VITE_HA_INGESTOR_API_URL || 'http://localhost:8000',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3')
    })
  }
  return apiClient
}

/**
 * AI ASSISTANT CONTEXT: React Query hooks for fetching InfluxDB data.
 * Provides caching, loading states, and error handling for Home Assistant data.
 * 
 * Key features:
 * - Automatic caching with React Query
 * - Loading and error states
 * - Automatic refetching and background updates
 * - Type-safe data fetching
 * - Singleton client management
 */

/**
 * Hook to fetch sensor readings from InfluxDB
 */
export const useSensorReadings = (
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<SensorReading[]>
) => {
  return useQuery({
    queryKey: ['sensorReadings', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getSensorReadings(timeRange, options)
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds
    ...queryOptions,
  })
}

/**
 * Hook to fetch temperature sensor data specifically
 */
export const useTemperatureSensors = (
  timeRange: string,
  queryOptions?: UseQueryOptions<SensorReading[]>
) => {
  return useQuery({
    queryKey: ['temperatureSensors', timeRange],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getTemperatureSensors(timeRange)
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds
    ...queryOptions,
  })
}

/**
 * Hook to fetch entity state changes
 */
export const useStateChanges = (
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<StateChange[]>
) => {
  return useQuery({
    queryKey: ['stateChanges', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getStateChanges(timeRange, options)
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 15, // 15 seconds for more frequent updates
    ...queryOptions,
  })
}

/**
 * Hook to fetch energy usage data
 */
export const useEnergyUsage = (
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<EnergyUsage[]>
) => {
  return useQuery({
    queryKey: ['energyUsage', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getEnergyUsage(timeRange, options)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // 1 minute
    ...queryOptions,
  })
}

/**
 * Hook to fetch device activity summary
 */
export const useDeviceActivity = (
  timeRange: string,
  queryOptions?: UseQueryOptions<DeviceActivity[]>
) => {
  return useQuery({
    queryKey: ['deviceActivity', timeRange],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getDeviceActivity(timeRange)
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60, // 1 minute
    ...queryOptions,
  })
}

/**
 * Hook to fetch recent activity
 */
export const useRecentActivity = (
  limit: number = 100,
  queryOptions?: UseQueryOptions<StateChange[]>
) => {
  return useQuery({
    queryKey: ['recentActivity', limit],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getRecentActivity(limit)
    },
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 30, // 30 seconds - increased for API calls
    ...queryOptions,
  })
}

/**
 * Hook to fetch light states
 */
export const useLightStates = (
  timeRange: string,
  queryOptions?: UseQueryOptions<StateChange[]>
) => {
  return useQuery({
    queryKey: ['lightStates', timeRange],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getLightStates(timeRange)
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // 30 seconds - increased for API calls
    ...queryOptions,
  })
}

/**
 * Hook to fetch automation events
 */
export const useAutomationEvents = (
  timeRange: string,
  queryOptions?: UseQueryOptions<any[]>
) => {
  return useQuery({
    queryKey: ['automationEvents', timeRange],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getAutomationEvents(timeRange)
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // 1 minute - increased for API calls
    ...queryOptions,
  })
}

/**
 * Hook for health check - data freshness
 */
export const useDataFreshness = (
  queryOptions?: UseQueryOptions<any[]>
) => {
  return useQuery({
    queryKey: ['dataFreshness'],
    queryFn: async () => {
      const client = getAPIClient()
      return client.checkDataFreshness()
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
    ...queryOptions,
  })
}

/**
 * Hook for monitoring - data volume
 */
export const useDataVolume = (
  queryOptions?: UseQueryOptions<any[]>
) => {
  return useQuery({
    queryKey: ['dataVolume'],
    queryFn: async () => {
      const client = getAPIClient()
      return client.checkDataVolume()
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // 2 minutes
    ...queryOptions,
  })
}

/**
 * Cleanup function to close the API client connection
 */
export const closeAPIConnection = () => {
  if (apiClient) {
    apiClient.close()
    apiClient = null
  }
}

/**
 * Hook to fetch events with pagination support
 */
export const useEvents = (
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<EventsResponse>
) => {
  return useQuery({
    queryKey: ['events', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getEvents(timeRange, options)
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // 30 seconds
    ...queryOptions,
  })
}

/**
 * Hook to fetch metrics with aggregation support
 */
export const useMetrics = (
  metricType: string,
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<MetricsResponse>
) => {
  return useQuery({
    queryKey: ['metrics', metricType, timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getMetrics(metricType, timeRange, options)
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // 1 minute
    ...queryOptions,
  })
}

/**
 * Hook to export data in various formats
 */
export const useDataExport = (
  format: 'json' | 'csv' | 'xml',
  dataType: 'events' | 'metrics',
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<ExportResponse>
) => {
  return useQuery({
    queryKey: ['dataExport', format, dataType, timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      return client.exportData(format, dataType, timeRange, options)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: false, // Don't auto-refresh exports
    ...queryOptions,
  })
}

/**
 * Hook to execute custom Flux queries
 */
export const useCustomQuery = (
  query: string,
  timeout: number = 30,
  queryOptions?: UseQueryOptions<QueryResponse>
) => {
  return useQuery({
    queryKey: ['customQuery', query, timeout],
    queryFn: async () => {
      const client = getAPIClient()
      return client.executeCustomQuery(query, timeout)
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: false, // Don't auto-refresh custom queries
    enabled: !!query, // Only run when query is provided
    ...queryOptions,
  })
}

/**
 * Hook to check API connection health
 */
export const useAPIConnection = (
  queryOptions?: UseQueryOptions<{ connected: boolean; latency?: number; error?: string }>
) => {
  return useQuery({
    queryKey: ['apiConnection'],
    queryFn: async () => {
      const client = getAPIClient()
      return client.checkConnection()
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
    ...queryOptions,
  })
}

/**
 * Hook to get API information
 */
export const useAPIInfo = (
  queryOptions?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: ['apiInfo'],
    queryFn: async () => {
      const client = getAPIClient()
      return client.getAPIInfo()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: false, // Don't auto-refresh API info
    ...queryOptions,
  })
}