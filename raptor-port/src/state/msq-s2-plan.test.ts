// @vitest-environment jsdom
/* (jsdom: the Undo says what it undid in the app's passing note, which needs a page — ui/toast.ts — as the other Undo
   tests of accounts do, e.g. state/msq-fix4-undo-plan-master.test.ts; nothing here is drawn) */
/* ADMIN → USERS ACROSS SQUADRONS — STEP U0, FILE 2: THE THREE WAYS A PLAN HOLDER OF 149 MAKES A 149 MAN 149'S OWN ADMIN,
   AS BUILT TODAY (the plan, docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §21.2's block "Step 0 — this part
   read against his answers", row Q8; §19.2's "Unchanged, each a pin" and V5's three "not covered — NQ1" cases; §8.4 NQ1;
   the brief docs/superpowers/briefs/2026-11-26-msq-s2-u0-brief.md).
   His D2730 Q8 (26 Nov 26): whoever may give Plan of a squadron is who may make a man its admin — a Plan holder no longer.
   Today the doors and the gate admit any admin of the man's squadron, a Plan holder among them (D2336, D2201). Each test
   below writes one way through the app's own doors, signed in as the Plan holder (Hunter — 142's admin, Plan of 149),
   and asserts what really happens today. Step U2 (U2b, once his question 9 is answered) turns each into a refusal: these
   are NOT pins of what must stay — each title starts "as built:" and its comment names what U2 changes it to.
   The world: three squadrons (withThird — his D2630; R9), Wed 15 Jul 26, 09:00. Tests only: no app file is changed. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, moveMan, on, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountOfPid, accountsLoad, levelIn } from './accounts'
import { unitsLoad, homeOn, todayIso, PLAN_MASTER_ONLY } from './units'
import { rosterOf } from '../engine/roster'
import { globalUndo } from '../undo/timeline'

withThird()

const reload = () => { unitsLoad(); accountsLoad() }
/* the level an account holds in a squadron today, read afresh */
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }

describe('as built today — changes at U2 (D2730 Q8)', () => {
  it('the premise: Hunter holds Plan of 149 and is no admin of 149 by home; Kestrel is 149\'s own admin', () => {
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(homeOn(PID.hunter, todayIso())).toBe('u142')
    expect(homeOn(PID.kestrel, todayIso())).toBe('u149')
    expect(level(ACCT.kestrel, 'u149')).toBe('admin')
  })

  /* U2 changes this to: the Role tick's Admin refused for Hunter (he may not give Plan of 149), at the door and the gate */
  it('as built: (i) the role tick — Hunter moves Ranger (a 142 member) to 149 and, from the move day, makes him an admin of 149: saved', () => {
    signInAs('hunter')
    const mv = moveMan(PID.ranger, 'u149')
    expect(mv, 'Hunter, 142\'s admin, moves a 142 man to 149').toMatchObject({ ok: true })
    on(16); reload()
    expect(homeOn(PID.ranger, todayIso()), 'the move day: Ranger is 149\'s').toBe('u149')
    expect(level(ACCT.ranger, 'u149'), 'a member of 149 before the tick').toBe('member')
    expect(level(ACCT.hunter, 'u149'), 'Hunter still holds Plan of 149 on the move day').toBe('admin')
    /* the opened row's Save with Admin picked (ui/UsersPanel.tsx accessWant → accounts.ts saveAccess) */
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'the Role tick saved').toBeNull()
    expect(level(ACCT.ranger, 'u149'), 'Ranger is now 149\'s own admin').toBe('admin')
    expect(accountById(ACCT.ranger)!.role).toBe('admin')
    /* the second half of NQ1's road — the made admin giving Plan of 149 — is NOT open today: Plan is still a master
       admin's alone to give (D2626's "by its own admins" is built at U2), so the two-step road ends here as built */
    signInAs('ranger')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } }), 'as built: Plan is a master admin\'s to end').toBe(PLAN_MASTER_ONLY)
  })

  /* U2 changes this to: refused — "This sign-in holds a right in 149. Only 149's own admins or a master admin can link it
     to another person." is the right-holder's case (Q12); a re-link that leaves a man an admin of 149 who was not one is
     refused for one who may not give Plan of 149 (Q8) */
  it('as built: (ii) a re-link — Hunter links Kestrel\'s sign-in (149\'s admin) to a 149 member with no sign-in: saved, that man now 149\'s admin', () => {
    const today = todayIso()
    const target = rosterOf('u149', today).find(pid => !accountOfPid(pid) && pid !== PID.kestrel)
    expect(target, 'setup: a 149 man with no sign-in').toBeTruthy()
    expect(homeOn(target!, today)).toBe('u149')
    signInAs('hunter')
    const bad = updateAccount(ACCT.kestrel, { pid: target! })
    expect(bad, 'the re-link saved').toBeNull()
    reload()
    expect(accountById(ACCT.kestrel)!.pid, 'Kestrel\'s sign-in now names the 149 member').toBe(target)
    expect(accountOfPid(target!)!.role).toBe('admin')
    expect(level(ACCT.kestrel, 'u149'), 'the sign-in, now his, is an admin of 149 today').toBe('admin')
    expect(accountOfPid(PID.kestrel), 'Kestrel is left with no sign-in').toBeUndefined()
  })

  /* U2 changes this to: Hunter's Undo refused (it would make a man an admin of 149 again — his question 10 holds which way) */
  it('as built: (iii) an Undo — with 149 holding a second own admin, Hunter makes a 149 admin a member, then Undo: he is 149\'s admin again', () => {
    /* setup: 149's own admin makes a second own admin (Osprey), so a make-member is not 149's last admin (D2247) — the
       world has only Kestrel; with him alone the make-member is refused (pinned in msq-s2-asis, group 3) */
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    expect(level(ACCT.osprey, 'u149')).toBe('admin')
    /* (a fresh sign-in: the Undo list is Hunter's own from here) */
    signInAs('hunter')
    expect(saveAccess(ACCT.osprey, { role: 'main' }), 'Hunter makes Osprey a member').toBeNull()
    expect(level(ACCT.osprey, 'u149')).toBe('member')
    const u = globalUndo()
    reload()
    expect(u.ok, `Hunter's Undo went through${u.ok ? '' : ` — refused: ${u.reason}`}`).toBe(true)
    expect(accountById(ACCT.osprey)!.role).toBe('admin')
    expect(level(ACCT.osprey, 'u149'), 'Osprey is 149\'s own admin again').toBe('admin')
  })
})
