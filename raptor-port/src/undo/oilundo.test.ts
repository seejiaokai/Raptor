/* [OIL-SEATS-CAN-EARN] STEP 11 / [OIL-UNDO-WORDS] — undo names what it would
   actually take back.
   Backlog: OUTSTANDING.md [OIL-UNDO-WORDS]; evidence
   `raptor-port/docs/handpass/2026-09-22-oil-walk.md` §5.1.

   FOUND BY DRIVING THE APP, not by reading it. Inside the OIL earn mode the
   first presses of the board's Undo correctly reversed the OIL decisions — and
   each one said "Undid: a change to the schedule". Taking a man off an event is
   not a schedule change; the mode exists precisely because the schedule must
   NOT move while OIL is being decided, so the words contradicted the very
   screen they appeared on. (The press that LEAVES the mode already said the
   right thing.)

   The label is never stored at write time — the one central describer reads the
   entry's own type — so the fix is that an OIL decision is its OWN command
   rather than riding the catch-all mutation backstop. That is also the honest
   shape: it is a different kind of change, and now undo, the command stream and
   anything later that reads the stream can all tell. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { initStore, weekstashStore } from '../state/store'
import { schedStore, schedPostRestore } from '../state/sched-commit'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import { toggleOilPerson, toggleOilItem } from '../ui/oilmode'
import {
  installUndo, globalUndo, registerUndoStore, setCutoverModules, setUndoHooks, undoState, describeEntry,
} from './index'
import { _resetTimeline } from './timeline'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.orig', 'sched.als', 'sched.retired', 'inputs', 'plan', 'weekstash']
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  _resetDisclosure()
  _resetTimeline()
  installUndo()
  setUndoHooks({ postRestore: schedPostRestore })
  registerUndoStore(schedStore, SCHED_COLLS)
  registerUndoStore(weekstashStore, ['weekstash'])
  setCutoverModules(['sched', 'inputs', 'plan'])
  ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' }]
  ;(DAYS[SAT] as any).oild = undefined
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => []
})
afterEach(() => {
  _resetTimeline()
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
})

const item = () => rowItemKey((DAYS[SAT] as any).ground[0].rid)

describe('an OIL decision is its own kind of change', () => {
  it('taking ONE MAN off an event does not read as "a change to the schedule"', () => {
    toggleOilPerson(SAT, 'bane', item())
    expect((DAYS[SAT] as any).oild.people[`bane|${item()}`], 'the decision was written').toBe('deny')
    const label = undoState().undoLabel
    expect(label, 'there is something to take back').toBeTruthy()
    expect(label, 'the schedule did not move — the mode exists so that it cannot')
      .not.toBe('a change to the schedule')
    expect(label).toBe('an OIL decision')
  })

  it('switching a whole ROW off reads the same way', () => {
    toggleOilItem(SAT, item())
    expect(undoState().undoLabel).toBe('an OIL decision')
  })

  it('and it still UNDOES — the wording is the only thing that changed', () => {
    toggleOilPerson(SAT, 'bane', item())
    expect((DAYS[SAT] as any).oild.people).toBeTruthy()
    const u = globalUndo()
    expect(u.ok, 'the decision is reversed through the same machinery as any edit').toBe(true)
    expect(((DAYS[SAT] as any).oild || {}).people, 'and the day is back as it was').toBeFalsy()
  })

  it('THE CONTROL: an ordinary schedule edit still says what it always said', () => {
    expect(describeEntry({ type: 'sched.slot' } as any)).toBe('a change to the schedule')
  })
})
