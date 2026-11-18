# Job 2 — the readers' shared brief (as given to all four, 19 Nov 26)

---

# The read of job 1's finished code — multi-squadron batch 1, the fixread2 faults (19 Nov 26) — one brief, blind readers

You are one of four readers of job 1's finished code, each blind to the others and to the walk of the running app.
Read-only on the app: change no file under `raptor-port/src`. A reader that can run commands may write proof tests ONLY
in its own scratch folder named in its instructions (never a test file under the app's source), and may run a single
unit file with `npx vitest run <file>` from `raptor-port/` (its packages are linked in). A reader that cannot run
anything names the exact input it would run, and the host runs it. Return the whole report as your final message. If a
handoff block is pasted into your context after a compaction, do not read it, and say so.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at `2b792ebc5`. App in `raptor-port/`. At this
folder's root: `JOB1-DIFF-src.patch` (job 1 only: `git diff b63195c56 2b792ebc5 -- raptor-port/src`), `JOB1-DIFF-stat.txt`,
`JOB1-LOG.txt` (its commits). Do not open any file whose name starts `JOB2-` other than this brief, nor anything under
`raptor-port/docs/superpowers/briefs/` named `*job2*`: they hold other readers' work.

## The finder wording

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat. If the app would do it again to NEW data, report it.

**Also not a finding:** a scheduler who is not an admin (D785); out of scope tonight — Plan replacing the 'admin' grant
level (D2199), each squadron's own holiday list (D2195; one list per place is still built), the shared-place time-zone
gate (D2196), the master's squadron menu (D2197 — nobody switches the squadron in view from the screen yet), the words
for a posting the gate refuses for an unforeseen reason (Opus F2 — waiting for his drawing); Admin → Squadrons and Admin
→ Users' filtering by squadron (step 5 — it still lists both squadrons); the two items job 1 filed for the database step
(Fable's still open 4: the actor's account read from memory at the gate; 6: the inputs baseline taking in a same-squadron
change made outside every command); `accessreq:` naming no squadron (D2111 not built).

## The promise — open these yourself (nothing loads for you)

1. What job 1 claims, claim by claim: `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §"Chat 109 — the fixread2
   faults (job 1)" (read the sheet only to the end of that section).
2. The faults it answers: `raptor-port/docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixread2-astra.md`, `…-fixread2-opus.md`,
   `…-fixread2-security.md`, `…-fixread-opus7-open.md`. The plans it followed: `…-fixplan-fable.md` (§4) and
   `…-fixplan-fable-a3.md`.
3. Rulings: `.claude/rules/decisions/people-accounts.md`, `inputs.md`, `leave-war.md`, `oil.md`, `tracker.md`,
   `scheduler.md`, `how-we-work.md`; `.claude/rules/seams/leave-war.md`, `.claude/rules/seams/tracker.md`; full rows by
   number (`grep -h '^| D2205 |' .claude/decisions-full/*.md`). Those that bear most: D2094 with D2160 Q5 (another squadron
   View only), D2093, D1971 (the master is an admin everywhere), D2205 (only a master changes a master's account), D2203 (a
   move of squadron drops his other rights), D2194 (no bell across squadrons unless it concerns both), D2087, D2132 (inputs,
   leave, the war and the Tracker stay on his own squadron), D2167, D2184 Q10 (the last-admin lock per squadron), D2119 (a
   home changes from tomorrow), D755, D218, D148, D306, D325, D299, D22, D56, D785.
4. The permission table `raptor-port/docs/data-model.md` §11 and its one module `raptor-port/src/state/perms.ts`
   (changed together, D200); `raptor-port/docs/undo-contract.md`; `raptor-port/docs/data-schema.md`.
5. Job 1's tests: `src/state/units-sqn-fixread2.test.ts`, `src/leavewar/multi-sqn-a3-foreign.test.ts`,
   `src/leavewar/multi-sqn-fixread2-war.test.ts`, and `src/test-support/world.ts` (`settleWorld()`).

In short: (G0–G3) one before-vs-after guardrail at the commit gate on accounts AND on people and homes — a row the loader
would drop or re-key, a master's account, the last admin of a squadron today and on every new home date, the master mark;
(7b) a squadron's Leave War changed only by its own admins, the war telling the gate which squadron's world is loaded;
a master's posting by a master; (A3) the master's Archive, Restore, Restore as and Delete of another squadron's man write
THAT squadron's stored war, through a store per unloaded squadron (`leavewar/state/foreign.ts`) enlisted in the same
command; (Astra 4) home before post-in for a new man; (Astra 5) Undo / Redo's history line filed with the change's own
squadron; (H5) the change history pushed and written only by a squadron's own people; (7c) inputs judged by their
people's squadrons, members too; (7e) bell lines and read marks of an admin his own squadron's; (7f) the Tracker changed
only by its own squadron; (D2203) a move drops his rights, its Undo restores them; the refusal sentences' order; and
32 test files given `settleWorld()` after setup.

## The ask

1. **Is each fix complete?** Every door the same harm can come through — assume the missing call site: every command
   kind that writes a person, a home, an account, a grant, a war record, an input, a bell line or read mark, a history
   line, a Tracker record; every screen that offers it; the posting pass; request approval; boot; the developer bridge's
   raised role; the actor being the master, a plain admin of 142, the only admin of 149, a member of either.
2. **What did it break?** A 142 admin's and a 149 admin's normal work on their own people and records; the master's work
   across both; a member's own inputs, leave bids and Tracker; Undo and Redo of each (D148 — is an Undo or Redo refused
   where the change was allowed, or allowed where it was refused?); the posting pass in and out; a held posting on the
   next boot; sign-out and the next sign-in as the other squadron; a reload.
3. **Most closely** (the hard fixes): the guardrail G0–G3 (both sides read the same way; the lock today and on every new
   home date; a home move dated ahead; a master acting); the war-squadron probe (which world the gate thinks is loaded
   after a sign-in swap, a reload, the foreign store's command); the inputs gate (an input with people of both squadrons;
   ALL / ALL AVAIL rows; a member's own taking-out, D755) and `settleWorld()` (does it hide a real change a test should
   have seen — is any of the 32 test files now testing nothing?); the history lines (the line's squadron at push, an
   Undo after midnight, a raw write); A3's foreign store (a world never opened, a refused command's rollback leaving the
   foreign rows, Undo / Redo of the master's act, two foreign squadrons in one command, OIL awards from the cut, the
   stored rows read back correctly when 149's admin next opens his war).

**A finding needs a concrete failure, its cause and its fix (D489), with the input that proves it:** setup through the
app's controls (or the exact command, if only a forged command reaches it), the action, what is shown or stored wrong;
its cause (file and line); its exact fix step by step; whether job 1 introduced it or it was already there; and the test
that would fail today. Give explicit negatives: "I checked X and found nothing". Rank by consequence.
