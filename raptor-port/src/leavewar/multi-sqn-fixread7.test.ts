// @vitest-environment jsdom
/* Fix read 7 (19 Nov 26) — the faults the four readers found in fix read 6's code (the builder's brief:
   docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread7-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read. Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber is the
   master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as leavewar/multi-sqn-fixread6-retired.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { initStore as lwInitStore, setPeople } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { unitsLoad } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo } from '../undo/timeline'
import { globalUndo } from '../undo'

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

const IID = 'ipd-fr7'
const fileFor = (who: string, filer: string, date = 'Jul 25', endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const del = () => expect(writeInputsBatch(() => { const i = INPUTS.findIndex((x: any) => x.iid === IID); INPUTS.splice(i, 1) })).toBe(true)
const theInput = () => INPUTS.find((x: any) => x.iid === IID) as any
/* a man's home rows, as state/units.ts setHome saves them: [unit, from] in order (the first covers every day before it) */
const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}
const on = (d: number) => { vi.setSystemTime(new Date(2026, 6, d, 9, 0, 0)); unitsLoad() }
const lineTo = (pid: string): Notice | undefined => NOTICES.find(n => n.to === pid && n.iid === IID)
const linesTo = (pid: string): Notice[] => NOTICES.filter(n => n.to === pid && n.iid === IID)
const env = (changes: any[], origin = 'user', type = 'inputs.batch'): any => ({ type, origin, actor: deriveActor(), changes })

describe('fault U — a member’s Undo of his own step on an input someone else filed for him', () => {
  it('(Opus F1, Fable 1) Ranger deletes the LL Hunter filed for him, then Undo and Redo: both go through', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('us', 'us'); del()
    const l = lineTo('prowler')!
    expect(l, 'Hunter told it was deleted').toBeDefined()
    expect(l.fu).toEqual(['u142'])
    const u = globalUndo(); expect(u.ok, 'Undo: ' + JSON.stringify(u)).toBe(true)
    expect(theInput(), 'the leave is back').toBeDefined()
    expect(NOTICES.some(n => n.id === l.id), 'the line went with it').toBe(false)
    const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
    expect(theInput(), 'deleted again').toBeUndefined()
    expect(NOTICES.find(n => n.id === l.id)?.fu, 'the line back, its mark with it').toEqual(['u142'])
  })
  it('(Opus F2) Ranger changes its remark, Hunter moves to 149 from 16 Jul, on 16 Jul Ranger’s Undo and Redo go through', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('us', 'us'); rmk('Ranger words')
    const l = lineTo('prowler')!
    expect(l, 'Hunter told as its filer').toBeDefined()
    homes('prowler', 'hu', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
    const u = globalUndo(); expect(u.ok, 'Undo: ' + JSON.stringify(u)).toBe(true)
    expect(theInput().remarks).toBe('for him')
    const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
    expect(theInput().remarks).toBe('Ranger words')
  })
  it('(control) a restore the timeline does not vouch for may not take Ranger’s line to Hunter away', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('us', 'us'); rmk('Ranger words')
    const l = lineTo('prowler')!
    homes('prowler', 'hu', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
    /* the same two changes his Undo would make, but never made by his timeline: the remark put back, the line taken */
    const now = { ...theInput() }
    const forged = env([
      { collection: 'inputs', id: IID, op: 'put', before: now, after: { ...now, remarks: 'for him' } },
      { collection: 'notices', id: l.id, op: 'delete', before: { ...l }, after: null },
    ], 'restore', 'undo.restore')
    expect(ownershipViolation(forged) ?? 'allowed').toMatch(/not his own change/)
    /* …nor anyone else's line (one Hunter made to Ranger, say), timeline or not */
    const other = { ...l, id: 'nfr7-u', to: 'bane', by: 'prowler' }
    expect(ownershipViolation(env([forged.changes[0], { collection: 'notices', id: other.id, op: 'delete', before: other, after: null }], 'restore', 'undo.restore')) ?? 'allowed').toMatch(/not his own change/)
  })
})
