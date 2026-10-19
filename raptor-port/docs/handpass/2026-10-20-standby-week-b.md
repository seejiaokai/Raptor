# Bug check — the week's standby lines read R over B, then START over END (`[STANDBY-WEEK-B]`, D1083, D1084)

Branch `claude/standby-week-b`, cut from `main` at pull request 543. Built 20 Oct 26 by Opus, after the real week was drawn
for him today beside the proposal (pictures 1–6, `docs/img/handpass/2026-10-20-standby-week-b/`, drawn by
`scripts/handpass/mock-standby-week-b.mjs`) and his answer "2" (D1083); the built week was then pictured for him (7–9) and
he said "Ok carry on" to the phone heading's size (D1084). Tier **FULL**, sized small.

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL is owed): **YES** — no rule of what earns changes, but the week gains a door that writes a value that does:
a B typed on SC MAIN starts the crew's day for crew rest, the long day, work hours and OIL (D1041, D606), and a B typed on
any standby line flies the shift, its rows then counting as flights and earning (`[STANDBY-FLIES]`, D1045). 2. The
published record: **YES** — on a published day that B is a pending change and the issued face keeps what went out.
3. Saved data: **NO** — the same `f.br` field, already saved and already written by the board; nothing stored changes shape.
4. A shared drawer: **YES** — the week's builder draws Edit Schedule and View-only Sched; the peek has its own copy.
5. A new gesture or mode: **YES** — a new box to press and type in on the week. 6. A new surface: **NO**. 7. Roles: **NO**
— the box follows the week's own edit rights (`ted()` → `canEditSched()`), as every box there. 8. The warning list:
**NO** — no rule is read differently; the changes window's "go to" for that box changes (§3). → **FULL**.

## 2. The rulings swept
D1083 (the layout, his "2"), D1084 (the phone heading's size), D1040 (the rally box above B — marked ANSWERED by D1083 for
the week), D1041 (SC MAIN's B is its in-time; elsewhere shown only), D1039 (no worked-out brief or rally on these lines),
D1065 (the faint dash in an empty R and B), D1045 / D1043 (a typed B flies the shift), D1026 / D1029 (the flying line's
R / B and TO / LD; the board's R · B · TO · LD — kept for flying waves), D1085 (the board's standby waves headed START / END too — his word after the preview, §13), D178 / D45 (a change on a published day waits for its
amendment), D554 (the Tab route), D487 (no button changes size — none did). The 24 Aug 26 settled entry "the SC in-time
shows on the board only … raise mirroring only if he asks" — he asked; marked closed by D1083 in `scheduler.md`. No ruling
contradicted.

## 3. The roll-call — every place a standby line's times are drawn
| Place | Shows R / B and START / END? | The B usable there? | Also on the same pixels | How proved |
|---|---|---|---|---|
| Edit Schedule's week, desktop | YES | YES — pressed and typed (D3), Undo / Redo (D4) | the pending mark on a published day (D8b) | walked D2–D4, D8b, D10; RB10, RB12 |
| Edit Schedule's week, phone | YES — START / END at 7px, whole | YES — a finger took the caret, typed (P3) | the lit ✓ FLIES chips beside (pictures) | walked P2, P3; RB12 at 402 |
| View-only Sched, desktop and phone | YES | NO, because it is read only — nothing editable (D7: 0 boxes) | the issued face on a published day (D8c) | walked D7, D8c, P4; RB10 |
| The next-week peek | YES | NO, because it is inert (read only, no box anywhere) | — | RB10 "the next-week peek" (B2, B2b red); not walked — see §7 |
| A frozen look at an issued version (👁) | YES — the same builder (`dayHTML`, PV) | NO, because a look is read only | — | the builder's one branch, RB10; not walked — see §7 |
| The Scheduler Board | YES since D1085 — a standby wave R · B · START · END (stacked on a phone), a flying wave keeps TO / LD; first built keeping TO / LD (D1083's reading) | YES, as before; the same box (D5, D6) | — | walked D5, D6; D5b re-run for D1085 (§13); RB10 "the Scheduler Board" |
| The changes window's "go to" for a standby B | lands on the week's box, ringed (was "shown on the scheduler board") | — | — | walked D9 (picture 06); histjump.test (B3 red) |
| The printed schedule and the export | unchanged — they already carried a typed B only | — | — | RB10 "the export" (unchanged) |
| The Tab route on a standby line | R → B → START → END (D554's order) | — | — | walked D10 |

No MISSING.

## 4. Sizing the walk (D607 — `docs/walk-ledger.md`)
1. **Type:** C (a new control on an existing surface — the B box on the week) with D (one layout drawn by two builders).
2. **What only a walk finds:** that the heading's words fit at the real widths (the phone's 32px column); that a real press
and real keys reach the new box, save it, fly the shift and show on the board; that a published day marks it pending and
the issued face holds; that the changes window's tap lands on it; the Tab route. 3. **The ledger:** small C/D changes this
month walked by the host alone found 0–1 app faults each and several script faults (`[GUIDE-NO-GLOW]`, `[TRK-DATE-BOXES]`).
4. **Chosen:** the host alone, one scripted walk of the built bundle (`scripts/handpass/walk-standby-week-b.mjs`), the
fixture made through the app's own controls (the board's "+ Wave" menu, a real press and real keys in the box, the day's
own sign-offs and Publish); desktop 1440 × 900 by mouse (D1–D10) and a phone 402 × 874 by touch (P1–P4). Carried by a
test, not walked: the heading's fit at 320, 360, 375, 390, 440, 820, 1024 (`standby-week-b-fit.mjs`, read off the real
page — every width fits, letters a seventh wider too); the peek and the issued look (one builder each, RB10).
5. **After the walk:** its row is in the ledger.

