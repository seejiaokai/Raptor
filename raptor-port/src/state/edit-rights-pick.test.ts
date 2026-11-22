// @vitest-environment jsdom
/* STEP A — EDIT RIGHTS FOLLOW THE SQUADRON (the second-half plan, docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md
   §2; §15 D8; D2336, D2252, D2253, D2317). The menu (step B) makes another squadron reachable, so this lands first: a
   person with View only of 149 who has 149 picked is offered none of 149's edit controls — the schedule pages, Logic,
   the templates, Admin → Squadron config, Admin → Data's two clears — while his own squadron's pages (Inputs, the OIL
   list, the settings windows of 142) stay his. Plan of 149 and the master mark: everything on, in both. The pick here is
   made by hand (`enterSquadron`), as the menu will make it. Red first on today's code: every "may he edit" asked only
   the role. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { enterSquadron, switchUnit, notify } from './store'
import { setGrant } from './units'
import { canEditSched, lgCanEdit, setLgEdit, canEditOwn } from './auth'
import { maySchedEditPage, adminOfUnit } from './perms'
import { HOOKS } from '../engine/hooks'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { CURPAGE, setPage } from './view'
import { clearHistoryData, clearEditHistory } from '../ui/inputedit'
import { saveCut, getCut, openWinFor, forgetWin, winUnit } from './cutoff'
import { adminOfList } from '../ui/oilday'
import { commitSchedVoid, SCHED_TYPES } from './sched-commit'
import { DAYS } from '../engine/data'

useMsqWorld()
afterEach(() => {
  setLgEdit(false)
  forgetWin('inputs')
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
})

/* Saber (master admin) gives Hunter (142's admin) a right in 149, then Hunter signs in */
function hunterWith(level: 'view' | 'admin') {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', level, PID.hunter).ok).toBe(true)
  signInAs('hunter')
  expect(UNIT).toBe('u142')
}
const scheduleControls = () => {
  setLgEdit(true)
  return {
    canEditSched: canEditSched(),
    maySchedEditPage: maySchedEditPage(),
    logic: lgCanEdit(),
    editMode: HOOKS.editMode(),
    clearData: clearHistoryData('all' as any, '2000-01-01', '2100-01-01', true) >= 0 && canEditSched(),
  }
}
const allOff = { canEditSched: false, maySchedEditPage: false, logic: false, editMode: false, clearData: false }

describe('View of 149, 149 picked — 149 is read only to him', () => {
  it('no schedule control: Edit Schedule, its edit mode, Logic, Admin → Data\'s clears', () => {
    hunterWith('view')
    setPage('editsched')
    expect(HOOKS.editMode(), 'control: 142 picked, he edits').toBe(true)
    enterSquadron('u149')
    notify()
    expect(UNIT).toBe('u149')
    expect(scheduleControls()).toEqual(allOff)
    expect(clearHistoryData('all' as any, '2000-01-01', '2100-01-01', true), 'Clear old clutter…').toBe(0)
    expect(clearEditHistory('all' as any, '2000-01-01', '2100-01-01', true), 'Clear edit history…').toBe(0)
  })
  it('on Edit Schedule when the pick moves to 149, he lands on View-only Sched (D8)', () => {
    hunterWith('view')
    setPage('editsched')
    enterSquadron('u149')
    notify()
    expect(CURPAGE).toBe('viewsched')
  })
  it('his own squadron\'s pages stay his: Inputs, the OIL list, 142\'s settings windows', () => {
    hunterWith('view')
    enterSquadron('u149')
    expect(canEditOwn(), 'Inputs, SANS, Quals — his own squadron').toBe(true)
    expect(adminOfUnit('u142')).toBe(true)
    expect(adminOfUnit('u149')).toBe(false)
    expect(adminOfList('u142')).toBe(true)
    expect(adminOfList('u149')).toBe(false)
    const rule = getCut('inputs', 'u142')
    expect(saveCut('inputs', { ...rule, lead: rule.lead === 7 ? 8 : 7 } as any, 'u142').ok, "142's Inputs cut-off").toBe(true)
    expect(saveCut('inputs', getCut('inputs', 'u149'), 'u149').ok, "149's").toBe(false)
  })
  it('a settings window opened on 142\'s Logic and left open while 149 is picked stays 142\'s (R-O5)', () => {
    hunterWith('view')
    openWinFor('inputs', null)
    expect(winUnit('inputs')).toBe('u142')
    enterSquadron('u149')
    expect(winUnit('inputs'), 'stamped with the squadron in view when it opened').toBe('u142')
  })
  it('the gate refuses what the page no longer offers', () => {
    hunterWith('view')
    enterSquadron('u149')
    const r: any = commitSchedVoid(SCHED_TYPES.mutate, () => { (DAYS[0] as any).note = 'forged by a View holder' })
    expect(r.ok).toBe(false)
  })
  it('142 picked again: all back', () => {
    hunterWith('view')
    setPage('editsched')
    enterSquadron('u149')
    enterSquadron('u142')
    setPage('editsched')
    expect(scheduleControls()).toEqual({ canEditSched: true, maySchedEditPage: true, logic: true, editMode: true, clearData: true })
  })
})

describe('Plan of 149 and the master mark — everything on, in both', () => {
  it('Plan of 149 (full access, D2201): 149\'s schedule controls on', () => {
    hunterWith('admin')
    setPage('editsched')
    enterSquadron('u149')
    expect(scheduleControls()).toEqual({ canEditSched: true, maySchedEditPage: true, logic: true, editMode: true, clearData: true })
    expect(adminOfUnit('u149')).toBe(true)
    expect(canEditOwn()).toBe(true)
  })
  it('a master admin: on in 142 and in 149', () => {
    signInAs('saber')
    setPage('editsched')
    expect(scheduleControls().canEditSched).toBe(true)
    enterSquadron('u149')
    setPage('editsched')
    expect(scheduleControls()).toEqual({ canEditSched: true, maySchedEditPage: true, logic: true, editMode: true, clearData: true })
    expect(adminOfUnit('u142') && adminOfUnit('u149')).toBe(true)
  })
  it('a member: nothing, anywhere', () => {
    signInAs('ranger')
    expect(canEditSched() || canEditOwn() || adminOfUnit('u142')).toBe(false)
  })
})
