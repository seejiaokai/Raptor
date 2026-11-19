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
import { NOTICES, noticesFor, allNoticesFor, type Notice } from '../state/notices'
import { markNoticeRead, unreadFor, noticeSeenLoad } from '../state/noticeseen'
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

/* Fix read 5's walk, F4 (19 Nov 26): Saber posts Ranger out today; Hunter (142, never moved) reads the posting line;
   Saber presses "Undo post out" — Hunter's bell showed "Nothing new", no "taken back" line (D1699 owes him one). The walk
   read the line in a SECOND tab of the same browser. The same order in ONE world: the read reaches the device that
   decides who read the line, and Hunter is told. */
describe('fix read 5, walk F4 — a never-moved admin who read the posting line, one world', () => {
  for (const o of ['none', 'overseas', 'sans'] as const) {
    it(`outcome ${o}: Hunter read the line; Undo post out leaves him one "taken back" line`, () => {
      signInAs('ad', 'a')
      expect(postOut('bane', '2026-07-15', o)).toBe(true)
      signInAs('ad2', 'a2')
      const line = noticesFor('prowler').find(n => isPo(n))
      expect(line, 'Hunter told of the posting').toBeDefined()
      expect(markNoticeRead(line!.id)).toBe(true)
      signInAs('ad', 'a')
      expect(undoPostOut('bane')).toBe(true)
      signInAs('ad2', 'a2')
      const back = noticesFor('prowler').filter(n => isPo(n, 'poback'))
      expect(back.length, 'one "taken back" line').toBe(1)
      expect(unreadFor('prowler')).toBe(1)
    })
  }
})
/* …and the walk's own miss, reproduced: Hunter's read lands in the shared store from another tab, which Saber's open tab
   never reads again (state/noticeseen.ts loads the read records at start-up and on its own failed write; nothing reloads
   them on another tab's write). Saber's tab then sees the line unread, and "unread simply goes" (D1693). The same read
   loaded — as a reload, or the database step's sync, would — and Hunter is told. Cross-tab sync is the database step's. */
describe('fix read 5, walk F4 — the read made in another tab', () => {
  const run = (reload: boolean) => {
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-15', 'none')).toBe(true)
    const line = allNoticesFor('prowler').find(n => isPo(n))!   // (the "off the manpower" line is worked out, never stored)
    expect(line).toBeDefined()
    mem['sqn142_noticeseen:prowler'] = JSON.stringify({ upto: 0, ids: [line.id] })
    if (reload) noticeSeenLoad()
    expect(undoPostOut('bane')).toBe(true)
    return NOTICES.filter(n => isPo(n, 'poback')).length
  }
  it('not reloaded on Saber’s tab: no "taken back" line — the walk’s "Nothing new"', () => { expect(run(false)).toBe(0) })
  it('reloaded: Hunter gets his "taken back" line', () => { expect(run(true)).toBe(1) })
})
