'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signInWithPassword, handleOtp, type LoginState, type OtpState } from './actions'

type Mode = 'password' | 'otp'

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
const btnClass =
  'w-full bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

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
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === m ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'password' ? 'Wachtwoord' : 'Eenmalige code'}
          </button>
        ))}
      </div>

      {/* ── Password form ── */}
      {mode === 'password' && (
        <form action={pwAction} className="space-y-4">
          <div>
            <label htmlFor="pw-email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres
            </label>
            <input id="pw-email" name="email" type="email" autoComplete="email" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="pw-password" className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord
            </label>
            <input id="pw-password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </div>

          {pwState?.type === 'error' && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwState.message}</p>
          )}

          <button type="submit" disabled={pwPending} className={btnClass}>
            {pwPending ? 'Controleren...' : 'Aanmelden'}
          </button>
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
            <label htmlFor="otp-email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres
            </label>
            <input id="otp-email" name="email" type="email" autoComplete="email" required className={inputClass} />
          </div>

          {effectiveOtpState.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{effectiveOtpState.error}</p>
          )}

          <button type="submit" disabled={otpPending} className={btnClass}>
            {otpPending ? 'Versturen...' : 'Stuur code'}
          </button>
        </form>
      )}

      {/* ── OTP: enter code ── */}
      {(mode === 'otp' || pwState?.type === 'otp_sent') && effectiveOtpState.step === 'code' && (
        <form action={otpAction} className="space-y-4">
          <p className="text-sm text-gray-500">
            Voer de 6-cijferige code in die we stuurden naar{' '}
            <strong>{effectiveOtpState.email}</strong>.
          </p>

          {/* Pass email through to the server action */}
          <input type="hidden" name="email" value={effectiveOtpState.email} />

          <div>
            <label htmlFor="otp-token" className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <input
              id="otp-token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              required
              className={`${inputClass} text-center tracking-widest font-mono`}
            />
          </div>

          {effectiveOtpState.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{effectiveOtpState.error}</p>
          )}

          <button type="submit" disabled={otpPending} className={btnClass}>
            {otpPending ? 'Controleren...' : 'Aanmelden'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => switchMode('otp')}
              className="text-sm text-green-600 hover:underline"
            >
              Ander e-mailadres of code opnieuw sturen
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
