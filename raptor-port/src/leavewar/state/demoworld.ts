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
import { seedPeople } from '../engine'
import { projectPeople } from './raptorRoster'
import { getState, remapPersonKeys, setPeople } from './store'

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

  /* Fresh browsers only: stored wars are real data, never re-keyed. */
  if (!hadStoredWars) remapPersonKeys(DEMO_MAP)

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
