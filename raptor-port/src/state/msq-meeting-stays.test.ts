// @vitest-environment jsdom
/* AN ALL AVAIL MEETING STAYS ON THE SQUADRON IT WAS FILED ON — through a man's own "Take me out" too (his D2243 Q1; the
   reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md C3).
   The fault (a helper's probe, the night of 21 Nov 26): the master admin (Saber, home 142) files a meeting for ALL AVAIL
   on 149's schedule — stamped `u: 'u149'`. He adds Osprey (149's): the stamp is dropped, as designed, the input now
   placed by the man it names. Osprey takes himself out — his own part only, so the save skipped the stamp (the gate let
   him change nothing but his own entry). The input then named nobody and carried no stamp, was read by its filer's home
   and MOVED to 142's schedule.
   Every save here goes through the window's own door — commitInput, the call "Take me out" makes (ui/InputWindow.tsx
   takeMeOut) — and so through the commit gate. The world: test-support/msq-world.ts. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { INPUTS, inputBelongs, inputUnitOf, inputTouches, idsOf, holds } from '../engine/inputs'
import { commitInput, draftOf } from '../ui/inputedit'
import { writeInputsBatch } from './store'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

const DAY = '2026-07-20'
const byIid = (iid: any): any => INPUTS.find((x: any) => x && x.iid === iid)
/* Saber files it for `people` on `unit`'s schedule, through the window's save */
function file(unit: string, remarks: string, people: string[]): any {
  signInAs('saber')
  const had = new Set(INPUTS.map((x: any) => x.iid))
  expect(commitInput(null, { type: 'Meeting', start: DAY, allday: true, remarks, u: unit }, people), `setup: "${remarks}" filed`).toBe(true)
  const r: any = INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === remarks)
  expect(r, 'setup: filed').toBeTruthy()
  return r.iid
}
/* the signed-in man adds or drops people of a saved input, through the window's save */
const setPeople = (iid: any, people: string[]): boolean => { const r = byIid(iid); return commitInput(r, draftOf(r), people) }
/* "Take me out": the window's own call — everyone in it but him */
const takeMeOut = (iid: any, me: string): boolean => setPeople(iid, idsOf(byIid(iid)).map(String).filter(p => p !== me))
const sits = (iid: any, unit: string, other: string, why: string) => {
  const r = byIid(iid)
  expect(inputUnitOf(r), `${why}: read as ${unit}'s`).toBe(unit)
  expect(inputBelongs(r, unit), `${why}: on ${unit}'s schedule`).toBe(true)
  expect(inputTouches(r, unit), `${why}: on ${unit}'s Inputs`).toBe(true)
  expect(inputBelongs(r, other), `${why}: not on ${other}'s schedule`).toBe(false)
  expect(inputTouches(r, other), `${why}: not on ${other}'s Inputs`).toBe(false)
}

describe("a 149 ALL AVAIL meeting the master admin filed, a 149 man added and taking himself out", () => {
  it("stays on 149's schedule after Osprey takes himself out — never 142's, its filer's", () => {
    const iid = file('u149', '149 brief', ['allavail'])
    expect(byIid(iid).u, 'control: stamped where it was filed').toBe('u149')
    sits(iid, 'u149', 'u142', 'filed')
    expect(setPeople(iid, ['allavail', PID.osprey]), 'Saber adds Osprey').toBe(true)
    expect(byIid(iid), 'control: a man named, the stamp is dropped (he places it)').not.toHaveProperty('u')
    sits(iid, 'u149', 'u142', 'with Osprey in it')
    signInAs('osprey')
    expect(takeMeOut(iid, PID.osprey), 'his own take-out is saved').toBe(true)
    expect(holds(byIid(iid), PID.osprey)).toBe(false)
    sits(iid, 'u149', 'u142', 'after Osprey took himself out')
  })

  it("…and his Undo of that take-out puts him back, the meeting still 149's", () => {
    const iid = file('u149', '149 brief undo', ['allavail'])
    expect(setPeople(iid, ['allavail', PID.osprey])).toBe(true)
    signInAs('osprey')
    expect(takeMeOut(iid, PID.osprey)).toBe(true)
    sits(iid, 'u149', 'u142', 'after the take-out')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(holds(byIid(iid), PID.osprey), 'back in').toBe(true)
    expect(byIid(iid), 'a man named again: no stamp').not.toHaveProperty('u')
    sits(iid, 'u149', 'u142', 'after his Undo')
  })
})

