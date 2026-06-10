'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginState =
  | null
  | { type: 'error'; message: string }
  | { type: 'otp_sent'; email: string; message: string }

export type OtpState =
  | { step: 'email'; error?: string }
  | { step: 'code'; email: string; error?: string }

function roleRedirect(role: string | undefined): never {
  if (role === 'admin') redirect('/admin/dashboard')
  if (role === 'assistent') redirect('/assistent/dashboard')
  if (role === 'apotheek') redirect('/apotheek/dashboard')
  redirect('/')
}

export async function signInWithPassword(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Probe to distinguish "email not found" vs "wrong password" — signInWithOtp
    // with shouldCreateUser: false returns an error immediately (no email sent)
    // if the user doesn't exist.
    const { error: probeError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (probeError) {
      return { type: 'error', message: 'Dit e-mailadres is niet gekend in ons systeem.' }
    }

    // User exists — OTP was just sent, switch to code entry
    return {
      type: 'otp_sent',
      email,
      message: 'Wachtwoord onjuist. We hebben een eenmalige code gestuurd naar uw e-mailadres.',
    }
  }

  roleRedirect(data.user?.app_metadata?.role)
}

export async function handleOtp(prev: OtpState, formData: FormData): Promise<OtpState> {
  const supabase = await createClient()

  if (prev.step === 'email') {
    const email = formData.get('email') as string
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('not found') || msg.includes('user') || msg.includes('signup')) {
        return { step: 'email', error: 'Dit e-mailadres is niet gekend in ons systeem.' }
      }
      // Surface unexpected errors (rate limit, provider disabled, etc.) to aid debugging
      return { step: 'email', error: error.message }
    }
    return { step: 'code', email }
  }

  // step === 'code'
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })

  if (error) return { step: 'code', email, error: 'Ongeldige of verlopen code. Probeer opnieuw.' }

  roleRedirect(data.user?.app_metadata?.role)
}
