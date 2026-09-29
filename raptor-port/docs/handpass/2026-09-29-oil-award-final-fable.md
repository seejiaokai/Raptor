# Final code read — `[OIL-AWARD-IS-A-GRANT]` (D400–D402) — Fable 5.1, 29 Sep 26

Read-only, blind to Astra's final report. Read: the plan of record (§0–§10), the evidence sheet, the whole diff since
`21869a2c` under `raptor-port/src` (production and tests), the full rows of D400, D401, D402, D260, D261, D265, D200,
D80, D82, D148, D350, and the production code around every reader and writer the brief named. The method was the
brief's: start from the promise and the rulings, list every object, drawer, door, writer, reader, role and order of
actions, assume the defect is a missing call site, then try to break it scenario by scenario.

**Verdict: SHIP.** No blocker, no major. One minor (a cosmetic gap the retired "+ reason" button leaves on the OIL
tracker) and four nits. Nothing found changes what any man is owed, what a member may see or write, or what the ledger
stores.

---

## 1. The map I checked against

**Writers of an award (every door) and the command each runs as**

| Door | Writes | Command type | Checked |
|---|---|---|---|
| Bid sheet +OIL panel, give / rewrite | `setDayAward` → new entry, or `updateLedgerEntry` on the day's ONE award | `lw.award` | yes |
| Bid sheet +OIL "Remove" | `clearRecordById` → `dropLedgerIds` | `lw.award` | yes |
| Day's list Edit… | `editAward` → `updateLedgerEntry` (amount, reason, given by; never the date) | `lw.award` | yes |
| Day's list Delete | `clearRecordById` | `lw.award` | yes |
| Bid sheet Delete (one day, range) | `clearCells(cells, ids the confirm named)` | `lw.clear` (or `lw.edit` when no award is taken) | yes |
| Block Delete (SelectSheet) | `clearCells(cells, ids the confirm named)` | `lw.clear` / `lw.edit` | yes |
| OIL tracker credit / figures bar +N | `grantTo` | `lw.award` (positive OIL) / `lw.ledger` (anything else) | yes |
| OIL tracker edit / delete | `updateLedgerEntry` / `removeLedgerEntry` | by the entry's kind | yes |
| Person delete (Admin → Users, the posting pass) | `forgetPersonFrom` drops his awards from the cutoff | `person.delete` / `lw.postoutRun`, both name the award table for D | yes |
| Undo / Redo | `lwStore.write` → `applyLwRecord` per entry (upsert / delete by id) | `undo.restore` | yes |
| Archive / restore, a move, the absence door, the OIL pass, `clearRaptorCell`, `remapPersonKeys` | leave awards alone (or re-key `enteredBy`) | — | yes |

