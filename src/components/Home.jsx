import About from './About.jsx'
import Skills from './Skills.jsx'
import Projects from './Projects.jsx'
import TaskManagement from './TaskManagement.jsx'
import Contact from './Contact.jsx'

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

      {/* 3. Original Portfolio / Projects showcase */}
      <Projects />

      {/* 4. Dedicated Task Management section located between Portfolio and Contact */}
      <TaskManagement />

      {/* 5. Contact section */}
      <Contact />
    </div>
  )
}

export default Home
