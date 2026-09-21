# CODE REVIEW of OIL jobs 1 and 2 — Fable 5.1, independent (22 Sep 26)

Reviewing commits `b034398`, `351c600` (job 1) and `eb28f2c` (job 2) on
`claude/oil-auto-remove-design`, by reading the code. Files read in full or in the parts that
matter: `engine/oilev.ts`, `engine/oil.ts`, `ui/oilmode.ts`, `ui/inputedit.tsx`, `engine/slots.ts`,
`state/store.ts`, `engine/publish.ts`, `engine/inputs.ts`, `engine/weekstash.ts`,
`engine/drafts.ts`, `engine/canonical.ts`, `state/sched-commit.ts` (call sites), `storage/reset.ts`,
`leavewar/sync.ts`, `ui/InputsPage.tsx`, `ui/board.ts`, `ui/interactions.ts`, `ui/Shell.tsx`,
`ui/weeknav.ts`, and the three test files the commits touched. Background: the evidence sheet
(`docs/handpass/2026-09-21-oil.md`, §6 and §9) and the settled plan
(`…/2026-09-22-oil-fixplan-settled.md`). Nothing was changed, no gate was run, no app was driven —
this is the code half; the two bugs themselves were reproduced in the app and are not re-litigated.

**Marks:** NEW = nobody has this yet · KNOWN = filed, or a consequence both reviewers accepted ·
DISAGREE = the build has it, and the diagnosis or the shape is wrong.

---

## 0. The one-paragraph version, for the owner

Both fixes do what they say on the day in front of you: a request handed to another man now asks him,
and a request running over several days now pays every day it was answered for. What is left is in
the weeks you are **not** looking at. (1) A scheduler's "taken off" mark on a man comes back to life
if the request is handed to someone else and then back to him while a *different* week is on screen
— open that week again and he is paid nothing, silently. The build says this case is closed; it is
not. (2) A request that runs across two weeks whose row was cancelled, or turned info-only, in the
first week still pays its weekend in the second week. The build files this as a known limit, but
names the wrong mechanism, so the repair it sketches would never fire. And one thing you will see
the moment you open the app on this branch with your existing data: every weekend you published
before today that carried a request will say "1 pending" and offer an empty amendment. No money
moves, but it is exactly the phantom from §9 of the evidence sheet; the cure is the same reset you
agreed to on 21 Sep.

---

## 1. WHERE IS THIS WRONG — a man who should be paid is not

### F1 — NEW — the hand-back through a stashed week resurrects a dead refusal (job 1)

**Cost:** a man who worked and answered Yes is paid nothing for that day, and nothing says the mark
that took it is stale. Silent. This is Codex's scenario 7, which job 1 claims is closed "so the two
together leave no live stale decision anywhere" (`ui/oilmode.ts`, the comment above
`clearOilPersonDecisions`). It is closed for the loaded week only.

**Why, in the code.**

- `clearOilPersonDecisions(person, item)` (`ui/oilmode.ts:252`) walks `DAYS` — the seven days of the
  loaded week — and nothing else. A day in a stashed week is a JSON string in `WEEKSTASH`
  (`engine/weekstash.ts:26`) and is never touched.
- `pruneHandedOverDecisions(dec)` (`engine/oilev.ts:236`) does not delete anything from storage. It
  hides a `person|i:<iid>` key from the *copy* while `inp.person !== person`. The moment the request
  is handed back, `inp.person === person` again and the stored key is live.
- The Inputs page is global ("show all inputs regardless of which week I am selected on", owner
  22 Aug 26) and its row editor's Person field goes `saveEdit → oilGate → commitInputEdit`
  (`ui/InputsPage.tsx:655-670`). So a request that covers only a day in week B can be handed over
  and handed back while week A is loaded — and both writes clear only week A's days.

**The scenario, precisely enough to write the test from.**

1. Week of 13 Jul 26 loaded. Talisman (`bane`) has a Duty on Sat 18 Jul, answered Yes for the
   Saturday. In the mode, the scheduler taps him off: `DAYS[5].oild.people['bane|i:<iid>'] = 'deny'`.
