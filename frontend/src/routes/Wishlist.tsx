import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { AnimalListCard } from '../components/AnimalListCard'
import type { Animal } from '../lib/types'

export function Wishlist() {
  const [animals, setAnimals] = useState<Animal[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ animals: Animal[] }>('/api/users/me/likes')
      .then((data) => setAnimals(data.animals))
      .catch(() => setError('Die Merkliste konnte gerade nicht geladen werden.'))
  }, [])

  async function handleUnlike(animalId: string) {
    setAnimals((current) => current?.filter((a) => a.id !== animalId) ?? null)
    try {
      await api.delete(`/api/animals/${animalId}/likes`)
    } catch {
      // Bei Fehler bleibt die lokale Liste trotzdem aktuell für diese Session;
      // ein Neuladen der Seite zeigt den tatsächlichen Server-Stand.
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-800">Deine Merkliste</h1>

      {error && <p className="mt-6 text-stone-600">{error}</p>}

      {!error && animals === null && <p className="mt-6 text-stone-400">Lädt …</p>}

      {!error && animals !== null && animals.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-md">
          <span className="text-5xl">💌</span>
          <p className="max-w-xs text-stone-600">
            Noch nichts gemerkt. Wisch dich durch die Fundtiere und merke dir deine Favoriten.
          </p>
          <Link
            to="/entdecken"
            className="rounded-full bg-coral-500 px-6 py-2 font-semibold text-white hover:bg-coral-600"
          >
            Jetzt entdecken
          </Link>
        </div>
      )}

      {!error && animals !== null && animals.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {animals.map((animal) => (
            <AnimalListCard key={animal.id} animal={animal} onUnlike={() => handleUnlike(animal.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
