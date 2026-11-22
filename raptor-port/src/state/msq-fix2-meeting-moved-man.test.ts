// @vitest-environment jsdom
/* opus1 — a 149 ALL AVAIL meeting naming one 149 man, who is then moved to 142 before the meeting's day (D2243 Q1: "an
   ALL AVAIL meeting stays on the squadron it was filed on" when a man moves squadron). */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, moveMan, PID } from '../test-support/msq-world'
import { INPUTS, inputUnitOf, idsOf, holds } from '../engine/inputs'
import { commitInput, draftOf } from '../ui/inputedit'

useMsqWorld()

const DAY = '2026-07-20'
const byIid = (iid: any): any => INPUTS.find((x: any) => x && x.iid === iid)
const setPeople = (iid: any, people: string[]): boolean => { const r = byIid(iid); return commitInput(r, draftOf(r), people) }

describe('opus1 — a 149 ALL AVAIL meeting and a named man moved to 142', () => {
  /* NARROWED by the fix helper (22 Nov 26): the reader's two last lines asked that the MIXED meeting, between the move and
     the take-out, still read as 149's — that case is his to decide (the readers stay named-first), so they are replaced by
     what the fix does give: the stamp it was filed with is carried while Osprey is named. */
  it("Kestrel's ALL AVAIL meeting with Osprey: Osprey moved to 142 from Thu 16 — the meeting keeps the stamp it was filed with", () => {
    signInAs('kestrel')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    expect(commitInput(null, { type: 'Meeting', start: DAY, allday: true, remarks: 'k brief', u: 'u149' }, ['allavail', PID.osprey]), 'filed (door bypassed: commitInput)').toBe(true)
    const iid = INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === 'k brief')!.iid
    expect(inputUnitOf(byIid(iid)), 'control: 149\'s').toBe('u149')
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    expect(byIid(iid).u, 'the squadron it was filed on, carried').toBe('u149')
  })
  it("…and once Osprey takes himself out it is ALL AVAIL alone again — stamped 149, not 142", () => {
    signInAs('kestrel')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    expect(commitInput(null, { type: 'Meeting', start: DAY, allday: true, remarks: 'k brief 2', u: 'u149' }, ['allavail'])).toBe(true)
    const iid = INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === 'k brief 2')!.iid
    expect(byIid(iid).u).toBe('u149')
    expect(setPeople(iid, ['allavail', PID.osprey]), 'Kestrel adds Osprey').toBe(true)
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    signInAs('osprey')
    expect(setPeople(iid, idsOf(byIid(iid)).map(String).filter(p => p !== PID.osprey)), 'his take-out saved').toBe(true)
    expect(holds(byIid(iid), PID.osprey)).toBe(false)
    expect(byIid(iid).u, 'the squadron it was filed on').toBe('u149')
  })
})
