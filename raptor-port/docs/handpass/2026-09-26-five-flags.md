# Evidence sheet — the five-flags batch (26 Sep 26)

Branch `claude/five-flags-batch-build-ef7d85` (from `main` at `e27e15fe`); the re-walk after the reads and the gates
(§5, §7) on `claude/five-flags-batch-continue-2cfa70`, started from it, which carries the PR. Five backlog items as one batch, on his
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
| The guard | — (tooling) | `node --test .claude/hooks/bg-cwd-guard.test.mjs`: 14 cases (order, start folders, lookalikes), from two starting folders |
| Reset order's two arms (W2) | before `disarmCounterReset` existed (red first) | `settingssheet.test.tsx` "arming one reset takes the other one's question back" |
| One man, one place on a row (W3 F6) | before the check existed (red first) | `crowdself.test.ts` ×5 |
| The landed place after an append | `placeArmed` asking of the row again | `store.test.ts` "an armed crowd: an ordinary add is planned…" |
| The crew list's armed key | the `.+` stripped again | `palette.test.ts` "an armed crowd strikes a man already in it" |
| The SC shift scan's leaving seat (W3 F20) | `main`'s scan (red first) | `crowdself.test.ts` "an SC shift drag…" |
| The › arrow's room (W4) | before the arrow was measured (red first) | `weekinset.test.ts` ×2 |
| A copy left behind (Astra 1) | before `leaves` (red first) | `crowdself.test.ts`, `runtrace.test.ts` |
| The severity rings in the ring test (Astra 4) | a glow added to the grey ring | `flagglow-css.test.ts` "every ring rule…" |
| His own flagged puck's glow (Fable 1) | before `.puck.me.warn,.puck.me.boxdot` (red first) | `flagglow-css.test.ts` "the shadow that wins…" |
| The five older browser tests' "front" (§7) | `weekInset` taken out of `bringIntoView`, on the tests as updated | `geometry.spec.ts` "the week lands on the day, on its snap point…": −54 (restored, 9 / 9 green) |

## 5. The walk

Fanned out to four Opus walkers under the PC-wide lock (D228, taken 12:42Z after the absence-record chat's walk, released
after the re-walks), each on the production bundle at `http://localhost:4176` in its own browser contexts, desktop
1440×900 (plus 1024×700 and 1920×1080 for the arrows) and phone 390×844 (touch through CDP). Their tables, with every
check and picture, are `docs/handpass/parts/2026-09-26-five-flags-w1.md` … `-w4.md`; their scripts
`scripts/handpass/ff-w1.mjs` … `ff-w4.mjs` assert the right behaviour, so re-running one is the re-walk. The browser
error list stayed empty in every world of every walker.

