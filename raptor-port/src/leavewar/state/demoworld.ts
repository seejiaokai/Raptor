// The demo re-key: the demo world the standalone Leave War app shipped,
// worn by the owner's real crew.
//
// The seed (engine/seed.ts) is written against sixteen invented callsigns,
// and the 609 vendored unit tests read it PRISTINE — so nothing here touches
// the seed. Instead, at BOOT and only at boot (the state/demoseed.ts
// precedent on the Raptor side: boot-time only, tests blind by
// construction), the seeded wars/openings/ledger are re-keyed from the seed
// people onto Raptor aircrew of the SAME seat and band, so every demo cell
// still means what it meant.
//
// It runs only on a FRESH boot, and since Leave War went session-only (a
// memory backend, matching Raptor's own INPUTS — see main.tsx) EVERY boot is
// a fresh one: nothing survives a reload to be corrupted, so the caller always
// passes hadStoredWars=false and the demo world is always re-keyed. The
// `hadStoredWars=true` branch (people projection only, wars left alone) is kept
// for the shared database backend to come: once real war data can outlive a
// reload, "this squadron already has its own data" becomes meaningful again
// and re-keying it would corrupt it.

import { INPUTS, inpId } from '../../engine/inputs'
import { seedPeople, type BidRecord, type Grid, type Ledger, type States } from '../engine'
import { projectPeople } from './raptorRoster'
import { getState, installDemoOil, remapPersonKeys, setPeople } from './store'

/**
 * Seed person -> Raptor person. HAND-PICKED so that every mapped Raptor
 * person has the SAME seat and band as the seed person they replace —
 * seat because pilot/wso rows must stay pilot/wso rows, band because the
 * demo's manning counts and category labels are built on it.
 * raptorRoster.test.ts verifies the equality against both real rosters;
 * a Raptor CAT change that breaks it fails there, loudly.
 *
 * (Chosen so the mapped Raptor people's own SXO flags also happen to match
 * the seed's — slipway is Raptor's own SXO — which keeps the demo overlay
 * below down to the one thing Raptor cannot know: a posting-out date.)
 */
export const DEMO_MAP: Record<string, string> = {
  ramp: 'slipway',      // pilot / ops, SXO
  tata: 'prowler',      // pilot / instructor
  splice: 'wolf',       // wso / instructor
  jaguar: 'dj',         // pilot / ops
  switcher: 'ignite',   // pilot / ops — posted out (demo overlay carries the date)
  asics: 'bruise',      // pilot / ops
  pipper: 'pain',       // wso / ops
  dusk: 'ammo',         // wso / ops
  miles: 'slash',       // pilot / instructor
  roulette: 'dirty',    // wso / instructor
  cross: 'rocky',       // wso / ops
  decal: 'casper',      // pilot / ops
  skin: 'divot',        // wso / ops
  slammed: 'pike',      // pilot / ops — was vinci, moved off him when SANS
                        // left the default roster (18 Aug 26): a demo cell
                        // keyed onto a hidden SANS body would render nowhere
  cage: 'spaceman',     // wso / ops
  reset: 'harpoon',     // pilot / instructor
}

/* The seed's two Raptor-owned cells (TATA's OIL on 9 Jan 26, DUSK's OIL on
   4 May 27), BACKED by the live inputs the seed's own comments say they came
   from. Without these, the sync's reverse pass — a Raptor-owned cell no
   live input covers is cleared — would erase the demo's Raptor-owned
   examples at boot, and the two render paths they exist to exercise would
   never appear on a fresh screen. Pushed idempotently on every boot, the
   demoseed idiom: Raptor's INPUTS are session-only, so they need re-seeding
   whether or not Leave War's half persisted. */
const DEMO_RAPTOR_INPUTS: any[] = [
  { person: DEMO_MAP.tata, date: 'Jan 9', allday: true, type: 'OIL',
    remarks: 'OIL — CO approved', mod: '2026-06-20' },
  { person: DEMO_MAP.dusk, date: 'May 4 2027', allday: true, type: 'OIL',
    remarks: 'OIL — CO approved', mod: '2026-06-20' },
]

/* The demo OIL story (owner, 2 Sep 26 — "put in more mock data as well as
   archive mock data to see how the layout is"). Keyed by SEED id and laid
   over the seed BEFORE the re-key, so DEMO_MAP dresses it with everyone
   else. Every earned day is a HAND-TYPED FO/HO with its reason as the cell
   note — not a Raptor-owned one, because the OIL pass sweeps any owned
   FO/HO the live schedule does not back the moment the wires run. Every day
   taken is an approved bid, drawn FIFO like any other. Sized so the tracker
   shows each shape on first run: a credit used up (archived), one part-drawn
   with its takes stacked, a correction, an untouched grant with a giver, a
   2027 lane, and a row whose only credit is in the archive. */
