// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] STEP 9a, ON SCREEN — the count shows on every seat, on
   every day, outside the earn mode, and the number and the list can never
   disagree.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 9.

   D27 — the pucks are a SCHEDULING feature: dropped anywhere they work out who
   would attend and show the count, whether or not the day earns OIL and whether
   or not the mode is on. Until now the count was a by-product of working out the
   money, so five days a week the puck stood for nobody and the chip said nothing.

   D37 — the count reads as WHAT IT IS: who has nothing else on the programme at
   that time. Not a promise that they will be there, and on a day that earns
   nothing it must not talk about OIL at all.

   D44 — and once the day has gone out, the chip and its tap both read the
   ISSUED document. The snapshot is only installed while the page is being
   built, so a tap made afterwards would re-read the LIVE day and an issued page
   could show one number and list another (Codex OSE-R2-05). The chip therefore
   carries the version it was drawn from, and the tap opens that same version.

   ONE RESOLVER (Fable correction 2). The chip, its tap, the mode's opened pucks
   and the row's people list were four separate readers, which is how "27" and
   "Nobody is behind this puck on this day" ended up on the same puck. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf, setDayApproved, dayCurVer } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { oilSeatDeco, withDaySnap } from './html'
import { oilSentinelPeople, oilFromWords } from './oilmode'
import { openScheduler, closeScheduler } from './board'
import { setOilDay } from '../state/view'
import * as view from '../state/view'

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
const SAT = 5, TUE = 1
const SAT_ISO = '2026-07-18', TUE_ISO = '2026-07-14'
const CROWD = ['bane', 'stiff']
let toasts: string[] = []
const origToast = HOOKS.toast

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterAll(async () => {
  HOOKS.toast = origToast
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
})

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  toasts = []
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { setOilDay(null) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const puckRow = (di: number) => {
  ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'allavail' }]
  ensureRowIds(DAYS)
  return rowItemKey((DAYS[di] as any).ground[0].rid)
}
const chipEl = () => $('#sbBoard .sb-panel.grnd .oilcount')
const publish = (di: number) => {
  const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(di, true)
}

