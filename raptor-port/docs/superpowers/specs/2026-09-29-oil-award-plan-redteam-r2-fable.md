# Red team, round 2, of the `[OIL-AWARD-IS-A-GRANT]` plan (r2) — Fable 5.1, 29 Sep 26

Read: the plan at r2 (`docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`, git HEAD) and its diff from r1
(`4d24d4eb`); both round-1 reports; the full rows of D260, D261, D265, D400–D402, D79, D82, D148, D200, D299, D321,
D323, D166, D350, D287 (shell grep of `.claude/decisions-full/`); and the code the r2 changes touch — `state/store.ts`
(`lwDecompose`, `applyLwRecord`, `lwStore.write`, `persistNotify`, `gesture`, `readLedger`, `ledgerProblem`,
`ledgerSeq`, `grantTo`, `updateLedgerEntry`, `removeLedgerEntry`, `forgetPersonFrom`, `cellProblem`, `setCell`,
`writeMany`, `clearCells`, `clearRequestsAt`, `awardsIn`, `clearRecordById`, `deletableIn`), `state/merge.ts`,
`undo/derive.ts`, `undo/timeline.ts` (ingest, the conflict checks, `abandonForkedRedo`, `mayReverse`),
`undo/describe.ts`, `state/undo-wire.ts`, `state/changelines.ts`, `state/perms.ts`, `perms-scan.test.ts`,
`sync.ts` (`pastOnWar`, the delete seam), `Matrix.tsx` (`ownAwardOnly`, `cellOpenable`, the sheet chooser),
`DayList.tsx`, `OilTracker.tsx` (the editor), `engine/counters.ts`, `engine/oiltracker.ts`, `data-model.md` §11,
`OUTSTANDING.md` (`[LEDGER-READ-ASK]`). Round 2 is a check of the changes, not a fresh review. Verdict at the foot:
**APPROVE**, with five small things folded into the build.

---

## The D260 settlement — checked honestly

Round 1: I said re-dating an award from the tracker was acceptable (F8); Astra said D260 forbids it (F01). The builder
took Astra's reading from D260's full row.

**The builder is right, and I withdraw my reading.** D260's full row records the advice he accepted — *"an award never
moves: its date is the day he earned it, and it sets when the OIL runs out"* — and its reading (2), stated to him and
never corrected: *"an award on the wrong day is removed and given again on the right one."* The REASON given (the date
is the day it was earned and drives expiry) applies to any door that changes the date, not only to the grid's Move; and
reading (2) names the one sanctioned way to fix a wrong date. My F8 treated a date edit as "that in one step", which
is a looser reading than the words support. Under D53 the settled reading is not to be reopened; the plan names it to
him in §3(c) so he can loosen it if he wants — that is the right place for it. The plan is also honest that this removes
a thing the tracker does today (its date box on an OIL grant).

Two consequences the plan must carry, both small (new findings N1 and N2 below): the refusal has to be on a *changed*
date, because the tracker's Save sends the date every time; and an award must not be able to become a correction and
back, or the date can still be moved in three steps.

---

## The §9 table — each round-1 finding and whether its fix is right

