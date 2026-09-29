// AN AWARD AND A WORKED DAY ADD UP (owner, 21 Sep 26 — ruling N16, D82).
//
//   "Yes an award and a worked day add up. So it's 4. The auto oil credits
//    don't get affected by manual OIL inputs."
//
// A 3-day award on a Saturday the man then works is worth FOUR — the award's
// three plus the day's one. The two are INDEPENDENT: what the published
// schedule earns is never changed by what a person typed, and what a person
// typed is never changed by the schedule.
//
// Since [OIL-AWARD-IS-A-GRANT] (29 Sep 26) the award is not even the same kind
// of record: every hand-given OIL award is a positive OIL ledger entry, drawn on
// the grid on its date (D402), while the schedule's credit stays the war's own
// record. So "never affect each other" is now structural — and "earned" counts
// the schedule's alone, the award reads "awarded" (D400). The old take-over
// shape and its healing are gone with the old records (D401: demo data, not
// converted — an old record is dropped on read, never allowed to break a load).
//
// Design: `docs/superpowers/specs/2026-09-21-oil-award-add-design.md`; the move
// to one kind: `docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`.

import { beforeEach, describe, expect, it } from 'vitest'
import { balanceOf } from './engine'
import { oilLedgerFor } from './engine/oiltracker'
import { countsFor } from './engine/availability'
import { listProblem, readRecs, type WarRec } from './engine/warrecs'
import {
  awardsOnDay, cellProblem, clearRaptorCell, editAward, getState, ingestDutyCredit, initStore, OIL_DOOR_MSG, rawState,
  figureCtxOf, setCell, setDayAward, setRole,
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
const awardOn = (person: string, date: string) => awardsOnDay(person, date)[0]
/** what the day is worth in all — what it EARNED (the schedule's, D400) plus every award drawn on it */
const worthOf = (person: string, date: string) =>
  (getState().views[person]?.[date]?.earnsOil ?? 0) + awardsOnDay(person, date).reduce((n, e) => n + e.amount, 0)
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
    expect(setDayAward(P, SAT, 3, { note: 'Exercise recovery', givenBy: 'OC Ops' })).toBeNull()
    expect(worthOf(P, SAT)).toBe(3)

    // the Saturday is then published with him on a desk
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBeTruthy()

    expect(worthOf(P, SAT)).toBe(4)
    expect(oilOf(P)).toBe(before + 4)
    // two records, in two places: the schedule's on the war, the award in the ledger
    expect(creditsOn(P, SAT)).toHaveLength(1)
    expect(awardsOnDay(P, SAT)).toHaveLength(1)
  })

  it('and the OTHER way round — the schedule first, the award typed on top — is also 4', () => {
    /* The same two facts must not be kept or lost depending on which was
       entered first. That is the reason the owner gave for every other
       clash ruling this month, and it holds here. */
    const before = oilOf(P)
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBe('written')
    expect(setDayAward(P, SAT, 3, { note: 'Exercise recovery' })).toBeNull()

    expect(worthOf(P, SAT)).toBe(4)
    expect(oilOf(P)).toBe(before + 4)
  })

  it('an award is never refused because the schedule earns on the day', () => {
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBe('written')
    expect(setDayAward(P, SAT, 3)).toBeNull()
    /* …and FO / HO is not a cell code: the award has its own door, and the picker is told so rather than "fine" */
    expect(cellProblem(P, SAT, 'FO')).toBe(OIL_DOOR_MSG)
    expect(setCell(P, SAT, 'FO')).toBe(false)
  })

  it('each keeps its OWN worth, reason and giver — neither is rewritten by the other', () => {
    setDayAward(P, SAT, 3, { note: 'Exercise recovery', givenBy: 'OC Ops' })
    ingestDutyCredit(P, SAT, 'HO', 'SIM', WORKED)

    expect(awardOn(P, SAT)).toMatchObject({ counter: 'oil', amount: 3, reason: 'Exercise recovery', givenBy: 'OC Ops' })
    const earned = earnedOn(P, SAT)!
    expect(earned).toMatchObject({ code: 'HO', oil: 'auto', note: 'SIM' })
    expect(earned.spans).toEqual(WORKED)
    expect(worthOf(P, SAT)).toBe(3.5)
  })

  it('does not churn: a second pass over the same day writes nothing new', () => {
    setDayAward(P, SAT, 3, { note: 'Exercise recovery' })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const first = JSON.stringify(recsOn(P, SAT))
    const ledger = rawState().ledger
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)).toBe('confirmed')
    expect(JSON.stringify(recsOn(P, SAT))).toBe(first)
    expect(rawState().ledger).toBe(ledger)
  })
})

