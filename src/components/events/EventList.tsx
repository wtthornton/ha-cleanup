
import EventItem from './EventItem'
import { EventDisplayItem } from '@/types/app'

interface EventListProps {
  events: EventDisplayItem[]
  loading?: boolean
  error?: string | null
  hasMore?: boolean
  onEventClick: (event: EventDisplayItem) => void
  onLoadMore?: () => void
}

/**
 * AI ASSISTANT CONTEXT: Event list component that displays Home Assistant events
 * in chronological order with mobile-first design.
 * 
 * Key features:
 * - Chronological display (most recent first)
 * - Mobile-friendly touch targets
 * - Loading and error states
 * - Pagination with "Load More" button
 * - Empty state handling
 * - Keyboard navigation support
 */
function EventList({ 
  events, 
  loading = false, 
  error = null, 
  hasMore = false,
  onEventClick,
  onLoadMore 
}: EventListProps) {


  const handleEventClick = (event: EventDisplayItem) => {
    onEventClick(event)
  }

  // Loading state
  if (loading && events.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <div 
          className='h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600'
          data-testid='loading-spinner'
        />
        <p className='mt-4 text-sm text-gray-600'>Loading events...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center'>
        <div className='mx-auto mb-4 h-12 w-12 text-red-400'>
          <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path 
              strokeLinecap='round' 
              strokeLinejoin='round' 
              strokeWidth={2} 
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-red-900'>
          Error loading events
        </h3>
        <p className='text-sm text-red-700'>{error}</p>
      </div>
    )
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto mb-4 h-12 w-12 text-gray-400'>
          <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path 
              strokeLinecap='round' 
              strokeLinejoin='round' 
              strokeWidth={2} 
              d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' 
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900'>
          No events found
        </h3>
        <p className='text-sm text-gray-600'>
          Try adjusting your filters or time range
        </p>
      </div>
    )
  }

  // Sort events by timestamp (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  )

  return (
    <div className='space-y-4'>
      {/* Events list */}
      <div className='space-y-3'>
        {sortedEvents.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onClick={handleEventClick}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className='flex justify-center pt-4'>
          <button
            onClick={onLoadMore}
            disabled={loading}
            className='btn-outline flex items-center space-x-2 disabled:opacity-50'
          >
            {loading && (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-600' />
            )}
            <span>Load More Events</span>
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && events.length > 0 && (
        <div className='flex justify-center py-4'>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600' />
            <span>Loading more events...</span>
          </div>
        </div>
      )}

      {/* Event count */}
      <div className='text-center text-xs text-gray-500'>
        Showing {events.length} events
      </div>
    </div>
  )
}

export default EventList