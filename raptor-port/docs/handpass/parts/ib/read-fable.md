# The Inputs / schedule batch — Fable's blind read of the finished code (13 Oct 26)

Read at commit `3abd5d03f` on `claude/inputs-schedule-batch`, from the brief
`docs/superpowers/briefs/2026-10-13-inputs-batch-read.md`. Blind: the builder's own check, the other reader's and the
walker's files were not opened. No file of the app was changed. One existing unit-test file was run (`src/ui/oilwait.test.tsx`
— 42 passed). Nothing was built; no browser test was run.

## Findings, ranked

### F1 — LOW (robustness, new in this change): the put-back's one command can commit its answer and not its put-back

**Setup.** An input taken off the programme that needs an OIL answer; the scheduler presses Accept, the question is put,
and between the tried save and his answer something makes the put-back refusable (the only way in: an Undo made from the
keyboard under the modal sheet that gives the input a row on another saved week, or any other change the modal cannot stop —
the sheet is modal, so in ordinary use this cannot happen).
**Action.** He answers Yes / No and presses "Put back".
**What happens.** `run(x, oil)` (`src/ui/interactions.ts` 703–705) saves through `saveBatchX` a body that FIRST writes the
answer (`commitInputEdit(…, { sched: true, oil })` — the OIL map and the change stamp) and THEN calls `acceptInput`. When
`acceptInput` returns false the body only *answers* false; `runInputWrite` ignores the return, so the command COMMITS with
the answer written and no put-back; `saveBatchX` reports `ok:false` (`content` false), and the else branch says "… is
already on the programme — on …; load that week" / "… can't be changed here right now". The sheet promised one step; half
of it was kept, and an Undo takes back only the answer.
**What should.** The whole command rolls back, as the shape fixed under `[INPUT-SAVE-SAYS-OK-WHEN-REFUSED]` requires — the
idiom `ownPartSave` uses (`src/ui/inputedit.tsx` 504–510: "a batch whose body only ANSWERS false is still committed … so a
refusal inside THROWS").
**Cause.** `src/ui/interactions.ts` line 704: `… && !!commitInputEdit(…) && !!acceptInput(di, find(), dest)` — the refusal of
the second write is a plain `false`, not a throw, and the first write stays.
**Fix, step by step.**
1. In `src/ui/interactions.ts` add `import { CmdRefused } from '../command'` (as `reqdoor.ts` line 70 and `inputedit.tsx`
   line 47 do).
2. Lift the else branch's refusal words (lines 747–756: `onProg` / `away` / "can't be changed here right now") into a small
   function `refusalWords(inp): string` inside the handler, used by the else branch.
3. Replace line 704's body with:
   `saveBatchX(() => { const x = find(); if (!x || !commitInputEdit(x, draftOf(x), undefined, undefined, { sched: true, oil })) return false; if (!acceptInput(di, find(), dest)) { HOOKS.toast(refusalWords(find() || x), 'warn'); throw new CmdRefused('the put-back was refused') } return true }).ok`
   — the toast is said inside so `saveBatchX` sees `spoke` and does not add "Not saved — …" (its own rule at line 1387).
4. In the else branch, say the refusal only where the body did not already: `if (!oil) HOOKS.toast(refusalWords(inp), 'warn')`.
5. Pin it in `src/ui/oilwait.test.tsx` beside the D793 block: take an input off, press Accept, then before answering make
   `acceptInput` refuse (the simplest: stub `rowElsewhere` to answer a row on another week, or set the week protected), answer
   Yes, and assert `rec().oil` is still `{}` and `rec().acc` still `'r'`, and that `world()` is unchanged.
**Confidence.** High that the shape is as described (read, not run); low that a user reaches it today. New in this change.

### F2 — LOW (a pin that may not pin): the "→ Unavail asks nothing" test can pass having tested nothing

**Where.** `src/ui/oilwait.test.tsx`, the test `'"→ Unavail" (an Other filed under Unavailable) asks nothing …'`.
**What happens.** After `file(['bane'], SAT, …, { type: 'Other' })` and `press('x')` it reads
`if (rec().acc !== 'r') return` — if the Other was not landed by the holder base (then there is nothing to take off and `acc`
stays undefined), the test returns green without pressing "→ Unavail" at all. The thing D793's reading (a) promises — that the
Unavailable filing asks nothing — is then not pinned.
**What should.** The premise is asserted, as `takenOff` asserts it two helpers up (`expect(rec(di).acc).toBe('r')`), or the
test makes the input dormant explicitly before pressing 'u'.
**Fix.** Replace the `if (…) return` line with `expect(rec().acc, 'the premise: an Other lands on read and was taken off').toBe('r')`.
If that assertion fails on the host's run, the Other does not land on read in this test world and the test should set it up
through the window's own Save with `toGround`, then take it off. (An Other IS an activity — `isPersonal` reads `grp:'act'`,
`engine/overlay.ts rowMayStand` lands it — so the premise should hold; this is a test-shape finding, no app code changes.)
**Confidence.** High. New in this change.

