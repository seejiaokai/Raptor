# Fable 5.1 — red-team of the [OIL-SEATS-CAN-EARN] plan, VERBATIM (22 Sep 26)

Read-only review. Fable did not write the plan (Opus 5 did) and was blind to Codex's parallel
review. Kept verbatim because its fix specs are step-by-step and the builder implements from
these words — condensing them would lose the exactness that is the point.

Its own closing note on limits is at the foot: it ran no tests and opened no app.

---

**Verdict in one line:** the four findings in §3 are all confirmed against the code, but the plan is missing five things that must be settled before step 2 is written, and two of them are money-moving. Nothing below was taken from the plan's word; every claim carries the line it was read from.

---

## MUST FIX BEFORE BUILDING (ranked by consequence)

### M1. The new sentinel default turns off money that already pays today — and the plan does not say so

**What the code does now.** A placeholder on a ground row or a Common Programme row expands and earns **by default**:
- `engine/oil.ts:136-143` — `putWho` expands a special id through `opts.expandAll` and hands each man to `put`.
- `engine/oilev.ts:585` — `earnsFrom(ev, person, item, true)`: schedule work defaults to yes.
- `engine/oilev.test.ts:233-245` (OIL24) pins it: an ALL AVAIL ground row with **no mark at all** pays `stiff` a full day.

**What the plan does.** Step 3: "the placeholder seats default off". D27/D32/D33 all say the puck earns OFF by default, everywhere. D28 (same day, earlier) says "nothing earns by default that does not earn today". Those two cannot both be true for the ground row and the Common Programme — the plan lists both rulings in §2 and never names the clash.

**The consequence, and it is silent.** On an **already-issued** Saturday with an ALL AVAIL row, the frozen block holds `sent[item]` = 27 men and `oild` holds no `1` (the type does not even allow one: `items?: Record<string, 0>`, `oilev.ts:67`). After the build, `oilEarnedWork(frozenDay, ev)` recomputes the default from the frozen day → those 27 spans default off → `runOilPass`'s reverse sweep (`leavewar/sync.ts:1226-1236`, `clearRaptorCell`) deletes 27 landed credits. No amendment, nothing on screen except cells vanishing from the Leave War. That is exactly the shape `oilUpgradeMovedMoney` (`oilev.ts:480`) was written to guard.

