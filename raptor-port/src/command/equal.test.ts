import { describe, it, expect } from 'vitest'
import { sameContent, clone } from './equal'

describe('sameContent', () => {
  it('primitives and structural equality', () => {
    expect(sameContent(1, 1)).toBe(true)
    expect(sameContent('a', 'a')).toBe(true)
    expect(sameContent(null, null)).toBe(true)
    expect(sameContent(1, 2)).toBe(false)
    expect(sameContent(null, {})).toBe(false)
  })
  it('nested objects/arrays, key order independent', () => {
    expect(sameContent({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true)
    expect(sameContent({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(sameContent([1, 2], [1, 2, 3])).toBe(false)
    expect(sameContent({ a: 1 }, [1])).toBe(false)
  })
  it('does NOT treat two different Dates as equal (F4 — non-plain values)', () => {
    expect(sameContent(new Date(0), new Date(86400000))).toBe(false)
    expect(sameContent(new Map(), new Map())).toBe(false)
    expect(sameContent(new Set([1]), new Set([2]))).toBe(false)
  })
})

describe('clone', () => {
  it('deep-copies so the original cannot be mutated through the copy', () => {
    const src = { a: { b: 1 }, list: [1, 2] }
    const c = clone(src)
    c.a.b = 999; c.list.push(3)
    expect(src.a.b).toBe(1)
    expect(src.list).toEqual([1, 2])
  })
  it('passes primitives and null through', () => {
    expect(clone(5)).toBe(5)
    expect(clone(null)).toBe(null)
    expect(clone('x')).toBe('x')
  })
})
