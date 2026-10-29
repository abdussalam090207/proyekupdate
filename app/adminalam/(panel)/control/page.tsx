import { createClient } from '@/lib/supabase/server'
import SortableControlList from '@/components/admin/SortableControlList'
import ProjectTitleForm from '@/components/admin/ProjectTitleForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Control — Admin UPDATE PROYEK',
  robots: { index: false, follow: false },
}

export default async function ControlPage() {
  const supabase = await createClient()

  const [{ data: project }, { data: items }] = await Promise.all([
    supabase.from('project').select('*').eq('id', 1).single(),
    supabase.from('timeline_items').select('*').order('position', { ascending: true }),
  ])

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>Control</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>Judul proyek, status & urutan poin</p>
      </div>

      {/* Judul proyek */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: '0 0 14px' }}>Judul Proyek</h2>
        <ProjectTitleForm currentTitle={project?.title ?? ''} />
      </section>

      {/* Daftar timeline drag & drop */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: '0 0 14px' }}>Urutan & Status Poin</h2>
        <SortableControlList items={items ?? []} />
      </section>
    </div>
  )
}
