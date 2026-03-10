import { describe, expect, it } from 'vitest'
import { booleanSearchParam, csvSearchParam } from './searchParams'

describe('booleanSearchParam', () => {
  it('parses "true" string to true', () => {
    expect(booleanSearchParam.parse('true')).toBe(true)
  })

  it('parses "false" string to false', () => {
    expect(booleanSearchParam.parse('false')).toBe(false)
  })

  it('passes through boolean values', () => {
    expect(booleanSearchParam.parse(true)).toBe(true)
    expect(booleanSearchParam.parse(false)).toBe(false)
  })
})

describe('csvSearchParam', () => {
  it('splits string by comma and trims', () => {
    expect(csvSearchParam.parse('a, b , c')).toEqual(['a', 'b', 'c'])
  })

  it('filters empty parts', () => {
    expect(csvSearchParam.parse('a,,b,  ,c')).toEqual(['a', 'b', 'c'])
  })

  it('passes through array values', () => {
    expect(csvSearchParam.parse(['x', 'y'])).toEqual(['x', 'y'])
  })
})
