import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError, resolveImageUrl } from '../lib/api'
import { animalAge, categoryEmoji, categoryLabel, formatDate, statusLabel } from '../lib/animalLabels'
import type { Animal } from '../lib/types'

const STATUS_STYLES: Record<Animal['status'], string> = {
  active: 'bg-green-100 text-green-700',
  adopted: 'bg-amber-100 text-amber-700',
  removed: 'bg-stone-200 text-stone-600',
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 border-b border-cream-200 py-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  )
}

export function AnimalDetail() {
  const { id } = useParams<{ id: string }>()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLikeBusy, setIsLikeBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .get<{ animal: Animal }>(`/api/animals/${id}`)
      .then((data) => setAnimal(data.animal))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
        else setError('Das Tier konnte gerade nicht geladen werden.')
      })
  }, [id])

  async function toggleLike() {
    if (!animal) return
    setIsLikeBusy(true)
    try {
      if (animal.isLiked) {
        await api.delete(`/api/animals/${animal.id}/likes`)
      } else {
        await api.post(`/api/animals/${animal.id}/likes`)
      }
      setAnimal({ ...animal, isLiked: !animal.isLiked })
    } finally {
      setIsLikeBusy(false)
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="text-5xl">🐾</span>
        <p className="text-stone-600">Dieses Tier konnte nicht gefunden werden.</p>
        <Link to="/entdecken" className="rounded-full bg-coral-500 px-6 py-2 font-semibold text-white">
          Zurück zum Entdecken
        </Link>
      </div>
    )
  }

  if (error) {
    return <p className="mx-auto max-w-xl flex-1 px-4 py-16 text-center text-stone-600">{error}</p>
  }

  if (!animal) {
    return <p className="mx-auto max-w-xl flex-1 px-4 py-16 text-center text-stone-400">Lädt …</p>
  }

  const image = resolveImageUrl(animal.cachedImagePath ?? animal.imageUrl)

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
        <div className="relative aspect-video bg-coral-100 sm:aspect-[16/7]">
          {image ? (
            <img src={image} alt={animal.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl">
              {categoryEmoji(animal.category)}
            </div>
          )}
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[animal.status]}`}
          >
            {statusLabel(animal.status)}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-800">{animal.title}</h1>
              <p className="text-stone-500">
                {categoryEmoji(animal.category)} {categoryLabel(animal.category)}
              </p>
            </div>
            <button
              onClick={toggleLike}
              disabled={isLikeBusy}
              className={`rounded-full px-6 py-2.5 font-semibold shadow-sm transition-colors disabled:opacity-60 ${
                animal.isLiked
                  ? 'bg-heart-500 text-white hover:bg-heart-400'
                  : 'border-2 border-coral-200 text-coral-600 hover:bg-coral-50'
              }`}
            >
              {animal.isLiked ? '❤ Gemerkt' : '♡ Merken'}
            </button>
          </div>

          {animal.status !== 'active' && (
            <p className="mt-4 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
              {animal.status === 'adopted'
                ? 'Dieses Tier wurde bereits vermittelt.'
                : 'Dieses Tier ist laut aktuellem Datenstand nicht mehr verfügbar.'}
            </p>
          )}

          {animal.description && <p className="mt-4 text-stone-700">{animal.description}</p>}

          <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display font-bold text-stone-800">Steckbrief</h2>
              <InfoRow label="Rasse" value={animal.breed} />
              <InfoRow label="Alter" value={animalAge(animal.birthYear)} />
              <InfoRow label="Geschlecht" value={animal.gender} />
              <InfoRow label="Farbe" value={animal.color} />
              <InfoRow label="Mischling" value={animal.isMixed ? 'Ja' : null} />
              <InfoRow label="Fundort" value={animal.location} />
              <InfoRow label="Kundmachung" value={formatDate(animal.foundDate)} />
            </div>

            <div>
              <h2 className="font-display font-bold text-stone-800">Kontakt zur zuständigen Stelle</h2>
              <InfoRow label="Stelle" value={animal.contactName} />
              <InfoRow label="Telefon" value={animal.contactPhone} />
              <InfoRow label="E-Mail" value={animal.contactEmail} />
              <p className="mt-3 text-sm text-stone-500">
                Für Fragen zu diesem Fundtier oder eine Vermittlung wende dich bitte direkt an die zuständige
                Stelle. herztiere selbst vermittelt keine Tiere.
              </p>
            </div>
          </div>

          <p className="mt-8 border-t border-cream-200 pt-4 text-xs text-stone-400">
            Datenquelle: Stadt Wien – data.gv.at, Lizenz{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/deed.de"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-coral-500"
            >
              CC BY 4.0
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
