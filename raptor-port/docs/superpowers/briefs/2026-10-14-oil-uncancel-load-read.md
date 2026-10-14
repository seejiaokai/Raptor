# Fresh read — the small OIL job ([OIL-UNCANCEL-UNASKED] D816, [OIL-LOAD-VERSION-UNASKED] D818)

Reader: a fresh Opus reader, read-only. Code read AT `15a72901d` (`git show`), the change by
`git diff 1d29b83c8 15a72901d -- raptor-port/src`. I did not open the plan, the scenario list or the hand-pass sheet.
I did not open `leavewar/holnotice.test.tsx` (added after the commit, in `231abe967`) so as not to be anchored by it.

## Verdict in one paragraph

The un-cancel door (D816) is sound: I found no way to un-cancel with no answer where one was owed, no way to write an
answer nobody gave, no way to lose one that was given, and no credit for an input still wearing a mark. The load's
count (D818) is right for an input of ONE day, and has one real gap: an input of several days that the load puts back
is not counted when its unanswered day is not the day loaded. Three smaller faults follow, all wording or cosmetic.
Nothing found ranks in the brief's top class (a wrong OIL answer or credit).

## What I read and ran

- Rulings, full rows, by the shell's grep: D816, D818, D814, D804, D793, D783, D782, D781, D762, D660, D682, D142, D2,
  D148, D44, D45, D858, D790, D771, D831.
- Whole, at the commit: `ui/reqdoor.ts`, `ui/oilwait.ts`, `ui/OilWaitSheet.tsx`, `ui/OilDayList.tsx`, `ui/oilday.ts`.
- Named functions and their callers: `state/view.ts` (`OILWAIT`, `OILBAR`, `setOilDay`, `setPage`, `VIEW_RESET`),
  `state/store.ts` (`writeInputsBatch`, `tryInputsBatch`, `switchRoleView`), `ui/board.ts` (`askCx`, `cxCommit`,
  `boardMbtn`'s three ground-row branches), `ui/board-html.ts` (`sbRowCtl`, the ground row), `ui/SchedBoard.tsx` (the
  cancel sheet), `ui/interactions.ts` (the `data-restore` door whole), `ui/pops.ts`, `ui/inputedit.tsx` (`oilGate`,
  `normalizeInputDraft`, `draftOf`, `dryRun`, `saveBatchX`, `oilFirst`, `askOilIfPending`, `inputWho`, every write of
  `.oil`), `ui/OilConfirm.tsx` (what its Save hands back), `engine/inputs.ts` (`oilNeverEarns`, `oilSilent`,
  `inputDormant`), `engine/drafts.ts` (`loadVersionToWorkingCopy`), `engine/publish.ts` (`filingRestorePlan`),
  `engine/slots.ts` (`reconcileDayFiling`), `leavewar/sync.ts` (`oilOpenOn`, `oilAskPlan`, `dayFacts`, `tellHoliday`,
  `holidaySpan`, `holidayOwnName`, `holidayWord`), `state/notices.ts` (the holiday line), `ui/topbits.tsx` (the bell's
  opener of the list), `ui/lift.ts` (`landOn`).
- Tests read: `ui/oilwait.test.tsx` blocks (ON10) and (ON11) and their helpers; the changed lines of
  `state/p6c-requestonread.test.ts`, `ui/inputmarks-scenarios.test.tsx`, `ui/noteswords.test.ts`;
  `ui/amendbatch.test.tsx` "item 6" (it proves the premise of finding 1).
- Ran: `npx vitest run src/ui/oilwait.test.tsx` — 79 passed, 0 failed (the working files' source equals the commit's;
  only a test file was added since).
- I ran NO test that shows a finding: the brief is read-only, and each finding needs a new test. Each is "by reading";
  a test sketch is given where it is short.

---

## Findings, most serious first

### F1 (medium) — a several-day input the load puts back is not counted when its unanswered day is not the day loaded

**Setup.** A duty input of two days, Thu 16 – Fri 17 Jul, accepted: its ONE row stands on Thursday (one request, one
row). Thursday is published. Friday is then made a public holiday; the list is left for "Later", so the input has no
OIL answer for Friday. The scheduler takes the input off the programme (✕ on its Thursday row). (Same with a
Fri–Sat input that has no answer for its Saturday.)

**The press.** On Thursday: "Load onto working copy" for the published version (twice — the confirm).

