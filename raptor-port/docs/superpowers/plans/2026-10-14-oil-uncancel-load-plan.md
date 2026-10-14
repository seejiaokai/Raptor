# The small OIL job — plan and working notes (the night of 14 Oct 26)

`[OIL-UNCANCEL-UNASKED]` (owner D816) with `[OIL-LOAD-VERSION-UNASKED]` (D818), one check for the two (D485). Built on
his yes (D857) in the unattended run of that night (D856), by Opus, read by ONE fresh Opus reader and no Fable read
(D858); Sonnet 5.5 may walk and run the checks (D588). Branch `claude/oil-uncancel-load-ask`, cut from
`claude/approved-jobs-batch-build-cc42ef` at `1d29b83c8` — NOT from `main`: it changes `ui/reqdoor.ts`, which the
leftovers batch also changed. Nothing merges; it gets a pull request of its own once pull request 505 is merged.

**This file is the state.** It was written before the chat compacted, so that the work carries on from here. Keep it
true at every commit: tick what is done, write what was found.

## What he ruled (open the full rows before acting: `grep -h '^| D816 |' .claude/decisions-full/*.md`)

- **D816:** taking the CANCEL off an input that has NO OIL answer for a non-working day puts the OIL question first, as
  "Accept" does — nothing is un-cancelled until it is answered; where it is already answered, or nothing is to be
  asked, it is un-cancelled at once and the answer counts again. Readings told to him: (1) taking the
  information-only mark off is treated the same; (2) not answered, it stays cancelled and the bar that stays says so —
  **the three wordings: "Don’t un-cancel" / "Un-cancel" / "Not un-cancelled — OIL not answered"; for the ⓘ mark
  "Don’t change" / "Change" / "Not changed — OIL not answered"** — shown to him on the build, his to change; (3) the
  answer and the un-cancel are ONE step and ONE Undo; (4) an Undo of a cancel still asks nothing (D793 reading 3).
- **D818:** after a published version is loaded back onto the working copy, the app says how many of the inputs it put
  back still need an OIL answer and opens that day's ONE list of them — the load itself is NOT held. Readings: (1) the
  load happens at once, as today; (2) the list is D782's own (`ui/OilDayList.tsx`), opened for the day that was loaded,
  holding only inputs with no answer; (3) **the note's words, shown to him on the build: "<day> loaded · 3 inputs need
  an OIL answer"; nothing is added where none needs one**; (4) what he answers there notifies nobody (D781), "Later"
  leaves the "OIL?" signs and the bell's line as they are; (5) an input put back under Unavailable counts (D804), a
  cancelled one does not (D814).
- Beside them: D814 (a cancelled or information-only input is never asked and earns nothing), D793 and D804 (Accept
  and "→ Unavail" wait on the question), D783 (the bar that stays; nothing moves until answered), D782 (the one list),
  D762 (one answer for everyone in an input), D831/D840/D841 (the bar is a band under the top bar, one line), D25
  (say OIL), D56 (demo data is not a finding).

## The code as read on 14 Oct 26 (line numbers at `1d29b83c8`)

- **The un-cancel door:** `src/ui/reqdoor.ts` `rowMark(key, what, on, reason?)` (about line 398) — one command
  (`saveBatchX`) that sets or clears `inp.cx` (+ `cxr`), `inp.flag`, `inp.info`, then `stampChanged`. It asks nothing.
  Its only callers: `src/ui/board.ts` about lines 1124 (CX — through `askCx(…, via)` and `cxCommit`, which says
  "Restored" only when `via` answers true), 1131 (red box), 1143 (information-only — `if (rowMark(…) !== 'done') return`,
  then its own sentence). So an answer of `'asked'` already reads as "not done" at both callers; neither says anything.
- **The pattern to copy:** `src/ui/interactions.ts` `press()` (about lines 791–818) — Accept / "→ Unavail":
  `oilGate(draftOf(r), r)` asked quietly; if `kind === 'ask'` and a `dryRun` of the change would succeed →
  `holdForOil({ kind, lead, places: ['sel:…'], gate: { who, typeLabel, plan, prev }, redo: oil => …, ask: () => … })`
  and answer `'asked'`; `redo` re-finds the record and makes the change WITH the answer in one `saveBatchX`
  (`commitInputEdit(x, draftOf(x), undefined, undefined, { sched: true, oil })`, then the change). Also
  `reqdoor.ts` `gated(…)` (the swap / add / move door).
