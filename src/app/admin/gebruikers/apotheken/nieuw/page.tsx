"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPharmacy } from "@/lib/actions/users";
import { Label, Input } from "@/components/ui/Input";
import { Button, ButtonLink } from "@/components/ui/Button";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { VatLookup } from "@/components/ui/VatLookup";
import type { ParsedAddress } from "@/app/api/vat-lookup/route";

export default function NieuweApotheekPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const [companyName, setCompanyName] = useState("");
  const [addressDefaults, setAddressDefaults] = useState<ParsedAddress>(
    { street: "", house_number: "", postcode: "", city: "" }
  );
  const [addressKey, setAddressKey] = useState(0);

  function handleVatFound({ name, parsed_address }: { name: string; parsed_address: ParsedAddress }) {
    if (name && !companyName) setCompanyName(name);
    setAddressDefaults(parsed_address);
    setAddressKey(k => k + 1);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const password = fd.get("password") as string;
    const confirm  = fd.get("confirm")  as string;
    if (password !== confirm) {
      setPasswordError("Wachtwoorden komen niet overeen.");
      return;
    }
    setPasswordError(undefined);
    setError(undefined);

    startTransition(async () => {
      const result = await createPharmacy(fd);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push(`/admin/gebruikers/apotheken/${result.data.id}`);
      }
    });
  }

  return (
    <div className="p-8 max-w-5xl">
      <p className="text-xs text-text-muted mb-1">
        Gebruikers / Apotheken / Nieuw
      </p>
      <h1 className="text-2xl font-bold text-text mb-6">
        Nieuwe apotheek aanmaken
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Accountgegevens ───────────────────────────────────────── */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
            Accountgegevens
          </h2>

          <div>
            <Label htmlFor="email" required>
              E-mailadres
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+32 4xx xx xx xx"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password" required>
                Tijdelijk wachtwoord
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div>
              <Label htmlFor="confirm" required>
                Bevestig wachtwoord
              </Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                error={passwordError}
              />
              {passwordError && (
                <p className="mt-1 text-xs text-danger">{passwordError}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-text-muted -mt-2">
            Minimaal 8 tekens. De apotheek kan dit na login wijzigen.
          </p>
        </section>

        {/* ── Bedrijfsinformatie ─────────────────────────────────────── */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
            Bedrijfsinformatie
          </h2>
          <p className="text-xs text-text-muted -mt-2">
            Vul het BTW-nummer in — apotheeknaam en facturatie-adres worden
            automatisch ingeladen (VIES).
          </p>

          <div className="grid grid-cols-2 gap-4 items-end">
            <VatLookup onFound={handleVatFound} />
            <div className="pb-px">
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer select-none pb-2.5">
                <input
                  type="checkbox"
                  name="vat_liable"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                BTW plichtig
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="company_name">Apotheeknaam</Label>
            <Input
              id="company_name"
              name="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <AddressAutocomplete
            key={addressKey}
            names={{
              street:       "billing_street",
              house_number: "billing_house_number",
              postcode:     "billing_postcode",
              city:         "billing_city",
            }}
            defaults={addressDefaults}
          />
        </section>

        {error && (
          <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={isPending}>
            Apotheek aanmaken
          </Button>
          <ButtonLink href="/admin/gebruikers/apotheken" variant="secondary">
            Annuleren
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
