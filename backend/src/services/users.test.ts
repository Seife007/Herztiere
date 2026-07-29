import { describe, expect, it } from 'vitest'
import { blocksLastAdminDemotion } from './users.js'

describe('blocksLastAdminDemotion', () => {
  it('blocks demoting the last remaining admin', () => {
    expect(blocksLastAdminDemotion('admin', 'user', 1)).toBe(true)
  })

  it('allows demoting an admin when other admins remain', () => {
    expect(blocksLastAdminDemotion('admin', 'user', 2)).toBe(false)
  })

  it('allows promoting a user to admin regardless of admin count', () => {
    expect(blocksLastAdminDemotion('user', 'admin', 0)).toBe(false)
  })

  it('allows a no-op role change (admin stays admin)', () => {
    expect(blocksLastAdminDemotion('admin', 'admin', 1)).toBe(false)
  })
})
