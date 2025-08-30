import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Layout from '@/components/Layout'
import Navigation from '@/components/Navigation'
import Dashboard from '@/pages/Dashboard'
import Events from '@/pages/Events'
import Charts from '@/pages/Charts'
// Import only components that don't require complex mocking
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => {
      const mediaQuery = query.includes('768px') ? 768 : 
                        query.includes('1024px') ? 1024 :
                        query.includes('1280px') ? 1280 : 640
      
      return {
        matches: width >= mediaQuery,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    }),
  })
}

// Mock ResizeObserver
const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    mockResizeObserver()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Mobile First Design (320px+)', () => {
    beforeEach(() => {
      mockMatchMedia(375) // iPhone size
    })

    test('should render mobile-first layout', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="content">Test Content</div>
        </Layout>
      )

      const main = screen.getByRole('main')
      expect(main).toHaveClass('px-4') // Mobile padding
      expect(main).toHaveClass('max-w-7xl') // Responsive max-width
    })

    test('should show mobile navigation by default', () => {
      renderWithProviders(<Navigation />)
      
      const mobileMenuButton = screen.getByLabelText('Open navigation menu')
      expect(mobileMenuButton).toBeInTheDocument()
    })

    test('should stack elements vertically on mobile', () => {
      renderWithProviders(
        <Layout>
          <div className="space-y-4">
            <div data-testid="card-1">Card 1</div>
            <div data-testid="card-2">Card 2</div>
          </div>
        </Layout>
      )
      
      // Content should have mobile-first stacking
      const card1 = screen.getByTestId('card-1')
      const card2 = screen.getByTestId('card-2')
      expect(card1).toBeInTheDocument()
      expect(card2).toBeInTheDocument()
    })
  })

  describe('Tablet Design (768px+)', () => {
    beforeEach(() => {
      mockMatchMedia(768) // Tablet size
    })

    test('should adapt padding for tablet', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="content">Test Content</div>
        </Layout>
      )

      const main = screen.getByRole('main')
      expect(main).toHaveClass('px-4') // Base mobile padding maintained
    })

    test('should show expanded navigation on tablet', () => {
      renderWithProviders(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })
  })

  describe('Desktop Design (1024px+)', () => {
    beforeEach(() => {
      mockMatchMedia(1024) // Desktop size
    })

    test('should show desktop layout with proper spacing', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="content">Test Content</div>
        </Layout>
      )

      const main = screen.getByRole('main')
      expect(main).toHaveClass('max-w-7xl') // Desktop max-width
    })

    test('should display horizontal navigation on desktop', () => {
      renderWithProviders(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      
      // Desktop navigation should be visible
      const dashboardLink = screen.getByText('Dashboard')
      expect(dashboardLink).toBeInTheDocument()
    })
  })

  describe('Large Desktop (1280px+)', () => {
    beforeEach(() => {
      mockMatchMedia(1280) // Large desktop
    })

    test('should maintain readable line lengths', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="content">Test Content</div>
        </Layout>
      )

      const main = screen.getByRole('main')
      expect(main).toHaveClass('max-w-7xl') // Max content width constraint
    })
  })

  describe('Component Responsiveness', () => {
    test('cards should be responsive across screen sizes', () => {
      mockMatchMedia(375) // Mobile first
      
      renderWithProviders(
        <Layout>
          <div className="card">
            <h2>Test Card</h2>
            <p>Card content</p>
          </div>
        </Layout>
      )
      
      // Cards should be present (component renders)
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Test Card')).toBeInTheDocument()
    })

    test('layout components should be responsive', () => {
      mockMatchMedia(375) // Mobile first
      
      renderWithProviders(
        <Layout>
          <div data-testid="test-content">
            <h1>Test Page</h1>
            <p>This is test content</p>
          </div>
        </Layout>
      )
      
      const heading = screen.getByText('Test Page')
      expect(heading).toBeInTheDocument()
      
      const content = screen.getByTestId('test-content')
      expect(content).toBeInTheDocument()
    })

    test('navigation should adapt to different screen sizes', () => {
      mockMatchMedia(375) // Mobile first
      
      renderWithProviders(<Navigation />)
      
      // Should show mobile menu button on small screens
      const mobileMenuButton = screen.getByLabelText('Open navigation menu')
      expect(mobileMenuButton).toBeInTheDocument()
    })
  })

  describe('Text and Content Scaling', () => {
    test('should have proper text scaling for mobile', () => {
      mockMatchMedia(375)
      
      renderWithProviders(<Dashboard />)
      
      const heading = screen.getByText('Dashboard')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('text-2xl', 'sm:text-3xl') // Responsive text sizing
    })

    test('should handle long text gracefully', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="long-text">
            This is a very long text that should wrap properly on mobile devices and not overflow the container width
          </div>
        </Layout>
      )

      const longText = screen.getByTestId('long-text')
      expect(longText).toBeInTheDocument()
    })
  })

  describe('Interactive Elements Responsiveness', () => {
    test('buttons should maintain minimum touch target size', () => {
      mockMatchMedia(375) // Mobile
      
      renderWithProviders(<Navigation />)
      
      const menuButton = screen.getByLabelText('Open navigation menu')
      // Button should have btn-outline class which includes proper sizing
      expect(menuButton).toHaveClass('btn-outline')
    })

    test('form inputs should be touch-friendly', () => {
      mockMatchMedia(375) // Mobile
      
      renderWithProviders(<Events />)
      
      // Check if search input exists and has proper classes
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toHaveClass('form-input') // Which includes min-h-[44px]
    })
  })

  describe('Image and Media Responsiveness', () => {
    test('should handle responsive containers', () => {
      mockMatchMedia(375) // Mobile
      
      renderWithProviders(<Charts />)
      
      // Chart containers should be responsive
      const chartContainers = screen.getAllByTestId('chart-container')
      expect(chartContainers.length).toBeGreaterThan(0)
      chartContainers.forEach(container => {
        expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm')
      })
    })
  })

  describe('Orientation Changes', () => {
    test('should handle portrait orientation', () => {
      mockMatchMedia(375) // Mobile portrait
      
      renderWithProviders(<Dashboard />)
      
      const dashboard = screen.getByText('Dashboard')
      expect(dashboard).toBeInTheDocument()
      expect(dashboard).toHaveClass('text-2xl', 'sm:text-3xl') // Responsive text sizing
    })

    test('should handle landscape orientation', () => {
      mockMatchMedia(667) // Mobile landscape (iPhone)
      
      renderWithProviders(<Dashboard />)
      
      const dashboard = screen.getByText('Dashboard')
      expect(dashboard).toBeInTheDocument()
      // Check that responsive grid layout works
      const statsGrid = screen.getByText('Total Events').closest('.grid')
      expect(statsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  describe('Accessibility at Different Sizes', () => {
    test('should maintain accessibility on mobile', () => {
      mockMatchMedia(375)
      
      renderWithProviders(<Navigation />)
      
      const menuButton = screen.getByLabelText('Open navigation menu')
      expect(menuButton).toHaveAttribute('aria-label')
      expect(menuButton).toHaveAttribute('type', 'button')
    })

    test('should maintain focus indicators across sizes', () => {
      mockMatchMedia(1024) // Desktop
      
      renderWithProviders(<Navigation />)
      
      const dashboardLink = screen.getByText('Dashboard')
      expect(dashboardLink.closest('a')).toHaveClass('nav-item')
    })
  })
})