# Evidence sheet — the five-flags batch (26 Sep 26)

Branch `claude/five-flags-batch-build-ef7d85` (from `main` at `e27e15fe`). Five backlog items as one batch, on his
instruction of 26 Sep 26 ("build all five as one batch (D164 and D160 are my yes), then walk and check them per the
bug-check order"): **[PUCK-FLAG-GLOW]** (D164), **[LW-RESET-ORDER]** (D160), **[CROWD-SWAP-SAYS-BUSY]**,
**[VIEW-ARROW-OVER-LIST]**, **[BG-GUARD-FALSE]**. Built by Opus 5.5; scenarios by Fable 5.1
(`docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md`); the walk fanned out to four Opus walkers
(`docs/superpowers/briefs/2026-09-26-five-flags-walk-brief.md`); the code read by Fable and Astra (§8). Pictures:
`docs/img/handpass/2026-09-26-five-flags/`.

## 1. The eight questions and the tier

| # | Question | Answer, with the reason |
|---|---|---|
| 1 | Money (OIL) | NO — no item reads or writes what a man earns; the rings, the order, the busy reason, the arrows and a hook |
| 2 | The published record | NO — nothing published, signed or amended changes; a swap on a published day still counts through the funnel as before (walked, F4) |
| 3 | Saved data | **YES** — Reset order clears the Leave War's saved roster order (`rosterorder`, persisted) |
| 4 | A shared drawer | **YES** — the "this is you" ring rule applies wherever a puck is drawn |
| 5 | A new gesture or control | **YES** — Reset order (a new control, with an armed state) |
| 6 | A new surface | NO — a line in an existing sheet; no new screen |
| 7 | Roles | **YES, by the letter** — a new admin-only action (through the existing admin-only writer; the ⚙ sheet is admin-only). No rule of who-may moves: `perms.ts` / data-model §11 untouched |
| 8 | The warning list / how a rule is read | **YES** — how the "already on" busy check reads a man's own row, and the seat he is leaving (the picker's reason, the drag caption, the drop toast, the green rings) |

**Tier: FULL** (questions 3, 7, 8). Fable's reading (its §0): FULL for item 3, WALK for 1, 2 and 4, NONE for 5 — the
builder keeps FULL for the batch, which is the stricter of the two.

**The server question (D202):** no rule of who-may-do-what moved; `perms.test.ts` and `perms-scan.test.ts` run green
(§7). No §11 row touched.

## 2. The rulings that apply (the rules sweep)

| Ruling | What it asks of this batch | Walked in |
|---|---|---|
| **D164** (24 Sep 26) | "a flagged puck does not glow … like the 2nd puck picture" — the "this is you" puck's red glow goes; the purple fill (and the purple ring when unflagged) stays | W1 |
| **D160** (24 Sep 26) | a "Reset order" line in ⚙ Settings; the Auto-sort BUTTON and the on-grid strip stay gone (6 Sep 26, "don't re-add the button or the strip without his ask") | W2 |
| 6 Sep 26 (leave-war §Settled) | admin config lives in ONE ⚙ Settings; rearranging is on the grid; no Auto-sort anywhere | W2 |
| Product invariant (7 Aug 26) | a clicked warning lights its crew in the warning colours (`.puck.wfoc` keeps its red glow — a focus, not a flag) | W1 (negative) |
| 11 Aug 26 | the picker and the warning list may not drift ("is he busy at THIS hour") | W3 |
| 5 & 7 Sep 26 (reviewer, adopted) | a drag's hover describes the week AFTER the move (`fromKey`) | W3 |
| 23 Aug 26 (scheduler §Week navigation) | desktop arrows walk EVERY live day to the front; the week ends on a whole day; one press = one day | W4 |
| 2 Sep 26 (Standing UI rules) | a control tapped repeatedly must not move under the finger — the arrows keep their place | W4 |
| D162 (24 Sep 26) | the background-command guard | §5e |
| D228 (26 Sep 26) | the full checks take turns through one lock | §7 |
| D56 | demo-data harm is not a finding | all |

No clash between a new behaviour and a ruling was found in the build.

## 3. The roll-calls