/* ====================================================================== */
/*  2. THE TWO NEVER AFFECT EACH OTHER                                    */
/* ====================================================================== */

describe('the two kinds never affect each other', () => {
  it('unpublishing the Saturday takes the day’s 1 and leaves the award’s 3 exactly as typed', () => {
    setDayAward(P, SAT, 3, { note: 'called out for the recovery', givenBy: 'OC Ops' })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    expect(worthOf(P, SAT)).toBe(4)

    expect(clearRaptorCell(P, SAT)).toBe(true)

    expect(earnedOn(P, SAT)).toBeUndefined()
    // his words, his name, his days — not the schedule's
    expect(awardOn(P, SAT)).toMatchObject({ amount: 3, reason: 'called out for the recovery', givenBy: 'OC Ops' })
    expect(worthOf(P, SAT)).toBe(3)
  })

  it('clearing the award by hand leaves the day the schedule earned', () => {
    setDayAward(P, SAT, 3)
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

  it('the award’s editor reaches the AWARD, never the schedule’s credit', () => {
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)        // the earned one lands FIRST
    setDayAward(P, SAT, 3)            // the award second

    expect(editAward(awardOn(P, SAT)!.id, { note: 'Exercise recovery', givenBy: 'OC Ops', days: 2 })).toBeNull()

    expect(awardOn(P, SAT)).toMatchObject({ reason: 'Exercise recovery', givenBy: 'OC Ops', amount: 2 })
    const earned = earnedOn(P, SAT)!
    expect(earned.note).toBe('Duty')                      // the schedule's own words, untouched
    expect(worthOf(P, SAT)).toBe(3)
  })

  it('the schedule’s credit is no award — the editor says so', () => {
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    expect(editAward(earnedOn(P, SAT)!.id, { days: 2 })).toContain('no OIL award')
  })
})

/* ====================================================================== */
/*  3. THE DAY SURVIVES A RELOAD                                          */
/* ====================================================================== */

describe('a day holding both survives being saved and read back', () => {
  it('the schedule’s credit and the award load back, worth the same', () => {
    setDayAward(P, SAT, 3, { note: 'Exercise recovery', givenBy: 'OC Ops' })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const before = oilOf(P)
    expect(before).toBeGreaterThanOrEqual(4)

    initStore(backend)              // the restart

    expect(creditsOn(P, SAT)).toHaveLength(1)
    expect(awardsOnDay(P, SAT)).toHaveLength(1)
    expect(worthOf(P, SAT)).toBe(4)
    expect(oilOf(P)).toBe(before)
  })

  it('the record rules allow ONE earned credit on a day, and no more', () => {
    const earned = { id: 'a1', kind: 'credit', code: 'FO', oil: 'auto' } as WarRec
    expect(listProblem([earned])).toBeNull()
    expect(listProblem([earned, { ...earned, id: 'a2' }])).toBeTruthy()
  })

  it('a stored blob with two earned credits on one day is still rejected whole', () => {
    expect(readRecs({ [P]: { [SAT]: [
      { id: 'a1', kind: 'credit', code: 'FO', oil: 'auto' },
      { id: 'a2', kind: 'credit', code: 'HO', oil: 'auto' },
    ] } })).toBeNull()
  })
})

/* ====================================================================== */
/*  4. AN OLD-SHAPE RECORD NEVER BREAKS A LOAD (D401)                     */
/* ====================================================================== */

describe('a war record in the old award shape (D401 — demo data, not converted)', () => {
  /* Every award typed on the grid before 29 Sep 26 is a war record `oil: 'manual'`, and a day the schedule once took
     over carries a `manual` snapshot on its automatic credit. Nothing converts them — the stored world is demo data,
     wiped before the database (D54, D56) — but REFUSING one would make `readRecs` null and re-seed every war, so the
     old award is dropped and everything beside it kept. */
  const blob = {
    [P]: {
      [SAT]: [
        { id: 'c-old', kind: 'credit', code: 'FO', oil: 'auto', days: 3, note: 'Exercise recovery', givenBy: 'OC Ops', spans: WORKED,
          manual: { code: 'HO', note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 } },
        { id: 'r1', kind: 'request', code: 'LL', state: 'pending' },
      ],
      [TUE]: [{ id: 'm-old', kind: 'credit', code: 'FO', oil: 'manual', days: 3, givenBy: 'OC Ops' }],
    },
  }

  it('loads: the old award goes, the schedule’s credit and the bid stay, nothing is re-seeded', () => {
    const recs = readRecs(blob)
    expect(recs).not.toBeNull()
    expect(recs![P]![TUE]).toBeUndefined()                         // the old award, dropped
    const sat = recs![P]![SAT]!
    expect(sat.map(r => r.kind).sort()).toEqual(['credit', 'request'])
    const earned = sat.find(r => r.kind === 'credit') as Extract<WarRec, { kind: 'credit' }>
    /* the fields the retired take-over copied onto the schedule's record are NOT read — the schedule earns what its
       code says, never the award's three */
    expect(earned).toEqual({ id: 'c-old', kind: 'credit', code: 'FO', oil: 'auto', note: 'Exercise recovery', spans: WORKED })
  })
})

/* ====================================================================== */
/*  5. AN AWARD STILL SAYS NOTHING ABOUT WHERE THE MAN WAS (N13)          */
/* ====================================================================== */

describe('an award is not attendance (N13), now that it can sit beside one that is', () => {
  it('an award beside leave is not amber; the schedule’s credit beside leave still is (D80)', () => {
    expect(setCell(P, TUE, 'LL')).toBe(true)
    setDayAward(P, TUE, 3)
    expect(getState().views[P]?.[TUE]?.amber).toBe(false)

    ingestDutyCredit(P, TUE, 'FO', 'Duty', WORKED)
    expect(getState().views[P]?.[TUE]?.amber).toBe(true)
  })

  it('an award alone leaves the man available; the schedule’s credit stands him down', () => {
    setDayAward(P, TUE, 3)
    expect(getState().views[P]?.[TUE]?.duty).toBe(false)

    ingestDutyCredit(P, TUE, 'FO', 'Duty', WORKED)
    expect(getState().views[P]?.[TUE]?.duty).toBe(true)
  })

  it('two credits on one day still count the man ONCE', () => {
    setDayAward(P, TUE, 3)
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
    setDayAward(P, SAT, 3)
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const v = getState().views[P]?.[SAT]
    expect(v?.main?.kind).toBe('credit')
    expect((v?.main as { auto?: boolean })?.auto).toBe(true)
    expect(v?.code).toBe('FO')
    expect(v?.mark).toBe('+1')
  })

  it('a day holding only an award draws FO — and EARNS nothing: it is awarded (D400)', () => {
    setDayAward(P, TUE, 3)
    const v = getState().views[P]?.[TUE]
    expect(v?.code).toBe('FO')
    expect(v?.mark).toBe('')
    expect(v?.earnsOil).toBe(0)
    expect(worthOf(P, TUE)).toBe(3)
  })
})

/* ====================================================================== */
/*  7. THE OIL TRACKER — one entry per credit                             */
/* ====================================================================== */

describe('the OIL tracker lists the two separately', () => {
  const ledger = () => oilLedgerFor(figureCtxOf(), P, getState().oilPolicy, '2026-06-30')

  it('shows the worked day and the award as TWO entries, 1 and 3 — earned 1, awarded 3 (D400)', () => {
    const was = ledger()
    setDayAward(P, SAT, 3, { note: 'Exercise recovery', givenBy: 'OC Ops' })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)

    const led = ledger()
    const rows = led.credits.filter(c => c.date === SAT)
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.amount).sort()).toEqual([1, 3])
    expect(led.earned - was.earned).toBe(1)
    expect(led.awarded - was.awarded).toBe(3)
  })

  it('each says its own reason and its own giver, and they never share an id', () => {
    setDayAward(P, SAT, 3, { note: 'Exercise recovery', givenBy: 'OC Ops' })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)

    const rows = ledger().credits.filter(c => c.date === SAT)
    const earned = rows.find(r => r.source === 'auto')!
    const award = rows.find(r => r.source === 'grant')!
    expect(earned).toMatchObject({ amount: 1, reason: 'Duty', givenBy: 'Weekend/PH' })
    expect(award).toMatchObject({ amount: 3, reason: 'Exercise recovery', givenBy: 'OC Ops' })
    expect(earned.id).not.toBe(award.id)
  })

  it('an award with no reason does not claim to be weekend duty', () => {
    setDayAward(P, SAT, 3)
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const rows = ledger().credits.filter(c => c.date === SAT)
    expect(rows.find(r => r.source === 'grant')!.reason).not.toContain('weekend')
    expect(rows.find(r => r.source === 'auto')!.reason).toBe('Duty')
  })

  it('a day taken later draws on the worked day FIRST and leaves the award standing', () => {
    setDayAward(P, SAT, 3)
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    setCell(P, '2026-01-05', 'OIL')            // a Monday spent against it
    const rows = ledger().credits.filter(c => c.date === SAT)
    expect(rows.find(r => r.source === 'auto')!.left).toBe(0)     // the earned day goes first
    expect(rows.find(r => r.source === 'grant')!.left).toBe(3)    // the award is untouched
  })
})

