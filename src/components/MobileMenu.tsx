import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import TouchFriendlyLink from './TouchFriendlyLink'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  name: string
  href: string
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Charts', href: '/charts' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Settings', href: '/settings' },
]

/**
 * AI ASSISTANT CONTEXT: Mobile navigation menu using Headless UI Dialog.
 * Provides full-screen mobile navigation with smooth animations and
 * proper accessibility features.
 * 
 * Key features:
 * - Full-screen mobile overlay
 * - Touch-friendly navigation items (min 44px height)
 * - Smooth slide-in animation
 * - Keyboard navigation support
 * - Auto-close on route change
 * - Focus management
 */
function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Close menu when route changes
  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Enhanced touch interactions for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = Math.abs(touch.clientY - touchStart.y)
    
    // Only handle horizontal swipes (not vertical scrolling)
    if (deltaY < 50 && Math.abs(deltaX) > 10) {
      setIsDragging(true)
      
      // Prevent default scrolling when swiping horizontally
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) {
      setTouchStart(null)
      setIsDragging(false)
      return
    }
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    
    // Close menu if swiped right more than 100px
    if (deltaX > 100) {
      onClose()
    }
    
    setTouchStart(null)
    setIsDragging(false)
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-in-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in-out duration-300'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div 
            className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
            data-testid='mobile-menu-backdrop'
            onClick={onClose}
          />
        </Transition.Child>

        <div className='fixed inset-0 overflow-hidden'>
          <div className='absolute inset-0 overflow-hidden'>
            <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
              <Transition.Child
                as={Fragment}
                enter='transform transition ease-in-out duration-300'
                enterFrom='translate-x-full'
                enterTo='translate-x-0'
                leave='transform transition ease-in-out duration-300'
                leaveFrom='translate-x-0'
                leaveTo='translate-x-full'
              >
                <Dialog.Panel 
                  ref={panelRef}
                  className='pointer-events-auto relative w-screen max-w-md'
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className='flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl safe-area-inset-top safe-area-inset-bottom scroll-smooth-mobile'>
                    {/* Swipe indicator */}
                    <div className='flex justify-center pb-2'>
                      <div className='h-1 w-12 rounded-full bg-gray-300' aria-hidden="true" />
                    </div>
                    
                    <div className='px-4 sm:px-6'>
                      <div className='flex items-start justify-between'>
                        <Dialog.Title className='text-base font-semibold leading-6 text-gray-900'>
                          Navigation
                        </Dialog.Title>
                        <div className='ml-3 flex h-7 items-center'>
                          <button
                            type='button'
                            className='btn-outline relative rounded-md'
                            aria-label='Close navigation menu'
                            onClick={onClose}
                          >
                            <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className='relative mt-6 flex-1 px-4 sm:px-6'>
                      <nav className='space-y-2'>
                        {navigationItems.map(item => (
                          <TouchFriendlyLink
                            key={item.name}
                            to={item.href}
                            className={`nav-item block ${
                              isActive(item.href) ? 'bg-primary-50 text-primary-700' : ''
                            }`}
                            onClick={onClose}
                          >
                            {item.name}
                          </TouchFriendlyLink>
                        ))}
                      </nav>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default MobileMenu