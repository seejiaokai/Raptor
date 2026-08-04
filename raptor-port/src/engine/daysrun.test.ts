/* Consecutive working days (owner request, Aug 26): nobody may be on the
   programme more than VCONF.maxRun days without a break day, and the flag
   lands on the day that breaks the limit. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { VCONF } from './rules'
import { validate } from './validate'
import { chipOf, sevOf } from './validate'

const SNAP = JSON.stringify(DAYS)
beforeEach(() => { DAYS.length = 0; JSON.parse(SNAP).forEach((d: any) => DAYS.push(d)); VCONF.maxRun = 6 })

/* vegas is deliberate: plasma and spaceman hold the seeded weekend duty rows,
   so neither is ever genuinely free on Sat/Sun and a "break day" test using
   them would be testing nothing.
   put one body on a ground item on each of the named days */
const workOn = (id: string, days: number[]) => days.forEach(di => {
  DAYS[di].ground = DAYS[di].ground || []
  DAYS[di].ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: id })
})
const runs = (id: string) => validate().all.filter((w: any) => w.code === 'DAYS_RUN' && (w.who || []).includes(id))

describe('the break-day rule', () => {
  it('the seed week is clean — nobody works seven in a row', () => {
    expect(validate().all.filter((w: any) => w.code === 'DAYS_RUN')).toEqual([])
  })

  it('six days in a row is the limit and raises nothing', () => {
    workOn('vegas', [0, 1, 2, 3, 4, 5])
    expect(runs('vegas')).toEqual([])
  })

  it('the seventh consecutive day is flagged, on that day', () => {
    workOn('vegas', [0, 1, 2, 3, 4, 5, 6])
    const hits = runs('vegas')
    expect(hits.length).toBe(1)
    expect(hits[0].di).toBe(6)                 // the day that breaks it
    expect(hits[0].sev).toBe('hard')
    expect(hits[0].msg).toContain('7 days in a row')
    expect(hits[0].msg).toContain('break day')
    /* and the puck says so */
    expect(chipOf(6, 'vegas')).toBe('RUN')
    expect(sevOf(6, 'vegas')).toBe('hard')
  })

  it('a break day resets the count — six, off, then more is fine', () => {
    workOn('vegas', [0, 1, 2, 3, 4, 6])       // Saturday off
    expect(runs('vegas')).toEqual([])
  })

  it('the limit is a rule, not a constant', () => {
    workOn('vegas', [0, 1, 2, 3])
    expect(runs('vegas')).toEqual([])
    VCONF.maxRun = 3
    const hits = runs('vegas')
    expect(hits.length).toBe(1)
    expect(hits[0].di).toBe(3)
    expect(hits[0].msg).toContain('3 is the limit')
  })

  it('counts every kind of tasking, not just flying', () => {
    /* Monday..Friday off the seed, then the two weekend duty rows */
    const id = 'vegas'
    workOn(id, [0, 1, 2, 3, 4])
    DAYS[5].dutywaves[0].rows.push({ role: 'SDO', id, str: '0800', end: '1800' })
    DAYS[6].dutywaves[0].rows.push({ role: 'SDO', id, str: '0800', end: '1800' })
    const hits = runs(id)
    expect(hits.length).toBe(1)
    expect(hits[0].di).toBe(6)
  })
})
