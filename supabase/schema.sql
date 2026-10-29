-- =====================================================================
-- UPDATE PROYEK — Supabase schema (idempotent: aman dijalankan ulang)
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Admin = user Supabase Auth yang punya app_metadata.role = 'admin'.
-- app_metadata TIDAK bisa diubah oleh user sendiri (hanya service role).
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ---------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------

-- 2a. project: SATU baris saja (id selalu 1) = judul proyek di halaman publik
create table if not exists public.project (
  id         smallint    primary key default 1 check (id = 1),
  title      text        not null default 'Belum ada judul proyek'
                         check (char_length(btrim(title)) between 1 and 160),
  updated_at timestamptz not null default now()
);

-- 2b. timeline_items: poin-poin timeline
create table if not exists public.timeline_items (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null check (char_length(btrim(title)) between 1 and 160),
  description      text        not null default '' check (char_length(description) <= 2000),
  duration_type    text        not null check (duration_type in ('date', 'time')),
  due_date         date,                 -- dipakai jika duration_type = 'date'
  due_at           timestamptz,          -- dipakai jika duration_type = 'time'
  status           text        not null default 'berjalan'
                               check (status in ('berjalan', 'selesai', 'dibatalkan')),
  position         integer     not null default 0,
  remind_at        timestamptz,          -- diisi otomatis oleh trigger
  reminder_sent_at timestamptz,          -- terisi setelah email pengingat diklaim/terkirim
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint timeline_due_matches_type check (
    (duration_type = 'date' and due_date is not null and due_at   is null) or
    (duration_type = 'time' and due_at   is not null and due_date is null)
  )
);

-- 2c. comments: komentar dari client (publik hanya bisa MENULIS lewat API server)
create table if not exists public.comments (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null check (char_length(btrim(name)) between 1 and 80),
  email      text        not null check (
                           char_length(email) between 5 and 160
                           and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
                         ),
  message    text        not null check (char_length(btrim(message)) between 1 and 2000),
  is_read    boolean     not null default false,
  ip_hash    text,                       -- hash IP + salt (untuk rate limit), bukan IP asli
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. INDEXES
-- ---------------------------------------------------------------------
create index if not exists timeline_items_position_idx
  on public.timeline_items (position);

create index if not exists timeline_items_due_reminders_idx
  on public.timeline_items (remind_at)
  where reminder_sent_at is null and status = 'berjalan';

create index if not exists comments_created_at_idx
  on public.comments (created_at desc);

create index if not exists comments_unread_idx
  on public.comments (is_read) where is_read = false;

create index if not exists comments_ip_rate_idx
  on public.comments (ip_hash, created_at desc);

-- ---------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------

-- 4a. project.updated_at
drop trigger if exists project_set_updated_at on public.project;
create trigger project_set_updated_at
  before update on public.project
  for each row execute function public.set_updated_at();

-- 4b. timeline_items: posisi otomatis, hitung remind_at, reset pengingat
--     Aturan pengingat (zona waktu Asia/Jakarta / WIB):
--       date -> H-1 pukul 08:00 WIB (1 hari sebelum tenggat)
--       time -> tepat 1 jam sebelum tenggat
create or replace function public.timeline_before_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(new.position, 0) <= 0 then
      select coalesce(max(position), 0) + 1
        into new.position
        from public.timeline_items;
    end if;
    new.reminder_sent_at := null;
  else
    new.updated_at := now();
  end if;

  if new.duration_type = 'date' then
    new.remind_at := ((new.due_date - 1) + time '08:00') at time zone 'Asia/Jakarta';
  else
    new.remind_at := new.due_at - interval '1 hour';
  end if;

  -- Jika jadwal diubah, pengingat boleh terkirim lagi
  if tg_op = 'UPDATE' and (
       new.duration_type is distinct from old.duration_type
    or new.due_date      is distinct from old.due_date
    or new.due_at        is distinct from old.due_at
  ) then
    new.reminder_sent_at := null;
  end if;

  return new;
end $$;

drop trigger if exists timeline_items_before_write on public.timeline_items;
create trigger timeline_items_before_write
  before insert or update on public.timeline_items
  for each row execute function public.timeline_before_write();

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
--    Publik (anon)  : hanya BACA project & timeline_items
--    Admin          : full akses ke semua tabel
--    comments       : anon tidak punya akses apa pun (insert lewat API server
--                     memakai service role, yang melewati RLS)
-- ---------------------------------------------------------------------
alter table public.project        enable row level security;
alter table public.timeline_items enable row level security;
alter table public.comments       enable row level security;

-- project
drop policy if exists "project_public_read" on public.project;
create policy "project_public_read" on public.project
  for select to anon, authenticated using (true);

drop policy if exists "project_admin_write" on public.project;
create policy "project_admin_write" on public.project
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- timeline_items
drop policy if exists "timeline_public_read" on public.timeline_items;
create policy "timeline_public_read" on public.timeline_items
  for select to anon, authenticated using (true);

drop policy if exists "timeline_admin_write" on public.timeline_items;
create policy "timeline_admin_write" on public.timeline_items
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- comments
drop policy if exists "comments_admin_all" on public.comments;
create policy "comments_admin_all" on public.comments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Privilege hardening (lapisan kedua di luar RLS)
revoke all on public.comments from anon;
revoke insert, update, delete, truncate on public.project        from anon;
revoke insert, update, delete, truncate on public.timeline_items from anon;

-- ---------------------------------------------------------------------
-- 6. RPC FUNCTIONS
-- ---------------------------------------------------------------------

-- 6a. Simpan urutan drag & drop sekaligus (atomic). Hanya admin.
create or replace function public.reorder_timeline(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.timeline_items t
     set position = x.ord
    from unnest(p_ids) with ordinality as x(id, ord)
   where t.id = x.id;
end $$;

revoke all on function public.reorder_timeline(uuid[]) from public, anon;
grant execute on function public.reorder_timeline(uuid[]) to authenticated;

-- 6b. Klaim pengingat yang jatuh tempo (dipanggil cron via service role).
--     Atomic + skip locked => tidak ada email ganda walau cron jalan dobel.
--     Hanya item 'berjalan' yang tenggatnya BELUM lewat.
create or replace function public.claim_due_reminders()
returns setof public.timeline_items
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.timeline_items t
     set reminder_sent_at = now()
   where t.id in (
     select i.id
       from public.timeline_items i
      where i.status = 'berjalan'
        and i.reminder_sent_at is null
        and i.remind_at is not null
        and i.remind_at <= now()
        and case
              when i.duration_type = 'date'
                then i.due_date >= (now() at time zone 'Asia/Jakarta')::date
              else i.due_at > now()
            end
      order by i.remind_at
        for update skip locked
   )
  returning t.*;
end $$;

revoke all on function public.claim_due_reminders() from public, anon, authenticated;
grant execute on function public.claim_due_reminders() to service_role;

-- ---------------------------------------------------------------------
-- 7. REALTIME (halaman publik & admin ikut update otomatis)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['project', 'timeline_items', 'comments'] loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 8. SEED
-- ---------------------------------------------------------------------
insert into public.project (id, title)
values (1, 'Belum ada judul proyek')
on conflict (id) do nothing;

-- Selesai. Langkah berikutnya: buat user admin (lihat PROYEK.md -> bagian 6).
