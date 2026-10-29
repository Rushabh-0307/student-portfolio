import { useEffect, useMemo, useState } from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import Spinner from './Spinner.jsx'

const GITHUB_USERNAME = 'Rushabh-0307'
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`

function Projects() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const filters = ['All', 'Web Design', 'Development', 'JavaScript', 'Python', 'Other']

  useEffect(() => {
    const controller = new AbortController()

    async function loadRepositories() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(GITHUB_REPOS_URL, {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github+json' },
        })

        if (!response.ok) {
          throw new Error(`GitHub returned ${response.status}`)
        }

        const data = await response.json()
        setRepos(Array.isArray(data) ? data : [])
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadRepositories()
    return () => controller.abort()
  }, [retryCount])

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      // Search filter by name (P3 assignment)
      const matchesSearch = !searchQuery || repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (activeFilter === 'All') return true
      const lang = (repo.language || '').toLowerCase()
      const filter = activeFilter.toLowerCase()
      if (filter === 'web design') return ['html', 'css'].includes(lang)
      if (filter === 'development') return ['javascript', 'typescript', 'python', 'java'].includes(lang)
      if (filter === 'javascript') return lang === 'javascript'
      if (filter === 'python') return lang === 'python'
      return true
    })
  }, [repos, activeFilter, searchQuery])

  return (
    <section className="portfolio-section" id="portfolio">
      <div className="container">
        <h2 className="section-heading">Portfolio</h2>

        <div className="portfolio-search-bar" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            className="contact-input"
            style={{ maxWidth: '360px', padding: '0.6rem 1rem' }}
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="portfolio-layout">
          <div className="portfolio-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="portfolio-content">
            {loading && <Spinner />}

            {error && (
              <div className="portfolio-error">
                <ErrorMessage message={`Unable to load repositories: ${error}`} />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setRetryCount((count) => count + 1)}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="project-grid">
                {filteredRepos.length > 0 ? (
                  filteredRepos.slice(0, 6).map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="project-card"
                    >
                      <div className="project-card-inner">
                        <div className="project-card-bg">
                          <span className="project-lang">{repo.language || 'Code'}</span>
                        </div>
                        <div className="project-card-info">
                          <h4 className="project-name">{repo.name}</h4>
                          <p className="project-desc">
                            {repo.description || 'A project built with modern web technologies.'}
                          </p>
                          <div className="project-meta">
                            {repo.language && <span className="project-language-tag">{repo.language}</span>}
                            <span className="project-stars">★ {repo.stargazers_count}</span>
                          </div>
                        </div>
                      </div>
                      <div className="project-overlay">
                        <span className="project-overlay-text">View Project ↗</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="no-results">No projects found for this category.</p>
                )}
              </div>
            )}
          </div>

          <div className="portfolio-nav">
            <button type="button" className="portfolio-nav-btn" aria-label="Previous">▲</button>
            <button type="button" className="portfolio-nav-btn" aria-label="Next">▼</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Projects
