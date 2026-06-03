'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface PublicNavProps {
  isLoggedIn: boolean
  dashboardHref: string
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Over ons', href: '/over-ons' },
  { label: 'Wat we doen', href: '/wat-we-doen' },
  { label: 'Contact', href: '/contact' },
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
          className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-primary-light text-primary'
              : 'text-text-muted hover:bg-slate-50 hover:text-text'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-3 px-4 py-4 border-b border-border">
      <Image
        src="/img/logo_apotheekhulp.png"
        alt="Apotheekhulp"
        width={40}
        height={40}
        className="shrink-0"
      />
      <span className="text-base font-bold text-text leading-tight">Apotheekhulp</span>
    </Link>
  )
}

function CtaButton({ isLoggedIn, dashboardHref, onNavigate }: PublicNavProps & { onNavigate?: () => void }) {
  const cta = isLoggedIn
    ? { label: 'Dashboard', href: dashboardHref }
    : { label: 'Aanmelden', href: '/login' }

  return (
    <div className="px-3 pb-5 pt-3 border-t border-border">
      <Link
        href={cta.href}
        onClick={onNavigate}
        className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
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
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-surface border-r border-border sticky top-0 h-screen">
        <Logo />
        <NavLinks />
        <CtaButton isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
      </aside>

      {/* Mobile: fixed top header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-surface border-b border-border flex items-center justify-between px-4">
        <Logo />
        <button
          type="button"
          aria-label={open ? 'Menu sluiten' : 'Menu openen'}
          onClick={() => setOpen(v => !v)}
          className="p-2 rounded-lg text-text-muted hover:bg-slate-50 transition-colors"
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
            <Logo onClick={() => setOpen(false)} />
            <NavLinks onNavigate={() => setOpen(false)} />
            <CtaButton isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
