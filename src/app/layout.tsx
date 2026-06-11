import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.apotheekhulp.be'),
  title: 'Apotheekhulp',
  description: 'Platform voor apotheekassistenten in België',
  openGraph: {
    title: 'Apotheekhulp',
    description: 'Platform voor apotheekassistenten in België',
    url: 'https://www.apotheekhulp.be',
    siteName: 'Apotheekhulp',
    locale: 'nl_BE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apotheekhulp',
    description: 'Platform voor apotheekassistenten in België',
  },
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
