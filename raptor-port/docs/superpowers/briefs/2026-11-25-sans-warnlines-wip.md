# The warning-list piece (D2579 / D2584 Q3, 2a, 3b; D2583's Legend line) — work in progress, chat 185, 25 Nov 26

Built red-first on `claude/sans-warnlines-185`: `src/engine/sans-warn-lines.test.ts` (14 tests, red 12 of 14 before the change, green after). The full unit suite then failed 36 tests in 19 files (`D:/raptor-work/c185-unit.log`), listed below. Most are the original's test data: its SANS flyers (romeo, vinci, krait, waldo) carry no SANS filing in the pristine INPUTS the tests read, so the new amber line for nothing filed now raises for them (parity: 43 warnings against 32). Each needs a decision, not a blind update: the parity layer (`src/testing/refwin.ts`) treating SANS_AVAIL's 'none' as port-only, or the tests giving those men a filing; and `src/state/demosans.test.ts` shows the demo's own boot filings (`src/state/demoseed.ts`) leave five lines — the demo seed must cover them or the test follows his rule. `node reference/tfin.js` not yet run on this change. The older tests that pinned 'none' as silent (`sansavail.test.ts`, `sans-notimes-offer.test.ts`'s "left silent: nothing filed") follow D2579 now.

## The 36 failing tests

