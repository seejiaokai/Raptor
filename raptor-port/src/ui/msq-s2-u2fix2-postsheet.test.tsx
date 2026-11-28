// @vitest-environment jsdom
/* THE LEAVE WAR'S POSTING SHEET NEVER CLOSES ON A REFUSAL — and bringing an admin back is not one (his D2903, 28 Nov 26).

   This file was U2 fix round 2's fix 2 on screen (Fable 1, Opus F3, security S5 — the brief
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix2-brief.md). Its refusal was Hunter (Plan of 149) pressing "Undo post
   out" on Osprey, 149's admin posted overseas: the sheet stayed open and said D2806's sentence. His ruling took that
   refusal away (U2 fix round 3's addendum, docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-addendum.md): a posted-out
   admin taken back is not "made an admin", so Hunter's press now goes through and the sheet closes, Osprey 149's admin
   again.

   What round 2 fixed in the sheet itself stays, and is held here by the refusal that is left: a MASTER ADMIN's posting
   taken back by one who is not a master admin (D2205 — the save check refuses it). The door says nothing of its own
   there, so the sheet stays open and says "That did not save", where it used to close as if it had worked. (That the
   door could say the master admin sentence instead is Fable's finding 4 of round 2 — words only, not built.)
   A moved member (round 2 fix 1's Hunter, at home in 149 as its member) posted out of 149 and taken back by Mako (Plan
   of 149) goes through, as before. */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, on, pastMidnight, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, setMaster, accountById, accountsLoad, adminsOf } from '../state/accounts'
import { unitsLoad, todayIso } from '../state/units'
import { enterSquadron } from '../state/store'
import { postOut } from '../leavewar/sync'
import { Matrix } from '../leavewar/ui/Matrix'
import { PEOPLE } from '../engine/people'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(() => { cleanup() })
const reload = (): void => { unitsLoad(); accountsLoad() }
const back = (pid: string, acct: string) => ({ archived: !!(PEOPLE as any)[pid]?.archived, on: accountById(acct)!.on })

/* the war of the squadron in view drawn, the posted man's day after his posting tapped: his posting's sheet */
function openPostingSheet(pid: string): HTMLElement {
  render(<div id="page-leavewar" className="page on"><Matrix /></div>)
  act(() => { fireEvent.click(screen.getByTestId(`cell-${pid}-2026-07-16`)) })
  return screen.getByTestId('postout-sheet')
}
const pressUndo = (): void => { act(() => { fireEvent.click(screen.getByTestId('postout-undo')) }) }

function ospreyAdminPostedOverseas(): void {
  signInAs('kestrel')
  expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
  reload()
  enterSquadron('u149'); reload()
  expect(postOut(PID.osprey, todayIso(), 'overseas'), 'setup: Kestrel posts Osprey overseas from today').toBe(true)
  reload()
  expect(back(PID.osprey, ACCT.osprey), 'setup: archived, sign-in suspended').toEqual({ archived: true, on: false })
}

describe('the posting sheet\'s "Undo post out" of a 149 admin (D2903)', () => {
  it('pressed by Hunter (Plan of 149): the sheet closes and Osprey is back, 149\'s admin again', () => {
    ospreyAdminPostedOverseas()
    on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload()
    openPostingSheet(PID.osprey)
    pressUndo()
    expect(screen.queryByTestId('postout-sheet'), 'the sheet closes').toBeNull()
    reload()
    expect(back(PID.osprey, ACCT.osprey)).toEqual({ archived: false, on: true })
    expect(adminsOf('u149', todayIso())).toContain(PID.osprey)
  })
  it('pressed by Kestrel (149\'s own admin): the sheet closes and Osprey is back', () => {
    ospreyAdminPostedOverseas()
    on(15, 11); signInAs('kestrel'); enterSquadron('u149'); reload()
    openPostingSheet(PID.osprey)
    pressUndo()
    expect(screen.queryByTestId('postout-sheet'), 'the sheet closes').toBeNull()
    reload()
    expect(back(PID.osprey, ACCT.osprey)).toEqual({ archived: false, on: true })
  })
})

describe('the sheet stays open on a refusal: a master admin\'s posting taken back by one who is not a master admin', () => {
  /* Saber makes Hunter a master admin and Ranger a 142 admin, then posts Hunter overseas from today; it runs at once */
  function masterHunterPostedOverseas(): void {
    signInAs('saber')
    expect(setMaster(ACCT.hunter, true), 'setup: Saber makes Hunter a master admin').toMatchObject({ ok: true })
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Saber makes Ranger a 142 admin').toBeNull()
    reload()
    on(15, 10)
    expect(postOut(PID.hunter, todayIso(), 'overseas'), 'setup: Saber posts Hunter overseas from today').toBe(true)
    reload()
    expect(back(PID.hunter, ACCT.hunter), 'setup: archived, sign-in suspended').toEqual({ archived: true, on: false })
  }
  it('pressed by Ranger (142\'s admin, no master admin): the sheet stays open and says "That did not save"; nothing changed', () => {
    masterHunterPostedOverseas()
    on(15, 11); signInAs('ranger'); reload()
    openPostingSheet(PID.hunter)
    pressUndo()
    expect(screen.queryByTestId('postout-sheet'), 'the sheet stays open').toBeTruthy()
    expect(screen.getByTestId('postout-err').textContent).toBe('That did not save')
    reload()
    expect(back(PID.hunter, ACCT.hunter)).toEqual({ archived: true, on: false })
  })
  it('control: pressed by Saber, a master admin: the sheet closes and Hunter is back', () => {
    masterHunterPostedOverseas()
    on(15, 11); signInAs('saber'); reload()
    openPostingSheet(PID.hunter)
    pressUndo()
    expect(screen.queryByTestId('postout-sheet'), 'the sheet closes').toBeNull()
    reload()
    expect(back(PID.hunter, ACCT.hunter)).toEqual({ archived: false, on: true })
  })
})

describe('a moved member posted out of 149, taken back by Mako (Plan of 149)', () => {
  it('Hunter, at home in 149 as its member: Mako\'s "Undo post out" goes through and the sheet closes', () => {
    on(15, 9)
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149'), 'setup: Saber moves Hunter to 149').toMatchObject({ ok: true })
    pastMidnight(); reload()
    signInAs('kestrel'); enterSquadron('u149')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    reload()
    expect(postOut(PID.hunter, todayIso(), 'overseas'), 'setup: Kestrel posts Hunter overseas from today').toBe(true)
    reload()
    expect(back(PID.hunter, ACCT.hunter)).toEqual({ archived: true, on: false })
    signInAs('mako'); enterSquadron('u149'); reload()
    render(<div id="page-leavewar" className="page on"><Matrix /></div>)
    act(() => { fireEvent.click(screen.getByTestId(`cell-${PID.hunter}-2026-07-17`)) })
    expect(screen.getByTestId('postout-sheet')).toBeTruthy()
    pressUndo()
    expect(screen.queryByTestId('postout-sheet'), 'the sheet closes').toBeNull()
    reload()
    expect(back(PID.hunter, ACCT.hunter)).toEqual({ archived: false, on: true })
  })
})
