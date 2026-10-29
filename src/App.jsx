import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import Projects from './components/Projects.jsx'
import TaskManagement from './components/TaskManagement.jsx'
import Contact from './components/Contact.jsx'
import NotFound from './components/NotFound.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

function App() {
  // Dark/light mode state (P2)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={`app-shell ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        {/* Full Single-Page Portfolio: Header -> About -> Skills -> Portfolio -> Task Management -> Contact */}
        <Route path="/" element={<><Header name="Rushabh" /><Home /></>} />

        {/* Dedicated direct route for Portfolio / Projects */}
        <Route path="/projects" element={<div style={{ paddingTop: '5rem' }}><Projects /></div>} />

        {/* Dedicated direct route for Task Management */}
        <Route path="/tasks" element={<div style={{ paddingTop: '5rem' }}><TaskManagement /></div>} />

        {/* Dedicated direct route for Contact */}
        <Route path="/contact" element={<div style={{ paddingTop: '5rem' }}><Contact /></div>} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
