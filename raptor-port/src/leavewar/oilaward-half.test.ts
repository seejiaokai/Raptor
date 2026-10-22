// AN HO BELONGS TO A HALF OF ITS DAY (owner, D1164, 21 Oct 26 — "Can the HO indicated also be like shown in half either
// am or pm"; FO stays a whole-day box, D1160).
//
// The readings said to him with the picture, and pinned here:
//   - an HO the admin gives by hand takes the half he picks — the morning unless he picks the afternoon; an award stored
//     before D1164 carries no half and reads as the morning, and still loads (D401);
//   - one the app credits itself takes the half the work fell in — "work starting before noon, the morning";
//   - an HO sharing its day with a half day's leave takes the other half (the default the admin's pick opens on).
// The half is only where the box is DRAWN (`Contrib.win`): an award still clashes with nothing (D80), the schedule's HO
// still clashes by its real hours, and no balance, charge or manning figure moves with it.

import { beforeEach, describe, expect, it } from 'vitest'
import { balanceOf } from './engine'
import { AM, FULL, PM, dayView, type Contrib } from './engine/dayview'
import { awardContrib, awardHalf, creditHalf, freeHalfFor, recContribs, type CreditRec } from './engine/warrecs'
import { DEFAULT_OIL_POLICY, oilLedgerFor } from './engine/oiltracker'
import type { LedgerEntry } from './engine/counters'
import {
  awardsOnDay, defaultAwardHalf, editAward, figureCtxOf, getState, grantOil, grantTo, ingestDutyCredit, initStore,
  lwHistInit, lwRedo, lwUndo, oilOnDay, rawState, setCell, setDayAward, setRole, updateLedgerEntry,
} from './state/store'
import { ledgerKey } from './state/rows'
import { memoryBackend, type StorageBackend } from './state/storage'

const P = 'slammed'
const Q = 'ramp'
const TUE = '2026-01-13'
const SAT = '2026-01-03'
let backend: StorageBackend

beforeEach(() => {
  backend = memoryBackend()
  initStore(backend)
  lwHistInit()
  setRole('admin')
})

const view = (p: string, d: string) => getState().wars.find(w => w.period.start <= d && d <= w.period.end)?.views[p]?.[d]
const awardWin = (p: string, d: string) => view(p, d)?.all.find(c => c.kind === 'credit' && !c.auto)?.win
const oilOf = (p: string) => { const s = getState(); return balanceOf(s.openings, s.ledger, s.wars, p, 'oil') }
const entry = (over: Partial<LedgerEntry>): LedgerEntry =>
  ({ id: 'e1', personId: P, counter: 'oil', amount: 0.5, date: TUE, reason: 'x', approvedBy: 'SABER', ...over })
const auto = (spans?: Array<[number, number]>, code: 'FO' | 'HO' = 'HO'): CreditRec =>
  ({ id: 'c1', kind: 'credit', code, oil: 'auto', ...(spans ? { spans } : {}) })
const leave = (id: string, win: readonly [number, number], kind: 'absence' | 'request' = 'absence', extra: Partial<Contrib> = {}): Contrib =>
  ({ id, kind, code: 'LL', win, ...(kind === 'request' ? { state: 'pending' as const } : {}), ...extra })

describe('the engine — where an HO is drawn', () => {
  it('an award: the half picked; none stored reads as the morning; an FO (or 1.5) has none', () => {
    expect(awardHalf(entry({}))).toBe('am')                 // stored before D1164 — the morning
    expect(awardHalf(entry({ half: 'pm' }))).toBe('pm')
    expect(awardHalf(entry({ half: 'am' }))).toBe('am')
    expect(awardHalf(entry({ amount: 1, half: 'pm' }))).toBeNull()
    expect(awardHalf(entry({ amount: 1.5 }))).toBeNull()
    expect(awardContrib(entry({})).win).toEqual(AM)
    expect(awardContrib(entry({ half: 'pm' })).win).toEqual(PM)
    expect(awardContrib(entry({ half: 'pm' })).code).toBe('HO')
    expect(awardContrib(entry({ amount: 1 })).win).toEqual(FULL)
    expect(awardContrib(entry({ amount: 2, half: 'pm' }))).toMatchObject({ code: 'FO', win: FULL, days: 2 })
  })

  it('the schedule’s HO: the half its work started in — before noon the morning, from noon the afternoon', () => {
    expect(creditHalf(auto([[480, 700]]))).toBe('am')        // 08:00–11:40
    expect(creditHalf(auto([[780, 1000]]))).toBe('pm')       // 13:00–16:40
    expect(creditHalf(auto([[600, 840]]))).toBe('am')        // 10:00–14:00 — started before noon
    expect(creditHalf(auto([[719, 900]]))).toBe('am')        // 11:59 — before noon
    expect(creditHalf(auto([[720, 900]]))).toBe('pm')        // 12:00 — not before noon
    expect(creditHalf(auto([[900, 960], [540, 600]]))).toBe('am')   // the EARLIEST stretch decides
    expect(creditHalf(auto())).toBe('am')                    // no hours reported — the morning, as an award
    expect(creditHalf(auto([[480, 1080]], 'FO'))).toBeNull() // an FO stays a whole day
  })

  it('its box takes the half; its real hours ride in `wins`, which every clash reads; an FO is as before', () => {
    expect(recContribs([auto([[480, 700]])])[0]).toMatchObject({ win: AM, wins: [[480, 700]], auto: true, code: 'HO' })
    expect(recContribs([auto([[780, 1000]])])[0]).toMatchObject({ win: PM, wins: [[780, 1000]] })
    expect(recContribs([auto()])[0]).toMatchObject({ win: AM, wins: [FULL] })          // no hours: the whole day for clashes (Q7)
    const fo = recContribs([auto([[480, 1080]], 'FO')])[0]!
    expect(fo.win).toEqual([480, 1080])
    expect(fo.wins).toBeUndefined()
  })
})

