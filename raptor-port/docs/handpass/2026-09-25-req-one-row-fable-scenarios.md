## D174 / D175 — scenario design (Fable 5.1, blind, 25 Sep 26)

Read against the working tree as it stood mid-build (`publish.ts` `filingSame` / `rowsLeftOut` / `leaveRowsOut`,
`drafts.ts` `leaveOut` / `ROWSLEFT` / `rowsLeftSaid`, the three doors in `interactions.ts` and `board.ts`, and the two
test files `reqonerow.test.tsx` / `reqonerow-app.test.tsx`). I ran nothing. The job: what is MISSING, ranked, with
the observation that would disprove each. Pre-promulgation rule applied throughout (D54/D56): nothing below is about
data already stored.

## 1. Design gaps and clashes — with the fix

**G1 — MEDIUM — the load may re-awaken a request the version's face had dormant.** `filingRestorePlan` still turns an
ABSENT record into `want=''` (fresh, flags) when the live filing is `'g'` or `'u'`. Case: ORIG issued before Bane's
Meeting existed; the scheduler accepts it and publishes AL1 (record `g`); later loads ORIG. `rowsLeftOut` is empty
(no other day has it), the row goes, and the request is set `''` — so the working copy now FLAGS the Meeting
("Meeting but tasked…") while ORIG's issued face read it dormant (`world.ts fileAcc`: absent → `'r'`). D174's own
principle ("absent matches taken off") points the other way. The pending count is 1 against AL1 either way, so no
counter disagrees — only the warnings do, and the rule the code states ("the day reads exactly as that version",
D98/AM6). *Fix (one line, state it in the D174 comment):* in `filingRestorePlan`, when the record does not hold the id
(`!hasOwnProperty(fil,id)`) and `cur` is `'g'` or `'u'`, put `'r'`, not `''`. Both satisfy D174's "matches"; `'r'` is
what the version's face showed. Test: publish ORIG; accept + publish AL1; load ORIG → `inp.acc==='r'`, no warning on
the working copy for that request, `dayShownPendCount` 1, one paired line "on the programme → taken off".

**G2 — MEDIUM — the mirror of D174 is not covered: record `'r'`, request now gone, reads 1.** A request the issued
record holds as `'r'` (declined before the publish) that the member then DELETES on the Inputs page (or re-dates off
this day): `filingDelta` sees `a='r'`, `b=''` → "taken off → not on the programme", an unpaired 1 pending, the four
fall, and the next AL carries a filing with no visible effect. Both faces show nothing for it. New-data path, same
principle as D174 (D98: back to what was published). *Fix:* in `filingDelta`, skip when `a==='r'` and the id is NOT in
`now` (absent now — gone or no longer covering); keep the delta when the id IS in `now` with `''` (a retyped dormant
request waking up is a real change, 26 Aug 26). `filingKey` already drops falsy values, so the signature agrees.
Test: `acceptInput`, `unacceptInput`, publish (record `r`); splice the request → `dayDelta` empty, `daySigned` holds.
If the builder reads D174 as NOT covering this, say so in the register row rather than leave it silent — the owner will
meet it the first time a member withdraws a declined request.

**G3 — MEDIUM — the promise "one request, one row" holds only inside the loaded week; the load can now CREATE the
cross-week two-row state.** `rowsLeftOut`, `acceptInput`'s guard, `unacceptInput`'s search and `reconcileDayFiling`
all scan `DAYS` (loaded) only. Sun(week 1)–Mon(week 2) request: accepted on Mon, Mon published, ✕ Mon; go to week 1,
Accept onto Sun (guard sees no loaded row → allowed); back to week 2 (acc-clear leaves it `''`; auto-land can't find
Sun); Load Mon's ORIG → no loaded day holds it → the row comes back on Mon and `filingRestorePlan` puts `'g'` — Sun's
stashed row still stands. Two rows, one request, across the boundary; a later ✕ on Mon leaves Sun's as an orphan
(O2 shape). Same root as `[REQ-ORPHAN-ROW]` (1), not this build's, but D175's wording promises more than the loaded
week. *Fix, my recommendation:* do NOT widen this small branch; instead (a) add one sentence to `[REQ-ORPHAN-ROW]` (1)
naming this load path and `rowsLeftOut` as a third consumer of the stash sweep it proposes (one helper `rowElsewhere(id)`
over the stashed weeks' `ground` by `src`, read by `acceptInput`'s guard, `unacceptInput`, `reconcileDayFiling` and
`rowsLeftOut`), and (b) say in the register row for D175 that it is kept within the loaded week until then.

