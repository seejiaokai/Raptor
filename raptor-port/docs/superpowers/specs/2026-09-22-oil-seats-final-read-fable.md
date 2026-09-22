# [OIL-SEATS-CAN-EARN] — the final code read, Fable 5.1

Read 22 Sep 26, blind to the other provider's report. Brief:
`docs/superpowers/briefs/2026-09-22-oil-seats-final-read-brief.md`.

**What was read, and against what.** Branch `claude/oil-seats-can-earn` at **0b65979d**, the commit
the brief names, against the merge-base `a2d0853a` (47 files, ~5000 lines). I read the register, all
of `DECISIONS.md` (D1–D53, not only the rows named), `OUTSTANDING.md`'s OIL entries, the evidence
sheet with §6a, and then the code: `oilev.ts`, `oil.ts`, `publish.ts` (delta, binding, both key
projections), `leavewar/sync.ts` (`availableFor`, `creditFrom`, `desiredOilCells`, `runOilPass`,
`reprojectRoster`, `wireLeaveWarSync`), `leavewar/state/store.ts` (`setPeople`, `persistNotify`,
`setPostOut`/`setPostIn`/`windowRecord`, `readPostOuts`, `lwStore.write/restore`, the undo
snapshot), `undo/timeline.ts`'s deferred set, `validate.ts`, `slots.ts`, `avail.ts`, `drag.ts`,
`state/view.ts`, `interactions.ts`, `palette-html.ts`, `oilmode.ts`, `html.ts`, `board.ts`,
`board-html.ts`, `highlights.ts` (as committed at 0b65979d), `peek.ts`, `canonical.ts` (how a
crew array diffs), `scheduler.css`, `e2e/geometry.spec.ts`, `main.tsx`'s boot order,
`demoworld.ts`, `raptorRoster.ts`, and every new test's `describe`/`it` names.

**The tree moved while I read it — provenance matters for two findings.** Head is now `0901ef08`.
After 0b65979d landed: `b05d6f52` (the D49 mark reaches the next-week peek), `88168163` (docs),
`e28b7234` ("the warning lights the box it names" — **not read**, because it may be a reaction to
the other read), and `0901ef08` ("a man's official JOINING date was thrown away on every reload" —
which closes my finding 2; I saw its effect because a reproduction I had written to prove the defect
passed the other way, and only then did I look). Files I read from the working tree were, at the
time of reading, identical to 0b65979d except where this note says otherwise. An untracked
`src/leavewar/zzprobe-keep.test.ts` exists in the tree; not mine, not read.

**Two of my reproductions ran** — a throwaway vitest file in the scratchpad, outside the repo,
importing the engine by absolute path. Finding 1 and finding 4 reproduced red-for-the-defect at
head; finding 2 reproduced as already fixed at head (it was open at 0b65979d).

---

## 0. Summary

| Severity | Count | What |
|---|---|---|
| HIGH | 0 | — |
| MEDIUM | 2 | F1 the nought-minute **SC shift** — earns nothing, offers no switch, is named nowhere, and the new advisory says "the day still earns" · F2 a post-**in** date lost on reload (open at 0b65979d, **fixed at 0901ef08**; verify the pin) |
| LOW | 5 | F3 a saved-plan preview's chip says "when this day was issued" while its tap says "as things stand now" · F4 the second spare sim seat leaves a hole in the stored crew array · F5 an already-issued weekend with a desk/sim/extras placeholder reads "1 pending" the moment this ships — right, but promised otherwise · F6 the boot-time capture, if it ever fires after boot, files itself as a user edit; and a latent interaction with the deferred undo of posting records · F8 a placeholder that arrives in a cockpit by copy sits there with no refusal, no warning and no chip (pre-existing, D47 acknowledges it) |
| INFO | 1 | F7 the posting-window fix cannot repair a browser whose record already lacks the window — every existing device |

**The most important one, in two sentences.** A weekend SC MAIN shift typed 08:00–08:00 (the exact
slip D49 was about, on the wave the squadron actually works at weekends) measures nothing and earns
nobody anything — which is D31-correct — but the new advisory on that line says *"the day still
earns from the report and debrief"*, the "No OIL earned" list does not name it, and the row's own
switch reads "nothing on this row can earn": three surfaces, two contradicting answers about a man's
leave, and no prompt to fix the typo before the day goes out. The money is withheld silently and the
screen says the opposite; the fix is a wording split on `isStandalone` plus one line in `dayOilBlind`.

---

## 1. The enumeration — what must exist, and where the sign and the gesture live

Built from the promise (every seat can earn; the default decides; ALL / ALL AVAIL behave like named
people; who is behind a puck is frozen at publication; a difference is the pending mark, never a
lost signature) and the rulings D24–D50.

### 1.1 Qualifying objects (a place a placeholder can sit, or a seat that earns)

| Object | Placeholder may land | Earns by default | Sign it should wear | Gesture that should work |
|---|---|---|---|---|
| Flying cockpit P/W, Standard wave | **refused** (D33/D47) | yes | green edge on the man (O-1) | palette / drag / arm refuse with the reason |
| Cockpit on SC MAIN | refused | yes | green edge | same |
| Cockpit on SC SPARE | refused | **off** (D24) | switch on the line reads off-by-default, quiet | admin switches the line on, or credits one man |
| Cockpit on AVALON / BB | refused | off | same | same; overnight line pays its own day (D42) |
| Duty desk own position + extras (plain / SC template) | yes | yes | count chip on every day; green edge | chip taps to the list; mode opens the crowd |
| Duty desk on an AVALON block, incl. template-minted (`sa`, D35) | yes | off | chip reads "None of these N earn"; switch quiet | switch on → crowd earns |
| Sim AMT box passengers + extras | yes | yes | chip; a spare seat always shown (D50) | drop / tap-arm on the spare |
| Sim OFT p / w + extras | yes | yes | same | same |
| Sim `who` (free text) | n/a — text | n/a | — | — |
| Ground row `who` + extras | yes | yes | chip | mode opens the crowd |
| Ground row landed from a request (`src`) — name box + extras | yes (D46) | crowd yes; requester on his own answer | chip; requester's puck on his answer | mode: crowd opens, requester separate |
| Common Programme `who[]` + `more[]` | yes | yes | chip | mode opens the crowd |
| The Inputs-strip claim puck | no | member's answer | green edge on the claim | tap in the mode |
| A row with no `rid` yet | yes | gathers nobody (belt) | "not saved yet" wording (D31 words) | none until saved |

### 1.2 Renderers — every place the thing is drawn

Week: `dayHTML` → edit week, view week, **version preview** (`withDaySnap`, `PV/PVV` set),
**saved-plan preview** (same swap, `d:` id), quarantine notice; seats via `lSeat` (lists),
`slotCell` (cockpits), the Inputs strip (`inputItemKey`), all through `oilSeatDeco` — one body.
Board: `boardHTML` → desktop and phone, live and `pv-frozen` preview (SchedBoard.tsx wraps it in
`withDaySnap`, so `PV/PVV` are set there too); seats via `sbSeat`/`sbMore`/`sbSlot`; the mode via
`oilSeatHTML`/`oilItemCellHTML`/`dayBarHTML`. Next-week peek: `peek.ts` (own copy of the flying
line; **no D49 mark at 0b65979d, added in b05d6f52**). Crew palette: `specialRowHTML` (struck-out
row with the reason when a cockpit is armed). Logic page: `lgRules` rows OIL_NO_TIMES + FLT_NO_LEN.
The warning strip / list. Leave War: FO/HO cells, OIL tracker, clash strip. **No print/PDF/export
renderer exists** (grepped; nothing).

### 1.3 Doors — how a placeholder gets onto a seat

Arm + palette tap (`placeArmed` → preflight `sentinelSeatOK`); palette drag onto a seat
(`applyDrop` seat branch, both ends preflighted); drag onto a people cell (`applyDrop` fill branch,
preflighted); seat↔seat swap (both ends preflighted, refused whole); tap an empty seat then the
placeholder (arm path). **Not doors, but arrivals:** a day template, a parked plan, a stashed week,
older saved data, undo/redo — none preflighted (D47 says belted on the money side only; §F8).

### 1.4 Writers of what the money reads

