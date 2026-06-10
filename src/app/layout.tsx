import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Apotheekhulp',
  description: 'Platform voor apotheekassistenten in België',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-LKPMESH1YV" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LKPMESH1YV');
        `,
      }} />
    </html>
  )
}
