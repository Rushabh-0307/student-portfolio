import { useEffect, useMemo, useState, useCallback } from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import Spinner from './Spinner.jsx'
import Toasts from './Toast.jsx'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getCurrentUser,
  loginUser,
  registerUser,
  clearAuthToken,
  getAuthToken,
} from '../api.js'

function Projects() {
  const token = getAuthToken()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(Boolean(token))
  const [createLoading, setCreateLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [toasts, setToasts] = useState([])
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [user, setUser] = useState(null)

  const pushToast = useCallback((message, type = 'info') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setToasts((s) => [...s, { id, message, type }])
    return id
  }, [])

  const removeToast = useCallback((id) => setToasts((s) => s.filter((t) => t.id !== id)), [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setTasks([])
      setLoading(false)
      return
    }

    let active = true
    const controller = new AbortController()

    const loadCurrentUser = async () => {
      setLoading(true)
      setError(null)
      try {
        const currentUser = await getCurrentUser(controller.signal)
        if (!active) return
        setUser(currentUser)
      } catch (err) {
        if (!active) return
        setUser(null)
        clearAuthToken()
        setAuthError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadCurrentUser()
    return () => {
      active = false
      controller.abort()
    }
  }, [token])

  useEffect(() => {
    if (!token || !user) {
      if (!token) setTasks([])
      return
    }

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
  }, [retryCount, token, user, pushToast])

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    const email = authForm.email.trim().toLowerCase()
    const password = authForm.password

    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }

    setAuthError(null)
    setAuthLoading(true)

    try {
      const payload = { email, password }
      const result = authMode === 'login' ? await loginUser(payload) : await registerUser(payload)
      setUser(result.user)
      setAuthForm({ email: '', password: '' })
      setAuthMode('login')
      pushToast(authMode === 'login' ? 'Logged in successfully' : 'Registration successful', 'success')
    } catch (err) {
      setAuthError(err.message)
      pushToast(`Authentication failed: ${err.message}`, 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthToken()
    setUser(null)
    setTasks([])
    setError(null)
    setAuthError(null)
    setAuthForm({ email: '', password: '' })
    pushToast('Logged out successfully', 'info')
  }

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

    setTasks((prev) => [optimisticTask, ...prev])
    setTitle('')
    setDescription('')
    setCreateLoading(true)

    try {
      const saved = await createTask({ title: optimisticTask.title, description: optimisticTask.description })
      setTasks((prev) => prev.map((t) => (t._id === tempId ? saved : t)))
      pushToast('Task created', 'success')
    } catch (err) {
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

  if (!token) {
    return (
      <section className="portfolio-section projects-section">
        <h2>Authentication</h2>
        <Toasts toasts={toasts} removeToast={removeToast} />
        {authError && <ErrorMessage message={authError} />}

        <div className="task-form" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button type="button" onClick={() => setAuthMode('login')} disabled={authMode === 'login'}>
              Login
            </button>
            <button type="button" onClick={() => setAuthMode('register')} disabled={authMode === 'register'}>
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
              disabled={authLoading}
            />

            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
              disabled={authLoading}
            />

            <button type="submit" disabled={authLoading}>
              {authLoading ? (authMode === 'login' ? 'Logging in…' : 'Registering…') : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </section>
    )
  }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h2>Tasks</h2>
        <button type="button" onClick={handleLogout} className="danger">Logout</button>
      </div>

      <Toasts toasts={toasts} removeToast={removeToast} />

      {error && <ErrorMessage message={error} />}

      <p style={{ marginBottom: '0.5rem' }}>
        Logged in as <strong>{user?.email || 'user'}</strong>
      </p>

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
                  {task.optimistic && <div style={{ fontSize: 12, color: '#888' }}>Saving…</div>}
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
