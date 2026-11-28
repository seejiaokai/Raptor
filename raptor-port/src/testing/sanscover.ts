/* COVER THE SEED'S SANS MEN — a test fixture (chat 186, 25 Nov 26).

   Until owner D2579 / D2584 Q3 (25 Nov 26) a SANS man planned in a flying seat or a sim with NOTHING filed raised no
   warning — and the seed week plans eleven such lines (nick, romeo, cards, krait, wrangler, yeti, vinci, badger, waldo;
   engine/people.ts SANS_IDS), none with a SANS Availability record in the pristine INPUTS (the demo's six records are
   filed only at boot, state/demoseed.ts). So every test that reads the pristine week, or plants an idle SANS man such as
   waldo, silently counted on "nothing filed is silent". Since D2579 each of those lines raises the amber "SANS: no
   availability filed for today. Planned on …", and its "A" chip outranks a TT or DT (validate.ts RANK).

   A test whose SUBJECT is not SANS availability calls this to make its premise explicit: every SANS man has filed Fly,
   OFT and AMT all day on every loaded day, so the SANS check stays quiet and the test reads the world it was written
   for. A test about SANS availability never calls it; the new line on the pristine week is pinned positively in
   engine/sansavail.test.ts ("the seed week, nothing filed: one line a planned SANS man"). Call it AFTER any snapshot
   reset of INPUTS, since a reset drops what it files. The reference app never sees these rows: refwin.ts copies the
   inputs into the reference when its window is built, and every caller builds it first. */
import { INPUTS, inpId, sansAvailOn } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SANS_IDS } from '../engine/people'

export function coverSans(ids: string[] = SANS_IDS, dts: string[] = DAYS.map((d: any) => d.dt)) {
  for (const person of ids) for (const date of dts) {
    if (sansAvailOn(person, date)) continue
    const r: any = { person, date, allday: true, type: 'SANS Availability', sans: { f: true, o: true, a: true }, mod: '2026-06-20' }
    inpId(r)
    INPUTS.push(r)
  }
}
