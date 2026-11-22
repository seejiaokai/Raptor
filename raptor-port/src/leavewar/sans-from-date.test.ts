/* A MAN COUNTS AS SANS ONLY FROM HIS SANS DATE, ON EVERY SCREEN (owner D2313, 22 Nov 26 — "all as recommended", question 1:
   "SANS from its date everywhere, including Fable's point that a hand tick counts from the day it is made"). Four parts,
   each failing before the build:
   (e) the board's crew list of a day BEFORE his posting shows him as the regular he was (walker w1's finding, chat 138:
       Hex posted out as SANS from Mon 20 Jul stood under "SANS avail" on Sat 18 Jul while the ALL AVAIL window there still
       counted him);
   (a) a SANS tick put on or taken off BY HAND counts from the day it is made — published days before it keep their crowd,
       read nothing pending and keep their OIL through the next amendment;
   (b) a hand re-tick after a SANS posting keeps the posting's date;
   (c) a man NAMED on a published day before his posting does not make it pending.
   The fixture is fableoil-sans-crowd.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; id `rocky` is Hex, a WSO. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, dayPendingItems, dayCurVer, verLabel } from '../engine/publish'
import { WARN } from '../engine/validate'
import { stashClear } from '../engine/weekstash'
import { commitSetDayApproved, commitPublishALDay } from '../state/sched-commit'
import { afterSchedMutate } from '../state/view'
import { updatePersonField } from '../state/quals-write'
import { paletteHTML, sansAvailHTML } from '../ui/palette-html'
import { dayHTML } from '../ui/html'
import { getState, initStore as lwInitStore, setPeople, setDayEvent } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { availableFor, postOut, undoPostOut, runOilPass, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const MON = 0, WED = 2, THU = 3, MON_ISO = '2026-07-13', TUE_ISO = '2026-07-14', WED_ISO = '2026-07-15', THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17'
const WIN: [number, number] = [600, 660]
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const cell = (p: string, iso: string) => getState().wars[0]!.grid[p]?.[iso]
/* a day holding one thing: a squadron event for ALL AVAIL, 08:00 to 15:00 — so nobody is named on it */
const onlyTheEvent = (di: number) => { const d: any = DAYS[di]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = [{ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL AVAIL' }]; afterSchedMutate() }
const sansList = (di: number) => sansAvailHTML(di, '', new Set(), new Set(), new Map(), null)
const has = (html: string, id: string) => html.includes(`data-person="${id}"`)
/* his puck's own class list wherever the day's markup draws him */
const puckCls = (html: string, id: string) => [...html.matchAll(new RegExp(`<span class="(puck[^"]*)"[^>]*data-person="${id}"`, 'g'))].map(m => m[1]!)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)                                                        // Wed 15 Jul 26, the demo week
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

describe('D2313 (e) — the crew list follows the posting\'s date', () => {
  it('a day before his posting lists him among the WSOs; from its date he stands under SANS Avail', () => {
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)                 // Hex, posted out as SANS from Wed 15 Jul
    raptorNotify()
    expect(P('rocky').san, 'the posting ran').toBe(true)
    expect(has(sansList(MON), 'rocky'), 'Mon 13 Jul, before his SANS date: not under SANS Avail').toBe(false)
    expect(has(paletteHTML(MON), 'rocky'), '…and still in the crew list, in his WSO column').toBe(true)
    expect(paletteHTML(MON), 'no "no availability filed" strike on a day he was not SANS').not.toMatch(/data-person="rocky"[^>]*SANS — no availability/)
    expect(has(sansList(WED), 'rocky'), 'Wed 15 Jul, his SANS date: under SANS Avail').toBe(true)
    expect(has(sansList(THU), 'rocky'), 'and after it').toBe(true)
  })

  it('his puck on a day before his SANS date wears no SANS line; from the date it does', () => {
    /* the demo Monday and Thursday each name him (an AMT seat; put on a ground row here so both days draw his puck) */
    ;(DAYS[MON] as any).ground.push({ prog: 'BRIEFING', str: '1400', end: '1500', who: 'rocky' })
    ;(DAYS[THU] as any).ground.push({ prog: 'BRIEFING', str: '1400', end: '1500', who: 'rocky' })
    afterSchedMutate()
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    const mon = puckCls(dayHTML(MON, true), 'rocky'), thu = puckCls(dayHTML(THU, true), 'rocky')
    expect(mon.length, 'Monday draws him').toBeGreaterThan(0)
    expect(mon.some(c => /\bsan\b/.test(c)), 'Mon 13 Jul: an ordinary WSO puck').toBe(false)
    expect(thu.length, 'Thursday draws him').toBeGreaterThan(0)
    expect(thu.every(c => /\bsan\b/.test(c)), 'Thu 16 Jul: the purple SANS line').toBe(true)
  })
})

describe('D2313 (a) — a SANS tick made by hand counts from the day it is made', () => {
  it('ticked today: the days before keep him in the ALL AVAIL crowd, today and after leave him out', () => {
    onlyTheEvent(MON); onlyTheEvent(THU)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()       // an admin ticks SANS on Quals, Wed 15 Jul
    expect(P('rocky').san).toBe(true)
    expect(sansOn('rocky', TUE_ISO), 'Tue 14 Jul: not yet SANS').toBe(false)
    expect(sansOn('rocky', WED_ISO), 'Wed 15 Jul, the day of the tick: SANS').toBe(true)
    expect(availableFor(MON_ISO, WIN, DAYS[MON] as any), 'Monday\'s crowd as it was').toContain('rocky')
    expect(availableFor(THU_ISO, WIN, DAYS[THU] as any), 'Thursday\'s crowd: a SANS man not on our programme is out').not.toContain('rocky')
  })

  it('a published holiday he attended behind ALL AVAIL reads nothing pending, keeps its sign-offs and his OIL', () => {
    setDayEvent(MON_ISO, 0, 'PH')
    onlyTheEvent(MON)
    sign(MON); commitSetDayApproved(MON, true); runOilPass()
    expect(cell('rocky', MON_ISO), 'published: Hex, behind ALL AVAIL for 7 hours, earns a full day').toBe('FO')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    raptorNotify()
    /* (nothing pending is what keeps its four sign-offs: a change that waits is what takes them — D45, D103) */
    expect(dayPendingItems(MON).length, 'a hand tick two days later changes nothing on the published Monday').toBe(0)
    ;(DAYS[MON] as any).allhands[0].rmks = 'bring ID'
    afterSchedMutate()
    sign(MON); commitPublishALDay(MON); runOilPass()
    expect(verLabel(dayCurVer(MON))).toBe('AL1')
    expect(cell('rocky', MON_ISO), 'AL1 changed a remark only: his OIL for the Monday stands').toBe('FO')
  })

  it('UNTICKED today: the days before keep him OUT of the crowd, and a published day gains nobody', () => {
    setDayEvent(MON_ISO, 0, 'PH')
    onlyTheEvent(MON); onlyTheEvent(THU)
    expect(P('nick').san, 'Nick is a SANS man in the demo').toBe(true)
    expect(availableFor(MON_ISO, WIN, DAYS[MON] as any)).not.toContain('nick')
    sign(MON); commitSetDayApproved(MON, true); runOilPass()
    expect(cell('nick', MON_ISO), 'not in the crowd: nothing earned').toBeUndefined()
    expect(updatePersonField('nick', { tick: 'san' })).toBeNull()        // SANS taken off by hand, Wed 15 Jul
    raptorNotify()
    expect(P('nick').san).toBe(false)
    expect(sansOn('nick', MON_ISO), 'Mon 13 Jul: he was SANS that day').toBe(true)
    expect(sansOn('nick', WED_ISO), 'from the day of the untick: a regular').toBe(false)
    expect(availableFor(MON_ISO, WIN, DAYS[MON] as any), 'Monday\'s crowd as it went out').not.toContain('nick')
    expect(availableFor(THU_ISO, WIN, DAYS[THU] as any), 'Thursday: a regular, in the crowd').toContain('nick')
    expect(dayPendingItems(MON).length, 'nothing pending on the published Monday').toBe(0)
    expect(has(sansList(MON), 'nick'), 'Monday\'s crew list: still under SANS Avail').toBe(true)
    expect(has(sansList(THU), 'nick'), 'Thursday\'s: among the regulars').toBe(false)
  })

  it('ticked and unticked on the same day leaves no SANS day behind; unticked and re-ticked on the same day leaves no gap', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    expect(P('rocky').san).toBe(false)
    expect([MON_ISO, WED_ISO, THU_ISO].map(d => sansOn('rocky', d)), 'a slip put right the same day').toEqual([false, false, false])
    expect(updatePersonField('nick', { tick: 'san' })).toBeNull()
    expect(updatePersonField('nick', { tick: 'san' })).toBeNull()
    expect(P('nick').san).toBe(true)
    expect([MON_ISO, WED_ISO, THU_ISO].map(d => sansOn('nick', d)), 'SANS throughout, as before the slip').toEqual([true, true, true])
  })
})

