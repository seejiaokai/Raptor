// AN AWARD AND A WORKED DAY ADD UP (owner, 21 Sep 26 — ruling N16).
//
//   "Yes an award and a worked day add up. So it's 4. The auto oil credits
//    don't get affected by manual OIL inputs."
//
// A 3-day award on a Saturday the man then works is worth FOUR — the award's
// three plus the day's one. The two are INDEPENDENT: what the published
// schedule earns is never changed by what a person typed, and what a person
// typed is never changed by the schedule.
//
// What this replaces: ONE credit record per person/date, with the schedule
// TAKING AN AWARD OVER in place and stashing it in a `manual` snapshot for the
// unpublish hand-back. Two records side by side make that whole machinery
// unnecessary — and the snapshot is where both of the silent balance bugs of
// 20–21 Sep lived.
//
// Design: `docs/superpowers/specs/2026-09-21-oil-award-add-design.md`.

import { beforeEach, describe, expect, it } from 'vitest'
import { balanceOf } from './engine'
import { listProblem, readRecs, type WarRec } from './engine/warrecs'
import {
  cellProblem, clearRaptorCell, getState, ingestDutyCredit, initStore, rawState,
  setCell, setCellDays, setCellGivenBy, setCellNote, setManualCredit, setRole,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'

const P = 'slammed'
const SAT = '2026-01-03'      // a Saturday inside the seeded war
const TUE = '2026-01-13'      // an ordinary weekday

/** The hours the schedule reports for a worked Saturday, in minutes. */
const WORKED: Array<[number, number]> = [[480, 1080]]      // 08:00–18:00

let backend: StorageBackend

beforeEach(() => {
  backend = memoryBackend()
  initStore(backend)
  setRole('admin')
})

const warAt = (date: string) =>
  rawState().wars.find(w => w.period.start <= date && date <= w.period.end)!
const recsOn = (person: string, date: string): WarRec[] =>
  (warAt(date).recs[person]?.[date] ?? []) as WarRec[]
const creditsOn = (person: string, date: string) =>
  recsOn(person, date).filter(r => r.kind === 'credit') as Array<Extract<WarRec, { kind: 'credit' }>>
const earnedOn = (person: string, date: string) => creditsOn(person, date).find(c => c.oil === 'auto')
const awardOn = (person: string, date: string) => creditsOn(person, date).find(c => c.oil === 'manual')
const worthOf = (person: string, date: string) => getState().views[person]?.[date]?.earnsOil ?? 0
const oilOf = (person: string) => {
  const { openings, ledger, wars } = getState()
  return balanceOf(openings, ledger, wars, person, 'oil')
}

/* ====================================================================== */
/*  1. THE RULING ITSELF (N16)                                            */
/* ====================================================================== */

describe('an award and a worked day ADD UP (N16)', () => {
  it('the owner’s own example: a 3-day award on a Saturday he then works is worth 4', () => {
    const before = oilOf(P)
    expect(setManualCredit(P, SAT, 'FO', { note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 })).toBeNull()
    expect(worthOf(P, SAT)).toBe(3)

    // the Saturday is then published with him on a desk
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBeTruthy()

    expect(worthOf(P, SAT)).toBe(4)
    expect(oilOf(P)).toBe(before + 4)
    expect(creditsOn(P, SAT)).toHaveLength(2)
  })

  it('and the OTHER way round — the schedule first, the award typed on top — is also 4', () => {
    /* The same two facts must not be kept or lost depending on which was
       entered first. That is the reason the owner gave for every other
       clash ruling this month, and it holds here. */
    const before = oilOf(P)
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBe('written')
    expect(setManualCredit(P, SAT, 'FO', { note: 'Exercise recovery', days: 3 })).toBeNull()

    expect(worthOf(P, SAT)).toBe(4)
    expect(oilOf(P)).toBe(before + 4)
  })

  it('an award no longer blocks the day the schedule earns on — that refusal is gone', () => {
    /* It used to say "That day already earns OIL from the published schedule"
       and write nothing, which under N16 is the app refusing to record a fact
       the owner has ruled is separate. */
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBe('written')
    expect(setManualCredit(P, SAT, 'FO', { days: 3 })).toBeNull()
    expect(cellProblem(P, SAT, 'FO')).toBeNull()
  })

  it('each keeps its OWN worth, reason and giver — neither is rewritten by the other', () => {
    setManualCredit(P, SAT, 'FO', { note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 })
    ingestDutyCredit(P, SAT, 'HO', 'SIM', WORKED)

    const award = awardOn(P, SAT)!
    expect(award).toMatchObject({ code: 'FO', oil: 'manual', note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 })
    const earned = earnedOn(P, SAT)!
    expect(earned).toMatchObject({ code: 'HO', oil: 'auto', note: 'SIM' })
    expect(earned.days).toBeUndefined()          // the schedule earns what its code says
    expect(earned.spans).toEqual(WORKED)
    expect((earned as { manual?: unknown }).manual).toBeUndefined()   // no snapshot any more
    expect(worthOf(P, SAT)).toBe(3.5)
  })

  it('does not churn: a second pass over the same day writes nothing new', () => {
    setManualCredit(P, SAT, 'FO', { note: 'Exercise recovery', days: 3 })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const first = JSON.stringify(recsOn(P, SAT))
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBe('confirmed')
    expect(JSON.stringify(recsOn(P, SAT))).toBe(first)
  })
})

/* ====================================================================== */
/*  2. THE TWO NEVER AFFECT EACH OTHER                                    */
/* ====================================================================== */

describe('the two kinds never affect each other', () => {
  it('unpublishing the Saturday takes the day’s 1 and leaves the award’s 3 exactly as typed', () => {
    setManualCredit(P, SAT, 'HO', { note: 'called out for the recovery', givenBy: 'OC Ops', days: 3 })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    expect(worthOf(P, SAT)).toBe(4)

    expect(clearRaptorCell(P, SAT)).toBe(true)

    expect(earnedOn(P, SAT)).toBeUndefined()
    const award = awardOn(P, SAT)!
    // his code, his words, his name, his days — not the schedule's
    expect(award).toMatchObject({ code: 'HO', oil: 'manual', note: 'called out for the recovery', givenBy: 'OC Ops', days: 3 })
    expect(worthOf(P, SAT)).toBe(3)
  })

  it('clearing the award by hand leaves the day the schedule earned', () => {
    setManualCredit(P, SAT, 'FO', { days: 3 })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    expect(setCell(P, SAT, '')).toBe(true)          // the admin's clear
    expect(awardOn(P, SAT)).toBeUndefined()
    expect(earnedOn(P, SAT)).toBeDefined()
    expect(worthOf(P, SAT)).toBe(1)
  })

  it('a credit the schedule ALONE earned is still removed outright', () => {
    ingestDutyCredit(P, TUE, 'FO', 'Duty', WORKED)
    expect(clearRaptorCell(P, TUE)).toBe(true)
    expect(creditsOn(P, TUE)).toHaveLength(0)
  })

  it('the three editors reach the AWARD, never the schedule’s credit', () => {
    /* They look the day's credit up by `find`, which under one record could
       only ever be the right one. With two, the one it finds depends on which
       landed first — so an award typed AFTER a published Saturday would have
       been unreachable and every edit refused. */
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)        // the earned one lands FIRST
    setManualCredit(P, SAT, 'FO', { days: 3 })            // the award second

    expect(setCellNote(P, SAT, 'Exercise recovery')).toBeNull()
    expect(setCellGivenBy(P, SAT, 'OC Ops')).toBeNull()
    expect(setCellDays(P, SAT, 2)).toBeNull()

    expect(awardOn(P, SAT)).toMatchObject({ note: 'Exercise recovery', givenBy: 'OC Ops', days: 2 })
    const earned = earnedOn(P, SAT)!
    expect(earned.note).toBe('Duty')                      // the schedule's own words, untouched
    expect(earned.givenBy).toBeUndefined()
    expect(earned.days).toBeUndefined()
    expect(worthOf(P, SAT)).toBe(3)
  })

  it('with only the schedule’s credit there, those editors still say so', () => {
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    expect(setCellDays(P, SAT, 2)).toContain('published schedule')
    expect(setCellGivenBy(P, SAT, 'OC Ops')).toContain('published schedule')
  })
})

