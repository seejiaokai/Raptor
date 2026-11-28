// @vitest-environment jsdom
/* U2 FIX ROUND 3, FIX 5 (Opus 2, Astra 2, Fable 1, the security reader's S3 — the brief
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-brief.md; the orchestrator's decision): A MOVE'S BELL LINES ARE TOLD
   ONCE. "Plan of 149 ended: he moved to 150" went to whoever the records made a reader of the move day, worked out afresh
   at every wake — and after round 1's fix 8 and round 2's `liveAt` four more roads still brought a man in after the day
   with an old moment (a Plan put back by Undo or Redo, a re-link undone or redone, a moved man re-made an admin by a
   Redo, a Plan put back and its holder then made a master admin). The audience is no longer rebuilt: once a move has
   been told — a stored squadron line of it, or the mover's own line of that Plan ending (acctlines.ts moveTold) — no
   further reader is owed its line; the writer (planMovesOwed) owes nothing and the gate (perms.ts planLineViolation,
   `account.told`) refuses one. The moments stay as the audience of the FIRST telling, and perms.ts restoreIntoForce
   gains the two cases the readers proved it missed.
   The readers' own proofs, each copied whole into a file of its own: msq-s2-u2fix3-moveday-opus2, -astra2, -fable1,
   -security1, -security4. Here: what the brief adds — a forged second telling refused at the gate, the first telling on
   a late first wake, two wakes in a row, a move day with no reader — and the two new cases of restoreIntoForce.
   NOTICES are read raw (every line written), never through a bell's own switches. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { saveAccess, updateAccount, setMaster, accountById, accountsLoad, adminLineAudience, levelIn, linkablePeople, signIn, sessionFor } from './accounts'
import { unitsLoad, todayIso, homeOn } from './units'
import { NOTICES, type Notice } from './notices'
import { globalUndo, globalRedo } from '../undo/timeline'
import { setSession, setMe, SESSION } from './auth'
import { enterSquadron } from './store'
import { commitProjection } from '../command'
import { commitSettingsIntent } from './people-settings-commit'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { moveTold, planMovesOwed, planMovedLineId, movedLineId } from './acctlines'
import { restoreIntoForce } from './perms'

withThird()
beforeEach(() => { NOTICES.length = 0 })
const reload = (): void => { unitsLoad(); accountsLoad() }
const DAY = '2026-07-16'
const isHuntersMove = (n: Notice): boolean => {
  const p: any = n.what?.[0]
  return p?.k === 'sqplan' && p.who === PID.hunter && p.c === 'moved' && n.u === 'u149' && n.day === DAY
}
const movesTo = (pid: string): Notice[] => NOTICES.filter(n => isHuntersMove(n) && String(n.to) === pid)
const audience = (): string[] => NOTICES.filter(isHuntersMove).map(n => String(n.to)).sort()
const ownLine = (): string => movedLineId(ACCT.hunter, DAY, { k: 'acct', c: 'planEnd', u: 'u149' })
const bell = (): string => JSON.stringify(NOTICES)
/* the move saved by Saber on another device — the signed-in session, and its Undo list, kept */
function moveHunterElsewhere(back: string): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
  setSession(s); setMe(back); reload()
}
/* the move's line to one reader, as the app's own writer builds it (acctlines.ts writeMoveLines → notices.ts noticePlanLine) */
const movedLine = (to: string): Notice => ({
  id: planMovedLineId(ACCT.hunter, DAY, 'u149', to), to, by: null, at: Date.now(), iid: '',
  name: String((PEOPLE as any)[PID.hunter]?.cs ?? PID.hunter), day: DAY, what: [{ k: 'sqplan', who: PID.hunter, c: 'moved', num: '149', mv: '150' } as any], u: 'u149',
}) as Notice
/* Fable 1a's world, to the point where Mako — no reader of 149 on the 16th — holds Plan of 149 again with its old moment */
function makoPlanBackOnThe17th(): void {
  signInAs('kestrel')
  expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
  reload()
  expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } }), 'setup: Kestrel ends Mako\'s Plan of 149').toBeNull()
  reload()
  moveHunterElsewhere(PID.kestrel)
  pastMidnight()
  expect(audience(), 'the move day\'s audience: Mako no reader of 149 that day').toEqual([PID.kestrel, PID.saber].sort())
  on(17, 9)
  const u = globalUndo()
  reload()
  expect({ ok: u.ok, level: levelIn(ACCT.mako, 'u149', todayIso()) }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, level: 'admin' })
  expect(adminLineAudience('u149'), 'premise: Mako reads 149\'s admin lines again from the 17th').toContain(PID.mako)
}

