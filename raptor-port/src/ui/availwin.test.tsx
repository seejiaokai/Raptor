// @vitest-environment jsdom
/* [ALL-AVAIL-WINDOW] — the counter opens a movable window of PUCKS (owner, D38;
   mock approved as the design of record, D41).

   WHAT THIS FILE IS FOR. oilcount.test.tsx owns the agreement between the chip's
   NUMBER and the list its tap opens — Fable correction 2, which exists because
   they were once two readers. This file owns the WINDOW ITSELF: its two jobs,
   the mode rule that decides whether the second one is offered at all, the role
   gate on the half that moves money, and the flags that are the entire reason
   the owner asked for it.

   THE FLAGS ARE THE POINT (D36 + D38). A man whose ops brief sits inside his
   standard debrief must APPEAR, FLAGGED, so the scheduler sees the overlap and
   judges it. The availability window stays narrow precisely because the app's
   job here is to SURFACE the clash, not to remove him. D36 is the ruling that
   REFUSES to filter him out, so there is a test below that fails if a later
   session "fixes" the list by dropping flagged men from it. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { oilFigureFor } from './oilmode'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'
import * as view from '../state/view'
import { AVAILWIN } from './pops'
import { availableFor } from '../leavewar/sync'
import { loadWeek, resetSession } from '../state/store'
import { CURWEEK } from '../engine/waves'
import { shiftWeek } from './weeknav'
import { stashClear } from '../engine/weekstash'
import { signOf, setDayApproved, dayCurVer } from '../engine/publish'
import { validate } from '../engine/validate'
import { toggleOilPerson, toggleOilItem, oilFromWords } from './oilmode'
import { commitUnpublish } from '../state/sched-commit'
import { elogRows } from '../engine/editlog'

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
/* bane is a PILOT and cinder a WSO in the demo roster, so the crowd exercises
   BOTH columns — a fixture with one seat kind would test one column twice and
   call the split proven (anti-pattern 7, the convenient day). */
const CROWD = ['bane', 'freak']
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
afterEach(async () => {
  setOilDay(null)
  await act(async () => { notify() })
})

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const puckRow = (di: number) => {
  ;(DAYS[di] as any).ground = [{ prog: 'OPS BRIEF', str: '0900', end: '1700', who: 'allavail' }]
  ensureRowIds(DAYS)
  return rowItemKey((DAYS[di] as any).ground[0].rid)
}
const chipEl = () => $('#sbBoard .sb-panel.grnd .oilcount')
const win = () => $('.availwin')
const openWin = async (di: number) => { await open(di); await click(chipEl()) }
const tabs = () => $$('.availwin .win-tab')
const rows = () => $$('.availwin .rpuck')
const winSeat = (id: string) => ($$('.availwin .seat.oilpk') as HTMLElement[])
  .find(s => s.dataset.oilp === id)!
const cs = (id: string) => (PEOPLE as any)[id].cs

describe('the window IS the design of record (D38-D41)', () => {
  it('it opens from the counter and is not a Sheet — no scrim, nothing blocked', async () => {
    puckRow(TUE)
    await openWin(TUE)
    expect(win(), 'the window is open').toBeTruthy()
    /* THE WHOLE POINT OF THE SURFACE: he scrolls AND EDITS the schedule behind
       it. A Sheet paints a scrim and traps everything under it; this must not.
       The board's own panels stay in the document and stay reachable. */
    expect($('.sheet-scrim, .modal-scrim'), 'no scrim — the schedule stays live').toBeFalsy()
    expect($('#sbBoard .sb-panel'), 'the board is still there behind it').toBeTruthy()
  })

  it('the title bar carries the app\'s OWN six-dot grip, not a dashed or burger glyph (D40)', async () => {
    puckRow(TUE)
    await openWin(TUE)
    const grip = $('.availwin .win-grip')
    expect(grip, 'a grip exists').toBeTruthy()
    /* U+283F — the SIX-dot braille grip every draggable row and section header
       wears. Not taste: it is the app's existing vocabulary for "drag me", so
       the window reads as movable without being explained. */
    expect((grip.textContent || '').trim()).toBe('⠿')
  })

  it('it names the EVENT, read from the model rather than the page', async () => {
    puckRow(TUE)
    await openWin(TUE)
    expect(($('.availwin .win-ttl').textContent || '')).toContain('OPS BRIEF')
  })

  it('and it says WHICH of the two answers it is showing (D37/D44)', async () => {
    puckRow(TUE)
    await openWin(TUE)
    expect(($('.availwin .win-from').textContent || ''))
      .toContain('as things stand now')
  })
})

