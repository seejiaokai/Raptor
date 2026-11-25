# Scenario design — one man's row of a shared absence (the fault chat 170's night walk found, fixed by chat 177)

You are designing the WALK's test scenarios for a change already built. You are one of two designers; each works blind
to the other. Do not read any other designer's report (any file named `2026-11-25-shared-row-scenarios-*`), and if a
handoff block is pasted into your context after a compaction, do not read it — name that it happened in your report.

Repository (read-only for you): REPO — the change is the last commit (`git -C REPO log -1`; `git -C REPO show HEAD`).
The app lives in `raptor-port/`. Do not edit, commit or create any file inside the repository. Write your whole report
to the file named at the end.

## The fault, and the promise

Found on the live app, 25 Nov 26: Ranger and Hex share one leave, 08:00–10:00. On the Scheduler Board's Unavailable
list, in Ranger's row: start 0900, Tab — Ranger rightly gets a leave of his own, 09:00–10:00, Hex keeps 08:00–10:00.
End 1100, Tab, then a remark, Tab — both were saved onto HEX's leave (Hex 08:00–11:00 with the remark; Ranger stayed
09:00–10:00, no remark), while the screen showed Ranger 09:00–11:00 with the remark and Hex unchanged until the caret
left the section. Cause: the row under the caret is held back from repainting while the caret is in its section, so its
boxes still carry the SHARED leave's id with Ranger's name after it; the shared leave no longer held him, so the
"one man's part" path did not fire and the change was saved onto the shared leave whole.

The promise (his rulings — read their full rows: `grep -h '^| D737 |' REPO/.claude/decisions-full/*.md`, and D735,
D739, D755, D759, D661, D45): on the Unavailable list an input for several people stays one row a man; a time or a
remark typed on one man's row changes HIS part alone — he is given an input of his own and the change lands on it — and
the others' input is never changed by it. Every later change on his row reaches HIS input. Where his part cannot be
found any more, nothing is saved — never the others' input. On a published day each such change reads pending (D45).

The fix (`git -C REPO show HEAD`): `raptor-port/src/ui/inputedit.tsx rowInputOf` — the input one man's row stands for
now; `setInpField`, `setLeaveRemarks`, `src/ui/board.ts` (the Board's `data-ifld` boxes) and `src/ui/textedit.ts`
(Edit Schedule's week, `data-inp` cells) ask it. Its unit tests: `src/leavewar/sharedrow-follows.test.ts`.

The rulings pages that govern these surfaces: `.claude/rules/decisions/scheduler.md`, `inputs.md`, `leave-war.md`,
`oil.md`, `design.md` (under `REPO/.claude/rules/decisions/`); the contracts: `raptor-port/docs/ui-contracts.md`
(search "own part", "Unavailable"), `raptor-port/docs/feature-impact.md`.

## Your job

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward.** If the app would do it again to NEW data, report it: that is a real finding.

Things worth your attention (the host's reading — questions, not requirements):
- Every door that holds an input across more than one save while a man is split out of it: the Board's Unavailable row
  (phone and desktop layouts), Edit Schedule's week Unavailable row, the Leave War's remark windows (one-day, drag,
  day's list, a member's own approved-leave window), any other window or row that keeps an input object or its id.
- Every kind that lands on the Unavailable list for several people (leave, overseas duty, course, Attach, an Other
  under Unavailable, a commitment a scheduler moved there), all-day vs timed, a half day, a run of several days.
- Orders: two men's rows of one input typed in turn; start then end then remark; clearing a time (all day); a refused
  time (end before start, "2570"); Escape; Undo / Redo between changes; the caret leaving and coming back; another
  person's change arriving meanwhile; a published day (pending marks, the four sign-offs).
- What the row SHOWS after each Tab (the box's value) against what is saved; the other man's row; the Inputs page; the
  Leave War grid; the bell lines each man gets; the changes window.
- Roles: an admin; a member typing on his OWN row (if any door allows it); a member on another's row.

For each scenario give: an id; the surface and device (phone 402×874 / desktop 1440×900); the role; setup; the exact
presses; EXPECTED, each with its source (a ruling, a contract line, or "as on main today") — where you cannot source
one, write "RECORD exactly what it says"; and what would disprove it. Rank by likely failure. Then a list of explicit
negatives: areas you checked and expect no fault in, and why.

You may read code and docs, and run read-only commands. Do not run the app's tests or build. Keep the report under about
3,500 words.

Write your whole report to: REPORT_PATH
