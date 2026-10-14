# The read of the three builds of 14 Oct 26 — the reader's report (`[LW-CLASH-NOTE-PHONE]`, `[NOTES-SHORTER]`, `[LOOK-13OCT-SMALL-FIXES]`)

**Reader:** one fresh Opus reader (D790), who wrote none of this code. **Brief:** `2026-10-14-three-builds-read-brief.md`.
**Read:** `git diff bfaa68489..11f5e662b -- raptor-port/src raptor-port/e2e` (78 files), against the rulings' full rows
(D805, D823, D827, D828, D830, D831, D837–D842, D783, D587, D796, D797, D800, D824, D374, D801, D679), the wording
record, the look's record §3 and §6, the approved page's lines 119–155 and 229–397, and the evidence sheet §2–§10.

**The branch moved while this read was under way.** It was handed over at `11f5e662b`; a further commit landed on it
during the read (`4f2771406` — D843, D844: the "Nothing on this day earns" refusal from one source), and four record
files stood changed and uncommitted (D845's row among them). The findings below are of the range as handed over; the
later commit's source was read too and is in "What else was read" at the end.

**Result: 4 findings — 1 wrong result, 1 misleading, 2 untidy.** No finding in the notes' words, the passing note's
join, the Leave War's seams, the OIL question, the ✕ and the keyboard order of the question sheets, the calendar's
keys, or the Tracker's boxes.

| id | Gravity | One line |
|---|---|---|
| R1 | wrong result | `src/ui/sharedline.test.tsx` has the very fault `placeholderlist.test.tsx` was held for: it goes red on 15 Oct 26, on every branch, with nothing changed |
| R2 | misleading | Escape held a moment too long on the OIL question closes the question AND the bar that says the change was not made |
| R3 | untidy | The clash list's Show / Hide choice outlives the note it was made about: a later lone clash can start closed, a later several can start open |
| R4 | untidy | The test "an ordinary jump afterwards drops an 'open' nobody took up" passes with that drop removed |

---

## R1 — wrong result — `raptor-port/src/ui/sharedline.test.tsx` (its `beforeEach`, about line 71; the fixtures at 174, 227, 264)

**The failure.** Run the unit tests on Thursday 15 Oct 26 or any later day, on any branch: six tests of
`describe('the List: a shared input is one line')` fail ("expected [] to have a length of 1", then "Cannot read
properties of undefined (reading 'querySelector')"). From 18 Oct a seventh fails, from 21 Oct an eighth. The gate goes
red with no change to the app — exactly what happened to `placeholderlist.test.tsx` on the morning of 14 Oct, the
fault the brief asked about ("does anything else in the suite share its fault?").

**The cause.** The Inputs List opens on a window of days that starts TODAY (`InputsPage initialRange` →
`lookaheadRange(new Date())`), and this file reads the real clock. Its List fixtures are dated `LATER = { date: 'Oct 14' }`
(six tests), `'Oct 17'` (one) and `'Oct 20'` (one). The file's own comment at line 262 records the same thing happening
once before ("8 Oct 26 … went red the night the calendar turned to the 9th") — it was answered then by moving the date
on, which only moved the day it breaks.

**How it was proved (nothing in the repo was changed).** The one file was run with the clock every process sees moved
forward by a preload kept outside the repo (its 12 lines are at the end of this report):

| Clock | Result of `npx vitest run src/ui/sharedline.test.tsx --pool=forks` |
|---|---|
| as it is (14 Oct 26) | 19 passed |
| + 1 day, + 3 days | 6 failed, 13 passed |
| + 4 days, + 5 days | 7 failed, 12 passed |
| + 8 days, + 20 days | 8 failed, 11 passed |

A control (a one-line test that prints the date) showed the moved clock is what a test worker reads. Fifty-four other
unit test files were run the same way at + 20 days, one at a time, and all passed (the list is under "What I ran") —
among them `placeholderlist.test.tsx`, whose hold therefore works. **The whole suite was NOT run with the clock moved**
(that is a full run and needs the lock); only the files that draw the Inputs pages, read today's date, or belong to
this batch.

**Is the hold in `placeholderlist.test.tsx` right?** Yes: `vi.useFakeTimers({ toFake: ['Date'] })` and
`vi.setSystemTime(new Date(2026, 9, 13, 12, 0, 0))` as the first lines of `beforeEach` (before the page is drawn, so
the List's first window is worked out from the held day), `vi.useRealTimers()` as the last line of `afterEach`; only
the date is held, so every real timer still runs; local noon is the same day in any time zone. It passes at + 20 days.

**The fix, step by step** — the same hold, in `raptor-port/src/ui/sharedline.test.tsx`:

1. In the import from `vitest` at the head of the file add `vi` (the line that now imports
   `afterEach, beforeEach, describe, expect, it`).
2. Make these the FIRST two lines inside `beforeEach(async () => {` (above `INPUTS.splice(…)`), with the comment:

   ```ts
   /* THE DAY IS HELD AT WEDNESDAY 14 OCT 26 — the day the List's fixtures here are dated from ("Oct 14", "Oct 17",
      "Oct 20"). The List opens on a window of days that starts TODAY (InputsPage `initialRange`), so on the real clock
      these tests went red as each date passed (8 Oct first — the note at "a date the List still shows" below).
      Only the date is held (ui/placeholderlist.test.tsx does the same); timers run as they always did. */
   vi.useFakeTimers({ toFake: ['Date'] })
   vi.setSystemTime(new Date(2026, 9, 14, 12, 0, 0))
   ```
3. Make this the LAST line inside `afterEach(async () => {` (after `host.remove(); _resetFloatWins()`):

   ```ts
   vi.useRealTimers()
   ```
4. Run `npx vitest run src/ui/sharedline.test.tsx` — 19 must pass — and once more with the clock moved on (the preload
   below, `SHIFT_DAYS=20`): 19 must still pass.
5. When the lock is free, run the whole unit suite once under the preload at `SHIFT_DAYS=20` and at `SHIFT_DAYS=200`
   (the second crosses into 2027): any other file that fails reads the real clock the same way and wants the same hold.
   That run is the only way to answer the brief's question for every file; this read answered it for 55.

---

## R2 — misleading — `raptor-port/src/ui/OilWaitSheet.tsx`, the bar's `onKeyDown` (in `Bar`, the line `onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); oilBarOk() } }}`)

**The failure.** Edit Schedule (or the Scheduler Board), a swap that raises the OIL question. With the question up,
press Escape and hold it a moment — past the keyboard's repeat delay, a quarter to one second by the PC's setting.
The first key-down closes the question; the bar comes up and the keyboard is put on "Answer OIL" (as L7 / K8 ask);
the key's own repeats then arrive ON THE BAR, and the first of them closes it as "OK" does. On screen: the question
goes, the two pucks flash, and no bar is left. **What should happen:** the bar stays until it is tapped or closed by
a press of its own — D783 (2) "a bar that stays until tapped", and the code's own words for why ("a swap that was not
made is news the scheduler must not miss"). A scheduler who leaned on Escape is left with nothing saying the swap was
not made.

**The cause.** Until this batch the bar heard no key, so a held Escape did nothing after the question closed. K9 gave
the bar Escape, K8 moves the keyboard onto the bar in the same turn the question closes — and nothing tells a fresh
press from the repeats of the press that closed the question (`OilConfirm`'s own Escape listener is on the document
and is gone by the time the repeat arrives).

**The fix.**

1. In `Bar` (`OilWaitSheet.tsx`) change the handler to ignore a repeat — the key is still kept from the page:

   ```tsx
   onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); if (!e.repeat) oilBarOk() } }}
   ```
   and add to the comment above it: "a REPEAT of the Escape that closed the question is not a press on the bar: a
   key held a moment too long would otherwise take the question and the bar away together".
2. Pin it in `src/ui/oilwait.test.tsx`, beside the test that proves Escape closes the bar: with the bar up, dispatch
   `new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, repeat: true })` on
   `[data-testid="oilbar-answer"]` — the bar must still be there; then the same event without `repeat` — the bar goes.

(The same held key on Enter is harmless and is left: Enter held on "Don't swap" brings the question back with "Yes"
picked and nothing saved.)

---

## R3 — untidy — `raptor-port/src/leavewar/ui/Chrome.tsx`, `StageBar`: `const [clashPick, setClashPick] = useState<boolean | null>(null)`

**The failure.** On a phone, as an admin, with ONE clash: the list starts open; tap **Hide**; settle the clash from
the grid (the note goes). Later in the same session — the Leave War page is never unmounted while he stays signed in
(`LeaveWarPage` is kept mounted, `ui/Shell.tsx`) — a publish raises one new clash: its list starts CLOSED. The mirror
case: several clashes, tap **Show**, settle them all; next time several arrive the list starts OPEN and pushes the
grid down by a row a clash. **What should happen:** "With one clash the list starts open. With more it starts closed,
and stays as you left it for the visit" (the approved page, section 1 "How it behaves"; D827). A choice made about a
note that has since gone is not "as you left it" for a new note.

**The cause.** `clashPick` is only ever set by the line's button and is never cleared, and the component that holds it
lives as long as the sign-in. `clashOpen = clashPick ?? clashes.length === 1` therefore stops following the rule for
the rest of the session after one tap.

**The state table (the brief's first question).**

| `clashPick` | The event | What happens | Right? |
|---|---|---|---|
| none yet | the count goes 1 → 2, or 2 → 1 | the list closes, or opens, by the rule | yes |
| chosen | the count changes but stays above 0 | his choice stands | yes — tested ("his Hide is kept") |
| chosen | the count reaches 0, then a new clash arrives | his OLD choice decides the new note | **no — R3; no test** |
| chosen | another page, then back to the Leave War | his choice stands (the page stays mounted) | a reading: "the visit" is taken as the whole signed-in session — say so in the sheet, or clear it with the fix below |
| chosen | the role goes member → admin again; a phone turned wide and back | his choice stands | yes |
| any | sign-out | forgotten (the shell is unmounted) | yes |

**The fix.**

1. In `StageBar`, straight under the `useState` line, add (`useEffect` is already imported in this file):

   ```tsx
   /* his Show / Hide is a choice about the note in front of him: when the last clash goes, the note goes, and the next
      one starts by the rule again — one open, several closed (D827) */
   useEffect(() => { if (clashes.length === 0) setClashPick(null) }, [clashes.length])
   ```
2. Pin it in `src/leavewar/clashwayout.test.tsx`, in the phone's `describe`: one clash (`asPhone(); aBid()`), render
   `<StageBar />`, tap `clash-line` (Hide); take the bid off and run the pass so the list is empty (the note is no
   longer drawn); put the bid back and run the pass; the line must read "⚠ 1 clash with the schedule Hide" and
   `clash-list` must be drawn. (The exact calls for "take the bid off" are the file's own helpers' to choose; the
   assertion is the two lines above.)

---

## R4 — untidy — `raptor-port/src/leavewar/clashwayout.test.tsx`, "an ordinary jump afterwards drops an 'open' nobody took up"

**The failure.** In `state/store.ts focusDay`, change
`focusOpenAsk = opts && opts.open ? { person: opts.open, date } : null` so that an ask without `open` leaves the old
one standing (`if (opts && opts.open) focusOpenAsk = { person: opts.open, date }`) — the very thing the test's name
says it guards. The test stays green. **What should happen:** it goes red.

**The cause, two of them.** (a) The test's one assertion sits inside `if (getState().focusSeq !== s.focusSeq)`: if the
under-manned list draws no day to press, nothing is asserted. (b) Where a day IS pressed, the test asks
`takeFocusOpen(getState().focusDate!)` — the under-manned day — while the ask left over is for the Saturday of the
clash; `takeFocusOpen` answers only for the ask's own date, so it returns nothing whether or not the ask was dropped.
The break tests cut "the ask is set" (wire 3) and "the ask is taken once" (wire 4); nothing cut "an ordinary ask drops
it".

In the app the grid is always mounted beside the strip and takes the ask in the same turn, so the drop is a second
line of defence — hence untidy, not worse.

**The fix.** Replace the body of that test with one that asks for the SAME day plainly, and reads the ask for that day:

```ts
it('an ordinary jump afterwards drops an "open" nobody took up', () => {
  aBid()
  const { getByTestId } = render(<StageBar />)
  fireEvent.click(getByTestId('clash-go-0'))            // the ask: open the Saturday for plasma (no grid here to take it)
  act(() => { focusDay(SAT) })                           // the plain ask the under-manned list makes — for that same day
  expect(takeFocusOpen(SAT), 'a plain jump to the very day must not open it for him').toBeNull()
})
```

and add `focusDay` to the file's import from `./state/store`. Then add the cut to
`scripts/handpass/breaks/2026-10-14-three-builds.json` (find the line quoted above, put the `if` form) and see it go red.

---

## Rows of the sheet's §2 and §3 with no code behind them, and places missing from the tables

- **§2d, "The Medical view opened full"** — no screen draws it. `MedicalView` is drawn in ONE place,
  `ui/InputsPage.tsx` (`{tab === 'med' && <MedicalView />}`), without `onClose`; its two bands
  (`{onClose && <SaveBand />}`, and this batch's `{onClose && <OilBand />}`) and the new rule
  `.medview > .oilband` can never be reached today. As a tab of the Inputs page it is already covered by the row "The
  Inputs page … (the top bar)". The row cannot be walked or given a picture; it should read **"must not, because no
  screen opens the Medical view full today (D620, D626 made it a tab)"**, and §8's "the bar under a full-screen
  surface" is the Scheduler Board alone. (The head comments of `ui/SaveStatus.tsx` and `ui/OilWaitSheet.tsx` still
  name the Medical view — and, in the first, the Inputs calendar — as surfaces that lie over the top bar.)
- **§2b–§2f and §3, every other row:** code found for each — the eleven heads are the eleven uses of `.airpop-head`
  (`DocConfirm`, `DocViewer`, `inputedit.tsx` — the schedule's dialog, drawn when the page is not Inputs —,
  `MedClashConfirm`, `Modals` twice, `OilConfirm`, `SchedBoard` twice, `UpchitConfirm`, `WeekCal`); the six question
  sheets are the six callers of `useSheetFocus`; the OIL question has three callers (`inputedit.tsx`, `InputsPage.tsx`,
  `OilWaitSheet.tsx`); the passing note is one element with one placer.
- **No place that draws a changed thing was found missing from the tables.**

## The other state tables the brief asked for

**The one-shot `focusOpenAsk` (`leavewar/state/store.ts`).**

| Caller | Sets the ask? | Taken by | Right? |
|---|---|---|---|
| the clash's tap — `focusDay(date, { open })` | yes | the grid's effect, once, after its jump | yes — tested on the whole page |
| the same tap for a clash in another period — `selectWar` then `focusDay` | yes | one draw of the grid: the effect that shuts an open sheet on a change of period is declared BEFORE the one that opens this one, so the open wins | yes — but only by that order; the route's test (`clashperiod.test.tsx`) stops at the store. Not a finding: nothing fails |
| the under-manned list, a new period's sheet, the tab's first landing — `focusDay(date)` | cleared | — | yes (its test is R4) |
| Undo / Redo — `focusDay(date, { ifHidden })` | cleared | the grid returns before the take when the day is in view; nothing is left to take | yes |
| `selectWar` alone | untouched | the next draw's take is for the new period's own first day; an ask for another date is dropped by it | yes |
| the person is no longer on the roster; the period has no such date | — | jumped to (or not), nothing opened | yes |

**The bar's `covering` counter (`ui/OilWaitSheet.tsx`).**

| When | Bars drawn | Top bar makes room | Keyboard | Right? |
|---|---|---|---|---|
| the bar comes up on the week or the Inputs page | the top bar's | yes | to "Answer OIL" | yes |
| the bar comes up with the board open | both for one turn, then the board's only | no | the board's "Answer OIL" (the board is drawn after the shell) | yes — one bar; tested |
| the board is opened or closed while the bar is up | the other copy takes over | follows | **moves to the new copy's "Answer OIL" each time**, with no press on the bar | as built; not tested, not a finding — L7 says "when the bar appears" |
| two surfaces at once (the board and the Medical view full) | — | — | — | cannot happen: the second surface is never drawn (above) |
| the page changes, the week changes, a sign-in | none (`state/view.ts`) | no | — | yes |

`fitOneLine` cannot loop (at most seven steps, then `is-tight`), and the observers cannot feed it: the band's height and
width do not depend on `--oil-fit`. Nothing is left behind when the words change — the effect runs again and starts
from full size. The listener and both observers are taken off on unmount.

**`sheetfocus`'s order.** No ✕, or a disabled one: the browser's own order, as before. One control and the ✕: Tab goes
control → ✕ → control. Only the ✕: it keeps the keyboard. A second sheet over the first: the top one answers. No cell
wrong. (A stop the selector lists but the browser never tabs to — a button with `tabindex="-1"`, a hidden input —
standing next to the ✕ would let Tab leave the sheet for one press; none of the six sheets holds one today.)

**The calendar's keys.** On the dates: arrows, Home / End (the week's Monday and Sunday, into the next month), Page
Up / Down (a month; with Shift a year; 29 Feb lands on 28 Feb) — each does nothing when it would land on a date that
may not be picked, as the sheet says is left for step two. In a list: the arrows a row, Enter back to that month's
dates with the keyboard on its one tab stop (the title, where the month has no date to pick), Home / End / Page /
Space swallowed. `wantIn` is always used up by the very next draw. No cell wrong; all of it runs on UTC date maths.

## What was checked where nothing was found

- **The words.** Every built sentence was compared with the wording record (List 3 where it has a row, else Lists 1
  and 2, and the two tables): N1–N4, N6, N7 (both, seven places from one source), N9–N15, N17, N19, N22–N32, the
  three "is not a time", the red box, the LATE mark, "Left OIL Earn", the clash note's line, its two sentences and
  four instructions, the OIL question's title, sentence, answer and small print. None differs. The old sentences left
  in the source are the relatives the record lists as not to be touched (hover titles, "That is not a time" twice,
  the day bar's sentence). Values tried for grammar: one clash and several, a date in another year, the Original and
  an AL, a day with no name, ALL and ALL AVAIL, one and several blind desks.
- **The leave clash's sentence ("The input is OML, but the bid is LL").** No test raises a leave-kind clash and reads
  this sentence. It was tried (a throwaway test outside the repo): a leave filed on the Inputs page over a standing
  bid REPLACES the bid ("This replaces Fable's LL bid on 14 Jul on the Leave War") and leaves no clash, so the
  sentence is reachable only from rows put in beside the doors — stored data, not a finding (D56).
- **The passing note's join.** Only `setDayApproved` and `publishFlagsBids` pass the third value; no caller hands
  `toast` a third value by accident (no `forEach(toast)`, no three-argument call elsewhere); the one wrapper that
  re-raises notes passes every argument on. Two notes join only when both name a day, the days are equal, the second
  head starts with the first, and nothing stood between them; the warning's colour is kept (the stronger of the two).
- **Readers of a clash record.** The list is compared whole as text on every pass — the two new fields ride that
  with no change; the one test that compares a whole record (`oilsync.test.ts`) was updated to carry the period.
  `iid` is the Input's own id (the absence index writes it so), which is what `openInputWindow` looks up.
- **The Leave War's seams.** `openInputWindow` is in `leavewar/sync.ts` beside `openDays`, and reaches only the
  scheduler's flags (`ui/pops.ts`, `state/view.ts`) — inside the existing seam; `Chrome.tsx` reaches it through
  `../sync`. A desktop's top is unchanged in structure (the strip is still inside the stage line; the phone's note is
  drawn only at the phone's width, 430 and under). The note is the admin's in both forms. Nothing saved gains a field.
- **The stylesheets' shared names.** `.airpop-head .x`, `.upconf-seg`, `.secdef-btn`, `.seg`, `.saveband`: each other
  user was looked up; the upchit and medical-clash sheets keep their own row and `.on-keep` / `.on-rem`; the "Set as
  default" offer keeps its look and gains only the ring; no test or script still looks for `.odl-no` or
  `.secdef-snack.oilbar` except to say it is gone. Layout itself was not judged from the source — that is the walk's
  and the browser tests'.
- **The Tracker.** Delete / Backspace is stopped at the box's row and is also refused by the page's own handler; the
  key inside the open calendar never reaches the row; a box with no ✕ takes the key and does nothing; `max` is the
  squadron's today, the day the refusal measures against.
- **The tests.** No test was removed; every re-expressed assertion is as tight as before or tighter (the loose
  `/locked/i` became the whole sentence wherever it stood). `pickAhead` keeps D374's refusal proven through the box.

## What I read whole, what I only searched, what I ran

- **Read whole:** `ui/toast.ts`, `ui/sheetfocus.ts`, `ui/OilWaitSheet.tsx`, `ui/DateCal.tsx`,
  `tracker/components/DateBox.jsx`, `leavewar/ui/chrome.css` (the new block), the brief, the wording record, the
  look's record, the evidence sheet, the 21 rulings' full rows.
- **Read as the whole diff plus the code round it:** `leavewar/ui/Chrome.tsx` (`StageBar`), `leavewar/ui/Matrix.tsx`
  (the focus effect, the cell's open call, the period-change effect, `jumpTo`), `leavewar/state/store.ts` (`focusDay`,
  `takeFocusOpen`, `selectWar`), `leavewar/sync.ts` (the clash pass, `clashWayOut`, `oilBlindLine`, `publishFlagsBids`,
  `openDays`, `openInputWindow`), `leavewar/engine/dayview.ts`, `leavewar/absences.ts`, `leavewar/state/merge.ts`,
  `leavewar/LeaveWarPage.tsx`, `ui/OilConfirm.tsx`, `ui/DateBox.tsx` (the layer), `ui/SaveStatus.tsx`, `ui/Shell.tsx`,
  `ui/SchedBoard.tsx` (the two dialogs and the band), `engine/publish.ts`, `state/sched-commit.ts` (the publish
  command), the five stylesheets' changed rules, every test's diff, both browser tests' diffs.
- **Only searched:** the files over 300 lines for the lines named above (`ui/board.ts`, `ui/inputedit.tsx`,
  `ui/interactions.ts`, `ui/QualsPage.tsx`, `tracker/app/core.js`, `ui/InputsPage.tsx`), every other Escape / Home /
  End / Page listener, every caller of `toast`, every user of the changed style names, the first nine break tests.
- **Ran** (unit test files only, one at a time, no build, no browser test; `git status` shows nothing of mine but
  this report):
  - `src/ui/sharedline.test.tsx` as it is, and with the clock moved on 1, 3, 4, 5, 8 and 20 days — the table in R1;
  - at + 20 days, each of: `inputslist`, `placeholderlist`, `batch2`, `editorwindow`, `groupeditor`, `inputcx`,
    `inputs-calendar-flow`, `inputsday`, `inputskeys`, `inputstabs`, `inputsvet`, `inputtitle`, `placeholderdoors`,
    `inputsdeleted`, `inputsfmt`, `inputsmonth`, `placedshown`, `sansform`, `windowdoors`, `windowreads`, `datecal`,
    `datebox`, `everyweekday`, `oilconfirm-look`, `oilwait`, `toastplace`, `quals`, `unpublish-button`, `oilconfirm`,
    `audit-e-halfday-surfaces`, `audit-e-window-sort`, `barmove`, `caldrag`, `inputcx-scenarios`, `inputs`,
    `inputscal`, `sanscal`, `sansday`, `bellnotices`, `inputmarks`, `noteswords`, `toastbatch` (all under `src/ui/`);
    `src/tracker/leftovers`, `src/tracker/tracker`; `src/engine/inputs-readers`, `latestamp`, `lookahead`,
    `lockednote`; `src/state/changelines`, `undo-wire`; `src/leavewar/clashwayout`, `clashperiod`, `publishdoor`,
    `holnotice` — 54 files, every one green;
  - two throwaway tests kept outside the repo: the control for the moved clock, and the leave-clash question above.

**The preload used to move the clock** (kept outside the repo; run as
`SHIFT_DAYS=20 NODE_OPTIONS="--require <path>/shift.cjs" npx vitest run <file> --pool=forks` from `raptor-port/`):

```js
const days = Number(process.env.SHIFT_DAYS || 0)
if (days) {
  const Real = Date
  const off = days * 86400000
  class Shifted extends Real {
    constructor(...a) { if (a.length === 0) super(Real.now() + off); else super(...a) }
    static now() { return Real.now() + off }
  }
  globalThis.Date = Shifted
}
```

## What else was read — the commit that landed during the read (`4f2771406`, D843, D844)

Its source change is small and was read whole: one sentence, `DAY_EARNS_NOTHING` in `ui/oilmode.ts`, said from the
puck's tap and the event's own OIL mark (`ui/board.ts`) and from a man in the ALL AVAIL window (`ui/AvailWindow.tsx`),
that window's hint and its copy of the event's refusal; two tests press the real controls. Nothing wrong found in it
against D844. **But D845 — in the rulings as an uncommitted change when this was written — replaces D844's words**
("Turn off the switch first."; the hint "…Turn off the switch to change men one by one."), and the source at
`4f2771406` still says D844's. That is work in hand, not a finding of this read; it is named so the two are not
mistaken for each other at the close.
