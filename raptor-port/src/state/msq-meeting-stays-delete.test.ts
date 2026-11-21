// @vitest-environment jsdom
/* AN ALL AVAIL MEETING STAYS ON THE SQUADRON IT WAS FILED ON — through DELETING the one man named in it (his D2243 Q1; the
   reshape plan C3; found by helper "meeting", the night of 21 Nov 26, beside msq-meeting-stays.test.ts).
   The fault: Saber (home 142) files a meeting for ALL AVAIL on 149's schedule — stamped `u: 'u149'` — and adds Osprey,
   149's man: the stamp is dropped, the input placed by the man it names. Osprey is then deleted (Admin → Users' Delete —
   state/person-delete.ts applyDelete takes him out of every input he shared from his cutoff on). The input named nobody
   and carried no stamp, was read by its filer's home and MOVED to 142's schedule.
   Every step goes through the app's own doors — the window's save (commitInput) and the delete (deletePerson) — and so
   through the commit gate. The world: test-support/msq-world.ts. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { INPUTS, inputBelongs, inputUnitOf, inputTouches, holds } from '../engine/inputs'
import { commitInput, draftOf } from '../ui/inputedit'
import { deletePerson } from './person-delete'

useMsqWorld()

const DAY = '2026-07-20'
const byIid = (iid: any): any => INPUTS.find((x: any) => x && x.iid === iid)
function file(unit: string, remarks: string, people: string[]): any {
  signInAs('saber')
  const had = new Set(INPUTS.map((x: any) => x.iid))
  expect(commitInput(null, { type: 'Meeting', start: DAY, allday: true, remarks, u: unit }, people), `setup: "${remarks}" filed`).toBe(true)
  const r: any = INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === remarks)
  expect(r, 'setup: filed').toBeTruthy()
  return r.iid
}
const setPeople = (iid: any, people: string[]): boolean => { const r = byIid(iid); return commitInput(r, draftOf(r), people) }
const sits = (iid: any, unit: string, other: string, why: string) => {
  const r = byIid(iid)
  expect(inputUnitOf(r), `${why}: read as ${unit}'s`).toBe(unit)
  expect(inputBelongs(r, unit), `${why}: on ${unit}'s schedule`).toBe(true)
  expect(inputTouches(r, unit), `${why}: on ${unit}'s Inputs`).toBe(true)
  expect(inputBelongs(r, other), `${why}: not on ${other}'s schedule`).toBe(false)
  expect(inputTouches(r, other), `${why}: not on ${other}'s Inputs`).toBe(false)
}

describe("a 149 ALL AVAIL meeting the master admin filed, a 149 man added, and that man deleted", () => {
  it("stays on 149's schedule after Osprey is deleted — never 142's, its filer's", () => {
    const iid = file('u149', '149 brief delete', ['allavail'])
    expect(byIid(iid).u, 'control: stamped where it was filed').toBe('u149')
    expect(setPeople(iid, ['allavail', PID.osprey]), 'Saber adds Osprey').toBe(true)
    expect(byIid(iid), 'control: a man named, the stamp is dropped (he places it)').not.toHaveProperty('u')
    sits(iid, 'u149', 'u142', 'with Osprey in it')
    expect(deletePerson(PID.osprey), 'Saber deletes Osprey').toBeNull()
    expect(holds(byIid(iid), PID.osprey), 'he is out of it').toBe(false)
    expect(byIid(iid).u, 'left naming nobody: stamped where it stood').toBe('u149')
    sits(iid, 'u149', 'u142', 'after Osprey was deleted')
  })
  it("…and by 149's own admin, Kestrel: the same", () => {
    const iid = file('u149', '149 brief delete K', ['allavail'])
    expect(setPeople(iid, ['allavail', PID.osprey])).toBe(true)
    signInAs('kestrel')
    expect(deletePerson(PID.osprey), 'Kestrel deletes Osprey').toBeNull()
    expect(holds(byIid(iid), PID.osprey)).toBe(false)
    sits(iid, 'u149', 'u142', 'after Osprey was deleted by Kestrel')
  })
})

describe('controls — the same on both sides of the fix', () => {
  it("a 142 meeting: Ranger added, then deleted — stays 142's", () => {
    const iid = file('u142', '142 brief delete', ['allavail'])
    expect(setPeople(iid, ['allavail', PID.ranger])).toBe(true)
    expect(deletePerson(PID.ranger)).toBeNull()
    expect(holds(byIid(iid), PID.ranger)).toBe(false)
    sits(iid, 'u142', 'u149', 'after Ranger was deleted')
  })
  it('Osprey deleted from an input that still names another 149 man: no stamp is written', () => {
    const iid = file('u149', '149 several delete', ['allavail', PID.osprey, PID.kestrel])
    expect(deletePerson(PID.osprey)).toBeNull()
    const r = byIid(iid)
    expect(holds(r, PID.osprey)).toBe(false)
    expect(holds(r, PID.kestrel)).toBe(true)
    expect(r).not.toHaveProperty('u')
    sits(iid, 'u149', 'u142', 'Kestrel still in it')
  })
})
