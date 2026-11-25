# [MSQ-PICK-GUARD] Build 1 — the build plan: one answer to "what is open", the doors that refuse, the Input window's own squadron (parts A, B, F)

Written 25 Nov 26 (chat 175's night) by a fresh Fable helper from its brief,
`../briefs/2026-11-25-msq-pick-guard-build1-plan-brief.md`. **Status: revised to its red team's round 2 (25 Nov 26 —
§16; round 1: §15), each round folded in by a fresh Fable; still a draft — not approved, and not to be built from
until the questions of §8 that say "blocks" have his answers and its third and last read is done.** It builds nothing. The rulings: D2403, D2405, D2590–D2595 (full rows in
`.claude/decisions-full/`); the sizing file `2026-11-24-msq-pick-guard-build.md` (parts A–H; this plan is A, B, F);
today's app as pressed, `../briefs/2026-11-24-msq-pick-guard-press-report.md`; the walk's scenarios, `…-scenarios.md`
(H1–H13, §3); the words, `…-words2-fable.md` and `../briefs/2026-11-25-msq-pick-guard-words3-fable.md`. Every claim
about today's code below names its file and function: the first draft's were read on `dff29f001`, and every finding of
the red team was checked again in the code — round 1's on `cd364c3e1`, round 2's on `44f67377a` (no file under `src`
differs between the three). **The plan's
writers pressed nothing.** Five pressers pressed today's app after the first draft
(`../briefs/2026-11-25-msq-pick-guard-q2-press-p1.md` to `-p5.md`; the fifth pressed the first draft's own six
questions, N1–N6): "pressed (P2 4)" below cites a report and its case. §14 lists what is still unproved.

**How to read the marks.** `[WNS]` after a sentence = it words a note or a question and **the words are not settled**:
his D2611 has none of them built on the agent's reading. `[ruled]` = the words stand in a ruling row. **(reading)** =
the agent's own reading of a ruling or of what a person should see: named so it is put to him, never built as it
stands. A question he has not answered is named by its number — H2, H3, H7, H8, H11 of the scenarios file §2; "§3" for
the host's calls; **N1–N12** for the twelve this plan and its red team found that are in neither list (§8.3). The
questions page he answers numbers them its own way (A1–A20, B1–B12): the table at the head of §8. The two
words reads number their own items too: those are always written "words-read N7", "words3 W2". Nothing here decides a
question: each gets a recommendation, the shape that makes either answer a small change, and exactly what moves if he
answers the other way.

---

## 1. The promise

**What a person sees after Build 1.**
- With a window open — an Input, Leave War or other window, the OIL list among them (D2403) — a pick of another squadron,
  the switch to or from the member view, and a bell line or bell tap that would take him to another squadron do nothing
  but raise the app's grey "Blocked:" note: under the control pressed on a desktop, at the screen's foot on a phone
  (D2590). The window stays live with his typing; the squadron and the view stay as they were.
- The same three presses are refused while a change is not saved — the "Not saved" band with Retry (D2594) — and while
  an opened row on Admin → Users holds typing (D2595).
- **The same refusal meets every press that would bring his own squadron back from one he only views** — a bell line
  that opens one of his own pages, the bell's own tap, "Check my quals", a card of the OIL list (the bell's own tap in
  words he has not yet seen: H7; the last two likewise: N3). **And nothing opens behind a refusal** — the window, the
  question or the passing note that press would have brought is run by the page's own door, and only once the page is
  there (§4.5).
- Unsaved Tracker chart edits are asked about at the switch to and from the member view, with the question a pick asks
  today (D2403; when, and in which words: N5). A refusal always comes before that question, so he never discards chart
  edits only to be refused.
- A 142 input can no longer be opened live under a bar saying 149 from a card of 142's OIL list (security F1): the
  input's squadron comes into view first, and the Input window keeps the input's own squadron.
- **The bell's own OIL tap (security F2) is one question of his, with his own 142 input shown on 149's Inputs list —
  N2 + N8** (§8.3). The build closes F2 outright under one of its three answers only; under the other two the same
  change stays possible from 149's list or from the bell, by his word, and the report says so.

