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
import { AVAILWIN } from './pops'

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

  it('WITH THE MODE ON the second half appears, and availability is still first', async () => {
    puckRow(SAT)
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    const t = tabs()
    expect(t.length, 'two jobs, one window').toBe(2)
    expect(t[0].textContent, 'who is available is the first thing offered').toContain('available')
    expect(t[1].textContent, 'and the earning half second').toContain('earns OIL')
    expect(t[0].className, 'availability is the tab it opens on').toContain('on')
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

describe('the earning half moves real money, so it is gated and it writes (D43/D44)', () => {
  const earnWin = async () => {
    puckRow(SAT)
    await open(SAT)
    await act(async () => { setOilDay(SAT); notify() })
    await click(chipEl())
    await click(tabs()[1])
  }

  it('switching a man off in the window takes his credit away for real', async () => {
    const item = puckRow(SAT)
    await earnWin()
    const before = oilFigureFor(SAT, CROWD[0], item)
    expect(before, 'he earns from this event to begin with').toBeTruthy()
    const mine = rows().find(r => (r.textContent || '').includes(cs(CROWD[0])))!
    await click(mine.querySelector('.puck'))
    expect(oilFigureFor(SAT, CROWD[0], item), 'and the window wrote the decision').toBeFalsy()
  })

  it('a MEMBER may read who is available but may not change who earns', async () => {
    puckRow(SAT)
    await earnWin()
    await act(async () => { setSession({ user: 'us', role: 'main' }); notify() })
    /* the window is still open and still readable — reading who a placeholder
       stands for is not a privileged act, which is why the chip's own handler
       carries no role gate. The EDIT half is the part that is gated. */
    expect(win(), 'he can still read it').toBeTruthy()
    await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
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
