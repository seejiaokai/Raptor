# Red-team brief — the `[ACCOUNTS-NEW-PERSON]` plan (round 1), 26 Sep 26

You are an independent reviewer of a PLAN, before any code is written. You did not write it (Opus 5.5 did). Another
reviewer from a different provider is reading the same plan at the same time; you will not see each other's report.
**Read-only: do not edit any file in the repository.**

## What to read (live files — read them, do not rely on this brief's summary)

1. **The plan:** `raptor-port/docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md` — the whole file.
2. **The approved design (D224):** `raptor-port/docs/mock/new-person-account.html` and its pictures in
   `raptor-port/docs/mock/img/new-person-account/` (desktop and phone: the sign-up, the bell, approving, adding). The
   script that drew them is `raptor-port/scripts/handpass/am/mk-new-person.mjs`.
3. **The owner's rulings** (the plan must obey every one; a later ruling wins over an earlier one — D90):
   - `.claude/rules/decisions/how-we-work.md` — **D214, D216, D217, D219, D220, D221, D222, D223, D224**, and the
     accounts rulings they build on: **D165, D166, D200, D201, D202, D204, D210, D213, D215**.
   - `.claude/rules/decisions/scheduler.md` — **D149** and **D218** (a member's own Quals row; only an admin renames),
     and its §Settled "Inputs & Admin".
   - `.claude/rules/raptor-executor.md` (how the build must be done) and `.claude/rules/bug-check.md`.
4. **The backlog item:** `OUTSTANDING.md` — search `[ACCOUNTS-NEW-PERSON]`.
5. **What the database will be built from:** `raptor-port/docs/data-model.md` §3 (`Person`, `User`, `AccessRequest`) and
   §11 (the permissions table — the plan edits it); `raptor-port/docs/handover-dataverse.md`.
6. **Today's rules:** `raptor-port/docs/engine-rules.md` §Auth / roles; `raptor-port/docs/ui-contracts.md` (search
   "Add person", "access screens", "Admin → Users", "bell").
7. **The code the plan changes** (read what you need): `raptor-port/src/state/accounts.ts`, `state/perms.ts`,
   `state/people-settings-commit.ts`, `state/quals-write.ts`, `state/view.ts` (`VIEW_RESET`), `state/store.ts`
   (`resetSession`), `state/reports.ts` (the bug-report bell, the pattern D216 copies), `engine/people.ts` (`nameToId`,
   `ID_BY_CS`, `deriveQuals`, `QCHIP`), `engine/newid.ts`, `ui/UsersPanel.tsx`, `ui/AccessScreen.tsx`,
   `ui/AdminPage.tsx`, `ui/QualsPage.tsx` (`addPerson`, `catsFor`, `qualsHead`), `ui/Shell.tsx` (the bell),
   `ui/HelpPage.tsx` (how the bug-report bell goes out), `command/commit.ts` (multi-store enlist and rollback),
   `undo/timeline.ts` (why people/settings commands are not undoable), `leavewar/sync.ts` (`reprojectRoster`),
   `tracker/peoplewire.ts`. Their tests: `state/accounts.test.ts`, `state/perms.test.ts`, `ui/accounts-ui.test.tsx`,
   `ui/quals.test.tsx`.
8. **How this project checks work:** `raptor-port/docs/bug-check-order.md` (§2b, §5, §6, §7).

## What to do

> Do not merely review the plan's text. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Answer, specifically:

1. **Does the plan obey every ruling above**, as he worded it? Name any ruling it misreads, narrows or contradicts — and
   any ruling it FORGOT that applies. Where the plan states "the agent's call" (its last section), say whether any of
   them is really his to decide rather than the agent's.
2. **Atomicity and the command layer.** Is ONE command over the people store and the settings store really
   all-or-nothing here (read `command/commit.ts`)? What happens on a refusal inside `putNewPerson`, on a throw, on a
   storage failure? Does anything outside the command (the Leave War's roster projection, the Tracker's people bridge,
   the callsign index, the people baseline) see a half-made person?
3. **Permissions (D200).** Is the plan's change to `COMMAND_OPS` (the `more` tables) and to data-model §11 correct and
   complete? Can a member, a guest, a pending person or a switched-off account reach any new door, by the screen or by a
   hand-made call? Is anything the plan adds DECIDED outside `perms.ts` (the source scan, `perms-scan.test.ts`, forbids
   it)?
4. **The bell (D216).** Is "seen" per admin, stored on the request, the right reading and a sound build? What about two
   admins, a reload, a phone (the Users category list vs the list itself), an admin whose account is switched off, the
   probe bridge's role switch (`window.raptorRole`) with no account, a request declined or approved before being seen?
5. **The one add (D214, D217).** Does moving the Quals add into `state/roster-add.ts` keep EVERY rule the old one had
   (the PID-01 id-collision guard, personnel with no CAT, the success toast, the admin-only check at the write)? What else
   in the app creates a person that the plan missed (search for writes to `PEOPLE[`)? Is there anything the Quals form
   did that no screen does after the build (flight was on the old form — the plan leaves it to Quals)?
6. **The words (D219, D220, D222).** Every place the plan relabels, and every place it should have and did not.
7. **What is missing** from the roll-call and the door check.

**Tell us what is NOT a finding (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

## How to report

- One numbered finding per problem, ranked most serious first: **what**, **where** (file / plan section), **the failure
  scenario** (setup → action → what goes wrong, in the app's own words), and **the exact, step-by-step fix** to the plan
  (not a direction).
- **Explicit negatives:** list what you checked and found sound ("I checked X and found nothing").
- A verdict at the end: **APPROVE**, **APPROVE WITH CHANGES** (the findings are fixes to fold in), or **BLOCK** (the plan
  must be rewritten first — say why).