**What stays exactly as today** (each pinned by a test written before the changed half — §7): a pick or a view switch
with nothing open; the Tracker's question at a pick, its three answers; menus and lists closing as they do; a pick of the
squadron already in view; a bell line that changes neither the squadron nor the page (an input since deleted, his own
account's line, a holiday's line — N4); Logout (never refused — its questions are Build 2's, part C); the "Not kept"
band blocking nothing; and **every change he did not make** — his own move at midnight, a right taken away, the Tracker
failing part-way.

**What Build 1 leaves half-way, said plainly.**
1. **The greyed windows and their bands still exist** (`state/typing-hold.ts`, `ui/heldro.ts`, `state/store.ts
   publishBands`, `ui/InputWindow.tsx`, `leavewar/ui/Sheet.tsx`). After Build 1 no press of his reaches the pick's band
   (D2323) or the member view's band (D2389): those two become code no road leads to. The midnight and right-ended
   bands show exactly as today until Build 2 (part D) replaces them with the refresh card (D2405).
2. **The Tracker's hold and its member-view cover** (`store.ts trkMayHold`, `coverWords`; `tracker/TrackerPage.tsx`)
   stay in the code. His own switch no longer reaches the cover if N10 is answered as recommended (§4.4); the hold at
   his own move at midnight is unchanged.
3. **Undo still reaches another squadron's steps** (part E, Build 3), and Logout still draws the Input window over the
   Tracker's question (part C, Build 2).
4. **A window held after midnight, then his own pick: N6 — nothing of it is built before his answer.** Counted like
   any window it would refuse the pick that today gives it back live with his words, leaving only its Close, which
   drops them. Where its page cannot be reached: N1's second case (§3.3).

**Is that interim state safe to merge alone? Only on three conditions.**
1. **Every door of §4.1 is refused in this build.** That needs N3's and N11's answers, for their words. A Build 1 that
   leaves "Check my quals" and an Undo that removes the squadron in view unguarded still lets the squadron change with
   a change not saved — the fault D2594 rules out, and pressed for the first: the bar goes back to 142 with "Not saved"
   still up, nothing said (P5 N3). Left so, it is merged only together with the build that closes them, or after he
   has been told those roads by name and has said to go.
2. **No recommended answer that §8 marks unsafe is built as recommended** — N1's second case, N4's other answer,
   H11's D731 half — and nothing of N6 before his answer.
3. **N2 + N8 is answered.** `[MSQ-NIGHT-153-OPEN]` has security F2 fixed before "merge live". Under "its own squadron
   first, on every road" the build fixes it. Under either other answer it does not, and Build 1 then goes live only
   with that backlog item saying, in his words, which roads he has left as they are.

With all three, Build 1 only removes ways into a held window and closes the security faults his answer covers; nothing
a person can do today that is right stops working, and nothing new is held. The cost of merging it alone is two bands'
worth of unreachable code for the length of one build, and the 22-test file that proves them by a pick is re-pointed,
not deleted (§10). It must **not** be merged before its own FULL check (§10, last step).

---

## 2. Where the sizing file is wrong about today's code

| Sizing file says | What the code does |
|---|---|
| Three doors: the pick, the view switch, a bell line (§1, part B) | **Four families.** `state/store.ts landOnOwnPage` — run from `landOnOfferedPage` on every `notify()` — enters his own squadron (`enterSquadron(home, …, true)`) whenever any press opens a page a squadron he only views does not offer. It has no list of callers: a bell line, the bell's own taps, the OIL list's card, "Check my quals" (`ui/WelcomeBack.tsx`), and an Undo or Redo whose step lands on another page (`state/undo-wire.ts snapView`) all reach it. |
| "No one list covers the app… the shell's windows, the OIL list and the Tracker's each stand alone"; part A "each window registers as it opens and leaves as it closes", about twenty-five to register | **The frames already keep lists.** `ui/winorder.ts UP` holds every `FloatWin` that is up (joined by `forward(id)` in `ui/FloatWindow.tsx`'s own layout effect, left by `gone(id)` at unmount — ten ids) **and two more, `'avail'` and `'chg'`, which ALL AVAIL and Changes put there themselves** (`ui/availopen.ts`, `ui/changesopen.ts`); `leavewar/ui/Sheet.tsx OPEN` every Leave War sheet (23 uses of `<Sheet`), already read by `state/typing-hold.ts warWindowOpen()`; `ui/sheetfocus.ts sheets` every sheet that holds the keys (thirteen callers — the dialogs and the document viewer among them, so it is no list of question sheets: §3.1); `tracker/app/core.js endSession()` names every Tracker window it closes. About 45 open-states in 8 frames (§3.2), not 25 windows. **A list kept by a frame is a list of what is mounted or flagged, not of what is drawn — the red team's main correction to this row (§3.1).** |
| `ui/pops.ts` holds the schedule side's flags | True for 14 windows. Not there: ALL AVAIL, Changes and the OIL question put before a change (`state/view.ts AVAILWIN`, `CHGWIN`, `OILWAIT`); four movable windows whose open-state is a component's own (`inputsday`, `sansday`, `everywd`, `holiday`); the board's two dialogs (`ui/board.ts`, read from the page by `pops.ts windowOverSchedule`). |
| A change not saved — `ui/savestatus-source.ts readFailed()` | Right, but a door in `state/` may not import `ui/`. The same answer from the same saver is `storage/savewait.ts saveRefused()` (`main.tsx` hands one postman to both). |
| The view switch "asks nothing, the Tracker held under a cover" → ask at the view switch, both ways | The switch moves the Tracker only for a Plan holder or master admin with a squadron other than his home in view (`state/perms.ts pageUnit('own')` falls back to his home in the member view). For an admin at home it moves nothing. And no road reaches the switch **back** with unsaved edits on a Tracker that would move: a pick of a squadron he only views already asks (D2388). So the "switch back" wording has a path only where the Tracker would not move — question **N5**. |
| Part F: `ui/InputWindow.tsx`, `ui/OilDayList.tsx`, `ui/topstate.ts` | Also `state/belltap.ts enterForLine`; a third door (a holiday's bell line opening 142's OIL list over 149's View-only Sched — **N4**); and the stopped builder's Catch A — `engine/inputs.ts inputsListed` lists every input naming him on whatever squadron's Inputs page he has open (`ui/InputsPage.tsx inputsPageRows`, `ui/InputsCal.tsx calRows`), where the row's own "OIL?" button answers its OIL question with no window at all (`reviseOil`) — **N2 + N8**. |
| "Ten test files pin" the held machinery | 37 test files press a pick or the view switch and 13 a bell line (§10 step 0). `ui/msq-pick-windows.test.tsx` alone has 22 tests that reach a held window by a pick the guard will now refuse. |
| Part B: `tracker/app/core.js` (the question's second wording) | Also `tracker/role.js trackerSwitchAsk`: the question's tail is built in core.js as `'switching to ' + to`, which cannot say "switching back to the admin view". |

---

## 3. Part A — one answer to "what is open"

### 3.1 The design chosen: one function over one table, each row reading the very predicate its window is drawn from

**Not a registry that each window joins and leaves.** A registry is a second copy of "is it open" beside what the
window is drawn from, kept true only by a call at every way out. Four of this app's frames do not unmount when they
close — the schedule's veiled dialogs are `hidden`, not removed (`ui/Modals.tsx`, `ui/SchedBoard.tsx CxDialog`); the
Tracker's windows are module state set to `null` in a dozen places (`core.js`); ALL AVAIL and Changes keep a mounted
placeholder; `pops.ts resetPopsForSession` clears flags with no component told. A join whose leave is missed on one of
those paths leaves **a guard that refuses with nothing open, with no way out but a reload** — the worst fault this
feature can have. And a window added later that never joins is refused nothing, silently.

**One function that asks what each window is drawn from** has no second copy to go stale. Its own fault is the mirror
one — a new window nobody adds to the table — and that one can be caught by tests that read the source (§3.4), which a
missed `leave()` cannot.

**"The flag" is not "the drawing", in six places the red team found (§15, findings 2, 4, 15, 17; §16, finding 6), and
each is the same trap — the guard counts something while nothing in sight can close it:**

| A flag or list that says "open" while nothing can be closed | Read in the code |
|---|---|
| Duty templates, Flying waves, Day templates, Plans | each is drawn only while he may edit the schedule: `DutyTplModal.tsx` `open = TPLEDIT && !(SESSION && !canEditSched())`; the same in `WaveTplModal.tsx` and `DayTplModal.tsx`; `DraftsModal.tsx` `up` also needs `CURPAGE === 'editsched'`. The four flags are cleared at a sign-out only (`pops.ts POPS_RESET`). A Plan lowered to View under an open dialog hides it and leaves the flag set |
| Changes | `ChangesWindow.tsx` `chgUp = !!w && isMember()` |
| The question sheets' list, `sheetfocus.ts sheets` (`topSheet()`) | thirteen callers of `useSheetFocus`, not six — the Input dialog, Insights, the four template dialogs, the board's two, and **the document viewer** (`DocViewer.tsx` l.121), a bar-free window that does not count. A sheet leaves the list in an effect's clean-up, after React has redrawn — so at a one-press door (the badge, the bell) a viewer the same press has just closed is still in it |
| The Tracker's module state | `tracker/App.jsx` draws no window while `core.bootError` (the "Couldn't finish upgrading your Tracker data" card, which has no button — pressed, P4 2f) or `!core.ready` ("Loading…"), and only `DlgModal` while there is no course; and nothing under the member-view cover can be reached (`TrackerPage.tsx` `locked`) |
| A window on a page that is not on screen | the Leave War and the Tracker stay mounted when another tab shows (`Shell.tsx`, `.page.doze`), their windows with them; **and a page the squadron in view does not offer has no tab to go back by** — §3.3 |
| A Tracker window inside its Info panel, on a screen 1050 wide or less showing the Flow chart | `tracker/tracker.css`: `@media(max-width:1050px){ … .tr-root.tab-flow .sidecol{display:none} }`; `components/SidePanel.jsx` draws the lull calendar, the lull copy, the fail log and Down days inside that column; `App.jsx` starts on `useState('flow')`. Opened wide, the screen then narrowed or turned: the window's state is set and nothing of it is drawn. He is on the Tracker already, so "…on the Tracker" tells him nothing — **N12** |

**The rule, for every row.** `open()` is the very predicate its component draws from: **one exported function, which
the component itself calls** for its early return or its `hidden` — never a raw flag where the two can differ. **It
lives in a plain module, never in the component's own file:** here a file that draws a component exports only
components (React Doctor's only-export-components, D1534 — `ui/winorder.ts`, `ui/topstate.ts` and
`leavewar/ui/daypanelopen.ts` were split out for it), and a new finding fails the pull request's own check (D1539).
Every predicate of §3.2 (b), (c) and (e) is built from module state alone (`TPLEDIT && !(SESSION && !canEditSched())`,
`CXT != null`, `!!AVAILWIN`, `!!CHGWIN && isMember()` …), so they go together in one new file, **`ui/windrawn.ts`**,
which each component and `ui/guard.ts` import. R1 checks the wiring by reading the source; A10 proves, by driving the
app, that a row that says "open" has its box on the page.

So:

- **`src/ui/guard.ts` (new).** `GUARD_ROWS`: one row per open-state — `{ id, name, frame, where, open(), sel, counts,
  why? }`. `open()` is the predicate above. `sel` is the selector of the window's own box, **read by tests only** (A10,
  the browser tests) — production never decides by the page's nodes, which would answer N1 by a side door. `counts` is
  `'window' | 'row' | 'unsaved' | 'no'`; a `'no'` row carries its reason in `why` and is in the table **so that the list
  is complete and a reader can see it was considered**. `where` is the page the thing is drawn on (`'any'` for one drawn
  over every page). `whatIsOpen(skip?): { reason, row } | null` walks the rows in `GUARD_ORDER` and answers the first
  that is open and counts; `skip` names row ids a door leaves out — **every window that can be skipped has a row of
  its own** (§3.2 (a)), so a door leaves out exactly the window it was pressed in and still meets any other (two uses,
  both in §4.1: the held Input window's own chip, and a card pressed inside the OIL list). `ui/` may import everything
  it must read: `ui/pops.ts`, `ui/winorder.ts`, `ui/windrawn.ts`, `state/view.ts`, `state/typing-hold.ts`,
  `tracker/role.js`, `storage/savewait.ts`.
- **`src/state/guard.ts` (new, no imports).** The doors live in `state/` and may not import `ui/`, so this file is the
  seam, in the repo's own pattern (`setWarWindowsProbe`, `setSessionWorldHook`, `onBeforeTrackerSwitch`):
  `setGuardAsk(fn)`, `setGuardSay(fn)`; `refusalAt(door, to, opts?)` — asks, says nothing; `refuse(door, to, opts?):
  boolean` — asks, and where refused says the note; `opts` is `{ from?: 'bar' | 'drawer' | 'board'; skip?: string[];
  line?: string }` — where the control pressed stands, the rows left out, the bell line pressed — **and one door's
  `opts` travel with its press the whole way: to `enterForLine`, to the page door, to the landing's second ask and to
  the checker** (§4.5, §3.4); `setEntryChecker(fn)` (§3.4, tests only). With nothing installed nothing is ever open
  and nothing refuses.
- **Who installs it.** `ui/guard.ts` installs itself as it loads, and it is imported by `ui/guardnote.ts`, which every
  door's own control imports (`SquadronMenu.tsx`, `Drawer.tsx`, `Shell.tsx`, `topstate.ts`) — so a build that can press
  a door has the guard. `test-support/msq-world.ts` and the two test set-ups import it too (§3.4): it now pulls in
  plain modules only, no component.
- **Typing that lives inside a component** (Admin's rows and forms — no module flag exists) reports through one small
  hook in `ui/guard.ts`, `useGuardWork(id, on)`: an effect that counts the id up while `on` and down in its clean-up, so
  React's own unmount is the leave. `id` is typed to the table's row ids — a report for a row that is not in the table
  does not compile. **Seven Admin components own such state, each with a report of its own:** `UsersPanel.tsx
  PersonEditor`, `ArchivedEditor`, `Waiting` (the approve form), the "Add a person" form; `SquadronsPanel.tsx
  NewSquadron`, `MoveEditor`, `PlaceEditor`. Which of the seven is built, and what "changed" means in each, is H3's.
  **An eighth report is a window, not typing:** the OIL question raised from a row of the Inputs list, whose state is
  the page's own (§3.2 (e)). This is the only "join" in the design, and it has one way out by construction; the Admin page
  unmounts when its tab is left (pressed, P2 1g: the row is closed and its words gone on return), so no count outlives
  it. **Its known limit, said and not tested for:** a form added later whose typing lives only in its own component, in
  no frame, is seen by no scan — the build's records say so in `feature-impact.md` (§10 step 9).
- **The Tracker's windows** are known only inside `core.js`, which Raptor must not import (it would pull the chart
  engine into the first download — `tracker/role.js`'s head). So `core.js` gains one **read-only** table, `TRK_WINDOWS`
  — `{ id, open: () => !!pop, counts, panel? }` for each window state (`panel: 'info'` for the four the Info panel
  draws — N12) — and **`endSession()` is left exactly as it is** (it does more than null the states — `dlgCancelAll()`
  answers every waiting question, the gestures and the Undo lists end). R4 ties the two lists by reading the source.
  `tracker/role.js` gains `onTrackerWindows(f)` / `trackerWindowsOpen(): { id, behind: 'info' | null }[]`; `core.js`
  registers, beside `onBeforeTrackerSwitch`, a function that answers **none unless the Tracker is drawn** — `ready &&
  !bootError`, and with no course only `dlg` (the three gates of `App.jsx`) — and marks `behind: 'info'` on a panel
  window while the phone layout shows the Flow chart (`App.jsx` hands its `tab` to core beside `setTabSink`; the width
  is the stylesheet's own `(max-width:1050px)`). **Two rows in `ui/guard.ts`:** `trk`, `where: 'tracker'`, `open() =
  !trackerCover() && trackerWindowsOpen().length > 0` (`state/typing-hold.ts trackerCover` — the page's own cover;
  what it does with a window `behind` is N12's); and `trkask`, `where: 'any'`, `open() = trackerAsking()` — the
  unsaved-edits question while `core.switchAsking && dlg`: it is drawn over whatever page he is on, the cover stepped
  aside for it (`TrackerPage.tsx asking`, `.trk-askonly`), so the `trk` row's page and cover gates would call it "not
  open" while it is on screen; the `trk` row leaves `dlg` out while it stands. The question's own door asks the guard
  again only after the answer, when `dlg` is gone (`core.js ask` clears `switchAsking` in its `finally`). Never
  loaded: nothing open.

### 3.2 The windows, found in the code

**The `counts` column is the recommended answer, and nothing in it is built on the recommendation.** A cell with no
question in it is what both scenario designers already agreed is a window under H2 — "anything with its own title or ✕ that stays until closed" — or what a ruling
names (the Input window, a Leave War window, the OIL list: D2403; an opened Users row with typing: D2595; a change not
saved: D2594). H2 still blocks the table as a whole (§8.1): no row is built until he has answered it.
"Shaded" = the frame's own veil covers the bar, so no mouse reaches a door (the keys may — the browser tests, §4.7).

**(a) The shell's movable windows — `ui/FloatWindow.tsx FloatWin`. One row per id, made from one map in `ui/guard.ts`,
`FLOAT_WHERE` (id → the page it is drawn on): `open() = winUp(id)` (a new read-only export of `ui/winorder.ts`:
`UP.includes(id)`). Not shaded: the page behind works (D641).** A row each, not one for the frame: a door's `skip`, a
row's `where` and the note's "where" are all about one window, and one row answering "is any up" could neither leave
out the OIL list for its own card nor still refuse for a second window beside it. And `UP` holds `'avail'` and `'chg'`
too (§2): they are not in the map — ALL AVAIL and Changes are counted by their own rows in (b), from their own
predicates, so H2's "they do not count" is those two rows and nothing here. A `FloatWin` joins `UP` in its own layout
effect and leaves at unmount, so for this frame mounted is drawn — except `lwday`, which sits on a page that stays mounted out of sight (N1). `inputedit`, `days`, `sansset`, `inputsset` and `oilday` are
mounted at the app's top level (`ui/App.tsx`) and stand over whatever page is shown: 142's OIL list stays open and live
over 149's View-only Sched after a pick today, and its Save writes 142's input under a bar reading 149 (pressed, P2 4).

| id | What | File · how it opens · how it closes | Its own flag | counts |
|---|---|---|---|---|
| `inputedit` | The Input window on the Inputs page | `ui/InputWindow.tsx`; `setInpEdit(r)`; Cancel / Close, Add / Save, ✕ and Escape (which ask when something is typed, D1622) | `ui/pops.ts INPEDIT` | window |
| `inputsday` | A day opened on the Inputs calendar | `ui/InputsCal.tsx renderPop`; a day tapped; ✕, Escape. Today it stays open across a pick and shows 149's day, a half-typed "+ Note" landing on 142's (pressed, P4 4) | the calendar's own state | window |
| `sansday` | A SANS day | `ui/SansDay.tsx`; ✕, Escape | the SANS calendar's own state | **no — only shows things; closes by itself at the pick and the view switch (his D2597, 25 Nov 26; this cell was "window")** |
| `inputsset` / `sansset` | Inputs / SANS calendar settings | `ui/InputsSettings.tsx`, `ui/SansSettings.tsx`; the gear or Logic's row; ✕, Escape, a page change (`VIEW_RESET 'page'`) | `pops.ts INPSET`, `SANSSET` | window |
| `days` | Calendar | `ui/DaysWindow.tsx`; ✕, Escape | `pops.ts DAYSWIN` | window |
| `everywd` / `holiday` | Every Monday · Add / Change a holiday | `ui/EveryWeekday.tsx`, `ui/HolidaysPanel.tsx`; opened from Calendar; ✕, Escape, their own Save | their opener's own state | window |
| `oilday` | The OIL list | `ui/OilDayList.tsx`; `setOilList(…)` — by itself when a holiday is saved, from a holiday's bell line, a sign-off box, a version loaded back; Save, Later, Close, ✕, Escape | `pops.ts OILLIST` | window (D2403 names it) |
| `lwday` | The Leave War's day panel | `leavewar/ui/DayPanel.tsx`; `openDayPanel(iso)`; ✕, Escape | `leavewar/ui/daypanelopen.ts OPEN` | **no — only shows things; closes by itself (D2597; this cell was "window; `where: 'leavewar'`")** |
| — | The `?timing` readout (pull request 840) | a `FloatWin` with `bystander`, which never calls `forward(id)` | — | **no** — it never joins `UP`; §9 |

**(b) The two older movable windows — `ui/floatwin.ts useFloatWin` directly; flags in `state/view.ts`.** Each keeps a
mounted, hidden placeholder, so the row reads the component's own predicate (`AvailWindow.tsx isOpen`,
`ChangesWindow.tsx chgUp` — today locals of the component's body; each becomes a function of `ui/windrawn.ts`). Today
both close without a word at a pick and at the view switch, in the one press (pressed, P1 2 and 6).

| What | File · closes | Flag | counts |
|---|---|---|---|
| ALL AVAIL | `ui/AvailWindow.tsx`; ✕, Escape, a page or week change (`view.setPage`, `VIEW_RESET 'week'`) | `AVAILWIN` | **no — closes by itself at the pick and the view switch, as today (his D2596, 25 Nov 26; this cell was "window (H2)")** |
| Changes, opened out — and, on a phone only, folded to its bar at the foot (a desktop draws no "Hide", so it has no folded form: pressed, P1 2) | `ui/ChangesWindow.tsx`; the same | `CHGWIN` | **no — opened out and folded alike, as ALL AVAIL (D2596)** |

**His D2596 (25 Nov 26, A2 on the questions page):** these two close by themselves, nothing to edit in either. The rest of
the plan that names them as counted (§3.1's table, the tests of §3.5, the walk) is folded by the next chat with his other
answers; until then this note wins over any line that counts them.

**His D2597 (25 Nov 26, "Yes, all four"):** four more that only show things close by themselves the same way — Insights,
a SANS day, the Leave War's day panel and a Tracker event's details (their rows in (a), (c) and the Tracker's table below marked). Calendar and
the Tracker's marking window stay as written until he answers, once each is pressed and pictured. The same folding note
applies.

**His D2598, D2599, D2620 (25 Nov 26):** A5 answered — on Admin → Users an opened row with any change not saved counts
(a Role or a name as well as typing), and so do Give access, "+ New squadron" and "Add a person" once something is in them;
"Add a person" gets a Cancel that clears all of it (D2598). "Add a person" moves to the top of the page (D2599). The
squadron number at the top left flashes twice, fading, whenever the squadron changes (D2620). All three are drawn and
shown to him before they are built; the next chat folds them into the Admin → Users rows and §8.

**His D2621 (25 Nov 26, A17 — "yeah new option"):** with another squadron picked, the Inputs page no longer lists his own
inputs of a squadron he can still pick (a moved man still sees his old ones); a bell line about one brings its squadron into
view first. This replaces the A17 recommendation (a list row switching squadron first) and narrows the reshape plan's C2;
the plan's third read reads it.

**His D2625 and D2626 (25 Nov 26, C9 — "ok as recommended"):** on a squadron's Admin → Users a man of another squadron
shows only his callsign, his squadron's grey number, seat, CAT and that squadron's access line — today Hunter (142's admin
holding Plan of 149) on 149's page sees Ranger's sign-in mail and Role, and Save, Suspend, Archive and Delete work: a fault
this build fixes; Kestrel's view of such a row is pressed again before building. Plan of a squadron is given and taken away
by its own admins or a master admin, never passed on by a Plan holder, its admins told on the bell: every place that keeps
Plan to a master admin (the access line and its greyed reason, the roles table's note, the give and take, Undo and Redo,
the commit gate) changes, and the bell line is new; its words drawn and read by a fresh Fable first. Whether these ride
Build 1 or a build of their own is settled in §8 with his other answers; the plan's third read reads them.

**His D2627 (25 Nov 26 — "all group A as recommended"):** group A of the questions page, version 4, as recommended, Fable's
change where it made one (A7 names which Tracker windows refuse; A9 waits only until the save lands or "Not saved" shows;
A18 builds nothing for "Check my quals" if C4 keeps the card at home; A19 is D2621's). Each answer is listed in the ruling's
full row; §8 folds them in before the third read. Found by A4: Quals still shows Done after the member-view switch — a
fault this build fixes.

**His D2628 (25 Nov 26 — "group C as recommended"):** group C as recommended, Fable's change where it made one, C6 held
back and put to him (it clashes with D286). The bell's grey number first on every line, no colour; the fades' details
(D2620's); "+ Add a person" a button beside Filter; on another squadron "+ Input" and "+ Commitment" offer only its own
people, "Welcome back" only at home, the badge "View only" where he can only look; bug reports one list, each with its
grey number; a sign-off name from another squadron with its number. Each in the ruling's full row; §8 folds them in.

**His D2629 (25 Nov 26 — "folded"):** on a squadron's Admin → Users, under its own people, each other squadron is one
closed heading ("▸ 142 · 38 people") opening its people grouped, each row offering only the access line for the squadron
in view (D2625); the search still finds them; shown to whoever may give access there. Drawn first.

**His D2630 (25 Nov 26):** every example, drawing, scenario and walk of this build considers more than two squadrons
(142, 149, 150 — the demo's third made with "+ New squadron" first) and a person holding rights in several at once.

**His D2631 (25 Nov 26):** a master admin has a primary squadron; on Admin → Users his own squadron's people stand open and
every other is folded under its closed heading, in "All squadrons" too (narrows D2270).

**His D2632 (25 Nov 26, C6):** another squadron's archived callsign — the note names the squadron and shows seat, CAT and
the date archived; "it's him" (that squadron's admins asked on their bell to bring him back and move him, the request
waiting) or "someone new" (added at once, that squadron's admins asked to delete the old one if he has left). The move
waits for the Transfer build. Fixes today's note pointing to a "▸ Archived" the page lacks. Words read by a fresh Fable.
**His D2633:** this build ships only "Someone new: add him" and "If this is him, ask 142's admin"; "It's him" comes with
the Transfer step (batch 4). Fable's words and its twelve missing cases: `briefs/2026-11-25-msq-c6-words-fable-report.md`.

**(c) The schedule's veiled dialogs — `.airpop` / `.modal`, flags in `ui/pops.ts`. Shaded.** Each row reads the
predicate named, as a function of `ui/windrawn.ts` that the component calls.

| What | File | Flag · drawn when | counts |
|---|---|---|---|
| The Input dialog opened from the week or the board — row id `inputdlg` | `ui/InputWindow.tsx` (its second return, `CURPAGE !== 'inputs'`; a press on its veil closes it unasked). Mounted at the top level, so it is never set and out of sight (Opus's check) | `INPEDIT` · the component's `open` | window |
| Insights | `ui/Modals.tsx InsightsModal` | `INSIGHTS` · the predicate its `useSheetFocus` is given | **no — only shows things; closes by itself (D2597; this cell was "window")** |
| Duty templates · Flying waves · Day templates · Plans | `ui/DutyTplModal.tsx`, `WaveTplModal.tsx`, `DayTplModal.tsx`, `DraftsModal.tsx` | `TPLEDIT`, `WAVEEDIT`, `DAYTPLEDIT`, `DRAFTSEDIT` · each file's own `open` / `up` (the flag **and** `canEditSched()`; Plans also Edit Schedule) | window |
| The board's cancel-reason box · Sort all | `ui/SchedBoard.tsx CxDialog`, `SortAllDialog` (always mounted, shown by dropping `hidden`). Their shade covers every door, the board's own bell and ✓ Done included (pressed, P1 3) | `ui/board.ts CXT`, `SORTALL` · the `open` each hands to `useSheetFocus` — `CXT != null`, `SORTALL != null` (l.880, l.974) — not the page query `pops.ts windowOverSchedule` uses, which a hidden board could still match (not traced: A10 answers it) | window (H2) |

**(d) The four veiled windows that leave the bar free — `ui/barfree.ts useBarFree` (D1645).** Any press on the bar other
than Undo or Redo closes them first (a `click` listener at the document's capture, keyboard clicks included), so by the
time a door's own handler runs their flag is already off. Pressed, P1 1: each closes without a word and the pick or the
switch goes through in the same press; Traffic's one box saves as it is typed, so nothing in it is lost.

| What | File | Flag | counts |
|---|---|---|---|
| Traffic · Day details ⓘ · Jump to a date · the document viewer | `ui/Modals.tsx AirPop`, `DayPop`; `ui/WeekCal.tsx`; `ui/DocViewer.tsx` | `AIRKEY`, `DAYPOP`, `WEEKCAL`, `DOCVIEW` | **no** — they close themselves at the press, as today (H2) |

The document viewer over an Input window with typing: on a desktop the bar stays free over both and today the pick goes
through, the Input window left greyed with its band scrolled out of sight; on a phone the viewer covers every door
(pressed, P1 1). After Build 1 the viewer closes at the press and the Input window under it refuses (B4).

**(e) The question sheets.** No row reads the sheets' own list, `topSheet()` — it holds what does not count (the table
of §3.1). In its place:
- the OIL question, the upchit summary, the medical clash and "no document" raised inside the Input window
  (`OilConfirm.tsx`, `UpchitConfirm.tsx`, `MedClashConfirm.tsx`, `DocConfirm.tsx`) stand over a window already counted
  — no row of their own; nor have the ask cards (`ui/AskCard.tsx`) of the Input window, of a calendar day's window and
  of the Leave War's sheets;
- **the medical move** — a row of its own: `pops.ts MEDMOVE`, drawn by `ui/MedMoveConfirm.tsx` (`if (!m) return null`),
  mounted at the top level;
- **the OIL question put before a change** — a row of its own: `state/view.ts OILWAIT`, drawn by `ui/OilWaitSheet.tsx
  OilWait` (`if (!w) return null`); `view.setPage` clears it on a page change;
- **the OIL question raised from a row of the Inputs list** — a row of its own, `oilrevise`. The row's "OIL" / "OIL?"
  button (`ui/InputsPage.tsx reviseOil`) raises `<OilConfirm>` from the page's own state (`oilConf`, l.281, l.1013)
  **with no Input window under it**, and its Save rewrites the row's OIL answer. Reported by
  `useGuardWork('oilrevise', !!oilConf)`. Of the sixteen uses of the five question components, in seven files, it is
  the only one found outside a counted window or a row of its own (the Leave War's three, in `BidPicker.tsx` and
  `SelectSheet.tsx`, were taken as inside their sheets, not traced); R3 counts each use (§3.4).
counts: **window**, all three. Shaded.

**(f) The Leave War — `leavewar/ui/Sheet.tsx`. One row, `open() = warWindowOpen()`, `where: 'leavewar'`.** Not shaded
(`modal={false}`): a person's window / My leave (`PersonWindow.tsx`), Grades (`GradesSheet.tsx`), Required figures
(`ReqPanel.tsx`), Selected days (`SelectSheet.tsx`). Shaded: Place a bid and the four award / posting sheets
(`BidPicker.tsx`), Settings, Open for bidding, Events and an event, the OIL tracker and its settings, a counter, a day's
list, Remarks, Rename, a manning row, the closed note, New leave war. counts: **window**. `Sheet.tsx OPEN` is kept by
mount, and the page stays mounted out of sight — N1.
Not through `Sheet`, their state a component's own: the Legend and the under-manned list (`Chrome.tsx`, a scrim, a tap
outside closes), the flying working-out (`FlyRows.tsx .flywork`), an event's peek (`Matrix.tsx evPeek`), the bid
window's own pickers — counts: **no**, lists and peeks that a press outside closes (H2 names the Legend).

**(g) The Tracker — `tracker/app/core.js`, module state; everything is drawn inside `#page-tracker`. `where: 'tracker'`.**

| `TRK_WINDOWS` id | What | counts |
|---|---|---|
| `dlg` | Any of its questions and boxes (`components/Modals.jsx DlgModal`) — "+ Add …" prompts, Export, the unsaved-edits question itself (which, raised by a pick or a landing, is drawn over another page: the `trkask` row, §3.1) | window (shaded) |
| `pop` (+ `popMsg`) | The marking window (`components/Pop.jsx`). It has no box to type in (pressed, P3 4), and **any press outside it closes it** — `tracker/App.jsx clickAway`, a `click` listener on the document that spares only `#pop` and `.ball`. So opening the Schedules list closes it before a row can be pressed, and a press on the badge is refused and then closes, in the same press, the window the note says to close. Left behind another tab on a desktop it stays set, and the pick then closes it without a word; on a phone it closes as he leaves the Tracker (pressed, P5 N1) | **N7** — the first draft's "window" cannot be built as written |
| `infoId` | An event's details, opened in ⓘ mode — a bubble; it goes at a pick and at the view switch, ⓘ turning off at a pick and staying on at the switch (pressed, P1 4) | **no — closes by itself, as today (D2597; this cell was "N7", whose marking-window half stays open)** |
| `editId` · `sylModalOpen` · `ordMode` · `copyOpen` | The ball editor, Edit syllabus, Reorder ("Crew order": Cancel / Save order), Copy (`Modals.jsx`). Reorder's shade covers every door (pressed, P1 4) | window |
| `flexWinOpen` · `showAllOpen` | Flex settings (`FlexSettings.jsx`: Cancel / Save), Show All (`ShowAllPanel.jsx`). Both shaded on a desktop (pressed, P1 4); neither is drawn on the phone's Tracker page as it opens | window (Show All: H2) |
| `downLog` · `failLog` · `lullPick` · `lullCopy` | Down days, the fail log, the two lull pop-ups (`SidePanel.jsx`). Whether a press outside closes each, as it closes `pop`: **not traced** — the builder reads each before its row is built (§14). **All four are drawn inside the Info panel, which a screen 1050 wide or less hides while its Flow chart tab shows (§3.1)** | window; hidden behind the Flow chart tab: **N12** |
| `arrangeMode` | Edit chart layout. With nothing moved a pick closes it without a word; the view switch on his own squadron leaves it open (pressed, P1 4) | **no** — a mode; with edits unsaved the Tracker's question answers for it (H2); at the view switch: N10 |
| `showDetails` · `toolsOpen` | Details mode, the tools set | **no** — modes |
| — | The Legend (`Legend.jsx`), the File and course menus (`Header.jsx`): a component's own state | **no** — lists and menus |

**(h) Admin — a component's own state, reported by `useGuardWork` (§3.1).** Today a pick asks nothing of any of them
(pressed, P2 1): a changed Role is lost, the row open again on return; "Give access" keeps its words across a pick and
loses them at the view switch; "Add a person" **carries its typing to 149, its Home squadron box now reading 149**;
"+ New squadron" stays open on 149 with what was typed; a row with typing, then the Squadrons section, then back: still
open with its words — the sections are hidden, not removed.

| What | File | counts |
|---|---|---|
| An opened row with something changed in it | `ui/UsersPanel.tsx PersonEditor` (`name`, `role`, `lines` against what it opened with), `ArchivedEditor` (`box`, `postIn`) | row (D2595; how far "typing" reaches: H3) |
| The same row, opened, nothing changed | | **no** (D2595 says "with typing") |
| "Give access" (`Waiting`) · "Add a person" · "+ New squadron" (`NewSquadron`) · a squadron's move (`MoveEditor`) · a place being edited (`PlaceEditor`) | `UsersPanel.tsx`, `ui/SquadronsPanel.tsx` — five reports | H3 — recommended **row** once anything in them differs from how they opened; each has words of its own that he has not seen (words3 W2 — §4.6) |
| "Clear edit history…" armed | `ui/AdminPage.tsx ClearForm` | **no** — an inline two-tap control (press report A) |

**(i) Lists, menus and modes — in the table as `'no'` so the list is whole.** The bell's list (`pops.ts BELLLIST`), the
Schedules list (the component's own state in `ui/SquadronMenu.tsx` and `ui/Drawer.tsx DrawerSquadron`), the ☰ menu
(`DRAWER`), the Schedule Insights menu, the board's small menus (`.wavemenu`, `.stmenu`, `#sbMoreMenu`), a date box's
calendar (`ui/DateBox.tsx`), **the Medical page's "as of" calendar** (`ui/MedicalView.tsx calOpen`), the Add-people picker (`InputsCal.tsx .ic-pick`); **the Scheduler Board alone**
(`state/view.ts SBDAY` — H2; it is a window over the whole screen, the top bar's picker, badge, ☰ and bell all under
it, its only doors its own bell and ✓ Done: pressed, P1 3), OIL Earn (`OILDAY` — it lives only on the board), an armed
slot (`ARM`), an armed "Discard N edits & load" or Withdraw (`RESTARM`, `UNPUBARM`), Logic's edit mode (`state/auth.ts
LGEDIT`), Edit quals, the "Set as default?" bar (`SECDEFOFFER`), the "Not swapped" bar (`OILBAR`), the welcome-back
card; and the one-shot hand-offs that are no window at all (`OILASK`, `OILOWN`, `INPEDIT_REFOUND`, `AIRRID`, `BELLAT`,
`INSIGHTS_ALL`, `OILSIGN_LATER`).
**Pressed, P1 5, and not what the first draft assumed:** an armed slot is dropped by a pick; **Logic's edit mode and
Edit quals are not** — 149's Logic and Quals open in their edit mode with "Done" drawn, the change already typed saved
into 142's record unasked, and Quals keeps "Done" in the member view. Whether a mode with something changed in it
should count, or be closed, is H2's; P12 pins what today does, as pressed.

**(j) A change not saved.** One row, `counts: 'unsaved'`, `open() = saveRefused()` (`storage/savewait.ts` — the saver's
state is `'failed'`, the band "Not saved — keep this page open" with Retry; it stays `'failed'` through a Retry in
flight, so a Retry-then-pick is refused without H8 — Fable's check). "Not kept" (`ui/savestatus-source.ts readBand() ===
'nokeep'`) is not a row: it never blocks (D2594).

**(k) Typing that is in no window** — a day's note, Help's bug box, a calendar's "+ Note", a Balances figure box, the
Logic search and Quals filter boxes: **not in Build 1** (H13 is not one of the five it waits on); a `'no'` row each,
`why: 'H13'`. Today, pressed (P4 4): Help's words stay in the box across a pick, saved nowhere; a Balances figure and a
day's note are saved into 142's record at the pick.

### 3.3 A window he cannot see — question N1, in two cases

**Case one: its page is out of sight, and a tab leads back to it.** The Leave War and the Tracker stay mounted when
another tab is shown (`leavewar/LeaveWarPage.tsx`, `tracker/TrackerPage.tsx`), and their windows with them: `Chrome.tsx`'s
own Escape handler exists because "the legend … left open behind a tab switch must not swallow Escape". So
`warWindowOpen()` and the Tracker's states can be true with **nothing of them on screen**. Refusing then tells him to
close a window he cannot see. Recommended: it still refuses, and the note says where — "Blocked: close the open window
on the Leave War, then pick 149." (Tracker: "…on the Tracker, then pick 149.") `[WNS]` (words3 W3) — because letting the
pick through leaves that window behind a switch he made (what D2403 rules out), and closing it for him loses a bid half
typed. **Pressed today (P5 N1):** My leave does stay open behind the Inputs tab; a pick of 149 from there goes through
with nothing said; back on the Leave War under 149 the window is greyed, with "This is 142's. You picked 149 — close
this to go on." and Close; with 142 picked again it is live. On a desktop the Tracker's marking window and Edit chart
layout stay out of sight behind another tab too, and the pick then closes each without a word; on a phone the marking
window closes as he leaves the Tracker.

**Case two: its page is one the squadron in view no longer offers — and the recommendation above is then unsafe.**
Hunter has 149 picked by Plan, opens a person's window on the Leave War, presses the Inputs tab. Then a change he did not make leaves him a View of 149 only (a dated Plan ending at midnight). 149 now
offers View-only Sched and Help alone; the Leave War tab is not drawn (`perms.ts pageOffered`); the sheet is still
mounted, and its own Escape and Tab act only while the Leave War is the page showing (`Sheet.tsx`, the kept-mounted
guard). Under case one's answer every pick, both view switches and every bell line would be refused **with nothing on
screen that can close the window** — only Logout or a reload, each of which loses what is typed in it. Before Build 1 a
pick of 142 got him out. The same holds for the day panel and for a Tracker window. Recommended: **a row whose page the
squadron in view does not offer does not count** — the pick goes through, as today, and that window keeps today's
handling for a change he did not make until Build 2's card replaces it (D2405). **(reading)** — his to answer.

**A third case is a question of its own — N12:** a Tracker window inside the Info panel while a narrow screen shows
the Flow chart (§3.1's table). The page is on screen and its Info tab is drawn, so he can reach the window in one
press and nothing traps him; but a note that says "…on the Tracker" names the page he is already looking at.
Recommended as case one: it refuses, and the note says where (§8.3). The panel is hidden by a style rule, which
jsdom does not load, so its proof is a browser test (§4.7).

**How the code is shaped for any answer:** `where` on each row and one function, `rowReachable(row)` — `where ===
'any'`, or the page shown, or (case one) a page `pageOffered(where)` — so each case is one line; N12 is the `behind`
mark the Tracker's bridge hands over (§3.1), counted or left out in the `trk` row's one predicate. **Nothing of N1 or
N12 is built until he answers:** they block the Leave War's, the day panel's and the Tracker's rows, and with them
step 1 of §10.

### 3.4 The tests that fail when a window is added without a row

New file **`src/ui/msq-guard-rollcall.test.ts`** (reads source; no app is mounted). Each scan maps **every occurrence**,
not every file.

| Test | What it asserts | Fails first? |
|---|---|---|
| R1 "every flag has a row, and every row reads what its window is drawn from" | each `export let` of `ui/pops.ts` **and of `state/view.ts`** is the flag of a `GUARD_ROWS` row, or is named in the test's own census as not a window, with its reason (the shape of `pops.test.ts`'s check against `POPS_RESET`); each row's `open` is a function of `ui/windrawn.ts` (or of `ui/winorder.ts`, `state/typing-hold.ts`, `tracker/role.js`, `storage/savewait.ts`, or a `useGuardWork` count), and for each `windrawn` function **its component's file imports that name and calls it** | yes — no table yet |
| R2 "every movable window has a row" | every `<FloatWin id="…">` in a non-test file under `src/` is a key of `FLOAT_WHERE`, the map names no id the source lacks, **and `'avail'` and `'chg'` are not keys of it** | yes |
| R3 "every frame is counted, one by one" | in every non-test file under `src/`: each `role="dialog"`, `aria-modal`, `className="airpop…"`, `className="modal"`, `<Sheet ` — each call of `useSheetFocus`, `useEscClose`, `useEscWindow`, `escCloses`, `useFloatWin`, `useBarFree`, so a window drawn as a plain box is seen by its keys — **and each use of `<OilConfirm`, `<UpchitConfirm`, `<MedClashConfirm`, `<DocConfirm` and `<AskCard`** (sixteen today, in seven files) — is counted, and the test's census pins **the count per file**, each occurrence mapped to a row id, to the counted window it stands in, or to a `'no'` reason. A second dialog in `Modals.tsx` fails here with the words "give it a row in ui/guard.ts GUARD_ROWS" | yes |
| R4 "the Tracker's list is whole" | every module-level name `endSession()`'s body resets in `core.js` is a `TRK_WINDOWS` id or is in the test's own list of what is not a window (the modes, the search, the save words), with its reason; each dialog, `.modal` and `.pop` drawn in `tracker/components/*.jsx` is counted per file and mapped to an id; **each id drawn inside `SidePanel.jsx` carries `panel: 'info'`** | yes |
| R5 "the doors are these, and no others" | (a) the only non-test callers of `enterSquadron(` with a third argument, of `switchRoleInForce(`, `switchRoleView(`, `pickSquadron(` and `enterForLine(` are the ones in §4.1's table — the list as it stands at step 6; step 7 adds its new `enterForLine` callers in the commit that makes them; (b) **no non-test file but `state/store.ts` calls `view.setPage` or imports `setPage` from `state/view`** — every page change by a press goes through the page door (§4.5); (c) **every non-test call of the page door is in the test's census with its kind — `last`, `then`, `answer` or `asks first` (§4.5's table)**, read from the source: nothing but a redraw and the closing of its own menu follows a `last` call; an `asks first` function's first statement is its `ownPageRefused` line. A new call site fails until it is listed with a kind | (a) **a pin** — it passes the day it is written; (b) yes — six files reach `view.setPage` directly today; (c) yes |
| R6 "the checker fires" | the entry checker (below), fed a made-up squadron change by press: with a window open and no door's leave, it throws by name; with a leave and a window outside its `skip`, it throws; with the leave and only its skipped window, or with nothing open, it passes; a window opened in the turn of a refusal fails by name | yes |
| R7 "the scans catch a planted window" | each scan of R1–R5, run on a made-up source string holding one thing more than its census — a second dialog in a listed file, a new `export let` in `view.ts`, a new state reset in `endSession`, a second `<OilConfirm` in a page file, a statement after a `last` call of the page door — reports it | yes |

**And one checker that runs under every existing test**, in the pattern of the order's §8 point 1 (the global set-up
`src/testing/marks-guard.ts` already installs one): **`state/guard.ts setEntryChecker`** — installed by the test set-ups
(`src/testing/` and `src/leavewar/test-setup.ts`, which import `ui/guard` too, so the guard answers in the headless
state tests of the census as well); a no-op in production. Two checks:

1. **No squadron or view change by press goes through with something open that its door did not leave out.** Each
   `refuse()` that passes hands the checker its door and `skip` — the leave, good for the synchronous turn it was
   given in. `enterSquadron` with `byPick` true and `switchRoleInForce` ask the checker first: it asks `refusalAt`
   again — **with the `skip` of the leave in hand, or with none where no door gave one** — and throws by name if that
   refuses. So the OIL list's card and the held window's chip pass with exactly their own window left out, a second
   window still fails them, a raw entry with anything open fails, and a raw entry with nothing open passes as today
   (`ui/memberview.test.tsx`, `leavewar/rolerestore.test.ts`). A press that waited is covered without more code: the
   Tracker's `again` re-runs the whole tap, and the landing asks the guard again with the door it kept (§4.5) — each
   ask is the leave for the entry that follows.
2. **Nothing opens behind a refusal.** At each `refuse()` that refuses, the checker notes which rows are open; at the
   end of that turn (a microtask) a counted row that is open and was not fails the test by name. The standing proof of
   §4.5's rule.

**Switched on in one step of its own, after the last door is guarded** (§10 step 6): `enterForLine` and the landing
both enter with `byPick` true, so any earlier and every existing bell test that taps across squadrons with something
open goes red before its door is built. Its allow-list — a test that drives a raw entry with something open, on
purpose: F4, the held chip's tests, step 3's kind (b) files — is in the checker's own file, by name with the reason,
and Build 2 empties it. **Its limit, said and not tested for:** it sees only an entry made with `byPick` true, and
the role switch. A squadron change his press causes through `maybeReenter` (`byPick` false — the Undo of N11 is the
one known) is invisible to it; R5 (a), §4.1's roll-call and the walk hold that family.

### 3.5 Part A's own tests, in the order written — `src/ui/msq-guard-open.test.tsx` (jsdom, `test-support/msq-world`)

Each window is opened **through the app's own opener and component**, never by setting a flag. All fail first (there is
no table), except where marked.

| # | Name | Asserts |
|---|---|---|
| A1 | nothing open | `whatIsOpen()` is null for an admin at home, an admin by Plan on 149, a master admin, a member with View |
| A2 | every row that counts is seen, and gone when it closes | a loop over `GUARD_ROWS` where `counts !== 'no'`: the test's own map gives each row its opener and each of its ways out (✕, Close / Cancel, Escape, Save); opened → that row's id — each movable window its own; after each way out → null. **A row with no entry in the map fails** |
| A3 | what does not count | a loop over the `'no'` rows: opened → null. And with ALL AVAIL's or Changes' row set to `'no'` in the test and the window up: null — no movable-window row answers for it (H2's other answer is two rows) |
| A4 | two open | an Input window and a failed save: the window's row; closed → `unsaved`; saved → null. The OIL list and a second movable window: `whatIsOpen(['oilday'])` names the second |
| A5 | "Not kept" | `setStorageKept(false)`: null |
| A6 | a Users row, and each of the other six forms | opened, nothing changed → null; a letter typed in Sign-in → `row`; put back as it was → null; Cancel, Escape, a second tap on the name, Save → null; another Admin section shown → as H3; the Inputs tab → null (the page unmounts) |
| A7 | a window on a page out of sight | a person's Leave War window open, then the Inputs tab: as N1's first case; then his right lowered to View under it: as N1's second case |
| A8 | the Tracker | each `TRK_WINDOWS` row opened by its own opener → reported through `trackerWindowsOpen()`; `endTrackerSession()` → none; the Tracker never loaded → none. The unsaved-edits question raised by a pick while the Inputs page shows: the `trkask` row, the cover up or not; answered → null |
| A9 | nothing stale after a sign-out or an unmount | `resetSession(null)` with five windows open → null; a `FloatWin` whose parent unmounts without its ✕ → null |
| A10 | **counted means drawn** | for every row that counts: opened by its own door, then each change he did not make that the test world can make — his right in the squadron lowered to View, the role in force changed, his move at midnight, the page changed by a landing, the board closed under its dialog — and after each: **either `whatIsOpen()` does not name the row, or the row's `sel` finds its box on the page with no `hidden` ancestor**. Duty templates under a lowered Plan is the worked case: `TPLEDIT` still true, no dialog, `whatIsOpen()` null. It cannot see a box hidden by a style rule (N12): that is the browser test's |
| A11 | the Tracker not drawn | `pop` set, then the boot error card, then "Loading…", then the page's cover: `trackerWindowsOpen()` none in each |
| A12 | the OIL question from a row of the Inputs list | the row's own "OIL?" button pressed, no Input window anywhere: the `oilrevise` row; its Cancel, its Save, Escape, the tab left → null |
| A13 | a Tracker window behind the Flow chart tab | Down days opened on the Info tab, the phone layout's tab set to Flow chart: the bridge marks it `behind: 'info'`; `whatIsOpen()` as N12 decides |
| A14 | the guard is not asked on a change he did not make | a spy on `refusalAt` through his own move at midnight and a right ended, under an Input window, a Leave War window and the chart editor: never called |

---

## 4. Part B — the doors refuse

### 4.1 Every way the squadron in view or the view changes by his own press

"The door" is the function the check is written in — never the control. No blank cells. **Five functions hold a check:
`pickSquadron`, `switchRoleView`, `enterForLine`, the page door `store.ts setPage` (new — §4.5; with it, the landing's
second ask after the Tracker's question), and, if N11 is answered so, Undo's own. And whatever a press would open
after the page, the page door runs — never the caller (§4.5).**

| # | His press | Reaches | Refused by the guard? |
|---|---|---|---|
| 1 | A row of the bar's Schedules list (`ui/SquadronMenu.tsx` `pick`) | `state/pick.ts pickSquadron` | **Refused** — in `pickSquadron` |
| 2 | A row of the ☰ menu's list (`ui/Drawer.tsx DrawerSquadron` `pick`) | `pickSquadron` | **Refused** — the same line; the menu then closes and is redrawn (H11). Today the menu stays open after a pick (pressed, P3 2) |
| 3 | The role badge, both ways (`ui/Shell.tsx #roleBadge`) | `state/store.ts switchRoleView` | **Refused** — in `switchRoleView` |
| 4 | The ☰ menu's "Switch to the member view" / "Back to the admin view" (`Drawer.tsx #drawerRole`) | `switchRoleView` | **Refused** — the same line. Its handler is `setDrawer(false); switchRoleView()` and only `switchRoleView`'s own `notify()` redraws: a refusal that returned before it left the menu on screen over the window — the handler now redraws itself (§4.4) |
| 5 | The Input window's own "Back to the admin view" chip (`InputWindow.tsx` `inped-rolechip`, drawn only on a window the member view holds) | `switchRoleView` | **Must not be** — it is the held window's own way back, and the only window open is the one it gives back. It passes `skip: ['inputedit', 'inputdlg']` (the Input window's two rows) and still asks every other row. No press reaches that state after Build 1 (pinned, B16); Build 2 removes the chip |
| 6 | A bell line of a squadron his own pages may be (`ui/topbits.tsx BellList` → `ui/topstate.ts openNotice`) | `state/belltap.ts enterForLine` → `enterSquadron` | **Refused** — in `enterForLine`; the line stays unread, the list open (§3 of the scenarios file). Today it enters, opens the window live and reads the line (pressed, P2 2) |
| 7 | **Any bell line that opens one of his own pages while a squadron he only views is picked** — a line of his own squadron (`enterForLine` answers `'here'`); a line of a squadron his pages may never be, which answers `'no'`: a third squadron he only views, one he has left, or the squadron in view itself while he is in the member view | `openNotice` → `openInputOnPage` / `openWarAt` / `openAdminUsers` → `setPage` → `store.ts landOnOfferedPage` → `landOnOwnPage` → `enterSquadron(home, …, true)` | **Refused** — at the page door, asked by `openNotice` before anything is marked read or closed, **and the window is run by the door, so none opens behind the refusal** (§4.5). The squadron comes back through `'no'` just as through `'here'` (§15, finding 1). Today: the bar goes to 142, the window opens (pressed, P2 5) |
| 8 | The bell itself, an access request (`topstate.ts bellTap` → `belltap.ts openBellRequest`) | `enterForLine`, then `openAdminUsers` → `setPage('admin')` | **Refused** — in `enterForLine` where the request's squadron would be entered, at the page door where Admin is not offered in the squadron in view; the note's words are H7. Today the tap enters 149 with a 142 Input window left greyed (pressed, P2 3) |
| 9 | The bell itself, his own unanswered OIL question on an input of another squadron (`bellTap`, the `oilHit` branch) | today: **no entry asked for** — `openInputOnPage` → `setPage('inputs')`. A Plan holder or master admin gets the input live under the squadron in view (security F2 — not pressed: P2's Plan holder was 142's admin, whose question sits under the holiday's line). A View holder with a squadron he only views picked gets his own squadron back first, by the landing, nothing checked (pressed, P2 4) | **Refused** at the page door in the second case — **the window, its toast and the OIL question with it: all three are the door's `then`**. This half needs no answer of his but H7's words and is built with the page door (step 5). The first case — the input's own squadron brought into view before its window — **is half of the one question N2 + N8** (D2403's row says the bell's OIL line is "not covered"); built on his answer it is refused in `enterForLine` (§5.3) |
| 10 | A card of the OIL list (`ui/OilDayList.tsx Body openInput`) | today `setInpEdit` then `setPage` (security F1) | The input's squadron and its page first, then the window, run by the page door (§5.3). **Its own door id, `'card'`, with `skip: ['oilday']` — and that `skip` goes with the press to `enterForLine`, to the page door, to the landing and to the checker**. Refused for any other window or a change not saved, in N3's words |
| 11 | A holiday's bell line, a squadron he only views picked — 142's OIL list opens over 149's View-only Sched (`openNotice`, the `oilhol` branch: no page changes, so no landing) | `setOilList` | **Not a door today:** nothing changes the squadron or the page, so nothing refuses it — and nothing may until N4 is answered. The fault is the list under the wrong number; **waits on N4** |
| 12 | "Check my quals" on the welcome-back card, a squadron he only views picked (`ui/WelcomeBack.tsx` — drawn over every page, `Shell.tsx`) | `setPage('quals')` → the landing | **Refused at the page door — its words wait on N3.** The card asks **before** `markBackSeen()`, which today runs first: a refusal after it would have spent the card. Pressed today (P5 N3): the bar goes back to 142 and Quals opens, the card gone, nothing said — and the same with "Not saved" up, the band and its Retry following him |
| 13 | Undo or Redo whose step lands on one of his own pages, a squadron he only views picked (`undo/timeline.ts` → `state/undo-wire.ts snapView`) | `setPage` → the landing | **No button reaches it today:** on a squadron he only views, the View-only Sched draws no Undo at all (pressed, P5 N3; P4 1d) — Ctrl+Z and the Help page were not pressed (§14). **The page door is its belt:** it stops the squadron changing whatever calls it. Should a road be found, the Undo itself must be refused before its step — `snapView` runs before the step's writes, so a refusal at the page alone would leave the step done and the note untrue: `globalUndo` would ask first, with the page the step would land on (`undo-wire.ts landingOf`); words N3's. **The place:** `undo/timeline.ts globalUndo`'s own chain of refusals ahead of `snap(entry, 'undo')` — the line commented "refuse an unrestorable closure BEFORE the view-snap moves anything" — by a hook in the pattern of `hooks.restoreRefusal`; `globalRedo` has the twin chain. In `snapView` itself the page door's answer is tested — `land.then` runs only on `'went'` (§4.5). Falls away in Build 3 (D2593) |
| 14 | A page tab or a ☰ menu page (`Shell.tsx nav`, `Drawer.tsx go`) | `setPage` | **Never refuses** — a tab changes the page, never the squadron: while a squadron he only views is picked the tabs that would bring his own back are not drawn (`Shell.tsx hidden={viewOnly}`, `Drawer.tsx pageOffered`), so the page door is asked only for pages offered. Pinned (B17) |
| 15 | The Scheduler Board's own bell (`ui/SchedBoard.tsx #sbBell`) | rows 6–9 | **Refused** as rows 6–9 — one `BellButton`, one `bellTap`. Today a 142 line pressed there closes the board and changes the squadron without a word (pressed, P1 3). The board alone is not a window (H2); its cancel-reason box and Sort all cover its bell |
| 16 | Logout (`ui/logout.ts logOut`) | `resetSession(null)` | **Must not be** — D2592: never refused. Unchanged in Build 1 |
| 17 | Signing in (`ui/Login.tsx` → `resetSession`, then `setPage(back)`) | `enterSquadron`, `byPick` false | **Must not be** — nothing can be open; not a press inside the app |
| 18 | A key | — | **None exists.** No shortcut picks a squadron or switches the view (`ui/interactions.ts`, `Shell.tsx navKey`: Enter and Space press the control under the keys, which is rows 1–15). Pinned by R5 |
| 19 | A link or the browser's Back | — | **None exists.** No page or squadron has an address (`location.hash` is read only by `ui/dragdbg.ts`, a developer's switch) |
| 20 | Not his press: his own move at midnight, a right taken away, a held war window closing, the Tracker following once held work is gone (`store.ts maybeReenter`, `refreshAccess`; `typing-hold.ts warWindowGone`; `core.js followIfHeld`) | `enterSquadron`, `byPick` false; `view.setPage` called inside `store.ts`, never the page door | **Must not be** — "a change he did not make keeps today's handling" (D2403) until Build 2's card (D2405). Pinned (§7, P5) |
| 21 | **Undo of "+ New squadron" while that squadron is in view** — Saber makes 150, picks it, presses Undo: 150 is gone, the bar back on 142, Admin shown, a toast only (pressed, P4 1c). A squadron change by his own press that is no pick: `maybeReenter` finds the pick stands on nothing (`perms.ts pickStandsOn`) and enters his home, `byPick` false. | `store.ts entryDue` → `enterSquadron` | **MISSING — waits on N11.** As today until then. The checker cannot see it (`byPick` false — §3.4's limit). **Its place, on his answer:** the same chain of refusals in `globalUndo` as row 13, reading the entry's `inverse` for the squadron row (`UNIT_PFX`) of the squadron in view; the shape of that read is the builder's. A step of its own (§10, 6b) |
| 22 | The Leave War's links and the board's "make a period" (`leavewar/sync.ts openInputWindow`, `openInputsPage`, `openNewPeriod`, `openWarAt`; `ui/interactions.ts`) | `setPage` | Each opens a page a squadron he only views does not offer, from a page it does not offer either — reached only through a war window held after a change he did not make, a squadron he only views picked. **The page door is their belt, and each is made safe by itself** (§4.5's table): `openInputWindow` opens its window as the door's `then`; `openWarAt` and `openNewPeriod` ask first; `openInputsPage` and "make a period" do nothing after the page. The closed note's own "Open the Inputs page" in that state: §11 risk 20 |
| 23 | The developer's switch (`probe-bridge.ts` `w.setPage`, `setEffectiveRole`) | — | **Must not be** — not a control of the app; through the page door all the same |

### 4.2 The order of the checks at every door

1. **Is the press a change at all?** The squadron already in view picked (`u === UNIT`); a person who may not switch
   (`mayViewAsMember()` false); a line that enters nothing and opens no page — `enterForLine` answers `'here'` or
   `'no'` for it, and it is an input since deleted ("That input is gone"), a posting of a man with no row left, his
   own account's line, or a holiday's line (N4). → exactly as today, nothing asked, nothing said (pinned, P16). **The
   same line of a squadron he can enter is a change:** `openNotice` calls `enterForLine` before it looks at what the
   line is about, so today it enters that squadron, and after Build 1 it is refused like any line.
2. **The guard.** `refuse(door, to, opts)`. Refused → the note, and the press ends having changed nothing: no flag, no
   page, no line marked read, no list closed by it, no card spent — **and no window, question or toast opened after
   it** (§4.5).
3. **A save still going** (H8, §8) — at every door, the page door too: each door either owns what follows it (`then`)
   or is handed the tap to run again (`again`), so each can wait for the save and start over (§4.5).
4. **The Tracker's question**, where the press would take the Tracker off unsaved chart edits.
5. **After the question is answered Save or Discard, step 2 again** — a window or a failed save may have arrived while
   it stood (§11, risk 1) — then the change.

### 4.3 `state/pick.ts`

- `pickSquadron(u, opts?)`: after `if (u === UNIT) return`, `if (refuse('pick', u, opts)) return`. In the `ask.then`,
  before `enterPicked(u)`: `if (u === UNIT || refuse('pick', u, opts)) return`.
- `pickWillAsk(u)`: false where the guard would refuse (the ☰ menu reads it to decide whether to close "for the
  question").
- New `pickRefused(u): boolean` = `u !== UNIT && !!refusalAt('pick', u)` — for the ☰ menu, which must know before it
  touches its own list (as `pickWillAsk` exists for the same reason).
- `ui/Drawer.tsx DrawerSquadron pick`: `setOpen(null)`; then where `pickRefused(u)` or `pickWillAsk(u)` — `setDrawer(false);
  notify()`; else the keys back on the button; then `void pickSquadron(u, { from: 'drawer' })`. So a refused pick closes
  the menu and the note stands at the foot with the window in sight, as drawn (`p3-p`). H11 decides this line.
- `ui/SquadronMenu.tsx pick`: unchanged but for `{ from: 'bar' }` — it already closes its list and puts the keys back on
  `#sqnMenuBtn`, which is where the note then hangs.

### 4.4 `state/store.ts switchRoleView(opts?)`

Today it is one synchronous body that asks nothing. It becomes:

1. `if (!mayViewAsMember()) return`; `const toMember = isAdmin()`.
2. `if (refuse(toMember ? 'toMember' : 'toAdmin', null, opts)) return` — `opts.skip` for row 5, `opts.from` for the
   note's place.
3. **The Tracker's question.** New in `tracker/role.js`: `trackerSwitchAsk(to, back = false)`; in `core.js` the
   registered `ask(to, back)` builds its last line as `'Save them before switching ' + (back ? 'back to ' : 'to ') + to
   + '?'` — so a pick's question is byte for byte today's. Called with `('the member view', false)` and `('the admin
   view', true)`: "You have unsaved chart edits on “2026”. Save them before switching to the member view?" `[WNS]` — it
   is drawn (`p5`), but no ruling row names that drawing, so it is not a wording of record — and "…Save them before switching back to the admin view?" `[WNS]` (words-read N7:
   read by a fresh Fable, not put to him). **When it is asked: N5.** The answers are the pick's: Stay — nothing; Discard
   them — the chart reloaded, then the switch; Save them — saved, then the switch; a Save that does not take — he stays
   (`core.js saveForQuestion`).
4. After Save or Discard: step 2 again, then today's body — `switchRoleInForce`, `bumpNav`, the landing off Edit Schedule
   and Admin, `armDrop`, `setLgEdit(false)`, `clearAdminOpen`, `lwSetRole`.
5. **Where the switch moves his own pages** (`pageUnit('own')` before it is not `pageUnit('own')` after — a Plan holder
   or master admin with another squadron in view): `enterSquadron(UNIT, false, true)` **before** `notify()` — the entry
   his own press makes, so `rebindStorageUnit(own, mayHold = false)` moves the Tracker (`core.js follow` → `'moved'`) and
   a chart editor open with nothing unsaved closes as it does at a pick. Without this line the move is left to
   `maybeReenter`, whose entry is not "by pick", and `trkMayHold()` holds the Tracker under the member-view cover for
   an open editor — the state D2403 says his own switch must not leave. **The editor closing here is a change he would
   see that no ruling names**: today, on his own squadron, Edit chart layout stays open through the
   switch (pressed, P1 4), and for a Plan holder on 149 it waits under the cover (from the code). **N10 — built only on
   his answer.** *For the builder, unproved:* the `notify()` after it runs `maybeReenter` once more with `mayHold` true
   while the Tracker's move is still under way; `follow`'s first call has already run `leaveSquadron` up to its first
   wait, which ends the editor (`endSession`), so the second call should find nothing to hold. Fable's reader could not
   fault this from reading; B14 pins the result, not the reasoning.
6. `notify()`.

`switchRoleView` now answers a promise where it asked. Its three callers ignore the result (`onClick`), as `pick`'s do.
**`ui/Drawer.tsx #drawerRole`** becomes `setDrawer(false); notify(); void switchRoleView({ from: 'drawer' })` — the menu
is closed and redrawn whether the switch goes through or is refused (row 4); the badge passes `{ from: 'bar' }`.

### 4.5 The bell and the page door

**The cut chosen, and why.** The squadron comes back through `enterForLine`'s `'no'` and through the landing (§15,
finding 1). **The plan takes one check at the page door, and makes that door run whatever the press would open after
the page.** The reasons, from the code:

- **What moves him is the landing, and the landing has one cause.** `store.ts landOnOfferedPage` runs on every
  `notify()`; where the page just opened is one the squadron in view does not offer (`!pageOffered(CURPAGE)`), it calls
  `landOnOwnPage`, which enters his home with `byPick` true. So "this press brings his own squadron back" is exactly
  "it changes the page to one `pageOffered` denies" — the door asks the predicate the landing itself acts on.
- **It has no list of callers to keep.** Sixteen non-test places outside `store.ts` call `setPage` today, in twelve
  files, six of which reach `view.setPage` directly. A door in the one function cannot be walked round, and R5 (b)
  fails the day a file reaches past it.
- **It must stand before `view.setPage`, not at the landing.** `view.setPage` itself closes things on a page change —
  ALL AVAIL, Changes, the Traffic window, the OIL question waiting on a change, the armed confirms. A check after it
  would look at a screen the press had already changed.
- **A refusal at the door is not enough by itself** (§16, finding 1). Today `ui/topstate.ts openInputOnPage` is
  `setPage('inputs'); notify(); landingAsk() … else open(false)`, and `open` runs `first()` and `setInpEdit(row)`;
  `leavewar/sync.ts openInputWindow` is `setPage('inputs')`, then `setInpEdit(row)`. Behind a door that only answered
  "no", both would open the window all the same — and with the page still 149's View-only Sched it notes itself as
  opened on 149 (`InputWindow.tsx`: off the Inputs page `pageSqn = UNIT`) and stands **live, beside the "Blocked:"
  note**, its Save writing 142's record under 149's number. The same after the landing's own question, if its promise
  answered true when the guard had just refused. **So nothing may follow a refusal:**

**`state/store.ts setPage(p, opts?, then?): PageGo` — the page door** (new; today the name is a re-export of
`view.setPage`). `PageGo` is `'went' | 'asked' | 'refused'`; `opts` is `{ door?, from?, skip?, line? }`; `then(waited)`
is what the press opens once its page is there.

1. `p === view.CURPAGE`, or `pageOffered(p)`: `view.setPage(p)`; where a `then` was handed over, `notify()` and
   `then(false)`; `'went'`. Every tab, every page of his own squadron and every sign-in goes this way, unasked.
2. Otherwise the press would bring his own squadron back. `if (refuse(opts?.door ?? 'page', home, opts)) return
   'refused'` — nothing has changed and `then` is dropped. Passed: the door and its `opts` are kept in one module
   variable; `view.setPage(p)`; `notify()` — the landing runs inside this call (today it ran on the caller's own
   `notify()`). No question pending (`LANDASK` null): `then?.(false)`; `'went'`. One pending — the Tracker's, over
   unsaved edits in the member view: `LANDASK.then(go => { if (go) then?.(true) })`; `'asked'`.
3. **`landOnOwnPage`, after its question is answered Save or Discard, asks the guard again with the door and `opts`
   it kept** (§4.2 step 5) — `if (refuse(kept.door, home, kept.opts)) return false`, before `enterSquadron`. Its
   promise answers false: nothing is entered, the page stays, `then` never runs, the note stands at the kept door's
   control.
4. A save still going (H8, on his answer): in step 2, before the ask — `'asked'`, and the door runs itself again with
   the same `then` once the save has landed.

So `then` runs in exactly one state: **the page asked for is the page shown.** `waited` is true after a question; the
caller's own "is it still his to open" test (today's `still`) is asked there, as today.

**Two rules for a caller, one for each side of the page change:**

- **What it sets before the page — a line read, a list closed, an intent the page reads as it opens, a card spent — it
  asks about first:** `ownPageRefused(p, door, opts?, again?): boolean` — the door's own test and its note, changing
  nothing; the function's first statement, returning on true (`again` is H8's: the tap run again after the save).
- **What it does after the page — a window, a question, the toast that goes with it — it hands to the door as
  `then`.** One site tests the door's answer instead, and goes on only on `'went'`.

Every call site of the door, with its kind — the census R5 (c) pins (fifteen once the OIL list's card goes through
`openInputOnPage`), and the two functions above them that set a mark:

| Call site | Sets before the page | Does after it | Kind |
|---|---|---|---|
| `ui/Shell.tsx nav`, `ui/Drawer.tsx go` — a tab, a ☰ page | — | a redraw; the ☰ menu closed | `last` — only offered pages are drawn (row 14) |
| `ui/Login.tsx`; `ui/logout.ts`; `probe-bridge.ts`; `topstate.ts bellTap`'s bug alert (`'help'`) | — | a redraw | `last` — his home just entered; guarded by `pageOffered`; the developer's; Help is always offered |
| `ui/interactions.ts` "make a period" | a period written, a toast | a redraw | `last` — it needs `canEditSched()`, false on a squadron he only views, so its page is always offered |
| `leavewar/sync.ts openInputsPage` | — | a redraw | `last` |
| `ui/topstate.ts openInputOnPage(iid, first, still, opts)`, exported — a bell line of an input, the bell's own OIL tap, the OIL list's card | — | the Input window, with `first` (the OIL question and its toast) | **`then`** — its whole body is `setPage('inputs', opts, waited => …today's open…)` |
| `leavewar/sync.ts openInputWindow` — the clash note | — | the Input window | **`then`** — the input found afresh inside it; it answers true ("the tap was taken") whatever the door says |
| `ui/topstate.ts openNotice` (calls the openers below) | the line marked read, the bell's list closed | — | **asks first** — door `'line'`, `{ line: n.id }` |
| `state/belltap.ts openBellRequest` (calls `openAdminUsers`) | — | the toast "1 waiting for access to 149" | **asks first** (`'bell'`), before `open()`, so the toast cannot follow a refusal inside it |
| `ui/adminopen.ts openAdminUsers` | the Users intent (`requestAdminUsers`) | a redraw | **asks first** |
| `leavewar/sync.ts openWarAt` | the war selected, Approvals and Balances put away, the ring asked for (`askRing`) | a redraw | **asks first**, where the page is not already the Leave War |
| `leavewar/sync.ts openNewPeriod` | the new-period ask (`askNewWar`) | a redraw | **asks first** — pressed only inside the Calendar window, which closes itself when its squadron is no longer the page's, so no road reaches its refusal |
| `ui/WelcomeBack.tsx` "Check my quals" | `markBackSeen()` — the card spent; the Quals row to show | a redraw | **asks first** (`'page'`; N3) |
| `state/undo-wire.ts snapView` | (it runs inside the step) | `land.then()` | **`answer`** — only on `'went'`. No road reaches it (row 13); if one is found, `globalUndo` asks before the step |

The ask sits in the function that sets the mark, not only in its caller — Quals' "+ Add person" and the bell both
reach `openAdminUsers`; where a caller has asked already the second ask passes in the same turn. Inside `store.ts`
the landings, the entry and the session reset keep calling `view.setPage`: the app's own moves, never a press (row
20). `leavewar/sync.ts`, `ui/WelcomeBack.tsx`, `ui/Login.tsx`, `ui/interactions.ts`, `state/undo-wire.ts` and
`probe-bridge.ts` import the page door in place of `view.setPage` (R5 (b)). **A forgotten ask-first line leaves** a
line read or a card spent beside a note, caught by its own test (B28) — never a window. **A forgotten `then` is
stopped by** R5 (c), by the checker's second check under every test (§3.4), and by B26 and B27.

**`state/belltap.ts enterForLine(u, again, door = 'line', opts?)`**
- `'here'` and `'no'` answer as today, with nothing asked: what such a tap then opens is the page door's to judge.
- Where it would enter (`ownPageMayBe(u)`): `if (refuse(door, u, opts)) return 'refused'`, before the Tracker's
  question. `opts` carries the pressed line, so the note hangs under it, and a door's `skip`. `again` re-runs the
  whole tap after Save or Discard, so step 5 of §4.2 needs no code here; the same `again` serves H8's wait.
- `LineEntry` gains `'refused'`.

**`ui/topstate.ts openNotice`**
- `const o = { line: n.id }`; `enterForLine(n.u, again, 'line', o)`; `if (where === 'asked' || where === 'refused')
  return` — it stands before `markNoticeRead` and `setBellList(false)`.
- Then one new function, `lineOpens(n, where): string | null` — the page this tap will open, read from the branches
  already there: none for his own account's line, for a posting, Leave War or holiday line where `where === 'no'`, for a
  holiday's line (it opens the OIL list, no page), for a posting whose man has no row, for an input since deleted;
  `'admin'` for a posting, `'leavewar'` for a Leave War line, `'inputs'` for an input's. `if (page &&
  ownPageRefused(page, 'line', o, again)) return` — the line unread, the list open, nothing said but the note.
- An input's line ends in `openInputOnPage(n.iid, undefined, () => stillHis(n), { door: 'line', ...o })`. A line that
  opens no page goes on exactly as today.

**`openBellRequest`**: `'refused'` answers true (the tap was taken), `door: 'bell'`; then `ownPageRefused('admin',
'bell')` before `open()`. **`bellTap`'s OIL branch** sets nothing before the page — its toast and its question are
`first`, inside the door's `then` — so it asks nothing itself: `openInputOnPage(iid, first, still, { door: 'bell' })`.

### 4.6 The note, and how `ui/toast.ts placeToast` learns the control

**The words** — one table in `ui/guard.ts`, `guardWords(reason, door, to)`; the number is the squadron's
(`unitById(to)?.num`).

| Door | A window open — D2590 `[ruled]` | An opened row — D2595, words-read R3 / N3 | A change not saved — D2594, words-read N4 |
|---|---|---|---|
| pick | "Blocked: close the open window, then pick 149." | "Blocked: save or cancel the open row, then pick 149." `[WNS]` | "Blocked: press Retry to save your changes, then pick 149." `[WNS]` |
| to the member view | "…then switch to the member view." | "Blocked: save or cancel the open row, then switch to the member view." `[WNS]` | "Blocked: press Retry to save your changes, then switch to the member view." `[WNS]` |
| back to the admin view | "…then switch back to the admin view." | no road reaches it (the Admin page is not drawn in the member view): **not built**; a test asserts the state cannot be made (B18) | "Blocked: press Retry to save your changes, then switch back to the admin view." `[WNS]` |
| a bell line | "…then press this line again." | "Blocked: save or cancel the open row, then press this line again." `[WNS]` | "Blocked: press Retry to save your changes, then press this line again." `[WNS]` |
| the bell itself (H7) | "Blocked: close the open window, then press the bell again." `[WNS]` | "…the open row, then press the bell again." `[WNS]` | "…then press the bell again." `[WNS]` (words3 W1: shipped as drafted — and true only if the refused tap leaves the bell lit and the request unseen, which B9 asserts) |
| a press that is neither (N3): "Check my quals", an OIL list's card, Undo — and a row of the Inputs list or calendar, if N2 + N8 is answered "its own squadron first" | no words exist | no words exist | "Blocked: press Retry to save your changes, then press Check my quals again." `[WNS]` (words3 W4; "…then try again." only for a press with no words on it) |

Three more sets the words review of 25 Nov shipped, **all drafts for him, none built until he has seen them** `[WNS]`:
- **the other Admin forms** (H3; words3 W2) — each names its own thing and its own two ways out: "Blocked: finish or
  cancel giving access, then pick 149." `[WNS]`; "Blocked: save or cancel the new squadron, then pick 149." `[WNS]`;
  "Blocked: finish or clear Add a person, then pick 149." `[WNS]` **The review's own doubt:** Add a person has no
  Cancel and no Clear — "clear" means emptying each box by hand; a Cancel there is a new control, drawn for him first
  (D1625). The opened rows on Admin → Squadrons (a squadron's move, a place's name) take the row's words;
- **a row or form out of sight in another Admin section** (H3): "…the open row on Users…", "…the new squadron on
  Squadrons…" `[WNS]`;
- **a window on a page out of sight** (N1; words3 W3): "…the open window on the Leave War, then pick 149.", "…on the
  Tracker, then pick 149." `[WNS]`; **and one behind the Tracker's own Flow chart tab** (N12): "…the open window on
  the Tracker’s Info tab, then pick 149." `[WNS]` — the reviser's draft, read by no one yet (D2441).
A row and a form held at once: one note at a time, the order not fixed by anyone yet (words3's own list of what has no
words) — `GUARD_ORDER` decides it, and it is his (§8.1).

Every cell but the first column's four ruled ones is built only on his answer. **Which reason is named first** when two
apply is `GUARD_ORDER` — recommended window, row, unsaved (§3 of the scenarios file: his to answer).

**Where it stands.** The approved drawings, measured from the script that drew them
(`scripts/handpass/n166/draw-beside.mjs`): `p1b` — the note's top 8px below the top bar's foot, its left edge on the
picker's (`#sqnMenuBtn`), the list closed; `p2b` — the same height, its right edge on the badge's (`#roleBadge`); `p4b` —
under the pressed line inside the bell's list where it fits, else 8px under the list on its left edge (the drawing shows
it under the list), the list still open; `p3-p` — at the foot on a phone, the ☰ menu closed.

**Where today's note stands, pressed (P3 1)** — the plain note every refusal would be without this build, "Blocked:
close the open window, then pick 149." raised by the app's own `toast`:

| Size | Window open | Today's place | What it lies over |
|---|---|---|---|
| phone, 402×874 | Input window | **the top** (D731 (1)) | **the window's ✕, 64% of it** — and at this size the window's title strip covers the picker and the bell, so no door can be pressed at all (also P2 3) |
| phone | Inputs settings, or Calendar | **the top** | **the squadron picker (all of it), ☰, Undo, Redo, Sync, the bell** — the very control the note names; they can still be pressed through it |
| phone | My leave (a Leave War sheet) | the foot | two rows of names |
| phone on its side, 874×402 | Input window | the foot — the desktop's 319px box; the app does not use its phone layout here | **the window's Delete, all of it** |
| tablet 768×1024, desktop 1536×864 | any | the foot | nothing |

**How `placeToast` learns the control.** It cannot ask "what was pressed last" (`ui/lastpress.ts`): the pressed row is
gone with its list by the time the note is raised. So the door says, and one table maps it:

- `ui/toast.ts`: `export type NoteAt = { under: () => HTMLElement | null; edge: 'left' | 'right'; below: 'bar' | 'self';
  inside?: () => HTMLElement | null }`; `toastAt(msg, at)` sets a module `AT` and calls `toast(msg, 'blocked')`. **`AT`
  is cleared only by a `toast()` that did not come through `toastAt`**, so the next ordinary note is back in its
  ordinary place. Inside an open batch `toastAt` is a plain `toast` (no door runs inside the publish batch).
- `placeToast()`: where `AT` is set and `noteAtFoot(from)` is false and `AT.under()` is on the page and drawn
  (`getClientRects().length`) — `top` = (the bar's foot, `under.closest('.topbar, .sb-top')`, for `below: 'bar'`; the
  control's foot for `'self'`) + 8; `left` or `right` from the control's edge; `bottom: auto`, `transform: none`,
  `data-at="ctl"`. Then, in the same call, the note is clamped 8px inside the screen's sides. Otherwise today's code
  runs untouched. The rise-in in `toast()` reads `data-at`: an anchored note drops into place, with no sideways shift.
- **The ✕ check runs at every place the note can stand, the foot and the top included** (the table above shows the top
  and the foot each lying over a window's own control today). The places are tried in order — under the control, the
  foot, the top — and the first whose box meets no window's ✕ (`.floatwin .win-x`, `.airpop-head .x`, `.modal-head .x`,
  the ✕ each Leave War sheet draws in its `.bidsheet-hd` — one constant; the last selector is the builder's to read off
  the sheets, §14) is taken; D2590's "never the window's ✕" is the rule. Whether the note may lie over a window's other
  buttons (Delete, above) or over the control it names is H11's.
- `noteAtFoot(from)` — **the one predicate for "a phone" for this note** (H11): recommended `matchMedia('(max-width:820px)')`
  — the width at which `09-week-responsive.css` shows ☰ and hides the tabs and the badge — **or `from === 'drawer'`**.
  The door hands `from` down (`'bar' | 'drawer' | 'board'`): both lists share the door `pick` and both switch controls
  theirs, and the ☰ menu has closed itself before the door runs, so the note could not otherwise know (Opus's low
  finding).
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
  the bell on screen (`pops.ts BELLAT`, else the visible `.bellbtn` — `#sbBell` on the board), right, bar; `card` and
  `page` → the foot until N3 says otherwise. It is the `setGuardSay` function. With no page (a headless test) it is
  `HOOKS.toast(words, 'blocked')`.
- The note is told to a screen reader by `toast()` as every note is (`sayToReader`); the keys stay on the control
  pressed (the picker's button, the badge, the line).

### 4.7 Part B's tests, in the order written

**`src/ui/msq-guard-doors.test.tsx`** (jsdom; the real `SquadronMenu`, `Drawer`, `Shell`'s badge, `BellList`, the real
stores through `test-support/msq-world`). **Every press is the whole sequence on the real controls** — the list's
button, then its row; the bell, then its line; the badge alone — never a call of the guarded function: a press on the
way to the door can itself close the window. "Window" below is an Input window on Inputs with a word
typed, opened by its own door, unless named. All fail first unless marked **pin**.

| # | Name | Asserts |
|---|---|---|
| B1 | a pick with a window open is refused — the bar's list | Saber on 142, the Schedules button then the row "149" clicked: `UNIT` still 142, the war's world and the Tracker's door unchanged, the window still live with its word **and still on the page**, the note's words `[ruled]`, the list closed, the keys on `#sqnMenuBtn` |
| B2 | the ☰ menu's list | the same; and the ☰ menu closed and gone from the page (H11) |
| B3 | 149 → 142 | Hunter with Plan, on 149, a window open, picks 142: refused, "…then pick 142." |
| B4 | every window refuses, by its whole press | a loop over the rows of §3.2 that count and are not shaded, each opened by its own door, then each door's whole sequence: B1's assertions, **and the window is still drawn after the press**. Rows of its own: ALL AVAIL, made as P1 made it (SODB's "+ add" armed, ALL AVAIL placed, its count chip pressed); the document viewer over an Input window — the viewer closes at the press, the Input window refuses; the Tracker's marking window, as N7 decides |
| B5 | the view switch, both ways, both controls | the badge and `#drawerRole`; to the member view and back; an admin at home, an admin by Plan on 149, a master admin; with a window open and with a change not saved: the role in force unchanged, `CURPAGE` unchanged, the Leave War's role unchanged, the note's two endings `[ruled]`; **by `#drawerRole`: the ☰ menu closed and gone from the page after the refusal** (row 4) |
| B6 | a bell line to another squadron | Hunter on 149, a 142 line clicked: refused; `isUnread` still true; `BELLLIST` still true; `UNIT` 149; "…then press this line again." `[ruled]`; **the note is handed the pressed line** (`line` reaches `guardnote.ts` from inside `enterForLine`: its anchor is that line, not the foot) |
| B6b | a line of a squadron his pages may never be | Ranger (142's; View of 149 and of 150), 149 picked, a change not saved; a 150 input's line naming him: refused, `UNIT` 149, the line unread, the list open, **`INPEDIT` null, `OILASK` null, no toast but the note**. And the same line from a squadron he has since left (§15, finding 1) |
| B6c | a line of the squadron in view, in the member view | Hunter (142's, Plan of 149), 149 picked, the member view, a change not saved; a 149 input's line: refused, `UNIT` 149 |
| B7 | every family of line | an input's, a Leave War decision, bidding opened, a posting, a holiday's (as N4): B6's assertions |
| B8 | a line of his own squadron from a squadron he only views | Ranger (View of 149), 149 picked, **a change not saved**, a 142 war line: refused, 149 still in view, nothing ringed on the Leave War when its tab is next opened from 142 |
| B9 | the bell itself — an access request | H7: refused, Admin → Users not opened, `ADMINOPEN` null, **the bell still lit and the request still unseen**, the note's words `[WNS]`. And a request of his own squadron while a squadron he only views is picked, a change not saved: refused at the page door, **no "waiting for access" toast** |
| B10 | a change not saved | the saver made to fail (the stand-in the repo's own tests use for `'failed'`): each of B1, B2, B5, B6 refused with the Retry words `[WNS]`; Retry lands → a fresh press goes through; **nothing happens by itself when the save lands** — `UNIT` unchanged after the timers run |
| B11 | an opened Users row with typing | a pick by each list, the switch to the member view, a bell line: refused, the row still open with its typing `[WNS]` |
| B12 | two reasons | a window and a failed save: the window's note; the window closed, pressed again: the Retry note; never the Tracker's question |
| B13 | the refusal before the Tracker's question | a window open **and** unsaved chart edits: refused, `core.dlg` null — no question was raised |
| B14 | the Tracker's question at the switch to the member view | Hunter on 149's Tracker, an unsaved chart edit made as P5 made it — a new test event, since a moved ball saves at once (P5 N5): the question's words `[WNS]`; Stay → admin still, the edit kept; Discard → member view, the chart as stored, **no cover band, `storageHeld()` false, the Tracker on 142** after `whenUnitSettled()`; Save → saved in 149's record, then the same. And with Edit chart layout open and nothing moved: as N10 decides |
| B15 | …and back | as N5 decides: the question's words `[WNS]`, its three answers |
| B16 | no press makes a window held by a pick or by the member view | after every refused press of B1–B11 no `[data-heldro]`, no held band (test ids `inped-moveband`, `move-band`, `trk-move-band`), no `inped-rolechip` is on the page |
| B17 | a page tab never changes the squadron — **pin** | Ranger with 149 picked: the bar and the ☰ menu draw View-only Sched and Help alone |
| B18 | no road to "switch back" with a row open — **pin, once step 1 exists** | in the member view the Admin page is not drawn and `useGuardWork`'s count for the row ids is 0 |
| B19 | a window that arrives while the question stands | the Tracker's question up for a pick; the saver fails; Discard: refused with the Retry note, `UNIT` unchanged |
| B20 | a save still going | H8: a change made and a pick pressed in the same tick: the save is sent first, lands in 142's record, then the pick; made to fail → refused. **The same at the view switch, at a bell line to another squadron (the tap runs again after the save) and at a press through the page door — Ranger on 149, a bell line of his own input inside the wait: the save lands, then 142 and the window; made to fail → refused, no window** |
| B21 | sign-out and the next person | a refused pick, then Logout: the note is gone (`clearToast`), nothing open, `whatIsOpen()` null for the next sign-in |
| B22 | "Check my quals" | N3: Ranger, 149 picked, a change not saved: refused, `UNIT` 149, **the welcome-back card still there** (his `back` mark not cleared), the note's words `[WNS]` |
| B23 | an Undo's landing on his own page | no button reaches it (row 13), so the door is driven as the landing drives it — `undo-wire.ts _snapView` with a step that lands on Inputs, 149 picked, a change not saved: the page and `UNIT` unchanged, **and the landing's own `then` not run**. If Ctrl+Z proves to be a road (§14): refused **before the step** — the record and the Undo list as they were — in N3's words |
| B24 | an Undo that removes the squadron in view | N11 |
| B25 | a card of the OIL list | 142's list open on 142, nothing else: the card opens the input on Inputs, the page first. **With a change not saved, still on 142: the card opens the input all the same — nothing changes squadron there, so no door asks**. With the list standing over a squadron he only views (N4's state): the card is **not** refused by the list it sits in — not at `enterForLine`, not at the page door, not by the checker — 142 comes into view **and the window opens**; with a second window open, or a change not saved, there: refused (N3's words), `UNIT` 149, `INPEDIT` null |
| B26 | nothing opens behind a refusal at the page door | each caller that opens something after the page, pressed under a refusal (a squadron he only views picked, a change not saved): a bell line of his own input; the bell's own OIL tap; the Leave War's clash note (`openInputWindow`, driven as its button drives it); the OIL list's card in N4's state. After each: `INPEDIT` null, `OILASK` null, no toast but the note, `CURPAGE` and `UNIT` unchanged |
| B27 | the landing's question, then a refusal | Hunter (142's, Plan of 149), the member view, 149 picked, the Tracker held there over an unsaved chart edit; he taps a bell line of his own 142 input: "Save them before switching to 142?"; the saver fails while it stands; **Discard: the Retry note, `INPEDIT` null, `UNIT` 149, the page as it was**. Stay: nothing. Save or Discard with nothing wrong: 142, the Inputs page, then the window (`tracker/msq-bell-input-ask.test.tsx` stays green unchanged) |
| B28 | a caller that sets something before the page, refused | `openAdminUsers`, `openWarAt`, `openNewPeriod` and "Check my quals", each pressed or driven under a refusal: `ADMINOPEN` null; no ring asked of the Leave War and its war as it was; no new-period ask pending; the welcome-back card unspent |

**`src/ui/msq-guard-note.test.tsx`** (jsdom — which control, which words, never the geometry): the door → `NoteAt` table
row by row; `from: 'drawer'` → the foot; `toastAt` then a plain `toast` returns to the plain place, and `toastAt`'s own
`toast` does not; the reader's region carries the words; the note's look is the blocked face (`data-face="blocked"`,
the lead "Blocked:").

**`e2e/msq-guard.spec.ts`** (new; **needs a browser** — jsdom has no layout): at 1536×864, in a browser started at 125%,
at 2560, at 1366 (the bar on two lines), at 1100 (the pick inside ☰), 768×1024, 874×402 and 402×874 — the note's box
against `p1b`, `p2b`, `p4b`, `p3-p` (top, left or right edge, within 2px); **it never meets a window's ✕ at any place
it stands — under the control with the window dragged under the badge, at the foot with a desktop window dragged to the
bottom centre, at the top on a phone with Inputs settings and with the Calendar open (P3's three cases)**; it is the
front layer at every point of its box; with the "Not saved" band up the bar is a line taller and the note still clears
it; a refusal moves neither the picker nor the badge (lesson 27); the three doors reached by Tab and Enter over each
shaded window answer as by mouse; on a phone, the panel windows that leave the bar free (the Leave War's day panel at
its lower height; My leave); **N12 — Down days opened on the Tracker at 1536 wide, the window narrowed to 1000: the
panel's box has no size (measured, not read from a `hidden` mark), the picker pressed, and what N12's answer says**.
Each test builds its own state and asserts it is there before the press (the order's §8 point 4).

---

## 5. Part F — the Input window records the input's own squadron

**Part F is two things, built apart** (§15, findings 12, 13). **The doors** (§5.3) bring the input's squadron and its
page into view *before* the window opens; they close security F1 by the order of what happens, and F2 on his answer
to N2 + N8, and grey nothing. **The root** (§5.2) makes the window itself know whose input it holds, so a door nobody
has thought of cannot write across; it is built last, and only once the table of §5.5 shows that no press opens a
window that would be born greyed — because the only words a held window has today would be untrue there.

**The doors and the root never share an answer** (§16, finding 2). A clause that keeps his own input live on a page
that lists it "because it names him" (`engine/inputs.ts inputsListed`), asked by the bell's door, tells that door he
is already where the input belongs: `enterForLine` says `'here'` and security F2 stays open. So there are **two
functions**, and what he should see is put to him **once** (§8.3, N2 + N8).

### 5.1 The root

`ui/InputWindow.tsx InputEditor` notes, when a window opens, **the squadron its page shows** (`openedOn.unit = pageSqn`,
l.226–229) and is held only when the page later shows another (`held`, l.232). So an input of 142 opened while 149 is in
view by someone with rights in both is noted as "opened on 149": live, no band, and Save, Delete and the OIL answer
write 142's record under a bar saying 149; a later pick of 142 then holds it with an untrue band. The commit gate does
not stop it — he has the right in both (the security read's opening paragraph).

### 5.2 What is recorded, and what each read becomes

**`state/inputsqn.ts` (new) — two functions and one table.**

- **`inputSqn(r, pageSqn)` — the input's own squadron**, for every door and for the window's note. A new input: the
  squadron its page shows (as today: it has no other). A saved input: the page's squadron where the input touches it
  (`engine/inputs.ts inputSquadrons(r)` includes it — an input naming men of both is listed, and opened, on either),
  else `inputUnitOf(r)`. **It has no clause about who is named in the input, and never gains one:** a door asks it
  "where does this belong", and a clause there tells the door he is already where it belongs.
- **`letOpenOn(r, pageSqn, pid): string | null` — the root's alone:** the squadron a window may stand live on although
  it is not the input's own; null for every other window. Two cases, and no third:
  (i) *his pages may never be the input's squadron* (`!ownPageMayBe(inputSqn)`) and the input names him or he filed it
  — the posted man's last 142 OIL question, the line of N9. It must be live where he is **whatever he answers**: held
  from its first draw he could never answer it, and a tap on his bell goes to that question before it opens the list
  (round 1, Fable 3a). What such a window should look like is N9's;
  (ii) *the page lists the input because it names him* (`inputsListed`'s second half) — **only if he answers N2 + N8
  "where he is"**, for the doors his answer leaves so.
- **`INPUT_DOORS`** — one row for each door of §5.5 that opens a saved input: `{ id, home }` — whether that door
  brings the input's own squadron into view before the window. His answer to N2 + N8 is the `home` flag of the
  bell's, the list's and the calendar's rows; no rule is scattered through the files.

**Recorded in the window's note**, worked out **once, when the note is taken** (`setOpenedOn`) — never again on a
later draw: a note worked out afresh after his own move at midnight would read the new page and bring a held window
back live (round 1, Fable 3d): `unit` becomes `inputSqn(r, pageSqn)`, and beside it `let = letOpenOn(r, pageSqn,
me())`. `held` is then judged on every draw, from that note against the page as it stands.

| Read today | Becomes |
|---|---|
| `openedOn.unit = pageSqn` (two places) | `unit: inputSqn(r, pageSqn)`, `let: letOpenOn(r, pageSqn, me())` |
| `held = openedSqn !== pageSqn \|\| …not offered…` | `held = (openedSqn !== pageSqn && pageSqn !== kept.let) \|\| …not offered…`, `openedSqn` now the input's own — so an input of another squadron is held **from the moment it opens**, by whatever door, unless the note let it open there; and a window let open on 149 is held if the page then becomes a third squadron's, live if it becomes the input's own |
| `heldWindowBand(openedSqn)` → `store.ts heldWords` | unchanged call — **and this is why the root waits.** `heldWords` answers the pick's band, "This is 142's. You picked 149 — close this to go on.", whenever `enteredByPick()` and the squadron in view is not the window's — true if he picked anything earlier in the session, whatever opened this window — and otherwise "This change could not be saved.", over a window in which nothing was tried. Neither is true of a window he has just opened, and neither was approved for one. So no press may reach a born-greyed window: §5.5 |
| `swapOn` — a second copy of "which squadron" for the swap question | reads the note's `unit`: one field (the security read's tidiness note) |
| `pickUnit` — whose people the Person list offers | `isNew ? openedSqn : (inputUnitOf(r) ?? UNIT)` — unchanged in meaning; named so the builder does not fold it into the note (a two-squadron input's list is its first day's squadron's) |
| `heldByMemberView(openedSqn)` | unchanged call |

**What Build 2 inherits:** the note's `unit` and `let` stay; what a held window looks like changes there.

### 5.3 The doors

**Every door that brings a squadron into view runs the same three lines** — `enterForLine(inputSqn(r,
pageUnit('own')), again, door, opts)`; on `'asked'` or `'refused'`, nothing; then `openInputOnPage(iid, first, still,
opts)`, whose window the page door runs (§4.5). `inputSqn`, never `inputUnitOf` — which names the first-named man's
squadron and would carry Hunter to 149 for an input that touches his own page (round 1, Fable 3b). **Where
`enterForLine` answers `'no'`** (his pages may never be that squadron's) **the window opens where he is, as today**,
and the root lets it (`letOpenOn`, case (i)).

| Door | `home` | Its own |
|---|---|---|
| **A card of the OIL list** — `ui/OilDayList.tsx Body openInput`; today `setInpEdit(r); setPage('inputs')`, the window before its page (security F1) | **yes** — D2403 names the OIL list; it waits on no answer but N3's words for its refusal | door `'card'`, `opts = { skip: ['oilday'] }` — the same `opts` to `enterForLine` and to `openInputOnPage`, or the page door and the landing would count the list the card sits in. The card sets nothing before the page, so it asks nothing first. After Build 1 a pick is refused while the list is open, so the list is another squadron's only by a change he did not make or in N4's state |
| **A bell line of an input** — `openNotice` | as today: the line's own squadron is entered first (`n.u`, D2325) | §4.5 |
| **The bell's own OIL tap** — `ui/topstate.ts bellTap`, the `oilHit` branch | **N2 + N8** | door `'bell'`; `again` is `() => bellTap(from)`. With `home` off it is today's line and the page door alone |
| **A row of the Inputs list and its "OIL" / "OIL?" button; a card of the Inputs calendar's day; the calendar's own reveal** — `ui/InputsPage.tsx openInput`, `reviseOil`; `ui/InputsCal.tsx` l.950, l.511 | **N2 + N8** | door `'card'`; with `home` off each is today's line — these doors change no page. The button raises a question, not a window: only a door can cover it, the root cannot (§5.5) |
| **A holiday's bell line, a squadron he only views picked — N4** | his answer | recommended: his own squadron comes into view first (the entry `landOnOwnPage` makes, the Tracker's question with it), then the list — so the list never stands under another squadron's number. Until he answers the line is as today and nothing refuses it |

### 5.4 The reader's two leads, and the documents

- **The Leave War's clash note** (`leavewar/ui/Chrome.tsx goClash` → `leavewar/sync.ts openInputWindow`: `setPage`, then
  `setInpEdit`). It could be pressed under 149 only while a war window held 142's war across a pick — a state no press
  reaches after Build 1, though a change he did not make still does. Its window is now the page door's `then`
  (§4.5): refused, nothing opens (B26); the root holds the window if another road is ever found. Also a row of the
  walk's roll-call (F6, an argument and not a test, stays withdrawn; B4 holds that every Leave War window refuses a
  pick).
- **The Inputs calendar's just-saved row** (`ui/InputsCal.tsx renderPop`: `saved`, `revealed` — the row it puts at the
  head of the opened day's list, found by `savedId` in all of `INPUTS`). Whether it outlives a pick and shows a 142 card
  in 149's day cannot happen with the day's window open (a pick is refused); with the window closed and opened again on
  149 it can be asked. F7 is written to answer it: save an input, close the day, pick 149, open the same date. **If it
  fails, the fix is `savedId` cleared where the calendar's squadron changes — one line; if it passes, F7 stays as the
  pin and nothing is changed.** Not verified by reading alone (§14).
- **A document chosen late** — the one write that does not stop on `held`. `InputWindow.tsx DocField`'s file box calls `state/docs.ts docAdd(f)` for each file chosen and then hands the
  ids to the draft; neither asks whether the window is still live. A person who opens the file chooser, and whose
  window is held before he comes back with a file — his move at midnight, a right ended — stores the file and changes
  the held window's list. No squadron's record is written by it (both Astra and Fable read it so: the file is kept
  apart, and Save still stops on `held`), but a file is stored that nothing will ever name. **The change:** `DocField`
  takes `locked` (the window's `held`) and its `onChange` returns before `docAdd` when it is set; the file box is
  cleared as today. F11.

### 5.5 The doors into the Input window — the list the root waits for

Found tonight by a search for `setInpEdit(` in the non-test files (twenty-two places; the four inside `InputWindow.tsx`
and one in `inputedit.tsx` re-seat the window already open and are not doors). **Before step 8 of §10 the builder completes the last column for
every row, from the code and then by a press; any row where the answer is "yes" is a question for him before the root
is built — never a greyed window by default.** What could be read tonight:

| Door | File | Opens | Can the page's squadron and the input's own differ? |
|---|---|---|---|
| A row of the Inputs list | `ui/InputsPage.tsx` `openInput` | a saved input | **Yes — N2 + N8**: the list is `inputsListed`, which adds every input naming him (pressed, P5 N2: it opens live under 149 today). **The same row's "OIL" / "OIL?" button — drawn for an input of one person its reader may change, so for his own — raises the OIL question with no window at all** (`reviseOil`, §3.2 (e)) and writes the answer from there: security F2's own write by a third road (from the code; not pressed). The root cannot hold what is not an Input window, so under "its own squadron first" that button takes the row's door too |
| A card of the calendar's day; the calendar's own reveal | `ui/InputsCal.tsx` l.950, l.511 | a saved input | **Yes — N2 + N8** (`calRows`, the same list) |
| A card of a SANS day | `ui/SansDay.tsx` `open` | a saved input | not traced |
| A bell line | `ui/topstate.ts openInputOnPage` | a saved input | **Yes, where `enterForLine` answered `'no'`** — a line about an input he filed for a squadron he has since lost his right in: N9 |
| The bell's own OIL tap | the same | a saved input | **Yes** — for a Plan holder or master admin, N2 + N8; **on `'no'`**, the posted man of §5.2: live where he is whatever is answered, its look N9's |
| A card of the OIL list | `ui/OilDayList.tsx` | a saved input | only where the list is not his pages' squadron's — N4's state, or after a change he did not make |
| The OIL question raised after a save on the schedule | `ui/inputedit.tsx` l.1864 (l.1626, `giveBackCuts`, only re-seats the window already open — not a door) | a saved input | not traced — it is the input just saved, on the squadron in view's schedule |
| A chip or puck on the week or the board | `ui/interactions.ts` l.1389 | a saved input | not traced — the week lists the squadron in view's people, so the input should touch it |
| "Edit input" in the document viewer | `ui/DocViewer.tsx` `edit` | a saved input | as the list the viewer was opened from |
| The Leave War's clash note | `leavewar/sync.ts openInputWindow` (l.4641) | a saved input | only with the war held after a change he did not make (§5.4) — never by a press of his after Build 1 |
| The OIL question of what was just filed from the Leave War | `leavewar/sync.ts askFiledOil` (l.883; for several inputs it opens the OIL list instead, l.880) | a saved input | not traced — filed a moment before, in the war's own squadron |
| New input: the Inputs page, the calendar, the week, Medical, a SANS day, an upchit from the viewer | `InputsPage.tsx openNew`, `InputsCal.tsx` l.502, `interactions.ts` l.1359, `MedicalView.tsx` l.221, `ui/sansadd.ts`, `DocViewer.tsx` l.139 | a new input | no — a new input's squadron is its page's |

### 5.6 Part F's tests — `src/ui/msq-guard-input-sqn.test.tsx`, in the order written

| # | Name | Asserts | Fails first? |
|---|---|---|---|
| F0 | the input's own squadron has no clause for who is named | `inputSqn`: Hunter's own 142 input, the page 149 → 142; an input naming men of both, the page 149 → 149; a new input → its page's. `letOpenOn`: null for all three unless N2 + N8 is answered "where he is" (then 149 for the first); for the posted man's 142 input on his own page → that page's, whatever is answered | yes |
| F1 | the bell's OIL tap brings the input's squadron into view (N2 + N8, where the bell's door is `home`) | Hunter (Plan of 149), 149 picked, his own 142 weekend duty unanswered, the bell tapped: `UNIT` is 142, the window is 142's, live; its Save writes 142's record under a bar saying 142 | yes — today live under 149 |
| F1b | …and still does with the root built, whatever the list's own answer | F1 again with `letOpenOn`'s case (ii) switched on — the pair "the bell first, the list where he is": `UNIT` 142. **Kept green through step 8** | yes, at step 7; a pin from step 8 |
| F2 | …and is refused with a window open | the same with a window open on 149: refused (H7's words `[WNS]`), no window, no OIL question, no toast but the note | yes |
| F2b | …and where his pages may never be the input's squadron | Ranger (View of 149 and 150), 149 picked, a change not saved, his own OIL question on an input of 150: refused at the page door, `UNIT` 149, **`INPEDIT` null, `OILASK` null, no "Weekend/PH work" toast**. Built with the page door, at step 5 | yes |
| F3 | …and waits for the Tracker's question | unsaved chart edits on 149: the question first; Stay → nothing opens; Discard → F1. A man other than the one who pressed, or the question answered by someone else meanwhile: nothing (the existing `tracker/msq-bell-recheck-after-ask.test.tsx` stays green unchanged) | yes |
| F4 | the root, by a door no press reaches | the test opens a 142 input under 149 by `setInpEdit` directly (said in its name: "a belt — no press reaches this"): held at once; Save, Delete, Take me out, the OIL answer and Enter in a field write nothing. **A real pick of 142 from there is refused** — the window is open (the ruled note). **The raw entry `enterSquadron('142', false, true)`, named so in the test, gives it back live** — a raw entry with a window open, so the test is on the checker's allow-list by name | yes |
| F5 | the OIL list's card | as B25, from the window's side: `INPEDIT` is set only after the page is Inputs; with `enterForLine` made to answer `'refused'`: nothing opens, `INPEDIT` null; with the landing's question up (N4's state, the member view, unsaved chart edits): nothing opens until it is answered | yes |
| F7 | the just-saved row | as §5.4 | unknown — it is written to find out |
| F8 | an input naming men of both squadrons — **pin** | opened on 142's page and on 149's: live on both (it touches both) | no — it passes today |
| F9 | his own input on another squadron's page | as N2 + N8 decides. "Where he is": the row's tap opens it live under 149, the note's `let` 149; then the page become a third squadron's by a change he did not make: held. "Its own squadron first": the row's tap, the calendar's card and the row's "OIL?" button each bring 142 into view, then the window or the question; with a window open or a change not saved: refused (N3's words), nothing opens | — |
| F10 | the swap question's squadron | the existing `ui/msq-pick-swap-question.test.tsx` re-pointed (§10); the question and the note read one field | — |
| F11 | a document chosen late | a file box's change fired on a window held by the midnight clock: `docAdd` not called, the draft's list unchanged, nothing new in the document store or the durable drawer; on a live window: as today | yes |
| F12 | the note is taken once | his own input open across his move at midnight, with `letOpenOn`'s case (ii) switched on: still held after a redraw, an Undo and a Redo — `let` was worked out when the window opened, on 142, and is null (§15, finding 13) | pin, once step 8 exists |

(F6 is withdrawn as a test — §5.4.)

---

## 6. The twin paths

Every behaviour's twins, each with a test of its own (a number in §3.5, §4.7, §5.6, §7; "e2e" = `msq-guard.spec.ts`).

| Twins | Tests |
|---|---|
| The bar's Schedules list · the ☰ menu's list | B1 · B2; B10 and B11 loop over both; P1 both |
| The badge · the ☰ menu's button · the Input window's own chip | B5 loops over the first two (the menu gone after a refusal); B16 the chip's absence |
| To the member view · back to the admin view | B5, B14 · B15, B10 both endings |
| A bell line · a tap on the bell itself (access request; his own OIL question) | B6, B7 · B9, F1, F2 |
| The top bar's bell · the Scheduler Board's bell | B6 run from `#notifyBell` and from `#sbBell` |
| A line that enters another squadron · a line that brings his own back · a line of a squadron his pages may never be · a line that changes nothing | B6 · B8 · B6b, B6c · P16 |
| A press that brings his own squadron back: a bell line · the bell itself · "Check my quals" · an OIL list's card · Undo | B8 · B9, F2b · B22 · B25 · B23 |
| A caller that sets something before the page · one that opens something after it | B28 · B26 |
| Refused at once · refused after the landing's own question · let through | B26 · B27 · B27's last clause |
| A door's own window left out · a second window beside it | B25, F5 · B25's last clause, A4 |
| The input's own squadron asked by a door · by the window's note | F0, F1, F1b · F4, F9, F12 |
| A window in sight · behind a tab · behind a tab no longer offered · behind the Tracker's own Flow chart tab | B1 · A7 · A7 · A13, e2e |
| A two-press door (a list's button, then its row) · a one-press door (the badge) | every B test presses the whole sequence; B4 asserts the window is still drawn after each |
| Mouse · touch · keys | the unit tests click (a keyboard click is the same event); e2e: Tab and Enter over each shaded window, a touch tap in WebKit on the phone sizes |
| Desktop · phone · the sizes between | e2e at the eight sizes of §4.7 |
| An admin at home · an admin by Plan · a master admin · a member with View | A1; B5 the first three; B6b, B8 and B17 the member with View (he has no view switch: asserted) |
| 142 → 149 · 149 → 142 | B1 · B3; F1 is 149 → 142 by the bell |
| A window that counts · one that does not | B4 · P4, P10, P12, P13 |
| A flag set with its window drawn · the same flag with nothing drawn | A2 · A10, A11 |
| A window open · a row with typing · a change not saved · two at once | B1 · B11 · B10 · B12 |
| Nothing unsaved on the Tracker · unsaved chart edits · the editor open with nothing moved | P1, P11 · B13, B14 · B14's last line (N10) |
| The window's own way out, each one | A2 (the guard's answer after each) |

---

## 7. What must stay as today — pinned before the changed half

New file **`src/ui/msq-guard-asis.test.tsx`**, written and seen **green on today's code first**, then never edited by
the build — **with one exception, said here so no pin is bent quietly**: P4, P10, P12 and P13 pin what
today does with things H2 may rule to be windows. Where his answer makes one count, that pin is replaced, by name, in
the step that builds the row, by the B4 row that proves the refusal; the report lists each. Where an existing file
already pins the behaviour it is named instead and must stay green unchanged. Each pin states what today's app does
**as pressed**, where a presser pressed it.

| # | As today | Pinned by |
|---|---|---|
| P1 | A pick with nothing open goes through at once, nothing asked, nothing said — both lists; from the ☰ menu the menu stays open (pressed, P3 2) | new |
| P2 | The squadron already in view picked: nothing happens, no note; the list closes | new (`pick.ts` `u === UNIT`) |
| P3 | The Tracker's question at a pick: its words, Stay / Discard them / Save them, a squadron he only views picked, the ☰ menu closing first | `tracker/msq-trk-pick-ask.test.tsx` (20 tests), `tracker/msq-trk-ask-keys.test.tsx` — unchanged |
| P4 | Menus and lists close as today and refuse nothing: the bell's list, the Schedule Insights menu, a board's small menu, a date box's calendar, the Medical page's "as of" calendar, the Leave War's Legend | new — each open, a pick goes through, the list is gone |
| P5 | A change he did not make: his own move at midnight with an Input window, a Leave War window, the chart editor open — the held window, its band and its Close; a right ended under a window | `ui/msq-fix-sched-windows-midnight.test.tsx`, `state/typing-hold.test.tsx`, `state/typing-hold-grid.test.tsx`, `state/reshape-r6-reenter.test.tsx`, `leavewar/ui/msq-fix2-r2-held-figure.test.tsx`, `state/msq-fix2-tracker-moved-master.test.tsx` — unchanged. (That the guard is not asked on that road is A14, written at step 1: `refusalAt` does not exist today, so it cannot be a pin) |
| P6 | "Not kept" blocks nothing | new — the three doors go through with the band up |
| P7 | Sign-out is never refused: with a window open, with a change not saved, with both — the session ends as today | new, beside the existing logout tests |
| P8 | A bell line of the squadron his pages are on, an Input window open with typing: the window's own "Open Hunter’s input and lose them?" | new (the press report's bell case; pressed again, P2 3) |
| P9 | A line about his own account opens nothing and is read | `ui/msq-bell-tap.test.ts` — unchanged |
| P10 | Traffic, Day details, Jump to a date and the document viewer close at a press on the bar, and the press does its own work in the same press — **the pick, the badge and the bell each** (the badge and the bell are one-press doors) | new (H2; pressed, P1 1) |
| P11 | An admin at home, nothing open, no chart edits: the badge switches him at once, both ways | `ui/memberview.test.tsx` — unchanged |
| P12 | Modes are not windows, **as each behaves today** (pressed, P1 5): an armed slot — the pick goes through and the arming is dropped; OIL Earn — on the board, no door reachable; **Logic's edit mode and Edit quals — the pick goes through and the mode is still on, on 149's page, the change already typed saved in 142's record**. An armed "Discard N edits & load" was not pressed (the demo has no issued day): its pin records whatever the test finds today — `view.setPage` clears it on a page change, and a pick changes none — and the report says which | new |
| P13 | The Scheduler Board alone: a bell line to another squadron goes through and the board closes (pressed, P1 3) | `ui/msq-board-sqn.test.tsx` + new |
| P14 | A save made just before a pick lands in its own squadron's record | new (press report D) |
| P15 | A window on his own squadron's page is never held when nothing moved | the controls already in `ui/msq-pick-windows.test.tsx` |
| P16 | **A bell line that changes neither the squadron nor the page is never refused**, a window open or a change not saved — **each a line of the squadron his pages are on, or of one they may never be** (`enterForLine` answers `'here'` or `'no'`): an input since deleted — read, "That input is gone"; a posting of a man with no row left — read; his own account's line — read; a holiday's line — the OIL list opens (until N4). The same lines of a squadron he can enter do enter it today and are B7's, not a pin | new |
| P17 | The Tracker's sign-out clean-up is untouched: after `endTrackerSession()` every window state is clear and every waiting question answered "cancelled" | `tracker/tracker.test.tsx` — unchanged; the Tracker smoke |

---

## 8. The open questions, as switch points

**None is built on the recommendation.** Each row says what it blocks; the step of §10 that needs it does not start
until he has answered. Where a recommended answer was shown by the red team or by the pressers to be unsafe, or not
buildable as written, the row says so in bold.

**The plan's codes against the questions page's.** The page he answers
(`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/page.html`) numbers its questions its own way:

| This plan | The page | | This plan | The page |
|---|---|---|---|---|
| H2 | A1–A4 | | N5 | A20 |
| H3 | A5, A6 | | H1 | B1 |
| H7 | A8 | | H6 | B2 |
| H8 | A9 | | H4 | B4 |
| H11 | A14–A16 | | H5 | B5 |
| the §3 calls | A10–A13 | | H9 | B6–B8 (N11 is B7) |
| N1 | A7 | | H10 | B9–B11 |
| N2 | A17 | | H12, H13 | B12 |
| N3 | A18 | | N6 | told, not asked |
| N4 | A19 | | N7–N10, N12 | **not on the page yet** |

**Three things the page owes after round 2**, for the host — none is this plan's to change:
- **A17 is half of a question.** It puts N2 alone; N2 and N8 are now one question (§8.3), and N8 is not on the page.
  An answer to A17 by itself is not folded in as N2's: the page's next round puts the one question, with its three
  answers and what each costs.
- **N6 is "told, not asked" on the page, and round 2 found it is a question** — the told answer takes away the one way
  he has today to get a held window back with his words (§8.3). It joins the next round.
- **N7–N10 and N12** are to be pressed, pictured and put to him as that round.

### 8.1 What Build 1 waits on (the brief's list)

| Q | Recommended | If he answers the other way | How the code is shaped for it | Blocks |
|---|---|---|---|---|
| **H2** what counts as a window | as §3.2's `counts` column: the four bar-free windows keep closing (pressed, P1 1: they close without a word and the press goes through); ALL AVAIL and Changes (folded too — a phone only) refuse, where today both close without a word (P1 2, 6); the board alone does not, its two dialogs do; a clean chart editor does not, Show All does; the Legends do not. **Pressed and not in the first draft:** Logic's edit mode and Edit quals carry onto 149's page with "Done" drawn (P1 5) — whether such a mode counts or is closed is part of this question | each is one row's `counts`. "The four refuse too": those four rows, **and** `ui/barfree.ts BAR_KEEPS` gains the three doors' controls so the window is still there when the door asks; P10 is replaced by a B4 row each. "ALL AVAIL / Changes do not": two rows, and only two — no movable-window row answers for them (§3.2 (a); A3); they then close at the pick as today (P4 gains them) | the table | **step 1 — the whole table** |
| **H3** how far the Users row reaches | any change in the row (the Role box and the squadron lines as well as the sign-in name); the six other forms once anything in them differs; the row counted while the Admin page is up even with another section showing, the note then reading "…the open row on Users…" `[WNS]`. Pressed (P2 1): today a pick asks nothing of any of them, "Add a person" carries its typing to 149 with its Home squadron changed, and a row survives a look at the Squadrons section. **Each of the six forms needs words of its own (words3 W2, drafts), and Add a person has no Cancel to name** — a Cancel there is a new control, drawn for him first (D1625) | "typed words only": the `on` test of `useGuardWork` in `PersonEditor` narrows to `name`; the other six reports are not added (A6, B11 lose those cases). "Only while Users is the section showing": the report is `on && p.shown` | seven `useGuardWork` calls, one line each | the (h) rows of step 1; B11 |
| **H7** a refused tap on the bell itself | "…then press the bell again." `[WNS]` (words3 W1: shipped as drafted), under the bell; the bell stays lit and the request unseen | "the same words as a line": the `bell` row of `guardWords` points at the `line` row. "Do not refuse; open the bell's list instead": `enterForLine`'s `door: 'bell'` branch returns `'no'` and `bellTap` falls through to `setBellList` — B9, F2 rewritten | one row of the words table; the door's id | the bell's own taps in steps 5 and 7 |
| **H8** a save still going | the door waits: where `saveSettling()` and not `saveRefused()`, `await flushSaves()`, then the door starts again from §4.2 step 1 (so a save that failed is refused by the unsaved row). Pressed (P2 6): today a pick pressed inside the app's own wait of about 0.3 s goes through, the save then fails under 149's number, and Retry there saves 142's input. **Its cost:** while it waits nothing on screen says so; on a slow store the press lands seconds later, perhaps while he is typing in a box that is no window (H13); and the bell's door and the page door answer at once, so their wait is the whole tap run again. Recommended with it: a waiting press is dropped if he presses anything else meanwhile | "it goes, as today": the step is not built; B20 becomes P14's twin ("the save lands in its own record after the pick"); a failure a moment later shows 142's band on 149, which he was told | one function, `settleFirst(again)`, at step 3 of every door. `pickSquadron` and `switchRoleView` wait and go on; `enterForLine` and `ownPageRefused` answer "stop" (`'asked'`) and run the caller's `again`; **the page door answers `'asked'` and runs itself again with the `then` it was handed** — it can wait because it owns what follows | `settleFirst` in steps 3, 4 and 5; B20 |
| **H11** where the note stands; the ☰ menu after a refused pick; D731 (1) against D2590 | the foot at 820 wide or less and whenever the door was inside ☰; the ☰ menu closes (today it stays open after a pick: P3 2). **The first draft's third part — "on a phone with a shell window up the note goes to the top, as every note does" — cannot be recommended as it stood:** pressed (P3 1), the top lies over the Input window's ✕ (64% of it, against D2590's "never the window's ✕") and, with Inputs settings or the Calendar open, over the squadron picker the note itself names; and on a phone on its side the foot lies over the Input window's Delete. The plan now tries each place against every window's ✕ (§4.6); whether the note may cover a window's other buttons, or the control it names, is his | each is one line: `noteAtFoot(from)`; the `pickRefused(u)` clause in `DrawerSquadron pick`; the order of places in `placeToast`. The e2e sizes do not change, only their expected place | §4.6 | step 2; the Drawer's line in step 3 |
| **§3** which reason first | the window, then the row, then Retry; a row and a form at once: no order exists yet (words3) | `GUARD_ORDER` reordered; B12's expectation | one array | step 1 |
| **§3** a refused line left unread, its list open | yes | "read": `markNoticeRead(n.id)` before the return in `openNotice`; "list closed": `setBellList(false)` there — and the note then hangs under the bell | two lines; B6 | step 5 |
| **§3** the row's press refused, not the list's opening | the list opens, the row is refused | "the list does not open": the check moves to the two buttons' toggles (`SquadronMenu toggle`, `DrawerSquadron`), and the note cannot name a squadron — new words, his | the door's id `pick` → `pickOpen` | step 3 |
| **§3** the adjusted words — words-read R3, N3a, N3b, N4; words3 W1–W4 | as the two words reads ship them — all drafts until he has seen them | each is a string in `guardWords`; the tests read the table's own constants, so no test changes | §4.6's table | the door each belongs to |

### 8.2 The other H questions

H1, H4, H5, H6 (Logout — Build 2), H9 (Undo — Build 3), H10 (the refresh card — Build 2) touch no line of Build 1. H12 (a
drag in progress) and H13 (typing in no window; a phone's caret) are **not built here**: a drag is put back by nothing
new, and those boxes are `'no'` rows. Said so he does not expect them from this build. (Pressed, for his answer when he
gives it — P4 3: a desktop drag survives a pick by the keys, its picture left at the top left until the mouse is let go;
P4 4: a day's note and a Balances figure are saved into 142's record at the pick.)

### 8.3 Twelve in neither list — to go on the questions page

N1–N6 are the first draft's, each pressed since by the fifth presser (P5); N7–N11 were raised by the red team's first
round and by tonight's pressing; **N12 by its second round, which also made N2 and N8 one question and N6 a question
that blocks.** N12, and road (3) of N2 + N8, have been pressed by no one.

| N | The case — who presses what | Today | Recommended | Blocks |
|---|---|---|---|---|
| **N1** | **A window he cannot see.** (a) Saber opens My leave on the Leave War, presses the Inputs tab (the window is still open, out of sight), picks 149. (b) Hunter, 149 picked by Plan, does the same; then his Plan ends at midnight and he holds only a View of 149 — the Leave War tab is no longer drawn; he picks 142 | (a) pressed (P5 N1): the pick goes through with nothing said; the window waits behind the tab — greyed, with the pick's band and Close, when he opens the Leave War under 149; live again on 142. (b) not pressed: from the code, the pick goes through | (a) refused, the note saying where: "…close the open window on the Leave War…" `[WNS]`. **(b) The same answer is unsafe: every door is refused and nothing on screen can close the window — only Logout or a reload, which lose what is typed in it (Astra, Opus).** Recommended for (b): the window does not count; the pick goes through as today, until Build 2's card replaces that state | the Leave War's, the day panel's and the Tracker's rows — step 1 |
| **N2 + N8** | **One question, three roads to one input — his own 142 input while 149 is picked: does it open where he is, under 149, or does 142 come into view first?** Hunter (142's, Plan of 149) has 149 picked. Last Saturday's 142 duty of his own has its OIL question unanswered. (1) He taps the bell. (2) On 149's Inputs list he taps that input's row (or its card on the calendar). (3) He taps the row's "OIL?" button | (2) Pressed (P5 N2): the list and the calendar show all four of his own 142 inputs; the one tapped opens live, the bar still reading 149, no band; Save changes his 142 input from there, and Delete removes it with no question. (1) From the code: the same window, live under 149, its answer written to 142's record (security F2) — not pressed for a Plan holder; for Ranger, who only views 149, the bar goes to 142 first, then his window and the question (pressed, P2 4). (3) From the code, not pressed: the OIL question alone, no window, its Save writing the answer under a bar reading 149 | **Three answers. Each is the `home` flag of three rows of one table (§5.2), so none is harder to build than another.** **(a) Its own squadron first, on every road** — the bell, the row, the calendar's card and the "OIL?" button each bring 142 into view, then the window or the question: what a bell line does (D2325) and what a View holder gets today. *Its cost:* a tap on a row of 149's list changes the bar to 142; it can raise the Tracker's question; it is refused while a window is open or a change is not saved (words: N3's). It fixes security F2 on every road. **(b) Where he is, on every road** — today's app at all three. *Its cost:* the build does not fix F2; `[MSQ-NIGHT-153-OPEN]` closes it by his word — his own inputs are filed in his primary and listed here on purpose (D2197) — and the bar goes on reading 149 while he changes a 142 record. **(c) The bell first, the list where he is** — round 1's two recommendations, taken as a pair. *Its cost:* two roads to one input behave differently, and the very change F2 names stays possible from 149's list, its calendar and the "OIL?" button; only the bell stops taking him there. **Recommended: (a)** — one rule on every road, and the only answer under which "a 142 input is never changed under a bar reading 149" has no exception (D754: the same everywhere). **(reading)** — it changes round 1's recommendation for N2, which is what the page's A17 shows him. **Why they are one question:** round 1 recommended (c) piece by piece, and built through one function it left F2 open at the bell as well (Astra and Fable, round 2 — §5); the two functions of §5.2 mend the build, not (c)'s own cost. **Whatever he answers,** a man whose pages may never be the input's squadron — posted 142 → 149, his last 142 duty unanswered — gets it live where he is, or he could never answer it; how that window looks is N9. (Opus offered a fourth, for the bell alone: where the input is another squadron's the tap opens the bell's list, not the window. Not designed here) | §5.3's doors for the bell, the list and the calendar — step 7; the root's case (ii) — step 8; F1, F1b, F9; **§1's third condition** |
| **N3** | **A press that is not a bell line bringing his own squadron back.** Ranger views 149; a save has failed; he presses "Check my quals" on the welcome-back card — or Undo, whose step lands on Inputs — or a card of the OIL list | Pressed (P5 N3): "Check my quals" takes him from 149 back to 142 and opens Quals without a word, the card gone; with "Not saved" up, the band and its Retry follow him. **Undo could not be pressed: no Undo is drawn on 149's View-only Sched.** The OIL list's card: from the code | Refused like a bell line: "Blocked: press Retry to save your changes, then press Check my quals again." `[WNS]` (words3 W4); the welcome-back card stays; an Undo, should a road to one be found, is refused before its step | rows 10, 12, 13 of §4.1 — **step 5; the words of a refused OIL-list card, and under N2 + N8's (a) of a refused list row — step 7; and, with N11, the claim that Build 1 can be merged alone (§1)** |
| **N4** | **A holiday's bell line while he views another squadron.** Hunter (142's admin, View of 149), 149 picked, taps "National Day is now a public holiday" | Pressed (P5 N4): 142's OIL list opens over 149's View-only Sched, the bar still reading 149, nothing said; "Yes · FO" and Save write 142's input from there | 142 comes into view first, then the list (D2325's own rule for a bell tap). **The other answer keeps security F1's fault on this road** — the list's Save writes 142's records under 149's number. | §5.3 door 3 — step 7 |
| **N5** | **The Tracker's question at the view switch on his own squadron, where nothing would be lost.** Saber on 142 adds a test event to the chart — "✓ Save changes" shows — and presses his badge. (A moved ball is saved at once and is never an unsaved edit: pressed, P5 N5) | Pressed (P5 N5): nothing asked either way; the event still on the chart; "✓ Save changes" still drawn in the member view and, pressed there, saving 142's chart. The drawing `p5` shows the question in exactly this case; and the "switching back" wording can only ever be asked this way | Asked always, both ways, as drawn — one rule; its cost is a Discard that throws away edits the switch would not have touched. **Both wordings are drafts** `[WNS]` — "…switching to the member view?" is on a drawing no ruling names; "…switching back to the admin view?" was read by a fresh Fable only | B14, B15; the one predicate `viewSwitchAsks()` — step 4 |
| **N6** | **A window held since midnight, then his own pick.** Saber, a master admin moved from 142 to 149 at 00:00, has an Input window with words typed, held by the move ("This change could not be saved." and Close); he picks 142. (Hunter, with no right elsewhere after his move, has no picker at all, so the case cannot arise for him: pressed, P5 N6) | Pressed (P5 N6): the pick goes through, nothing asked, and **the window comes back live on 142, his words there to edit**; 149 picked again greys it with the pick's band. On a phone ☰ lies under the window's title strip and the pick cannot be reached | Refused with the ruled words — the held window has its Close. **(reading)** of D2403's "a window is open". **Its cost, as pressed:** today that pick is the one way he gets the held window back with his words; refused, the only way on is its Close, which drops them unasked (D2403's own row). **The other answer:** a window already held does not count — the pick goes through and gives it back, as today, until Build 2's card. Where the held window's page can no longer be reached, N1 (b) | **Steps 1 and 3** — the revised plan said "nothing in the code" and so built the recommended answer by default, the table counting a held window like any other. **Shaped for either answer:** a row may carry `held?: () => boolean` — the Leave War's rows read `state/typing-hold.ts warBand()` (the band a held war window wears); the Input window publishes its own `held` through a plain module beside it, set where it works it out — and the other answer is `open() && !held()` on those rows, one line each |
| **N7** | **The Tracker's marking window, and an event's details in ⓘ mode.** Saber on 142's Tracker presses a ball — the marking window opens. He presses the Schedules button, then 149 | The press on the Schedules button closes the marking window — any press outside it does — and the pick goes through; the details bubble goes the same way (pressed, P1 4). Neither has a box to type in | It does not count: it closes itself at a press outside, as Traffic and Day details do, and holds nothing typed. **The first draft's "window" cannot be built as written (Astra):** the window is gone before the list's row is pressed, and a press on the badge would be refused and then close, in the same press, the window its note says to close. The other answer needs the Tracker's outside-press rule changed to spare the picker, its list, the badge, ☰ and the bell — new behaviour on the Tracker's page | the `pop` and `infoId` rows — step 1; B4's Tracker row |
| **N8** | **The bell's own tap for an OIL question on another squadron's input** — now road (1) of **N2 + N8**, above: it cannot be answered apart from the list's road | — | — | as N2 + N8. **Security F2 stays open until that is answered** |
| **N9** | **An Input window that would open already greyed.** Hunter filed an input for two 149 men while he held Plan of 149; the Plan has ended; a bell line about that input is still in his bell. On 142 he presses it | It opens on his own Inputs page, judged by the rights he still has in it (from the code — `openNotice`'s own comment; not pressed) | As today on this road — the root is not applied to a window a press has just opened — until Build 2 redraws held windows and words for one can be drawn for him once. **With the root as the first draft built it** the window opens greyed under words that are untrue: "This is 149's. You picked 142 — close this to go on." if he has picked anything since signing in, else "This change could not be saved." (Opus, Fable). The other answer: it opens read-only, with new words drawn for him first (D1625) | step 8 (the root), with N2 + N8 and the list of §5.5 |
| **N10** | **A clean chart editor at the view switch.** Hunter (Plan of 149) on 149's Tracker opens Edit chart layout, moves nothing, presses his badge | From the code as the first draft read it: the member view comes up and the Tracker waits on 149 under its cover. Pressed only on his own squadron (P1 4): the toolbar stays open in the member view | The editor closes and the Tracker goes to his own squadron's, as a pick closes it today without a word (P1 4) — D2403: nothing left held behind a switch he made | §4.4 step 5; B14's last line — step 4 |
| **N11** | **Undo that removes the squadron in view.** Saber adds squadron 150, picks 150, opens the Calendar there (or a save fails), presses Undo | "Undid: adding a squadron"; 150 is gone, the bar back on 142, the page on Admin; nothing asked (pressed with nothing open, P4 1c) | Refused like a pick while a window is open or a change not saved. No words exist — to be drafted and read by a fresh Fable (D2441) `[WNS]`. Or left to Build 3, which splits Undo by squadron (D2593) — then Build 1 is not merged alone | row 21 of §4.1, B24 — **step 6b, a step of its own**, so the checker does not wait for it (Fable, round 2); the place it is built in is found (§4.1, row 21); with N3, the claim of §1 |
| **N12** | **A Tracker window hidden behind the Flow chart tab.** Saber, on 142's Tracker at a desktop's width, opens Down days in the Info panel. He narrows the browser to half his screen (or turns a tablet upright): at 1050 wide or less the Tracker shows one half at a time, and it is showing the Flow chart — the Info panel is hidden, and Down days with it. He presses Schedules, then 149 | From the code, not pressed: the pick goes through and the Tracker's own clean-up closes the window, nothing said. Before the pick, nothing on screen shows that it is open | Refused, the note saying where — "Blocked: close the open window on the Tracker’s Info tab, then pick 149." `[WNS]` (the reviser's draft; read by no one) — as N1 (a): one press on the Info tab shows him the window, so nothing traps him. The other answer: it does not count, and the pick closes it as today. **Not to be built either way: counting it under the plain note, or under "…on the Tracker"** — he is on the Tracker and sees no window (Astra, round 2) | the four Info-panel rows (`downLog`, `failLog`, `lullPick`, `lullCopy`) — step 1; A13; the browser test at a narrow width |

---

## 9. The overlap with other open work

Read with `git diff origin/main...origin/<branch> -- <file>` on the remote refs as they stood (no fetch was run; §14).

| Other work | What it changes that this build touches | What the builder does |
|---|---|---|
| **Pull request 840**, the speed readout (`claude/app-speed-readout-161`) | `ui/FloatWindow.tsx` — two new props, `bystander` and `quietOpen`; a bystander never calls `forward(id)`. `ui/boardescape.ts` — `.floatwin:not([data-bystander])`. `ui/topbits.tsx` — the bell list's Escape marks the key used. `state/view.ts setPage` — a timing mark. A new window, the `?timing` readout (`ui/TimingReadout.tsx`, drawn in a root of its own from `main.tsx`) | **The guard must not count the readout**: it is up all session by itself, for the developer, so counting it would refuse every pick. Reading `winorder.ts UP` (never the page's `.floatwin`) already leaves it out, because a bystander never joins the order. R2's scan must read `bystander` and skip it; one test, written when 840 is in: "the readout up, a pick goes through". Build 1 does not edit `FloatWindow.tsx`'s body (only `winorder.ts` gains a read-only export), so no clash of lines is expected. The page door is a new function in `store.ts` round `view.setPage`, whose body — where 840 puts its timing mark — it does not edit. `toast.ts` is not touched by 840 |
| **Pull request 825** (`claude/allavail-sans-postout-141`) and **the readings-lapse branch** (`claude/readings-lapse-fix-fdbb3c`, built on it) | `ui/topstate.ts openNotice` gains a branch for a SANS-days line that sets the Inputs page's SANS tab and `setPage('inputs')`; `state/view.ts` gains `SANSDAYASK` (an ask, not a window); `ui/toast.ts toastBatch` gains receipts; `ui/topbits.tsx BellList` draws the lines differently; `ui/InputWindow.tsx` one line (`peopleFor`); `state/notices.ts`, `state/perms.ts`, the notifications register | The new branch opens the Inputs page, so `lineOpens` (§4.5) gains its page and it is asked at the page door with the rest — **B7 gains that family when 825 is in**. `SANSDAYASK` must not be left set by a refused line: it is set only after `ownPageRefused` has answered; a line in B7 asserts it. `toast.ts`: both change the file, in different functions (`toastBatch` there, `placeToast` and `toastAt` here). `topbits.tsx`: the note's anchor reads `data-testid="bell-line-<id>"`, which 825 keeps. Whoever merges second brings `main` in (the handoff's rule) and re-runs the guard's test files |
| **The words pass**, merged (pull request 841) | `state/notices.ts`, `ui/InputsPage.tsx` | Already in this branch. Its two later rulings (a changed input's bell line says every change; an undone change gets a notification of its own) meet Build 3, not this one. **No word of Build 1 is taken from the words pass**; the builder searches `main` for the bell line's row before touching any line's words (the handoff's rule) — Build 1 touches none |
| The Tracker press reshape (its own plan, not built) | `tracker/app/core.js` gestures | Build 1 edits `core.js` in four places only — the new read-only `TRK_WINDOWS` table, the registered `ask` (the tail), the new `onTrackerWindows` line with the asking mark beside it, and (N12) the one variable `App.jsx` hands its Flow chart / Info tab to; `endSession` is not touched. None is in the gesture code. If N7 is answered "the marking window counts", `tracker/App.jsx clickAway` changes too — the reshape's own ground, settled with that plan first. Whichever is built second re-reads the other's diff of `core.js` |

---

## 10. The build order

Every step: its tests written first and **seen failing** — except the tests marked **pin**, which are written first and
**seen passing on today's code**, and say so in their names (a test that will not fail, and is not a pin, is reported,
never bent); then the step; then, on his PC, **only the touched test files and `npm run build`** (the type check —
`tsc --noEmit` is hollow here), `npm run lint:changed`; the full suite is GitHub's run of the pull request
(`shipping.md`). A browser test file builds the app, so it waits for the checks lock. **Each commit leaves the app
working and the whole suite green**: an existing test whose meaning a door changes is changed in that door's own step,
never before it (§15, finding 9). **And no step leaves a door half-guarded:** the page door, its callers' `then` and
the landing's second ask are one commit (step 5) — a door that refuses while its callers still open is worse than no
door (§16, finding 1).

| Step | What | Its tests | Waits on | Leaves the app |
|---|---|---|---|---|
| **0** | **The pins and the census — no behaviour changes, no expectation changes.** `msq-guard-asis.test.tsx` (P1–P17), green today. Then the census: the 37 test files that press a pick or the view switch and the 13 that press a bell line (the lists in §14) are read, and each test whose set-up makes that press **with something open** is listed in the plan's own annex with what it proves, in three kinds: (a) it proves the held window a change he did not make still raises; (b) it proves the pick's or the member view's band — unreachable after this build; (c) it proves what the press does. **Only kind (a) is touched here:** its set-up is re-pointed to the road that still exists (the midnight clock, as `msq-fix-sched-windows-midnight` does) — green before and after. Kinds (b) and (c) are listed by name for the step of their own door. **The list goes to him by name in the report; none is edited to pass.** Also here, reading only: the last column of §5.5 | P1–P17 (pins) | — | as today |
| **1** | **Part A.** `state/guard.ts`, `ui/guard.ts` (`GUARD_ROWS` — a row for each movable window from `FLOAT_WHERE`; `whatIsOpen`, `rowReachable`, `useGuardWork`), **`ui/windrawn.ts`** — each drawn predicate as a function there, called by its component (no component file gains an export), `winorder.ts winUp(id)`, the seven Admin `useGuardWork` calls and the Inputs list's `oilrevise`, `core.js TRK_WINDOWS` (read only — `endSession` untouched), the `role.js` bridge with its `behind` and asking marks. No door asks yet | R1–R4, R7, A1–A14; B18 (pin from here). Must stay green: `ui/pops.test.ts`, `state/view-reset.test.ts`, the Tracker's session tests (`tracker/tracker.test.tsx`), the Tracker smoke (P17); **React Doctor's count unchanged** (`npm run lint:changed`) | **H2, H3, N1, N6, N7, N12**, §3 (which reason first) | as today — nothing reads the answer |
| **2** | **The note's place.** `toast.ts toastAt`, `placeToast`'s anchored branch and its ✕ check at every place, `ui/guardnote.ts`. No caller | `msq-guard-note.test.tsx`; must stay green: the toast's own tests | **H11** | as today |
| **3** | **The pick's door.** `pick.ts`, `Drawer.tsx DrawerSquadron`, `SquadronMenu.tsx` | B1–B4, B10–B13 (pick halves), B16, B19–B21; step 0's kind (b) files for the pick — the press becomes the raw entry (`enterSquadron(u, hold, true)`), the test **renamed to say so** ("reached by no press since D2403 — removed with the band in Build 2"); its kind (c) files — the expectation becomes the refusal, citing D2403 | **H8, N6**, §3 (the row refused, not the list), the pick's words | a pick refuses; the view switch and the bell as today |
| **4** | **The view switch and the Tracker's question.** `store.ts switchRoleView`, `role.js`, `core.js ask`, `Drawer.tsx #drawerRole` | B5, B14, B15, the switch halves of B10–B13 and B20; step 0's kinds (b) and (c) for the switch (the tests of the Input window's own chip among them: they reach a held window by the switch, and go on the checker's allow-list by name in step 6); P3, P11 green | **N5, N10, H8** | the switch refuses and asks |
| **5** | **The bell and the page door — and nothing behind a refusal.** `belltap.ts enterForLine` (with `opts`), `openBellRequest`; `store.ts setPage` — the three answers, `then`, the kept door, **the landing's second ask** — and `ownPageRefused`; `topstate.ts openNotice`, `lineOpens`, and `openInputOnPage` on the door's `then` — **which brings the bell's own OIL tap's page half with it; that half needs no N8**; `OilDayList.tsx openInput` through `openInputOnPage` with its door `'card'` and `skip` — the window after its page, never before, in the same commit as the door (left for step 7 its `setInpEdit`-then-`setPage` would set the window and then be refused); `leavewar/sync.ts openInputWindow` on `then`; the ask-first line in `openAdminUsers`, `openWarAt`, `openNewPeriod` and `WelcomeBack.tsx` (and in Undo, only if a road to its landing is found — row 13); `snapView` on the door's answer; the six files that reached `view.setPage` re-pointed to the page door | B6, B6b, B6c, B7–B9, B17 (pin), B22, B23, **B25–B28, F2b**, the bell and page-door halves of B10–B13 and B20, R5 (b) and (c); step 0's kinds (b) and (c) for the bell; `ui/msq-bell-tap.test.ts`, `tracker/msq-bell-*.test.tsx` green unchanged where they tap with nothing open | **H7, H8, N3**, §3 (a refused line left unread) | every door of §4.1 but row 21, and no window behind any refusal |
| **6** | **The checker, switched on — every door now guarded.** `state/guard.ts setEntryChecker` and its two checks (§3.4), installed in the two test set-ups with `ui/guard`; called by `enterSquadron` (`byPick`) and `switchRoleInForce`; fed by every passing and every refusing `refuse()`; its allow-list by name | R5 (a) (pin, the list as it stands here), R6; **the whole suite, on GitHub's run — any test it fails is a finding about that test or about a door this plan missed, reported, never silenced** | — | all of part B but row 21 |
| **6b** | **N11's door, on his answer** — `undo/timeline.ts globalUndo` / `globalRedo`, a refusal in the chain ahead of `snap()` (§4.1, rows 13 and 21). A step of its own: the checker does not wait for it | B24 | **N11** | row 21 |
| **7** | **Part F's doors.** `state/inputsqn.ts` — `inputSqn`, `INPUT_DOORS`; `OilDayList.tsx openInput` gains its `enterForLine(inputSqn(…))` line ahead of step 5's (the card: its squadron, its page, then the window; `skip` the whole way); on his answer, the bell's own OIL tap, the Inputs list's row and "OIL?" button and the calendar's card (N2 + N8), the holiday's line (N4); `InputWindow.tsx DocField` (`locked`). **R5 (a)'s list gains each new `enterForLine` caller in this same commit** | F0–F3, F1b, F5, F7, F11; F9's door half | **N2 + N8, N4, H7, N3** (the words of a refused card or row) | F1 closed by order; F2 as his answer says; nothing greyed |
| **8** | **Part F's root.** `InputWindow.tsx` — the note takes `inputSqn` and `letOpenOn`; `held`; `swapOn`. **Not built while any row of §5.5 answers "yes" without his answer** | F4, F8 (pin), F9, F10, F12; **F1 and F1b still green**; `ui/msq-pick-swap-question`, `ui/msq-night-held-input` as their door's step left them | **N2 + N8, N9**, §5.5 complete | a wrong-squadron input is held by any door; none is born greyed by a press |
| **9** | **The browser tests and the records.** `e2e/msq-guard.spec.ts` (under the checks lock); `docs/file-map.md` (the new files, and chat 162's three test files and `escListTop`, still owed); `docs/ui-contracts.md` (the guard's rule, the note's place, **the page door's two rules for a caller**); `docs/feature-impact.md` (a row "the guard rail" beside "The bell's notices" and the page-squadron section: what a new window, a new door, a new page-opening button, a new door into the Input window and a new bell line each owe it — and the known limits of §3.1 and §3.4: a form with no frame, a squadron change that is not "by pick"); the backlog item — **with, under N2 + N8's (b) or (c), F2's roads left as they are, in his words** — and the handoff | e2e (N12's narrow-width test among them); `npm run docsize` | — | — |

**What the FULL check then needs from Build 1** (one check for the batch with [MSQ-NIGHT-153-OPEN], after Builds 2 and 3,
D485 — unless he wants Build 1 live on its own, which needs its own and the three conditions of §1): the roll-call's rows
this build adds —

- every row of §3.2 (each window × counts or not × the page it is on × **drawn or not**), each with its test and **its
  break** (the wire cut once, a named test red — `scripts/handpass/breaks.mjs` gets a list: each `GUARD_ROWS` row's `open`
  made to answer false, **and made to answer the raw flag where the two differ**; each door's `refuse` line removed, the
  page door's among them; **each `then` caller of §4.5 put back to "the page, then the window" in the caller; the
  landing's second ask removed; a door's `skip` dropped at the page door**; `noteAtFoot` inverted; the checker
  switched off);
- every row of §4.1 (each door × refused / must not / missing), **each pressed as a whole sequence on the real
  controls**; **every row of §4.5's table (each call site of the page door × its kind), each pressed under a
  refusal — nothing opened, nothing marked**;
- the note: each door × each reason × each of the eight sizes × the words × **what its box lies over** (P3's table,
  pressed again on the build);
- part F: every door of §5.5 × "is the input's squadron the page's" — walked, since only F1–F5 are tests;
- the traps of §11 risk 6, each tried by presses: a template dialog under a lowered Plan; a Leave War window behind a
  tab that is then no longer offered; the Tracker's failure card at a pick; a Users row behind another section; a
  Tracker window behind the Flow chart tab at a narrow width (N12); the closed note's own button in the held-war
  state (§11 risk 20);
- the scenarios file's rows C1–C29, C31–C33, C39, C40, C52, C53 are this build's; its lessons table stands (§12).

---

## 11. The risks, each with how the plan answers it

| # | Risk | Answer |
|---|---|---|
| 1 | **A window that opens after the guard has looked.** | With no question the check and the change are one synchronous call — nothing can open between. With the Tracker's question up, its shade stops the mouse and it holds Tab (`Modals.jsx trapTab`); what can still arrive is a save failing, or a window that opens by itself. So every door asks the guard **again** after the answer (§4.2 step 5; B19). The cost — chart edits discarded, then a refusal — is real and rare; said on the evidence sheet |
| 2 | **Two switches at once.** | A second door under the Tracker's question is already dropped (`core.js ask`: `if (dlg) return false`). Without a question each door is synchronous and `enterSquadron` refuses re-entry (`ENTERING`). A pick then the badge in one breath are two whole presses in order. The press report's "two picks back to back" stays as P1's twin |
| 3 | **A refusal that leaves a half-entered squadron, or a half-done press.** | The check is the first line after "is this a change at all" in each door, before any flag is set. The page door stands before `view.setPage`, which itself closes ALL AVAIL, Changes and Traffic — so nothing has changed when it refuses; each caller that sets something before the page asks first, and what a caller would open after the page the door runs itself (§4.5's table — each with a test: the line unread, the card unspent, no window, the Undo not done). B1 asserts the war's world and the Tracker's door as well as `UNIT`; B8 that nothing asked of the Leave War is left to fire later |
| 4 | **The note pointing at a control that has scrolled or folded away.** | The top bar is fixed, so the picker and the badge do not scroll. A control not on the page or not drawn when the note is raised → the foot. The place is worked out again only on a resize or a window opening; then, the control gone → the foot. e2e resizes across 820 with the note up |
| 5 | **A refused door that later runs by itself.** | A refusal stores nothing — no "wanted squadron", no callback. B10 runs the timers after Retry lands and asserts nothing moved. Today's two "runs later" roads (a held war window's Close letting the war in; the Tracker following once held work is gone) can no longer be started by a press, and stay for midnight (P5). H8's wait is the one place a press runs after a pause: it is the same press, only after its own save, it starts again from step 1, and it is dropped if he has pressed anything else (H8) |
| 6 | **A guard that refuses with nothing he can close — the trap.** | Six causes, each named by a reader and each closed in the design, not by a way out. (a) *A flag that outlives its drawing* (the four template dialogs, Changes) — every row reads the predicate its component draws from; R1, A10. (b) *A list that holds what does not count* (the question sheets' list and the document viewer) — the row is withdrawn; P10. (c) *The Tracker's state behind a card or a cover* — the bridge answers none unless the Tracker is drawn; A11. (d) *A window on a page out of sight* — N1; where the page is no longer offered the recommended answer is that it does not count, and **nothing of it is built until he answers**. (e) *A reported row whose component unmounted* — `useGuardWork` leaves in its effect's clean-up, the only way a component goes; A6. (f) *A Tracker window behind its own Flow chart tab* — no trap, the Info tab is one press away, but a note naming nothing he can see: N12, nothing of it built until he answers; A13, e2e. **Logout and a reload still end any trap, but each loses what is typed — they are not the answer to one** (Astra). The FULL check's walk tries to make each by presses |
| 7 | **The Tracker's own windows.** | One read-only table in `core.js` answers the guard; `endSession` is untouched, so the sign-out's clean-up cannot be broken by this build (P17); R4 ties the table to it and to the components, occurrence by occurrence. The marking window closes at any press outside it — N7 decides whether it counts, and B4 presses the whole sequence either way |
| 8 | **A helper window another branch adds.** | R1–R4 fail on a new flag in `pops.ts` or `view.ts`, a new `FloatWin` id, a new dialog or window hook **in any file, counted file or not**, and a new window state in the Tracker — until it has a row; R7 proves the scans by planting one. The `?timing` readout is the worked case (§9). Two limits remain, said: a form with typing and no frame is seen by no scan (§3.1); and a branch built before Build 1 merges adds a window, and the test only fires once both are on `main` — the second to merge brings `main` in and meets it then |
| 9 | **37 test files change meaning.** | Step 0 is a census before any code, sorted into three named kinds, reported to him by name; each file changes only in the step of its own door. The checker's allow-list is the only place a raw entry is excused, and Build 2 empties it |
| 10 | **The checker makes an unrelated test fail.** | It is switched on only when every door is guarded (step 6), so it can only fire where a test drives a pick, a switch or a landing with something open — which is a finding about that test or a door this plan missed. Either is reported; neither is silenced outside the allow-list |
| 11 | **`switchRoleView`, `pickSquadron` and the page door become asynchronous where they ask.** | Only where they asked or waited; with nothing to ask all stay synchronous, so the tests and callers that read the result in the same tick (P1, P11, the 37 files) are unaffected. The page door answers at once — `'went'`, `'asked'` or `'refused'` — and where it must wait (the landing's question, H8's save) it holds the caller's `then` and runs it itself, so no caller has to read a late answer. H8's wait is behind `saveSettling()` and P14 pins the ordinary case |
| 12 | **The member view's hold comes back by the second entry** (§4.4 step 5). | B14 asserts the result after `whenUnitSettled()`. If it fails, the fix is in `trkMayHold` (the member-view half answering false while the entry in hand was his own press) — named here so the builder does not reach for a timer |
| 13 | **Over-refusal.** A row marked `'window'` that he would call harmless (ALL AVAIL, a folded Changes bar) makes the app feel stuck; a bell line that moves nothing refused for nothing. | H2 decides each window; each is one flag. A line that changes neither the squadron nor the page is never asked (P16). The page door asks only for a page the squadron in view does not offer — never for a tab, never on his own squadron. The note always names what to do |
| 14 | **A press on the way to the door closes the window it would have counted.** The Tracker's marking window at the Schedules button; a bar-free window at any bar control. | Every door test presses the whole sequence on the real controls and asserts the window is still drawn after a refusal (§4.7). Which windows close this way on purpose is H2's and N7's; none is left half-way — counted, yet closed by the press that was refused |
| 15 | **The root greys a window he has just opened, under untrue words.** | The doors and the root are built apart (§5): the doors close F1 by order, and F2 as he answers N2 + N8; the root is built only when §5.5 shows no press opens a window born held, and each "yes" there is his question first (N2 + N8, N9) |
| 16 | **The note lies over a control.** | Each place it can stand is tried against every window's ✕ (D2590); what else it may cover — a window's Delete, the picker it names — is H11's, with P3's pressed table in front of him |
| 17 | **Build 1 merged with a road left open.** | §1's three conditions: N3 and N11 answered and built, or he has been told those roads by name; no unsafe recommendation built; N2 + N8 answered, and F2 reported closed only under its answer (a) |
| 18 | **Something opens behind a refusal** — round 2's first HIGH: the door says no and its caller opens the Input window all the same, live under the wrong number, beside the note. | The page door runs what follows the page (`then`), in one state only — the page asked for is the page shown; the landing's second ask answers false; callers that set a mark ask first (§4.5). Held by R5 (c)'s census of every call site, by the checker's second check under every test, and by B26–B28 |
| 19 | **A door and the window's note sharing one answer** — round 2's second HIGH: a clause meant to keep his own input live told the bell's door he was already where the input belongs. | Two functions: `inputSqn`, which every door asks and which has no clause for who is named; `letOpenOn`, the root's alone (§5.2). F0 pins the first; F1b keeps the bell's test green with the root's clause on. And what he should see is one question, not two (N2 + N8) |
| 20 | **The closed note's own "Open the Inputs page", refused by the sheet it is on** (Opus, round 2). Only in the held-war state — a war window held after a change he did not make, a squadron he only views picked: the page door counts the Leave War's open sheet, which is the closed note itself. | **Narrowed, not mended in Build 1.** The fix offered — close the sheet first — does not work: a sheet leaves `Sheet.tsx OPEN` in its effect's clean-up, after the redraw, so the door asked in the same press still counts it; leaving out one sheet needs the war's one row split per sheet, for a state Build 2's card removes. He is not trapped: the note is true (close the window), the sheet's ✕ closes it, and the landing then takes him to View-only Sched as today. A row of the walk |

---

## 12. The order's lessons (§7.11), against this build

| Lesson | Where it bites here | Covered by |
|---|---|---|
| 1 a reading in one state only | the note × door × reason × size; **a flag read with its window drawn, never with it hidden** — the first draft's own fault | §10's roll-call; B10–B12; A10, A11; e2e |
| 3 feedback, and what is out of sight | the note is the only sign of a refusal; the Retry it names is not drawn inside the ☰ menu (words-read N4); a window the note says to close that is out of sight (N1) | the menu closes on a refusal, from both its doors (H11; B2, B5); e2e asserts the band and the note in one picture |
| 4 the page behind an open window | the whole job — every non-shaded row | B4 |
| 5 a thing brought into sight against what stands over it | the note against a window's ✕, the "Not saved" band, the phone's keys | §4.6's ✕ check; e2e |
| 10, 12 a page hidden and shown; a window opened from every page | N1; a Tracker window behind the Flow chart tab at a narrow width (N12); the Input window from Inputs, the week, the board, a SANS day, the medical page, the document viewer | A7, A10, A13, e2e; §5.5's doors, walked |
| 11, 31 sizes; a real window at 125% | the note under the control | e2e at 1366, 2560 and started at 125% |
| 14 a list made by searching, never from memory | the windows, counted one by one; the doors into the Input window; every caller of the page change | R1–R5, R7; §5.5 |
| 19 a window over a window, closed by each way | "is anything still open" after each | A2, A4 |
| 23 the ruled tap beside the build's | a bell line moves him there (D2325); an input's own window from any day | B6's twin after Retry asserts the ruled landing; F1 only on N8's answer — never the build's own |
| 25 made where a person can put it | ALL AVAIL made by presses, as P1 made it (the demo offers none); every door pressed as its whole sequence | B4; the walk |
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
| Step 0 — the pins, the census of 37 + 13 test files, the last column of §5.5 | 3.5 | reading each test's set-up; re-pointing kind (a) only |
| A — the table (a row for each movable window), the function, each drawn predicate moved into `ui/windrawn.ts`, the Tracker's read-only table and bridge with its two marks, eight reports, the scans by occurrence, "counted means drawn" | 7.5 | about 55 rows in 8 frames; the predicates touch about fifteen component files, a line or two each |
| The note — `toastAt`, the anchors, the foot rule, the ✕ check at every place | 2.5 | |
| B — the pick (2), the view switch and the Tracker's question both ways (3), the bell and the page door: its three answers, `then`, the landing's second ask, fifteen call sites by kind, six re-pointed files, H8's wait at each door (6.5) | 11.5 | every test presses the whole sequence; B26–B28 press every caller under a refusal |
| The checker switched on, with its two checks (2), and N11's door (1) | 3 | plus whatever the checker finds — not sized |
| F's doors — `inputSqn` and the doors' table, the card, the late document, the holiday's line; on his answer the bell's OIL tap and, under (a), the list's row, its "OIL?" button and the calendar's card | 4.5 | 3 under answers (b) and (c) |
| F's root | 2 | small once §5.5 is answered |
| The browser tests and the records | 4 | eight sizes, three places for the note, N12's narrow width |
| **Build 1** | **about 38** | round 1 left it at about 31, the first draft at about 21. Round 2 added: the door that runs what follows it, the census of its call sites and the checker's second check (about 3.5); the two functions and the doors' table of part F (1.5); the predicates in a module of their own, a row per window, the standalone OIL question and the Tracker's two marks (1); N11's door as its own step and N12's test (1). The sizing file had A + B at 9 and F with G at 4 |

Then the last round of blind reads on this plan (§16), and after the build one round on the code and its fixes — not
sized here. **Twelve questions (N2 and N8 now one, N6 now blocking) and nine of the brief's stand before the first line
of code** (§8): the hours above start when they are answered.

---

## 14. What is still unproved, and the lists

- **The plan's writers pressed nothing.** Every "today" is from the code, from the press report of 24 Nov, or from the
  five pressers of 25 Nov where cited (the fifth pressed N1–N6: a window behind a tab, his own input on 149's page,
  "Check my quals", the holiday's line, the view switch over an unsaved chart edit and a pick after his move are now
  pressed, not read). **Not pressed by anyone:** N1's second case — a window behind a tab the squadron in view then
  stops offering (read from `Sheet.tsx`'s kept-mounted guard and `perms.ts pageOffered`); a card of the OIL list
  pressed in N4's state; Undo by Ctrl+Z, or from the Help page, on a squadron he only views (no Undo button is drawn
  on its View-only Sched: P5 N3); road (1) of N2 + N8 for a Plan holder (security F2 itself) and its road (3), the
  row's "OIL?" button on 149's list; N9; N10 for a Plan holder on another squadron; N11 with a window open; N12 — a
  Tracker window opened wide, the screen then narrowed; the closed note's button in the held-war state (§11 risk
  20); an armed "Discard N edits & load" at a pick; §5.4's second lead; §4.4 step 5's second entry.
- **Read by the revisers, not run:** every "true in the code" of §15 and §16. No test was written to prove a finding.
- **New design that no reader has read** (round 2's fold): the page door's three answers and `then`; the checker's
  leave and its second check; `inputSqn` / `letOpenOn` and the doors' table; the `trkask` row; H8's wait at the page
  door. The last round of reads is for these (§16).
- **For the builder, unproved in that new design:** the page door calls `notify()` itself before a `then` — on
  `openInputWindow`'s road that is one redraw more than today between the page and the window, and in `snapView`,
  inside an Undo step, a `notify()` is held back until the step ends (`store.ts notify`, `deferEffect`), so the
  landing does not run inside the door's call there; whether `warBand()` is set for every held Leave War window (N6's
  other answer rests on it); whether the test set-ups can import `ui/guard` without a cycle or a cost in the suite's
  time (if not, §3.4's limit grows to the headless state tests, each named); how `App.jsx`'s tab reaches core without
  a second source of truth (N12); a mark set before a page whose landing question is then answered Stay — the ring
  asked of the Leave War, the Users intent — stays set today and after Build 1 (seen, not this build's).
- **Not traced:** how the Undo entry is read, before its step, for "removes the squadron in view" (row 21 — the place
  to ask from is found, §4.1: `globalUndo`'s chain of refusals; the read of `entry.inverse` is not); whether an Undo can be pressed at all while a save
  has failed; whether a press outside closes the Tracker's Down days, fail log and lull pop-ups as it closes the
  marking window; whether `#cxPop` and `#sortAllPop` can stay un-hidden under a closed board; where `MedMoveConfirm`
  can be drawn with its page gone; the last column of §5.5 for five of its doors; whether the Tracker's `pop` or `dlg`
  can in fact be set under its failure card (the bridge's gate is a belt either way); why a pick loses a changed Users
  row today (what happens was pressed, P2 1; the cause was not looked for).
- **Not read whole:** the bodies of the 23 Leave War sheets and the Tracker's modals (their frames and flags were);
  `leavewar/ui/Matrix.tsx`; the stylesheets, except the one rule that hides the badge at 820. So the layers the note
  must stand over (it is 540; the windows 410 / 411; the ☰ menu 440) are from comments in `toast.ts` and `Drawer.tsx`.
- **The class of a Leave War sheet's ✕** — each sheet draws its own inside `.bidsheet-hd`; not read sheet by sheet.
- **Whether the Leave War's and the Tracker's Legends have a ✕** — H2's row for them rests on their closing at a press
  outside.
- **D2611** is not on this branch (`.claude/decisions-full/` has no row); it is taken from the handoff's own words.
- **Pull request numbers** are matched to branches by name (840 → `claude/app-speed-readout-161`; 825 →
  `claude/allavail-sans-postout-141`); no fetch was run, so each diff is of the remote ref as it stood.
- **The sizing file's "twenty app files"** reading the held machinery was not counted; it is Build 2's.
- **Only his iPhone can show:** the note against the real keyboard and Safari's folding toolbar; the note at the top
  against a phone panel's own title strip and ✕; whether the bell and the badge can be reached at all with a panel
  window up (all three readers).
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

---

## 15. The red team, round 1 (25 Nov 26)

Three readers read the first draft (commit `9c0d03e93`), each blind to the others, from one brief
(`../briefs/2026-11-25-msq-pick-guard-build1-read-brief.md`): **Astra** (`…-build1-read-astra.md`, 9 findings), a fresh
**Opus** (`…-read-opus.md`, 8) and a fresh **Fable** (`…-read-fable.md`, 10). A second fresh Fable folded them in: each
claim was checked in the code named, on `cd364c3e1`, **by reading — no test was written or run**; where two or three
readers found one thing it is one row. Severity is as each reader gave it.

| # | Who · severity | The finding | True in the code? | Taken? | Where the plan changed |
|---|---|---|---|---|---|
| 1 | Astra 2 HIGH · Opus 1 HIGH · Fable 2 HIGH | The squadron still changes through `enterForLine`'s `'no'` (a line of a squadron his pages may never be; the squadron in view itself in the member view), and through the bell's own OIL tap: the page opens, the landing brings his own squadron back, nothing asked | **Yes.** `belltap.ts enterForLine` answers `'no'` before any check; `topstate.ts openNotice` goes on to `openInputOnPage` → `setPage('inputs')`; `store.ts landOnOfferedPage` → `landOnOwnPage` → `enterSquadron(home, …, true)`. Pressed the same way for a View holder (P2 4, 5) | **Accepted.** Of the two cuts offered, the check at the page door (Fable) is taken, with the opener's ask-first order (Opus) for the six callers that set something before the page — why: §4.5 | §1; §4.1 rows 7–10, 12, 13, 22; §4.5; B6b, B6c, B9, B22, B23, F2b; R5 (b) |
| 2 | Fable 1 HIGH | Four flags stay set while their dialog is not drawn; the guard would refuse with nothing to close | **Yes.** `DutyTplModal.tsx` l.47, `WaveTplModal.tsx` l.56, `DayTplModal.tsx` l.43, `DraftsModal.tsx` l.47; `pops.ts POPS_RESET` clears them at a sign-out only. The reviser found the same shape in `ChangesWindow.tsx chgUp` | **Accepted**, and made the rule for every row | §3.1 (the table and the rule); §3.2 (b), (c); R1; A10 |
| 3 | Astra 1 HIGH | The Tracker's marking window is closed by the press that opens the Schedules list, so the pick finds nothing open; a refused badge press then closes it in the same press | **Yes.** `tracker/App.jsx clickAway` — a document `click` listener that closes `core.pop` unless the press is inside `#pop` or on `.ball` | **Narrowed.** The fact is taken; Astra's fix — keep the window open through the doors — is a change he would see on the Tracker's page, so it is a question (N7), with "it does not count" recommended. Her second fix, whole press sequences in the tests, is taken | §3.2 (g); N7; §4.7's head, B4; §11 risk 14 |
| 4 | Astra 3 HIGH · Opus 2 MEDIUM | A window on a page the squadron in view no longer offers refuses every door, with no Close he can reach | **Yes, by reading; not pressed.** `Sheet.tsx OPEN` is kept by mount; its Escape and Tab act only while the Leave War page shows; `perms.ts pageOffered` hides the tab | **Accepted** as a fault of N1's recommended answer. Opus's fix (such a row does not count) is the recommendation for N1's second case, **not built on the agent's reading**; Astra's (a recovery before any answer is built) is why nothing of N1 is built until he answers | §3.3; N1; A7; §11 risk 6; §1 |
| 5 | Astra 4 HIGH | "Safe to merge alone" contradicts two roads left unguarded ("Check my quals", Undo); and the welcome-back card is spent before a refusal could run | **Yes.** `WelcomeBack.tsx`: `seen()` calls `markBackSeen()` before `setPage('quals')` | **Accepted** | §1 (two conditions); §4.1 rows 12, 13; §4.5's table; N3 now blocks; B22, B23 |
| 6 | Astra 5 MEDIUM · Opus 3 MEDIUM · Fable 5 (second part) MEDIUM | The census cannot catch a window added to a file already listed, a flag kept outside `pops.ts`, or a window drawn as a plain box | **Yes** — of the first draft's R1, R3, R4 as written; `state/view.ts` already holds `AVAILWIN`, `CHGWIN`, `OILWAIT` | **Accepted**, with Opus's limit stated: a form with no frame is seen by no scan | §3.4 (R1–R4 by occurrence, R7); §3.1; §11 risk 8 |
| 7 | Astra 5 (second part) MEDIUM | The Medical page's "as of" calendar is missing; seven components own typing, not five | **Yes.** `MedicalView.tsx calOpen`; `UsersPanel.tsx PersonEditor`, `ArchivedEditor`, `Waiting`, the add form; `SquadronsPanel.tsx NewSquadron`, `MoveEditor`, `PlaceEditor` | **Accepted** | §3.1; §3.2 (h), (i); H3; P4 |
| 8 | Astra 6 MEDIUM | A refused switch from the ☰ menu leaves the menu drawn | **Yes.** `Drawer.tsx #drawerRole`: `setDrawer(false); switchRoleView()` — only `switchRoleView`'s `notify()` redraws | **Accepted** | §4.1 row 4; §4.4; B5 |
| 9 | Astra 8 MEDIUM · Opus 4 MEDIUM · Fable 7 MEDIUM | The build order leaves the suite red: step 0 changes expectations before any door refuses; the checker goes on at step 3 while the bell's door comes at step 5. F4's "pick 142 → live again" is now refused. R5, B17, B18, F8 pass today; F6 is an argument. The steps do not say which question each waits on | **Yes.** `enterForLine` and `landOnOwnPage` both enter with `byPick` true | **Accepted**, all parts | §10 (every step); §3.4 (the checker, step 6; the "fails first?" column); F4; F6 withdrawn; "pin" marks in §3.5, §4.7, §5.6 |
| 10 | Astra 9 MEDIUM · Opus 5 MEDIUM · Fable 9 LOW | Built on the agent's own reading: two lines that open nothing refused and called "accepted"; N1 "built to refuse until he answers"; the Tracker's question at the view switch unmarked; the bell's OIL tap entering 142 (D2403 lists it as not covered); row 7; N6 called "the letter"; a clean chart editor closing at the switch | **Yes** — of the first draft's text; D2403's row reads "Not covered by it: the bell's OIL line opening another squadron's input" | **Accepted.** One part narrowed: Astra asked for the lines that change nothing to go on the questions page — the plan now leaves them exactly as today, so there is nothing new for him to see and no question | §4.2 step 1, P16; §3.3; §4.4 (`[WNS]`, N10); N5, N6, N8, N10 |
| 11 | Opus 6 MEDIUM · Fable 4 MEDIUM | The OIL list's card, asked like a bell line, is refused by the list it sits in; and the first draft's new case refused a holiday's line before N4 was answered | **Yes** — by the first draft's own design: `OilDayList.tsx openInput` is pressed inside a counted `oilday` | **Accepted** | §4.1 rows 10, 11; §5.3 door 1; N4's row; B25 |
| 12 | Opus 7 MEDIUM · Fable 3c | The root greys a window from the moment it opens, under words that are untrue; the roads to it were left for the final walk | **Yes.** `store.ts heldWords`: the pick's band whenever `enteredByPick()` and the squadron in view is not the window's, else "This change could not be saved." | **Accepted**, with Opus's cut: the doors first, the root last and only when no press opens a window born held | §5 (head), §5.2, §5.5 (new), N9; §10 steps 7, 8; §11 risk 15 |
| 13 | Fable 3a HIGH/MEDIUM, 3b, 3d | The root holds a window that must stay live (a posted man's OIL question; his bell's list then unreachable); the door passes `inputUnitOf`, not what the root uses; "once" against "every draw" | **Yes.** `leavewar/sync.ts oilPendingFor` scans every input; `topstate.ts bellTap` returns after the OIL branch, before `setBellList`; `engine/inputs.ts inputUnitOf` is the first-named man's squadron | **Accepted.** 3a narrowed: Fable's "whatever he answers, never held" is written into N2's row as a condition on the other answer, not built | §5.2 (once), §5.3 door 2, N2, N9, F12; `state/inputsqn.ts` |
| 14 | Fable 5 MEDIUM | R5 cannot see the largest family — any `setPage` to a page not offered | **Yes.** Sixteen calls outside `store.ts`, in twelve files; six reach `view.setPage` directly | **Accepted** — it is the cut of row 1 | §3.4 R5 (b); §4.5 |
| 15 | Fable 6 MEDIUM | The question sheets' list is wider than the plan said and holds the document viewer; a one-press door would find it still there | **Yes.** Thirteen `useSheetFocus` callers, `DocViewer.tsx` l.121 among them; a sheet leaves in the effect's clean-up. The reviser adds: `MedMoveConfirm.tsx` and `OilWaitSheet.tsx` do not call it themselves | **Accepted** | §3.1; §3.2 (e) — the row withdrawn, two rows of their own; P10 |
| 16 | Astra 7 MEDIUM | Part F does not cover a document chosen late | **Yes.** `InputWindow.tsx DocField` → `state/docs.ts docAdd`, with no test of the window's state. **Narrowed, as Astra herself and Fable's check say:** a file is stored and the held window's list changed; no squadron's record is written | **Accepted** | §5.4; F11 |
| 17 | Fable 10 LOW | The Tracker's rows read module state that may stand behind its failure card | **Partly.** The gates are there (`tracker/App.jsx`: `bootError`, `!ready`, no course). Whether `pop` or `dlg` can in fact be set behind them was not shown — `endSession` clears them before a move | **Accepted** as a belt; the page's cover added to it | §3.1 (the bridge); A11 |
| 18 | Fable 8 LOW | H8's wait has a cost the plan did not name; the bell's door is synchronous | **Yes.** `enterForLine` returns at once | **Accepted** — into H8's row, with Fable's "dropped if he presses anything else" as part of the recommendation, not built | H8; §11 risk 5 |
| 19 | Opus 8 LOW (six) | (a) `noteAtFoot` cannot know the press was inside ☰; (b) the Tracker's `dlg` must close by `dlgCancelAll()`; (c) `toastAt` clears its own `AT`; (d) the fall-back to the foot is never checked against a ✕; (e) §3.2 says "built unless he answers otherwise", §8 the opposite, and §8.1 has no "blocks"; (f) B8 rests on H2 | **Yes, each.** (a) both lists share one door id and `#drawerRole` closes the menu first; (b) `core.js endSession` calls `dlgCancelAll()`; (d) pressed worse than read — the top lies over the Input window's ✕ and the foot over its Delete (P3 1) | **Accepted, all six.** (b) is met by not touching `endSession` at all | (a) `from`, §4.3, §4.4, §4.6; (b) §3.1; (c), (d) §4.6, the e2e; (e) §3.2's head, §8.1's column; (f) B8 |
| 20 | Astra's safer cut | Keep the Tracker's bridge read-only; deliver the guarded journeys together, N3 resolved | — | **Accepted** | §3.1; §1; §10 |
| 21 | Opus's safer cut | One guarded opener; hold the root until the doors are listed and N2 answered | — | **Accepted in part:** the root waits; the opener is taken as the ask-first order, the page door as what enforces it | §4.5; §5; §10 |

**What the first draft had that this revision takes out, said so nothing is dropped quietly.**
- `endSession()` closing by walking `TRK_WINDOWS` ("one list for the guard and the sign-out") — replaced by R4's scan,
  which ties the two lists without touching the sign-out's clean-up (rows 19 (b), 20).
- The one row `open() = !!topSheet()` for every question sheet — replaced by a row each for the medical move and the
  OIL question put before a change (row 15).
- `enterForLine`'s new case for a line of his own squadron, and with it the refusal of two lines that open nothing —
  replaced by the page door, which asks only where a page opens (rows 1, 10). The holiday's line is no longer refused
  by a side effect (row 11).
- N1 built as "refuse" until he answers — nothing of N1 is built before his answer (rows 4, 10).
- F6 as a test — it asserted an argument; B4 holds its substance and the clash note is a row of the walk (row 9).
- Step 0's rewriting of existing tests' expectations, and the checker at step 3 — both moved to where the suite stays
  green (row 9). The checker itself, its allow-list and R6 stay.
- B8's set-up on ALL AVAIL — now a change not saved; ALL AVAIL has its own row in B4 (row 19 (f)).
- `opts.heldChip` — now the general `skip`, used by the chip and by the OIL list's card.
No test of the first draft is dropped but F6; A10, A11, B6b, B6c, B22–B25, F2b, F11, F12, R7, P16, P17 are new.

**What the readers checked and found sound** (their explicit negatives).
- **The callers.** Every non-test caller of `enterSquadron`, `switchRoleView`, `switchRoleInForce`, `pickSquadron`,
  `enterForLine`, `openBellRequest` and `switchUnit` is in §4.1 (Opus, Fable); no key picks or switches, and no address,
  link or browser Back does (all three). The `setPage` callers Opus traced — the Leave War's four, the board's "make a
  period", Logout's Tracker step, the bug alert's tap to Help — bring no squadron back.
- **The first draft's statements about today's code hold** where the readers tested them: `pick.ts` (the early return,
  `pickWillAsk`), `belltap.ts` (`'asked'` returns before anything is read), `store.ts` (`landOnOwnPage` from every
  `notify`, `switchRoleView` synchronous, `ENTERING`, `trkMayHold`, `maybeReenter` with `byPick` false), `core.js` (the
  question's tail, `if (dlg) return false`, `endSession`'s list), `savewait.ts`, `winorder.ts`, `Sheet.tsx OPEN`,
  `pops.ts windowOverSchedule`, `barfree.ts` (Opus, Fable).
- **Every write in the Input window stops on `held`** — Save, Delete, Take me out, the OIL answer, Enter, the medical
  move and the upchit (Opus, Fable; Astra found no other bypass in those handlers). The document's file box is the one
  exception (row 16).
- **The Input window cannot be open and out of sight** — it is mounted at the top level (Opus). **Admin unmounts off
  its tab**, so a typing report cannot go stale; the OIL list clears its own flag when refused (Fable).
- **The saver stays "failed" through a Retry in flight**, so Retry-then-pick is refused without H8 (Fable).
- The same-squadron early return, the clean synchronous pick, "Not saved" against "Not kept", an unconditional Logout
  and the Tracker's question keeping its three answers are consistent with the rulings (Astra).
- §4.4 step 5's second entry: Fable could not fault the reasoning from reading; B14 must prove it.
- Nothing was kept that lives only in stored data (D56 — Opus).

**What round 1 left** — about 31 hours (from about 21), and new design no reader had read: the page door, the
drawn-predicate rule, part F's two halves — **was round 2's to read: §16.**

---

## 16. The red team, round 2 (25 Nov 26)

Three fresh readers read the plan as revised to round 1 (commit `df9a68f6a`), each blind to the others and to round
1's reports: **Astra** (`../briefs/2026-11-25-msq-pick-guard-build1-read2-astra.md` — 1 HIGH, 4 MEDIUM), a fresh
**Opus** (`…-read2-opus.md` — 1 HIGH, 4 MEDIUM, 6 LOW) and a fresh **Fable** (`…-read2-fable.md` — 2 HIGH, 5 MEDIUM,
4 LOW). A third fresh Fable folded them in: each claim was checked in the code named, on `44f67377a`, **by reading —
no test was written or run**; one thing found by two or three readers is one row; severity is as each gave it.

| # | Who · severity | The finding | True in the code? | Taken? | Where the plan changed |
|---|---|---|---|---|---|
| 1 | Opus 1 HIGH · Fable H1 HIGH | The page door refuses and its callers open the Input window all the same — live over 149's View-only Sched beside the "Blocked:" note, its Save writing 142's record. The same when the guard refuses after the landing's question, and from the Leave War's clash note. The bell's OIL ask-first came two steps after the door; F2b asserted `UNIT` alone | **Yes.** `ui/topstate.ts openInputOnPage` — `setPage`, `notify`, `landingAsk()` null, so `open(false)`: `first()`, `setInpEdit(row)`. `leavewar/sync.ts openInputWindow` (l.4641) — `setPage`, then `setInpEdit`. `state/store.ts landOnOwnPage` — its promise answers true once `go`. `ui/InputWindow.tsx` (l.191, l.224) — off the Inputs page `pageSqn = UNIT`, so the window notes itself as opened on 149: live (Opus read `pageSqn` as 142 there; the result is as both say) | **Accepted, whole** — the door runs what follows the page; the landing's second ask answers false; callers that set a mark ask first; a census of every call site and a check under every test | §1; §4.1 (head, rows 7, 9, 22); §4.2; §4.5 (rewritten); §3.4 R5 (c), R7, the checker; B6b, B9, B26–B28, F2b; §10 (head, step 5); §11 risks 3, 11, 18 |
| 2 | Astra 1 HIGH · Fable H2 HIGH · Opus 11 LOW | N2's and N8's recommended answers cannot both be built through the one `ownSqnOf`: the clause that keeps his own input live on 149's page tells the bell's door he is already where it belongs — security F2 stays open, F1 (the test) cannot pass. And N2's answer keeps that write open from the list by design, unsaid | **Yes.** `engine/inputs.ts inputsListed` — listed where it touches the unit **or names him**; `state/belltap.ts enterForLine` — `u === pageUnit('own')` answers `'here'`; the revised §5.2 put the clause in the function the doors ask. **The reviser adds a third road:** `ui/InputsPage.tsx reviseOil` — the row's "OIL?" button writes the OIL answer with no Input window | **Accepted — both ways offered.** Designed away in the build (two functions); and put to him as one question with three answers and their costs. The recommendation moves to "its own squadron first, on every road", a **(reading)** | §1; §5 (head), §5.2, §5.3, §5.5; F0, F1, F1b, F9, F12; §8 (the page's A17), §8.3; §10 steps 7, 8; §11 risk 19 |
| 3 | Opus 5 MEDIUM | N8 has no other answer, and §1's conditions leave it out: Build 1 could go live by its own rules with F2 open | **Yes** — of the revised §1 and N8's row; `[MSQ-NIGHT-153-OPEN]` has F2 fixed before "merge live" | **Accepted** — §1's third condition. **Narrowed in one part:** the "other answer" he asked to have designed is now answers (b) and (c) of the one question; his variant (the tap opens the bell's list) is recorded there, not designed | §1; §8.3; §10 step 9; §11 risk 17 |
| 4 | Astra 2 MEDIUM · Opus 2 MEDIUM · Fable L3 LOW | One row for every movable window cannot leave one out or name the one open; and it counts ALL AVAIL and Changes too, so H2's "they do not count" was not "two rows" | **Yes.** `ui/winorder.ts UP`; `ui/availopen.ts` l.37 `forward('avail')`; `ui/changesopen.ts` l.16 `forward('chg')` | **Accepted** — a row per id from one map | §2; §3.1; §3.2 (a); R2; A2–A4; H2's row |
| 5 | Astra 3 MEDIUM · Opus 3 MEDIUM · Fable M1 MEDIUM | A door's `skip` and the pressed line stop one call short — `enterForLine`'s signature, `openInputOnPage`'s own ask, the checker — so the OIL list's card is refused by its own list after all, the checker throws on entries rightly let through, and a refused line's note falls to the foot | **Yes** — of the revised §4.5 and §3.4; `topstate.ts openInputOnPage` takes no options | **Accepted** — a door's `opts` go with its press to every ask; the checker reads the leave the door gave | §3.1; §3.4; §4.1 row 10; §4.5; §5.3; B6, B25, F4, F5 |
| 6 | Astra 5 MEDIUM | A Tracker window in the Info panel is hidden while a narrow screen shows the Flow chart; the note would name the page he is on; A10 cannot see it | **Yes, by reading; not pressed.** `tracker/tracker.css` l.228–234; `components/SidePanel.jsx` l.603–606; `App.jsx` `useState('flow')` | **Accepted as a question — N12**; nothing built before his answer; her fix is its recommended answer | §3.1; §3.2 (g); §3.3; §4.6; A10, A13; e2e; §8.3; §11 risk 6 |
| 7 | Astra 4 MEDIUM · Fable M4 MEDIUM | A window is missing: the OIL question from a row of the Inputs list, no Input window under it | **Yes.** `ui/InputsPage.tsx reviseOil` (l.434), `oilConf` (l.281, l.1013). Of the sixteen uses of the five question components, in seven files, it is the only one found outside a counted window or a row of its own (the Leave War's three not traced to their sheets). Neither reader showed a door reached through its shade | **Accepted** — a row of its own; R3 counts every use | §3.1; §3.2 (e); R3, R7; A12; §5.5 |
| 8 | Opus 4 MEDIUM · Fable M2 MEDIUM | N6 is built on its recommendation: the table counts a held window, so steps 1 and 3 take away his one way to get it back with his words | **Yes.** `InputWindow.tsx held` — drawn, `INPEDIT` set; pressed, P5 N6 | **Accepted** — N6 blocks steps 1 and 3; the other answer shaped | §1; §8; §8.3 N6; §10 |
| 9 | Fable M3 MEDIUM | H8's wait cannot be built at a door that answers true or false in the same tick | **Yes** — of the revised §4.5; `storage/savewait.ts saveSettling`, `flushSaves` | **Accepted** — the door owns what follows, so it can wait | §4.2; §4.5; H8's row; B20; §10; §11 risk 11 |
| 10 | Fable M5 MEDIUM | Exporting each predicate from its component's file turns the pull request's code check red | **Yes.** The rule is noted at the head of `ui/winorder.ts`, `ui/topstate.ts`, `leavewar/ui/daypanelopen.ts` and seven more of the Leave War's (D1534, D1539); `AvailWindow.tsx isOpen` (l.78), `ChangesWindow.tsx chgUp` (l.133), `SchedBoard.tsx` `open` (l.880) are locals. Not checked: whether `ChangesWindow.tsx`'s re-export (l.50) is spared | **Accepted** — `ui/windrawn.ts` | §3.1; §3.2 (b), (c); R1; §10 step 1 |
| 11 | Opus 6 LOW | The checker misses a squadron change through `maybeReenter` (`byPick` false), and never fires in headless state tests | **Yes.** `store.ts maybeReenter`, `entryDue` | **Narrowed.** Taken: the set-ups import `ui/guard`. Not taken: a "press in flight" mark in the Undo engine — machinery for the one known road, which gets its own door (N11); the limit is stated | §3.4; §4.1 row 21 |
| 12 | Opus 7 LOW · Fable L2 LOW | Tests that cannot be written as described: P5's spy; P10, P12 "never edited"; B25's second clause; P16; F4 under the checker; R5 (a) at step 7 | **Yes, each.** `refusalAt` is new; `topstate.ts openNotice` (l.102) calls `enterForLine` first | **Accepted, all six** | §7; A14; §4.2; B25; F4; R5 (a); §10 step 7 |
| 13 | Opus 8 LOW | The Tracker's unsaved-edits question is drawn over another page while its row says it is not open | **Yes.** `tracker/TrackerPage.tsx` l.150–151; `core.js` l.128–141 (`switchAsking` cleared in `finally`) | **Accepted** — the `trkask` row | §3.1; §3.2 (g); A8 |
| 14 | Opus 9 LOW · Fable L1 LOW | N11's door has a place; and the checker should not wait on it | **Yes.** `undo/timeline.ts globalUndo` (l.1163–1183): refusals ahead of `snap(entry, 'undo')`, `hooks.restoreRefusal`. Reading the entry for "removes the squadron in view": not traced | **Accepted** — the place recorded; step 6b | §4.1 rows 13, 21; §8.3 N11; §10; §14 |
| 15 | Opus 10 LOW | The closed note's "Open the Inputs page" is refused by the sheet it is on, in the held-war state | **Yes.** `leavewar/ui/ClosedNoteSheet.tsx` l.114 | **Narrowed — not mended.** The fix offered (close first) does not work: a sheet leaves the count in its effect's clean-up (`Sheet.tsx` l.487–490). He is not trapped; Build 2 removes the state | §4.1 row 22; §11 risk 20 |
| 16 | Fable L4 LOW | Steps 4 and 5 omit H8 from "Waits on" | **Yes** — of the revised §10 | **Accepted** | §10 |

**No finding was set aside; four were narrowed** — 3, 6, 11 and 15, each for the reason in its row.

**What this revision takes out, said so nothing is dropped quietly.** `ownSqnOf`, one function for doors and window
(row 2). The page door that answered true or false, and with it `bellTap`'s own ask-first line — its toast and
question are now inside the door's `then`, the stronger safeguard (row 1). The one row for all movable windows (row
4); "exported from the component's file" (row 10). N2's recommendation "it opens live where he is", by itself — it is
answer (b) or (c) of the one question, and the plan recommends (a); the page's A17 still shows the old one (§8). N6's
"blocks nothing in the code" (row 8). B25's second clause — "refused" where nothing changes squadron, a restriction
nobody ruled (row 12). P5's spy half, now A14 (row 12). **No test is dropped.** New: R5 (c); A12–A14; B26–B28; F0, F1b.

**What round 2 found sound** (the readers' explicit negatives).
- **The page door's coverage:** all sixteen `setPage` calls outside `store.ts` are as counted; every road by which the
  landing brings his own squadron back passes it; it refuses nothing that changes nothing (`perms.ts pageOffered` is
  false only with a squadron he only views picked); changes he did not make, sign-in and sign-out never pass it
  (Opus, Fable; Astra found no unlisted caller).
- **The doors:** every non-test caller of `enterSquadron`, `switchRoleView`, `switchRoleInForce`, `pickSquadron`,
  `enterForLine`, `openBellRequest`, `switchUnit`, `setUnitInView` is in §4.1; no key and no address picks or
  switches; no Undo is drawn on View-only Sched or Help (Opus, Fable, Astra).
- **The statements about today's code they tested hold** (Opus's list; Fable's pins P1, P2, B17, `core.js ask`,
  `saveRefused()`); the refusal stands before the Tracker's question inside `enterForLine` (Opus); "counted means
  drawn" holds for the movable windows, the pages that unmount off their tab, the top-level question sheets and the
  board's dialogs (Fable); leaving the Tracker's sign-out clean-up alone is the safer cut (Astra).
- N1, N3, N5, N7, N10 are each gated by a step; a "Not saved" that never clears is D2594, ruled with its cost told
  (Fable).

**What is still unproved** — §14 in full. What matters most: **this round's own new design has been read by no one**
(the door that runs what follows it, the checker's leave, part F's two functions, the `trkask` row); no finding of
either round was proved by a failing test; nobody has pressed N12, the row's "OIL?" button on 149's list, or the
held-war state of risk 20; and the readers did not read the Leave War sheets' or the Tracker's side pop-ups' bodies,
the stylesheets, or §5.5's "not traced" rows (Fable).

**The new size:** about 38 hours, an estimate (§13) — up from about 31 — starting only when the questions of §8 are
answered.

The third and last round of reads is kept for after the owner's answers to the page's A1–A20 are folded in — the host's call, 25 Nov 26.
