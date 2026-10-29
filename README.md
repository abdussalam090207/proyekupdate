# UPDATE PROYEK

Aplikasi web sederhana untuk memberi tahu client progres pengerjaan proyek website.

## Cara Setup

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Isi `.env.local`

Salin dari `.env.example` lalu isi semua nilainya:

```bash
cp .env.example .env.local
```

Variabel yang wajib diisi:
- `NEXT_PUBLIC_SUPABASE_URL` — URL project Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (rahasia, server only)
- `ADMIN_USERNAME` — Username login admin (`profalam`)
- `ADMIN_AUTH_EMAIL` — Email Auth Supabase untuk admin
- `ADMIN_PASSWORD` — Password untuk script pembuatan admin
- `RESEND_API_KEY` — API key dari Resend
- `CRON_SECRET` — String acak ≥ 32 karakter untuk mengamankan endpoint cron
- `IP_HASH_SALT` — String acak untuk hashing IP

### 3. Setup Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan `supabase/schema.sql` di **SQL Editor**
3. Di **Authentication → Providers → Email**: aktifkan, lalu **matikan "Allow new users to sign up"**

### 4. Buat User Admin

```bash
node --env-file=.env.local scripts/create-admin.mjs
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk halaman publik.
Buka [http://localhost:3000/adminalam](http://localhost:3000/adminalam) untuk login admin.

Login dengan:
- **Username**: `profalam`  
- **Password**: nilai `ADMIN_PASSWORD` di `.env.local`

## Struktur Halaman

| URL | Keterangan |
|---|---|
| `/` | Halaman publik (timeline, form komentar) |
| `/adminalam` | Login admin |
| `/adminalam/timeline` | CRUD poin timeline |
| `/adminalam/control` | Judul proyek, status, drag & drop urutan |
| `/adminalam/comments` | Daftar komentar client |

## Cron Pengingat Tenggat

Setelah deploy, tambahkan cron job di Supabase SQL Editor (lihat `PROYEK.md` bagian 10.3):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'update-proyek-reminders',
  '*/5 * * * *',
  $$ select net.http_post(
    url := 'https://DOMAIN-KAMU/api/cron/reminders',
    headers := jsonb_build_object('Authorization', 'Bearer CRON_SECRET'),
    body := '{}'::jsonb
  ); $$
);
```

## Asumsi

1. "Durasi waktu → Time" = tanggal + jam (untuk hitung "1 jam sebelum tenggat")
2. Pengingat tipe date dikirim H-1 pukul 08:00 WIB
3. Hanya ada satu proyek aktif
4. Status "Kembalikan" ke `berjalan` tersedia agar salah klik bisa diperbaiki
