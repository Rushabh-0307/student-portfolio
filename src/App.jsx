import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import NavBar from './components/NavBar.jsx'
import NotFound from './components/NotFound.jsx'
import Projects from './components/Projects.jsx'
import './App.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/contact', label: 'Contact' },
  ]

  const skillList = ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'React', 'Vite', 'Git']
  const appThemeClass = isDarkMode ? 'theme-dark' : 'theme-light'

  return (
    <div className={`app-shell ${appThemeClass}`}>
      <NavBar
        links={navLinks}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prevMode) => !prevMode)}
      />
      <Header title="Student Portfolio" name="Rushabh" themeColor="#1d4ed8" />
      <main className="portfolio-page">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                bio="I am a B.Tech student focused on building clean, responsive web applications using modern frontend tools."
                skillList={skillList}
              />
            }
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer email="rushabh.student@example.com" />
    </div>
  )
}

export default App
