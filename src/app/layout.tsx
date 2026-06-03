import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Apotheekhulp',
  description: 'Platform voor apotheekassistenten in België',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
