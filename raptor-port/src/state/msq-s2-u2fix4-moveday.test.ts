// @vitest-environment jsdom
/* U2 FIX ROUND 4, PART 2 — A MOVE'S BELL LINES: TOLD ONCE, TO THE ADMINS OF THAT MOMENT (his D2908, 28 Nov 26; plan v3).
   "Plan of 149 ended: he moved to 150", and the mover's own lines, go ONCE — the first time the app manages to send
   them, on or after the move day and within 31 days of it — in one command a move, to that squadron's admins as they
   are at that moment (accounts.ts adminLineAudience over today), the mover left out. No past day is rebuilt: the
   moment `liveAt` and the dated audience (adminLineAudienceOn) are gone. A move is told whole or not at all (the gate,
   perms.ts moveTellingViolation, asks the writer's own body, acctlines.ts moveTellingsOwed); one move's refusal never
   holds back another's (leavewar/sync.ts movesRefused); and an account's own due moves are told before a door changes or
   removes that account (acctlines.ts tellMovesFirst), the move pass first inside the posting pass.

   The world: Hunter (142's admin, Plan of 149, View of 150) is moved to 150 by Saber (master admin) on Wed 15 Jul,
   counting from Thu 16. Kestrel is 149's admin, Osprey its member, Mako 150's admin, Ranger 142's member (View of 149
   and of 150). "Late" — the day came with the app untouched: the clock put on Fri 17 with no wake (a press does not run
   the pass; the page focused or shown on a new day does — `wake()`, the app's own posting clock). `pass()` is a second
   wake the same day (any notify at idle runs the pass). Each bell is read as its own reader sees it, signed in as him.

   Three roads of test 1 — an Undo before the late telling — are built on a day the telling was REFUSED (the fault the
   plan's §1 names), not on a quiet late day: the app tells a due move before every Undo and Redo (§5), so on a quiet day
   the Undo is told first, to the admins of that moment. Said in the build's report as a departure from §6's note. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, signOut, moveMan, pastMidnight, on, at, PID, ACCT, SIGN, third, type Who } from '../test-support/msq-world'
import { saveAccess, updateAccount, setMaster, accountById, accountsLoad, adminLineAudience, linkablePeople, signIn, sessionFor, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso, homeOn, addUnit } from './units'
import { NOTICES, noticesFor, noticeWords, type Notice } from './notices'
import { globalUndo, globalRedo } from '../undo/timeline'
import { setSession, setMe } from './auth'
import { notify as raptorNotify } from './store'
import { commitProjection, commandStream, setConflictChecker } from '../command'
import { commitSettingsIntent } from './people-settings-commit'
import { HOOKS, store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { moveTold, movesOwed, planMovesOwed, planMovedLineId, movedLineId } from './acctlines'
import { setBellSquadron } from './bellsqn'
import { deletePerson } from './person-delete'
import * as sync from '../leavewar/sync'
import { archivePerson, restoreArchivedPerson, postOut, wireLeaveWarSync } from '../leavewar/sync'
import { setCell } from '../leavewar/state/store'
import { pickSquadron } from './pick'

withThird()
beforeEach(() => { NOTICES.length = 0 })
const reload = (): void => { unitsLoad(); accountsLoad() }
const DAY = '2026-07-16'
const cs = (pid: string): string => String((PEOPLE as any)[pid]?.cs ?? pid)
const isMoveOf = (n: Notice, who: string = PID.hunter, u = 'u149', day: string = DAY): boolean => {
  const p: any = n.what?.[0]
  return p?.k === 'sqplan' && p.who === who && p.c === 'moved' && n.u === u && n.day === day
}
const movesTo = (pid: string): Notice[] => NOTICES.filter(n => isMoveOf(n) && String(n.to) === pid)
const audience = (u = 'u149', day: string = DAY): string[] => NOTICES.filter(n => isMoveOf(n, PID.hunter, u, day)).map(n => String(n.to)).sort()
const OWN_PLAN = (): string => movedLineId(ACCT.hunter, DAY, { k: 'acct', c: 'planEnd', u: 'u149' })
const OWN_MEMBER = (): string => movedLineId(ACCT.hunter, DAY, { k: 'acct', c: 'member' })
const has = (id: string): boolean => NOTICES.some(n => n.id === id)
const ofHunter = (): Notice[] => NOTICES.filter(n => isMoveOf(n) || String(n.id).startsWith(`acct:mv:${ACCT.hunter}:${DAY}:`))
const moments = (): number => new Set(ofHunter().map(n => n.at)).size
const bell = (): string => JSON.stringify(NOTICES)
const READERS = (...more: string[]): string[] => [PID.kestrel, PID.saber, ...more].sort()
/* the app's own commands that told a move, as the command stream holds them */
const toldCommands = (): number => commandStream().filter(e => e.type === 'account.told').length
/* the moves the pass gave up today (leavewar/sync.ts movesRefused — `today|account|day`) */
const refused = (): string[] => { const f = (sync as any).movesRefused; return typeof f === 'function' ? f() : ['(no refused list)'] }

/* another person at the keyboard with no notify (a sign-in's own notify runs the pass): the session and its Undo list kept */
function as(who: Who): void {
  const [name, pw] = SIGN[who]
  setSession(sessionFor(signIn(name, pw))); setMe(PID[who]); reload()
}
/* the app's own wake: the page focused on a new day (leavewar/sync.ts installPostingClock) */
const wake = (): void => { window.dispatchEvent(new Event('focus')) }
/* a second pass the same day: any notify at idle */
const pass = (): void => { raptorNotify() }
/* the day came and nobody opened the app */
const late = (day = 17): void => { on(day, 9) }
function saberMovesHunter(): void {
  signInAs('saber')
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
}
/* the move's line to one reader, and the mover's own, as the app's writer builds them */
const movedLine = (to: string): Notice => ({
  id: planMovedLineId(ACCT.hunter, DAY, 'u149', to), to, by: null, at: Date.now(), iid: '',
  name: cs(PID.hunter), day: DAY, what: [{ k: 'sqplan', who: PID.hunter, c: 'moved', num: '149', mv: '150' } as any], u: 'u149',
}) as Notice
const ownLines = (today: string = todayIso(), who: string = PID.hunter): Notice[] => movesOwed(today).filter(o => o.to === who)
  .map(o => ({ id: o.id, to: o.to, by: null, at: Date.now(), iid: '', name: cs(o.to), day: o.day, what: [o.part] }) as Notice)
