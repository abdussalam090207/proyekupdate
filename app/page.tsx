import { createClient } from '@/lib/supabase/server'
import TimelineList from '@/components/public/TimelineList'
import ProgressSummary from '@/components/public/ProgressSummary'
import CommentForm from '@/components/public/CommentForm'
import Footer from '@/components/public/Footer'
import LiveRefresh from '@/components/public/LiveRefresh'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('project')
    .select('title')
    .eq('id', 1)
    .single()

  const title = project?.title ?? 'Belum ada judul proyek'
  return {
    title: `${title} | UPDATE PROYEK`,
    description: `Pantau progres: ${title}. Lihat timeline dan status terbaru.`,
  }
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: project }, { data: timelineItems }] = await Promise.all([
    supabase.from('project').select('*').eq('id', 1).single(),
    supabase.from('timeline_items').select('*').order('position', { ascending: true }),
  ])

  const title = project?.title ?? 'Belum ada judul proyek'
  const items = timelineItems ?? []

  return (
    <>
      <LiveRefresh />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Header */}
        <header style={{ marginBottom: 40, paddingTop: 24 }}>
          <p style={{
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-2)',
            marginBottom: 10,
            fontWeight: 600,
          }}>
            Update Proyek
          </p>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            {title}
          </h1>
        </header>

        {/* Ringkasan progres */}
        <ProgressSummary items={items} />

        {/* Timeline */}
        <section style={{ marginTop: 36 }}>
          <TimelineList items={items} />
        </section>

        {/* Form komentar */}
        <section style={{ marginTop: 56 }}>
          <CommentForm />
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
