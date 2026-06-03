export default function OverOnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Over ons</h1>
      <p className="text-gray-500 text-lg mb-12">Lieselot &amp; Carolien — achtergrond en visie</p>

      <div className="grid sm:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
            <span className="text-primary font-bold text-xl">L</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Lieselot</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Meer informatie volgt binnenkort.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
            <span className="text-primary font-bold text-xl">C</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Carolien</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Meer informatie volgt binnenkort.
          </p>
        </div>
      </div>
    </div>
  )
}
