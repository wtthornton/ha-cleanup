import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EventList from '@/components/events/EventList'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('EventList Component', () => {
  const mockEvents = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      entity: {
        id: 'light.kitchen_main',
        friendlyName: 'Kitchen Main Light',
        domain: 'light',
        deviceClass: 'light'
      },
      event: {
        type: 'state_changed',
        from: 'off',
        to: 'on',
        description: 'Kitchen Main Light turned on'
      },
      category: 'automation' as const
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.5), // 5.5 hours ago
      entity: {
        id: 'sensor.living_room_temperature',
        friendlyName: 'Living Room Temperature',
        domain: 'sensor',
        deviceClass: 'temperature'
      },
      event: {
        type: 'state_changed',
        from: '22.1',
        to: '22.3',
        description: 'Temperature changed to 22.3°C'
      },
      category: 'sensor' as const
    }
  ]

  const defaultProps = {
    events: mockEvents,
    loading: false,
    error: null,
    onEventClick: vi.fn(),
    onLoadMore: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render event list with events', () => {
    renderWithRouter(<EventList {...defaultProps} />)
    
    expect(screen.getByText('Kitchen Main Light')).toBeInTheDocument()
    expect(screen.getByText('Living Room Temperature')).toBeInTheDocument()
    expect(screen.getByText('Kitchen Main Light turned on')).toBeInTheDocument()
  })

  test('should display events in chronological order', () => {
    renderWithRouter(<EventList {...defaultProps} />)
    
    const eventItems = screen.getAllByTestId('event-item')
    expect(eventItems).toHaveLength(2)
    
    // First event should be more recent (Kitchen Light at 10:30)
    expect(eventItems[0]).toHaveTextContent('Kitchen Main Light')
    expect(eventItems[1]).toHaveTextContent('Living Room Temperature')
  })

  test('should show event timestamps', () => {
    const { container } = renderWithRouter(<EventList {...defaultProps} />)
    
    // Should show time format for recent events
    const timeElements = container.querySelectorAll('time')
    expect(timeElements).toHaveLength(2)
  })

  test('should display event categories with appropriate styling', () => {
    renderWithRouter(<EventList {...defaultProps} />)
    
    const automationBadges = screen.getAllByText('automation')
    const sensorBadges = screen.getAllByText('sensor')
    
    // Check first automation badge (could be domain or category)
    expect(automationBadges[0]).toHaveClass('bg-blue-100', 'text-blue-800')
    // Check first sensor badge (could be domain or category)
    expect(sensorBadges[0]).toHaveClass('bg-green-100', 'text-green-800')
  })

  test('should handle event clicks', () => {
    const mockOnClick = vi.fn()
    const props = { ...defaultProps, onEventClick: mockOnClick }
    renderWithRouter(<EventList {...props} />)
    
    const firstEvent = screen.getAllByTestId('event-item')[0]
    fireEvent.click(firstEvent)
    
    expect(mockOnClick).toHaveBeenCalledWith(mockEvents[0])
  })

  test('should show loading state', () => {
    renderWithRouter(<EventList {...defaultProps} events={[]} loading={true} />)
    
    expect(screen.getByText('Loading events...')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  test('should show error state', () => {
    const error = 'Failed to load events'
    renderWithRouter(<EventList {...defaultProps} error={error} />)
    
    expect(screen.getByText('Error loading events')).toBeInTheDocument()
    expect(screen.getByText(error)).toBeInTheDocument()
  })

  test('should show empty state', () => {
    renderWithRouter(<EventList {...defaultProps} events={[]} />)
    
    expect(screen.getByText('No events found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or time range')).toBeInTheDocument()
  })

  test('should have touch-friendly event items', () => {
    renderWithRouter(<EventList {...defaultProps} />)
    
    const eventItems = screen.getAllByTestId('event-item')
    eventItems.forEach(item => {
      expect(item).toHaveClass('touch-target')
    })
  })

  test('should show load more button when has more events', () => {
    const mockOnLoadMore = vi.fn()
    const props = { ...defaultProps, hasMore: true, onLoadMore: mockOnLoadMore }
    renderWithRouter(<EventList {...props} />)
    
    const loadMoreButton = screen.getByText('Load More Events')
    expect(loadMoreButton).toBeInTheDocument()
    
    fireEvent.click(loadMoreButton)
    expect(mockOnLoadMore).toHaveBeenCalled()
  })

  test('should be accessible with keyboard navigation', () => {
    const mockOnClick = vi.fn()
    const props = { ...defaultProps, onEventClick: mockOnClick }
    renderWithRouter(<EventList {...props} />)
    
    const firstEvent = screen.getAllByTestId('event-item')[0]
    firstEvent.focus()
    
    fireEvent.keyDown(firstEvent, { key: 'Enter' })
    expect(mockOnClick).toHaveBeenCalledTimes(1)
    
    fireEvent.keyDown(firstEvent, { key: ' ' })
    expect(mockOnClick).toHaveBeenCalledTimes(2)
  })
})