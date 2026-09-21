# Fable 5.1 (high) — independent bug check of the OIL build (21 Sep 26)

Read-only review of `claude/oil-auto-remove-design` against `main`. Opus 5 wrote the code; Fable did not.
Commissioned by the owner's standing cross-provider rule. Companion: `2026-09-21-oil-bugcheck-codex.md`.
The triage that decided which of these to act on is `2026-09-21-oil-bugcheck-fixplan.md`.

---

# REVIEW — the OIL build on `claude/oil-auto-remove-design` (Fable 5.1, independent, read-only)

Reviewed against `main`. Read in full: `engine/oilev.ts`, `engine/oil.ts`, `engine/publish.ts`,
`engine/drafts.ts`, `engine/canonical.ts`, `engine/restore.ts`, `engine/rowids.ts`, `engine/hooks.ts`,
`leavewar/sync.ts`, `ui/oilmode.ts`, `storage/reset.ts`, the `html.ts` / `board.ts` / `board-html.ts`
/ `SchedBoard.tsx` / `interactions.ts` / `view.ts` / `validate.ts` / `schema.ts` diffs, the three new test
files plus `scenarios-bughunt.test.ts`, and the surrounding bodies they lean on (`slots.ts` accept /
unaccept, `inputedit.tsx` commitInputEdit, `avail.ts`, `sched-commit.ts` commitPublish, `editlog.ts`,
`history.ts`, `store.ts` loadWeek / weekStashSnap, `leavewar/state/store.ts` ingestDutyCredit /
clearRaptorCell, and the pre-change `sync.ts` on `main`).

## Plain summary for the owner (the detail follows)

The core of the build holds. The frozen evidence really is copied, not shared; money on a published
day really does come only from the issued document; an OIL-only change really is publishable as one
amendment item; a parked plan or a recovery cannot bring back stale evidence; and an old snapshot
with no evidence protects its date instead of paying or sweeping. I found **no second copy of the
aliasing bug** the build session found by hand.

What I did find, most serious first:

