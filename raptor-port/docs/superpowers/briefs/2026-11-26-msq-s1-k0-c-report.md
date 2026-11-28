# Section 1 (the guard rail) — K0-C, the reader's report (26 Nov 26)

Read only, on `claude/msq-s1-guard-6ae5e1` at `3458632e1` (`main` in). No source or test file changed, no test run,
nothing built. K0-B's new files (`test-support/msq-world.ts` changes, `ui/msq-guard-*`) were left out of every search.
Every claim names its file and function; "needs a press" says what K0-P should press.

---

## 1. The census (§10 step 0 (d), §14)

### The counts, again, on this branch

Searched every `*.test.*` and `*.spec.*` file under `src/` and `e2e/` for the press itself (`pickSquadron(`,
`switchRoleView(`, `switchRoleInForce(`, `#sqnMenuBtn`, `#drawerSqnBtn` / `#drawerSqnList`, `#roleBadge`, `#drawerRole`;
for the bell: `openNotice(`, `openBellRequest(`, `enterForLine(`, `bell-line-`), then read each hit.

- **A pick or the view switch: 39 files press one — the plan's 37 and its two browser tests, unchanged.** The search
  matches 41: `leavewar/rolerestore.test.ts` names `switchRoleView` only in a comment (l.52) and presses nothing;
  `ui/msq-sqnlist-escape-over-input.test.tsx` (added 24 Nov) opens the Schedules list over an Input window and presses
  Escape, never a pick (helper `openList`, l.45) — no door of the guard is pressed, so it stays as today; listed below
  for the record.
- **A bell line or tap: 14 files press one — the plan's 13 and `leavewar/sans-unfiled.test.ts`** (added 23 Nov, it came
  with `main`): it taps his own SANS reminder (`openNotice`, l.196, l.263) with nothing open — the reminder's road of
  row 9b / B7b, whose door K6 builds. A fifteenth match, `ui/msq-bell-show.test.tsx`, only reads a line's
  `data-testid` (l.115) and presses nothing.
- `main`'s merge added no other file to either list (`git diff 83b3d9f7f 3458632e1 --stat -- raptor-port/src` shows
  only the four files of item 4; `ui/board-heldpanel.test.tsx` presses no pick, switch or bell line).

### The tests whose set-up presses with something open

"Open" is read as the guard will read it (§3.2): a counted window, a changed row, a failed save — and, because the
view switch asks the Tracker's question after Build 1 (D2627 A20, §4.2 step 4), **unsaved chart edits at the view
switch**. Unsaved chart edits at a pick are not listed: the question is asked there today and still is.

