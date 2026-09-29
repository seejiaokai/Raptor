# Red team of the `[OIL-AWARD-IS-A-GRANT]` plan — Fable 5.1, 29 Sep 26

Read, whole: the plan (`docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`, draft r1), the OIL, Leave War,
People & accounts and How-we-work rulings (short lines and the full rows of D400, D401, D402, D79, D80, D82, D260, D261,
D263, D265, D142, D25, D200, D299, D166, D148, D353, D54, D56), the builder's rules, and the code the plan names —
`warrecs.ts`, `credit.ts`, `dayview.ts`, `counters.ts`, `oiltracker.ts`, `merge.ts`, `charge.ts`, `seed.ts`,
`demoworld.ts`, the award and ledger parts of `state/store.ts` (the readers, the writers, the delete, the command
decomposition, the merged read), `sync.ts` (the OIL pass, the unpublish warning, the delete seam, the absence index),
`inputgate.ts`, `changelines.ts`, `perms.ts`, `undo/describe.ts`, `undo/derive.ts`, `undo/timeline.ts` (the conflict
checks and D350), `undo-wire.ts`, `DayList.tsx`, `OilTracker.tsx`, `BidPicker.tsx`, `Matrix.tsx` (the award parts),
`CounterSheet.tsx`, `BalanceBar.tsx`, `CreditForm.tsx`, `SelectSheet.tsx`, `awardwords.ts`; `data-model.md` §LeaveBid,
§LeaveLedger, §11; `ui-contracts.md` (the D400 block); `undo-contract.md`; the three backlog items. No other reviewer's
report was read. Verdict at the foot: **REVISE**.

---

## D138 reads — the three short lines against their full rows

**D400 — FAITHFUL.** The short line carries the whole rule: "earned" is only what the app credited itself (the
published schedule or an accepted duty input); every hand award, grid or tracker, is shown apart as "awarded". The full
row's extra sentences (built with `[OIL-AWARD-IS-A-GRANT]`; in the tracker's summary and the figure's breakdown; the
balance itself does not change) are where it lands and a consequence of "shown apart", not a condition of the rule.
Nothing that matters is lost.

