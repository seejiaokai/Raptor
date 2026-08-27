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
   (avail.ts) judges a flying/OFT slot against (the crew's published
   IN-TIME when one shows earlier, else VCONF.step, before the sortie's to;
   dekit after ld — owner, 26 Aug 26; a sim's own s/e, unpadded) — so
   validate() never raises SANS_AVAIL against its own seed. The one
   windowed fly record below (nick) stays clean under the in-time anchor
   because his wave's published 19:00 in-time is LATER than his 18:45 step
   and the min() guard keeps the step. demosans.test.ts pins that.
   `mod` stamps sit on or before these rows' own week's input deadline
   (inputOwnDueISO — Mon 29 Jun for their week of Mon 13 Jul) so none of
   these wears the late-input mark, the same idiom the seed INPUTS rows
   already use (see engine/inputs.ts's own comment on the `mod` spread).

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
import { PEOPLE } from '../engine/people'

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

/* ---- DEMO-ONLY MEDICAL LIFECYCLE SEED (owner, 27 Aug 26) ------------------
   A fresh clone shows the Medical view's three sections POPULATED: sufa and
   divot are already down (the week-1 seed rows), nasty's downchit ended on
   9 Jul unanswered — Pending Upchit — and vinci went down in June and
   upchitted on 29 Jun — Upchit Complete, inside the trailing 30 days of the
   notional 13 Jul today. Same boot-only home and idempotence guard as the
   SANS seed above, and the same blindness guarantee: parity and the
   snapshot tests never boot.

   The two added spans sit OUTSIDE the loaded Jul 13–19 week on purpose —
   inputCoversDate matches nothing there, so the week's warning list, the
   palette and the board stay byte-identical (demomed.test.ts pins it).

   Each medical row also gets a PLACEHOLDER supporting document — a small
   SVG the viewer can actually show — because the demo's point is seeing the
   flow work. Session-only like every document (state/docs); a page RELOAD
   forgets docs and INPUTS in lockstep and this seed re-runs, so no dangling
   docId survives. (An earlier note here claimed loadWeek drops these ids —
   it never touches INPUTS content, only the `acc` flags; corrected 27 Aug.) */
const DEMO_MED: any[] = [
  { person: 'nasty', date: 'Jul 6', endDate: 'Jul 9', allday: true,
    type: 'OML', remarks: 'Medically down till 9 Jul', mod: '2026-07-05' },
  /* Jun 15–20, NOT the Jun 29 week — loadweek.test.ts pins that the blank
     29 Jun chip shows no input, and Jun 20 still sits inside the trailing
     30 days of the notional 13 Jul today */
  { person: 'vinci', date: 'Jun 15', endDate: 'Jun 19', allday: true,
    type: 'ATT B', remarks: 'Grounded — may still work, till 19 Jun', mod: '2026-06-14' },
  { person: 'vinci', date: 'Jun 20', allday: true,
    type: 'Upchit', remarks: 'Medically up 20 Jun', mod: '2026-06-20' },
]
const demoDoc = (title: string, sub: string) => new Blob([
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">` +
  `<rect width="640" height="420" fill="#f6f7f9"/><rect x="24" y="24" width="592" height="372" rx="12" fill="#fff" stroke="#c9d1da"/>` +
  `<text x="48" y="86" font-family="Georgia,serif" font-size="26" fill="#1c232b">${title}</text>` +
  `<text x="48" y="122" font-family="Georgia,serif" font-size="15" fill="#5c6873">${sub}</text>` +
  `<line x1="48" y1="150" x2="592" y2="150" stroke="#e2e7ec"/>` +
  `<text x="48" y="190" font-family="Georgia,serif" font-size="14" fill="#8a96a3">Attending medical officer&#8217;s certification</text>` +
  `<text x="48" y="360" font-family="Georgia,serif" font-size="14" fill="#8a96a3">Signed &#183; Medical Centre</text></svg>`
], { type: 'image/svg+xml' })

export function seedDemoMedical(docAdd: (f: any) => { id: string }) {
  DEMO_MED.forEach(rec => {
    const already = INPUTS.some((x: any) =>
      x.type === rec.type && x.person === rec.person && x.date === rec.date)
    if (already) return
    INPUTS.push({ ...rec })
  })
  /* paperwork onto every doc-needing medical seed row still bare — the
     week-1 sufa/divot rows included. Blob-guarded: a bare node context
     without Blob simply seeds no documents, and the viewer's no-document
     state carries it. */
  if (typeof Blob === 'undefined') return
  INPUTS.forEach((r: any) => {
    if (r.docId) return
    /* the certificate speaks the app's voice — the CALLSIGN, never the
       roster id (the plain-language rule reaches the demo paperwork too) */
    const cs = (PEOPLE[r.person] && PEOPLE[r.person].cs) || r.person
    if (r.type === 'Upchit') { r.docId = docAdd(demoDoc('Upchit certificate', `${cs} — fit to fly`)).id; return }
    if (['ATT C', 'ATT B', 'OML', 'HL'].indexOf(r.type) >= 0)
      r.docId = docAdd(demoDoc('Medical certificate', `${cs} — ${r.type}`)).id
  })
}
