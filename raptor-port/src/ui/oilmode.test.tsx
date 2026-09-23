// @vitest-environment jsdom
/* THE "OIL EARN" MODE ON THE BOARD, AND THE GREEN EDGE ON THE PUCK
   [OIL-AUTO-REMOVE] §2.1, §2.10, §7.6 — owner, 21 Sep 26.
   Spec: docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md.

   jsdom has no layout engine, so what this file proves is the markup and the
   wiring — the button appears only where the day can earn, a tap takes a man
   off one event and leaves his others alone, an item's name is its own switch,
   a sentinel opens into real pucks, the figure rides each puck, and the green
   bar is emitted on the issued schedule and on no other day. What it LOOKS
   like painted is the live-view pass in the running app. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { INPUTS, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { toggleOilPerson, toggleOilItem, oilModeOn, oilItemMasked, oilItemMark } from './oilmode'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, oilWouldEarn, oilReadPass, itemMasked } from '../engine/oilev'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey, inputItemKey } from '../engine/oil'
import { makeStandalone } from '../engine/waves'
import { elogClear, elogRows } from '../engine/editlog'
import { validate } from '../engine/validate'
import { openScheduler, boardWeekStep } from './board'
import { setOilDay } from '../state/view'
import { oilOffReason } from './oilmode'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const SAT = 5, SAT_ISO = '2026-07-18'

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
})

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ensureRowIds(DAYS)
  elogClear()
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff']
})
afterEach(() => { setOilDay(null) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const rows = (di: number) => DAYS[di].ground as any[]
const addRow = (di: number, r: any) => { DAYS[di].ground = (rows(di) || []).concat([r]); ensureRowIds(DAYS); return rows(di)[rows(di).length - 1] }
/* by POSITION in the panel, not by data-move: the mode makes the board
   read-only, and a read-only row carries no move address. The Ground Programme
   renders time-sorted, and every fixture below is written in time order. */
const groundRowEl = (ri: number) => $$('#sbBoard .sb-panel.grnd .sb-arow.c6r')[ri]
/* A DAY WHOSE ONLY EARNING WORK IS ONE GROUND ROW. The seed day carries flying,
   duty and sim content of its own, so "switch off the last earning item" cannot
   be expressed on it — the day would still earn from everything else. Used only
   where the property under test is about the day's LAST item. */
