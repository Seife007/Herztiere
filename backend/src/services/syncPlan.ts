import type { FeedAnimal } from './fundtiereFeed.js'

export type AnimalStatus = 'active' | 'adopted' | 'removed'

export interface ExistingAnimal {
  id: string
  externalId: string
  status: AnimalStatus
}

export interface AnimalUpdate {
  id: string
  externalId: string
  feed: FeedAnimal
  // true, wenn das Tier zuvor als "removed" markiert war und wieder im Feed
  // auftaucht (Rückgängigmachen der Entfernung). "adopted" wird dagegen nie
  // automatisch vom Sync überschrieben - das ist eine manuelle Admin-Aktion.
  reactivate: boolean
}

export interface AnimalRemoval {
  id: string
  externalId: string
}

export interface SyncPlan {
  creates: FeedAnimal[]
  updates: AnimalUpdate[]
  removals: AnimalRemoval[]
}

// Reine Funktion ohne DB-/Netzwerkzugriff: leitet aus dem aktuellen DB-Stand
// und dem aktuellen Feed-Stand ab, welche Schreiboperationen nötig sind.
// Rührt bewusst nur die vom Feed gespiegelten Felder an - `overrides`,
// `manually_edited`, `is_hidden` und `breed`/`description` werden hier gar
// nicht erst referenziert, damit Admin-Anpassungen (Issue #5) beim Sync nicht
// stillschweigend überschrieben werden können.
export function computeSyncPlan(existing: ExistingAnimal[], feed: FeedAnimal[]): SyncPlan {
  const existingByExternalId = new Map(existing.map((row) => [row.externalId, row]))
  const feedExternalIds = new Set(feed.map((animal) => animal.externalId))

  const creates: FeedAnimal[] = []
  const updates: AnimalUpdate[] = []

  for (const feedAnimal of feed) {
    const existingRow = existingByExternalId.get(feedAnimal.externalId)
    if (!existingRow) {
      creates.push(feedAnimal)
      continue
    }
    updates.push({
      id: existingRow.id,
      externalId: existingRow.externalId,
      feed: feedAnimal,
      reactivate: existingRow.status === 'removed',
    })
  }

  const removals: AnimalRemoval[] = existing
    .filter((row) => row.status === 'active' && !feedExternalIds.has(row.externalId))
    .map((row) => ({ id: row.id, externalId: row.externalId }))

  return { creates, updates, removals }
}