**D401 — CORRECT IT.** The short line loses the one condition the full row puts on the rule: *"The code must still be
correct going forward (D56's guard): a record in the old shape must not break the app on load."* A reader of the short
line alone could refuse an old-shape record on load — and in this app a refusal in `readRecs` throws away EVERY war and
re-seeds. Corrected short line (243 characters, no "|"):

> THE OIL AWARD FIX CONVERTS NO STORED AWARD: WHAT IS SAVED TODAY IS DEMO DATA, WIPED BEFORE THE DATABASE (D54, D56), SO ONLY THE DEMO SEED IS REWRITTEN IN THE NEW ONE KIND OF AWARD — AND A RECORD IN THE OLD SHAPE MUST STILL NOT BREAK A LOAD.

**D402 — FAITHFUL.** The rule as it stands is all there: every hand award shows on the grid on its date, wherever it was
given, as an FO or HO box, a tap saying who and why. The full row's two edge readings — a tracker credit dated in no
war shows on no cell; a correction (a negative entry) is never drawn — follow from the words ("award", "on the grid")
and the plan already states both. If a tighter line is wanted it may end "; A CORRECTION (A NEGATIVE ENTRY) IS NEVER
DRAWN" (still under 350), but it is not needed for fidelity.

---

## How this was reviewed

Starting from the promise (one kind of hand award; earned and awarded apart; every award on the grid) and the rulings,
I listed every object that qualifies (an automatic credit, a grid award, a tracker grant, a figures-bar grant, a
correction), every renderer of an award (the grid cell and its hatch, the bid sheet's +OIL panel and its read-back, the
tap list's lines and its OIL block, the member's read-only sheet, the read-only schedule sheet, the tracker box, the
breakdown sheet, the person's figures sheet, the figure column and drawer, the move banner, the Delete confirms, the
changes window, the undo bubble), every writer (grid +OIL, `setCell` FO/HO, tap-list Edit, the three field editors,
Delete/Clear/range Clear/block Delete, the tracker's credit/edit/delete, the figures bar, a person delete, Undo/Redo,
the boot reader, the seed), every downstream reader (balance, breakdown, tracker FIFO and expiry, the unpublish
warning's counterfactual, manning, charges, the bid-against-OIL warning, the move machinery, the inputs gate, the
publish door, permissions), both roles, and the orders of actions that matter (award then publish, publish then award,
award then delete a man, award then undo, edit from the tracker after a grid award). I then assumed every line the plan
lists is right and looked for the call site it does not name.

---

## Findings

### F1 — MAJOR — The award index has no stated path into the merged read; as sketched, a ledger write leaves the grid stale
**Scenario.** Setup: any war open on screen. Action: an admin credits a man from the tracker (or the figures bar, or
Undo restores a ledger). Expected: his FO/HO box appears at once (D402). What would disprove it: the box appears only
after the next unrelated change to the war or to an input.
**Evidence.** `state/store.ts` `getState()` (≈907–917) recomputes only when the raw `state` object or the absence
version changes — a ledger write does replace `state`, so this passes — but it then calls `mergeWar(war)` per war, and
`state/merge.ts` `mergeWar` (142–145) returns its cached merge whenever the war object is the same and `ABS_VER` is
unchanged. A ledger write (`grantTo`, `updateLedgerEntry`, `removeLedgerEntry`, an undo restore of `lw.ledger/all`)
replaces `state.ledger` but not the war objects, so every war's cached merge is returned and no award is drawn.
`mergeRow` (114–119) likewise keys only on the raw row, the absence row and the period. The plan's §2.3 says "versioned
like the absence index … the merge cache keys on it" and §8 names the risk, but it never says where the index is built,
what bumps its version, or that BOTH cache checks must read it. Built in `sync.ts` on a Raptor notify (the absence
index's home) it would miss every store-only ledger write.
**Fix — plan §2.3, replace the first bullet with these steps.**
1. In `state/merge.ts`, beside the absence index: `type AwardRows = ReadonlyMap<pid, ReadonlyMap<date, readonly LedgerEntry[]>>`,
   `setAwardRows(ix)` bumping `AWD_VER`, `awardRows()`, `awardVersion()`, and `awardsAt(personId, date)` (the
   war-agnostic reader — the `awardsOn` helper of §2.3/§2.6 IS this function; nothing else scans the ledger).
2. In `state/store.ts` `getState()`: before `state.wars.map(mergeWar)`, call a store-local `syncAwardIndex(state.ledger)`
   that rebuilds only when `state.ledger !== LAST_LEDGER` (every ledger writer replaces the array immutably — `grantTo`,
   `updateLedgerEntry`, `removeLedgerEntry`, `remapPersonKeys`, `installDemoOil`, `applyLwRecord`, `forgetPersonFrom`
   after F6 — so identity is a safe key). The builder keeps a person's previous inner map when his entries are the same
   objects in the same order (the identity trick `refreshAbsences` uses with signatures), so `mergeRow` re-merges only
   the people the write touched. Include only `counter === 'oil' && amount > 0`. Then key `MERGED` on `awardVersion()`
   as well as `absenceVersion()`.
3. In `mergeWar`: the cache hit requires `hit.ver === ABS_VER && hit.awd === AWD_VER`; the `people` set also adds every
   person in the award index with a date inside the war's period (as it does for absences at 147–149).
4. In `mergeRow`: take `awd` (the person's award map) as a fourth input; the hit check adds `hit.awd === awd`; the
   `dates` set adds each award date inside `[start, end]`; contributions become
   `{ id: <ledger id>, kind: 'credit', code: amount === 0.5 ? 'HO' : 'FO', win: FULL, days: amount, note: reason, givenBy, award: true }`
   (no `auto`, no `via`, no `wins`).
5. `resetMergeCache()` (a world swap in tests) also clears the award index and its version.
6. `figureCtxOf()` needs no change (it reads `getState().wars`, now merged with awards), but §5 test 10 must build its
   sources through the store's merge — `seed.ts seedSources()` builds views from `w.recs` only and will never show a
   ledger award (see F10).
7. Cost: one pass over the ledger per ledger write (tens of entries), one re-merge for the people touched; a view-only
   render pays nothing. State this in §2.3 so the performance file's gate (`docs/performance.md` §E) is answered.
8. Pin it with the test §8 names, and a second: an undo of a tracker credit clears the box without any other change.

### F2 — MAJOR — A range Clear or block Delete on a day holding only an award removes nothing, while its confirm names the award (missing call site)
**Scenario.** Setup: Dash has a 1-day award on 12 Mar (from the tracker, or typed on the grid) and nothing else that
day. Action: an admin drags a block over 10–14 Mar and taps Delete; the confirm says "including 1 OIL award (Dash 1
day)"; he taps Delete again. Expected (D260): the award goes, one Undo brings it back. What would disprove it: the FO
box is still there, the sheet says "0 deleted" or "1 skipped".
**Evidence.** `clearCells` (store.ts 2610–2650) sends a day whose main record is not an absence to `writeMany(rest, '')`
(2566–2593). `writeMany` line 2577: *"clearing an EMPTY cell is neither a write nor a refusal"* —
`if (clearing && !listAt(personId, date).some(r => r.kind === 'request' || r.kind === 'credit')) continue`. Once awards
leave the war's records, `listAt` on such a day is empty and the day is skipped before `setCell` is even asked. And
`setCell(…, '')` (2506) filters war records only — it has no ledger branch. The plan's writers table names "`setCell ''`
… the range and block paths" as removing awards but neither call site is named, and `awardsIn` (which the confirm
reads) will have moved to the ledger — so the confirm and the act disagree. The same skip hides under the bid sheet's
one-day Delete (BidPicker `write('')` → `clearCells`).
**Fix — plan §2.5, the Delete/Clear row.** Name the four places and what each does:
1. `writeMany` 2577: the emptiness test becomes `!listAt(...).some(request || credit) && awardsAt(personId, date).length === 0`.
2. `setCell(…, '')`: after filtering the war records, for an admin also remove every ledger award on `(personId, date)`
   (one helper `removeAwardsAt(personId, date): number`, admin-gated, used by every clearing door); the function's
   "changed" answer is true when either store changed.
3. `clearRequestsAt(personId, date, awards = true)` (2653): the same helper when `awards` is true (the day-under-leave
   path in `clearCells`).
4. `clearRecordById` for a credit (2794–2806): looks the id up in the ledger (`awardsAt`) and calls
   `removeLedgerEntry`-inside-the-gesture — not `removeLedgerEntry` itself, which persists on its own and would make a
   second undo step; write a store-internal `dropLedgerIds(ids)` that both `removeLedgerEntry` and the clearing doors
   call, so the gesture stays ONE command (`lw.cell` and `lw.ledger` in one envelope).
5. Test (§5 item 6): a block over a day holding ONLY a tracker-given award reports 1 written, the box is gone, one Undo
   returns it and the confirm named it.

### F3 — MAJOR — `deletableIn` still reads the war records, so Delete is not drawn on a day holding only an award (missing call site)
**Scenario.** Setup: as F2 — Dash's day holds an award and nothing else. Action: drag a block over that day alone (or
open the one-day sheet on it). Expected (D260 reading (c), built 27 Sep 26: "a block holding only awards still offers
Delete"): the Delete chip is there. What would disprove it: no Delete chip; the sheet reads as an empty box.
**Evidence.** `deletableIn` (store.ts 4304–4312): `listAt(personId, date).some(r => r.kind === 'request' || isAward(r))`.
`SelectSheet.tsx` and the bid sheet draw Delete only where `deletableIn(...) > 0` (D332's "offer only what can be
taken"). Not in the plan's §2.6 list (it names `awardsIn` and `stayingIn`, not this one).
**Fix — plan §2.6, add to the "filled from the roll-call" list:** `deletableIn` — `own` becomes
`writable && (listAt(...).some(r => r.kind === 'request') || (state.role === 'admin' && awardsAt(personId, date).length > 0))`.
Test: `deletableIn` on a day with only a tracker credit answers 1 for an admin, 0 for a member.

### F4 — MAJOR — The boot reader drops `enteredBy` / `enteredAt`, so "who entered it and when" is lost on the first reload (missing call site)
**Scenario.** Setup: an admin gives an award (grid or tracker). Action: reload the page; open the OIL breakdown.
Expected (D200 (2)): the line still shows the live callsign of who entered it. What would disprove it: after the reload
the line falls back to the typed approver text; rename the admin and the line does not follow.
**Evidence.** `readLedger` (store.ts 425–451) builds each entry from the listed fields only —
`{ id, personId, counter, amount, date, reason, approvedBy }` plus a validated `givenBy`; anything else on the stored
object is discarded. The plan's §2.1 adds the two fields to the type and says the store stamps them, and §2.7 talks
about the war reader, but the LEDGER reader is not named anywhere. (`updateLedgerEntry` spreads `...rest`, so an edit
keeps them — that half is fine.)
**Fix — plan §2.1, add a bullet:** `readLedger` reads `enteredBy` (a non-empty string, kept as given — it is a person
id, never trimmed to a callsign cap) and `enteredAt` (a string that parses as a date; a bad one is dropped, the entry
kept — the same leniency as `givenBy`). `remapPersonKeys` re-keys `enteredBy` as it re-keys `personId` (the demo seed's
awards carry none — leave them blank; the seed has no signed-in person). Test (§5 item 9): give an award, serialise the
ledger through `readLedger`, and assert both fields survive; re-key and assert `enteredBy` followed.

### F5 — MAJOR — The permissions row the award moves to says a member reads only his OWN ledger rows, which contradicts the grid every member sees (D402) and the tracker as built
**Scenario.** Setup: at the database step IT builds the security roles from `data-model.md` §11 (D200 (2): "what IT
builds the database's security roles from"; D354: that step starts now). A member signs in. Action: he opens the
Leave War. Expected: every man's FO/HO boxes as today (D402 says every award shows on the grid; the grid shows every
row to a member), the OIL tracker with every row (it draws every person for both roles today — `OilTracker.tsx`
`roster = displayRoster()`, controls admin-only), and any man's figures sheet and breakdown (owner, 17 Aug 26 —
"everyone should be able to click on that person's name and see these logics", `CounterSheet.tsx`). What would
disprove it: other men's award boxes vanish for a member once the server enforces `LeaveLedger` = "R own".
**Evidence.** §11 today: `LeaveBid (a hand-typed OIL award)` — Member **R** (every row); `LeaveOpening, LeaveLedger,
LeaveCounter` — Member **R own**. `perms.ts` mirrors it (`T.award: cell('R')`; `T.ledger: cell('', 'R')`) and
`perms.test.ts` fails if the two differ. The plan §2.6 merges `T.award` into `T.ledger` and §7 says "§11's two award
rows" — but never says what the member's read becomes. Merged as written, a member may read only his own OIL awards,
and the app already shows him everyone's (the tracker, the breakdown's itemised grants, the figure column). The
contradiction between §11's "R own" and the tracker is pre-existing; this plan is the one that moves the award onto
that row, so it must settle it, and it is the admin's permissions reading he must be shown (record-decisions: a
reading stated so he can correct it).
**Fix — plan §2.6 (the `state/perms.ts` bullet) and §7.**
1. Split the row: `LeaveLedger` — Admin C R U D; Member **R** (every row — the grid draws every man's award, D402; the
   tracker and every man's figures are open to every member, owner 17 Aug 26); the note keeps "a ledger entry keeps the
   approving admin's callsign, and who entered it and when (D200 (2))". Keep `LeaveOpening, LeaveCounter` on their own
   row as they are, OR widen them the same way with the reason (the figure column shows every man's balance to every
   member) — say which, and why, in the plan.
2. `perms.ts`: delete `T.award` and its row; `T.ledger` becomes the split rows (two keys if the tables split);
   `mayAwardOil` reads `T.ledger 'C'`; `perms.test.ts` and `perms-scan.test.ts` green.
3. In the report to him: "Members can already see every man's OIL entries on the tracker and in the breakdown; the
   permissions table now says so for the award too. Say if a member should see only his own."

### F6 — MAJOR — The whole-ledger undo record turns an ordinary delete into a refusal of every earlier award's Undo (the §2.6b challenge — yes, there is a single-session case)
**Scenario.** Setup: the admin gives Dash an award from the grid (step 1). Later in the same session Vector, who holds
a tracker credit dated next month, leaves flying for good: Admin → Users → Delete (D287; not an Undo step, D350).
Under the plan's §2.6a the delete drops Vector's future award from the ledger inside the delete's command. Action: the
admin presses Undo to take back Dash's award. Expected: "Undid: Dash's OIL award". What would disprove it — and will:
*"A later change to a person (added, archived, restored or posted) touches the same thing, so this can't be undone —
change it back by hand."* The same happens after the daily posting pass runs a delete (`lw.postoutRun` is an
out-of-band barrier on every record it wrote): every ledger step of the session older than it is refused with "The app
changed this after your action (a posting out ran)". After the database (D148, `remote`), ANY other admin's OIL grant
blocks every one of my ledger undos, because there is one record.
**Evidence.** `lwDecompose` (store.ts 1070) writes `lw.ledger/all` — one key for the whole ledger. `undo/timeline.ts`
`undoConflictOf` (565–592): a newer not-undone entry sharing a key refuses; `NOT_UNDONE_TYPES` (D350 — `person.delete`
among them) refuses with the sentence above; `ingest` (152–157) makes the posting pass a sticky barrier on its keys;
`keySet` = `collection/id`. Today the delete writes `lw.cell/<war>:<vector>:<date>` keys, which Dash's award never
shares — so this refusal is NEW for grid awards (tracker grants already suffer it, which is why the tracker's own undo
has looked fine in walks: nobody deleted a man between a grant and its undo). The plan's §2.6b reason — "a second
person's change can never sit between two of his in the prototype" — is true, but the app's OWN delete can, through
an ordinary door, and D354 says the database (where every other admin can) starts now.
**Fix — plan §2.6b, replace "Not done here" with the split, done in this build.**
1. `lwDecompose`: one record per entry — `m.set(\`lw.ledger/${e.id}\`, { collection: 'lw.ledger', id: e.id, value: e })`
   (drop `lw.ledger/all`).
