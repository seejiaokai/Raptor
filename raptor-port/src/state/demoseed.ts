/* DEMO-ONLY SANS AVAILABILITY SEED (owner ask, 14 Aug 26) — a fresh clone of
   the deployed demo has nobody filing a SANS Availability record, so the
   SANS card grid (week + board), the palette's SANS badges and the
   "N SANS offering" pointer in Available crew all read empty. A real
   squadron fills these in from the Inputs page; the demo needs a few filed
   up front so a first-time visitor can actually SEE the grid, the badges
   and an unstruck SANS body without touching anything first.

   Seeded at BOOT (state/store.ts's initStore), NOT in engine/inputs.ts's
   INPUTS array. That array is what refwin.ts, parity.test.ts, html.test.ts,
   sansavail.test.ts, sanscards.test.tsx and palette.test.ts all read
   PRISTINE — none of them call initStore() — and it is also what every
   snapshot-reset test (`INPUTS.length=0; JSON.parse(ISNAP).forEach(...)`)
   restores between cases. Seeding here instead keeps every reference-parity
   gate and every one of those ~40 snapshot tests blind to these rows, while
   still reaching anyone who actually opens the built app.

   Each offer window is picked to COVER the person's own real seed
   commitment for that day at its PADDED width — the same window sansGate
   (avail.ts) judges a flying/OFT slot against (VCONF.step before, dekit
   after a sortie's to/ld; a sim's own s/e, unpadded) — so validate() never
   raises SANS_AVAIL against its own seed. demosans.test.ts pins that.
   `mod` stamps sit on or before the week's input deadline (inputDueISO() —
   Mon 29 Jun for the week of Mon 13 Jul) so none of these wears the
   late-input mark, the same idiom the seed INPUTS rows already use (see
   engine/inputs.ts's own comment on the `mod` spread).

   The two half-day records below carry EXPLICIT s/e alongside `half` —
   0/720 for AM, 721/1439 for PM, the exact minutes HALF_AM/HALF_PM
   (ui/inputedit.tsx) resolve to. That is what the real Inputs page's add()
   always writes (s/e come from the time fields regardless of preset; half
   only rides along as an annotation) — sansWindow reads `half` first either
   way, so this changes nothing the engine sees. It matters for a DIFFERENT
   reader: InputsPage's own Start/End columns print `hhmm(r.s)` with no half
   fallback, so a record carrying half with no s/e (the shorthand
   sansavail.test.ts's fileSans helper uses, engine-tests only) reads
   "NaN:NaN" there — found via inputs.test.tsx's sort-inversion test once
   this seed added its first two half-day rows. Writing the real shape the
   UI itself produces is the fix, not a test workaround. */
import { INPUTS } from '../engine/inputs'

const DEMO_SANS: any[] = [
  /* nick — flies Jul 13's night wave (RCP, to 19:45 / ld 21:10; padded
     18:45–21:40). The PM half (12:01–23:59) covers it. */
  { person: 'nick', date: 'Jul 13', allday: false, half: 'pm', s: 721, e: 1439,
    type: 'SANS Availability', sans: { f: true }, mod: '2026-06-20' },
  /* romeo — flies Jul 14 (FCP, to 14:40 / ld 16:05; padded 13:40–16:35).
     Offered the whole day, no need to thread a half. */
  { person: 'romeo', date: 'Jul 14', allday: true,
    type: 'SANS Availability', sans: { f: true }, mod: '2026-06-21' },
  /* vinci — flies Jul 15 (FCP) AND rides WSO on Jul 16's night wave: ONE
     two-day span record, all day, covers both padded windows at once. */
  { person: 'vinci', date: 'Jul 15', endDate: 'Jul 16', allday: true,
    type: 'SANS Availability', sans: { f: true }, mod: '2026-06-22' },
  /* waldo — rides Jul 15's OFT (EP-4) as pax, 09:00–10:30 — a sim window is
     read AS FILED, no step/dekit pad. AM (00:00–12:00) covers it. */
  { person: 'waldo', date: 'Jul 15', allday: false, half: 'am', s: 0, e: 720,
    type: 'SANS Availability', sans: { o: true }, mod: '2026-06-23' },
  /* krait — flies Jul 15 (RCP, to 10:35 / ld 12:00; padded 09:35–12:30) —
     straddles the AM/PM split (750 > 720), so neither half alone covers it.
     All day it is. */
  { person: 'krait', date: 'Jul 15', allday: true,
    type: 'SANS Availability', sans: { f: true }, mod: '2026-06-24' },
  /* bullet — no commitment anywhere in the seed week, so sansGate never has
     a fly/OFT/AMT slot to judge him against (day.fly/day.events carry no
     entry for him) — zero SANS_AVAIL risk whatever this offers. Ticking all
     three shows the full-letters "F/O/A" card the grid can draw. */
  { person: 'bullet', date: 'Jul 14', allday: true,
    type: 'SANS Availability', sans: { f: true, o: true, a: true }, mod: '2026-06-25' },
]

/* IDEMPOTENT — stores-boot.test.ts calls initStore() twice against the SAME
   INPUTS array with no snapshot reset in between (only its localStorage
   stub is reset), so a naive push would double-file every record on the
   second call. Guarded per person+date pair, which is exactly the identity
   sansAvailOn itself keys on. */
export function seedDemoSans() {
  DEMO_SANS.forEach(rec => {
    const already = INPUTS.some((x: any) =>
      x.type === 'SANS Availability' && x.person === rec.person && x.date === rec.date)
    if (already) return
    INPUTS.push({ ...rec })
  })
}
