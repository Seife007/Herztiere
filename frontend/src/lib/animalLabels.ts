import type { Animal } from './types'

const CATEGORY_LABELS: Record<string, string> = {
  '01_Hunde': 'Hund',
  '02_Katzen': 'Katze',
  '03_Andere Tiere': 'Sonstiges Tier',
}

const CATEGORY_EMOJI: Record<string, string> = {
  '01_Hunde': '🐶',
  '02_Katzen': '🐱',
  '03_Andere Tiere': '🐾',
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export function categoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? '🐾'
}

// `foundDate` kommt vom Backend als reiner "YYYY-MM-DD"-String (siehe
// animals.ts, found_date::text) statt als Date-Objekt, damit keine
// Zeitzonen-Verschiebung beim Serialisieren passieren kann.
export function formatDate(isoDate: string | null): string | null {
  if (!isoDate) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) return null
  const [, year, month, day] = match
  return `${day}.${month}.${year}`
}

export function animalAge(birthYear: number | null): string | null {
  if (!birthYear) return null
  const age = new Date().getFullYear() - birthYear
  if (age <= 0) return 'unter 1 Jahr'
  return age === 1 ? '1 Jahr' : `${age} Jahre`
}

const STATUS_LABELS: Record<Animal['status'], string> = {
  active: 'Verfügbar',
  adopted: 'Vermittelt',
  removed: 'Nicht mehr verfügbar',
}

export function statusLabel(status: Animal['status']): string {
  return STATUS_LABELS[status]
}

export function animalSubtitle(animal: Animal): string {
  const parts = [animal.breed, animalAge(animal.birthYear), animal.gender].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : categoryLabel(animal.category)
}
