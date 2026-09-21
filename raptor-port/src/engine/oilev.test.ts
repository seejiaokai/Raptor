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
import { SCHED, daySnap, dayDelta, dayHasChanges, dayApproved, setDayApproved, publishALDay, signOf, dayCurVer, daySnapOf, currentBind, diffCounts, dayDiscardCount } from './publish'
import { ensureRowIds } from './rowids'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, oilEvidenceKey, oilWouldEarn, inputItemKey, rowItemKey, groundItemKey } from './oilev'
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
  it('a live day stores only the decisions — never the projection', () => {
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 1 } })
    const ev = oilEvidence(SAT)
    expect(ev.earns).toBe(true)
    expect(ev.inputs.map(i => i.iid)).toContain('c1')
    expect((DAYS[SAT] as any).oilev, 'nothing derived is stored on the working copy').toBeUndefined()
  })

  it('publishing freezes the whole block onto the issued snapshot', () => {
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 1 } })
    publish(SAT)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    expect(snap.d.oilev.earns).toBe(true)
    expect(snap.d.oilev.inputs.find((i: any) => i.iid === 'c1').ans).toBe(1)
    expect((DAYS[SAT] as any).oilev, 'the working copy still stores nothing derived').toBeUndefined()
  })

  it('a weekday carries no block at all, so the five ordinary days are untouched', () => {
    expect(oilEvidence(1).earns).toBe(false)
    expect(oilEvidenceKey(oilEvidence(1))).toBe('')
    expect(dayDelta(1)).toEqual([])
  })

  it('the issued block answers, not the live inputs — a member edit moves nothing', () => {
    const c = claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', allday: false, s: 480, e: 720, oil: { [SAT_ISO]: 0.5 } })
    publish(SAT)
    expect(figure(SAT, 'bane')).toBe('HO')
    c.s = 480; c.e = 1080                            // he re-times it to a nine-hour day
    expect(figure(SAT, 'bane'), 'the issued document still says four hours').toBe('HO')
  })
})

describe('an OIL-only edit is PUBLISHABLE (§7.2, §9.2)', () => {
  it('marking an item on a published day produces a delta, one amendment item, and clears the signature', () => {
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

  it('an ANSWER-ONLY change on a published day is publishable too — even for OD, which has no row', () => {
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

  it('a decision-only divergence counts as an edit a recovery would discard', () => {
    const g = groundRow(SAT, { prog: 'BRIEF', str: '0800', end: '0900', who: 'bane' })
    publish(SAT)
    expect(dayDiscardCount(SAT)).toBe(0)
    ;(DAYS[SAT] as any).oild = { items: { [rowItemKey(g.rid)]: 0 } }
    expect(dayDiscardCount(SAT)).toBe(1)
  })
})

describe('the three states, and what cannot be overridden (§9.1)', () => {
  it('the member has the first word on his own claim, and the admin can say YES over his NO', () => {
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 0 } })   // he says no
    publish(SAT)
    expect(figure(SAT, 'bane'), 'his own No stands').toBe(null)
    /* the admin allows it — this is the override §2.2 promised and the block as
       first written could not express */
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey('c1')}`]: 'allow' } }
    sign(SAT); publishALDay(SAT)
    expect(figure(SAT, 'bane')).toBe('FO')
  })

  it('the member\'s own answer is never overwritten — lift the override and his word comes back', () => {
    const c = claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT_ISO]: 0 } })
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey('c1')}`]: 'allow' } }
    publish(SAT)
    expect(c.oil).toEqual({ [SAT_ISO]: 0 })
    delete (DAYS[SAT] as any).oild
    sign(SAT); publishALDay(SAT)
    expect(figure(SAT, 'bane'), 'back to his No').toBe(null)
  })

  it('an ALLOW is permission to count real work, never permission to invent it', () => {
    /* a dormant claim, and a row with no times: neither can be allowed into money */
    claim({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'r', oil: { [SAT_ISO]: 1 } })
    const g = groundRow(SAT, { prog: 'NO TIMES', str: '', end: '', who: 'stiff' })
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${inputItemKey('c1')}`]: 'allow', [`stiff|${rowItemKey(g.rid)}`]: 'allow' } }
    publish(SAT)
    expect(figure(SAT, 'bane'), 'the scheduler took the commitment off the programme').toBe(null)
    expect(figure(SAT, 'stiff'), 'money must not come from a guess').toBe(null)
  })

  it('a DENY takes one man off ONE event and leaves his others alone', () => {
    const a = groundRow(SAT, { prog: 'MORNING', str: '0700', end: '0800', who: 'bane' })
    const b = groundRow(SAT, { prog: 'ALL DAY', str: '0900', end: '1700', who: 'bane' })
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${rowItemKey(b.rid)}`]: 'deny' } }
    publish(SAT)
    expect(figure(SAT, 'bane'), 'only his hour is left').toBe('HO')
    expect(a && b).toBeTruthy()
  })
})

describe('the day blanket MASKS, it does not delete (§2.1 item 7)', () => {
  it('everything stops earning, and every mark underneath comes back when it is lifted', () => {
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

  it('it covers a row added AFTER it was set — it is a fact about the day, not a stamp on the rows', () => {
    ;(DAYS[SAT] as any).oild = { blanket: 1 }
    groundRow(SAT, { prog: 'ADDED LATER', str: '0800', end: '1700', who: 'bane' })
    publish(SAT)
    expect(figure(SAT, 'bane')).toBe(null)
  })
})

describe('the sentinel membership is frozen at publication (§7.3)', () => {
  it('who an ALL AVAIL puck stood for cannot change under the reader', () => {
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
  it('a ground row from an accepted input is addressed by the INPUT, not the row', () => {
    const g = groundRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'c1' })
    expect(groundItemKey(g)).toBe(inputItemKey('c1'))
    expect(groundItemKey({ rid: 'r9' })).toBe(rowItemKey('r9'))
  })
})

describe('the publish reminder asks the right question (§2.3)', () => {
  it('speaks only where there is money waiting on a publication', () => {
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