| Walker | Item | First walk | What failed | Disposition | Re-walk (`…/rewalk/`) |
|---|---|---|---|---|---|
| W1 | [PUCK-FLAG-GLOW] | 64 pass · 0 fail · 72 pictures | — | — | after the reads (Fable F1 changed its rings): A 10/0, C 8/0, D 4/0, F 12/0 — see below |
| W2 | [LW-RESET-ORDER] | 97 pass · 0 fail · 60 pictures | — (a note: both "Really reset?" could stand at once) | **fixed** — arming either takes the other back (`settingssheet.test.tsx`, red first) | F11: 20 pass · 0 fail |
| W3 | [CROWD-SWAP-SAYS-BUSY] | 123 pass · 5 fail · 63 pictures | **F6-d, NEW:** Ranger from the crew list onto Reaper's puck in the crowd Ranger was in → Reaper replaced by a second Ranger, silently (the fix had removed the accidental busy words); F6-a, F6-b (same on main): a second copy via the crowd's "+ add"; F20-sc-3/4 (same on main): the SC shift caption named the shift he was leaving | **fixed:** one man, one place on a row (`avail.ts`, `slots.ts rowPlaces`/`lastFilled`, `drag.ts`, `view.ts placeArmed`, `palette-html.ts`); the SC shift scan reads the seat he leaves. F6-a/b still PLANT a second copy — now named on the caption, the toast and the crew list — per "everything plants, warning after" (13 Aug 26): **his question, the look card** | f6 4/2 (the two "never listed twice" — his question), f20 9/0, f4d 22/0, f2d 10/0, f2p 11/0, f5 6/0 |
| W4 | [VIEW-ARROW-OVER-LIST] | 1838 pass · 2 fail · 284 pictures | **F-W4-1, NEW:** on Edit Schedule a warning tap on a man fully visible beside the crew palette swung the week sideways (the right-hand room applied where the › floats over the palette) | **fixed:** the right room counts only where the › sits over the week (`weekInset`, `weekinset.test.ts` red first); the room is declared on the LEFT only (a declared right room made scrollIntoView nudge 34px — the first re-walk's find) | warn+pend: 95 pass · 4 fail — the four are W4's stricter "every lit puck in view" (the man's second puck, in the Unavailable block far down and behind the palette): the app brings the warning's OWN puck into view, and `main` does the same; read against the new flow, not a regression |

**The re-walk after the code reads** (27 Sep 26, on the final build `index-C-k_umJP.js` at `http://localhost:4176`, the
fixes of §8 in; single scripts, no lock needed). Pictures in `…/rewalk/w1/` (28, new) and `…/rewalk/w3/` (37 of its 58
retaken). The browser error list stayed empty in every part.

| What the reads' fixes touched | Re-walked | Result |
|---|---|---|
| F1 — his own flagged puck loses the glow for EVERY kind of flag | W1 A (the card's before / after), C (solid, dashed, dotted, as Outlaw), D (amber, thin red, grey, as Wildcard and Static), F (the orders: flag on / undo / redo, a chip, publish, reload, the Leave War row, OIL mode) | **34 pass · 0 fail.** The notes that had described the old glow became checks before the run (C2g, D1g, D2g: the purple ring, no blur layer) and pass; the pictures show it (`rewalk/w1/C2-…-mon-dotted-you`, `D1-…-amber-you-beside-tally`; unflagged, `F1-desktop-you-no-flag` still glows) |
| A1 / F3 — a man with a copy left on the row does not leave it; the crew-rest strip takes his entries only | W3 f1a–f1e (the 7-day run across every kind of row he can leave), f3 (four overlapping targets), f20 (the leaving seat: desk, ground extra, sim, the info row, SC shifts) | f1a–f1e 35 / 0, f3 21 / 0, f20 9 / 0 |
| A1 on the crowd rows | W3 f6 | 4 pass · 2 fail — the same two as the first re-walk (F6-a, F6-b: a second copy is planted, named on the caption, the toast and the crew list — "everything plants, warning after", 13 Aug 26). **His Q1**, not a regression (`rewalk/w3/f6-a-after-palette-drag.png`) |
| A2 / A3 — the guard's order and starting folders | no app surface — `bg-cwd-guard.test.mjs` in the gates (§7) | — |
| A4 — the ring test walks the severity rings | a test only — `flagglow-css.test.ts` in the gates (§7) | — |

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
- The re-walks covered only what the fixes touched (§5, last column). After the reads, W1's B (every surface drawing
  a SOLID-red "you" puck), E (the member's own puck) and G (the finger ghost) were not re-run: Fable F1's new rule sits
  BEFORE the red rings, so a solid-red "you" puck draws exactly as the first walk saw it — the ring test pins that
  order ("the shadow that wins", `flagglow-css.test.ts`), and W1 A and F re-read the solid ring green.

## 7. The gates
One full run on the final code under the PC-wide lock (D228; `gatelock.mjs run`, 27 Sep 26, `E2E_PORT=4193`, on
`claude/five-flags-batch-continue-2cfa70` at `a0a164a3`, the bundle the re-walk drove, `index-C-k_umJP.js`):

| Gate | Result |
|---|---|
| unit (`vitest run`) | **6237 / 6237**, 382 files — `perms.test.ts` and `perms-scan.test.ts` among them (the server question, §1) |
| build | clean |
| tfin (the original's assertions) | **728 / 0** |
| e2e | **469 passed, 5 failed**, 48 skipped — see below; after the five tests' fix, the whole suite again: **474 passed, 0 failed**, 48 skipped |
| smoke (the Tracker) | **443 / 0** |
| rulecheck | OK |
| docsize | OK — `Docs: OUTSTANDING 73 items (+6 −5, −5 all in ARCHIVE) · DECISIONS D1–D222 · homes OK` |
| the guard's own tests (`node --test .claude/hooks/bg-cwd-guard.test.mjs`, not in the gate set) | **14 / 14** |

**The five that failed — all older tests of where the desktop week comes to rest, all failing on the batch's own
change, none a wrong landing.** [VIEW-ARROW-OVER-LIST] moved "the front" 54px in from the week box's left edge, beside
the ‹ arrow (the week's declared scroll-padding). These five still measured from the box's edge:
- "clicking a warning … on its snap point" — the day landed **exactly 54px in** (offset 54 where it asked 0);
- "desktop: Edit Schedule opens on the day View-only was showing", and "and back the other way" — the app carried the
  right day (its own reading is beside the arrow); the test's reading picked up the **previous day's 42px strip** in
  that room (his Q3) and named the day before;
- "the week ends whole …" and "› steps one clean day at a time …" — the jammed end fronts a whole column **exactly 54px
  in** (asked < 40 from the box's edge; they guard against a sliver of hundreds of px).

**Disposition — the tests' front moved to the app's front**: each reads the same declared room the app reads
(`getComputedStyle(week).scrollPaddingLeft`, 0 on a phone), with the assertion itself unchanged (exact 0; < 40). The
stepping test's own "front day" reading moved with it. The five (and their phone twins, and the two "sit clear of the
‹ arrow" tests) then ran **9 / 9**; the break test in §4 turned the snap test red (−54) with the landing broken, and
green again once restored. Nothing in the app changed after the gate run — only `e2e/geometry.spec.ts`. The whole browser suite was
then run again under the lock on the same bundle: **e2e 474 passed, 0 failed, 48 skipped** (3.4 min).

**What this found about the method:** the walk and the new test measured the landing against the arrow; the older
tests that measure it against the box were not run before the reads (this sheet's §7 was empty at the handoff, and the
first full browser run on the branch was this one). The order's "gates" step between the walk's fixes and the reads
(§5 of the order) would have shown it a round earlier.

## 8. The code reads (Fable and Astra, blind to each other, with this sheet)

Both read the finished code with this sheet in hand (brief `docs/superpowers/briefs/2026-09-26-five-flags-read-brief.md`),
started together, neither shown the other's report. Reports kept whole: `2026-09-26-five-flags-astra-read.md`,
`2026-09-26-five-flags-fable-read.md` (Fable read `9b7c5b94`, before Astra's fixes landed).

| # | Reader | Finding | New / on main | Disposition |
|---|---|---|---|---|
| A1 | Astra (medium) | A man on a row TWICE (a second copy is warned, not refused) did not leave it when ONE copy was dragged off: the busy scan excluded the whole source row, and the cross-day "his only event" and the crew-rest strip read the day as vacated | new | **fixed** — excluded only when he has no other place on that row (`avail.ts`, `validate.ts` `leaves`); `crowdself.test.ts`, `runtrace.test.ts` red first. = Fable 3 |
| A2 | Astra (medium) | The guard ignored ORDER: `npm test; cd raptor-port`, `cd raptor-port; cd ..; npm test` passed | on main | **fixed** — the line is followed step by step; every npm step must run inside (or carry its --prefix); 3 new test groups |
| A3 | Astra (low) | A chat started INSIDE raptor-port (`raptor-port/scripts`) was refused a bare npm | on main | **fixed** — any path component exactly `raptor-port` is inside; lookalikes refused. = Fable 2 |
| A4 | Astra (low) | `flagglow-css.test.ts` walked only the three red rings | new | **fixed** — the severity rings (`.warn`, `.warn.hard`, `.warn.note`) walked; break test red |
| F1 | Fable (medium) | The "this is you" puck still GLOWS when flagged by the dotted cause ring (and by the amber / thin red / grey rings its purple ring stands in for); the ring test passed vacuously (it looked only at rules declaring a shadow) | on main | **fixed** — flagged, his puck keeps the purple ring without the blur (`.puck.me.warn`, `.puck.me.boxdot`, before the red rings so they still win); the test now checks the shadow that WINS for each kind of flag, red first. The item's own words ("no flagged puck should glow"). Q2 on the card (should the severity ring show instead of the purple one) is unchanged |
| F2 | Fable (low) | = A3 | — | fixed with A3 |
| F3 | Fable (low) | = A1, plus: the crew-rest strip removed EVERY man's entries on the from-row | new | fixed with A1; the strip now takes his entries only |
| F4 | Fable (low) | Reset order can light for a man the grid is not drawing this month (posted out / not yet arrived — the grid filters by the visible window, the check reads the whole roster); a press changes nothing on screen | new (the line is new) | **left** — rare, harmless (the press clears a stored order that does differ for that man), and giving the sheet the grid's window would couple the two; Fable: "leaving it is defensible" |

Explicit negatives from both (their reports list them): no other key-shape compare left; every landing reads the room;
Reset order's gate, Undo, reload and war switch consistent; no other ring rule in any stylesheet; no vacuous test left
after F1/A4.

## 9. His look — five minutes, on the branch's Vercel link, pictures first

**Look here** (desktop, signed in as `ad`; the phone looks exactly as before):
1. **Your own puck doesn't glow when it carries a flag.** Edit Schedule, Monday: your purple Saber puck with its red
   "C" has the same plain red ring as Ranger's beside it — no red haze; with any other flag (amber, grey, the dotted
   "causes tomorrow's breach") it keeps its purple ring but no glow. Unflagged, it still glows purple. Before / after: `docs/img/handpass/2026-09-26-five-flags/w1/A-desktop-before-main-saber-you-glows-beside-ranger.png` → `…/A-desktop-after-branch-saber-you-beside-ranger.png`; another flag (amber): `…/rewalk/w1/D1-desktop-as-wildcard-mon-amber-you-beside-tally.png`.
2. **Leave War → ⚙ → "Roster order".** Greyed, "In the default order". Rearrange (⇅), drag a man down a block, open ⚙:
   Reset order lights; one tap asks "Really reset?", the second puts everyone back; Undo brings your arrangement back.
3. **Monday's board, FLIGHT SAFETY STAND-DOWN.** Add a second man, drag one onto the other: they swap and nothing says
   "already on". Then drag Ranger from the crew list onto the other man in that crowd: the warning names the row he is
   already on.
4. **View-only Sched, desktop.** Open Monday's "⚠ issues" list: its first letters sit clear of the ‹ arrow. Press ›
   a few times: every day lands beside the arrow. (`w4/L13-list-*`, `w4/L2-fwd*`.)

**Your questions — each is a choice the walk raised; nothing is built for any of them:**
- **Q1 — A man put on a row he is already on.** The app now WARNS ("already on FLIGHT SAFETY STAND-DOWN") but still
  plants the second copy, per your 13 Aug 26 rule "everything plants, warning after". Should it REFUSE instead — one
  man, once per row? (Recommended: refuse — there is no reason to have the same man twice on one row.)
- **Q2 — Your own puck's other warning rings.** On your purple "this is you" puck, the amber advisory ring, the thin red
  ring and the grey note ring are REPLACED by the purple ring (no glow now) — only the letter chip shows the flag
  (`w1/D1-*`, the first walk, before the glow went). Same on `main`. Show the warning's ring instead of the purple one
  whenever your puck carries a flag (the purple fill still says "you")?
  (Recommended: yes — the fill is enough to say "you".)
- **Q3 — The strip beside the ‹ arrow.** The day before the front day now shows a 42px strip at the left edge, under the
  arrow (`w4/GUTTER-prevday-tail-view-1440x900.png`) — it was 8px. Keep it (it hints there is a day to the left), or
  leave that strip empty? (Recommended: keep.)

**Only your iPhone can prove:** the phone week and its swipes are untouched by this branch (measured in Chromium), but
Safari's own landing after a swipe is yours to glance at.
