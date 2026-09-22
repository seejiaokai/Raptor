// @vitest-environment jsdom
/* UNDO'S BOUNDARY HAS TO BE ON THE BUTTON A PERSON CAN ACTUALLY PRESS
   (walk find, 22 Sep 26).

   `oilundo.test.tsx` proves the boundary RULE, and it is right. What it cannot
   prove is that anything CALLS it: its own helper reimplements the button's two
   steps by hand —

       const pressUndo = () => (oilUndoBoundary() ? 'closed the mode' : globalUndo()…)

   — so every assertion in that file would still pass if no button on any screen
   ever asked `oilUndoBoundary`. Which is exactly what the walk found. The guard
   was wired into the PAGE's Undo (`#undoBtn`, Shell.tsx) and only there, and the
   page's top bar sits BEHIND the board's own sticky `.sb-top` whenever the board
   is open — measured with elementFromPoint, which returns `.sb-top`, not the
   button. The board is the only place the OIL mode exists, so the one Undo a
   scheduler can reach went straight to `globalUndo`: the third press walked back
   a ground-row change underneath a screen that says the schedule cannot be
   changed, said nothing, and left the mode open.

   This file presses the REAL button, through the DOM, on a rendered App. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { initStore, wireStore, weekstashStore, notify, writeText } from '../state/store'
import { setSession } from '../state/auth'
import { schedStore, schedPostRestore } from '../state/sched-commit'
import { setOilDay, setPage } from '../state/view'
import { toggleOilMode, toggleOilPerson, oilModeOn } from './oilmode'
import { installUndo, registerUndoStore, setCutoverModules, setUndoHooks, undoMark } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { openScheduler } from './board'
import { txtGet } from '../engine/slots'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const SAT = 5, SAT_ISO = '2026-07-18'
const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.orig', 'sched.als', 'sched.retired', 'inputs', 'plan', 'weekstash']
const DSNAP = JSON.stringify(DAYS)
let host: HTMLDivElement
let root: Root
let TOASTS: string[] = []
let saved: any
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const click = async (el: Element | null) => {
  expect(el, 'the control exists').toBeTruthy()
  expect((el as HTMLButtonElement).disabled, 'and is not greyed out').toBeFalsy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  setSession({ user: 'ad', role: 'admin' } as any)
  wireStore(); initStore(); ensureRowIds(DAYS)
  _resetTimeline(); installUndo()
  setUndoHooks({ postRestore: schedPostRestore })
  registerUndoStore(schedStore, SCHED_COLLS)
  registerUndoStore(weekstashStore, ['weekstash'])
  setCutoverModules(['sched', 'inputs', 'plan'])
  saved = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO, sent: HOOKS.oilSentinel }
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff']
  setOilDay(null)
  TOASTS = []
  await act(async () => { root.render(<App />) })
  await act(async () => { setPage('editsched'); notify() })
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.day; HOOKS.oilDayISO = saved.iso; HOOKS.oilSentinel = saved.sent
  setOilDay(null); _resetTimeline()
})

const addRow = (di: number, r: any) => {
  ;(DAYS[di] as any).ground = ((DAYS[di] as any).ground || []).concat([r]); ensureRowIds(DAYS)
  const g = (DAYS[di] as any).ground
  return g[g.length - 1]
}

describe('the Undo a scheduler can actually reach honours the mode boundary', () => {
  it('the board draws its own Undo — the page one is behind the board', async () => {
    await act(async () => { openScheduler(SAT); notify() })
    expect($('#sbUndo'), 'the board carries its own Undo').toBeTruthy()
  })

  it('the press that would reach past the mark leaves the mode, and says so', async () => {
    await act(async () => { openScheduler(SAT); notify() })
    const a = addRow(SAT, { prog: 'MORNING BRIEF', str: '0700', end: '0800', who: 'bane' })
    const b = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    const ka = rowItemKey(a.rid), kb = rowItemKey(b.rid)
    /* a REAL schedule change, on the timeline, BEHIND the mark — without one,
       the mark is the start of the timeline, Undo greys out and the press that
       reaches past it can never be made (which is the state the board is in on
       a freshly loaded day, and is correct there). */
    await act(async () => { writeText('dn:5.0', 'A NOTE MADE BEFORE THE MODE'); notify() })

    /* the mark is set HERE */
    await act(async () => { toggleOilMode(SAT); notify() })
    const door = undoMark()
    await act(async () => { toggleOilPerson(SAT, 'bane', ka); notify() })
    await act(async () => { toggleOilPerson(SAT, 'bane', kb); notify() })
    expect(undoMark(), 'two OIL decisions are on the timeline').not.toBe(door)

    await click($('#sbUndo'))
    await click($('#sbUndo'))
    expect(undoMark(), 'back at the mark').toBe(door)
    expect(oilModeOn(SAT), 'still inside the mode').toBe(true)

    /* THE PRESS THAT REACHES PAST THE MARK */
    TOASTS = []
    await click($('#sbUndo'))
    expect(oilModeOn(SAT), 'it left the mode instead of reaching past the mark').toBe(false)
    expect(TOASTS.join(' '), 'and it said so').toMatch(/Left OIL Earn/i)
    expect(txtGet('dn:5.0'), 'and the day underneath did not move').toBe('A NOTE MADE BEFORE THE MODE')

    /* the press AFTER that behaves normally, outside the mode */
    await click($('#undoBtn') || $('#sbUndo'))
    expect(txtGet('dn:5.0'), 'and now it takes the note back').not.toBe('A NOTE MADE BEFORE THE MODE')
  })
})
