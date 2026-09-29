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
import { initStore, writeText, loadWeek, writeInputs, writeInputsBatch } from './store'
import { CURWEEK } from '../engine/waves'
import { commitSetDayApproved, schedBaselineClean, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import * as view from './view'
import { _resetDisclosure } from './disclosure'
import { globalUndo, globalRedo, undoState } from '../undo'
import { _resetTimeline, _timelineEntries } from '../undo/timeline'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from './quals-write'
import { VCONF, RULE_SPEC, rulesSave, rulesResetMem } from '../engine/rules'
import { storeBackend } from '../engine/hooks'
import { waveTplLoad } from '../engine'
import { addWaveTpl, delWaveTpl, setWaveHidden, waveTplSave, WAVETPL_CFG, WAVEHIDE } from '../engine/wavetpl'
import { installGlobalUndo, _snapView } from './undo-wire'
import { setDayRemark } from './plan'
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

/* B2 of the change-recording re-test (28 Sep 26, [UNDO-ROSTER-SETTINGS]) — the roster and the settings are cut over:
   the 16 Sep 26 rule "roster and settings edits ARE undoable" (register AM39d), narrowed by D350 (adding / archiving /
   restoring / deleting a person and postings stay out). Each through the app's own writer, red first. */
describe('B2 — a Quals change, a Logic rule and a template are Undo steps now', () => {
  /* the settings store's record IS the saved value (people-settings-commit.ts), so these need a saved copy to change */
  const mem: Record<string, string> = {}
  beforeEach(() => { Object.keys(mem).forEach(k => delete mem[k]); storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } } })
  afterEach(() => { storeBackend.impl = null; rulesResetMem(); waveTplLoad() })
  it('a Quals tick is undone and redone, the roster record with it', () => {
    const pid = 'rocky'
    const was = !!(PEOPLE as any)[pid].quals.nvg
    expect(updatePersonField(pid, { tick: 'nvg' })).toBe(null)
    expect(!!(PEOPLE as any)[pid].quals.nvg).toBe(!was)
    expect(undoState().canUndo).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(!!(PEOPLE as any)[pid].quals.nvg).toBe(was)
    expect(globalRedo().ok).toBe(true)
    expect(!!(PEOPLE as any)[pid].quals.nvg).toBe(!was)
  })
  it('a Logic rule change is undone — the rule itself back', () => {
    const k = Object.keys(RULE_SPEC)[0]
    const was = VCONF[k], spec = RULE_SPEC[k]
    VCONF[k] = was === spec.hi ? spec.lo : spec.hi
    rulesSave()
    expect(globalUndo().ok).toBe(true)
    expect(VCONF[k]).toBe(was)
  })
  it('deleting a HIDDEN wave template is ONE step — Undo brings it back still hidden (§11.8, Fable 7)', () => {
    const t = addWaveTpl('ALPHA', 'fly')!
    setWaveHidden(t.id, true); waveTplSave()
    expect(globalUndo().ok).toBe(true)                    // the add-and-hide as one save (itself one step)
    const t2 = addWaveTpl('BRAVO', 'fly')!
    setWaveHidden(t2.id, true); waveTplSave()
    const n = _timelineEntries().length
    delWaveTpl(t2.id); waveTplSave()
    expect(_timelineEntries().length).toBe(n + 1)
    expect(globalUndo().ok).toBe(true)
    expect(WAVETPL_CFG.some(x => x.id === t2.id)).toBe(true)
    expect(WAVEHIDE.has(t2.id)).toBe(true)
  })
})

/* B7 of the change-recording re-test (28 Sep 26) — an Undo takes you to where the change was (register AM39b, the owner's
   13 Sep 26 "snaps you to that week and shows what the undo did"): walker A2-F4 (an undo pressed on another page left you
   where you were), A1-F2 (the board's Undo across weeks closed the board), and the new doors this build adds (§11.6). */
