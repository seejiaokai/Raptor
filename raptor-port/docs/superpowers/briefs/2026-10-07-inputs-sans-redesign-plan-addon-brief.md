# Brief — challenge the add-on to the build plan: the Event sheet, presets and short names — one round, independent

Written 7 Oct 26 by the host (Opus 5.5), who wrote the section — you are not its writer (D67, D590). You are ONE of two
readers (Astra, Sol 6.1). Read alone: do not look for, open or rely on the other reader's report
(`2026-10-07-inputs-sans-redesign-plan-addon-astra.md` / `…-sol.md`), nor either reader's report on the main plan.
**Read-only: change no file, run no test, build nothing, start no server.** Your whole output is your report.

## What you are reading

ONE section of a plan, added after the plan's own challenge: **§3.12** of
`raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md`. Read the rest of the plan only as far as
§3.12 leans on it (§3.1 `dayFacts`, §3.4 the Holidays list, §3.7 windows, §4 the order). Nothing is built.

Read these whole first (none of it loads for you by itself):

- **His rulings, FULL rows:** `grep -h '^| D64[345] \|^| D634 \|^| D641 ' .claude/decisions-full/*.md` — D634 (the sheet
  stays as built, since narrowed), D643 (plainer; short names), D644 (fewer words; "Presets", not "Type"), D645 ("yes
  to all"), D641 (which pop-ups are windows and which are small menus).
- **The design note's last sections:** `raptor-port/docs/superpowers/specs/2026-10-07-inputs-sans-redesign.md`, from
  "The Event sheet made plainer" to "The sixth set".
- **The Leave War's rulings, settled decisions and architecture:** `.claude/rules/decisions/leave-war.md`; and
  `.claude/rules/decisions/oil.md` (D21 — an Off day earns no OIL; D2 — only the issued schedule earns; nothing here
  may move what earns).
- **The code §3.12 describes** — check its claims against the live files: `raptor-port/src/leavewar/ui/EventSheet.tsx`
  (all of it), `ui/EventRows.tsx`, `ui/eventsheet.css`, `engine/eventdefs.ts` (all of it — `classifyEvent`,
  `columnKindFor`, `dayEventKind`, `isNonWorkingDay`, `readEventDefs`, the edit helpers), `engine/period.ts` (`DayInfo`,
  `EventBand`, `buildDays`), `state/store.ts` (`readWar` ~l.688–760; `setDayEvent`, `setDayEventRange`, `addEventBand`,
  `removeEventBand`, `moveEvent` ~l.3239–3420; the event-type writers ~l.3480–3560), `state/rows.ts`, `sync.ts`
  (`isNonWorkingISO`, and every reader of a day's events), `ui/Matrix.tsx` where it opens the Event sheet and paints the
  column's kind; and the tests that pin today's sheet — `src/leavewar/**/*.test.*` and `e2e/*leavewar*` that mention
  `event-quick`, `event-tag`, `event-edit-types`, `evtype-`.

## What to find

1. **A saved event that reads differently after this change than he would expect** — a concrete event (its text, its
   tag, a band, a library edited since), what the grid prints for it under `shortOf`, and why that is wrong. Look hard
   at: two presets of one kind; a preset renamed or deleted after events were saved with it; an event whose text matches
   one preset and whose tag is another kind; text of three characters or fewer containing a space; non-letters.
2. **Anything that could move what earns OIL or which days are non-working** — a path where the kind is now read from
   the short form, the name or the lit preset instead of the tag and the library.
3. **What is MISSING** — every place the app prints or reads an event's text (the grid, bands, the frozen header
   copy, a tooltip, exports, the OIL tracker, the schedule's warnings, the change history, Undo's words, the move
   mode) and is not in §3.12; every writer of an event or a band that must now carry the short form (a move, a range,
   a band replaced, "Reset to standard").
4. **The tap.** A sequence of presses in which the small box and the sheet, or the box and a drag along the line, or
   the box and the move mode, leave the admin unable to edit, or open the wrong thing.
5. **The records.** A reload, an Undo, a merge of the `war:<id>` row, or an older stored library, after which a short
   form is lost, doubled or attached to the wrong line.
6. **A rule in §3.12 with no test in its test list.**

## What is NOT a finding

- Taste, or another way to build the same thing with no failure shown.
- A claim with no concrete case: a finding needs where · the concrete failure (the presses, the data, the result) ·
  why · **the exact change to §3.12 that fixes it** (D489).
- A problem that lives only in data already stored (D56) — but note §3.12 deliberately changes how an OLD event is
  PRINTED; a wrong print for old data under the new code IS a finding.
- A product choice he has ruled (D643–D645) — unless you think §3.12 misreads it; then name the ruling and say why.

## Your report

- First line: **PASS** or **CHANGES REQUIRED**.
- Findings numbered, most serious first; each: where · the concrete failure · why · the exact fix.
- Then, briefly: what you checked and found sound, and what you could not check.
- **Astra only — D138:** read the short lines of D642, D643, D644 and D645 in `.claude/rules/decisions/scheduler.md`
  against their full rows; say PASS, or name the line that loses or adds a condition.
- Say plainly that you changed nothing, ran nothing, and read no other reader's report.