1. **In the mode, tapping a dim puck while the day blanket (or that item's switch) is OFF silently
   rewrites the decision hidden underneath it** — the puck stays dim, the toast says "earns from this
   event again", and when the blanket is lifted the man earns. The design says the blanket masks, never
   deletes. The item switch has this guard; the person puck does not.
2. **A public holiday declared AFTER a day was published now pays nobody until the day is re-issued.**
   Before this build it paid at once. The day does show "1 change" but nothing says why, and the
   amendment would read "the OIL decisions changed" although nobody decided anything.
3. **No OIL decision reaches the edit log / history.** The amendment says "the OIL decisions on this
   day changed" and nothing in the app records which man, which item, or who did it. The design claims
   the edit log holds the before-and-after; as built it does not.
4. **The warning shown at the moment of publishing still resolves ALL AVAIL live and ignores every OIL
   decision**, so it can name a man's bid as sitting on published work when he was in fact denied. It
   is the one sentinel resolver left that does not read the frozen list.

Then smaller things (a stranded read-only board after stepping weeks in the mode; a dead button for a
viewer; two latent hardening points; wording), and a list of tests that prove less than their names
claim.

---

## FINDINGS (most severe first)

### F1 — A tap on a dim puck under the day blanket (or a switched-off item) silently rewrites the masked decision

1. **Title** — The person-puck tap has no mask guard: under a blanket or an off item it deletes a stored
   `deny` or writes an `allow` that nothing shows.
2. **Severity** — HIGH (a stored decision is destroyed by a gesture the tooltip invites; becomes wrong
   money the moment the mask is lifted and the day is published without re-checking).
3. **Where** —
   - `raptor-port/src/ui/oilmode.ts:211-223` (`toggleOilPerson`) — computes `want` from the MASKED
     answer `oilPersonOn`, then writes against the unmasked default.
   - `raptor-port/src/ui/board.ts:1148-1155` (`boardArmClick`, the `[data-oilp]` branch) — no
     `oilBlanketOn` / `oilItemOn` guard, unlike the item branch at `board.ts:1169`.
   - `raptor-port/src/ui/oilmode.ts:297-308` (`oilSeatHTML`) — draws the puck as tappable with the
     title "earns nothing from this event — tap to put him back on it" even when the reason he earns
     nothing is the mask, not a person decision.
4. **What is wrong** — `oilPersonOn(di, person, item)` returns `false` whenever `!oilItemOn(di, item)`
   (blanket on, or `items[item] === 0`), regardless of the stored person decision. `toggleOilPerson`
   then sets `want = !oilPersonOn(...) = true` and `dflt = itemDefaultFor(...)`. If `dflt` is `true`
   (any schedule row, or a claim the member answered yes) the branch `if (want === dflt) delete
   dec.people[k]` DELETES an existing `deny`. If `dflt` is `false` (a claim the member answered No) it
   writes `dec.people[k] = 'allow'`. Either way the puck stays dim (the mask still applies) and the toast
   reports "earns from this event again". The design (§9.1, OIL9) says the blanket and item marks MASK
   the decisions beneath them; here a tap under the mask changes them, invisibly.
5. **Failure scenario** — Saturday, FAMILY DAY 10:00–17:00, BANE named. In OIL mode the scheduler taps
   BANE off FAMILY DAY (stored `bane|r:<rid>` = `deny`). He then presses "Nothing today earns" (blanket).
   Later — a mis-tap, or reading the tooltip "tap to put him back on it" — he taps BANE's dim puck. Toast:
   "BANE earns from this event again". Puck: still dim. Stored: the `deny` is gone. Next week he lifts
   the blanket to let the day earn again: BANE glows FO. He publishes. BANE is paid a full day the
   scheduler had explicitly refused, and the only trace is a toast he saw while the puck stayed dark.
   Mirror case: a claim BANE answered No to, blanket on, tap → a silent `allow`; lift the blanket and he
   is paid over his own No.
6. **EXACT FIX**
   1. In `raptor-port/src/ui/board.ts`, in the `[data-oilp]` branch, after line 1151
      `if (!oilModeOn(di)) return`, insert:
      ```ts
      if (oilBlanketOn(di)) { e.stopPropagation(); return toast('Nothing on this day earns — turn that off first') }
      if (!oilItemOn(di, item)) { e.stopPropagation(); return toast('This item earns nobody — turn the item back on first') }
      ```
      and add `oilItemOn` to the import from `./oilmode` at `board.ts:34`.
   2. In `raptor-port/src/ui/oilmode.ts` `toggleOilPerson` (line 211), make the writer itself refuse
      under a mask so no future caller can repeat this. Replace
      ```ts
      const dec = decOf(di)
      const want = !oilPersonOn(di, person, item)
      ```
      with
      ```ts
      if (!oilItemOn(di, item)) return false            // masked — the tap has no meaning here
      const dec = decOf(di)
      const want = !oilPersonOn(di, person, item)
      ```
      (place the guard BEFORE `decOf`, so a masked tap does not even mint an empty `oild`).
   3. In `oilSeatHTML` (line 297), draw a masked puck inert with an honest title. After
      `const eligible = oilEligible(di, person, item)` add:
      ```ts
      if (!oilItemOn(di, item)) return `<span class="seat oilpk inert" title="${esc(p.cs)} — ${oilBlanketOn(di) ? 'nothing on this day earns (the day blanket is on)' : 'this item earns nobody (it is switched off)'}">${pk({ on: false, amt: oilFigureFor(di, person) })}</span>`
      ```
      This keeps the FO/HO chip logic (the man may still have a day figure from other items) but removes
      the tap target, matching the existing inert branch's shape.
   4. No other call sites: `toggleOilPerson` is called only from `board.ts:1152`.
7. **THE TEST THAT WOULD HAVE CAUGHT IT** — `raptor-port/src/ui/oilmode.test.tsx`, in
   `describe('the mode itself (§2.1)')`, a new test `OIL9 — a tap under the blanket changes nothing
   underneath it`: take BANE off FAMILY DAY (stored `deny`), press the blanket, click BANE's puck on the
   FAMILY DAY row, then assert `DAYS[SAT].oild.people['bane|<item>']` is still `'deny'` and the puck
   carries no `data-oilp`. A second case: an item switched off, then a tap on a puck in it — same
   assertion. The existing `OIL9 — the day blanket stops everything...` test is blind because it taps
   the person BEFORE the blanket and never taps under it.
8. **Confidence** — certain (mechanism read line by line in `toggleOilPerson` and `boardArmClick`).

---

### F2 — A public holiday declared after a day was published earns nobody until the day is re-issued, and nothing says why

1. **Title** — `earns` is frozen into the block, so the war marking a PH after publication is a dead
   day; the reverse (revoking a PH) still acts live. A behaviour regression versus `main`.
2. **Severity** — MEDIUM (nobody is paid for a real holiday until a scheduler notices an unexplained
   "1 change" and re-issues; recoverable, but silent about its cause and asymmetric).
3. **Where** —
   - `raptor-port/src/engine/oilev.ts:192,200` — `earns` computed at derive time and the early return
     that freezes an EMPTY block (`inputs: [], sent: {}`) when the day did not earn at publication.
   - `raptor-port/src/engine/oilev.ts:265` — `oilEarnedWork` gates on the frozen `ev.earns`.
   - `raptor-port/src/leavewar/sync.ts:913,938` — `isNonWorkingISO(iso)` is read LIVE as the gate, so
     the revoke direction is live while the grant direction is frozen.
   - `raptor-port/src/engine/validate.ts:1123-1125` — the OIL_UNPUBLISHED reminder fires only on
     `!dayApproved(di)`, so it is silent in exactly this case.
4. **What is wrong** — On `main`, `desiredOilCells` walked the issued snapshot whenever
   `isNonWorkingISO(iso)` was true NOW, so a PH marked on the war after the day went out credited at
   once. Now `creditFrom` reads `snap.d.oilev`; a day published while it was an ordinary weekday froze
   `{earns:false, inputs:[], sent:{}}`. `creditFrom` returns `true` (a block IS present) so the date is
   not protected, and `oilEarnedWork` returns `{}` because `ev.earns` is false: nothing is desired, and
   any existing auto credit on that date would be swept. The live candidate now earns, so `oilDelta`
   sees `'' !== 'iso|...'` and the day reads as having "1 change" and Not-Yet-Signed; the signatures
   read invalid (`x.oil` was `''`); the AL panel does not itemise the `oil` kind, so the scheduler sees
   "1 change" with no explanation. The OIL_UNPUBLISHED reminder does not fire because the day IS
   approved. Meanwhile revoking a PH still stops the credit immediately (live `isNonWorkingISO`), so
   the two directions disagree.
5. **Failure scenario** — Wednesday 15 Jul is published with PIKE on the SDO desk 08:00–18:00. The
   next day the government declares 15 Jul a public holiday and the admin types PH on the war for it.
   Before this build PIKE's FO landed on the next notify. Now: nothing lands. The Wednesday shows "1
   change" in the AL panel and its sign-offs go blank; nobody knows why; PIKE's balance stays short
   until someone re-signs and publishes AL1, whose only item reads "the OIL decisions on this day
   changed" — though no scheduler decided anything.
6. **EXACT FIX** — two parts; the second is the smallest coherent behaviour fix, the first is the
   backstop that must ship regardless.
   1. **Say it.** In `raptor-port/src/engine/validate.ts`, directly after the `OIL_UNPUBLISHED` block
      (after line 1125), add:
      ```ts
      /* THE DAY BECAME A HOLIDAY AFTER IT WENT OUT ([OIL-AUTO-REMOVE] F2): the issued block was
         frozen as "earns nothing", so nobody is paid until the day is published again. */
      if(dayApproved(di)&&oilWouldEarn(di)){
        const ver=dayCurVer(di), snap:any=ver!=null?daySnapOf(di,ver):null;
        const frozen=snap&&snap.d&&snap.d.oilev;
        if(frozen&&!frozen.earns)add('adv','OIL_STALE_DAY',[],'This day started earning OIL after it was published — publish it again so the OIL lands');
      }
      ```
      `dayCurVer`/`daySnapOf` are already imported at `validate.ts:14`.
   2. **Do not freeze an EMPTY block for a non-earning day; freeze the full block and let the live
      calendar gate.** In `raptor-port/src/engine/oilev.ts` `oilEvidence` (line 188): delete line 200
      (`if (!earns) return { iso: iso || '', earns: false, d: dec, inputs: [], sent: {} }`) and change
      line 212 to `return { iso: iso as string, earns, d: dec, inputs: projectOilInputs(iso as string), sent }`
      (guard `iso` being `''`: keep `if (!iso) return { iso: '', earns: false, d: dec, inputs: [], sent: {} }`).
      Then in `oilEarnedWork` (line 265) keep `if (!ev.earns) return out` BUT in
      `raptor-port/src/leavewar/sync.ts` `creditFrom` (line 852) pass the LIVE calendar answer over the
      frozen flag: replace line 855 `for (const [person, sp] of Object.entries(oilEarnedWork(day, ev))) {`
      with
      ```ts
      /* the war's calendar decides whether the DATE earns, live and symmetric with the revoke
         direction (desiredOilCells already gated on isNonWorkingISO before calling here); the
         frozen block decides WHAT the day earns. */
      for (const [person, sp] of Object.entries(oilEarnedWork(day, { ...ev, earns: true }))) {
      ```
      **And keep the weekday key empty** so OIL18 (five days a week unchanged) still holds: in
      `oilEvidenceKey` (line 247) the line `if (!ev || !ev.earns) return ''` already does this — but a
      weekday's block now carries inputs/sent, so `daySnap` on a weekday freezes real data. That is
      acceptable (it is only read when the date earns), and the key stays `''` for a weekday so no
      spurious weekday amendment appears. NOTE the trade-off honestly: with this change a PH declared
      after publication credits from the projection frozen at publication (the claims and membership
      as they stood then), which is exactly the "published schedule is the truth" reading (OIL24); it
      does NOT re-read live inputs. If the owner would rather keep the full freeze including `earns`,
      ship step 1 alone and record the asymmetry as a ruling.
   3. Call sites touched: only `creditFrom`; `oilEarnedWork`'s other callers (`oilDayFigures`,
      `oilWouldEarn`) keep gating on `ev.earns` as today.
