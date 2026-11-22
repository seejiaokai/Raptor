# Code read — SANS from its date on every screen (D2313), the publish note's names (D2314), 22 Nov 26, chat 140

You are a blind reader of FINISHED code: you did not write it, and you have seen no walk report and no other reader's
report. **Change no file** (a proof test you write goes in a scratch folder outside the checkout, never under `src/`).
The same brief goes to each reader. State each finding in your output the moment it is confirmed, so a stopped run
keeps it.

**What was built, the owner's rulings it must keep, the builder's own readings and where it lives:** the sections "The
promise", "What was built" and "What is NOT a finding" of `2026-11-22-sans-from-date-scenario-brief.md`, beside this file
(in an export: `BRIEF.md` at the root). The change is `FIX-DIFF.patch` at the export's root (everything under
`raptor-port/src` since `main`); read the whole files it touches and what they call, not the diff alone:
`raptor-port/src/engine/people.ts` (`sansOnP`, `sansOn`, `sansStart`, `sansStop`, `sansErase`), `state/quals-write.ts`
(the hand tick), `leavewar/sync.ts` (`sansPostedFrom`, `availableFor`, `runPoOutcomes` — both runs, the three take-backs,
`oilUnansweredLine`, `publishFlagsBids`), `engine/publish.ts` (`attrsOf`, `dayPeopleAttrs`, `peopleAttrsNow`, `freezeWarn`,
`warnDelta` and every caller of `peopleAttrsNow`), `engine/validate.ts`, `engine/weekctx.ts`, `engine/avail.ts`
(`sansGate`, `slotBar`), `engine/faceattrs.ts` (`withDrawDay`, `personShown`), `ui/html.ts` (`dayHTML`, `availHTML`,
`withChipWorld`, `puck`), `ui/board.ts`, `ui/palette-html.ts`, `ui/pendlist.ts`, `ui/peek.ts`, `ui/sanscal-model.ts`,
`state/flyplan.ts`, `state/perms.ts` (`PASS_FIELDS`), `engine/schema.ts`. The rulings pages: `.claude/rules/decisions/`
`people-accounts.md`, `oil.md`, `scheduler.md`, `leave-war.md`; a ruling's full row:
`grep -h '^| D2313 |' .claude/decisions-full/*.md`.

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.**

## What to look for — what is MISSING or WRONG, each with a concrete failure
1. **A reader still on today's tick.** Every read of `p.san` / `quals.san` left in `src/` — does a DAY's screen, count,
   warning, OIL credit or published compare still ask it? (Left on today's tick ON PURPOSE, and filed where they are
   wrong — not findings: the Leave War's row and `availrows.ts`, the Inputs calendar's opened day, the SANS day's pucks
   and Highlight, the SANS highlight chip, who may file SANS availability, the Quals tick.)
2. **The draw-day context** (`withDrawDay`, a module variable): a builder that draws a man on a day OUTSIDE it — a
   partial repaint of one block, the phone board, the issued face, a look at an older version, the print or export, a
   drag ghost, a popup; a nested or re-entrant call (a builder for day A calling one for day B), an exception thrown
   inside it leaving the day set; `personShown` handing back a COPY — who compares, mutates or caches the object it
   returns (identity checks, `PEOPLE[id] === p`, a write through the copy that is lost).
3. **The dates' arithmetic.** `sansOnP` with a missing, empty or odd date; ISO string compares across a year's end;
   `sanWas` stretches that touch, overlap or are empty; `sansStart` merging (and the `apart` posting start that does not);
   a tick put on and off the same day; a tick on a day in next week's view; "today" at midnight — which today each writer
   uses (`todayIso`, `effectiveToday`, the posting's own date) and whether two of them can disagree.
4. **Each writer's order with the others.** A hand tick on a man the posting already made SANS (it drops `sanBy`) and the
   posting then taken back, moved to a later date, re-run, or given another outcome; a posting on a man SANS by hand; an
   archive, a Restore with and without a post-in date, a delete, a transfer; Undo and Redo of the tick across a posting's
   run; `sansPostedFrom` when the posting record has gone or its date has moved.
5. **The published day.** What `snap.pa` froze before this change (no date asked) against a compare that now asks by the
   day: can a day published BEFORE his date now read pending, or one ON or AFTER it fail to? The four sign-offs, the
   pending list's line, `warnDelta` and the frozen warnings; a day published, then the tick, then an amendment — whose
   answer does the new version keep; "Load onto working copy"; an older version looked at.
6. **OIL.** The ALL AVAIL crowd of a published weekend before and after a tick or untick made later; the engaged
   exception in `availableFor`; a credit that would move without an amendment, or an amendment that moves one it should
   not (D142, D48).
7. **The publish note (D2314).** Its words for one, two, three or more people, ALL AVAIL, ALL, a placeholder beside
   named people, a person with no callsign, an archived or deleted person, a title of its own, the same person twice;
   the apostrophe; the joins with the lines before and after it.
8. **Permissions and saving.** A member's own tick writes `sanFrom` / `sanWas` — does the own-row gate, the posting
   pass's field list (`PASS_FIELDS.sans`) or the row writer refuse or drop either? Do both fields survive a save and a
   reload, a week change, another tab's write of the same person?

**What is NOT a finding:** this app's stored world is demo data that will be cleared before the database step — do not
report a problem whose harm exists only in data already stored when the code is already correct going forward; if the
app would do it again to NEW data, report it. A scheduler is always an admin (D785).

## What to return (plain text, at most about 100 lines)
For each claim: the exact steps or state, the cause (file and function), what the screen or the record then shows
against what the ruling says, the exact step-by-step fix, and **a failing test in a few lines** the builder can paste
(vitest, in the style of `src/leavewar/sans-from-date.test.ts` or `src/leavewar/publishdoor.test.ts`). A claim with no
concrete failure is not a finding (owner D489). Explicit negatives too ("I checked X and found nothing"). Then, apart
and short: the tidiness note — three questions of the changed lines (is anything duplicated that already exists, is
anything dead, is anything named misleadingly) — filed, not fixed.
