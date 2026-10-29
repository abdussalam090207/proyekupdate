import { z } from 'zod'

export const TimelineItemSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(160, 'Judul terlalu panjang'),
  description: z.string().max(2000, 'Deskripsi terlalu panjang').default(''),
  duration_type: z.enum(['date', 'time']),
  due_date: z.string().nullable().optional(),
  due_at: z.string().nullable().optional(),
}).refine((data) => {
  if (data.duration_type === 'date') return !!data.due_date
  if (data.duration_type === 'time') return !!data.due_at
  return false
}, {
  message: 'Tanggal/waktu tenggat wajib diisi',
  path: ['due_date'],
})

export const CommentSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(80, 'Nama terlalu panjang').trim(),
  email: z.string().email('Email tidak valid').min(5).max(160),
  message: z.string().min(1, 'Pesan wajib diisi').max(2000, 'Pesan terlalu panjang').trim(),
  website: z.string().optional(), // honeypot
})

export const ProjectTitleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(160, 'Judul terlalu panjang').trim(),
})

export type TimelineItemInput = z.infer<typeof TimelineItemSchema>
export type CommentInput = z.infer<typeof CommentSchema>

/** Ambil pesan error pertama dari ZodError (Zod v4 compat) */
export function firstZodError(err: z.ZodError): string {
  return err.issues[0]?.message ?? 'Data tidak valid'
}