**Fix, step by step.**
1. Add to plan §2 a row "**CLASH: D27/D32/D33 vs D28 on the two seats that expand today**", put it to the owner with the two options: (a) OFF everywhere (newest ruling wins — D32/D33 are later than D28) and tell him plainly "the crowd on a ground row or Common Programme row stops earning until you flip it on"; (b) OFF everywhere except those two seats (two defaults for one puck — against D32's one-list spirit). Recommend (a).
2. Whichever he picks, add to §5 step 3 the list of tests that will go red **on purpose**, with the ruling that flips each: `ui/oilmode.test.tsx:205` (OIL23, the sentinel's full-day bar), `engine/oilev.test.ts:233` (OIL24), `engine/oil.test.ts:207`. The house rule is "never weaken a failing assertion — understand it"; the plan must pre-authorise these three or the builder will be stuck.
3. Add to §6 "Existing data": already-published weekend days carrying a sentinel change what they pay on upgrade. Dev-phase rule applies (reset demo data, no migration) — but say it, and add a test: publish a Saturday with an ALL AVAIL ground row under the old default, then read the frozen snapshot with the new reader, and assert the documented outcome (either an upgrade guard like `oilUpgradeMovedMoney` flags the day, or the reset is the answer).

### M2. SC MAIN and SC SPARE share ONE item address, so "SC SPARE offers the switch, default off" is unbuildable as written

- `engine/waves.ts:44-52` — `makeStandalone` builds **one formation per shift** with `aircraft:[main, main, spare, spare]`. `spare` is on the aircraft row (`saCrewRow`), and every `f.spare` reader in the repo is a legacy fallback.
- `engine/oil.ts:150` — `item = rowItemKey(f.rid)`: every seat on the shift, MAIN and SPARE, tags the **formation's** rid.
- `ui/oilmode.ts:633-637` — `oilItemOfKey` maps every cockpit key to the formation; `ui/board.ts:248` draws one switch per line.

So after step 4 the SC AM shift's MAIN seats (default on, D15) and SPARE seats (default off, D24) sit under one item mark. There is no item-level way to say "main on, spare off", and no separate switch for the spare exists on any surface.

**Fix — choose one, before step 2:**
- **Option A (recommended, no new address):** the default lives on the **span**, not the item (see M3). Spare spans default off; an activated spare is credited **per man** by tapping his puck (`allow`), or the whole line is forced on with the item mark `1`. Tell the owner that "credit the spare" is a tap on the man, not a line switch — his D24 words ("click credit OIL") are satisfied either way.
- **Option B (a spare sub-switch):** aircraft rows already carry rids (`engine/rowids.ts:29` pushes every `aircraft` entry into the id walk). Spare rows get their own item: in `dayOilWork` set `item = ac.spare ? rowItemKey(ac.rid) : rowItemKey(f.rid)` inside the aircraft loop; `oilItemOfKey` returns the aircraft's rid when that row is spare; the switch is drawn on the SPARE row's MAIN/SPARE badge cell (`saRoleHTML`) in the mode; `reach(item)` fires per spare row. Tests: `oilItemOfKey` for a spare key, and a spare toggled on while its main stays untouched.

Proof either way: a shift with one MAIN man and one SPARE man, no marks → MAIN earns, SPARE does not; then the chosen gesture credits the spare without touching the main.

### M3. Where the "kind's own default" comes from is unspecified, and the parameter that looks like it already exists means something else

`earnsFrom(ev, person, item, dflt)` (`oilev.ts:159-163`) — `dflt` is the **person** default (the member's own answer on a claim). The kind (wave kind, `ac.spare`, `dw.sa`) is not in the evidence block; on an issued day it is only readable off the **frozen day**. So the kind default has to be tagged by the walk, or a second rulebook appears — the exact drift F2 warns about.

**Fix (this IS step 2, specified):**
1. `engine/oil.ts`: add `dflt: boolean` to `OilWork`. In `dayOilWork`, `put` stamps `dflt:false` for a span produced by sentinel expansion, for `ac.spare` rows, for waves where `isStandalone(wv) && wv.kind !== 'sc'`, and for desks where `saExemptKind(dw.sa)`; `true` otherwise. (`dayOilBlind` is untouched.)
2. `engine/oilev.ts`: `OilDecisions.items` becomes `Record<string, 0 | 1>`. `itemOn(ev, item)` returns three values: `false` under blanket or `===0`, `true` on `===1`, `undefined` otherwise. `earnsFrom` becomes: `const io = itemOn(ev,item); if (io === false) return false; const dec = personDecision(...); if (dec) return dec === 'allow'; return io === true ? true : dflt`. `oilEarnedWork` line 585 passes `w.dflt` instead of `true`.
3. `ui/oilmode.ts`: `itemDefaultFor` must read the span default too — add `spanDefault(day, person, item)` in `oilev.ts` (run `dayOilWork` with the frozen `sent` resolver, find the span for that person+item, return its `dflt`, else the claim answer) and have both `itemDefaultFor` and `oilEarnedWork` derive from the same tagging. `toggleOilItem`: for an item whose spans all default on, keep today's `unset ↔ 0`; for an item with any default-off span the cycle is `unset → 1 → 0 → unset`.
4. Prove step 2's "no behaviour change" claim by landing it with every `dflt` = `true` and the suite green; step 3 is then only the tagging in (1).

### M4. Step 5's fold into `put` makes a cockpit sentinel EARN, and D33's "refused" needs a shape this app does not have yet

- `engine/oil.ts:160` — `[ac.p, ac.w].forEach(v => put(v, win))`: after the fold, a placeholder in a cockpit expands to everyone free for report→debrief, on a line whose item defaults ON.
- Both doors **plant first and warn after** (owner, 13 Aug 26): `state/view.ts:908-916` (`placeArmed` writes, then the toast), `ui/drag.ts:292-299` (`setSlotVal` then `barDrop`). `slotBar` is advisory, and its first line accepts a placeholder anywhere: `avail.ts:313` `if(!p||p.special)return '';`.
- `ui/palette-html.ts:180-185` — `specialRowHTML` never asks `slotBar`, so an armed cockpit shows no reason on the placeholder row.
- Copies bypass both doors: `daytpl.ts` and `drafts.ts` have no special check (grepped), so a captured day template or parked plan re-lands a cockpit sentinel after the refusal exists.

**Fix.**
1. `engine/slots.ts`: add `export function sentinelSeatOK(key)` — false when the key is a flying key (no prefix, resolves through `flyRef`) and the id is special. In `setSlotVal`, **before `noteChange`** (or a pending mark with no change reaches the next AL as an unexplained item): `if(isSpecial(id)&&!sentinelSeatOK(key))return false;` and make `setSlotVal`/`fillSlot` return a boolean.
2. `engine/avail.ts` `slotBar`: before the special short-circuit, `if(p.special&&!sentinelSeatOK(key))return 'ALL / ALL AVAIL cannot crew a jet — name the people';` — the drag ghost's amber `dwhy` (`drag.ts:109-116`) and the drop toast then carry it for free.
3. `state/view.ts placeArmed`: if the write returned false, toast the `slotBar` reason and return — no `armDrop`, no "planned", no history step. `ui/drag.ts applyDrop`: same on the roster branch and the **swap** branch (a swap can move a sentinel into a cockpit).
4. `palette-html.ts specialRowHTML(di)`: when a cockpit key is armed, draw the two placeholder pucks with `.no` + `rwhy` from `slotBar`.
5. `engine/oil.ts`: the flying branch keeps a **non-expanding** put (pass a flag) — the money belt for data that arrived by copy or was persisted before the refusal. Test: a cockpit sentinel credits nobody after the fold.
6. Nice-to-have: a warning-list line when a cockpit holds a special ("aircraft looks crewed, nobody is on it" — D33's own words).
7. Add to §2: **CLASH** — D33 (22 Sep, hard refusal) vs the 13 Aug "everything plants, warning after". Newest wins; the plan must say it is carving the first hard refusal out of that rule and where.
8. Reorder §5: the refusal (today's step 6) goes **before** the fold (step 5), or the two ship as one step.

### M5. The mode does not open a placeholder into real pucks on duty desks, sim seats, passengers or any extras line — and §4 has no column for it

`ui/board-html.ts:207` (Common Programme `whoArr`) and `:537` (ground `who`+`more`) call `oilRowPeople`. Every other seat — `sbSeat`, `sbMore` (`:324-326`), sim p/w/pax, duty `id`/`more` — goes to `oilSeatHTML(di, id, OILITEM…)` with the raw id, which draws an **inert** ALL AVAIL puck ("nothing measurable to earn from here"). Register OIL8: "opens into real pucks inside the mode, or its people cannot be tapped at all." Without it, taking one man off a crowd on the owner's Sunday desk is impossible; the item switch is the only door.

**Fix.** Add a fourth column to §4 — "Opens into real pucks in the mode (OIL8)" — with a cell per row. Wire `oilRowPeople(di, [r.id, ...(r.more||[])], rowItemKey(r.rid), oilWin(r))` for duty rows and `[r.p, r.w, ...(r.pax||[]), ...(r.more||[])]` for sim rows in `board-html.ts`, drawing each through `sbSeat`. Test: a copy of `oilmode.test.tsx:163` (OIL8) for a desk and a sim.

### M6. A published WEEKDAY has no frozen membership, so §6 bullet 4 ("the count on an issued day reads the frozen list") cannot hold once D27 shows the count every day

`oilev.ts:355` — `if (!earns) return {…, sent: {}}`; `oilmode.ts:248` — `oilSentinelPeople` returns `[]` when `!ev.earns`; `oilEvidenceKey` returns `''` when `!earns`. Step 7 says "separate who is available (a read, any day)" but never says whether that read is frozen on an issued weekday. It cannot be, without changing the block.

**Fix.** Decide and write into §6: recommended — **live** on a non-earning day (no money, and D37 calls it "a starting point a scheduler can correct"), **frozen** on an earning day; the chip's title says which ("who has nothing else on today" vs "when this day was issued"). Alternative: freeze `sent` on every publication but keep it out of `oilEvidenceKey` on non-earning days (or every leave filed on a weekday would offer a phantom amendment). One test either way.

### M7. The Leave War side is absent from §4 and §7

A crowd credited from a desk lands 20+ FO/HO cells through `sync.ts:900` (`creditFrom` → `oilEarnedWork`), each passing `ingestDutyCredit`'s clash rule, then the reverse sweep. The order's FULL tier wants the real downstream number, and cross-app changes walked on both sides. **Fix:** add walk rows — the OIL tracker figure per man, the FO/HO cell on the date, the clash strip when one of the 27 has leave that day, and the reverse sweep when the switch is turned off after publication + amendment.

---

## SHOULD FIX (in the build, not blocking)

- **S1. Claim rows are a separate money path the fold does not reach.** `oil.ts:189` skips `g.src` rows whole; `oilev.ts:570` `landedExtras` drops specials. A placeholder dropped in a landed request's `who` (`setSlotVal` has no guard) or its extras (`fillSlot('g:di.ri.+')`) counts nothing and offers nothing. Recommend extending `sentinelSeatOK` to refuse ground rows carrying `src`, with the reason; add a roll-call row.
- **S2. There are FOUR exempt-kind skips in `oil.ts`, not three:** `:146`, `:159`, `:178` and `:249` (`dayOilBlind`). Lift the fourth with the third, or write down why an AVALON desk with a man and no times stays silent at publish.
- **S3. Seed and parity.** Explicit negative: no seed file in `src` and no seed line in `reference/scheduler.html` holds a placeholder (the hits are CSS, the PEOPLE entry and the puck drawer). But §7 wants the owner's Sunday desk **seeded permanently** — Sunday 19 Jul is in week `13/07/2026`, the frozen parity snapshot (`engine/weeks-data.ts:109`). Seed it in `20/07/2026` or keep it script-planted (`scripts/handpass/ef-c18.mjs` already does). I did not open `tfin.js` to confirm which days it compares — verify before seeding.
- **S4. Performance.** `oilSeatDeco` → `oilSentinelSummary` → `oilFigureFor` per man → a full `oilEarnedWork` per man per chip; `availableFor` runs PEOPLE × INPUTS × `personBusy` per sentinel per paint. D27 moves this from weekend-in-mode to every day, every seat, every repaint. Memoise per (day, version); the plan must cite `docs/performance.md` Part 1.
- **S5. Overnight AVALON/BB — no ruling says which day earns.** `w2` rolls midnight (`oil.ts:132`), so 19:00→07:00 is 12 h on the day the line sits on: Friday night into Saturday earns nothing; Sunday night into Monday earns a full Sunday. First time an overnight line can earn — ask the owner before step 4 ships.
- **S6. The next-week peek** (`ui/peek.ts:49`) draws a bare ALL AVAIL puck with no chip. Mark it NO-because in §4 or wire it.
- **S7. Tap-target collision.** A seat holding a placeholder arms on tap (`interactions.ts:1013-1016`, `board.ts:1277-1283`); the names live on the chip (`data-oilsent`). Step 7 must keep the chip as the tap target on every new seat, and the door check walks both gestures per row.
- **S8. Item switch, third state.** Once an item can hold default-on and default-off spans (Dash + ALL AVAIL on one desk), `oilItemCellHTML`'s two titles (`oilmode.ts:494`) are not exhaustive. Step 8 needs the mixed wording.
- **S9. Expected side effect to name in §6:** `oilEvidenceKey` includes `sent` and `oilDelta` (`publish.ts:311-313`) compares live vs issued, so every new sentinel seat makes an issued day read "pending" the moment anyone files an input for that date. Correct (money moved), pre-existing, now multiplied — the walk should expect it.

---

## B. The four findings, verified

- **F1 CONFIRMED.** `oilmode.ts:177-181`: `return !(item && dec.items && dec.items[item] === 0)`. `oilev.ts:144-148`: false only on blanket or `=== 0`, else true. `oilEarnedWork` passes `true` as the default (`:585`). Deleting the skips would pay SC SPARE/AVALON/BB at once.
- **F2 CONFIRMED, with one nuance the consolidation must respect:** the two bodies read different **sources** — `oilItemOn` reads the live `DAYS[di].oild`, `itemOn` reads `ev.d` (the frozen copy on an issued day). Consolidate onto the evidence (`oilItemOn(di,item) = itemOn(evOf(di), item)`); they agree today only because `withDaySnap` swaps `DAYS[di]` for the snapshot.
- **F3 CONFIRMED.** `put` (`:129`) → `rid(v)` → `realP` returns null for a special → dropped. `putWho` only at `:192` (ground `who`) and `:201` (Common Programme); its `more` tail goes to `put` (`:142`). Flying `:160`, sims `:173`, duties `:185`, Common Programme `more` `:202` all use `put`.
- **F4 CONFIRMED, and sharper:** `setSlotVal` writes any id anywhere (`slots.ts:93-131`, no special check); `slotBar` accepts a special on its first line; both doors plant-then-warn; `isSpecial` gates every validation path (`validate.ts`, `events.ts`, `weekctx.ts`, `avail.ts:14` — grepped, 30 sites).

## C. Roll-call gaps (beyond M5's missing column)

Missing rows: the claim row's `who` and extras (S1); the next-week peek (S6); the Leave War surfaces (M7); a roles line (the count is a read a member sees on View-only Sched; the switch is admin's). Precision: flying lines have **no** extras line (`flyRef` keys take no `.xN`), and on the Common Programme "extras" are the `who` list itself (`fillSlot('a:…+')` appends to `who`, `slots.ts:150-152`) — which already expands; the drops that lose the puck are ground `more`, duty `id`/`more`, sim `p`/`w`/`pax`/`more`. The SC shift row must be split MAIN vs SPARE in the table (M2).

## D. Order of work

Step 1 is safe **if** consolidated onto the evidence (F2 nuance). Step 2 is safe only after M2/M3 are decided, or it is built twice. Step 3 is **not** "safe — and only now": it moves money on existing issued days (M1). Steps 5 and 6 must swap or merge (M4), and step 5 must carry M5. Step 7 needs M6 decided first.

## E. The freeze, walked

The freeze holds for every seat whose span carries a non-empty item: `oilEvidence` writes `sent[item]` (`oilev.ts:360-366`) and `oilEarnedWork` reads only `ev.sent` (`:582`). It fails, silently, in five places: (1) a rid-less row — item `''` is never frozen (`if (item)`) and credits nobody until the next id walk; (2) non-earning days (M6); (3) claim rows (S1); (4) the flying branch if it expands (M4) — it would freeze **and** pay; (5) the upgrade of already-issued days (M1). The plan's "silent" claim is **confirmed**: the specific silent path is the reverse sweep (`sync.ts:1226-1236`) removing cells with nothing on screen.

## F. Rulings

Contradictions: D27/D32/D33 vs D28 (M1); D33 vs the 13 Aug plant-then-warn rule (M4); D24 "SC SPARE offers the switch" vs the one-item-per-shift structure — buildable only with M2's choice. **D36: no violation found** — `availableFor` reads `personBusy` (`avail.ts:32`, step/dekit, shift exact); belt: the flying branch must never hand its report→debrief window to `expandAll`, or a sentinel there would be resolved against the wide window (moot under D33, real if M4's belt is skipped). D35 is satisfiable with no new flag: `dutytpl.ts:184` mints `sa` on a template block and the walk reads `dw.sa`. D31: `oilCapableItems` is the right body. D37/D39 consistent.

## Explicit negatives

Checked and found nothing: `reassignInput` refuses specials (`inputedit.tsx:1197`), so the `iu:` target is closed; the calendar puck picker excludes them (`InputsCal.tsx:786`); `HOOKS.oilSentinel` defaults to `[]` (`hooks.ts:58`) so tests never resolve live; no seed or parity fixture holds a placeholder.

## Not verified

Which days `tfin.js` compares (S3); whether `oilmode`'s week-side builders draw the switch anywhere (the mode appears board-only — `dayBarHTML`/`board.ts`); I did not run any test.
