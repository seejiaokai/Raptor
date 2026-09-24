/* [OIL-SEATS-CAN-EARN] STEP 9b — a changed crowd on a published day raises the
   pending mark, and never takes a signature down with it.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §4 (D44,
   D45), §5 step 9.

   D44 — who was behind a puck is FROZEN at publication on EVERY day, earning or
   not. The issued version keeps the people it went out with; the working copy
   shows the live answer; the DIFFERENCE raises the ordinary pending mark, and
   the scheduler amends or publishes the end-of-day version.

   THE OWNER OVERRULED THIS BUILD'S FIRST ANSWER, and the fact that settled it is
   one the code could not supply. The build had argued for "live on a day that
   earns nothing", reasoning that a pending mark for a number owing nobody
   anything would devalue a mark that does carry money. He knows the squadron
   reviews every change at the close of the day and issues an end-of-day version
   as the record of what actually happened — so that mark is the signal their
   process runs on, not noise, and a change in who was available IS something
   that happened.

   D45 — A CHANGE IN AVAILABILITY NEVER INVALIDATES A SIGNATURE. The pending mark
   is the whole mechanism. This is a standing test, in the owner's own words:
   nothing on a published schedule may change without the scheduler acknowledging
   it — and a man filing leave is not the scheduler changing his mind about what
   he approved.

   SO THERE ARE TWO PROJECTIONS OF ONE BLOCK, NOT ONE (OSE-T-03, and it was
   executable rather than cosmetic: the key a signature binds to already carried
   membership, so an availability-only change would have taken down a signature
   the owner said it must not). The publication comparison carries membership on
   every day; the signature projection leaves it out while still catching a
   changed OIL decision, a changed answer, or anything else approval-relevant.

   AND AN ALREADY-PUBLISHED DAY MUST NOT LIGHT UP THE MOMENT THIS SHIPS. A block
   frozen before membership was kept recorded none on a non-earning day, and
   reading that absence as "the crowd changed" would offer an amendment nobody
   made — the manufactured-amendment shape this branch has already met three
   times. Such a day is compared on everything except its membership. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import {
  SCHED, setSign, setDayApproved, dayHasChanges, dayCurVer, daySnapOf, daySigned,
} from './publish'
import { validate } from './validate'
import { ensureRowIds } from './rowids'
import { rowItemKey } from './oil'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, TUE = 1
const SAT_ISO = '2026-07-18', TUE_ISO = '2026-07-14'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const CROWD = ['bane', 'stiff', 'plasma']

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  for (const di of [SAT, TUE]) {
    Object.assign(DAYS[di] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  }
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

const puckRow = (di: number, who = 'allavail') => {
  ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who }]
  ensureRowIds(DAYS)
  return rowItemKey((DAYS[di] as any).ground[0].rid)
}
/* signed through the sanctioned write path, so each role carries a real binding
   — a hand-written signOf leaves none and proves nothing about D45 */
const ROLES = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
/* THE REAL SEQUENCE, because D45 is about the second signature, not the first.
   A day is signed, published — and publishing SPENDS that signature (`signClear`
   inside setDayApproved: it went out, the promise is kept). The signature D45
   protects is the one on the WORKING COPY afterwards: the scheduler signing the
   day as it stands for the next issue. If a man filing leave took THAT down, he
   would be re-signing for something he did not change. Signed through setSign,
   never a hand-written record — only setSign stores what was signed FOR. */
const signAndPublish = (di: number) => {
  for (const [role, who] of ROLES) setSign(di, role, who)
  setDayApproved(di, true)
  for (const [role, who] of ROLES) setSign(di, role, who)
}
const allSigned = (di: number) => daySigned(di)

describe('D44 — a changed crowd on a published day raises the pending mark', () => {
  it('ON A WEEKDAY, which is the half that did not exist before (AM42)', () => {
    puckRow(TUE)
    signAndPublish(TUE)
    expect(dayHasChanges(TUE), 'freshly published, nothing pending').toBe(false)
    HOOKS.oilSentinel = () => ['bane']                     // two of them file leave
    expect(dayHasChanges(TUE), 'the crowd behind the puck is not what it went out with').toBe(true)
  })

  it('and on a WEEKEND, exactly as it always did', () => {
    puckRow(SAT)
    signAndPublish(SAT)
    expect(dayHasChanges(SAT)).toBe(false)
    HOOKS.oilSentinel = () => ['bane']
    expect(dayHasChanges(SAT)).toBe(true)
  })

  it('the issued day itself never moves — it is the record', () => {
    const item = puckRow(TUE)
    signAndPublish(TUE)
    HOOKS.oilSentinel = () => ['bane']
    const snap: any = daySnapOf(TUE, dayCurVer(TUE))
    expect(snap.d.oilev.sent[item], 'the men it was issued with').toEqual(CROWD)
  })

  it('THE CONTROL: a day with no puck on it stays quiet whatever availability does', () => {
    puckRow(TUE, 'bane')
    signAndPublish(TUE)
    HOOKS.oilSentinel = () => []
    expect(dayHasChanges(TUE), 'nothing on this day depends on who is free').toBe(false)
  })
})

