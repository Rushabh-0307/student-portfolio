function RepoList({ repos }) {
  return (
    <ul className="repo-list">
      {repos.map((repo) => (
        <li key={repo.id} className="repo-item">
          <div className="repo-content">
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-link">
              {repo.name}
            </a>
            <p className="repo-description">{repo.description || 'A project built with modern web technologies.'}</p>
            <div className="repo-meta">
              {repo.language && <span className="repo-language">{repo.language}</span>}
              <span className="repo-stars">★ {repo.stargazers_count}</span>
              <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
          <span className="repo-arrow" aria-hidden="true">↗</span>
        </li>
      ))}
    </ul>
  )
}

export default RepoList