`Day.oild` via `toggleOilItem` / `toggleOilPerson` / `setOilBlanket` (all inside `sched.oil`);
`daySnap` freezing `oilev` at publication (the only writer of frozen membership);
`setPostOut` / `setPostIn` / the new capture in `setPeople` (who is in the squadron → who is free);
the Inputs door (leave, medical, commitments → who is free); the Leave War PH flag (`earns`);
`ensureRowIds` (the address a decision hangs on).

### 1.5 Readers of the block

Live: `oilEvidence(di)` (uncached) / `oilEvidenceOf` (memoised only inside a read pass). Frozen:
`snap.d.oilev`. Consumers: `oilEarnedWork` → `creditFrom` → `desiredOilCells` → `runOilPass`
(forward + reverse sweep); `oilDelta` (the pending mark, membership included on every day);
`currentBind` → `oilSignKey` (signature, membership excluded) and `oilBoundOk` (old bindings
compared without the tail); `oilSentinelSummary` / `oilSentinelList` (chip + tap, one body
`oilSentOf`); `oilSeatHTML` / `oilRowPeople` / `oilEligible` (the mode); `spanDefault` /
`itemState` (the switch); `validateCore` (OIL_NO_TIMES, FLT_NO_LEN, OIL_STALE_DAY).

### 1.6 Downstream consumers

Leave War FO/HO cells and balances (auto credits only; hand awards never swept); the clash strip;
manning counts (`inSquadron`); the crew picker's busy windows (shares `personBusy` with
`availableFor`).

### 1.7 Roles

Admin: the mode, the switches, post-out/in, publishing, signing. Member: reads the schedule, taps
the chip on the week (document-level `routeClick`, no gate). Board taps are gated
`canEditSched() && editMode()` (`boardArmClick`), but the event bubbles to `routeClick`, so the
chip still answers on a read-only board. View-as mirrors into the war's viewer.

### 1.8 Overlays

Version preview (week + board), saved-plan preview, quarantine (preserved / unsupported week →
every credit-bearing date protected), OIL mode (board only, `OILDAY`), read-only board, the
next-week peek (inert).

### 1.9 Orders of action that matter (the ones the walk did and did not take)

Walked (§4 of the sheet): publish → sign → file leave → chip on both copies → item switch off.
Not walked, reasoned here: publish → remove the puck → republish (reverse sweep); switch an exempt
desk ON → publish → a crowd man files leave → republish; enter the mode → deny a crowd man → leave
→ publish → credit pass; place on a request row → the request changes hands; week swap with a
request anchored elsewhere; first-boot publish → reload (the Torch case, now fixed); a saved-plan
preview; an old issued weekend after the upgrade; drop on the SECOND spare sim seat; a nought-minute
SC shift on a weekend.

---

## 2. Findings, ranked

Ranked by what could silently pay, withhold, delete, authorise, publish, freeze or corrupt.
Provenance per finding: confirmed-new / confirmed-pre-existing / unresolved.

### F1 — MEDIUM · confirmed-new · a nought-minute SC / AVALON / BB shift: nothing earned, nothing said, and the new advisory says the opposite

**Where.** `engine/validate.ts` `FLT_NO_LEN_SAYS` + the `FLT_NO_LEN` add; `engine/oil.ts`
`dayOilWork` (the `sc ? w2(st,en)` branch) and `dayOilBlind` (the `readable` test); the mark
drawn by `ui/html.ts`, `ui/board.ts`, `ui/peek.ts`; `ui/logic-html.ts`'s row.

**What happens.** D49 was ruled about an ordinary flying line: the man reported and debriefed, so
the report/debrief padding is real work. A **standalone** shift (SC MAIN, SC SPARE, AVALON, BB) has
no padding — its window IS the written window, `w2(st,en)`, which returns `null` when `st === en`.
So an SC MAIN shift typed 08:00–08:00 produces no span, calls no `reach` (no switch is offered:
`oilCapableItems` lacks it, the row reads "Nothing on this row can earn OIL"), pays nobody, and
`dayOilBlind` does not name it because `readable(f.to, f.ld)` is true. Meanwhile `fltNoLen(f)`
fires (it never asks `isStandalone`) and the advisory on the line — and the title on both marked
boxes, on the board, both weeks and the peek — says *"…one of the two is wrong; **the day still
earns from the report and debrief**"*. Reproduced in the scratchpad against head: no span, no
capable item, blind list `[]`, advisory true with that sentence; the ordinary-line control pays HO.

**Consequence.** The one class of defect the owner asked for a warning about on 20 Sep 26 (a man
at work on a weekend whose day silently earns nothing) recurs on the wave the squadron works most
weekends, and the screen actively says he earns. Published like that, the man's leave balance is
short; the amendment to fix it costs an AL.

**Why not HIGH.** The money is D31-correct (nothing to measure, nothing minted); the mode does say
"nothing measurable" if opened. The defect is the false sentence and the missing prompt.

**Disproving observation.** Saturday, SC wave, MAIN line 08:00–08:00 with a pilot: publish; the
warning list shows an Advisory saying the day still earns; the Leave War shows no HO/FO for him;
no "No OIL earned" warning names the shift.

**Fix, step by step.**
1. `engine/validate.ts`: `export const FLT_NO_LEN_SAYS=(st:any,sa?:boolean)=>` — when `sa` is
   true return `takes off and lands at the same time (${hm24(st)}) — one of the two is wrong; a
   shift with no length earns nobody any OIL until it is fixed`; otherwise the existing sentence.
   In `validateCore`'s loop pass `isStandalone(wv)` (import from `./waves`).
2. `ui/html.ts`, `ui/board.ts`, `ui/peek.ts`: pass the `sa` each already computes into
   `FLT_NO_LEN_SAYS(parseHM(f.to), sa)`.
3. `engine/oil.ts` `dayOilBlind`, waves loop: name a standalone line whose times parse but are
   equal — `if(readable(f.to,f.ld)&&!(isStandalone(wv)&&parseHM(f.to)===parseHM(f.ld)))return;`
   — so on a weekend it joins the "No OIL earned" list. An ordinary line with equal times stays
   OUT of that list (D49).
4. `ui/logic-html.ts` FLT_NO_LEN row: add one clause — on an SC/AVALON/BB shift the same slip
   earns nobody anything and is named beside the desks.
5. Tests. `engine/oilflighttimes.test.ts`: (a) SC MAIN 08:00–08:00, a pilot on it, Saturday →
   `dayOilWork` has no span for him (already true), `dayOilBlind` names the shift, the advisory
   text contains "earns nobody", `oilCapableItems` lacks the item; (b) controls: SC 08:00–14:00
   pays and is not named; an ordinary line 08:00–08:00 pays HO and is NOT named (D49 pin).
   `ui/fltnolen-mark.test.tsx`: the marked boxes on a standalone line carry the shift sentence.

### F2 — MEDIUM · confirmed-pre-existing, newly load-bearing · a post-IN date was lost on reload — OPEN at 0b65979d, FIXED at 0901ef08

**Where.** `leavewar/state/store.ts` `readPostOuts` required `typeof v.to === 'string'`
(8 Sep 26, `5ee4a25f`); `setPostIn` (20 Sep 26, `9abfe8e4`) writes a record with `from` set and
`to` null through the same `windowRecord`. Both predate the merge-base.

**What happened.** The write was correct and the reader threw it away, so after any reload the man
read as having always been here: `inSquadron` true before his arrival, so he joined every ALL /
ALL AVAIL crowd and every manning count. Newly load-bearing because this branch made the crowd pay
on duty desks, sims and every extras line (D43, step 5), and freezes it into issued days (D44) —
a man not yet in the squadron could be frozen into a published weekend's crowd and credited.

**Provenance of the fix.** My scratchpad reproduction, written to assert the loss, passed the other
way at head; the reader now carries "EITHER END MAKES A WINDOW WORTH KEEPING (22 Sep 26)" and the
commit is `0901ef08`. I did not read that commit's reasoning. **What to verify:** that
`postout-persist.test.ts` pins a post-in-only record surviving a reboot, AND that the
untrusted-storage case still drops a record with neither end set, AND that the new `setPeople`
capture of a from-only window round-trips (it captures `p.from != null` too).

