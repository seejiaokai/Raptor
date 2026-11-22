/* A SANS POSTING NOT YET RUN, SEEN ON A DAY AFTER ITS DATE — THE CREW LIST'S NOTE AND THE MAN'S BELL LINE (owner D2338,
   22 Nov 26 — "in 15 Jul when the admin see the 18 Jul schedule. Should it say no availability filed, await for 17 Jul for
   SANs availability to be filed"; and "Should we tell the user too": yes; built without a drawing first on his D2339).
   Two parts, each failing before the build:
   (1) the crew list, and the reason an armed seat greys him with, say on a look-ahead day that nothing is filed and that it
       can be filed from the posting's date, on the SANS calendar — from that date the usual words, gone once filed;
   (2) on the posting's date his own bell lists the days he is planned with us with nothing filed; a tap opens the SANS
       calendar on the first of them. Nothing before the date, nothing on anyone else's bell, gone once all are filed.
   And what stays (the order's §8 point 7): the usual words for an ordinary SANS man, and ALL AVAIL's crowd as before.
   The fixture is sans-from-date.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; id `rocky` is Hex, a WSO. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { slotBar } from '../engine/avail'
import { afterSchedMutate, CALMONTH, INPMODE, SANSDAYASK, clearSansDayAsk } from '../state/view'
import { sansAvailHTML } from '../ui/palette-html'
import { noticesFor, noticeWords, type Notice } from '../state/notices'
import { me } from '../state/perms'
import { CURPAGE } from '../state/view'
import { openNotice } from '../ui/topstate'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { availableFor, postOut, runPoOutcomes, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = 4, SAT = 5, FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const LOOK = 'SANS from Fri 17 Jul — no availability filed. It can be filed from that day on the SANS calendar.'
const USUAL = 'SANS — no availability filed for today'
/* his line in a day's crew list, the SANS section, nothing armed — the reason he is struck with (the puck's data-why) */
const whyIn = (di: number, id: string): string | null => {
  const html = sansAvailHTML(di, '', new Set(), new Set(), new Map(), null)
  const m = new RegExp(`<span class="rpuck[^"]*"[^>]*data-person="${id}"([^>]*)>`).exec(html)
  if (!m) return null
  const w = /data-why="([^"]*)"/.exec(m[1]!)
  return w ? w[1]!.replace(/&amp;/g, '&') : ''
}
/* the first WSO seat of a day's first flight, the place an armed seat asks the SANS gate about — the demo's Friday flies
   nothing, so it is given Thursday's first wave first */
const wsoSeat = (di: number): string => {
  const d: any = DAYS[di]
  if (!(d.waves || []).length) { d.waves = [JSON.parse(JSON.stringify((DAYS[3] as any).waves[0]))]; afterSchedMutate() }
  return `${di}.0.0.0.w`
}
/* a briefing on a day naming him — "planned with us" (D2329) */
const plan = (di: number, id: string) => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }); afterSchedMutate() }
/* his SANS availability, filed for a day */
const file = (dt: string, id: string) => { INPUTS.push({ iid: `sa-${id}-${dt}`, person: id, date: dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' } as any); raptorNotify() }
const sansLines = (pid: string): Notice[] => noticesFor(pid).filter(n => (n.what || [])[0]?.k === 'sansdue')

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
  clearSansDayAsk()
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('D2338 (1) — the crew list on a look-ahead day says when SANS availability can be filed', () => {
  it('his example: on Wed 15 Jul, Sat 18 Jul, Hex posted out as SANS from Fri 17 Jul — struck, with the date and where', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(!!P('rocky').san, 'his posting has not run: he is not SANS today').toBe(false)
    expect(sansOn('rocky', SAT_ISO), 'Saturday is a SANS day already (D2329)').toBe(true)
    expect(whyIn(SAT, 'rocky')).toBe(LOOK)
  })

  it('an armed flying seat greys him with the same words (the picker reads the same note)', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(slotBar('rocky', wsoSeat(FRI))).toBe(LOOK)
  })

  it('from the posting\'s date the note is the usual one, and goes once availability is filed', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(!!P('rocky').san, 'his posting ran on Friday').toBe(true)
    expect(whyIn(SAT, 'rocky')).toBe(USUAL)
    expect(slotBar('rocky', wsoSeat(FRI))).toBe(USUAL)
    file((DAYS[SAT] as any).dt, 'rocky')
    expect(whyIn(SAT, 'rocky'), 'filed: no note').toBe('')
  })

  it('stays: an ordinary SANS man with nothing filed reads the usual words', () => {
    expect(P('krait').san).toBe(true)
    expect(whyIn(SAT, 'krait')).toBe(USUAL)
  })

  it('stays: ALL AVAIL counts him on Saturday exactly as before — in when planned with us, out when not (D2329)', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const win: [number, number] = [600, 660]
    expect(availableFor(SAT_ISO, win, DAYS[SAT] as any), 'not planned: another squadron\'s man that day').not.toContain('rocky')
    plan(SAT, 'rocky')
    expect(availableFor(SAT_ISO, win, DAYS[SAT] as any), 'planned with us, free over the window').toContain('rocky')
  })
})

describe('D2338 (2) — on the posting\'s date his bell lists the planned days with nothing filed', () => {
  it('on Fri 17 Jul, Sat 18 planned and unfiled: one line to him, naming the day', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    const ls = sansLines('rocky')
    expect(ls.length).toBe(1)
    expect(noticeWords(ls[0]!)).toEqual({ name: 'Your SANS availability', day: 'Sat 18 Jul', what: 'Planned, no availability filed', who: '' })
  })

  it('nothing on Wed 15 Jul, before the date: he cannot file yet (D2327)', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(sansLines('rocky')).toEqual([])
  })

  it('nothing on an admin\'s own bell — the man himself only', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    const admin = me()!
    expect(admin).toBeTruthy()
    expect(sansLines(admin)).toEqual([])
  })

  it('the line goes once every planned day is filed', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(sansLines('rocky').length).toBe(1)
    file((DAYS[SAT] as any).dt, 'rocky')
    expect(sansLines('rocky')).toEqual([])
  })

  it('a man not planned on any unfiled day gets no line', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(!!P('rocky').san).toBe(true)
    expect(sansLines('rocky')).toEqual([])
  })

  it('several days: named in order, each month once', () => {
    plan(SAT, 'rocky'); plan(FRI, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(noticeWords(sansLines('rocky')[0]!).day).toBe('Fri 17, Sat 18 Jul')
  })

  it('a tap opens the SANS calendar at the first of the days, that day open', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    openNotice(sansLines('rocky')[0]!)
    expect(CURPAGE).toBe('inputs')
    expect(INPMODE).toBe('sans')
    expect(CALMONTH).toEqual({ y: 2026, m: 7 })
    expect(SANSDAYASK).toBe(SAT_ISO)
  })
})
