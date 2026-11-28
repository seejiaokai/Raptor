# KR plan — red-team read (fresh, blind Opus)

I read the exported copy of ab11fd033 at C:/kr-rt-astra, and nothing else. I read the plan
(`raptor-port/docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md`), the guard's table and seam, every door file the
brief names, and the closers the plan relies on.

**Not checkable from this copy:** D2821, D2825, D2826 and D2827 have no row in `.claude/decisions-full/`, and no other file
in this tree quotes them. The plan says D2825's row is "on the batch branch". So everything below that rests on D2825 rests
on the plan's own paraphrase and on the brief's summary.

Findings are ranked, most serious first.

---

## 1. KR-2's early drop from the sheet list, with sheets that save on unmount or do not really close — words saved into the wrong war or lost, or the war swapped under an open sheet (HIGH: persistence, two squadrons)

**Where:** §5 step 6(d), §3.1 row `lwsheet`, KR-2. Code: `leavewar/ui/Sheet.tsx` (the OPEN list, the MARK closer), `DayList.tsx`
BidWords (l.~81), `ReqWords.tsx` LeaveWords (l.~206), `BidPicker.tsx` heldSave (l.~554), `EventSheet.tsx` (l.~204, ~318).

**What goes wrong:**
- (a) **Saves on unmount that the plan does not list.** Several Leave War parts save typed words only when they leave the
  screen, never on their sheet's close: the day list's bid rows (`pending.current?.()` on unmount), the leave-remarks box
  (`pending.current?.save()` "saved once as the row leaves the screen"), and the held bid's `heldSave` on unmount. §3.1 names
  only `closeKeeping` and `keepWords`.
- Today these are safe because the open sheet holds the war's swap until it unmounts (`warWindowGone` runs in the unmount
  cleanup). So the words land in 142's war first, and the swap to 149 runs after.
- KR-2 has the list drop a sheet "the moment its close runs, so `holdNow()` reads 'none' at once". The pick then swaps the war
  to 149 at once. When the sheet unmounts later, its words go to whichever war is loaded then.
- *Worked example:* Hunter (142, Plan of 149) has the Leave War day list open on 142. He has typed "dentist pm" in a pending
  bid's Remarks box and not left it. He picks 149. The sheet's close runs, the list says no sheet is open, and 149's war
  loads. Then the day list unmounts and its pending save calls `setRequestWords` for 142's bid against 149's war. The bid is
  not found there, so the words are lost. The plan's R3 promises "kept … into its own squadron's war". If a record were
  found, they would land in the wrong war.
- (b) **A sheet's close is not always a close.** The event presets sheet's `onClose` is
  `presets ? typesBack() : onClose()`. `typesBack` blurs a box, returns early with the sheet still open when the box refused
  its value (`if (hold) return`), and otherwise goes back to the "Edit event" sheet (`setView('event')`), which is a new
  Sheet. One pass of the plan's new closer over a snapshot of the list leaves a sheet open. With KR-2's early drop, the list
  can say none is open while one is still mounted. The war then swaps under a live sheet, which is the carry fault the
  build exists to end.

**Cause:** the plan treats "the sheet's own close" as a close that ends all of that sheet's work. The war-hold protection
lives in the unmount, and KR-2 removes it.

**Fix to the plan:**
- Do not drop from the list at close time. Keep the list honest, so it drops on unmount only.
- Make the new closer for every Leave War sheet loop: call each sheet's close, flush so it unmounts at once (its unmount saves
  then run while 142's war is still loaded), re-read the list, and repeat until it is empty or makes no progress. A sheet
  still open after that refuses the door, named in the report. Never enter with it up.
- Add a D3 case for each unmount-saver (day list bid Remarks, the leave-remarks box, held bid): the words land on 142's war,
  and 149's war is untouched.
- Add a D4 case for the event presets sheet: with a preset box focused and invalid, and with the presets list open, the
  sheet is closed and the war is not swapped under it.
- Add the unmount-savers to §3.1's "already stored" column and to R3.

