# Walker B (jb): every door into a move, and the windows left open across one

Night of 24 Nov 26, build `fcca051f0`, served frozen on port 4712. Desktop = 1536 Chromium (d). Phone = 402 WebKit (p).
Scripts: `raptor-port/scripts/handpass/n153/walk/jb-*.mjs`. Pictures, under `docs/handpass/2026-11-24-msq-night-check/jb/`.
Raw logs: the session scratchpad, `job4/jb/`. No page or console error in any run (every run's `errs` is 0).

**Result: 36 rows (18 scenarios at 2 sizes): 30 PASS, 4 FAIL, 1 RECORD, 1 NOT WALKED. Three separate faults (F1 to F3).**
**The worst fault was not seen:** in no walk did one squadron's training data show in, or get written to, another, apart from
the open question q5's known state and the stale second tab of S25 (both recorded below).

## Exceptions to "press the app's own controls"

1. **A person's own move at midnight:** the dated move is written at the sign-in card by `msq-rs-lib` (`world({ moves })`), the
   one storage write the brief allows, and the page clock is run past midnight (`clockTo`). Scripts `jb-s26.mjs`, `jb-s26c.mjs`.
2. **Import (S5):** the operating system's file picker cannot be driven, so the file is handed in through the app's own test
   door, `window.__pickOpenForTests`. Every later step is a press. The file is a real export of 142.
3. **Export on the desktop:** Chromium's save picker cannot be driven, so it was switched off for that one press and the app
   saved by its ordinary download, as it does on an iPhone.

## Results

| Id | Size | Verdict | What the screen showed | Picture |
|---|---|---|---|---|
| S5 | d | PASS | At "already exists", the bar is covered and the keys stay in the box, so no pick can be made. Skip, Discard door (Cancel keeps the draft, OK drops it) and a finished import all stayed in 142; 149 unchanged after a reload | `s05-d/b2-after-door`, `s05-d/f2-149` |
| S5 | p | PASS | The same; the ☰ is covered at the question | `s05-p/f2-149` |
| S15 | d | PASS | From Inputs and from Help: asked over the page; Stay, Discard and Save each right; 149 offers only View-only Sched and Help | `s15-d-s15/15-inputs-Save-3-return` |
| S15 | p | PASS | The same six cases; the menu closes before the question | `s15-p-s15-inputs-Discard/15-inputs-Discard-1-asked` |
| S16 | d | PASS | The bell asks; Stay has no late jump; Discard and Save open 149's Users with the request waiting; each chart right afterwards | `s16-d/a1-asked` |
| S16 | p | PASS | The same | `s16-p/a1-asked` |
| S17 | d | PASS | Undo and Redo, by button and by Tab + Enter, each act on their own squadron. **RECORD:** 142's Redo stays offered after a new change on 149, and works | `s17-d/c2-142-redo-record` |
| S17 | p | PASS | The same by button (a phone has no Tab key) | `s17-p/c2-142-redo-record` |
| S18 | d | PASS | Picks 142, 149, 151 and 142, 149, 142 on the first load, after it and with the Tracker hidden: the last pick wins, the next mark lands there | `s18-d/d2-settled` |
| S18 | p | PASS | The same | `s18-p/d2-settled` |
| S21 | d | PASS | Grading, Edit events and layout mode: pick works, window closes. The other windows cover the bar. By the keys, details, both reorders, export, lull, copy lull and failures: pick lands, window closes. Show All and Flex keep the keys inside. Nothing written to either squadron | `s21-d/grading-2-after-pick` |
| S21 | p | PASS | Grading, Edit events and layout mode the same; every other window covers the ☰, so no pick | `s21-p/grading-2-after-pick` |
| S24 | d | **FAIL (F1)** | Member view asks nothing and keeps the draft. A pick then does nothing visible | `s24d-d/01-after-dead-pick`, `s24-hunter-d/Discard-3b-question-comes-up` |
| S24 | p | **FAIL (F1)** | The same | `s24-hunter-p/Discard-3-pick`, `s24-hunter-p/Discard-3b-question-comes-up` |
| S25 | d | PASS | Plan to View, access removed, master removed: after a refresh, or sign-out and in, only the right pages. **RECORD** below | `s25-d-view/A-view-3-stale-mark` |
| S25 | p | PASS | The same | `s25-p-view/A-view-3-stale-mark` |
| S26 | d | PASS, one part NOT WALKED | Clean and dirty across midnight: marks and draft kept, a new mark's day moves to the new day. His own move: clean lands on 149; dirty as q5. **Leave War's today signs NOT WALKED** (none readable on its opening months) | `s26c-d/a2-after-mark`, `s26c-d/b2-after` |
| S26 | p | PASS, one part NOT WALKED | The same | `s26c-p/a2-after-mark` |
| S27 | d | PASS | Add and Rename course: Discard then cancelled name drops the edit; the fresh save carries only the fresh event; gone after a reload | `s28-d-addCourse-renCourse-addSyl-dupSyl-renSyl/addCourse-4-cancelled` |
| S27 | p | PASS | The same | `s28-p-addCourse-renCourse-addSyl-dupSyl-renSyl/` |
| S28 | d | PASS | Every door: Cancel keeps the work, Discard drops it whatever follows. Duplicate, Rename and Delete syllabus ask their own questions, each right | `s28c-d/d2-2026` |
| S28 | p | PASS | The same | `s28-p-delSyl-delCourse-courseSel-sylSel-importFile/z2-142-reload`, `s28c-p/d2-2026` |
| S34 | d | PASS, one part NOT WALKED | Stay, Discard, Save right; the next person has no Undo or draft of Hunter's. Save with writes refused: **RECORD** below. **Sign-in rename NOT WALKED** | `s15-d-s34/34-Save-4-hunter`, `s15-d-s34/34-fail-2-after-save` |
| S34 | p | PASS, one part NOT WALKED | The same | `s15-p-s34/34-Save-4-hunter` |
| S48 | d | PASS | Master, Plan, View and one-squadron: lists right; one squadron has no dropdown | `s15-d-s48/48-plan-4-bar-picked` |
| S48 | p | PASS | The ☰ and bar lists agree. A clean pick keeps the menu open and folds the list; a dirty pick closes it before asking | `s15-p-s48/48-plan-3-dirty-asked` |
| S49 | d | **FAIL (F2)** | Band right, words kept, greyed, Close and ✕ live. But the form is replaced by a shorter one and the way back cannot be pressed | `s49b-d/02-held`, `s49b-d/03-after-press-at-switch` |
| S49 | p | NOT WALKED | The open form covers the ☰, so the member view cannot be reached with it open | `s49-p/49-existing-2-covered` |
| S50 | d | PASS | Dragged range and person window (from the grid): both bands, greyed, balance boxes stay boxes, back live. The day window's shade covers the chip and the bar (RECORD) | `s50-d/mv-person-2-held`, `s50-d/mv-day-2-covered` |
| S50 | p | PASS | Person window the same. Day window: a ☰ tap only closes it (RECORD). A dragged range cannot be made in WebKit (NOT WALKED) | `s50-p/mv-person-2-held` |
| S51 | d | PASS, one order blocked | Leave War: both orders right. Input: pick then member view right, the pick's band stays. Member view then pick blocked by F2 | `s49-d/51b-picked-held` |
| S51 | p | PASS, Leave War only | Leave War right; an Input window covers the ☰ | `s50-p/mv-person-2-held` |
| S52 | d | PASS | The Escape question over a form, then a pick: form held, one Escape takes the question only, back on 149 live with its words | `s49-d-52b/52b-3-after-esc` |
| S52 | p | RECORD | With the Escape question up, the form covers the ☰, so no pick can be made | `s49-p-52b/` |
| S53 | d | **FAIL (F3)** | Inputs and SANS settings close at a pick, nothing saved. With the Calendar window open the list opens behind it | `s53b-d/02-list-open`, `s53-d/sans-2-after-pick` |
| S53 | p | PASS | All three close at the pick, nothing saved | `s53-p/cal-2-after` |

**The brief's must-press list:** Undo and Redo across squadrons (S17); the bell (S16); his own move at midnight (S26); the member
view with a draft (S24); a right taken away while on that Tracker (S25); editor, dialogs and layout mode at a pick (S21); import
and delete course through Discard (S5, S28); a pick during first load (S18) and on top of a mark and a save (below) were all pressed.

**A master admin through many squadrons** (`jb-many.mjs`, `many-d/`, `many-p-a/`, `many-p-b/`, `many-p-c/`): four squadrons made
through Admin, six in all, each with its own course and mark count. Tours, Undo and Redo in each, a pick straight on top of a mark
and on top of a chart save, and a reload: every squadron kept only its own, at both sizes. On the desktop, the Undo, Redo and
pick-on-a-save parts ran in `many-d`; the reload in `many-d-c`.

## The faults in full

### F1. With unsaved chart edits, a pick in the member view looks dead, and its question appears later (S24, d and p)

**Steps from a clean world:** Saber gives Hunter Plan of 149. Hunter picks 149, opens the Tracker, makes an unsaved chart edit
(pencil, Edit chart, + Test). He switches to the member view (asks nothing, correctly). He picks 142.

**What happened:** the list closes and nothing else: no question, no move, no note. Pressing again, or Enter on the row, does the
same. The question has in fact opened inside the hidden Tracker page, at zero size. When he later returns to the admin view it
appears over View-only Sched: "Save them before switching to 142?", about a pick he may have made minutes ago. Answering it then
does what it says (Save or Discard moves him to 142, Stay stays). Same for Hunter and for Saber. With no draft, the same pick moves at once.

**Should have:** the question shows at the pick (S24: "a later pick still asks"; D2637, D2318). **Data:** nothing lost or written
across, in all three answers, read back in both squadrons and after a reload.
**Scripts:** `jb-s24.mjs`, `jb-s24c.mjs` (the clean control), `jb-s24d.mjs` (reads the hidden box).

### F2. An Input form held by the member view is a shorter form, and its "Switch back" cannot be pressed (S49, desktop)

**Steps from a clean world:** Saber gives Hunter Plan of 149. Hunter picks 149, Inputs, List, All dates, opens Hunter's 9 Jan OIL,
types in Remarks, presses the role chip.

**What happened:**
1. The page goes to View-only Sched and the form **is replaced by a shorter window in the middle of the screen**: Person, Several
   people and the Dates calendar are gone, with "The person and the dates are changed on the Inputs page." (an existing input).
2. The band says **"Switch back to the admin view to change this, or close it."**, but the window's shade covers the role chip, for an
   existing and a new input alike. Sixty presses of Tab never reach it either.
3. **A press on the chip, where the band sends him, closes the form and his typed words are lost, with no question.** He stays in
   the member view. (Walked on an existing input.)

**Should have:** the form kept and greyed, Close and ✕ live, and the way back usable (D2389; S49 "Disproved by: simplified
replacement form, lost text"). A held **pick** does this properly: same form, same place (`s49-d/51b-picked-held`).
A Leave War person or range window also does, because the page stays where it is.
**Scripts:** `jb-s49.mjs`, `jb-s49b.mjs`; the keys run is in `keys/s49b-d/`.

### F3. With the Calendar window open, the squadron list opens behind it (S53, desktop)

**Steps from a clean world:** Saber, Inputs, the gear, "Calendar…". Press the squadron mark at the top left.

**What happened:** the list opens underneath the Calendar window, only its heading showing. A press where the 149 row lies lands on
the Calendar's title: no pick, both windows stay. On the phone the same pick works and the windows close.

**Should have:** a pick reachable, the settings windows closing at it (S53, D2396(k)), or the list on top. Nothing is written.
The keys' door was not tried here. **Script:** `jb-s53b.mjs`.

## RECORD items and the open questions

- **S17:** 142's earlier Redo survives a new change on 149. Each squadron keeps its own Undo list.
- **S25, the stale second tab:** after Saber lowers or removes Hunter's right, Hunter's already-open tab still takes a mark on 149
  with no message, and **it is saved** (149 went from 2 to 3 marks, read back by Saber), in all three cases at both sizes. After a
  refresh, or sign-out and in, he has only the right pages. The brief says two live tabs do not sync and this alone is no regression.
- **S34, Save at sign-out with every write refused (`?savefail`):** he is signed out to the card, under the band "Not saved, keep
  this page open" with Retry. No false "saved". This is the built behaviour of D2322.
- **q3 (seen with Hunter, not Saber):** his own 142 form at the member view: no band, no Save drawn, Remarks not editable, Close live.
- **q4:** NOT WALKED with a draft. S25 walked the right taken away on a clean chart only.
- **q5, confirmed as described:** after his own move with unsaved edits the bar reads 149 while the chart is still 142's. A mark,
  Undo or Save brings the box "This change could not be saved." and writes nothing. In the editor the band reads "You are 149's from
  today. This can't be saved in 142's Tracker."; outside the editor there is no band. Discarding by the chart's own door lands him on 149.
- **q6:** "This is 149's Tracker. Leave the member view to open it." is on the page only while unsaved edits hold the Tracker.

## Not walked

S26: Leave War's today signs, and a real machine sleep (the clock jump stands in). S34: the sign-in rename. S49: several-person and
already-read-only forms. S50: several-entry day, approved-leave window, and the Balances and My leave doors. S52: the document
viewer. S53: the SANS reverse (pick first, then save).

## Script mistakes, so nobody reads them as faults

Some logs hold `FAIL` lines that are my scripts' own, each read against the screen:
- `s28a`, `s28b`: Duplicate, Rename and Delete syllabus and Import have their own questions, walked in `jb-s28c.mjs` and `jb-s05.mjs`.
- `s34`, "a refused Save does not sign out": my check was wrong; the sign-out is built that way (D2322).
- `s48-p`, "the mark folds its list": a clean pick already folds it, so my tap reopened it (`jb-s48b.mjs`).
- `s26c-d`, part B: that Hunter holds 142 alone, so he had no 149 to pick.
- `s49`, part 52: a single input's Delete asks nothing and deletes at once (with Undo), so my press really deleted one input in that
  throwaway world. Part 52b replaces it.
- `s25-d`, `s25-p`, `s15-p-s15`, `s28-d`, `s28-p`, `s28-d-addCourse-renCourse`: earlier or partial runs. Cite the folders above.
