# The Inputs batch — a fresh read of the NINE FIXES (Opus, blind) — 13 Oct 26

**What was read:** `git show 22ca4385d -- raptor-port/src` (the fix commit) and the surroundings each fix leans on —
`ui/interactions.ts` (the `[data-acc]` handler), `ui/inputedit.tsx` (`saveBatchX`, `dryRun`, `oilFirst`, `oilGate`,
`commitInputEdit`, `inputWho`, `normalizeInputDraft`), `state/store.ts` (`runInputWrite`, `batchResult`, `tryInputsBatch`),
`state/sched-commit.ts` (`commitInputsWith`, `applyEnd`, `afterCommandPass`, `touchedDays`), `command/commit.ts` (the join of
a nested command, the rollback), `engine/drafts.ts reconcileIssuedMarks`, `engine/slots.ts acceptInput / unacceptInput`,
`engine/publish.ts markEdit / markStructuralAdd`, `engine/editlog.ts logAction`, `state/changelines.ts inputLines`,
`ui/histbubble.ts`, `ui/changesmodel.ts`, `ui/pendlist.ts`, `ui/oilwait.ts`, `ui/OilWaitSheet.tsx`, `ui/toast.ts`,
`ui/reqdoor.ts`, `ui/caldrag.ts`, `ui/drag.ts`, `state/holderbase.ts`, `state/history.ts`, `state/view.ts`.
Nothing under `docs/handpass/` was opened. Read-only; no file changed but this one.

**What was run:** `npx vitest run src/ui/oilwait.test.tsx` — 49 of 49; then `npx vitest run src/ui/reqdoor.test.tsx` —
58 of 58 (one at a time; nothing that builds). No browser, no build, no typecheck.

**Not a finding by the brief:** a problem that lives only in data already stored (D56). Where that applies it is said.

## The count

| Severity | Findings |
|---|---|
| High | 0 |
| Medium | 0 |
| Low | 1 — FX-1 (the heading fix of finding 4 did not reach one sibling door) |
| Notes, no failure | 2 — a records line; a small change of behaviour that is harmless |

**Each of the nine fixes does what it says, in every case its finding names, and none of them breaks what stands beside
it.** One sibling path of finding 4 still carries the fault.

---

## FX-1 (LOW) — finding 4's fault is still on the one other door that builds the question's heading from the gate

**Setup.** An input of several people of a kind that asks the OIL question (a Meeting, an Event, an Other…), with no
answer for the day in question. Two ways in:

- (a) on the Inputs calendar, an input of three (Pike, Bane, Split) on a working day; drag its bar onto a Saturday or a
  holiday;
- (b) an Other for three filed under Unavailable on a Saturday, never answered; on the schedule, drop Tally on Split's
  puck in the Unavailable list (one man of several replaced).

**What happens.** The question that waits is headed with ONE callsign — the record's first person: "OIL — Pike, Sports
day". The answer given is written for everyone in the input (`commitInput(…, { oil })` in (a); `x.oil = { ...oil }` in
(b)).

**What should.** The heading every other door of this question now gives — everyone the one answer is written for
(D762): "OIL — Bane +2, Sports day" (`inputWho`). That is exactly what finding 4 fixed at the put-back door, whose new
comment says "as every other door of the question says it"; this door does not.

