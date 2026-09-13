/* VERSION IDENTITY — Phase 1c of the amendment-engine core build (AM-01)
   (docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md §Phase 1c;
   brief §5 AM-01).

   The keystone AM-01 rule: a published version's identity is an IMMUTABLE
   full-date id (incl the YEAR), with the per-day sequence number kept separate
   and used for DISPLAY only, never as a key. This pins:

   (1) NO COLLISION — Monday-AL1 and Tuesday-AL1 are different ids. The plain
       AL number ('orig' | n) that the book uses today is NOT globally unique;
       the immutable id must be.
   (2) YEAR-STABLE — the id carries the year, so the same calendar day/month in
       two different years are distinct, and the id is unaffected by the
       dow/dt/wc/today restamp (those are excluded from canonical, brief §5.0).
   (3) SEQUENCE vs LABEL — the sequence (0 = Original, 1 = AL1 …) and the
       display label ('Original', 'AL1' …) are separate concerns; the id
       round-trips to both.

   Ordinary TS style (this is a new file, not a ported engine body). */
import { describe, it, expect } from 'vitest'
import { keyToIso } from '../ui/weeknav'
import { dayIso, verId, parseVerId, verIso, verSeq, verSeqLabel, verIdLabel } from './verid'

describe('version identity — the full-date id (AM-01)', () => {
  it('a day maps to its full ISO date incl the year, Mon=0 … Sun=6', () => {
    // The seed week's Monday (engine/waves.ts CURWEEK) is 13/07/2026.
    expect(dayIso('13/07/2026', 0)).toBe('2026-07-13') // Monday
    expect(dayIso('13/07/2026', 1)).toBe('2026-07-14') // Tuesday
    expect(dayIso('13/07/2026', 6)).toBe('2026-07-19') // Sunday
  })

  it('dayIso agrees with the existing week-key math for di=0', () => {
    expect(dayIso('13/07/2026', 0)).toBe(keyToIso('13/07/2026'))
    expect(dayIso('06/07/2026', 0)).toBe(keyToIso('06/07/2026'))
  })

  it('a day index rolls across a month and a year boundary', () => {
    expect(dayIso('29/12/2025', 0)).toBe('2025-12-29') // Monday
    expect(dayIso('29/12/2025', 6)).toBe('2026-01-04') // Sunday, next year
  })

  it('Monday-AL1 and Tuesday-AL1 do NOT collide as keys', () => {
    const monAL1 = verId(dayIso('13/07/2026', 0), 1)
    const tueAL1 = verId(dayIso('13/07/2026', 1), 1)
    expect(monAL1).not.toBe(tueAL1)
    // …and neither reuses the bare AL number '1' as its key.
    expect(monAL1).not.toBe('1')
    expect(tueAL1).not.toBe('1')
  })

  it('the same calendar day in two different years is a different id', () => {
    const y2026 = verId(dayIso('13/07/2026', 0), 1)
    const y2027 = verId(dayIso('12/07/2027', 0), 1) // 12/07/2027 is a Monday → 2027-07-12
    expect(dayIso('12/07/2027', 0)).toBe('2027-07-12')
    expect(y2026).not.toBe(y2027)
  })

  it('an id round-trips to its ISO date and its sequence', () => {
    const id = verId('2026-07-13', 2)
    expect(parseVerId(id)).toEqual({ iso: '2026-07-13', seq: 2 })
    expect(verIso(id)).toBe('2026-07-13')
    expect(verSeq(id)).toBe(2)
  })

  it('the same (date, sequence) always mints the same id — it is stable', () => {
    expect(verId('2026-07-13', 0)).toBe(verId('2026-07-13', 0))
    expect(verId('2026-07-13', 3)).toBe(verId('2026-07-13', 3))
  })

  it('sequence and display label are separate: 0 = Original, then AL1, AL2 …', () => {
    expect(verSeqLabel(0)).toBe('Original')
    expect(verSeqLabel(1)).toBe('AL1')
    expect(verSeqLabel(7)).toBe('AL7')
    // the label is derived from the id's sequence, not stored in the id
    expect(verIdLabel(verId('2026-07-13', 0))).toBe('Original')
    expect(verIdLabel(verId('2026-07-13', 4))).toBe('AL4')
  })

  it('sequence 0 is the Original for EVERY day (the label is per-day display)', () => {
    expect(verIdLabel(verId(dayIso('13/07/2026', 0), 0))).toBe('Original')
    expect(verIdLabel(verId(dayIso('13/07/2026', 3), 0))).toBe('Original')
  })
})
