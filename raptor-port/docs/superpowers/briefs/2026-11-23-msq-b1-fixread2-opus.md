# The read of the second fix round — the fresh, blind Opus reader (commit 41ca09274 against 1cd46dcdb)

Saved as it arrived (chat 149's helper, 23 Nov 26 ~07:15 MPST). Read the commit only (`git show` / `git diff`); no copy, no
test run, nothing changed.

## Findings
None that meet the brief's bar.

**A1 — no Undo or Redo puts a right back on a master admin: closed on every path traced.**
- The Undo's check (`accounts.ts accountsRestoreProblem`) refuses when any master admin would hold a right afterwards,
  judged on the account list and the squadron rows as the step would leave them, whenever an Undo or Redo touches either:
  the Undo of a right taken away, the Redo of one given, and the Redo of "+ New squadron" after its first admin was made
  master since.
- The gate (`perms.ts unitRowViolation`) no longer lets a restore through — a forged command or another door refused too.
- No ordinary Undo newly refused: every door that makes a man master drops his rights held today (`setMaster` and the one
  Save via `rightsDropped`; a re-link via `dropGrantsOfAccount`); rights are dated today; neither `setGrant` nor
  `firstAdminProblem` gives one to a master; so no master holds a right in normal use and the all-masters check fires only
  in the A1 case. Undo / Redo of making someone master and of taking the mark off both pass.
- A gap not turned into a failing test: if two rows held at once for one account in one squadron (the code says two
  writers at one moment could store it), only one is dropped when he is made master, and every account or squadron Undo
  would then be refused app-wide. Not counted.

**A2 — Approvals follows the pick: fixed.** The Leave War's change count only moves forward when a squadron's war loads
in place (a fresh store starts at 0 but clears every subscriber, so nothing reads a repeated number); the page's rows,
filter, armed Approve all and date picker are keyed on squadron and period; every other reader of the count (Chrome,
Balances, the sync's deferred repaint) checked — none assumes a start at 0, and a count that only grows can only cause
extra redraws. The Grid keeps its own state by period alone, but a pick cannot reach it while that state is live (sheets
have a scrim and hold the keyboard; move mode ends on any press outside the grid, the top bar's picker included).

**A3 — "+ New squadron" Undo / Redo lands on Admin → Squadrons: fixed**, from another page and from any Admin panel,
staying when already there; the panels are all kept mounted and only hidden, so moving from Users loses nothing typed;
steps that change only a man's squadron or his rights still open Users.

## Read
Fix lines: accounts.ts, perms.ts, store.ts initStore, ApprovalsPage.tsx, undo-wire.ts landingOf, view.ts, AdminPage.tsx,
the three tests. Around them: setMaster, rightsDropped, markWith, keptPlans; setGrant, removeGrant, putGrantLine, addUnit,
firstAdminProblem; grantHolds / grantStart (units-model.ts); rosterRestoreProblem and its wiring into the Undo; timeline.ts
refusal wording, outOfBandWords; swapWarWorld, lwHistInit, lwHistEpoch; the Matrix's period-keyed resets and move mode;
the sheet's scrim and keyboard hold. Not opened: docs/handpass/, the 23 Nov briefs.

## Tidiness notes (filed, not fixed — D489)
1. `accounts.ts accountsRestoreProblem` types "Something else changed this after your action — it can’t be undone now."
   again instead of reusing `timeline.ts`'s, which would also name who changed it ("Kestrel changed this…"), as D148's
   other refusals do — two copies can drift.
2. `ApprovalsPage.tsx`: `periodId` is now squadron plus period, and the remembered rows still call it `period` — `visitKey`.
3. `store.ts initStore`: the reset to 0 is safe only because the same line clears the subscribers — one if/else, or always
   count on.
Also: `undo-wire.ts`'s comment says a press on Squadrons "stays there"; the code always sends a panel request, which also
clears the Users panel's ring and new-person form value — harmless today, the comment understates it.
