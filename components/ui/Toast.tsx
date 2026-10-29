'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  type: 'ok' | 'err'
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 4500 }: Props) {
  const [leaving, setLeaving] = useState(false)

  function dismiss() {
    setLeaving(true)
    setTimeout(onClose, 200)
  }

  useEffect(() => {
    const t = setTimeout(dismiss, duration)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <div
        className={`toast${leaving ? ' toast-out' : ''}`}
        role="status"
        onClick={dismiss}
        style={{ cursor: 'pointer' }}
      >
        {type === 'ok'
          ? <CheckCircle size={18} aria-hidden="true" style={{ color: '#0070CC', flexShrink: 0 }} />
          : <AlertCircle size={18} aria-hidden="true" style={{ color: 'var(--muted)', flexShrink: 0 }} />
        }
        <span style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.4 }}>{message}</span>
      </div>
    </div>
  )
}
