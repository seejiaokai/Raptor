// @vitest-environment jsdom
/* Fix read 2, the core share — an input's squadron stamp and its filer at the commit gate (perms.ts inputWhoProblem): the
   cases beside the readers' own proofs (msq-fix2-forged-stamp, msq-fix2-sec-stamp-plant). A stamp is judged while men
   are named too, never refused outright (D2243 Q1: a placeholder meeting keeps its stamp while men are named); a member's
   take-out leaves the input on the squadron it stood on; a filer is not rewritten onto another squadron's man. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { INPUTS, inputBelongs, idsOf, holds } from '../engine/inputs'
import { commitInput, draftOf } from '../ui/inputedit'
import { writeInputsBatch } from './store'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

const DAY = '2026-07-20'
const byIid = (iid: any): any => INPUTS.find((x: any) => x && x.iid === iid)
function file(who: 'saber' | 'hunter' | 'kestrel', unit: string, remarks: string, people: string[]): any {
  signInAs(who)
  const had = new Set(INPUTS.map((x: any) => x.iid))
  expect(commitInput(null, { type: 'Meeting', start: DAY, allday: true, remarks, u: unit }, people), `setup: "${remarks}" filed`).toBe(true)
  return (INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === remarks) as any).iid
}
const without = (iid: any, pid: string) => () => { const r = byIid(iid); r.people = r.people.filter((e: any) => String(e.p) !== pid) }
const takeMeOut = (iid: any, me: string): boolean => { const r = byIid(iid); return commitInput(r, draftOf(r), idsOf(r).map(String).filter(p => p !== me)) }

describe('fix read 2 — a stamp on an input that names men is judged, not refused', () => {
  it('the master admin’s 149 meeting keeps 149’s stamp with Osprey named; 149’s admin changes it, 142’s cannot', () => {
    const iid = file('saber', 'u149', 'stamped and named', ['allavail', PID.osprey])
    signInAs('saber')
    expect(writeInputsBatch(() => { byIid(iid).u = 'u149' }), 'a master admin: every squadron’s').toBe(true)
    signInAs('kestrel')
    expect(writeInputsBatch(() => { byIid(iid).remarks = 'by 149’s admin' }), '149’s own admin').toBe(true)
    signInAs('hunter')
    expect(writeInputsBatch(() => { byIid(iid).remarks = 'by 142’s admin' }), '142’s admin').toBe(false)
    signInAs('kestrel')
    expect(writeInputsBatch(() => { byIid(iid).u = 'u142' }), '149’s admin holds nothing in 142').toBe(false)
    expect(byIid(iid).u).toBe('u149')
  })
})

describe('fix read 2 — a member’s take-out leaves the input on the squadron it stood on', () => {
  it('the door’s own "Take me out" passes, with its stamp, and his Undo of it', () => {
    const iid = file('saber', 'u149', 'door take-out', ['allavail', PID.osprey])
    signInAs('osprey')
    expect(takeMeOut(iid, PID.osprey)).toBe(true)
    expect(inputBelongs(byIid(iid), 'u149')).toBe(true)
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(holds(byIid(iid), PID.osprey)).toBe(true)
  })
  it('a hand-made take-out that would leave it read by its filer’s other squadron is refused', () => {
    const iid = file('saber', 'u149', 'bare take-out', ['allavail', PID.osprey])
    signInAs('osprey')
    const r0 = byIid(iid)
    const stamped = typeof r0.u === 'string'
    const ok = writeInputsBatch(() => { without(iid, PID.osprey)(); delete byIid(iid).u })
    /* (Saber, its filer, is 142's: unstamped and naming nobody it would be 142's meeting) */
    expect(ok, 'left unstamped, read as 142’s').toBe(false)
    expect(inputBelongs(byIid(iid), 'u142')).toBe(false)
    expect(holds(byIid(iid), PID.osprey), 'rolled back').toBe(true)
    expect(typeof byIid(iid).u === 'string').toBe(stamped)
  })
  it('…and one on his own squadron’s meeting, filed by his own squadron’s man, passes as before', () => {
    const iid = file('hunter', 'u142', '142 bare', ['allavail', PID.ranger])
    signInAs('ranger')
    expect(writeInputsBatch(without(iid, PID.ranger))).toBe(true)
    expect(inputBelongs(byIid(iid), 'u142')).toBe(true)
  })
})

describe('fix read 2 — who filed it is not rewritten onto another squadron’s man', () => {
  it('142’s admin cannot name 149’s Kestrel its filer; naming his own squadron’s man passes', () => {
    const iid = file('hunter', 'u142', 'filer', ['allavail', PID.ranger])
    signInAs('hunter')
    expect(writeInputsBatch(() => { byIid(iid).by = PID.kestrel }), 'the record’s filer').toBe(false)
    expect(writeInputsBatch(() => { const r = byIid(iid); r.people = r.people.map((e: any) => (String(e.p) === 'allavail' ? { ...e, by: PID.kestrel } : e)) }), 'the placeholder’s').toBe(false)
    expect(writeInputsBatch(() => { byIid(iid).by = PID.ranger }), '142’s own man').toBe(true)
  })
})
