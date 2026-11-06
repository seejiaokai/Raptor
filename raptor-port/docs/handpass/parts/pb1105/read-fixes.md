# Fresh read of the fix round — [POSTOUT-RUN-NOTICE] (141a762a0, aa5509ce0 — raptor-port/src), 5 Nov 26

**Count: no fix found that refuses a legitimate pass or breaks its twin; 1 incomplete fix (low-medium), 3 low notes.**

Read: both diffs; `runPoOutcomes` whole; `postingPassViolation` / `ownershipViolation`; `schedStore`, `baseline`,
`resyncSchedBaseline`, `applyEnd`, `tellBegin`/`tellPass`, `noticePass`; `command/commit.ts` enlist and change derivation;
`noticePosting`, `schedulerIds`, `isAdminAccount`, `here`; every bell-line writer (`noticeWar`, `noticeHoliday`, `tellWar`,
`tellBidding`, `lw.notice`); `lwSyncTurn`; AdminPage / UsersPanel; Shell's mount of the Admin page. Ran
`postout-notice.test.ts` (26 passed) and `postout-landing.test.tsx` (4 passed).

**Checked and sound:**
- **Who the gate counts as an admin.** It counts exactly who `noticePosting` writes to: the same filter as `schedulerIds`
  (admin, account on, has a person), and `noticePosting` only narrows it further. Both read `ACCOUNTS_LIST` after the
  outcomes, within the same synchronous commit (and inside the apply for a queued pass). An admin posted out Overseas Sqn
  (suspended) or deleted (account removed) drops out of both. An admin made SANS is left out by both: the caller's
  `to.filter` and the gate's `n.to !== who`.
- **The line's fields.** `day`, `iid ''`, `o` and `acct` match what the writer puts. The date is the same value, worked
  out by local arithmetic in the pass and by UTC arithmetic in the gate. Line ids are minted, so a re-posting after
  "Undo post out" never collides on `before != null`. A man has only one posting record, and the pass holds `SYNCING`,
  so "one line per admin per man" cannot trip a legitimate pass.
- **A Delete's other lines.** They come only from `tellPass` → `noticePass`, which writes a line only for an input whose
  record also changes. `deriveChanges` reads the same decomposition, so every such `iid` is among the `inputs` changes. No
  war or holiday writer runs inside the pass: the lw writes take the committing path, which tells nothing.
- **A pass joined into an admin's own command.** The gate is not consulted there at all: `ownershipViolation` runs it only
  for the system actor's `lw.postoutRun`. The resync inside a parent is harmless. The before-image and the rollback
  snapshot are taken at the first enlist, and the Delete path and `commitInputsWith` already resync there.
- **The two fixes need each other.** Without the resync, a stray input change would produce a no-maker input line, and
  the tightened gate would then refuse the Overseas Sqn / SANS pass every time. With the resync it is absorbed first.
- **The ring on Users.** The render-time state change is the supported React pattern: same component, guarded by
  `seq !== ringSeen`, so there is no loop. It survives StrictMode's double render, a tap while the Admin page is
  unmounted (`seq` starts at 1), and the first tap after mount (the ring arrives on the second render). The six-second
  effect, keyed on the ringing `seq`, survives StrictMode's mount, unmount and mount, a second tap, and leaving the page.
- **The midnight clock.** Production installs it once (`boot.ts`). It re-arms itself if wired again. On focus, page shown
  and visibility it calls `raptorNotify` only when the day has turned. A timer that fires a little early just re-arms one
  second later. A notify outside a command writes only what boot's own notify writes (the passes, as projections).

## Notes, most severe first

### 1. (Low-medium, incomplete) The pass's envelope rule still lets any schedule, input or plan change through. Only the in-app route is closed.
- **Steps:** build a `lw.postoutRun` envelope with the system actor that carries a real Overseas Sqn posting plus an
  `inputs/<another man's input>` or a `days/…` change. `postingPassViolation` passes it (`perms.ts` 1023–1124 never looks
  at `inputs`, `days`, `sched.*` or `plan`). For a Delete, a forged input change plus a no-maker line about that input
  also passes, because the line check only asks that the `iid` is among the changeset's input changes (`perms.ts` 1112).
  `at` (back- or forward-dated) and unknown keys on a line are still unchecked.
