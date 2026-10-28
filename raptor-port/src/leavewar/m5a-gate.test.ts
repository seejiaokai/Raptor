/* THE OVERHAUL'S M5a — WHO MAY WRITE A LEAVE FIGURE (the build spec §3, §8's break tests; B6, findings 7, 9, 10). Each
   guard broken on purpose goes red: his own row only, the lock read when SAVED, never OIL, halves only, carried forward
   only on LVE and within the figure, the typist him, the day today, the snapshot the store's own; a member's grade, the
   grades list and the lock refused; `lwseen:` of another pid refused; no war wired → refused. And what must pass: his
   own typing saved, stored as its own row and read back whole after a reload; his Undo and next-day Redo of his second
   typing accepted while unlocked, refused once locked. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { ELOG } from '../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { NOTICES } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { cmdAuthorize, ownershipViolation, setLwBalanceProbe } from '../state/perms'
import {
  balanceProblem, getState, initStore as lwInitStore, leaveFiguresOf, lwHistInit, rawState, setBalanceLock, setPeople,
  setPersonGrade, setTypedBalance, snapshotNow, addGrade, deleteGrade, gradeOf, gradesList, renameGrade,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { setMemberTodayForTests } from './engine'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { lwSeenAt, openOwnWindow } from '../state/lwseen'
import { sameSnapshot } from './engine/leaveyear'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let lwb: StorageBackend

const today = (day = 15) => `2026-07-${String(day).padStart(2, '0')}`
/* the app's today moves with the clock (the suite pins it to 2000-01-01 — test-setup.ts) */
const T = (h: number, day = 15): number => { const d = new Date(2026, 6, day, h, 0, 0); vi.setSystemTime(d); setMemberTodayForTests(today(day)); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')        // the admin — person `stiff`
const ranger = () => signInAs('us', 'us')      // a member — person `bane`
const BANE = { role: 'member', personId: 'bane' }
const env = (changes: any[], type = 'lw.balance', origin = 'user'): any => ({ type, origin, actor: BANE, changes })
const bal = (extra: any = {}, id = 'bane:LVE') => ({ collection: 'lw.balance', id, op: 'put', before: null, after: { amount: 20, cf: 2, day: today(), by: 'bane', snap: snapshotNow('bane', 'LVE'), ...extra } })

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  ELOG.rows.length = 0
  lwb = memoryBackend()
  lwInitStore(lwb)
  raptorInitStore()
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null); setMemberTodayForTests('2000-01-01') })

describe('the command gate: which commands a member may run', () => {
  it('his own typed figure yes; a grade, the grades list and the lock no', () => {
    expect(cmdAuthorize('lw.balance', BANE as any)).toBe(true)
    expect(cmdAuthorize('lw.grade', BANE as any)).toBe(false)
    expect(cmdAuthorize('lw.grades', BANE as any)).toBe(false)
    expect(cmdAuthorize('lw.balLock', BANE as any)).toBe(false)
  })
})

