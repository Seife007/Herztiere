import { describe, expect, it } from 'vitest'
import { animalAge, animalSubtitle, categoryEmoji, categoryLabel, formatDate, statusLabel } from './animalLabels.js'
import type { Animal } from './types.js'

describe('categoryLabel', () => {
  it('maps known categories to German labels', () => {
    expect(categoryLabel('01_Hunde')).toBe('Hund')
    expect(categoryLabel('02_Katzen')).toBe('Katze')
  })

  it('falls back to the raw value for unknown categories', () => {
    expect(categoryLabel('99_Unbekannt')).toBe('99_Unbekannt')
  })
})

describe('categoryEmoji', () => {
  it('falls back to a generic paw for unknown categories', () => {
    expect(categoryEmoji('99_Unbekannt')).toBe('🐾')
  })
})

describe('formatDate', () => {
  it('formats a YYYY-MM-DD string as DD.MM.YYYY', () => {
    expect(formatDate('2026-07-29')).toBe('29.07.2026')
  })

  it('ignores a trailing time component', () => {
    expect(formatDate('2026-07-29T00:00:00.000Z')).toBe('29.07.2026')
  })

  it('returns null for null input', () => {
    expect(formatDate(null)).toBeNull()
  })

  it('returns null for an unparsable string', () => {
    expect(formatDate('not-a-date')).toBeNull()
  })
})

describe('animalAge', () => {
  it('returns null when no birth year is known', () => {
    expect(animalAge(null)).toBeNull()
  })

  it('returns "unter 1 Jahr" for the current year', () => {
    expect(animalAge(new Date().getFullYear())).toBe('unter 1 Jahr')
  })

  it('uses singular for exactly 1 year', () => {
    expect(animalAge(new Date().getFullYear() - 1)).toBe('1 Jahr')
  })

  it('uses plural for more than 1 year', () => {
    expect(animalAge(new Date().getFullYear() - 3)).toBe('3 Jahre')
  })
})

describe('statusLabel', () => {
  it('maps every status to a German label', () => {
    expect(statusLabel('active')).toBe('Verfügbar')
    expect(statusLabel('adopted')).toBe('Vermittelt')
    expect(statusLabel('removed')).toBe('Nicht mehr verfügbar')
  })
})

function animal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: '1',
    title: 'Bello',
    category: '01_Hunde',
    breed: null,
    gender: null,
    color: null,
    birthYear: null,
    isMixed: false,
    description: null,
    location: null,
    foundDate: null,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    imageUrl: null,
    cachedImagePath: null,
    status: 'active',
    sourceUrl: 'https://example.com',
    isLiked: false,
    ...overrides,
  }
}

describe('animalSubtitle', () => {
  it('joins breed, age and gender when available', () => {
    expect(
      animalSubtitle(animal({ breed: 'Mischling', birthYear: new Date().getFullYear() - 2, gender: 'männlich' })),
    ).toBe('Mischling · 2 Jahre · männlich')
  })

  it('falls back to the category label when nothing else is known', () => {
    expect(animalSubtitle(animal({ category: '02_Katzen' }))).toBe('Katze')
  })
})
