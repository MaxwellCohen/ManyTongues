import { describe, expect, it } from 'vitest'
import { normalizeIpCandidate } from './rateLimit'

describe('normalizeIpCandidate', () => {
  it('returns first value when comma-separated', () => {
    expect(normalizeIpCandidate('192.168.1.1, 10.0.0.1')).toBe('192.168.1.1')
  })

  it('trims whitespace', () => {
    expect(normalizeIpCandidate('  192.168.1.1  ')).toBe('192.168.1.1')
  })

  it('strips ::ffff: prefix for IPv4-mapped', () => {
    expect(normalizeIpCandidate('::ffff:192.168.1.1')).toBe('192.168.1.1')
  })

  it('returns null for empty string', () => {
    expect(normalizeIpCandidate('')).toBe(null)
  })

  it('returns null for empty after trim', () => {
    expect(normalizeIpCandidate('   ')).toBe(null)
  })

  it('returns null for null input', () => {
    expect(normalizeIpCandidate(null)).toBe(null)
  })

  it('returns value as-is when no prefix', () => {
    expect(normalizeIpCandidate('192.168.1.1')).toBe('192.168.1.1')
  })

  it('returns null when first part is empty', () => {
    expect(normalizeIpCandidate(', 192.168.1.1')).toBe(null)
  })
})