## 2. The Tracker: with a Tracker prompt up and chart edits unsaved, the press now does nothing and says nothing; and R6 has a race (HIGH)

**Where:** §5 steps 2 and 4, §5 "The press while the Tracker's question stands", R6, KR-2. Code: `tracker/app/core.js`
`onBeforeTrackerSwitch.ask` (l.~133), `uiChoice` / `_dlgShow` / `dlgClose` (l.~2520–2545), and `switchAsking`.

**What goes wrong:**
- (a) The switch question's ask starts with `if (dlg) return false`, which resolves "stay" silently. Today the guard's `trk`
  row refuses first, with a note, whenever a Tracker prompt (`dlg`) is up, so that line is never reached. After KR, step 2
  no longer refuses for `trk`, and step 4 asks the question before anything is closed.
- *Worked example:* Saber is arranging a chart (unsaved moves). He opens a Tracker prompt, such as "Delete …?", and its shade
  covers the bar. He reaches the squadron pick by the keyboard and picks 149. The pick moves the Tracker away, so the
  question is asked, but a prompt is up, so it answers false. Nothing closes, nothing moves and nothing is said. That is the
  silent refusal D2825 does not keep, and the plan's own text calls it that.
- (b) R6 answers a standing question "Stay" and then asks the new press's question. The old question's `finally` sets
  `switchAsking = false` one microtask after `dlgClose`. By then the new press has already set `switchAsking = true` and
  opened its own question. The old `finally` clears the flag, so `trackerAsking()` reads false.
- The new question is then not drawn over the page (TrkAskOnly shows only while the flag is set), and the `trk` row counts it
  as an ordinary prompt. In the member view the door waits on a question he cannot see, and the next door press "closes" it
  as a cancel.

**Fix to the plan:**
- Before step 4, when a Tracker `dlg` prompt that is not the switch question is up, close it by its own Cancel answer (and
  every queued prompt). It is open work, which D2825 drops.
- Or, if that clashes with "a Stay closes nothing", have the bridge's switch ask take an explicit "prompt up" answer, and
  have the door close the prompt and then ask. State the order in §5 and test it as a new D6b.
- For R6, the new question must wait until the old ask has settled, its `finally` included: chain on the old promise, or
  make the flag a counter or token. Add a test: with a question standing, a door by the keys gives a question that is drawn
  over the page and that `trackerAsking()` reports as true.

## 3. Q2's interim refusal is a refusal neither ruling keeps; and its recommendation treats a pick of 150 like a pick of 142 (HIGH: his rulings)

**Where:** §0's last table row, §4 ("Stays a refusal … Q2's held windows"), §6, §8.1 D8, §12 Q2, KR-3 / KR-11.

