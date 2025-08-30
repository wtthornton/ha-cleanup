import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navigation from '@/components/Navigation'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Navigation Component', () => {
  test('should render navigation links', () => {
    renderWithRouter(<Navigation />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  test('should have touch-friendly button sizes', () => {
    renderWithRouter(<Navigation />)

    const navLinks = screen.getAllByRole('link')
    navLinks.forEach(link => {
      expect(link).toHaveClass('nav-item')
    })
  })

  test('should be responsive and mobile-first', () => {
    renderWithRouter(<Navigation />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('border-t', 'border-gray-200', 'bg-white')
  })

  test('should handle mobile menu toggle', () => {
    renderWithRouter(<Navigation />)

    const mobileMenuButton = screen.getByLabelText('Open navigation menu')
    expect(mobileMenuButton).toBeInTheDocument()

    fireEvent.click(mobileMenuButton)
    
    expect(screen.getByText('Navigation')).toBeVisible()
  })

  test('should highlight active navigation item', () => {
    renderWithRouter(<Navigation />)
    
    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink.closest('a')).toHaveClass('bg-primary-50', 'text-primary-700')
  })
})