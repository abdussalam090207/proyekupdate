import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import LoginForm from './LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — UPDATE PROYEK',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const user = await getAdminUser()
  if (user) redirect('/adminalam/timeline')

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div className="glass-strong" style={{
        width: '100%',
        maxWidth: 380,
        padding: '40px 36px',
      }}>
        {/* Logo / Judul */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #1A86E0 0%, #0070CC 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(0,112,204,0.32)',
          }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>U</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
            UPDATE PROYEK
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>
            Panel Admin
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
