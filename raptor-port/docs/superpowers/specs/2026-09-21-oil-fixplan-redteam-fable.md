# RED TEAM of the OIL fix plan — Fable 5.1, independent (22 Sep 26)

Attacking `docs/handpass/2026-09-21-oil.md` §6 — the eight ordered fixes and the batch — before any
of it is built. Written blind to Astra's answer. I read the code (`engine/oil.ts`, `engine/oilev.ts`,
`ui/oilmode.ts`, `ui/board-html.ts`, `ui/board.ts`, `ui/inputedit.tsx`, `engine/slots.ts`,
`engine/publish.ts`, `engine/validate.ts`, `leavewar/sync.ts`, `leavewar/state/store.ts`,
`leavewar/state/demoworld.ts`, `state/store.ts`) and ran three small probes against the built app
to settle the one fix whose shape could not be read off the code (fix 3). Nothing was changed, no
gate was run, no server touched.

**Marks:** NEW = nobody has this yet · KNOWN = in the plan or already filed · DISAGREE = the plan
has it, and the shape or the diagnosis is wrong.

---

## 0. The one-paragraph version, for the owner

The plan gets the SYMPTOMS right and, on the three fixes that matter most, aims at the wrong
mechanism. **Fix 1** is not a refusal being carried from one man to the next — the code already
addresses every decision to *a man on an item* — it is the new man's OIL question never being asked
and "not answered" being drawn as "refused". **Fix 2** is a regression from yesterday's own repair:
the check that stops a cancelled request paying (R-2, fix 3) also stops a multi-day request paying
on any day but the one its row sits on; the plan proposes rebuilding how every request lands on
the programme to work around it, which is a much bigger change than the one-line cause. **Fix 3**
is not a phantom at all: the app forgets, on the first reload after the war is first saved, that
the demo's posted-out man is posted out — he walks back into the family day, and the "1 pending"
is the day honestly reporting that; the amendment it issued was not empty and could have moved
money. Suppressing that mark, which is what "must not manufacture a pending amendment" invites,
would hide every real roster change after a publish. The other five are the right shape, with the
corrections below. Two things are missing from the list entirely, both the same shape as fix 1.

---

## 1. FIX 1 — a request handed to a different man (DISAGREE on the diagnosis; the fix is elsewhere)

### What the code actually does (read, not assumed)

- A per-person decision is stored as `people["<personId>|<itemKey>"] = 'allow' | 'deny'`
  (`engine/oilev.ts:63-66`), written only by `toggleOilPerson` (`ui/oilmode.ts:242-266`), read only
  by `personDecision` → `earnsFrom` (`oilev.ts:135-147`) and `oilPersonOn` (`oilmode.ts:148`). For
  a request the item is `i:<iid>`. Talisman's refusal is therefore `talisman|i:<iid>`. When the
  request becomes Ace's, the lookup is `ace|i:<iid>` — **undefined**. Nothing carries the refusal
  across. The plan's premise ("carries the first man's refusal") is not what happens.
- What happens instead, in order:
  1. The Inputs dialog's save runs the OIL ask gate **before** the commit:
     `oilGate(draft, prevRow)` (`ui/inputedit.tsx:649-666`) prices the NEW draft's plan against the
     OLD row's answers (`prev = prevRow.oil`). Talisman answered Saturday = 0.5; Ace's plan wants
     Saturday = 0.5; nothing is `stale`; the gate returns `'none'`. **Nobody is asked.**
  2. The commit then deliberately deletes the answers because the person changed:
     `if (r.oil && (!oilAsks(r.type) || r.person !== wasPerson)) delete r.oil` (`inputedit.tsx:1034`).
     Its own comment says "the new person must be asked again" — but step 1 already decided not to.
  3. Ace's projected claim now has `ans: null`. Both readers treat null as No:
     `earnsFrom(ev, person, item, inp.ans != null && inp.ans > 0)` (`oilev.ts:312`) and
     `itemDefaultFor` (`oilmode.ts:160-164`).
  4. The mode draws that as `"Ace earns nothing from this event — tap to put him back on it"`
     (`oilmode.ts:371`) — the wording of a refusal, on a man who was never asked.
  5. Ace also loses the family-day half he had, because a Training commitment overlapping
     10:00–14:00 correctly drops him from ALL AVAIL (`sync.ts:748`). Net: blank. Two correct rules
     and one missing door.
