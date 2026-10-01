## 1. A roll-call

Static read-only review of `git diff 0d1a5e18..HEAD -- raptor-port/src`; no tests, build, or app were run.

### (i) Every place a week’s days come into memory or are read

| File and function | Status | Finding |
|---|---|---|
| `engine/overlay.ts` — `overlayDeletedWeek` | *has it* | Central read-time overlay strips deleted people from eligible working days, OIL switches, sign-offs, sign bindings, and parked drafts. Uses `deletedFrom` as the cutoff. |
| `state/store.ts` — `applyWeekModel` | *has it* | Applies the overlay to both restored weeks and pure-seed weeks before the model becomes live. |
| `state/store.ts` — boot/init path | *has it* | The no-stash boot path also reaches the overlay before displaying working days. |
| `state/person-delete.ts` — `applyDelete` deferred effect | *has it* | Overlays the already-loaded week after the delete commits, then moves the scheduler baseline and validates, without saving day rows. |
| `engine/weekstash.ts` — `stashDays` | *has it* | All readable saved working-week days pass through the overlay. Its cache-sensitive callers can include `deletedSig`. |
| `engine/weekctx.ts` — `bundle` | *has it* | Saved weeks use `stashDays`; pure-seed cache entries are cloned and overlaid on every read. Published positions replace the working day with the issued snapshot afterward. |
| `engine/weekctx.ts` — issued-day substitution in `bundle` | *must not, because issued versions are historical records* | Correctly substitutes the unmodified issued snapshot after working-copy overlay. |
| `ui/peek.ts` — `peekWeekHTML` | *has it* | Both saved and never-saved next-week previews are covered. The preview key includes `deletedSig`, so a warmed preview cannot survive a delete. |
| `engine/oilev.ts` — saved-week standing/ground lookup | *has it* | Reads saved working days through `stashDays`, rather than decoding raw week rows. |
| `engine/drafts.ts` — `draftSelect`, `loadVersionToWorkingCopy`, `leaveOut` | *has it* | Incoming plan/version days call `leaveOut`, which invokes `HOOKS.stripDeleted`; `state/person-delete.ts:stripDeletedFromDay` mutates the incoming day before installation. |
| `engine/drafts.ts` — issued version source passed into a working-copy load | *has it* | The immutable snapshot itself is untouched; deletion is applied only to the cloned working day. |
| `state/weekrows.ts` — row split/join/storage reconstruction | *must not, because this is storage serialization, not a working-day read* | Preserving the stored bytes is essential to the “no day write on delete” contract. Overlay occurs when the reconstructed working week is consumed. |
| `state/person-delete.ts` — `stashPreflight` | *must not, because it must inspect the real stored bytes* | It deliberately reads raw/unreadable/preserved weeks to decide whether deletion must be refused. Overlaying first would conceal unsafe data. |
| Leave War quarantine and roster-restore raw-week checks | *must not, because they inspect protection and recovery metadata* | They are not working-schedule render doors. |
| `leavewar/sync.ts` — stashed OIL/issued-week reader | *must not, because Leave War earnings come from frozen issued evidence* | It reads issued snapshots. Deleted-person eligibility is applied separately through the cutoff-aware credit filter. |
| Live board, pending, validation, CSV and print consumers of `DAYS` | *has it* | They consume the already-overlaid live model installed by `applyWeekModel` or the deferred delete effect. Published/issued export paths continue to use the frozen snapshot. |
| Planning calendar (`PLANPUCKS`) | *must not, because it is its own persisted model, not `ScheduleDay`* | `applyDelete` gaps the deleted ID in applicable planning rows directly. |
| Saved plans while not loaded | *must not, because there is no independent off-screen plan renderer* | They are stripped when selected or version-loaded through `leaveOut`/`HOOKS.stripDeleted`. |

No additional working-day read door bypassing the overlay was found.

### (ii) Every reader of an OIL per-man decision

