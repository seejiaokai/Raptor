// @vitest-environment jsdom
/* U2 FIX ROUND 2, FIX 3 (Astra 2, Opus F1 — round 1's fix 8 finished; the brief
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix2-brief.md): a move's bell line reaches only those in force on the move
   day. Hunter (Plan of 149) moves to 150 on Thu 16 Jul; the first wake tells Kestrel (149's admin) and Saber (master
   admin). Osprey, an admin of 149 switched off, archived or made a member that day and brought back on the 17th, was
   written the line of the 16th at the next wake, because the audience started from who can sign in TODAY and the stored
   moments (`adminAt`, `masterAt`, `kept`, a Plan's `fromAt`) never moved. The orchestrator's decision: one new moment on
   the account row, `liveAt` — "this sign-in last came back into force then" — stamped by the one row writer, re-dated by
   an Undo or Redo that brings the row into force, held by the gate; `adminAt` is never moved (the bell's retirement,
   notices.ts rightHolds, reads it — an Undo of a take-away still brings the old lines back). Copied from Astra's proof 2
   and the fresh Opus read's proof 2 (2a, 2b, 2c), with 2d, a master-mark twin of 2c, two controls and a forged moment.
   NOTICES are read raw (every line written), never through a bell's own switches.
   RETIRED BY ROUND 4, PART 2 (his D2908, 28 Nov 26 — msq-s2-u2fix4-moveday.test.ts): `liveAt` is gone, so every
   assertion of it and "the gate holds the moment" went with the deleted code. What stays is each test's audience
   check: in every one the move was TOLD on the 16th, and a move told once owes no later reader a line — still true,
   now for that reason alone. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountsLoad, adminLineAudience, setMaster, signIn, sessionFor } from './accounts'
import { unitsLoad, todayIso } from './units'
import { NOTICES, type Notice } from './notices'
import { archivePerson, restoreArchivedPerson } from '../leavewar/sync'
import { globalUndo, globalRedo } from '../undo/timeline'
import { setSession, setMe, SESSION } from './auth'

withThird()
beforeEach(() => { NOTICES.length = 0 })
const reload = (): void => { unitsLoad(); accountsLoad() }
const isHuntersMove = (n: Notice): boolean => {
  const p: any = n.what?.[0]
  return p?.k === 'sqplan' && p.who === PID.hunter && p.c === 'moved' && n.u === 'u149' && n.day === '2026-07-16'
}
const movesTo = (pid: string): Notice[] => NOTICES.filter(n => isHuntersMove(n) && String(n.to) === pid)
const audience = (): string[] => NOTICES.filter(isHuntersMove).map(n => String(n.to)).sort()
function moveHunterAndWake(): void {
  signInAs('saber')
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
  pastMidnight()
}
/* the move saved by Saber on another device — the signed-in session, and its Undo list, kept (Opus's proof 2c) */
function moveHunterElsewhere(back: string): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
  setSession(s); setMe(back); reload()
}

describe('Astra 2 — Enable after a move does not add a suspended admin to its earlier audience', () => {
  it('Osprey made an admin and switched off on the 15th, enabled on the 17th: no line of the 16th', () => {
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBeNull()
    const appointedAt = accountById(ACCT.osprey)!.adminAt
    expect(appointedAt).toBe(Date.now())
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()

    moveHunterAndWake()
    expect(todayIso()).toBe('2026-07-16')
    expect(accountById(ACCT.osprey)!.on).toBe(false)
    expect(adminLineAudience('u149')).not.toContain(PID.osprey)
    expect(audience()).toEqual([PID.kestrel, PID.saber].sort())

    on(17, 9)
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    expect(accountById(ACCT.osprey)!.adminAt, 'adminAt is never moved').toBe(appointedAt)

    pastMidnight()
    expect(movesTo(PID.osprey), 'Osprey was switched off on the move day').toEqual([])
    expect(audience()).toEqual([PID.kestrel, PID.saber].sort())
  })
})

describe('Opus F1 — a move line reaches a man not an admin in force on the move day', () => {
  it('2a: Osprey, 149\'s admin, switched off before the 16th, switched on again by Kestrel on the 17th: no line of the 16th', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel switches Osprey off').toBeNull()
    reload()
    moveHunterAndWake()
    expect(audience(), 'the move day\'s audience').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: true }), 'Kestrel switches Osprey on again').toBeNull()
    reload()
    pastMidnight()
    expect(movesTo(PID.osprey), 'Osprey was switched off on the move day').toEqual([])
  })
  it('2b: Osprey, 149\'s admin, archived on the 15th, restored by Kestrel on the 17th: no line of the 16th (Restore stamps through the one row writer)', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    reload()
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeNull()
    reload()
    moveHunterAndWake()
    expect(audience(), 'the move day\'s audience').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    signInAs('kestrel')
    expect(restoreArchivedPerson(PID.osprey, todayIso()), 'Kestrel restores Osprey').toBe(true)
    reload()
    pastMidnight()
    expect(movesTo(PID.osprey), 'Osprey was archived on the move day').toEqual([])
  })
  it('2c: Osprey made an admin then a member by Kestrel on the 15th; Kestrel undoes "made a member" on the 17th: no line of the 16th', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    reload()
    expect(saveAccess(ACCT.osprey, { role: 'main' })).toBeNull()
    reload()
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(audience(), 'the move day\'s audience').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, role: accountById(ACCT.osprey)?.role }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, role: 'admin' })
    pastMidnight()
    expect(movesTo(PID.osprey), 'Osprey was a member on the move day').toEqual([])
  })
  it('2d: Kestrel makes Osprey an admin on the 15th and undoes it; redoes it on the 17th: no line of the 16th', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, role: accountById(ACCT.osprey)?.role }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, role: 'main' })
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(audience(), 'the move day\'s audience').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, role: accountById(ACCT.osprey)?.role }, `the Redo answered ${r.reason ?? 'ok'}`).toEqual({ ok: true, role: 'admin' })
    pastMidnight()
    expect(movesTo(PID.osprey), 'Osprey was a member on the move day').toEqual([])
  })
  it('the master-mark twin of 2c: Mako (150\'s admin) made a master admin and the mark taken on the 15th; its Undo on the 17th: no line of the 16th', () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
    expect(setMaster(ACCT.mako, true), 'setup: Saber makes Mako a master admin').toMatchObject({ ok: true })
    reload()
    expect(setMaster(ACCT.mako, false), 'setup: Saber takes the mark off again').toMatchObject({ ok: true })
    reload()
    pastMidnight()
    expect(audience(), 'the move day\'s audience: Mako no admin of 149 that day').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, master: accountById(ACCT.mako)?.master === true }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, master: true })
    pastMidnight()
    expect(movesTo(PID.mako), 'Mako held no right in 149 on the move day').toEqual([])
  })
})

describe('the controls — a man in force on the move day keeps his one line', () => {
  it('an admin of 149 in force on the 16th, switched off and on again on the 18th: his one line, no second', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    reload()
    moveHunterAndWake()
    expect(audience(), 'the move day\'s audience: Osprey 149\'s admin that day').toEqual([PID.kestrel, PID.osprey, PID.saber].sort())
    on(18, 9)
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    reload()
    pastMidnight()
    expect(movesTo(PID.osprey), 'his one line stays, none added').toHaveLength(1)
  })
  it('a Suspend undone the same day before the move day still leaves him told on the 16th', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, on: accountById(ACCT.osprey)?.on }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, on: true })
    moveHunterAndWake()
    expect(movesTo(PID.osprey), 'in force before the move day began').toHaveLength(1)
  })
})
