import type { PoolClient } from 'pg'
import { pool } from '../db/pool.js'
import { fetchFundtiereFeed, type FeedAnimal } from './fundtiereFeed.js'
import { computeSyncPlan, type ExistingAnimal } from './syncPlan.js'
import { cleanupOrphanImages, downloadAnimalImages } from './imageCache.js'

export interface SyncRun {
  id: string
  startedAt: string
  finishedAt: string | null
  status: 'running' | 'success' | 'error'
  createdCount: number
  updatedCount: number
  removedCount: number
  errorMessage: string | null
  triggeredBy: string
}

export async function findSyncRuns(limit: number): Promise<SyncRun[]> {
  const { rows } = await pool.query<SyncRun>(
    `SELECT id, started_at AS "startedAt", finished_at AS "finishedAt", status,
       created_count AS "createdCount", updated_count AS "updatedCount",
       removed_count AS "removedCount", error_message AS "errorMessage", triggered_by AS "triggeredBy"
     FROM sync_runs ORDER BY started_at DESC LIMIT $1`,
    [limit],
  )
  return rows
}

export interface SyncSummary {
  syncRunId: string
  status: 'success' | 'error'
  createdCount: number
  updatedCount: number
  removedCount: number
  errorMessage?: string
}

async function startSyncRun(triggeredBy: 'schedule' | 'admin'): Promise<string> {
  const result = await pool.query<{ id: string }>(
    'INSERT INTO sync_runs (triggered_by) VALUES ($1) RETURNING id',
    [triggeredBy],
  )
  return result.rows[0].id
}

async function finishSyncRun(
  syncRunId: string,
  fields: {
    status: 'success' | 'error'
    createdCount?: number
    updatedCount?: number
    removedCount?: number
    errorMessage?: string
  },
): Promise<void> {
  await pool.query(
    `UPDATE sync_runs
     SET finished_at = now(), status = $1, created_count = $2, updated_count = $3,
         removed_count = $4, error_message = $5
     WHERE id = $6`,
    [
      fields.status,
      fields.createdCount ?? 0,
      fields.updatedCount ?? 0,
      fields.removedCount ?? 0,
      fields.errorMessage ?? null,
      syncRunId,
    ],
  )
}

async function insertAnimal(
  client: PoolClient,
  feed: FeedAnimal,
  imageUrl: string | null,
  cachedImagePath: string | null,
): Promise<void> {
  await client.query(
    `INSERT INTO animals (
       external_id, title, category, gender, color, birth_year, is_mixed,
       location, found_date, contact_name, contact_phone, contact_email,
       image_url, cached_image_path, status, source_url, last_synced_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', $15, now())`,
    [
      feed.externalId,
      feed.title,
      feed.category,
      feed.gender,
      feed.color,
      feed.birthYear,
      feed.isMixed,
      feed.location,
      feed.foundDate,
      feed.contactName,
      feed.contactPhone,
      feed.contactEmail,
      imageUrl,
      cachedImagePath,
      process.env.FUNDTIERE_FEED_URL,
    ],
  )
}

async function updateAnimal(
  client: PoolClient,
  id: string,
  feed: FeedAnimal,
  imageUrl: string | null,
  cachedImagePath: string | null,
  reactivate: boolean,
): Promise<void> {
  await client.query(
    `UPDATE animals SET
       title = $1, category = $2, gender = $3, color = $4, birth_year = $5,
       is_mixed = $6, location = $7, found_date = $8, contact_name = $9,
       contact_phone = $10, contact_email = $11, image_url = $12,
       cached_image_path = COALESCE($13, cached_image_path),
       status = CASE WHEN $14 THEN 'active' ELSE status END,
       last_synced_at = now(), updated_at = now()
     WHERE id = $15`,
    [
      feed.title,
      feed.category,
      feed.gender,
      feed.color,
      feed.birthYear,
      feed.isMixed,
      feed.location,
      feed.foundDate,
      feed.contactName,
      feed.contactPhone,
      feed.contactEmail,
      imageUrl,
      cachedImagePath,
      reactivate,
      id,
    ],
  )
}

function resolveSourceImageUrl(sourceImagePath: string | null): string | null {
  const baseUrl = process.env.FUNDTIERE_IMAGE_BASE_URL
  if (!sourceImagePath || !baseUrl) return null
  return new URL(sourceImagePath, baseUrl).toString()
}

// Orchestriert einen vollständigen Sync-Lauf: Feed abrufen, mit dem DB-Stand
// abgleichen, Bilder cachen, Änderungen schreiben, Lauf protokollieren.
// Bei nicht erreichbarer Quelle bleibt die App mit dem zuletzt bekannten
// Datenstand funktionsfähig - der Fehler wird nur protokolliert.
export async function runSync(triggeredBy: 'schedule' | 'admin'): Promise<SyncSummary> {
  const syncRunId = await startSyncRun(triggeredBy)

  let feed: FeedAnimal[]
  try {
    feed = await fetchFundtiereFeed()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Feed-Abruf'
    await finishSyncRun(syncRunId, { status: 'error', errorMessage })
    return { syncRunId, status: 'error', createdCount: 0, updatedCount: 0, removedCount: 0, errorMessage }
  }

  try {
    const existingResult = await pool.query<ExistingAnimal>(
      'SELECT id, external_id AS "externalId", status FROM animals',
    )
    const plan = computeSyncPlan(existingResult.rows, feed)

    const imagesToFetch = [...plan.creates, ...plan.updates.map((u) => u.feed)].map((feed) => ({
      externalId: feed.externalId,
      sourceImagePath: feed.sourceImagePath,
    }))
    const cachedImagePaths = await downloadAnimalImages(imagesToFetch)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      for (const feedAnimal of plan.creates) {
        await insertAnimal(
          client,
          feedAnimal,
          resolveSourceImageUrl(feedAnimal.sourceImagePath),
          cachedImagePaths.get(feedAnimal.externalId) ?? null,
        )
      }

      for (const update of plan.updates) {
        await updateAnimal(
          client,
          update.id,
          update.feed,
          resolveSourceImageUrl(update.feed.sourceImagePath),
          cachedImagePaths.get(update.feed.externalId) ?? null,
          update.reactivate,
        )
      }

      if (plan.removals.length > 0) {
        await client.query(
          "UPDATE animals SET status = 'removed', updated_at = now() WHERE id = ANY($1::uuid[])",
          [plan.removals.map((removal) => removal.id)],
        )
      }

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

    const allExternalIds = await pool.query<{ external_id: string }>('SELECT external_id FROM animals')
    await cleanupOrphanImages(new Set(allExternalIds.rows.map((row) => row.external_id)))

    const summary: SyncSummary = {
      syncRunId,
      status: 'success',
      createdCount: plan.creates.length,
      updatedCount: plan.updates.length,
      removedCount: plan.removals.length,
    }
    await finishSyncRun(syncRunId, summary)
    return summary
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Sync'
    await finishSyncRun(syncRunId, { status: 'error', errorMessage })
    return { syncRunId, status: 'error', createdCount: 0, updatedCount: 0, removedCount: 0, errorMessage }
  }
}
