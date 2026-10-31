/* [SYSTEM-PASS-SAVES-ROSTER] (found 29 Oct 26 by D1510's security read; built 31 Oct 26) — THE POSTING PASS SAVES ONLY ITS
   OWN CHANGE TO THE ROSTER.

   The posting pass (sync.ts runPoOutcomes, the `lw.postoutRun` command) runs as the app itself — the system actor, which the
   commit gate lets through — and enlisted the people store, whose before-image is the last SAVED roster, then finished by
   taking the whole live roster as the new saved one. So a change made to a person in memory outside every command (only
   possible from a browser's console) was saved with it, past the own-row rule (D149, D218, D1510).

   The fix, in two parts: (1) before the pass enlists the people store, the roster in memory is put back to its saved
   baseline (people-settings-commit.ts revertUnsavedPeople) — the pass's own outcomes are then the whole of its change; (2) a
   hard rule in the commit gate (perms.ts ownershipViolation): a `lw.postoutRun` change to a person is refused unless the same
   command carries out that man's posting (his posting record changes with it). Nothing the app itself does is reverted —
   every in-app roster write happens inside its own command, which saves it before the pass can run (the pass queues behind
   a running command, or joins it and is then judged as that command's maker; it never reverts inside another command).

   Every set-up goes through the production doors: the Post out sheet's writer (postOut), the pass (runPoOutcomes), the
   Quals page's one writer (updatePersonField). Runs in the Leave War project (a hostile time zone). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { commandStream, commitProjection } from '../command'
import type { CommitEnvelope } from '../command'
import { peopleStore, revertUnsavedPeople } from '../state/people-settings-commit'
import { addRosterPerson } from '../state/roster-add'
import { ownershipViolation } from '../state/perms'
import { updatePersonField } from '../state/quals-write'
import { getState, initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
/* the saved roster — the people store's baseline, the last roster a command saved */
const saved = (id: string): any => JSON.parse(peopleStore.capture() as string)[id]
const POSTDATE = '2026-07-20'
/* a posting set while its date is still to come; then the calendar reaches it — the pass is due, and has not run */
const postAhead = (id: string, outcome: 'overseas' | 'sans' | 'delete') => {
  expect(postOut(id, POSTDATE, outcome)).toBe(true)
  expect(P(id).archived || P(id).deleted || (outcome === 'sans' && P(id).sanBy === 'po'), 'not run while its date is to come').toBeFalsy()
  vi.setSystemTime(new Date(2026, 6, 21, 9, 0, 0))
}
/* the pass's own envelopes since a point in the stream, and the people they change */
const passEnvs = (from: number) => commandStream().slice(from).filter(e => e.type === 'lw.postoutRun')
const peopleIn = (e: CommitEnvelope) => e.changes.filter(c => c.collection === 'people').map(c => c.id).sort()

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  /* with its key list, so the settings rows (an account) are records a command's change names, as on a built site */
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  HOOKS.toast = () => {}
  signInAs('ad', 'a')
})
afterEach(() => { HOOKS.toast = toast; resetSession(null) })

describe('the pass saves exactly what it should — the men due to post out, and nothing else', () => {
  for (const outcome of ['overseas', 'sans', 'delete'] as const) {
    it(`${outcome}: its one command changes Ranger's person alone`, () => {
      postAhead('bane', outcome)
      const n = commandStream().length
      runPoOutcomes()
      const envs = passEnvs(n)
      expect(envs, 'the pass ran as its own command').toHaveLength(1)
      expect(peopleIn(envs[0]!)).toEqual(['bane'])
      expect(envs[0]!.changes.some(c => c.collection === 'lw.postouts' && c.id === 'bane'), 'with his posting record').toBe(true)
      if (outcome === 'overseas') expect(saved('bane').archivedBy).toBe('po')
      if (outcome === 'sans') expect(saved('bane').sanBy).toBe('po')
      if (outcome === 'delete') expect(saved('bane').deleted).toBe(true)
    })
  }
  it('two men due at once: both, and only both', () => {
    expect(postOut('bane', POSTDATE, 'overseas')).toBe(true)
    expect(postOut('rocky', POSTDATE, 'sans')).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 21, 9, 0, 0))
    const n = commandStream().length
    runPoOutcomes()
    const envs = passEnvs(n)
    expect(envs).toHaveLength(1)
    expect(peopleIn(envs[0]!)).toEqual(['bane', 'rocky'])
  })
})