| File and function | Status | Finding |
|---|---|---|
| `engine/oilev.ts` — `oilEvidence` | *has it* | This is the live derivation door. It copies `oild` and prunes handed-over/deleted/ineligible per-man decisions before deriving evidence. |
| `engine/oilev.ts` — `oilEvidenceOf` | *has it* | Working days rederive through `oilEvidence`; an issued day with frozen `oilev` returns that evidence unchanged. |
| `ui/oilmode.ts` — evidence/state helpers | *has it* | Puck state, item state, off reasons, sentinel and figures consume derived evidence rather than raw `oild.people`. |
| `ui/board.ts` / `ui/html.ts` — OIL rendering under `oilReadPass` | *has it* | Board/day rendering is scoped through the derived-evidence pass. |
| `ui/AvailWindow.tsx` — All Available OIL controls | *has it* | Display and interaction state use the same evidence/sentinel helpers. |
| `engine/publish.ts` — `daySnap`, `oilDelta`, pending/signing/discard derivation | *has it* | Publishing freezes pruned evidence; pending counts and signature validity compare derived live evidence with issued evidence. |
| `ui/pendlist.ts` — OIL pending rows | *has it* | Uses current derived evidence for the named crowd and delta. |
| `engine/validate.ts` — OIL validation | *has it* | Uses `oilEvidenceOf`, preserving the working-versus-issued distinction. |
| Saved working-plan preview after selection | *has it* | `liveDay` removes stale frozen `oilev`; the selected plan is then read through live derivation. |
| Issued version preview | *must not, because the version must show what was issued* | Uses frozen `oilev`; it must not re-prune because of a later hand-over or deletion. |
| `leavewar/sync.ts` — issued OIL credits | *must not, because latest issue pays until reissue* | Correctly consumes issued `oilev`, with deletion eligibility applied independently. |
| Oil Tracker’s Leave War ledger | *must not, because it is a financial/leave projection of issued evidence* | It must not change from a live hand-over alone. |
| `engine/overlay.ts` — `stripOilSwitches` | *must not, because this is mutation/cleanup, not a decision reader* | It removes a deleted person’s stored working-copy switches during overlay. |
| `ui/oilmode.ts` — `tidy` | *must not, because this is decision maintenance* | It is not an alternative display or accounting reader. |

No product reader of raw `oild.people` was found outside maintenance/overlay code.

### (iii) Every reader of the old filing marks

| File and function | Status | Finding |
|---|---|---|
| `engine/slots.ts` — Accept/Unavailable adoption paths | *has it* | These mutate `Input.acc` and ordinary edit history only; they no longer create `inp:*` pending marks. |
| `engine/publish.ts` — `filingDelta` | *has it* | Synthesizes current filing differences by comparing inputs with issued `fil`; it does not require stored `inp:*` marks. |
| `engine/publish.ts` — `dayDelta`, `dayPendingItems`, `dayShownPendCount` | *has it* | Pending count/list and published-day state include derived filing changes. |
| `engine/publish.ts` — `dayDiscardCount`, filing restore/rebase paths | *has it* | Loading/discarding against an issued baseline accounts for filing through snapshot comparison. |
| Sign binding/pending-key derivation | *has it* | The four sign-offs invalidate from the derived day delta, including filing changes. |
| `ui/pendlist.ts` — pending-list formatting | *has it* | It recognizes the synthesized filing address returned by `filingDelta`; this is not a stored mark. |
| Day head, board and AL panel pending surfaces | *has it* | They consume `dayPendingItems`/`dayShownPendCount`, so filing appears without raw marks. |
| Publish/reissue and Unpublish paths | *has it* | Reissue freezes current `fil`; Unpublish does not recreate marks, and later pending is still derived against the previous issued filing. |
| `engine/drafts.ts` — old `inp:*` preservation/skip guards | *must not, because these are compatibility guards for already-stored legacy data* | No current writer creates such marks. Stored-old-only behaviour is D56 and not a phase-6 finding. |
| Raw draft-mark discard — `discardableCount` / `discardPending` | *must not, because a member’s filing is not a scheduler draft mark* | Filing persists in the member-owned input row and is evaluated against the issued snapshot. |
| Never-published raw pending count | *must not, because there is no issued filing baseline* | A filing on an unissued day is current state, not a pending amendment. |
| Unavailable-panel tags and change-history dots | *must not, because they use the input/change log* | They do not need an `inp:*` schedule mark. |
| `inputActionCount` | *must not, because it has no product caller* | It is not a live read path. |

