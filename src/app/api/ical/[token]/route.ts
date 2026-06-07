import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIcalDate(date: string, time: string): string {
  // date: "YYYY-MM-DD", time: "HH:MM:SS" or "HH:MM"
  const [y, mo, d] = date.split('-')
  const [h, mi] = time.split(':')
  return `${y}${mo}${d}T${h}${mi}00`
}

function escapeText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

const STATUS_NL: Record<string, string> = {
  approved:         'Bevestigd',
  pending_apotheek: 'Wacht op apotheek',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return new Response('Niet gevonden.', { status: 404 })
  }

  const admin = createAdminClient()

  const { data: userRow } = await admin
    .from('users')
    .select('id, first_name, last_name')
    .eq('ical_token', token)
    .eq('role', 'assistent')
    .maybeSingle()

  if (!userRow) return new Response('Niet gevonden.', { status: 404 })

  const { data: rawShifts } = await admin
    .from('shifts')
    .select(`
      id, date, start_time, end_time, break_minutes, status,
      location:locations(name, pharmacy:pharmacy_profiles(company_name))
    `)
    .eq('assistant_id', userRow.id)
    .in('status', ['approved', 'pending_apotheek'])
    .is('deleted_at', null)
    .order('date', { ascending: true })

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const name = [userRow.first_name, userRow.last_name].filter(Boolean).join(' ') || 'Assistent'

  const events = (rawShifts ?? []).map(s => {
    const loc     = s.location as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
    const pharmacy = loc?.pharmacy?.company_name ?? 'Apotheek'
    const location = loc?.name ?? ''
    const status   = STATUS_NL[s.status] ?? s.status
    const summary  = location ? `${pharmacy} – ${location}` : pharmacy
    const desc     = `Status: ${status}\\nPauze: ${s.break_minutes} min`

    return [
      'BEGIN:VEVENT',
      `UID:${s.id}@apotheekhulp.be`,
      `DTSTAMP:${now}`,
      `DTSTART:${toIcalDate(s.date, s.start_time)}`,
      `DTEND:${toIcalDate(s.date, s.end_time)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(desc)}`,
      'END:VEVENT',
    ].join('\r\n')
  })

  const cal = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apotheekhulp//Shifts//NL',
    `X-WR-CALNAME:Apotheekhulp – ${escapeText(name)}`,
    'X-WR-CALDESC:Jouw shifts via Apotheekhulp',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new Response(cal, {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="apotheekhulp-shifts.ics"',
      'Cache-Control':       'no-cache, no-store, must-revalidate',
    },
  })
}
