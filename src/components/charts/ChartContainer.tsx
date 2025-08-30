import { useState, ReactNode } from 'react'
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

interface ChartContainerProps {
  title: string
  children: ReactNode
  loading?: boolean
  error?: string
  showFullscreenToggle?: boolean
  className?: string
}

/**
 * AI ASSISTANT CONTEXT: Reusable chart container component with mobile-first design.
 * Provides consistent styling, loading states, error handling, and fullscreen capability
 * for all chart components.
 * 
 * Key features:
 * - Mobile-responsive layout with touch-friendly controls
 * - Loading and error state management
 * - Optional fullscreen toggle for better mobile chart viewing
 * - Consistent chart styling and spacing
 * - Accessibility support with proper ARIA labels
 */
function ChartContainer({
  title,
  children,
  loading = false,
  error,
  showFullscreenToggle = false,
  className = '',
}: ChartContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const containerClasses = `
    chart-container bg-white rounded-lg shadow-sm border border-gray-200 p-4
    ${isFullscreen ? 'fullscreen fixed inset-0 z-50 rounded-none' : ''}
    ${className}
  `.trim()

  return (
    <div className={containerClasses} data-testid="chart-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
        <h3 className="text-lg font-medium text-gray-900 truncate">{title}</h3>
        
        {showFullscreenToggle && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="btn-outline p-2"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-4 w-4" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="chart-content">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <p className="mt-4 text-sm text-gray-600">Loading...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-red-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h4 className="mb-2 text-lg font-medium text-red-900">
              Chart Error
            </h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && children}
      </div>
    </div>
  )
}

export default ChartContainer