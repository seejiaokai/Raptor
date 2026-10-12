# The Opus trial read of the one-rule job's code at 41752a24 (12 Oct 26) — saved whole

**A TRIAL, on the owner's word: a fresh Opus 5.5 reader given the brief Fable had (`2026-10-12-one-rule-code-read.md`), on the walked commit, blind to the walk and to Fable. Opus wrote this code, so this read is NOT the job's independent read (D67). Nothing in it was run; every claim is to be reproduced as a failing test before it is believed.**

# Read of the finished code — one rule / one record (`[ALL-AVAIL-AS-MEMBER]`) at `41752a24`, base `7c1fcdc0`

**Set-up.** Worktree detached at `41752a246608f102a5cb7a4bda558fa8cbdccb88` (confirmed); all source read there. From the main checkout I read only the brief, the sheet's §§1–6 and the walk brief. Nothing after §6, no `or-*`, no reads folder, no later commits. Read-only.

**How far to trust this.** The worktree has no packages, so **no test was run: every finding below is by reading, not by running.** Each names the one test that would prove it.

**Read whole:** `engine/inputs.ts` (to line 800, then the SANS/late tail), `inputown.ts`, `overlay.ts`, `grouprows.ts`, `inputs-readers.test.ts`, `ui/reqdoor.ts`, `state/notices.ts`, `noticeseen.ts`, `state/perms.ts` (150–761), `state/sched-commit.ts`, `engine/medical.ts`, `ui/topbits.tsx`.
**Read in the parts that matter:** `oilev.ts` (225–634, 796–1275), `publish.ts` (184–400, 455–645, 686–727, 828–1012), `canonical.ts` (296–474), `slots.ts` (75–364, 425–730), `store.ts` (80–330), `person-delete.ts` (150–334), `leavewar/inputgate.ts` (60–391), `leavewar/sync.ts` (286–640, 756–935), `ui/inputedit.tsx` (205–480, 826–1262, 1330–1807, 1994–2520), `ui/drag.ts` (120–457), `state/view.ts placeArmed`, `state/holderbase.ts` (60–250), `command/commit.ts` (120–385), `ui/board.ts` (580–636, 1076–1232), `ui/inputscal-model.ts` (60–245), `ui/PeoplePick.tsx pickProblem`, `leavewar/ui/RemarksSheet.tsx`, slices of `html.ts`, `interactions.ts`, `InputsCal.tsx`, `InputsPage.tsx`, `SansDay.tsx`, `sanscal-model.ts`, `oilmode.ts`, `undo/timeline.ts`, `undo/derive.ts`.
**Diff or grep only:** `events.ts`, `avail.ts`, `weekctx.ts`, `validate.ts`, `drafts.ts`, `daytpl.ts`, `keys.ts`, `changelines.ts`, `histbubble.ts`, `changesmodel.ts`, `pendlist.ts`, `peek.ts`, `board-html.ts`, `undo-wire.ts`, `persist.ts`.
**Not opened:** `ui/InputCard.tsx`, `ui/export.ts` (excluded), `state/demoseed.ts`, `engine/schema.ts`, print/PDF, and the reference docs other than `data-model.md` §11's three rows.

---

## Findings — most serious first

### 1. The Leave War's note sheet writes one man's note onto everyone in a shared leave; a member is refused on his own cell
- **Steps.** Saber files LL for Drifter, Hunter and Tally (one input). Leave War at Published. Saber taps **Tally's** cell; the sheet is headed "Tally … Edit the note on this leave"; he types "Bali" and saves.
- **Happens.** The shared record's remark becomes "Bali" for all three, with no word that it was for everyone. As Tally himself, the same save is refused: "Only Saber — who filed it — or an admin can change this for everyone".
- **Should.** Only Tally's part changes: he gets an input of his own (plan §4.6 names this caller).
- **Cause.** `ui/inputedit.tsx setLeaveRemarks` is still `commitInputEdit(row, {...draftOf(row), remarks})`. `leavewar/sync.ts leaveInputAt` hands back any leave input behind the cell — the sheet's own header says "a leave filed on Inputs OR bid in the war". Plan §10 2(h) left the split out on the premise that the sheet only meets war-approved one-person leaves; that premise is false.
- **Silent:** yes for the admin; said (wrongly) for the member. **New** — at the base each man had his own record.
- **Fix.**
  1. `setLeaveRemarks(row, remarks, person?)`: when `idsOf(row).length > 1 && holds(row, person)`, run `saveBatch(() => { const own = ownInputOf(row, person); if (!own || !commitInputEdit(own, { ...draftOf(own), person, remarks })) throw new CmdRefused('his note was not saved'); return true })`; otherwise as today.
  2. `RemarksSheet.tsx`: add a `person` prop and pass it to `setLeaveRemarks`. `Matrix.tsx`: pass `person={open.id}`.
  3. Tests in `leavewar/onerecord-write.test.ts`: admin on Z's cell leaves X and Y's remark unchanged and makes two inputs; member Z on his own cell is saved; one Undo puts back one input.

