import { describe, test, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChartContainer from '@/components/charts/ChartContainer'

describe('ChartContainer Component', () => {
  const defaultProps = {
    title: 'Test Chart',
    children: <div data-testid="chart-content">Chart Content</div>,
  }

  test('should render chart with title', () => {
    render(<ChartContainer {...defaultProps} />)
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
    expect(screen.getByTestId('chart-content')).toBeInTheDocument()
  })

  test('should be mobile responsive', () => {
    render(<ChartContainer {...defaultProps} />)
    
    const container = screen.getByTestId('chart-container')
    expect(container).toHaveClass('chart-container')
  })

  test('should support fullscreen toggle', () => {
    render(<ChartContainer {...defaultProps} showFullscreenToggle />)
    
    const fullscreenButton = screen.getByLabelText('Toggle fullscreen')
    expect(fullscreenButton).toBeInTheDocument()
    
    fireEvent.click(fullscreenButton)
    expect(screen.getByTestId('chart-container')).toHaveClass('fullscreen')
  })

  test('should show loading state', () => {
    render(<ChartContainer {...defaultProps} loading />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('should show error state', () => {
    render(<ChartContainer {...defaultProps} error="Chart error" />)
    
    expect(screen.getByText('Chart error')).toBeInTheDocument()
  })
})