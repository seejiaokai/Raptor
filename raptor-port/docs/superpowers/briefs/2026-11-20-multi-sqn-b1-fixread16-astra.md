# Fix read 16 — Astra's report (blind; copy at `078bc2f7e`)

Reader: GPT-6 Astra (D1770, D2210), run by chat 123 as `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only --skip-git-repo-check` on its own exported copy of `078bc2f7e`, brief `2026-11-20-multi-sqn-b1-fixread16-brief.md`; blind to the other three readers and to the builder's report; started 13:49:30, ended 14:03:42, exit 0 — **finished whole, not stopped**. Its last message as returned:

---

**One new finding: legitimate Leave War actions can be silently rolled back.** Introduced by `5f6e3f5df`. The fixes are not ready to clear this read.

**1. Medium — separate morning and afternoon leaves are mistaken for a join**

**Proved input and actions**

With today set to 15 July 2026:

1. Hunter approves Ranger’s morning LL on 27 July, with remarks **“morning”**.
2. Hunter separately approves Ranger’s afternoon LL that day, with remarks **“afternoon”**.
3. Saber selects the afternoon leave and uses **Delete**, **Refuse**, **Back to bid**, or **Move** to 28 July.

**Expected:** the selected afternoon leave changes as requested; the morning leave remains unchanged. Nobody receives a remarks-change notification because nobody edited remarks.

**Observed:** all four actions are rolled back. Both approved leaves remain on 27 July. Move nevertheless returns **“moved”**. No notification survives the rollback.

These are red assertions against the production commands, run in memory. I traced Delete to the production day-list button; this is not dependent on a fabricated command.

**Cause:** the new `foldedInto` test matches war, leave type, people and calendar dates, but ignores whether the leave is morning, afternoon or all day. It treats the removed afternoon leave as folded into the unchanged morning leave. The notification pass then invents a remarks change from “afternoon” to “morning”. The commit check correctly rejects that notification because the morning record never changed, rejecting the entire action.

This answers the brief’s specific concern: a record removed for another reason can be mistaken for a fold, and the notification pass and commit check can disagree.

**Exact repair**

1. Require matching all-day status and half-day designation when identifying folded leaves, matching the actual approval-join conditions:
   - `!!x.allday === !!a.allday`
   - `(x.half ?? '') === (a.half ?? '')`
2. Keep this definition shared by notification generation and the commit check. Do not relax the check to accept the invented notification.
3. Add separate regression cases for Delete, Refuse, Back to bid and Move with the input above. Assert the resulting leave state, unchanged morning remarks, and absence of remarks notifications.
4. Retain the genuine bridge tests, including unchanged remarks and notification deduplication.

With those two matching conditions applied **only to the in-memory bundle**, Delete passed; Move passed, including the afternoon leave appearing on 28 July. The existing genuine two-leave bridge also passed. No source file was changed.

**Coverage and where the promise must hold**

I started with the specialised Leave War surfaces, then traced their shared writers and consumers.

| Surface and qualifying objects | Visible sign and working gesture |
|---|---|
| Leave War day list: separate morning, afternoon and all-day approved leaves | Each selected leave must independently support its permitted decision, deletion and move. **Finding above.** |
| Leave War day/range windows, approvals and remarks | Approve, join, cut and move must leave the correct dates and words visible. Notifications about a folded record must open the surviving leave. |
| Member leave/request windows, including people represented within a shared input | A member can make permitted edits to their own part; that gesture must not change a scheduler’s Ground, Unavailable or Removed filing. |
| Inputs and schedule: ordinary requests, leave, Medical/SANS and their filing states | The input and schedule must agree about placement. Loading a week and editing remarks must not manufacture a placement change in history. |
| Admin → Users and Quals: member, administrator and master actions | Permitted edits remain usable; deleted people cannot be restored through an unrelated edit or Undo. Retained historical rows remain marked appropriately. |
| Undo/Redo and published-day working copies | Only the actor’s changes are reversed. Scheduler placement and deletion restrictions survive restoration and subsequent edits. |
| Bell list, unread count and opening a line | Recipients follow the person, input days and applicable squadron rules; retired lines stay retired. Genuine join notifications point to the surviving input. |
| Saved-copy loading, seeding, command capture, notification generation and commit checks | These have no separate user-facing door. Their outcome must agree at the initiating window, history and bell; rejected work must not appear successful. |

The ordering risks examined included placement → member edit → Undo/Redo; approval → join/cut/move; filing → squadron move → remarks change; moving together or away and back; deletion → restoration attempt; and saved-copy seeding → local edit → Undo.

**Judgment of the builder’s four choices**

- **Restricted landing copy — supported on the paths examined.** The week-load/reconciliation writers use Ground or no automatic mark and preserve Unavailable/Removed. I found no production writer setting `odGround` outside a command. The saved Removed protections, honest scheduler edit/Undo and Ground landing controls passed. I found no concrete new history or published-working-copy fault.
- **Fold identification — wrong as implemented.** Matching calendar dates is insufficient; the confirmed counterexample is above. Genuine two-leave bridges passed, including unchanged remarks. An additional three-leave bridge spanning 27–31 July passed and told the folded leaves’ filer once.
- **Absent before-image — supported within the built saved-copy lifecycle.** The never-saved input’s accepted edit now undoes as a creation and redoes correctly. Seeded-record controls passed. I found no demonstrated deletion of an already-saved record caused by this change. The excluded remote-memory-only case was not reported.
- **Cloning and account lookup — no concrete regression found.** `structuredClone` differs from JSON copying for the listed special values, but I found no reachable production foreign-world path supplying those values: the persisted world is read from JSON. The account map retains the first account for an identifier, matching the former lookup; account loading filters invalid identifiers and handles duplicates. This is a source-trace conclusion, not proof for arbitrary injected objects.

**Other ranked failure scenarios and explicit negatives**

1. **Scheduler filing overwritten through edit/Undo:** would fail if Removed/Unavailable changed or disappeared. The relevant protections and honest controls passed.
2. **Wrong-squadron bell disclosure or missing entitled filer:** would fail if a moved filer retained unrelated lines, or an eligible current administrator lost notification. The D2228/D2223/D2225 and move-day retirement cases passed.
3. **Made-up record, forged mark or deleted-person restoration:** would fail if the write or restoration survived the commit check. The exercised saved-row, ownership and deletion protections passed.
4. **Legitimate creation cannot undo/redo:** would fail if Undo left the never-saved creation behind or Redo restored its rejected mark. The corrected case passed.

I found no additional concrete violation of D1388, D148 or D350 in those checks. These negatives do not clear the half-day failure.

**Verification limits:** native Vitest was blocked by temporary-folder permissions before running tests. I replayed the **134 cases from fix reads 11–15** against bundled production code using an in-memory assertion runner; affected setup cases were rerun in fresh processes. This is not a native Vitest suite pass. I did not execute the complete fix-read 7–10 files or perform a browser walk. No files were changed. No post-compaction handoff was used.

Rulings: none this session.