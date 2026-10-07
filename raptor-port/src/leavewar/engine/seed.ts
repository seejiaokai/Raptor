// Demo data, shaped like a squadron leave sheet so the matrix has something
// realistic to show on first run. Callsigns are invented. Replaced by real
// data once a backend exists.

import { buildDays, type Period } from './period'
import type { Person } from './people'
import { awardContrib, isOilAward, recContribs, type Recs, type WarRec } from './warrecs'
import { dayView, AM, PM, FULL, type Contrib, type Views } from './dayview'
import { parseCell } from './codes'
import { addDays } from './period'
import type { Grid } from './availability'
import type { States } from './bids'
import type { Ledger, Openings } from './counters'
import { makeWar, type LeaveWar } from './wars'
import type { Requirements } from './requirements'

type Row = [string, Person['seat'], Person['band'], boolean, string | null]

// callsign, seat, band, sxo, posted-out date
const ROWS: Row[] = [
  ['RAMP', 'pilot', 'ops', true, null],
  ['TATA', 'pilot', 'instructor', false, null],
  ['SPLICE', 'wso', 'instructor', false, null],
  ['JAGUAR', 'pilot', 'ops', false, null],
  ['SWITCHER', 'pilot', 'ops', false, '2026-01-12'],
  ['ASICS', 'pilot', 'ops', false, null],
  ['PIPPER', 'wso', 'ops', false, null],
  ['DUSK', 'wso', 'ops', false, null],
  ['MILES', 'pilot', 'instructor', false, null],
  ['ROULETTE', 'wso', 'instructor', false, null],
  ['CROSS', 'wso', 'ops', false, null],
  ['DECAL', 'pilot', 'ops', false, null],
  ['SKIN', 'wso', 'ops', false, null],
  ['SLAMMED', 'pilot', 'ops', false, null],
  ['CAGE', 'wso', 'ops', false, null],
  ['RESET', 'pilot', 'instructor', false, null],
]

// SC currency for the demo, mirroring Raptor's own seeding rule (people.ts:
// "the experienced hands hold both, the rest hold day only"): every
// instructor holds SC DAY and SC NIGHT; these four ops hands hold DAY only.
// On the live app the flags are a projection of Raptor's Quals page and this
// set is never read — it exists so the seeded SC D / SC N rows show real
// numbers instead of a uniform red, exactly like the rest of the demo grid.
const SC_DAY_OPS = new Set(['jaguar', 'asics', 'pipper', 'dusk'])

export function seedPeople(): Person[] {
  return ROWS.map(([callsign, seat, band, sxo, to]) => {
    const id = callsign.toLowerCase()
    const instr = band === 'instructor'
    return {
      id,
      callsign,
      seat,
      band,
      sxo,
      from: null,
      to,
      scd: instr || SC_DAY_OPS.has(id),
      scn: instr,
    }
  })
}

// A FULL YEAR, not a quarter. The squadron forecasts a quarter ahead, but the
// war it forecasts inside runs the year — so the whole thing is on one sheet
// and the month strip is how you get about it. 365 columns is 13,600px wide;
// nobody scrolls to September by dragging.
export function seedPeriod(): Period {
  const days = buildDays('2026-01-01', '2026-12-31')
  for (const d of days) {
    if (d.date === '2026-01-01') {
      d.ph = true
      d.events[0] = 'PH'
    }
    if (d.date === '2026-02-17' || d.date === '2026-02-18') {
      d.ph = true
      d.events[0] = 'PH'
    }
    // A week of heavy tasking where leave is discouraged but still biddable.
    // Runs through Saturday 2026-03-14 on purpose: exercises spill into
    // weekends, and this gives the blocked+weekend header overlap real
    // seed coverage instead of only existing in a synthetic test.
    if (d.date >= '2026-03-09' && d.date <= '2026-03-14') {
      d.blocked = true
      d.blockedReason = 'Exercise week'
    }
    // A second blocked week late in the year, so the month strip has
    // somewhere worth navigating TO rather than only proving it moves.
    if (d.date >= '2026-09-14' && d.date <= '2026-09-19') {
      d.blocked = true
      d.blockedReason = 'Exercise week'
    }
    if (d.date === '2026-08-09' || d.date === '2026-12-25') {
      d.ph = true
      d.events[0] = 'PH'
    }
  }
  // Open, with bidding on the FIRST QUARTER only. That combination is the
  // whole point of the window and is why it is seeded rather than left null:
  // the squadron reads the entire year, and can bid on the part of it the
  // schedule has actually reached. Jan–Mar because every seeded bid sits in
  // January and February, so the demonstration costs no seed data — and Apr
  // onwards is visibly locked from the first screen.
  return {
    id: 'y2026',
    name: 'JAN - DEC 26',
    start: '2026-01-01',
    end: '2026-12-31',
    stage: 'open',
    bidFrom: '2026-01-01',
    bidTo: '2026-03-31',
    days,
    bands: [],
  }
}

