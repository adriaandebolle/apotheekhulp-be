"use client";

import { useState, useTransition } from "react";
import {
  updatePlatformConfig,
  type PlatformConfig,
} from "@/lib/actions/platform-config";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function InstellingenForm({ config }: { config: PlatformConfig }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    error?: string;
    success?: string;
  }>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFeedback({});
    startTransition(async () => {
      const result = await updatePlatformConfig({
        km_rate: parseFloat(fd.get("km_rate") as string),
        vat_rate: parseFloat(fd.get("vat_rate") as string),
        default_hourly_rate_assistant: parseFloat(
          fd.get("default_hourly_rate_assistant") as string,
        ),
        default_hourly_rate_pharmacy: parseFloat(
          fd.get("default_hourly_rate_pharmacy") as string,
        ),
      });
      if ("error" in result) setFeedback({ error: result.error });
      else setFeedback({ success: "Instellingen opgeslagen." });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-xl p-6 space-y-6"
    >
      <div>
        <Label htmlFor="km_rate" required>
          Kilometervergoeding (€/km)
        </Label>
        <Input
          id="km_rate"
          name="km_rate"
          type="number"
          step="0.0001"
          min="0"
          required
          defaultValue={config.km_rate}
        />
        <p className="mt-1 text-xs text-text-muted">
          Wettelijk tarief 2024–2025: €0,4326/km. Wordt gebruikt als standaard
          bij nieuwe koppelingen.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="default_hourly_rate_assistant" required>
            Standaard uurtarief assistent (€)
          </Label>
          <Input
            id="default_hourly_rate_assistant"
            name="default_hourly_rate_assistant"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={config.default_hourly_rate_assistant}
          />
          <p className="mt-1 text-xs text-text-muted">
            Wat apotheekhulp aan de assistent betaalt.
          </p>
        </div>
        <div>
          <Label htmlFor="default_hourly_rate_pharmacy" required>
            Standaard uurtarief apotheek (€)
          </Label>
          <Input
            id="default_hourly_rate_pharmacy"
            name="default_hourly_rate_pharmacy"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={config.default_hourly_rate_pharmacy}
          />
          <p className="mt-1 text-xs text-text-muted">
            Wat de apotheek aan apotheekhulp betaalt.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="vat_rate" required>
          BTW-percentage (%)
        </Label>
        <Input
          id="vat_rate"
          name="vat_rate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          required
          defaultValue={config.vat_rate}
        />
        <p className="mt-1 text-xs text-text-muted">
          Huidige BTW voor diensten: 21%. Enkel aanpassen als het wettelijk
          tarief wijzigt.
        </p>
      </div>

      {feedback.error && (
        <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {feedback.error}
        </p>
      )}
      {feedback.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {feedback.success}
        </p>
      )}

      <Button type="submit" loading={isPending}>
        Opslaan
      </Button>
    </form>
  );
}