describe('the count shows on every day, with the mode off (D27)', () => {
  it('A WEEKDAY carries it — this is where it never appeared before', async () => {
    puckRow(TUE)
    await open(TUE)
    const c = chipEl()
    expect(c, 'the puck says how many it stands for').toBeTruthy()
    expect(c.textContent).toBe('2')
  })

  it('and it reads as WHAT IT IS, never as a promise about OIL (D37)', async () => {
    puckRow(TUE)
    await open(TUE)
    const t = chipEl().title
    expect(t, 'plain words for a plain fact').toContain('nothing else on')
    expect(t.toLowerCase(), 'a Tuesday earns nobody anything, so it must not mention it').not.toContain('oil')
  })

  it('THE WEEKEND WORDING IS UNTOUCHED — it still says what the men earn', async () => {
    puckRow(SAT)
    await open(SAT)
    expect(chipEl().title).toContain('earn')
  })

  it('a seat with a real person on it carries no count at all', async () => {
    ;(DAYS[TUE] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' }]
    ensureRowIds(DAYS)
    await open(TUE)
    expect($('#sbBoard .sb-panel.grnd .oilcount'), 'a named man is not a crowd').toBeFalsy()
  })
})

/* THE TAP NOW OPENS [ALL-AVAIL-WINDOW] (D38-D41), so these assertions moved with
   the surface. They used to read a one-line toast of names; the toast is gone and
   a test that still asserted it would be proving something no user can reach.
   What is being checked has NOT changed: the chip's number and the list its tap
   opens are the same answer, which is Fable correction 2 — they were two readers
   once, which is how a chip reading 27 came to sit over a tap saying nobody was
   behind the puck. */
describe('the number and the list are the same answer (Fable correction 2)', () => {
  it('tapping the chip opens the window, naming the men it counted', async () => {
    puckRow(TUE)
    await open(TUE)
    await click(chipEl())
    const w = $('.availwin')
    expect(w, 'the tap opens the window').toBeTruthy()
    const said = w.textContent || ''
    expect(said, 'the same two the chip counted').toContain('2')
    for (const id of CROWD) expect(said, `${id} is named`).toContain((PEOPLE as any)[id].cs)
    expect(said.toLowerCase(), 'and still no talk of OIL on a Tuesday').not.toContain('oil')
  })

  it('the two columns are pilots LEFT and WSOs RIGHT (D38/D51)', async () => {
    puckRow(TUE)
    await open(TUE)
    await click(chipEl())
    const cols = $$('.availwin .rcol .rh').map(h => (h.textContent || '').trim())
    expect(cols.length, 'two columns, never one wrapped list').toBe(2)
    expect(cols[0], 'pilots first').toMatch(/^PILOTS/i)
    expect(cols[1], 'WSOs second').toMatch(/^WSOS/i)
  })

  it('ONE PUCK PER ROW — a column is a list running down, not a wrapping grid (D39)', async () => {
    puckRow(TUE)
    await open(TUE)
    await click(chipEl())
    const rows = $$('.availwin .rpuck')
    expect(rows.length, 'one row per man the chip counted').toBe(CROWD.length)
    for (const r of rows) expect(r.querySelectorAll('.puck').length, 'exactly one puck in a row').toBe(1)
  })

  it('and it never says "nobody" about a puck the chip has just counted', async () => {
    puckRow(TUE)
    await open(TUE)
    await click(chipEl())
    expect(($('.availwin').textContent || '')).not.toContain('Nobody is behind this puck')
  })

  it('WITH THE MODE OFF THERE ARE NO TABS AT ALL — just the one list (the mode rule)', async () => {
    puckRow(TUE)
    await open(TUE)
    await click(chipEl())
    expect($$('.availwin .win-tab').length, 'earning is a mode; availability is not').toBe(0)
    expect($('.availwin .win-one'), 'one heading instead').toBeTruthy()
  })
})

describe('an issued day answers from the document it was drawn in (D44, OSE-R2-05)', () => {
  it('the chip carries the version it came from, so its tap can find it again', () => {
    const item = puckRow(SAT)
    publish(SAT)
    const ver = dayCurVer(SAT)
    const drawn = withDaySnap(SAT, ver, () => oilSeatDeco(SAT, 'allavail', `g:${SAT}.0`).chip)
    expect(drawn, 'the version is on the chip').toContain(`data-oilver="${ver}"`)
    expect(drawn).toContain(`data-oilsent="${item}"`)
  })

  it('a chip drawn on the WORKING copy carries no version, so its tap reads today', () => {
    puckRow(SAT)
    const drawn = oilSeatDeco(SAT, 'allavail', `g:${SAT}.0`).chip
    expect(drawn).toContain('data-oilver=""')
  })

  it('THE WINDOW READS THE ISSUED LIST, not whoever happens to be free now', () => {
    const item = puckRow(SAT)
    publish(SAT)
    const ver = dayCurVer(SAT)
    HOOKS.oilSentinel = () => ['plasma']                  // the crowd changes after the day went out
    const live = oilSentinelPeople(SAT, item)
    const issued = withDaySnap(SAT, ver, () => oilSentinelPeople(SAT, item))
    expect(issued.length, 'the issued page lists the men it was issued with').toBe(2)
    expect(live.length, 'and the working copy shows what is true today').toBe(1)
    /* The window carries the version the chip was drawn in for exactly this
       reason (D44 / Codex OSE-R2-05): the snapshot is installed only while the
       page is built, so a window that re-read the live day when it opened would
       list whoever is free NOW under a number frozen when the day went out. And
       it SAYS which of the two it is showing, in the chip's own words. */
    expect(oilFromWords(ver)).toBe('who was free when this day was issued')
    expect(oilFromWords('')).toBe('who is free as things stand now')
  })
})

describe('what must NOT carry a count', () => {
  it('the next-week peek draws a bare puck — it is a peek, not the day', async () => {
    puckRow(SAT)
    await open(SAT)
    expect($$('#sbBoard .peek .oilcount').length, 'the roll-call says it must not').toBe(0)
  })
})

/* THE WEEK'S OWN TAP — FOUND BY A BREAK TEST, 23 Sep 26, and it had NO test at
   all. Cutting the week handler's wire to the window left all 1,686 component
   tests green, which is the proof §8.4 asks for: that surface was unwired as far
   as the suite could tell.

   THE CHIP IS DRAWN ON BOTH SURFACES BY ONE BODY (`oilSeatDeco`, "shared by the
   week (lSeat) and the board (sbSeat)"), and interactions.ts routes the week's
   tap precisely because the chip is part of the ISSUED SCHEDULE, not a board
   control. So there were always two doors and only one of them was ever opened
   by a test — the same shape as the three defects the owner found by hand on
   21 Sep 26, every one of them a surface a finished rule was never wired to. */
describe('the WEEK opens the same window as the board (both surfaces draw the chip)', () => {
  const weekChip = () => $('#eWeek .oilcount')

  it('the week draws the count chip at all', async () => {
    puckRow(TUE)
    await act(async () => { notify() })
    expect(weekChip(), 'the chip is part of the schedule, not a board control').toBeTruthy()
  })

  it('and tapping it there opens the window, with the board CLOSED', async () => {
    puckRow(TUE)
    /* the board must genuinely be shut. Both handlers are document-level, so a
       board left open by an earlier test could answer this click first — and the
       test would pass through the BOARD's wire while claiming to prove the
       week's, which is the very thing the break test just showed is untested. */
    await act(async () => { closeScheduler(); notify() })
    /* asked of the MODEL, not the markup: closeScheduler leaves the board's
       shell in the DOM and only drops the day it was showing, so a DOM test
       here would fail on a board that is genuinely shut. */
    expect(view.SBDAY, 'this is the week, not the board').toBeNull()
    await click(weekChip())
    const w = $('.availwin')
    expect(w, 'the week tap opens the same window').toBeTruthy()
    const said = w.textContent || ''
    for (const id of CROWD) expect(said, `${id} is named`).toContain((PEOPLE as any)[id].cs)
  })
})