describe('a person changed in memory outside every command is not saved by the pass (the console case)', () => {
  it('another man ticked Management from a console: the pass does not save it, and the roster reads as saved again', () => {
    expect(saved('rocky').quals.mgmt).toBeFalsy()
    postAhead('bane', 'overseas')
    P('rocky').quals.mgmt = true                       // a change outside every command — no door, no gate
    const n = commandStream().length
    runPoOutcomes()
    const envs = passEnvs(n)
    expect(envs).toHaveLength(1)
    expect(peopleIn(envs[0]!), 'only the man posting out').toEqual(['bane'])
    expect(saved('rocky').quals.mgmt, 'not saved').toBeFalsy()
    expect(P('rocky').quals.mgmt, 'and not left in memory to ride the next command').toBeFalsy()
    expect(P('bane').archived, 'the posting still ran').toBe(true)
  })
  it('a man added from a console: not saved, gone from memory', () => {
    postAhead('bane', 'overseas')
    ;(PEOPLE as any).ghost = { ...JSON.parse(JSON.stringify(P('rocky'))), cs: 'GHOST' }
    const n = commandStream().length
    runPoOutcomes()
    expect(peopleIn(passEnvs(n)[0]!)).toEqual(['bane'])
    expect(saved('ghost')).toBeUndefined()
    expect((PEOPLE as any).ghost).toBeUndefined()
  })
  it('a change from a console to the man posting out himself: only the posting is saved on his row', () => {
    postAhead('bane', 'overseas')
    P('bane').quals.mgmt = true
    P('bane').cs = 'HACKED'
    runPoOutcomes()
    expect(saved('bane').archivedBy).toBe('po')
    expect(saved('bane').quals.mgmt, 'his console tick not saved').toBeFalsy()
    expect(saved('bane').cs).toBe('Ranger')
    expect(P('bane').cs, 'his callsign as saved').toBe('Ranger')
  })
})

describe('an ordinary change made in the app is never lost or reverted by the pass', () => {
  it('an admin ticks a qual on Quals while a posting is due: the tick is saved by its own command, the pass runs after it', () => {
    postAhead('bane', 'overseas')
    const n = commandStream().length
    expect(updatePersonField('rocky', { tick: 'mgmt' })).toBeNull()
    raptorNotify(); runPoOutcomes()
    expect(saved('rocky').quals.mgmt, 'the admin’s tick is saved').toBe(true)
    expect(P('rocky').quals.mgmt).toBe(true)
    expect(P('bane').archived, 'and the posting ran').toBe(true)
    const pass = passEnvs(n)
    expect(pass.length).toBeLessThanOrEqual(1)
    for (const e of pass) expect(peopleIn(e)).toEqual(['bane'])
  })
  it('a posting made today runs inside the Post out command itself, as before (the admin’s own command, judged as his)', () => {
    const n = commandStream().length
    expect(postOut('bane', '2026-07-15', 'overseas')).toBe(true)
    expect(P('bane').archived).toBe(true)
    expect(saved('bane').archived).toBe(true)
    expect(getState().postOuts.bane!.poDone).toBe('2026-07-15')
    const envs = commandStream().slice(n)
    expect(envs.every(e => peopleIn(e).every(id => id === 'bane'))).toBe(true)
  })
})

/* THE TWO LAYERS, EACH WITH ITS OWN TEST (the break list `scripts/handpass/breaks/lw-rr1031.json`, walk-scripts §9): the
   gate's rule refuses a pass carrying a stray change, so the put-back's own work and the "never inside a person's own
   command" rule need tests that only they can satisfy */
