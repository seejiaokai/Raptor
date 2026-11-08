# The schedule's marks and words — the pictures round's group 3 (chat 13, 8 Nov 26)

Branch `claude/pr-sched-marks-3205d7`, from `main` after pull request 679. His rulings: **D1784** (the waiting mark on an
Unavailable row, week and board), **D1785** (the unreadable week's words; the refusal in the grey "Blocked:" note),
**D1792 (a)** (the published-version 👁 → the app's line eye) and **(d)** (a hidden warning's ↺ → the Reset arrow; ✕ stays).
Items [SCHED-UNAV-PENDING-MARK], [READONLY-WEEK-WORDS], [UI-CONSISTENCY-LOOK] (round 5 a, d). Drawings, notes and
measures: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/` (`notes-sched.md` Q1, Q2; `notes-marks.md` §3);
pictures of this check: `raptor-port/docs/img/handpass/2026-11-08-sched-marks/`.

## 1. The eight answers and the tier

1. Money (OIL, who counts as present) — NO: no mark, word or arrow here changes what a man earns or who is away; the
   waiting mark reads the day's pending list, it writes nothing.
2. The published record — YES: the waiting mark says what goes out in the next amendment; it must agree with the day's
   "N pending" and the changes window, and go when the amendment goes out.
3. Saved data — YES: how a saved week that will not read is told apart from one an older version published (the refusal
   and the notice choose their words by it).
4. A shared drawer — YES: the input row builder on the week and the board's input row builder (Unavailable and Personal
   Inputs share it); the plan selector drawn on both pages.
5. A new gesture or mode — NO: no new control; the ↺ keeps its button, its words and its tap.
6. A new surface — NO.
7. Roles — NO: who may hide or flag a warning, edit an input or see a medical type is unchanged (a member sees no ✕ / ↺).
8. The warning list — YES (the flag-again button's mark on every warning line).

**Tier: FULL** (questions 2, 3 and 8).

## 2. The rulings that apply (swept; each checked against the running build)

| Ruling | What it says, in the app's words | Pass / fail |
|---|---|---|
| D1784 | An input filed, changed or moved after its day was published wears the waiting mark on its Unavailable name — dotted underline on the week, dotted outline on the board — until the day's next amendment goes out | PASS — W1a rows 1–4, W1b S21–S24, the host's r1 pictures, the drawing check |
| D45, D93, D177, D178 | Every input change after publishing waits for the next amendment; the issued face keeps what it went out with; a change waiting is a mark, never a ring | PASS — W1b S22: no mark on the issued face or a look; "N pending" and the "To go out" list agree; AL1 clears both |
| D1785 | A week whose saved copy cannot be read says so on each day, says it is kept and how to report it, and refuses a change in the grey "Blocked:" note in the same terms | PASS — W2 rows 11, 12, 16; W4 S6 (→ Unavail into a damaged next week). The print, the export, the next-week preview and a person's delete are older and filed (§15) |
| D1667, D1668, D1669 | Every refusal of one change: the grey note, "Blocked:" in bold, the reason after it | PASS for the input window's doors and → Unavail; the person delete's amber note is older, filed |
| D837 | The approved wordings stay as approved — the older-version refusal keeps its words | PASS — W2 row 21 |
| D1792 (a), (d) | The look's 👁 becomes the drawn line eye; a hidden warning's ↺ the drawn Reset arrow; ✕ stays typed | PASS — W3 rows 22–27, W4 S7b, the drawing check 15 of 15 |
| D1700, D1703, D1124 | A drawn mark nobody can mistake for another on its bar; the app's drawn line icons, one look | PASS — the eye in the text's own colour beside the version's name; the arrow beside the struck line, no other arrow on that list |
| D469, D472, D475 (the hidden warning stays in place, struck; members see no ✕ / ↺) | As it says | PASS — W3 rows 25–27; `e2e/warnhide.spec.ts` 8 of 8 |
| D56 (what is not a finding) | A harm only in data already stored is not a finding | Applied in every brief; no finding rested on stored data |

## 3. The roll-call

Columns: SHOWS the change (or must not, because…) · USABLE (the gesture there still works) · PAINTED WITH (what else sits
on those pixels) · proved by. Filled from the five walk reports (`raptor-port/docs/handpass/parts/2026-11-08-sched-marks-<w1a|w1b|w2|w3|w4>.md`, their §2) and the host's
runs; pictures under `raptor-port/docs/img/handpass/2026-11-08-sched-marks/<walker>/`. Astra's map of objects and routes:
`docs/handpass/parts/2026-11-08-sched-marks-scenarios.md` §Objects, surfaces and routes.

| # | Thing · surface | Shows | Usable | Painted with | Proved by |
|---|---|---|---|---|---|
| 1 | Waiting mark · Edit Schedule, Unavailable name, desktop | dotted underline in the amendment's colour (LL, ATT C, HL, OD, Other; the Ground name the same) | pressing the name opens the input window | the LATE tag and the type's tint stay; the line sits under the text only | W1a s17-pc-1pend-week, s18-pc-3; host r1-pc-week-unav |
| 2 | Waiting mark · Edit Schedule, phone | the same underline | the name opens the window | LATE, REJECT; the name not wrapped | W1a s17-phone-1pend-week, s18-phone-3 |
| 3 | Waiting mark · Scheduler Board, Unavailable panel, desktop | the name box outlined dotted, 1px, its tint kept | the box opens the window | the tint, LATE, the time boxes | W1a s17-pc-1pend-board; host r1-pc-board-unav |
| 4 | Waiting mark · Scheduler Board, phone | the same outline, the row stacked | the same builder as row 3 (not pressed apart) | LATE, the time boxes | W1a s17-phone-1pend-board; W4 s2-phone-board-2-land-early (opened by the host) |
| 5 | Waiting mark · board read-only (a member) | must not — a member has no board: no control opens one, he stays on View-only Sched | not applicable | View-only Sched's own | W1b pc-s24-5-board-member, phone-s24-5-board-member |
| 6 | Waiting mark · OIL Earn mode, both name kinds — must not, as the Ground name | none on any Unavailable or Ground name; the Ground name measured first — marked in the normal mode, plain in OIL Earn | OIL presses not this job's | the OIL pill, the grey boxes | W1a s9-pc-2oil-unav, s9-phone-2oil-unav |
| 7 | Waiting mark · View-only Sched — must not paint, as the Ground name | none, as admin and as member, on the issued face and the working draft | — | — | W1b row 7 |
| 8 | Waiting mark · a look at a version or a plan — must not | none on Original or AL1, week and board, desktop and phone; back on the working copy the mark returns in the same colour | Back to live copy | — | W1b S22.3–S22.6 |
| 9 | Waiting mark · Personal Inputs rows, SANS cards — must not | none (desktop; the phone draws them with the same builder) | REJECT shown | — | W1a s17c-pc-1personal-open, s17c-pc-2sans |
| 10 | Waiting mark · the day's "N pending", the changes window — agree | agree in every walked state; a shared input one line; after AL1 both nothing. A line's tap goes to its row (the walk's fault, fixed) | the tap lands, ringed cyan, desktop and phone, week and board | — | W1a s18-pc-5; W1b S21, S24, S30; W4 S1–S3; host f1, f3 |
| 11 | Unreadable notice · Edit Schedule, every day, desktop and phone | the exact notice, 7 of 7 days, both sizes; no rows under it | no controls on those days | — | W2 s10-pc-edit-day*, s10-phone-edit-day2 |
| 12 | Unreadable notice · View-only Sched | the exact notice, 7 of 7, desktop and phone, as a member too | no controls | — | W2 row 12 |
| 13 | Unreadable notice · Scheduler Board | no control opens the board on such a week — recorded, not walked | — | — | W2 row 13 |
| 14 | Unreadable notice · next week's desktop preview | MISSING — the demo days with no notice; older, filed [DAMAGED-WEEK-LEFTOVERS] (1) | a click loads the week, which gives the notice | — | W2 s4-pc-edit-preview-tue21 |
| 15 | Unreadable notice · print, the spreadsheet export | MISSING — the demo days, headed "WORKING DRAFT — NOT YET SIGNED"; older, filed (2) | both buttons work | — | W2 row 15 |
| 16 | Refusal · the input window: new, edit, medical (four doors), grey "Blocked:" | D1785's words in the grey note for new, edit, delete, a new date, another person, an HL edit, a stashed damaged week; the window stays, nothing saved; phone new the same | — | — | W2 row 16 |
| 17 | Refusal · the store's backstop: drag, Accept, → Unavail, Goes to | no row is drawn on a damaged week, so the backstop is reached only through another week's row: "→ Unavail" on a request running into a damaged next week — the grey note in D1785's words, nothing changed, Undo off (`main`: an amber "Can't tell whether…"); Accept and Reject were not offered on that card — carried by tests (§7, §11) | — | — | W4 s6-job-Unavail (opened by the host), s6-main-Unavail |
| 18 | Refusal · Leave War approve / send back / delete / move — own words | its own words ("is on a locked week — not changed", "— not approved"), never "older version"; a pending bid can still be placed, refused or deleted on such a date with no words — the war's own record, its code untouched here, older, filed (5) | — | — | W2 S2 |
| 19 | Refusal · deleting a person — own words | the amber note "The week of 13/07/2026 can't be changed — the delete was not made"; nothing deleted; older, filed (3) | — | — | W2 row 19 |
| 20 | Refusal · Publish / Publish AL on an unreadable week (board's sign strip) | no control reaches it on such a week — recorded, not pressed | — | — | W2 row 20 |
| 21 | Older-version week · notice and grey refusal unchanged in words | the notice keeps "open it on the device that created it" on every day; the refusal grey, "Blocked: this week was published by an older version of the app, so it can't be edited. Nothing was saved." | — | — | W2 row 21 |
| 22 | Drawn eye · plan selector, week and board, desktop and phone | a drawn line eye, 11 × 11, beside "Original" / "AL1", in the text's colour; no typed eye anywhere; also at 2560 wide | the selector opens, a look opens, Back to live copy returns | the ▾; on the board the selector amber, its eye the same amber | W3 s28-*; W1b S22.1b |
| 23 | Drawn eye · look banner (issued and plan), week and board | the drawn eye, 12 × 12, quiet grey, before "Viewing the issued…" | Back to live copy and Load onto working copy | on the phone board the banner's words take two lines and it sits under the Aircrew tab — older: the drawing check matched `main`'s drawing pixel for pixel; filed (§15) | W3 s28-phone-b-look0 |
| 24 | Drawn eye · wave templates window, unchanged | its drawn line eye, the same as on `main` (W3 looked in the day templates window and found none there — the wrong window) | — | — | W4 s7b-job-2-window, s7b-main-2-window |
| 25 | Reset arrow · hidden warning, Edit Schedule, desktop and phone | a drawn arrow, 13 × 13 in a 19 × 18 button, beside the struck line | mouse, tap and Space flag it again | the dashed outline round the hidden line | W3 s26-*; `e2e/warnhide.spec.ts` 8 of 8 |
| 26 | Reset arrow · hidden warning, Scheduler Board, desktop and phone | the same | the same | the strike-through; on a phone the list under its fold | W3 s26-* |
| 27 | Reset arrow · a member, a look — no ✕ / arrow | a member: no ✕, no arrow, the lines struck; a look at Original: no ✕, no arrow | — | — | W3 s27-* |

## 4. The door check

Every way in to each change was walked or tested. The waiting mark: an input filed in its window, edited, given a new
date, moved "→ Unavail", rejected, a man added or taken out, then Undo, Redo, a reload and a week away and back (W1a,
W1b). The refusal: every door that writes an input on a damaged week — the input window's four doors and "→ Unavail" on
screen (W2, W4); Accept, Reject and "→ Unavail" at the door and inside it by tests that press the drawn buttons. The
drawn marks: every place each stands, at both widths (W3, the drawing check). Where a door could not be reached on
screen it is in §11.

## 5. The five sizing lines (§7.0)

1. **Type:** D (a mark drawn by the week's and the board's own builders), G (the publish path — the mark lasts until the
   amendment goes out; saved data — a week that will not read), E (two drawn marks in place of typed ones), F (words).
2. **What only a walk finds:** each builder drawing the mark or not (rows 1–9), the mark beside the count after publish /
   undo / redo / reload, each refusal door pressed for real on a damaged week, the eye and arrow at their drawn sizes at
   both widths, the publish door on the board's sign strip. The tests carry each pending kind (`ui/unavmark.test.tsx`,
   15) and the words to the letter (`engine/lockednote.test.ts`).
3. **The ledger:** type D/G walks have found unwired surfaces most often (the record, 2 Nov – 8 Nov 26); the last board
   job of this round (OIL Earn, 8 Nov) walked two Sonnet helpers plus the host's re-walk.
4. **The walk chosen:** two Sonnet walkers in their own worlds — W1 the waiting mark and the drawn marks (Astra's S6–S9,
   S17–S32 that touch them, rows 1–10, 22–27, the plain-user round on Edit Schedule and the board), W2 the unreadable and
   older weeks (S1–S5, S10–S16, rows 11–21, the plain-user round on the Inputs page and the input window); desktop 1536 and
   his iPhone's size; the host opens every deciding picture and reproduces every finding. Repeated pending kinds beyond one
   each are carried by `ui/unavmark.test.tsx` (it calls the app's own commands, so each kind is also walked once).
   **Resized before the start (8 Nov 26, ~13:45):** the same scenarios over FOUR Sonnet walkers so they run side by
   side — W1a the mark's kinds and identities (S18, S17, S25, S6–S9), W1b its orders, faces and returns (S21, S19, S20,
   S22–S24, S30, S31), W2 the unreadable and older weeks (S10–S14, S1–S5, S15), W3 the drawn marks and the plain-user
   round on the schedule (S26–S29, S32) — no scenario added, only the time shortened. The host's own short walk first
   (`scripts/handpass/sm-host.mjs`, pictures `…/host/`): the mark painted on the week, the board and the phone, the
   unreadable notice on 7 of 7 days and its grey refusal, the drawn eye in a look; the warning-hide route by
   `e2e/warnhide.spec.ts` (8 of 8 on this build). The walkers' brief: `docs/superpowers/briefs/2026-11-08-sched-marks-walk.md`;
   the frozen build: `dist-sm1` in the host's scratch folder, built from `b8011e768`.
5. **After the walk:** its row goes into `docs/walk-ledger.md`.

## 6. The orders walked

Filed → undone → redone; published → AL1 out (the mark goes with it); filed → a week away and back; filed → a reload;
a look at Original → back to the working copy (the mark returns); a request taken off → "→ Unavail"; a two-day meeting
standing on Monday → Tuesday's line tapped; a damaged next week loaded → this week's request pressed (W1b, W4).

## 7. The cases carried by a test

- `ui/unavmark.test.tsx` — each kind of waiting change (filed, changed, moved, a man split out, both inputs of a move, a
  replaced record) and where it must not show; the waiting list's taps go only where the page draws the row (a SANS line
  and a man taken out of a shared input stand still; a course filed under Unavailable lands; Tuesday's meeting opens
  Personal Inputs; a leave does not; View-only Sched's Unavailable still lands).
- `ui/audit-guards-inputs.test.tsx` — Accept, Reject and "→ Unavail" on an input running into a damaged week refuse in
  the grey note, in D1785's words, nothing changed and no Undo step — the two not pressed on screen (§11).
- `engine/lockednote.test.ts` (the words to the letter), `ui/planselector.test.tsx` (the drawn eye),
  `ui/warnmute-week.test.ts` (the Reset arrow), `e2e/warnhide.spec.ts` (8 of 8).

## 8. The pictures

`raptor-port/docs/img/handpass/2026-11-08-sched-marks/`: `host/` (the host's own runs: r1 the mark, f1 the walk's
fault before and after, f2 the board's split, f3 the taken-out line on the last build), `w1a/`, `w1b/`, `w2/`, `w3/`,
`w4/` (each walker's), `drawcheck/`, `drawcheck-fix2/` and `drawcheck-records/` (the drawing check). Every picture that
decided a result was opened by the host, cropped to its place.

## 9. The break tests

Each of the 9 tests added after the reads was made red by undoing its fix, then green again (the host's mutation script),
so each one bites. The walk's own breaks: a damaged week pressed through every door (W2), the damaged NEXT week from this
week's card (W4 S6), the mark through Undo / Redo / reload / a week away (W1b).

## 10. Errors seen

None — no page error and no console error in any run of any walker (W1a 22 runs, W1b, W2, W3, W4) or of the host's
scripts.

## 11. What was NOT walked, and why

- Rows 14 and 15 — MISSING, older, filed (§15).
- The board and Publish on a damaged week (rows 13, 20) — no control reaches them on such a week.
- Accept and Reject pressed on screen against a damaged week — W4's request offered only "→ Unavail", which was pressed
  and passed; all three go through the same check, and the tests of §7 press each drawn button.
- No mark on Personal Inputs and the SANS cards on a phone — the desktop walked; the phone draws them with the same builder.
- The phone's stretch / trim of a leave and its week away and back (W1b) — no phone route; walked on the desktop.
- The Leave War as a hidden page under the schedule — not driven.

## 12. The drawing check

Part list `scripts/drawcheck/specs/sched-marks.mjs`, 15 states: the waiting mark (Edit Schedule desktop and phone, the
board desktop), the unreadable notice (desktop, phone) and its grey refusal, the drawn eye (the week's selector and
banner, the board's selector and banner, desktop and phone), the Reset arrow (board and week, desktop and phone). The
drawings recorded by replaying their own scripts (`scripts/handpass/pr-sched.mjs` q1, q2; `pr-marks.mjs` r5a, r5d) on
a build of `main` at `6e6c55667`, where they were drawn — **every replay identical to its approved picture, pixel for
pixel** (records `docs/img/handpass/2026-11-08-sched-marks/drawcheck-records/`). **The build (`dist-sm1`, from
`b8011e768`): GREEN — 15 of 15 states reached, 0 differences, 0 kept** (`…/drawcheck/report.md`). One fix to the part
list, none to the app: the phone board folds its warning list, so the reach opens it by its head as the drawing did.
What the check does not measure — the dotted underline and outline themselves — was looked at by eye beside drawing A:
the host's pictures `…/host/r1-pc-week-unav.png` (a dotted cyan line under "LL") and `r1-pc-board-unav.png` (the "LL"
box outlined dotted, its purple tint kept), the computed styles "underline dotted rgb(59, 198, 232)" and "dotted 1px
rgb(59, 198, 232)" on the PC and the phone.

## 13. The code reads

- **The final read, three readers blind to each other** on `19551d882`: Sol 6.1, Astra and a fresh Opus reader — reports
  `raptor-port/docs/handpass/parts/2026-11-08-sched-marks-read-<sol|astra|opus>.md` (the Opus reader's start hook pasted this chat's handoff block into it after its own
  compaction, so it was not fully blind — noted in its report). Every finding was reproduced red first and fixed in
  `9d330d50c`: (a) NEW in this job — a SANS availability's line, and View-only Sched's Personal Inputs line, had become
  buttons that landed nowhere (Sol, Astra, Opus); (b) older, the walk's fix incomplete — a course filed under Unavailable
  and a request put "→ Unavail" still stood still (all three); (c) NEW — a Mon–Tue meeting standing on Monday: Tuesday's
  tap left Personal Inputs folded, and a leave's tap opened it (older) (Astra, Opus); (d) older — Accept / Reject /
  → Unavail on a request running into a damaged week said amber words, now D1785's grey note (Sol, Opus, Astra).
- **The narrow re-read of the fixes**, Astra and Sol 6.1 blind to each other on `9d330d50c` — reports
  `raptor-port/docs/handpass/parts/2026-11-08-sched-marks-reread-<astra|sol>.md`, brief `docs/superpowers/briefs/2026-11-08-sched-marks-fix-reread.md`: claims 1 and 3
  hold; claim 2 failed for one case, the same from both (older: a man taken out of a shared Unavailable input, no record
  of his own, got a button landing on the first man still in it); Astra — claim 4 safe, but "Answer OIL" reached the dry
  run before the check. Both fixed red first in `26aa4de19`; the host's last look on the running build (`host/f3-*`):
  his line stands still. No third read of `26aa4de19`: two lines, both readers named the fix exactly — the agent's call.
- **Readings put to him** (none blocks the merge): Opus (b) — whether an Unavailable change's mark should also show in OIL
  Earn; Opus (d) — "this week's saved copy" when the week refused is another, stashed week (`main` said the same).
- **Tidiness notes:** in each reader's report — filed, not fixed.

## 14. The gate counts

- The build passed at `32e9b096d` (with `main` brought in), under the checks lock.
- Unit: the 53 files that read the waiting list, the jump or the accept buttons — 1483 tests, green at `26aa4de19`.
- The drawing check: 15 of 15, 0 differences, on the build of `9d330d50c` (`drawcheck-fix2/report.md`).
- `e2e/warnhide.spec.ts` 8 of 8; React Doctor clean.
- GitHub's full run of the pull request on `32e9b096d` (with `main` in): every check green — the build, the code check, the documents guard, the secrets scan, the browser checks (7 groups), the Tracker's (2), the unit tests (10 groups). The records commit after it runs the same set again before the merge.

## 15. What the walk found, and each disposition

- **W1b S30 (4 FAIL rows, one fault)** — a tap on an Unavailable input's line in "To go out" did nothing. Older (`main`
  the same, host f1), fixed here, and the readers' finds on that fix fixed too (§13); re-walked: W4 S1–S3 PASS, host f1.
- **W1a S6.2 (1 FAIL row)** — the board's mark after a split typed on the board's own row. NOT a fault: the board keeps
  the box he is typing in, as it always has; the mark comes on the next drawing (host f2, on this build and on `main`).
- **W4 — 17 PASS, 0 FAIL, 5 RECORDED, 1 not run** (§11): every fix holds on the running build.
- **Older, filed in [DAMAGED-WEEK-LEFTOVERS]:** the next-week preview, print and the export of a damaged week; a person's
  delete in the amber note; the Leave War's pending bid on a damaged date, placed, refused or deleted with no words.
- **Older, filed in [SCHED-MARKS-WALK-ODDS]:** the changes window's foot on "To go out" always says "Tap a change to go to
  it.", even when its only line stands still (host f3, W4 S4); the look banner taking two lines on the phone board (W3);
  "2 issues · 2 warning" on Edit Schedule's bar, "2 warnings" on the board's (W3); a published day's "N changes" chip
  beside "N pending" (W1a, W3).
- **As built, not faults:** Escape does not close the changes window (W1a, W4 7c, `main` the same); Escape on an input
  window with a typed remark asks first, at the ✕ — W3 reported a silent close; W4, sent to check it, typed "some remark
  that would be lost" and got the question card on this build and on `main` (s7a-job, opened by the host; s7a-main) —
  as D1626 built it; a reload
  returns to the sign-in (W1a, W1b — the demo's sign-in is not kept).

**Walk:** FULL — five Sonnet walkers on two frozen builds (W1a, W1b, W2, W3 on `b8011e768`; the re-walk W4 on
`9d330d50c`) plus the host's own runs, at his PC's 1536 and his iPhone's 402; 155 PASS, 5 FAIL rows (one fault, older,
fixed and re-walked; one not a fault), about 65 RECORDED; no page errors; the drawing check 15 of 15; pictures
`raptor-port/docs/img/handpass/2026-11-08-sched-marks/`.
