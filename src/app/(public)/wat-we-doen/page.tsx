export default function WatWeDoenPage() {
  const diensten = [
    {
      title: 'Flexibele inzet',
      description: 'Apotheekassistenten die snel en flexibel inzetbaar zijn wanneer jouw apotheek extra ondersteuning nodig heeft.',
    },
    {
      title: 'IMV',
      description: 'Gespecialiseerde ondersteuning bij individuele medicatievoorbereiding voor woonzorgcentra en thuiszorg.',
    },
    {
      title: 'Bereidingen',
      description: 'Assistenten met ervaring in magistrale bereidingen, zodat jouw apotheek vlot kan opereren.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Wat we doen</h1>
      <p className="text-gray-500 text-lg mb-12">
        Apotheekhulp verbindt apotheken met gekwalificeerde apotheekassistenten voor tijdelijke en flexibele opdrachten.
      </p>

      <div className="space-y-4 mb-16">
        {diensten.map(d => (
          <div key={d.title} className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">{d.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{d.description}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-primary-light rounded-xl p-6">
          <h3 className="text-base font-semibold text-primary mb-3">Voor assistenten</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Vrijheid om zelf opdrachten te kiezen</li>
            <li>Eerlijk en transparant uurtarief</li>
            <li>Gevarieerde werkervaring</li>
            <li>Facturen en administratie via ons platform</li>
          </ul>
        </div>

        <div className="bg-primary-light rounded-xl p-6">
          <h3 className="text-base font-semibold text-primary mb-3">Voor apotheken</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Snel gekwalificeerde vervanging</li>
            <li>Geen administratieve rompslomp</li>
            <li>Vertrouwde, gescreende assistenten</li>
            <li>Flexibel per dag of per periode</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
