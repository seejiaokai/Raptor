/* AUDIT C — times out of order, garbage in time cells, "2400"/"0000"/midnight
   boundaries, and the half-open overlap edges at every rule window. The
   bounded parse rejects nonsense FORMATS, not wrong VALUES (HANDOFF), so what
   matters is that validate() neither crashes nor invents warnings — and that
   what it silently skips is pinned as the current, known behaviour. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { slotBar } from './avail'
import { collectEvents } from './events'
import { parseHM } from './time'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const hits = (code: string, id: string) =>
  validate().all.filter((x: any) => x.code === code && (x.who || []).includes(id))
const allFor = (id: string, di?: number) =>
  validate().all.filter((x: any) => (x.who || []).includes(id) && (di == null || x.di === di))

describe('times out of order', () => {
  it('a land BEFORE take-off rolls to the next day (the documented transposition trade)', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = '16:00'; f.ld = '09:00'                       // transposed — becomes a 17h overnighter
    f.aircraft[0].p = 'split'
    expect(() => validate()).not.toThrow()
    const ev = collectEvents()[1].fly.find((e: any) => e.id === 'split')
    expect(ev.to).toBe(960)
    expect(ev.ld).toBe(540 + 1440)                       // 09:00 the NEXT day
    // and the rolled tail is live: tomorrow's leave now clashes with it
    INPUTS.push({ person: 'split', date: 'Jul 15', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1).length).toBeGreaterThan(0)
  })

  it('garbage in a take-off cell: validate survives, and that line is silently unchecked', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = 'garbage'; f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(() => validate()).not.toThrow()
    /* KNOWN HOLE, now pinned: an unparseable T/O makes every window NaN, so a
       man on all-day leave planted on the line raises NOTHING — the line
       vanishes from the conflict engine rather than failing closed. */
    expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1)).toEqual([])
    expect(hits('DOUBLE_BOOK', 'split')).toEqual([])
  })

  it('an EMPTY take-off cell behaves the same way — unchecked, not crashed', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = ''; f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(() => validate()).not.toThrow()
    expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1)).toEqual([])
  })

  it('"2400" and "0000" as a duty end both mean midnight, and neither reaches tomorrow', () => {
    expect(parseHM('2400')).toBe(1440)
    expect(parseHM('0000')).toBe(0)
    for (const end of ['2400', '0000']) {
      DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
      INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
      DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '2300', end })
      // today 23:00–23:30 input overlaps the watch either way
      INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 1380, e: 1410, type: 'Meeting', remarks: '', mod: '' })
      expect(hits('INPUT_FLY', 'split').filter((x: any) => x.di === 0).length, end).toBeGreaterThan(0)
      // but tomorrow's all-day leave does not touch a window that DIES at midnight
      INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
      expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 0), end).toEqual([])
    }
  })

  it('a wrong-but-parseable value is taken at face value (the documented non-guard)', () => {
    // parseHM accepts 9999 → 99h99m; the bounded parse rejects formats, not values
    expect(parseHM('9999')).toBe(99 * 60 + 99)
  })

  it('a typed B LATER than a daytime T/O silently disables that line\'s brief check', () => {
    /* documented: the brief is the time INDICATED, and a late clock typed on a
       daytime sortie "remains a visible bad time". Pinned so the silence is a
       decision on record, not a surprise: with a blank B the meeting flags,
       with B=20:00 the same meeting is quiet. */
    const f = DAYS[1].waves[0].formations[0]              // 08:40–10:05, default brief 06:20
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 360, e: 450, type: 'Meeting', remarks: '', mod: '' })
    f.br = ''
    expect(hits('NO_BRIEF', 'split').filter((x: any) => x.di === 1).length).toBeGreaterThan(0)
    f.br = '20:00'
    expect(() => validate()).not.toThrow()
    expect(hits('NO_BRIEF', 'split').filter((x: any) => x.di === 1)).toEqual([])
  })
})

describe('a THIN record — no allday flag, no times', () => {
  it('bars the picker (fails closed) but never warns (fails open) — the recorded drift', () => {
    /* Both halves are individually documented — awayAllDay "fails closed" on
       the availability side, "a record with no usable window stays uncheckable"
       on the validator side — but together they break the repeated invariant
       that the picker and the warning list cannot drift apart: the palette
       strikes the man out while planting him raises NOTHING. Unreachable from
       the two UI entry paths (both always write allday or s/e); a restored
       store or a probe can mint one. Pinned as-is; reported as a finding. */
    INPUTS.push({ person: 'split', date: 'Jul 14', type: 'OL', remarks: '', mod: '' })
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    expect(() => validate()).not.toThrow()
    expect(hits('LEAVE_FLY', 'split')).toEqual([])          // validator: silent
    const bar = (slotBar as any)('split', '1.0.0.0.p')
    expect(bar, bar).toMatch(/overseas leave/)              // picker: barred
  })
})

describe('half-open edges — abutting windows never clash', () => {
  it('a commitment ending exactly at the brief start leaves the brief window alone', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = '13:30'; f.ld = '14:30'; f.br = ''             // brief 11:10–13:30, step 12:30
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 600, e: 670, type: 'Meeting', remarks: '', mod: '' })
    expect(hits('NO_BRIEF', 'split').filter((x: any) => x.di === 1)).toEqual([])
    // one minute over the line and it fires
    INPUTS[INPUTS.length - 1].e = 671
    expect(hits('NO_BRIEF', 'split').filter((x: any) => x.di === 1).length).toBe(1)
  })

  it('a commitment starting exactly at debrief end stays quiet; a minute earlier fires', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = '13:30'; f.ld = '14:30'; f.br = ''             // debrief 14:30–16:30
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 990, e: 1050, type: 'Meeting', remarks: '', mod: '' })
    expect(hits('DEBRIEF', 'split').filter((x: any) => x.di === 1)).toEqual([])
    INPUTS[INPUTS.length - 1].s = 989
    expect(hits('DEBRIEF', 'split').filter((x: any) => x.di === 1).length).toBe(1)
  })

  it('exactly crewRest of rest is legal; one minute short is the hard breach', () => {
    const d0 = DAYS[0].waves[0].formations[0]
    d0.to = '17:00'; d0.ld = '18:00'; d0.br = ''          // ends 18:00 + 2h debrief = 20:00
    d0.aircraft[0].p = 'split'
    const d1 = DAYS[1].waves[0].formations[0]
    DAYS[1].waves[0].intimes = []                         // no published in-time to pre-empt the brief
    d1.to = '11:00'; d1.ld = '12:00'
    d1.aircraft[0].p = 'split'
    d1.br = '08:00'                                       // 12h to the minute after 20:00
    expect(hits('CREW_REST', 'split')).toEqual([])
    expect(hits('CREW_TIGHT', 'split')).toEqual([])
    d1.br = '07:59'
    const h = hits('CREW_REST', 'split')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].leaveBy).toBe('19:59')
  })
})