- The hand-back (Codex scenario 7) IS real: `talisman|i:<iid> = deny` survives in `oild` because
  no writer ever clears a decision when the person leaves (grep: `oild` is touched by nothing
  outside `oilmode.ts`/`oilev.ts`/`publish.ts`/`drafts.ts`). But today it is masked twice over —
  Talisman comes back with his answers wiped too, so he reads "earns nothing" either way.

### The question the brief says nobody has answered: PERSON, REQUEST, or PAIR?

**PAIR — as already built — plus a clearing rule at the one write site, plus a re-ask.** Each
alternative has the failure the brief names, and the pair's failure (resurrection on hand-back) is
the only one that can be closed cheaply because it has exactly one write path:

- `commitInputEdit` is the single door through which a person can change (the dialog, the
  calendar drag, and `reassignInput` at `inputedit.tsx:1138` all land there). The clearing rule
  goes there: when `r.person !== wasPerson`, delete `people["<wasPerson>|i:<iid>"]` from
  `DAYS[di].oild` for every loaded day the input covers, then `tidy()`. That is §7.4's own answer
  ("a change of person… clears it, visibly"), which was designed and never implemented.
- Residual, stated: a decision on a day in a week that is NOT loaded (the stash) cannot be
  cleared at the write site. It can never match anyone but the man it names, and on his return the
  gate (below) asks again — so the residual is "an old deny is still on disk", not "a man is
  unpaid". If you want it closed too, prune at read: in `oilEvidence`, drop any `people` key of the
  form `<p>|i:<iid>` whose `p` is not that input's current `person` in the projection. The copy is
  what gets keyed and signed, so the prune is consistent; do it in the copy, never in `DAYS`.

**Does it hold when the day is published and the change is an amendment?** Yes, and only because
of R-1. The person change happens on the working copy; the frozen block keeps paying the old
arrangement (Talisman nothing, Ace his family-day half) until the day is published again. The
re-ask below happens BEFORE the save, so the amendment goes out carrying Ace's answer; AL2 then
pays Ace exactly what he answered. Hand-back re-asks Talisman and finds no stale deny. The
amendment itself already carries the row delete, the row add and the filing change — it is a real
amendment, not an OIL-only one.

### What breaks elsewhere if the plan's wording is built literally

An engineer told "the decision must not carry to the new man" will look for the carry, find the
key is already per-man, and write a clearing rule — and Ace will STILL arrive earning nothing,
because his answer is null. Mirror-image: nothing visible changes, the fix is declared done.

### Rulings it touches

- §7.4 / OIL25 — already says pair + clear-on-change. The plan restates half of it as if it were
  new; the clear was never built (NEW finding).
- The robustness doctrine (`CLAUDE.md`): "no usable value must fail CLOSED… while staying VISIBLY
  inert rather than silently wrong." Unanswered failing closed is right; drawing it as a refusal is
  the "silently wrong" half.
- §2.2 / OIL10 — the member's answer is the default and is never overwritten. Re-asking on a
  person change does not overwrite anyone's word: the old answers are already void (line 1034).

### Instructions (engineer)

1. **RED first** — `src/ui/inputedit.test.tsx` (or a new `oil-person-change.test.ts`): build a
   Saturday, land Talisman's Training with `oil:{[sat]:0.5}`, publish through `setSign` ×4 and
   the real publish path, `toggleOilPerson(di,'talisman','i:<iid>')`. Then
   `oilGate({...draftOf(r), person:'ace'}, r)` must return `kind:'ask'` — today `'none'`.
2. In `oilGate`, treat a person change as stale:
   `const prev = (prevRow && prevRow.person === draft.person && prevRow.oil) || {}` — so the plan
   is priced against no answers and the sheet opens. Same one-line rule covers a type change out
   of the ask set automatically (`oilAsks(draft.type)` already gates).
3. `reassignInput` (`inputedit.tsx:1138`) bypasses the gate entirely (it calls `commitInputEdit`
   straight). For an `oilAsks` input it must either open the same `OilConfirm` sheet, or refuse
   with a toast: *"Change the person in the dialog so the OIL question can be asked"*. Refusing is
   the smaller change and the drag is the rarer door. Test: `reassignInput(iid,'ace')` on an OD
   claim returns false and leaves `r.oil` intact.
4. In `commitInputEdit`, inside the `r.person !== wasPerson` branch, clear the old man's pair
   decisions on every loaded day the input covers (`inputCoversDate(r, d.dt)`), through one small
   exported helper in `oilmode.ts` (`clearOilPersonDecisions(di, person, item)`) so the write stays
   in the file that owns `oild`, and log one history line: *"Talisman's OIL decision on Training
   cleared — the request is Ace's now"*. Test: after the change `DAYS[di].oild.people` has no
   `talisman|` key; undo restores it.
