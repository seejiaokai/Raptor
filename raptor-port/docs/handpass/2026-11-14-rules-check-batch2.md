# The rules check's small batch — the bug check (chat 80, 15 Nov 26)

`[RULES-CHECK-FIXES]`'s small batch, branch `claude/rules-check-batch2`, draft pull request 779. The plan:
`docs/superpowers/plans/2026-11-14-rules-check-batch2-plan.md`. What reaches a person:
1. **D2009** — the check names "On leave + flying" / "Downchit + flying" become "On leave + planned" / "Downchit + planned"
   (`engine/validate.ts` `WCODE`, built `8c3afe200`).
2. **D2010** — the crew-rest line where the last flight had no landing typed (blank, or "TBD" since D1990) reads "Mon took
   off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00", never "landed" (built
   `8c3afe200`).
3. **D2015** — the Logic page's note under the changed-settings strip: "A published day keeps the settings it was published
   under, and the OIL they gave it, until it is published again. If a changed OIL setting would change that OIL, the day
   reads pending." (two cold reads; his to change) — as first built; corrected after the reads (§12, F1 and F4): the
   sentences now say only what is true of what is changed, and name Default rally, Debrief after landing and Full day of OIL.
4. **D2014 / D2044** — records only: nothing of OIL built; comments in `oil.ts`, `oilev.ts`, `faceattrs.ts`, `publish.ts`.
5. **D2024** — the project guide's "no rule versioning" corrected (a working-guide change; read by Astra and a fresh Opus
   reader on 15 Nov 26, part 5's log).
6. **The reads' fixes (15 Nov 26, chat 81):** the debrief advisory, the ALL AVAIL reason and the tight turn say "take-off …,
   no landing typed" where no landing is typed (D2010's reading); a neighbour published day whose only waiting change is
   its OIL is read by today's settings (D2013); three comments corrected (§12).

**Walk:** FULL — the host (8 PASS), W1 and W2 on `cc2eefa50` (no fault of this change; one older fault filed), W3's re-walk
of the fixes on `f01e1e416` (109 PASS, no fault); 212 + the earlier walks' pictures; the deciding ones opened by the host.

