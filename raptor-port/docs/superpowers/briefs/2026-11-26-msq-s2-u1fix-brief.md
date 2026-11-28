# S2 step U1's fix — an open row is judged again on every draw (chat 205's brief, 26 Nov 26)

For one Opus builder. The orchestrator (chat 205, Fable) reviews your diff, runs your tests and commits; **you do not
commit, push, build or take the checks lock.** Work only in this working copy
(`C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0`, branch `claude/msq-s2-users-685735`).

## Read first, yourself, whole where short

- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (open it with the Read tool).
- The plan, by section only (it is 500 KB — never whole): `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`
  §21.2 with its "Step 0" block (row Q13 is this fix's note) and §19.1.
- U1's own brief and report: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1-brief.md`, `…-u1-report.md`.
- The two readers' reports and their proofs, in the shared notes folder (outside the repo):
  `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat199/opus/`
  (`report.md`, `zz-opus-proof-1`, `-2`) and `…/s2-chat199/security/` (`report.md`, `zz-security-proof-1..5`).

## The fault (both readers, proven)

U1 (15112a2ac) judges a row once, when it is opened. A row opened WHOLE on the man's own squadron's page stays the
whole editor — sign-in box, Role, every line, Suspend / Enable, Give sign-in, Archive, Delete, all live — after the
page's squadron changes by a pick (Opus F1; security A1–A4), and after the man's move lands with no pick at all
(security A5, A6). A SHORT row held across a pick shows the old squadron's line under the new page (Opus F2).

## The rule to build — one rule, every row

1. **The page holds, for every open row, the squadron it opened on and how it was judged (whole or short)** — not
   `null` for a whole row.
2. **On every draw the open row is judged again against the page as it now is** (the set-while-drawing pattern
   `useUsersFilter` already uses — no effect for the state change). If the judgement differs from the one it opened
   with — whole but he is now another squadron's man here; short but the page's squadron is no longer the one it
   opened on; short but he is now the page's own man — **the row closes. Nothing typed is carried over.**
   - Closed because **the signed-in person picked another squadron** (the page's squadron differs from the one the
     row opened on): **no note** — his own act. (Once the core's K4 refuses a pick over a changed row, this only
     ever meets an unchanged one; that refusal is not yours.)
   - Closed because **the row changed under him with no pick** (the page's squadron is the one it opened on, the
     judgement changed — a move landed, an Undo, another's change): **the Q13 note, once** — the existing
     `changedWhileOpenWords(callsign)`, the app's passing note, exactly the words U1 already uses at the short row's
     Save. No new words anywhere in this fix (D1625) — if you find you need any, stop and say so in the report.
3. **The belt, at the head of every write the whole row can make** — its Save, Suspend / Enable, Give sign-in,
   Archive and Delete: if the man is another squadron's here, or the page's squadron is not the one the row opened
   on, send nothing, show the Q13 note, close the row. (It is what catches a move landing as the date rolls, when
   nothing redraws.) The short row's Save already judges again — keep it.
4. An open row is never drawn as `PersonEditor` while the man is another squadron's on this page, by any route.

Not yours here: "Edit on 142 →", the refusal at a pick (V4c, the core's K4), the unsaved flag counted by the core's
K1, the Archived fold (finding B — U3's), the fail-open for a man with no readable home (finding C — filed against
the database step). Do not change `ui/usersfilter-model.ts` or `foreignHere`'s meaning for B or C.

## Tests first — see each fail before you change the app

1. Copy the readers' proofs for this fault into the repo as lasting tests and run them as they stand: **Opus proof 1
   (both cases) and proof 2 (both cases); security proofs 1 and 5 (A1–A7).** Each must fail today for the reason the
   report gives; say in your report if one does not. Home: `raptor-port/src/ui/msq-s2-row.test.tsx`, or a second
   file `raptor-port/src/ui/msq-s2-rejudge.test.tsx` if that keeps both readable. Names in plain words of what a
   person sees, as U1's are; no `zz-` names left in the repo.
2. Add, failing first: the whole row's five belt cases (Save, Suspend / Enable, Give sign-in, Archive, Delete — each
   sends nothing, shows the note, closes); the note shown once and only for a change with no pick; no note at a
   pick. Where a landing can be made with no redraw (the date rolling past a move's day under fake time), test the
   belt that way; if the test world cannot, say so.
3. Two of U1's own cases change with the rule — re-point them by name, never weaken them: "his move lands while the
   row is open" (now: the row closes when the move lands, the note names him, nothing sent) and "the page's squadron
   changes while the row is open (150 picked)" (now: closed at the pick, no note, nothing sent). The check at the
   short row's Save stays tested.
4. Keep findings B and C as **as-built pins**, so their proofs live in the repo: security proof 2 (B) as tests
   asserting today's behaviour, named "… — changes at U3 (the Archived fold is the page's own squadron's)"; proof 3
   (C) likewise, named "… — closes before the database step (`[MSQ-S2-NO-HOME-ROW]`)". A pin asserts what the app
   does today and passes.
5. Then the fix, in `ui/UsersPanel.tsx` (and `ui/UserAccess.tsx` / `ui/useraccess-model.ts` only if needed).
   The test world is the core's (`test-support/msq-world.ts`) — use its men through `moveMan` / `acrossMove`; do not
   edit it; a man it truly lacks, say so.

## Checks you run (no lock needed — one file at a time, never the full suite, never `npm run build`)

From `raptor-port/`: `npx vitest run <file>` for each of `src/ui/msq-s2-row.test.tsx`, your new file if any,
`src/ui/msq-s2-asis.test.tsx`, `src/ui/msq-users-row.test.tsx`, `src/state/msq-s2-plan.test.ts`,
`src/state/msq-s2-order.test.ts`, and every other test file that renders `UsersPanel` (grep for it; U1's report
lists the ten the last orchestrator ran). `npx eslint` on the files you changed.

## Report — write it BEFORE anything that might wait

Write `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1fix-report.md`: what changed and why, file by file;
each proof case — failed before (the line it failed on), passes after; each test added or re-pointed, by name; the
test files run with their counts; anything you could not do, any place the rule above was unclear and what you
chose; anything a person would SEE differently (there should be nothing beyond the row closing and the existing
note). Then reply with a ten-line summary and the report's path. Stage nothing, commit nothing.