5. **The wording** (also fixes MISSING M3): `oilSeatHTML`'s off-state title must distinguish
   `inp.ans == null` — *"Ace has not answered the OIL question for this Training yet — tap to
   allow it now"* — from a member's No and from a scheduler's deny. `itemDefaultFor` already has
   the input in hand; return the reason alongside the boolean.
6. Re-walk in the app: person change on a published day → sheet opens → answer yes → AL2 → Ace
   paid; hand back → sheet opens for Talisman → answer yes → AL3 → Talisman paid, no stale deny.

---

## 2. FIX 2 — a multi-day request pays nothing (DISAGREE on the shape; it is a one-line regression)

### The cause

`oilInputEligible` (`engine/oilev.ts:280-285`), added yesterday under R-2 fix 3:

```ts
if (inp.acc !== 'g') return true
const row = (day.ground || []).find(g => String(g.src||'') === inp.iid)
return !!row && !row.cx && !row.info
```

`acc` is ONE field on the input; `acceptInput` (`slots.ts:344-`) pushes ONE row on ONE day and
refuses a second landing for the same id. So a Fri→Mon Training is `'g'` with a row on Friday
only; on Saturday `row` is undefined, `!!row` is false, the claim is ineligible, and the mode and
the money agree (correctly, by construction) that there is "nothing measurable". Before R-2 the
same claim paid Saturday from `acc/win/ans` alone. **This fix regressed it.** The per-day answer
(`oil:{sat:1, sun:0}`) is stored and projected correctly (`ans` read per ISO, `oilev.ts:164`).

### Why "land a row on every day" is the wrong shape

- `acceptInput`'s "this exact input already has a landing" guard (13 Sep 26, ARCH-STACK 1A) is the
  idempotency that stopped twin rows; N rows means rewriting it, `acceptedDay` (returns one day),
  `unacceptInput` (removes one row), the `extras` capture in `commitInputEdit` (`inputedit.tsx:
  978-987`, one row), `reconcileLandedAcc`, `relandInputs`, and the board's ✕ (`board.ts:1036`,
  which un-accepts ONE row and would orphan the others).
- OIL37 / the 16 Sep ruling: a request filed on a published day is ONE pending amendment. N rows
  on N published days is N amendments for one request.
- The Personal Inputs panel already echoes the request on EVERY day it covers, by date
  (`sbInputsGroupPanel`, `inputCoversDate`), and the mode already reaches it there with the same
  item key (`board-html.ts:576-586`, `617`). There is nothing for a Saturday row to add except a
  second copy of the same claim on the same screen.
- OIL13 ("an input the scheduler took off the programme earns nothing") is served by the DORMANT
  state (`acc='r'`), not by the row's presence — and the board's delete of a landed row routes to
  `unacceptInput`, so "no row on this day" can only ever mean "landed on another day" (checked:
  `board.ts:1025-1039`; the only writers of `'r'` are `unacceptInput` and `relandInputs`).

### Rulings it touches

R-2 fix 3 itself (cancelled/ⓘ earns nothing) stays true; it just must only be asked of the day
that HAS the row. `acceptInput`'s one-landing rule; OIL37; the persistence funnel (N rows through
one funnel key). None of these is contradicted by the small fix.

### Instructions (engineer)

1. **RED first** — `engine/oilev.test.ts`: an input `date:'Jul 17', endDate:'Jul 20', acc:'g',
   oil:{'2026-07-18':1,'2026-07-19':0}` with its row on the Friday day only;
   `oilInputEligible(saturdayDay, projected)` must be true (today false), and
   `oilEarnedWork(saturdayDay, oilEvidence(5))` must carry Anvil (today empty). Sunday must stay
   empty (he answered No). Assert through the production route the fix plan's test rule demands:
   `runOilPass` and the war cell, not the helper alone.
2. Change the helper so a missing row means "landed elsewhere, the claim stands on its own":
   `if (!row) return true; return !row.cx && !row.info`. Rewrite the comment — the sentence "a row
   that has been deleted outright takes its claim with it" describes a state the app cannot reach
   (deletion makes the input dormant, caught two lines above).
3. Nothing else. Do not touch landing. The green bar and the mode reach the Saturday through the
   Personal Inputs echo already; walk it and record the picture.

