# Section 1 (the guard rail) — step K3, the builder's report: the note's words, and where it stands (chat 204, 26 Nov 26)

Built to `2026-11-26-msq-s1-k3-brief.md` with the orchestrator's eight additions. **No caller:** no door asks the guard
or raises the note yet, so the app behaves exactly as before. Nothing committed or pushed.

## The words table as built (`src/ui/guard.ts`)

"Blocked: " + lead + ", then " + ending. Constants `GUARD_LEADS` and `GUARD_ENDINGS`; the tests read every sentence
from them.

| The lead — which row refuses | Constant | Words as built |
|---|---|---|
| any `window` row in sight (default) | `GUARD_LEADS.window` | close the open window |
| `lwsheet` with its page out of sight | `windowOnLeaveWar` | close the open window on the Leave War |
| `trk` with its page out of sight — and behind the Flow chart tab (`behind: 'info'`, see Words owed) | `windowOnTracker` | close the open window on the Tracker |
| `trkask` | `window` | close the open window |
| `userrow`, `archrow`, `sqnmove`, `placeedit` | `row` | save or cancel the open row |
| `userrow` / `archrow` with another Admin section showing | `rowOnUsers` | save or cancel the open row on Users — read live since the review round (`usersOutOfSight()`) |
| `giveaccess` | `giveAccess` | finish or cancel giving access |
| `newsqn` | `newSquadron` | save or cancel the new squadron |
| `addperson` | `addPerson` | add or cancel the new person |
| `qualsnew` | `newQual` | add or clear the new qualification |
| `holiday`, new | `holidayNew` | save or cancel the new holiday |
| `holiday`, changed | `holidayChanged` | save or cancel the changed holiday |
| `holiday`, new, kept waiting for a leave period | `holidayNoLeave` | cancel the new holiday, or create its leave period |
| `everywd` | `everyWeekday(title)` | save or cancel “Every Monday” / “Every Tuesday” … (curly quotes) |
| `holimport` | `sheetHolidays` | add or cancel the sheet’s holidays (curly apostrophe, as `words-s1.mjs`) |
| `inputsset`, in sight | `inputsSettings` | save or cancel Inputs calendar settings |
| `inputsset`, under the Calendar | `inputsSettingsUnderCal` | close the Calendar, save or cancel Inputs calendar settings |
| `sansset`, in sight | `sansSettings` | save or cancel SANS calendar settings |
| `sansset`, under the Calendar | `sansSettingsUnderCal` | close the Calendar, save or cancel SANS calendar settings |
| `unsaved` | `retry` | press Retry to save your changes |

| The ending — door | Constant | Words |
|---|---|---|
| `pick` (to a squadron) | `GUARD_ENDINGS.pick(num)` — `unitById(to)?.num` | pick 149. |
| `toMember` · `toAdmin` | `toMember` · `toAdmin` | switch to the member view. · switch back to the admin view. |
| `line` | `line` | press this line again. |
| `bell` | `bell` | press the bell again. |
| any other door (`card`, `page`, `undo`), or a pick to a squadron with no number | — | `guardWords` returns null and `guardSay` raises nothing — the table is left open to K8's and A18's endings, neither built |

Two rows at once: `whatIsOpen()` gives the first in `GUARD_ORDER`, and the words are that row's (tested: a half-done
holiday before changed Inputs settings; a window before a row before Retry).

## Words owed — the most important part

**As it stands after the orchestrator's review round, three cases are still owed:**
- (a) a Tracker window behind the Flow chart tab — item 1;
- (b) `newsqn`, `sqnmove` and `placeedit` with Users showing (item 3), and `addperson` and `giveaccess` with Squadrons
  showing (item 5);
- (c) `trkask` — no press reaches it in jsdom; only a browser can confirm the stylesheet half (item 2).

Items 4, 6 and 7 below are kept for their steps and findings; none of them is a case owed to him.

Two things hold for every case below:
- **No door raises the note yet.** In the running app nothing shows a note until K4–K6 connect the doors, so a drawer
  using these steps gets the state, not the note. The words given are what `guardWords` returns there, checked by
  `src/ui/msq-guard-note.test.tsx` from the real state.
