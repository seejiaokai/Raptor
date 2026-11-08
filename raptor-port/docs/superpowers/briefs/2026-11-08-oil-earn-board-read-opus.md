# The fresh, blind Opus code read — OIL Earn on the Scheduler Board (8 Nov 26, on e4677d032)

Copied whole from the reader's hand-back (taken from the chat's transcript, the two-space indent of the hand-back removed); the brief: `2026-11-08-oil-earn-board-code-read.md`. Nothing below is edited.

# Code read: OIL Earn on the Scheduler Board (D1782, D1783, D1793)

**Reader:** fresh Opus, blind. I did not open the walk's report, its pictures or any other reader's report.
**Scope:** `git diff 549482bd5 e4677d032 -- raptor-port/src`, plus the drawers, click routes and writers around it. I changed no file and ran no app, build or test. Every failure below comes from reading the code. Each one names the exact input so the host can run it.

## Roll-call: every place in OIL Earn where a man's puck can be tapped

| Surface | What the promise needs in the mode | As built | Verdict |
|---|---|---|---|
| Flying lines, SC shifts (`sbSlot`) | switch, or inert with its reason | `oilSeatHTML` → `data-oilp`, or inert with `data-oilsay` / `data-oilmask` | ✓ |
| Duty desks, sims (seats, passengers, extras), ground rows, landed inputs, shared-input rows (`sbSeat`, `sbGroupPeople`) | same; a placeholder body picks nothing | named man → `oilSeatHTML`; placeholder → plain seat, caught by the new body branch | ✓ (wording: F3) |
| Common Programme's own rows | same | own builder → `oilSeatHTML`; placeholder caught by the body branch | ✓ (wording: F3) |
| Personal Inputs | asking kinds a switch; leave, medical, Personal inert | asking → `oilSeatHTML`; others → `oilInertWrap` | ✓ (placeholder wording: F3) |
| Unavailable | leave and medical inert; overseas duty a switch | as needed | ✓ |
| **SANS Avail cards** (`sansCardsHTML`) | inert, says why, picks nobody | **plain puck: picks him** | **✗ F1** |
| Available crew panel | not drawn in the mode | withheld (`mvRO`) | ✓ |
| Notes, sign-off strip, checks panel | no pucks | none | ✓ |
| Crew roster (`#sbRoster`) | not covered by D1783's "row" | still selects; deliberately excluded by the new guard | question (negatives) |
| ALL AVAIL window | own handler, selects nothing in the mode (D65) | as built | ✓ (foot wording: F6) |
| Day bar: switch (D1782) | one press, one change; keys stay | yes | ✓ apart from F2 |
| Day bar: phone marks (D1793) | page-of-blocks and ticket marks, 23px buttons | yes | ✓ |

## Findings, most consequential first

### F1. In OIL Earn, a tap on a man in the SANS Avail panel still selects him and says nothing (a missing call site; already on `main`, not reached by this branch)

- **Failure.** In the mode the board draws the SANS panel read-only: `sbSansPanel(d, di, dayInp, mvRO)`, and `mvRO` is true in the mode. `sansCardsHTML` (`ui/html.ts`) then draws a plain `<div class="sanscard">` with an ordinary `.puck[data-person]`.
  - In `boardArmClick`, that puck has no `data-oilp`, no `data-oilsent`, no `.oilpk.inert` and no `.puck.allavail`. The line `const bpk = t.closest('.puck[data-person]'); if (bpk && !isSpecial(...)) return` returns without `stopPropagation`.
  - `routeClick` then reaches `.puck[data-person]` and calls `view.selectPerson` and `scrollBoardWarnToSel`. The man lights blue everywhere and the checks panel scrolls to him, with no note.
  - This breaks D1783 ("picks nothing and says why") and D65 as carried to the board ("inside the mode no tap selects"). The host's reading 3 names SANS Availability among the kinds that never ask.
