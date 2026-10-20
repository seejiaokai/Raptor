# Bug check — the standby batch (D994's small fixes, 20 Oct 26): `[BOARD-TAB-FOLD]` with the week's half, `[SA-HEAD-CLIP-360]`, `[STANDBY-UNDO-WORDS]`, `[BUBBLE-SMALL-SEEN]`

Branch `claude/standby-batch-1020`, cut from `main` at pull request 545; pull request 547. Built 20 Oct 26 by Opus, one
area (the schedule's standby lines and time boxes), one check (D1087). Before and after pictures of each, taken by the same
script on `main`'s build and on this one: `scripts/handpass/standby-batch-shots.mjs` →
`docs/img/handpass/2026-10-20-standby-batch/before/` and `…/after/`. Tier **WALK**, sized small.

## 0. What each item was, and what it is now
| Item | Before (`main`) | After |
|---|---|---|
| `[BOARD-TAB-FOLD]` — the board | "1000" typed in a take-off and left by Tab: the box still read "1000", though 10:00 was saved (before/01) | reads 10:00 at once (after/01) |
| `[BOARD-TAB-FOLD]` — the week's half | "0930" typed on Edit Schedule's week and left by Tab read "0930" (before/02) | 09:30 at once (after/02) |
| `[STANDBY-UNDO-WORDS]` | an AVALON line's START typed: Undo said "a take-off time" (before/03); the changes window "Take-off" (before/04) | "a start time" (after/03); "Start" (after/04); END "an end time" / "End" |
| `[SA-HEAD-CLIP-360]` | 360 wide, AVALON's first heading cut to "AVALOI" — 44px of words in 35 (before/05, 06) | whole, in START / END's 7px letters (after/05, 06) |
| `[BUBBLE-SMALL-SEEN]` (4) | the empty gold pill of 28 Sep 26 is not there: the Inputs list was redesigned since (cards on a phone — D723) — a LATE leave filed by the admin for himself in the member view shows LATE, "All day", Saber, LL, the remark (before/07 phone, 08 desktop) | nothing to change — the item closes as already gone |

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL): **NO** — no rule of what earns, no time's value; the fold changes what the box shows, not what is saved
(the save ran before it, unchanged). 2. The published record: **NO** — no publish, signing or issued face changes; a
standby time on a published day is pending as before (D18). 3. Saved data: **NO** — nothing changes shape; the one stored
string that changes is the change history's label for a NEW standby time ("AV · start" for "AV · take-off"), and its one
reader that compares the word (the changes window, a row gone since) reads both (`changesmodel.test`). 4. A shared drawer:
**YES** — the week's heading is drawn by the builder of Edit Schedule and View-only Sched (the peek has its own copy); the
time box's save is shared by every time box on the board and on the week. 5. A new gesture: **NO**. 6. A new surface:
**NO**. 7. Roles: **NO**. 8. The warning list: **NO**. → **WALK**.

