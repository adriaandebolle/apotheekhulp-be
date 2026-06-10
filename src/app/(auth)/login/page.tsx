"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  signInWithPassword,
  handleOtp,
  type LoginState,
  type OtpState,
} from "./actions";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Mode = "password" | "otp";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [showPassword, setShowPassword] = useState(false);

  const [pwState, pwAction, pwPending] = useActionState<LoginState, FormData>(
    signInWithPassword,
    null,
  );

  const [otpState, otpAction, otpPending] = useActionState<OtpState, FormData>(
    handleOtp,
    { step: "email" },
  );

  // When password flow triggers OTP (wrong password but valid email), switch to OTP code step
  const effectiveOtpState: OtpState =
    pwState?.type === "otp_sent"
      ? { step: "code", email: pwState.email, error: pwState.message }
      : otpState;

  function switchMode(next: Mode) {
    setMode(next);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Apotheekhulp</h1>
        <p className="text-sm text-gray-500 mt-1">
          Meld u aan om verder te gaan
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
        {(["password", "otp"] as Mode[]).map((m) => (
          <Button
            key={m}
            type="button"
            variant={mode === m ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => switchMode(m)}
          >
            {m === "password" ? "Wachtwoord" : "Eenmalige code"}
          </Button>
        ))}
      </div>

      {/* ── Password form ── */}
      {mode === "password" && (
        <form action={pwAction} className="space-y-4">
          <div>
            <Label htmlFor="pw-email">E-mailadres</Label>
            <Input
              id="pw-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="pw-password">Wachtwoord</Label>
            <div className="relative">
              <Input
                id="pw-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <FieldError
            message={pwState?.type === "error" ? pwState.message : undefined}
          />

          <Button
            type="submit"
            loading={pwPending}
            className="w-full"
            size="lg"
          >
            Aanmelden
          </Button>
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-green-600 hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          </div>
        </form>
      )}

      {/* ── OTP: enter email ── */}
      {mode === "otp" && effectiveOtpState.step === "email" && (
        <form action={otpAction} className="space-y-4">
          <div>
            <Label htmlFor="otp-email">E-mailadres</Label>
            <Input
              id="otp-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <FieldError message={effectiveOtpState.error} />

          <Button
            type="submit"
            loading={otpPending}
            className="w-full"
            size="lg"
          >
            Stuur code
          </Button>
        </form>
      )}

      {/* ── OTP: enter code ── */}
      {(mode === "otp" || pwState?.type === "otp_sent") &&
        effectiveOtpState.step === "code" && (
          <form action={otpAction} className="space-y-4 mt-6">
            <p className="text-sm text-gray-500">
              Voer de 6-cijferige code in die we stuurden naar{" "}
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

            <Button
              type="submit"
              loading={otpPending}
              className="w-full"
              size="lg"
            >
              Aanmelden
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => switchMode("otp")}
              >
                Ander e-mailadres of code opnieuw sturen
              </Button>
            </div>
          </form>
        )}
    </div>
  );
}
