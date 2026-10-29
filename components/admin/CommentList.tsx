'use client'

import { useState, useEffect } from 'react'
import { Mail, Trash2, Check, Circle } from 'lucide-react'
import { markCommentRead, deleteComment } from '@/app/adminalam/actions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatRelative, formatFullWIB } from '@/lib/format'
import type { Comment } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'

interface Props {
  initialComments: Comment[]
}

export default function CommentList({ initialComments }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null)
  const [loadingDel, setLoadingDel] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const router = useRouter()

  // Realtime: komentar baru muncul tanpa reload
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin-comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, payload => {
        const newComment = payload.new as Comment
        setComments(prev => [newComment, ...prev])
        setToast({ type: 'ok', msg: `Komentar baru dari ${newComment.name}` })
        router.refresh() // update badge
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comments' }, payload => {
        const updated = payload.new as Comment
        setComments(prev => prev.map(c => c.id === updated.id ? updated : c))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, payload => {
        setComments(prev => prev.filter(c => c.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  async function handleToggleRead(comment: Comment) {
    const res = await markCommentRead(comment.id, !comment.is_read)
    if (res.ok) {
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, is_read: !c.is_read } : c))
    } else {
      setToast({ type: 'err', msg: res.error })
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoadingDel(true)
    const res = await deleteComment(deleteTarget.id)
    setLoadingDel(false)
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ type: 'ok', msg: 'Komentar dihapus.' })
    } else {
      setToast({ type: 'err', msg: res.error })
    }
  }

  if (comments.length === 0) {
    return (
      <div className="glass" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 15 }}>Belum ada komentar.</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map(comment => (
          <div
            key={comment.id}
            className="glass"
            style={{
              padding: '20px 22px',
              borderLeft: !comment.is_read ? '3px solid #0070CC' : '3px solid transparent',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Penanda belum dibaca */}
              <div style={{ paddingTop: 2, flexShrink: 0 }}>
                {!comment.is_read && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#0070CC',
                    marginTop: 4,
                  }} aria-label="Belum dibaca" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{comment.name}</span>
                  <a
                    href={`mailto:${comment.email}`}
                    style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}
                  >
                    {comment.email}
                  </a>
                  <span
                    title={formatFullWIB(comment.created_at)}
                    style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}
                  >
                    {formatRelative(comment.created_at)}
                  </span>
                </div>

                {/* Pesan */}
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: 'var(--ink-2)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}>
                  {comment.message}
                </p>
              </div>
            </div>

            {/* Aksi */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleToggleRead(comment)}
                className="btn-secondary focus-ring"
                aria-label={comment.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                style={{ padding: '6px 12px', fontSize: 13, gap: 6 }}
              >
                {comment.is_read
                  ? <><Circle size={14} aria-hidden="true" /> Tandai Belum Dibaca</>
                  : <><Check size={14} aria-hidden="true" /> Tandai Dibaca</>
                }
              </button>

              <a
                href={`mailto:${comment.email}?subject=Re: UPDATE PROYEK`}
                className="btn-secondary focus-ring"
                style={{ padding: '6px 12px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 14 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail size={14} aria-hidden="true" />
                Balas via Email
              </a>

              <button
                type="button"
                onClick={() => setDeleteTarget(comment)}
                className="btn-danger focus-ring"
                aria-label="Hapus komentar"
                style={{ padding: '6px 12px', fontSize: 13, gap: 6 }}
              >
                <Trash2 size={14} aria-hidden="true" />
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Komentar"
        message={`Yakin ingin menghapus komentar dari "${deleteTarget?.name}"?`}
        loading={loadingDel}
      />

      {toast && <Toast type={toast.type} message={toast.msg} onClose={() => setToast(null)} />}
    </>
  )
}
