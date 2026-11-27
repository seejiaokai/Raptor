// @vitest-environment jsdom
/* (jsdom: the Undo says what it undid in the app's passing note, which needs a page — ui/toast.ts — as the other Undo
   tests of accounts do, e.g. state/msq-fix4-undo-plan-master.test.ts; nothing here is drawn) */
/* ADMIN → USERS ACROSS SQUADRONS — STEP U0, FILE 2: THE THREE WAYS A PLAN HOLDER OF 149 MADE A 149 MAN 149'S OWN ADMIN
   (the plan, docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §21.2's block "Step 0 — this part read against
   his answers", row Q8; §19.2's "Unchanged, each a pin" and V5's three "not covered — NQ1" cases; §8.4 NQ1; the brief
   docs/superpowers/briefs/2026-11-26-msq-s2-u0-brief.md).
   His D2730 Q8 (26 Nov 26): whoever may give Plan of a squadron is who may make a man its admin — a Plan holder no longer.
   Written at U0 as "as built:" tests of what then happened — each of the three ways saved. RE-POINTED AT U2 (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md §8 "Pins re-pointed by name"): each now asserts the refusal its
   comment named — the door's in D2806's sentence, the Undo's in D2807's.
   The world: three squadrons (withThird — his D2630; R9), Wed 15 Jul 26, 09:00. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, moveMan, on, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountOfPid, accountsLoad, levelIn, makeAdminUndoWords } from './accounts'
import { unitsLoad, homeOn, todayIso } from './units'
import { rosterOf } from '../engine/roster'
import { globalUndo } from '../undo/timeline'

withThird()

const reload = () => { unitsLoad(); accountsLoad() }
/* the level an account holds in a squadron today, read afresh */
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }
const MAKE = (n: string) => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`

describe('the three ways a Plan holder made a 149 admin — refused since U2 (D2730 Q8, D2806, D2807)', () => {
  it('the premise: Hunter holds Plan of 149 and is no admin of 149 by home; Kestrel is 149\'s own admin', () => {
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(homeOn(PID.hunter, todayIso())).toBe('u142')
    expect(homeOn(PID.kestrel, todayIso())).toBe('u149')
    expect(level(ACCT.kestrel, 'u149')).toBe('admin')
  })

  /* was "as built: saved" (U0); U2: the Role tick's Admin refused for Hunter (he may not give Plan of 149), in D2806's
     sentence, nothing saved */
  it('(i) the role tick — Hunter moves Ranger (a 142 member) to 149 and, from the move day, makes him an admin of 149: refused', () => {
    signInAs('hunter')
    const mv = moveMan(PID.ranger, 'u149')
    expect(mv, 'Hunter, 142\'s admin, moves a 142 man to 149').toMatchObject({ ok: true })
    on(16); reload()
    expect(homeOn(PID.ranger, todayIso()), 'the move day: Ranger is 149\'s').toBe('u149')
    expect(level(ACCT.ranger, 'u149'), 'a member of 149 before the tick').toBe('member')
    expect(level(ACCT.hunter, 'u149'), 'Hunter still holds Plan of 149 on the move day').toBe('admin')
    /* the opened row's Save with Admin picked (ui/UsersPanel.tsx accessWant → accounts.ts saveAccess) */
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'the Role tick refused').toBe(MAKE('149'))
    expect(level(ACCT.ranger, 'u149'), 'Ranger stays 149\'s member').toBe('member')
    expect(accountById(ACCT.ranger)!.role).toBe('main')
  })

  /* was "as built: saved" (U0); U2: a re-link that leaves a man an admin of 149 who was not one is refused for one who
     may not give Plan of 149 (Q8), in D2806's sentence (the agent's reading — the brief's B6) */
  it('(ii) a re-link — Hunter links Kestrel\'s sign-in (149\'s admin) to a 149 member with no sign-in: refused, nothing moved', () => {
    const today = todayIso()
    const target = rosterOf('u149', today).find(pid => !accountOfPid(pid) && pid !== PID.kestrel)
    expect(target, 'setup: a 149 man with no sign-in').toBeTruthy()
    expect(homeOn(target!, today)).toBe('u149')
    signInAs('hunter')
    expect(updateAccount(ACCT.kestrel, { pid: target! }), 'the re-link refused').toBe(MAKE('149'))
    reload()
    expect(accountById(ACCT.kestrel)!.pid, 'Kestrel\'s sign-in still his').toBe(PID.kestrel)
    expect(accountOfPid(target!), 'the 149 member still has no sign-in').toBeUndefined()
  })

  /* was "as built: saved" (U0); U2: Hunter's Undo refused (it would make a man an admin of 149 again), in D2807's sentence */
  it('(iii) an Undo — with 149 holding a second own admin, Hunter makes a 149 admin a member, then Undo: refused, he stays a member', () => {
    /* setup: 149's own admin makes a second own admin (Osprey), so a make-member is not 149's last admin (D2247) — the
       world has only Kestrel; with him alone the make-member is refused (pinned in msq-s2-asis, group 3) */
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    expect(level(ACCT.osprey, 'u149')).toBe('admin')
    /* (a fresh sign-in: the Undo list is Hunter's own from here) */
    signInAs('hunter')
    expect(saveAccess(ACCT.osprey, { role: 'main' }), 'Hunter makes Osprey a member (D2250 lets him)').toBeNull()
    expect(level(ACCT.osprey, 'u149')).toBe('member')
    const u = globalUndo()
    reload()
    expect(u.ok, 'Hunter\'s Undo refused').toBe(false)
    expect(String((u as any).reason).startsWith(makeAdminUndoWords('u149'))).toBe(true)
    expect(accountById(ACCT.osprey)!.role).toBe('main')
    expect(level(ACCT.osprey, 'u149'), 'Osprey stays 149\'s member').toBe('member')
  })
})
