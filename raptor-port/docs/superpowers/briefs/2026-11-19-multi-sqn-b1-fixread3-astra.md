# Fix read 3 — Astra's read (Codex, gpt-6-astra, read-only, 07:13–07:26 19 Nov 26)

Read of an exported copy of `claude/multi-sqn-b1-107` at `b322cad23` (the fixes `2b792ebc5..b322cad23`), brief `…-fixread3-brief.md`. Blind to the walk and to the other reader. Saved by the night coordinator after both readers had reported; the report below is unchanged.

---

The fixes are **not complete**. I found one remaining last-admin bypass and one notification regression. These are code-read findings; the host must run the proofs below before treating them as reproduced.

Reviewed the exported `b322cad23` tree against `2b792ebc5`. I changed no files and ran no tests. I did not open the other FIXREAD3 reader’s report or use a post-compaction handoff block.

**1. High — the automatic posting pass still misses future home dates and counts archived admins**

The strengthened last-admin check protects commands made by people, but explicitly skips the app’s system actor. The automatic posting pass therefore still uses the older account check.

Cause:

- [`perms.ts:1575`](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/fixread3/raptor-port/src/state/perms.ts:1575) returns immediately for the system actor.
- [`accounts.ts:290`](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/fixread3/raptor-port/src/state/accounts.ts:290) checks homes only today. Its default roster predicate at line 143 excludes deleted people and placeholders, but includes archived people.
- `sync.ts:2508` uses that older check through `lastAdminLock`; `runPoOutcomes` repeats it before applying the outcome. `suspendForPosting` uses it again.
- `postingPassViolation` checks the posting’s person, squadron and permitted changes, but does not supply the missing last-admin check.

Consequently, an automatic Overseas Sqn posting can remove the admin who is needed after another admin’s already-saved move. The same missing date check reaches automatic Delete through `deleteBlocked`.

This is an **incomplete fix**, not a new bypass introduced by `df17ee626`. It remains reachable with newly saved data. It is separate from the excluded refusal-wording issue.

**Exact host proof — future move**

Use the fresh two-world fixture from `src/leavewar/multi-sqn-job2-retract.test.ts`, including its fake clock, storage, sign-in helper and sync wiring. Add imports for `ACCOUNTS_LIST`, `runPoOutcomes` and `poHeldReason`.

Run this sequence in one test:

```ts
// Fixture starts on 15 Jul 2026.
signInAs('ad', 'a')
expect(updateAccount('acus9', { role: 'admin' })).toBeNull()

signInAs('ad9', 'a9')
expect(postOut('kes9', '2026-07-16', 'overseas')).toBe(true)

// Leave 149's war before the posting becomes due.
signInAs('ad', 'a')
expect(worldUnit()).toBe('u142')

vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
unitsLoad()

// Saves Osprey's move for 17 Jul, while Kestrel still protects 149.
expect(setHome('osp9', 'u142').ok).toBe(true)
expect(homeOn('osp9', '2026-07-17')).toBe('u142')
expect(ACCOUNTS_LIST.find(a => a.id === 'acad9')?.on).toBe(true)

// Loading 149 runs its now-due posting as the app.
signInAs('ad9', 'a9')
runPoOutcomes()

// Required: hold the posting whole.
expect((PEOPLE as any).kes9.archived).toBeFalsy()
expect(ACCOUNTS_LIST.find(a => a.id === 'acad9')?.on).toBe(true)
expect(getState().postOuts.kes9?.poDone).not.toBe('2026-07-16')
expect(poHeldReason('kes9', 'overseas', '2026-07-16'))
  .toEqual(expect.any(String))
```

The predicted failure is Kestrel archived and suspended, with the posting marked done. On 17 July, Osprey belongs to 142 and 149 has no active home admin.

The home move uses the exact existing `setHome` command; I am **not claiming that the unfinished move screen exposes it**. This is not a raw write outside every command.

**Second proof for the archived-admin half**

In a separate fresh fixture:

