# [MSQ-PICK-GUARD] Build 1 — the build plan: one answer to "what is open", the doors that refuse, the Input window's own squadron (parts A, B, F)

Written 25 Nov 26 (chat 175's night) by a fresh Fable helper from its brief,
`../briefs/2026-11-25-msq-pick-guard-build1-plan-brief.md`. **Status: a draft for its red team — not approved, not to be
built from.** It builds nothing. The rulings: D2403, D2405, D2590–D2595 (full rows in `.claude/decisions-full/`); the
sizing file `2026-11-24-msq-pick-guard-build.md` (parts A–H; this plan is A, B, F); today's app as pressed,
`../briefs/2026-11-24-msq-pick-guard-press-report.md`; the walk's scenarios, `…-scenarios.md` (H1–H13, §3); the words,
`…-words2-fable.md`. Every claim about today's code below names its file and function and was read in the code on branch
`claude/msq-b1-screens-135` (head `dff29f001`) tonight. **Nothing was pressed on a running app** — §14 lists what that
leaves unproved.

**How to read the marks.** `[WNS]` after a sentence = it words a note or a question and **the words are not settled**:
his D2611 has none of them built on the agent's reading. `[ruled]` = the words stand in a ruling row. A question he has
not answered is named by its number (H2, H3, H7, H8, H11 of the scenarios file §2; "§3" for the host's calls; **N1–N6**
for the six this plan found that are in neither list — §8.3). Nothing here decides one: each gets a recommendation, the
shape that makes either answer a small change, and exactly what moves if he answers the other way.

---

## 1. The promise

**What a person sees after Build 1.**
- With a window open — an Input, Leave War or other window, the OIL list among them (D2403) — a pick of another squadron,
  the switch to or from the member view, and a bell line or bell tap that would take him to another squadron do nothing
  but raise the app's grey "Blocked:" note: under the control pressed on a desktop, at the screen's foot on a phone
  (D2590). The window stays live with his typing; the squadron and the view stay as they were.
- The same three presses are refused while a change is not saved — the "Not saved" band with Retry (D2594) — and while
  an opened row on Admin → Users holds typing (D2595).
- Unsaved Tracker chart edits are asked about at the switch to and from the member view, with the question a pick asks
  today (D2403). A refusal always comes before that question, so he never discards chart edits only to be refused.
- A 142 input can no longer be opened live under a bar saying 149 from 142's OIL list or from the bell's own OIL tap
  (security F1, F2): the input's squadron comes into view first, and the Input window keeps the input's own squadron.

**What stays exactly as today** (each pinned by a test written before the changed half — §7): a pick or a view switch
with nothing open; the Tracker's question at a pick, its three answers; menus and lists closing as they do; a pick of the
squadron already in view; Logout (never refused — its questions are Build 2's, part C); the "Not kept" band blocking
nothing; and **every change he did not make** — his own move at midnight, a right taken away, the Tracker failing
part-way.

**What Build 1 leaves half-way, said plainly.**
1. **The greyed windows and their bands still exist** (`state/typing-hold.ts`, `ui/heldro.ts`, `state/store.ts
   publishBands`, `ui/InputWindow.tsx`, `leavewar/ui/Sheet.tsx`). After Build 1 no press of his reaches the pick's band
   (D2323) or the member view's band (D2389): those two become code no road leads to. The midnight and right-ended
   bands show exactly as today until Build 2 (part D) replaces them with the refresh card (D2405).
2. **The Tracker's hold and its member-view cover** (`store.ts trkMayHold`, `coverWords`; `tracker/TrackerPage.tsx`)
   stay in the code. His own switch no longer reaches the cover (the question is asked first, and the switch then
   enters as his own press — §4.4); the hold at his own move at midnight is unchanged.
3. **Undo still reaches another squadron's steps** (part E, Build 3), and Logout still draws the Input window over the
   Tracker's question (part C, Build 2).
4. A window held after midnight now also refuses his next pick until he closes it — the held window keeps its Close, so
   he is never stuck (§11, risk 6).

**Is that interim state safe to merge alone? Yes.** Build 1 only removes ways into a held window and closes two security
faults; nothing a person can do today that is right stops working, and nothing new is held. The cost of merging it alone
is two bands' worth of unreachable code for the length of one build, and the 22-test file that proves them by a pick is
re-pointed, not deleted (§10 step 0). It must **not** be merged before its own FULL check (§10, last step).

---

## 2. Where the sizing file is wrong about today's code

| Sizing file says | What the code does |
|---|---|
| Three doors: the pick, the view switch, a bell line (§1, part B) | **Four families.** `state/store.ts landOnOwnPage` — run from `landOnOfferedPage` on every `notify()` — enters his own squadron (`enterSquadron(home, …, true)`) whenever any press opens a page a squadron he only views does not offer. It has no list of callers: a bell line, the bell's own taps, the OIL list's card, "Check my quals" (`ui/WelcomeBack.tsx`), and an Undo or Redo whose step lands on another page (`state/undo-wire.ts snapView`) all reach it. |
| "No one list covers the app… the shell's windows, the OIL list and the Tracker's each stand alone"; part A "each window registers as it opens and leaves as it closes", about twenty-five to register | **The frames already keep lists.** `ui/winorder.ts UP` holds every `FloatWin` that is up (joined by `forward(id)` in `ui/FloatWindow.tsx`'s own layout effect, left by `gone(id)` at unmount — ten ids); `leavewar/ui/Sheet.tsx OPEN` every Leave War sheet (23 uses of `<Sheet`), already read by `state/typing-hold.ts warWindowOpen()`; `ui/sheetfocus.ts sheets` every question sheet that holds the keys; `tracker/app/core.js endSession()` names every Tracker window it closes. I count about 45 open-states in 8 frames (§3.2), not 25 windows. |
| `ui/pops.ts` holds the schedule side's flags | True for 14 windows. Not there: ALL AVAIL, Changes and the OIL question put before a change (`state/view.ts AVAILWIN`, `CHGWIN`, `OILWAIT`); four movable windows whose open-state is a component's own (`inputsday`, `sansday`, `everywd`, `holiday`); the board's two dialogs (`ui/board.ts`, read from the page by `pops.ts windowOverSchedule`). |
| A change not saved — `ui/savestatus-source.ts readFailed()` | Right, but a door in `state/` may not import `ui/`. The same answer from the same saver is `storage/savewait.ts saveRefused()` (`main.tsx` hands one postman to both). |
| The view switch "asks nothing, the Tracker held under a cover" → ask at the view switch, both ways | The switch moves the Tracker only for a Plan holder or master admin with a squadron other than his home in view (`state/perms.ts pageUnit('own')` falls back to his home in the member view). For an admin at home it moves nothing. And no road reaches the switch **back** with unsaved edits on a Tracker that would move: a pick of a squadron he only views already asks (D2388). So the "switch back" wording has a path only where the Tracker would not move — question **N5**. |
| Part F: `ui/InputWindow.tsx`, `ui/OilDayList.tsx`, `ui/topstate.ts` | Also `state/belltap.ts enterForLine`; a third door (a holiday's bell line opening 142's OIL list over 149's View-only Sched — **N4**); and the stopped builder's Catch A — `engine/inputs.ts inputsListed` lists every input naming him on whatever squadron's Inputs page he has open (`ui/InputsPage.tsx inputsPageRows`, `ui/InputsCal.tsx calRows`) — **N2**. |
| "Ten test files pin" the held machinery | 37 test files press a pick or the view switch and 13 a bell line (§10 step 0). `ui/msq-pick-windows.test.tsx` alone has 22 tests that reach a held window by a pick the guard will now refuse. |
| Part B: `tracker/app/core.js` (the question's second wording) | Also `tracker/role.js trackerSwitchAsk`: the question's tail is built in core.js as `'switching to ' + to`, which cannot say "switching back to the admin view". |

---

## 3. Part A — one answer to "what is open"

### 3.1 The design chosen: one function over one table, each row reading the flag its window is already drawn from

**Not a registry that each window joins and leaves.** A registry is a second copy of "is it open" beside the flag the
window is drawn from, kept true only by a call at every way out. Four of this app's frames do not unmount when they
close — the schedule's veiled dialogs are `hidden`, not removed (`ui/Modals.tsx`, `ui/SchedBoard.tsx CxDialog`); the
Tracker's windows are module state set to `null` in a dozen places (`core.js`); ALL AVAIL and Changes keep a mounted
placeholder; `pops.ts resetPopsForSession` clears flags with no component told. A join whose leave is missed on one of
those paths leaves **a guard that refuses with nothing open, with no way out but a reload** — the worst fault this
feature can have. And a window added later that never joins is refused nothing, silently.

**One function that asks each existing flag** cannot go stale: the window is on screen exactly when its flag says so, and
the guard reads that flag. Its own fault is the mirror one — a new flag nobody adds to the table — and that one can be
caught by a test that reads the source (§3.4), which a missed `leave()` cannot.

So:

- **`src/ui/guard.ts` (new).** `GUARD_ROWS`: one row per open-state — `{ id, name, frame, where, open(), counts, why? }`.
  `open()` reads the live flag, nothing else. `counts` is `'window' | 'row' | 'unsaved' | 'no'`; a `'no'` row carries its
  reason in `why` and is in the table **so that the list is complete and a reader can see it was considered**. `where`
  is the page the thing is drawn on (`'any'` for one drawn over every page). `whatIsOpen(): { reason, row } | null`
  walks the rows in `GUARD_ORDER` and answers the first that is open and counts. `ui/` may import everything it must
  read: `ui/pops.ts`, `ui/winorder.ts`, `ui/sheetfocus.ts`, `state/view.ts`, `state/typing-hold.ts`,
  `tracker/role.js`, `storage/savewait.ts`.
- **`src/state/guard.ts` (new, no imports).** The doors live in `state/` and may not import `ui/`, so this file is the
  seam, in the repo's own pattern (`setWarWindowsProbe`, `setSessionWorldHook`, `onBeforeTrackerSwitch`):
  `setGuardAsk(fn)`, `setGuardSay(fn)`; `refusalAt(door, to)` — asks, says nothing; `refuse(door, to): boolean` — asks,
  and where refused says the note; `setEntryChecker(fn)` (§3.4, tests only). With nothing installed (a headless state
  test) nothing is ever open and nothing refuses — every existing state test keeps its meaning.
- **Who installs it.** `ui/guard.ts` installs itself as it loads, and it is imported by `ui/guardnote.ts`, which every
  door's own control imports (`SquadronMenu.tsx`, `Drawer.tsx`, `Shell.tsx`, `topstate.ts`) — so a build that can press
  a door has the guard. `test-support/msq-world.ts` imports it too.
- **Typing that lives inside a component** (Admin → Users' rows and forms — no module flag exists) reports through one
  small hook in `ui/guard.ts`, `useGuardWork(id, on)`: an effect that counts the id up while `on` and down in its
  cleanup, so React's own unmount is the leave. `id` is typed to the table's row ids — a report for a row that is not in
  the table does not compile. This is the only "join" in the design, and it has one way out by construction.
- **The Tracker's windows** are known only inside `core.js`, which Raptor must not import (it would pull the chart
  engine into the first download — `tracker/role.js`'s head). So: `core.js` gains one table, `TRK_WINDOWS` —
  `{ id, open: () => !!pop, close: () => { pop = null }, counts }` for each state `endSession()` clears today — and
  **`endSession()` closes by walking that table**, so the list the guard reads and the list a sign-out closes are one
  list. `tracker/role.js` gains `onTrackerWindows(f)` / `trackerWindowsOpen(): string[]` (the ids open that count),
  registered by `core.js` beside `onBeforeTrackerSwitch`. Never loaded: nothing open.

### 3.2 The windows, found in the code

`counts` is what the plan builds **unless he answers otherwise**; a cell naming a question waits on it (§8).
"Shaded" = the frame's own veil covers the bar, so no mouse reaches a door (the keys may — `e2e`, §4.6).

**(a) The shell's movable windows — `ui/FloatWindow.tsx FloatWin`. One row for the frame: `open() = winsUp().length > 0`
(a new read-only export of `ui/winorder.ts UP`), `where` by id. Not shaded: the page behind works (D641).**

| id | What | File · how it opens · how it closes | Its own flag | counts |
|---|---|---|---|---|
| `inputedit` | The Input window on the Inputs page | `ui/InputWindow.tsx`; `setInpEdit(r)`; Cancel / Close, Add / Save, ✕ and Escape (which ask when something is typed, D1622) | `ui/pops.ts INPEDIT` | window |
| `inputsday` | A day opened on the Inputs calendar | `ui/InputsCal.tsx renderPop`; a day tapped; ✕, Escape | the calendar's own state | window |
| `sansday` | A SANS day | `ui/SansDay.tsx`; ✕, Escape | the SANS calendar's own state | window |
| `inputsset` / `sansset` | Inputs / SANS calendar settings | `ui/InputsSettings.tsx`, `ui/SansSettings.tsx`; the gear or Logic's row; ✕, Escape, a page change (`VIEW_RESET 'page'`) | `pops.ts INPSET`, `SANSSET` | window |
| `days` | Calendar | `ui/DaysWindow.tsx`; ✕, Escape | `pops.ts DAYSWIN` | window |
| `everywd` / `holiday` | Every Monday · Add / Change a holiday | `ui/EveryWeekday.tsx`, `ui/HolidaysPanel.tsx`; opened from Calendar; ✕, Escape, their own Save | their opener's own state | window |
| `oilday` | The OIL list | `ui/OilDayList.tsx`; `setOilList(…)` — by itself when a holiday is saved, from a holiday's bell line, a sign-off box, a version loaded back; Save, Later, Close, ✕, Escape | `pops.ts OILLIST` | window (D2403 names it) |
| `lwday` | The Leave War's day panel | `leavewar/ui/DayPanel.tsx`; `openDayPanel(iso)`; ✕, Escape | `leavewar/ui/daypanelopen.ts OPEN` | window; `where: 'leavewar'` |
| — | The `?timing` readout (pull request 840) | a `FloatWin` with `bystander`, which never calls `forward(id)` | — | **no** — it never joins `UP`; §9 |

**(b) The two older movable windows — `ui/floatwin.ts useFloatWin` directly; flags in `state/view.ts`.**

| What | File · closes | Flag | counts |
|---|---|---|---|
| ALL AVAIL | `ui/AvailWindow.tsx`; ✕, Escape, a page or week change (`view.setPage`, `VIEW_RESET 'week'`) | `AVAILWIN` | window (H2) |
| Changes, opened out or folded to its bar | `ui/ChangesWindow.tsx`; the same | `CHGWIN` | window; folded too (H2) |

**(c) The schedule's veiled dialogs — `.airpop` / `.modal`, flags in `ui/pops.ts`. Shaded.**

| What | File | Flag | counts |
|---|---|---|---|
| The Input dialog opened from the week or the board | `ui/InputWindow.tsx` (its second return, `CURPAGE !== 'inputs'`; a press on its veil closes it unasked) | `INPEDIT` | window |
| Insights | `ui/Modals.tsx InsightsModal` | `INSIGHTS` | window |
| Duty templates · Flying waves · Day templates · Plans | `ui/DutyTplModal.tsx`, `WaveTplModal.tsx`, `DayTplModal.tsx`, `DraftsModal.tsx` | `TPLEDIT`, `WAVEEDIT`, `DAYTPLEDIT`, `DRAFTSEDIT` | window |
| The board's cancel-reason box · Sort all | `ui/SchedBoard.tsx CxDialog`, `SortAllDialog` (always mounted, shown by dropping `hidden`) | none in a module — read from the page as `windowOverSchedule` does: `#cxPop:not([hidden]), #sortAllPop:not([hidden])` | window (H2) |

**(d) The four veiled windows that leave the bar free — `ui/barfree.ts useBarFree` (D1645).** Any press on the bar other
than Undo or Redo closes them first (a `click` listener at the document's capture, keyboard clicks included), so by the
time a door's own handler runs their flag is already off.

| What | File | Flag | counts |
|---|---|---|---|
| Traffic · Day details ⓘ · Jump to a date · the document viewer | `ui/Modals.tsx AirPop`, `DayPop`; `ui/WeekCal.tsx`; `ui/DocViewer.tsx` | `AIRKEY`, `DAYPOP`, `WEEKCAL`, `DOCVIEW` | **no** — they close themselves at the press, as today (H2) |

**(e) The question sheets — `ui/sheetfocus.ts useSheetFocus` (the `sheets` list; `topSheet()`). Shaded.** One row,
`open() = !!topSheet()`: the OIL question, the upchit summary, the medical clash, "no document" (all raised inside
`InputWindow.tsx`), the medical move (`pops.ts MEDMOVE`, `ui/MedMoveConfirm.tsx`), the OIL question put before a change
(`state/view.ts OILWAIT`, `ui/OilWaitSheet.tsx`). counts: **window**. The Input window's own ask cards (`ui/AskCard.tsx`
— "Close it and lose them?", "Open … and lose them?") stand inside a window already counted.

**(f) The Leave War — `leavewar/ui/Sheet.tsx`. One row, `open() = warWindowOpen()`, `where: 'leavewar'`.** Not shaded
(`modal={false}`): a person's window / My leave (`PersonWindow.tsx`), Grades (`GradesSheet.tsx`), Required figures
(`ReqPanel.tsx`), Selected days (`SelectSheet.tsx`). Shaded: Place a bid and the four award / posting sheets
(`BidPicker.tsx`), Settings, Open for bidding, Events and an event, the OIL tracker and its settings, a counter, a day's
list, Remarks, Rename, a manning row, the closed note, New leave war. counts: **window**.
Not through `Sheet`, their state a component's own: the Legend and the under-manned list (`Chrome.tsx`, a scrim, a tap
outside closes), the flying working-out (`FlyRows.tsx .flywork`), an event's peek (`Matrix.tsx evPeek`), the bid
window's own pickers — counts: **no**, lists and peeks that a press outside closes (H2 names the Legend).

**(g) The Tracker — `tracker/app/core.js`, module state; everything is drawn inside `#page-tracker`. `where: 'tracker'`.**

| `TRK_WINDOWS` id | What | counts |
|---|---|---|
| `dlg` | Any of its questions and boxes (`components/Modals.jsx DlgModal`) — "+ Add …" prompts, Export, the unsaved-edits question itself | window (shaded) |
| `pop` (+ `popMsg`) | The marking window (`components/Pop.jsx`) | window |
| `infoId` · `editId` · `sylModalOpen` · `ordMode` · `copyOpen` | An event's ⓘ, the ball editor, Edit syllabus, Reorder, Copy (`Modals.jsx`) | window |
| `flexWinOpen` · `showAllOpen` | Flex settings (`FlexSettings.jsx`), Show All (`ShowAllPanel.jsx`) | window (Show All: H2) |
| `downLog` · `failLog` · `lullPick` · `lullCopy` | Down days, the fail log, the two lull pop-ups (`SidePanel.jsx`) | window |
| `arrangeMode` | Edit chart layout | **no** — a mode; with edits unsaved the Tracker's question answers for it (H2) |
| `showDetails` · `toolsOpen` | Details mode, the tools set | **no** — modes |
| — | The Legend (`Legend.jsx`), the File and course menus (`Header.jsx`): a component's own state | **no** — lists and menus |

**(h) Admin — a component's own state, reported by `useGuardWork` (§3.1).**

| What | File | counts |
|---|---|---|
| An opened row with something changed in it | `ui/UsersPanel.tsx PersonEditor` (`name`, `role`, `lines` against what it opened with), `ArchivedEditor` (`box`, `postIn`) | row (D2595; how far "typing" reaches: H3) |
| The same row, opened, nothing changed | | **no** (D2595 says "with typing") |
| "Give access" · "Add a person" · "+ New squadron", a place or a move being edited | `UsersPanel.tsx Waiting`, the add form; `ui/SquadronsPanel.tsx NewSquadron`, `MoveEditor`, `PlaceEditor` | H3 — recommended **row** once anything in them differs from how they opened |
| "Clear edit history…" armed | `ui/AdminPage.tsx ClearForm` | **no** — an inline two-tap control (press report A) |

**(i) Lists, menus and modes — in the table as `'no'` so the list is whole.** The bell's list (`pops.ts BELLLIST`), the
Schedules list (the component's own state in `ui/SquadronMenu.tsx` and `ui/Drawer.tsx DrawerSquadron`), the ☰ menu
(`DRAWER`), the Schedule Insights menu, the board's small menus (`.wavemenu`, `.stmenu`, `#sbMoreMenu`), a date box's
calendar (`ui/DateBox.tsx`), the Add-people picker (`InputsCal.tsx .ic-pick`); the Scheduler Board alone
(`state/view.ts SBDAY` — H2), OIL Earn (`OILDAY`), an armed slot (`ARM`), an armed "Discard N edits & load" or Withdraw
(`RESTARM`, `UNPUBARM`), Logic's edit mode (`state/auth.ts LGEDIT`), Edit quals, the "Set as default?" bar
(`SECDEFOFFER`), the "Not swapped" bar (`OILBAR`), the welcome-back card; and the one-shot hand-offs that are no window
at all (`OILASK`, `OILOWN`, `INPEDIT_REFOUND`, `AIRRID`, `BELLAT`, `INSIGHTS_ALL`, `OILSIGN_LATER`).

**(j) A change not saved.** One row, `counts: 'unsaved'`, `open() = saveRefused()` (`storage/savewait.ts` — the saver's
state is `'failed'`, the band "Not saved — keep this page open" with Retry). "Not kept" (`ui/savestatus-source.ts
readBand() === 'nokeep'`) is not a row: it never blocks (D2594).

**(k) Typing that is in no window** — a day's note, Help's bug box, a calendar's "+ Note", a Balances figure box, the
Logic search and Quals filter boxes: **not in Build 1** (H13 is not one of the five it waits on); a `'no'` row each,
`why: 'H13'`.

### 3.3 A window on a page that is not the one on screen — question N1

The Leave War and the Tracker stay mounted when another tab is shown (`leavewar/LeaveWarPage.tsx`, `tracker/TrackerPage.tsx`
— "kept mounted"), and their windows with them: `Chrome.tsx`'s own Escape handler exists because "the legend … left open
behind a tab switch must not swallow Escape", and `state/typing-hold.ts`'s head speaks of "a war window left open behind
another tab". So `warWindowOpen()` and the Tracker's flags can be true with **nothing of them on screen**. Refusing then
tells him to close a window he cannot see. `where` on each row is there for this: the function is built so that
"counts only while its page is the page shown" and "counts wherever it is" are one flag (`GUARD_HIDDEN`).
**Recommended (N1): a window on a page that is not on screen still refuses, and the note says where** — "Blocked: close
the open window on Leave War, then pick 149." `[WNS]` — because letting the pick through leaves that window behind a
switch he made (what D2403 rules out), and closing it for him loses a bid half typed. Until he answers, the row is built
to refuse with the ruled words and the case is **named on the questions page before the build starts**, not built on
this reading.

### 3.4 The tests that fail when a window is added without a row

New file **`src/ui/msq-guard-rollcall.test.ts`** (reads source; no app is mounted). Written first; each fails until
`GUARD_ROWS` exists.

| Test | What it asserts |
|---|---|
| R1 "every flag of ui/pops.ts has a row" | each `export let` in `ui/pops.ts` is the flag of a `GUARD_ROWS` row or is named in the table as `'no'` with its `why` — the shape of the existing `pops.test.ts` check against `POPS_RESET` |
| R2 "every movable window has a row" | every `<FloatWin id="…">` in a non-test file under `src/` is an id the `float` row knows (its `where` map), and the map names no id the source lacks |
| R3 "every frame is known" | every non-test file under `src/` that draws `role="dialog"`, `aria-modal`, `className="airpop…"`, `className="modal"` or `<Sheet ` is in the test's own census, mapped to a row id or to a `'no'` reason. **A window added in a new file fails here** with the words "give it a row in ui/guard.ts GUARD_ROWS" |
| R4 "the Tracker's list is one list" | every `tracker/components/*.jsx` that draws a dialog, a `.modal` or a `.pop` maps to a `TRK_WINDOWS` id; and `endSession`'s body sets no window state outside the table (a scan for the eleven names) |
| R5 "the doors are these, and no others" | the only non-test callers of `enterSquadron(` with a third argument, of `switchRoleInForce(`, `switchRoleView(`, `pickSquadron(` and `enterForLine(` are the ones in §4.1's table. **A new way to change the squadron or the view fails here** until it has a row |

And one check that runs under every existing test, in the pattern of the order's §8 point 1 (the global set-up
`src/testing/marks-guard.ts` already installs one): **`state/guard.ts setEntryChecker`** — installed by the test set-ups
(`src/testing/` and `src/leavewar/test-setup.ts`), a no-op in production. `enterSquadron` with `byPick` true and
`switchRoleInForce` call it first; it throws if `refusalAt` would refuse at that moment. So any test in the suite that
reaches a squadron or view change by his own press with something open — through a door this plan missed — fails by
name. Its allow-list (a test file that drives the raw entry on purpose, §10 step 0) is in the checker's own file, each
entry with its reason, and Build 2 empties it. One test feeds the checker a broken example (R6).

### 3.5 Part A's own tests, in the order written — `src/ui/msq-guard-open.test.tsx` (jsdom, `test-support/msq-world`)

Each window is opened **through the app's own opener and component**, never by setting a flag.

| # | Name | Asserts |
|---|---|---|
| A1 | nothing open | `whatIsOpen()` is null for an admin at home, an admin by Plan on 149, a master admin, a member with View |
| A2 | every row that counts is seen, and gone when it closes | a loop over `GUARD_ROWS` where `counts !== 'no'`: the test's own map gives each row its opener and each of its ways out (✕, Close / Cancel, Escape, Save); opened → the row's id; after each way out → null. **A row with no entry in the map fails** |
| A3 | what does not count | a loop over the `'no'` rows: opened → null |
| A4 | two open | an Input window and a failed save: the window's row; closed → `unsaved`; saved → null |
| A5 | "Not kept" | `setStorageKept(false)`: null |
| A6 | a Users row | opened, nothing changed → null; a letter typed in Sign-in → `row`; put back as it was → null; Cancel, Escape, a second tap on the name, Save → null; another Admin section shown (the panel is hidden, not removed — `AdminPage.tsx`) → as §8 H3 |
| A7 | a window on a hidden page | a person's Leave War window open, then the Inputs tab: as N1 |
| A8 | the Tracker | each `TRK_WINDOWS` row opened by its own opener → reported through `trackerWindowsOpen()`; `endTrackerSession()` → none; the Tracker never loaded → none |
| A9 | nothing stale after a sign-out or an unmount | `resetSession(null)` with five windows open → null; a `FloatWin` whose parent unmounts without its ✕ → null |

---

## 4. Part B — the doors refuse

### 4.1 Every way the squadron in view or the view changes by his own press

"The door" is the function the check is written in — never the control. No blank cells.

| # | His press | Reaches | Refused by the guard? |
|---|---|---|---|
| 1 | A row of the bar's Schedules list (`ui/SquadronMenu.tsx` `pick`) | `state/pick.ts pickSquadron` | **Refused** — in `pickSquadron` |
| 2 | A row of the ☰ menu's list (`ui/Drawer.tsx DrawerSquadron` `pick`) | `pickSquadron` | **Refused** — the same line; the menu then closes (H11) |
| 3 | The role badge, both ways (`ui/Shell.tsx #roleBadge`) | `state/store.ts switchRoleView` | **Refused** — in `switchRoleView` |
| 4 | The ☰ menu's "Switch to the member view" / "Back to the admin view" (`Drawer.tsx #drawerRole`) | `switchRoleView` | **Refused** — the same line |
| 5 | The Input window's own "Back to the admin view" chip (`InputWindow.tsx` `inped-rolechip`, drawn only on a window the member view holds) | `switchRoleView` | **Must not be** — it is the held window's own way back, and the only window open is the one it gives back. It passes `{ heldChip: true }`, which skips the window rows and still asks the unsaved row. No press reaches that state after Build 1 (pinned, B16); Build 2 removes the chip |
| 6 | A bell line of a squadron his own pages are not on (`ui/topbits.tsx BellList` → `ui/topstate.ts openNotice`) | `state/belltap.ts enterForLine` → `enterSquadron` | **Refused** — in `enterForLine`; the line stays unread, the list open (§3 of the scenarios file) |
| 7 | A bell line of his own squadron, pressed while a squadron he only views is picked — its page is not offered there, so his squadron comes back | `openNotice` → `setPage` → `store.ts landOnOwnPage` | **Refused** — in `enterForLine`, whose "would this move him" test gains this case (§4.5), before anything is asked for or marked |
| 8 | The bell itself, an access request of another squadron (`topstate.ts bellTap` → `belltap.ts openBellRequest`) | `enterForLine` | **Refused** — the same line; the note's words are H7 |
| 9 | The bell itself, his own unanswered OIL question on an input of another squadron (`bellTap`, the `oilHit` branch) | today **nothing** — `openInputOnPage` with no entry (security F2) | **Refused** — once part F routes it through `enterForLine` (§5.3) |
| 10 | A card of the OIL list (`ui/OilDayList.tsx Body openInput`) | today `setInpEdit` then `setPage` (security F1) | **Must not be reachable as a change of squadron** — a pick is refused while the list is open, so the list is never another squadron's; part F adds the belt (§5.3) |
| 11 | A holiday's bell line, a squadron he only views picked — 142's OIL list opens over 149's View-only Sched (`openNotice`, the `oilhol` branch: no page changes, so no landing) | `setOilList` | **MISSING — waits on N4.** Today nothing changes the squadron; the fault is the list under the wrong number, and its card then is row 10 across squadrons |
| 12 | "Check my quals" on the welcome-back card, a squadron he only views picked (`ui/WelcomeBack.tsx`) | `view.setPage('quals')` → `landOnOwnPage` | **MISSING — waits on N3** (no ruled words fit a press that is not a bell line). As today until then; in the checker's allow-list by name |
| 13 | Undo or Redo whose step lands on one of his own pages, a squadron he only views picked (`state/undo-wire.ts snapView`) | `setPage` → `landOnOwnPage` | **MISSING — waits on N3**; falls away in Build 3 (D2593: Undo reaches only the squadron in view) |
| 14 | A page tab or a ☰ menu page (`Shell.tsx nav`, `Drawer.tsx go`) | `setPage` | **Must not be** — a tab changes the page, never the squadron: while a squadron he only views is picked the tabs that would bring his own back are not drawn (`Shell.tsx hidden={viewOnly}`, `Drawer.tsx pageOffered`). Pinned (B17) |
| 15 | The Scheduler Board's own bell (`ui/SchedBoard.tsx #sbBell`) | rows 6–9 | **Refused** as rows 6–9 — one `BellButton`, one `bellTap`. The board alone is not a window (H2); its cancel-reason box and Sort all are |
| 16 | Logout (`ui/logout.ts logOut`) | `resetSession(null)` | **Must not be** — D2592: never refused. Unchanged in Build 1 |
| 17 | Signing in (`ui/Login.tsx` → `resetSession`) | `enterSquadron`, `byPick` false | **Must not be** — nothing can be open; not a press inside the app |
| 18 | A key | — | **None exists.** No shortcut picks a squadron or switches the view (`ui/interactions.ts`, `Shell.tsx navKey`: Enter and Space press the control under the keys, which is rows 1–15). Pinned by R5 |
| 19 | A link or the browser's Back | — | **None exists.** No page or squadron has an address (`location.hash` is read only by `ui/dragdbg.ts`, a developer's switch) |
| 20 | Not his press: his own move at midnight, a right taken away, a held war window closing, the Tracker following once held work is gone (`store.ts maybeReenter`, `refreshAccess`; `typing-hold.ts warWindowGone`; `core.js followIfHeld`) | `enterSquadron`, `byPick` false | **Must not be** — "a change he did not make keeps today's handling" (D2403) until Build 2's card (D2405). Pinned (§7, P5) |

### 4.2 The order of the checks at every door

1. **Is the press a change at all?** The squadron already in view picked (`u === UNIT`); a person who may not switch
   (`mayViewAsMember()` false); a line whose squadron his pages are already on, or may never be on (`enterForLine`'s
   `'here'` and `'no'`). → exactly as today, nothing asked, nothing said.
2. **The guard.** `refuse(door, to)`. Refused → the note, and the function returns having changed nothing: no flag, no
   page, no line marked read, no list closed by it.
3. **A save still going** (H8, §8).
4. **The Tracker's question**, where the press would take the Tracker off unsaved chart edits.
5. **After the question is answered Save or Discard, step 2 again** — a window or a failed save may have arrived while
   it stood (§11, risk 1) — then the change.

### 4.3 `state/pick.ts`

- `pickSquadron(u)`: after `if (u === UNIT) return`, `if (refuse('pick', u)) return`. In the `ask.then`, before
  `enterPicked(u)`: `if (u === UNIT || refuse('pick', u)) return`.
- `pickWillAsk(u)`: false where the guard would refuse (the ☰ menu reads it to decide whether to close "for the
  question").
- New `pickRefused(u): boolean` = `u !== UNIT && !!refusalAt('pick', u)` — for the ☰ menu, which must know before it
  touches its own list (as `pickWillAsk` exists for the same reason).
- `ui/Drawer.tsx DrawerSquadron pick`: `setOpen(null)`; then where `pickRefused(u)` or `pickWillAsk(u)` — `setDrawer(false);
  notify()`; else the keys back on the button; then `void pickSquadron(u)`. So a refused pick closes the menu and the note
  stands at the foot with the window in sight, as drawn (`p3-p`). H11 decides this line.
- `ui/SquadronMenu.tsx pick`: unchanged — it already closes its list and puts the keys back on `#sqnMenuBtn`, which is
  where the note then hangs.

### 4.4 `state/store.ts switchRoleView`

Today it is one synchronous body that asks nothing. It becomes:

1. `if (!mayViewAsMember()) return`; `const toMember = isAdmin()`.
2. `if (refuse(toMember ? 'toMember' : 'toAdmin', null, opts)) return` — `opts.heldChip` for row 5.
3. **The Tracker's question.** New in `tracker/role.js`: `trackerSwitchAsk(to, back = false)`; in `core.js` the
   registered `ask(to, back)` builds its last line as `'Save them before switching ' + (back ? 'back to ' : 'to ') + to
   + '?'` — so a pick's question is byte for byte today's. Called with `('the member view', false)` and `('the admin
   view', true)`: "You have unsaved chart edits on “2026”. Save them before switching to the member view?" (drawn, `p5`;
   no ruling row names that drawing) and "…Save them before switching back to the admin view?" `[WNS]` (N7 of the words
   read: read by a fresh Fable, not put to him). **When it is asked: N5** — recommended always when `trackerSwitchNeeds()`,
   as `p5` draws it on his own squadron. The answers are the pick's: Stay — nothing; Discard them — the chart reloaded,
   then the switch; Save them — saved, then the switch; a Save that does not take — he stays (`core.js saveForQuestion`).
4. After Save or Discard: step 2 again, then today's body — `switchRoleInForce`, `bumpNav`, the landing off Edit Schedule
   and Admin, `armDrop`, `setLgEdit(false)`, `clearAdminOpen`, `lwSetRole`.
5. **Where the switch moves his own pages** (`pageUnit('own')` before it is not `pageUnit('own')` after — a Plan holder
   or master admin with another squadron in view): `enterSquadron(UNIT, false, true)` **before** `notify()` — the entry
   his own press makes, so `rebindStorageUnit(own, mayHold = false)` moves the Tracker (`core.js follow` → `'moved'`) and
   a chart editor open with nothing unsaved closes as it does at a pick. Without this line the move is left to
   `maybeReenter`, whose entry is not "by pick", and `trkMayHold()` holds the Tracker under the member-view cover for
   an open editor — the state D2403 says his own switch must not leave. *For the red team:* the `notify()` after it runs
   `maybeReenter` once more with `mayHold` true while the Tracker's move is still under way; `follow`'s first call has
   already run `leaveSquadron` up to its first wait, which ends the editor (`endSession`), so the second call finds
   nothing to hold. B14 pins the result, not this reasoning.
6. `notify()`.

`switchRoleView` now answers a promise where it asked. Its three callers ignore the result (`onClick`), as `pick`'s do.

### 4.5 `state/belltap.ts enterForLine(u, again, door = 'line')`

- **"Would this tap move him" gains one case.** Today: `!u || u === pageUnit('own')` → `'here'`. A line of his own
  squadron pressed while a squadron he only views is picked (`u === pageUnit('own') && u !== UNIT`) also moves him — the
  page it opens is not offered there and `landOnOwnPage` brings his squadron back. That case is now judged here:
  refused → `'refused'`; else `'here'` as today (the landing still does the entering). Two lines that open nothing — an
  input since deleted, a posting of a man since deleted — are refused with it though they would not have moved him:
  accepted (after Retry the press does what it would have done), and said on the evidence sheet.
- Where it would enter (`ownPageMayBe(u)`): `if (refuse(door, u)) return 'refused'` before the Tracker's question.
  `again` re-runs the whole tap after Save or Discard, so step 5 of §4.2 needs no code here.
- `LineEntry` gains `'refused'`. `ui/topstate.ts openNotice`: `if (where === 'asked' || where === 'refused') return` —
  it stands before `markNoticeRead` and `setBellList(false)`, so the line stays unread and the list open with no further
  change. `openBellRequest`: `'refused'` answers true (the tap was taken), `door: 'bell'`.

### 4.6 The note, and how `ui/toast.ts placeToast` learns the control

**The words** — one table in `ui/guard.ts`, `guardWords(reason, door, to)`; the number is the squadron's
(`unitById(to)?.num`).

| Door | A window open — D2590 `[ruled]` | An opened row — D2595, words R3 / N3 | A change not saved — D2594, words N4 |
|---|---|---|---|
| pick | "Blocked: close the open window, then pick 149." | "Blocked: save or cancel the open row, then pick 149." `[WNS]` | "Blocked: press Retry to save your changes, then pick 149." `[WNS]` |
| to the member view | "…then switch to the member view." | "Blocked: save or cancel the open row, then switch to the member view." `[WNS]` | "Blocked: press Retry to save your changes, then switch to the member view." `[WNS]` |
| back to the admin view | "…then switch back to the admin view." | no road reaches it (the Admin page is not drawn in the member view): **not built**; a test asserts the state cannot be made (B18) | "Blocked: press Retry to save your changes, then switch back to the admin view." `[WNS]` |
| a bell line | "…then press this line again." | "Blocked: save or cancel the open row, then press this line again." `[WNS]` | "Blocked: press Retry to save your changes, then press this line again." `[WNS]` |
| the bell itself (H7) | "Blocked: close the open window, then press the bell again." `[WNS]` | "…the open row, then press the bell again." `[WNS]` | "…then press the bell again." `[WNS]` |

Every row but the first column's four is built only on his answer (the adjusted words; H7). **Which reason is named
first** when two apply is `GUARD_ORDER` — recommended window, row, unsaved (§3 of the scenarios file: his to answer).

**Where it stands.** The approved drawings, measured from the script that drew them
(`scripts/handpass/n166/draw-beside.mjs`): `p1b` — the note's top 8px below the top bar's foot, its left edge on the
picker's (`#sqnMenuBtn`), the list closed; `p2b` — the same height, its right edge on the badge's (`#roleBadge`); `p4b` —
under the pressed line inside the bell's list where it fits, else 8px under the list on its left edge (the drawing shows
it under the list), the list still open; `p3-p` — at the foot on a phone, the ☰ menu closed.

**How `placeToast` learns the control.** It cannot ask "what was pressed last" (`ui/lastpress.ts`): the pressed row is
gone with its list by the time the note is raised. So the door says, and one table maps it:

- `ui/toast.ts`: `export type NoteAt = { under: () => HTMLElement | null; edge: 'left' | 'right'; below: 'bar' | 'self';
  inside?: () => HTMLElement | null }`; `toastAt(msg, at)` sets a module `AT` and calls `toast(msg, 'blocked')`. Any
  other `toast()` clears `AT`, so the next ordinary note is back in its ordinary place. Inside an open batch `toastAt` is
  a plain `toast` (no door runs inside the publish batch).
- `placeToast()`: where `AT` is set and `noteAtFoot()` is false and `AT.under()` is on the page and drawn
  (`getClientRects().length`) — `top` = (the bar's foot, `under.closest('.topbar, .sb-top')`, for `below: 'bar'`; the
  control's foot for `'self'`) + 8; `left` or `right` from the control's edge; `bottom: auto`, `transform: none`,
  `data-at="ctl"`. Then two checks in the same call: the note is clamped 8px inside the screen's sides; and **if its box
  meets the ✕ of any window on screen** (`.floatwin .win-x`, `.airpop-head .x`, `.modal-head .x`, the ✕ each Leave War
  sheet draws in its `.bidsheet-hd` — one constant; the last selector is the builder's to read off the sheets, §14) it
  falls back to the foot, today's place — D2590's "never the window's ✕". Otherwise today's code runs untouched.
  The rise-in in `toast()` reads `data-at`: an anchored note drops into place, with no sideways shift.
- `noteAtFoot()` — **the one predicate for "a phone" for this note** (H11): recommended `matchMedia('(max-width:820px)')`
  — the width at which `09-week-responsive.css` shows ☰ and hides the tabs and the badge — **or the door was pressed
  inside the ☰ menu**. At the foot the existing rule still applies: on a phone with a shell window up the note is drawn
  at the top (D731 (1) — `placeToast`'s `up`), which is where D731 and D2590 meet; recommended that D731's rule stands
  for this note too (its reason — never over the window's own buttons — holds), `GUARD_NOTE_OVER_WINDOW` the one line
  that changes it.
- **The sizes between.** ≤620 (`ui/floatwin.ts phoneLayout`): the windows are panels, the note at the foot or the top.
  621–820: the bar still shows the picker, the badge is hidden, the list is a sheet — recommended the foot (H11). Above
  820: under the control; where the page names have folded into ☰ on a desktop (`ui/navfold.ts`) and the pick is made
  inside it, the foot.
- **A control that is not there when the note is raised** (the bell's list closed by Escape in the same instant; the
  badge at a width that hides it): `under()` answers null or is not drawn → the foot. **While it shows**, the place is
  worked out again only on a window `resize` and when a shell window opens (`FloatWindow.tsx` already calls
  `placeToast`) — a note is not moved about while it is read (`toast.ts`'s own rule); if the control has gone by then,
  the foot.
- `ui/guardnote.ts` (new): the table door → `NoteAt` — `pick` → `#sqnMenuBtn`, left, bar; `toMember` / `toAdmin` →
  `#roleBadge`, right, bar; `line` → the pressed line (`[data-testid="bell-line-<id>"]`), inside `.bell-list`; `bell` →
  the bell on screen (`pops.ts BELLAT`, else the visible `.bellbtn` — `#sbBell` on the board), right, bar. It is the
  `setGuardSay` function. With no page (a headless test) it is `HOOKS.toast(words, 'blocked')`.
- The note is told to a screen reader by `toast()` as every note is (`sayToReader`); the keys stay on the control
  pressed (the picker's button, the badge, the line).

### 4.7 Part B's tests, in the order written

**`src/ui/msq-guard-doors.test.tsx`** (jsdom; the real `SquadronMenu`, `Drawer`, `Shell`'s badge, `BellList`, the real
stores through `test-support/msq-world`; each press is a click on the real control). "Window" below is an Input window
on Inputs with a word typed, opened by its own door, unless named.

| # | Name | Asserts |
|---|---|---|
| B1 | a pick with a window open is refused — the bar's list | Saber on 142, a row "149" clicked: `UNIT` still 142, the war's world and the Tracker's door unchanged, the window still live with its word, the note's words `[ruled]`, the list closed, the keys on `#sqnMenuBtn` |
| B2 | the ☰ menu's list | the same; and the ☰ menu closed (H11) |
| B3 | 149 → 142 | Hunter with Plan, on 149, a window open, picks 142: refused, "…then pick 142." |
| B4 | every window refuses | a loop over the rows of §3.2 that count and are not shaded, each opened by its own door: B1's assertions |
| B5 | the view switch, both ways, both controls | the badge and `#drawerRole`; to the member view and back; an admin at home, an admin by Plan on 149, a master admin: the role in force unchanged, `CURPAGE` unchanged, the Leave War's role unchanged, the note's two endings `[ruled]` |
| B6 | a bell line to another squadron | Hunter on 149, a 142 line clicked: refused; `isUnread` still true; `BELLLIST` still true; `UNIT` 149; "…then press this line again." `[ruled]` |
| B7 | every family of line | an input's, a Leave War decision, bidding opened, a posting, a holiday's: B6's assertions; a line about his own account: opens nothing, is read, **no note** |
| B8 | a line of his own squadron from a squadron he only views | Ranger (View of 149), 149 picked, a window open (ALL AVAIL made on a fresh day), a 142 war line: refused, 149 still in view, nothing ringed on the Leave War when its tab is next opened from 142 |
| B9 | the bell itself — an access request | H7: refused, Admin → Users not opened, `ADMINOPEN` null, the note's words `[WNS]` |
| B10 | a change not saved | the saver made to fail (the stand-in the repo's own tests use for `'failed'`): each of B1, B2, B5, B6 refused with the Retry words `[WNS]`; Retry lands → a fresh press goes through; **nothing happens by itself when the save lands** — `UNIT` unchanged after the timers run |
| B11 | an opened Users row with typing | a pick by each list, the switch to the member view, a bell line: refused, the row still open with its typing `[WNS]` |
| B12 | two reasons | a window and a failed save: the window's note; the window closed, pressed again: the Retry note; never the Tracker's question |
| B13 | the refusal before the Tracker's question | a window open **and** unsaved chart edits: refused, `core.dlg` null — no question was raised |
| B14 | the Tracker's question at the switch to the member view | Hunter on 149's Tracker, a ball moved: the question's exact words; Stay → admin still, the edit kept; Discard → member view, the chart as stored, **no cover band, `storageHeld()` false, the Tracker on 142** after `whenUnitSettled()`; Save → saved in 149's record, then the same. And with Edit chart layout open and nothing moved: no question, the editor closed, no cover |
| B15 | …and back | as N5 decides: the question's words `[WNS]`, its three answers |
| B16 | no press makes a window held by a pick or by the member view | after every refused press of B1–B11 no `[data-heldro]`, no held band (test ids `inped-moveband`, `move-band`, `trk-move-band`), no `inped-rolechip` is on the page |
| B17 | a page tab never changes the squadron | Ranger with 149 picked: the bar and the ☰ menu draw View-only Sched and Help alone |
| B18 | no road to "switch back" with a row open | in the member view the Admin page is not drawn and `useGuardWork`'s count for the row ids is 0 |
| B19 | a window that arrives while the question stands | the Tracker's question up for a pick; the saver fails; Discard: refused with the Retry note, `UNIT` unchanged |
| B20 | a save still going | H8: a change made and a pick pressed in the same tick: the save is sent first, lands in 142's record, then the pick; made to fail → refused |
| B21 | sign-out and the next person | a refused pick, then Logout: the note is gone (`clearToast`), nothing open, `whatIsOpen()` null for the next sign-in |

**`src/ui/msq-guard-note.test.tsx`** (jsdom — which control, which words, never the geometry): the door → `NoteAt` table
row by row; `toastAt` then a plain `toast` returns to the plain place; the reader's region carries the words; the note's
look is the blocked face (`data-face="blocked"`, the lead "Blocked:").

**`e2e/msq-guard.spec.ts`** (new; **needs a browser** — jsdom has no layout): at 1536×864, in a browser started at 125%,
at 2560, at 1366 (the bar on two lines), at 1100 (the pick inside ☰), 768×1024, 874×402 and 402×874 — the note's box
against `p1b`, `p2b`, `p4b`, `p3-p` (top, left or right edge, within 2px); it never meets a window's ✕, with the window
dragged under the badge; it is the front layer at every point of its box; with the "Not saved" band up the bar is a
line taller and the note still clears it; a refusal moves neither the picker nor the badge (lesson 27); the three doors
reached by Tab and Enter over each shaded window answer as by mouse; on a phone, the panel windows that leave the bar
free (the Leave War's day panel at its lower height). Each test builds its own state and asserts it is there before the
press (the order's §8 point 4).

---

## 5. Part F — the Input window records the input's own squadron

### 5.1 The root

`ui/InputWindow.tsx InputEditor` notes, when a window opens, **the squadron its page shows** (`openedOn.unit = pageSqn`,
l.226–229) and is held only when the page later shows another (`held`, l.232). So an input of 142 opened while 149 is in
view by someone with rights in both is noted as "opened on 149": live, no band, and Save, Delete and the OIL answer
write 142's record under a bar saying 149; a later pick of 142 then holds it with an untrue band. The commit gate does
not stop it — he has the right in both (the security read's opening paragraph).

### 5.2 What is recorded, and what each read becomes

**Recorded:** in the same note, `unit` becomes **the input's own squadron**, worked out once as the window takes up a
record: a new input — the squadron its page shows (as today: it has no other); a saved input — the page's squadron where
the input touches it (`engine/inputs.ts inputSquadrons(r)` includes it — an input naming men of both is listed, and
opened, on either), else `inputUnitOf(r)`. One function, `ownSqnOf(r, pageSqn)`, beside the note. (The stopped builder's
reading, taken whole.)

| Read today | Becomes |
|---|---|
| `openedOn.unit = pageSqn` (two places) | `ownSqnOf(r, pageSqn)` |
| `held = openedSqn !== pageSqn \|\| …not offered…` | the same line, `openedSqn` now the input's own — so an input of another squadron is held **from the moment it opens**, by whatever door, and judged on every draw (the builder's Catch B: never only at opening) |
| `heldWindowBand(openedSqn)` → `store.ts heldWords` | unchanged call; it now names the input's squadron, so the band over a 142 input reads "This is 142's. You picked 149 — close this to go on." (D2323's words, true at last) where a pick brought 149, else the generic words (Catch C — unchanged, and gone in Build 2) |
| `swapOn` — a second copy of "which squadron" for the swap question | reads the note's `unit`: one field (the security read's tidiness note) |
| `pickUnit` — whose people the Person list offers | `isNew ? openedSqn : (inputUnitOf(r) ?? UNIT)` — unchanged in meaning; named so the builder does not fold it into the note (a two-squadron input's list is its first day's squadron's) |
| `heldByMemberView(openedSqn)` | unchanged call |

**What Build 2 inherits:** the note's `unit` stays; what a held window looks like changes there.

**His own input, listed on another squadron's page — N2.** `inputsListed` shows Hunter his own 142 leave on 149's Inputs
page. Under the table above a tap on it opens greyed: "This is 142's. You picked 149 — close this to go on." Recommended:
**it opens live where he is** — `ownSqnOf` answers the page's squadron for an input that page lists because it names
him — since the list shows it there on purpose and his own inputs stay filed in his primary (D2197). His to answer; one
clause of `ownSqnOf`.

### 5.3 The doors

1. **The OIL list's card** — `ui/OilDayList.tsx Body openInput`. Becomes: `const where = enterForLine(unit, () =>
   openInput(r))`; `'asked'` or `'refused'` → nothing; then the page first and the window after it, the input found
   afresh by its id — through `topstate.ts openInputOnPage`, exported for it, so the window never opens before its page
   (the fault that function was written for). After Build 1 a pick is refused while the list is open, so in every state
   a press can reach `where` is `'here'`; the line is the belt.
2. **The bell's own OIL tap** — `ui/topstate.ts bellTap`, the `oilHit` branch. After `row` is found:
   `const where = enterForLine(inputUnitOf(row), () => bellTap(from), 'bell')`; `'asked'` or `'refused'` → return; then
   `openInputOnPage` as today. `'no'` (his pages may not be that squadron's) opens it as today, and the root holds it.
3. **A holiday's line, a squadron he only views picked — N4.** Recommended: his own squadron comes into view first
   (the entry `landOnOwnPage` makes, the Tracker's question with it), then the list — so the list never stands under
   another squadron's number. Built only on his answer.

### 5.4 The reader's two leads

- **The Leave War's clash note** (`leavewar/ui/Chrome.tsx goClash` → `leavewar/sync.ts openInputWindow`: `setPage`, then
  `setInpEdit`). It could be pressed under 149 only while a war window held 142's war across a pick — a state no press
  reaches after Build 1. Left as it is; the root holds the window if a road is ever found; F6 pins that none is.
- **The Inputs calendar's just-saved row** (`ui/InputsCal.tsx renderPop`: `saved`, `revealed` — the row it puts at the
  head of the opened day's list, found by `savedId` in all of `INPUTS`). Whether it outlives a pick and shows a 142 card
  in 149's day cannot happen with the day's window open (a pick is refused); with the window closed and opened again on
  149 it can be asked. F7 is written to answer it: save an input, close the day, pick 149, open the same date. **If it
  fails, the fix is `savedId` cleared where the calendar's squadron changes — one line; if it passes, F7 stays as the
  pin and nothing is changed.** Not verified by reading alone (§14).

### 5.5 Part F's tests — `src/ui/msq-guard-input-sqn.test.tsx`, in the order written

| # | Name | Asserts |
|---|---|---|
| F1 | the bell's OIL tap brings the input's squadron into view | Hunter (Plan of 149), 149 picked, his own 142 weekend duty unanswered, the bell tapped: `UNIT` is 142, the window is 142's, live; its Save writes 142's record under a bar saying 142. **Fails today:** live under 149 |
| F2 | …and is refused with a window open | the same with a window open on 149: refused (H7's words `[WNS]`), no window, no OIL question |
| F3 | …and waits for the Tracker's question | unsaved chart edits on 149: the question first; Stay → nothing opens; Discard → F1. A man other than the one who pressed, or the question answered by someone else meanwhile: nothing (the existing `tracker/msq-bell-recheck-after-ask.test.tsx` stays green unchanged) |
| F4 | the root, by a door no press reaches | the test opens a 142 input under 149 by `setInpEdit` directly (said in its name: "a belt — no press reaches this"): held at once; its band names 142; Save, Delete, Take me out, the OIL answer and Enter in a field write nothing; pick 142 → live again |
| F5 | the OIL list's card | 142's list open on 142: a card opens the input on Inputs, the page first; with `enterForLine` made to answer `'refused'`: nothing opens, `INPEDIT` null |
| F6 | no press opens the clash note across squadrons | with any war window open every pick is refused (B4 covers the war's rows); so the clash note is never under another squadron's bar |
| F7 | the just-saved row | as §5.4 |
| F8 | an input naming men of both squadrons | opened on 142's page and on 149's: live on both (it touches both) |
| F9 | his own input on another squadron's page | as N2 decides |
| F10 | the swap question's squadron | the existing `ui/msq-pick-swap-question.test.tsx` re-pointed (§10 step 0); the question and the note read one field |

---

## 6. The twin paths

Every behaviour's twins, each with a test of its own (a number in §3.5, §4.7, §5.5, §7; "e2e" = `msq-guard.spec.ts`).

| Twins | Tests |
|---|---|
| The bar's Schedules list · the ☰ menu's list | B1 · B2; B10 and B11 loop over both; P1 both |
| The badge · the ☰ menu's button · the Input window's own chip | B5 loops over the first two; B16 the chip's absence |
| To the member view · back to the admin view | B5, B14 · B15, B10 both endings |
| A bell line · a tap on the bell itself (access request; his own OIL question) | B6, B7 · B9, F1, F2 |
| The top bar's bell · the Scheduler Board's bell | B6 run from `#notifyBell` and from `#sbBell` |
| A line that enters another squadron · a line that brings his own back | B6 · B8 |
| Mouse · touch · keys | the unit tests click (a keyboard click is the same event); e2e: Tab and Enter over each shaded window, a touch tap in WebKit on the phone sizes |
| Desktop · phone · the sizes between | e2e at the eight sizes of §4.7 |
| An admin at home · an admin by Plan · a master admin · a member with View | A1; B5 the first three; B8 and B17 the member with View (he has no view switch: asserted) |
| 142 → 149 · 149 → 142 | B1 · B3; F1 is 149 → 142 by the bell |
| A window that counts · one that does not | B4 · P4, P10, P12, P13 |
| A window open · a row with typing · a change not saved · two at once | B1 · B11 · B10 · B12 |
| Nothing unsaved on the Tracker · unsaved chart edits · the editor open with nothing moved | P1, P11 · B13, B14 · B14's last line |
| The window's own way out, each one | A2 (the guard's answer after each) |

---

## 7. What must stay as today — pinned before the changed half

New file **`src/ui/msq-guard-asis.test.tsx`**, written and seen **green on today's code first**, then never edited by
the build. Where an existing file already pins the behaviour it is named instead and must stay green unchanged.

| # | As today | Pinned by |
|---|---|---|
| P1 | A pick with nothing open goes through at once, nothing asked, nothing said — both lists | new |
| P2 | The squadron already in view picked: nothing happens, no note; the list closes | new (`pick.ts` `u === UNIT`) |
| P3 | The Tracker's question at a pick: its words, Stay / Discard them / Save them, a squadron he only views picked, the ☰ menu closing first | `tracker/msq-trk-pick-ask.test.tsx` (20 tests), `tracker/msq-trk-ask-keys.test.tsx` — unchanged |
| P4 | Menus and lists close as today and refuse nothing: the bell's list, the Schedule Insights menu, a board's small menu, a date box's calendar, the Leave War's Legend | new — each open, a pick goes through, the list is gone |
| P5 | A change he did not make: his own move at midnight with an Input window, a Leave War window, the chart editor open — the held window, its band and its Close; a right ended under a window | `ui/msq-fix-sched-windows-midnight.test.tsx`, `state/typing-hold.test.tsx`, `state/typing-hold-grid.test.tsx`, `state/reshape-r6-reenter.test.tsx`, `leavewar/ui/msq-fix2-r2-held-figure.test.tsx`, `state/msq-fix2-tracker-moved-master.test.tsx` — unchanged; plus new: **the guard is not asked** on that road (a spy on `refusalAt`) |
| P6 | "Not kept" blocks nothing | new — the three doors go through with the band up |
| P7 | Sign-out is never refused: with a window open, with a change not saved, with both — the session ends as today | new, beside the existing logout tests |
| P8 | A bell line of the squadron his pages are on, an Input window open with typing: the window's own "Open Hunter’s input and lose them?" | new (the press report's bell case) |
| P9 | A line about his own account opens nothing and is read | `ui/msq-bell-tap.test.ts` — unchanged |
| P10 | Traffic, Day details, Jump to a date and the document viewer close at a press on the bar, and the pick goes through | new (H2) |
| P11 | An admin at home, nothing open, no chart edits: the badge switches him at once, both ways | `ui/memberview.test.tsx` — unchanged |
| P12 | Modes are not windows: OIL Earn, an armed slot, an armed "Discard N edits & load", Logic's edit mode, Edit quals — the pick goes through and each is cleared as today | new |
| P13 | The Scheduler Board alone: a bell line to another squadron goes through and the board closes | `ui/msq-board-sqn.test.tsx` + new |
| P14 | A save made just before a pick lands in its own squadron's record | new (press report D) |
| P15 | A window on his own squadron's page is never held when nothing moved | the controls already in `ui/msq-pick-windows.test.tsx` |

---

## 8. The open questions, as switch points

**None is built on the recommendation.** The build starts only when each row that says "blocks" has his answer.

### 8.1 What Build 1 waits on (the brief's list)

| Q | Recommended | If he answers the other way | How the code is shaped for it |
|---|---|---|---|
| **H2** what counts as a window | as §3.2's `counts` column: the four bar-free windows keep closing; ALL AVAIL and Changes (folded too) refuse; the board alone does not, its two dialogs do; a clean chart editor does not, Show All does; the Legends do not | each is one row's `counts`. "The four refuse too": those four rows, **and** `ui/barfree.ts BAR_KEEPS` gains the three doors' controls so the window is still there when the door asks; P10 is replaced by a B4 row each. "ALL AVAIL / Changes do not": two rows; they then close at the pick as today (P4 gains them) | the table |
| **H3** how far the Users row reaches | any change in the row (the Role box and the squadron lines as well as the sign-in name); "Give access", "Add a person", "+ New squadron" and a place being edited once anything in them differs; the row counted while the Admin page is up even with another section showing, the note then reading "…the open row on Users…" `[WNS]` | "typed words only": the `on` test of `useGuardWork` in `PersonEditor` narrows to `name`; the other four reports are not added (A6, B11 lose those cases). "Only while Users is the section showing": the report is `on && p.shown` | five `useGuardWork` calls, one line each |
| **H7** a refused tap on the bell itself | "…then press the bell again." `[WNS]`, under the bell | "the same words as a line": the `bell` row of `guardWords` points at the `line` row. "Do not refuse; open the bell's list instead": `enterForLine`'s `door: 'bell'` branch returns `'no'` and `bellTap` falls through to `setBellList` — B9, F2 rewritten | one row of the words table; the door's id |
| **H8** a save still going | the door waits: where `saveSettling()` and not `saveRefused()`, `await flushSaves()`, then the door starts again from §4.2 step 1 (so a save that failed is refused by the unsaved row) | "it goes, as today": the step is not built; B20 becomes P14's twin ("the save lands in its own record after the pick"); a failure a moment later shows 142's band on 149, which he was told | one function, `settleFirst()`, called at step 3 of the three doors |
| **H11** where the note stands; the ☰ menu after a refused pick; D731 (1) against D2590 | the foot at 820 wide or less and whenever the door was inside ☰; the ☰ menu closes; on a phone with a shell window up the note goes to the top as every note does | each is one line: `noteAtFoot()`; the `pickRefused(u)` clause in `DrawerSquadron pick`; `GUARD_NOTE_OVER_WINDOW`. The e2e sizes do not change, only their expected place | §4.6 |
| **§3** which reason first | the window, then the row, then Retry | `GUARD_ORDER` reordered; B12's expectation | one array |
| **§3** a refused line left unread, its list open | yes | "read": `markNoticeRead(n.id)` before the return in `openNotice`; "list closed": `setBellList(false)` there — and the note then hangs under the bell | two lines; B6 |
| **§3** the row's press refused, not the list's opening | the list opens, the row is refused | "the list does not open": the check moves to the two buttons' toggles (`SquadronMenu toggle`, `DrawerSquadron`), and the note cannot name a squadron — new words, his | the door's id `pick` → `pickOpen` |
| **§3** the adjusted words — R3, N3a, N3b, N4 | as the words read ships them | each is a string in `guardWords`; the tests read the table's own constants, so no test changes | §4.6's table |

### 8.2 The other H questions

H1, H4, H5, H6 (Logout — Build 2), H9 (Undo — Build 3), H10 (the refresh card — Build 2) touch no line of Build 1. H12 (a
drag in progress) and H13 (typing in no window; a phone's caret) are **not built here**: a drag is put back by nothing
new, and those boxes are `'no'` rows. Said so he does not expect them from this build.

### 8.3 Six this plan found that are in neither list — to go on the questions page

| N | The question, with its case | Recommended | Blocks |
|---|---|---|---|
| **N1** | **A window left open on a page he is no longer looking at.** Saber opens My leave on the Leave War, presses the Inputs tab (the window is still open, out of sight), picks 149. | Refused, the note saying where: "…close the open window on Leave War…" `[WNS]` | the build of the Leave War's, the day panel's and the Tracker's rows |
| **N2** | **His own input shown on another squadron's Inputs page.** Hunter (142's, Plan of 149) has 149 picked; the Inputs list shows his own 142 leave among 149's; he taps it. Today it opens live. | It opens live where he is — it is his own and the page lists it on purpose (D2197) | §5.2's last clause, F9 |
| **N3** | **A press that is not a bell line bringing his own squadron back with a change not saved.** Ranger views 149; a save has failed; he presses "Check my quals" on the welcome-back card (or Undo, whose step lands on Inputs). | Refused like a bell line: "Blocked: press Retry to save your changes, then press this again." `[WNS]` | rows 12, 13 of §4.1 — as today until answered |
| **N4** | **A holiday's bell line while he views another squadron.** Hunter (142's admin, View of 149), 149 picked, taps "National Day is now a public holiday": 142's OIL list opens over 149's View-only Sched and its Save answers 142's inputs there. | 142 comes into view first, then the list (D2325's own rule for a bell tap) | §5.3 door 3 |
| **N5** | **The Tracker's question at the view switch on his own squadron, where nothing would be lost.** Saber on 142 moves a ball and presses his badge. Today: the member view, the edit still there, Save still working. `p5` draws the question in exactly this case; and the "switching back" wording can only ever be asked this way. | Asked always, both ways, as drawn — one rule; its cost is a Discard that throws away edits the switch would not have touched | B14, B15; the one predicate `viewSwitchAsks()` |
| **N6** | **A window held since midnight, then his own pick.** Hunter's Input window is held by his move at 00:00 ("This change could not be saved." and Close, as today); he picks another squadron. | Refused with the ruled words — the held window has its Close | nothing: it follows from D2403's letter; asked only so he is not surprised |

---

## 9. The overlap with other open work

Read with `git diff origin/main...origin/<branch> -- <file>` on the remote refs as they stood (no fetch was run; §14).

| Other work | What it changes that this build touches | What the builder does |
|---|---|---|
| **Pull request 840**, the speed readout (`claude/app-speed-readout-161`) | `ui/FloatWindow.tsx` — two new props, `bystander` and `quietOpen`; a bystander never calls `forward(id)`. `ui/boardescape.ts` — `.floatwin:not([data-bystander])`. `ui/topbits.tsx` — the bell list's Escape marks the key used. `state/view.ts setPage` — a timing mark. A new window, the `?timing` readout (`ui/TimingReadout.tsx`, drawn in a root of its own from `main.tsx`) | **The guard must not count the readout**: it is up all session by itself, for the developer, so counting it would refuse every pick. Reading `winorder.ts UP` (never the page's `.floatwin`) already leaves it out, because a bystander never joins the order. R2's scan must read `bystander` and skip it; one test, written when 840 is in: "the readout up, a pick goes through". Build 1 does not edit `FloatWindow.tsx`'s body (only `winorder.ts` gains a read-only export), so no clash of lines is expected. `toast.ts` is not touched by 840 |
| **Pull request 825** (`claude/allavail-sans-postout-141`) and **the readings-lapse branch** (`claude/readings-lapse-fix-fdbb3c`, built on it) | `ui/topstate.ts openNotice` gains a branch for a SANS-days line that sets the Inputs page's SANS tab and `setPage('inputs')`; `state/view.ts` gains `SANSDAYASK` (an ask, not a window); `ui/toast.ts toastBatch` gains receipts; `ui/topbits.tsx BellList` draws the lines differently; `ui/InputWindow.tsx` one line (`peopleFor`); `state/notices.ts`, `state/perms.ts`, the notifications register | The new branch sits after `enterForLine` in `openNotice`, so it is refused with the rest — **B7 gains that family when 825 is in**. `SANSDAYASK` must not be left set by a refused line: it is set after the check, so it is not; a line in B7 asserts it. `toast.ts`: both change the file, in different functions (`toastBatch` there, `placeToast` and `toastAt` here). `topbits.tsx`: the note's anchor reads `data-testid="bell-line-<id>"`, which 825 keeps. Whoever merges second brings `main` in (the handoff's rule) and re-runs the guard's four test files |
| **The words pass**, merged (pull request 841) | `state/notices.ts`, `ui/InputsPage.tsx` | Already in this branch. Its two later rulings (a changed input's bell line says every change; an undone change gets a notification of its own) meet Build 3, not this one. **No word of Build 1 is taken from the words pass**; the builder searches `main` for the bell line's row before touching any line's words (the handoff's rule) — Build 1 touches none |
| The Tracker press reshape (its own plan, not built) | `tracker/app/core.js` gestures | Build 1 edits `core.js` in three places only — `endSession` (the table), the registered `ask` (the tail), the new `onTrackerWindows` line. None is in the gesture code. Whichever is built second re-reads the other's diff of `core.js` |

---

## 10. The build order

Every step: its tests written first and **seen failing** (a test that will not fail is reported, never bent); then the
step; then, on his PC, **only the touched test files and `npm run build`** (the type check — `tsc --noEmit` is hollow
here), `npm run lint:changed`; the full suite is GitHub's run of the pull request (`shipping.md`). A browser test file
builds the app, so it waits for the checks lock. Each commit leaves the app working.

| Step | What | Its tests | Leaves the app |
|---|---|---|---|
| **0** | **The pins and the census — no behaviour changes.** `msq-guard-asis.test.tsx` (P1–P15), green today. Then the census: the 37 test files that press a pick or the view switch and the 13 that press a bell line (the lists in §14) are read, and each test whose set-up makes that press **with something open** is listed in the plan's own annex with what it proves. They fall in three kinds: (a) it proves the held window a change he did not make still raises → its set-up is re-pointed to that road (the midnight clock, as `msq-fix-sched-windows-midnight` does); (b) it proves the pick's or the member view's band — unreachable after this build → its press becomes the raw entry (`enterSquadron(u, hold, true)` / `switchRoleInForce`), the test **renamed to say so** ("reached by no press since D2403 — removed with the band in Build 2"), its file named in the checker's allow-list; (c) it proves what the press does → its expectation becomes the refusal, citing D2403. **The list goes to him by name in the report; none is edited to pass.** | P1–P15 | as today |
| **1** | **Part A.** `state/guard.ts`, `ui/guard.ts` (`GUARD_ROWS`, `whatIsOpen`, `useGuardWork`), `winorder.ts winsUp()`, the five `useGuardWork` calls, `core.js TRK_WINDOWS` + `endSession` walking it, `role.js` bridge. No door asks yet. | R1–R4, A1–A9; must stay green: `ui/pops.test.ts`, `state/view-reset.test.ts`, the Tracker's session tests (`tracker/tracker.test.tsx`), the Tracker smoke | as today — nothing reads the answer |
| **2** | **The note's place.** `toast.ts toastAt`, `placeToast`'s anchored branch, `ui/guardnote.ts`. No caller. | `msq-guard-note.test.tsx`; must stay green: the toast's own tests | as today |
| **3** | **The pick's door.** `pick.ts`, `Drawer.tsx`; the checker installed for `enterSquadron`. | B1–B4, B10–B13 (pick halves), B16, B19–B21, R5, R6; the step-0 list's (b) and (c) files for the pick | a pick refuses; the view switch and the bell as today |
| **4** | **The view switch and the Tracker's question.** `store.ts switchRoleView`, `role.js`, `core.js ask`; the checker for `switchRoleInForce`. | B5, B14, B15, B18, the switch halves of B10–B13; step 0's files for the switch; P3, P11 green | the switch refuses and asks |
| **5** | **The bell.** `belltap.ts enterForLine`, `topstate.ts openNotice`, `openBellRequest`. | B6–B9, B17, the bell halves of B10–B13; `ui/msq-bell-tap.test.ts`, `tracker/msq-bell-*.test.tsx` green unchanged | all of part B |
| **6** | **Part F's root.** `InputWindow.tsx` — `ownSqnOf`, the note, `swapOn`. | F4, F8, F9, F10; `ui/msq-pick-swap-question`, `ui/msq-night-held-input` as step 0 left them | a wrong-squadron input is held by any door |
| **7** | **Part F's doors and leads.** `topstate.ts bellTap`, `OilDayList.tsx`, the holiday line (N4). | F1–F3, F5–F7 | all of Build 1 |
| **8** | **The browser tests and the records.** `e2e/msq-guard.spec.ts` (under the checks lock); `docs/file-map.md` (the new files, and chat 162's three test files and `escListTop`, still owed); `docs/ui-contracts.md` (the guard's rule, the note's place); `docs/feature-impact.md` (a row "the guard rail" beside "The bell's notices" and the page-squadron section: what a new window, a new door and a new bell line each owe it); the backlog item and the handoff | e2e; `npm run docsize` | — |

**What the FULL check then needs from Build 1** (one check for the batch with [MSQ-NIGHT-153-OPEN], after Builds 2 and 3,
D485 — unless he wants Build 1 live on its own, which needs its own): the roll-call's rows this build adds —

- every row of §3.2 (each window × counts or not × the page it is on), each with its test and **its break** (the wire
  cut once, a named test red — `scripts/handpass/breaks.mjs` gets a list: each `GUARD_ROWS` row's `open` made to answer
  false; each door's `refuse` line removed; `noteAtFoot` inverted; the checker switched off);
- every row of §4.1 (each door × refused / must not / missing);
- the note: each door × each reason × each of the eight sizes × the words;
- part F: every `setInpEdit` door the stopped builder listed (20, from its hand-back) × "is the input's squadron the
  page's" — walked, since only F1–F5 are tests;
- the scenarios file's rows C1–C29, C31–C33, C39, C40, C52, C53 are this build's; its lessons table stands (§12).

---

## 11. The risks, each with how the plan answers it

| # | Risk | Answer |
|---|---|---|
| 1 | **A window that opens after the guard has looked.** | With no question the check and the change are one synchronous call — nothing can open between. With the Tracker's question up, its shade stops the mouse and it holds Tab (`Modals.jsx trapTab`); what can still arrive is a save failing, or a window that opens by itself. So every door asks the guard **again** after the answer (§4.2 step 5; B19). The cost — chart edits discarded, then a refusal — is real and rare; said on the evidence sheet |
| 2 | **Two switches at once.** | A second door under the Tracker's question is already dropped (`core.js ask`: `if (dlg) return false`). Without a question each door is synchronous and `enterSquadron` refuses re-entry (`ENTERING`). A pick then the badge in one breath are two whole presses in order. The press report's "two picks back to back" stays as P1's twin |
| 3 | **A refusal that leaves a half-entered squadron.** | The check is the first line after "is this a change at all" in each door, before any flag is set. The one door whose callers set something first — the landing, on `notify` — is not used for refusing: the bell's case is judged in `enterForLine` instead (§4.5), and the two presses that cannot be (rows 12, 13) are not refused at all until N3. B1 asserts the war's world and the Tracker's door as well as `UNIT`; B8 that nothing asked of the Leave War is left to fire later |
| 4 | **The note pointing at a control that has scrolled or folded away.** | The top bar is fixed, so the picker and the badge do not scroll. A control not on the page or not drawn when the note is raised → the foot. The place is worked out again only on a resize or a window opening; then, the control gone → the foot. e2e resizes across 820 with the note up |
| 5 | **A refused door that later runs by itself.** | A refusal stores nothing — no "wanted squadron", no callback. B10 runs the timers after Retry lands and asserts nothing moved. Today's two "runs later" roads (a held war window's Close letting the war in; the Tracker following once held work is gone) can no longer be started by a press, and stay for midnight (P5). H8's wait is the one place a press runs after a pause: it is the same press, only after its own save, and it starts again from step 1 |
| 6 | **A guard that refuses with nothing visibly open, and how he gets out.** | Three causes. (a) *A stale flag* — designed out: there is no second flag (§3.1); A9. (b) *A window on a hidden page* — N1; the note says where. (c) *A reported row whose component unmounted* — `useGuardWork` leaves in its effect's cleanup, the only way a component goes; A6. **The way out that always works: Logout is never refused, and a reload clears every flag** — neither depends on the guard. The FULL check's walk tries to make (a) by every close path of every row |
| 7 | **The Tracker's own windows.** | One table in `core.js` that both closes them at a sign-out and answers the guard; R4 ties the components to it. The bridge answers nothing when the Tracker was never loaded. A Tracker window on a hidden tab is N1 |
| 8 | **A helper window another branch adds.** | R1–R3 fail on a new flag, a new `FloatWin` id or a new file with a dialog until it has a row — `'window'` or `'no'` with a reason. The `?timing` readout is the worked case (§9). The risk that remains: a branch built before Build 1 merges adds a window, and the test only fires once both are on `main` — the second to merge brings `main` in and meets it then |
| 9 | **37 test files change meaning.** | Step 0 is a census before any code, sorted into three named kinds, reported to him by name. The checker's allow-list is the only place a raw entry is excused, and Build 2 empties it |
| 10 | **The checker makes an unrelated test fail.** | It can only fire where a test drives a pick or a switch with something open — which is a finding about that test or a door this plan missed. Either is reported; neither is silenced outside the allow-list |
| 11 | **`switchRoleView` and `pickSquadron` become asynchronous where they ask.** | Only where they asked or waited; with nothing to ask both stay synchronous, so the tests and callers that read the result in the same tick (P1, P11, the 37 files) are unaffected. H8's wait is behind `saveSettling()` and P14 pins the ordinary case |
| 12 | **The member view's hold comes back by the second entry** (§4.4 step 5). | B14 asserts the result after `whenUnitSettled()`. If it fails, the fix is in `trkMayHold` (the member-view half answering false while the entry in hand was his own press) — named here so the builder does not reach for a timer |
| 13 | **Over-refusal.** A row marked `'window'` that he would call harmless (ALL AVAIL, a folded Changes bar) makes the app feel stuck. | H2 decides each; each is one flag. The note always names what to do |

---

## 12. The order's lessons (§7.11), against this build

| Lesson | Where it bites here | Covered by |
|---|---|---|
| 1 a reading in one state only | the note × door × reason × size | §10's roll-call; B10–B12; e2e |
| 3 feedback, and what is out of sight | the note is the only sign of a refusal; the Retry it names is not drawn inside the ☰ menu (the words read, N4) | the menu closes on a refusal (H11); e2e asserts the band and the note in one picture |
| 4 the page behind an open window | the whole job — every non-shaded row | B4 |
| 5 a thing brought into sight against what stands over it | the note against a window's ✕, the "Not saved" band, the phone's keys | §4.6's ✕ check; e2e |
| 10, 12 a page hidden and shown; a window opened from every page | N1; the Input window from Inputs, the week, the board, a SANS day, the medical page, the document viewer | A7; the walk (20 `setInpEdit` doors) |
| 11, 31 sizes; a real window at 125% | the note under the control | e2e at 1366, 2560 and started at 125% |
| 14 a list made by searching, never from memory | the windows | R1–R4 |
| 19 a window over a window, closed by each way | "is anything still open" after each | A2, A4 |
| 23 the ruled tap beside the build's | a bell line moves him there (D2325); an input's own window from any day | F1 asserts the ruled result, not the build's |
| 25 made where a person can put it | ALL AVAIL made on a fresh day (the demo offers none) | B8; the walk |
| 27 a control never moves under the finger | a refusal must not move the picker, the badge or the bell | e2e measures each before and after |
| 28, 30 a phone's press proved on screen; the first 100ms | the note at the foot, the menu closing | e2e in WebKit; the walk's pictures |
| 29 a page open across midnight | a held window, then his pick (N6) | P5; the walk |
| 2, 6–9, 13, 15–18, 20–22, 24, 26 | no gesture, print, pinned row or animation is built here | — said, not skipped |

**What only his iPhone can show** (lessons 6, 21): the note's place against the real keyboard, and against Safari's
folding toolbar when the foot is where it stands. Put on his look card.

---

## 13. Size — an estimate, not a measurement

| Part | Hours | Why |
|---|---|---|
| Step 0 — the pins and the census of 37 + 13 test files | 3 | reading each test's set-up; re-pointing, not rewriting |
| A — the table, the function, the Tracker's table and bridge, five reports, the scans | 4 | about 45 rows, but eight frames; one loop test |
| The note — `toastAt`, the anchors, the foot rule | 2 | |
| B — four doors, the Tracker's question both ways, the checker, 21 tests | 6 | the view switch is the long one |
| F — the root, three doors, two leads, ten tests | 3 | |
| The browser tests and the records | 3 | eight sizes |
| **Build 1** | **about 21** | the sizing file had A + B at 9 and F with G at 4. The difference is the census, a fourth door, and the browser tests it did not count |

Then one round of blind reads on the code, and its fixes — not sized here.

---

## 14. What I could not verify, and the lists

- **Nothing was pressed.** Every "today" is from the code or from the press report. In particular: N1 (that a Leave War
  or Tracker window really stays open behind another tab — read from `Chrome.tsx`'s and `typing-hold.ts`'s own
  comments and the kept-mounted pages, not seen); N4 (a View holder's holiday line — read from `openNotice` and
  `OilDayList.tsx adminOfList`); §5.4's second lead; §4.4 step 5's second entry.
- **Not read whole:** the bodies of the 23 Leave War sheets and the Tracker's modals (their frames and flags were);
  `leavewar/ui/Matrix.tsx`; the stylesheets, except the one rule that hides the badge at 820. So the layers the note
  must stand over (it is 540; the windows 410 / 411; the ☰ menu 440) are from comments in `toast.ts` and `Drawer.tsx`.
- **The class of a Leave War sheet's ✕** — each sheet draws its own inside `.bidsheet-hd`; not read sheet by sheet.
- **Whether the Leave War's and the Tracker's Legends have a ✕** — H2's row for them rests on their closing at a press
  outside.
- **Why a pick closes an opened Users row today** (the press report's C) — the row's person leaves the list the panel
  draws; not traced.
- **D2611** is not on this branch (`.claude/decisions-full/` has no row); it is taken from the handoff's own words.
- **Pull request numbers** are matched to branches by name (840 → `claude/app-speed-readout-161`; 825 →
  `claude/allavail-sans-postout-141`); no fetch was run, so each diff is of the remote ref as it stood. `origin/main` is
  one notes merge (pull request 842) ahead of this branch.
- **The sizing file's "twenty app files"** reading the held machinery was not counted; it is Build 2's.
- **The census lists** (step 0), from a search of the test files tonight —
  a pick or the view switch: `leavewar/groupinput`, `leavewar/holnotice`, `leavewar/postout-takeback`,
  `state/msq-fix2-midnight-history`, `state/msq-fix2-sec-stamp-plant`, `state/msq-fix2-undo-reach`, `state/msq-trk-cover`,
  `state/perms`, `state/reshape-plan-audit-read`, `state/signin-kinds-cells`, `-fixes`, `-gate`, `-proof`,
  `tracker/msq-bell-input-ask`, `-bell-recheck-after-ask`, `-night-export-abort`, `-night-gestures`,
  `-night-memberview`, `-night-press-held`, `-night-press-undo`, `-trk-ask-keys`, `-trk-follows-pick`, `-trk-pick-ask`,
  `ui/accounts-ui`, `ui/memberview`, `ui/msq-admin-config`, `ui/msq-board-sqn`, `ui/msq-night-held-input`,
  `ui/msq-pick-swap-question`, `ui/msq-pick-windows`, `ui/msq-sqn-menu`, `ui/msq-users-filter`,
  `ui/msq-view-only-menu`, `ui/rolestable`, `ui/schedule-insights-menu`, `ui/topbar-pair`, `ui/welcomeback`;
  a bell line or tap: `leavewar/holnotice`, `leavewar/msq-posting-failed`, `leavewar/postout-notice`,
  `leavewar/postout-takeback`, `state/msq-trk-cover`, `tracker/msq-bell-input-ask`, `-bell-recheck-after-ask`,
  `-trk-follows-pick`, `-trk-pick-ask`, `ui/bellnotices-scenarios`, `ui/bellnotices`, `ui/msq-bell-tap`,
  `ui/topbits.wire`; the browser tests `e2e/msq-job2.spec.ts`, `e2e/insights.spec.ts`. Which of them press with
  something open is step 0's work, not done here.
