'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { TimelineItemSchema, ProjectTitleSchema, firstZodError } from '@/lib/validation'
import type { Database } from '@/lib/supabase/types'

type ActionResult = { ok: true } | { ok: false; error: string }
type TimelineInsert = Database['public']['Tables']['timeline_items']['Insert']
type TimelineUpdate = Database['public']['Tables']['timeline_items']['Update']

// ─── AUTH ───────────────────────────────────────────────────────────────────

export async function loginAction(username: string, password: string): Promise<ActionResult> {
  const cleanUser = username.trim().toLowerCase()
  const adminUsername = (process.env.ADMIN_USERNAME ?? '').toLowerCase()
  const adminEmail = process.env.ADMIN_AUTH_EMAIL ?? ''

  if (cleanUser !== adminUsername) {
    return { ok: false, error: 'Username atau password salah' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password })
  if (error) {
    return { ok: false, error: 'Username atau password salah' }
  }

  return { ok: true }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/adminalam')
}

// ─── TIMELINE ITEMS ─────────────────────────────────────────────────────────

export async function createTimelineItem(formData: {
  title: string
  description: string
  duration_type: 'date' | 'time'
  due_date?: string | null
  due_at?: string | null
}): Promise<ActionResult> {
  await requireAdmin()

  const parsed = TimelineItemSchema.safeParse(formData)
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) }
  }

  const d = parsed.data

  const insertData: TimelineInsert = {
    title: d.title.trim(),
    description: d.description,
    duration_type: d.duration_type,
    status: 'berjalan',
    due_date: d.duration_type === 'date' ? (d.due_date ?? null) : null,
    due_at: d.duration_type === 'time' && d.due_at
      ? new Date(`${d.due_at}:00+07:00`).toISOString()
      : null,
  }

  const supabase = await createClient()
  const { error } = await supabase.from('timeline_items').insert(insertData)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/adminalam/timeline')
  revalidatePath('/adminalam/control')
  return { ok: true }
}

export async function updateTimelineItem(id: string, formData: {
  title: string
  description: string
  duration_type: 'date' | 'time'
  due_date?: string | null
  due_at?: string | null
}): Promise<ActionResult> {
  await requireAdmin()

  const parsed = TimelineItemSchema.safeParse(formData)
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) }
  }

  const d = parsed.data

  const updateData: TimelineUpdate = {
    title: d.title.trim(),
    description: d.description,
    duration_type: d.duration_type,
    due_date: d.duration_type === 'date' ? (d.due_date ?? null) : null,
    due_at: d.duration_type === 'time' && d.due_at
      ? new Date(`${d.due_at}:00+07:00`).toISOString()
      : null,
  }

  const supabase = await createClient()
  const { error } = await supabase.from('timeline_items').update(updateData).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/adminalam/timeline')
  revalidatePath('/adminalam/control')
  return { ok: true }
}

export async function deleteTimelineItem(id: string): Promise<ActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from('timeline_items').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/adminalam/timeline')
  revalidatePath('/adminalam/control')
  return { ok: true }
}

export async function setItemStatus(
  id: string,
  status: 'berjalan' | 'selesai' | 'dibatalkan'
): Promise<ActionResult> {
  await requireAdmin()

  const updateData: TimelineUpdate = { status }

  const supabase = await createClient()
  const { error } = await supabase.from('timeline_items').update(updateData).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/adminalam/control')
  return { ok: true }
}

export async function reorderItems(ids: string[]): Promise<ActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase.rpc('reorder_timeline', { p_ids: ids })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/adminalam/control')
  return { ok: true }
}

export async function saveProjectTitle(title: string): Promise<ActionResult> {
  await requireAdmin()

  const parsed = ProjectTitleSchema.safeParse({ title })
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('project')
    .upsert({ id: 1, title: parsed.data.title })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/adminalam/control')
  return { ok: true }
}

export async function markCommentRead(id: string, isRead: boolean): Promise<ActionResult> {
  await requireAdmin()

  type CommentUpdate = Database['public']['Tables']['comments']['Update']
  const updateData: CommentUpdate = { is_read: isRead }

  const supabase = await createClient()
  const { error } = await supabase.from('comments').update(updateData).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/adminalam/comments')
  return { ok: true }
}

export async function deleteComment(id: string): Promise<ActionResult> {
  await requireAdmin()

  const { error } = await getAdminClient().from('comments').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/adminalam/comments')
  return { ok: true }
}
