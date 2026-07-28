import { pool } from '../db/pool.js'

export async function logAudit(
  actorUserId: string | null,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  await pool.query(
    'INSERT INTO audit_log (actor_user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [actorUserId, action, targetType, targetId, JSON.stringify(details)],
  )
}
