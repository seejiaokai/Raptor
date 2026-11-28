// THE BELOW-ZERO QUESTION'S ONE TEST OF WHEN IT ASKS (belowzero.ts goesBelow — D418, Astra's final read F4, and D2746).
import { describe, expect, it } from 'vitest'
import { goesBelow } from './belowzero'

describe('goesBelow — when the leave sheets ask before a balance goes below zero', () => {
  it('asks when the fill ends below zero and lower than it started', () => {
    expect(goesBelow({ counter: 'annual', before: 0, after: -1 })).toBe(true)
  })
  it('never asks of a fill that spends nothing, even of a man already in the red (F4)', () => {
    expect(goesBelow({ counter: 'annual', before: -2, after: -2 })).toBe(false)
  })
  it('never asks of a balance not yet typed: the question waits for a figure (D2746, question 11 A)', () => {
    expect(goesBelow({ counter: 'annual', before: 0, after: -1, notTyped: true })).toBe(false)
    expect(goesBelow({ counter: 'ccl', before: 0, after: -2, notTyped: true })).toBe(false)
  })
})
