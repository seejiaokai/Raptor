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

*(Filled from the four walkers' parts files, each finding reproduced by the builder before it is entered.)*

### 5e. [BG-GUARD-FALSE] — walked live, in this session's own harness
- A bare background `npm --version` from this chat (started at the worktree's root) was **refused**, and the refusal
  named `C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85` as the folder the shell starts
  in and gave the full-path forms.
- The refusal's own Bash form, backgrounded, **ran** (npm 11.19.0; `pwd` printed the worktree's `raptor-port`).
- The measurement behind the fix, the same afternoon: a foreground `cd raptor-port`, then a background `pwd` →
  the worktree's ROOT (not `raptor-port`, not the main checkout).

## 6. What was NOT walked, and why
*(Filled at the end.)*

## 7. The gates
*(One full run on the final code, under the lock.)*

## 8. The code reads (Fable and Astra, blind to each other, with this sheet)
*(After the walk.)*

## 9. His look
*(The card, last.)*
