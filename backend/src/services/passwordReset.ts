import { randomBytes, createHash } from 'node:crypto'
import { pool } from '../db/pool.js'

const TOKEN_TTL_MINUTES = process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES
  ? Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES)
  : 60

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000)
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(token), expiresAt],
  )
  return token
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [hashToken(token)],
  )
  const row = rows[0]
  if (!row) return null

  await pool.query('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1', [row.id])
  return row.user_id as string
}

/**
 * Es ist noch kein E-Mail-Versand (SMTP) konfiguriert (siehe memory.md).
 * Bis dahin wird der Reset-Link geloggt, damit der Flow lokal testbar ist.
 */
export function sendPasswordResetEmail(email: string, token: string): void {
  const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`
  console.log(`[password-reset] Reset-Link für ${email}: ${resetUrl}`)
}
