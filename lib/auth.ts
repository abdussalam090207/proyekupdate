import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'

/**
 * Memastikan request berasal dari admin yang sudah login.
 * Lempar redirect atau error jika tidak.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/adminalam')
  }

  const role = user.app_metadata?.role
  if (role !== 'admin') {
    redirect('/adminalam')
  }

  return user
}

/**
 * Cek apakah user sudah login sebagai admin (tanpa redirect).
 * Berguna di layout atau komponen.
 */
export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (user.app_metadata?.role !== 'admin') return null
  return user
}
