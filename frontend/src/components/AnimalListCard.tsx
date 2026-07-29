import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveImageUrl } from '../lib/api'
import { animalSubtitle, categoryEmoji, statusLabel } from '../lib/animalLabels'
import type { Animal } from '../lib/types'

const STATUS_BADGE_STYLES: Record<Animal['status'], string> = {
  active: 'hidden',
  adopted: 'bg-amber-100 text-amber-700',
  removed: 'bg-stone-200 text-stone-600',
}

export function AnimalListCard({ animal, onUnlike }: { animal: Animal; onUnlike?: () => void }) {
  const image = resolveImageUrl(animal.cachedImagePath ?? animal.imageUrl)
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-md transition-shadow hover:shadow-lg">
      <Link to={`/tiere/${animal.id}`} className="block">
        <div className="relative aspect-square bg-coral-100">
          {image ? (
            <img src={image} alt={animal.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              {categoryEmoji(animal.category)}
            </div>
          )}
          {animal.status !== 'active' && (
            <span
              className={`absolute left-2 top-2 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[animal.status]}`}
            >
              {statusLabel(animal.status)}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-stone-800">{animal.title}</h3>
          <p className="text-sm text-stone-500">{animalSubtitle(animal)}</p>
        </div>
      </Link>
      {onUnlike && (
        <button
          aria-label="Aus Merkliste entfernen"
          onClick={(event) => {
            event.preventDefault()
            setConfirmingRemove(true)
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-heart-500 shadow-sm opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        >
          ✕
        </button>
      )}
      {confirmingRemove && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/95 p-4 text-center">
          <p className="font-semibold text-stone-800">
            Bist du sicher, dass du dieses Tier entfernen willst?
          </p>
          <div className="flex w-full flex-col gap-2">
            <button
              onClick={(event) => {
                event.preventDefault()
                setConfirmingRemove(false)
                onUnlike?.()
              }}
              className="w-full rounded-full bg-heart-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Entfernen
            </button>
            <button
              onClick={(event) => {
                event.preventDefault()
                setConfirmingRemove(false)
              }}
              className="w-full rounded-full border-2 border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
