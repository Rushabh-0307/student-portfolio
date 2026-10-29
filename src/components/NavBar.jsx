import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

// NavBar with multi-page route navigation (opens a new page within the same tab)
function NavBar({ darkMode, setDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Each button routes to a dedicated landing page in the same tab
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Portfolio' },
    { to: '/tasks', label: 'Task Management' },
  ]

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          RUSHABH
        </Link>

        <ul className={`nav-list ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
          {/* Mobile menu item for contact */}
          <li className="mobile-only-nav-item">
            <Link
              to="/contact"
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Dark/light mode toggle button (P2) */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Direct Link to the dedicated Contact Landing Page */}
        <Link
          to="/contact"
          className="nav-cta"
          onClick={() => setIsMenuOpen(false)}
        >
          Contact Me
        </Link>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default NavBar