No finding at MEDIUM or HIGH.

## The builder's readings, each ruled

- **(a) the door is the scheduler's Accept (`[data-acc="g"]`) and "→ Unavail" asks nothing** — SUPPORTED. `press()` asks only
  for `dest === 'g'` and only where the input is off the programme (`off(r)`: `acc` neither `'g'` nor `'u'`); `'u'` files an Other
  under Unavailable, where it stands on no programme row (`acceptInput` line 504 writes `acc='u'` and no row). One note: "→ Ground"
  on an Other shares the door and the words ("Putting … back on the programme" / "Put back"); that is right as built, because an
  Other with the button showing is either taken off (`'r'`) or one the issued day placed and a load dropped (the holder base lands
  every other activity on read — `engine/overlay.ts` 417–434 — so "Accept"/"→ Ground" never shows for a first landing).
- **(b) the take-off asks nothing** — SUPPORTED. `if (dest === 'x') run(inp)` goes straight to `unacceptInput`.
- **(c) the app's Undo of a take-off puts the input back and asks nothing; "OIL?", the one list and the bell go on** — SUPPORTED.
  An Undo is a restore, no door; after it `acc` is `'g'` again, so `oilUnansweredDay` (which answers '' only for `'r'`) lights the
  tag and the bell. Pinned by the test "an Undo of the take-off …".
- **(d) tried and thrown away first; a refused put-back is refused in its own words, nobody asked** — SUPPORTED, with a caveat.
  `dryRun(() => !!acceptInput(di, find(), dest))` tries the put-back inside a refused command (`tryInputsBatch`); on `false` the real
  `acceptInput` runs and the else branch speaks. The caveat: the try covers `acceptInput` only, not the `commitInputEdit` the
  answered run also makes — I found no way the second can refuse where the first passed (the edit's own refusals —
  `protectedInput`, `mayEditInput` for an admin, `normalizeInputDraft` which the gate already ran — are all covered or impossible
  for a record the app saved), so the gap is theoretical; F1 is what happens if it ever is not.
- **(e) answered, the answer first and the put-back second, in ONE command, one Undo** — SUPPORTED (the test "answered: …" pins
  one Undo taking both away; `writeInputsBatch` suppresses the inner `markEdit` pushes). F1 is the one way the two halves part.
