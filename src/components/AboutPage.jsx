import About from './About.jsx'
import Skills from './Skills.jsx'

// Default skills list passed to Skills component
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

// Dedicated Landing Page for About Me & Skills
export default function AboutPage() {
  return (
    <div style={{ paddingTop: '4rem', minHeight: '80vh' }}>
      <About />
      <section className="about-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Skills skillList={defaultSkills} />
        </div>
      </section>
    </div>
  )
}
