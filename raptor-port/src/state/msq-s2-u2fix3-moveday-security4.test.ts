// @vitest-environment jsdom
/* SECURITY READ OF U2 FIX ROUND 2 — PROOF 4 (fix 3's rule, the Plan road): a move's bell line reaches only a reader in
   force without a break since before the move day began. `liveAt` rides the ACCOUNT row, so an Undo that puts back a Plan
   ROW alone (the Undo of "Plan of 149 ended") never dates it: the row comes back with its recorded day and its recorded
   moment (`fromAt`) where its man has not moved since (perms.ts grantBackHolds), and the next wake writes the Plan holder
   the line of a move day on which he held no Plan. The twin, by a Plan, of the builder's own case 2c (the Undo of "made a
   member" on the 17th: no line of the 16th). NOTICES are read raw. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { saveAccess, accountsLoad, levelIn, signIn, sessionFor } from './accounts'
import { unitsLoad, todayIso } from './units'
import { NOTICES, type Notice } from './notices'
import { globalUndo } from '../undo/timeline'
import { setSession, setMe, SESSION } from './auth'
import { enterSquadron } from './store'

withThird()
beforeEach(() => { NOTICES.length = 0 })
const reload = (): void => { unitsLoad(); accountsLoad() }
const isRangersMove = (n: Notice): boolean => {
  const p: any = n.what?.[0]
  return p?.k === 'sqplan' && p.who === PID.ranger && p.c === 'moved' && n.u === 'u149' && n.day === '2026-07-16'
}
const movesTo = (pid: string): Notice[] => NOTICES.filter(n => isRangersMove(n) && String(n.to) === pid)
const audience = (): string[] => NOTICES.filter(isRangersMove).map(n => String(n.to)).sort()

describe('security 4 — the Undo of "Plan of 149 ended" after a move day writes the move day\'s line to a man who held no Plan that day', () => {
  it('Hunter\'s Plan of 149 ended by Kestrel on the 15th and put back by Kestrel\'s Undo on the 17th: no line of Ranger\'s move of the 16th', () => {
    /* Wed 15: Saber makes Ranger a 142 admin; Kestrel gives Ranger Plan of 149, then ends Hunter's Plan of 149 */
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Saber makes Ranger a 142 admin').toBeNull()
    reload()
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Ranger Plan of 149').toBeNull()
    reload()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } }), 'setup: Kestrel ends Hunter\'s Plan of 149').toBeNull()
    reload()
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBeNull()
    /* …and Ranger is moved to 150 from the 16th, saved by Saber elsewhere (Kestrel's session and Undo list kept) */
    const s = SESSION
    setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
    expect(moveMan(PID.ranger, third.u150), 'setup: Saber moves Ranger (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
    setSession(s); setMe(PID.kestrel); reload()
    pastMidnight()
    expect(todayIso()).toBe('2026-07-16')
    expect(audience(), 'the move day\'s audience: Hunter holds no Plan of 149 that day').toEqual([PID.kestrel, PID.saber].sort())
    /* Fri 17: Kestrel undoes "Plan of 149 ended" — Hunter holds Plan of 149 again */
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, level: levelIn(ACCT.hunter, 'u149', todayIso()) }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, level: 'admin' })
    pastMidnight()
    expect(movesTo(PID.hunter), 'Hunter held no Plan of 149 on the move day').toEqual([])
  })
})
