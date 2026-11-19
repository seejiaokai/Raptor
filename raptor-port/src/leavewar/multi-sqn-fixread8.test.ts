// @vitest-environment jsdom
/* Fix read 8 (19 Nov 26) — the faults the four readers found in fix read 7's code (the builder's brief:
   docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread8-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (71fdfbfd5). Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber
   is the master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as leavewar/multi-sqn-fixread7.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST } from '../state/accounts'
import { initStore as lwInitStore, setPeople } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { unitsLoad, setGrant, unitRows } from '../state/units'
import { HOME_PFX, GRANT_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, noticeLeftBell, notePassMade, type Notice } from '../state/notices'
import { onCommit } from '../command'
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

const IID = 'ipd-fr8'
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
const env = (changes: any[], origin = 'user', type = 'inputs.batch'): any => ({ type, origin, actor: deriveActor(), changes })
const readIt = (pid: string, l: Notice) => { mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }
const shown = (pid: string, id: string) => noticesFor(pid).some(n => n.id === id)
/* Outlaw (`casper`) as a plain 142 admin — as the gate reads an actor (fix read 7's harness) */
const outlaw = { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null }
const asOutlaw = (changes: any[], type = 'inputs.batch'): any => ({ type, origin: 'user', actor: outlaw, changes })
/* …and made one on his account too, where the gate's unit-row check reads the account list (Fable's harness remark) */
const outlawReal = () => { signInAs('ad2', 'a2'); expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull() }
/* his remark change of the LL, as a change of the input */
const remarkChange = (words = 'Outlaw words') => { const now = { ...theInput() }; return { collection: 'inputs', id: IID, op: 'put', before: now, after: { ...now, remarks: words } } }
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

describe('fault R — a filer who has moved is not told again, and his old line leaves (his D2218, D2223, D2225)', () => {
  /* Ranger's LL 23–27 Jul; Ranger's move to 149 saved from 25 Jul */
  const rangerMovesOn25 = () => homes('bane', 'hrq', [['u142', '2026-07-15'], ['u149', '2026-07-25']])
  it('(Opus Q-1) Hunter, 149’s from 16 Jul, is not told on 17 Jul of Saber’s change to the LL he filed for Ranger', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    rangerMovesOn25(); hunterMovesOn16(); on(17)
    signInAs('ad', 'a'); rmk('Saber words')
    expect(lineTo('prowler'), 'Hunter, moved, not told').toBeUndefined()
  })
  it('(Opus Q-2) the line Hunter got on 15 Jul, before his move, leaves his bell on his move', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    rangerMovesOn25()
    signInAs('ad', 'a'); rmk('Saber words')
    const l = lineTo('prowler')!
    expect(l, 'told on the 15th').toBeDefined()
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'his old squadron’s line left on his move (D2218)').toBe(false)
    expect(l.fu, 'marked with the squadron he was told through: his home').toEqual(['u142'])
  })
  it('(control) a master filer is still told after his move, through the mark', () => {
    signInAs('ad', 'a'); fileFor('bane', 'stiff')
    homes('stiff', 'hs8', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
    signInAs('ad2', 'a2'); rmk('Hunter words')
    expect(lineTo('stiff')?.fu, 'Saber told as master').toEqual(['u142'])
  })
})

describe('fault D — a right given ON the move day never brings the retired line back', () => {
  for (const read of [false, true]) {
    it(`(Fable 2, Opus 2) Plan of 142 given on 16 Jul, his move day: the ${read ? 'read' : 'unread'} line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      hunterMovesOn16(); on(16)
      expect(shown('prowler', l.id), 'retired by his move').toBe(false)
      signInAs('ad', 'a')
      expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
      expect(shown('prowler', l.id), 'still off after Plan given on his move day').toBe(false)
    })
    it(`(Fable 2, Opus 2) master mark set on 16 Jul, his move day: the ${read ? 'read' : 'unread'} line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      hunterMovesOn16(); on(16)
      expect(shown('prowler', l.id)).toBe(false)
      signInAs('ad', 'a')
      expect(setMaster('acad2', true).ok).toBe(true)
      expect(shown('prowler', l.id), 'still off after the master mark set on his move day').toBe(false)
    })
  }
  it('(control) the master mark set the day before his move keeps the line, and so does Plan held from then', () => {
    const l = hunterLine()
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'a master on his move day: still told').toBe(true)
    signInAs('ad', 'a'); on(17); expect(setMaster('acad2', false).ok).toBe(true)
    mem['sqn142_' + GRANT_PFX + 'gfr8d'] = JSON.stringify({ id: 'gfr8d', account: 'acad2', unit: 'u142', level: 'admin', from: '2026-07-15' }); unitsLoad()
    expect(shown('prowler', l.id), 'Plan of 142 from the day before: still told').toBe(true)
  })
})

