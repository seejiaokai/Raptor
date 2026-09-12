/* Ported from reference/tfin.js — the per-day sign-off / publish-day /
   amendment-level flow (B22/B26/B47/B49) and the B53 #14 history stamp.
   Phase 2 (the coupled record rewrite): amendments are SINGLE-DAY and keyed by
   an immutable verId; publish eligibility is the canonical dayDelta (F-02), not
   a live pending count; the take-backs (unpublishAL / restoreDayVersion /
   reissueReopened / publishAL(n) / reopen) are gone, and undo-across-publish is
   Phase 3 — so the record SHAPE is pinned by a plain serialization round-trip,
   never a publish→undo→redo. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { PEOPLE, isScheduler } from './people'
import { SCHED, signOf, signMissing, daySigned, signClear, signNames, signPeople, setDayApproved, dayApproved, publishableKeys, pendDays, dayPendCount, canPublishAL, alUnsignedDays, pendingPublishDays, publishALDay, discardPending, alIssue, alCount, alDays, dayALs, nextSeq, diffCounts, dayDelta, dayHasChanges, markEdit, markStructuralAdd, markDeletion, deletionWasIssued, isDeleteKey, deleteCount, pendCount, alColor, alAttr, daySnapOf, dayVersions, verLabel, dayCurVer } from './publish'
import { dropRowMarks } from './publish'
import { loadVersionToWorkingCopy, reconcileIssuedMarks } from './drafts'
import { noteChange, txtSet, txtGet } from './slots'
import { keyDay, shiftKeys } from './keys'
import { moveNote } from './reorder'
import { ridKey, ensureRowIds } from './rowids'
import { verSeq, verId, dayIso } from './verid'
import { CURWEEK } from './waves'
import { digest } from './canonical'
import { schedFields } from '../state/history'

const rk = (k: string) => ridKey(k, DAYS)

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}

/* DAYS[0]/DAYS[1] are mutated by many tests (txtSet, pushed notes); clone-restore
   them per test so order can never leak — the SCHED reset alone is not enough. */
const D0 = JSON.parse(JSON.stringify(DAYS[0]))
const D1 = JSON.parse(JSON.stringify(DAYS[1]))
beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}
  DAYS[0] = JSON.parse(JSON.stringify(D0))
  DAYS[1] = JSON.parse(JSON.stringify(D1))
})

describe('per-day sign-off (tfin B22/B24)', () => {
  it('the strip has the four roles', () => {
    expect(signMissing(0)).toEqual(['CUR CK', 'SKED CK', 'PLANNED BY', 'APPROVED BY'])
  })

  it('the three scheduling roles offer ONLY appointed schedulers', () => {
    expect(signPeople(true).every(id => isScheduler(id))).toBe(true)
  })

  it('CUR CK stays open to everyone', () => {
    const cur = signPeople(false), sk = signPeople(true)
    expect(cur.length).toBeGreaterThan(sk.length)
    expect(cur.some(id => !isScheduler(id))).toBe(true)
    expect(sk.length > 0 && sk.every(v => cur.includes(v))).toBe(true)
  })

  it('some schedulers are appointed', () => {
    expect(signPeople(true).length).toBeGreaterThan(3)
  })

  it('a name already signed stays offered even if the appointment was withdrawn', () => {
    const keep = PEOPLE.ignite.quals.sched
    PEOPLE.ignite.quals.sched = false
    expect(signPeople(true, 'ignite')).toContain('ignite')
    PEOPLE.ignite.quals.sched = keep
  })

  it('nor through the model — a locked day cannot be published', () => {
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(false)
  })

  it('three of four is still locked', () => {
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'
    expect(daySigned(0)).toBe(false)
    expect(signMissing(0)).toEqual(['APPROVED BY'])
  })

  it('all four unlocks the day, and signing one day leaves the others locked', () => {
    sign(0)
    expect(daySigned(0)).toBe(true)
    expect(daySigned(1)).toBe(false)
  })

  it('a withdrawn appointment invalidates the signature', () => {
    sign(0)
    const keep = PEOPLE.pump.quals.sched
    PEOPLE.pump.quals.sched = false
    expect(daySigned(0)).toBe(false)
    expect(signMissing(0)).toEqual(['APPROVED BY'])
    PEOPLE.pump.quals.sched = keep
  })
})

