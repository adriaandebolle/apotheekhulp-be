'use server'

import { sendContactConfirmation, sendContactNotification } from '@/lib/email'

type Result = { error: string } | { success: true }

export async function submitContactForm(data: {
  naam: string
  telefoon: string
  email: string
  bericht: string
}): Promise<Result> {
  const { naam, email, bericht } = data

  if (!naam.trim() || !email.trim() || !bericht.trim()) {
    return { error: 'Vul alle verplichte velden in.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Geef een geldig e-mailadres op.' }
  }

  try {
    await Promise.all([
      sendContactNotification(data),
      sendContactConfirmation(email, naam),
    ])
    return { success: true }
  } catch {
    return { error: 'Verzending mislukt. Probeer het later opnieuw of stuur een e-mail naar info@apotheekhulp.be.' }
  }
}
