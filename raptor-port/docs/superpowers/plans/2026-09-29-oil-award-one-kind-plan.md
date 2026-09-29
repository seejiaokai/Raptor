# [OIL-AWARD-IS-A-GRANT] with D400 — one kind of hand-given OIL, "earned" and "awarded" shown apart (plan, 29 Sep 26)

Branch `claude/award-earned-vs-granted-2ed66d` (cut from `main` at `21869a2c`). Rulings D401–D409; preview 4183, browser
tests `E2E_PORT=4197`; full checks through the PC lock (D228). Planned by Opus 5.5; the plan is red-teamed by Fable 5.1
and Astra, independently (D353 — an important plan's red team is BOTH), then built, walked, and both read the final code
(FULL tier — earned leave, saved data, permissions). Nothing reaches `main` without his "merge live".

**Status: r2, BUILT (29 Sep 26) — round 2's findings folded into the build (§10); no round 3 (Fable: "fold the minors
into the build"; Astra's two blockers taken whole — the owner's cap on design rounds).** Round 1's findings: §9.
r1 is in git (`4d24d4eb`). Round 1's reports: `docs/superpowers/specs/2026-09-29-oil-award-plan-redteam-fable.md`
(REVISE — 6 major, 4 minor, 3 nits) and `…-redteam-astra.md` (BLOCK — 3 blockers, 7 major, 3 minor). Both agreed the
ledger is the right one store.

---

## 0. What he asked, and the rulings in force

His brief (29 Sep 26): build `[OIL-AWARD-IS-A-GRANT]` with `[OIL-EARNED-VS-GRANTED]` folded in (D400); stored awards need
no conversion — only the demo seed changes (D401); plan first, both reviewers on the plan; the earned-leave FULL tier
(the bug-check order's question 1 — what a man is owed — with saved data and permissions).

| Ruling | What it holds this build to |
|---|---|
| **D400** (29 Sep 26) | "Earned" counts only what the app credited itself (the published schedule or an accepted duty input); every OIL an admin gives by hand — typed on the war grid OR credited from the tracker — is shown apart as "awarded". The balance itself does not change. |
| **D401** (29 Sep 26) | No stored award is converted; only the demo seed is rewritten — and a record in the old shape must still not break a load. |
| **D402** (29 Sep 26) | Every hand award shows on the grid on its date, wherever it was given (grid or tracker), as FO or HO; a tap says who gave it and why; a date in no war shows on no cell; a correction is never drawn. |
| **D147 (4)**, **D203**, **D354** | The award fix is architecture: ONE kind of award, so the database stores one form; before the tables settle. |
| **D200 (2)** | A hand award keeps WHO ENTERED IT AND WHEN — the signed-in person (by id, drawn by his live callsign) and the time, stamped by the store — separate from the typed "Given by". |
| **D166 (5)** | `approvedBy` names the signed-in admin's callsign, never "admin" when he has one. |
| **D79** | OIL may be credited by hand on ANY day. |
| **D80** | An award does not flag a leave day (it clashes with nothing). |
| **D82** | An award and a worked day ADD UP. |
| **D260** (with its readings, stated to him) | A block's Delete and the one-day Clear remove OIL awards too, the confirm naming each first; **an award never moves** — its date is the day it was earned and sets when it runs out; **an award on the wrong day is removed and given again on the right one**; (c) a block holding only awards still offers Delete. |
| **D261** | A member opens his own OIL award, read only, at every stage. |
| **D265** | A bid beside an award moves alone; the award stays where it is. |
| **D299, D321, D323** | A deleted man's past OIL stays and future goes; leave or OIL may still be added on a deleted man's past days; an archive is "posted out from today", his past kept (awards after an archive STAY — only a delete drops them). |
| **D148** | Undo reverses only the signed-in person's own changes; refuses (saying who) if someone has since changed the same thing. |
| **D142** | A day's automatic OIL comes from its latest published version — untouched here. |
| **D25** | OIL is earned leave, never pay — on screen, in comments, in this plan. |
| **D54, D56** | Harm only in stored demo data, with the code correct going forward, is not a finding. |
| **D263 / [DRAFT-PENDING]** | Every award given, changed or taken is a line in the one changes window, on its own day. |
| owner, 17 Aug 26 | "Everyone should be able to click on that person's name and see these logics" — every member sees every man's figures and breakdown. |

---

## 1. Where OIL sits today (read 29 Sep 26)

Three ways in, two stores:

1. **The automatic credit** — the published schedule or an accepted duty input — is a war record on the man's day:
   `CreditRec { kind:'credit', oil:'auto', code FO|HO, via, spans?, note? }` in `war.recs[pid][date]`.
2. **An award from the grid** — the bid sheet's +OIL panel (`Matrix.tsx onCredit` → `setManualCredit`) — is the SAME
   record kind on the same day, `oil:'manual'`, with `days?`, `note?` (≤40), `givenBy?`; at most one per day; no "who
   entered it / when".
3. **A credit from the OIL tracker** or the figures bar's "+N" on the OIL figure (`CreditForm` → `grantTo`) is a ledger
   entry `LedgerEntry { id 'ol-N', personId, counter:'oil', amount (+ grant / − correction), date, reason (required for
   OIL, ≤120), approvedBy, givenBy? }` — not drawn on the grid.

The tracker's `earned` and the breakdown's "earned by weekend/PH work" count (1) and (2); "granted" counts (3), net of
corrections. That is `[OIL-EARNED-VS-GRANTED]`.

---

## 2. The shape: ONE kind of hand award — the ledger's positive OIL entry

**Every OIL an admin gives by hand is ONE stored record: a positive `counter:'oil'` entry in the Leave War's ledger.**
The war stores no award; it DRAWS each on its day, derived on read — the way it derives an absence from the Inputs page.
Why the ledger (both reviewers agree): it is war-independent (D79; the tracker already dates grants outside any war),
already carries date, exact amount, reason, "Given by" and an approver, and is already an undo collection, a change-history
source, a permissions row and a database table (`LeaveLedger`).

### 2.1 The one record

```
LedgerEntry {
  id, personId, counter, amount, date, reason, approvedBy, givenBy?,   // as today
  enteredBy?: string   // NEW (D200 (2)): the signed-in person's id, stamped by the store on a NEW entry
  enteredAt?: string   // NEW (D200 (2)): when it was entered — an ISO date-time, stamped by the store on a NEW entry
}
```

- An **OIL award** = `counter === 'oil' && amount > 0`. A negative OIL entry is a **correction** — ledger-only, never
  drawn. Other pools' entries keep their meaning.
- `enteredBy` / `enteredAt` are stamped on every NEW ledger entry (every pool) by the store, from the session. **An edit
  keeps them** — who changed it and when is the change history's line (`editlog.ts logAction` stamps `who` and `pid` on
  every line). `approvedBy` (the callsign text, D166 (5)) stays for display until the database step; a reader shows the
  LIVE callsign of `enteredBy` when there is one, else `approvedBy`.
- **`readLedger` keeps both fields** (Fable F4): `enteredBy` — a non-empty string, kept as given (a person id); `enteredAt`
  — a string that parses as a date, else dropped with the entry kept (the same leniency as `givenBy`).
  `remapPersonKeys` re-keys `enteredBy` as it re-keys `personId`. The demo seed carries none.
- **The amount is the award's worth, everywhere** (Astra F05). FO/HO is a display class only: **HO when the amount is
  0.5, FO otherwise.** No reader of an award calls `creditWorth(code)`; the day-view contribution carries `days: amount`
  and every consumer (`awardsIn`, the tap list, the bid sheet, the member's sheet, the change lines, the undo words)
  reads the amount.
- **Reason length:** one limit for one record — `MAX_REASON` (120). The grid's +OIL panel and the tap list's editor
  take it (today they cap at 40).

### 2.2 The reason rule — two commands, one record, one validation body (Fable F7, Astra F08)

Today the tracker's form requires a reason for OIL, and the grid's +OIL panel does not. Nothing he types changes:

- `ledgerProblem(counter, amount, date, reason, givenBy, requireReason)` — ONE body; the flag replaces the internal call
  to `reasonRequired(counter)`.
- **`grantTo` (the tracker's credit and the figures bar) — reason REQUIRED for OIL**, as now. A direct blank call is
  refused.
- **`awardOil(personId, date, amount, { reason?, givenBy? })` — the grid's command, reason optional.** It writes the same
  ledger-entry kind; nothing stored says which door made it.
- **`updateLedgerEntry(id, patch)` — the reason is required only where the entry already had one**: an award given on
  the grid with no reason can have its amount corrected without inventing one; an entry that had a reason cannot lose it.
- `CreditForm` keeps asking (its own rule, `reasonRequired`).
- Named in `ui-contracts.md` under the D400 block. **The product half goes to him in the report:** "Should the grid ask
  a reason too?" (today's behaviour kept until he says).

### 2.3 How the grid draws an award (Fable F1, Astra F09)

1. **The index** lives in `state/merge.ts` beside the absence index: `AwardRows = ReadonlyMap<pid, ReadonlyMap<date,
   readonly LedgerEntry[]>>` (positive OIL entries only), `setAwardRows(ix)` bumping `AWD_VER`, `awardRows()`,
   `awardVersion()`, and **`awardsAt(personId, date)` — the ONE reader of awards on a day; nothing else scans the ledger
   for them.**
2. **Built in `store.ts getState()`**, before the wars are merged, by a store-local `syncAwardIndex(state.ledger)` that
   rebuilds only when `state.ledger !== LAST_LEDGER` (every ledger writer replaces the array). A person whose entries are
   the same objects in the same order keeps his previous inner map, so only the people a write touched re-merge. The
   outer `MERGED` cache keys on `awardVersion()` as well as `absenceVersion()`.
3. **`mergeWar`:** the cache hit requires `hit.ver === ABS_VER && hit.awd === AWD_VER`; its `people` set adds every
   person in the award index with a date inside the war's period.
4. **`mergeRow`:** takes the person's award map as a fourth input; its hit check adds `hit.awd === awd`; its dates add
   each award date inside `[start, end]`; each award becomes the contribution
   `{ id: <ledger id>, kind: 'credit', code: amount === 0.5 ? 'HO' : 'FO', win: FULL, days: amount, note: reason,
   givenBy, award: true }` — no `auto`, no `via`, no `wins`.
5. `resetMergeCache()` also clears the award index and its version.
6. **One builder for the award contribution** (`engine/warrecs.ts awardContrib(entry)`), used by the merge AND by
   `seed.ts seedSources()`, which lays the seed ledger's awards into its views too (Fable F10) — so engine tests and the
   store cannot disagree about what an award looks like.
7. **Cost:** one pass over the ledger per ledger write (tens of entries), a re-merge only for the people touched; a
   view-only render pays nothing (answers `docs/performance.md` §E).
8. **Several awards on one day** are allowed (two tracker credits on one date). The box shows the day's main code as
   today; the tap list shows each award as its own line with its own amount.
9. **Awards are never war records** — the move machinery (D265), the OIL pass, the publish door, the inputs gate and
   `listProblem` no longer see them. Every question "is there an award here?" goes through `awardsAt`.

### 2.4 Earned, awarded, corrections — apart (D400; Astra F06, Fable Q5)

- `dayview.earnsOil` counts the AUTOMATIC credits only. `counters.earnedOil` (which sums it) is automatic only.
- `oiltracker.oilLedgerFor` reads automatic credits off the day views (skips any `!credit.auto`) and every award and
  correction off the ledger: `earned` = automatic only; **`awarded`** (renamed from `granted`) = positive OIL entries only;
  **`corrections`** = negative OIL entries only (a new field). The `manual` flag on `OilCredit` goes.
  `sync.ts oilCreditBidAgainst` omits `source === 'auto'`.
- **The signed equation:** `balance = opening + earned + awarded + corrections − taken − expired` (corrections are
  negative). The same number as today for every person — pinned against a LITERAL baseline captured from the seed BEFORE
  it is rewritten (Astra F12), never recomputed from the new seed.
- **The OIL breakdown** (`balParts` for OIL only): "opening figure", **"earned by weekend/PH work"**, **"awarded"**
  (itemised beneath: amount · date · by <live callsign of `enteredBy`, else `approvedBy`> · (given by) · reason),
  **"corrections"** — only when one exists, itemised the same way — "OIL taken", "expired" (only when something expired).
  The rows sum to the figure. **Every other pool keeps "granted" exactly as today.**
- **The OIL figure's caption:** "The OIL tracker's balance: earned by weekend/PH work + awarded − taken − expired", and
  "… + awarded + corrections − taken − expired" wherever a person's own breakdown carries corrections (the caption is
  the figure's, so it names corrections always: "earned by weekend/PH work + awarded ± corrections − taken − expired").
- **The tracker's boxes** (Fable N2, Astra F07): an automatic credit keeps its "Auto" tag; an award shows "Given by"
  only when one was typed — never the enterer in that place. Who entered it is in the breakdown's line.

### 2.5 The writers — every door

| Door | Writes today | Writes after |
|---|---|---|
| **Grid: the bid sheet's +OIL panel** (days / reason / given by; "Remove") — the one grid door | a `manual` war record | `awardOil` adds the day's award, or rewrites it (`updateLedgerEntry`) when the day holds exactly ONE award — one command, one undo step. On a day holding SEVERAL awards the panel edits none: "This day holds N OIL awards — change them from the day's list"; its button reads "N OIL awards" (Fable N3). "Remove" removes the one award. |
| `setCell(pid, date, 'FO'|'HO')` and the range / batch writers reaching it — no screen offers it (tests, the dev probe bridge) | a bare `manual` war record | REFUSED (false). **`cellProblem('FO'|'HO')`** returns the same refusal, in words: "OIL is given from the day's +OIL panel or the OIL tracker" (Fable F9, Astra F04). Tests move to `awardOil`. |
| Tap list "Edit…" (`editManualCredit`) | the war record | `updateLedgerEntry` on that award's id — amount, reason, given by; **never the date** |
| `setCellNote` / `setCellDays` / `setCellGivenBy` — no production caller | the war record | DELETED with their tests; `engine/bids.ts`'s comment naming `setCellNote` corrected |
| **Delete / Clear** — the tap list's Delete (`clearRecordById`), the bid sheet's one-day and range Delete and the block Delete (`clearCells` → `clearRequestsAt(…, awards)` / `writeMany` → `setCell('')`) | drops the war record | see §2.5a |
| OIL tracker: credit N people (`grantTo`); edit a grant (`updateLedgerEntry`); delete (`removeLedgerEntry`) | ledger | unchanged, except: **an award's date is FIXED** — the tracker's editor shows it read only on a positive OIL entry, and `updateLedgerEntry` refuses a `date` patch on one (Astra F01; D260's reading "an award never moves … removed and given again on the right one"). A correction and every other pool keep their date editor. |
| Figures bar: +N on the OIL figure for a dragged run (`grantTo`) | ledger | unchanged — it already writes awards of the one kind (and now they show on the grid, D402) |
| The tracker's "+ reason" editor on a grid award (`canNote`, `saveNote`, `MAX_CELL_NOTE` import) | the war record | GONE — every award opens the tracker's grant editor |

**The gates stay door by door:** the grid's doors keep `canEditCell` / `canEditRow` / admin; the tracker's keep admin, any
date. The store refuses a member at every award door.

#### 2.5a Delete / Clear — one preflight, the same records named and taken (Fable F2, F3; Astra F04)

1. **`awardIdsIn(cells)`** — the one preflight: the ledger ids of every award on the cells, after the SAME gates the clear
   uses (admin; `canEditCell` / `canEditRow`; a day inside a war). `awardsIn` (the confirm's names and amounts — the
   ledger amount, Astra F05), `deletableIn` and the clear itself all read it — so what is offered, named and taken is one
   list.
2. **`deletableIn`:** a day counts when it holds a request the role may clear, or — for an admin — `awardsAt(…).length > 0`
   (D260 (c): a block holding only awards offers Delete; a member gets no Delete for an award).
3. **`writeMany`'s empty-cell skip** (2577) also asks `awardsAt(…).length === 0` before skipping.
4. **`setCell(…, '')`** removes, for an admin, every award on the day beside the war records it filters — "changed" when
   either store changed.
5. **`clearRequestsAt(…, awards = true)`** removes the day's awards through the same helper.
6. **`clearRecordById`** finds a credit id in `awardsAt` and removes that one award.
7. **One command:** every clearing door calls a store-internal `dropLedgerIds(ids)` (which `removeLedgerEntry` also calls),
   inside the door's `gesture`, so the war records and the awards leave in ONE envelope and ONE undo step — never a second
   `persistNotify`.

### 2.6 The readers — every place that asks about awards

Each moves from `recs … oil === 'manual'` to `awardsAt(personId, date)` (and reads the amount):

- `dayview.ts` — `creditRank` (auto above an award, unchanged), `forbiddenPair`'s award exemption (D80, unchanged — an
  award contribution carries no `auto`), `duty` auto-only (unchanged), `earnsOil` auto-only (§2.4).
- `counters.ts` — `earnedOil`, `balParts`, the OIL `desc` (§2.4); `grantsFor` stays for the other pools; OIL itemises
  `awardsFor` / `correctionsFor`.
- `oiltracker.ts` — §2.4.
- `merge.ts projRecord` — an award main record stays `source:'bid'` (not locked).
- `charge.ts legacyViews` — tests' grid+states path; a non-raptor credit reads as an award (unchanged meaning).
- `Matrix.tsx` — **D261 (Astra F02):** `ownAwardOnly` becomes `ownAwardPresent` — a member's cell opens read-only
  whenever ANY contribution in `view.all` is one of his awards (not only an unmarked single main); a cell with several
  records (an award beside anything, or two awards) opens the tap list read-only for him; another man's award detail
  stays closed to a member. `cellOpenable`, `AwardSheet`, `displayCell`, `stayWords`, `creditShown`. **`openCredit`**
  reads the award from the index; **`openAnyCredit`** keeps reading the SCHEDULE's credit from the records (the read-only
  sheet's read-back — Fable N3); `openWorkOnly` counts an award from the index.
- `BidPicker.tsx` — the +OIL panel and its label (§2.5), the read-only credit block, `OilDetailRows`, `AwardSheet`, the
  Delete confirm (§2.5a).
- `DayList.tsx` — an award line reads the award (amount, reason, given by, who entered it); "worked HH:MM" only for an
  automatic credit; Edit and Delete for an admin.
- `OilTracker.tsx` — `canNote` and the note editor go; `canEdit` for every award and correction; the award's date read only.
- `awardwords.ts` — amounts from the ledger.
- `sync.ts` — `oilCreditBidAgainst` (§2.4); the dead `credits` variable (339) deleted; the clash wording (625–628) — a
  credit named there is the schedule's (an award clashes with nothing); **`pastOnWar`** (Astra F03) also counts a
  positive OIL ledger entry dated before the cutoff as the man's past on the war, so a man whose only past fact is an
  award keeps his row.
- `inputgate.ts` — auto only (unchanged).
- `state/changelines.ts` — `warLines` / `crossLines` lose their award branch; `ledgerLines` reads ONE entry per change
  (§2.6b) and words an OIL award "OIL award given / changed / taken away" with its amount; a changed line's from/to carry
  the day. (A date never changes on an award now; a correction's date change carries `wdate` — Fable F8.)
- `undo/describe.ts` — the `lw.ledger` branch names an award ("X's OIL award" / "removing X's OIL award"), else "an OIL
  entry"; the `lw.cell` credit branch keeps the schedule's credit only.
- `state/perms.ts` + `data-model.md` §11 — §2.6c.

#### 2.6a A person deleted, archived or restored (D299, D321, D323)

`forgetPersonFrom(id, iso)` (the delete command) drops his war records dated on or after the cutoff — and now **also his
OIL awards (positive OIL entries) dated on or after the cutoff**, inside the same command (what the delete takes today).
Corrections and other pools: untouched, as today. His past awards stay (D299); `pastOnWar` keeps his row (§2.6). An award
may still be added on a deleted man's past days (D321 — `awardOil` accepts a `gone` man, as `grantTo` does). **An archive
drops nothing** (D323 — "posted out from today", his past kept; that is today's behaviour for a grid award too).

#### 2.6b The ledger in small pieces for undo — done in this build (Fable F6, Astra F11)

Round 1's reason for keeping one record was wrong: the app's own delete (D287, not an Undo step — D350) and the posting
pass write the ledger inside their own commands, and with ONE record for the whole ledger every earlier award's Undo is
then refused ("a later change to a person … touches the same thing"). So:

1. `lwDecompose`: one record per entry — `lw.ledger/<entry.id>`, value the entry (drop `lw.ledger/all`).
2. `applyLwRecord` `case 'lw.ledger'`: upsert by id (replace in place, or append), delete removes it — order stable.
3. **A batch** (credit N people) stays ONE command, ONE undo step, N record changes.
4. `ledgerLines(c)`: `c.before` / `c.after` are one entry each — "given" when only after, "taken away" when only before,
   "changed" when both differ.
5. `undo/derive.ts`: `warOf` returns null for `lw.ledger/<id>` (the step lands on the war page, as today); **owner** — the
   entry's `personId` (from before/after), like `lw.cell`'s pid. `perms.ts ownershipViolation` still refuses any
   `lw.ledger` change for a member.
6. `registry.ts` maps the collection to the `leavewar/ledger` storage key whatever the id — `rawPersist` still writes the
   whole array (the storage half of small pieces stays `[DB-READINESS]` (1)'s).
7. Tests: one award's undo; an N-person batch as one step (and redo); an award, then a person delete dropping ANOTHER
   man's future award, then Undo → the first award is undone; an unrelated entry changed since does not block; the same
   entry changed since refuses and names who.

#### 2.6c Permissions (Astra F10, Fable F5)

- **The award keeps its own permission row** — its table becomes `LeaveLedger`, its row predicate
  `counter = oil AND amount > 0`: **Admin C R U D; Member R (every man's — the grid draws every row, D402); guest and
  pending: none.** `perms.ts` keeps `T.award` as that class; `mayAwardOil` asks it; every award door asks `mayAwardOil`.
- **Every other `LeaveLedger` row stays as §11 says today — Member R own** — this build widens nothing else.
- **A question for him, not decided here** (filed as `[LEDGER-READ-ASK]`): the app has ALWAYS shown every member every
  man's OIL tracker (corrections too) and every man's breakdown (other pools' grants too — owner, 17 Aug 26), while §11
  says a member reads only his own ledger rows. Which is right: the app as built (everyone sees everyone's), or §11 (own
  only)? Until he answers, both stay as they are and §11 carries a note naming the gap.
- `perms.test.ts` / `perms-scan.test.ts` green; tests that a member sees another man's award box, opens only his own
  award's detail, and writes no award.

#### 2.6d Hours on an award

An award is not an attendance record (N13): none carries work hours after this.

### 2.7 Old records (D401)

A stored war record with `oil:'manual'` — or an automatic credit carrying the retired take-over snapshot — is DROPPED on
read (the automatic credit kept, the snapshot ignored), never converted, never refused (a refusal re-seeds EVERY war).
The retired machinery goes: `CreditRec.manual`, `splitTakenOver`, the outer award-field recovery in `readRec`, the
`manual` side of `listProblem`. A test: a stored blob holding an `oil:'manual'` record and a take-over snapshot loads with
every other record kept and nothing re-seeded.

### 2.8 The demo seed

`seed.ts seedRecs` loses its four `credit()` awards (ramp 3 Jan FO, tata 1 & 4 Jan FO, skin 3 Jan HO); they become ledger
awards of the same worth and date in `seedLedger`, beside its two OIL grants (jaguar +2 19 Jan, asics +1.5 2 Feb — now on
the grid too, D402), `approvedBy: 'SQNCDR'`, a short reason. `demoworld.ts`'s nine awards (dusk's 3-day "OC Ops" among them)
become ledger awards the same way, beside its four ledger rows (dol-3, a −1 correction, stays one). **Before the rewrite, a
LITERAL baseline** of every seeded person's OIL figure and FIFO allocation is written into a test; the rewritten seed must
match it.

---

## 3. His decisions

- **D402 — ANSWERED 29 Sep 26, "Yes, show it."** Every hand award shows on the grid on its date, wherever given.
- **To put to him in the report, each as today until he says:** (a) should the grid's +OIL ask a reason too (§2.2)?
  (b) `[LEDGER-READ-ASK]` (§2.6c). (c) Named so he can correct them: an award's date can no longer be changed from the
  tracker — delete it and give it again (D260's reading); corrections show as their own row in the OIL breakdown.

## 4. What does not change

Every person's balance (only its parts are named). The automatic pass, the publish door, D142. Manning, clashes (D80),
charges. Every pool other than OIL. The OIL tracker's FIFO and expiry. The ledger's storage key. The award's writers:
admin only.

## 5. Tests — red first

1. One kind: `awardOil` writes a ledger award and no war record; a tracker credit and a grid award read the same everywhere.
2. D400: a worked Saturday + a 3-day award → breakdown earned 1, awarded 3; tracker `earned 1`, `awarded 3`; with a −0.5
   correction: corrections −0.5; rows sum; the exact arithmetic of Astra F06 (opening 2, earned 1, awarded 2, correction
   −0.5, taken 1 → 3.5).
3. The literal seed baseline (§2.8), captured first.
4. D82 both orders; D79 (weekday, a day in no war, a published war's day); D80 (no amber).
5. D260: block Delete / one-day / range Delete over an award-only day and over an award beside leave — offered, named
   with its exact amount, taken, one Undo returns it; a 3-day award named "3 days".
6. D261 / Astra F02: a member's own award alone, beside an automatic credit, two awards — opens read only at every stage;
   another man's — no detail.
7. D265: a bid beside an award moves alone; `stayingIn` names the award.
8. D200 (2): a new award stores `enteredBy` and `enteredAt`; they survive `readLedger` and an edit by another admin; the
   breakdown line follows a rename.
9. D402: a tracker credit inside a war shows FO/HO on the grid at once (no other change); outside any war, on no cell; a
   correction never; undo of the credit clears the box at once.
10. Several awards on one day: the tap list lists each; the +OIL panel edits none and says so.
11. The date is fixed: no date editor on an award; a direct date patch refused; a correction's date still editable.
12. The reason rule: blank `grantTo` refused; blank `awardOil` accepted; amount edit of a reasonless award accepted;
    blanking an existing reason refused.
13. D401: an old-shape blob loads, nothing re-seeded.
14. Undo granularity (§2.6b item 7).
15. Change history: given / changed / taken away with amounts, on the award's day, from every door; none for the
    automatic credit.
16. D299 / Astra F03: delete drops future awards, keeps past; a man whose only past fact is an award keeps his row.
17. Permissions (§2.6c).
18. The merge cache: an award-only person/date appears; another person's merged row keeps its identity.

---

## 6. The bug check — FULL tier

- **Roll-call:** every place the app draws an award — the grid cell (desktop, phone, the frozen overlay), the bid sheet's
  +OIL panel and read-back, the tap list, the member's read-only sheet, the read-only schedule sheet, the OIL tracker box,
  the breakdown sheet, the person's figures sheet, the figure column and drawer, the move banner, the Delete confirms, the
  changes window and its gold dot, the undo bubble — has it / must not, because / MISSING.
- **Door check:** every way to give, change and take an award — the +OIL panel, the tap list's Edit and Delete, the bid
  sheet's Delete (one day, range), the block Delete, the tracker's credit / edit / delete, the figures bar on OIL, a person
  delete, Undo, Redo — at every war stage, both roles.
- **Walk:** both widths, a scripted browser, a world holding a worked Saturday + an award, two awards on one day, a
  tracker credit inside and outside a war, a 3-day award, a correction, a member's own award, a published war.
- **Scenario design:** Astra (D353 — one reviewer, Astra first), asked what is MISSING.
- **The final reads:** Fable and Astra, blind to each other, given the finished code AND the evidence sheet.
- **Gates:** unit, build, tfin 728/0, e2e, Tracker smoke, rulecheck, docsize — under the PC lock.

## 7. Documents the change keeps true (D201; a code change never trims, D29)

`docs/data-model.md` (`LeaveBid` loses `manual`; `LeaveLedger` gains `enteredBy` / `enteredAt` and is the one award; §11
the award row and the `[LEDGER-READ-ASK]` note), `docs/data-schema.md` (the WarRec and ledger rows), `docs/ui-contracts.md`
(the D400 / D402 block marked BUILT; the breakdown rows; the tracker's box; the +OIL panel on a several-award day; the
fixed date), `docs/engine-rules.md` (its lines on "an OIL award given / changed / taken, on the grid and on the ledger"),
`docs/undo-contract.md` (the ledger's records), `docs/file-map.md` for any new file, the one-absence register's N11 / N13 /
N16 rows (a pointer), `OUTSTANDING.md` (`[OIL-AWARD-IS-A-GRANT]`, `[OIL-EARNED-VS-GRANTED]`, `[DB-READINESS]` (1) — the
ledger's command records done, its storage still whole; `[LEDGER-READ-ASK]` filed; `[OIL-WORDS]` — the touched files'
comments swept, `OilTracker.tsx`'s header among them — Astra F13). `docs/handover-dataverse.md` states nothing about the
award today — nothing to keep true there.

## 8. Risks

- **A reader left on `recs`** — the roll-call; after the build, `grep "'manual'"` in `src/` returns only the D401 drop.
- **Double counting** — the literal seed baseline and test 2.
- **The merge cache** — test 18 and test 9's "at once".
- **Test churn** — ~50 files name the old shape; each is rewritten to the one kind, never weakened.

## 9. Round 1 — every finding and what was done

| Finding | Done |
|---|---|
| Fable D138 — D401's short line lost its guard | corrected (commit `002fd094`, the short line and the full row) |
| Fable F1 / Astra F09 — the award index's path into both cache layers | §2.3 items 1–7 |
| Fable F2 / F3, Astra F04 — the clearing call sites, `deletableIn`, `writeMany`, `cellProblem` | §2.5a, §2.5 (`setCell` row) |
| Fable F4 — `readLedger` drops the new fields | §2.1 |
| Fable F5 / Astra F10 (BLOCKER) — the award's permission row | §2.6c — the award keeps its own class (read by every member); the rest of the ledger unchanged; the gap filed as `[LEDGER-READ-ASK]` |
| Fable F6 / Astra F11 (BLOCKER) — one ledger record for undo | §2.6b — split per entry, in this build |
| Fable F7 / Astra F08 — the reason rule | §2.2 — two commands, one validation body |
| Fable F8 — a re-dated award's line | moot for awards (§2.5, the date is fixed); kept for corrections (§2.6) |
| Astra F01 (BLOCKER) — re-dating contradicts D260 | §2.5 — the award's date is fixed (Fable's opposite reading overruled by D260's full row: "an award never moves … removed and given again on the right one") |
| Astra F02 — several awards close D261's door | §2.6 `ownAwardPresent` |
| Astra F03 — `pastOnWar` | §2.6, §2.6a |
| Astra F05 — worth from the code | §2.1 — the amount is authoritative |
| Astra F06 — corrections' arithmetic and caption | §2.4 |
| Astra F07 / Fable N2 — the tracker box's giver | §2.4 — "Given by" only when typed |
| Fable F9 — `cellProblem` | §2.5 |
| Fable F10 — `seedSources` | §2.3 item 6 |
| Astra F12 — the seed pin | §2.8, §5 test 3 |
| Astra F13 / Fable N1 — D25 words | §0 wording; `[OIL-WORDS]` sweep of touched files |
| Fable N3 — small leftovers | §2.5 (+OIL label), §2.6 (`openCredit` / `openAnyCredit`), §2.5 (`MAX_CELL_NOTE`, `bids.ts`), §7 (handover, engine-rules) |

## 10. Round 2 — every finding and what the build did

Reports: `docs/superpowers/specs/2026-09-29-oil-award-plan-redteam-r2-fable.md` (APPROVE — 18 done, 1 partial, 5 minor,
4 nits) and `…-redteam-r2-astra.md` (BLOCK — 2 blockers, 4 major/minor).

| Finding | Done in the build |
|---|---|
| Astra R2-01 (BLOCKER) — the award's permission class not at the command gate | new command types `lw.award` (T.award U), `lw.ledger` (T.ledger U), `lw.clear` (T.bid U + T.award D); `person.delete` and `lw.postoutRun` name T.award D (`state/perms.ts`, `store.ts lwRegisterCommands`) |
| Astra R2-02 (BLOCKER) — a Delete could take an award its confirm never named | the sheets pass the confirm's award ids into `clearCells(cells, awardIds)`; only those go (`CLEAR_ONLY`) |
| Astra R2-03 / Fable N5 — recyclable `ol-N` ids | a new entry's id is opaque (`newRecId('ol-')`), never re-minted |
| Astra R2-04 / Fable N4 — Undo / Redo lines dated today | `logReversed` reads a ledger entry's date(s) |
| Fable N3 — an award's Undo lands on no day | `undo-wire.ts lwDateOf` reads a ledger entry's date |
| Astra R2-05 — the reason rule changed other pools | an award keeps a reason only if it had one; a correction needs one; other pools their own rule |
| Astra R2-06 / Fable partial — the caption | one caption: "opening + earned by weekend/PH work + awarded + corrections − taken − expired" |
| Astra R2-07 / Fable N7 — the cache reset | the award version only ever rises; `syncAwardIndex` rebuilds on a version it did not set |
| Fable N1 — the date refusal on every tracker Save | refused only when the date CHANGES |
| Fable N2 — re-dating by flipping the sign | an OIL entry keeps its sign |
| Fable N6, N8, N9 — nits | caption single form; the several-award case tested; T.award's gap marker gone (its row is now the award's; the ledger row carries `[LEDGER-READ-ASK]`) |

**One departure from §2.6b:** the per-entry ledger record keeps NO owner in `undo/derive.ts` (the plan said the entry's
person). Ownership there only decides whether a MEMBER may reverse a change, and no member ever writes the ledger
(`perms.ts ownershipViolation` refuses it); giving it an owner would widen nothing and add a path to get wrong.
