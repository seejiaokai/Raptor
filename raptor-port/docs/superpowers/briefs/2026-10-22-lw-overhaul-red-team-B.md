# Red team of the Leave War overhaul — reader B, the what-ifs (22 Oct 26)

A fresh Opus reader who drew and ruled none of it. "Run" means tried in a throwaway test against the real stores (clock
15 Jan 26, demo squadron); nothing in the repo changed but this file.

## Findings, most serious first

**1. The bell will tell a member twice, once wrongly.** *Screen:* the bell after an admin puts back, moves or deletes
his approved leave. Run: approve Ranger's 10–11 Feb LL, put 10 Feb back — his bell already says "LL — dates now 11 Feb ·
Saber"; delete 11 Feb — "deleted". D1142's war lines would come on top. *Cause:* `state/notices.ts noticePass` skips only
a NEW war-approved input; the war's door (`sync.ts doorDecideApproved/RemoveApproved/MoveApproved` → `writeInputsBatch`)
reaches `state/sched-commit.ts tellPass`. *Fix:* while `sync.ts inDoor()`, `noticePass` skips `lw` inputs and the war
writes its own line; Inputs-page changes keep telling him (test R36 holds).

**2. "Nothing open until he opens it" is the opposite of the code's default.** Run: with no window set, a member's bid
on 11 Nov was written. `engine/wars.ts makeWar` makes `bidFrom/bidTo: null`, and `engine/period.ts inBidWindow` reads
null as the whole year open. A list of open stretches read the same way opens everything when empty. *Fix:* empty means
closed; one predicate replaces `inBidWindow` in `canEditCell`, `ui/Matrix.tsx lockedCols`, `measureBidBox` and the
landing day; a test pins "a new period takes no member bid".

**3. A day's openness is asked of the period on screen, the bid written into the period holding the date.** Run: on
2026, a member's range 30 Dec – 5 Jan wrote all seven days, five into the 2027 draft. *Cause:* `state/store.ts
cellProblem / setCell / clearRecordById` call `canEditCell(state.period, …)`; `listAt/putList` use `warHolding`. *Fix:*
ask `warHolding(wars, date).period`, here and in finding 8.

**4. A waiting bid on a day since closed cannot be withdrawn, and the note points the wrong way.** Run: Ranger bids
20 Mar, the admin closes March, his delete is skipped. D1176's note sends him to the Inputs page, where no bid exists.
*Cause:* `clearRecordById`, `writeMany` require `canEditCell`. **Question for him:** may he delete his own waiting bid on
a closed day? *Recommended: yes* (it gives leave back, raises manning); that day's note: "Your bid waits for a decision.
Delete it if you no longer want it."

**5. Past days can be bid on.** Run: on 15 Jan a member's bid on 5 Jan was written; D1168's month button opens the
current month from its first day. Round 3's table said "not yet past"; D1177 does not. **Question for him:**
*recommended:* a member never bids before today; the admin may.

**6. A member's own balance edit (D1203) would be refused, unrecorded and unguarded.** (a) It is saved as `lw.opening`,
which `state/perms.ts ownershipViolation` refuses for every member, so it rolls back; (b) `state/changelines.ts` reads no
`lw.opening`, so D1203's "in the change history with who" does not happen; (c) run: `setBalance(…, 12.3)` accepted — the
half-days rule (`HALF_STEP_MSG`) misses this door. *Fix:* a member may write only `lw.opening/<his id>:*`, only while the
lock (read at commit, not from the open window) is off — his Undo after the lock refused alike; a history line "LVE
balance 18 → 20 · Ranger"; `setBalance` refuses non-halves.

**7. What does a member type into "left"?** "Left" already subtracts his waiting bids (D1153). Copying his official
balance (which knows no bids), he types 20 and his 5 waiting days are silently given back; refused, he shows 25. And
"N used" counts every period ever (`engine/counters.ts drawnFrom`), growing each year while the year picker shows one.
**Question for him:** *recommended:* the box takes his official figure, "left after your waiting bids" shown beneath;
"used" counts the year picked.

**8. The permission check knows nothing of open days.** `ownershipViolation`'s `lw.cell` case checks only the row, so
at the database a page opened before a close could still bid. *Fix:* the open-days check joins it; with two admins a
decision names the state it was taken from and is refused if changed ("Already refused by Hex"); `data-model.md` §11 with
it (D200).

**9. A document is lost on put-back.** Run: the request a put-back makes carries remarks and the moved mark only
(`sync.ts doorDecideApproved`; `engine/warrecs.ts Carried` has no document field) — the reading "it stays when put back"
fails. *Fix:* `Carried` holds document ids, copied to each day's request, joined on approval; deleting one day's record
never deletes a document another still names.

**10. Management does not stand first.** `state/store.ts addGroup` inserts a qualification group before the first
standard group — after TF or NVG if shown — and likewise in a hand-set "Who wins"; a Management man holding TF is drawn
under TF. *Fix:* Management goes first in both.

**11. Do Available P/W at amber or red count as under-manned?** Today they judge nothing (`engine/availrows.ts`
thresholds 0; `engine/evaluate.ts` skips them); D1144's line and the under-manned chip name Manning rows only.
**Question for him:** *recommended:* yes, in both.

**12. Smaller.**
- A man with no row (SANS, Show SANS off): "My leave" or an Approvals line "takes the grid there" to nothing — open his
  person window instead.
- A drag across month buttons (D1169) is one command on release: one Undo (D352), one repaint — a change of open days
  re-renders every row's months (`lockedCols` is a row prop).
- Undo of an approval silently removes a line he may have read. **Question for him:** *recommended:* if read, leave
  "Approval of LL 10–11 Feb taken back · Saber".
- A posted-out man's waiting bids stay in Approvals and its count; his bell is not told (`notices.ts here()`): show the
  line with his posting tag.
- "No leave period yet" still says "It starts in draft…" (`LeaveWarPage.tsx NoWar`).
- A renamed Available row: the SANS day still prints "Available" (`ui/SansDay.tsx`), ruled by D626, while D1193's reading
  says every screen reads the name. *Recommended:* D626 stands there.

## Checked and sound
- Approving twice: the second finds it approved and changes nothing (`setBidStates`, "already").
- A member cannot file leave for another (run: "You can file leave only for yourself"), so his Inputs-page leave never
  touches another man's bid.
- Inputs-page leave on a closed day lands approved, outside Approvals (D1166); "since you last looked" can show it by its
  approval stamp (`stampPlaced`).
- Amber set below red: D1202's reading covers it; `evaluate.ts judge` checks red first.
- No period can be deleted (`createWar` only), so no bid loses its period; past years' leave is kept (Inputs, and each
  period's own records).
- Approving changes no balance (D1153), so Approve all needs no below-zero ask.
- Not measured: his iPhone's wider letters on the top rows (reader A's), the grid's speed with closed days dimmed
  (`performance.md` §E, at the build).
