import { createClient } from '@/lib/supabase/server'
import CommentList from '@/components/admin/CommentList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Komentar | Admin UPDATE PROYEK',
  robots: { index: false, follow: false },
}

export default async function CommentsPage() {
  const supabase = await createClient()
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>Komentar</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>
          {(comments ?? []).length} komentar ·{' '}
          {(comments ?? []).filter(c => !c.is_read).length} belum dibaca
        </p>
      </div>
      <CommentList initialComments={comments ?? []} />
    </div>
  )
}