// THE MANNING BLOCK COMES WITH NO COUNT ROWS OF ITS OWN (owner, D669, 8 Oct 26 — "should there be a default counter?
// I think there shouldn't be and the user can create what they want"). A squadron makes the counters it wants with
// "+ Counter" (ui/CounterForm.tsx → state/store.ts saveManningRule); until it does, the block shows only the four
// Required / Available rows (ui/FlyRows.tsx — the two Available rows are built in, engine/availrows.ts, and are not
// rules of this list).
//   This list held eleven until then — Crew sets, IP, IWSO, IP + IWSO, OPSP, OPSW, FL P, WM P, SXO, SC D, SC N. They
// are kept, word for word, in `leavewar/testing/eleven.ts` for the tests that are about counters, which MAKE them
// through the real writer; nothing in the app reads that file. No day is judged by a counter that does not exist:
// with none, no day is "under-manned".
//   Nothing stored is converted (D56): a squadron that had saved its counters keeps them exactly as saved.
export function seedRequirements(): Requirements {
  return { default: { rules: [] }, overrides: {} }
}

// THE SEED'S LEAVE ([ARCH-STACK] step 4). A war stores only its own records
// now — requests and OIL credits — so the seed is split the same way:
//   `seedRecs`      the requests (pending / acknowledged / refused, so every
//                   colour the sheet paints is on screen from the first run)
//                   and the hand-typed OIL credits;
//   `SEED_ABSENCES` the leave that is already APPROVED or was filed on the
//                   Inputs page, plus the course — these are Inputs now, and
//                   the Raptor side (demoworld / the test harness) files them
//                   as Inputs before the war first reads.
// The ORIGINAL sheet's `HO` (half OIL taken) became `*OIL` and a bare `AM`/`PM`
// became `*LL`/`LL*` long ago; the notation below is today's.
export interface SeedAbsence {
  person: string
  /** the Leave War code (spaceless medical), portion marks included */
  code: string
  date: string
  endDate?: string
  /** approved on the war (the Input carries `lw`) vs filed on the Inputs page */
  lw: boolean
}

let seedN = 0
const rq = (code: string, state: 'pending' | 'acknowledged' | 'refused'): WarRec[] =>
  [{ id: `seed${++seedN}`, kind: 'request', code, state }]

export function seedRecs(): Recs {
  seedN = 0
  return {
    /* RAMP, TATA and SKIN's hand-given OIL on 1–4 Jan are LEDGER AWARDS now
       (seedLedger — [OIL-AWARD-IS-A-GRANT], D401: the seed is rewritten, the
       same worth on the same days), drawn on the grid from there (D402). */
    ramp: { '2026-02-10': rq('*OIL', 'pending') },
    // SPLICE's LL has no decision recorded — a plain pending bid, the shape a
    // bid nobody has looked at yet renders as.
    splice: { '2026-01-08': rq('LL', 'pending') },
    jaguar: { '2026-01-19': rq('OL', 'refused') },
    // ASICS carries every request colour at once: refused red, acknowledged
    // purple, and a plain pending bid (his approved green LL is an Input).
    asics: { '2026-01-09': rq('LL', 'refused'), '2026-01-23': rq('*LL', 'pending'), '2026-02-24': rq('OIL', 'acknowledged') },
    // MILES holds two plain pending bids — no seeded `shiftedFrom` (a trail is
    // a closed-war fact, owner 27 Aug 26).
    miles: { '2026-02-02': rq('LL', 'pending'), '2026-02-03': rq('LL*', 'pending') },
    cross: { '2026-03-10': rq('LL', 'refused') },
  }
}