describe('D2313 (b) — a hand re-tick after a SANS posting keeps the posting\'s date', () => {
  it('unticked by hand on Fri 17 Jul and ticked again on Sat 18 Jul: SANS from Wed 15 Jul still', () => {
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    at(2026, 7, 17)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()       // off, by hand
    expect(sansOn('rocky', THU_ISO), 'while unticked, the days he was SANS stay SANS').toBe(true)
    expect(sansOn('rocky', FRI_ISO), 'from the untick: a regular').toBe(false)
    at(2026, 7, 18)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()       // on again, by hand
    expect(P('rocky').san).toBe(true)
    expect([TUE_ISO, WED_ISO, THU_ISO, FRI_ISO, '2026-07-18'].map(d => sansOn('rocky', d)), 'SANS from the posting\'s date, no gap').toEqual([false, true, true, true, true])
  })

  it('a posting taken back takes its SANS days with it', () => {
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    expect(sansOn('rocky', THU_ISO)).toBe(true)
    expect(undoPostOut('rocky')).toBe(true)
    raptorNotify()
    expect(P('rocky').san).toBe(false)
    expect([MON_ISO, WED_ISO, THU_ISO].map(d => sansOn('rocky', d)), 'never SANS: the posting never was').toEqual([false, false, false])
  })
})