1. Promote Osprey to admin.
2. As Kestrel, schedule Kestrel’s Overseas Sqn posting for 16 July.
3. Return to Saber on 142 on 15 July.
4. Make this people-only command, leaving Osprey’s account enabled:

```ts
const r = commitPeopleIntent('person.archive', null, () => {
  Object.assign((PEOPLE as any).osp9, {
    archived: true,
    archivedBy: 'admin',
    archivedOn: '2026-07-15',
  })
}) as any
expect(r.ok).toBe(true)
```

5. Advance to 16 July and sign in as Kestrel to load 149.
6. Assert the same held-posting conditions above.

The predicted failure is that the posting counts archived Osprey as the remaining admin. This setup uses the same allowed people-only command shape already tested by `multi-sqn-job2-lock.test.ts`.

**Fix**

1. Share one before/after last-admin calculation between the commit check and posting preflight.
2. Exclude archived people from the **able-to-sign-in** calculation. Keep archived accounts loadable for Restore; do not indiscriminately change the account loader’s existence rule.
3. Check today and every future saved home boundary on both sides.
4. Apply that invariant to `lw.postoutRun` too.
5. Preflight before changing the person or account, and hold a refused posting whole without marking it done or announcing it.
6. Test Overseas Sqn and Delete, an ordinary successful posting, and two postings due together.

The governing requirements are D2184’s protection against later steps removing the remaining admin, and D306’s whole-posting hold.

**2. Medium — “Undo post out” now leaves a moved admin an unretracted notice**

The fix lets the originating squadron undo its posting, but deliberately omits every original recipient who has since moved squadron. Their original notice survives unchanged.

Cause:

- [`sync.ts:3098`](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/fixread3/raptor-port/src/leavewar/sync.ts:3098) filters those recipients out of the posting’s stored lines.
- `sync.ts:3114` repeats the exclusion during retraction.
- [`notices.ts:337`](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/fixread3/raptor-port/src/state/notices.ts:337) still shows their stored posting notice whenever they have scheduler access. It does not check whether that posting was taken back.

Hunter can therefore sign into 149 and still see “Posted out · now SANS” for Ranger after Outlaw has removed that posting and its SANS outcome.

This is **introduced by `013b695f8`**. It also affects changing a completed posting’s date or outcome, which uses the same retraction path.

D1693, D1699 and D1710 require unread notices to disappear and read notices to become a struck-through “taken back” notice. I found no ruling exempting a recipient who later moves. D2194 still requires a narrow correction tied to the original posting; it does not justify unrestricted access to the other squadron’s bell.

**Exact host proof — unread notice**

Using the existing retract fixture and its `setup(true)`:

```ts
setup(true)
const old = NOTICES.find(n =>
  n.to === 'prowler' &&
  n.what[0]?.k === 'po' &&
  n.what[0].who === 'bane'
)!
expect(old).toBeDefined()

expect(undoPostOut('bane')).toBe(true)
expect(getState().postOuts.bane?.to ?? null).toBeNull()
expect((PEOPLE as any).bane.san).toBeFalsy()

// Missing assertion in the existing regression test:
expect(NOTICES.some(n => n.id === old.id)).toBe(false)
```

The last assertion should fail today.

Then sign in as Hunter with `signInAs('ad2', 'a2')` and inspect `noticesFor('prowler')`. The original line must not reappear. Repeat after a reload retaining the saved stores.

**Read-notice variant**

In the fixture’s setup, immediately after creating Ranger’s posting and before moving Hunter:

1. Sign in as Hunter: `signInAs('ad2', 'a2')`.
2. Call `markNoticeRead(old.id)` and require `true`.
3. Return to Saber, then perform the existing move and sign in as Outlaw.
4. Undo the posting.

Require the old line to be absent and one matching `poback` notice to Hunter to exist, unread. Its rendered words must strike through the original posting result and say “taken back”.

Repeat with `postOut('bane', '2026-08-01', 'sans')` instead of Undo: moving the completed posting into the future owes the same retraction.

