import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventItem from '@/components/events/EventItem'

describe('EventItem Component', () => {
  const mockEvent = {
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
  }

  const defaultProps = {
    event: mockEvent,
    onClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render event information', () => {
    const { container } = render(<EventItem {...defaultProps} />)
    
    expect(screen.getByText('Kitchen Main Light')).toBeInTheDocument()
    expect(screen.getByText('Kitchen Main Light turned on')).toBeInTheDocument()
    // Should show time format for recent events
    const timeElement = container.querySelector('time')
    expect(timeElement).toBeInTheDocument()
  })

  test('should display entity domain badge', () => {
    render(<EventItem {...defaultProps} />)
    
    const badge = screen.getByText('light')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  test('should show state transition for state_changed events', () => {
    render(<EventItem {...defaultProps} />)
    
    expect(screen.getByText('off')).toBeInTheDocument()
    expect(screen.getByText('on')).toBeInTheDocument()
    expect(screen.getByText('→')).toBeInTheDocument()
  })

  test('should handle click events', () => {
    render(<EventItem {...defaultProps} />)
    
    const eventItem = screen.getByTestId('event-item')
    fireEvent.click(eventItem)
    
    expect(defaultProps.onClick).toHaveBeenCalledWith(mockEvent)
  })

  test('should handle keyboard navigation', () => {
    render(<EventItem {...defaultProps} />)
    
    const eventItem = screen.getByTestId('event-item')
    
    fireEvent.keyDown(eventItem, { key: 'Enter' })
    expect(defaultProps.onClick).toHaveBeenCalledWith(mockEvent)
    
    fireEvent.keyDown(eventItem, { key: ' ' })
    expect(defaultProps.onClick).toHaveBeenCalledTimes(2)
  })

  test('should be touch-friendly', () => {
    render(<EventItem {...defaultProps} />)
    
    const eventItem = screen.getByTestId('event-item')
    expect(eventItem).toHaveClass('touch-target')
  })

  test('should show different icons for different event types', () => {
    render(<EventItem {...defaultProps} />)
    
    expect(screen.getByTestId('event-icon')).toBeInTheDocument()
  })

  test('should format timestamps relative to now', () => {
    const recentEvent = {
      ...mockEvent,
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    }
    
    render(<EventItem {...defaultProps} event={recentEvent} />)
    
    expect(screen.getByText(/\d+ minutes? ago/)).toBeInTheDocument()
  })

  test('should handle sensor events differently', () => {
    const sensorEvent = {
      ...mockEvent,
      entity: {
        id: 'sensor.temperature',
        friendlyName: 'Temperature Sensor',
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
    
    render(<EventItem {...defaultProps} event={sensorEvent} />)
    
    const badges = screen.getAllByText('sensor')
    // Check domain badge (first one)
    expect(badges[0]).toHaveClass('bg-green-100', 'text-green-800')
    // Check category badge (second one)
    expect(badges[1]).toHaveClass('bg-green-100', 'text-green-800')
  })

  test('should show automation events with special styling', () => {
    const automationEvent = {
      ...mockEvent,
      entity: {
        id: 'automation.morning_routine',
        friendlyName: 'Morning Routine',
        domain: 'automation',
      },
      event: {
        type: 'triggered',
        description: 'Morning routine automation triggered'
      },
      category: 'automation' as const
    }
    
    render(<EventItem {...defaultProps} event={automationEvent} />)
    
    const badges = screen.getAllByText('automation')
    // Check domain badge (first one)
    expect(badges[0]).toHaveClass('bg-blue-100', 'text-blue-800')
    // Check category badge (second one)
    expect(badges[1]).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  test('should be accessible with proper ARIA labels', () => {
    render(<EventItem {...defaultProps} />)
    
    const eventItem = screen.getByTestId('event-item')
    expect(eventItem).toHaveAttribute('role', 'button')
    expect(eventItem).toHaveAttribute('tabIndex', '0')
    expect(eventItem).toHaveAttribute('aria-label')
  })

  test('should show hover and focus states', () => {
    render(<EventItem {...defaultProps} />)
    
    const eventItem = screen.getByTestId('event-item')
    expect(eventItem).toHaveClass('hover:bg-gray-50', 'focus:bg-gray-50')
  })
})