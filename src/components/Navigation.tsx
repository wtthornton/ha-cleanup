import React from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bars3Icon } from '@heroicons/react/24/outline'
import MobileMenu from './MobileMenu'

interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Charts', href: '/charts' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Settings', href: '/settings' },
]

/**
 * AI ASSISTANT CONTEXT: Main navigation component with mobile-first design.
 * Provides both desktop horizontal navigation and mobile hamburger menu.
 * 
 * Key features:
 * - Touch-friendly button sizes (min 44px)
 * - Active state highlighting
 * - Mobile hamburger menu
 * - Keyboard accessibility
 * - Responsive layout (horizontal on desktop, hamburger on mobile)
 */
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      <nav className='border-t border-gray-200 bg-white' role='navigation'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between'>
            {/* Desktop Navigation */}
            <div className='hidden space-x-8 sm:flex'>
              {navigationItems.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${
                    isActive(item.href) ? 'bg-primary-50 text-primary-700' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className='flex items-center sm:hidden'>
              <button
                type='button'
                className='btn-outline inline-flex items-center justify-center'
                aria-label='Open navigation menu'
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  )
}

export default Navigation