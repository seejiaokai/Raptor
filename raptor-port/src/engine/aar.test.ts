/* Ported from reference/tfin.js — group V, DAAR / NAAR from the remarks (B32). */
import { describe, expect, it } from 'vitest'
import { aarNeed, aarOK, PEOPLE } from './people'

describe('DAAR / NAAR from the remarks (tfin V)', () => {
  const N = (r: string, n?: any) => aarNeed(r, !!n)

  /* the night ARGUMENT is the wave's flag since 21 Aug 26 (the callers no
     longer derive it from a landing time) — aarNeed itself is unchanged */
  it('a bare AAR is day by default and night when the caller says night', () => {
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

/* Does an ordinary remark with AAR tacked on the end still register? (owner,
   10 Aug 26 — "can u check if putting like a text then comma then AAR will
   create some sort of bug?"). The seat SEGMENTER is the thing that could bite:
   it splits on an optional digit + A or B + a colon, and that pattern can turn
   up inside an ordinary word. */
describe('AAR written after some other text', () => {
  const N = (r: string, n?: any) => aarNeed(r, !!n)

  it('a plain comma-separated mention reads normally', () => {
    expect(N('PRI LSR, AAR')).toBe('DAAR')
    expect(N('2A: BFM-5, AAR')).toBe('DAAR')
    expect(N('NIGHT BFM, AAR', 1)).toBe('NAAR')
    expect(N('RED AIR // AAR')).toBe('DAAR')
    expect(N('BFM-6, NO AAR')).toBe(null)
  })

  it('a word ending in A before a colon is harmless — it still reads as front seat', () => {
    /* "AREA:" ends in A, so the segmenter treats it as a front-seat tag. Front
       is what an untagged remark defaults to anyway, so nothing changes. */
    expect(N('AREA: D4445, AAR')).toBe('DAAR')
  })

  it('BUT a word ending in B before a colon swallows the rest of the line', () => {
    /* "SUB:" reads as a REAR-seat tag, and a rear segment is dropped whole
       because a WSO holds no AAR currency. So anything after it is invisible.
       This is inherent to the segmenter, which is byte-identical to the
       reference and frozen by tfin group V — it is recorded here rather than
       fixed. Write the AAR before such a word, or tag it `1A:`. */
    expect(N('SUB: AAR')).toBe(null)
    expect(N('AAR, SUB: SOMETHING'), 'before the word it is fine').toBe('DAAR')
    expect(N('1A: AAR // SUB: X'), 'and an explicit front tag survives it').toBe('DAAR')
  })
})