const sqLines = (today: string = todayIso()): Notice[] => planMovesOwed(today).filter(o => o.part.who === PID.hunter).map(o => movedLine(o.to))
/* a telling forged through the app's own door */
function forge(lines: Notice[]): { ok: boolean; why: string } {
  const r: any = commitProjection({ type: 'account.told', scope: { module: 'inputs' }, apply: (txn: any) => {
    HOOKS.bellEnlist(txn)
    for (const n of lines) NOTICES.push(n)
    HOOKS.bellEnd()
  } } as any)
  reload()
  return { ok: r.ok === true, why: String(r.message ?? r.reason ?? '') }
}
/* the telling of one man's move made unwritable: every command writing a line of it is refused (a fault, made by hand) */
let REFUSALS = 0
function unwritable(acct: string | null): void {
  REFUSALS = 0
  setConflictChecker(acct == null ? null : changes => {
    if (!changes.some(c => c.collection === 'notices' && String(c.id).includes(`:mv:${acct}:`))) return null
    REFUSALS++
    return 'made unwritable by the test'
  })
}
/* his bell as he reads it, signed in as him: the words of the move's lines on it */
function bellOf(who: Who, u149?: boolean): string[] {
  as(who)
  if (u149 !== undefined) expect(setBellSquadron('u149', u149), `${who} switches 149 ${u149 ? 'on' : 'off'} on his bell`).toBe(true)
  return noticesFor(PID[who]).filter(n => isMoveOf(n)).map(n => noticeWords(n).what)
}
const LINE = 'Plan of 149 ended: he moved to 150'

