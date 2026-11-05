# Fresh, blind read of the reads' fixes — commit b54345ecd (5 Nov 26)

Reader: a fresh Opus 5.5 that did not write the fixes (D790, D1594). Read only: no source changed. The change read:
`git show b54345ecd -- raptor-port/src` (11 files). Read against: read-code.md findings 2 and 3, read-security.md S1, D1709's
full row, `leavewar/sync.ts` (retractPostingLines, takeBack, restoreBody, postingLinesOf, postedLines, postOut,
postOutProblem, isGroundCrew, runPoOutcomes, undoPostOut, restoreArchivedPerson), `state/noticeseen.ts` whole,
`command/commit.ts` (dispatch, the phases, the refusal path), `undo/timeline.ts` NOT_STEPS, `state/perms.ts` (`notices.seen`),
`leavewar/ui/{OutcomeChips,NamePuck,BidPicker,SelectSheet,Matrix,MatrixRows}.tsx`, `matrix.css`, the drawing check's
measure (`scripts/drawcheck/lib.mjs`). Run here: `npx vitest run src/leavewar/postout-takeback.test.ts
src/leavewar/ui/namepuck.test.tsx src/leavewar/ui/po.test.tsx src/state/perms.test.ts` — 4 files, 132 tests, all pass.
The D56 exclusion applied: nothing below lives only in stored demo data.

## Summary

| # | Severity | One line |
|---|---|---|
| 1 | Low | The S1 fix also stops the "taken back" line to an admin whose sign-in is SUSPENDED (still an admin) who had read the posting line: when he is enabled again his read "Posted out" line is simply gone, never said to be taken back |
| 2 | Low (robustness; no admin-reachable trigger found) | `takeBack` runs `forgetRead` on `ok` (the write ran) without asking whether the command landed — `restoreBody` asks; a refusal after the reducer would un-read lines the rollback put back |
| 3 | Info | Test gaps: the drag window's (SelectSheet) SANS chip for ground crew, and `restoreBody`'s undo-mode `forgetRead`, have no test |

No Medium or High finding. Each fix is right for the case it answers; the twins are covered (below).

---

## Finding 1 — Low — a suspended admin who read the posting line is no longer told it was taken back

**Setup.** Seed as the scenarios. Ranger posted out (any outcome with a stored line, e.g. SANS) for PO; the date passes;
the pass writes a line to every admin who can sign in, Hex among them. Hex taps it (read).

**Action.** Saber suspends Hex's sign-in on Admin → Users ("Suspend", D285 — he is still an admin, `on: false`). Saber
then presses Undo post out on Ranger's posting. Later Saber enables Hex again; Hex signs in.

**Expected** (D1693 / D1699: a line its reader has READ is replaced by a struck "taken back · Saber" line, unread; the
security read's S1 was about a man who is NO LONGER an admin). Hex, still an admin, gets
"Ranger · … / ~~Posted out · now SANS~~ · taken back · Saber".

**What happens.** `retractPostingLines` (`src/leavewar/sync.ts` 2720 and 2726) builds its set from `schedulerIds()`
(sync.ts 1287: `isAdminAccount(a) && a.on && !!a.pid`), so a suspended admin is skipped exactly as a demoted one: his posting
line is spliced out, no "taken back" line is made. On his return his bell holds nothing about Ranger — the line he read
vanished silently. (The same `a.on` read means his worked-out "off the manpower" line is not in `postingLinesOf`'s derived
set either — sync.ts 2710 — so on a re-set posting for the same date it comes back to him already read: code read 2's
residue, for a suspended admin.)

**Why it matters / why only Low.** It is the narrow reading of S1: the security read named the `a.on` question and chose
it to match the pass — but the pass's case is different (a suspended admin never received that line; here he received and
read it). Suspension is the app's "away, then back" (D280), so this is a real if rare path. No leak either way: nothing
is shown to a man who cannot sign in.

**Fix.**
1. In `sync.ts`, beside `schedulerIds` (1287), add
   `const adminPids = (): string[] => ACCOUNTS_LIST.filter(a => isAdminAccount(a) && !!a.pid).map(a => String(a.pid))`
   (admin by role, whether or not switched on).
2. In `retractPostingLines` use `const admins = new Set(adminPids())` in place of `schedulerIds()`. S1 stays closed: a
   demoted admin (role member) is still excluded; `noticePostingBack`'s own `here` check still refuses an archived,
   deleted or special man.
