/* FABLE OIL READ, 22 Nov 26 — proof test. A man posted out as SANS "becomes SANS on the date" (D283), and the ALL AVAIL
   crowd of a day already published "stays as it went out, and nothing reads pending for it" (D327 for an archived man,
   D297 for a deleted one; D44, D45). The crowd reads a deleted man by his cutoff and an archived man by his stints — but
   a SANS man by today's tick alone (leavewar/sync.ts availableFor: `p.san && !engaged`), on every day, the days before
   his posting included. So the published holiday he attended as a regular reads pending the moment his posting runs, and
   publishing it again (any amendment — D142: the latest published version is the day's OIL) takes his OIL for it. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, dayPendingItems, dayCurVer, verLabel } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { commitSetDayApproved, commitPublishALDay } from '../state/sched-commit'
import { afterSchedMutate } from '../state/view'
import { getState, initStore as lwInitStore, setPeople, setDayEvent } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { availableFor, postOut, runOilPass, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const MON = 0, MON_ISO = '2026-07-13'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const cell = (p: string, iso: string) => getState().wars[0]!.grid[p]?.[iso]
/* the Monday holds one thing: a squadron event for ALL AVAIL, 08:00 to 15:00 — so nobody is named on the day */
const onlyTheEvent = () => { const d: any = DAYS[MON]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = [{ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL AVAIL' }]; afterSchedMutate() }

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                      // Wed 15 Jul 26, the demo week
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
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('a man posted out as SANS and the ALL AVAIL crowd of the days before his posting', () => {
  it('the crowd of a day before his posting keeps him — as it does an archived man (D327) and a deleted one (D297)', () => {
    const win: [number, number] = [600, 660]
    onlyTheEvent()
    expect(availableFor(MON_ISO, win, DAYS[MON] as any), 'before the posting: a regular, in the crowd').toContain('rocky')
    expect(postOut('rocky', '2026-07-15', 'sans')).toBe(true)          // posted out as SANS from today, Wed 15 Jul
    raptorNotify()
    expect(P('rocky').san, 'the posting ran: SANS from 15 Jul').toBe(true)
    expect(availableFor(MON_ISO, win, DAYS[MON] as any), 'Mon 13 Jul, two days BEFORE he became SANS: the crowd as it was').toContain('rocky')
  })

  it('a published holiday he attended behind ALL AVAIL reads nothing pending after his posting', () => {
    setDayEvent(MON_ISO, 0, 'PH')                                        // Mon 13 Jul is a public holiday
    onlyTheEvent()
    sign(MON); commitSetDayApproved(MON, true); runOilPass()
    expect(cell('rocky', MON_ISO), 'published: Rocky, behind ALL AVAIL for 7 hours, earns a full day').toBe('FO')
    expect(dayPendingItems(MON).length, 'nothing pending on the day as published').toBe(0)
    expect(postOut('rocky', '2026-07-15', 'sans')).toBe(true)
    raptorNotify()
    expect(P('rocky').san).toBe(true)
    expect(dayPendingItems(MON).length, 'his posting two days later changes nothing on the published Monday').toBe(0)
  })

  it('…and the OIL he earned on that holiday survives the next amendment of it', () => {
    setDayEvent(MON_ISO, 0, 'PH')
    onlyTheEvent()
    sign(MON); commitSetDayApproved(MON, true); runOilPass()
    expect(cell('rocky', MON_ISO)).toBe('FO')
    expect(postOut('rocky', '2026-07-15', 'sans')).toBe(true)
    raptorNotify()
    /* any amendment of that Monday — here a remark — is published: the latest published version is the day's OIL (D142) */
    ;(DAYS[MON] as any).allhands[0].rmks = 'bring ID'
    afterSchedMutate()
    sign(MON); commitPublishALDay(MON); runOilPass()
    expect(verLabel(dayCurVer(MON))).toBe('AL1')
    expect(cell('rocky', MON_ISO), 'AL1 changed a remark only: the OIL he earned on the Monday stands').toBe('FO')
  })
})