describe('the mode rule — availability always, earning only in the mode', () => {
  it('ON AN ORDINARY WEEKDAY there are no tabs at all, just the one list', async () => {
    puckRow(TUE)
    await openWin(TUE)
    expect(tabs().length, 'a Tuesday cannot earn, so there is nothing to offer').toBe(0)
    expect($('.availwin .win-one'), 'one heading instead').toBeTruthy()
    expect((win().textContent || '').toLowerCase(), 'and no talk of OIL').not.toContain('oil')
  })

  it('ON A WEEKEND WITH THE MODE OFF there are STILL no tabs — the mode decides, not the day', async () => {
    puckRow(SAT)
    await openWin(SAT)
    expect(tabs().length, 'the day can earn, but OIL Earn is switched off').toBe(0)
  })

  it('WITH THE MODE ON the second half appears, and the counter lands on it', async () => {
    puckRow(SAT)
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    const t = tabs()
    expect(t.length, 'two jobs, one window').toBe(2)
    expect(t[0].textContent, 'availability is still the first half offered').toContain('available')
    expect(t[1].textContent, 'and the earning half second').toContain('earns OIL')
    /* inside the mode the counter IS the door to switching men off — that is the
       job he opened it for — so it lands on that half. He can step back to the
       other tab, which is why availability keeps its place as the first one. */
    expect(t[1].className, 'in the mode it opens on the earning half').toContain('on')
    await click(t[0])
    expect(tabs()[0].className, 'and he can step back to availability').toContain('on')
  })
})

describe('pilots LEFT, WSOs RIGHT, one puck per row (D38/D39/D51)', () => {
  it('two columns, in that order, and each man gets his own row', async () => {
    puckRow(TUE)
    await openWin(TUE)
    const heads = $$('.availwin .rcol .rh').map(h => (h.textContent || '').trim())
    expect(heads.length).toBe(2)
    expect(heads[0]).toMatch(/^PILOTS/i)
    expect(heads[1]).toMatch(/^WSOS/i)
    /* the crowd is one pilot and one WSO, so a split that silently put both in
       one column would be caught here rather than looking merely uneven */
    const cols = $$('.availwin .rcol')
    expect(cols[0].querySelectorAll('.rpuck').length, 'the pilot').toBe(1)
    expect(cols[1].querySelectorAll('.rpuck').length, 'the WSO').toBe(1)
  })

  it('ONE PUCK PER ROW AT EVERY WIDTH — a column is a list running down (D39)', async () => {
    puckRow(TUE)
    await openWin(TUE)
    const r = rows()
    expect(r.length).toBe(CROWD.length)
    for (const x of r) expect(x.querySelectorAll('.puck').length).toBe(1)
  })

  it('THE PUCK IS NEVER STRETCHED to fill the column', async () => {
    puckRow(TUE)
    await openWin(TUE)
    /* a puck is a MEASURED 74x15 the whole app shares, pinned !important and
       watched by the browser geometry gate. This asserts the markup does not
       ask for a stretch; the geometry gate measures the real thing in a real
       browser, which is the check that can actually see pixels. */
    for (const x of rows()) {
      const p = x.querySelector('.puck') as HTMLElement
      expect(p.style.width, 'no inline width fighting the shared size').toBe('')
      expect(p.className, 'the ordinary puck, at the ordinary size').toContain('puck')
    }
  })
})