| File | Test (line) | What is open at the press | What the test proves | Kind |
|---|---|---|---|---|
| `ui/msq-pick-windows.test.tsx` | "picking 149: held on 142's war, the band's words…" (l.55) | a Leave War window (`<Sheet>` with typed words) | the pick's band "This is 142's. You picked 149 — close this to go on.", controls greyed | (b) |
| same | "picking 142 again gives the window back as it was" (l.70) | the same | the pick back undoes the hold | (b) |
| same | "Close closes it, and 149's war loads" (l.95) | the same | the band's Close finishes the pick | (b) |
| same | "a View holder picks 149 with his window open: its ✕ closes it and he lands…" (l.121), "…with two windows open the landing waits for the last" (l.129) — helper `viewHolderOnWar` | a Leave War window, on his Leave War | the landing on View-only Sched held by the window (D2381) | (b) |
| same | "a View holder's window at a pick of 149 wears the pick's band…" (l.142) | the same | the pick's band for a View holder | (b) |
| same | describe "a Leave War window left open at the switch to the member view (D2389)": l.171, l.182, l.191 (the person window's boxes), l.207, l.213 (pin: then a pick), l.220 (control: Plan lowered after) — helper `on149` | a Leave War window, then the view switch | the member view's band "Member view." and its words; l.220 proves which words win when a right is lowered over that band — its premise is the member-view hold, unreachable after Build 1, and the lowered-right half alone is already l.79 | (b) |
| same | "(pin) an admin on his own squadron switching to the member view: no hold, no band, as today" (l.235) | a Leave War window on his own 142 war | the switch goes through with no band | **(c)** — after Build 1 the switch is refused (the window counts: `where` the Leave War, the page shown) |
| same | "Fable 1: an input window opened on 149's Inputs stays held through the member view's landing…" (l.259), "the member view over an Input window on 149…" (l.277) | an Input window (saved input) on 149's Inputs | the member view's band over the Input window | (b) |
| same | "a View holder picks 149 with an input window open on his Inputs…" (l.307) | an Input window on his own Inputs | the pick's band over View-only Sched | (b) |
| same | "a Plan holder's window held at a pick of 149 stays held through an Undo and a Redo; 142 picked again gives it back" (l.360) — helper `heldPlan` | an Input window | **the hold's note survives an Undo and a Redo** | **(a)**, but for its last line ("142 picked again gives it back"), which has no midnight twin — that half is (b) |
| same | "a View holder's window held over 149's View-only Sched stays held when its record is put back as a new object" (l.376) | an Input window | the note survives its record becoming a new object | **(a)** |
| same | "another input asked for over the held window's unsaved words: the window keeps the first, and stays held" (l.393) | an Input window with a typed remark | "one editor at a time" keeps the hold | **(a)** |
| same | "(control) a different input opened in the held window takes a fresh note: not held" (l.409) — `heldPlan` | an Input window | a different input is judged afresh | **(a)** |
| same | "picking 149: the band's words, every control greyed and dead, Add saves nothing…" (l.422) — `openNew` | a new input's window with words | the pick's band over a new input | (b) |
| `ui/msq-night-held-input.test.tsx` | "the way back stands over the shade at the chip's own place…" (l.54), "the form keeps its PERSON line and the note it had, as drawn" (l.71) — helper `held` | an Input window with typed words, then the view switch | the role chip pressable above the held window's shade | (b) — §10 step 4 already names these ("the tests of the Input window's own chip… on the checker's allow-list by name in step 6") |
| same | it.each "%s: its boxes and its Document button stay locked under the band" (l.85) | an Input window, a pick, then the switch twice | nothing comes live under a pick's band through the member view | (b) |
| `ui/msq-pick-swap-question.test.tsx` | "a pick of 149, then 'Discard and open'…" (l.52), "…and 142 picked again gives the first window back…" (l.71) | an Input window with typed words and its "Open the other input and lose them?" question up | the question goes with the pick; the held window keeps the first input | (b) |
| `ui/msq-view-only-menu.test.tsx` | "Opus F1: an open Leave War window holds the landing until it closes, then View-only Sched" (l.186) | a Leave War window (through `setWarWindowsProbe(() => 1)`), then the switch | the member view's landing waits for the window | (b). K1 should check the guard's `lwsheet` row reads through the same probe, or this test will not see the refusal it meets |
| `tracker/msq-trk-follows-pick.test.tsx` | "a question open on 142 at the pick is gone, and its job writes nothing into 149" (l.191) | a Tracker question (`C.addCourse` → `C.dlg`, the "New course name" prompt) | a pick closes the question; nothing lands in 149 | **(c)** — `dlg` is a `window` row: the pick is refused |
| same | "an import running at the pick stops: nothing of its file lands in 149" (l.210) | a Tracker box (`C.importClick` → "That file is not readable as JSON.", `C.dlg`) | the import stops at the pick | **(c)** — refused while the box is up |
| same | "a mark pressed in the same moment as the pick is saved in 142 alone" (l.225) | the marking window (`C.openPop`), a grade pressed | the grade lands in 142 | (c) at most: on E2's answer the marking window closes by itself and the pick goes through, so it should stay green — watch it at K4 (the close now runs before the entry, `closeShown`, while `popGrade` is still in flight) |
| same | "the chart editor, its dialogs, the marking pop-up and every open window close at the pick" (l.443) | in turn: Edit chart layout (a mode), the marking window, Show All | each closes at the pick | **(c)** for the Show All half — `showAllOpen` refuses unless E9b's answer lets it close (item 6); the first two halves go through as today |
| `tracker/msq-trk-pick-ask.test.tsx` | "the member-view switch is not a pick: it asks nothing and keeps the edits" (l.233) | unsaved chart edits on 149's Tracker | the switch asks nothing | **(c)** — after Build 1 the switch asks (D2627 A20) |
| `tracker/msq-trk-follows-pick.test.tsx` | describe "the member view": "unsaved edits on 149 at the switch: the Tracker keeps them, its band says how to get back…" (l.348); "held on 149 in the member view, a pick of 142 asks about the edits first" (l.373) | unsaved chart edits, then the switch | the held draft in the member view and its cover "This is 149's Tracker. Leave the member view to open it." | l.348 **(c)** (the switch now asks); l.373 (b) — its premise, a draft held in the member view, can no longer be made by the switch |
| `tracker/msq-night-memberview.test.tsx` | every test built on `heldDraft` (l.107, l.124, l.140, l.155, l.169, l.180, l.202, l.226, l.236) | unsaved chart edits, then the switch (`heldDraft`, l.71–84) | what a press does over a draft held in the member view | (b) — the premise is unreachable by the switch after Build 1. Whether a draft can still be held in the member view by another road (his move at midnight) is **not settled from the code** — K5's builder reads `core.js` for it before re-pointing or retiring these |
| `tracker/msq-bell-input-ask.test.tsx` | l.107, l.122 (helper `heldDraft`, l.91) | the same held draft, then a bell line | the Tracker's question before a bell line's window | (b) for the premise; the question itself stays (F3) |
| `tracker/msq-bell-recheck-after-ask.test.tsx` | the tests on its `heldDraft` (l.98–100) | the same | the second ask after the question | (b) for the premise; §5.6 F3 names this file "green unchanged" — that cannot hold once the switch asks: the set-up must change in K5 |
| `tracker/msq-night-press-held.test.tsx` | it.each "${press.name}: its lift raises no unseen box and saves nothing" (l.111) | Edit chart layout with a drag held, unsaved chart edits, then the switch | the hold ends the press | **(c)** — the switch now asks first (the question's own ending of a press, `notePress`, is what then applies) |
| `state/msq-trk-cover.test.tsx` | "the Tracker's own Undo and Redo… offer nothing while it is covered" (l.80), "Hunter with Plan of 149, his Tracker held on 149 for unsaved edits, taps into the member view and back (the drawing f2c)" (l.120) | the Tracker held for unsaved edits — **made by a probe** (`setStorageHeld(true)`, `setTrkUnitProbe`), not by real chart edits | the cover's words | (b) in meaning; whether the switch's new question fires here is **not settled from the code** — it asks `core.js` (`sylDirty`), which this test never sets, so it may stay green as written while proving a state the app can no longer reach |

**Not in the table, read and cleared** (something on screen at the press, but nothing the guard counts, or no change of
squadron): `e2e/insights.spec.ts` MENU04 (the Schedule Insights menu, a list); `ui/schedule-insights-menu.test.tsx`
l.61 (Jump to a date, which closes itself); `ui/msq-users-filter.test.tsx` l.233 (the search box — typing in no
window, a `'no'` row, H13); `ui/bellnotices.test.tsx` "a tap on a line opens the input and marks that line read" (l.555 —
the second tap opens the bell's list over his own squadron's Input window: no change of squadron, as today, P16);
`tracker/msq-night-gestures.test.tsx` l.109, l.122 and `tracker/msq-night-export-abort.test.tsx` l.63 (an Export in
flight — the test calls `saveCopyClick` without opening the Copy window, so nothing counted is open; in the app the
Copy window would be up and the pick refused, so its only road left is his move at midnight); `tracker/msq-trk-*`,
`msq-night-press-undo`, `e2e/msq-job2.spec.ts` l.107 (unsaved chart edits at a **pick** — the question, as today).
Every other file of both lists presses with nothing open.

### For kind (a): the road that still exists

The four kind (a) tests are all `ui/msq-pick-windows.test.tsx`'s second describe. The road is **his own move at
midnight with the window open** — the shape of `ui/msq-fix-sched-windows-midnight.test.tsx` ("the window stays with the
band, its Person list stays 142's…", l.57). Two things for the builder: (1) their `stillHeld` asserts the pick's lead
"This is 142's." — re-pointed, they must assert the midnight band's own words (`state/store.ts heldWindowBand` /
`heldWords`); (2) l.360's last step, "142 picked again gives it back", has no midnight twin (a move does not reverse) —
that line goes with the kind (b) tests.

---

## 2. §5.5's last column — the rows "not traced", read in the code

| Door | Answer from the code | Why |
|---|---|---|
| **A card of a SANS day** (`ui/SansDay.tsx SansDay`, `open`, l.87) | **No.** | The day lists `inputsOnDay(u, iso)` with `u = pageUnit('own', todayIso())` (l.78) — only inputs whose named man is that squadron's on that day (`engine/inputs.ts inputOnDay`). It has no "names him" clause, so his own input of another squadron is never on it. |
| **The OIL question after a save on the schedule** (`ui/inputedit.tsx askOilIfPending`, now l.2010; opened at l.2024; callers l.1831, l.2087, `ui/reqdoor.ts` l.180) | **No.** | Each caller has just changed an input from a row of the squadron in view's schedule (a drop, a reassign onto a man's row, a time typed in the row), and asks of that same input found again by its id. The week and the board draw only inputs belonging to the squadron in view on that day (`engine/inputs.ts inputsOn`, `inputBelongs(inp, UNIT, at)`), and a reassign moves it onto a man on that schedule's row, so after the change it still names a man of the squadron in view. |
| **A chip or puck on the week or the board** (`ui/interactions.ts` l.1397, moved from l.1389) | **No**, but for a frozen (published) day. | The label (`ui/html.ts inpEditLabel`) is drawn only for inputs of `inputsOn(dt)` — the squadron in view's. On a frozen day `inputsOn` hands back the issued copy, while the door opens the **live** record (`INPUTS.find(… inpId …)`, then `rowInputOf`); the two can differ only after a change he did not make (another admin's, or a move moved). Needs a press only if the builder wants that corner closed. |
| **The OIL question of what was just filed from the Leave War** (`leavewar/sync.ts askFiledOil`, now l.876; opens at l.888) | **Only with the war held** — the same answer as the clash note's row. | The input is filed for men picked on the war's grid (`inputRowFor`, l.854), the war's world being `worldUnit()` (`leavewar/state/store.ts`), which follows the squadron in view except while the war is held. The window's page squadron is the squadron in view (`ui/InputWindow.tsx`: not on Inputs, so `pageSqn = UNIT`). Press to confirm: Hunter with Plan of 149, 149 picked, on the Leave War: file an OD on a Saturday for a 149 man — the OIL question's window should read 149 and be live. |
| **"Edit input" in the document viewer** (`ui/DocViewer.tsx edit`, l.130) | **As the list it was opened from** — confirmed. | "Edit input" is drawn only where the viewer was not opened read only (`ro`, l.128). Its openers: the Inputs list and calendar (`InputsPage.tsx` l.801, l.941; `InputsCal.tsx` l.1191 — the page's own list, so the answer of the first row), the open Input window (the same input), and Medical (`MedicalView.tsx` l.212 — the Medical page's own rows; not read further). The Leave War's openers are read only (`leavewar/sync.ts` l.4799, l.4820): no "Edit input" there. |

