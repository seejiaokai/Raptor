// @vitest-environment jsdom
/* Fix read 3, O2 (the fresh Opus reader's proof, kept as its regression): the shape fixed for "Undo post out" (013b695f8 — a line held by a man since moved is left as his
   record), by the top bar's Undo. Kestrel (149) opens bidding; Osprey (149) is told. The master, on another device, saves
   Osprey's move to 142 (here: the row arrives in the shared store, as another device's write does). The next day Kestrel,
   still signed in, presses Undo: the Undo takes Osprey's "Bidding open" line off his bell — a 142 man's bell now — and
   7e (perms.ts adminOwnerViolation) refuses the whole Undo. Harness as leavewar/multi-sqn-job2-warbell.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit, openDates } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { homeOn, unitsLoad } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES } from '../state/notices'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo } from '../undo'
import { invariants } from '../command/harness'
import { ownershipViolation } from '../state/perms'
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
  _resetTimeline(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})
const day = () => getState().period.end
const isOpen = () => getState().period.open.some(o => o.from <= day() && day() <= o.to)

function run(move: boolean) {
  signInAs('ad9', 'a9')
  expect(worldUnit()).toBe('u149')
  const n0 = NOTICES.length
  expect(openDates(day(), day())).toBe('set')
  expect(NOTICES.slice(n0).some(n => n.to === 'osp9'), 'Osprey told').toBe(true)
  if (move) {
    /* another device's saved row, arriving in the shared store (a raw set is refused outside a command here) */
    mem['sqn142_' + HOME_PFX + 'hfr3'] = JSON.stringify({ id: 'hfr3', pid: 'osp9', unit: 'u142', from: '2026-07-16' })
    void store
    unitsLoad()
  }
  vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
  unitsLoad()
  if (move) expect(homeOn('osp9', rosterToday())).toBe('u142')
  SEEN.length = 0
  const r = globalUndo()
  return { ...r, why: [...SEEN] }
}
/* the refusal's own words, read off the hard invariants (the Undo shows only "couldn't be completed") */
const SEEN: string[] = []
for (const inv of invariants('hard') as any[]) {
  if (inv.__fr3) continue
  const orig = inv.check
  inv.check = (env: any) => { const v = orig(env); if (v) SEEN.push(`${inv.id}: ${v}`); return v }
  inv.__fr3 = true
}

describe('the top bar Undo of Open for bidding, a told man since moved to the other squadron', () => {
  it('control: no move — the Undo goes through', () => {
    const r = run(false)
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(isOpen()).toBe(false)
  })
  it('after the move: Kestrel, 149’s own admin, can still undo 149’s own Open for bidding', () => {
    const r = run(true)
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(isOpen()).toBe(false)
  })
  it('no wider: a change that only calls itself Kestrel’s restore, taking Osprey’s line after his move, is still refused', () => {
    signInAs('ad9', 'a9')
    expect(openDates(day(), day())).toBe('set')
    const line = NOTICES.find(n => n.to === 'osp9')!
    expect(line).toBeDefined()
    mem['sqn142_' + HOME_PFX + 'hfr3'] = JSON.stringify({ id: 'hfr3', pid: 'osp9', unit: 'u142', from: '2026-07-16' })
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
    unitsLoad()
    expect(homeOn('osp9', rosterToday())).toBe('u142')
    const env: any = { type: 'undo.restore', origin: 'restore', actor: { id: 'acad9', role: 'admin', personId: 'kes9', session: null },
      changes: [{ collection: 'notices', id: line.id, op: 'delete', before: { ...line }, after: null }] }
    expect(ownershipViolation(env)).toMatch(/bell line of another squadron/)
  })
  /* (the reader's third case, a probe splicing Osprey's line out of memory outside any command, is not kept: it leaves
     memory and the store apart, so its result hung on what earlier tests left in the bell — not a path the app can take) */
})
