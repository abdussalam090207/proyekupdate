import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let _client: SupabaseClient<Database> | null = null

export function getAdminClient(): SupabaseClient<Database> {
  if (!_client) {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    if (!url || !key) {
      // At build time env vars may not exist — return a dummy that will fail at runtime
      // This is safe because the route is never actually called during build
      _client = createClient<Database>(
        url || 'https://placeholder.supabase.co',
        key || 'placeholder-key',
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
    } else {
      _client = createClient<Database>(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    }
  }
  return _client
}
