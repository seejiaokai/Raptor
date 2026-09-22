// Wire 4: a PUBLISHED weekend/public-holiday duty earns OIL in Leave War.
// The computation itself (who earns 0.5 vs 1 from a day blob) is pinned in
// src/engine/oil.test.ts; this file tests the wire — publish-state driving
// the grid, the issued snapshot as the source, reverse-and-replace, the
// ownership partition against wires 1+2, and the never-overwrite clash.
//
// Same harness as sync.test.ts (both real stores, headless), plus the
// publish machinery: SCHED reset to draft and DAYS restored pristine, since
// these tests publish days and edit duty rows.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, DATES } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { SCHED, signOf, setDayApproved, publishALDay, dayApproved } from '../engine/publish'
import { stashClear, stashPut } from '../engine/weekstash'
import { initStore as raptorInitStore, loadWeek } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import {
  getState,
  initStore as lwInitStore,
  setBidState,
  setCell,
  setDayEvent,
  setPeople,
  setPostOut,
  setRole,
} from './state/store'
import { memoryBackend } from './state/storage'
import { availableFor, createOilPeriodFor, getClashes, installAbsenceDoor, oilPendingFor, publishFlagsBids, runOilPass, syncAbsences } from './sync'
import { HOOKS } from '../engine/hooks'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18' // the seed Saturday: plasma stands SDO 0800–1800

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  /* the stash is module-level session state (loadweek.test.ts's own rule) —
     the all-weeks credit pull reads it, so each test starts with none */
  stashClear()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}
const publish = (di: number) => { sign(di); setDayApproved(di, true) }
const cellOf = (person: string, date: string) => getState().wars[0].grid[person]?.[date]
const ownedBy = (person: string, date: string) => getState().wars[0].states[person]?.[date]

describe('publish drives the credit', () => {
  it('publishing the seed Saturday lands plasma an FO cell, raptor-owned', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    expect(ownedBy('plasma', SAT)).toMatchObject({ state: 'approved', source: 'raptor' })
  })

  it('an unpublished day earns nothing — a draft duty is not the squadron\'s word', () => {
    runOilPass()
    expect(cellOf('plasma', SAT)).toBeUndefined()
  })

  it('a published WEEKDAY earns nothing: Monday has duty rows but is a working day', () => {
    publish(0)
    runOilPass()
    // The seed grid carries hand-typed FO/HO demo cells of its own; the wire's
    // work is exactly the raptor-OWNED ones, and there must be none.
    const { grid, states } = getState().wars[0]
    const owned = Object.entries(grid).flatMap(([p, row]) =>
      Object.entries(row).filter(([d, c]) =>
        (c === 'FO' || c === 'HO') && states[p]?.[d]?.source === 'raptor'))
    expect(owned).toEqual([])
  })

  it('the credit carries WHY it was earned — the duty kind — as the cell\'s note', () => {
    publish(5)
    runOilPass()
    // plasma's Saturday is an SDO desk: a duty row, so the note reads Duty.
    expect(ownedBy('plasma', SAT)).toMatchObject({ state: 'approved', source: 'raptor', note: 'Duty' })
  })

  it('a day tagged Off day (management, free) earns nothing — only a weekend or PH does', () => {
    setRole('admin')
    setDayEvent('2026-07-13', 0, 'Off day') // the seeded Off day type, typed on Monday
    publish(0)
    runOilPass()
    const { grid, states } = getState().wars[0]
    const owned = Object.entries(grid).flatMap(([p, row]) =>
      Object.entries(row).filter(([d, c]) =>
        (c === 'FO' || c === 'HO') && states[p]?.[d]?.source === 'raptor'))
    expect(owned).toEqual([])
  })

  it('under six written hours the credit is HO, not FO', () => {
    DAYS[5].dutywaves[0].rows[0].str = '0800'
    DAYS[5].dutywaves[0].rows[0].end = '1200'
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('HO')
  })

  it('a weekday the war calls a holiday earns like a weekend — the owner\'s event input path', () => {
    setRole('admin')
    setDayEvent('2026-07-13', 0, 'PH') // the seeded 'off day' type, typed on Monday
    publish(0)
    runOilPass()
    // Monday's SDO earns exactly as Saturday's would; the seed staffs the
    // desk with a real person on every day, so somebody holds an FO/HO cell.
    const { grid } = getState().wars[0]
    const dutyCells = Object.entries(grid).filter(([, row]) =>
      Object.entries(row).some(([d, c]) => d === '2026-07-13' && (c === 'FO' || c === 'HO')))
    expect(dutyCells.length).toBeGreaterThan(0)
  })
})

