import { Link } from 'react-router-dom'
import About from './About.jsx'
import Skills from './Skills.jsx'

// Default skill list passed as prop to Skills to satisfy P1 props requirement
const defaultSkills = [
  { name: 'Frontend Development', icon: '💻', level: 90 },
  { name: 'Backend Development', icon: '⚙️', level: 85 },
  { name: 'Graphic Design', icon: '🎨', level: 75 },
  { name: 'Mobile Apps', icon: '📱', level: 70 },
  { name: 'UI/UX Design', icon: '🖌️', level: 80 },
  { name: 'Database Management', icon: '🗄️', level: 78 },
  { name: 'Git & GitHub', icon: '🔗', level: 88 },
  { name: 'API Development', icon: '🔌', level: 82 },
]

function Home() {
  return (
    <div className="main-content">
      {/* 1. About section */}
      <About />

      {/* 2. Skills section */}
      <section className="about-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Skills skillList={defaultSkills} />
        </div>
      </section>

      {/* 3. Interactive Landing Hub Cards: each card opens a dedicated new page within the same tab */}
      <section className="portfolio-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 className="section-heading">Explore Platform</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              marginTop: '2rem',
            }}
          >
            {/* Card 1: Portfolio Page */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
              }}
            >
              <div>
                <span style={{ fontSize: '2.2rem' }}>📂</span>
                <h3 style={{ margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>
                  Portfolio Showcase
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Browse real-time GitHub repositories, filter by tech stacks, and view project code and star counts.
                </p>
              </div>
              <Link
                to="/projects"
                className="btn btn-outline"
                style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
              >
                Open Portfolio Page ↗
              </Link>
            </div>

            {/* Card 2: Task Management Page */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-gold)',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
              }}
            >
              <div>
                <span style={{ fontSize: '2.2rem' }}>📋</span>
                <h3 style={{ margin: '1rem 0 0.5rem', color: 'var(--gold)' }}>
                  Task Management
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Full-stack task application with JWT authentication, MongoDB persistence, caching, and async notifications.
                </p>
              </div>
              <Link
                to="/tasks"
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
              >
                Open Task Manager ↗
              </Link>
            </div>

            {/* Card 3: Contact Page */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
              }}
            >
              <div>
                <span style={{ fontSize: '2.2rem' }}>✉️</span>
                <h3 style={{ margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>
                  Get In Touch
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Send direct inquiries, explore social handles, and collaborate on software projects.
                </p>
              </div>
              <Link
                to="/contact"
                className="btn btn-outline"
                style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
              >
                Open Contact Page ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
