// [OIL-WORK-START] half 2 — A PUBLISHED DAY KEEPS THE OIL IT WENT OUT WITH (owner, D592 (4), 5 Oct 26; D48, D142).
//
// The finding that raised it (W1 of the Codex stack check, docs/handpass/2026-10-05-codex-stack-check.md §5.2): Ranger
// on a published Saturday, take-off 10:00, landing 11:15 — a full day, 07:00–13:15. Changing the Logic page's "Nominal
// report before T/O" from 3h to 2h30 made it half a day at once: nothing pending, ORIG, the four sign-offs standing.
// "Flight debrief after land" and the full-day threshold did the same.
//
// Now each published version keeps the three values its OIL was worked out from (the evidence block's `rv`), every
// reader of an issued day's OIL uses them, and a Logic change that WOULD move somebody's OIL reads as one pending change
// until the day is published again. Driven through the real publish path (setDayApproved / publishALDay /
// unpublishDay) and read where the OIL lands — the Leave War's own cell and record.
// Register: docs/superpowers/specs/2026-10-06-oil-work-start-register.md (OWS6–OWS10). Half 1 (where a flying line's
// day starts): src/engine/oilworkstart.test.ts.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setSign, setDayApproved, publishALDay, unpublishDay, dayDelta, dayShownPendCount, daySigned, signMissing, daySnapOf, dayCurVer } from '../engine/publish'
import { VCONF } from '../engine/rules'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, loadWeek } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { recsAt } from './engine/warrecs'
import { runOilPass } from './sync'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const RULES0 = { reportLead: VCONF.reportLead, debrief: VCONF.debrief, oilFullMin: VCONF.oilFullMin }
const SAT = '2026-07-18', SUN = '2026-07-19'

beforeEach(() => {
  Object.assign(VCONF, RULES0)
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})
afterEach(() => Object.assign(VCONF, RULES0))

const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
/* the four, bound to what they signed (the Shell's one write path), so a pending change can take them down */
const signBound = (di: number) => { for (const [r, w] of FOUR) setSign(di, r, w) }
const publish = (di: number) => { sign(di); setDayApproved(di, true) }
const cellOf = (person: string, date: string) => getState().wars[0].grid[person]?.[date]
const worked = (person: string, date: string) =>
  recsAt(getState().wars[0].recs, person, date).filter((r: any) => r.oil === 'auto').map((r: any) => r.spans)
const jet = (p: string) => ({ p, w: '', area: '', rmks: '', opts: {} })
/* a weekend day holding exactly this: one flying line for Bane, and a six-hour desk for Stiff (the control) */
const build = (di: number, to: string, ld: string, intimes: string[] = []) => {
  Object.assign(DAYS[di], {
    waves: [{ label: 'WAVE 1', intimes, formations: [{ cs: 'VL', msn: 'X', to, ld, br: '', aircraft: [jet('bane')] }] }],
    dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id: 'stiff', str: '0800', end: '1400' }] }],
    sims: { amt: [], oft: [] }, ground: [], allhands: [],
  })
}
const oilPending = (di: number) => dayDelta(di).filter((e: any) => e.kind === 'oil')
const keptOn = (di: number) => (daySnapOf(di, dayCurVer(di)) as any).d.oilev.rv