describe('THE FLAGS ARE THE POINT — a clash is SHOWN, never filtered out (D36/D38)', () => {
  /* The owner's own example: a man whose ops brief sits inside his standard
     debrief must appear, flagged, so the scheduler sees the overlap and judges
     it. Widening the availability window to hide him is the change D36
     REFUSES, so this test exists to fail if a later session makes it. */
  const clashRow = (di: number) => {
    ;(DAYS[di] as any).ground = [
      { prog: 'OPS BRIEF', str: '0900', end: '1700', who: 'allavail' },
      /* the same man, booked on something else across the same hours */
      { prog: 'HQ ENGAGEMENT', str: '0900', end: '1700', who: CROWD[0] },
    ]
    ensureRowIds(DAYS)
  }

  it('a man with a warning is STILL LISTED, and wears his reason', async () => {
    clashRow(TUE)
    await openWin(TUE)
    const said = win().textContent || ''
    expect(said, 'he is not filtered out — that is the change D36 refuses')
      .toContain(cs(CROWD[0]))
    expect(rows().length, 'every man the chip counted is still a row').toBe(CROWD.length)
  })

  it('and the window can be tapped for his reason in full', async () => {
    clashRow(TUE)
    await openWin(TUE)
    const mine = rows().find(r => (r.textContent || '').includes(cs(CROWD[0])))!
    await click(mine.querySelector('.puck'))
    const foot = ($('.availwin .win-foot').textContent || '')
    expect(foot, 'the footer answers about the man tapped').toContain(cs(CROWD[0]))
  })
})

/* THE OWNER'S OWN CASE, END TO END (D36 + D38; Fable S2, 23 Sep 26).
   "click on his puck and know that the ops brief he's scheduled for as all avail
   is inbetween the standard debrief time". A man who lands at 15:00 is free from
   dekit (D36 keeps availability narrow ON PURPOSE), so he is rightly IN the
   crowd behind a 15:30 ops brief — and the window must FLAG that the brief sits
   inside his 15:00–17:00 debrief. The warning list can never say it: its pass
   skips placeholders, so a man only BEHIND one is on no event at all.

   THE REAL RESOLVER, not the stub the rest of this file uses. A stub puts the
   man in the crowd whatever the rules say, and then "he is listed" proves the
   fixture. Here the app's own availability rule decides he belongs, which is the
   other half of the owner's example — flagged, AND still listed. */
