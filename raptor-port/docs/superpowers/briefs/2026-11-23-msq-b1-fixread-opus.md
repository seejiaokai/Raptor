# The read of the fixes — the fresh, blind Opus reader (commit 1cd46dcdb)

Saved as it arrived (chat 149's helper, 23 Nov 26 ~06:20 MPST). Read only; no test run; a throwaway copy begun and deleted.

## Findings
None. Each of the seven fixes traced on every path the brief names — the door, the commit gate, Undo and Redo, a reload,
another squadron picked — and each closes its fault; nothing a fix broke meets the bar.

- **F1** (`ui/Drawer.tsx`): Edit Schedule asks `canEditSched()`, the top bar's own check (`maySchedEditPage`, the member-view
  switch respected); the drawer redraws on a pick (`useVersion`); the inventory test widened, not weakened.
- **F3** (`state/undo-wire.ts landingOf`): an Undo / Redo of a squadron or place step pressed on Admin no longer asks for
  Users; primary stays `admin`; addUnit's first-admin grant still a squadron step; account steps still open Users.
- **R1** (`state/bellsqn.ts setBellSquadron`): choices kept only for squadrons in `unitRowsBefore([]).units`, the gate's own
  set, seeds included — press and gate can no longer disagree.
- **R2** (`apprseen.ts`, `ApprovalsPage.tsx`, `keyowner.ts`, `tables.ts`, `perms.ts adminOwnerViolation`): stored
  `<war>@apprseen:<pid>`; the own-row check reads the name with the squadron split off; section 7 also asks the writer to
  be an admin of that squadron — a master admin, a Plan holder on 149's war, a home admin all pass, a View holder's war is
  his home's; the effect re-runs when the war swaps; the table mapping and the record layer (`isRowKey` via `localOf`)
  handle the qualified id.
- **R3** (`accounts.ts markWith` / `rightsDropped`; gate `unitRowViolation`): setMaster drops View and Plan in the same
  command, Plans kept on `kept`; the lock judged over the rows left; the gate rule for every command setting the mark; one
  Undo puts the mark off and the Plan back (a verified replay passes "an ended right brought back"); Redo drops them again.
- **R4** (`saveAccess` with `name`; `UsersPanel.tsx`): the rename's checks are updateAccount's, same order, all before any
  write (a master admin's account only by a master admin; his own refused; another squadron's man refused; a request
  waiting under the name only by an admin of its squadron; the name filled and free); a rename answering a request deletes
  it inside the same `account.access` command; a case-only change is no rename.
- **R5** (`requestAnsweredByAccount`): requests waiting before the command rebuilt from the stored rows, each changed one
  put back as it stood — no hiding one by deleting, re-pointing or re-squadroning it in the same command; seeded accounts
  first written read as their seed (`accountBefore`); real approvals by a home admin, a Plan holder or a master admin pass;
  Undo and Redo of an approval pass.

## Residual notes (not findings: no failing test, or not reachable in one browser today)
1. R3 and R5 add refusals an Undo can now meet (the mark put back while another admin's right stands; an account name
   restored onto a request filed since); the Undo's pre-check `accountsRestoreProblem` asks neither, so the refusal would
   come in the gate's generic words — unreachable in one browser (the Undo list is per person, cleared at sign-out);
   possible with two tabs or after the database step; refusing is right, only the wording generic.
2. F3 holds only when Undo is pressed on Admin; a squadron step undone from another page still lands on Admin → Users,
   where it does not show — older behaviour, outside the fault.
3. R1: once a later press drops a stale choice, a Redo of "+ New squadron" brings it back on its default, not the off he
   may have set — negligible.

## Read / not read
Read: the whole fix diff 992f0227a..1cd46dcdb under raptor-port/src and the code around it (accounts.ts updateAccount,
setMaster, saveAccess, request helpers, accountsRestoreProblem; perms.ts sections 7 and 7e, unitRowViolation's master
section, requestRowViolation, bellSqnRowViolation, cmdAuthorize; units.ts unitRowsBefore; engine/hooks.ts storedKey and
keys; storage/unitid.ts; keyowner.ts; people-settings-commit.ts; acctlines.ts tellAccess / accessParts; ApprovalsPage's
mount and visit; Shell's Edit tab gate); the four new tests for R3, R4, F3, the drawer and the three changed tests (no
assertion weakened); plan §3 item 7 and §15 D14. Not read: the half's diff beyond these; data-schema.md; the
people-accounts page and D2336's row.

## Tidiness notes (filed, not fixed — D489)
1. `AccessSave.name?: any` (accounts.ts) could be `string`.
2. `requestAnsweredByAccount` (perms.ts) writes its own name normaliser copying `normName`, and walks the request rows
   again as `requestsNaming` does — one shared reader.
3. `rightsDropped`'s filter a nested ternary — two named conditions; `account.master`'s COMMAND_OPS entry still lists only
   the account row and a notice though setMaster now deletes grant rows (`account.update` leaves its grant deletes
   unlisted the same way).
