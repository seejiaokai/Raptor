# The security read of the second round of fixes — multi-squadron batch 1's full check (18 Nov 26)

You are a security reader (D1411: an extra fresh reader looking ONLY for holes, on any change to sign-in, permissions or
what one person sees of another). You are blind to the other readers of this change and to the walk of the running app.
Read-only on the app: change no file under `raptor-port/src`. You may write proof tests ONLY in your own scratch folder
named in your instructions (never a test file under the app's source) and run a single unit file with
`npx vitest run <file>` from `raptor-port/`. Return the whole report as your final message. If a handoff block is pasted
into your context after a compaction, do not read it, and say so.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at its head `4934adaa4`. App in `raptor-port/`.
At this folder's root: `FIX2-DIFF-src.patch` (this round of fixes only: `git diff 34a07036a 4934adaa4 --
raptor-port/src`), `FIX2-DIFF-stat.txt`, and `BRANCH-DIFF-src.patch` / `BRANCH-DIFF-stat.txt` (the whole branch against
`main`, for context). Do not open `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` below its "## The full check
(job 5)" heading (it is cut there in this copy), nor any file named `*-coderead-*`, `*-security*`, `*-fixread*` or
`*-walk-*` under `raptor-port/docs/superpowers/briefs/`: they hold other readers' reports.

## The threat model — what "a hole" means here

Two squadrons, 142 and 149, share one app and one store (the database later; the browser's store now). Each man has one
home squadron (D2087, D2093). A master admin (D1971) is an admin in every squadron. A plain admin of one squadron sees
another squadron's schedule pages in View only (D2094 narrowed by D2160 Q5) and may change only his own squadron's men,
their accounts and their homes. Inputs, Quals, the Leave War and the Tracker stay on his own squadron (D2132). Every
write runs as a command through one commit gate (`src/state/perms.ts` — the gate is the security boundary, not the
screen; the sign-in itself is not security, D59 — the lock is Vercel's). So assume an attacker who is a signed-in plain
admin or member of one squadron and can forge any command the app's own code could issue (the browser console, the
developer bridge, a crafted stored row), and ask what the gate lets through.

**Look only for holes in:**
1. who can write, delete or see another squadron's people and records — accounts, person rows, homes, quals, history
   lines, the changes window's lines and counts;
2. the master mark and its refusals — can a plain admin delete, demote, suspend, archive or rename a master, or make
   himself or another a master; can a master be removed by a door other than Admin → Users' Delete (the posting pass,
   a request approval, Undo or Redo, a whole-list account write);
3. the last-admin lock, per squadron (D2184 Q10) — can a squadron be left with no admin who can sign in, by any order
   of commands or by the master;
4. the posting pass's hold — a refused posting tried once more, then held for the session, the next boot trying again;
   several due postings run one at a time;
5. the account-list comparison at the gate (the whole list, before against after, none stored = the seeded list) — can
   a written list that drops, reorders, duplicates, renames or re-keys an account slip a change past it;
6. home rows — judged day by day (no change to today or earlier; a later change needs an admin of the squadron he
   leaves; a man with no squadron may be given one from today) — can a home row be written that moves another
   squadron's man, today or on any day, or that makes a man nobody's, or two squadrons';
7. **whether the retry-then-hold can be used to keep a refused write alive** — a posting (or other change) the gate
   refused that is later run, by the retry, the next boot, another actor's session (the master's, an admin of the other
   squadron) or a different world, so that the refused change lands under someone else's rights.

**Not a finding:** the problem lives only in data already stored while the code is correct going forward (the whole
store is demo data, cleared before the database step — D22, D56); a scheduler who is not an admin (D785); anything
steps 5–6 will build (Admin → Squadrons; Admin → Users' home squadron and its filtering — it still lists both squadrons;
the "142 ▾" schedules switch; Request access asking the squadron; the store-stamp bump); borrowing (batch 3); the
sign-in being bypassable in the browser (D59); and **a man's INPUTS not checked by squadron at the commit gate** — known,
open, filed.

## Open them yourself (nothing loads for you)

`.claude/rules/decisions/people-accounts.md`, `scheduler.md`, `oil.md`, `leave-war.md`, `how-we-work.md`,
`.claude/rules/seams/leave-war.md`; full rows `.claude/decisions-full/*.md` (`grep -h '^| D2184 |'
.claude/decisions-full/*.md`); `raptor-port/docs/data-model.md` §11 (the permission table) and `src/state/perms.ts`;
`src/state/accounts.ts`, `src/leavewar/sync.ts`, `src/state/changes.ts`, `src/state/changelines.ts`,
`src/engine/editlog.ts`; the tests these fixes added, `src/state/units-sqn-fixread.test.ts`,
`src/leavewar/postout-outcomes.test.ts`, `src/leavewar/postout-roster.test.ts`.

## What a finding needs

A concrete failure, its cause and its fix (D489), with the input that proves it: the actor and the setup, the exact
command (or the controls), what lands that should have been refused (or what is refused that must be allowed, if it
locks a squadron out); the cause (file and line); the fix, step by step; whether this round of fixes introduced it or it
was already there; and the proof test that fails today — written and run in your scratch folder where you can. Give
explicit negatives ("I tried X and the gate refused it"). Rank by consequence.