**What the app does.** The input is back on the programme for both days (the note says "1 request came back onto the
programme with its row — Fri reads that too"). It says NOTHING about OIL and opens no list.

**What it should do (D818).** "…the app says how many of the inputs it put back still need an OIL answer and opens
[the] one list of them." The load put this input back, and it still needs an answer. On a holiday declared while the
input was already off the programme there is no schedulers' bell line either, so the only signs left are the card's
"OIL?" tag and the member's own bell — the gap D818 was ruled to close.

**Cause.** `raptor-port/src/ui/interactions.ts` at the commit, lines 1262 and 1296: both readings are
`oilOpenOn(iso, iso)` — the loaded day only. `oilOpenOn` (leavewar/sync.ts) keeps an input only where it has an
unanswered day INSIDE the run, so an input whose unanswered day is another day of its own is in neither set, and
`need` (line 1297) is 0. That the load does put such an input back is the engine's own rule
(`engine/publish.ts filingRestorePlan`: "the version's OWN row for it stands on this very day: 'on the programme' is
then the fact, whatever other day the request also covers") and is pinned by `ui/amendbatch.test.tsx` — "a two-day
request whose row the version PUTS BACK on this day is back on the programme".

**Fix, step by step** (all in the `data-restore` branch of `routeClick`):
1. After `const iso = dayIso(CURWEEK, di)` work out the run every input covering the day spans:
   `let lo = iso, hi = iso; for (const x of INPUTS as any[]) { if (!x || !DAYS[di] || !inputCoversDate(x, DAYS[di].dt)) continue; const a = unfmt(x.date, x.yr) || iso, b = x.endDate ? (unfmt(x.endDate, x.yr) || a) : a; if (a < lo) lo = a; if (b > hi) hi = b }`
   (`unfmt` is already imported there and returns the ISO date.)
2. Replace both `new Set(oilOpenOn(iso, iso).map(o => o.iid))` by a map over that run:
   `const openNow = () => new Map(oilOpenOn(lo, hi).map(o => [o.iid, o.days] as const))`; `openWas = openNow()` before
   the load, `open = openNow()` after it. `stood` and `need` keep their tests (`.has(...)`).
3. Keep the inputs counted: `const back = INPUTS.filter(x => stands(x) && !stood.has(id(x)) && open.has(id(x)))`,
   `need = back.length`.
4. Open the list for the days those inputs need: `const days = back.flatMap(x => open.get(id(x)) || []).sort()`,
   `from = days[0]`, `to = days[days.length - 1]`; `plain` unless `from === to` and that day is a public holiday.
5. Add to (ON11): file a two-day input (Fri 17 – Sat 18 Jul, no answer), publish Friday, take it off, load Friday;
   expect the tail " · 1 input needs an OIL answer" and `pops.OILLIST` not null. It fails today.

**A choice in it that is the owner's, not mine.** D818's reading (2) says the list is "opened for the day that was
loaded". Step 4 opens it for the input's unanswered day instead (it has to — the loaded day has nothing to answer).
If the host would rather not widen the list, the smaller fix is steps 1–3 and a note that names the day
("· 1 input needs an OIL answer on Fri 17 Jul"), with the list opened for that day.

**How sure.** High that the code does this (three functions read end to end, the premise pinned by an existing test).
Not run.

### F2 (low, wording) — the list a load opens on a holiday that has no name of its own is headed "Public holiday · PH"

**Setup.** A public holiday made with no name (the Event sheet's "PH" button, or the Holidays list's empty name box);
an input on it with no answer, taken off since the day was published.
**The press.** Load the published version back.
**Shows.** The list's heading reads "Public holiday · PH" (or the squadron's own first event word of that kind).
**Should.** "Public holiday" alone — as the same list reads when it opens from the holiday's save and from the bell.
**Cause.** `ui/interactions.ts` line 1303 passes `facts.name` raw. A holiday with no name is stored under the preset's
word; the other two openers read it through `holidayOwnName` (`leavewar/sync.ts` line 912 — its comment records this
very fault, "Public holiday · PH", found by an earlier walk).
**Fix.** (1) Export `holidayOwnName` from `leavewar/sync.ts`. (2) In `interactions.ts` line 1303 use
`name: facts.kind === 'ph' ? holidayOwnName(iso) : ''`. (3) A unit test beside (ON11): a holiday with no name → the
list's `name` is ''.
**How sure.** High, by reading. Not run.

### F3 (low, wording) — the list a load opens says "What is left goes to the schedulers’ bells" where that is not true

**Setup.** A plain Saturday (no holiday). A duty input on it with no answer, taken off since Saturday was published.
**The press.** Load the published version back; in the list that opens, press "Later" (or answer some, not all).
**Shows.** Under the list: "What is left goes to the schedulers’ bells".
**Should.** Nothing of the kind. A scheduler's bell carries an OIL line only for a day that was MADE a holiday (a stored
notice, `leavewar/sync.ts tellHoliday`); a plain weekend has none, and neither has a holiday declared while the input
was off the programme. What is left stays on the card's "OIL?" tag and on the bell of whoever answers for that input —
D818's reading (4) says exactly that ("'Later' leaves the 'OIL?' signs and the bell's line as they are").
**Cause.** `ui/OilDayList.tsx` line 89 prints the sentence whenever something is left, whoever opened the list.
**Fix.** In `Body`, show the sentence only while a holiday line is live for the reader:
`const belled = !!holidayLineOn(me(), from)` (`state/notices.ts holidayLineOn`, `state/perms.ts me`), and print it
only when `belled && rows.length && done < rows.length`. (The holiday's own save makes its notices in the same command
before the list opens, so that path keeps the sentence.) The simpler form — hide it when `plain` — fixes the weekend
and leaves the holiday-with-no-line case.
**How sure.** High that the sentence prints; high that no scheduler's bell line exists for a plain weekend. Not run.

