'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Clock, CalendarDays } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast from '@/components/ui/Toast'
import TimelineForm from './TimelineForm'
import { createTimelineItem, updateTimelineItem, deleteTimelineItem } from '@/app/adminalam/actions'
import { formatDueDate, formatDueAt } from '@/lib/format'
import type { TimelineItem } from '@/lib/supabase/types'

interface Props {
  items: TimelineItem[]
}

function StatusPillSmall({ status }: { status: TimelineItem['status'] }) {
  const map = {
    berjalan: { cls: 'pill pill-berjalan', text: 'Berjalan' },
    selesai: { cls: 'pill pill-selesai', text: 'Selesai' },
    dibatalkan: { cls: 'pill pill-dibatalkan', text: 'Dibatalkan' },
  }
  const { cls, text } = map[status]
  return <span className={cls}>{text}</span>
}

export default function TimelineAdminList({ items }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<TimelineItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<TimelineItem | null>(null)
  const [loadingDel, setLoadingDel] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  async function handleCreate(data: Parameters<typeof createTimelineItem>[0]) {
    const res = await createTimelineItem(data)
    if (res.ok) {
      setAddOpen(false)
      setToast({ type: 'ok', msg: 'Poin berhasil ditambahkan.' })
    } else {
      setToast({ type: 'err', msg: res.error })
    }
    return res
  }

  async function handleUpdate(data: Parameters<typeof createTimelineItem>[0]) {
    if (!editItem) return { ok: false as const, error: '' }
    const res = await updateTimelineItem(editItem.id, data)
    if (res.ok) {
      setEditItem(null)
      setToast({ type: 'ok', msg: 'Poin berhasil diperbarui.' })
    } else {
      setToast({ type: 'err', msg: res.error })
    }
    return res
  }

  async function handleDelete() {
    if (!deleteItem) return
    setLoadingDel(true)
    const res = await deleteTimelineItem(deleteItem.id)
    setLoadingDel(false)
    if (res.ok) {
      setDeleteItem(null)
      setToast({ type: 'ok', msg: 'Poin berhasil dihapus.' })
    } else {
      setToast({ type: 'err', msg: res.error })
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          id="add-timeline-btn"
          type="button"
          onClick={() => setAddOpen(true)}
          className="btn-primary focus-ring"
          aria-label="Tambah poin timeline"
        >
          <Plus size={18} aria-hidden="true" />
          Tambah Poin
        </button>
      </div>

      {items.length === 0 ? (
        <div className="glass" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 15 }}>
            Belum ada poin timeline. Tekan tombol di atas untuk menambah.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => {
            const dueStr = item.duration_type === 'date' && item.due_date
              ? formatDueDate(item.due_date)
              : item.due_at
              ? formatDueAt(item.due_at)
              : null

            return (
              <div key={item.id} className="glass" style={{ padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{item.title}</span>
                    <StatusPillSmall status={item.status} />
                  </div>
                  {dueStr && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {item.duration_type === 'date'
                        ? <CalendarDays size={13} aria-hidden="true" />
                        : <Clock size={13} aria-hidden="true" />
                      }
                      {dueStr}
                    </p>
                  )}
                  {item.description && (
                    <p style={{
                      margin: '8px 0 0',
                      fontSize: 13,
                      color: 'var(--muted)',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setEditItem(item)}
                    className="btn-secondary focus-ring"
                    aria-label={`Edit poin ${item.title}`}
                    style={{ padding: '8px 14px', fontSize: 14 }}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteItem(item)}
                    className="btn-danger focus-ring"
                    aria-label={`Hapus poin ${item.title}`}
                    style={{ padding: '8px 14px', fontSize: 14 }}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Hapus
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Tambah */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Tambah Poin Timeline">
        <TimelineForm onSubmit={handleCreate} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Poin Timeline">
        {editItem && (
          <TimelineForm item={editItem} onSubmit={handleUpdate} onCancel={() => setEditItem(null)} />
        )}
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Hapus Poin"
        message={`Yakin ingin menghapus poin "${deleteItem?.title}"? Tindakan ini tidak bisa dibatalkan.`}
        loading={loadingDel}
      />

      {toast && <Toast type={toast.type} message={toast.msg} onClose={() => setToast(null)} />}
    </>
  )
}
