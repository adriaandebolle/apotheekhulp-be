'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signInWithPassword, handleOtp, type LoginState, type OtpState } from './actions'
import { Input, Label, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type Mode = 'password' | 'otp'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('password')

  const [pwState, pwAction, pwPending] = useActionState<LoginState, FormData>(
    signInWithPassword,
    null
  )

  const [otpState, otpAction, otpPending] = useActionState<OtpState, FormData>(
    handleOtp,
    { step: 'email' }
  )

  // When password flow triggers OTP (wrong password but valid email), switch to OTP code step
  const effectiveOtpState: OtpState =
    pwState?.type === 'otp_sent'
      ? { step: 'code', email: pwState.email, error: pwState.message }
      : otpState

  function switchMode(next: Mode) {
    setMode(next)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Apotheekhulp</h1>
        <p className="text-sm text-gray-500 mt-1">Meld u aan om verder te gaan</p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
        {(['password', 'otp'] as Mode[]).map(m => (
          <Button
            key={m}
            type="button"
            variant={mode === m ? 'primary' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => switchMode(m)}
          >
            {m === 'password' ? 'Wachtwoord' : 'Eenmalige code'}
          </Button>
        ))}
      </div>

      {/* ── Password form ── */}
      {mode === 'password' && (
        <form action={pwAction} className="space-y-4">
          <div>
            <Label htmlFor="pw-email">E-mailadres</Label>
            <Input id="pw-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="pw-password">Wachtwoord</Label>
            <Input id="pw-password" name="password" type="password" autoComplete="current-password" required />
          </div>

          <FieldError message={pwState?.type === 'error' ? pwState.message : undefined} />

          <Button type="submit" loading={pwPending} className="w-full" size="lg">
            Aanmelden
          </Button>
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
              Wachtwoord vergeten?
            </Link>
          </div>
        </form>
      )}

      {/* ── OTP: enter email ── */}
      {mode === 'otp' && effectiveOtpState.step === 'email' && (
        <form action={otpAction} className="space-y-4">
          <div>
            <Label htmlFor="otp-email">E-mailadres</Label>
            <Input id="otp-email" name="email" type="email" autoComplete="email" required />
          </div>

          <FieldError message={effectiveOtpState.error} />

          <Button type="submit" loading={otpPending} className="w-full" size="lg">
            Stuur code
          </Button>
        </form>
      )}

      {/* ── OTP: enter code ── */}
      {(mode === 'otp' || pwState?.type === 'otp_sent') && effectiveOtpState.step === 'code' && (
        <form action={otpAction} className="space-y-4">
          <p className="text-sm text-gray-500">
            Voer de 6-cijferige code in die we stuurden naar{' '}
            <strong>{effectiveOtpState.email}</strong>.
          </p>

          <input type="hidden" name="email" value={effectiveOtpState.email} />

          <div>
            <Label htmlFor="otp-token">Code</Label>
            <Input
              id="otp-token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              required
              className="text-center tracking-widest font-mono"
            />
          </div>

          <FieldError message={effectiveOtpState.error} />

          <Button type="submit" loading={otpPending} className="w-full" size="lg">
            Aanmelden
          </Button>
          <div className="text-center">
            <Button type="button" variant="ghost" size="sm" onClick={() => switchMode('otp')}>
              Ander e-mailadres of code opnieuw sturen
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
