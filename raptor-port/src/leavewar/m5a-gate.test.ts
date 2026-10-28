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
  setPersonGrade, setTypedBalance, snapshotNow, addGrade,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { setMemberTodayForTests } from './engine'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { lwSeenAt, openOwnWindow } from '../state/lwseen'

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
    expect(ownershipViolation(env([bal({ amount: 17.3 })]))).toContain('not a half')
    expect(ownershipViolation(env([bal({ cf: 21 })]))).toContain('carried forward')
    expect(ownershipViolation(env([bal({ cf: -1 })]))).toContain('carried forward')
    expect(ownershipViolation(env([bal({ cf: 1, snap: snapshotNow('bane', 'CCL') }, 'bane:CCL')]))).toContain('carried forward')
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
    expect(ownershipViolation(seen('lwseen:bane', 'lw.edit'))).toContain("an admin's record")
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
  it('opening his own window writes his last visit and hands back the one before', () => {
    ranger()
    const t1 = T(9)
    expect(openOwnWindow('bane', t1)).toBe(0)
    expect(lwSeenAt('bane')).toBe(t1)
    expect(openOwnWindow('bane', T(10))).toBe(t1)
  })
})
