import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  // Footer links leading directly to each landing page
  const footerLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Portfolio' },
    { to: '/tasks', label: 'Task Management' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <Link to="/" className="footer-logo">RUSHABH</Link>
          <nav className="footer-nav">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="footer-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Rushabh. All rights reserved.
          </p>
          <p className="footer-email">rushabh.student@example.com</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
