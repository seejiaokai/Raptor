// @vitest-environment jsdom
/* [GLOBAL-UNDO] §13 phase 2 (step 7 / "2.3") — the LIVE cutover wiring proven end
   to end. Unlike integration.test.ts (which sets the hooks by hand), this drives
   the REAL installGlobalUndo(): it must register the three stores, declare the four
   cut-over modules, and wire postRestore, so a real edit and a real publish undo
   round-trip with NO test-supplied hooks. If the wire drops a registration or a
   hook, these fail. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, dayApproved, signOf, daySigned } from '../engine/publish'
import { txtGet } from '../engine/slots'
import { initStore, writeText } from './store'
import { commitSetDayApproved } from './sched-commit'
import { setSession } from './auth'
import * as view from './view'
import { _resetDisclosure } from './disclosure'
import { globalUndo, globalRedo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
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
  installGlobalUndo()   // the REAL production wiring — no hand-set hooks
})
afterEach(() => { _resetTimeline() })

describe('installGlobalUndo() wires the live cutover', () => {
  it('a real scheduler edit is undoable/redoable with only the production wire', () => {
    const before = note0()
    writeText('dn:0.0', 'HELLO WIRE')
    expect(note0()).toBe('HELLO WIRE')
    expect(undoState().canUndo).toBe(true)

    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(note0()).toBe(before)

    const r = globalRedo()
    expect(r.ok).toBe(true)
    expect(note0()).toBe('HELLO WIRE')
  })

  it('undo of a publish clears the sign-offs via the WIRED postRestore (GU5-005)', () => {
    sign(0)
    commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)

    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(dayApproved(0)).toBe(false)                 // back to a draft
    expect((SCHED.orig as any)[0]).toBeUndefined()
    expect(daySigned(0)).toBe(false)                   // postRestore was wired, so signs are cleared
  })

  it('the edit is eligible — the four modules are cut over, not just recorded', () => {
    writeText('dn:0.0', 'X')
    // eligibility (not merely "recorded") is what setCutoverModules(['sched',...])
    // in the wire buys: undoState reports it as undoable.
    expect(undoState().canUndo).toBe(true)
    expect(undoState().undoLabel).toBeTruthy()
  })
})
