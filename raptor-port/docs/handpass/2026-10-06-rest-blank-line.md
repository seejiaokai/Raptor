# `[REST-BLANK-LINE]` — a blank crewed line hid a crew-rest breach — evidence sheet (6 Oct 26)

**Authority: D602** (owner, 6 Oct 26): the crew-rest fault is fixed first after the Codex stack, in a new chat, with its
own full check. His instruction for this chat named the crew-rest fault alone, so `[OIL-WORK-START]` — which the handoff
had proposed doing beside it — was NOT built here and stays next. Branch `claude/rest-blank-line`, cut from `main` at
the merge of PR #481. Nothing merged; `main` untouched.

**Status:** GATES_STATUS_LINE

## Questions waiting for him

None that blocks this fix. One question was FOUND by the check and is filed for him with a recommended answer
(`OUTSTANDING.md` `[BLANK-TIMES-ABSENCE]`): *should a man who is on leave or grounded for the whole day be flagged the
moment he is seated anywhere that day, even on a line with no times yet?* Recommended: yes. Today the crew list warns
when he is picked, but once he is seated the day's warning list says nothing until a time is typed. It is not this
fix's doing and waits on nothing here.

## The eight questions (bug-check order §5) → tier FULL

| # | Question | Answer |
|---|---|---|
| 1 | OIL / what a man is owed | NO — the change is inside the crew-rest pass and the same-day turn pairing; nothing that works out OIL or work hours reads them (`workSpan`, the OIL modules: untouched) |
| 2 | The published record | **YES** — a crew-rest breach, its ring and the dotted mark stay LIVE on a published day's face (D183–D185); what a published day shows changes |
| 3 | Saved data | NO — a warning is worked out, never stored; nothing saved changes shape. (A hidden warning is kept by its words — the words of an existing breach do not change; walked, S12) |
| 4 | A shared drawer | **YES** — one crew-rest body with three callers (each day, the look-ahead to next Monday, the crew list's question before a drop), and its marks are drawn wherever a man's puck is |
| 5 | A new gesture or mode | NO |
| 6 | A new surface | NO (one new row of text on the Logic page) |
| 7 | Roles | NO — the same result for everyone; the member's read-only face was walked |
| 8 | The warning list | **YES** — when a crew-rest warning is raised, and one new sentence |

## The rulings that apply — each walked against the build

| Ruling | What it says here | Result |
|---|---|---|
| D602 | fix this fault first, its own full check | this sheet |
| 21 Aug 26 (owner) — "anything that ends the day prior … will be a warning of crew rest"; "this person needs 12 hours of rest in order to fly"; the day starts at its first commitment, only when he flies that day | every kind of event ends yesterday; an earlier meeting binds the breach on a flying day | holds — S21 (five kinds of cause), S10, H-01, S20; a meeting with NO flying line stays silent (unit test, H-01's last step) |
| 10 and 25 Aug 26 — a new line and a new wave's first line come up blank | the blank line is the app's normal state, not an error | the fault's doorway; the tests use that exact shape, the browser test the real "+ Line" |
| 24 Aug 26 — an SC line's B box is its in-time | read as the report, the earlier of it and the shift start | holds with the shift start missing — S08, unit test |
| 6 Aug 26 — "late show": the breach is still red; the ring is dashed only if he makes the step | no step is claimed when there is no take-off | holds — S26 f–i, unit test (no "Late show" tail, no dashed ring without a take-off) |
| 7 Aug 26 — a turn chips, it does not ring; 21 Aug 26 — the double-turn chip counts a leg with no times | the amber notes unchanged | holds — S13, S26, the "left as it was" unit tests |
| 23 Aug 26 — the rule reads across the week boundary; "Breaks Monday" | the same body runs for next Monday | holds — S02 (a blank wave before and after, on both sides of the weekend) |
| D183, D184, D185, D188 | the breach, its ring and the dotted mark are live on a published face, never a pending change, never touching the sign-offs | holds — S03 (admin and member), the two independence walks, the order "blank ↔ publish" |
| D179, D177–D178 | everything else on a published day freezes; a real edit is pending | holds — the control edit read "1 pending / Not yet signed"; the issued face kept its breach until the AL went out |
| D469, D472, D471 | a hidden warning stays hidden, uncounted, unflagged; on a published day a hide waits for its amendment | holds — S12 in three orders and on a published day |
| D187 | the 👁 look at a published version shows its warnings | holds — S03, S23 (the look at the Original showed what it went out with) |
| D477, D478 | Insights counts the page's copy, a hidden warning not counted | holds — S03, S27 ("Crew rest (<12h) 2"; "none" at 4 h) |
| D503, D505, D506 | a reporting clock later than its take-off is the day before; the earliest applicable In-time / Rally | holds — S25 ("told to report 23:00 (previous day)"), S07, S17 |
| D509 | a timing warning never blocks publishing | holds — S19 |
| D56 | harm only in stored demo data is not a finding | said in every brief; none raised |
| The robustness doctrine (21 Aug 26) | the five families | the table below |

No clash between them was found. One reading to tell him (the agent's, made in the build): **a man whose ONLY line that
day is blank and who has an earlier meeting inside his 12 hours IS flagged** — he flies that day whatever time the line
ends up with (Astra's scenario S10; before the fix this was silent like the rest).

## The fault, seen on screen — before and after

`scripts/handpass/rbl-host.mjs`, the host's own walk, through the app's own controls ("+ Wave", "+ Line", the time boxes,
a seat and the crew list), on the build as it is LIVE (the fix set aside, rebuilt) and on the FINAL build. A PASS means
the warning is where it should be. X = Scribe, idle across the demo week. Pictures: `docs/img/handpass/2026-10-06-rest-blank-line/before/`, `…/after/`, `…/before-h4/`.

| Step | What was done | LIVE build | FINAL build |
|---|---|---|---|
| H1.0 | Monday: new wave, ZM 21:00–22:30, Scribe aboard. Tuesday: new wave, ZT 07:00–08:30, Scribe aboard | red "Crew rest breach" in Tuesday's list, red ring and R chip on his Tuesday puck, dotted ring on Monday's — PASS | the same — PASS |
| H1.1 | "+ Line" on Tuesday (it comes up blank), Scribe put in its seat from the crew list | **the warning, the ring and Monday's dotted mark are all gone**; only an amber "double turning" chip — FAIL | all three stay — PASS |
| H1.2 | a landing 15:00 typed on that line, no take-off | still gone — FAIL | stay — PASS |
| H1.3 | a take-off 14:00 typed | back — PASS | PASS |
| H1.4 | both times cleared again | gone again — FAIL | stay — PASS |
| H1.5 | the page reloaded, signed in again | still gone — FAIL | stay — PASS |
| H2.1 | Monday: a new wave whose one line is blank, Scribe in it; THEN a second wave ZM 21:00–22:30 with Scribe. Tuesday ZT 07:00 | **no breach was ever raised** — FAIL | breach, ring, dotted mark on both of his Monday pucks — PASS |
| H3.1 | Tuesday, one wave: ZA 07:30–09:00, a blank line, ZC 09:30–11:00, Scribe in all three | no "Tight turn" line — FAIL | "Tight turn ZA→ZC: 30 min" — PASS |
| H4.1 | the same with the LATER leg drawn first: ZC, a blank line, ZA | (walked build, before its fix) no "Tight turn" line — FAIL | "Tight turn ZA→ZC: 30 min" — PASS |

No browser error in any run. H4 was found by the host re-reading its own fix while the walkers walked (the first fix
set the blank line aside AFTER sorting, and a sort cannot place a line with no times) — red test first, fixed, re-walked.

## What was built

`src/engine/validate.ts`, the crew-rest pass and the same-day turn — one rule: *a line with nothing to measure neither
raises a breach nor hides one.*
1. **Yesterday:** an event whose end is not a real time is not the end of his day (a landing typed with no take-off
   still is).
2. **Today:** the report he is told is the earliest of the instructions that EXIST — a typed Brief, his wave's In-time /
   Rally, an SC line's typed B or its shift start. A line with none is left out; only lines with a take-off bear the
   nominal 3-hour report and the amber "tight turning" note. A man whose every line is blank still flies that day, so
   an earlier commitment inside his rest is a breach, worded "his day starts 08:00 (SQN BRIEF), and he is on a line
   with no take-off yet" — no report is invented. The "late show" sentence is dropped when there is no take-off to name
   a step for.
3. **The same-day turn** pairs only lines with both times, set aside first and sorted after; the double-turn chip still
   counts a line with no times.

**Not built the way the first reader proposed** ("skip every line with no take-off"): that would have LOST the breach a
typed Brief already raised on a line with no take-off, and kept ignoring the wave's In-time and an SC line's B
(Astra's scenario read, §3). With every time present the arithmetic is value-for-value what it was — the comparison
with the original app holds. `src/ui/logic-html.ts`: one new row under Crew rest says the rule where a scheduler can
read it. `docs/engine-rules.md` §Crew rest carries it.

## The roll-call — every place the app shows or uses a crew-rest result

From Astra's roll-call (`docs/superpowers/briefs/2026-10-06-rest-blank-line-scenarios-astra.md` §1), each walked or
dispositioned. "Reaches" = did the fault reach this place.

| Place | Reaches | After the fix | By |
|---|---|---|---|
| Edit Schedule's day warning list | yes | the red line stays, word for word | host H1–H2; A S05, S04; phone too |
| Scheduler Board's issue list | yes | the same line | B (S03 Board look), C H-03 / S11 |
| View-only Sched, published face (admin, member) | yes | live, never pending, sign-offs kept | B S03, independence A and B |
| The 👁 look at the current published version, week and Board | yes | agrees with View-only | B S03 |
| The 👁 look at an OLDER version | its recorded result only | shows what it went out with; loading it recalculates | B S23 |
| A saved plan | no live list by design | switching plans recalculates | B S23 |
| Day-details window | yes | agrees with the page under it | B S03 |
| Cockpit pucks, SC MAIN, duty, sim, ground, Common Programme pucks | yes | solid red ring + R chip today, painted (computed style) | host, A, B, C |
| Yesterday's dotted ring and its "Breaks <day>" line | yes | stays; both of his Monday pucks | host, A S04, B S03 |
| Sunday's forward "Breaks Monday" | yes | stays with a blank wave on either side | B S02 |
| Crew list before a drop (struck name, "crew rest — not clear until …") | yes | struck, with the reason, with the man already on a blank line | C S11 (tap and drag, desktop; tap, phone); A S04 |
| The drop toast | yes | names the breach after the drop | C S11 |
| The SC seat's "not clear yet" clock | yes (yesterday's side) | carries the right time | unit test (`restClear`); B S27 crew list "not clear until 11:30" |
| A hidden breach | yes | stays struck, uncounted, unflagged through blank lines, Undo, Redo, reload, sign-in | B S12 |
| Insights' issue counts | yes | counts it once; "none" when the rule is loosened | B S03, S27 |
| The Logic page | states the rule | the new row is there, readable at both sizes, found by search | B H-02 |
| SANS card, Personal Inputs row, Unavailable row, crew-list copy of his puck | the warning yes; **the dotted and dashed rings are not drawn there** | unchanged — an OLD gap in those drawers | C S01 → FILED `[CREW-REST-MARK-COPIES]` |
| SC SPARE, AVALON, BB | no — outside the crew-rest rule on purpose | no ring borrowed | C S28a |
| Next-week peek; the PDF and CSV exports | no crew-rest drawing by design | not walked — nothing to see | Astra's read of the code |

## The walk

Three walkers (Sonnet 5.5 — D588), each in its own world on its own server, the final-minus-one build (the build
before the reverse-drawn-turn fix; that fix was re-walked by the host, H4). Astra designed the scenarios (S01–S29 and
ten action pairs); the host added H-01 to H-03. The brief: `docs/superpowers/briefs/2026-10-06-rest-blank-line-walk-brief.md`.
Their reports, tables and scripts: `docs/handpass/parts/rbl-{A,B,C}.md`, `.json`, `scripts/handpass/rbl-{A,B,C}-*.mjs`.

| Walker | Share | Rows | Result |
|---|---|---|---|
| A | S05, S04, S09, S06, S07, S08, S10, H-01, S13, S14, S24, S21; five action pairs in both orders, Undo / Redo / reload; desktop, and phone for S05, S04, S10, H-01, S13 | 297 | 290 PASS, 7 recorded, 0 FAIL |
| B | S03 (admin and member), the two published-day independence walks, S12, S23, S02, S27, H-02; four action pairs in both orders; desktop, and phone for S03, S12, H-02 | 142 | 136 PASS, 6 recorded, 0 FAIL |
| C | S11, S01, S15, S26, S25, S16–S20, S22, S28, H-03, S29; desktop, and phone for S11, S01, S26; S29 at four sizes | 85 | 70 PASS, 12 recorded, 3 marked FAIL by its script — none an app failure, below |

**Walker C's three FAIL rows, read by the host:** two are its scripted finger-drag from the phone's crew drawer, which
picked nothing up (nothing placed, no toast) — NOT WALKED, not a defect call; the third is its script expecting the
crew-rest reason beside Scribe's name where the crew list printed his SANS reason first (he is a SANS man with nothing
filed) — recorded; after placing him the breach toast and line were right.

**What the walkers found, and each disposition** (a walker's conclusion is not a finding until the host reproduces it):

| Find | Host's check | Disposition |
|---|---|---|
| "SC NIGHT currency needed for SC AM (NaN:NaN–NaN:NaN)" on an SC line with its times cleared (A, C) | reproduced in a unit run before the walk; the SC currency code is untouched by this change | OLD — FILED `[SC-BLANK-SHIFT-QUAL]` |
| A man on all-day leave or a downchit, seated on a blank line: no line in the list, plain puck, until a time is typed (C, S15) | reproduced through the rule for LL, OL and ATT C; the crew list's reason is right; a timed line raises it | OLD — FILED `[BLANK-TIMES-ABSENCE]`, a question for him |
| The dotted and dashed rings missing from the SANS card, the Personal Inputs / Unavailable rows and the crew list; an open list paints over them (A, B, C) | picture opened (`C/dk-10-s01-solid-board0-sans.png`: Monday's SANS card, solid red, R chip); nothing that draws a puck was changed | OLD — FILED `[CREW-REST-MARK-COPIES]` |
| A SANS man's offer worded as a clash on a line with no times; blank names leave holes in sentences (C, S28) | not this rule | OLD — FILED `[BLANK-LINE-SANS-WORDS]` |
| Debrief, Brief lead and Step settings make published days read "1 pending" — with or without a breach (B, S27) | as ruled: a published day keeps the brief time it printed and reads pending when a setting moves it (D186); the Crew rest setting did not | not a finding; the OIL half of it is `[OIL-WORK-START]` |
| The crew list shows no crew-rest reason for an EMPTY formation's seat (B, C) | documented: no sibling leg to measure from; the toast and the list catch it after the drop | as built — `[REST-FIRST-CREW-HINT]` is already filed |

**Pictures the host opened itself** (13): the fault before and after (`before/dk-05…`, `after/dk-05…`); A — H-01's
list at desktop and phone (the new sentence), S04's Monday pucks, the crew list's struck "not clear until 12:30"; B —
the published Tuesday on View-only Sched, the Sunday "Breaks Monday" line, the MEMBER's View-only face of a published
Tuesday with a blank line on it, the hidden breach struck with its ↺; C — S15's list with nothing in it, Monday's SANS
card, the NaN currency line. Each showed what its walker reported. The walkers opened 25 (A), about 65 (B) and 36 (C).

### The five gotcha families

| Family | Walked as | Result |
|---|---|---|
| People not following the format | S16 (700 / 0700 / 7:00 / 07:00 / 0700H; 0400H / 0400L in a reporting line), S17 (IN TIME / IN-TIME / INTIME, named Rally, reversed lines), S19 (8h00, 25:90, 08.00) | the same clock and the same rest sentence for every accepted spelling; an unreadable reporting clock is told so and poisons nothing |
| Missing input | the whole job: S05, S04, S06, S07, S08, S09, S10, H-01, S13, S14, S22 (a template with blank times) | a missing time is never read as a time; what is there is still used; the rule is said on the Logic page |
| User errors | S18 (morning, 25:90, 1260 into take-off, landing and Brief, 36 tries, Tab and click-away, week and Board), S26 (the 12-hour edge to the minute; late show) | every refused value put back; 04:59 breaches, 05:00 does not |
| Deletions and edits from another page | S20 (a meeting added, re-timed, moved to another day, deleted from the Inputs page; a row removed by its ✕), S21 (the cause changed and deleted, five kinds), S24 (CX and restore), Logic settings S27 | the warning, its words and its target follow at once on every page |
| Sync between copies | S03, S23, S02, S27, S11 (the crew list, the published face, the version look, Insights, next week) and the three callers of the one body (unit: `restIfPlaced`; S02) | every reader agrees |

### Orders (both ways each; Undo, Redo, reload where it applies)

Create the blank line ↔ seat the man · seat ↔ type or clear Brief, take-off, landing, a reporting line · the late
source ↔ the early target · blank line ↔ drag a wave, drag a line, Auto sort · blank line ↔ CX and restore (A, unpublished
day) · blank line ↔ hide / unhide · blank line ↔ a Logic setting · blank line ↔ publish and amend · blank line ↔ a saved
plan or a loaded version (B). The same final words, rings and marks in both orders of every pair.

## Tests, red first

- `src/engine/restblank.test.ts` — 28 cases. Written before the fix: 12 of its first 22 failed on the unfixed rule.
  Added with the build, each red before its part of the fix: the meeting case, the SC in-time case, the tight-turning
  note beside a Brief-only line, the reverse-drawn turn. Seven of the 28 pin what was LEFT AS IT WAS (a landing-only
  line is still yesterday's end; a typed Brief alone still breaches; a meeting with no flying line needs no rest; the
  double-turn chip; the old sentence when a report exists).
- `e2e/restblank.spec.ts` — 4 browser tests through the real controls, the ring and the dotted mark asserted as PAINTED:
  3 of the first 3 red on the build as it is live; the fourth red on the build before its fix; 8 of 8 green over two
  repeats on the final build (and 9 of 9 over three on the build before).
- The whole rules-engine folder, the comparison with the original app included: 1,913 of 1,913.

### Break tests — each part of the fix cut once, on purpose

| Part cut | Went red |
|---|---|
| yesterday: an end that is not a time is skipped | 3 — the blank Monday line first, in the same wave, the cleared SC shift |
| today: only instructions that exist are read | 2 — the wave's In-time, the SC in-time |
| today: a line with no instruction leaves the minimum | 8 — "+ Line" after, a blank wave before, a landing alone, the cleared SC shift, the tight-turning note, the crew list's question, the meeting case, the old sentence |
| today: only lines with a take-off bear the nominal report | 1 — the tight-turning note beside a Brief-only line (no test at first: written, then red) |
| the binding line when no line tells him anything | 1 — the meeting case |
| the meeting sentence | 1 — the meeting case |
| the late-show tail needs a take-off | 1 |
| the turn pairs only lines with times | 1 — the blank line between two legs |
| a guard for "nothing to measure" | none — proved to do nothing, so it was REMOVED rather than left untested |

BREAKS_FINAL_NOTE

## What was NOT walked, and why

- **His iPhone.** Every phone step ran in Chromium's phone emulation.
- **A finger drag from the phone's crew drawer** onto a seat (C's script could not pick the name up) — the tap route was
  walked on the phone, the drag on a desktop; both ask the same question of the same rule.
- **Phone size** for the scenarios not listed above against a phone (S06–S09, S14, S21, S24, S02, S23, S27, S15–S22,
  S25, S28): the rule's result does not depend on the screen; the places that DRAW it were walked at both sizes.
- **S29's overlays in full**: no higher-priority chip stood beside the crew-rest one in C's fixture, and the browser
  started with the 125% argument reported a scale of 1 — only the context scaled to 1.25 is a true 125% read.
- **The final build by the three walkers**: they walked the build before the reverse-drawn-turn fix and before a guard
  that did nothing was removed; the host re-ran its whole walk (H1–H4) and the browser tests on the final build.
- **The next-week peek and the exports** — they draw no crew-rest mark, by design.

## Found and filed — none of it this fix's doing (each is in `OUTSTANDING.md` with its place)

`[BLANK-TIMES-ABSENCE]` (MEDIUM, his question) · `[SC-BLANK-SHIFT-QUAL]` (low) · `[CREW-REST-MARK-COPIES]` (low, his
question) · `[BLANK-LINE-SANS-WORDS]` (low) · `[TAB-LAST-BOX-TEST-GAPS]` (low, tests only — from the owed read below).

## The two owed reads (`[R3-OWED-READS]`) — done by Astra with the scenario design

(1) The Tab that keeps the caret in a day's last box (D597): sound, no defect; its test's gaps filed. (2) D603 and D604
read true to their full rows; **D602's short line had lost "options first, nothing trimmed before he rules"** — reworded
in this change, and read again by both readers below.

## The gates

GATES_TABLE

## The two code reads (Astra, and Sol 6.1 second, each blind to the other — D590, D601)

READS_SECTION

## His look — the "look here" card

LOOK_CARD

`Walk:` WALK_LINE
