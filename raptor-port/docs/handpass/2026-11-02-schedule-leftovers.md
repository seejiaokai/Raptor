# The schedule leftovers — bug check (2 Nov 26)

Branch `claude/schedule-leftovers`, pull request 620. His pick of the next batch (D994: small fixes needing no answer from
him), four older finds on Edit Schedule; and D1573 recorded (cross-week dragging is not built — D1529 stands).

| # | The find | Item | The fix |
|---|---|---|---|
| 1 | A puck let go over nothing came off its seat without a word (the right-click says "Fable removed") | [OIL-NOTIFY-SEEN] (2) | `drag.ts applyDrop`: the right-click's words, batched with the drop's own warning |
| 2 | The crew panel's ALL / ALL AVAIL went out of the mouse's reach when a lower day was in view | [OIL-NOTIFY-SEEN] (3) | `11-drag.css`: the panel stays sticky during a drag; `03-week.css`: room at the page's foot so the full-height panel is not pushed under the bar |
| 3 | On a phone on its side a crew-list puck held at the top of the day pane never scrolled the pane | [OIL-NOTIFY-SEEN] (re-walk F S3-16) | `drag.ts tdOver`: a finger scrolls the box under it |
| 4 | The 👁 look at the Original read "1 pending" where the working copy read "2 pending" | [LOOK-PENDING-COUNT] | `html.ts`: the look prints the working copy's own count (PVPC); the Discard button keeps the discard count |

**Found while building (2):** the backlog's "chip out of reach" had a second, bigger cause — on a desktop, from the
moment ANY drag armed, the crew panel left its place under the top bar and went back to the top of the page (measured:
heading at 65px before, −925px mid-drag, scrolled 1200) — so a scheduler scrolled to a lower day could neither drag
ALL AVAIL from it nor drop a puck on its "drop to unassign" bin. And at the page's foot the panel was 86px under the
top bar, its D1116 heading hidden.

## The eight questions and the tier

1 OIL — no: nothing earned or counted changes. 2 the published record — no: (4) changes which existing number a look's
heading prints; nothing published, signed, issued or stored changes, and View-only Sched's issued face is untouched
(walked: no count, D8-5). 3 saved data — no. 4 a shared drawer — **yes**: the day head's strip (`dayStatHTML`) is drawn
by the week and the board. 5 a gesture — **yes** in effect: an existing drag's scroll and its ending change. 6 a new
surface — no. 7 roles — no. 8 the warning list — no (the removal note is batched with the drop's warning; nothing about
the warnings changes). **Tier: WALK.**

## The roll-call

