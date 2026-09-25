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

**The re-walk of what the reads' fixes touched** (`scripts/handpass/am/hr-03-batch-reads.mjs`, production build,
desktop 1440×900 and phone 390×844, pictures `docs/img/handpass/2026-09-25-amendment-batch/rewalk-reads/`):
**7/7 on each, the browser error list empty.** A — three men on FLIGHT SAFETY STAND-DOWN, published; Havoc taken off by
right-click and Reaper dragged onto Ranger (the two swap): the board and the week read **2 pending**, the list "Havoc →
taken off" and "order changed", the Amendments panel "Mon · 2 changes". B — ALL AVAIL added to MASS BRIEF beside FAMILY
DAY's on the saved week's Saturday, published as AL1; Ghost files leave: **1 change**, its line "2 placeholders · who
they stand for" with FAMILY DAY and MASS BRIEF each on their own line (Ghost → no longer free), each a tap; the MASS
BRIEF tap stays on Edit Schedule and marks that row, in view. Looked at: `phone/B-1-pending-list-two-rows.png`,
`desktop/A-2-pending-list.png`. Seen in passing and filed, not this batch's: the swap inside one crowd says "Reaper —
already on FLIGHT SAFETY STAND-DOWN" (`[CROWD-SWAP-SAYS-BUSY]`).

**Under D56, not findings** (Fable): signatures given before this build on days that already had changes waiting fall
off once; ALs issued before carry no item count and read their record's length. Both live only in stored data; the
code is right going forward.

## 6. Gates