- src/engine/official-flags.test.ts > CRPF-012 — the "goes away" row survives when the working list empties > a hidden fix that clears the ONLY warning still shows a "to clear once signed" box
- src/engine/parity.test.ts > engine parity with the reference > validate produces identical WARN {all, byDay, sev, chip}
- src/engine/restblank.test.ts > THE SAME-DAY TIGHT TURN > LEFT AS IT WAS: one real leg and one timeless leg still wear the double-turn chip
- src/engine/restblank.test.ts > TODAY — a blank crewed line does not hide the breach his other line raises > the amber tight-turning note survives a blank crewed line too
- src/engine/rulesfirst-5-seats-quals.test.ts > W58 — the CAT ladder and crew pairing: the matrix (ILLEGAL_CREW, CREW_SOLO, CO_APPROVAL), OCU_NO_IP, NO_IR, the illegal seat; the Qualification flag live on a published face, the pairing frozen (5 Aug, 7 Sep 26; D185, D188) > the matrix as the table says, an instructor in either seat clears it, a pilot riding the back is no pairing, ALL AVAIL behind is never named
- src/engine/sans-notimes-offer.test.ts > D2585 — the warning list agrees once he is planned on an untimed sim > AMT with no times, "Fly only", in the front seat: one amber line, "not offering AMT"
- src/engine/sans-notimes-offer.test.ts > D2585 — the warning list agrees once he is planned on an untimed sim > OFT with no times, "Fly only", in the front seat: one amber line, "not offering OFT"
- src/engine/sans-notimes-offer.test.ts > D2585 — the warning list agrees once he is planned on an untimed sim > left silent: nothing filed (D2579 not built), and OFT offered with hours while untimed
- src/engine/sans-notimes-strike.test.ts > D2573 — a seat on a flight with no times yet > the warning list is unchanged — no new line for nothing filed (that is D2579, drawn first)
- src/engine/sansavail.test.ts > reference-parity guards > the seed week raises no SANS_AVAIL — nothing fires on the reference
- src/engine/sansavail.test.ts > validate() — the SANS_AVAIL advisory > a SANS pilot planted into an OFT seat, offering only Fly: "not offering OFT"
- src/engine/sansavail.test.ts > validate() — the SANS_AVAIL advisory > no record filed at all, planted anyway — no SANS_AVAIL (deliberate scoping)
- src/engine/sansavail.test.ts > validate() — the SANS_AVAIL advisory > offering only O/A raises exactly one advisory: adv, A chip, "not offering Fly"
- src/engine/turnring.test.ts > an overnight tight turn > chips TT and leaves the puck unringed
- src/engine/validate.test.ts > validation engine (tfin F) > every warning has a known code
- src/engine/warnwords.test.ts > the seed week, every line (the parity test's positive half) > reads as approved
- src/engine/weekctx.test.ts > Plan E — the same shape, a lighter gap: tight-turning advisory, not a hard breach > a Sunday duty till 15:20 clears the hard line but sits inside the nominal window
- src/state/demomed.test.ts > the demo medical seed > the warning list neither grows nor gains a word for the seeded people
- src/state/demosans.test.ts > seedDemoSans, wired through initStore() > validate() after boot raises zero SANS_AVAIL, and no warning set grows for these six people
- src/state/warnhide-published.test.ts > WH9 — what the published face shows (D471, D475) > a hide alone draws no "new once signed" or "goes away once signed" row (Astra 3)
- src/ui/crewrest-ui.test.ts > the cross-day row on the warning list > a day where he has nothing of his own wears the solo list box
- src/ui/html.test.ts > view-week markup parity with the reference > every day of the read-only week is byte-identical (minus the input blocks)
- src/ui/html.test.ts > view-week markup parity with the reference > the edit-mode markup is byte-identical too (minus the sign-off strip)
- src/ui/html.test.ts > view-week markup parity with the reference > the legend carries the reference item set, order aside
- src/ui/sans-notimes-surfaces.test.tsx > D2573 — every place that reads the strike, on a flying seat with no times > the note after a drop names his reason
- src/ui/sans-notimes-surfaces.test.tsx > D2573 — every place that reads the strike, on a flying seat with no times > the note after a tap-to-plan names his reason
- src/ui/warnhide-readers.test.tsx > the two lists agree with the readers above > with his warning hidden the day list counts one fewer and names no "hidden" in its bar
- src/ui/warnmute-week.test.ts > Edit Schedule's list > WH4, WH5 (D469 / D472): the hidden line stays in its place, struck out, with the Reset arrow — and the count drops to 3 and says nothing of it
- src/ui/warnmute-week.test.ts > Edit Schedule's list > WH6 (D475) — every issue of a day hidden: a quiet "✓ No issues" bar that still opens the list, the struck line under it
- src/ui/warnmute-week.test.ts > Edit Schedule's list > nothing hidden: a ✕ on every line, no struck line, no "hidden" word anywhere
- src/ui/warnmute-week.test.ts > Edit Schedule's list > the bar's colour and the "N warning" follow what is shown: hide the two red ones and the bar turns amber
- src/ui/warnmute-week.test.ts > WH7 — View-only Sched (D475): the same struck line, no button > draws no ✕ and no Reset arrow, counts 3, and strikes the hidden line
- src/ui/warnmute-week.test.ts > the board's panel — one set of hides, both surfaces (29 Aug 26) > a hide made on the week shows on the board: 3 issues, the line struck in place with the Reset arrow
- src/ui/warnmute-week.test.ts > the board's panel — one set of hides, both surfaces (29 Aug 26) > every issue hidden: the heading reads "No conflicts flagged", the struck line still under it
- src/ui/warnmute-week.test.ts > the day-info popup (ⓘ) > counts what is shown and strikes the hidden line
- src/ui/warnmute-week.test.ts > the day-info popup (ⓘ) > every issue hidden: "Nothing flagged", and the struck line listed

## Decided, chat 186 (25 Nov 26) — each test, never updated blindly

- **Its subject is SANS availability — it follows his rule now:** `sansavail.test.ts` (O/A only reads "offered OFT and AMT only"; nothing filed raises one amber line with the "A"; an OFT seat offering Fly only reads "offered Fly only"; the seed week, nothing filed, raises one line per planned SANS man — 11 — and none once covered), `sans-notimes-offer.test.ts` ("offered Fly only" on an untimed OFT / AMT; nothing filed on an untimed sim raises the line), `sans-notimes-strike.test.ts` (a flight with no times: one amber line), `sans-notimes-surfaces.test.tsx` (the note after a drop or tap-to-plan now repeats the new warning line — the plant-then-warn rule, `state/dropflag.ts`; the drop test failed only because the tap test stopped before its clean-up), `warnwords.test.ts` (the seed week's eleven new lines added to the approved list), `demosans.test.ts` (no line for the six men the demo files for; the four it files nothing for — Cards, Wrangler, Yeti, Badger — keep theirs: the demo shows the line).
- **Its subject is the original's parity — the original has no SANS check:** `parity.test.ts` and `html.test.ts` file cover for every SANS man AFTER the original is built (`testing/sanscover.ts`), so it never sees them; the Legend comparison excises the amber "A" line's words from both sides (his D2583's words, pinned by the severity-order test); `validate.test.ts`'s "known code" list names SANS_AVAIL beside the other port codes.
- **Its subject is something else, a SANS man incidental:** `restblank`, `turnring`, `weekctx` (waldo, idle in the seed but SANS: the "A" outranks his TT / DT chip), `rulesfirst-5-seats-quals` W58, `official-flags` CRPF-012, `crewrest-ui`, `warnhide-published`, `warnhide-readers`, `warnmute-week` (Tuesday's counts) — each calls `coverSans()` after its reset; `demomed.test.ts` covers before its "before" count, as the SANS seed's lines are not the medical seed's doing.
- `node reference/tfin.js`: 728 passed, 0 failed.
