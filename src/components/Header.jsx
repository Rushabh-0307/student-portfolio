import { Link } from 'react-router-dom'
import heroImg from '../assets/profile.jpg'

// Props: name (string) — displayed in the hero section
// themeColor (string, optional) — accent color override for the hero name
function Header({ name = 'Rushabh', themeColor }) {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-greeting">Hi, My Name Is</p>
          <h1 className="hero-name">
            <span className="gold-text" style={themeColor ? { background: themeColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>{name}</span>
          </h1>
          <div className="hero-role">
            <span className="role-text">Full Stack Developer</span>
          </div>
          <p className="hero-description">
            I'm a Full Stack Developer who is passionate about web development and design.
            I enjoy building clean, responsive web applications using modern frontend tools.
            Experienced in HTML, CSS, JavaScript, React, Node.js.
          </p>
          <div className="hero-location">
            <span className="location-icon">📍</span>
            <span>Gujarat, India</span>
          </div>
          <div className="hero-buttons">
            <Link to="/contact" className="btn btn-primary">Contact Me</Link>
            <Link to="/projects" className="btn btn-outline">View Projects</Link>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-image-glow"></div>
          <img src={heroImg} alt={name} className="hero-image" />
        </div>
      </div>
    </section>
  )
}

export default Header
