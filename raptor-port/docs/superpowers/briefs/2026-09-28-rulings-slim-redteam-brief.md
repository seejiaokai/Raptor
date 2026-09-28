# Red team brief — the rulings slim-down plan (D390, 28 Sep 26)

You are an independent reviewer. You did not write this plan. **Read-only: change no file.** Your job is to find what
is MISSING or WRONG in the plan before anything is built — not to praise it, not to restate it.

## Read, from the repo root (live files — read them, do not rely on this brief's summary)

1. The plan: `raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md`
2. The ruling that approved it: `.claude/rules/decisions/how-we-work.md`, row `| D390 |` (top of the table), and the rows
   it narrows: D136, D137, D138, D140, D141 (same file). Also D29, D68, D78, D201, D302 there.
3. How rulings are kept today: `DECISIONS.md` (steps 1–3, the map), `.claude/rules/record-decisions.md`,
   `.claude/rules/doc-structure.md`, `raptor-port/docs/doc-budget.md`.
4. The two scripts the plan changes, in full: `raptor-port/scripts/docsize.mjs` (the document gate — the rulings checks
   are `rulingRows`, `homes`, `rulings`, and the ceilings) and `raptor-port/scripts/backlog-archive.mjs` (`--rulings`,
   `--move`); their self-test `raptor-port/scripts/docsize-selftest.mjs`; the Stop hook `.claude/hooks/backlog-guard.sh`.
5. The area files as they are: `.claude/rules/decisions/*.md` (look at their `paths:` headers, "Also read" lines, and the
   non-row sections in scheduler.md, leave-war.md and tracker.md).
6. For the parallel-branch story, the branches named in the plan §3 exist in this repo: `git log`/`git diff` them if your
   tools allow; otherwise reason from the plan.

## What to attack — in this order

1. **Loading.** The plan relies on Claude Code auto-loading only `.claude/rules/**/*.md` (and CLAUDE.md files), so
   `.claude/decisions-full/` is never loaded by itself. Is that right? Is anything else (a hook, a skill, a script, the
   area files' own text) going to pull the full text in anyway, or fail to find it?
2. **Parallel merges.** Three open branches keep adding full rows at the top of area tables; one also edits an old row
   (D67), marks another spent and moves it to the archive (D182), and edits "Also read" lines. Walk each shape through a
   real `git merge` in both orders (this branch first / theirs first). Does `--take-both` + the converter end in the right
   state every time? Can keeping both sides of a conflict ever duplicate or lose text the converter does not repair?
   What about a conflict inside `DECISIONS.md`'s prose, or in `DECISIONS-ARCHIVE.md`'s tail?
3. **The gate's identity logic.** The plan says a ruling's identity is its full row wherever it sits, short lines are an
   index checked against it. Find a sequence of edits that loses a ruling, doubles one, or leaves a short line lying
   about its full row, and that the planned checks would PASS. Check the base / commits-since reads, and the Stop hook
   running at the end of every turn (does the new check make a normal turn fail, or loop?).
4. **Behaviour.** A chat now sees a short line, not the detail. Where would a chat most likely act wrongly on a short line
   alone? Is "open the full row before acting on its detail or asking him" enough, and if not, what cheap structural
   guard would be better (not a louder rule)?
5. **D138 (meaning never changes).** Is using a row's own bold heading as its short line a real "extract, not a
   rewrite"? Is the meaning-check criterion in §2.1 the right one? What should Fable's meaning read be told, exactly?
6. **The new area.** Are the 60 rows the right set (read them)? Any of them general, any general row that belongs to
   people/accounts? Are the planned `paths:` enough to load it whenever those rulings matter (e.g. a chat that plans
   one-door work before opening a file)?
7. **The guide step (§2.6)** and the character tripwire (§2.5): risks, gaps.
8. **The goal of D140/D141:** will this structure keep itself small without another clean-up later, or does something
   in it grow back?
9. Anything else you would fix before building.

## Out of scope

Do not review the app's code or behaviour. A problem that lives only in data already stored is not a finding (D56).
Do not propose a different overall approach — the owner approved this one (D390); improve it.

## Output

Numbered findings, most severe first. For each: **severity** (BLOCKER — build would lose or mislead / IMPORTANT — fix
in the plan before building / MINOR), **the concrete scenario** (exact inputs → wrong outcome), and **an exact fix
spec** a builder can follow step by step (which section of the plan changes, and to what). Then a short list of what
you checked and found sound. Plain text, no preamble.
