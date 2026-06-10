import { NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { AssistentDocument } from '@/lib/pdf/assistent-pdf'
import type { AssistentPDFData, AssistentPDFShift } from '@/lib/pdf/assistent-pdf'
import { calcHours } from '@/lib/pdf/pdf-utils'

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

  const admin = userClient
  const { data: me } = await admin.from('users').select('role').eq('id', user.id).single()
  const isAdmin     = me?.role === 'admin'
  const isAssistent = me?.role === 'assistent'
  if (!isAdmin && !isAssistent) return new Response('Geen toegang.', { status: 403 })

  // Assistants may only download their own invoice (invoice_id path only)
  if (isAssistent && !invoiceId) return new Response('Geen toegang.', { status: 403 })

  // ── Invoice-based PDF ────────────────────────────────────────────────────
  if (invoiceId) {
    const { data: invoice } = await admin
      .from('invoices')
      .select('invoice_number, invoice_date, recipient_id, subtotal, vat_amount, total')
      .eq('id', invoiceId)
      .eq('type', 'assistent')
      .single()
    if (!invoice) return new Response('Factuur niet gevonden.', { status: 404 })
    if (isAssistent && invoice.recipient_id !== user.id) return new Response('Geen toegang.', { status: 403 })

    const assistantId = invoice.recipient_id

    const [
      { data: userRow },
      { data: profile },
      { data: rawShifts },
      { data: rawLinks },
      { data: config },
    ] = await Promise.all([
      admin.from('users').select('first_name, last_name').eq('id', assistantId).single(),
      admin.from('assistant_profiles')
        .select('company_name, vat_number, vat_liable, street, house_number, postcode, city, iban')
        .eq('user_id', assistantId).maybeSingle(),
      admin.from('shifts')
        .select(`
          id, date, start_time, end_time, break_minutes, location_id,
          location:locations(name, pharmacy:pharmacy_profiles(company_name))
        `)
        .eq('assistent_invoice_id', invoiceId)
        .is('deleted_at', null)
        .order('date', { ascending: true }),
      admin.from('links')
        .select('location_id, hourly_rate_assistant')
        .eq('assistant_id', assistantId)
        .is('deleted_at', null),
      admin.from('platform_config').select('default_hourly_rate_assistant, company_name, company_street, company_city, company_phone, company_email, company_vat').single(),
    ])

    if (!userRow) return new Response('Assistent niet gevonden.', { status: 404 })

    const rateByLocation = new Map<string, number>()
    for (const link of rawLinks ?? []) {
      if (link.hourly_rate_assistant !== null) rateByLocation.set(link.location_id, link.hourly_rate_assistant)
    }
    const defaultRate = config?.default_hourly_rate_assistant ?? 0

    const shifts: AssistentPDFShift[] = (rawShifts ?? []).map(s => {
      const loc = s.location as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
      return {
        id: s.id, date: s.date, startTime: s.start_time, endTime: s.end_time,
        breakMinutes: s.break_minutes,
        pharmacyName: loc?.pharmacy?.company_name ?? '—',
        locationName: loc?.name ?? '—',
        hourlyRate:   rateByLocation.get(s.location_id) ?? defaultRate,
      }
    })

    const data: AssistentPDFData = {
      month:         invoice.invoice_date.slice(0, 7),
      firstName:     userRow.first_name ?? '',
      lastName:      userRow.last_name  ?? '',
      companyName:   profile?.company_name ?? null,
      vatNumber:     profile?.vat_number   ?? null,
      vatLiable:     profile?.vat_liable   ?? true,
      street:        profile?.street       ?? null,
      houseNumber:   profile?.house_number ?? null,
      postcode:      profile?.postcode     ?? null,
      city:          profile?.city         ?? null,
      iban:          profile?.iban         ?? null,
      shifts,
      invoiceNumber: invoice.invoice_number,
      invoiceDate:   invoice.invoice_date,
      sender: {
        name:   config?.company_name   ?? 'Apotheekhulp',
        street: config?.company_street ?? 'Wanzelesteenweg 98',
        city:   config?.company_city   ?? '9260 Serskamp',
        phone:  config?.company_phone  ?? '0494/99.61.82',
        email:  config?.company_email  ?? 'info@apotheekhulp.be',
        vat:    config?.company_vat    ?? 'BE1010.352.295',
      },
    }

    const slug     = (userRow.last_name ?? 'assistent').toLowerCase().replace(/\s+/g, '-')
    const fileName = `factuur_${invoice.invoice_number.replace(/[^a-zA-Z0-9-]/g, '_')}_${slug}.pdf`
    const buffer   = await renderToBuffer(<AssistentDocument data={data} />)
    return new Response(buffer as unknown as BodyInit, {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` },
    })
  }

  // ── Month-based preview PDF ───────────────────────────────────────────────
  const [y, m] = month!.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEnd   = new Date(Date.UTC(y, m, 0)).toISOString().split('T')[0]

  const [
    { data: userRow },
    { data: profile },
    { data: rawShifts },
    { data: rawLinks },
    { data: config },
  ] = await Promise.all([
    admin.from('users').select('first_name, last_name').eq('id', id!).single(),
    admin.from('assistant_profiles')
      .select('company_name, vat_number, vat_liable, street, house_number, postcode, city, iban')
      .eq('user_id', id!).maybeSingle(),
    admin.from('shifts')
      .select(`
        id, date, start_time, end_time, break_minutes, location_id,
        location:locations(name, pharmacy:pharmacy_profiles(company_name))
      `)
      .eq('assistant_id', id!)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .gte('date', monthStart).lte('date', monthEnd)
      .order('date', { ascending: true }),
    admin.from('links')
      .select('location_id, hourly_rate_assistant')
      .eq('assistant_id', id!)
      .is('deleted_at', null),
    admin.from('platform_config').select('default_hourly_rate_assistant, company_name, company_street, company_city, company_phone, company_email, company_vat').single(),
  ])

  if (!userRow) return new Response('Assistent niet gevonden.', { status: 404 })

  const rateByLocation = new Map<string, number>()
  for (const link of rawLinks ?? []) {
    if (link.hourly_rate_assistant !== null) rateByLocation.set(link.location_id, link.hourly_rate_assistant)
  }
  const defaultRate = config?.default_hourly_rate_assistant ?? 0

  const shifts: AssistentPDFShift[] = (rawShifts ?? []).map(s => {
    const loc = s.location as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
    return {
      id: s.id, date: s.date, startTime: s.start_time, endTime: s.end_time,
      breakMinutes: s.break_minutes,
      pharmacyName: loc?.pharmacy?.company_name ?? '—',
      locationName: loc?.name ?? '—',
      hourlyRate:   rateByLocation.get(s.location_id) ?? defaultRate,
    }
  })

  if (shifts.length === 0) return new Response('Geen goedgekeurde shifts voor deze maand.', { status: 404 })

  const totalHours = shifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime, s.breakMinutes), 0)
  const data: AssistentPDFData = {
    month: month!,
    firstName:   userRow.first_name ?? '',
    lastName:    userRow.last_name  ?? '',
    companyName: profile?.company_name ?? null,
    vatNumber:   profile?.vat_number   ?? null,
    vatLiable:   profile?.vat_liable   ?? true,
    street:      profile?.street       ?? null,
    houseNumber: profile?.house_number ?? null,
    postcode:    profile?.postcode     ?? null,
    city:        profile?.city         ?? null,
    iban:        profile?.iban         ?? null,
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

  const slug     = (userRow.last_name ?? 'assistent').toLowerCase().replace(/\s+/g, '-')
  const fileName = `overzicht_${slug}_${month}_${Math.round(totalHours * 100) / 100}u.pdf`
  const buffer   = await renderToBuffer(<AssistentDocument data={data} />)
  return new Response(buffer as unknown as BodyInit, {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` },
  })
}
