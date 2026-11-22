/* A POSTING OUT THE APP COULD NOT RUN (batch 1's second half, plan §7 item 7, §15 D10, §16 D10′ — his D2214: "Bell the
   admins"; D2306's words). The posting's own command refused (here: its save refused, the commit layer's test switch),
   after the runner's one retry of it alone, the app writes — in a command of its own, `posting.failed`, out of band — one
   line to each of his squadron's admins: "Ranger · Mon 20 Jul / Posting out could not run. See his row on Admin → Users.",
   a tap opening his row; and his Admin → Users row shows the amber line. Once: a later load finds the lines and writes
   nothing. A posting that ran beside it rings nothing; a group failure followed by single passes rings only the one that
   failed alone. The gate passes the line only where the runner's own record holds the posting refused (D10′), from the
   app itself, to that squadron's admins, its id the posting's; a forged one is refused.
   Fixture as postout-takeback.test.ts (Wed 15 Jul 26; postings dated Mon 20 Jul; the calendar then reaches the 21st). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commandStream, setConflictChecker } from '../command'
import type { CommitEnvelope } from '../command'
import { ownershipViolation } from '../state/perms'
import { NOTICES, noticeWords, type Notice } from '../state/notices'
import { ADMINOPEN, clearAdminOpen } from '../state/view'
import { openNotice } from '../ui/topstate'
import { initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, wireLeaveWarSync, postingHeldNote } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const PO = '2026-07-20'
const reach = (d = 21) => { vi.setSystemTime(new Date(2026, 6, d, 9, 0, 0)) }
const ROW = 'This posting could not run. The app tries again the next time it opens. If this line is still here after that, report it with “Report a problem” on the Help page.'
const failLines = (pid?: string) => NOTICES.filter(n => (pid == null || n.to === pid) && (n.what || [])[0]?.k === 'pofail')
const drawn = (n: Notice) => { const w = noticeWords(n); return `${w.name} · ${w.day} / ${w.what}${w.who ? ' · ' + w.who : ''}` }
/* the posting's save refused for one man: any command changing his person (the runner's outcome) — the commit layer's own
   test switch, as multi-sqn-a3-foreign.test.ts uses it */
const refuseFor = (pid: string) => setConflictChecker(ch => ch.some(c => c.collection === 'people' && String(c.id) === pid) ? 'refused for the test' : null)
/* a load of the app: the same saved war and store, read again (a fresh wiring tries a refused posting again) */
let WAR = memoryBackend()
const boot = () => { lwInitStore(WAR); raptorInitStore(); accountsLoad(); setPeople(projectPeople()); wireLeaveWarSync() }

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
afterEach(() => { setConflictChecker(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  WAR = memoryBackend()
  boot()
  HOOKS.toast = () => {}
  signInAs('ad', 'a')
  /* 142's admins: Saber (stiff) and Hex (rocky), as postout-takeback.test.ts sets them; Prowler steps down */
  expect(updateAccount('acad2', { role: 'main' })).toBeNull()
  expect(updateAccount('achex', { role: 'admin' })).toBeNull()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
})

describe('a posting that could not run rings his squadron’s admins once (his D2214)', () => {
  it('its save refused: one line to each 142 admin, the amber line on his row; three loads, still one each', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    refuseFor('bane')
    reach(); runPoOutcomes()
    expect(P('bane').san, 'it did not run').toBeFalsy()
    expect(failLines().map(n => n.to).sort(), 'each 142 admin, once').toEqual(['rocky', 'stiff'])
    expect(failLines('stiff').map(drawn)).toEqual(['Ranger · Mon 20 Jul / Posting out could not run. See his row on Admin → Users.'])
    expect(failLines('stiff')[0]!.by ?? null, 'the app, no one’s name').toBeNull()
    expect(failLines('stiff')[0]!.u, 'his squadron’s line').toBe('u142')
    expect(postingHeldNote('bane'), 'the amber line on his Admin → Users row').toBe(ROW)
    runPoOutcomes()
    boot(); signInAs('ad', 'a'); runPoOutcomes()
    boot(); signInAs('hex'); runPoOutcomes()
    expect(failLines().length, 'three loads later, still one each').toBe(2)
  })
  it('it runs once the cause is gone: the posting runs, the amber line leaves his row, the bell line stays as the record', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    refuseFor('bane')
    reach(); runPoOutcomes()
    setConflictChecker(null)
    boot(); signInAs('ad', 'a'); runPoOutcomes()
    expect(P('bane').san, 'it ran on the next load').toBe(true)
    expect(postingHeldNote('bane')).toBeNull()
    expect(failLines().length).toBe(2)
  })
  it('beside a posting that ran: only the one that failed rings (a group failure, then each alone)', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    expect(postOut('casper', PO, 'sans')).toBe(true)
    refuseFor('bane')
    reach(); runPoOutcomes()
    expect([P('casper').san, P('bane').san]).toEqual([true, undefined])
    expect([...new Set(failLines().map(n => (n.what[0] as any).who))], 'only Ranger’s').toEqual(['bane'])
    expect(failLines().length).toBe(2)
  })
  it('a tap opens his row on Admin → Users', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    refuseFor('bane')
    reach(); runPoOutcomes()
    clearAdminOpen()
    openNotice(failLines('stiff')[0]!)
    expect(ADMINOPEN && ADMINOPEN.person).toBe('bane')
  })
  it('the lines are the app’s own, out of band: an Undo of the press before them never takes them away', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    refuseFor('bane')
    reach(); runPoOutcomes()
    globalUndo()
    expect(failLines().length).toBe(2)
  })
})

