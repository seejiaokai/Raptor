// @vitest-environment jsdom
/* JOB 2 (19 Nov 26), the fresh Opus read's F1: a man posted out of 149 stays a row of 149's war while his posting window
   runs (store.ts setPeople keeps him), and once the master moved him to 142 the war still addressed its own bell lines to
   him — "bidding opened" to everyone on the war with a sign-in (sync.ts warAudience). Job 1's 7e refuses an admin's bell
   line to another squadron's man, so 149's own admin could no longer open or close bidding — silently. The war tells only
   its own squadron's people (D2194): a man now at home elsewhere is not told of his old squadron's bidding, nor of a
   decision there. The proof is the Opus reader's (docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-opus.md). */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit, openDates, closeDates } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut } from './sync'
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

/* Kestrel (149's admin) posts Osprey out on 1 Sep 26 (no outcome — he stays on the roster); with `move`, the master then
   moves Osprey to 142 from tomorrow; two days on Kestrel signs in again on 149's war */
function setup(move: boolean) {
  signInAs('ad9', 'a9')
  expect(worldUnit()).toBe('u149')
  expect(postOut('osp9', '2026-09-01', false)).toBe(true)
  if (move) {
    signInAs('ad', 'a')
    expect(setHome('osp9', 'u142').ok).toBe(true)
  }
  vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0))
  unitsLoad()
  signInAs('ad9', 'a9')
  expect(worldUnit()).toBe('u149')
  if (move) {
    expect(homeOn('osp9', rosterToday())).toBe('u142')
    expect(getState().people.some(p => p.id === 'osp9'), 'Osprey is still a row of 149’s war (his posting window keeps him)').toBe(true)
  }
}
const day = () => getState().period.end
const toldOsprey = (n0: number) => NOTICES.slice(n0).filter(n => n.to === 'osp9').length

describe("F1 — 149's admin opens and closes bidding with a man since moved to 142 still a row of 149's war", () => {
  it('control: no move — bidding opens and Osprey, 149’s, is told', () => {
    setup(false)
    const n0 = NOTICES.length
    expect(openDates(day(), day())).toBe('set')
    expect(getState().period.open.some(o => o.from <= day() && day() <= o.to)).toBe(true)
    expect(toldOsprey(n0)).toBe(1)
  })
  it('after the move: bidding opens, and Osprey, now 142’s, is not told', () => {
    setup(true)
    const n0 = NOTICES.length
    expect(openDates(day(), day())).toBe('set')
    expect(getState().period.open.some(o => o.from <= day() && day() <= o.to), 'the Open for bidding command went through').toBe(true)
    /* (149's only other sign-in is Kestrel himself, who is never told of his own act — D1214) */
    expect(toldOsprey(n0)).toBe(0)
  })
  it('…and closing it goes through too', () => {
    setup(true)
    expect(openDates(day(), day())).toBe('set')
    const n0 = NOTICES.length
    expect(closeDates(day(), day())).toBe('set')
    expect(getState().period.open.some(o => o.from <= day() && day() <= o.to)).toBe(false)
    expect(toldOsprey(n0)).toBe(0)
  })
})