3. Optional, for the derived line's residue: in `postingLinesOf`, derive from `adminPids()` — which needs `postedLines`
   to accept a pid that is an admin but switched off (today its first line returns `[]` for anyone outside
   `schedulerIds()`); simplest is a second parameter `postedLines(pid, anyAdmin = false)` used only here. If this is judged
   not worth it, say so in the code comment (a suspended admin's re-set "off the manpower" line comes back read).
4. Red first, in `src/leavewar/postout-takeback.test.ts` beside the S1 test: post out SANS, `reach(); runPoOutcomes();
   hexReads()`; `updateAccount('achex', { on: false })` (or the suspend door the tests already use); `undoPostOut('bane')`;
   expect one `poback` line addressed to Hex; keep the S1 test (role → member → none) green.

## Finding 2 — Low (robustness) — `takeBack`'s `forgetRead` does not check that the command landed

**Setup / action.** Any `takeBack(…, undo = true)` whose `lw.postout` command runs its reducer (so `ok = write()` is true
and `forget` is filled) and is then refused at phase 5 (`command/commit.ts` 272–284: a stale-revision conflict, a
conflict checker, a hard invariant) — `cmdCommit` rolls everything back and returns `{ ok: false }`.

**What happens.** `takeBack` (sync.ts 2737–2763) ignores the commit's result: `if (ok && forget.length) forgetRead(forget)`
(2760) runs anyway, so the presser's read record loses the ids of his posting lines that the rollback has just put back —
they light his bell again as unread, for a posting that was never undone; `raptorNotify()` fires and `takeBack` returns
`true` (that last part is older code). `restoreBody` does it right: `if (!ok || (r && 'ok' in r && r.ok === false)) return
false` before its `forgetRead` (2549–2550).

**Reachable?** Not found for an admin: authorization is phase 1 (before the reducer, so `ok` stays false), the ownership
invariant returns null for an admin actor (security read N2), and a one-tab conflict on these rows was not found. A
non-admin calling `undoPostOut` by hand is refused at phase 1. So no concrete in-app failure today — filed because the
twin already does it right and the fix is two lines.

**Fix.** In `takeBack`: `const r = cmdCommit({ … })`; after it,
`const landed = ok && !(r && 'ok' in r && r.ok === false)`; then `if (landed && forget.length) forgetRead(forget)`,
`if (landed) raptorNotify()`, `return landed`. No test needed beyond the existing ones (no reachable refusal to drive);
optionally a unit test with a temporary hard invariant (`defineInvariant` in a test, `_resetInvariants` after) that refuses
`lw.postout` and asserts `isUnread` unchanged.

## Finding 3 — Info — two untested twins

- **The drag window's chips** (`SelectSheet.tsx` 545, testid `sel-po`): `noSans` is passed, but `po.test.tsx` covers only
  the one-day sheet (`po-sans`) and the Post out sheet (`postout-sans`). Add a third case: drag-select `gnd_t`'s days,
  open `sel-postout`, expect `sel-po-sans` absent and `sel-po-overseas` present.
- **`restoreBody`'s undo mode `forgetRead`** (sync.ts 2543, 2550) has no test. Today only stored lines (minted ids) can
  reach it — an "off the manpower" posting never archives, so the archive-undo path never carries the steady derived id —
  so dropping them is harmless (the same as `markNoticeRead`'s own pruning). A test is cheap insurance: overseas posting,
  run, Saber reads his line, Undo post out (goes through `restoreArchivedPerson`), expect Saber's read record no longer
  holds that id and no line of his left.

---

## Explicit negatives, fix by fix

### S1 — "taken back" only to a man still an admin
- Right for its case: a man made a member since gets no `poback` (the test); his old line still goes (the splice is above
  the skip). The presser still gets nothing. An admin who read and is still an admin and switched on still gets one
  (existing tests stay green).
- `schedulerIds()` inside the command reads the live `ACCOUNTS_LIST` (an ESM binding), so an account changed earlier in the
  same session is seen; `enableAfterPosting` / `enableForRestore` run before the retract in both twins, so the set is read
  after the command's own account changes. Notice `to` and the set are both strings. A suspended admin: Finding 1.
- Both twins carry it: `takeBack` (Undo post out) and `restoreBody`'s undo mode (Undo on the posting's own archive) both
  call the one `retractPostingLines`. Restore on Admin → Users (`postIn` given) touches no lines, as before.

### Code read 2 — the presser forgets his own read lines
- Right: the presser's derived line `po:<id>:<PO>` leaves his read record, so the same posting set again for the same date
  comes back unread (the test). The other admins' handling (the `:n` suffix by `poback` count) is untouched.
- Drops only what it should: ids are collected only where `n.to === by` (his own lines) and `hasRead(by, n)`; every such
  line was just spliced or is a derived line that no longer exists. Other admins' rows are never written — `forgetRead`
  writes only `me()`'s own row. Stored line ids are minted (`notices.ts` 397), so no live line shares a dropped id.
- As a second command: it runs after `cmdCommit` returned, at phase idle, as its own `notices.seen` command — allowed for
  his own row (`perms.ts` 554, the own-row check at 1269), never an Undo step (`undo/timeline.ts` 206 NOT_STEPS), so it
  neither lands in the Undo history nor clears anything; a refused write reloads the record and returns false (no harm).
  If `takeBack` were itself queued (raised at phase 8/9), its reducer has not run, `forget` is empty, nothing is dropped.
  `upto` is 0 in this build, so dropping the id is enough to make the line unread. The one gap: Finding 2.
- `restoreBody` twin: present, gated on the command's result (correct); untested (Finding 3).

### Code read 3 — " SANS" for a screen reader
- Right: `.lw-sr` sits inside the name's button (`.whoedit`, no `aria-label` — only a `title`), so the button's name now
  reads "<callsign> SANS …"; absent for a man who is not SANS (the test).
- No leak found: NamePuck is drawn only in the grid row (`MatrixRows.tsx` 172) and the phone's frozen copy (`Matrix.tsx`
  4048), both inside `#page-leavewar`, so the scoped `.lw-sr` rule always applies — no portal draws it outside. No
  production code reads a puck's `textContent`/`innerText` in the Leave War (only `.lw-yr` writes and the move ghost's own
  words, `select.ts` 830); there is no drag image cloned from a name (Rearrange drags the row itself). Every unit test that
  reads a Leave War name reads `.nm` (unchanged); `e2e/leavewar.spec.ts` reads `.who .puck .nm`; no e2e or the take-back
  walk asserts a name button's full text, and none counts the word "SANS" on the grid (the walk counts `.po-sans-tag`, which
  is gone). The drawing check skips it: its measure ignores a text node whose element is 1px wide or less
  (`scripts/drawcheck/lib.mjs` 74), so the drawn words and boxes are unchanged. It takes no width (absolute, 1px, clipped).
  Old hand-walk scripts that read a name button's `innerText` would now see " SANS" for a SANS man — none is a gate.
