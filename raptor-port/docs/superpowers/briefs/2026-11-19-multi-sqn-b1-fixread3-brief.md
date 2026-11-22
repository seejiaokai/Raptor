# The read of the night's FIXES — multi-squadron batch 1, job 2's fixes and the Leave War month-jump fix (19 Nov 26) — one brief, two blind readers

You are one of two readers of these fixes, each blind to the other and to the walk of the running app. Read-only on the
app: change no file under `raptor-port/src`. A reader that can run commands may write proof tests ONLY in its own scratch
folder named in its instructions (never under the app's source here), and may run one unit file with
`npx vitest run <file>` from `raptor-port/` (packages are linked in). A reader that cannot run anything names the exact
input it would run, and the host runs it. Return the whole report as your final message. If a handoff block is pasted
into your context after a compaction, do not read it, and say so.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at `b322cad23`. App in `raptor-port/`. At this
folder's root: `FIXES-DIFF-src.patch` (`git diff 2b792ebc5 b322cad23 -- raptor-port/src`), `FIXES-DIFF-stat.txt`,
`FIXES-LOG.txt` (its 14 commits, each message saying which claim it answers). Do not open any file under
`raptor-port/docs/superpowers/briefs/` named `*fixread3*`: it would be the other reader's work.

## What is under read
1. **Job 2's fixes** (13 commits, `9d5888b0f` … `bbbedee3c`): the faults found by the job-2 reads of the multi-squadron
   security fixes — the second store's war rows (`lwx.*`) written only from Admin → Users' doors; the last-admin lock on
   every saved home date and an archived man no admin; bell lines crossing squadrons only where they concern both; the
   war telling only its own squadron's people of bidding; inputs judged by their people's squadrons on every day,
   a member's own input his across a move; a member's take-out of an input naming another squadron's man; the master's
   Delete / Archive telling the other squadron's history; history lines filed only where their giver may, Undo's line
   to the giver's own squadron; read records of another squadron's admin; "Undo post out" for a moved admin. The claims
   they answer: `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §"Chat 109 — the full check of job 1 (job 2)"
   (read only that section) and the commit messages.
2. **The Leave War month-jump fix** (`b322cad23`, `raptor-port/src/leavewar/ui/Matrix.tsx`): a month button's landing
   now rounds the grid's sideways scroll DOWN so the month's first day sits 0–1 px clear of the frozen columns, and the
   anchor correction after a redraw puts an edge-landed day back the same way (`landOnEdge`, `anchorNow`'s `edge`). Ask:
   can it fight a finger flick on a phone, loop, move the grid when the person did not jump (a manual scroll that
   happens to rest within a pixel of the edge), or misland a jump on a phone where the scroll may be fractional, or in
   the row window's corrections?

## The finder wording
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** Rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness.

> The app's entire stored world is DEMO DATA, cleared before the database step. **Do not report a problem whose harm
> exists only in data already stored when the code is already correct going forward.** If the app would do it again to
> NEW data, report it.

**Also not a finding:** a scheduler who is not an admin (D785); Plan replacing the 'admin' grant level (D2199); each
squadron's own holiday list (D2195); the shared-place time-zone gate (D2196); the master's squadron menu (D2197); the
refusal words for an unforeseen held posting and for the future-date last-admin lock (drawn, waiting for his answer);
D2203's drop of rights held at the door rather than at the gate (filed); SEC-1's same-squadron form (filed); the war's
current-war marker per squadron (filed); Admin → Users listing both squadrons (a later step); a forged write of a person
or account from the developer bridge outside every command (filed for the database step).

## Rulings — open these yourself (nothing loads for you)
`.claude/rules/decisions/people-accounts.md`, `inputs.md`, `leave-war.md`, `oil.md`, `scheduler.md`, `how-we-work.md`;
`.claude/rules/seams/leave-war.md`; full rows by number (`grep -h '^| D2205 |' .claude/decisions-full/*.md`). Most: D2094
with D2160 (another squadron View only), D1971 (the master an admin everywhere), D2205, D2203, D2194 and D2206 (no bell
across squadrons unless it concerns both), D2087, D2132, D2184 (the last-admin lock per squadron), D2119, D755, D148
(Undo), D56, D785. The permission module `raptor-port/src/state/perms.ts` with `raptor-port/docs/data-model.md` §11.

## The ask
1. Is each fix complete — every door the same harm can come through (assume the missing call site)?
2. What did it break — a 142 admin's, a 149 admin's and the master's normal work; a member's own inputs and bids; Undo
   and Redo of each (D148: refused where the change was allowed, or allowed where refused); the posting pass; sign-out
   and the next sign-in as the other squadron; a reload; the Leave War grid's scrolling on a desktop and a phone.

**A finding needs a concrete failure, its cause and its fix (D489), with the input that proves it:** the setup through
the app's controls (or the exact command, if only a forged command reaches it), the action, what is shown or stored
wrong; its cause (file and line); its exact fix step by step; whether these commits introduced it; the test that would
fail today. Give explicit negatives ("I checked X and found nothing"). Rank by consequence.
