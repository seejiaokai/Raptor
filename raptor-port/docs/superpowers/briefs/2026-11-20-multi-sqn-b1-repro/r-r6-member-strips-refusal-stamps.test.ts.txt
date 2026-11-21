// @vitest-environment jsdom
/* REPRO R6 — a member's own command removes the refusal's maker and time from his refused bid and is accepted (astra 4).
   Correct (D1177: the admin decides bids; S16-2's rule, a member never undoes or alters an admin's decision on his own
   bid): the commit gate refuses it. RED while the claim holds. Gate-direct, as fix read 16's S16-2 tests are; a forged
   command — no screen writes it. Harness: leavewar/multi-sqn-fixread16.test.ts lines 9-84, copied whole. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, ACCOUNTS_LIST } from '../state/accounts'
import { initStore as lwInitStore, setPeople, getState } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, runPoOutcomes, undoPostOut } from '../leavewar/sync'
import { unitsLoad, setGrant, setHome, unitRows, homeOn } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { accountOfPid } from '../state/accounts'
import { commit } from '../command'
import { peopleStore, finishPeopleWrite } from '../state/people-settings-commit'
import { resyncBeforeEnlist } from '../state/sched-commit'
import { deletePerson } from '../state/person-delete'
import { updatePersonField } from '../state/quals-write'
import { placeApproved, inOneWarCommand, setRemarksOn } from '../leavewar/state/store'
import { leaveInputsAt } from '../leavewar/sync'
import { setLeaveRemarks } from '../ui/inputedit'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, filerVia } from '../state/notices'
import { onCommit } from '../command'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalUndo } from '../undo/timeline'
import { commitInputsWith } from '../state/sched-commit'
import { Whiteboard } from '../storage/whiteboard'
import { wireRows, writeSeedRows } from '../state/persist'
import { setStoredRowProbe, setStoredRowsWhole, ownershipViolation } from '../state/perms'

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
  NOTICES.splice(0)
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  _resetTimeline(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})

const on = (d: number, h = 9, m = 0) => { vi.setSystemTime(new Date(2026, 6, d, h, m, 0)); unitsLoad() }
const grantsOf = (id: string) => unitRows().grants.filter(g => g.account === id)
const passTypes = () => {
  const seen: string[] = []
  const off = onCommit((e: any) => { seen.push(e.type) })
  try { runPoOutcomes() } finally { off() }
  return seen
}
import { setCell, setBidStates } from '../leavewar/state/store'
import { changeAbsenceById } from '../leavewar/state/store'
import { foldedInto } from '../state/notices'

import { setLwDayOpenProbe, ownershipViolation as ov } from '../state/perms'
describe("R6 — a member's own command never removes who refused his bid and when", () => {
  afterEach(() => { setLwDayOpenProbe(null) })
  const T = Date.now()
  const refused = { id: 'rq1', kind: 'request', code: 'LL', state: 'refused', placedBy: 'bane', placedAt: T - 3600_000, decidedBy: 'prowler', decidedAt: T - 60_000 }
  const env = (before: any[], after: any[]): any => ({
    seq: 0, at: '', type: 'lw.edit', origin: 'user', scope: { module: 'lw', warId: 'y2026' },
    actor: { id: 'acus', role: 'member', personId: 'bane', session: {} },
    changes: [{ op: 'put', collection: 'lw.cell', id: 'y2026:bane:2026-07-28', before, after }],
  })
  it('both stamps removed, still refused: refused by the gate', () => {
    setLwDayOpenProbe(() => true)
    const { decidedBy: _b, decidedAt: _a, ...rest } = refused
    expect(ov(env([refused], [{ ...rest }]))).not.toBeNull()
  })
  it('the maker alone removed: refused by the gate', () => {
    setLwDayOpenProbe(() => true)
    const { decidedBy: _b, ...rest } = refused
    expect(ov(env([refused], [{ ...rest }]))).not.toBeNull()
  })
  it('the time alone removed: refused by the gate', () => {
    setLwDayOpenProbe(() => true)
    const { decidedAt: _a, ...rest } = refused
    expect(ov(env([refused], [{ ...rest }]))).not.toBeNull()
  })
  it('(control) the maker changed to himself: refused (the stamps are compared when present)', () => {
    setLwDayOpenProbe(() => true)
    expect(ov(env([refused], [{ ...refused, decidedBy: 'bane' }]))).not.toBeNull()
  })
  it('(control) his own refused bid cleared off the day: allowed', () => {
    setLwDayOpenProbe(() => true)
    expect(ov(env([refused], []))).toBeNull()
  })
})
