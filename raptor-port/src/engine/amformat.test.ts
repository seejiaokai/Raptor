/* Phase 2 — the shared legacy-format classifier (P2-05 / P2-R3-02).
   A book PERSISTED by a PRE-Phase-2 build has the old shape and no amV stamp.
   The classifier flags it 'unsupported' so its week is read-only, while the new
   verId resolvers already suppress publication for it and it round-trips
   byte-for-byte (persistAll re-serializes SCHED verbatim). Full migration = Phase 5. */
import { beforeEach, describe, expect, it } from 'vitest'
import { SCHED, AMBOOK_VERSION, amFormatOf, protectedWeek, resetSched, dayApproved, dayHasChanges, daySnapOf, dayCurVer } from './publish'
import { schedFields } from '../state/history'

beforeEach(() => { resetSched() })

describe('amFormatOf — the classifier', () => {
  it('a fresh book is stamped and current, and not protected', () => {
    expect(SCHED.amV).toBe(AMBOOK_VERSION)
    expect(amFormatOf(SCHED)).toBe('current')
    expect(protectedWeek()).toBe(false)
  })

  it('an un-stamped book that carries publication content is unsupported', () => {
    expect(amFormatOf({ als: [{ n: 1, keys: ['dn:0.0'] }], orig: {}, cur: {} })).toBe('unsupported')   // pre-Phase-2 als
    expect(amFormatOf({ als: [], orig: { 0: { d: {}, c: {} } }, cur: {} })).toBe('unsupported')          // pre-Phase-2 orig
    expect(amFormatOf({ als: [], orig: {}, cur: { 0: 'orig' } })).toBe('unsupported')                    // pre-Phase-2 cur
  })

  it('an un-stamped EMPTY book is current — a fresh book has nothing to misread', () => {
    expect(amFormatOf({ als: [], orig: {}, cur: {} })).toBe('current')
    expect(amFormatOf(null)).toBe('current')
  })

  it('a book stamped with a DIFFERENT (future) version that carries content is unsupported', () => {
    expect(amFormatOf({ amV: 999, als: [{ n: 1 }], orig: {}, cur: {} })).toBe('unsupported')
  })
})

describe('an unsupported week is read-only and cannot publish (P2-R3-02 / P2-05)', () => {
  /* install a PRE-Phase-2 book directly onto the live SCHED (old shape, no amV) */
  const installOldBook = () => {
    SCHED.amV = undefined
    SCHED.dayOK = { 0: 1 }
    SCHED.orig = { 0: { d: { notes: ['issued'] }, c: {} } }   // OLD orig: no `id`
    SCHED.cur = { 0: 'orig' }                                 // OLD pointer: the string 'orig'
    SCHED.als = [{ n: 1, keys: ['dn:0.0'] }]                  // OLD record: n/keys
  }

  it('the live book reads as unsupported → protectedWeek() is true (read-only)', () => {
    installOldBook()
    expect(amFormatOf(SCHED)).toBe('unsupported')
    expect(protectedWeek()).toBe(true)
  })

  it('publication is naturally suppressed — the old cur/orig cannot be resolved by the verId reader', () => {
    installOldBook()
    expect(dayApproved(0)).toBe(true)
    expect(dayCurVer(0), 'a bare "orig"/no-id book resolves to no current version').toBeNull()
    expect(daySnapOf(0, 'orig'), 'a bare "orig" is not a verId → null').toBeNull()
    expect(dayHasChanges(0), 'no resolvable issued snapshot → nothing publishable').toBe(false)
  })
})

describe('an unsupported book round-trips without being upgraded', () => {
  it('schedFields preserves the old shape and never adds amV', () => {
    SCHED.amV = undefined
    SCHED.als = [{ n: 2, keys: ['dn:0.0'] }]
    SCHED.cur = { 0: 'orig' }
    SCHED.orig = { 0: { d: { notes: ['x'] }, c: {} } }
    const round = JSON.parse(JSON.stringify(schedFields()))
    expect(round.am, 'no amV added → it stays unsupported on the next load').toBeUndefined()
    expect(round.a, 'the old-shape AL record is preserved verbatim').toEqual([{ n: 2, keys: ['dn:0.0'] }])
    expect(round.cv, 'the old current pointer is preserved verbatim').toEqual({ 0: 'orig' })
    expect(amFormatOf({ ...SCHED, amV: round.am }), 'and it still classifies as unsupported after the round-trip').toBe('unsupported')
  })
})