No new writer of old `inp:*` marks and no active product consumer dependent on them was found.

## 2. Numbered walk scenarios

Run every visual scenario once at desktop width and once at phone width. Use the weeks **13–19 July 2026** and **20–26 July 2026**. Unless stated otherwise, fix the clock at **Wednesday 15 July 2026**. Inspect storage by logical row key; `changes/<batch>` audit rows are allowed. Reload must not itself create a write.

1. **Posting-out command deletes a person while Leave War is active.**  
   **Start:** A person has future flying, duty, sim, passenger, ground, Common Programme, OIL, sign-off, input, planning-calendar and Leave War positions; posting-out date is 15 July. **Gestures:** Leave War → post the person out; advance/run the posting pass that performs deletion. **Right after/reload:** every working view from 15 July onward omits him, pre-cutoff history remains, Leave War shows the correct ended/gone state, and History has one line per removed seat/record. **Storage:** `people/<pid>`, his account/settings, affected `inputs/<iid>`, `plan/pp:<id>`, Leave War rows and `changes/<batch>` may change; no `days/<week>#<di>`, `sched.book/<week>#<di>`, issued-version or Unpublish row may change. **Wrong:** any future working seat survives reload, a past seat disappears, issued history changes, or a schedule row is written.

2. **Warm every off-screen cache before deleting.**  
   **Start:** The target appears in the saved 20–26 July week. First open its next-week peek, row-finder/cross-week result and any standing/OIL-derived preview, then return to 13–19 July. **Gestures:** Admin → Users → Delete account → confirm Delete account. **Right after/reload:** all warmed future previews lose the person immediately after notification and remain correct after reload. **Storage:** the deletion’s own records only; the saved week/day/book rows are byte-for-byte unchanged. **Wrong:** a stale preview remains, a preview changes only after manually visiting the week, or the saved week is rewritten.

3. **Delete across every live schedule seat and sign-off.**  
   **Start:** On 15–19 July place the target in both flying seats, a duty holder and extra, sim pilot/wingman/passenger/extra, ordinary ground holder/extra, Common Programme holder/extra, an OIL decision, and each sign-off role. **Gestures:** perform the two-step Admin deletion. **Right after/reload:** every future working occurrence and working sign-off is absent; unrelated people and empty-slot geometry remain stable. **Storage:** people/settings/input/plan/war/change rows only; no schedule day or book row. **Wrong:** one slot kind survives, an adjacent extra shifts incorrectly, sign-off remains, or any day/book row changes.

4. **Cutoff boundary with a spanning landed request and issued day.**  
   **Start:** A request begins before 15 July and ends afterward; its row is landed before and after the cutoff. Publish one affected day. **Gestures:** delete the holder with fixed date 15 July. **Right after/reload:** pre-cutoff working and issued history stays; post-cutoff working rows disappear; the retained part of the request does not become spuriously “taken off”; the issued face remains frozen. **Storage:** the input may be shortened/annotated, but no day/book/version row changes. **Wrong:** past data is removed, the issued snapshot is overlaid, the input is incorrectly parked, or a day write occurs.

5. **Delete from a never-saved future seed week.**  
   **Start:** Warm the 20–26 July preview without editing or saving that week; the seed places the target there. **Gestures:** delete the target from 13–19 July. **Right after/reload:** preview and later navigation use the pure seed minus the deleted person. **Storage:** no week or day row for 20–26 July is created. **Wrong:** deletion is invisible until a save, or merely viewing/reloading authors a week row.