/* ================= 6.1 — fail today, pass after ================= */
describe('1 — a late telling goes to the admins of that moment, by every road in', () => {
  const roads: Array<{ name: string; who: () => string; before?: () => void; then: () => void; reader: Who; sw?: boolean }> = [
    { name: 'made 149\'s admin', who: () => PID.osprey, reader: 'osprey',
      then: () => { as('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull() } },
    { name: 'given Plan of 149', who: () => PID.mako, reader: 'mako',
      then: () => { expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull() } },
    { name: 'made a master admin', who: () => PID.mako, reader: 'mako', sw: true,
      then: () => { expect(setMaster(ACCT.mako, true)).toMatchObject({ ok: true }) } },
    { name: 'switched on again', who: () => PID.osprey, reader: 'osprey',
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); expect(updateAccount(ACCT.osprey, { on: false })).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(updateAccount(ACCT.osprey, { on: true })).toBeNull() } },
    { name: 'restored from archive', who: () => PID.osprey, reader: 'osprey',
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); reload(); expect(archivePerson(PID.osprey).bad).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(restoreArchivedPerson(PID.osprey, todayIso())).toBe(true) } },
  ]
  for (const r of roads) {
    it(`${r.name} on the 17th, before the telling: written, one command, one moment, live on his bell`, () => {
      r.before?.()
      saberMovesHunter()
      late()
      expect(ofHunter(), 'premise: nothing told on the move day').toEqual([])
      /* (counted from before his door: a Restore's own notify at idle already runs the pass — after the restore) */
      const before = toldCommands()
      r.then()
      reload()
      expect(adminLineAudience('u149'), 'premise: he reads 149\'s admin lines today').toContain(r.who())
      wake()
      expect(audience(), 'the admins of the moment it goes out').toEqual(READERS(r.who()))
      expect({ commands: toldCommands() - before, moments: moments(), own: [has(OWN_PLAN()), has(OWN_MEMBER())] }).toEqual({ commands: 1, moments: 1, own: [true, true] })
      expect(bellOf(r.reader, r.sw), 'live on his own bell').toEqual([LINE])
    })
  }
  /* the Undo roads: the telling refused on the 17th (the fault), the Undo that day, told at the wake of the 18th */
  const undoRoads: Array<{ name: string; who: () => string; before: () => void; check: () => void; reader: Who }> = [
    { name: '"made a member" undone', who: () => PID.osprey, reader: 'osprey',
      before: () => { expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); reload(); expect(saveAccess(ACCT.osprey, { role: 'main' })).toBeNull(); reload() },
      check: () => { expect(accountById(ACCT.osprey)?.role).toBe('admin') } },
    { name: 'a Plan\'s ending undone (Mako)', who: () => PID.mako, reader: 'mako',
      before: () => { expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull(); reload(); expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } })).toBeNull(); reload() },
      check: () => {} },
  ]
  for (const r of undoRoads) {
    it(`${r.name} on a day the telling was refused: told at the next day's wake, with him`, () => {
      signInAs('kestrel')
      r.before()
      as('saber')
      expect(moveMan(PID.hunter, third.u150), 'setup: Saber, elsewhere, moves Hunter').toMatchObject({ ok: true })
      as('kestrel')
      late()
      unwritable(ACCT.hunter)
      wake()
      expect({ told: ofHunter().length, refusals: REFUSALS }, 'the 17th: the telling refused').toEqual({ told: 0, refusals: 1 })
      const u = globalUndo()
      reload()
      expect(u.ok, `the Undo answered ${u.reason ?? 'ok'}`).toBe(true)
      r.check()
      expect({ told: ofHunter().length, refusals: REFUSALS }, 'the Undo sends no second refused command').toEqual({ told: 0, refusals: 1 })
      expect(adminLineAudience('u149'), 'premise: he reads 149\'s admin lines again').toContain(r.who())
      unwritable(null)
      pastMidnight()
      expect(audience(), 'the first telling that succeeds: the admins of that moment').toEqual(READERS(r.who()))
      expect(moments()).toBe(1)
      expect(bellOf(r.reader), 'live on his own bell').toEqual([LINE])
    })
  }
  it('a re-link undone on a day the telling was refused: the man back on the sign-in is told, the other is not', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    reload()
    const z = linkablePeople(undefined, 'u149').find(p => p !== PID.osprey && p !== PID.kestrel)
    expect(z, 'setup: a 149 man with no sign-in').toBeTruthy()
    expect(updateAccount(ACCT.osprey, { pid: z! }), 'setup: Kestrel links the sign-in to him').toBeNull()
    reload()
    as('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    as('kestrel')
    late()
    unwritable(ACCT.hunter)
    wake()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, pid: accountById(ACCT.osprey)?.pid }, `the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, pid: PID.osprey })
    unwritable(null)
    pastMidnight()
    expect(audience()).toEqual(READERS(PID.osprey))
    expect(movesTo(z!), 'the man the sign-in named on the move day').toEqual([])
  })
})

describe('2 — the gate: a move is told whole or not at all', () => {
  const cases: Array<[string, () => Notice[]]> = [
    ['one squadron reader of two', () => [movedLine(PID.kestrel)]],
    ['the mover\'s lines only', () => ownLines()],
    ['every reader without the mover\'s lines', () => sqLines()],
    ['the readers and one of the mover\'s two lines', () => [...sqLines(), ownLines()[0]!]],
  ]
  for (const [name, lines] of cases) {
    it(`${name}: refused, the bell as before, the next wake tells all`, () => {
      saberMovesHunter()
      late()
      expect({ own: ownLines().length, sq: sqLines().map(n => n.to).sort() }, 'premise: what the move owes').toEqual({ own: 2, sq: READERS() })
      const was = bell()
      const r = forge(lines())
      expect({ ok: r.ok, bell: bell() === was }, `the gate answered: ${r.why || 'ok'}`).toEqual({ ok: false, bell: true })
      wake()
      expect({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())], moments: moments() }).toEqual({ audience: READERS(), own: [true, true], moments: 1 })
    })
  }
  it('the whole telling through the same door is accepted (the control of the four above)', () => {
    saberMovesHunter()
    late()
    expect(forge([...ownLines(), ...sqLines()]).ok).toBe(true)
    expect(audience()).toEqual(READERS())
  })
})

describe('3 — a move already told whose own line is missing; another man\'s first telling on the same wake', () => {
  it('Hunter\'s missing line goes alone, Ranger\'s move is told by a command of its own', () => {
    saberMovesHunter()
    pastMidnight()
    expect(audience()).toEqual(READERS())
    expect(moveMan(PID.ranger, 'u149'), 'setup: Saber moves Ranger (View of 150) to 149 from the 17th').toMatchObject({ ok: true })
    const i = NOTICES.findIndex(n => n.id === OWN_MEMBER())
    expect(i, 'premise: Hunter\'s "Made a member" line stood').toBeGreaterThanOrEqual(0)
    NOTICES.splice(i, 1)
    const before = toldCommands()
    pastMidnight()
    const rangers = NOTICES.filter(n => String(n.id).startsWith(`acct:mv:${ACCT.ranger}:2026-07-17:`))
    expect({ hunterBack: has(OWN_MEMBER()), ranger: rangers.map(n => noticeWords(n).what), commands: toldCommands() - before, refused: refused(), audience: audience() })
      .toEqual({ hunterBack: true, ranger: ['View of 150 ended: you moved to 149'], commands: 2, refused: [], audience: READERS() })
  })
})

describe('4 — one move unwritable, another owed', () => {
  it('the other is told on the same wake; the refused one is not re-sent that day, and is tried again the next', () => {
    saberMovesHunter()
    expect(moveMan(PID.ranger, 'u149'), 'setup: Saber moves Ranger (View of 150) to 149 from the 16th').toMatchObject({ ok: true })
    unwritable(ACCT.hunter)
    pastMidnight()
    const rangers = (): string[] => NOTICES.filter(n => String(n.id).startsWith(`acct:mv:${ACCT.ranger}:${DAY}:`)).map(n => noticeWords(n).what)
    expect({ ranger: rangers(), hunter: ofHunter().length, refusals: REFUSALS, refused: refused() }, 'the wake of the 16th')
      .toEqual({ ranger: ['View of 150 ended: you moved to 149'], hunter: 0, refusals: 1, refused: [`${DAY}|${ACCT.hunter}|${DAY}`] })
    pass(); pass()
    expect({ hunter: ofHunter().length, refusals: REFUSALS }, 'two more passes the same day: no second refused command').toEqual({ hunter: 0, refusals: 1 })
    unwritable(null)
    pass()
    expect(ofHunter().length, 'still held for the day once the fault is gone').toBe(0)
    pastMidnight()
    expect({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())], refused: refused() }, 'the wake of the 17th tries again').toEqual({ audience: READERS(), own: [true, true], refused: [] })
  })
})

describe('5 — one whole move and one partial in one forged command', () => {
  it('refused whole; the next wake tells both', () => {
    saberMovesHunter()
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    late()
    const rangers = ownLines(todayIso(), PID.ranger)
    expect(rangers.length, 'premise: Ranger\'s move owes him one line').toBe(1)
    const was = bell()
    const r = forge([...rangers, movedLine(PID.kestrel)])
    expect({ ok: r.ok, bell: bell() === was }, `the gate answered: ${r.why || 'ok'}`).toEqual({ ok: false, bell: true })
    wake()
    expect({ audience: audience(), ranger: has(rangers[0]!.id), own: [has(OWN_PLAN()), has(OWN_MEMBER())] }).toEqual({ audience: READERS(), ranger: true, own: [true, true] })
  })
})

describe('6 — an account\'s own due moves are told before a door changes or removes it (no wake before the door)', () => {
  const allTold = (): unknown => ({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())] })
  const ALL = (): unknown => ({ audience: READERS(), own: [true, true] })
  it('a re-link of the mover\'s sign-in', () => {
    saberMovesHunter()
    late()
    const z = linkablePeople(ACCT.hunter).find(p => p !== PID.hunter)
    expect(z, 'setup: a man with no sign-in').toBeTruthy()
    expect(updateAccount(ACCT.hunter, { pid: z! }), 'Saber links Hunter\'s sign-in to another man').toBeNull()
    expect(allTold()).toEqual(ALL())
  })
  it('the mover made a member', () => {
    saberMovesHunter()
    late()
    expect(updateAccount(ACCT.hunter, { role: 'main' }), 'Saber makes Hunter a member').toBeNull()
    expect(allTold()).toEqual(ALL())
  })
  it('the mover made an admin of his new squadron (Admin → Users\' one Save)', () => {
    saberMovesHunter()
    late()
    expect(saveAccess(ACCT.hunter, { role: 'admin' }), 'Saber makes Hunter an admin of 150').toBeNull()
    expect(allTold()).toEqual(ALL())
    expect(noticeWords(NOTICES.find(n => n.id === OWN_MEMBER())!).what).toBe('Made a member: you moved to 150')
  })
  it('the mover deleted by hand', () => {
    saberMovesHunter()
    late()
    const before = toldCommands()
    expect(deletePerson(PID.hunter), 'Saber deletes Hunter').toBeNull()
    expect({ audience: audience(), commands: toldCommands() - before }, '149\'s admins are told first').toEqual({ audience: READERS(), commands: 1 })
  })
  it('a Post out with the outcome Delete falling due in the same wake as the untold move: 149 is told', () => {
    saberMovesHunter()
    unwritable(ACCT.hunter)
    pastMidnight()
    expect(ofHunter().length, 'premise: the 16th\'s telling refused').toBe(0)
    signInAs('mako'); reload()
    expect(homeOn(PID.hunter, todayIso()), 'premise: Hunter is 150\'s').toBe(third.u150)
    expect(postOut(PID.hunter, '2026-07-17', 'delete'), 'Mako posts Hunter out from the 17th, outcome Delete').toBe(true)
    reload()
    unwritable(null)
    pastMidnight()
    expect({ audience: audience(), deleted: !!(PEOPLE as any)[PID.hunter]?.deleted }, 'the wake of the 17th: told, then deleted').toEqual({ audience: READERS(), deleted: true })
  })
  it('an Undo pressed with a move untold: told first', () => {
    saberMovesHunter()
    expect(updateAccount(ACCT.ranger, { on: false }), 'setup: a step of Saber\'s to undo').toBeNull()
    late()
    const u = globalUndo()
    expect(u.ok, `the Undo answered ${u.reason ?? 'ok'}`).toBe(true)
    expect(allTold()).toEqual(ALL())
  })
  it('a Redo pressed with a move untold: told first', () => {
    saberMovesHunter()
    expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
    expect(globalUndo().ok, 'setup: undone on the 15th').toBe(true)
    late()
    const r = globalRedo()
    expect(r.ok, `the Redo answered ${r.reason ?? 'ok'}`).toBe(true)
    expect(allTold()).toEqual(ALL())
  })
})

describe('7 — the moment "back in force" is gone', () => {
  const key = (): string => ACCOUNT_PFX + ACCT.osprey
  it('an account switched on again carries none', () => {
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    reload()
    expect({ on: accountById(ACCT.osprey)!.on, has: 'liveAt' in (accountById(ACCT.osprey) as any), stored: 'liveAt' in (store.get(key(), null) as any) }).toEqual({ on: true, has: false, stored: false })
  })
  it('a stored row carrying one loads without it, and the next save writes it out', () => {
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    store.set(key(), { ...(store.get(key(), null) as any), liveAt: 123 })
    reload()
    expect('liveAt' in (accountById(ACCT.osprey) as any), 'the loader drops it').toBe(false)
    expect(updateAccount(ACCT.osprey, { on: true }), 'a save over the old row is not refused').toBeNull()
    reload()
    expect({ on: accountById(ACCT.osprey)!.on, stored: 'liveAt' in (store.get(key(), null) as any) }).toEqual({ on: true, stored: false })
  })
  it('an Undo image carrying one restores, loads and saves clean', () => {
    signInAs('kestrel')
    store.set(key(), { ...(store.get(key(), null) ?? accountById(ACCT.osprey)) as any, liveAt: 123 })
    reload()
    expect(updateAccount(ACCT.osprey, { on: false }), 'a step whose before-image is the old row').toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, on: accountById(ACCT.osprey)?.on, has: 'liveAt' in (accountById(ACCT.osprey) as any) }, `the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, on: true, has: false })
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    expect('liveAt' in (store.get(key(), null) as any), 'the next save writes it out').toBe(false)
  })
})

