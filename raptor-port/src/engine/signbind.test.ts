/* Phase 3 — signatures bound to content (AM-06, brief §5/§9; build-plan Phase 3).
   A signature is no longer just "this appointed person's name is in the slot": it
   is BOUND, at the moment it is given, to the exact content it signed — the
   canonical digest (§5.0), the schedule date, the current issued base id, and the
   candidate (plan/draft) revision. Validity is RECOMPUTED on every read, never
   cleared by a hook (Rev-4 command-layer §2.1): so an edit silently invalidates
   it, and an undo (or an in-place revert) back to the signed content makes it
   valid again (F-09). Nothing here touches printed bytes — the binding is book
   state, so parity stays 728/0.

   Test-first: this pins the contract the setSign / signBind machinery must meet. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { PEOPLE } from './people'
import { INPUTS } from './inputs'
import {
  SCHED, signOf, signMissing, daySigned, setSign, signBindOf,
  setDayApproved, dayApproved, dayCurVer,
} from './publish'
import { digest } from './canonical'
import { dayIso, verId } from './verid'
import { CURWEEK } from './waves'
import { histInit, histPush, histApply, HIST } from '../state/history'

/* DAYS[0] is mutated by these tests; clone-restore per test so nothing leaks. */
const D0 = JSON.parse(JSON.stringify(DAYS[0]))
beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.signBind = {}
  DAYS[0] = JSON.parse(JSON.stringify(D0))
})

/* sign all four roles through the sanctioned write path (the one Shell.tsx uses),
   which binds each to the content as it stands right now. */
const signAll = (di: number) => {
  setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane')
  setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump')
}
/* a real canonical content edit: append a day note (dn: is canonical), so the
   digest moves with no signature slot touched. */
const editContent = (di: number) => {
  DAYS[di].notes = DAYS[di].notes || []
  DAYS[di].notes.push({ rid: 'nsb' + DAYS[di].notes.length, t: 'amendment ' + Math.random() })
}

describe('a signature binds to the content it signed (AM-06)', () => {
  it('captures the current canonical digest at sign time, and the day reads signed', () => {
    signAll(0)
    expect(daySigned(0)).toBe(true)
    expect(signBindOf(0).cur.dg).toBe(digest(DAYS[0], 0))
    expect(signBindOf(0).appr.dg).toBe(digest(DAYS[0], 0))
  })

  it('an edit invalidates every signature — no cell touched, no hook run', () => {
    signAll(0)
    const before = digest(DAYS[0], 0)
    editContent(0)
    expect(digest(DAYS[0], 0), 'the edit really moved the digest').not.toBe(before)
    /* the signer names are still in the slots — nothing cleared them … */
    expect(Object.values(signOf(0)).every(v => v !== '')).toBe(true)
    /* … but the day no longer reads signed, because the binding no longer matches */
    expect(daySigned(0)).toBe(false)
    expect(signMissing(0)).toEqual(['CUR CK', 'SKED CK', 'PLANNED BY', 'APPROVED BY'])
  })

  it('reverting the content in place makes the signature valid again (recomputed, never cleared)', () => {
    signAll(0)
    editContent(0)
    expect(daySigned(0)).toBe(false)
    DAYS[0].notes.pop()                          // undo the edit by hand
    expect(daySigned(0)).toBe(true)              // the still-matching signature stands
  })

  it('publishing is refused while a signature is stale', () => {
    signAll(0)
    editContent(0)
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(false)           // blocked — cannot issue unsigned-for-this-content
  })

  it('issuing the day spends the binding along with the signature', () => {
    signAll(0)
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    expect(signBindOf(0)).toEqual({})            // cleared on issue, like signOf
  })
})

describe('undo re-verifies rather than blindly invalidating (F-09, brief §9)', () => {
  it('undo back to the signed content keeps the signature', () => {
    histInit()
    signAll(0); histPush()
    editContent(0); histPush()
    expect(daySigned(0)).toBe(false)
    histApply(HIST.ix - 1)                       // undo the edit
    expect(daySigned(0)).toBe(true)              // signature restored AND still matches
    expect(signBindOf(0).cur.dg).toBe(digest(DAYS[0], 0))
  })
})

describe('the binding also covers plan revision and issued base (AM-06)', () => {
  it('switching the candidate plan invalidates a signature bound to the old plan', () => {
    SCHED.curDraft[0] = 'planA'
    signAll(0)
    expect(daySigned(0)).toBe(true)
    SCHED.curDraft[0] = 'planB'                   // a plan switch — rev no longer matches
    expect(daySigned(0)).toBe(false)
  })

  it('a signature bound to one issued baseline goes stale when a newer AL becomes current', () => {
    /* issue the Original, then sign against it */
    signAll(0); setDayApproved(0, true)
    const origId = dayCurVer(0)
    signAll(0)
    expect(daySigned(0)).toBe(true)
    expect(signBindOf(0).cur.base).toBe(origId)
    /* another context issues AL1 (same content, new baseline) and it becomes current */
    const iso = dayIso(CURWEEK, 0)
    const al1 = { id: verId(iso, 1), di: 0, iso, seq: 1, snap: { d: (SCHED.orig[0] as any).d, c: (SCHED.orig[0] as any).c || {} }, diff: [], sign: {} }
    SCHED.als.push(al1); SCHED.cur[0] = al1.id
    expect(dayCurVer(0)).toBe(al1.id)             // baseline moved
    expect(daySigned(0)).toBe(false)              // the signature was for the older base
  })
})

describe('legacy / unbound signatures stay backward-compatible', () => {
  it('a signer set with no binding (a pre-Phase-3 or demo book) still reads signed', () => {
    const g = signOf(0)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    expect(daySigned(0)).toBe(true)              // no binding present → appointment-only, as before
  })
})


describe('a signature binds to the FILING axis too (owner, 15 Sep 26 - Codex PSF-001)', () => {
  it('a filing change on a signed day invalidates it; reverting the filing restores it', () => {
    /* an input that covers day 0's date; acc '' is excluded from filingKey (empty ==
       absent), so signing captures the day WITHOUT it, and flipping acc to a real
       filing state is a genuine filing change dayDelta would count. */
    const covering: any = { iid: 'itest_psf1', type: 'leave', date: DAYS[0].dt, acc: '' }
    INPUTS.push(covering)
    try {
      signAll(0)
      expect(daySigned(0)).toBe(true)
      covering.acc = 'u'                        // a leave/availability filing onto the date
      expect(daySigned(0), 'a filing change invalidates the signature (was publishable on stale sign-offs)').toBe(false)
      expect(signMissing(0).length).toBe(4)
      covering.acc = ''                         // revert the filing
      expect(daySigned(0), 'reverting the filing restores the signature').toBe(true)
    } finally {
      const i = INPUTS.indexOf(covering); if (i >= 0) INPUTS.splice(i, 1)
    }
  })
})
