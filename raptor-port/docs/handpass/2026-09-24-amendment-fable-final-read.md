# Amendment re-test — final code read (Fable), branch `claude/amendment-retest` vs `main`

Read: the full non-test diff (`git diff main...HEAD -- raptor-port/src`), the engine (publish, drafts, canonical, slots, verid), the state layer (sched-commit, history, view, undo-wire, undo/timeline), the UI surfaces named in the brief, the Leave War lane, the evidence sheet, the register, and the branch's new tests.

## Findings, most severe first

### 1. A manual reorder of the ground programme is an amendment the day counts, but it does not invalidate the four sign-offs, so it can be published on signatures given for the old order

**Plain English:** the scheduler can drag ground rows into a new order on a published day and press Publish AL without anyone re-signing.

**Why:** the signature binds to `digest()` (engine/canonical.ts), which keys ground rows by their **raw array index** (`dayKeys` in restore.ts line 118) and excludes `gman`. But the amendment record's ORDER axis (`canonicalDiff`, and `rebaseDayPending`) compares the **displayed** order (`groundOrder(rows, gman)`). The first manual drag on a day (`moveGroundRow`, engine/reorder.ts lines 232-247) freezes the sorted display order into the array, sets `gman`, then moves the row. When the resulting raw array equals the pre-drag raw array, the digest is unchanged while the display order changed.

**Scenario**
- Setup: a published day whose ground rows were appended out of time order, e.g. raw `[B 09:00, A 08:00]` (displayed A, B). Sign all four.
- Action: on the board, drag B above A (model from=0, to=1).
- Expected (AM10, AM11, AM21): "1 reorder" pending, the sign-offs cleared, Publish AL1 locked until re-signed.
- Observed if wrong: "1 reorder" pending and "Not yet signed" show, but all four pills stay green, `daySigned(di)` is true, "Publish AL1" is enabled and issues the reorder on the old signatures.

Mirror of the same root: `sortGround` on a non-manual day whose raw order is not time order permutes the raw array with no display change. The digest moves, all four signatures blank, and the line reads "no changes to publish".

**Fix**
1. `raptor-port/src/engine/publish.ts`, `currentBind(di)`: add a field for the displayed ground order, e.g. `gord: groundOrder(d.ground, d.gman).map(x => x.row.rid || '').join(',')` (import `groundOrder` from `./order`).
2. Same file, `signBoundOk`: add `&& (x.gord || '') === (c.gord || '')` to the comparison.
3. Test red first, `raptor-port/src/engine/signbind.test.ts`: publish a day with raw ground `[09:00 row, 08:00 row]`, `setSign` all four, call `moveGroundRow(di, 0, 1)`, assert `daySigned(di) === false` and `dayDelta(di)` contains a `move` entry. Today `daySigned` stays true.
4. For the mirror, either key ground in `canonicalContent` by displayed order or leave it and record it. The bind fix alone closes the publish door.

**Status:** pre-existing on `main` (canonical.ts and `currentBind` are untouched by this branch). Not made reachable by the branch, but it is the one door I found that publishes on a signature for other content.

### 2. A deliberately removed input silently becomes a fresh, flagging input after a plan switch or a version load round trip

**Plain English:** the scheduler took an appointment off the day; after switching plans there and back, it flags conflicts again and, on an unpublished day, lands itself on the next week load.

**Why:** the W4-F3 change in `reconcileDayFiling` (engine/slots.ts lines 600-624) now promotes `'r'` to `'g'` when a replacement brings the row back. The reverse branch, when a later replacement drops the row, deletes `acc` (fresh) rather than restoring `'r'`. On `main` the `'r'` was untouched in both directions.

**Scenario**
- Setup: a day with an accepted activity input; make Plan A and Plan B (both carry the row). On Plan B, press the row's Undo (`unacceptInput` → `'r'`, the row removed).
- Action: switch to Plan A, then back to Plan B.
- Expected (AM43b): the input is still parked ("Removed from the day — flags nothing until accepted again").
- Observed if wrong: `inp.acc` is `undefined`. The Personal Inputs row loses its dormant styling, `inputFlags` is true so it flags conflicts again, and `unacceptedKeys()` (state/store.ts) no longer records it, so `relandInputs` re-lands it on the next week load if the day is unpublished. On a published day the filing key flips from `'r'` to `''`, which also changes what the sign-offs bind to.

The same happens with "Load AL1 onto working copy" followed by "Load Original", when the input was accepted after the Original.