2. `applyLwRecord` `case 'lw.ledger'`: upsert by id on `s.ledger` (replace the entry with that id, or append), delete
   removes it; keep the array order stable (append at the end, replace in place) so `grantsFor`'s tie-break by id still
   holds.
3. `changelines.ts` `ledgerLines(c)`: `c.before` / `c.after` are now ONE entry each (or undefined) — say "given" when
   only `after`, "taken away" when only `before`, "changed" when both differ; the per-line words stay.
4. `undo/describe.ts` 204 and `undo-wire.ts` are unchanged (they test the collection name); `undo/derive.ts warOf`
   returns null for `lw.ledger/<id>` as it did for `/all` (a ledger step opens the war page, not a war).
5. `perms.ts ownershipViolation` already refuses any `lw.ledger` change for a member — unchanged.
6. `registry.ts` maps the collection to the `leavewar/ledger` storage key regardless of id — unchanged; `rawPersist`
   still writes the whole array.
7. `[DB-READINESS]` (1) then lists the ledger as done in small pieces; a test: give Dash an award, run a delete that
   drops another man's future award in the same session, Undo → Dash's award is undone.
If the owner would rather not take this now, the plan must state the refusal in plain words as a known limit and file
it in `[DB-READINESS]` with this scenario — but I recommend the split: the decomposition is a map, the apply is an
upsert, and it removes the seam before the tables settle (D203, D354).

