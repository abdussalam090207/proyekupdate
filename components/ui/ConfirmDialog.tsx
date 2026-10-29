'use client'

import Modal from './Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  loading?: boolean
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} className="btn-secondary focus-ring" disabled={loading}>
          Batal
        </button>
        <button type="button" onClick={onConfirm} className="btn-danger focus-ring" disabled={loading}>
          {loading ? 'Menghapus...' : 'Ya, hapus'}
        </button>
      </div>
    </Modal>
  )
}
