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
import { SCHED, dayApproved, signOf, daySigned, setSign } from '../engine/publish'
import { draftDup, draftSelect, dayDrafts } from '../engine/drafts'
import { HOOKS } from '../engine/hooks'
import { txtGet } from '../engine/slots'
import { initStore, writeText } from './store'
import { commitSetDayApproved, schedBaselineClean, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import * as view from './view'
import { _resetDisclosure } from './disclosure'
import { globalUndo, globalRedo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { HIST } from './history'

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

  it('undo of a publish clears the sign-offs via the WIRED postRestore (GU5-005) (AM32)', () => {
    sign(0)
    commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)

    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(dayApproved(0)).toBe(false)                 // back to a draft
    expect((SCHED.orig as any)[0]).toBeUndefined()
    expect(daySigned(0)).toBe(false)                   // postRestore was wired, so signs are cleared
  })

  it('undo of a publish leaves the baseline clean — a later unrelated edit does NOT re-sign the day (Fable#1/GU-P2-004)', () => {
    sign(0)
    commitSetDayApproved(0, true)
    globalUndo()                                       // undo the publish → day 0 back to a draft, signs cleared
    expect(daySigned(0)).toBe(false)
    // the sign-clear must be in the baseline, not lagging behind it
    expect(schedBaselineClean()).toBe(true)
    // a LATER unrelated edit on a DIFFERENT day must not absorb the sign-clear
    writeText('dn:1.0', 'AN UNRELATED NOTE')
    globalUndo()                                       // undo that note edit
    expect(txtGet('dn:1.0')).not.toBe('AN UNRELATED NOTE')
    expect(daySigned(0)).toBe(false)                   // day 0 stays UNSIGNED — the bug would re-sign it here
  })

  it('globalUndo/Redo drive ONLY the timeline — the legacy HIST stack is untouched (E3 unreachability)', () => {
    // the buttons now call globalUndo/globalRedo; this proves that path does NOT
    // also drive the legacy scheduler restore (a legacy undo() would move HIST.ix).
    // If reinstallLocks + the effect-context replay failed, the restore's deferred
    // histPush would append a spurious legacy step and this would catch it.
    const before = note0()
    writeText('dn:0.0', 'ONE')
    const ixAfterEdit = HIST.ix
    expect(ixAfterEdit).toBeGreaterThan(0)     // the edit pushed a legacy step (persistence funnel)

    globalUndo()
    expect(note0()).toBe(before)               // reverted BY THE TIMELINE
    expect(HIST.ix).toBe(ixAfterEdit)          // legacy stack NOT driven — no double-restore

    globalRedo()
    expect(note0()).toBe('ONE')
    expect(HIST.ix).toBe(ixAfterEdit)          // still untouched
  })

  it('the edit is eligible — the four modules are cut over, not just recorded', () => {
    writeText('dn:0.0', 'X')
    // eligibility (not merely "recorded") is what setCutoverModules(['sched',...])
    // in the wire buys: undoState reports it as undoable.
    expect(undoState().canUndo).toBe(true)
    expect(undoState().undoLabel).toBeTruthy()
  })
})

/* [HUMAN-RETEST] the amendment re-test, walk W3 (24 Sep 26). Each sign-off is its OWN command, as the
   screen makes it (Shell.tsx's sign select). The sign-offs ride ONE week-wide record, so every older
   step's recorded image still carries the sign-offs a publish later spent. */
describe('Undo and the sign-offs a publish spent (walk W3 — F-w3-1, F-w3-2)', () => {
  const signCmd = (di: number, role: string, who: string) =>
    schedWrite(SCHED_TYPES.sign, () => { setSign(di, role, who); HOOKS.histPush() })
  const signAll = (di: number) => {
    signCmd(di, 'cur', 'ignite'); signCmd(di, 'sked', 'bane'); signCmd(di, 'plan', 'stiff'); signCmd(di, 'appr', 'pump')
  }
  const names = (di: number) => { const g = signOf(di); return [g.cur, g.sked, g.plan, g.appr].filter(Boolean) }

  it('an Undo past an undone publish does not hand its spent sign-offs back — the same day (AM34, AM32)', () => {
    signAll(4)                                          // Friday: four sign-offs, four steps
    commitSetDayApproved(4, true)                       // Friday goes out — the sign-offs are spent
    expect(globalUndo().ok).toBe(true)                  // "Undid: publishing a day"
    expect(dayApproved(4)).toBe(false)
    expect(names(4)).toEqual([])
    expect(globalUndo().ok).toBe(true)                  // "Undid: a sign-off" — the fourth one
    expect(names(4), 'the three signed before the publish were spent by it').toEqual([])
    expect(daySigned(4)).toBe(false)
  })

  it('…nor through another day\'s sign-off, which would have let the day go out unsigned (AM34, AM39c)', () => {
    signAll(4)                                          // Friday: all four
    signCmd(5, 'cur', 'ignite')                         // Saturday: CUR CK
    commitSetDayApproved(4, true)                       // Friday goes out
    expect(globalUndo().ok).toBe(true)                  // the publish comes off — Friday unsigned
    expect(globalUndo().ok).toBe(true)                  // Saturday's CUR CK comes off
    expect(signOf(5).cur).toBe('')
    expect(names(4), 'Friday must not get its four back').toEqual([])
    expect(daySigned(4), '"Publish day" must stay locked until Friday re-signs').toBe(false)
    // and Redo brings Saturday's sign-off back without bringing Friday's spent ones with it
    expect(globalRedo().ok).toBe(true)
    expect(signOf(5).cur).toBe('ignite')
    expect(names(4)).toEqual([])
    // the publish redoes as before: published, its sign-offs cleared (AM39c)
    expect(globalRedo().ok).toBe(true)
    expect(dayApproved(4)).toBe(true)
    expect(names(4)).toEqual([])
    expect(schedBaselineClean()).toBe(true)
  })

  it('undo of a publish clears a PARKED plan\'s sign-offs too, like the Unpublish button (AM32, AM34)', () => {
    signAll(0)
    draftDup(0)                                         // Plan A parked WITH its four sign-offs; Plan B live
    const [a] = dayDrafts(0)
    signAll(0)                                          // Plan B signed
    commitSetDayApproved(0, true)                       // Plan B goes out as the Original
    expect(globalUndo().ok).toBe(true)                  // undo the publish = Unpublish (AM32)
    expect(dayApproved(0)).toBe(false)
    draftSelect(0, a.id)                                // bring the parked Plan A out
    expect(daySigned(0), 'its sign-offs were given before the withdrawn version — re-sign').toBe(false)
  })

  it('Redo is never stuck behind a step a new change replaced (F-w3-2, AM39b)', () => {
    signCmd(4, 'cur', 'ignite')                         // Friday CUR CK
    expect(globalUndo().ok).toBe(true)                  // …undone
    signCmd(5, 'cur', 'ignite')                         // a NEW change: Saturday CUR CK
    expect(globalUndo().ok).toBe(true)                  // …undone
    expect(undoState().canRedo).toBe(true)
    const r = globalRedo()
    expect(r.reason, 'it said "redo that first" — which no control can do').toBeUndefined()
    expect(r.ok).toBe(true)
    expect(signOf(5).cur).toBe('ignite')                // Saturday's comes back
    expect(signOf(4).cur, 'the step the new change replaced stays gone').toBe('')
    expect(undoState().canRedo).toBe(false)             // nothing left to redo
  })
})
