import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { HAIngestorAPIClient, QueryOptions } from '@/services/ha-ingestor-api'

// Create a singleton instance of the ha-ingestor API client
let apiClient: HAIngestorAPIClient | null = null

const getAPIClient = (): HAIngestorAPIClient => {
  if (!apiClient) {
    apiClient = new HAIngestorAPIClient({
      baseUrl: import.meta.env.VITE_HA_INGESTOR_API_URL || 'http://localhost:8000',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3')
    })
  }
  return apiClient
}

/**
 * AI ASSISTANT CONTEXT: Pattern recognition hooks for analyzing Home Assistant data.
 * Provides insights into recurring events, automation behaviors, and system patterns.
 * 
 * Key features:
 * - Event frequency analysis
 * - Time-based pattern detection
 * - Automation success rate tracking
 * - Device usage patterns
 * - Anomaly detection support
 */

export interface EventPattern {
  entity_id: string
  domain: string
  pattern_type: 'constant' | 'periodic' | 'daily' | 'weekly' | 'monthly' | 'irregular'
  frequency: number
  time_distribution: {
    hour: number
    count: number
  }[]
  day_distribution: {
    day: string
    count: number
  }[]
  confidence: number
  last_occurrence: string
  first_occurrence: string
}

export interface AutomationPattern {
  automation_id: string
  name: string
  trigger_count: number
  success_rate: number
  average_execution_time: number
  failure_reasons: string[]
  time_patterns: {
    hour: number
    success_rate: number
    count: number
  }[]
  day_patterns: {
    day: string
    success_rate: number
    count: number
  }[]
}

export interface DevicePattern {
  entity_id: string
  domain: string
  friendly_name?: string
  usage_pattern: 'constant' | 'periodic' | 'sporadic' | 'unused'
  active_hours: {
    start: number
    end: number
  }
  peak_usage_times: number[]
  idle_periods: {
    start: string
    end: string
    duration_hours: number
  }[]
  efficiency_score: number
}

export interface PatternAnalysisOptions extends QueryOptions {
  min_confidence?: number
  min_frequency?: number
  include_automations?: boolean
  include_devices?: boolean
  group_by_domain?: boolean
}

/**
 * Hook to analyze event patterns and identify recurring behaviors
 */