### 2. A person added to one piece of a cut leave is also added to its other pieces
- **Steps (one sitting, no reload).** Saber files LL for Hex, Mon 13 – Fri 17 Jul. He files ATT C for Hex on Wed 15; the leave becomes two inputs (Mon–Tue, Thu–Fri). He opens the Mon–Tue leave, switches on "Several people", adds Tally, saves.
- **Happens.** Tally is put in the Thu–Fri leave too, and saved. His Leave War cells and balance show leave nobody chose, his undecided bids on those days are replaced, and he gets two "You were added" lines.
- **Cause.** `leavewar/sync.ts sliceInput` makes each piece with `{ ...row }`, so every piece shares the same `people` array. `engine/inputown.ts putPerson` then does `r.people.push(...)` in place. The same shallow copy is in `ui/inputedit.tsx applyMedPlan` (tail) and `mintMedSegments`; those are only saved by the medical one-person rule.
- **Reached by:** `sickCutsLeave`, the war's `cutDates` (a middle day un-approved or deleted) and `doorMoveApproved`. The sharing lasts until a reload or any refused command.
- **Silent:** yes. **New** — the shallow copy is old; the in-place list is this build's.
- **Fix.**
  1. `putPerson`: `r.people = [...r.people, entry(r, p, st)]`.
  2. `sliceInput`, after `const out = { ...row }`: `if (Array.isArray(row.people)) out.people = row.people.map((e: any) => ({ ...e }))`; likewise copy `oil` and `leftAt` where present.
  3. The same line for `t` in `applyMedPlan`'s tail and in `mintMedSegments`.
  4. Test: file a new-shaped LL Mon–Fri, cut it with a Wednesday medical, `commitInput(pieceA, draftOf(pieceA), [hex, tally])`, expect `idsOf(pieceB)` to equal `[hex]`.

