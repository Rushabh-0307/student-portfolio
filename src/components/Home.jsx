import About from './About.jsx'
import Skills from './Skills.jsx'
import { Link } from 'react-router-dom'

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
      {/* Reusing About component to prevent duplicated JSX (P1) */}
      <About />
      <section className="about-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Skills skillList={defaultSkills} />
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/projects" className="btn btn-primary" style={{ marginRight: '1rem' }}>
              Explore Projects & Tasks
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
