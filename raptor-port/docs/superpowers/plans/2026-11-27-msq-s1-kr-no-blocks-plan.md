# [MSQ-PICK-GUARD] Step KR — the refusals dropped (his D2825, 27 Nov 26): the plan

**Section 1 (the guard rail), chat 204. A plan only.** Written by a fresh Opus planner from
`../briefs/2026-11-27-msq-s1-kr-plan-brief.md` on branch `claude/msq-s1-guard-6ae5e1` (K8c landed, `1e5dfd5ad`).
**Round 2 (this version):** the red team folded — Astra (`../briefs/2026-11-27-msq-s1-kr-redteam-astra.md`, 9 findings
plus 3 on the questions) and a fresh, blind Opus (`…-kr-redteam-opus.md`, 11), each claim checked against the code
first (§15, the ledger); chat 205's answers to §10; the coordinator's trimming (§11). **It stands on its own:** a builder
on the next account (D2824) needs this file, the files it names and `HANDOFF.md`'s block for this branch.

**How to read it.** Rulings by number. **"The planner's reading" marks this planner's call, never his rule** (lesson 32;
every one is in §13). Code read on this branch by `grep`/`sed`; line numbers are a guide.

**KR-1's first act: bring the batch branch in (after 205's U2) and read D2821, D2825, D2826 and D2827 whole** — their
rows are on the batch branch, not yet here; this plan's §0 paraphrases them (Opus 8). Anything that differs is fixed in
this plan before code.

---

## 0. What D2825 says, and what it sets aside

**D2825 (27 Nov 26, question 29):** the guard rail refuses nothing for an open window or work not saved. A pick of another
squadron, the switch to or from the member view, a bell line or a button bringing another squadron, and an Undo that
changes the squadron go through; what is open closes and anything half-typed is dropped, with no note — as within one
squadron (D2821). **Still standing:** "Not saved" stops them until Retry (D2594); the Tracker still asks about unsaved
chart edits; show-only windows close as before (D2596, D2597); Logic's and Quals' edit modes end (D2627 A4).

