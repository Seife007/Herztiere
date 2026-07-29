import { describe, expect, it } from 'vitest'
import { computeSyncPlan, type ExistingAnimal } from './syncPlan.js'
import type { FeedAnimal } from './fundtiereFeed.js'

function feedAnimal(overrides: Partial<FeedAnimal> = {}): FeedAnimal {
  return {
    externalId: '1',
    title: 'Europäisch Kurzhaar',
    category: '02_Katzen',
    foundDate: '2026-07-28',
    birthYear: 2022,
    gender: 'männlich',
    color: 'weiß-grau',
    isMixed: false,
    location: '16., Gablenzgasse',
    contactName: 'TierQuarTier Wien',
    contactPhone: '+43 1 734 11 02',
    contactEmail: 'tieraufnahme@tierquartier.at',
    sourceImagePath: '/fundundvergabetiere/internet/Bild/Thumbnail/84485',
    ...overrides,
  }
}

function existingAnimal(overrides: Partial<ExistingAnimal> = {}): ExistingAnimal {
  return { id: 'db-id-1', externalId: '1', status: 'active', ...overrides }
}

describe('computeSyncPlan', () => {
  it('lists a feed entry with no matching DB row as a create', () => {
    const plan = computeSyncPlan([], [feedAnimal()])
    expect(plan.creates).toEqual([feedAnimal()])
    expect(plan.updates).toEqual([])
    expect(plan.removals).toEqual([])
  })

  it('lists a feed entry matching an active DB row as an update, without reactivation', () => {
    const plan = computeSyncPlan([existingAnimal({ status: 'active' })], [feedAnimal()])
    expect(plan.creates).toEqual([])
    expect(plan.updates).toEqual([
      { id: 'db-id-1', externalId: '1', feed: feedAnimal(), reactivate: false },
    ])
    expect(plan.removals).toEqual([])
  })

  it('reactivates a previously removed animal that reappears in the feed', () => {
    const plan = computeSyncPlan([existingAnimal({ status: 'removed' })], [feedAnimal()])
    expect(plan.updates).toEqual([
      { id: 'db-id-1', externalId: '1', feed: feedAnimal(), reactivate: true },
    ])
  })

  it('does not reactivate an adopted animal that reappears in the feed', () => {
    const plan = computeSyncPlan([existingAnimal({ status: 'adopted' })], [feedAnimal()])
    expect(plan.updates).toEqual([
      { id: 'db-id-1', externalId: '1', feed: feedAnimal(), reactivate: false },
    ])
  })

  it('marks an active DB row missing from the feed as a removal', () => {
    const plan = computeSyncPlan([existingAnimal({ status: 'active' })], [])
    expect(plan.creates).toEqual([])
    expect(plan.updates).toEqual([])
    expect(plan.removals).toEqual([{ id: 'db-id-1', externalId: '1' }])
  })

  it('leaves an already-removed DB row missing from the feed untouched', () => {
    const plan = computeSyncPlan([existingAnimal({ status: 'removed' })], [])
    expect(plan.removals).toEqual([])
  })

  it('leaves an adopted DB row missing from the feed untouched (no auto-removal)', () => {
    const plan = computeSyncPlan([existingAnimal({ status: 'adopted' })], [])
    expect(plan.removals).toEqual([])
  })

  it('never references overrides/manually_edited/is_hidden fields', () => {
    // Diese Felder existieren im Plan-Ergebnis gar nicht - Schutz vor
    // versehentlichem Überschreiben von Admin-Anpassungen ist strukturell
    // garantiert, nicht nur durch Konvention.
    const plan = computeSyncPlan([existingAnimal()], [feedAnimal()])
    const update = plan.updates[0]
    expect(update).not.toHaveProperty('overrides')
    expect(update).not.toHaveProperty('manuallyEdited')
    expect(update).not.toHaveProperty('isHidden')
  })
})