### F3 — LOW · confirmed-new · on a saved-plan preview the chip and its tap disagree about which list it is

**Where.** `ui/html.ts` `oilSeatDeco`: `from = ver ? '(who was free when this day was issued)'
: '(who is free as things stand now)'` where `ver = PV && PVV != null`. `ui/oilmode.ts`
`oilSentinelList` decides the same phrase from `DAYS[di].oilev`.

**What happens.** A saved plan is previewed through the same `withDaySnap` with a `d:` id
(`html.ts:239–249`), so `PV` is true and `PVV` is `d:…`; a draft never carries `oilev`
(`drafts.ts liveDay` strips it), so the chip's hover says "who was free when this day was issued"
about a plan that was never issued, while the tap — reading `DAYS[di].oilev`, absent — says "as
things stand now". D37-step-10 ("the chip and its tap use the same words") is broken on that
overlay. Wording only; the numbers agree (both live).

**Fix.** In `oilSeatDeco` derive the phrase from the same test the tap uses:
`const issued=!!(DAYS[+di]&&(DAYS[+di] as any).oilev)`; keep `data-oilver=ver` as it is (the tap
still needs the swap). Test in `ui/oilwords.test.tsx`: preview a saved plan (`dayDrafts`, then
`withDaySnap(di,'d:'+id,…)` or `DPREV.set`), assert the chip title contains "as things stand
now" and `oilSentinelList` under the same swap says the same.

### F4 — LOW · confirmed-new · the SECOND spare sim seat leaves a hole in the stored crew array

**Where.** `ui/board-html.ts` `simSpare` opens `slot(from)` and `slot(from+1)`; a drop or tap-arm
on the second one goes to `engine/slots.ts` `setSlotVal` → `r.pax[+a[4]]=id` (or
`r.more[+m[1]]=id`), which writes past the array's length and leaves a JavaScript hole at
`from`. Reproduced: an AMT box `[a,b]`, `setSlotVal('s:0.amt.0.pax.3', c)` → length 4, index 2
not present, serialises as `null`.

**Consequence.** Cosmetic and shape-level, not money: the readers guard (`whoId(null)` → undefined,
`slotVal` → '', `canonical.ts` reads null as blank, so no amendment item is minted); the board
draws a "+" gap mid-row and the trailing-blank trim only trims the tail; the declared record shape
`pax?: string[]` (`schema.ts`) now holds a `null` in saved data, stash and snapshots. Pre-D50 the
only padded slot sat exactly at `length`, so holes could not occur.

**Fix.** `engine/slots.ts` `setSlotVal`: in the `s:` pax branch `while(r.pax.length<+a[4])
r.pax.push('')` before the write; in the XKEY branch `while(r.more.length<+m[1])r.more.push('')`.
Test in `ui/simspare.test.tsx`: fill an AMT box to two, drop on the second spare, assert
`pax.every(v=>typeof v==='string')`, `pax[2]===''`, `pax[3]` the man, and the re-rendered row
still offers the first spare as a droppable slot.

### F5 — LOW · confirmed-new · an already-issued WEEKEND with a placeholder on a desk, sim or extras line reads "1 pending" the moment this ships — correct, but the register promises silence

**Where.** `engine/publish.ts` `oilDelta`: `mem = !!(w && (w.mem || w.earns))` — an old EARNING
block is compared on membership. The old walk wrote `sent` only for ground-row and Common-Programme
primary seats; the new live walk writes entries for desks, sim seats and every extras line. So an
issued Saturday carrying the owner's Sunday-desk placeholder keys `…|` against `…|r:<desk>=…` and
`dayHasChanges` is true. Signatures survive (`oilSignKey` excludes the tail; the old 4-part binding
compares without it in `oilBoundOk`). The chip on the issued page reads `?` with "issued before
the app kept a record".

**Why it is right.** The issued block still pays nobody for that desk (`expandAll` → `ev.sent[item]
|| []`) — D48, the day keeps what it went out with — and the pending mark is the D45 acknowledgement
that republishing will now pay the crowd. **Why it is a finding.** The register row "No amendment
nobody made — a day published before the app kept this record does not light up the moment the
change ships" is only true of non-earning days, `oilmembership.test.ts` pins only the weekday case
and the "unchanged ground crowd" case, the re-walk (`rw-03`) published fresh days so it could not
see this, and the owner's own already-published desk day is exactly this shape. He will open the
app and see "1 pending" on a day nobody touched.