describe("the owner's case — an ops brief inside a man's own debrief is FLAGGED (D38)", () => {
  const FLYER = 'bane'     // a pilot, in the demo roster
  const STAYER = 'harpoon' // not on the line; nothing else booked across the brief
  const debriefDay = (di: number, brief: [string, string]) => {
    const d = DAYS[di] as any
    /* a clean day: one sortie, landing 15:00, and the ops brief. Nothing else,
       so every flag in the window comes from THIS pair and nothing in the seed */
    d.waves = [{ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [
      { cs: 'VL', msn: 'BFM', to: '13:30', ld: '15:00',
        aircraft: [{ p: FLYER, w: 'freak', area: '', rmks: '', opts: {} }] }] }]
    d.dutywaves = []; d.sims = { amt: [], oft: [] }; d.allhands = []
    d.ground = [{ prog: 'OPS BRIEF', str: brief[0], end: brief[1], who: 'allavail' }]
    ensureRowIds(DAYS)
  }
  const rowOf = (id: string) => rows().find(r => r.dataset.awp === id)
  beforeEach(() => {
    HOOKS.oilSentinel = (iso: string, w: [number, number], day: any) => availableFor(iso, w, day)
  })

  it('he lands 15:00 and the ops brief is 15:30–16:30: he is LISTED, and FLAGGED with the debrief', async () => {
    debriefDay(TUE, ['15:30', '16:30'])
    await openWin(TUE)
    const his = rowOf(FLYER)
    expect(his, 'free from dekit, so the app\'s own rule puts him in the crowd (D36)').toBeTruthy()
    expect(his!.className, 'and he wears the amber flag, not the red one').toContain('flagged')
    expect(his!.textContent || '', 'his reason names the debrief').toContain('debrief')
    await click(his!.querySelector('.puck'))
    /* the warning list's OWN sentence for a debrief (one body, validate.ts
       debriefSays) — so the window and the list can never word it differently */
    expect($('.availwin .win-foot').textContent || '', 'a tap gives the full sentence')
      .toContain('Not enough time to attend the VL BFM debrief — OPS BRIEF sits inside 15:00–17:00')
  })

  it('a man with nothing else on is listed CLEAN — the flag is about HIS debrief, not the day', async () => {
    debriefDay(TUE, ['15:30', '16:30'])
    await openWin(TUE)
    const other = rowOf(STAYER)
    expect(other, 'he is in the crowd').toBeTruthy()
    expect(other!.className, 'and carries no flag').not.toMatch(/flagged|clash/)
  })

  it('an ops brief AFTER his debrief is over flags nothing — the window is not "he flew today"', async () => {
    debriefDay(TUE, ['17:00', '18:00'])
    await openWin(TUE)
    const his = rowOf(FLYER)
    expect(his, 'still listed').toBeTruthy()
    expect(his!.className, 'no flag: 17:00 is the end of his 15:00–17:00 debrief').not.toMatch(/flagged|clash/)
  })

  it('and the hint under the list COUNTS him — the rows and the count are one reading', async () => {
    debriefDay(TUE, ['15:30', '16:30'])
    await openWin(TUE)
    expect(rowOf(FLYER)!.className, 'he is flagged').toContain('flagged')
    const n = rows().filter(r => /flagged|clash/.test(r.className)).length
    expect($('.availwin .win-foot').textContent || '', 'the count under the list matches the rows')
      .toContain(n === 1 ? 'One man is flagged' : `${n} men are flagged`)
  })
})

describe('the earning half moves real money, so it is gated and it writes (D43/D44)', () => {
  /* NOTE: this does NOT create the row. `puckRow` rewrites `ground` and
     ensureRowIds mints a FRESH id, so calling it again would leave the caller
     holding a key for a row that no longer exists — which is what happened, and
     it read as "he earns nothing" when he earns a full day. The caller makes the
     row and owns its key. */
  const earnWin = async () => {
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    await click(tabs()[1])
  }

  it('switching a man off in the window takes his credit away for real', async () => {
    /* THE REAL DOWNSTREAM RESULT, not just the screen (checklist: "the money,
       not just the screen"). This one test uses the crowd the step-7 fixtures
       use, because those two men demonstrably EARN from a Saturday row — who
       earns depends on what else each man is on that day, and a test that
       asserts money against a crowd that earns nothing proves only its own
       fixture. The pilot/WSO split is covered by the column tests above. */
    HOOKS.oilSentinel = () => ['plasma', 'stiff']
    /* and clear the seed Saturday's OWN duty and sim rows, as the step-7
       fixtures do. A man's figure is attributed to the events that COUNTED
       towards his day (O-1), so with a duty desk also on the day his credit may
       hang off the desk and this ground row would contribute nothing extra —
       the test would then be measuring the seed day, not the window. */
    Object.assign(DAYS[SAT] as any, { dutywaves: [], sims: { amt: [], oft: [] }, oild: undefined })
    const item = puckRow(SAT)
    await earnWin()
    const before = oilFigureFor(SAT, 'plasma', item)
    expect(before, 'he earns from this event to begin with').toBeTruthy()
    await click(winSeat('plasma').querySelector('.puck'))
    expect(oilFigureFor(SAT, 'plasma', item), 'and the window wrote the decision').toBeFalsy()
    expect(oilFigureFor(SAT, 'stiff', item), 'the man beside him is untouched').toBe(before)
  })

  it('a MEMBER may read who is available but may NOT change who earns', async () => {
    HOOKS.oilSentinel = () => ['plasma', 'stiff']
    Object.assign(DAYS[SAT] as any, { dutywaves: [], sims: { amt: [], oft: [] }, oild: undefined })
    const item = puckRow(SAT)
    await earnWin()
    const before = oilFigureFor(SAT, 'plasma', item)
    expect(before, 'he earns to begin with').toBeTruthy()
    await act(async () => { setSession({ user: 'us', role: 'main' }); notify() })
    /* reading who a placeholder stands for is NOT a privileged act — the count
       chip's own handler carries no role gate on purpose, because anybody
       reading the schedule may fairly ask who the puck stands for. The EDIT half
       is what is gated, and it is gated on the WRITE, not merely by hiding the
       control: a member who reaches the puck must still change nothing. */
    expect(win(), 'he can still read it').toBeTruthy()
    toasts = []
    await click(winSeat('plasma').querySelector('.puck'))
    expect(oilFigureFor(SAT, 'plasma', item), 'his credit is untouched').toBe(before)
    expect(toasts.join(' '), 'and he is told why, rather than nothing happening')
      .toContain('Only a scheduler')
    await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  })
})