**Fix**

1. Find all notices belonging to the exact posting run being taken back, regardless of recipients’ current homes.
2. Add narrowly validated permission for that posting command to retract those original notices and produce their read-notice corrections.
3. Validate the posting, original recipient, date, outcome and run identity; reject unrelated foreign notices.
4. Remove the two home-membership exclusions.
5. Preserve the current protection against arbitrary foreign bell writes and foreign read-record changes.

**Month-jump review**

I found no clear self-sustaining loop. The landing helper avoids an unchanged scroll assignment, the layout effect consumes its anchor, and row-window capture depends on a changed row signature.

However, the new `edge` flag means **“within one pixel”**, not “landed by a jump”:

- `Matrix.tsx:2803` sets it purely from geometry.
- `Matrix.tsx:3243` then normalizes that anchor to the frozen edge.

Thus a manual position can also be adjusted. For example, with `scrollLeft = 1000` and the anchor 0.75px beneath the edge, a redraw with unchanged geometry computes `999`, moving the manually positioned grid by 1px. This is new, bounded behavior. I have not established a disruptive browser failure from it.

The existing 1,200ms jump grace period also remains active after a subsequent touch starts. That predates this change; the new edge branch can make corrections that previously fell below the one-pixel threshold.

**Exact browser inputs owed**

Use desktop Chromium at 1536×864 and phone WebKit at 390×844, then a real iPhone for inertia:

- From January, press September, March, December and September again. Measure the target first-day gap from the frozen edge immediately, at 120ms, 500ms and after filling finishes. Require the day to remain clear of the frozen columns without accumulated drift.
- Repeat at fractional grid zoom, including 85% and 115%, with a person whose posting boundary changes which rows appear.
- Press September, then start a sideways flick after 100ms, 400ms and 1,000ms. Repeat in both directions. Record whether an application scroll assignment interrupts the flick.
- Without pressing a month button, rest a day approximately 0.75px under the edge and 0.75px clear of it. Let left-side month pruning/growth occur. Record the same day’s position before and after correction.
- Open Approvals, request a date while the grid is hidden, return, and verify the deferred landing. Then request a newer date before returning and ensure the older request does not replay.
- Exercise Undo and Redo with their day already fully visible and then off-screen, preserving D670/D672.

If manual snapping is to be removed, carry explicit jump-anchor provenance and clear it on user scrolling; do not infer it solely from proximity.

**Other fixes: explicit negatives and limits**

| Area checked | Static result |
|---|---|
| Second-store war writes | I found no additional bypass in command allowlisting, loaded-world rejection, unit authorization or master-posting checks. Restore-as uses the allowed Restore command. |
| Input authority across dates | I found no additional gap in collecting saved home boundaries and checking both images. The sole-member exception remains separate from shared-input authority. |
| Member take-out | I found no additional bypass in the own-part comparison or verified Undo restoration. Unrelated changes do not gain the exception. |
| Cross-squadron input notices | I found no additional recipient escape in the named-people/filer restriction or wholly-holiday exception. |
| Bidding notices | Opening, closing and derived closing notices use the current-home audience. I found no further bidding-open/close defect. |
| Foreign deletion history | Request and ledger deletions carry the explicit foreign unit into history. I found no further omission in those changed paths. |
| History authorization | Both destination and viewed-unit authority are checked; the own-unit fallback covers an Undo line without a named person. I found no additional filing escape. |
| Approvals/access-request read records | I found no further cross-squadron omission in the added prefixes and account-to-person lookup. The excluded same-squadron issue remains outside this report. |

These are read conclusions, **not executed passes**. I did not prove every visible door, logout/reload cycle, Undo/Redo sequence or phone gesture. The host should put the new proofs in its scratch folder; the repository’s normal Vitest configuration includes only source-tree tests, so a scratch proof needs an explicit scratch configuration.

**Walk: NOT DONE — read-only code review; host reproduction and browser evidence remain owed.**  
**Rulings: none this session. No files changed, committed or pushed.**

