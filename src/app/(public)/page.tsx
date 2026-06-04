import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = user.app_metadata?.role;
    if (role === "admin") redirect("/admin/dashboard");
    if (role === "assistent") redirect("/assistent/dashboard");
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-28 px-6">
        <Image
          src="/img/apotheek-bg.jpeg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hulp in de Apotheek
          </h1>
          <p className="text-lg text-white/85 mb-8 leading-relaxed">
            Wij leveren ervaren assistenten die zorgen voor efficiëntie,
            zorgkwaliteit en klanttevredenheid. Neem vandaag nog contact op voor
            een passende oplossing!
          </p>
          <ButtonLink href="/contact" variant="white" size="lg">
            Contacteer ons
          </ButtonLink>
        </div>
      </section>

      {/* Over ons */}
      <section className="bg-surface px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
            Wie zijn wij
          </p>
          <h2 className="text-2xl font-bold text-text mb-6">Over Ons</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            Apotheekhulp werd opgericht door twee gedreven apothekers, Carolien
            en Lieselot, die elkaar vonden als hartsvriendinnen en in 2013
            afstudeerden aan de UGent. Met meer dan tien jaar ervaring in de
            apotheekwereld, brengen zij zowel kennis als passie in alles wat ze
            doen.
          </p>
          <p className="text-text-muted leading-relaxed mb-10">
            Lieselot, die al vijf jaar stagebegeleider en leerkracht is voor
            apotheekassistenten in het volwassenenonderwijs, heeft een diepgaand
            inzicht in de kwaliteiten die een topassistent moet bezitten.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-4 bg-background rounded-xl p-4 border border-border">
              <div className="relative w-24 h-24 lg:w-48 lg:h-48 rounded overflow-hidden shrink-0">
                <Image
                  src="/img/lieselot.jpg"
                  alt="Lieselot Van De Velde"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 6rem, 12rem"
                />
              </div>
              <div>
                <p className="font-semibold text-text text-sm">
                  Lieselot Van De Velde
                </p>
                <a
                  href="tel:+32472579116"
                  className="text-sm text-text-muted hover:text-primary transition-colors"
                >
                  +32 472 57 91 16
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-background rounded-xl p-4 border border-border">
              <div className="relative w-24 h-24 lg:w-48 lg:h-48 rounded overflow-hidden shrink-0">
                <Image
                  src="/img/carolien.jpg"
                  alt="Carolien Van der Sypt"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 6rem, 12rem"
                />
              </div>
              <div>
                <p className="font-semibold text-text text-sm">
                  Carolien Van der Sypt
                </p>
                <a
                  href="tel:+32494996182"
                  className="text-sm text-text-muted hover:text-primary transition-colors"
                >
                  +32 494 99 61 82
                </a>
              </div>
            </div>
          </div>

          <ButtonLink href="/over-ons" variant="secondary" size="sm">
            Meer over ons
          </ButtonLink>
        </div>
      </section>

      {/* Onze troeven — voor apotheken */}
      <section className="bg-background px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
            Onze Troeven
          </p>
          <h2 className="text-2xl font-bold text-text mb-8">Voor Apotheken</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text mb-2">
                Hulp op het moment dat u het nodig heeft
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Alles is mogelijk: 1 vaste dag per week, per maand of gewoon een
                aantal dagen in een drukbezette periode. Geef ons gerust de data
                door waarop u ondersteuning nodig heeft!
              </p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text mb-2">IMV</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Wil u uw patiënten de service kunnen aanbieden van IMV in de
                ambulante setting? Onze assistenten maken dit voor u mogelijk
                met ons eigen, specifiek medicatiesysteem.
              </p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text mb-2">
                Farmaceutische zorg voor uw patiënt
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Onze assistenten zijn opgeleid om u zo goed mogelijk bij te
                staan in het leveren van de juiste farmaceutische zorg, zodat u
                tijd vrijmaakt voor taken die enkel u als apotheker kan doen.
              </p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text mb-2">Bereidingen</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Onze assistenten kunnen de dagelijkse bereidingen voor hun
                rekening nemen, zodat u dit niet meer na sluitingstijd hoeft te
                maken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Voor apotheekassistenten */}
      <section className="bg-primary-light px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
            Voor Apotheekassistenten
          </p>
          <h2 className="text-2xl font-bold text-text mb-8">Voordelen</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {[
              "Je werkt zelfstandig, maar bent omringd door enthousiaste collega's, met opleidingsmomenten en teambuildings.",
              "Je krijgt loon naar waarde en kunt je eenmanszaak of vennootschap opstarten met behulp van een partner-boekhouder.",
              "Startersbegeleiding en volledige administratieve ondersteuning — snel starten zonder financieel risico.",
              "Werkopdrachten komen uit ons apothekersnetwerk, met fiscale en juridische hulp met groepskorting.",
              "Alle verzekeringen op maat: beroepsaansprakelijkheid, rechtsbijstand, VAPZ en hospitalisatieverzekering.",
              "Je kennis wordt regelmatig opgefrist door onze apothekers met updates en workshops over specifieke thema's.",
            ].map((voordeel, i) => (
              <div
                key={i}
                className="flex gap-3 bg-white rounded-xl border border-border p-4"
              >
                <svg
                  className="w-4 h-4 text-primary mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm text-text-muted leading-relaxed">
                  {voordeel}
                </p>
              </div>
            ))}
          </div>
          <ButtonLink href="/wat-we-doen" variant="secondary" size="sm">
            Meer over wat we doen
          </ButtonLink>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-surface px-6 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-text mb-3">
            Laten we samenwerken!
          </h2>
          <p className="text-text-muted mb-6">
            Neem contact op en we bekijken samen hoe Apotheekhulp voor u kan
            werken.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ButtonLink href="/contact" size="lg">
              Contacteer ons
            </ButtonLink>
            <ButtonLink href="/wat-we-doen" variant="secondary" size="lg">
              Wat we doen
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-text-muted">
          <span>© {new Date().getFullYear()} Apotheekhulp</span>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:info@apotheekhulp.be"
              className="hover:text-primary transition-colors"
            >
              info@apotheekhulp.be
            </a>
            <a
              href="tel:+32472579116"
              className="hover:text-primary transition-colors"
            >
              +32 472 57 91 16
            </a>
            <a
              href="tel:+32494996182"
              className="hover:text-primary transition-colors"
            >
              +32 494 99 61 82
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