### The home-page row — his own input of a squadron he moves to, on his home page

**Yes, they differ, and today the window opens live there.** Saber (home 142, a move to 149 saved for 1 Dec) files
leave for 5 Dec on 142's page:
- It is listed on 142's page by the list's "names him" clause (`engine/inputs.ts inputsListed`, l.206: `holds(r, p)`).
- Opened, the window's page squadron is his home, 142 (`ui/InputWindow.tsx`: `ownNow` true on Inputs, l.201;
  `pageSqn = pageUnit('own', todayIso())`, l.224); the input's own squadron is 149 (`inputUnitOf` — the first named
  man's home on its first day, `engine/inputs.ts` l.214); its Person list offers 149's men (`pickUnit`, l.962).
  `held` compares only the page's squadron when opened with now (l.232), so it is live — as F18 pins.
- The input touches **only** 149 (every day of it is after his move), so a reading of `inputSqn` as F0 states it ("an
  input naming men of both, the page 149 → 149"; his own 142 input on 149 → 142) answers **149 on a 142 page** — and
  the root (K10) would grey a window on the very page he filed it on.
- **Who meets it:** anyone with a move saved ahead who files for days after it — a member as much as a Plan holder or
  a master admin (`pageUnit('own')` is his home for each). It lasts only until the move takes effect at midnight, when
  his home becomes 149 and the page and the input agree. An input that spans the move touches both and answers the
  page's, so it is not hit.
- **So:** K10's root needs one more case beside `letOpenOn`'s — "his own input, on his own home page" — or `inputSqn`
  must answer the page's squadron wherever the page is his home that day and the input names him. That is a design
  choice for the orchestrator; if it changes what he sees (a greyed window, words), it is a question for him.
- **Needs a press (K0-P):** no screen moves a man yet, so the move must be made through the app's own door from the
  probe bridge (`moveMan`, as F14 does); then signed in as Saber on 142's Inputs page, file OL for a day after the
  move, open it from the List: the window live, its Person list 149's men, the bar 142. The same as a member (Ranger)
  with a move saved ahead.

---

## 3. The saver's end (N14, now step K4a)

Read: `storage/postman.ts` (the whole class), `storage/savewait.ts`, `ui/savestatus-source.ts`, `ui/SaveStatus.tsx`,
`storage/boot.ts` (`chooseBackend`, `guardUnload`), `storage/browser.ts` and `storage/memory.ts` (`putMany`), `main.tsx`,
`ui/Login.tsx`, `ui/logout.ts`, `ui/pageload.tsx`, `tracker/storage.js` (`setSaveHealth`, `saveHealth`).

**How long can a send stay "saving"? For ever — but only with a store that can hang, and the app has none today.**
- `Postman.status` (l.55) answers `'saving'` while `inflight` is set and no failure is counted. `send()` (l.100) sets
  `inflight` and clears it only when `backend.putMany` settles (l.120). Nothing times it: no timer, no abort.
- The stores the app ships with cannot hang: the browser's (`storage/browser.ts putMany`, l.74) writes in one
  synchronous block inside an `async` function — it either throws or finishes in the same turn, so "saving" lasts one
  microtask; the memory store (`storage/memory.ts`, used in development, every test, `?fresh` and `?nostore`) waits only
  `latency`, 0 unless a test sets it. **So today no send ever hangs; K4a's "set time" would never fire in the app as it
  is — it is ground for the database step (the Dataverse store, `storage/backend.ts` "stage 4").** B20's "a save that
  never answers" can be made only by a test store whose `putMany` never settles.
- **What ends it today:** only the store's own answer. If it never comes: `inflight` stays; every later change waits in
  `pending` (a new send is not started — `send()` returns the running one, l.101); status stays `'saving'`.

**What else a hung send would do today (each a reader of the saver, each changed by K4a):**
- **Retry and sign-out would wait for ever:** `retrySaves` (`ui/savestatus-source.ts` l.31) and `flushSaves`
  (`savewait.ts`) call `flush()`, which first `await`s the running send (`postman.ts` l.72). So `logOut`
  (`ui/logout.ts` l.35, `await flushSaves()`) would never finish. K4a's give-up must also release `flush()`, or sign-out
  stays stuck.
- **The page could be closed with no question:** `guardUnload` (`storage/boot.ts` l.131) asks "Leave site?" only for
  `'failed'` or `'unsaved'`; while a send is in flight the status reads `'saving'` even with newer changes waiting
  behind it, so nothing is asked and those are lost. (A fault only once a store can hang; today it lasts a microtask.)
- **Sign-in stays held** with "not saved yet" never shown (`ui/Login.tsx` l.66–90 waits on `saveSettling()`).
- **The Tracker's corner** reads the same status (`tracker/storage.js saveHealth`, l.138).

**What a refused save sets, and what Retry resends.**
- A refused `putMany` (`postman.ts` l.110–118): the group that failed is put back **under** whatever changed meanwhile
  (newer values win), `failures` goes up, and a retry is set for 1 s, 2 s, 4 s… up to 30 s (`maxBackoffMs`), for ever.
  `status` is then `'failed'` — and stays `'failed'` while a retry is in flight (l.56 checks `failures` first). The band
  "Not saved — keep this page open" with Retry reads that (`savestatus-source.ts readBand`, `SaveStatus.tsx`).
- **Retry** = `flush()`: the waiting retry's timer is dropped, the running send awaited, and everything waiting sent at
  once as one group — the failed changes with every later one, each record's newest value. It adds nothing to the Undo
  list: the saver sits below the changes and never writes history. (For K0-P's question "what a Retry that lands leaves
  on top of the Undo list": from the code, nothing new — the top stays the last change he made. K0-P presses it.)

**An answer that arrives after the saver gave up — what would apply it?**
- **In the app's own memory, nothing:** the saver never writes the answer back into the app's data — the changes are
  already in memory, never rolled back. So nothing in the app can be "written twice" by a late answer.
- **But the saver's own bookkeeping would be corrupted** unless K4a guards it: the send's closure, when it finally
  settles, sets `this.inflight = null` and, on success, `this.failures = 0` with no check that it is still the current
  send (l.120–123). After a give-up and a Retry, a late answer to the **old** send would clear the **new** send's
  in-flight mark (two groups in flight — the one-at-a-time rule broken) and could clear the failure while Retry's send
  is still failing (the band would read saved when it is not). K4a needs a per-send number (or the like) so a late
  answer changes nothing.
- **Resent twice by Retry:** the store's contract is records by key (`storage/backend.ts`), so the same group sent
  twice writes the same values twice — harmless; change-log batches are keyed by their own id (`<clientBootId>-<seq>`,
  `storage/client.ts`), so they do not double either.
- **Applied over a later change: the postman alone cannot promise this.** If the old group is applied by a remote store
  **after** Retry's newer group, its older values overwrite newer ones. Only the store can stop that (a version check on
  each record, a request the store refuses once replaced, or an abort the store honours). With today's stores the case
  cannot arise (they cannot hang); for the database step it must be part of the store's contract. **This is the thing
  to report before K4a is built** (the plan's own words: "anything it cannot promise is reported before it is built").

**Waits the app already has that a "set time" could follow:** the postman's own longest retry gap, 30 s
(`maxBackoffMs`, `postman.ts` l.42) and its 300 ms gathering wait; Retry of a failed page download gives up after 20 s
(`ui/pagedownload.ts FRESH_FILES_MAX_MS` — "how long Retry waits for the files, all told, before the card comes back",
the nearest in kind: a network wait on a weak signal); the reload held back after 10 s (`RELOAD_HELD_MS`); the page claw
3 s (`ui/pageclaw.ts PAGECLAW_WAIT_MAX_MS`). The length is the section's call (§21.1 Q9); 20 s is the app's precedent
for "a network wait gives up".

**Who else reads `saveSettling()` / `saveRefused()`:** only `ui/Login.tsx` (the sign-in's hold, l.66, l.79–80, l.123).
`saveWaiting()` is read by `ui/logout.ts` (l.36) and `ui/pageload.tsx` (l.94); `onSavesLanded` by `ui/logout.ts`
(l.47); the raw status by `storage/boot.ts guardUnload`, `ui/savestatus-source.ts` (the band) and
`tracker/storage.js saveHealth`. The guard will be the third reader of `saveSettling`/`saveRefused` (§3.2 (j), §4.2).

---

## 4. What `main` changed under `src`, against the plan

`git diff 83b3d9f7f 3458632e1 -- raptor-port/src`: four files, all from pull request 843 (chat 183's "r4 walk faults",
merged on `main`).

- **`ui/toast.ts`** — one property, `overflow-wrap:anywhere`, added to the note's style line in `toast()` (l.186).
  `placeToast()` (l.86–110) is unchanged and `toastAt` does not exist yet, so §4.6's "today" stands. §9 already promised
  to keep that property. One knock-on for K3: an anchored note on a desktop has no width cap of its own, and the new
  property only stops a long word from widening it — the plan's 8px clamp inside the screen's sides is still needed.
- **`ui/SchedBoard.tsx`** — `put` (in `SchedBoard`, l.449–470) now writes every section of the board's day but the one
  holding the caret (a `panelKids` ref, l.380; `swapKidsAround`); the settled-paint effect paints when the caret moves to
  another section (l.394–401, `owesBeside`); the Blue/Red question is put back inside `holdingPlace` (l.534). **Nothing
  touches the board's bell (`#sbBell`, l.800) or its two dialogs.** Their lines moved: `CxDialog` l.901 (`open` l.907,
  `useSheetFocus` l.916), `SortAllDialog` l.998 (`open` l.1001, `useSheetFocus` l.1008) — **§3.2 (c)'s "l.880, l.974" are
  now l.907 and l.1001.**
- **`ui/dayswap.ts`** — new exports `swapKidsAround`, `owesBeside`, `kidsOfHTML`, type `PanelKids` (l.181–231). The plan
  does not touch this file.
- **`ui/board-heldpanel.test.tsx`** — new, 243 lines; presses no pick, switch or bell line (not in the census).

**Where the plan's "today" has moved:** §9's row for pull request 843 says "open" — it is merged and in this branch. Its
promise ("leaves `put`, the panel's redraw and those helpers alone, keeps the note box's `overflow-wrap`, changes
`toast.ts` only in `placeToast` and `toastAt`") still holds as a rule for this build, but "message that chat first" and
"whichever lands second brings `main` in" no longer apply: a line needed in `SchedBoard.tsx` beyond its bell and two
dialogs is now an edit of `main`'s own code, read again first. Nothing in the merge changes what the guard reads.

---

## 5. Quals' Done, and 150's "+ Input" Person list

**Quals' Done with words left in "Add qualification"** (`ui/QualsPage.tsx`):
- The box is `newQual` (l.317), drawn only while `canEditQuals()` (admin, Edit on, Edit quals on — l.499, l.1187).
  Only Add or Enter uses it (`addQual`, l.548), which empties it (l.568).
- **Done** (l.1156–1157) sets Edit, Edit quals and the armed delete off and says "Quals saved" — **it does not clear
  `newQual` and does not add it.** The words vanish from the screen (the row is no longer drawn) but are kept in the
  page; nothing is said about them, and "Quals saved" is said though the qualification was not added. "✕ Edit quals"
  (l.1169) does the same.
- **Where they go:** Edit, then Edit quals, again while the page is still showing brings the box back **with the same
  words in it** — after a pick too, since the page stays mounted across a pick, so "LOW LEVEL" typed on 142 would sit in
  149's box. Leaving Quals for another page drops them (the page is drawn only while it is shown — `ui/Shell.tsx`
  l.690). So this is the same "carried to 149" fault as the plan's G1 names, by Done rather than by the mode's end.
- For K0-P: signed in as Saber on 142's Quals: Edit → Edit quals → type "LOW LEVEL" → Done → pick 149 → Edit → Edit
  quals: the box should read "LOW LEVEL".

**150's "+ Input" Person list** (`ui/InputWindow.tsx`, `ui/PeoplePick.tsx`, `ui/inputedit.tsx`):
- The List's "+ Input" seeds `person: me()` and `_ctx: 'i'` (`inputedit.tsx newInputSeed`, l.1045–1050). On 150's
  Inputs page for a master admin the window's squadron is 150 (`state/perms.ts pageUnit('own')`, l.288: the pick, for a
  master admin or a Plan holder of it).
- The list (`PeoplePick`, l.220–226) offers, in order: **the seeded man if he is on no list — the presser himself,
  Saber, of 142** (l.222, "a man no longer on the list still reads as himself" — it takes no squadron check); the two
  placeholders; 150's men on its roster that day (`pickRoster` → `inputedit.tsx rosterOptions`, l.66: not archived);
  then **a "Posted out / archived" group of 150's archived men** (`InputWindow.tsx archivedHere`, l.982 →
  `archivedOptions`, l.74: archived, not deleted or special), drawn for a new input on the Inputs page (`ctx === 'i'`)
  by an admin.
