/* [GLOBAL-UNDO] phase 1 — the timeline driving the REAL scheduler + weekstash
   write() seams (not fakes). This is the phase-2 cutover in miniature: register the
   real stores, force scheduler eligibility, make a real scheduler edit through the
   command path, and prove globalUndo replays the recorded inverse back through
   schedStore.write() to the exact prior bytes — and redo forward again. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, dayApproved, signOf } from '../engine/publish'
import { txtGet } from '../engine/slots'
import { CURWEEK } from '../engine/waves'
import { initStore, writeText, weekstashStore } from '../state/store'
import { schedStore, commitSetDayApproved, commitUnpublish } from '../state/sched-commit'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import {
  installUndo, globalUndo, globalRedo, registerUndoStore, setCutoverModules, undoState,
} from './index'
import { _resetTimeline } from './timeline'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.orig', 'sched.als', 'sched.retired', 'inputs', 'plan', 'weekstash']
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const note0 = () => txtGet('dn:0.0')

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
  registerUndoStore(schedStore, SCHED_COLLS)
  registerUndoStore(weekstashStore, ['weekstash'])
  setCutoverModules(['sched'])
})
afterEach(() => { _resetTimeline() })

describe('a real scheduler text edit round-trips through the timeline', () => {
  it('globalUndo restores the prior note; globalRedo re-applies it', () => {
    const before = note0()
    writeText('dn:0.0', 'HELLO WORLD')
    expect(note0()).toBe('HELLO WORLD')
    expect(undoState().canUndo).toBe(true)

    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(note0()).toBe(before)          // recorded inverse replayed through schedStore.write()

    const r = globalRedo()
    expect(r.ok).toBe(true)
    expect(note0()).toBe('HELLO WORLD')   // forward re-applied
  })

  it('walks several real edits back and forward (N→N→N on the real store)', () => {
    const before = note0()
    writeText('dn:0.0', 'A'); writeText('dn:0.0', 'B'); writeText('dn:0.0', 'C')
    expect(note0()).toBe('C')
    globalUndo(); expect(note0()).toBe('B')
    globalUndo(); expect(note0()).toBe('A')
    globalUndo(); expect(note0()).toBe(before)
    globalRedo(); expect(note0()).toBe('A')
    globalRedo(); expect(note0()).toBe('B')
    globalRedo(); expect(note0()).toBe('C')
  })
})

describe('undo of a real publish, driven by the timeline, retracts the day', () => {
  it('reverses the issued Original back to a draft', () => {
    sign(0)
    commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    // undo the publish entry: the timeline replays its recorded inverse (delete the
    // sched.orig record + restore the book), driving the real schedStore.write().
    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(dayApproved(0)).toBe(false)          // the Original is gone; day is a draft again
    expect((SCHED.orig as any)[0]).toBeUndefined()
  })
})
