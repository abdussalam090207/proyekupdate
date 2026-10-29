'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Fokus trap
      if (e.key === 'Tab' && boxRef.current) {
        const focusable = boxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault()
          ;(e.shiftKey ? last : first)?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    boxRef.current?.focus()

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="modal-box" ref={boxRef} tabIndex={-1}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring"
            aria-label="Tutup"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-2)',
              padding: 4,
              borderRadius: 8,
              display: 'flex',
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