describe('D45 — but it NEVER takes a signature down with it', () => {
  it('a man files leave and every signature still stands (AM13)', () => {
    puckRow(TUE)
    signAndPublish(TUE)
    expect(allSigned(TUE), 'signed before anything moved').toBe(true)
    HOOKS.oilSentinel = () => ['bane']
    expect(dayHasChanges(TUE), 'the change is acknowledged through the pending mark').toBe(true)
    expect(allSigned(TUE), 'and not by tearing up what he approved').toBe(true)
  })

  it('the same on a weekend, where the crowd is money', () => {
    puckRow(SAT)
    signAndPublish(SAT)
    HOOKS.oilSentinel = () => ['bane']
    expect(allSigned(SAT), 'a change in availability is not a change of mind').toBe(true)
  })

  it('THE CONTROL: a changed OIL DECISION still does take the signature down', () => {
    const item = puckRow(SAT)
    signAndPublish(SAT)
    expect(allSigned(SAT)).toBe(true)
    ;(DAYS[SAT] as any).oild = { items: { [item]: 0 } }    // the scheduler switches the row off
    expect(allSigned(SAT), 'that IS a change of mind about what he approved').toBe(false)
  })
})

describe('an already-published day must not light up the moment this ships', () => {
  it('a weekday whose block predates the record reads as unchanged', () => {
    puckRow(TUE)
    signAndPublish(TUE)
    /* age the issued block the way the real ones are aged: strip the field the
       old build never wrote, and the membership it never recorded */
    const snap: any = daySnapOf(TUE, dayCurVer(TUE))
    delete snap.d.oilev.mem
    snap.d.oilev.sent = {}
    expect(dayHasChanges(TUE), 'nobody made a change, so none may be offered').toBe(false)
  })

  it('and its signatures are untouched as well', () => {
    puckRow(TUE)
    signAndPublish(TUE)
    const snap: any = daySnapOf(TUE, dayCurVer(TUE))
    delete snap.d.oilev.mem
    snap.d.oilev.sent = {}
    expect(allSigned(TUE)).toBe(true)
  })

  it('an older WEEKEND block still compares on the membership it did record', () => {
    /* earning days have carried membership all along — that signal is real and
       must not be thrown away with the ones that were never written */
    const item = puckRow(SAT)
    signAndPublish(SAT)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    delete snap.d.oilev.mem
    expect(dayHasChanges(SAT), 'unchanged is unchanged').toBe(false)
    snap.d.oilev.sent[item] = ['bane']                     // it went out with somebody else
    expect(dayHasChanges(SAT), 'and a real difference still shows').toBe(true)
  })
})

/* THE KEY'S OWN CONTENT — WRITTEN 22 Sep 26, AFTER A BREAK TEST PROVED THE AXIS
   WAS PINNED AND THE KEY WAS NOT (the walk, docs/handpass/2026-09-22-oil-seats.md §8).
   Putting membership back into the signature's key — the exact D45 regression
   this file exists to prevent — left 1,914 tests green. The tests above pass
   either way, because on their fixture the two projections happen to agree: the
   men behind the puck do not move between the signature and the read.
   So the rule was watched at one remove, through a behaviour that a fixture can
   satisfy by accident. These watch the key itself. They are cheap, they cannot
   pass by luck, and they name the one thing a future edit must not do. */