| Surface | Shows the change | Usable there | Painted on the same pixels |
|---|---|---|---|
| (1) Edit Schedule week, desktop mouse, let go over a day head | YES — D1-1 "Warden removed" | YES — Undo, Redo (D1) | the toast sits at the foot, over nothing pressable (pointer-events none) |
| (1) the same, dropped back on its own seat | must not — it is no removal: "Already in that seat" (D2) | YES | — |
| (1) the Scheduler Board, desktop, let go over its bar | YES — D7-1 | YES — the board's Undo (D7) | the board's crew list wears "drop to unassign" mid-drag (kept: D7) |
| (1) the board, phone upright, a finger | YES — P2-1 (just after the lift), P2-2 | YES — Undo (P2) | — |
| (1) the board, phone on its side, a seat carried into the bar and back | YES — "Ranger removed" (S3: the pane had scrolled under the finger, so the way back met no seat) | YES — Undo | — |
| (1) a man of an input's row let go over nothing | must not — the door's own words (`reqdoor.ts rowTake`), unchanged | — | — |
| (2) Edit Schedule week, desktop, scrolled 900, a drag armed | YES — D3-1: heading 75 before and mid-drag, ALL AVAIL under the mouse | YES — D4: ALL AVAIL carried onto a row lower down, landed | the ghost; the panel's "drop to unassign" badge |
| (2) the same at the page's foot | YES — D5-1: heading 75 under the bar's 58; mid-drag the same | YES | nothing — the page no wider than the window (D5) |
| (2) the panel hidden (CREW tab), a drag | must not move — stays off the right edge (D6-1, absolute) | YES — shown again in place (D6) | — |
| (2) the board's own crew list, desktop | must not change — keeps `relative` and its badge (D7) | YES | — |
| (2) the phone's crew drawer (<821px) | must not change — the rules are desktop-only (P1 drags from it) | YES | — |
| (3) the board, phone on its side, a crew-list puck at the pane's top | YES — S1-1, slowly and as a quick flick (S2) | YES — S4: dropped on a row in the pane, landed | the ghost over the sign-off boxes |
| (3) the board on its side, a seat puck carried into the bar | YES — S3-1: the pane went on scrolling (kept the last box) | YES | — |
| (3) the week, phone upright, a crew-drawer puck at the foot | YES — P1-1: the page scrolled 0 → 320 | YES | — |
| (3) the mouse on a desktop | must not change — `!TD.mouse` (D1–D5 all mouse, unchanged behaviour) | YES | — |
| (3) the board's desktop layout on a phone (`TD.wide`) | must not change — its own loop already takes the box under the finger (`tdWideLoop`); `tdAutoScroll` is skipped there | — | — |
| (4) the week's look at the Original | YES — D8-2 "2 pending" beside the working copy's D8-1 "2 pending" | YES — Load armed reads "Discard 1 edit & load" (D8-3); Keep editing; ← Back to live copy (D8) | the read-only bar |
| (4) the board's look | must not — its strip under a look carries no count, as built (`board.ts boardSignBody` pv); D8-4 | YES | — question filed for him |
| (4) View-only Sched's issued face | must not — no count (AM24); D8-5 | — | — |
| (4) a draft plan's look (`d:`) | must not — a never-published day reads 0, as before (`dayApproved` guard; the chip's own `ok` gate) | — | — |

No MISSING.

## The sizing lines (§7.0)

1. **Type:** C (a drag's ending and scroll change) with D (the day head's count, two builders) and E (two style rules).
2. **Only a walk could find:** whether the panel really stays in place in a real browser at his PC's size, mid-drag and at
   the foot (jsdom has no sticky); whether a real finger's drag scrolls the right box on a short sideways screen; whether
   the note reaches the screen from each surface's drop; that the look's count and its button read rightly beside each
   other. The tests carry the exact numbers and the old code's failure.
3. **The ledger:** walks of type C on Edit Schedule's drags (D1529's week-drag walk, 31 Oct 26; the drag edge scroll,
   15 Oct 26) found their faults at the page's edges and on the phone — so the foot, the sideways phone and a quick flick
   are in.
4. **The walk chosen:** the host alone, one script, 29 checks: his PC 1536 × 730 at 1.25 (a mouse), an iPhone upright
   402 × 874, a phone on its side 844 × 390 (real fingers over CDP). The plain-user round: drag, drop, Undo, Redo, the
   look opened from the plans selector, Load, Keep editing, ← Back to live copy, the board opened and ✓ Done, View-only.
   Carried by tests (each red on the old code): `ui/drag.test.tsx` "a seat puck let go over nothing says it was removed"
   (the app's drop path, `applyDrop`, through the week's real markup); `ui/latepub.test.tsx` "the 👁 look at the Original
   reads the working copy's own N pending" (the app's commit path, then the look drawn — the exact 1-vs-2 of the find);
   `e2e/boardside.spec.ts` the page's foot, a puck picked up scrolled down, and the sideways phone (real mouse and real
   fingers in a real browser).
5. **After:** its row is in `docs/walk-ledger.md`.

