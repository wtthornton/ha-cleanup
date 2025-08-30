import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Layout Component', () => {
  test('should render main layout structure', () => {
    renderWithRouter(
      <Layout>
        <div data-testid='test-content'>Test Content</div>
      </Layout>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  test('should have mobile-first responsive classes', () => {
    renderWithRouter(
      <Layout>
        <div>Test</div>
      </Layout>
    )

    const main = screen.getByRole('main')
    expect(main).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'py-6')
  })

  test('should render navigation menu', () => {
    renderWithRouter(
      <Layout>
        <div>Test</div>
      </Layout>
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('should have proper semantic structure', () => {
    renderWithRouter(
      <Layout>
        <div>Test</div>
      </Layout>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})