export const SEED_ABSENCES: readonly SeedAbsence[] = Object.freeze([
  { person: 'ramp', code: 'OL', date: '2026-01-01', lw: true },
  // TATA's OIL came in through Raptor's input tab: asked verbally, told yes —
  // filed on the Inputs page, so it reads read-only on the war.
  { person: 'tata', code: 'OIL', date: '2026-01-09', lw: false },
  { person: 'jaguar', code: 'OL', date: '2026-01-16', endDate: '2026-01-17', lw: true },
  { person: 'asics', code: 'LL', date: '2026-01-08', lw: true },
  { person: 'pipper', code: 'CSE', date: '2026-01-12', endDate: '2026-01-13', lw: false },
  { person: 'roulette', code: 'CCL', date: '2026-01-15', lw: true },
  { person: 'dusk', code: 'OIL', date: '2027-05-04', lw: false },
])

// Opening balances, and the ledger that has moved them since. Deliberately
// not round numbers: §Counters records that a balance is allowed to run
// negative, so CROSS opens deep in the red and DECAL's OIL is negative too.
// Both must render on first run, because "negative shows red and is never
// refused" is a rule nobody can judge against an all-positive screen.
export function seedOpenings(): Openings {
  return {
    ramp: { annual: 12, oil: 3, ccl: 5 },
    tata: { annual: 8, oil: 1.5 },
    splice: { annual: 15, oil: 0.5, pl: 10 },
    jaguar: { annual: 4, oil: 2 },
    switcher: { annual: 6, el: 14 },
    asics: { annual: 9.5, oil: 4 },
    pipper: { annual: 11, oil: 1 },
    dusk: { annual: 14, oil: 2.5, ccl: 5 },
    miles: { annual: 7, oil: 6 },
    roulette: { annual: 10, ccl: 5, fcl: 6 },
    cross: { annual: -12, oil: 1 },
    decal: { annual: 5, oil: -4.5 },
    skin: { annual: 13, oil: 2 },
    slammed: { annual: 3, oil: 0 },
    cage: { annual: 16, oil: 1 },
    reset: { annual: 2, oil: 8 },
  }
}

// The ledger holds only what the GRID cannot already account for: the annual
// top-up, an award, a correction. Leave taken is not posted here — the
// person's own row is that record, and a second copy of it would be a second
// version of the truth. See `counters.ts`.
export function seedLedger(): Ledger {
  return [
    { id: 'l1', personId: 'ramp', counter: 'annual', amount: 14, date: '2026-01-01', reason: 'Annual leave top-up', approvedBy: 'SQNCDR' },
    { id: 'l2', personId: 'tata', counter: 'annual', amount: 14, date: '2026-01-01', reason: 'Annual leave top-up', approvedBy: 'SQNCDR' },
    { id: 'l3', personId: 'cross', counter: 'annual', amount: 14, date: '2026-01-01', reason: 'Annual leave top-up', approvedBy: 'SQNCDR' },
    { id: 'l4', personId: 'jaguar', counter: 'oil', amount: 2, date: '2026-01-19', reason: 'CNY workplan', approvedBy: 'SQNCDR' },
    { id: 'l5', personId: 'asics', counter: 'oil', amount: 1.5, date: '2026-02-02', reason: 'Exercise recovery', approvedBy: 'OC OPS' },
    // Hand-given OIL on the war's first days — typed on the grid before awards
    // became ledger entries, the same worth on the same days (D401).
    { id: 'l7', personId: 'ramp', counter: 'oil', amount: 1, date: '2026-01-03', reason: 'Weekend recovery', approvedBy: 'SQNCDR' },
    { id: 'l8', personId: 'tata', counter: 'oil', amount: 1, date: '2026-01-01', reason: 'New Year duty', approvedBy: 'SQNCDR' },
    { id: 'l9', personId: 'tata', counter: 'oil', amount: 1, date: '2026-01-04', reason: 'Weekend recovery', approvedBy: 'SQNCDR' },
    { id: 'l10', personId: 'skin', counter: 'oil', amount: 0.5, date: '2026-01-03', reason: 'Half-day recovery', approvedBy: 'SQNCDR' },
    // A correction is a negative amount, not a second mechanism — one ledger
    // covers top-ups, awards and fixes alike (§Counters).
    { id: 'l6', personId: 'miles', counter: 'annual', amount: -1, date: '2026-02-14', reason: 'Correction: double-counted 12 Jan', approvedBy: 'SQNCDR' },
  ]
}

