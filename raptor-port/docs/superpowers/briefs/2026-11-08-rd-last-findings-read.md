# The final code read — React Doctor's last findings in People & accounts ([RD-LEFT-1108]), pull request 702

You are one of several readers of finished code, each blind to the others. Read-only: change no file. The code is a
clean copy of branch `claude/chat22-rd-last-findings` at the folder you were started in; `main` is already merged into
it, so **the change under review is exactly `git diff d8d5b1f57 HEAD -- raptor-port/src`** (13 files). You cannot run
the app; where a claim needs running, name the exact input or the exact Vitest test you would run (file, set-up, steps,
assertion) and the host runs it before believing it.

## What the change is, and the promise

- **Part 1 — 13 import cycles broken.** `src/state/people-settings-commit.ts` (the people-and-settings save layer) no
  longer imports `accounts`, `changes`, `noticeseen`, `apprseen`, `lwseen`, `flyplan`. A new file
  `src/state/people-settings-wire.ts` hands it, at start-up (`src/state/store.ts` wireStore), the four loaders it
  re-runs on a rollback or an undo (accounts, the change history's seen marks, the bell's read marks, the flying plan)
  and every command type those files declare, which the layer declares to the permission gate.
- **Part 2 — six React Doctor findings.** Admin → Data's clearing forms (`src/ui/AdminPage.tsx` ClearControl): "Period"
  is now `<label htmlFor>` its list; "Dates" a `span.mfield-lbl` naming the range calendar's `role="group"`. The CSS rule
  `.mfield label` widened to `.mfield label, .mfield .mfield-lbl`. Admin → Users (`src/ui/UsersPanel.tsx`): "Person" the
  same kind of span; a roster row's open editor is now its own component (`PersonEditor`, with `PersonSub`), an archived
  row's its own (`ArchivedEditor`). The access screen (`src/ui/AccessScreen.tsx`) keeps its caret in the callsign box,
  with a reason comment.
- **The promise (the host's reading of his D1534 — "new and changed code follows React Doctor's rules"; the job's own
  aim, not a ruling's words):** nothing a person sees or does changes, except that a press on the word "Period" now
  puts the keys on its list. Everything a person can do on Admin → Users, Admin → Data and the access screen, every save
  through the layer, every undo, redo, reload and failed-save rollback, must behave exactly as on `main`.
- **Rulings that bound these screens** — the area page `.claude/rules/decisions/people-accounts.md`; the full row of any
  ruling: `grep -h '^| D310 |' .claude/decisions-full/*.md`. The ones these screens draw: Admin → Users' one row per
  person, A to Z, own row not opened (D322, D310); the buttons by state — Active Suspend · Archive · Delete, Suspended
  Enable · …, no sign-in Give sign-in · …, Archived Restore · Delete, Waiting Give access · Refuse (D310, D322, D285,
  D298); the delete asks twice and names what goes (D287, D298); Enable and Restore prompt "check your quals and CAT"
  (D284, D307, D322); the archived row's rename and "Restore as …" when his callsign is taken (D286, D295, D310); the
  post-in date opening on today (D308); Give access's "On the roster / New person" (D214, D224, D322); Undo steps back
  only through one's own changes and never undoes adding, archiving, restoring, deleting or posting (D148, D350);
  Admin → Data's "Clear edit history…" as built (D1752); the "Not saved" band on the access screen (D1657, D1664).
- Who may do what is decided in ONE module, `src/state/perms.ts`, with `raptor-port/docs/data-model.md` §11; the command
  gate is `src/command/permissions`.
- Not flagged by React Doctor and not this job's, for you to weigh: the save layer still imports the command layer,
  whose actor reads `state/auth.ts` → `state/perms.ts` → `state/accounts.ts` → the save layer; `perms.ts` ↔ `auth.ts`.

## How to read — the finder brief (verbatim, the project's standing wording)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Concretely, at least: every entry that boots the app or a test world and whether each registers the layer before the
first write (the production start, `?fresh=1`, a second tab, the probe bridge, the Leave War and Tracker boots); every
writer that saves through the layer and whether its type is declared (a type left out is refused for a signed-in
person but NOT for the app's own headless actor — so a test with no signed-in person can hide it); every loader a
rollback or an undo must re-run, and what screen reads each copy; the order of registration against everything else
wireStore does; the split editors — what state each keeps, when it is created and thrown away (Cancel, a tap on the
row, another row, a save, a refusal, a change elsewhere while open), and whether any prop, key, effect or handler of
the old single editor was lost or changed in the split; the widened CSS rule — every `.mfield` in `src/ui/` that could
now draw differently; the label changes — `htmlFor` ids unique when both clearing forms are on the page.

**What is NOT a finding (his D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Also not a finding: anything that needs a scheduler who is not an admin (D785 — a scheduler is always an admin); a
member, a guest and a person with no sign-in stay in scope.

## What to hand back

1. **Findings, ranked** — each: severity (high / medium / low), the concrete failure (set-up, action, what the person
   sees, what `main` shows), the cause (file and the exact lines), whether `main` has it too, and **exact, step-by-step
   fix instructions** — not a direction — plus the failing test that proves it (file, set-up, steps, assertion).
2. **Explicit negatives** — "I checked X and found nothing", for every item of your inventory.
3. **A tidiness note** of the changed lines only — three questions: is anything in them not needed; is anything said
   twice; would a reader of them in a month understand why. No size number. Filed, not fixed.
4. End with `Rulings: none` (you make none).
