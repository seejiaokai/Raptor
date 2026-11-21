// @vitest-environment jsdom
/* SECURITY READ — a forged squadron stamp (`u`) on an input that still names a man, then his own take-out:
   the meeting is left naming nobody, stamped another squadron, and lands on THAT squadron's schedule. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { INPUTS, inputBelongs, inputUnitOf, inputTouches, inputOnDay, idsOf, holds } from '../engine/inputs'
import { commitInput, draftOf } from '../ui/inputedit'
import { writeInputsBatch, switchRoleView } from './store'

useMsqWorld()

const DAY = '2026-07-20'
const byIid = (iid: any): any => INPUTS.find((x: any) => x && x.iid === iid)
const fileAs = (remarks: string, people: string[]): any => {
  const had = new Set(INPUTS.map((x: any) => x.iid))
  expect(commitInput(null, { type: 'Meeting', start: DAY, allday: true, remarks }, people), 'setup: filed').toBe(true)
  return (INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === remarks) as any).iid
}
const takeMeOut = (iid: any, me: string): boolean => { const r = byIid(iid); return commitInput(r, draftOf(r), idsOf(r).map(String).filter(p => p !== me)) }

describe('a 142 person plants an ALL AVAIL meeting on 149\'s schedule', () => {
  it('Ranger, 142\'s MEMBER: files for ALL AVAIL + himself, forges u149, then "Take me out"', () => {
    signInAs('ranger')
    const iid = fileAs('planted by a member', ['allavail', PID.ranger])
    expect(inputUnitOf(byIid(iid)), 'control: 142\'s').toBe('u142')
    /* control: the direct forgery — a placeholder-only input stamped 149 — is refused */
    expect(writeInputsBatch(() => { const r = byIid(iid); r.people = r.people.filter((e: any) => String(e.p) !== PID.ranger); r.u = 'u149' }), 'control: direct stamp refused').toBe(false)
    /* step 1: the stamp forged while he is still named — must be refused */
    const step1 = writeInputsBatch(() => { byIid(iid).u = 'u149' })
    /* step 2: his own take-out, by the window's own door */
    const step2 = step1 ? takeMeOut(iid, PID.ranger) : false
    const r = byIid(iid)
    expect(step1 && step2 && !holds(r, PID.ranger) && inputOnDay(r, 'u149', DAY), 'a 142 member\'s meeting must never land on 149\'s schedule').toBe(false)
    expect(inputBelongs(r, 'u149')).toBe(false)
    expect(inputTouches(r, 'u149')).toBe(false)
  })

  it('Hunter, 142\'s plain ADMIN: forges u149 on his own meeting, switches to the member view, takes himself out', () => {
    signInAs('hunter')
    const iid = fileAs('planted by an admin', ['allavail', PID.hunter])
    const step1 = writeInputsBatch(() => { byIid(iid).u = 'u149' })
    switchRoleView()
    const step2 = step1 ? takeMeOut(iid, PID.hunter) : false
    const r = byIid(iid)
    expect(step1 && step2 && inputOnDay(r, 'u149', DAY), 'a 142 admin\'s meeting must never land on 149\'s schedule').toBe(false)
  })

  it('…or with no stamp at all: Hunter names Kestrel as who filed it, then a bare take-out leaves it read by its "filer\'s" squadron', () => {
    signInAs('hunter')
    const iid = fileAs('planted by its filer', ['allavail', PID.hunter])
    const step1 = writeInputsBatch(() => {
      const r = byIid(iid)
      r.by = PID.kestrel
      r.people = r.people.map((e: any) => (String(e.p) === 'allavail' ? { ...e, by: PID.kestrel } : e))
    })
    switchRoleView()
    const step2 = step1 ? writeInputsBatch(() => { const r = byIid(iid); r.people = r.people.filter((e: any) => String(e.p) !== PID.hunter) }) : false
    const r = byIid(iid)
    expect(step1 && step2 && !holds(r, PID.hunter) && inputOnDay(r, 'u149', DAY), 'landed on 149\'s schedule by its forged filer').toBe(false)
  })
})
