/* [OIL-SEATS-CAN-EARN] STEP 4 — the four exempt kinds reach the walk, default
   OFF, and can be switched ON.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 4.

   D24 (with D35): SC SPARE, AVALON lines, AVALON duty desks, BB lines and a duty
   block MINTED from an AVALON template all OFFER the switch and default OFF. Up
   to now they were not "off" — they were absent, skipped before the walk reached
   them, so no switch could be drawn and no admin decision could exist. D28 is
   the other half and it binds just as hard: nothing that earns today may stop.

   FOUR SKIPS, NOT THREE (Fable S2 / plan C4 — the plan miscounted and the fourth
   is the one that makes an exempt desk SPEAK at publish rather than fail in
   silence). They are lifted together here.

   THE CONTROLS MATTER AS MUCH AS THE SUBJECTS, and they are here for the reason
   D20's second half needed them: a test that only proves the new thing is off
   cannot tell "off because it is exempt" from "off because the walk broke". So
   every exempt case below is paired with a control that MUST still earn. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { dayOilWork, dayOilBlind, oilCapableItems, rowItemKey } from './oil'
import { makeStandalone } from './waves'
import { oilEvidence, oilEarnedWork, spanDefault, itemState } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}
  /* the day is stripped and rebuilt row by row: every case below is about ONE
     kind of seat, and the seed day's own content would mask an "earns nothing"
     assertion behind work that legitimately earns */
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [] })
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => []
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

/* built through the app's own mint, not by hand: a hand-written wave would not
   carry the flags the walk actually reads, and would test a different program */
const standalone = (kind: string, crew: (w: any) => void) => {
  const w = makeStandalone(kind)!
  crew(w)
  ;(DAYS[SAT] as any).waves = [w]
  ensureRowIds(DAYS)
  return w
}
const work = () => dayOilWork(DAYS[SAT], { expandAll: () => [] })
const paid = () => oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
const itemOf = (f: any) => rowItemKey(f.rid)