// Two leave wars, so switching between them is a real thing to look at on
// first run rather than a control with one entry.
//
// Jan–Mar is OPEN and carries the seeded leave; Apr–Jun is a DRAFT the
// admin has not opened yet, which is the ordinary state of the next war
// while the schedule for it is still being firmed up. Apr–Jun holds a
// little leave of its own precisely so the cross-war balance rule has
// something to prove: RESET's four days there spend the same annual pool
// that Jan–Mar draws on, and the figure must not change when you switch.
//
// The two do not overlap, and must not: a date belongs to at most one war.
export function seedWars(): LeaveWar[] {
  const y26 = makeWar('y2026', 'JAN - DEC 26', '2026-01-01', '2026-12-31')
  y26.period = seedPeriod()
  y26.recs = seedRecs()

  // Next year's war, in draft — the ordinary state of the one after the
  // current, while its schedule is still being firmed up. It holds leave of
  // its own so the cross-war balance rule has something to prove: RESET's
  // four days here spend the same annual pool the 2026 screen draws on, and
  // his figure must read the same from either.
  const y27 = makeWar('y2027', 'JAN - DEC 27', '2027-01-01', '2027-12-31')
  y27.recs = {
    reset: Object.fromEntries(['2027-04-13', '2027-04-14', '2027-04-15', '2027-04-16'].map(d => [d, rq('LL', 'pending')])),
    dusk: { '2027-05-05': rq('*LL', 'pending') },
  }

  return [y26, y27]
}

/** The seed wars as FIGURE SOURCES — each war with its day views built from
 *  its own records plus `SEED_ABSENCES` (what the store's merge produces once
 *  those absences are filed as Inputs). For engine code and tests that read
 *  the seed without the Raptor side ([ARCH-STACK] step 4). */
export function seedSources(): Array<LeaveWar & { grid: Grid; states: States; views: Views }> {
  return seedWars().map(w => {
    const at = new Map<string, Contrib[]>()
    const push = (pid: string, d: string, c: Contrib) => {
      const k = `${pid}|${d}`
      at.set(k, [...(at.get(k) ?? []), c])
    }
    for (const [pid, row] of Object.entries(w.recs)) for (const [d, list] of Object.entries(row)) for (const c of recContribs(list)) push(pid, d, c)
    /* the seed ledger's OIL AWARDS, drawn on their days as the store's merge
       draws them (D402) — ONE builder, `awardContrib` (Fable's plan read F10) */
    for (const e of seedLedger()) if (isOilAward(e) && e.date >= w.period.start && e.date <= w.period.end) push(e.personId, e.date, awardContrib(e))
    SEED_ABSENCES.forEach((a, i) => {
      const cell = parseCell(a.code)!
      const win = cell.portion === 'am' ? AM : cell.portion === 'pm' ? PM : FULL
      for (let d = a.date, n = 0; d <= (a.endDate ?? a.date) && n < 400; d = addDays(d, 1), n++) {
        if (d < w.period.start || d > w.period.end) continue
        push(a.person, d, { id: `seedabs${i}`, kind: 'absence', code: cell.type, win, ...(a.lw ? { lw: true } : {}) })
      }
    })
    const views: Views = {}
    for (const [k, cs] of at) {
      const [pid, d] = k.split('|') as [string, string]
      ;(views[pid] ??= {})[d] = dayView(cs)
    }
    return { ...w, grid: {}, states: {}, views }
  })
}
