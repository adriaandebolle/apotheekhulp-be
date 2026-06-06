import { NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApotheekDocument } from '@/lib/pdf/apotheek-pdf'
import type { ApotheekPDFData, ApotheekPDFShift } from '@/lib/pdf/apotheek-pdf'

function buildShifts(
  rawShifts: { id: string; date: string; start_time: string; end_time: string; break_minutes: number; assistant_id: string; location_id: string; assistant: unknown; location: unknown }[],
  rateByKey: Map<string, number>,
  defaultRate: number,
): ApotheekPDFShift[] {
  return rawShifts.map(s => {
    const asst = s.assistant as { first_name: string | null; last_name: string | null } | null
    const loc  = s.location  as { name: string } | null
    return {
      id:            s.id,
      date:          s.date,
      startTime:     s.start_time,
      endTime:       s.end_time,
      breakMinutes:  s.break_minutes,
      assistantName: [asst?.first_name, asst?.last_name].filter(Boolean).join(' ') || '—',
      locationName:  loc?.name ?? '—',
      hourlyRate:    rateByKey.get(`${s.assistant_id}:${s.location_id}`) ?? defaultRate,
    }
  })
}

const SHIFT_SELECT = `
  id, date, start_time, end_time, break_minutes, assistant_id, location_id,
  assistant:users(first_name, last_name),
  location:locations(name)
`

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const invoiceId = searchParams.get('invoice_id')
  const id        = searchParams.get('id')
  const month     = searchParams.get('month')

  if (!invoiceId && (!id || !month || !/^\d{4}-\d{2}$/.test(month))) {
    return new Response('Geef invoice_id of id+month op.', { status: 400 })
  }

  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return new Response('Niet ingelogd.', { status: 401 })

  const admin = createAdminClient()
  const { data: me } = await admin.from('users').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return new Response('Geen toegang.', { status: 403 })

  // ── Invoice-based PDF ────────────────────────────────────────────────────
  if (invoiceId) {
    const { data: invoice } = await admin
      .from('invoices')
      .select('invoice_number, invoice_date, recipient_id')
      .eq('id', invoiceId)
      .eq('type', 'apotheek')
      .single()
    if (!invoice) return new Response('Factuur niet gevonden.', { status: 404 })

    const pharmacyId = invoice.recipient_id

    const [
      { data: profile },
      { data: rawShifts },
      { data: rawLinks },
      { data: config },
    ] = await Promise.all([
      admin.from('pharmacy_profiles')
        .select('company_name, vat_number, billing_street, billing_house_number, billing_postcode, billing_city')
        .eq('user_id', pharmacyId).maybeSingle(),
      admin.from('shifts').select(SHIFT_SELECT)
        .eq('apotheek_invoice_id', invoiceId)
        .is('deleted_at', null)
        .order('date', { ascending: true }),
      admin.from('links')
        .select('assistant_id, location_id, hourly_rate_pharmacy')
        .is('deleted_at', null),
      admin.from('platform_config').select('default_hourly_rate_pharmacy, company_name, company_street, company_city, company_phone, company_email, company_vat').single(),
    ])

    const rateByKey = new Map<string, number>()
    for (const link of rawLinks ?? []) {
      if (link.hourly_rate_pharmacy !== null) {
        rateByKey.set(`${link.assistant_id}:${link.location_id}`, link.hourly_rate_pharmacy)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shifts = buildShifts((rawShifts ?? []) as any[], rateByKey, config?.default_hourly_rate_pharmacy ?? 0)
    if (shifts.length === 0) return new Response('Geen shifts op deze factuur.', { status: 404 })

    const data: ApotheekPDFData = {
      month:           invoice.invoice_date.slice(0, 7),
      companyName:     profile?.company_name         ?? null,
      vatNumber:       profile?.vat_number            ?? null,
      billingStreet:   profile?.billing_street        ?? null,
      billingHouseNr:  profile?.billing_house_number  ?? null,
      billingPostcode: profile?.billing_postcode      ?? null,
      billingCity:     profile?.billing_city          ?? null,
      shifts,
      invoiceNumber:   invoice.invoice_number,
      invoiceDate:     invoice.invoice_date,
      sender: {
        name:   config?.company_name   ?? 'Apotheekhulp',
        street: config?.company_street ?? 'Wanzelesteenweg 98',
        city:   config?.company_city   ?? '9260 Serskamp',
        phone:  config?.company_phone  ?? '0494/99.61.82',
        email:  config?.company_email  ?? 'info@apotheekhulp.be',
        vat:    config?.company_vat    ?? 'BE1010.352.295',
      },
    }

    const slug     = (profile?.company_name ?? 'apotheek').toLowerCase().replace(/\s+/g, '-')
    const fileName = `factuur_${invoice.invoice_number.replace(/[^a-zA-Z0-9-]/g, '_')}_${slug}.pdf`
    const buffer   = await renderToBuffer(<ApotheekDocument data={data} />)
    return new Response(buffer as unknown as BodyInit, {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` },
    })
  }

  // ── Month-based preview PDF ───────────────────────────────────────────────
  const [y, m] = month!.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEnd   = new Date(Date.UTC(y, m, 0)).toISOString().split('T')[0]

  const [
    { data: profile },
    { data: rawLocations },
    { data: rawLinks },
    { data: config },
  ] = await Promise.all([
    admin.from('pharmacy_profiles')
      .select('company_name, vat_number, billing_street, billing_house_number, billing_postcode, billing_city')
      .eq('user_id', id!).maybeSingle(),
    admin.from('locations').select('id').eq('pharmacy_id', id!).is('deleted_at', null),
    admin.from('links').select('assistant_id, location_id, hourly_rate_pharmacy').is('deleted_at', null),
    admin.from('platform_config').select('default_hourly_rate_pharmacy, company_name, company_street, company_city, company_phone, company_email, company_vat').single(),
  ])

  if (!rawLocations || rawLocations.length === 0) {
    return new Response('Geen locaties gevonden voor deze apotheek.', { status: 404 })
  }

  const locationIds = rawLocations.map(l => l.id)
  const { data: rawShifts } = await admin.from('shifts').select(SHIFT_SELECT)
    .eq('status', 'approved').is('deleted_at', null)
    .gte('date', monthStart).lte('date', monthEnd)
    .in('location_id', locationIds)
    .order('date', { ascending: true })

  if (!rawShifts || rawShifts.length === 0) {
    return new Response('Geen goedgekeurde shifts voor deze maand.', { status: 404 })
  }

  const rateByKey = new Map<string, number>()
  for (const link of rawLinks ?? []) {
    if (link.hourly_rate_pharmacy !== null) {
      rateByKey.set(`${link.assistant_id}:${link.location_id}`, link.hourly_rate_pharmacy)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shifts = buildShifts(rawShifts as any[], rateByKey, config?.default_hourly_rate_pharmacy ?? 0)

  const data: ApotheekPDFData = {
    month: month!,
    companyName:     profile?.company_name         ?? null,
    vatNumber:       profile?.vat_number            ?? null,
    billingStreet:   profile?.billing_street        ?? null,
    billingHouseNr:  profile?.billing_house_number  ?? null,
    billingPostcode: profile?.billing_postcode      ?? null,
    billingCity:     profile?.billing_city          ?? null,
    shifts,
    sender: {
      name:   config?.company_name   ?? 'Apotheekhulp',
      street: config?.company_street ?? 'Wanzelesteenweg 98',
      city:   config?.company_city   ?? '9260 Serskamp',
      phone:  config?.company_phone  ?? '0494/99.61.82',
      email:  config?.company_email  ?? 'info@apotheekhulp.be',
      vat:    config?.company_vat    ?? 'BE1010.352.295',
    },
  }

  const slug     = (profile?.company_name ?? 'apotheek').toLowerCase().replace(/\s+/g, '-')
  const fileName = `overzicht_${slug}_${month}.pdf`
  const buffer   = await renderToBuffer(<ApotheekDocument data={data} />)
  return new Response(buffer as unknown as BodyInit, {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` },
  })
}
