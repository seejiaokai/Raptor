// @vitest-environment jsdom
/* WHAT "PLANNED" MEANS FOR THE SANS REMINDER (his D2564, 24 Nov 26 — chat 169's round 5): a day is in a SANS man's
   reminder only where he is in a FLYING SEAT or a SIM (OFT, AMT) with nothing filed — the only things SANS availability
   covers, the same the crew list strikes him for on an armed seat and the warning list reads. A ground programme row, a
   duty desk or all hands never puts a day in it.
   The first build (22 Nov 26) read "planned" as named on any row of the day (engine/avail.ts dayEngaged) and said so only
   in a code comment — the bug-check order's §7.11 lesson 32. The reminder now asks ONE definition, engine/avail.ts
   daySansSeats, and the last two blocks here hold that definition to the scheduler's two readers on the same days: the
   checks' own collection (engine/events.ts buildDay — its flying list and its OFT / AMT entries) and an armed seat's
   reason (engine/avail.ts slotBar), so the three cannot drift apart again unseen.
   Fixture: test-support/msq-world.ts (Wed 15 Jul 26). Hex = `rocky`, 142's WSO, posted out as SANS from Fri 17 Jul. */
import { describe, expect, it, beforeEach } from 'vitest'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { daySansSeats, dayEngaged, slotBar, sansNoneWhy } from '../engine/avail'
import { buildDay } from '../engine/events'
import { afterSchedMutate } from '../state/view'
import { NOTICES } from '../state/notices'
import { notify as raptorNotify } from '../state/store'
import { sansUnfiledDays } from './sansunfiled'
import { postOut } from './sync'
import { useMsqWorld, signInAs } from '../test-support/msq-world'

useMsqWorld()
let DAYS0 = ''
const SATI = 5, SAT = '2026-07-18', SUN = '2026-07-19'
// any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
const day = (di = SATI): any => DAYS[di]
const done = () => { afterSchedMutate(); raptorNotify() }
beforeEach(() => {
  if (!DAYS0) DAYS0 = JSON.stringify(DAYS)
  // any: as above
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  NOTICES.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  stashClear()
  signInAs('saber')
  /* Saturday starts bare, so each case holds only the row it puts there */
  const d = day()
  d.waves = []; d.sims = { amt: [], oft: [] }; d.ground = []; d.allhands = []; d.dutywaves = []
  afterSchedMutate()
  expect(postOut('rocky', '2026-07-17', 'sans')).toBe(true); raptorNotify()
})

/* ---- the rows a man can stand on, each put on Saturday; `key` — the place as an armed seat names it ---- */
const line = (w = 'rocky', more: object = {}) => ({ cs: 'VL', msn: 'BFM', to: '10:00', ld: '11:00', aircraft: [{ p: '', w, area: 'NORTH', rmks: '', opts: {}, ...more }] })
/* `armed` — where an armed place's answer differs from `counts`: a cancelled line or box. Its place can still be armed, and
   the crew list then judges the man who would be put there; the reminder follows the checks, for which a cancelled row
   plans nobody. */
const ROWS: Record<string, { put: (id?: string) => void; key: string; counts: boolean; armed?: boolean }> = {
  'a ground programme row': { counts: false, key: `g:${SATI}.0`, put: (id = 'rocky') => { day().ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }) } },
  'a duty desk': { counts: false, key: `d:${SATI}.0.0`, put: (id = 'rocky') => { day().dutywaves.push({ label: '1st wave', rows: [{ role: 'SDO', id, str: '0700', end: '1300' }] }) } },
  'all hands': { counts: false, key: `a:${SATI}.0`, put: (id = 'rocky') => { day().allhands.push({ prog: 'MASS BRIEF', str: '0800', end: '0830', who: id }) } },
  'a flying seat': { counts: true, key: `${SATI}.0.0.0.w`, put: (id = 'rocky') => { day().waves.push({ label: 'WAVE 1', intimes: [], traffic: [], formations: [line(id)] }) } },
  'an OFT seat': { counts: true, key: `s:${SATI}.oft.0.w`, put: (id = 'rocky') => { day().sims.oft.push({ label: 'EP 1', str: '1400', end: '1500', p: '', w: id }) } },
  'an AMT box': { counts: true, key: `s:${SATI}.amt.0.w`, put: (id = 'rocky') => { day().sims.amt.push({ label: 'BOX', str: '1130', end: '1230', pax: [id] }) } },
  /* his D2584 Q4 (25 Nov 26, answering D2576, D2578): SC MAIN, SC SPARE, AVALON and BB need no SANS availability — an SC
     MAIN seat no longer counts for the reminder, the checks or an armed seat (it did under D2564 alone) */
  'an SC MAIN seat': { counts: false, key: `${SATI}.0.0.0.w`, put: (id = 'rocky') => { day().waves.push({ label: 'SC', kind: 'sc', standalone: true, noconf: false, intimes: [], formations: [{ cs: 'SC', msn: 'AM', to: '07:00', ld: '13:00', aircraft: [{ p: '', w: id }] }] }) } },
  'an SC SPARE seat': { counts: false, key: `${SATI}.0.0.0.w`, put: (id = 'rocky') => { day().waves.push({ label: 'SC', kind: 'sc', standalone: true, noconf: false, intimes: [], formations: [{ cs: 'SC', msn: 'AM', to: '07:00', ld: '13:00', aircraft: [{ p: '', w: id, spare: true }] }] }) } },
  'an AVALON seat that only stands by': { counts: false, key: `${SATI}.0.0.0.w`, put: (id = 'rocky') => { day().waves.push({ label: 'AVALON', kind: 'avalon', standalone: true, noconf: true, intimes: [], formations: [{ cs: 'AV', msn: 'DAY', to: '07:00', ld: '19:00', aircraft: [{ p: '', w: id }] }] }) } },
  'a cancelled flight': { counts: false, armed: true, key: `${SATI}.0.0.0.w`, put: (id = 'rocky') => { day().waves.push({ label: 'WAVE 1', intimes: [], traffic: [], formations: [{ ...line(id), cx: true }] }) } },
  'a cancelled jet': { counts: false, armed: true, key: `${SATI}.0.0.0.w`, put: (id = 'rocky') => { day().waves.push({ label: 'WAVE 1', intimes: [], traffic: [], formations: [line(id, { cx: true })] }) } },
  'a cancelled sim': { counts: false, armed: true, key: `s:${SATI}.oft.0.w`, put: (id = 'rocky') => { day().sims.oft.push({ label: 'EP 1', str: '1400', end: '1500', p: '', w: id, cx: true }) } },
}
const file = (dt: string) => { INPUTS.push({ iid: `sa-rocky-${dt}`, person: 'rocky', date: dt, allday: true, type: 'SANS Availability', sans: { f: true, o: true, a: true }, mod: 'now' } as never); raptorNotify() }

