// @vitest-environment jsdom
/* fable2 — the first admin of a new squadron keeps his session (and so his Undo list) across his move in: a step of last
   night on a man of his OLD squadron can never be undone by him — is it said once and passed over? */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on } from '../test-support/msq-world'
import { accountsLoad, sessionNow } from './accounts'
import { addUnit, setHome, unitsLoad } from './units'
import { updatePersonField } from './quals-write'
import { globalUndo } from '../undo/timeline'
import { PEOPLE } from '../engine/people'

useMsqWorld()

describe('fable2 — the first admin, moved in at midnight, and a step of last night on a man of his old squadron', () => {
  it('Hunter: a change to his own row, then to Ranger’s (142); his move to 150 counts; Undo twice', () => {
    signInAs('saber')
    const r = addUnit('150', 'p1', ACCT.hunter)
    expect(r.ok).toBe(true)
    expect(setHome(PID.hunter, r.id!).ok).toBe(true); unitsLoad()
    signInAs('hunter')
    const own0 = JSON.stringify((PEOPLE as any)[PID.hunter].quals)
    expect(updatePersonField(PID.hunter, { tick: 'daar' } as any)).toBeNull()
    expect(updatePersonField(PID.ranger, { tick: 'daar' } as any)).toBeNull()
    on(16); unitsLoad(); accountsLoad()
    expect(sessionNow(), 'his session stands (still an admin — of 150): his Undo list is kept').toBeUndefined()
    const a = globalUndo() as any, b = globalUndo() as any
    console.log('FIRST-ADMIN', JSON.stringify([a.reason, b.reason]))
    expect(JSON.stringify((PEOPLE as any)[PID.hunter].quals), 'the second press reaches his own older step').toBe(own0)
  })
})
