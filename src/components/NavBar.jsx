import { Link, useLocation } from 'react-router-dom'

function NavBar({ links, isDarkMode, onToggleTheme }) {
  const location = useLocation()

  return (
    <nav className="navbar">
      <ul className="nav-list">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={location.pathname === link.to ? 'nav-link active' : 'nav-link'}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" className="mode-toggle" onClick={onToggleTheme}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </nav>
  )
}

export default NavBar
