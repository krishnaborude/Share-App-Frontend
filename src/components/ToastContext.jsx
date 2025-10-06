import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id))
  }, [])

  const push = useCallback((message, type = 'info', timeout = 4000) => {
    const toast = { id: ++id, message, type }
    setToasts((t) => [toast, ...t])
    if (timeout > 0) setTimeout(() => remove(toast.id), timeout)
    return toast.id
  }, [remove])

  const value = {
    push,
    success: (m, t=4000) => push(m, 'success', t),
    error: (m, t=6000) => push(m, 'error', t),
    info: (m, t=4000) => push(m, 'info', t),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts-root" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Close">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default ToastContext