describe('the engine — clashes, charge and manning do not move with the drawing', () => {
  const ho = (spans?: Array<[number, number]>) => recContribs([auto(spans)])[0]!

  it('the schedule’s morning HO beside an AFTERNOON leave: no clash (it never was one)', () => {
    const v = dayView([ho([[480, 700]]), leave('L', PM)])
    expect(v.conflicts).toHaveLength(0)
    expect(v.amber).toBe(false)
  })

  it('the schedule’s HO on the SAME half as a leave clashes, by its real hours, as before', () => {
    expect(dayView([ho([[480, 700]]), leave('L', AM)]).conflicts).toHaveLength(1)
    /* drawn in the morning, but its hours run into the afternoon — still a clash with an afternoon's leave */
    expect(dayView([ho([[600, 840]]), leave('L', PM)]).conflicts).toHaveLength(1)
    /* a gap: an afternoon HO worked 13:00–14:00 and leave 15:00–16:00 sit side by side */
    expect(dayView([ho([[780, 840]]), leave('L', [900, 960])]).conflicts).toHaveLength(0)
    /* no hours reported: the whole day for every overlap (owner Q7) — a clash with either half, as before */
    expect(dayView([ho(), leave('L', PM)]).conflicts).toHaveLength(1)
  })

  it('an award HO clashes with nothing, in either half (D80)', () => {
    for (const half of ['am', 'pm'] as const) {
      const a = awardContrib(entry({ half }))
      expect(dayView([a, leave('L', AM)]).conflicts).toHaveLength(0)
      expect(dayView([a, leave('L', PM)]).conflicts).toHaveLength(0)
      expect(dayView([a, { id: 'M', kind: 'absence', code: 'ATTC', win: AM }]).conflicts).toHaveLength(0)
    }
  })

  it('the charge, the manning, duty and the OIL earned are those of the records, not of the half drawn', () => {
    const am = dayView([ho([[480, 700]]), leave('L', PM)])
    const pm = dayView([ho([[780, 1000]]), leave('L', AM)])
    for (const v of [am, pm]) {
      expect(v.earnsOil).toBe(0.5)
      expect(v.duty).toBe(true)
      expect(v.away).toBe(0.5)                               // the leave's half — a credit stands nobody down
      expect(v.charges).toEqual([expect.objectContaining({ counter: 'annual', amount: 0.5 })])
      expect(v.main!.kind).toBe('absence')                   // leave over a credit on the ladder, as before
    }
    for (const half of ['am', 'pm'] as const) {
      const v = dayView([awardContrib(entry({ half }))])
      expect(v).toMatchObject({ earnsOil: 0, duty: false, away: 0, charges: [], code: 'HO' })
    }
  })
})

