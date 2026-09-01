/* The ⓘ info-only flag (owner, 1 Sep 26) — a Ground / Common Programme row
   with `info:true` is shown on the programme but never checked. These tests
   pin every rule seam the flag must silence, one by one, because a missed
   seam is a SILENT defect (an "info" item still minting OIL or greying a
   name says nothing until someone is wrongly flagged or paid).

   Seed rows used, Monday (di 0):
   · allhands[4]  STANDARDISATION MEETING 13:30–14:30, pump — pump also flies
     RU wave 1 (13:40–15:05), so the seed carries a genuine clash to silence.
   · ground[0]    HQ ENGAGEMENT 08:45–16:30, dj.
   personCount is deliberately NOT excluded: it counts every place a person is
   WRITTEN into the week (cancelled rows included — see avail.ts), and an info
   row still writes him in. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { personBusy, dayEngaged, personCount, slotBar, slotRules } from './avail'
import { validate, WARN, dayEvents } from './validate'
import { dayOilSpans } from './oil'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const AH = 4                       // STANDARDISATION MEETING, pump
const overlaps = (spans: any[], s: number, e: number) =>
  spans.some(([a, b]: any) => a < e && b > s)

describe('ⓘ info-only — the engine seams', () => {
  it('leaves the event stream (and with it every validator rule)', () => {
    expect(dayEvents(0, 'pump').some((e: any) => e.key === `a:0.${AH}`)).toBe(true)
    expect(dayEvents(0, 'dj').some((e: any) => e.key === 'g:0.0')).toBe(true)
    DAYS[0].allhands[AH].info = true
    DAYS[0].ground[0].info = true
    validate()
    expect(dayEvents(0, 'pump').some((e: any) => e.key === `a:0.${AH}`)).toBe(false)
    expect(dayEvents(0, 'dj').some((e: any) => e.key === 'g:0.0')).toBe(false)
  })

  it('the seed clash on pump goes quiet, and returns when flipped back', () => {
    const clash = () => (WARN.all || []).some((w: any) =>
      w.code === 'DOUBLE_BOOK' && (w.who || []).includes('pump') && /STANDARDISATION/.test(w.msg || ''))
    expect(clash()).toBe(true)
    DAYS[0].allhands[AH].info = true
    validate()
    expect(clash()).toBe(false)
    DAYS[0].allhands[AH].info = false
    validate()
    expect(clash()).toBe(true)
  })

  it('occupies nobody\'s time (personBusy)', () => {
    /* nact's ONLY Monday commitment is the MET + NOTAM BRIEF (allhands[1],
       08:15–08:30) — pump is no probe here, his own sortie's step padding
       (12:40 for a 13:40 take-off) covers the meeting's hours regardless */
    expect(overlaps(personBusy(DAYS[0], 'nact'), 8 * 60 + 15, 8 * 60 + 30)).toBe(true)
    expect(overlaps(personBusy(DAYS[0], 'dj'), 9 * 60, 9 * 60 + 30)).toBe(true)
    DAYS[0].allhands[1].info = true
    DAYS[0].ground[0].info = true
    expect(overlaps(personBusy(DAYS[0], 'nact'), 8 * 60 + 15, 8 * 60 + 30)).toBe(false)
    expect(overlaps(personBusy(DAYS[0], 'dj'), 9 * 60, 9 * 60 + 30)).toBe(false)
  })

  it('marks nobody engaged in the palette (dayEngaged)', () => {
    expect(dayEngaged(DAYS[0]).has('dj')).toBe(true)
    DAYS[0].ground[0].info = true
    DAYS[0].ground[4].info = true   // dj's second ground row, TRAINING CMD VISIT
    expect(dayEngaged(DAYS[0]).has('dj')).toBe(false)
  })

  it('still counts as ink on the week (personCount unchanged, like cx)', () => {
    const n = personCount('dj')
    DAYS[0].ground[0].info = true
    expect(personCount('dj')).toBe(n)
  })

  it('mints no OIL (dayOilSpans)', () => {
    /* same nact/dj probes as personBusy — a slice only the info row covers */
    expect(overlaps(dayOilSpans(DAYS[0])['nact'] || [], 8 * 60 + 15, 8 * 60 + 30)).toBe(true)
    expect(overlaps(dayOilSpans(DAYS[0])['dj'] || [], 9 * 60, 9 * 60 + 30)).toBe(true)
    DAYS[0].allhands[1].info = true
    DAYS[0].ground[0].info = true
    expect(overlaps(dayOilSpans(DAYS[0])['nact'] || [], 8 * 60 + 15, 8 * 60 + 30)).toBe(false)
    expect(overlaps(dayOilSpans(DAYS[0])['dj'] || [], 9 * 60, 9 * 60 + 30)).toBe(false)
  })

  it('the crew picker stands down on an info row (slotBar)', () => {
    /* divot is on a downchit Jul 13 — arming a live programme slot names it */
    expect(slotBar('divot', `a:0.${AH}.+`)).not.toBe('')
    expect(slotBar('divot', 'g:0.0.+')).not.toBe('')
    DAYS[0].allhands[AH].info = true
    DAYS[0].ground[0].info = true
    expect(slotRules(`a:0.${AH}.+`).infoRow).toBe(true)
    expect(slotBar('divot', `a:0.${AH}.+`)).toBe('')
    expect(slotBar('divot', 'g:0.0.+')).toBe('')
  })
})
