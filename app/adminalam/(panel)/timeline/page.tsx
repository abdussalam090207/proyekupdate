import { createClient } from '@/lib/supabase/server'
import TimelineAdminList from '@/components/admin/TimelineAdminList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Timeline | Admin UPDATE PROYEK',
  robots: { index: false, follow: false },
}

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('timeline_items')
    .select('*')
    .order('position', { ascending: true })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>Timeline</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>Kelola poin-poin progres proyek</p>
        </div>
      </div>
      <TimelineAdminList items={items ?? []} />
    </div>
  )
}
