READY for his look — both faults fixed and walked, every gate green on the last push (ebff3189b). Some orders were not walked, and one WebKit look is owed; both are listed below.

Chat 170's helper, job 3, Part B — closing report. Branch claude/r4-walk-faults-170, pull request 843 (draft). Last commit: ebff3189b (pushed).

Walk: docs/handpass/2026-11-25-r4-walk-faults.md · 96 pictures · 4 surfaces (the passing note; the Scheduler Board's Ground Programme, Personal Inputs and day panel; Edit Schedule's week; a reload) · 10 orders (N1, N2, N3, W1 1–4, W4, H1–H5) · MISSING: fixed — both faults, Fable's matching by place, the reads' week fault, B3; filed for the host — the orders not walked, the WebKit look owed for Astra's finding 2, the tidiness notes

## The walk
- The walker (Opus, Low) ran on main's frozen build and the branch's build before the reads' fixes. Results:
  - N1/N3: the long note at nine sizes. FAIL on main at 402 and 320; PASS everywhere on the branch.
  - W1 steps 1–4: FAIL on main (the Ground Programme row one change behind); PASS on the branch.
  - W4: RECORD. The press took the caret, so the risky state was not made.
  - Its room then ran out.
- The host ran r4wf-host.mjs on main and on build-fix3. That build was made at 03:58, after the last source edit, so it carries the reads' fixes. Desktop Chromium 1440 and phone WebKit 402 with touch.
  - H1: the ground START typed reaches Personal Inputs at once. FAIL on main, PASS on the branch.
  - H2 (Fable's B3): click into another section with nothing typed; the section left is written at once. FAIL on main, PASS on the branch.
  - H3: Undo and Redo pressed. Pass on both builds.
  - H4: Done, the week, then a reload. Pass on both.
  - H5: a shared input's end. FAIL on main, PASS on the branch.
  - N2: five ordinary notes measured. Identical on both builds.
- No page errors on any run.
- Deciding pictures opened by me:
  - W1 and N1, phone WebKit, main and branch;
  - H1 phone WebKit, main and branch (Personal Inputs 08:30 against 09:00);
  - H2 desktop on the branch;
  - H5 desktop on the branch;
  - N2, the phone's publish note.
- RECORD for his look: at 621 and 768 wide, a note holding one unbroken long word is now narrower, because the word breaks instead of widening the note. Ordinary notes are unchanged.

## Not walked, and why (sheet §13)
- W2 (b)–(e), W3, W8, W9, W10, W11: the walker's room ran out, and I walked the main orders myself instead of starting another walker in the night. Each of these is the same one section-by-section write; its fallbacks and the Tab route are carried by tests.
- W4 and W7 with the caret kept through the press, and W5 (a) after a drag: not made by the test browser. Carried by the tests for the day changed, the week changed and the drag.
- N1 (b)–(f) and N4: the one style sits on the one element every note uses, and N2 shows ordinary notes unchanged.

## Each reader's claims and what became of them
1. The fresh Opus (finding 1) and Astra (finding 1) found the same fault.
   - The fault: stepping the week on the Board with the caret in a box wrote the new week's sections around the old week's flying section.
   - What I did: reproduced it as a failing test, then FIXED it red-first. The section-by-section write now runs only while the navigation generation matches the panel's last whole write. Break 7 catches its removal.
2. Astra, finding 2: the Blue/Red question was put back outside holdingPlace, so the caret's box could jump.
   - What I did: FIXED BY READING ONLY, a one-line wrap.
   - No test proves it: no test could open a question in jsdom (three ways tried), so I removed the test rather than keep one that proves nothing. A WebKit look on a phone is owed.
3. Tidiness, both readers, filed and not fixed:
   - the fix's story is told in three comments;
   - `held` has two meanings;
   - put's caret branch is dense;
   - one length check is implied by another.
4. Fable's scenario design, earlier: B1/B2/B4, sections matched by place, were fixed in ab9aec9fb. B3 was built red-first on your clearance. Break 8 catches its removal.
5. No claim rested on a ruling.
Both reads are saved whole beside the brief: docs/superpowers/briefs/2026-11-25-r4-walk-faults-read-{astra,opus}.md.

## SchedBoard.tsx beyond put / panelKids (the overlap with PR 826)
- The import line adds owesBeside.
- The focus-out listener `resume`: its `if (editingText()) return` now paints when the caret is on the Board and a section it left is owed. This is B3, which you cleared.
- The paint effect's `reconcileMissionRoleOffer()` is wrapped in `holdingPlace(caret, …)` when a caret is on the page. This is Astra's finding 2, one line. It was NOT cleared beforehand; please confirm it.
- Nothing in the top bar was touched. toast.ts still has only the one property.

## Reads owed
- None of the job's reads is owed: Astra and the fresh Opus both read; the scenarios came from Astra and a fresh Fable.
- The WebKit look for Astra's finding 2 is owed: a look in the app, not a read.

## Gate counts
- Local, on the committed code:
  - board-heldpanel: 10 of 10;
  - the touched suites: 22 files, 522 tests green;
  - tsc -b: clean;
  - lint:changed: no new finding (15 files);
  - the note's browser test: 3 of 3 under the lock;
  - breaks: 8 of 8 caught;
  - docsize: OK.
- GitHub, on ebff3189b: every check green — unit raptor 6 of 6, unit Leave War 4 of 4, geometry raptor 4 of 4, geometry Leave War 3 of 3, Tracker smoke 2 of 2, code check, build, docs-guard, secrets scan, Vercel preview; "all gates (your PC)" and deploy skipped as usual while the repo is public. Read to its end; the pull request's head is ebff3189b with 0 failing checks.

## For you to file (I did not touch the backlog)
- The orders not walked.
- The WebKit look owed for Astra's finding 2.
- The tidiness notes.
- The RECORD on mid-width notes, for his look.

Untracked raptor-port/.tmp/ was left alone; it is not mine. No background process is left running.
