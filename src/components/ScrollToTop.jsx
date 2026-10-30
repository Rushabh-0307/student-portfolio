import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Automatically scrolls to the top of the window whenever the route changes (same tab)
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

