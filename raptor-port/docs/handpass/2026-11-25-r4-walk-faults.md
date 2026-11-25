# Bug check — two older faults round 4's walk met, fixed (chat 170's helper, the night of 25 Nov 26, job 3)

Branch `claude/r4-walk-faults-170`, cut from `main`. The brief: `../superpowers/briefs/2026-11-25-r4-walk-faults-brief.md`.
The faults: `OUTSTANDING.md` `[UI-SLEEK-PASS]`, "Round 4's walk, left for a later round", points (1) and (4); found by
round 4's walk (`2026-11-24-words-r4-build.md` §12, items 2 and 4; walker d's report `parts/wr4/d-report.md` §D4).
Both older than round 4, both on `main`; neither touches a published record or OIL. Part A (this chat's helper): the
tier, the roll-call, each cause, the fixes red-first. Part B (on the host's word): the scenarios, the walk, the reads.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — neither fix computes or saves anything: the note's box gains one style; the Board writes markup it already built, sooner. Nothing OIL reads is touched |
| 2 | The published record | NO — no write path changed; publishing, signing and amendments untouched |
| 3 | Saved data | NO — nothing stored, nothing read back; the Board's paint keeps a record of what each section shows on screen only, dropped when the board closes |
| 4 | A shared drawer | **YES** — the note's box is ONE element every passing note in the app is drawn in (`ui/toast.ts`, from every `HOOKS.toast`, the Leave War's included); and the Board's paint writes every section of the day |
| 5 | A new gesture or mode | NO — no control, tap target or mode added or removed |
| 6 | A new surface | NO |
| 7 | Roles | NO — `state/perms.ts` untouched; a read-only Board draws no boxes, so no caret |
| 8 | The warning list | NO — what the warnings say and how a rule is read are unchanged (the Board's warning list was already written under the caret, W15) |

**Tier: WALK** (question 4). Nothing new is drawn and no word changes (the brief's rule on words; §5's mock-up rule does
not fire: no box, message, mark or button is added).

## 2. The roll-call — every place the app draws the thing touched

SHOW — the fix takes effect there · USABLE — the gesture that raises it still works · PAINTED — what else is drawn there.
Part A's column is the agent's reading from the code; each cell is walked in Part B.

**The note's box** (`#toastEl`, made once in `ui/toast.ts`, placed by `placeToast`):

| # | Where it is drawn | Part A — has it / must not, because… / MISSING |
|---|---|---|
| N1 | A phone, at the foot, no window up (held 12px from each side, words centred — D828) | has it — the box's width is the screen's less 24px, so a word wider than that is broken inside the box |
| N2 | A phone, at the top, a window of the shell up (D731 (1)) | has it — the same box, the same width |
| N3 | A phone, just above the "OIL not answered" bar (`OilWaitSheet`) | has it — same box |
| N4 | A desktop, at the foot, centred, as wide as its words | has it — a word longer than half the screen is broken at half the screen instead of widening the box off it; an ordinary note's width and lines unchanged (a box breaks inside a word only where the word cannot fit) |
| N5 | The refusal face ("Blocked: …", `data-face="blocked"`, a flex row with its sign — D1668) | has it — the words' span inherits the style and already shrinks (`min-width:0`) |
| N6 | Amber and red notes (`warn`, `hard`) | has it — tint only; the same box |
| N7 | A note raised from the Leave War (`HOOKS.toast`, e.g. Balances' refusal) | has it — the same element |
| N8 | The screen reader's copy (`#srSay`) | must not, because it is hidden from the eye and never wraps |

**The Board's ground rows and in-place time boxes, while the caret is on the Board** (the day panel `#sbBoard`, written
by `SchedBoard.tsx put`; its blocks are the day bar and one `.sb-sec` per section, `board.ts boardHTMLBody`):

| # | Section, and what it draws | Part A — has it / must not, because… / MISSING |
|---|---|---|
| B1 | Ground Programme — each row's START / END boxes (`gr:<day>.<row>.str/.end`), an input's copy of its times | has it — written at once when the caret is in another section (the fault) |
| B2 | Personal Inputs — an input's own START / END / remark boxes (`data-ifld`) | has it when the caret is elsewhere (a time typed in the Ground Programme row now reaches it at once); must not while the caret is in it, because the section is written whole and would take the box from under the caret — caught up the moment the caret leaves (`board.ts`: the box just left reads the saved time at once) |
| B3 | Common Programme — an ALL / ALL AVAIL input's row (`gr:` keys, D955) and the programme rows' times | has it |
| B4 | Unavailable — one man's row of an input, its boxes (`data-ifld`, `iu:`) | has it |
| B5 | SANS, Available crew — who is free, worked out from the inputs | has it |
| B6 | Flying waves — R, B, take-off, landing, area time, the In-time lines | has it when the caret is elsewhere; inside the caret's own wave section the header's "(prev day)" is corrected in place (W16), the rest waits — as before |
| B7 | Duties, Sims — their times | has it |
| B8 | Notes, the day bar (Templates, OIL Earn) | has it |
| B9 | Outside the day panel: the sign strip, the warning list, the crew column, the day chips | has it — already written under the caret since W15 (6 Oct 26); unchanged |
| B10 | The week behind the open Board (hidden under it) | must not, because the week waits for the caret in a Board box and writes once it leaves (`EditWeek.tsx`, unchanged) — and it is not on screen while the Board is open |
| B11 | A frozen look at a published version or a plan (`DPREV`) | must not, because it has no boxes and is never written under a caret |
| B12 | Inside the caret's own section, its other rows (another row's copy of the same input in the same section) | must not, because the section is the smallest block written — waits for the caret to leave the section (the week's own grain is the same, W15) |

## 3. Each fault's cause

1. **The note's box.** The note names what was typed ("<value> is not a time. Try 0900 or 09:00."), and its box broke
   lines only at spaces, so a 60-letter value with no space was wider than the phone's box and ran past its border.
   Fixed by `overflow-wrap:anywhere` on the box (`ui/toast.ts`): a word is broken only where it cannot fit, so no
   ordinary note moves; `anywhere` rather than `break-word` so a desktop's box, as wide as its words, cannot be widened
   off the screen by one either.
2. **The Board's Ground Programme row one change behind.** The Board draws the whole day as ONE panel, and while the
   caret was anywhere in it (Tab takes it on to the row's End box) the panel was not written at all — the week writes
   every block but the caret's (W15), the Board did not; so the Ground Programme row showed the time from before the
   save until the next paint after the caret left, which the walker's next tap-away brought, one change late. Fixed by
   writing every section of the Board's day except the one the caret is in (`ui/dayswap.ts swapKidsAround`, called from
   `SchedBoard.tsx put`; the caret's section remembered as owed, as the week's is); it covers every section of the
   day, not only this row (roll-call B1–B8).

## 4. The tests (red first)

| Test | Before the fix | After |
|---|---|---|
| `src/ui/board-heldpanel.test.tsx` — the Board in the test browser: an input filed 08:00–10:00, its start typed 0900 then 0800 in its Personal Inputs box with Tab; the Ground Programme row read with the caret still on the Board (2 of 3 red on `main`'s `SchedBoard.tsx`: "expected '08:00' to be '09:00'"); the caret's own box the same node; a change put back under the caret (a direct write, not a control — the control route, Undo pressed, is Part B's) reaching both rows; `swapKidsAround`'s writes and three fallbacks. **Part B added five, each red first:** a section dragged and the day changed under the caret (Fable's B2, B4 — red on the first cut), the section left behind written by the next paint (the break (4) list), the week changed under the caret (the fresh Opus read's and Astra's finding 1 — red: the new week's sections written around the old week's flying), the caret clicked into another section with nothing typed (Fable's B3 — red: the section left stayed old) | 2 failed, 1 passed; each Part B test red on the code before its fix | **10 passed** |
| `e2e/inputs-batch2.spec.ts` "the note's box" (3 tests) — a real Chromium on the built app: a phone 390 and 320 wide, a take-off box on Edit Schedule tapped, 60 letters typed, Tab; the note's words measured against its own border, nothing running over; a desktop's ordinary note still one line | Part A: not run (the lock stayed with chat 174's walks for the whole 40-minute ceiling). **Part B, under the lock, 02:56 on 25 Nov: on `main`'s `toast.ts` 2 failed, 1 passed** — the words' right edge at 399.6 against the border's 361.5 (390 wide) and 291.5 (320 wide) | **3 passed**, and the whole file 20 of 20; GitHub's run of `5b524f1ab` green with them |
| The note's box itself, in a real Chromium and WebKit, without building the app (`D:/rw4/night3/r4wf-notebox-proof.mjs`, a scratch script, not committed): the box made with `toast.ts`'s own inline style read from the file, placed as a phone places it, the 60-letter note's words measured against its inner edge at 402, 390 and 320 | words past the edge by 31, 43 and 113px, both browsers (the stand-in font is wider than the app's; the walk measured about 10px) | inside by 1–2px, both browsers; an ordinary two-line note and a one-line note: the same right edge and the same number of lines before and after |
| The touched suites — `schedule-tab`, `dayswap`, `undo-caret`, `textcaret`; the Board's (`board`, `boardwrap`, `oilmode`, `words-r1b`, `board-stores`, `boardmenukeys`, `boardescape`, `boardkeys`, `amendretest`, `audit-b-bugs`, `audit-gesture-bubble`, `pubsweep`); the note's (`toastplace`, `toastbatch`, `toastblocked`); the two that read the source (`inputs-readers`, `perms-scan`) | — | all green: 80, 384, 29 (with the new file) and 31 tests |
| `npx tsc -b` · `npm run lint:changed` (React Doctor) · `npm run docsize` | — | clean · no new finding · OK |

## 5. The sizing lines (§7.0) — proposed in Part A, settled before any walker starts

1. **The type of change:** E (the note's box — one style on the one element every note is drawn in) and D (the Board's
   paint: each of its sections is now written on its own while the caret is in another — the same rows drawn by the
   Board's several sections).
2. **What only a walk could find here:** for the note — an ordinary note's lines or width moved anywhere (phone foot
   and top, above the OIL bar, the desktop, the refusal face, amber), and WebKit's line breaking at his iPhone's 402,
   the real note raised by a typed time in each kind of time box (the week, the Board, an input's row). For the Board
   — a section written under the caret that moves the box he is typing in, takes his caret, or loses a half-typed
   value; each kind of section with the caret in it (waves, duties, sims, ground, Personal Inputs, Unavailable, the
   Common Programme, notes); a section dragged to another order; the phone's folded Personal Inputs; Undo and Redo
   pressed with the caret in a box; closing the Board; a reload; WebKit's own commit on Tab. The tests prove the
   paint in the test browser and the note's box in Chromium; none drives WebKit or the walk's orders.
3. **What the ledger says:** E — ten walks, four found something (six faults), and his own look has found what a walk
   did not on layout; D — ten of ten walks found something. This fault itself was found by a walk (round 4's c and d).
4. **The walk chosen (proposed):** one fresh Opus walker under Low, on a frozen build of this branch beside `main`'s;
   the scenarios from Astra and a fresh, blind Fable, combined; desktop 1440 × 900 and his iPhone's 402 × 874 with
   touch, WebKit at 402 for the note's box and the Board's Tab; plus the plain-user round of the Board's ground rows
   (an input filed, its times changed on the Board's two rows and the week's, the Board closed and reopened, the
   Inputs page, the bell). About 12 scenarios; the 320-wide phone and the desktop's one-line note carried by the
   browser test (it presses the real box, a real tap and keys).
5. **After the walk:** its row in `docs/walk-ledger.md` (Part B).

## 6. The rulings that apply (checked against the running build in Part B)

D828 (a phone's note: the screen's width less a small margin; the desktop's as it is) · D731 (1) (with a window up on a
phone the note is at the top) · D1668 (the refusal's grey face) · D509 (a timing warning shows in the warning list while
he types — the Board now keeps every section up, not only the list) · D551–D555, D597 (the Tab route; its catch-up kept)
· D739 (a time typed on a shared input's row changes the input for everyone) · D1047, D1080 (one tap then typing
replaces a time). None is changed.

## 7. The scenarios (Astra and a fresh, blind Fable, each blind to the other; the host combining)

The one brief: `../superpowers/briefs/2026-11-25-r4-walk-faults-scenario-brief.md`, each reading an exported copy of
`5b524f1ab` (`D:/rw4/night3/copy-b`) with this sheet and the job's brief blanked and the change as a diff. The two lists,
whole: `../superpowers/briefs/2026-11-25-r4-walk-faults-scenarios-astra.md` (Astra, gpt-6-astra, high; 15 scenarios
S01–S15) and `…-scenarios-fable.md` (a fresh Fable; 13, B1–B10 and N1–N3, and a "what is missing" table). Neither saw
the other's; neither had a handoff block pasted.

**What Fable's design found before any walk — a fault in this change, fixed red-first (commit `ab9aec9fb`).** The first
cut matched the Board's sections by place and count alone. A change leaving as many sections but in another order or of
another day — a section dragged or its drag undone (B2), the day arrow with the caret in an In-time line (B4), OIL Earn
on a day whose sections then number the same (B1) — wrote one section twice and lost another while the caret stayed on
the Board. Proved by two tests that failed first ("0.inputs" drawn twice and "0.ground" lost; day 1's sections around
day 0's waves); fixed by knowing each section by which section it is (`dayswap.ts blockId` — a section by its day and
name) and writing nothing unless every place holds the same one, as before this change. Not a fault: Fable's B3 — the
section the caret LEFT, with nothing new saved, catches up only at the next save or when the caret leaves every box;
before this change the whole Board did. Kept as RECORD for the walk (W6) at first; then, on the host's clearance, fixed
red-first in Part B (§16) and walked as H2 (§8).

**Combined** — one list, each scenario once, every EXPECTED line with its source; the presses are in the walker's brief,
`../superpowers/briefs/2026-11-25-r4-walk-faults-walk-brief.md`: W1 the plain-user round of an input's two rows (B5,
S06) · W2 the other rows an input stands on — shared, ALL / ALL AVAIL on the Common Programme, Unavailable with the
warning list, a folded Personal Inputs, a refused time (B6, S05, S11) · W3 one man's row of a shared Unavailable input
twice (S01) · W4 OIL Earn pressed with the caret in a box, a two-wave day (B1, S02) · W5 Undo / Redo with the caret in a
box, after a section's move and after a typed time (B2, B7, S04) · W6 the caret moved to another section with nothing
typed, RECORD (B3) · W7 leaving the day with the caret in a box (B4, S09) · W8 the box never moves (B8, S03) · W9 a row
removed in another section, RECORD (B9) · W10 a re-ordered day and the Tab route (B10, S07, S08) · W11 frozen and
read-only (S10) · N1 the long word at every door (N1, S13) · N2 no ordinary note moved (N2, S14) · N3 widths between a
phone and a desktop, RECORD (N3, S13) · N4 where the note stands over windows, RECORD (S15). Set aside, with why: S12
(a published input's OIL and its pending count) — nothing in this change touches what is saved, counted or compared;
the same save path as `main` (§1 questions 1–3).

## 8. The orders walked, and what the screen said — Part B

Every order run on two frozen builds served inside the test browser: `main`'s (`D:/rw4/build-new3`) and this branch's.
Page errors: none on any run. The walker (one fresh Opus under Low, its brief
`../superpowers/briefs/2026-11-25-r4-walk-faults-walk-brief.md`, its report whole in `parts/r4wf/walk-report.md`) ran on
`build-fix2` (the first cut plus the matching by section); the host's own run (`scripts/handpass/r4wf-host.mjs`) ran on
`build-fix3` — built at 03:58 from the code as committed now, the reads' fixes in it.

| Order | Where, how | `main` | This branch |
|---|---|---|---|
| N1 (a), N3 — the 60-letter value typed in the week's take-off box, Tab; the note's letters measured against its inner edge (walker, `r4wf-note.mjs`) | phone 402 Chromium and WebKit, 320 both, 621, 768, 900, the phone on its side, desktop 1440 | FAIL at 402 (letters to 399–400 against an edge at 373) and 320 (past the screen) | PASS everywhere: inside the edge by 0–2px, 2 lines at 402, 3 at 320; 621 and 768 narrower (311, 384 wide — the word now breaks instead of widening the note: RECORD); 900, side, desktop identical |
| W1 steps 1–4 — an input filed 08:00–10:00 (Training, Ranger); on the Board its start 0900, then 0800, its end 1130, a remark typed in Personal Inputs, each with Tab (walker, `r4wf-w1.mjs`) | desktop Chromium, phone WebKit with touch | FAIL: the Ground Programme row one change behind on steps 1, 3, 4 (`w1-main/…step1.png`); caught up on a click on blank space | PASS: the row read 09:00, 08:00, 08:00–11:30 and the remark at once; the caret moved on each time; after a reload stored 08:00–11:30 with the remark |
| H0 — the day panel's blocks named (host) | both | RECORD: the day bar and ten sections, in order | the same |
| H1 — W1 step 5: the Ground Programme row's own START typed 0830 | both | FAIL: Personal Inputs still 09:00 (`host-main/h1-phone-webkit-ground-0830.png`) | PASS: Personal Inputs 08:30 at once, saved 08:30, the caret on the row's end box (`host-fix/h1-…`) |
| H2 — Fable's B3: Personal Inputs start typed, then the Ground Programme row's remark box clicked, nothing typed | both | FAIL: the section left not written | PASS: written at once (its start box a new node), the caret in the remark box (`host-fix/h2-desk-chromium-b3.png`) |
| H3 — W5 (b): start 0915, Tab, the Board's Undo pressed, then Redo | both | PASS | PASS: both rows 08:00 then 09:15, each section once; on WebKit the Undo press leaves no caret |
| H4 — the Board closed by Done; the week's two rows; a reload | both | PASS | PASS: the week reads 09:15; stored 09:15–10:00 after the reload |
| H5 — W2 (a): a shared input (Ranger and Hex), its end typed 1430 under Personal Inputs | both | FAIL: its one Ground Programme row still 14:00 | PASS: 14:30 at once, both people on the row (`host-fix/h5-desk-chromium-shared.png`) |
| W4 — OIL Earn pressed with the caret in a box, Sat 18 Jul (walker, `r4wf-secs.mjs`) | both | RECORD: every section once, one order | RECORD, the same — but the state was not made: the press took the caret (desktop to the button, WebKit to the page); carried by the test of the day changed under the caret |
| N2 — five ordinary notes measured: plain, amber, red, refused, the publish note (host) | desktop Chromium, phone WebKit | RECORD | identical on both builds: place, width, height, lines, colour and border (`host-fix/n2-phone-webkit-receipt.png`, three lines at 378 wide) |

## 9. The cases carried by a test, each with what it proves

| Case | Test | What it proves, and how |
|---|---|---|
| The 320-wide phone and the desktop's ordinary one-line note | `e2e/inputs-batch2.spec.ts` "the note's box" | in Chromium on the built app, through the real take-off box, a real tap and keys |
| A section dragged, and the day changed, under the caret | `src/ui/board-heldpanel.test.tsx` "a change of order or of day writes nothing…" | in the test browser; the drag by the store's own command, the day by the arrow's own handler — the walk presses both (W5 (a), W7) |
| The section left behind is written by the next paint | the same file, "the caret moved on to another section…" | a paint with nothing new saved — a direct `notify()`, not a control |
| A change put back under the caret | the same file, "the input put back under the caret…" | a direct write of the input — Undo pressed on screen is W5 (b) |
| Every fallback that writes nothing (a section added, removed, swapped, another day's, unwrapped, loose words, nothing known) | the same file, "dayswap swapKidsAround…" | the swap called directly on a made-up panel |

## 10. The pictures — Part B

96 pictures in `../img/handpass/2026-11-25-r4-walk-faults/` — `n1-main`, `n1-fix` (the long note at nine sizes), `w1-main`,
`w1-fix` (W1 steps 1–4), `secs-main`, `secs-fix` (W4, W5 (a)'s attempt), `host-main`, `host-fix` (H1–H5, N2), each run's
`facts.json` beside them. Opened by the host, the ones that decide: `w1-fix` and `w1-main` phone WebKit step 1;
`n1-fix` and `n1-main` phone WebKit; `host-fix` and `host-main` H1 phone WebKit (Personal Inputs 08:30 against 09:00);
`host-fix` H2 desktop (the caret in the Ground Programme remark box, Personal Inputs 08:00); `host-fix` H5 desktop (Sim
brief 13:00–14:30 on both rows); `host-fix` N2 phone WebKit, the publish note (three lines inside its border).

## 11. The break tests and the browser test's red run

`scripts/handpass/breaks/r4wf.json`, run by `scripts/handpass/breaks.mjs` (each line broken alone, the Board's test file
run, the line put back): **8 of 8 caught** on the last run, after the reads' fixes (`D:/rw4/night3/r4wf-breaks3.txt`) —
the six below, then (7) the week's guard taken out of `put` (the reads' finding 1) and (8) the paint on leaving a section
taken out of the focus-out listener (Fable's B3), each caught by its own test. The first six — (1) the whole day held again while the caret is in it (the fault); (2)
sections matched by place alone (Fable's B1, B2, B4); (3) the caret's section written under it; (4) a held section
remembered as what it would show, not as owed — caught by "the caret moved on to another section…", written before
the run because none of the earlier tests could have caught it (the panel's record was dropped either way, so the
paint after the caret left wrote it whole); (5) loose words no longer stop the write; (6) a section
removed no longer stops the write — at first NOT caught (a section ADDED was caught through the blocks' names), so a
removed section was added to the fallbacks' test and the break run again: caught. The note's box cannot be broken in
the test browser (it lays nothing out): its break is the browser test's own red run on `main`'s `toast.ts` (§4).

## 12. Errors seen — Part B

None: no page error and no console error on any run of either build (each run's `facts.json`).

## 13. What was NOT walked, and why — Part B

The walker, under Low, walked N1, N3, W1 steps 1–4 and W4 before its room ran out; the host walked H1–H5 and N2 itself
rather than start another walker in the night. Not walked:
- W2 (b)–(e) — ALL / ALL AVAIL on the Common Programme, Unavailable with the warning list, a folded Personal Inputs, a
  refused time; W3 (one man's row of a shared Unavailable input twice); W8 (the box never moves, measured); W9 (a row
  removed in another section); W10 (a re-ordered day and the Tab route); W11 (frozen and read-only). Each is a section
  written beside the caret by the same one swap the walked orders drive; the swap's fallbacks and the Tab route's
  catch-up are carried by tests (§9 and the Board's suites, §4).
- W4 and W7 with the caret kept through the press — not made by the test browser: OIL Earn's press and the day arrow
  took the caret. Carried by the test of the day changed under the caret, and the week's by its own test.
- W5 (a), Undo after a section's drag — the drag not made; carried by the drag test (§9).
- N1 (b)–(f), the long word at the other time boxes, and N4, where the note stands over windows — the one style is on
  the one element every note is drawn in; N2 shows ordinary notes unchanged.
- **Astra's finding 2, the Blue/Red question put back with the caret's box held in place — not walked and not tested**
  (no question could be opened in the test browser; §16). A WebKit look on a phone is owed.

The second walk (25 Nov 26, sent by the host) walked these orders and Astra's finding 2: §18.

## 14. The gate counts — Part B

- Local, on the code as committed: the Board's held-section file 10 of 10; the touched suites (§4's list) 22 files,
  522 tests, all green; `npx tsc -b` clean; `npm run lint:changed` "no new finding (15 changed files read against
  origin/main)"; the browser test "the note's box" 3 of 3 under the lock (§4).
- GitHub, the pull request's run on `60e594d29` (the last push before the reads' fixes): every check green — unit
  (raptor 6, leavewar 4), geometry (raptor 4, Leave War 3), the Tracker smoke 2, the code check, the build, the Docs
  guard, the secrets scan. The run on the commit carrying the reads' fixes: §17.

## 15. What the walk found, and each disposition — Part B

- **Both faults shown on `main` and gone on this branch** (N1 at 402 and 320; W1 1, 3, 4; H1; H5), on desktop Chromium
  and phone WebKit.
- **No new fault found by the walk.** The faults Part B found came from Fable's scenario design (the matching by place,
  fixed in `ab9aec9fb`) and the two reads (§16).
- RECORD, for his look — not a fault: at 621 and 768 wide, a note holding one unbroken long word is now narrower (311,
  384 wide) because the word breaks; before, the note widened to fit it. Ordinary notes are unchanged (N2).
- RECORD: the Undo press on a phone leaves no caret (as on `main`).
- Left for the host to file (this job does not write the backlog): the orders not walked (§13); the WebKit look owed for
  Astra's finding 2; the readers' tidiness notes (§16).

## 16. The code reads (Astra and a fresh, blind Opus — the same brief) — Part B

The brief: `../superpowers/briefs/2026-11-25-r4-walk-faults-read-brief.md`, each reader blind to the other, to the
walk's report and to this sheet. Saved whole: `…-read-astra.md` (Astra, gpt-6-astra, high) and `…-read-opus.md`.

| Claim | Reader | What became of it |
|---|---|---|
| 1. The week stepped on the Board with the caret in a box: the same weekday's sections carry the same names, so the new week's sections were written around the old week's flying section | both — the fresh Opus (finding 1) and Astra (finding 1) | **Reproduced as a failing test** ("the week changed under a caret…", red on the first cut), **fixed**: `put` writes section by section only while the navigation has not moved since the panel was last written whole; otherwise it writes nothing until the caret leaves. Break (7) catches its removal |
| 2. The Blue/Red question put back after a paint outside the guard that keeps the caret's box in its place on screen — the box can jump when the question's height changes | Astra (finding 2) | **Fixed by reading, not proven by a test**: the put-back is now inside the same guard (`holdingPlace`). No test could open a question in the test browser (three ways tried); the test was removed rather than kept as one that proves nothing. **A WebKit look owed** |
| Tidiness (filed, not fixed): the fix's story told in three comments; `held` meaning two things; `put`'s caret branch dense; one length check implied by another | both | left for the host to file |

Fable's B3, cleared by the host, built red-first: when the caret moves to another section of the Board and a section it
left is owed, the focus-out listener paints at once (`dayswap.ts owesBeside`); break (8) catches its removal.

**What changed in `SchedBoard.tsx` beyond `put` and `panelKids`** (for the overlap with the two other chats): the import
line (adds `owesBeside`); the focus-out listener `resume` — its `if (editingText()) return` now paints when a left
section is owed (B3, cleared); and the paint effect's `reconcileMissionRoleOffer()` call wrapped in
`holdingPlace(caret, …)` when a caret is on the page (Astra's finding 2 — not cleared beforehand; one line).

## 17. The close

`Walk: docs/handpass/2026-11-25-r4-walk-faults.md · 319 pictures (96 of the first walk and the host's run, 223 of the second walk, §18) · 4 surfaces (the passing note; the Scheduler Board's sections and its day panel; Edit Schedule's week; a reload) on a desktop 1440×900 and his iPhone's size 402×874, Chromium and WebKit, main's build beside the fix · orders walked: N1 (a)–(e), N2, N3, N4 (part), W1, W2 (b)–(e), W3, W5 (a) without a caret, W8–W11, H1–H5 · MISSING: fixed — both faults, Fable's matching by place, the reads' week fault, B3; proven by the second walk — Astra's finding 2 (the caret's box moved 77–117px on the build without its line once the browser's scroll anchoring was off, 0 with it; the line stays); could not be made by a person, so not walked — W4, W7 and W5 (a) with the caret kept through the press; not walked — N1 (f), N4's "OIL not answered" bar; FOUND, OLDER — W3: on the Board's Unavailable list one man's row of a shared leave, after its first change gives him a leave of his own, still saved his next changes (the end time, the remark) onto the OTHER man's leave until the caret left the section; the same on main then, not made or worsened by this change; FIXED SINCE by pull request 845 (live 25 Nov 26) and PASS on both builds with main brought in (§19) — not a new fault, not filed`

Corrected by chat 183 on 25 Nov 26: W3's ending read "NOT FIXED … filed for a job of its own"; that job was pull
request 845. The merge round's own `Walk:` line closes §19.

The line above was rewritten by the host (chat 170) at 05:00 on 25 Nov 26, after the second walk (§18); the helper's own line, as it stood: 96 pictures, 10 orders (N1, N2, N3, W1 1–4, W4, H1–H5).

`Docs: OUTSTANDING 191 items (+0 −0) · DECISIONS D1–D2603 · homes OK`
`docsize: OK`

GitHub's run on the commit carrying the reads' fixes, this sheet and the walk's files: read to its end by the helper
and given in its closing report to the host (`D:/rw4/night3/notes-for-the-host.md`), not pushed here, so the run is not
restarted by a notes push.

## 18. The second walk (25 Nov 26, sent by the host)

A fresh Opus walker, the orders of §13 and Astra's finding 2, on `build-fix3` (searched: it carries all three source
changes of `ebff3189b` — it was built before that commit was made) and `main`'s `build-new3`; task B also on
`build-fix2` (the first cut, without the Blue/Red line). Desktop Chromium 1440 × 900 and phone WebKit 402 × 874 with
touch; task B also desktop WebKit. No page or console error on any run. The report whole, with every number:
`parts/r4wf/walk2-report.md`; pictures and each run's facts: `../img/handpass/2026-11-25-r4-walk-faults/walk2/`;
scripts `scripts/handpass/r4wf-w2-*.mjs`.

**Astra's finding 2 — proven with the browser's own scroll anchoring switched off, not visible with it on.** The
question raised (Blue/Red tracking on, "DS FOR RU" in a formation's Remarks), a callsign typed in the second wave with
Tab, then a box under Personal Inputs clicked and a time typed with Tab: the flying section is rewritten with the
question open and the caret below it. The box holding the caret moved: anchoring on — 0px on `main`, the first cut and
the fix, in all three browsers; anchoring off (`overflow-anchor:none`) — the first cut **+85px** (desktop Chromium),
**+117px** (phone WebKit), **+77px** (desktop WebKit), the fix 0px, `main` 0px (nothing of the day rewritten under a
caret). Astra's own steps ("+ Line" pressed with the caret in a Ground Programme box) cannot be made: the press takes the
caret. Whether his iPhone's Safari anchors this list was not checked.

| Order | `main` desktop / phone | This branch desktop / phone |
|---|---|---|
| W2 (b) ALL AVAIL start under Personal Inputs → Common Programme row | FAIL / FAIL (still 08:00) | PASS / PASS (07:30 at once, first in order) |
| W2 (c) a leave's end in Unavailable → Available crew, warning list | FAIL / FAIL (Available crew not rewritten) | PASS / PASS |
| W2 (d) the phone's folded Personal Inputs | PASS / PASS | PASS / PASS |
| W2 (e) "abc" refused | PASS / PASS | PASS / PASS |
| W3 one man's row of a shared timed leave, three edits | **FAIL / FAIL** | **FAIL / FAIL** — the second and third edits saved onto the other man's leave (below) |
| W8 the box holding the caret, at every Tab | PASS / PASS (0px) | PASS / PASS (0px) |
| W9 a row rejected while another holds a half-typed remark | RECORD / RECORD | RECORD / RECORD — the remark on its own input only |
| W10 the Tab route; a re-ordered day | PASS; FAIL (the old fault) | PASS; PASS |
| W5 (a) Undo / Redo of a drag, each section once | PASS / PASS | PASS / PASS |
| W4, W5 (a), W7 with the caret kept through the press | COULD NOT BE MADE — no person can: each press takes the caret, and the Tab route never reaches those buttons | the same |
| W11 the member; a frozen issued version and back to live | PASS / PASS | PASS / PASS |
| N1 (b)–(e) the long word at four more doors | PASS / FAIL (letters to 399 against 373) | PASS / PASS (372 against 373) |
| N1 (f) template time boxes | NOT WALKED | NOT WALKED |
| N4 the note with an input's window up | RECORD — at the top on the phone | RECORD — the same place, letters inside |
| The week, the Inputs page, the bell after a change on the Board | the Board's row stale until closed; the rest agree | all agree; Ranger's bell the same lines as `main`'s |

**W3, the one FAIL on this branch — older than this change (the same on `main`), and it hurts new data.** A leave for
Ranger and Hex, Wed 15 Jul 08:00–10:00; on the Board's Unavailable list, Ranger's row: start 0900, Tab; end 1100, Tab;
remarks "own hours", Tab. Expected: Ranger 09:00–11:00 "own hours" on a leave of his own, Hex unchanged. Seen: the first
Tab gives Ranger his own leave (09:00–10:00), but his row, in the section holding the caret, keeps the shared leave's
address, so the end and the remark go onto **Hex's** leave: once the caret leaves, Hex 08:00–11:00 "own hours", Ranger
09:00–10:00 (`walk2/w3-fix3-phone-webkit/w3-phone-webkit-caret-left.png`). Left for the host; nothing fixed.

**Since fixed on `main` (chat 183, 25 Nov 26):** this W3 is the fault pull request 845 fixed (`2026-11-25-shared-row.md`;
chat 177 took it from this walk). §19 re-walks it with `main` brought in: PASS on both builds.

## 19. The merge round — `main` brought in, and the two changes walked together (chat 183, 25 Nov 26)

**What changed.** `main` at `1993bed86` merged into the branch (`0ff30dbdf`, 198 commits — pull request 845's shared-row
fix among them). Only `docs/file-map.md` and `docs/walk-ledger.md` clashed, both sides kept; `src/ui/toast.ts` merged
by itself; no source line was written by hand. This branch's own change is as §3 and §16 left it.

**The eight answers, asked again of the merged code:** unchanged — NO to 1, 2, 3, 5, 6, 7, 8 (this branch still saves
nothing and reads no stored state; what a box saves, and onto whose input, is `main`'s code, untouched here), YES to 4.
**Tier: WALK**, run as a re-walk of what the merge touched (the order's §5), with the scenarios where the two changes
meet designed afresh by Astra and a fresh, blind Fable (D2443). **No further code read:** nothing was written, and what
was missing was the two running together (the order's §4 — drive the app). No fix followed, so none is owed.

**Where the two meet — the host's reading, then walked.** 845 was built and walked on a Board that held its WHOLE day
while the caret was in it; with this branch only the caret's own section is held. On the section holding the caret
nothing differs from `main` (one man's row keeps the shared leave's address there, and every door on it asks which
input it stands for now — `engine/rowinput.ts`); every other section is rewritten sooner, and a section the caret has
left is rewritten when the caret lands in another — so a row carries an out-of-date address for a shorter time, never a
longer one. One new state follows: after a visit to another section the Unavailable rows are redrawn under the caret
with fresh addresses (a man now alone on an input reads its bare id) — on `main` that happened only once the caret left
the Board. X1 and X3 below walk it.

**The roll-call rows added** (SHOW / USABLE / PAINTED, each walked on the merged build beside `main`'s):

| # | Where the two meet | Mark |
|---|---|---|
| R1 | One man's row of a shared leave, the caret in it (held): its three boxes | has it — as on `main`: W3, A1–A6, A9, A10 |
| R2 | The same row's buttons while held — the leave's name, Reject, the LATE chip, his puck then a name, a name dragged onto it | has it — A7 (a)–(e); X4, X6 |
| R3 | The same row after the caret only VISITED another section (redrawn under the caret, fresh addresses) | has it — X1, X3, X5, X7, M8 |
| R4 | Available crew, the Common Programme's ALL AVAIL count and its open window, while his row holds the caret | has it at once (on `main` one change behind) — M1, M9, M10 |
| R5 | Personal Inputs (open, and its folded count) and the Ground Programme, for an input that changes section from his held row | has it at once — X4, M2, M3 |
| R6 | The warning count and a flying puck's clash mark | has it — X3 |
| R7 | An open Blue/Red question above his row | has it — M11 (desktop); the phone's answer tap: see the findings |
| R8 | The passing note raised from his row (a long word) | has it — X10 |
| R9 | A published day: the changes count, the changes window, the member's issued copy | has it — M8 |
| R10 | OIL Earn switched on with the caret in his row | must not differ from `main`, because a mode change writes nothing under the caret (§2's B11 family) — X9: identical |
| R11 | The week behind the Board | must not, because this branch does not change the week's paint (§2's B10) — the shared-row job's week walk stands |

**The sizing lines (§7.0).** (1) Type D (one row drawn by several sections) and E (the shared paint), as §5.
(2) What only a walk could find: a door of 845's that assumed the row stayed on screen until the caret left the Board;
the caret crossing sections mid-change; Undo and Redo; the Tab route across a section's edge; WebKit's taps. (3) The
ledger: D ten of ten, E four of ten. (4) Chosen: the host's own short walk first (W3, four engine-and-size pairs on each
build); then every Board script of both jobs re-run unchanged on the merged build, one at a time; then the two
designers' 21 scenarios combined to 19 and fanned out to two Opus walkers (D2256) on the two frozen builds, desktop
1440×900 Chromium and his iPhone's 402×874 with touch in WebKit; none set aside (Astra's M4–M7 are walked as Fable's
X6, X5, X7 and X10, the same presses). The §7.11 lessons that apply: 3 and 30 (a picture at the lift and settled), 16
(after a refusal the figure shown is typed again — A5), 20 and 21 (a press that keeps the caret is his iPhone's; named
below as his look), 25 (the row made through the Inputs page's window, as a leave, an overseas duty, a Meeting and an
ALL AVAIL), 26 and 27 (the box under the caret measured before and after, 0px); the rest are about layout or a hidden
page, which nothing here changes. (5) The ledger's row: added.

**The builds, frozen:** merged `D:/rw4/r183/build-merged-0ff30dbdf` (`index-B9okpSpf.js`); `main`
`D:/rw4/r183/build-main-1993bed86` (`index-DCU_WN_H.js` — the very bundle the shared-row job's last re-walk ran on).
The fixtures were filed through the Inputs page's own window in every run; the store was read after every step.

**The scenarios:** the brief `../superpowers/briefs/2026-11-25-r4-walk-faults-merge-scenario-brief.md`; Astra's list
(M1–M11) and the fresh, blind Fable's (X1–X10) whole beside it (`…-merge-scenarios-astra.md`, `…-fable.md`), each read
an exported copy of `0ff30dbdf` blind to the other; the combined walk, with every EXPECTED line's source:
`…-merge-walk-brief.md`.

**What was walked, and what the screen and the store said.**

| Walk | On | Result |
|---|---|---|
| **W3** (`r4wf-w2-w3.mjs`, unchanged) — Ranger's row of the shared leave: start 0900, end 1100, "own hours", each by Tab | merged and `main`, each on desktop Chromium, desktop WebKit, phone WebKit, phone Chromium | **PASS × 8.** After each Tab the store reads Ranger alone on a leave of his own (09:00–10:00, then 09:00–11:00, then "own hours"), Hex 08:00–10:00 with no remark on the original; the same step for step on both builds. Opened by the host: the phone WebKit and desktop pictures of the merged build (`merge/w3-merged-0ff30dbdf-*/`) |
| **The shared-row job's Board walk** (`shr-a-a1…a13.mjs`, A7 (a)–(e), unchanged) | merged, desktop Chromium and phone WebKit — 33 runs | 47 PASS, 29 RECORDED, 6 FAIL, 2 NOT WALKED, no page error. The 6 FAILs are A5's end-before-start rows on each size — saved, not refused, on any Unavailable row: his decision of 11 Aug 26, ruled not a fault in that job's sheet. NOT WALKED: A11 on the desktop (a member has no door to the Board — as that job recorded) and A8 on the phone (a desktop-only order in that job; the desktop run PASSES). One run (A7 (b), phone) printed its results and then hung closing its browser; stopped by hand, its two rows PASS |
| **This branch's own orders** (`r4wf-w1`, `-w2-a`, `-w2-a2`, `-w2-b`, `-note`, `-secs`, `-host`, unchanged) | merged, desktop Chromium and phone WebKit; `-w1` and `-w2-a` on `main` beside it | On the merged build: the Ground Programme row follows each change at once (`-w1`, 10 of 10 at each size); the first walk's orders W2 (b)–(e), W10, W11 and the long word at four more doors PASS on the desktop, and on the phone all but the two rows named below; the re-ordered day and Undo / Redo of a drag PASS (`-w2-a2`); the box under the caret with a Blue/Red question open 0px, 7 of 7 (`-w2-b`); the note 9 of 9 at each size (`-note`); the host's run 14 PASS, 12 RECORD. On `main` beside it the two old faults still show (`-w1` 6 FAIL; W2 (b); the long word on the phone) — this branch's fixes still matter on today's `main`. **Three rows are the scripts' own, each the same on both builds:** `-w2-a`'s W3 returned FAIL because its record reader looked for an ISO date the records do not hold, so it could not see a man's own leave — it had only ever run while the fault stood; mended (one condition) and re-run: PASS on the merged desktop and phone and on `main`'s phone (`merge/r4wf-w2-a-w3fix-*/`). Its W10 on the phone counts one "went back up" where the phone scrolls the next box into view — the boxes and their order are the desktop's, which passes, and `main` reads the same. `-secs` stops with a script error after its OIL Earn step on `main` as on the merged build (its next control is not pressable in that mode on today's `main`); its Undo, Redo and day-step orders are walker A's X7 and X9 and `-w2-a`'s KEEP rows |
| **X3, X5, X2, X8 (b), M3, M1, M11, M10, M8** (walker B, `parts/r4wf/merge-walk-b.md`) | both builds; desktop Chromium, X3 and M11 also phone WebKit | 10 PASS, 10 RECORD, 2 FAIL (X8 (b), the same on `main`), 2 COULD NOT BE MADE (M11's answer tap in the test phone), no page error. On the merged build the rows are rewritten the moment the caret is in another section, in the order Ranger, Hex, Outlaw, and every save reaches the right man (X3: three leaves, never a fourth); the ALL AVAIL count, its open window and Available crew agree at once (M1: 36 with Ranger, where `main` still reads 35 until the caret leaves); a shared Meeting stays ONE input for both men (M3); the box under the caret moved 0px with a Blue/Red question open (M11); a published day reads "1 pending", the change is Ranger's own, the member still sees the issued times (M8) |
| **X1 (a), (a′), (b), (c), (d), X4, M2, X6, X7, X8 (a), X9, X10, M9** (walker A, `parts/r4wf/merge-walk-a.md`) | both builds; phone WebKit, X6 and M9 also desktop Chromium, X10 also 320 wide | 16 PASS, 2 RECORD, 4 FAIL (X8 (a) on both builds; X10 on `main` only — this branch's own old fault, gone on the merged build), 12 COULD NOT BE MADE in part, no page error. **X1 — the designer's top prediction (a time typed on a redrawn row after Undo put both men back on one leave) cannot be made by a person:** the app's own Undo takes the caret, on both builds, by a WebKit tap, a Chromium tap and a scripted click alike; the rest of each order, walked with a fresh tap, reached the right man alone. Reject on his held row took only HIS duty, the box moved 0px (X4); an armed puck's ring stayed on his row across the rewrite and the name replaced him, not Hex (X6, desktop — on the phone the crew list covers the other section's boxes) |

**Findings, each reproduced by the host and each the same on `main` — none made or worsened by this branch; filed,
not fixed** (`OUTSTANDING.md` `[SHARED-ROW-HELD-LEFTOVERS]` (4)–(7)):

- **X8 (a)** — a shared overseas duty, nothing changed yet: 0900 typed in Ranger's Start and not left, then Reject on
  his row pressed with the caret KEPT in the box (made only by a scripted click — a tap in either test browser takes
  the caret first; whether his iPhone keeps it is his look): the WHOLE duty is taken out ("2 people's OD taken out of
  Unavailable") and the typed 09:00 then lands on both men. Host's runs: `merge/r4wf-ma/host-x8a-{merged,main}-phone-webkit/`.
- **X8 (b)** — the same on a desktop, where the click takes the caret: the first click only saves the 09:00 (Ranger cut
  out onto his own duty); a second click is needed to reject it. Hex never touched. `merge/r4wf-mb/x8b-host-merged-desk-chromium/`.
- **X2** — Tab from the last box of his row of a shared duty (the day's last box) drops the keyboard focus onto the page
  where a one-man duty's row goes on to its Reject. Identical on both builds.
- **M11, the phone** — a tap on Blue in the Blue/Red question does nothing in the test WebKit at 402 wide, caret or no
  caret, on both builds; in phone Chromium the same tap answers it (the host's run, `merge/r4wf-mb/m11-host-merged-phone-chromium/`).
  A lead for his iPhone, not a finding.

**RECORD, both builds alike:** OIL Earn switched on with the caret in his row still lets the typed time cut him out,
no OIL figure moved (X9, a scripted click).

**Not walked, and why:** the Undo, Redo and OIL Earn presses with the caret kept, by a real tap (the test browsers take
the caret — his iPhone only); X6's second tap on the phone (the crew list covers the box); the week's twin of X1 (this
branch does not change the week's paint — R11); the Leave War's doors of the shared-row job (not on the Board).

**Pictures:** `../img/handpass/2026-11-25-r4-walk-faults/merge/` — the host's W3 and re-walk folders, the walkers'
`r4wf-ma/` and `r4wf-mb/`; for his look, `merge/look/1…4-*.png` (cut and ringed by `scripts/handpass/r4wf-m-look.mjs`).

**The gates:** GitHub's run on the merge commit `0ff30dbdf` — all 25 checks green (unit raptor 6 and Leave War 4,
geometry 7, the Tracker smoke 2, the build, the code check, the Docs guard, the secrets scan). Vercel built nothing:
"Deployment rate limited — retry in 24 hours" (its daily limit, first refused about 14:00 on 25 Nov) — so no preview
link exists yet; the walk's builds are the same code.

**§12's boxes:** the eight answers and the tier, written; the rulings of §6 unchanged, with D737 and D739 for the shared
row — no clash; the roll-call above, no blank; the production build of the merge commit driven at both widths, both
engines; fixtures through the Inputs page's own window; every surface seen and operated; the walk sized in writing
first; the downstream results read (who is offered in Available crew, the ALL AVAIL count, the changes count, the
member's issued copy); the tests as §4 and §11 left them (nothing was built, so no new test and no new break); the
gates green; the reads of §16 stand, none owed for a merge that wrote no line; this section names what was not walked;
his look: below.

`Walk: docs/handpass/2026-11-25-r4-walk-faults.md §19 · 1113 pictures of the merge round (on top of the 319 of §17) · 6 surfaces (one man's row of a shared leave on the Board's Unavailable list — its boxes, its buttons, its puck; Available crew; the Common Programme's ALL AVAIL count and its window; Personal Inputs and the Ground Programme; a published day's changes window and the member's copy; the passing note) on a desktop 1440×900 and his iPhone's size 402×874 with touch, Chromium and WebKit, main's build beside the merged build · orders walked: W3 on eight engine-and-size-and-build pairs; the shared-row job's A1–A13 and this branch's own orders re-run on the merged build; X1 (a)–(d), X2–X10, M1–M3, M8–M11 on both builds · MISSING: none of this branch's. W3 — FIXED by pull request 845 (live), PASS on both builds; it is not a new fault and is not filed. Found, the same on main, filed as [SHARED-ROW-HELD-LEFTOVERS] (4)–(7): Reject on one man's row of a still-shared duty with a time typed and not left (two forms), the Tab off the day's last box, the phone's Blue/Red answer tap (his iPhone to say). Could not be made by a person in a test browser, so his iPhone's to show: a top-bar or row button pressed with the caret kept in a box`

`Docs: OUTSTANDING 197 items (+0 −0) · DECISIONS D1–D2603 · homes OK`
`docsize: OVER by 13, deferred (D29)`
