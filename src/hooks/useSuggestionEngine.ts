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
 * AI ASSISTANT CONTEXT: Suggestion engine hooks for generating actionable recommendations
 * based on Home Assistant data analysis. Provides intelligent insights for system
 * optimization and problem resolution.
 * 
 * Key features:
 * - Performance optimization suggestions
 * - Energy efficiency recommendations
 * - Automation improvement suggestions
 * - Device maintenance recommendations
 * - System health optimization
 */

export interface Suggestion {
  id: string
  title: string
  description: string
  category: 'performance' | 'energy' | 'automation' | 'device' | 'system' | 'schedule' | 'network' | 'maintenance'
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high' | 'critical'
  estimated_savings: {
    energy?: number
    time?: number
    money?: number
    performance?: number
    maintenance?: number
  }
  implementation_steps: string[]
  prerequisites: string[]
  estimated_implementation_time: string
  risk_level: 'low' | 'medium' | 'high'
  priority_score: number
  created_at: string
  status: 'pending' | 'approved' | 'rejected' | 'implemented' | 'archived'
}

export interface SuggestionOptions extends QueryOptions {
  min_impact?: 'low' | 'medium' | 'high' | 'critical'
  max_effort?: 'low' | 'medium' | 'high'
  categories?: string[]
  status?: Suggestion['status']
  min_confidence?: number
  category?: Suggestion['category']
  impact?: Suggestion['impact']
  minPriority?: number
  limit?: number
}

export interface SuggestionSummary {
  total_suggestions: number
  pending_suggestions: number
  approved_suggestions: number
  implemented_suggestions: number
  category_distribution: Record<string, number>
  impact_distribution: Record<string, number>
  potential_savings: {
    energy: number
    time: number
    money: number
    performance: number
    maintenance: number
  }
  average_priority_score: number
  high_priority_count: number
}

/**
 * Hook to generate performance optimization suggestions
 */
