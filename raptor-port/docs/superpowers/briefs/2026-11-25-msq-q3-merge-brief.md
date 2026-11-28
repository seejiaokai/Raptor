# Bring `main` into `claude/msq-b1-screens-135` (chat 176, 25 Nov 26)

You are a fresh Fable helper (the latest Fable, high: the merge settles clashes in the permissions and bell code). Work
ONLY in `C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`), by full path or `git -C` — your shell
may start in another folder, which you must not touch. The branch is 198 commits behind `origin/main`. Bring `main` in,
settle every clash keeping BOTH sides' behaviour, prove it, and commit. Do not push (the host pushes after reading your
hand-back); do not open, merge or touch any pull request; do not edit `.claude/hooks`, `.claude/settings*`, or a skill.

## Read first
- `raptor-port/docs/shipping-steps.md` §"Push" and "merge live" step 2 — the order: `git merge --no-commit --no-ff
  origin/main`, then the settle step `node raptor-port/scripts/records-merge.mjs`, then the rulings merge it names,
  then the rest by hand (D1930). Then `raptor-port/docs/gates-and-deploy.md` for the traps.
- `HANDOFF.md` — this branch's block (chat 176, then chat 175's night: last night's two merges of `main`, how they were
  settled — the notifications register's row B10 by hand, both sides kept).
- `.claude/rules/record-decisions.md` and `DECISIONS.md`'s head: this branch holds rulings D2590–D2599 and D2620–D2636;
  if `main` holds any of those numbers for a different ruling, this branch's are renumbered past every number on `main`
  and on every open branch (`git grep` on `refs/remotes`), every citation of them changed with them, and the change told
  in your hand-back old → new. Check before assuming.

## The clashes (from `git merge-tree`)
Records: `.claude/decisions-full/how-we-work.md`, `people-accounts.md`; `.claude/rules/decisions/how-we-work.md`,
`leave-war.md`, `people-accounts.md`; `.claude/skill-observations/log.md` (keep both sides' entries; this branch's new ones
re-numbered past `main`'s, per the log's own rule); `DECISIONS.md`, `HANDOFF.md` (keep every block: `main`'s blocks and
this branch's own), `OUTSTANDING.md`; docs `data-model.md`, `data-schema.md`, `design-practices.md`,
`notifications-register.md`, `walk-ledger.md`; `raptor-port/scripts/docsize.mjs`; `raptor-port/playwright.config.ts`.
**App code:** `raptor-port/src/leavewar/sync.ts`, `src/state/notices.ts`, `src/state/perms.ts`, `src/ui/inputedit.tsx`,
`src/ui/topbits.tsx`, `src/ui/topstate.ts`. For each code clash: read both sides' commits (`git log -p` on the file, each
side since the merge base) and keep both behaviours; where they truly conflict (two rulings meeting), STOP that file and
say so in the hand-back rather than choosing.
A size limit a rulings page crosses after the merge: raise it on his standing word D2148 only for this branch's own new
rulings, and name each raise; never drop a rule to fit.

## Prove it
Take the checks lock before any build: `node raptor-port/scripts/gatelock.mjs take "claude/msq-b1-screens-135 — chat 176 merge of main"`
(from the repo root; if another chat holds it, wait and re-try every few minutes — never start alongside); release it
the moment your runs end, pass or fail. Then, in `raptor-port`: `npm run build` (the type check; `tsc --noEmit` is hollow
here), the unit test files of every code file that clashed and of the bell, notices, perms and inputs
(`npx vitest run <files>`), `npm run docsize`, and `npm run rulecheck` if it exists. Write each command's result to a
file and read its exit (a pipe hides a failure). Commit the merge with a message naming what was settled by hand and
how, ending with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, as the host's commits do.

## Hand-back
Write it to `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\6f8c588f-5c4c-4428-8bce-0293bb12cfb9\scratchpad\n176\merge.md`
AND give it as your final message, under 700 words: each clash and how it was settled (one line); any renumbering;
any file you stopped on and why; the commands run and their results (counts); the merge commit's first line; anything
in `main` that changes what Build 1's plan (`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`)
says about today's code — name the function and the plan's section, do not edit the plan.
