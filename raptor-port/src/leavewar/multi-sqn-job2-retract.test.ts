// @vitest-environment jsdom
/* PROOF (blind read of job 2's fixes): F1's class by another door — a posting's bell lines, taken back by "Undo post
   out", reach an admin who has since moved to the other squadron, and 7e refuses the whole command. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut } from './sync'
import { setHome, homeOn, unitsLoad } from '../state/units'
import { INPUTS } from '../engine/inputs'
import { NOTICES } from '../state/notices'
import { rosterToday } from '../engine/roster'

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

function setup(move: boolean) {
  signInAs('ad', 'a')
  expect(worldUnit()).toBe('u142')
  expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull()       // a third 142 admin, Outlaw
  expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)              // runs today: lines to 142's admins
  expect(NOTICES.some(n => n.to === 'prowler' && (n.what || [])[0]?.k === 'po')).toBe(true)
  if (move) expect(setHome('prowler', 'u149').ok).toBe(true)             // Hunter to 149 from tomorrow
  vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0))
  unitsLoad()
  signInAs('outlaw')
  expect(worldUnit()).toBe('u142')
  if (move) expect(homeOn('prowler', rosterToday())).toBe('u149')
}

describe("Undo post out with an admin who got the posting's line since moved to 149", () => {
  it('control: no move — Outlaw undoes the posting', () => {
    setup(false)
    expect(undoPostOut('bane')).toBe(true)
    expect(getState().postOuts['bane']?.to ?? null).toBeNull()
  })
  it('after the move: Outlaw, 142’s own admin, can still undo 142’s own posting', () => {
    setup(true)
    expect(undoPostOut('bane')).toBe(true)
    expect(getState().postOuts['bane']?.to ?? null).toBeNull()
  })
  it('cause: the same, with Hunter’s (now 149’s) stored line left out of the take-back, goes through', () => {
    setup(true)
    for (let i = NOTICES.length - 1; i >= 0; i--) if (NOTICES[i]!.to === 'prowler') NOTICES.splice(i, 1)
    expect(undoPostOut('bane')).toBe(true)
  })
})
