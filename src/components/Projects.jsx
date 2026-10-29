import { useState, useEffect, useCallback } from 'react'
import api, { getAuthToken, clearAuthToken } from '../api.js'
import Spinner from './Spinner.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import Toasts from './Toast.jsx'

export default function Projects() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Auth form state for P7
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)

  // Task form state
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
  const [editingTask, setEditingTask] = useState(null) // task object when editing
  const [deleteConfirmId, setDeleteConfirmId] = useState(null) // task ID when confirming delete

  // Filter and search
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast notifications
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Load current user profile if token exists
  const checkAuth = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setCurrentUser(null)
      return null
    }
    try {
      const user = await api.getCurrentUser()
      setCurrentUser(user)
      return user
    } catch {
      clearAuthToken()
      setCurrentUser(null)
      return null
    }
  }, [])

  // Load tasks from backend /tasks (P6)
  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth().then((user) => {
      if (user) {
        loadTasks()
      } else {
        setLoading(false)
      }
    })
  }, [checkAuth, loadTasks])

  // Auth submit (login or register)
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      if (authMode === 'register') {
        const res = await api.registerUser(authForm)
        setCurrentUser(res.user)
        addToast('Registration successful! Welcome.', 'success')
      } else {
        const res = await api.loginUser(authForm)
        setCurrentUser(res.user)
        addToast('Logged in successfully!', 'success')
      }
      setAuthForm({ email: '', password: '' })
      loadTasks()
    } catch (err) {
      setAuthError(err.message)
      addToast(err.message, 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    api.clearAuthToken()
    setCurrentUser(null)
    setTasks([])
    addToast('Logged out successfully', 'info')
  }

  // Create Task (POST /tasks) - P6
  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) {
      addToast('Task title is required', 'error')
      return
    }

    setSubmitting(true)
    try {
      const created = await api.createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
      })
      // Update from server response (P6)
      setTasks((prev) => [created, ...prev])
      setNewTask({ title: '', description: '', priority: 'medium' })
      addToast(`Task "${created.title}" created successfully!`, 'success')
    } catch (err) {
      addToast(`Failed to create task: ${err.message}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Update Task (PUT /tasks/:id) - P6
  const handleUpdateTask = async (e) => {
    e.preventDefault()
    if (!editingTask || !editingTask.title.trim()) {
      addToast('Task title cannot be empty', 'error')
      return
    }

    setSubmitting(true)
    try {
      const updated = await api.updateTask(editingTask._id, {
        title: editingTask.title.trim(),
        description: editingTask.description?.trim() || '',
        completed: editingTask.completed,
        priority: editingTask.priority,
      })
      // Update from server response (P6)
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
      setEditingTask(null)
      addToast(`Task "${updated.title}" updated successfully!`, 'success')
    } catch (err) {
      addToast(`Failed to update task: ${err.message}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle Completed status directly
  const handleToggleComplete = async (task) => {
    try {
      const updated = await api.updateTask(task._id, { completed: !task.completed })
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
      addToast(`Task marked as ${updated.completed ? 'completed' : 'pending'}`, 'info')
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error')
    }
  }

  // Delete Task (DELETE /tasks/:id) with confirmation - P6 assignment
  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    setSubmitting(true)
    try {
      await api.deleteTask(deleteConfirmId)
      setTasks((prev) => prev.filter((t) => t._id !== deleteConfirmId))
      addToast('Task deleted successfully', 'success')
    } catch (err) {
      addToast(`Failed to delete task: ${err.message}`, 'error')
    } finally {
      setSubmitting(false)
      setDeleteConfirmId(null)
    }
  }

  // Filtered task list
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  return (
    <section className="portfolio-section" id="projects-tasks" style={{ minHeight: '80vh', padding: '6rem 2rem 4rem' }}>
      <Toasts toasts={toasts} removeToast={removeToast} />
      <div className="container">
        <h2 className="section-heading">Task Management</h2>

        {/* User Status and Authentication Bar (P7) */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.2rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.1rem' }}>👤</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Logged in as <span className="gold-text">{currentUser.email}</span>
                </p>
                <small style={{ color: 'var(--text-muted)' }}>ID: {currentUser._id}</small>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)' }}>
                Please sign in to access and manage your private task database.
              </p>
              {authError && <div style={{ marginBottom: '1rem' }}><ErrorMessage message={authError} /></div>}
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  className="contact-input"
                  style={{ flex: '1 1 200px', minWidth: '180px' }}
                  placeholder="Email address"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  className="contact-input"
                  style={{ flex: '1 1 200px', minWidth: '180px' }}
                  placeholder="Password (min 6 chars)"
                  value={authForm.password}
                  onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.5rem' }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.2rem' }}
                  onClick={() => {
                    setAuthMode((m) => (m === 'login' ? 'register' : 'login'))
                    setAuthError(null)
                  }}
                >
                  Switch to {authMode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>

        {currentUser && (
          <>
            {/* Create Task Form (P6) */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-gold)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              <h3 style={{ margin: '0 0 1rem', color: 'var(--gold)', fontSize: '1.2rem' }}>
                ➕ Create New Task
              </h3>
              <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <input
                    type="text"
                    className="contact-input"
                    placeholder="Task Title (required)"
                    value={newTask.title}
                    onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
                    required
                  />
                  <select
                    className="contact-input"
                    value={newTask.priority}
                    onChange={(e) => setNewTask((t) => ({ ...t, priority: e.target.value }))}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <textarea
                  className="contact-input"
                  style={{ minHeight: '80px' }}
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving Task...' : 'Add Task'}
                </button>
              </form>
            </div>

            {/* Filter and Search Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="text"
                className="contact-input"
                style={{ maxWidth: '320px', padding: '0.6rem 1rem' }}
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Priority:</span>
                {['all', 'low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn ${priorityFilter === p ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                    onClick={() => setPriorityFilter(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List Display */}
            {loading && <Spinner text="Loading your tasks..." />}

            {error && (
              <div style={{ marginBottom: '1.5rem' }}>
                <ErrorMessage message={`Error loading tasks: ${error}`} />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: '0.8rem' }}
                  onClick={loadTasks}
                >
                  Retry Loading
                </button>
              </div>
            )}

            {!loading && !error && (
              <div>
                {filteredTasks.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    {tasks.length === 0 ? 'No tasks yet. Create your first task above!' : 'No tasks match your search.'}
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredTasks.map((task) => (
                      <div
                        key={task._id}
                        style={{
                          background: 'var(--bg-card)',
                          border: `1px solid ${task.completed ? 'var(--border)' : 'var(--border-gold)'}`,
                          borderRadius: '10px',
                          padding: '1.2rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          opacity: task.completed ? 0.75 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: '1 1 300px' }}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task)}
                            style={{ width: '20px', height: '20px', marginTop: '4px', cursor: 'pointer' }}
                          />
                          <div>
                            <h4
                              style={{
                                margin: '0 0 0.3rem',
                                color: 'var(--text-primary)',
                                textDecoration: task.completed ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {task.description}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  background:
                                    task.priority === 'high'
                                      ? '#ef444433'
                                      : task.priority === 'medium'
                                      ? '#f59e0b33'
                                      : '#10b98133',
                                  color:
                                    task.priority === 'high'
                                      ? '#f87171'
                                      : task.priority === 'medium'
                                      ? '#fbbf24'
                                      : '#34d399',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {task.priority}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>
                                Created: {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => setEditingTask(task)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => setDeleteConfirmId(task._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Edit Task Modal Dialog (P6) */}
            {editingTask && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '12px',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '100%',
                  }}
                >
                  <h3 style={{ margin: '0 0 1rem', color: 'var(--gold)' }}>Edit Task</h3>
                  <form onSubmit={handleUpdateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                      type="text"
                      className="contact-input"
                      placeholder="Title"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      required
                    />
                    <textarea
                      className="contact-input"
                      style={{ minHeight: '80px' }}
                      placeholder="Description"
                      value={editingTask.description || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <select
                        className="contact-input"
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editingTask.completed}
                          onChange={(e) => setEditingTask({ ...editingTask, completed: e.target.checked })}
                        />
                        Completed
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setEditingTask(null)}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Dialog (P6 Assignment) */}
            {deleteConfirmId && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid #ef4444',
                    borderRadius: '12px',
                    padding: '2rem',
                    maxWidth: '420px',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  <h3 style={{ margin: '0 0 1rem', color: '#ef4444' }}>⚠️ Delete Confirmation</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Are you sure you want to permanently delete this task? This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setDeleteConfirmId(null)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ background: '#ef4444', borderColor: '#ef4444' }}
                      onClick={confirmDelete}
                      disabled={submitting}
                    >
                      {submitting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