## 2. The rulings swept
D1083, D1085 (a standby wave's time headings read START / END on the week and the board — the words now follow them),
D1084 (START / END at 7px on a phone — the first heading takes the same size), D367 (a callsign always whole, never cut —
the name heading follows it: smaller letters, then a wrap), D1047 (one tap then typing replaces — the fold leaves it as it
was, D2, P1), D1011 (Escape puts the old time back — D11), the 30 Aug 26 settled "every time reads 08:00" (the fold IS that
rule, now true at once), D148 (Undo reverses only the signed-in man's own change), D178 / D45 (a change on a published day
waits for its amendment — D18), D487 (no button changes size — none did), D994 (these were picked as small fixes needing
no answer from him). No ruling contradicted.

## 3. The roll-call
**The time box left (`[BOARD-TAB-FOLD]`)** — every box that saves through the board's `boardChange` or the week's
`routeFocusOut` text branch:
| Place | Reads hh:mm at once after Tab / a finger on the next box? | How proved |
|---|---|---|
| Board, a flying line's take-off, landing, B, R | YES | walked D8 (landing), before/after 01; `undo-wire.test` (to, ld, br, rl) |
| Board, a standby line's START, END, B | YES | walked D2, D6, D7; P1 (phone, by finger) |
| Board, a duty desk's start / end (`dr:`) | YES | walked D8 |
| Board, a Common Programme / ground / sim row's times (`ap:` `gr:` `sr:`) | YES — the same branch, the same key family (`TIME_TXT`) | the code path is the one walked in D8; not walked separately (§7) |
| Board, a row that came from an input (a request's row) | YES, as before this change — that branch already set the box to the request's own text (`reqRowText`) | unchanged; not walked (§7) |
| Board, an input's own start / end under Personal Inputs (`data-ifld`) | YES since the code read (F2) — it had the same fault: "1015" kept on screen | re-walk D20 (picture walk2/05); `undo-wire.test` |
| Week, a flying line's times; a standby line's START / END / B | YES | walked D12; before/after 02; RB12 (SC's B, by Tab, caret in the next box); `undo-wire.test` |
| Week, a duty desk's start / end | YES | walked D14 |
| Week, an input's start / end cells (`data-inp`) | YES since the code read (F2) | re-walk D19 (picture walk2/04); `undo-wire.test` |
| A box saved while the caret is still in it (the window lost the focus; Enter in a board box) | left as typed — the box is never rewritten under the caret (the read's F3) | `undo-wire.test`; GitHub's phone test of D1047 (§10) |
| A refused time ("abc") | stays the saved time — no fold, no half-typed text | walked D9 (break) |
| A cleared time | reads empty, saved empty | walked D10 (break) |
| Escape | the old time, nothing saved (D1011) | walked D11 (break) |

**The standby wave's first heading (`[SA-HEAD-CLIP-360]`)**:
| Place | Whole under 375? | How proved |
|---|---|---|
| Edit Schedule's week, 360 and 320 — SC, AVALON, BB | YES, at 7px | walked P4-360, P4-320; RB14 |
| A wave renamed longer than the room ("AVALON NIGHT 2"), 320 | YES since the code read (F1) — it wraps, the name whole | re-walk P7 (picture walk2/10); RB14 |
| View-only Sched, 320 | YES | walked P5 |
| The next-week peek | NO, because it is desktop only (`peek.ts`) — not drawn under 375 | walked P4 (0 drawn at 360 and 320) |
| 402 and wider | unchanged — 8.5px on a phone (P3), 9.5px on a desktop (D15) | walked P3, D15 |
| A flying wave's first heading | unchanged — the rule needs START / END beside it | walked P6 (8.5px at 320) |

**The words for a standby line's times (`[STANDBY-UNDO-WORDS]`)**:
| Place | Says start / end? | How proved |
|---|---|---|
| Undo and Redo, the board's own pair | YES — "a start time", "an end time"; SC's B "an in-time", AVALON's B "a brief time" | walked D3–D7; `undo-wire.test` |
| Undo, the top bar's pair (Edit Schedule's week) | YES | walked D13 |
| The changes window, an item still there | YES — Start / End / Brief; a flying line keeps Take-off / Land | walked D16 (picture 03) |
| The changes window, a row deleted since | YES — read from the label it was written with | `changesmodel.test` (gone rows) — not walked (§7) |
| "To go out" on a published day (`pendlist.ts` reads the same label) | YES — "AV · start" | walked D18 (picture 04) |
| The history bubble on a gold dot (it prints the same label) | YES — the label written is "· start" / "· end" | the one label writer (`keyLabel`); not walked (§7) |

No MISSING.

## 4. Sizing the walk (D607 — `docs/walk-ledger.md`)
1. **Type:** E (a look: one heading) with F (words) and C-adjacent (what a box shows after a press). 2. **What only a walk
finds:** that the folded time shows while the caret is really in the next box (the redraw rules are the browser's); the
heading's fit at the real widths; that the words are the ones on screen in the board's own Undo, the changes window and
"To go out". 3. **The ledger:** small E / F changes walked by the host alone found 0–1 faults each. 4. **Chosen:** the host
alone, one scripted walk of the built bundle (`scripts/handpass/walk-standby-batch.mjs`), the fixture through the app's own
controls (the board's "+ Wave" menu, real presses and keys, the board's own Undo / Redo, the day's own sign-offs and
Publish); desktop 1440 × 900 by mouse (D1–D18), a phone 402 × 874 by finger, then 360 and 320 (P1–P6); three break tests
(D9–D11). 5. **After the walk:** its row is in the ledger.

## 5. What the walk did — 26 PASS, 0 FAIL, no browser error
D1 the waves added; D2 board AVALON START "2015" + Tab → 20:15 at once, the caret on END; D3 Undo "a start time"; D4 Undo
→ 19:00, Redo "a start time"; D5 Redo → 20:15; D6 BB END "1830" → 18:30, Undo "an end time"; D7 SC B "610" → 06:10 "an
in-time", AVALON B "1800" → 18:00 "a brief time"; D8 a flying landing "1135" → 11:35 "a landing time", a duty start
"0715" → 07:15; D9–D11 the break tests; D12 week AVALON END "0815" + Tab → 08:15 at once, the caret in the next box; D13
Undo "an end time"; D14 a duty end on the week "1205" → 12:05; D15 the desktop heading unchanged (9.5px); D16 the changes
window; D17 Monday published; D18 "To go out" names "AV · start 19:00 → 20:30"; P1 the phone board by finger; P2 the phone
week by finger; P3 402 wide unchanged; P4 360 and 320 whole, no peek; P5 View-only 320 whole; P6 a flying heading
unchanged. Pictures: `docs/img/handpass/2026-10-20-standby-batch/walk/` (01–08). Two script faults of the first run (the
board's own Undo pressed through the page's; a grouped item read line by line) were the script's, fixed and re-run.

## 6. Orders
Type then Tab; type then a finger on the next box (phone); type then Escape; Undo then Redo; on an unpublished day and on a
published one (D18). Undo after a fold restores the box to the old time folded (D4).

## 7. What was NOT walked, and why
The programme / ground / sim time boxes on the board — the same branch and the same key test (`TIME_TXT`) as the duty box
walked in D8, so their route on screen is the same. A request's row — its branch is untouched. A changes-window line for a
row deleted since — carried by `changesmodel.test` (it reads the frozen label; the screen route is the one walked in D16).
The history bubble — it prints the label written by the one writer the tests pin.

## 8. Break tests
D9 nonsense typed ("abc") → the box shows the saved time, nothing half-typed; D10 a cleared box → empty, saved empty; D11
Escape after typing → the old time, nothing saved. Red-first tests: `changesmodel.test` "a standby line's start and end …"
and `undo-wire.test` (the words; the board's box; the week's box) — all four failed on the old code and pass now; the
browser tests RB14 (headings at 360 and 320) and RB15 (the board after Tab) and the tightened RB12 pass on this build, and
the before pictures (measured on `main`: "1000" kept; 44px in 35) are their red.

## 9. Found, and each disposition
By the walk, nothing in the change. By the code read (§11) three, all fixed with a test red first (`undo-wire.test`: two red on
the first commit, green now; RB14's rename) and re-walked (§11a). By GitHub's first run (§10) one, cured by the read's F3. Met in passing, older: the changes window shows a seeded duty desk's old time as stored ("1300 →
12:05") — demo data written before the hh:mm rule, and new edits are stored hh:mm, so not a finding (D56).

## 10. Gates
On his PC (D1086): `npx vitest run` of the 34 nearby files — 669 passed; the browser file `e2e/rallybox.spec.ts` — 19
passed, 1 skipped (RB14 is a phone width); typecheck clean. GitHub's run of pull request 547 on the first commit: **one red** — the phone run of RB's D1047 test ("a time box tapped into:
typing replaces …", the step that types 1300 into a cleared take-off and presses Enter: saved stayed empty), twice with its
retry; green on `main`'s last four runs, so it is this change. Not reproduced on his PC (16 of 16, on either version). The
likeliest cause, and the one difference that matters: Enter in a board box saves while the caret is still in it, and the
first version rewrote the box under the caret; the read's F3 guard (never rewrite a box that holds the caret) removes
exactly that. GitHub's run of the second commit (b2d3208ef): **green**, every leg — the D1047 phone test passed on its first try.

## 11. The code read
A fresh, blind Opus reader (never the chat that wrote it — D790), given the commit and asked for absences; read only. No high
or medium finding; three low, each with failure, cause and fix (D489), all taken:
- **F1** — the heading rule's promised wrap could not happen: the heading row's own `white-space:nowrap` (03-week.css) kept
  a renamed wave ("AVALON 2") cut at 360. Fixed: `white-space:normal` on that one cell.
- **F2** — an input's own start / end (the board's Personal Inputs boxes, the week's input cells) kept the typed digits
  after Tab too. Fixed the same way, from `inpTimeText` — what both screens draw.
- **F3** — the week's new fold also ran when the window lost the focus with the caret still in the box, rewriting it
  under the caret. Fixed on the week and the board: never while the box holds the caret.
The fixes are one-line guards and one-line folds beside the code read — no further narrow read (the order's §5: a read
of a fix round is for logic rewritten, more than a one-line guard).

## 11a. The re-walk (`WALK_DIR=walk2`, the same script with the read's cases added)
29 PASS, 0 FAIL, no browser error: D19 the week's input start "1015" + Tab → 10:15; D20 the board's input end "1645" + Tab
→ 16:45; P7 AVALON renamed by finger "AVALON NIGHT 2" at 320 → the heading "AVALON NIGHT 2 SHIFT", whole. Pictures
`docs/img/handpass/2026-10-20-standby-batch/walk2/` (01–11).

## 12. His look
The before / after pictures and both preview links put to him; his word, 20 Oct 26: "merge live — both pull requests, the faster checks first, then the standby batch." Merged after pull request 546, `main` brought in first (D78).

Walk: host, scripted, 26 PASS / 0 FAIL, then the re-walk 29 PASS / 0 FAIL; desktop 1440 + phone 402 / 360 / 320; 8 + 11 pictures and 18 before / after; browser errors none.