describe('U2 fix 3, fix 5 — the first telling, then nothing', () => {
  it('the first wake tells the squadron\'s readers and the mover in ONE command, and the move is then told', () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES), 'before its day: not told').toBe(false)
    pastMidnight()
    expect(audience(), 'both readers written by the one command — the gate lets the lines it writes together').toEqual([PID.kestrel, PID.saber].sort())
    expect(NOTICES.some(n => n.id === ownLine()), 'the mover\'s own line of that Plan ending, the same command').toBe(true)
    expect(new Set(NOTICES.filter(n => isHuntersMove(n) || n.id === ownLine()).map(n => n.at)).size, 'one moment: one command').toBe(1)
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES)).toBe(true)
    expect(moveTold(ACCT.hunter, DAY, third.u150, NOTICES), 'another squadron\'s line is another move\'s telling').toBe(false)
    expect(moveTold(ACCT.hunter, '2026-07-17', 'u149', NOTICES), 'another day is another move').toBe(false)
  })
  it('two wakes in a row write nothing twice', () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    pastMidnight()
    const told = bell()
    expect(audience()).toEqual([PID.kestrel, PID.saber].sort())
    pastMidnight()
    expect(bell(), 'the wake of the 17th').toBe(told)
    pastMidnight()
    expect(bell(), 'the wake of the 18th').toBe(told)
    expect(planMovesOwed().filter(o => o.part.who === PID.hunter), 'and the writer owes nobody').toEqual([])
  })
  it('a LATE first wake — nobody opened the app on the move day: a man made an admin since gets none, the readers of the day do', () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    /* Fri 17, the app untouched since the 15th: Saber's first press makes Osprey an admin of 149, and the pass that
       follows that command is the move's FIRST telling */
    on(17, 9)
    expect(NOTICES.filter(isHuntersMove), 'premise: nothing told on the move day').toEqual([])
    expect(updateAccount(ACCT.osprey, { role: 'admin' }), 'Saber makes Osprey an admin of 149').toBeNull()
    reload()
    expect(adminLineAudience('u149'), 'premise: Osprey reads 149\'s admin lines today').toContain(PID.osprey)
    pastMidnight()
    expect(audience(), 'the first telling: the readers of the 16th by the records').toEqual([PID.kestrel, PID.saber].sort())
    expect(movesTo(PID.osprey), 'Osprey was a member on the move day').toEqual([])
  })
})

describe('U2 fix 3, fix 5 — a second telling is refused at the gate', () => {
  it('the writer owes Mako nothing, and a line forged for him through the app\'s own door is refused', () => {
    makoPlanBackOnThe17th()
    expect(planMovesOwed().filter(o => o.part.who === PID.hunter), 'the writer: told already').toEqual([])
    /* the app's own door, Kestrel signed in: the very line the old writer wrote Mako at the next wake */
    const r: any = commitProjection({ type: 'account.told', scope: { module: 'inputs' }, apply: (txn: any) => {
      HOOKS.bellEnlist(txn)
      NOTICES.push(movedLine(PID.mako))
      HOOKS.bellEnd()
    } } as any)
    expect({ ok: r.ok, why: String(r.message ?? '') }).toEqual({ ok: false, why: expect.stringMatching(/a squadron's Plan line only the app writes for a move/) })
    expect(movesTo(PID.mako), 'nothing on Mako\'s bell').toEqual([])
    expect(audience(), 'the first telling stands').toEqual([PID.kestrel, PID.saber].sort())
  })
  it('…and by a signed-in admin\'s own command: refused', () => {
    makoPlanBackOnThe17th()
    const r: any = commitSettingsIntent('account.told', null, (txn: any) => { HOOKS.bellEnlist(txn); NOTICES.push(movedLine(PID.mako)); HOOKS.bellEnd() })
    expect(r.ok).toBe(false)
    expect(movesTo(PID.mako)).toEqual([])
  })
  it('the next wake writes Mako nothing — and a later master mark on him still nothing (the `kept` road)', () => {
    makoPlanBackOnThe17th()
    pastMidnight()
    expect(movesTo(PID.mako), 'the Plan road').toEqual([])
    /* Sat 18: Saber, elsewhere, makes Mako a master admin — his Plan of 149 is kept with its old moment */
    const s = SESSION
    setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
    expect(setMaster(ACCT.mako, true), 'setup: Saber makes Mako a master admin').toMatchObject({ ok: true })
    setSession(s); setMe(PID.kestrel); reload()
    expect(accountById(ACCT.mako)!.master, 'premise: Mako is a master admin').toBe(true)
    pastMidnight()
    expect(movesTo(PID.mako), 'the master mark\'s road').toEqual([])
    expect(audience()).toEqual([PID.kestrel, PID.saber].sort())
  })
})

/* A MOVE DAY ON WHICH THE SQUADRON HAD NO READER AT ALL. No door of the app is known to leave a squadron so — a master
   admin who can sign in reads every squadron's admin lines, and the last-admin lock keeps a squadron an admin who can —
   so the shape is made here on the bell itself: the first telling's two squadron lines taken out, as if none had been
   owed (a builder's stand-in, said in the round's report). What then marks the move told is the mover's
   OWN line of that Plan ending — written by the same command, from the same part. With neither, nothing is stored of the
   move and the moments decide again: the first telling. */
describe('U2 fix 3, fix 5 — what marks a move told', () => {
  function told(): void {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    pastMidnight()
    expect(audience()).toEqual([PID.kestrel, PID.saber].sort())
  }
  const drop = (keep: (n: Notice) => boolean): void => { for (let i = NOTICES.length - 1; i >= 0; i--) if (!keep(NOTICES[i]!)) NOTICES.splice(i, 1) }
  it('no squadron line stored (no reader that day): the mover\'s own line marks it told — a reader by the records is owed nothing', () => {
    told()
    drop(n => !isHuntersMove(n))
    expect(NOTICES.some(n => n.id === ownLine()), 'premise: the mover\'s own line stands').toBe(true)
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES)).toBe(true)
    expect(planMovesOwed().filter(o => o.part.who === PID.hunter && o.u === 'u149')).toEqual([])
  })
  it('the squadron\'s lines alone mark it told (the mover\'s own line gone)', () => {
    told()
    drop(n => n.id !== ownLine())
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES)).toBe(true)
    expect(planMovesOwed().filter(o => o.part.who === PID.hunter && o.u === 'u149')).toEqual([])
  })
  it('one reader\'s line alone marks it told for every reader', () => {
    told()
    drop(n => n.id !== ownLine() && !(isHuntersMove(n) && String(n.to) === PID.saber))
    expect(movesTo(PID.saber)).toEqual([])
    expect(planMovesOwed().filter(o => o.part.who === PID.hunter && o.u === 'u149'), 'Saber, a reader of the day, is not told later').toEqual([])
  })
  it('nothing stored of the move: the moments decide again — the first telling', () => {
    told()
    drop(n => n.id !== ownLine() && !isHuntersMove(n))
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES)).toBe(false)
    expect(planMovesOwed().filter(o => o.part.who === PID.hunter && o.u === 'u149').map(o => o.to).sort()).toEqual([PID.kestrel, PID.saber].sort())
  })
})