Pictures: `docs/img/handpass/2026-11-14-rules-check-batch2/`. Walk scripts: `scripts/handpass/rcb2/`.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money | NO — nothing that works out OIL changed: part 4 is comments only (`oil.ts`, `oilev.ts`, `faceattrs.ts`, `publish.ts`); the note is words. The OIL Saturday across a "Full day of OIL" change is still walked (his look card owes its pictures, D853) |
| 2 | The published record | YES, read and walked rather than answered NO: a published day draws its frozen warnings by their code and message (`publish.ts` `warnSliceKey`), with the check's NAME read live from `WCODE` — so a published day shows the new name and nothing compared moves (the name is not stored); the crew-rest line is live on the face (`validate.ts` `LIVE_ON_FACE`: CREW_REST, CREW_TIGHT — D183, D184), never stored or compared. Expected: no published day reads pending from this batch — walked |
| 3 | Saved data | NO — nothing stored changes shape or value; the name is not stored, the crew-rest message is not frozen |
| 4 | A shared drawer | YES — one label (`WCODE`) read by four builders (the warning list, the board, Insights, the Logic page); one message built once, shown wherever the CREW_REST warning shows |
| 5 | A new gesture or mode | NO — no control added |
| 6 | A new surface | NO — nothing new on screen |
| 7 | Roles | NO — who may see or do anything is unchanged (the note's "Only an admin can change them." untouched) |
| 8 | The warning list | YES — what two checks are called, and what the crew-rest warning says |

**Tier: FULL** (YES to 2 and 8). One check for the batch, sized by its riskiest part (D485).

## 2. The rulings swept (each checked on the running build)

D2009, D2010, D2015, D2014 (answered by D2044), D2044, D2024; and what they touch: D1990 (a "TBD" landing is a blank one for
crew rest), D1786 (a day with nothing entered starts at take-off less the default rally), D592 (4) (a published day keeps the
OIL it went out with; a change reads pending), D186 (the printed B), D2005 / D2013 (a published day is checked by the settings
it was published under; once anything waits, by today's), D183 / D184 (the crew-rest marks live on a published day), D103
(the four sign-offs fall on a pending change), D928 (the strip's old untrue words), D56, D785.

**The host's reading of D2009, stated in the sheet as the plan asked:** the label is read in four places, not only the Logic
page. D2009's rule is "one name, true on every row", so the warning list's heading, the board's list and Insights' count
print the new name too — the same fix; the day's own message ("On leave but tasked — BRIEFING") stays, as its reading says.

| Ruling | What the running build must do | Pass / fail — seen in |
|---|---|---|
| D2009 | "On leave + planned" / "Downchit + planned" on every surface that names the check | |
| D2010 | the crew-rest line says "took off … with no landing typed" for a blank and a "TBD" landing; "landed" where a landing is typed | |
| D1990 | a "TBD" landing ends the day as a blank one does | |
| D2015 | the note's words as built, on the Logic page, admin and member | |
| D2044 / D592 (4) | a published earning weekend: "Full day of OIL" changed → "1 pending", sign-offs gone, the OIL credited unchanged until republished | |
| D2005 / D2013 | a published day nothing waits on keeps its own flags; the batch makes no published day pending | |
| D183 / D184 | the crew-rest line on a published day is today's, with the new words | |
| D186 | the printed B unchanged | |

## 3. The roll-call

**(a) The check's name — `WCODE.LEAVE_FLY` / `WCODE.DNIF_FLY` (`wlbl(WCODE[code])`).** Old words searched one by one, uncapped
(`+ flying`, `flying'`): app code — only `validate.ts`; tests — `official-flags.test.ts` (an assertion's own message, not
the label — left); the IT flow guide's captions — `scripts/itflow/content.mjs`, MISSING, corrected here, the deck's pictures
filed under `[ITFLOW-OIL-RESHOOT]` (D403).

| Surface | SHOWS the new name | USABLE (the warning's tap: lights the crew) | PAINTED beside it | Seen in |
|---|---|---|---|---|
| Edit Schedule's warning list (`html.ts` ~1201) | | | | |
| the warning list's hidden (struck) line (`html.ts` ~1221) | | | | |
| View-only Sched / the published face's list (`html.ts` ~2606, with its severity word) | | | | |
| the Scheduler Board's list (`board.ts` ~515 — `w.msg` first, so the name only where no message) | | | | |
| Insights' count by type (`insights-html.ts` ~56) | | | | |
| the Logic page's check line (`logic-html.ts` `lgChkName`) | | | | |
| a member's View-only Sched | | | | |
| phone width (402) of each | | | | |
| the IT flow guide's captions | MISSING → corrected in its source; pictures wait (D403) | — | — | `content.mjs` |

**(b) The crew-rest line — `validate.ts` ~659, the one message for CREW_REST (and its "Crew rest breach — …" form).**
Shown wherever that warning is shown; the previous day can be inside the week, the week before (`weekctx.ts`, a published
or working week), or the phantom pass over next week's Monday.

| Where the line shows / how the previous day is reached | SHOWS "took off … with no landing typed" (blank) | the same ("TBD") | "landed" kept where a landing is typed | PAINTED beside it | Seen in |
|---|---|---|---|---|---|
| Edit Schedule's warning list, previous day in the same week | | | | | |
| the same, previous day in the week before (Monday's line) | | | | | |
| the next-week peek / phantom Monday (the crew-rest pass over next Monday) | | | | | |
| the dotted "breaks tomorrow's crew rest" mark's title / ⓘ on the previous day | | | | | |
| the Scheduler Board's list | | | | | |
| View-only Sched (a published day — live on the face, D183/D184) | | | | | |
| the "Crew rest breach — … but" form (`crMsg`) | | | | | |
| a flying SC line or a duty input as the previous commitment ("ended", no "landed" — untouched) | | | | | |
| phone width (402) | | | | | |

**(c) The Logic page's note (`LogicPage.tsx` `#lgOff`).**

| Surface | SHOWS the new words | USABLE (Reset to standard still clears it) | PAINTED beside it | Seen in |
|---|---|---|---|---|
| Logic page, admin, one setting changed ("setting … it") | | | | |
| the same, two settings changed ("settings … them") | | | | |
| Logic page, member ("Only an admin can change them.") | | | | |
| phone width (402) | | | | |

**(d) Part 4 — nothing built; the as-built OIL Saturday walked for his look card (D2044, D853).**

| Surface | What it must show after "Full day of OIL" is changed | Seen in |
|---|---|---|
| the published earning weekend's day — the pending count ("1 pending") | | |
| the four sign-offs | | |
| the pending list's line | | |
| OIL Earn on the working copy | | |
| the Leave War's credit for the man | | |
| after republishing | | |

## 4. The five sizing lines (§7.0)

1. **Type:** A (one message built once — the crew-rest line, `validate.ts`), D (one label read by four builders — the
   warning list, the board, Insights, the Logic page — each by its own code), F (the Logic page's note, words only). Not G:
   nothing of the publish path changed (part 4 is comments), but the as-built OIL Saturday is walked for his look card.
2. **What only a walk could find here:** whether each of the four builders actually prints the new name on screen (the
   board prints the warning's own message first, so whether the name shows there at all), in a published day's face and a
   member's view, at a phone's width (a longer word: "planned" is one letter longer than "flying" — a cut or a wrap in a
   narrow list); whether the crew-rest line's new words reach the previous week's Monday and the next-week peek, which are
   built through other routes into the same pass (`weekctx.ts`); whether a published day reads pending from this batch;
   the note's two lengths (one setting / several) on a phone. The tests already carry the words themselves (blank, "TBD",
   typed) in the calculation (`rulescheck-batch2.test.ts`, `logic.test.tsx`) — calling the calculation, not the screen.
3. **What the ledger says:** walks of type A and D on the scheduler's warning words (the rules check's fixes, 12 Nov 26:
   654 pictures, 17 surfaces, 3 MISSING fixed; the published day's settings, 409 pictures, 2 MISSING fixed, 2 filed) found
   their faults on the surfaces drawn by their own builders — a heading reading today's limit, a title — not in the shared
   calculation; one Sonnet walker per world was enough for a change of this size.
4. **The walk chosen (chat 80's sizing; resized in chat 81 on evidence, §7.0 — two walkers, W1 and W2, splitting Astra's
   scenarios and the plain-user round between them for time, then W3 re-walking what the reads' fixes touched on the
   build `f01e1e416`; as first sized:)** ONE Sonnet 5.5 walker on the frozen
   build of app commit `cc2eefa50` (served from its own folder, never rebuilt under it), desktop 1536 Chromium and iPhone
   402 × 874 WebKit by touch; Astra's 14 scenarios in his order (1–5 and 7–10 at both sizes; 6, 11, 12, 14 desktop with one
   phone look each at the deciding screen) and the plain-user round at both sizes; a picture after each step and within
   ~100ms of each phone tap. Sizes beyond the required: none — the note and the longer names are judged at 402 (the
   narrowest he uses). Carried by a test, not walked again: the words for each landing kind in the calculation
   (`rulescheck-batch2.test.ts` — it calls the validator directly, so the screens are walked); the note's two grammars
   (`logic.test.tsx` — renders the page; both sizes walked once). Every lesson of the checklist's list gone through in the
   walker's brief (chat B), each with its scenario or why it cannot apply.
5. **After the walk:** its row in `docs/walk-ledger.md` (15 Nov 26) — the host's 8 steps, W1, W2 (178 PASS), W3 (109 PASS);
   no fault in the change; the reads found what the walk could not (F1, F2, F4, Astra's (1)); one older fault filed
   (`[ALLAVAIL-ESCAPE]`) and two leads (`[WEEK-AA-CHIP-PHONE]`, `[INSET-DAYS-ENTER-ONLY]`).

## 5. The scenarios (designed by Astra)

Astra's report, whole: `docs/superpowers/briefs/2026-11-15-rules-check-batch2-scenarios.md` — 14 ranked scenarios, the
plain-user round (8 steps, each opened window closed every way it offers), explicit negatives, no new question for him.
**His roll-call gaps, added to §3 as rows (a)–(d) below, each to be walked:**
- **(a) the name:** the day-details window from the day's `?` (`html.ts` ~2544/2606, `Modals.tsx`) — its own row; the
  sheet's "~2606" row is that window, not the ordinary View-only list; the ~1221 row is the struck "goes away once signed"
  line, NOT the hidden line (a hidden warning is the ordinary row, subdued) — both walked; the current and older published
  version's eye (👁), week and board; the Logic page's search ("planned") and its fired / severity filters.
- **(b) the crew-rest line:** the amber "Tight turning" (`validate.ts` ~720/733 — the same tail; a red breach does not
  exercise it); the ALL / ALL AVAIL window's per-person reason and its title (`html.ts` ~891, `AvailWindow.tsx`); the
  previous day's full "Breaks Tuesday" explanation apart from the puck's short title (`html.ts` ~1048/1118 vs ~476 —
  the title need not repeat the sentence, only never say "landed" for a borrowed take-off); the peek row split in three —
  Sunday's forward explanation, the desktop next-week preview (plain tasking by design, D1010), loaded Monday's warning.
- **(c)** the pending list's lines and the hide / restore notes use the warning's own message — read, no heading required.
- **(d) OIL outside the board:** the published puck's OIL mark and title, the current version's eye, the Leave War's
  credited entry and the OIL balance — all must agree on what was credited.
**His corrections to the expectations, taken:** the board prints the warning's own message first, so "On leave but tasked —
BRIEFING" there is right, no heading added (D2009's reading); the next-week preview, a picker's short reason and the
puck's short title need not carry the full sentence — only agree with it.
**One wording question for his look (Astra's §5):** a change of the default rally or the debrief that moves a man's worked
times but leaves his OIL the same (FO → FO) still reads pending (D592 reading (8)) — does the note's "If a changed OIL
setting would change that OIL" explain that? The walk's picture of that case (scenario 12 B) goes on his look card.

## 6. The orders walked — what the screen said

All on frozen builds served from their own folder (the walk driver `scripts/handpass/rcb2/rcb2-lib.mjs`), desktop 1536
Chromium and iPhone 402 × 874 WebKit by touch, each walker in its own world; every report kept whole in `parts/`.
- **The host's short walk** (`rcb2-host.mjs`, app `cc2eefa50`): 8 PASS — the new crew-rest words on the board's list
  ("Friday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00 …"), the new
  names on Insights and the Logic page. Pictures `img/…/host/run/`.
- **W1** (`parts/2026-11-15-rcb2-w1.md`; Astra's 9, 10, 1, 5, 13, 14 and plain-user 1, 2, 3, 6): no FAIL in its final runs
  (earlier FAILs were its own script faults, re-run). The two names read "On leave + planned" / "Downchit + planned" on
  the board, the week's strip, day details, View-only, Insights and Logic, old names nowhere; the crew-rest line on
  View-only and day details, Ranger seeing the same; the Logic note word for word, "1 setting" / "2 settings", "Only an
  admin can change them." for Ranger, nothing cut at 402 or 1536; Reset with the box still focused clears it; every window
  (day details, Insights) closed by each of its ways, both sizes. Three RECORDED — see §12.
- **W2** (`parts/2026-11-15-rcb2-w2.md`; Astra's 7, 3, 4, 8, 2, 6, 12 and plain-user 4, 5, 7, 8): 178 PASS, 72 RECORDED,
  one fault in six rows (§12). Blank, typed 12:30 and "TBD" read right on the week, board, day details and the day before's
  explanation, after leaving the day and after a reload; scenario 6 as built (HO at 6h01; 5h → "1 pending", sign-offs gone,
  the Leave War still HO; put back → pending clears; republished → FO once); scenario 12 B (Default rally 3h → 2h50 keeps
  FO, the day reads "1 pending", its list "Default rally before T/O 3h → 2h50" and "Ranger OIL as published, under today's
  values: full day 05:00–18:00 → full day 05:10–18:00"). "TBD" cannot be typed into a landing box (the box refuses it), so
  it was planted in the data to walk it.
- **W3, the re-walk of the fixes** (`parts/2026-11-15-rcb2-w3.md`, app `f01e1e416`, bundle `index-DDDelbBP.js`): 109 PASS, 15 RECORDED, 1 NOT WALKED, no fault of the
  app (its one FAIL row is its own set-up's, re-read as NOT WALKED). R1: the debrief and tight-turn words with no landing
  typed — "(take-off + 2h, no landing typed)", "60 min take-off→next T/O, no landing typed (needs 120 min …)" — and with a
  typed 12:30 "(land + 2h)", "30 min land→next T/O", on the board's list and day details, both sizes. R2: Ranger's reason in
  the ALL AVAIL window carries the same words (board and week at 1536, board at 402); the page behind the open window still
  works (lesson 4). R3: the Logic note — Crew rest alone gives the "keeps the settings" sentences only, the late cut-off
  alone only "A changed late cut-off moves the LATE marks at once, on published days too.", both gives both, Ranger gets
  "Only an admin can change them." last; Reset hides the strip and a change shows it again; whole at 402 (right edge 390 of
  402) and 1536. R4: a published Monday next week, a public holiday (made in the Leave War), Ranger flying Sunday 18:00–19:00
  before its B 09:40 — at Debrief 2h no mark; at 3h Sunday reads "Breaks Monday … +3h debrief assumed → ended 22:00 → crew
  rest clear at 10:00", Monday "1 pending" with the breach on its working copy, "new once signed", View-only's Monday its
  published face; back at 2h both go. R5 (Astra's 11): crew rest 13h leaves a published Tuesday at its 12h; a waiting change
  on Tuesday shows its working copy by 13h (red, "clear at 04:00"), View-only keeping 12h; Default briefing 2h20 → 3h20 makes
  the published Monday read "1 pending" (D186). R6 (Astra's 4): an unissued Sunday landing 12:30 — Edit's Monday reads
  "landed 12:30 … clear at 02:30", View-only's still the issued "took off 12:00 with no landing typed … clear at 02:00". R7:
  day details closes by Done, ✕, Escape and a tap outside; the late cut-off's window by ✕ and Escape, a tap outside leaving
  it open; the ALL AVAIL window by ✕ and leaving the page, Escape leaving it open (`[ALLAVAIL-ESCAPE]`, filed). The host
  opened the deciding pictures: the note with both sentences at 402 (`w3/r3-p6/r3-4-both-p.png`), the three new words on
  the phone board's list (`w3/r1-p1/r1-b-turn-blank-board-p.png`) and the phone week's crew list
  (`w3/r2-p2/r2-2-week-window-p.png`).

## 7. Cases carried by a test

- The words for each landing kind in the calculation (`src/engine/rulescheck-batch2.test.ts` parts 2 and 2b): blank,
  "TBD", typed — the crew-rest tail, the debrief advisory, the tight turn.
- The Logic note's sentences for kept / late cut-off / both / none (`src/ui/logic.test.tsx`).
- A neighbour published day whose only waiting change is its OIL (`src/state/published-day-logic-neighbour.test.ts`).

## 8. The break tests

Each fix undone on purpose, its pinning test run, the file restored (15 Nov 26): the neighbour's OIL check (weekctx) RED;
the debrief words RED; the tight-turn words RED; the one source, the event's `noLd`, RED; the Logic note's "kept" guard
RED; its late cut-off sentence RED. Six of six caught.

## 9. Errors seen

No console or page error in any final run of the host, W1, W2 or W3. The full unit suite (locked, 15 Nov 26 ~02:00): 14,404
pass, 1 fail — the Leave War's double-tap window test, run while W2 drove a browser; alone it passes (32 / 32): a load
flake, not this change.

## 10. What was NOT walked, and why

W1: scenario 9's timed overlap cases and a phone look at the other row kinds (time); scenario 14's CSV and print doors — the
Insights window has neither. W2: scenario 11 and scenario 4's published part (time — handed to W3); Escape and a tap outside
on the Inputs windows. W3: the ALL AVAIL window opened from the phone's week (a tap on the count opened the crew list —
filed `[WEEK-AA-CHIP-PHONE]`), so lesson 4 on the phone; R4 used the empty weeks of 20 and 27 Jul, since next week's demo
Monday already holds Ranger's flights.

## 11. The reads (Astra; a fresh, blind Opus reader)

Both blind, the same brief (`superpowers/briefs/2026-11-15-rules-check-batch2-coderead-brief.md`), on app `cc2eefa50`, each
saved whole: `…-coderead-astra.md`, `…-coderead-opus.md`. Astra: 2 functional gaps in older code, 2 comment corrections.
Opus: F1–F7. Overlap: Astra's (2) is the Opus read's F2.

## 12. What the walk and the reads found, and each disposition

| Found | By | Disposition | What was done |
|---|---|---|---|
| The Logic note said a published day keeps its settings when only a late cut-off was changed — untrue: the LATE marks move at once (F1) | Opus | confirmed-new (this batch widened the claim) | fixed red-first: the note says only what is true of what is changed (`LogicPage.tsx`; `logic.test.tsx`); words his — Q1 on his card |
| The note named only "OIL setting"; Default rally and Debrief after landing change a day's OIL too (F4) | Opus | confirmed-new | fixed with F1: the sentence names all three |
| The debrief advisory, the ALL AVAIL reason and the tight turn still said "land" at a borrowed take-off (F2, Astra's (2)) | both | confirmed-pre-existing, newly in scope by D2010's reading | fixed red-first: one source, the event's `noLd` (`events.ts`, `validate.ts`; `rulescheck-batch2.test.ts` 2b); words shown to him — Q2 |
| A neighbour week's published day whose only waiting change is its OIL laid its kept settings on, so Sunday's "Breaks Monday" disagreed with Monday's working copy (Astra's (1)) | Astra | confirmed-pre-existing (older code, D2013) | fixed red-first (`weekctx.ts` + `oilRuleShift`; `published-day-logic-neighbour.test.ts`) |
| A shift with START and no END says the day "ended" at its START (F3) | Opus | confirmed-pre-existing; a product choice | put to him — Q3, recommended: leave such a shift out of crew rest |
| Three comments overstate when a change reads pending (F5) | Opus | confirmed | corrected (`oil.ts`, `faceattrs.ts`, `publish.ts`) |
| The strip hides after Reset while a day still reads pending (F6) | Opus | observation, older | for his look, not fixed |
| "No landing" inferred two ways (F7) | Opus | hardening, stored data only (D56) | removed with F2 — one source |
| Escape does not close the ALL AVAIL window | W2 | confirmed-pre-existing (same on `main`) | filed `[ALLAVAIL-ESCAPE]` |
| Edit Schedule's strip shows "1 to clear once signed" while day details reads "Nothing flagged" | W1 | as ruled — a hidden warning drops from the day's count (D469, D471) | none |
| No day-details door on the board at an older eye; View-only's picker has no Original | W1 | older design (older eyes come from the plans menu) | none |
| On a phone a tap on the week's ALL AVAIL count opened the crew list for the row, not the window | W2, W3 | a lead, not reproduced by hand; older code | filed `[WEEK-AA-CHIP-PHONE]` |
| The late cut-off's "days before" box keeps a typed number only on Enter; Tab or ✕ keeps the old one | W3 | older code, not this batch's | filed `[INSET-DAYS-ENTER-ONLY]` |
| The fixes, re-walked (debrief / turn words, the ALL AVAIL reason, the note's cases, the neighbour Monday, scenarios 11 and 4) | W3 | no fault | none |

## 13. The gates

GitHub's full run on the fixes' commit `82106d65e`: green (checks passed, the secrets scan, the documents guard). The code
check: no new finding. GitHub's runs on `f01e1e416` and `3ca3e950b` (the re-walk's set-up, the break tests): green. The
run on the commit carrying this sheet is read before his look is asked for, its result in `HANDOFF.md`'s block.

## 14. His look card

1. The Logic page's note, as built (Q1) — with Crew rest changed, and with a late cut-off changed: the words are yours.
2. The debrief and tight-turn words with no landing typed (Q2).
3. Q3: a standby shift with a start and no end — leave it out of crew rest (recommended), or word it "started 20:00 with no
   END typed".
4. Scenario 12 B: changing Default rally makes the published Saturday read "1 pending", its list naming the change — it
   never says the full day stays a full day (`img/…/w2/s12B-d9/s12B-pendinglist-d.png`, phone `…/s12B-p9/…`).
5. The OIL Saturday end to end (scenario 6, W2's pictures).