- **Cause:** the security read's finding 1, fix 2 (an allow-list by collection) and the `at` / key parts of its finding 2
  were not applied. Only the resync (fix 1) was. The resync closes the console route in this browser. But the rule exists
  so that "the database step can hold the same rule on the changeset", and as written that rule still allows any schedule
  change from the pass.
- **Fix:** in `postingPassViolation`, after `deletes` is known, refuse:
  - any change whose collection is not `lw.*`, `people`, `settings` or `notices`;
  - any `inputs`, `days`, `sched.*` or `plan` change, unless `deletes` is true.
  - Also refuse a notice whose keys are not a subset of `id, to, by, at, iid, name, day, what`, or whose
    `|at − Date.now()|` exceeds the existing stamp skew.

  **Caution — the one way this tightening could refuse a legitimate pass:** `applyEnd`'s housekeeping (`ensureRowIds`,
  `mintInpIds`, `mintOrd`) puts id-only or place-only changes into the pass whenever memory holds a row without an id.
  An input without an id also draws a `{k:'in'}` line, which the gate already refuses today in a non-Delete pass. Today
  every in-app path and every boot seed mints ids, so this needs an escape-site bug. To be safe, the allow-list should
  ignore a change whose only differences are `rid`, `iid` or `ord`. Add a red-first test: an Overseas Sqn envelope with an
  `inputs/*` change is refused. Name the rule in `data-model.md`'s posting-pass paragraph (D200).

### 2. (Low) The schedule half of fix (1) takes a stray change in but does not put it back: what is on screen and what is saved can part for good
- **Steps:** a schedule change sits in memory outside any command (an escape-site bug, or the console). A posting pass
  runs before the next scheduler command. `resyncSchedBaseline()` (`sync.ts` 2347) makes the starting point equal to
  memory. From then on, no command ever sees that change as its own. It stays drawn on screen, it is never saved, and it
  is gone at the next reload.
  - **Before this change:** the next scheduler command would have saved it under the wrong name.
  - **The twin, for comparison:** the roster's `revertUnsavedPeople()` puts memory back, so the screen shows what is
    saved.
- **Fix (if wanted):** mirror the roster. Add `revertUnsavedSched()` in `sched-commit.ts`
  (`if (!schedBaselineClean()) histRestore(baseline())`) and call it `if (own)` before the resync. Inside a parent, keep
  the plain resync. Only an escape site reaches this, so it is low.

### 3. (Low, tests) The midnight clock is armed in every test file that wires the Leave War and is never taken down
- **Cause:** `installPostingClock()` (`sync.ts` 2775) runs inside `wireLeaveWarSync`, which 72 test files call. Each run
  arms a real `setTimeout`, but measures the delay from the faked `Date`. It also adds three window listeners. No test
  teardown removes them; only the next `wireLeaveWarSync` call in the same file does.
- **Steps to a flaky test:** a test sets the fake clock to a few seconds before midnight with real timers, then calls
  `wireLeaveWarSync()`. Seconds later, in whatever test is running then, the timer fires. If that test has moved the fake
  date, `check()` sees a new day and calls `raptorNotify()`, and the posting and OIL passes run inside an unrelated test.
- **Fix:** export the uninstaller and call it in `test-setup.ts`'s `afterEach`. Or install the clock from `boot.ts`
  instead of from `wireLeaveWarSync`, and have the one midnight test call `installPostingClock` itself.

### 4. (Low, records) The gate is no longer "read off the envelope alone"
`postingPassViolation` now reads the live `ACCOUNTS_LIST` (`perms.ts` 1096). That is correct in the browser. At the
database step, the rule must instead read the User table as it stands after the changeset. Say so in `data-model.md`'s
posting-pass paragraph beside the `po` line rule, so the IT side does not write a changeset-only check that cannot tell
an admin from a member.

### 5. (Trivial) An old ring is applied again when the Users list is drawn anew under the same Admin page
- **Steps:** an admin taps a line about an archived man, then switches his member view on and off while on Admin.
- **Cause:** the Admin page keeps `ring` (seq N, `on:false`) after the six seconds. `UsersPanel` re-mounts with
  `ringSeen` 0 and applies it again (`UsersPanel.tsx` 419–423). The Archived fold opens by itself and the search is
  cleared. There is no ring, and nothing typed is lost.
- **Fix:** at the end of the six seconds, set `ring` to `null` instead of `{ …r, on:false }` (`AdminPage.tsx` 223). Nothing
  reads `ring` once it is off.

Not a finding (D56): nothing above lives only in stored demo data.
