/* THE OIL EVIDENCE BLOCK — [OIL-AUTO-REMOVE], owner 21 Sep 26.
   Spec: docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md.

   What this pins, ruling by ruling:
   · §7.1  money comes ONLY from the issued block — the pass never reads live
           INPUTS again, so a member cannot move an issued credit by editing his
           own input, and an OD claim (which has no row) is in the document.
   · §7.2  a mark on the day is PUBLISHABLE: an OIL-only edit produces a real
           delta, a real amendment item, and invalidates the signature.
   · §9.2  ONE always-present aggregate address, so nothing appears or
           disappears and no amendment item is silently dropped.
   · §9.3  the live day stores only the DECISIONS; the derived halves exist on
           the issued snapshot only, so a restored plan cannot resurrect a stale
           projection.
   · §9.1  the three states — inherit / allow / deny — and that nothing
           overrides ineligibility.
   · §2.1  the day blanket MASKS the marks beneath it rather than deleting them.
   · §7.4  a decision survives an ordinary member edit of his own input.

   The Leave War facts (which days can earn, who a sentinel stands for) arrive
   through HOOKS, so this suite installs them directly and needs no war. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, daySnap, dayDelta, dayHasChanges, dayApproved, setDayApproved, publishALDay, signOf, setSign, daySigned, dayCurVer, daySnapOf, currentBind, diffCounts, dayDiscardCount } from './publish'
import { ensureRowIds } from './rowids'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, oilEvidenceKey, oilDecisionsKey, oilWouldEarn, inputItemKey, rowItemKey, groundItemKey } from './oilev'
import { envMin, uniformOil } from './oil'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5                       // the seed Saturday, 18 Jul 26
const SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  ensureRowIds(DAYS)
  /* the seed week's Monday is 13 Jul 26, so day 5 is Saturday the 18th */
  HOOKS.oilEarningDay = (di: number) => di === SAT || di === 6
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === 6 ? '2026-07-19' : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff', 'plasma']
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const publish = (di: number) => { sign(di); setDayApproved(di, true) }
const groundRow = (di: number, r: any) => { DAYS[di].ground = (DAYS[di].ground || []).concat([r]); ensureRowIds(DAYS); return DAYS[di].ground[DAYS[di].ground.length - 1] }
const claim = (r: any) => { INPUTS.unshift({ allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, ...r }); return INPUTS[0] }
/* THE FIGURE AS THE MONEY SEES IT: on a published day, off the ISSUED
   SNAPSHOT — which is the whole point of the block — and off the live working
   copy before it goes out. The same choice leavewar/sync.ts makes. */
const figure = (di: number, person: string) => {
  const snap: any = dayApproved(di) ? daySnapOf(di, dayCurVer(di)) : null
  const d = snap && snap.d ? snap.d : DAYS[di]
  const work = oilEarnedWork(d, oilEvidenceOf(di, d))
  const sp = work[person] || []
  const v = uniformOil(envMin(sp.map((w: any) => [w.s, w.e] as [number, number])))
  return v === 1 ? 'FO' : v === 0.5 ? 'HO' : null
}

describe('the block is derived on the live day and FROZEN on the issued one (§9.3)', () => {
  it('OIL29 — a live day stores only the decisions, never the projection', () => {
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 1 } })
    const ev = oilEvidence(SAT)
    expect(ev.earns).toBe(true)
    expect(ev.inputs.map(i => i.iid)).toContain('c1')
    expect((DAYS[SAT] as any).oilev, 'nothing derived is stored on the working copy').toBeUndefined()
  })

  it('OIL29 — publishing freezes the whole block onto the issued snapshot', () => {
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 1 } })
    publish(SAT)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    expect(snap.d.oilev.earns).toBe(true)
    expect(snap.d.oilev.inputs.find((i: any) => i.iid === 'c1').ans).toBe(1)
    expect((DAYS[SAT] as any).oilev, 'the working copy still stores nothing derived').toBeUndefined()
  })

  it('OIL18 — a weekday carries no block at all, so the five ordinary days are untouched', () => {
    expect(oilEvidence(1).earns).toBe(false)
    expect(oilEvidenceKey(oilEvidence(1))).toBe('')
    expect(dayDelta(1)).toEqual([])
  })

  it('OIL24, OIL36 — the issued block answers, not the live inputs: a member edit moves nothing', () => {
    const c = claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', allday: false, s: 480, e: 720, oil: { [SAT_ISO]: 0.5 } })
    publish(SAT)
    expect(figure(SAT, 'bane')).toBe('HO')
    c.s = 480; c.e = 1080                            // he re-times it to a nine-hour day
    expect(figure(SAT, 'bane'), 'the issued document still says four hours').toBe('HO')
  })
})

