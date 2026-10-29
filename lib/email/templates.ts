import type { Comment, TimelineItem } from '../supabase/types'
import { formatDueDate, formatDueAt } from '../format'

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function emailLayout(o: {
  preheader: string; title: string; bodyHtml: string; ctaLabel: string; ctaUrl: string
}) {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${esc(o.title)}</title></head>
<body style="margin:0;padding:0;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
  style="width:100%;max-width:560px;border:1px solid #DBE9F7;border-radius:24px;overflow:hidden;background:#ffffff;
  font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0A1B2E;">
  <tr><td bgcolor="#0070CC" style="background-color:#0070CC;background-image:linear-gradient(135deg,#0070CC 0%,#0070CC 55%,#80C0FF 100%);padding:28px 32px;">
    <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#ffffff;">UPDATE PROYEK</div>
    <div style="font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;margin-top:8px;">${esc(o.title)}</div>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    ${o.bodyHtml}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr>
      <td bgcolor="#0070CC" style="border-radius:14px;">
        <a href="${esc(o.ctaUrl)}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(o.ctaLabel)}</a>
      </td></tr></table>
  </td></tr>
  <tr><td style="padding:16px 32px 24px;font-size:12px;color:#6B7C8F;border-top:1px solid #EAF2FB;">
    Email otomatis dari UPDATE PROYEK.
  </td></tr>
</table></td></tr></table></body></html>`
}

function detailRow(label: string, value: string) {
  return `<div style="margin-bottom:12px;">
    <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6B7C8F;">${label}</div>
    <div style="font-size:15px;font-weight:600;color:#0A1B2E;margin-top:2px;">${value}</div>
  </div>`
}

/**
 * Email #1 — komentar baru
 */
export function commentEmailTemplate(comment: Pick<Comment, 'name' | 'email' | 'message' | 'created_at'>, siteUrl: string) {
  const timeWIB = new Date(comment.created_at).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Asia/Jakarta',
  }).replace(':', '.') + ' WIB'

  const bodyHtml = `
    ${detailRow('Dari', esc(comment.name))}
    ${detailRow('Email', esc(comment.email))}
    ${detailRow('Waktu', timeWIB)}
    <div style="margin-top:16px;padding:16px;background:#F6FAFF;border-radius:12px;border-left:3px solid #0070CC;">
      <div style="font-size:13px;color:#6B7C8F;margin-bottom:8px;">Pesan:</div>
      <div style="font-size:15px;color:#0A1B2E;white-space:pre-line;line-height:1.6;">${esc(comment.message)}</div>
    </div>
  `

  const text = `Komentar baru dari ${comment.name} (${comment.email})\n\nWaktu: ${timeWIB}\n\nPesan:\n${comment.message}\n\nBuka di Admin: ${siteUrl}/adminalam/comments`

  const subject = `Komentar baru dari ${comment.name} | UPDATE PROYEK`

  const html = emailLayout({
    preheader: `Komentar baru dari ${comment.name}: ${comment.message.slice(0, 80)}`,
    title: `Komentar baru dari ${comment.name}`,
    bodyHtml,
    ctaLabel: 'Buka di Admin',
    ctaUrl: `${siteUrl}/adminalam/comments`,
  })

  return { subject, html, text, replyTo: comment.email }
}

/**
 * Email #2 — pengingat tenggat
 */
export function reminderEmailTemplate(item: TimelineItem, projectTitle: string, siteUrl: string) {
  const isDate = item.duration_type === 'date'
  const subjectPrefix = isDate ? `Besok tenggat: ${item.title}` : `1 jam lagi tenggat: ${item.title}`
  const label = isDate ? 'H-1' : '1 jam lagi'
  const tenggatStr = isDate
    ? formatDueDate(item.due_date!)
    : formatDueAt(item.due_at!)

  const desc = item.description ? item.description.slice(0, 200) : ''

  const bodyHtml = `
    ${detailRow('Proyek', esc(projectTitle))}
    ${detailRow('Poin Timeline', esc(item.title))}
    ${detailRow('Tenggat', esc(tenggatStr))}
    ${detailRow('Label', label)}
    ${detailRow('Status', item.status)}
    ${desc ? `<div style="margin-top:16px;padding:16px;background:#F6FAFF;border-radius:12px;border-left:3px solid #0070CC;">
      <div style="font-size:13px;color:#6B7C8F;margin-bottom:8px;">Deskripsi:</div>
      <div style="font-size:14px;color:#0A1B2E;white-space:pre-line;line-height:1.6;">${esc(desc)}${item.description.length > 200 ? '…' : ''}</div>
    </div>` : ''}
  `

  const text = `${label} — ${item.title}\n\nProyek: ${projectTitle}\nTenggat: ${tenggatStr}\nStatus: ${item.status}\n\nBuka Control: ${siteUrl}/adminalam/control`

  const html = emailLayout({
    preheader: `${label}: ${item.title} — tenggat ${tenggatStr}`,
    title: subjectPrefix,
    bodyHtml,
    ctaLabel: 'Buka Control',
    ctaUrl: `${siteUrl}/adminalam/control`,
  })

  return { subject: subjectPrefix, html, text }
}
