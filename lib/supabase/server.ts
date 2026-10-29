import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll dipanggil dari Server Component — bisa diabaikan jika hanya refresh sesi
        }
      },
    },
  })
}
