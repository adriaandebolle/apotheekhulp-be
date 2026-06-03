import Image from 'next/image'
import { ButtonLink } from '@/components/ui'

export default function OverOnsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-2">Wie zijn wij</p>
          <h1 className="text-3xl font-bold text-white mb-4">Over Ons</h1>
          <p className="text-white/80 leading-relaxed">
            Apotheekhulp werd opgericht door twee gedreven apothekers die de sector van binnenuit kennen.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-surface px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <p className="text-text-muted leading-relaxed mb-4">
            Carolien en Lieselot vonden elkaar als hartsvriendinnen en studeerden in 2013 af aan de UGent. Met meer dan tien jaar ervaring in de apotheekwereld, brengen zij zowel kennis als passie in alles wat ze doen.
          </p>
          <p className="text-text-muted leading-relaxed">
            Lieselot, die al vijf jaar stagebegeleider en leerkracht is voor apotheekassistenten in het volwassenenonderwijs, heeft een diepgaand inzicht in de kwaliteiten die een topassistent moet bezitten. Dankzij haar ervaring weet ze precies welke vaardigheden essentieel zijn voor succes in de apotheekpraktijk.
          </p>
        </div>
      </section>

      {/* Personen */}
      <section className="bg-background px-6 py-14">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-8">
          {/* Lieselot */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="relative h-72 lg:h-96">
              <Image
                src="/img/lieselot.jpg"
                alt="Lieselot Van De Velde"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-bold text-text mb-0.5">Lieselot Van De Velde</h2>
              <p className="text-sm text-primary font-medium mb-3">Mede-oprichter</p>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                Apotheker met meer dan tien jaar ervaring. Stagebegeleider en leerkracht voor apotheekassistenten in het volwassenenonderwijs. Ze heeft een scherp oog voor de vaardigheden die essentieel zijn in de apotheekpraktijk.
              </p>
              <a
                href="tel:+32472579116"
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +32 472 57 91 16
              </a>
            </div>
          </div>

          {/* Carolien */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="relative h-72 lg:h-96">
              <Image
                src="/img/carolien.jpg"
                alt="Carolien Van der Sypt"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-bold text-text mb-0.5">Carolien Van der Sypt</h2>
              <p className="text-sm text-primary font-medium mb-3">Mede-oprichter</p>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                Apotheker met een brede praktijkervaring. Samen met Lieselot bouwt ze aan een netwerk van gekwalificeerde assistenten en apotheken in België.
              </p>
              <a
                href="tel:+32494996182"
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +32 494 99 61 82
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface px-6 py-14">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold text-text mb-3">Wil u samenwerken?</h2>
          <p className="text-text-muted text-sm mb-6">Neem rechtstreeks contact op met Lieselot of Carolien.</p>
          <ButtonLink href="/contact" size="lg">Contacteer ons</ButtonLink>
        </div>
      </section>
    </div>
  )
}
