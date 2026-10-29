import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Portfolio' },
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
