import 'server-only'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  // Lazy import + init agar tidak error saat build tanpa env vars
  const { Resend } = await import('resend')
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY tidak diset — email tidak terkirim')
    return { ok: false, error: 'RESEND_API_KEY tidak diset' }
  }

  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM ?? 'UPDATE PROYEK <onboarding@resend.dev>'

  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  })

  if (error) {
    console.error('[Email] Gagal kirim email:', error)
    return { ok: false, error: String(error) }
  }

  return { ok: true }
}
