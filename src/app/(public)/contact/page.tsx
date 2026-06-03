export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact</h1>
      <p className="text-gray-500 text-lg mb-12">Neem gerust contact met ons op.</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-xl border border-border p-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">E-mail</p>
            <a href="mailto:info@apotheekhulp.be" className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
              info@apotheekhulp.be
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Telefoon</p>
            <p className="text-sm font-medium text-gray-900">Volgt binnenkort</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Stuur ons een bericht</h2>
        <form className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="naam" className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                id="naam"
                type="text"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Uw naam"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="uw@email.be"
              />
            </div>
          </div>
          <div>
            <label htmlFor="telefoon" className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
            <input
              id="telefoon"
              type="tel"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="+32 ..."
            />
          </div>
          <div>
            <label htmlFor="bericht" className="block text-sm font-medium text-gray-700 mb-1">Bericht</label>
            <textarea
              id="bericht"
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              placeholder="Hoe kunnen we u helpen?"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Verstuur
          </button>
        </form>
      </div>
    </div>
  )
}
