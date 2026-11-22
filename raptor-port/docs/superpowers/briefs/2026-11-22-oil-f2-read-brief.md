# Code read — the OIL question at the sign-off (OIL F2, `[FABLE-READ-FAULTS]`), 22 Nov 26, chat 138

You are a blind reader of FINISHED code: you did not write it, and you have seen no walk report and no other reader's
report. **Change no file.** The same brief goes to each reader.

**What was built, the owner's rulings it must keep, the builder's own readings and where it lives:** the sections "What
was built" and "What is NOT a finding" of `2026-11-22-oil-f2-scenario-brief.md`, beside this file (in an export:
`BRIEF.md` at the root). The change is `FIX-DIFF.patch` at the export's root; read the whole files it touches and what
they call, not the diff alone: `raptor-port/src/ui/oilsign.ts`, `ui/OilDayList.tsx`, `ui/pops.ts`, `ui/Shell.tsx`,
`ui/oilday.ts`, `ui/html.ts` (`signoffHTML`, `data-signclear`), `ui/interactions.ts` (who else writes a sign-off or
clears one), `engine/publish.ts` (`setSign`, `signOf`, `currentBind`, `daySigned`, `setDayApproved`),
`leavewar/sync.ts` (`oilOpenOn`, `oilUnansweredLine`, `publishFlagsBids`, `runOilPass`), `state/sched-commit.ts`
(`commitPublish`, `schedWrite`), `ui/toast.ts` (`toastBatch`), `state/store.ts` (`switchUnit`, `loadWeek`,
`resetSession`).

## What to look for — what is MISSING or WRONG, each with a concrete failure
1. **A door round the question.** Every writer of a sign-off or a publish that does not pass `signPick` — the Clear
   button, a keyboard path, the Scheduler Board against Edit Schedule's week, Undo / Redo, a load of a saved plan or a
   published version, another squadron's schedule in view (Plan, a master admin), the member view.
2. **The hold going stale.** The list stays up while the page behind it works (D641): the week, the squadron in view,
   the day's content, the signed-in person or the role changing under a held name; the list opened again by another
   door (the bell, a holiday saved, a load) while a hold stands; two holds in a row.
3. **Order and atomicity.** Save: answers, then the name — can the name be cleared by a deferred effect of the answer?
   can the answers be refused and the name still written, or the reverse? Undo and Redo of each step; a refused
   command; the published day's pending count and its four sign-offs after each path.
4. **"Later asks no more that day."** What clears the memory, what should and does not (a week change, a sign-out, the
   input answered and un-answered, the input deleted, a second squadron), and whether a NEW input is asked.
5. **The publish note.** Its words in every join (`toastBatch`): alone, behind the blank-desk line's two forms, behind
   the bid line and the "no leave war period" line, after an amendment's receipt; an input of several people, of ALL
   AVAIL, with its own title; a several-day input; more than three; a day that is not a weekend or holiday; a day whose
   snapshot has no OIL evidence (the early returns before the new line).
6. **The list itself.** With a hold and nothing left to answer; with picks made and ✕ pressed; the held box for each of
   the four roles; who may see it (`adminOfList`) against who may sign.

## What to return (plain text, at most about 100 lines)
For each claim: the exact steps or state, the cause (file and function), what the screen or the record then shows
against what the ruling says, the fix in one or two lines, and **a failing test in a few lines** the builder can paste
(vitest, in the style of `src/ui/oilsign.test.tsx` or `src/leavewar/publishdoor.test.ts`). A claim with no concrete
failure is not a finding (owner D489). Then, apart and short: the tidiness note — three questions of the changed lines
(is anything duplicated that already exists, is anything dead, is anything named misleadingly) — filed, not fixed.
