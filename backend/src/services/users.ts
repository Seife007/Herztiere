import { pool } from '../db/pool.js'

export interface PublicUser {
  id: string
  email: string
  role: 'user' | 'admin'
  isBlocked: boolean
  preferences: Record<string, unknown>
  createdAt: string
}

const PUBLIC_COLUMNS = 'id, email, role, is_blocked AS "isBlocked", preferences, created_at AS "createdAt"'

export async function findUserById(id: string): Promise<PublicUser | null> {
  const { rows } = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findUserByEmailWithPassword(
  email: string,
): Promise<{ id: string; email: string; passwordHash: string; role: 'user' | 'admin'; isBlocked: boolean } | null> {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash AS "passwordHash", role, is_blocked AS "isBlocked" FROM users WHERE email = $1',
    [email],
  )
  return rows[0] ?? null
}

export interface AdminUserListItem extends PublicUser {
  likeCount: number
}

export interface AdminUserFilters {
  search?: string
  role?: 'user' | 'admin'
  status?: 'active' | 'blocked'
  page: number
  pageSize: number
}

export async function findUsersAdmin(
  filters: AdminUserFilters,
): Promise<{ users: AdminUserListItem[]; total: number }> {
  const conditions: string[] = []
  const params: unknown[] = []

  if (filters.search) {
    params.push(`%${filters.search}%`)
    conditions.push(`email ILIKE $${params.length}`)
  }
  if (filters.role) {
    params.push(filters.role)
    conditions.push(`role = $${params.length}`)
  }
  if (filters.status) {
    params.push(filters.status === 'blocked')
    conditions.push(`is_blocked = $${params.length}`)
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await pool.query<{ count: string }>(`SELECT count(*) FROM users ${where}`, params)

  params.push(filters.pageSize, (filters.page - 1) * filters.pageSize)
  const { rows } = await pool.query<AdminUserListItem>(
    `SELECT ${PUBLIC_COLUMNS},
       (SELECT count(*) FROM likes WHERE likes.user_id = users.id)::int AS "likeCount"
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )

  return { users: rows, total: Number(countResult.rows[0].count) }
}

export async function findUserAdminById(id: string): Promise<AdminUserListItem | null> {
  const { rows } = await pool.query<AdminUserListItem>(
    `SELECT ${PUBLIC_COLUMNS},
       (SELECT count(*) FROM likes WHERE likes.user_id = users.id)::int AS "likeCount"
     FROM users WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

// Reine Entscheidungsfunktion (kein DB-Zugriff), damit die Schutzregel ohne
// Postgres unit-testbar ist. Verhindert, dass der letzte verbleibende Admin
// per Rollenänderung degradiert wird (siehe Issue #5).
export function blocksLastAdminDemotion(
  currentRole: 'user' | 'admin',
  newRole: 'user' | 'admin',
  adminCount: number,
): boolean {
  return currentRole === 'admin' && newRole !== 'admin' && adminCount <= 1
}

export async function countAdmins(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT count(*) FROM users WHERE role = 'admin'",
  )
  return Number(rows[0].count)
}

export async function updateUserRole(id: string, role: 'user' | 'admin'): Promise<void> {
  await pool.query('UPDATE users SET role = $1, updated_at = now() WHERE id = $2', [role, id])
}

export async function updateUserBlocked(id: string, isBlocked: boolean): Promise<void> {
  await pool.query('UPDATE users SET is_blocked = $1, updated_at = now() WHERE id = $2', [isBlocked, id])
}

export async function deleteUserAdmin(id: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [id])
}