## 5. What the walk did (`scripts/handpass/walk-standby-week-b.mjs` — a PASS means correct)
| Step | What was pressed | What the screen said | What the data said |
|---|---|---|---|
| D1 | board → "+ Wave" → SC, AVALON, BB | three standby waves | waves 2, 3, 4 |
| D2 | Edit Schedule's week | each headed "R B" / "START END", whole (9.5px) | — |
| D3 | SC AM's B pressed, 0545 typed, a press elsewhere | the box reads 05:45; R over B, START over END; ✓ FLIES lit on its rows | `f.br` 05:45 |
| D4 | the top bar's Undo, then Redo | the box empty, then 05:45 | "" then 05:45 |
| D5 | the board opened | its B box reads 05:45; headings R · B · TO · LD (as first built — D1085 since, §13) | the same field |
| D6 | AVALON's B typed on the board (1830) | the week shows 18:30 under R | — |
| D7 | View-only Sched | R B / START END on all three, 05:45 and 18:30 shown, 0 editable boxes | — |
| D8 | Monday published (its sign-offs, Publish); BB's B typed on the week (2000) | the box wears the pending mark; the day reads "1 pending"; View-only Sched still shows BB's B empty | `f.br` 20:00 |
| D9 | the changes window → All changes → "BB SHIFT · Brief — → 20:00" | the week stays, BB's B in view and ringed | — |
| D10 | AVALON's R pressed, Tab × 3 | the caret: R → B → START → END | — |
| P1–P4 | the same by touch at 402 | START / END at 7px, whole; a finger on SC's B takes the caret; 05:45 saved and shown; View-only Sched the same | `f.br` 05:45 |

**22 PASS, 0 FAIL · 9 pictures (all opened) · no console error, page error or failed request.** Pictures:
`docs/img/handpass/2026-10-20-standby-week-b/walk/`.

## 6. Orders
| Order | Result |
|---|---|
| B typed on the week, then Undo, then Redo | walked (D4) |
| B typed on the week, then seen on the board | walked (D5) |
| B typed on the board, then seen on the week | walked (D6) |
| publish, then a B typed on the week | walked (D8) — pending, issued face holds |
| a B typed, then the changes window's tap | walked (D9) |
| a B typed on an unpublished day | walked (D3) |
| a published day's B amendment published (AL1), then the issued face | not walked — the same path every week box takes to an AL (`publish.ts`, `dayDelta`), unchanged here |

## 7. What was NOT walked, and why
- **The next-week peek** — inert, one builder of its own; carried by RB10 "the next-week peek" (its two break tests red).
- **The 👁 look at an issued version** — the week's own builder with `PV` set (no separate branch for these cells); RB10's
  read-only case covers the markup.
- **The AL publish of a standby B** — not touched by this change (every week box reaches the AL the same way).
- **His iPhone itself** — the fit is measured in the test browser with letters a seventh wider; only his phone proves the
  fit with Apple's font. On his look card.

## 8. Break tests (`scripts/handpass/breaks-standby-week-b.mjs`)
B1 the week draws START, not B, under R — RED · B1b the week draws no START above END — RED · B2 the peek draws no B — RED ·
B2b the peek keeps the old heading — RED · B3 the changes window still calls a standby B the board's alone — RED · B4 the
phone heading at its old size (the browser test) — RED · B5 (after the code read) read only, an empty START holds no line —
RED. **Every break caught (7 of 7).**

## 9. Found, and each disposition
- **The phone heading did not fit** (found drawing the proposal, before the build): START needed 29px where 23 was left.
  Put to him with pictures; his "2" (D1083) and "Ok carry on" (D1084); built and measured at every width.
- **A time typed in a week box and left by Tab reads as typed until the next press elsewhere** (found by the new browser
  test) — OLDER: every week box does it, a flying line's B and take-off too (probe `standby-week-b-tabfold.mjs`), and the
  board does the same (`[BOARD-TAB-FOLD]`). Filed there, low. Not this change's.
