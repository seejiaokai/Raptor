# Narrow re-read 3 — three small fixes (D2340, D2341, D299), chat 155, 23 Nov 26

You are a reviewer. Read only; change no file of the app. You have not seen any other reader's report or any walk report,
and you must not look for one (they are not in this copy, on purpose). Report in plain text. Every claim comes with: the
exact state (named people — the demo week is Mon 13 Jul 26, today Wed 15 Jul; Hex is `rocky`, a WSO and a member, signs in
as `hex`; Ranger is `bane`; Saber the admin signs in as `ad` / `a`), what the app does, what the rule says, the cause (file
and function) and the fix, step by step. Where you can, write the claim as a failing test (modelled on
`raptor-port/src/leavewar/sans-c154-reread.test.ts`, same imports and setup) — the host believes nothing it has not seen
fail. A finding needs a concrete failure, its cause and its fix.

## What to read
- The change: `FIX-DIFF.patch` at the root of this copy — three fixes to `raptor-port/src`:
  1. **The delete's split row, matched to its own source, once** — `state/perms.ts splitSourcesOf` and `sansDayViolation`:
     a new SANS row naming one man, with no before-image, is excused only where another SANS record of the SAME command took
     that man out (before held him, after does not) AND the new row is that record's copy — same kind, first day (`date`,
     `yr`), filing stamp (`by`, `at`), and his own entry unchanged — and each such record excuses one row only. Only the
     days that record already held are excused (`engine/inputs.ts sansNewDayProblem` with it as the before-image). The copy
     is made by `engine/inputown.ts ownInputOf`, called by a person's delete (`state/person-delete.ts applyDelete`) and two
     input doors (`ui/inputedit.tsx`).
  2. **The SANS-day walks stop** — `engine/people.ts sansOpenFrom` (the day from which every later day is his SANS day: his
     tick with no end, or a SANS posting saved ahead); `sansNewDayProblem` and `ui/inputedit.tsx sansRefusal` stop there,
     and never step past a four-digit year.
  3. **`engine/inputs.ts sansShownAny`** (does a SANS record show on any day — the Inputs and SANS lists ask it): a man SANS
     with no end shows it from that day; otherwise the walk runs to the end of his last ended SANS stretch.
- Their tests: `src/leavewar/sans-c155-astra.test.ts`, `sans-reread155-opus.test.ts`, `sans-c154-reread.test.ts`.

## The rules (full rows: `grep -h '^| D2340 |' .claude/decisions-full/*.md`, the same for each)
- **D2340:** a man whose SANS posting is saved may be filed for, by himself or an admin, for days from its date. **D2341:**
  SANS availability shows and counts only on a day he is SANS; hidden on a day that stops being SANS, back by itself once
  SANS again. **D2313:** a tick by hand counts from the day it is made; a tick taken off keeps the SANS days he had.
  **D299:** a deleted man's past is kept, today and the future go. **D200, D1411:** one place answers who may do what.

## Not findings (D56, D785)
A problem only in data already stored unless new data is hurt too; a scheduler who is not an admin.

## What to answer
1. Fix 1: can any command — a member's own batch, an admin's paste, an Undo, the posting pass — use the allowance to add
   a day or a person, or to save more than one row per record? Does every legitimate split still pass (a delete with the
   man in one, two or three shared offers, any order; the two input doors that split)?
2. Fix 2: is `sansOpenFrom` ever earlier than a day he is NOT SANS (an untick, an ended stretch, a posting saved ahead and
   then moved, `sanFrom` missing on an old tick), so a walk stops too soon and approves a non-SANS day?
3. Fix 3: can a record now show on the lists while none of its days is shown on the calendar, or the reverse?
4. Tests missing.
