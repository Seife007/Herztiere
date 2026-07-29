import { describe, expect, it } from 'vitest'
import { resolveAnimal, type Animal } from './animals.js'

function baseRow(overrides: Record<string, unknown> = {}) {
  const animal: Omit<Animal, 'isLiked'> = {
    id: '1',
    title: 'Bello',
    category: '01_Hunde',
    breed: 'Mischling',
    gender: 'männlich',
    color: 'braun',
    birthYear: 2022,
    isMixed: true,
    description: 'Ein lieber Hund.',
    location: '16., Gablenzgasse',
    foundDate: '2026-07-28',
    contactName: 'TierQuarTier Wien',
    contactPhone: '+43 1 734 11 02',
    contactEmail: 'tieraufnahme@tierquartier.at',
    imageUrl: 'https://example.com/bild.jpg',
    cachedImagePath: '/api/images/1.jpg',
    status: 'active',
    sourceUrl: 'https://example.com/feed.xml',
  }
  return { ...animal, overrides }
}

describe('resolveAnimal', () => {
  it('returns the base fields unchanged when there are no overrides', () => {
    const result = resolveAnimal(baseRow(), false)
    expect(result.title).toBe('Bello')
    expect(result.status).toBe('active')
    expect(result.description).toBe('Ein lieber Hund.')
  })

  it('lets an override take precedence over the synced base value', () => {
    const result = resolveAnimal(baseRow({ description: 'Admin-Beschreibung' }), false)
    expect(result.description).toBe('Admin-Beschreibung')
    expect(result.title).toBe('Bello')
  })

  it('applies multiple overrides at once', () => {
    const result = resolveAnimal(baseRow({ status: 'adopted', title: 'Bello (vermittelt)' }), false)
    expect(result.status).toBe('adopted')
    expect(result.title).toBe('Bello (vermittelt)')
  })

  it('does not apply an override for a falsy-but-present value incorrectly (e.g. isMixed=false)', () => {
    const result = resolveAnimal(baseRow({ isMixed: false }), false)
    expect(result.isMixed).toBe(false)
  })

  it('ignores unknown/non-overridable keys in the overrides object', () => {
    const result = resolveAnimal(baseRow({ notAField: 'x', externalId: 'should-be-ignored' }), false)
    expect(result.title).toBe('Bello')
    expect((result as unknown as Record<string, unknown>).notAField).toBeUndefined()
  })

  it('passes the isLiked flag through unchanged', () => {
    expect(resolveAnimal(baseRow(), true).isLiked).toBe(true)
    expect(resolveAnimal(baseRow(), false).isLiked).toBe(false)
  })
})
