'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

let refreshTimeout: ReturnType<typeof setTimeout> | null = null

function scheduleRefresh(router: ReturnType<typeof useRouter>) {
  if (refreshTimeout) clearTimeout(refreshTimeout)
  refreshTimeout = setTimeout(() => {
    router.refresh()
  }, 300)
}

export default function LiveRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('public-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_items' }, () => {
        scheduleRefresh(router)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project' }, () => {
        scheduleRefresh(router)
      })
      .subscribe()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        scheduleRefresh(router)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (refreshTimeout) clearTimeout(refreshTimeout)
    }
  }, [router])

  return null
}
