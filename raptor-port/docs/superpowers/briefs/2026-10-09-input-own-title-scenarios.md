# Brief — design the test scenarios for "an input's own title" (one designer; read-only)

**You are designing what a walker will DO in the running app** (owner D6, D353: the other provider designs the
scenarios, Opus executes them). The feature is BUILT on `claude/day-window-compact` (commit `fa9463d0`). Change no file.
You are not reviewing the code for bugs — a blind code read by two readers comes after the walk. **Ask what is MISSING:**
which state, order, surface or role would this build get wrong, or never have been wired for?

## What was built
An input of a "Duty & other commitments" kind may carry a title of its own; it is the input's NAME everywhere a name is
printed; the KIND goes on deciding every rule; where the name is not the kind's own, the kind is kept in sight, small.
- The owner's rulings: `.claude/rules/decisions/scheduler.md` D715, D716, D717 (full rows:
  `grep -h '^| D716 |' .claude/decisions-full/*.md`). The approved drawing: `raptor-port/docs/mock/input-own-title.html`.
- The plan (read it whole): `raptor-port/docs/superpowers/plans/2026-10-09-input-own-title-plan.md` — §4 is the
  roll-call of every surface; §8 is what the two reads of the plan changed.
- The contracts as written: `raptor-port/docs/engine-rules.md` §An input's own title; `raptor-port/docs/ui-contracts.md`
  (search "An input's own title").
- The code, to learn what a control does (not to review it): `src/engine/inputs.ts` (`titledKind`, `titleOf`,
  `inpLabel`, `inpKindTag`, `inpDetailKey`), `src/ui/inputedit.tsx` (the window, `commitInputEdit`, `commitGroup`),
  `src/ui/InputsPage.tsx` (the List's form and pencil editor), `src/ui/InputsCal.tsx`, `src/ui/html.ts` (`rowKindTag`),
  `src/ui/board-html.ts`, `src/engine/events.ts` (`push`), `src/ui/pendlist.ts`, `src/state/changelines.ts`.
- How a walker signs in and moves: `raptor-port/CLAUDE.md` §Build & verify; the roles are an admin (Saber) and a member
  (Ranger). The demo carries one titled input: an Event for ALL titled "Sports afternoon" on Wed 22 Jul 2026, and a
  Duty for ALL AVAIL on Sat 25 Jul 2026 (untitled). The loaded week is 13–19 Jul 2026.

## NOT a finding (owner D56)
The app's stored world is DEMO DATA, cleared before the database step. Do not design a scenario whose only possible
finding is harm to data already stored when the code is correct going forward (an old "Other" named by its remarks now
reads "Other" — known, accepted). **Not open:** the owner's choices in D715–D717.

## What to produce
A numbered list of scenarios a walker can execute through the app's OWN controls, grouped so two or three walkers can
split them without sharing a world. Each scenario: the role, the size (phone 390 wide / desktop 1440 wide), the exact
steps, and **what must be SEEN on screen** at the end (the words, where they stand, what must NOT be there). Cover at
least:
1. **Every door that writes a title** — the window (new and edit), the List's form, the List's pencil editor, a shared
   input ("Several people"), an input for ALL AVAIL / ALL — and each door's states: untouched, typed, emptied, typed
   back to the kind's name, 40 characters and more, markup characters, a change of kind after typing (to another titled
   kind; to a leave; back).
2. **Every surface that shows the name** (the plan's §4, 18 rows) at both sizes, for a titled input and an untitled one
   side by side — and the kind kept in sight exactly where the name is not the kind's own.
3. **Orders around publishing**: publish, then title; title, then publish; title → amendment → retitle; typed back to
   what was published; an OD (no row on the programme); a two-day input; undo, redo and a reload after each.
4. **A title's words must decide nothing**: titles that are rule words ("Meeting", "Training", "SC", "Brief", "Off",
   "Event", "OD", a callsign, a time) against a standby shift, a flying line and another commitment at the same hour;
   two different inputs with the same title for the same man at the same hour.
5. **Roles**: a member titles his own; a member opens another man's titled input (read only); a member who filed a
   titled input for someone else; an admin retitles a member's.
6. **"Other"**: titled; untitled with a remark; title and remark the same words.
7. **OIL**: a weekend titled input — what the question calls it; a title-only edit afterwards must ask nothing again
   and move no figure; OIL Earn mode on the board with a titled row.
8. Anything else you judge this build most likely to have MISSED — say why you suspect it.

Then, separately: **the five scenarios you would run first if only five could be run**, and **break tests** — one
deliberate fault per rule (what to change in the code, and which scenario should then fail).
