/* A MAN POSTED OUT AS SANS WHO EARNS OIL AFTER HIS POSTING DATE, WITH SANS OFF THE LEAVE WAR (chat 139's check of SANS
   men's OIL, 22 Nov 26 — the one case no test held). His credit is written against him by id and date, never by his row
   (sync.ts desiredOilCells' "hiding a man must not destroy his money"); what was unconfirmed is WHERE IT SHOWS: he is
   SANS from his posting date (D283), SANS is off the war (no "+ SANS" group — D1215), and the war keeps him in his old
   place with his posting window ended (D283, D1692). So: the OIL tracker lists him, the Balances page lists him for the
   period, and his grid cell holds the credit on a day after his posting.
   The fixture is fableoil-sans-crowd.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; id `rocky` is Hex. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, dayPendingItems } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { commitSetDayApproved } from '../state/sched-commit'
import { afterSchedMutate } from '../state/view'
import { getState, initStore as lwInitStore, setPeople, displayRoster, figureCtxOf } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { oilBalanceOf, oilLedgerFor } from './engine/oiltracker'
import { rowInWindow } from './ui/rowinwindow'
import { postOut, runOilPass, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const SAT = 5, SAT_ISO = '2026-07-18', WED_ISO = '2026-07-15'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const cell = (p: string, iso: string) => getState().wars[0]!.grid[p]?.[iso]

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(INPUTS0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())                                            // SANS off the war: the default
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('a man posted out as SANS works a published Saturday after his posting date, SANS off the Leave War', () => {
  const work = () => {
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)                 // SANS from Wed 15 Jul
    raptorNotify()
    expect(P('rocky').san, 'the posting ran').toBe(true)
    expect(getState().people.some(p => p.san && p.id !== 'rocky'), 'SANS is off the war: no other SANS man has a row').toBe(false)
    /* Sat 18 Jul, three days after: he holds a duty desk 08:00–18:00, and the day is published */
    ;((DAYS[SAT] as any).dutywaves[0].rows as any[]).push({ role: 'SXO', id: 'rocky', str: '0800', end: '1800' })
    afterSchedMutate()
    sign(SAT); commitSetDayApproved(SAT, true); runOilPass()
    expect(dayPendingItems(SAT).length).toBe(0)
  }

  it('his OIL is credited: a full day on the Saturday', () => {
    work()
    expect(cell('rocky', SAT_ISO), 'ten hours on a Saturday desk').toBe('FO')
  })

  it('the OIL tracker lists him and his balance carries the day', () => {
    const before = oilBalanceOf(figureCtxOf(), 'rocky', getState().oilPolicy, SAT_ISO)
    work()
    const row = displayRoster().find(p => p.id === 'rocky')
    expect(row, 'he keeps his row in his old place (D283, D1692)').toBeTruthy()
    expect(row!.gone, 'the tracker lists every row not deleted').toBeFalsy()
    const ctx = figureCtxOf()
    expect(oilBalanceOf(ctx, 'rocky', getState().oilPolicy, SAT_ISO) - before, 'one more day of OIL').toBe(1)
    const led: any = oilLedgerFor(ctx, 'rocky', getState().oilPolicy, SAT_ISO)
    expect(JSON.stringify(led), 'the ledger holds the Saturday').toContain(SAT_ISO)
  })

  it('the Balances page lists him for the period, and his grid cell shows the credit', () => {
    work()
    const st = getState()
    const row = displayRoster().find(p => p.id === 'rocky')!
    const win = `${st.period.start.slice(0, 7)}|${st.period.end.slice(0, 7)}`
    expect(rowInWindow(row, win, st.spans), 'Balances lists him for the period holding the Saturday').toBe(true)
    /* a window of only the months AFTER his posting month still shows his row where a record of his sits there */
    expect(row.to, 'his last day as a regular: Tue 14 Jul').toBe('2026-07-14')
    const v: any = (st.views as any).rocky?.[SAT_ISO]
    expect(v, 'the grid has a day view for him on Sat 18 Jul').toBeTruthy()
    expect(JSON.stringify(v), 'and it is the full day of OIL').toContain('FO')
  })
})
