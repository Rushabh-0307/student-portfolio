import { useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import Footer from './components/Footer.jsx'
import Spinner from './components/Spinner.jsx'
import './App.css'

// Route-based code splitting with React.lazy (P8)
// Projects and Contact are loaded on-demand when the route is visited
const Projects = lazy(() => import('./components/Projects.jsx'))
const Contact = lazy(() => import('./components/Contact.jsx'))
// Assignment: lazy-load one additional component (NotFound)
const NotFound = lazy(() => import('./components/NotFound.jsx'))

function App() {
  // Dark/light mode state (P2)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={`app-shell ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
      {/* ONE Suspense fallback wrapped around Routes block only (P8) */}
      <Suspense fallback={<Spinner text="Loading page components..." />}>
        <Routes>
          <Route path="/" element={<><Header name="Rushabh" /><Home /></>} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  )
}

export default App
