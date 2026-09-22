/* [OIL-SEATS-CAN-EARN] STEP 3 — the default rides the SPAN, and ONE body
   answers it for the screen and for the money.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §4, §5 step 3.

   WHY THE DEFAULT CANNOT RIDE THE ITEM (Codex OSE-01 and Fable M3, found from
   opposite directions, which is why the plan treats it as certain). One `item`
   is stamped per ROW and every occupant takes it: a duty row's named man and an
   ALL AVAIL in its extras share one address, and an SC formation's MAIN and
   SPARE seats share one address. So "default this item off" would either strip
   the named man of what he earns today or pay the placeholder with no override.
   There is no item-level way to give two occupants of one row different
   defaults. The default therefore belongs to the SPAN — per person, per piece
   of work — which is the only thing that is not shared.

   AND THE SCREEN AND THE MONEY MUST READ THE SAME BODY (Fable R2-1 and Codex
   OSE-R2-01 — again both reviewers, opposite ends, one defect). The first
   rewrite changed the MONEY's default and left the MODE's, which returns true
   with no claim. Traced through: a default-off man would draw GLOWING while the
   money paid him nothing, and his tap would write `deny` for a credit he never
   had — making `allow` unreachable, so D24's only door would not exist.
   `spanDefault` is that one body.

   WHAT IS NOT PROVED HERE, and where it is: nothing on a real day carries a
   FALSE default yet. The four exempt kinds — SC SPARE, AVALON lines, AVALON
   desks, BB lines — are still skipped before the walk reaches them, so step 3
   stamps a predicate that cannot fire. Step 4 lifts those skips, and the
   end-to-end default-off pins (a spare drawn dim, the item switched ON, the
   fifth OFF wording) land there. This file proves the ALGEBRA and the one-body
   property, which is what step 3 is for. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { dayOilWork, rowItemKey, type OilWork } from './oil'
import {
  oilEvidence, oilEarnedWork, earnsFrom, spanDefault, itemState, itemMark, itemMasked,
  type OilEvidence,
} from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff']
})
const restore = () => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel }

const ev = (d: Partial<OilEvidence> = {}): OilEvidence =>
  ({ iso: SAT_ISO, earns: true, d: {}, inputs: [], sent: {}, ...d } as OilEvidence)

describe('the decision algebra, with the span default underneath it', () => {
  it('an explicit OFF on the item beats everything, including the span and the man', () => {
    const e = ev({ d: { items: { 'r:x': 0 }, people: { 'bane|r:x': 'allow' } } })
    expect(earnsFrom(e, 'bane', 'r:x', true), 'a switched-off item pays nobody').toBe(false)
    expect(earnsFrom(e, 'bane', 'r:x', false)).toBe(false)
  })

  it('the day blanket beats the item mark, the man and the span', () => {
    const e = ev({ d: { blanket: 1, items: { 'r:x': 1 }, people: { 'bane|r:x': 'allow' } } })
    expect(earnsFrom(e, 'bane', 'r:x', true)).toBe(false)
  })

  it('a decision about the MAN outranks the item being forced on, and the span', () => {
    const on = ev({ d: { items: { 'r:x': 1 }, people: { 'bane|r:x': 'deny' } } })
    expect(earnsFrom(on, 'bane', 'r:x', true), 'taken off a line forced on').toBe(false)
    const off = ev({ d: { people: { 'bane|r:x': 'allow' } } })
    expect(earnsFrom(off, 'bane', 'r:x', false), 'credited on a seat that earns nothing by default').toBe(true)
  })

  it('an item forced ON overrides a span that would default off — D24\'s switch', () => {
    const e = ev({ d: { items: { 'r:x': 1 } } })
    expect(earnsFrom(e, 'bane', 'r:x', false), 'the whole line is switched on').toBe(true)
  })

  it('with no mark and no decision, the SPAN\'s own default decides', () => {
    const e = ev()
    expect(earnsFrom(e, 'bane', 'r:x', true)).toBe(true)
    expect(earnsFrom(e, 'bane', 'r:x', false)).toBe(false)
  })
})

describe('every span carries its own default (§4)', () => {
  it('ordinary schedule work defaults ON — nothing that earns today stops', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' }]
    ensureRowIds(DAYS)
    const work = dayOilWork(DAYS[SAT], { expandAll: () => [] })
    expect(work.bane.length).toBeGreaterThan(0)
    expect(work.bane.every((w: OilWork) => w.dflt === true), 'D28 — nothing earns less than it does today').toBe(true)
  })

  it('people a PLACEHOLDER expands to inherit the seat\'s default, not one of their own (D43)', () => {
    /* stripped to ONE row so the crowd can be named exactly: the seed Saturday
       carries flying, duty and sim work of its own */
    Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, allhands: [], ground: [] })
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'allavail' }]
    ensureRowIds(DAYS)
    const work = dayOilWork(DAYS[SAT], { expandAll: () => ['bane', 'stiff'] })
    expect(Object.keys(work).sort(), 'the crowd is credited like named men').toEqual(['bane', 'stiff'])
    expect(work.bane[0].dflt, 'and on the same footing as a typed name').toBe(true)
  })
})