describe('B7 — Undo goes to the change’s page, and keeps the board open across weeks', () => {
  const mem: Record<string, string> = {}
  beforeEach(() => { Object.keys(mem).forEach(k => delete mem[k]); storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } } })
  afterEach(() => { storeBackend.impl = null; rulesResetMem(); view.setPage('viewsched') })
  it('a Quals change undone from another page lands on Quals, on his row', () => {
    view.setPage('quals')
    expect(updatePersonField('rocky', { tick: 'nvg' })).toBe(null)
    view.setPage('leavewar')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('quals')
    expect(view.QUALSFOCUS).toBe('rocky')
  })
  it('a Logic rule undone from Edit Schedule lands on the Logic page', () => {
    const k = Object.keys(RULE_SPEC)[0], spec = RULE_SPEC[k]
    VCONF[k] = VCONF[k] === spec.hi ? spec.lo : spec.hi; rulesSave()
    view.setPage('editsched')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('logic')
  })
  it('a schedule change undone from the Leave War lands on Edit Schedule', () => {
    view.setPage('editsched')
    writeText('dn:0.0', 'SNAP')
    view.setPage('leavewar')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('editsched')
  })
  it('an input filed on Inputs and undone there stays on Inputs — the change shows on the page you are on', () => {
    view.setPage('inputs')
    writeInputs(() => { INPUTS.push({ person: 'bane', type: 'LL', date: 'Jul 15', yr: 2026, rmk: '', iid: 'iwire1' } as any) })
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('inputs')
    expect(INPUTS.some((r: any) => r.iid === 'iwire1')).toBe(false)
  })
  it('a leave input undone on the Leave War stays on the war — it shows there too; undone elsewhere it opens Inputs', () => {
    writeInputs(() => { INPUTS.push({ person: 'bane', type: 'LL', date: 'Jul 15', yr: 2026, rmk: '', iid: 'iwire3' } as any) })
    view.setPage('leavewar')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('leavewar')
    view.setPage('quals')
    expect(globalRedo().ok).toBe(true)
    expect(view.CURPAGE).toBe('inputs')
  })
  it('an input on the loaded week, undone on Edit Schedule, stays there — the day it lands on is the change (plan §11.6: "unless a week context is present"; walk S16)', () => {
    writeInputs(() => { INPUTS.push({ person: 'bane', type: 'LL', date: 'Jul 19', yr: 2026, rmk: '', iid: 'iwire5' } as any) })
    view.setPage('editsched')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('editsched')
  })
  it('an input on ANOTHER week, undone on Edit Schedule, opens Inputs', () => {
    writeInputs(() => { INPUTS.push({ person: 'bane', type: 'LL', date: 'Aug 19', yr: 2026, rmk: '', iid: 'iwire6' } as any) })
    view.setPage('editsched')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('inputs')
  })
  it('an input the war never shows (an appointment), undone on the Leave War, opens Inputs', () => {
    writeInputs(() => { INPUTS.push({ person: 'bane', type: 'APPT', date: 'Jul 15', yr: 2026, rmk: '', iid: 'iwire4' } as any) })
    view.setPage('leavewar')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('inputs')
  })
  it('the "set as default order?" offer closes when a step is undone (walker A1 O5)', () => {
    writeText('dn:0.0', 'O5')
    view.setSecDefOffer(0)
    expect(globalUndo().ok).toBe(true)
    expect(view.SECDEFOFFER).toBe(null)
  })
  it('a sign-off on Saturday, undone and redone with the board on Friday, brings the board to Saturday (walk S14a — the week keeps every day’s sign-offs in one record)', () => {
    view.setPage('editsched')
    schedWrite(SCHED_TYPES.sign, () => { setSign(5, 'cur', 'ignite'); HOOKS.histPush() })
    view.setBoardDay(4)
    expect(globalUndo().ok).toBe(true)
    expect(view.SBDAY).toBe(5)
    view.setBoardDay(4)
    expect(globalRedo().ok).toBe(true)
    expect(view.SBDAY).toBe(5)
  })
  /* Astra's final read, finding 2: the page is the ACT's, never a consequence's — a weekend publish carries the Leave
     War's OIL credit (an lw.cell projection) folded into the schedule's step, and must still land on Edit Schedule */
  const publishWithCredit = () => ({ scope: { module: 'sched', weekId: CURWEEK }, forward: [
    { op: 'put', collection: 'days', id: `${CURWEEK}#5`, before: {}, after: {} },
    { op: 'put', collection: 'lw.cell', id: 'w2026:bane:2026-07-18', before: [], after: [{ kind: 'oil' }] }] } as any)
  it('a schedule step carrying a Leave War credit, undone from Admin or the Leave War, lands on Edit Schedule (Astra F2)', () => {
    for (const from of ['admin', 'leavewar']) {
      view.setPage(from as any)
      _snapView(publishWithCredit(), 'undo')
      expect(view.CURPAGE).toBe('editsched')
    }
  })
  it('the same step with the board on another day brings the board to the published day (Astra F2)', () => {
    view.setPage('editsched'); view.setBoardDay(2)
    _snapView(publishWithCredit(), 'undo')
    expect(view.SBDAY).toBe(5)
  })
  it('a Leave War step that lands a leave on a week, undone from Edit Schedule, goes to the Leave War (Astra F2)', () => {
    view.setPage('editsched')
    _snapView({ scope: { module: 'lw', warId: 'w2026' }, forward: [
      { op: 'put', collection: 'lw.cell', id: 'w2026:bane:2026-07-15', before: [], after: [{ kind: 'bid' }] },
      { op: 'put', collection: 'days', id: `${CURWEEK}#2`, before: {}, after: {} }] } as any, 'undo')
    expect(view.CURPAGE).toBe('leavewar')
  })
  it('a planning-calendar day title undone from another page opens Inputs on its CALENDAR (Fable F2, plan §11.6)', () => {
    view.setInpView('table'); view.setPage('inputs')
    writeInputs(() => setDayRemark('2026-07-16', 'B7 PLAN'))           // the calendar's own door (InputsCal.tsx)
    view.setPage('editsched')
    expect(globalUndo().ok).toBe(true)
    expect(view.CURPAGE).toBe('inputs')
    expect(view.INPVIEW).toBe('cal')
  })
  it('an input row undone from another page opens Inputs on its table, not the calendar', () => {
    view.setInpView('table'); view.setPage('editsched')
    writeInputs(() => { INPUTS.push({ person: 'bane', type: 'LL', date: 'Aug 20', yr: 2026, rmk: '', iid: 'iwire7' } as any) })
    expect(globalUndo().ok).toBe(true)
    expect(view.INPVIEW).toBe('table')
  })
  it('the board’s Undo that crosses to another week keeps the board open, on the changed day (A1-F2)', () => {
    view.setPage('editsched')
    writeText('dn:0.0', 'WEEK A MONDAY')
    loadWeek('20/07/2026')
    view.setBoardDay(3)
    expect(globalUndo().ok).toBe(true)
    expect(CURWEEK).toBe('13/07/2026')
    expect(view.SBDAY).toBe(0)
  })
})