**Fix.** No code. Add one sentence to the register row and the handoff ("an issued WEEKEND carrying
a placeholder on a seat the old build never counted reads pending until it is republished — that is
the correction-and-republish path, D48"), and pin it on purpose: in `oilmembership.test.ts`, an
older earning block with a desk placeholder and no `sent` entry for it reads as CHANGED, with the
signatures intact.

### F6 — LOW · confirmed-new · the capture in `setPeople`, if it ever fires after boot, files itself as a user edit; and it makes the deferred undo of posting records a trap

**Where.** `leavewar/state/store.ts` `setPeople` → `if (got) persistNotify()`. At boot
(`LW_READY` false) that is a raw persist — right. After boot, `persistNotify` at idle routes to
`cmdCommit({type:'lw.edit'})`: a change-stream envelope and an undo step for a change nobody made,
labelled as a Leave War edit; inside a Raptor command's notify it becomes an `lw.sync` projection
(fine); under `HIST.lock` it coalesces (fine).

**Reachability today: none.** `projectPeople` always emits `from:null, to:null`; `personEdits`
cannot carry a window (`setPerson`'s patch is seat/band/sxo, `readPersonEdits` validates);
`reprojectRoster` carries `ex.from/to` from a person whose record was written in the same step
(`windowRecord`); `lwStore.write()` clones people and `restore()` restores both; the global undo
DEFERS `lw.postouts` (`undo/timeline.ts:292`), so an undo never leaves a person with a window and
no record. So the belt has no production trigger — which is what a belt is for.

**The latent interaction worth writing down now.** `store.ts:1058` says restoring `postOuts`
without re-laying people is "latent: no production path". When `[GLOBAL-UNDO]` phase 5 lifts the
deferral, an undo of a post-out would restore the record without the person, and the next roster
change (`reprojectRoster` → `setPeople`) would re-capture the window the admin had just undone —
silently, persisted. The capture converts CMDLF-002 from "screen stale until reload" into "undo
reversed in the record". The fix for CMDLF-002 (re-lay restored `postOuts` over the clean
projection) becomes mandatory the day the deferral is lifted.

**Fix.** (a) `setPeople`: `if (got) { if (LW_READY) lwSyncTurn(persistNotify); else
persistNotify() } else notify()` — so an after-boot capture is a projection, never an edit. Test in
`postout-persist.test.ts`: after `lwHistInit()`, `setPeople` with a window → `lwCanUndo()` stays
false and the record is persisted. (b) Add the sentence above to `undo/timeline.ts`'s deferred-set
comment and to `store.ts:1058`.

### F7 — INFO · the posting-window fix reaches fresh browsers only

The overlay that writes the demo window runs only when `hadStoredWars` is false. Every existing
device (the owner's included) already has a `postouts` record without that man, so `setPeople`
captures nothing there and he stays in the squadron. On such a device nothing LOOKS wrong — days
issued after the first reload were frozen with him in, and live agrees — but the demo's "one man
posted out mid-January" is simply not true there until the data is cleared (the filed
`[POSTOUT-LOST]` remainder, dev-phase ruling). Say so in the handoff so he is not told the walk's
27→27 will be what he sees.

### F8 — LOW · confirmed-pre-existing, acknowledged in D47 · a placeholder arriving in a cockpit by copy is plant-and-hide

A day template, a parked plan or older saved data can put ALL / ALL AVAIL into a cockpit past every
door. There it draws the jet as crewed, raises no warning (`isSpecial` keeps it out of every
validation path), shows no chip (`oilSentOf` → `none`, since the flying branch never expands), and
pays nobody (the bare `put` belt, pinned by `oilexpand.test.ts`). D47 names this and belts the money
only. The screen half is the exact failure the refusal was chosen to avoid, and it is one advisory
away. **Fix (optional, cheap):** in `validateCore`, for each aircraft seat whose `whoId` is special,
`add('adv','SENTINEL_JET',[],`${f.cs||wv.label} — ALL AVAIL ${SENTINEL_JET_BAR}`,
`${di}.${gi}.${li}.${ai}.${seat}`)` with a `WCODE` entry; test: apply a day template carrying
`allavail` in a P seat → the advisory names the line; the palette/drag/arm door tests unchanged.

---

## 3. The four attack targets, answered

### 3.1 `setPeople` capturing a posting window

- **Can it capture a window it should not?** No. The only window that ever arrives on the
  projection is the first-boot demo overlay's; the projection itself emits null ends;
  `personEdits` cannot carry ends; `reprojectRoster` carries ends only from a person whose record
  was written in the same `windowRecord` step.
- **Can it resurrect a window an admin cleared?** No. Clearing sets the person's end to null and
  deletes the record together; the next re-projection carries the null; the global undo of a
  clear does nothing to either side (`lw.postouts` is in the timeline's deferred set); the legacy
  LW undo snapshot never held `postOuts`. Pinned by "a later projection with NO window does not
  resurrect a cleared one". The ONE path that would resurrect is the lifted deferral — F6.
- **After boot, inside a command, under the reconciler's lock?** Unreachable today (above). If
  reached: at idle it would mint an `lw.edit` command (F6's fix routes it through `lwSyncTurn`);
  at phase 8 an `lw.sync` projection; under the lock a coalesced raw persist. None corrupts.
- **`reprojectRoster` / `setPostOut` / `setPostIn` / undo stream:** `reprojectRoster` is
  signature-guarded and includes `from/to` in the signature, so an unchanged roster never calls
  `setPeople`; `setPostOut`/`setPostIn` write person + record together, so `!po[id]` is never true
  for their windows; the undo stream never restores `postOuts`. Checked: `remapPersonKeys` does not
  touch `postOuts`, and the caught record is keyed by the Raptor id already, so the first-boot
  order (capture → `installDemoOil` → `remapPersonKeys`) is safe. The raw persist at boot writes
  the seed's wars before the demo re-key; both later writers persist again; `hadStoredWars` was
  captured before. `readPostOuts` at 0b65979d dropped a from-only window (F2) — the capture
  inherited that loss; fixed at 0901ef08.
- **Role:** the capture runs for whoever boots (a member's browser persists it). Per-browser today,
  harmless; in the shared-database world a posting record written by a non-admin client — note it
  for the migration.

### 3.2 `fltNoLen` / `FLT_NO_LEN_SAYS` and the mark

- **Does the mark appear exactly where the warning does?** Yes for the three surfaces at 0b65979d
  (edit week, view week, board — one predicate, `fltnolen-mark.test.tsx` pins all three and the
  "nobody on it" control). **The next-week peek was missed at 0b65979d** — its own copy of the
  flying line — and `b05d6f52` added it after the brief. Version previews (week and board) go
  through the same builders, so they carry it. No print/export renderer exists. **But the
  SENTENCE is wrong on a standalone shift — F1.**
- **`data-warnkey` and other warnings:** `anchorEl` only returns an element whose own attribute
  equals or prefixes the key; no other warning key begins with `ff:` (grepped: the only `ff:` key
  is FLT_NO_LEN's), and no `data-slot`/`data-fill` value begins with `ff:`, so no other warning can
  resolve to a marked box and no marked box can answer a seat key. Both boxes carry the same key
  `…ld`, so the tap lands on the take-off box (first in document order) — same line, cosmetic.
  `keyDay('ff:0.1.2.ld')` parses `0` correctly. The working tree's later edit to `highlights.ts`
  (`e28b7234`) was not read.

### 3.3 `simSpare`

- Slot addressing: the spare pair is addressed `pax.N`/`pax.N+1` and `xN`/`xN+1`, real
  `data-slot` targets; tap-arm and drop both reach `setSlotVal`. **The second slot creates a
  hole — F4.** `fillSlot('.pax.+')` (drop on the cell) still reuses the first blank index, so the
  cell door is unaffected.
- Trailing-blank trimming: `more` trims the tail only; a hole below the tail survives (F4).
- Amendment marks: `noteChange` on the slot key → `ridWriteKey` → the mark paints on that slot as
  for any seat.
- Published / preview: `ro` short-circuits `simSpare` (no empty seats at all), so issued pages and
  `pv-frozen` boards are byte-identical to before.
- DOM ceiling: +2 nodes per FULL sim row in edit mode only; the commit reports the perf gate green.
- Regex `/sb-slot empty/` on the cell string: a seated man's markup cannot contain it (the class
  is only emitted by the empty-slot template; callsigns are escaped text). The "a real seat already
  empty gains nothing" rule holds because `seatCell` emits `sb-slot empty` for an empty FCP/RCP.
- The third sim branch (a non-AMT row with a `pax` array) and the free-text branch keep the
  visible `.addz` strip (no `.fcprcp`), so they already had a door. The BRIEF/DEBRIEF rows draw no
  seats. The week's sim grid keeps its always-present strip — unchanged.

### 3.4 The phone rule `.allhands .ah-row .ppl .seat, .plist .pl-row .ppl .seat {flex-wrap:wrap; max-width:100%; row-gap:2px}`

A `.seat` is `display:flex` holding one fixed-width `.puck` (74px) plus, only for a placeholder,
the `.oilcount` chip. `max-width:100%` caps the seat at its column; `flex-wrap` drops the chip
under the puck when the two no longer fit. Walked every `.seat` under those two selectors: a named
man's seat holds a bare puck (exactly the column width, never wraps); the week's sim seat grid
(`.pl-row .ppl.fcprcp .seat`) holds one puck per grid cell (the chip wraps within the cell —
harmless); the cockpit `.seat.empty-slot` "+ FCP" text sits under `.form`, not `.pl-row`, so it is
untouched; the board's `.seat.oilpk` sits under `.sb-*` rows, untouched; the Inputs-strip seat is
under `.pinp`, untouched. Nothing is clipped: `max-width` limits the seat, not its contents, and
wrapping is what prevents overflow. Pinned in the real browser by the new geometry spec (both
widths).

---

## 4. Failure scenarios, ranked — setup · action · expected · the observation that would disprove correctness

Marked **[REPRO]** where I ran it, **[READ]** where the code settles it, **[WALK]** where only the
running app can.

1. **[REPRO] Weekend SC MAIN 08:00–08:00 with a pilot.** Publish. Expected (D31 + D49's spirit):
   nobody earns, and the day SAYS so. Observed: nobody earns, the "No OIL earned" list is silent,
   the advisory says the day still earns. → F1.
2. **[REPRO, fixed at head] Admin posts a man IN from 1 Mar; reload; publish a weekend before
   1 Mar with ALL AVAIL on a desk.** Expected: he is not in the crowd. At 0b65979d: his joining
   date is gone after the reload, he is in the crowd, frozen, credited. → F2 (verify the pin).
3. **[READ] Publish a weekend with a crowd; a crowd man files leave.** Expected: working copy
   drops one, "1 pending", all four signatures stand, issued page still lists him. Code: the
   publication key carries the tail, the signature key does not (`oilKeyNoMem` is the LAST field
   cut; the tail is always last); `oilBoundOk` compares an old 4-part binding without its tail.
   Disproved as a defect; the walk saw it too.
4. **[READ] The same, then the scheduler switches the item OFF.** Expected: signatures fall (a
   change of mind). Code: `oilDecisionsKey` is inside the sign key. Holds.
5. **[READ] Old EARNING issued Saturday with a placeholder on a duty desk; upgrade; open the app.**
   Expected per the register: quiet. Code: "1 pending", signatures intact, chip `?`. → F5 (right
   behaviour, wrong promise).
6. **[READ] Old NON-earning issued Tuesday with a placeholder; upgrade.** Expected: quiet. Code:
   `mem` false → compared without the tail → quiet. Pinned. Holds.
7. **[READ] Switch an AVALON desk ON (mark 1), publish; a crowd man files leave; republish.**
   Expected: issued v1 pays the crowd as it went out; v2's block drops him; the reverse sweep
   clears his auto credit (he was not there). Code: `earnsFrom` → `itemMark===1` → true for every
   crowd man (they inherit, D43); `desiredOilCells` reads only the latest issued block; the sweep
   removes `oil:'auto'` cells no longer desired. Holds. Hand awards untouched (D46's note).
8. **[READ] In the mode, deny one crowd man on a desk; leave the mode; publish.** Expected: he is
   paid nothing, the rest are. Code: `toggleOilPerson` writes `deny` against the effective default;
   the frozen block carries `d.people`; `earnsFrom` asks the man's decision FIRST, so a later
   item-`1` cannot re-pay him. Pinned (`oilswitch`, `oilclaimcrowd`). Holds.
9. **[READ] Placeholder on an accepted request row; the requester answered No.** Expected: the crowd
   earns, he does not, nobody twice. Code: `landedExtras` drops the owner; the input half pays him
   on his own answer; a decision keyed to a crowd man survives `pruneHandedOverDecisions` because
   the row stands a sentinel (masked in the COPY only — the stored `oild` is untouched, so taking
   the puck off and putting it back brings a refusal back, not a payment). Holds.
10. **[READ] Placeholder on a request row that covers three days.** The row lands on the FIRST day
    only (`acceptInput`), so the crowd exists on that day alone; the requester is paid every covered
    day. Consistent with "the crowd is on the row"; not a defect, but worth one line in the
    register so nobody re-finds it.
11. **[READ] Preview a saved plan; tap the chip.** → F3 (wording).
12. **[READ] Drop on the second spare seat of a full AMT box; publish; reload.** → F4 (a `null`
    in `pax`; no amendment item; a "+" gap drawn mid-row).
13. **[READ] Copy a day template captured on `main` with ALL AVAIL in a cockpit.** → F8 (no
    refusal, no warning, no chip, nobody paid).
14. **[READ] First-ever boot → publish a weekend with a crowd → reload.** Expected: 27 → 27, no
    pending. Code: the overlay's window is captured and persisted at boot (raw branch); the reload
    lays it back on. Pinned five ways in `postout-persist.test.ts`. Holds. **Existing devices:**
    F7.
15. **[READ] Undo a post-out, then tick a qual on the Quals page.** Expected: the post-out stays
    undone. Code today: the undo does nothing to the record (deferred), so the man stays posted
    out — the pre-existing CMDLF-002 gap, unchanged by this branch; the capture cannot fire because
    the record is still there. When the deferral is lifted → F6's trap.
16. **[READ] Week swap with a request anchored in another week covering this Saturday.** `acc`
    reads `''` at publication and after every swap alike (cleared on swap, re-landed only for the
    loaded week), so the `acc` field inside the key is stable per loaded week — no phantom pending.
    Holds.
17. **[READ] A member on the view week taps the chip.** `routeClick` (document-level, no gate)
    answers. On a read-only board `boardArmClick` returns early without stopping propagation, so
    the document router still answers. Holds by reading; **[WALK]** not walked.
18. **[WALK] Two overlapping ALL AVAIL rows at the same time.** A sentinel never blocks another
    sentinel (`personBusy` matches by id), so both crowds hold the same men; the envelope pools per
    man, so nobody is paid twice — but both chips read the same big number. Correct per the build's
    own rule (raise if reopened); not walked.
19. **[WALK] Phone: the crowd opened behind a placeholder in a sim row.** ~600px tall, the owner's
    open question; `[ALL-AVAIL-WINDOW]` replaces the surface. Out of scope by the brief.

---

## 5. Explicit negatives — checked, and found nothing

- **`oilSentOf` is the one body** behind the chip, the tap, the mode's opened pucks and the
  request-row crowd; `oilSentinelPeople`'s live fallback is gone; an old block reads `unrecorded`
  and invents nothing. Chip `?` and the tap's sentence agree.
- **The two projections of one block** are structurally sound: the membership tail is always the
  LAST field of `oilEvidenceKey`, so `oilKeyNoMem` cuts exactly it. I checked the fragile case —
  `oilBoundOk` applies `oilKeyNoMem` to a NEW 3-part binding too, which strips the inputs field
  instead of a tail — and it cannot produce a false "still valid": the stripped string has a
  different pipe count from any live sign key (decision keys carry `person|item` pairs, input
  entries carry six colons), so equality is impossible except when nothing changed. Worth a comment,
  not a fix.
- **The frozen block cannot alias the live day** (`clone` of `oild`, `daySnap` copies the day).
- **`creditFrom` / `desiredOilCells` / `runOilPass`** are unchanged on the branch and read only
  `snap.d.oilev`; the reverse sweep touches only `oil:'auto'`; protected dates are never desired
  or swept; `creditable` rejects only sentinels (archived and hidden men keep their money).
- **`availableFor`** reads live PEOPLE, INPUTS, the LW posting window and the day blob it is
  handed, so a snapshot resolves against the day it was issued with; excludes ground crew, archived
  bodies, SANS not engaged, away/committed men, and anyone named on an overlapping event; D36's
  narrow window is respected (`inpWin`, `personBusy`). D52 confirmed the ground-crew exclusion.
- **The flying branch never expands** (bare `put`, pinned), so a copied placeholder in a cockpit
  pays nobody (F8 is the screen half only).
- **`putAny` gathers nobody for an id-less row** (belt, pinned); `daySnap` runs `ensureRowIds`
  first, so an issued day never freezes an unaddressed crowd.
- **One window per item:** every seat on a row (`id`+`more`, `p`+`w`+`pax`+`more`,
  `who`+`more`, `who[]`+`more`) shares the row's window, so the last `sent[item]` write cannot
  differ from the first.
- **The read pass** memoises only inside the two HTML builders, keyed on the day OBJECT as well as
  the index, so a version preview's swapped snapshot misses rather than serving the live answer;
  validation, signing and publication stay uncached (OSE-T-01). `currentBind` calls `oilEvidence`
  directly — correct for safety; it does mean the signature check inside a repaint recomputes the
  block (with `availableFor` per placeholder) per day — a cost, not a defect; measure before
  touching.
- **`sched.oil`** wraps every decision write; guards run outside the command so a refused tap mints
  nothing; undo names it "an OIL decision"; the Undo boundary closes the mode rather than reaching
  past it.
- **The refusal (D33/D47)** is preflighted at every door with ONE string (`SENTINEL_JET_BAR`),
  judged by key grammar so a stale flying key is still refused; a swap is refused whole; the belt
  in `setSlotVal`/`fillSlot` sits above `noteChange` so a refused write leaves no pending mark. A
  named man is refused nowhere; an accepted request row takes the puck (D46, no carve-outs).
- **The switch's five states, five sentences, three paints** (`on` / `dflt` / `off` / `mixed`),
  the empty-exempt-row case (`oilItemDefaults`), and the `1` mark's algebra (`earnsFrom` asks the
  man first) — consistent between `oilev.ts` and `oilmode.ts`; pinned.
- **Overnight lines (D42):** `w2(st, en+1440)` on the day the line sits on; the next day's walk
  never sees it.
- **The count on every day (D27/D37):** `oilEvidence` records `sent` before the non-earning bail;
  the money halves stay empty on such a day, so every reader of what a day pays is byte-identical.
- **Board preview** and **week preview** both run through `withDaySnap`, so the chip's
  `data-oilver` is stamped on both; the tap re-enters the swap and lists the issued men.
- **`interactions.ts` ↔ `html.ts`** import cycle: the build passed; no runtime use before load.
- **The CSS diff before the last commit** is one rule (`.oilitem.dflt`); the last commit's rules
  (`.badtm`, the phone wrap, the corrected `.fcprcp .addz` comment) touch nothing else.
- **`describe.ts` / `SCHED_TYPES.oil` / `logic-html.ts`**: additive; no other type renamed.
- **No print, PDF or export renderer** exists to miss.

## 6. Limits of this read

Reading only, plus two scratchpad reproductions; no browser was driven (another process holds the
bundle). Scenarios 17–19 are unwalked. I did not read `e28b7234` or the untracked probe test, by
choice. `sync.ts` is unchanged on the branch and was read for how the new evidence reaches it, not
line by line. Performance was reasoned, not measured.

---

# FOLLOW-UP READ — the five commits after 0b65979d (Fable 5.1, 22 Sep 26, evening)

Read at HEAD **ca57f306**, blind to the other provider's follow-up. Scope, as briefed: `b05d6f52`,
`e28b7234`, `0901ef08`, `0ef1df31`, `ca57f306` (`src` and `e2e` only), plus the surrounding code
each attack question turns on: `ui/peek.ts` whole, `ui/highlights.ts` whole (this time), the
`anchorEl` / `warnTarget` / `scrollToWarnFocus` chain, `state/view.ts`'s focus lifecycle, the seat
and warning key grammar (`events.ts`, `html.ts`, `board.ts`, `keys.ts`), `leavewar/state/store.ts`
(`persistNotify`, `lwSyncTurn`, `locked`, `recordHistory`, `lwHistInit`, `setPostOut`, `setPostIn`,
`windowRecord`, `setPeople`, `readPostOuts`, `initStore`), `leavewar/sync.ts` (`availableFor`,
`reprojectRoster`, `runPoArchive`, `restoreArchivedPerson`, `runOilPass`, `oilBlindLine`,
`publishFlagsBids`, the two subscriber lanes), `leavewar/engine/people.ts` `inSquadron`,
`engine/availability.ts`, `ui/Matrix.tsx`'s cell classes, `engine/oil.ts` (`dayOilWork`'s window
branch, `dayOilBlind`, `blindDesks`), `engine/waves.ts`, `engine/validate.ts`'s FLT_NO_LEN and
OIL_NO_TIMES block, `ui/logic-html.ts`, `ui/lift.ts` `paintLand`, `ui/dayswap.ts`'s keep rule,
`ui/SchedBoard.tsx`'s preview wiring, `scheduler.css` around `.badtm` / `.wfoc`, `vite.config.ts`.
The docs commits (`88168163`, `2e261da0`) were read only for what `OUTSTANDING.md` now files.

**Two probes ran**, throwaway vitest files in the scratchpad with their own config (the repo's
include list shuts the scratchpad out), importing the production modules by absolute path:
(1) the change stream after an after-boot capture in `setPeople`; (2) the exact words every list
and surface says about a nought-minute SC shift, Saturday and Monday, and the peek's own title.
Their output is quoted where it is load-bearing. Nothing in the repo was edited by this read. The
working tree was clean when it began; by the time this section was appended it carried someone
else's in-progress edit to `e2e/geometry.spec.ts` and two untracked `scripts/handpass/zz-perfB-diag*.mjs`
(timestamped 22:48, during the read). Not mine, not read beyond identifying them, and nothing from
them is in what follows.

---

## 9. Summary of the follow-up

| Severity | Count | What |
|---|---|---|
| HIGH | 0 | — |
| MEDIUM | 0 | — |
| LOW | 5 | G1 the new hard warning says a shift "has no times" when its times are typed, and the publish toast calls the shift "the SC desk" · G2 the lit box is drawn on the board's frozen version preview, where the puck pass deliberately refuses to decorate — and the anchor can now resolve into a frozen version, against its own comment · G3 fix the times while the warning is focused and the whole week stays dimmed with nothing lit · G4 the F6-belt test pins an absence (`no lw.edit`) that an off-stream raw persist would also satisfy; the probe shows exactly one `lw.sync`, so pin that · G5 the shift sentence is unpinned on the fourth surface (the peek) — the exact drift `b05d6f52` was written to close |
| INFO | 6 | the peek import adds nothing to the module graph; the highlight pass gained one unconditional whole-document attribute scan (unmeasured); a from-only record outlives its man in storage, and any credit frozen for him has no row — consistent with the rule; the hard OIL_NO_TIMES warning still lights nothing when tapped (it names the line and carries no key); the Logic page's OIL_NO_TIMES row still says "a duty desk"; `locked` was needed in the committing lane too, not only at idle |

**The most important one, in two sentences.** The fix for F1 is right and complete about the money,
the switch and the advisory, but the HARD warning it newly raises on a weekend reads *"SC has no
times — nobody on it earns OIL for this day"* about a line whose two times are typed and equal, and
the publish-time toast reads *"the SC desk has no start and end times"* about a shift that is not a
desk. The advisory beside it says the true thing, so a scheduler is told the right fact and a wrong
one about the same line at the same moment; one wording change in `dayOilBlind` and one word in two
sentences make the three surfaces agree.

**None of the five commits introduces a money, permission, publish or persistence defect that I could
find.** Every attack question is answered below; where the answer is "no", the reason is written down.

---

## 10. Findings, ranked

### G1 — LOW · ca57f306 · confirmed-new (one half pre-existing) · "has no times" about a line with times, and "the SC desk" about a shift

**Where.** `engine/oil.ts` `dayOilBlind` returns bare names; `engine/validate.ts:1158` wraps them as
`${list} ${verb} no times — nobody on it earns OIL for this day`; `leavewar/sync.ts` `oilBlindLine`
wraps them again for the publish toast, and `blindDesks` decides "desk" by `!/^the /.test(name)` —
so every flying-line and shift name (`SC`, `AV`, `BB`, `RAP 1`) is a desk to it.

**What happens (probed).** Saturday, SC MAIN 08:00–08:00, a pilot on it:
- hard: `SC has no times — nobody on it earns OIL for this day`
- adv: `SC takes off and lands at the same time (08:00) — one of the two is wrong; a shift with no
  length earns nobody any OIL until it is fixed`
- Monday, same line: the hard one is silent (correct — nothing earns), the advisory speaks.
- At publish, `publishFlagsBids` toasts `Saturday … earned nobody any OIL — the SC desk has no
  start and end times` (no earners on that day), or `… the SC desk has no start and end times, so
  nobody on it earns OIL` (with earners).

**Consequence.** The scheduler reads two red/amber sentences about one line: one says the times are
wrong, the other says there are none. He looks at the line, sees `08:00` twice, and either distrusts
the hard warning or goes looking for a different, blank line. The money is right; the screen
contradicts itself. **Half of it is pre-existing:** step 8 (at 0b65979d) already put a flying line
with no readable times into this list, so a crewed `RAP 1` with blank times has read "the RAP 1 desk
has no start and end times" in the toast since then — this commit adds the second name to the same
wrong wrapper, plus a sentence ("no times") that is now false rather than merely odd.

**Fix.**
1. `dayOilBlind`: name the two flying cases with their own article so the desk wrapper cannot claim
   them and the sentence reads as a thing — `add('the ' + (f.cs||wv.label||'flying') + ' ' +
   (isStandalone(wv) ? 'shift' : 'line'))` for both the unreadable-times branch and the zero-shift
   branch. `blindDesks`'s `/^the /` test then
   already keeps them out of the "the … desk" wrapper; `blindNames(SAT).join(' ')).toContain('SC')`
   in `oilflighttimes.test.ts` still passes.
2. `validate.ts:1158` and `sync.ts` `oilBlindLine` (both sentences): `no times` → `no usable times`,
   `no start and end times` → `no usable start and end times`, so the one sentence is true of a blank
   desk, a blank line and an equal-times shift alike.
3. `ui/logic-html.ts` OIL_NO_TIMES row: one clause — the list also names a flying line with no
   readable times and a standby shift typed to the same minute (the INFO below).
4. Tests: `oilflighttimes.test.ts` — the OIL_NO_TIMES message on the zero-shift Saturday does not
   contain `has no times` and does contain `shift`; `leavewar/publish-toast` (whichever file pins
   `oilBlindLine`, or a new `it`) — the toast for the same day contains `the SC shift` and not
   `desk`.

### G2 — LOW · e28b7234 · confirmed-new · the focus lights the box on a frozen version preview, and the anchor resolves into one

**Where.** `ui/board.ts:205–210` emits `data-warnkey` whenever `fltNoLen(f)` — no `pv`/`stoRO`
test; `ui/html.ts:1502` likewise under `PV`. `ui/SchedBoard.tsx:206–208` renders a version preview
as `<div class="pv-frozen">${boardHTML(di, true)}</div>` in place of the live board, same `di`.
`highlights.ts:111–115` lights any `[data-warnkey]` equal to `WFOCUS.key`, with no `.pv-frozen`
test — where the puck loop two lines above says, in its own words, "Nor a version preview:
.pv-frozen is a published snapshot and WARN is live, so decorating it would put today's conflicts on
last week's paper." `anchorEl` (`highlights.ts:256–263`) now returns `[data-warnkey]` elements, and
its comment promises "an anchor never resolves into a frozen version — exactly the fallback we want
there", which was true only because `data-slot` is dropped under PV.

**What happens.** Tap the D49 advisory on the live board (focus set, key `ff:5.0.0.ld`), then open a
version preview of that day: if the issued line was ALSO typed equal (the usual case — the slip was
published), the frozen board's two boxes light in the focus colour, while every frozen puck is
left undecorated on purpose; `scrollToWarnFocus` scrolls to the frozen box. The same on the week's
version and saved-plan previews (there the pucks are decorated too, so it is at least consistent).
Reached by reading, not walked.

**Consequence.** Cosmetic: a live warning's "this one" glow on an issued document. Nothing is
misread as editable (the mark and its title are pure functions of the frozen line and belong
there); it only breaks the one rule the file states for previews.

**Fix.** Keep the mark and the title on previews; emit the ADDRESS only on live paper:
`board.ts` — build `badAtt` with the ` data-warnkey="${fp}.ld"` part only when `!pv`;
`html.ts` — the same part only when `!PV`. `anchorEl`'s comment then stays true. Test in
`fltnolen-mark.test.tsx`: `boardHTML(SAT, true)` and `withDaySnap(SAT, ver, () => dayHTML(SAT,
false, true))` carry `.badtm` with the title and no `[data-warnkey]`; the live pair still carry
it.

### G3 — LOW · e28b7234 · confirmed-pre-existing shape, new form · fix the times while the warning is focused and the week stays dimmed with nothing lit

**Where.** `state/view.ts`: `WFOCUS` is cleared by toggling the same row (`focusWarn`), the ✕ in the
open day box (`clearWarnFocus`), the severity pills (`openWarns`), a board day change
(`setBoardDay`), a week load / session reset (`selDrop`) — and by nothing else. `validate()`
rebuilds `WARN` and leaves `WFOCUS` alone. `highlights.ts:71–83`: with any focus set, every puck on
the week that is not in `WFOCUS.ids` gets `dim`.

**What happens.** Tap the advisory → boxes lit, every puck on the week dimmed (there is nobody to
light — that is the design). Type the landing time to `10:30` → `validate()` → the advisory is gone,
the boxes re-render with no mark and no key → nothing is lit → `WFOCUS` still set → every puck on
the week is still dimmed, and stays so until the ✕ or a day/week change. For a PUCK-anchored warning
the same stale focus keeps the man lit (`ids` were captured at the tap), so "everything dim, nothing
lit" is specific to a box-anchored warning — the state the walk complained about, now after the fix
instead of before it.

**Fix.** One rule, view-side, after any validate: a focus whose warning no longer exists is
dropped. In `refreshHighlights` before `warnFocusMap()` (or in `validate()`'s single caller):
`if(WFOCUS&&!((displayedByDay(WFOCUS.di)||{}).warns||[]).some((w:any)=>w.code===WFOCUS.code&&w.key===WFOCUS.key&&sameWho(w)))clearWarnFocus()`
— match on `code`+`key` (+`who`) rather than `ix`, because `WARN` re-indexes. Test in
`fltnolen-mark.test.tsx`: focus the D49 row, fix the time, `validate()`, `refreshHighlights()` →
no `.dim` on any `.puck` and `WFOCUS` null. Check the toggle and the cross-day crew-rest row
(`panDi`/`panKey`) still behave.

### G4 — LOW · ca57f306 · confirmed-new · the F6-belt test pins an absence that an off-stream raw persist would also satisfy

**Where.** `leavewar/postout-persist.test.ts` "an after-boot capture is a projection, never a user
edit": `expect(made.filter(t => t === 'lw.edit')).toEqual([])`.

**What the probe shows.** After `lwHistInit()` and the capture, `commandStream().slice(before)` is
exactly `[{type:'lw.sync', …}]`, synchronously (the trailing projection `lwSyncTurn` emits under
`locked`), `lwCanUndo()` is false, the backend holds the window. So the observable the test's own
comment names — the envelope TYPE — is available and positive.

**Why it matters.** The assertion as written also passes when `made` is `[]`: a future change that
took the `!LW_READY`/`LW_RESTORING` raw branch, or that never armed `LW_TURN_WROTE`, would persist
the window OFF the change stream — invisible to the shared-database sync that the stream exists to
feed — and the belt's test would stay green. The commit message says the test "was rewritten on the
change stream's envelope TYPE, where it failed"; it failed on the presence of `lw.edit`, which is the
bug that happened, not on the absence of `lw.sync`, which is the bug that could happen next.

**Fix.** `expect(made).toEqual(['lw.sync'])` (the probe says one and only one). Keep the persisted
`to` assertion.

### G5 — LOW · ca57f306 (and b05d6f52) · confirmed-new · the shift sentence is unpinned on the peek

**Where.** `fltnolen-mark.test.tsx` "every surface: the shift sentence, never the sortie one" loops
`[dayHTML(SAT,true), dayHTML(SAT,false), boardHTML(SAT)]`; `peek.test.tsx`'s D49 block builds an
ordinary wave only. `ca57f306`'s message says "all three renderers pass the same fact"; `b05d6f52`'s
says the peek is the fourth.

**What the probe shows.** `peekDayHTML` on a `makeStandalone('sc')` line typed `08:00–08:00` carries
the shift sentence on both boxes today — correct, and pinned nowhere. This is precisely the drift
`b05d6f52` was written to close (a change lands on the three surfaces that share `html.ts`'s
predicate and the peek, with its own copy, is forgotten) — it recurred in the next test written.

**Fix.** Add `peekDayHTML(DAYS[SAT], 0, false)` to that loop (the peek takes the day blob, and
`scLine` has already built it), and the same line to the control.

---

## 11. INFO — worth writing down, not worth acting on

- **b05d6f52, the module graph.** `peek.ts` already imported `./html`, and `html.ts:12` already
  imports `../engine/validate`, so `validate.ts` and everything under it (`publish`, `oil`, `oilev`,
  `data`, `waves`) was in the peek's graph before this commit. No file under `src/engine` imports
  from `ui` (grepped), so no cycle. The peek's contract ("never touches DAYS, SCHED or WARN") holds:
  `fltNoLen` reads the formation and live `PEOPLE` (`realP`/`isSpecial`), which the peek's pucks
  already read. No formation shape the peek can produce (seed or stash, `to`/`ld` blank, `aircraft`
  absent, `cx` set) reaches a branch the live surfaces do not; a BB shift's seeded `''–''` parses to
  null and is not marked. The `title` sits under a `pointer-events:none` overlay, so it shows; the
  `.badtm` edge is pure CSS and reads dimmed with the column. **One pre-existing note:** the peek is
  cached per week × next-week stash generation, and the mark (like the pucks) depends on `PEOPLE` —
  archive the only man on next week's nought-minute line and the cached mark stays until the week
  changes. Same as the pucks; not new.
- **e28b7234, the hot path.** `document.querySelectorAll('[data-warnkey]')` is a whole-document
  attribute scan run on EVERY highlight pass — every EditWeek / ViewWeek / SchedBoard effect, i.e.
  every keystroke on the board — whether or not a focus is set, because it must also CLEAR classes
  when the focus goes. The commit says it "costs nothing"; the same file's own measurement note
  (6 Sep 26) is that a seven-selector page-wide query cost 12 ms more than the puck loop at 4× CPU.
  A single `[attr]` selector is far cheaper than that (no per-class work, one attribute check per
  element; my estimate ≤2 ms at 4× against the loop's 11 ms), but it is the shape that note warns
  about, and it is unmeasured. If it ever shows: keep a `let BOXLIT=false` and skip the query when
  `!WFOCUS && !BOXLIT`. Not a finding; a measurement the walk could take in one run.
- **e28b7234, the other passes.** `paintArm` touches `[data-slot]/[data-fill]/[data-inpseat]`,
  `paintSelRings` `[data-slot]/[data-fill]`, `paintFreshAdds` the ROW containers reached from
  `[data-bfld]` (the board's time inputs carry `data-bfld`, so the row around a lit input can wear
  `sb-fresh` at the same time — two elements, no class collision), `paintLand` a marked selector —
  none of them adds or removes a class on the time boxes. `dayswap`'s keep rule compares CANONICAL
  markup, never the decorated live node, so a hung `wfoc` cannot force a block swap. CSS: `.wfoc`
  and `.advf` appear only as `.puck.wfoc*` and `.badtm.wfoc*`; no bare rule, no JS reads `.wfoc`.
  **Prefix match:** seat `data-slot` keys are `${di}.${gi}.${li}.${ai}.p` on both surfaces (no
  prefix), fly-event `slot`s the same, sim/duty/ground keys `s:`/`d:`/`g:`; the only `ff:`-prefixed
  key any warning carries is FLT_NO_LEN's own, so `anchorEl`'s `key+'.'` prefix test cannot make a
  time box answer another warning or a seat answer this one — my earlier §3.2 claim stands, now
  checked against the grammar rather than a grep for the literal.
- **0901ef08 / 0ef1df31, the record's other readers.** `postOuts` is read by `setPeople` only (and
  decomposed into the `lw.postouts/all` record; restored by the deferred `lw.postouts` case). `sync.ts`
  `reprojectRoster`'s in-session keep rule already tested `p.to !== null`, so the two keep rules now
  agree (they did not at 0b65979d, within a session). `inSquadron` is written for one-ended windows
  (`if (p.from && date < p.from)`, `if (p.to && date > p.to)`); `availableFor`, `availabilityOf`,
  `haveOf`, `countsFor` all go through it; the matrix distinguishes `notYetArrived` from a genuine
  PO. `runPoArchive` needs `p.to !== null && p.poArchive === true`, so a from-only man is never
  auto-archived. `restoreArchivedPerson` calls `setPostOut(id, null)` and ignores its `false` (the
  man is not on the roster), flips the flag, notifies → `reprojectRoster` → `setPeople` lays the
  surviving from-only record back → his joining date returns with him. **Two states worth knowing:**
  (a) a from-only man archived by ✕ leaves the roster (by rule) but his record stays in `postouts`
  for good — nothing deletes a record for a person who is not on the roster; harmless, and it is
  what makes his date come back on Restore; (b) an auto credit frozen for him on an issued weekend
  before he was archived is still desired by `desiredOilCells`, and `ingestDutyCredit`'s door tests
  the war, not the roster, so a cell can exist with no row to show it — the same as for any man
  archived with no window at all since D44; consistent with "✕ means should never have been here",
  and not this commit's doing. **Should anyone be kept on a joining date alone?** No: the keep rule
  exists so the months BEFORE a man left still show him; a man with no leaving date has not left,
  so the only way he is off the projection is the ✕, and the ✕ is the rule's stated other case.
- **ca57f306, the hard warning's tap.** OIL_NO_TIMES is added with `who: []` and no key, so tapping
  it on the zero-shift day lights nothing and scrolls to the day — the exact complaint the walk made
  about D49's advisory before e28b7234. The blank-desk case has always been like this. The advisory
  beside it does light the boxes. If it is ever worth fixing, `dayOilBlind` would have to return the
  key with the name.
- **ca57f306, `isStandalone` is the right test.** `dayOilWork` decides "no padding" by
  `const sc=isStandalone(wv)` (`oil.ts:213`) and `sc ? w2(st,en) : padded`; `zeroShift`,
  `validateCore`'s sentence choice and all four renderers use the same predicate, so the screen and
  the money read the same fact. `saExemptKind` is the other axis (earns-by-default, AVALON/BB `all`)
  and would wrongly leave SC on the sortie sentence; `w.kind` alone would be a second rulebook beside
  the flag the mint sets.
- **ca57f306, `locked(persistNotify)` in every lane.** At idle: `lwSyncTurn` arms
  `LW_PROJ_PENDING`, `locked` puts `persistNotify` on the `HIST.lock` branch, the write is coalesced
  (`rawPersist`, `LW_TURN_WROTE=true`, inline `rawNotify`), and the turn's `finally` files one
  `lw.sync` under the lock — probed. Inside a committing Raptor command: `lwSyncTurn` runs `fn`
  straight through; `persistNotify` takes the same `cmdIsCommitting()` branch it took before (child
  JOIN in the reducer, else the phase-8 projection or the coalesced raw write). Nested inside an
  outer `lwSyncTurn` (the subscriber lanes wrap `runPoArchive`/`runOilPass`): the inner call sets the
  OUTER turn's `LW_TURN_WROTE`. `locked` is re-entrancy safe (saves and restores). **One thing the
  commit does not say:** `rawPersist` calls `recordHistory()` (`store.ts:950`), which pushes a legacy
  Leave War undo step unless `HIST.lock` — so at 0b65979d an after-boot capture in the committing
  lane (phase 8, not in the reducer) would ALSO have pushed a legacy undo step for a change nobody
  made; the `locked` wrapper closes that as well, in every branch that reaches `rawPersist`. The belt
  is tighter than its comment claims.
- **ca57f306, weekday silence.** `dayOilBlind` is consulted by `validate` only under `earnsOil`
  (weekend or `HOOKS.oilEarningDay`) and by `oilBlindLine` at publish for the same days, so naming
  the zero shift changes no weekday. Probed: Monday raises the advisory only.
- **The Logic page.** The OIL_NO_TIMES row still describes "a duty desk with somebody on it and no
  start and end times … names the desk"; the list has named flying lines with no readable times
  since step 8 and now names a nought-minute standby shift. The FLT_NO_LEN row says the latter; the
  row that owns the warning does not. Folded into G1's fix step 3.

---

## 12. The attack questions, answered in the brief's order

**b05d6f52.** Cycle — none; graph — unchanged (above). `fltNoLen` on a peek shape — no branch the
live surfaces never reach; `f.cx`, blank, overnight and no-crew shapes all fall out before the mark,
and the test pins each. The peek's contract — a `title` and a class are inert; no `data-warnkey`, so
neither the focus walk nor `anchorEl` can touch it, and `scrollToWarnFocus` roots on `.day[data-day]`,
which a peek column (`data-peek-day`) is not. Nothing wrong. **Unpinned** on the shift sentence — G5.

**e28b7234.** Hot path — one unconditional attribute scan per pass, unmeasured, almost certainly
small (INFO). Fights — none on the same element; `dayswap` compares canonical markup (INFO). CSS —
all `wfoc`/`advf` rules are scoped to `.puck` or `.badtm` (INFO). Stale focus — a box lights only
while a line at that position is still typed equal, so a stale focus cannot leave a box lit; what it
leaves is the dimmed week with nothing lit (G3). Not asked but found: the box lights on a frozen
version preview and the anchor resolves into one (G2).

**0901ef08.** Other readers assuming `to` — `setPeople`'s keep loop was the one, closed by 0ef1df31;
`reprojectRoster` already tested `.to`; no other reader (INFO). `inSquadron` one-ended — correct.
`availableFor`/`countsFor`/`.gone`/manning — all through `inSquadron`, all designed for the
one-ended case by the post-in build; the record now merely survives reload. The "state none
expected" is the orphan record and the row-less frozen credit (INFO), both consistent with the rule.

**0ef1df31.** Kept on a joining date alone — no, with the reason (INFO). Other readers of `postOuts`
as "who the war still draws" — none. A lost row — the matrix row goes by rule; a frozen credit can
outlive it (INFO, pre-existing shape).

**ca57f306.** `isStandalone` — right, it is the money's own predicate (INFO). OIL_NO_TIMES on a
day silent before — yes, weekends and holiday days with a crewed nought-minute standalone line,
which is F1's intended step 3; weekdays unchanged (probed); but the sentence it raises is wrong about
the line and the toast calls it a desk (G1). `locked(persistNotify)` under a committing command —
coalesces correctly in every lane, and closes a legacy-undo-step leak the comment does not mention
(INFO). The envelope-type assertion — watching the right observable, asserting the wrong side of it
(G4).

---

## 13. What was walked and what was not

Reasoned from code and two engine-level probes; no browser was opened (the brief forbids a server).
So G2 and G3 are reachable-by-reading, not seen; G1, G4 and G5 are probe-confirmed. The walk that
would settle G2 and G3 in one sitting: tap the D49 advisory on the board, open a version preview of
that day, look; then back on the live day type a real landing time and look at the pucks.