### 3. An OIL question left unanswered after a scheduler adds someone waits on nobody's bell
- **Steps (the walk's A8).** Ranger files a Saturday Training for himself and closes the OIL question. Saber drags Tally onto "+ add"; the question opens; Saber closes it.
- **Happens.** Ranger's bell opens the notices list, not the question. Saber's bell holds nothing. Nobody is reminded.
- **Cause.** `leavewar/sync.ts oilPendingFor`: `ownOf` fails (two people). `filedByHim` requires `mayEditInput(row)`, which is false because `perms.ts allPutBy` fails on Tally's entry (`by` = Saber). `by` stays Ranger, so Saber is not asked either.
- **Against what he was told.** Plan §4.4 and R18 say "unanswered, it waits on the filer's bell". That is true only while the filer may still change the input — which he may not, the moment the scheduler's add is what raised the question.
- **Silent:** yes (OIL earned by nobody until someone opens OIL Earn or the window). Also, the List shows no "OIL?" chip for an input of several (`InputsPage.tsx`: `!team && mayEditInput(r)`).
- **New** in mechanism.
- **Fix, one of two.**
  - (a) Code, recommended (extends F13): export from `perms.ts` a helper returning the `by` of the newest entry not put in by the filer (the pick inside `byAfterLeaving`). In `oilPendingFor` also ask a person when the input holds several or a placeholder, `row.by != null`, `!filedWhole(row)`, that helper equals him, and `mayEditInput(row)`. Test: A8 lights Saber's bell.
  - (b) Or correct R18 to him: once a scheduler has added someone, an unanswered question shows on no bell.

### 4. A refused time typed on one man's Unavailable row still splits him out of the shared input
- **Steps.** LL for three, 08:00–12:00 each day. On Tally's Unavailable row Saber types `12:00` into the start.
- **Happens.** "Give the input a start and end that are not the same time", the cell heals — but Tally has been taken out of the shared leave into an identical input of his own, and the other two get a bell line.
- **Cause.** `ui/inputedit.tsx saveFromRow`: `saveBatch(() => { const own = ownInputOf(inp, who); return !!own && commitInputEdit(own, …) })`. `ownInputOf` has already changed the list when `commitInputEdit` returns false from a preflight. A callback that returns false does not roll back (`saveBatchX` → `runInputWrite` only rolls back on a throw).
- **Silent:** yes. **New.**
- **Fix.** In `saveFromRow`'s `mine` branch: first `if (!normalizeInputDraft({ ...d, person: who }, inp)) return false`; then inside the batch throw on failure: `if (!own || !commitInputEdit(own, …)) throw new CmdRefused('one man’s part was not saved')`. Test: one input of three after the refused typing, no Undo step, no notice.

### 5. A second person can be added to a war-approved leave; the Leave War can then no longer act on it
- **Steps.** A leave approved on the Leave War for Hex (carries `lw`). Saber opens it on the Inputs page, adds Tally, saves. On the war he tries Un-approve, Move or Delete on Hex's cell.
- **Happens.** Nothing; the item is skipped with no words.
- **Cause.** `leavewar/sync.ts warLeaveRow` requires `onlyNamed(row) === personId`. Plan §4.1 says `lw` is "only ever on an input of one person", but neither `commitInput` nor `shapeProblem` holds it.
- **Silent:** yes. **New** — at the base the second man was a second record.
- **Fix.** `engine/inputs.ts shapeProblem`, after the medical line: `if (ids.length > 1 && inp.lw) return 'A leave approved on the Leave War is one person’s — file the other person’s leave as its own input'`. In `commitInput`, pass `lw: rec && rec.lw` into the object handed to `shapeProblem`. Test in `onerecord.test.ts`.

### 6. Taking a person out and putting him back leaves a published day reading "1 pending" that nothing clears
- **Steps.** Meeting for Drifter, Hunter, Ranger (joined in that order), Wed; publish. Drag Drifter off the row (1 pending — right). Drag him back onto "+ add".
- **Happens.** Still 1 pending ("order changed"), the sign-offs stay fallen, though every screen shows the same three. "Load onto working copy" re-makes the row from the live input and it stays pending; Discard offers 0.
- **Cause.** `overlay.ts requestRowFields` writes `who`/`more` in joined order. `restore.ts dayKeys` compares them by position. `canonical.ts canonicalUnits` emits an order unit for the input row's list place. `inpDetailKey` sorts the people, so there is no input item for the people step to fold it into.
- **Against:** D98 and D755 reading (a) ("two routes to the same people give the same row").
- **Not silent in the count; silent as to why.** New mechanism — the base did not return to zero on this route either (a row removed and a row added).
- **Fix (keeps marks as they are).**
  1. `overlay.ts`: add and export `asIssuedOrder(f, issuedRow)` — when the issued row's people (`who` + `more`, through `whoId`) are the same set as `f.who` + `f.more`, write `f.who`/`f.more` in the issued row's order.
  2. Give `reconcileRequestRows` the `ctx`; in rule 5+6, after `const f = requestRowFields(r)`, call it with `ctx.issued(di)`'s non-`kept` row of the same `src`.
  3. `slots.ts acceptInput`, in the `rid` branch, call it with `ig[ix]`.
  4. Test in `state/inputcount.test.ts`: "issued for three — the first to join taken out and put back by hand: 0 waiting; nothing to publish".
- (Sorting the row by id instead would also work but shifts every puck's positional mark whenever someone joins mid-list.)

### 7. A swap from a flying seat counts 1 on a published day; the jet's crew change has no line
- **Steps.** Published Wed. Training for Ranger alone. Drag Tally from a flying seat onto Ranger's lone puck (the two swap).
- **Happens.** 1 pending, the input's line only. Ranger now sitting in the jet is folded into it.
- **Cause.** `publish.ts dayPendingItemsIn`, people step: `personUnitSrc` matches a reseat by its `from` as well as its `to`, so both reseats are consumed; then `A.length===1 && B.length===1` returns.
- **Under-reports a flying change in "To go out"** (the stored amendment still holds it). New. The plan never fixed this count; D109/D113 read as 2.
- **Fix.** Before that early return, give back to `items` (straight after `item`) any consumed `reseat` whose `token` is `off[0]`, removing it from `item.rows`. Test: count 2, lines "Tally on Training instead of Ranger" and "Ranger: Training → <seat>".

### 8. A new one-person input for a man who earlier left a shared one is swallowed as a "piece"
- **Steps.** Published day with a shared leave [X, Y, Z]. Take Z out. Later file a separate leave for Z covering the day with different hours.
- **Happens.** Count stays 1 ("Z taken out"); the new leave has no line.
- **Cause.** `inputs.ts frozenInputMatch` step 3b matches any twin-less one-person record of the same kind whose man left a frozen record.
- **New.**
- **Fix.** Add to `d`'s test: `String(x.was.by ?? '') === String(n.r.by ?? '') && Number(x.was.at || 0) === Number(n.r.at || 0)`. A real split copies `by`/`at`; a fresh filing has its own. Test: 2.

### 9. "By" does not pass on at three doors that take the filer out
- **Where.** `person-delete.ts applyDelete` (`left` and `split` use `takePerson`/`ownInputOf` with no `byAfterLeaving`) — so a deleted or posted-out filer stays "By <him>" and may leave an OIL question with nobody. `inputedit.tsx reassignInput`, several-branch (`swapPerson` only).
- **Older rule (F13) half-built.**
- **Fix.** After the take-out in each, when `String(r.by ?? '') === String(id)`: `r.by` = the acting scheduler if there is one, else `byAfterLeaving(r, id)` — the expression `commitInput` uses. For `split`, do it on the shared record after `ownInputOf`, so his own piece keeps his `by`.

### 10. A named man dropped on the puck of a Personal input's row replaces its owner
- **Steps.** Ranger's "Personal" input on the programme; drag Tally onto Ranger's puck.
- **Happens.** "Tally is on Personal instead of Ranger" — the member's personal input is now Tally's.
- **Should.** Refused: plan §4.4's table and the walk brief say "Anyone onto a Personal input … 'A Personal input is one person's own'". Dropping on "+ add" is refused correctly by `shapeProblem`; the replace path is not.
- **Cause.** `reqdoor.ts rowPut` → `replace`. **New** — at the base a name-box drop did not change the request.
- **Fix.** In `rowPut`, after the placeholder branch: `if (/^Personal$/i.test(String(p.inp.type || '').trim())) { HOOKS.toast('A Personal input is one person’s own', 'warn'); return 'refused' }`.

### 11. A row adopted back by Accept keeps people its input does not hold
- **Steps.** ✕ a request's row. Load the version or plan that had it — the row stands again while the input reads "taken off", so the belt is off (`requestOfBox` answers null). Drag Tally onto that row (a raw write). Press Accept (`acceptInput` adopts: `inp.acc = 'g'`).
- **Happens.** The row shows Tally; the input, the Inputs calendar and OIL do not. The next change to the input silently drops him.
- **Cause.** `overlay.ts reconcileRequestRows`: `if (row.srcv === sv) continue` trusts the hash, not the row. The same holds when a `kept` flag clears.
- **Fix.** Compute `f` first and skip only when `row.srcv === sv && shows(row) === shows(f)`.

### Small, seen in passing (no fix demanded)
- `noticePass`: later pieces of a man's own cut leave tell him "You were added" (new id, no `lw`, `splitFrom` null).
- `reqdoor.replace`: `toPeople` runs before `commitInputEdit`, so a refusal still commits the shape rewrite of an old-shaped record.
- A swap whose seat refuses the replaced man (B3) says only "Not saved — that change was refused…"; `rowTwice`'s reason is not said.
- `rowMove` onto an input answered No gives no "— not counted for OIL".
- R5 together with R20: a remark typed on one man's Unavailable row of a shared OD gives him a new input, so a scheduler's OIL switch-off about him on the old one ends (it reads pending on a published day; unseen on an unpublished one). Worth one sentence to him.

---

## Explicit negatives — traced and found sound

**1. OIL.**
- One claim an input: `projectOilInputs` (`people`, `ph`, no `person`).
- One default: `claimDefault` → the input's answer, for named people and the crowd in `oilEarnedWork`; `earnsFrom`'s three states sit over it.
- Nobody twice: the crowd is filtered of named people in `oilEvidenceNow`, and `availableFor` reads lines.
- Switch-offs that must end: `pruneHandedOverDecisions` reads `leftAt`, then the entry's `h`, then the placeholder's `h`. I walked a person out and back; ALL AVAIL off and back; the swap. All end.
- Switch-off that must survive: a named man leaving beside ALL AVAIL does not move the placeholder's `h`.
- The swap's void: `commitInputEdit` → `repricedOil`/`voidedOil` both return nothing when the person differs; `swapPerson` moves the holding on.
- Cancelled or information-only: `landedStanding` reads the input's marks first, for every day covered.
- Legacy block: `legacyClaim`/`legacyEarned`/`legacyDefault` read only frozen rows.
- Evidence key: `claimWho` is sorted, a one-person claim's segment is byte-identical, and I found no path that reads pending for ever or never — apart from finding 6, which is the content axis.

**2. The published day.**
- People step: one each from the two lists; an only-person swap one; a move between inputs paired into one; first-to-join leaving is one (list place).
- CX on and off: nothing (`inpDetailKey` names `cx` only where set; the re-make deletes the row's `cx`/`cxr`).
- A several-day input counts on each covered day (the details axis is per frozen `inp`).
- The OIL fold's who-set is the named people of both copies; crowd arriving or leaving folds.
- `daySnap` freezes rows, deep copies of inputs, and the evidence. The face reads through `withFrozenInputs` → `inputsOn`/`inputLinesOn`.
- `dayDiscardCount` measures against `dayAsLoadLeaves`.
- Exceptions: findings 6, 7, 8.

**3. Saved data and Undo.**
- `shapeProblem` is held for every command at `placeholderShapeViolation`, a restore included.
- `peopleOf` is the one reader; the remaining `.person` reads are on lines, faces or derived rows (I checked each grep hit).
- Notices are made in `tellPass` inside the command, ride the envelope, and are removed or restored by `schedWriteRecords`.
- Read is `settings/noticeseen:<pid>` by `notices.seen`, which is in `NOT_STEPS`.
- A nested throw rolls the whole command back (`commit.ts child`). One command, one telling (`TOLD`).
- Exceptions: findings 2, 4, 5.

**4. Who may.**
- `PERMS` rows for `Input`, `Notice`, `NoticeSeen` match §11's cells.
- `inputBreach`: I walked a forged `by`, a forged entry, a mark, putting himself in, a hand-over, and OIL on another's input — each refused.
- `ownPart` (both cases, and through a replay); `onlyNamed` with and without a placeholder (D770); `byAfterLeaving` in `commitInput`.
- `canEditSched()` is in `rowPut`, `rowTake`, `rowLeaveTo`, `rowMove`, `rowMark`, `applyDrop`, `cxCommit`.
- Exceptions: findings 9, 10.

**5. The readers.**
- `events.ts`, `avail.ts`, `weekctx.ts`, `palette-html.ts`, `flyplan.ts`, `roster-restore.ts`, `inputgate.ts`, the war's absence index and `availableFor` all read lines; the frozen frame is honoured by `inputLinesOn`.
- Writers find records: `applyDelete`, `sickCutsLeave`, `cutDates`.
- The belt (`inputSeatBar`) sits ahead of every branch of `setSlotVal`/`fillSlot`; every raw caller asks the door first.
- **Attack on the map:** the guard cannot see (i) a writer handed a record by reference rather than through `INPUTS.`-named calls — finding 2 lives there (`sliceInput`'s copy); (ii) a body that receives the record from another module — finding 1 (`RemarksSheet` → `setLeaveRemarks`); (iii) the funnels `inputOnAny`, `sansAvailOn`, `frozenInputMatch`, which are not in its `NAMES`.

**F1–F16.**

| # | Mark |
|---|---|
| F1 | Sound — writers on records; the guard's third list. |
| F2 | Sound — `inputLinesOn` under `FZ`. |
| F3 | Not applicable to finished code; no body left reading nobody. |
| F4 | Sound — `mayChangeInput` asks `onlyNamed`. |
| F5 | Sound — `ownPart` in the gate, `othersInputs`, and `saysSame`'s treatment of `acc: 'g'`. |
| F6 | (a) sound; (b) sound, but see finding 7; (c) built, over-wide — finding 8. |
| F7 | Sound at the row's door and the one-person window path (`oilGate` treats a new person as stale). |
| F8 | Sound — `seat` runs inside the command; `isRowMan` is true for every place. |
| F9 | Sound — and the wiring is all present (backend, types, registry, reset, persist mapper, `SCHED_COLLS`, perms). |
| F10 | Sound — pass memo keyed by frame and date; nothing inside a pass writes. |
| F11 | Sound. |
| F12 | Sound — `commitInput`'s `mayEditInput`, and the gate's "a person added to another person's input". |
| F13 | Built for "takes himself out" and "a scheduler takes him out" only — findings 3 and 9. |
| F14 | Sound. |
| F15 | Built, stricter than asked; its limits are above. |
| F16 | Sound — `iuParts` at every site I grepped; `ChangesWindow` resolves `~sub`. |

---

## The roll-call (sheet §3)

| # | Mark |
|---|---|
| 1 | Wired — `html.ts` `inputRowSeveral` → `rowPeopleDrawn` |
| 2 | Wired — `board-html.ts` 601/636 |
| 3 | Wired — `html.ts inGrp` → `facesDrawn`, `inpCxHTML` |
| 4 | Wired — `board-html.ts` 767–769 |
| 5 | Wired — `facesOf` one a row, `iuTail`; hands via `reassignInput`/`saveFromRow` (findings 4, 9) |
| 6 | Wired — `facesOf` → `sansCardsHTML` |
| 7 | Wired — `palette-html.ts inputLinesOn`; `highlights.ts` pass |
| 8 | Wired — `events.ts mapInp` on lines; official pass under `withIssuedWeek` |
| 9 | Wired at the funnels (`inputsOn`/`inputLinesOn`, issued rows through `rowPeopleDrawn`); the face's own wrapper not opened |
| 10 | Wired — `peek.ts` 224 |
| 11 | Not opened |
| 12 | Excluded (D773) |
| 13 | Wired — `monthItems`, `barText` |
| 14 | Part opened — `inputcard-model` reads `idsOf`/`facesOf` |
| 15 | Wired — `InputsPage` `namesOf`, `inputPassesPerson` |
| 16 | Not opened (`InputCard.tsx`) |
| 17 | Wired — `InputEditor` (`commitInput`, one OIL line, D771) |
| 18 | Wired — `mineRow`/`takeMeOut` |
| 19 | Wired — `picker` when `recPpl.length > 1` |
| 20 | Wired in `pickProblem`; the two pucks' drawing not opened |
| 21 | Wired — `sansDayGroups` (`namedOf`), `SansDay` line ids |
| 22 | Wired — `medical.ts leadOf`/`holds` |
| 23 | Wired — people step; `pendlist` only grepped |
| 24 | Grep only (`changelines`, `histbubble`) |
| 25 | Wired — `dayPendingItems` (findings 6, 7, 8) |
| 26 | Wired — `dayDiscardCount` |
| 27 | Wired — `toggleOilPerson`, `spanDefault`, `oilEligible` |
| 28 | Wired in the engine (`sent`, placeholder `h`); the window's own code not opened |
| 29 | Wired for drawing (`refreshAbsences` on lines); **its writers are not — findings 1, 5** |
| 30 | Wired — `oilEarnedWork` in the credit pass |
| 31 | Wired — `topbits.tsx`; finding 3 is what it leaves unlit |
| 32 | Wired — `schedWriteRecords` (`inputs`, `notices`), `NOT_STEPS` |
| 33 | Wired — `persist.ts rowOf('inputs' / 'notices')`, hydrate |
| 34 | Wired — `me()`-based |
| 35 | Wired — every hand asks `canEditSched()` |
| 36 | Wired — `applyDelete`, `APP_ACTS`; finding 9 |
| 37 | Not opened in depth (`drafts.ts`); the re-make itself is wired; finding 6 touches it |
| 38 | Not opened |
| 39 | Diff only — `daytpl.ts` copies rows; the `src` strip not re-read |
| 40 | Wired — reconcile rule 2 (`cover`) then `landRequests` |
| 41 | Wired — `weekctx`/`events` lines plus `inputSilent` |
| 42, 43 | Not code |
| 44 | Wired — legacy reader, `peopleOf` |

**Places the 44 rows miss:**
- The Leave War's Published-stage note sheet — it writes an input (finding 1).
- The war's approved-leave doors (un-approve, delete, move) and its day tap list — they write and slice inputs (findings 2, 5).
- The Inputs calendar's bar drag (`caldrag.ts`) and the medical move sheet.
- The List's "OIL?" chip — now absent for an input of several.
- The List's "Deleted" group.
- The late cut-off's count in the Inputs settings.
- Week Insights' work hours (reads the day's events, so lines).

---

## Missing scenarios for the walk

1. **War note on a shared leave.** LL for three; war Published. As Saber on Tally's cell, then as Tally on his own: type a note. *Must see:* only Tally's note changes; two inputs on the Inputs calendar; Tally is not refused.
2. **Add to one piece of a cut leave, no reload.** Finding 2's steps. *Must see:* Tally on Mon–Tue only, on the Inputs calendar, the Unavailable list and the Leave War.
3. **A8, then both bells.** *Must see:* somebody's bell goes to the question; say whose.
4. **A refused time on one man's Unavailable row.** Shared timed leave; type a start equal to the end. *Must see:* refusal, and still one input of three.
5. **A second person on a war-approved leave**, then Un-approve / Move / Delete on the first man's cell. *Must see:* a refusal at the add, or the war still acting.
6. **Published: first-to-join out and back.** *Must see:* 0 pending. Try "Load onto working copy" too.
7. **Published flying day: swap from a flying seat.** *Must see:* the jet's change named in "To go out".
8. **Published: man taken out of a shared leave, then a new leave filed for him.** *Must see:* 2, with a line for the new one.
9. **Delete (or post out) the filer of an input a scheduler added to; and swap the filer out on the Unavailable list.** *Must see:* who "By" names and whose bell holds an open OIL question.
10. **A named man dropped ON the puck of a Personal input's row.** *Must see:* refused.
11. **✕, load the version, drag a man onto the returned row, Accept.** *Must see:* the row and the input agree.
12. **Shared weekend OD, one man switched off in OIL Earn, then a remark typed on his Unavailable row.** *Record:* what OIL Earn says for him.
13. **Admin files a mid-leave medical for Ranger.** *Read Ranger's bell:* no "You were added" for the pieces of his own leave.
14. **A Fri–Sun Training for three.** OIL Earn on Sat and Sun, where the row does not stand. *Must see:* each man switchable from the Personal Inputs line; each credited once a day.

---

## Verdict

**NOT CLEAN — the bet is sound and nothing needs redesign; these are missing call sites and two order faults, each a contained change.**

**Fix before "merge live":**
- **1** (one man's note written onto others; member refused),
- **2** (leave on dates nobody chose),
- **4** (a refused save that still changes the input),
- **5** (a leave the war can no longer act on),
- **3** (fix it, or correct R18 to him — an OIL question with no reminder),
- **6** (a published day that cannot get back to "nothing pending").

**Fix or file, his call:** 7, 8, 9, 10, 11 and the small items.

Each fix above names its pinning test. None of the six was run here; the first step for each is to write that test and watch it fail.