| §9 row | Verdict | Notes |
|---|---|---|
| Fable D138 — D401's short line | **DONE** | Checked in `.claude/rules/decisions/oil.md`: the short line now ends "AND A RECORD IN THE OLD SHAPE MUST STILL NOT BREAK A LOAD". |
| Fable F1 / Astra F09 — the award index and both cache layers | **DONE** | §2.3 items 1–7 give the index in `merge.ts`, the rebuild in `getState()` on ledger identity, `awardVersion()` on the outer `MERGED` cache, on `mergeWar`'s hit and on `mergeRow`'s hit, the people union, the dates, the one contribution shape, the reset and the cost. Tests 9 and 18 pin it. One nit (N7): `resetMergeCache()` lives in `merge.ts` but `LAST_LEDGER` will live in `store.ts`. |
| Fable F2 / F3, Astra F04 — the clearing call sites | **DONE** | §2.5a names the one preflight (`awardIdsIn`), `deletableIn`, `writeMany`'s skip, `setCell('')`, `clearRequestsAt`, `clearRecordById` and the one `dropLedgerIds` inside the gesture; `cellProblem` in §2.5. Test 5 covers award-only and award-beside-leave for all three Delete doors. Nit (N8): add two awards on one day to test 5. |
| Fable F4 — `readLedger` | **DONE** | §2.1: both fields kept with the stated leniency; `remapPersonKeys` re-keys `enteredBy`; test 8. |
| Fable F5 / Astra F10 — the award's permission row | **DONE** | §2.6c keeps `T.award` as its own class on `LeaveLedger` (`counter = oil AND amount > 0`), Member R every row; every other ledger row unchanged; the pre-existing gap filed as `[LEDGER-READ-ASK]` (checked: in `OUTSTANDING.md`, line 1246, and in the priority list). Astra's test "a member cannot read another man's correction" is rightly NOT in the list — the app shows it today and the question is his. |
| Fable F6 / Astra F11 — one ledger record for undo | **DONE** | §2.6b splits per entry in this build: decomposition, upsert apply, batch = one step, `ledgerLines` on one entry, `warOf` null, ownership, registry, tests. Three small consequences the split leaves behind are new findings N3, N4, N5 (the undo's landing day, the Undo history line's day, and id re-use). |
| Fable F7 / Astra F08 — the reason rule | **DONE** | §2.2: one validation body with a flag; `grantTo` requires; `awardOil` optional; an edit requires a reason only where one existed; the form keeps asking; test 12. |
| Fable F8 — a re-dated award's line | **DONE** | Moot for awards; §2.6 keeps `wdate` on a correction's date change. |
| Astra F01 — re-dating contradicts D260 | **DONE** | See the settlement above. Two follow-ons are N1 and N2; Astra's test "delete then give again writes a taken-away line and a given line" is not in §5 — add it to test 11 (one line). |
| Astra F02 — several awards close D261's door | **DONE** | §2.6 `ownAwardPresent` over `view.all`; a multi-record cell goes to the tap list (the corner mark already routes it there — `Matrix.tsx` 3513); another man's detail stays closed; test 6. |
| Astra F03 — `pastOnWar` | **DONE** | §2.6 and §2.6a; test 16. |
| Astra F05 — worth from the code | **DONE** | §2.1: the amount is the worth everywhere; HO = 0.5 only; test 5's "3 days". |
| Astra F06 — corrections' arithmetic and caption | **PARTIAL** | The equation, the fields and the breakdown row are right. The caption paragraph in §2.4 says two different things: first "corrections in the caption wherever a person's own breakdown carries corrections", then "the caption is the figure's, so it names corrections always". It cannot be per person — the caption is ONE string per figure (`counters.ts` 377, `desc`), not per man. **Fix:** delete the first sentence; keep the always form: *"The OIL tracker's balance: earned by weekend/PH work + awarded ± corrections − taken − expired"*. Astra's "no-correction caption test" then falls away (the caption never varies); keep the breakdown test that the corrections ROW appears only when one exists. |
| Astra F07 / Fable N2 — the tracker box's giver | **DONE** | §2.4: "Given by" only when typed; the enterer in the breakdown line. |
| Fable F9 — `cellProblem` | **DONE** | §2.5, the `setCell` row. |
| Fable F10 — `seedSources` | **DONE** | §2.3 item 6: one `awardContrib` builder used by the merge and the seed's views. |
| Astra F12 — the seed pin | **DONE** | §2.8 and test 3: a literal baseline captured before the rewrite; §2.4's wrong "two hand awards" is gone. |
| Astra F13 / Fable N1 — D25 words | **DONE** | No "money" left in the plan (checked); `OilTracker.tsx`'s header in the `[OIL-WORDS]` sweep (§7). |
| Fable N3 — small leftovers | **DONE** | The +OIL label (§2.5), `openCredit` / `openAnyCredit` (§2.6), `MAX_CELL_NOTE` and `bids.ts` (§2.5), handover and engine-rules (§7). |

---

## New findings — what the r2 changes introduce or leave behind

### N1 — MINOR — The fixed-date refusal must be on a CHANGED date, or every award edit from the tracker is refused
**Scenario.** Setup: Dash has a tracker award of 1 day dated 12 Mar. Action: an admin opens it in the tracker, changes
the amount to 1.5, presses Save. Expected: saved. What would disprove it: "an award's date can't be changed" on a Save
that changed no date.
**Evidence.** `OilTracker.tsx` 326–327: `saveEdit` always sends `{ amount, date: eDate, reason, givenBy }` — the date
is in every patch. §2.5's tracker row says `updateLedgerEntry` "refuses a `date` patch on one" — read literally, that
refuses the key's presence.
**Fix — §2.5, the tracker row, one sentence:** the refusal is `patch.date !== undefined && patch.date !== cur.date` on a
positive OIL entry; the tracker's editor shows the date read only on an award and sends no `date` in its patch; the
+OIL panel's rewrite (§2.5, first row) sends none either. Test 11 says "a direct date patch refused" — add "an edit
that leaves the date as it is is accepted".