2. Navigate to the week of 20 Jul (week of 13 Jul is stashed with that key in it).
3. On the Inputs page, hand the Duty to Ace (`stiff`) — the OIL question is asked for Ace, fine —
   then hand it back to Talisman, answer Yes for him again.
4. Navigate back to the week of 13 Jul. `applyWeekModel` (`state/store.ts:508-514`) restores the
   stashed days verbatim, key included. `oilEvidence(5)` prunes nothing because the holder is
   Talisman again. `earnsFrom` → `deny`. Talisman's Saturday: nothing. The puck reads "Talisman was
   taken off this event — tap to put him back on it", which is the *denied* wording — true to the
   record, false to what happened.

If Sat 18 was already published with that deny frozen, the live key equals the frozen key (same
holder, same deny, same answer) — no pending mark, no amendment, no sign anywhere.

**Repair — exact steps.**

1. **Red test first**, in `raptor-port/src/ui/oilconfirm.test.tsx` (it already boots the store and
   the App and imports `commitInputEdit`, `draftOf`, `writeInputsBatch`); add `loadWeek` from
   `../state/store`, `toggleOilPerson`/`oilFigureFor` from `./oilmode`, `inputItemKey` from
   `../engine/oil`, `DAYS` from `../engine/data`:
   - `loadWeek('13/07/2026')`; plant `r` = `{ person:'bane', type:'Duty', date:'Jul 18', s:0, e:1439,
     allday:true, oil:{'2026-07-18':1} }` through the existing `plant` helper (mints `iid`).
   - `toggleOilPerson(5, 'bane', inputItemKey(r.iid))`; assert `DAYS[5].oild.people['bane|i:'+r.iid]`
     is `'deny'` (the control that the mark was written).
   - `loadWeek('20/07/2026')`.
   - `commitInputEdit(r, { ...draftOf(r), person:'stiff' })`; `commitInputEdit(r, { ...draftOf(r),
     person:'bane' })`; `writeInputsBatch(() => { r.oil = { '2026-07-18': 1 } })`.
   - `loadWeek('13/07/2026')`.
   - Assert `((DAYS[5] as any).oild?.people || {})['bane|i:'+r.iid]` is `undefined` — **red today:
     `'deny'`** — and `oilFigureFor(5, 'bane', inputItemKey(r.iid))` is `'FO'` — **red today: `null`**.
   - Control in the same test: the identical sequence with no `loadWeek` in between already passes
     (the loaded-week clear works), so the red is the stash, not the clear.
2. **`engine/weekstash.ts`** — add `stashEditDays(v, edit: (days:any[]) => boolean): boolean`: parse
   `stashGet(v)`; if the blob is not an object with an array `d`, return false; call `edit(p.d)`; if
   it returns true, `stashPut(v, JSON.stringify(p))`. Raw days, no `dt` re-labelling (that is
   `stashDays`'s job and must not leak into the stored blob). Skip a preserved week
   (`isPreservedWeek(v)`) — a byte-frozen book is read-only by P2-IMPL-02.
3. **`ui/oilmode.ts`** — factor the emptiness clean-up out of `tidy(di)` into `tidyDay(d)` that takes
   a day object, and have `tidy(di)` call it. Then in `clearOilPersonDecisions`, after the `DAYS`
   loop: `for (const k of stashKeys()) if (k !== CURWEEK) stashEditDays(k, days => { let hit = false;
   for (const d of days) { const ppl = d && d.oild && d.oild.people; if (ppl && ppl[key] != null)
   { delete ppl[key]; hit = true; tidyDay(d) } } return hit })`. `CURWEEK` from `../engine/waves`;
   `stashKeys`/`stashEditDays` from `../engine/weekstash` (inputedit.tsx already imports from there).
4. **Undo.** The loaded-week clear rides the batch because `histSnap` serialises `DAYS`. The stash
   rewrite will not, unless the weekstash store is enlisted: change `commitInputEdit`'s own batch
   (`ui/inputedit.tsx:~966`, `writeInputsBatch(() => {...})`) to
   `writeInputsBatchWith(draft.person !== r.person ? [weekstashStore] : [], () => {...})` —
   `writeInputsBatchWith` and `weekstashStore` are exported from `state/store.ts:228-231`. Its
   `write` refuses the loaded week (C7), which step 3 never touches. Add a second assertion to the
   test: after the two hand-overs, one `undo()` restores the stashed week's key (read it back with
   `stashDays('13/07/2026')`). If a nested enlistment under the callers' outer `writeInputsBatch`
   (`InputsPage.saveEdit`, `InputEditor.doSave`) does not join the outer command, enlist at those
   two outer sites too; `reassignInput` has no outer batch, so `commitInputEdit`'s is the one that
   counts there.
