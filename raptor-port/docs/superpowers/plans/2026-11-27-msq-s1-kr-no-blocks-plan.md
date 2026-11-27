# [MSQ-PICK-GUARD] Step KR — the refusals dropped (his D2825, 27 Nov 26): the plan

**Section 1 (the guard rail), chat 204. A plan only — no file under `raptor-port/src` was changed to write it.**
Written by a fresh Opus planner from the brief `../briefs/2026-11-27-msq-s1-kr-plan-brief.md`, on branch
`claude/msq-s1-guard-6ae5e1` at `e409f93ae` (K8c landed: `1e5dfd5ad`). Next: Astra and a fresh, blind Opus (in the
Fable seat, his D2819) red-team it, each blind to the other; then a builder builds it red-first, sub-step by sub-step.
**It stands on its own:** a builder on the next account (his D2824) needs this file, the files it names and `HANDOFF.md`'s
block for this branch — nothing from the chat that wrote it.

**How to read it.** His rulings are cited by number. **Anything marked "the planner's reading" is this planner's call,
never his rule** (lesson 32) — §13 lists every one for the red team and the coordinator. Code was read on this branch
by `grep`/`sed`; line numbers are a guide, re-read before acting. A census helper read every window's closer (its
findings are folded into §3, each re-checkable at the file named).

---

## 0. What D2825 says, and what it changes

**His D2825 (27 Nov 26, question 29, "as recommended"; the full row in `.claude/decisions-full/people-accounts.md` on the
batch branch):** the guard rail refuses nothing for an open window or work not saved. A pick of another squadron, the
switch to or from the member view, a bell line or a button bringing another squadron, and an Undo that changes the
squadron go through; what is open closes and anything half-typed is dropped, with no note — as within one squadron
(D2821). **Still standing:** "Not saved" (a change he pressed Save on that has not saved) stops them until Retry
(D2594); the Tracker still asks about unsaved chart edits; show-only windows close as before (D2596, D2597); Logic's and
Quals' edit modes end (D2627 A4).

**The clashes, named (D90 — the later ruling wins; D201 — what the older leaves behind is fixed in the same change):**

| Older ruling | What D2825 sets aside | Older text to fix (KR-14) |
|---|---|---|
| D2403, D2590, D2595, D2598, D2627 A6–A8, A10, A11, A13 (the refusal half), A16 | a window, a changed Admin row or form refuses a pick, the switch, a bell line, the lit bell | the plan's §1, §4.1's "Refused?" column, §4.6 |
| D2654 E1 | the Calendar refuses while a form of it is half done; a changed settings window refuses | §3.2 (a), the `dirty` / `holds` rows |
| D2654 E7 | the Undo of "+ New squadron" refused while a window is open | §4.1 row 21 |
| D2729 Q2 | words in Quals' "Add qualification" refuse the press and are kept | §18.1, §21.1's step-0 row Q2 |
| D2729 Q3, Q4; D2741; D2813; D2814 | the words of the settings, Tracker-tab and Admin-section notes | §4.6, `ui/guard.ts` GUARD_LEADS |
| D2740 (its refusal half) | "Open for bidding", a person's window and "OIL TRACKER" refuse | §21.1's D2740 block |
| D2654 E5 — **not clearly covered: question Q2 (§12)** | a window held since midnight: the pick goes through and gives it back | — until he answers |

