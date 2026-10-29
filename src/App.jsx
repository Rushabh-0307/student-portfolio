import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import AboutPage from './components/AboutPage.jsx'
import Projects from './components/Projects.jsx'
import TaskManagement from './components/TaskManagement.jsx'
import Contact from './components/Contact.jsx'
import NotFound from './components/NotFound.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import './App.css'

function App() {
  // Dark/light mode state (P2)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={`app-shell ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Ensures every route navigation opens at the top of the page */}
      <ScrollToTop />
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        {/* 1. Home Landing Page */}
        <Route path="/" element={<><Header name="Rushabh" /><Home /></>} />

        {/* 2. Dedicated About Landing Page */}
        <Route path="/about" element={<AboutPage />} />

        {/* 3. Dedicated Portfolio / Projects Landing Page */}
        <Route path="/projects" element={<div style={{ paddingTop: '5rem', minHeight: '80vh' }}><Projects /></div>} />

        {/* 4. Dedicated Task Management Landing Page */}
        <Route path="/tasks" element={<div style={{ paddingTop: '5rem', minHeight: '80vh' }}><TaskManagement /></div>} />

        {/* 5. Dedicated Contact Landing Page */}
        <Route path="/contact" element={<div style={{ paddingTop: '5rem', minHeight: '80vh' }}><Contact /></div>} />

        {/* 6. 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
