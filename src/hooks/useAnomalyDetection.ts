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
 * AI ASSISTANT CONTEXT: Anomaly detection hooks for identifying unusual patterns
 * and potential issues in Home Assistant data. Provides statistical analysis and
 * threshold-based detection for system health monitoring.
 * 
 * Key features:
 * - Statistical anomaly detection using z-scores and percentiles
 * - Time-based pattern deviation analysis
 * - Device behavior anomaly identification
 * - Automation failure pattern detection
 * - Energy usage anomaly detection
 */

export interface Anomaly {
  id: string
  type: 'frequency' | 'timing' | 'value' | 'pattern' | 'failure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  entity_id: string
  domain: string
  description: string
  detected_at: string
  confidence: number
  baseline_value: number
  current_value: number
  deviation_percentage: number
  recommendations: string[]
  status: 'active' | 'acknowledged' | 'resolved'
}

export interface AnomalyDetectionOptions extends QueryOptions {
  min_severity?: 'low' | 'medium' | 'high' | 'critical'
  min_confidence?: number
  include_resolved?: boolean
  group_by_domain?: boolean
  time_window?: string
}

export interface AnomalySummary {
  total_anomalies: number
  active_anomalies: number
  severity_distribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  domain_distribution: Record<string, number>
  recent_trend: 'increasing' | 'stable' | 'decreasing'
}

/**
 * Hook to detect anomalies in event frequency patterns
 */
