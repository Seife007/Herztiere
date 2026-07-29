import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'
import { updatePreferencesSchema } from '../validation/auth.js'
import { logAudit } from '../services/audit.js'
import { findUserById } from '../services/users.js'
import { findLikedAnimals, findLikesForExport } from '../services/animals.js'
import { AUTH_COOKIE_NAME } from '../services/jwt.js'

export const usersRouter = Router()

usersRouter.use(requireAuth)

usersRouter.get('/me', (req, res) => {
  res.json({ user: req.user })
})

usersRouter.patch('/me', async (req, res) => {
  const parsed = updatePreferencesSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }

  await pool.query('UPDATE users SET preferences = $1, updated_at = now() WHERE id = $2', [
    JSON.stringify(parsed.data.preferences),
    req.user!.id,
  ])

  res.json({ user: await findUserById(req.user!.id) })
})

usersRouter.get('/me/likes', async (req, res) => {
  res.json({ animals: await findLikedAnimals(req.user!.id) })
})

// DSGVO-Datenexport (Art. 15 Auskunftsrecht, Art. 20 Datenübertragbarkeit,
// siehe Issue #7): alle personenbezogenen Daten des angemeldeten Users als
// maschinenlesbares JSON, keine Anmeldedaten (Passwort-Hash) enthalten.
usersRouter.get('/me/export', async (req, res) => {
  const user = req.user!
  res.json({
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      preferences: user.preferences,
    },
    likes: await findLikesForExport(user.id),
  })
})

// Self-Service-Löschung (DSGVO-Löschungsrecht, siehe Issue #7). Harter Delete,
// likes werden per ON DELETE CASCADE mitgelöscht.
usersRouter.delete('/me', async (req, res) => {
  const userId = req.user!.id
  await logAudit(userId, 'user.self_delete', 'user', userId)
  await pool.query('DELETE FROM users WHERE id = $1', [userId])
  res.clearCookie(AUTH_COOKIE_NAME)
  res.status(204).end()
})