describe('OWS6 — a published day\'s OIL does not move when a Logic value changes (D592 (4), D48)', () => {
  it('the finding itself: "Nominal report before T/O" 3h → 2h30 leaves the published full day a full day', () => {
    build(5, '10:00', '11:15')
    publish(5); runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')                   // 07:00–13:15, six and a quarter hours
    expect(worked('bane', SAT)).toEqual([[[420, 795]]])
    VCONF.reportLead = 150
    runOilPass()
    expect(cellOf('bane', SAT), 'the published day keeps what it went out with').toBe('FO')
    expect(worked('bane', SAT), 'and the times it was worked out from').toEqual([[[420, 795]]])
  })
  it('"Flight debrief after land" 2h → 2h30 does not turn a published half day into a full one', () => {
    build(5, '10:00', '11:00')
    publish(5); runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')                   // 07:00–13:00, six hours exactly
    VCONF.debrief = 150
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')
    expect(worked('bane', SAT)).toEqual([[[420, 780]]])
  })
  it('the full-day threshold, both ways — for a flying line and for a desk', () => {
    build(5, '10:00', '11:15')
    publish(5); runOilPass()
    expect([cellOf('bane', SAT), cellOf('stiff', SAT)]).toEqual(['FO', 'HO'])
    VCONF.oilFullMin = 300                                   // five hours would make Stiff's six a full day
    runOilPass()
    expect([cellOf('bane', SAT), cellOf('stiff', SAT)]).toEqual(['FO', 'HO'])
    VCONF.oilFullMin = 480                                   // eight hours would make Bane's 6h15 a half
    runOilPass()
    expect([cellOf('bane', SAT), cellOf('stiff', SAT)]).toEqual(['FO', 'HO'])
  })
  it('the version keeps the three values it was published with — on the snapshot, never on the working copy', () => {
    build(5, '10:00', '11:15')
    VCONF.reportLead = 170; VCONF.debrief = 130; VCONF.oilFullMin = 370
    publish(5)
    expect(keptOn(5)).toEqual({ reportLead: 170, debrief: 130, oilFullMin: 370 })
    expect((DAYS[5] as any).oilev).toBeUndefined()
  })
  it('a week that is off screen keeps its published OIL too', () => {
    try {
      build(5, '10:00', '11:15')
      publish(5); runOilPass()
      loadWeek('20/07/2026')
      VCONF.reportLead = 150; VCONF.oilFullMin = 480
      runOilPass()
      expect(cellOf('bane', SAT)).toBe('FO')
      expect(worked('bane', SAT)).toEqual([[[420, 795]]])
    } finally { loadWeek('13/07/2026') }
  })
})

describe('OWS7 — a Logic change that would move a published day\'s OIL is ONE pending change (D45, D98, D103)', () => {
  it('it reads pending, takes the four sign-offs down, and clears when the value is put back', () => {
    build(5, '10:00', '11:15')
    publish(5); signBound(5)
    expect(dayShownPendCount(5)).toBe(0)
    expect(daySigned(5)).toBe(true)
    VCONF.reportLead = 150
    expect(oilPending(5).map((e: any) => e.addr)).toEqual(['oilrv:5'])
    expect(dayShownPendCount(5)).toBe(1)
    expect(daySigned(5), 'something waiting means sign again (D103)').toBe(false)
    VCONF.reportLead = 180
    expect(oilPending(5)).toEqual([])
    expect(dayShownPendCount(5)).toBe(0)
    expect(daySigned(5), 'back to what was published: the four stand again (D98)').toBe(true)
  })
  it('each of the three values, each way', () => {
    build(5, '10:00', '11:15')
    publish(5)
    for (const [k, v] of [['reportLead', 150], ['debrief', 60], ['oilFullMin', 300], ['oilFullMin', 480]] as Array<[string, number]>) {
      Object.assign(VCONF, RULES0); (VCONF as any)[k] = v
      expect(oilPending(5).length, `${k} → ${v}`).toBe(1)
    }
  })
  /* both plan challenges (Astra's finding 2, Sol's finding 2): the OIL record is its amount AND its worked times — the
     Leave War's clash check and the day's sheet read the times — so a change that moves only the times is pending too */
  it('a change that moves only a man\'s WORKED TIMES is pending too; the record holds until the day goes out again', () => {
    build(5, '10:00', '11:15')
    publish(5); signBound(5); runOilPass()
    VCONF.reportLead = 170                                   // 07:10–13:15 is still a full day
    expect(oilPending(5).length).toBe(1)
    expect(dayShownPendCount(5)).toBe(1)
    expect(daySigned(5)).toBe(false)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    expect(worked('bane', SAT), 'the record stays exactly as published').toEqual([[[420, 795]]])
    signBound(5); publishALDay(5); runOilPass()              // signed again, for what the day now says — then it goes out
    expect(cellOf('bane', SAT)).toBe('FO')
    expect(worked('bane', SAT), 'published again: the times follow today\'s value').toEqual([[[430, 795]]])
    expect(oilPending(5)).toEqual([])
  })
  it('a change that would write no record on this day differently raises nothing', () => {
    build(5, '', '')                                          // no flying times: only Stiff\'s desk earns, 08:00–14:00
    publish(5); signBound(5); runOilPass()
    VCONF.reportLead = 60; VCONF.debrief = 300               // neither touches a desk
    expect(oilPending(5)).toEqual([])
    expect(dayShownPendCount(5)).toBe(0)
    expect(daySigned(5)).toBe(true)
    VCONF.oilFullMin = 330                                   // still a full day at six hours… and it was a half: this one moves
    expect(oilPending(5).length).toBe(1)
    VCONF.oilFullMin = 365                                   // a different line that leaves six hours a half day
    expect(oilPending(5)).toEqual([])
    expect(daySigned(5)).toBe(true)
  })
  it('a line with an entered in-time is not moved by the nominal lead at all', () => {
    build(5, '10:00', '11:15', ['IN TIME 0700'])
    publish(5)
    VCONF.reportLead = 60
    expect(oilPending(5)).toEqual([])
  })
  it('a day that earns nothing (a published Monday) keeps no values and raises nothing', () => {
    build(0, '10:00', '11:15')
    publish(0)
    expect(keptOn(0)).toBeUndefined()
    VCONF.reportLead = 150; VCONF.debrief = 60; VCONF.oilFullMin = 300
    expect(oilPending(0)).toEqual([])
  })
})