describe('the signature\'s key does not CARRY the crowd, whatever the fixture does', () => {
  it('the same day, two different crowds, ONE signature key', async () => {
    const { oilEvidence, oilSignKey } = await import('./oilev')
    puckRow(SAT)
    const a = oilSignKey(oilEvidence(SAT), DAYS[SAT])
    expect(a, 'the day earns, so it has a key at all').toBeTruthy()
    HOOKS.oilSentinel = () => ['bane']                       // three men file leave
    const b = oilSignKey(oilEvidence(SAT), DAYS[SAT])
    expect(b, 'a change in who is available is not a change of mind about the schedule').toBe(a)
  })

  it('and the crowd is not hiding inside it under another name', async () => {
    const { oilEvidence, oilSignKey } = await import('./oilev')
    puckRow(SAT)
    /* a decision on the row, so the key is NOT empty and the check has something
       to bite on — an empty string would pass "does not contain" for free */
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${rowItemKey((DAYS[SAT] as any).ground[0].rid)}`]: 'deny' } }
    const key = oilSignKey(oilEvidence(SAT), DAYS[SAT])
    expect(key.length, 'there is a real key to inspect').toBeGreaterThan('2026-07-18||'.length)
    for (const man of ['bane', 'stiff'])
      expect(key, `${man} is only in the crowd, so he must not appear in what a signature binds to`).not.toContain(man)
    expect(key, 'a man the SCHEDULER decided about is a different matter — that is approval').toContain('plasma')
  })

  it('THE CONTROL: the PUBLICATION key does carry it, or the pending mark could not exist', async () => {
    const { oilEvidence, oilEvidenceKey } = await import('./oilev')
    puckRow(SAT)
    const a = oilEvidenceKey(oilEvidence(SAT), DAYS[SAT])
    HOOKS.oilSentinel = () => ['bane']
    expect(oilEvidenceKey(oilEvidence(SAT), DAYS[SAT]),
      'the two projections are different questions and must give different answers').not.toBe(a)
  })

  it('THE CONTROL: everything else about the block still moves the signature key', async () => {
    const { oilEvidence, oilSignKey } = await import('./oilev')
    const item = puckRow(SAT)
    const a = oilSignKey(oilEvidence(SAT), DAYS[SAT])
    ;(DAYS[SAT] as any).oild = { items: { [item]: 0 } }      // the scheduler stops the row earning
    expect(oilSignKey(oilEvidence(SAT), DAYS[SAT]),
      'that IS a change of mind about what was approved').not.toBe(a)
  })

  it('a day that earns nobody anything binds a signature to no OIL key at all', async () => {
    const { oilEvidence, oilSignKey } = await import('./oilev')
    puckRow(TUE)
    expect(oilSignKey(oilEvidence(TUE), DAYS[TUE]), 'a weekday has no money to promise').toBe('')
    HOOKS.oilSentinel = () => ['bane']
    expect(oilSignKey(oilEvidence(TUE), DAYS[TUE]), 'and a changed crowd leaves it at nothing').toBe('')
  })
})

/* AN ISSUED DAY THAT WAS WRITTEN BEFORE THESE SEATS WERE COUNTED SAYS SO
   (owner, 22 Sep 26 — "ok fix this first", of the one thing that was untidy
   either way).

   WHAT HE WOULD HAVE SEEN. A Sunday published weeks ago with ALL AVAIL on the
   SUN DESK. The day says "1 pending" and offers Publish AL1. Tap to see what
   changed: nothing is marked and History is empty — the difference is worked
   out, not recorded, so there is no cell to mark. And beside the puck the count
   chip reads "?", because the block that went out never wrote down who was
   behind it. Something changed · I cannot show you what · and the one place you
   would look was never written down.

   THE SAME BLANK READ TWO WAYS. `oilSentOf` treats an absence in a block with no
   `mem` flag as UNKNOWN and says so on the chip; `oilDelta` compares an older
   EARNING block on membership anyway, so it reads the same absence as NOBODY and
   reports a change. One of them has to speak for the other, and the one that
   knows least was the one staying quiet.

   This does not decide whether the day should raise the mark at all — that is
   the owner's open question. It makes the day SAY what it actually knows, which
   is what he would want under either answer. Same idiom as OIL_STALE_DAY, which
   exists for the other way a published day's money moves under it. */
describe('a day issued before these seats were counted says so, instead of a bare "1 pending"', () => {
  const oldIssuedDeskDay = () => {
    const item = puckRow(SAT)
    ;(DAYS[SAT] as any).ground = []
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SUN DESK', str: '0800', end: '1800', id: 'allavail' }] }]
    ensureRowIds(DAYS)
    const deskItem = rowItemKey((DAYS[SAT] as any).dutywaves[0].rows[0].rid)
    signAndPublish(SAT)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    /* rewind the frozen block to what the PREVIOUS build wrote: it earns, it
       carries no `mem` flag, and its walk never reached a duty desk */
    delete snap.d.oilev.mem
    delete snap.d.oilev.sent[deskItem]
    void item
    return deskItem
  }
  const advOn = (di: number, code: string) =>
    (validate().byDay[di]?.warns ?? []).filter((w: any) => w.code === code)

  it('the day names the reason, so he is not republishing blind', () => {
    oldIssuedDeskDay()
    const w = advOn(SAT, 'OIL_OLD_BLOCK')
    expect(w, 'exactly one, on the day').toHaveLength(1)
    expect(w[0].sev, 'a prompt, not a refusal').toBe('adv')
    expect(w[0].msg, 'it says the page predates the record')
      .toMatch(/issued before|before the app/i)
    expect(w[0].msg, 'and what publishing again will do').toMatch(/publish/i)
  })

  it('THE CONTROL: a day issued WITH the record says nothing', () => {
    puckRow(SAT)
    signAndPublish(SAT)
    expect(advOn(SAT, 'OIL_OLD_BLOCK'), 'its block knows who was behind the puck').toHaveLength(0)
  })

  it('THE CONTROL: an unpublished day says nothing — it has no issued page to be stale', () => {
    puckRow(SAT)
    expect(advOn(SAT, 'OIL_OLD_BLOCK')).toHaveLength(0)
  })

  it('THE CONTROL: an old block with NO puck on the day says nothing', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' }]
    ensureRowIds(DAYS)
    signAndPublish(SAT)
    const snap: any = daySnapOf(SAT, dayCurVer(SAT))
    delete snap.d.oilev.mem
    expect(advOn(SAT, 'OIL_OLD_BLOCK'), 'nothing was ever behind anything here').toHaveLength(0)
  })
})
