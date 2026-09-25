# D174 + D175 — the code read (Fable 5.1, blind, 25 Sep 26)

Read: `8fc6dba2` on `claude/request-one-row` against `main` `0a285741`, with the evidence sheet
(`2026-09-25-req-one-row.md`), the rulings (D174, D175, D98, D103, D109, D113, D114; AM1, AM6, AM11, AM20, AM23,
AM27) and `engine-rules.md` §"A request's row and its filing on a published day". One throwaway probe test was run
on this revision and deleted (five scenarios; its readings are quoted below as "probe"). While I read, the other
chat changed the working tree — a comment in `drafts.ts`, one added app test (the plan editor's Select), doc lines —
no behaviour change, so every reading below holds on `8fc6dba2` itself. D56 applied: nothing below is about data
already stored.

## 1. Findings, ranked

### F1 — MEDIUM — a since-filed request that stands on ANOTHER day's programme reads "1 pending" on every other published day it covers, and wipes their four
**OLDER mechanism** (the same count on `main`), **newly visible after D174**: ✕ now reads 0, so the moment the request
is accepted onto Tuesday, Monday jumps back to 1 for an act done on Tuesday's card, with Monday's face unchanged.
D174's own principle ("not there when published; the day reads exactly as published → 0") covers it, but the build
special-cases only 'r' (`publish.ts filingSame`: absent matches '' and 'r'); absent-vs-'g'-with-the-row-elsewhere is
still a delta ("not on the programme → on the programme"), unpaired (no row on this day), so it counts one, falls
the four (D103) and would go out in the AL as a filing line that changes nothing on that day.
- **Probe, this revision.** Monday and Tuesday published and signed. A two-day Meeting filed since (lands on Monday):
  Monday 1 (paired add) — **Tuesday 1, Tuesday's four wiped** (Tuesday has no row; its face is unchanged). ✕ on
  Monday: 0 / 0, both days' four hold (D174, correct). Accept onto Tuesday: Tuesday 1 (paired add, right) — **Monday 1
  again, "Ranger · Meeting · not on the programme → on the programme", Monday's four fall**; `dayDiscardCount(MON)`
  reads 0 beside that 1 (the confirm and the head disagree, AM23). Load Monday's ORIG (the D175 path): row left out,
  one row on Tuesday — Monday still 1.
- **Disproof:** after "✕ Monday, Accept Tuesday", Monday's head reads 0 and its four stay green.
- **Fix (one rule, three readers — the shape the build already has):** give `filingSame` the fact it lacks — whether
  this day holds the request's row — and read it in all three places:
  1. `src/engine/publish.ts` `filingSame(was,id,now,rowHere:boolean)`: `return a===now || (!has && (now==='r' ||
     (now==='g' && !rowHere)))`. A request the record never held, now "on the programme" of some OTHER day, is
     nothing on this day.
  2. `filingDelta(di,issuedFil)`: pass `rowHere = DAYS[di].ground.some(g=>g&&g.src===id)`.
  3. `filingKey(di)`: the same exclusion (so the four hold — today they fall through `fil` and `pd`).
  4. `filingRestorePlan(di,fil,dayAfter)`: pass `rowHere` against `dayAfter||DAYS[di]` — such a request is then
     skipped (today it lands in `left`/LOADLEFT: "1 request also covers another day — left as filed", which is not
     wrong but says something about a request the load did not touch).
  5. `dayPendingItemsIn` needs nothing: no entry, no line. Wording in `engine-rules.md` (the D174 paragraph): "absent
     matches '' , 'r', and 'g' whose row stands on another day".
- **Test to pin** (`reqonerow.test.tsx`, D174 block): publish MON + TUE, sign both; `request(true)`;
  `autoAcceptInput(inp,true)` → `dayShownPendCount(MON)` 1, **`dayShownPendCount(TUE)` 0, `daySigned(TUE)` true**;
  `unacceptInput(MON,inp)` → 0 / 0; `acceptInput(TUE,inp,'g')` → TUE 1, **MON 0, `daySigned(MON)` true**;
  `loadVersionToWorkingCopy(MON,dayCurVer(MON))` → MON 0, `rowsOf(inp)` `[TUE]`, `ROWSLEFT` names it.
- **What this does NOT reach, stated so it is not mistaken for a miss:** a request the record DID hold as 'g' with
  no row on that day (S13's shape — Monday's AL1 froze R='g' after the row moved; ✕ Tuesday later → Monday 1) stays
  as D114's reading says. If he wants that 0 too, it is the same rule with `has` dropped from the 'g' branch — his
  call, not mine.

### F2 — MEDIUM — a leave (any Unavailable-type input) filed since publish reads 0 pending, keeps the four, prompts no AL — while the record says it wipes them
**OLDER** (absent == '' was the comparison's rule before D174; the build's comment now states it: "Absent still
matches '' as before (a request filed since and not actioned, e.g. a leave)"). Against it stands the record:
`OUTSTANDING-ARCHIVE.md [AMEND-D45-FILING]` closed 25 Sep 26 "RULED D103 … a leave landing on a published day keeps
wiping them (as built)", and D103's row in `scheduler.md` says the same. One of the two is wrong; the probe says the
code side.
- **Probe, this revision.** Monday published, four signed. A leave (`OL`, `isUnavail`) filed for Bane on Monday:
  `dayShownPendCount(MON)` 0, `dayDelta(MON)` empty, `daySigned(MON)` true, no marker. Nothing offers an AL.
- **Consequence for him:** the Unavailable block reads LIVE inputs on every face (`html.ts dayInputs` filters INPUTS
  by date; only the validator's official pass honours the frozen filing through `world.ts fileAcc`), so View-only
  Sched shows the man under Unavailable the moment the leave is filed — the issued document changes with no pending
  mark, no re-sign, no AL (D45's principle: nothing on a published schedule changes without the scheduler
  acknowledging it). The OIL crowd axis catches it only where a placeholder stands on the day.
- **Not this branch's to decide — put it to him** with the two readings: (a) a since-filed Unavailable-type input IS a
  difference: in `filingDelta`/`filingKey`, a record-absent id whose input `isUnavail(type)` and reads '' counts one
  ("Ranger · OL · filed since — under Unavailable"; `pendlist.ts FIL` gains the word), `filingRestorePlan` leaves it
  (a load cannot un-file an existence) and names it; or (b) it is not (the build's reading) — then the record is
  corrected: the `[AMEND-D45-FILING]` closure line and D103's "keeps wiping them (as built)".
- **Test either way:** publish MON, sign; push `{person:'bane',date:'Jul 13',allday:true,type:'OL'}`;
  pin `dayShownPendCount(MON)` and `daySigned(MON)` to the answer.

### F3 — LOW — the pending list's line for the row that moved to Tuesday names nobody and says nowhere
**OLDER** (`pendlist.ts` unchanged; reachable on `main` by "✕ Monday, Accept Tuesday"), but under D175 it is now the
designed end-state of a load. Monday's one line reads **"Ground · MEETING · item → removed"** (probe) — the generic
row line, because the D114 pairing needs a filing entry and the filing did not change ('g' before, 'g' after). ✕ alone
reads "Ranger · Meeting · on the programme → taken off"; the same row moved reads like an unnamed row deleted. D99's
purpose is that the scheduler never has to hunt.
- **Fix:** `src/ui/pendlist.ts pendItemWords`, the `it.kind==='delete'` branch with no `inp`: read the issued row
  (`requestRow(it, issuedDays(di)[di])`); if it carries `src`, name it as `requestWords` does (whose · what) and, where
  the request's row now stands on another loaded day (`acceptedDay(inp)` ≥ 0 and ≠ di), say "on the programme →
  on Tuesday's programme"; else "on the programme → removed". The mirror `add` unit (Tuesday's "Ground · MEETING ·
  item → added") the same way: "not on this day → on the programme".
- **Test:** sixSteps → `pendListHTML(MON)` text contains "Ranger" and "Tuesday"; `pendListHTML(TUE)` contains "Ranger".

### F4 — LOW — one act, two sentences: the preview banner's "Switch to this plan" and the plans menu's switch word it differently
**OLDER.** `interactions.ts` (`data-draftgo`): "Monday switched to plan Plan A — this is now the live schedule" + the
D175 clause. `board.ts switchDraft` (the plans menu, the plan editor's Select): "Switched to "Plan A" — this is now the
live Monday" + the D175 clause + on a published day "· N differences from ORIG pending" / "· matches ORIG — nothing
pending". The banner door omits the published-day tail (AM23's count belongs in the switch message — D109 lists "the
plan-switch message" among the counts that must agree). The D175 clause itself is in both, so D175's promise holds.
- **Fix:** make the banner door call `switchDraft(di,id)` — it performs the same steps (disarm, `draftSelect`, clear
  the preview, `afterSchedMutate`, log, toast); keep the banner's own `canEditSched`/page/`protectedWeek` gate in front
  of it. One body, as the bug-check order's wording roll-call asks.
- **Test:** `reqonerow-app.test.tsx`, the "Switch to this plan" case on a PUBLISHED day → the toast matches
  `/difference[s]? from Original pending/` as the menu's does.

### F5 — LOW — on the day whose row was left out, the request's card still offers "Undo — removes the ground-programme row this created", and it removes TUESDAY's row
**OLDER** (`html.ts accCtl` reads `inp.acc` only; `unacceptInput` searches every loaded day). After B2's load the
sentence says "it is on Tuesday's programme"; Monday's Personal Inputs card lists Ranger's Meeting as accepted with
Undo. A tap there takes the row off Tuesday, marks Tuesday's removal, and Monday's scheduler sees nothing happen on
Monday.
- **Fix (a wording aid, his call):** `accCtl(di,inp)`: when `inp.acc==='g'` and no row with `src===inpId(inp)` is on
  `DAYS[di]`, read the day it is on (`acceptedDay`) and label "On Tuesday's programme" with the title "Undo removes it
  from Tuesday"; the button stays.
- **Test:** sixSteps → `accCtl(MON,inp)` contains "Tuesday".

## 2. Roll-call rows I would add (§3 of the sheet)
| # | surface | status |
|---|---|---|
| 18 | the OTHER published days a since-filed request covers — their count, their four, their list line | **MISSING** (F1) |
| 19 | a since-filed Unavailable-type input (leave, medical, OD): the count, the four, the Unavailable block on View-only | OLDER (F2) — put to him |
| 20 | the pending list's line for a request row removed while the request stands on another day | OLDER (F3) |
| 21 | the preview banner's switch sentence beside the menu's / the editor's (one act, one sentence) | OLDER (F4) |
| 22 | the Personal Inputs card on the day whose row was left out (Undo acts on the other day) | OLDER (F5) |
| 23 | the week round trip (leave the week, come back): `store.ts` strips 'g', `reconcileLandedAcc` re-derives it from Tuesday's row, `autoAcceptInput` skips a truthy acc, `unacceptedKeys` records only an explicit 'r' — one row | has it (checked) |
| 24 | undo / redo through `sched-commit.ts schedWriteRecords` (restore strips 'g', `reconcileDayFiling` per touched day) | has it (checked; the walk's B4) |
| 25 | the validator's alias gate (`validate.ts officialDiverges` → `weekctx.ts filingDivergesAt`, membership-aware) | unchanged — still forces the official pass for a since-filed-then-✕'d request; perf only, the two faces agree |

## 3. Explicit negatives — checked, nothing found
- **Every whole-day replacement site:** `DAYS[di]=` is written by `drafts.ts` (both doors, covered), `daytpl.ts
  applyDayTpl` (a template's rows carry no `src` — stripped at save; refused on a published day, D96),
  `sched-commit.ts` (undo/redo restore, row 24), `validate.ts withIssuedWeek` and `html.ts withDaySnap` (temporary
  swaps, restored in `finally`, never a live install). Unpublish (`commitUnpublish`/`unpublishDay`) retracts the
  version and replaces no content. No missing call site for D175.
- **Callers of the two doors:** `draftSelect` ← `interactions.ts` (banner) and `board.ts switchDraft` (menu, plan
  editor's Select); `loadVersionToWorkingCopy` ← the banner's Load only. `ROWSLEFT` is reset at the top of both and
  read only after each; `dayDiscardCount` and the "already at" check call the pure `rowsLeftOut` and cannot disturb it.
- **`rowsLeftOut` scans the right thing:** ground rows by `src` on every loaded day but this one; the live day is
  excluded by index so the pre-replacement live day never counts as "another day"; a request that is on two other days
  already (an existing orphan) is named with both days. A request's row lives only on `d.ground` (`acceptInput`;
  'u' creates no row). `leaveRowsOut` mutates a clone; `gman` is a boolean ("model order stands"), not an index list,
  so removing a row cannot misplace the manual order — `rebaseDayPending`'s `movIf('ground', …)` compares survivors.
- **The three D174 readers agree:** `filingDelta`, `filingRestorePlan`, `filingKey` all read `filingSame`;
  `pendingKey` reads `dayDelta`; the day head, the board strip, the ⓘ panel, the Amendments panel, the pending list,
  the marker, the four and the stored AL (`alIssue` → `dayDelta`) share that one body. `issuedFilOf` reads the CURRENT
  version, which is the base the binding names (`currentBind.base`), so a publish or an unpublish re-keys both together.
- **The load's put-back and the leave-out cannot double-name:** a version whose row is left out froze that request
  'g'; the live acc is 'g' (row on the other day); `filingSame` returns early → no LOADLEFT / LOADMOVED clause beside
  the D175 clause (probe: LOADLEFT [], LOADMOVED [] after the six-steps load).
- **"Discard N edits" measures the CURRENT version, whichever version is loaded** (`dayDiscardCount` line 475 —
  P2-R2-06, by design), and `rowsLeftOut` there reads that same version, so the confirm's number and the leave-out
  agree with each other; probe: 0 for the six steps, 1 for a real note.
- **Load of an OLDER version that never knew the request** (probe P4): Meeting filed since ORIG, accepted, AL1
  published (record 'g' + row), ✕ (1 pending, paired), load ORIG → the request stays 'r', no row, Monday 1 against AL1
  — "Ranger · Meeting · on the programme → taken off". Right on every count.
- **G1's disposition, accepted — with its 'u' half stated:** a since-filed Other request the scheduler filed "→ Unavail"
  (1 pending, four fall) is turned back into a FRESH, flagging request by a load of a version that never knew it
  (probe P3: acc undefined, 0 pending, four hold). The confirm counts it ("Discard 1 edit"), so it is not silent; the
  flags differ from the version's face, the count does not. The sheet's reason (only a deliberate ✕ silences) is the
  builder's call; I would state the 'u' consequence in the report to him.
- **G2, G3, G4, S9, S11, S13, S15:** dispositions stand as filed.
- **Day template, duplicated wave, `stripRowIds`:** no `src` survives a copy; not a second-row path.
- **The plan switch and a request filed 'u' since** (not this change's, noted): Plan A holds R's row; R is now 'u'
  (filed under Unavailable on Plan B); switching to A installs the row and `reconcileDayFiling` leaves 'u' untouched —
  a row on the programme beside a filing under Unavailable, on the switch door only (the load's `filingRestorePlan`
  resolves it to 'g'). Older, outside D175's "second day"; one line so a later walker knows it is known.
- **Roles:** every door is behind `canEditSched` (`switchDraft` also `HOOKS.editMode()`); a member's filing goes
  through the same `autoAcceptInput(inp,true)`; nothing here opens a write to a member.
- **The wording of `rowsLeftSaid`:** whose · what from the request, from the row when the request is gone (D114-2's
  fallback); full day names ("Tuesday"), where LOADMOVED uses three letters ("Tue") — two spellings in one sentence
  only in the contrived case where both clauses appear; cosmetic.
- **Perf:** `rowsLeftOut` runs per paint of a preview banner (`dayDiscardCount`) and clones the version's day only when
  a row is left out; negligible. `filingKey` adds one `daySnapOf` per `currentBind`, memoised per read pass.

**Rulings:** none this session (a read only).