One full run, in order, on the final code (after the reads' fixes, commit `1c38a269`), 25 Sep 26 ~04:55–05:10 his
time, nothing else running on the PC:

| gate | result |
|---|---|
| unit (`npm test`) | **5903 / 5903** (363 files) — was 5855 on `main` |
| build | clean |
| the original's assertions (`node reference/tfin.js`) | **728 / 0** |
| browser geometry (`npm run test:e2e`) | **471 passed**, 48 skipped (the same 48 as `main`) |
| the Tracker's suite (`npm run smoke:tracker`) | **442 / 0** |
| `npm run rulecheck` | OK — every ruling named by a test or in the recorded baseline |
| `npm run docsize` | OK — every record accounted for |

Walk: 3 walkers + the host's re-walks, desktop 1440×900 and phone 390×844, admin and member, the production build;
every item's surfaces in the roll-call walked or listed in §7 with its reason; the browser error list empty in every run.

## 7. What was NOT walked, and why

Each is either pinned by a unit test that drives the same function, or left to his look — never assumed:

| not walked in the browser | why | what stands instead |
|---|---|---|
| a REAL iPhone keyboard over the board (item 11) | Chromium cannot raise an iPhone keyboard; two emulations are evidence, not proof | his look card, step 4 |
| a pinch-zoomed phone with the keyboard up | the board deliberately leaves a zoomed page alone; not emulated | — (behaviour unchanged by design) |
| the board's DASHED late-show ring (D94) | no man in the demo week could be given a sanctioned late show through the app — the one made had his breach bound by an earlier duty, which the rule rightly refuses (B2 S1) | the board passes the week's marks through the one reading (`puckMarks`); unit-pinned in `amendbatch.test.tsx` item 2; the dotted and solid rings WERE walked |
| the grey (note) ring under a change | no note-level man was made | the same one reading; tags-not-rings measured on every other ring |
| a desk holder dragged onto his own desk's extras (1, not 2) | the drag did not land in the walk's world (B1 X-1) | `pendunits.test.ts` (holder and extras are two places) |
| a leave deleted again → the four sign-offs return (D103, ALL AVAIL) | the walk's script could not reach the leave's ✕ on the Inputs table (B1 X-5b) | `oilmembership.test.ts` D103 block (both directions); the wipe half WAS walked |
| a traffic / area change on a published day in the list | not in the walkers' worlds | `pendlist` words for every cell kind, unit-pinned |
| a two-day request with rows on BOTH days | the app lands a request as ONE row, so the shape cannot be made through the app (B3) | both shapes it can make were walked (B3 F2) and Fable's case is unit-pinned (§5a) |
| the template refusal on the phone BOARD | the phone board has no Templates button; the phone reaches templates from the week, which was walked | — |
| the regression sweep on a phone; phone pictures of the duty, sim, ground and programme seats | the brief asked for desktop only; the phone checks read every changed seat by computed style (16 per surface) | the computed checks |

**Walked afterwards, 25 Sep 26 ~11:15 (his question "are you telling me there's a problem?")** — Fable's three
un-walked situations, `scripts/handpass/am/hr-04-fable-three.mjs`, production build, desktop 1440×900 and phone 390×844,
pictures `docs/img/handpass/2026-09-25-amendment-batch/rewalk-fable3/`: **12/12 on each, the browser error list empty.**
(1) Unpublish the Original → no Signed line, no seal; re-signed by four DIFFERENT people and re-published → the seal is
ORIG again and the Signed line names the NEW four on the week, the board and View-only Sched. (2) Undo straight after a
publish → back to unpublished, no Signed line, no seal, and the four sign-offs CLEARED to be signed again — the owner's
18 Sep 26 ruling (Undo of a publish IS an unpublish, and an unpublish clears the sign-offs; `undo-contract.md` §Publish
boundary), unchanged by this batch (no undo or unpublish file differs from `main`); Redo → published again, the same
four named. (3) + Alt Plan on the published Monday; Plan B changed → 1 pending, its list names it; opening the plans
menu closes the list; switching to Plan A → nothing pending, no list left open; Plan A changed → its list shows only
its own change and a tap stays on Edit Schedule; back on Plan B → Plan B's change again. Looked at:
`phone/1-b-republished.png`, `desktop/2-a-after-undo.png`.

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

## 9. D114's FULL check — a request taken off (or put on) a published day is ONE change (25 Sep 26, afternoon)

Step 1 of his order (D173). The change: commit `a95afcbe` (`publish.ts dayPendingItemsIn` pairs a request's filing
with the ground row whose `src` is that request; an issued AL stores `ukinds`; `pendlist.ts` words the pair as the
request). Builder: Opus 5.5 (the earlier chat). This check: Opus 5.5 (host, walk); Fable 5.1 and Astra read, blind to
each other (brief `docs/superpowers/briefs/2026-09-25-d114-read-brief.md`, round 2 below).

### 9.1 The tier — FULL
1 money **NO** — the stored diff (what goes out), the OIL axis and the signature binding are untouched; only the
unit a person counts in moves · 2 published record **YES** — an issued AL now stores `ukinds` and its `units` change ·
3 saved data **YES** — `ukinds` is persisted on every AL and every withdrawn record · 4 shared drawer **YES** — one count
read by nine surfaces · 5 gesture **NO** — the doors (✕, Accept, Undo, → Unavail, delete) are unchanged · 6 surface
**NO** · 7 roles **NO** · 8 warning list **NO**. → **FULL** (2, 3).

### 9.2 The rules that apply
| ruling | in plain words | where it bites here |
|---|---|---|
| D114 | ✕ on an accepted request's row is ONE change on every count (day head, board, ⓘ, Amendments panel, "Discard N edits", the list's ONE line, the published AL's count); the mirror (Accept) is one; a filing with no row of its own on the day stays one | the whole change |
| D109 (AM23) | every count reads ONE body, in the unit a person counts in; the stored diff is unchanged | the pairing lives in that body — anything that counts without it disagrees |
| D113 | a replacement in one seat is one | unchanged by this |
| D98, AM20 | a day back to what was issued shows nothing pending; the load gets it there | ✕ then Accept again, and the load, must read 0 |
| D103 (AM13) | anything pending wipes the four sign-offs | the binding reads the comparison, not the count — must be unchanged |
| D99, D100, D119 | the list: what will go out, where, before → after, who and when; a tap goes there | the paired line's words and its tap |
| D56 | a harm only in stored demo data is not a finding | an AL issued before `a95afcbe` has no `ukinds` and reads its diff's split |
**Clashes:** none found — D114 refines D109's unit; nothing it sets aside.

### 9.3 The roll-call — every place the count or its words are drawn
| # | surface | shows the ONE count? | usable (tap) | painted with it | status |
|---|---|---|---|---|---|
| 1 | the edit week's day head "N pending ▾" | reads `dayShownPendCount` → the items | opens the list | the Not-yet-signed marker, the plans selector | has it |
| 2 | the board's strip "N pending ▾" | same body | opens the list | the sign-off pills | has it |
| 3 | the ⓘ day panel | same body | — (a panel) | the version tags | has it |
| 4 | the Amendments panel's waiting line "Mon · N changes" | `itemCounts(dayPendingItems)` | — | Publish / sign buttons | has it |
| 5 | the sign-off line's "N changes to publish" | `dayShownPendCount` | — | the four pills | has it |
| 6 | the pending list: head "Waiting to go out as AL1 · N changes" and its lines | its rows ARE the items | a line taps to its row (an add); a removal has no row | the scrolled schedule behind | has it — **but see finding D114-2** |
| 7 | "Discard N edits & load" (the week and the board, previewing a version) and the preview's "N pending" chip (PVND) | `dayDiscardCount` — content units + each filing the load puts back, **counted apart** | the confirm | the preview bar | **MISSING — finding D114-1** |
| 8 | the publish message "Published AL1 · N items" | `alIssue units` = the items | — | a toast | has it |
| 9 | an issued AL's line in the Amendments panel "AL1 Mon · N items · N removals" | `units` + `ukinds` stored at issue | — | the sign title | has it |
| 10 | the plans menu / version tags "AL1 · N items" | `alCount` (units) | — | — | has it |
| 11 | the plan-switch message "… N differences from AL1 pending" | `dayShownPendCount` | — | a toast | has it |
| 12 | View-only Sched's working-draft peek count | `dayShownPendCount` (0 on the issued face) | — | — | has it |
| 13 | a withdrawn AL's record (Unpublish / Undo of a publish) | `retireIssued` copies `units` and `ukinds` | — | — (read back by a re-publish / redo) | has it — not drawn by itself |

### 9.4 The door check — every act that makes (or unmakes) the pair
| act | door on screen | expected |
|---|---|---|
| take a request off | ✕ on its ground row (week, board); "Undo" beside it in the Personal Inputs group | 1 · one line "whose · what: on the programme → taken off" |
| put a request on | "Accept" / "→ Ground" in the Personal Inputs group | 1 · one line, taps to the row |
| file under Unavailable | "→ Unavail" (an Other request) | 1 — a filing with no row |
| delete the request | ✕ on the Inputs page | 1 · **the line must still say whose and what — finding D114-2** |
| edit the request | the Inputs page | its changed boxes only (the row keeps its id) |
| ✕ then Accept again | the two doors | 0 (AM20) |
| Undo / Redo of each | the top bar | back to 0 / back to 1 |
| load the issued version | a version preview → Load | "Discard 1 edit" → 0 pending |
| publish AL1 with it | sign, Publish | "Published AL1 · 1 item", the line "1 item · 1 removal" |
| a request covering two days, its row on one | ✕ | 1 on each day (the other day's is a filing on its own) |

### 9.5 Found before the walk, by the roll-call (reproduced in a unit probe on the exact revision)
- **D114-1 (new in `a95afcbe`)** — "Discard N edits" (and the preview's chip) reads **2** where the day head reads **1**,
  after ✕ and after Accept: `dayDiscardCount` adds the load's filing put-backs to the content units without the pairing.
- **D114-2 (new in `a95afcbe`)** — a request DELETED from the Inputs page: its row and its filing pair into one line,
  and that line reads only "A request · on the programme → not on the programme" — whose and what are lost (before, the
  row's own line named it).
