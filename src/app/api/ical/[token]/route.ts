import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/client'

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

  const supabase = createClient()
  const { data: rows, error } = await supabase.rpc('get_ical_shifts', { p_token: token })

  // 0 rows = invalid token; error = something went wrong
  if (error || !rows || rows.length === 0) {
    return new Response('Niet gevonden.', { status: 404 })
  }

  // >= 1 row = valid token; shift_id null = no qualifying shifts (LEFT JOIN sentinel)
  const name = [rows[0].user_first, rows[0].user_last].filter(Boolean).join(' ') || 'Assistent'
  type IcalRow = typeof rows[number]
  const shifts = rows.filter((r: IcalRow) => r.shift_id !== null)
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const events = shifts.map((s: IcalRow) => {
    const pharmacy = s.company_name ?? 'Apotheek'
    const location = s.location_name ?? ''
    const status   = STATUS_NL[s.status] ?? s.status
    const summary  = location ? `${pharmacy} – ${location}` : pharmacy
    const desc     = `Status: ${status}\\nPauze: ${s.break_minutes} min`

    return [
      'BEGIN:VEVENT',
      `UID:${s.shift_id}@apotheekhulp.be`,
      `DTSTAMP:${now}`,
      `DTSTART:${toIcalDate(s.shift_date, s.start_time)}`,
      `DTEND:${toIcalDate(s.shift_date, s.end_time)}`,
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