export const usePerformanceSuggestions = (
  timeRange: string,
  options: SuggestionOptions = {},
  queryOptions?: UseQueryOptions<Suggestion[]>
) => {
  return useQuery({
    queryKey: ['performanceSuggestions', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for performance data
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "performance_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      const suggestions: Suggestion[] = []
      
      if (response.data && response.data.length > 0) {
        // Analyze response times and frequency patterns
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
          
          const avgFrequency = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const variance = frequencies.reduce((sum, val) => sum + Math.pow(val - avgFrequency, 2), 0) / frequencies.length
          
          // High frequency with high variance suggests optimization opportunity
          if (avgFrequency > 100 && variance > avgFrequency * 0.5) {
            const impact: Suggestion['impact'] = avgFrequency > 500 ? 'critical' : avgFrequency > 200 ? 'high' : 'medium'
            const effort: Suggestion['effort'] = variance > avgFrequency ? 'medium' : 'low'
            
            suggestions.push({
              id: `${entity_id}_performance_${Date.now()}`,
              title: `Optimize ${entity_id} performance`,
              description: `${entity_id} shows high activity variance (${variance.toFixed(1)}), suggesting optimization opportunities`,
              category: 'performance',
              impact,
              effort,
              estimated_savings: {
                performance: Math.round(avgFrequency * 0.2),
                time: Math.round(avgFrequency * 0.1),
                energy: domain === 'light' || domain === 'climate' ? Math.round(avgFrequency * 0.15) : undefined
              },
              implementation_steps: [
                'Review device configuration and settings',
                'Implement rate limiting if applicable',
                'Check for automation loops or conflicts',
                'Monitor performance after changes'
              ],
              prerequisites: [
                'Device must be online and responsive',
                'No critical automations depending on this device'
              ],
              estimated_implementation_time: '1-2 hours',
              risk_level: 'low',
              priority_score: Math.min(10, Math.max(1, Math.round(avgFrequency / 50))),
              created_at: new Date().toISOString(),
              status: 'pending'
            })
          }
        })
      }
      
      return suggestions
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to generate energy efficiency suggestions
 */
export const useEnergySuggestions = (
  timeRange: string,
  options: SuggestionOptions = {},
  queryOptions?: UseQueryOptions<Suggestion[]>
) => {
  return useQuery({
    queryKey: ['energySuggestions', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for energy-related data
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r.domain == "light" or r.domain == "climate" or r.domain == "switch")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "energy_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      const suggestions: Suggestion[] = []
      
      if (response.data && response.data.length > 0) {
        // Analyze energy consumption patterns
        const entityGroups = new Map<string, number[]>()
        
        response.data.forEach((point: any) => {
          const key = `${point.entity_id}_${point.domain}`
          if (!entityGroups.has(key)) {
            entityGroups.set(key, [])
          }
          entityGroups.get(key)!.push(point._value || 0)
        })
        
        entityGroups.forEach((frequencies, key) => {
          const [entity_id] = key.split('_')
          
          if (frequencies.length < 24) return // Need at least a day of data
          
          const avgFrequency = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const nightTimeFreq = frequencies.slice(0, 6).concat(frequencies.slice(22)).reduce((sum, val) => sum + val, 0) / 8
          const dayTimeFreq = frequencies.slice(6, 22).reduce((sum, val) => sum + val, 0) / 16
          
          // High night-time activity suggests energy waste
          if (nightTimeFreq > dayTimeFreq * 0.3 && avgFrequency > 50) {
            const impact: Suggestion['impact'] = nightTimeFreq > dayTimeFreq * 0.5 ? 'high' : 'medium'
            const effort: Suggestion['effort'] = 'low'
            
            suggestions.push({
              id: `${entity_id}_energy_${Date.now()}`,
              title: `Optimize ${entity_id} energy usage`,
              description: `${entity_id} shows high night-time activity, suggesting energy optimization opportunities`,
              category: 'energy',
              impact,
              effort,
              estimated_savings: {
                energy: Math.round(avgFrequency * 0.3),
                money: Math.round(avgFrequency * 0.1),
                time: Math.round(avgFrequency * 0.05)
              },
              implementation_steps: [
                'Review automation schedules and triggers',
                'Implement time-based restrictions',
                'Add presence detection if applicable',
                'Monitor energy consumption after changes'
              ],
              prerequisites: [
                'Device supports scheduling or automation',
                'No critical night-time operations'
              ],
              estimated_implementation_time: '2-4 hours',
              risk_level: 'low',
              priority_score: Math.min(10, Math.max(1, Math.round(nightTimeFreq / 10))),
              created_at: new Date().toISOString(),
              status: 'pending'
            })
          }
        })
      }
      
      return suggestions
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to generate automation improvement suggestions
 */
export const useAutomationSuggestions = (
  timeRange: string,
  options: SuggestionOptions = {},
  queryOptions?: UseQueryOptions<Suggestion[]>
) => {
  return useQuery({
    queryKey: ['automationSuggestions', timeRange, options],
    queryFn: async () => {
      const client = getAPIClient()
      
      // Query for automation data
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_automation_triggered")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "automation_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      const suggestions: Suggestion[] = []
      
      if (response.data && response.data.length > 0) {
        // Analyze automation patterns
        const entityGroups = new Map<string, number[]>()
        
        response.data.forEach((point: any) => {
          const key = `${point.entity_id}_${point.domain}`
          if (!entityGroups.has(key)) {
            entityGroups.set(key, [])
          }
          entityGroups.get(key)!.push(point._value || 0)
        })
        
        entityGroups.forEach((frequencies, key) => {
          const [entity_id] = key.split('_')
          
          if (frequencies.length < 24) return
          
          const avgFrequency = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const maxFrequency = Math.max(...frequencies)
          
          // High variance suggests automation issues
          if (maxFrequency > avgFrequency * 3 && avgFrequency > 10) {
            const impact: Suggestion['impact'] = maxFrequency > avgFrequency * 5 ? 'critical' : 'high'
            const effort: Suggestion['effort'] = 'medium'
            
            suggestions.push({
              id: `${entity_id}_automation_${Date.now()}`,
              title: `Improve ${entity_id} automation reliability`,
              description: `${entity_id} shows inconsistent automation execution, suggesting reliability improvements`,
              category: 'automation',
              impact,
              effort,
              estimated_savings: {
                performance: Math.round(avgFrequency * 0.4),
                time: Math.round(avgFrequency * 0.2),
                maintenance: Math.round(avgFrequency * 0.1)
              },
              implementation_steps: [
                'Review automation triggers and conditions',
                'Check for conflicting automations',
                'Implement error handling and retry logic',
                'Add monitoring and alerting'
              ],
              prerequisites: [
                'Automation configuration access',
                'Understanding of current automation logic'
              ],
              estimated_implementation_time: '4-8 hours',
              risk_level: 'medium',
              priority_score: Math.min(10, Math.max(1, Math.round(maxFrequency / avgFrequency))),
              created_at: new Date().toISOString(),
              status: 'pending'
            })
          }
        })
      }
      
      return suggestions
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to get all suggestions with filtering and sorting
 */
export const useAllSuggestions = (
  timeRange: string,
  options: SuggestionOptions = {},
  queryOptions?: UseQueryOptions<Suggestion[]>
) => {
  return useQuery({
    queryKey: ['allSuggestions', timeRange, options],
    queryFn: async () => {
      // Get all types of suggestions by calling the individual hooks' query functions directly
      const client = getAPIClient()
      
      // Query for all suggestion data in one go
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change" or r._measurement == "ha_automation_triggered")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "suggestion_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      // Process the data to generate suggestions (simplified version)
      const allSuggestions: Suggestion[] = []
      
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
          
          const avgFrequency = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const variance = frequencies.reduce((sum, val) => sum + Math.pow(val - avgFrequency, 2), 0) / frequencies.length
          
          // Generate suggestions based on patterns
          if (avgFrequency > 100 && variance > avgFrequency * 0.5) {
            const impact: Suggestion['impact'] = avgFrequency > 500 ? 'critical' : avgFrequency > 200 ? 'high' : 'medium'
            const effort: Suggestion['effort'] = variance > avgFrequency ? 'medium' : 'low'
            
            allSuggestions.push({
              id: `${entity_id}_suggestion_${Date.now()}`,
              title: `Optimize ${entity_id}`,
              description: `${entity_id} shows optimization opportunities with ${avgFrequency.toFixed(1)} average frequency`,
              category: 'performance',
              impact,
              effort,
              estimated_savings: {
                performance: Math.round(avgFrequency * 0.2),
                time: Math.round(avgFrequency * 0.1),
                energy: domain === 'light' || domain === 'climate' ? Math.round(avgFrequency * 0.15) : undefined
              },
              implementation_steps: [
                'Review device configuration and settings',
                'Implement rate limiting if applicable',
                'Check for automation loops or conflicts',
                'Monitor performance after changes'
              ],
              prerequisites: [
                'Device must be online and responsive',
                'No critical automations depending on this device'
              ],
              estimated_implementation_time: '1-2 hours',
              risk_level: 'low',
              priority_score: Math.min(10, Math.max(1, Math.round(avgFrequency / 50))),
              created_at: new Date().toISOString(),
              status: 'pending'
            })
          }
        })
      }
      
      // Apply filters
      let filteredSuggestions = allSuggestions
      
      if (options.category) {
        filteredSuggestions = filteredSuggestions.filter((s: Suggestion) => s.category === options.category)
      }
      
      if (options.impact) {
        filteredSuggestions = filteredSuggestions.filter((s: Suggestion) => s.impact === options.impact)
      }
      
      if (options.minPriority) {
        filteredSuggestions = filteredSuggestions.filter((s: Suggestion) => s.priority_score >= (options.minPriority || 0))
      }
      
      // Sort by priority score (descending)
      filteredSuggestions.sort((a: Suggestion, b: Suggestion) => b.priority_score - a.priority_score)
      
      // Apply limit
      if (options.limit) {
        filteredSuggestions = filteredSuggestions.slice(0, options.limit)
      }
      
      return filteredSuggestions
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}

/**
 * Hook to get suggestion summary and statistics
 */
export const useSuggestionSummary = (
  timeRange: string,
  options: SuggestionOptions = {},
  queryOptions?: UseQueryOptions<SuggestionSummary>
) => {
  return useQuery({
    queryKey: ['suggestionSummary', timeRange, options],
    queryFn: async () => {
      // Get all suggestions by calling the individual hook's query function directly
      const client = getAPIClient()
      
      // Query for all suggestion data in one go
      const query = `
        from(bucket: "ha_events")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "ha_state_change" or r._measurement == "ha_automation_triggered")
          |> group(columns: ["entity_id", "domain"])
          |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
          |> yield(name: "suggestion_summary_data")
      `
      
      const response = await client.executeCustomQuery(query, 60)
      
      // Process the data to generate suggestions (simplified version)
      const allSuggestions: Suggestion[] = []
      
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
          
          const avgFrequency = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length
          const variance = frequencies.reduce((sum, val) => sum + Math.pow(val - avgFrequency, 2), 0) / frequencies.length
          
          // Generate suggestions based on patterns
          if (avgFrequency > 100 && variance > avgFrequency * 0.5) {
            const impact: Suggestion['impact'] = avgFrequency > 500 ? 'critical' : avgFrequency > 200 ? 'high' : 'medium'
            const effort: Suggestion['effort'] = variance > avgFrequency ? 'medium' : 'low'
            
            allSuggestions.push({
              id: `${entity_id}_suggestion_${Date.now()}`,
              title: `Optimize ${entity_id}`,
              description: `${entity_id} shows optimization opportunities with ${avgFrequency.toFixed(1)} average frequency`,
              category: 'performance',
              impact,
              effort,
              estimated_savings: {
                performance: Math.round(avgFrequency * 0.2),
                time: Math.round(avgFrequency * 0.1),
                energy: domain === 'light' || domain === 'climate' ? Math.round(avgFrequency * 0.15) : undefined
              },
              implementation_steps: [
                'Review device configuration and settings',
                'Implement rate limiting if applicable',
                'Check for automation loops or conflicts',
                'Monitor performance after changes'
              ],
              prerequisites: [
                'Device must be online and responsive',
                'No critical automations depending on this device'
              ],
              estimated_implementation_time: '1-2 hours',
              risk_level: 'low',
              priority_score: Math.min(10, Math.max(1, Math.round(avgFrequency / 50))),
              created_at: new Date().toISOString(),
              status: 'pending'
            })
          }
        })
      }
      
      // Calculate summary statistics
      const totalSuggestions = allSuggestions.length
      const pendingSuggestions = allSuggestions.filter((s: Suggestion) => s.status === 'pending').length
      const approvedSuggestions = allSuggestions.filter((s: Suggestion) => s.status === 'approved').length
      const implementedSuggestions = allSuggestions.filter((s: Suggestion) => s.status === 'implemented').length
      
      // Category distribution
      const categoryDistribution: Record<string, number> = {}
      allSuggestions.forEach((suggestion: Suggestion) => {
        categoryDistribution[suggestion.category] = (categoryDistribution[suggestion.category] || 0) + 1
      })
      
      // Impact distribution
      const impactDistribution: Record<string, number> = {}
      allSuggestions.forEach((suggestion: Suggestion) => {
        impactDistribution[suggestion.impact] = (impactDistribution[suggestion.impact] || 0) + 1
      })
      
      // Calculate potential savings
      const potentialSavings = {
        energy: allSuggestions.reduce((sum: number, s: Suggestion) => sum + (s.estimated_savings.energy || 0), 0),
        time: allSuggestions.reduce((sum: number, s: Suggestion) => sum + (s.estimated_savings.time || 0), 0),
        money: allSuggestions.reduce((sum: number, s: Suggestion) => sum + (s.estimated_savings.money || 0), 0),
        performance: allSuggestions.reduce((sum: number, s: Suggestion) => sum + (s.estimated_savings.performance || 0), 0),
        maintenance: allSuggestions.reduce((sum: number, s: Suggestion) => sum + (s.estimated_savings.maintenance || 0), 0),
      }
      
      // Priority score distribution
      const avgPriorityScore = totalSuggestions > 0 
        ? allSuggestions.reduce((sum: number, s: Suggestion) => sum + s.priority_score, 0) / totalSuggestions
        : 0
      
      const highPriorityCount = allSuggestions.filter((s: Suggestion) => s.priority_score >= 8).length
      
      return {
        total_suggestions: totalSuggestions,
        pending_suggestions: pendingSuggestions,
        approved_suggestions: approvedSuggestions,
        implemented_suggestions: implementedSuggestions,
        category_distribution: categoryDistribution,
        impact_distribution: impactDistribution,
        potential_savings: potentialSavings,
        average_priority_score: avgPriorityScore,
        high_priority_count: highPriorityCount
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    enabled: !!timeRange,
    ...queryOptions,
  })
}
