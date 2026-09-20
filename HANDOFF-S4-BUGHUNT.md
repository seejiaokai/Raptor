# [S4-BUGHUNT] handoff — for the next session (20 Sep 26)

Branch **`claude/s4-bughunt`**, 22 commits off `main` (`e904d44`). **Nothing merged. Working tree
clean.** The owner has not said "merge live".

## Read exactly one file first

**`raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`.**

It is the single destination: what is built, what to build next and in what order, what is parked and
why, what is closed, and — the section that matters most — **the eight rules that were set aside
today and must not be re-applied**. Every other document from 20 Sep points at it and several record
the journey rather than the destination.

Do not start from the older rules of record. B4, B5 and §26.3 in
`2026-09-20-arch-stack-4-clash-check.md` are partly dead, and CURRENT-STATE §5 says exactly how.

## What this session was, in one paragraph

A scenario bug hunt of the one-absence model that turned into a rules problem. The first defect had
survived two full cross-provider code inspections and 5103 green tests, because the code was not
wrong — a later ruling of the owner's had quietly taken away the job an earlier rule was still doing,
and **no test named either rule**. That produced three lasting things: a per-feature **behaviour
register** in plain words, **`npm run rulecheck`** (a gate that fails when a ruling has no test naming
it), and a **rules-first red team** as a standing third review beside the design red team and the
code inspection. The owner then made it a standing order in CLAUDE.md: on every build, list the
applicable rulings first, hand-test against that list in the running app, and flag any new ruling
that clashes with an old one.

## What to do next

1. **Build the five items in CURRENT-STATE §2, in that order.** A (the member sees the clash words),
   B (a person's row spans their records), C (days outside the posting window are tappable),
   D (the free half beside Inputs-filed leave), E (the hours box on a hand-typed credit).
2. **Then the hand-testing pass, which is owed and has not happened.** Everything on this branch is
   proved by tests and by reading — not by watching it on screen. Drive the built bundle at phone
   and desktop widths and walk CURRENT-STATE §1 and §2 ruling by ruling, reporting pass/fail per
   ruling. That is what the standing order asks for and it is the one gate not yet run.
3. **Then re-run everything**: `npm test`, `npm run build`, `node reference/tfin.js` (728/0),
   `npm run test:e2e`, `npm run perf`, `npm run smoke:tracker`, `npm run rulecheck`.
4. **Then the scenario hunt's original ground**, which is still largely untouched —
   `plans/2026-09-20-s4-bughunt-plan.md`. The Inputs-page calendar (the one door with no test at
   all), the medical dialog's cascade, bulk gestures driven by a real drag, switching wars with a
   sheet open, storage faults, phone touch, figures on multi-record days.

## Gate status at handoff

| Gate | Result |
|---|---|
| `npm test` | **321 files / 5126 green** |
| `node reference/tfin.js` | **728 / 0** |
| `npm run rulecheck` | **OK** — 21 of 26 rulings named by a test; 5 in the recorded baseline |
| `npm run build` | clean (typecheck run continuously through the session) |
| `npm run test:e2e` · `perf` · `smoke:tracker` | **NOT RUN this session** |
| Hand-test in the running app | **NOT DONE** |

One known flake: `src/ui/inputscal.test.tsx`'s real-pointer chip-tap test fails under parallel load
and passes on its own, confirmed twice, both with and without this branch's changes. Untouched by
anything here.

## Two cross-provider reviews were in flight at handoff

Fable and Codex were both asked to check the **consolidation** — is CURRENT-STATE true against the
code, does anything contradict, what did the new doctrine silently change the meaning of, and do the
five TO BUILD items make sense in that order. If their results are not in the next session's context,
re-run them from the prompts recorded in this session; the brief shape is in
`docs/superpowers/briefs/rules-first-red-team.md`.

## Standing rules that bit during this session — worth knowing before you start

- **The newest owner ruling wins, and a rule can go stale by being NARROWED, not only reversed.**
  The first defect was a rule quietly doing a second job a later ruling had taken from it.
- **Hand-test against an enumerated list of rulings, not just unit tests.** CLAUDE.md §How to work
  here, added today.
- **Ask what the USER SEES on every branch, including the refusal branches.** A guard that fires
  silently found its way past four separate review passes; it was only caught when the owner asked
  what each person sees on screen.
- **Python edit scripts on Windows:** `store.ts` is CRLF, most of `leavewar/` is LF. Always
  `open(..., newline='')` and convert the pattern, or nothing matches.
