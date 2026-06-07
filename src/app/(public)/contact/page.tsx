"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { submitContactForm } from "@/lib/actions/contact";

export default function ContactPage() {
  const [naam, setNaam] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [email, setEmail] = useState("");
  const [bericht, setBericht] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitContactForm({
        naam,
        telefoon,
        email,
        bericht,
      });
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-2">
            Contact
          </p>
          <h1 className="text-3xl font-bold text-white mb-4">
            Laten we samenwerken!
          </h1>
          <p className="text-white/80 leading-relaxed">
            Neem gerust contact op. We bekijken samen hoe Apotheekhulp voor u
            kan werken.
          </p>
        </div>
      </section>

      <section className="bg-background px-6 py-14">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-10">
          {/* Contactgegevens */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text mb-4">
                Contactgegevens
              </h2>
              <div className="space-y-3">
                <a
                  href="mailto:info@apotheekhulp.be"
                  className="flex items-center gap-3 text-sm text-text-muted hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-primary shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@apotheekhulp.be
                </a>
                <a
                  href="tel:+32472579116"
                  className="flex items-center gap-3 text-sm text-text-muted hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-primary shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Lieselot: +32 472 57 91 16
                </a>
                <a
                  href="tel:+32494996182"
                  className="flex items-center gap-3 text-sm text-text-muted hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-primary shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Carolien: +32 494 99 61 82
                </a>
              </div>
            </div>
          </div>

          {/* Contactformulier */}
          <div className="bg-surface rounded-xl border border-border p-6 lg:col-span-2">
            <h2 className="text-base font-bold text-text mb-5">
              Stuur ons een bericht
            </h2>

            {success ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-800">
                <p className="font-semibold mb-1">Bericht verzonden!</p>
                <p>
                  Bedankt voor uw bericht. We nemen zo snel mogelijk contact met
                  u op.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="naam"
                      className="block text-xs font-medium text-text-muted mb-1.5"
                    >
                      Naam <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="naam"
                      type="text"
                      required
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Uw naam"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="telefoon"
                      className="block text-xs font-medium text-text-muted mb-1.5"
                    >
                      Telefoonnummer
                    </label>
                    <input
                      id="telefoon"
                      type="tel"
                      value={telefoon}
                      onChange={(e) => setTelefoon(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="+32 ..."
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-text-muted mb-1.5"
                  >
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="uw@email.be"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bericht"
                    className="block text-xs font-medium text-text-muted mb-1.5"
                  >
                    Bericht <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bericht"
                    rows={4}
                    required
                    value={bericht}
                    onChange={(e) => setBericht(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    placeholder="Hoe kunnen we u helpen?"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <Button type="submit" fullWidth disabled={isPending}>
                  {isPending ? "Verzenden…" : "Verstuur"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