describe('8 — a reader of the day who himself moved out before a late telling', () => {
  it('is not written', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Osprey a second admin of 149').toBeNull()
    reload()
    saberMovesHunter()
    late(16)
    expect(moveMan(PID.kestrel, 'u142'), 'setup: on the 16th, with nothing told, Saber moves Kestrel to 142 from the 17th').toMatchObject({ ok: true })
    late(17)
    wake()
    expect({ audience: audience(), kestrel: movesTo(PID.kestrel).length }).toEqual({ audience: [PID.osprey, PID.saber].sort(), kestrel: 0 })
  })
})

describe('9 — the newcomer told late (Osprey), D2310', () => {
  function ospreyToldLate(): void {
    signInAs('kestrel')
    as('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    as('kestrel')
    late()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'Kestrel makes Osprey an admin of 149 on the 17th').toBeNull()
    reload()
    wake()
    expect(bellOf('osprey'), 'told late: live on his bell').toEqual([LINE])
    as('kestrel')
  }
  it('his move line leaves when his role is taken and is back when that is undone', () => {
    ospreyToldLate()
    expect(saveAccess(ACCT.osprey, { role: 'main' }), 'Kestrel makes him a member again').toBeNull()
    reload()
    expect(bellOf('osprey'), 'the role taken: the line leaves').toEqual([])
    as('kestrel')
    const u = globalUndo()
    reload()
    expect(u.ok, `the Undo answered ${u.reason ?? 'ok'}`).toBe(true)
    expect(bellOf('osprey'), 'the take-away undone: the line is back').toEqual([LINE])
  })
  it('…and is not back when the role is given afresh', () => {
    ospreyToldLate()
    expect(saveAccess(ACCT.osprey, { role: 'main' })).toBeNull()
    reload()
    on(17, 10)
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'given afresh, later').toBeNull()
    reload()
    expect(bellOf('osprey')).toEqual([])
  })
})

describe('10 — the move\'s lines taken off the bell wholesale, then a wake', () => {
  it('told again, to the admins of that later moment — a man made an admin since among them', () => {
    saberMovesHunter()
    pastMidnight()
    expect(audience()).toEqual(READERS())
    on(17, 9)
    as('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    reload()
    for (let i = NOTICES.length - 1; i >= 0; i--) if (ofHunter().includes(NOTICES[i]!)) NOTICES.splice(i, 1)
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES)).toBe(false)
    pastMidnight()
    expect({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())] }).toEqual({ audience: READERS(PID.osprey), own: [true, true] })
  })
})