describe('the default half — beside a half-day box, the other half', () => {
  it('a morning leave → the afternoon; an afternoon leave → the morning; nothing, a whole day or both → the morning', () => {
    expect(freeHalfFor([])).toBe('am')
    expect(freeHalfFor([leave('L', AM)])).toBe('pm')
    expect(freeHalfFor([leave('L', PM)])).toBe('am')
    expect(freeHalfFor([leave('L', FULL)])).toBe('am')
    expect(freeHalfFor([leave('L', AM), leave('M', PM)])).toBe('am')
    expect(freeHalfFor([leave('R', AM, 'request')])).toBe('pm')                         // a bid waiting
    expect(freeHalfFor([leave('R', AM, 'request', { state: 'refused' })])).toBe('am')   // a refused bid is history
    expect(freeHalfFor([{ id: 'M', kind: 'absence', code: 'ATTC', win: AM }])).toBe('pm') // a medical's half too
    expect(freeHalfFor([leave('T', AM, 'absence', { spill: true })])).toBe('am')        // yesterday's tail is no box here
    expect(freeHalfFor([awardContrib(entry({ id: 'h1' }))])).toBe('pm')                 // another HO in the morning
    expect(freeHalfFor([awardContrib(entry({ id: 'h1' }))], 'h1')).toBe('am')           // …unless it is the one changed
    expect(freeHalfFor([{ id: 'C', kind: 'absence', code: 'CSE', win: AM }])).toBe('am') // a course is never drawn in a half
  })

  it('the store asks the day itself: a morning bid on the day turns the default to the afternoon', () => {
    expect(defaultAwardHalf(P, TUE)).toBe('am')
    expect(setCell(P, TUE, '*LL')).toBe(true)
    expect(defaultAwardHalf(P, TUE)).toBe('pm')
  })
})

describe('the writers store the half', () => {
  it('+OIL on the grid: the half picked; none picked, the day’s default; an FO none', () => {
    expect(setDayAward(P, TUE, 0.5, { half: 'pm' })).toBeNull()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
    expect(awardWin(P, TUE)).toEqual(PM)

    expect(setDayAward(Q, TUE, 0.5)).toBeNull()
    expect(awardsOnDay(Q, TUE)[0]!.half).toBe('am')
    expect(awardWin(Q, TUE)).toEqual(AM)

    expect(setDayAward(P, SAT, 1, { half: 'pm' })).toBeNull()
    expect(awardsOnDay(P, SAT)[0]!.half).toBeUndefined()
    expect(awardWin(P, SAT)).toEqual(FULL)
  })

  it('beside a morning leave a new HO takes the afternoon — and the admin may still pick the morning', () => {
    setCell(P, TUE, '*LL')
    setCell(Q, TUE, '*LL')
    expect(setDayAward(P, TUE, 0.5)).toBeNull()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
    expect(setDayAward(Q, TUE, 0.5, { half: 'am' })).toBeNull()
    expect(awardsOnDay(Q, TUE)[0]!.half).toBe('am')
    expect(view(Q, TUE)!.amber).toBe(false)                 // an award clashes with nothing, whichever half (D80)
  })

  it('changing one: the half moves; an HO keeps its half when only its reason changes; made whole, it drops the half', () => {
    setDayAward(P, TUE, 0.5, { half: 'pm' })
    const id = awardsOnDay(P, TUE)[0]!.id
    expect(setDayAward(P, TUE, 0.5, { note: 'Recovery' })).toBeNull()
    expect(awardsOnDay(P, TUE)[0]).toMatchObject({ half: 'pm', reason: 'Recovery' })
    expect(editAward(id, { half: 'am' })).toBeNull()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('am')
    expect(editAward(id, { days: 1 })).toBeNull()
    expect(awardsOnDay(P, TUE)[0]!.half).toBeUndefined()
    expect(awardWin(P, TUE)).toEqual(FULL)
    /* back to half a day: the day's default, the award's own old half not standing in its own way */
    setCell(P, TUE, '*LL')
    expect(editAward(id, { days: 0.5 })).toBeNull()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
  })

  it('a no-op is a no-op: the same half sent again writes nothing (no undo step)', () => {
    setDayAward(P, TUE, 0.5, { half: 'pm' })
    const before = rawState().ledger
    expect(updateLedgerEntry(awardsOnDay(P, TUE)[0]!.id, { half: 'pm' })).toBeNull()
    expect(rawState().ledger).toBe(before)
  })

  it('the OIL tracker’s grant: the half picked for everyone; none picked, each man’s own default', () => {
    expect(grantOil([P], 0.5, TUE, 'SIM', '', 'pm')).toBeNull()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
    setCell(Q, '2026-01-14', '*LL')
    expect(grantOil([P, Q], 0.5, '2026-01-14', 'SIM')).toBeNull()
    expect(awardsOnDay(P, '2026-01-14')[0]!.half).toBe('am')
    expect(awardsOnDay(Q, '2026-01-14')[0]!.half).toBe('pm')
    /* a whole day, a correction and another pool never carry one, whatever is passed */
    expect(grantOil([P], 1, '2026-01-15', 'x', '', 'pm')).toBeNull()
    expect(awardsOnDay(P, '2026-01-15')[0]!.half).toBeUndefined()
    expect(grantOil([P], -0.5, '2026-01-16', 'Correction', '', 'pm')).toBeNull()
    expect(grantTo([P], 'annual', 0.5, '2026-01-16', '', '', 'pm')).toBeNull()
    expect(rawState().ledger.filter(e => e.date === '2026-01-16').every(e => e.half === undefined)).toBe(true)
  })

  it('Undo and Redo carry the half with the award (one command)', () => {
    setDayAward(P, TUE, 0.5, { half: 'pm' })
    const id = awardsOnDay(P, TUE)[0]!.id
    expect(editAward(id, { half: 'am' })).toBeNull()
    lwUndo()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
    expect(awardWin(P, TUE)).toEqual(PM)
    lwRedo()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('am')
    expect(awardWin(P, TUE)).toEqual(AM)
    lwUndo(); lwUndo()
    expect(awardsOnDay(P, TUE)).toHaveLength(0)
    lwRedo()
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
  })
})