describe('reverse-and-replace — the credit follows the issued document', () => {
  /* Phase 2 removed the reopen take-back: a published day is frozen and can only
     be changed by a NEW AL. So "reopen takes the credit back" is gone; the credit
     follows the CURRENT issued version, which a new AL updates. */
  it('a new AL with shorter hours replaces FO with HO — the credit follows the current issued version', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    DAYS[5].dutywaves[0].rows[0].end = '1200'     // the duty shrank to 4h on the working draft
    sign(5); publishALDay(5)                       // publish it as the next AL → the issued snapshot updates
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('HO')
  })

  it('a draft edit AFTER publish moves nothing — the issued snapshot is the source', () => {
    publish(5)
    runOilPass()
    DAYS[5].dutywaves[0].rows[0].end = '1200'     // live edit, never issued
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')      // still the document's ten hours
  })
})

describe('the credit reads EVERY week, not just the loaded one (owner, 29 Aug 26)', () => {
  /* CURWEEK and DATES are module state the shared beforeEach does not touch
     (it hand-restores DAYS/SCHED without loadWeek), so ride the real door
     back to the seed week — the re-seeded fixtures ARE that week's. */
  afterEach(() => loadWeek('13/07/2026'))

  it('navigating to another week no longer collects a published weekend\'s credit', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    loadWeek('20/07/2026')                        // the seed Saturday is off screen now…
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')      // …and the credit stands, read from the week's stash
    expect(ownedBy('plasma', SAT)).toMatchObject({ state: 'approved', source: 'raptor' })
  })

  it('a corrupt stash blob PROTECTS its standing credits and throws nothing (P2-REREVIEW-05)', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    loadWeek('20/07/2026')
    stashPut('13/07/2026', '{broken')             // truncated write / foreign data
    expect(() => runOilPass()).not.toThrow()
    /* an UNREADABLE stash cannot be verified, so its earned credit must STAND
       rather than be swept away over a transient/corrupt blob (never delete a
       credit we cannot re-derive) */
    expect(cellOf('plasma', SAT)).toBe('FO')
  })
})

describe('an unsupported / unresolvable book protects its landed OIL credits (P2-IMPL-01)', () => {
  it('a pre-Phase-2 (unsupported) live book neither draft-substitutes nor deletes an earned credit', () => {
    /* first land the credit through a normal publish */
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    /* now the book reads as a PRE-Phase-2 one: approved days, but the current
       pointer is the old 'orig' string and there is no resolvable verId snapshot,
       so dayCurVer→null. The live DRAFT has since dropped the duty — the exact
       trap where the old code fell back to the draft, found no work, and the
       reverse sweep DELETED the credit. */
    SCHED.amV = undefined
    SCHED.orig = {}
    SCHED.cur = { 5: 'orig' as any }
    SCHED.als = []
    DAYS[5].dutywaves = []                          // the draft dropped the duty
    expect(dayApproved(5)).toBe(true)
    runOilPass()
    expect(cellOf('plasma', SAT), 'the issued credit stands — no draft substitution, no deletion').toBe('FO')
    expect(ownedBy('plasma', SAT)).toMatchObject({ source: 'raptor' })
  })

  it('a FUTURE-version (am:999) book whose snapshots still resolve is classified unsupported → credit protected (P2-REREVIEW-05)', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    /* the snapshots remain resolvable (verIds intact), but the format version is
       from the future — amFormatOf must quarantine it, or the reverse pass could
       still delete/replace the standing credit. Drop the duty on the draft to make
       the danger concrete. */
    SCHED.amV = 999
    DAYS[5].dutywaves = []
    runOilPass()
    expect(cellOf('plasma', SAT), 'a future-format book cannot rewrite the credit').toBe('FO')
  })
})

