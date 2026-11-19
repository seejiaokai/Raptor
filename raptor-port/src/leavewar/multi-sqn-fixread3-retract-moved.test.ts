// @vitest-environment jsdom
/* A posting taken back, and an admin who got its line and has since moved squadron — fix read 3's A2 (Astra's 2) UNDONE
   by his D2218 (19 Nov 26): "On the day a person moves squadron the old squadron's bell lines leave his bell, read or
   unread, never later struck 'taken back'; lines about himself stay with him; after a move, who is told of a take-back is
   whoever would be told of it today. So a moved admin gets nothing when his old squadron undoes a posting." A2 had taken
   Hunter's line back across the squadrons (and let the posting command touch the other squadron's bell for it); now his
   line is off his bell from his move day, "Undo post out" and moving a done posting's date tell him nothing and write
   nothing to his bell, and 142's own admins are told as ever (D1693, D1699, D1710). The forged posting command of fix
   read 4's Astra §1 — deleting an older run's line from the moved man's bell — is refused with the rest.
   Fixture as multi-sqn-job2-retract.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut, restoreArchivedPerson } from './sync'
import { setHome, homeOn, unitsLoad } from '../state/units'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { markNoticeRead, unreadFor } from '../state/noticeseen'
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
  NOTICES.splice(0)                                       // (each case starts with an empty bell: a line D2218 leaves stored would carry over)
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

describe("D2218 — a posting taken back, and an admin since moved squadron", () => {
  it('unread: his line left his bell on his move day; Undo post out leaves it where it is and tells him nothing', () => {
    const old = setup(false)
    signInAs('ad2', 'a2')
    expect(noticesFor('prowler').some(n => n.id === old.id), 'off his bell from the move day').toBe(false)
    expect(unreadFor('prowler'), 'it lights nothing').toBe(0)
    signInAs('outlaw')
    expect(undoPostOut('bane')).toBe(true)
    expect(getState().postOuts.bane?.to ?? null).toBeNull()
    expect((PEOPLE as any).bane.san).toBeFalsy()
    expect(NOTICES.some(n => n.id === old.id), 'no write to the other squadron’s bell: the stored line stays').toBe(true)
    expect(NOTICES.some(n => isPo(n, 'poback')), 'no "taken back" line to him').toBe(false)
    signInAs('ad2', 'a2')
    expect(noticesFor('prowler').some(n => n.id === old.id || isPo(n, 'poback'))).toBe(false)
  })
  it('read: he gets nothing — no "taken back" — while Saber, 142’s, who read his own line, is told as ever', () => {
    const old = setup(true)
    /* Saber reads his own line of the same run */
    const sab = NOTICES.find(n => n.to === 'stiff' && (n.what || [])[0]?.k === 'po' && (n.what[0] as any).who === 'bane')!
    expect(sab).toBeDefined()
    signInAs('ad', 'a'); expect(markNoticeRead(sab.id)).toBe(true)
    signInAs('outlaw')
    expect(undoPostOut('bane')).toBe(true)
    expect(NOTICES.some(n => n.id === old.id)).toBe(true)
    expect(NOTICES.some(n => isPo(n, 'poback')), 'no "taken back" line to the moved admin').toBe(false)
    expect(NOTICES.some(n => n.id === sab.id), 'Saber’s line goes').toBe(false)
    const back = NOTICES.filter(n => n.to === 'stiff' && (n.what || [])[0]?.k === 'poback')
    expect(back.length, 'Saber gets one "taken back" line').toBe(1)
    expect(back[0]!.by).toBe('casper')                     // (Outlaw's person)
  })
  it('moving the done posting into the future leaves his line where it is, as the Undo does', () => {
    const old = setup(false)
    expect(postOut('bane', '2026-08-01', 'sans')).toBe(true)
    expect(getState().postOuts.bane?.to).toBe('2026-07-31')              // (his last day; the posting date the day after)
    expect(NOTICES.some(n => n.id === old.id)).toBe(true)
    expect(NOTICES.some(n => isPo(n, 'poback'))).toBe(false)
  })
  it('fix read 4, Astra §1: a forged posting command deleting an older run’s line from the moved admin’s bell is refused', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull()
    expect(postOut('bane', '2026-07-15', 'overseas')).toBe(true)
    const old = NOTICES.find(n => isPo(n))!
    expect(old).toBeDefined()
    expect(restoreArchivedPerson('bane', '2026-07-15')).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 15, 9, 5, 0))
    expect(postOut('bane', '2026-07-15', 'overseas')).toBe(true)
    const his = NOTICES.filter(n => isPo(n))
    expect(his.length, 'two runs, two lines').toBe(2)
    expect(new Set(his.map(n => n.at)).size).toBe(2)
    expect(setHome('prowler', 'u149').ok).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0))
    unitsLoad()
    signInAs('outlaw')
    const rec = getState().postOuts.bane
    expect(rec).toBeDefined()
    const env: any = { type: 'lw.postout', origin: 'user', actor: { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null },
      changes: [
        { collection: 'lw.postouts', id: 'bane', op: 'delete', before: structuredClone(rec), after: null },
        { collection: 'notices', id: old.id, op: 'delete', before: structuredClone(old), after: null },
      ] }
    expect(ownershipViolation(env)).toMatch(/bell line of another squadron/)
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
