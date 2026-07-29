import { describe, expect, it } from 'vitest'
import {
  adminAnimalListQuerySchema,
  adminUserListQuerySchema,
  updateAnimalOverridesSchema,
  updateUserBlockedSchema,
  updateUserRoleSchema,
} from './admin.js'

describe('adminUserListQuerySchema', () => {
  it('defaults page and pageSize when missing (e.g. plain GET /api/admin/users)', () => {
    const result = adminUserListQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
    }
  })

  it('coerces query-string page/pageSize to numbers', () => {
    const result = adminUserListQuerySchema.safeParse({ page: '3', pageSize: '50' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.pageSize).toBe(50)
    }
  })

  it('rejects a pageSize above the max of 100', () => {
    const result = adminUserListQuerySchema.safeParse({ pageSize: '500' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid role filter', () => {
    const result = adminUserListQuerySchema.safeParse({ role: 'superadmin' })
    expect(result.success).toBe(false)
  })
})

describe('updateUserRoleSchema', () => {
  it('accepts "admin" and "user"', () => {
    expect(updateUserRoleSchema.safeParse({ role: 'admin' }).success).toBe(true)
    expect(updateUserRoleSchema.safeParse({ role: 'user' }).success).toBe(true)
  })

  it('rejects an unknown role', () => {
    expect(updateUserRoleSchema.safeParse({ role: 'owner' }).success).toBe(false)
  })
})

describe('updateUserBlockedSchema', () => {
  it('rejects a non-boolean isBlocked', () => {
    expect(updateUserBlockedSchema.safeParse({ isBlocked: 'true' }).success).toBe(false)
  })
})

describe('adminAnimalListQuerySchema', () => {
  it('rejects an invalid status filter', () => {
    expect(adminAnimalListQuerySchema.safeParse({ status: 'gone' }).success).toBe(false)
  })

  it('accepts a valid syncedBefore ISO datetime', () => {
    const result = adminAnimalListQuerySchema.safeParse({ syncedBefore: '2026-01-01T00:00:00Z' })
    expect(result.success).toBe(true)
  })

  it('rejects a non-ISO syncedBefore value', () => {
    const result = adminAnimalListQuerySchema.safeParse({ syncedBefore: '01.01.2026' })
    expect(result.success).toBe(false)
  })
})

describe('updateAnimalOverridesSchema', () => {
  it('accepts an empty overrides object (clears all overrides)', () => {
    const result = updateAnimalOverridesSchema.safeParse({ overrides: {}, isHidden: false })
    expect(result.success).toBe(true)
  })

  it('accepts arbitrary override keys/values', () => {
    const result = updateAnimalOverridesSchema.safeParse({
      overrides: { status: 'adopted', birthYear: 2020 },
      isHidden: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing isHidden flag', () => {
    const result = updateAnimalOverridesSchema.safeParse({ overrides: {} })
    expect(result.success).toBe(false)
  })
})
