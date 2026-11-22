# The owed read of the SECOND round of fixes — multi-squadron batch 1's full check (18 Nov 26) — one brief, blind readers

You are one of the readers of the finished fixes, each blind to the others and to the walk of the running app. Read-only
on the app: change no file under `raptor-port/src`. A reader that can run commands may write proof tests ONLY in its own
scratch folder named in its instructions (never a test file under the app's source), and may run a single unit file
with `npx vitest run <file>` from `raptor-port/` (its packages are linked in). A reader that cannot run anything names
the exact input it would run, and the host runs it. Return the whole report as your final message. If a handoff block
is pasted into your context after a compaction, do not read it, and say so.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at its head `4934adaa4` (app code = the second
round of the full check's fixes, on top of `34a07036a`, whose app code is the first round, `a7d0e9e22`). App in
`raptor-port/`. At this folder's root: `FIX2-DIFF-src.patch` (these fixes only: `git diff 34a07036a 4934adaa4 --
raptor-port/src`) and `FIX2-DIFF-stat.txt`; `BRANCH-DIFF-src.patch` and `BRANCH-DIFF-stat.txt` (the whole branch's
source against `main`, for context). Do not open `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` below its
"## The full check (job 5)" heading (it is cut there in this copy), nor any file named `*-coderead-*`, `*-security*`,
`*-fixread*` (other than this brief) or `*-walk-*` under `raptor-port/docs/superpowers/briefs/`: they hold the walk's
results and other readers' reports, and you are to read blind.

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
**And, new for this read: a man's INPUTS (his leave, a course, their remarks) not checked by squadron at the commit
gate** — a 142 admin's forged inputs write onto a 149 man is known, open and filed; do not report it again.

## The rulings and records — open them yourself (nothing loads for you)

Area rulings files: `.claude/rules/decisions/people-accounts.md`, `scheduler.md`, `oil.md`, `leave-war.md`,
`how-we-work.md`, and `.claude/rules/seams/leave-war.md`; full rows in `.claude/decisions-full/*.md`, opened by number
(`grep -h '^| D2132 |' .claude/decisions-full/*.md`). The permission table `raptor-port/docs/data-model.md` §11 and its
one module `raptor-port/src/state/perms.ts` (changed together, D200). The rulings that bear most: D1695, D2087 (one home
squadron), D2093, D1971 (master admin = admin in every squadron), D2094 narrowed by D2160 Q5 (another squadron: View
only), D2119 (a home changes from tomorrow), D2132 (Inputs, Quals, the Leave War and the Tracker stay on his own
squadron; the schedule pages and Logic follow the squadron in view), D2184 Q10 (the last-admin lock per squadron), D148
(Undo own changes only; cleared at sign-out), D306 and D325 (a posting's outcome; a deleted man keeps his months on the
war), D166, D288, D22, D56, D785. The batch's promise: the plan
`raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1–§3.6; the builders' reports in
`raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md`; `raptor-port/docs/undo-contract.md`. The tests these fixes added:
`src/state/units-sqn-fixread.test.ts`, `src/leavewar/postout-outcomes.test.ts`, `src/leavewar/postout-roster.test.ts`.

## What these fixes promise

Each was found in the read of the first round of fixes, proved by a failing test and fixed. The fix is what you are
reading (`FIX2-DIFF-src.patch`).

1. **A master can't be deleted, by any door.** Every door that deletes a person refuses a master first ("Saber is a
   master admin, so he can't be deleted" — Admin → Users' Delete and the posting sheet's Delete chip), so his Delete
   posting waits and is never run.
2. **The posting pass never loops and one bad posting never holds the others back.** A refused posting is tried once
   more (the refused command's rollback has put any stray change back), then held for the session — the next boot tries
   again; a pass with several postings due runs them one at a time (`leavewar/sync.ts`).
3. **The first write of the account list no longer writes "nothing" over an account never stored** — a dropped account
   is simply left out (`accounts.ts writeAccounts`).
4. **The posting-pass check at the gate expects only an Overseas Sqn posting's account to be suspended**
   (`perms.ts postingPassViolation`) — a man posting out any other way keeps his account as it was.
5. **The commit gate compares the whole account list, before against after**, each as the loader reads it (none stored =
   the seeded list), so an account left out of a written list is judged as deleted.
6. **The last-admin lock is held at the commit gate, per squadron**, for every actor, the master included: a squadron
   with an admin at home who can sign in keeps one, and the app keeps one at all.
7. **A man's squadron start and end are judged day by day** — today and every date a home row starts on, his squadron
   compared on each: no change to today or any earlier day; a later change needs an admin of the squadron he leaves on
   that day (or the master). A man with no squadron may be given one from today.
8. **History lines are filed under the right squadron:** the mission-role line reads its subject as a man only where the
   roster has him (a formation's line stays with the squadron in view — `engine/editlog.ts`); an Undo or Redo line of a
   change to men of one squadron is filed with that squadron, as the change was (`state/changelines.ts`).
9. **The changes window's "seen" marker is per squadron** (`changes.ts`): marking 142's lines seen leaves 149's new; a
   row in the old shape reads as every squadron's until that squadron is marked.
10. **The refusal words name the squadron**, said first by every door — Archive, Restore, Restore as, the name, Suspend,
    Delete — and a refusal's own words are never replaced by "That did not save". Every new or changed sentence a person
    can read, word for word (in the existing amber passing note, or on the posting sheet where its other refusals stand):
    - "Saber is a master admin, so he can't be deleted" (any master's callsign)
    - "Kestrel is 149's last admin. The posting waits until 149 has another admin." (the posting sheet and his row)
    - "Kestrel is 149's last admin. He is not deleted until 149 has another admin." (a Delete posting)
    - "Kestrel is 149's last admin. Make another admin of 149 first." (Archive, as the role change already said)
    - "He is 149's. Only an admin of 149 can change him." (Archive, Restore, Restore as, the name — beside the built
      "He is 149's. Only an admin of 149 can change his account." of Suspend and Delete)
    - A refusal with no words of its own now reads "That did not save" — the app's own fallback — never the gate's.
    The app-wide "the last admin who can sign in" sentences stay where the whole app, not one squadron, would be left
    without an admin.

## The ask

For each of the ten:

1. **Is the fix complete?** Every door the same harm can come through — assume the missing call site: every command
   kind that deletes, archives, suspends or re-roles a person or an account; every screen that offers it (Admin → Users,
   Quals, the request approval, the posting sheet and the posting pass, the Leave War and the Tracker where they touch a
   person); the developer bridge's raised role; the actor being the master, a plain admin of 142, an admin of 149, a
   member.
2. **What did the fix break?** A 142 admin's normal work on his own people (add, rename, re-category, admin on/off,
   suspend, archive, delete, restore, quals, home); the master's work across both squadrons; Undo and Redo of each of
   these changes (D148 — does an Undo or Redo pass the gate, or get refused where the original change was allowed?);
   the posting pass and its other outcomes (in and out; Overseas Sqn, Delete, the others; several due on one day; a held
   posting on the next boot); request approval, for a new man and for a man already on the roster; sign-out and the next
   sign-in; boot (a store that never wrote its accounts, a store that did).
3. **Most closely:** the retry-then-hold (can a held posting be lost, run twice, or run against the wrong world; does
   "held for the session" end where it should); the whole-list comparison (an account list written in a different order,
   with a renamed account, with an account the loader adds); the day-by-day home judgement (rows in the past, today,
   tomorrow, far ahead, two on one date); and the words — does each show in the right case, name the right squadron and
   person, and never show where the change is allowed?

**A finding needs a concrete failure, its cause and its fix (D489), with the input that proves it:** setup through the
app's controls (or the exact command, if only a forged command reaches it), the action, what is shown or stored wrong;
its cause (file and line); its exact fix step by step; whether these fixes introduced it or it was already there; and
the test that would fail today. Give explicit negatives: "I checked X and found nothing". Rank by consequence.
