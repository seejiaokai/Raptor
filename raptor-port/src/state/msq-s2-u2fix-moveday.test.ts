// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 8 (Astra 3 — the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md): the move line's
   audience as it stood on the move day. Hunter moves to 150 on Thu 16 Jul; Osprey is a member that day; Saber makes him
   an admin of 149 on the 17th; a later wake rescans the earlier moves and wrote Osprey that move's line, dated the 16th
   (its moment now, so the bell's own retirement check showed it). The audience now counts only an admin right that
   began before the move day did, by the records the app keeps (the role's `adminAt`, the master mark's `masterAt`, a
   Plan's `fromAt`, the dated homes and grants) — shared by the writer (acctlines.ts planMovesOwed) and the gate
   (perms.ts planLineViolation, `account.told`); the fixed ids kept. Copied from Astra's proof-3, with the original
   audience held. */
import { beforeEach, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { accountById, updateAccount } from './accounts'
import { NOTICES, noticesFor, type Notice } from './notices'

withThird()
beforeEach(() => { NOTICES.length = 0 })

function isHuntersMove(n: Notice): boolean {
  const p = n.what?.[0]
  return p?.k === 'sqplan' && p.who === PID.hunter && p.c === 'moved' && n.u === 'u149' && n.day === '2026-07-16'
}

it('an admin appointed after a move receives no line from its earlier audience', () => {
  signInAs('saber')
  expect(accountById(ACCT.osprey)?.role).toBe('main')
  expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })

  pastMidnight()

  const original = NOTICES.filter(isHuntersMove)
  expect(original.map(n => String(n.to)).sort(), 'the move day\'s audience: 149\'s admins that day').toEqual([PID.kestrel, PID.saber].sort())

  on(17, 9)
  signInAs('saber')
  expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBeNull()
  expect(accountById(ACCT.osprey)?.adminAt).toBe(Date.now())

  /* a later ordinary wake rescans earlier moves */
  pastMidnight()

  expect(noticesFor(PID.osprey).filter(isHuntersMove), 'Osprey was a member on the move day').toEqual([])
  expect(NOTICES.filter(isHuntersMove).map(n => String(n.to)).sort(), 'the original lines stand, no new one').toEqual([PID.kestrel, PID.saber].sort())
})
