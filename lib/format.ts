/**
 * Format tanggal dan waktu dalam zona Asia/Jakarta (WIB)
 */

const WIB = 'Asia/Jakarta'

/**
 * Format due_date (tipe 'date') → "Kamis, 12 November 2026"
 */
export function formatDueDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: WIB,
  })
}

/**
 * Format due_at (tipe 'time') → "12 Nov 2026 · 14.00 WIB"
 */
export function formatDueAt(isoStr: string): string {
  const date = new Date(isoStr)
  const datepart = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: WIB,
  })
  const timepart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: WIB,
  }).replace(':', '.')
  return `${datepart} · ${timepart} WIB`
}

/**
 * Format waktu relatif → "3 menit lalu", "2 jam lalu", dll.
 */
export function formatRelative(isoStr: string): string {
  const now = Date.now()
  const then = new Date(isoStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} bulan lalu`
  return `${Math.floor(diff / 31536000)} tahun lalu`
}

/**
 * Format waktu lengkap WIB untuk tooltip → "Kamis, 12 Nov 2026, 14.00 WIB"
 */
export function formatFullWIB(isoStr: string): string {
  const date = new Date(isoStr)
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: WIB,
  }).replace(',', ',').replace(':', '.') + ' WIB'
}
