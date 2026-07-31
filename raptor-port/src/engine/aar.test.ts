/* Ported from reference/tfin.js — group V, DAAR / NAAR from the remarks (B32). */
import { describe, expect, it } from 'vitest'
import { aarNeed, aarOK, PEOPLE } from './people'

describe('DAAR / NAAR from the remarks (tfin V)', () => {
  const N = (r: string, n?: any) => aarNeed(r, !!n)

  it('a bare AAR is day by default and night by the clock', () => {
    expect(N('1A: AAR')).toBe('DAAR'); expect(N('1A: AAR', 1)).toBe('NAAR')
  })

  it('an untagged remark belongs to the front seat', () => {
    expect(N('AAR')).toBe('DAAR'); expect(N('A: AAR')).toBe('DAAR')
  })

  it('DAAR and NAAR are taken literally', () => {
    expect(N('1A: DAAR', 1)).toBe('DAAR'); expect(N('2A: NAAR')).toBe('NAAR')
  })

  it('NO AAR / NO DAAR / NO NAAR ask for nothing', () => {
    expect(N('1A: NO AAR')).toBe(null); expect(N('A: NO DAAR')).toBe(null)
    expect(N('NO NAAR', 1)).toBe(null); expect(N('1A: NO AAR', 1)).toBe(null)
  })

  it('a rear-seat tag is ignored outright', () => {
    expect(N('1B: AAR')).toBe(null); expect(N('B: NAAR', 1)).toBe(null)
    expect(N('1B: AAR // 2A: BFM')).toBe(null)
  })

  it('a front-seat tag later in the line still counts', () => {
    expect(N('1A: AAR // 1B: SEFE')).toBe('DAAR')
  })

  it('a negation does not swallow a real requirement after it', () => {
    expect(N('1A: NO DAAR / NAAR')).toBe('NAAR')
  })

  it('remarks with no AAR in them ask for nothing', () => {
    expect(N('1A: BFM-6')).toBe(null); expect(N('2A: SAT-REF')).toBe(null)
    expect(N('PRI LSR')).toBe(null); expect(N('')).toBe(null)
  })

  it('the digit is ignored — only the letter is read', () => {
    expect(N('9A: AAR')).toBe('DAAR'); expect(N('9B: AAR')).toBe(null)
  })

  it('the invariant holds across the whole roster (NAAR never without DAAR)', () => {
    const bad = Object.keys(PEOPLE).filter(id => !aarOK(id, 'DAAR') && aarOK(id, 'NAAR'))
    expect(bad, bad.join(',')).toEqual([])
  })

  it('no WSO holds AAR currency', () => {
    const bad = Object.keys(PEOPLE)
      .filter(id => !PEOPLE[id].special && PEOPLE[id].seat === 'RCP')
      .filter(id => PEOPLE[id].quals.daar || PEOPLE[id].quals.naar)
    expect(bad, bad.join(',')).toEqual([])
  })
})