describe('what a member\'s typed figure must be (ownershipViolation)', () => {
  it('a figure written as the store writes it passes', () => {
    expect(ownershipViolation(env([bal()]))).toBeNull()
  })
  it('another man\'s row is refused', () => {
    expect(ownershipViolation(env([bal({}, 'stiff:LVE')]))).toContain("another person's balance")
  })
  it('OIL is refused — it is never typed (D1209)', () => {
    expect(ownershipViolation(env([bal({ cf: undefined }, 'bane:OIL')]))).toContain('not typed')
  })
  it('halves only; carried forward only on LVE and from 0 to the figure', () => {
    /* (refused by the row's one exact shape first since the security read's finding 1, or by the check of its own) */
    expect(ownershipViolation(env([bal({ amount: 17.3 })]))).toMatch(/not a half|will not read/)
    expect(ownershipViolation(env([bal({ cf: 21 })]))).toMatch(/carried forward|will not read/)
    expect(ownershipViolation(env([bal({ cf: -1 })]))).toMatch(/carried forward|will not read/)
    expect(ownershipViolation(env([bal({ cf: 1, snap: snapshotNow('bane', 'CCL') }, 'bane:CCL')]))).toMatch(/carried forward|will not read/)
  })
  it('a forged typist, day or snapshot is refused (finding 9)', () => {
    expect(ownershipViolation(env([bal({ by: 'stiff' })]))).toContain('who typed')
    expect(ownershipViolation(env([bal({ day: '2025-12-31' })]))).toContain('the day')
    expect(ownershipViolation(env([bal({ snap: [['2026-03-02', 'day']] })]))).toContain('snapshot')
  })
  it('locked: refused, read as it stands when the change is saved (B6)', () => {
    setBalanceLock(true)
    expect(ownershipViolation(env([bal()]))).toContain('locked')
    expect(ownershipViolation(env([{ collection: 'lw.balance', id: 'bane:LVE', op: 'delete', before: {}, after: undefined }]))).toContain('locked')
  })
  it('with no war wired, a member\'s figure is refused', () => {
    setLwBalanceProbe(null)
    expect(ownershipViolation(env([bal()]))).toContain('no Leave War')
  })
  it('a person\'s grade is an admin\'s record — the default case would have allowed it (finding 7)', () => {
    expect(ownershipViolation(env([{ collection: 'lw.grade', id: 'bane', op: 'put', before: null, after: { hist: [{ id: 'sp', from: today() }] } }], 'lw.grade'))).toContain("an admin's record")
    expect(ownershipViolation(env([{ collection: 'lw.config', id: 'all', op: 'put', before: {}, after: { balLock: false } }], 'lw.balLock'))).toContain("an admin's record")
  })
  it('his last visit: his own row by its one command; another man\'s refused (finding 10c)', () => {
    const seen = (id: string, type = 'lw.seen') => env([{ collection: 'settings', id, op: 'put', before: null, after: { at: 5 } }], type)
    expect(ownershipViolation(seen('lwseen:bane'))).toBeNull()
    expect(ownershipViolation(seen('lwseen:stiff'))).toContain("another person's last visit")
    expect(ownershipViolation(seen('lwseen:bane', 'lw.edit'))).toMatch(/an admin's record|another person's last visit/)
  })
})

describe('through the real doors', () => {
  it('a member types his own figure: saved as its own row, read back whole after a reload; another man\'s and OIL refused', () => {
    ranger()
    expect(setTypedBalance('bane', 'LVE', 18, 3)).toBe(true)
    const row = rawState().balances.bane!.LVE!
    expect(row).toMatchObject({ amount: 18, cf: 3, day: today(), by: 'bane' })
    expect(lwb.read('bal:bane:LVE')).toBeTruthy()
    expect(setTypedBalance('stiff', 'LVE', 18, 0)).toBe(false)
    expect(balanceProblem('bane', 'OIL', 4)).toMatch(/OIL/)
    lwInitStore(lwb, { started: true })
    expect(rawState().balances.bane!.LVE).toEqual(row)
  })
  it('a member writes no grade and no lock', () => {
    ranger()
    expect(setPersonGrade('bane', 'sp')).toBe(false)
    expect(setBalanceLock(true)).toBe(false)
    expect(addGrade('Junior OPS', 10)).toBeNull()
  })
  it('his Undo and next-day Redo of his second typing are accepted while unlocked (narrow read 1)', () => {
    ranger()
    expect(setTypedBalance('bane', 'LVE', 18, 0)).toBe(true)
    T(8, 16)
    expect(setTypedBalance('bane', 'LVE', 20, 0)).toBe(true)
    globalUndo()
    expect(rawState().balances.bane!.LVE).toMatchObject({ amount: 18, day: today(15) })
    T(8, 17)
    globalRedo()
    expect(rawState().balances.bane!.LVE).toMatchObject({ amount: 20, day: today(16) })
  })
  it('his Undo after the admin locks is refused (B6)', () => {
    ranger()
    expect(setTypedBalance('bane', 'LVE', 18, 0)).toBe(true)
    /* the admin's lock, as another person's change would land — straight into the war's record (the walk's stand-in) */
    lwInitStore(lwb, { started: true })
    saber(); expect(setBalanceLock(true)).toBe(true)
    ranger()
    expect(setTypedBalance('bane', 'LVE', 19, 0)).toBe(false)
    expect(rawState().balances.bane!.LVE).toMatchObject({ amount: 18 })
  })
  it('the admin types any row, sets a grade and locks; the engine reads the typed figure', () => {
    expect(setTypedBalance('bane', 'LVE', 30, 4)).toBe(true)
    expect(rawState().balances.bane!.LVE!.by).toBe('stiff')
    expect(setPersonGrade('bane', 'jp')).toBe(true)
    expect(leaveFiguresOf('bane').kinds.LVE.app).toBeLessThanOrEqual(30)
    expect(setBalanceLock(true)).toBe(true)
    expect(setTypedBalance('bane', 'CCL', 2)).toBe(true)
    expect(getState().balLock).toBe(true)
  })
  /* THE CODE READ'S 1 (29 Oct 26): the grades list is stored only once an admin first edits it (narrow read 6), so the Undo
     of that first edit restores a config with no list — and the list saved by the edit must go with it, or the edit comes
     back on the next reload */
  it('the Undo of the admin\'s first grades-list rename is kept across a reload: the starting name', () => {
    expect(lwb.read('grades')).toBeNull()
    expect(renameGrade('opsa', 'Ops B')).toBe(true)
    expect(lwb.read('grades')).toBeTruthy()
    globalUndo()
    expect(gradesList().find(g => g.id === 'opsa')!.name).toBe('Ops A')
    expect(lwb.read('grades')).toBeNull()
    lwInitStore(lwb, { started: true })
    expect(gradesList().find(g => g.id === 'opsa')!.name).toBe('Ops A')
  })
  it('the Undo of the admin\'s first delete of a grade people hold is kept across a reload: they hold it again', () => {
    expect(setPersonGrade('bane', 'jw')).toBe(true)
    expect(deleteGrade('jw')).toBe(true)
    expect(gradeOf('bane')).toBeNull()
    globalUndo()
    expect(gradeOf('bane')?.id).toBe('jw')
    lwInitStore(lwb, { started: true })
    expect(gradeOf('bane')?.id).toBe('jw')
  })
  it('opening his own window writes his last visit and hands back the one before', () => {
    ranger()
    const t1 = T(9)
    expect(openOwnWindow('bane', t1)).toBe(0)
    expect(lwSeenAt('bane')).toBe(t1)
    expect(openOwnWindow('bane', T(10))).toBe(t1)
  })
})