**What goes wrong:**
- D2654 E5 (the full row, and Build 1's plan l.~1322: "A window held since midnight does not count: the pick goes through and
  gives it back"). D2825 also says the pick goes through. The two rulings agree on the pick. They differ only on what
  happens to the window.
- The plan's interim refuses the pick ("refused as today"), the one outcome both rulings rule out. Today's refusal exists
  only because K10's root is not built. KR builds a brand-new `'held'` refusal row to keep it.
- *Worked example:* Saber moved from 142 to 149 at midnight with a 142 Input window held. In the morning he picks 142 and gets
  "Blocked: close the open window, then pick 142." Under E5 he should have his window back live. Under D2825 he should be on
  142 with it closed.
- The Q2 recommendation ("E5 stands … the held window stays") covers "he picks 142 — or 150". E5's give-back only makes sense
  for the window's own squadron.
- If he picks 150, "stays" leaves a 142 window open over 150. Build 1's plan says that greys it with the pick's band. That is
  the carry state D2825 removes, and no ruling recommends it.

**Fix to the plan:**
- The interim follows the rulings as they agree: the pick goes through.
- For the window's fate until he answers, take the later ruling (D90): it closes. Or keep E5's give-back for a pick of the
  window's own squadron only. Either way, no `'held'` refusal row for Q2.
- Reword Q2 as two cases: (i) he picks the window's own squadron, where E5 gives it back and D2825 closes it, which is his
  choice; (ii) he picks any other squadron, where it closes (D2825, with nothing in E5 against it). That is not a question.
- §6's "pick's band kept while Q2 stands" then becomes dead on (ii), so note it for Build 2.

## 4. The rule "blur the focused box first" saves things the plan says are dropped, and drops things it saves elsewhere (MEDIUM-HIGH: words lost or saved against the plan's own table)

**Where:** §5 step 6(a)–(b), R12, §3.1 rows `drafts`, `inputsday`, the template rows; §8.1 D1 ("Plans with a name half typed
(gone on return)"). Code: `ui/DraftsModal.tsx` (`commitName` on `onBlur`, l.~106); `ui/InputsCal.tsx` (note boxes saving on
blur, l.~1094, ~1145); `DutyTplModal.tsx` / `WaveTplModal.tsx` (`commitTime` on blur).

**What goes wrong:**
- Plans' name box commits a rename on blur. Step 6(b) blurs the focused box before step 6(c) runs `setNm(null)`.
- *Worked example:* he types "Plan B – wx" in a plan's name box and, without leaving it, picks 149. The blur renames 142's plan
  to "Plan B – wx". The §3.1 row says "what is lost: a half-typed plan name", and the D1 test expects it gone. The test will
  fail, and the builder will have to choose without a rule.
- The Inputs day's note boxes also save on blur, exactly like a template's time box. The plan drops those (6(a) sets
  `noteGone` first) but saves the template time (6(b)) and the Leave War boxes (R3, R12).
- D2825's own words are "as within one squadron". Within one squadron, leaving any of these boxes saves it. The plan applies
  that to some boxes and not to others, and §13 does not list the split as a reading. R2 and R12 are each listed, but not
  their clash.

**Fix to the plan:**
- Add a column to §3.1, "a box inside it that saves when left: saved or dropped", with one rule for all of them. The rule
  that matches "as within one squadron" is to save each into its own squadron. If the planner wants "dropped", that is a
  product choice: put it to him as a question.
- Put Plans' `setNm(null)` in 6(a) if its name is to be dropped, or change the §3.1 row and the D1 case to "saved, to 142's
  plan".
- List the split in §13.

## 5. The Inputs day's "Escape path" writes a note — the plan's chosen drop path is not a drop path (MEDIUM)

**Where:** §3.1 row `inputsday`, R2. Code: `ui/InputsCal.tsx` `closePop` (l.~507), `showDay` (l.~287–292), `settlePick` /
`cancelPick` / `finishNewNote` (l.~452–456), Escape (l.~611), and the FloatWin `onClose={closePop}` (l.~1026).

**What goes wrong:**
- The plan contrasts "its Escape path (`noteGone`, then `closePop`)" with "✕'s `showDay(null)`, which runs `settlePick →
  finishNewNote`". They are the same function. The day's Escape calls `closePop`, the ✕ calls `closePop`, and `closePop`
  calls `showDay(null)`. With a picker up for a new note, `showDay` runs `settlePick`, which is `cancelPick`, which calls
  `finishNewNote([])`. That writes the note's words as a note with no people. `noteGone` does not guard it.
- *Worked example:* on 142's Inputs calendar he presses "+ Note" and types "brief the new guy". He presses "+ people" (the
  words pass to the picker) and, with the picker up, picks 149. The plan's closer writes a 142 planning note, "brief the new
  guy". D1 says "no note written, on either squadron". The closer also starts a save, which step 7 then has to wait for.

**Fix to the plan:** the `inputsday` closer is a new one, not the Escape path. Set `noteGone`, call `shutPick()` without
`finishNewNote`, clear the note box and its draft (`setPopPuckEdit(null)`, `setPuckDraft('')`, `setDelAsk(null)`), then
`setPopIso(null)` without going through `showDay`'s settle. Or apply finding 4's "saved" rule on purpose and say so. Add a
D1 case for "the picker up for a new note".

## 6. R9 keeps an opened, unchanged Admin row open across a squadron change — against "what is open closes" (MEDIUM)

**Where:** §7.3, R9, §10 (205's (b)).

**What goes wrong:**
- D2825 (as the plan states it): "what is open closes". The plan closes every window "whether typed in or not, as it is a
  window", and drops E1's `dirty` gate for the settings windows. But it keeps Admin's rows, forms and "+ New squadron"
  reporting only while "anything differs".
- An opened, unchanged Users or Squadrons row therefore has no closer and stays open across the pick.
- *Worked example:* a master admin opens Ranger's row on 142's Admin → Users, changes nothing, and picks 149. Whether the row
  is still open on 149's page depends on 205's page, not on the guard. If it is, his next edit there is a 142 row edited
  with 149 in view, the carry fault of P2 1.
- Closing it costs nothing, which is the plan's own argument for not bothering. It is also the argument for closing it.

**Fix to the plan:** report each row while it is opened (`on` = opened) and close it at every door. Ask 205 only for the
name of the close function, not for a choice between "opened" and "differs". Remove R9 as a reading, or put it to him.

## 7. Q3: the Calendar's own ✕ already drops the kept-waiting holiday silently, and D2825's "Not saved" may already cover it (MEDIUM: whose question, and is the recommendation sound)

**Where:** §3.1 row `holiday`, §12 Q3. Code: `ui/DaysWindow.tsx` `close` (l.140, `setDaysWin(null)`, no question);
`ui/HolidaysPanel.tsx` (the waiting form, l.~310–357, ~416).

**What goes wrong:**
- Within one squadron, pressing the Calendar's ✕ while a holiday is "kept here" unmounts the form and loses the holiday with
  no word. The screen's promise already does not hold inside one squadron.
- Q3's case for refusing ("because the screen told him it is kept") leaves this out. D2825's "as within one squadron" points
  the other way.
- On the other side, the waiting holiday is a Save he pressed that has not been saved. That is how the plan itself words
  D2594 in §0 ("a change he pressed Save on that has not saved"). So refusing may not need a new question at all.

**Fix to the plan:** rewrite Q3 to state both facts: (i) today the Calendar's ✕ drops it silently; (ii) it is a Save pressed
and not yet saved, which fits D2594's own words. Offer three answers: refuse, like "Not saved"; drop, as the ✕ does; or
refuse, and also make the ✕ ask (a new thing on screen, drawn first, D1625). Recommend one with that reasoning. It is still
his to answer, because the promise words are on screen.

## 8. Rulings cited for what they do not say (MEDIUM: lesson 32)

- §0, "Not changed by D2825 … every change he did not make (D2403's own reading; **A14, A15** — nothing is asked or closed at
  his own move at midnight…)". D2627's A14 and A15 say where the note stands (under the control wherever the top bar shows
  the picker; at the foot on a phone with Inputs settings or the Calendar open). "Nothing asked or closed at a change he did
  not make" is the subject of the TEST blocks named A14 and A15 in `ui/msq-guard-open.test.tsx`, not of his rulings. Cite
  D2403's reading (which the plan does) and the tests by file.
- §0's table lists "D2627 … **A13 (the refusal half)**" as set aside. A13 is the Retry note's words, which the plan keeps (§4,
  §7.1). Remove A13 from the set-aside list, or say exactly which half goes.
- D2825, D2821, D2826 and D2827 are not on this branch. KR-0 should first bring in the batch branch, then have the builder and
  the orchestrator re-read each row whole, and check the plan's paraphrase in §0 (above all "as within one squadron
  (D2821)", which decides finding 4) against it before KR-1.
- §1 states the plan's reading R12 as what he will see ("A box that saves itself when he leaves it … saves into its own
  squadron first"). Mark it as the planner's reading there too.

## 9. Tests deleted or dropped that should be re-pointed (MEDIUM)

**Where:** §8.2, the row for `ui/msq-guard-open.test.tsx`.

- **A13 (a Tracker window behind the phone's Flow chart tab) is "deleted with `behind`".** What it pins, a window that is open
  but hidden behind a tab, is exactly what a closer can miss: a lull pop-up behind the Info tab, holding a first day that
  lives only in `lullPick`. Re-point it: "a Tracker window behind the Flow chart tab is closed at the door, by its own
  Cancel". Do not delete it.
- **A17 (Quals' "Add qualification" box) is "dropped".** The `qualsnew` row still exists and still needs its closer (the box
  emptied). Re-point A17 to "seen while it holds words, emptied at the door, 149's box empty".
- **A12 is the OIL question from a row of the Inputs list (`oilrevise`), not E1's.** The plan groups it with A16 under "E1's
  `dirty`/`holds`". Re-point A12 to "closed by `setOilConf(null)`, nothing written".

## 10. The order of sub-steps (LOW-MEDIUM)

- **The checker is blind from KR-4 to KR-8.** From KR-4, `guardAsk` refuses only "Not saved" for a converted door, so K7's
  first check ("asks the guard again… throws where that refuses") passes whatever is still open at the entry. A door that
  forgets `closeOpen()` stays green until KR-8. Fix: move the re-pointed first check (KR-8) to just after KR-3, gated on
  `NO_BLOCK_DOORS`, so each door step is checked as it converts.
- **Two merge rules.** §11 says "only once KR-8 has landed"; §14 risk 9 says "only after KR-7". Choose one: KR-8, given the
  point above.
- **The door list.** §8.1's door list leaves out the bell's own OIL tap (`ui/topstate.ts bellTap`, the `oilHit` branch, which
  calls `enterForLine(…, 'bell')`). It shares the function but is a separate press, and should be in D1 and D2.

## 11. Smaller points

- §3.1 row `trk` says the Tracker's closers are "none exported today". `closeEdit`, `closeInfo`, `closeModal`, `closeOrd`,
  `closeCopy`, `closeFlexWin`, `closeShowAll`, `closeLullPicker` and `closeLullCopy` are all `export function` in `core.js`.
  KR-2 needs only the bridge's registration. Its estimate falls.
- §5 step 7: the doors' wait is dropped by any pointer-down or key-down. After `closeOpen` has closed everything and a
  blur-save is in flight, one stray tap leaves him on 142 with the windows gone and the pick never made, and nothing said.
  This is acceptable under D2825, but it should be stated, with a test.
- Row 13 (an Undo's landing): `landOwn`'s closing runs after the Undo's writes. A blur-save or Logic's flush there is a new
  step that may clear the Redo of the Undo just taken. Risk 8 covers only row 21 with a Redo. Add a row-13 case: Undo, land,
  then Redo still possible.
- The OIL list's card `skip` (R11): when the list was opened with no squadron of its own, it reads `pageUnit('own')`. After an
  entry it re-keys to the new squadron, its picks reset and a held sign-off stops showing. It is the same as today and
  harmless where the card brings in its own squadron, but D7 should assert what the list shows after the entry.

## Where I found nothing

- **Closers that are truly drop-only (read in code):** the Input window (`setInpEdit(null)`), the medical question
  (`setMedMove(null)`, which writes nothing), the OIL question before a change (`setOilWait(null)`; the change is not made
  until it is answered), the OIL list's ✕ (picks and the held sign-off dropped, nothing signed; "Later" correctly avoided),
  the two settings windows, the Calendar, and "Every Monday".
- The holiday's draft is indeed not stored. The draft leave period it can create is indeed stored and left alone.
- **Doors:** every caller of `refuse(`, `closeShown()` and `enterSquadron(…, true)` in the six files is in §5's table. The
  bell's OIL tap is the one gap in the test list (§10 above). `maybeReenter` and the midnight move stay out of `closeOpen`, as
  §14 risk 7 says.
- **"Not saved":** stays first, before any closing, at every door, and D2 covers it. The Retry note's words and place are
  kept.
- **Q1:** it is his (words on screen). The recommendation is sound, given that the words are drawn first (D1625) and adjusted
  by a fresh Fable (D2441).
