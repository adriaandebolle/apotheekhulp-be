import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { startImpersonation } from '@/lib/impersonation'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'

type Props = { searchParams: Promise<{ q?: string; sort?: string; dir?: string }> }

type SortField = 'first_name' | 'last_name' | 'email'

function SortHeader({ label, field, sort, dir, q }: { label: string; field: SortField; sort: string; dir: string; q: string }) {
  const isActive = sort === field
  const nextDir = isActive && dir === 'asc' ? 'desc' : 'asc'
  const params = new URLSearchParams({ sort: field, dir: nextDir, ...(q ? { q } : {}) })
  return (
    <Link href={`/admin/gebruikers/assistenten?${params}`} className="inline-flex items-center gap-1 hover:text-text group">
      {label}
      <span className={isActive ? 'text-primary' : 'text-text-muted opacity-0 group-hover:opacity-100'}>
        {isActive && dir === 'desc' ? '↓' : '↑'}
      </span>
    </Link>
  )
}

export default async function AssistentListPage({ searchParams }: Props) {
  const { q = '', sort = 'last_name', dir = 'asc' } = await searchParams

  const admin = await createClient()
  const [{ data: { users: authUsers } }, { data: rows }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('users').select('id, first_name, last_name, phone, is_active').eq('role', 'assistent'),
  ])

  const emailMap = new Map(authUsers.map(u => [u.id, u.email ?? '']))

  let assistants = (rows ?? []).map(u => ({
    id:         u.id,
    first_name: u.first_name ?? '',
    last_name:  u.last_name  ?? '',
    email:      emailMap.get(u.id) ?? '',
    phone:      u.phone      ?? '',
    is_active:  u.is_active  as boolean,
  }))

  if (q) {
    const lower = q.toLowerCase()
    assistants = assistants.filter(a =>
      a.first_name.toLowerCase().includes(lower) ||
      a.last_name.toLowerCase().includes(lower)  ||
      a.email.toLowerCase().includes(lower)
    )
  }

  assistants.sort((a, b) => {
    const av = a[sort as SortField] ?? ''
    const bv = b[sort as SortField] ?? ''
    const cmp = av.localeCompare(bv)
    return dir === 'asc' ? cmp : -cmp
  })

  const activeCount = (rows ?? []).filter(u => u.is_active).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted mb-1">Overzicht Gebruikers / Assistenten</p>
          <h1 className="text-2xl font-bold text-text">Assistenten</h1>
        </div>
        <ButtonLink href="/admin/gebruikers/assistenten/nieuw" size="sm">
          + Nieuwe assistent
        </ButtonLink>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 mb-6 border-b border-border">
        <Link href="/admin/gebruikers/assistenten" className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary -mb-px">Assistenten</Link>
        <Link href="/admin/gebruikers/apotheken"   className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Apotheken</Link>
      </div>

      {/* Stats + Search */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-muted">Actieve assistenten <strong className="text-text">{activeCount}</strong></p>
        <SearchInput
          defaultValue={q}
          placeholder="Zoeken..."
          basePath="/admin/gebruikers/assistenten"
          extraParams={{ sort, dir }}
        />
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <Tr>
            <Th><SortHeader label="Voornaam"    field="first_name" sort={sort} dir={dir} q={q} /></Th>
            <Th><SortHeader label="Achternaam"  field="last_name"  sort={sort} dir={dir} q={q} /></Th>
            <Th><SortHeader label="Email"       field="email"      sort={sort} dir={dir} q={q} /></Th>
            <Th>Telefoonnummer</Th>
            <Th>Status</Th>
            <Th className="text-right">Bewerken</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assistants.length === 0 && <EmptyRow colSpan={6} />}
          {assistants.map(a => {
            const name = [a.first_name, a.last_name].filter(Boolean).join(' ') || a.email
            return (
              <Tr key={a.id}>
                <Td>{a.first_name || '—'}</Td>
                <Td>{a.last_name  || '—'}</Td>
                <Td className="text-text-muted">{a.email}</Td>
                <Td className="text-text-muted">{a.phone || '—'}</Td>
                <Td>
                  <Badge variant={a.is_active ? 'success' : 'neutral'}>
                    {a.is_active ? 'Actief' : 'Inactief'}
                  </Badge>
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Edit */}
                    <ButtonLink href={`/admin/gebruikers/assistenten/${a.id}`} variant="ghost" size="sm" title="Bewerken">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </ButtonLink>
                    {/* Impersonate */}
                    <form action={startImpersonation}>
                      <input type="hidden" name="userId" value={a.id} />
                      <input type="hidden" name="name"   value={name} />
                      <input type="hidden" name="role"   value="assistent" />
                      <button type="submit" title="Aanmelden als deze gebruiker"
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs rounded-md bg-transparent text-text-muted hover:bg-slate-100 hover:text-text border border-transparent transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </div>
  )
}
