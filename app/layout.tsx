import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UPDATE PROYEK — Pantau Progres Website',
  description: 'Pantau progres pengerjaan website secara real-time. Lihat timeline, status, dan update terbaru.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        {/* 2 blob latar belakang */}
        <div aria-hidden="true">
          <div className="blob-1" />
          <div className="blob-2" />
        </div>
        {children}
      </body>
    </html>
  )
}
