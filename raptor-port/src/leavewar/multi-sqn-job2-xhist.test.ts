// @vitest-environment jsdom
/* JOB 2 (19 Nov 26), Astra's 4 — the master's Delete of a 149 man with 142's war loaded takes his future bids and OIL
   awards out of 149's stored war through the second store (`lwx.rec`, `lwx.ledger` — A3), but the change history read
   only the war's own collections (`lw.cell`, `lw.ledger`), so the bids and awards left with no line (D337: each its own
   line on its own day). Now the second store's changes are told as the war's own are, in the man's squadron's history.
   Setup as multi-sqn-a3-foreign.test.ts (its head copied); the proof is Astra's
   (docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-astra.md). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store } from '../engine/hooks'
import { elogFlush } from '../engine/editlog'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { deletePerson } from '../state/person-delete'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setConflictChecker } from '../command'
import { initStore as lwInitStore, setPeople, worldUnit, setCell, grantOil, lwHistInit } from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
let ISNAP = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => { signInAs('ad', 'a'); expect(worldUnit()).toBe('u142') }
const kestrel = () => { signInAs('ad9', 'a9'); expect(worldUnit()).toBe('u149') }
let worlds: Record<string, StorageBackend> = {}
/* his stored war records' dates (each `rec:` row carries its person and date) */
const recDates = (u: string, pid: string): string[] => worlds[u]!.keys().filter(k => k.startsWith('rec:'))
  .map(k => JSON.parse(worlds[u]!.read(k)!)).filter(r => r.pid === pid).map(r => String(r.date)).sort()
const awardDates = (u: string, pid: string): string[] => worlds[u]!.keys().filter(k => k.startsWith('ledger:'))
  .map(k => JSON.parse(worlds[u]!.read(k)!)).filter(e => e.personId === pid && e.counter === 'oil' && e.amount > 0).map(e => String(e.date)).sort()

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE)
  ISNAP = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                       // Wed 15 Jul 26
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

describe("Astra 4 — the master deletes a 149 man with 142's war loaded: his bids and awards each get their line", () => {
  it("149's history names the bid and the OIL award the delete took, each on its own day", () => {
    kestrel()
    expect(setCell('osp9', '2026-08-10', 'LL')).toBe(true)
    expect(grantOil(['osp9'], 1, '2026-08-03', 'future')).toBeNull()
    saber()
    elogFlush()
    const before = new Set(store.keys('elog:'))
    expect(deletePerson('osp9')).toBeNull()
    elogFlush()
    const added = store.keys('elog:').filter(k => !before.has(k)).map(k => store.get(k, null)) as any[]
    expect(recDates('u149', 'osp9').filter(d => d >= '2026-07-15'), 'the bid left 149’s stored war').toEqual([])
    expect(awardDates('u149', 'osp9').filter(d => d >= '2026-07-15'), 'the award left it too').toEqual([])
    expect(added.some(x => x.u === 'u149' && x.sub === 'osp9' && x.date === '2026-08-10' && x.fld === 'deleted' && x.itype === 'LL'), JSON.stringify(added.map(x => [x.u, x.date, x.lbl]))).toBe(true)
    expect(added.some(x => x.u === 'u149' && x.sub === 'osp9' && x.date === '2026-08-03' && /OIL award taken away/.test(x.lbl))).toBe(true)
  })
})
