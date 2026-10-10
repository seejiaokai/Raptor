# `[GROUP-INPUT-ONE-ROW]` — Fable's independent code read (11 Oct 26; D749)

**Read:** `claude/group-input-one-row` at `199707f2`, the whole of `git diff 8d8caff6..HEAD -- raptor-port/src`, against the
plan (version 3), the register GI1–GI21, the check's evidence sheet (§3 roll-call, §4 door check, §12) and the rulings
D661, D734–D748, D109, D113, D114, D98, D103, D45, D174, D176, D178, D663, D660, D682, D711, D18, D46, D470, D468, D271,
D278, D450, D93 (their full rows). Brief followed as written: every object, renderer, door, writer, reader and order of
actions enumerated first; defects looked for as MISSING call sites, not only wrong lines. Exclusion honoured: nothing
below lives only in stored demo data.

**One disclosure first.** My first attempt to run a scratch test (`vitest run --dir <scratchpad>`) did not scope to the
scratch folder and ran the repo's whole unit suite for a few minutes, while a gate run was in flight on this PC. It
builds no `dist`, so it cannot have broken an e2e or smoke build, but it loaded the machine; if that gate run shows an
odd timing failure, that is why. The scratch test was then run alone through its own config (below).

## VERDICT: CLEAN WITH THESE EXACT CHANGES — one finding of this job (F1, medium, reproduced), one older gap the
## job widens (F2, low), one wording note (F3, low). Nothing silent in OIL or the published record was found.

---

## F1 — MEDIUM — new in this job — REPRODUCED. A man dragged from one shared input's row onto ANOTHER shared input's row joins the second input and STAYS in the first (reading R4 says he leaves)

