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
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
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
  const person = (id: string) => ({ op: 'put', collection: 'people', id, before: { cs: id }, after: { cs: id, archived: true } })
  const posting = (id: string) => ({ op: 'put', collection: 'lw.postouts', id, before: { to: '2026-07-19' }, after: { to: '2026-07-19', poDone: '2026-07-20' } })
  it('a person changed beside nobody’s posting is refused', () => {
    expect(ownershipViolation(env([person('rocky')]))).toMatch(/posting pass may change only the men it posts out \(people\/rocky\)/)
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
})
