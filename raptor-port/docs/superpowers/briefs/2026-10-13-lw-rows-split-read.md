# The read of `[LW-ROWS-SPLIT]` — the readers' brief (13 Oct 26)

You are a fresh reader. You did not make this change, and you read it BLIND: do not open anything under
`raptor-port/docs/handpass/` but your own report, nor another reader's report. Read-only: change no file but your
report; do not commit, push, build, start a server, or run any test (a full gate run is in progress on this PC).

## The promise

Owner D493 and D775 (`grep -h '^| D493 |\|^| D775 |' .claude/decisions-full/*.md`, from the repository root): the Leave
War's row drawing moves out of its grid file — **nothing on screen changes.** From the tidiness read that proposed it
(`raptor-port/docs/superpowers/briefs/2026-10-03-code-tidy-audit-astra.md` §1): `PersonRow`, `PersonMonth`, their props
and their row-only predicates leave `src/leavewar/ui/Matrix.tsx` for a new `MatrixRows.tsx`; `Matrix` keeps the
controller state, geometry, selection and sheets. **What must remain identical:** exact DOM order, classes, data
attributes, memoisation boundaries, frozen columns, placeholder columns, admin / member visibility, OIL and award
display, free-half presentation, figures selection, clicks and drag behaviour. It is tier FULL because WHO MAY DO WHAT
on a row and how OIL (earned leave — never pay) and awards are shown are drawn in these lines.

## What was done

`git diff origin/main...HEAD -- raptor-port/src` (from the repository root). A script cut 507 lines out of
`raptor-port/src/leavewar/ui/Matrix.tsx` (the row-drag configurations, `QualPill`, `RowApi`, `freeHalfBeside`,
`ownAwardPresent`, `ownAwardAlone`, `cellOpenable`, the two props types, `PersonRow`, `PersonMonth`) into the new
`raptor-port/src/leavewar/ui/MatrixRows.tsx`, added `export` to the thirteen names the grid file still uses, gave the new
file the imports it uses, pruned from `Matrix.tsx` the imports it no longer uses, and added one import of the thirteen.
A test written BEFORE the move (`raptor-port/src/leavewar/ui/matrix-rows.test.tsx`) records every row's markup in six
worlds and still passes with the record unchanged.

## What to hunt — this is a MOVE; the defect, if there is one, is what a move can break

1. **A line changed in the move.** Prove for yourself (a script of your own, in your temp folder, reading
   `git show origin/main:raptor-port/src/leavewar/ui/Matrix.tsx` — in Git Bash set `MSYS_NO_PATHCONV=1`) that every moved
   line is identical but for a leading `export`, that nothing else left `Matrix.tsx`, and that nothing else changed in it.
2. **An import that changed what a name means.** For EVERY name the moved block uses that it does not declare: is it
   imported in the new file from the SAME module, under the same name, as it was in `Matrix.tsx` on `origin/main`? A
   name that was a module-level declaration of `Matrix.tsx` OUTSIDE the block and is now missing or shadowed? A type
   imported as a value or the reverse? Did pruning `Matrix.tsx`'s imports remove one it still uses in a way the type
   check would not see (a side-effect import — a stylesheet, a module that registers something on load)? The new file
   does not import `./matrix.css`: is that right (who imports it, and in what order relative to other stylesheets)?
3. **The memo boundary and identity.** `PersonRow` and `PersonMonth` must be the same `memo` components with the same
   props and the same comparison; module-level constants the rows compare by identity (`NO_QUALS`, the four `*_DRAG`
   configurations, `setPhWidth`) must still be ONE instance shared by both files — is any of them now created twice,
   or re-created per render? Anything in `Matrix.tsx` that relied on being in the SAME module as the rows (a mutable
   module-level `let` the block reads or writes — ES modules cannot reassign another module's binding; a function
   hoisted from below)? A circular import between the two files?
4. **Everything else that names the moved things.** Tests, other components, documents (`raptor-port/docs/performance.md`
   §E, `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/file-map.md`, the Leave War's rules
   `.claude/rules/decisions/leave-war.md`) that say `Matrix.tsx` holds `PersonRow` / `PersonMonth` / `cellOpenable` — list
   each line made untrue by the move, with its correction.
5. **The pinning test itself.** Could it pass with a row drawn differently — what does it NOT record (rows folded or
   outside the window it renders, the header and the counters, a sheet, hover or drag states, the phone's layout)?
   Name what stands for each of those instead (the existing suites the tidiness read lists), or say nothing does.

A claim is a finding only with the exact line, what breaks (setup, action, what happens, what should), and the exact
correction. For each of the five where you find nothing, say so and say what you checked.

## Your report

The file you are given. Reply to the host with at most five lines.
