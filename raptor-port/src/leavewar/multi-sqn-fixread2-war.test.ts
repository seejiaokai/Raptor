// @vitest-environment jsdom
/* Multi-squadron batch 1 — the second fix read's (18 Nov 26) faults that live on the Leave War's side, each reproduced
   red first in a world with two wars, one per squadron (the app's own swap on sign-in, leavewar/sync.ts swapWarWorld).
   Astra 4: a new 149 man lost his post-in date — every writer called the war's post-in before his home was written, so
   the projection (149's) did not have him and the war half returned in silence. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, addPersonAndAccount, requestAccess, approveRequestNew, ACCESS_REQS } from '../state/accounts'
import { addRosterPerson } from '../state/roster-add'
import { getState, initStore as lwInitStore, setPeople, worldUnit } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from '../leavewar/sync'
import { INPUTS } from '../engine/inputs'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const pidOf = (cs: string): string => Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs) || ''
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

const NP = (cs: string) => ({ cs, ini: 'FJ', seat: 'FCP', cat: 'D' }) as any

describe('Astra 4 — a new 149 man keeps his post-in date on 149’s war', () => {
  it('Admin → Users, New person with a sign-in', () => {
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    expect(addPersonAndAccount('join149', NP('FixJoin'), 'main', '2026-12-01')).toBeNull()
    const pid = pidOf('FixJoin')
    expect(pid).not.toBe('')
    expect(getState().postOuts[pid]?.from, 'the war counts him from his post-in date').toBe('2026-12-01')
  })
  it('Admin → Users, New person with a blank sign-in (roster only)', () => {
    signInAs('ad9', 'a9')
    expect(addRosterPerson(NP('FixRoster'), '2026-12-01')).toBeNull()
    expect(getState().postOuts[pidOf('FixRoster')]?.from).toBe('2026-12-01')
  })
  it('approving an access request as New person', () => {
    signInAs('joinreq@mail')
    expect(requestAccess(NP('FixReq'))).toBeNull()
    signInAs('ad9', 'a9')
    const rq = ACCESS_REQS.find(r => r.name === 'joinreq@mail')
    expect(rq).toBeTruthy()
    expect(approveRequestNew(rq!.id, NP('FixReq'), 'main', '2026-12-01')).toBeNull()
    expect(getState().postOuts[pidOf('FixReq')]?.from).toBe('2026-12-01')
  })
  it('control: 142’s admin adds a 142 man — his date kept, as before', () => {
    signInAs('ad', 'a')
    expect(worldUnit()).toBe('u142')
    expect(addPersonAndAccount('join142', NP('FixHome'), 'main', '2026-12-01')).toBeNull()
    expect(getState().postOuts[pidOf('FixHome')]?.from).toBe('2026-12-01')
  })
})
