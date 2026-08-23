import { useEffect, useMemo, useState, useCallback } from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import Spinner from './Spinner.jsx'
import Toasts from './Toast.jsx'
import { getTasks, createTask, updateTask, deleteTask } from '../api.js'

function Projects() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true) // initial load
  const [createLoading, setCreateLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({}) // { [id]: { updating: bool, deleting: bool } }
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [toasts, setToasts] = useState([])

  // toast helpers
  const pushToast = useCallback((message, type = 'info') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2,7)}`
    setToasts((s) => [...s, { id, message, type }])
    return id
  }, [])
  const removeToast = useCallback((id) => setToasts((s) => s.filter((t) => t.id !== id)), [])

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
          pushToast(`Failed to load tasks: ${err.message}`, 'error')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadTasks()
    return () => controller.abort()
  }, [retryCount, pushToast])

  // Optimistic create: show task in list immediately with temp id, replace on success, remove on failure
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return setError('Title is required')
    setError(null)
    const tempId = `temp_${Date.now()}`
    const optimisticTask = {
      _id: tempId,
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      optimistic: true,
    }

    // optimistic insert
    setTasks((prev) => [optimisticTask, ...prev])
    setTitle('')
    setDescription('')
    setCreateLoading(true)

    try {
      const saved = await createTask({ title: optimisticTask.title, description: optimisticTask.description })
      // replace temp item with saved item
      setTasks((prev) => prev.map((t) => (t._id === tempId ? saved : t)))
      pushToast('Task created', 'success')
    } catch (err) {
      // remove temp item
      setTasks((prev) => prev.filter((t) => t._id !== tempId))
      setError(err.message)
      pushToast(`Create failed: ${err.message}`, 'error')
    } finally {
      setCreateLoading(false)
    }
  }

  const setTaskLoading = (id, key, value) => {
    setActionLoading((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }))
  }

  const toggleCompleted = async (task) => {
    setError(null)
    setTaskLoading(task._id, 'updating', true)
    try {
      const updated = await updateTask(task._id, { completed: !task.completed })
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
      pushToast('Task updated', 'success')
    } catch (err) {
      setError(err.message)
      pushToast(`Update failed: ${err.message}`, 'error')
    } finally {
      setTaskLoading(task._id, 'updating', false)
    }
  }

  const handleDelete = async (task) => {
    setError(null)
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    setTaskLoading(task._id, 'deleting', true)
    try {
      await deleteTask(task._id)
      setTasks((prev) => prev.filter((t) => t._id !== task._id))
      pushToast('Task deleted', 'success')
    } catch (err) {
      setError(err.message)
      pushToast(`Delete failed: ${err.message}`, 'error')
    } finally {
      setTaskLoading(task._id, 'deleting', false)
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

      <Toasts toasts={toasts} removeToast={removeToast} />

      {error && <ErrorMessage message={error} />}

      <form className="task-form" onSubmit={handleCreate}>
        <label htmlFor="task-title">Title</label>
        <input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={createLoading} />

        <label htmlFor="task-desc">Description</label>
        <input id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={createLoading} />

        <button type="submit" disabled={createLoading}>{createLoading ? 'Creating…' : 'Create Task'}</button>
      </form>

      <p className="repo-count">Showing {filtered.length} tasks</p>

      {filtered.length === 0 ? (
        <p className="no-results">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {filtered.map((task) => (
            <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''} ${task.optimistic ? 'optimistic' : ''}`}>
              <div className="task-main">
                <input
                  type="checkbox"
                  checked={!!task.completed}
                  onChange={() => toggleCompleted(task)}
                  aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                  disabled={!!(actionLoading[task._id] && actionLoading[task._id].updating) || task.optimistic}
                />
                <div className="task-content">
                  <strong>{task.title}</strong>
                  {task.description && <div className="task-desc">{task.description}</div>}
                  {task.optimistic && <div style={{fontSize:12, color:'#888'}}>Saving…</div>}
                </div>
              </div>
              <div className="task-actions">
                <button
                  type="button"
                  onClick={() => handleDelete(task)}
                  className="danger"
                  disabled={!!(actionLoading[task._id] && actionLoading[task._id].deleting) || task.optimistic}
                >
                  {(actionLoading[task._id] && actionLoading[task._id].deleting) ? 'Deleting…' : 'Delete'}
                </button>
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
