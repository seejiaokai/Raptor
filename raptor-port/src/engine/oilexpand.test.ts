/* [OIL-SEATS-CAN-EARN] STEP 5 — the placeholder expands EVERYWHERE it can land.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 5,
   and §6's fourth freeze hole.

   THE OWNER'S SUNDAY DESK. He put ALL AVAIL on a duty desk, published the day,
   and nobody earned a thing. The reason is one helper: `put` resolves an id and
   drops anything that is not a person, so a placeholder sitting on a duty desk,
   a sim seat, a sim passenger line or any extras line counted for nobody and
   said nothing. Only the ground row's and the Common Programme's PRIMARY seats
   went through `putWho`, which expands. That is plan §3 F3, confirmed by both
   reviewers.

   WHICH SEATS, EXACTLY (plan C3 — "not any row"). Flying keys take no extras
   line and the Common Programme's extras are its `who` list, so the seats that
   actually lose a placeholder are: ground `more`, duty `id` and `more`, sim
   `p`/`w`/`pax`/`more`. The Common Programme's own `more` array is included
   here because the engine already treats it as tasked work everywhere else
   (engine/events.ts reads it for busy) and the `who` beside it expands —
   leaving it as the one extras line that silently drops a placeholder would be
   a hole with no reason behind it.

   THE FLYING BRANCH MUST NOT EXPAND, and that is not a detail. D33 refuses a
   placeholder in a cockpit, but data can arrive by copy — a captured day
   template or a parked plan bypasses both doors — so the money keeps its own
   belt. And D36: the flying window is report→debrief, three hours wider each
   side than availability, so handing it to the expander would gather men the
   squadron deliberately schedules around. Pinned here and in
   `oilseat-refusal.test.ts`.

   AND A ROW WITH NO ID YET EXPANDS FOR NOBODY (plan §6, Fable R2-8). The frozen
   membership is written per ITEM — `if (item) sent[item] = people` — so a row
   with no id has nowhere to freeze its crowd. Before this step such a row drew
   a crowd in the mode and paid nobody through the evidence: the screen and the
   money disagreeing, which is the shape this whole change exists to end. Every
   painted row is minted an id by the mutation, load, publish and draft paths
   alike, so this closes by construction — and is pinned rather than left as a
   claim. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { dayOilWork, rowItemKey, groundItemKey } from './oil'
import { makeStandalone } from './waves'
import { oilEvidence, oilEarnedWork } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
/* the crowd the placeholder stands for, named so every assertion below can say
   WHO it expected rather than counting */
const CROWD = ['bane', 'stiff']

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}
  /* stripped and rebuilt row by row: the seed Saturday already carries flying,
     duty and sim work, and "nobody earns" would pass on its back */
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

/* the raw walk, with a live expander — what the MODE sees */
const work = (spy?: (win: [number, number], item: string) => void) =>
  dayOilWork(DAYS[SAT], { expandAll: (win, item) => { if (spy) spy(win, item); return CROWD.slice() } })
/* the MONEY, which resolves every placeholder against the day's own frozen
   membership — so it proves the freeze wrote the crowd down as well */
const paid = () => oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
const namesIn = (got: Record<string, any>) => Object.keys(got).sort()

describe('the seats that lost a placeholder now expand (plan §3 F3, C3)', () => {
  it('A DUTY DESK — the owner\'s Sunday desk, in the seat itself', () => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'allavail', str: '0700', end: '1900' }] }]
    ensureRowIds(DAYS)
    expect(namesIn(work()), 'the crowd is on the desk').toEqual(CROWD)
    expect(namesIn(paid()), 'and the day pays them').toEqual(CROWD)
  })

  it('A DUTY DESK\'s extras line', () => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'rocky', str: '0700', end: '1900', more: ['allavail'] }] }]
    ensureRowIds(DAYS)
    expect(namesIn(paid()), 'the named man AND the crowd under him').toEqual(['bane', 'rocky', 'stiff'])
  })

  for (const seat of ['p', 'w']) {
    it(`A SIM SEAT — ${seat}`, () => {
      ;(DAYS[SAT] as any).sims = { amt: [{ str: '1300', end: '1500', p: '', w: '', [seat]: 'allavail' }] }
      ensureRowIds(DAYS)
      expect(namesIn(paid())).toEqual(CROWD)
    })
  }

  it('A SIM\'s passengers', () => {
    ;(DAYS[SAT] as any).sims = { amt: [{ str: '1300', end: '1500', p: 'rocky', w: '', pax: ['allavail'] }] }
    ensureRowIds(DAYS)
    expect(namesIn(paid())).toEqual(['bane', 'rocky', 'stiff'])
  })

  it('A SIM\'s extras line', () => {
    ;(DAYS[SAT] as any).sims = { amt: [{ str: '1300', end: '1500', p: 'rocky', w: '', more: ['allavail'] }] }
    ensureRowIds(DAYS)
    expect(namesIn(paid())).toEqual(['bane', 'rocky', 'stiff'])
  })

  it('A GROUND ROW\'s extras line — its main seat already expanded, its extras did not', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'rocky', more: ['allavail'] }]
    ensureRowIds(DAYS)
    expect(namesIn(paid())).toEqual(['bane', 'rocky', 'stiff'])
  })

  it('THE COMMON PROGRAMME\'s extras line — the last one that silently dropped it', () => {
    ;(DAYS[SAT] as any).allhands = [{ prog: 'BRIEF', str: '0800', end: '0900', who: 'rocky', more: ['allavail'] }]
    ensureRowIds(DAYS)
    expect(namesIn(paid())).toEqual(['bane', 'rocky', 'stiff'])
  })

  it('ALL and ALL AVAIL are the same answer wherever they sit', () => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'all', str: '0700', end: '1900' }] }]
    ensureRowIds(DAYS)
    expect(namesIn(paid())).toEqual(CROWD)
  })
})

