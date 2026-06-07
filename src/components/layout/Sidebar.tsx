'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  children?: { label: string; href: string }[]
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const icons = {
  dashboard: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
  kalender:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  clock:     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  users:     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  prestaties:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  facturen:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  tarief:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
  agenda:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  settings:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
}

// ── Nav per role ───────────────────────────────────────────────────────────────

const adminNav: NavItem[] = [
  { label: 'Dashboard',       href: '/admin/dashboard',       icon: icons.dashboard },
  { label: 'Kalender',        href: '/admin/kalender',        icon: icons.kalender },
  { label: 'Beschikbaarheid', href: '/admin/beschikbaarheid', icon: icons.clock },
  {
    label: 'Gebruikers', href: '/admin/gebruikers', icon: icons.users,
    children: [
      { label: 'Assistenten', href: '/admin/gebruikers/assistenten' },
      { label: 'Apotheken',   href: '/admin/gebruikers/apotheken' },
    ],
  },
  { label: 'Prestaties', href: '/admin/prestaties', icon: icons.prestaties },
  {
    label: 'Facturen', href: '/admin/facturen', icon: icons.facturen,
    children: [
      { label: 'Assistenten', href: '/admin/facturen/assistenten' },
      { label: 'Apotheken',   href: '/admin/facturen/apotheken' },
    ],
  },
  { label: 'Berichten',     href: '/admin/berichten',     icon: icons.tarief },
  { label: 'Instellingen', href: '/admin/instellingen', icon: icons.settings },
]

const assistentNav: NavItem[] = [
  { label: 'Dashboard',              href: '/assistent/dashboard',            icon: icons.dashboard },
  { label: 'Kalender',               href: '/assistent/kalender',             icon: icons.kalender },
  { label: 'Tarificatieberichten',   href: '/assistent/tarificatieberichten', icon: icons.tarief },
  { label: 'Mijn prestaties',        href: '/assistent/prestaties',           icon: icons.prestaties },
  { label: 'Mijn facturen',          href: '/assistent/facturen',             icon: icons.facturen },
  { label: 'Mijn onbeschikbaarheid', href: '/assistent/onbeschikbaarheid',   icon: icons.clock },
  { label: 'Agenda abonnement',      href: '/assistent/agenda-abonnement',   icon: icons.agenda },
]

const apotheekNav: NavItem[] = [
  { label: 'Dashboard',    href: '/apotheek/dashboard',    icon: icons.dashboard },
  { label: 'Kalender',     href: '/apotheek/kalender',     icon: icons.kalender },
  { label: 'Prestaties',   href: '/apotheek/prestaties',   icon: icons.prestaties },
  { label: 'Facturen',     href: '/apotheek/facturen',     icon: icons.facturen },
  { label: 'Tarificaties', href: '/apotheek/tarificaties', icon: icons.tarief },
]

const navByRole: Record<string, NavItem[]> = {
  admin:     adminNav,
  assistent: assistentNav,
  apotheek:  apotheekNav,
}

const homeByRole: Record<string, string> = {
  admin:     '/admin/dashboard',
  assistent: '/assistent/dashboard',
  apotheek:  '/apotheek/dashboard',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  role: 'admin' | 'assistent' | 'apotheek'
  badges?: Partial<Record<string, number>>
}

export function Sidebar({ role, badges = {} }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const nav = (navByRole[role] ?? adminNav).map(item => ({
    ...item,
    badge: badges[item.href] ?? item.badge,
  }))
  const home = homeByRole[role] ?? '/admin/dashboard'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface border-r border-border min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link href={home} className="text-lg font-bold text-primary">
          Apotheekhulp
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {nav.map(item => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href) && !item.children
                  ? 'bg-primary-light text-primary'
                  : 'text-text-muted hover:bg-slate-50 hover:text-text'
              }`}
            >
              {item.icon}
              {item.label}
              {!!item.badge && (
                <span className="ml-auto text-xs font-semibold bg-danger text-white rounded-full px-1.5 py-0.5 leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
            {item.children && (
              <div className="ml-6 mt-0.5 space-y-0.5">
                {item.children.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive(child.href)
                        ? 'bg-primary-light text-primary font-medium'
                        : 'text-text-muted hover:bg-slate-50 hover:text-text'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 border-t border-border pt-4 space-y-0.5">
        <Link
          href="/contact"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-slate-50 hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-slate-50 hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Afmelden
        </button>
      </div>
    </aside>
  )
}
