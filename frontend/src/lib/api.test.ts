import { describe, expect, it } from 'vitest'
import { resolveImageUrl } from './api.js'

describe('resolveImageUrl', () => {
  it('returns null for null input', () => {
    expect(resolveImageUrl(null)).toBeNull()
  })

  it('leaves a relative backend path unchanged (resolved by the browser against the current origin)', () => {
    expect(resolveImageUrl('/api/images/1.jpg')).toBe('/api/images/1.jpg')
  })

  it('leaves an already-absolute URL untouched', () => {
    expect(resolveImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg')
  })
})
