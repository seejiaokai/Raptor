# Evidence sheet — the amendment batch (25 Sep 26, built overnight under D112)

Branch `claude/amendment-batch`. The batch: `docs/superpowers/specs/2026-09-25-amendment-batch.md` (14 items, rulings
D91–D111). The plan: `docs/superpowers/plans/2026-09-25-amendment-batch-plan.md`. Builder: Opus 5.5; scenario design and
the code reads: Fable 5.1 and Astra (Codex), blind to each other (D67).

## 0. The tier — FULL

The eight questions (bug-check order §5): 1 money **YES** (a sign-off decides what goes out and what earns; D103 binds
it to who is behind ALL / ALL AVAIL) · 2 published record **YES** (signing, counts, the load, the template door, the
issued face's marks) · 3 saved data **YES** (the Original keeps its signers; an AL keeps its item count) · 4 shared
drawer **YES** (the puck mark, the version tag, the day head) · 5 new gesture **YES** (the pending button and list,
the one jump) · 6 new surface **YES** (the pending list, the Signed line) · 7 roles **YES** (members read the Signed
line) · 8 the warning list **YES** (the board's rings). → **FULL.**

## 1. The rules sweep — every ruling that applies, and where it is pinned

| ruling | in plain words | built in | pinned by |
|---|---|---|---|
| D109 (AM23) | a man moved on the same day is ONE pending change; every count reads one body | `canonical.ts canonicalUnits`, `publish.ts dayPendingItems` | `pendunits.test.ts`, `amendbatch.test.tsx` item 14 |
| D103 (AM13, AM11) | any pending change on a published day wipes the four; putting it back restores them | `publish.ts currentBind` (`pd`) | `oilmembership.test.ts` (D45's tests rewritten to D103) |
| D99, D100 (AM53) | "N pending ▾" lists what will go out; a long list scrolls; a tap goes there | `ui/pendlist.ts`, `html.ts dayStatHTML` | `amendbatch-app.test.tsx` |
| D104 (AM54) | who = the shared account until the database; "earlier" when the record is gone | `ui/pendlist.ts` | `amendbatch-app.test.tsx` |
| D107 (AM56) | a jump from Edit history / the list stays on the page you are on | `interactions.ts jumpToChange`, `highlights.ts bringIntoView` | `amendbatch-app.test.tsx` |
| D105 (AM55) | the change bubble stays; a long one scrolls inside itself | `histbubble.ts`, `scheduler.css .hb-all.scroll` | the walk (layout — baselined in rulecheck) |
| D97 (AM24) | "Not yet signed" / "Not yet published" | `html.ts nysMarkHTML` | `amendbatch.test.tsx` item 5 |
| D92, D93 (AM19) | a changed puck gets a tag, never a ring — every surface, View-only Sched included | `scheduler.css` | `amendretest.test.tsx` (rewritten to D93); the walk (geometry) |
| D94 (AM59) | the board draws the dashed and dotted rings as the week does | `html.ts puckMarks`, `board-html.ts` | `amendbatch.test.tsx` item 2 |
| D108, D110, D111 (AM22) | ORIG is the seal, A1 | `html.ts verChipHTML`, `.verchip.orig` | `amendbatch.test.tsx` item 13 |
| D95, D102 (AM57) | the Signed line names who signed the version on screen | `html.ts signedLineHTML`, `publish.ts verSigners`, `setDayApproved` | `amendbatch.test.tsx` item 3 |
| D96 (AM58) | a day template is refused on a published day | `daytpl.ts`, `board.ts pickDayTpl` / `dayTplMenu` | `daytpl.test.ts`, `board.test.tsx`, `daytplui.test.tsx` |
| D98 (AM6, AM20) | the load puts back what the version filed; nothing pending after | `publish.ts filingRestorePlan`, `drafts.ts` | `amendbatch.test.tsx` item 6, `amendretest.test.tsx`, `accept.test.ts` |
| his keyboard report | nothing behind the board shows above a phone keyboard | `SchedBoard.tsx`, `scheduler.css` | `amendbatch-app.test.tsx` (scripted visual viewport); his phone |
| D91 (AM19) | a man taken off a seat leaves no mark on the row — unchanged | — | unchanged |
| D44 (AM42) | who stood behind a placeholder is frozen at publication — unchanged, D103 keeps it | — | `oilmembership.test.ts` D44 block |
| D56 | a problem only in stored demo data is not a finding | the reviewers' briefs | — |

**Clashes named (D90 — the later ruling wins):** D103 (25 Sep) sets aside D45's signature half (22 Sep; AM13); D93
(24 Sep) sets aside AM19's view-page dashed hint (Aug / 24 Sep re-test); D96 (25 Sep) sets aside Phase 2's
"template on a published day is a working-draft edit" (P2-R3-04); D98 (25 Sep) sets aside P2-REREVIEW-08 ("a load
replaces content only"); D111 (25 Sep) sets aside AM22's grey ORIG (15 Sep). Each stale text is marked where it sat.
**The one gap:** a replacement in one seat — D109 does not settle it; built as one, filed `[MOVE-REPLACE-ONE]`.

## 2. The scenario round — Fable and Astra, blind to each other

Reports: `2026-09-25-amendment-batch-fable-scenarios.md`, `…-astra-scenarios.md`. Their plan findings, disposed:

| finding | who | disposition |
|---|---|---|
| the counting places folded a desk's holder into its extras, and counted a list's leavers once per place | both (F1 / Astra 1, 5) | **fixed** before any walk: holder and extras are separate places; one per man on a list; a crowd re-ordered is one — `8aeb89be` |
| a replacement in one seat: one or two? | Astra 1 (two), Fable F1 (one) | **gap, filed** `[MOVE-REPLACE-ONE]`, built as one |
| a man moved into / out of an added or removed row should still read as a move | both | **fixed** — pairing takes those places in, never two structural ends |
| the list would name the wrong row / print raw composites | Fable F2 | **fixed** — person units resolve by row id; values spelled out (`pendlist.ts valueWords`); a removed row named from the issued day |
| the load reaches other days through a request's one filing value | both (F3 / Astra 3) | **fixed** — `filingRestorePlan` leaves such a request as filed and the load says so |
| the template door armed before refusing | Fable F4 | **fixed** — refused first; disabled rows with the reason |
| the board's dotted ring would have no caption | Fable F5 | **fixed** — `puckMarks` carries the printed flag too |
| the jump built for the board in four places | Fable F6 / Astra 6 | **fixed** — week-jumpable rows, titles, a preview cleared first, `bringIntoView` |
| the bubble cannot be scrolled while it takes no pointer | Fable F7 / Astra 9 | **fixed** — the list takes the pointer when it overflows; a mouse can cross into the bubble |
| the Signed line must take the version on screen per surface | Fable F8 / Astra 7 | **fixed** — passed explicitly |
| ~6 canonical diffs per published day per paint | Fable F9 | **measured** in §6 (the perf gate) |
| the list must stack over the board | Fable F10 | **fixed** — z 440 over the board's 400 |
| the view page's dashed seat outline is a ring left behind | Astra 2 / Fable F11 | **fixed** — the hollow tag on View-only Sched's working-draft face too (D93) |
| `units` dropped when a version is withdrawn | Astra 4 | **fixed** — `retireIssued` copies it |
| removals of a man from a surviving place should keep who/when and a target | Astra 5 | **built so** — a person unit keeps its place's keys and jump |
| the board rings must keep OIL-mode and exempt branches | Astra 8 | **kept** — only the ordinary seat branches changed |

## 3. What the full unit run found after the build (and fixed)

The full suite found nine tests red in one file with no error thrown: a blank tap on the board no longer cleared a
selection. Bisected to item 11 in two minutes: the page class set while the board is open was `sb-open`, which is
also the class of the week's date button that OPENS the board — and the click router decides "blank tap?" by
`closest('…, .sb-open, …')`, so on `<body>` it matched every click. Renamed `sb-board-up` (`dd4bedca`). Logged as a
skills observation (#245).

## 4. The walk — three walkers, each its own browser world, on the production build (D16)

The brief: `docs/superpowers/briefs/2026-09-25-amendment-batch-walk-brief.md`. Reports (every check, its result and
its picture): `parts/2026-09-25-amendment-batch-b1.md`, `-b2.md`, `-b3.md`. Scripts: `scripts/handpass/am/b1-*`,
`b2-*`, `b3-*` (assertions of the right behaviour — re-running them is the re-walk). Pictures:
`docs/img/handpass/2026-09-25-amendment-batch/{b1,b2,b3}/` (200), the re-walk's in `…/rewalk/` (41). Desktop 1440×900
(DPR 1 and 3) and phone 390×844; admin and member; the edit week, the board, View-only Sched's issued face and its
working-draft peek. The browser error list stayed EMPTY in every run.

| walker | items | checks | result |
|---|---|---|---|
| B1 | 14, 7, 8, 9, 12, 5 — the count, the signatures, the list, who/when, the jump, the marker | 76 | 74 pass; 2 fail = finding B1-1 (and its knock-on) |
| B2 | 1, 2, 13, 3 — tags not rings, the board's rings, the seal, the Signed line | 138 | 138 pass; the dashed late-show ring could not be made through the app (S1) |
| B3 | 4, 6, 11, 10 + a regression sweep | 144 | 132 pass; 12 fail = findings B3-F1, F2, F3 |

**Findings and dispositions** (each reproduced by the host before fixing — the re-walk scripts are the reproduction):

| finding | disposition |
|---|---|
| B1-1 ✕ on an accepted request's row counts TWO (the row + the request's filing) — the same as before the batch | **filed for him** `[REQUEST-OFF-ONE]` (recommended: one), on the look card |
| B1-2 a change in who stands behind ALL AVAIL read only "What this day earns · changed" — no row, no man, no tap | **fixed** `f885b65b` — the line names the row and the men and goes to the row; re-walked: "FAMILY DAY · who it stands for — Ghost → no longer free" |
| B3-F1 a refused template row looked and lit exactly like a live one | **fixed** `c063ea6b` — dimmed, no pointer, no hover; re-walked 4/4 |
| B3-F2 loading Monday quietly cleared Tuesday's waiting change for a two-day request | **fixed** `c063ea6b` — a request covering another loaded day is never set by a load; where the version takes away the ONE row it stood on, the older reconcile (P2-REV2-05) truthfully takes it off the programme and the other day reads that too — now NAMED in the message ("1 request came off the programme with its row — Tue reads that too"). Re-walked: the row-on-Tuesday case passes whole; the row-on-Monday case now names it (the walker's old expectation, "left as filed", is not reachable without breaking D98) |
| B3-F3 on a desktop the History bubble vanished on the way to its long list | **fixed** `c063ea6b` — the grace is not cut by what the pointer crosses; re-walked: every path (4–20 steps, with and without pauses) reaches the list |
| B3 the pending list stayed put when the page scrolled under it | **fixed** `c063ea6b` — it closes on a page scroll (its own list scrolling does not) |
| B2-S3 the tag slightly covers the top of a puck's qualification letter | **as approved** — the mock-up's placement (D93); legible |
| B2-S4 Ranger (View as) still glows | **already filed** `[PUCK-FLAG-GLOW]` (D164), not this batch |
| B3 Unpublish says nothing | **already filed** `[AMEND-SMALL-SEEN]` item 1 |
| B3 the phone keyboard emulation moved the focused field below the visible area | **his iPhone** — real Safari scrolls the focused field into view itself; the look card asks him |

**The host's own look** (the browser pane, desktop): the pending list open on a published Monday — "Waiting to go
out as AL1 · 3 changes", "Sidewinder · SDO → OPS-O · Admin 25/9 03:47", the ORIG seal with its tick, "Not yet
published", the Amendments panel agreeing (3 changes).

## 5. Break tests

Each wired piece broken once on purpose (the file restored after each; the script is kept in the chat's scratch
folder — the table is the record). Every break turned a named test red:

| broken on purpose | test that went red |
|---|---|
| the count reads the raw record, not the one body (item 14) | `amendbatch.test.tsx` item 14 — also done red-first while building |
| the signature ignores the pending comparison (item 7, `pd`) | `oilmembership.test.ts` D103 block (2) — also red-first |
| the marker never says "Not yet published" (item 5) | `amendbatch.test.tsx` item 5 — also red-first |
| the board passes no warning marks (item 2) | `amendbatch.test.tsx` item 2 |
| the ORIG seal loses its tick (item 13) | `amendbatch.test.tsx` item 13 |
| the Original does not keep its four (item 3) | `amendbatch.test.tsx` item 3 (2) |
| the picker applies over a published day (item 4) | `board.test.tsx` (D96) |
| the engine applies over a published day (item 4) | `daytpl.test.ts` (D96, AM58) |
| the load does not put filings back (item 6) | `amendbatch.test.tsx` item 6 + `amendretest.test.tsx` (3) |
| the pending chip is never a button (item 8) | `amendbatch-app.test.tsx` (4) |
| the jump always opens the board (item 12) | `amendbatch-app.test.tsx` (2) |
| the board does not follow the visible area (item 11) | `amendbatch-app.test.tsx` |
| no hollow waiting tag (item 1) | `amendretest.test.tsx` (the stylesheet guard, rewritten to D93) |

## 5a. The two code reads — Fable and Astra, blind to each other, given the finished code and this sheet

Their reports, unchanged: `2026-09-25-amendment-batch-fable-read.md`, `2026-09-25-amendment-batch-astra-read.md`.
Both passed the signature binding, the one counting body, the per-paint memo, the Original's signers, the template
refusal and the tags-not-rings; each found what the other did not. Every finding was fixed with a test that goes red
when the fix is taken out (checked, 25 Sep 26 ~04:40):

| finding | what was wrong, in the app's words | fix | pinned by |
|---|---|---|---|
| Astra 1 (high, new) | take a man off a crowd AND re-order the rest: the day said **1 pending**, not 2 — also when the man was moved to another row | the survivors' order is compared on its own (each occurrence apart, so two ALL AVAILs never merge); a list merely closing up still adds nothing | `pendunits.test.ts` (three cases); `amendbatch.test.tsx` — the day head, "Discard N edits", the pending list, the publish and the issued AL all say 2 |
| Astra 2 (moderate, new) | two placeholders' crowds changed: the list named the first row "+ 1 more" and only the first could be tapped | still ONE change (D109's count), but each row has its own line and its own tap | `amendbatch.test.tsx` (the multi-row line) |
| Fable 1 (on `main` too) | a two-day request taken off, then its day's version loaded: its row came back but it still read "taken off", and "left as filed" was said — AL1 would have frozen that | when the version's row stands on the loaded day, the request is put back on the programme; the load says "came back onto the programme with its row — Tue reads that too" | `amendbatch.test.tsx` item 6 |
| Fable 2 (new) | "Discard N edits" could count a request of a protected week the load then does not touch | the one plan skips it; both readers agree | the plan's single body (both callers read it) |
| Fable 3 (new) | three comments and an unreachable message still said a published day takes a template as a draft | replaced with a pointer to D96; the dead message removed | — (text) |
| Fable 4 (process) | §6 and §7 below were empty | filled | — |

**Under D56, not findings** (Fable): signatures given before this build on days that already had changes waiting fall
off once; ALs issued before carry no item count and read their record's length. Both live only in stored data; the
code is right going forward.

## 6. Gates

## 7. What was NOT walked, and why

## 8. His five-minute look

On the branch's Vercel link, on a day you publish yourself:
1. **Move a man from one duty desk to an empty one.** The day says "1 pending". Tap **"1 pending ▾"**: the list says
   who moved and where. Tap the line — you stay on Edit Schedule and the desk flashes; the board does not open.
2. **A changed puck wears only its ALn tag in the corner** — solid once published, a dotted outline while waiting —
   and no coloured ring round the puck; its warning rings show as before.
3. **ORIG now has a tick**, and a slim **"Signed ORIG"** line under the day head names the four who signed it — on
   View-only Sched too.
4. **On your iPhone**, open the scheduler board and type into a Common Programme name near the bottom: nothing of the
   week behind should show above the keyboard. (Chromium cannot raise an iPhone keyboard; this is the one real proof.)
5. **One question for you:** replacing Rune with Tally in the SAME seat counts as **1** change. Keep it one?
   (Recommended: yes — it reads as one change, and it is what the day showed before.) `[MOVE-REPLACE-ONE]`
6. **A second question:** taking an accepted request off a published day (✕ on its row) counts **2** — the row and
   the request's filing, two lines in the list. Make it **1**? (Recommended: yes — one act, one line.) `[REQUEST-OFF-ONE]`