### F7 — MINOR — "The door asks, the store accepts" is two rules on one record, and it makes the tracker demand a reason to save an amount change on a grid award
**Scenario.** Setup: an admin gives Dash FO on the grid with no reason (allowed today). Action: in the tracker he taps
that award to correct 1 day to 1.5 and presses Save. Expected: saved. What happens under §2.5: "Give a reason" — he must
invent one to fix a number. And the store's award writer taking an optional reason means either `grantTo` grows a bypass
or a second writer exists beside `ledgerProblem` — the drift seam the house rules name (the same seam `MAX_GIVEN_BY`
was caught in).
**Evidence.** `ledgerProblem` (store.ts 3273–3283) requires a reason for OIL; `OilTracker.tsx startEdit/saveEdit`
(322–331) sends the box's reason to `updateLedgerEntry`, which re-runs `ledgerProblem`.
**Fix — plan §2.2.** ONE writer and ONE rule in the store: `ledgerProblem` takes `requireReason: boolean`; `grantTo`
and `updateLedgerEntry` gain an options argument `{ requireReason?: boolean }` defaulting to `reasonRequired(counter)`;
the grid's award door and the tap list's Edit pass `false`; the tracker's credit FORM keeps asking (its own rule, as
today); the tracker's EDIT of an existing award passes `requireReason: entry.reason !== ''` (it never demands a reason
the award never had; it never lets one that had a reason lose it silently). Word it in `ui-contracts.md` under the
D400 block. And put the product half to him in the report, as the plan intends: "Should the grid ask a reason too?"