describe('D65 — what a tap on a man selects depends on the mode (owner, 23 Sep 26)', () => {
  /* "What about like normal all avail puck when not in oil earn mode? I would
     like a tap on a man to highlight him everywhere as well." — and, for the
     mode, "For oil earn only Id say no." */
  afterEach(async () => { await act(async () => { view.selDrop(); notify() }) })

  it('OIL Earn OFF: the tap highlights him everywhere AND the footer gives his reason', async () => {
    puckRow(TUE)
    await openWin(TUE)
    expect(view.SELID, 'nobody selected to begin with').toBeNull()
    const his = rows().find(r => r.dataset.awp === CROWD[0])!
    await click(his.querySelector('.puck'))
    expect(view.SELID, 'the ordinary puck selection — he lights up everywhere').toBe(CROWD[0])
    expect($('.availwin .win-foot').textContent || '', 'and the window still says why').toContain(cs(CROWD[0]))
    await click(rows().find(r => r.dataset.awp === CROWD[0])!.querySelector('.puck'))
    expect(view.SELID, 'a second tap clears it, as on any puck').toBeNull()
  })

  it('OIL Earn ON, on the earn tab: the tap switches his earning and selects NOBODY', async () => {
    HOOKS.oilSentinel = () => ['plasma', 'stiff']
    Object.assign(DAYS[SAT] as any, { dutywaves: [], sims: { amt: [], oft: [] }, oild: undefined })
    const item = puckRow(SAT)
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    const before = oilFigureFor(SAT, 'plasma', item)
    expect(before, 'he earns to begin with').toBeTruthy()
    await click(winSeat('plasma').querySelector('.puck'))
    expect(oilFigureFor(SAT, 'plasma', item), 'the tap did its one job').toBeFalsy()
    expect(view.SELID, 'and selected nobody — inside the mode no tap selects').toBeNull()
  })

  it("OIL Earn ON, on the who's-available tab: the reason, and still no selection", async () => {
    puckRow(SAT)
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    await click(tabs()[0])
    await click(rows()[0].querySelector('.puck'))
    expect($('.availwin .win-foot').textContent || '', 'the reason is given').toContain(' — ')
    expect(view.SELID, 'the ruling keys it to the MODE, not the tab').toBeNull()
  })
})