describe('the ownership partition against wires 1+2', () => {
  it('re-reading the Inputs leaves the credit alone — no input ever covers an FO cell', () => {
    publish(5)
    runOilPass()
    syncAbsences()
    expect(cellOf('plasma', SAT)).toBe('FO')
    // and the credit never becomes an lw-tagged input: FO is not biddable
    expect(INPUTS.filter((r: any) => r.lw)).toEqual([])
  })

  it('a leave already on the date is never overwritten — the credit lands beside it and clashes for a human', () => {
    /* Owner, 20 Sep 26: the credit is banked even when it overlaps the leave,
       and the day carries the clash until someone resolves it. What has NOT
       changed, and is what this test is really about, is that the leave is
       never overwritten (B5: the pass never deletes a request). */
    setRole('admin')                               // July sits outside the seed bid window
    setCell('plasma', SAT, 'LL')
    setBidState('plasma', SAT, 'approved')
    publish(5)
    runOilPass()
    const v = getState().wars[0].views['plasma']?.[SAT]!
    expect(v.all.some(c => c.code === 'LL')).toBe(true)          // untouched
    expect(v.all.some(c => c.kind === 'credit')).toBe(true)      // and the credit is banked
    expect(v.amber).toBe(true)                                   // the day needs a human
    expect(getClashes()).toContainEqual(
      { person: 'plasma', date: SAT, inputCode: 'FO', bidCode: 'LL', kind: 'duty' })
  })

  it('leave WINS an owned cell and the passes stay stable — no flip-flop', () => {
    // The man files leave in Raptor for the Saturday he also stands duty.
    INPUTS.push({ iid: 'oil-ll-1', person: 'plasma', type: 'LL', date: 'Jul 18', yr: 2026, allday: true, remarks: '', mod: 'now' })
    syncAbsences()                                 // the war reads the filed LL
    expect(cellOf('plasma', SAT)).toBe('LL')
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('LL')       // never overwritten
    expect(getClashes().some(c => c.kind === 'duty' && c.person === 'plasma')).toBe(true)
    syncAbsences(); runOilPass(); syncAbsences(); runOilPass()
    expect(cellOf('plasma', SAT)).toBe('LL')       // still stable
  })

  it('a hand-typed cell matching the verdict is taken over in place, not clashed', () => {
    setRole('admin')                               // July sits outside the seed bid window
    setCell('plasma', SAT, 'FO')                   // the squadron recorded it first
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    expect(ownedBy('plasma', SAT)).toMatchObject({ source: 'raptor' })
    expect(getClashes()).toEqual([])
  })

  it('both clash halves publish together — a leave clash and a duty clash coexist', () => {
    setRole('admin')                               // July sits outside the seed bid window
    // duty clash on Saturday
    setCell('plasma', SAT, 'LL')
    setBidState('plasma', SAT, 'approved')
    publish(5)
    // leave clash: a Raptor input against a different standing bid
    setCell('rocky', '2026-07-14', 'OIL')
    setBidState('rocky', '2026-07-14', 'approved')
    INPUTS.push({ iid: 'oil-ll-2', person: 'rocky', type: 'LL', date: 'Jul 14', yr: 2026, allday: true, remarks: '', mod: 'now' })
    syncAbsences()
    runOilPass()
    expect(getClashes().some(c => c.kind === 'duty')).toBe(true)
    expect(getClashes().some(c => !c.kind)).toBe(true)
  })
})

/* ---- the input ask-flow's credits (owner, 28 Aug 26; PUBLICATION-GATED since
   [OIL-AUTO-REMOVE], owner 21 Sep 26) ---------------------------------------
   An acknowledged duty-&-commitments claim joins the SAME desired map the
   published schedule feeds, so the reverse sweep protects and collects both
   identically, and one pooled six-hour test per person per day decides the cell.

   WHAT CHANGED 21 Sep 26: the claim now WAITS FOR PUBLICATION like everything
   else. Its evidence — the person, the times, the type and the member's own
   answer — is frozen into the day's OIL evidence block when the day goes out,
   and the pass reads nothing else. Before this, a member could move his own
   already-issued credit by revising an answer, and an overseas-duty answer
   could never raise an amendment at all because OD has no row on the programme.
   The owner's mitigation for the day nobody publishes is a standing practice of
   publishing every day, plus the reminder this build adds. */