describe('11 — one reader\'s fixed id already on the bell under a line that is not the move\'s', () => {
  it('the others are told, that reader is not owed, and the app\'s own command is accepted', () => {
    saberMovesHunter()
    const id = planMovedLineId(ACCT.hunter, DAY, 'u149', PID.kestrel)
    NOTICES.push({ id, to: PID.kestrel, by: PID.saber, at: Date.now(), iid: '', name: cs(PID.kestrel), day: todayIso(), what: [{ k: 'acct', c: 'off' } as any] } as Notice)
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES), 'premise: the squat does not mark the move told').toBe(false)
    pastMidnight()
    expect({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())], refused: refused(), squat: NOTICES.filter(n => n.id === id).length })
      .toEqual({ audience: [PID.saber], own: [true, true], refused: [], squat: 1 })
    pastMidnight()
    expect(audience(), 'and it is told: the next wake adds nobody').toEqual([PID.saber])
  })
})

/* ================= 6.2 — controls ================= */
describe('12 — opening the app late tells before anything can be pressed', () => {
  it('a boot, signed in', () => {
    saberMovesHunter()
    late()
    wireLeaveWarSync()
    expect({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())], moments: moments() }).toEqual({ audience: READERS(), own: [true, true], moments: 1 })
  })
  it('a boot with nobody signed in, then a sign-in: told once, and nothing marked refused', () => {
    saberMovesHunter()
    signOut()
    late()
    wireLeaveWarSync()
    signInAs('kestrel')
    expect({ audience: audience(), moments: moments(), refused: refused() }).toEqual({ audience: READERS(), moments: 1, refused: [] })
    expect(noticesFor(PID.kestrel).filter(n => isMoveOf(n)).map(n => noticeWords(n).what)).toEqual([LINE])
  })
})

describe('13 — told on the 16th, then every road of test 1 on the 17th: no new line, a forged one refused', () => {
  const roads: Array<{ name: string; who: () => string; before?: () => void; then: () => void }> = [
    { name: 'made 149\'s admin', who: () => PID.osprey, then: () => { as('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull() } },
    { name: 'given Plan of 149', who: () => PID.mako, then: () => { expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull() } },
    { name: 'made a master admin', who: () => PID.mako, then: () => { expect(setMaster(ACCT.mako, true)).toMatchObject({ ok: true }) } },
    { name: 'switched on again', who: () => PID.osprey,
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); expect(updateAccount(ACCT.osprey, { on: false })).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(updateAccount(ACCT.osprey, { on: true })).toBeNull() } },
    { name: 'restored from archive', who: () => PID.osprey,
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); reload(); expect(archivePerson(PID.osprey).bad).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(restoreArchivedPerson(PID.osprey, todayIso())).toBe(true) } },
  ]
  for (const r of roads) {
    it(r.name, () => {
      r.before?.()
      saberMovesHunter()
      pastMidnight()
      expect(audience(), 'told on the move day').toEqual(READERS())
      on(17, 9)
      r.then()
      reload()
      expect(adminLineAudience('u149')).toContain(r.who())
      const f = forge([movedLine(r.who())])
      expect(f.ok, `the gate answered: ${f.why || 'ok'}`).toBe(false)
      pastMidnight()
      expect({ audience: audience(), his: movesTo(r.who()).length }).toEqual({ audience: READERS(), his: 0 })
    })
  }
})

describe('14 — wakes in a row; three moves in one wake', () => {
  it('two and three wakes in a row: the bell unchanged', () => {
    saberMovesHunter()
    pastMidnight()
    const told = bell()
    expect(audience()).toEqual(READERS())
    pass()
    expect(bell(), 'a second pass the same day').toBe(told)
    pastMidnight()
    expect(bell(), 'the wake of the 17th').toBe(told)
    pastMidnight()
    expect(bell(), 'the wake of the 18th').toBe(told)
  })
  it('three moves in one wake: three commands, one moment each, nothing refused', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.osprey, { grants: { u142: 'view' } }), 'setup: Saber gives Osprey View of 142').toBeNull()
    reload()
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    expect(moveMan(PID.osprey, third.u150)).toMatchObject({ ok: true })
    const before = toldCommands()
    pastMidnight()
    const own = (acct: string): string[] => NOTICES.filter(n => String(n.id).startsWith(`acct:mv:${acct}:${DAY}:`)).map(n => noticeWords(n).what).sort()
    expect({ commands: toldCommands() - before, refused: refused(), hunter: audience(), moments: moments(), ranger: own(ACCT.ranger), osprey: own(ACCT.osprey) })
      .toEqual({ commands: 3, refused: [], hunter: READERS(), moments: 1, ranger: ['View of 150 ended: you moved to 149'], osprey: ['View of 142 ended: you moved to 150'] })
  })
})

describe('15 — a reader who stopped before a late telling is not written, and a forged line to him is refused', () => {
  const stops: Array<{ name: string; who: () => string; before: () => void; then: () => void }> = [
    { name: 'his role taken', who: () => PID.osprey,
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'main' })).toBeNull() } },
    { name: 'switched off', who: () => PID.osprey,
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(updateAccount(ACCT.osprey, { on: false })).toBeNull() } },
    { name: 'archived', who: () => PID.osprey,
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(archivePerson(PID.osprey).bad).toBeNull() } },
    { name: 'his Plan taken', who: () => PID.mako,
      before: () => { signInAs('kestrel'); expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull(); reload() },
      then: () => { as('kestrel'); expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } })).toBeNull() } },
    { name: 'the master mark taken', who: () => PID.mako,
      before: () => { signInAs('saber'); expect(setMaster(ACCT.mako, true)).toMatchObject({ ok: true }); reload() },
      then: () => { expect(setMaster(ACCT.mako, false)).toMatchObject({ ok: true }) } },
  ]
  for (const s of stops) {
    it(s.name, () => {
      s.before()
      saberMovesHunter()
      expect(adminLineAudience('u149'), 'premise: a reader of 149 before the move day').toContain(s.who())
      late()
      s.then()
      reload()
      as('saber')
      const f = forge([...ownLines(), ...sqLines(), movedLine(s.who())])
      expect(f.ok, `a whole telling with a line to him added — the gate answered: ${f.why || 'ok'}`).toBe(false)
      wake()
      expect({ audience: audience(), his: movesTo(s.who()).length }).toEqual({ audience: READERS(), his: 0 })
    })
  }
})

