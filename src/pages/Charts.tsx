import { useState, useEffect } from 'react'
import ChartContainer from '@/components/charts/ChartContainer'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import { useSensorReadings, useDeviceActivity } from '@/hooks/useInfluxData'
import { formatChartData, aggregateDataByTime } from '@/utils/chartUtils'
import { TimeRange } from '@/types/app'

/**
 * AI ASSISTANT CONTEXT: Charts page component for displaying Home Assistant
 * data visualizations. Features mobile-first design with responsive charts,
 * time range selection, and various chart types optimized for sensor data.
 * 
 * Key features:
 * - Mobile-responsive chart grid layout
 * - Time range filtering for all charts
 * - Line charts for sensor trends over time
 * - Bar charts for categorical device data
 * - Loading and error state management
 * - Touch-friendly chart interactions
 */
function Charts() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1d')
  const [chartData, setChartData] = useState<{
    temperatureData: any[]
    energyData: any[]
    deviceCounts: any[]
    roomActivity: any[]
  }>({
    temperatureData: [],
    energyData: [],
    deviceCounts: [],
    roomActivity: [],
  })

  // Fetch sensor data for line charts
  const {
    data: sensorData,
    isLoading: sensorsLoading,
    error: sensorsError,
  } = useSensorReadings(timeRange, {
    device_class: 'temperature',
  })

  // Fetch energy data
  const {
    data: energyData,
    isLoading: energyLoading,
    error: energyError,
  } = useSensorReadings(timeRange, {
    device_class: 'energy',
  })

  // Use device activity to generate entity counts
  const {
    data: deviceActivityForCounts,
    isLoading: countsLoading,
    error: countsError,
  } = useDeviceActivity('7d') // Use 7 days for device counts

  // Fetch device activity
  const {
    data: deviceActivity,
    isLoading: activityLoading,
    error: activityError,
  } = useDeviceActivity(timeRange)

  // Process chart data when data changes
  useEffect(() => {
    const processedData: {
      temperatureData: any[]
      energyData: any[]
      deviceCounts: any[]
      roomActivity: any[]
    } = {
      temperatureData: [],
      energyData: [],
      deviceCounts: [],
      roomActivity: [],
    }

    // Process temperature sensor data
    if (sensorData && sensorData.length > 0) {
      const formatted = formatChartData(sensorData)
      processedData.temperatureData = aggregateDataByTime(formatted, 'hour')
    }

    // Process energy data
    if (energyData && energyData.length > 0) {
      const formatted = formatChartData(energyData)
      processedData.energyData = aggregateDataByTime(formatted, 'hour')
    }

    // Process entity counts for bar chart
    if (deviceActivityForCounts && deviceActivityForCounts.length > 0) {
      // Group by domain and count devices
      const domainCounts = deviceActivityForCounts.reduce((acc: any, item: any) => {
        const domain = item.domain
        if (!acc[domain]) {
          acc[domain] = 0
        }
        acc[domain]++
        return acc
      }, {})
      
      processedData.deviceCounts = Object.entries(domainCounts).map(([domain, count]) => ({
        category: domain,
        value: count as number,
        label: `${domain} devices`,
      }))
    }

    // Process room activity
    if (deviceActivity && deviceActivity.length > 0) {
      // Group by room/area
      const roomGroups = deviceActivity.reduce((acc: any, item: any) => {
        const room = item.area_name || 'Other'
        if (!acc[room]) {
          acc[room] = { category: room, value: 0 }
        }
        acc[room].value += 1
        return acc
      }, {})
      
      processedData.roomActivity = Object.values(roomGroups)
    }

    setChartData(processedData)
  }, [sensorData, energyData, deviceActivityForCounts, deviceActivity])

  const timeRangeOptions = [
    { value: '1h', label: 'Last hour' },
    { value: '6h', label: 'Last 6 hours' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last week' },
    { value: '30d', label: 'Last month' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Charts & Analytics
        </h2>
        <p className="mt-2 text-gray-600">
          Visualize your Home Assistant data with interactive charts
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label htmlFor="timeRange" className="form-label">
            Time range:
          </label>
          <select
            id="timeRange"
            className="form-input"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Temperature Trends */}
        <ChartContainer
          title="Temperature Trends"
          loading={sensorsLoading}
          error={sensorsError?.message}
          showFullscreenToggle
        >
          <LineChart
            data={chartData.temperatureData}
            xAxisKey="timestamp"
            lineKey="value"
            dataType="temperature"
            timeRange={timeRange}
            height={300}
          />
        </ChartContainer>

        {/* Energy Usage */}
        <ChartContainer
          title="Energy Usage"
          loading={energyLoading}
          error={energyError?.message}
          showFullscreenToggle
        >
          <LineChart
            data={chartData.energyData}
            xAxisKey="timestamp"
            lineKey="value"
            dataType="energy"
            timeRange={timeRange}
            color="#10B981"
            height={300}
          />
        </ChartContainer>

        {/* Device Distribution */}
        <ChartContainer
          title="Device Distribution by Type"
          loading={countsLoading}
          error={countsError?.message}
          showFullscreenToggle
        >
          <BarChart
            data={chartData.deviceCounts}
            xAxisKey="category"
            barKey="value"
            dataType="default"
            color="#3B82F6"
            height={300}
          />
        </ChartContainer>

        {/* Room Activity */}
        <ChartContainer
          title="Activity by Room"
          loading={activityLoading}
          error={activityError?.message}
          showFullscreenToggle
        >
          <BarChart
            data={chartData.roomActivity}
            xAxisKey="category"
            barKey="value"
            dataType="default"
            orientation="horizontal"
            color="#F59E0B"
            height={300}
          />
        </ChartContainer>
      </div>

      {/* Chart Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Chart Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-700">Line Charts</h4>
            <p className="text-sm text-gray-600">
              Perfect for visualizing sensor data trends over time. Touch and drag to pan, 
              pinch to zoom on mobile devices.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Bar Charts</h4>
            <p className="text-sm text-gray-600">
              Ideal for comparing categorical data like device counts by room or type. 
              Supports both vertical and horizontal orientations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Charts