**Fix**
1. `raptor-port/src/engine/slots.ts`, `reconcileDayFiling`: when promoting, set a marker: `if(inp.acc!=='g'&&isPersonal(inp.type)){ if(inp.acc==='r')inp.accR=1; inp.acc='g' }`. In the not-landed branch: `else if(inp.acc==='g'){ if(inp.accR)inp.acc='r'; else delete inp.acc; delete inp.accR }`.
2. Same file, `acceptInput` and `unacceptInput`: `delete inp.accR` on an explicit accept or removal.
3. Test red first, `raptor-port/src/engine/drafts.test.ts`: land an input, `draftDup(di)`, `unacceptInput(di, inp)`, `draftSelect(di, planA)` (expect `'g'`), `draftSelect(di, planB)`, assert `inp.acc === 'r'` and `inputDormant(inp)`. Today `inp.acc` is `undefined`.

**Status:** new on this branch (commit `767799ae`).

### 3. On the view page the new pending outline now hides the dashed and dotted warning rings on a pending puck

**Plain English:** a viewer looking at the working draft can no longer see that a man is a sanctioned late show, or that he is the cause of tomorrow's crew-rest breach, if his seat also has a pending change.

**Why:** W2-F6 changed `.seat[data-alp] .puck` (scheduler.css line 1667) from a box-shadow to an `outline`. Its specificity (0,3,0) beats `.puck.boxdash` and `.puck.boxdot` (0,2,0), both of which draw their ring with `outline` only. Before the branch the reverse held on the view page: the ring won and the hint vanished. On the edit surfaces this collision already existed through the `#eWeek .seat[data-aln] .puck` rule (W2's sheet, line 211, inferred and not walked).

**Scenario**
- Setup: a published day; on the view page pick "Working draft". A man with a sanctioned-late absence (dashed ring) or a crew-rest trace (dotted ring) sits in a seat with a pending change.
- Action: look at the puck.
- Expected (AM51, AM51b): the red dashed or dotted ring, plus the neutral pending hint.
- Observed if wrong: an amber dashed 1.5px outline only. The dotted red ring is gone entirely; the dashed one leaves only a red border.

**Fix**
1. `raptor-port/src/ui/scheduler.css`: draw the neutral hint on the seat wrapper, not the puck. Replace line 1667 with `.seat[data-alp]{outline:1.5px dashed rgba(242,214,153,.75);outline-offset:1px}` (line 1660 already gives `.seat[data-alp]` `position:relative`). Apply the same move to line 1678 for the edit surfaces so the AL-coloured dotted mark also stops competing with the rings.
2. Test red first, `raptor-port/src/ui/amendretest.test.tsx`: read scheduler.css as text and assert no rule with selector `.seat[data-alp] .puck` or `.seat[data-aln] .puck` sets `outline`. Re-take walker W2's d-09b picture with a sanctioned-late puck.

**Status:** new on the view page (this branch); pre-existing on the edit surfaces.

### 4. An accidental Unpublish with nothing to correct cannot be put back once the session's Undo is gone

**Plain English:** tap Unpublish by mistake, log out, and the only way to get AL1 back is to change something and publish a different AL1.

**Why:** `unpublishDay` sets `SCHED.correcting[di]` and `publishALDay` deliberately allows a same-label reissue on an empty delta (GU5-001, "a pure round-trip correction"). But no door offers it: `dayStatHTML` (ui/html.ts line 1325) shows the AL button only when `nd > 0`, and `ALPanel` lists only `pendingPublishDays()`. Unpublish itself is one tap when no OIL bid is drawn on, and it is a standing action that survives logout (AM32) while Undo does not.

**Scenario**
- Setup: a published weekend at AL1, where AL1 added a man who earns OIL. Tap Unpublish (one tap). Log out.
- Action: log in, wanting AL1 back unchanged.
- Expected: a reissue door (the engine permits it).
- Observed if wrong: the day reads "Published at Original — no changes to publish", no Publish AL button anywhere, the man's OIL is withdrawn (D142) until the scheduler invents a change.

**Fix**
1. `raptor-port/src/ui/html.ts`, `dayStatHTML`: `const correcting = !!(SCHED.correcting && SCHED.correcting[di])`; show the AL button when `ed && ok && (nd || correcting) && !DPREV.has(+di)`, labelled `Reissue AL${alN}` when `!nd`.
2. `raptor-port/src/engine/publish.ts`, `pendingPublishDays`: include approved days with `correcting[di]` set, so the Amendments panel offers the same.
3. Test red first, `raptor-port/src/ui/amendretest.test.tsx`: publish, publish AL1, `commitUnpublish(0)` with no edit, assert the week head has a `[data-alpub]` button. Today it does not.

**Status:** pre-existing on `main`. Note the host's look card (§13 step 3) states the opposite expectation, so this needs the owner's word.

### 5. A re-accepted issued input can land in the wrong place and read as a reorder

**Plain English:** put an issued appointment back on a day with a manual ground order and the day says "1 reorder" for a row that went back where it was.

**Why:** the W4-F2 change (engine/slots.ts line 450) inserts at `Math.min(ix, d.ground.length)`, where `ix` is the row's index in the **issued** array. If an issued row before it has been removed, or the working copy holds a manual order, the surviving-rid order differs from the issued one and `canonicalDiff` emits `mov:ground`. With no manual order the time sort masks it.

**Scenario**
- Setup: issued ground `[A, B(input), C]`, `gman` true. Remove A (a real removal), then Undo the input B.
- Action: re-accept B.
- Expected: "1 removal" only.
- Observed if wrong: "1 removal · 1 reorder". Only a pending count, not a publish-door error.

**Fix**
1. `raptor-port/src/engine/slots.ts`, `acceptInput`: insert before the first live row whose rid follows the restored rid in the issued order: `const after = ig.slice(ix + 1).map(r => r.rid); ri = d.ground.findIndex(r => r && after.includes(r.rid)); if (ri < 0) ri = d.ground.length;`.
2. Test red first, `raptor-port/src/ui/amendretest.test.tsx` (the W4-F2 block): the setup above, assert `dayDelta(di)` has one `delete` and no `move`.

**Status:** new on this branch.

## Observations, not findings

- After the W4-F2 round trip the `del:` tombstone minted by the removal stays in `SCHED.pending`. No surface reads it (every count reads `dayDelta`; `deleteCount`, `moveCount`, `publishableKeys` have no callers), the next AL carries it into `changes` inertly. Harmless clutter.
- With F-w3-1, redoing a sign-off that an undone later publish had spent draws nothing (the restore image is re-cleared). Correct for money, but the bubble says "signed" and no name appears. Accepted by the fix's own comment.
- With F-w3-2, any new scheduler entry on the week writes `sched.book`, so it permanently abandons every undone scheduler step on that week, including after a section drag or a sign-off on another day. Classic-stack semantics; previously the same steps were refused, not dropped.

## Explicit negatives

- **The one count (AM23):** every reader of "N pending" on a published day now goes through `dayShownPendCount` or `dayDelta`: the day head, the ⓘ panel, the plan-switch message, the sign-off line, the Amendments panel, the Load confirm (`dayDiscardCount`). The only remaining `dayPendCount` caller in html.ts (line 1394) is dead when not previewing. Nothing found.
- **The marker (AM24):** `nysMarkHTML` is on the week head and the board strip (both widths share `boardSignHTML`), guarded by `!PV`. Not drawn on the issued face, under a preview, or on the board's preview strip. The view page's working-draft peek shows it, which is the working copy. Nothing found.
- **`commitPublishALDay`'s reconcile:** it only ever deletes a pending field key whose live value equals the issued value, or restores that key's issued tint. The same body already runs on every mutation epilogue, so touching other approved days changes nothing they did not already have. Nothing found.
- **`commitUnpublish`'s reconcile and the orders asked:** unpublish then undo, undo of the publish itself, unpublish of an AL carrying a removal, a reorder, a filing, an OIL-only change, and on a day with plans: the marks, delta, sign line, panels and `desiredOilCells` all derive from the same book state and the restored images. Nothing found.
- **`pulledBackDays` / `schedPostRestore`:** only publishes newer than the restored entry count, so signatures given after an undone publish survive; a Leave War or plan entry never writes `sched.book`, so neither clears anything; abandoned publishes still count, which errs to clearing. Nothing found that could let a day out unsigned.
- **`abandonForkedRedo`:** transitive closure is forward-only by seq and by shared key; restore-origin and nav-only envelopes never abandon; the two new timeline tests match my hand trace. Nothing found.
- **The arms:** page change, `setDayPreview` (dropdown, Back to live, plan switch, plan preview), week swap and login/logout all clear `RESTARM` and `UNPUBARM`. A board day step does not, but `RESTARM` is keyed by day and version and `UNPUBARM` by day, so stepping away and back leaves an arm only on the same day, where the confirm face is still drawn. Nothing found.
- **Signatures on the other axes:** content, filing, OIL decisions, plan revision and base version all bind and are recomputed on every read; an exact revert restores them. The one hole is finding 1.
- **The money:** `desiredOilCells` reads the loaded week from live `SCHED` and every other week from its stash, per day, only from a resolved issued snapshot; every publish, unpublish, undo and redo ends in a deferred reflow that runs the pass. `oilDaySig` cannot loop (the signature is refreshed before the notify it triggers). Nothing found.
- **Roles:** every publish, unpublish, load, plan-switch, sign-clear and discard door checks `canEditSched()` and the page; the board closes on leaving Edit Schedule; the sign select and the Amendments panel render only on the edit page. No member or view-as-member path to a write found.
- **The rest of `767799ae`:** the Unavailable row's Undo (routes to `unacceptInput`, parks the input dormant, edit surfaces only), the board preview strip (selector and tag only), the plan editor's page gate, the sign-off line wording (`stale` is exactly the withdrawn-appointment case), the History footnote and wrapping CSS, the four Logic lines and the four WCODE headings. Nothing found.