/* ====================================================================== */
/*  8. EDITING AN AWARD IS ONE THING, NOT THREE                           */
/* ====================================================================== */

describe('changing an award', () => {
  it('reason, giver and days move together, as ONE step', () => {
    setDayAward(P, SAT, 3, { note: 'Recovery', givenBy: 'OC Ops' })
    const id = awardOn(P, SAT)!.id
    expect(editAward(id, { note: 'Exercise recovery', givenBy: 'CO', days: 2 })).toBeNull()
    expect(awardOn(P, SAT)).toMatchObject({ reason: 'Exercise recovery', givenBy: 'CO', amount: 2 })
  })

  it('a value it refuses changes NOTHING — not even the fields it had already read', () => {
    setDayAward(P, SAT, 3, { note: 'Recovery', givenBy: 'OC Ops' })
    const id = awardOn(P, SAT)!.id
    const before = JSON.stringify(awardOn(P, SAT))
    expect(editAward(id, { note: 'Changed', givenBy: 'CO', days: 9999 })).toContain('more than')
    expect(JSON.stringify(awardOn(P, SAT))).toBe(before)
  })

  it('the +OIL panel on a day holding one award rewrites THAT award — its worth, not its day', () => {
    setDayAward(P, SAT, 3, { note: 'Recovery', givenBy: 'OC Ops' })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const id = awardOn(P, SAT)!.id
    expect(setDayAward(P, SAT, 0.5, { note: 'Recovery', givenBy: 'OC Ops' })).toBeNull()
    expect(awardsOnDay(P, SAT)).toHaveLength(1)
    expect(awardOn(P, SAT)).toMatchObject({ id, amount: 0.5, reason: 'Recovery', givenBy: 'OC Ops' })
    expect(getState().views[P]?.[SAT]?.all.find(c => c.kind === 'credit' && !c.auto)?.code).toBe('HO')
    expect(worthOf(P, SAT)).toBe(1.5)
  })
})