- **The gate refuses a cancelled input:** `src/ui/inputedit.tsx` `oilGate(draft, prevRow, force)` returns `none` when
  `oilNeverEarns(prevRow)` (cancelled or info). So the un-cancel must ask it of the record AS IT WILL STAND — a copy
  with `cx: false` (or `info` removed), e.g. `const as = { ...inp, cx: false }; oilGate(draftOf(as), as)`.
  **TO READ FIRST:** how `commitInputEdit` writes `opts.oil` and whether it drops an answer while the record is still
  cancelled — the order inside the one command (mark off, then the answer) may matter.
- **The words of a wait:** `src/ui/oilwait.ts` `WAIT_WORDS` (`{ no, yes, not }` a kind) and the "changed meanwhile"
  map under it; the kinds are `OilWaitKind` in `src/state/view.ts` (about line 420: `'swap' | 'add' | 'move' | 'back' |
  'file'`). Two new kinds: `uncx`, `uninfo`. Changed-meanwhile words to write: "That input has changed — not
  un-cancelled" / "That input has changed — not changed" (the second reads oddly: put a better one to him, e.g.
  "…— left as information only").
- **What flashes when not answered:** `places` — the row's own button: `sel:[data-grcx="<di>.<ri>"]` /
  `sel:[data-grinfo="<di>.<ri>"]` (the board's attributes). The row moves: find it again by the input, not by index.
- **The load's door:** `src/ui/interactions.ts` about lines 1204–1281: `loadVersionToWorkingCopy(di, ver)`
  (`src/engine/drafts.ts`), then one sentence built from parts ("<Day>: <version> loaded onto the working copy — …
  · N unpublished edits replaced · …") said by `HOOKS.toast` and logged. `LOADMOVED` (each `{ days, on }`) names
  requests that came back onto or off the programme.
- **The one list:** `src/ui/pops.ts` `OILLIST` / `setOilList({ from, to, name, fresh })`; `src/ui/OilDayList.tsx`
  reads `src/leavewar/sync.ts` `oilOpenOn(from, to)` — every input with an unanswered asking day in the range, never a
  cancelled or information-only one (`oilSilent`), never a day of a locked week. It is a scheduler's only. Opened
  today by a holiday's save (`sync.ts` about line 945, `fresh: true`) and by the bell's line (`ui/topbits.tsx` 109).

## The build, tests first

1. **D816 — `rowMark` waits.** A fifth parameter `oil?`. Taking `cx` or `info` OFF with no `oil`: ask the gate of the
   record as it will stand; `ask` and the change would not be refused → `holdForOil` (kind `uncx` / `uninfo`; lead
   "Un-cancelling <who>'s <input>" / "Taking information-only off <who>'s <input>" — the second to be worded and shown
   to him), answer `'asked'`, write NOTHING. With `oil`: the mark off and the answer in ONE `saveBatchX` — one Undo.
   The redo says the caller's sentence ("Restored"; the information-only one) since the board's callers will not.
   Putting a mark ON, and the red box, ask nothing. `again`: the row found afresh; an input no longer cancelled, gone,
   or moved off the day → `'none'` and the changed-meanwhile words.
2. **D818 — the load says and opens.** Before `loadVersionToWorkingCopy`: which inputs covering that day stand on the
   programme or under Unavailable (`acc` `'g'` / `'u'`). After: those that stand now and did not before = "put back".
   `n` = how many of those are in `oilOpenOn(<that day's iso>)`. `n > 0` → the sentence gains
   " · <n> input(s) need(s) an OIL answer" and `setOilList({ from: iso, to: iso, name: '', fresh: false })`. `n === 0` →
   nothing added, nothing opened. The existing sentence is NOT reworded (his D818 words "<day> loaded · 3 inputs need
   an OIL answer" are the tail; the built sentence is shown to him).
3. **Records:** `docs/engine-rules.md` §Weekend/PH work earns OIL (the bullet on a cancelled input: D816, D818 "not yet
   built" → built), `docs/ui-contracts.md` §The OIL question comes before the change, `docs/feature-impact.md`,
   `docs/file-map.md`, the behaviour register if this area has one; `OUTSTANDING.md` both items; `[NO-ASTRA-LIST]`'s
   line (already there).

## The tests to write first (model: `src/ui/oilwait.test.tsx` — its `boot`, `file`, `rowKey`, `answerOilWait`,
`leaveOilWait`, `oilBarOk`; `src/ui/reqdoor.test.tsx`)

- an input cancelled with NO answer on a Saturday, its cancel taken off → `'asked'`, the record untouched,
  `OILWAIT.kind === 'uncx'` and its lead; answered Yes → not cancelled AND the answer written, ONE Undo step; Undo →
  cancelled again and no answer; answered No → not cancelled, the No kept.
- already answered → un-cancelled at once, the answer counts again; a working day, a kind that never asks, a Personal
  input → at once.
- not answered (`leaveOilWait`) → still cancelled; the bar reads "Not un-cancelled — OIL not answered"; "Answer OIL"
  brings the question back; "OK" closes it; nothing in the change history.
- the information-only mark the same, with its own words.
- changed meanwhile (brought back by another hand, deleted, its dates moved off the day) → the changed-meanwhile words.
- through the board's own buttons: no "Restored" while it waits; "Restored" after the answer.
- a cancel put ON, and the red box either way: no question.
- an Undo of a cancel: no question (D793 reading 3).
- the load: a version loaded back that puts an unanswered input on the programme → the sentence's tail and the one
  list open for that day; with none → neither; a cancelled one put back → not counted; one put back under Unavailable →
  counted; a member (not a scheduler) cannot reach the load at all (existing).

## The check — tier FULL (OIL; a published day)

Open `docs/bug-check-order.md` again and follow §5's order: the rules sweep (the rulings above, one mark per surface
for what is shown, one result per order for OIL) · scenarios designed by a model that did not build it (a fresh Opus
agent, blind to the code: rank 1 of §4 — the ChatGPT readers are out) · the roll-call (every door that takes a cancel
or an information-only mark off; every door that loads a version) and the door check · the sizing lines, then a walk
(a Sonnet 5.5 helper may walk; the host opens the pictures and reproduces every find) — **the fixture by the app's own
controls: file a Meeting on a weekday, cancel it on the board, change its date to the Saturday in its own window
(cancelled, it is not asked — D814), then take the cancel off on Saturday's board; and for the load: publish a
Saturday with an input on its programme, make … (the order's §7.1 day)** · break tests · ONE fresh Opus read of the
finished code (D858), its brief written before, the walk's report not shown to it · a narrow read of any fix that
rewrites logic · the gates under the PC's lock with `E2E_PORT=4174` (port 4173 is another chat's) · the evidence sheet
`docs/handpass/2026-10-14-oil-uncancel-load.md` with its `Walk:` line · his look. **The real downstream number:** after
the answer, the man's OIL on the Leave War for that Saturday (the grid's HO / FO cell and the OIL tracker), not only
the screen that asked.

## Parked for him (the run's one list — a question never stops the run, D596)

1. The information-only mark's wait: its lead and its changed-meanwhile words (proposed above) — shown on the build.
2. The load's sentence as built — the existing sentence with the new tail — against his "<day> loaded · 3 inputs need
   an OIL answer".

## Progress

- [x] rulings' full rows opened; the code read; this plan written (14 Oct 26, night)
- [x] `commitInputEdit`'s handling of `opts.oil` read: a plain write of the answer (`r.oil = { ...oil }`); the un-cancel does the same inside its own one command (`reqdoor.ts unmark`), the mark off first
- [x] D816's tests written and seen red (7 of 11; four already held) — `src/ui/oilwait.test.tsx`, the block "(ON10)" at its foot
- [x] **D816 BUILT** (`reqdoor.ts rowMark` waits, `unmark`, `UNMARKED`; `oilwait.ts` the two kinds' words; `state/view.ts` the two kinds; `board.ts` reads `UNMARKED`). One older test met the new rule and was given the route that still leaves a live unanswered input (an Undo of the cancel). As built: the lead reads "Un-cancelling <who>'s <input>" / "Taking “information only” off <who>'s <input>"; changed meanwhile: "That input has changed — not un-cancelled" / "That input has changed — left as it is"; what flashes: the row's CX or ⓘ button; where the input was answered meanwhile "Answer OIL" simply brings it back and says "Restored".
- [ ] D818's tests, red · [ ] D818 built
- [ ] the scenario designer's list · [ ] the roll-call and the sizing lines · [ ] the walk · [ ] break tests
- [ ] the fresh read · [ ] fixes · [ ] the gates · [ ] the sheet · [ ] the records · [ ] pushed; `HANDOFF.md`
