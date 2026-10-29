'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { TimelineItem } from '@/lib/supabase/types'

interface FormData {
  title: string
  description: string
  duration_type: 'date' | 'time'
  due_date: string | null
  due_at: string | null
}

interface Props {
  item?: TimelineItem
  onSubmit: (data: FormData) => Promise<{ ok: boolean; error?: string }>
  onCancel: () => void
}

function toDatetimeLocalWIB(isoStr: string): string {
  // Konversi ISO UTC → local string untuk datetime-local input (tampil sebagai WIB)
  const date = new Date(isoStr)
  const wibOffset = 7 * 60
  const local = new Date(date.getTime() + wibOffset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function TimelineForm({ item, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [durationType, setDurationType] = useState<'date' | 'time'>(item?.duration_type ?? 'date')
  const [dueDate, setDueDate] = useState(item?.due_date ?? '')
  const [dueAt, setDueAt] = useState(item?.due_at ? toDatetimeLocalWIB(item.due_at) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim()) { setError('Judul wajib diisi'); return }
    if (durationType === 'date' && !dueDate) { setError('Tanggal tenggat wajib diisi'); return }
    if (durationType === 'time' && !dueAt) { setError('Waktu tenggat wajib diisi'); return }

    setLoading(true)
    const res = await onSubmit({
      title,
      description,
      duration_type: durationType,
      due_date: durationType === 'date' ? dueDate : null,
      due_at: durationType === 'time' ? dueAt : null,
    })
    setLoading(false)

    if (!res.ok && res.error) setError(res.error)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Judul */}
        <div>
          <label htmlFor="tf-title" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
            Judul Timeline <span style={{ color: '#0070CC' }}>*</span>
          </label>
          <input
            id="tf-title"
            type="text"
            className="input-glass focus-ring"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Judul poin timeline"
            maxLength={160}
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label htmlFor="tf-desc" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
            Deskripsi
          </label>
          <textarea
            id="tf-desc"
            className="input-glass focus-ring"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Deskripsi opsional..."
            rows={4}
            maxLength={2000}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Tipe Durasi */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
            Durasi Waktu <span style={{ color: '#0070CC' }}>*</span>
          </label>
          <div className="segmented-control" role="radiogroup" aria-label="Tipe durasi">
            <button
              type="button"
              role="radio"
              aria-checked={durationType === 'date'}
              className={`segmented-btn${durationType === 'date' ? ' active' : ''} focus-ring`}
              onClick={() => setDurationType('date')}
            >
              Tanggal
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={durationType === 'time'}
              className={`segmented-btn${durationType === 'time' ? ' active' : ''} focus-ring`}
              onClick={() => setDurationType('time')}
            >
              Tanggal + Jam
            </button>
          </div>
        </div>

        {/* Input Tanggal / Datetime */}
        {durationType === 'date' ? (
          <div>
            <label htmlFor="tf-due-date" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              Tanggal Tenggat <span style={{ color: '#0070CC' }}>*</span>
            </label>
            <input
              id="tf-due-date"
              type="date"
              className="input-glass focus-ring"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="tf-due-at" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              Tanggal & Jam Tenggat (WIB) <span style={{ color: '#0070CC' }}>*</span>
            </label>
            <input
              id="tf-due-at"
              type="datetime-local"
              className="input-glass focus-ring"
              value={dueAt}
              onChange={e => setDueAt(e.target.value)}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p role="alert" style={{ margin: 0, fontSize: 14, color: '#0070CC' }}>{error}</p>
        )}

        {/* Tombol */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onCancel} className="btn-secondary focus-ring" disabled={loading}>
            Batal
          </button>
          <button type="submit" className="btn-primary focus-ring" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} />
                Menyimpan...
              </>
            ) : item ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