describe('16 — Kestrel suspended in the lag, the telling, the suspension undone', () => {
  it('no line: today\'s gap, as stated', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Osprey a second admin of 149').toBeNull()
    reload()
    saberMovesHunter()
    late()
    expect(updateAccount(ACCT.kestrel, { on: false }), 'Saber suspends Kestrel on the 17th').toBeNull()
    reload()
    wake()
    expect(audience()).toEqual([PID.osprey, PID.saber].sort())
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, on: accountById(ACCT.kestrel)?.on }, `the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, on: true })
    pastMidnight()
    expect(movesTo(PID.kestrel)).toEqual([])
  })
})

describe('17 — the mover made a master admin before the telling', () => {
  for (const [name, save] of [
    ['the mark\'s own door', () => expect(setMaster(ACCT.hunter, true)).toMatchObject({ ok: true })],
    ['Admin → Users\' one Save', () => expect(saveAccess(ACCT.hunter, { role: 'admin', master: true })).toBeNull()],
  ] as Array<[string, () => void]>) {
    it(`${name}: nothing lost, all told`, () => {
      saberMovesHunter()
      late()
      save()
      reload()
      expect(accountById(ACCT.hunter)?.master, 'premise: Hunter is a master admin').toBe(true)
      wake()
      expect({ audience: audience(), plan: has(OWN_PLAN()) }).toEqual({ audience: READERS(), plan: true })
    })
  }
})

describe('18 — an archived mover', () => {
  it('his own lines are written, and the app\'s command passes', () => {
    saberMovesHunter()
    expect(archivePerson(PID.hunter).bad, 'setup: Saber archives Hunter before the move day').toBeNull()
    reload()
    const owes = movesOwed(DAY).filter(o => o.to === PID.hunter).map(o => o.id).sort()
    expect(owes.length, 'premise: the move owes the archived man lines of his own').toBeGreaterThan(0)
    pastMidnight()
    const his = NOTICES.filter(n => String(n.id).startsWith(`acct:mv:${ACCT.hunter}:${DAY}:`))
    expect({ ids: his.map(n => n.id).sort(), to: [...new Set(his.map(n => n.to))], refused: refused() }).toEqual({ ids: owes, to: [PID.hunter], refused: [] })
    for (const n of his) expect(noticeWords(n).what, n.id).toMatch(/: you moved to 150$/)
  })
})

describe('19 — several squadrons, several men, several days', () => {
  it('one man holding Plan of two squadrons: one command, both squadrons told', () => {
    signInAs('saber')
    const made = addUnit('151', 'p1', ACCT.mako)
    expect(made, 'setup: Saber makes 151, Mako its first admin').toMatchObject({ ok: true })
    const u151 = String((made as any).id)
    reload()
    expect(saveAccess(ACCT.hunter, { grants: { [u151]: 'plan' } }), 'setup: Saber gives Hunter Plan of 151 too').toBeNull()
    reload()
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    const before = toldCommands()
    pastMidnight()
    expect({ commands: toldCommands() - before, u149: audience(), u151: audience(u151), moments: new Set(NOTICES.filter(n => isMoveOf(n) || isMoveOf(n, PID.hunter, u151)).map(n => n.at)).size })
      .toEqual({ commands: 1, u149: READERS(), u151: [PID.mako, PID.saber].sort(), moments: 1 })
  })
  it('two moves of one man on two days, nothing held between: the first is told, the second owes nothing', () => {
    saberMovesHunter()
    late(16)
    expect(moveMan(PID.hunter, 'u142'), 'setup: on the 16th, nothing told, Saber moves Hunter back to 142 from the 17th').toMatchObject({ ok: true })
    late(17)
    const before = toldCommands()
    wake()
    expect({ commands: toldCommands() - before, audience: audience(), second: NOTICES.filter(n => String(n.id).includes(`:mv:${ACCT.hunter}:2026-07-17:`)).length })
      .toEqual({ commands: 1, audience: READERS(), second: 0 })
  })
  it('…and with a Plan given again between: each day\'s move is told, on its own day\'s line', () => {
    saberMovesHunter()
    pastMidnight()
    expect(audience()).toEqual(READERS())
    expect(saveAccess(ACCT.hunter, { role: 'admin' }), 'setup: on the 16th Saber makes Hunter an admin of 150').toBeNull()
    reload()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } }), 'setup: …and gives him Plan of 149 again').toBeNull()
    reload()
    const r = moveMan(PID.hunter, 'u142')
    expect(r, `setup: on the 16th Saber moves Hunter to 142 from the 17th — ${JSON.stringify(r)}`).toMatchObject({ ok: true })
    pastMidnight()
    expect({ first: audience(), second: audience('u149', '2026-07-17') }).toEqual({ first: READERS(), second: READERS() })
  })
})

describe('20 — the 31 days', () => {
  it('30 days old: owed and accepted', () => {
    saberMovesHunter()
    at('2026-08-15')
    wake()
    expect({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())], refused: refused() }).toEqual({ audience: READERS(), own: [true, true], refused: [] })
  })
  it('31 days old: owed by nobody, and refused at the gate', () => {
    saberMovesHunter()
    const whole = (): Notice[] => [...ownLines(DAY), ...sqLines(DAY)]
    expect(whole().length, 'premise: on its day the move owes four lines').toBe(4)
    at('2026-08-16')
    wake()
    expect({ told: ofHunter().length, owed: movesOwed().filter(o => o.to === PID.hunter).length + planMovesOwed().filter(o => o.part.who === PID.hunter).length }).toEqual({ told: 0, owed: 0 })
    const f = forge(whole())
    expect({ ok: f.ok, told: ofHunter().length }, `the gate answered: ${f.why || 'ok'}`).toEqual({ ok: false, told: 0 })
  })
})

describe('21 — D2310 for those who were readers on the day', () => {
  it('a home admin (Kestrel): the line leaves when his role is taken, is back on the Undo, not back when given afresh', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Osprey a second admin of 149').toBeNull()
    reload()
    saberMovesHunter()
    pastMidnight()
    expect(bellOf('kestrel')).toEqual([LINE])
    signInAs('osprey')
    expect(saveAccess(ACCT.kestrel, { role: 'main' }), 'Osprey makes Kestrel a member').toBeNull()
    reload()
    expect(bellOf('kestrel'), 'the role taken').toEqual([])
    as('osprey')
    const u = globalUndo()
    reload()
    expect(u.ok, `the Undo answered ${u.reason ?? 'ok'}`).toBe(true)
    expect(bellOf('kestrel'), 'the take-away undone').toEqual([LINE])
    as('osprey')
    expect(saveAccess(ACCT.kestrel, { role: 'main' })).toBeNull()
    reload()
    on(16, 10)
    expect(saveAccess(ACCT.kestrel, { role: 'admin' }), 'given afresh, later').toBeNull()
    reload()
    expect(bellOf('kestrel'), 'given afresh').toEqual([])
  })
  it('a Plan holder (Mako): the same', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    reload()
    as('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    as('kestrel')
    pastMidnight()
    expect(audience()).toEqual(READERS(PID.mako))
    expect(bellOf('mako')).toEqual([LINE])
    as('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } }), 'Kestrel ends Mako\'s Plan').toBeNull()
    reload()
    expect(bellOf('mako'), 'the Plan taken').toEqual([])
    as('kestrel')
    const u = globalUndo()
    reload()
    expect(u.ok, `the Undo answered ${u.reason ?? 'ok'}`).toBe(true)
    expect(bellOf('mako'), 'the take-away undone').toEqual([LINE])
    as('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } })).toBeNull()
    reload()
    on(16, 10)
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'given afresh, later').toBeNull()
    reload()
    expect(bellOf('mako'), 'given afresh').toEqual([])
  })
  it('a master admin (Saber): written the line, which his bell shows only with 149 switched on', () => {
    saberMovesHunter()
    pastMidnight()
    expect(movesTo(PID.saber).length).toBe(1)
    expect(bellOf('saber'), '149 is off on a master admin\'s bell by default').toEqual([])
    expect(bellOf('saber', true), 'switched on').toEqual([LINE])
    expect(bellOf('saber', false), 'switched off again').toEqual([])
  })
})

describe('22 — only the app writes a move\'s lines', () => {
  for (const who of ['kestrel', 'ranger'] as Who[]) {
    it(`${who}, signed in, cannot write account.told`, () => {
      saberMovesHunter()
      late()
      as(who)
      const lines = [...ownLines(), ...sqLines()]
      const was = bell()
      const r: any = commitSettingsIntent('account.told', null, (txn: any) => { HOOKS.bellEnlist(txn); for (const n of lines) NOTICES.push(n); HOOKS.bellEnd() })
      reload()
      expect({ ok: r.ok === true, bell: bell() === was }).toEqual({ ok: false, bell: true })
    })
  }
})

describe('23 — a move undone, or redone across its day', () => {
  it('undone before its day: nothing owed, nothing told', () => {
    saberMovesHunter()
    expect(globalUndo().ok, 'Saber undoes the move on the 15th').toBe(true)
    reload()
    pastMidnight()
    expect({ told: ofHunter().length, owed: movesOwed().filter(o => o.to === PID.hunter).length }).toEqual({ told: 0, owed: 0 })
  })
  it('undone after its day began: refused, and the move is told', () => {
    saberMovesHunter()
    pastMidnight()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, home: homeOn(PID.hunter, todayIso()), audience: audience() }).toEqual({ ok: false, home: third.u150, audience: READERS() })
  })
  it('undone on the 15th, redone on the 16th: the Redo refused, nothing told', () => {
    saberMovesHunter()
    expect(globalUndo().ok).toBe(true)
    reload()
    pastMidnight()
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, home: homeOn(PID.hunter, todayIso()), told: ofHunter().length }).toEqual({ ok: false, home: 'u142', told: 0 })
  })
})

describe('24 — a new Plan the evening after the move is saved', () => {
  it('is refused, in the app\'s own words', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } }), 'setup: Hunter holds no Plan of 149').toBeNull()
    reload()
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBe('He moves squadron tomorrow — give this after the move')
  })
})

describe('25 — no reader at the telling', () => {
  it('the mover\'s lines mark it told; a reader made later gets none', () => {
    /* (no door leaves a squadron no reader — a master admin who can sign in always reads it — so the shape is made on
       the bell: each reader's fixed id already stood, under a line that is not the move's, so the move owes no squadron
       line: "no reader" is the owed list empty, never the audience) */
    saberMovesHunter()
    for (const to of READERS()) NOTICES.push({ id: planMovedLineId(ACCT.hunter, DAY, 'u149', to), to, by: PID.mako, at: Date.now(), iid: '', name: cs(to), day: todayIso(), what: [{ k: 'acct', c: 'off' } as any] } as Notice)
    pastMidnight()
    expect({ audience: audience(), own: [has(OWN_PLAN()), has(OWN_MEMBER())], told: moveTold(ACCT.hunter, DAY, 'u149', NOTICES), refused: refused() })
      .toEqual({ audience: [], own: [true, true], told: true, refused: [] })
    as('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'Kestrel makes Osprey an admin of 149 on the 16th').toBeNull()
    reload()
    pastMidnight()
    expect(movesTo(PID.osprey)).toEqual([])
  })
})

/* ROUND 4's READ (Astra's proof 1, the fresh Opus reader's proof 2 — U2 fix round 5, part 1): a Post out with the
   outcome Delete whose date has come runs AT ONCE, inside the admin's own Post out command — where the move pass can
   only wait until the man and his account are gone. So the posting door tells his due moves first (leavewar/sync.ts
   postOut), as the hand delete does. The window is test 6's: the day came, no wake yet, someone at the keys. */
describe('round 4 read: an immediate Delete posting', () => {
  const gone = (): boolean => !!(PEOPLE as any)[PID.hunter]?.deleted
  /* the commands of the two kinds since `from`, in the order they landed */
  const order = (from: number): string[] => commandStream().slice(from).map(e => e.type).filter(t => t === 'account.told' || t === 'lw.postout')
  /* Mako has 150's Leave War open since the 15th (it holds Hunter's stint to come); the day turns with no wake */
  function makoAtTheKeys(day = 17): void {
    saberMovesHunter()
    signInAs('mako'); reload()
    late(day); reload()
    expect(homeOn(PID.hunter, todayIso()), 'premise: Hunter is 150\'s').toBe(third.u150)
    expect({ audience: audience(), owed: planMovesOwed().filter(o => o.part.who === PID.hunter).map(o => String(o.to)).sort() }, 'premise: owed, not yet told')
      .toEqual({ audience: [], owed: READERS() })
    expect(sync.postOutProblem(PID.hunter, 'delete'), 'premise: the Post out sheet offers Mako the Delete').toBeNull()
  }
  const TOLD_THEN_GONE = (): unknown => ({ audience: READERS(), order: ['account.told', 'lw.postout'], gone: true, acct: false })
  function postsOut(from: string, say: string): unknown {
    const before = commandStream().length
    expect(postOut(PID.hunter, from, 'delete'), say).toBe(true)
    reload()
    return { audience: audience(), order: order(before), gone: gone(), acct: !!accountById(ACCT.hunter) }
  }
  it('Astra\'s proof: Mako posts Hunter out from today, outcome Delete — 149\'s admins are told first, and no later wake is needed', () => {
    makoAtTheKeys()
    const atOnce = postsOut(todayIso(), 'Mako posts Hunter out from today, outcome Delete')
    wake(); pass(); reload()
    expect({ atOnce, afterWake: audience() }).toEqual({ atOnce: TOLD_THEN_GONE(), afterWake: READERS() })
    for (const n of NOTICES.filter(x => isMoveOf(x))) expect(noticeWords(n).what).toBe(LINE)
  })
  it('the same on the move day itself (the 16th, the first press of the day)', () => {
    makoAtTheKeys(16)
    expect(postsOut(todayIso(), 'Mako posts Hunter out from today, outcome Delete')).toEqual(TOLD_THEN_GONE())
  })
  it('a date already past (the 16th, pressed on the 17th)', () => {
    makoAtTheKeys()
    expect(postsOut(DAY, 'Mako posts Hunter out from the 16th, outcome Delete')).toEqual(TOLD_THEN_GONE())
  })
  it('a posting saved for a later day, then moved to today as a Delete: told at the door\'s first press, once', () => {
    makoAtTheKeys()
    const before = commandStream().length
    expect(postOut(PID.hunter, '2026-07-20', 'sans'), 'Mako posts Hunter out from the 20th, SANS').toBe(true)
    reload()
    expect({ audience: audience(), order: order(before), gone: gone() }).toEqual({ audience: READERS(), order: ['account.told', 'lw.postout'], gone: false })
    expect(postOut(PID.hunter, todayIso(), 'delete'), 'Mako changes it to today, Delete').toBe(true)
    reload()
    expect({ audience: audience(), order: order(before), gone: gone() }).toEqual({ audience: READERS(), order: ['account.told', 'lw.postout', 'lw.postout'], gone: true })
  })
  it('the move is told whole: the mover\'s own two lines and the readers\', at one moment', () => {
    makoAtTheKeys()
    const before = commandStream().length
    postsOut(todayIso(), 'Mako posts Hunter out from today, outcome Delete')
    const told = commandStream().slice(before).find(e => e.type === 'account.told') as any
    const ids = JSON.stringify(told ?? null)
    expect({ plan: ids.includes(OWN_PLAN()), member: ids.includes(OWN_MEMBER()), moments: new Set(NOTICES.filter(n => isMoveOf(n)).map(n => n.at)).size })
      .toEqual({ plan: true, member: true, moments: 1 })
  })
  it('a telling refused today is not sent again by the posting door (the per-move rule), and the posting still runs', () => {
    saberMovesHunter()
    unwritable(ACCT.hunter)
    pastMidnight()
    expect({ lines: ofHunter().length, refused: refused().length }, 'premise: the 16th\'s telling refused').toEqual({ lines: 0, refused: 1 })
    signInAs('mako'); reload()
    const before = commandStream().length
    expect(postOut(PID.hunter, todayIso(), 'delete'), 'Mako posts Hunter out from today, outcome Delete').toBe(true)
    reload()
    expect({ order: order(before), gone: gone() }).toEqual({ order: ['lw.postout'], gone: true })
  })
  it('control: the move told by the wake first — the Delete posting behaves as before, and tells nothing more', () => {
    saberMovesHunter()
    signInAs('mako'); reload()
    pastMidnight()
    expect(audience(), 'premise: told by the wake of the 16th').toEqual(READERS())
    const lines = JSON.stringify(NOTICES.filter(n => isMoveOf(n)))
    expect(postsOut(todayIso(), 'Mako posts Hunter out from today, outcome Delete')).toEqual({ audience: READERS(), order: ['lw.postout'], gone: true, acct: false })
    expect(JSON.stringify(NOTICES.filter(n => isMoveOf(n)))).toBe(lines)
  })
  /* THE BELT: a Delete posting saved AHEAD (a master admin, with 150's Leave War in view, before the move day) falls due
     with the move — and the first press of the day is anything that wakes the passes as its command lands. The move pass
     used to return there while the posting pass queued its own command; now the telling is queued first */
  it('a Delete posting saved ahead, then any Leave War change as the first press of the day: told, then deleted', async () => {
    saberMovesHunter()
    await pickSquadron(third.u150)
    expect(postOut(PID.hunter, DAY, 'delete'), 'Saber, 150 in view, posts Hunter out from the 16th, outcome Delete').toBe(true)
    reload()
    late(); reload()
    expect({ gone: gone(), audience: audience() }, 'premise: neither pass has run').toEqual({ gone: false, audience: [] })
    const before = commandStream().length
    expect(setCell(PID.mako, '2026-07-21', 'LL'), 'Saber places a leave on Mako\'s row').toBe(true)
    reload()
    const types = commandStream().slice(before).map(e => e.type).filter(t => t === 'account.told' || t === 'lw.postoutRun')
    expect({ audience: audience(), types, gone: gone(), acct: !!accountById(ACCT.hunter) }).toEqual({ audience: READERS(), types: ['account.told', 'lw.postoutRun'], gone: true, acct: false })
  })
  it('control: a Delete posting of a man who never moved tells nothing first; a door that refuses tells nothing', () => {
    saberMovesHunter()
    late(); reload()
    const before = commandStream().length
    expect(postOut(PID.saber, todayIso(), 'delete'), 'Saber cannot delete himself by a posting').toBe(false)
    expect(order(before), 'the refused door told nothing').toEqual([])
    expect(postOut(PID.ranger, todayIso(), 'delete'), 'Saber posts Ranger out from today, outcome Delete').toBe(true)
    reload()
    expect({ first: order(before)[0], ranger: !!(PEOPLE as any)[PID.ranger]?.deleted }, 'Hunter\'s move is not Ranger\'s: Ranger\'s posting is not held for it')
      .toEqual({ first: 'lw.postout', ranger: true })
  })
})