describe('publishing a day (tfin B26/B47)', () => {
  it('a signed day publishes, spends its signature, and takes only its own pending', () => {
    noteChange('0.0.0.0.p'); noteChange('dn:1.0')
    sign(0)
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    /* the signature is spent on the issue */
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
    /* day 0's pending went out with the day; day 1's is untouched */
    expect(SCHED.pending['0.0.0.0.p']).toBeUndefined()
    expect(SCHED.pending['dn:1.0']).toBe(1)
  })

  it('a published day can NEVER be un-approved (§9 — the beak lost its un-publish job)', () => {
    sign(0); setDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    setDayApproved(0, false)                 // no-op now
    expect(dayApproved(0)).toBe(true)        // still published
  })

  it('first publish stamps the Original (seq 0) and points cur at it', () => {
    sign(0); setDayApproved(0, true)
    const cur = dayCurVer(0)
    expect(cur).toBe((SCHED.orig[0] as any).id)
    expect(verSeq(cur)).toBe(0)
    expect(verLabel(cur)).toBe('Original')
  })

  it('signNames records callsigns for the record', () => {
    sign(0)
    expect(signNames(0)).toEqual({ cur: 'Torch', sked: 'Ranger', plan: 'Saber', appr: 'Piston' })
  })
})

describe('publishing an AL (tfin B49 / B26)', () => {
  it('pending edits only become publishable once their day is published', () => {
    noteChange('dn:0.0'); noteChange('dn:1.0')
    expect(publishableKeys()).toEqual([])
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0')
    expect(publishableKeys()).toEqual(['dn:0.0'])
    expect(pendDays()).toEqual([0, 1])
    expect(dayPendCount(0)).toBe(1)
  })

  it('a real change on a published day makes it publishable, and it needs signing', () => {
    sign(0); setDayApproved(0, true)
    txtSet('dn:0.0', 'AMENDED')                   // a REAL content edit → a canonical delta
    expect(dayHasChanges(0)).toBe(true)
    expect(canPublishAL()).toBe(false)            // the publish spent the signature
    expect(alUnsignedDays()).toEqual([0])
    sign(0)
    expect(canPublishAL()).toBe(true)
    publishALDay(0)
    expect(SCHED.changes[rk('dn:0.0')]).toBe(1)   // marked with its per-day SEQ
    expect(SCHED.pending[rk('dn:0.0')]).toBeUndefined()
    expect(dayALs(0)).toEqual([1])
  })

  it('a bare mark with no content change is NOT publishable (delta trigger, F-02)', () => {
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0')                          // marks pending but changes no content
    expect(dayHasChanges(0)).toBe(false)
    publishALDay(0)                               // refused
    expect(SCHED.als).toEqual([])
  })

  it('a reorder that leaves the effective display order unchanged is NOT publishable (P2-IMPL-07 — dayHasChanges derives only from the canonical delta)', () => {
    /* two timed ground rows whose MODEL order differs from the time-sorted DISPLAY
       order: swapping the model array flips the positional digest, while the
       effective (time-sorted) order — and every rid-joined value — is unchanged. The
       old digest fast-path read that as a change; the delta correctly reads none. */
    DAYS[0].ground = [
      { rid: 'gA', prog: 'ALPHA', str: '10:00', who: '' },
      { rid: 'gB', prog: 'BRAVO', str: '09:00', who: '' },
    ] as any
    delete (DAYS[0] as any).gman
    sign(0); setDayApproved(0, true)
    DAYS[0].ground = [DAYS[0].ground[1], DAYS[0].ground[0]] as any   // swap the model order only
    const issued = daySnapOf(0, dayCurVer(0)!)!.d
    expect(digest(issued, 0), 'the positional digest DID flip (the old fast-path would fire)').not.toBe(digest(DAYS[0], 0))
    expect(dayDelta(0), 'but the normalized delta is empty').toEqual([])
    expect(dayHasChanges(0)).toBe(false)
    publishALDay(0)
    expect(SCHED.als).toEqual([])
  })

  it('a per-day AL takes only that day\'s changes', () => {
    sign(0); setDayApproved(0, true)
    sign(1); setDayApproved(1, true)
    txtSet('dn:0.0', 'A'); txtSet('dn:1.0', 'B')
    sign(0)
    publishALDay(0)
    expect(SCHED.changes[rk('dn:0.0')]).toBe(1)
    expect(SCHED.pending[rk('dn:1.0')]).toBe(1)   // held on the other day
    expect(pendCount()).toBe(1)
    expect(dayApproved(0) && dayApproved(1)).toBe(true)
  })

  it('the published AL records a name for its day and spends the signature again', () => {
    sign(0); setDayApproved(0, true)
    txtSet('dn:0.0', 'A'); sign(0)
    publishALDay(0)
    const rec = SCHED.als[0]
    expect(rec.seq).toBe(1)
    expect(rec.di).toBe(0)
    expect(rec.sign[0].appr).toBe('Piston')
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
    expect(dayApproved(0)).toBe(true)             // the day stays published
  })

  it('discardPending clears the marks', () => {
    noteChange('dn:0.0'); discardPending()
    expect(pendCount()).toBe(0)
  })

  /* Phase 2 lock (F-01): discardPending is restricted to NEVER-PUBLISHED days.
     On a published day a discard would silently drop a live-vs-issued
     divergence — the only supported way to change a published day is to publish
     it as the next AL. */
  it('discardPending keeps a PUBLISHED day’s pending, clears a DRAFT day’s', () => {
    sign(0); setDayApproved(0, true)          // day 0 published (has an Original)
    noteChange('dn:0.0')                        // a new draft edit on the published day
    noteChange('dn:1.0')                        // a draft edit on never-published day 1
    discardPending()
    expect(SCHED.pending['dn:0.0'], 'published day pending must survive a discard').toBe(1)
    expect(SCHED.pending['dn:1.0'], 'draft day pending must clear').toBeUndefined()
  })

  it('nextSeq is per-day: the day’s max issued seq + 1', () => {
    expect(nextSeq(0)).toBe(1)
    SCHED.als = [
      { id: 'a#1', di: 0, iso: 'a', seq: 1, snap: { d: {}, c: {} }, diff: [], sign: {} },
      { id: 'a#2', di: 0, iso: 'a', seq: 2, snap: { d: {}, c: {} }, diff: [], sign: {} },
      { id: 'b#1', di: 1, iso: 'b', seq: 1, snap: { d: {}, c: {} }, diff: [], sign: {} },
    ]
    expect(nextSeq(0)).toBe(3)
    expect(nextSeq(1)).toBe(2)
    expect(nextSeq(2)).toBe(1)                  // Tuesday and a fresh day are independent
  })

  it('markEdit with no key re-marks nothing', () => {
    markEdit()
    expect(pendCount()).toBe(0)
  })

  it('alAttr marks pending and published items apart', () => {
    /* a pending edit on a still-DRAFT day carries NO mark (owner, 25 Aug 26); an
       ISSUED change carries its per-day-seq colour. */
    noteChange('dn:0.0')
    expect(alAttr('dn:0.0')).toBe('')
    SCHED.changes['dn:0.1'] = 2
    expect(alAttr('dn:0.1')).toContain('data-alc="2"')
    expect(alAttr('dn:9.9')).toBe('')
    expect(alAttr('')).toBe('')
  })

  /* alAttr's empty-book short-circuit must read OWN keys only (Astra RID-REV2-02). */
  it('alAttr treats an empty book as empty even under an inherited enumerable key', () => {
    const polluted = rk('wl:0.0')
    ;(Object.prototype as any)[polluted] = 2
    try {
      expect(alAttr('wl:0.0')).toBe('')
    } finally {
      delete (Object.prototype as any)[polluted]
    }
  })

  /* the AL preview: a pending edit on a PUBLISHED day carries the per-day seq it
     will go out as (data-aln); a draft-day edit carries nothing. */
  it('pending on a published day previews the AL it will go out as', () => {
    sign(0); setDayApproved(0, 1)
    noteChange('dn:0.0')
    expect(alAttr('dn:0.0')).toContain('data-aln="1"')
    noteChange('dn:1.0')                          // day 1 still draft
    expect(alAttr('dn:1.0')).toBe('')
  })

  /* ADDRESSING BY rid (task 2 — the write/read boundary). */
  it('a row mark rides its row across an insert above it (rid-anchored, not positional)', () => {
    sign(0); setDayApproved(0, 1)
    const gi = DAYS[0].waves.length - 1
    txtSet(`wl:0.${gi}`, 'RID-TASK2')
    expect(SCHED.pending[`wl:0.${gi}`]).toBeUndefined()
    expect(SCHED.pending[rk(`wl:0.${gi}`)]).toBe(1)
    expect(alAttr(`wl:0.${gi}`)).toContain('data-aln')
    DAYS[0].waves.unshift({ formations: [], label: 'INSERTED' })
    try {
      expect(alAttr(`wl:0.${gi + 1}`)).toContain('data-aln')
      expect(alAttr(`wl:0.${gi}`)).toBe('')
    } finally {
      DAYS[0].waves.shift()
    }
  })

  it('the preview number tracks nextSeq(di) as amendments are issued', () => {
    sign(0); setDayApproved(0, 1)
    noteChange('dn:0.0')
    SCHED.als = [
      { id: 'a#1', di: 0, iso: 'a', seq: 1, snap: { d: {}, c: {} }, diff: [], sign: {} },
      { id: 'a#2', di: 0, iso: 'a', seq: 2, snap: { d: {}, c: {} }, diff: [], sign: {} },
    ]
    expect(alAttr('dn:0.0')).toContain('data-aln="3"')
    expect(alAttr('dn:0.0')).toContain('AL3')
  })

  it('AL colours follow the fixed sequence', () => {
    expect(alColor(1)).toBe('#3BC6E8')
    expect(alColor(3)).toBe('#3DE86B')
    expect(alColor(4)).toBe('#FFFFFF')
    expect(alColor(5)).toBe('#B388FF')   // purple
    expect(alColor(6)).toBe('#FF7FC4')   // pink
    expect(alColor(7)).toBe('#E5872B')   // orange
  })

  it('every AL colour carries its own tag in dark ink', () => {
    const lum = (hex: string) => {
      const ch = [1, 3, 5].map(i => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
    }
    const ink = lum('#08131b')
    for (let n = 1; n <= 7; n++) {
      const ratio = (lum(alColor(n)) + 0.05) / (ink + 0.05)
      expect(ratio, `AL${n} ${alColor(n)}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('daySnapIn rejects a MALFORMED verId (P2-REREVIEW-11)', () => {
  it('a coerced/malformed identity resolves to null, a well-formed one resolves', () => {
    const iso = dayIso(CURWEEK, 0)
    SCHED.dayOK = { 0: 1 }
    SCHED.orig = { 0: { id: verId(iso, 0), d: { notes: ['orig'] }, c: {} } }
    // the exact, well-formed Original resolves
    expect(daySnapOf(0, verId(iso, 0))).toBeTruthy()
    // malformed identities parseVerId would coerce must all be rejected
    expect(daySnapOf(0, iso + '#'), 'empty seq (coerces to 0)').toBeNull()
    expect(daySnapOf(0, iso + '#-1'), 'negative seq').toBeNull()
    expect(daySnapOf(0, iso + '#1.5'), 'fractional seq').toBeNull()
    expect(daySnapOf(0, 'notadate#0'), 'non-ISO date').toBeNull()
    expect(daySnapOf(0, '2026-13-40#0'), 'impossible calendar date').toBeNull()
  })

  it('nextSeq ignores a non-positive / non-integer sequence', () => {
    const iso = dayIso(CURWEEK, 0)
    SCHED.als = [
      { id: verId(iso, 1), di: 0, iso, seq: 1, snap: { d: {}, c: {} }, diff: [], sign: {} },
      { id: verId(iso, 2), di: 0, iso, seq: -3 as any, snap: { d: {}, c: {} }, diff: [], sign: {} },   // bogus seq must not count
      { id: verId(iso, 3), di: 0, iso, seq: 1.5 as any, snap: { d: {}, c: {} }, diff: [], sign: {} },
    ]
    expect(nextSeq(0)).toBe(2)   // only the valid seq 1 counts → next is 2
  })
})

describe('dayCurVerIn falls back to the highest VALIDATING record, not just the highest seq (P2-IMPL-12)', () => {
  it('a higher-seq wrong-week record is skipped for a valid lower-seq AL, not the Original', () => {
    const iso = dayIso(CURWEEK, 0)
    SCHED.dayOK = { 0: 1 }
    SCHED.orig = { 0: { id: verId(iso, 0), d: { notes: ['orig'] }, c: {} } }
    const al1 = { id: verId(iso, 1), di: 0, iso, seq: 1, snap: { d: { notes: ['al1'] }, c: {} }, diff: [], sign: {} }
    /* AL2 is the highest seq but carries a FOREIGN week's iso, so daySnapIn rejects
       it. The old code validated only the highest-seq candidate and then fell through
       to the Original; the fix iterates by descending seq and returns AL1. */
    const al2bad = { id: verId('2099-01-02', 2), di: 0, iso: '2099-01-02', seq: 2, snap: { d: { notes: ['al2'] }, c: {} }, diff: [], sign: {} }
    SCHED.als = [al1, al2bad]
    SCHED.cur = { 0: al2bad.id }                       // stamped at the invalid higher-seq record
    expect(dayCurVer(0)).toBe(al1.id)
    expect(verSeq(dayCurVer(0)!)).toBe(1)
  })
})

describe('a canonical-only cancel-reason edit keeps its AL attribution (P2-IMPL-08)', () => {
  it('changing a cancelled DUTY row\'s reason survives reconcile and goes out marked on the duty row', () => {
    /* the duty row is cancelled WITH a reason before the day is published, so the
       Original freezes cx=true/cxr='WX'. Then only the REASON changes. The
       dr:...role composite must reflect cxr, or reconcile drops the mark (role/cx
       unchanged) and the revised reason gets no AL attribution. */
    const row = DAYS[0].dutywaves[0].rows[0]
    row.cx = true; row.cxr = 'WX'
    sign(0); setDayApproved(0, true)                 // Original frozen with cx=true, cxr='WX'
    row.cxr = 'OPS'; markEdit('dr:0.0.0.role')        // mimic cxCommit: reason changes, marks the duty row
    reconcileIssuedMarks()
    expect(SCHED.pending[rk('dr:0.0.0.role')], 'the reason-change mark must survive reconcile').toBe(1)
    expect(dayHasChanges(0)).toBe(true)
    sign(0); publishALDay(0)
    expect(SCHED.changes[rk('dr:0.0.0.role')], 'the revised reason goes out attributed to the duty row').toBe(1)
    /* the frozen record counts it exactly once (no bxr double-count) */
    const rec = SCHED.als.find((a: any) => +a.di === 0 && +a.seq === 1)
    expect(rec.diff.filter((e: any) => e.kind === 'change' && String(e.addr).startsWith('dr:0.0.0')).length).toBe(1)
    expect(rec.diff.some((e: any) => String(e.addr).startsWith('bxr:'))).toBe(false)
  })
})

describe('an issued AL is history (tfin B53 #14)', () => {
  it('the issue is single-day, verId-keyed, with a frozen canonical diff', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'A'); txtSet('dn:0.1', 'B'); sign(0)
    const { id, seq } = alIssue(0)
    const rec = SCHED.als[0]
    expect(rec.di).toBe(0)
    expect(rec.seq).toBe(1)
    expect(seq).toBe(1)
    expect(rec.id).toBe(id)
    expect(verSeq(rec.id)).toBe(1)
    expect(rec.diff.length).toBeGreaterThan(0)     // the canonical delta is frozen
    expect(alCount(rec)).toBe(rec.diff.length)
    expect(alDays(rec)).toEqual([0])
  })

  it('the frozen diff count survives later live edits (the printed copy does not shrink)', () => {
    SCHED.als = [{ id: 'x#1', di: 0, iso: 'x', seq: 1, snap: { d: {}, c: {} }, diff: [{ addr: 'a', kind: 'change' }, { addr: 'b', kind: 'delete' }], sign: {} }]
    const rec = SCHED.als[0]
    expect(alCount(rec)).toBe(2)
    expect(alDays(rec)).toEqual([0])
    expect(diffCounts(rec.diff)).toMatchObject({ total: 2, chg: 1, del: 1 })
  })
})

describe('structural-deletion tombstones', () => {
  it('uses unique inert keys that keep the day parseable without naming a live row', () => {
    const a = markDeletion(0, 'ground'), b = markDeletion(0, 'ground')
    expect(a).not.toBe(b)
    expect(isDeleteKey(a)).toBe(true)
    expect(keyDay(a)).toBe(0)
    expect(deleteCount(Object.keys(SCHED.pending))).toBe(2)
    expect(a.startsWith('g:')).toBe(false)
    expect(a.startsWith('gr:')).toBe(false)
  })

  it('publishes and snapshots a real removal like any other AL item', () => {
    sign(0); setDayApproved(0, 1)
    const ni = DAYS[0].notes.length - 1
    const issued = deletionWasIssued(0, 'note', ni)
    DAYS[0].notes.splice(ni, 1); shiftKeys('dn:0.', 0, ni)     // a REAL removal → a canonical delta
    const key = markDeletion(0, 'note', issued)
    expect(dayHasChanges(0)).toBe(true)
    sign(0); publishALDay(0)
    expect(SCHED.pending[key]).toBeUndefined()
    expect(SCHED.changes[key]).toBe(1)
    const s = daySnapOf(0, dayCurVer(0))
    expect(s.c[key]).toBe(1)
  })

  it('does not publish a false removal when a draft-only row is added, reordered, then deleted', () => {
    sign(0); setDayApproved(0, 1)
    const ni = DAYS[0].notes.length
    DAYS[0].notes.push('temporary')
    markStructuralAdd(`dn:0.${ni}`)
    expect(moveNote(0, ni, 0)).toBe(true)
    const issued = deletionWasIssued(0, 'note', 0)
    DAYS[0].notes.splice(0, 1); shiftKeys('dn:0.', 0, 0)
    markDeletion(0, 'note', issued)
    expect(SCHED.pending).toEqual({})
    expect(SCHED.added).toEqual({})
  })

  it('a later AL re-marks a row it re-issues with its own per-day seq', () => {
    sign(0); setDayApproved(0, 1)
    const ni = DAYS[0].notes.length
    DAYS[0].notes.push('new note')
    const key = markStructuralAdd(`dn:0.${ni}`)
    sign(0); publishALDay(0)                  // AL1 (seq 1) adds it
    expect(SCHED.changes[key]).toBe(1)
    expect(SCHED.added[key]).toBeUndefined()  // the add is now frozen in the snapshot
    DAYS[0].notes[ni] = 'new note, revised'; markEdit(key)
    sign(0); publishALDay(0)                  // AL2 (seq 2) owns the key
    expect(SCHED.changes[key]).toBe(2)
    expect(deletionWasIssued(0, 'note', ni)).toBe(true)
  })

  it('loading a version onto the working copy clears colliding draft-add identities', () => {
    sign(0); setDayApproved(0, 1)
    const orig = dayCurVer(0)
    const ni = DAYS[0].notes.length
    DAYS[0].notes.push('temporary replacement')
    const key = markStructuralAdd(`dn:0.${ni}`)
    expect(SCHED.added[key]).toBe(1)
    expect(loadVersionToWorkingCopy(0, orig)).toBe(true)   // pull the Original back onto the working copy
    expect(SCHED.added[key]).toBeUndefined()               // the stray add identity is gone
  })
})

describe('dropRowMarks — the delete sweep (addressing-by-rid task 4)', () => {
  it('sweeps a deleted rid AND its descendants from the LIVE book, but never an issued AL', () => {
    ensureRowIds(DAYS)
    const waveRid = DAYS[0].waves[0].rid
    markEdit('wl:0.0'); markEdit('ff:0.0.0.cs'); markEdit('0.0.0.0.p')
    const wl = rk('wl:0.0'), ff = rk('ff:0.0.0.cs'), seat = rk('0.0.0.0.p')
    expect(wl).not.toBe('wl:0.0')
    expect([SCHED.pending[wl], SCHED.pending[ff], SCHED.pending[seat]]).toEqual([1, 1, 1])
    /* an issued AL and its frozen snapshot slice carry the wave's key too */
    SCHED.changes[wl] = 1
    SCHED.als = [{ id: 'x#1', di: 0, iso: 'x', seq: 1, snap: { d: {}, c: { [wl]: 1 } }, diff: [], sign: {} }]
    dropRowMarks([waveRid])
    expect(SCHED.pending[wl]).toBeUndefined()
    expect(SCHED.pending[ff]).toBeUndefined()
    expect(SCHED.pending[seat]).toBeUndefined()
    expect(SCHED.changes[wl]).toBeUndefined()
    /* the issued AL record is IMMUTABLE — the frozen snapshot slice is untouched */
    expect(SCHED.als[0].snap.c[wl]).toBe(1)
  })
})

describe('per-day version snapshots', () => {
  it('first publish stamps the Original, deep-cloned and frozen', () => {
    const note0 = DAYS[0].notes[0]
    sign(0); setDayApproved(0, 1)
    const orig = dayCurVer(0)
    expect(daySnapOf(0, orig)).toBeTruthy()
    expect(daySnapOf(0, orig).d.notes[0]).toBe(note0)
    DAYS[0].notes[0] = 'LIVE EDIT'
    expect(daySnapOf(0, orig).d.notes[0]).toBe(note0)   // deep clone — later edits can't reach in
  })

  it('alIssue freezes the day wearing its own new mark', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'X'); sign(0)
    const { id } = alIssue(0)
    const s = daySnapOf(0, id)
    expect(s).toBeTruthy()
    expect(s.c[rk('dn:0.0')]).toBe(1)        // the AL's own mark is IN the snapshot
  })

  it('dayVersions lists live, then the Original and snapshot-bearing ALs as verIds', () => {
    expect(dayVersions(0)).toEqual(['live'])
    sign(0); setDayApproved(0, 1)
    const orig = dayCurVer(0)
    txtSet('dn:0.0', 'X'); sign(0)
    const { id } = alIssue(0)
    expect(dayVersions(0)).toEqual(['live', orig, id])
    expect(verLabel('live')).toBe('Live')
    expect(verLabel(orig)).toBe('Original')
    expect(verLabel(id)).toBe('AL1')
  })

  it('a cross-day / foreign / wrong-week version id resolves to null, never a wrong day (P2-R2-05/P2-R3-03)', () => {
    sign(0); setDayApproved(0, 1)
    const orig0 = dayCurVer(0)
    expect(daySnapOf(0, orig0)).toBeTruthy()      // its own day resolves
    expect(daySnapOf(1, orig0)).toBeNull()        // the SAME id for another day → null
    expect(daySnapOf(0, 'not-an-id')).toBeNull()  // malformed → null
    expect(daySnapOf(0, '1999-01-01#0')).toBeNull() // wrong date/week → null
  })
})

describe('dayCurVer — the version a day is currently showing', () => {
  it('null before publish, the Original after first publish, the AL after an issue', () => {
    expect(dayCurVer(0)).toBeNull()
    sign(0); setDayApproved(0, 1)
    expect(verSeq(dayCurVer(0))).toBe(0)
    txtSet('dn:0.0', 'X'); sign(0)
    const { id } = alIssue(0)
    expect(dayCurVer(0)).toBe(id)
    expect(verSeq(dayCurVer(0))).toBe(1)
  })

  it('when the stamp is gone, falls back to the newest surviving issue by seq', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'A'); sign(0); alIssue(0)                 // seq 1
    txtSet('dn:0.1', 'B'); sign(0); const { id: id2 } = alIssue(0)   // seq 2
    expect(dayCurVer(0)).toBe(id2)
    delete SCHED.cur[0]
    expect(dayCurVer(0)).toBe(id2)                            // derived: newest seq
  })
})

describe('Phase 2 — the per-day verId record', () => {
  it('per-day sequence: Monday-AL1 and Tuesday-AL1 are distinct verIds, both seq 1', () => {
    sign(0); setDayApproved(0, 1); txtSet('dn:0.0', 'A'); sign(0); const a = alIssue(0)
    sign(1); setDayApproved(1, 1); txtSet('dn:1.0', 'B'); sign(1); const b = alIssue(1)
    expect(a.seq).toBe(1); expect(b.seq).toBe(1)
    expect(a.id).not.toBe(b.id)                    // different days → different ids
    expect(verSeq(a.id)).toBe(1); expect(verSeq(b.id)).toBe(1)
  })

  /* the record SHAPE is pinned by a plain JSON serialization round-trip — NOT a
     publish→undo→redo, which would retract the AL and let nextSeq reuse its id
     for different content. Undo-across-publish is Phase 3 (§5). */
  it('the new record shape survives a plain JSON serialization round-trip (P2-01)', () => {
    sign(0); setDayApproved(0, 1); txtSet('dn:0.0', 'A'); sign(0); alIssue(0)
    const before = JSON.stringify(schedFields())
    const round = JSON.parse(before)
    expect(round.a[0].id).toBe(SCHED.als[0].id)
    expect(round.a[0].seq).toBe(1)
    expect(round.a[0].di).toBe(0)
    expect(round.a[0].diff).toEqual(SCHED.als[0].diff)
    expect(round.cv[0]).toBe(SCHED.cur[0])          // the verId cur survives verbatim
    expect(JSON.stringify(round)).toBe(before)      // byte-identical round-trip
  })

  it('the ordinary amendment flow never rewrites the Original', () => {
    const orig = DAYS[0].notes[0]
    sign(0); setDayApproved(0, 1)
    const origId = dayCurVer(0)
    txtSet('dn:0.0', 'AMENDED'); sign(0); publishALDay(0)
    expect(daySnapOf(0, origId).d.notes[0]).toBe(orig)          // Original frozen as first issued
    const cur = dayCurVer(0)
    expect(daySnapOf(0, cur).d.notes[0]).toBe(txtGet('dn:0.0'))  // AL1's snapshot carries the amendment
  })
})
