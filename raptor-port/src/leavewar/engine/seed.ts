// Demo data, shaped like a squadron leave sheet so the matrix has something
// realistic to show on first run. Callsigns are invented. Replaced by real
// data once a backend exists.

import { buildDays, type Period } from './period'
import type { Person } from './people'
import type { Recs, WarRec } from './warrecs'
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

// One team of SC cover, spelt out for the tap-a-row sheet. The wording is the
// owner's own combination (19 Aug 26): "2 pilot SC day qualified and 2 WSO sc
// day qualified. And a SXO. And any crew, not including ground crew."
const SC_TEAM = (kind: string) =>
  `One team is 2 SC ${kind} qualified pilots + 2 SC ${kind} qualified WSOs + 1 SXO + 1 more crew (pilot or WSO, any CAT) — six different people, ground crew never counted. The day's number is how many complete teams can still be manned; someone standing SC duty still counts, they are at work.`

// The instructor rungs of the CAT ladder, and the flight-lead rungs (CAT B
// and above, instructors included — the owner's FL P rule). The seeded rules
// name CATs rather than the old band flag because that is the vocabulary the
// counter form edits; `effectiveCat` folds a band-only seed person onto the
// same rungs, so the two readings agree on every roster.
const INSTR_CATS = ['FI', 'IR', 'IP', 'IW']
const LEAD_CATS = ['FI', 'IR', 'IP', 'A', 'B']

// The SC cover recipe as team slots (owner, 19 Aug 26): presence counts —
// someone standing SC duty is at work, not a gap — and the day's number is
// complete teams.
const SC_SLOTS = (qual: string) => [
  { count: 2, filter: { seats: ['pilot' as const], quals: [qual] } },
  { count: 2, filter: { seats: ['wso' as const], quals: [qual] } },
  { count: 1, filter: { quals: ['sxo'] } },
  { count: 1, filter: {} },
]

export function seedRequirements(): Requirements {
  return {
    default: {
      rules: [
        // Crew sets lead the list, where the standalone set rule used to sit
        // before rules became data. A set is the two-slot team: whichever
        // seat runs out first caps it, which is exactly what the team maths
        // computes for two slots.
        { id: 'sets', label: 'Crew sets', count: { kind: 'team', slots: [{ count: 1, filter: { seats: ['pilot'] } }, { count: 1, filter: { seats: ['wso'] } }] }, threshold: { amber: 5, red: 4.5 }, desc: 'One set is one pilot plus one WSO — a jet you can crew. The day\'s number is whichever seat runs out first.' },
        { id: 'ip', label: 'IP', count: { kind: 'people', filter: { seats: ['pilot'], cats: INSTR_CATS } }, threshold: { amber: 3, red: 2 }, desc: 'Instructor pilots available.' },
        { id: 'iwso', label: 'IWSO', count: { kind: 'people', filter: { seats: ['wso'], cats: INSTR_CATS } }, threshold: { amber: 3, red: 2 }, desc: 'Instructor WSOs available.' },
        { id: 'instr', label: 'IP + IWSO', count: { kind: 'people', filter: { cats: INSTR_CATS } }, threshold: { amber: 5, red: 4 }, desc: 'Instructor pilots and instructor WSOs together.' },
        { id: 'opsp', label: 'OPSP', count: { kind: 'people', filter: { seats: ['pilot'], notCats: INSTR_CATS } }, threshold: { amber: 4, red: 3 }, desc: 'Ops pilots (CAT A–D, OCU included) available.' },
        { id: 'opsw', label: 'OPSW', count: { kind: 'people', filter: { seats: ['wso'], notCats: INSTR_CATS } }, threshold: { amber: 4, red: 3 }, desc: 'Ops WSOs (CAT A–D, OCU included) available.' },
        // FL P / WM P split the pilots by CAT (owner, 18 Aug 26). Seeded at
        // amber 0 / red 0, which never fires (a count is never below zero) —
        // the row shows the head count without judging a day. Since 19 Aug 26
        // the floors are the squadron's to set: tap the row, edit the numbers.
        // WM P is "pilots EXCEPT the lead CATs" rather than a list of junior
        // rungs, so the two rows still partition every pilot — one with no
        // CAT at all lands on the wingman side, the junior default.
        { id: 'flp', label: 'FL P', count: { kind: 'people', filter: { seats: ['pilot'], cats: LEAD_CATS } }, threshold: { amber: 0, red: 0 }, desc: 'Flight-lead pilots — CAT B and above, instructors included.' },
        { id: 'wmp', label: 'WM P', count: { kind: 'people', filter: { seats: ['pilot'], notCats: LEAD_CATS } }, threshold: { amber: 0, red: 0 }, desc: 'Wingman pilots — CAT C and below.' },
        { id: 'sxo', label: 'SXO', count: { kind: 'people', filter: { quals: ['sxo'] } }, threshold: { amber: 1, red: 1 }, desc: 'SXO-qualified crew available, counted on top of their own category.' },
        // The SC cover rows (owner, 19 Aug 26): below one complete team the
        // day is RED — amber equal to red means there is no amber band, the
        // same idiom as the SXO row. Both editable from the row's sheet.
        { id: 'scd', label: 'SC D', count: { kind: 'team', slots: SC_SLOTS('scDay'), presence: true }, threshold: { amber: 1, red: 1 }, desc: SC_TEAM('Day') },
        { id: 'scn', label: 'SC N', count: { kind: 'team', slots: SC_SLOTS('scNight'), presence: true }, threshold: { amber: 1, red: 1 }, desc: `${SC_TEAM('Night')} SC Night is the AVALON cover.` },
      ],
    },
    overrides: {},
  }
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
const credit = (code: 'FO' | 'HO'): WarRec[] => [{ id: `seed${++seedN}`, kind: 'credit', code, oil: 'manual' }]

export function seedRecs(): Recs {
  seedN = 0
  return {
    ramp: { '2026-01-03': credit('FO'), '2026-02-10': rq('*OIL', 'pending') },
    tata: { '2026-01-01': credit('FO'), '2026-01-04': credit('FO') },
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
    skin: { '2026-01-03': credit('HO') },
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
