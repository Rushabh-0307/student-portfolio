import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// NavBar with smooth scroll on home page and direct link routing (P2)
function NavBar({ darkMode, setDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { id: 'home', to: '/', label: 'Home' },
    { id: 'portfolio', to: '/projects', label: 'Portfolio' },
    { id: 'tasks', to: '/tasks', label: 'Task Management' },
    { id: 'contact', to: '/contact', label: 'Contact' },
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
    // If not on home or element not found, standard Link handles navigation to link.to
  }

  const handleCtaClick = (e) => {
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
        <Link to="/contact" className="nav-cta" onClick={handleCtaClick}>Contact Me</Link>
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
