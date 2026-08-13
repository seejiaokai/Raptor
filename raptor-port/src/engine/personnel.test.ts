/* Personnel (ground crew), owner Aug 26. A non-flying category: no CAT, no
   qualifications, planned into ground work and a REAR cockpit (an incentive
   ride) only — never a front seat. They carry ONLY the conflict, long-workday
   and 7-day-run checks; every flying-specific rule (crew rest, tight/double
   turn, the seat/qual rules, the pairing matrix, AAR, SC currency) is off for
   them. A rear-seat ride raises the crew-pairing CP advisory (PAX_CREW). See
   docs/engine-rules.md §Personnel. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, isPersonnel, deriveQuals } from './people'
import { VCONF } from './rules'
import { validate, WCODE, chipOf, sevOf } from './validate'
import { slotBar } from './avail'
import { setSlotVal } from './slots'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  VCONF.maxRun = 6
  validate()
})

const PID = 'torque'   // a seeded ground-crew body
const forTorque = (code?: string) => validate().all.filter((w: any) =>
  (w.who || []).includes(PID) && (!code || w.code === code))
/* put a body on a ground item on each of the named days (mirrors daysrun.test) */
const workOn = (id: string, days: number[], str = '0900', end = '1000') => days.forEach(di => {
  DAYS[di].ground = DAYS[di].ground || []
  DAYS[di].ground.push({ prog: 'HANGAR', str, end, who: id })
})

describe('the personnel category', () => {
  it('is seeded, flagged, and holds no CAT', () => {
    expect(isPersonnel(PID)).toBe(true)
    expect(PEOPLE[PID].pers).toBe(true)
    expect(PEOPLE[PID].seat).toBe('GND')
    expect(PEOPLE[PID].q).toBe('')
  })

  it('derives an empty quals object — boot grants nothing', () => {
    deriveQuals(PEOPLE[PID])                       // re-run the boot deriver
    expect(PEOPLE[PID].quals).toEqual({})
    expect(PEOPLE[PID].quals.scDay).toBeFalsy()    // the SC boot pass skips them
    expect(PEOPLE[PID].quals.daar).toBeFalsy()
    expect(PEOPLE[PID].quals.sched).toBeFalsy()
  })
})

describe('personnel seat eligibility (slotBar)', () => {
  it('is barred from a front seat, flying or sim', () => {
    expect(slotBar(PID, '0.0.0.0.p')).toMatch(/front seat/)
    expect(slotBar(PID, 's:0.oft.0.p')).toMatch(/front seat/)
  })
  it('may take a rear seat, a duty desk and a ground row', () => {
    expect(slotBar(PID, '0.0.0.0.w')).toBe('')     // rear cockpit — the incentive ride
    expect(slotBar(PID, 'd:0.0.0')).toBe('')       // a duty desk
    expect(slotBar(PID, 'g:0.0')).toBe('')         // a ground programme row
  })
})

describe('the three rules that DO apply', () => {
  it('a front-seat placement is an illegal seat (QUAL)', () => {
    setSlotVal('0.0.0.0.p', PID)
    const q = forTorque('QUAL')
    expect(q.length).toBeGreaterThan(0)
    expect(q[0].sev).toBe('hard')
    expect(q[0].msg).toMatch(/ground crew/)
    expect(chipOf(0, PID)).toBe('Q')
  })

  it('two overlapping seats at once is a hard conflict (DOUBLE_BOOK)', () => {
    setSlotVal('0.0.0.0.w', PID)
    setSlotVal('0.0.0.1.w', PID)                   // second aircraft, same wave window
    const c = forTorque('DOUBLE_BOOK')
    expect(c.length).toBeGreaterThan(0)
    expect(c[0].sev).toBe('hard')
  })

  it('a long working day raises the long-day note (LONGDAY)', () => {
    workOn(PID, [0], '0500', '1900')               // 14h — over the 12h bar
    const ld = forTorque('LONGDAY')
    expect(ld.length).toBe(1)
    expect(ld[0].sev).toBe('note')
  })

  it('seven days on the programme raises the break-day flag (DAYS_RUN)', () => {
    workOn(PID, [0, 1, 2, 3, 4, 5, 6])
    const r = forTorque('DAYS_RUN')
    expect(r.length).toBe(1)
    expect(r[0].di).toBe(6)                         // the day that breaks the limit
    expect(chipOf(6, PID)).toBe('RUN')
  })
})

describe('a rear-seat ride raises the crew-pairing CP advisory', () => {
  it('PAX_CREW lands on the passenger, amber, in the day list', () => {
    setSlotVal('0.0.0.0.w', PID)
    const p = forTorque('PAX_CREW')
    expect(p.length).toBe(1)
    expect(p[0].sev).toBe('adv')
    expect(p[0].msg).toMatch(/incentive passenger/)
    /* reuses the existing CP chip, so the squadron reads one flag */
    expect(chipOf(0, PID)).toBe('CP')
    expect(sevOf(0, PID)).toBe('adv')
  })
})

describe('the flying-only rules are OFF for personnel', () => {
  it('flying twice in a day is not "double turning"', () => {
    /* a real WSO in two sorties one day IS double turning */
    setSlotVal('0.0.0.0.w', 'freak')
    setSlotVal('0.1.0.0.w', 'freak')
    expect(validate().all.some((w: any) => w.code === 'DT_SUM' && (w.who || []).includes('freak'))).toBe(true)
    /* the same two rear seats filled by a personnel raise no DT/TT — only the
       two incentive-ride advisories */
    setSlotVal('0.0.0.0.w', PID)
    setSlotVal('0.1.0.0.w', PID)
    const tw = forTorque()
    expect(tw.some((w: any) => w.code === 'DT_SUM' || w.code === 'TURN')).toBe(false)
    expect(tw.every((w: any) => w.code === 'PAX_CREW')).toBe(true)
  })

  it('no crew-rest, matrix, AAR or currency code ever attaches to a personnel', () => {
    /* a rich scenario: rides on two flying days, a long ground day, and a
       seven-day run — a real body would collect crew rest, turns and more. */
    setSlotVal('0.0.0.0.w', PID)                   // day 0 ride
    setSlotVal('1.0.0.1.w', PID)                   // day 1 ride (casper's breaching lineage)
    workOn(PID, [0, 1, 2, 3, 4, 5, 6], '0500', '1900')
    const ALLOWED = new Set(['QUAL', 'PAX_CREW', 'DOUBLE_BOOK', 'LONGDAY', 'DAYS_RUN'])
    const codes = [...new Set(forTorque().map((w: any) => w.code))]
    expect(codes.length).toBeGreaterThan(0)        // the scenario really does task him
    expect(codes.filter(c => !ALLOWED.has(c as string)), codes.join(',')).toEqual([])
  })
})

describe('reference-parity guards', () => {
  it('PAX_CREW has a WCODE sentence', () => {
    expect(WCODE.PAX_CREW).toBeTruthy()
  })
  it('the seed week raises no PAX_CREW — nothing fires on the reference', () => {
    expect(validate().all.filter((w: any) => w.code === 'PAX_CREW')).toEqual([])
  })
})
