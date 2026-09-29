# [OIL-AWARD-IS-A-GRANT] with D400 — one kind of hand-given OIL, "earned" and "awarded" shown apart (plan, 29 Sep 26)

Branch `claude/award-earned-vs-granted-2ed66d` (cut from `main` at `21869a2c`). Rulings D401–D409; preview 4183, browser
tests `E2E_PORT=4197`; full checks through the PC lock (D228). Planned by Opus 5.5; the plan is red-teamed by Fable 5.1
and Astra, independently (D353 — an important plan's red team is BOTH), then built, walked, and both read the final code
(FULL tier — earned leave, saved data, permissions). Nothing reaches `main` without his "merge live".

**Status: DRAFT r1 — for the red team.** Nothing is built.

---

## 0. What he asked, and the rulings in force

His brief (29 Sep 26): build `[OIL-AWARD-IS-A-GRANT]` with `[OIL-EARNED-VS-GRANTED]` folded in (D400); stored awards need
no conversion — only the demo seed changes (D401); plan first, both reviewers on the plan; money-tier check.

| Ruling | What it holds this build to |
|---|---|
| **D400** (29 Sep 26) | "Earned" counts only what the app credited itself (the published schedule or an accepted duty input); every OIL an admin gives by hand — typed on the war grid OR credited from the tracker — is shown apart as "awarded". The balance itself does not change. |
| **D401** (29 Sep 26) | No stored award is converted; only the demo seed is rewritten; an old-shape record must still not break a load. |
| **D147 (4)**, **D203**, **D354** | The award fix is architecture: ONE kind of award, so the database stores one form; before the tables settle. |
| **D200 (2)** | A hand award keeps WHO ENTERED IT AND WHEN — the signed-in person (by id, drawn by his live callsign) and the time, stamped by the store — separate from the typed "Given by". `data-model.md` §11 states it. |
| **D79** | OIL may be credited by hand on ANY day (the weekend/holiday limit is the automatic pass's). |
| **D80** | An award does not flag a leave day (it clashes with nothing). |
| **D82** | An award and a worked day ADD UP; the schedule's credit and a typed award never change each other. |
| **D260** | A dragged block's Delete and the one-day Clear remove OIL awards too, and the confirm names each first. |
| **D261** | A member opens his own OIL award, read only, at every stage. |
| **D265** | A bid that shares its day with an award moves alone; the award stays where it is. |
| **D142** | A day's automatic OIL comes from its latest published version — untouched here. |
| **D299** | A deleted man's past OIL stays; he leaves the tracker. |
| **D25** | OIL is earned leave, never "pay" or "money" — in words on screen and in comments. |
| **D54, D56** | Harm that lives only in stored demo data, with the code correct going forward, is not a finding. |
| **D263 / [DRAFT-PENDING]** | Every award given, changed or taken is a line in the one changes window, on its own day. |

---

## 1. Where OIL sits today (read 29 Sep 26 — `[OIL-AWARD-IS-A-GRANT]`'s note)

Three ways in, two stores:

1. **The automatic credit** — the published schedule, or an accepted duty input — is a war record on the man's day:
   `CreditRec { kind:'credit', oil:'auto', code FO|HO, via, spans?, note? }` in `war.recs[pid][date]`.
2. **An award typed on the war grid** is the SAME record kind on the same day, `oil:'manual'`, with `days?`, `note?`
   (reason, ≤40), `givenBy?`. At most one per day (`listProblem`). No "who entered it / when".
3. **A credit from the OIL tracker** (and the figures bar's "+N for everyone I dragged" on the OIL figure) is a ledger
   entry: `LedgerEntry { id 'ol-N', personId, counter:'oil', amount (positive = grant, negative = correction), date,
   reason (required for OIL, ≤MAX_REASON), approvedBy (callsign text), givenBy? }` in `state.ledger`. It is NOT drawn
   on the war grid.

The tracker's `earned` and the breakdown's "earned by weekend/PH work" count (1) AND (2) — by where a record is stored,
not how it came; "granted" counts (3). That is the whole of `[OIL-EARNED-VS-GRANTED]`.

---

## 2. The shape: ONE kind of hand award — the ledger's OIL grant

**Every OIL an admin gives by hand is ONE stored record: a positive `counter:'oil'` entry in the Leave War's ledger.**
The war no longer stores awards at all; it DRAWS each one on its day, derived on read from the ledger — the way it
already derives an absence from the Inputs page. The war's own records keep only what is the war's: requests, the
automatic credits, notices.

Why the ledger and not the war record (the two ways it could go):
- **The ledger is war-independent**, as an award is: D79 lets an award sit on ANY day, and the tracker already gives
  one on any date — including a date no war covers. A war record exists only inside a war's period.
- **The ledger already carries** the date, the amount (any half-step, what the grid calls `days`), the reason, the
  "Given by", and an approver, and it is already undoable (`lw.ledger`), already written to the change history
  (`ledgerLines`, dated on the entry's own day), already stored as its own table in the data model (`LeaveLedger`).
- The war record would need all of that added and would still be stuck inside one war.

### 2.1 The one record

```
LedgerEntry {
  id, personId, counter, amount, date, reason, approvedBy, givenBy?,   // as today
  enteredBy?: string   // NEW (D200 (2)): the signed-in person's id, stamped by the store; drawn by his LIVE callsign
  enteredAt?: string   // NEW (D200 (2)): the time it was entered, ISO, stamped by the store
}
```

- An **OIL award** is `counter === 'oil' && amount > 0`. A negative OIL entry stays a **correction** — ledger-only, never
  drawn on the grid. Other pools' entries are untouched in meaning.
- `enteredBy` / `enteredAt` are stamped by the store on EVERY new ledger entry and refreshed on an edit? — **No: kept
  from the first entry; an edit is the change history's to record** (who changed it and when is already a history
  line). *(Red team: challenge this.)* `approvedBy` (the callsign text) stays for the reader until the database step,
  where `enteredBy` replaces it; the breakdown shows the LIVE callsign of `enteredBy` when present, else `approvedBy`.
- **The grid's "code"** is not stored: an award is drawn **HO when its amount is 0.5, FO otherwise**, and its worth is
  its amount. The grid's `days` box IS the amount. (Today an award could be "HO worth 3 days"; one kind makes that
  unrepresentable — FO "3 days". D401: nothing stored is converted.)
- **Reason length:** one limit for one record — `MAX_REASON` (the ledger's). The grid's day window and tap-list editor
  take the same limit (today they cap at 40, `MAX_REC_NOTE`).

### 2.2 The reason rule — decided, no change for him

Today the tracker's credit form REQUIRES a reason for OIL (`reasonRequired`), and a grid award needs none (one tap on
FO). One kind, one store — but two doors. **Decision: each door keeps what it asks today.** The store's award writer
takes an optional reason; the tracker's credit form (and the figures bar on OIL) still refuses a blank one, as now. So
nothing he types changes. The boot reader already accepts a blank reason (it gates at the write path only).
*(Red team: is "the door asks, the store accepts" a drift seam? The alternative is to require a reason on the grid —
a behaviour change for him, which would be his call.)*

### 2.3 How the grid draws an award

- A per-person, per-date **award index** built from the ledger (positive OIL entries), versioned like the absence index
  (`merge.ts setAbsenceRows`): the merge adds each award on a day inside the war's period as a day-view contribution
  `{ kind:'credit', auto:false, code FO|HO, days: amount, note: reason, givenBy, id: <ledger id>, award: true }`.
  The merge cache keys on it, so a ledger change re-merges only the people it touched.
- **Several awards on one day** are allowed now (two tracker credits on one date). The box shows the day's main code as
  today; the tap list shows every award as its own line (it already lists records one per line).
- **Awards are never war records** — so a move (D265), the OIL pass, the publish door, the inputs gate and the per-day
  rules (`listProblem`) no longer see them at all. Every place that ASKS about awards on a day asks the ledger through
  ONE helper (`awardsOn(personId, date)`), never `recs`.

### 2.4 Earned and awarded, apart (D400)

- `dayview.earnsOil` → counts the AUTOMATIC credits only (renamed in meaning: "earned"). Awards reach the balance once,
  through the ledger — never twice.
- `counters.earnedOil` → automatic only (it sums `earnsOil`). `balanceOf(…,'oil')` = opening + ledger (awards and
  corrections) + earned − taken: **the same number as today** for every person (pinned by test on the seed, before and
  after — the seed's two hand awards become ledger awards of the same worth).
- `oiltracker.oilLedgerFor` → reads the automatic credits off the day views (`source:'auto'`) and every award off the
  ledger (`source:'grant'`); its `earned` becomes automatic-only and its `granted` every hand award. The `manual` flag on
  an `OilCredit` goes (no award is read off the grid any more).
- **The OIL breakdown** (the figure sheet, `balParts` for OIL): "opening figure", **"earned by weekend/PH work"**
  (automatic only), **"awarded"** (every hand award, itemised beneath as the "granted" row is today: amount · date · by
  whom (the live callsign) · given by · reason), **"corrections"** (only when a negative OIL entry exists, itemised the
  same way), "OIL taken", "expired" (as today, only when something expired). The rows still sum to the figure.
  Every other pool keeps "granted" exactly as today (D400 is about OIL). *(Red team: is splitting corrections off
  "awarded" right, or should they sit inside it? The ruling names only "earned" and "awarded".)*
- **The OIL figure's caption** (`FIGURES` `desc`): "The OIL tracker's balance: earned by weekend/PH work + awarded −
  taken − expired".
- **The tracker's boxes:** an automatic credit keeps its "Auto" tag; an award shows its "Given by" (or the live
  callsign of who entered it when none was typed — *red team: or nothing, as today?*).

### 2.5 The writers — every door becomes a ledger write

| Door (today) | Writes today | Writes after |
|---|---|---|
| Grid: the bid sheet's +OIL panel ("Grant OIL — a day or half a day off in lieu", its days / reason / given by, `Matrix.tsx onCredit` → `setManualCredit`; its "Remove" → `onCreditClear` → `clearRecordById`) — **the one real grid door** | a `manual` war record | adds the day's award, or rewrites it when the day holds exactly ONE award (one command, one undo step); on a day holding SEVERAL awards the panel edits none of them — it says "This day holds N OIL awards — change them from the day's list" and the tap list carries each |
| `setCell(pid, date, 'FO'|'HO')` and the range / batch writers that reach it — **no screen offers it** (the pickers list leave types only); reached by tests and the probe bridge's `w.lwSetCell` | a bare `manual` war record | REFUSED (returns false) — a bid code is what `setCell` writes; an award has its own door. Every test that used it is moved to `setManualCredit` |
| Tap list / day window "Edit…" (`editManualCredit`) | the war record's fields | `updateLedgerEntry` on that award's id (amount, reason, given by — its date stays) |
| The three single-field editors `setCellNote` / `setCellDays` / `setCellGivenBy` — **no production caller** | the war record's fields | DELETED with their tests (the doors they served are gone since the one-step editor) |
| Tap list / bid sheet Delete, Clear, range Clear, dragged block Delete (`setCell ''`, `clearRecordById`, `clearRequestsAt(…, awards)`, the range and block paths) | drops the war record | removes the award(s) on those days (the same gates as today: an admin, a day the cell editor may touch) |
| OIL tracker: credit N people; edit a grant; delete a grant | ledger | unchanged |
| Figures bar: +N on OIL for a dragged run (`grantTo`) | ledger | unchanged (it already writes awards of the one kind) |
| The tracker's "+ reason" editor on a grid award (`canNote`) | the war record | GONE — every award is edited by the tracker's grant editor (amount, date, reason, given by) |

**The tracker's grant editor now reaches every award**, a grid-given one included: it edits amount, DATE, reason and
given by, and it asks for a reason (its form's rule, §2.2). So an award given on the grid with no reason is saved from
the tracker only once a reason is typed — the grid's own editors never ask. Changing an award's date there moves it on
the grid (D265 is about a BID moving beside an award; an admin re-dating the award itself is a correction, and the
change history says it). *(Red team: is re-dating from the tracker acceptable, or should an award's date be fixed?)*

**The gates stay where they are, door by door.** The grid's doors keep their stage / window / row gates
(`canEditCell`, `canEditRow`, admin) — so a published war's grid behaves exactly as now; the tracker's doors keep theirs
(admin, any date). The store refuses a member's award write at every door (it does today).

### 2.6 The readers — every place that asks "is there an award here?"

Filled from the roll-call in §6 — each one moves from `recs … oil === 'manual'` to `awardsOn(personId, date)`:
`awardsIn` (D260's confirm), `stayingIn` (the Move sheet's "stays behind"), the bid sheet (`BidPicker` day window —
`openCredit` / `openAnyCredit` / `openWorkOnly`), the tap list (`DayList`), the member's own award (D261, `Matrix.tsx`
~305), the change history (`changelines.ts` — `warLines` / `crossLines` lose their award branch; `ledgerLines` words an
OIL award as "OIL award given / changed / taken away", on its own day), the posting-out / delete / archive paths (what
happens to a man's awards dated after he leaves — §3), the undo describer (`describe.ts` "an OIL entry").

The full reader list, from the map (29 Sep 26): `dayview.ts` (`creditRank`, `forbiddenPair`'s award exemption — D80 —
`duty` auto-only, `earnsOil`); `counters.ts` (`earnedOil`, `balParts`, `FIGURES` OIL `desc`); `oiltracker.ts`
(237–256 the award as `source:'auto', manual:true`); `merge.ts projRecord` (an award is `source:'bid'`, not locked);
`charge.ts legacyViews` (tests' grid+states path — unchanged meaning: a non-raptor credit is an award);
`Matrix.tsx` (`ownAwardOnly` ~304, `cellOpenable` ~316, `AwardSheet` ~4296, `displayCell` ~580, `openCredit` /
`openAnyCredit` / `openWorkOnly` ~3526–3548, `creditShown` ~4629, `stayWords` ~116); `BidPicker.tsx` (the +OIL panel
561–640, the read-only credit block 767–793, `OilDetailRows` 883–908, `AwardSheet` 917–945, the Delete confirm 283–291);
`DayList.tsx` (107, 174 "worked HH:MM" — never on an award now, 184/272 "OIL earned"/"OIL award", 194–199, 295–301);
`OilTracker.tsx` (339, 463 `canNote`, 502 the Auto tag, 550–557); `awardwords.ts`; `sync.ts` (339 a dead `credits`
variable — deleted; 625–628 clash wording; 1275 `oilCreditBidAgainst`, which omits `source==='auto' && !c.manual` —
becomes `source==='auto'`); `inputgate.ts:222` (auto only — unchanged); `undo/describe.ts` 165–183 (a credit id →
"X's OIL award" — moves to the ledger branch at 204, which learns to name an award: "X's OIL award" / "removing X's OIL
award" when the ledger entry is an OIL award, "an OIL entry" for anything else); `state/perms.ts` (`T.award` — the row
tagged `['OIL-AWARD-IS-A-GRANT']` — merges into `T.ledger`; `mayAwardOil`, no production caller, stays as the one
question and is what the award doors ask); `state/undo-wire.ts:94` (`lw.cell` date snapping — an award's history line is
dated by `ledgerLines` from its own date, already).

### 2.6a A person deleted or archived (D299)

Today `forgetPersonFrom(id, iso)` (the delete command) drops his war records dated on or after the cutoff — awards
included — and leaves every ledger entry. After the move his awards are ledger entries, so **`forgetPersonFrom` also
drops his OIL awards (positive OIL ledger entries) dated on or after the cutoff**, inside the same command — exactly
what it takes today. His past awards stay (D299). Corrections and other pools' entries: untouched, as today. The change
history's `crossLines` (an award leaving inside a person command) moves to the ledger reading: "OIL award taken away" on
its day.

### 2.6b Undo's record for the ledger — kept whole, on purpose

The command layer records the whole ledger as ONE record (`lw.ledger/all`, no owner, no war), where an award today is
its own record per day with its man as owner. Splitting the ledger into one record per entry would restore per-award
granularity (and is the shape the database will want — `[DB-READINESS]` (1), "saving in small pieces"). **Not done here:**
awards and grants are admin-only writes, the undo timeline is one person's session (it clears at sign-out, D148), so a
second person's change can never sit between two of his in the prototype; and the split touches the command layer's
decomposition, conflict detection and the change history at once. **Filed** as a line in `[DB-READINESS]` (the ledger in
small pieces), where the database's rows force it anyway. *(Red team: challenge this — is there a single-session case
where the coarse record makes an undo refuse, or restore the wrong thing?)*

### 2.6c Hours on an award

An award is not an attendance record (N13): no award carries work hours after this. The old shape could (`readRec`
kept `spans` on a manual record; the tap list printed "worked HH:MM" for it) — gone with the old shape (D401).

### 2.7 Old records (D401)

A stored war record with `oil:'manual'` — or an automatic credit carrying the retired take-over snapshot — is demo
data. **It is DROPPED on read**, never converted, never refused: refusing it would make `readRecs` null and re-seed EVERY
war (warrecs.ts's own warning). The retired take-over machinery (`CreditRec.manual`, `splitTakenOver`, the outer
award-field recovery in `readRec`) goes with it — nothing writes that shape, and D401 says nothing stored need survive.
The `oil` field stays on the automatic credit's type (`'auto'`) so the stored shape of the schedule's own credits does
not change. *(Red team: drop vs keep-reading-as-a-ledger-award.)*

### 2.8 The demo seed

`seed.ts seedRecs` loses its four `credit()` awards (ramp 3 Jan FO, tata 1 & 4 Jan FO, skin 3 Jan HO); they become
ledger awards of the same worth and date in `seedLedger` (beside its two OIL grants, jaguar +2 19 Jan and asics +1.5
2 Feb, which now show on the grid too — D402), `approvedBy: 'SQNCDR'`, a short reason. `demoworld.ts`'s nine awards
(`oil:'manual'`, with `days` / `givenBy` / `note` — dusk's 3-day "OC Ops" among them) become ledger awards the same way,
beside its four ledger rows (dol-3, a −1 correction, stays a correction). Every seeded balance reads the same
before and after (a test pins the whole roster's OIL figure against the old seed's numbers).

---

## 3. Decisions to put to HIM (product, not technical)

**Q1 — ANSWERED 29 Sep 26, D402: "Yes, show it."** Every hand award shows on the grid on its date, wherever it was
given. The question as put: **An OIL award given from the tracker will now show on the war grid, on its date.** One kind of award means the
grid draws every hand award, wherever it was given: a tracker credit to five WSOs dated 12 Mar shows as FO on each of
their rows on 12 Mar (a tap says who gave it and why). Today a tracker credit is not on the grid at all. *Recommended:
yes — it is the same fact either way, and the grid is where he looks for a man's days.* The alternative (keep tracker
credits off the grid) needs a "where was it made" marker on the one record — two kinds again, in display.

(The breakdown's "corrections" row and the reason rule are decided above as technical calls; each is named in the
report so he can overrule.)

---

## 4. What does not change

The balance of every person (only its parts are named differently). The automatic pass, the publish door, D142. Manning
(an award never counted and still does not). Clashes (an award clashes with nothing, D80). Every pool other than OIL.
The OIL tracker's FIFO and expiry (an award's date and amount are what they read, as for a grant today). The storage key
of the ledger. The permissions table's writers (admin only, D200).

---

## 5. Tests — red first

1. **One kind:** a grid FO writes a ledger award (and no war record); a tracker credit and a grid award read the same
   everywhere; the war's records never hold an award after any door.
2. **D400:** a worked Saturday with a 3-day award: breakdown "earned by weekend/PH work 1", "awarded 3", total 4; the
   tracker ledger `earned 1`, `granted 3`; balance unchanged from before the change (seed-wide pin).
3. **D82:** award + worked day add up, both orders (award then publish; publish then award).
4. **D79:** an award on a weekday, on a day in no war (tracker), on a published war's day.
5. **D80:** an award beside a leave day raises no amber.
6. **D260:** the block Delete / one-day Clear / range Clear remove the awards on those days and the confirm names each.
7. **D261:** a member opens his own award read only, at every stage; another man's award: no edit.
8. **D265:** a bid beside an award moves alone; `stayingIn` names the award.
9. **D200 (2):** a new award stores `enteredBy` = the signed-in person's id and `enteredAt`; the breakdown shows his
   LIVE callsign (rename him → the line follows).
10. **Q1 (if yes):** a tracker credit dated inside a war shows as FO/HO on the grid; outside any war, on no cell.
11. **Several awards on one day:** the tap list lists each; FO typed on such a day does not pick one silently (refused
    with a sentence, or adds — decided in §2.5 red team).
12. **D401:** a stored war blob holding an `oil:'manual'` record and a take-over snapshot loads — every other record
    kept, the award dropped, no re-seed.
13. **Undo:** each door is ONE undo step and undo restores the award (the `lw.ledger` collection).
14. **Change history:** given / changed / taken away, on the award's day, from every door; no line for the automatic
    credit.
15. **Permissions:** `perms.test.ts` / `perms-scan.test.ts` green; §11's row for the award moves to `LeaveLedger`.

---

## 6. The bug check — FULL tier (money: earned leave; saved data; roles)

- **Roll-call:** every place the app draws an award (the grid cell, the frozen overlay? the day window, the tap list,
  the member's read-only sheet, the OIL tracker box, the breakdown sheet, the person's figure sheet, the figures drawer,
  the change history window and its gold dot, the move sheet's "stays behind", the delete confirm) — has it / must not,
  because / MISSING.
- **Door check:** every way to give, change and take an award (grid FO/HO, bid sheet, day window, tap list, block
  Delete, range Clear, tracker credit, tracker edit, tracker delete, figures bar +N on OIL, Undo, Redo) — at every war
  stage, both roles.
- **Walk:** both widths, a scripted browser, the world with a worked Saturday + an award, two awards on one day, a
  tracker credit inside and outside a war, a member's own award, a published war.
- **The reads:** Fable and Astra, blind to each other, given the finished code AND the evidence sheet, asked for what is
  MISSING (the §4 brief, with D56's exclusion).
- **Gates:** unit, build, tfin 728/0, e2e, Tracker smoke, rulecheck, docsize — under the PC lock.

---

## 7. Documents the change keeps true (D201, D29 never trims)

`docs/data-model.md` (`LeaveBid` loses `manual` / `note`-as-award; `LeaveLedger` gains `enteredBy` / `enteredAt` and is
the one award; §11's two award rows), `docs/data-schema.md` (the WarRec and ledger rows), `docs/handover-dataverse.md`
(the one award table), `docs/ui-contracts.md` (the D400 block marked BUILT; the breakdown rows; the tracker's credit
box), `docs/engine-rules.md` if it states the award's store, `docs/file-map.md` for any new file, the one-absence register
N11/N13/N16 rows (pointer to the new store), `OUTSTANDING.md` (`[OIL-AWARD-IS-A-GRANT]`, `[OIL-EARNED-VS-GRANTED]` — to
the archive once built and merged; `[DB-READINESS]`'s "with the award fix" line).

## 8. Risks

- **A reader left on `recs`** after the store moves — the whole reason for the roll-call; a grep for `oil === 'manual'`
  and `'manual'` must return nothing in `src/` outside the D401 drop.
- **Double counting** — an award counted once through the ledger and again through the day view. Pinned by the
  seed-wide balance test.
- **The merge cache** — an award index that is not part of the cache key would show a stale grid. Pinned by a test that
  gives an award and reads the merged war without any other change.
- **Test churn** — ~28 test files name the old shape; each is rewritten to the one kind, never weakened.