describe('OWS8 — publishing again applies today\'s values, and keeps them', () => {
  it('the next amendment moves the OIL and stores the new values', () => {
    build(5, '10:00', '11:15')
    publish(5); runOilPass()
    VCONF.reportLead = 150
    expect(oilPending(5).length).toBe(1)
    sign(5); publishALDay(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')                   // 07:30–13:15, five and three-quarter hours
    expect(worked('bane', SAT)).toEqual([[[450, 795]]])
    expect(keptOn(5)).toEqual({ reportLead: 150, debrief: 120, oilFullMin: 361 })
    expect(oilPending(5)).toEqual([])
    VCONF.reportLead = 180                                   // and it is now THIS version that holds still
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')
    expect(oilPending(5).length).toBe(1)
  })
  it('Unpublish, then publish again, does the same', () => {
    build(5, '10:00', '11:15')
    publish(5); runOilPass()
    VCONF.reportLead = 150
    unpublishDay(5)
    publish(5); runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')
    expect(keptOn(5).reportLead).toBe(150)
  })
})

describe('OWS9 — an in-time changed after publishing reads pending and moves the OIL only when it goes out', () => {
  it('the credit reads the published version\'s own lines', () => {
    build(5, '10:00', '11:15', ['IN TIME 0700'])
    publish(5); runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    DAYS[5].waves[0].intimes[0] = 'IN TIME 0800'             // the working copy: 08:00–13:15 would be a half day
    runOilPass()
    expect(cellOf('bane', SAT), 'not yet published — the OIL has not moved').toBe('FO')
    expect(dayDelta(5).length, 'and the day says something is waiting').toBeGreaterThan(0)
    sign(5); publishALDay(5); runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')
    expect(worked('bane', SAT)).toEqual([[[480, 795]]])
  })
  it('a report on the evening before lengthens its own day and credits the day before nothing (D592 (3), D42)', () => {
    build(5, '', '')                                          // Saturday: Bane's line has no times — it earns him nothing
    build(6, '01:00', '02:00', ['IN TIME 2100'])              // Sunday 01:00, reporting 21:00 on the Saturday evening
    publish(5); publish(6); runOilPass()
    expect(cellOf('bane', SUN)).toBe('FO')                   // 21:00 → 04:00, seven hours
    expect(cellOf('bane', SAT)).toBeUndefined()
  })
})

/* Astra's plan challenge, finding 1 (6 Oct 26): the pending comparison above protects the ISSUED day. The four also sign a
   CANDIDATE — a day not yet published, or an amendment waiting — and a Logic change after they signed could publish OIL
   they never saw: sign a Saturday desk as a full day, raise the full-day line, publish — a half day goes out on four
   signatures given for a full one. `main` does the same; the build that makes OIL keep its values is the one to close it. */
describe('OWS11 — sign-offs fall when a Logic change would alter the OIL of the day they signed', () => {
  it('a day not yet published: signed as a full day, the full-day line raised — the four fall; put back, they stand', () => {
    build(5, '', '')                                          // no flying times: only Stiff's desk earns
    DAYS[5].dutywaves[0].rows[0].end = '1500'                // 08:00–15:00, seven hours — a full day at the standard line
    signBound(5)
    expect(daySigned(5)).toBe(true)
    VCONF.oilFullMin = 480
    expect(daySigned(5), 'they signed a full day; this would publish a half').toBe(false)
    VCONF.oilFullMin = 361
    expect(daySigned(5)).toBe(true)
  })
  it('an amendment waiting: the published desk unchanged by the new line, the signed change not — the four still fall', () => {
    build(5, '', '')
    DAYS[5].dutywaves[0].rows[0].end = '1000'                // published: two hours, a half day under any line here
    publish(5)
    DAYS[5].dutywaves[0].rows[0].end = '1500'                // the amendment: seven hours, a full day
    signBound(5)
    expect(daySigned(5)).toBe(true)
    VCONF.oilFullMin = 480
    expect(oilPending(5), 'nothing about the PUBLISHED two hours moves').toEqual([])
    expect(daySigned(5), 'but the amendment they signed would now go out as a half day').toBe(false)
    VCONF.oilFullMin = 361
    expect(daySigned(5)).toBe(true)
  })
  it('a Logic change that would write the signed day\'s OIL exactly as it stands leaves the four standing', () => {
    build(5, '10:00', '11:15', ['IN TIME 0700'])              // an entered in-time: the nominal lead is not read at all
    signBound(5)
    VCONF.reportLead = 150
    expect(daySigned(5)).toBe(true)
    VCONF.oilFullMin = 370                                   // 6h15 is over either line
    expect(daySigned(5)).toBe(true)
    VCONF.debrief = 150                                      // …but a longer debrief moves his worked times: sign again
    expect(daySigned(5)).toBe(false)
  })
  it('a value changed between two signatures: the earlier ones fall, the later ones stand (Sol\'s finding 1)', () => {
    build(5, '10:00', '11:15')
    setSign(5, 'cur', 'ignite'); setSign(5, 'sked', 'bane')
    VCONF.reportLead = 150                                   // a full day becomes a half
    setSign(5, 'plan', 'stiff'); setSign(5, 'appr', 'pump')
    expect(signMissing(5), 'the two who signed the full day').toEqual(['CUR CK', 'SKED CK'])
    VCONF.reportLead = 180                                   // back: the first two stand, the last two signed the other value
    expect(signMissing(5)).toEqual(['PLANNED BY', 'APPROVED BY'])
  })
  it('a day that earns nothing is signed for no OIL, and no Logic value touches its sign-offs', () => {
    build(0, '10:00', '11:15')
    signBound(0)
    VCONF.reportLead = 150; VCONF.debrief = 60; VCONF.oilFullMin = 300
    expect(daySigned(0)).toBe(true)
  })
})

describe('OWS10 — a version published before the values were kept still reads, and raises nothing', () => {
  it('no kept values: today\'s are used, as before, and nothing is pending', () => {
    build(5, '10:00', '11:15')
    publish(5)
    delete (SCHED.orig[5] as any).d.oilev.rv                 // as an earlier build wrote it
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    VCONF.reportLead = 150
    expect(() => runOilPass()).not.toThrow()
    expect(oilPending(5)).toEqual([])
    expect(cellOf('bane', SAT)).toBe('HO')                   // the old behaviour, for that old record only
  })
})
