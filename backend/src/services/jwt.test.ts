import { beforeAll, describe, expect, it } from 'vitest'
import { signAuthToken, verifyAuthToken } from './jwt.js'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret'
})

describe('jwt', () => {
  it('round-trips a user id', () => {
    const token = signAuthToken('user-123')
    const payload = verifyAuthToken(token)
    expect(payload.sub).toBe('user-123')
  })

  it('rejects a tampered token', () => {
    const token = signAuthToken('user-123')
    expect(() => verifyAuthToken(token + 'x')).toThrow()
  })
})
