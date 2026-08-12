/* AUDIT C — the one cross-day coupling: an edit on day N that changes its crew
   rest rewrites day N−1's trace, and NOTHING else. HANDOFF names N−1 as the
   only day-isolation exemption; the perf probe asserts it in a browser, but no
   engine test drove a brief edit through the funnel and watched the trace and
   every other day's HTML at once. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate, traceOf } from './validate'
import { txtSet } from './slots'
import { dayHTML } from '../ui/html'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

describe('a day-N brief edit rewrites the N−1 trace and no other day', () => {
  it('editing Wednesday\'s B through the funnel moves Tuesday\'s leave-by; Mon/Thu–Sun are untouched', () => {
    /* Tuesday: split flies late — lands 23:00, +2h debrief → rest clears 13:00 Wed */
    const d1 = DAYS[1].waves[0].formations[0]
    d1.to = '20:00'; d1.ld = '23:00'; d1.br = ''
    d1.aircraft[0].p = 'split'
    /* Wednesday: split on the 10:35 VL line. Its published in-time is 10:00 and
       the default brief 08:15, so the instructed report is 08:15 → a breach. */
    DAYS[2].waves[0].formations[0].aircraft[0].p = 'split'
    validate()
    const before = traceOf(1, 'split')
    expect(before, 'the breach traces onto Tuesday').toBeTruthy()
    expect(before.di).toBe(2)
    expect(before.leaveBy).toBe('20:15')                 // 08:15 + 24h − 12h
    const base = DAYS.map((_: any, di: number) => dayHTML(di, false))
    expect(base[1]).toContain('20:15')                   // the trace prints on the CAUSING day

    /* the edit: the scheduler types an earlier B on the WEDNESDAY line, through
       the same funnel the board cell uses */
    expect(txtSet('ff:2.0.0.br', '06:00')).toBe(true)
    validate()
    const after = traceOf(1, 'split')
    expect(after, 'still a breach — worse now').toBeTruthy()
    expect(after.leaveBy).toBe('18:00')                  // 06:00 + 24h − 12h
    expect(after.msg).not.toBe(before.msg)

    const now = DAYS.map((_: any, di: number) => dayHTML(di, false))
    expect(now[2]).not.toBe(base[2])                     // the edited day repaints
    expect(now[1]).not.toBe(base[1])                     // …and ONLY its yesterday follows
    expect(now[1]).toContain('18:00')
    for (const di of [0, 3, 4, 5, 6]) {
      expect(now[di], `day ${di} must not change`).toBe(base[di])
    }
  })

  it('clearing the breach clears the trace off N−1 the same way', () => {
    const d1 = DAYS[1].waves[0].formations[0]
    d1.to = '20:00'; d1.ld = '23:00'; d1.br = ''
    d1.aircraft[0].p = 'split'
    const d2 = DAYS[2].waves[0].formations[0]
    DAYS[2].waves[0].intimes = []                        // no in-time — the brief alone instructs
    d2.to = '14:00'; d2.ld = '15:00'; d2.br = ''
    d2.aircraft[0].p = 'split'
    validate()
    expect(traceOf(1, 'split'), 'default 11:40 brief breaches 13:00 clearance').toBeTruthy()
    expect(txtSet('ff:2.0.0.br', '13:00')).toBe(true)    // exactly 12h after 01:00 end… 13:00 ≥ clear-at
    validate()
    expect(traceOf(1, 'split')).toBeNull()
  })
})