/* ====================================================================== */
/*  9. PLANNING A DAY MUST NOT TURN THE MANNING RED (owner, 21 Sep 26)    */
/* ====================================================================== */

describe('what reduces the manning (N17)', () => {
  const countIP = (date: string) => {
    const { people, wars } = getState()
    const war = wars.find(w => w.period.start <= date && date <= w.period.end)!
    return countsFor(people as never, {} as never, {} as never, date, war.views as never)
  }

  it('publishing a worked weekend leaves the man in the count', () => {
    const before = countIP(SAT).byCategory
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const after = countIP(SAT)
    expect(after.byCategory).toEqual(before)      // planning the day changed nothing
    expect(after.duty).toBe(1)                    // …and the desk still reads as covered
  })

  it('an award leaves him in the count too', () => {
    const before = countIP(SAT).byCategory
    setDayAward(P, SAT, 3)
    expect(countIP(SAT).byCategory).toEqual(before)
  })

  it('but a day he is on LEAVE for does reduce it', () => {
    const before = countIP(SAT).byCategory
    expect(setCell(P, SAT, 'LL')).toBe(true)
    expect(countIP(SAT).byCategory).not.toEqual(before)
  })
})

/* ====================================================================== */
/*  10. THE LABEL FOLLOWS THE AMOUNT (N19)                                 */
/* ====================================================================== */

/* AN AWARD'S LABEL FOLLOWS ITS DAYS WHEREVER THE DAYS ARE CHANGED (the absence-record re-test, W3-F6, 26 Sep 26). N19:
   the quantity is the fact, the code a label that follows it — half a day reads HO, anything else FO. Since the award is
   a ledger entry the label is never stored at all: it is drawn from the amount. */
describe('editing an award’s days re-draws its label (N19)', () => {
  it('HO for half a day becomes FO at two days, and back to HO at half', () => {
    const code = () => getState().views[P]?.[TUE]?.code
    expect(setDayAward(P, TUE, 0.5)).toBe(null)
    const id = awardOn(P, TUE)!.id
    expect(code()).toBe('HO')
    expect(editAward(id, { days: 2 })).toBe(null)
    expect(code()).toBe('FO')
    expect(editAward(id, { days: 0.5 })).toBe(null)
    expect(code()).toBe('HO')
  })
})