describe('D2313 (c) — a man named on a published day before his posting leaves it unchanged', () => {
  it('named on the published Monday (the demo\'s AMT seat), posted out as SANS from Wednesday: nothing pending', () => {
    sign(MON); commitSetDayApproved(MON, true)
    expect(dayPendingItems(MON).length).toBe(0)
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    expect(P('rocky').san).toBe(true)
    expect(dayPendingItems(MON).length, 'he was not SANS on Mon 13 Jul: the day is as published').toBe(0)
  })

  it('…and the same for a SANS tick made by hand', () => {
    sign(MON); commitSetDayApproved(MON, true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    raptorNotify()
    expect(dayPendingItems(MON).length).toBe(0)
  })

  it('a published day ON or AFTER his SANS date that names him still reads pending — he is SANS there now', () => {
    ;(DAYS[THU] as any).ground.push({ prog: 'BRIEFING', str: '1400', end: '1500', who: 'rocky' })
    afterSchedMutate()
    sign(THU); commitSetDayApproved(THU, true)
    expect(dayPendingItems(THU).length).toBe(0)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()       // SANS from Wed 15 Jul
    raptorNotify()
    expect(dayPendingItems(THU).length, 'Thu 16 Jul prints him as a regular and he is SANS now: one change waits').toBeGreaterThan(0)
  })

  it('flying on a day before his SANS date raises no SANS availability warning there', () => {
    const d: any = DAYS[MON]
    d.waves[0].formations[0].aircraft[0].w = 'rocky'
    afterSchedMutate()
    /* a SANS availability he files once SANS, for Thursday's sim only — on Monday it must judge nothing */
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    INPUTS.push({ person: 'rocky', date: d.dt, allday: true, type: 'SANS Availability', sans: { o: true }, mod: 'now' } as any)
    afterSchedMutate()
    const mon = (WARN.byDay && WARN.byDay[MON] && WARN.byDay[MON].warns) || []
    expect(mon.filter((w: any) => w.code === 'SANS_AVAIL'), 'Mon 13 Jul: he flew as a regular').toEqual([])
  })
})
