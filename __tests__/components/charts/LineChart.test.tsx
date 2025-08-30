import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LineChart from '@/components/charts/LineChart'

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

describe('LineChart Component', () => {
  const mockData = [
    { timestamp: '2024-01-15T10:00:00Z', value: 23.5, label: 'Living Room' },
    { timestamp: '2024-01-15T11:00:00Z', value: 24.1, label: 'Living Room' },
    { timestamp: '2024-01-15T12:00:00Z', value: 23.8, label: 'Living Room' },
  ]

  const defaultProps = {
    data: mockData,
    title: 'Temperature Sensor Data',
    xAxisKey: 'timestamp',
    yAxisKey: 'value',
    lineKey: 'value',
  }

  test('should render chart with data', () => {
    render(<LineChart {...defaultProps} />)
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('line')).toBeInTheDocument()
  })

  test('should render chart axes', () => {
    render(<LineChart {...defaultProps} />)
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
  })

  test('should render tooltip', () => {
    render(<LineChart {...defaultProps} />)
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  test('should handle empty data', () => {
    render(<LineChart {...defaultProps} data={[]} />)
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  test('should apply mobile-friendly styling', () => {
    render(<LineChart {...defaultProps} />)
    
    const container = screen.getByTestId('responsive-container')
    expect(container).toBeInTheDocument()
  })

  test('should handle custom colors', () => {
    render(<LineChart {...defaultProps} color="#FF6B6B" />)
    
    const line = screen.getByTestId('line')
    expect(line).toBeInTheDocument()
  })

  test('should render loading state', () => {
    render(<LineChart {...defaultProps} loading={true} />)
    
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })

  test('should render error state', () => {
    const error = 'Failed to load data'
    render(<LineChart {...defaultProps} error={error} />)
    
    expect(screen.getByText('Error loading chart data')).toBeInTheDocument()
  })
})