// The demo re-key: the demo world the standalone Leave War app shipped,
// dressed onto Raptor's own roster.
//
// The seed (engine/seed.ts) is written against sixteen invented callsigns,
// and the 609 vendored unit tests read it PRISTINE — so nothing here touches
// the seed. Instead, at BOOT and only at boot (the state/demoseed.ts
// precedent on the Raptor side: boot-time only, tests blind by
// construction), the seeded wars/openings/ledger are re-keyed from the seed
// people onto Raptor aircrew of the SAME seat and band, so every demo cell
// still means what it meant.
//
// It runs only on a FRESH boot. CORRECTED 17 Sep 26: the old paragraph here said
// Leave War "went session-only (a memory backend)" so EVERY boot is fresh and the
// caller "always passes hadStoredWars=false". Both halves are false since the
// 8 Sep 26 storage work. Leave War boots on the WHITEBOARD, and main.tsx passes
// the REAL flag: `wb.has('leavewar','wars')`. So on a built site a returning
// browser takes the `hadStoredWars=true` branch — people projection only, wars
// left alone — and that branch is LIVE today, not reserved for the shared
// database to come. The memory backend is now the dev/test path only
// and re-keying it would corrupt it.

import { INPUTS, inpId } from '../../engine/inputs'
import { seedPeople, SEED_ABSENCES, warHolding, type Ledger, type Recs, type WarRec } from '../engine'
import { inputRowFor } from '../absences'
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

/* The demo's member-filed rows ([ARCH-STACK] step 4 — every approved or filed
   absence is an Input now; the seed's own list is `SEED_ABSENCES`, filed below
   together with the demo OIL story's taken days). */
