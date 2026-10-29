import type { TimelineItem } from '@/lib/supabase/types'

interface Props {
  items: TimelineItem[]
}

export default function ProgressSummary({ items }: Props) {
  const countable = items.filter(i => i.status !== 'dibatalkan')
  const done = countable.filter(i => i.status === 'selesai').length
  const total = countable.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="glass" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-2)', fontWeight: 500 }}>
          <span style={{ color: 'var(--ink)', fontWeight: 700, fontSize: 20 }}>{done}</span>
          {' '}dari{' '}
          <span style={{ color: 'var(--ink)', fontWeight: 700, fontSize: 20 }}>{total}</span>
          {' '}tahap selesai
        </p>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0070CC' }}>{pct}%</span>
      </div>
      <div className="progress-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progres: ${done} dari ${total} tahap selesai`}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
