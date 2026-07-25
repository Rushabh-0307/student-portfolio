import { useEffect, useMemo, useState } from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import RepoList from './RepoList.jsx'
import Spinner from './Spinner.jsx'

const GITHUB_API_URL = 'https://api.github.com/users/Rushabh-0307/repos?sort=updated&per_page=100'

function Projects() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const loadRepos = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(GITHUB_API_URL, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`GitHub API request failed (${response.status})`)
        }

        const repoData = await response.json()
        setRepos(Array.isArray(repoData) ? repoData : [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadRepos()

    return () => controller.abort()
  }, [retryCount])

  const filteredRepos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) {
      return repos
    }

    return repos.filter((repo) => repo.name.toLowerCase().includes(normalizedQuery))
  }, [repos, searchQuery])

  if (loading) {
    return (
      <section className="portfolio-section projects-section">
        <h2>Projects</h2>
        <Spinner />
      </section>
    )
  }

  if (error) {
    return (
      <section className="portfolio-section projects-section">
        <h2>Projects</h2>
        <ErrorMessage message={error} />
        <button type="button" className="retry-button" onClick={() => setRetryCount((count) => count + 1)}>
          Retry Fetch
        </button>
      </section>
    )
  }

  return (
    <section className="portfolio-section projects-section">
      <h2>Projects</h2>
      <p>Repositories fetched from the GitHub REST API.</p>
      <label htmlFor="repo-search" className="input-label">
        Search repositories
      </label>
      <input
        id="repo-search"
        type="text"
        className="search-input"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Filter by repository name..."
      />
      <p className="repo-count">Showing {filteredRepos.length} repositories</p>
      {filteredRepos.length === 0 ? (
        <p className="no-results">No repositories match your search.</p>
      ) : (
        <RepoList repos={filteredRepos} />
      )}
    </section>
  )
}

export default Projects
