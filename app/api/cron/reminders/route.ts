import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { reminderEmailTemplate } from '@/lib/email/templates'
import type { TimelineItem } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

function verifySecret(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET ?? ''
  if (!cronSecret) return false

  const auth = req.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!auth.startsWith(prefix)) return false

  const provided = auth.slice(prefix.length)
  try {
    const a = Buffer.from(cronSecret)
    const b = Buffer.from(provided)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

async function handleReminders() {
  const adminClient = getAdminClient()

  // 1. Klaim pengingat yang jatuh tempo (atomic, anti-dobel)
  const { data: items, error: claimErr } = await adminClient.rpc('claim_due_reminders')
  if (claimErr) {
    console.error('[Cron] claim_due_reminders error:', claimErr)
    return { claimed: 0, sent: 0, failed: 0, error: claimErr.message }
  }

  const claimedItems = (items ?? []) as TimelineItem[]
  const claimed = claimedItems.length
  let sent = 0
  let failed = 0

  if (claimedItems.length === 0) {
    return { claimed, sent, failed }
  }

  // 2. Ambil judul proyek
  const { data: project } = await adminClient
    .from('project')
    .select('title')
    .eq('id', 1)
    .single()

  const projectTitle = project?.title ?? 'UPDATE PROYEK'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const notifyEmail = process.env.NOTIFY_EMAIL ?? 'belajar.alam2007@gmail.com'

  // 3. Kirim email per item
  for (const item of claimedItems) {
    try {
      const tmpl = reminderEmailTemplate(item, projectTitle, siteUrl)
      const result = await sendEmail({
        to: notifyEmail,
        subject: tmpl.subject,
        html: tmpl.html,
        text: tmpl.text,
      })

      if (result.ok) {
        sent++
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      failed++
      console.error(`[Cron] Gagal kirim email untuk item ${item.id}:`, err)
      // Reset reminder_sent_at agar bisa dicoba lagi
      await adminClient
        .from('timeline_items')
        .update({ reminder_sent_at: null })
        .eq('id', item.id)
    }
  }

  return { claimed, sent, failed }
}

export async function GET(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await handleReminders()
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await handleReminders()
  return NextResponse.json(result)
}