### F8 — MINOR — A re-dated award writes a change line that shows no date, so the change the history exists to record is invisible
**Scenario.** Setup: Dash's award dated 12 Mar. Action: the tracker's editor moves it to 19 Mar. Expected: a line
"Leave War · DASH · OIL award changed: 12 Mar → 19 Mar", on both days (the way an input's move is on the days it left
and reached — Astra DP-05). What would disprove it: a line "changed" whose from and to read identically.
**Evidence.** `changelines.ts ledgerLines` (≈316–323): `words(e)` = callsign · counter · amount · reason — no date; a
date-only edit gives `from === to`; the line is dated on the NEW day only (`at(e)`).
**Fix — plan §2.5 (the re-dating paragraph) and §2.6 (the `changelines.ts` bullet):** the "changed" line's `from`/`to`
include the day (`dayWord(e.date)`), and when the date changed the line carries `wdate: old.date` so it shows on the day
it left as well. On the decision itself: re-dating from the tracker is acceptable — D260's full row says an award on the
wrong day "is removed and given again on the right one", and an edit of the record is that in one step; the Move door
still never carries an award (D260, D265). Cite D260's reading in §2.5 and name it in the report as a reading he can
correct.

### F9 — MINOR — `cellProblem` still answers "fine" for FO/HO while `setCell` will refuse it
**Scenario.** Any caller that asks `cellProblem` before `setCell` (the picker idiom, `[S4-BUGHUNT]`) gets null for FO
and then a silent false — the exact class of defect `cellProblem` was built to end.
**Evidence.** `cellProblem` (store.ts 2399–2420): the FO/HO branch returns null for an admin. Not in the plan's list.
**Fix — plan §2.5, the `setCell` row:** `cellProblem` answers "OIL is given from the day's +OIL panel or the OIL
tracker" for FO/HO, in step with the refusal.

