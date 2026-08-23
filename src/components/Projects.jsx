import { useEffect, useMemo, useState } from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import Spinner from './Spinner.jsx'
import { getTasks, createTask, updateTask, deleteTask } from '../api.js'

function Projects() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const loadTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getTasks(controller.signal)
        setTasks(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadTasks()
    return () => controller.abort()
  }, [retryCount])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return setError('Title is required')
    setError(null)
    setLoading(true)
    try {
      const newTask = await createTask({ title: title.trim(), description: description.trim() })
      // update state by appending the returned task
      setTasks((prev) => [newTask, ...prev])
      setTitle('')
      setDescription('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCompleted = async (task) => {
    setError(null)
    try {
      const updated = await updateTask(task._id, { completed: !task.completed })
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (task) => {
    setError(null)
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    try {
      await deleteTask(task._id)
      setTasks((prev) => prev.filter((t) => t._id !== task._id))
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = useMemo(() => tasks, [tasks])

  if (loading) {
    return (
      <section className="portfolio-section projects-section">
        <h2>Tasks</h2>
        <Spinner />
      </section>
    )
  }

  return (
    <section className="portfolio-section projects-section">
      <h2>Tasks</h2>

      {error && <ErrorMessage message={error} />}

      <form className="task-form" onSubmit={handleCreate}>
        <label htmlFor="task-title">Title</label>
        <input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label htmlFor="task-desc">Description</label>
        <input id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} />

        <button type="submit">Create Task</button>
      </form>

      <p className="repo-count">Showing {filtered.length} tasks</p>

      {filtered.length === 0 ? (
        <p className="no-results">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {filtered.map((task) => (
            <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-main">
                <input
                  type="checkbox"
                  checked={!!task.completed}
                  onChange={() => toggleCompleted(task)}
                  aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <div className="task-content">
                  <strong>{task.title}</strong>
                  {task.description && <div className="task-desc">{task.description}</div>}
                </div>
              </div>
              <div className="task-actions">
                <button type="button" onClick={() => handleDelete(task)} className="danger">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="actions">
        <button type="button" onClick={() => setRetryCount((c) => c + 1)}>Refresh</button>
      </div>
    </section>
  )
}

export default Projects
