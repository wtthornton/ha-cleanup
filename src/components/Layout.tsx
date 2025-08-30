import { ReactNode } from 'react'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
}

/**
 * AI ASSISTANT CONTEXT: Main layout component that provides the responsive structure
 * for the entire application. Features mobile-first design with proper semantic HTML
 * and accessibility support.
 * 
 * Key features:
 * - Mobile-first responsive design
 * - Semantic HTML structure (header, nav, main)
 * - Consistent spacing and max-width constraints
 * - Sticky navigation header
 * - Safe area support for mobile devices
 */
function Layout({ children }: LayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='sticky top-0 z-50 bg-white shadow-sm safe-area-inset-top'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
              HA Cleanup
            </h1>
            <p className='hidden text-sm text-gray-600 sm:block'>
              Home Assistant Data Analysis
            </p>
          </div>
        </div>
        <Navigation />
      </header>

      <main 
        className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 safe-area-inset-bottom'
        role='main'
      >
        {children}
      </main>
    </div>
  )
}

export default Layout