6. **First scheduler edit after deletion becomes the only day write.**  
   **Start:** Complete scenario 3 and snapshot storage. **Gestures:** open one affected future day, make one ordinary scheduler change, press Done. **Right after/reload:** the deleted person remains absent and the new scheduler edit persists. **Storage:** exactly the edited `days/<week>#<di>` and any corresponding book/change row may now change; other days remain untouched. **Wrong:** deletion itself is attributed as the scheduler’s edit, all future days are saved, or the person returns.

7. **Undo and Redo cannot restore a deleted person.**  
   **Start:** Before deletion, create several ordinary edits that involve the target; then delete him. **Gestures:** press Undo repeatedly, then Redo. **Right after/reload:** blocked steps say the person has been deleted and are skipped; allowed unrelated steps still move; the person never returns to a future schedule, input, account, plan or Leave War record. **Storage:** no restore writes a prohibited person-bearing row; deletion remains outside global Undo. **Wrong:** Undo stalls permanently, revives any future occurrence/account, or silently alters extra records.

8. **Saved plan, issued version and template belt after deletion.**  
   **Start:** A future day has Plan A and Plan B, an issued version and a template, all containing the target. Delete him. **Gestures:** switch plans; load the issued version to the working copy; apply the template. **Right after/reload:** each incoming working copy leaves him out and names the deletion where the UI reports omitted rows; the historical issued preview itself remains unchanged. **Storage:** only the explicit plan/version/template operation may write its normal day/book rows; the prior delete wrote none. **Wrong:** a load resurrects him, the frozen issued version is modified, or stripping happens without the expected “left out” explanation.

9. **Published OIL refusal, holder A→B→A.**  
   **Start:** On an OIL-earning published day, request holder A has refused OIL; snapshot the resulting day row and issued evidence. Use an unlanded request so phase 6(c)’s landed-row relink is not involved. **Gestures:** edit the request holder A→B, then B→A. **Right after/reload:** A’s old refusal remains void; working OIL surfaces recalculate consistently; the issued face and Leave War/Oil Tracker credit remain frozen until reissue; pending count/list and all four sign-offs reflect the live-versus-issued OIL delta. **Storage:** each hand-over changes `inputs/<iid>` and `changes/<batch>` only; the snapshotted day/book/version rows remain unchanged. **Wrong:** A’s old refusal revives, screens disagree, issued credit changes before reissue, or a day row is written.

10. **Extra becomes holder, then leaves and returns.**  
    **Start:** Holder A and extra B; B has a per-man refusal stamped before any transfer. **Gestures:** hand the request A→B; then B→A; then A→B. **Right after/reload:** B’s refusal survives the first hand-over *to* B, becomes void when B leaves, and stays void when B returns. **Storage:** Input hand/left-at state and audit change only; no schedule row. **Wrong:** refusal is lost on first arrival, survives departure, or comes back on the second arrival.

11. **Decision made after hand-over, then Undo/Redo the hand-over.**  
    **Start:** A holds the request with no decision. **Gestures:** A→B; B makes the OIL refusal; Undo the hand-over; Redo it; reload. **Right after/reload:** whole-Input Undo restores the appropriate `hand`/`leftAt`; a refusal is valid only while its `pa` is not older than the holder’s departure stamp. All OIL surfaces agree after each gesture. **Storage:** hand-over writes only the Input/audit rows; B’s explicit OIL choice may write its normal day row. **Wrong:** Undo restores only the name but not handover history, or the decision’s validity differs after reload.