### N2 — MINOR — An award can still be moved in three steps by turning it into a correction and back
**Scenario.** Setup: Dash's award +1 on 12 Mar. Action: the admin edits its amount to −1 (it is now a correction — off
the grid, its date editable), moves its date to 19 Mar, edits the amount back to +1. Expected under D260: impossible.
What would disprove it: the same ledger id now reads as an award on 19 Mar, with a new expiry; the change history shows
three "changed" lines, none of them saying the award moved.
**Evidence.** `ledgerProblem` (`store.ts` 3273–3282) accepts any non-zero half step of either sign; `updateLedgerEntry`
(3341–3367) keeps the id and patches the amount; nothing in §2.2 or §2.5 forbids a sign change. The plan's own
definitions (§2.1: award = positive, correction = negative) make the sign the record's KIND, so an edit that flips it
changes what the record is.
**Fix — §2.2, one bullet:** `updateLedgerEntry` refuses an amount whose sign differs from the stored one on an OIL entry
— "An award stays an award — to take OIL back, add a correction" / "A correction stays a correction". (Other pools:
unchanged.) Test 11 gains "a sign flip is refused". This also keeps the undo words and the change lines honest ("OIL
award changed" can never describe an award becoming a correction).

### N3 — MINOR — Undo of a grid award no longer takes the view to its day
**Scenario.** Setup: the admin gives Dash an award on 12 Mar from the grid, scrolls to September. Action: Undo.
Expected (today's behaviour for a grid award): the war page lands on 12 Mar. What would disprove it: the war page stays
on September and the box vanishes off screen.
**Evidence.** `state/undo-wire.ts` 92–99: `lwDateOf` reads `lw.cell` / `lw.bid` ids only; `snapView` (174–177) focuses
that day. Once an award is a `lw.ledger/<id>` record there is no cell change to read. §2.6b item 5 says the step lands
on the war page "as today" — true of a tracker grant, a regression for a grid award.
**Fix — §2.6b item 5:** `lwDateOf` also reads a `lw.ledger` change — the entry's `date` from `after ?? before` — and
`focusDay` it. Test 14 adds "undo of a grid award brings its day into view".

### N4 — MINOR — The "Undo — Dash's OIL award" history line lands on TODAY, not on the award's day
**Scenario.** Setup: an award dated 12 Mar, given from either door. Action: Undo; open the changes window on 12 Mar.
Expected: the award's "given" line and, beside it, "Undo — Dash's OIL award". What would disprove it: the Undo line sits
on today's date under "The day", nowhere near the award.
**Evidence.** `state/changelines.ts` `logReversed` 381–387 collects days from `days`, `inputs`, `lw.cell`, `sched.*`;
a `lw.ledger` change adds none, so the step falls to the 395–396 fallback ("the roster, the war's ledger and its postings
write theirs dated today"). That fallback was written when a ledger line was undated in the grid's sense; after this
plan every award line is dated on its day (§2.6), so its Undo should be too.
**Fix — §2.6, the `changelines.ts` bullet:** in `logReversed`, `else if (c.collection === 'lw.ledger') { const e = (c.after
?? c.before) as any; if (e && /^\d{4}-\d{2}-\d{2}$/.test(e.date)) days.add(e.date) }`. Test 15 adds "the Undo line is on
the award's day".

### N5 — MINOR — A re-minted ledger id makes two different awards one undo record
**Scenario.** Setup: the admin gives Dash an award (it gets `ol-7`), then presses Undo. Action: he gives Vector an award
from the tracker (nothing else has changed). Expected (§2.6b item 7, "an unrelated entry changed since does not block"):
Dash's award is still redoable. What would disprove it: Redo is grey — Dash's step was abandoned, though Vector's award
is unrelated. On the database (D148, `remote`), the same re-use makes another admin's new grant read as "someone else
changed Dash's award".
**Evidence.** `ledgerSeq()` (`store.ts` 3286–3293) mints past the highest id IN THE STORED LEDGER; after an undo the
undone entry's id is free, so Vector's award is `ol-7` too. Per-entry keys are `lw.ledger/<id>`, so the two share a key:
`abandonForkedRedo` (`undo/timeline.ts` 318–330) marks Dash's undone step abandoned. Today every ledger write abandons
every undone ledger step (one key for the lot), so this is not worse than now — but the plan's test 7 claims the
opposite for this order, and at the database step a re-used id is a stable-id breach.
**Fix — §2.6b, one item:** a store-level high-water mark, session only: `ledgerSeq()` answers `max(highest stored id,
LEDGER_HWM)` and every mint bumps `LEDGER_HWM`. No schema change; a reload starts the mark from the stored ledger, which
is safe because the undo list clears at sign-out (D148). Test 7 (§2.6b) adds this exact order: give, undo, give another
man, Redo the first → it redoes.

### Nits
- **N6 (the caption)** — folded into the Astra F06 row above.
- **N7** — §2.3 item 5: `resetMergeCache()` is in `merge.ts` and clears the index, but `LAST_LEDGER` (item 2) is
  store-local; a test that resets without swapping the ledger array never rebuilds. Say that the store's reset (or
  `initStore`) also clears `LAST_LEDGER`, or that `syncAwardIndex` rebuilds whenever the index is the empty sentinel.
- **N8** — §5 test 5: add "two awards on one man's day inside a block: the confirm names both with their amounts, both
  go, one Undo returns both" (Astra F04's last test).
- **N9** — `perms.ts` 81: `T.award`'s row carries `gaps: ['OIL-AWARD-IS-A-GRANT']`; the build closes the gap, so the
  marker (and §11's "gap:" note) go in the same change — §2.6c should say so, or `perms.test.ts` may hold the two apart.

---

## Checked and found nothing

- **The split ledger record against the undo machinery.** `lwStore.write` clones and applies each entry through
  `applyLwRecord` — an upsert case is a two-line change; `LW_COLLS` and `command/registry.ts` need no change (they name
  the collection, not the id); `ownershipViolation` refuses any `lw.ledger` change for a member (`perms.ts` 434) before
  and after; `undo/describe.ts` 204 keys on the collection; `deriveContexts` puts a `lw.ledger/<id>` step on the war
  page as `/all` was. The `owner` derivation §2.6b item 5 adds is harmless and changes no gate: an admin's `mayReverse`
  reads only whose step it was, and a member never has a ledger step.
- **The posting pass and the delete as barriers.** With per-entry keys, `lw.postoutRun`'s barrier and `person.delete`'s
  record set land only on the deleted man's future awards — exactly the F6 scenario, fixed.
- **`forgetPersonFrom` inside the delete's command.** It already runs enlisted (`sync.ts` 1619–1621) and for the posting
  pass (1591); dropping his future positive OIL entries there is one more filter in the same envelope. Past awards stay;
  `pastOnWar` keeps his row.
- **The one gesture for Delete.** `clearRecordById` (2794–2803), `writeMany` (2570) and `clearCells` (2612) all open
  `gesture('lw.edit')`; a `dropLedgerIds` inside them joins the gesture through `persistNotify`'s nested branch
  (1224–1232) — one envelope, one step, as §2.5a item 7 says. `writeMany`'s `quiet` idiom must cover the ledger drop
  too (a builder detail; the plan's "never a second `persistNotify`" already says it).
- **`enteredBy` / `enteredAt` and determinism.** A clock on a NEW entry only; undo/redo replay record values; `ledgerSeq`
  stays clock-free. `state.viewer` is the signed-in person's id (the seam mirrors it), so the stamp is right in the
  admin's member view too — though he cannot award there.
- **The reason flag.** `ledgerProblem` is the one body today (3273); a flag replacing its internal `reasonRequired` call
  keeps the `grantTo` / `updateLedgerEntry` / form trio on one rule, as §2.2 says.
- **D261 with several awards.** `cellOpenable` → `ownAwardPresent`; a marked cell goes to `DayList` (3513); `DayList`
  gates Edit and Delete by `editable` and `role === 'admin'` (80, 187), so a member reads and touches nothing.
- **The award's permission class as a row predicate.** `mayAwardOil` (223) asks `T.award 'C'` — unchanged in shape;
  `perms-scan.test.ts` allows the `leavewar/` tree, so no new authority seam appears.
- **D56.** Nothing above lives only in stored data: N1–N5 all reproduce on new awards.

---

## Verdict: APPROVE

**§9: 18 DONE · 1 PARTIAL (Astra F06's caption sentence) · 0 WRONG.** **New: 0 BLOCKER · 0 MAJOR · 5 MINOR (N1–N5) ·
4 NIT (N6–N9).** The D260 settlement is honest and I withdraw my round-1 reading. The five minors are each a sentence
in the plan and a small piece of the build — fold them in and build; no round 3 of the plan is needed (three rounds is
the cap, and the final code reads by both reviewers will see the built result).
