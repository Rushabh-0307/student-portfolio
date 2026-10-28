import { useEffect, useMemo, useState } from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import RepoList from './RepoList.jsx'
import Spinner from './Spinner.jsx'

const GITHUB_USERNAME = 'Rushabh-0307'
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`

function Projects() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [retryCount, setRetryCount] = useState(0)

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
    const query = searchQuery.trim().toLowerCase()
    if (!query) return repos
    return repos.filter((repo) => (
      repo.name.toLowerCase().includes(query)
      || (repo.description || '').toLowerCase().includes(query)
    ))
  }, [repos, searchQuery])

  return (
    <section className="portfolio-section projects-section">
      <h2>My Projects</h2>
      <p>
        Public repositories from{' '}
        <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
          @{GITHUB_USERNAME}
        </a>
        .
      </p>

      {loading && <Spinner />}

      {error && (
        <>
          <ErrorMessage message={`Unable to load GitHub repositories: ${error}`} />
          <button type="button" className="retry-button" onClick={() => setRetryCount((count) => count + 1)}>
            Retry
          </button>
        </>
      )}

      {!loading && !error && (
        <>
          <input
            className="search-input"
            type="search"
            placeholder="Search projects"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search projects"
          />
          {filteredRepos.length > 0 ? <RepoList repos={filteredRepos} /> : <p className="no-results">No projects found.</p>}
        </>
      )}
    </section>
  )
}

export default Projects
