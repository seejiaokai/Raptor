# A fresh, blind code read — round 1 of the consistency look (D1125–D1128), `claude/board-side-width`

You are a fresh reader (D790): you did not write this code and you have not seen the chat that did. Read-only — change no
file, commit nothing. Repo: the worktree you are started in. The diff to read: `git diff 18551bdb5..HEAD -- raptor-port/src
raptor-port/e2e` (the round-1 build) — and the whole of each changed function or rule block, not only the changed lines.

## What was asked (the owner's rulings — read their full rows: `grep -h '^| D1125 |\|^| D1126 |\|^| D1127 |\|^| D1128 |' .claude/decisions-full/*.md`)

- **D1125** — the Inputs and SANS calendars' top rows alike: on a desktop ONE row on both — the three tabs, then ‹ month ›
  and Today in the same place on both pages, then at the right end Inputs' Calendar / List switch, filters and gear, or
  SANS' Highlight and gear; the month's name in the Inputs style on both, desktop and phone; the row's buttons drawn 36
  tall. The phone's rows were already alike (D705) and must not change except the SANS month's letters. The switch must
  stand in the same place on the Calendar and on the List (D687).
- **D1126** — the top bar's compact look (Undo / Redo as arrows, sync as its dot) from 821 up to 1599 wide, every page.
- **D1127** — every search box like the Edit Schedule week's: the line magnifier inside on the left, never the emoji; the
  box as tall as the buttons beside it; each keeps its words; the Tracker's ✕ stays.
- **D1128** — Quals' "Enable editing" / "Save changes" become Logic's "✎ Edit" (plain) / "Done" (blue); what each does is
  unchanged.

## The files
`raptor-port/src/ui/InputsPage.tsx`, `SansCal.tsx`, `QualsPage.tsx`, `LogicPage.tsx`, `UsersPanel.tsx`, `SchedBoard.tsx`,
`raptor-port/src/tracker/components/Header.jsx`, `raptor-port/src/tracker/tracker.css`, `raptor-port/src/ui/postout.css`,
`raptor-port/src/ui/scheduler/02-shell.css`, `24-sans-calendar.css`, `25-inputs-calendar.css`; tests `quals.test.tsx`,
`topbar-css.test.ts`, `e2e/boardside.spec.ts` (the last describe), `e2e/inputs-calendar.spec.ts`, `e2e/geometry.spec.ts`.
The evidence sheet, with the roll-call and the walk: `raptor-port/docs/handpass/2026-10-21-board-side-width.md` §7e.

## What to look for — ABSENCES first
1. A place the change should reach and does not: a search box missed; a width band where the two rows stop matching
   (821–1024, where the rows may wrap); the SANS row with no tabs (when `lead` is missing) still laid out right; the
   phone's SANS row given the tabs by mistake; the Medical tab or its as-of calendar changed by the shared rules.
2. A rule that leaks: CSS that reaches an element it should not (the `.inputs-top` order rules on the Medical tab's or the
   List's row; the `.sanscal .sc-head .abtn` 12px rule on the phone; `.inputs-filterfields label.searchbox` on a phone,
   where the filters fold behind a button and open as a full line).
3. The keyboard: the tabs moved into the SANS row — does Tab order still run tabs → month controls → Highlight → gear, and
   does the tabs' own arrow-key handling still work there? Focus still visible?
4. React: `SansCal({ lead })` — a default prop; any re-render cost or key warning from passing the tabs element; the
   Inputs page hiding its own row for SANS only on a desktop (`phone` from `useMedia`) — a resize across 820 with SANS open.
5. Tests: does each new assertion fail without the change (would it catch a regression)? Any test weakened?

**Not a finding (D56):** anything that lives only in data already stored, when the code is right going forward.
**A finding (D489)** has a concrete failure (what a person sees or cannot do, where, at what width), its cause (file and
rule), and the exact fix. Report under 500 words: findings first, most serious first, then "checked and fine" in one line
each.
