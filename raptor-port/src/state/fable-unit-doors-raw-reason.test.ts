// @vitest-environment jsdom
/* FABLE F3 — the squadron doors show the gate's own reason (the R5 / B3 shape; units.ts). A move of squadron, a right
   given or taken, a squadron's place and "+ New squadron" check nothing of WHO at the door, and units.ts `said` hands
   the gate's reason to the screen word for word: "member-writes-own: not an admin of u149 (home:h…)".
   Correct: refused (D2191, D2192 — each squadron's admins act only for their own), in plain words. RED while raw. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { addUnit, moveUnit, removeGrant, setGrant, setHome, setPlace } from './units'

useMsqWorld()
const RAW = /member-writes-own|not permitted for|[(](home|grant|unit|unitplace|place):/
const plain = (what: string, r: { ok: boolean; message?: string }) => {
  expect(r.ok, what).toBe(false)
  expect(r.message ?? '', `${what} — the gate's own words reached the screen`).not.toMatch(RAW)
}
describe('F3 — a door refused by the gate says plain words', () => {
  /* (helper "kinds", K4 — his D2160, "the new one never asked": a squadron's own admin moves his own man; it was refused,
     in plain words — now it saves) */
  it('Hunter, admin of 142, moves his man Ranger to 149: saved', () => { signInAs('hunter'); expect(setHome(PID.ranger, 'u149')).toMatchObject({ ok: true }) })
  it('Kestrel, admin of 149, takes Ranger into 149', () => { signInAs('kestrel'); plain('move in', setHome(PID.ranger, 'u149')) })
  it('Hunter takes away a View of 149 that Kestrel gave Ranger', () => {
    signInAs('kestrel'); expect(setGrant(ACCT.ranger, 'u149', 'view', PID.ranger).ok).toBe(true)
    signInAs('hunter'); plain('take a right', removeGrant(ACCT.ranger, 'u149'))
  })
  it('Hunter gives himself View of 149', () => { signInAs('hunter'); plain('give a right', setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)) })
  it('Kestrel moves 142 to another place', () => {
    signInAs('saber'); const p = setPlace({ name: 'Away base', tz: 'Asia/Singapore' }); expect(p.ok).toBe(true)
    signInAs('kestrel'); plain('the place of a squadron', moveUnit('u142', p.id!))
  })
  it('Hunter, no master admin, presses "+ New squadron"', () => { signInAs('hunter'); plain('+ New squadron', addUnit('151', 'p1', ACCT.kestrel)) })
})
