import { createClient } from '@supabase/supabase-js'

const { NEXT_PUBLIC_SUPABASE_URL: rawUrl, SUPABASE_SERVICE_ROLE_KEY: key,
        ADMIN_AUTH_EMAIL: email, ADMIN_PASSWORD: password } = process.env
if (!rawUrl || !key || !email || !password) throw new Error('Env belum lengkap')

const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
const meta = { app_metadata: { role: 'admin' }, email_confirm: true }

const { data, error } = await sb.auth.admin.createUser({ email, password, ...meta })
if (error) {
  // user sudah ada → update password + pastikan role admin
  const { data: list, error: e2 } = await sb.auth.admin.listUsers({ perPage: 1000 })
  if (e2) throw e2
  const u = list.users.find(x => x.email?.toLowerCase() === email.toLowerCase())
  if (!u) throw error
  const { error: e3 } = await sb.auth.admin.updateUserById(u.id, { password, ...meta })
  if (e3) throw e3
  console.log('Admin diperbarui:', email)
} else {
  console.log('Admin dibuat:', data.user.email)
}