const onlyEarningRow = (di: number) => {
  const d: any = DAYS[di]
  d.waves = []; d.dutywaves = []; d.sims = {}; d.allhands = []; d.ground = []
  return addRow(di, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
}

describe('the button is drawn only where a day can earn (§2.8)', () => {
  it('OIL1, OIL18 — a weekend day offers it, an ordinary weekday does not', async () => {
    await open(SAT)
    expect(oilBtn(), 'the Saturday offers OIL Earn').toBeTruthy()
    await open(1)
    expect(oilBtn(), 'Tuesday is unchanged — five days a week the board is the same').toBeFalsy()
  })
})

describe('the mode itself (§2.1)', () => {
  beforeEach(async () => {
    addRow(SAT, { prog: 'MORNING BRIEF', str: '0700', end: '0800', who: 'bane' })
    addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    await open(SAT)
  })

  it('OIL1, OIL17 — pressing it lights the button and stops the ordinary schedule edits', async () => {
    expect($$('#sbBoard .sb-panel.grnd [data-bfld]').length, 'editable boxes before').toBeGreaterThan(0)
    await click(oilBtn())
    /* the bar's own button is the way OUT once the mode is on, so it reads
       "✓ Done" and wears the green `done` class rather than `.on` */
    expect(oilBtn().classList.contains('done'), 'the way in became the way out').toBe(true)
    expect($$('#sbBoard .sb-panel.grnd [data-oilitem]').length, 'every item is now a switch').toBeGreaterThan(0)
    expect($$('#sbBoard .sb-panel.grnd .lctl .mbtn.del').length, 'and the row controls are gone').toBe(0)
    await click(oilBtn())
    expect(oilBtn().classList.contains('done'), 'and it toggles back off').toBe(false)
  })

  it('OIL2, OIL5, OIL21 — every puck that earns glows and wears the man\'s figure for the DAY', async () => {
    await click(oilBtn())
    const pucks = $$('#sbBoard .sb-panel.grnd .seat.oilpk .puck')
    expect(pucks.length, 'both of his rows draw him').toBe(2)
    expect(pucks.every(p => p.classList.contains('oilglow')), 'both glow').toBe(true)
    /* 07:00 to 17:00 is a ten-hour day, so BOTH pucks read FO — the same figure
       twice, because it is the man's day, not what each event earned */
    expect($$('#sbBoard .sb-panel.grnd .role.oilamt').map(e => e.textContent)).toEqual(['FO', 'FO'])
  })

  it('OIL3, OIL4, OIL6 — tapping a puck takes him off THAT event and the figure follows', async () => {
    await click(oilBtn())
    /* take him off the long event: only his one morning hour is left, so the
       figure on the remaining puck drops to a half day — the mitigation the
       owner insisted on, because this is exactly the change a scheduler cannot
       predict from the row he tapped */
    const long = groundRowEl(1).querySelector('.seat.oilpk') as HTMLElement
    await click(long)
    expect(groundRowEl(1).querySelector('.puck')!.classList.contains('oildim'), 'the tapped puck goes dim').toBe(true)
    expect(groundRowEl(0).querySelector('.puck')!.classList.contains('oilglow'), 'his other event still counts').toBe(true)
    expect(groundRowEl(0).querySelector('.role.oilamt')!.textContent, 'and it is a half day now').toBe('HO')
    const dec = (DAYS[SAT] as any).oild
    expect(dec.people[`bane|${rowItemKey(rows(SAT)[1].rid)}`]).toBe('deny')
    /* tap it again and the override is REMOVED, not flipped to allow — the
       ordinary rule already said yes */
    await click(groundRowEl(1).querySelector('.seat.oilpk'))
    expect((DAYS[SAT] as any).oild, 'nothing is left behind on the record').toBeUndefined()
  })

  it('OIL7 — tapping an item\'s NAME stops the whole item earning, whoever is added later', async () => {
    await click(oilBtn())
    await click(groundRowEl(1).querySelector('[data-oilitem]'))
    const item = rowItemKey(rows(SAT)[1].rid)
    expect((DAYS[SAT] as any).oild.items[item]).toBe(0)
    expect(groundRowEl(1).querySelector('[data-oilitem]')!.classList.contains('off')).toBe(true)
    expect(groundRowEl(0).querySelector('.role.oilamt')!.textContent, 'his day is a half now').toBe('HO')
  })

  it('OIL9 — the day blanket stops everything, and says the marks underneath are kept', async () => {
    await click(oilBtn())
    await click(groundRowEl(1).querySelector('.seat.oilpk'))       // a person mark underneath
    await click($('#sbBoard [data-oilblank]'))
    expect((DAYS[SAT] as any).oild.blanket).toBe(1)
    expect($$('#sbBoard .sb-panel.grnd .puck.oilglow').length, 'nothing glows').toBe(0)
    expect($('#sbBoard .daybar-note').textContent).toContain('kept')
    await click($('#sbBoard [data-oilblank]'))
    expect((DAYS[SAT] as any).oild.blanket).toBeUndefined()
    expect((DAYS[SAT] as any).oild.people, 'the person mark survived underneath').toBeTruthy()
  })

  /* [ALL-AVAIL-WINDOW] (D38) — OIL8/OIL15 still hold, through the new door: the
     sentinel now STAYS a sentinel on the row and its counter opens the window
     that holds the men behind it. The rulings are about the men being reachable
     and switchable, not about where they are drawn. */
  it('OIL8, OIL15 — a sentinel keeps its counter, and the counter opens the men', async () => {
    addRow(SAT, { prog: 'ALL HANDS', str: '1000', end: '1600', who: 'allavail' })
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl(2)
    expect(el.querySelector('.puck.allavail'), 'the sentinel STAYS a sentinel now').toBeTruthy()
    const chip = el.querySelector('.oilcount') as HTMLElement
    expect(chip, 'and carries its counter — the door to the men behind it').toBeTruthy()
    await click(chip)
    expect([...$('.availwin').querySelectorAll('.seat.oilpk')].length,
      'the men behind it are drawn, and each is switchable').toBe(2)
  })

  it('OIL28, OIL31 — a man with nothing measurable to earn from is drawn inert, not tappable', async () => {
    addRow(SAT, { prog: 'NO TIMES', str: '', end: '', who: 'plasma' })
    await open(SAT)
    await click(oilBtn())
    const inert = $$('#sbBoard .sb-panel.grnd .seat.oilpk.inert')
    expect(inert.length, 'the blank-times row offers no switch').toBe(1)
    expect(inert[0].dataset.oilp, 'and carries no tap target').toBeUndefined()
  })
})

describe('the green edge on the issued schedule (§2.10, §7.6)', () => {
  const publish = (di: number) => {
    const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(di, true)
  }

  it('OIL20, OIL22, OIL18 — a man who earns wears a bar; on a weekday nothing is emitted at all', async () => {
    addRow(SAT, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    addRow(1, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    await open(SAT)
    expect($$('#sbBoard .puck.oilbar-fo').length, 'his full day shows on the Saturday').toBeGreaterThan(0)
    await open(1)
    expect($$('#sbBoard .puck.oilbar').length, 'and the Tuesday is byte-identical to before').toBe(0)
  })

  it('OIL20, OIL30 — a half day is a different bar from a full one', async () => {
    addRow(SAT, { prog: 'HALF', str: '0800', end: '1100', who: 'stiff' })
    await open(SAT)
    const pk = $$('#sbBoard .sb-panel.grnd .puck.oilbar')
    expect(pk.length).toBe(1)
    expect(pk[0].classList.contains('oilbar-ho'), 'three hours is a half day').toBe(true)
  })

  it('OIL23 — a sentinel wears a bar only when the people behind it agree', async () => {
    addRow(SAT, { prog: 'ALL HANDS', str: '0800', end: '1700', who: 'allavail' })
    await open(SAT)
    const chip = $('#sbBoard .sb-panel.grnd .oilcount')
    expect(chip, 'the count chip is drawn beside the puck').toBeTruthy()
    expect(chip.textContent, 'both behind it earn the same full day').toBe('2')
    expect($('#sbBoard .sb-panel.grnd .puck.allavail').classList.contains('oilbar-fo')).toBe(true)
    /* now make them DISAGREE — one of the two is taken off the item */
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${rowItemKey(rows(SAT)[0].rid)}`]: 'deny' } }
    await open(SAT)
    expect($('#sbBoard .sb-panel.grnd .puck.allavail').classList.contains('oilbar'), 'a mixed puck wears no bar').toBe(false)
    const mixed = $('#sbBoard .sb-panel.grnd .oilcount')
    expect(mixed.classList.contains('some'), 'the chip carries the mixed case instead').toBe(true)
    expect(mixed.textContent).toBe('1 of 2 earn')
  })

  it('OIL24, OIL32 — the bar reads the ISSUED evidence on a published day, not the live draft', async () => {
    addRow(SAT, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    await open(SAT)
    publish(SAT)
    await act(async () => { notify() })
    expect($$('#sbBoard .puck.oilbar-fo').length).toBeGreaterThan(0)
  })
})

describe('the publish reminder (§2.3)', () => {
  it('OIL11, OIL33 — an unpublished weekend day with somebody down to earn says so', async () => {
    addRow(SAT, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    /* the strip is DERIVED state: in the app every edit ends in
       afterSchedMutate, which re-validates. The fixture writes DAYS directly,
       so it runs the same pass by hand. */
    await act(async () => { validate(); notify() })
    await open(SAT)
    const said = $$('#sbWarn .wln .wln-t').map(e => e.textContent || '').join(' | ')
    expect(said, 'the day says nobody earns until it is published').toContain('not published yet')
  })
})

describe('input-derived items keep the member\'s word, and the admin can overrule it', () => {
  it('OIL10, OIL25 — a claim the member answered NO to draws a dim puck the admin can light', async () => {
    INPUTS.unshift({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', yr: 2026, allday: true, s: 0, e: 1439, remarks: '', mod: 'now', oil: { [SAT_ISO]: 0 } })
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'c1' })
    await open(SAT)
    await click(oilBtn())
    const seat = groundRowEl(0).querySelector('.seat.oilpk') as HTMLElement
    expect(seat.dataset.oilitem, 'addressed by the INPUT, never the row').toBe(inputItemKey('c1'))
    expect(seat.querySelector('.puck')!.classList.contains('oildim'), 'his own No is the default').toBe(true)
    await click(seat)
    expect((DAYS[SAT] as any).oild.people[`bane|${inputItemKey('c1')}`], 'the admin says yes over it').toBe('allow')
    expect(INPUTS[0].oil, 'and his own answer is untouched').toEqual({ [SAT_ISO]: 0 })
  })
})

/* ── THE BUG CHECK'S FIXES, 21 Sep 26 (Fable + Astra) ──────────────────────
   Driven through the board the way a scheduler drives it — real clicks on real
   pucks — because the review's sharpest finding was that the old tests set the
   marks by replacing the record where the board mutates it in place. */
describe('the bug check (21 Sep 26)', () => {
  let brief: any, family: any
  beforeEach(async () => {
    brief = addRow(SAT, { prog: 'MORNING BRIEF', str: '0700', end: '0800', who: 'bane' })
    family = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    await open(SAT)
  })
  const puckOn = (row: any, person = 'bane') =>
    $$(`[data-oilp="${person}"]`).find(el => el.dataset.oilitem === rowItemKey(row.rid)) || null
  /* the PEOPLE marks only — pressing the blanket legitimately adds its own
     mark to the record, and what this is watching is whether the decisions
     UNDERNEATH it survive */
  const decisions = () => JSON.stringify(((DAYS[SAT] as any).oild || {}).people || {})

  it('OIL9 — a tap under the day blanket changes NOTHING underneath it', async () => {
    await click(oilBtn())
    await click(puckOn(family))                                  // bane taken off FAMILY DAY
    const denied = decisions()
    expect(denied, 'the deny is recorded').toContain('deny')
    await click($('#sbBoard [data-oilblank]'))                   // "Nothing today earns"
    const masked = puckOn(family)
    expect(masked, 'a masked puck is not a control at all').toBeNull()
    /* and even if something reached the writer, it must refuse */
    await act(async () => { toggleOilPerson(SAT, 'bane', rowItemKey(family.rid)); notify() })
    expect(decisions(), 'the decision under the blanket is exactly as it was').toBe(denied)
    await click($('#sbBoard [data-oilblank]'))                   // blanket off again
    expect(decisions(), 'and it comes back untouched').toBe(denied)
  })

  it('OIL9 — a tap under a switched-off EVENT changes nothing either', async () => {
    await click(oilBtn())
    await click(puckOn(family))
    const denied = decisions()
    const itemCell = $$('#sbBoard [data-oilitem]').find(el => el.dataset.oilitem === rowItemKey(family.rid))!
    await click(itemCell)                                        // the whole event switched off
    expect(puckOn(family), 'no tap target while the event is off').toBeNull()
    await act(async () => { toggleOilPerson(SAT, 'bane', rowItemKey(family.rid)); notify() })
    expect(decisions()).toContain('deny')
    expect(JSON.parse(decisions())[`bane|${rowItemKey(family.rid)}`]).toBe('deny')
  })

  it('an OIL decision is written into the day\'s history, naming the man and the event', async () => {
    await click(oilBtn())
    await click(puckOn(family))
    const said = elogRows(SAT).map(r => r.lbl).join(' | ')
    expect(said, 'the man is named, by the callsign the schedule shows').toContain((PEOPLE as any).bane.cs)
    expect(said, 'and so is the event he was taken off').toContain('FAMILY DAY')
  })

  it('O-1 — the green bar shows on the events that COUNTED, not on every puck he wears', async () => {
    /* the owner, on being shown an ⓘ row wearing a green bar: "I thought the
       green should show for individual pucks on individual events?" */
    family.info = true                                           // ⓘ — shown, never worked
    signOf(SAT).cur = 'ignite'; signOf(SAT).sked = 'bane'
    signOf(SAT).plan = 'stiff'; signOf(SAT).appr = 'pump'
    await act(async () => { setDayApproved(SAT, true); validate(); notify() })
    const bars = $$('#sbBoard .sb-panel.grnd .puck.oilbar')
    expect(bars.length, 'the morning brief counted; the ⓘ row gave him nothing').toBe(1)
  })

  it('stepping to another week leaves OIL mode rather than stranding a locked board', async () => {
    await click(oilBtn())
    expect(oilModeOn(SAT), 'in the mode').toBe(true)
    await act(async () => { boardWeekStep(1); notify() })
    expect(oilModeOn(SAT), 'the mode belongs to one day of one week').toBe(false)
    await act(async () => { boardWeekStep(-1); notify() })
  })
})

/* THE GREEN STRIP MUST REACH EVERY SEAT THE BOARD DRAWS — found by the owner in
   the running app, 21 Sep 26 ("Flying waves should be earning OIL", "SC MAIN
   should be earning OIL", "Common programme should be earning oil").
   The money was always right; the STRIP was missing, because the board builds
   its cockpit seats and its Common Programme seats with their own builders
   rather than the shared one, and neither asked for the decoration. Nothing in
   5328 unit tests saw it: every assertion about the bar was made on a duty desk
   or a ground row, which DO go through the shared builder. This is the test
   that walks the seat kinds instead. */
describe('the green strip reaches every kind of seat the board draws', () => {
  beforeEach(async () => {
    DAYS[SAT].waves = [
      /* a plain flying line: report → land + debrief, a long day */
      { formations: [{ cs: 'KN', msn: 'BFM', to: '08:00', ld: '19:00',
        aircraft: [{ p: 'bane', w: 'stiff' }] }] },
      /* an SC shift with a MAIN pair and a SPARE pair, exactly as the board mints it */
      { kind: 'sc', formations: [{ cs: 'SC', msn: 'AM', shift: 'AM', to: '07:00', ld: '19:00',
        aircraft: [
          { role: 'MAIN', spare: false, p: 'pump', w: '' },
          { role: 'SPARE', spare: true, p: 'plasma', w: '' },
        ] }] },
    ]
    DAYS[SAT].allhands = [{ prog: 'TEST EVENT', str: '07:00', end: '18:00', who: 'dice' }]
    ensureRowIds(DAYS)
    await open(SAT)
  })
  const barOf = (cs: string) => {
    const id = Object.keys(PEOPLE).find(k => (PEOPLE as any)[k]?.cs === (PEOPLE as any)[cs]?.cs || k === cs)
    const pk = $$(`#sbBoard .puck[data-person="${id}"]`)[0]
    return pk ? [...pk.classList].filter(c => c.startsWith('oilbar')).join(' ') : 'NO PUCK'
  }

  it('OIL20 — a flying line, an SC MAIN and the Common Programme all wear it', async () => {
    expect(barOf('bane'), 'the flying line FCP').toContain('oilbar')
    expect(barOf('stiff'), 'the flying line RCP').toContain('oilbar')
    expect(barOf('pump'), 'the SC MAIN seat').toContain('oilbar')
    expect(barOf('dice'), 'the Common Programme seat').toContain('oilbar')
  })

  it('OIL21a — and an SC SPARE still wears nothing, because a spare stands by', async () => {
    expect(barOf('plasma'), 'spares do not work, so they do not earn').toBe('')
  })
})

/* THE WEEK IS A SECOND RENDERER AND IT HAD THE SAME HOLE (owner, 21 Sep 26).
   The board's cockpit seats were fixed first; the week draws its own
   (`html.ts slotCell`) and was still calling puck() with six arguments, so
   every flying line and SC shift on the WEEK showed no bar either. Two
   renderers, one rule — assert it on both surfaces or it only ever gets half
   fixed. */
describe('the green strip reaches the WEEK view too, not only the board', () => {
  beforeEach(async () => {
    DAYS[SAT].waves = [
      { formations: [{ cs: 'KN', msn: 'BFM', to: '08:00', ld: '19:00',
        aircraft: [{ p: 'bane', w: 'stiff' }] }] },
      { kind: 'sc', formations: [{ cs: 'SC', msn: 'AM', shift: 'AM', to: '07:00', ld: '19:00',
        aircraft: [
          { role: 'MAIN', spare: false, p: 'pump', w: '' },
          { role: 'SPARE', spare: true, p: 'plasma', w: '' },
        ] }] },
    ]
    ensureRowIds(DAYS)
    await act(async () => { notify() })
  })
  const weekBar = (key: string) => {
    const seat = $$(`.seat[data-slot="${key}"]`).find(s => s.querySelector('.puck[data-person]'))
    const pk = seat?.querySelector('.puck')
    return pk ? [...pk.classList].filter(c => c.startsWith('oilbar')).join(' ') : 'NO SEAT'
  }
  it('OIL21a — a flying line and an SC MAIN wear the bar on the week', async () => {
    expect(weekBar(`${SAT}.0.0.0.p`), 'the flying FCP on the week').toContain('oilbar')
    expect(weekBar(`${SAT}.0.0.0.w`), 'the flying RCP on the week').toContain('oilbar')
    expect(weekBar(`${SAT}.1.0.0.p`), 'the SC MAIN on the week').toContain('oilbar')
  })
  it('OIL21a — and an SC SPARE does not, on the week either', async () => {
    expect(weekBar(`${SAT}.1.0.1.p`), 'spares stand by').toBe('')
  })
})

/* AN EVENT THAT CAN NEVER EARN MUST NOT OFFER A SWITCH (Fable ranked this its
   third most likely find; confirmed in the running app 21 Sep 26). The switch
   used to be drawn on every row with an id, so an AVALON line, its desk and an
   ⓘ row all read "tap to stop this item earning" beside pucks that already said
   they earn nothing — and on a published day a tap wrote a real decision, so the
   day grew an amendment for something that moves no money. */
describe('the item switch is only offered where the event can earn', () => {
  beforeEach(async () => {
    /* minted the way the board mints it — a hand-built shape would not be a
       standalone wave at all, and the test would quietly check a different
       program (the fixture-not-how-the-app-writes trap both reviewers named) */
    const av: any = makeStandalone('avalon')
    av.formations[0].aircraft[0].p = 'bane'
    DAYS[SAT].waves = [av]
    DAYS[SAT].ground = [
      { prog: 'MORNING BRIEF', str: '07:00', end: '08:00', who: 'stiff' },
      { prog: 'NOTICE ONLY', str: '08:00', end: '12:00', who: 'pump', info: true },
    ]
    DAYS[SAT].dutywaves = [
      { rows: [{ role: 'SDO', str: '08:00', end: '18:00', id: 'plasma' }] },
      { sa: 'avalon', noconf: 1, rows: [{ role: 'AVALON DESK', str: '07:00', end: '19:00', id: 'dice' }] },
    ]
    ensureRowIds(DAYS)
    await open(SAT)
    await click(oilBtn())
  })
  const cellFor = (label: string) =>
    $$('#sbBoard .oilitem').find(e => (e.textContent || '').trim() === label)

  it('OIL7 — an ordinary event offers one', async () => {
    expect(cellFor('MORNING BRIEF')?.dataset.oilitem, 'a ground row that earns').toBeTruthy()
    expect(cellFor('SDO')?.dataset.oilitem, 'a duty desk that earns').toBeTruthy()
  })
  /* UPDATED 22 Sep 26 — D24, and BOTH rulings this pins survive it.
     OIL7 (tapping an item's name stops the whole item earning) is untouched.
     OIL28 (nothing overrides ineligibility — an allow is permission to count
     real work, never to invent it) is untouched too: an ⓘ row measures nothing
     and still offers no switch.

     What moves is the EXAMPLE. This test used AVALON as its illustration of
     "ineligible", and D24 says AVALON was never ineligible — it was EXEMPT, and
     exempt has now become a DEFAULT the admin can override. So AVALON and its
     desk change sides here, and the ⓘ row stays where it was as the control
     that keeps OIL28 honest. */
  it('OIL28 — a row that can never earn still offers none', async () => {
    const el = cellFor('NOTICE ONLY')
    expect(el, 'the ⓘ row is drawn').toBeTruthy()
    expect(el!.dataset.oilitem, 'and must not be tappable').toBeFalsy()
    expect(el!.classList.contains('none'), 'it reads as nothing to switch').toBe(true)
  })

  it('D24 — AVALON and its desk DO offer one now, and it says they earn nothing', async () => {
    for (const label of ['AV', 'AVALON DESK']) {
      const el = cellFor(label)
      expect(el, `${label} is drawn`).toBeTruthy()
      expect(el!.dataset.oilitem, `${label} offers the switch — D24's only door`).toBeTruthy()
      expect(el!.title, `${label} says it earns nothing, and how to change that`)
        .toMatch(/earns nothing|tap to make it earn/i)
    }
  })
})

/* The three OFF states used to share one sentence — "earns nothing from this
   event" — so a man nobody had ASKED read exactly like a man who had refused.
   That is the sentence the owner's Ace lost half a day behind. Hand pass
   finding 13 / Fable M3, 22 Sep 26. */
describe('a puck that is not earning says WHICH of the three reasons it is', () => {
  it('tells "nobody asked him" apart from "he said No" and "the scheduler took him off"', () => {
    const iid = 'testreq1'
    const item = inputItemKey(iid)
    const base = { iso: '2026-07-18', earns: true, sent: {} } as any
    const evFor = (ans: any, dec: any) => ({
      ...base,
      d: dec ? { people: { [`bane|${item}`]: dec } } : {},
      inputs: [{ iid, person: 'bane', type: 'Training', asks: true, acc: 'g', win: [480, 720], ans }],
    })
    const read = (ev: any) => {
      const orig = (DAYS as any)[5]
      ;(DAYS as any)[5] = { ...(orig || {}), oilev: ev }
      try { return oilOffReason(5, 'bane', item) } finally { (DAYS as any)[5] = orig }
    }
    expect(read(evFor(null, null)).why, 'never asked — the one that costs money in silence').toBe('unasked')
    expect(read(evFor(0, null)).why, 'the member answered No, which is his own word').toBe('declined')
    expect(read(evFor(1, 'deny')).why, "the scheduler's own mark, over an answered yes").toBe('denied')
    expect(read(evFor(null, null)).what, 'and it names the request, so the sentence can say which one').toBe('Training')
  })
})

/* FIX 5 — THE MODE MUST ACTUALLY BE READ-ONLY (hand pass, 21 Sep 26 §6 row 5).
   The board's own schedule boxes were shut when the mode came in, but the two
   crew panels beside them were not: the Personal Inputs and Unavailable rows
   still took a typed time, still let a puck be dropped on them, and still
   toggled the late mark. All three change what a man earns, which is the one
   thing the mode exists to prevent. */
describe('the mode shuts the crew panels too (fix 5)', () => {
  const claim = (r: any) => {
    const row: any = { person: 'bane', type: 'OD', date: 'Jul 18', allday: false, s: 8 * 60, e: 10 * 60, remarks: '', mod: 'now', yr: 2026, ...r }
    inpId(row); INPUTS.unshift(row); return INPUTS[0]
  }
  const inpRows = () => $$('#sbBoard .inprow')
  const boxesIn = (el: HTMLElement) => [...el.querySelectorAll('[data-ifld]')] as HTMLInputElement[]

  beforeEach(async () => {
    addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
  })

  it('a claim row takes a typed time OUTSIDE the mode, and none inside it', async () => {
    claim({})
    await open(SAT)
    const before = inpRows()
    expect(before.length, 'the claim is drawn on the board').toBeGreaterThan(0)
    expect(boxesIn(before[0]).length, 'its times and remarks are editable').toBeGreaterThan(0)
    expect(boxesIn(before[0]).every(b => b.disabled), 'and live').toBe(false)

    await click(oilBtn())
    const after = inpRows()
    expect(after.length, 'the row is still drawn — the mode has to reach the claim').toBeGreaterThan(0)
    expect(boxesIn(after[0]).every(b => b.disabled), 'every box is shut inside the mode').toBe(true)
  })

  it('the OIL switch on that row still works, which is the whole point of drawing it', async () => {
    const r = claim({})
    await open(SAT)
    await click(oilBtn())
    expect($(`#sbBoard [data-oilitem="${inputItemKey(inpId(r))}"]`), 'the claim carries its own switch').toBeTruthy()
  })

  it('no puck can be dropped on an Unavailable row inside the mode', async () => {
    /* LEAVE, deliberately: it earns no OIL, so it carries no switch of its own
       and nothing else was taking its drop target away */
    claim({ type: 'LL' })
    await open(SAT)
    expect($$('#sbBoard [data-inpseat]').length, 'the leave row IS a drop target outside the mode').toBeGreaterThan(0)
    await click(oilBtn())
    expect($$('#sbBoard [data-inpseat]').length, 'and none of them inside it').toBe(0)
  })

  it('the LATE mark cannot be toggled from inside the mode', async () => {
    /* an input whose last change is after the day it covers wears the chip */
    claim({ mod: '2026-07-18' })
    await open(SAT)
    expect($$('#sbBoard [data-lateoff]').length, 'the chip is there to tap outside the mode').toBeGreaterThan(0)
    expect($$('#sbBoard .latetag').length, 'and it is the clickable one, not the passive badge').toBe(0)
    await click(oilBtn())
    expect($$('#sbBoard [data-lateoff]').length, 'and not inside it').toBe(0)
    expect($$('#sbBoard .latetag').length, 'but the row still SAYS it was late').toBeGreaterThan(0)
  })
})

/* FABLE F5 (22 Sep 26) — "nothing measurable to earn from here" is true and
   useless when the reason is a scheduler's mark on ANOTHER day. A request that
   runs Friday into Saturday, whose one row was cancelled on the Friday, draws an
   inert puck on the Saturday and says only that there is nothing to earn — so
   the scheduler looks around the Saturday, where there is nothing to find. */
describe('an inert claim names the row that made it inert', () => {
  const crossWeekClaim = () => {
    const row: any = { iid: 'xf', person: 'bane', type: 'Training', date: 'Jul 17', endDate: 'Jul 18',
      acc: 'g', allday: false, s: 8 * 60, e: 18 * 60, remarks: '', mod: 'now', yr: 2026, oil: { [SAT_ISO]: 1 } }
    INPUTS.unshift(row); return row
  }
  const titleOf = (sel: string) => ($(sel) as HTMLElement | null)?.getAttribute('title') || ''

  it('names the anchor day and says the row was cancelled', async () => {
    crossWeekClaim()
    const r = addRow(4, { prog: 'TRAINING', str: '0800', end: '1800', who: 'bane', src: 'xf', cx: true })
    expect(r.cx).toBe(true)
    await open(SAT)
    await click(oilBtn())
    const t = titleOf('#sbBoard .oilpk.inert')
    expect(t, 'it names the day the row is on').toMatch(/Jul 17/)
    expect(t, 'and what was done to it').toMatch(/cancel/i)
  })

  it('an INFO-ONLY anchor says that instead', async () => {
    crossWeekClaim()
    addRow(4, { prog: 'TRAINING', str: '0800', end: '1800', who: 'bane', src: 'xf', info: true })
    await open(SAT)
    await click(oilBtn())
    expect(titleOf('#sbBoard .oilpk.inert')).toMatch(/information only/i)
  })

  it('THE CONTROL — a man who is simply on nothing measurable keeps the plain words', async () => {
    addRow(SAT, { prog: 'FAMILY DAY', str: '', end: '', who: 'bane' })
    await open(SAT)
    await click(oilBtn())
    const t = titleOf('#sbBoard .oilpk.inert')
    expect(t, 'no row to name, so nothing invented').not.toMatch(/Jul 1[0-9]/)
  })
})

/* HAND PASS FINDING 14 — the change history is the record of a money decision
   and read like a glitch: "Sidewinder earns nothing from SidewinderFO". The
   line reads the row's name back off the page, which is right for a schedule
   row and wrong for a claim, whose cell holds the man's own puck. */
describe('the history names a claim by what it IS, not by the puck in its cell', () => {
  it('a request reads by its type, the way the app names it everywhere else', async () => {
    const row: any = { iid: 'h14', person: 'bane', type: 'OD', date: 'Jul 18', allday: true,
      remarks: '', mod: 'now', yr: 2026, oil: { [SAT_ISO]: 1 } }
    INPUTS.unshift(row)
    await open(SAT)
    await click(oilBtn())
    const pk = $(`#sbBoard [data-oilp][data-oilitem="${inputItemKey('h14')}"]`)
    expect(pk, 'his claim carries a tappable puck').toBeTruthy()
    await click(pk)
    const said = elogRows(SAT).map(r => r.lbl).join(' | ')
    expect(said, 'it names the request').toMatch(/overseas duty/i)
    expect(said, 'and not the puck text beside it').not.toMatch(/FO|HO/)
  })
})

/* =====================================================================
   [OIL-SEATS-CAN-EARN] STEP 1 — the earn rule consolidated onto the EVIDENCE
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §4, §5 step 1.

   Two reviewers confirmed F2 independently: the rule "does this item earn" is
   written TWICE and the two copies read DIFFERENT SOURCES — the mode read the
   live day's own decisions, the money read the frozen block on the issued
   document. They agree today only because publishing swaps one for the other,
   so this is a seam, not a live defect; it is shut now because every later step
   adds a reader, and a seam with five readers is not closed by hand.

   The state below is CONSTRUCTED rather than reached through the app, for the
   same reason: the two sources cannot be made to disagree through any gesture
   today. So this proves the SEAM is shut — one source behind both answers — and
   nothing about a user scenario. Named accordingly. */
describe('the item guard reads the day\'s EVIDENCE, never the day\'s live decisions', () => {
  it('a frozen block that masks an item is obeyed by the screen, not just by the money', async () => {
    const row = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    const item = rowItemKey(row.rid)
    /* the frozen answer says this item earns nobody; the live day carries no
       mark at all — the exact shape F2 describes */
    ;(DAYS[SAT] as any).oilev = { ...oilEvidence(SAT), d: { items: { [item]: 0 } } }
    const work = oilEarnedWork(DAYS[SAT], oilEvidenceOf(SAT))
    expect(work.bane, 'the MONEY reads the frozen block and pays him nothing').toBeFalsy()
    expect(oilItemMasked(SAT, item), 'and the SCREEN must read the same block').toBe(true)
  })

  it('the raw mark is readable apart from the blanket, so the switch can tell them apart', async () => {
    const row = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    const item = rowItemKey(row.rid)
    expect(oilItemMark(SAT, item), 'an untouched item carries no mark').toBeUndefined()
    ;(DAYS[SAT] as any).oild = { items: { [item]: 0 } }
    expect(oilItemMark(SAT, item), 'switched off, it carries the 0').toBe(0)
    ;(DAYS[SAT] as any).oild = { blanket: 1, items: { [item]: 0 } }
    expect(oilItemMasked(SAT, item), 'the blanket masks it').toBe(true)
    expect(oilItemMark(SAT, item), 'but the mark beneath the blanket is still readable').toBe(0)
  })
})

/* THE MEMO'S SAFETY (plan §5 step 1, OSE-T-01 — the targeted check found this
   and it is the reason the cache is NOT keyed on the day and the store version).
   The day is mutated IN PLACE and the version only advances at notify, while the
   epilogue runs VALIDATION first. A cache filled by the previous paint would
   answer validation with the PRE-change evidence, so switching off the last
   earning item would leave an obsolete OIL warning standing on the day.

   So the authoritative calculation stays uncached, and the cache lives only
   inside an explicit read-only render pass. These are GUARD tests: they pass
   against today's uncached code too. They bite the moment anyone reaches for a
   version-keyed cache, which is the break test recorded in the evidence sheet. */
describe('the OIL evidence is never served from a cache across a change', () => {
  it('switching off the last earning item is seen by validation before any repaint', async () => {
    /* the day is stripped to ONE earning item on purpose: the property under
       test is what happens when the LAST one is switched off, which is the case
       that can leave an obsolete OIL warning standing */
    const row = onlyEarningRow(SAT)
    const item = rowItemKey(row.rid)
    await open(SAT)
    /* prime whatever cache a paint fills: the board has just been drawn */
    expect(oilWouldEarn(SAT), 'the day earns before the switch').toBe(true)
    /* the real gesture, and then the question validation asks — with no notify
       between them, which is exactly the window the epilogue runs in */
    toggleOilItem(SAT, item)
    expect(oilWouldEarn(SAT), 'and nothing earns the instant it is switched off').toBe(false)
  })

  it('the AUTHORITATIVE body is never cached, even with a pass open', async () => {
    /* the half of OSE-T-01 the pass boundary does not cover: validation, signing
       and publication read the authoritative calculation, and they can run in
       the same breath as a mutation. So `oilEvidence` itself must never consult
       the memo — only `oilEvidenceOf` may, and only inside a pass. */
    const row = onlyEarningRow(SAT)
    const item = rowItemKey(row.rid)
    oilReadPass(() => { oilEvidenceOf(SAT) })
    ;(DAYS[SAT] as any).oild = { items: { [item]: 0 } }
    oilReadPass(() => {
      expect(itemMasked(oilEvidence(SAT), item), 'the fresh build sees the new mark').toBe(true)
    })
  })

  it('a read pass does not outlive itself — a change after it closes is seen', async () => {
    const row = onlyEarningRow(SAT)
    const item = rowItemKey(row.rid)
    oilReadPass(() => { oilItemMasked(SAT, item); oilWouldEarn(SAT) })
    toggleOilItem(SAT, item)
    expect(oilItemMasked(SAT, item), 'the cache died with the pass').toBe(true)
    expect(oilWouldEarn(SAT), 'and the money agrees').toBe(false)
  })

  it('one pass holds two different days apart', async () => {
    const a = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    const b = addRow(6, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    HOOKS.oilEarningDay = (di: number) => di === SAT || di === 6
    HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === 6 ? '2026-07-19' : '2026-07-15')
    ;(DAYS[SAT] as any).oild = { items: { [rowItemKey(a.rid)]: 0 } }
    oilReadPass(() => {
      expect(oilItemMasked(SAT, rowItemKey(a.rid)), 'the Saturday item is off').toBe(true)
      expect(oilItemMasked(6, rowItemKey(b.rid)), 'the Sunday item is not').toBe(false)
    })
  })
})

