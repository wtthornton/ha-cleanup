import React, { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { EventFilters as EventFiltersType, TimeRange } from '@/types/app'

interface EventFiltersProps {
  filters: EventFiltersType
  onFiltersChange: (filters: EventFiltersType) => void
  onReset: () => void
}

const timeRangeOptions = [
  { value: '5m', label: 'Last 5 minutes' },
  { value: '15m', label: 'Last 15 minutes' },
  { value: '1h', label: 'Last hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last week' },
  { value: '30d', label: 'Last month' },
]

const domainOptions = [
  { value: '', label: 'All domains' },
  { value: 'light', label: 'Lights' },
  { value: 'switch', label: 'Switches' },
  { value: 'sensor', label: 'Sensors' },
  { value: 'binary_sensor', label: 'Binary sensors' },
  { value: 'climate', label: 'Climate' },
  { value: 'automation', label: 'Automations' },
  { value: 'device_tracker', label: 'Device trackers' },
]

const sortOptions = [
  { value: 'timestamp', label: 'Time' },
  { value: 'entity_id', label: 'Entity' },
  { value: 'domain', label: 'Domain' },
]

const eventTypeOptions = [
  { value: 'state_changed', label: 'State Changes' },
  { value: 'automation_triggered', label: 'Automations' },
  { value: 'call_service', label: 'Service Calls' },
  { value: 'homeassistant_start', label: 'System Events' },
]

/**
 * AI ASSISTANT CONTEXT: Event filtering component with mobile-first design.
 * Provides search, time range, domain filtering, and sorting controls.
 * 
 * Key features:
 * - Mobile-responsive filter controls
 * - Touch-friendly inputs (min 44px height)
 * - Real-time search with clear button
 * - Time range and domain filtering
 * - Event type checkboxes
 * - Sort order toggle
 * - Active filter count display
 * - Reset filters functionality
 */
function EventFilters({ filters, onFiltersChange, onReset }: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchTerm: e.target.value })
  }

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, timeRange: e.target.value as TimeRange })
  }

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, domain: e.target.value })
  }

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, sortBy: e.target.value as 'timestamp' | 'entity_id' | 'domain' })
  }

  const handleSortOrderToggle = () => {
    onFiltersChange({ 
      ...filters, 
      sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' 
    })
  }

  const handleEventTypeChange = (eventType: string, checked: boolean) => {
    const newEventTypes = checked
      ? [...(filters.eventTypes || []), eventType]
      : (filters.eventTypes || []).filter(type => type !== eventType)
    
    onFiltersChange({ ...filters, eventTypes: newEventTypes })
  }

  const clearSearch = () => {
    onFiltersChange({ ...filters, searchTerm: '' })
  }

  // Count active filters
  const activeFilterCount = [
    filters.searchTerm,
    filters.domain,
    filters.eventTypes?.length,
    filters.sortBy !== 'timestamp' ? filters.sortBy : null,
    filters.sortOrder !== 'desc' ? filters.sortOrder : null,
  ].filter(Boolean).length

  return (
    <div className='space-y-4' data-testid='event-filters'>
      {/* Search Bar */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3'>
          <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </div>
        <input
          type='text'
          className='form-input pl-10 pr-10'
          placeholder='Search events by entity name, description...'
          value={filters.searchTerm}
          onChange={handleSearchChange}
          aria-label='Search events'
        />
        {filters.searchTerm && (
          <button
            type='button'
            className='absolute inset-y-0 right-0 flex items-center pr-3'
            onClick={clearSearch}
            aria-label='Clear search'
          >
            <XMarkIcon className='h-5 w-5 text-gray-400 hover:text-gray-600' />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className='flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0'>
        <div className='flex-1'>
          <label htmlFor='timeRange' className='form-label'>
            Time range
          </label>
          <select
            id='timeRange'
            className='form-input'
            value={filters.timeRange}
            onChange={handleTimeRangeChange}
            aria-label='Time range'
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className='flex-1'>
          <label htmlFor='domain' className='form-label'>
            Domain
          </label>
          <select
            id='domain'
            className='form-input'
            value={filters.domain}
            onChange={handleDomainChange}
            aria-label='Domain'
          >
            {domainOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className='flex-1'>
          <label htmlFor='sortBy' className='form-label'>
            Sort by
          </label>
          <div className='flex space-x-2'>
            <select
              id='sortBy'
              className='form-input flex-1'
              value={filters.sortBy}
              onChange={handleSortByChange}
              aria-label='Sort by'
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type='button'
              className='btn-outline'
              onClick={handleSortOrderToggle}
              aria-label='Toggle sort order'
              title={`Sort ${filters.sortOrder === 'desc' ? 'ascending' : 'descending'}`}
            >
              {filters.sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className='flex items-center justify-between'>
        <button
          type='button'
          className='flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900'
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <FunnelIcon className='h-4 w-4' />
          <span>Advanced Filters</span>
          <span className='text-xs'>
            {showAdvanced ? '−' : '+'}
          </span>
        </button>
        
        {activeFilterCount > 0 && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-500'>
              {activeFilterCount} filters active
            </span>
            <button
              type='button'
              className='text-sm text-primary-600 hover:text-primary-700'
              onClick={onReset}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <h4 className='mb-3 text-sm font-medium text-gray-900'>Event Types</h4>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {eventTypeOptions.map(option => (
              <label key={option.value} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600'
                  checked={filters.eventTypes?.includes(option.value) || false}
                  onChange={(e) => handleEventTypeChange(option.value, e.target.checked)}
                  aria-label={option.label}
                />
                <span className='text-sm text-gray-700'>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EventFilters