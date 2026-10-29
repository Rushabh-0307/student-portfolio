import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

// NavBar with single Contact button and smooth scrolling (P2)
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

  // Primary desktop navigation links (duplicate Contact removed)
  const navLinks = [
    { id: 'home', to: '/', label: 'Home' },
    { id: 'portfolio', to: '/projects', label: 'Portfolio' },
    { id: 'tasks', to: '/tasks', label: 'Task Management' },
  ]

  const handleNavClick = (e, link) => {
    setIsMenuOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(link.id)
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
  }

  const handleCtaClick = (e) => {
    setIsMenuOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById('contact')
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">RUSHABH</Link>
        <ul className={`nav-list ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <Link
                to={link.to}
                className="nav-link"
                onClick={(e) => handleNavClick(e, link)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {/* Mobile-only menu item when hamburger is open */}
          <li className="mobile-only-nav-item">
            <Link
              to="/contact"
              className="nav-link"
              onClick={handleCtaClick}
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

        {/* Single primary Contact Me button on the right */}
        <Link to="/contact" className="nav-cta" onClick={handleCtaClick}>Contact Me</Link>

        {/* Hamburger for mobile */}
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
