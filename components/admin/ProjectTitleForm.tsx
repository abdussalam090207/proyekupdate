'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { saveProjectTitle } from '@/app/adminalam/actions'
import Toast from '@/components/ui/Toast'

interface Props {
  currentTitle: string
}

export default function ProjectTitleForm({ currentTitle }: Props) {
  const [title, setTitle] = useState(currentTitle)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const res = await saveProjectTitle(title)
    setLoading(false)
    if (res.ok) {
      setToast({ type: 'ok', msg: 'Judul proyek berhasil disimpan.' })
    } else {
      setToast({ type: 'err', msg: res.error })
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, maxWidth: 560 }}>
        <input
          id="project-title-input"
          type="text"
          className="input-glass focus-ring"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Judul proyek..."
          maxLength={160}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn-primary focus-ring"
          disabled={loading || !title.trim()}
          style={{ flexShrink: 0 }}
        >
          {loading
            ? <Loader2 size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} />
            : <Save size={16} aria-hidden="true" />
          }
          Simpan
        </button>
      </form>
      {toast && <Toast type={toast.type} message={toast.msg} onClose={() => setToast(null)} />}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
