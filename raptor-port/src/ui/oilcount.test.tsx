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
import { oilSentinelList } from './oilmode'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'

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

describe('the number and the list are the same answer (Fable correction 2)', () => {
  it('tapping the chip names the men it counted, on a weekday', async () => {
    puckRow(TUE)
    await open(TUE)
    await click(chipEl())
    const said = toasts.join(' ')
    expect(said, 'the same two the chip counted').toContain('2 with nothing else on')
    expect(said.toLowerCase(), 'and still no talk of OIL on a Tuesday').not.toContain('oil')
    for (const id of CROWD) expect(said, `${id} is named`).toContain((PEOPLE as any)[id].cs)
  })

  it('and it never says "nobody" about a puck the chip has just counted', async () => {
    puckRow(TUE)
    await open(TUE)
    await click(chipEl())
    expect(toasts.join(' ')).not.toContain('Nobody is behind this puck')
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

  it('THE TAP READS THE ISSUED LIST, not whoever happens to be free now', () => {
    const item = puckRow(SAT)
    publish(SAT)
    const ver = dayCurVer(SAT)
    HOOKS.oilSentinel = () => ['plasma']                  // the crowd changes after the day went out
    const live = oilSentinelList(SAT, item)
    const issued = withDaySnap(SAT, ver, () => oilSentinelList(SAT, item))
    expect(issued, 'the issued page lists the men it was issued with').toContain('2 behind this puck')
    expect(live, 'and the working copy shows today\'s answer').toContain('1 behind this puck')
  })
})

describe('what must NOT carry a count', () => {
  it('the next-week peek draws a bare puck — it is a peek, not the day', async () => {
    puckRow(SAT)
    await open(SAT)
    expect($$('#sbBoard .peek .oilcount').length, 'the roll-call says it must not').toBe(0)
  })
})