- Older, not this fix's: the phone's frozen copy is `tabIndex={-1}` but not `aria-hidden`, so a screen reader can meet each
  name twice (now with "SANS" twice) — as before for the name itself.

### D1709 — no SANS for ground crew
- Every posting door is covered: the one-day sheet's PO (`BidPicker` 1075), the Post out sheet (`PostOutSheet` via
  `Matrix` 4279), the drag window (`SelectSheet` 545 — single person only, `nPeople === 1`, so `sel.people[0]` is the man).
  All three reach the writer through `Matrix postOutOr`, which asks `postOutProblem` first and shows its sentence, then
  `postOut`, which asks it again — the writer refuses "sans" for ground crew whatever the door.
- The UI test (`war person.pers`) and the writer's test (`rosterBody.pers || seat === 'GND'`) agree: the projection marks
  exactly those men `pers: true` (`state/raptorRoster.ts` 57).
- No other writer of a SANS posting: the store's `setPostOut` is called only by `sync.ts` (postOut, takeBack's undo,
  restoreBody's undo — the last two write `null`) and by the developer-PC probe bridge; `closeStintOnArchive` writes
  Overseas Sqn. The posting pass makes SANS only from a stored SANS posting; a man's seat cannot change after he is added
  (no writer of `seat`/`pers` on an existing person found), so a ground-crew SANS posting can now exist only in stored demo
  data — D56, not a finding. A hidden chip cannot be the default: both sheets start on Overseas Sqn; the Post out sheet
  shows the stored outcome, which for a ground-crew man can no longer be SANS.
- Nothing else offers a posting outcome (`OutcomeChips` has these three users only).

Rulings checked against: D1693, D1699, D1216, D1709, D229, D294, D283, D280, D285, D350, D56.
