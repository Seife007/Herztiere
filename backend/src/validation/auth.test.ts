import { describe, expect, it } from 'vitest'
import { registerSchema, loginSchema } from './auth.js'

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    const result = registerSchema.safeParse({ email: 'Test@Example.com', password: '1234567890' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
      expect(result.data.preferences).toEqual({ speciesInterest: [] })
    }
  })

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({ email: 'test@example.com', password: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ email: 'not-an-email', password: '1234567890' })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})
