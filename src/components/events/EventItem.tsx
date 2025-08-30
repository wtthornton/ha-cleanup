import React from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { EventDisplayItem } from '@/types/app'

interface EventItemProps {
  event: EventDisplayItem
  onClick: (event: EventDisplayItem) => void
}

const categoryColors = {
  automation: 'bg-blue-100 text-blue-800',
  sensor: 'bg-green-100 text-green-800',
  security: 'bg-red-100 text-red-800',
  climate: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
}

const domainColors = {
  light: 'bg-yellow-100 text-yellow-800',
  switch: 'bg-orange-100 text-orange-800',
  sensor: 'bg-green-100 text-green-800',
  binary_sensor: 'bg-teal-100 text-teal-800',
  climate: 'bg-purple-100 text-purple-800',
  automation: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
}

/**
 * AI ASSISTANT CONTEXT: Individual event item component for displaying
 * Home Assistant events in a mobile-friendly format.
 * 
 * Key features:
 * - Touch-friendly minimum height (44px)
 * - Chronological display with relative timestamps
 * - Color-coded badges for domains and categories
 * - State transition display for state_changed events
 * - Keyboard navigation support
 * - Accessible with proper ARIA labels
 */
function EventItem({ event, onClick }: EventItemProps) {
  const handleClick = () => {
    onClick(event)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(event)
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 60) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else if (diffInMinutes < 24 * 60) {
      return format(date, 'h:mm a')
    } else {
      return format(date, 'MMM d, h:mm a')
    }
  }

  const getEventIcon = () => {
    switch (event.category) {
      case 'automation':
        return '🤖'
      case 'sensor':
        return '📊'
      case 'security':
        return '🔒'
      case 'climate':
        return '🌡️'
      default:
        return '📱'
    }
  }

  const domainColor = domainColors[event.entity.domain as keyof typeof domainColors] || domainColors.default
  const categoryColor = categoryColors[event.category]

  return (
    <div
      className='touch-target cursor-pointer rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role='button'
      tabIndex={0}
      aria-label={`${event.entity.friendlyName} - ${event.event.description} at ${formatTimestamp(event.timestamp)}`}
      data-testid='event-item'
    >
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>
          <span className='text-lg' data-testid='event-icon'>
            {event.icon || getEventIcon()}
          </span>
        </div>
        
        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <h3 className='truncate text-sm font-medium text-gray-900'>
                {event.entity.friendlyName}
              </h3>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${domainColor}`}>
                {event.entity.domain}
              </span>
            </div>
            <time className='flex-shrink-0 text-xs text-gray-500'>
              {formatTimestamp(event.timestamp)}
            </time>
          </div>
          
          <p className='mt-1 text-sm text-gray-600 line-clamp-2'>
            {event.event.description}
          </p>
          
          {event.event.from && event.event.to && (
            <div className='mt-2 flex items-center space-x-2 text-xs text-gray-500'>
              <span className='rounded bg-gray-100 px-2 py-1 font-mono'>
                {event.event.from}
              </span>
              <span>→</span>
              <span className='rounded bg-gray-100 px-2 py-1 font-mono'>
                {event.event.to}
              </span>
            </div>
          )}
          
          <div className='mt-2 flex items-center justify-between'>
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${categoryColor}`}>
              {event.category}
            </span>
            <span className='text-xs text-gray-400'>
              {event.entity.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventItem