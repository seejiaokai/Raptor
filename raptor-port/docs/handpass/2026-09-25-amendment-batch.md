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

## 4. The walk — (filled from the walkers' reports and the host's reproduction)

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