**Readers** — every one now goes through the award index (`awardsAt` / `awardsOnDay` / `oilOnDay`) or the ledger, and
none through the war's records: the merge (`mergeRow`, the people set in `mergeWar`), the grid cell and its +n mark,
the bid sheet's button label / panel / read-back, the day's list, the member's own award sheet, the read-only schedule
sheet (the schedule's credit only), the OIL tracker, the OIL breakdown, the OIL figure, the move banner (`stayingIn`),
the Delete confirms (`awardsIn`), `deletableIn`, `writeMany`'s empty-cell skip, the unpublish warning's counterfactual
(`oilCreditBidAgainst` — only the schedule's credit is taken out), `pastOnWar`, the change-history lines, the undo
describer and the undo's landing day. The grep the plan promised (`'manual'` in `src/`) returns only the D401 drop.

**Counting.** One award reaches a balance exactly once: `earnsOil` and `earnedOil` sum the schedule's automatic credits
only; `oilLedgerFor` reads awards and corrections off the ledger and skips every non-automatic credit on the day views;
`balanceOf('oil')` (the bid sheet's negative-balance check) is opening + ledger (awards and corrections) + automatic
earned − drawn, the same number. FIFO and expiry read the ledger entry's date, as a tracker grant always did; on a day
holding both, the schedule's credit is drawn on first (pinned). The literal baseline captured before the seed was
rewritten is unchanged in content (the build commit only rewrote its line endings — the numbers are byte-identical).

**Undo.** One command record per ledger entry (`lw.ledger/<id>`), values compared by deep equality, so an edit yields one
change and an unrelated later ledger write no longer blocks an earlier award's Undo (D148). A batch credit is one step.
`applyLwRecord` upserts by id and deletes by id. Ids are opaque now, never re-minted. `person.delete` stays a
not-undone type, so the delete of another man's future award refuses only the undo of *that* award, with the right
sentence.

**Permissions.** `T.award` is the ledger row `counter = oil AND amount > 0`, Admin CRUD / Member R; `lw.award`,
`lw.ledger`, `lw.clear` exist at the gate; `person.delete` and `lw.postoutRun` name the award table for D; a member's
clear never reaches an award (`awardIdsAt` answers nothing for a member) and runs as `lw.edit`; `ownershipViolation`
still refuses any `lw.ledger` change by a member. §11 of `data-model.md` carries the same row and the
`[LEDGER-READ-ASK]` note.

**Stored data.** `readRecs` drops a stored `manual` credit and keeps everything beside it (never a re-seed); `readRec`
ignores the retired take-over snapshot and the copied award fields on an automatic credit, so nothing hands an award's
worth to the schedule's record; `readLedger` keeps `enteredBy` / `enteredAt` with the same leniency as `givenBy`.

---

## 2. Findings

### F1 — MINOR — on the OIL tracker, an award given on the grid with no reason now shows a blank line and nothing says "tap to add one" (NEW)

- **Setup:** admin; a day inside a war; the bid sheet's +OIL panel; give a day with the reason box empty (the grid does
  not ask for one — plan §2.2, kept on purpose).
- **Action:** open the OIL tracker on that man; look at the award's box; on a phone, look again.
- **Expected:** the box says why the award is there, or says plainly that no reason was given and how to add one.
- **What disproves:** the box's second line is empty (`c.reason` is `''`). Before this build that box carried a
  "+ reason" button; the build retired it and made the whole box tappable, but the only cue is the hover title
  "Tap to edit this credit" — which a phone never shows. An admin scanning the tracker on his phone sees a box with a
  blank line and no way to tell it can be corrected there.
- **Evidence:** `raptor-port/src/leavewar/ui/OilTracker.tsx:463–468` (the `l2` block renders `{c.reason}` bare);
  `:456–458` (the tap and the title are the only door). Compare `git show 21869a2c:raptor-port/src/leavewar/ui/OilTracker.tsx`
  lines 636–640 (the old "+ reason" button).
- **Fix, step by step:**
  1. In `OilTracker.tsx`, in the non-editing box's `l2`, replace `{c.reason}` with:
     `{c.reason || (c.source === 'grant' ? <span className="rt muted" data-testid={`oil-noreason-${tid(c.id, c.ledgerId)}`}>{admin ? 'no reason — tap to add one' : 'no reason given'}</span> : '')}`.
  2. Add a `.oil-e .rt.muted { opacity: .6; font-style: italic }` rule beside the tracker's existing `.rt` rule in the
     Leave War stylesheet (scoped under `#page-leavewar` like the rest).
  3. Pin it in `raptor-port/src/leavewar/ui/oiltracker.test.tsx`: give an award through `setDayAward` with no reason,
     render the tracker as admin, expect the `oil-noreason-…` text; render as member, expect "no reason given".
  4. Word in `docs/ui-contracts.md`'s D400 block: "an award with no reason says so in its box".

### F2 — NIT — `setCell(pid, date, '')` by an admin on a date no war holds would still take that date's ledger awards (NEW; no production caller reaches it)

- **Setup:** an award from the OIL tracker dated in no war (D402 says it draws on no cell). Admin.
- **Action (only from a test or the probe bridge):** `setCell(personId, thatDate, '')`.
- **Expected:** refused — there is no cell to clear.
- **What disproves:** `canEditCell` passes for an admin on any date, `listAt` is empty because no war holds it, but
  `awardIdsAt` is war-agnostic, so the clear runs as `lw.clear` and drops the award. Every production caller (the sheets,
  `clearCells`, `writeMany`) hands in grid cells, so this is not reachable from a screen — but `awardsIn`, `deletableIn`
  and the plan's §2.5a all say "a day inside a war" is one of the gates, and this one door does not ask.
- **Evidence:** `raptor-port/src/leavewar/state/store.ts:2559–2569` (the clear branch), `:2773–2776` (`awardIdsAt`).
- **Fix:** in `awardIdsAt`, add `if (!warHolding(state.wars, date)) return []` before the role check (one line; every
  clearing door already reads through it). Pin: in `oilaward-onekind.test.ts`, a tracker award on a date in no war,
  `setCell(pid, date, '')` returns false and the ledger is unchanged.

### F3 — NIT — the award index re-merges a man's rows on every ledger write when his awards were entered out of date order (NEW; performance only, the result is right)

- **Setup:** one man with awards entered in the order 3 Jan, 5 Jan, 3 Jan (two on 3 Jan, entered around another day).
- **Action:** any ledger write for anyone else.
- **Expected:** his previous inner map is reused (the plan's §2.3 item 2: "only the people a write touched re-merge").
- **What disproves:** `syncAwardIndex` compares `[...old.values()].flat()` — which is grouped by date, `[A, C, B]` —
  against the new list in ledger order, `[A, B, C]`; they differ, so his map is rebuilt and his rows re-merged although
  nothing changed. Never a wrong picture, just a needless merge for that man.
- **Evidence:** `raptor-port/src/leavewar/state/store.ts:934–937`.
- **Fix:** build the new per-date map first, then reuse `old` when `old.size === m.size` and for every date the arrays
  have the same length and the same objects in order; or keep the flat list per person in the index beside the map
  and compare that.

### F4 — NIT — one record, two ceilings: the grid's doors cap an award at `MAX_GRANT_DAYS`, the tracker's editor and credit form do not (PRE-EXISTING for the tracker; now visible because it is one record)

- **Setup:** admin; the OIL tracker's award editor (or its credit bar).
- **Action:** type 99 days and save.
- **Expected:** the same refusal the +OIL panel and the day's list give ("That is more than N days") — the plan's §2.2
  wanted one validation body for one record.
- **What disproves:** `ledgerProblem` has no ceiling; only `setDayAward` and `editAward` check it (`store.ts:3940`,
  `:3968`). The tracker's Save writes 99 days, and the grid then draws an FO worth 99 days.
- **Evidence:** `raptor-port/src/leavewar/state/store.ts:3395–3405` (`ledgerProblem`), `:3940`, `:3968`. Pre-existing:
  `git show 21869a2c:raptor-port/src/leavewar/state/store.ts` — `ledgerProblem` never had the cap either.
- **Fix:** in `ledgerProblem`, after the half-step check, add
  `if (counter === 'oil' && amount > MAX_GRANT_DAYS) return \`That is more than ${MAX_GRANT_DAYS} days\`` and delete the
  two door-level copies. Pin in `oilaward-onekind.test.ts`: `updateLedgerEntry(awardId, { amount: MAX_GRANT_DAYS + 1 })`
  is refused with that sentence; a correction of any size is untouched (the cap is on awards).

### F5 — NIT — a stale comment: `bids.ts` says a cell's `note` is "at most `MAX_CELL_NOTE` characters", but an award's reason (up to `MAX_REASON`, 120) now rides that field (NEW)

- **Evidence:** `raptor-port/src/leavewar/engine/bids.ts:54–59`; the value comes from `awardContrib`
  (`engine/warrecs.ts:183–188`, `note: e.reason`) through `projRecord` (`state/merge.ts:123–126`).
- **Fix:** reword the comment: "…an award drawn on the day carries its ledger entry's reason (up to `MAX_REASON`); the
  schedule's own note is at most `MAX_CELL_NOTE`." No behaviour change — nothing reads a width off that limit.

---

## 3. Checked and found nothing

- **No reader of awards left on the war's records.** Every `recsAt` / `listAt` / `kind === 'credit'` site in production
  (`inputgate.ts:222, 290`; `sync.ts:329, 477, 546, 624, 1226, 1256, 1305, 1627`; `store.ts` clear / ingest /
  `clearRaptorCell`; `DayList`, `Matrix`) reads requests or the schedule's automatic credit only, or goes through
  `oilOnDay` / `awardsOnDay`.
- **No double or lost counting.** Balance, FIFO, expiry, the breakdown's rows (they sum to the figure — checked the
  arithmetic including a correction and an unbacked take), the unpublish warning's counterfactual, and the bid-against-OIL
  check all read an award once, from the ledger. A day in no war is counted (D79) and drawn nowhere (D402). A correction
  is never drawn.
- **The two merge caches.** `mergeWar` keys on both index versions; `mergeRow` keys on the person's inner award map;
  `resetMergeCache` empties the index and bumps its version, and `syncAwardIndex` rebuilds on a version it did not set;
  `getState` syncs before it checks its own cache. A person only another man's award touched keeps his merged row (pinned).
- **The per-entry ledger records.** Decompose per entry; apply upserts / deletes by id and keeps order; a batch is one
  step; Undo of a give clears the grid at once; Redo returns it; conflicts are per entry; `lwDateOf` and `logReversed`
  land on the entry's day; the describer names the man and "removing" when it left.
- **The command gate.** `lw.award`, `lw.ledger`, `lw.clear` are defined and mapped; `grantTo`, `updateLedgerEntry`,
  `removeLedgerEntry` pick the type from the entry's kind; `clearCells` and `setCell('')` pick `lw.clear` only when an
  award actually goes; nothing that writes the ledger still runs as bare `lw.edit` from a screen (the one indirect path,
  `setCells(cells, '')`, has no production caller — `SelectSheet.fill` never passes an empty code).
- **The confirmed-ids rule (R2-02).** Both sheets pass the ids their confirm named; `CLEAR_ONLY` narrows every clearing
  door for the length of the gesture and is restored in a `finally`; the first-tap paths (no confirm needed) recompute
  the ids at that moment. `clearRequestsAt` (the award beneath filed leave) and `writeMany` (the rest) both read through it.
- **Persistence inside one gesture.** `writeMany` runs its loop quiet and persists once; `dropLedgerIds` respects the
  same `quiet`; a clear taking a bid and an award is one envelope and one undo step.
- **Permissions.** The award row, the ledger row, the member's refusal at every award door (store and gate), the two
  delete commands naming the award table, §11 of the data model.
- **D260 / D261 / D265 / D80 / D82 / D299 / D321 / D323.** Date fixed (the tracker refuses only a changed date; the sign
  cannot flip); the block Delete offers on an award-only day and names each award by its amount; a member's own award
  opens read-only alone or via the list beside anything; a bid beside an award moves alone and the banner says the award
  stays; an award beside leave is not amber and stands nobody down; a deleted man's past awards stay and his future ones
  go inside the delete's own command; an archive takes nothing; an award may be given on a deleted man's past day.
- **D200 (2).** `enteredBy` / `enteredAt` stamped from the signed-in person on every new entry (and only the time when
  the session has no person), kept through an edit and a reload, re-keyed with the people, drawn by the live callsign
  (falling back to the typed approver) on the bid sheet's read-back, the day's list (with the date) and the breakdown.
- **D401.** A stored `manual` record is skipped, never refused; a take-over snapshot is ignored; the seed and the demo
  world carry the same worth on the same days as ledger entries; the baseline pin is intact and unchanged in content.
- **The +OIL panel.** FO / HO is derived from the days typed (no toggle to ignore); the reason box is pre-filled from
  the day's one award so a rewrite never blanks a reason by accident; several awards on a day are refused there and
  handed to the list.
- **Not walked, pinned by tests only (from the evidence sheet §4):** the changes window's three award lines from every
  door (`changelines-lw.test.ts` pins "given by Saber", "changed", "taken away", and the tracker's credit as an award
  line), the drag-block Delete, the figures bar +N, the per-entry undo conflict across a person delete. I found no code
  reason to doubt them; the owner's look would be the first eyes on the changes window for an award.

---

## 4. Verdict

**SHIP.** Fold F1 into the next small batch (it is a two-line render change plus a test); F2–F5 are one-liners or
comments and can ride with it. Nothing here needs a re-walk beyond the OIL tracker box for F1.