describe('what the crowd is resolved AGAINST', () => {
  it('a duty desk hands the expander the desk\'s OWN written window, and its own item', () => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'allavail', str: '0700', end: '1900' }] }]
    ensureRowIds(DAYS)
    const seen: Array<[[number, number], string]> = []
    work((win, item) => seen.push([win, item]))
    expect(seen.length, 'asked exactly once').toBe(1)
    expect(seen[0][0], '0700 to 1900, as written — no padding of any kind').toEqual([420, 1140])
    expect(seen[0][1], 'and under the desk\'s own address, so the switch and the freeze find it')
      .toBe(rowItemKey((DAYS[SAT] as any).dutywaves[0].rows[0].rid))
  })

  it('the crowd INHERITS the seat\'s default, so an AVALON desk\'s crowd earns nothing (D43 + D24)', () => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'AVALON', sa: 'avalon', rows: [{ role: 'RUNNER', id: 'allavail', str: '0700', end: '1900' }] }]
    ensureRowIds(DAYS)
    const got = work()
    expect(namesIn(got), 'they reach the walk').toEqual(CROWD)
    expect(got.bane[0].dflt, 'carrying the desk\'s own answer, not one of their own').toBe(false)
    expect(namesIn(paid()), 'so nobody is paid until the desk is switched on').toEqual([])
    const item = rowItemKey((DAYS[SAT] as any).dutywaves[0].rows[0].rid)
    ;(DAYS[SAT] as any).oild = { items: { [item]: 1 } }
    expect(namesIn(paid()), 'switched on, the whole crowd is paid').toEqual(CROWD)
  })

  it('THE FREEZE WROTE THE CROWD DOWN — the money reads the day\'s own membership', () => {
    ;(DAYS[SAT] as any).sims = { amt: [{ str: '1300', end: '1500', p: 'allavail', w: '' }] }
    ensureRowIds(DAYS)
    const item = rowItemKey((DAYS[SAT] as any).sims.amt[0].rid)
    expect(oilEvidence(SAT).sent[item], 'or the issued day could not hold its people still').toEqual(CROWD)
  })
})

describe('the two places a placeholder must NOT expand', () => {
  it('A COCKPIT SEAT — the money\'s own belt for data that arrived by copy (D33, D36)', () => {
    ;(DAYS[SAT] as any).waves = [{ label: 'WAVE 1', formations: [{ cs: 'RAP', to: '09:00', ld: '11:00', aircraft: [{ p: 'allavail', w: '' }] }] }]
    ensureRowIds(DAYS)
    const seen: string[] = []
    const got = work((_win, item) => seen.push(item))
    expect(seen, 'the flying branch never hands its report-to-debrief window to the expander').toEqual([])
    expect(namesIn(got), 'a jet with a placeholder in it credits nobody').toEqual([])
    expect(namesIn(paid())).toEqual([])
  })

  it('A ROW WITH NO ID YET — it has nowhere to freeze a crowd, so it gathers none (§6)', () => {
    /* deliberately NOT passed through ensureRowIds: this is the row as it exists
       between being painted and being minted an id */
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'allavail' }]
    expect(groundItemKey((DAYS[SAT] as any).ground[0]), 'no id, so no address').toBe('')
    const seen: string[] = []
    const got = work((_win, item) => seen.push(item))
    expect(seen, 'the expander is never asked').toEqual([])
    expect(namesIn(got), 'the mode draws no crowd it could not also pay').toEqual([])
    expect(namesIn(paid())).toEqual([])
  })

  it('THE CONTROL: the same row, with an id, does expand', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'allavail' }]
    ensureRowIds(DAYS)
    expect(namesIn(paid())).toEqual(CROWD)
  })
})

describe('D28 — nothing that earns today stops earning', () => {
  it('named men on every one of those seats are paid exactly as before', () => {
    const w = makeStandalone('sc')!
    w.formations[0].aircraft[0].p = 'bane'
    Object.assign(DAYS[SAT] as any, {
      waves: [w, { label: 'WAVE 1', formations: [{ cs: 'RAP', to: '09:00', ld: '11:00', aircraft: [{ p: 'wolf', w: '' }] }] }],
      sims: { amt: [{ str: '1300', end: '1500', p: 'freak', w: '', pax: ['dice'], more: ['split'] }] },
      dutywaves: [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'rocky', str: '0700', end: '1900', more: ['pike'] }] }],
      ground: [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'stiff', more: ['plasma'] }],
      allhands: [{ prog: 'BRIEF', str: '0800', end: '0900', who: 'romeo', more: ['salsa'] }],
    })
    ensureRowIds(DAYS)
    const money = paid()
    for (const id of ['bane', 'wolf', 'freak', 'dice', 'split', 'rocky', 'pike', 'stiff', 'plasma', 'romeo', 'salsa']) {
      expect(money[id], `${id} still earns`).toBeTruthy()
    }
  })
})
