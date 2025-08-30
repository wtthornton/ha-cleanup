import { useState } from 'react'
import { 
  useFrequencyAnomalies, 
  useTimingAnomalies, 
  useAutomationAnomalies,
  useAnomalySummary 
} from '@/hooks/useAnomalyDetection'
import { 
  useAllSuggestions, 
  useSuggestionSummary 
} from '@/hooks/useSuggestionEngine'
import { 
  usePendingSuggestions, 
  useApproveSuggestion, 
  useWorkflowSummary 
} from '@/hooks/useApprovalWorkflow'

/**
 * AI ASSISTANT CONTEXT: Suggestions page component showcasing the complete
 * Phase 2 feature set including anomaly detection, suggestion engine, and
 * approval workflow. Provides comprehensive system optimization insights.
 * 
 * Key features:
 * - Real-time anomaly detection and monitoring
 * - Intelligent suggestion generation
 * - Complete approval workflow system
 * - Implementation tracking and progress
 * - Mobile-first responsive design
 */
function Suggestions() {
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedTab, setSelectedTab] = useState<'anomalies' | 'suggestions' | 'workflow'>('anomalies')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedImpact, setSelectedImpact] = useState<string>('all')

  // Fetch anomaly detection data
  const { data: frequencyAnomalies, isLoading: freqLoading } = useFrequencyAnomalies(timeRange, {
    min_severity: selectedSeverity === 'all' ? undefined : selectedSeverity as any
  })
  const { data: timingAnomalies, isLoading: timingLoading } = useTimingAnomalies(timeRange)
  const { data: automationAnomalies, isLoading: autoLoading } = useAutomationAnomalies(timeRange)
  const { data: anomalySummary, isLoading: anomalySummaryLoading } = useAnomalySummary(timeRange)

  // Fetch suggestion engine data
  const { data: suggestions, isLoading: suggestionsLoading } = useAllSuggestions(timeRange, {
    min_impact: selectedImpact === 'all' ? undefined : selectedImpact as any
  })
  const { data: suggestionSummary, isLoading: suggestionSummaryLoading } = useSuggestionSummary(timeRange)

  // Fetch workflow data
  const { data: pendingSuggestions, isLoading: pendingLoading } = usePendingSuggestions(timeRange)
  const { data: workflowSummary, isLoading: workflowSummaryLoading } = useWorkflowSummary(timeRange)

  // Approval mutation
  const approveSuggestion = useApproveSuggestion()

  const isLoading = freqLoading || timingLoading || autoLoading || anomalySummaryLoading || 
                   suggestionsLoading || suggestionSummaryLoading || pendingLoading || workflowSummaryLoading

  const allAnomalies = [
    ...(frequencyAnomalies || []),
    ...(timingAnomalies || []),
    ...(automationAnomalies || [])
  ]

  const handleApproveSuggestion = (suggestionId: string, decision: 'approved' | 'rejected' | 'modified') => {
    approveSuggestion.mutate({
      suggestionId,
      decision: {
        id: `approval_${Date.now()}`,
        suggestion_id: suggestionId,
        decision,
        decision_date: new Date().toISOString(),
        decision_by: 'current_user',
        comments: `Approved via ${decision} workflow`
      },
      notes: `Approved via ${decision} workflow`
    })
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Smart Suggestions & Anomaly Detection
        </h2>
        <p className='mt-2 text-gray-600'>
          AI-powered insights for optimizing your Home Assistant system
        </p>
      </div>

      {/* Time Range Selector */}
      <div className='flex flex-wrap gap-2'>
        {['1h', '6h', '24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              timeRange === range
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: 'anomalies', label: 'Anomaly Detection', count: allAnomalies.length },
            { id: 'suggestions', label: 'Smart Suggestions', count: suggestions?.length || 0 },
            { id: 'workflow', label: 'Approval Workflow', count: pendingSuggestions?.length || 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className='ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Anomaly Detection Tab */}
      {selectedTab === 'anomalies' && (
        <div className='space-y-6'>
          {/* Anomaly Summary */}
          {anomalySummary && (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Total Anomalies</h3>
                <p className='text-2xl font-bold text-gray-900'>{anomalySummary.total_anomalies}</p>
                <p className='text-xs text-gray-500 mt-1'>Detected</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Active Anomalies</h3>
                <p className='text-2xl font-bold text-red-600'>{anomalySummary.active_anomalies}</p>
                <p className='text-xs text-gray-500 mt-1'>Require Attention</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Critical Issues</h3>
                <p className='text-2xl font-bold text-red-800'>{anomalySummary.severity_distribution.critical}</p>
                <p className='text-xs text-gray-500 mt-1'>High Priority</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Trend</h3>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  anomalySummary.recent_trend === 'increasing' ? 'bg-red-500' :
                  anomalySummary.recent_trend === 'decreasing' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <p className='text-sm font-medium text-gray-900 capitalize'>{anomalySummary.recent_trend}</p>
                <p className='text-xs text-gray-500 mt-1'>Anomaly Trend</p>
              </div>
            </div>
          )}

          {/* Severity Filter */}
          <div className='flex flex-wrap gap-2'>
            <span className='text-sm font-medium text-gray-700'>Filter by Severity:</span>
            {['all', 'low', 'medium', 'high', 'critical'].map((severity) => (
              <button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedSeverity === severity
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
              </button>
            ))}
          </div>

          {/* Anomalies List */}
          <div className='space-y-4'>
            {allAnomalies.slice(0, 10).map((anomaly) => (
              <div key={anomaly.id} className='card'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        anomaly.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        anomaly.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}>
                        {anomaly.type}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {(anomaly.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <h4 className='text-sm font-medium text-gray-900 mb-1'>{anomaly.entity_id}</h4>
                    <p className='text-sm text-gray-600 mb-2'>{anomaly.description}</p>
                    <div className='grid grid-cols-3 gap-4 text-xs text-gray-500'>
                      <div>
                        <span className='font-medium'>Baseline:</span> {anomaly.baseline_value.toFixed(2)}
                      </div>
                      <div>
                        <span className='font-medium'>Current:</span> {anomaly.current_value.toFixed(2)}
                      </div>
                      <div>
                        <span className='font-medium'>Deviation:</span> {anomaly.deviation_percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 ml-4'>
                    {new Date(anomaly.detected_at).toLocaleTimeString()}
                  </div>
                </div>
                
                {/* Recommendations */}
                {anomaly.recommendations.length > 0 && (
                  <div className='mt-3 pt-3 border-t border-gray-200'>
                    <p className='text-xs font-medium text-gray-700 mb-2'>Recommendations:</p>
                    <ul className='space-y-1'>
                      {anomaly.recommendations.map((rec, idx) => (
                        <li key={idx} className='text-xs text-gray-600 flex items-center'>
                          <span className='w-1 h-1 bg-blue-400 rounded-full mr-2' />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Suggestions Tab */}
      {selectedTab === 'suggestions' && (
        <div className='space-y-6'>
          {/* Suggestions Summary */}
          {suggestionSummary && (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Total Suggestions</h3>
                <p className='text-2xl font-bold text-gray-900'>{suggestionSummary.total_suggestions}</p>
                <p className='text-xs text-gray-500 mt-1'>Generated</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Potential Savings</h3>
                <p className='text-2xl font-bold text-green-600'>{suggestionSummary.potential_savings.energy}%</p>
                <p className='text-xs text-gray-500 mt-1'>Energy Savings</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Performance Gain</h3>
                <p className='text-2xl font-bold text-blue-600'>{suggestionSummary.potential_savings.performance}%</p>
                <p className='text-xs text-gray-500 mt-1'>Performance Improvement</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>High Priority</h3>
                <p className='text-2xl font-bold text-orange-600'>{suggestionSummary.high_priority_count}</p>
                <p className='text-xs text-gray-500 mt-1'>Urgent</p>
              </div>
            </div>
          )}

          {/* Impact Filter */}
          <div className='flex flex-wrap gap-2'>
            <span className='text-sm font-medium text-gray-700'>Filter by Impact:</span>
            {['all', 'low', 'medium', 'high', 'critical'].map((impact) => (
              <button
                key={impact}
                onClick={() => setSelectedImpact(impact)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedImpact === impact
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {impact === 'all' ? 'All' : impact.charAt(0).toUpperCase() + impact.slice(1)}
              </button>
            ))}
          </div>

          {/* Suggestions List */}
          <div className='space-y-4'>
            {suggestions?.slice(0, 10).map((suggestion) => (
              <div key={suggestion.id} className='card'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        suggestion.impact === 'critical' ? 'bg-red-100 text-red-800' :
                        suggestion.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                        suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {suggestion.impact.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}>
                        {suggestion.category}
                      </span>
                      <span className='px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800'>
                        Priority {suggestion.priority_score}
                      </span>
                    </div>
                    <h4 className='text-lg font-medium text-gray-900 mb-1'>{suggestion.title}</h4>
                    <p className='text-sm text-gray-600 mb-2'>{suggestion.description}</p>
                  </div>
                  <div className='text-xs text-gray-500 ml-4'>
                    {new Date(suggestion.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Estimated Savings */}
                {suggestion.estimated_savings && (
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded-lg'>
                    {suggestion.estimated_savings.energy && (
                      <div className='text-center'>
                        <p className='text-lg font-bold text-green-600'>{suggestion.estimated_savings.energy}%</p>
                        <p className='text-xs text-gray-600'>Energy</p>
                      </div>
                    )}
                    {suggestion.estimated_savings.performance && (
                      <div className='text-center'>
                        <p className='text-lg font-bold text-blue-600'>{suggestion.estimated_savings.performance}%</p>
                        <p className='text-xs text-gray-600'>Performance</p>
                      </div>
                    )}
                    {suggestion.estimated_savings.time && (
                      <div className='text-center'>
                        <p className='text-lg font-bold text-purple-600'>{suggestion.estimated_savings.time}h</p>
                        <p className='text-xs text-gray-600'>Time Saved</p>
                      </div>
                    )}
                    {suggestion.estimated_savings.money && (
                      <div className='text-center'>
                        <p className='text-lg font-bold text-green-600'>${suggestion.estimated_savings.money}</p>
                        <p className='text-xs text-gray-600'>Money Saved</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Implementation Steps */}
                <div className='mb-3'>
                  <p className='text-xs font-medium text-gray-700 mb-2'>Implementation Steps:</p>
                  <ol className='list-decimal list-inside space-y-1 text-sm text-gray-600'>
                    {suggestion.implementation_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Tags section removed - Suggestion interface doesn't have tags */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Workflow Tab */}
      {selectedTab === 'workflow' && (
        <div className='space-y-6'>
          {/* Workflow Summary */}
          {workflowSummary && (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Pending Approval</h3>
                <p className='text-2xl font-bold text-yellow-600'>{workflowSummary.total_pending}</p>
                <p className='text-xs text-gray-500 mt-1'>Awaiting Decision</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Approved</h3>
                <p className='text-2xl font-bold text-green-600'>{workflowSummary.total_approved}</p>
                <p className='text-xs text-gray-500 mt-1'>Ready to Implement</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Implemented</h3>
                <p className='text-2xl font-bold text-blue-600'>{workflowSummary.total_implemented}</p>
                <p className='text-xs text-gray-500 mt-1'>Completed</p>
              </div>
              <div className='card'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>Success Rate</h3>
                <p className='text-2xl font-bold text-green-600'>{workflowSummary.implementation_success_rate}%</p>
                <p className='text-xs text-gray-500 mt-1'>Implementation</p>
              </div>
            </div>
          )}

          {/* Pending Suggestions */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>Pending Approval</h3>
            {pendingSuggestions?.map((suggestion) => (
              <div key={suggestion.id} className='card'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        suggestion.impact === 'critical' ? 'bg-red-100 text-red-800' :
                        suggestion.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                        suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {suggestion.impact.toUpperCase()}
                      </span>
                      <span className='px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800'>
                        Priority {suggestion.priority_score}
                      </span>
                    </div>
                    <h4 className='text-lg font-medium text-gray-900 mb-1'>{suggestion.title}</h4>
                    <p className='text-sm text-gray-600 mb-2'>{suggestion.description}</p>
                  </div>
                  <div className='text-xs text-gray-500 ml-4'>
                    {new Date(suggestion.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-wrap gap-2'>
                  <button
                    onClick={() => handleApproveSuggestion(suggestion.id, 'approved')}
                    disabled={approveSuggestion.isPending}
                    className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50'
                  >
                    {approveSuggestion.isPending ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleApproveSuggestion(suggestion.id, 'rejected')}
                    disabled={approveSuggestion.isPending}
                    className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50'
                  >
                    {approveSuggestion.isPending ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApproveSuggestion(suggestion.id, 'modified')}
                    disabled={approveSuggestion.isPending}
                    className='px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50'
                  >
                    {approveSuggestion.isPending ? 'Modifying...' : 'Modify'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='card'>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600' />
            <span className='ml-3 text-gray-600'>Loading data...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Suggestions
