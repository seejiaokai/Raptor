# Narrow re-read 2 — the fixes of the second re-reads (D2340, D2341), chat 155, 23 Nov 26

You are a reviewer. Read only; change no file of the app. You have not seen any other reader's report or any walk report,
and you must not look for one (this branch's handoff, the evidence sheet, the walk reports and this round's other briefs
and read reports are not in this copy, on purpose). Report in plain text. Every claim comes with: the exact state (named
people — the demo week is Mon 13 Jul 26, today Wed 15 Jul; Hex is `rocky`, a WSO and a member, signs in as `hex`; Ranger is
`bane`; Saber the admin signs in as `ad` / `a`), what the app does, what the rule says, the cause (file and function) and
the fix, step by step. Where you can, write the claim as a failing test (a new file under `raptor-port/src/`, which the host
will copy and run) — the host believes nothing it has not seen fail. Ask what is MISSING, not only whether the lines are
right. A finding needs a concrete failure, its cause and its fix.

## What to read
- The change: `FIX-DIFF.patch` at the root of this copy = five small fixes to `raptor-port/src`. The copy holds
  `raptor-port/src` and the documents named below, after the change.
- Its parts, each a fix of a fault a reader found:
  1. **An issued face keeps the SANS cards it went out with** — `engine/inputs.ts sansFaceShown` returns yes on a frozen
     (published) face; only the working copy hides the card of a man whose day stopped being SANS.
  2. **A member's Undo / Redo of his own SANS tick on a later day** — `undo/timeline.ts verifiedReplay` now vouches for a
     `people` row, image for image, for the step the timeline is applying (same actor, same step); the commit gate's
     member check (`state/perms.ts`, `case 'people'`) asks it only after the admin-only fields are checked.
  3. **Every new day of a SANS filing is asked, however far on** — `ui/inputedit.tsx sansRefusal` and `engine/inputs.ts
     sansNewDayProblem` no longer stop after 400 days (which read the rest as approved); the days the record already held
     for that man are stepped over in one jump.
  4. **Deleting a man whose part of a shared offer is hidden** — `state/perms.ts splitSourceOf` (used by
     `sansDayViolation`): a new SANS row naming ONE man, with no before-image, is judged against another SANS record of the
     same command whose before held him and whose after does not (the delete's split, `engine/inputown.ts ownInputOf`).
  5. **One posting move, one pending change** — `engine/publish.ts peopleAttrsNow(pa, iso, snap)`: a man on the issued day
     only through SANS availability, whose day stopped being SANS, is not compared a second time on "SANS yes → no" (the
     availability's own line carries it); its four callers pass the version.
- Their tests: `src/leavewar/sans-c154-reread.test.ts` (R1a–R5, R1c and R3b, R4b the host's negative cases) and
  `src/leavewar/sans-reread154-opus.test.ts`.
- Docs that state it: `docs/data-model.md` §11 (the Person and Input rows).

## The rules (full rows: `grep -h '^| D2340 |' .claude/decisions-full/*.md`, the same for each)
- **D2340:** a man whose SANS posting is saved may be filed for, by himself or an admin, for days from its date. **D2341:**
  SANS availability shows and counts only on a day he is SANS; on a day that stops being SANS it is hidden everywhere, back
  by itself once SANS again. **D2313:** a SANS tick by hand counts from the day it is made. **D149:** a member edits his own
  Quals row. **D44, D45, D178:** a published day freezes what it showed; a change reads pending. **D109, D113:** one act,
  one pending change. **D299:** a deleted man's past is kept, today and the future go. **D200, D1411:** one place answers who
  may do what (`state/perms.ts`), mirroring `data-model.md` §11.

## Not findings (D56, D785)
A problem only in data already stored unless new data is hurt too; a scheduler who is not an admin; what the take-back line
strikes (the owner's open question).

## What to answer
1. Fix 2: can anything other than his real Undo / Redo of his own step now write a `people` row through the replay's
   allowance — another man's row, an admin-only field, a forged envelope, a restore of a DIFFERENT step, an Undo after the
   row changed again? Does any other gate that asks the replay for a `people` change now let through what it should not?
2. Fix 4: can a command that is not a split use the allowance to add days or people (two SANS records in one command, a
   paste, a member's own batch, the delete of another man)? Does it close every door a split takes (a squadron move, a
   person's archive, any other writer that calls `ownInputOf`)?
3. Fix 5: can a real change now read 0 pending — a man named on the day elsewhere, his CAT or seat changed, his SANS
   changed with the offer unchanged, a crowd man?
4. Fix 3: speed — a long record edited often; and any input the walk loop could fail to end on.
5. Tests missing for any of the above.
