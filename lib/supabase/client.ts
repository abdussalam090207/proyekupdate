import type { Database } from './types'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
  return createBrowserClient<Database>(
    cleanUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