/* B8 of the change-recording re-test (28 Sep 26) — the words: one vocabulary for the hover, the bubble and the history
   line. Walker A2-F6 / [AMEND-SMALL-SEEN] item 2 (a take-off time read "a note on the schedule"), A2-F2 (one input read
   "a batch of inputs"), and the roster and settings steps now undoable (Fable 3e, S23). */
describe('B8 — Undo says what came back', () => {
  const mem: Record<string, string> = {}
  beforeEach(() => { Object.keys(mem).forEach(k => delete mem[k]); storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } } })
  afterEach(() => { storeBackend.impl = null; rulesResetMem() })
  it('a take-off time, a landing time, a day note — the box it wrote, not "a note on the schedule"', () => {
    writeText('ff:0.0.0.to', '10:45')
    expect(undoState().undoLabel).toBe('a take-off time')
    writeText('ff:0.0.0.ld', '11:55')
    expect(undoState().undoLabel).toBe('a landing time')
    writeText('dn:0.0', 'A DAY NOTE')
    expect(undoState().undoLabel).toBe('a day note')
    const r = globalUndo()
    expect(r.ok).toBe(true)
    expect(r.entry!.label).toBe('a day note')
  })
  it('a day title on the Inputs calendar names the calendar, not "a personal input" (the walk, R2)', () => {
    writeInputs(() => setDayRemark('2026-07-16', 'B8 TITLE'))
    expect(undoState().undoLabel).toBe('a day title on the calendar')
  })
  it('one input filed through the Inputs page’s batch door is "a personal input"', () => {
    writeInputsBatch(() => { INPUTS.push({ person: 'bane', type: 'LL', date: 'Jul 16', yr: 2026, rmk: '', iid: 'iwire2' } as any) })
    expect(undoState().undoLabel).toBe('a personal input')
  })
  it('a Quals tick names the man and what changed; a rule names the Logic page', () => {
    expect(updatePersonField('rocky', { tick: 'nvg' })).toBe(null)
    expect(undoState().undoLabel).toBe('Hex’s quals')
    const k = Object.keys(RULE_SPEC)[0], spec = RULE_SPEC[k]
    VCONF[k] = VCONF[k] === spec.hi ? spec.lo : spec.hi; rulesSave()
    expect(undoState().undoLabel).toBe('a rule on the Logic page')
  })
})
