# The owed read of the FIXES — multi-squadron batch 1's full check (18 Nov 26) — one brief, two blind readers

You are one of two readers of the finished fixes, each blind to the other and to the walk of the running app. Read-only
on the app: change no file under `raptor-port/src`. A reader that can run commands may write proof tests ONLY in its own
scratch folder named in its instructions (never a test file under the app's source), and may run a single unit file
with `npx vitest run <file>` from `raptor-port/` (its packages are linked in). A reader that cannot run anything names
the exact input it would run, and the host runs it. Return the whole report as your final message. If a handoff block
is pasted into your context after a compaction, do not read it, and say so.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at its head `43273f997` (app code = the full
check's fixes, `a7d0e9e22`, on top of step 4's `7e0a7c661`). App in `raptor-port/`. At this folder's root:
`FIX-DIFF-src.patch` (the fixes only: `git diff 7e0a7c661 a7d0e9e22 -- raptor-port/src`) and `FIX-DIFF-stat.txt`;
`BRANCH-DIFF-src.patch` and `BRANCH-DIFF-stat.txt` (the whole branch's source against `main`, for context). Do not
open `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` below its "## The full check (job 5)" heading, nor any file
named `*-coderead-*`, `*-security*`, `*-fixread-*` or `*-walk-*` under `raptor-port/docs/superpowers/briefs/`: they hold
the walk's results and other readers' reports, and you are to read blind.

## The finder wording

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing unqualified saved row is no longer read" (by design, D22;
> the store-stamp bump is step 6). If the app would do it again to NEW data, report it.

**Also not a finding:** a scheduler who is not an admin (a scheduler is always an admin, D785); anything steps 5–6 will
build — Admin → Squadrons, Admin → Users' home squadron and its filtering (it still lists both squadrons; `linkablePeople`
and `UsersPanel` walk everyone, allowed until step 5), the "142 ▾" button and Schedules menu (nobody switches the
schedule in view from the screen yet), Request access asking the squadron, the board's number, print and export names,
the store-stamp bump; borrowing (batch 3); the GitHub code check red because `main`'s `overlay.ts` holds raw NUL bytes.

## The rulings and records — open them yourself (nothing loads for you)

Area rulings files: `.claude/rules/decisions/people-accounts.md`, `scheduler.md`, `oil.md`, `leave-war.md`,
`tracker.md`, `how-we-work.md`; full rows in `.claude/decisions-full/*.md`, opened by number
(`grep -h '^| D2132 |' .claude/decisions-full/*.md`). The permission table `raptor-port/docs/data-model.md` §11 and its
one module `raptor-port/src/state/perms.ts` (changed together, D200). The rulings that bear most: D1695, D2087 (one home
squadron), D2093, D1971 (master admin = admin in every squadron), D2094 narrowed by D2160 Q5 (another squadron: View
only), D2119 (a home changes from tomorrow), D2132 (Inputs, Quals, the Leave War and the Tracker stay on his own
squadron; the schedule pages and Logic follow the squadron in view), D2184 Q10 (the last-admin lock per squadron), D148
(Undo own changes only; cleared at sign-out), D166, D288, D22, D56, D785. The batch's promise: the plan
`raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1–§3.6; the builders' reports in
`raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` above "## The full check (job 5)"; `raptor-port/docs/undo-contract.md`.

## What the fixes promise — eleven faults and one wording change

Each was found in the earlier reads, proved by a failing test and fixed. The fix is what you are reading.

1. A plain admin of one squadron could change the other squadron's accounts (make a man admin, switch him off, add an
   account for him). **Promise:** the commit gate's new section 8 (`perms.ts homeUnitViolation`) — a man, his account
   and his home are changed only by an admin of his own squadron, or the master; `accounts.ts otherSquadronProblem`
   refuses on screen with its reason.
2. `home.set`: an admin could pull the other squadron's man into his own squadron, from today. **Promise:** the check
   reads the squadron he leaves as well as the one the new row names; a change of home takes effect from tomorrow
   (D2119); the master's first home row for a seeded man also from tomorrow.
3. A 142 admin could rename, re-category or delete a 149 man, and `mayEditQualsOf` said yes. **Promise:** section 8
   covers these; `mayEditQualsOf` asks the man's own squadron.
4. A plain admin could delete the master. **Promise:** the master mark is judged on the whole account list before and
   after the command (`accountImagesAround`), so a missing account image no longer reads as the seeded one.
5. The last-admin lock counted every squadron's admins together. **Promise:** counted per squadron (D2184 Q10).
6. Approving an access request linked to a man already on the roster wrote him a home in the approver's squadron.
   **Promise:** only a NEW man gets a home (`approveRequestNew`).
7. 149's next Monday could be served 142's copy. **Promise:** the seed cache is keyed on the squadron as well as the
   week (`weekctx.ts`).
8. 149's change-history lines (remarks, leave lines) showed in 142's changes window and new-counts, and 142 could clear
   them. **Promise:** each line carries its squadron; the list held in memory is the squadron in view's, read again on
   a switch (`editlog.ts`, `store.ts switchUnit`).
9. Sign-out with a save still waiting left the next person on the first person's Tracker. **Promise:** the reload is
   owed and runs the moment the save lands, unless someone has signed in since (`logout.ts`, `savewait.ts
   onSavesLanded`). (The case where someone signs in before the save lands is a known open question — not a finding.)
10. **(Second round — never read.)** A forged write of a 142 admin's OWN account onto a 149 man made the 149 man an
    admin. **Promise:** section 8 judges the actor's own account too; it is no longer skipped.
11. **(Second round — never read.)** The master's change to a 149 man, made from 142's view, was filed in 142's
    change history. **Promise:** a history line about one man's own record takes HIS squadron, not the squadron in view.

**The wording change (never read):** the refusal words now on Admin → Users, in the existing amber passing note —
"He is 149's. Only an admin of 149 can change his account." and the lock's "Kestrel is 149's last admin. Make another
admin of 149 first."

## The ask

For each of the eleven fixes and the words:

1. **Is the fix complete?** Every door the same harm can come through — assume the missing call site: every command
   kind that writes an account, a person, a home, a qual, a request, a history line; every screen that offers it (Admin
   → Users, Quals, the request approval, the posting pass, the Leave War and the Tracker where they touch a person);
   the developer bridge's raised role; the actor being the master, a plain admin of 142, an admin of 149, a member.
2. **What did the fix break?** A 142 admin's normal work on his own people (add, rename, re-category, admin on/off,
   suspend, delete, restore, quals, home); the master's work across both squadrons; Undo and Redo of each of these
   changes (D148 — and does an Undo pass the new gate, or get refused where the original change was allowed?); the
   posting pass (in and out); request approval for a new man and for a man already on the roster; sign-out and the
   next sign-in, with and without a save waiting; the change history's counts and its clear after a switch.
3. **The second round (10 and 11) and the words, most closely,** since nobody has read them: for 10, every way the
   actor's own account can be written onto, or used to reach, another squadron's man; for 11, every kind of history
   line — is "about one man's own record" decided correctly for each (a line about a schedule row naming him, a
   leave line, a remark, a qual, an account change), and does a line that is NOT about one man still take the
   squadron in view? For the words: does each show in the right case, name the right squadron and person, and never
   show where the change is allowed?

**A finding needs a concrete failure, its cause and its fix (D489), with the input that proves it:** setup through the
app's controls (or the exact command, if only a forged command reaches it), the action, what is shown or stored wrong;
its cause (file and line); its exact fix step by step; whether the fix introduced it or it was already there; and the
test that would fail today. Give explicit negatives: "I checked X and found nothing". Rank by consequence.