describe('controls — the same on both sides of the fix', () => {
  it("a 142 meeting: Ranger added, takes himself out — stays 142's", () => {
    const iid = file('u142', '142 brief', ['allavail'])
    expect(setPeople(iid, ['allavail', PID.ranger])).toBe(true)
    signInAs('ranger')
    expect(takeMeOut(iid, PID.ranger)).toBe(true)
    expect(holds(byIid(iid), PID.ranger)).toBe(false)
    sits(iid, 'u142', 'u149', 'after Ranger took himself out')
  })

  it('Osprey takes himself out of an input that still names another man: no stamp is written', () => {
    const iid = file('u149', '149 several', ['allavail', PID.osprey, PID.kestrel])
    signInAs('osprey')
    expect(takeMeOut(iid, PID.osprey)).toBe(true)
    const r = byIid(iid)
    expect(holds(r, PID.osprey)).toBe(false)
    expect(holds(r, PID.kestrel)).toBe(true)
    expect(r).not.toHaveProperty('u')
    sits(iid, 'u149', 'u142', 'Kestrel still in it')
  })

  it("a forged take-out that stamps another squadron (u: 'u142') is refused by the gate; the bare take-out passes", () => {
    const iid = file('u149', '149 forged', ['allavail'])
    expect(setPeople(iid, ['allavail', PID.osprey])).toBe(true)
    signInAs('osprey')
    const out = (r: any) => { r.people = r.people.filter((e: any) => String(e.p) !== PID.osprey) }
    expect(writeInputsBatch(() => { const r = byIid(iid); out(r); r.u = 'u142' }), 'forged stamp refused').toBe(false)
    expect(holds(byIid(iid), PID.osprey), 'rolled back: he is still in it').toBe(true)
    expect(byIid(iid)).not.toHaveProperty('u')
    sits(iid, 'u149', 'u142', 'after the refused forgery')
    /* a squadron that is not one at all, and his take-out with something else changed beside it */
    expect(writeInputsBatch(() => { const r = byIid(iid); out(r); r.u = 'u999' }), 'a made-up squadron refused').toBe(false)
    expect(writeInputsBatch(() => { const r = byIid(iid); out(r); r.remarks = 'mine now' }), 'his take-out never changes what it says').toBe(false)
    expect(writeInputsBatch(() => { const r = byIid(iid); out(r) }), 'the bare take-out, nothing else written, passes').toBe(true)
    expect(holds(byIid(iid), PID.osprey)).toBe(false)
  })

  it('a stamp is never his to write while he stays in it, nor on an input that still names a man', () => {
    const iid = file('u149', '149 stay', ['allavail'])
    expect(setPeople(iid, ['allavail', PID.osprey, PID.kestrel])).toBe(true)
    signInAs('osprey')
    expect(writeInputsBatch(() => { byIid(iid).u = 'u149' }), 'a stamp with nobody leaving').toBe(false)
    expect(writeInputsBatch(() => { const r = byIid(iid); r.people = r.people.filter((e: any) => String(e.p) !== PID.osprey); r.u = 'u149' }),
      'a stamp on an input Kestrel is still named in').toBe(false)
    expect(byIid(iid)).not.toHaveProperty('u')
  })

  it("a member takes himself out of his own squadron's input of several people: saved, nothing else changed", () => {
    const iid = file('u142', '142 several', [PID.ranger, PID.hunter])
    const was = structuredClone(byIid(iid))
    signInAs('ranger')
    expect(takeMeOut(iid, PID.ranger)).toBe(true)
    const r = byIid(iid)
    expect(idsOf(r).map(String)).toEqual([PID.hunter])
    expect(r).not.toHaveProperty('u')
    for (const k of ['type', 'date', 'endDate', 'yr', 'allday', 'remarks', 'by', 'at']) expect(r[k], k).toEqual(was[k])
    sits(iid, 'u142', 'u149', 'Hunter still in it')
  })
})
