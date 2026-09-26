# Fable's second read of the finished code — `[LEAVE-LATE-PUBLISHED]` (26 Sep 26, morning, FULL tier, blind)

Brief: `docs/superpowers/briefs/2026-09-26-late-published-read2-brief.md`; the diff `9392e984..HEAD`, the code as of `be38feff`.
Saved from its final message (the substance verbatim); the dispositions are in the evidence sheet §9.

Read-only. No file edited, no probe created, no test run (the owner's gates were running). Every claim below is from reading
the live files against the rulings (D177–D179, D183–D185), the rule text in engine-rules.md §Publishing, and the evidence
sheet.

## Findings, ranked by consequence

**1. MEDIUM — the brief-lead freeze fires on standby lines that print no brief, so one Logic-page change can mark nearly
every published day pending.**
- Where: `src/engine/publish.ts` `faceRuleVals(d)` freezes `briefLead` when ANY formation on ANY wave has a blank B —
  standalone SC / AVALON / BB waves included. But on the schedule face a standalone line never prints a brief: `src/ui/html.ts`
  (line ~1659) draws SHIFT/START/END with no B for `sa` waves, and the board suppresses the suggested brief on SC ("we will
  hardly have a brief time", 24 Aug 26) — so a blank B on an SC line is the normal state, not the exception.
- Setup: a published day with an SC MAIN/SPARE (or AVALON/BB) wave whose B boxes are blank, every flying line with a typed
  brief. Action: admin changes the brief lead on the Logic page. Expected: nothing on that face moves, so nothing pending.
  Observed (by the code): `warnDelta` reads `rv` 140 vs 170 → "1 pending", the four sign-offs fall, and the pending list
  says "A blank brief — its suggested lead · 140 min → 170 min" on a day whose visible schedule prints no such brief.
  Multiply by every published day carrying a standby wave.
- The wrinkle: the CSV/print (`src/ui/export.ts schedRows`) DOES print a computed brief on standby lines with a blank B (a
  pre-existing quirk: shift start minus 140 min in the Brief column of a shift row), so on that document the number does
  move. The fix must be coherent across the two:
  1. `publish.ts faceRuleVals(d)`: skip standalone waves — `((d&&d.waves)||[]).filter(w=>!isStandalone(w)).some(...)`
     (import `isStandalone` from `./waves`; check for an import cycle — publish.ts may already import waves).
  2. `export.ts schedRows`: for a standalone wave (`isStandalone(w)`), print `parseHM(f.br)!=null ? f.br : ''` — no
     computed fallback — so the CSV/print match the on-screen face (this half is a small behaviour change to the CSV beyond
     this branch; flag it to the owner in one line, or take only step 1 and accept that the CSV's standby Brief column moves
     silently).
  3. Pin: in `latepub.test.tsx`, a day whose only blank B is on a `makeStandalone('sc')` line → change `VCONF.briefLead` →
     `dayDelta(di)` is `[]` and the CSV row for that line unchanged.
- The demo seed has no standalone waves, which is why no walk or test met this.

**2. LOW — the ALL AVAIL window from an issued face places a man by his LIVE seat while his puck shows the issued seat.**
- `src/ui/AvailWindow.tsx:75 isWso = PEOPLE[id].seat==='RCP'` decides the pilots-left/WSOs-right split from today's roster;
  the pucks in the same window come from `puck()` → `personShown` (issued). After a seat change post-publish, the man sits in
  the wrong column for the puck he wears (e.g. WSO column, FCP-coloured puck) until the AL goes out. Cosmetic, rare.
- Fix: read the seat through `personShown(id)` (from `../engine/faceattrs`) inside the same world replay the window already
  uses for its pucks; if the split at line ~218 runs outside that replay, move the split inside it.

**3. LOW (documents) — three stale statements that a later reader will trust:**
- `publish.ts freezeWarn` comment (lines ~547–551): "These still DRAW live — freezing them is keeping a copy of the rules per
  version … put to him" — since Astra #2 the face, CSV and print draw `pa`/`rv` frozen (`engine/faceattrs.ts`). Rewrite to say
  they draw as issued and are compared.
- `html.ts dayTraceHTML` comment (lines ~933–934) and the `||OFW` keep: "its marks are frozen with it (D179), so the breach
  one points at may have changed since". Under D183/D184 the trace and the breach it points at are both live from the same
  official pass, so `traceIx` resolves on a face and the "As published — that day has changed since" title is unreachable in
  practice. Reword the comment (keep the branch as a belt).
- Evidence sheet §3 row 37 ("Print / CSV — content only, unchanged") contradicts row 43 (CSV and print draw `pa`/`rv`). Mark
  row 37 superseded by row 43.

**4. Hardening (no defect found) — the class-tag invariant is pinned only for codes the fixture happens to raise.**
- `latepub.test` "every ring a live warning raises is filed live" checks CREW_REST, DAYS_RUN, QUAL, AAR_QUAL; SC_QUAL,
  AAR_INSTR and CREW_TIGHT's chip are not exercised. I read every site (below) — all correct today — but a future mark site of
  a live code that forgets its code would file frozen-class and make a published day read pending for a change the ruling
  made live, and this pin would not catch it unless the fixture raised that code. Suggest a source-level pin in the style of
  `inputsOn.test.ts`: read `validate.ts`, and for every statement containing `add('…','<code in LIVE_ON_FACE>'` assert each
  `markChip(`/`markRing(`/`markDash(` in the same statement (or the `wrong.forEach` line above it) carries that code as its
  last argument.

## Explicit negatives — checked and sound
- **Every mark site of a live code names it:** CREW_REST 513 (chip, ring, dash), CREW_TIGHT 545, SC_QUAL 819 and 1085, QUAL
  830–832 / 1000 / 1006 / 1010 / 1158–1160 / 1217–1219, DAYS_RUN 935, AAR_INSTR 1036–1037, AAR_QUAL 1041. No frozen-code site
  names a live code (TURN's TT at 603, PAX_CREW/CP at 1001, CREW_SOLO/ILLEGAL_CREW/CO_APPROVAL 990–992, OCU_NO_IP 1061, NO_IR
  1070/1074 all pass none). The six OIL warnings mark nothing and carry an empty `who`.
- **No other writer of `sev`/`chip`/`dash`/`trace`:** only the three mark functions and `markTrace` in `validate.ts` (the hit
  in `src/testing/refwin.ts` is the reference harness's own text). The crew-picker's pre-drop probe calls the crew-rest body
  with `phantom=true`, so it never marks.
- **Every reader of a published day's warnings goes through `faceWarn`:** `html.ts dayIssuedHTML` / `withChipWorld`
  (withDaySnap + withOfficialWarn), `state/view.ts` dayWarnAt and the trace read, `Modals.tsx` checks list, `avail.ts` under
  the window's replay. `pendlist.ts` reads `officialSliceNow` on purpose (the detector). Board, edit week, Insights and the
  crew picker read WORKING by design.
- **Face self-consistency:** rings/chips/dashes merge frozen-with-live by the day loop's own `SEVR`/`RANK` order; the list is
  severity-sorted (stable, frozen first); a warning tap resolves its index against the same FACE list (`view.ts:581`), and a
  trace row resolves by code + man against that list (`traceIx`), so a jump cannot land on the wrong warning.
- **Compare consistency:** `warnSliceKey` = non-live warnings + `fz` maps; the stored `w` is `warnSliceOf(OFFICIAL)` at issue
  (same body); `liveWarnKey`/`SLICES` caches are keyed on the OFFICIAL object, which is new on every validate; `trace` and
  `dash` from live codes are in neither side.
- **Live-not-pending, traced end to end:** crew-rest threshold, run limit, a DAAR/SC currency tick, a draft neighbour's late
  duty (OFFICIAL aliases WORKING when no content/filing diverges; the official pass judges the issued day against the draft
  neighbour when it does), a Leave War holiday (the OIL line alone).
- **Pending-still, traced:** CAT / seat / ground-crew / SANS / SXO / posted-out via `pa` (content men AND frozen-input men);
  the brief lead via `rv` (subject to finding 1); a rule that moves a frozen warning (long day, missed brief re-worded → one
  "changed" line); a rename reads nothing and re-words the frozen line with today's callsign.
- **F2 pairing:** same man, same type or both medical-group types, both with no filing state; a request ('g'/'u'/'r') never
  pairs; a waiting request ('' both sides) may pair, and the filing axis is silent for ''↔'' and ''↔absent, so no line is
  doubled; a leave never pairs with a downchit or an OD; two men never pair. A takeover on the day of the MO's own leave and
  on every tail day reads one line.
- **F1:** dates out of the details key; membership decided by `inputCoversDate` on both sides; the app's own "till …" note
  still moves the words, as the sheet says and the look card asks.
- **The load's sentence:** `inputsLeftSaid` runs after `afterSchedMutate` (a fresh validate; `passMemo` lives only inside
  `publishReadPass`), so it counts the post-load items; both doors covered.
- **Parity and the working bundle:** `parity.test` compares `byDay`, `sev`, `chip` fields, never the WARN object's key set;
  the whole maps are written exactly as before; `fz`/`lv` are extra keys nothing else reads.
- **Cross-week seeds, `withIssuedWeek`, `officialDiverges`:** untouched by the diff.
- **CSV/print:** `publishedDays` returns a copy with `faceIssued`; the stored snapshot is never touched; a man absent from `pa`
  falls back to the live roster.
- **Performance:** two small map writes per mark; `faceWarn` cached per (OFFICIAL, current versions); nothing recomputes per
  render.
- **D56 respected:** versions frozen before this morning (whose `w` still holds live-code marks) are not reported.

## Roll-call gaps worth a row (none is a defect beyond the above)
- The ALL AVAIL window's column split (finding 2).
- The edit week's and the board's 👁 preview of an issued version now draw frozen CAT/brief through `withDaySnap` — rows
  32/33 should say so.
- Row 37 vs row 43 (finding 3).