- Sign-ins are the demo ones: `ad`/`a` is Saber (master admin, sees 142, 149, 150); `us`/`us` is Ranger (member). The
  test world uses Hunter (142's admin, Plan of 149), who is not a demo sign-in. Saber can reach every state below.

1. **A Tracker window behind the Flow chart tab** (question 19). *Reachable today: yes* (test "a Tracker window behind
   the phone's Flow chart tab").
   - **Built words:** "Blocked: close the open window on the Tracker, then pick 149." The `behind` mark reaches the
     words (`trackerBehindInfo()`), so his Info-tab wording would be a one-line change in `guardLead`.
   - **Waits for him:** "…on the Tracker’s Info tab".
   - **Steps:** sign in as Saber on an upright phone (any width up to 1050, e.g. 402×874). Open ☰ → Tracker. Tap
     **Info**. Tap **+ Set lull period**, then tap a day on its calendar (the first day); do not save. Tap **Flow
     chart**. The pop-up is now out of sight behind the tab. The door would be the pick in ☰ (the note goes to the
     foot on a phone).
   - On a desktop the Flow chart tab hides nothing, so `behind` is never set.
2. **The Tracker's unsaved-edits question** (question 21). *Reachable by a press: no.*
   - **Built words:** "Blocked: close the open window, then …". It never says "on the Tracker".
   - **Waits for him:** whether to call a question with Stay / Discard them / Save them a "window".
   - **What stops a press reaching a door while the question stands:**
     - The keys land on Stay, and Tab is held inside the box (`Modals.jsx trapTab`). Tested: Tab from the last
       button is held and the focus stays inside.
     - A press on the shade is Stay. Tested.
     - The page holding the question covers the whole screen, top bar included (`tracker.css
       #page-tracker.trk-askonly`: fixed, inset 0, z-index 700). This is a stylesheet rule jsdom does not load, so
       only a browser can confirm it.
   - **Steps to the state:** Saber on a desktop (1536). Open Tracker → ✎ → Edit chart layout. Add an event, name it,
     leave Edit chart layout, and do not press Save changes. Open the **Inputs** tab. Press the **142 ▾** picker →
     **149**. The question "You have unsaved chart edits… Save them before switching to 149?" stands over Inputs.
   - To picture the note, a drawer must place it over this question by hand. No press makes it.
3. **A squadron's move, or a place being edited, with the Users section showing** (question 20). *Reachable: yes*
   (Admin hides the section that is not shown; it does not remove it).
   - **Built words:** "Blocked: save or cancel the open row, then pick 149." "+ New squadron" with a number typed and
     Users showing gives "Blocked: save or cancel the new squadron, then pick 149."
   - **Waits for him:** "…on Squadrons".
   - **Steps:** Saber, desktop 1536. Open Admin → **Squadrons**, then do one of these:
     - press 142's row and change its **Place**;
     - press a place's row under Places and change its name;
     - press **+ New squadron** and type 151.
     Then press **Users** in Admin's list, then the **142 ▾** picker → **149**.
4. **A Users row changed, then another Admin section shown — no longer owed (the review round).** His ruled "Blocked:
   save or cancel the open row on Users, then pick 149." (D2627 A6) is now said live for `userrow` and `archrow`. The
   Users list reports its `shown` through `useGuardSection('users', shown)`. Tests: "a Users row changed, then the
   Squadrons section shown…" and "an archived man's row changed…".
   - **Steps:** Saber, desktop. Open Admin → Users. Press a man's row and type a letter into Sign-in. (For `archrow`:
     **Archived** → a man's row → change the callsign.) Then press **Squadrons** in Admin's list, then the picker →
     **149**.
5. **Add a person typed, or Give access changed, then another Admin section shown** (question 22). *Reachable: yes*
   (test "Add a person typed, or Give access changed…").
   - **Built words:** "Blocked: add or cancel the new person, then pick 149." and "Blocked: finish or cancel giving
     access, then pick 149."
   - **Waits for him:** nothing is ruled for these two forms on another section. "…on Users" is ruled for an open row
     only.
   - **Steps for Add a person:** Saber, desktop. Admin → Users → **+ Add a person** → type a callsign → **Squadrons**
     → picker → **149**.
   - **Steps for Give access:** someone must first ask for access. On the sign-in screen, Request access with a new
     e-mail. Then, as Saber: Admin → Users → **Give access** on that request → change the Role → Squadrons → picker →
     149.
6. **Every other row whose page is a page** (`inputedit`, `inputsday`, `oilrevise`, `qualsnew`, `drafts`, `userrow`,
   `archrow`, `giveaccess`, `addperson`, `newsqn`, `sqnmove`, `placeedit`). *Each opened, then the Help tab: none
   still counts* (test "every row whose page is a page…"). Why:
   - The Inputs, Quals and Admin pages unmount when their tab is left (`Shell.tsx` draws each only while it shows).
   - Plans is drawn only on Edit Schedule (`windrawn.ts draftsDrawn`).
   - **One exception:** the Input window opened on Inputs becomes the schedule's own Input window (`inputdlg`, drawn
     over every page) when another tab is shown. It is in sight there, and "close the open window" is true of it.
   - So no page row needs words of its own beyond the Leave War's and the Tracker's.
7. **A changed holiday refused because no leave period covers it** (not in the brief's table). The form hands over
   `'changed'` whenever it holds an existing line. Such a refusal would therefore say "save or cancel the changed
   holiday", which is true, since its Save and Cancel are there. Whether a change can be refused for no period was
   **not tried** — named for the orchestrator.

## How "under the Calendar" and "the section shown" are read

- **Under the Calendar:** `calendarOver(id)` = `phoneLayout() && winUp('days') && winAbove('days', id)`.
  - `phoneLayout()` is the windows' shell's own rule: `22-float-windows.css @media (max-width:620px)` lays every
    window across the screen, and the Calendar's month then fills it.
  - `winAbove('days', id)` (new, read-only, in `ui/winorder.ts`) asks the order the windows came forward in. The
    settings window lies under the Calendar only when the Calendar came forward after it, which is what "Calendar…"
    in the settings does. If the settings window is brought forward over the Calendar, it is in sight and the plain
    lead is said.
  - No new width number was added. DaysWindow's own 820 and 1509 widths are about its month's buttons and tabs, not
    whether it covers the screen, so they were not used.
- **The section shown:** read live since the review round. `UsersPanel` reports the Admin page's `shown` through
  `useGuardSection('users', shown)`, and the report is gone when the list unmounts. `usersOutOfSight()` is true while
  the list is mounted and not in sight. `AdminPage.tsx` is untouched.
- **On a page out of sight:** `row.where !== CURPAGE`, used for `lwsheet` and `trk`, the only page rows that can
  count off their page.

## The `NoteAt` table (`src/ui/guardnote.ts noteAtFor`)

| Door | under | edge | below | other |
|---|---|---|---|---|
| `pick` | `#sqnMenuBtn` | left | bar | |
| `toMember`, `toAdmin` | `#roleBadge` | right | bar | |
| `line` | `[data-testid="bell-line-<opts.line>"]` | left | self | `inside: .bell-list` |
| `bell` | `BELLAT`'s element, else the first drawn `.bellbtn` | right | bar | |
| `card`, `page`, anything else | null (the foot) | — | — | |

`from` comes from the door's `GuardOpts`. `names` is the lead's controls (`guardLead(row).names`). `guardSay` is handed
to `setGuardSay`; with no `document` it calls `HOOKS.toast(words, 'blocked')`.

- **Where it loads from (since the review round):** one side-effect import each in `src/ui/Shell.tsx` (the app) and
  `src/test-support/msq-world.ts` (the test world), plus the note test's own import. `ui/guard.ts` no longer imports
  it, so there is no cycle.

## The placing function (`src/ui/toast.ts placeNote`, pure) — its cases

The places are tried in order (as changed by the review round):
1. **Under the control** (`!noteAtFoot(from)` and the control is drawn).
   - It stands 8px under the bar's foot. With the "Not saved" band up, the bar's foot is the band's foot. With
     `below: 'self'` it stands 8px under the control itself.
   - Its left or right edge lines up with the control's, held 8px inside the screen's sides.
   - Inside a list (the bell's), where the note does not fit, it stands 8px under the list, on the list's left edge.
   - This place is passed over if it would cover a window's ✕ (`NOTE_X`) or a named control.
2. **The foot.** Today's foot: 26px up; 12px from each side on a phone, centred on a desktop.
   - If it covers a named control or a window's ✕, it rises so its foot is 8px above the highest of them. This is
     checked again at each new place.
   - The foot fails only when rising would leave it less than 8px from the top.
3. **The top.** Only when there is no room left.

The constants:
- `NOTE_X = '.floatwin .win-x, .airpop-head .x, .modal-head .x, .bidsheet-hd .x'`. The last selector was read off the
  Leave War sheets: `BidPicker.tsx`, `ClosedNoteSheet.tsx` and others draw `<button className="x">` in `.bidsheet-hd`.
- `noteAtFoot(from) = from === 'drawer' || phoneLayout()`.

Tested with made-up boxes:
- under the control with room;
- the right edge, and clamped at the screen's right side;
- a ✕ in the way under the control, so the foot is used;
- a ✕ at the foot too, so the note rises 8px above that ✕ (review round);
- a ✕ and then a named control, so the note rises above both, checked again (review round);
- no room on the screen, so the top is used (review round);
- the phone foot;
- named controls under the foot, so the note rises above the highest (the s1-cal-noleave-p case);
- the band up, so the note stands under the band and clear of Retry;
- no control, so the foot is used;
- the bell list, both ways;
- §4.6's table of sizes, where the top is never taken.

**FOUND at K3, settled in the review round.** A pick made inside ☰ on a desktop goes to the foot. With a window dragged so
its ✕ lies at the foot's centre, K3 sent the note to the top. It now stands 8px above that ✕.

`placeToast` measures and applies:
- **Measuring:** the note's own size and its 12px-inset height; the control; the bar (`.topbar, .sb-top`); drawn
  `.savestat.failed` bands; drawn ✕s; drawn named controls.
- **Applying:** `data-at` is `ctl`, `foot` or `top`.
- **When it is worked out again:** on a window `resize` (one listener, which acts only while the guard's note is the
  one showing) and when a shell window opens (`FloatWindow.tsx` already calls `placeToast`).

## The stylesheet

No rule changed.

## Every place today's code, or this build, differs from §4.6's account

1. **The rise-in.** §4.6: "The rise-in in toast() reads data-at: an anchored note drops into place, with no sideways
   shift."
   - The anchored branch sets `data-wide`, so there is no sideways shift.
   - At K3 the note rose 8px into place rather than dropping. Since the review round, `toast()`'s one rise-in expression
     reads `data-at === 'ctl'` as it reads `'top'`, so the anchored note now drops into place.
2. **How `AT` is cleared.** It is not cleared inside `toast()`. `toastAt` records the count of notes shown that its own
   note will have (`n = SHOWN+1`). `placeToast` uses `AT` only while that is still the count, and forgets it otherwise.
   The effect is the same as §4.6's: any later `toast()` takes the ordinary place, and toastAt's own does not.
3. **`NoteAt` has two more fields:** `from` (for `noteAtFoot`) and `names` (the lead's controls).
4. **"The top bar does not show the squadron picker."** On an upright phone `#sqnMenuBtn` is still drawn; its list
   opens as a sheet (`SquadronMenu.tsx`). So the literal test would be false. Built as §4.6 equates it: `phoneLayout()`,
   620 wide or less.
5. **The top** is now taken only when rising leaves no room on the screen. No case of §4.6's table of sizes reaches it
   (review round).
6. **The words of "close the open window" name no control** in the named-controls table. The window's ✕ is already
   handled by the ✕ check at every place. Naming it too would lift the foot above a phone window's title strip.
7. **A door with no ruled ending raises no note** (`guardWords` → null). A pick to a squadron with no number does the
   same.
8. **`ui/winorder.ts` gained `winAbove`.** It is read-only, and the file is on §21.1's list but not named in the brief.

## Tests

**New: `src/ui/msq-guard-note.test.tsx` — 49 tests, all green.**
- **Words — 20 tests:** every lead from its real state, each joined to all six endings (pick 149, pick 150, to member,
  to admin, line, bell). Also "a door with no ending says nothing".
- **Two at once — 2 tests.**
- **Words owed — 7 tests:** behind the Flow chart tab; the Tracker's question and its key trap; Squadrons rows with Users
  showing; "+ New squadron" with Users showing; a Users row with Squadrons showing; Add a person and Give access with
  Squadrons showing; every page row off its page.
- **Door table — 2 tests.**
- **toastAt — 6 tests:** the control, then back to the plain place; ☰ to the foot; no control to the foot; the face and
  the reader's region; through the seam; a lead's named controls.
- **placeNote — 12 tests.**

**Seen failing first** (code set aside by patch file and `git checkout --`, then re-applied — no stash):
- **Everything set aside** (`guard.ts`, `toast.ts`, `winorder.ts`, `HolidaysPanel.tsx`, `EveryWeekday.tsx`, and
  `guardnote.ts` moved out): the whole file fails ("Failed to resolve import ./guardnote"), 0 run.
- **Only the third argument set aside** (`HolidaysPanel.tsx`, `EveryWeekday.tsx`): the 4 holiday and "Every <weekday>"
  tests fail, 2 pass.
- **Only `calendarOver` made false:** the 2 under-the-Calendar tests fail, 3 pass.

**Pin halves (seen passing, named so):** these assert today's app, not this build's words:
- the reachability halves of the Words-owed tests: the key trap and the shade press on the Tracker's question; "none
  counts off its page";
- the door-table lookups of elements.

**Moved, no assertion changed:** the openers of `src/ui/msq-guard-open.test.tsx` moved whole into
`src/ui/msq-guard-testkit.tsx`, which both files import.
- Its `afterEach` body became the exported `guardTeardown`, which the open file hands to its own `afterEach`.
- A16's "no leave period" steps became the opener `openHolidayNoLeave`. Its premise and assertion stayed in A16.
- `openHolidayChanged` is new.

**Must stay green — green:** one run of 25 files, 705 passed and 5 todo:
- the note file;
- `toastplace`, `toastblocked`, `toastbatch`, `pops`, `state/view-reset`;
- `holidayspanel`, `everyweekday`, `dayswindow`, `inputssettings`, `sanssettings`;
- `msq-guard-rollcall` (R1's scan reads a third argument as it is, so it was not extended), `msq-guard-asis`,
  `msq-guard-g`, `msq-guard-input-sqn`;
- the toast's other readers: `seen`, `availwin`, `oilwait`, `SecDefaultSnackbar`, `upchitdelete`, `inputsvet`,
  `boardland`, `leavewar/noperiod-join`, `publishdoor`, `sans-words-156`.

`src/ui/msq-guard-open.test.tsx` was run whole once, at the end: 341 passed, 0 failed, in 889 s.

**Other checks:**
- `npm run build` (checks lock taken and released): PASS.
- `npm run lint:changed`: **NOT RUN.** The code check could not read `origin/main`'s side, so it compared nothing.

## The orchestrator's review round (chat 204)

The words were accepted as built. Four decisions were then built in the same working copy, tests first. Nothing was
committed.

1. **The Admin section, read live.**
   - `ui/guard.ts` gained `useGuardSection('users', shown)`, which records whether the Users section is in sight and is
     cleared when the list unmounts, and `usersOutOfSight()`.
   - `ui/UsersPanel.tsx` calls it once, right after the K2b report line, with a house-style comment. Its import line had
     to name the new hook (`useGuardSection, useGuardWork`); nothing else in that file changed.
   - `guardWords` now says his "save or cancel the open row on Users" live for `userrow` and `archrow` whenever the list
     is mounted and not in sight. That includes a phone's Admin page showing its category list, not drilled in, which
     is what `shown` means there.
   - Unchanged: `addperson` and `giveaccess` keep their plain leads, and so do the three Squadrons rows.
   - `AdminPage.tsx` is untouched.
   - R1 held without extending its scan: the new hook is not a report of a row, and R1 reads only `useGuardWork` and
     `useGuardCloses`.
2. **The rise-in.** One expression in `toast()`'s rise-in now reads `t.dataset.at==='top'||t.dataset.at==='ctl'`, so
   the anchored note drops into place. Nothing else in `toast()` changed.
3. **The top place.**
   - At the foot, a window's ✕ in the way is treated as a named control is: the note stands 8px above the highest ✕ or
     named control its box meets, checked again at the new place.
   - The top is taken only when rising leaves the note less than 8px from the screen's top.
   - K3's pinned case (a pick from ☰ on a desktop, a ✕ at the foot's centre) now stands 8px above that ✕.
   - **Is "no room" reachable?** Not by any case of §4.6's table of sizes:
     - on an upright phone every window's ✕ is at its top;
     - the Calendar's ✕ sits above where the note rises to;
     - a desktop window dragged low has one ✕, which the note rises 8px above.
   - Only made-up boxes reach "no room": a ✕ or named control in every band of the screen, tested both ways.
4. **The import cycle is gone.** `ui/guard.ts` no longer imports `./guardnote`. `guardnote.ts` imports `ui/guard.ts` and
   `toast.ts` and installs itself as it loads. It is loaded by one side-effect import each in `src/ui/Shell.tsx` (the
   app) and `src/test-support/msq-world.ts` (the test world, beside `import '../ui/guard'`), and by the note test's own
   import. A test reads the sources to pin this.

**Tests — `msq-guard-note.test.tsx` now has 55:**
- New in this round:
  - the Users section's report;
  - a Users row with Squadrons showing ("…on Users");
  - an archived row with Squadrons showing;
  - no import cycle;
  - the rise-in;
  - a ✕ at the foot, so the note rises;
  - a ✕ and then a named control;
  - no room, so the top;
  - K3's found case now above the ✕.
- The two old tests that sent the note to the top were rewritten to their new answers; no other assertion changed.

**Seen failing first:** with the tests written and before any code, 8 failed — every new one but "no room". "No room"
passed on K3's code, since K3 already went to the top there, and is named a pin. All 55 are green with the code.

**Runs — all green:**
- One run of 25 files: the note, rollcall, g, asis and input-sqn files; the toast's own tests; the Calendar family's;
  the toast's other readers. 712 passed, 5 todo.
- Admin → Users and the shell: `msq-fix2-users-moved-admin`, `msq-fix3-users-one-save`, `msq-users-filter`,
  `msq-users-row`, `onedoor-users`, `userslist-model`, `admin`, `adminclear`, `shell-keepalive`. 86 passed.
- `npm run build`, with the checks lock taken and released: PASS.
- The open file was not run again. Neither the testkit nor any opener changed this round. `msq-world.ts` gained one
  import, and the msq-world files above ran green on it.

## What only a browser can show

- The note's real box at each of §4.6's sizes, against p1b, p2b, p4b and p3-p.
- The desktop foot's width. `placeNote` measures the note at its own width, but today's centred note is limited to half
  the screen, so a long note could be narrower and taller there than measured.
- That the Tracker's question really covers the top bar.
- Named controls that are drawn but hidden under the Calendar on a phone (the settings window's Save and Cancel). They
  still count as drawn, so the note could rise above controls he cannot see.
- That the anchored rise-in drops into place with no sideways shift.
- That rising above a ✕ at the foot leaves the note clear of the window it belongs to.
- That a resize moves the note.

## Owed by others (not this step's files)

- `docs/file-map.md` needs lines for the two new files, `src/ui/guardnote.ts` and `src/ui/msq-guard-testkit.tsx`.
