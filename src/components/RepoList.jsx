function RepoList({ repos }) {
  return (
    <ul className="repo-list">
      {repos.map((repo) => (
        <li key={repo.id} className="repo-item">
          <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-link">
            {repo.name}
          </a>
          <span className="repo-stars">⭐ {repo.stargazers_count}</span>
        </li>
      ))}
    </ul>
  )
}

export default RepoList
