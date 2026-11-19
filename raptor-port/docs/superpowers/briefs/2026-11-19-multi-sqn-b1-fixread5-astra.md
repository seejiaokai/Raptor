# Fix read 5 — Astra's read (Codex, gpt-6-astra, read-only, 19 Nov 26)

On its own exported copy at `5d0e3f2f3`, the brief without its security-reader paragraph (the first run was refused by the service as a "cybersecurity risk"). Saved whole by chat 111, unread by the host — NOT yet reproduced.

---

Not cleared. Three reproducible defects remain, all medium severity.

I reviewed the exported copy identified in the brief. Each finding below has a failing assertion run against the actual application code in memory. No files were changed. The prohibited handoff, backlog and other current-review reports were not opened; no post-compaction handoff was used.

**1. An admin can still falsify who placed his approved leave on another squadron’s days.**

**Failing proof:** On 15 July, Hunter belongs to 142, with a saved move to 149 effective 16 July. His own LL covers 20–22 July. After 149’s admin records its approval, Hunter changes only its approval-placement fields to `lwBy: 'osp9', lwAt: 1` through `writeInputsBatch`.

Expected: refusal. Actual: the save succeeds and stores both false values. This exercises the save command and permission check; these fields are not exposed by an ordinary form.

**Cause:** The new [own-input check](C:/Users/User/AppData/Local/Temp/claude/a64a38883e9f868e/063f7df9-6937-443e-902e-a7f2109db270/scratchpad/fr5-astra/raptor-port/src/state/perms.ts:1337) calls `inputBreach`, but the member’s protection for these two fields remains separate at lines 1964–1977, below the admin’s early return. The false attribution can subsequently be carried back into a Leave War request.

**Exact fix:**

1. Extract the placement-stamp validation into a shared check.
2. Apply it both to members and to an admin’s own input where he lacks authority over its days.
3. Preserve legitimate unchanged/removed stamps, split pieces carrying their parent’s stamp, and verified Undo/Redo images.
4. Add this failing case before and after the move, including a span across it.

**Introduced here?** No: this is a remaining hole in the earlier own-admin exception. Claim 1 does not completely repair it.

**2. Redo fails for a personal leave decision after its recipient moves.**

**Failing proof:** Kestrel refuses Osprey’s LL request on 15 July. Osprey reads the decision, then moves from 149 to 142 effective 16 July. The personal notice correctly remains visible. Kestrel’s Undo succeeds, returning the request to pending; Redo then fails with “That couldn’t be completed just now,” leaving it pending.

Expected: Redo restores Kestrel’s own decision and its personal notice. Actual: `redo.ok` is false. The otherwise identical no-move control passes.

Undo also produces no correction for the personal notice Osprey already read.

**Cause:** The [verified-replay exception](C:/Users/User/AppData/Local/Temp/claude/a64a38883e9f868e/063f7df9-6937-443e-902e-a7f2109db270/scratchpad/fr5-astra/raptor-port/src/state/perms.ts:1874) now allows deletes only. `leaveOut` correctly retains this personal notice, but restoring it fails the foreign-recipient check and rejects the whole Redo. Separately, the reversal writer’s home-only filter at `sync.ts:1642` suppresses the personal correction.

**Exact fix:**

1. Keep the authentic timeline, actor, exact-image and conflict checks.
2. Permit an authenticated restore of an original personal notice that D2218 says follows its recipient; continue excluding retired squadron-business notices.
3. Make personal reversal corrections follow that same distinction, with narrowly verified reversal authority at the permission check.
4. Test a refused request with no accompanying input change, so another exception cannot conceal this failure. Retain forged-restore refusal tests.

**Introduced here?** The Redo refusal is introduced by the delete-only restriction. The missing personal correction comes from the older home-only filter.

**3. Returning to a squadron lets a permanently retired posting notice reappear as “taken back.”**

**Failing proof:** Hunter reads 142’s notice about Ranger’s SANS posting. Hunter moves to 149 on 16 July, then returns to 142 on 17 July. The original notice remains correctly hidden. Another 142 admin then takes back Ranger’s posting.

Expected under D2218: that retired line is never subsequently struck “taken back.” Actual: Hunter receives one fresh, unread posting-taken-back notice. The assertion expecting zero fails while `noticeLeftBell(original)` remains true.

**Cause:** [Posting take-back selection](C:/Users/User/AppData/Local/Temp/claude/a64a38883e9f868e/063f7df9-6937-443e-902e-a7f2109db270/scratchpad/fr5-astra/raptor-port/src/leavewar/sync.ts:3101) and retraction at line 3117 check only today’s home. Returning makes that check pass; the newly dated correction then passes the bell’s read rule.

**Exact fix:**

1. Continue using all stored posting facts to identify the newest posting run.
2. After identifying that run, exclude each original notice permanently retired by `noticeLeftBell` before deleting it or writing its correction.
3. Apply the equivalent history-aware eligibility to Leave War reversals.
4. Test read and unread notices through move-away/return and two-move histories, retaining personal and never-moved controls.

Do not substitute the full viewer-dependent `noticeLive` filter for the writer’s stored facts.

**Introduced here?** This is an incomplete implementation of the newly adopted D2218 retirement rule; the current-home-only approach leaves the return route open.

**Answers to the four questions**

1. **Completeness:** Partial. Bell lists, both unread displays, mark-all-read and individual read marking use the shared rule. Taps start from filtered rows, but `openNotice` does not independently recheck visibility; stale-tap behaviour is not cleared by this review. Storage, history and permission checks retain raw facts rather than wrongly hiding them. The three failures above prevent clearing all doors.

2. **Narrow exceptions:** The authenticated replay checks remain narrow. Forged foreign-notice additions, replacements and deletions were refused, including commands merely claiming to be restores. `leaveOut` is restricted to notice puts with an after-image; it does not discard non-notice changes, deletes, personal notices or notices whose holders never moved. However, the input exception still misses one member rule, and the replay exception is too restrictive for personal notices.

3. **D2218 timing and identity:** Thirteen focused read-rule cases passed: before/effective move day, no move, personal input/leave/correction/posting lines, non-personal posting/bidding/holiday lines, a line written on the move day, return and second-move histories. Read status does not change the retirement decision. The writer failure in finding 3 defeats permanent retirement downstream. Master-admin delivery with a chosen squadron enabled was not established.

4. **Regressions:** Thirty-six prohibited input mutations were refused across before/after/spanning-move cases. Ordinary remarks, current-home admin cancellation, master cancellation and no-move personal Undo/Redo controls passed. Actor verification and protection against overwriting another person’s newer change remain intact.

   Claim 5 produced no concrete defect: twelve existing anchoring cases and 120 additional scroll combinations passed, alongside targeted landing and handler checks. These used controlled geometry, not a rendered browser. Desktop/phone scrolling, browser rounding and touch inertia remain unverified. The full posting pass and D2215 transfer take-back delivery to both squadrons were not exercised; this report does not clear them.

Tidiness: the failures expose two split decisions—member input validation and reversal-recipient eligibility. Consolidate those while repairing the defects; no unrelated cleanup is proposed.

Rulings: none added.