### F10 — MINOR — The engine's own seed sources cannot show a ledger award, so §5 test 10 needs the store's merge
**Evidence.** `seed.ts seedSources()` (≈300–335) builds day views from `w.recs` and `SEED_ABSENCES` only; after §2.8 the
seed's awards are ledger rows and would never reach a view built this way. Any test that reads the grid shape off
`seedSources()` (the parity of the seed-wide balance is fine — `balanceOf` sums the ledger) would pass vacuously.
**Fix — plan §5 tests 1, 2, 10, 11:** state that grid-shape assertions go through the store (`initStore` + `getState().views`),
or extend `seedSources()` to lay `seedLedger()`'s positive OIL entries into the views with the same contribution shape
F1 step 4 gives — one builder, so the engine tests and the store cannot disagree about what an award looks like.

### N1 — NIT — "money-tier" in the plan's §0 and §6
D25: OIL is earned leave, never pay or money, in words on screen AND in comments; the bug-check order's tier question is
worded to fire on what a man is OWED. Say "the earned-leave tier (money-tier question 1)" or "FULL tier — earned leave,
saved data, permissions". No code impact.

### N2 — NIT — The tracker box's giver when none was typed (§2.4's open question)
Keep as today: the box shows "Given by" only when one was typed; the breakdown line carries the live callsign of
`enteredBy`. The box is small, and "given by" on it has always meant on-whose-say-so, not who typed it; putting the
enterer there would make a grid award and a tracker grant read differently for the same fact.

### N3 — NIT — Small leftovers the plan should name so the roll-call is complete
- The +OIL button label (`BidPicker.tsx` 579) reads `credit.code · worth` from the FIRST award; on a day holding several,
  read "N OIL awards" (the panel already refuses to edit there).
- `OilTracker.tsx` imports `MAX_CELL_NOTE` for the retired `+ reason` editor — remove with it; `engine/bids.ts` 57's
  comment names `setCellNote` — correct it in the same change.
- `docs/handover-dataverse.md` has no award or ledger sentence today (grep: none) — §7 can say "nothing to keep true
  there", rather than promise an edit. `docs/engine-rules.md` 3322–3333 DOES state "an OIL award given / changed /
  taken, on the grid and on the ledger" — name the lines.
