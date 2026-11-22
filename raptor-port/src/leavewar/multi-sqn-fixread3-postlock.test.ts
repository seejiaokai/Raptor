// @vitest-environment jsdom
/* Fix read 3, A1 (Astra's 1): the posting pass — the app acting — skipped the commit gate's last-admin lock, and its own
   preflight read today only and counted an ARCHIVED admin as one who can sign in. So Kestrel's Overseas Sqn posting (or
   Delete) ran on 16 Jul although Osprey, 149's other admin, had a saved move to 142 from 17 Jul — 149 with no admin of
   its own from then — and ran although the other admin left was archived. D2184 Q10 (no squadron left without an admin,
   nor by a later step) and D306 (such a posting waits, whole: not done, not announced, said). Fixture as
   multi-sqn-job2-retract.test.ts; Astra's proofs, run as written. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount, ACCOUNTS_LIST } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, runPoOutcomes, poHeldReason } from './sync'
import { setHome, homeOn, unitsLoad } from '../state/units'
import { INPUTS } from '../engine/inputs'
import { NOTICES } from '../state/notices'
import { commitPeopleIntent } from '../state/people-settings-commit'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
let worlds: Record<string, any> = {}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String((INPUTS as any)[i].iid || '').startsWith('ipd')) INPUTS.splice(i, 1)
  worlds = { u142: memoryBackend(), u149: memoryBackend() }
  setWarWorldDoor(null)
  lwInitStore(worlds.u142)
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})

const acct = (id: string) => ACCOUNTS_LIST.find(a => a.id === id)
const poLines = (who: string) => NOTICES.filter(n => (n.what || [])[0]?.k === 'po' && (n.what[0] as any).who === who)
/* the posting held whole: not done, nothing of it done, nobody told, the reason said */
function heldWhole(who: string, acctId: string, o: 'overseas' | 'delete') {
  expect((PEOPLE as any)[who]?.deleted ?? false).toBe(false)
  expect((PEOPLE as any)[who].archived).toBeFalsy()
  expect(acct(acctId)?.on).toBe(true)
  expect(getState().postOuts[who]?.poDone).not.toBe('2026-07-16')
  expect(poLines(who)).toEqual([])
  expect(poHeldReason(who, o, '2026-07-16')).toEqual(expect.any(String))
}
/* Osprey made 149's second admin; Kestrel's posting set for 16 Jul by `poster` */
function twoAdmins(o: 'overseas' | 'delete', poster: [string, string]) {
  signInAs('ad', 'a')
  expect(updateAccount('acus9', { role: 'admin' })).toBeNull()
  signInAs(...poster)
  expect(worldUnit()).toBe('u149')
  expect(postOut('kes9', '2026-07-16', o)).toBe(true)
  signInAs('ad', 'a')
  expect(worldUnit()).toBe('u142')
}
/* 16 Jul: Saber saves Osprey's move to 142 from 17 Jul, Kestrel still protecting 149 */
function moveOsprey() {
  vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
  unitsLoad()
  expect(setHome('osp9', 'u142').ok).toBe(true)
  expect(homeOn('osp9', '2026-07-17')).toBe('u142')
  expect(acct('acad9')?.on).toBe(true)
}

describe('the posting pass holds a posting that would leave a squadron with no admin, on any date', () => {
  it('Overseas Sqn: Osprey moves to 142 from tomorrow — Kestrel’s posting waits, whole', () => {
    twoAdmins('overseas', ['ad9', 'a9'])
    moveOsprey()
    signInAs('ad9', 'a9')
    runPoOutcomes()
    heldWhole('kes9', 'acad9', 'overseas')
    expect(poHeldReason('kes9', 'overseas', '2026-07-16')).toMatch(/149's last admin/)
  })
  it('Delete: the same move — Kestrel is not deleted', () => {
    twoAdmins('delete', ['us9', 'us9'])
    moveOsprey()
    signInAs('ad9', 'a9')
    runPoOutcomes()
    heldWhole('kes9', 'acad9', 'delete')
  })
  it('archived: Osprey archived (account left on) is no admin who can sign in — Kestrel’s posting waits', () => {
    twoAdmins('overseas', ['ad9', 'a9'])
    const r = commitPeopleIntent('person.archive', null, () => {
      Object.assign((PEOPLE as any).osp9, { archived: true, archivedBy: 'admin', archivedOn: '2026-07-15' })
    }) as any
    expect(r.ok).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
    unitsLoad()
    signInAs('ad9', 'a9')
    runPoOutcomes()
    heldWhole('kes9', 'acad9', 'overseas')
  })
  it('control: no move — Kestrel’s posting runs on its date, Osprey left as 149’s admin', () => {
    twoAdmins('overseas', ['ad9', 'a9'])
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
    unitsLoad()
    signInAs('us9', 'us9')
    runPoOutcomes()
    expect((PEOPLE as any).kes9.archived).toBe(true)
    expect(acct('acad9')?.on).toBe(false)
    expect(getState().postOuts.kes9?.poDone).toBe('2026-07-16')
    expect(poLines('kes9').length).toBeGreaterThan(0)
  })
  it('two postings due together: Kestrel and Osprey both Overseas Sqn — one runs, the other waits', () => {
    twoAdmins('overseas', ['ad9', 'a9'])
    signInAs('ad9', 'a9')
    expect(postOut('osp9', '2026-07-16', 'overseas')).toBe(true)
    signInAs('ad', 'a')
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
    unitsLoad()
    signInAs('ad9', 'a9')
    runPoOutcomes()
    const gone = ['kes9', 'osp9'].filter(p => (PEOPLE as any)[p].archived)
    expect(gone.length).toBe(1)
    const kept = gone[0] === 'kes9' ? 'osp9' : 'kes9'
    expect(acct(kept === 'kes9' ? 'acad9' : 'acus9')?.on).toBe(true)
    expect(poHeldReason(kept, 'overseas', '2026-07-16')).toEqual(expect.any(String))
  })
})
