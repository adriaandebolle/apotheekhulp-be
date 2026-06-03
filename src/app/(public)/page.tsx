import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const role = user.app_metadata?.role
    if (role === 'admin') redirect('/admin/dashboard')
    if (role === 'assistent') redirect('/assistent/dashboard')
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary-light py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hulp in de Apotheek</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Apotheekhulp verbindt apotheken in België met gekwalificeerde apotheekassistenten voor flexibele inzet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/wat-we-doen"
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Wat we doen
            </Link>
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Neem contact op
            </Link>
          </div>
        </div>
      </section>

      {/* Diensten */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Voor wie?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Voor apotheken</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Snel en eenvoudig gekwalificeerde vervanging vinden voor uw apotheek — flexibel, betrouwbaar en zonder administratieve rompslomp.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Voor assistenten</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Kies zelf wanneer en waar u werkt. Eerlijk uurtarief, gevarieerde opdrachten en alles geregeld via ons platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Oprichters intro */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Opgericht door apotheekprofessionals</h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto">
            Lieselot en Carolien kennen de apotheeksector van binnenuit. Apotheekhulp is gebouwd vanuit de praktijk, voor de praktijk.
          </p>
          <Link href="/over-ons" className="text-sm font-medium text-primary hover:underline">
            Meer over ons →
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Klaar om te starten?</h2>
          <p className="text-gray-500 mb-6">Neem contact op en we bekijken samen hoe Apotheekhulp voor u kan werken.</p>
          <Link
            href="/contact"
            className="inline-flex px-6 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Contacteer ons
          </Link>
        </div>
      </section>
    </div>
  )
}
