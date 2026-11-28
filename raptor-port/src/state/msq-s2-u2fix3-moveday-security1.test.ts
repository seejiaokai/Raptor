// @vitest-environment jsdom
/* SECURITY READ OF U2 FIX ROUND 2 — PROOF 1 (fix 3's rule: a move's bell line reaches only a reader in force without a
   break since before the move day began). `restoreIntoForce` (perms.ts) names three ways an Undo or Redo brings a sign-in
   into force — off → on, not an admin's role → an admin's, no master mark → the mark. It misses the two others the one row
   writer itself knows (accounts.ts stampMoments' `adminBegun`): the STORED role an admin's on both sides while
   (a) where the role was given changes (`adminOf` / `adminFrom` — a moved man re-made an admin of the squadron he joined),
   (b) the sign-in names another man (a re-link undone, or redone).
   In each the restore puts back the image's older `adminAt`, writes no `liveAt`, and the next wake writes the man the old
   day's line about another man's Plan. NOTICES are read raw. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountsLoad, levelIn, linkablePeople, signIn, sessionFor } from './accounts'
import { unitsLoad, todayIso, homeOn } from './units'
import { NOTICES, type Notice } from './notices'
import { globalUndo, globalRedo } from '../undo/timeline'
import { setSession, setMe, SESSION } from './auth'
import { enterSquadron } from './store'

withThird()
beforeEach(() => { NOTICES.length = 0 })
const reload = (): void => { unitsLoad(); accountsLoad() }
const isHuntersMove = (day: string) => (n: Notice): boolean => {
  const p: any = n.what?.[0]
  return p?.k === 'sqplan' && p.who === PID.hunter && p.c === 'moved' && n.u === 'u149' && n.day === day
}
const movesTo = (pid: string, day: string): Notice[] => NOTICES.filter(n => isHuntersMove(day)(n) && String(n.to) === pid)
const audience = (day: string): string[] => NOTICES.filter(isHuntersMove(day)).map(n => String(n.to)).sort()
/* the move saved by Saber on another device — the signed-in session, and its Undo list, kept */
function moveHunterElsewhere(back: string): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from tomorrow').toMatchObject({ ok: true })
  setSession(s); setMe(back); reload()
}

describe('security 1a — a moved man re-made an admin by Redo after the move day is written the move day\'s line', () => {
  it('Ranger, 149\'s member on the 17th (Kestrel made him an admin on the 16th and undid it), made an admin again by Redo on the 18th: no line of the 17th', () => {
    /* Wed 15: Saber makes Ranger a 142 admin and moves him to 149 from the 16th — he joins as a member, his account still
       storing "admin" (K3) */
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Saber makes Ranger a 142 admin').toBeNull()
    reload()
    expect(moveMan(PID.ranger, 'u149'), 'setup: Saber moves Ranger to 149 from the 16th').toMatchObject({ ok: true })
    on(16, 9); reload()
    expect({ home: homeOn(PID.ranger, todayIso()), stored: accountById(ACCT.ranger)!.role, level: levelIn(ACCT.ranger, 'u149', todayIso()) })
      .toEqual({ home: 'u149', stored: 'admin', level: 'member' })
    /* Thu 16: Kestrel makes him an admin of 149, then undoes it — a member of 149 again */
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Kestrel makes Ranger an admin of 149').toBeNull()
    reload()
    expect(levelIn(ACCT.ranger, 'u149', todayIso())).toBe('admin')
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, level: levelIn(ACCT.ranger, 'u149', todayIso()) }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, level: 'member' })
    /* …and Hunter (Plan of 149) is moved to 150 from the 17th, saved by Saber elsewhere */
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(todayIso()).toBe('2026-07-17')
    expect(audience('2026-07-17'), 'the move day\'s audience: Ranger a member of 149 that day').toEqual([PID.kestrel, PID.saber].sort())
    /* Sat 18: Kestrel's Redo makes Ranger an admin of 149 again */
    on(18, 9)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, level: levelIn(ACCT.ranger, 'u149', todayIso()) }, `the Redo answered ${r.reason ?? 'ok'}`).toEqual({ ok: true, level: 'admin' })
    pastMidnight()
    expect(movesTo(PID.ranger, '2026-07-17'), 'Ranger was a member of 149 on the move day').toEqual([])
  })
})

describe('security 1b — a re-link undone (or redone) after the move day writes the move day\'s line to a man who had no sign-in that day', () => {
  /* Wed 15: Kestrel makes Osprey an admin of 149, then links Osprey's sign-in to another 149 man (Z), who is then 149's
     admin and Osprey has no sign-in at all */
  function relinked(): string {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    reload()
    const z = linkablePeople(undefined, 'u149').find(p => p !== PID.osprey && p !== PID.kestrel)
    expect(z, 'setup: a 149 man with no sign-in').toBeTruthy()
    expect(updateAccount(ACCT.osprey, { pid: z! }), 'setup: Kestrel links the sign-in to him').toBeNull()
    reload()
    expect(accountById(ACCT.osprey)!.pid).toBe(z)
    return z!
  }
  it('undone on the 17th: Osprey, with no sign-in on the 16th, is written no line of the 16th', () => {
    const z = relinked()
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(todayIso()).toBe('2026-07-16')
    expect(audience('2026-07-16'), 'the move day\'s audience: the sign-in was Z\'s that day').toEqual([PID.kestrel, PID.saber, z].sort())
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, pid: accountById(ACCT.osprey)?.pid }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, pid: PID.osprey })
    pastMidnight()
    expect(movesTo(PID.osprey, '2026-07-16'), 'Osprey had no sign-in on the move day').toEqual([])
  })
  it('undone on the 15th and redone on the 17th: Z, with no sign-in on the 16th, is written no line of the 16th', () => {
    const z = relinked()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, pid: accountById(ACCT.osprey)?.pid }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, pid: PID.osprey })
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(audience('2026-07-16'), 'the move day\'s audience: the sign-in was Osprey\'s that day').toEqual([PID.kestrel, PID.osprey, PID.saber].sort())
    on(17, 9)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, pid: accountById(ACCT.osprey)?.pid }, `the Redo answered ${r.reason ?? 'ok'}`).toEqual({ ok: true, pid: z })
    pastMidnight()
    expect(movesTo(z, '2026-07-16'), 'Z had no sign-in on the move day').toEqual([])
  })
})
