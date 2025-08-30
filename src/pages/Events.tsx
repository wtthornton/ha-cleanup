import { useState, useEffect } from 'react'
import EventList from '@/components/events/EventList'
import EventFilters from '@/components/events/EventFilters'
import { EventDisplayItem, EventFilters as EventFiltersType } from '@/types/app'
import { StateChange } from '@/services/influxdb-client'
import { useStateChanges } from '@/hooks/useInfluxData'

/**
 * AI ASSISTANT CONTEXT: Events page component for browsing and filtering
 * Home Assistant historical events. Features mobile-first design with
 * chronological display, search, filtering, and pagination.
 * 
 * Key features:
 * - Mobile-friendly event list with touch-friendly items
 * - Advanced search and filter capabilities
 * - Chronological event display with pagination
 * - Loading and error states
 * - Real-time data integration with InfluxDB
 */
function Events() {
  const [filters, setFilters] = useState<EventFiltersType>({
    timeRange: '1d',
    searchTerm: '',
    eventTypes: [],
    domain: '',
    sortBy: 'timestamp',
    sortOrder: 'desc',
  })

  const [page, setPage] = useState(1)
  const [displayEvents, setDisplayEvents] = useState<EventDisplayItem[]>([])
  const eventsPerPage = 50

  // Fetch events from InfluxDB based on filters
  const {
    data: influxEvents,
    isLoading,
    error,
    refetch,
  } = useStateChanges(filters.timeRange, {
    domain: filters.domain || undefined,
    entity_id: filters.searchTerm ? undefined : undefined, // Will be filtered client-side for now
  })

  // Transform InfluxDB data to display format
  useEffect(() => {
    if (!influxEvents) {
      setDisplayEvents([])
      return
    }

    const transformedEvents: EventDisplayItem[] = influxEvents.map((event: StateChange, index) => ({
      id: `${event.entity_id}-${event._time}-${index}`,
      timestamp: new Date(event._time),
      entity: {
        id: event.entity_id,
        friendlyName: event.friendly_name || event.entity_id.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        domain: event.domain,
      },
      event: {
        type: 'state_changed',
        from: event.last_changed !== event.last_updated ? 'previous' : undefined,
        to: event._value,
        description: `${event.friendly_name || event.entity_id} changed to ${event._value}`,
      },
      category: getCategoryFromDomain(event.domain),
    }))

    // Apply client-side filtering
    let filtered = transformedEvents

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(event => 
        event.entity.friendlyName.toLowerCase().includes(searchLower) ||
        event.entity.id.toLowerCase().includes(searchLower) ||
        event.event.description.toLowerCase().includes(searchLower)
      )
    }

    // Event type filter
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filtered = filtered.filter(event => 
        filters.eventTypes!.includes(event.event.type)
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'entity_id':
          aValue = a.entity.id
          bValue = b.entity.id
          break
        case 'domain':
          aValue = a.entity.domain
          bValue = b.entity.domain
          break
        default:
          aValue = a.timestamp.getTime()
          bValue = b.timestamp.getTime()
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setDisplayEvents(filtered)
  }, [influxEvents, filters])

  const getCategoryFromDomain = (domain: string): EventDisplayItem['category'] => {
    switch (domain) {
      case 'automation':
        return 'automation'
      case 'sensor':
      case 'binary_sensor':
        return 'sensor'
      case 'alarm_control_panel':
      case 'lock':
        return 'security'
      case 'climate':
      case 'weather':
        return 'climate'
      default:
        return 'other'
    }
  }

  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleResetFilters = () => {
    setFilters({
      timeRange: '1d',
      searchTerm: '',
      eventTypes: [],
      domain: '',
      sortBy: 'timestamp',
      sortOrder: 'desc',
    })
    setPage(1)
  }

  const handleEventClick = (event: EventDisplayItem) => {
    // Handle event click - could show details modal or navigate
    console.log('Event clicked:', event)
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  // Calculate pagination
  const startIndex = (page - 1) * eventsPerPage
  const endIndex = startIndex + eventsPerPage
  const paginatedEvents = displayEvents.slice(0, endIndex)
  const hasMore = endIndex < displayEvents.length

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Events
        </h2>
        <p className='mt-2 text-gray-600'>
          Browse and search through your Home Assistant event history
        </p>
      </div>

      {/* Filters */}
      <div className='card'>
        <EventFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Events List */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='text-lg font-medium text-gray-900'>
            Events
          </h3>
          {!isLoading && (
            <p className='text-sm text-gray-600'>
              Showing {paginatedEvents.length} of {displayEvents.length} events
            </p>
          )}
        </div>
        
        <EventList
          events={paginatedEvents}
          loading={isLoading}
          error={error?.message}
          hasMore={hasMore}
          onEventClick={handleEventClick}
          onLoadMore={handleLoadMore}
        />
      </div>

      {/* Refresh Button */}
      <div className='flex justify-center'>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className='btn-secondary disabled:opacity-50'
        >
          {isLoading ? 'Refreshing...' : 'Refresh Events'}
        </button>
      </div>
    </div>
  )
}

export default Events