**The §7.11 lessons, each against this change:** 1 (one state only) — the panel in four states (scrolled, foot, hidden,
board), the look armed and unarmed. 2 (one speed) — S2 the quick flick. 3 (feedback) — the note is the feedback (1).
4 (the page behind a window) — the look's bar is no window; the week behind stays as it was (D8). 5 (a box brought into
sight against what stands over it) — the panel against the top bar, measured with `elementFromPoint` (D3, D5). 6 / 7
(what only the phone draws; a motion the phone makes) — a finger's drag scroll is the app's own (`scrollTop`), not the
phone's; but the touch engine differs (§7.9), so his iPhone's look is on the card. 8 (a drawing) — no drawing for these.
9 (a list's alignment) — none drawn. 10 (a hidden page shown again) — the board opened and closed over the week (D7, D8).
11 (zoomed out) — none depends on how much fits. 12 (a window from each page) — the look opened from the week and the
board. 13 (a pinch part-way down) — none. 14 (boxes on the keyboard list) — none. 15 (a pinned bar's fill) — the
panel's heading under the top bar is the subject of D3/D5, its cap as built. 16 (a warning cleared by value) — none.
17 (a control that changes width) — the CREW tab pressed both ways mid-change, the page measured no wider (D6). 18
(print) — none. 19 (a window over a window closed) — the look's bar closed by Keep editing and ← Back (D8).

## The walk

`node scripts/handpass/sched-leftovers-walk.mjs 4180` on the built app (`npm run build`, served by `vite preview` on
4180). Pictures and `results.json`: `docs/img/handpass/2026-11-02-schedule-leftovers/walk/` (18 pictures). **29 checks:
29 PASS, 0 FAIL, 0 NOT WALKED.** Errors in the page: none at any size.

Two runs before it were the script's own mistakes, not the app's (§7): a count compared before its no-break space was
read as a space; Undo pressed on the page's button under the board instead of the board's own; a step on the sideways
board found no row inside a 200px pane until it scrolled one in. And the board's look was first expected to show a count
— it never has (its strip under a look is built without one); the check now asserts that, and the difference between
the week's look and the board's is filed for him.

**Engines (§7.9):** the finger walks are Chromium over CDP — WebKit's in-page touches drive no pointer events
(`docs/walk-scripts.md` §4). The change reads the element under the finger by hit-test (`elementsFromPoint`), never the
event's target, so Safari's habit of sending a touch's later events to the element it landed on does not reach it. His
iPhone's look: on the card.

## Gates

On his PC (D1086 — the repo is public, so GitHub's run is the full check): the 26 unit files near the change 669 / 669;
the 18 stylesheet test files 350 / 350; `e2e/boardside.spec.ts` the three new tests green, and red on the old code
(2 of the D1116 three, the sideways one); `npm run lint:changed` no new finding. **GitHub's run of pull request 620 on
`ffb7ea58f`: 25 pass, 2 skipping, 0 failing.**

## The code read

One fresh, blind Opus reader (D790), on `ffb7ea58f`, with the D56 rule in its brief. **No fault in behaviour.** Two
speed findings, both fixed (one-line guards, so no further read — the order's §5):
- **F1** — the look's new count was also worked out on View-only Sched's issued face, which draws every published day
  through the same swap on every redraw and shows no count there: now only for a look (`html.ts`, `!PVQ`).
- **F2** — a finger drag looked up its scroll box on every move (`performance.md`: nothing new per move): now only when the
  finger reaches another element, and never in the board's desktop layout on a phone, whose own loop scrolls (`drag.ts`).
- Noted, not changed: on a week shorter than the panel's full height, the panel now reaches up to 86px below the week's
  last card — the demo weeks are several screens long; no week that short was met.

**Re-walk of what the fixes touched:** `ONLY=SD node scripts/handpass/sched-leftovers-walk.mjs 4180` → pictures
`docs/img/handpass/2026-11-02-schedule-leftovers/walk/only-SD/` — 25 / 25 PASS; `e2e/boardside.spec.ts` whole, 15 / 15.

## For his look (his iPhone)

1. Edit Schedule on his PC: scroll down to a lower day, drag ALL AVAIL from the crew panel onto a row there.
2. His phone on its side, the Scheduler Board: hold a crew-list name at the top of the day pane — the pane should scroll.
3. Drag a puck off its seat onto nothing — "<name> removed" should show.
