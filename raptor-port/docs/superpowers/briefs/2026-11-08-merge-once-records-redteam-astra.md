# [MERGE-ONCE-RECORDS] — the plan's red team, Astra's read (8 Nov 26, chat 33)

Model gpt-6-astra, reasoning high, read-only; brief: `2026-11-08-merge-once-records-redteam-brief.md`. Its final answer, word for word.

---

1. P1 — Choosing handoff blocks by branch ownership can silently discard current instructions or revive finished work.

Failure and proof: in merge ef3ea32f0, the branch is claude/chat27-merge-once-go, but its updated block is marked claude/chat19-checks. Main still has the older block. Matching “this branch’s own block” to the branch name would discard that update. In merge a0e73ab56, the branch legitimately removed the finished People page block while main retained it unchanged. Taking main’s version would revive it. I compared the base, both parents and committed results.

Cause: a branch name does not identify every legitimate edit. Successor chats, records branches and the proposed combined branch break that assumption. The document check verifies block shape and duplicate markers, not preservation of their contents.

Exact plan change: merge each block against the common base. Preserve a one-sided addition, edit or deletion; accept identical changes; leave competing changes and edit-versus-delete cases unresolved. Never infer ownership from the current branch name. Preserve completed hand edits and apply the same three-way rule to text outside the blocks. Explicitly handle ordering and renamed markers.

2. P1 — A clean union merge bypasses the step that repairs duplicate skill-note numbers.

Failure and proof: merge 52de38189 has two different Observation 881 entries: the branch’s timing lesson and main’s missing-ruling-mark lesson. The read-only merge-tree replay shows their collision. The committed resolution keeps main’s 881 and renumbers the branch’s entry to 892. This merge’s reported conflict was the skill log alone. Union would remove that conflict, allowing the merge to complete without the proposed “run after Git stops” step.

Cause: part 1 removes the trigger for part 2. Neither docsize nor rulecheck checks skill-note number uniqueness.