export const useEventPatterns = (
  timeRange: string,
  options: PatternAnalysisOptions = {},
  queryOptions?: UseQueryOptions<EventPattern[]>
) => {
  return useQuery({
    queryKey: ['eventPatterns', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Build a custom query to analyze event patterns
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
          |> yield(name: "hourly_patterns")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      // Transform the response into EventPattern objects
      // This is a simplified transformation - in practice, you'd want more sophisticated analysis
      const patterns: EventPattern[] = []
      
      if (response.data && response.data.length > 0) {
        // Group by entity and analyze patterns
        const entityGroups = new Map<string, any[]>()
        
        response.data.forEach((point: any) => {
          const key = `${point.entity_id}_${point.domain}`
          if (!entityGroups.has(key)) {
            entityGroups.set(key, [])
          }
          entityGroups.get(key)!.push(point)
        })
        
        entityGroups.forEach((points, key) => {
          const [entity_id, domain] = key.split('_')
          
          // Calculate basic pattern metrics
          const totalEvents = points.reduce((sum, p) => sum + (p._value || 0), 0)
          const avgPerHour = totalEvents / (points.length || 1)
          
          // Determine pattern type based on variance
          const variance = points.reduce((sum, p) => {
            const diff = (p._value || 0) - avgPerHour
            return sum + (diff * diff)
          }, 0) / (points.length || 1)
          
          let pattern_type: EventPattern['pattern_type'] = 'irregular'
          if (variance < avgPerHour * 0.1) pattern_type = 'constant'
          else if (variance < avgPerHour * 0.5) pattern_type = 'periodic'
          
          patterns.push({
            entity_id,
            domain,
            pattern_type,
            frequency: avgPerHour,
            time_distribution: points.map((p: any) => ({
              hour: new Date(p._time).getHours(),
              count: p._value || 0
            })),
            day_distribution: points.map((p: any) => ({
              day: new Date(p._time).toLocaleDateString('en-US', { weekday: 'long' }),
              count: p._value || 0
            })),
            confidence: Math.max(0.1, 1 - (variance / avgPerHour)),
            last_occurrence: points[points.length - 1]?._time || new Date().toISOString(),
            first_occurrence: points[0]?._time || new Date().toISOString()
          })
        })
      }
      
      // Filter by confidence and frequency if specified
      return patterns.filter(pattern => {
        if (options.min_confidence && pattern.confidence < options.min_confidence) return false
        if (options.min_frequency && pattern.frequency < options.min_frequency) return false
        return true
      })
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to analyze automation patterns and success rates
 */
export const useAutomationPatterns = (
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<AutomationPattern[]>
) => {
  return useQuery({
    queryKey: ['automationPatterns', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for automation events
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_automation_triggered")
          |> group(columns: ["automation_id"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "automation_patterns")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      // Transform into AutomationPattern objects
      const patterns: AutomationPattern[] = []
      
      if (response.data && response.data.length > 0) {
        // Group by automation and analyze patterns
        const automationGroups = new Map<string, any[]>()
        
        response.data.forEach((point: any) => {
          const automation_id = point.automation_id || 'unknown'
          if (!automationGroups.has(automation_id)) {
            automationGroups.set(automation_id, [])
          }
          automationGroups.get(automation_id)!.push(point)
        })
        
        automationGroups.forEach((points, automation_id) => {
          const totalTriggers = points.reduce((sum, p) => sum + (p._value || 0), 0)
          
          // Calculate time-based patterns
          const hourPatterns = new Map<number, { success: number; total: number }>()
          
          points.forEach((point: any) => {
            const hour = new Date(point._time).getHours()
            if (!hourPatterns.has(hour)) {
              hourPatterns.set(hour, { success: 0, total: 0 })
            }
            const pattern = hourPatterns.get(hour)!
            pattern.total += point._value || 0
            // Assume 95% success rate for now - in practice, you'd query actual success/failure data
            pattern.success += Math.floor((point._value || 0) * 0.95)
          })
          
          patterns.push({
            automation_id,
            name: automation_id, // In practice, you'd get this from entity metadata
            trigger_count: totalTriggers,
            success_rate: 0.95, // Placeholder - would calculate from actual data
            average_execution_time: 150, // Placeholder - would calculate from actual data
            failure_reasons: [], // Would populate from error logs
            time_patterns: Array.from(hourPatterns.entries()).map(([hour, data]) => ({
              hour,
              success_rate: data.total > 0 ? data.success / data.total : 0,
              count: data.total
            })),
            day_patterns: [], // Would calculate from day-based grouping
          })
        })
      }
      
      return patterns
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to analyze device usage patterns and efficiency
 */
export const useDevicePatterns = (
  timeRange: string,
  options: QueryOptions = {},
  queryOptions?: UseQueryOptions<DevicePattern[]>
) => {
  return useQuery({
    queryKey: ['devicePatterns', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for device state changes
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "device_patterns")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      // Transform into DevicePattern objects
      const patterns: DevicePattern[] = []
      
      if (response.data && response.data.length > 0) {
        // Group by device and analyze patterns
        const deviceGroups = new Map<string, any[]>()
        
        response.data.forEach((point: any) => {
          const key = `${point.entity_id}_${point.domain}`
          if (!deviceGroups.has(key)) {
            deviceGroups.set(key, [])
          }
          deviceGroups.get(key)!.push(point)
        })
        
        deviceGroups.forEach((points, key) => {
          const [entity_id, domain] = key.split('_')
          
          // Calculate usage patterns
          const totalChanges = points.reduce((sum, p) => sum + (p._value || 0), 0)
          const avgPerHour = totalChanges / (points.length || 1)
          
          // Determine usage pattern type
          let usage_pattern: DevicePattern['usage_pattern'] = 'sporadic'
          if (avgPerHour > 10) usage_pattern = 'constant'
          else if (avgPerHour > 2) usage_pattern = 'periodic'
          else if (avgPerHour < 0.1) usage_pattern = 'unused'
          
          // Calculate active hours (simplified)
          const activeHours = points
            .filter((p: any) => (p._value || 0) > avgPerHour * 0.5)
            .map((p: any) => new Date(p._time).getHours())
          
          const startHour = Math.min(...activeHours, 0)
          const endHour = Math.max(...activeHours, 23)
          
          patterns.push({
            entity_id,
            domain,
            friendly_name: entity_id, // Would get from entity metadata
            usage_pattern,
            active_hours: { start: startHour, end: endHour },
            peak_usage_times: activeHours,
            idle_periods: [], // Would calculate from gaps in activity
            efficiency_score: Math.min(1, avgPerHour / 10), // Normalize to 0-1
          })
        })
      }
      
      return patterns
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}