5. Keep the read-side prune. It still covers a hand-over made while the stashed blob was unreadable
   or preserved, and it costs nothing.
6. Side effects to note, not to fix: `leavewar/sync.ts`'s `STASH_OIL_CACHE` keys on the blob
   string's identity, so a rewritten blob misses the cache correctly; `ui/peek.ts` keys on `GEN`,
   which `stashPut` bumps.

### The mirror — a man who should NOT be paid is: see §5

The cross-week cancelled/ⓘ anchor (F2) pays a man for work the schedule says did not happen. It is
the stated limit, so it is answered under §5 — but the description of it is wrong and the repair
sketched for it would never fire, which is why it is DISAGREE there and not merely KNOWN.

---

## 2. WHAT DID IT BREAK ELSEWHERE — `stand` in the evidence key

`oilEvidenceKey` now serialises `stand` (`engine/oilev.ts:344`). That key feeds the signature
binding (`publish.ts currentBind`, line 812), the amendment delta (`oilDelta`, line 306) and the
frozen block (`daySnap`, line 257). I walked every state change that can move `stand` without the
day itself changing.

### F3 — NEW — every day published before job 2 keys as `undefined` and manufactures a pending amendment on upgrade

**Cost:** no money moves. But the owner opens the app on this branch with his existing local data
and every published weekend that carried a duty-and-commitments claim says "1 pending · Publish
AL1" — press it and an empty amendment goes out; and each such day reads "not yet signed" until it
is re-signed. That is the §9 shape exactly, this time genuinely phantom.

**Why.** A block frozen by the previous build has `inputs[]` entries with no `stand` field.
`oilDelta` runs the NEW `oilEvidenceKey` over the OLD stored block: the template literal
`${i.stand}` reads `undefined`, so `was` is `…:g:undefined:…` and `now` is `…:g:active:…`. They
differ, so a delta item is emitted. `signBoundOk` compares the binding's `oil` string written under
the old six-segment template against the new seven-segment one; they differ, so the signature is
invalid. Frozen blocks and bindings persist — `SCHED.als`, `SCHED.orig`, `SCHED.signBind` ride
`schedFields` into `weeks/<wk>` — and `storage/reset.ts` `SCHEMA_VERSION` is still **5**, set by
`454c4a5` when the block was introduced; none of the three commits bumps it.

**Repair.** Under the owner's dev-phase rule (reset demo data, do not migrate — the same rule that
set v5 with his "ok reset" on 21 Sep):

1. Red test in `raptor-port/src/state/persist.test.ts` beside the existing `resetDue` pins: a
   snapshot stamped `5` must read `resetDue(snap) === true`. Red today.
2. Bump `SCHEMA_VERSION` to `6` in `storage/reset.ts`, with a comment naming `OilInputEv.stand` as
   the shape change. `RESET` already clears `inputs`, `weeks` and `leavewar` together.
3. Tell the owner the scope before merging, as was done for v5: the demo weeks, published days,
   inputs and the Leave War are cleared and re-seeded on the next boot.
4. Cheap belt for the future: in `engine/oilev.test.ts`, `expect(oilEvidenceKey(ev)).not.toMatch(/undefined/)`
   on a block with inputs — so the next added field cannot serialise as the word `undefined` either.

Do NOT make the key tolerant (`i.stand || ''`) instead: the old side would then read `…:g::…`
and still differ from `active`. The only migration-free answer is the reset.