**Setup.** Two shared inputs on Wed 15 Jul, both 14:00–15:00: A ("A brief") for Bane, Pike, Split; B ("B brief") for
Rocky, Ignite. Both drawn as one row each on the Ground Programme.
**Action.** Drag Pike's puck (a member's own name box on A's row) onto Rocky's puck on B's row — or onto B's "+ add".
**Wrong result.** Pike is ADDED to B and is still in A: `A = [bane, pike, split]`, `B = [ignite, pike, rocky]`; the
app toasts "Nomad added to B brief" and then a clash warning "RU BFM & B BRIEF clash" — he is now booked twice at the
same hour. One Undo takes him out of B only. By reading R4 (told to him; the plan §4.5, §7) and D734 ("a puck taken off
the row takes that man out of the input"), dragging his puck OFF row A onto another place must take him OUT of A and put
him on B, in one step. On `main`, the same drag between two ground rows was a swap/move, never a copy.
**Observation that disproves correctness.** After the drag the Inputs calendar's 15 Jul card shows Pike in BOTH inputs.

**Cause.** `ui/drag.ts applyDrop` — in the seat branch (`if (slotEl)`) the TARGET-on-a-shared-row question is asked
first: `if (DRAG.kind === 'roster' || DRAG.key !== targetKey) { const put = groupPut(targetKey, aimed) … }` returns
`'done'` and finishes through `fin()` BEFORE the source is examined (`if (isRowMan(DRAG.key)) … groupLeaveTo(…)` sits
below it). The cell branch (`onCell`) does the same: `groupPut(fillKey, moving)` precedes the `isRowMan(DRAG.key)`
block. `groupPut` itself is written for "from the crew list or from a seat elsewhere — the seat he came from keeps
him", which is right for a flying seat and wrong for a member's own place on another shared row.
**Reproduced:** scratch test `scratchpad/fable-read/crossrow.test.tsx` (the hands test's harness; two `commitGroup`
filings; `setDrag({kind:'slot', key: keyOf('A brief','pike')})`; `applyDrop(seatEl(keyOf('B brief','rocky')))` and
`applyDrop(cellEl(keyOf('B brief','ignite')+'.+'))`) — both assert `people('A brief') === ['bane','split']` and both
FAIL with `['bane','pike','split']`; the console shows "Nomad added to B brief" and the clash toast.

**Fix — exact steps.**
1. `ui/grouprow.ts`: add one door, `groupMove(fromKey, toKey): 'none' | 'refused' | { landed: string }`:
   - `const from = placeOf(fromKey), to = placeOf(toKey); if (!from || !isMember(from) || !to) return 'none'` (only a
     member's own place onto another shared row is this door's — every other pairing stays as it is);
   - `if (!canEditSched()) return 'refused'`;
   - `const pid = String(from.inp.person); const toRows = entryRowsOf(INPUTS, to.inp)`;
   - same entry (`to.row.srcg === from.row.srcg`) or `toRows.some(r => String(r.person) === pid)` →
     `HOOKS.toast(\`${csOf(pid)} is already on this input\`, 'warn'); return 'refused'` (D271);
   - `const carried = entryOilAnswer(toRows)`; then ONE `saveBatchX` whose body is `leave(from, () => {…})` reused as a
     body (factor `leave`'s inner `commitGroup` call out so it can run inside this batch), and inside the same batch:
     `commitGroup({ rows: toRows }, draftOf(toRows[0]), [...toRows.map(r => r.person), pid], undefined, { sched: true })`
     (a `false` → `throw new CmdRefused(…)` so he stays in A), find `his` in `entryRowsOf(INPUTS, toRows[0])`, copy
     `his.oil` when `carried.kind === 'same'`, set `his.mod` as `groupPut` does, remember `hisId`;
   - after: the two notes as one toast ("Nomad moved from A brief to B brief"; the placeholder note from `leave` stays);
     `if (carried.kind === 'differ') { setOilAsk(his.iid, true); setInpEdit(his) }`; `notify()`;
     `return { landed: placeOnRow(toKey, pid) ?? String(toKey) }`.
2. `ui/drag.ts applyDrop`, seat branch: immediately before `const put = groupPut(targetKey, aimed)` insert
   `if (DRAG.kind === 'slot' && isRowMan(DRAG.key)) { const mv = groupMove(DRAG.key, targetKey); if (mv === 'refused') return no(); if (mv !== 'none') return fin(mv.landed, aimed) }`.
3. `ui/drag.ts onCell`: the same three lines immediately before `const put = groupPut(fillKey, moving)` (with
   `fillKey`, `moving`).
4. `state/store.ts writeSlot` / `writeFill` and `state/view.ts placeArmed` need nothing: they write a man from the crew
   list, never from a place.
5. Test first (`ui/grouprow-hands.test.tsx`, under "THE DROP ITSELF"): the scratch test's two cases, asserting
   `A === ['bane','split']`, `B === ['ignite','pike','rocky']`, ONE `globalUndo()` restores both, and `pendingLand().sel`
   names Pike's new place on B. Add the control: Pike dragged onto a puck of HIS OWN row's extras is refused "already on
   this input" and nothing changes.
6. Add a roll-call row to the evidence sheet (§3): "two one rows on one day — a man dragged from one onto the other";
   walk it once on the built bundle (desktop drag) after the fix.

---

## F2 — LOW — older, unchanged on `main`, widened by this job — READ. The landing flash after a row drag paints the wrong row (the walk's W1-11)

**What the walker saw.** The one row dragged by its grip to the top of the Ground Programme; the flash painted on the
row now standing where the one row used to be (S1, Anvil's Training).
**Cause, and why it is older.** `ui/rowdrag.ts landSel(from, to)` paints `[data-move="${to}"]` — the drop TARGET's
address — and its own comment (6 Sep 26, "KNOWN GAP, recorded not fixed") says the Ground Programme's FIRST hand move of
a day whose rows are not in start-time order freezes the display order into the model and re-indexes every row
(`engine/reorder.ts moveGroundRow`'s `!d.gman` branch: `f = newOf[from]; t = newOf[to]`), so the moved row lands at
`newOf[to]`, not `to`, and the flash lands a row out. In the walk's fixture G4 (14:00) landed before S1 (10:00), so
model order ≠ display order; dragging G4 above S1 → `to` was S1's model index 4, the block landed at 0, and
`[data-move="mv:g.2.4"]` is S1 — exactly "the row now standing where it used to be". `git show 8d8caff6:raptor-port/src/ui/rowdrag.ts`
carries the same comment: a first hand move of ANY single ground row on such a day does the same on `main`.
**What this job adds.** The new block move makes a SECOND case, independent of the first-move freeze: moving a block
DOWN lands the lead at `rest.indexOf(dst[last]) + 1`, which equals `to` only for a single row dropped on the last member;
a one row of four dragged below a later row lands its lead at `to − 3`, and `[data-move="mv:g.di.<to>"]` is then a
non-lead member row, which draws nothing — no flash at all. The engine already reports the landed row:
`done(\`gr:${di}.${oldOf.indexOf(src[0])}.prog\`, di)`; the UI throws it away (`applyMove` returns a boolean).
**Fix — exact steps.**
1. `engine/reorder.ts`: beside `REORDERED_DI` add `export let LANDED_KEY:any=null; export function popLandedKey(){const k=LANDED_KEY; LANDED_KEY=null; return k;}`;
   in `done` add `LANDED_KEY=key;` as its first line; in `applyMove` set `LANDED_KEY=null` before dispatching (a sorter's
   leftover must never be read as a drag's).
2. `ui/rowdrag.ts` line ~260: replace `markLand(where + landSel(src, to))` with
   `const k = String(popLandedKey() || ''); const m = /^gr:(\d+)\.(\d+)\.prog$/.exec(k); markLand(where + (m ? \`[data-move="mv:g.${m[1]}.${m[2]}"]\` : landSel(src, to)))`.
   (The ground kind only; the other kinds' `to` is already right, and the formation case keeps its special-case.)
3. Test first (`ui/rowdrag.test.tsx`): (a) a day whose ground rows are not in start-time order, a single row dragged to
   the top on the day's first hand move → `pendingLand().sel` ends `mv:g.<di>.0`; (b) a one row of three dragged below a
   later single row → the sel names the LEAD's landed index (`groundGroups(DAYS[di])[…].lead`), which is a drawn row.
4. Delete the KNOWN GAP paragraph in `landSel`'s comment in the same change (it is closed by this).

---

## F3 — LOW — new in this job — READ. A scheduler's real man standing among a member's extras leaves with him silently in the history, and the toast calls him "it"

**Setup.** A one-man request for Bane with the scheduler's man Comet in its name box (D470); the filer then adds Pike in
the input's window, so it becomes a group — the view puts Bane back in the name box and moves Comet to Bane's extras
(`overlay.ts reconcileRequestRows`). **Action.** Drag Bane's puck off the row (or right-click it). **Result.** Comet goes
with Bane's row (as ✕ on a one-man row drops its extras — right in substance), the toast says "Comet came off … with
Bane — drop it on the row again if it still applies" ("it" for a man), and the change-history line says nothing of
Comet: `ui/inputedit.tsx leavingNote` names `isSpecial` pucks only, while `ui/grouprow.ts leave` names every man in
`more`. D745's words are about ALL / ALL AVAIL, so this is a gap in the words, not in the rule; the count is right
(his row's units carry it). **Fix:** in `leavingNote` drop the `isSpecial(p)` filter (name every puck of `more`,
`csOf` each) so the line and the toast agree; in `leave`, word the note "came off … with Bane — put them on the row
again if they still apply" when any named puck is a real man. Test: `grouprow-hands.test.tsx` "the change history's
line…" with a real man in the extras.

---

## Explicit negatives — what I checked and found nothing

**A. OIL.**
- `engine/oil.ts repricedOil`: `inputOilAmt` returns `null` (never 0) for hours that price nothing, so a Yes is never
  turned into a No and never deleted from a row on the schedule; a No (0) stays 0; a person change → `undefined` → void,
  so `reassignInput`'s new `{ sched: true }` still voids the old holder's answers and the question still follows.
- `commitInputEdit` picks `repricedOil` only when `schedSide(opts)` (the ROLE, not the caller's word); the input's own
  window never passes `sched`; `commitGroup` hands `opts` to each record's save and sets no `oil` unless `oilDec` is
  given — none of the schedule's doors gives one, so the `forAll` / `oilOnly` paths are not reached from the row.
- `entryOilAnswer`: 'same' only when every record answers every asked day with the same value (amount included);
  any mismatch — a 0 against a 1, an unanswered man, a stale amount — is 'differ' → the sheet opens on HIS record;
  'none' only when nobody answered. The copy for 'same' is written inside the one command on his record alone.
- The 'differ' sheet (`pops.ts OILOWN`, the editor's `own` + `shut`): `saveOwnOil` writes `row.oil` and `stampChanged`
  (`modBy`/`modAt` only — `mod`, the late date, is NOT moved), so answering it never makes him late (D741); Cancel
  leaves him unanswered and closes.
- `groupPut` sets `his.mod = min(today, his own due date)` after `commitNewInput` stamped today → never late; nobody
  else's `mod` is touched (the kept records are not `changed`, so `commitInputEdit` does not run on them).
- `entryPeopleOnce` / `carryOilRefusal`: copies ONLY a 'deny', ONLY where his own item has no decision, never deletes
  the old key, never touches an issued snapshot; it runs after `landRequests` in the view and is idempotent across
  passes (each pass starts from the holder's base).
- The crowd behind a placeholder leaving with its man: `publish.ts` `via` folds the OIL line into that request's item
  only when the crowd of `i:<id>` has NO member left and that request's filing or details moved; the record (`dayDelta`)
  still carries the `oil:` entry (count test line 310 asserts it).
- Hours typed on the Unavailable list's OD row (R11): the same `repricedOil`, no sheet (`askOilIfPending` is skipped for
  a scheduler). Found nothing.

**B. The published record.**
- `foldEntries` is called in exactly two places: the LAST line of `dayPendingItemsIn` and inside `dayDiscardCount`.
  `dayDeltaIn`, `canonicalDiff`, `digest`, the stored `diff`, `pendingKey`, `alIssue`'s `diff` are untouched by the
  diff; `units` (and so `alCount`) is the folded count by design (GI17), and the test at line 241 pins "its record still
  holds every entry".
- It never returns zero while `dayDelta` is non-empty: a set of one is left alone, a set of ≥2 keeps its first;
  `regroupRides` removes two units only when a host 'add' of the same entry exists on the day.
- It cannot fold two different things: the key is `entryIdOf` = `grp + hash(sharedKey)` — two shared inputs with equal
  fields but different groups differ; an ordinary request has `''`; a medical kind or an upchit is `''` (D655 reading 4);
  the act string carries kind, axis, the filing from→to and the shared fields on each side, so a re-time never folds
  with a take-off, and a name-box mark folds only with the same mark. Items are per day.
- Adds fold only as the whole input (live members covering the day); removals only as the whole issued input (frozen
  copies ∪ issued rows); a removal with nothing frozen to judge by is left alone.
- `dayDiscardCount` folds the same way over the day a load would leave (`keptToo` admits the `kept` rows a load puts
  back); `u.inp` is now the filing object (was `true`) — its one reader (`requestRowUnit`) tests truthiness only.
- `requestAddMarks` asks "was issued" of the rows' ids, so a re-time before or after the add keeps the puck's tag;
  a whole new one row keeps the row's own "added" mark. Readers of `dayPendingItems` (ALPanel, ChangesWindow,
  pendlist, drafts.ts `inputsLeftSaid`) read lengths/kinds of the folded list — consistent with the day head. Found
  nothing.

**C. The door and the belt.**
- Every writer of a person: `probe-bridge.ts` (both wrapped), `state/store.ts writeSlot`/`writeFill` (HOOKS door first;
  `writeSlot`'s no-op short-circuit runs before it, correctly), `state/view.ts placeArmed` (retarget then door),
  `ui/drag.ts applyDrop` (every branch — but see F1), `ui/Shell.tsx` right-click (`groupTake` first). Every writer of a
  typed box: `textedit.ts routeFocusOut`, `board.ts boardChange`, `store.ts writeText`, the probe — all ask
  `reqRowText` first; `board.ts:1709` writes `dr:` and `interactions.ts:905` a brief-time key, neither a request box.
- Writers that never pass the belt, and must not: the view (`Object.assign`), `acceptInput`/`unacceptInput` (splice),
  Undo/Redo (snapshot), a version load, a plan switch, a day template (whole-day), a person's delete (the after-command
  overlay), `renameCallsign` (a label), the Leave War's doors (`commitInputEdit` on leave/OD records), `reassignInput`
  (`iu:` keys). No false refusal found: `.xN` places, a one-man request's row, a `kept` row, a taken-off request's row,
  a hand-built row and a read-only request's row are written exactly as before; a placeholder on "+ add" passes.
- `groupLeaveTo`: the place is written INSIDE the input command (`commitInputsWith` enlists the schedule store; the
  rederive is a deferred effect after `applyEnd`), so the positional key still names the right row when written; a
  `false` from the writer throws `CmdRefused` → he stays in; the landing is re-read by row id after the command. The
  only path that leaves him in BOTH places is F1.
- The swap branch never carries a real man back onto a shared row (`back = ''`): consistent with D734 as built
  (every real man on the row is one of its people). Found nothing beyond F1.

**D. Saved data / the view.**
- `requestRowFields` adds `srcg` only when non-empty; `srcvOf` appends `|g:` only then — an ordinary request's row and
  its `srcv` are byte for byte what they were (grouprow-entry test pins it); a grouped row's hash moves with ANY shared
  field; a pre-build grouped row is re-made and marked at its first read (R8 as corrected).
- `reconcileRequestRows`: a shared row keeps its own man; the old occupant goes to `more` (a real man once, a
  placeholder as often as stored — D271/D278); `delete row.srcg` when the record left its group. `placeRequestRow`
  copies exactly `cx, cxr, flag, info` from the last sibling and inserts after it; Accept's issued-row restore runs
  first. `groundGroups` excludes `kept` rows and rows whose marks differ. `requestOfBox` is null for `acc === 'r'`,
  `kept`, protected and gone requests. Rows on a week not on screen are re-made when that week is read. Found nothing.

**E. Roles.**
- `groupPut`, `groupTake`, `groupLeaveTo` refuse without `canEditSched()`; `schedSide` requires it, so a member's
  hand-made `{ sched: true }` is an ordinary save; `commitGroup` asks `mayEditInput` / `mayDeleteInput` /
  `mayFileInputFor` per record (groupwrite.test pins a member's refusal); the board's buttons and the week's typed boxes
  exist only on Edit Schedule; `state/perms.ts` is untouched. Found nothing.

## What is MISSING from the roll-call (the finder's brief)
1. **Two one rows on one day, a man dragged from one onto the other** — no row, no walker scenario; it is F1.
2. **The Inputs calendar's date drag on a bar of a shared input** — one record's dates change, he leaves the entry and
   his row is drawn apart (honest, by the entry rule) — row 12 says "their own doors, unchanged" but nobody walked the
   schedule's face after it.
3. **A person deleted (Admin → Users) while in a shared input that spans the cutoff** — his record ends the day before,
   so on the days before the cut his row is drawn apart from the others; the Inputs page shows the same, so it is
   consistent, but no roll-call row names a person's delete or archive.
4. **A `kept` row of a shared input after a load of an older version whose requests are gone** — four `kept` rows draw
   a row a man (D363); not a fault, but unlisted.

## Scratch test, for the builder to lift into `grouprow-hands.test.tsx`
`C:\Users\User\AppData\Local\Temp\claude\C--Users-User-projects-Raptor\d8268a45-08f2-4d0c-9187-3bf6599ee27f\scratchpad\fable-read\crossrow.test.tsx`
(run alone with its `vitest.scratch.config.ts`: 2 tests, 2 failed as described under F1).