/* ====================================================================== */
/*  3. THE DAY SURVIVES A RELOAD  — the silent one                        */
/* ====================================================================== */

describe('a day holding both survives being saved and read back', () => {
  /* THE MOST DANGEROUS PART OF THIS CHANGE. `listProblem` used to answer
     "two credits" for any list holding more than one, `readRecs` returns null
     for the whole blob when any address fails it, and `readWars` then rejects
     EVERY war — so the store re-seeds and every bid, award and credit in the
     app is gone. `putList` never runs that check, so it would pass every
     in-memory test and fail only after a restart. */
  it('two credits on one day load back rather than wiping every war', () => {
    setManualCredit(P, SAT, 'FO', { note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const before = oilOf(P)
    expect(before).toBeGreaterThanOrEqual(4)

    initStore(backend)              // the restart

    expect(creditsOn(P, SAT)).toHaveLength(2)
    expect(worthOf(P, SAT)).toBe(4)
    expect(oilOf(P)).toBe(before)
  })

  it('the record rules allow ONE earned credit and ONE award, and no more', () => {
    const earned = { id: 'a1', kind: 'credit', code: 'FO', oil: 'auto' } as WarRec
    const award = { id: 'm1', kind: 'credit', code: 'FO', oil: 'manual' } as WarRec
    expect(listProblem([earned, award])).toBeNull()
    expect(listProblem([earned, { ...earned, id: 'a2' }])).toBeTruthy()
    expect(listProblem([award, { ...award, id: 'm2' }])).toBeTruthy()
  })

  it('a stored blob with two earned credits on one day is still rejected whole', () => {
    expect(readRecs({ [P]: { [SAT]: [
      { id: 'a1', kind: 'credit', code: 'FO', oil: 'auto' },
      { id: 'a2', kind: 'credit', code: 'HO', oil: 'auto' },
    ] } })).toBeNull()
  })
})

/* ====================================================================== */
/*  4. DAYS ALREADY TAKEN OVER, stored under the old shape                */
/* ====================================================================== */

describe('a day stored under the old take-over shape', () => {
  /* An `auto` credit carrying a `manual` snapshot. Under the new pass that
     record reads as the app's own ordinary credit, so the next run would
     rewrite it and drop the snapshot — the award's days gone, silently, on
     the owner's own live data. It is SPLIT into the two records it always
     meant. */
  const legacy = {
    [P]: {
      [SAT]: [{
        id: 'c-old', kind: 'credit', code: 'FO', oil: 'auto', note: 'called out', spans: WORKED,
        manual: { code: 'HO', note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 },
      }],
    },
  }

  it('loads as TWO records worth the sum, with the award’s own words kept', () => {
    const recs = readRecs(legacy)
    expect(recs).not.toBeNull()
    const list = recs![P]![SAT]! as Array<Extract<WarRec, { kind: 'credit' }>>
    expect(list).toHaveLength(2)

    const earned = list.find(c => c.oil === 'auto')!
    expect(earned).toMatchObject({ code: 'FO', spans: WORKED })
    expect(earned.manual).toBeUndefined()            // the snapshot is spent

    const award = list.find(c => c.oil === 'manual')!
    expect(award).toMatchObject({ code: 'HO', note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 })

    // FO's day plus the award's three
    expect(list.reduce((n, c) => n + (c.days ?? (c.code === 'FO' ? 1 : 0.5)), 0)).toBe(4)
  })

  it('splitting is idempotent — reading the split list again changes nothing', () => {
    const once = readRecs(legacy)!
    const twice = readRecs(JSON.parse(JSON.stringify(once)))!
    expect((twice[P]![SAT]!).length).toBe(2)
    expect((twice[P]![SAT]!).filter(r => r.kind === 'credit' && r.oil === 'manual')).toHaveLength(1)
  })

  it('the OIL pass run over a healed day destroys nothing and adds nothing', () => {
    const recs = readRecs(legacy)!
    const war = warAt(SAT)
    war.recs[P] = recs[P]!
    ingestDutyCredit(P, SAT, 'FO', 'called out', WORKED)
    expect(creditsOn(P, SAT)).toHaveLength(2)
    expect(awardOn(P, SAT)).toMatchObject({ code: 'HO', days: 3 })
  })
})

/* ====================================================================== */
/*  5. AN AWARD STILL SAYS NOTHING ABOUT WHERE THE MAN WAS (N13)          */
/* ====================================================================== */

describe('an award is not attendance (N13), now that it can sit beside one that is', () => {
  it('an award beside leave is not amber; the schedule’s credit beside leave still is', () => {
    expect(setCell(P, TUE, 'LL')).toBe(true)
    setManualCredit(P, TUE, 'FO', { days: 3 })
    expect(getState().views[P]?.[TUE]?.amber).toBe(false)

    ingestDutyCredit(P, TUE, 'FO', 'Duty', WORKED)
    expect(getState().views[P]?.[TUE]?.amber).toBe(true)
  })

  it('an award alone leaves the man available; the schedule’s credit stands him down', () => {
    setManualCredit(P, TUE, 'FO', { days: 3 })
    expect(getState().views[P]?.[TUE]?.duty).toBe(false)

    ingestDutyCredit(P, TUE, 'FO', 'Duty', WORKED)
    expect(getState().views[P]?.[TUE]?.duty).toBe(true)
  })

  it('two credits on one day still count the man ONCE', () => {
    setManualCredit(P, TUE, 'FO', { days: 3 })
    ingestDutyCredit(P, TUE, 'FO', 'Duty', WORKED)
    const v = getState().views[P]?.[TUE]
    expect(v?.duty).toBe(true)
    expect(v?.away).toBe(0)                    // a credit removes nobody, however many there are
    expect(v?.charges).toHaveLength(0)         // and costs no leave
  })
})

/* ====================================================================== */
/*  6. WHAT THE BOX SHOWS                                                 */
/* ====================================================================== */

describe('the grid cell holds one code — the app’s own', () => {
  it('the schedule’s credit is the box and the award sits behind the +1 mark', () => {
    /* The award has no work times, so it reads as a whole day while an earned
       credit usually does not — which under the old ordering put the AWARD on
       top. That is not cosmetic: the top record is what makes the cell read as
       owned by the schedule, which is what locks it. */
    setManualCredit(P, SAT, 'HO', { days: 3 })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const v = getState().views[P]?.[SAT]
    expect(v?.main?.kind).toBe('credit')
    expect((v?.main as { auto?: boolean })?.auto).toBe(true)
    expect(v?.code).toBe('FO')
    expect(v?.mark).toBe('+1')
  })

  it('a day holding only an award still reads exactly as it does today', () => {
    setManualCredit(P, TUE, 'FO', { days: 3 })
    const v = getState().views[P]?.[TUE]
    expect(v?.code).toBe('FO')
    expect(v?.mark).toBe('')
    expect(v?.earnsOil).toBe(3)
  })
})