12. **OIL reader agreement sweep.**  
    **Start:** Combine holder, extra, blanket/item decisions, All Available sentinel membership, a deleted person and an issued baseline on one day. **Gestures:** open the board, OIL mode, All Available, Pending list, Publish/AL, history, Leave War and Oil Tracker in turn. **Right after/reload:** every working surface reports the same pruned crowd and pending delta; issued-version, Leave War and Oil Tracker surfaces report the same frozen issued crowd. **Storage:** merely opening these surfaces changes nothing. **Wrong:** any two live surfaces disagree, or a read mutates `oild`/`oilev` or storage.

13. **Published multi-day Unavailable filing.**  
    **Start:** Publish two days covered by one request; all four sign-offs are present. Sign in as the member. **Gestures:** edit the request to Unavailable, save, inspect both days, reload. **Right after/reload:** both published days show the derived filing pending item/count; no old pending tint/mark is required; all four sign-offs are invalid on affected days. **Storage:** `inputs/<iid>` plus `changes/<batch>` only; no `days`, `sched.book`, issued-version or Unpublish row. **Wrong:** only one day updates, a sign-off remains valid, a raw `inp:*` mark appears, or any day row changes.

14. **Filing removal and return to issued value.**  
    **Start:** A published request is filed as issued. **Gestures:** change it to Unavailable; Undo; Redo; then change it exactly back to the issued filing. **Right after/reload:** pending appears, disappears, returns, and finally disappears again; when back at issued value there is zero filing delta and no stale sign-off invalidation. **Storage:** Input/audit rows only throughout. **Wrong:** a stale pending item remains, Undo depends on a day mark, or a day row is written.

15. **New request removed, and dormant-at-issue request edited.**  
    **Start:** One published day; request X is created after issue, request Y existed but did not cover the issued day. **Gestures:** add X then take it off; extend/re-date Y onto the day then restore/delete that extension. **Right after/reload:** each returned-to-nothing sequence ends at zero pending, matching D174/D176. **Storage:** only affected Input/audit rows. **Wrong:** a ghost filing item/count remains or a stored `inp:*` mark is required to clear it.

16. **Scheduler Accept adopts a standing row.**  
    **Start:** A published day has an input-derived standing ground row whose filing differs from the issued snapshot. **Gestures:** scheduler opens the row and presses Accept; repeat with Unavailable where offered. **Right after/reload:** the pending list contains one combined row/filing item rather than duplicates; count, AL display and sign-offs agree. **Storage:** Input/audit rows only unless the explicitly excluded phase-6(c) landed-row relink executes. **Wrong:** duplicate pending entries, no filing delta, a newly stored `inp:*` mark, or an unexplained day write.

17. **Unpublish, edit filing, then republish.**  
    **Start:** Published day with a pending filing change. **Gestures:** Unpublish; inspect; edit the filing again; Publish/AL. **Right after/reload:** Unpublish creates no reopened `inp:*` mark; reissue freezes the current `fil`, clears the derived filing delta and gives a clean new baseline. **Storage:** Unpublish/issued rows change only for those explicit commands; the filing edit itself changes Input/audit rows and no day row. **Wrong:** Unpublish manufactures marks, pending survives an exact reissue, or the member edit writes schedule data.

18. **Load version or switch plan while member filing changed.**  
    **Start:** Publish a day, change a multi-day member filing, and prepare a saved plan/older version. **Gestures:** switch plan; load version to working copy; inspect every covered day. **Right after/reload:** the member’s current record is not silently overwritten except where the explicit version-load filing-restore contract applies; rows left out and cross-day moves are named; no duplicate request row appears. **Storage:** only the explicit plan/version command writes schedule rows; there is still no `inp:*` mark. **Wrong:** the request appears twice, a member change disappears silently, or pending count and list diverge.

