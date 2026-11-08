# Scenario design brief — React Doctor's last findings in People & accounts ([RD-LEFT-1108] parts 1 and 2)

Written 8 Nov 26 by chat 26 (the host, Opus 5.5), for Astra (Codex), read-only. You design the walk's scenarios
(the bug-check order §4 rank 1, D6, D353): hunt for what is MISSING. You cannot run anything: where a scenario needs
an input run, name the exact input and the host runs it.

## The change (branch `claude/chat22-rd-last-findings`, pull request 702)

Read the change itself: `git diff origin/main...HEAD -- raptor-port/src` (13 files). Two parts:

1. **The people-and-settings save layer's registration** (`raptor-port/src/state/people-settings-commit.ts`, new
   `raptor-port/src/state/people-settings-wire.ts`, `raptor-port/src/state/store.ts`). The layer used to import
   `accounts.ts`, `changes.ts`, `noticeseen.ts`, `apprseen.ts`, `lwseen.ts` and `flyplan.ts` for their loaders and
   command-type lists, while each of them imports the layer — 13 import cycles. Now the layer imports none of them;
   the wire file hands it, at start-up (`wireStore` in `store.ts`), the four loaders a rollback or undo re-runs
   (accounts, the change history's seen marks, the bell's read marks, the flying plan) and every command type those
   files declare. The settings loader list is now built at call time, in the order it always ran.
2. **Six React Doctor findings on three screens** (`raptor-port/src/ui/UsersPanel.tsx`, `AdminPage.tsx`,
   `AccessScreen.tsx`, one CSS rule in `raptor-port/src/ui/scheduler/08-windows-tools.css`):
   - Admin → Data's clearing form: "Period" now names its list (`htmlFor`); "Dates" is a `span.mfield-lbl` naming the
     range calendar, which became `role="group"`; the CSS rule `.mfield label` widened to `.mfield .mfield-lbl`.
   - Admin → Users: the approve's "Person" heading the same span; a roster row's open editor split into its own
     component `PersonEditor` (its line under the callsign into `PersonSub`), an archived row's into `ArchivedEditor`.
     The typed values (sign-in, role, the armed Delete; the callsign box, the post-in date, the error) now live in the
     editor, which exists only while the row is open. The row's React key already changed with the editor
     (`pid + ':e'`), so the builder claims the values started fresh on every open before as well.
   - The access screen ("Request access"): the callsign box's autofocus kept, with a disable comment and its reason.

## The promise

The job's ruling is D1534 (31 Oct 26): React Doctor's findings are cleaned up; new and changed code follows its rules.
The promise of THIS job is the host's reading of it, as for every such tidy-up: **nothing a person sees or does
changes — every screen, every save, every undo, redo, rollback and reload behaves exactly as on `main`.** So every
scenario's EXPECTED line is "the same as on `main`'s build", and the walk drives `main`'s build and this branch's side
by side. Where you think `main` itself is wrong, say so separately — that is not this job's finding unless the change
made it reachable.

The area's rulings, as they stand: `.claude/rules/decisions/people-accounts.md` (a page — Admin → Users' buttons by
state, the delete that asks twice, Suspend / Enable and the "check your quals" prompt, the archived row's rename,
Restore and Restore as, the post-in date, the request card). Undo steps back only through the signed-in person's own
changes and does not take back adding a person, archive, restore, delete or a posting (D148, D350). Admin → Data's
"Clear edit history…" stays as built until the database step (D1752).

## What to do — the finder wording (the order §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Questions to drive it, not to limit it:
- **The save layer:** every writer that saves through it (people edits, the eleven settings keys and their rows, the
  accounts' intents, the change history's and the bell's seen marks, the Leave War's and Approvals' seen marks, the
  flying plan, the roster add, the member's own file — find them all by searching the imports of
  `people-settings-commit`), and for each: its first save, its undo, its redo, a failed save's rollback (the app has
  `?savefail` on the browser's store), a reload, a second tab. Which in-memory copies must be rebuilt on a rollback
  or undo, and does every one of them still get its loader? Is there any start-up path, page, test harness or second
  entry (the Leave War, the Tracker, `?fresh=1`, a sign-in without reload, the probe bridge) that reaches the layer
  without going through `wireStore`, so the loaders stay the do-nothing ones or a type is not registered?
  What does a command of an unregistered type do — refused loudly, or silently lost?
- **Admin → Users:** every state of a roster row (active, suspended, no sign-in, own row, a posting waiting, a held
  posting) and of an archived row (callsign free, callsign taken, no sign-in), and a waiting request (Give access —
  On the roster / New person); for each, open, type, close (Cancel, the row tap, another row, a save, a refusal),
  open again — what is in the boxes, is Delete still armed? The order: arm Delete, open another row, come back.
  A change made elsewhere (another tab, an undo, a rename on Quals) while the row is open or closed.
- **Admin → Data's clearing form and the access screen:** what the person sees and presses — a press on "Period",
  the range calendar, the look of "Dates" and "Person" beside a real label; the caret on the access screen on a
  phone and a desktop, after a sign-in without reload, after a failed save band.
- **The plain-user round (his D1557):** the area's everyday tasks start to finish as a user would — give a sign-in,
  suspend, enable, archive, restore, rename, delete, approve and refuse a request, clear a period on Admin → Data,
  undo — pressing every control that opens or closes something (Cancel, the row, Escape, a tap outside), then every
  other place that should show the result: Quals, the Leave War, the bell, the change history, the sign-in screen.
- Check your scenarios against the 23 walk lessons listed at the foot of `raptor-port/docs/bug-check-checklist.md`
  and name, for each lesson, the scenario that covers it or why it cannot apply here.

## What to hand back

1. The inventory: every writer, reader, loader, renderer, door, role and order you found, each with where its sign
   and its gesture are in the app.
2. Scenarios, ranked, each: id, setup (through the app's own controls — sign in as `ad`/`a` admin or `us`/`us`
   member), action, EXPECTED ("the same as on `main`" unless you say otherwise and why), and the observation that
   would disprove it. Mark which need two builds side by side, a reload, a second tab, `?savefail`, a phone.
3. Explicit negatives: "I checked X and found nothing".
4. Any scenario you think is a real fault already, with its exact step-by-step fix — the host proves it red first.
5. The inputs you would run, if you could, named exactly.
