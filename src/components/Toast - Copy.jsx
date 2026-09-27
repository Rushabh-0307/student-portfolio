import { useEffect } from 'react'

export default function Toasts({ toasts, removeToast }) {
  useEffect(() => {
    if (!toasts || toasts.length === 0) return
    const timers = toasts.map((t) => setTimeout(() => removeToast(t.id), 4000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  return (
    <div className="toast-container" aria-live="polite" style={{position:'fixed', top:12, right:12, zIndex:9999}}>
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'info'}`} style={{marginBottom:8, padding:'8px 12px', background:'#222', color:'#fff', borderRadius:6}}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