19. **Two-client reload boundary. — TWO TABS REQUIRED.**  
    **Start:** Open the same account/week in tabs A and B. Warm B’s board, next-week peek and pending list. **Gestures:** in A perform one unlanded hand-over, one filing change, and a separate deletion; observe B without interaction, then reload B. **Right after/reload:** B is allowed to remain stale before reload because open clients do not reread shared storage; after reload it must show all three effects through the normal read doors. Reload itself writes nothing. **Storage:** hand-over/filing have Input/audit rows only; deletion has its own people/settings/input/plan/war/audit rows; none writes a day. **Wrong:** post-reload state is stale or reload authors schedule rows. Simultaneous write ordering, transaction conflict resolution and timed save fences are unit-model concerns, not provable by this browser walk and outside phase-6 group A.

20. **Permission and ownership matrix.**  
    **Start:** Prepare member, scheduler and admin accounts. **Gestures:** member attempts another person’s input/handover and deletion; scheduler performs OIL and Accept operations; admin deletes through Users. **Right after/reload:** unauthorized gestures are refused with no mutation; authorized member-owned Input, scheduler-owned schedule and admin-owned deletion operations affect only their promised records. **Storage:** refused actions change nothing; successful actions follow the row rules above. **Wrong:** a role crosses ownership boundaries, a refused action writes, or Input/admin actions acquire a day write.

For a landed request, `commitInputEdit` still performs the phase-6(c) row relink. Walks that intentionally exercise it must record that day write separately as the known step-(c) behaviour, not as a failure of (a).

## 3. Where a line is certainly missing already

None confirmed from reading.

The initially suspicious version/plan-load path is covered: `engine/drafts.ts:leaveOut` calls `HOOKS.stripDeleted`, installed by `state/person-delete.ts:stripDeletedFromDay`, before the incoming day becomes live. The raw Leave War OIL cache is also not missing deletion invalidation: it caches frozen issued evidence and applies the deletion cutoff outside that cache.

Accordingly, there are no responsible step-by-step code-fix instructions to give before a walk demonstrates an actual failing path.

## 4. Explicit negatives

- No production reader bypassing `oilEvidence`/`oilEvidenceOf` to display or calculate from raw `oild.people` was found.
- No current writer of old `inp:*` schedule-pending marks was found.
- No active screen was found that still requires such a mark for filing pending counts, lists or sign-off validity.
- No sixth durable working-day read door bypassing `overlayDeletedWeek` was found.
- No stale next-week preview path was found: its key includes `deletedSig`.
- No stale saved-ground lookup path was found: its memoization includes `deletedSig` and reads through `stashDays`.
- No stale pure-seed `weekctx` path was found: cached seeds are cloned and overlaid per read.
- No need to invalidate Leave War’s issued-OIL cache on deletion was found; issued evidence stays frozen and cutoff eligibility is evaluated separately.
- No delete-time write of saved or loaded schedule days was found in the phase-6(d) command mapping. The loaded model is changed only in the deferred overlay and the baseline is resynchronized.
- No issued-version overlay was found. Issued snapshots remain historical.
- No version/plan/template resurrection gap was found; incoming working days pass through the deletion hook.
- No plan-calendar omission was found; applicable `plan/pp:<id>` rows are updated directly because they are not `ScheduleDay`.
- No global-Undo route that is intended to reverse deletion was found; restore guards reject deleted-person resurrection.
- No defect is reported for the landed-row relink still writing a day during hand-over; that is explicitly deferred to phase 6(c).
- No D56 finding is reported for legacy stored `inp:*` marks alone.
- Phase 6(c), group B, phase 7 and requested plan diffs were not assessed.

## 5. Questions only the owner can answer

1. **Should the eventual acceptance walk require “no day row” for a hand-over whose request already has a landed row, despite the brief explicitly deferring that relink to phase 6(c)?**  
   **Recommendation:** No. Use an unlanded request for the phase-6(a) storage assertion, then run a separate landed-row observation and label its write as the known phase-6(c) exception. Otherwise the walk would deliberately fail behaviour the brief says not to report.

No other unresolved product choice was found. The two-tab stale-before-reload behaviour, issued-history preservation, delete cutoff, sign-off invalidation and member/scheduler ownership are settled by the supplied rulings rather than requiring owner selection.