const DEMO_RAPTOR_INPUTS: any[] = [
  /* SPLICE's medical is MEMBER-FILED (owner, 13 Sep 26): the war can no longer
     create medical, so the demo shows it as the member's OWN Inputs filing — the
     ATT C / OML rows show on the war (read from the Inputs) as read-only cells, the
     one way medical reaches the war now. The pristine seed carries no war-marked
     medical at all; this is the live demo's member-filed example. A CLOSING
     upchit (7 Jan) completes the episode so the Medical view shows no
     never-clearing "pending upchit" for him (an upchit never lands a war cell, so
     the war still shows the down days). `yr: 2026` is EXPLICIT: these are pushed
     AFTER initStore's year-stamping pass, so a bare 'Jan 5' would re-resolve
     against whatever year is later loaded and shift the cell out from under itself. */
  { person: DEMO_MAP.splice, date: 'Jan 5', yr: 2026, allday: true, type: 'ATT C',
    remarks: 'ATT C — filed on Inputs', mod: '2026-01-04' },
  { person: DEMO_MAP.splice, date: 'Jan 6', yr: 2026, allday: true, type: 'OML',
    remarks: 'OML — filed on Inputs', mod: '2026-01-05' },
  { person: DEMO_MAP.splice, date: 'Jan 7', yr: 2026, allday: true, type: 'Upchit',
    remarks: 'Medically up 7 Jan', mod: '2026-01-07' },
  /* THE ONE DAY THE DEMO EARNS ITS OWN OIL, AND IT SHOWS THE 21 SEP RULING
     (owner: "we should put it in the demo data to test it too").

     Every other OIL day here is a hand-typed AWARD, so before this the
     automatic half of the feature was invisible on a fresh boot — and N16,
     that an award and a worked day ADD UP, had nothing to demonstrate it.

     An ACCEPTED duty-and-commitments input with its OIL claim answered earns
     a real `auto` credit through the same pass the published schedule uses
     (`sync.ts desiredOilCells`, `via: 'input'`). That route is used rather
     than publishing a demo day because a published day would change the week
     the reference parity gate measures.

     DUSK already holds a 3-day award on this Saturday, so the demo opens with
     the owner's own example on it: 3 owed + 1 worked = FOUR, the day showing
     the schedule's credit with the award behind a +1, and the tracker listing
     them as two rows — one marked Auto, one naming who gave it.

     4 Jul 2026 is a Saturday and sits OUTSIDE the loaded week (13–19 Jul), so
     nothing the parity gate renders moves. */
  { person: DEMO_MAP.dusk, date: 'Jul 4', yr: 2026, allday: true, type: 'Duty',
    remarks: 'SDO — weekend duty crew', mod: '2026-07-01',
    oil: { '2026-07-04': 1 } },
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
let demoN = 0
/* AN AWARD, not an earned day (N13/N16, 20–21 Sep 26). The helper was called
   `earned` and the story around it said "every earned day" — both written
   before an award and an earned credit behaved differently. They now differ in
   every way that matters: an award flags nothing, stands nobody down, is never
   touched by the schedule, reads "OIL award" on the day sheet and carries no
   "Auto" mark on the tracker. Naming these `earned` invited the next reader to
   believe the demo had schedule-earned credits when it had none. */
const award = (code: 'FO' | 'HO', note: string, days?: number, givenBy?: string): WarRec[] =>
  [{ id: `demo${++demoN}`, kind: 'credit', code, oil: 'manual', note, ...(days != null ? { days } : {}), ...(givenBy ? { givenBy } : {}) }]
const grant = (id: string, personId: string, amount: number, date: string, reason: string, approvedBy: string, givenBy?: string) =>
  ({ id, personId, counter: 'oil' as const, amount, date, reason, approvedBy, ...(givenBy ? { givenBy } : {}) })

/* The OIL days TAKEN in the story — approved leave, so Inputs (seed ids). */
const DEMO_OIL_TAKEN: Array<[string, string]> = [
  ['ramp', '2026-05-11'], ['ramp', '2026-05-12'], ['ramp', '2026-06-13'],
  ['tata', '2026-03-02'], ['tata', '2026-03-30'],
  ['asics', '2026-07-15'], ['asics', '2026-07-16'],
  ['miles', '2026-06-01'], ['miles', '2026-06-02'], ['miles', '2026-06-03'],
  ['reset', '2027-02-15'],
  ['slammed', '2026-01-14'],
]

export const DEMO_OIL: { recs: Recs; ledger: Ledger } = {
  // opening 3, FO 3 Jan seeded: the opening figure is used up by June
  // (archived), the January day part-drawn, the March grant and April half
  // day untouched. Every earned day is a HAND-TYPED credit with its reason —
  // the OIL pass would sweep a generated one the live schedule does not back.
  recs: {
    ramp: { '2026-04-18': award('HO', 'SIM') },
    tata: { '2026-02-07': award('FO', 'FLT'), '2026-03-21': award('FO', 'Duty') },
    miles: { '2026-05-09': award('FO', 'FLT + SIM') },
    /* 4 Jul is the ADD-UP day (N16): this 3-day award sits beside the credit
       the accepted Duty input earns, so the Saturday is worth FOUR. */
    dusk: { '2026-07-04': award('FO', 'Exercise recovery', 3, 'OC Ops'), '2026-08-08': award('HO', 'SIM') },
    cage: { '2026-08-15': award('FO', 'FLT') },
    skin: { '2026-08-29': award('FO', 'Duty') },
    // opening 0: one earned day, taken the week after — the row's ONLY
    // credit is in the archive, so it reads idle with a count of 1.
    slammed: { '2026-01-10': award('FO', 'FLT') },
  },
  ledger: [
    grant('dol-1', 'ramp', 2, '2026-03-14', 'Exercise recovery', 'SQNCDR', 'OC Ops'),
    grant('dol-2', 'asics', 1, '2026-06-06', 'Night flying week', 'SQNCDR', 'SQNCDR'),
    grant('dol-3', 'miles', -1, '2026-05-20', 'Correction: double credit', 'SQNCDR'),
    grant('dol-4', 'reset', 2, '2027-01-09', 'Overseas exercise', 'SQNCDR', 'OC Ops'),
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

  /* The seed's approved / filed leave and the demo's taken OIL days, filed as
     the Inputs they are ([ARCH-STACK] step 4 — design §9: absences as Inputs,
     with `lw` where the demo shows war-approved leave). Raw pushes before
     LW_READY and before the undo baseline, so none is an undo step (FB-09). */
  if (!hadStoredWars) {
    const wars = getState().wars
    const seedRows = [
      ...SEED_ABSENCES.map(a => ({ ...a, to: a.endDate ?? a.date })),
      ...DEMO_OIL_TAKEN.map(([person, date]) => ({ person, code: 'OIL', date, to: date, lw: true })),
    ]
    for (const a of seedRows) {
      const person = DEMO_MAP[a.person] ?? a.person
      const war = warHolding(wars, a.date)
      const row = inputRowFor({ person, code: a.code, from: a.date, to: a.to, lw: a.lw && war ? war.period.id : undefined, mod: '2026-01-01' })
      if (INPUTS.some((x: any) => x.person === row.person && x.date === row.date && x.yr === row.yr && x.type === row.type)) continue
      inpId(row)
      INPUTS.push(row)
    }
  }

  /* The demo inputs are SEED, like the OIL story above them: a world that
     came back from storage (hadStoredWars) already holds whatever inputs
     survived — re-filing a demo row a scheduler deleted would resurrect it
     on every boot (storage seam, 8 Sep 26). */
  if (!hadStoredWars) {
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
}