**Cause.** `raptor-port/src/ui/inputedit.tsx` `oilFirst`, the `holdForOil` call (line 1444):
`gate: { who: g.who, … }`. `g` is `oilGate`'s answer, and `oilGate` names `PEOPLE[draft.person].cs` — for an input of
several, `draftOf(x).person` is `leadOf(x)`, the first person. Its two callers with an input of several:
`ui/caldrag.ts:158` (`whole` — the gate is asked of `d`, the whole record's draft) and `ui/inputedit.tsx:1515`
(`reassignInput`, the branch `idsOf(r).length > 1`). `ui/reqdoor.ts gated` (line 186) already takes a `who` and both of
its several-people callers pass one; `ui/InputsPage.tsx:383` and `ui/interactions.ts:808` use `inputWho(…) || g.who`.
No test pins this door's heading (`gate.who` is asserted only for a hand-over of ONE, and for the put-back).

**Fix, step by step.**
1. `ui/inputedit.tsx` `oilFirst`: add to its options `who?: (r: any) => string` ("who the question names, where it is
   not the gate's own person" — the wording `gated` uses).
2. Same function, line 1444: `gate: { who: (o.who && o.who(find())) || g.who, typeLabel: g.typeLabel, plan: g.plan, prev: g.prev }`
   (`find()` — the tried save has put the list back as new objects, as the lines above it already assume).
3. `ui/caldrag.ts:158`: pass `who: x => inputWho(x)` (import `inputWho` from `./inputedit`). For an input of one it
   gives the same callsign as today.
4. `ui/inputedit.tsx:1515` (the several branch of `reassignInput`): pass
   `who: x => inputWho({ people: idsOf(x).map((p: any) => ({ p: String(p) === String(from) ? personId : p })) })` — the
   people as they will stand once the swap is made, the way `reqdoor.ts:277` and `:378` build theirs.
5. Tests first (they fail today): in `ui/oilwait.test.tsx`, beside "(the Opus read, F2)" — file three on a working day,
   `commitChipMove` it onto `SAT`, expect `view.OILWAIT!.gate.who` to be `inputWho(rec())`; and the same for one man of
   three replaced on an Unavailable row of an unanswered Other.

**Read, not run:** found by reading the code path end to end; I added no test (read-only).

---

## The nine, one by one

### 1 — Fable F1: a put-back refused after its answer throws the whole step away — RIGHT, COMPLETE
- **Does it do it.** `acceptInput` false → the words are said → `CmdRefused` thrown inside the reducer →
  `runInputWrite`'s catch rethrows → `commit` rolls back every enlisted store from the snapshot taken when the OUTER
  command enlisted (`command/commit.ts` `enlist` is first-capture-wins, so the nested `commitInputEdit`'s own
  `applyEnd()` — which advances the baseline mid-command — does not move the rollback point; `histRestore` then
  re-syncs the baseline). The answer, the stamp, the bell's notice (`NOTICES` is in `histSnap`), the row ids and the
  durable writes (`wtx.rollbackTo`) all go back. No Undo step (nothing is emitted).
- **Said once.** Inside `saveBatchX` the toast goes through its `spoke` wrapper, so `NOT_SAVED` is not added; the
  handler's else-branch is skipped for an answered step; `answerOilWait` says nothing for `'refused'`. The toast is not
  latched, so it survives the rollback. Pinned (`SAID.length` 1).
- **No refusal went silent with the else-branch gone.** With an answer, `ok` is false in three ways: `commitInputEdit`
  refused (every `false` it returns has toasted — checked each return, `normalizeInputDraft`'s and `protectedInput`'s
  included); `acceptInput` refused (said inside); the outer command refused (said by whoever refused, else `NOT_SAVED`).
  `!x` cannot happen: `redo` has just found it.
- **`refusalWords` in each refusal it is now reached from.** With the question answered, `acceptInput` can still refuse
  for: its row standing on another week (→ names the day and "load that week"), a saved week that cannot be read (→
  says so), its row already standing while it does not read "taken off" (→ "already on the programme"), a kind now
  never accepted, or the card's day gone (→ "can't be changed here right now"). A locked week is refused earlier by
  `commitInputEdit`, in the lock's own words. The body is the old inline code moved, unchanged; `dest` is always `'g'`
  on the answered path.
- **What a thrown step leaves.** `OILWAIT` was already taken down by `answerOilWait`; no bar is put up (a refusal, not
  "not answered") — correct. Edit-log lines are latched and dropped. The after-command pass was only deferred and is
  discarded (`PASS_FOR` keeps a dead envelope — harmless, the next command has a new one). The checks are run again on
  the restored world (`batchResult` → `HOOKS.reflow`). See note N2 for the armed place.
- **Siblings.** Every other batch body that makes a second write after a first already throws
  (`reqdoor.ts:229`, `:307`, `inputedit.tsx:507`, `:1909`); the rest have one write, or a second step that cannot refuse
  (`oilday.ts`, the window's saves, the medical saves). None carries the fault.

### 2 — Fable F2: the test's premise is asserted — RIGHT
`expect(rec().acc …).toBe('r')` replaces the early `return`; the test goes on to assert no question for "→ Unavail".
Passes.

### 3 — Opus F1: the marks are settled inside the answered step — RIGHT, COMPLETE
- **Does it do it.** `acceptInput`'s issued-row path ends in `markEdit('gr:di.ri.prog')`; `reconcileIssuedMarks([di])`
  then drops that key because the live value equals the issued one, and restores the issued tint. `[di]` is the right
  day: a put-back writes only `DAYS[di]` (an adoption of a standing row writes no mark at all). It is the same call the
  other Accept reaches through `afterSchedMutate` (whose resolver names the same one day).
- **Safe inside the batch.** It only ever removes a stale mark; `SCHED.pending` / `SCHED.changes` are in the snapshot
  (`schedFields`), so a later refusal of the command puts them back; it pushes no history. The batch's own epilogue
  (`applyEnd`) and the after-command pass add no mark afterwards — `holderbase.ts requestAddMarks` only deletes marks,
  and the input's row is not re-made (`srcvOf` does not read the OIL answer, so the answer written beside the put-back
  does not make the row "changed").
- **A fresh row** (the day never issued it): its key is live-only → kept, as it should be.
- **Siblings.** The only other `acceptInput` inside an input batch is the board's "+ Inputs" (`inputedit.tsx:1018`): a
  NEW input has no issued row to be restored, so there is no mark to settle. Nothing else of `afterSchedMutate` is owed
  here: the armed place is handled two lines below, the checks and the repaint by the batch's `reflow`.

### 4 — Opus F2: the heading names everyone — RIGHT at this door; ONE SIBLING LEFT (FX-1)
`inputWho(now) || g.who`: one person → his callsign (as before); several → "first A to Z +n"; a record naming nobody
falls back to the gate's. `now` is found after the tried save, as it must be. The lead line ("Putting 3 people's …")
is unchanged. The other door: FX-1 above.

### 5 — Opus F3: the gold dot on a man who replaced the only person — RIGHT, COMPLETE, NO OTHER READER DISTURBED
- **Does it do it.** The hand-over line is written only where one person replaced one (`A.length === 1 && B.length === 1`),
  and its `sub` is `leadOf(after)` — the new man — so `fld === 'whose' && sub === who` lights his seat and nobody
  else's. `logAction` stores `fld` because the line has a `sub`, and the reload path reads it back
  (`editlog.ts:182`), so the dot survives a reload. Every other way onto a row writes a `one` line (the `else`
  branch), so no way on is left without a line.
- **Every reader of a line's `fld`** (searched the whole of `src`): `changesmodel.ts:249` (`'mission-role'`), `:251`
  and `:299` (only for `sect === 'quals'`; and a line with an input's id is filed by `inputItem` before either is
  reached), `:274` (`'mission-role'`); `histbubble.ts:348` (`!== 'mission-role'` — unchanged for this line);
  `pendlist.ts:249–250` (`sect === 'quals'`, or `'posting'`). None matches `'whose'` on an absence line. The Leave War
  and the Tracker read no `fld`.
- **Lines written before the fix** carry no `fld` and stay undotted — stored data only (D56), not a finding.

### 6 — Opus F4: the tried put-back arms no flash — RIGHT, COMPLETE
`HOOKS.flashAdded` is the only way to `view.flashAdded` from the engine (`markStructuralAdd`); it is swapped for the
try and restored in a `finally`, so a throw cannot leave it silenced. The real run after the answer flashes as it
always did. **The other callers of `tryInputsBatch`** (through `dryRun`: `oilFirst`, `reqdoor.ts gated`) lose nothing
— a tried save must leave nothing — and gain the same protection where a tried drop appends a row. Everything else a
tried landing touches (`SCHED.added`, the marks, the row) is in the snapshot.

### 7 — Opus F5: "Answer OIL" after the input left the card's day — RIGHT, COMPLETE
`here(x)` is `inputCoversDate(x, DAYS[di].dt)` — the very test that draws the card on a day (`inputsOn`), so it cannot
refuse a card that is legitimately there (a multi-day input, an adoption of a row on another day). It guards both
`redo` (the open sheet) and `ask` (the bar); `'none'` gives "That input has changed — not put back" and writes
nothing. The first press needs no guard (the card is drawn only on a covered day). The bar is taken away by a week
change, a page change and a sign-in (`VIEW_RESET`), so `di` never meets another week's days. The other doors keep no
day index: `reqdoor` finds its row by id, `oilFirst` by `same`.

### 8 — Opus F6: the drag's stray timer — RIGHT
The guard returns before `document` is touched; in the app `document` always exists, so nothing changes there. It is
`caldrag.ts:266`'s twin, word for word in effect.

### 9 — the walk: the note is taken down when the question is put — RIGHT, NOTHING LOST
- `clearToast` clears the timer and fades the note; it is safe with no page. The new import makes no import cycle:
  `ui/toast.ts` reaches only `state/view.ts` and `ui/floatwin.ts`, and `state/view.ts` reaches neither `ui/toast.ts`
  nor `ui/oilwait.ts` (checked over the whole import closure) — so `toast.ts`'s own line at load
  (`VIEW_RESET.push`) still runs after `view.ts`.
- **For every kind of waiting change:** no door says anything of its own before it holds its change — the gate is
  asked silently and the tried save is silenced (`interactions.ts press`, `reqdoor.ts gated`, `inputedit.tsx oilFirst`)
  — and no caller says anything after `'asked'` (`drag.ts held`, the armed tap in `state/view.ts`, the Unavailable
  row's tap, the calendar's drag: each only hands the wait its ending). So the only note it can take down is one from
  an earlier step, which is the fix's intent. A refusal said at answer time (fix 1) comes after the sheet has closed.

---

## Notes — no failure, for the record

- **N1 — the records.** A saved change-history line's `fld` now also takes `'whose'`. Its type comment
  (`engine/editlog.ts:72–73`) and the two table documents (`docs/data-model.md` the `subjectField` row;
  `docs/data-schema.md` the edit-log paragraph) still describe it as "which of his details" on a Quals line, with
  `roster` and `posting`. Nothing misbehaves; the table list is meant to be kept true in the same change (D473). Add
  `'whose' — the hand-over line of an input of one` to the three.
- **N2 — the armed place.** Before fix 1 a refused answered put-back left an armed "+ add" armed (the batch
  committed); now the refusal goes through `batchResult`, which puts it down — as every refused save does. Harmless,
  and consistent; said so nobody is surprised by it in a walk.