describe('an OIL-only edit is PUBLISHABLE (§7.2, §9.2)', () => {
  it('OIL16, OIL27 — marking an item on a published day is one amendment item, and clears the signature', () => {
    const g = groundRow(SAT, { prog: 'FAMILY DAY', str: '1000', end: '1700', who: 'bane' })
    publish(SAT)
    expect(dayHasChanges(SAT), 'nothing changed yet').toBe(false)
    ;(DAYS[SAT] as any).oild = { items: { [rowItemKey(g.rid)]: 0 } }
    expect(dayHasChanges(SAT)).toBe(true)
    const c = diffCounts(dayDelta(SAT))
    expect(c.oil, 'ONE aggregate item, never one per man').toBe(1)
    expect(c.total).toBe(1)
    /* the signature is bound to the evidence, so the day needs signing again */
    const b: any = currentBind(SAT)
    expect(b.oil).toContain(rowItemKey(g.rid))
    sign(SAT); publishALDay(SAT)
    expect(SCHED.als.length).toBe(1)
    expect(SCHED.als[0].diff.some((e: any) => e.kind === 'oil')).toBe(true)
    expect(dayHasChanges(SAT), 'published — the issued block now carries the mark').toBe(false)
  })

  it('OIL11, OIL12 — an answer-only change is publishable too, even for OD, which has no row', () => {
    const c = claim({ iid: 'od1', person: 'bane', type: 'OD', date: 'Jul 18', oil: { [SAT_ISO]: 1 } })
    publish(SAT)
    expect(dayHasChanges(SAT)).toBe(false)
    c.oil = { [SAT_ISO]: 0 }                          // he changes his own answer to No
    expect(dayHasChanges(SAT), 'the evidence moved, so the day can be re-issued').toBe(true)
    expect(diffCounts(dayDelta(SAT)).oil).toBe(1)
  })

  it('turning a mark on and off again leaves NO change — an empty decision is not a decision', () => {
    const g = groundRow(SAT, { prog: 'BRIEF', str: '0800', end: '0900', who: 'bane' })
    publish(SAT)
    ;(DAYS[SAT] as any).oild = { items: { [rowItemKey(g.rid)]: 0 } }
    expect(dayHasChanges(SAT)).toBe(true)
    delete (DAYS[SAT] as any).oild
    expect(dayHasChanges(SAT)).toBe(false)
  })

  it('OIL16, OIL29 — a decision MUTATED in place on a published day is still a change', () => {
    /* FOUND BY HAND IN THE RUNNING APP, 21 Sep 26, and it is the sharpest bug of
       the build. The board mutates `oild` IN PLACE (the mode's writers hold the
       live object), where this suite had been REPLACING it. The frozen block was
       handing back that same live object, so marking one more man on a published
       Saturday silently rewrote the issued document, the delta read "no change",
       and the day could never be amended — the exact failure §7.2 exists to
       prevent, arriving by a different door. */
    const g = groundRow(SAT, { prog: 'FAMILY DAY', str: '1000', end: '1700', who: 'bane' })
    const item = rowItemKey(g.rid)
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${item}`]: 'deny' } }
    publish(SAT)
    expect(dayHasChanges(SAT)).toBe(false)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    /* mutate the LIVE object, exactly as the board's own writer does */
    ;(DAYS[SAT] as any).oild.people[`stiff|${item}`] = 'deny'
    expect(snap.d.oilev.d.people[`stiff|${item}`], 'the issued document did not move').toBeUndefined()
    expect(dayHasChanges(SAT), 'and the day now has a publishable change').toBe(true)
    expect(diffCounts(dayDelta(SAT)).oil).toBe(1)
  })

  it('a decision-only divergence counts as an edit a recovery would discard', () => {
    const g = groundRow(SAT, { prog: 'BRIEF', str: '0800', end: '0900', who: 'bane' })
    publish(SAT)
    expect(dayDiscardCount(SAT)).toBe(0)
    ;(DAYS[SAT] as any).oild = { items: { [rowItemKey(g.rid)]: 0 } }
    expect(dayDiscardCount(SAT)).toBe(1)
  })
})

describe('the three states, and what cannot be overridden (§9.1)', () => {
  it('OIL10 — the member has the first word, and the admin can say YES over his NO', () => {
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 0 } })   // he says no
    publish(SAT)
    expect(figure(SAT, 'bane'), 'his own No stands').toBe(null)
    /* the admin allows it — this is the override §2.2 promised and the block as
       first written could not express */
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey('c1')}`]: 'allow' } }
    sign(SAT); publishALDay(SAT)
    expect(figure(SAT, 'bane')).toBe('FO')
  })

  it('OIL10 — his own answer is never overwritten: lift the override and his word comes back', () => {
    const c = claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 0 } })
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey('c1')}`]: 'allow' } }
    publish(SAT)
    expect(c.oil).toEqual({ [SAT_ISO]: 0 })
    delete (DAYS[SAT] as any).oild
    sign(SAT); publishALDay(SAT)
    expect(figure(SAT, 'bane'), 'back to his No').toBe(null)
  })

  it('OIL28, OIL13, OIL31 — an allow counts real work, it never invents it', () => {
    /* a dormant claim, and a row with no times: neither can be allowed into money */
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'r', oil: { [SAT_ISO]: 1 } })
    const g = groundRow(SAT, { prog: 'NO TIMES', str: '', end: '', who: 'stiff' })
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey('c1')}`]: 'allow', [`stiff|${rowItemKey(g.rid)}`]: 'allow' } }
    publish(SAT)
    expect(figure(SAT, 'bane'), 'the scheduler took the commitment off the programme').toBe(null)
    expect(figure(SAT, 'stiff'), 'money must not come from a guess').toBe(null)
  })

  it('OIL3, OIL4 — a deny takes one man off ONE event and leaves his others alone', () => {
    const a = groundRow(SAT, { prog: 'MORNING', str: '0700', end: '0800', who: 'bane' })
    const b = groundRow(SAT, { prog: 'ALL DAY', str: '0900', end: '1700', who: 'bane' })
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${rowItemKey(b.rid)}`]: 'deny' } }
    publish(SAT)
    expect(figure(SAT, 'bane'), 'only his hour is left').toBe('HO')
    expect(a && b).toBeTruthy()
  })
})

describe('the day blanket MASKS, it does not delete (§2.1 item 7)', () => {
  it('OIL9 — everything stops earning, and every mark underneath comes back when it is lifted', () => {
    const g = groundRow(SAT, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    const item = rowItemKey(g.rid)
    ;(DAYS[SAT] as any).oild = { blanket: 1, people: { [`bane|${item}`]: 'deny' } }
    publish(SAT)
    expect(figure(SAT, 'bane')).toBe(null)
    /* lift it — and the deny is still there, exactly as it was */
    delete (DAYS[SAT] as any).oild.blanket
    sign(SAT); publishALDay(SAT)
    expect((DAYS[SAT] as any).oild.people[`bane|${item}`]).toBe('deny')
    expect(figure(SAT, 'bane')).toBe(null)
  })

  it('OIL9 — it covers a row added AFTER it was set: a fact about the day, not a stamp on the rows', () => {
    ;(DAYS[SAT] as any).oild = { blanket: 1 }
    groundRow(SAT, { prog: 'ADDED LATER', str: '0800', end: '1700', who: 'bane' })
    publish(SAT)
    expect(figure(SAT, 'bane')).toBe(null)
  })
})

describe('the sentinel membership is frozen at publication (§7.3)', () => {
  it('OIL24 — who an ALL AVAIL puck stood for cannot change under the reader', () => {
    const g = groundRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'allavail' })
    publish(SAT)
    const item = rowItemKey(g.rid)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    expect(snap.d.oilev.sent[item]).toEqual(['bane', 'stiff', 'plasma'])
    /* the world changes underneath — a man is archived, someone files leave */
    HOOKS.oilSentinel = () => ['bane']
    expect(figure(SAT, 'stiff'), 'the issued day still names him').toBe('FO')
    /* …until the day is published again */
    sign(SAT); publishALDay(SAT)
    expect(figure(SAT, 'stiff')).toBe(null)
  })
})

describe('an item address survives what it must (§7.4)', () => {
  it('OIL25 — a ground row from an accepted input is addressed by the INPUT, not the row', () => {
    const g = groundRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'c1' })
    expect(groundItemKey(g)).toBe(inputItemKey('c1'))
    expect(groundItemKey({ rid: 'r9' })).toBe(rowItemKey('r9'))
  })
})

describe('the publish reminder asks the right question (§2.3)', () => {
  it('OIL11 — the reminder speaks only where there is money waiting on a publication', () => {
    /* a weekend day with nothing on it: the reminder must stay silent, or every
       Saturday morning would nag about a day nobody is working */
    Object.assign(DAYS[6], { waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [], allhands: [] })
    expect(oilWouldEarn(6), 'an empty weekend day asks nothing').toBe(false)
    groundRow(6, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    expect(oilWouldEarn(6)).toBe(true)
    expect(oilWouldEarn(1), 'an ordinary weekday never asks').toBe(false)
    expect(oilWouldEarn(SAT), 'and the seed Saturday already has its SDO desk').toBe(true)
  })
})

describe('a snapshot with no block is PROTECTED, never guessed at (§9.4)', () => {
  it('the frozen block is what a reader gets, and an absent one is absent', () => {
    publish(SAT)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    delete snap.d.oilev                                // a legacy snapshot, written before this build
    expect(oilEvidenceOf(SAT, snap.d).earns, 'derived afresh, never reconstructed from stale evidence').toBe(true)
    expect(dayApproved(SAT)).toBe(true)
    /* the credit pass's own guard is in leavewar/sync.ts creditFrom, pinned by
       oilsync.test.ts — this only pins that the reader does not invent a block. */
    expect(snap.d.oilev).toBeUndefined()
  })
})

describe('the snapshot the signature was validated against is the one frozen (§9.3 point 3)', () => {
  it('daySnap freezes the same value currentBind reports', () => {
    groundRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'allavail' })
    const before = (currentBind(SAT) as any).oil
    const snap: any = daySnap(SAT)
    expect(oilEvidenceKey(snap.d.oilev)).toBe(before)
  })
})

/* ── THE BUG CHECK'S FIXES, 21 Sep 26 ─────────────────────────────────────
   Pinned through the routes PRODUCTION takes, because the review's sharpest
   finding was that this suite did not: it signed days by writing the record
   directly (so the OIL signature rule was proved by nothing at all) and set
   the decisions by REPLACING the record where the board mutates it in place —
   the same blindness that hid the aliasing bug found by hand. */
describe('the bug check (Fable + Astra, 21 Sep 26)', () => {
  it('OIL28, OIL31 — a CANCELLED landed row earns nothing, and `allow` cannot resurrect it', () => {
    const c = claim({ iid: 'cx1', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'g',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 } })
    const row = groundRow(SAT, { prog: 'DUTY', str: '0900', end: '1700', who: 'bane', src: c.iid })
    expect(figure(SAT, 'bane'), 'the claim earns while its row stands').toBe('FO')
    row.cx = true
    expect(figure(SAT, 'bane'), 'the schedule itself says it did not happen').toBeNull()
    /* an allow is permission to count REAL work, never permission to invent it */
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey(c.iid)}`]: 'allow' } }
    expect(figure(SAT, 'bane'), 'allow cannot outrank a cancelled row').toBeNull()
  })

  it('OIL28 — an ⓘ info-only landed row earns nothing either', () => {
    const c = claim({ iid: 'inf1', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'g',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 } })
    const row = groundRow(SAT, { prog: 'DUTY', str: '0900', end: '1700', who: 'bane', src: c.iid })
    row.info = true
    expect(figure(SAT, 'bane'), 'an ⓘ row gives a man nothing, so it earns him nothing').toBeNull()
  })

  it('a landed row DELETED out from under its claim earns nothing', () => {
    const c = claim({ iid: 'gone1', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'g',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 } })
    groundRow(SAT, { prog: 'DUTY', str: '0900', end: '1700', who: 'bane', src: c.iid })
    expect(figure(SAT, 'bane')).toBe('FO')
    DAYS[SAT].ground = (DAYS[SAT].ground || []).filter((g: any) => g.src !== c.iid)
    expect(figure(SAT, 'bane'), 'the row it landed on is gone').toBeNull()
  })

  it('an empty decisions record keys the same as none at all', () => {
    expect(oilDecisionsKey(undefined)).toBe('')
    expect(oilDecisionsKey({} as any)).toBe('')
    expect(oilDecisionsKey({ items: {}, people: {} } as any),
      'present but empty is still "nobody decided anything"').toBe('')
    expect(oilDecisionsKey({ items: {}, people: { 'bane|r:1': 'deny' } } as any)).not.toBe('')
  })

  it('OIL27 — an OIL decision INVALIDATES a real signature, through the signing the app does', () => {
    claim({ iid: 's1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 1 } })
    /* setSign, NOT a direct write to the record: only setSign records what was
       signed FOR, and the whole OIL half of that promise was untested. */
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    setSign(SAT, 'plan', 'stiff'); setSign(SAT, 'appr', 'pump')
    expect(daySigned(SAT), 'signed against the day as it stood').toBe(true)
    setDayApproved(SAT, true)
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey('s1')}`]: 'deny' } }
    expect(daySigned(SAT), 'the OIL decisions changed, so the sign-off no longer covers the day').toBe(false)
  })
})

/* JOB 2 — a request over several days is answered per day, and pays on none of
   them. The claim lands ONE row, on its FIRST day, by design (acceptInput
   refuses a second landing for the same id). oilInputEligible then looked for
   that row on the day being PAID, so every covered day but the first failed.
   Both red teams refused the obvious repair — landing a row on every covered
   day would change how leave, medicals, overseas duty and courses all land —
   so the money reads the request itself, carrying the ONE row's standing
   across every day the request covers. Reproduced in the app 21 Sep 26: Anvil,
   Training Fri 17 → Mon 20, Saturday answered yes, nothing paid anywhere. */
describe('a multi-day request pays on every day it was answered for (job 2)', () => {
  const span = (extra: any = {}) => claim({
    iid: 'mdq', person: 'bane', type: 'Training', date: 'Jul 17', endDate: 'Jul 20',
    allday: false, s: 8 * 60, e: 18 * 60, acc: 'g',
    oil: { '2026-07-18': 1, '2026-07-19': 0 }, ...extra,
  })

  it('the Saturday it was answered YES for pays, and the Sunday it was answered NO for does not', () => {
    span()
    groundRow(4, { prog: 'Training', str: '08:00', end: '18:00', who: 'bane', src: 'mdq' })  // the ONE row, on the Friday
    expect(figure(SAT, 'bane'), 'answered yes for the Saturday').toBe('FO')
    expect(figure(6, 'bane'), 'answered no for the Sunday').toBe(null)
  })

  it("the one row's standing governs every covered day — a CANCELLED anchor pays nothing anywhere", () => {
    span()
    const row = groundRow(4, { prog: 'Training', str: '08:00', end: '18:00', who: 'bane', src: 'mdq' })
    row.cx = true
    expect(figure(SAT, 'bane'), 'the scheduler cancelled the row, so the claim earns nothing').toBe(null)
  })

  it('an INFO-ONLY anchor pays nothing anywhere either', () => {
    span()
    const row = groundRow(4, { prog: 'Training', str: '08:00', end: '18:00', who: 'bane', src: 'mdq' })
    row.info = true
    expect(figure(SAT, 'bane')).toBe(null)
  })

  it('a DORMANT request earns nothing, as it always did', () => {
    span({ acc: 'r' })
    expect(figure(SAT, 'bane')).toBe(null)
  })

  /* The two ways a row can be missing pay OPPOSITE ways, so they must be told
     apart, not lumped together. A row DELETED out from under the claim earns
     nothing (pinned since R-2). A row simply sitting in a week nobody has
     loaded still earns — that is the cross-week half of this very bug. The
     request's FIRST covered day decides it: if that day is in front of us and
     carries no row, the row is gone; if it is not loaded, we just cannot see it. */
  it('a request anchored in a week nobody has loaded still pays its answered days (Codex M1, cross-week)', () => {
    claim({
      iid: 'xweek', person: 'stiff', type: 'Training', date: 'Jul 11', endDate: 'Jul 18',
      allday: false, s: 8 * 60, e: 18 * 60, acc: 'g', oil: { '2026-07-18': 1 },
    })
    /* Jul 11 is the PREVIOUS week — not among the loaded days, so its row
       cannot be seen from here and its absence is not evidence of deletion */
    expect(figure(SAT, 'stiff'), 'the claim stands on its own answer').toBe('FO')
  })

  it('exactly ONE row still lands — the repair must not clone rows onto every covered day', () => {
    span()
    groundRow(4, { prog: 'Training', str: '08:00', end: '18:00', who: 'bane', src: 'mdq' })
    const rows = DAYS.reduce((n: number, d: any) => n + ((d.ground || []).filter((g: any) => g.src === 'mdq').length), 0)
    expect(rows, 'one request, one row').toBe(1)
  })
})

/* JOB 8 — the owner's ruling D18: "for 2 he should earn". A second man the
   scheduler puts on a member's landed request row earns from it, the same as
   the man who filed it. Until now the claim OWNED the row and the schedule half
   skipped every src row, so the second man wore no bar, was inert in the mode,
   and his tooltip said nothing about OIL at all.

   THE MIRROR, which is why this is not simply "stop skipping src rows" (Codex):
   feeding the row through the schedule half would put the REQUESTER through it
   too, where the default is YES — overriding his own No and paying him twice.
   So the row is split. The requester stays in the input half, governed by his
   own answer. The extras are ordinary scheduled work on the same item. */
describe('a second man on a landed request row earns from it (D18, job 8)', () => {
  const landed = (oilAns: any, more: any[] = []) => {
    claim({ iid: 'd18', person: 'bane', type: 'Training', date: 'Jul 18', acc: 'g',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: oilAns } })
    return groundRow(SAT, { prog: 'Training', str: '0900', end: '1700', who: 'bane', src: 'd18', more })
  }

  it('the extra man earns the same as the man who filed it', () => {
    landed(1, ['stiff'])
    expect(figure(SAT, 'bane'), 'the requester, on his own answer').toBe('FO')
    expect(figure(SAT, 'stiff'), 'the second man, on the same row').toBe('FO')
  })

  it("the requester's own No is never overridden by the split — but the extra still earns", () => {
    landed(0, ['stiff'])
    expect(figure(SAT, 'bane'), 'he said No for himself and that stands').toBe(null)
    expect(figure(SAT, 'stiff'), 'the scheduler put him there; it is ordinary work').toBe('FO')
  })

  it('the requester is not paid TWICE — he is in the input half only', () => {
    landed(1, ['stiff'])
    const ev = oilEvidence(SAT)
    const work = oilEarnedWork(DAYS[SAT], ev)
    expect((work['bane'] || []).length, 'one span, not one per half').toBe(1)
  })

  it('a scheduler can take the extra man off without touching the requester', () => {
    landed(1, ['stiff'])
    DAYS[SAT].oild = { people: { [`stiff|${inputItemKey('d18')}`]: 'deny' } }
    expect(figure(SAT, 'stiff')).toBe(null)
    expect(figure(SAT, 'bane'), 'untouched').toBe('FO')
  })

  it('a CANCELLED or info-only row pays neither of them', () => {
    const row = landed(1, ['stiff'])
    row.cx = true
    expect(figure(SAT, 'bane')).toBe(null)
    expect(figure(SAT, 'stiff')).toBe(null)
  })

  it('an ALL-DAY request pays the extra man too — the row carries no times (Fable M6)', () => {
    claim({ iid: 'd18b', person: 'bane', type: 'Training', date: 'Jul 18', acc: 'g',
      allday: true, s: 0, e: 1439, oil: { [SAT_ISO]: 1 } })
    groundRow(SAT, { prog: 'Training', str: '', end: '', who: 'bane', src: 'd18b', more: ['stiff'] })
    expect(figure(SAT, 'bane')).toBe('FO')
    expect(figure(SAT, 'stiff'), 'the claim carries the window, not the row').toBe('FO')
  })
})

/* FABLE F3 (22 Sep 26) — does a frozen block written BEFORE `stand` existed
   now key differently from an unchanged live day? If so, every published
   weekend carrying a claim reports a change nobody made, which is the §9 shape
   again and this time genuinely manufactured. */
describe('F3 — an older frozen block must not manufacture a pending amendment', () => {
  it('a published day whose issued block predates `stand` still reads as unchanged', () => {
    claim({ iid: 'old1', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'g',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 } })
    groundRow(SAT, { prog: 'DUTY', str: '0900', end: '1700', who: 'bane', src: 'old1' })
    publish(SAT)
    expect(dayHasChanges(SAT), 'freshly published, nothing pending').toBe(false)

    /* age the issued block: strip the field the old build never wrote */
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    for (const i of snap.d.oilev.inputs) delete i.stand

    expect(dayHasChanges(SAT), 'nothing underneath changed, so nothing may be pending').toBe(false)
  })
})

/* CODEX RANK 1 (22 Sep 26) — and it refutes the reasoning in 195943e. That
   commit repaired the KEY for blocks written before `stand` existed, and
   claimed `acc:'g'` meant "landed and paying". It did not: the old reader
   explicitly rejected a cancelled or info-only row. So the money reader was
   left testing `undefined !== 'cx'` and answering YES — an already-issued day
   whose row was cancelled would start PAYING, with no amendment and the frozen
   schedule still saying the work did not happen. Money out of nowhere on a
   published record, which is worse than the phantom it replaced. */
describe('an issued block written before `stand` must not start paying (Codex rank 1)', () => {
  const published = (mark: 'cx' | 'info') => {
    claim({ iid: 'leg1', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'g',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 } })
    const row = groundRow(SAT, { prog: 'DUTY', str: '0900', end: '1700', who: 'bane', src: 'leg1' })
    ;(row as any)[mark] = true
    publish(SAT)
    /* age the issued block the way a schema-v5 book really is */
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    for (const i of snap.d.oilev.inputs) delete i.stand
  }

  it('a CANCELLED row on an issued day still pays nothing', () => {
    published('cx')
    expect(figure(SAT, 'bane'), 'the frozen schedule says the work did not happen').toBe(null)
  })

  it('an INFO-ONLY row on an issued day still pays nothing', () => {
    published('info')
    expect(figure(SAT, 'bane')).toBe(null)
  })

  it('and a LIVE row on an issued day still pays, so the guard has not gone too far', () => {
    claim({ iid: 'leg2', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'g',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 } })
    groundRow(SAT, { prog: 'DUTY', str: '0900', end: '1700', who: 'bane', src: 'leg2' })
    publish(SAT)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    for (const i of snap.d.oilev.inputs) delete i.stand
    expect(figure(SAT, 'bane')).toBe('FO')
  })
})