describe('the put-back itself, and where it must not run', () => {
  it('puts back a changed person in place, drops a person added in memory, brings back one removed — and says which', () => {
    const rocky = P('rocky')
    const savedCs = saved('rocky').cs
    rocky.cs = 'HACKED'
    ;(PEOPLE as any).ghost = { cs: 'GHOST', seat: 'FCP', q: 'C', quals: {} }
    const stiff = P('stiff'); delete (PEOPLE as any).stiff
    expect(revertUnsavedPeople().sort()).toEqual(['ghost', 'rocky', 'stiff'])
    expect(P('rocky'), 'the same object, put back in place').toBe(rocky)
    expect(P('rocky').cs).toBe(savedCs)
    expect((PEOPLE as any).ghost).toBeUndefined()
    expect(P('stiff')).toEqual(stiff)
    expect(revertUnsavedPeople(), 'nothing left to put back').toEqual([])
  })
  it('a body added in memory and marked as a placeholder is put back out too — only ALL and ALL AVAIL are code', () => {
    ;(PEOPLE as any).ghost2 = { cs: 'GHOST2', seat: 'FCP', q: 'C', quals: {}, special: true }
    expect(revertUnsavedPeople()).toEqual(['ghost2'])
    expect((PEOPLE as any).ghost2).toBeUndefined()
    expect(P('all'), 'the ALL puck stays').toBeTruthy()
    expect(P('allavail'), 'the ALL AVAIL puck stays').toBeTruthy()
  })
  it('a posting that comes due inside a person’s own command (an add with his post-in date): that command’s new man is kept', () => {
    postAhead('bane', 'overseas')
    expect(addRosterPerson({ cs: 'Newby', ini: '', seat: 'FCP', cat: 'C' } as any, '2026-07-25')).toBeNull()
    const id = Object.keys(PEOPLE).find(k => P(k).cs === 'Newby')
    expect(id, 'the new man is on the roster').toBeTruthy()
    expect(saved(id!), 'and saved').toBeTruthy()
    raptorNotify(); runPoOutcomes()
    expect(P('bane').archived, 'the posting ran').toBe(true)
    expect(P(id!), 'the new man still there after the pass').toBeTruthy()
  })
})

describe('woken inside a command the app itself runs, the pass waits and runs as its own command after it', () => {
  it('raised inside a projection’s reducer: its own `lw.postoutRun`, after the projection, the stray change not saved', () => {
    postAhead('bane', 'overseas')
    P('rocky').quals.mgmt = true
    const n = commandStream().length
    const r: any = commitProjection({ type: 'lw.sync', scope: { module: 'lw' } as any, apply: () => { runPoOutcomes() } })
    expect(r.ok, 'the projection itself goes through').toBe(true)
    const envs = passEnvs(n)
    expect(envs, 'the pass ran as its own command').toHaveLength(1)
    expect(peopleIn(envs[0]!)).toEqual(['bane'])
    expect(P('bane').archived).toBe(true)
    expect(saved('rocky').quals.mgmt).toBeFalsy()
    expect(P('rocky').quals.mgmt).toBeFalsy()
  })
})

