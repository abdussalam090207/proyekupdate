import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()
  if (!user) redirect('/adminalam')

  // Hitung komentar belum dibaca
  const supabase = await createClient()
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  const unreadCount = count ?? 0

  return (
    <>
      {/* X-Robots-Tag noindex via headers dilakukan di proxy.ts / next.config.ts */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar desktop */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
        }} className="sidebar-desktop">
          <AdminNav unreadCount={unreadCount} />
        </aside>

        {/* Konten */}
        <main style={{ flex: 1, padding: '28px 24px', minWidth: 0, paddingBottom: 100 }}>
          {children}
        </main>
      </div>

      {/* Tab bar mobile */}
      <div className="tab-bar-mobile">
        <AdminNav unreadCount={unreadCount} mobile />
      </div>

      <style>{`
        .sidebar-desktop { display: flex; }
        .tab-bar-mobile { display: none; }

        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .tab-bar-mobile {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            padding: 8px 12px;
            padding-bottom: max(8px, env(safe-area-inset-bottom));
            background: rgba(255,255,255,0.78);
            -webkit-backdrop-filter: blur(32px) saturate(190%);
            backdrop-filter: blur(32px) saturate(190%);
            border-top: 1px solid var(--line);
            z-index: 100;
            gap: 4px;
          }
        }
      `}</style>
    </>
  )
}
