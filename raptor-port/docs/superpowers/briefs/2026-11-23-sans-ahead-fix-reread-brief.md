# Narrow re-read — the fixes of the SANS-ahead round's reads (D2340, D2341), chat 154, 23 Nov 26

You are a reviewer. Read only; change no file of the app. You have not seen any other reader's report or any walk report,
and you must not look for one (this branch's handoff, the evidence sheet, the walk reports and this round's other briefs
and read reports are not in this copy, on purpose). Report in plain text. Every claim comes with: the exact state (named
people — the demo week is Mon 13 Jul 26, today Wed 15 Jul; Hex is `rocky`, a WSO and a member, signs in as `hex`; Saber the
admin signs in as `ad` / `a`), what the app does, what the rule says, the cause (file and function) and the fix, step by
step. Where you can, write the claim as a failing test (a new file under `raptor-port/src/`, which the host will copy and
run) — the host believes nothing it has not seen fail. Ask what is MISSING, not only whether the lines are right. A finding
needs a concrete failure, its cause and its fix.

## What to read
- The change: `FIX-DIFF.patch` at the root of this copy = the fixes made after the round's first reads, to `raptor-port/src`
  (and `docs/data-model.md` §11). The copy holds `raptor-port/src` and the documents named below, after the change.
- Its parts, each a fix of a fault a reader found:
  1. **A shared SANS offer with one man hidden that day** (his posting moved later): `engine/inputs.ts sansFaceShown` (the
     SANS panels of Edit Schedule's week, `ui/html.ts sansSectionHTML`, and the board, `ui/board-html.ts sbSansPanel`, draw
     only the faces of men SANS that day); `sansAvailOn` (one man's lookup — no for a man not SANS that day, a published
     face excepted); `sansDayView` (the record as that day shows it), used by a NEW published copy
     (`engine/publish.ts dayInputsFrozen`) and by the live side of "has it changed since issue?" (`frozenInputMatch`).
  2. **Who may be filed for which days, at the windows** (`ui/inputedit.tsx sansRefusal`): with dates, judged by the days
     (a past day he was SANS, his tick since taken off, may be filed); the "entry being changed" excuses a day only for a
     SANS availability record that already held that same man on that day.
  3. **The same rule at the final save, for every role and every command** (`engine/inputs.ts sansNewDayProblem`,
     `state/perms.ts sansDayViolation` inside `ownershipChecks`): before against after — a man new to a record asked every
     day of it, a man already in it only the days it newly covers; the verified replay of an Undo or Redo excepted.
  4. **His "SANS availability hidden" bell line** (`sansback`) taken away only by a command that changes his own posting
     record, or the verified replay of a step (`state/perms.ts sansBackEraseViolation`).
  5. **A member's own SANS days** (`san`, `sanFrom`, `sanWas`) changed by his own-row command only as his Quals tick writes
     them — on from today, off today — or by the verified replay of his Undo / Redo (`state/perms.ts`, the member's
     `case 'people'`).
- Their tests: `src/leavewar/sans-ahead-opusread.test.ts`, `sans-ahead-security152.test.ts`,
  `sans-review-regressions.test.ts` (two cases there are kept as known failures on purpose: they wait for the owner's
  answer on what the take-back line strikes — not a finding).
- Docs that state it: `docs/data-model.md` §11 (the Person, Input and Notice rows; the Notice table's lead paragraph).

## The rules (full rows: `grep -h '^| D2340 |' .claude/decisions-full/*.md`, the same for each)
- **D2340:** a man whose SANS posting is saved may be filed for, by himself or an admin, from the moment it is saved, for
  days from its date — by the day filed, not today. **D2341:** SANS availability shows and counts only on a day he is SANS;
  filed for a day that stops being SANS it is hidden on every screen and in every count, as if deleted, back by itself once
  the day is SANS again. **D2313:** a SANS tick by hand counts from the day it is made; a tick taken off keeps the SANS days
  he had. **D149:** a member edits his own Quals row (his SANS tick among it). **D44, D45, D178:** a published day freezes
  what it showed; a change to what it shows reads pending for the admin. **D1693, D1699, D1710:** a bell line is taken back
  by the undo of what made it. **D200, D1411:** one place answers who may do what (`state/perms.ts`), mirroring
  `data-model.md` §11.

## Not findings (D56, D785)
A problem only in data already stored (demo data, cleared before the database step) unless new data is hurt too; a
scheduler who is not an admin; what the take-back line strikes (the owner's open question).

## What to answer
1. Does each fix close its fault by EVERY door — and does any fix refuse something the app must still allow: an admin's
   ordinary edit of a record a later posting change hid (it must still save as it stands); a man taking himself out of a
   shared offer; an Undo / Redo of a SANS filing, of a posting change, of his own Quals tick; a SANS posting's own run on its
   date; the posting sheet's "Undo post out"; a move of a man to another squadron; a published day's amendment or Unpublish.
2. The published copy: a day published while a man is hidden, then the man back (his posting put back) — what does the
   working copy read, what does the published face show, does anything read pending for ever or never?
3. The member's own SANS days: any other door a member can reach that writes `san`, `sanFrom` or `sanWas` legitimately (and
   is now refused), or any way round the new check.
4. Speed: anything added that runs per record per day in a hot path (the week's and the board's redraw, every command).
5. Tests missing for any of the above.
