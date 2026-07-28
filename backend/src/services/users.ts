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