- `Matrix.tsx` 3527 (`openCredit`) and 3534 (`openAnyCredit`) both read `recordsAt`; after the move `openAnyCredit`
  must still find the SCHEDULE's credit in the records and `openCredit` the award in the index — say so, or the
  read-only schedule sheet loses its credit read-back.

---

## Answers to the seven questions

1. **Is the ledger the right one store?** Yes. It is war-independent (D79 and the tracker already date grants outside any
   war), already carries date / amount / reason / approver / given-by, is already an undo collection, a change-history
   source and a permissions row and a database table. What the shape loses: an award whose grid code and worth disagree
   ("HO worth 3 days") — unrepresentable, and D401 converts nothing; `spans` on an award — retired (N13); at most one
   award per day — relaxed (the plan handles it); the reason cap 40 → 120 — a widening. **No balance changes**:
   `balanceOf` = opening + ledger + earned(auto) − drawn counts each award once; the tracker's FIFO order between an
   award and an automatic credit on the SAME date is unchanged (today `auto:` sorts before `award:` by id; after,
   rank auto < grant), and their expiry dates are equal, so the drawn-from picture and the balance are identical.
2. **Double / lost counting.** Clean, provided three places read AUTO ONLY once awards are also in the day views:
   `dayview.ts` `earnsOil` (337), `oiltracker.ts` the view walk (237–257 — skip `!credit.auto`, else an award is counted
   from the ledger AND the view), and `sync.ts oilCreditBidAgainst` (1275). The plan names all three. Manning
   (`haveOf` reads `away`; a credit removes nobody), charges (credits never charge), the inputs gate (222, auto only),
   the publish door (1257, 1306, auto only), `takenOf` (skips credits), the bid-against-OIL warning (reads the ledger's
   balance through `figureCtx`, memoised on `version`, which every ledger write bumps) — all unaffected.
3. **Readers and writers the plan does not name.** `writeMany`'s empty-cell skip and `setCell('')` (F2),
   `clearRequestsAt(…, awards)`'s ledger half (F2), `deletableIn` (F3), `readLedger` (F4), `cellProblem` (F9),
   `seedSources()` (F10), `openAnyCredit` vs `openCredit` (N3). Everything else the greps return (`'manual'`,
   `oil ===`, `isCredit`, `kind === 'credit'`, `recordsAt`, `listAt`, `earnsOil`, `.ledger`) is either in the plan's
   §2.6 list or automatic-only and untouched.
4. **The merge cache.** F1 gives the design and its cost: the index lives in `merge.ts` beside the absence index, is
   rebuilt in `getState()` on ledger identity, and BOTH `mergeWar` and `mergeRow` key on it.
5. **The open questions.** Reason rule — one writer with a flag (F7); `enteredBy`/`enteredAt` on edit — keep the first
   stamp (the history line records who changed it: `editlog.ts logAction` stamps `who` and `pid` on every line); a
   correction as its own row — yes, and only when one exists, exactly as "expired" behaves (folding it into "awarded"
   would show an admin "awarded 2" against a tracker that shows +3 and −1); the tracker box giver — N2; dropping old
   records — DROP is right (reading an old-shape record as a ledger award would be a conversion in disguise: `readRecs`
   is pure and writes nothing back, so the award would reappear on every load and, once written to the ledger, double);
   the coarse ledger record — F6, split it; re-dating from the tracker — acceptable, cite D260's reading (F8); several
   awards at the +OIL panel — the plan's answer is right (edit none, say so, the list carries each).
6. **Permissions.** F5. Writers stay admin-only (`grantTo` refuses a member; `ownershipViolation` refuses any
   `lw.ledger` change for a member; `mayAwardOil` stays the one question). A member DOES see other men's awards on the
   grid (D402), on the tracker and in the breakdown today — §11 must say so or the server will hide them.
7. **Rulings.** No contradiction found. Cite in addition: D321 in §2.6a (leave or OIL may still be added on a deleted
   man's past days — `grantTo` accepts a `gone` man because he stays in `state.people`, and the grid's admin door
   allows any row; say so); D323 beside it (an archive is "posted out from today, his past kept" — awards dated after an
   archive STAY, only a delete drops them); D260's full-row reading in §2.5 (F8); D166 (5) for `approvedBy` being the
   callsign; the owner's 17 Aug 26 "everyone can see these logics" in §2.6's permissions bullet (F5). D25 wording (N1).