- **The code read's F1 (low) — read only, an empty START let END rise onto START's line.** A BB line comes with no times;
  END typed alone (07:00) printed on the top line of the third cell on View-only Sched and the peek, the line the heading
  now calls START. Fixed red-first: `e2e/rallybox.spec.ts` RB13 failed at both widths on the built app (the empty START 0px
  tall), passes after one rule in `03-week.css` (`.form .ld > span:first-child:not(.txed):empty::before` — the R box's
  own rule beside it); it also holds a flying line's empty TO on View-only Sched, which did the same. A one-line style
  fix: no further read of its own (the order's §5, "more than a one-line guard"). Re-walked: D14.
- **Older, met in passing:** under 375 wide "AVALON" in a standby wave's first heading shows as "AVALOI" (the 36px column,
  untouched here — filed [SA-HEAD-CLIP-360]); Undo and the changes window call a standby START "a take-off time" (the
  read's (c) — filed [STANDBY-UNDO-WORDS]).
- **Script faults, not the app's** (6): the board stays in the page hidden once closed; the + Wave menu takes the first
  press outside it; the changes window opens on "New to you"; a change line's address carries the row's hidden id; a test
  port held by another chat's old preview made a first browser run test that chat's bundle (`E2E_PORT` moved to a free
  port); a heading read by `innerText` while the board covered the week.

## 10. Gates
The full set under the lock (`gatelock.mjs run`, this branch before the read's fix, watched): **unit 12003 passed (676
files) · build PASS · the original's assertions 728 passed, 0 failed · browser 891 passed · the Tracker 453 passed, 0
failed · rulecheck PASS · docsize PASS.** After the read's fix (one style rule): the rally box browser file 16/16, then the
whole browser set again under the lock: **893 passed, 0 failed** (61 skipped, as on `main`; the two new are RB13 at both widths).
Unit tests are untouched by a style rule; GitHub's run of the pull request is the full check of the last commit (D902).

`Walk: docs/handpass/2026-10-20-standby-week-b.md · 20 pictures · 9 surfaces · 7 orders · MISSING: none (F1 fixed; 3 older filed)`

## 11. The code read
One fresh, blind Opus reader (D790, D903 — no ChatGPT reader while it is out, D761), handed the diff, the rulings' full
rows and this sheet, asked for absences first (about 228k tokens). **One finding, low — F1 above, fixed.** Its missing
scenarios, all walked in the re-walk: Escape on the new box (D11), nonsense typed in it (D12), the published B taken to
AL1 and the issued face (D13), a press on a 360-wide phone (P5). Older, met in passing: the "a take-off time" words
(filed), the Tab-fold (already filed). Sound by its reading: the week's save is the board's (the same write, marks,
history, Undo, the engine's read — SC's in-time, the shift flying); snapshots; no suggestion leaks onto a standby line
anywhere, the export and print included; one builder for View-only Sched, the issued look, saved plans and the guest view;
the CSS (the B a gold `<b>`, `.sa-se` winning, the desktop sizes); Tab, focus, Escape; the changes window's sentences;
warning anchors; the documents.

## 11a. The re-walk (`WALK_DIR=walk2`, the same script with the read's four scenarios added)
**27 PASS, 0 FAIL · 11 pictures, all opened · no console error, page error or failed request.** New steps: D11 Escape after
typing 0900 into AVALON's B — 18:30 kept, saved and shown; D12 "ab" typed — refused, 18:30 kept, nothing new pending; D13
AL1 published from the board — View-only Sched's BB B reads 20:00 wearing its AL1 tag, END 07:00 its AL1 tag, the line
unclipped (picture `walk2/07`); D14 read only, BB's empty START holds its 14px line, END below it; P5 at 360 by touch —
START / END whole at 7px, a finger takes SC's B, 05:45 saved (picture `walk2/08`).

## 12. His look
- The built week at his iPhone's width: his "Ok carry on" to pictures 7–9 (D1084).
- The preview (the week and, after D1085, the board): his **"merge live"**, 20 Oct 26 — pull request 544.
- **To look at on his iPhone:** START / END in its column on SC, AVALON and BB (Apple's letters are wider than the test
  browser's; measured to fit with a seventh to spare).

## 13. D1085 — the board's standby waves headed START / END (his word after the preview, 20 Oct 26)
*"Since edit schedule is start and end. Make the Scheduler board reflect the same. Instead of TO LD."* Recorded first
(D1085; D1083's full row marked NARROWED). Built in `board.ts` — a standby wave's third heading pair reads START / END
(`sb-se` marks it), a flying wave's TO / LD; R and B, CS and MSN as they were. Tier **LOOK** (one surface's two words,
no new box, no rule read differently); the fit measured, not assumed: `scripts/handpass/standby-board-fit.mjs` — START
36px in a 46px cell on a phone (320 to 820), 32px in 48–52 on a desktop, letters a seventh wider fit too, at the board's
own heading size (no smaller letters needed). Pictures `board/` (`scripts/handpass/look-standby-board.mjs`, the built app,
the headings ringed): phone 402 and desktop 1440, all opened. Tests: RB10 "the Scheduler Board" (break B6 red); the
board's own unit files 228 passed; the rally box browser file 16/16. The walk's D5b now asserts the new headings; the whole walk re-run on this build (`walk3/`): **27 PASS, 0 FAIL**, 11
pictures, no error — D5b: the board's headings TO LD, TO LD, START END ×3.
