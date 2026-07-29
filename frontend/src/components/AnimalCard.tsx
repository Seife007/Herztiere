import { resolveImageUrl } from '../lib/api'
import { animalSubtitle, categoryEmoji } from '../lib/animalLabels'
import type { Animal } from '../lib/types'

export function AnimalCard({ animal }: { animal: Animal }) {
  const image = resolveImageUrl(animal.cachedImagePath ?? animal.imageUrl)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white">
      <div className="relative flex-1 bg-coral-100">
        {image ? (
          <img src={image} alt={animal.title} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-8xl">
            {categoryEmoji(animal.category)}
          </div>
        )}
        {animal.isMixed && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-600">
            Mischling
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl font-bold text-stone-800">{animal.title}</h3>
        <p className="text-stone-500">{animalSubtitle(animal)}</p>
        {animal.location && <p className="mt-1 text-sm text-stone-400">📍 {animal.location}</p>}
      </div>
    </div>
  )
}