7. **THE TEST THAT WOULD HAVE CAUGHT IT** — `raptor-port/src/leavewar/oilsync.test.ts`, beside `a PH
   revoked after the answer stops the credit`: a new test `a PH marked AFTER the day was published
   credits the published work` — `publish(2)` (Wednesday, SDO desk staffed), `runOilPass()`, assert no
   raptor-owned cell on `2026-07-15`; then `setRole('admin'); setDayEvent('2026-07-15', 0, 'PH');
   runOilPass()`; assert the SDO man's cell is `'FO'`. Today this fails. The existing test `a weekday
   the war calls a holiday earns like a weekend` is blind because it marks the PH BEFORE publishing.
8. **Confidence** — certain on the mechanism (read `oilEvidence`, `creditFrom`, `desiredOilCells` and
   the `main` version); "likely" on whether the owner wants it changed — it is defensible under OIL24,
   but it is a silent regression with no on-screen explanation, so at minimum step 1 must ship.

---

### F3 — OIL decisions never reach the edit log; the amendment names nothing and nobody

1. **Title** — `toggleOilItem` / `toggleOilPerson` / `setOilBlanket` call `afterSchedMutate()` only,
   which calls `markEdit()` with NO key, so no `logEdit` / `logAction` ever fires for a money decision.
2. **Severity** — MEDIUM (the audit trail for a money decision is absent; the design's own §9.2 says
   "the history still holds the before and after through the edit log" — it does not).
3. **Where** —
   - `raptor-port/src/ui/oilmode.ts:187-192, 196-205, 211-223` — the three writers.
   - `raptor-port/src/state/view.ts:969-975` — `rawSchedEpilogue` → `markEdit()` (keyless → `logEdit`
     not called, per `publish.ts:577-584`).
   - `raptor-port/src/ui/ALPanel.tsx:39-44, 57` — the panel counts `total` and itemises del/mov/inp
     only; an `oil` item is invisible except as "1 change".
4. **What is wrong** — Every other board write logs (a value change through `logEdit`, a structural
   change through `logAction`). The OIL writers log nothing, so the history bubble, the listed history
   and the AL panel have no record of which man on which item was allowed/denied, by whom, or when. The
   only trace is the `from`/`to` machine strings on the `oil:<di>` diff entry, which no surface prints.
5. **Failure scenario** — Two schedulers share a Saturday. One denies STIFF on FAMILY DAY and publishes
   AL1. A week later STIFF asks why his balance is short. The AL panel says "AL1 · 1 item". The history
   bubble on STIFF's puck shows nothing. The edit log for the day shows nothing. Nobody can say who
   decided it or when; the only answer is to open OIL mode and read the current state.
6. **EXACT FIX**
   1. In `raptor-port/src/ui/oilmode.ts` add `import { logAction } from '../engine/editlog'`.
   2. In `setOilBlanket` (line 187), before `afterSchedMutate()`:
      `logAction(di, on ? 'OIL: nothing on this day earns' : 'OIL: this day can earn again')`.
   3. In `toggleOilItem` (line 196), before `afterSchedMutate()`:
      `logAction(di, `OIL: ${itemName} ${wasOn ? 'earns nobody' : 'earns again'}`)` — pass the item's
      display name in: change the signature to `toggleOilItem(di, item, name?: string)` and at the one
      call site `board.ts:1170` pass `oit.textContent || item`.
   4. In `toggleOilPerson` (line 211), before `afterSchedMutate()`:
      `logAction(di, `OIL: ${(PEOPLE as any)[person]?.cs || person} ${want ? 'earns from' : 'taken off'} ${itemName}`)`
      — same optional `name` parameter, passed from `board.ts:1152` as the row's item text (the seat's
      closest `.sb-arow` first `.oilitem` textContent, or `item` as fallback).
   5. In `raptor-port/src/ui/ALPanel.tsx` line 42 add `if (c.oil) bits.push('OIL decisions changed')`
      and in the `al-list` template (line 57) append
      `${c.oil ? ' · OIL decisions' : ''}` after the input-filing fragment, so the item is at least named.
   6. Also correct the design doc line (§9.2 "the history still holds the before and after through the
      edit log") once the log entries exist.
7. **THE TEST THAT WOULD HAVE CAUGHT IT** — `raptor-port/src/ui/oilmode.test.tsx`, a new test in `the
   mode itself`: after clicking a puck off, assert `elogFor`/the listed log (`import { elogList } from
   '../engine/editlog'` — whichever reader `HistoryModal.tsx` uses) contains an entry for day SAT whose
   label mentions the callsign. No existing test reads the edit log after an OIL write.
8. **Confidence** — certain.

---

### F4 — The publish-time warning still resolves ALL AVAIL live and ignores every OIL decision (the last non-`creditFrom` sentinel reader)

1. **Title** — `publishFlagsBids` reads `dayOilWork(snap.d, { expandAll: availableFor })`, not
   `oilEarnedWork(snap.d, snap.d.oilev)`.
2. **Severity** — MEDIUM (wrong display at the moment of publishing: names a man's bid as sitting on
   published work when the block says he earns nothing; can also miscount the "earned nobody" line).
3. **Where** — `raptor-port/src/leavewar/sync.ts:1041` (and `oilBlindLine`'s `earners` count at
   `1025`, which consumes the same spans).
4. **What is wrong** — Since this build the money comes from `snap.d.oilev` (decisions + frozen
   membership + claims). This warning still walks the raw schedule, expands sentinels through the LIVE
   `availableFor`, ignores the blanket / item marks / person decisions, and ignores claims. So it can
   say "PLASMA's LL bid on 18 Jul now sits on published work — the day is flagged" when PLASMA was
   denied on that event (no credit will land, nothing will clash), and the "earned nobody any OIL"
   sentence can be wrong under a blanket (everyone has spans, nobody earns). It runs AFTER `daySnap`
   (`sched-commit.ts:494-503`), so the block is available.
5. **Failure scenario** — Saturday FAMILY DAY 10:00–17:00 ALL AVAIL; PLASMA has an approved LL bid that
   afternoon; the scheduler denies PLASMA on the item (he is on leave) and publishes. Toast: "PLASMA's
   LL bid on 18 Jul now sits on published work — the day is flagged, the bid is still live". No credit
   lands, the day does not flag, the scheduler goes looking for a clash that does not exist.
6. **EXACT FIX**
   1. In `raptor-port/src/leavewar/sync.ts` replace line 1041
      `const spans = dayOilWork(snap.d, { expandAll: win => availableFor(iso, win, snap.d) })`
      with
      ```ts
      /* the same block the money comes from — decisions, frozen membership and claims included */
      const ev: OilEvidence | undefined = snap.d.oilev
      if (!ev) return                                   // a block-less snapshot is protected, never warned on
      const spans = oilEarnedWork(snap.d, ev)
      ```
      (`oilEarnedWork` and `OilEvidence` are already imported at `sync.ts:31`.)
   2. `oilBlindLine(iso, snap.d, spans)` at line 1048 needs no change — its `earners` count now
      reflects who actually earns.
   3. No other callers of the live expansion remain: I checked `oilSentinelPeople` (frozen first, hook
      second — same body), `oilSeatDeco` → `oilSentinelSummary` (frozen), `oilRowPeople` (via
      `oilSentinelPeople`), `oilEligible` (via `oilSentinelPeople`), `creditFrom` (frozen), and every
      `isSpecial(` site in `events.ts` / `validate.ts` / `avail.ts` / `weekctx.ts` (all SKIP a sentinel,
      none expand it).
7. **THE TEST THAT WOULD HAVE CAUGHT IT** — `raptor-port/src/leavewar/oilsync.test.ts` (or
   `sync.test.ts` where `publishFlagsBids` is exercised): publish a Saturday with an ALL AVAIL row, a
   `deny` on one man who holds an approved bid overlapping it, drive the publish through
   `commitSetDayApproved` (so `publishGate` runs), capture `HOOKS.toast`, and assert the denied man's
   callsign is NOT in the warning. No existing test drives `publishFlagsBids` with a decision present.
8. **Confidence** — certain on the mechanism; the consequence is display only.

---

### F5 — Stepping the open board to another week keeps OIL mode on the same index, which can strand a read-only board with no way out

1. **Title** — `boardWeekStep` → `loadWeek` → `boardTab(sameDi)` leaves `OILDAY` set.
2. **Severity** — LOW (usability; recoverable by closing the board).
3. **Where** — `raptor-port/src/ui/board.ts:1749-1754`; `raptor-port/src/state/view.ts:293`
   (`if(n!==SBDAY)OILDAY=null` — same `n`, no clear); `raptor-port/src/ui/oilmode.ts:256-276`
   (`dayBarHTML` draws no way out when `oilShown(di)` is false but the mode is on).
4. **What is wrong** — The mode belongs to one day of one week. After a week step the same index of
   the new week inherits it. If that day cannot earn (a PH Wednesday → an ordinary Wednesday),
   `oilShown` is false so neither the desktop button (`SchedBoard.tsx`, gated on `oilShown`) nor the
   bar's `oilBtn` is drawn, yet `oilModeOn` is true so `stoRO` makes every panel read-only and the bar
   reads "OIL EARN · Nothing today earns" with no "✓ Done".
5. **Failure scenario** — Wednesday 15 Jul is a PH; the scheduler enters OIL mode on it, then presses
   the board's next-week arrow. Wednesday 22 Jul opens read-only with a green "OIL EARN" heading, a
   "Nothing today earns" button and no Done. Every field is disabled. He has to close the board.
6. **EXACT FIX**
   1. In `raptor-port/src/ui/board.ts` `boardWeekStep` (line 1749) insert `setOilDay(null)` before
      `loadWeek(...)`, importing `setOilDay` from `'../state/view'` (the file already imports `view`;
      use `view.setOilDay(null)` if it imports the namespace).
   2. Belt and braces: in `raptor-port/src/state/store.ts` `loadWeek` (line ~620, next to
      `HOOKS.weekSwapped()`), add `setOilDay(null)` (import from `./view`).
7. **THE TEST THAT WOULD HAVE CAUGHT IT** — `raptor-port/src/ui/oilmode.test.tsx`: enter the mode on
   SAT, call `boardWeekStep(1)` inside `act`, assert `oilModeOn(SAT)` is false and the board's
   `[data-bfld]` boxes are editable again.
8. **Confidence** — certain on the mechanism (read `boardWeekStep`, `boardTab`, `setBoardDay`).

---

### F6 — A viewer (not in edit mode) is shown a live-looking "OIL Earn" button on the phone bar that does nothing

1. **Title** — `dayBarHTML` draws the OIL button whenever `oilShown(di)`, not only when the board is
   editable; `boardMbtn` then refuses the click (`board.ts:687-700`).
2. **Severity** — LOW (cosmetic; a dead control).
3. **Where** — `raptor-port/src/ui/oilmode.ts:256-265`; called from `raptor-port/src/ui/board.ts:268`
   with `tplBtn` already blanked by `mvRO` but no editability flag for the OIL half.
4. **What is wrong** — `if (!oil && !tplBtn) return ''` then `oilBtn` is built from `oil` alone.
5. **Failure scenario** — A crew member opens the read-only board on a Saturday on his phone, sees
   "THIS DAY · OIL Earn", taps it, nothing happens.
6. **EXACT FIX** — Change the signature to `dayBarHTML(di, tplBtn, canEdit: boolean)`; at
   `board.ts:268` pass `!mvRO`; in `dayBarHTML` set `const oil = canEdit && oilShown(di)`.
   `oilmode.test.tsx` calls `dayBarHTML` nowhere directly, so only that call site changes.
7. **THE TEST** — `oilmode.test.tsx`: open SAT with `HOOKS.editMode = () => false`, assert no
   `[data-oilmode]` element.
8. **Confidence** — likely (I did not confirm the read-only board is reachable for a viewer on the
   phone; the markup path is certain).

---

### F7 — The candidate compared and signed is not always the candidate frozen: rid minting happens between them (latent)

1. **Title** — `alIssue` / `setDayApproved` compute the OIL key (via `dayDelta` and `currentBind`)
   BEFORE `daySnap` runs `ensureRowIds(DAYS)`; a row minted there changes `sent`/`item` keys.
2. **Severity** — LOW (latent; every production add path mints before this point, so I could not
   construct a reachable case — see confidence).
3. **Where** — `raptor-port/src/engine/publish.ts:236` (`ensureRowIds` inside `daySnap`), versus
   `publish.ts:638` (`const diff=dayDelta(di)` in `alIssue`) and `publish.ts:195` (`daySigned` in
   `setDayApproved`).
4. **What is wrong** — §9.3 point 3 promises the frozen block is the value the signature was validated
   against. `oilEvidence` keys a sentinel row's membership and every item decision by `rid`; a row with
   no rid contributes no `sent` entry and no item address. If any row reached publish without a rid, the
   compared/signed key would lack that row's membership while the frozen block would carry it: the AL's
   stored `diff` would not match what was frozen, and a decision addressed by that rid could not have
   been compared.
5. **Failure scenario** — Not reachable through the UI as far as I can trace: every board add funnels
   through `markStructuralAdd` → `markEdit` → `ridWriteKey` → `ensureRowIds`; `acceptInput` calls
   `markStructuralAdd`; `applyDayTpl`'s caller ends in `afterSchedMutate` → `histPush` → mint. A
   programmatic caller that pushes a row and publishes in one turn (a probe, a future import) would hit it.
6. **EXACT FIX** — Move the mint to the entry of both publish paths so every read in the turn sees
   the same ids: in `setDayApproved` insert `ensureRowIds(DAYS);` as the first statement after the
   `protectedWeek()` refusal (line 189), and in `publishALDay` insert `ensureRowIds(DAYS);` after the
   `protectedWeek()` refusal (line 668). Leave the mint in `daySnap` (idempotent). `ensureRowIds` is
   already imported at `publish.ts:7`.
7. **THE TEST** — `raptor-port/src/engine/oilev.test.ts`, beside `daySnap freezes the same value
   currentBind reports`: push a ground row with `who:'allavail'` WITHOUT calling `ensureRowIds`, then
   `sign(SAT); setDayApproved(SAT,true)`, and assert `oilEvidenceKey(SCHED.orig[SAT].d.oilev)` equals
   the `oil` recorded in the sign binding taken by `setSign` (use `setSign`, not `signOf`). Today the
   frozen key carries `sent[r:<newrid>]` while the binding does not.
8. **Confidence** — speculative on reachability, certain on the ordering.

---

### F8 — `oilDecisionsKey` distinguishes an absent map from an empty one (latent hardening)

1. **Title** — `{}` → `''` but `{items:{}}` → `'||'`, so an empty-but-present sub-map would read as a
   change forever.
2. **Severity** — LOW (the UI's `tidy()` prevents it today; a saved plan, an undo snapshot or a future
   writer that skips `tidy` would trip it).
3. **Where** — `raptor-port/src/engine/oilev.ts:241-245`; the guard that hides it:
   `raptor-port/src/ui/oilmode.ts:176-182`.
4. **What is wrong** — `if (!d.blanket && !d.items && !d.people) return ''` tests presence, not
   emptiness. `sortedPairs({})` is `''`, so `{items:{}}` serialises to `'||'` ≠ `''`.
5. **Failure scenario** — Any path that leaves `oild = { people: {} }` on a published day (a hand edit,
   a future writer, a test fixture) makes `dayHasChanges` true permanently and offers an amendment
   whose only item is an empty OIL change; publishing it "fixes" it by freezing `'||'` on the issued
   side. Not reachable through today's UI.
6. **EXACT FIX** — In `oilDecisionsKey` replace the body with:
   ```ts
   const d = dec || {}
   const items = sortedPairs(d.items), people = sortedPairs(d.people)
   if (!d.blanket && !items && !people) return ''
   return [d.blanket ? 'B' : '', items, people].join('|')
   ```
7. **THE TEST** — `oilev.test.ts`: `expect(oilDecisionsKey({ items: {}, people: {} })).toBe('')` and
   `expect(oilEvidenceKey(oilEvidence(SAT)))` unchanged after setting `DAYS[SAT].oild = { people: {} }`.
8. **Confidence** — certain (trivial), low impact.

---

### F9 — Wording and counting on the amendment: a filing change is counted twice, and a world change is called a "decision"

1. **Title** — `acc` rides both the filing axis and the OIL projection, so filing/unfiling an OIL-
   asking input on a published day yields an `input` item AND an `oil` item; and any change in
   sentinel membership (leave filed by someone else, a man archived, a posting window moved, a VCONF
   pad edited) or in the war's calendar is reported as "the OIL decisions on this day changed".
2. **Severity** — LOW (counts and wording only; the money and publishability are right).
3. **Where** — `raptor-port/src/engine/oilev.ts:249` (`acc` in the key), `publish.ts:276-280`
   (filing axis), `publish.ts:296-298` (`oilDelta` label), `ALPanel.tsx:39-44`.
4. **What is wrong** — Two items for one fact; and the `oil` item's meaning is "the OIL EVIDENCE
   changed", which includes facts no scheduler decided.
5. **Failure scenario** — A member files a Saturday LL after the day went out: the AL panel says "2
   changes · 1 input filing"; the published AL2 says "2 items" for one filing. A scheduler reads "the
   OIL decisions changed" and looks for a decision nobody made.
6. **EXACT FIX** — (a) Drop `acc` from `oilEvidenceKey`'s input fragment at `oilev.ts:249` (keep it in
   the PROJECTION — `oilEarnedWork` still needs `acc==='r'`); the filing axis already detects every
   acc change and `daySnap` still freezes the new acc. Note the one case the OIL axis alone caught — a
   FRESH (`acc:''`) OIL-asking input newly covering the date — is still caught by its new `iid` in the
   projection. (b) Rename the user-facing label wherever the `oil` kind is printed (ALPanel, per F3
   step 5) to "OIL evidence changed" and, only when `oilDecisionsKey` differs between issued and live,
   "OIL decisions changed". (c) Update `docs/ui-contracts.md` §OIL and the register's OIL27 wording.
7. **THE TEST** — `oilev.test.ts`: file a fresh Duty claim covering SAT after publish → assert exactly
   ONE delta entry; set `acc='u'` on it → assert the delta contains one `input` entry and no second
   `oil` entry for the same fact (after fix (a)).
8. **Confidence** — certain on the double count (read `filingDelta` and `oilEvidenceKey`); the wording
   is a judgement.

---

### F10 — A cancelled landed row still earns through its claim (pre-existing; `allow` inherits it)

1. **Title** — The input half of `oilEarnedWork` ignores the landed ground row's `cx`.
2. **Severity** — LOW (pre-existing on `main` — the old input branch never checked the row either;
   listed because the brief asks whether `allow` can count a cancelled row).
3. **Where** — `raptor-port/src/engine/oilev.ts:278-283`; `raptor-port/src/engine/oil.ts:179`
   (`if(g.cx||g.src)return` — the schedule half skips src rows entirely, so the row's `cx` is read by
   nobody on the money path); `raptor-port/src/ui/board.ts:1017,530-555` (a src row CAN be CX'd).
4. **What is wrong** — §3.3 says "anything cancelled (cx) at any level" earns nothing. A Duty claim
   landed on the ground programme, answered yes, whose ROW the scheduler cancels (CX with a reason)
   still earns its window, and in the mode its puck glows; `allow` on it also counts. The scheduler's
   sanctioned tool is "remove" (unaccept → `acc:'r'`), but CX is offered on the same row.
5. **Failure scenario** — BANE files Duty 09:00–17:00 Saturday, answers yes; the scheduler CXs the row
   "cancelled — no need". Publish. BANE is paid FO for a cancelled duty. (Same on `main`.)
6. **EXACT FIX** — In `projectOilInputs(iso)` (`oilev.ts:154`) accept an optional `day` and, per
   input, look up `(day.ground||[]).find(g => g.src === iid)`; if found and `g.cx`, push the projection
   with `acc: 'x'` (a new value meaning "landed and cancelled"); in `oilEarnedWork` extend the skip to
   `inp.acc === 'r' || inp.acc === 'x'`; in `oilEligible` (`oilmode.ts:320`) treat `'x'` as ineligible;
   pass `d` from `oilEvidence` (`oilev.ts:212`: `projectOilInputs(iso as string, d)`). Update the
   `OILINP` spec comment in `schema.test.ts`.
7. **THE TEST** — `oilev.test.ts`: claim + `groundRow(SAT,{..., src:'c1', cx:true})`, publish, assert
   `figure(SAT,'bane')` is null.
8. **Confidence** — certain on the mechanism; whether CX-on-a-landed-row is meant to void the claim is
   the owner's call (raise it, do not assume).

---

## TEST BLIND SPOTS — P2(b), by name

Fixtures or helpers that set state by a route the production code does not take, and what each is
therefore blind to:

1. **`oilmode.test.tsx` — `OIL24, OIL32 — the bar reads the ISSUED evidence on a published day, not
   the live draft`** (line 217). It publishes and asserts a bar exists. Live and issued are identical, so
   it cannot tell which was read — and on the BOARD the bar in fact reads the LIVE candidate
   (`evOf(di)` → `DAYS[di]` has no `oilev` on the working copy), which is correct for the working copy
   but is the opposite of the test's name. Blind to: any regression in `oilEvidenceOf`'s preference for
   the frozen block on the VIEW page. Fix: after publish, mutate `DAYS[SAT].oild` to deny BANE, render
   the view page (`viewDayHTML`/`dayIssuedHTML`) and assert the bar is still there; render the board
   and assert it is gone.
2. **`oilev.test.ts` — `a snapshot with no block is PROTECTED, never guessed at (§9.4)`** (line 268).
   It asserts `oilEvidenceOf(SAT, snap.d).earns === true` — i.e. that the reader DERIVES from live
   inputs — which is the reverse of what protection means, and it defers the real guard to
   `oilsync.test.ts`, where no test deletes `oilev` from a resolvable snapshot (grep: no `oilev` in
   `oilsync.test.ts` or `scenarios-bughunt.test.ts`). Blind to: `creditFrom` being "simplified" to
   derive, which would mint money off unsigned live inputs (§7.5's exact prohibition). Fix: in
   `oilsync.test.ts` — `publish(5); runOilPass(); expect FO; delete (daySnapOf(5,dayCurVer(5)) as
   any).d.oilev; DAYS[5].dutywaves = []; runOilPass(); expect the cell is STILL 'FO'` (protected: not
   swept, not re-derived).
3. **`oilev.test.ts` — `OIL16, OIL27 — marking an item on a published day is one amendment item, and
   clears the signature`** (line 101). It never asserts a signature cleared; it signs through
   `signOf(di)[role] = name` (no binding), so `signBoundOk`'s new OIL axis (`publish.ts:821`) is
   exercised by NO test in the suite. Blind to: the line `(x.oil||'')===(c.oil||'')` being dropped or
   the normalisation being widened — every test would still pass while an OIL-only change published on
   a stale signature. Fix: use `setSign(SAT,'appr','pump')` (the production path), mark an item, assert
   `signShown(SAT).appr === ''` and `daySigned(SAT) === false`.
4. **`oilev.test.ts` — nine fixtures REPLACE `oild`** (lines 105, 131, 162, 174, 181, 193, 202, 213,
   224) and two DELETE it (133, 185); production mutates in place through `decOf` + `tidy`. The one
   in-place test (line 147) covers the aliasing bug that was found. Still blind to: F1 (no test taps a
   person under a mask) and F8 (`tidy` is only exercised by the UI double-click test at
   `oilmode.test.tsx:132-135`).
5. **`oilev.test.ts` — sentinel membership frozen (§7.3)** (line 231) changes membership by REPLACING
   `HOOKS.oilSentinel` — a route production never takes (membership moves through `INPUTS`, `PEOPLE`,
   the war roster). It proves the frozen list is read, which is the point, but it is blind to
   `availableFor` itself resolving differently on the live day versus the snapshot's day blob (the
   `day` argument), which is exactly what `publishFlagsBids` (F4) gets wrong.
6. **`oilsync.test.ts` and `oilmode.test.tsx` — `publish()` helpers call `setDayApproved` directly**,
   never `commitSetDayApproved`, so `publishGate` → `publishFlagsBids` (F4) never runs under test with a
   block present.
7. **No test marks a PH after publication** (F2), no test steps weeks inside the mode (F5).

## P2(a) — every by-reference hand-back, checked by name

I looked for every object that leaves `oilEvidence` / a snapshot / a binding / a draft clone / the
Leave War projection and asked who else holds it and whether anyone writes through it:

- `oilEvidence` (`oilev.ts:188`): `d` is `clone(d.oild || {})` — copied. `sent[item] = people` — a
  fresh array from `availableFor`'s `out` on every call (`sync.ts:710,746`). `inputs` — fresh objects
  from `projectOilInputs`; `win: [w[0], w[1]]` is a fresh array, not `inpWin`'s. **No alias.**
- `oilEvidenceOf` (`oilev.ts:219`) returns the FROZEN `d.oilev` BY REFERENCE. Its readers:
  `oilDayFigures`, `oilPersonOn`, `oilSentinelPeople` (returns `ev.sent[item]` by reference),
  `oilEligible`, `oilSentinelSummary`, `oilSentinelList`, `itemDefaultFor`, and via `oilSentinelPeople`
  → `oilRowPeople` / `oilEligible`'s `expandAll`. Every one only reads (`map`, `find`, `forEach`,
  `some`, index). `creditFrom` reads `day.oilev` directly and only reads. **No writer; safe as is, but
  fragile** — one `sort()` in place on `ev.sent[item]` would rewrite the issued document. Cheap
  hardening: make `oilSentinelPeople` return `[...ev.sent[item]]` and `oilSentinelSummary` /
  `oilSentinelList` copy before sorting if they ever sort.
- `daySnap` (`publish.ts:228`): `d = JSON.parse(JSON.stringify(DAYS[di]))`, then `d.oilev =
  oilEvidence(di)` (fresh). `SCHED.orig[di] = {id, ...daySnap(di)}` and `SCHED.als.push({..., snap})` own
  their objects. **No alias.**
- The writers `decOf` / `setOilBlanket` / `toggleOilItem` / `toggleOilPerson` write only `DAYS[+di].oild`
  — the live day. A `withDaySnap` swap is render-scoped (`html.ts:81-92`, try/finally), so at click time
  `DAYS[di]` is the working copy. **Correct target.**
- `drafts.ts`: `draftDup` stows `clone(DAYS[di])`; `draftSelect` installs `liveDay(t.d)` (clone +
  strip `oilev`); `loadVersionToWorkingCopy` installs `liveDay(snap.d)`. **Copies.**
- `retireIssued` (`publish.ts:717`) MOVES `rec.snap` into `SCHED.retired` and splices the record out —
  single owner, immutable thereafter. **Fine.**
- `stashOilWeek` (`sync.ts:770`) parses its own copy; `creditFrom` reads it. **Fine.**
- `histSnap`/`histApply` are JSON round trips. **Fine.**
- Signature binding: `currentBind` returns a fresh object each call; `setSign` stores it; nothing
  mutates a stored binding except `restampRev` (writes `.rev` only, on purpose). **Fine.**

**Answer to (a): no other part of the evidence, the snapshot, the binding, the draft clone or the
Leave War projection is handed back by reference where a copy is required.** The one by-reference
hand-back (`oilEvidenceOf` → frozen block, and `oilSentinelPeople` → frozen array) has no writer today.

## P1 — section 9, answered

**9.1 the three-state decision.** `allow` outranks a member's No (`earnsFrom`, `oilev.ts:143-147`;
pinned by `OIL10 — ... the admin can say YES over his NO`). Removing an override restores the member's
word (`ans` is projected from `row.oil`, never written by the mode; `toggleOilPerson` deletes the
override when the tap merely restores the default). The blanket and item marks mask (`itemOn` is
tested first, the `people` map is untouched by `setOilBlanket`/`toggleOilItem`) — **except through the
UI path in F1**, where a tap under the mask rewrites the masked decision. `allow` cannot invent work:
dormant (`acc==='r'`), no window, no written times, cancelled schedule rows, spares, AVALON/BB, ⓘ rows
and a non-earning day are all decided before `earnsFrom` is asked — **except a cancelled LANDED row
(F10, pre-existing)**. One more subtlety, not a bug: `oilEligible` lifts every decision to decide
whether to offer a toggle, so a `deny` can never strand a man with no way back. Correct.

**9.2 the aggregate delta address.** Deterministic: inputs sorted by `iid`, decisions by sorted keys,
membership keys sorted and members sorted; numbers are integer minutes; absent decisions and a
non-earning day both serialise to `''` (`oilDecisionsKey`, `oilEvidenceKey`). Always present: `oilDelta`
is concatenated on every `dayDeltaIn` for an approved day with a resolvable snapshot, and a missing
issued block normalises to `''` so the first change is detected. Unchanged block → identical bytes: yes,
given `tidy()` (F8 is the latent exception). Changed block → identical bytes: I found no field that
matters to money and is missing from the key (`iid, person, type, acc, win, ans`; blanket, items,
people; membership; iso; earns-as-`''`). What IS in the key beyond decisions — membership and the
calendar — makes the item's name wrong sometimes (F9) and doubles a filing (F9), but never hides a change.

**9.3 the derive/freeze boundary.** The live day never stores a block (`oilev` is set only in `daySnap`;
`OIL29` test pins `DAYS[SAT].oilev` undefined; both clone-back paths strip it). ONE body: `oilEvidence`
is what `oilDelta` (`publish.ts:297`), `currentBind` (`:799`), `daySnap` (`:248`) and `oilWouldEarn`
call; the UI reads `oilEvidenceOf` which is the same body on a working copy. Publication freezes the
same VALUE the signature was validated against — a second read, but synchronous with nothing between
except `ensureRowIds` (F7, latent). A restored draft cannot resurrect a projection (`liveDay`). One
caveat worth recording: `oilEvidence` inside `daySnap` reads `DAYS[di]` (live) rather than the copy `d`
it is attached to; they are byte-identical at that instant, but if a future edit ever normalises `d`
before attaching, the two could diverge — cheap to make explicit with `d.oilev = oilEvidence(di, d)`.

**9.4 the cutover's real scope.** `creditFrom` returns `false` on a block-less snapshot; both loops in
`desiredOilCells` then `protectedDates.add(iso)`; the reverse sweep skips protected dates; nothing is
derived. The schema-5 reset clears `inputs`, `weeks` (with every snapshot and draft) and `leavewar`
together; the demo seeds publish nothing through any path other than `setDayApproved` (no writer of
`SCHED.orig`/`dayOK` outside `publish.ts` and tests), so no block-less snapshot survives the reset. The
`tracker` collection that is kept is the OCU tracker (`adapters.ts:26`, `tracker/storage.js`), not the
OIL ledger — the OIL credits live in the war's records and are reset with it. **I found no path where a
pre-change snapshot credits or sweeps.** The one date-level asymmetry is F2 (a block present with
`earns:false`).

## P3 — the freeze boundary, other doors

`creditFrom` is the only door into `desiredOilCells`, and `desiredOilCells` is the only feeder of
`ingestDutyCredit` / the reverse sweep (`runOilPass`) and of `oilCreditBidAgainst`. Live reads that
remain on the money path, each named: (1) `isNonWorkingISO(iso)` and `warHolding` — the war's calendar
gates live (F2's asymmetry); (2) `creditable()` — live `PEOPLE` and the war roster, so archiving a man
without a posting window still sweeps his past credits (pre-existing on `main`, not this build); (3)
`whoId` / `realP` inside `dayOilWork` resolve a legacy callsign-form `who` against live `PEOPLE`
(pre-existing). Off the money path but on the issued day: `publishFlagsBids` (F4). **No other live read
of INPUTS, the roster or the live day for money.**

## P4 — the delta axis

Publishable-but-no-item and item-but-no-delta are both impossible by construction (`oilDelta` is the
sole source of the `oil` kind and is derived from the same key `dayHasChanges` uses). The state survives:
a draft switch (`oild` is day content, cloned both ways; the evidence re-derives), recovery (`liveDay`
keeps the issued `oild`, `dayDiscardCount` counts the drop), undo (`histSnap` carries `DAYS` and
`SCHED.als` with their `oilev`), a week load and persistence (`weekStashSnap` = `DAYS` + `schedFields`).
The `''` normalisation in `signBoundOk` opens no hole: `''` means "the day does not earn" (or no block);
an earning day's key always starts with its ISO, so a pre-block binding on an earning day is invalid and
must be re-signed, and on a non-earning day there is nothing it could have failed to promise. The
`keyDay('oil:5')` address parses to day 5 correctly; no UI consumer of `diff` entries other than
`ALPanel` exists, and `ALPanel` only counts, so the new kind cannot crash a renderer — it is merely
unnamed (F3 step 5).

## P5 — the cutover

Covered under 9.4. No path found where a pre-change snapshot credits or sweeps. F2 is the only date
whose credit can be swept without protection, and it requires a block frozen as non-earning on a date
the war later calls non-working.

## P6 — the ALL AVAIL redefinition

One caller left resolving a sentinel a different way: `publishFlagsBids` (F4) — live `availableFor`,
no decisions, no claims. Every other reader goes through `availableFor` via `HOOKS.oilSentinel` on the
working copy or the frozen `sent` on the issued day. ALL and ALL AVAIL share one body (OIL15).
Emptying a row: yes, possible — a family day whose every eligible man has an overlapping named
tasking or commitment resolves to nobody; the puck shows the count chip "0" with the title "None of
these 0 earn OIL today" and the mode shows an empty people cell. Nobody is warned. LOW: add to
`validateCore`'s earning-day branch an advisory when a sentinel row on an earning day resolves to
`[]` ("ALL AVAIL on <item> stands for nobody at that time"). The SANS rules are as the handoff says:
eligibility (`engaged.has(id)`) and the timing clash (`personBusy`) are separate tests
(`sync.ts:734,745`); a hidden SANS man's credit lands (`creditable`, `sync.ts:880-884`) and
`ingestDutyCredit` does not require him on the roster. One speculative note: `publishLeaveClashes`
walks `war.views`, which are built per roster person, so a HIDDEN SANS man's credit-versus-leave clash
is probably not surfaced while he is hidden (LOW, unverified — I did not read the views builder).

## Also-worth-your-attention items

- **Row ids.** `daySnap` mints; `draftDup`/`draftSelect` mint; `histPush`/`histInit`/`loadWeek`/`initStore`
  mint. `weekStashSnap` does not, but every UI path reaches it after a `histPush`. A row with no rid takes
  NO item address (`rowItemKey('')` → `''`), never a positional one; the only positional fallback is the
  pre-existing structural diff (`enumRows`). F7 is the one ordering gap.
- **SANS.** As above; both halves pinned by `oilsync.test.ts` `a SANS man planned on our programme...`
  and `OIL35`.
- **Ordering.** The pass runs on notify after a command completes; `oilEvidence` derives on read;
  `commitInputEdit`'s unaccept → edit → re-accept runs inside one `writeInputsBatch`. I found no point
  where the pass or the delta can see a half-applied edit.

## What I could NOT check properly, and why

- I did not run anything (read-only brief): every claim above is from reading, not execution. F1, F2,
  F4 and F5 are mechanical enough that I am confident; F6's reachability (a viewer opening the phone
  board) and the hidden-SANS clash note are unverified.
- I did not read `leavewar/state/merge.ts` (how `views` are built), so the hidden-SANS clash surface
  is a guess.
- I did not read `scheduler.css`; nothing there affects correctness, but I cannot vouch for the bar's
  rendering versus the standby inset (§2.10's collision call).
- `perf` behavioural check B (pre-existing failure) is outside this brief.
- The desktop/phone comps and the geometry gate: not reviewed; display only.