---

## 3. FIX 3 — the reload "phantom" (DISAGREE: it is not a phantom, and suppressing it is the mirror bug)

### What the probes showed (run against the built app, three times, read off the bridge)

Publish the fixture Saturday; capture the live-derived evidence and the frozen block; reload;
capture both again. Decisions, inputs (`iid/person/type/acc/win/ans`), row ids and answers were
**byte-identical** before and after. One field differed: the frozen ALL AVAIL membership of the
FAMILY DAY row gained one man after the reload — `ignite` (Torch). Before the reload and in the
issued document he was OUT; after, IN.

Why: Torch is the demo's posted-out man (`demoworld.ts:45 — "posted out (demo overlay carries the
date)"`). The overlay writes his window straight onto the person (`p.from/p.to`,
`demoworld.ts:180-186`) and only when **no wars are stored yet** (`main.tsx:58`,
`hadStoredWars`). The war persists `wars, personedits, postouts, …` but deliberately not `people`
(`store.ts:896-905`), and the overlay never records its window in `postOuts`. The saved base world
carries **no** `raptor:leavewar/*` key at all; the published world carries all of them. So: fresh
session → Torch posted out → publish freezes him OUT and lands the first credit → the war is saved
for the first time → reload → overlay skipped, no posting record → Torch is IN the squadron → the
family day's live membership grows → `oilDelta` fires → "1 pending". Publish AL1 and the frozen
membership now includes him, so every later reload is "clean". A weekday is clean because its key
is `''` (`earns:false`), not by accident.

### Consequences the evidence sheet under-states

- **AL1 was not empty.** It re-included a man the app had forgotten was posted out. His cell did
  not move only because 10:00–16:00 is exactly six hours (HO before, HO after). Had the family day
  ended at 14:01 he would have gone HO → FO in an amendment "with nothing in it".
- The same "1 pending" is CORRECT behaviour under R-1 whenever the roster behind an ALL AVAIL row
  really changes after a publish — a post-out, a post-in, a leave filed, a SANS man planned. The
  mark is how the change reaches the money. A fix that stops the mark ("a reload must not
  manufacture a pending amendment", implemented in OIL by re-freezing at boot, ignoring an OIL-only
  pending, or dropping `sent` from the key) makes a posted-out man keep a family-day credit forever
  with nothing flagging it. **That is the mirror-image bug, and it is worse than the phantom.**

### Rulings it touches

