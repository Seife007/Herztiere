import { Router } from 'express'
import { pool } from '../db/pool.js'
import { hashPassword, verifyPassword } from '../services/password.js'
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, signAuthToken } from '../services/jwt.js'
import { findUserByEmailWithPassword, findUserById } from '../services/users.js'
import {
  createPasswordResetToken,
  consumePasswordResetToken,
  sendPasswordResetEmail,
} from '../services/passwordReset.js'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/auth.js'
import { authRateLimiter } from '../middleware/rateLimit.js'

export const authRouter = Router()

authRouter.post('/register', authRateLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe', details: parsed.error.issues })
  }
  const { email, password, preferences } = parsed.data

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'E-Mail bereits registriert' })
  }

  const passwordHash = await hashPassword(password)
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, preferences)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [email, passwordHash, JSON.stringify(preferences)],
  )
  const userId = rows[0].id as string

  const token = signAuthToken(userId)
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)
  res.status(201).json({ user: await findUserById(userId) })
})

authRouter.post('/login', authRateLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }
  const { email, password } = parsed.data

  const user = await findUserByEmailWithPassword(email)
  const genericError = { error: 'Ungültige Anmeldedaten' }
  if (!user) {
    return res.status(401).json(genericError)
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json(genericError)
  }
  if (user.isBlocked) {
    return res.status(403).json({ error: 'Konto gesperrt' })
  }

  const token = signAuthToken(user.id)
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)
  res.json({ user: await findUserById(user.id) })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { ...AUTH_COOKIE_OPTIONS, maxAge: undefined })
  res.status(204).end()
})

authRouter.post('/forgot-password', authRateLimiter, async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }

  // Immer dieselbe Antwort, unabhängig davon ob die E-Mail existiert
  // (kein Enumeration-Vektor über diesen Endpunkt).
  const genericResponse = { message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine Reset-Mail versendet.' }

  const user = await findUserByEmailWithPassword(parsed.data.email)
  if (user) {
    const token = await createPasswordResetToken(user.id)
    sendPasswordResetEmail(user.email, token)
  }

  res.json(genericResponse)
})

authRouter.post('/reset-password', authRateLimiter, async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }

  const userId = await consumePasswordResetToken(parsed.data.token)
  if (!userId) {
    return res.status(400).json({ error: 'Reset-Link ist ungültig oder abgelaufen' })
  }

  const passwordHash = await hashPassword(parsed.data.password)
  await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [
    passwordHash,
    userId,
  ])

  res.json({ message: 'Passwort wurde geändert' })
})