**Not changed by D2825:** D2594 (Not saved), D2627 A9 (a save in flight is waited for), A20 (the Tracker's question both
ways), D2596 / D2597 / D2740's show-only half (they close), A4 (the modes end), D2592 (Logout), D2621 and K9's lists and
doors, every change he did not make (D2403's own reading; A14, A15 — nothing is asked or closed at his own move at
midnight, a right taken away), D2827 A (the way-back words of the Tracker's question stand, already built — B15).

**K8b stays dropped (D2821). K8c (`1e5dfd5ad`) stays and KR builds on it.** **D2826 (the add form at his own midnight
move) is chat 205's, not KR's** — agreed 27 Nov (`HANDOFF.md`, the split with 205): built after U2 as an entry of 205's
judge of typed work. KR hands it nothing but the form's closer (§9, §10).

---

## 1. What he will see, in one paragraph

With a window open or something half typed, a pick of another squadron, the switch to or from the member view, a bell
line or a lit bell's tap that brings another squadron, the OIL list's card that does, and an Undo that changes the
squadron **go through**: what was open closes and what was half typed is gone, no note. A box that saves itself when he
leaves it (a template's time, a Leave War window's remarks) saves into its own squadron first, as leaving it does today.
**While "Not saved" shows, every one of those presses is refused with the grey note he has seen** ("Blocked: press Retry
to save your changes, then pick 149." and its siblings), nothing closed. The Tracker still asks about unsaved chart
edits, and on his own squadron "Edit chart layout", nothing moved, closes at the member-view switch (D2827 B). Two
cases wait on his answer (§12): a window held since midnight, and a holiday the app told him it is keeping.

---

## 2. The design in one rule

**Keep the table; change what it is for.** `ui/guard.ts GUARD_ROWS` stays the one answer to "what is open" (Part A's
reason for being — one function over one table, never a registry: plan §3.1 holds unchanged). What changes:

- **The ask refuses for one thing only:** `unsaved` (`saveRefused()`), plus, until he answers §12's Q2 and Q3, the two
  rows held for them. Every other row stops refusing.
- **`closeShown()` becomes `closeOpen(skip?)`:** every open row a door leaves out of nothing is closed by its own way
  out — the show-only rows as today, **every window and row of work by its existing Cancel / ✕ / discard path**, the two
  modes by their `end()`. Called where `closeShown()` is called today — the last step of every door, once nothing can
  still stop the change — so a refusal (Not saved), a Stay and a change he did not make still close nothing.
- **A row's kind** (`counts`) becomes: `'drops'` (a window or row of work — closed, its half-typed work dropped),
  `'closes'` (only shows things — as today), `'unsaved'`, `'question'` (the Tracker's own question, `trkask` — never
  closed by the guard; see §5), `'held'` (Q2/Q3's interim refusals — removed on his answers), `'no'`. **Every
  `'drops'` and `'closes'` row carries its closer** — a new roll-call test (R10) fails a row without one.
- The doors keep their shape (K4–K8c): the guard, the wait for a save, the Tracker's question, the guard again, then the
  closing and the entry. Only what the guard answers, and what the last step closes, change.

**Why not delete the table:** nothing else knows what is open, and a door that changes the squadron with a window left
open is the carry fault the build started from (P2 1: "Add a person" carried its typing to 149 and added there; 142's OIL
list saved 142's input under a bar reading 149, P2 4). The table now decides what closes.

---

## 3. Every row that refuses today — what replaces the refusal (brief item 1)

Read with `ui/guard.ts` (rows l.~95–250 of the file, `GUARD_ORDER`). "Module" = callable from `ui/guard.ts` today;
"handed" = the component hands its closer over (`useGuardOpen`, §7.3), as `sansday`, `lgedit` and `qedit` already do.

### 3.1 The rows, one line each

| Row | Its closer — the existing path | Module / handed | What is lost | Anything already stored, left behind? |
|---|---|---|---|---|
| `inputedit`, `inputdlg` (the Input window) | its Cancel / "Discard and close": `setEscAsk(false); setInpEdit(null); notify()` (`ui/InputWindow.tsx` `close`, l.~563) — never ✕/Escape's "Close it and lose them?" question | module (`setInpEdit`) | the draft, the people picked, any question sheet over it (upchit, medical, OIL, document, swap) | **Files picked in its document box are already in the documents drawer** (`docAdd`, `storage/docstore.ts`; append-only by design). Left there, unreferenced — **exactly what its own Cancel does today**; not new harm, named for the records |
| `inputsday` (a day on the Inputs calendar) | its **Escape path** (`noteGone`, then `closePop`, `ui/InputsCal.tsx` l.~304–309, ~507) — **not** ✕'s `showDay(null)`, which runs `settlePick → finishNewNote` and **writes** a new note with no people | handed | the "+ Note" words, the picker's ticks, the delete question | none, **provided the Escape path runs before the unmount** (a note box saves on blur — l.~1094–1149; the file's own comment l.~299–303). The builder pins what Escape does to an *existing* note being edited and keeps exactly that |
| `inputsset`, `sansset` (the two settings windows) | `setInpSet(false)` / `setSansSet(false)` + `notify()` (already the rows' `close`) | module | the cut-off and members-file draft; the tone figures | none — "nothing is saved until Save" (each file's head) |
| `days` (the Calendar) | `setDaysWin(null)` + `notify()` (already its `close`) — it unmounts its forms with it (`DaysWindow.tsx` l.~289–290) | module | the month in view; with it everything below | a day-class press is written at the press (`setFlyDays`); a save still pending lands — both stay, as today |
| `everywd` ("Every Monday") | goes with the Calendar (`setDaysWin(null)`) | module | the class, from and until chosen | none — nothing until Save |
| `holiday` (Add / Change a holiday) | goes with the Calendar | module | the kind, name, short form and range | **The kept-waiting holiday ("It is kept here, and saved by itself as soon as a leave period covers it.", `HolidaysPanel.tsx` l.~416) is NOT stored** — the draft lives only in the form, its save waits on a leave period (`coveredNow`, l.~353). Dropping it breaks what the screen told him → **question Q3 (§12)**; interim: it keeps today's refusal (`'held'`). Its side pieces: a draft leave period made by "Create the 2028 leave period" **is a stored record — not touched**; a Leave War "New period" sheet opened by "Add a leave period for…" is a Leave War sheet — closed by its own ✕ (`lwsheet`) |
| `holimport` (a holiday sheet read in) | goes with the Calendar (`setPv(null)` with the panel's unmount) | module (via `days`) | the sheet read in | none — nothing until "Add" |
| `oilday` (the OIL list) | `setOilList(null)` + `notify()` — its ✕ / Escape / Close — **never "Later"**, which with a sign-off hold writes the sign-off (`oilsign.ts holdLater → writeSign`) | module | the picks; with a sign-off hold, the hold — **nothing is signed** (as its Close today) | none. A sign-off pressed and waiting behind the list is dropped as its Close drops it — **the planner's reading** that this is open work, not a saved thing (§13 R4) |
| `dutytpl`, `wavetpl`, `daytpl` (the template windows) | `setTplEdit(false)`, `setWaveEdit(false)`, `setDayTplEdit(false)` | module | only a time box mid-typing (its value commits on blur) | everything else is saved as made. **The time box mid-typing:** saved by the blur before closing (§5 step 6a), into its own squadron — as leaving the box does |
| `drafts` (Plans) | `setDraftsEdit(null)` **and** the plan name's `setNm(null)` (its Escape path, `DraftsModal.tsx` l.~47) | module + handed (`nm` is component state; the modal stays mounted hidden, so without it a half-typed name comes back on the next squadron) | a half-typed plan name | none |
| `cxdlg` (the board's cancel-reason box) | `setCxt(null)` (`board.ts`; `HOOKS.closeBoardDialogs` already does it, `SchedBoard.tsx` l.~303) | module | the typed reason; the cancel it was for is never made | reasons-list edits are saved at once — stay |
| `sortall` | `cancelSortAll()` (`board.ts` l.~820) | module | nothing | none |
| `medmove` (the medical question) | `setMedMove(null)` — its Cancel, "writes nothing" (`MedMoveConfirm.tsx` head) | module | the move or delete that waited on it — never made | none |
| `oilwait` (the OIL question put before a change) | **the page change's own silent drop:** `setOilWait(null)` (what `view.setPage` does, `view.ts` l.~475, ~621, OILBAR cleared with it) — **not** `leaveOilWait()`, which raises the "Not swapped — OIL not answered" bar and flashes the pucks (a note, against D2825's "no note") | module | the swap / add / move waiting on the answer — never made | none. **The planner's reading:** a change waiting on its question is open work (as a page change drops it today) (§13 R4) |
| `oilrevise` (the OIL question from a row of the Inputs list) | `setOilConf(null)` (`InputsPage.tsx` l.~1035) | handed | the OIL answers picked | none — only Save writes |
| `qualsnew` (Quals' "Add qualification" words) | `setNewQual('')` — the box emptied (there is no Cancel; this is the only discard) | handed (joins `qedit`'s closer, `QualsPage.tsx` l.~506) | the words | none. **D2729 Q2 set aside by D2825** (named above). K0's call — words hidden after Done dropped at a squadron change — is unchanged and now the same rule |
| `userrow`, `archrow` (an opened Users row, changed) | 205's row close (on 205's branch `useRowReports`, `UsersPanel.tsx` ~l.921 — the function that sets the open row to none; today `setEditing(null)`) | handed — **205's file (§10)** | the name, Role, squadron lines; the archive box and post-in date | none — only Save writes |
| `giveaccess` | `setOpen(null)` in `Waiting` (205's `work.give` close on its branch) | handed — 205's file | the approval draft | none |
| `addperson` | `shutAdd` = `resetAddForm(); setAdding(false)` — its Cancel (`UsersPanel.tsx` l.~638) | handed — 205's file | the form | none |
| `newsqn`, `sqnmove`, `placeedit` | each editor's `close` = `setOpen(null)` (`SquadronsPanel.tsx` l.~176, ~193) — their Cancel | handed — the core's lines in `SquadronsPanel.tsx` (K1b) | number, admin and place; the place pick; the name and time zone | none |
| `lwsheet` (a Leave War window that is not show-only) | **each sheet's own close**, already handed to the seam (`leavewar/ui/Sheet.tsx` `MARK` … `close: () => closeRef.current()`, l.~57); a new `closeWarAll()` beside `closeWarShown()` in `state/guard.ts` | module (the seam's list) | what each sheet holds until its Save: a new bid's draft, "Open for bidding"'s run, Required figures (Apply), Rename, a manning row, a counter, New leave war, the OIL tracker settings' boxes | **Three sheets KEEP words on close by design** — Place a bid's `closeKeeping` (words typed on a held bid; also on unmount), the closed note's `closeKeeping`, Selected days' `keepWords` — and three boxes save on leave (an event's name, a grade's name, a figure box). Those are saved things, written as a press elsewhere writes them; **the planner's reading: kept, by the sheet's own ✕, into its own squadron's war** (§13 R3). A new bid's files already in the documents drawer: left there, as its ✕ leaves them |
| `trk` (a Tracker window that refuses) | through the Tracker's bridge (`tracker/role.js trackerCloseShown(id)` → `core.js`'s registration, l.~206): the editor `closeEdit`, "✎ Edit details" `closeInfo`, Edit syllabus `closeModal`, Reorder `closeOrd`, Copy `closeCopy`, Flex settings `closeFlexWin`, Show All `closeShowAll`, the two lull pop-ups `closeLullPicker` / `closeLullCopy`; a `dlg` prompt (not the switch question) by `dlgClose(<its cancelled answer>)`, every queued prompt the same — **each the Cancel its own button presses**; none is exported today | module (via the bridge — **new closers in `core.js`**) | the editor's fields, the order list, copy picks, lull ticks (a lull's first day lives only in `lullPick`), Show All's inline typing (its component's own) | none known. **A job that asks several prompts** (an import, an export): each prompt answered as its own Cancel answers it — the builder reads each `dlg` caller and pins that the job ends as its Cancel ends it, never half-applied (§11 risk 6) |
| `trkask` (the Tracker's own question) | **not closed** — it is the question D2825 keeps | — | — | — (§5, the press while it stands) |
| `unsaved` | **stays a refusal** (D2594) | — | — | — |

### 3.2 What none of these needs: his question

Every row above closes by a path he can press today, with nothing new on screen — but for Q2 (a held window) and Q3 (the
kept-waiting holiday), each a case where dropping loses what the screen told him is kept. **No other row needs his word.**

### 3.3 Rows that only showed things, and modes — unchanged

`sansday`, `lwday`, `lwshow`, `avail`, `chg`, `insights`, `trkinfo`, `trkpop`, `trkdown`, `trkfail` close as today (D2596,
D2597, D2654 E2, E4, D2740). `lgedit`, `qedit` end as today (D2627 A4; Logic's `flushRuleApply` first). The `'no'` rows
(the four that close themselves at a press on the bar, lists, menus, the board, the armed controls, the H13 boxes) are
untouched: **H13's boxes in no window — a day's note, Help's bug box, a calendar's "+ Note" outside a day, a Balances
figure — stay group B's (D2636)**; today a press elsewhere saves the first two into 142 at the pick, unchanged.

---

## 4. What stays a refusal, and the code that stays or goes (brief item 2)

**Stays a refusal:** `unsaved` alone (D2594) — and, until his answers, Q2's held windows and Q3's waiting holiday (each a
`'held'` row, today's words). Nothing else any ruling still names.

| Code | Stays / goes | Why |
|---|---|---|
| `state/guard.ts refuse`, `refusalAt`, the `say` seam, `SAID` / `noteSaid` / `saidNote` / `UNSAID` / `saidByGuard` | **stays** | the Retry note at every door; the Undo engine's one-note rule (K8) |
| `GuardRefusal.reason` `'window' \| 'row'` | **goes** once Q2/Q3 are answered "drop" (`'unsaved'` alone); kept for `'held'` until then | — |
| `pick.ts pickRefused`, `pickWillAsk`; `Drawer.tsx`'s refused ☰ pick closing the menu | **stays** | a Not-saved pick from ☰ still closes the menu, note at the foot (D2627 A16) |
| `store.ts ownPageRefused`, `ownSquadronRefused`, `ownRefused`, the page door's `then`, `KEPT`, `PRESSED`, `STEP`, `landAfterAsk`'s second ask | **stays** | "nothing opens behind a refusal" still holds for Not saved (K6) |
| `undo-wire.ts squadronRefusal` (the hook in `undo/timeline.ts`) | **stays** — refuses only on Not saved; its `closeShown()` (K8c) becomes `closeOpen()` | D2825 keeps "Not saved" for an Undo that changes the squadron. **`undo/timeline.ts` is not touched** (agreed with 205) |
| `state/doorwait.ts` (the wait for a save) | **stays, unchanged** — it is not a refusal (D2627 A9, D2742) | §5 |
| `ui/guard.ts` `whatIsOpen` | **stays**, as "what a door closes, first in order" (tests, the checker, `closeOpen`) | — |
| `ui/guard.ts` `guardAsk` | **becomes** `saveRefused()` → the `unsaved` refusal (plus the `'held'` rows meanwhile) | — |
| `rowReachable`, `rowRefuses`, `dirty`, `holds`, `calendarOver`, `trackerBehindInfo`, `usersOutOfSight`, `squadronsOutOfSight`, `useGuardSection` (and its two calls), the `SAYS` map and `workSay`, `GUARD_UNDO_LEADS`, `guardUndoLead`, every lead but `retry` (and the `'held'` rows' two until answered), `ROW_NAMES`, every `LEAD_NAMES` entry but `retry` | **go** (KR-9), each where it is unused — the builder greps every reader first | words and gates of refusals that no longer exist |
| `ui/winorder.ts winAbove` (K3, read only by `calendarOver`) | **goes** if nothing else reads it | — |
| the Tracker bridge's `behind: 'info'` (`core.js`, `role.js`, `App.jsx`'s hand-over of its tab — K1c, for the Info-tab words D2813) | **goes** if nothing else reads it | D2813's words have no case |
| the reports `inputsset`, `sansset` (fed `dirty`), `everywd`, `holiday` (fed `holds` and the words — **but `holiday`'s `'noleave'` report stays while Q3 is open**), `holimport` | **go** with their purpose | the Calendar's close takes the forms |
| `GUARD_ENDINGS` (pick, toMember, toAdmin, line, bell, undo) and `guardEnding` | **stays** | the Retry note's endings, ruled (D2590, D2627 A8, D2729 group 5) |
| `ui/guardnote.ts` (door → control), `ui/toast.ts toastAt`, `placeNote`, the ✕ check, `noteAtFoot` | **stays** | the Retry note still stands by the control, never over Retry (D2627 A13) or a window's ✕ — a Not-saved refusal leaves the windows open |

---

## 5. The doors — each one's new order (brief item 3)

**One order for every door (the plan §4.2, re-read for D2825):**

1. **Is the press a change at all?** — as today (P16).
2. **Not saved** (`unsaved`) → refused, the grey Retry note by the control pressed (D2594, D2627 A13), nothing closed,
   nothing set (K6's rule: no page, no line read, no window opened behind it). Meanwhile also Q2's and Q3's `'held'` rows.
3. **A save still going** → the doors' one wait (`state/doorwait.ts`, **unchanged — it is not a refusal**: D2627 A9
   "a save in flight is waited for", D2742), then from 1 again; dropped by his next press, as built.
4. **The Tracker's question**, as today (D2627 A20; D2827 A's words). Stay → nothing closed, nothing changed.
5. **After Save or Discard:** 1–3 again.
6. **The closing, `closeOpen(skip)`**, in this order inside one call:
   - (a) the drop paths that must stop a save first — the Inputs day's `noteGone`; the Quals box emptied;
   - (b) **the focused box blurred** (`document.activeElement` blurred while the old squadron is still in view), so a box
     that saves itself on leave — a template's time, a Leave War event's name, a figure box inside a sheet — saves into
     its own squadron exactly as a press elsewhere saves it, **never after the entry into the next one** (§11 risk 2);
   - (c) every open row's closer, in `GUARD_ORDER` (questions on top first, a Calendar form before the Calendar), the
     row(s) in `skip` left out;
   - (d) **the closing committed before the entry:** the Leave War's sheet list drops a sheet the moment its close runs
     (so `holdNow()` reads `'none'` at once — K4 round 2's "beat", now for every sheet), and the closers that set a
     component's state are flushed (`flushSync` where the call is not inside a render or an effect) — **the builder
     proves, per door, that `whatIsOpen()` is null and `holdNow()` is `'none'` straight after `closeOpen()`**, and picks
     the means; a door whose closers cannot be flushed says so in its report.
7. **A save the closing started** (6b's blur, a sheet that keeps its words, Logic's `flushRuleApply`) → sent at once
   and waited for (the same wait); **Not saved → refused with the Retry note, the squadron unchanged** — what closed
   stays closed, its words are in the Retry. **The planner's reading** (§13 R5): otherwise "Not saved" for 142's change
   would first show on 149, the road D2594 was ruled against. **The Undo's door is the exception:** its hook answers in
   one turn and cannot wait — it closes (6) before the step, as K8c does, and a failure shows as it does today.
8. **The entry**, as built.

**The press while the Tracker's question stands** (`trkask` — drawn over every page, its shade over the bar; a door is
reached only by the keys): **the planner's reading** (§13 R6) — the standing question is answered Stay (its promise
resolves "stay", nothing closed), and the new press runs from step 1, asking its own question. Today it is refused with
"Blocked: close the open window, …". The other way (the press does nothing) is a silent refusal D2825 does not keep.

**Per door** — the order above; only what differs:

| Door | Where | Differs |
|---|---|---|
| the pick (bar, ☰) | `state/pick.ts pickFrom`, `afterAsk`, `enterPicked` | `enterPicked`: `closeOpen()` (6), the save-after-close wait (7), `enterSquadron(u, holdNow() === 'war', true)` — the `holdNow()` kept as a belt for Q2's held war window |
| the view switch (badge, ☰, both ways) | `store.ts switchFrom`, `afterSwitchAsk`, `enterRoleView` | `enterRoleView`: 6, 7, the body; **plus D2827 B (KR-12)** |
| the Input window's own chip | `switchRoleView({ skip: ['inputedit','inputdlg'] })` | `skip` now means "left open"; the chip stays a state no press reaches (B16) — Build 2 removes it |
| a bell line, the lit bell | `state/belltap.ts enterForLine` (l.~64–68), `openBellRequest`; `ui/topstate.ts openNotice` | `enterForLine`'s `closeShown()` → 6, 7 |
| the page door, `ownSquadronFirst`, the landing's second ask | `store.ts landOwn`, `landAfterAsk`, `ownFirst` | `closeShown()` → 6, 7 inside `landOwn` / `landAfterAsk` |
| the OIL list's card | `ui/OilDayList.tsx openInput` (`door: 'card'`, `skip: ['oilday']`) | **`skip` keeps the list open**, as today when its card goes through; its Not-saved refusal is silent until Q1 |
| an Undo / Redo — row 21 ("+ New squadron" with it picked), row 13 (the landing) | `undo-wire.ts squadronRefusal` (K8, K8c), `store.ts stepPage` | row 21: refused on Not saved only; `closeOpen()` before the step (K8c's place). Row 13: the landing's `landOwn` closes (6, 7). Redo's Not-saved refusal is silent until Q1 |

**Where K10's root meets KR.** KR closes the Input window at every door, so the "window open across a pick" road ends.
The roads K10's root still answers: a window **held** since his move at midnight or a right taken away (Q2), a bell line
or the Medical tab opening another squadron's input (questions 30, 31 — the root stays off until 30), and an Undo or Redo
of a 142 step while 149 is picked (Build 3). **KR changes no line of the root's patch** (`.tmp/k10-root.patch`); the
root lands after KR or before it, whichever his answer to 30 allows, and re-runs its tests on top of the other.

---

## 6. The bands (brief item 4)

| Band | Today's case | After KR |
|---|---|---|
| **The held Input window** — "This change could not be saved." (D2243 Q7; `typing-hold.ts schedMoveBand`) | his own move at midnight, a right taken away, with the window open | **unchanged** — a change he did not make closes nothing (A14, A15). What his own **next** pick does to it is Q2 |
| **The war under a held window** — "You are 149's from today. This can't be saved in 142's Leave War." (D2243 Q7; `holdNow() === 'war'`) | the same, a Leave War window open | **unchanged** at midnight. At his press `closeOpen()` closes every sheet first, so the war is never held by a press (6d's test) — except Q2's held window |
| **The pick's band** — "This is 142's. You picked 149 — close this to go on." (D2323; `pickBand`) | since K4, only Q2's road: a window held at midnight, then a pick of a third squadron (P5 N6: "149 picked again greys it with the pick's band") | **kept while Q2 stands at E5**; on Q2 "close it" no road reaches it — then it is removed with the member view's band in Build 2 (D2405), not by KR |
| **The member view's band** — "Member view." (D2389; `memberViewBand`) and the window's "Back to the admin view" chip | none since K5 (refused); after KR none (closed) | **dead, as since K5** — left for Build 2's removal (D2405), which the plan §1 item 1 already names; **the planner's call** (§13 R8): KR does not widen into Build 2. The raw switch and its ten re-pointed test files stay |
| The Tracker's hold and its member-view cover (`trkMayHold`, `coverWords`) | unsaved chart edits at his own move | unchanged |

---

## 7. K3's note, K7's checker, Part A's table (brief item 5)

### 7.1 K3's note
**Kept, for "Not saved" only:** `ui/guardnote.ts`, `toastAt`, `placeNote`, the ✕ check, the foot on a phone and from ☰,
the endings. **Removed:** every lead but Retry's (and the two `'held'` leads until Q2/Q3), the Undo's Cancel-half leads,
the names each lead points to but Retry's, the section and Tracker-tab words (§4's table). **Three Retry notes have no
ending of his:** the OIL list's card, a Redo, and a press naming no door — today said nothing (K6, K8). Question 27 is
moot (his record), but its step 2 left Fable-read words for exactly these three → **question Q1 (§12)**; until he
answers, they stay silent as built.

### 7.2 K7's checker — re-pointed, not removed (**the planner's reading**, §13 R7)
Its first check ("no entry by press with something open the door did not leave out") **turns into the one test that
catches a door added later which forgets to close**: at the end of an entry's turn by his press, nothing a door closes is
still open — but the door's `skip` and the `'held'` rows; and an entry with "Not saved" up throws. Its second check
("nothing opens behind a refusal") stays as it is, for Not-saved refusals. Its allow-list (`rawOnPurpose`, `rawEnter`,
`rawRole`, `switchRoleViewRaw`) stays: a window across a pick is again a state no press reaches. The other answer —
delete it, its two files and its two set-up lines — is cheaper and loses that catch; **dead code is never kept**, so if
the red team finds the re-pointed check adds nothing a door's own tests do not, it goes, named.

### 7.3 Part A's table — kept, to know what to close
`GUARD_ROWS`, `GUARD_ORDER`, `FLOAT_WHERE`, `windrawn.ts`, the bridges and the roll-call stay. **One hook replaces two:**
`useGuardOpen(id, on, close)` — the report's count and its closer in one call (today `useGuardWork(id, on, say)` and
`useGuardCloses(id, on, close)`); the closer kept in a ref so it never closes over a render that has passed (as
`useGuardCloses` does). `say` goes with the words. Every report hands its closer; the roll-call's R1 reads it.
**The reports' `on` is unchanged** — "anything differs from how it opened" for Admin's rows and forms. **The planner's
reading** (§13 R9): an opened row with nothing changed loses nothing and is Admin → Users' own (205's page, E8); a window
closes whether typed in or not, as it is a window. 205 may ask for "opened" instead (§10).

---

## 8. The tests (brief item 6)

### 8.1 Written first, each seen failing (one new file, `src/ui/msq-guard-drops.test.tsx`, jsdom, `withThird()`)
For **every door** — the pick by the bar and by ☰; the switch both ways by the badge and by ☰; a bell line; the lit bell
(an access request); his SANS reminder; a holiday's line; the page door (a line of his own squadron while one he only
views is picked); the OIL list's card; the Undo of "+ New squadron" with 151 picked; the Undo's landing (row 13, by the
raw road K8 used) — and **for each family of work**, at least one door each and the pick for all:

- **D1 — typed work open, the press, the squadron (or the view) changes, the work is gone, no note.** Families: the Input
  window with words; a changed Users row (205's helper); "Add a person" typed; "+ New squadron" typed; the Calendar with
  a new holiday typed; a changed Inputs calendar settings window; the Inputs day with "+ Note" typed (**no note written,
  on either squadron**); Quals' "Add qualification" words; the OIL question from a list row; the OIL list with picks;
  a Leave War sheet held until Save (Rename); a Tracker window (✎ Edit details typed); a Tracker `dlg` prompt by the
  keys; Plans with a name half typed (**gone on return**); the board's cancel-reason box (the cancel never made).
  Each asserts: the squadron or view moved; `whatIsOpen()` null; nothing of the work stored on either squadron; no toast.
- **D2 — "Not saved" still refuses, nothing closed:** the saver made to fail (the repo's stand-in), a window with words
  open, each door: refused, the Retry note by the control (its exact words from `GUARD_LEADS.retry` and the ending),
  **the window still open with its words**, nothing changed. Then Retry lands, the press again: through, closed.
- **D3 — what keeps itself, keeps, into its own squadron:** a template's time box mid-typing ("0730", focused, no blur),
  a pick → 142's template has 0730, 149's untouched; a Leave War held bid's remarks typed, a pick (a Plan holder whose
  war follows) → saved on 142's war, never 149's; Logic's "13h" just typed, a bell line (G1's case) → 142 13h, 149 12h.
- **D4 — never held, not even for a beat:** a Plan holder (Hunter, 142 and Plan of 149) with an ordinary Leave War
  sheet open picks 149: `holdNow()` `'none'` straight after the closing, the war on 149, no held band at any moment
  (K4 round 2's test, widened to every sheet).
- **D5 — a save the closing started fails:** D3's template case with the saver made to fail at that save → refused with
  the Retry note, 142 still in view, the window closed (§5 step 7).
- **D6 — the Tracker's question standing, a door by the keys:** the earlier press's question answered Stay, the new
  press asks its own; nothing closed until its answer (§5).
- **D7 — the skip:** the OIL list's card that brings 142: the list still open; a second window beside it closed.
- **D8 — interim (until Q2 and Q3):** a window held since midnight, then a pick — refused as today; the holiday kept
  waiting, then a pick — refused as today ("Blocked: cancel the new holiday, or create its leave period, then pick 149.").
- **R10 (in `msq-guard-rollcall.test.ts`) — no row without a way to close:** every `'drops'` and `'closes'` row has a
  closer (a module one, or its component hands one through `useGuardOpen` — read from the source as R1 reads reports).

### 8.2 The existing files — each change traced to D2825, no assertion dropped without its ruling
Rule for every file: an assertion "the press is refused (for a window, a row, a form)" is **re-pointed** to "the press
goes through, the thing closed, its work gone, no note" and renamed (D2825); "Not saved refuses" stays word for word;
words of a lead D2825 removes are **deleted** (D2825; question 27 moot); a pin of a change he did not make stays.

| File | What changes |
|---|---|
| `ui/msq-guard-doors.test.tsx` (the pick) | B1/B2, B4, B11, B16, B30 re-pointed; B12/B13 (two reasons) → "a window and a failed save: the Retry note, the window still open" (refusal before closing); B4b, "never held … a beat", B3, B10, B19, B20, B21 stay; the `it.todo` (the short row) re-pointed to closing |
| `ui/msq-guard-doors-switch.test.tsx` | B5, B11, B12/B13, B16, B30 re-pointed; B4b, B10, B14, B15, B19, B20, B21, P11 and the pick's-question pin stay; row 5 (the chip, raw) stays |
| `ui/msq-guard-doors-bell.test.tsx` | B6, B6b, B6c, B7, B8, B9, B11, B12/B13, B25 (card), B26, B27, B28, B29, F2b, K7c re-pointed (K7c: the held window is Q2's — stays a refusal pin until Q2); B7b's entry stays, its refusal half re-pointed; B10, B4b, B17, B20, B22 stay; B23 (the belt) re-pointed |
| `ui/msq-guard-doors-undo.test.tsx` | B24 → the Undo goes through with a window open, the window closed before the step, "+ New squadron" undone; B23 (row 13) re-pointed; K8c stays and gains typed work; the OIL card's note block stays silent until Q1 |
| `ui/msq-guard-g.test.tsx` | G1: "a pick refused for an open window: the mode still on" → through, the mode ended; "LOW LEVEL … refused, the words kept" → through, the words gone, 149's box empty (D2825 over D2729 Q2); G2 stays; G3–G12 stay |
| `ui/msq-guard-note.test.tsx` | the words of every lead but Retry deleted (D2825); the place tests (`placeNote`, `toastAt`, the foot, the ✕ check, under the band) re-pointed to the Retry note; the Calendar's noleave note kept while Q3 stands |
| `ui/msq-guard-open.test.tsx` | A2 → "every row a door closes is seen, with its closer"; A3 stays; A6 (+ the closer); A7 → closed wherever it stands (no "out of reach" exemption); A12, A16 (E1's `dirty`/`holds`) → the Calendar and its forms close regardless (D2825 over D2654 E1); A17 → dropped; A4 → the closing order; A13 (the Info tab) deleted with `behind` (D2825 removes D2813's case); A5, A8, A9, A11, A14, A15 stay — **A14 and A15 are the pins that matter most: a change he did not make asks nothing and closes nothing** |
| `ui/msq-guard-rollcall.test.ts` | R8 (the `'closes'` list citing rulings) widened to every row's kind; R10 new; R1, R3, R4, R5, R6, R9 stay (R5 (a)/(c) read the doors' calls — re-read for the renamed `closeOpen`) |
| `ui/msq-guard-input-sqn.test.tsx` | its four refusal assertions re-pointed; the rest (K9, K10's part one) stays |
| `ui/msq-guard-drawn-*.test.tsx` and `test-support/msq-guard-a10.ts` (A10) | stay (they prove a row that says open has its box); its two refusal lines re-pointed |
| `ui/msq-guard-asis.test.tsx`, the K0 census files (`msq-night-memberview`, `msq-bell-input-ask`, `msq-bell-recheck-after-ask`, `state/msq-trk-cover`, `msq-pick-windows`, `msq-trk-follows-pick`, `msq-trk-pick-ask`, `msq-night-press-held`) | **stay** — they make a no-press state by the raw entry or switch, still a state no press reaches; any line that asserts a press refused is re-pointed, named |
| `test-support/msq-guard-testkit.ts` | its refusal helpers re-pointed; a `typeInto…` helper per family for 8.1 (a plain `.ts` file — the lint rule) |
| the ~29 other files that name the guard (KR-0's census: `ui/msq-pick-windows`, `reshape-c6-*`, `placeholderdoors`, `reqdoor`, `savesaysok`, `toastblocked` …) | most use the app's own "Blocked:" notes or the raw entry and stay; **each that asserts a guard refusal is re-pointed in the door step that turns it red, named in that step's report** |
| **205's files** (on the batch branch after U2): `msq-s2-rejudge3` (l.~202, ~301), `msq-s2-rejudge4` (l.~1056), `msq-s2-row` (l.~374) assert the refused pick's and switch's notes | re-pointed in the door step that turns them red, **with 205's agreement (§10)**; `rejudge5`/`rejudge6`'s `workOn` asserts stay (the `on` is unchanged) |

### 8.3 Browser tests (K12's)
K12's `e2e/msq-guard.spec.ts` is not written yet. **Its list is rewritten by KR-14:** out — the note's place for every
lead at the eight sizes, the Calendar notes rising above their buttons, the Tracker tab note; in — the Retry note's place
(under the picker, the badge, the line, the bell, the Undo; at the foot on a phone and from ☰; under the band, never over
Retry) at the eight sizes; a pick on a phone with the Input window open: through, closed, the number's two fades after
the ☰ menu closes (K11); a template time box focused on iOS-shaped Safari (buttons that take no focus) — saved into 142
(§11 risk 2 needs a real browser); the Leave War sheet closing with no held band drawn.

---

## 9. K5b (brief item 7)

- **D2826 — the add form at his own midnight move: 205's, not KR's** (the split, 27 Nov; the brief predates it). KR
  gives it only `addperson`'s closer through `useGuardOpen` (§7.3). Nothing here.
- **KR-12 — D2827 B: "Edit chart layout", nothing moved, closes at the member-view switch on his own squadron too.** Today
  (K5's finding) at home the editor stays open — his pages do not move, so no entry sends the Tracker anywhere. The
  change: in `enterRoleView`, where the switch does not move his pages, the Tracker leaves arrange mode with nothing
  moved — through the bridge (a new `trackerEndArrange()` in `role.js`, `core.js` running what "Done editing chart" runs
  when nothing is unsaved). With moves unsaved the question asks first, as built (A20); Discard or Save, then the switch,
  then the editor closed; Stay, nothing. **Both ways — the planner's reading** of "at the member-view switch" (§13 R10).
  Tests first (in `msq-guard-doors-switch.test.tsx`, beside B14): Saber at home, the editor open, nothing moved, the
  badge → member view, the editor closed; back → closed; with a move unsaved → the question, Discard → switched, closed;
  Stay → as it was. The Tracker smoke under the checks lock.
- **D2827 A** — nothing to build: the words stand as built (B15).

---

## 10. The overlap with chat 205 — file by file (brief item 8)

**The split agreed 27 Nov stands:** KR owns every refusal it removes and the reports' wiring; 205 keeps its rows, its
judge, U2's role parts and D2826; **U2 lands first** and KR brings the batch branch in after it (KR-0); KR leaves
`undo/timeline.ts` alone. **Send 205 this section and the file list in §11 when the plan is approved.**

| 205's file | What KR changes in it | What 205 must agree |
|---|---|---|
| `ui/UsersPanel.tsx` | only the guard's lines: in `useRowReports` the two `useGuardWork('userrow' / 'archrow', …)` become `useGuardOpen(…, <205's row close>)`; `giveaccess` and `addperson` the same with `Waiting`'s close and `shutAdd`; `useGuardSection('users', …)` removed | (a) **the name of the function that closes the open row** in its `useRowReports` (KR calls it, never re-writes it); (b) the `on` stays "anything differs" (§7.3) — or 205 asks for "opened"; (c) closing a row from outside, mid-render of another squadron's page, is safe for its judge |
| `ui/msq-s2-rejudge3/4.test.tsx`, `msq-s2-row.test.tsx` | the refused pick's and switch's note lines re-pointed (§8.2) | that KR re-points them, or that 205 does in the same merge — never left red |
| `ui/msq-s2-rejudge5/6.test.tsx` | nothing (`workOn` unchanged) | — |
| `state/undo-wire.ts` | `squadronRefusal`'s `closeShown()` → `closeOpen()` only (K8c's line); nothing of U2's grant / `stuck` chain | that K8c's lines reached the batch before its Pass A (agreed) |
| `ui/topstate.ts` | nothing beyond K6's lines (`openNotice`'s door calls stay) | 205's new line kind (Pass B) needs no guard line — K6's `LINE_KINDS` reads unknown kinds as read-only |
| `state/notices.ts`, `ui/useraccess-model.ts`, `UserAccess.tsx`, `rolestable` | nothing | — |
| `ui/SquadronsPanel.tsx` (the core's K1b/K3b lines) | the three reports → `useGuardOpen` with each editor's `close`; `useGuardSection('squadrons', …)` removed | told, as it reads that file |
| 205's own passing notes (the row's note when another admin lowers his Plan) | untouched — a change he did not make (A14, A15) | — |

---

## 11. Order and size (brief item 9)

**Each sub-step: one Opus builder from a written brief, tests first and seen failing (a patch file, never `git
stash` — the handoff's traps), a report file `…-msq-s1-kr<N>-report.md`; the orchestrator reads the diff by `git diff`,
re-runs the touched files, commits, pushes the branch, tells the coordinator.** No sub-step leaves a door half done.
**The coordinator merges KR into the batch branch only once KR-8 has landed** — the four door steps are one change to
him; KR-9 on may merge as they land.

| # | Sub-step | Files | Tests | Size (estimate) |
|---|---|---|---|---|
| **KR-0** | Bring the batch branch in **after U2**; a census file of every assertion that a press is refused by the guard, file and line, by door (the ~29 files + the guard's own) — read-only beside the merge | — | the census only | 1 h |
| **KR-1** | **The closers, no behaviour change:** `'drops'` kind and every row's closer in `ui/guard.ts` (module rows of §3.1); `useGuardOpen` replacing `useGuardWork` + `useGuardCloses`, every report handing its closer (`InputsCal.tsx` Escape path, `InputsPage.tsx`, `QualsPage.tsx`, `DraftsModal.tsx`'s `nm`, `SquadronsPanel.tsx`, `UsersPanel.tsx`'s guard lines — §10); `closeOpen(skip)` written beside `closeShown()`, unused by any door | `ui/guard.ts`, the report files | R10; each closer, called alone, leaves its row shut and writes nothing (or exactly what its own Cancel writes, named); the A-tests stay green | 4 h |
| **KR-2** | **The Leave War's and the Tracker's closers:** `closeWarAll()` in `state/guard.ts`, the sheet list dropping a sheet as its close runs (`leavewar/ui/Sheet.tsx`); the bridge's closers for the refusing Tracker windows and `dlg` prompts (`tracker/app/core.js` — one registration, the behaviour change only; `tracker/role.js`) | those files | each sheet family and each Tracker window closed alone; a `dlg` job cancelled mid-way ends as its Cancel ends it; `holdNow()` `'none'` straight after; **the Tracker smoke under the lock** | 4 h |
| **KR-3** | **The closing step itself:** `closeOpen` gains 6a (the drop paths first), 6b (the blur), 6d (committed before the entry — the means the builder's, proved); the save-after-close helper beside `doorwait.ts` (one function the doors share — never a second wait); `guardAsk(door)` refuses only `unsaved` and `'held'` **for the doors named in one set, `NO_BLOCK_DOORS`, empty in this step**; the `'held'` rows (Q2's held windows, Q3's waiting holiday) | `ui/guard.ts`, `state/guard.ts`, `state/doorwait.ts` (one helper) | D3's and D5's mechanics on the helper alone | 3 h |
| **KR-4** | **The pick** joins `NO_BLOCK_DOORS`: `enterPicked` calls `closeOpen()` and the save-after-close wait | `state/pick.ts` | D1–D5, D7 for the pick (red first); `msq-guard-doors`, G1, the pick's census lines, 205's three pick lines re-pointed | 4 h |
| **KR-5** | **The view switch** (and the chip's `skip` as "left open") | `state/store.ts` (`enterRoleView`) | D1, D2, D4 for both ways; `msq-guard-doors-switch`, G2's pin, 205's switch line re-pointed | 3 h |
| **KR-6** | **The bell, the page door, the card** (`enterForLine`, `openBellRequest`, `landOwn`, `landAfterAsk`, `ownFirst`; the card's `skip`) | `state/belltap.ts`, `state/store.ts`, `ui/OilDayList.tsx` (if its comment only) | D1, D2, D7 for each; D6; `msq-guard-doors-bell`, `msq-guard-input-sqn` re-pointed | 5 h |
| **KR-7** | **The Undo and Redo** (row 21's `closeOpen()` before the step, row 13 by the landing); **`NO_BLOCK_DOORS` removed** — every door now | `state/undo-wire.ts` (one line), `ui/guard.ts` | D1 for row 21 (an Input window with words, the Undo, "+ New squadron" undone, the window gone); `msq-guard-doors-undo` re-pointed; **the full unit suite under the lock** | 3 h |
| **KR-8** | **The checker re-pointed** (§7.2) | `src/testing/entry-checker.ts` | a door that skips `closeOpen()` (a test double) fails the checker by name; the full suite under the lock | 2 h |
| **KR-9** | **The words and gates that are now unused come out** (§4's table): leads, Undo leads, names, sections, `calendarOver`, `winAbove`, `behind`, the settings / Calendar reports | `ui/guard.ts`, `ui/guardnote.ts` (comments), `ui/winorder.ts`, `tracker/*`, `UsersPanel.tsx` / `SquadronsPanel.tsx` (`useGuardSection` lines), `InputsSettings.tsx`, `SansSettings.tsx`, `EveryWeekday.tsx`, `HolidaysPanel.tsx` | `msq-guard-note` cut to the Retry note; `npm run lint:changed` at the one finding; `npm run build` under the lock | 3 h |
| **KR-10** | **Q1's answer** — the Retry note's endings for the card, Redo and a press naming no door (if he says "say it": the three endings in `GUARD_ENDINGS`, drawn first — D1625) | `ui/guard.ts`, `ui/guardnote.ts` | B25's and the Redo's note tests | 1 h — **waits on Q1** |
| **KR-11** | **Q2's and Q3's answers** — each `'held'` row either removed (dropped at the door like the rest) or kept as the one refusal he chose, with its note | `ui/guard.ts` | D8 re-pointed to the answer | 1–2 h — **waits on Q2, Q3** |
| **KR-12** | **D2827 B** (§9) | `state/store.ts`, `tracker/role.js`, `tracker/app/core.js` | §9's tests; the Tracker smoke under the lock | 2 h |
| **KR-13** | **K12's list rewritten** (§8.3) — handed to K12; nothing built here | the plan's §21.1, K12's brief | — | 0.5 h |
| **KR-14** | **The records** (one docs commit): the plan's §21.1 gains a block "KR — the refusals dropped (D2825)" that wins over §1, §3.1–§3.2's `counts`, §4.1's "Refused?" column, §4.2, §4.6 wherever they differ, each section a pointer at its head (D201); §21.1's table: K3, K4, K5, K6, K7, K7b, K8 marked "refusals out by KR", K8b struck (D2821), K5b split (D2826 → 205; D2827 B → KR-12), a KR row; `docs/file-map.md` — `src/ui/msq-guard-drops.test.tsx`, and K12's owed lines for `guardnote.ts`, `test-support/msq-guard-testkit.ts`, `testing/entry-checker.ts`, `test-support/raw-entry.ts`, `state/inputsqn.ts`, `state/doorwait.ts`, the new hook; `docs/feature-impact.md` (the guard's limit — a form whose typing lives only in its component and is never reported is closed by no door: now a carry fault, not a missed refusal); `docs/ui-contracts.md` if it describes the note; `OUTSTANDING.md` `[MSQ-PICK-GUARD]`; `HANDOFF.md`'s block; `npm run docsize` | docs only | — | 1.5 h |

**About 37 hours of building, before the reads.** **The reads after KR-7 (D790, D1770, D2819):** Astra and a fresh,
blind Opus on the code; the walk's scenarios by Astra and a fresh, blind Opus (the Fable seat — on the reads-owed list);
the batch's one FULL check stays at the end (§21.6), its roll-call now of closings.

**Lock and checks per step** (`shipping.md` §The checks): a step's own test files without the lock; `npm run build`,
the full unit suite (KR-7, KR-8), and the Tracker smoke (KR-2, KR-12) under the checks lock, released at once; a held
lock → NOT RUN in the report, never a wait in a loop. `npm run lint:changed` every step (one finding: 205's
`PersonEditor`). Never push while this branch's checks run.

---

## 12. Questions for him (D2439: when it happens in real life first) — for the coordinator to word on the page

**Q1 — When a save has failed and he taps something that the note has no words for yet.**
*When:* rare — the "Not saved" band with Retry is up (a save of his did not go through), and he taps a card of the OIL
list that would bring another squadron, presses Redo where it would change the squadron, or presses another button that
brings his own squadron back. Today nothing happens and nothing is said. *Recommended:* say the Retry note as at every
other press — "Blocked: press Retry to save your changes, then press the card again." · "…then press Redo again." ·
"…then try again." (words already read by a fresh Fable in question 27's round, never shown to him; drawn on the real app
first, D1625). *Other answer:* leave it silent. *Cost:* one small step (KR-10).

**Q2 — A window held since his move at midnight, then his own pick.**
*When:* rare — Saber, a master admin moving from 142 to 149, has an Input window open with words typed when midnight
comes; the app holds it ("This change could not be saved.", Close) and his words stay visible so he can copy them
(D2243). In the morning he picks 142 — or 150. *His rulings meet here:* D2654 E5 (26 Nov) chose "the pick goes through and
gives the window back, his words there to edit"; D2825 (27 Nov) says what is open closes and half-typed work is dropped.
*Recommended:* E5 stands for this one case — the pick goes through and the held window stays, given back live on 142
(as today): it is a change he did not make, and closing it would drop the very words the band kept for him. *Other
answer:* it closes like any window, the words gone. *Cost:* either is one small step (KR-11); until he answers, it is
refused as today.

**Q3 — A holiday the app said it is keeping, then a pick.**
*When:* rare — an admin adds a holiday in a year that has no leave period yet; the Calendar says "It is kept here, and
saved by itself as soon as a leave period covers it." Before he makes the leave period he picks another squadron (or
presses a bell line that brings one). Nothing of the holiday is saved yet — only the open form holds it. *Recommended:*
treat it like "Not saved" — the press stops with the note he has seen, "Blocked: cancel the new holiday, or create its
leave period, then pick 149." — because the screen told him it is kept. *Other answer:* it is dropped like any half-done
form, no note. *Cost:* either is one small step (KR-11); until he answers, it is refused as today.

---

## 13. The planner's readings — for the red team and the coordinator (none is his rule)

- **R1** — the closer for a row is the existing path that **drops**; where the only close **keeps** what is typed, that
  close, and the words are then saved, not lost (§3.1).
- **R2** — the Input window's Cancel path, never ✕'s question; the Inputs day's Escape path, never ✕'s `showDay(null)`
  that writes a note with no people.
- **R3** — Leave War words that keep themselves on close (a held bid's remarks, the closed note, Selected days' words,
  the three boxes that save on leave) are saved things, kept by the sheet's own ✕ into its own squadron's war.
- **R4** — a change waiting behind its own question (the OIL question before a swap, the medical question, a sign-off
  behind the OIL list) is open work, dropped as a page change or its Close drops it today — no "Not swapped" bar.
- **R5** — a save the closing itself starts is waited for, and a failure refuses before the entry (§5 step 7); the
  Undo's door excepted. The simpler other way: enter at once, a failure then showing on the next squadron.
- **R6** — a door pressed by the keys while the Tracker's question stands answers it Stay and asks its own.
- **R7** — K7's checker re-pointed, not deleted (§7.2).
- **R8** — the member view's band and the chip stay dead until Build 2 (D2405); KR does not remove them.
- **R9** — Admin's reports keep "anything differs": an opened, unchanged row is not closed by a door.
- **R10** — D2827 B both ways.
- **R11** — the OIL list stays open when its own card goes through (`skip`), as today.
- **R12** — the focused box is blurred before the closing (§5 6b), so the H13-like boxes inside windows save into their
  own squadron as a press elsewhere saves them — the same as H13's boxes in no window today (group B, D2636).

---

## 14. The risks, each with its answer (brief item 10)

1. **Data lost that was not half-typed** — the one that matters most. *Answer:* §3.1's last column, row by row; the two
   cases where the screen promised to keep something are put to him (Q2, Q3) and refuse meanwhile; stored records (a
   draft leave period, day-class presses, reasons-list edits, saved-as-made template fields) are never touched; D1 asserts
   for each family that nothing was stored **and nothing stored was removed**.
2. **A box that saves on blur, unmounted after the entry, writing into the NEW squadron** (a template's time, a sheet's
   name box, the Inputs day's note; Safari's buttons take no focus, so the press does not blur it). *Answer:* §5 6a–6b —
   the drop paths first, then the blur while the old squadron is in view; D3 in jsdom; the iOS-shaped browser case in
   K12's list (§8.3).
3. **A close that is not committed before the entry** — the war held for a beat, the checker seeing a window still up,
   a closer's state landing on the next squadron's render. *Answer:* §5 6d — the sheet list drops at the close; the
   flush; D4 and the per-door "nothing open straight after" assertion.
4. **The carry fault back** — a door that forgets `closeOpen()`, or a form added later whose typing lives only in its
   component and never reports: carried to the next squadron (P2 1). *Answer:* the re-pointed checker (§7.2), R10, R3's
   census of frames; the limit written in `feature-impact.md` (KR-14).
5. **"Not saved" weakened by the change** — a Retry note that no longer stands, or a closing before the refusal.
   *Answer:* the order keeps the refusal at step 2 and 5, before any closing; D2 at every door; D5 for a save the closing
   starts.
6. **A Tracker job cancelled half way** (an import or export asking several prompts). *Answer:* each prompt closed as its
   own Cancel closes it (KR-2's test per `dlg` caller); the Tracker smoke.
7. **A change he did not make starts closing things** (his midnight move, a right taken away). *Answer:* `closeOpen` is
   called only in the doors' last step, never from `maybeReenter` or `refreshAccess`; A14 and A15 stay green and gain
   typed work (an Input window with words at the midnight move: still open, held, as today).
8. **The Undo closing typed work before its step adds a step of its own** (a blur-save, Logic's flush), so "Undo" takes
   back the wrong thing, or a Redo is lost to a new step. *Answer:* K8c's reasoning holds — the step taken is already
   chosen before the closing; KR-7 adds a Redo case with a Logic value typed and asserts the Redo still applies.
9. **Half a door changed reaching the batch** (one door closing, another refusing). *Answer:* `NO_BLOCK_DOORS` exists
   only between KR-3 and KR-7, and the coordinator merges KR only after KR-7 (§11).
10. **205's rows closed from outside while its judge or its own passing notes run.** *Answer:* 205 names its close
    function and agrees (§10); 205's rejudge files run in every door step.
11. **Dead code kept** — the brief's rule. *Answer:* KR-9 greps every reader of each removed name; the bands left for
    Build 2 are named (R8) with their reason.
12. **The size of the test churn hiding a dropped assertion.** *Answer:* KR-0's census lists every refusal line; each door
    step's report maps each listed line to "re-pointed (D2825)", "deleted (D2825 — its words)" or "stays", none left
    unmapped.
