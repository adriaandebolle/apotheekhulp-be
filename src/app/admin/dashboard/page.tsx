import { createAdminClient } from '@/lib/supabase/admin'
import { StatCard } from '@/components/ui/Card'
import DashboardCharts from './DashboardCharts'
import type { RevenuePoint } from './RevenueChart'
import type { ShiftsPoint } from './ShiftsChart'
import type { StatusSlice } from './StatusDonut'

function calcHours(start: string, end: string, breakMin: number): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm) - breakMin) / 60
}

function fmtEuro(n: number) {
  return n.toLocaleString('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('nl-BE', { month: 'short', year: '2-digit' })
}

export default async function DashboardPage() {
  const supabase = createAdminClient()

  const now = new Date()
  const thisMonth = now.toISOString().slice(0, 7)
  const [y, mo] = thisMonth.split('-').map(Number)
  const monthStart = `${thisMonth}-01`
  // Last day of current month — use UTC so no timezone shift
  const monthEnd = new Date(Date.UTC(y, mo, 0)).toISOString().split('T')[0]

  // Last 12 calendar months (oldest first) — pure string arithmetic, no toISOString()
  const last12: string[] = []
  for (let i = 11; i >= 0; i--) {
    let m = mo - i
    let yr = y
    while (m <= 0) { m += 12; yr-- }
    last12.push(`${yr}-${String(m).padStart(2, '0')}`)
  }
  const last12Start = `${last12[0]}-01`

  const [
    { count: cntAssistants },
    { count: cntPharmacies },
    { count: cntShiftsMonth },
    { count: cntApprovedMonth },
    { count: cntPendingAssistant },
    { count: cntPendingApotheek },
    { data: approvedShifts12m },
    { data: allShifts12m },
    { data: rawLinks },
    { data: configRow },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true })
      .eq('role', 'assistent').eq('is_active', true),
    supabase.from('users').select('*', { count: 'exact', head: true })
      .eq('role', 'apotheek').eq('is_active', true),
    supabase.from('shifts').select('*', { count: 'exact', head: true })
      .is('deleted_at', null).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('shifts').select('*', { count: 'exact', head: true })
      .is('deleted_at', null).eq('status', 'approved').gte('date', monthStart).lte('date', monthEnd),
    supabase.from('shifts').select('*', { count: 'exact', head: true })
      .is('deleted_at', null).eq('status', 'pending_assistant'),
    supabase.from('shifts').select('*', { count: 'exact', head: true })
      .is('deleted_at', null).eq('status', 'pending_apotheek'),
    supabase.from('shifts')
      .select('assistant_id, location_id, date, start_time, end_time, break_minutes')
      .is('deleted_at', null).eq('status', 'approved').gte('date', last12Start),
    supabase.from('shifts')
      .select('date, status')
      .is('deleted_at', null).gte('date', last12Start),
    supabase.from('links')
      .select('assistant_id, location_id, hourly_rate_assistant, hourly_rate_pharmacy')
      .is('deleted_at', null),
    supabase.from('platform_config')
      .select('default_hourly_rate_assistant, default_hourly_rate_pharmacy').single(),
  ])

  const defaultRateAss = configRow?.default_hourly_rate_assistant ?? 0
  const defaultRateApo = configRow?.default_hourly_rate_pharmacy  ?? 0

  const linkMap = new Map<string, { rateAss: number; rateApo: number }>()
  for (const l of rawLinks ?? []) {
    linkMap.set(`${l.assistant_id}:${l.location_id}`, {
      rateAss: l.hourly_rate_assistant ?? defaultRateAss,
      rateApo: l.hourly_rate_pharmacy  ?? defaultRateApo,
    })
  }

  // KPI 7 & 8 — revenue & cost this month
  const thisMonthApproved = (approvedShifts12m ?? []).filter(s => s.date.startsWith(thisMonth))
  let totalRevenue = 0
  let totalCost    = 0
  for (const s of thisMonthApproved) {
    const rates = linkMap.get(`${s.assistant_id}:${s.location_id}`)
    const h = calcHours(s.start_time, s.end_time, s.break_minutes)
    totalRevenue += h * (rates?.rateApo ?? defaultRateApo)
    totalCost    += h * (rates?.rateAss ?? defaultRateAss)
  }

  // Monthly chart data
  const monthlyData: (RevenuePoint & ShiftsPoint)[] = last12.map(ym => {
    const approved12 = (approvedShifts12m ?? []).filter(s => s.date.startsWith(ym))
    const all12      = (allShifts12m ?? []).filter(s => s.date.startsWith(ym))

    let revenue = 0
    let cost    = 0
    for (const s of approved12) {
      const rates = linkMap.get(`${s.assistant_id}:${s.location_id}`)
      const h = calcHours(s.start_time, s.end_time, s.break_minutes)
      revenue += h * (rates?.rateApo ?? defaultRateApo)
      cost    += h * (rates?.rateAss ?? defaultRateAss)
    }

    return {
      month:    monthLabel(ym),
      revenue:  Math.round(revenue),
      cost:     Math.round(cost),
      approved: all12.filter(s => s.status === 'approved').length,
      pending:  all12.filter(s => s.status === 'pending_assistant' || s.status === 'pending_apotheek').length,
      denied:   all12.filter(s => s.status === 'denied').length,
    }
  })

  // Status donut (last 12 months)
  const counts = { approved: 0, pending_assistant: 0, pending_apotheek: 0, denied: 0 }
  for (const s of allShifts12m ?? []) {
    const k = s.status as keyof typeof counts
    if (k in counts) counts[k]++
  }
  const statusData: StatusSlice[] = [
    { status: 'Goedgekeurd',    count: counts.approved,          color: '#16a34a' },
    { status: 'Te bevestigen',  count: counts.pending_assistant, color: '#d97706' },
    { status: 'Goed te keuren', count: counts.pending_apotheek,  color: '#2563eb' },
    { status: 'Geweigerd',      count: counts.denied,            color: '#dc2626' },
  ]

  const currentMonthLabel = new Date(y, mo - 1, 1)
    .toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text mb-1">Dashboard</h1>
        <p className="text-text-muted capitalize">{currentMonthLabel}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Actieve assistenten"  value={cntAssistants ?? 0} />
        <StatCard label="Actieve apotheken"    value={cntPharmacies ?? 0} />
        <StatCard label="Shifts deze maand"    value={cntShiftsMonth ?? 0} />
        <StatCard label="Goedgekeurd"          value={cntApprovedMonth ?? 0} />
        <StatCard
          label="Te bevestigen"
          value={cntPendingAssistant ?? 0}
          trend={(cntPendingAssistant ?? 0) > 0 ? 'down' : 'neutral'}
          sub={(cntPendingAssistant ?? 0) > 0 ? 'actie vereist' : undefined}
        />
        <StatCard
          label="Goed te keuren"
          value={cntPendingApotheek ?? 0}
          trend={(cntPendingApotheek ?? 0) > 0 ? 'down' : 'neutral'}
          sub={(cntPendingApotheek ?? 0) > 0 ? 'actie vereist' : undefined}
        />
        <StatCard label="Apotheek omzet (mnd)" value={fmtEuro(totalRevenue)} trend="up" />
        <StatCard label="Assistent kost (mnd)"  value={fmtEuro(totalCost)} />
      </div>

      {/* Charts */}
      <DashboardCharts monthlyData={monthlyData} statusData={statusData} />
    </div>
  )
}
