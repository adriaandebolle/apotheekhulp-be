'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  children?: { label: string; href: string }[]
}

const nav: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
  },
  {
    label: 'Kalender',
    href: '/admin/kalender',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    label: 'Beschikbaarheid',
    href: '/admin/beschikbaarheid',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    label: 'Gebruikers',
    href: '/admin/gebruikers',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    children: [
      { label: 'Assistenten', href: '/admin/gebruikers/assistenten' },
      { label: 'Apotheken', href: '/admin/gebruikers/apotheken' },
    ],
  },
  {
    label: 'Prestaties',
    href: '/admin/prestaties',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
  {
    label: 'Facturen',
    href: '/admin/facturen',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    children: [
      { label: 'Assistenten', href: '/admin/facturen/assistenten' },
      { label: 'Apotheken', href: '/admin/facturen/apotheken' },
    ],
  },
  {
    label: 'Tarificatie',
    href: '/admin/tarificatie',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
        <Link href="/admin/dashboard" className="text-lg font-bold text-primary">
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
      <div className="px-2 pb-4 border-t border-border pt-4">
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
