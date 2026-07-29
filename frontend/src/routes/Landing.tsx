import { Link } from 'react-router-dom'

const EXAMPLE_CARDS = [
  { emoji: '🐱', name: 'Minka', info: 'Europäisch Kurzhaar · 2 Jahre', rotate: '-rotate-6' },
  { emoji: '🐶', name: 'Bruno', info: 'Mischling · verspielt', rotate: 'rotate-3' },
  { emoji: '🐹', name: 'Keks', info: 'Meerschweinchen · sucht Partner', rotate: '-rotate-2' },
]

const STEPS = [
  {
    title: 'Registrieren',
    text: 'Erzähl uns kurz, für welche Tierarten du dich interessierst und wie du wohnst.',
    emoji: '📝',
  },
  {
    title: 'Swipen',
    text: 'Wisch dich durch aktuelle Fundtiere aus Wien – nach rechts für "gefällt mir", nach links für "weiter".',
    emoji: '💫',
  },
  {
    title: 'Kontakt aufnehmen',
    text: 'Gemerkte Tiere landen in deiner Merkliste, inkl. Kontakt zur zuständigen Stelle.',
    emoji: '💌',
  },
]

export function Landing() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 md:flex-row md:py-20">
        <div className="flex flex-1 flex-col items-center gap-6 text-center md:items-start md:text-left">
          <h1 className="font-display text-4xl font-bold text-stone-800 md:text-5xl">
            Finde dein neues <span className="text-coral-500">Herztier</span>.
          </h1>
          <p className="max-w-md text-lg text-stone-600">
            herztiere zeigt dir aktuelle Fundtiere der Stadt Wien im Swipe-Format – spielerisch entdecken, merken
            und mit der zuständigen Stelle in Kontakt treten.
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              to="/registrieren"
              className="rounded-full bg-coral-500 px-6 py-3 font-semibold text-white shadow-md shadow-coral-200 transition-colors hover:bg-coral-600"
            >
              Jetzt kostenlos mitmachen
            </Link>
            <Link
              to="/login"
              className="rounded-full border-2 border-coral-200 px-6 py-3 font-semibold text-coral-600 transition-colors hover:bg-coral-50"
            >
              Ich habe schon ein Konto
            </Link>
          </div>
        </div>

        <div className="relative h-64 w-64 shrink-0 md:h-72 md:w-72" aria-hidden="true">
          {EXAMPLE_CARDS.map((card, index) => (
            <div
              key={card.name}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-coral-100 bg-white p-6 shadow-xl ${card.rotate}`}
              style={{ zIndex: EXAMPLE_CARDS.length - index }}
            >
              <span className="text-6xl">{card.emoji}</span>
              <p className="font-display text-xl font-bold text-stone-800">{card.name}</p>
              <p className="text-sm text-stone-500">{card.info}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/60 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-bold text-stone-800">So funktioniert's</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-3xl bg-cream-100 p-6 text-center">
                <span className="text-4xl">{step.emoji}</span>
                <h3 className="mt-3 font-display text-xl font-bold text-stone-800">{step.title}</h3>
                <p className="mt-2 text-stone-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-stone-800">Bereit, dein Herztier zu finden?</h2>
        <p className="mx-auto mt-3 max-w-md text-stone-600">
          Alle Daten stammen aus dem offenen Datensatz "Fundtiere Wien" der Stadt Wien und werden mehrmals täglich
          aktualisiert.
        </p>
        <Link
          to="/registrieren"
          className="mt-6 inline-block rounded-full bg-coral-500 px-8 py-3 font-semibold text-white shadow-md shadow-coral-200 transition-colors hover:bg-coral-600"
        >
          Kostenlos registrieren
        </Link>
      </section>
    </div>
  )
}
