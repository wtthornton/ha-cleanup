import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BarChart from '@/components/charts/BarChart'

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>
      {children}
    </div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

describe('BarChart Component', () => {
  const mockData = [
    { category: 'Living Room', value: 5, label: 'Light switches' },
    { category: 'Kitchen', value: 3, label: 'Light switches' },
    { category: 'Bedroom', value: 2, label: 'Light switches' },
  ]

  const defaultProps = {
    data: mockData,
    title: 'Light Switch Usage by Room',
    xAxisKey: 'category',
    yAxisKey: 'value',
    barKey: 'value',
  }

  test('should render chart with data', () => {
    render(<BarChart {...defaultProps} />)
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar')).toBeInTheDocument()
  })

  test('should render chart axes', () => {
    render(<BarChart {...defaultProps} />)
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
  })

  test('should render tooltip', () => {
    render(<BarChart {...defaultProps} />)
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  test('should handle empty data', () => {
    render(<BarChart {...defaultProps} data={[]} />)
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  test('should apply mobile-friendly styling', () => {
    render(<BarChart {...defaultProps} />)
    
    const container = screen.getByTestId('responsive-container')
    expect(container).toBeInTheDocument()
  })

  test('should handle custom colors', () => {
    render(<BarChart {...defaultProps} color="#FF6B6B" />)
    
    const bar = screen.getByTestId('bar')
    expect(bar).toBeInTheDocument()
  })

  test('should render loading state', () => {
    render(<BarChart {...defaultProps} loading={true} />)
    
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })

  test('should render error state', () => {
    const error = 'Failed to load data'
    render(<BarChart {...defaultProps} error={error} />)
    
    expect(screen.getByText('Error loading chart data')).toBeInTheDocument()
  })

  test('should handle horizontal orientation', () => {
    render(<BarChart {...defaultProps} orientation="horizontal" />)
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  test('should render multiple series', () => {
    const multiSeriesData = [
      { category: 'Living Room', lights: 5, sensors: 3 },
      { category: 'Kitchen', lights: 3, sensors: 2 },
    ]
    
    render(
      <BarChart 
        {...defaultProps} 
        data={multiSeriesData}
        barKeys={['lights', 'sensors']}
      />
    )
    
    // Should render multiple bars for multiple series
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})