---

## Checked and found nothing

- **The balance, seed-wide.** `balanceOf` and `oilLedgerFor` both sum the ledger once and the views once; with
  `earnsOil` auto-only every seeded person's OIL figure is the same number before and after (the plan's pin is the
  right test). The tracker's `+ / −` line (`plus` sums every credit incl. grants) is unchanged in value.
- **FIFO and expiry.** Same-date ordering and expiry are unchanged (Q1). A grid award today already gets
  `expiryOf(date, policy)` exactly as a grant does.
- **The unpublish warning's counterfactual.** Omits `source === 'auto'` only; awards stay in the balance (N16) — right.
- **Manning and clashes.** `forbiddenPair` exempts a non-auto credit; `duty` is auto-only; `haveOf` reads `away`; the
  clash strip reads `conflicts`; `barsWrite` never bars a credit; the inputs gate reads auto only. An award drawn from
  the ledger carries no `auto`, so all of this holds as today.
- **The OIL pass.** `ingestDutyCreditImpl` finds `oil === 'auto'` only and `clearRaptorCell` removes auto only — awards
  off the war record are simply invisible to the pass. `splitTakenOver` goes with the type (nothing writes it).
- **The publish door and `desiredOilCells`** — a deleted man earns nothing from his cutoff; untouched.
- **The move machinery.** `movableRecords` lists requests and absences only; `stayingIn` must read `awardsAt` (the plan
  names it); `requestMovable`, `absenceMovable`, `moveRecordsProblem` never look at credits.
- **The change history's dating.** `ledgerLines` dates each line on the entry's own day (`at(e)`), so a grid award's
  line sits on its day from every door; `undo-wire.ts lwDateOf` reads `lw.cell` only and an award's undo lands on the
  war page (no war id in `lw.ledger/<id>`), as a tracker grant's does today.
- **The undo describer.** `lwCellLabel` stops seeing credits; the `lw.ledger` branch takes over — the plan's wording
  change is enough.
- **A deleted man (D299).** Dropping his positive OIL entries dated on or after the cutoff inside the delete's command
  matches what the delete takes from his war records today; his past awards stay; the tracker already hides `gone`
  men; a grid row after his cutoff must not stretch to a future award — which is exactly why F6's alternative "leave
  the ledger alone in a delete" is wrong (`rowInWindow` would draw it).
- **`installDemoOil` / `remapPersonKeys` / `readLedger`'s id merge** — the demo seed's awards as ledger rows land and
  re-key like the two grants do today (with F4's `enteredBy` re-key).
- **The +OIL panel's "rewrite the one award"** keeps today's `setManualCredit` meaning (replace `had`); "several →
  refuse and say" is the right call; the tap list edits each by id through `updateLedgerEntry`.
- **`enteredAt` and determinism.** A clock on a NEW entry is fine: undo/redo replay the recorded record values, never
  the writer; `ledgerSeq()` stays clock-free.
- **The half-step guard.** `ledgerProblem` already refuses non-halves and a zero amount; the grid's 0.5 → HO rule and
  `editManualCredit`'s "days < 1 → HO" agree on the only value under 1.
- **The bridge and the scripts.** `w.lwSetCell` is dev-only; every e2e / handpass call of it writes a leave code, none
  FO/HO — the refusal in §2.5 breaks no script. Eleven unit test files write FO/HO through `setCell` — the plan's "moved
  to `setManualCredit`, never weakened" covers them.
- **D56 exclusion applied.** Nothing above is about data already stored: F1–F10 all reproduce on NEW awards.

---

## Verdict: REVISE

Findings: **0 BLOCKER · 6 MAJOR (F1–F6) · 4 MINOR (F7–F10) · 3 NIT (N1–N3).** The shape is right (the ledger, derived on
read, earned/awarded apart) and no ruling is contradicted; what is missing is four call sites the roll-call did not
reach (the range-clear skip, `deletableIn`, `readLedger`, `cellProblem`), a merge-cache design precise enough to build,
the member's read on the permissions row, and the whole-ledger undo record, which an ordinary delete turns into a
refusal of every earlier award's Undo. Fix those in the plan, then build.
