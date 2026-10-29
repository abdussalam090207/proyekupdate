'use client'

import { useState, useRef } from 'react'
import { Loader2, Send } from 'lucide-react'
import Toast from '@/components/ui/Toast'

interface FormState {
  name: string
  email: string
  message: string
  website: string // honeypot
}

const MAX_MESSAGE = 2000

export default function CommentForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '', website: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [charCount, setCharCount] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nama wajib diisi'
    else if (form.name.trim().length > 80) errs.name = 'Nama terlalu panjang (maks 80)'
    if (!form.email) errs.email = 'Email wajib diisi'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Email tidak valid'
    if (!form.message.trim()) errs.message = 'Pesan wajib diisi'
    else if (form.message.length > MAX_MESSAGE) errs.message = `Pesan terlalu panjang (maks ${MAX_MESSAGE})`
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.ok) {
        setToast({ type: 'ok', msg: 'Terima kasih! Komentarmu sudah terkirim.' })
        setForm({ name: '', email: '', message: '', website: '' })
        setCharCount(0)
        setErrors({})
      } else {
        setToast({ type: 'err', msg: json.error ?? 'Gagal mengirim. Coba lagi.' })
      }
    } catch {
      setToast({ type: 'err', msg: 'Gagal menghubungi server. Periksa koneksi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="glass" style={{ padding: '28px 32px' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
          Tinggalkan Komentar
        </h2>
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          {/* Honeypot — tersembunyi untuk bot */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Nama */}
            <div>
              <label htmlFor="comment-name" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                Nama <span aria-hidden="true" style={{ color: '#0070CC' }}>*</span>
              </label>
              <input
                id="comment-name"
                type="text"
                className="input-glass focus-ring"
                placeholder="Nama kamu"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                autoComplete="name"
                aria-describedby={errors.name ? 'comment-name-err' : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p id="comment-name-err" role="alert" style={{ margin: '6px 0 0', fontSize: 13, color: '#0070CC' }}>{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="comment-email" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                Email <span aria-hidden="true" style={{ color: '#0070CC' }}>*</span>
              </label>
              <input
                id="comment-email"
                type="email"
                className="input-glass focus-ring"
                placeholder="email@kamu.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                autoComplete="email"
                aria-describedby={errors.email ? 'comment-email-err' : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p id="comment-email-err" role="alert" style={{ margin: '6px 0 0', fontSize: 13, color: '#0070CC' }}>{errors.email}</p>
              )}
            </div>

            {/* Pesan */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label htmlFor="comment-message" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                  Pesan <span aria-hidden="true" style={{ color: '#0070CC' }}>*</span>
                </label>
                <span style={{
                  fontSize: 12,
                  color: charCount > MAX_MESSAGE ? '#0070CC' : 'var(--muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {charCount}/{MAX_MESSAGE}
                </span>
              </div>
              <textarea
                id="comment-message"
                className="input-glass focus-ring"
                placeholder="Tuliskan komentarmu..."
                rows={5}
                value={form.message}
                onChange={e => {
                  setForm(p => ({ ...p, message: e.target.value }))
                  setCharCount(e.target.value.length)
                }}
                style={{ resize: 'vertical', minHeight: 120 }}
                aria-describedby={errors.message ? 'comment-message-err' : undefined}
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <p id="comment-message-err" role="alert" style={{ margin: '6px 0 0', fontSize: 13, color: '#0070CC' }}>{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary focus-ring"
              disabled={loading}
              style={{ alignSelf: 'flex-start' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={16} aria-hidden="true" />
                  Kirim Komentar
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.msg}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
