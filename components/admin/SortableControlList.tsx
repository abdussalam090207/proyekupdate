'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, X, RotateCcw, Clock, CalendarDays } from 'lucide-react'
import { setItemStatus, reorderItems } from '@/app/adminalam/actions'
import Toast from '@/components/ui/Toast'
import { formatDueDate, formatDueAt } from '@/lib/format'
import type { TimelineItem } from '@/lib/supabase/types'

interface SortableRowProps {
  item: TimelineItem
  onStatusChange: (id: string, status: TimelineItem['status']) => Promise<void>
}

function SortableRow({ item, onStatusChange }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const [loading, setLoading] = useState(false)

  async function handleStatus(status: TimelineItem['status']) {
    setLoading(true)
    await onStatusChange(item.id, status)
    setLoading(false)
  }

  const dueStr = item.duration_type === 'date' && item.due_date
    ? formatDueDate(item.due_date)
    : item.due_at
    ? formatDueAt(item.due_at)
    : null

  return (
    <div ref={setNodeRef} style={{ ...style, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }} className="glass">
      {/* Grip */}
      <button
        type="button"
        className="drag-handle focus-ring"
        aria-label={`Seret untuk ubah urutan: ${item.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{item.title}</p>
        {dueStr && (
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {item.duration_type === 'date'
              ? <CalendarDays size={12} aria-hidden="true" />
              : <Clock size={12} aria-hidden="true" />
            }
            {dueStr}
          </p>
        )}
      </div>

      {/* Status + Aksi */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <span className={`pill ${item.status === 'berjalan' ? 'pill-berjalan' : item.status === 'selesai' ? 'pill-selesai' : 'pill-dibatalkan'}`}>
          {item.status === 'berjalan' ? 'Berjalan' : item.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
        </span>

        {item.status !== 'selesai' && (
          <button
            type="button"
            onClick={() => handleStatus('selesai')}
            disabled={loading}
            className="btn-secondary focus-ring"
            aria-label="Tandai selesai"
            style={{ padding: '6px 12px', fontSize: 13, gap: 6 }}
          >
            <Check size={14} aria-hidden="true" />
            Selesai
          </button>
        )}

        {item.status !== 'dibatalkan' && (
          <button
            type="button"
            onClick={() => handleStatus('dibatalkan')}
            disabled={loading}
            className="btn-danger focus-ring"
            aria-label="Batalkan poin"
            style={{ padding: '6px 12px', fontSize: 13, gap: 6 }}
          >
            <X size={14} aria-hidden="true" />
            Batalkan
          </button>
        )}

        {item.status !== 'berjalan' && (
          <button
            type="button"
            onClick={() => handleStatus('berjalan')}
            disabled={loading}
            className="btn-secondary focus-ring"
            aria-label="Kembalikan ke berjalan"
            style={{ padding: '6px 12px', fontSize: 13, gap: 6 }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Kembalikan
          </button>
        )}
      </div>
    </div>
  )
}

interface Props {
  items: TimelineItem[]
}

export default function SortableControlList({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)

    const prev = items
    const newOrder = arrayMove(items, oldIndex, newIndex)
    setItems(newOrder) // optimistic

    const res = await reorderItems(newOrder.map(i => i.id))
    if (res.ok) {
      setToast({ type: 'ok', msg: 'Urutan berhasil disimpan.' })
    } else {
      setItems(prev) // rollback
      setToast({ type: 'err', msg: 'Gagal menyimpan urutan. Urutan dikembalikan.' })
    }
  }

  const handleStatusChange = useCallback(async (id: string, status: TimelineItem['status']) => {
    const res = await setItemStatus(id, status)
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
      setToast({ type: 'ok', msg: `Status diperbarui: ${status}.` })
    } else {
      setToast({ type: 'err', msg: res.error })
    }
  }, [])

  if (items.length === 0) {
    return (
      <div className="glass" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 15 }}>
          Belum ada poin. Tambahkan di halaman Timeline.
        </p>
      </div>
    )
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <SortableRow key={item.id} item={item} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {toast && <Toast type={toast.type} message={toast.msg} onClose={() => setToast(null)} />}
    </>
  )
}