describe('OIL11, OIL13 — an acknowledged input credits once the day is PUBLISHED', () => {
  const plant = (r: any) => {
    INPUTS.unshift({ allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, ...r })
    return INPUTS[0]
  }
  /* publish the day AGAIN as its next amendment — the correction path for
     anything the issued evidence has since got wrong (spec §7.3). */
  const amend = (di: number) => { sign(di); publishALDay(di) }

  it('an answered yes mints the cell only once the day is published', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    runOilPass()
    expect(cellOf('bane', SAT), 'nothing published — nothing earned').toBeUndefined()
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    expect(ownedBy('bane', SAT)).toMatchObject({ state: 'approved', source: 'raptor' })
  })

  it('unanswered and declined mint nothing — no acknowledgment, no credit', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18' })                 // never asked/answered
    plant({ person: 'stiff', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 0 } })  // explicit No
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBeUndefined()
    expect(cellOf('stiff', SAT)).toBeUndefined()
  })

  it('a dormant (scheduler-removed) input mints nothing even when answered', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'r', oil: { [SAT]: 1 } })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBeUndefined()
  })

  it('deleting the input leaves the issued credit standing until the day is published again', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    INPUTS.splice(INPUTS.indexOf(r), 1)
    runOilPass()
    expect(cellOf('bane', SAT), 'the published day still says he claimed it').toBe('FO')
    amend(5)
    runOilPass()
    expect(cellOf('bane', SAT), 'republished without the claim — the credit goes').toBeUndefined()
  })

  it('moving the input off the day does not move the issued credit on its own', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    r.date = 'Jul 20'                                   // moved; the answer's day is uncovered now
    runOilPass()
    expect(cellOf('bane', SAT), 'a member cannot withdraw an issued credit by editing his own input').toBe('FO')
    amend(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBeUndefined()
  })

  it('the owner worked example: 4h published duty + 4h acknowledged input make one FO day', () => {
    DAYS[5].dutywaves[0].rows[0].str = '0800'
    DAYS[5].dutywaves[0].rows[0].end = '1200'           // plasma: 4h published — HO alone
    plant({ person: 'plasma', type: 'Training', date: 'Jul 18', allday: false, s: 13 * 60, e: 17 * 60, oil: { [SAT]: 0.5 } })
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')            // envelope 08:00 to 17:00 = 9h
  })

  it('two answered inputs on one day share one envelope — overlap never pays twice', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', allday: false, s: 8 * 60, e: 12 * 60, oil: { [SAT]: 0.5 } })
    plant({ person: 'bane', type: 'Meeting', date: 'Jul 18', allday: false, s: 10 * 60, e: 14 * 60, oil: { [SAT]: 0.5 } })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')              // envelope 08:00 to 14:00 = 6h exactly — still a half
  })

  it('the gap between a morning duty and an afternoon input COUNTS — the day runs start to finish (owner, 29 Aug 26)', () => {
    // one written hour each side of a five-hour gap: two hours of bookings,
    // but an 08:00 to 15:00 day in squadron — seven hours, a FULL day. This is
    // the pin that keeps the envelope from regressing to a summed union.
    DAYS[5].dutywaves[0].rows[0].str = '0800'
    DAYS[5].dutywaves[0].rows[0].end = '0900'           // plasma: 1h published
    plant({ person: 'plasma', type: 'Meeting', date: 'Jul 18', allday: false, s: 14 * 60, e: 15 * 60, oil: { [SAT]: 0.5 } })
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
  })

  /* OWNER RULING R-1 (21 Sep 26): ONLY THE ISSUED SCHEDULE PAYS, BOTH
     DIRECTIONS. This test previously asserted the OPPOSITE — that un-typing the
     holiday stopped the credit at once — which is how the bug got in: the day's
     calendar was read LIVE before the issued block was ever opened, so an admin
     could delete everybody's day in lieu off a published day with no amendment,
     no signature, no record and nothing on screen. Astra found it from this end
     and Fable found the same seam from the other (a holiday declared after
     publication paying nobody). The money now follows the issued document; the
     day must be published again for either direction to move. */
  it('OIL24, OIL29 — revoking a PH does NOT take back issued money until the day is re-published', () => {
    setRole('admin')
    setDayEvent('2026-07-15', 0, 'PH')
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 15', oil: { '2026-07-15': 1 } })
    publish(2)                                          // the Wednesday now reads as a holiday
    runOilPass()
    expect(cellOf('bane', '2026-07-15')).toBe('FO')
    setDayEvent('2026-07-15', 0, '')                    // the holiday is un-typed, LIVE
    runOilPass()
    expect(cellOf('bane', '2026-07-15'), 'the issued document still says he earned it').toBe('FO')
    expect(r.oil).toEqual({ '2026-07-15': 1 })          // the record keeps the answer either way
    amend(2)                                            // re-issued: NOW the new truth governs
    runOilPass()
    expect(cellOf('bane', '2026-07-15'), 'republished as an ordinary Wednesday — the credit goes').toBeUndefined()
  })

  it('OIL24 — a PH declared AFTER the day went out pays nobody until it is re-published', () => {
    setRole('admin')
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 15', oil: { '2026-07-15': 1 } })
    publish(2)                                          // published as an ordinary Wednesday
    runOilPass()
    expect(cellOf('bane', '2026-07-15'), 'a working Wednesday earns nothing').toBeUndefined()
    setDayEvent('2026-07-15', 0, 'PH')                  // the holiday is declared afterwards
    runOilPass()
    expect(cellOf('bane', '2026-07-15'), 'the issued block froze "this day earns nothing"').toBeUndefined()
    amend(2)
    runOilPass()
    expect(cellOf('bane', '2026-07-15'), 'published again — now it lands').toBe('FO')
    expect(r.oil).toEqual({ '2026-07-15': 1 })
  })

  it('OIL24 — archiving a man does NOT withdraw the day in lieu he was already issued', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    /* the production archive route: the flag on the roster, then the same
       re-projection the Quals page triggers on every Raptor notify */
    const was = (PEOPLE as any).bane.archived
    try {
      ;(PEOPLE as any).bane.archived = true
      setPeople(projectPeople())
      runOilPass()
      expect(cellOf('bane', SAT), 'hiding or archiving a man is a display choice, never a refund').toBe('FO')
      expect(ownedBy('bane', SAT)).toMatchObject({ source: 'raptor' })
    } finally { (PEOPLE as any).bane.archived = was }
  })

  it('a raptor-owned credit survives a storage round-trip — reconcile keeps FO/HO ownership', () => {
    const be = memoryBackend()
    lwInitStore(be)
    setPeople(projectPeople())
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    publish(5)
    runOilPass()
    expect(ownedBy('bane', SAT)).toMatchObject({ source: 'raptor' })
    lwInitStore(be)                                      // reload from the SAME backend — the reconcile path
    expect(cellOf('bane', SAT)).toBe('FO')
    expect(ownedBy('bane', SAT), 'ownership survived the load — the reverse sweep can still collect it').toMatchObject({ source: 'raptor' })
  })
})

