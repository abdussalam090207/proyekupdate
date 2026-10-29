'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { loginAction } from './actions'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginAction(username, password)
      if (result.ok) {
        router.push('/adminalam/timeline')
        router.refresh()
      } else {
        setError(result.error)
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="login-username" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
            Username
          </label>
          <input
            id="login-username"
            type="text"
            className="input-glass focus-ring"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              className="input-glass focus-ring"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Sembunyikan password' : 'Tampilkan password'}
              className="focus-ring"
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted)',
                padding: 0,
                display: 'flex',
              }}
            >
              {showPwd ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" style={{
            margin: 0,
            padding: '10px 14px',
            background: 'rgba(0,112,204,0.06)',
            border: '1px solid rgba(0,112,204,0.2)',
            borderRadius: 12,
            fontSize: 14,
            color: 'var(--ink)',
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary focus-ring"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} />
              Masuk...
            </>
          ) : 'Masuk'}
        </button>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </form>
  )
}