const APPROVED: BidRecord = { state: 'approved', source: 'bid' }
const earned = (note: string): BidRecord => ({ state: 'approved', source: 'bid', note })
const grant = (id: string, personId: string, amount: number, date: string, reason: string, approvedBy: string, givenBy?: string) =>
  ({ id, personId, counter: 'oil' as const, amount, date, reason, approvedBy, ...(givenBy ? { givenBy } : {}) })

export const DEMO_OIL: { grid: Grid; states: States; ledger: Ledger } = {
  grid: {
    // opening 3, FO 3 Jan and a half day pending on 10 Feb already seeded:
    // the opening figure is used up by June (archived), the January day
    // part-drawn, the March grant and April half day untouched.
    ramp: { '2026-04-18': 'HO', '2026-05-11': 'OIL', '2026-05-12': 'OIL', '2026-06-13': 'OIL' },
    // opening 1.5 and two January days seeded, one OIL day taken 9 Jan: two
    // more takes empty the opening AND the 1 Jan day — two archived boxes.
    tata: { '2026-02-07': 'FO', '2026-03-21': 'FO', '2026-03-02': 'OIL', '2026-03-30': 'OIL' },
    asics: { '2026-07-15': 'OIL', '2026-07-16': 'OIL' },
    // opening 6, one earned day, a −1 correction, three days taken.
    miles: { '2026-05-09': 'FO', '2026-06-01': 'OIL', '2026-06-02': 'OIL', '2026-06-03': 'OIL' },
    // a 2027 grant and a 2027 day taken — the second year lane.
    reset: { '2027-02-15': 'OIL' },
    dusk: { '2026-07-04': 'FO', '2026-08-08': 'HO' },
    cage: { '2026-08-15': 'FO' },
    skin: { '2026-08-29': 'FO' },
    // opening 0: one earned day, taken the week after — the row's ONLY
    // credit is in the archive, so it reads idle with a count of 1.
    slammed: { '2026-01-10': 'FO', '2026-01-14': 'OIL' },
  },
  states: {
    ramp: { '2026-04-18': earned('SIM'), '2026-05-11': APPROVED, '2026-05-12': APPROVED, '2026-06-13': APPROVED },
    tata: { '2026-02-07': earned('FLT'), '2026-03-21': earned('Duty'), '2026-03-02': APPROVED, '2026-03-30': APPROVED },
    asics: { '2026-07-15': APPROVED, '2026-07-16': APPROVED },
    miles: { '2026-05-09': earned('FLT + SIM'), '2026-06-01': APPROVED, '2026-06-02': APPROVED, '2026-06-03': APPROVED },
    reset: { '2027-02-15': APPROVED },
    dusk: { '2026-07-04': earned('Duty'), '2026-08-08': earned('SIM') },
    cage: { '2026-08-15': earned('FLT') },
    skin: { '2026-08-29': earned('Duty') },
    slammed: { '2026-01-10': earned('FLT'), '2026-01-14': APPROVED },
  },
  ledger: [
    grant('dol-1', 'ramp', 2, '2026-03-14', 'Ex Forging Sabre recovery', 'SQNCDR', 'OC Ops'),
    grant('dol-2', 'asics', 1, '2026-06-06', 'Night flying week', 'SQNCDR', 'SQNCDR'),
    grant('dol-3', 'miles', -1, '2026-05-20', 'Correction: double credit', 'SQNCDR'),
    grant('dol-4', 'reset', 2, '2027-01-09', 'Ex Cope Tiger', 'SQNCDR', 'OC Ops'),
  ],
}

/**
 * Boot-time projection + demo re-key. Called once from main.tsx, after
 * lwInitStore and before the sync wires run.
 */
export function installDemoWorld(hadStoredWars: boolean): void {
  /* honour a stored showSans at boot — the store loaded before this runs */
  const people = projectPeople(getState().showSans)

  if (!hadStoredWars) {
    /* The demo overlay: sxo and the posting-out window come from the SEED
       person, applied AFTER projection, so the demo reads exactly as the
       standalone app's did (one SXO short on the red days, one man posted
       out mid-January). By construction of DEMO_MAP the sxo flags already
       agree, so in practice this carries only IGNITE's posting-out date. */
    const overlay = new Map(seedPeople().map(p => [DEMO_MAP[p.id], p]))
    for (const p of people) {
      const seed = overlay.get(p.id)
      if (seed) {
        p.sxo = seed.sxo
        p.from = seed.from
        p.to = seed.to
      }
    }
  }

  setPeople(people)

  /* Fresh browsers only: stored wars are real data, never re-keyed — and
     the demo OIL story goes in first, so the re-key dresses it too. */
  if (!hadStoredWars) {
    installDemoOil(DEMO_OIL)
    remapPersonKeys(DEMO_MAP)
  }

  for (const rec of DEMO_RAPTOR_INPUTS) {
    /* Guarded per person+date+type, the seedDemoSans idiom — a second boot
       against the same INPUTS array must not double-file. */
    const already = INPUTS.some(
      (x: any) => x.person === rec.person && x.date === rec.date && x.type === rec.type,
    )
    if (already) continue
    const row = { ...rec }
    inpId(row)
    INPUTS.push(row)
  }
}
