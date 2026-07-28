import jwt from 'jsonwebtoken'
import type { CookieOptions } from 'express'

export interface AuthTokenPayload {
  sub: string
}

export const AUTH_COOKIE_NAME = 'herztiere_auth'

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET ist nicht gesetzt')
  }
  return secret
}

const EXPIRES_IN = '7d'

export function signAuthToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies AuthTokenPayload, getSecret(), {
    expiresIn: EXPIRES_IN,
  })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getSecret()) as AuthTokenPayload
}