describe('the gate: a posting-failed line only where the posting failed', () => {
  /* the app's own envelope, as the runner writes it */
  const sys = { id: 'system', role: 'system', session: null } as any
  const env = (after: any, type = 'posting.failed', actor: any = sys): CommitEnvelope => ({
    type, scope: { module: 'inputs' }, actor, origin: 'projection', changes: [{ collection: 'notices', id: String(after.id), op: 'put', before: null, after }],
  } as any)
  const line = (o: any = {}) => ({ id: 'pofail:bane@2026-07-20:sans:stiff', to: 'stiff', by: null, at: Date.now(), iid: '', name: 'Ranger', day: PO, what: [{ k: 'pofail', who: 'bane', o: 'sans' }], u: 'u142', ...o })
  it('the runner’s own line passes', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    refuseFor('bane')
    const from = commandStream().length
    reach(); runPoOutcomes()
    const e = commandStream().slice(from).filter(x => x.type === 'posting.failed')
    expect(e.length, 'one command').toBe(1)
    expect(ownershipViolation(e[0] as CommitEnvelope)).toBeNull()
  })
  it('a forged one for a due posting never tried, or tried and run, is refused', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach()
    expect(ownershipViolation(env({ ...line(), at: Date.now() })), 'due, untried').toMatch(/posting-failed line/)
    runPoOutcomes()
    expect(P('bane').san).toBe(true)
    expect(ownershipViolation(env({ ...line(), at: Date.now() })), 'it ran').toMatch(/posting-failed line/)
  })
  it('once failed: to a member, to another squadron’s admin, the wrong id, a name signed, from a person, or in another command — refused', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    refuseFor('bane')
    reach(); runPoOutcomes()
    setConflictChecker(null)
    const at = Date.now()
    const bad = (e: CommitEnvelope, why: string) => expect(ownershipViolation(e), why).toMatch(/posting-failed line/)
    bad(env(line({ id: 'pofail:bane@2026-07-20:sans:casper', to: 'casper', at })), 'a member')
    bad(env(line({ id: 'pofail:bane@2026-07-20:sans:kes9', to: 'kes9', at })), '149’s admin')
    bad(env(line({ id: 'pofail:bane@2026-07-20:sans:x', at })), 'not its id')
    bad(env(line({ by: 'stiff', at })), 'a name signed')
    bad(env(line({ what: [{ k: 'pofail', who: 'bane', o: 'delete' }], at })), 'not his posting’s outcome')
    bad(env(line({ at }), 'posting.failed', { id: 'acad', role: 'admin', personId: 'stiff', session: null }), 'from a person')
    bad(env(line({ at }), 'notices.seen', { id: 'acad', role: 'admin', personId: 'stiff', session: null }), 'inside another command')
  })
})