- **So yes:** on a squadron not his own, it offers **the presser himself** (another squadron's man) and **that squadron's
  archived men**. No other squadron's man can appear (the rosters are by home that day, `engine/roster.ts rosterOf`).
  The archived group is by design (D729 — clearing leave is filed for a man who has posted out); the presser at the top
  is the fault C2 (§18.6) closes. Whether the whole-draft check (`offers`) would then refuse Saber at Add was not
  traced — it does not filter the top line.
- For K0-P: Saber, 150 picked, Inputs, "+ Input": read the Person list top to bottom (with an archived man of 150 in the
  world if there is one).

---

## 6. E9b's list — the windows and sheets he was never shown singly

For the owner, in plain words. Each with the name the screen shows, what it holds, and whether anything in it can be
typed, ticked, chosen or left half done. "Only shows things" means a close loses nothing.

### The Leave War's windows (23 in all — `leavewar/ui/`, each `<Sheet …>` call)

**Only show things — nothing to type, tick or leave half done:**
1. **"Leave filed on the Inputs page" / "OIL the app credited"** (the man's name and the day at the top —
   `BidPicker.tsx RaptorSheet`): what is on that day, where it came from, its papers. Pressing a paper opens it; nothing
   else.
2. **"Your OIL award"** (name and day at the top — `BidPicker.tsx AwardSheet`): where the award came from, the reason,
   who gave it, the days. Nothing to press but ✕.
3. **"Open for bidding", for a member** (`OpenDatesSheet.tsx`): the months and stretches open to him. A member gets no
   controls. (For an admin it is not show-only: see below.)
4. **A person's window — another man's, or his own while the figures are locked** (his name at the top —
   `PersonWindow.tsx`): leave figures and his leave, by year. Only the year can be chosen (a view choice, saved
   nowhere). Where he may type figures — an admin any man's, a member his own while unlocked — it is not show-only.
5. **"OIL TRACKER", for a member** (`OilTracker.tsx`): one row a person, credits and what was taken. He can only change
   which months are shown.

**Hold something he could lose — not show-only:**
6. **"Bidding is closed" / "Your pending bid"** (name and day at the top — `ClosedNoteSheet.tsx`): files a course or
   duty straight away; with a pending bid, its note and papers can be **typed** (kept only when the window closes).
7. **A day's list** (name and day — `DayList.tsx`): every record on one man's day, each with its own buttons; an admin
   can open an OIL award's **Reason, Given by and Days boxes** and leave them half typed.
8. **"<counter> — what this row counts"** (`ManningSheet.tsx`): the rule in words, and for an admin **two number boxes
   with Save** — can be left half typed.
9. **"EVENTS"** (`EventsSheet.tsx`): the list of events. Nothing to type, but a ✕ can be **armed** ("press again to
   delete") and after a delete an **Undo** note stands in the window.
10. **"Open for bidding", for an admin**: each month tap saves at once, but the exact-days calendar can be left with
    **a first day picked and no last day**.
11. **"SETTINGS"** (`SettingsSheet.tsx`): groups, colours, the who-wins order — each saved as pressed; a colour strip
    can be left open. Nothing typed.
12. **"OIL TRACKER", for an admin**, and **"OIL TRACKER — settings"**: an admin can open a credit's **Days, Reason and
    Given by boxes** and leave them half done; the settings chips save at once.

**Plainly forms — they refuse (as round 2 had it):** "Place a bid", "Posted out" and "Posted in" (a date box; Post out's
Delete asks twice), "Edit event" and "PRESETS", "New counter" / "Edit <counter>", "Grades", "Edit the note on this
leave", "Rename <figure>", "Required figures for the picked days", "Selected days", "NEW LEAVE WAR".

### The Tracker (§3.2 (g) — `tracker/components/`)

- **"All events — name, crew & prerequisites"** (Show All — `ShowAllPanel.jsx`): every event's details, a filter box,
  and an **Edit** on each row that opens Name, Type, Hours, Crew and Prerequisites boxes, **saved only by Save** — can
  be left half typed. Not show-only once a row is being edited; with no row open, only a filter (saved nowhere).
- **"Failures — <student>"** (the fail log — `SidePanel.jsx FailLog`): a list. Only shows things.
- **"Down days — <student>"** (`SidePanel.jsx DownLog`): a list and a total. Only shows things.
- **"Set lull period — <student>" / "Change lull period — <student>"** (`SidePanel.jsx LullCalendar`): a calendar; it
  can be left **half done — the first day picked, "now pick the last day"**. Escape closes it without saving.
- **"Copy <student>'s lull periods to"** (`SidePanel.jsx LullCopy`): a tick list of the other students, saved only by
  Copy — **ticks can be left unsaved**.
- Both lull pop-ups lie on a shade over the whole screen (`tracker.css` l.563, `.lullback` fixed over everything, above
  the top bar's layer: z 69 against the bar's 60). Neither holds the keys inside it (no focus trap in `SidePanel.jsx`;
  `core.js` l.6756–6757 handles Escape only), so **whether Tab can reach the Schedules button behind the shade is not
  settled from the code — K0-P presses it** (signed in as Saber on 142's Tracker, Info tab, a student's lull: open "Set
  lull period", pick a first day, then Tab until the focus is on the top bar's squadron button and press Enter).

### The schedule board's two boxes (§3.2 (c) — `ui/SchedBoard.tsx`)

- **"Cancel <line>" / "<Line> is cancelled — reason"** (`CxDialog`): a **reason box**, saved only by "Cancel line" /
  "Save reason"; an admin can also edit the quick reasons. Can be left half typed.
- **"Sort all — <day>"** (`SortAllDialog`): a yes/no question, Cancel or "Sort all". Nothing typed; nothing lost if
  closed.

**So the windows that only show things are:** the two read-only Leave War windows (1, 2); Open for bidding, a person's
window and the OIL tracker **as a member sees them** (3–5); and the Tracker's Failures and Down days. Every other one on
this list can hold something typed, ticked or half done.

---

## Findings that change the plan or need his answer

1. §5.5's home-page row: confirmed — his own input dated after a saved move is the new squadron's alone and opens live
   on his home page today; F0's `inputSqn` would grey it there (K10 needs a second case, or the owner's word).
2. N14: no shipped store can hang today, so K4a's set time never fires until the database step; a hung send would also
   freeze Retry and sign-out (both wait on the running send) and let the page close unasked — K4a must release `flush()`.
3. K4a: the saver's closure would corrupt its own state on a late answer (needs a per-send number); and "never applied
   over a later change" cannot be promised by the saver alone for a remote store — report before building.
4. Census kind (c) the plan did not name: the Tracker question (l.191), the import box (l.210) and Show All (l.443) at a
   pick; the switch with unsaved chart edits (trk-pick-ask l.233, follows-pick l.348, press-held).
5. The member view's held-draft tests (night-memberview, bell-input-ask, bell-recheck-after-ask) lose their premise once
   the switch asks; §5.6 F3's "recheck file green unchanged" cannot hold.
6. Quals' Done keeps the typed qualification hidden and says "Quals saved"; it reappears on 149 after a pick.
7. 150's "+ Input" offers the presser himself (a 142 man) and 150's archived men; the first is C2's fault, the second is
   by design (D729).
8. E9b: only 2 Leave War windows only show things for everyone; 3 more only for a member; the Tracker's Failures and
   Down days — the list above goes to him.
9. The lull pop-ups have no key trap: a pick by Tab is not ruled out — K0-P presses it.
10. §3.2 (c)'s line numbers for the board's two boxes moved (l.907, l.1001); pull request 843 is merged, not open.
