# The Inputs / schedule batch — a fresh, blind read of the finished code (Opus, 13 Oct 26)

Read at `3abd5d03f` on `claude/inputs-schedule-batch`, against the brief `docs/superpowers/briefs/2026-10-13-inputs-batch-read.md`.
Blind: the builder's check sheet, the walker's brief and every other file of this folder were not opened. No file of the
app was changed. Run: `npx vitest run src/ui/oilwait.test.tsx` (42 passed) and `npx vitest run src/ui/reqdoor.test.tsx`
(57 passed), one at a time. Nothing else was run; every case below that I could not run names the exact input for the
host to run before it is believed.

*(While I read, the branch's head moved on by one documents-only commit — `git diff 3abd5d03f HEAD -- raptor-port/src
raptor-port/e2e` is empty — and someone else added 15 uncommitted lines to `src/ui/oilwait.test.tsx`. That edit is not
mine and I did not read it; I cannot say whether my run of that file was before or after it.)*

**Count: 0 high · 1 medium · 5 low.** Look first at F1 (a wrong "edited" mark left on a published day) and F2 (the
question for an input of several is headed with one man).

---

## Findings, ranked

### F1 — MEDIUM — put back WITH its answer on a published day that went out with the row: the row's name box keeps a "goes out as ALn" mark it should not have

- **Setup.** A day is published with an input's row on its Ground Programme (the issued version holds the row). The day
  is then made a public holiday, its list left for later (the input has no OIL answer). A scheduler takes the input off
  the programme (the day reads pending).
- **Action.** "Accept" on its card → the question → Yes or No → "Put back".
- **What happens.** The row goes back at its issued place with its issued id (correct). But `SCHED.pending` now holds
  `gr:<di>.<rid>.prog` for it, so the row's NAME box wears the pending mark ("Edited — goes out as ALn") although the
  row is exactly what was issued. Nothing in the "To go out" list answers for that mark (the list is worked out from
  the day's difference, not from the marks). It stays until the next schedule edit on that day, a change of the
  request, or the next publish.
- **What should happen.** No mark on a row that is as issued — which is what the SAME press does when no question is
  needed (the input already answered): the mark is dropped.
- **Cause.** `engine/slots.ts:538–580` — putting an issued landing back takes the "round trip" path and ends in
  `markEdit('gr:di.ri.prog')` (line 578), whose comment says why: "mark the edit (so the funnel's history + reconcile
  run)". The reconcile is `reconcileIssuedMarks()` in `state/view.ts:1362` (`rawSchedEpilogue`), reached through
  `view.afterSchedMutate()`. The new answered path skips that call on purpose — `ui/interactions.ts:741`
  `if (!oil) view.afterSchedMutate()` — and nothing else in an input batch runs the reconcile
  (`state/store.ts runInputWrite` ends in renderInputs / reflow / histPush; `state/sched-commit.ts applyEnd` has none).
  The after-command pass then keeps the mark: the row is unchanged in the view, so `state/holderbase.ts:184`
  `setMarks(di, base[di].m)` writes back the marks it absorbed, the stale one among them.
- **Fix, step by step.**
  1. `ui/interactions.ts:19` — add `reconcileIssuedMarks` to the import from `'../engine/drafts'`.
  2. `ui/interactions.ts:704` — make the answered body run the reconcile inside the same command, after the put-back:
     `saveBatchX(() => { const x = find(); if (!x || !commitInputEdit(x, draftOf(x), undefined, undefined, { sched: true, oil }) || !acceptInput(di, find(), dest)) return false; reconcileIssuedMarks([di]); return true }).ok`
  3. Pin it (in `ui/oilwait.test.tsx`, the D793 block): `await boot(); file(['bane'], SAT); sign(SAT); commitSetDayApproved(SAT, true); press('x'); press('g'); expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true); expect(Object.keys(SCHED.pending).filter(k => /^gr:/.test(k))).toEqual([])`.
- **Input for the host (not run by me).** The test in step 3 as it stands today — I expect one `gr:5.<rid>.prog` key.
  Control: the same with `file(['bane'], SAT, { [SAT_ISO]: 0.5 })` (answered before, so no question) — I expect `[]`.
- **Confidence** 75% (read, not run). **New in this change** — on `origin/main` every Accept ended in `afterSchedMutate()`.
  The existing test "on a PUBLISHED day nothing waits…" publishes AFTER the take-off, so the issued version does not
  hold the row and this path is never taken by a test.

### F2 — LOW — the question for an input of several people is headed with one man

- **Setup.** An input for three people (joined in the order Pike, Bane, Ace), no OIL answer, on a holiday, taken off.
- **Action.** "Accept".
- **What happens.** The sheet's title reads "OIL — Pike, Range brief" (the first to have joined), while its own bold
  line reads "Putting 3 people's Range brief back on the programme" and the answer is written for all three (D762).
- **What should happen.** "OIL — Ace +2, Range brief" — the heading every other door of the question uses for an input
  of several (`ui/InputsPage.tsx:379–383`: "headed for EVERYONE the one answer is written for (D762) … as every other
  door of the question says it", fixed there as RX2-2; `ui/reqdoor.ts:277, 378`; `ui/inputedit.tsx:3011`).
- **Cause.** `ui/interactions.ts:785` — `gate: { who: g.who, … }`; `oilGate`'s own `who` is the callsign of
  `draft.person`, the record's lead (`ui/inputedit.tsx:737`).
- **Fix.** (1) `ui/interactions.ts:32` — add `inputWho` to the import from `'./inputedit'`. (2) line 785 —
  `gate: { who: inputWho(now) || g.who, typeLabel: g.typeLabel, plan: g.plan, prev: g.prev }`. (3) Pin:
  `file(['pike','bane','split'], SAT); press('x'); press('g'); expect(view.OILWAIT!.gate.who).toBe(inputWho(rec()))`.
- **Confidence** 90%. **New in this change** (the door is new). The same lead-only heading stands at the two older
  doors of `oilFirst` (`ui/inputedit.tsx:1444` — the Unavailable row's swap in an input of several, and the calendar's
  drag): older code, not this change's; one line each if he wants them alike.

### F3 — LOW — History's gold dot: a man put on an input's row by REPLACING its only person wears no dot and has no bubble

- **Setup.** History on. "Range brief" for Ranger alone on Wednesday's Ground Programme (a working day — no OIL question).
- **Action.** Drop Tally from the crew list on Ranger's puck (D755 (2): he replaces him).
- **What happens.** The changes window lists "Range brief 15 Jul · whose: Ranger → Tally". Tally's puck on the row wears
  no gold dot and its bubble says nothing — the fault `[HIST-DOT-INPUT-ROW]` describes, for the other way of putting a
  man on the row.
- **What should happen.** By the promise as worded ("the puck of a man put on an input's row … wears the gold dot and
  its bubble tells the line that put him in"): a dot, and a bubble telling that line.
- **Cause.** `ui/histbubble.ts:334` keeps only lines marked `one`; a replacement in an input of one is written as the
  hand-over line, without it — `state/changelines.ts:138` (it carries the new man in `sub`, by `at()`'s default,
  line 109). It must not simply take `one`: that mark also narrows an Unavailable row's story and keeps a name on the
  changes window's line.
- **Fix.** (1) `state/changelines.ts:138` — `base({ from: cs(B[0]), to: cs(A[0]), fld: 'whose' })` (`fld` is stored and
  read back only beside `sub`, which this line has — `engine/editlog.ts:493, 181`; its other readers ask it only of
  Quals, postings and Blue/Red lines — `ui/changesmodel.ts:249–251, 299`, `ui/pendlist.ts:249–250`,
  `ui/histbubble.ts:346`). (2) `ui/histbubble.ts:334` —
  `return of.filter(r => (!!(r as any).one || r.fld === 'whose') && String(r.sub || '') === who && (!day || rowTouches(r, day)))`.
  (3) Pin, in the new describe of `ui/reqdoor.test.tsx`: `file(['bane']); expect(rowPut(rowKey(), 'split')).toBe('done'); await Promise.resolve(); const { root, els } = page(keyOf('split')); view.setHistMode(true); refreshHistDots(root); expect(els[0]!.hasAttribute('data-histdot')).toBe(true); expect(storyOf(els[0]!).length).toBeGreaterThan(0)`.
- **Input for the host.** Step 3 as the code stands — I expect `false` and `0`.
- **Confidence** 90% on the behaviour; whether the promise means this case is the host's to rule. **Older gap** (since
  the one-rule build); the change's fix covers the "added" line only. Lines already stored carry no mark (D56 — not a
  finding).

### F4 — LOW — the tried put-back leaves the "just added" flash armed for six seconds

- **Setup.** The Scheduler Board; an input that needs an answer, taken off, on a day not published (or published
  without its row).
- **Action.** "Accept" (the question) → "Don't put back" → the top bar's Undo, all within six seconds.
- **What happens.** The take-off is undone and a row comes to stand at the place the tried put-back used; that row
  wears the blue "just added" box for what is left of the six seconds, though nothing was added. A second effect of
  the same leftover: answered within six seconds, the real put-back's box is taken down early (the tried run's own
  timer removes the shared key).
- **What should happen.** "Nothing moves" — a tried save leaves nothing behind.
- **Cause.** The tried run is `acceptInput` (`ui/interactions.ts:775`), which ends in `markStructuralAdd`
  (`engine/slots.ts:588` → `engine/publish.ts:1105` → `HOOKS.flashAdded`). `state/view.ts:1188–1207` adds the key to
  `FRESHADD` and arms two timers; that set is view state, "never in a history snapshot", so the rollback in
  `state/store.ts:273–288` does not put it back. (The other tried doors save through `commitInput`, which never
  flashes — this door is the first to reach it.)
- **Fix.** `state/store.ts tryInputsBatch` — silence the flash for the try:
  `const flash = HOOKS.flashAdded; HOOKS.flashAdded = () => {}; try { commitInputsWith([], SCHED_TYPES.inputsBatch, …as now…) } finally { HOOKS.flashAdded = flash }`.
  Pin: `takenOff(); press('g'); expect([...view.FRESHADD]).toEqual([])`.
- **Input for the host.** That pin today — I expect one `gr:5.<n>.prog` key.
- **Confidence** 85% on the leftover; the on-screen box needs a walker (cosmetic, six seconds). **New in this change.**

### F5 — LOW — "Answer OIL" after the input's dates were changed uses the day of the card that is no longer there

- **Setup.** Saturday a holiday; the input taken off; "Accept" → "Don't put back" (the bar stays, the page works).
  Open the input from its line, move it to the Saturday of the NEXT week, answer its own window's question, Save. It
  stays "taken off".
- **Action.** "Answer OIL" on the bar.
- **What happens.** Nothing is left to ask, so the put-back is made — with the day index the first press captured:
  a row is written on a Saturday the input no longer covers, the after-command pass takes it away again, and the
  input ends neither taken off nor on this week's programme. The note says "…added to the ground programme"; the
  history says "filed: taken off the programme → not on the programme".
- **What should happen.** "That input has changed — not put back" (the words this kind was given for exactly this), and
  the input left as it was.
- **Cause.** `ui/interactions.ts:786–787` — `redo` and `ask` test only `off(x)` (its filing); `di` (line 668) is the
  closure's. `engine/slots.ts acceptInput` does not ask whether the input covers `DAYS[di]`.
- **Fix.** (1) `ui/interactions.ts:9` — add `inputCoversDate` to the import from `'../engine/inputs'`. (2) inside `press`,
  beside `off`: `const here = (x: any) => !!DAYS[di] && inputCoversDate(x, DAYS[di].dt)`. (3) lines 786–787:
  `redo: oil => { const x = find(); return !x || !off(x) || !here(x) ? 'none' : run(x, oil) ? 'done' : 'refused' }` and
  `ask: () => { const x = find(); return !x || !off(x) || !here(x) ? 'none' : press() }`.
- **Input for the host.** `takenOff(); press('g'); leaveOilWait(); const r = rec(); commitInputEdit(r, { ...draftOf(r), start: '2026-07-25', end: '' }, undefined, undefined, { oil: { '2026-07-25': 0 } }); SAID = []; oilBarAgain()` — I expect
  `SAID` to hold "added to the ground programme", no row on Saturday, and the record's `acc` gone.
- **Confidence** 70%. **New in this change** (the bar is what keeps a day index alive after its card has gone). Moved
  within the SAME week it comes out right by itself (the pass lands it on its own day).

### F6 — LOW — the same stray 350ms timer stands unguarded in the puck drag

- **What.** Fix 4 guards `ui/caldrag.ts:264–269`. Its twin, which the calendar's was copied from, is
  `ui/drag.ts:821–828` (`dropEat`, `setTimeout(dropEat, 350)`): the same reach for `document` after a pointer drop.
  A test file that ends inside those 350ms after a puck drop goes red the same way, with every test passed.
- **Fix.** `ui/drag.ts:822` — first line of `dropEat`: `if (typeof document === 'undefined') return`.
- **Confidence** 60% that it can bite (it needs a test that ends within 350ms of a real-timer pointer drop). **Older
  code**; nothing a person sees.

---

## The builder's readings, each ruled

- **(a) "→ Unavail" asks nothing — THE OWNER'S TO DECIDE.** The letter of D793 ("put back on the PROGRAMME") supports
  it. But the effect is the one D793 closes: an Other input asks the OIL question (`engine/inputs.ts:638–647`), a
  taken-off one is dormant (no "OIL?" tag, no bell, not in the one list), and "→ Unavail" on a holiday wakes it —
  from that press it needs an answer, and answered Yes it earns — with nobody asked at the scheduler's own press.
  Afterwards the "OIL?" tag, the one list and the answerer's bell say so. Recommended question for him, in his words:
  "Sports day (an Other), taken off, its Saturday since made a holiday — the scheduler presses '→ Unavail'. Ask the OIL
  question first, as Accept now does, or leave it to the 'OIL?' tag and the bell?"
- **(b) the take-off asks nothing — SUPPORTED.** Nothing is raised by taking an input off (both doors: the card's "Undo",
  `ui/interactions.ts:791`; the board row's ✕, `ui/board.ts:1098`).
- **(c) an Undo of the take-off asks nothing; the tag, the list and the bell go on saying it — SUPPORTED** (D793's own
  reading 3). The three are worked out live from the record (`oilUnansweredDay`, `oilOpenOn`, `oilPendingFor`), all of
  which leave out only a taken-off input.
- **(d) the put-back is tried and thrown away first — SUPPORTED by the code**, with one note: the try runs
  `acceptInput` alone, the real answered run adds the answer's save in front of it. I found no refusal the second can
  meet that the first cannot (see U2).
- **(e) the answer first, the put-back second, one command, one Undo — SUPPORTED**, with F1 (what the one command does
  not do that the old path did) and U1 (what it would keep if the put-back were refused inside it).
- **(f) the words — SUPPORTED as D783's pattern** ("Don't swap / Swap / Not swapped — OIL not answered"); they are new
  words on screen he has not seen, so they belong on his look card.

---

## Every door that puts an input on the programme

| Door | Question put? | Should it be, by the rulings? | If not, what the screen says |
|---|---|---|---|
| "Accept" on its card or line — Edit Schedule's week | yes (`routeClick`) | yes — D793 | — |
| "Accept" — the Scheduler Board's Personal Inputs | yes (the same handler; the control is not drawn in OIL Earn for a kind that asks) | yes | — |
| "→ Ground" (an Other) — both | yes | yes | — |
| "Accept" that adopts a row already standing (a plan switched in) | yes | yes | — |
| "→ Unavail" (an Other) | no | the owner's — reading (a) | row under Unavailable; "OIL?" tag, the one list, the bell |
| the board's Ground "+ Inputs" (a new input, straight on) | the window's own question at Save (Cancel writes nothing) | yes — older rule, 28 Aug 26 | — |
| the input's own window — a taken-off input RETYPED (it counts again and lands after the save) | the window's own question at Save | yes — older | — |
| its window, its line's typed times and remark — dates, hours, words | stays taken off: nothing lands | n/a | — |
| a move of its date (the calendar's drag) | stays taken off; the drag asks its own question (D783) | n/a | — |
| a week loaded | a taken-off input is never landed; one never landed is, with nobody asked | no — a load never asks | "OIL?" tag, the list, the bell |
| a saved plan switched in | the row may stand again while the request still reads "taken off"; no question | no | the card still offers Accept (which asks) |
| "Load onto working copy" of an older version | the filing the version froze is put back — on the programme, nobody asked (`engine/drafts.ts:670–671`) | not named by D793 (its reading 1 is the Accept); D98 needs the load to get the day back | the load's own note; "OIL?" tag, the list, the bell |
| Undo of the take-off; Redo of a put-back | no | no — D793 reading 3 | tag, list, bell |
| the working-out after every command | never lands a taken-off input | n/a | — |
| publish, unpublish | neither changes a filing | n/a | — |

No door was found that puts a taken-off input on the programme by a hand's press without the question, other than
"→ Unavail" (which is not the programme) and the version load.

---

## The state table — the cells that are wrong or unproved

Wrong: F1 (answered × a published day that went out with the row), F2 (question up × an input of several), F4 (any
state × the tried put-back), F5 (bar up × the input re-dated → "Answer OIL").

Unproved:

- **U1 — answered × the put-back refused inside the command.** `saveBatchX` commits a body that only ANSWERS false
  (`ui/inputedit.tsx:1384`; the lesson is written at `ownPartSave`, line 496). The answered body is
  `commitInputEdit(…) && acceptInput(…)`: were `acceptInput` to refuse after the answer was written, the answer alone
  would be kept — a step of its own, the input still off. I found no way a hand reaches it (the try has just passed on
  the same world, and the sheet holds the keyboard), so it is not a finding. The safe form, if wanted:
  `if (!acceptInput(di, find(), dest)) throw new CmdRefused('the put-back was refused')` (as `reqdoor.ts:229` does).
- **U2 — the try is not the whole answered body.** `commitInputEdit`'s refusals were read one by one (who may edit, a
  locked week, a draft that will not normalise, the medical plans, the absence rules — which do not re-judge a change
  of filing or of answer): none can refuse here where the gate asked and `acceptInput` passed.
- **U3 — a second question takes the bar away.** With "Not put back — OIL not answered" standing, an Accept on another
  input (or any other door's question) clears it unsaid (`ui/oilwait.ts:43`). The one-bar rule is every kind's, not
  this change's; D783 says the bar "stays until tapped".
- **U4 — Redo of the answered put-back.** Not run. By the restore rules the day's row and the answer come back and the
  filing is worked out from the row. Input for the host: after the "answered" test's `globalUndo()`, `globalRedo()` →
  the row there, `acc` 'g', the answer `{ [SAT_ISO]: 0.5 }`, no question.
- **U5 — the flash on a button.** The place is the Accept button itself (`sel:[data-acck="…"]`), on every day's card of
  a several-day input; nothing flashes where its panel is folded. Whether a `<button>` shows the veil is the walker's.

Right as read (every other cell): Yes / No / some days → one command; "Don't put back", ✕, Escape, a press outside →
the bar, nothing written; "OK" only closes; "Answer OIL" with it already back, deleted or answered → "has changed" or
simply made; the holiday removed meanwhile → made at once, as an answered one is; Undo and Redo once and twice; the
week, the page, the sign-in, the member view (it changes the page) and OIL Earn take the question and the bar away;
a locked week or a row on another week is refused in its own words before anybody is asked; the adopt.

---

## Explicit negatives — checked, nothing found

- **One command, one Undo.** The nested save joins the outer batch, history pushes are swallowed, and the second
  command the old path made is skipped; the test pins one Undo taking both. (F1 and U1 are what that one command
  leaves out or could keep.)
- **The change history and the bell.** One command gives one "filed" line and one "OIL" line
  (`state/changelines.ts:155–156`). The bell tells the input's people "put back on the programme" (as before); an OIL
  answer is no part of a notice (`state/notices.ts common`) — D781 holds. A tried put-back writes no line and no
  notice: it is refused before the command's end.
- **A published day.** Nothing pending and no sign-off touched while the question waits (marks and book are in the
  rollback). After the answer the put-back and the answer wait to go out. F1 is the one fault.
- **What `dryRun` leaves.** The rules are run again on the world as it stands; no undo step, no history line, no
  notice, no saved row. Left behind: F4 only.
- **The stale-record trap.** The rollback re-makes EVERY input and every day as new objects
  (`state/history.ts:96–97`). `press` reads `find()` afresh after the try; the outer `inp` is not used on this path;
  `g` holds plain values. No reference is kept across it.
- **The armed place.** Read before the write and compared after in both paths (line 702, 706); the try does not put
  it down (the rollback is `histRestore`, not `histApply`).
- **The toast.** Once on every path a hand can take. (Answered and then refused would say two in a row — U1's path.)
- **The words for one, several, ALL AVAIL.** The bold line reads "Ranger's…", "3 people's…", "Ranger and ALL AVAIL's…",
  "ALL AVAIL's…" — the pattern of the note that follows. The sheet's title is F2.
- **The gold dot.** The dot and the bubble ask one function with one test (`seatInputLines`), so they agree on the
  board and the edit week; a version look draws no seat address and is excluded twice; View-only Sched is wired for
  neither. Cost: one lookup and a short filter per programme seat, the history capped at 2,000 lines. A row whose
  input was deleted is taken away by the after-command pass; a dead "kept" row answers the same for both. `.x`
  places and ALL AVAIL on the row are matched. F3 is the one gap.
- **The removed field.** No reader of `PendItem.mates` is left in `src`, `e2e`, `probes` or `scripts`; nothing set it
  on `origin/main`; the three expressions give the same words with it gone ("· N people", the fold's test, the inner
  call).
- **The timer.** The guard is right for the calendar's drag; F6 is its twin.

**Notes that are not findings.** (1) Three comments still name three kinds and the older doors only — `state/view.ts:407`,
the head of `ui/oilwait.ts` and of `ui/OilWaitSheet.tsx`. (2) Two new tests prove less than they read: the "plain
programme row beside it" test asks a row index that does not exist (`riOf() + 40`), and the "→ Unavail" test returns
early, passing, if its premise fails.

---

## What I did not read

The browser test's helpers and the walk; `ui/OilDayList.tsx`; `ui/caldrag.ts` beyond its timer and gate; the command
layer's own phases (`src/command/`) — taken from the comments of `state/sched-commit.ts` and `state/store.ts`; the
credit pass in `engine/oilev.ts` beyond how it reads a filing; the stylesheets beyond the flash and the dot's rules;
`docs/undo-contract.md`; the branch's documents. No build, no browser, no server.