R-1 (the mark is the mechanism). The persistence funnel ("a write that ends anywhere else is LOST
on reload") — the overlay's window is exactly such a write. The dev-phase ruling (reset demo data,
don't migrate) — the seed schedule plants Torch on July sorties while the demo posts him out in
January; pick one. F9's wording half (filed, not done): the pending item reads "the OIL decisions
on this day changed" when no scheduler decided anything.

### Instructions (engineer)

1. **RED first** — `leavewar/demoworld-stored.test.ts`: install the demo world fresh, assert
   `inSquadron(ignite,'2026-07-18')` is false; persist; re-init the store from the same backend
   with `hadStoredWars=true`; assert it is STILL false (today true).
2. In `installDemoWorld`, when the overlay applies a window, record it the way a real post-out
   does — `postOuts[p.id] = windowRecord(people, p.id)` (the helper `setPostOut` already uses,
   `store.ts:1472`) before `setPeople(people)` — so the first persist carries it and every boot lays
   it back. Or, per the dev-phase ruling, drop Torch's demo posting since the seed schedules him in
   July; either way the two worlds must agree.
3. `oilDelta` (`publish.ts:305-307`) compares one string. Split the comparison by axis and word
   the item by what moved: decisions → *"the OIL decisions on this day changed"*; a claim's answer
   → *"Talisman's OIL answer on Training changed"*; membership → *"who stands behind ALL AVAIL on
   FAMILY DAY changed (Torch in)"*. `oilEvidenceKey`'s parts are already separable
   (`oilev.ts:256-261`). Test: a sent-only change names the row and the man.
4. Do NOT: re-freeze at boot, drop `sent` from the key, or special-case an OIL-only pending count.
5. Re-run the hand pass's D4 from a fresh world after (2): no pending after reload.

---

## 4. FIX 4 — a holiday taken off a published day (KNOWN; the placement is the trap)

- The whole OIL block in `validate.ts` sits inside `if(earnsOil){…}` (`validate.ts:1105-1143`).
  When the holiday is cleared, `HOOKS.oilEarningDay(di)` is false, the block never runs, and no
  advisory written inside it can ever fire. The mirror advisory must sit **outside** the gate:
  `if(!earnsOil && dayApproved(di))` read the frozen block (`daySnapOf(di,dayCurVer(di)).d.oilev`)
  and if `frozen.earns` add `OIL_STALE_DAY` with the reverse wording.
- `earnsOil` is `day.dow==='Saturday'||day.dow==='Sunday'||HOOKS.oilEarningDay(di)` — a second
  literal beside the hook (the hook already covers weekends via `isWeekend`). Harmless today;
  fix 6 changes the hook and this seam goes live. Collapse it to the hook now (one function, the
  doctrine).
- Wording: the plan's *"publish it again to withdraw the OIL"* reads as an order. R-1 says the
  withdrawal WAITS for a republication; it does not say the scheduler must make one. Say both ways
  out: *"…publish it again to withdraw the OIL, or declare the holiday again to keep it."*
  Otherwise the "1 pending" is a mark he can only clear by taking money off men who worked.
- Also: `oilShown` goes false with the hook, so the OIL Earn button disappears and the decisions
  underneath cannot be looked at. Acceptable (there is nothing to decide), but the advisory must
  say the bars are gone because the day no longer earns, not because anyone was taken off.
- Test RED first: `validate.test.ts` — PH Wednesday with a timed desk, publish through the real
  path, clear the PH via `HOOKS.oilEarningDay`, `validate()`; expect `OIL_STALE_DAY` with the
  reverse text on `WARN.byDay[di]`.

## 5. FIX 5 — the mode is not read-only (KNOWN, partly DISAGREE on what must be shut)

What is live and why: the two panels are built by `sbInpRow` (`board-html.ts:562-640`), which
knows the mode for the puck and the type cell (`oilItem`) but still emits the three
`data-ifld` boxes (start, end, remarks), the LATE chip (`lateChip`, a `data-lateoff` button) and
`accCtl` — whose "Undo" button IS the un-accept that removed Gambit's Meeting row
(`html.ts:1772`, `interactions.ts:504` → `unacceptInput`). The hand pass's "UNDO removed a row" is
this panel button, not the global Undo.

- **Money-moving, must be shut:** the two time boxes (an in-place re-time runs `setInpField` →
  `commitInputEdit`, which wipes a positive answer whose amount changed — see MISSING M1) and the
  Accept/Undo control (removes or re-lands a claim). In `sbInpRow`, when `oilItem` is set, emit
  the boxes with ` disabled` and emit `<span class="accs"></span>` in place of `accCtl`. The
  handler side is already gated on `RO` for boxes; add `oilModeOn(di)` to that gate in
  `board.ts:1128-1136` as the belt.
- **Not money — the plan's claim is wrong:** the LATE chip is "a MARK, not a warning… invisible to
  `validate()`" (owner, 9 Aug 26); `oil.ts`/`oilev.ts` never read it. Toggling it in the mode moves
  nothing. Making it inert in the mode is still right (the mode should not take gestures that are
  not OIL gestures), but do not describe it as a money leak.
- **Not a defect — leave live:** the four sign-off pickers, Publish day and Unpublish. Deciding OIL
  and then signing and publishing without leaving the mode is the natural order of the job; no
  ruling asks for them dead, and "no third term in editMode" (9 Aug 26) argues against inventing a
  mode-specific gate. DISAGREE with shutting them.
- **Should close the mode instead of being shut:** the plans selector (switching plan under the
  mode changes which decisions the pucks show, silently — mirror the week-step rule from
  yesterday's fix 7: `setOilDay(null)` on a plan switch) and the global Undo/Redo (A6: it walks
  past the mode's own taps into schedule edits and changes the day). The mode writes nothing on
  entry, so closing it costs nothing; a mis-tap inside it is undone by tapping again.
- **The crew palette drag** (finding 5): gate the palette's `data-drag` on `!oilModeOn(di)` where
  the board builds it; a drag that can never drop reads as broken.
- Test RED first: `board.test.tsx` — mode on, `sbInpRow` output has no `data-lateoff`, no
  `data-acc`, every `data-ifld` box `disabled`.

## 6. FIX 6 — a weekend no leave period covers (KNOWN; three seats, not one)

- `HOOKS.oilEarningDay` = `isNonWorkingISO` (`sync.ts:181-184`) = `isNonWorkingDay`, whose first
  line is `if (isWeekend(date)) return true` (`eventdefs.ts:122`) — true with no war at all. The
  credit then dies quietly in `runOilPass` (`if (!warHolding(...)) continue`, `sync.ts:1163`), and
  `publishFlagsBids` returns early on `!warHolding` — so every reader upstream says "earns" and the
  one writer says nothing.
- Put the war test in ONE new function beside `isNonWorkingISO` — `oilEarnsISO(iso) =
  !!warHolding(wars, iso) && isNonWorkingISO(iso)` — and point three readers at it: the hook;
  `oilAskPlan` (`sync.ts:636`, which today asks the member an OIL question for a date whose answer
  can never land, and lights the bell for it — MISSING M7); and the validator's `earnsOil` (via
  the hook, after fix 4 collapses the dow literal). Leave `isNonWorkingISO` itself alone —
  `charge.ts` reads the same body for leave charging and a weekend is still a weekend there.
- Then the day needs ONE line, a hard one, where `earnsOil` is false but `isWeekend`: *"No leave
  period covers this date, so its OIL cannot be recorded — create the period on the Leave War
  first."* When the period is later created, the frozen block says `earns:false`, `oilWouldEarn`
  turns true, and the existing `OIL_STALE_DAY` advisory already tells him to publish again. That
  path is built and coherent; nothing new is needed on the war side.
- Test RED first: `oilsync.test.ts` — a Saturday no war holds: hook false, `oilShown` false,
  `oilAskPlan` returns `[]` for it, `validate()` carries the new line and NOT `OIL_UNPUBLISHED`.

## 7. FIX 7 — the SC switch on every line (KNOWN on the header; DISAGREE on "never on an empty line")

- `board.ts:225` draws `oilItemCellHTML(di, rowItemKey(f.rid), f.cs, 'lin')` inside the per-
  AIRCRAFT loop (`fly += <div class="sb-line">…` per `a`), keyed to the FORMATION's rid. A standby
  mint is one formation with a crew row per line (26 Aug 26), so an SC shift with eight aircraft
  rows draws eight switches to one decision. That is the whole finding.
- Draw it once: emit the switch on the formation's FIRST aircraft row only and plain text
  (`<span class="lin oilitem none">`) on the rest, with a title *"part of the shift above — its
  switch is on the first line"*. The row grip and the c6r register are untouched (same element,
  different content), so the geometry gate should hold — measure it anyway.
