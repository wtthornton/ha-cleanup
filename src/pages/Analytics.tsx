import { useState } from 'react'
import { 
  useEventPatterns
} from '@/hooks/usePatternRecognition'
import { 
  useSystemEfficiency, 
  usePerformanceMetrics, 
  useDevicePerformance, 
  useAutomationPerformance 
} from '@/hooks/usePerformanceMetrics'
import ChartContainer from '@/components/charts/ChartContainer'
import BarChart from '@/components/charts/BarChart'

/**
 * AI ASSISTANT CONTEXT: Enhanced Analytics page component with real data integration.
 * Features comprehensive pattern recognition, performance metrics, and system analysis.
 * 
 * Key features:
 * - Real-time system efficiency metrics
 * - Event pattern analysis with confidence scores
 * - Device performance monitoring
 * - Automation success rate tracking
 * - Interactive charts and visualizations
 * - Mobile-first responsive design
 */
function Analytics() {
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')

  // Fetch pattern recognition data
  const { data: eventPatterns, isLoading: patternsLoading } = useEventPatterns(timeRange, {
    min_confidence: 0.5,
    min_frequency: 0.1
  })

  // Fetch performance metrics
  const { data: systemEfficiency, isLoading: efficiencyLoading } = useSystemEfficiency(timeRange)
  const { data: performanceMetrics, isLoading: metricsLoading } = usePerformanceMetrics(timeRange)
  const { data: devicePerformance, isLoading: devicePerfLoading } = useDevicePerformance(timeRange)
  const { data: automationPerformance, isLoading: autoPerfLoading } = useAutomationPerformance(timeRange)

  // Filter patterns by domain if selected
  const filteredEventPatterns = selectedDomain === 'all' 
    ? eventPatterns 
    : eventPatterns?.filter(p => p.domain === selectedDomain)

  const isLoading = patternsLoading || efficiencyLoading || metricsLoading || 
                   devicePerfLoading || autoPerfLoading

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Analytics
        </h2>
        <p className='mt-2 text-gray-600'>
          Analyze patterns and performance in your Home Assistant data
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

      {/* System Efficiency Metrics */}
      {systemEfficiency && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='card'>
            <h3 className='text-sm font-medium text-gray-900 mb-2'>Overall Score</h3>
            <div className='flex items-center space-x-2'>
              <div className={`w-3 h-3 rounded-full ${
                systemEfficiency.overall_score >= 90 ? 'bg-green-500' :
                systemEfficiency.overall_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <p className='text-2xl font-bold text-gray-900'>{systemEfficiency.overall_score}%</p>
            </div>
            <p className='text-xs text-gray-500 mt-1'>System Health</p>
          </div>

          <div className='card'>
            <h3 className='text-sm font-medium text-gray-900 mb-2'>Response Time</h3>
            <p className='text-2xl font-bold text-blue-600'>{systemEfficiency.response_time_avg}ms</p>
            <p className='text-xs text-gray-500 mt-1'>Average</p>
          </div>

          <div className='card'>
            <h3 className='text-sm font-medium text-gray-900 mb-2'>Automation Success</h3>
            <p className='text-2xl font-bold text-purple-600'>{systemEfficiency.automation_success_rate}%</p>
            <p className='text-xs text-gray-500 mt-1'>Success Rate</p>
          </div>

          <div className='card'>
            <h3 className='text-sm font-medium text-gray-900 mb-2'>Device Uptime</h3>
            <p className='text-2xl font-bold text-green-600'>{systemEfficiency.device_uptime}%</p>
            <p className='text-xs text-gray-500 mt-1'>Average Uptime</p>
          </div>
        </div>
      )}

      {/* Performance Metrics Chart */}
      {performanceMetrics && performanceMetrics.length > 0 && (
        <div className='card'>
          <div className='card-header'>
            <h3 className='text-lg font-medium text-gray-900'>Performance Metrics</h3>
          </div>
          <div className='chart-container'>
            <ChartContainer title="Performance Metrics">
              <BarChart
                data={performanceMetrics.map(metric => ({
                  category: metric.metric_name,
                  value: metric.value,
                  status: metric.status
                }))}
                xAxisKey="category"
                height={300}
              />
            </ChartContainer>
          </div>
        </div>
      )}

      {/* Event Pattern Analysis */}
      {filteredEventPatterns && filteredEventPatterns.length > 0 && (
        <div className='card'>
          <div className='card-header'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Event Pattern Analysis</h3>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className='px-3 py-1 text-sm border border-gray-300 rounded-md'
              >
                <option value="all">All Domains</option>
                <option value="light">Light</option>
                <option value="switch">Switch</option>
                <option value="sensor">Sensor</option>
                <option value="binary_sensor">Binary Sensor</option>
                <option value="climate">Climate</option>
              </select>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Entity
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Domain
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Pattern Type
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Frequency
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredEventPatterns.slice(0, 10).map((pattern, index) => (
                  <tr key={index} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {pattern.entity_id}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {pattern.domain}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pattern.pattern_type === 'constant' ? 'bg-green-100 text-green-800' :
                        pattern.pattern_type === 'periodic' ? 'bg-blue-100 text-blue-800' :
                        pattern.pattern_type === 'daily' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pattern.pattern_type}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {pattern.frequency.toFixed(2)}/hour
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {(pattern.confidence * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Device Performance */}
      {devicePerformance && devicePerformance.length > 0 && (
        <div className='card'>
          <div className='card-header'>
            <h3 className='text-lg font-medium text-gray-900'>Device Performance</h3>
          </div>
          <div className='space-y-4'>
            {devicePerformance.slice(0, 5).map((device, index) => (
              <div key={index} className='border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-sm font-medium text-gray-900'>
                    {device.friendly_name || device.entity_id}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    device.performance_score >= 90 ? 'bg-green-100 text-green-800' :
                    device.performance_score >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {device.performance_score}%
                  </span>
                </div>
                <div className='grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-500'>Response:</span>
                    <span className='ml-2 font-medium'>{device.response_time}ms</span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Uptime:</span>
                    <span className='ml-2 font-medium'>{device.uptime_percentage}%</span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Errors:</span>
                    <span className='ml-2 font-medium'>{device.error_rate}%</span>
                  </div>
                </div>
                {device.optimization_suggestions.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-xs text-gray-500'>Suggestions:</p>
                    <ul className='text-xs text-gray-600 mt-1 space-y-1'>
                      {device.optimization_suggestions.slice(0, 2).map((suggestion, idx) => (
                        <li key={idx} className='flex items-center'>
                          <span className='w-1 h-1 bg-blue-400 rounded-full mr-2' />
                          {suggestion}
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

      {/* Automation Performance */}
      {automationPerformance && automationPerformance.length > 0 && (
        <div className='card'>
          <div className='card-header'>
            <h3 className='text-lg font-medium text-gray-900'>Automation Performance</h3>
          </div>
          <div className='space-y-4'>
            {automationPerformance.slice(0, 5).map((automation, index) => (
              <div key={index} className='border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-sm font-medium text-gray-900'>{automation.name}</h4>
                  <div className='flex items-center space-x-2'>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      automation.success_rate >= 95 ? 'bg-green-100 text-green-800' :
                      automation.success_rate >= 90 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {automation.success_rate}%
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      automation.performance_trend === 'improving' ? 'bg-green-100 text-green-800' :
                      automation.performance_trend === 'declining' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {automation.performance_trend}
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-500'>Executions:</span>
                    <span className='ml-2 font-medium'>{automation.execution_count}</span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Avg Time:</span>
                    <span className='ml-2 font-medium'>{automation.average_execution_time}ms</span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Failures:</span>
                    <span className='ml-2 font-medium'>{automation.failure_count}</span>
                  </div>
                </div>
                {automation.optimization_opportunities.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-xs text-gray-500'>Opportunities:</p>
                    <ul className='text-xs text-gray-600 mt-1 space-y-1'>
                      {automation.optimization_opportunities.slice(0, 2).map((opportunity, idx) => (
                        <li key={idx} className='flex items-center'>
                          <span className='w-1 h-1 bg-purple-400 rounded-full mr-2' />
                          {opportunity}
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

      {/* Loading State */}
      {isLoading && (
        <div className='card'>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600' />
            <span className='ml-3 text-gray-600'>Loading analytics data...</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0'>
        <button className='btn-primary flex-1'>
          Generate Full Report
        </button>
        <button className='btn-secondary flex-1'>
          Export Analytics Data
        </button>
      </div>
    </div>
  )
}

export default Analytics