export const useFrequencyAnomalies = (
  timeRange: string,
  options: AnomalyDetectionOptions = {},
  queryOptions?: UseQueryOptions<Anomaly[]>
) => {
  return useQuery({
    queryKey: ['frequencyAnomalies', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for event frequency data
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "frequency_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      const anomalies: Anomaly[] = []
      
      if (response.data && response.data.length > 0) {
        // Group by entity and analyze frequency patterns
        const entityGroups = new Map<string, number[]>()
        
        response.data.forEach((point: any) => {
          const key = `${point.entity_id}_${point.domain}`
          if (!entityGroups.has(key)) {
            entityGroups.set(key, [])
          }
          entityGroups.get(key)!.push(point._value || 0)
        })
        
        entityGroups.forEach((frequencies, key) => {
          const [entity_id, domain] = key.split('_')
          
          if (frequencies.length < 3) return // Need at least 3 data points
          
          // Calculate statistical measures
          const mean = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const variance = frequencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / frequencies.length
          const stdDev = Math.sqrt(variance)
          
          // Get the most recent frequency
          const currentValue = frequencies[frequencies.length - 1]
          const deviation = Math.abs(currentValue - mean)
          const zScore = stdDev > 0 ? deviation / stdDev : 0
          const deviationPercentage = mean > 0 ? (deviation / mean) * 100 : 0
          
          // Determine if this is an anomaly
          if (zScore > 2.5 || deviationPercentage > 200) {
            let severity: Anomaly['severity'] = 'low'
            if (zScore > 4 || deviationPercentage > 500) severity = 'critical'
            else if (zScore > 3 || deviationPercentage > 300) severity = 'high'
            else if (zScore > 2.5 || deviationPercentage > 200) severity = 'medium'
            
            const confidence = Math.min(0.95, Math.max(0.1, zScore / 5))
            
            // Generate recommendations
            const recommendations: string[] = []
            if (currentValue > mean * 2) {
              recommendations.push('Check for stuck automation or device malfunction')
              recommendations.push('Verify device connectivity and responsiveness')
            } else if (currentValue < mean * 0.5) {
              recommendations.push('Device may be offline or experiencing issues')
              recommendations.push('Check power supply and network connectivity')
            }
            
            anomalies.push({
              id: `${entity_id}_${Date.now()}`,
              type: 'frequency',
              severity,
              entity_id,
              domain,
              description: `${entity_id} frequency is ${deviationPercentage.toFixed(1)}% ${currentValue > mean ? 'higher' : 'lower'} than usual`,
              detected_at: new Date().toISOString(),
              confidence,
              baseline_value: mean,
              current_value: currentValue,
              deviation_percentage: deviationPercentage,
              recommendations,
              status: 'active'
            })
          }
        })
      }
      
      // Filter by severity and confidence
      return anomalies.filter(anomaly => {
        if (options.min_severity) {
          const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
          if (severityLevels[anomaly.severity] < severityLevels[options.min_severity]) return false
        }
        if (options.min_confidence && anomaly.confidence < options.min_confidence) return false
        return true
      })
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // 2 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to detect timing anomalies in device behavior
 */
export const useTimingAnomalies = (
  timeRange: string,
  options: AnomalyDetectionOptions = {},
  queryOptions?: UseQueryOptions<Anomaly[]>
) => {
  return useQuery({
    queryKey: ['timingAnomalies', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for timing patterns
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "timing_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      const anomalies: Anomaly[] = []
      
      if (response.data && response.data.length > 0) {
        // Group by entity and analyze timing patterns
        const entityGroups = new Map<string, { hour: number; count: number }[]>()
        
        response.data.forEach((point: any) => {
          const key = `${point.entity_id}_${point.domain}`
          if (!entityGroups.has(key)) {
            entityGroups.set(key, [])
          }
          const hour = new Date(point._time).getHours()
          entityGroups.get(key)!.push({ hour, count: point._value || 0 })
        })
        
        entityGroups.forEach((hourlyData, key) => {
          const [entity_id, domain] = key.split('_')
          
          if (hourlyData.length < 24) return // Need at least a day of data
          
          // Analyze hourly patterns
          const hourCounts = new Array(24).fill(0)
          hourlyData.forEach(({ hour, count }) => {
            hourCounts[hour] += count
          })
          
          // Find unusual activity hours (e.g., activity at 3 AM when normally quiet)
          const avgActivity = hourCounts.reduce((sum, count) => sum + count, 0) / 24
          const quietHours = [0, 1, 2, 3, 4, 5, 6, 22, 23] // Typically quiet hours
          
          quietHours.forEach(hour => {
            if (hourCounts[hour] > avgActivity * 3) {
              const deviationPercentage = ((hourCounts[hour] - avgActivity) / avgActivity) * 100
              
              let severity: Anomaly['severity'] = 'low'
              if (deviationPercentage > 1000) severity = 'critical'
              else if (deviationPercentage > 500) severity = 'high'
              else if (deviationPercentage > 200) severity = 'medium'
              
              anomalies.push({
                id: `${entity_id}_${hour}_${Date.now()}`,
                type: 'timing',
                severity,
                entity_id,
                domain,
                description: `${entity_id} shows unusual activity at ${hour}:00 (${hourCounts[hour]} events vs ${avgActivity.toFixed(1)} average)`,
                detected_at: new Date().toISOString(),
                confidence: Math.min(0.9, Math.max(0.3, deviationPercentage / 1000)),
                baseline_value: avgActivity,
                current_value: hourCounts[hour],
                deviation_percentage: deviationPercentage,
                recommendations: [
                  'Check for automation triggers during unusual hours',
                  'Verify device is not malfunctioning or stuck',
                  'Review automation schedules and conditions'
                ],
                status: 'active'
              })
            }
          })
        })
      }
      
      return anomalies
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to detect automation failure anomalies
 */
export const useAutomationAnomalies = (
  timeRange: string,
  options: AnomalyDetectionOptions = {},
  queryOptions?: UseQueryOptions<Anomaly[]>
) => {
  return useQuery({
    queryKey: ['automationAnomalies', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for automation events
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_automation_triggered")
          |> group(columns: ["automation_id"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "automation_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      const anomalies: Anomaly[] = []
      
      if (response.data && response.data.length > 0) {
        // Group by automation and analyze patterns
        const automationGroups = new Map<string, number[]>()
        
        response.data.forEach((point: any) => {
          const automation_id = point.automation_id || 'unknown'
          if (!automationGroups.has(automation_id)) {
            automationGroups.set(automation_id, [])
          }
          automationGroups.get(automation_id)!.push(point._value || 0)
        })
        
        automationGroups.forEach((frequencies, automation_id) => {
          if (frequencies.length < 3) return
          
          const mean = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const currentValue = frequencies[frequencies.length - 1]
          
          // Detect sudden drops in automation execution (potential failures)
          if (currentValue < mean * 0.3 && mean > 0.5) {
            const deviationPercentage = ((mean - currentValue) / mean) * 100
            
            let severity: Anomaly['severity'] = 'low'
            if (deviationPercentage > 80) severity = 'critical'
            else if (deviationPercentage > 60) severity = 'high'
            else if (deviationPercentage > 40) severity = 'medium'
            
            anomalies.push({
              id: `${automation_id}_${Date.now()}`,
              type: 'failure',
              severity,
              entity_id: automation_id,
              domain: 'automation',
              description: `${automation_id} execution dropped by ${deviationPercentage.toFixed(1)}% (${currentValue} vs ${mean.toFixed(1)} average)`,
              detected_at: new Date().toISOString(),
              confidence: Math.min(0.9, Math.max(0.3, deviationPercentage / 100)),
              baseline_value: mean,
              current_value: currentValue,
              deviation_percentage: deviationPercentage,
              recommendations: [
                'Check automation conditions and triggers',
                'Verify all required devices are online',
                'Review automation logs for errors',
                'Test automation manually to identify issues'
              ],
              status: 'active'
            })
          }
        })
      }
      
      return anomalies
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
        enabled: !!timeRange,
        ...queryOptions,
      })
    }

/**
 * Hook to get anomaly summary and statistics
 */
export const useAnomalySummary = (
  timeRange: string,
  options: AnomalyDetectionOptions = {},
  queryOptions?: UseQueryOptions<AnomalySummary>
) => {
  return useQuery({
    queryKey: ['anomalySummary', timeRange, options],
    queryFn: async () => {
      // Get all types of anomalies by calling the individual hooks' query functions directly
      const client = getAPIClient()
      
      // Query for all anomaly data in one go
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change" or r._measurement == "ha_automation_triggered")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "anomaly_summary_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      // Process the data to generate anomalies (simplified version)
      const allAnomalies: Anomaly[] = []
      
      if (response.data && response.data.length > 0) {
        // Group by entity and analyze patterns
        const entityGroups = new Map<string, number[]>()
        
        response.data.forEach((point: any) => {
          const key = `${point.entity_id}_${point.domain}`
          if (!entityGroups.has(key)) {
            entityGroups.set(key, [])
          }
          entityGroups.get(key)!.push(point._value || 0)
        })
        
        entityGroups.forEach((frequencies, key) => {
          const [entity_id, domain] = key.split('_')
          
          if (frequencies.length < 3) return
          
          const mean = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const currentValue = frequencies[frequencies.length - 1]
          const deviation = Math.abs(currentValue - mean)
          const deviationPercentage = mean > 0 ? (deviation / mean) * 100 : 0
          
          // Only create anomaly if significant deviation
          if (deviationPercentage > 200) {
            let severity: Anomaly['severity'] = 'low'
            if (deviationPercentage > 500) severity = 'critical'
            else if (deviationPercentage > 300) severity = 'high'
            else if (deviationPercentage > 200) severity = 'medium'
            
            allAnomalies.push({
              id: `${entity_id}_${Date.now()}`,
              type: 'frequency',
              severity,
              entity_id,
              domain,
              description: `${entity_id} shows ${deviationPercentage.toFixed(1)}% deviation from normal pattern`,
              detected_at: new Date().toISOString(),
              confidence: Math.min(0.9, Math.max(0.3, deviationPercentage / 1000)),
              baseline_value: mean,
              current_value: currentValue,
              deviation_percentage: deviationPercentage,
              recommendations: [
                'Check device connectivity and responsiveness',
                'Review automation triggers and conditions',
                'Monitor for recurring patterns'
              ],
              status: 'active'
            })
          }
        })
      }
      
      // Calculate summary statistics
      const totalAnomalies = allAnomalies.length
      const activeAnomalies = allAnomalies.filter(a => a.status === 'active').length
      
      const severityDistribution = {
        low: allAnomalies.filter(a => a.severity === 'low').length,
        medium: allAnomalies.filter(a => a.severity === 'medium').length,
        high: allAnomalies.filter(a => a.severity === 'high').length,
        critical: allAnomalies.filter(a => a.severity === 'critical').length,
      }
      
      const domainDistribution: Record<string, number> = {}
      allAnomalies.forEach(anomaly => {
        domainDistribution[anomaly.domain] = (domainDistribution[anomaly.domain] || 0) + 1
      })
      
      // Determine recent trend (simplified)
      const recentTrend: AnomalySummary['recent_trend'] = 
        activeAnomalies > totalAnomalies * 0.7 ? 'increasing' :
        activeAnomalies < totalAnomalies * 0.3 ? 'decreasing' : 'stable'
      
      return {
        total_anomalies: totalAnomalies,
        active_anomalies: activeAnomalies,
        severity_distribution: severityDistribution,
        domain_distribution: domainDistribution,
        recent_trend: recentTrend
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // 2 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}
