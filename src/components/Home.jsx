import About from './About.jsx'
import Skills from './Skills.jsx'

function Home({ bio, skillList }) {
  return (
    <div className="route-content">
      <section className="portfolio-section">
        <About bio={bio} />
      </section>
      <section className="portfolio-section">
        <Skills skillList={skillList} />
      </section>
    </div>
  )
}

export default Home
