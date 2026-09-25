# Astra's blind code read — the amendment batch (25 Sep 26)

Astra (Codex), given the finished code and the evidence sheet, blind to Fable's read (bug-check order §4a, D67). Its report, unchanged. What was done about each finding: the evidence sheet §5a.

## Review result

Two concrete defects found, both **NEW in this batch** relative to `301a11fc`.

### 1. High — A removal plus an independent reorder is undercounted

[canonical.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/canonical.ts:432) emits an order unit only when nobody entered or left the list.

**Scenario**

- Setup: publish a row containing `[Warden, Reaper, Tally]`.
- Action: remove Reaper and independently reorder the survivors to `[Tally, Warden]`.
- Expected: **2 pending** — Reaper removed, plus the remaining crowd reordered.
- Disproof: `canonicalUnits` returns only Reaper’s removal. Every consumer therefore says **1**: day head, pending list, Amendments panel, discard confirmation, publish toast, and stored AL `units`.

The same loss occurs when the removed person is paired as a move to another row: line 439 returns before recording the surviving people’s reorder.

**Exact fix**

1. In `canonicalUnits`, derive an occurrence-stable sequence for each list—e.g. `warden#1`, `warden#2`—from the `was` and `now` maps.
2. Project both sequences onto their common multiset and compare those projected sequences. This distinguishes closing a gap from genuinely reordering the survivors and handles duplicate tokens.
3. Compute this independently of `myOff`/`myOn`.
4. After emitting removals, additions, or paired moves, append one `people` unit with `order: true` when the common-member order changed. Do this before the current all-events-paired return.
5. Add focused cases to [pendunits.test.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/pendunits.test.ts:113):
   - `[A,B,C] → [C,A]` is two units.
   - moving `B` elsewhere while changing `[A,C] → [C,A]` is one move plus one reorder.
   - `[A,B,C] → [A,C]` remains one removal.
6. Add a surface assertion beside [amendbatch.test.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/amendbatch.test.tsx:217) proving the day count, list rows, publish message, and stored `units` all say two.

### 2. Moderate — Multiple changed placeholder crowds collapse to the first row

[pendlist.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/pendlist.ts:153) correctly treats the OIL block as one pending item, but `crowdChange` aggregates every changed placeholder into one line, names only the first row plus “+ N more,” and returns only the first row’s jump keys.

**Scenario**

- Setup: publish a day containing two `ALL`/`ALL AVAIL` pucks on different rows.
- Action: availability changes alter the frozen crowd behind both pucks.
- Expected: the one OIL pending item exposes both exact row names, each row’s before/after people, and a working route to each place.
- Disproof: the list names `FIRST ROW + 1 more`, merges both personnel deltas, and tapping it can reach only `diff[0]`. The second change is neither identifiable nor reachable, so the scheduler must hunt for it.

The current focused test covers only one placeholder at [amendbatch.test.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/amendbatch.test.tsx:239).

**Exact fix**

1. Change `crowdChange` to return one detail object per changed item: `{where, from, to, keys}`. Do not flatten the people or discard later rows’ keys.
2. Keep the OIL block as one `PendItem`, preserving D109’s count.
3. Extend the pending-list word/render model so an item may carry multiple target details.
4. Render that OIL item as a non-button container with one child button per changed placeholder row; avoid nested buttons.
5. Store each child’s keys in a module-level target table and route `data-pltarget` through the existing `go(keys, di)` callback at [pendlist.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/pendlist.ts:246).
6. Reset that target table in `closePendList`.
7. Add a two-placeholder test asserting:
   - the header still says one change;
   - both row names and their separate personnel deltas appear;
   - both child controls exist;
   - each control supplies its own row keys to the jump callback.

## Explicit negatives

- **Signature binding:** `currentBind.pd`, `pendingKey`, `setSign`, and `signBoundOk` share the complete live delta. Content, filing, OIL membership, request-time, Quals, and posting changes invalidate all four signatures; a true revert restores them.
- **Other counting paths:** `dayPendingItems` is the shared body for visible pending counts, the Amendments panel, sign-off wording, publication, and stored AL `units`. Moves, swaps, pure list reorders, list leavers, separate holder/extras places, structural-row moves, filings, and OIL each reach it correctly outside finding 1.
- **Version loading:** `filingRestorePlan` restores ordinary same-day filing state, refuses to move a request shared with another loaded day, and `LOADLEFT`/`LOADMOVED` name the affected request paths. The forward, supported-data path satisfies D98.
- **Original signers:** `setDayApproved` freezes the Original’s four signers before clearing the live boxes; `verSigners` reads them from the version being shown; `retireIssued` preserves the retired record’s signers.
- **Signed-line surfaces and roles:** the version-specific line is present in the edit week, scheduler board, and View-only schedule; preview mode selects the previewed version, and members can read it without receiving signing controls.
- **Per-paint memo:** `publishReadPass` is confined to synchronous, non-mutating string builders and keys entries by day object. Snapshot swaps therefore cannot reuse a live-day result, and no writer runs inside a pass.
- **Template refusal:** `applyDayTpl` supplies the engine backstop; `pickDayTpl` refuses before arming; both week and board use the same disabled menu with the reason visible.
- **Puck marks and warning rings:** the schedule-seat renderers in the week and board use the shared mark body; amendment state is a solid/hollow corner tag, while sanctioned and cause-day warnings retain dashed/dotted rings.
- **Pending/history navigation:** preview is cleared before jumping; Edit Schedule stays on the week, the board stays on the board, phone week navigation selects the day, and missing targets produce an on-screen notice.
- **Overlay order:** the pending window scrolls internally, closes when the underlying page scrolls, and the history bubble’s overflow list retains pointer access.
- **Known questions not reported:** same-seat replacement counting and accepted-request row-plus-filing counting remain the recorded owner questions.
- **D56 applied:** no migration or pre-existing demo-record issue is reported.

I made no file changes and did not run any test, build, or gate. The pre-existing modification to `.claude/skill-observations/log.md` was left untouched. Real iPhone keyboard behavior remains runtime-unverified, as already stated in the evidence sheet.

