import { useEffect } from 'react'

export default function Toasts({ toasts, removeToast }) {
  useEffect(() => {
    if (!toasts || toasts.length === 0) return
    const timers = toasts.map((t) => setTimeout(() => removeToast(t.id), 4000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return '#065f46' // emerald green
      case 'error':
        return '#991b1b' // crimson red
      case 'warning':
        return '#92400e' // amber
      default:
        return '#1e293b' // dark slate
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓ '
      case 'error':
        return '✕ '
      case 'warning':
        return '⚠ '
      default:
        return 'ℹ '
    }
  }

  return (
    <div
      className="toast-container"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type || 'info'}`}
          style={{
            padding: '10px 16px',
            backgroundColor: getBackgroundColor(t.type),
            color: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>
            <strong>{getIcon(t.type)}</strong>
            {t.message}
          </span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffffaa',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