- Do NOT adopt the plan's second clause as written. OIL7 says a switch covers a man added later,
  and `oilItemCellHTML`'s own comment keeps the switch on an EMPTY ordinary row for that reason. An
  empty aircraft row in a plain flying formation must keep its (single) switch; the empty SC SPARE
  rows stop drawing one only because the item is the formation, not the row. Scope the clause to
  "not once per aircraft row", and leave `oilCapableItems` alone — it already withholds the switch
  from a spare-only formation (`if(!f.spare)reach(item)`).
- Test RED first: `board.test.tsx` — an SC wave, one formation, MAIN + SPARE + one empty row:
  exactly one `[data-oilitem="r:<rid>"]` in the wave (today three); a plain wave with one empty
  aircraft still draws one.

## 8. FIX 8 — D18, a second man on a request row (KNOWN; the all-day case is the mirror)

- Today `dayOilWork` skips a `src` row whole (`oil.ts:189`), so the second man has no span, no
  item, no switch, and `oilCapableItems` calls the row incapable — which is also why the claim
  row's name cell contradicts its puck (finding 13).
- Shape: on a `src` row, the schedule half must collect EVERYONE ON THE ROW EXCEPT THE REQUESTER,
  with `item = groundItemKey(g)` (= `i:<iid>`, so the requester's claim, the second man's schedule
  work and the row's switch share one address and one mask). The requester stays on the input half
  only — his default is HIS answer (OIL10); if the schedule half put him on too, his No would be
  overridden by the schedule's default Yes. Exclude by id: `whoId(g.who) === srcInput(g).person`.
- **The mirror the plan will build if it stops there (NEW):** `acceptInput` writes `str:'' /
  end:''` for an ALL-DAY request (`slots.ts:396`). The row has no written times, so `w2` is null,
  the second man measures nothing, the row is "incapable", and the name cell says *"Nothing on this
  row can earn"* while the requester beside him earns a full day. For a `src` row take the window
  from the SOURCE INPUT (`inpWin(srcInput(g))` — the member's own statement, not a guess) when the
  row's own times are blank; the requester already earns from exactly that window.
- `dayOilBlind` skips `src` rows (`oil.ts:258`). With the input window rule above a blank all-day
  row is not blind; a request row whose times a scheduler has hand-blanked is. Let the blind walk
  see `src` rows that have a second man and no usable window, same wording.
- Frozen evidence: unaffected (`sent` is sentinels only; the second man is a named id). The
  member editing his request deletes and recreates the row but `extras.more` is carried
  (`inputedit.tsx:978-987`), so the second man survives an edit. Checked.
- Test RED first: `engine/oil.test.ts` — `{prog:'TRAINING', str:'09:00', end:'12:00', who:'talisman',
  more:['comet'], src:iid}`: `dayOilWork` has `comet` with item `i:<iid>` and does NOT have
  `talisman` from the schedule half; the all-day variant (`str:''`) gives comet `[0,1439]`;
  `oilCapableItems` contains `i:<iid>`. Then the money through `runOilPass`.

## 9. The batch (fix 9) — three notes, the rest is fine

- **"Off day" doing nothing is by design, and the design doc contradicts itself.** The library
  ships `{name:'Off day', kind:'free'}` (`eventdefs.ts:56`) and `free` is deliberately NOT
  non-working (owner, 2 Sep 26: an Off day is given by management and "work on it earns NOTHING —
  only a weekend or a PH does", `eventdefs.ts:10-13, 114`). Only a word tagged `off` (PH) earns. So
  the product question is already answered — but `oilev.ts:92` documents `earns` as "a weekend,
  the war's public holiday, **an off day**", which is the stale reading. Fix the comment; do not
  build the feature.
- **"An empty Saturday still nags"** — `OIL_UNPUBLISHED` fires on `oilWouldEarn`, which includes
  the INPUT half. Before calling it a defect, check whether a claim covers 25 Jul with a Yes; if it
  does the reminder is right and the fix is wording ("a claim on this day earns…"). If nothing
  covers it, then it is a defect worth a look — I did not run it.
- The "not in force yet" mark (Q1) is the owner's call and the recommendation stands; note it
  will need the same distinction as M3 (pending deny vs pending unanswered).

---

## 10. MISSING from the list — same shape as one of the 27, not walked

| # | What | Shape it repeats | Mark |
|---|---|---|---|
| M1 | A scheduler re-times a landed request IN PLACE on the board (or the week) from a half-day to a full-day span. `commitInputEdit:1045-1050` deletes the member's Yes because its amount no longer matches; no gate runs (the in-place cells skip `oilGate`, by design); the puck goes dark and reads "earns nothing — tap to put him back". The bell lights for the MEMBER only. On a published day: "1 pending", publish, nothing paid. | Fix 1 — unanswered drawn as refused, reached by an ordinary correction | NEW |
| M2 | The drag-reassign of an Unavailable (overseas duty) row to another man (`reassignInput`) bypasses the ask gate; the OD claim's answer is wiped, the new man is never asked, the mode calls him refused. | Fix 1, second door | NEW |
| M3 | The mode cannot tell "member said No", "scheduler denied" and "nobody has answered" apart — one title for all three (`oilmode.ts:371`), and the third is the one that costs money. | Findings 2/4/13 — the app is right and silent | NEW |
| M4 | The stale pair decision on hand-back (Codex 7) — real in the code (`oild` is never cleared on a person change), untested, currently masked by M3. | Fix 1 | KNOWN-untested |
| M5 | Any roster or leave change after a publish makes an earning day with an ALL AVAIL row read "1 pending — the OIL decisions changed", and the amendment can move money (Torch HO→FO at 14:01). Real under R-1, unexplained on screen. | Fix 3 / F9 wording | KNOWN (wording filed), consequence NEW |
| M6 | D18 built as described leaves the second man on an ALL-DAY request unpaid and the row saying nothing can earn. | Finding 2 mirror | NEW |
| M7 | The OIL question is asked (and the bell lit) for a weekend no war covers; the answer can never land. | Fix 6 | NEW |
| M8 | `validate.ts`'s own weekend literal beside the earning-day hook — a drift seam that becomes live the moment fix 6 changes the hook. | The 19:00 AAR literal | NEW |
| M9 | The seed schedule flies Torch in July; the demo posts him out in January. Whichever way fix 3 goes, make the two worlds agree. | Dev-phase demo data | NEW, low |
| M10 | `oilev.ts` documents an "off day" as earning; the event library says only PH does. | Doc drift | NEW, low |
| M11 | Undo/Redo and the plans selector inside the mode change the day under the pucks; close the mode on either (the week-step rule already does this). | Fix 5 / yesterday's fix 7 | NEW |

---

## 11. Explicit negatives — checked, and nothing found

- **No decision is ever keyed by the row's `who`, by position, or by anything but `person|item`.**
  Three writers, two readers, all read. There is no path by which one man's decision applies to
  another.
- **The frozen block never aliases the live day.** `daySnap` attaches `oilev` to the JSON copy only
  (`publish.ts:246-257`); `drafts.ts` strips it on any clone back. The hand-found aliasing bug of
  21 Sep is closed and stays closed.
- **`oild` and every `rid` survive a reload byte-for-byte** (probe 1: decisions key, row ids,
  answers identical before and after). The canonical exclusion list (`canonical.ts:46`) is for
  diffing only, not serialisation.
- **`acc` does NOT drift across a reload for a landed input** — `'g'` before and after (probe 1);
  `reconcileLandedAcc` restores it. F9's double-count is real but it is not the phantom.
- **Deleting a landed row on the board makes its input dormant** (`board.ts:1036` →
  `unacceptInput` → `acc='r'`), so the row-optional shape for fix 2 cannot pay a claim whose row was
  deleted.
- **The reverse sweep in `runOilPass` touches only `oil:'auto'` records and skips protected
  dates** — an award is never swept (H5 walked it; the code agrees).
- **`oilInputEligible` is the single body shared by the money and the mode** (`oilev.ts:310`,
  `oilmode.ts:388`); one change fixes both readers.
- **The Wednesday reload is clean for a structural reason** (`earns:false` keys as `''`), not by
  luck — the phantom cannot appear on a weekday whatever the roster does.
- **Per-day amendment numbering, undo across a publish, the six-hour edges, midnight spans, the
  ALL AVAIL membership rule** — walked and passing; I re-read the code paths for the first two
  and found nothing to add.

---

## 12. Ranked by what it costs a real squadron

| Rank | Item | Cost | Mark |
|---|---|---|---|
| 1 | Fix 1 + M1 + M2 + M3 — unanswered drawn as refused, reached by three ordinary corrections | a man works, is paid nothing, silently | DISAGREE (diagnosis), fix at the gate |
| 2 | Fix 2 — the R-2 helper demands a row on the wrong day | asked, answered, paid nothing; regression | DISAGREE (shape), one line |
| 3 | Fix 8 + M6 — D18 with the all-day mirror | a man works beside a paid man | KNOWN + NEW |
| 4 | Fix 6 + M7 + M8 — uncovered weekend, one function | told to publish; nothing can land | KNOWN + NEW seams |
| 5 | Fix 3 + M5 + M9 — the lost posting, the honest mark | an amendment that can move money reads as empty | DISAGREE (not a phantom) |
| 6 | Fix 4 — the advisory outside the gate, both ways out | screen contradicts money | KNOWN + placement |
| 7 | Fix 5 + M11 — shut the three that move money, close on the rest | a re-time inside the mode is M1 | KNOWN, partly DISAGREE |
| 8 | Fix 7 — one switch per formation | a proper amendment, but a confused scheduler | KNOWN, clause 2 DISAGREE |
| 9 | Fix 9 notes, M10 | wording | KNOWN |

---

## 13. Top three, one line each

1. **Fix 1 is aimed at a mechanism that does not exist.** The decision is already per man; the
   new man is never ASKED (the gate prices the new draft against the old man's answers, then the
   commit wipes them), and "unanswered" is drawn as "refused". Fix the gate, clear the old pair
   decision at the one write site, and give "not answered yet" its own words. Same hole through
   in-place re-timing and drag-reassign.
2. **Fix 2 is a one-line regression from yesterday's R-2 fix 3**, not a landing problem; changing
   how every request lands is the wrong tool and touches six other rules.
3. **Fix 3 is not a phantom.** The demo's posted-out man loses his posting on the first reload
   after the war is first saved, walks back into the family day, and the day honestly says so; the
   amendment was not empty and could have moved money. Persist the posting and word the item; do
   not suppress the mark, or every real roster change after a publish goes silent.

Do I disagree with anything in the plan? Yes — the shape of fixes 1, 2 and 3, the "never on an
empty line" clause of fix 7, the claim in fix 5 that the LATE chip moves money, and shutting the
sign-offs and Publish inside the mode.
