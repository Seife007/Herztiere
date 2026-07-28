import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password.js'

describe('password hashing', () => {
  it('hashes and verifies correctly', async () => {
    const hash = await hashPassword('super-secret-123')
    expect(hash).not.toBe('super-secret-123')
    await expect(verifyPassword('super-secret-123', hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })
})
