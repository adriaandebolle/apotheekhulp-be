// Daily digest: email each assistent a summary of their shift status changes
// from the past 24 hours. Runs via pg_cron at 07:00 UTC (08:00 Brussels).
// Required secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION,
//                   EMAIL_FROM, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-set)

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { SESClient, SendEmailCommand } from 'npm:@aws-sdk/client-ses'

const ses = new SESClient({
  region: Deno.env.get('AWS_SES_REGION') ?? 'eu-west-1',
  credentials: {
    accessKeyId:     Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
})

const FROM    = Deno.env.get('EMAIL_FROM')    ?? 'noreply@apotheekhulp.be'
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://app.apotheekhulp.be'

// ── Types ─────────────────────────────────────────────────────────────────────

type ShiftRow = {
  id:            string
  date:          string
  start_time:    string
  end_time:      string
  status:        string
  assistant_id:  string
  first_name:    string | null
  last_name:     string | null
  email:         string | null
  pharmacy_name: string | null
  location_name: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending_assistant: 'Wacht op bevestiging assistent',
    pending_apotheek:  'Wacht op goedkeuring apotheek',
    approved:          'Goedgekeurd',
    denied:            'Geweigerd',
  }
  return map[s] ?? s
}

function statusColor(s: string) {
  if (s === 'approved')          return '#16a34a'
  if (s.startsWith('pending_'))  return '#d97706'
  if (s === 'denied')            return '#dc2626'
  return '#64748b'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('nl-BE', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildDigestHtml(firstName: string, shifts: ShiftRow[]) {
  const rows = shifts.map(s => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#0f172a;">
        ${escHtml(formatDate(s.date))}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">
        ${formatTime(s.start_time)}–${formatTime(s.end_time)}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">
        ${escHtml(s.pharmacy_name ?? '—')}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">
        <span style="font-size:12px;font-weight:600;color:${statusColor(s.status)};">
          ${statusLabel(s.status)}
        </span>
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8fafc;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:22px;font-weight:700;color:#0d9488;">Apotheekhulp</span>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;padding:36px 36px 28px;">
              <h1 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#0f172a;">
                Dag ${escHtml(firstName ?? '')},
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                Hier is een overzicht van uw shifts met statuswijzigingen van de afgelopen 24 uur.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#f8fafc;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;">Datum</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;">Tijdstip</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;">Apotheek</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;">Status</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/assistent/prestaties"
                       style="display:inline-block;background-color:#0d9488;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;">
                      Bekijk mijn prestaties
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                © 2026 Apotheekhulp bv ·
                <a href="mailto:info@apotheekhulp.be" style="color:#94a3b8;text-decoration:none;">info@apotheekhulp.be</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Fetch shifts updated in the last 24h with assistent and pharmacy info
    const { data: shifts, error } = await supabase
      .from('shifts')
      .select(`
        id, date, start_time, end_time, status, assistant_id,
        assistant:users!assistant_id(first_name, last_name),
        location:locations(name, pharmacy:pharmacy_profiles(company_name))
      `)
      .gte('updated_at', since)
      .is('deleted_at', null)
      .neq('status', 'pending_assistant')  // only show shifts that moved past the first step

    if (error) {
      console.error('DB query failed:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!shifts || shifts.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    // Fetch auth emails for each unique assistant
    const assistantIds = [...new Set(shifts.map((s: { assistant_id: string }) => s.assistant_id))]
    const emailByUserId = new Map<string, string>()

    for (const uid of assistantIds) {
      const { data: authUser } = await supabase.auth.admin.getUserById(uid)
      if (authUser?.user?.email) emailByUserId.set(uid, authUser.user.email)
    }

    // Group shifts by assistant
    type RawShift = typeof shifts[number]
    const byAssistant = new Map<string, RawShift[]>()
    for (const shift of shifts) {
      const arr = byAssistant.get(shift.assistant_id) ?? []
      arr.push(shift)
      byAssistant.set(shift.assistant_id, arr)
    }

    let sent = 0
    const errors: string[] = []

    for (const [assistantId, assistantShifts] of byAssistant) {
      const email = emailByUserId.get(assistantId)
      if (!email) continue

      const first = assistantShifts[0]
      const assistant = first.assistant as unknown as { first_name: string | null; last_name: string | null } | null
      const firstName = assistant?.first_name ?? ''

      const rows: ShiftRow[] = assistantShifts.map(s => {
        const loc     = s.location as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
        const asst    = s.assistant as unknown as { first_name: string | null; last_name: string | null } | null
        return {
          id:            s.id,
          date:          s.date,
          start_time:    s.start_time,
          end_time:      s.end_time,
          status:        s.status,
          assistant_id:  s.assistant_id,
          first_name:    asst?.first_name ?? null,
          last_name:     asst?.last_name  ?? null,
          email,
          pharmacy_name: loc?.pharmacy?.company_name ?? null,
          location_name: loc?.name ?? null,
        }
      })

      try {
        await ses.send(new SendEmailCommand({
          Source: FROM,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: 'Uw dagelijkse shift-update — Apotheekhulp', Charset: 'UTF-8' },
            Body:    { Html: { Data: buildDigestHtml(firstName, rows), Charset: 'UTF-8' } },
          },
        }))
        sent++
      } catch (e) {
        console.error(`Failed to send to ${email}:`, e)
        errors.push(email)
      }
    }

    return new Response(JSON.stringify({ sent, errors }), { status: 200 })
  } catch (e) {
    console.error('Unexpected error:', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
