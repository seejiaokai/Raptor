/* [GLOBAL-UNDO] phase 1 — the timeline driving the REAL scheduler + weekstash
   write() seams (not fakes). This is the phase-2 cutover in miniature: register the
   real stores, force scheduler eligibility, make a real scheduler edit through the
   command path, and prove globalUndo replays the recorded inverse back through
   schedStore.write() to the exact prior bytes — and redo forward again. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, dayApproved, signOf, daySigned } from '../engine/publish'
import { txtGet } from '../engine/slots'
import { CURWEEK } from '../engine/waves'
import { initStore, writeText, writeInputsBatch, weekstashStore } from '../state/store'
import { acceptInput } from '../engine/slots'
import { inpId } from '../engine/inputs'
import { schedStore, commitSetDayApproved, commitUnpublish, resyncSchedBaseline, schedPostRestore } from '../state/sched-commit'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import {
  installUndo, globalUndo, globalRedo, registerUndoStore, setCutoverModules, setUndoHooks, undoState,
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
  setUndoHooks({ postRestore: schedPostRestore })
  registerUndoStore(schedStore, SCHED_COLLS)
  registerUndoStore(weekstashStore, ['weekstash'])
  setCutoverModules(['sched', 'inputs', 'plan'])
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

describe('undo of a real input filing round-trips the landing (reland in restore, §11/C3)', () => {
  const freshOnDay0 = () => {
    INPUTS.push({ person: 'vinci', date: DAYS[0].dt, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'x' })
    return INPUTS[INPUTS.length - 1] as any
  }
  // acc must be read from the LIVE INPUTS entry by id — the restore replaces the
  // object (clone-on-write), so a held reference goes stale.
  const accOf = (iid: string) => (INPUTS.find((r: any) => r.iid === iid) as any)?.acc
  it('accepting an input then undoing removes its ground row AND clears acc; redo re-lands it', () => {
    const inp = freshOnDay0()
    const iid = inpId(inp)
    resyncSchedBaseline()                            // X is pre-existing, so the accept is a PUT (acc), not a create
    const before = DAYS[0].ground.length
    // file it onto the ground programme as ONE inputs-module command
    writeInputsBatch(() => acceptInput(0, inp, 'g'))
    expect(accOf(iid)).toBe('g')
    expect(DAYS[0].ground.some((g: any) => g.src === iid)).toBe(true)
    expect(undoState().canUndo).toBe(true)

    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(DAYS[0].ground.length).toBe(before)                                  // row gone
    expect(DAYS[0].ground.some((g: any) => g.src === iid)).toBe(false)
    expect(accOf(iid)).toBeFalsy()                                              // acc re-derived (no dangling 'g')

    const r = globalRedo()
    expect(r.ok).toBe(true)
    expect(DAYS[0].ground.some((g: any) => g.src === iid)).toBe(true)           // row back
    expect(accOf(iid)).toBe('g')                                               // re-landed
  })

  /* the days-only dangling case (Codex R2-003): a restored day lacks a ground row
     while the live input still reads acc='g'. reconcileLandedAcc alone (one-way) would
     leave it dangling; the restore runs reconcileDayFiling (two-way), which clears it. */
  it('reconciles a dangling g to no-landing when a days-only restore leaves no row', () => {
    const inp = freshOnDay0()
    const iid = inpId(inp)
    inp.acc = 'g'                                    // dangling: 'g' but no ground row exists
    resyncSchedBaseline()                            // fold X into the baseline, so the next edit is days-ONLY
    writeText('dn:0.0', 'NOTE')                      // a days-only edit (day note); no inputs change
    expect(accOf(iid)).toBe('g')
    const u = globalUndo()                           // restores day 0 (still no row for X)
    expect(u.ok).toBe(true)
    expect(accOf(iid)).toBeFalsy()                   // reconcileDayFiling cleared the dangling landing
  })
})

describe('undo of a real publish, driven by the timeline, retracts the day', () => {
  it('reverses the issued Original back to a draft AND clears the sign-offs (§6.2/GU5-005)', () => {
    sign(0)
    expect(daySigned(0)).toBe(true)
    commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    // undo the publish entry: the timeline replays its recorded inverse (delete the
    // sched.orig record + restore the book), driving the real schedStore.write().
    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(dayApproved(0)).toBe(false)          // the Original is gone; day is a draft again
    expect((SCHED.orig as any)[0]).toBeUndefined()
    // the plain inverse would restore the pre-publish SIGNED book; postRestore clears it
    // so the day must be re-signed before it can be republished.
    expect(daySigned(0)).toBe(false)
  })

  it('a LOGGED (disclosed) retired audit line survives an undo of the unpublish (Codex GU-P2-001)', () => {
    sign(0); commitSetDayApproved(0, true)
    const id = (SCHED.orig as any)[0].id
    commitUnpublish(0)                                   // retract → retired entry appended
    // model dissemination: mark the just-written retired line logged
    const rk0 = Object.keys(SCHED.retired).find(k => k.startsWith(id + '~'))!
    ;(SCHED.retired as any)[rk0].logged = true
    resyncSchedBaseline()                                // fold the logged flag into the baseline
    // now undo the unpublish: its inverse would delete the retired line — the guard keeps it
    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(dayApproved(0)).toBe(true)                    // republished (unpublish undone)
    expect((SCHED.retired as any)[rk0]).toBeDefined()    // the audit line was NOT erased
    expect((SCHED.retired as any)[rk0].logged).toBe(true)
  })
})
