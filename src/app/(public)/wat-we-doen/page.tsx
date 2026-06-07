import { ButtonLink } from "@/components/ui";

const voorApotheken = [
  {
    title: "Hulp op het moment dat u het nodig heeft",
    body: "Alles is mogelijk: 1 vaste dag per week, per maand of gewoon een aantal dagen in een drukbezette periode. Geef ons gerust de data door waarop u ondersteuning nodig heeft! Wij checken de agenda's van onze apotheekassistenten en proberen maximaal aan uw vraag te voldoen.",
  },
  {
    title: "IMV",
    body: "Wil u uw patiënten de service kunnen aanbieden van IMV in de ambulante setting? Onze assistenten maken dit voor u mogelijk. Na controle van het medicatieschema kunnen ze de medicatie klaarzetten met ons eigen, specifiek medicatiesysteem. Dit IMV systeem kan eveneens zeer voordelig via ons aangekocht worden.",
  },
  {
    title: "Farmaceutische zorg voor uw patiënt",
    body: "Onze assistenten zijn opgeleid om u zo goed mogelijk bij te staan in het leveren van de juiste farmaceutische zorg aan uw patiënten. Op die manier kan u tijd vrijmaken voor specifieke taken die enkel u als apotheker kan doen — denk maar aan administratie, facturatie of vaccinatie.",
  },
  {
    title: "Bereidingen",
    body: "Wil u officinale bereidingen aanbieden aan uw patiënt, die elders niet te verkrijgen zijn? Of heeft u graag enkele voorraadbereidingen klaarstaan waarop u kan terugvallen? Onze assistenten kunnen de dagelijkse bereidingen ook voor hun rekening nemen.",
  },
];

const voorAssistenten = [
  "Je werkt zelfstandig, maar bent omringd door enthousiaste collega's, met opleidingsmomenten en teambuildings.",
  "Je krijgt loon naar waarde en kunt je eenmanszaak of vennootschap opstarten met behulp van een partner-boekhouder en legale voordelen.",
  "We bieden startersbegeleiding en volledige administratieve ondersteuning, zodat je snel kunt starten zonder financieel risico.",
  "Werkopdrachten komen uit ons apothekersnetwerk, en je krijgt fiscale en juridische hulp met groepskorting.",
  "Onze verzekeringsmakelaar regelt alle verzekeringen op maat: beroepsaansprakelijkheid, rechtsbijstand, VAPZ en hospitalisatieverzekering — zodat je volledig gedekt bent, ook bij ziekte.",
  "Je boekhouding wordt zorgvuldig beheerd door een partner-boekhoudkantoor, dat zorgt voor optimaal rendement en extra legale voordelen.",
  "Je kennis wordt regelmatig opgefrist door onze apothekers Lieselot en Carolien, met updates over geneesmiddelen, medicatie, doseringen en workshops over specifieke thema's.",
];

export default function WatWeDoenPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-2">
            Wat doen we
          </p>
          <h1 className="text-3xl font-bold text-white mb-4">Wat we doen</h1>
          <p className="text-white/80 leading-relaxed">
            Flexibele inzet van gekwalificeerde apotheekassistenten — voor
            apotheken én voor de assistenten zelf.
          </p>
        </div>
      </section>

      {/* Voor apotheken */}
      <section className="bg-surface px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
            Onze Troeven
          </p>
          <h2 className="text-2xl font-bold text-text mb-8">Voor Apotheken</h2>
          <div className="space-y-4">
            {voorApotheken.map((item) => (
              <div
                key={item.title}
                className="bg-background rounded-xl border border-border p-5"
              >
                <h3 className="font-semibold text-text mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voor assistenten */}
      <section className="bg-primary-light px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
            Voordelen
          </p>
          <h2 className="text-2xl font-bold text-text mb-8">
            Voor Apotheekassistenten
          </h2>
          <div className="space-y-3">
            {voorAssistenten.map((voordeel, i) => (
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
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface px-6 py-14">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold text-text mb-3">Interesse?</h2>
          <p className="text-text-muted text-sm mb-6">
            Contacteer ons voor meer informatie over onze diensten.
          </p>
          <ButtonLink href="/contact" size="lg">
            Contacteer ons
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