describe('D66 — the window closes on a page, week or session change (owner, 23 Sep 26)', () => {
  /* "close it". The outside-click rule still does NOT apply — a click on the
     schedule behind must never close it (D38) — so the last test here pins that
     the window survives an ordinary edit behind it. */
  it('leaving the schedule for another page closes it (Fable S13)', async () => {
    puckRow(TUE)
    await openWin(TUE)
    expect(AVAILWIN, 'open').toBeTruthy()
    await act(async () => { view.setPage('leavewar'); notify() })
    expect(AVAILWIN, 'the Leave War does not carry a floating schedule tool').toBeNull()
    await act(async () => { view.setPage('editsched'); notify() })
  })

  it('switching between Edit Schedule and View-only Sched closes it too', async () => {
    puckRow(TUE)
    await openWin(TUE)
    await act(async () => { view.setPage('viewsched'); notify() })
    expect(AVAILWIN, 'the two pages show different versions of the day (D44)').toBeNull()
    await act(async () => { view.setPage('editsched'); notify() })
  })

  it('a week change closes it (Fable S4)', async () => {
    puckRow(TUE)
    await openWin(TUE)
    const wk = CURWEEK
    try {
      await act(async () => { loadWeek(shiftWeek(wk, 1)); notify() })
      expect(AVAILWIN, 'the event it came from is no longer on screen').toBeNull()
    } finally {
      /* back to the seeded week with nothing stashed, so no later test reads
         this one's edited Tuesday out of the week store */
      await act(async () => { stashClear(); loadWeek(wk); stashClear(); notify() })
    }
  })

  it('a logout closes it — the next person inherits nothing (Fable S12)', async () => {
    puckRow(TUE)
    await openWin(TUE)
    await act(async () => { resetSession({ user: 'us', role: 'main' }); notify() })
    expect(AVAILWIN, 'the member does not land on the admin\'s window').toBeNull()
    await act(async () => { resetSession({ user: 'ad', role: 'admin' }); view.setPage('editsched'); notify() })
  })

  it('but an ordinary edit behind it does NOT close it — the outside-click rule does not apply (D38)', async () => {
    puckRow(TUE)
    await openWin(TUE)
    await click($('#sbBoard .sb-panel'))
    await act(async () => { notify() })
    expect(AVAILWIN, 'still open: editing behind it is the whole point').toBeTruthy()
  })
})