describe('the ALL / ALL AVAIL expansion on a published non-working day', () => {
  it('credits every available regular aircrew body; leave, SANS and ground crew are out', () => {
    DAYS[5].allhands = DAYS[5].allhands || []
    DAYS[5].allhands.push({ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL' })  // 7h → FO
    /* stiff is away — an all-day leave over the event window */
    INPUTS.unshift({ person: 'stiff', type: 'LL', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026 })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')               // a present regular body earns
    expect(cellOf('stiff', SAT)).toBeUndefined()         // on leave — not available
    expect(cellOf('torque', SAT)).toBeUndefined()        // ground crew Personnel — excluded
    const sanId = Object.keys(PEOPLE).find((id: any) => (PEOPLE as any)[id].san && !(PEOPLE as any)[id].archived)
    expect(sanId, 'the roster holds a SANS body').toBeTruthy()
    expect(cellOf(sanId as string, SAT)).toBeUndefined() // SANS, and not on our programme — out
  })
})

/* [ALL-AVAIL-REDEF] — the owner's 21 Sep 26 redefinition of who an ALL / ALL
   AVAIL puck stands for. Each case uses the ENVELOPE as its discriminator: the
   man is named on a short row of his own, so being swept into the big event
   stretches his day from an hour (HO) to most of it (FO). That way the test
   reads the EXPANSION, not merely "did he earn anything". */
describe('OIL14, OIL15 — [ALL-AVAIL-REDEF] who an ALL AVAIL puck stands for (owner, 21 Sep 26)', () => {
  const EVENT = { prog: 'FAMILY DAY', str: '1000', end: '1700', who: 'ALL AVAIL' }
  const plant = (rows: any[]) => { DAYS[5].allhands = (DAYS[5].allhands || []).concat(rows) }
  /* his OWN hour, deliberately outside the event: being swept into the event
     stretches his day from one hour (HO) to most of it (FO), so each case reads
     the EXPANSION rather than merely "did he earn anything". */
  const ownHour = (who: string) => { DAYS[5].ground = (DAYS[5].ground || []).concat([{ prog: 'BRIEF', str: '0700', end: '0800', who }]) }
  const input = (r: any) => INPUTS.unshift({ allday: false, remarks: '', mod: 'now', yr: 2026, ...r })

  it('a commitment that OVERLAPS the event takes the man out of it', () => {
    /* the live bug the redefinition closes (spec §5): a man files Training over
       the event and answers NO to its own OIL question, and the family day's
       ALL AVAIL puck credits him anyway, for an event he is not at. */
    plant([EVENT])
    ownHour('bane')
    input({ person: 'bane', type: 'Training', date: 'Jul 18', s: 540, e: 1020 })  // 09:00–17:00
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT), 'his own hour only — the event is not his').toBe('HO')
  })

  it('a commitment that does NOT overlap leaves him in the event', () => {
    plant([EVENT])
    ownHour('bane')
    input({ person: 'bane', type: 'Training', date: 'Jul 18', s: 300, e: 420 })   // 05:00–07:00
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT), '07:00→17:00 — the event is his').toBe('FO')
  })

  it('a commitment the scheduler took off the programme is dormant and blocks nothing', () => {
    plant([EVENT])
    ownHour('bane')
    input({ person: 'bane', type: 'Training', date: 'Jul 18', s: 540, e: 1020, acc: 'r' })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
  })

  it('work already on the schedule at that time takes him out of the event', () => {
    plant([EVENT, { prog: 'OTHER EVENT', str: '1200', end: '1300', who: 'bane' }])
    ownHour('bane')
    publish(5)
    runOilPass()
    /* 07:00–08:00 and 12:00–13:00 are his own; the 10:00–17:00 event is not, so
       his day runs 07:00→13:00 — six hours, a half day, not a full one. */
    expect(cellOf('bane', SAT)).toBe('HO')
  })

  it('a SANS man planned on our programme that day IS part of ALL AVAIL', () => {
    const san = Object.keys(PEOPLE).find((id: any) => (PEOPLE as any)[id].san && !(PEOPLE as any)[id].archived) as string
    plant([EVENT])
    ownHour(san)                                          // he is with us that morning
    expect(availableFor(SAT, [600, 1020], DAYS[5]), 'with us that day').toContain(san)
    DAYS[5].ground = []
    expect(availableFor(SAT, [600, 1020], DAYS[5]), 'not on our programme').not.toContain(san)
  })

  /* THE CLASH, AND THE OWNER'S ANSWER (21 Sep 26 — "There's no way to credit OIL
     to SANs even when they are hidden?"). His 18 Aug rule keeps SANS off the
     Leave War roster unless "Show SANS" is on; his 21 Sep rule puts a SANS man
     planned with us inside ALL AVAIL. Hiding is a DISPLAY choice and must not
     destroy his money: the credit is stored against the person, so it lands
     while he is hidden and his row arrives carrying it when the switch goes on. */
  it('OIL35 — a SANS man earns even while the war HIDES him, and his row arrives carrying it', () => {
    const san = Object.keys(PEOPLE).find((id: any) => (PEOPLE as any)[id].san && !(PEOPLE as any)[id].archived) as string
    plant([EVENT])
    ownHour(san)
    publish(5)
    runOilPass()
    expect(getState().people.some(p => p.id === san), 'the war is hiding him').toBe(false)
    expect(cellOf(san, SAT), 'and he earns anyway — hiding is not forfeiting').toBe('FO')
    setPeople(projectPeople(true))
    runOilPass()
    expect(cellOf(san, SAT), 'his row arrives with what he already earned').toBe('FO')
  })

  it('OIL14, OIL35 — a sentinel is never credited, and ground crew only when NAMED', () => {
    plant([EVENT, { prog: 'GROUND CREW EVENT', str: '1000', end: '1600', who: 'torque' }])
    publish(5)
    runOilPass()
    expect(cellOf('allavail', SAT), 'a sentinel is not a person').toBeUndefined()
    /* GROUND CREW: out of the ALL AVAIL expansion by the owner's own rule, but a
       ground-crew man a scheduler NAMES on a weekend row is on the Leave War
       roster (his 18 Aug 26 ask) and has always earned from that row. Unchanged
       by this build; pinned here because the guard above now reasons about who
       may be credited, and this is the line it does NOT move. RAISED with the
       owner 21 Sep 26 as a question in its own right. */
    expect(cellOf('torque', SAT), 'named on the row, so he earns — existing behaviour').toBe('HO')
  })

  it('ATT B — no flying, may still work — stays in the event', () => {
    plant([EVENT])
    input({ person: 'bane', type: 'ATT B', date: 'Jul 18', allday: true, s: 0, e: 1439 })
    input({ person: 'stiff', type: 'ATT C', date: 'Jul 18', allday: true, s: 0, e: 1439 })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT), 'ATT B may still work').toBe('FO')
    expect(cellOf('stiff', SAT), 'ATT C cannot report to work').toBeUndefined()
  })

  it('a sentinel never blocks another sentinel — two overlapping ALL rows do not empty each other', () => {
    plant([EVENT, { prog: 'SECOND EVENT', str: '1100', end: '1200', who: 'ALL' }])
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT), 'only NAMED people count as planned for something').toBe('FO')
  })
})

