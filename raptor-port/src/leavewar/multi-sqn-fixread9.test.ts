// @vitest-environment jsdom
/* Fix read 9 (19–20 Nov 26) — the faults the readers found in fix read 8's code (the builder's brief:
   docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread9-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (ae1af3806). Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber
   is the master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`); Outlaw (`casper`) a 142 man. Harness as
   leavewar/multi-sqn-fixread8.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store as settingsStore } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST } from '../state/accounts'
import { initStore as lwInitStore, setPeople, setCell, setBidState } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut } from './sync'
import { unitsLoad, setGrant, removeGrant, addUnit, unitRows } from '../state/units'
import { HOME_PFX, GRANT_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, noticeLeftBell, type Notice } from '../state/notices'
import { setConflictChecker, onCommit } from '../command'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo } from '../undo/timeline'
import { globalUndo } from '../undo'
import { deletePerson } from '../state/person-delete'
import { addRosterPerson } from '../state/roster-add'
import { commitSettingsIntent } from '../state/people-settings-commit'

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

const IID = 'ipd-fr9'
const fileFor = (who: string, filer: string, date = 'Jul 25', endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const theInput = () => INPUTS.find((x: any) => x.iid === IID) as any
/* a man's home rows, as state/units.ts setHome saves them: [unit, from] in order (the first covers every day before it) */
const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}
const on = (d: number, h = 9, m = 0) => { vi.setSystemTime(new Date(2026, 6, d, h, m, 0)); unitsLoad() }
const lineTo = (pid: string): Notice | undefined => NOTICES.find(n => n.to === pid && n.iid === IID)
const shown = (pid: string, id: string) => noticesFor(pid).some(n => n.id === id)
/* Outlaw (`casper`) as a plain 142 admin — as the gate reads an actor (fix read 7's harness) */
const outlaw = { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null }
const asOutlaw = (changes: any[], type = 'inputs.batch'): any => ({ type, origin: 'user', actor: outlaw, changes })
/* …and made one on his account too, where the gate's unit-row check reads the account list */
const outlawReal = () => { signInAs('ad2', 'a2'); expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull() }
const put = (n: any) => ({ collection: 'notices', id: n.id, op: 'put', before: null, after: n })
/* Hunter files for Ranger; Saber's change on 15 Jul tells him (filer only, marked 142) */
const hunterLine = (): Notice => {
  signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
  signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
  const l = lineTo('prowler')!
  expect(l?.fu, 'Hunter told as its filer').toEqual(['u142'])
  return l
}
const hunterMovesOn16 = () => homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
/* Ranger (142 member) files a Training for Ace (142) — the input a bare write then touches */
const aceTraining = () => { signInAs('us', 'us'); expect(writeInputsBatch(() => { INPUTS.push({ person: 'dj', date: 'Jul 25', yr: 2026, s: '09:00', e: '10:00', type: 'Training', remarks: 'for Ace', by: 'bane', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true) }
/* the seeded account row: an Undo of its first stored write removes the row (seed mode only), so read it softly */
const hunterAcct = (): any => ACCOUNTS_LIST.find(a => a.id === 'acad2') ?? {}

describe('fault A — an Undo or Redo that turns a right on dates it today (his D2218, D2223; Fable 1, Opus O9-2)', () => {
  it('(Fable F1) the mark set and undone on 15 Jul, Hunter moves 16 Jul, Redo on 17 Jul: dated the 17th, the retired line stays off', () => {
    const l = hunterLine()
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    expect(globalUndo().ok, 'Undo of the mark').toBe(true)
    expect(hunterAcct().master).not.toBe(true)
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'retired by his move').toBe(false)
    const r = globalRedo(); expect(r.ok, 'Redo of the mark: ' + JSON.stringify(r)).toBe(true)
    expect(hunterAcct().master).toBe(true)
    expect(hunterAcct().masterFrom, 'the mark given back today is dated today').toBe('2026-07-17')
    expect(shown('prowler', l.id), 'a mark given back on the 17th must not bring the retired line back (D2218)').toBe(false)
  })
  it('(Fable F1b) the mark on, then off, on 15 Jul; Hunter moves; the Undo of taking it off on 17 Jul: the line stays off', () => {
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    const l = hunterLine()
    signInAs('ad', 'a'); expect(setMaster('acad2', false).ok).toBe(true)
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'retired by his move').toBe(false)
    const u = globalUndo(); expect(u.ok, 'Undo of taking the mark off: ' + JSON.stringify(u)).toBe(true)
    expect(hunterAcct().master).toBe(true)
    expect(shown('prowler', l.id), 'still off (D2218)').toBe(false)
  })
  it('(Opus O9-2) the mark set and taken off on 15 Jul, Hunter moves, Saber undoes the taking-off on 18 Jul: dated the 18th, the line stays off', () => {
    const l = hunterLine()
    signInAs('ad', 'a')
    expect(setMaster('acad2', true).ok).toBe(true)
    expect(setMaster('acad2', false).ok).toBe(true)
    hunterMovesOn16(); on(18)
    expect(shown('prowler', l.id)).toBe(false)
    const r = globalUndo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(hunterAcct().master, 'the mark is back').toBe(true)
    expect(hunterAcct().masterFrom).toBe('2026-07-18')
    expect(shown('prowler', l.id), 'he held no mark on his move day — the line stays retired (fault D)').toBe(false)
  })
  it('(a grant) Plan of 149 given and removed on 15 Jul, Hunter moves to a third squadron on 16 Jul, the Undo of the removal on 17 Jul: dated the 17th, the line stays off', () => {
    signInAs('ad', 'a'); const u150 = addUnit('150', 'p1'); expect(u150.ok, JSON.stringify(u150)).toBe(true)
    signInAs('ad', 'a'); expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2'); fileFor('osp9', 'prowler')
    signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
    const l = lineTo('prowler')!
    expect(l?.fu, 'Hunter told through Plan of 149').toEqual(['u149'])
    expect(removeGrant('acad2', 'u149').ok).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-15'], [String((u150 as any).id), '2026-07-16']]); on(17)
    expect(shown('prowler', l.id), 'retired by his move: no Plan of 149 on the 16th').toBe(false)
    const r = globalUndo(); expect(r.ok, 'Undo of the removal: ' + JSON.stringify(r)).toBe(true)
    expect(unitRows().grants.find(g => g.account === 'acad2' && g.unit === 'u149')?.from, 'the right given back today is dated today').toBe('2026-07-17')
    expect(shown('prowler', l.id), 'the line stays retired').toBe(false)
  })
  it('(control) an Undo that leaves the mark on keeps its day', () => {
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    expect(updateAccount('acad2', { name: 'ad2x' })).toBeNull()
    on(17)
    const u = globalUndo(); expect(u.ok, 'Undo of the rename: ' + JSON.stringify(u)).toBe(true)
    expect(hunterAcct().name).toBe('ad2')
    expect(hunterAcct().masterFrom, 'the mark stood throughout: its own day').toBe('2026-07-15')
  })
  it('(control) a fresh setMaster and setGrant are dated today, as before', () => {
    hunterMovesOn16(); on(18)
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
    expect(unitRows().grants.find(g => g.account === 'acad2')?.from).toBe('2026-07-18')
    expect(setMaster('acad2', true).ok).toBe(true)
    expect(hunterAcct().masterFrom).toBe('2026-07-18')
  })
})
