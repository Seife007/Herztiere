import { pool } from '../db/pool.js'

export interface Animal {
  id: string
  title: string
  category: string
  breed: string | null
  gender: string | null
  color: string | null
  birthYear: number | null
  isMixed: boolean
  description: string | null
  location: string | null
  foundDate: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  imageUrl: string | null
  cachedImagePath: string | null
  status: 'active' | 'adopted' | 'removed'
  sourceUrl: string
  isLiked: boolean
}

interface AnimalRow extends Omit<Animal, 'isLiked'> {
  overrides: Record<string, unknown>
}

const ANIMAL_COLUMNS = `
  id, title, category, breed, gender, color, birth_year AS "birthYear",
  is_mixed AS "isMixed", description, location, found_date::text AS "foundDate",
  contact_name AS "contactName", contact_phone AS "contactPhone",
  contact_email AS "contactEmail", image_url AS "imageUrl",
  cached_image_path AS "cachedImagePath", status, source_url AS "sourceUrl", overrides
`

// Manuelle Admin-Anpassungen (Issue #5) liegen in `overrides` und haben beim
// Ausliefern Vorrang vor den vom Sync gespiegelten Basisfeldern (Issue #3).
const OVERRIDABLE_FIELDS: (keyof Animal)[] = [
  'title',
  'category',
  'breed',
  'gender',
  'color',
  'birthYear',
  'isMixed',
  'description',
  'location',
  'foundDate',
  'contactName',
  'contactPhone',
  'contactEmail',
  'status',
]

function resolveAnimal(row: AnimalRow, isLiked: boolean): Animal {
  const { overrides, ...animal } = row
  for (const field of OVERRIDABLE_FIELDS) {
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, field)) {
      ;(animal as Record<string, unknown>)[field] = overrides[field]
    }
  }
  return { ...animal, isLiked }
}

// Tiere für den Swipe-Stapel: aktiv, nicht ausgeblendet, noch nicht von
// diesem Nutzer geliked. Reihenfolge zufällig, damit der Stapel sich bei
// jedem Aufruf unterscheidet.
export async function findAnimalsForSwiping(userId: string, limit: number): Promise<Animal[]> {
  const { rows } = await pool.query<AnimalRow>(
    `SELECT ${ANIMAL_COLUMNS} FROM animals
     WHERE status = 'active' AND is_hidden = false
       AND id NOT IN (SELECT animal_id FROM likes WHERE user_id = $1)
     ORDER BY random()
     LIMIT $2`,
    [userId, limit],
  )
  return rows.map((row) => resolveAnimal(row, false))
}

export async function findAnimalById(id: string, userId: string): Promise<Animal | null> {
  const { rows } = await pool.query<AnimalRow & { isLiked: boolean }>(
    `SELECT ${ANIMAL_COLUMNS},
       EXISTS(SELECT 1 FROM likes WHERE likes.animal_id = animals.id AND likes.user_id = $2) AS "isLiked"
     FROM animals WHERE id = $1`,
    [id, userId],
  )
  const row = rows[0]
  return row ? resolveAnimal(row, row.isLiked) : null
}

export async function findLikedAnimals(userId: string): Promise<Animal[]> {
  const { rows } = await pool.query<AnimalRow>(
    `SELECT ${ANIMAL_COLUMNS} FROM animals
     JOIN likes ON likes.animal_id = animals.id
     WHERE likes.user_id = $1
     ORDER BY likes.created_at DESC`,
    [userId],
  )
  return rows.map((row) => resolveAnimal(row, true))
}

export async function likeAnimal(userId: string, animalId: string): Promise<void> {
  await pool.query(
    'INSERT INTO likes (user_id, animal_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, animalId],
  )
}

export async function unlikeAnimal(userId: string, animalId: string): Promise<void> {
  await pool.query('DELETE FROM likes WHERE user_id = $1 AND animal_id = $2', [userId, animalId])
}

// Admin-Ansicht (Issue #5): zusätzlich Rohfelder, die für die öffentliche API
// irrelevant sind (Overrides selbst, Sync-Metadaten), damit Admins sehen
// können, was vom Sync kommt vs. manuell überschrieben wurde.
export interface AdminAnimal extends Animal {
  externalId: string
  manuallyEdited: boolean
  isHidden: boolean
  lastSyncedAt: string | null
  overrides: Record<string, unknown>
}

const ADMIN_ANIMAL_COLUMNS = `
  ${ANIMAL_COLUMNS}, external_id AS "externalId", manually_edited AS "manuallyEdited",
  is_hidden AS "isHidden", last_synced_at AS "lastSyncedAt"
`

export interface AdminAnimalFilters {
  status?: 'active' | 'adopted' | 'removed'
  category?: string
  search?: string
  syncedBefore?: string
  page: number
  pageSize: number
}

export async function findAnimalsAdmin(
  filters: AdminAnimalFilters,
): Promise<{ animals: AdminAnimal[]; total: number }> {
  const conditions: string[] = []
  const params: unknown[] = []

  if (filters.status) {
    params.push(filters.status)
    conditions.push(`status = $${params.length}`)
  }
  if (filters.category) {
    params.push(filters.category)
    conditions.push(`category = $${params.length}`)
  }
  if (filters.search) {
    params.push(`%${filters.search}%`)
    conditions.push(`title ILIKE $${params.length}`)
  }
  if (filters.syncedBefore) {
    params.push(filters.syncedBefore)
    conditions.push(`(last_synced_at IS NULL OR last_synced_at < $${params.length})`)
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await pool.query<{ count: string }>(`SELECT count(*) FROM animals ${where}`, params)

  params.push(filters.pageSize, (filters.page - 1) * filters.pageSize)
  const { rows } = await pool.query<AdminAnimal & { overrides: Record<string, unknown> }>(
    `SELECT ${ADMIN_ANIMAL_COLUMNS} FROM animals ${where}
     ORDER BY last_synced_at DESC NULLS LAST
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )

  return {
    animals: rows.map((row) => ({ ...resolveAnimal(row, false), overrides: row.overrides } as AdminAnimal)),
    total: Number(countResult.rows[0].count),
  }
}

export async function findAnimalAdminById(id: string): Promise<AdminAnimal | null> {
  const { rows } = await pool.query<AdminAnimal & { overrides: Record<string, unknown> }>(
    `SELECT ${ADMIN_ANIMAL_COLUMNS} FROM animals WHERE id = $1`,
    [id],
  )
  const row = rows[0]
  if (!row) return null
  return { ...resolveAnimal(row, false), overrides: row.overrides } as AdminAnimal
}

export async function updateAnimalOverrides(
  id: string,
  overrides: Record<string, unknown>,
  isHidden: boolean,
): Promise<void> {
  await pool.query(
    `UPDATE animals SET overrides = $1, manually_edited = $2, is_hidden = $3, updated_at = now() WHERE id = $4`,
    [JSON.stringify(overrides), Object.keys(overrides).length > 0, isHidden, id],
  )
}