describe('oilPendingFor — the bell\'s derived scan', () => {
  const plant = (r: any) => {
    const row: any = { allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, ...r }
    row.iid = row.iid || 'oiltest-' + Math.random().toString(36).slice(2)
    INPUTS.unshift(row)
    return row
  }

  it('a weekday input asks nothing — until Leave War marks the day a holiday after the fact', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 15' })
    expect(oilPendingFor('bane')).toEqual([])
    setRole('admin')
    setDayEvent('2026-07-15', 0, 'PH')                  // the retro case — the whole feature
    expect(oilPendingFor('bane')).toEqual([{ iid: r.iid, iso: '2026-07-15' }])
    r.oil = { '2026-07-15': 0 }                          // an explicit No IS an answer
    expect(oilPendingFor('bane')).toEqual([])
  })

  it('dormant rows and other people never ring', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'r' })
    plant({ person: 'stiff', type: 'Duty', date: 'Jul 18' })
    expect(oilPendingFor('bane')).toEqual([])
    expect(oilPendingFor('stiff').length).toBe(1)
  })
})

describe('bug-pass hardening (28 Aug 26)', () => {
  /* The 28 Aug 26 FS/HS → FO/HO rename-on-load test was removed with
     [ARCH-STACK] step 4: the war's stored shape changed (records as a list)
     and the schema bump RESETS old demo data rather than migrating it
     (owner's dev-phase rule), so no pre-rename war can reach the loader. */

  /* [ALL-AVAIL-REDEF] — Astra, 21 Sep 26. A REMOVED input is silent everywhere,
     and `availableFor` applied that rule to commitments (Training, Meeting…)
     but not to the away-making types: a leave, medical or overseas-duty request
     the scheduler had already turned down still kept its man out of ALL AVAIL.
     He was then missing from the frozen membership when the day went out and
     earned nothing — underpaid, with nothing on screen to explain it. The old
     dormant test covered only Training, which takes the other branch. */
  it('OIL13, OIL14 — a turned-down leave, medical or OD request does NOT keep a man out of ALL AVAIL', () => {
    for (const type of ['LL', 'Medical', 'OD']) {
      INPUTS.length = 0
      JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
      INPUTS.unshift({ person: 'bane', type, date: 'Jul 18', allday: true, s: 0, e: 1439,
        remarks: '', mod: 'now', yr: 2026, acc: 'r' })
      expect(availableFor(SAT, [8 * 60, 15 * 60], DAYS[5]),
        `a dormant ${type} speaks nowhere else, so it must not speak here either`).toContain('bane')
    }
  })

  it('a body posted out before the day never expands under ALL — even unarchived', () => {
    setRole('admin')
    expect(setPostOut('pump', '2026-07-01', false)).toBe(true)
    DAYS[5].allhands = DAYS[5].allhands || []
    DAYS[5].allhands.push({ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL' })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')                   // present bodies still earn
    expect(cellOf('pump', SAT), 'posted out — not in the squadron that day').toBeUndefined()
  })
})

/* A WEEKEND NO LEAVE WAR PERIOD COVERS — owner's ruling D19 (22 Sep 26). A
   weekend counts as a day that earns whether or not a war holds it; the credit
   can only be written into a war that DOES. So a day outside every period
   promised a full day of OIL that nobody could ever be paid, and said nothing
   about it. This is the wire that lets the schedule say so. */
describe('the day knows when no leave war period covers it (D19)', () => {
  /* these load a 2028 week; hand the file's own week back so nothing after
     them inherits it (loadweek.test.ts's rule) */
  afterEach(() => { loadWeek('13/07/2026') })

  it('names the year for a date outside every war, and says nothing for one inside', () => {
    installAbsenceDoor()
    /* the seed Saturday is held by the demo war — the control */
    expect(HOOKS.oilNoPeriod(5), 'a Saturday a period covers is fine').toBe('')
    /* a weekend in a year no war reaches — the demo seeds 2026 and 2027 */
    loadWeek('07/02/2028')
    const sat = DATES.findIndex((d: any) => /Feb 12/.test(String(d)))
    expect(sat, 'the week of 7 Feb 28 carries Sat the 12th').toBeGreaterThan(-1)
    expect(HOOKS.oilNoPeriod(sat), 'and it names the year whose period is missing').toBe('2028')
  })

  it('an ordinary weekday in that year says nothing — only a day that could earn asks', () => {
    installAbsenceDoor()
    loadWeek('07/02/2028')
    const wed = DATES.findIndex((d: any) => /Feb 9/.test(String(d)))
    expect(HOOKS.oilNoPeriod(wed)).toBe('')
  })

  it('creating the period from the schedule makes a real war for that year, in draft', () => {
    setRole('admin')
    expect(createOilPeriodFor('2028')).toBe('created')
    const w = getState().wars.find(x => x.period.start === '2028-01-01')
    expect(w, 'the war exists').toBeTruthy()
    expect(w!.period.end).toBe('2028-12-31')
    expect(w!.period.stage, 'draft — opening it for bidding stays his act').toBe('draft')
    installAbsenceDoor()
    loadWeek('07/02/2028')
    const sat = DATES.findIndex((d: any) => /Feb 12/.test(String(d)))
    expect(HOOKS.oilNoPeriod(sat), 'and the day stops complaining').toBe('')
  })

  it('a member cannot create one, and a year already covered is refused rather than duplicated', () => {
    setRole('member')
    expect(createOilPeriodFor('2028')).toBe('forbidden')
    setRole('admin')
    expect(createOilPeriodFor('2026'), 'the demo war already holds 2026').toBe('overlap')
  })
})

/* CODEX M8 — the "no war" line at the foot of the screen could never speak.
   `publishFlagsBids` returned on `!warHolding(...)` several lines before the
   branch that handles a day no war covers, so that branch was unreachable and
   any repair written against it would have shipped nothing. With D19 it has
   something worth saying: publishing a day whose year has no period is exactly
   the moment to tell him nothing can be paid for it. */
describe('publishing a day no leave war period covers says so (Codex M8 + D19)', () => {
  /* these load a 2028 week; hand the file's own week back so nothing after
     them inherits it (loadweek.test.ts's rule) */
  afterEach(() => { loadWeek('13/07/2026') })

  it('the strip names the missing period instead of staying silent', () => {
    installAbsenceDoor()
    loadWeek('07/02/2028')
    const sat = DATES.findIndex((d: any) => /Feb 12/.test(String(d)))
    ;(DAYS[sat] as any).ground = [{ prog: 'SDO', str: '0800', end: '1800', who: 'plasma' }]
    const said: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
    try {
      publish(sat)
      publishFlagsBids(sat)
    } finally { HOOKS.toast = real }
    expect(said.join(' | '), 'it says which period is missing').toMatch(/2028/)
    expect(said.join(' | ')).toMatch(/no leave war period|nothing can be paid|cannot be paid/i)
  })

  it('THE CONTROL — a day a period covers says nothing about periods', () => {
    installAbsenceDoor()
    const said: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
    try { publish(5); publishFlagsBids(5) } finally { HOOKS.toast = real }
    expect(said.join(' | ')).not.toMatch(/leave war period/i)
  })
})
