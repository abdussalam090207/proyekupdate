import type { TimelineItem } from '@/lib/supabase/types'
import TimelineCard from './TimelineCard'

interface Props {
  items: TimelineItem[]
}

export default function TimelineList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="glass" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 16 }}>
          Belum ada update. Cek lagi nanti.
        </p>
      </div>
    )
  }

  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
      {items.map((item, idx) => (
        <li key={item.id} style={{ position: 'relative', paddingLeft: 40, paddingBottom: idx < items.length - 1 ? 24 : 0 }}>
          {/* garis penghubung */}
          {idx < items.length - 1 && (
            <div className="timeline-line" aria-hidden="true" />
          )}
          {/* node */}
          <div
            className="timeline-node"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 15,
              top: 18,
              background: item.status === 'selesai' ? '#0070CC' : item.status === 'dibatalkan' ? 'var(--muted)' : '#0070CC',
            }}
          />
          <TimelineCard item={item} />
        </li>
      ))}
    </ol>
  )
}
