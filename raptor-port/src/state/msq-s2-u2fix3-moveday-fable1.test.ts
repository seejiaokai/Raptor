// @vitest-environment jsdom
/* FABLE PROOF 1 (the re-read of U2 fix round 2, fix 3): a move's bell line ("Plan of 149 ended: he moved to 150") must
   reach only a reader in force without a break since before the move day began. `liveAt` sits on the ACCOUNT row and is
   stamped only where the account row itself comes back into force (on again, role back to admin, mark back, a new row).
   Two roads into the audience write no such moment:
   (a) a PLAN of the squadron put back by an Undo or a Redo — the grant row comes back whole, its old `fromAt` with it
       (the gate lets a verified replay keep it), and no account row is written at all;
   (b) an admin's sign-in put back on its old man by the Undo of a re-link — the account row is written, but
       restoreIntoForce (perms.ts) does not count "now names another man" as coming into force, and the image's old
       `adminAt` rides back.
   Hunter (142's admin, Plan of 149) moves to 150 on Thu 16 Jul; the 16th's wake tells 149's readers of that day. A man
   who was no reader of 149 on the 16th and is made one again on the 17th by an Undo or Redo must get no line of the 16th. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountOfPid, accountsLoad, adminLineAudience, levelIn, signIn, sessionFor } from './accounts'
import { unitsLoad, todayIso, homeOn } from './units'
import { NOTICES, type Notice } from './notices'
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
/* the move saved by Saber on another device — the signed-in session, and its Undo list, kept (as msq-s2-u2fix2-moveday) */
function moveHunterElsewhere(back: string): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
  setSession(s); setMe(back); reload()
}

describe('fable 1a — a Plan of 149 ended before the move day and put back by Undo after it', () => {
  it('Kestrel gives Mako Plan of 149 and ends it on the 15th; undoes the ending on the 17th: Mako gets no line of the 16th', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    reload()
    expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } }), 'setup: Kestrel ends Mako\'s Plan of 149').toBeNull()
    reload()
    expect(levelIn(ACCT.mako, 'u149', todayIso()), 'premise: Mako holds nothing of 149').toBeNull()
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(todayIso()).toBe('2026-07-16')
    expect(audience(), 'the move day\'s audience: Mako no reader of 149 that day').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, level: levelIn(ACCT.mako, 'u149', todayIso()) }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, level: 'admin' })
    expect(adminLineAudience('u149'), 'premise: Mako reads 149\'s admin lines again from the 17th').toContain(PID.mako)
    pastMidnight()
    expect(movesTo(PID.mako), 'Mako held no Plan of 149 on the move day').toEqual([])
  })
})

describe('fable 1b — a Plan of 149 given, undone before the move day, redone after it', () => {
  it('Kestrel gives Mako Plan of 149 and undoes it on the 15th; redoes it on the 17th: Mako gets no line of the 16th', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, level: levelIn(ACCT.mako, 'u149', todayIso()) }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, level: null })
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(audience(), 'the move day\'s audience: Mako no reader of 149 that day').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, level: levelIn(ACCT.mako, 'u149', todayIso()) }, `setup: the Redo answered ${r.reason ?? 'ok'}`).toEqual({ ok: true, level: 'admin' })
    pastMidnight()
    expect(movesTo(PID.mako), 'Mako held no Plan of 149 on the move day').toEqual([])
  })
})

describe('fable 1c — an admin\'s sign-in re-linked away before the move day, the re-link undone after it', () => {
  it('Osprey, 149\'s admin, loses his sign-in to another 149 man on the 15th; Kestrel undoes the re-link on the 17th: Osprey gets no line of the 16th', () => {
    const other = 'fal9'   // a 149 man of the demo with no sign-in
    signInAs('kestrel')
    expect(homeOn(other, todayIso()), 'premise: the other man is 149\'s').toBe('u149')
    expect(accountOfPid(other), 'premise: he has no sign-in').toBeUndefined()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    reload()
    expect(updateAccount(ACCT.osprey, { pid: other }), 'setup: Kestrel links Osprey\'s sign-in to the other man').toBeNull()
    reload()
    expect(accountOfPid(PID.osprey), 'premise: Osprey has no sign-in').toBeUndefined()
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(audience(), 'the move day\'s audience: the other man, not Osprey').toEqual([PID.kestrel, other, PID.saber].sort())
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, pid: accountById(ACCT.osprey)?.pid }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, pid: PID.osprey })
    expect(adminLineAudience('u149'), 'premise: Osprey is 149\'s admin again from the 17th').toContain(PID.osprey)
    pastMidnight()
    expect(movesTo(PID.osprey), 'Osprey had no sign-in on the move day').toEqual([])
  })
})

describe('fable 1d — an admin\'s sign-in re-linked, the re-link undone before the move day and redone after it', () => {
  it('Kestrel links Osprey\'s admin sign-in to another 149 man and undoes it on the 15th; redoes it on the 17th: that man gets no line of the 16th', () => {
    const other = 'fal9'
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    reload()
    expect(updateAccount(ACCT.osprey, { pid: other }), 'setup: Kestrel links Osprey\'s sign-in to the other man').toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, pid: accountById(ACCT.osprey)?.pid }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, pid: PID.osprey })
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(audience(), 'the move day\'s audience: Osprey, not the other man').toEqual([PID.kestrel, PID.osprey, PID.saber].sort())
    on(17, 9)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, pid: accountById(ACCT.osprey)?.pid }, `setup: the Redo answered ${r.reason ?? 'ok'}`).toEqual({ ok: true, pid: other })
    pastMidnight()
    expect(movesTo(other), 'the other man had no sign-in on the move day').toEqual([])
  })
})
