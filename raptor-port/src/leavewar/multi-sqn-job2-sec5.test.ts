// @vitest-environment jsdom
/* JOB 2 (19 Nov 26), the security read's SEC-5: the A3 store's `lwx.profile` record is a posting window, but section 7b's
   master-posting rule read only `lw.postouts`. 142's plain admin (Hunter) could write an Overseas Sqn posting for Saber,
   the master, into 142's stored war through the second store, and the next load of 142's war ran it — archived him and
   switched his account off. The second store is Admin → Users' doors' only (person.archive, person.restore,
   person.delete), never for the war loaded, and a master's posting there obeys 7b as the war's own does. The proof test
   is the security reader's (docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-security.md); setup as
   multi-sqn-a3-foreign.test.ts. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, accountById } from '../state/accounts'
import { ownershipViolation } from '../state/perms'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { commit, setConflictChecker, deriveActor } from '../command'
import { getState, initStore as lwInitStore, setPeople, worldUnit, lwHistInit } from '../leavewar/state/store'
import { memoryBackend, type StorageBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { foreignWar } from '../leavewar/state/foreign'
import { wireLeaveWarSync, setWarWorldDoor, swapWarWorld } from '../leavewar/sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
let ISNAP = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
let worlds: Record<string, StorageBackend> = {}
const profile = (u: string, pid: string): any => { const v = worlds[u]!.read('profile:' + pid); return v ? JSON.parse(v) : null }

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE); ISNAP = JSON.stringify(INPUTS) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  worlds = { u142: memoryBackend(), u149: memoryBackend() }
  setWarWorldDoor(null)
  lwInitStore(worlds.u142)
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})
afterEach(() => { setConflictChecker(null); _resetTimeline(); resetSession(null); vi.restoreAllMocks() })

describe("SEC-5 — an Overseas Sqn posting for the master by 142's plain admin, through the A3 store", () => {
  const window = { id: 'stiff', from: null, to: '2026-07-14', poArchive: true }
  it('control: written as the war\'s own posting record, the gate refuses it (7b)', () => {
    signInAs('ad2', 'a2')
    expect(worldUnit()).toBe('u142')
    const e: any = { seq: 1, at: '', origin: 'local', scope: { module: 'leavewar' }, type: 'lw.postout', actor: deriveActor(),
      changes: [{ op: 'put', collection: 'lw.postouts', id: 'stiff', before: null, after: window }] }
    expect(ownershipViolation(e)).toMatch(/master admin/)
  })
  it('…the same posting as `lwx.profile/u142@stiff` is refused too (gate)', () => {
    signInAs('ad2', 'a2')
    const e: any = { seq: 1, at: '', origin: 'local', scope: { module: 'leavewar' }, type: 'lw.postout', actor: deriveActor(),
      changes: [{ op: 'put', collection: 'lwx.profile', id: 'u142@stiff', before: null, after: window }] }
    expect(ownershipViolation(e)).not.toBeNull()
  })
  it('…and end to end: the command is refused, 142\'s stored war keeps no posting for Saber, and the next load leaves him in', () => {
    signInAs('ad2', 'a2')
    const r = commit({
      type: 'lw.postout', scope: { module: 'leavewar' } as any, meta: null,
      apply: (txn: any) => {
        const fw = foreignWar('u142')
        fw.load('stiff')
        txn.enlist(fw)
        const cur: any = fw.post('stiff') ?? getState().people.find(p => p.id === 'stiff')
        fw.setPost('stiff', { ...cur, to: '2026-07-14', poArchive: true })
      },
    } as any) as any
    const stored = profile('u142', 'stiff')
    swapWarWorld('u149'); swapWarWorld('u142')     // 142's war loaded afresh: its passes run
    const saber: any = (PEOPLE as any).stiff
    const acct = accountById('acad')!
    const report = { ok: r.ok, storedTo: stored?.post?.to ?? null, archived: !!saber.archived, archivedBy: saber.archivedBy ?? null, acctOn: acct.on, offBy: (acct as any).offBy ?? null }
    expect(report).toEqual({ ok: false, storedTo: null, archived: false, archivedBy: null, acctOn: true, offBy: null })
  })
  it("the second store is Admin → Users' doors' only: the master's own `lwx` row for a 149 man in a war command is refused", () => {
    signInAs('ad', 'a')
    const e: any = { seq: 1, at: '', origin: 'local', scope: { module: 'leavewar' }, type: 'lw.bid', actor: deriveActor(),
      changes: [{ op: 'put', collection: 'lwx.ledger', id: 'u149@x1', before: null, after: { id: 'x1', personId: 'osp9', counter: 'oil', amount: 5, date: '2026-07-15' } }] }
    expect(ownershipViolation(e)).toMatch(/second store/)
  })
  it('…and never for the war loaded: the master\'s Archive writing 142\'s rows through it is refused', () => {
    signInAs('ad', 'a')
    expect(worldUnit()).toBe('u142')
    const e: any = { seq: 1, at: '', origin: 'local', scope: { module: 'people' }, type: 'person.archive', actor: deriveActor(),
      changes: [{ op: 'put', collection: 'lwx.ledger', id: 'u142@x1', before: null, after: { id: 'x1', personId: 'acer', counter: 'oil', amount: 5, date: '2026-07-15' } }] }
    expect(ownershipViolation(e)).toMatch(/war loaded/)
  })
})
