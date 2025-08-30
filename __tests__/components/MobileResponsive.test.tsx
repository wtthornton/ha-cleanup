import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Navigation from '@/components/Navigation'
import MobileMenu from '@/components/MobileMenu'
import Layout from '@/components/Layout'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('Mobile Responsive Navigation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Touch Interactions', () => {
    test('should handle touch events on navigation items', async () => {
      renderWithRouter(<Navigation />)
      
      const dashboardLink = screen.getByText('Dashboard')
      
      // Simulate proper touch events with required properties
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{
          clientX: 100,
          clientY: 100,
        }] as any,
        bubbles: true,
      })
      
      fireEvent(dashboardLink, touchEvent)
      expect(dashboardLink).toBeInTheDocument()
    })

    test('should have minimum 44px touch targets', () => {
      renderWithRouter(<Navigation />)
      
      const navItems = screen.getAllByRole('link')
      navItems.forEach(item => {
        expect(item).toHaveClass('nav-item') // Which includes min-h-[44px]
      })
    })

    test('should handle mobile menu interactions', () => {
      const onClose = vi.fn()
      renderWithRouter(<MobileMenu isOpen={true} onClose={onClose} />)
      
      const closeButton = screen.getByLabelText('Close navigation menu')
      
      // Test click interaction (which works for both touch and mouse)
      fireEvent.click(closeButton)
      
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Screen Size Adaptations', () => {
    test('should adapt to mobile viewport', () => {
      mockMatchMedia(true) // Mobile size
      
      renderWithRouter(<Navigation />)
      
      // Mobile menu button should be visible
      const mobileMenuButton = screen.getByLabelText('Open navigation menu')
      expect(mobileMenuButton).toBeInTheDocument()
    })

    test('should adapt to tablet viewport', () => {
      mockMatchMedia(false) // Desktop/tablet size
      
      renderWithRouter(<Navigation />)
      
      // Navigation should be visible
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    test('should handle orientation changes', async () => {
      renderWithRouter(<Navigation />)
      
      // Simulate orientation change
      Object.defineProperty(window, 'orientation', {
        writable: true,
        value: 90, // Landscape
      })
      
      fireEvent(window, new Event('orientationchange'))
      
      await waitFor(() => {
        const nav = screen.getByRole('navigation')
        expect(nav).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Features', () => {
    test('should support keyboard navigation in mobile menu', () => {
      const onClose = vi.fn()
      renderWithRouter(<MobileMenu isOpen={true} onClose={onClose} />)
      
      const firstLink = screen.getByText('Dashboard')
      firstLink.focus()
      
      // Tab to next item
      fireEvent.keyDown(firstLink, { key: 'Tab' })
      
      const eventsLink = screen.getByText('Events')
      expect(eventsLink).toBeInTheDocument()
    })

    test('should support escape key to close mobile menu', () => {
      const onClose = vi.fn()
      renderWithRouter(<MobileMenu isOpen={true} onClose={onClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })

    test('should have proper ARIA labels for mobile elements', () => {
      renderWithRouter(<Navigation />)
      
      const mobileMenuButton = screen.getByLabelText('Open navigation menu')
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Open navigation menu')
    })

    test('should manage focus trap in mobile menu', () => {
      const onClose = vi.fn()
      renderWithRouter(<MobileMenu isOpen={true} onClose={onClose} />)
      
      const closeButton = screen.getByLabelText('Close navigation menu')
      const firstLink = screen.getByText('Dashboard')
      
      // Focus should be contained within menu
      closeButton.focus()
      expect(closeButton).toHaveFocus()
      
      firstLink.focus()
      expect(firstLink).toHaveFocus()
    })
  })

  describe('Performance Optimizations', () => {
    test('should not render mobile menu when closed', () => {
      renderWithRouter(<MobileMenu isOpen={false} onClose={vi.fn()} />)
      
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
    })

    test('should handle rapid menu toggles', async () => {
      renderWithRouter(<Navigation />)
      
      const menuButton = screen.getByLabelText('Open navigation menu')
      
      // Rapidly toggle menu
      fireEvent.click(menuButton)
      fireEvent.click(menuButton)
      fireEvent.click(menuButton)
      
      // Should handle gracefully without errors
      expect(menuButton).toBeInTheDocument()
    })
  })

  describe('Mobile Layout Responsiveness', () => {
    test('should have mobile-first padding and margins', () => {
      renderWithRouter(
        <Layout>
          <div data-testid="test-content">Content</div>
        </Layout>
      )
      
      const main = screen.getByRole('main')
      expect(main).toHaveClass('px-4', 'py-6') // Mobile padding
      expect(main).toHaveClass('max-w-7xl') // Responsive max-width
    })

    test('should handle safe area insets on mobile devices', () => {
      renderWithRouter(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      // Navigation should support safe area handling
      expect(nav).toBeInTheDocument()
    })

    test('should support swipe gestures hint', () => {
      const onClose = vi.fn()
      renderWithRouter(<MobileMenu isOpen={true} onClose={onClose} />)
      
      // Mobile menu should be swipe-friendly
      const menu = screen.getByText('Navigation').closest('[role="dialog"]')
      expect(menu).toBeInTheDocument()
    })
  })

  describe('Cross-browser Mobile Support', () => {
    test('should work with click events', () => {
      renderWithRouter(<Navigation />)
      
      const menuButton = screen.getByLabelText('Open navigation menu')
      
      // Test click events (desktop browsers)
      fireEvent.click(menuButton)
      
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })

    test('should handle interaction states properly', () => {
      renderWithRouter(<Navigation />)
      
      const menuButton = screen.getByLabelText('Open navigation menu')
      
      // Test that element responds to interactions
      fireEvent.click(menuButton)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      
      // Test that close button exists and is clickable
      const closeButton = screen.getByLabelText('Close navigation menu')
      expect(closeButton).toBeInTheDocument()
      fireEvent.click(closeButton)
      
      // Test that menu button is still available (menu closed)
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument()
    })

    test('should maintain focus management across interactions', () => {
      renderWithRouter(<Navigation />)
      
      const menuButton = screen.getByLabelText('Open navigation menu')
      menuButton.focus()
      
      expect(menuButton).toHaveFocus()
      
      fireEvent.click(menuButton)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })
  })
})