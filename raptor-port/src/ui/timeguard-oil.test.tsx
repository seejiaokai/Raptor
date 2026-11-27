// @vitest-environment jsdom
/* [END-TIME-GUARD] step 2 — THE MISSING TIME IS REFUSED BEFORE THE DAY'S OIL QUESTION (his D2855 E2), and the OIL list's
   held name is never written while a time is missing (D2612 — the backstop in ui/oilsign.ts writeSign; Astra's red-team
   read, 9: a held Later as well as a held Save). The harness is ui/oilsign.test.tsx's: a Saturday whose only work is
   Bane's Training, its OIL question never answered, driven through the door the sign-off box's handler calls
   (signPick) and the list's own Save and Later bodies. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, signShown } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { stashClear } from '../engine/weekstash'
import { initStore, writeInputsBatch } from '../state/store'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { initStore as lwInitStore, setPeople, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { oilOpenOn, wireLeaveWarSync } from '../leavewar/sync'
import * as pops from './pops'
import { signPick, holdLater, holdSave, resetOilSign } from './oilsign'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const TIME_NOTE = 'Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign.'
const file = (r: any) => { expect(writeInputsBatch(() => { INPUTS.push(r) })).toBe(true); view.afterSchedMutate() }
let said: Array<[string, any]> = []
const realToast = HOOKS.toast
const blocked = () => said.filter(([, k]) => k === 'blocked').map(([m]) => m)
/* a Common Programme row with a start and no end on the Saturday — one item missing a time */
const gap = () => { (DAYS[SAT] as any).allhands = [{ prog: 'WEEKEND BRIEF', str: '0900', end: '' }] }
const fill = () => { (DAYS[SAT] as any).allhands[0].end = '0930' }

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop(); view.setUnpubArm(null); view.DPREV.clear()
  initStore()
  lwInitStore(memoryBackend()); setPeople(projectPeople()); setRole('admin')
  wireLeaveWarSync()
  _resetDisclosure()
  pops.setOilList(null); resetOilSign()
  said = []
  HOOKS.toast = ((m: any, k: any) => { said.push([String(m), k]) }) as any
  view.setPage('editsched')
  const d: any = DAYS[SAT]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
  file({ iid: 'fx-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now' })
  expect(oilOpenOn(SAT_ISO, SAT_ISO).map(o => o.iid), 'setup: the question is open').toContain('fx-train')
})
afterEach(() => { HOOKS.toast = realToast; pops.setOilList(null) })

describe('a missing time and an open OIL question on one day (D2855 E2)', () => {
  it('the first press refuses for the time — the OIL list does not open, nothing is signed', () => {
    gap()
    expect(signPick(SAT, 'cur', 'ignite')).toBe('refused')
    expect(pops.OILLIST, 'the list stays shut').toBeNull()
    expect(signOf(SAT).cur).toBeFalsy()
    expect(blocked()).toEqual([TIME_NOTE])
  })

  it('the time typed, the next press opens the list holding the name', () => {
    gap()
    expect(signPick(SAT, 'cur', 'ignite')).toBe('refused')
    fill()
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    expect(pops.OILLIST).toMatchObject({ hold: { di: SAT, role: 'cur', who: 'ignite' } })
    expect(blocked()).toHaveLength(1)
  })
})

describe('the OIL list\'s held name meets a time emptied while the list was up (D2612 — the backstop)', () => {
  it('Later: nothing is signed, the time note is said, and the day is not marked asked', () => {
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    const hold = pops.OILLIST!.hold!
    gap()
    holdLater(hold, SAT_ISO, UNIT)
    expect(signShown(SAT).cur, 'no name written').toBeFalsy()
    expect(blocked()).toEqual([TIME_NOTE])
    fill()
    /* the question was never used up: the next press asks again */
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
  })

  it('Save: the answer is kept, the name is not written', () => {
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    const hold = pops.OILLIST!.hold!
    gap()
    expect(holdSave(hold, SAT_ISO, UNIT, { 'fx-train': 'y' })).toBe(true)
    expect(signShown(SAT).cur, 'no name written').toBeFalsy()
    expect(blocked()).toEqual([TIME_NOTE])
  })

  it('with every time typed, Later signs as before', () => {
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    holdLater(pops.OILLIST!.hold!, SAT_ISO, UNIT)
    expect(signShown(SAT).cur).toBe('ignite')
    expect(blocked()).toEqual([])
  })
})
