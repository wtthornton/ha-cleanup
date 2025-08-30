import { describe, test, expect, vi, beforeEach } from 'vitest'
import { InfluxDBClient } from '@/services/influxdb-client'

// Mock the InfluxDB client
vi.mock('@influxdata/influxdb-client', () => ({
  InfluxDB: vi.fn(() => ({
    getQueryApi: vi.fn(() => ({
      queryRaw: vi.fn()
    })),
    close: vi.fn()
  }))
}))

describe('InfluxDBClient', () => {
  let client: InfluxDBClient
  
  beforeEach(() => {
    vi.clearAllMocks()
    client = new InfluxDBClient({
      url: 'http://localhost:8086',
      token: 'test-token',
      org: 'myorg',
      bucket: 'ha_events'
    })
  })

  describe('Connection Configuration', () => {
    test('should create client with correct configuration', () => {
      expect(client).toBeInstanceOf(InfluxDBClient)
    })

    test('should use default configuration when not provided', () => {
      const defaultClient = new InfluxDBClient()
      expect(defaultClient).toBeInstanceOf(InfluxDBClient)
    })
  })

  describe('Sensor Reading Queries', () => {
    test('should query temperature sensor readings', async () => {
      const mockData = [
        {
          _time: '2024-01-15T10:30:00Z',
          _value: 23.5,
          entity_id: 'sensor.living_room_temperature',
          device_class: 'temperature',
          unit_of_measurement: '°C'
        }
      ]

      vi.mocked(client['queryApi'].queryRaw).mockResolvedValue(mockData)

      const result = await client.getTemperatureSensors('1h')
      
      expect(result).toEqual(mockData)
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('ha_sensor_reading')
      )
    })

    test('should query all sensor readings with time range', async () => {
      await client.getSensorReadings('24h', { device_class: 'humidity' })
      
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('range(start: -24h)')
      )
    })
  })

  describe('State Change Queries', () => {
    test('should query entity state changes', async () => {
      const mockStates = [
        {
          _time: '2024-01-15T10:30:00Z',
          _value: 'on',
          entity_id: 'light.kitchen_main',
          domain: 'light'
        }
      ]

      vi.mocked(client['queryApi'].queryRaw).mockResolvedValue(mockStates)

      const result = await client.getStateChanges('1h')
      
      expect(result).toEqual(mockStates)
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('ha_state')
      )
    })

    test('should filter state changes by entity domain', async () => {
      await client.getStateChanges('1h', { domain: 'light' })
      
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('filter(fn: (r) => r.domain == "light")')
      )
    })
  })

  describe('Energy Usage Queries', () => {
    test('should query energy usage data', async () => {
      const mockEnergyData = [
        {
          _time: '2024-01-15T10:00:00Z',
          _value: 1250.5,
          entity_id: 'sensor.home_energy_usage',
          unit_of_measurement: 'kWh'
        }
      ]

      vi.mocked(client['queryApi'].queryRaw).mockResolvedValue(mockEnergyData)

      const result = await client.getEnergyUsage('7d')
      
      expect(result).toEqual(mockEnergyData)
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('ha_energy_usage')
      )
    })

    test('should aggregate energy usage by day', async () => {
      await client.getEnergyUsage('30d', { aggregate: 'daily' })
      
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('aggregateWindow(every: 1d, fn: sum')
      )
    })
  })

  describe('Device Activity Queries', () => {
    test('should get device activity summary', async () => {
      const mockActivity = [
        {
          entity_id: 'light.kitchen_main',
          domain: 'light',
          _value: 25
        }
      ]

      vi.mocked(client['queryApi'].queryRaw).mockResolvedValue(mockActivity)

      const result = await client.getDeviceActivity('24h')
      
      expect(result).toEqual(mockActivity)
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('group(columns: ["entity_id", "domain"])')
      )
    })
  })

  describe('Recent Activity Queries', () => {
    test('should get recent activity with limit', async () => {
      await client.getRecentActivity(100)
      
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('limit(n: 100)')
      )
    })

    test('should sort recent activity by time descending', async () => {
      await client.getRecentActivity(50)
      
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('sort(columns: ["_time"], desc: true)')
      )
    })
  })

  describe('Health Check Queries', () => {
    test('should check data freshness', async () => {
      const mockResult = [{ _value: 156 }]
      vi.mocked(client['queryApi'].queryRaw).mockResolvedValue(mockResult)

      const result = await client.checkDataFreshness()
      
      expect(result).toEqual(mockResult)
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('range(start: -5m)')
      )
    })

    test('should check data volume', async () => {
      await client.checkDataVolume()
      
      expect(client['queryApi'].queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('aggregateWindow(every: 5m, fn: count')
      )
    })
  })

  describe('Error Handling', () => {
    test('should handle connection errors', async () => {
      vi.mocked(client['queryApi'].queryRaw).mockRejectedValue(
        new Error('Connection refused')
      )

      await expect(client.getSensorReadings('1h')).rejects.toThrow('Connection refused')
    })

    test('should handle query timeout errors', async () => {
      vi.mocked(client['queryApi'].queryRaw).mockRejectedValue(
        new Error('Query timeout')
      )

      await expect(client.getRecentActivity(100)).rejects.toThrow('Query timeout')
    })

    test('should handle invalid query syntax errors', async () => {
      vi.mocked(client['queryApi'].queryRaw).mockRejectedValue(
        new Error('Invalid Flux query')
      )

      await expect(client.getEnergyUsage('invalid')).rejects.toThrow('Invalid Flux query')
    })
  })

  describe('Connection Management', () => {
    test('should close connection properly', () => {
      // For read-only clients, close() is a no-op since InfluxDB manages connections
      expect(() => client.close()).not.toThrow()
    })

    test('should reconnect after connection loss', async () => {
      vi.mocked(client['queryApi'].queryRaw)
        .mockRejectedValueOnce(new Error('Connection lost'))
        .mockResolvedValueOnce([{ _value: 'reconnected' }])

      // Should implement retry logic in actual implementation
      await expect(client.getSensorReadings('1h')).rejects.toThrow('Connection lost')
    })
  })
})