**G4 — LOW — a plan's record keeps the row only until the plan is next left.** `draftSelect` stows the CURRENT live
day into the plan being left. Switch to Plan A (its Mon row left out because Bane is on Tue) → the live A has no row;
switch to B → A's blob is overwritten WITHOUT the row. ✕ Tue later, switch back to A: the row does not return, though
the message said "left out — it is on Tuesday's programme", which reads as "until it isn't". The issued version keeps
its record (the load path behaves as the owner expects); the plan does not. Not a defect under AM27 (a plan is what
you leave it as) — but pin the expectation and, if wanted, add "(Plan A keeps it until you next leave the plan)" for
the switch door only. Test: the sequence above → `dayDrafts(MON)[0].d.ground` has no row with that `src` after the
second switch away; document it as intended.

**No ruling clash found.** D175 amends D98/AM6's "the day reads exactly as that version" for a row whose request
stands elsewhere (newer wins; AM6's status line already carries "left as filed and the load says so" — extend it to the
ROW, and add register rows for D174 and D175 under AM20/AM23 and `engine-rules.md` "A load puts back what the version
filed"). D174 keeps the 26 Aug dormancy rule and AM14 (nothing to sign for when nothing is pending — AM11). D175 adds
no confirm, so AM27's "no stale-plan confirm" stands. Astra's "refuse the load" was set aside by the owner (D175).

## 2. Ranked scenarios — setup / action / expected / disproof (least-shared surface first)

| # | Surface | Setup | Action | Expected | Disproof |
|---|---|---|---|---|---|
| S1 | **Preview banner "Load" — the early return** (`interactions.ts data-restore`) | Astra's six steps (two-day Meeting on Mon; Mon+Tue published; ✕ Mon; Accept Tue). Mon reads "1 pending". Preview Mon's ORIG. | Tap "Load onto working copy" once. | Button reads plain "Load onto working copy" (no "Discard"). The load RUNS: toast + Edit history "Monday: Original loaded onto the working copy … · Bane · Meeting left out — it is on Tuesday's programme". Mon still "1 pending" (the removal), Tue unchanged, one row (Tue). | "Monday is already at Original" beside "1 pending"; or "1 unpublished edit replaced"; or the row on both days. (The builder's app test covers the words; walk it on the BOARD's banner too — `SchedBoard.tsx` renders its own bar.) |
| S2 | **The confirm's number** (week head + board banner, `dayDiscardCount`) | As S1, plus one real edit on Mon (a note or a time). | Preview ORIG; first tap. | "Discard 1 edit & load — confirm" — the note only; second tap replaces the note, leaves the row out, sentence says "1 unpublished edit replaced · Bane · Meeting left out…". | "Discard 2 edits" (the row counted) or no confirm at all. |
| S3 | **Plans menu / DraftsModal "Select" / preview-banner "Switch"** — three doors, one sentence | Plan A parked with the Mon row; live B: ✕ Mon, Accept Tue. | Switch to A from EACH door (week-head menu, board menu, DraftsModal, preview banner). | All four say the same clause "Bane · Meeting left out — it is on Tuesday's programme"; published day adds "· 1 difference from Original pending"; unpublished day adds nothing else. One row (Tue). | Any door silent, or worded differently, or the published tail says "matches Original — nothing pending" while the row's removal is pending. |
| S4 | **Plan record after leaving it again** (G4) | S3, then ✕ Tue, switch to B, switch back to A. | — | Row does NOT return (A was stowed without it). Stated as intended, pinned. | If the builder expects it back: it will not be. Decide, don't discover. |
| S5 | **Load when the record is absent and the request is on THIS day** (G1) | ORIG issued before the Meeting existed; Accept onto Mon; publish AL1 (record `g`). | Load ORIG. | Row gone; request `'r'` (my G1) — no warning for the Meeting on the working copy, "1 pending", line "on the programme → taken off", the four fall. | Request `''`: the Meeting flags on the working copy ("… but tasked") while ORIG's issued face had it silent. (Today's code does this.) |
| S6 | **Mirror of D174** (G2) | Accept, ✕, publish (record `r`). | Delete the request on the Inputs page (member or admin). | 0 pending; the four hold; no AL offered. | "1 pending · Bane · Meeting · taken off → not on the programme", sign-offs wiped. (Today's code does this.) |
| S7 | **Cross-week** (G3) | Sun(wk1)–Mon(wk2) Meeting as in G3. | Load Mon's ORIG on week 2, then visit week 1. | Until the stash sweep lands: expected TWO rows (known, filed). After it: Mon's row left out, message names Sunday. | Nobody files it and the walker "finds" it as new. |
| S8 | **D174 under Unavailable + sign-offs** | Published Mon, four signed. Member files an "Other" request since; scheduler files it "→ Unavail". | Undo (back out of Unavailable). | Filed: 1 pending, four fall. Backed out: 0, four hold, `'r'`. | Four stay wiped after backing out (the `filingKey` exclusion missed `'u'→'r'`). The engine test pins the count, not the signatures, for `'u'`. |
| S9 | **D174 then Unpublish** (Unpublish button; Undo of the publish) | ORIG (no request). Member files; scheduler accepts; publish AL1 (`g`); ✕ (1 pending). | Unpublish AL1. | Current = ORIG (absent) vs `'r'` → 0 pending, marker off, BUT `correcting` set → "Publish AL1" still offered with nothing pending (existing correction behaviour, AM33/GU5-001). Say so in the evidence sheet; not a D174 defect. | "1 pending" (D174 not applied against the prior version), or the pending list showing the retracted `inp:` mark as a line. |
| S10 | **Undo / redo of the load and the switch** (top-bar Undo; the command layer restores whole days) | S1 done. | Undo; Redo; then Undo twice more (past the Accept-Tue and the ✕-Mon). | Undo of the load: Mon as before (no row), Tue unchanged. Redo: row left out again, ROWSLEFT sentence not repeated (redo is silent, as today). Earlier undos: Tue row goes and `acc` returns `'r'`, then Mon's row returns `'g'` — never two rows at any step. | Two rows after any step; or Redo re-installing the version WITH the row (the forward image must be the day as the load left it). |
| S11 | **Weekend OIL axis** | Same as S1 but on a published Saturday, the Meeting row earning. | Load Sat's ORIG (row left out). | Sat reads 2 pending: the removal AND "what this day earns changed" (Fable O3, by design — D109's OIL unit). | 1 (the OIL axis missed), or 3. Record it so the walker does not file O3 again. |
| S12 | **Both orders of the pair** | Mon row accepted + published; ✕ Mon. | (a) Load Mon's ORIG THEN try Accept onto Tue; (b) Accept Tue THEN Load. | (a) The load puts the row back on Mon (`'g'`, 0 pending); Tue shows "Undo", no Accept — nothing to refuse. (b) = S1. | (a) an Accept button on Tue that silently does nothing (`acceptInput` returns false unread). |
| S13 | **Publish after a leave-out, then ✕ the survivor** | S1, sign, publish Mon AL1 (carries the removal; its record holds `R=g` with no Mon row — multi-day filing is global). | ✕ Tue. | Tue 1 (paired); Mon 1 — filing-only "on the programme → taken off", unpaired (D114's stated reading for a row on another day). | Mon 0 or 2. Known shape; note it so it is not filed as a D175 miss. |
| S14 | **Phone** | S1 on a 390px viewport. | Load from the phone's preview bar; switch from the phone's plans menu. | Same sentences; the toast is readable whole (it is long — check it does not clip at the width). | A clipped sentence hiding the "left out" clause. |
| S15 | **Member's trace** (consequence, not a finding) | Member files on a published day; scheduler ✕. | — | Member sees nothing pending, no AL line; only Edit history (session-only until accounts; D169 will show it). Stated in D174 ("no AL carries it"). | — walk it once so the sheet records the consequence. |

Test pins the change should carry beyond the two files: S2 (the confirm's number), S5/S6 (whichever way G1/G2 go),
S8's signatures on the `'u'` path, S10 undo/redo through `state/undo-wire`, and S4 as a documented expectation.

## 3. Explicit negatives — checked, nothing found

- **Day templates cannot make a second row:** `daytpl.ts` strips `src` at save (line 147) and `applyDayTpl` is refused
  on a published day (D96). Not a missing call site.
- **Undo / redo needs no `rowsLeftOut`:** `schedWriteRecords` restores whole prior worlds and re-derives `'g'` per touched
  day; no restore can reach a two-row state the forward path never produced (S10 is the walk that proves it).
- **The official / issued face is untouched:** `withIssuedWeek` installs the issued day and its `fil`; `fileAcc`'s
  absent→`'r'` is what D174 now matches, so the two faces agree on a filed-since-then-taken-off request.
- **One rule, three readers:** `filingSame` is read by `filingDelta`, `filingRestorePlan` and `filingKey`; `pendingKey`
  (D103) reads `dayDelta`, so the four sign-offs, the count, eligibility, the marker, the ⓘ panel, the Amendments panel,
  the pending list and the stored AL (`alIssue` → `dayDelta`/`dayPendingItems`) cannot disagree.
- **`LOADLEFT` and `ROWSLEFT` do not double-name:** a version whose row is left out froze that request `'g'`, and the live
  filing is `'g'` (row on the other day), so `filingRestorePlan` returns early — no "left as filed" clause beside "left
  out".
- **`acceptInput`'s rid-restore is unaffected:** re-accepting onto the day whose issued row was left out restores the
  issued rid beside its neighbours (AM20 round trip) once the other day's row is gone.
- **Twins:** stable ids; `rowsLeftOut` compares `src` ids, never person·date·type.
- **Roles:** members cannot load, switch, accept or ✕ (`canEditSched` at the door and in `accCtl`); the count is one body.
- **D56 exclusions:** a signature binding written before this build on a day carrying an absent-`'r'` entry will fall once
  (the key shrank) — stored data; a week persisted with two rows for one request — stored data. Neither reported.
- **Week round trip keeps D174's 0:** `'r'` survives the stash acc-clear and `relandInputs` skips a truthy acc, so the
  day still reads 0 after leaving and returning.

**Rulings:** none this session (a read only).
