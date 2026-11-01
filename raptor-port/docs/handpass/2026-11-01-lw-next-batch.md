# Bug check — the Leave War's next batch: [LW-HELDHALF-WORDS], [E2E-POSTING-DATES-PIN], [LW-DELETE-POSTING-RESTORE], [LW-DELETED-REDO-NETSUM]

Branch `claude/lw-next-batch-1101`, pull request 609. Built and checked unattended on the night of 1–2 Nov 26 (job 1 of the
night — `HANDOFF.md`). Commits: `7c0103e17` (the four fixes, each red first), `b88727483` (the scenario designer's F1),
`aaddf957f` (the walk scripts and the designer's report), then the fixes of the code read (§The code read). Walk pictures:
`docs/img/handpass/2026-11-01-lw-next-batch/` — `held/` (lw-nb-held.mjs), `post-desk/`, `post-phone/` (lw-nb-post.mjs; the
phone in WebKit), `post-phone-retry/` and `post-phone-2/` (the phone's DP2 after the script's own fault, below).

## Questions waiting for him
1. **A Move across a Delete posting's date (the scenario designer's S20).** His D1545 refuses APPROVING a deleted-to-be man's
   leave from his posting date; the bid window's Move still carries his already-approved leave onto those days (walked:
   DP6-live — 6 Nov moved to 10 Nov, the posting dated 9 Nov, it lands). Should a Delete posting's date bar a Move of his
   approved leave onto days from it too? Recommended: **no — leave as built**: the leave was approved before the posting,
   a move changes its days, not whether it was approved, and the same holds for a man already deleted (D321's readings,
   [LW-DELETED-RESTORE-OVERREFUSE]). Nothing waits on it. **Answered 2 Nov 26 — his D1555: no, as built** (a Move of his approved leave over a Delete posting's date stays allowed). Filed as `[LW-DELETE-POSTING-MOVE-ASK]`.

## The eight answers and the tier
1. Money — YES: what a man's leave balance is charged follows which approvals stand (leave, as OIL, is time owed — D25);
   Undo / Redo now refuse an approval. 2. Published record — NO: no publish, signing or amendment path is touched. 3. Saved
   data — YES: what Undo / Redo may write back into the saved Inputs and war records changes (the restore refusals).
   4. Shared drawer — YES: the held line is now ONE body drawn for two lines (a held day's, the free half's). 5. New gesture
   or mode — NO: no new control; a refusal is said where a Redo / Undo used to go through. 6. New surface — NO. 7. Roles —
   YES in part: what an admin's Undo / Redo may put back for another man. `state/perms.ts` is untouched; no change to sign-in
   or who may do what, so no extra security read (D1411). 8. Warning list — NO.
**Tier: FULL.**

## Rulings swept
D1545 and D1541 (the Delete posting keeps its refusal; every other posting refuses nothing) — DP0–DP9, `deleteposting-restore.test.ts`;
D287, D299, D1447 R21 (a deleted man's leftover leave refused) — `deletednorow.test.ts`, unchanged rows green;
D148 (Undo reverses only his own changes) — unchanged, the refusal is asked of his own steps;
D1371, D1525 (the free half's line: box, AM / PM, words, "change it on the Inputs page") — H1, H4, M1, P1;
D948, D951, D953 (the "till <date>" after the words; a one-day commitment none by default) — H1, H3, H4;
D1150 (documents seen at any time, read only) — H1, H2, P2; D1373 (an Attach's "To" named on the war) — H4;
D1553, D1548 (a held day's lines — the body now shared) — `heldday.test.tsx` 22 green;
D1421, D1330 (a lit Approve's second tap sends it back) — DP4; D1436's replaced text (D1541) — no screen says it any more.
No ruling contradicts another here. Checked against `main`: every behaviour changed is the item's own.

## The roll-call
| Thing | Surface / door | Shows it / works | What else is painted |
|---|---|---|---|
| The free half's line (D1371) | the bid window, desktop admin | YES — H1, H3, H4 (Other, Attach, a run of days, one day) | the window's own rows; the day's cyan mark |
| | the bid window, iPhone, Chromium and WebKit | YES — P1 (fits inside the window at 402, no sideways scroll), P2 | the day above the window |
| | a member's own day (D1371 "the same for a member") | YES — M1 | — |
| | the document chip | YES — H2, P2: the document viewer opens over the window | in the phone test browsers the PDF itself draws blank (below) |
| | the day's list | NO, because a half-day commitment beside a free half opens the bid window, not the list; the list's own lines were already right (DayList.tsx) | — |
| | the drag window | NO, because it names no held half (D1362's lines are its own) | — |
| | a held whole day's lines (the shared body) | YES — `heldday.test.tsx` 22 green; the body moved, not changed | — |
| The restore refusal (a Delete posting not run) | top bar Redo after an approval | YES — DP1 (twice), DP7 | the refusal's passing note, amber, at the foot |
| | top bar Undo of a send-back | YES — DP4 | |
| | Approvals' Approve (the live door it agrees with) | YES — DP0 | |
| | Auto-approve in the bid window | YES — DP9: kept pending live; Undo / Redo bring no approval | |
| | Approve all, the day's list, the drag window | carried by `deleteposting-restore.test.ts` (the same writer, `decideRequests` / `placeApproved`, one gesture) — the designer's negative: every approve door goes through `doorApprove` or `placeApproved` in a war step | |
| | must NOT refuse: an Overseas posting, the posting taken back, the outcome changed, his day before the date, a move across the date | YES — DP3, DP2, DP8, DP5, DP6 | |
| The per-day rule (NETSUM) | no screen sends an approval and a send-back in one step (the item) — carried by `deletednorow.test.ts` and `deleteposting-restore.test.ts` (each red first, two halves of one day too) | NO door, by design | |
| | must NOT refuse a move | YES — DP6 (desk and phone); a block move — `deletednorow.test.ts` | |
| Three posting browser tests | `e2e/leavewar.spec.ts` R3b, R3c-2, D1541's Overseas case | YES — 6 of 6 ran and passed with the test runner's date moved to 20 Dec 26 (6 of 6 skipped before) | |

## The sizing lines (§7.0)
1. **Type:** G (what Undo / Redo may restore), D in part (one line drawn by one body for two places), A (a rule inside one
   restore check).
2. **Only a walk could find:** whether the refusal's words reach the person (a passing note, on a phone), whether Redo still
   offers itself and says the same on a second press, whether the posting sheet's own controls (Undo post out, the outcome
   chips) make the Redo go; the held line's fit on an iPhone and in WebKit, its chip opening a document; the member's face.
3. **The ledger:** the deleted man's Undo / Redo walk of 31 Oct 26 (`lw-rr-s1.mjs`, type G) found its faults in orders (a
   move across the date); the held-day walk (C, D) in a second role and on the phone — so the orders around the posting and
   the member and phone faces are walked.
4. **The walk chosen:** one Sonnet walker running the host's two proven scripts (the host first ran each scenario once on
   the desktop): lw-nb-held.mjs — desktop 1536 admin 5 scenarios, iPhone 402 Chromium touch and WebKit 2 each, a member 1;
   lw-nb-post.mjs — 11 scenarios at his PC's 1536 × 730 at 1.25 and at an iPhone 402 × 874 in WebKit. Carried by tests:
   the per-day rule's step (no screen makes it), Approve all and the day's list as approve doors (one writer), the posting
   date's own day (`postingRefusedFrom` = `postingOutWhy`'s date). No drawing-check part list covers the bid window; the
   line was put beside its approved drawing (`2026-10-25-lw-drawings/q7/c2-drawn-admin-desk.png`) by eye: the same place,
   box and words, "Morning" read "AM" (D1525), the till and the chip added by D948 and D1150.
5. **After the walk:** row added to `docs/walk-ledger.md`.

## The scenario designer (fresh Opus, blind) — report whole in `parts/lw-nb1101/designer.md`
21 scenarios, one fault. **F1 (S1) — a FAULT, fixed red first (`b88727483`):** the per-day rule keyed by the day alone let one
step approving his refused morning and sending back his afternoon of the same day through. Fixed by the time of day each
step adds (inputWindow's half), not by the row and day as the designer drafted — a morning approved beside an afternoon
already approved is joined into the same row and day, so a row-and-day key would still miss it. Red first: one test for
a deleted man, one for a Delete posting not yet run. The rest: walked — S9 → DP7, S10 → DP1's second press, S11 (a, c) →
DP2, DP8, S15 → DP9, S17 (a move) → DP6, S18 → DP4, S3, S5 (the "To"), S7 → H1, H4, M1, S6 → P1; carried by a test — S11 (b)
the posting moved, S16 (an approval extending a run), S17 (a block move), S12 (run late), S14 (two men, one step:
`decideRequests`), S21 → the e2e proof; set aside with a reason — S2 (a commitment with hours reads AM / PM on the free
half's line, as D1371 and D1525 say; a held whole day prints the hours — named on his look card, line 3), S4 (the till tick
is the input's own, read by `remarksShown`, the day's list's body), S8 (the line is worked out at each tap, never kept),
S13 (a held-back posting: `postingOutWhy` and `postingRefusedFrom` read the same record), S19 (D148: another admin's Undo
never reaches this man's step), S10's "older steps out of reach while the posting stands" — a Redo is linear; the step
can pass again later (unlike a deleted man's, which is passed over for good — `deadRefusal`), the agent's technical call;
S20 → the question above.

## The orders walked (b88727483, the frozen build)
| Step | What was pressed | What the screen said | Desk | Phone |
|---|---|---|---|---|
| H1 | Comet's morning Other (07:00–12:00, 21–22 Jul, "Station board", board.pdf), a tap on 21 Jul | the window on PM; "OTH AM “Station board till 22 Jul” [board.pdf] · change it on the Inputs page" | PASS | P1 PASS (Chromium, WebKit) |
| H2 | the chip | the document viewer opens over the window | PASS | P2 PASS |
| H3 | its second day | the same line | PASS | — |
| H4 | Havoc's afternoon Attach of one day, To 145 Sqn | the window on AM; "ATCH PM · 145 Sqn “Exercise” · change it…"; no till (D951), no chip | PASS | — |
| H5 | LL on the free morning | LL beside the ATCH | PASS | — |
| M1 | Ranger (member), his own morning Other on an open day | the same line, his words and chip | — | PASS |
| DP0 | Approvals' Approve on Drifter's 11 Nov, his Delete posting dated 9 Nov set | "He posts out on 9 Nov: refuse or delete it" | PASS | PASS |
| DP1 | approve, Undo, the Delete posting, Redo — twice | "Can’t redo that — Drifter posts out on 9 Nov, so leave from that day can’t be approved", each press; nothing written; Redo still offered | PASS | PASS (post-phone-2) |
| DP2 | the posting sheet's "Undo post out", Redo | "Redid: a decision on a bid"; his LL approved | PASS | PASS (post-phone-2) |
| DP3 | an Overseas Sqn posting instead | the Redo goes through | PASS | PASS |
| DP4 | approve, the lit Approve's second tap, the posting, Undo | "Can’t undo that — …"; nothing written | PASS | PASS |
| DP5 | his day before the date | the Redo goes through | PASS | PASS |
| DP6 | his approved 6 Nov moved to 10 Nov, Undo, the posting, Redo | "Redid: moving a bid"; on 10 Nov | PASS | PASS |
| DP6-live | the same Move with the posting standing | lands (RECORDED — the question above) | RECORDED | RECORDED |
| DP7 | approve, the posting, Undo, Redo | the Undo goes; the Redo is refused | PASS | PASS |
| DP8 | refused, then the posting sheet's Overseas Sqn chip, Redo | the Redo goes through | PASS | PASS |
| DP9 | Auto-approve on, LL on 11 Nov from the posting sheet's "Place leave or OIL here instead…" | "kept pending — He posts out on 9 Nov: refuse or delete it."; after Undo / Redo still pending | PASS | PASS |

**The walk's own faults, not the app's:** (1) the phone's first DP2 (`post-phone/`, `post-phone-retry/`) pressed the grid's
tab and his day while the page stood scrolled from the row picture before it — the press landed on the top bar's name badge
and switched the admin to the member view ("Switch back to the admin view to redo that."); the script now brings the page
to its top first (lw-nb-post.mjs v2) and `post-phone-2/` passes DP1, DP2, DP6. (2) A repeated passing note is logged once:
the second press's words are read from the note itself. (3) The send-back of DP4 is pressed in the bid window (D1330) —
Approvals forgets a decided line once he leaves it (D1421).

**Seen and not faults:** the refusal's passing note stands at the foot for its few seconds over whatever is there — the
posting sheet's last row (`post-desk/dp8-a-posting-sheet.png`, `post-phone/dp8-a-posting-sheet.png`); it takes no press
(`ui/toast.ts`, pointer-events none) and every refusal note of the app does the same. In the phone test browsers the
document viewer's PDF draws blank and the browser logs an aborted file load (held `P-errors`, Chromium and WebKit): the
viewer opens (P2); the test browsers draw no PDF in a phone's frame (walk-scripts §7 (a) for WebKit); the desktop draws it
and logs nothing (H2, `D-errors` PASS).

## Carried by tests (each red before its fix)
- `src/leavewar/otherunavail.test.tsx` — the free half's line prints the till and the document (red: "OTHAM“Board of inquiry”…").
- `src/leavewar/deleteposting-restore.test.ts` (15) — the reverted 057ca75ab's 13 cases with the Delete outcome, plus the
  outcome changed and the same day's two halves (red: 7 of 14 on the build, then the two halves 1 of 1).
- `src/leavewar/deletednorow.test.ts` — the NETSUM case made a plain `it` (red as `it`), the same day's two halves (red),
  a block move whose leave lands where its bid stood (a guard, green before and after).
- `e2e/leavewar.spec.ts` — the three `@pinned-today` tests: with the test runner's date moved to 20 Dec 26
  (`NODE_OPTIONS=--require <a date shift>`), 6 of 6 skipped before the change, 6 of 6 ran and passed after (desktop and phone
  projects); each asserts the page's today is 4 Nov 26.

## Break tests
The red-first runs are the break tests of each wire: the held line (1 red), the restore refusal's wiring (7 of 14 red), the
per-day rule (1 red, then the two halves 2 red), the pinned clock (6 skipped → 6 run).

## Errors seen
None in the desktop walks; the phone's PDF load (above).

## Not walked, and why
The per-day rule's step (no screen makes it — the item); Approve all and the day's list as approve doors (one writer,
carried); a Delete posting run late between two Redos (carried — `deletednorow.test.ts` "the posting runs late"); his real
iPhone (the look card).

## The code read (fresh, blind Opus — D790 — report whole in `parts/lw-nb1101/read-opus.md`)
Handed `b88727483`, this sheet after the walk and the designer's report. **One finding, two notes, all dispositioned:**
- **Finding 1 (confirmed-new, reached by this change):** the Undo of ONE move carrying his approved leave AND his pending bid
  (the drag window's Move over the two days) was refused once his Delete posting was set — the Undo branch judged a request
  "taken off" one record at a time, so the bid leaving the day it had landed on read as taken, beside approved leave written
  back; the live Move refuses no posting day. **Reproduced on screen first** on the build before the fix (`r1-before/`, DP10:
  "Can’t undo that — Drifter posts out on 9 Nov…"), red first in `deleteposting-restore.test.ts` (2 cases), **fixed**
  (`fcae6c072` — both directions read "taken" over the whole step, `takenDays`), re-walked green (`rewalk-desk/dp10-*`). A
  deleted man's twin could not be made: after a posting runs late the Undo of a step before it meets the run's own "a later
  change touches the same thing" first.
- **Note A (a refused-for-now step blocks the older ones):** consistent with the app's other refusals asked fresh (a medical
  filed since, the roster's); the step can pass again once the posting changes, unlike a deleted man's (passed over for
  good). Kept as built — the agent's technical call.
- **Note B (the pinned clock read the machine's zone):** fixed — the pin is noon in Greenwich (4 Nov in every zone from UTC−11
  to UTC+11); the three tests re-run with the runner's date at 20 Dec 26: 6 of 6 passed.
- **Tidiness:** the stale comment above `heldCommitment` fixed; the two duplicate filters became one (`takenDays`);
  `postingRestoreWhy` working out the date again — left (one cheap line, its words stay the live door's).

**The narrow read of the fixes** (§5 "a fix is new code" — fresh Opus, handed only `b88727483` and `fcae6c072` and the findings;
report whole in `parts/lw-nb1101/read-fix.md`): **0 findings**; both fixes right and complete for the doors that exist (a
send-back and Approve → Refuse mint a new request id, so their Undos stay refused; only a move carries an id). Its three
missing twins pinned (`60cadd687`): the same-day mixed step's Undo refused, Approve then Refuse's Undo refused, a block move
carrying its bid back before the date goes — all green as written. Its residual risk named, not a finding: a step that folded
two images of one cell could hide a request; no war door does. One round; the read cap not reached.

## The re-walk (the fixed build, `fcae6c072`'s bundle — `rewalk-desk/`, `rewalk-phone/`)
The whole posting script: desk 12 / 12 PASS (DP10 included), phone (WebKit) 11 / 11 PASS; DP6-live RECORDED both. The held
line's code was not touched by the fixes (not re-walked).

## Gates
On his PC: the Leave War, state and undo unit tests — 309 files, 5224 passed (20 skipped), after the read's fixes; the build
clean; the three pinned browser tests 6 / 6 (the runner's date at 20 Dec 26), twice; the code check — no new finding.
GitHub's run (the full check, D1086): green on `7c0103e17` and `b88727483` (every unit share, the browser checks at desktop and
phone, the Tracker's, the code check), and **green on `60cadd687`, the last commit carrying code** (the fixes of both reads) — every share, seen 2 Nov 26.

## The closing
`Walk: docs/handpass/2026-11-01-lw-next-batch.md · 88 pictures · 7 surfaces (the bid window — desktop, iPhone Chromium and WebKit; a member’s window; the document viewer; Approvals; the posting sheet; the drag window; the top bar’s Undo / Redo) · 17 orders · MISSING: 2 fixed (the designer's F1 — the same day's two halves; the read's finding 1 — a block move's Undo, red first, re-walked as DP10)`
`Docs: OUTSTANDING 149 items (+2 −4, −4 all in ARCHIVE) · DECISIONS D1–D1554 (new: D1554) · homes OK`
`docsize: OK`

The non-substitution checklist (§12): the tier written; the rulings swept, none in conflict; the roll-call with no blank; the
production build driven at both widths (desktop at his PC's 1536 at 1.25, an iPhone in WebKit and Chromium); the fixtures made
through the app's own controls (the Inputs page's form, the bid window, Approvals, the posting sheet, the drag window); every
surface seen and operated; the orders walked or carried by a named test; the leave written or not, read from the saved
Inputs; one red per wire; the gates green; the reads reconciled; this sheet with its pictures and what was not walked; **his
look still to come.**

## His look card
1. Tap a day whose morning holds an Other filed under Unavailable over two days with a document: the line under PM reads
   "OTH AM “… till <last day>”", the document's chip beside it, a tap opening it.
2. Post a man out with Delete dated a few days on, after approving a leave of his after that date and pressing Undo: Redo
   says "Can’t redo that — <name> posts out on <date>, so leave from that day can’t be approved".
3. A commitment with hours (13:00–17:00) on a half: the free half's line says "PM", where a whole held day's line prints the
   hours — say if you want the hours there too (D1371 drew it with AM / PM).

## His find, 2 Nov 26 — the document viewer's Close

**What he saw (his iPhone, Safari, the 609 preview):** "When I press close. The window behind closes first then the document
page closes on a 2nd tap" — Gambit's Thu 23 Jul bid window (a whole day held by an OML filed on the Inputs page), its
"document" chip tapped, the viewer "Gambit · OML · Jul 23" over it; Close closed the BID WINDOW, the viewer went on a second tap.

**The cause.** On a touch screen a blocking Leave War window lets the finger through its veil to the grid and puts a shield on
the page that eats every tap outside the window and closes the window on it (`Sheet.tsx` `useGridPan`). The document viewer is a
pop-up of the app's own on the page body, inside no window, so to the shield its Close, its ✕ and its own dark surround were
taps outside: eaten before the viewer heard them, and the window behind closed. The second tap worked because the window and
its shield were gone. A mouse never met it: there the veil itself lies under the viewer. **On `main` too:** the shield and the
war's document chips (M4, D1292) are both on `main` (`origin/main`'s `Sheet.tsx` has the same shield and `BidPicker.tsx` the
same chip); reproduced on this branch's build before the fix, the desktop clean. **The fix:** the shield lets every pop-up of
the app's own through (`.airpop` — the viewer, the OIL question and its kin), as the mouse's veil does. **And the fresh read's
finding 1** (older, not caused by the fix): a blocking window opened while the person window or the Inputs "Calendar" is up is
raised (480 / 481) above every pop-up (460–472), so the viewer opened from it stood UNDER it, half hidden, and on a desktop its
Close landed on the veil — the same fault. Fixed in the stylesheet: while a raised window is up the pop-ups stand above it, each
in its own order (`bidpicker.css`, outside the page's wrapper).

**Tier: WALK.** 1 money — no (nothing owed or counted changes: a tap reaches the pop-up it lands on). 2 published record — no.
3 saved data — no. 4 a shared drawer — YES: the one shield every blocking Leave War window uses. 5 a gesture — YES: what a tap
on a pop-up over a window does. 6 a new surface — no. 7 roles — no (a member opens the same viewer from his own windows; walked
as one). 8 the warning list — no.

**Rulings swept:** D1292 (a document chip opens the viewer over the window, "closed by Escape or ✕ back to it" — this fix is
that sentence on a touch screen); the popup rule (a tap outside closes what opened last — kept: a tap outside every pop-up
still closes the window, pinned); D641, D642 (the person window and the drag window do not block: no shield, never had the
fault — walked); D1548, D1553 (the held day's bid window, his place); the design guide §3 (Escape closes what opened last —
unchanged, walked). None in conflict.

**The roll-call — every place the app opens the viewer over something** (R and M numbers are the walk's):

| Place | Close / ✕ / surround / Escape close only the viewer | Why / how known |
|---|---|---|
| R1 the bid window, a whole day held (his) | has it — after the fix | a blocking window: RED before on the phone (Chromium and WebKit, all three taps), green after; the desktop green both |
| R2 the bid window, the held half's line | has it — after the fix | the same shield: red before on the phone, green after |
| M1 the day's list (a member on Comet's morning Other) | has it — after the fix | the same shield: red before on the phone, green after |
| R9 a raised bid window (the person window up) | has it — after the stylesheet fix | the read's finding 1: the viewer under the window, Close on the veil — red on the desktop, green after in Chromium 1536 and WebKit 1440; on the phone the day is not reached with the person window up (pictured, `p-webkit-r9-unreachable.png`) |
| the decision window, the remarks editor, the approved-leave note | has it — carried by the shared listener | the same chip → the same viewer → the same shield as R1; the unit test pins the shield itself; its route is R1's |
| a bid window's own Document row (an editable chip) | MISSING — not this fix | the chip opens nothing yet — D1292's other half ("straight after it is added"); filed `[LW-DOCFIELD-CHIP-OPENS]` |
| R5 / M2 the person window's paperclip (admin, member) | has it — before and after | the person window does not block (D641): no shield, never had the fault |
| R7 Approvals' paperclip | has it — before and after | a page, not a window |
| R8 the Inputs page's input window | has it — before and after | not a Leave War window |
| the credited-OIL window, the drag window | must not — no document opener | neither opens the viewer (searched: every caller of the viewer) |

**Tests, red then green.** `src/leavewar/ui/docviewer-sheet.test.tsx` (a blocking window on a touch screen, the real viewer over
it: one tap on Close, ✕ or the surround closes the viewer only; a tap on the picture does nothing; a tap under the window still
closes it; any pop-up's own button answers its first tap; Escape peels one at a time) — 6 of 7 red on the old shield, 7/7 after.
`src/leavewar/ui/raisedpop-css.test.ts` (the pop-ups' layers over a raised window, the rule outside the page's wrapper) — 2 of 3
red before the stylesheet change, 3/3 after. With the neighbours (the date calendar over a sheet, the veil, the held sheet, the
sheets' order, the non-blocking windows, the person window): all green. The code check: no new finding.

**Sizing (§7.0).** Type C, E (what a tap does over a window; a layer order). Only a walk could find: whether the real phone's tap
reaches the viewer at each place, and what stands over what. The ledger: a shared listener's fault shows in every window that
uses it — so every place in the roll-call, both engines on the phone, both roles. Chosen: the host alone, one script, before and
after the fix. **Against §7.11:** lesson 4 (a press behind a window) — a tap under the window still closes it (walked and
pinned); lesson 12 (opened from one page only) — opened from the grid, the person window, Approvals, the Inputs page; lesson 1
(one state only) — the window raised and not raised; lesson 6 (only the real phone draws) — not a drawing: a tap, driven by real
touches in Chromium and in WebKit. The rest cannot apply (no drag, list, pinch, box or width change).

**The walk** (`scripts/handpass/lw-nb-docclose.mjs`; pictures `docs/img/handpass/2026-11-01-lw-next-batch/docclose/` after,
`docclose-before/` the build before the fix, `docclose-r9-red/` the raised window before the stylesheet fix,
`docclose-webkit-desk/` WebKit at 1440): **before the fix 25/35** — every blocking window red on the phone in both engines
(the viewer still up, the window behind closed: `docclose-before/p-webkit-r1-close-3-after-one-close.png`), the desktop green;
the raised window red on the desktop (`docclose-r9-red/d-r9-1-viewer-over-raised.png` — the viewer under the bid window, the
veil under the Close's middle). **After: 39/39** (desktop 1536, iPhone Chromium and WebKit, admin and member) **and 9/9** (WebKit
1440): one tap closes the viewer only, the window behind as it was (`docclose/p-webkit-r1-close-3-after-one-close.png`,
`docclose/d-r9-1-viewer-over-raised.png` — the viewer over the raised window). No errors (the viewer's own cut-off file loads
are not counted — it hands its file back as it closes).

**The reads.** A fresh, blind Opus reader of the diff: the fix correct, no regression; **finding 1** — the raised window (above),
reproduced on screen, fixed red first; notes: the "already up when the window opened" exception rested on a backwards premise
(every pop-up stands above an ordinary window) — dropped, every pop-up let through; the OIL question and its kin over a window
were eaten the same way — freed by the same fix, pinned. A fresh narrow reader of both fixes: **nothing found** (the rule
outside the wrapper, its weight beating the base rules whatever loads first; no pop-up ever needs to stay under a raised
window; nothing new reachable). Its note, kept: the lift is a `:has` rule — an old Safari (before 15.4) drops it and keeps the
old order; worth a glance in a scroll-speed pass (D991).

**A lesson drafted for the bug-check order's §7.11 (D1297) — for the coordinator to place (as lesson 19):**
19. **A window opened over a window, never closed (his find on his iPhone, the document viewer, 2 Nov 26).** The night's walk
   (H2, P2) opened the viewer from the bid window's chip and asked only that it opened; nobody pressed its Close, so the tap
   shield of the window under it — which on a touch screen eats every tap outside that window — was never met: on his iPhone
   Close closed the window behind and the viewer stayed. **Lesson:** every window or pop-up that opens over another is closed
   in the walk by each of its own ways — its Close, its ✕, its own surround, Escape — on a touch screen in WebKit as well as a
   desktop, with a picture after the one tap, and the walk asks: is it gone, and is the window under it still there as it was
   (`scripts/handpass/lw-nb-docclose.mjs`).

**Gates.** On his PC: the two new test files and their neighbours (37 files, 518 tests) green; the build clean; the code check —
no new finding. GitHub's run of the fix (`c3d0581a6`) was red on six browser tests none of this change touches, all the month's
turn to November (the calendars open on today's month): the Inputs and SANS calendars' "the month takes the width back" read
1416.00002 against 1416 (checked on his PC without the fix too: the same), and four keyboard tests (KS3g, KS3h, KS3j, KS3k) tapped
an eleventh date that November's six rows put below the phone's visible screen. Fixed in the tests only — the width to half a
pixel; the keyboard tests turn the calendar to October 2026, the month they were written in, by its own arrow — 51/51 and 61/61
on his PC (one older Inputs-calendar test, a held finger, failed once in two runs on his PC only, green on GitHub). **GitHub's run
green on `89740186e`, the last commit carrying code** — every share; its preview Ready.
 · 247 pictures · 7 places (the bid window's held day and held half, a raised bid window, the day's list, the person window, Approvals, the Inputs page's input window — desktop 1536 Chromium, desktop 1440 WebKit, iPhone Chromium and WebKit, admin and member) · 4 ways to close · MISSING: 2 fixed (the shield, red first; the raised window, red first), 1 filed (an editable Document chip opens nothing — D1292's other half)`