### The walk-through — where the key stays honest

`stand` is a function of three things: the input's `acc`, the presence and state of the one `src`
row in the loaded `DAYS`, and whether the request's first day is loaded. The first two are re-derived
on every week entry and every boot (`applyWeekModel`'s acc-clear + `reconcileLandedAcc` +
`relandInputs`, `state/store.ts:559-583`; `initStore`'s twin at `838-845`), so the question is
whether the re-derivation can land on a different value from the one frozen at publish, with no
real change underneath.

| Path | What happens to `stand` | Verdict |
|---|---|---|
| Plain reload, anchor row still on its day | acc cleared → `reconcileLandedAcc` finds the row → `'g'` → `landedStanding` finds it → same value | clean |
| Reload / week re-entry, request anchored in another week | acc cleared, nothing found here, `autoAcceptInput` refuses (`dateIx` < 0) → `''` → `'unlanded'`; it was `'unlanded'` at publish for the same reason | clean — but see §5: this is why `'elsewhere'` is unreachable |
| Plan switch / "Load onto working copy" / template apply on the anchor day | the row vanishes from `DAYS`; `reconcileDayFiling(di)` (`engine/slots.ts:~520`, called from `drafts.ts:254/542`, `daytpl.ts:253`) unfiles the dangling `'g'` at once → `''` → `'unlanded'`, and a reload re-derives the same | clean — `'gone'` never lingers |
| Undo restore | `sched-commit.ts:256/289` strips the derived `'g'` and re-runs `reconcileDayFiling` per touched day | clean |
| ✕ on the landed row (`ui/board.ts:1061`, `interactions.ts:504`) | `unacceptInput` → `'r'`; `'r'` survives the acc-clear and is remembered in the stash's `un` list | clean, and the money is withdrawn on every covered day — honest |
| CX / ⓘ on the anchor row | `'cx'` / `'info'` on every covered day; key moves on every covered published day | honest by the model — the money changes; see F5 for the wording cost |
| Hand-over (person change) | the projection's `person` changes, the write clears the old key, `ans` empties | honest |
| A `'g'` request with no row and its first day loaded (`'gone'`) | reachable only by writing `DAYS` outside the app's own paths (the R-2 test constructs it directly) | not a live phantom; F7 notes its one wrong edge |

So, apart from F3, I could not find a load, reload, stash/restore, plan switch or undo that keys a
day differently while nothing underneath changed. Where the key moves, the credit would move with it
on republish, which is what R-1 requires.

### F5 — KNOWN (design consequence) — a change on the anchor day makes a published later day pending, and the amendment says the wrong thing

Cancelling Friday's row moves Saturday's and Sunday's keys. That is correct by the shape both
reviewers chose (the one row's standing governs every covered day) and necessary under R-1 (the
Saturday must be re-issued to withdraw the credit). But the pending item on Saturday reads "the OIL
decisions on this day changed" (`engine/oilev.ts` §serialisation note; `oilDelta` emits one
`kind:'oil'` entry with the whole key as from/to) when no scheduler decided anything on Saturday,
and the Saturday puck reads "nothing measurable to earn from here" (`ui/oilmode.ts:410`) when the
reason is a cancelled row on Friday. Fix-9 material, two wording changes: (a) the inert branch of
`oilSeatHTML` for a claim whose `stand` is `cx`/`info`/`gone` should name the anchor day and the
state ("his Training's row on Fri 17 is cancelled"); (b) the AL panel's line for the `oil:` axis
should say "what this day earns changed", not "the OIL decisions on this day changed". Red first:
`ui/oilmode.test.tsx` tooltip text for a cancelled multi-day anchor.

---

## 3. WHAT IS MISSING — doors, and one landmine

Every path that can write `input.person` or void an answer, and whether the question follows:

| Door | Path | Asked? |
|---|---|---|
| Inputs page row editor, Person field | `InputsPage.saveEdit → oilGate(draft, editRow) → commitInputEdit` | yes — `oilGate`'s person rule |
| Board / Inputs-page dialog | `InputEditor.save → oilGate → doSave → commitInputEdit; r.oil = dec` in the same batch | yes |
| Drag an Unavailable puck onto another man | `drag.ts:211 → reassignInput` | yes — the post-commit hand-off (`pops.OILASK`) |
| Tap-arm then plant onto another man | `interactions.ts:752 → reassignInput` | yes, same |
| Calendar date drag (`caldrag.ts:112`) | `commitInputEdit` directly; dates only | person unchanged; a newly covered non-working day is unanswered → the member's bell (`oilPendingFor`) — the 28 Aug design |
| In-place time cells on board/week (`textedit.ts`, `board.ts:1124`) | `commitInputEdit`; the reprice rule voids a positive whose amount moved | unanswered → the bell — the 28 Aug design |
| Leave War remarks sheet | `setLeaveRemarks` — remarks only | n/a |
| Leave War inbound sync | leave / medical only — never an ask-set type | n/a |
| Undo of a hand-over | one history step restores `INPUTS` and `DAYS` (`oild` included) | consistent |

No unguarded door remains for the person. What is missing is not a door but reach and a sign:

### F4 — NEW (forward) — the read-side prune will silently delete a second man's decision the day fix 8 (D18) lands

`pruneHandedOverDecisions` encodes "only the request's holder may have a person decision on an
`i:<iid>` item". Fix 8 gives a second man on a landed request row a credit from that row, and the
row's item is `groundItemKey(g)` = `i:<iid>` (`engine/oil.ts:109`). His decision key will be
`extra|i:<iid>`; he is not `inp.person`; the prune deletes it on every read. A scheduler who taps
him off is ignored and he is paid. Zero cost today; a money bug the moment fix 8 ships.

Instruction for the fix-8 builder, not for now: either key extras on the row (`r:<rid>`) — at the
cost §7.4 names, that a member edit recreates the row — or narrow the prune to a key whose person is
neither the holder nor named on the anchor row (`who`, `more`); and write, at fix-8 time, the red
test "an extra with a `deny` on a src row keeps his deny across `oilEvidence`". Record this in
OUTSTANDING.md against fix 8 so it is not rediscovered.

### F6 — NEW — after a dismissed sheet the only sign the scheduler ever sees is inside the mode

`reassignInput` reassigns first and asks second by design. If the scheduler cancels the sheet, the
new holder stays unanswered — correct — but outside the mode nothing shows it: the Inputs page row
carries no mark (`oilAnswered` is false, so no revise button), the warning list says nothing, and
the bell is per `ME` (`Shell.tsx:381 oilPendingFor(ME)`), so it lights for the member, not for the
scheduler who did the drag. The member will find it; the scheduler will not. Fix-9 material: a chip
on the Inputs page row ("OIL not answered for Sat 18") driven by the same predicate `oilPendingFor`
uses, for any person. Low.

### F8 — NEW, pre-existing, out of scope — a request landed in a stashed week keeps the OLD man on its row, and the app can land the same request twice

Two relink limits that job 2's "one row" premise stands on:

- A person change made while the anchor's week is stashed cannot reach the row: `acceptedDay(r)` is
  `-1`, `unacceptInput(-1, r)` finds nothing to splice, the relink toasts "moved outside the
  programmed week" and drops `acc`. When that week loads, `reconcileLandedAcc` finds the row (its
  `src` still matches) and sets `'g'`; the row's `who` is still the old man. The money goes to the
  new man through the claim; the programme draws the old one. Not OIL-caused.
- `acceptInput`'s duplicate guard scans loaded `DAYS` only (`slots.ts:376`). A request landed on
  Mon 20 (week B) by the relink's `keep` rule, whose start is then moved to Fri 17, gets a second row
  on Fri 17 when week A loads (`autoAcceptInput` sees no row). `landedStanding` then reads whichever
  week is loaded, and the two rows can disagree (one `cx`, one live).

File both in OUTSTANDING.md. The stash-aware read in §5 is the same seam a stash-aware relink would
use.

---

## 4. THE READ-SIDE PRUNE — verified, it cannot touch an issued record

The claim holds. The chain, from the code:

1. `oilEvidence(di, day)` (`engine/oilev.ts:252`) does `const dec = clone(d.oild || {})` where
   `clone` is a JSON round-trip (`line 115`) — a fresh object graph. `pruneHandedOverDecisions(dec)`
   deletes from that copy and nothing else (`line 247`, `delete ppl[k]`; `line 249`,
   `delete dec.people`). `DAYS[di].oild` is never referenced after the clone.
2. Who calls `oilEvidence`: `publish.ts:257` (`daySnap`, live day), `:306` (`oilDelta`, live),
   `:812` (`currentBind`, live), `oilev.ts:413` (`oilWouldEarn`, live), and `oilEvidenceOf`
   (`:305-309`), which returns `d.oilev` **by reference and untouched** whenever the day object
   carries a frozen block — so inside a `withDaySnap` preview of an issued version the prune does
   not run at all. `leavewar/sync.ts` (`creditFrom:861`, `publishFlagsBids:1077`) and the stashed-week
   wire (`stashOilWeek`) read only `day.oilev` and never derive.
3. The frozen block is written once, at `daySnap`, as `d.oilev = oilEvidence(di)` — so the issued
   record carries the *pruned* decisions and never a dead key. `daySnap`'s own `d` (the raw day
   copy) keeps the dead key in `d.oild`; that raw copy is read by `dayDiscardCount`
   (`publish.ts:360`, compares raw `oild` on both sides, so equal) and by recovery (which restores
   it as-is). Neither moves money.
4. One path prunes against live inputs while looking at an issued day: a snapshot with **no**
   block (a pre-block build) inside a preview — `oilEvidenceOf` falls through to `oilEvidence(di,
   snapshotDay)`, clones the snapshot's `oild` and prunes the clone. The snapshot is untouched, and
   that day is already "protected, credit stands" in the money pass (`creditFrom` returns false).
   After F3's reset such snapshots do not exist.

Two things the claim does not say, both harmless: the prune calls `inpId(r)` on every input, which
mints an id on a row that lacks one (a write during a read) — `mintInpIds` runs at boot and on every
week entry, and `projectOilInputs` already did the same, so no row reaches it id-less; and the prune
is a linear scan of `INPUTS` per person key on every evidence rebuild, which the mode does once per
puck — with a handful of keys this is noise against the `dayOilWork` walk beside it.

So: the prune is a hide, not a delete. That is exactly why F1 exists — a hide lasts only as long as
the mismatch does — and exactly why it is safe for the issued record.

---

## 5. THE STATED LIMIT — DISAGREE on the mechanism, close it now

### F2 — KNOWN as a limit, DISAGREE on how it is described and how it would be closed

**What the build says:** "an anchor row CANCELLED in a week nobody has loaded reads as `elsewhere`,
so its other covered days still pay. Closing it needs a stash-aware read."

**What the code does.** On every week entry `applyWeekModel` deletes every `'g'` acc
(`state/store.ts:559`, keeping only `'r'` and `'u'`) and `reconcileLandedAcc` restores `'g'` only
for a `src` row found in the **loaded** week. So a request anchored in another week always carries
`acc: ''` here. `landedStanding` returns `'unlanded'` on its first line for anything that is not
`'g'`, and `oilInputEligible` returns `true` at `if (inp.acc !== 'g') return true` before `stand` is
consulted. Consequences:

- `'elsewhere'` is reachable only in the unit test that sets `acc:'g'` by hand. A repair written
  against the `'elsewhere'` branch would never fire in the app.
- The hole is `cx` **and** `ⓘ`, and it is exactly as wide as before job 2: the same `acc !== 'g'`
  line paid these days before the commit. Job 2 neither caused nor widened it.
- A request REMOVED through the app's own ✕ is `'r'`, which survives the swap, so a removed request
  pays nowhere. The hole is only the CX-with-reason flow and the ⓘ toggle on the anchor — which,
  in R-2's own words, are the scheduler's ways of saying "this did not happen".

**Must it be closed now?** Yes, before "merge live", for two reasons: the exposure is a real
squadron shape (a ten-day Training or Duty running Fri → the Sunday after next, cancelled on its row
because it did not happen), and the fix is small and reuses seams that exist.

