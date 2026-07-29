import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { SwipeDeck } from '../components/SwipeDeck'
import type { Animal } from '../lib/types'

export function Swipe() {
  const [animals, setAnimals] = useState<Animal[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)
  const [deckKey, setDeckKey] = useState(0)

  const load = useCallback(async () => {
    setAnimals(null)
    setError(null)
    setIsEmpty(false)
    try {
      const data = await api.get<{ animals: Animal[] }>('/api/animals?limit=100')
      setAnimals(data.animals)
      if (data.animals.length === 0) setIsEmpty(true)
    } catch {
      setError('Die Tiere konnten gerade nicht geladen werden.')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, deckKey])

  async function handleLike(animal: Animal) {
    try {
      await api.post(`/api/animals/${animal.id}/likes`)
    } catch {
      // Merken schlägt fehl -> Tier bleibt beim nächsten Laden erneut im Stapel, kein Abbruch nötig.
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-800">Entdecken</h1>

      {error && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-md">
          <p className="text-stone-600">{error}</p>
          <button
            onClick={() => setDeckKey((k) => k + 1)}
            className="rounded-full bg-coral-500 px-6 py-2 font-semibold text-white hover:bg-coral-600"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {!error && animals === null && (
        <div className="flex h-96 items-center justify-center text-stone-400">Lädt Fundtiere …</div>
      )}

      {!error && animals !== null && isEmpty && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-md">
          <span className="text-5xl">🎉</span>
          <p className="max-w-xs text-stone-600">
            Du hast dir gerade alle aktuellen Fundtiere angesehen. Schau später wieder vorbei – der Bestand wird
            mehrmals täglich aktualisiert.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeckKey((k) => k + 1)}
              className="rounded-full bg-coral-500 px-6 py-2 font-semibold text-white hover:bg-coral-600"
            >
              Nochmal prüfen
            </button>
            <Link
              to="/merkliste"
              className="rounded-full border-2 border-coral-200 px-6 py-2 font-semibold text-coral-600 hover:bg-coral-50"
            >
              Zur Merkliste
            </Link>
          </div>
        </div>
      )}

      {!error && animals !== null && !isEmpty && (
        <SwipeDeck
          key={deckKey}
          animals={animals}
          onLike={handleLike}
          onSkip={() => {}}
          onEmpty={() => setIsEmpty(true)}
        />
      )}
    </div>
  )
}
