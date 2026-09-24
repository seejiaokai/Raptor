# Spring clean — Fable's meaning check (D138), 24 Sep 26

Tier 3. Fable 5.1, read-only, on `claude/spring-clean` at `316e2c55` vs `main` `d0a1bb94` — its share: the moves out
of `raptor-port/CLAUDE.md`, every rewrite, and the session-handoff skill (D70); items 3/4 re-read as its own
classification. Saved whole; each finding's disposition is in the fix commit that follows.

**Verified mechanically first:** every C-move (C1–C6, C9a/b, C10, the Coding-conventions bullet) diffs byte-identical
between `main:raptor-port/CLAUDE.md` and its destination; H1–H4, H6, the standing-constraints and gate-intro blocks
likewise, and O1 (`OUTSTANDING.md` 41–235) arrived whole in `OUTSTANDING-ARCHIVE.md`. The only non-identical lines
are the corrections the report lists and the H5 items moved OUT first — each found whole in its new home. **No HIGH
findings.**

## MEDIUM
1. **shipping.md dropped one clause of "Do NOT watch PRs":** *"reading the preview URL off the PR once is not
   watching"* (`main:raptor-port/CLAUDE.md:271-273`) is in no live file. Fix: append it to §Pull requests.
2. **The skill dropped "never add a per-batch history" for the gate counts** (`main:SKILL.md:167-168`). Fix: the
   `## Gate baseline` line says REPLACED, never a per-batch history; `HANDOFF.md` §Gate baseline says replace, never
   stack.
3. **Observation #194 is still OPEN and contradicts the skill and D140** ("make HANDOFF-NEXT.md the skill's primary
   output"). Fix: resolve it as superseded by D140; mark #228 the same way.
4. **`file-map.md`'s `vercel.json` row arrived stale** ("Pages stays the official gated site. See §Deploy …"). Fix:
   a marked correction naming Vercel and `docs/gates-and-deploy.md`.

## LOW
5. `doc-structure.md` lacks the plan's routing row: a one-off handoff for a big job → NOT a new root file —
   `HANDOFF.md ## Now` plus a tier-3 doc linked from the item.
6. Pointers that no longer land: D135's home ("`HANDOFF.md` ## Next" no longer mentions the demo), D89's home
   (CLAUDE.md §Pipeline & repo invariants → now a pointer to shipping.md), `HANDOFF.md`'s `HANDOFF-NEXT.md` Moved
   row (omits "How rulings are kept" → `DECISIONS.md`), `file-map.md` "HANDOFF's Leave War narrative" and "see Known
   issues" (→ `HANDOFF-ARCHIVE.md`).
7. `doc-budget.md` still calls `raptor-port/CLAUDE.md` "always loaded, every session, no choice"; it loads once a
   `raptor-port/` file is opened.
8. The skill's template dropped the reason for the git reset: *"Otherwise it stacks commits onto already-merged
   history."*
9. (Its own classification, re-read.) "ATT B beyond SC MAIN … Ask before widening" — `engine-rules.md:399-400` keeps
   the scope, not the imperative: append "— ask before widening." And `docs/superpowers/DESKTOP-HANDOFF.md` and
   `OVERNIGHT-BUGCHECK-REPORT.md` lost their only live pointers; nothing vanished (Decision A is `[TRK-DISK]`), but
   `git mv` both to the archive with README rows.

## Nothing found
The rest of the shipping rules (every other item of the red team's finding 3 with its date; D143's chain; the
workflow facts match `deploy.yml` / `docs-guard.yml`); `doc-structure.md` against D140/D141/`doc-budget.md`; the
project guide's edits, index, area intros, CLOSED note, widened `paths:` and the split performance group; the gates
Now block, data-schema, engine-rules and pointer edits; every other safeguard of the old skill (D151 check,
never-merge, the "unfinished" definition, the bounded diff and its range rule, the merge-reconcile step, the four
Step-3 bullets, the frozen archive, print-in-chat, the Vercel link, the git-reset line) — no contradiction with a
guide or ruling, no bulk (245 lines vs 252).
