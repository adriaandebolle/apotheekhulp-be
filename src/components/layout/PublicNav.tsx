'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface PublicNavProps {
  isLoggedIn: boolean
  dashboardHref: string
}

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Over ons',
    href: '/over-ons',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Wat we doen',
    href: '/wat-we-doen',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="flex-1 py-4 px-2 space-y-0.5">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-primary-light text-primary'
              : 'text-text-muted hover:bg-slate-50 hover:text-text'
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

function CtaButton({ isLoggedIn, dashboardHref, onNavigate }: PublicNavProps & { onNavigate?: () => void }) {
  const cta = isLoggedIn
    ? { label: 'Dashboard', href: dashboardHref }
    : { label: 'Aanmelden', href: '/login' }

  return (
    <div className="px-4 pb-6 pt-2 border-t border-border">
      <Link
        href={cta.href}
        onClick={onNavigate}
        className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        {cta.label}
      </Link>
    </div>
  )
}

export function PublicNav({ isLoggedIn, dashboardHref }: PublicNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop: permanent left sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-surface border-r border-border min-h-screen sticky top-0 self-start h-screen">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="text-lg font-bold text-primary">
            Apotheekhulp
          </Link>
        </div>
        <NavLinks />
        <CtaButton isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
      </aside>

      {/* Mobile: fixed top header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-surface border-b border-border flex items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-primary">
          Apotheekhulp
        </Link>
        <button
          type="button"
          aria-label={open ? 'Menu sluiten' : 'Menu openen'}
          onClick={() => setOpen(v => !v)}
          className="p-2 rounded-lg text-text-muted hover:bg-slate-50 hover:text-text transition-colors"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile: slide-in drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative flex flex-col w-64 bg-surface shadow-xl">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-primary" onClick={() => setOpen(false)}>
                Apotheekhulp
              </Link>
              <button
                type="button"
                aria-label="Menu sluiten"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:bg-slate-50 hover:text-text transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <CtaButton isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
