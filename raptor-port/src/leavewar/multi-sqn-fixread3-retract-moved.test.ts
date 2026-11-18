// @vitest-environment jsdom
/* Fix read 3, A2 (Astra's 2): "Undo post out" — and moving a done posting's date, the same take-back — left an admin
   who had since moved squadron his original posting line ("Posted out · now SANS") standing, read or not: the take-back
   skipped every recipient no longer at home in the war's squadron (job 2's fix for the refusal it met there). The ruled
   behaviour (D1693, D1699, D1710) holds whatever his home now: an unread line goes; a read one becomes the struck
   "taken back" line. The squadron's posting command may touch the other squadron's bell for exactly that — the lines of
   the run it takes back, and the "taken back" lines owed for them — and for nothing else (D2194: the narrow crossing).
   Fixture as multi-sqn-job2-retract.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut } from './sync'
import { setHome, homeOn, unitsLoad } from '../state/units'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { markNoticeRead } from '../state/noticeseen'
import { ownershipViolation } from '../state/perms'

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
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})

const isPo = (n: Notice, k = 'po') => n.to === 'prowler' && (n.what || [])[0]?.k === k && (n.what[0] as any).who === 'bane'
/* Ranger posted out as SANS today (lines to 142's admins, Hunter among them); Hunter, having read it or not, moved to 149
   from tomorrow; two days on, Outlaw (a third 142 admin) is signed in on 142. Answers Hunter's original line. */
function setup(read: boolean): Notice {
  signInAs('ad', 'a')
  expect(worldUnit()).toBe('u142')
  expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull()
  expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)
  const old = NOTICES.find(n => isPo(n))!
  expect(old).toBeDefined()
  if (read) { signInAs('ad2', 'a2'); expect(markNoticeRead(old.id)).toBe(true); signInAs('ad', 'a') }
  expect(setHome('prowler', 'u149').ok).toBe(true)
  vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0))
  unitsLoad()
  expect(homeOn('prowler')).toBe('u149')
  signInAs('outlaw')
  expect(worldUnit()).toBe('u142')
  return old
}

describe('a posting taken back reaches the line of an admin since moved squadron', () => {
  it('unread: Undo post out takes his line away — gone from his bell, after a reload too', () => {
    const old = setup(false)
    expect(undoPostOut('bane')).toBe(true)
    expect(getState().postOuts.bane?.to ?? null).toBeNull()
    expect((PEOPLE as any).bane.san).toBeFalsy()
    expect(NOTICES.some(n => n.id === old.id), 'his unread line goes').toBe(false)
    expect(NOTICES.some(n => isPo(n, 'poback')), 'no taken-back line for an unread one').toBe(false)
    signInAs('ad2', 'a2')
    expect(noticesFor('prowler').some(n => n.id === old.id)).toBe(false)
    raptorInitStore()
    expect(NOTICES.some(n => n.id === old.id), 'and stays gone once reloaded').toBe(false)
  })
  it('read: Undo post out turns his line into one unread "taken back" line, by Outlaw', () => {
    const old = setup(true)
    expect(undoPostOut('bane')).toBe(true)
    expect(NOTICES.some(n => n.id === old.id)).toBe(false)
    const back = NOTICES.filter(n => isPo(n, 'poback'))
    expect(back.length).toBe(1)
    expect(back[0]!.by).toBe('casper')                     // (Outlaw's person)
    expect(back[0]!.day).toBe(old.day)
    signInAs('ad2', 'a2')
    expect(noticesFor('prowler').some(n => n.id === back[0]!.id)).toBe(true)
  })
  it('moving the done posting into the future takes his line back the same way', () => {
    const old = setup(false)
    expect(postOut('bane', '2026-08-01', 'sans')).toBe(true)
    expect(getState().postOuts.bane?.to).toBe('2026-07-31')              // (his last day; the posting date the day after)
    expect(NOTICES.some(n => n.id === old.id)).toBe(false)
  })
  it('no wider: the posting command deleting another squadron man’s line with no posting taken back is refused', () => {
    const old = setup(false)
    const env: any = { type: 'lw.postout', origin: 'user', actor: { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null },
      changes: [{ collection: 'notices', id: old.id, op: 'delete', before: { ...old }, after: null }] }
    expect(ownershipViolation(env)).toMatch(/bell line of another squadron/)
    /* …nor a "taken back" line written to him for a posting the command does not change */
    const env2: any = { ...env, changes: [{ collection: 'notices', id: 'nfake', op: 'put', before: null,
      after: { id: 'nfake', to: 'prowler', by: 'casper', at: Date.now(), iid: '', name: 'Ranger', day: old.day, what: [{ k: 'poback', who: 'bane', o: 'sans' }] } }] }
    expect(ownershipViolation(env2)).toMatch(/bell line of another squadron/)
    /* …nor his line deleted beside a posting record rewritten as it ran (nothing taken back) */
    const rec = getState().postOuts.bane
    const env3: any = { ...env, changes: [{ collection: 'lw.postouts', id: 'bane', op: 'put', before: { ...rec }, after: { ...rec } }, ...env.changes] }
    expect(ownershipViolation(env3)).toMatch(/bell line of another squadron/)
  })
})