describe('the hard rule: a posting pass changes a person only where it carries out his posting', () => {
  const env = (changes: any[]): CommitEnvelope => ({
    seq: 1, at: '', actor: { id: 'system', role: 'system', session: null } as any, origin: 'projection',
    scope: { module: 'people' } as any, type: 'lw.postoutRun', changes, emit: true,
  } as any)
  /* an Overseas Sqn posting dated 14 Jul, run on 15 Jul (today): his archive by the posting, and the posting's done mark */
  const person = (id: string) => ({ op: 'put', collection: 'people', id, before: { cs: id }, after: { cs: id, archived: true, archivedBy: 'po', archivedOn: '2026-07-14' } })
  const posting = (id: string) => ({ op: 'put', collection: 'lw.postouts', id, before: { to: '2026-07-13', poOutcome: 'overseas' }, after: { to: '2026-07-13', poOutcome: 'overseas', poDone: '2026-07-14' } })
  it('a person changed beside nobody’s posting is refused', () => {
    expect(ownershipViolation(env([person('rocky')]))).toMatch(/posting pass may change only the men it posts out.*\(people\/rocky\)/)
  })
  it('a second man changed beside one man’s posting is refused', () => {
    expect(ownershipViolation(env([person('bane'), posting('bane'), person('rocky')]))).toMatch(/people\/rocky/)
  })
  it('the man whose posting it carries out passes; so does a posting with no person change', () => {
    expect(ownershipViolation(env([person('bane'), posting('bane')]))).toBeNull()
    expect(ownershipViolation(env([posting('bane')]))).toBeNull()
  })
  it('only the posting pass is held to it — another command by the app itself is not', () => {
    expect(ownershipViolation({ ...env([person('rocky')]), type: 'lw.sync' } as any)).toBeNull()
  })
  /* THE SECURITY READ OF 7d0c12b24 (`docs/handpass/parts/lw-rr1031/read-security.md` 1(a)) — the rule matched by id alone:
     any change to a man's posting record let any change to his person ride beside it, and the pass's account rows were not
     asked at all. Each exploit below is a REAL pass's envelope with one thing slipped in. */
  const realPass = (id: string, outcome: 'overseas' | 'sans' | 'delete'): CommitEnvelope => {
    postAhead(id, outcome)
    const n = commandStream().length
    runPoOutcomes()
    const envs = passEnvs(n)
    expect(envs, 'the pass ran').toHaveLength(1)
    return JSON.parse(JSON.stringify(envs[0]))
  }
  const ch = (e: CommitEnvelope, coll: string, id: string): any => e.changes.find(c => c.collection === coll && c.id === id)
  it('every real outcome passes the gate as it ran — Overseas Sqn with his account suspended, SANS, Delete', () => {
    const o = realPass('bane', 'overseas')
    expect(o.changes.some(c => c.collection === 'settings' && String(c.id).startsWith('account:')), 'the suspension is in it').toBe(true)
    expect(ownershipViolation(o)).toBeNull()
  })
  it('SANS, as it ran', () => { expect(ownershipViolation(realPass('rocky', 'sans'))).toBeNull() })
  it('Delete (his account and person), as it ran', () => { expect(ownershipViolation(realPass('bane', 'delete'))).toBeNull() })
  it('a Management tick slipped onto the posted man himself is refused', () => {
    const e = realPass('bane', 'overseas')
    ch(e, 'people', 'bane').after.quals.mgmt = true
    expect(ownershipViolation(e)).toMatch(/posting pass may change only .*people\/bane/)
  })
  it('a new callsign slipped onto the posted man is refused', () => {
    const e = realPass('bane', 'overseas')
    ch(e, 'people', 'bane').after.cs = 'HACKED'
    expect(ownershipViolation(e)).toMatch(/people\/bane/)
  })
  it('another man’s posting record touched (not its done mark) and his Management tick beside it is refused', () => {
    const e = realPass('bane', 'overseas')
    const r = JSON.parse(JSON.stringify(P('rocky')))
    e.changes.push({ op: 'put', collection: 'lw.postouts', id: 'rocky', before: { to: null }, after: { to: null, label: 'x' } } as any)
    e.changes.push({ op: 'put', collection: 'people', id: 'rocky', before: r, after: { ...r, quals: { ...r.quals, mgmt: true } } } as any)
    expect(ownershipViolation(e)).toMatch(/people\/rocky/)
  })
  it('a delete mark cleared beside a posting’s done mark is refused', () => {
    /* a SANS pass writes no account row, so the person's own check is the one that answers */
    const e = realPass('bane', 'sans')
    const r = JSON.parse(JSON.stringify(P('rocky')))
    e.changes.push({ op: 'put', collection: 'lw.postouts', id: 'rocky', before: { to: '2026-07-13', poOutcome: 'delete' }, after: { to: '2026-07-13', poOutcome: 'delete', poDone: '2026-07-14' } } as any)
    e.changes.push({ op: 'put', collection: 'people', id: 'rocky', before: { ...r, deleted: true, deletedFrom: '2026-07-01', archived: true, archivedBy: 'del' }, after: { ...r, deleted: false, archived: false } } as any)
    expect(ownershipViolation(e)).toMatch(/people\/rocky/)
  })
  it('a posting’s done mark not yet due (its date still to come) does not vouch for his change', () => {
    const e = realPass('bane', 'overseas')
    const p = ch(e, 'lw.postouts', 'bane')
    p.after.to = '2026-08-01'; p.after.poDone = '2026-08-02'
    expect(ownershipViolation(e)).toMatch(/people\/bane/)
  })
  it('once the accounts are stored, the posted man’s own account row alone (suspended) passes', () => {
    const e = realPass('bane', 'overseas')
    const acc = e.changes.find(c => c.collection === 'settings' && (c.after as any)?.pid === 'bane')!
    ;(acc as any).before = { ...(acc.after as any), on: true }
    delete (acc as any).before.offBy
    e.changes = e.changes.filter(c => c.collection !== 'settings' || c === acc)
    expect(ownershipViolation(e)).toBeNull()
    ;(acc as any).after = { ...(acc.after as any), role: 'admin' }
    expect(ownershipViolation(e), 'his role changed with it').toMatch(/settings\/account:/)
  })
  /* each condition of the tightened rule with a test only it satisfies (the break list, walk-scripts §9) */
  const storedAccountsPass = (): CommitEnvelope => {
    const e = realPass('bane', 'overseas')
    const acc = e.changes.find(c => c.collection === 'settings' && (c.after as any)?.pid === 'bane')!
    ;(acc as any).before = { ...(acc.after as any), on: true }
    delete (acc as any).before.offBy
    e.changes = e.changes.filter(c => c.collection !== 'settings' || c === acc)
    return e
  }
  it('a done mark that is not the posting’s own date does not vouch for his change', () => {
    const e = realPass('bane', 'overseas')
    ch(e, 'lw.postouts', 'bane').after.poDone = '2026-07-01'
    expect(ownershipViolation(e)).toMatch(/people\/bane/)
  })
  it('a posting already done, touched again (its mark unchanged), does not vouch for his change', () => {
    const e = realPass('bane', 'overseas')
    const r = JSON.parse(JSON.stringify(P('rocky')))
    const done = { to: '2026-07-19', poOutcome: 'overseas', poDone: '2026-07-20' }
    e.changes.push({ op: 'put', collection: 'lw.postouts', id: 'rocky', before: done, after: { ...done, label: 'x' } } as any)
    e.changes.push({ op: 'put', collection: 'people', id: 'rocky', before: r, after: { ...r, archived: true, archivedBy: 'po', archivedOn: '2026-07-20' } } as any)
    expect(ownershipViolation(e)).toMatch(/people\/rocky/)
  })
  it('a SANS posting carries no other qualification with it', () => {
    const e = realPass('rocky', 'sans')
    ch(e, 'people', 'rocky').after.quals.mgmt = true
    expect(ownershipViolation(e)).toMatch(/people\/rocky/)
  })
  it('once the accounts are stored, a new account row for another man is refused', () => {
    const e = storedAccountsPass()
    e.changes.push({ op: 'put', collection: 'settings', id: 'account:zz8', before: null, after: { id: 'zz8', name: 'evil', role: 'admin', pid: 'rocky', on: true } } as any)
    expect(ownershipViolation(e)).toMatch(/settings\/account:zz8/)
  })
  /* THE NARROW READ OF 63e1660d6 (`docs/handpass/parts/lw-rr1031/read-fix1.md` 1): the first-write allowance was decided
     from the changeset alone — every new row has no before-image — so a pass could create any account at any role, and the
     posted man's own new row skipped the owner, role and name check. The first write is now the seeded list itself. */
  it('the reader’s exploit: a SANS pass with a new admin account beside it is refused', () => {
    const e = realPass('rocky', 'sans')
    expect(e.changes.some(c => c.collection === 'settings'), 'a SANS pass writes no account row').toBe(false)
    e.changes.push({ op: 'put', collection: 'settings', id: 'account:zz8', before: null, after: { id: 'zz8', name: 'evil', role: 'admin', pid: 'rocky', on: true } } as any)
    expect(ownershipViolation(e)).toMatch(/settings\/account:zz8/)
  })
  it('on the accounts’ first write, the posted man’s own new row with another role is refused', () => {
    const e = realPass('bane', 'overseas')
    const acc: any = e.changes.find(c => c.collection === 'settings' && (c.after as any)?.pid === 'bane')
    expect(acc.before == null, 'the first write: no row stored before').toBe(true)
    acc.after = { ...acc.after, role: 'admin' }
    expect(ownershipViolation(e)).toMatch(/settings\/account:acus/)
  })
  it('on the accounts’ first write, the posted man’s own new row given to another man is refused', () => {
    const e = realPass('bane', 'overseas')
    const acc: any = e.changes.find(c => c.collection === 'settings' && (c.after as any)?.pid === 'bane')
    acc.after = { ...acc.after, pid: 'casper' }
    expect(ownershipViolation(e)).toMatch(/settings\/account:acus/)
  })
  it('on the accounts’ first write, another seeded account changed on the way is refused', () => {
    const e = realPass('bane', 'overseas')
    const acc: any = e.changes.find(c => c.collection === 'settings' && c.id === 'account:achex')
    expect(acc, 'the first write stores every seeded account').toBeTruthy()
    acc.after = { ...acc.after, role: 'admin' }
    expect(ownershipViolation(e)).toMatch(/settings\/account:achex/)
  })
  it('another man’s stored account suspended in the pass (only on and offBy changed) is refused', () => {
    const e = realPass('rocky', 'sans')
    const row = { id: 'acus', name: 'us', role: 'main', pid: 'bane', on: true }
    e.changes.push({ op: 'put', collection: 'settings', id: 'account:acus', before: row, after: { ...row, on: false, offBy: 'po' } } as any)
    expect(ownershipViolation(e)).toMatch(/settings\/account:acus/)
  })
  it('once the accounts are stored, a seeded account put back as seeded is refused (the first-write allowance is the first write only)', () => {
    const e = storedAccountsPass()
    e.changes.push({ op: 'put', collection: 'settings', id: 'account:achex', before: null, after: { id: 'achex', name: 'hex', role: 'main', pid: 'rocky', on: true } } as any)
    expect(ownershipViolation(e)).toMatch(/settings\/account:achex/)
  })
  it('on the accounts’ first write, the posted man’s own row left signed in (not suspended) is refused', () => {
    const e = realPass('bane', 'overseas')
    const acc: any = e.changes.find(c => c.collection === 'settings' && c.id === 'account:acus')
    acc.after = { ...acc.after, on: true }; delete acc.after.offBy
    expect(ownershipViolation(e)).toMatch(/settings\/account:acus/)
  })
  it('any other settings row in the pass is refused', () => {
    const e = storedAccountsPass()
    e.changes.push({ op: 'put', collection: 'settings', id: 'rules', before: { a: 1 }, after: { a: 2 } } as any)
    expect(ownershipViolation(e)).toMatch(/settings\/rules/)
  })
  it('another man’s account row in the pass is refused', () => {
    const e = realPass('rocky', 'sans')
    e.changes.push({ op: 'put', collection: 'settings', id: 'account:zz9', before: { id: 'zz9', name: 'us', role: 'member', pid: 'bane', on: true }, after: { id: 'zz9', name: 'us', role: 'admin', pid: 'bane', on: true } } as any)
    expect(ownershipViolation(e)).toMatch(/settings\/account:zz9/)
  })
})
