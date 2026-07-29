import { describe, expect, it } from 'vitest'
import { resolveImageUrl } from './api.js'

describe('resolveImageUrl', () => {
  it('returns null for null input', () => {
    expect(resolveImageUrl(null)).toBeNull()
  })

  it('prefixes a relative backend path with the API base URL', () => {
    expect(resolveImageUrl('/api/images/1.jpg')).toBe('http://localhost:3000/api/images/1.jpg')
  })

  it('leaves an already-absolute URL untouched', () => {
    expect(resolveImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg')
  })
})
