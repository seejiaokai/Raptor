// @vitest-environment jsdom
/* Fix read 10 (20 Nov 26) — the faults the readers found in fix read 9's code (the builder's brief:
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread10-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (945c6de69). Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber
   is the master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`); Outlaw (`casper`) a 142 man. Harness as
   leavewar/multi-sqn-fixread9.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store as settingsStore } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST, accountOfPid } from '../state/accounts'
import { initStore as lwInitStore, setPeople, setCell, setBidState, getState, openDates, worldUnit } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut } from './sync'
import { unitsLoad, setGrant, removeGrant, addUnit, homeOn } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, noticeLeftBell, noticeHoliday, noticeWar, noticePosting, noticeAboutHim, type Notice } from '../state/notices'
import { onCommit } from '../command'
import { noticeSeenLoad, markNoticeRead } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo } from '../undo/timeline'
import { globalUndo } from '../undo'
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

const IID = 'ipd-fr10'
const fileFor = (who: string, filer: string, date = 'Jul 25', endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
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
/* the seeded account row: an Undo of its first stored write removes the row (seed mode only), so read it softly */
const hunterAcct = (): any => ACCOUNTS_LIST.find(a => a.id === 'acad2') ?? {}
const kind = (n: Notice | undefined) => (n?.what || [])[0]?.k
const readIt = (pid: string, l: Notice) => { mem['sqn142_noticeseen:' + pid] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }

describe('fault A — a war line only as the war\'s own change owes it (SEC10-1, Fable F10-1, F10-2, Astra)', () => {
  it('(SEC10-1) Outlaw calls noticeWar inside an ordinary input command: a made-up "your leave refused" line on Hunter is not saved', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => { noticeWar(['prowler'], 'casper', { k: 'lw', c: 'LL', d: 'refused', a: '2026-07-25', b: '2026-07-25' } as any) })
    const n = NOTICES.find(x => x.to === 'prowler' && kind(x) === 'lw')
    on(17)
    expect({ saved: ok && !!n, shownOn17: !!n && shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(SEC10-1) …and noticePosting: a made-up "Ace posted overseas" line to 142\'s admins is not saved', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => { noticePosting(['ad2x', 'prowler'], 'dj', 'overseas' as any, '2026-07-15', false) })
    const n = NOTICES.find(x => x.to === 'prowler' && kind(x) === 'po')
    expect({ saved: ok && !!n }).toEqual({ saved: false })
  })
  it('(Fable F10-1) a line with no parts and no input, in Outlaw\'s own words on Hunter: not saved, not shown after his move', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    signInAs('outlaw', 'x')
    const n: any = { id: 'nf10-e', to: 'prowler', by: 'casper', at: Date.now(), iid: '', name: '149: report to Kestrel 0600 Sat', day: '2026-07-25', what: [] }
    const ok = writeInputsBatch(() => { NOTICES.push(n) })
    on(17)
    expect({ saved: ok && NOTICES.some(x => x.id === n.id), shownOn17: shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(Fable F10-1) the gate refuses a line whose one part is null, and such a line is not about its reader', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    const n: any = { id: 'nf10-n', to: 'prowler', by: 'casper', at: Date.now(), iid: '', name: 'x', day: '2026-07-25', what: [null] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').not.toBe('allowed')
    expect(noticeAboutHim(n)).toBe(false)
  })
  it('(Fable F10-2) an lw part riding the telling door on a line naming the input the command changes: refused', () => {
    outlawReal(); signInAs('outlaw', 'x')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'prowler', date: 'Jul 15', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: 'casper', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
    hunterMovesOn16(); on(15, 10)
    signInAs('outlaw', 'x')
    const n: any = { id: 'nf10-w', to: 'prowler', by: 'casper', at: Date.now(), iid: IID, name: 'Your leave', day: '2026-12-01', what: [{ k: 'lw', c: 'OL', a: '2026-12-01', b: '2026-12-31', d: 'refused' }] }
    const ok = writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'y'; NOTICES.push(n) })
    on(17)
    expect({ saved: ok && NOTICES.some(x => x.id === n.id), shownOn17: shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(Fable F10-2, gate) the same line put beside a change of that input: refused', () => {
    outlawReal(); signInAs('outlaw', 'x')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'prowler', date: 'Jul 15', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: 'casper', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
    on(15, 10)
    const b = JSON.parse(JSON.stringify(INPUTS.find((x: any) => x.iid === IID)))
    const n: any = { id: 'nf10-w', to: 'prowler', by: 'casper', at: Date.now(), iid: IID, name: 'Your leave', day: '2026-12-01', what: [{ k: 'lw', c: 'OL', a: '2026-12-01', b: '2026-12-31', d: 'refused' }] }
    expect(ownershipViolation(asOutlaw([{ collection: 'inputs', id: IID, op: 'put', before: b, after: { ...b, remarks: 'y' } }, put(n)])) ?? 'allowed').not.toBe('allowed')
  })
  it('(control) a real decision on Ranger\'s leave tells him', () => {
    signInAs('ad2', 'a2')
    expect(setCell('bane', '2026-07-25', 'LL')).toBe(true)
    setBidState('bane', '2026-07-25', 'refused')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lw')
    expect(l, 'Ranger told of the refusal').toBeDefined()
    expect((l!.what[0] as any).d).toBe('refused')
  })
  it('(control) bidding opened tells the war\'s people; read, its Undo says "taken back" and its Redo tells it again', () => {
    signInAs('ad2', 'a2')
    const day = getState().period.end
    expect(openDates(day, day)).toBe('set')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lwopen')
    expect(l, 'Ranger told bidding opened').toBeDefined()
    readIt('bane', l!)
    expect(globalUndo().ok).toBe(true)
    expect(NOTICES.some(n => n.to === 'bane' && kind(n) === 'lwback' && (n.what[0] as any).ref === l!.id), 'taken back').toBe(true)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(NOTICES.filter(n => n.to === 'bane' && kind(n) === 'lwopen').length, 'told again').toBeGreaterThanOrEqual(1)
  })
  it('(control) a decision read, its Undo says "taken back", its Redo "again"', () => {
    signInAs('ad2', 'a2')
    expect(setCell('bane', '2026-07-25', 'LL')).toBe(true)
    setBidState('bane', '2026-07-25', 'refused')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lw')!
    readIt('bane', l)
    expect(globalUndo().ok).toBe(true)
    expect(NOTICES.some(n => n.to === 'bane' && kind(n) === 'lwback' && (n.what[0] as any).ref === l.id), 'taken back').toBe(true)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(NOTICES.some(n => n.to === 'bane' && kind(n) === 'lw' && (n.what[0] as any).again === true && (n.what[0] as any).ref === l.id), 'again').toBe(true)
  })
  it('(control) a posting run today tells the admins, and its Undo post out says "taken back" to one who read it', () => {
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)
    const l = NOTICES.find(n => n.to === 'prowler' && kind(n) === 'po' && (n.what[0] as any).who === 'bane')
    expect(l, 'Hunter told of the posting').toBeDefined()
    signInAs('ad2', 'a2'); expect(markNoticeRead(l!.id)).toBe(true)
    signInAs('ad', 'a')
    expect(undoPostOut('bane')).toBe(true)
    expect(NOTICES.some(n => n.id === l!.id), 'its line gone').toBe(false)
    expect(NOTICES.filter(n => n.to === 'prowler' && kind(n) === 'poback').length, 'Hunter told "taken back"').toBe(1)
  })
})

