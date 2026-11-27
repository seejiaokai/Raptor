# S2 step U1's second fix round — what the four reads of eda4bd991 found (chat 205's brief, 26 Nov 26)

For one Fable builder (D2233: a fault a fix meant to close, come back, is Fable's to fix). The orchestrator (chat 205)
reviews your diff, runs your tests and commits; **you do not commit, stage, push, build or take the checks lock.**
Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0` (branch
`claude/msq-s2-users-685735`). Another builder has UNCOMMITTED changes there (the squadron lists re-pointed to one
order — `state/perms.ts`, `ui/squadrons-model.ts`, `ui/usersfilter-model.ts`, `ui/useraccess-model.ts`, tests): leave
its lines alone; if you must edit a file it touched, change only your own lines and say so.

## Read first

- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (with the Read tool).
- The rule the code must keep: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1-read-brief-2.md` (the readers'
  brief — its two rule paragraphs are the contract), and the first round's brief and report beside it
  (`…-msq-s2-u1fix-brief.md`, `…-u1fix-report.md`).
- The four readers' reports and proofs (outside the repo), every proof re-run by the orchestrator and failing as
  claimed: `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/`
  — `astra/report.md` (`zz-astra-proof-1..4`), `fable/report.md` (`zz-fable-proof-0..4`), `opus/report.md`
  (`zz-opus-proof-1`, `-2`), `security/report.md` (`zz-security-proof-1`). Each report gives the cause by line and a
  step-by-step fix; where two differ, THIS brief decides.

## The verdict of the reads

The main rule holds — no route opens another squadron's man's whole row, the short row's Save sends one line. What is
left is at the edges: the judgement held for an open row is too thin (it knows the page's squadron and short-or-whole,
nothing else), one editor has no belt, and the note is decided by the wrong sign.

## What to build — one widened rule

**1. The held judgement knows more.** `OpenedOn` holds, from the press that opened the row: the page's squadron, short
or whole, **his home squadron that day, whether he was archived, and what is needed to tell his own pick from any
other change of the page's squadron** (item 5). `rowChanged` is true when ANY of them no longer holds: the page's
squadron differs; "another squadron's man here" flipped; **his home is no longer the one the row opened on** (Fable 3,
Astra 4 — a move from one other squadron to another: the row closes with the note; Astra's proof 4 expected the row to
stay open and the words to follow him — re-point it: closed, the note once; opened again it reads today); **he was
archived or restored under it** (Fable 2, the security read's "one more face" — an open row is never carried from the
roster row to the archived row or back). One judgement, handed WHOLE to all three editors (`PersonEditor`,
`ForeignEditor`, `ArchivedEditor`) and judged by all of it at every write — no editor rebuilds a part of it
(`{ unit, short: false }` goes).

**2. The archived man's row gets the belt** (Astra 1, Fable 1, security 1 — the one finding where a write lands):
`ArchivedRow` is handed the held judgement and draws its editor only with it; `ArchivedEditor`'s Restore, "Restore
as", Save name and Delete (both taps — before the arming too) ask again first, as `PersonEditor`'s five do. Judge
against the judgement as held at the press, so the as-built pins B1 and B2 (another squadron's archived man opened
under the Squadron tick) keep passing until U3 retires the tick.

**3. An editor judges itself on its own draws too** (Astra 2): after his move lands with nothing redrawn, typing in
the whole row redraws only the editor, and the whole editor is drawn again for a man by then another squadron's. Each
of the three editors asks `rowChanged` on every draw of its own; where true it draws nothing and closes the row with
the note (raised after the draw, once — never twice with the page's own note, never under strict mode). If that proves
unsound in React, the fallback is Astra's: ask at the head of every local change (name, Role, a line, the callsign
box) — say which you built and why.

**4. The open short row shows the line he holds today** (Fable 4, Opus 2): `ForeignEditor` reads the held line on
every draw and holds only what the admin picked (Fable's steps 1–6, taken whole): an untouched row always shows
today's line; `unsaved` is "picked, and differs from the line he holds now"; Save reads the held line once more and
sends only a pick that differs from it. Not Opus's "close with the note when the line changed" — the row stays, true
to today. The no-sign-in words read his home on every draw as well (with item 1 the row closes when his home changes,
so this is the belt-and-braces half).

**5. The note is owed whenever he did not pick** (Opus 1, Astra 3, Fable 5 — three readers): today "the page's
squadron changed" stands in for "he picked", so a Plan taken or lowered by another admin, an Undo, or his own move at
midnight closes the row and drops his typing in silence. Decide it by the app's own record of a pick —
`state/typing-hold.ts enteredByPick()` with the squadron in view at the press, as Fable's fix 5 and Astra's fix 3
give it. **Do not edit `state/store.ts`, `state/typing-hold.ts` or `state/pick.ts`** (the core section's files) — so
Fable's exact form (a pick counter in `enterSquadron`) is NOT built; the one rare case the lighter test gets wrong
(a row that survived a View-only pick, closed later with no pick by his own move to that very squadron) is written
down in your report for the core section, with a test marked as built today if you can write one.

**Kept exactly:** a row's own writes raise no note (its own Archive, Restore, Suspend, Delete close it in the same
press — with item 1's archived term, keep a test of Archive and Restore raising none, or close before the store
tells the page); a View-only pick leaves the row open; no loop; one note; no new words anywhere (D1625 — the only
note is `changedWhileOpenWords`; if you find you need other words, stop and say so).

**Not yours:** the doors (`state/accounts.ts` — two door notes are filed, below); finding B's fold and finding C
(pinned); `data-acct` / `data-editing` on the short row (filed); the whole row's own captured lines (older than U1;
filed); the tidiness notes — except these three, which you take: the comment above `ForeignEditor` still describing
judge-at-Save-only, the test file header "written red first on chat 199's U1", and one shared helper for the
editors' belt instead of three copies.

## Tests first — every proof seen failing on today's code before you change the app

Make lasting tests of: Astra's 1, 2, 3 and 4 (4 re-pointed as item 1 says); Fable's proofs 1 (3 tests), 2 (3), 3 (6)
and 4 (1), and its proof 0's eight soundness tests where the step's own tests do not already hold the same thing;
Opus's 1 and 2 (2 re-pointed to item 4: the row shows today's line, Save sends only a pick that differs from it);
the security proof's three failing cases and its two pins — duplicates of one case merged, each reader's case named
once. Home: `raptor-port/src/ui/msq-s2-rejudge.test.tsx` (split a second file `msq-s2-rejudge2.test.tsx` if it grows
unreadable). Use Fable's `asOther(who, fn)` helper for another admin's write, never `signInAs` mid-test (a sign-in
resets the page). Plain-word test names; no `zz-` names in the repo. Never weaken a test; a case of the first round
that the widened rule changes is re-pointed by name and listed.

## Checks you run (no lock — one file at a time; never the full suite, never `npm run build`)

From `raptor-port/`: `npx vitest run <file>` for `src/ui/msq-s2-rejudge.test.tsx` (and a second file if any),
`src/ui/msq-s2-row.test.tsx`, `src/ui/msq-s2-asis.test.tsx`, `src/ui/msq-users-row.test.tsx`, and every other test
file that draws `UsersPanel` (the first round's report lists the 22 it ran). A file red only because of the other
builder's uncommitted work: say so, do not fix it.

## Report — written BEFORE your final reply

`raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1fix2-report.md`: what changed and why, item by item; each
reader's case — failed before (on which line), passes after; tests added, merged or re-pointed, by name; files run
with counts; which form of item 3 you built; the rare case of item 5; anything a person would SEE differently
(expected: the row closing with the existing note in more cases; the short row's line following a change made under
it); anything unclear and what you chose. Then a ten-line summary and the report's path.
