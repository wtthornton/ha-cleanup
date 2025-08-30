import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventFilters from '@/components/events/EventFilters'

describe('EventFilters Component', () => {
  const defaultFilters = {
    timeRange: '1h' as const,
    searchTerm: '',
    eventTypes: [],
    domain: '',
    sortBy: 'timestamp' as const,
    sortOrder: 'desc' as const,
  }

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: vi.fn(),
    onReset: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render all filter controls', () => {
    render(<EventFilters {...defaultProps} />)
    
    expect(screen.getByLabelText('Search events')).toBeInTheDocument()
    expect(screen.getByLabelText('Time range')).toBeInTheDocument()
    expect(screen.getByLabelText('Domain')).toBeInTheDocument()
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument()
  })

  test('should handle search term changes', () => {
    render(<EventFilters {...defaultProps} />)
    
    const searchInput = screen.getByLabelText('Search events')
    fireEvent.change(searchInput, { target: { value: 'kitchen' } })
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      searchTerm: 'kitchen'
    })
  })

  test('should handle time range changes', () => {
    render(<EventFilters {...defaultProps} />)
    
    const timeRangeSelect = screen.getByLabelText('Time range')
    fireEvent.change(timeRangeSelect, { target: { value: '24h' } })
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      timeRange: '24h'
    })
  })

  test('should handle domain filter changes', () => {
    render(<EventFilters {...defaultProps} />)
    
    const domainSelect = screen.getByLabelText('Domain')
    fireEvent.change(domainSelect, { target: { value: 'light' } })
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      domain: 'light'
    })
  })

  test('should handle sort changes', () => {
    render(<EventFilters {...defaultProps} />)
    
    const sortSelect = screen.getByLabelText('Sort by')
    fireEvent.change(sortSelect, { target: { value: 'entity_id' } })
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sortBy: 'entity_id'
    })
  })

  test('should toggle sort order', () => {
    render(<EventFilters {...defaultProps} />)
    
    const sortOrderButton = screen.getByLabelText('Toggle sort order')
    fireEvent.click(sortOrderButton)
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sortOrder: 'asc'
    })
  })

  test('should show active filter count', () => {
    const filtersWithActive = {
      ...defaultFilters,
      searchTerm: 'kitchen',
      domain: 'light',
    }
    
    render(<EventFilters {...defaultProps} filters={filtersWithActive} />)
    
    expect(screen.getByText('2 filters active')).toBeInTheDocument()
  })

  test('should handle reset filters', () => {
    const filtersWithActive = {
      ...defaultFilters,
      searchTerm: 'kitchen',
      domain: 'light'
    }
    
    render(<EventFilters {...defaultProps} filters={filtersWithActive} />)
    
    const resetButton = screen.getByText('Reset Filters')
    fireEvent.click(resetButton)
    
    expect(defaultProps.onReset).toHaveBeenCalled()
  })

  test('should be mobile responsive', () => {
    render(<EventFilters {...defaultProps} />)
    
    const container = screen.getByTestId('event-filters')
    expect(container).toHaveClass('space-y-4')
    
    const filtersRow = container.querySelector('.flex.flex-col.space-y-4.sm\\:flex-row')
    expect(filtersRow).toBeInTheDocument()
  })

  test('should have touch-friendly controls', () => {
    render(<EventFilters {...defaultProps} />)
    
    const searchInput = screen.getByLabelText('Search events')
    const selects = screen.getAllByRole('combobox')
    
    expect(searchInput).toHaveClass('form-input')
    selects.forEach(select => {
      expect(select).toHaveClass('form-input')
    })
  })

  test('should show event type checkboxes when advanced filters are open', () => {
    render(<EventFilters {...defaultProps} />)
    
    // Open advanced filters
    const advancedToggle = screen.getByText('Advanced Filters')
    fireEvent.click(advancedToggle)
    
    expect(screen.getByLabelText('State Changes')).toBeInTheDocument()
    expect(screen.getByLabelText('Automations')).toBeInTheDocument()
    expect(screen.getByLabelText('Service Calls')).toBeInTheDocument()
  })

  test('should handle event type selection', () => {
    render(<EventFilters {...defaultProps} />)
    
    // Open advanced filters first
    const advancedToggle = screen.getByText('Advanced Filters')
    fireEvent.click(advancedToggle)
    
    const stateChangeCheckbox = screen.getByLabelText('State Changes')
    fireEvent.click(stateChangeCheckbox)
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      eventTypes: ['state_changed']
    })
  })

  test('should show clear search button when search has value', () => {
    const filtersWithSearch = {
      ...defaultFilters,
      searchTerm: 'kitchen',
    }
    
    render(<EventFilters {...defaultProps} filters={filtersWithSearch} />)
    
    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      searchTerm: ''
    })
  })
})