**Repair — exact steps.**

1. **Red test** in `raptor-port/src/engine/oilev.test.ts`, beside the cross-week case: a claim
   `{ iid:'xw', person:'stiff', type:'Training', date:'Jul 11', endDate:'Jul 18', acc:'',
   allday:false, s:480, e:1080, oil:{'2026-07-18':1} }`; `stashPut('06/07/2026', JSON.stringify({ d:
   sevenDays }))` where `sevenDays[5].ground = [{ prog:'TRAINING', str:'0800', end:'1800',
   who:'stiff', src:'xw', cx:true }]` (import `stashPut`, `stashClear` from `./weekstash`; clear in
   `afterEach`). Assert `figure(SAT, 'stiff')` is `null` — **red today: `'FO'`**. Twin it with
   `info:true` (also red) and with a live row (`'FO'`, green — the control).
2. **`engine/oilev.ts landedStanding(row)`**: keep the `'g'` branch as it is. For `acc` `''`
   (never `'r'`, which is refused earlier, and `'u'`, which never lands — return `'unlanded'`
   for it): if `dateIx(row.date, row.yr) >= 0` the anchor day is loaded and the loaded scan already
   said no row → `'unlanded'` (a request whose anchor day was published when its week first
   opened is legitimately rowless and must keep paying — do not read `'gone'` here). Otherwise
   resolve the anchor's week key — the Monday of `labelToISO(row.date, row.yr)` in `dd/mm/yyyy`;
   `ui/weeknav.ts mondayOf` does this but `engine/` may not import `ui/`, so lift the ten-line
   Monday walk into `engine/weeks-data.ts` beside `shiftWeekKey` or into `engine/weekctx.ts` —
   then `stashDays(key)` (`engine/weekstash.ts:130`) and scan its `days[*].ground` for
   `src === inpId(row)`: found → `cx` / `info` / `active`; not found → `'unlanded'`.
3. **Memoise** the stash scan per blob string, the way `leavewar/sync.ts stashOilWeek` does with
   `STASH_OIL_CACHE`, because the evidence is rebuilt once per puck and `stashDays` re-parses the
   whole week on every call.
4. **`oilInputEligible`**: delete the line `if (inp.acc !== 'g') return true` and let the one
   `stand` test decide: `return inp.stand !== 'cx' && inp.stand !== 'info' && inp.stand !== 'gone'`.
   `'unlanded'`, `'elsewhere'` and `'active'` all pay, as now. `'gone'` is still produced only under
   `'g'`, so nothing that paid before stops paying except the cancelled and ⓘ anchors.
5. **State the one-time key move**: a published Saturday whose anchor is in another week keys
   `'unlanded'` today and will key `'active'` after this — a real change in what the record
   asserts, absorbed by the F3 reset if both land together. If they do not, expect one honest
   pending mark per such day.

---

## 6. EXPLICIT NEGATIVES — checked and clean

- `oilGate`'s person rule: the control (an untouched draft asks nothing) holds; a person change
  pre-loads no ticks (`prev` is `{}`); `force` with a person change still asks with nothing
  pre-loaded; `draftOf` copies `person`, so a member editing his own row never trips the rule.
- Both editors write the answers in the right order: `commitInputEdit` (which voids the old holder's
  `oil`) then `r.oil = dec`, inside one `writeInputsBatch` (`InputsPage.tsx:663`, `inputedit.tsx
  doSave` edit branch).
- `reassignInput`: refuses a non-scheduler, a missing row, a protected week, a special or unknown
  person and a drop on the same man; asks only for an ask-set type (the LL control in the test);
  the hand-off is consumed one-shot in `InputEditor`'s open effect (`inputedit.tsx:1497-1501`) and
  cleared if the editor opens on another row.
- The write-side clear: `wasPerson` is captured before `r.person` is assigned; the item is the
  request's own `i:<iid>`, so no other item's decision can be touched; `tidy` removes an emptied map,
  so `oilDecisionsKey` reads `''` (the 21 Sep emptiness rule survives the prune too, via
  `delete dec.people`).