describe('a published day: the window reads the record, not today (Fable S3, S5)', () => {
  /* the crowd the step-7 fixtures use, because those two men demonstrably EARN
     from a Saturday row — so "who earned on the issued day" has an answer */
  const issuedSat = () => {
    HOOKS.oilSentinel = () => ['plasma', 'stiff']
    Object.assign(DAYS[SAT] as any, { dutywaves: [], sims: { amt: [], oft: [] }, oild: undefined })
    const item = puckRow(SAT)
    const g = signOf(SAT); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(SAT, true)
    return item
  }
  /* TODAY moves on after the day went out: plasma is switched off on the working
     copy, and stiff is double-booked on two named rows across each other */
  const todayMovesOn = (item: string) => {
    toggleOilPerson(SAT, 'plasma', item)
    ;(DAYS[SAT] as any).ground.push(
      { prog: 'HQ VISIT', str: '1000', end: '1100', who: 'stiff' },
      { prog: 'SIM REVIEW', str: '1030', end: '1130', who: 'stiff' })
    ensureRowIds(DAYS)
    validate()
  }
  const viewChip = () => $('#vWeek .day[data-day="5"] .oilcount')
  afterEach(async () => {
    /* the book keys the shared beforeEach does not reset — an unpublish writes
       both — so no later test inherits a retired Saturday or a "correcting" mark */
    ;(SCHED as any).retired = {}; (SCHED as any).correcting = {}
    await act(async () => { view.setPage('editsched'); notify() })
  })

  it("the view page's issued face: the window wears none of TODAY's flags", async () => {
    const item = issuedSat()
    todayMovesOn(item)
    await act(async () => { view.setPage('viewsched'); notify() })
    expect(viewChip(), 'the issued face draws the chip').toBeTruthy()
    expect(viewChip().dataset.oilver, 'and it carries the issued version').toBeTruthy()
    await click(viewChip())
    const stiff = rows().find(r => r.dataset.awp === 'stiff')!
    expect(stiff, 'the issued membership').toBeTruthy()
    expect(stiff.className, "today's double-booking is not on the record").not.toMatch(/clash|flagged/)
  })

  /* THE ONE PLACE A VERSION'S CHIP MEETS THE EARN MODE: the board, previewing
     the issued version through its plan selector, with OIL Earn on. (The view
     page never has the mode — it ends when the board closes.) */
  const boardIssuedWin = async () => {
    await open(SAT)
    await act(async () => { setOilDay(SAT); view.setDayPreview(SAT, dayCurVer(SAT)); notify() })
    await click(chipEl())
  }
  afterEach(async () => { await act(async () => { view.setDayPreview(SAT, null); notify() }) })

  it("the board's issued preview: the earn tab counts who earned ON THE RECORD, not today", async () => {
    const item = issuedSat()
    todayMovesOn(item)
    await boardIssuedWin()
    expect(AVAILWIN && AVAILWIN.ver, 'opened from the issued version').toBeTruthy()
    expect(tabs().length, 'the mode is on, so the earn half is offered').toBe(2)
    await click(tabs()[1])
    expect(tabs()[1].textContent || '', 'both men earned on the day as issued — not today\'s 1 of 2')
      .toContain('2 of 2')
  })

  it('and its earn half is READ-ONLY — a record is read, never edited', async () => {
    const item = issuedSat()
    await boardIssuedWin()
    await click(tabs()[1])
    const before = JSON.stringify((DAYS[SAT] as any).oild || {})
    await click(rows().find(r => r.dataset.awp === 'plasma')!.querySelector('.puck'))
    expect(JSON.stringify((DAYS[SAT] as any).oild || {}), 'nothing written to the working copy').toBe(before)
    expect($('.availwin .win-foot').textContent || '', 'and it says where to change it')
      .toContain('working copy')
    expect(oilFigureFor(SAT, 'plasma', item), 'he still earns').toBeTruthy()
  })

  it('UNPUBLISH closes it — the version it was reading is gone (Fable S5)', async () => {
    issuedSat()
    await act(async () => { view.setPage('viewsched'); notify() })
    await click(viewChip())
    expect(AVAILWIN, 'open on the issued list').toBeTruthy()
    await act(async () => { commitUnpublish(SAT); notify() })
    expect(AVAILWIN, 'closed rather than labelling a list it can no longer read').toBeNull()
  })

  it('a PARKED PLAN is not an issued day — its words say "as things stand now"', () => {
    expect(oilFromWords('d:abc'), 'a plan keeps no frozen membership').toBe('who is free as things stand now')
    expect(oilFromWords('2026-07-18#0'), 'an issued version still says so').toBe('who was free when this day was issued')
  })
})

describe('the earn half, on the working copy (Fable S6, S7)', () => {
  const earnSat = async () => {
    HOOKS.oilSentinel = () => ['plasma', 'stiff']
    Object.assign(DAYS[SAT] as any, { dutywaves: [], sims: { amt: [], oft: [] }, oild: undefined })
    const item = puckRow(SAT)
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    return item
  }

  it('a switch made in the window leaves the SAME history line as the board (S7)', async () => {
    const item = await earnSat()
    await click(winSeat('plasma').querySelector('.puck'))
    expect(oilFigureFor(SAT, 'plasma', item), 'the switch happened').toBeFalsy()
    const lines = elogRows(SAT).map(r => r.lbl)
    expect(lines, 'and History can answer "why is my balance short?"')
      .toContain(`${cs('plasma')} earns nothing from OPS BRIEF`)
  })

  it("a row switched off by its name: the tap says the BOARD's refusal and writes nothing (S6)", async () => {
    const item = await earnSat()
    await act(async () => { toggleOilItem(SAT, item); notify() })
    const before = JSON.stringify((DAYS[SAT] as any).oild || {})
    toasts = []
    await click(rows().find(r => r.dataset.awp === 'plasma')!.querySelector('.puck'))
    expect(toasts.join(' '), 'the board\'s own words').toContain('This event earns nobody any OIL — turn the event back on first')
    expect(JSON.stringify((DAYS[SAT] as any).oild || {}), 'no decision written under the mask').toBe(before)
  })
})