/* THE SECURITY READ'S FOUR (D1411; docs/handpass/parts/lw-m5a/security-read.md), each red before its fix */
describe('the security read: four holes closed', () => {
  it('1. a snapshot entry run together with the next ("2026-07-1" + "8day") never matches a real one; a row of any other shape is refused', () => {
    expect(sameSnapshot([['2026-07-1', '8day' as any], ['2026-07-19', 'day']], [['2026-07-18', 'day'], ['2026-07-19', 'day']])).toBe(false)
    expect(ownershipViolation(env([bal({ by: ['bane'] })]))).toContain('will not read')
    expect(ownershipViolation(env([bal({ junk: 'x'.repeat(50) })]))).toContain('will not read')
    expect(ownershipViolation(env([bal({ snap: [['2026-07-1', '8day']] })]))).toBeTruthy()
  })
  it('2. the history line takes its figures from the saved row and the store\'s own running figure, never the caller\'s', () => {
    ELOG.rows.length = 0
    expect(setTypedBalance('bane', 'CCL', 40, undefined, { amount: 39 })).toBe(true)
    const line = ELOG.rows.filter((r: any) => r.fld === 'balance').pop() as any
    expect(line.to).toBe('40')
    expect(line.from).not.toBe('39')
  })
  it('3. a figure past ±999 is refused by the box and by a hand-made command', () => {
    expect(balanceProblem('bane', 'LVE', 1e21)).toMatch(/999/)
    expect(ownershipViolation(env([bal({ amount: 1e21, cf: 0 })]))).toBeTruthy()
  })
  it('4. an admin writes only his own last visit, by its one command', () => {
    const admin = (id: string, type = 'lw.seen'): any => ({ type, origin: 'user', actor: { role: 'admin', personId: 'stiff' }, changes: [{ collection: 'settings', id, op: 'put', before: null, after: { at: 5 } }] })
    expect(ownershipViolation(admin('lwseen:bane'))).toContain("another person's last visit")
    expect(ownershipViolation(admin('lwseen:stiff', 'lw.edit'))).toBeTruthy()
    expect(ownershipViolation(admin('lwseen:stiff'))).toBeNull()
  })
})
