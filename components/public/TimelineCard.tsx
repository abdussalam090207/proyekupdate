'use client'

import { useState } from 'react'
import { ChevronDown, Check, X, Clock } from 'lucide-react'
import type { TimelineItem } from '@/lib/supabase/types'
import { formatDueDate, formatDueAt } from '@/lib/format'

interface Props {
  item: TimelineItem
}

function StatusPill({ status }: { status: TimelineItem['status'] }) {
  if (status === 'berjalan') {
    return (
      <span className="pill pill-berjalan">
        <span className="pulse-dot" aria-hidden="true" />
        Berjalan
      </span>
    )
  }
  if (status === 'selesai') {
    return (
      <span className="pill pill-selesai">
        <Check size={11} strokeWidth={3} aria-hidden="true" />
        Selesai
      </span>
    )
  }
  return (
    <span className="pill pill-dibatalkan">
      <X size={11} strokeWidth={3} aria-hidden="true" />
      Dibatalkan
    </span>
  )
}

export default function TimelineCard({ item }: Props) {
  const [open, setOpen] = useState(false)
  const hasDesc = item.description && item.description.trim().length > 0
  const descId = `desc-${item.id}`

  const dueDateStr = item.duration_type === 'date' && item.due_date
    ? formatDueDate(item.due_date)
    : item.due_at
    ? formatDueAt(item.due_at)
    : null

  return (
    <div className="glass" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            margin: '0 0 6px',
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.35,
          }}>
            {item.title}
          </h2>
          {dueDateStr && (
            <p style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--ink-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <Clock size={13} aria-hidden="true" />
              {dueDateStr}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <StatusPill status={item.status} />
          {hasDesc && (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={descId}
              onClick={() => setOpen(v => !v)}
              className="focus-ring"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-2)',
                padding: '4px',
                borderRadius: 8,
                display: 'flex',
                transition: 'color 150ms, transform 150ms',
              }}
              title={open ? 'Sembunyikan deskripsi' : 'Lihat deskripsi'}
            >
              <ChevronDown
                size={18}
                aria-hidden="true"
                style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 250ms ease-out' }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown deskripsi */}
      {hasDesc && (
        <div id={descId} className={`dropdown-content${open ? ' open' : ''}`} aria-hidden={!open}>
          <div className="dropdown-inner">
            <div style={{
              paddingTop: 16,
              borderTop: '1px solid var(--line)',
              marginTop: 16,
              fontSize: 15,
              color: 'var(--ink-2)',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>
              {item.description}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
