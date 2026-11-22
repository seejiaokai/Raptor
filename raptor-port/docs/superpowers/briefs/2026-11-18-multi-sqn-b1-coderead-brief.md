# The final code read of multi-squadron batch 1, steps 0–4 (18 Nov 26) — one brief, two blind readers

You are one of two readers of the finished code, each blind to the other and to the walk of the running app. Read-only
on the app: change no file under `raptor-port/src`. A reader that can run commands may write proof tests ONLY in its own
scratch folder named in its instructions (never a test file under the app's source), and may run a single unit file
with `npx vitest run <file>` from `raptor-port/` (its packages are linked in). A reader that cannot run anything names
the exact input it would run, and the host runs it. Return the whole report as your final message. If a handoff block
is pasted into your context after a compaction, do not read it, and say so.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at `7e0a7c661` (app code = step 4,
`a646aa024`). App in `raptor-port/`. The branch's source diff against `main`: `BRANCH-DIFF-src.patch` at this folder's
root; files `BRANCH-DIFF-stat.txt`; commits `BRANCH-LOG.txt`. Ignore `SCENARIO-BRIEF.md` (another job's brief).

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

## What was built (the promise)

Read first: the plan `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1–§3.6 (its "refined
as built" notes are what was built); the builders' reports `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md`
(everything above "## The full check (job 5)" — the rest of that file is empty headings). Rulings: area files
`.claude/rules/decisions/people-accounts.md`, `scheduler.md`, `inputs.md`, `leave-war.md`, `oil.md`, `tracker.md`,
`how-we-work.md`; seams `.claude/rules/seams/leave-war.md`, `.claude/rules/seams/tracker.md`; full rows in
`.claude/decisions-full/*.md` (`grep -h '^| D2132 |' .claude/decisions-full/*.md`). The rulings: D1695, D2087 (one home
squadron; inputs and leave only there), D2093, D1971 (master admin = admin in every squadron), D2094 narrowed by D2160
Q5 (another squadron: View only), D2132 (Inputs, Quals, the Leave War and the Tracker stay on his own squadron; the
schedule pages and Logic follow the squadron in view), D2109, D2122, D2160 Q1 (each its own Logic; OIL by the man's own
squadron's settings), D2167 (a Tracker each), D2160 F1 + D2184 R32 narrowing D781 (holidays per place, own Off day;
the out-of-date warning; each squadron's schedulers answer OIL for their own), D148 (Undo own changes only; cleared
at sign-out), D166, D288, D22, D56, D785. Records: `raptor-port/docs/data-schema.md` (key inventory, unit-qualified
ids), `raptor-port/docs/data-model.md` §11 (permissions) with `src/state/perms.ts`, `raptor-port/docs/undo-contract.md`,
`raptor-port/docs/feature-impact.md` ("Which unit is this record?", "Which unit is this input, this person?"),
`raptor-port/docs/notifications-register.md` B10, B12.

High-consequence parts: OIL (the Leave War's OIL pass `leavewar/sync.ts runOilPass`, its reverse sweep,
`desiredOilCells`, `HOOKS.oilEarningDay`, `nonWorkingFor`, `placeHolidaysFor`); the published record (unit-qualified
version ids, `engine/publish.ts`, `state/sched-commit.ts`, `engine/verid.ts`, R32 `holidayOutOfDate`); saved data
(`storage/unitid.ts`, `storage/keyowner.ts`, `storage/adapters.ts unitDoor`, `state/persist.ts`, `engine/weekstash.ts`,
`state/store.ts switchUnit`, `tracker/storage.js`, `leavewar/state/store.ts`, `leavewar/sync.ts swapWarWorld`);
permissions (`state/perms.ts` — `unitRecordViolation`, `unitRowViolation`, `MASTER_ONLY_COMMANDS`; `state/units.ts`,
`state/units-model.ts levelFrom`, `state/accounts.ts` master / `levelIn`); Undo (`undo/timeline.ts inUnitView`,
`undo/derive.ts`, `undo/describe.ts`, `state/undo-wire.ts`); sign-out (`ui/logout.ts`, `storage/savewait.ts`); the
roster and inputs per unit (`engine/roster.ts`, `engine/inputs.ts inputsFor`, the two guard tests and their allow
lists `engine/roster-readers.test.ts`, `engine/inputsfor-readers.test.ts`).

## What to hunt for — absences first

1. **A reader still on the wrong unit:** anything that should ask a named unit but reads the schedule in view (or the
   reverse — D2132's split), anything that enumerates people or inputs by another name the guard tests cannot count (a
   copy, an alias, a cached list, `Object.keys` of something derived from the whole list), a cache that outlives a
   unit or world swap, a key written unqualified for a unit's record (`elog:` is known unqualified — is anything worse
   than the change history following from it?).
2. **A write that crosses squadrons:** an edit, an input, a publish, an amendment, an Undo / Redo, a settings change,
   an OIL credit or its reverse, a holiday, a posting, a person delete or restore, a Tracker or Leave War write — in
   one squadron moving anything stored or shown in the other; and the reverse, a write that should reach both (a
   holiday at a shared place) reaching only one.
3. **Identity:** every reader of a record id that parses the date or week out of it — does each split the unit off
   first? Every place a bare id and a qualified id are compared.
4. **Lifetime and order:** sign-out then the other squadron's sign-in on the same tab (step 2 says sign-out reloads;
   step 4's builder says "a second person of the other squadron … keeps the first's Tracker" — settle which is true in
   the code, every path that ends a session or starts a new one, not only the top bar's Sign out); a reload; a save
   waiting at sign-out; Undo across a unit change; the boot seeding each squadron's world exactly once.
5. **Permissions:** the commit gate for each actor (master, plain admin of 142, admin of 149, member, the developer
   bridge's raised role), the grant and master commands, the last-admin lock.

For each finding: the concrete failure (setup through the app's controls, action, what is shown or stored wrong), its
cause (file and line), its exact fix step by step, whether it is NEW on this branch or already on `main`, and the test
that would fail today. Give explicit negatives: "I checked X and found nothing". Rank by consequence.
