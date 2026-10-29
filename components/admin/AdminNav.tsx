'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Settings, MessageSquare, LogOut } from 'lucide-react'
import { logoutAction } from '@/app/adminalam/actions'
import { useTransition } from 'react'

interface Props {
  unreadCount: number
  mobile?: boolean
}

const navItems = [
  { href: '/adminalam/timeline', label: 'Timeline', icon: Clock },
  { href: '/adminalam/control', label: 'Control', icon: Settings },
  { href: '/adminalam/comments', label: 'Comments', icon: MessageSquare },
]

export default function AdminNav({ unreadCount, mobile }: Props) {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  if (mobile) {
    return (
      <>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          const showBadge = href.includes('comments') && unreadCount > 0
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item focus-ring${active ? ' active' : ''}`}
              style={{ flex: 1, flexDirection: 'column', gap: 4, padding: '6px 4px', fontSize: 11, justifyContent: 'center', borderRadius: 12 }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={22} aria-hidden="true" />
                {showBadge && (
                  <span className="badge" style={{ position: 'absolute', top: -4, right: -6, fontSize: 9, padding: '1px 5px' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              {label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          disabled={pending}
          className="nav-item focus-ring"
          style={{ flex: 1, flexDirection: 'column', gap: 4, padding: '6px 4px', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', justifyContent: 'center', borderRadius: 12 }}
          aria-label="Keluar"
        >
          <LogOut size={22} aria-hidden="true" />
          Keluar
        </button>
      </>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '8px 16px 24px' }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #1A86E0 0%, #0070CC 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          boxShadow: '0 4px 12px rgba(0,112,204,0.3)',
        }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>U</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>UPDATE PROYEK</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>Panel Admin</p>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          const showBadge = href.includes('comments') && unreadCount > 0
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item focus-ring${active ? ' active' : ''}`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
              {showBadge && (
                <span className="badge" style={{ marginLeft: 'auto' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--line)', marginTop: 8 }}>
        <button
          onClick={handleLogout}
          disabled={pending}
          className="nav-item focus-ring"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
        >
          <LogOut size={18} aria-hidden="true" />
          {pending ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </div>
  )
}
