"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { updatePlatformConfig, type PlatformConfig } from "@/lib/actions/platform-config";
import { Label, Input } from "@/components/ui/Input";

function previewNumber(prefix: string, next: number) {
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

type Status = "idle" | "saving" | "saved" | "error";

function SaveStatus({ status, error }: { status: Status; error?: string }) {
  if (status === "idle")   return null;
  if (status === "saving") return <span className="text-xs text-text-muted">Opslaan…</span>;
  if (status === "error")  return <span className="text-xs text-danger">{error ?? "Fout bij opslaan"}</span>;
  return (
    <span className="text-xs text-success flex items-center gap-1">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      Opgeslagen
    </span>
  );
}

export function InstellingenForm({ config }: { config: PlatformConfig }) {
  const [values, setValues] = useState<PlatformConfig>({ ...config });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false };
  }, []);

  const save = useCallback(async (data: PlatformConfig) => {
    setStatus("saving");
    const result = await updatePlatformConfig(data);
    if (!isMounted.current) return;
    if ("error" in result) {
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      setStatus("saved");
      // Fade back to idle after 2 s
      setTimeout(() => { if (isMounted.current) setStatus("idle") }, 2000);
    }
  }, []);

  function set<K extends keyof PlatformConfig>(key: K, value: PlatformConfig[K]) {
    setValues(prev => {
      const next = { ...prev, [key]: value };
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(next), 700);
      return next;
    });
  }

  return (
    <div className="space-y-8">

      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <div /> {/* spacer */}
        <SaveStatus status={status} error={errorMsg} />
      </div>

      {/* Tarieven */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Tarieven</h2>

        <div>
          <Label htmlFor="km_rate">Kilometervergoeding (€/km)</Label>
          <Input
            id="km_rate"
            type="number" step="0.0001" min="0"
            value={values.km_rate}
            onChange={e => set("km_rate", parseFloat(e.target.value) || 0)}
          />
          <p className="mt-1 text-xs text-text-muted">Wettelijk tarief 2024–2025: €0,4326/km.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="default_hourly_rate_assistant">Standaard uurtarief assistent (€)</Label>
            <Input
              id="default_hourly_rate_assistant"
              type="number" step="0.01" min="0"
              value={values.default_hourly_rate_assistant}
              onChange={e => set("default_hourly_rate_assistant", parseFloat(e.target.value) || 0)}
            />
            <p className="mt-1 text-xs text-text-muted">Wat Apotheekhulp aan de assistent betaalt.</p>
          </div>
          <div>
            <Label htmlFor="default_hourly_rate_pharmacy">Standaard uurtarief apotheek (€)</Label>
            <Input
              id="default_hourly_rate_pharmacy"
              type="number" step="0.01" min="0"
              value={values.default_hourly_rate_pharmacy}
              onChange={e => set("default_hourly_rate_pharmacy", parseFloat(e.target.value) || 0)}
            />
            <p className="mt-1 text-xs text-text-muted">Wat de apotheek aan Apotheekhulp betaalt.</p>
          </div>
        </div>

        <div>
          <Label htmlFor="vat_rate">BTW-percentage (%)</Label>
          <Input
            id="vat_rate"
            type="number" step="0.01" min="0" max="100"
            value={values.vat_rate}
            onChange={e => set("vat_rate", parseFloat(e.target.value) || 0)}
          />
          <p className="mt-1 text-xs text-text-muted">Huidige BTW voor diensten: 21%. Enkel aanpassen als het wettelijk tarief wijzigt.</p>
        </div>
      </div>

      {/* Factuurnummering apotheek */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Factuurnummering — Apotheken</h2>
          <p className="text-xs text-text-muted mt-1">Automatisch ingevuld bij elke nieuwe factuur aan een apotheek. Nog steeds aanpasbaar vóór aanmaak.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoice_prefix">Voorvoegsel</Label>
            <Input
              id="invoice_prefix"
              value={values.invoice_prefix}
              onChange={e => set("invoice_prefix", e.target.value)}
              placeholder="2026"
            />
            <p className="mt-1 text-xs text-text-muted">Bijv. &ldquo;2026&rdquo; of &ldquo;AH-2026&rdquo;.</p>
          </div>
          <div>
            <Label htmlFor="invoice_next_number">Volgend nummer</Label>
            <Input
              id="invoice_next_number"
              type="number" min="1"
              value={values.invoice_next_number}
              onChange={e => set("invoice_next_number", parseInt(e.target.value, 10) || 1)}
            />
            <p className="mt-1 text-xs text-text-muted">Wordt automatisch verhoogd na elke factuur.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-lg px-4 py-3 text-sm">
          <span className="text-text-muted">Volgende factuur:</span>
          <span className="font-mono font-semibold text-text">
            {previewNumber(values.invoice_prefix || "2026", values.invoice_next_number || 1)}
          </span>
        </div>
      </div>

      {/* Bedrijfsgegevens Apotheekhulp */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Bedrijfsgegevens Apotheekhulp</h2>
          <p className="text-xs text-text-muted mt-1">Verschijnt als afzender op alle gegenereerde facturen.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_name">Naam</Label>
            <Input
              id="company_name"
              value={values.company_name}
              onChange={e => set("company_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company_vat">BTW-nummer</Label>
            <Input
              id="company_vat"
              value={values.company_vat}
              onChange={e => set("company_vat", e.target.value)}
              placeholder="BE0000.000.000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_street">Straat &amp; nummer</Label>
            <Input
              id="company_street"
              value={values.company_street}
              onChange={e => set("company_street", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company_city">Postcode &amp; gemeente</Label>
            <Input
              id="company_city"
              value={values.company_city}
              onChange={e => set("company_city", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_phone">Telefoon</Label>
            <Input
              id="company_phone"
              value={values.company_phone}
              onChange={e => set("company_phone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company_email">E-mail</Label>
            <Input
              id="company_email"
              type="email"
              value={values.company_email}
              onChange={e => set("company_email", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
