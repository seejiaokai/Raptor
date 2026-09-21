// @vitest-environment jsdom
/* UNDO STOPS AT THE DOOR OF THE MODE (fix 5, corrected 22 Sep 26 after the
   owner asked).

   Undo already reverses an OIL tap correctly, and that is behaviour worth
   keeping — it is the natural way to take back a mis-tap, and it was measured
   in the running app: 18 bars, tap a puck, 17 bars, press Undo, 18 again. One
   reviewer wanted the mode closed on Undo altogether, which would take that
   away, so it is not followed as written.

   What the walk actually caught is different: Undo does not STOP at the mode.
   It walks back whatever the last change was, so with the mode open it removed
   a ground-programme row from the day — a schedule change, made from a screen
   that says the schedule cannot be changed.

   So the rule is a BOUNDARY, not a door: opening the mode marks the spot, Undo
   walks back OIL decisions freely down to that spot, and reaching past it
   closes the mode first. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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
import { toggleOilMode, toggleOilPerson, oilModeOn, oilUndoBoundary, oilPersonOn } from './oilmode'
import { installUndo, globalUndo, registerUndoStore, setCutoverModules, setUndoHooks, undoState, undoMark } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { txtGet } from '../engine/slots'
import { applyDrop } from './drag'

const SAT = 5, SAT_ISO = '2026-07-18'
const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.orig', 'sched.als', 'sched.retired', 'inputs', 'plan', 'weekstash']
const DSNAP = JSON.stringify(DAYS)
let saved: any

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  setSession({ user: 'ad', role: 'admin' } as any)
  wireStore()
  initStore()
  ensureRowIds(DAYS)
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
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.day; HOOKS.oilDayISO = saved.iso; HOOKS.oilSentinel = saved.sent
  setOilDay(null); _resetTimeline()
})

const addRow = (di: number, r: any) => {
  DAYS[di].ground = ((DAYS[di] as any).ground || []).concat([r]); ensureRowIds(DAYS)
  return (DAYS[di] as any).ground[(DAYS[di] as any).ground.length - 1]
}
/* the Undo the button presses: the boundary first, then the real one */
const pressUndo = () => (oilUndoBoundary() ? 'closed the mode' : globalUndo().ok ? 'undone' : 'refused')

describe('Undo stops at the door of the mode (fix 5)', () => {
  it('two taps, two undos — both come back, and the mode is still open', async () => {
    const a = addRow(SAT, { prog: 'MORNING BRIEF', str: '0700', end: '0800', who: 'bane' })
    const b = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    const ka = rowItemKey(a.rid), kb = rowItemKey(b.rid)
    toggleOilMode(SAT)
    toggleOilPerson(SAT, 'bane', ka)
    notify(); await new Promise(r => setTimeout(r, 0))
    toggleOilPerson(SAT, 'bane', kb)
    notify(); await new Promise(r => setTimeout(r, 0))
    expect(oilPersonOn(SAT, 'bane', ka), 'he is off the first one').toBe(false)
    expect(oilPersonOn(SAT, 'bane', kb), 'and the second').toBe(false)

    expect(pressUndo()).toBe('undone')
    expect(oilPersonOn(SAT, 'bane', kb), 'the second tap came back').toBe(true)
    expect(pressUndo()).toBe('undone')
    expect(oilPersonOn(SAT, 'bane', ka), 'and the first came back too').toBe(true)
    expect(oilModeOn(SAT), 'and he is still in the mode').toBe(true)
  })

  it('the press that would reach PAST the door closes the mode instead', async () => {
    /* a real schedule change made BEFORE the mode was opened — the thing the
       walk caught Undo reaching back into */
    writeText('dn:5.0', 'A NOTE MADE BEFORE THE MODE')
    notify(); await new Promise(r => setTimeout(r, 0))
    const a = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    const ka = rowItemKey(a.rid)
    toggleOilMode(SAT)
    toggleOilPerson(SAT, 'bane', ka)

    expect(pressUndo()).toBe('undone')
    expect(oilPersonOn(SAT, 'bane', ka), 'the tap came back').toBe(true)
    expect(txtGet('dn:5.0'), 'and the note underneath has not moved').toBe('A NOTE MADE BEFORE THE MODE')

    expect(pressUndo(), 'the next press would reach past the door').toBe('closed the mode')
    expect(oilModeOn(SAT), 'so the mode is shut').toBe(false)
    expect(txtGet('dn:5.0'), 'and the note is STILL there — nothing was undone').toBe('A NOTE MADE BEFORE THE MODE')

    /* only now, outside the mode, does Undo reach the schedule again */
    expect(pressUndo()).toBe('undone')
    expect(txtGet('dn:5.0'), 'and this time it takes the note back').not.toBe('A NOTE MADE BEFORE THE MODE')
  })

  it('the boundary says nothing at all when the mode is not open', () => {
    expect(oilUndoBoundary()).toBe(false)
  })

  it('leaving and re-entering the mode moves the door with it', () => {
    const a = addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    const ka = rowItemKey(a.rid)
    toggleOilMode(SAT)
    toggleOilPerson(SAT, 'bane', ka)
    toggleOilMode(SAT)                      // out
    expect(oilModeOn(SAT)).toBe(false)
    toggleOilMode(SAT)                      // and back in
    expect(pressUndo(), 'the tap is now BEHIND the new door').toBe('closed the mode')
    expect(oilPersonOn(SAT, 'bane', ka), 'so it was not walked back').toBe(false)
  })
})

/* THE OTHER DOORS THE MODE HAD TO SHUT (fix 5 / Fable M11). Both of these
   replace the day the mode is describing, so staying in it afterwards would
   leave every figure on screen talking about a document that has just been
   taken back or swapped out. */
describe('the mode closes on the things that replace the day', () => {
  it('withdrawing the day leaves the mode', () => {
    toggleOilMode(SAT)
    expect(oilModeOn(SAT)).toBe(true)
    setOilDay(null)                      // what the Unpublish handler now does first
    expect(oilModeOn(SAT)).toBe(false)
  })

  it('a puck cannot be dragged onto the day from inside the mode', () => {
    let said = ''
    const real = HOOKS.toast
    HOOKS.toast = ((m: any) => { said = String(m) }) as any
    try {
      setPage('editsched')
      toggleOilMode(SAT)
      const el = document.createElement('div')
      expect(applyDrop(el as any, 0, 0), 'the drop is refused').toBe(false)
      expect(said, 'and it says why, rather than doing nothing').toMatch(/OIL Earn/)
    } finally { HOOKS.toast = real }
  })

  it('THE CONTROL — outside the mode the same drop is not refused for this reason', () => {
    let said = ''
    const real = HOOKS.toast
    HOOKS.toast = ((m: any) => { said = String(m) }) as any
    try {
      setPage('editsched')
      const el = document.createElement('div')
      applyDrop(el as any, 0, 0)
      expect(said).not.toMatch(/OIL Earn/)
    } finally { HOOKS.toast = real }
  })
})
