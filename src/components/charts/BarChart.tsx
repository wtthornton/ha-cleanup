
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { formatValueAxis, getChartColors } from '@/utils/chartUtils'

export interface BarChartData {
  category: string
  value?: number
  [key: string]: any
}

interface BarChartProps {
  data: BarChartData[]
  xAxisKey: string
  barKey?: string
  barKeys?: string[]
  color?: string
  colors?: string[]
  dataType?: string
  orientation?: 'vertical' | 'horizontal'
  loading?: boolean
  error?: string
  height?: number
}

/**
 * AI ASSISTANT CONTEXT: Mobile-first bar chart component for displaying
 * categorical data from Home Assistant devices. Built with Recharts for
 * responsive visualization with touch-friendly interactions.
 * 
 * Key features:
 * - Responsive design that adapts to mobile screens
 * - Support for single and multiple data series
 * - Horizontal and vertical orientations
 * - Touch-friendly tooltip interactions
 * - Automatic value axis formatting
 * - Loading and error state handling
 * - Optimized for device and room-based data
 */
function BarChart({
  data,
  xAxisKey,
  barKey,
  barKeys,
  color,
  colors,
  dataType = 'default',
  orientation = 'vertical',
  loading = false,
  error,
  height = 300,
}: BarChartProps) {
  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading chart data...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h4 className="mt-2 text-sm font-medium text-red-900">
            Error loading chart data
          </h4>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
          </div>
          <h4 className="mt-2 text-sm font-medium text-gray-900">No data available</h4>
          <p className="mt-1 text-xs text-gray-600">Try adjusting your time range or filters</p>
        </div>
      </div>
    )
  }

  // Determine which keys to use for bars
  const keysToRender = barKeys || (barKey ? [barKey] : ['value'])
  const chartColors = colors || (getChartColors() as string[])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-gray-600">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }



  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          
          {orientation === 'vertical' ? (
            <>
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => formatValueAxis(value, dataType)}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => formatValueAxis(value, dataType)}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
            </>
          )}
          
          <Tooltip content={<CustomTooltip />} />
          
          {keysToRender.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={color || chartColors[index % chartColors.length]}
              radius={2}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart