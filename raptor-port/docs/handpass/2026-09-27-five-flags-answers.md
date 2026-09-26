# Evidence sheet — his answers to the five-flags look card, built (27 Sep 26)

Branch `claude/five-flags-batch-continue-2cfa70` (PR #445), on top of the five-flags batch
(`docs/handpass/2026-09-26-five-flags.md`, whose §9 look card he answered). Four of his rulings, built in one pass by
Opus 5.5 — commit `752781cb` and what follows it:

- **D275** "I still prefer these" — the room beside the ‹ arrow comes OUT (`[ARROW-ROOM-OUT]`).
- **D270** "Q2 yes" — on his own puck a flag's ring wins over the purple "this is you" ring; the purple fill stays.
- **D272** "question 2 yes" — in OIL Earn mode his own puck shows the green OIL ring; the purple fill stays.
- **D271** "Q1 refused" — a man put on a row he is already on is refused, at every door, with the reason.

Scenarios by Fable 5.1 (`docs/superpowers/specs/2026-09-27-five-flags-builds-scenarios-fable.md`); the code read by
Fable and Astra (§8). Pictures: `docs/img/handpass/2026-09-27-five-flags-answers/`.

## 1. The eight questions and the tier

| # | Question | Answer, with the reason |
|---|---|---|
| 1 | Money (OIL) | NO — D272 changes only the ring painted in OIL Earn mode (the mode's figures and switches are untouched); a refused drop writes nothing, so it cannot move OIL |
| 2 | The published record | **YES** — D271 decides whether a drop on a published day makes an amendment at all (a refusal must read 0 pending); walked on a published day |
| 3 | Saved data | NO — nothing new is stored; a refusal writes nothing |
| 4 | A shared drawer | **YES** — the "this is you" ring rule reaches every puck the app draws |
| 5 | A new gesture or mode | NO new control — but every existing door that puts a man on a row changes its outcome, so the door check runs (§3b) |
| 6 | A new surface | NO |
| 7 | Roles | NO — no rule of who may do what moved; `perms.ts` / data-model §11 untouched |
| 8 | The warning list / how a rule is read | **YES** — "already on this row" goes from a warning to a refusal (D271 narrows the 13 Aug 26 "everything plants, warning after") |

**Tier: FULL** (questions 2, 4, 8).

## 2. The rulings that apply (the rules sweep)

| Ruling | What it asks of this build | Walked in |
|---|---|---|
| **D270** (27 Sep 26) | flagged, his own puck wears the flag's own ring — amber, thin red, grey, solid / dashed red, the dotted ring ALONE — as another man's does; the purple fill stays; unflagged, purple ring + glow | W1 C, D, F |
| **D272** (27 Sep 26) | in OIL Earn mode his own earning puck shows the green OIL ring (full, or the half's outline); purple fill | W1 F9 |
| **D164** (24 Sep 26) | no flag ring glows, his own included | W1 A–G |
| **D271** (27 Sep 26) | one man, once per row: every door refuses, writes nothing, says why; a man on two different rows only warned; a swap inside a crowd still works; crew-list man onto another man's place in his crowd refused | W3 f6, W5 |
| 13 Aug 26 (ui-contracts §Arm-and-plant) | "everything plants, warning after" — still true for every other reason a name is darkened | W5 |
| **D33 / D47** (22 Sep 26) | the placeholder-on-a-cockpit refusal: the shape D271 copies (preflight at every door, both ends of a swap, the slot stays armed, the writer's belt) — and it must still work | unit (`oilseat-refusal.test.tsx`) |
| **D274** item 3 | a swap inside one crowd, no "already on" | W3, W5 |
| 11 Aug 26 | the picker and the warning list may not drift | W5 |
| **D275** (27 Sep 26) | no room beside the ‹ arrow; the day at the front flush at the left | W6, `geometry.spec.ts` |
| 23 Aug 26 (week navigation) | arrows walk every live day to the front; the week ends on a whole day; one press = one day | `geometry.spec.ts` |
| 7 Aug 26 invariant | a clicked warning lights its crew in the warning colours (`.puck.wfoc` keeps its glow) | unit (`flagglow-css.test.ts`) |
| D56 | demo-data harm is not a finding | all |

**A clash:** D271 NARROWS the 13 Aug 26 rule and D270 NARROWS the agent's reading of D164 — both his own later words
(D90); no other clash found.

## 3. The roll-calls

### 3a. The "this is you" ring (D270, D272) — where it is drawn, and what else paints there
The class goes on EVERY `.puck[data-person]` in the page after each repaint (`ui/highlights.ts refreshHighlights`, from the
View-only week, the Edit week and the board), and yields while a puck is selected or a highlight chip is on (`focusActive`)
and while a warning is focused (the loop returns before it). The ring is ONE stylesheet rule with no context, so it reaches
every surface by construction; what varies per surface is which ring classes the puck can carry.

| Surface | His puck can carry | Has it / must not, because… | Other paint on the same pixels | Walked |
|---|---|---|---|---|
| View-only week (`#vWeek`) | warn / hard / note, boxred, boxdash, boxdot | HAS — the flag's own ring (W1 C, D, E) | the letter chip; the OIL bar (a background image, unaffected) | W1 B–E, both widths |
| Edit week (`#eWeek`) | the same | HAS (W1 B, D, F) | the edit-seat hover outline (anyone's) | W1 B, D, F |
| The board (`#schedBoard`) | the same, + `oilglow` / `oildim` in OIL Earn mode | HAS — and the green OIL ring in the mode (W1 F9) | — | W1 B, F9 |
| A published version's look (👁, `.pv-frozen`) | the version's own rings when it wears its warnings (D187) | HAS (W1 B) | — | W1 B |
| The ALL AVAIL window | his puck, flags under it | HAS (W1 B) | — | W1 B |
| The crew list / drawer (`.rpuck .puck`) | the day's severity and chip (`palette-html.ts`: `sevOf`, `chipOf`) — so warn / hard / note / boxred | HAS — flagged, the flag's ring as on another man's; unflagged, the purple ring (which still beats the palette's standby / busy inset). *Corrected from "no ring classes" by Fable's roll-call A3.* | `.rpuck.standby` / `.busy` inset (beats a plain severity ring for anyone, as on `main`) | W1 B |
| The drag ghost (a clone) | whatever the puck had | the cyan veil rides a pseudo-element (unchanged); the ghost's depth shadow is lost under any flagged puck's ring — anyone's, the same on `main` (`[GHOST-FLAG-SHADOW]`, filed) | the lift veil | W1 B, G |
| The Leave War | no `.puck` — its own `tr.me` row | must not change (another app's row mark) | — | W1 F8 |
| Print / export, the guest view | no "you" (no highlights pass; a guest is no one) | must not have it | — | not walked (no path draws it) |

### 3b. The doors that put a man onto a row (D271)
| Door | Code path | Must refuse / must not, because… | Test (red when its check is removed) | Walked |
|---|---|---|---|---|
| Crew list → a place (mouse or finger) | `drag.ts applyDrop` seat branch, roster | REFUSE when he stands elsewhere on that row (reading 3) | `rowtwice-refusal` "…ANOTHER man's place…" | W3 f6-d |
| Crew list → the "+ add" cell | `applyDrop` cell branch, roster | REFUSE when he stands anywhere on that row | `rowtwice-refusal` "…'+ add' cell…", ground extras | W3 f6-a |
| A puck from ANOTHER row → a place (a swap) | `applyDrop` seat branch, slot — BOTH ends | REFUSE if either man would stand twice | `rowtwice-refusal` "a SWAP whose OTHER end…", "…the swap's OTHER end…" | W5 |
| A puck from another row → the "+ add" cell (a move) | `applyDrop` cell branch, slot | REFUSE | `rowtwice-refusal` "a puck from ANOTHER row…" | W5 |
| A puck inside its own row (swap, move to the end) | the same | MUST NOT refuse (reading 2) | `rowtwice-refusal` "a swap of two men INSIDE…", "…to the end…" | W3 f4d (published, undo, redo, reload) |
| The armed palette tap — "+ add" or an empty place | `state/view.ts placeArmed` (from `interactions.ts`) | REFUSE; the slot stays armed | `rowtwice-refusal` ×2, `store.test.ts` | W3 f6-b, f6-b2 |
| An append by any other caller | `slots.ts fillSlot` (the belt) | REFUSE — writes nothing | `crowdself.test.ts` ×2 | — (no other app caller) |
| A man on another overlapping ROW | the busy check | MUST NOT refuse — warned and planted (reading 1) | `rowtwice-refusal` "…two DIFFERENT rows…" | W3 f2d |
| An Unavailable row's reassign (`iu:`) | `reassignInput` | must not — it edits an input, not a row of places | — | — |
| An accepted request landing a row; a day template; a duplicated wave; a plan switched to; undo / redo | new rows or whole restored days | must not — none adds a man to an existing row through a door | — | — |
| `store.ts writeSlot` / `writeFill` | the command-layer writes | `writeFill` is belted (`fillSlot`); `writeSlot` is not — it has no app caller (tests only) | — | — |
| A placeholder (ALL, ALL AVAIL) twice on a row | `rowTwice` leaves them out | must not — not a man (D33: silent wherever it may stand); the agent's reading, on his card | `crowdself.test.ts` "a placeholder is not a man" | — |

### 3c. The landings that put a day at the front of the desktop week (D275)
`pan.ts panDays` (the arrows — whole day steps from the 20px padding), `state/view.ts scrollWeekToDay` (a page switch's
carried day, a week-jump — to the box's own edge), `weekLeftDay` (which day is at the front), `ui/highlights.ts
bringIntoView` (a warning or change tap that pans — to the box's own edge), `scrollWeekToLanding` (a next-week preview
click — at the x it was clicked). All back to `main`'s text; W6 measured each (R1–R7) at 1440 and 1024, and the phone
(R8); `e2e/geometry.spec.ts` (main's text) gates them.

## 4. Break tests (bug-check order §8.4) — one red per wired place

| Wire | How it was broken | What went red |
|---|---|---|
| His ring steps aside (D270 / D272) | the previous stylesheet (`HEAD~1`), and `main`'s | `flagglow-css.test.ts`: 2 of 9 (previous), 4 of 9 (main) |
| The crew-list drop onto a place | `twice(DRAG.id, targetKey)` removed | `rowtwice-refusal.test.tsx` "…ANOTHER man's place…" |
| The swap's first end (the man dragged in) | `twice(a, targetKey, DRAG.key)` removed, the other end kept | `rowtwice-refusal.test.tsx` ×2 ("a puck from ANOTHER row…" on a place, "a SWAP whose OTHER end…") |
| The swap's second end | `twice(b, DRAG.key, targetKey)` removed | `rowtwice-refusal.test.tsx` "…the swap's OTHER end: the man swapped OUT…" — added after the first break run found no test on it |
| The "+ add" cell | the cell branch's check disabled | `rowtwice-refusal.test.tsx` ×3 (crew list, from another row, a ground row's extras) |
| The armed palette tap | the `placeArmed` check disabled | `rowtwice-refusal.test.tsx` ×2, `store.test.ts` ×1 |
| The append writer's belt | the `fillSlot` line removed | `crowdself.test.ts` ×2 |
| The caption / crew list's early words (the busy check asks `rowTwice` first) | the `slotBar` line removed | `crowdself.test.ts` ×5 (the ⓘ row among them), `palette.test.ts` ×1 |
| A request handed to a man already on its row (Fable F1) | before the fix (red first: "Ranger once on the row: expected 2 to be 1") | `audit-e-commit-relink.test.tsx` "the relink never leaves a man on the row twice" |
| The ghost test's cascade reader (it could not read `:not()`) | — (a test learning a selector form, not a wire) | `lift-css.test.ts` "the puck's own picked-up-relevant states are !important" went red on the new stylesheet until it learned `:not()`; its assertion unchanged |

## 5. The walk

One host, single scripts (no fan-out, no lock needed), on the production bundle served at `http://localhost:4176`
(`index-hi3cpQTX.js` for W1, W6 and W3's first parts; `index-DvV0TZcY.js`, after Fable's F1 fix, for W3 f7–f10), desktop
1440×900 (W6 also 1024×768) and phone 390×844 (a real finger through CDP touch). The scripts assert the RIGHT behaviour,
so re-running one is the re-walk: `scripts/handpass/ff-w1.mjs` (updated to D270 / D272), `ff-w3.mjs` (f6 updated to D271;
f7–f10 new), `ff-w6-arrow.mjs` (new). Pictures: `docs/img/handpass/2026-09-27-five-flags-answers/` — w1 (72), w3 (37),
w6 (4). The browser error list stayed empty in every part.

| Walk | What it drove | Result | What failed first, and its disposition |
|---|---|---|---|
| **W1** — the rings (all parts, A–G) | his flagged puck as Outlaw (dotted, dashed, solid), as Wildcard (amber, thin red), as Static (grey), as the member Ranger, as Saber (the orders: flag on / undo / redo, a highlight chip, publish / unpublish, reload; the Leave War row; OIL Earn mode); every surface of §3a; the finger ghost | **71 pass · 0 fail** · 2 notes | — (the notes: a dragged flagged puck loses the ghost's depth shadow — anyone's, `[GHOST-FLAG-SHADOW]`, filed) |
| **W3 f6** — the crowd's doors (D271) | the crew list dragged onto FLIGHT SAFETY's "+ add"; its armed "+ add" tapped with Ranger; Ranger dropped onto Reaper's place in his own crowd (reading 3); his own puck onto his own crowd's "+ add" on a published day | **7 pass · 0 fail** (re-run) | (d) first FAILED on the walk's own premise: a refused tap leaves the "+ add" armed (D33's shape), so the script's next tap on it disarmed instead of arming and Reaper was never planted — the script now puts the arm down first and checks the arm survives the refusal (F6-b2) |
| **W3 f4d, f2d** — what must NOT change | a swap inside one crowd, both directions, unpublished and published (1 pending, "order changed"), undo / redo / reload, on the board and the edit week; a man on another overlapping row still only warned | **22 + 10 pass · 0 fail** | — |
| **W3 f7** — a PUBLISHED Monday | Ranger moved from WPNS & TACTICS SYNC onto FLIGHT SAFETY's "+ add"; swapped with Reaper in his crowd; Reaper dragged onto Ranger's WPNS place (the swap's OTHER end); then a legitimate move of Reaper; Undo; reload | **9 pass · 0 fail** — every refusal: both rows as they were, **0 pending, no Undo step**; the legitimate move plants (1 pending), Undo → 0 | first cut used STAFF MTG on the Ground Programme as "the other row": far below, off the screen, so the press picked nothing up (no ghost) — a walk miss; now a neighbouring Common Programme row, and every check requires a ghost |
| **W3 f8** — the phone, a real finger | the same move by finger; the drawer's struck name tapped on an armed "+ add"; then another man | **5 pass · 0 fail** — refused, the toast says why; the "+ add" stays armed and the drawer stays open as the picker; the next man lands and the drawer parks | the same off-screen first cut |
| **W3 f9** — Fable's F1, through the app | a Meeting request filed on the Inputs page, accepted onto the Ground Programme, Ranger added to its row as an extra, then the request handed to Ranger on the Inputs page (✎ → Person → ✓) | **6 pass · 0 fail** — Ranger once, as the holder; the note is the message LEFT on screen | the first run found the note REPLACED at once by "Input updated" (one toast, the caller's line after the save) — **fixed**: the note follows on the next tick (`audit-e-commit-relink.test.tsx`, red first); two walk misses before it (the request's id is re-minted after filing; the list opens on today's real fortnight — "All dates") |
| **W3 f10** — the EDIT WEEK | Ranger from the week's own crew palette onto FLIGHT SAFETY's cell on `#eWeek` | **2 pass · 0 fail** — refused, the caption said it first, no landing flash | first cut let go over the tab bar (the pair-scroll put the target off the top) — a walk miss |
| **W6** — the arrow room out (D275) | View-only at rest, Monday's list open, three › presses, the carry to Edit, Edit at rest, a warning tap that pans; 1440 and 1024; the phone | **18 pass · 0 fail** — 20px padding, no declared room, the list starts under the ‹ arrow as he chose, every press lands at 20px, the carry lands flush at the box's edge | — The full-screen picture (`w6/W6-view-list-1440.png`) is the mock-up's BEFORE picture he chose, now from the real build |

**Every finding was reproduced by the builder:** Fable's F1 red first in `audit-e-commit-relink.test.tsx` ("Ranger once on
the row: expected 2 to be 1") and in the running app (W3 f9); the replaced note by W3 f9's first run.

## 6. What was NOT walked, and why
- **A real iPhone / Safari** — every finger was Chromium's emulated touch (W1 G, W3 f8). His phone is the only proof of
  Safari's own delivery.
- **The drawer drag on the phone** (a name dragged from the drawer onto the board — Fable S-3): the finger drag was
  walked from a seat on the board (f8a) and the drawer's tap (f8b); both reach the same `applyDrop` / `placeArmed`, and
  `rowtwice-refusal.test.tsx` covers the roster kind.
- **1920×1080** for the arrow landings (W6 did 1440 and 1024; `geometry.spec.ts` covers the rest).
- **Fable's questions, not defects** — a jet line's two seats (Q-A), his not-earning puck in OIL mode (Q-B), a
  placeholder twice (Q-C), a struck name that will refuse vs one that only warns (the look), no caption over a row's
  TITLE though the drop there refuses (S-28): on his look card (§9), filed.
- **OIL Earn mode's half-day ring** on his own puck (the full ring walked, F9): the ring test resolves `oilglow half`.

## 7. The gates
One full run under the PC-wide lock (D228; `gatelock.mjs run`, 27 Sep 26, `E2E_PORT=4193`), on the code before Fable's
F1 fix: **unit 6249 / 6249** (382 files) · **build** clean · **tfin 728 / 0** · **e2e 472 passed**, 0 failed, 48 skipped
(the two "sit clear of the ‹ arrow" tests went with the room: 474 − 2) · **smoke 443 / 0** · **rulecheck** OK · docsize
**FAIL** on one home — D275's row named the deleted arrow-room test; the four rulings' rows now name their built homes →
docsize OK: `Docs: OUTSTANDING 75 items (+8 −5, −5 all in ARCHIVE) · DECISIONS D1–D275 · homes OK` · `docsize: OVER by
43, deferred (D29)` (a code change never trims the backlog). The Leave War "Move" tests passed in this run
(`[LW-MOVE-CI-RED]`, §10). A second full run follows the reads' fixes.

## 8. The code reads (Fable and Astra, blind to each other, with this sheet)

Both read the code at `f81bb395` with this sheet in hand (brief `docs/superpowers/briefs/2026-09-27-five-flags-answers-read-brief.md`),
started together; Fable was told not to open Astra's file and did not. Reports kept whole:
`docs/superpowers/specs/2026-09-27-five-flags-answers-astra-read.md`, `…-fable-read.md`. **Neither found a defect against
any of the four rulings.**

| # | Reader | Finding | New / on main | Disposition |
|---|---|---|---|---|
| A1 | Astra (low, tests) | the ring test's "the clicked-warning focus keeps its glow" only reads the `.puck.wfoc` rule; nothing pins that the focus is kept OFF the purple (highlights.ts returns before adding "you") — remove that return and every test stays green; and its "every combination" covers classes on the puck, not contexts | the order on main, the test new | **fixed** — `interact.test.tsx` "a focused warning takes the purple…" (signed in as Saber, his clash focused: lit pucks wear the focus, never the purple; cleared and folded: "you" again), break test red (the purple put on focused pucks); the ring test's claim reworded, with where the rest is proved |
| F-5 | Fable (low, tests) | `rowtwice-refusal.test.tsx`'s "no history step" read the edit log, not the Undo history — a refusal that pushed an empty Undo step would pass | new | **fixed** — every refusal case now checks `HIST` unchanged; break test red (a refusal made to push a step: 2 tests) |
| F-6 | Fable (observation) | with a man SELECTED, the green "where can he go" rings show none on his own crowd's "+ add" (he is already there), yet dragging his own crowd puck there moves him to its end — the rings answer "add him", the drop "move him" | on the batch, not main | **look card** (`[D271-LOOK-ASKS]` item 4's note) — consistent with D271 (selecting a man is not picking up one of his pucks) |
| F-7 | Fable (hardening) | the F1 filter compared ids with `===`; `whoId(v)` is how a row's places are read | — | **applied** (`inputedit.tsx`) |
| F-9 | Fable (negative) | the sims' `.*` / `.pax.+` keys would mis-trim in `seatRow`, but no surface emits them and the belt matches by id | — | noted, nothing to do |

Both confirmed as negatives: every door asks `rowTwice` before writing (both ends of a swap; the cell before the source is
cleared); the reverse cases pass as ruled; the `:not()` list covers every class `puck()` emits; no context rule selects
`.puck.me`; the ring test's cascade is right; the arrow revert is complete (`pan.ts`, `highlights.ts`, `geometry.spec.ts`
byte-identical to main); Fable's F1 fix is right and complete (both doors reach it; the note survives the caller's line).

**The re-walk after the reads** (27 Sep 26, the final build `index-D0v7ZkLD.js`): the reads' fixes were tests (A1, F-5) and
one comparison in the hand-over (F-7) — W3 f9 re-run into `…/rewalk/`: **6 pass · 0 fail**, the note on screen after the
save. Nothing else in the app changed after the first walk.

## 9. His look — five minutes, on the branch's Vercel link, pictures first

**Look here** (desktop; the phone behaves the same):
1. **Your own puck shows its flag's ring.** Sign in as `outlaw` (any password) → View-only Sched: Monday, your purple
   puck wears the red DOTTED ring alone (it causes Tuesday's crew-rest breach); Tuesday, the solid red box. Unflagged,
   still the purple ring and glow. Pictures: `docs/img/handpass/2026-09-27-five-flags-answers/w1/C2-desktop-as-outlaw-mon-dotted-you.png`
   and, as Wildcard beside Tally, the same amber ring on both (`…/w1/D1-desktop-as-wildcard-mon-amber-you-beside-tally.png`).
2. **OIL Earn mode:** your own earning puck wears the green OIL ring, purple fill (`…/w1/F9-desktop-oil-mode-you-puck.png`).
3. **One man, once per row.** Edit Schedule → Monday's board: drag Ranger from the crew list onto FLIGHT SAFETY
   STAND-DOWN — the note under the puck says "already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice" and,
   let go, nothing is added. Drag Havoc there — he lands. Two men already in the crowd still swap. (`…/w3/f6-d-hover-palette-ranger-onto-reaper-in-his-own-crowd.png`)
4. **The arrow's room is gone.** View-only Sched: Monday flush at the left, the ‹ arrow over its first letters — the
   picture you chose, now from the real app (`…/w6/W6-view-list-1440.png`).

**The agent's readings, for you to correct** (stated so a wrong one costs a sentence):
- A request handed to a man who is already on its row as an extra keeps him ONCE, as its holder, and says so
  ("Ranger — already on this row as an extra · kept once, as its holder") — Fable found this door; refusing the
  hand-over instead would block a legitimate correction of whose request it is.
- A placeholder (ALL / ALL AVAIL) is not held to "once per row" (see Q3).

**Your questions — nothing is built for any of them** (`OUTSTANDING.md` `[D271-LOOK-ASKS]`):
- **Q1 — A jet line's two seats.** One man in FCP AND RCP of the same jet is only warned (red, "two events at once").
  Refuse it too? (Recommended: yes — it can never be right.)
- **Q2 — Your puck in OIL Earn mode when you earn nothing** keeps its faded purple ring; other men's are just faded.
  Keep? (Recommended: keep — the fade says "nothing", the purple says "you".)
- **Q3 — ALL AVAIL twice on one row** is allowed, silently. Leave it? (Recommended: leave it.)
- **Q4 — A struck name in the crew list** looks the same whether a tap will be refused or only warned; only its
  printed reason differs. Leave it? (Recommended: leave it — the words say it.)

**Only your iPhone can prove:** the finger drags were walked in Chromium's emulated touch; Safari's own delivery is yours
to glance at (the refusal by finger on the phone is `…/w3/f8-a-phone-finger-ranger-onto-his-crowd.png`).

## 10. [LW-MOVE-CI-RED] — the red Leave War "Move" tests on GitHub (investigated, not re-run)
An Opus investigator read 25 GitHub runs' logs (no failure pictures exist — the workflow uploads none) and drove the tests
on the PC under the lock. **The cause is a timing race in three tests, not the app:** each starts its second drag
straight after an admin's fill; since `[ACCOUNTS]` (26 Sep 26) that fill is an admin edit on Raptor's side too, and on
GitHub's slower machines its re-render swallows a drag started too soon (9 of 16 runs failed first after 26 Sep 06:44Z;
9 of 9 passed before). The same race the undo tests met on 18 Sep; these three never got its fix. A person would not
meet it at ordinary pace (a lost drag writes nothing). **Fixed, tests only (D87):** wait for the fill to land and its
sheet to close, then a drag that retries until its sheet opens (`e2e/leavewar.spec.ts`). It never failed on the PC, so
the proof is the next GitHub runs of this branch. Its report in full: `OUTSTANDING.md` `[LW-MOVE-CI-RED]`; side-findings
filed: `[LW-HARNESS-VIEWER-PIN]`, `[CI-FAIL-PICTURES]`.
