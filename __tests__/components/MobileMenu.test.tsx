import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MobileMenu from '@/components/MobileMenu'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('MobileMenu Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onClose.mockClear()
  })

  test('should render when open', () => {
    renderWithRouter(<MobileMenu {...defaultProps} />)

    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
  })

  test('should not render when closed', () => {
    renderWithRouter(<MobileMenu {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
  })

  test('should call onClose when close button is clicked', () => {
    renderWithRouter(<MobileMenu {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close navigation menu')
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  test('should call onClose when backdrop is clicked', () => {
    renderWithRouter(<MobileMenu {...defaultProps} />)

    const backdrop = screen.getByTestId('mobile-menu-backdrop')
    fireEvent.click(backdrop)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  test('should have touch-friendly navigation items', () => {
    renderWithRouter(<MobileMenu {...defaultProps} />)

    const navItems = screen.getAllByRole('link')
    navItems.forEach(item => {
      expect(item).toHaveClass('nav-item')
    })
  })

  test('should support keyboard navigation', () => {
    renderWithRouter(<MobileMenu {...defaultProps} />)

    const firstLink = screen.getByText('Dashboard')
    firstLink.focus()
    expect(firstLink).toHaveFocus()

    fireEvent.keyDown(firstLink, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})