### 3a. [PUCK-FLAG-GLOW] — a puck that is BOTH "this is you" and flagged
The "you" class goes on every `.puck[data-person]` after a repaint (`ui/highlights.ts`), so the rule reaches every
drawer by construction; the ring rule is CSS. Fable's table (§2.1) is the roll-call; W1 marks each row.
*(W1's marks: §5a.)*

### 3b. [LW-RESET-ORDER] — where the roster ORDER is drawn, and the door
Drawn in: the Leave War grid (frozen name column, `Matrix.tsx` twice) and the OIL tracker sheet (`OilTracker.tsx`).
Written by: `setRosterOrder` (the one admin-gated writer) via the grid drag, the category drag, and now
`resetRosterOrder`. Door: ⚙ (admin) → "Roster order" → Reset order. *(W2's marks: §5b.)*

### 3c. [CROWD-SWAP-SAYS-BUSY] — every consumer of the busy check
`slotBar` callers: the drag caption (`drag.ts hoverWhy`, with the from-seat), the drop toast (`barDrop`), the armed
palette (`palette-html.ts` — strike, reason, count, rank), the palette tap (`state/view.ts` placeArmed), the green rings
(`highlights.ts paintSelRings`). The validator's leaving-seat tests (`crossDayIfPlaced`, `restIfPlaced`) share the one
key shape (`engine/keys.ts seatRow`). *(W3's marks: §5c.)*

### 3d. [VIEW-ARROW-OVER-LIST] — every landing, every edge-docked control
Landings that put a day at the front: `pan.ts panDays` (arrows, whole steps from the padding), `state/view.ts
scrollWeekToDay` (page-switch carry, week-jump to a day), `scrollWeekToLanding` (a next-week preview click — lands at
the x it was clicked at), `ui/highlights.ts bringIntoView` (a warning tap, a change tap), `weekLeftDay` (which day is
"at the front" — the palette follow and the carry). *(W4's marks: §5d.)*

## 4. Break tests (bug-check order §8.4) — one red per wired place

| Wire | How it was broken | What went red |
|---|---|---|
| The ring rules (D164) | `main`'s stylesheet (red first) | `flagglow-css.test.ts`: 3 of 5 |
| The programme key shape | `main`'s `selfKey` (red first) | `crowdself.test.ts` 6, `runtrace.test.ts` 1 |
| The busy scan's from-seat | `main` (red first) | `crowdself.test.ts` "the hover reads the week AFTER the move" ×3 |
| The cross-day "his only event" compare | the raw compare restored | `runtrace.test.ts` (programme, extra, sim, desk) |
| Reset order's store half | before the function existed (red first) | `roster.test.ts` ×3, `undoaudit.test.ts` ×1 |
| Reset order's line in ⚙ | before the line existed (red first) | `settingssheet.test.tsx` ×3 |
| The week's left padding | `padding-left` put back to 20px | `geometry.spec.ts` "sit clear of the ‹ arrow" (1500, 1024): at rest |
| The page-switch landing | `weekInset` taken out of `scrollWeekToDay` | the same test: Edit Schedule at rest (the carried day) |
| The warning-tap landing | `weekInset` taken out of `bringIntoView` | the same test: "a warning tap lands its day clear of the arrow" |
| The guard | — (tooling) | `node --test .claude/hooks/bg-cwd-guard.test.mjs`: 11 cases, from two starting folders |

## 5. The walk

Fanned out to four Opus walkers under the PC-wide lock (D228, taken 12:42Z after the absence-record chat's walk, released
after the re-walks), each on the production bundle at `http://localhost:4176` in its own browser contexts, desktop
1440×900 (plus 1024×700 and 1920×1080 for the arrows) and phone 390×844 (touch through CDP). Their tables, with every
check and picture, are `docs/handpass/parts/2026-09-26-five-flags-w1.md` … `-w4.md`; their scripts
`scripts/handpass/ff-w1.mjs` … `ff-w4.mjs` assert the right behaviour, so re-running one is the re-walk. The browser
error list stayed empty in every world of every walker.

| Walker | Item | First walk | What failed | Disposition | Re-walk (`…/rewalk/`) |
|---|---|---|---|---|---|
| W1 | [PUCK-FLAG-GLOW] | 64 pass · 0 fail · 72 pictures | — | — | not needed (no code of its item changed after) |
| W2 | [LW-RESET-ORDER] | 97 pass · 0 fail · 60 pictures | — (a note: both "Really reset?" could stand at once) | **fixed** — arming either takes the other back (`settingssheet.test.tsx`, red first) | F11: 20 pass · 0 fail |
| W3 | [CROWD-SWAP-SAYS-BUSY] | 123 pass · 5 fail · 63 pictures | **F6-d, NEW:** Ranger from the crew list onto Reaper's puck in the crowd Ranger was in → Reaper replaced by a second Ranger, silently (the fix had removed the accidental busy words); F6-a, F6-b (same on main): a second copy via the crowd's "+ add"; F20-sc-3/4 (same on main): the SC shift caption named the shift he was leaving | **fixed:** one man, one place on a row (`avail.ts`, `slots.ts rowPlaces`/`lastFilled`, `drag.ts`, `view.ts placeArmed`, `palette-html.ts`); the SC shift scan reads the seat he leaves. F6-a/b still PLANT a second copy — now named on the caption, the toast and the crew list — per "everything plants, warning after" (13 Aug 26): **his question, the look card** | f6 4/2 (the two "never listed twice" — his question), f20 9/0, f4d 22/0, f2d 10/0, f2p 11/0, f5 6/0 |
| W4 | [VIEW-ARROW-OVER-LIST] | 1838 pass · 2 fail · 284 pictures | **F-W4-1, NEW:** on Edit Schedule a warning tap on a man fully visible beside the crew palette swung the week sideways (the right-hand room applied where the › floats over the palette) | **fixed:** the right room counts only where the › sits over the week (`weekInset`, `weekinset.test.ts` red first); the room is declared on the LEFT only (a declared right room made scrollIntoView nudge 34px — the first re-walk's find) | warn+pend: 95 pass · 4 fail — the four are W4's stricter "every lit puck in view" (the man's second puck, in the Unavailable block far down and behind the palette): the app brings the warning's OWN puck into view, and `main` does the same; read against the new flow, not a regression |

**Every finding was reproduced by the builder** before it was entered: F6-d by the engine test (the caption and the
toast words) and W3's re-walk; F-W4-1 by W4's re-walk before and after the fix; F20-sc by `crowdself.test.ts` (red with
the real `main` words "on SC AM 07:00–13:00 — inside this shift").

**Observations the walkers made, not failures of this branch** (for the look card or the backlog):
- W1: on the signed-in man's own puck the purple "this is you" ring REPLACES the amber advisory ring, the thin red ring
  and the grey note ring (only the letter chip shows the flag) — pictures `w1/D1-*`, `w1/D2-*`; the dotted cause ring
  sits over the purple ring and its purple glow (`w1/C2-…-mon-dotted-you`); in OIL mode the green OIL ring on his own
  puck is hidden the same way (`w1/F9-…`); a dragged flagged puck (anyone's) loses the ghost's dark "lifted" shadow
  under its red ring's `!important` (`w1/B2-…`). All the same on `main`.
- W2: the Undo bubble reads "Undid: a change to the leave board" (the generic Leave War words — [AMEND-SMALL-SEEN]
  item 2); an armed line survives a page switch without closing the sheet (as Reset counters does); under a SAVED hand
  order a newcomer sinks to the foot of his seat (the branch now offers the cure: the line lights). "Sidewinder" is cut
  on the phone (unrelated).
- W3: a swap inside one crowd on a published day reads **1 pending** ("… order changed"), not 2 — the amendment batch
  settled that the same members in a new order is one item; D109's "a swap is two moves" is about two different places.
  An ALL AVAIL placed on an open-ended row (no end time) shows no count chip (W1, not investigated — likely D31).
- W4: the day before the front one now shows a 42px strip at the left, around the ‹ arrow (8px on `main`) —
  `w4/GUTTER-prevday-tail-view-*`; "day a–b of 7" counts a third day that shows 212px at 1440; straight after a window
  resize a day can sit partly under the ‹ until the next press (a resize never re-lands the week); a free trackpad
  position can leave a day under the ‹ (the desktop week does not snap, by design); the › arrow sits over the last
  visible column on View-only and over the crew palette's right edge on Edit (unchanged).

### 5e. [BG-GUARD-FALSE] — walked live, in this session's own harness
- A bare background `npm --version` from this chat (started at the worktree's root) was **refused**, and the refusal
  named `C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85` as the folder the shell starts
  in and gave the full-path forms.
- The refusal's own Bash form, backgrounded, **ran** (npm 11.19.0; `pwd` printed the worktree's `raptor-port`).
- The measurement behind the fix, the same afternoon: a foreground `cd raptor-port`, then a background `pwd` →
  the worktree's ROOT (not `raptor-port`, not the main checkout).

## 6. What was NOT walked, and why
- **A real iPhone / Safari** — every finger drag and swipe was Chromium's emulated touch (W1, W2, W3, W4). For the look
  card: the phone week is untouched by the branch (measured: 12px padding, no arrows, the same glide), but only his
  phone proves Safari's landing.
- W1: the order sequence at phone width; the ALL AVAIL window and the 👁 look at phone width; blue selection as a
  second way the purple yields (the chip covers the same path); Fable's rows 15–17 (no flagged "you" puck can exist).
- W2: the drawer's figure-column drag (the same order function as the drag-select, walked); F11/F12/F18's war switch
  and SANS at phone width (width-independent logic); keyboard reach; a second admin in another browser; folded groups;
  posted-out or archived men.
- W3: an AVALON seat ↔ desk swap ("+ Wave → AVALON" made no desk); a sim passenger line with a front seat (the demo
  rows have none); `main` itself (not served — every "same on main" is a reading of `git show main:…`, and the
  engine tests that went red on `main`'s code).
- W4: dragging the foot bar's thumb (headless Chromium draws none — its ‹ › buttons and a trackpad pan were walked);
  the ALL AVAIL window's dock (fixed top-right, above the arrows, unchanged); the no-pan check on View-only; 1920×1080
  for the warning taps, the pending jump, the chips and the board close.
- The re-walks covered only what the fixes touched (§5, last column).

## 7. The gates
*(One full run on the final code, under the lock.)*

## 8. The code reads (Fable and Astra, blind to each other, with this sheet)
*(After the walk.)*

## 9. His look
*(The card, last.)*
