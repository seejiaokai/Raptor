# Scenario design for multi-squadron batch 1, steps 0–4 — Astra's brief (18 Nov 26)

You are Astra, the standing reviewer, asked for ONE job: design the walk's scenarios (the bug-check order's §4, rank 1).
You are not reviewing whether the code is right; you are hunting for what is MISSING from the roll-call and the
scenarios below — the surfaces, orders, roles and states a walk of the running app must drive so that a defect cannot
hide. Read-only: change no file, run nothing that writes. Return the whole report as your final message.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at `7e0a7c661` (app code = step 4, `a646aa024`).
The app is in `raptor-port/`. The branch's source diff against `main` is `BRANCH-DIFF-src.patch` at this folder's root,
its file list `BRANCH-DIFF-stat.txt`, its commits `BRANCH-LOG.txt`. There is no git history here. If a handoff block
is pasted into your context after a compaction, do not read it, and say so in your report.

## The finder wording (use it)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an old unqualified saved row is no longer read" (by design, D22; the
> store-stamp bump is step 6). If the app would do it again to NEW data, report it.

**Also not a finding:** a scheduler who is not an admin (a scheduler is always an admin, D785 — a member `us`/`us`
Ranger, `us9`/`us9` Osprey is in scope as a person who is not a scheduler); anything steps 5–6 will build — Admin →
Squadrons, Admin → Users' home squadron and its filtering (it still lists both squadrons), the "142 ▾" button and the
Schedules menu (so today nobody can switch the schedule in view from the screen; a person sees his home squadron's
schedule), Request access asking the squadron, the board's squadron number, print and export names, the store-stamp
bump; borrowing another squadron's people (batch 3); the GitHub code check red because `main`'s `overlay.ts` holds raw
NUL bytes.

## What was built (the user promise)

Read, in this order: the plan `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1–§3.6
(the "refined as built" notes are what was really built); the builders' reports
`raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` (everything ABOVE "## The full check (job 5)"); then the
diff. The rulings' full rows: `grep -h '^| D2132 |' .claude/decisions-full/*.md` (the rulings named below). Area
rulings files the change touches: `.claude/rules/decisions/people-accounts.md`, `scheduler.md`, `inputs.md`,
`leave-war.md`, `oil.md`, `tracker.md`; the seams `.claude/rules/seams/leave-war.md`, `.claude/rules/seams/tracker.md`.
Records: `raptor-port/docs/data-schema.md`, `raptor-port/docs/data-model.md` §11, `raptor-port/docs/feature-impact.md`,
`raptor-port/docs/notifications-register.md` (B10, B12).

In one paragraph: two squadrons, 142 and 149, in one app. Each person has one home squadron. Every squadron's record
id is `<unit>@<id>`; the schedule in view (the scheduler's week, settings, published versions, plans, mission roles) is
the signed-in person's home squadron's; Undo steps through the person's own changes touching the unit in view; the
commit gate refuses a write to a unit where the actor is not an admin there (a grant or the master mark). Inputs,
Medical, SANS, Quals, the OIL pass, the Leave War and the Tracker follow the person's own squadron. The Leave War and the
Tracker are a whole world per squadron, swapped at sign-in. Public holidays are per place (both demo squadrons at "Home
base"), laid onto every squadron at that place; Off days per unit; the Holidays form names each squadron's published
days a new holiday puts out of date (R32, D2184). Sign-out reloads the page (unless a save waits). 149 is seeded: its
people, two inputs, a week on 142's dates, a war, one Tracker course.

Seeded sign-ins: `ad`/`a` (142 admin, Saber — also the master admin), `us`/`us` (142 member, Ranger), `ad2`/`a2`
(second 142 admin, Prowler), `ad9`/`a9` (149 admin, Kestrel), `us9`/`us9` (149 member, Osprey). The walk drives the
production build in a real browser at a desktop (1536 wide, Chromium) and an iPhone size (402 × 874, WebKit, touch),
each walker in its own fresh browser storage; the developer bridge (`window.raptorRole`, `window.DAYS`, `window.PEOPLE`,
`window.go`) is available on localhost for READING state, never for making the fixture.

Rulings: D1695, D2087 (home squadron; inputs and leave only in it), D2093, D1971 (master admin), D2094 narrowed by
D2160 Q5 (another squadron: View only), D2132 (Inputs, Quals, Leave War, Tracker stay on his own squadron; the schedule
pages and Logic follow the squadron in view), D2109, D2122, D2160 Q1 (own Logic; OIL by the man's own squadron's
settings), D2167 (a Tracker each), D2160 F1 and D2184 R32 narrowing D781 (a shared holiday list per place, own Off day;
the warning; each squadron's schedulers answer OIL for their own), D148 (Undo own changes only), D166, D288, D22, D56,
D785.

## The host's roll-call so far (find what is missing)

The thing: a squadron's world. Each surface, for each seeded sign-in, desktop and phone: SHOW only its own squadron's ·
USABLE (an edit, input, publish, Undo stays in its squadron) · PAINTED (none of the other squadron's anything).

Edit Schedule's week (desktop; phone day strip) · the Scheduler Board — crew list, roster picker, free-crew strip ·
ALL AVAIL window, the day panel's counts · View-only Sched (a member) · Publish, amendment, "1 pending" / the changes
window · Undo / Redo · History (the change history — `elog:` is still unqualified) · Inputs page list and calendar ·
the input window's people picker · Medical · SANS calendar and day · Quals · Logic · the Leave War roster, periods,
bids · the Leave War Holidays form and R32's sentence · OIL (the Leave War's OIL cells, the day's OIL list) · the
Tracker (courses, + Add) · Search (the palette) · the bell · Admin → Users (lists both, step 5) · sign-out then the
other squadron signing in on the same tab · reload, and a fresh tab.

## What to hand back

1. **Roll-call gaps:** every surface, door, reader or downstream consumer missing above, or combined where it needs a
   separate observation — each with where in the app (page, control) and why it could differ. Include the readers of
   availability (who counts as free on a day) and every place a person LIST is drawn.
2. **Ranked scenarios, about twelve to sixteen, for about two to three hours of walking by two walkers:** each with
   setup (made through the app's own controls), action, EXPECTED (with its source: a ruling, a contract line, or two
   surfaces that must agree — or "RECORD exactly what it says" where you cannot settle it), and the observation that
   would disprove correctness. Cover: each seeded sign-in's own face; the same-tab sign-out then sign-in as the other
   squadron (the builders disagree whether a second person keeps the first person's Tracker — design the scenario that
   settles it, every world: week, Leave War, Tracker, Inputs, Undo list, bell); a write in one squadron never showing or
   moving anything in the other (an edit, an input, a publish and an amendment, an Undo, an OIL credit, a holiday);
   R32's sentences on the Holidays form (one day, several, both squadrons); a reload and a fresh tab.
3. **Orders:** every pair of actions in both orders that matters here (e.g. a 149 holiday added before / after 142
   publishes; sign-out with a save waiting; an Undo after another squadron's person wrote).
4. **The plain-user round** (D1557) for each area touched — Edit Schedule, the board, Inputs, the Leave War, OIL, the
   Tracker: the everyday tasks start to finish, every control that opens or closes pressed, every other place that should
   show the result looked at.
5. **Explicit negatives:** what you checked and found nothing to add.

Name each control as the screen names it, and say where you found it (a file and its line is fine for this report).
