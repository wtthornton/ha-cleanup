import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { 
  useSensorReadings, 
  useStateChanges, 
  useEnergyUsage,
  useDeviceActivity,
  useRecentActivity
} from '@/hooks/useInfluxData'

// Mock the HA Ingestor API client
const mockClient = {
  getSensorReadings: vi.fn(),
  getStateChanges: vi.fn(),
  getEnergyUsage: vi.fn(),
  getDeviceActivity: vi.fn(),
  getRecentActivity: vi.fn(),
  close: vi.fn()
}

vi.mock('@/services/ha-ingestor-api', () => ({
  HAIngestorAPIClient: vi.fn(() => mockClient)
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('InfluxDB Data Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSensorReadings', () => {
    test('should fetch sensor readings successfully', async () => {
      const mockData = [
        {
          _time: '2024-01-15T10:30:00Z',
          _value: 23.5,
          entity_id: 'sensor.living_room_temperature',
          device_class: 'temperature'
        }
      ]

      mockClient.getSensorReadings.mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useSensorReadings('1h', { device_class: 'temperature' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
    })

    test('should handle error states', async () => {
      mockClient.getSensorReadings.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(
        () => useSensorReadings('1h'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('useStateChanges', () => {
    test('should fetch state changes successfully', async () => {
      const mockData = [
        {
          _time: '2024-01-15T10:30:00Z',
          _value: 'on',
          entity_id: 'light.kitchen_main',
          domain: 'light'
        }
      ]

      mockClient.getStateChanges.mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useStateChanges('24h', { domain: 'light' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useEnergyUsage', () => {
    test('should fetch energy usage data successfully', async () => {
      const mockData = [
        {
          _time: '2024-01-15T10:00:00Z',
          _value: 1250.5,
          entity_id: 'sensor.home_energy_usage',
          unit_of_measurement: 'kWh'
        }
      ]

      mockClient.getEnergyUsage.mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useEnergyUsage('7d', { aggregate: 'daily' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useDeviceActivity', () => {
    test('should fetch device activity summary', async () => {
      const mockData = [
        {
          entity_id: 'light.kitchen_main',
          domain: 'light',
          _value: 25
        }
      ]

      mockClient.getDeviceActivity.mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useDeviceActivity('24h'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useRecentActivity', () => {
    test('should fetch recent activity with limit', async () => {
      const mockData = [
        {
          _time: '2024-01-15T10:30:00Z',
          _value: 'on',
          entity_id: 'light.kitchen_main',
          domain: 'light'
        }
      ]

      mockClient.getRecentActivity.mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useRecentActivity(100),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockClient.getRecentActivity).toHaveBeenCalledWith(100)
    })
  })
})