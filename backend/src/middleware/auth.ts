import type { NextFunction, Request, Response } from 'express'
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../services/jwt.js'
import { findUserById, type PublicUser } from '../services/users.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: PublicUser
    }
  }
}

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME]
  if (cookieToken) return cookieToken

  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length)

  return null
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Nicht angemeldet' })
  }

  let payload
  try {
    payload = verifyAuthToken(token)
  } catch {
    return res.status(401).json({ error: 'Ungültige oder abgelaufene Sitzung' })
  }

  const user = await findUserById(payload.sub)
  if (!user) {
    return res.status(401).json({ error: 'Nicht angemeldet' })
  }
  if (user.isBlocked) {
    return res.status(403).json({ error: 'Konto gesperrt' })
  }

  req.user = user
  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Nur für Admins' })
  }
  next()
}