describe('D2564 — the reminder counts a day only where he is in a flying seat or a sim', () => {
  for (const [name, row] of Object.entries(ROWS)) {
    it(`${name}, nothing filed: ${row.counts ? 'the day is in his reminder' : 'no reminder day'}`, () => {
      row.put(); done()
      expect(sansUnfiledDays('rocky')).toEqual(row.counts ? [SAT] : [])
    })
  }
  it('a ground row, a duty desk and all hands together still name no day (every one of them counted as "busy" before)', () => {
    ROWS['a ground programme row']!.put(); ROWS['a duty desk']!.put(); ROWS['all hands']!.put(); done()
    expect((dayEngaged(day()) as Set<string>).has('rocky'), 'he is busy that day, as the crew list fades him').toBe(true)
    expect(sansUnfiledDays('rocky')).toEqual([])
  })
  it('a mixed day — a ground row and a flight: the day once', () => {
    ROWS['a ground programme row']!.put(); ROWS['a flying seat']!.put(); ROWS['an OFT seat']!.put(); done()
    expect(sansUnfiledDays('rocky')).toEqual([SAT])
  })
  it('a flying seat with no times typed yet is still a flying seat: the day', () => {
    day().waves.push({ label: 'WAVE 1', intimes: [], traffic: [], formations: [{ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: 'rocky' }] }] }); done()
    expect(sansUnfiledDays('rocky')).toEqual([SAT])
  })
  it('once he files for the day it goes, and a ground row on Sunday adds nothing', () => {
    ROWS['a flying seat']!.put()
    // any: a day of the engine's week is untyped
    ;(DAYS[6] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: 'rocky' }); done()
    expect(sansUnfiledDays('rocky')).toEqual([SAT])
    file('Jul 18')
    expect(sansUnfiledDays('rocky')).toEqual([])
    expect(sansUnfiledDays('rocky')).not.toContain(SUN)
  })
})

describe('D2564 — one definition: the reminder, the checks and an armed seat agree on the same days', () => {
  for (const [name, row] of Object.entries(ROWS)) {
    it(`${name}: the checks' own collection names him exactly where the reminder's definition does`, () => {
      row.put(); done()
      const b = buildDay(day(), SATI, null, null)
      // any: the checks' day is untyped (a verbatim port, src/engine/events.ts)
      const sim = (e: any) => /^s:\d+\.(amt|oft)\./.test(String(e.key || ''))
      // any: as above
      /* the SANS check skips a standby row's entry (`shift`) — his D2584 Q4, validate.ts — so this reads what it reads */
      const checked = new Set<string>([...b.fly.filter((e: any) => !e.shift).map((e: any) => String(e.id)), ...b.events.filter(sim).map((e: any) => String(e.id)), ...b.blank.filter(sim).map((e: any) => String(e.id))])
      expect(checked.has('rocky'), 'what the warning list reads for SANS availability').toBe(row.counts)
      expect((daySansSeats(day()) as Set<string>).has('rocky'), 'the reminder\'s definition').toBe(row.counts)
      expect(sansUnfiledDays('rocky').includes(SAT)).toBe(row.counts)
    })
    it(`${name}: an armed place ${(row.armed ?? row.counts) ? 'strikes him for nothing filed' : 'does not ask his SANS availability'}${row.armed != null && row.armed !== row.counts ? ' (a cancelled row: the one place the two differ, on purpose)' : ', as the reminder'}`, () => {
      /* (asked with another man standing there, as the crew list asks it while a scheduler picks: the place armed, Hex
         not yet on it) */
      row.put('wolf'); done()
      const none = sansNoneWhy((PEOPLE as Record<string, unknown>).rocky, SAT)
      expect(slotBar('rocky', row.key) === none, `slotBar says: ${slotBar('rocky', row.key)}`).toBe(row.armed ?? row.counts)
    })
  }
  it('the demo week, every day: the definition names exactly the men the checks collect for SANS availability', () => {
    // any: a day of the engine's week is untyped
    DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d)); afterSchedMutate()
    // any: as above
    DAYS.forEach((d: any, di: number) => {
      const b = buildDay(d, di, null, null)
      // any: the checks' day is untyped
      const sim = (e: any) => /^s:\d+\.(amt|oft)\./.test(String(e.key || ''))
      // any: as above
      const checked = [...new Set<string>([...b.fly.map((e: any) => String(e.id)), ...b.events.filter(sim).map((e: any) => String(e.id)), ...b.blank.filter(sim).map((e: any) => String(e.id))])].sort()
      expect([...(daySansSeats(d) as Set<string>)].map(String).sort(), `day ${di}`).toEqual(checked)
    })
  })
})
