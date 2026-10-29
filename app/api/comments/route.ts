import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { CommentSchema, firstZodError } from '@/lib/validation'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { commentEmailTemplate } from '@/lib/email/templates'
import type { Database } from '@/lib/supabase/types'

type CommentInsert = Database['public']['Tables']['comments']['Insert']

function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? 'fallback-salt-change-me'
  return createHash('sha256').update(ip + salt).digest('hex')
}

function getIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body tidak valid' }, { status: 400 })
  }

  const parsed = CommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstZodError(parsed.error) }, { status: 400 })
  }

  const { name, email, message, website } = parsed.data

  // Honeypot
  if (website) {
    return NextResponse.json({ ok: true })
  }

  const ip = getIP(req)
  const ipHash = hashIP(ip)
  const adminClient = getAdminClient()

  // Rate limit: max 3 komentar per 10 menit per IP
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await adminClient
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', tenMinsAgo)

  if (count !== null && count >= 3) {
    return NextResponse.json(
      { ok: false, error: 'Terlalu sering mengirim. Coba lagi beberapa menit lagi.' },
      { status: 429 }
    )
  }

  // Simpan komentar
  const insertData: CommentInsert = {
    name: name.trim(),
    email,
    message: message.trim(),
    ip_hash: ipHash,
  }

  const { data: newComment, error: insertErr } = await adminClient
    .from('comments')
    .insert(insertData)
    .select()
    .single()

  if (insertErr || !newComment) {
    console.error('[POST /api/comments] Insert error:', insertErr)
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan komentar.' }, { status: 500 })
  }

  // Kirim email (non-blocking)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const notifyEmail = process.env.NOTIFY_EMAIL ?? 'belajar.alam2007@gmail.com'

  try {
    const tmpl = commentEmailTemplate(newComment, siteUrl)
    await sendEmail({
      to: notifyEmail,
      subject: tmpl.subject,
      html: tmpl.html,
      text: tmpl.text,
      replyTo: tmpl.replyTo,
    })
  } catch (err) {
    console.error('[POST /api/comments] Email error:', err)
  }

  return NextResponse.json({ ok: true })
}
