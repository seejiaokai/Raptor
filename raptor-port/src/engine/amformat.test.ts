/* Phase 2 — the shared legacy-format classifier (P2-05 / P2-R3-02).
   A book PERSISTED by a PRE-Phase-2 build has the old shape and no amV stamp.
   The classifier flags it 'unsupported' so its week is read-only, while the new
   verId resolvers already suppress publication for it and it round-trips
   byte-for-byte (persistAll re-serializes SCHED verbatim). Full migration = Phase 5. */
import { beforeEach, describe, expect, it } from 'vitest'
import { SCHED, AMBOOK_VERSION, amFormatOf, protectedWeek, resetSched, dayApproved, dayHasChanges, daySnapOf, dayCurVer, signOf, setDayApproved } from './publish'
import { schedFields } from '../state/history'
import { dayIso, verId } from './verid'

beforeEach(() => { resetSched() })

/* fill the four sign-off roles with appointed schedulers so a day can publish */
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

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

describe('a STAMPED book filed under the WRONG week is quarantined (P2-REREVIEW-04)', () => {
  it('a self-consistent week-A book classified under week B reads as unsupported', () => {
    const isoA0 = dayIso('13/07/2026', 0)
    const bookA: any = {
      amV: AMBOOK_VERSION, dayOK: { 0: 1 },
      orig: { 0: { id: verId(isoA0, 0), d: { notes: ['x'] }, c: {} } },
      cur: { 0: verId(isoA0, 0) }, als: [],
    }
    // classified under its OWN week → current; under a different week → unsupported
    expect(amFormatOf(bookA, '13/07/2026')).toBe('current')
    expect(amFormatOf(bookA, '20/07/2026')).toBe('unsupported')
    // with no week key threaded, the stamped book still reads current (identity-only)
    expect(amFormatOf(bookA)).toBe('current')
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

describe('an EMPTY un-stamped book is stamped on its first publish, not left to go read-only (P2-IMPL-04)', () => {
  it('a validated empty pre-deployment draft stamps amV when it first publishes → stays editable', () => {
    /* a parked PRE-Phase-2 draft: no amV stamp, but NO publication content yet, so
       it classifies as 'current' and is editable. */
    SCHED.amV = undefined
    expect(amFormatOf(SCHED)).toBe('current')
    expect(protectedWeek()).toBe(false)
    /* publishing day 0 (its first approve) gives the book orig/cur content — which,
       without a stamp, would re-classify it as 'unsupported' and lock the week. */
    sign(0)
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    expect(SCHED.amV, 'the publish path stamped the format version').toBe(AMBOOK_VERSION)
    expect(amFormatOf(SCHED)).toBe('current')
    expect(protectedWeek(), 'the week stays editable, not quarantined').toBe(false)
  })

  it('a content-bearing legacy book is NOT stamped by the publish path (quarantine holds)', () => {
    /* an already-unsupported book (old content, no amV): approving another day must
       not silently upgrade it to the current format. */
    SCHED.amV = undefined
    SCHED.orig = { 0: { d: { notes: ['issued'] }, c: {} } }   // pre-existing content → unsupported
    expect(amFormatOf(SCHED)).toBe('unsupported')
    sign(1)
    setDayApproved(1, true)
    expect(SCHED.amV, 'still unstamped → quarantine preserved').toBeUndefined()
    expect(amFormatOf(SCHED)).toBe('unsupported')
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