describe('stored — one row per entry, and the old shape still loads (D401)', () => {
  it('the half is in the award’s own row and survives a reload', () => {
    setDayAward(P, TUE, 0.5, { half: 'pm' })
    const id = awardsOnDay(P, TUE)[0]!.id
    expect(JSON.parse(backend.read(ledgerKey(id))!).half).toBe('pm')
    initStore(backend)                                       // the reload
    setRole('admin')
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
    expect(awardWin(P, TUE)).toEqual(PM)
  })

  it('an HO stored with no half (before D1164) loads and reads as the morning; a bad half is dropped, the entry kept', () => {
    backend.write(ledgerKey('old1'), JSON.stringify({ id: 'old1', personId: P, counter: 'oil', amount: 0.5, date: TUE, reason: 'old', approvedBy: 'SQNCDR' }))
    backend.write(ledgerKey('old2'), JSON.stringify({ id: 'old2', personId: Q, counter: 'oil', amount: 0.5, date: TUE, reason: 'bad', approvedBy: 'SQNCDR', half: 'noon' }))
    backend.write(ledgerKey('old3'), JSON.stringify({ id: 'old3', personId: Q, counter: 'oil', amount: 1, date: SAT, reason: 'fo', approvedBy: 'SQNCDR', half: 'pm' }))
    initStore(backend)
    setRole('admin')
    const old1 = rawState().ledger.find(e => e.id === 'old1')!
    expect(old1.half).toBeUndefined()
    expect(awardWin(P, TUE)).toEqual(AM)
    expect(rawState().ledger.find(e => e.id === 'old2')).toMatchObject({ reason: 'bad' })
    expect(rawState().ledger.find(e => e.id === 'old2')!.half).toBeUndefined()
    expect(rawState().ledger.find(e => e.id === 'old3')!.half).toBeUndefined()    // an FO never carries one
    expect(awardWin(Q, SAT)).toEqual(FULL)
  })
})

describe('balances and read-backs', () => {
  it('the OIL balance is the same whichever half an HO is in', () => {
    const before = oilOf(P)
    setDayAward(P, TUE, 0.5, { half: 'am' })
    expect(oilOf(P)).toBe(before + 0.5)
    editAward(awardsOnDay(P, TUE)[0]!.id, { half: 'pm' })
    expect(oilOf(P)).toBe(before + 0.5)
  })

  it('every read-back names the half: the day’s OIL list and the OIL tracker’s line, award and earned alike', () => {
    setDayAward(P, TUE, 0.5, { half: 'pm' })
    expect(oilOnDay(P, TUE)[0]).toMatchObject({ award: true, code: 'HO', half: 'pm' })
    expect(ingestDutyCredit(P, SAT, 'HO', 'Duty', [[780, 960]])).toBeTruthy()
    expect(oilOnDay(P, SAT).find(c => !c.award)).toMatchObject({ code: 'HO', half: 'pm', spans: [[780, 960]] })

    const led = oilLedgerFor(figureCtxOf(), P, DEFAULT_OIL_POLICY, '2026-12-31')
    const grant = led.credits.find(c => c.source === 'grant' && c.date === TUE)!
    expect(grant.half).toBe('pm')
    const earned = led.credits.find(c => c.source === 'auto' && c.date === SAT)!
    expect(earned).toMatchObject({ half: 'pm', hours: [[780, 960]], amount: 0.5 })
    /* an FO says no half */
    setDayAward(Q, TUE, 1)
    expect(oilOnDay(Q, TUE)[0]!.half).toBeUndefined()
  })

  it('the schedule’s HO with no hours reads the morning and still shows no hours in the tracker', () => {
    expect(ingestDutyCredit(P, SAT, 'HO', 'Duty')).toBeTruthy()
    const earned = oilLedgerFor(figureCtxOf(), P, DEFAULT_OIL_POLICY, '2026-12-31').credits.find(c => c.source === 'auto' && c.date === SAT)!
    expect(earned.half).toBe('am')
    expect(earned.hours).toBeUndefined()
  })
})
