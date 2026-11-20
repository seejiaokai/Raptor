// @vitest-environment jsdom
/* (the harness below is fix read 14's, copied whole; its header describes fix read 13's file it was copied from) */
/* Fix read 13 (20 Nov 26) — the faults the readers found in fix read 12's code, and his D2228 (the builder's brief:
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread13-fixes-brief.md). Each describe is one item, red first on the
   code the readers read (3d9743036). Hunter (142's plain admin, `ad2`, person `prowler`); Saber the master (`ad`, person
   `stiff`); Ranger (142, `us`, account `acus`, person `bane`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as
   leavewar/multi-sqn-fixread12.test.ts; the readers' set-ups copied, never imported. */
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
import { commitPeopleEdit } from '../state/people-settings-commit'

const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}

/* Fix read 15 (20 Nov 26, chat 122) — the readers' claims on fix read 14's fixes, each written as a test before it is
   believed (the readers' brief: docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread15-brief.md). Same harness as
   leavewar/multi-sqn-fixread14.test.ts (copied above, never imported). */

/* SEC15-1 (the security reader): fix read 14's item A carried memory's `acc` whatever its value — but a week load's
   landing writes only 'g'; 'u' (Unavailable) and 'r' (Remove) are a scheduler's real filings (D1388) */
describe("SEC15-1 — a member's edit then Undo never clears or changes a scheduler's filing of his own leave", () => {
  let WB: Whiteboard
  const stored = (id: string): any => { const v = WB.get('inputs', id); return v ? JSON.parse(v) : null }
  beforeEach(() => { WB = new Whiteboard(); wireRows(WB); writeSeedRows(WB) })
  afterEach(() => { setStoredRowProbe(null); setStoredRowsWhole(false) })
  const removed = (IID: string) => {
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'mine', by: 'bane', at: Date.now(), iid: IID, ord: 99958 } as any) })).toBe(true)
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { (INPUTS.find((r: any) => r.iid === IID) as any).acc = 'r' }), "Hunter removes it from the programme").toBe(true)
    expect(stored(IID)?.acc).toBe('r')
    signInAs('us', 'us')
    return INPUTS.find((r: any) => r.iid === IID) as any
  }
  for (const [label, mem] of [['cleared', undefined], ["'u' over it", 'u']] as const) {
    it(`the Remove ${label} in memory, an honest edit keeping it, then Undo — the saved row still 'r'`, () => {
      const x = removed('ipd-sec15-' + (mem ?? 'none'))
      if (mem === undefined) delete x.acc; else x.acc = mem               // outside every command
      const ok = writeInputsBatch(() => { x.acc = 'r'; x.remarks = 'mine, changed' })
      if (ok) globalUndo()
      expect(stored(x.iid)?.acc, 'the saved row').toBe('r')
    })
  }
  it('(control) clearing the Remove straight off his own leave: refused, the saved row keeps it', () => {
    const x = removed('ipd-sec15-ctl')
    expect(writeInputsBatch(() => { delete x.acc; x.remarks = 'mine, changed' })).toBe(false)
    expect(stored(x.iid)?.acc).toBe('r')
  })
  /* (the week load's own 'g' landing: fix read 14's file, its honest control, rewritten with 'g' this round) */
  it("(honest, Fable's P4) Hunter's own edit of the removed leave's words, then Undo: the words back, the Remove kept — saved and in memory", () => {
    const x = removed('ipd-sec15-adm')
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { x.remarks = 'Hunter changed it' })).toBe(true)
    expect(globalUndo().ok).toBe(true)
    const y: any = INPUTS.find((r: any) => r.iid === x.iid)
    expect({ remarks: y.remarks, acc: y.acc, saved: stored(x.iid)?.remarks, savedAcc: stored(x.iid)?.acc }).toEqual({ remarks: 'mine', acc: 'r', saved: 'mine', savedAcc: 'r' })
  })
})