- **Cause.** The change reached `sbInpRow` (Personal Inputs, Unavailable), but SANS rows are filtered out of both panels and drawn by `sansCardsHTML`, which the change never touched.
- **Input to run.** Phone 402×874 touch, and desktop 1536×864 mouse.
  1. On a weekend day that offers OIL Earn (the tests' Saturday, 18 Jul), use the board's SANS Avail "+ Add" to file an all-day SANS availability for a SANS man.
  2. Press OIL Earn.
  3. Tap his puck in the SANS Avail card.
  - Expected: no blue anywhere, and the note "Nothing changed for <callsign>. A SANS availability request earns no OIL."
  - Disproof: his pucks light blue, or the checks panel jumps to him.
- **Fix, step by step.** This route changes no drawing (D1424).
  1. In `raptor-port/src/ui/board.ts` `boardArmClick`, right after the placeholder-body branch (`const phb = …`) and before `const oit = …`, add:
     ```ts
     const sans = t.closest('.sansav .puck[data-person]') as HTMLElement | null
     if (sans && view.SBDAY != null && oilModeOn(view.SBDAY)) {
       e.stopPropagation()
       const cs = (PEOPLE[sans.dataset.person || ''] || {}).cs || sans.textContent || ''
       return toast(inertSays(cs, inputEarnsNoOilWhy('SANS Availability')))
     }
     ```
  2. Add `inputEarnsNoOilWhy` to the `./oilmode` import in `board.ts`.
  3. Red first: in `oilmode.test.tsx`'s new describe block, put a SANS input in `INPUTS` (`type: 'SANS Availability', date: 'Jul 18', allday: true`, a SANS person), then `open(SAT)`, `click(oilBtn())`, `click($('#sbBoard .sansav .puck'))`. Expect `said` to equal `["Nothing changed for <cs>. A SANS availability request earns no OIL."]` and `view.SELID` to be falsy.
  4. Add a second test: outside the mode the same card is the `<button data-inpedit>` and still opens the input's editor.
  - Alternative: a draw-time wrap, passing an `oilInertWrap` callback into `sansCardsHTML` from `sbSansPanel`. It puts a `.seat` span inside `.sanscard-top`, so the card's layout must be re-checked beside its picture.

### F2. Pressing the switch's words, "No OIL earned", also clears the board's search, highlights, selection and armed seat (new in this branch)

- **Failure.** A press on the label text first sends a click whose target is the `<label>`. `boardMbtn` and `boardArmClick` both ignore it, which is right: only the box carries the day. The click then bubbles to `routeClick`'s blank-space clear (`interactions.ts`, the `pg = t.closest('#shell,#schedBoard')` block near the end). Its exclusion list covers `a, button, input, select, …, .sgn` but **not `label`**. So the press runs `disarmSlot`, `selDrop`, `clearOtherHL` and wipes `#searchV`, `#searchE` and `#searchB`. Then the browser sends the second click to the box, and the day toggles once, as intended.
  - A press on the slider itself does none of this, so the same control behaves two ways.
  - The old switch was a `<button>`, which is on the exclusion list. The code already guards this case for the sign-off pill labels: "the label's own padding is guarded here too" (`.sgn`).
- **Input to run.** Desktop 1536×864 mouse, and phone 402×874.
  1. On a Saturday board, type a callsign into the board's search box, or switch on a highlight chip.
  2. Press OIL Earn.
  3. Click the words "No OIL earned", not the slider.
  - Expected: the day switches on; the search text and highlights stay.
  - Disproof: the search box empties and the highlights go off.
  4. Repeat with a press on the slider, to compare.
- **Fix.**
  1. In `raptor-port/src/ui/interactions.ts` `routeClick`, change the first segment of the blank-click selector from `'a,button,input,select,textarea,[contenteditable="true"],'` to `'a,button,input,label,select,textarea,[contenteditable="true"],'`. A press on a label is a press on its control, which is the `.sgn` precedent; it also covers the Logic page's `.lgmix` switches, harmlessly.
  2. Test: in `oilmode.test.tsx` (the App, and so `routeClick`, is mounted), set `#searchB`'s value and the search state, or a highlight in `view.HLSET`, before `lab.click()`. Assert both are kept and `oild.blanket === 1`.

### F3. The placeholder body's new sentence sends him to a window where nothing can be switched, on every row that cannot earn (new; this tests the host's reading 1, so it goes to him)

- **Failure.** The new body branch (`board.ts`, `phb`) and `oilInertWrap`'s placeholder override always say "Nothing changed for ALL AVAIL. The people behind it are switched in the window its count opens." Only the day's switch is excepted. That sentence is false in four cases:
  - **(a) A row with a start and no end.** D360's row, its reading (2), says the row's seat in OIL Earn says "No OIL worked out — this row has no end time". That is the very example D1783 quotes. In the window every man there is inert.
  - **(b) A Personal input for ALL AVAIL (D778).** Nobody behind it can earn. The window's OIL half shows "a personal request earns no OIL" and every man is inert. On the Personal Inputs line, `oilInertWrap` replaces the kind's reason with `PLACEHOLDER_WHY`, and that line has no count at all.
  - **(c) The row's own OIL switched off.** The window refuses every man with "This event earns nobody any OIL. Turn the event back on first." Yet the body points him there. The host's reading 2 gives a man's puck that refusal.
  - **(d) A cancelled or information-only row.**
- **Inputs to run.** Saturday, OIL Earn on, phone and desktop, tapping the ALL AVAIL body each time:
  - (a) A ground row "DINNER", start 1830, no end, ALL AVAIL.
  - (b) A one-day Personal input for ALL AVAIL, 1000–1200, landed on the Ground Programme. Tap the body on the ground row, then on the Personal Inputs line.
  - (c) A ground row "ALL HANDS", 1000–1600, ALL AVAIL. Tap the row's name to switch the event off, then tap the body.
  - Each time the note gives the window sentence. Opening the count then shows nobody can be switched.
- **Recommendation:** say the row's own reason. Put it to him with (a)–(c), since reading 1 chose the same words whatever the row. If he agrees:
  1. In `raptor-port/src/ui/oilmode.ts`, export `EVENT_EARNS_NOBODY` beside `DAY_EARNS_NOTHING`, and use it from `board.ts` and `AvailWindow.tsx`.
  2. In the same file, add `export function placeholderSays(di, item, cs)`, returning in this order:
     - the day's switch on → `DAY_EARNS_NOTHING`;
     - `oilItemMasked(di, item)` → `EVENT_EARNS_NOBODY`;
     - `openEndRows(DAYS[di]).some(r => r.item === item)` → `inertSays(cs, OIL_OPEN_END)`;
     - `oilNoAskWhy(di, item)` not empty → `inertSays(cs, thatReason)`;
     - otherwise → `inertSays(cs, PLACEHOLDER_WHY)`.
  3. In `board-html.ts` `sbSeat`'s placeholder path in the mode, and in the Common Programme builder's own placeholder seat, add `data-oilsay="${esc(placeholderSays(di, OILITEM-or-row item, cs))}"` to the `.seat`, only when `oilModeOn(di)`.
  4. In `board.ts`'s `phb` branch, toast `(phb.closest('[data-oilsay]') as HTMLElement)?.dataset.oilsay`. Delete its own day-switch check, which the helper now covers.
  5. In `oilmode.ts` `oilInertWrap`, drop the `isSpecial` override, so a placeholder on a request that never asks says the kind's reason ("A personal request earns no OIL."). In `oilSeatHTML`'s placeholder branch, use `placeholderSays(di, item, p.cs)` for `data-oilsay`.
  6. Red first: three tests in the new describe block, (a), (b) and (c).

### F4. A test went hollow when the wording changed (new)

- **Failure.** `raptor-port/src/ui/oilpersonalcrowd.test.tsx:204` asserts `expect(s.title).not.toContain('nothing measurable')`. That phrase now exists nowhere in the app, so the line can never fail. Its guard against the generic reason replacing "a personal request earns no OIL" is gone.
- **Fix.** Change it to `expect(s.title).not.toContain('no working hours')`.

### F5. Hardening, with no failure today: the switch is a checkbox the browser flips itself

- **Failure (not reachable today).** The browser ticks the box before `boardMbtn` runs, and the handler works from the day itself (`on = !oilBlanketOn(di)`). The screen only comes right because the bar is drawn again. Any press that returns without redrawing leaves the switch showing the opposite of the day:
  - the stale-markup guards (preview, or not in edit mode), which return before the switch branch;
  - a write the save layer takes back. `toastFail` says "Couldn't save that — try again", and its own comment says it never fires today, but it is the safety net for the database step.
  - The old button had no state of its own to go wrong.
- **Fix.** In `boardMbtn`'s switch branch, call `e.preventDefault()` as soon as `sw` is found. The box then always shows what the day says after the redraw (`checked` comes from the day), and nothing changes when nothing is saved. Run the existing D1782 tests (`sw().checked` after each press); they should stay green.

### F6. The ALL AVAIL window says an inert man's reason in the old shape (already on `main`; a question)

- **Failure.** In the mode, a tap on a man who cannot earn in the window's OIL half sets the window's foot to `<callsign> — <reason>`, taken from `.seat.oilpk`'s title (`AvailWindow.tsx` `onBody`). The board's tap now says "Nothing changed for <callsign>. <Reason>." So the same man gets two shapes on the same screen.
  - D1783 says "every reason takes that shape", but it is worded as carrying the rule to the board. Astra's scenario 3 noted the same difference and did not call it a defect.
- **Input.** On a Saturday, open the count of an ALL AVAIL row with no end, then tap a man in its OIL half. Compare with a tap on a named man on the same row on the board.
- **Fix, if he says the window too.** In `onBody`'s inert branch, set the foot from `(r.querySelector('.seat.oilpk') as HTMLElement)?.dataset.oilsay`, which `oilSeatHTML` now draws for every inert man. Keep the title as the fallback.

## Explicit negatives

- **OIL figures, saved answers, published days:** I checked every changed line and found no new writer. The day switch still calls `setOilBlanket`, which is unchanged: one `SCHED_TYPES.oil` command a press, logged by the same `act`. The new branches only toast. The `data-oilsay` / `data-oilmask` attributes, `inertWhy`'s words and `inputEarnsNoOilWhy` feed only titles, notes and the window's foot.
  - The change to `oilNoAskWhy` changes no visible words. Leave and medical never land a ground row, so `oilNoAskWhy` only ever reaches Personal, which still reads "a personal request earns no OIL".
  - The credit path (`engine/oilev.ts`) and the Leave War are untouched. Nothing found.
- **One press, one change:**
  - A press on the words sends two clicks; only the box's click is read, because `label.closest('input')` is null. Nothing found beyond F2's side effect.
  - The box's `change` event reaches `boardChange`, which matches nothing and returns.
  - Every click-eater in the capture phase (drag, swipe, grip, dots) calls `preventDefault` as well as `stopPropagation`, so a swallowed press does not tick the box on screen.
  - Selection, highlights and arming are painted by classes, not by the board's markup, so the clear in F2 never redraws the board between the two clicks. The day is never left unswitched.
- **Undo and Redo after the switch:** the write path is unchanged. The note under the bar changes with every state, so the board's text always differs and the box is drawn fresh from the day each time. Undo stops at the mode's door as before. Nothing found.
- **The keys after the redraw:** the box is in the board's Tab stops (`boardescape.ts` STOPS includes `input`). Space sends one click. The box is not a text box to the caret logic (`TEXTBOX`), so the bar's panel is never held back. The keys are put back on the new switch after the redraw. Chromium also focuses the box on a mouse press, so the keys are put back after a click too; that should show no ring (`:focus-visible`), and only the walk's picture can confirm it.
- **A tap that still picks a man:** every man's puck on the board in the mode is a switch or inert, except SANS (F1). Every inert route calls `stopPropagation` before its note, so `routeClick` never selects.
- **A tap that now says nothing where it said something:** the new branches catch only taps that used to fall through to selection. The count (`data-oilsent`) is handled before both, so the window still opens. Event-name switches (`data-oilitem`) are never inside an inert puck or a placeholder body. Nothing found.
- **Outside the mode:** `oilInertWrap` and both new branches are gated on `oilModeOn`. The Unavailable seat's arm (`data-inpseat`) is unchanged. Nothing found.
- **Masks:** `data-oilmask` is drawn from the same `oilItemMasked` / `oilBlanketOn` the switches read. A man whose day is masked and whose event is masked says the day's refusal.
- **Phone bar (D1793):** the marks use `glyphSvg`'s `btnglyph` at 12px with a −2px margin, so they add no line height. Templates' menu still anchors to the button, because a press on the mark finds it through `closest('.mbtn')`. `.daybtn` is used only in this bar. The width at 402 looks comfortable on paper (about 280 of about 360px in the mode); the walk's measures decide it. I did not check the DOM-count limits (`probes/perf-port.cjs`). The marks add about five elements and the switch one; the gates decide whether that is within the limits.
- **Readers who cannot edit, and previews:** `canOil` withholds the bar, and both handlers keep their guards. Nothing found.
- **Crew roster, a question only:** in the mode, a tap on a man in the roster still selects him. The new placeholder guard excludes `#sbRoster, .rpuck` on purpose. D65's "inside the mode no tap selects", read literally, would reach it. It is outside D1783's "row", so I raise it as a question, not a finding.

## Tidiness note (D489, changed lines only: filed, not fixed)

1. **Said twice that one place could say:**
   - `EVENT_EARNS_NOBODY` is now a constant in `board.ts`, while `AvailWindow.tsx` keeps its own copy of the same sentence. One export beside `DAY_EARNS_NOTHING` in `oilmode.ts` would serve both.
   - `.mbtn.daybtn` now has two rules in `18-oil-board.css` (the old padding and colour, and the new `inline-flex`).
   - The placeholder's day-switch refusal is reached by two branches in `boardArmClick`: the inert branch's `.puck.allavail` check and the new body branch.
2. **Harder to follow than it needs to be:**
   - `sbInpRow`'s puck line nests two arrow functions called on the spot inside a ternary inside a `map`. A named `const inner = …` would read straighter.
   - The switch's keys put-back hand-rolls `activeElement === sw` + `setTimeout` + `querySelector`, where the board already has `locate` / `keysBack` (`sheetfocus.ts`) for putting the keys back after a redraw.
   - `inert.dataset.oilsay || ''` would toast an empty note if the attribute were ever missing.
3. **Left with nothing using it:**
   - `oilInertWrap`'s `if (!p) return inner` cannot be reached from its one caller, which checks `PEOPLE` first.
   - Outside the changed lines, for the record: `.mbtn.oilblank.on` and `.mbtn.oilbtn.on` in `18-oil-board.css` have no user. The change removed the last `.daybtn.blank` rules beside them.

Files read: `raptor-port/src/ui/board.ts`, `board-html.ts`, `oilmode.ts`, `html.ts` (`puck`, `sansCardsHTML`), `interactions.ts` (`routeClick`), `AvailWindow.tsx`, `SchedBoard.tsx`, `boardescape.ts`, `textedit.ts`, `sheetfocus.ts`, `scheduler/18-oil-board.css`, `scheduler/01-logic.css`, `engine/inputs.ts`, `engine/oil.ts` `dayOilWork`; the tests `oilmode.test.tsx`, `oilpersonalcrowd.test.tsx`, `noteswords.test.ts`, `oilswitch-ring-css.test.ts`; the full rows of D1782, D1783, D1793, D845, D844, D65, D31, D26, D804, D778, D360, D1646, D1771 and D882.
