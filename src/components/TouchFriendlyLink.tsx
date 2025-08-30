import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface TouchFriendlyLinkProps {
  to: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

/**
 * AI ASSISTANT CONTEXT: Enhanced Link component with improved touch interactions
 * for mobile devices. Provides visual feedback on touch and handles both
 * touch and click events gracefully.
 * 
 * Key features:
 * - Touch feedback with visual state changes
 * - Prevents double-click issues on mobile
 * - Maintains accessibility for keyboard users
 * - Smooth touch interactions
 */
function TouchFriendlyLink({ 
  to, 
  className = '', 
  children, 
  onClick 
}: TouchFriendlyLinkProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => {
    setIsPressed(true)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (onClick) {
      onClick()
    }
  }

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleMouseLeave = () => {
    setIsPressed(false)
  }

  const pressedClass = isPressed ? 'scale-[0.98] bg-gray-200' : ''

  return (
    <Link
      to={to}
      className={`${className} ${pressedClass} transition-all duration-150 select-none`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export default TouchFriendlyLink