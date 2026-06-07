import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST ?? "127.0.0.1",
  port: parseInt(process.env.EMAIL_SMTP_PORT ?? "54325", 10),
  secure: process.env.EMAIL_SMTP_SECURE === "true",
  auth: process.env.EMAIL_SMTP_USER
    ? { user: process.env.EMAIL_SMTP_USER, pass: process.env.EMAIL_SMTP_PASS }
    : undefined,
});

const FROM = process.env.EMAIL_FROM ?? "noreply@apotheekhulp.be";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.apotheekhulp.be";

// ── Inline-style converter (email clients ignore stylesheets) ─────────────────

function inlineRichText(html: string): string {
  return html
    .replace(
      /<blockquote>/gi,
      '<blockquote style="border-left:3px solid #0d9488;padding-left:1em;margin:0.75em 0;color:#64748b;font-style:italic;">',
    )
    .replace(
      /<h2>/gi,
      '<h2 style="font-size:1.2em;font-weight:700;color:#0f172a;margin:1em 0 0.4em;">',
    )
    .replace(
      /<h3>/gi,
      '<h3 style="font-size:1.05em;font-weight:600;color:#0f172a;margin:0.8em 0 0.3em;">',
    )
    .replace(
      /<ul>/gi,
      '<ul style="padding-left:1.5em;margin:0.5em 0;list-style-type:disc;">',
    )
    .replace(
      /<ol>/gi,
      '<ol style="padding-left:1.5em;margin:0.5em 0;list-style-type:decimal;">',
    )
    .replace(/<li>/gi, '<li style="margin:0.2em 0;line-height:1.6;">')
    .replace(/<p>/gi, '<p style="margin:0.4em 0;line-height:1.65;">');
}

// ── Email templates ───────────────────────────────────────────────────────────

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8fafc;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:22px;font-weight:700;color:#0d9488;letter-spacing:-0.3px;">Apotheekhulp</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;padding:40px 40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                © 2026 Apotheekhulp bv · <a href="mailto:info@apotheekhulp.be" style="color:#94a3b8;text-decoration:none;">info@apotheekhulp.be</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function welcomeHtml(
  email: string,
  password: string,
  role: "apotheek" | "assistent",
) {
  const isAssistent = role === "assistent";
  const greeting = isAssistent
    ? "Welkom bij Apotheekhulp!"
    : "Uw apotheekaccount is aangemaakt";
  const subtitle = isAssistent
    ? "Uw account als apotheekassistent is klaar. U kunt zich aanmelden via onderstaande gegevens."
    : "Uw account als apotheek is klaar. U kunt zich aanmelden via onderstaande gegevens.";

  return baseLayout(`
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <div style="display:inline-block;background-color:#ccfbf1;border-radius:50%;width:52px;height:52px;line-height:52px;text-align:center;">
            <span style="font-size:24px;">👋</span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;text-align:center;">${greeting}</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#64748b;text-align:center;line-height:1.6;">${subtitle}</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-bottom:8px;">
                <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:2px;">E-mailadres</span>
                <span style="font-size:14px;font-weight:600;color:#0f172a;">${escHtml(email)}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:2px;">Tijdelijk wachtwoord</span>
                <span style="font-size:14px;font-weight:600;color:#0f172a;font-family:monospace;">${escHtml(password)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <a href="${APP_URL}/login"
             style="display:inline-block;background-color:#0d9488;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;letter-spacing:0.1px;">
            Aanmelden
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
      Wijzig uw wachtwoord na de eerste aanmelding via uw profielpagina.
    </p>
  `);
}

// ── Public functions ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  password: string,
  role: "apotheek" | "assistent",
) {
  const subject =
    role === "assistent"
      ? "Welkom bij Apotheekhulp"
      : "Uw Apotheekhulp account is aangemaakt";

  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: welcomeHtml(to, password, role),
  });
}

export async function sendContactNotification(data: {
  naam: string;
  telefoon: string;
  email: string;
  bericht: string;
}) {
  const html = baseLayout(`
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Nieuw contactbericht</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Via het contactformulier op apotheekhulp.be</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-bottom:10px;">
                <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:2px;">Naam</span>
                <span style="font-size:14px;font-weight:600;color:#0f172a;">${escHtml(data.naam)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:10px;">
                <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:2px;">E-mail</span>
                <a href="mailto:${escHtml(data.email)}" style="font-size:14px;font-weight:600;color:#0d9488;text-decoration:none;">${escHtml(data.email)}</a>
              </td>
            </tr>
            ${
              data.telefoon
                ? `<tr>
              <td style="padding-bottom:10px;">
                <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:2px;">Telefoon</span>
                <span style="font-size:14px;font-weight:600;color:#0f172a;">${escHtml(data.telefoon)}</span>
              </td>
            </tr>`
                : ""
            }
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Bericht</p>
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap;">${escHtml(data.bericht)}</div>
  `);

  await transporter.sendMail({
    from: FROM,
    to: "info@apotheekhulp.be",
    replyTo: data.email,
    subject: `Contactbericht van ${data.naam}`,
    html,
  });
}

export async function sendContactConfirmation(to: string, naam: string) {
  const html = baseLayout(`
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <div style="display:inline-block;background-color:#ccfbf1;border-radius:50%;width:52px;height:52px;line-height:52px;text-align:center;">
            <span style="font-size:24px;">✅</span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;text-align:center;">Bericht ontvangen!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;text-align:center;line-height:1.6;">
      Beste ${escHtml(naam)}, bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.
    </p>

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
      Met vriendelijke groeten,<br />Het Apotheekhulp team
    </p>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "We hebben uw bericht ontvangen — Apotheekhulp",
    html,
  });
}

export async function sendBerichtNotification(
  to: string[],
  title: string,
  body: string,
  role: "assistent" | "apotheek",
) {
  if (to.length === 0) return;

  const portalUrl =
    role === "assistent"
      ? `${APP_URL}/assistent/berichten`
      : `${APP_URL}/apotheek/berichten`;

  const html = baseLayout(`
    <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0f172a;">${escHtml(title)}</h1>

    <div style="font-size:14px;color:#334155;line-height:1.7;margin-bottom:28px;">
      ${inlineRichText(body)}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td>
          <a href="${portalUrl}"
             style="display:inline-block;background-color:#0d9488;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;letter-spacing:0.1px;">
            Bekijk in portaal
          </a>
        </td>
      </tr>
    </table>
  `);

  await Promise.allSettled(
    to.map((address) =>
      transporter.sendMail({
        from: FROM,
        to: address,
        subject: `Nieuw bericht: ${title}`,
        html,
      }),
    ),
  );
}