describe('fault B — a new holiday line passes as the holiday\'s own only where noticeHoliday made it (O10-2, SEC10-3)', () => {
  it('(Opus O10-2) Outlaw puts a made-up holiday line on Kestrel\'s (149) bell, signed as Kestrel: refused, not saved', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const n: any = { id: 'nforge-hol', to: 'kes9', by: 'kes9', at: Date.now(), iid: '', name: '149: all leave cancelled, report 0600', day: '2026-07-25', what: [{ k: 'oilhol', a: '2026-07-25', b: '2026-07-25' }] }
    const v = ownershipViolation(asOutlaw([put(n)]))
    const ok = writeInputsBatch(() => { NOTICES.push(n) })
    expect({ gate: v ?? 'allowed', saved: ok && NOTICES.some(x => x.id === n.id) }).toEqual({ gate: expect.stringMatching(/./), saved: false })
  })
  it('(Opus O10-2) …and on a 142 member who is no scheduler, signed as Saber: refused', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const n: any = { id: 'nforge-hol2', to: 'bane', by: 'ad', at: Date.now(), iid: '', name: 'made-up words', day: '2026-07-25', what: [{ k: 'oilhol', a: '2026-07-25', b: '2026-07-25' }] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').not.toBe('allowed')
  })
  it('(SEC10-3) Outlaw puts a holiday line on Osprey (a 149 member) signed as Kestrel: refused', () => {
    outlawReal()
    const n: any = { id: 'nsec10-h', to: 'us9', by: 'kes9', at: Date.now(), iid: '', name: '149 stand-down', day: '2026-08-09', what: [{ k: 'oilhol', a: '2026-08-09', b: '2026-08-09' }] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').not.toBe('allowed')
  })
  it('(control) a real holiday made by Saber tells the schedulers, and its Undo and Redo go through', () => {
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { noticeHoliday(['kes9', 'prowler'], 'stiff', 'National Day', '2026-08-09', '2026-08-09') })).toBe(true)
    const told = () => NOTICES.filter(x => x.name === 'National Day').map(x => x.to).sort()
    expect(told()).toEqual(['kes9', 'prowler'])
    expect(globalUndo().ok).toBe(true)
    expect(told()).toEqual([])
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(told()).toEqual(['kes9', 'prowler'])
  })
})