describe('SC — the SPARE defaults off, the MAIN is the control that must not move', () => {
  it('both reach the walk, and only the MAIN earns', () => {
    const w = standalone('sc', (wv: any) => {
      wv.formations[0].aircraft[0].p = 'bane'      // MAIN
      wv.formations[0].aircraft[2].p = 'stiff'     // SPARE
    })
    const got = work()
    expect(got.stiff, 'the spare now REACHES the walk — he did not before').toBeTruthy()
    expect(got.bane, 'and so does the main').toBeTruthy()
    expect(got.stiff[0].dflt, 'standing by at home earns nothing by default').toBe(false)
    expect(got.bane[0].dflt, 'D28 — the main earns exactly as it does today').toBe(true)

    const money = paid()
    expect(money.bane, 'THE CONTROL: the main is still paid').toBeTruthy()
    expect(money.stiff, 'and the spare is not').toBeFalsy()
    expect(itemOf(w.formations[0])).toBeTruthy()
  })

  it('the FORMATION-level spare flag counts too (Codex OSE-R2-02)', () => {
    /* a saved SC formation can carry `f.spare` with nothing on the aircraft row.
       A predicate naming only the aircraft flag would default every occupant of
       such a shift ON and pay a spare shift that has never been paid. */
    standalone('sc', (wv: any) => {
      wv.formations[0].spare = true
      wv.formations[0].aircraft[0].p = 'bane'      // an ordinary-looking MAIN row…
    })
    const got = work()
    expect(got.bane, 'he reaches the walk').toBeTruthy()
    expect(got.bane[0].dflt, '…but the whole formation is spare, so he earns nothing by default').toBe(false)
    expect(paid().bane, 'and is not paid').toBeFalsy()
  })

  it('the spare line OFFERS the switch, and switching it ON pays the man (D24)', () => {
    const w = standalone('sc', (wv: any) => { wv.formations[0].aircraft[2].p = 'stiff' })
    const item = itemOf(w.formations[0])
    expect(oilCapableItems(DAYS[SAT]).has(item), 'a switch is drawn, or D24 has no door').toBe(true)
    expect(paid().stiff, 'off to begin with').toBeFalsy()
    ;(DAYS[SAT] as any).oild = { items: { [item]: 1 } }
    expect(paid().stiff, 'switched on, the spare is paid').toBeTruthy()
  })

  it('or the MAN alone is credited, leaving the rest of the shift alone (Fable M2 option A)', () => {
    const w = standalone('sc', (wv: any) => {
      wv.formations[0].aircraft[0].p = 'bane'
      wv.formations[0].aircraft[2].p = 'stiff'
      wv.formations[0].aircraft[3].p = 'plasma'
    })
    const item = itemOf(w.formations[0])
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${item}`]: 'allow' } }
    const money = paid()
    expect(money.stiff, 'the spare who actually worked is credited').toBeTruthy()
    expect(money.plasma, 'the other spare is untouched').toBeFalsy()
    expect(money.bane, 'and the main is unaffected').toBeTruthy()
  })

  it('a shift holding both reads MIXED, because neither word is true of it', () => {
    const w = standalone('sc', (wv: any) => {
      wv.formations[0].aircraft[0].p = 'bane'
      wv.formations[0].aircraft[2].p = 'stiff'
    })
    expect(itemState(DAYS[SAT], oilEvidence(SAT), itemOf(w.formations[0]))).toBe('mixed')
  })
})

describe('AVALON and BB — the whole wave defaults off, with the switch offered', () => {
  for (const kind of ['avalon', 'bb']) {
    it(`a ${kind.toUpperCase()} line reaches the walk, earns nothing, and can be switched on`, () => {
      const w = standalone(kind, (wv: any) => {
        wv.formations[0].aircraft[0].p = 'bane'
        if (kind === 'bb') { wv.formations[0].to = '19:00'; wv.formations[0].ld = '23:00' }
      })
      const got = work()
      expect(got.bane, `the ${kind} line now reaches the walk`).toBeTruthy()
      expect(got.bane[0].dflt, 'and earns nothing by default').toBe(false)
      expect(paid().bane).toBeFalsy()
      const item = itemOf(w.formations[0])
      expect(oilCapableItems(DAYS[SAT]).has(item), 'the switch is offered').toBe(true)
      ;(DAYS[SAT] as any).oild = { items: { [item]: 1 } }
      expect(paid().bane, 'switched on, it pays').toBeTruthy()
    })
  }

  it('AN OVERNIGHT LINE EARNS THE DAY IT SITS ON (D42)', () => {
    const w = standalone('avalon', (wv: any) => { wv.formations[0].aircraft[0].p = 'bane' })
    ;(DAYS[SAT] as any).oild = { items: { [itemOf(w.formations[0])]: 1 } }
    const spans = paid().bane
    expect(spans, 'the Saturday it sits on pays it').toBeTruthy()
    expect(spans[0].e - spans[0].s, 'a 19:00–07:00 line is twelve hours on this day').toBe(720)
  })
})

describe('the duty desks — including one minted from an AVALON template (D35)', () => {
  const desk = (sa: string | undefined, who = 'bane') => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'DUTIES', sa, rows: [{ role: 'SXO', id: who, str: '0700', end: '1900' }] }]
    ensureRowIds(DAYS)
    return rowItemKey((DAYS[SAT] as any).dutywaves[0].rows[0].rid)
  }

  it('an AVALON desk reaches the walk, earns nothing, and can be switched on', () => {
    const item = desk('avalon')
    expect(work().bane, 'it reaches the walk now').toBeTruthy()
    expect(work().bane[0].dflt, 'and defaults off').toBe(false)
    expect(paid().bane).toBeFalsy()
    expect(oilCapableItems(DAYS[SAT]).has(item), 'the switch is offered').toBe(true)
    ;(DAYS[SAT] as any).oild = { items: { [item]: 1 } }
    expect(paid().bane, 'switched on, it pays').toBeTruthy()
  })

  it('A DESK MINTED FROM AN AVALON TEMPLATE IS THE SAME SEAT, SO IT GETS THE SAME ANSWER (D35)', () => {
    /* the mint stamps `sa` on the block, and the walk reads `dw.sa` — so this
       needs no flag of its own. It is pinned because "same seat, one answer" is
       precisely the half that was missed the first time this rule was built. */
    const item = desk('avalon')
    expect(spanDefault(DAYS[SAT], oilEvidence(SAT), 'bane', item)).toBe(false)
  })

  it('THE CONTROL: an ordinary desk, and an SC-template desk, both still earn', () => {
    const plain = desk(undefined)
    expect(paid().bane, 'a plain duty desk is untouched').toBeTruthy()
    expect(spanDefault(DAYS[SAT], oilEvidence(SAT), 'bane', plain)).toBe(true)
    const sc = desk('sc')
    expect(paid().bane, 'and an SC desk earns, because SC is not an exempt KIND').toBeTruthy()
    expect(spanDefault(DAYS[SAT], oilEvidence(SAT), 'bane', sc)).toBe(true)
  })
})

describe('the FOURTH skip — an exempt desk with no times now SPEAKS at publish (C4 / Fable S2)', () => {
  it('an AVALON desk holding a man and no written times is named', () => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'AVALON', sa: 'avalon', rows: [{ role: 'RUNNER', id: 'bane', str: '', end: '' }] }]
    ensureRowIds(DAYS)
    expect(dayOilBlind(DAYS[SAT]), 'it used to fail in silence').toContain('RUNNER')
  })

  it('THE CONTROL: an EMPTY exempt desk is still not a mistake', () => {
    ;(DAYS[SAT] as any).dutywaves = [{ label: 'AVALON', sa: 'avalon', rows: [{ role: 'RUNNER', id: '', str: '', end: '' }] }]
    ensureRowIds(DAYS)
    expect(dayOilBlind(DAYS[SAT]), 'an empty desk is an empty desk').toEqual([])
  })
})

describe('D28 — nothing that earns today stops earning', () => {
  it('an ordinary flying line, a sim, a ground row and the Common Programme all still pay', () => {
    const w = makeStandalone('sc')!
    w.formations[0].aircraft[0].p = 'bane'
    Object.assign(DAYS[SAT] as any, {
      waves: [w, { label: 'WAVE 1', formations: [{ cs: 'RAP', to: '09:00', ld: '11:00', aircraft: [{ p: 'wolf', w: '' }] }] }],
      sims: { amt: [{ str: '1300', end: '1500', p: 'freak', w: '' }] },
      ground: [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'rocky' }],
      allhands: [{ prog: 'BRIEF', str: '0800', end: '0900', who: 'plasma' }],
    })
    ensureRowIds(DAYS)
    const money = paid()
    for (const id of ['bane', 'wolf', 'freak', 'rocky', 'plasma']) {
      expect(money[id], `${id} still earns`).toBeTruthy()
    }
  })
})