describe('U2 fix 3, fix 5 — restoreIntoForce: the two cases it missed (the backstop of the first telling)', () => {
  it('the rule itself: a row put back naming another man, or an admin\'s where the role was given elsewhere, comes into force', () => {
    const row = { id: 'x', pid: 'a', role: 'admin', on: true }
    expect(restoreIntoForce(row, { ...row }), 'the same row: no').toBe(false)
    expect(restoreIntoForce(row, { ...row, pid: 'b' }), 'another man').toBe(true)
    expect(restoreIntoForce(row, { ...row, adminOf: 'u149', adminFrom: '2026-07-16' }), 'an admin of another squadron').toBe(true)
    expect(restoreIntoForce({ ...row, adminOf: 'u149', adminFrom: '2026-07-10' }, { ...row, adminOf: 'u149', adminFrom: '2026-07-16' }), 'the same squadron, given anew').toBe(true)
    expect(restoreIntoForce({ ...row, role: 'main', adminOf: 'u1' }, { ...row, role: 'main' }), 'not an admin\'s row: the record of where means nothing').toBe(false)
  })
  it('a re-link undone: the sign-in back on Osprey is dated now, and the gate lets the restore write it', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    reload()
    const z = linkablePeople(undefined, 'u149').find(p => p !== PID.osprey && p !== PID.kestrel)
    expect(z, 'setup: a 149 man with no sign-in').toBeTruthy()
    expect(updateAccount(ACCT.osprey, { pid: z! }), 'setup: Kestrel links the sign-in to him').toBeNull()
    reload()
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, pid: accountById(ACCT.osprey)?.pid, liveAt: accountById(ACCT.osprey)?.liveAt }, `the Undo answered ${u.reason ?? 'ok'}`)
      .toEqual({ ok: true, pid: PID.osprey, liveAt: Date.now() })
    /* …and its Redo, on the 18th: the sign-in on the other man, dated then */
    on(18, 9)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, pid: accountById(ACCT.osprey)?.pid, liveAt: accountById(ACCT.osprey)?.liveAt }, `the Redo answered ${r.reason ?? 'ok'}`)
      .toEqual({ ok: true, pid: z, liveAt: Date.now() })
  })
  it('a moved man re-made an admin by Redo: his sign-in is dated now', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Saber makes Ranger a 142 admin').toBeNull()
    reload()
    expect(moveMan(PID.ranger, 'u149'), 'setup: Saber moves Ranger to 149 from the 16th').toMatchObject({ ok: true })
    on(16, 9); reload()
    expect({ home: homeOn(PID.ranger, todayIso()), level: levelIn(ACCT.ranger, 'u149', todayIso()) }).toEqual({ home: 'u149', level: 'member' })
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Kestrel makes Ranger an admin of 149').toBeNull()
    reload()
    expect(globalUndo().ok, 'setup: Kestrel undoes it').toBe(true)
    reload()
    expect(levelIn(ACCT.ranger, 'u149', todayIso())).toBe('member')
    on(18, 9)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, level: levelIn(ACCT.ranger, 'u149', todayIso()), liveAt: accountById(ACCT.ranger)?.liveAt }, `the Redo answered ${r.reason ?? 'ok'}`)
      .toEqual({ ok: true, level: 'admin', liveAt: Date.now() })
  })
})