### F4 (low, cosmetic) — after rows have shifted, the "not answered" flash lands on another row's button

**Setup.** Saturday's board: two input rows; the cancelled, unanswered one is the second in the day's stored order.
Un-cancel it → "Don’t un-cancel" (the bar stays). Take the OTHER row off the programme (✕), so the cancelled row
becomes the first.
**The press.** "Answer OIL" on the bar, then "Don’t un-cancel" again.
**Shows.** The flash lands on whichever row now holds the old position (or nowhere); the row that was not un-cancelled
does not flash.
**Should.** Its own CX button flashes (D783 (2)).
**Cause.** `ui/reqdoor.ts` line 442: `places: [sel:[data-grcx="${p.di}.${p.ri}"]]` — the row's POSITION, taken once
at the first press and re-used by `again` (line 433). Every other door's `sel:` place is keyed by the input's id
(`data-iid`, `data-inpseat`, `data-acck`), and `state/view.ts` says of these places "They name rows by their IDS, never
their places". `ui/oilwait.ts` line 122 then carries the old place into the new wait as well.
**Fix.** (1) In `rowMark`, build the place when the question is put: inside `hold`, find the input's standing row —
`for (let di = 0; di < DAYS.length; di++) { const d = DAYS[di], row = d && standsOn(d, iid); const ri = row ? d.ground.indexOf(row) : -1; if (ri >= 0) → [sel:[data-gr…="${di}.${ri}"]] }`
(`standsOn` is already imported), else `[]`. (2) In `oilwait.ts oilBarAgain`, do not carry a `sel:` place over from the
old wait (only the row-id places `oilWaitAlso` added need carrying; a door's own selector is rebuilt by the door).
**How sure.** High by reading; it needs the browser to see (steps under "Not checked", B4).

---

## Two things that are not findings — no failure reached, but worth a line each

- `ui/reqdoor.ts` line 423: where the tried take-off fails and the real one then succeeds, the input is un-cancelled
  with no question. The same branch of `gated` (line 180) follows such a change with `askOilIfPending` ("never
  silent"). I found no way to reach it — the try and the real run are the same body on the same records — so it is a
  consistency point: add `if (a === 'done') askOilIfPending(find(), true)`.
- With the bar up and the input taken OFF the programme meanwhile (still cancelled), "Answer OIL" still puts the
  question and un-cancels it on the answer: the gate does not ask whether the input is on the programme. Harmless as
  far as I can follow it (an answered, un-cancelled input waiting under Personal Inputs; Accept then puts it back at
  once) — said so the host knows.

## The host's four readings — my view

1. **Both marks: asked only when the last comes off.** Agree. `oilGate` is asked of the input as it will stand; with the
   other mark still on, `oilNeverEarns` answers "nothing to ask" (D814), and no answer is written for something that
   can earn nothing. Pinned by the (ON10) test.
2. **"Put back" = standing after, needing an answer, and not already standing there needing one.** Agree with the
   definition; it is measured on the loaded day only — F1.
3. **A plain weekend's list does not call the day a public holiday.** Agree, and it does not. Two leftovers on the same
   window: F2 (an unnamed holiday) and F3 (the foot's sentence).
4. **"Switch to this plan" says nothing.** Agree. A plan switch never brings a taken-off input back
   (`engine/slots.ts reconcileDayFiling` leaves 'taken off' and 'under Unavailable' alone); it can only land an input
   that was waiting under Personal Inputs, whose "OIL?" sign and bell were live all along.

## What I looked for in the table and found missing

- A reader: the several-day input (F1).
- A reader: the schedulers' bell after "Later" on a list opened by a load (F3).
- Not missing: I searched every writer of an input's cancel and information-only marks (`.cx`, `.cxr`, `.info`) and of
  its filing (`.acc`) in non-test source. The marks are written only by `rowMark` / `unmark` (and Undo / Redo); the
  filing by Accept / "→ Unavail" (which ask), the load (counted), and the plan switch's reconcile (reading 4). The
  week outside the board draws no CX or ⓘ button; the input's own window offers no un-cancel. `rowMark` has two
  callers only (the cancel sheet, the ⓘ button); the load has one caller.

## Explicit negatives — checked, nothing found

- **An un-cancel with no answer where one was owed:** the at-once path is reached only on "nothing to ask" — a working
  day, a kind never asked, an answer that still fits, or the other mark still on. A stale Yes (hours changed) asks again.
- **An answer nobody gave:** the answer written is the sheet's, for the plan the gate priced; the bar's "Answer OIL"
  prices it afresh (a hand-over while cancelled re-asks for the new person).
- **An answer lost:** `unmark` replaces the input's answers with the sheet's, as every other save door does
  (`inputedit.tsx` lines 1263, 1945, 2491); the sheet returns an answer for every day of the plan, earlier ones
  pre-loaded.
- **Credit for a marked input:** the engine reads the marks first; the door never writes an answer while leaving the
  mark it was asked about.
- **Nothing moves while it waits:** the try is rolled back whole and the rules re-run; the test's "world" string
  (inputs, the day, history, the bell, Undo, pending marks) is unchanged.
- **One step, one Undo:** the take-off and the answer are one `saveBatchX`.
- **Putting a mark ON, the red box, "Save reason" and Enter in the reason box:** ask nothing.
- **The state table, the bar up:** the same button again (asks afresh); the other mark put on (then "Answer OIL"
  un-cancels at once — right); another input's question (replaces it, as at every door); Undo of the cancel ("That
  input has changed — not un-cancelled"); the input deleted (the same words); moved to a working day (un-cancelled at
  once); handed over (asked for the new person); the board's day stepped or the board closed (the bar stays and still
  works by the input's id); page, week, sign-out, the member's view, OIL Earn switched on (taken away); the day
  published meanwhile (the answer lands as a waiting change).
- **The load:** an input of one day put back with no answer is counted; answered, cancelled, information-only or
  already standing unanswered is not; one deleted since, or moved to another day, is not; a several-day one the load
  must leave as filed is not; two loads cannot overlap (one synchronous press); the list reads live, so an Undo of the
  load empties it ("Nothing left to answer") and its Save writes only what is still open; a list already open for the
  day keeps its picks.
- **The count against the list:** every input counted is in the list; the list may hold MORE than the count (inputs
  that were open all along). Said, not a fault — D818's reading (2) has the list hold every unanswered input of the day.
- **Callers:** nothing else in the source expected the un-cancel to finish at once; the board's two callers both end
  quietly on "asked".

## Not checked — needs the browser (the host runs these)

- **B1.** Phone and desktop, Scheduler Board, Saturday: cancel an unanswered input, press CX → "Un-cancel". Expect the
  reason sheet to close and the OIL question to stand OVER the board with "Don’t un-cancel" / "Un-cancel", the keyboard
  on its first answer. Press "Don’t un-cancel": expect the band under the board's own bar, on ONE line on a phone
  ("Not un-cancelled — OIL not answered" is the longest sentence the band has carried), the keyboard on "Answer OIL",
  and the row's CX button flashing. I could not tell from the code whether the flash's veil is drawn on a small button
  as it is on a puck.
- **B2.** The same for ⓘ: "Don’t change" / "Change" / "Not changed — OIL not answered".
- **B3.** Load a published version from the BOARD's preview strip where an input comes back unanswered: expect the list
  window above the board (not behind it), and the long note at the foot not lying over the list's "Later" and "Save" on
  a phone.
- **B4.** F4's steps; expect (today) the wrong button to flash.
- **B5.** F2 and F3 by sight: the heading on an unnamed holiday; the foot's sentence on a plain Saturday.
- **B6.** F1's steps; expect (today) no OIL words in the note and no list.
- **B7.** A published day: un-cancel with an answer where the version went out with the row live and the input
  unanswered — the row is as issued again. Check what the day's pending count and its OIL advisory say. This is the same
  field every answer door writes, so I did not trace the published-day credit path; it is not specific to this change.