Exact plan change: require record validation on clean merges too, before committing. Use a controlled merge with --no-commit and run the helper regardless of Git’s conflict result. Add an always-running check for complete, uniquely numbered skill entries. Cover cherry-pick, revert and rebase paths too, or keep union off these files: Git documents that merge attributes also affect commands beyond ordinary merges. [Git’s attribute documentation](https://git-scm.com/docs/gitattributes)

3. P1 — The skill log and walk ledger are not add-only files.

Failure and proof: commit 12167eb77 rewrites the Tracker’s existing walk-ledger row, changing its double-click fault from open to fixed and adding the successful re-walk. Earlier commits 473b69a6a and eba7eceb4 also edit that same row. The skill guide explicitly requires status changes, dated additions to existing entries and removal of resolved entries into the archive after review.

If two branches update that ledger row, union can retain two contradictory versions without a conflict. If one reviews and archives a skill entry while another updates it, the live entry can be revived beside its archived copy. Existing checks do not establish uniqueness or reconcile meaning for either record type.

Cause: the plan excludes full ruling rows because they are edited, but overlooks the same property in two selected files.

Exact plan change: remove unconditional union from the skill log and walk ledger. Merge whole entries against their base, including the skill archive when an entry moves. Automatically combine distinct additions only; leave competing edits and edit-versus-archive cases for the chat. For the remaining archives, test complete entries and their attachment to headings, not just retained lines.

4. P1 — Renumbering “past main’s highest” can reuse a number or redirect a reference to the wrong note.

Failure and proof: before merge 52de38189, main’s highest skill number was 883, while the branch already held 884 and 891. Starting above main’s highest is therefore insufficient. The real resolution chose 892. Both sides also used 881 for different subjects, so replacing references to “881” throughout the merged files cannot tell which lesson a reference means.

Cause: numbers are treated as identities before their collisions have been resolved. The plan does not define branch provenance, repeated-run behaviour or how references in already-pushed commits remain understandable.

Exact plan change: identify entries from both parents and the base before renumbering. Allocate beyond all retained and archived numbers, checking other branches as the existing guide requires. Produce a mapping that includes source branch, original number and entry title. Change only references whose source is established; leave ambiguous references for review. Record old-to-new aliases for immutable historical references. A second run with unchanged inputs must make no further changes.

5. P2 — The existing rulings command does not rebuild a conflicted map by itself, and it changes more than the map.

Failure and proof: the map section of backlog-archive.mjs updates the final column of each existing map row. Given conflict markers and two versions of a row, it does not construct one clean table or remove the markers. Its ordinary --rulings mode also converts full rows, moves them between areas, retires marked rulings and changes the archive.

Cause: part 2 treats a general filing operation as a map-only formatter. Adding --merge is not a drop-in correction: that mode reads parent versions, refuses unrelated unresolved files and can deliberately leave written results when its check fails.

Exact plan change: provide a map-only operation that consumes already-resolved ruling files and produces exactly one row per area. Merge the map’s descriptive columns and surrounding instructions separately. It must not retire, move or rewrite rulings. Keep the existing rulings merge as an explicit, separate operation where required.

6. P2 — Rolling everything back on any failed check prevents useful partial resolution and leaves recovery underspecified.

Failure: the helper settles the handoff but leaves a competing ruling or backlog edit for the chat, as promised. The subsequent whole-document check fails on that unresolved material, so the helper removes its successful work. Re-running it after a hand edit can reconstruct the handoff from the parents and erase that edit. An unrelated pre-existing check failure produces the same dead end.

Proof: the existing rulings merger already documents this exact problem. Its merge mode retains its result after a failed inventory check because otherwise the remaining hand work cannot be completed.

Exact plan change: separate resolution from final validation. Preserve safe resolutions and print the precise unresolved work; only declare success after all final checks pass. Snapshot original working-file bytes and index state before writing, including newly created files. Define rollback for write failures and invalid generated results, plus interrupted-run recovery. Re-runs must preserve intervening hand edits. Pre-existing failures must be reported distinctly and must never be silently waived.

7. P1 — Keeping only the newer gate count can lose the other count instead of archiving it.

Failure: two branches replace the same baseline with different newly observed runs. Each archives the old common count. Selecting the newer result leaves the losing branch’s new count nowhere in the merged documents.

Cause: the plan specifies which count stays but omits D1733’s requirement that the displaced count moves whole into its archive. “Newer” is also undefined; a later commit can describe an older run.

Exact plan change: compare recorded run times and preserve each run’s tested revision and scope. Archive every displaced distinct count whole, exactly once. If the records do not establish their order, leave the choice unresolved. Add a check that every baseline from either parent survives in the current section or archive.

8. P2 — “Keep added rows” does not define safe handling of the actual file map and priority list.

Failure and proof: the file map begins with dated prose paragraphs containing many file names, not just table rows. The backlog’s priority list uses item IDs, area headings and ordering that agents explicitly change. A row removed when an item closes must not return because another branch changed its wording; moving an item must not create a second copy.

Cause: the plan identifies competing edits but does not define record identity, moves or delete-versus-edit handling. The document inventory checks backlog item bodies; it does not establish that the priority list faithfully represents them.

Exact plan change: key priority entries by their stable item IDs, checking each against the resolved live backlog. Handle moves and deletion explicitly; leave competing placement or wording changes unresolved. For the file map, recognise its prose blocks as well as tables, using explicit boundaries where needed. Leave unsupported shapes untouched and report them. A smaller first version that handles independent additions only is safer than inferring identity from similar lines.

9. P2 — The combined-branch procedure lacks an explicit approval and ownership handover.

Failure: jobs A and B await approval in different chats. A coordinator combines them and closes both original pull requests. The owner then approves A in its original chat. That instruction neither identifies the combined preview nor authorises B; A’s chat also has a closed pull request to act on. Combining the branches after their separate approvals introduces another push and potentially new conflict resolutions.

Cause: part 3 does not reconcile batching with the existing own-chat merge instruction, D1742’s push-before-look order or D1746’s renewed-look requirement when settling a clash changes a job’s app code.

Exact plan change: freeze the included branch revisions and obtain an explicit ownership handover from their chats. Build and check the combined branch before asking for its approval. Show its preview and included-job list, and obtain “merge live” for that concrete batch in the chat that will merge it. Preserve standing auto-merge authority only within its original scope. Keep the original pull requests until the replacement is green and responsibility has transferred. Then use the existing lock and fresh level check, and confirm Production. Classify notes-only permission against the entire batch, including its working guides.

10. P2 — The replay’s pass condition cannot distinguish record preservation from reproducing manual mistakes.

Failure and proof: merge a3bb57b3e contains handoff text different from both parents. A deterministic merger cannot reproduce those newly written facts from its inputs. Conversely, a result can contain every expected line yet attach a skill note’s fields to the wrong heading. The proposed renumbering also intentionally changes lines.

The corpus is not reproducible from the date command alone: an explicit Singapore-day range currently finds 143 merges, while the plan’s earlier snapshot contained 113.

Exact plan change: commit the exact merge and parent list for the original 66 cases, with expected outcomes by record. Separate automatic resolution from legitimate editorial changes made during the historical merge. Check identities, complete contents, deletions, archive moves, reference targets and ordering. A safe refusal should pass the safety test but count as unresolved when measuring time saved. Add clean-merge, repeated-run, interrupted-write, line-ending and ambiguous-reference cases. Test GitHub’s handling separately; local merge-tree results do not establish hosted behaviour, and conflicted pull requests do not run pull_request workflows. [GitHub’s workflow documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

Checked and sound:

- D1930 authorises all three parts, with the red team first and this build’s own “merge live” still required.
- Excluding full ruling rows from union is correct.
- Preserving the existing LF settings is correct; merge settings must be added alongside them.
- The workflow confirms that a .gitattributes change runs the full checks.
- One combined pull request into main fits D822, provided each job retains its evidence and the approval handover above is explicit.
- This was a read-only review. I compared selected real merge parents and results and replayed the skill-log collision with merge-tree. I did not complete the 66-case replay or test GitHub’s server-side merge behaviour. No repository files changed.

Rulings: none this session.