describe('the row behind the window is deleted, or its puck is (Fable S14)', () => {
  it('the row deleted: the window SAYS so — never a confident "0 available"', async () => {
    puckRow(TUE)
    await openWin(TUE)
    await act(async () => { (DAYS[TUE] as any).ground = []; notify() })
    expect($('.availwin .win-body').textContent || '').toContain('no longer on the schedule')
    expect($('.availwin .win-one').textContent || '', 'no count at all').not.toMatch(/\d/)
    expect(AVAILWIN, 'it outlives the row — he may undo').toBeTruthy()
  })

  it('the placeholder dragged off the row: it says THAT', async () => {
    puckRow(TUE)
    await openWin(TUE)
    await act(async () => { (DAYS[TUE] as any).ground[0].who = ''; notify() })
    expect($('.availwin .win-body').textContent || '').toContain('no ALL or ALL AVAIL puck on this row')
  })
})

describe('every window starts clean (Fable S11)', () => {
  /* Open A, tap a man, close it, open B: B's footer used to carry A's sentence
     about a man who is not behind B, because the sentence lived in a component
     that is never unmounted. Reproduced for real on 23 Sep 26 — this file's
     own tests leaked one window's sentence into the next. */
  it("a window opened after another shows its OWN hint, not the last tap's sentence", async () => {
    ;(DAYS[TUE] as any).ground = [
      { prog: 'OPS BRIEF', str: '0900', end: '1000', who: 'allavail' },
      { prog: 'SAFETY BRIEF', str: '1400', end: '1500', who: 'allavail' },
    ]
    ensureRowIds(DAYS)
    await open(TUE)
    const chips = () => $$('#sbBoard .sb-panel.grnd .oilcount')
    expect(chips().length, 'two rows, two chips').toBe(2)
    await click(chips()[0])
    await click(rows()[0].querySelector('.puck'))
    const first = $('.availwin .win-foot').textContent || ''
    expect(first, 'the tap wrote a sentence about the man').toContain(' — ')
    await click($('.availwin .win-x'))
    await click(chips()[1])
    expect($('.availwin .win-ttl').textContent || '', 'the second window is open').toContain('SAFETY BRIEF')
    expect($('.availwin .win-foot').textContent || '', 'and it opens on its own hint')
      .toMatch(/^Tap a puck/)
  })

  it('and switching tab starts that tab on its own hint too', async () => {
    puckRow(SAT)
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    await click(tabs()[0])
    await click(rows()[0].querySelector('.puck'))
    expect($('.availwin .win-foot').textContent || '').toContain(' — ')
    await click(tabs()[1])
    expect($('.availwin .win-foot').textContent || '', 'the earn tab explains its own tap')
      .toContain('Tap a puck to stop a man earning')
  })
})

describe('closing it', () => {
  it('the close button shuts it, and it does not come back on the next render', async () => {
    puckRow(TUE)
    await openWin(TUE)
    await click($('.availwin .win-x'))
    expect(AVAILWIN, 'the model forgot it').toBeNull()
    await act(async () => { notify() })
    expect($('.availwin:not([hidden])'), 'and it stays shut through a re-render').toBeFalsy()
  })
})