- **(f) the words** — SUPPORTED: `WAIT_WORDS.back` and `CHANGED.back` in `src/ui/oilwait.ts` read exactly as the brief lists.
  (Typography nit, not a finding: the sheet's lead uses a straight apostrophe — `Putting ${who}'s …` — while every button uses the
  curly one `Don’t put back`; the browser test even normalises it. Make the lead `${who}’s` for one look.)

## Every door that puts an input on the programme

| Door | Asks? | Should it, by the rulings? | What the screen says if it does not |
|---|---|---|---|
| Accept on the card/line — edit week and board (`html.ts accBtns`, routed in `interactions.ts`) | YES where unanswered and the day applies | Yes (D793) | — |
| "→ Ground" on an Other (same `data-acc="g"`) | YES, same door | Yes (D783: an add that raises the question waits) | — |
| "→ Unavail" on an Other (`data-acc="u"`) | No | Right — not on the programme | "… filed under Unavailable" |
| The board's Ground "+ Inputs" (`commitNewInput(…, toGround)`) | The new input's own window asks at Save (`oilGate`, pre-existing) | Yes (D660) | — |
| The input's own window — edit, retype of a dormant one (wakes it: `commitInputEdit` line 1290; the holder base lands it) | The window's Save asks before the write (`inputedit.tsx` 2547, 2603) | Yes | — |
| A move of its date (Inputs calendar drag, `caldrag.ts` → `oilFirst 'move'`) | Asks; a `'r'` input stays `'r'` after the move | Yes | — |
| A load, a plan switch, a week change (`state/holderbase.ts` → `engine/overlay.ts`) | Never asks; lands only requests that are not `'r'`/`'u'` (D174/D176) — a plan carrying a taken-off request's row leaves the card reading Accept, whose press adopts it THROUGH the asking door | Right | n/a (a `'r'` input is never put on by a load) |
| A load of an older issued version (D363, D98) | Puts back every row the version had, asks nothing | Right as ruled (D363 "left as built") — a document restore, not a scheduler's act | the pending list names it |
| Undo / Redo | Never ask | Right (D793 reading 3) | — |
| The working-out after every command (`afterCommandPass` → `rederive`) | Never asks; `'r'` and `'u'` "stay" (holderbase line 196) | Right | — |
| Publish / Unpublish | Change no filing; `'r'` at issue stays unlanded on read (overlay 430) | Right | — |
| The one list / the bell (D782, D783) | Lists only inputs `oilUnansweredDay` answers for — never a `'r'` one | Right: a taken-off input flags nothing until Accept, where it is asked | — |
| The row's own door (`reqdoor.ts rowPut/rowMove`), the Unavailable row's person (`reassignInput`) | Ask (built before this change) | Yes | — |

## The state table — cells that are wrong or unproved

- **(question up) × (the take-off undone from the keyboard under the sheet, if that shortcut fires)** — the answer then meets
  `!off(x)` and the app says "That input has changed — not put back" while the input IS back on the programme, and the answer
  he just gave is dropped (the tag and the bell go on asking). The swap doors behave the same; unproved whether the shortcut
  reaches under a Sheet. Low.
- **(bar up) × (Accept on another input)** — `holdForOil` clears the first bar without a word (`setOilBar(null)`), as every door
  does. By design; unproved on screen.
- **(bar up) × (the input's own window answers meanwhile)** — "Answer OIL" puts it back at once with the ordinary "added to the
  ground programme" note and no question: right by the documented design ("nothing left to ask"); unproved by a run.
- **(bar up) × (the day published meanwhile)** — "Answer OIL" re-tries, asks again, and the answered put-back is the issued row's
  round trip (`acceptInput` 539–579, its `rid`) counted as one pending change (D103 wipes the sign-offs through the existing
  binding). Right by reading; unproved by a run — the walker should do it.
- **(bar up) × (holiday removed)** — "Answer OIL" → gate `'none'` → put back, no question. Right.
- **(bar up) × (input deleted)** — "That input has changed — not put back". Right.
- **(bar up) × (OIL Earn on / page / week / sign-in changed)** — bar and wait taken away (`view.ts` 42, 570, 995–996). Right.
- **A shared input** — one answer written for everyone (`commitInputEdit` line 1253; D762); the sheet's heading names the first
  man ("OIL — Ranger, Training") while the lead says "Putting 4 people's Training back…". The input's own window and the calendar
  drag head the same question the same way (`inputedit.tsx` 2547, `caldrag.ts` 166), so this door is consistent with them —
  only the row's add/move doors name the group (`reqdoor.ts` 277, 378). Not a finding; a wording the owner may want to see.
- **An input of several days whose row stands on another loaded day** — its card reads "Undo · Sat", never Accept; not this door.
- **A locked week** — the try fails, `acceptInput` refuses quietly, the else branch says "can't be changed here right now".
  Right; no unit test pins it — the walker should press Accept on a locked week.
- **The adopt** (row back with a plan, request `'r'`) — the try passes (`acceptInput` 521), the question is put, the answered run
  adopts; the words name the strays. Right by reading.

## Explicit negatives — checked and found nothing

- **One command, one Undo; Redo** — the answer and the put-back ride one `writeInputsBatch`; Undo removes both (pinned); Redo
  replays the one command, answer and filing together. Nothing found beyond F1.
- **The change history and the bell** — `state/changelines.ts` writes two lines from the one envelope ("filed: taken off → on the
  programme" and "OIL: — → Yes"), none doubled (no second writer in the handler — the comment at 735–738 holds). The bell
  (`state/notices.ts common`) has NO part for an OIL answer, so what the scheduler answers tells nobody (D781); the people in the
  input get the existing "back on the programme" line (D755 (3)), never the actor.
- **A published day (D103)** — nothing is written while the question stands (the tried batch's marks, `SCHED.added`, the notices
  — all in the snapshot `histSnap` restores: `history.ts` 25, 64); answered, the filing is one pending change and the sign-offs
  fall by the existing binding. The unit test pins 0 → >0.
- **What `dryRun` leaves behind** — rules re-run after the try (`tryInputsBatch` → `validate()`). I traced the one piece of
  module state the try touches that no snapshot holds: `acceptInput` → `markStructuralAdd` → `HOOKS.flashAdded('gr:di.ri.prog')`
  puts the key in `view.ts FRESHADD` for 6 s. Harmless: a new landing is placed at the END of the day's ground rows
  (`placeRequestRow`), so after the rollback no element carries that address, and the issued round-trip (`rid`) returns before
  `markStructuralAdd`. Only if the scheduler adds a row within 6 s does it wear the blue box — a row that is fresh anyway.
- **The stale-record trap** — `find()` is read afresh at every step; the `inp` captured at the top is used only for the take-off
  (no try before it) and as the argument the fresh `x` is passed in as.
- **The armed place** — `armWas` read before the write, `disarmSlot` when the armed row key moved; the oil path skips
  `afterSchedMutate` (right — a second `markEdit`/`histPush` would be a second step) and so its `armStale()`/`armTargetExists`
  sweep, but the holder base's own after-command pass puts a stale arm down, and the row an Accept adds goes at the end.
- **The toast said twice or not at all** — one `ok` note on success; on a refused try one warning. The two ways to a doubled
  note (the body refusing with its own sentence, or the commit gate refusing a command the try passed) are unreachable for a
  record the app saved; F1's fix keeps it to one.
- **`who` / `lead` words** — one person: his callsign; several: "N people" (`howMany`); ALL AVAIL: the placeholder is a PEOPLE
  entry (`special`, `cs:'ALL AVAIL'`) so it prints "ALL AVAIL" — the same words the success note already used.
- **The flash (`places`)** — `sel:[data-acck="…"]` is re-queried at flash time, so a redrawn button is found; every card of a
  multi-day input flashes (the board's and the week's alike). The id is `i` + base-36, safe in a selector.
- **The gold dot** — `seatInputLines` is the ONE body both the dots' pass and `storyOf` call with the same key and day, so a dot
  and a bubble cannot disagree on a programme seat; the `.xN` places parse (`^g:(\d+)\.(\d+)(?:\.x\d+)?$`); the `.+` box does not
  and gets none; a version look / View-only is excluded by `LOOK`; a seat whose row's input was since deleted still answers for
  the man's lines by id (consistent on both sides); ALL AVAIL on the row is matched by its id like a man. Cost: one filter over
  that input's lines per seat of an input's row, on top of a `byInp` map built once per pass — no new whole-log scan. One
  pre-existing asymmetry (not new): `byInp` indexes a line by `iids` only when it has them, `storyOf` by `iid` OR `iids` — the
  `iu:` rows had this before.
- **The removed field (`mates`)** — no reader left in `src` (the `mates` in `board-html.ts sbInpRow` is a different thing, the
  line's faces); `foldedWords` reads "· N people" from `people` as before, `|| 1` where it read `(mates||[]).length + 1`
  (always 1 since the one-rule build) — the "to go out" line reads the same.
- **The test-run fix** — `caldrag.ts installClickEater`'s `off` returns where `document` is undefined; nothing else in it
  reaches the page. Pinned in `barmove.test.tsx`.
- **No `notify()` after a failed try in `press()`** — `oilFirst` and `reqdoor gated` call `notify()` there ("every screen reads its
  records again"); `press()` does not. I found no visible consequence (the world is restored byte for byte, no window of the
  input is open at an Accept, the warning note draws itself); worth one line for parity, not a finding.
- **`reconcileIssuedMarks` skipped in the oil path** — the holder base's after-command pass re-bases a published day's marks
  (`rebaseDayPending`), so a stale "changed" mark on the round-tripped row is not expected; unproved by a run.
- **The record's own fields after the answered put-back** — the edit is a no-op but for `oil`, `modBy/modAt` (the change stamp)
  and `yr` re-anchored to the loaded week's year; `mod` (the late date) is left (D741, `sched:true`); `by/at` untouched (D629).

## What I did not read

The branch's documents (not my subject) — one line only: `docs/ui-contracts.md` line 4476 still reads "TO BE BUILT … Today the
Accept asks nothing", and the D793 line in `.claude/rules/decisions/oil.md` still ends "NOT YET BUILT"; both will be stale the
moment this merges. Also not read: `ui/OilDayList.tsx`; the Leave War side; the browser test's helpers (`fileIt`, `whollyIn`);
the bodies of `engine/oil.ts repricedOil/voidedOil`, `engine/overlay.ts placeRequestRow`, `state/holderbase.ts` beyond the
landing rule; the unit tests' `boot/file/riOf/world` helpers; `src/ui/reqdoor.test.tsx` was read in diff but not run.
