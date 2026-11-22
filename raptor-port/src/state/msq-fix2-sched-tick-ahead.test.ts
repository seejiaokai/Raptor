// @vitest-environment jsdom
/* fable2 — the Scheduler tick's record (schedOf / schedFrom): can the squadron a man LEAVES write him the tick of the squadron
   he joins, to hold from his move day? (the admin role's record is held to "his squadron of today, from today" — K3) */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, moveMan, on } from '../test-support/msq-world'
import { ownershipViolation, cmdAuthorize } from './perms'
import { deriveActor } from '../command/actor'
import { PEOPLE } from '../engine/people'
import { schedTickIn, unitsLoad } from './units'
import { accountsLoad } from './accounts'

useMsqWorld()

describe('fable2 — a Scheduler tick recorded for the squadron he is about to join', () => {
  it('Hunter (142\'s admin) moves Ranger to 149 from Thu 16, then hand-writes Ranger\'s tick as given in 149 on Thu 16', () => {
    signInAs('hunter')
    expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    const was = { ...(PEOPLE as any)[PID.ranger] }
    const forged = { ...was, quals: { ...(was.quals || {}), sched: true }, schedOf: 'u149', schedFrom: '2026-07-16' }
    const actor = deriveActor()
    expect(cmdAuthorize('people.edit', actor, null)).toBe(true)
    const env: any = { seq: -1, at: '', actor, origin: 'user', scope: { module: 'people' }, type: 'people.edit', changes: [{ op: 'put', collection: 'people', id: PID.ranger, before: was, after: forged }], emit: true }
    const refused = ownershipViolation(env)
    console.log('GATE', refused)
    /* what the record would then read, the day he arrives */
    ;(PEOPLE as any)[PID.ranger] = forged
    on(16); unitsLoad(); accountsLoad()
    const holds = schedTickIn(PID.ranger, 'u149', '2026-07-16')
    console.log('HOLDS-IN-149', holds)
    expect(refused == null && holds, 'the gate lets it through AND the tick holds in 149 on arrival').toBe(false)
  })
})
