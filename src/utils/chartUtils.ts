import { format, parseISO, startOfHour, startOfDay } from 'date-fns'

export interface ChartDataPoint {
  timestamp: string
  value: number
  entity?: string
  [key: string]: any
}

export interface InfluxDataPoint {
  _time: string
  _value: number
  entity_id: string
  _field?: string
  [key: string]: any
}

/**
 * AI ASSISTANT CONTEXT: Chart utilities for processing and formatting Home Assistant
 * data for visualization components. Includes data transformation, aggregation,
 * and formatting functions optimized for mobile-first chart display.
 */

/**
 * Format InfluxDB query results for chart components
 */
export function formatChartData(influxData: InfluxDataPoint[]): ChartDataPoint[] {
  return influxData.map(point => ({
    timestamp: point._time,
    value: point._value,
    entity: point.entity_id,
  }))
}

/**
 * Aggregate data by time intervals (hour, day, week, month)
 */
export function aggregateDataByTime(
  data: ChartDataPoint[], 
  interval: 'hour' | 'day' | 'week' | 'month'
): ChartDataPoint[] {
  const grouped = new Map<string, { sum: number; count: number; timestamp: string }>()

  data.forEach(point => {
    let key: string
    let roundedTime: Date

    switch (interval) {
      case 'hour':
        roundedTime = startOfHour(parseISO(point.timestamp))
        key = roundedTime.toISOString()
        break
      case 'day':
        roundedTime = startOfDay(parseISO(point.timestamp))
        key = roundedTime.toISOString()
        break
      default:
        // Default to hour for unsupported intervals
        roundedTime = startOfHour(parseISO(point.timestamp))
        key = roundedTime.toISOString()
    }

    if (!grouped.has(key)) {
      grouped.set(key, { sum: 0, count: 0, timestamp: key })
    }

    const group = grouped.get(key)!
    group.sum += point.value
    group.count += 1
  })

  return Array.from(grouped.values())
    .map(group => ({
      timestamp: group.timestamp,
      value: group.sum / group.count, // Average
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

/**
 * Calculate moving average for smoothing data trends
 */
export function calculateMovingAverage(
  data: { value: number; [key: string]: any }[], 
  windowSize: number
): Array<{ movingAverage: number; [key: string]: any }> {
  const result: Array<{ movingAverage: number; [key: string]: any }> = []

  for (let i = windowSize - 1; i < data.length; i++) {
    const windowData = data.slice(i - windowSize + 1, i + 1)
    const average = windowData.reduce((sum, item) => sum + item.value, 0) / windowSize
    
    result.push({
      ...data[i],
      movingAverage: average,
    })
  }

  return result
}

/**
 * Format time axis labels based on time range
 */
export function formatTimeAxis(timestamp: string, timeRange: string): string {
  const date = parseISO(timestamp)

  // For short time ranges (minutes/hours), show time
  if (['5m', '15m', '1h', '6h'].includes(timeRange)) {
    return format(date, 'H:mm')
  }

  // For daily ranges, show date
  if (['24h'].includes(timeRange)) {
    return format(date, 'H:mm')
  }

  // For weekly/monthly ranges, show month-day
  if (['7d', '30d'].includes(timeRange)) {
    return format(date, 'MMM d')
  }

  // Default format
  return format(date, 'MMM d')
}

/**
 * Format value axis labels based on data type
 */
export function formatValueAxis(value: number, dataType: string): string {
  switch (dataType) {
    case 'temperature':
      return `${value.toFixed(1)}°C`
    
    case 'energy':
      if (value >= 1000) {
        return `${(value / 1000).toFixed(2)} kWh`
      }
      return `${value.toFixed(0)} Wh`
    
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`
    
    case 'humidity':
      return `${value.toFixed(1)}%`
    
    case 'pressure':
      return `${value.toFixed(0)} hPa`
    
    default:
      // Auto-format based on value range
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`
      }
      if (value % 1 === 0) {
        return value.toString()
      }
      return value.toFixed(1)
  }
}

/**
 * Get color palette for charts (mobile-friendly colors)
 */
export function getChartColors(index?: number): string | string[] {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
  ]

  if (typeof index === 'number') {
    return colors[index % colors.length]
  }

  return colors
}

/**
 * Calculate chart dimensions based on container and screen size
 */
export function getChartDimensions(containerWidth: number, isMobile: boolean) {
  const aspectRatio = isMobile ? 1.2 : 2.0 // Taller on mobile
  const height = Math.max(containerWidth / aspectRatio, isMobile ? 300 : 400)
  
  return {
    width: containerWidth,
    height: Math.min(height, isMobile ? 500 : 600), // Max height limits
  }
}

/**
 * Detect if data represents categorical vs continuous values
 */
export function isDataCategorical(data: ChartDataPoint[]): boolean {
  if (data.length === 0) return false
  
  // Check if values are mostly integers and limited in range
  const values = data.map(d => d.value)
  const uniqueValues = new Set(values)
  const allIntegers = values.every(v => Number.isInteger(v))
  
  return allIntegers && uniqueValues.size <= 10 && uniqueValues.size < data.length * 0.5
}