describe('ONE BODY behind the screen and the money (Fable R2-1 / Codex OSE-R2-01)', () => {
  it('spanDefault answers off the span the money will actually use', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' }]
    ensureRowIds(DAYS)
    const item = rowItemKey((DAYS[SAT] as any).ground[0].rid)
    const e = oilEvidence(SAT)
    expect(spanDefault(DAYS[SAT], e, 'bane', item)).toBe(true)
  })

  it('a CLAIM\'s default is the member\'s own answer, not the schedule\'s yes (§2.2)', () => {
    INPUTS.unshift({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', allday: true,
      s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, oil: { [SAT_ISO]: 0 } } as any)
    const e = oilEvidence(SAT)
    expect(spanDefault(DAYS[SAT], e, 'bane', 'i:c1'), 'he answered No, so No is the default').toBe(false)
    ;(INPUTS[0] as any).oil = { [SAT_ISO]: 1 }
    const e2 = oilEvidence(SAT)
    expect(spanDefault(DAYS[SAT], e2, 'bane', 'i:c1'), 'and Yes when he said Yes').toBe(true)
  })

  it('THE PROPERTY: for every man on every item, the money pays exactly what the default says', () => {
    /* the guard against the half-migration both reviewers found. It walks the
       real day rather than one fixture, so a seat whose default and whose
       payment disagree cannot hide behind a case nobody wrote a test for. */
    ;(DAYS[SAT] as any).ground = [
      { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' },
      { prog: 'MORNING BRIEF', str: '0700', end: '0800', who: 'allavail' },
    ]
    ensureRowIds(DAYS)
    const e = oilEvidence(SAT)
    const paid = oilEarnedWork(DAYS[SAT], e)
    const work = dayOilWork(DAYS[SAT], { expandAll: (_w, it) => (it && e.sent[it]) || [] })
    let checked = 0
    for (const person of Object.keys(work)) {
      for (const w of work[person]) {
        const item = String(w.item || '')
        const should = earnsFrom(e, person, item, spanDefault(DAYS[SAT], e, person, item))
        const did = (paid[person] || []).some(x => String(x.item || '') === item)
        expect(did, `${person} on ${item}: screen says ${should}, money says ${did}`).toBe(should)
        checked++
      }
    }
    expect(checked, 'the walk actually found work to check').toBeGreaterThan(0)
    restore()
  })
})

describe('itemState — on, off, or MIXED, because one SC shift holds both', () => {
  it('an ordinary item reads ON, and its own mark overrides that either way', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' }]
    ensureRowIds(DAYS)
    const item = rowItemKey((DAYS[SAT] as any).ground[0].rid)
    expect(itemState(DAYS[SAT], oilEvidence(SAT), item)).toBe('on')
    ;(DAYS[SAT] as any).oild = { items: { [item]: 0 } }
    expect(itemState(DAYS[SAT], oilEvidence(SAT), item), 'switched off by hand').toBe('off')
    ;(DAYS[SAT] as any).oild = { items: { [item]: 1 } }
    expect(itemState(DAYS[SAT], oilEvidence(SAT), item), 'switched on by hand').toBe('on')
  })

  it('an item nobody is on yet still reads ON — put a man there and he earns', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: '' }]
    ensureRowIds(DAYS)
    const item = rowItemKey((DAYS[SAT] as any).ground[0].rid)
    expect(itemState(DAYS[SAT], oilEvidence(SAT), item)).toBe('on')
  })
})

describe('the mark is readable in three states, and nothing writes the 1 yet', () => {
  it('unset, 0 and 1 are told apart', () => {
    expect(itemMark(ev(), 'r:x')).toBeUndefined()
    expect(itemMark(ev({ d: { items: { 'r:x': 0 } } }), 'r:x')).toBe(0)
    expect(itemMark(ev({ d: { items: { 'r:x': 1 } } }), 'r:x')).toBe(1)
  })

  it('a 1 is NOT masked — the four guards must read it as live', () => {
    /* Fable R2-2: six callers treat the guard as a boolean and `!undefined` is
       true, so a single three-valued function would have sent every puck inert
       and made every item tap report the item masked. */
    expect(itemMasked(ev({ d: { items: { 'r:x': 1 } } }), 'r:x')).toBe(false)
    expect(itemMasked(ev({ d: { items: { 'r:x': 0 } } }), 'r:x')).toBe(true)
    expect(itemMasked(ev(), 'r:x')).toBe(false)
  })
})
