# Section 1 (the guard rail) — step K2b: the "Add a person" form's report to the guard (chat 204, 26 Nov 26)

**K2a built the form's place and look** (the "+ Add a person" opener in Admin → Users' top row, the form under it,
its Cancel — `b73d734aa`). **K1 (K1a, K1b, K1c) built the guard's table.** **K2b (this brief)** is the one thing
K2a could not do before the table existed: the form tells the guard when it holds something. No door asks the guard
yet: after K2b the app behaves exactly as today.

## Read first

- K2a's brief and report (`raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k2a-brief.md`, `…-k2a-report.md`)
  and K1b's (`…-k1b-brief.md`, `…-k1b-report.md`) — K1b's six Admin reports are the pattern: one `useGuardWork` call
  a line, "anything differs from how it opened".
- The code: `src/ui/guard.ts` (the table, `useGuardWork`, `GUARD_ORDER`), the form in `src/ui/UsersPanel.tsx`
  (`UsersPanel` — the `adding` state, `name`, `np`, `role`, `postIn`, `resetAddForm()`), the tests
  `src/ui/msq-guard-g.test.tsx` (G3–G6), `src/ui/msq-guard-open.test.tsx` (A6 and its openers, `TO_COME`),
  `src/ui/msq-guard-rollcall.test.ts` (R1, R3's census `FRAMES`, `TO_COME`).
- The plan `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`, by section, never whole:
  **§21.1 whole** — its three blocks win over any older line (the Q10 and Q1 rows: no opener while the form is open,
  no second press, no Home squadron box); §3.2 (h) (the "Add a person" row); §3.5's A6; §18.3 read through §21.1's
  block; §10's "Every step" rule.
- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` §Many squadrons (with the Read
  tool).

## What is built

1. **One row** in `src/ui/guard.ts`: `addperson` — `counts: 'row'`, `where: 'admin'`, `report: true`, its frame
   `ui/UsersPanel.tsx`, its `sel` the form's own box as K2a drew it (read its id in the file; never a new
   attribute), named for the note as the form is named on screen ("Add a person" — the words of the note are step
   K3's, not here). In `GUARD_ORDER` with Admin's other rows, after `giveaccess` (the page's own order: Waiting for
   access stands under the form, the people under that — say in the report where you put it and why).
2. **One line** in `src/ui/UsersPanel.tsx`: `useGuardWork('addperson', …)` — on while the form is open **and
   anything in it differs from how a fresh form opens**: the callsign, the initials, the seat, CAT, the sign-in, the
   Role off its opening choice, the post-in date off the day it opens on. Open and untouched: off. Folded: off —
   and folded is only ever Cancel's or Escape's fold, which empties it (`resetAddForm()`), so a fold never hides
   typing. After a successful add the form clears and stays open: off again. **Compare against how the form opens,
   not against fixed literals** — the post-in date opens on the squadron's today, the Role on its default; read how
   `resetAddForm()` and the form's first draw set each and use that, so the report cannot say "changed" of a fresh
   form at any hour. **Change nothing else in `UsersPanel.tsx`**: the Admin → Users section owns the rest of that
   file (the plan's §21.5), and its short row's own report is a later, separate line (the roll-call's `TO_COME`,
   "after S2's U1 fix merges" — leave that entry as it is).

**Not in K2b:** any door, the note and every word a person reads, the checker, the form's look or fields, the
opener, Quals' "+ Add person" door, `ui/usersfilter-model.ts`, `ui/userslist-model.ts`, `ui/AdminPage.tsx`,
`ui/postout.css`, anything under `src/tracker/` or `src/engine/`.

## Tests first, each seen failing (a pin seen passing, and named a pin)

- **`src/ui/msq-guard-open.test.tsx`:** **A6's "Add a person" half** — opened by its button, nothing in it →
  `whatIsOpen()` null; a callsign typed → `{ reason: 'row', row: { id: 'addperson' } }`; **each other field changed
  alone → the row** (initials, seat, CAT, the sign-in, the Role, the post-in date moved off today); put back as it
  opened → null; **Cancel → null, the form folded shut and empty; Escape the same;** an add that succeeds → the form
  still open, empty, null; opened by Quals' "+ Add person" with nothing typed → null; typed, then another Admin
  section shown → still the row (D2627 A6: the sections are hidden, not removed); then the Inputs tab → null (the
  page unmounts). A2, A3 and A10 extended to the new row as K1b extended them (its opener and every way out in
  `OPEN`). `TO_COME` loses its K2b entry — and the file's last test (K1c's) still proves the list holds nothing K1
  owes.
- **`src/ui/msq-guard-g.test.tsx`:** G4 gains what §18.3 asked of it once the table existed — with a callsign typed
  `whatIsOpen()` is the `addperson` row; after Cancel, and after the form is opened again fresh, null. (The
  second-press clause stays struck — D2729 Q10.)
- **`src/ui/msq-guard-rollcall.test.ts`:** R1 holds the new row by itself (a `report` row whose frame makes the
  call); R3's census line for `ui/UsersPanel.tsx` changes from the `no … K2b` reason to the row (`in addperson` for
  the form's Escape); `TO_COME` loses `addperson` and keeps only the short row's entry.
- **Must stay green, untouched:** every test of `UsersPanel` and Admin → Users (find them by name — `accounts-ui`,
  the `msq-users-*` files, `usersfilter`, K2a's `msq-guard-g` beyond the lines you add), `QualsPage`'s tests (its
  "+ Add person" door), `src/ui/pops.test.ts`, `src/state/view-reset.test.ts`, every `msq-guard-*` file.

"Seen failing" is shown by setting your code aside with a patch file (`git diff` → `git checkout --` the code files
→ run → `git apply`), never `git stash`. A test that will not fail first and is not a pin is reported, never bent.
No existing test changes beyond the lines named above.

## Then

The touched and named test files green (`npx vitest run <files>`, in `raptor-port/` by its full path; the open-test
file takes about 10 minutes — run it in the background and wait for it). `npm run build` only with the checks lock
free: `node raptor-port/scripts/gatelock.mjs status`; free → take, build, release at once; held → report NOT RUN,
never wait in a loop, never take a lock another chat holds. No full suite, no browser test, no Tracker smoke, no dev
server. Do not commit, do not push, do not edit `HANDOFF.md`, the plan, or any file outside `raptor-port/src` and
your report. A file you need that is not named here or on §21.1's list — stop and say so.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k2b-report.md`

The row as built (its `sel`, its place in the order and why); the report's exact condition and how each field's
"as it opens" value is read; each test seen failing first then green, or "pin — seen passing", with counts;
`TO_COME` of both files as it now stands; every place today's code differs from the plan's account of it; anything
only a browser can show. End your reply with the report's path and the four-line footer of
`.claude/rules/raptor-executor.md` (Status / Changes / Checks / Open items).