- `'r'` and `'u'` survive the week swap (`store.ts:559`), so a removed request pays nowhere and an OD
  claim (`'u'`, never lands) keeps standing on its own answer.
- `landedStanding` scans every loaded day, so a row the relink kept on a non-first day (the `keep`
  rule, `inputedit.tsx:~1105`) is found.
- `projectOilInputs` sorts by `iid`, so the key is order-independent; `sent` is unchanged.
- `oilEligible` (the mode), `oilEarnedWork` (the money) and `oilWouldEarn` (the reminder) all go
  through `oilInputEligible`, so the green bar and the credit cannot disagree about a claim.
- `oilOffReason`: `deny` → denied; on the claim with `ans == null` → unasked; `ans === 0` →
  declined; `allow` never reaches it because the puck is on; a masked item is inert before it.
- Plan switch, recovery and template apply all call `reconcileDayFiling`; undo strips and
  re-derives the landing (`sched-commit.ts`); the ✕ on a landed row goes through `unacceptInput`;
  the only raw `ground.splice` in `ui/` (`board.ts:1068`) is behind the `src` check that routes a
  landed row to `unacceptInput` first.
- `daySnap` runs after signature validation with nothing writing `DAYS`/`INPUTS` in between, so the
  bound key and the frozen key are the same pruned copy.

### F7 — NEW, dormant — `firstDayLoaded` uses the row's year as the fallback for the DAY label

`landedStanding` tests `dateOrd(d.dt, row.yr) === first`. A day label is bare under the loaded
week's convention (`baseYear()`), not under the row's `yr`; at a year boundary (a request labelled
`Dec 31 2026` created under `yr` 2027, viewed from the week of 28 Dec 2026, whose `Dec 31` is bare)
the loaded anchor day reads as not loaded. Today it changes nothing, because `'gone'` is unreachable
through the app's own paths (§2 table). Fix in passing: compute `const firstDayLoaded =
dateIx(row.date, row.yr) >= 0` once, before the loop — `dateIx` is the app's own "is this label a
loaded day" and resolves both sides under the right convention. Test in
`engine/crossyear.test.ts` with the labels above.

---

## 7. The findings, ranked by what each costs a real squadron

| # | Mark | What | Costs | Where |
|---|---|---|---|---|
| F1 | NEW | A refusal survives a hand-over and hand-back made while the week is off screen; live again when the week opens | a worked day, silently — the case job 1 says is closed | §1 |
| F2 | KNOWN / DISAGREE | A cancelled or ⓘ anchor in an unloaded week pays its later-week weekend; the build names the wrong branch and the sketched repair would not fire | a paid day for work the schedule cancelled — close before merge live | §5 |
| F3 | NEW | Blocks and bindings frozen before job 2 have no `stand`; the new key reads `undefined` on their side → a pending amendment and a broken signature on every previously published claim day, on the owner's next open | an empty amendment issued, the §9 shape; cured by the dev-phase reset (v6) | §2 |
| F4 | NEW (forward) | The prune deletes any non-holder decision on an `i:` item — fix 8 (D18) will put exactly such decisions there | a second man paid over a scheduler's deny, the day fix 8 ships | §3 |
| F5 | KNOWN | Anchor-day changes move later days' keys; the amendment line and the inert tooltip say the wrong thing | clarity; an unexplained pending mark on a day nobody touched | §2 |
| F6 | NEW | A dismissed sheet after a drag leaves the scheduler no sign outside the mode | a request unanswered until the member finds his bell | §3 |
| F7 | NEW, dormant | `firstDayLoaded` under the wrong year convention | nothing today | §6 |
| F8 | NEW, pre-existing | A stashed-week row keeps the old man; the same request can land twice across weeks | display disagrees with money; file it | §3 |

Order of work I would give the builder: F3 (the bump, ten minutes, and it is the first thing the
owner will hit) → F1 → F2 → the F4 note into OUTSTANDING.md against fix 8 → F7 in passing → F5/F6
into the fix-9 wording batch → F8 filed.
