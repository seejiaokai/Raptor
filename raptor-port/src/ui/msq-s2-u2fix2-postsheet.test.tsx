// @vitest-environment jsdom
/* U2 FIX ROUND 2, FIX 2 ON SCREEN (Fable 1, Opus F3, security S5 — the brief
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix2-brief.md): the Leave War's posting sheet never closes on a refusal.
   Kestrel (149's admin) posts Osprey, made an admin of 149, overseas from today; it runs (archived, sign-in suspended).
   Hunter (142's admin, Plan of 149) presses "Undo post out" on Osprey's sheet: the sheet stays open and says D2806's
   sentence, where it used to close as if it had worked. Pressed by Kestrel it closes and Osprey is back. A moved member
   (fix 1's Hunter, at home in 149 as its member) posted out of 149 and taken back by Mako (Plan of 149) goes through. */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, on, pastMidnight, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, accountById, accountsLoad } from '../state/accounts'
import { unitsLoad, todayIso } from '../state/units'
import { enterSquadron } from '../state/store'
import { postOut } from '../leavewar/sync'
import { Matrix } from '../leavewar/ui/Matrix'
import { PEOPLE } from '../engine/people'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(() => { cleanup() })
const reload = (): void => { unitsLoad(); accountsLoad() }
const MAKE = (n: string) => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`
const back = (pid: string, acct: string) => ({ archived: !!(PEOPLE as any)[pid]?.archived, on: accountById(acct)!.on })

/* the war of 149 drawn, the posted man's day after his posting tapped: his posting's sheet */
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

describe('the posting sheet\'s "Undo post out" of a 149 admin', () => {
  it('pressed by Hunter (Plan of 149): the sheet stays open and says who can; nothing changed', () => {
    ospreyAdminPostedOverseas()
    on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload()
    openPostingSheet(PID.osprey)
    pressUndo()
    expect(screen.queryByTestId('postout-sheet'), 'the sheet stays open').toBeTruthy()
    expect(screen.getByTestId('postout-err').textContent).toBe(MAKE('149'))
    reload()
    expect(back(PID.osprey, ACCT.osprey)).toEqual({ archived: true, on: false })
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