**Set aside by it (D90; what they leave behind is fixed in KR-8, D201):** the refusal half of D2403, D2590, D2595, D2598,
D2627 A6, A7, A8, A10, A11, A16, A18; D2654 E1 (the Calendar refusing while a form of it is half done) and E7 (the Undo of
"+ New squadron" refused); D2729 Q2 (words in "Add qualification" refuse); the words of D2729 Q3, Q4, D2741, D2813,
D2814; the refusal half of D2740. **D2654 E5** (a window held since midnight, then his pick: "the pick goes through and
gives it back") — **the pick goes through under both**; only what becomes of the window differs → question Q2 (§12);
meanwhile the later ruling decides it: the window closes (D90).
**Kept, unchanged:** D2627 A9 (a save in flight is waited for), A13 (the Retry note's words), A14, A15 (where the note
stands), A20 (the Tracker's question both ways); D2594; D2596, D2597, D2740's show-only half; A4; D2592 (Logout); D2621
and K9's doors; D2827 A (already built, B15). **A change he did not make asks nothing and closes nothing** — D2403's own
reading, pinned by the tests named A14 and A15 in `ui/msq-guard-open.test.tsx` (the tests, not his rulings of those
letters: Opus 8).
**K8b stays dropped (D2821); K8c stays; D2826 is chat 205's** (agreed 27 Nov), KR handing it only the add form's closer.

---

## 1. What he will see

With a window open or something half typed, a pick of another squadron, the switch to or from the member view, a bell
line or the lit bell's tap that brings another squadron, the OIL list's card that does, and an Undo that changes the
squadron **go through**: what was open closes, no note. **While "Not saved" shows, each is refused with the grey Retry
note** he has seen, nothing closed. The Tracker still asks about unsaved chart edits; "Edit chart layout", nothing
moved, closes at the member-view switch on his own squadron too (D2827 B). **The planner's reading, until his answer to
Q4:** a box or window that keeps its words when he leaves it today (a plan's name, a template's time, a calendar note, a
Leave War window's remarks) keeps them the same way, saved into its own squadron before the squadron changes — never
into the next one.

---

## 2. The design in one rule

**Keep the table; change what it is for.** `ui/guard.ts GUARD_ROWS` stays the one answer to "what is open" (the plan
§3.1's reason: one function over one table). Two things change:
- **The ask refuses for one row only, `unsaved`** (`saveRefused()`).
- **`closeShown()` becomes `closeOpen(skip?)`:** every open row is closed by its own way out, then the entry — at the same
  last step of every door where `closeShown()` runs today, so a Not-saved refusal, a Stay and a change he did not make
  still close nothing.

**The row kinds keep their names** (`window`, `row`, `closes`, `unsaved`, `no`) — no rename, so nothing in the doors or
the A-tests moves before its door is converted (Astra 10). A `window` or `row` row gains a `close`; R10 fails one without.
`dirty`, `holds` and `rowRefuses` go at the end (KR-5), when nothing reads them.

---

## 3. Every row that refuses today — its closer (brief item 1)

**One rule for what a closer keeps (the planner's reading, put to him as Q4):** each row is closed by **its own close as
he can press it today** — never a new discard path. Where that close **drops** (an Input window's Cancel, a form's
Cancel), the work is dropped. Where it **keeps** what is typed — a box that saves when left, a window whose close keeps its
words — it keeps them, **saved into its own squadron before the squadron changes** (§5 steps 6–7). That is "as within one
squadron" for both kinds, writes nothing new, and never writes into the next squadron. If he answers Q4 "drop those too",
each keeping close needs a dedicated abandon path (Q4's cost).
**A value a box refuses on leaving** (an invalid plan name, an invalid event preset) **is dropped silently at a door**: a
module flag `closingForDoor()` (in `state/guard.ts`, true only inside `closeOpen`) that those boxes read, so their warning
is not said and their "hold the sheet open" is skipped (Astra 5, Astra 6, Opus 1b).

| Row | Its close (today's path) | Module / handed | Lost | Kept, or already stored |
|---|---|---|---|---|
| `inputedit`, `inputdlg` | `setEscAsk(false); setInpEdit(null); notify()` — its Cancel (`InputWindow.tsx` ~l.563), never ✕'s question | module | the draft, people picked, any question sheet over it | files already picked sit in the documents drawer, as after its Cancel today |
| `inputsday` | `closePop()` — ✕ and Escape alike: it runs `showDay(null)` → `settlePick` → `cancelPick` → `finishNewNote([])`, so **a new note whose words passed to the people picker is written with no people** ("a new note keeps its words once", `InputsCal.tsx` ~l.287–292, ~452); a note box saves on blur (noted ~l.299–303) | handed | the picker's ticks, the delete question | **kept: the note's words, on 142**, as its ✕ keeps them (the planner's reading, Q4) |
| `inputsset`, `sansset` | `setInpSet(false)` / `setSansSet(false)` + `notify()` | module | the drafts | none stored before Save |
| `days`, `everywd`, `holiday`, `holimport` | `setDaysWin(null)` + `notify()` — the Calendar's ✕ (`DaysWindow.tsx` l.140), its forms unmounted with it | module | the month; the forms; the sheet read in | day-class presses stored at the press — stay. **A holiday kept waiting for a leave period** ("It is kept here, and saved by itself…") — new **or a change of a saved one** (`holidayChange` can answer `noperiod` too; the report's `'changed'` hides `waiting`: Astra 3) — **is not stored; dropped, as the Calendar's own ✕ drops it today** (Opus 7) → Q3. A draft leave period it made is stored — untouched |
| `oilday` | `setOilList(null)` + `notify()` — ✕ / Close, **never "Later"** (which writes a held sign-off) | module | the picks; a sign-off waiting on the list — nothing signed, as its Close | none |
| `dutytpl`, `wavetpl`, `daytpl` | `setTplEdit(false)` etc. | module | nothing | fields saved as made; **a time box mid-typing: kept** (its blur, §5 6a) |
| `drafts` | `setDraftsEdit(null)` and `setNm(null)` (its Escape) | module + handed | — | **a plan name half typed: kept** — its blur renames 142's plan, as leaving the box does (Astra 6, Opus 4: the plan's first version said "dropped"); an invalid one dropped silently (`closingForDoor`) |
| `cxdlg`, `sortall` | `setCxt(null)`; `cancelSortAll()` | module | the typed reason (the cancel never made) | reasons-list edits stored at once — stay |
| `medmove` | `setMedMove(null)` (writes nothing) | module | the waiting move or delete | none |
| `oilwait` | `setOilWait(null)` — the page change's silent drop, never `leaveOilWait()` (it raises a bar) | module | the waiting swap / add / move | none |
| `oilrevise` | `setOilConf(null)` | handed | the OIL answers picked | none |
| `qualsnew` | `setNewQual('')` (the box's only discard) | handed | the words | none (D2729 Q2 set aside) |
| `userrow`, `archrow`, `giveaccess`, `addperson` | **205's own silent closes, called with no argument: `closeRow()`, `Waiting`'s `closeGive()`, `shutAdd`** — each lets go, says nothing, writes nothing (205, 27 Nov) | handed — 205's file | the typing | none |
| `newsqn`, `sqnmove`, `placeedit` | each editor's `close` (`setOpen(null)`) | handed | the typing | none |
| `lwsheet` | **every open sheet's own close, in a loop** (§5 6c): close, commit, re-read the list, until it is empty | module (the seam's list) | what a sheet holds until its Save (a new bid's draft, Rename, Required figures, a manning row, a counter, New leave war, Open for bidding's run, the OIL tracker settings) | **kept, into 142's war before the war swaps:** the held bid's words (`closeKeeping`, `heldSave` on unmount), the closed note's and Selected days' words, and the unmount savers the first version missed — the day list's bid remarks (`DayList.tsx` l.81) and the leave-remarks box (`ReqWords.tsx` l.206) (Opus 1a). These are D1339's "keep the words" — Q4. A new bid's files: in the drawer, as its ✕ leaves them |
| `trk` | the bridge, each window's exported closer (`closeEdit`, `closeInfo`, `closeModal`, `closeOrd`, `closeCopy`, `closeFlexWin`, `closeShowAll`, `closeLullPicker`, `closeLullCopy` — all `export function` in `core.js`: Opus 11); **a `dlg` prompt and every queued one: the job ended first, then answered cancelled** (§5 3b) | module (via `role.js`) | the fields, the order list, copy picks, lull ticks, Show All's inline typing; an unfinished job's remaining questions | chart chunks a job already saved — kept, never rolled back |
| `trkask` | not closed — the question D2825 keeps (§5 step 4) | — | — | — |
| `unsaved` | **the one refusal** (D2594) | — | — | — |

**Admin's reports count while the row or form is OPEN, changed or not** (205's answer, 27 Nov; Astra 8, Opus 6): an
opened, unchanged Users row, Give access, "+ New squadron", a place's row — each closes silently at a door, so 205's
judge never raises its "…row changed while it was open…" note. **No refusal is added by this.**

The show-only rows (`sansday`, `lwday`, `lwshow`, `avail`, `chg`, `insights`, `trkinfo`, `trkpop`, `trkdown`, `trkfail`)
and the two modes (`lgedit`, `qedit`) close as built; the `'no'` rows and H13's boxes in no window (group B, D2636) are
untouched.

---

## 4. What stays a refusal; the code kept and removed (brief item 2)

**Stays:** `unsaved` alone (D2594). No other row refuses — no interim refusal for Q2 or Q3 (Opus 3).
**Kept:** `state/guard.ts refuse` / `refusalAt` / the say seam / `SAID`…`saidByGuard`; `pick.ts pickRefused` and the ☰
menu closing on a refused pick (A16's menu half — the planner's reading that it stays for Not saved); the page door's
`then`, `KEPT`, `PRESSED`, `STEP`, `ownPageRefused`, `ownSquadronRefused`; `undo-wire.ts squadronRefusal` (refuses only on
Not saved; its `closeShown()` → `closeOpen()`); `state/doorwait.ts` unchanged (not a refusal — A9, D2742); `whatIsOpen`
(what a door closes — tests, the checker, `closeOpen`); `GUARD_ENDINGS`; `ui/guardnote.ts`, `toastAt`, `placeNote`, the ✕
check, `noteAtFoot` (the Retry note still stands by the control, never over Retry or a window's ✕).
**Removed in KR-5, each after a grep of its readers:** `GuardRefusal.reason`'s `'window'`/`'row'`; `rowReachable`,
`rowRefuses`, `dirty`, `holds`; every lead but `retry`, `GUARD_UNDO_LEADS`, `guardUndoLead`, `ROW_NAMES`, every
`LEAD_NAMES` entry but `retry`; `calendarOver`, `trackerBehindInfo`, `usersOutOfSight`, `squadronsOutOfSight`,
`useGuardSection` and its two calls, `SAYS` / `workSay`; `ui/winorder.ts winAbove` if unread; the Tracker bridge's
`behind: 'info'` if unread; the reports that only fed `dirty`, `holds` or words (`inputsset`, `sansset`, `everywd`,
`holiday`, `holimport`).

---

## 5. The doors — one order (brief item 3)

1. **Is the press a change at all?** — as today.
2. **Not saved** → refused, the Retry note by the control (D2594, A13), nothing closed, nothing set (K6's rule).
3. **A save still going** → the doors' one wait (`doorwait.ts`, unchanged — A9), then from 1.
   **3b. A Tracker prompt that is not the switch question** (`dlg`, by the keys — its shade covers the bar): **its job
   ended, then it and every queued prompt answered cancelled** — so the question in step 4 can be drawn
   (`onBeforeTrackerSwitch.ask` opens with `if (dlg) return false`, a silent stop: Astra 7, Opus 2a). "Ended" is a
   navigation signal distinct from the prompt's own Cancel: the bridge bumps the serial the Tracker's jobs already read
   (`sessionSerial`, `core.js` l.~215; the import's `ended()` l.~7602, the export's `gone()` l.~7547) without the rest of
   `endSession()`, so an import whose "Skip this one" would go on to the next chart stops instead (Astra 2). The builder
   reads every `dlg` caller and pins that each stops after a cancelled answer once the serial moved. **The planner's
   reading:** a prompt is open work, gone even if he then answers Stay.
4. **The Tracker's question**, as today (A20; D2827 A). Stay → nothing more closed, nothing changed. **A question already
   standing** (a door by the keys while it is up): the new press waits until the old ask has fully settled — its
   `finally` included — then asks its own (chained on the old promise, so `switchAsking` is never cleared under the new
   question: Opus 2b). The old one is answered Stay. (The planner's reading.)
5. **After Save or Discard:** 1–3 again.
6. **`closeOpen(skip)`**, inside one call:
   - (a) **the focused box blurred** while the old squadron is still in view, `closingForDoor()` true, so a box that saves
     on leave saves into its own squadron and one that refuses its value drops it silently (Safari's buttons take no
     focus, so the press itself does not blur it);
   - (b) every open row's close, in `GUARD_ORDER`, the `skip` rows left out;
   - (c) **the Leave War loop:** each open sheet's close, the closing committed (`flushSync`, outside a render) so the sheet
     unmounts at once and its unmount saves run against 142's war, the list re-read, until it is empty; **the list stays
     honest — a sheet leaves it only at its unmount** (Opus 1). A loop that makes no progress is a fault (its test fails);
     the door then does not enter;
   - (d) **committed before the entry:** straight after `closeOpen()`, `whatIsOpen()` is null and `holdNow()` is `'none'`
     — proved per door by its test; the means (`flushSync`, a module flag) the builder's.
7. **A save the closing started** (6a's blur, a keeping close, Logic's `flushRuleApply`) → the same wait (A9: a save in
   flight is waited for). Not saved → refused with the Retry note, the squadron unchanged; what closed stays closed, its
   words in the Retry. **A press meanwhile drops the wait** (as built): he stays on 142, things closed, the press not
   made, nothing said — stated and tested (Opus 11).
8. **The entry**, as built.

| Door | Where | Note |
|---|---|---|
| the pick (bar, ☰) | `state/pick.ts pickFrom`, `afterAsk`, `enterPicked` | `enterSquadron(u, holdNow() === 'war', true)` kept as a belt |
| the view switch, both ways | `store.ts switchFrom`, `afterSwitchAsk`, `enterRoleView` | + D2827 B (KR-6); the chip's `skip` = "left open" (no press reaches it, B16) |
| a bell line, the lit bell, **the bell's OIL tap** (`topstate.ts bellTap`, its `oilHit` branch — Opus 10) | `belltap.ts enterForLine`, `openBellRequest`; `topstate.ts openNotice` | `closeShown()` → 6–7 |
| the page door, `ownSquadronFirst`, the landing's second ask | `store.ts landOwn`, `landAfterAsk`, `ownFirst` | 6–7 inside the landing |
| the OIL list's card | `OilDayList.tsx openInput` (`skip: ['oilday']`) | the list stays open; it re-keys to the squadron entered (its picks reset) — as today, asserted (Opus 11) |
| an Undo / Redo — row 21, row 13 | `undo-wire.ts squadronRefusal` (K8c's place), `store.ts stepPage` → `landOwn` | **row 21's hook is synchronous** (`undo/timeline.ts` asks it inside `globalUndo`; KR leaves that file alone, agreed with 205): it runs 2, 6 and the step, **not 3, 3b, 4 or 7** — the same as K8 today. What that leaves is named in §14 risk 7 and filed for group B's Undo (D2636). Row 13 runs the full order through the landing |

**Where K10's root meets KR.** KR closes the Input window at every door, so a window open across a pick is gone; the
root still answers a window **held** since midnight (closed at his next pick, Q2), a bell line or the Medical tab opening
another squadron's input (questions 30, 31), and Undo or Redo across squadrons (Build 3). KR changes no line of the root's
patch; whichever lands second re-runs its tests on the other.

---

## 6. The bands (brief item 4)

- **The held Input window** ("This change could not be saved.", D2243 Q7) and **the war under a held window** — unchanged
  at his own move at midnight (a change he did not make). At his next press the window closes (D2825; Q2).
- **The pick's band** (D2323) and **the member view's band** (D2389) with the window's chip — no press reaches them after
  KR (since K4 and K5 for the second). Dead code, **removed with Build 2's refresh card (D2405)**, as the plan §1 item 1
  says — the planner's call not to widen KR (§13). Q2's other answer does not revive the pick's band: a window given
  back on 142 is closed by his next pick of any other squadron (Opus 3).

---

## 7. K3's note, K7's checker, Part A's table (brief item 5)

- **The note — kept for "Not saved" only** (§4). Three Retry notes have no ending of his — the OIL card, a Redo, a press
  naming no door — and stay silent as built until Q1.
- **The checker — re-pointed, and moved early (KR-2, Astra 9, Opus 10):** its first check, at the moment of an entry by
  his press (`enterSquadron` with `byPick`, `switchRoleInForce`), asks `whatIsOpen(skip)` instead of the guard's refusal:
  **the old work must be closed before the entry** — a window the press opens *after* the entry (a bell line's Input
  window, a holiday line's OIL list) is not yet open then, so it is never counted, and no window family is exempted. Its
  second check (nothing opens behind a refusal) stays for Not saved. The allow-list (`rawOnPurpose`, `rawEnter`,
  `rawRole`, `switchRoleViewRaw`) stays. From KR-2 to KR-4 it applies to the doors already converted.
- **The table — kept.** **One hook, `useGuardOpen(id, open, close)`**, replaces `useGuardWork` and `useGuardCloses`: it
  counts the row while open and keeps its latest closer. `say` goes with the words.

---

## 8. The tests (brief item 6)

### 8.1 New, each seen failing first — `src/ui/msq-guard-drops.test.tsx` (jsdom, `withThird()`)
Doors: the pick (bar, ☰); the switch both ways (badge, ☰); a bell line; the lit bell (an access request); **the bell's OIL
tap**; his SANS reminder; a holiday's line; the page door; the OIL list's card; the Undo of "+ New squadron" with 151
picked; row 13's landing.
- **D1 — work open, the press, the change goes through, the work gone, no note** — by family: the Input window with words;
  a Users row changed **and one opened unchanged**; Give access; "Add a person"; "+ New squadron" blank and typed; the
  Calendar with a holiday typed **and one kept waiting (new, and a changed saved one: the saved record unchanged)**; a
  settings window changed; Quals' words; the OIL question from a list row; the OIL list with picks; a Leave War sheet held
  until Save (Rename); a Tracker window (✎ Edit details typed) **and one behind the phone's Flow chart tab (a lull pop-up
  holding its first day)**; the board's cancel-reason box. Each: moved; `whatIsOpen()` null; nothing of it stored on
  either squadron; no toast.
- **D2 — Not saved still refuses, nothing closed** — each door, a window with words open: the Retry note (its words from
  the table), the window still open, nothing changed; Retry lands, the press again: through.
- **D3 — what keeps, keeps, in its own squadron** (the interim of Q4): a template time focused ("0730") → 142's template;
  a plan name half typed → 142's plan renamed; an invalid plan name → dropped, no warning; the Inputs day's new note in
  the picker → written on 142 with no people, 149 untouched; the held bid's remarks, the day list's bid remarks, the
  leave-remarks box — each on 142's war, 149's untouched (a Plan holder whose war follows the pick); Logic's "13h" just
  typed, a bell line → 142 13h, 149 12h.
- **D4 — never held, never swapped under a sheet:** a Plan holder with an ordinary sheet open picks 149: the sheets
  actually mounted are none, `holdNow()` `'none'`, no held band at any moment; **the event presets sheet with an invalid
  preset focused, and with the presets list open:** closed, the war not swapped under it.
- **D5 — a save the closing started fails** → refused, the Retry note, 142 in view, the window closed; **a press during
  that wait** → nothing made, nothing said.
- **D6 — the Tracker:** chart moves unsaved and an "Add event" prompt up, the pick by the keys / the switch both ways:
  the prompt gone, the question drawn and `trackerAsking()` true; Stay → nothing more closed. **An import of three charts
  stopped at the second's question by a pick:** the first stays saved, the third is not imported, no further question.
  **A question standing, a door by the keys:** the new question drawn over the page, `trackerAsking()` true.
- **D7 — the skip:** the OIL card bringing 142: the list open, re-keyed to 142; a second window beside it closed.
- **D8 — row 13 and a Redo:** an Undo landing that brings his own squadron with Logic's value typed: the value on its
  squadron, and the Redo of that Undo still offered.
- **R10** (`msq-guard-rollcall.test.ts`): every `window`, `row` and `closes` row has a closer.

### 8.2 The existing files — each change traced to D2825
An assertion "refused for a window, a row, a form" → **re-pointed** ("goes through, closed, no note"), renamed; Not saved
stays word for word; words of a removed lead → **deleted** (D2825; question 27 moot); a pin of a change he did not make
stays. **Each door step maps every line of KR-1's census to re-pointed / deleted / stays — none unmapped.**

| File | Change |
|---|---|
| `msq-guard-doors` (pick) | B1/B2, B4, B11, B16, B30, B12/B13 (→ "a window and a failed save: Retry note, window open") re-pointed; B3, B4b, the beat, B10, B19, B20, B21 stay |
| `msq-guard-doors-switch` | B5, B11, B12/B13, B16, B30 re-pointed; B4b, B10, B14, B15, B19, B20, B21, P11, row 5 stay |
| `msq-guard-doors-bell` | B6, B6b, B6c, B7, B8, B9, B11, B12/B13, B23, B25–B29, F2b, K7c re-pointed; B7b's entry, B10, B4b, B17, B20, B22 stay |
| `msq-guard-doors-undo` | B24, B23 re-pointed; K8c stays and gains typed work; the card's note block stays silent until Q1 |
| `msq-guard-g` | G1's two refusal clauses re-pointed (the mode ended; the Quals words gone, 149's box empty); the rest stays |
| `msq-guard-note` | every lead's words but Retry's deleted; the place tests re-pointed to the Retry note |
| `msq-guard-open` | A2 → "every row a door closes is seen, with its closer"; A6 + closer, opened-unchanged now counted; A7 → closed wherever it stands; **A12 (the OIL question from a list row) → closed by `setOilConf(null)`, nothing written**; A16 (E1) → the Calendar and its forms close regardless; **A17 → seen while it holds words, emptied at the door**; **A13 → a window behind the Flow chart tab is closed at the door** (re-pointed, not deleted: Opus 9); A4 → closing order; A3, A5, A8, A9, A11, A14, A15 stay |
| `msq-guard-rollcall` | R8 widened; R10 new; R1, R3–R6, R9 stay (R5 re-read for `closeOpen`) |
| `msq-guard-input-sqn`, `msq-guard-drawn-*` / `test-support/msq-guard-a10.ts` | the few refusal lines re-pointed; the rest stays |
| `msq-guard-asis` and the K0 census files (`msq-night-memberview`, `msq-bell-input-ask`, `msq-bell-recheck-after-ask`, `state/msq-trk-cover`, `msq-pick-windows`, `msq-trk-follows-pick`, `msq-trk-pick-ask`, `msq-night-press-held`) | stay — they make a no-press state by the raw entry or switch; any press-refused line re-pointed, named |
| the other files that name the guard (KR-1's census) | each guard-refusal line re-pointed in the door step that turns it red, named |
| **205's:** `msq-s2-rejudge3` (~l.202, ~301), `msq-s2-rejudge4` (~l.1056), `msq-s2-row` (~l.374) | re-pointed by KR in the door step that turns them red, named in its report (205, 27 Nov); `rejudge5`/`rejudge6`'s `workOn` lines — §10 |

### 8.3 Browser tests (K12's, not yet written) — the list KR-8 hands K12
Out: every lead's place at the eight sizes, the Calendar notes rising, the Tracker-tab note. In: the Retry note's place
(under the picker, the badge, the line, the bell, Undo; at the foot on a phone and from ☰; under the band, never over
Retry); a pick on a phone with the Input window open — closed, the fades after the ☰ menu closes (K11); **a template
time box focused in a WebKit browser** (buttons take no focus) — saved on 142; **the focus order of the plan-name box**
(Astra 6); a Leave War sheet closing with no held band drawn.

---

## 9. K5b (brief item 7)

- **D2826 — 205's** (the split, 27 Nov). KR gives it `shutAdd` as the add form's closer; nothing else.
- **D2827 B — KR-6:** in `enterRoleView`, where the switch does not move his pages, the Tracker leaves "Edit chart layout"
  with nothing moved (a new `trackerEndArrange()` in `role.js`; `core.js` running what "Done editing chart" runs when
  nothing is unsaved). With moves unsaved the question asks first (A20). **Both ways — the planner's reading.** Tests
  first beside B14: at home, the editor open, nothing moved, the badge → member view, closed; back → closed; a move
  unsaved → the question, Discard → switched, closed; Stay → as it was. Its own code read (Astra 10).
- **D2827 A** — nothing to build (B15).

---

## 10. Chat 205 — file by file (brief item 8); **205 answered both yes, 27 Nov**

- **`ui/UsersPanel.tsx`** — KR changes only the guard lines: the `userrow` / `archrow` reports in `useRowReports`, the
  `giveaccess` and `addperson` reports become `useGuardOpen(id, opened, close)` with **`closeRow()`, `closeGive()`,
  `shutAdd`, called with no argument**; `useGuardSection('users', …)` removed. Each close is silent and writes nothing.
- **Open, not changed:** an opened unchanged row and an open unchanged Give access count as open for the close (205's
  answer; no refusal is added). **One thing left to settle with 205 in KR-1:** whether anything of 205's still reads
  `workOn`'s old meaning ("changed") — its `rejudge5`/`rejudge6` lines assert "opened, nothing picked → false". If nothing
  but those tests reads it, the lines are re-pointed to "open" with 205's word; if its judge reads it, a separate "changed"
  count stays for 205 alone.
- **205's tests:** KR re-points `msq-s2-rejudge3`, `rejudge4`, `msq-s2-row`'s refused-pick and refused-switch lines in
  the door step that turns them red, named in that step's report (205's answer; Astra 8).
- **`state/undo-wire.ts`** — `squadronRefusal`'s one call renamed; none of U2's grant / `stuck` chain. **`undo/timeline.ts`
  — untouched.** **`ui/topstate.ts`** — nothing beyond K6's lines. **`ui/SquadronsPanel.tsx`** (the core's lines) — the
  three reports → `useGuardOpen` with each editor's `close`; `useGuardSection('squadrons')` removed.
- **Order:** U2 first; KR-1 brings the batch branch in after it. Send 205 this section and §11's file list when the plan
  is approved.

---

## 11. Order and size — trimmed (brief item 9; the coordinator's ask)

**Each sub-step: one Opus builder from a written brief, tests first and seen failing (a patch file, never `git stash`),
a report file; the orchestrator reads the diff, re-runs the touched files, commits, pushes, tells the coordinator.**
**One merge boundary: the coordinator merges KR into the batch branch only after KR-4** — no door half converted
reaches it; KR-5 on merge as they land.

| # | Sub-step | Main files | Size |
|---|---|---|---|
| **KR-1** | **Bring the batch in (after U2); re-read D2821, D2825–D2827 whole; the census of refusal lines. Every closer, no door calling it:** the `close` on every `window`/`row` row; `useGuardOpen` and every report handing its closer (InputsCal, InputsPage, QualsPage, DraftsModal, SquadronsPanel, UsersPanel's guard lines — 205's three closes); `closingForDoor()` and the two boxes that read it (Drafts' name, the event presets); the Leave War loop closer (`closeWarAll`, the list honest); the Tracker bridge's closers and the job-ending serial (`core.js` one registration; `role.js`). Tests: R10; each closer alone shuts its row, writes nothing it does not write today; the Tracker smoke under the checks lock | `ui/guard.ts`, `state/guard.ts`, the report files, `leavewar/ui/Sheet.tsx`, `EventSheet.tsx`, `tracker/app/core.js`, `tracker/role.js` | 6 h |
| **KR-2** | **The closing step and its checks:** `closeOpen(skip)` (6a–6d); the Tracker prompt and the standing question (3b, 4); the save-after-close wait (one helper beside `doorwait.ts`, never a second wait); `guardAsk` refusing only `unsaved` for the doors in `NO_BLOCK_DOORS` (empty here); **the checker re-pointed** (§7) for those doors | `ui/guard.ts`, `state/guard.ts`, `state/doorwait.ts`, `src/testing/entry-checker.ts` | 3.5 h |
| **KR-3** | **The pick and the view switch converted** (both join `NO_BLOCK_DOORS`); D1–D7 for them red first; `msq-guard-doors`, `-switch`, G1, G2, the census lines and 205's lines re-pointed | `state/pick.ts`, `state/store.ts` | 5 h |
| **KR-4** | **The bell (line, lit bell, OIL tap, SANS reminder, holiday line), the page door, the card, the Undo and Redo converted; `NO_BLOCK_DOORS` removed**; D1–D8 for them; `-bell`, `-undo`, `-input-sqn` re-pointed; **the full unit suite under the lock** | `belltap.ts`, `store.ts`, `topstate.ts` (comments), `undo-wire.ts` (one line) | 6 h |
| **KR-5** | **What is now unused comes out** (§4's list); `msq-guard-note` cut to the Retry note; `npm run build` under the lock | `ui/guard.ts`, `guardnote.ts`, `winorder.ts`, `tracker/*`, the reports' files | 2.5 h |
| **KR-6** | **D2827 B** (§9), its own read; the Tracker smoke under the lock | `store.ts`, `tracker/role.js`, `core.js` | 1.5 h |
| **KR-7** | **Q1's endings** — only if he says "say it" (drawn first, D1625) | `ui/guard.ts`, `guardnote.ts` | 1 h — waits on Q1 |
| **KR-8** | **The records**, one docs commit: the plan's §21.1 gains a "KR (D2825)" block winning over §1, §3.1–§3.2's counts, §4.1's "Refused?" column, §4.2, §4.6, each with a pointer (D201); §21.1's table (K3–K8 "refusals out by KR", K8b struck, K5b split); `docs/file-map.md` (the new test file and K12's owed lines: `guardnote.ts`, `test-support/msq-guard-testkit.ts`, `testing/entry-checker.ts`, `test-support/raw-entry.ts`, `state/inputsqn.ts`, `state/doorwait.ts`); `docs/feature-impact.md` (the limit: a form whose typing lives only in its component and never reports is closed by no door — the checker's catch); `OUTSTANDING.md` (`[MSQ-PICK-GUARD]`; group B's Undo item gains §14 risk 7); K12's list (§8.3); `HANDOFF.md`; `npm run docsize` | docs | 1 h |

**New total: 8 sub-steps, about 26.5 hours (25.5 without Q1) — was 15 and 37.**
**What was cut, and why it is safe to cut:**
- **Dropped:** the `'held'` interim refusals for Q2 and Q3 and their step (both rulings let the pick through — Opus 3;
  the Calendar's own ✕ already drops the waiting holiday — Opus 7); the row-kind rename (no safety in a name — Astra 10);
  the separate census step (folded into KR-1); the separate checker step (folded into KR-2, earlier and better); the
  separate K12-list step (folded into the records).
- **Merged:** the module closers, the component closers, the Leave War and the Tracker closers → KR-1 (none changes
  behaviour); the four door steps → two (KR-3, KR-4), keeping the door-by-door switch so no step is half done.
- **Shrunk:** the Tracker closers already exist (Opus 11); the records step.
- **Kept, every one a guard against lost or misplaced data:** Not saved first at every door; the blur while the old
  squadron is in view; the Leave War loop with the honest list (no swap under a sheet, its unmount saves into its own war);
  the Tracker job ending before its prompts are answered; the save-after-close wait; the checker at the entry; R10; D3 and
  D4.

**Checks:** a step's own files without the lock; `npm run build`, the full suite (KR-4), the Tracker smoke (KR-1, KR-6)
under the checks lock, released at once — a held lock is NOT RUN, never a wait in a loop; `npm run lint:changed` each
step (one finding, 205's). **Reads:** after KR-4, Astra and a fresh, blind Opus on the code; the walk's scenarios by
Astra and a fresh, blind Opus (the Fable seat — reads owed, D2819); KR-6 its own read; the batch's FULL check at the end.

---

## 12. Questions for him — four cards (D2439)

**ANSWERED — his "Yes as recommended" to questions 31–34 (27 Nov 26, the coordinator's record on the batch `f808642e7`, D2835–D2838): **31 (D2835)** — a bell line about an OPEN request of a man who has moved opens under his new squadron, brought into view first; a request closed before the move stays with the old squadron; the looks for someone who only views, and for an old squadron's admin only, are drawn for him first. **32 (D2836, KR-Q2)** — a window held since his midnight move closes at a pick. **33 (D2837, KR-Q3)** — a holiday waiting for a leave period is dropped at a switch, and its form says "kept only while this window stays open" (new words: Opus drafts, a fresh Fable reads, drawn first — D2441, D1625). **34 (D2838, KR-Q4)** — a box with no Save button is saved into its own squadron first, then the switch goes through in the same press; if that save fails, the switch is stopped ("Not saved", D2594). KR-Q1 held (`[KR-Q1-HELD]`). Where a line below differs, these answers win; KR-1's builder folds them into §3–§5 and §8 (D2836 removes Q2's case, D2837 adds the form's words and its drop, D2838 makes the save-then-switch with its failure stop part of KR-2's closing step; D2835 is the bell door's, KR-4, with K10's root under D2834).** **Settled 28 Nov (chat A211): D2835's bell squadron — which squadron a bell line about a moved man's open record enters — is K10-c's (`docs/superpowers/plans/2026-11-28-msq-s1-k10-root-plan.md` §3.2, §8); KR-4 only converts the bell door's order (close, no refusal) and changes no squadron it enters.**

**Q1 — Words for three rare presses while a save has failed.**
*Situation:* rare, any admin. A save of his has not gone through — the "Not saved" band with Retry is up — and, before
pressing Retry, he taps a card on the OIL list that would bring another squadron, presses Redo where it would change the
squadron, or presses another button that brings his own squadron back. The press is stopped (that is already his
D2594); today nothing is said. *Choices:* (A) say the Retry note as every other press does: "Blocked: press Retry to save
your changes, then press the card again." · "…then press Redo again." · "…then try again." (words read by a fresh
Fable, drawn on the real app first); (B) leave it silent. *Recommended:* A — one rule everywhere, at no risk.

**Q2 — A window held since his move at midnight, then his own pick of that window's squadron.**
*Situation:* rare — Saber, a master admin moving from 142 to 149, has an Input window open with words when midnight comes;
the app holds it ("This change could not be saved.", Close), his words visible so he can copy them (D2243). In the
morning he picks 142, the window's own squadron. (Picking any other squadron closes it — both rulings agree the pick goes
through, and nothing keeps a 142 window open over 150.) *Choices:* (A) it closes like every other window, the words gone
(D2825, the later ruling — built meanwhile); (B) it is given back live on 142, his words there to edit, as D2654 E5 said.
*Recommended:* A — the pick is his own act, he has had the words in sight since midnight, and B keeps one exception and
its band alive. *Cost of B:* about 1.5 hours.

**Q3 — A holiday the Calendar says it is keeping, then a pick.**
*Situation:* rare, an admin adding a holiday (or changing a saved one's dates) into a year with no leave period yet; the
Calendar says "It is kept here, and saved by itself as soon as a leave period covers it." Before making the leave period
he picks another squadron or presses a bell line that brings one. Nothing of it is saved yet — only the open form holds
it — and **the Calendar's own ✕ drops it silently today.** *Choices:* (A) dropped, as the ✕ drops it — built meanwhile;
(B) the press stops with the note he has seen, "Blocked: cancel the new holiday, or create its leave period, then pick
149." (a new exception to D2825: a missing leave period, not a failed save — Retry would not fix it); (C) B, and the ✕
asks too (new on screen, drawn first); (D) the waiting holiday kept apart from the form, so it survives any close (a
bigger build). *Recommended:* A — no new note, as he asked; the promise already holds only while the Calendar stays open.

**Q4 — Words that keep themselves when he leaves a box or closes a window.**
*Situation:* any admin, now and then: he is typing in a box that saves itself when left — a plan's name, a template's
time, a calendar note — or in a Leave War window whose close keeps his words (a held bid's remarks, Selected days' words,
the closed note; his D1339's "keep the words"), and, without leaving it, picks another squadron or switches view.
*Choices:* (A) kept — saved into its own squadron (142) before the squadron changes, exactly as leaving the box or closing
the window keeps it today; never into the next squadron; a value the box itself would refuse is dropped silently —
built meanwhile; (B) dropped, as D2825's "half-typed work is dropped" reads literally — each of those boxes and windows
then needs a new "discard" way out, and remarks he typed over saved bids would be lost. *Recommended:* A — "as within one
squadron", nothing lost, nothing in the wrong squadron, no new code. *Cost of B:* about 5 hours, and a wider walk.

---

## 13. The planner's readings (none is his rule)

R1 a row closes by its own close as he can press it today; what that close keeps, it keeps (Q4) · R2 a value a box
refuses on leaving is dropped silently at a door (`closingForDoor`) · R3 a change waiting behind its own question (the OIL
question, the medical question, a sign-off behind the OIL list) is open work, dropped as its Close drops it · R4 a Tracker
prompt is open work, gone even if he then answers the chart question Stay · R5 a door pressed while the Tracker's
question stands waits for the old ask to settle, the old one answered Stay · R6 the save-after-close wait follows A9 for
the save the closing starts · R7 the ☰ menu still closes on a refused (Not saved) pick · R8 the pick's and member view's
bands and the chip are left for Build 2's removal (D2405) · R9 D2827 B both ways · R10 the OIL list stays open when its
own card goes through (`skip`) · R11 the checker re-pointed, not deleted.

---

## 14. The risks, each with its answer (brief item 10)

1. **Data lost that was not half-typed.** §3's last column row by row; stored records (a draft leave period, day-class
   presses, saved-as-made fields, saved chart chunks) never touched; D1 asserts nothing stored was removed; what keeps
   itself is kept (Q4), not lost.
2. **Data written into the next squadron** — a blur-save, an unmount save, a sheet's keeping close or a closer's state
   landing after the entry. §5 6a–6d: blur first, the Leave War loop with the honest list, the closing committed before
   the entry, proved per door; D3, D4; the WebKit case in K12's list.
3. **A war swapped under a sheet that did not close** (the event presets' hold). `closingForDoor` skips the hold; the
   loop runs until the list is empty; D4.
4. **A Tracker job running on after its prompt was answered.** The job-ending serial before the answers; every `dlg`
   caller pinned; D6's import case.
5. **The carry fault back** — a door that forgets `closeOpen()`, or a form whose typing lives only in its component and
   never reports. The checker at the entry (from KR-2); R10; R3's census of frames; the limit written in
   `feature-impact.md`.
6. **Not saved weakened.** Steps 2 and 5 before any closing; D2 at every door; D5.
7. **The Undo of "+ New squadron" with 151 picked (row 21) runs no wait, no Tracker question, no save-after-close wait**
   — its hook is synchronous and `undo/timeline.ts` is left alone. **What it can cost, checked:** a value the closing writes
   (Logic's, a blur-save) goes to 151, its own squadron, never 142 (K8c's order); if that save then fails, "Not saved"
   shows on 142 and Retry re-sends 151's change as made; unsaved chart edits on 151's Tracker are not asked about — as K8
   today. **Rejected as KR's (Astra 1):** making the Undo a door that waits needs `timeline.ts`; **filed for group B's Undo
   (D2636)**, named to him with group B. KR adds D8 and a row-21 case with Logic's value typed.
8. **Half a door changed reaching the batch.** `NO_BLOCK_DOORS` only between KR-2 and KR-4; one merge boundary, after
   KR-4.
9. **205's rows closed from outside.** 205's own silent closes, called with no argument (205's answer); 205's files run in
   every door step.
10. **The test churn hiding a dropped assertion.** KR-1's census; each door step maps every listed line.

---

## 15. The red-team ledger (round 1, 27 Nov 26)

Each claim was checked in the code before it was taken. **Of 21 findings (Astra 10, Opus 11): accepted 20, partly
accepted 1 (A1 — its re-architecture of the Undo rejected), rejected 0.** Astra's notes on the questions are folded into
§12.

| # | Finding | Verdict | Reason (from the code) | Changed |
|---|---|---|---|---|
| A1 | Undo row 21 crosses the failed-save boundary; no Tracker question | **partly accepted** | true: the hook in `globalUndo` is synchronous and K8 never asked the Tracker; but the fix needs `undo/timeline.ts` (left alone, agreed with 205), and a closing write goes to 151, its own squadron — no data lands in the wrong one. Named, tested, filed for group B | §5 table, §8.1 D8, §14 r7 |
| A2 | cancelling a Tracker dialog does not cancel its job | accepted | `_dlgCancelled`; the import continues after "Skip"; jobs read `sessionSerial` (l.~7547, ~7602), bumped only by `endSession` | §3 `trk`, §5 3b, D6 |
| A3 | the waiting holiday's protection misses a changed holiday | accepted | report `line ? 'changed' : waiting ? 'noleave' : 'new'` (HolidaysPanel l.313); `refused` sets `waiting` on any `noperiod` | §3, D1, Q3 |
| A4 | the Inputs day's "Escape path" writes a note | accepted | `closePop` → `showDay(null)` → `settlePick` → `cancelPick` → `finishNewNote([])` (l.~287, ~452, ~507) | §3 `inputsday` (kept, Q4), D3 |
| A5 | a Leave War close can refuse to close while leaving the list | accepted | `EventSheet typesBack` returns early on an invalid preset (l.~204); OPEN drops only at unmount (Sheet l.503) | §3 rule, §5 6c, D4 |
| A6 | the blur saves a plan rename the plan said it drops | accepted | `onBlur={commitName}` (DraftsModal ~l.106) | §3 `drafts` (kept), D3, K12 list |
| A7 | a Tracker prompt stops the chart question silently | accepted | `ask: … if (dlg) return false` (core.js l.~133) | §5 3b, D6 |
| A8 | unchanged Admin forms left open | accepted | the reports count "differs"; 205 agrees open counts for the close | §3, §10 |
| A9 | the checker rejects windows a door opens on purpose | accepted | an end-of-turn check would count the bell line's own Input window | §7 (checked at the entry) |
| A10 | the sub-step order breaks "no behaviour change"; two merge rules | accepted | `rowRefuses` knows only today's kinds; §11 vs risk 9 differed | §2 (no rename), §11 (one boundary; KR-6 its own read) |
| O1 | early drop from the sheet list; unmount savers missed; a close that is not a close | accepted | `DayList` l.81, `ReqWords` l.206, `BidPicker` l.554 save on unmount; OPEN drops at unmount with `warWindowGone` | §3 `lwsheet`, §5 6c, D3, D4 |
| O2 | Tracker prompt silent stop; the `switchAsking` race | accepted | l.~133; the `finally` clears the flag after the next ask starts | §5 3b, 4, D6 |
| O3 | Q2's interim refusal is ruled out by both rulings; 150 ≠ 142 | accepted | Build 1's plan l.1322: E5 "the pick goes through and gives it back" | §0, §4, §6, Q2 |
| O4 | the blur rule saves some boxes and drops others | accepted | the day's note boxes, Drafts, the templates all save on blur | §3 (one rule), Q4 |
| O5 | the Inputs day's chosen path writes a note | accepted | as A4 | as A4 |
| O6 | an unchanged Admin row stays open across a pick | accepted | as A8 | as A8 |
| O7 | the Calendar's ✕ already drops the waiting holiday | accepted | `close = () => { setDaysWin(null); notify() }` (DaysWindow l.140), no question | §3, Q3 (recommendation now A) |
| O8 | rulings cited for what they do not say | accepted | D2627 A14/A15 are the note's place; A13 is the Retry words (the full row) | §0, KR-1's re-read |
| O9 | A13, A17, A12 deleted or mis-grouped | accepted | `qualsnew` and `oilrevise` rows still exist; a hidden window is what a closer misses | §8.2 |
| O10 | the checker blind KR-4–KR-8; two merge rules; the bell's OIL tap missing | accepted | `bellTap`'s `oilHit` branch calls `enterForLine(…, 'bell')` (topstate l.~87) | §5 table, §7, §8.1, §11 |
| O11 | the Tracker closers are exported; the wait dropped by a stray tap; row 13's Redo; the OIL list re-keys | accepted | `export function closeEdit` … (core.js l.4763–7530) | §3 `trk`, §5 7, D5, D7, D8; KR-1 smaller |
| A–Q | Astra on the questions (not counted above): Q1 framed as words only; Q2 "the next pick is deliberate"; Q3 "not a failed save"; a missing question on keep-on-close drafts (D1339) | accepted | — | §12 Q1–Q4 |

**Chat 205's answers (27 Nov), folded:** its three silent closes called with no argument; open-unchanged counts for the
close; KR re-points its three files' refused lines (§3, §10). **The coordinator's trimming:** §11.
