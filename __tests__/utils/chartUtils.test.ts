import { describe, test, expect } from 'vitest'
import {
  formatChartData,
  aggregateDataByTime,
  calculateMovingAverage,
  formatTimeAxis,
  formatValueAxis,
  getChartColors
} from '@/utils/chartUtils'

describe('Chart Utilities', () => {
  describe('formatChartData', () => {
    test('should format InfluxDB data for charts', () => {
      const influxData = [
        {
          _time: '2024-01-15T10:00:00Z',
          _value: 23.5,
          entity_id: 'sensor.temperature',
          _field: 'value'
        },
        {
          _time: '2024-01-15T11:00:00Z',
          _value: 24.1,
          entity_id: 'sensor.temperature',
          _field: 'value'
        }
      ]

      const result = formatChartData(influxData)
      
      expect(result).toEqual([
        { timestamp: '2024-01-15T10:00:00Z', value: 23.5, entity: 'sensor.temperature' },
        { timestamp: '2024-01-15T11:00:00Z', value: 24.1, entity: 'sensor.temperature' }
      ])
    })
  })

  describe('aggregateDataByTime', () => {
    test('should aggregate data by hour', () => {
      const data = [
        { timestamp: '2024-01-15T10:15:00Z', value: 23.5 },
        { timestamp: '2024-01-15T10:45:00Z', value: 24.0 },
        { timestamp: '2024-01-15T11:15:00Z', value: 24.5 },
      ]

      const result = aggregateDataByTime(data, 'hour')
      
      expect(result).toHaveLength(2)
      expect(result[0].value).toBe(23.75) // Average of 23.5 and 24.0
      expect(result[1].value).toBe(24.5)
    })

    test('should aggregate data by day', () => {
      const data = [
        { timestamp: '2024-01-15T10:00:00Z', value: 23.5 },
        { timestamp: '2024-01-15T14:00:00Z', value: 24.0 },
        { timestamp: '2024-01-16T10:00:00Z', value: 22.5 },
      ]

      const result = aggregateDataByTime(data, 'day')
      
      expect(result).toHaveLength(2)
      expect(result[0].value).toBe(23.75) // Average of day 1
      expect(result[1].value).toBe(22.5)  // Average of day 2
    })
  })

  describe('calculateMovingAverage', () => {
    test('should calculate moving average', () => {
      const data = [
        { value: 10 },
        { value: 20 },
        { value: 30 },
        { value: 40 },
        { value: 50 }
      ]

      const result = calculateMovingAverage(data, 3)
      
      expect(result).toHaveLength(3)
      expect(result[0].movingAverage).toBe(20) // (10+20+30)/3
      expect(result[1].movingAverage).toBe(30) // (20+30+40)/3
      expect(result[2].movingAverage).toBe(40) // (30+40+50)/3
    })
  })

  describe('formatTimeAxis', () => {
    test('should format time for short ranges', () => {
      const timestamp = '2024-01-15T10:30:00Z'
      const result = formatTimeAxis(timestamp, '1h')
      
      // Should format time correctly (may vary by timezone)
      expect(result).toMatch(/^\d{1,2}:\d{2}$/)
    })

    test('should format time for daily ranges', () => {
      const timestamp = '2024-01-15T10:30:00Z'
      const result = formatTimeAxis(timestamp, '7d')
      
      expect(result).toMatch(/^Jan \d{1,2}$/)
    })
  })

  describe('formatValueAxis', () => {
    test('should format temperature values', () => {
      const result = formatValueAxis(23.456, 'temperature')
      expect(result).toBe('23.5°C')
    })

    test('should format energy values', () => {
      const result = formatValueAxis(1234.567, 'energy')
      expect(result).toBe('1.23 kWh')
    })

    test('should format percentage values', () => {
      const result = formatValueAxis(0.856, 'percentage')
      expect(result).toBe('85.6%')
    })
  })

  describe('getChartColors', () => {
    test('should return color palette', () => {
      const colors = getChartColors()
      
      expect(colors).toHaveLength(8)
      expect(colors[0]).toBe('#3B82F6') // Primary blue
    })

    test('should return color by index', () => {
      const color = getChartColors(2)
      expect(typeof color).toBe('string')
      expect(color).toMatch(/^#[0-9A-F]{6}$/)
    })
  })
})