Read-only scenario report: **72 scenarios across the six pieces, followed by 18 crossings**. No files changed, tests run, builds made or server started. The app source still matches the brief’s stated baseline. These are proposed checks, not runtime passes.

Two concrete missing connections are identified after the scenarios.

**Walk setup and coverage**

Use Saber (`ad`) for admin actions and Ranger (`us`) for member actions. Where another person is needed, select a named person from the actual roster and record the callsign. Create fresh inputs through the app; the demo’s shared input on **23 July 2026** is an additional starting point, not the only evidence.

Run the calendar and window checks at **390 × 568, 390 × 844, 844 × 390, 1280 × 700 and 1536-wide**. Use July 2026 for a five-week month, August 2026 for six weeks, **31 December–2 January** for the year boundary and **29 February 2028** for leap day.

For each publishing crossing, take readings at four checkpoints: before publication, published clean, published with changes waiting, and after the amendment. At each checkpoint, reload and then sign out and sign in again in the **same browser world**. Confirm saved state survives; do not expect Undo history to survive sign-out.

Other-person changes while retaining an Undo history need the host’s controlled, same-session actor arrangement. Two independent browser worlds do not demonstrate shared live data. Clock-boundary checks likewise need a controlled clock, with inputs still filed through the visible app.

The roll-call starts with the specialised surfaces most easily missed:

| Object or door | Visible sign and working action required |
|---|---|
| Medical document viewer | Placement line follows the document’s own input when paging through an episode; existing viewing and editing permissions remain. |
| OIL tracker and Leave War OIL cells | Each person’s earned amount agrees after filing, acceptance, publication, refusal and amendment; no group-sized credit lands on one person. |
| Published schedule | Working pending count, pending details and four sign-offs agree; issued board, week, print and export retain issued content until reissue. |
| Changes window and history | One shared item on New to you, All changes and To go out; named individual changes retained underneath and under Group by Who. |
| Placement writers | Calendar editor, List Add, inline edit, group save, OIL answer, Leave War approval/extension/move/cut, medical split and posting trim. Undo restores the earlier attribution. |
| Placement readers | Both opened days, List, editor foot, desktop bar tooltip, Medical card and document viewer. No placement line on month bars/cells, board, week or exports. |
| Leave War planning | Required cells, single-cell editor, selected-cells panel, Available cells, working box, Available definition and live preview, Manning rearrangement and counter deletion. |
| Event and holiday writers | Empty/filled Event cell, presets, repeated cells, merged band, move/copy/cut, Calendar Holidays Add/Change/Remove, missing-period continuation. |
| Day-fact readers | Calendar month, Inputs tags, SANS month and opened day, Leave War Required/Available rows and working, holiday tint, OIL holiday eligibility. |
| Calendar input doors | Bar, overflow, opened day, Calendar/List switch, List Add/edit/delete, drag, keyboard, shared editor, Take me out and own OIL answer. |
| Windows and overlays | Calendar, Every weekday, holiday form, both settings, both opened days, input/commitment editor, Required selection and people’s-day selection; menus, pickers and blocking confirmation sheets remain distinct. |
| Roles | Admin, admin member view, SANS member, non-SANS member, filer, included non-filer, unrelated member, guest and signed-in person without access. |
| Preserved surfaces | Medical, board Unavailable and Personal Inputs, week rows, Leave War person cells, single-person List, ordinary late mode, existing button sizes and sign-in card. |

Within each piece, run the scenarios in the order given.

**Piece 1 — One day’s facts**

**P1-01. A missing leave period must not look like sufficient staffing.**  
**Surface/rules:** SANS month/opened day, Calendar and Leave War working; D617, D637.  
**SETUP:** As Saber, select a future date outside every leave period and give it Required P 8, W 6.  
**ACTION:** Read its SANS date and opened day; then create the covering period and revisit.  
**EXPECTED:** Before coverage, availability and positive unmet need are unknown, with the missing-period explanation; afterward, both use the newly known figures.  
**DISPROVES:** Unknown availability becomes zero or “fully staffed,” or the dash remains after coverage exists.

**P1-02. Changing who Available counts changes need everywhere.**  
**Surface/rules:** Available definition, live preview, working box and SANS; D617, D640.  
**SETUP:** Choose 13 July with an available OCU pilot included; record Available P and set Required P two higher. No SANS F offers.  
**ACTION:** Exclude that pilot’s qualifying category from Available P, save and revisit SANS.  
**EXPECTED:** Available P falls by one; still needed rises from 2 to 3. Preview, row, working and SANS agree.  
**DISPROVES:** Only the renamed row updates, or SANS continues using the original definition.

**P1-03. A holiday belongs to its date’s period, not the period on screen.**  
**Surface/rules:** Calendar Holidays, Leave War, both calendars; D627, D631.  
**SETUP:** Have two leave periods; display the earlier one. In Calendar, choose a date covered only by the later period.  
**ACTION:** Add a PH there, then open that date in each calendar and its holding period.  
**EXPECTED:** One PH appears on the chosen date, in the correct Event row and column tint.  
**DISPROVES:** The visible period receives it, the correct period misses it, or tags disagree.

**P1-04. Half-day availability rounds the remaining need upward.**  
**Surface/rules:** Leave War working and SANS figures; D617, D637.  
**SETUP:** Arrange a day whose working shows Available P 4.5; set Required P 6 and file one SANS pilot F commitment.  
**ACTION:** Read the Required, Available, SANS F and Still needed lines.  
**EXPECTED:** The calculation is 6 − 4.5 − 1 = 0.5, displayed as **1 still needed**.  
**DISPROVES:** The display says 0, 0.5 or 2, or the month and opened day differ.

**P1-05. One person counts once; OFT and AMT do not fill flying need.**  
**Surface/rules:** SANS counters and working; D617, D572, D642.  
**SETUP:** Required exceeds Available by three pilots. File an F/O/A offer for one SANS pilot and O/A-only for another.  
**ACTION:** Read F, O, A and still needed; attempt a duplicate overlapping offer for the first person.  
**EXPECTED:** Flying need is 2; each activity counts each qualifying person once. A refused duplicate changes nothing.  
**DISPROVES:** O or A reduces flying need, or duplicate records increase headcount.

**P1-06. A running requirement skips all four excluded day kinds.**  
**Surface/rules:** Required rows, Calendar and SANS; D637, D642.  
**SETUP:** Across 13–20 July, include ordinary weekdays, Saturday/Sunday, a PH, an Off day and an NF weekday.  
**ACTION:** Set Required P 8 “From 13 July on.”  
**EXPECTED:** Ordinary flying weekdays inherit 8; weekends, PH, Off and NF do not inherit that run. NF requires zero.  
**DISPROVES:** Any excluded date inherits 8 or an eligible weekday remains unset.

**P1-07. A weekend set to fly still needs its own required figure.**  
**Surface/rules:** Calendar class buttons and Required cells; D637, D638, D642.  
**SETUP:** A requirement run already covers July; Saturday 18 July is unset.  
**ACTION:** Set Saturday to day flying, inspect Required, then directly enter 5; repeat with a PH and an Off day.  
**EXPECTED:** Flying class alone does not import the weekday run. Direct exceptional-day figures work; PH/Off keep their tags.  
**DISPROVES:** The run leaks onto Saturday or exceptional-day typing is silently discarded.

**P1-08. Pilot and WSO runs remain independent.**  
**Surface/rules:** Required cells and SANS working; D622, D637.  
**SETUP:** Start P 8 and W 6 on 13 July; start P 10 on 20 July.  
**ACTION:** Override P to 4 on 21 July, then inspect 20–22 July and W throughout.  
**EXPECTED:** P reads 10, 4, 10; W remains 6. Clearing the one-day override reveals P 10.  
**DISPROVES:** The P override ends the run, changes W, or Clear erases unrelated dates.

**P1-09. Overlapping weekday rules have precise boundaries.**  
**Surface/rules:** Every weekday, Calendar and SANS; D631, D638.  
**SETUP:** Set Thursdays to night from 16 July; add a later Thursday NF rule beginning 23 July with an end date.  
**ACTION:** Inspect Thursdays before, inside and after that bounded rule; add a one-date exception.  
**EXPECTED:** The later-starting applicable rule wins, the end is inclusive, and the exception affects only its date.  
**DISPROVES:** A rule starts early, survives its end or overrides the explicit exception.

**P1-10. NF suppresses flying demand without suppressing OFT or AMT.**  
**Surface/rules:** Calendar, Required rows and SANS; D617, D642.  
**SETUP:** Give 14 July positive requirements and F/O/A commitments.  
**ACTION:** Change the day to NF, inspect all readers, then Undo.  
**EXPECTED:** NF shows zero flying requirement/need; O and A offers remain visible. Undo restores the previous class and requirement outcome.  
**DISPROVES:** O/A disappear, NF still reports a flying shortage, or Undo loses the prior figures.

**P1-11. Undo, Redo and reload invalidate the joined answer.**  
**Surface/rules:** Both calendars and Leave War working; D617, D148, D672.  
**SETUP:** Read one date on every surface to establish their current values.  
**ACTION:** Change Required, a leave affecting Available, and a SANS F offer separately; Undo and Redo each, revisiting every reader, then reload.  
**EXPECTED:** Each reader follows every committed state without an unrelated edit.  
**DISPROVES:** A stale figure persists until changing month, refreshing twice or editing something else.

**P1-12. Dates retain their year through week, month and leap boundaries.**  
**Surface/rules:** Resolver consumers and recurring rules; D631, D637, D638.  
**SETUP:** Create distinct requirements/offers around 31 December 2026–2 January 2027 and 28 February–1 March 2028.  
**ACTION:** Navigate across each edge and load another schedule week before returning.  
**EXPECTED:** Every figure stays on its actual date; 29 February exists only in the leap year.  
**DISPROVES:** A same-named date in another year borrows the facts or a boundary shifts by a day.

**Piece 2 — Leave War**

**P2-01. Available’s specialised editor must not inherit ordinary-counter controls.**  
**Surface/rules:** Available row name, definition and live preview; D640, D668, D669.  
**SETUP:** As Saber, open Available P by its name.  
**ACTION:** Rename it and change permitted CAT/qualification filters; inspect every offered control and preview.  
**EXPECTED:** The preview matches the saved row. No SANS inclusion, teams/sets, thresholds, Delete or reset-to-default door appears. Required names stay fixed.  
**DISPROVES:** A forbidden control exists or the preview and saved count disagree.

**P2-02. A mixed selection lights only cells that will take the number.**  
**Surface/rules:** Required selection panel; D636, D637.  
**SETUP:** Select P and W across weekdays, an unset weekend, a flying weekend, PH, Off and NF.  
**ACTION:** Enter 7 under “These days”; toggle Include before applying. Repeat with mouse drag, Shift-drag and hold-drag.  
**EXPECTED:** Highlighting follows the actual eligible cells; NF never receives 7. Include changes exceptional-day participation consistently.  
**DISPROVES:** A dark cell changes, a lit eligible cell does not, or a gesture selects different dates.

**P2-03. Starting a run removes conflicting picked overrides in one step.**  
**Surface/rules:** Required selected-cells panel; D637.  
**SETUP:** Put different direct P figures on 13–17 July and select them plus the preceding weekend.  
**ACTION:** Choose “From … on,” enter 9 and apply; Undo once.  
**EXPECTED:** The button names the first eligible flying weekday; picked eligible overrides become the run. One Undo restores all original figures.  
**DISPROVES:** It starts on the weekend, leaves hidden overrides or needs several Undos.

**P2-04. Single-cell entry commits and advances without skipping typed work.**  
**Surface/rules:** Required inline editor and number pad; D636, D637.  
**SETUP:** Open Required P on 13 July with excluded dates ahead.  
**ACTION:** Type, press Enter, use pad arrows, click elsewhere, then repeat with Escape, blank, negative, fractional and four-digit input.  
**EXPECTED:** Valid edits save once; navigation skips excluded dates; Escape restores; invalid input is refused without corrupting the old figure. Unchanged Enter writes nothing.  
**DISPROVES:** Blur loses a valid figure, Escape saves it or navigation lands on an excluded date.

**P2-05. Preset name, kind and short form remain distinct.**  
**Surface/rules:** Event sheet and grid; D643–D645.  
**SETUP:** Open an empty Event cell.  
**ACTION:** Try PH, Off, No leave and SC; type a custom name, then Other; enter short forms including lowercase, spaces and overlength text.  
**EXPECTED:** Presets light correctly; Kind appears under Other; valid short forms display consistently, with full name/kind on opening. Typed overrides remain intentional.  
**DISPROVES:** A name changes kind unnoticed, the wrong preset lights or malformed text reaches the grid.

**P2-06. Short forms survive every Event writer.**  
**Surface/rules:** Event cells, repeated cells and merged bands; D643–D645, D652.  
**SETUP:** Create a named event with an explicit short form and another that follows its preset.  
**ACTION:** Repeat, copy, cut, move, resize where offered, Undo, Redo and reload; include a refused move. Change the preset afterward.  
**EXPECTED:** Explicit text survives; inherited text follows the preset. Wide bands show the full name when it fits, otherwise the short form. Refusal changes nothing.  
**DISPROVES:** Any route drops the abbreviation or rewrites an explicit override.

**P2-07. A people’s-days selection leaves the grid usable.**  
**Surface/rules:** Leave War selected-people panel; D642.  
**SETUP:** Select several people’s days and leave the panel open.  
**ACTION:** Move it aside; choose another block, use month controls, then tap a single person’s cell.  
**EXPECTED:** Background controls work; a new block replaces the selection; a plain cell opens its own sheet. Outside presses do not simply dismiss the panel.  
**DISPROVES:** A veil blocks the grid, selection stays attached to the old block or the click is swallowed.

**P2-08. Counters can sit between fixed rows without moving the fixed order.**  
**Surface/rules:** Manning Rearrange; D665, D674.  
**SETUP:** Add two ordinary counters and enter Rearrange.  
**ACTION:** Drop each above, between and below Required P, Required W, Available P and Available W.  
**EXPECTED:** Every allowed placement persists; the four fixed rows retain their relative order and have no move/delete grips.  
**DISPROVES:** A counter cannot occupy a promised position or a fixed row can be displaced independently.

**P2-09. The two counter-delete doors deliberately differ.**  
**Surface/rules:** Rearrange cross and counter window; D676, D677.  
**SETUP:** Create a named ordinary counter.  
**ACTION:** Press its red cross in Rearrange; Undo. Open its own window, press Delete counter, cancel, then confirm.  
**EXPECTED:** The cross deletes immediately; Undo restores the definition and position. The window’s Delete asks first; cancel preserves it.  
**DISPROVES:** The cross asks, the window deletes without asking or Undo restores an incomplete counter.

**P2-10. No ordinary counters means zero under-manned counter days.**  
**Surface/rules:** Fresh Manning block and under-manned summary; D669.  
**SETUP:** Use a fresh period with no user-created counters; make Available P lower than Required P.  
**ACTION:** Inspect Manning, Available’s colour and the under-manned summary; then add one ordinary counter.  
**EXPECTED:** Four fixed rows exist, Available can be red, but ordinary-counter under-manned days start at zero. Only the new counter contributes afterward.  
**DISPROVES:** Hidden default counters or the fixed rows inflate the summary.

**P2-11. Undo preserves the visible location and finds hidden changes.**  
**Surface/rules:** Leave War grid; D670, D672.  
**SETUP:** Edit a Required cell and an Event cell while each is comfortably visible.  
**ACTION:** Undo/Redo; then scroll them outside the viewport and repeat. Include an ordinary person-cell edit.  
**EXPECTED:** Visible targets do not move the grid; hidden targets are brought into view and marked.  
**DISPROVES:** An already visible date snaps to an edge, or a hidden change stays hidden.

**P2-12. Everyone allowed to read gets working; only admins alter planning.**  
**Surface/rules:** Required/Available cells and Event readouts; D636, D640, D643.  
**SETUP:** Repeat as Saber, member view, Ranger, a SANS member and guest wherever Leave War is accessible.  
**ACTION:** Tap Available and filled Events; attempt Required typing and definition editing.  
**EXPECTED:** Read access gives the working/full event detail. Admin-only writers remain unavailable or refused; member view does not retain admin powers.  
**DISPROVES:** A reader cannot inspect the working or a restricted role changes planning.

**Piece 3 — Windows and Calendar**

**P3-01. Escape must close the front window, not an editor behind it.**  
**Surface/rules:** Inputs editor plus settings/Calendar; D641.  
**SETUP:** Open an input editor, type an unsaved remark, then open Inputs settings and bring it forward.  
**ACTION:** Focus a button or the front window’s title—not a text box—and press Escape.  
**EXPECTED:** Settings closes; the editor and its unsaved remark remain. Repeat with reversed stacking.  
**DISPROVES:** The rear editor closes, the front window remains instead or both close.

**P3-02. A holiday waiting for a leave period resumes exactly once.**  
**Surface/rules:** Holidays, Create it/Add period continuation; D631, D671.  
**SETUP:** Add a PH where no period exists; repeat where only part of the year is uncovered.  
**ACTION:** Follow the offered period-creation door, complete it and return; separately cancel creation and edit/cancel the waiting holiday.  
**EXPECTED:** The correct period form opens above Calendar; a still-valid waiting holiday saves once. Cancelled or changed work does not later save itself.  
**DISPROVES:** Duplicate holidays, wrong dates or a cancelled holiday appears after another period is created.

**P3-03. A holiday spanning outside coverage refuses as a whole.**  
**Surface/rules:** Holidays Change/Add and Leave War; D631.  
**SETUP:** Choose a range whose first date is covered but whose end extends beyond its holding period; also prepare an existing holiday to move there.  
**ACTION:** Save the new range, then try moving the existing one.  
**EXPECTED:** A clear coverage refusal; no partial new range and no deletion of the original holiday.  
**DISPROVES:** The covered portion saves alone or the original disappears before refusal.

**P3-04. The two holiday doors edit one record.**  
**Surface/rules:** Holidays list and Event row; D631, D652.  
**SETUP:** Add a named PH with “On grid” through Calendar.  
**ACTION:** Change it through Leave War, reopen Calendar and remove it; repeat in reverse. Also leave a holiday form open while its underlying event changes.  
**EXPECTED:** Both doors track one event. A stale edit is refused or reconciled explicitly, never applied to a guessed replacement.  
**DISPROVES:** Duplicate events, orphan tags or stale text silently overwrites the newer event.

**P3-05. The shared range picker starts empty and never invents a day.**  
**Surface/rules:** Holiday date picker; D671.  
**SETUP:** Open Add a holiday.  
**ACTION:** Try Save before selection; tap start, later end, an earlier date, a third date, then Clear.  
**EXPECTED:** Empty Save refuses. Start/end, restart and Clear follow the Leave War picker’s rules with visible selected dates.  
**DISPROVES:** Today is silently chosen, the third tap extends the old range or Clear leaves a hidden date.

**P3-06. Phone cycling and desktop buttons represent the same classes.**  
**Surface/rules:** Calendar month; D638, D642.  
**SETUP:** Open July on phone and desktop sizes.  
**ACTION:** Step a weekday and weekend through their classes; press an active desktop button; inspect a PH and Off day.  
**EXPECTED:** Phone has one cycling control, desktop three. Weekdays default day; weekends unset. Active weekday is a no-op; weekend can return to unset. Holiday tags replace flying controls.  
**DISPROVES:** Different controls produce different classes or a no-op creates an Undo entry.

**P3-07. Every weekday opens from the correct heading and saves its limits.**  
**Surface/rules:** Calendar heading and Every weekday window; D631, D638.  
**SETUP:** Open Calendar in July, then press Thursday’s heading.  
**ACTION:** Set night flying from 16 July to 30 July, save, reopen, alter the end, then remove the rule.  
**EXPECTED:** The title identifies Thursday; dates and class persist; only applicable Thursdays change and removal reveals the underlying rule/default.  
**DISPROVES:** Another weekday changes or removing the rule leaves stale classes.

**P3-08. Every new window passes the same background-and-drag check.**  
**Surface/rules:** All windows in the roll-call; D641, D642.  
**SETUP:** Open each window separately with a reachable page control behind it.  
**ACTION:** Drag by its title bar, click/edit behind it, then use its close/finish action.  
**EXPECTED:** Dragging works without moving the page; background action works while the window stays. Close/Save/Apply acts once.  
**DISPROVES:** Any specialised window blocks the page, closes merely from outside clicking or loses its position on a repaint.

**P3-09. A window dragged low remains recoverable on short screens.**  
**Surface/rules:** Calendar, day windows, editor and settings; D641, D648, D664.  
**SETUP:** At 390 × 568, drag each window low; rotate to 844 × 390, then resize to 1280 × 700.  
**ACTION:** Reach title, close, Save and the last field; restore portrait.  
**EXPECTED:** Controls remain reachable, with appropriate internal body/page scrolling and no stranded title bar.  
**DISPROVES:** A window can be moved beyond recovery or its final action becomes unreachable.

**P3-10. Small pickers and blocking questions keep their own dismissal rules.**  
**Surface/rules:** Highlight/date/colour pickers, delete and OIL/medical questions; D641.  
**SETUP:** Open each small picker from a window, and each applicable blocking question from an editor.  
**ACTION:** Click outside; press Escape; attempt a background edit while a blocking question is up.  
**EXPECTED:** Small pickers dismiss without closing their parent. A blocking question owns the interaction; cancelling it preserves the editor.  
**DISPROVES:** Escape destroys the underlying draft or a background write slips through a blocking question.

**P3-11. Every Calendar door opens the same month and permission gate.**  
**Surface/rules:** Both gears, SANS day, Leave War gear and Logic doors; D639, D675.  
**SETUP:** Navigate each originating surface to a recognisable month.  
**ACTION:** Open “Calendar.” through every visible door; repeat under member view and restricted roles.  
**EXPECTED:** The same Calendar opens in the relevant month; admin-only access remains admin-only, including an already open window after role change.  
**DISPROVES:** One door uses another month, an obsolete Days label or a weaker permission check.

**P3-12. Save-and-add-next retains convenience without repeating dates.**  
**Surface/rules:** Holiday form and Holidays list; D652, D671.  
**SETUP:** Add a named PH with a custom short form in a later month.  
**ACTION:** Use the save-and-add-next action; inspect the next blank form, then add an Off day.  
**EXPECTED:** The picker stays on the useful month but has no selected dates. Name, kind and short form save to the intended holiday only.  
**DISPROVES:** The previous range is silently reused or one holiday inherits another’s explicit short form.

**Piece 4 — SANS calendar**

**P4-01. A roster change cannot leave a former SANS person counted twice.**  
**Surface/rules:** SANS counts, Highlight, opened day and Leave War Available; D617, D619.  
**SETUP:** File a fresh SANS F commitment.  
**ACTION:** Make that person non-SANS; separately repeat with archive and a posting-out that takes effect. Revisit all readers after each operation.  
**EXPECTED:** Non-SANS/archived people leave the active SANS count and picker; retained entries explain why they are not counted. Posting trim/archive follows its effective date. No double count through Available.  
**DISPROVES:** A removed person still reduces SANS need or contributes on both sides.

**P4-02. An opened busy day lists everyone, including the last person.**  
**Surface/rules:** SANS day window; D648.  
**SETUP:** File enough commitments to overflow the short phone day window, including F, O-only, A-only and an uncounted entry.  
**ACTION:** Scroll to the final person, open that entry, expand/collapse by the top bar and repeat on desktop.  
**EXPECTED:** Every entry is reachable; no “+ more” truncation; working and actions remain usable.  
**DISPROVES:** Names vanish below a fixed limit or scrolling takes the whole window off screen.

**P4-03. Pilot and WSO figures must never exchange sides.**  
**Surface/rules:** SANS month and opened working; D617, D626.  
**SETUP:** Create deliberately unequal results: still needed P 2/W 5, F P 1/W 3 and different O/A counts.  
**ACTION:** Read the same date in both views and compare with Leave War working.  
**EXPECTED:** Pilots are left, WSOs right; every figure matches its labelled working.  
**DISPROVES:** Symmetric styling hides a swapped seat or one view counts a different population.

**P4-04. Colour thresholds use combined need and precise boundaries.**  
**Surface/rules:** SANS settings and date washes; D618, D630.  
**SETUP:** Set thresholds 1, 3 and 5; prepare dates with total need 0–6.  
**ACTION:** Inspect each boundary; change thresholds; try equal, descending, zero, blank and non-integer values.  
**EXPECTED:** Zero is uncoloured; 1–2 yellow, 3–4 amber, 5+ red. Invalid settings save neither colours nor another edited setting.  
**DISPROVES:** Seat-specific colouring, off-by-one thresholds or partial saving after validation refusal.

**P4-05. Highlight changes emphasis, never staffing arithmetic.**  
**Surface/rules:** Highlight picker, month and day; D619.  
**SETUP:** Give one SANS person different F/O/A offers across several dates. Record all counts.  
**ACTION:** Select that person, switch to another and clear Highlight.  
**EXPECTED:** Cyan rings and underlining follow only that person’s offered activities. Counts, colours and listed people remain unchanged.  
**DISPROVES:** Highlight filters the calculation or underlines an activity the person did not offer.

**P4-06. The person puck is the schedule puck with its real qualifications.**  
**Surface/rules:** Highlight picker and SANS day; D647, D649–D651.  
**SETUP:** Choose pilots/WSOs with different CAT chips and long callsigns.  
**ACTION:** Compare their SANS pucks with their schedule pucks at each required width.  
**EXPECTED:** Correct CAT, purple SANS edge, consistent size and readable row text; the whole intended action remains tappable.  
**DISPROVES:** A lookalike omits a chip, clips a callsign into another action or gives a mismatched person.

**P4-07. NF still accepts OFT and AMT commitments.**  
**Surface/rules:** SANS day and + Commitment; D642.  
**SETUP:** Make 15 July NF and sign in as a SANS member.  
**ACTION:** Open + Commitment, file O/A without F, then reopen the day.  
**EXPECTED:** The offer saves and appears with its hours; O/A counters rise, flying need stays zero.  
**DISPROVES:** NF disables all commitment filing or hides valid O/A offers.

**P4-08. A SANS member files only himself; an admin may file several.**  
**Surface/rules:** + Commitment and people picker; D658.  
**SETUP:** Use a SANS member, then Saber, then Saber’s member view.  
**ACTION:** Attempt one-person and several-person SANS filings, including selecting a non-SANS person.  
**EXPECTED:** Member routes remain self-only. Admin can select multiple SANS people; non-SANS selection is refused. Member view has no admin exception.  
**DISPROVES:** A member files another person’s availability or an admin saves it for non-SANS aircrew.

**P4-09. SANS availability has no back door through Inputs or List.**  
**Surface/rules:** Inputs month, List Add, inline type and editor retype; D620.  
**SETUP:** File a SANS commitment through SANS, then visit every Inputs/List editing door.  
**ACTION:** Search for the commitment and attempt to change an ordinary input into SANS availability.  
**EXPECTED:** Availability appears only on SANS; Inputs forms do not offer it. Schedule SANS availability remains usable.  
**DISPROVES:** A hidden List/retype route creates or exposes a SANS record.

**P4-10. “How this works” follows the saved SANS cut-off.**  
**Surface/rules:** Instructions, SANS settings, Logic and LATE explanation; D628, D639, D646.  
**SETUP:** Open the five-line instructions.  
**ACTION:** Save days mode, then weekday/weeks mode; inspect the instructions, Logic and a late entry. Cancel a further draft change.  
**EXPECTED:** Saved settings agree everywhere; the entry states its own missed deadline. Cancelled settings never change the instructions.  
**DISPROVES:** Static old wording remains or the explanation uses the currently viewed week.

**P4-11. The month fills different phone heights without an inner calendar scroll.**  
**Surface/rules:** SANS month; D664.  
**SETUP:** Open July and August at 390 × 568 and 390 × 844.  
**ACTION:** Resize while open, expand instructions and scroll to the last week.  
**EXPECTED:** Layout remeasures; all weeks remain readable. When space is insufficient, the page scrolls rather than a trapped inner month box.  
**DISPROVES:** The tall phone wastes the same short box or a six-week month hides its final row.

**P4-12. Tags and placement details stay in their promised locations.**  
**Surface/rules:** SANS month/day, Inputs month and tooltip; D627, D629.  
**SETUP:** Create day/night/NF, PH and Off dates, plus a newly placed and later edited commitment.  
**ACTION:** Inspect month cells and open each day.  
**EXPECTED:** SANS shows sun/moon and appropriate tags; PH is green, Off grey. Placement/change details appear on the opened entry, not as month-cell clutter.  
**DISPROVES:** Flying icons leak onto the ordinary Inputs month or placement text crowds its cells.

**Piece 5 — Inputs calendar**

**P5-01. Changing only the people must trigger the unsaved-change question.**  
**Surface/rules:** Shared editor opened from Inputs; D641, D654–D656.  
**SETUP:** Open a shared input containing at least two people.  
**ACTION:** Add a third person without changing any other field; click another input behind the window. Repeat by removing one while at least two remain.  
**EXPECTED:** The editor asks before discarding the pending people change; Keep editing retains it.  
**DISPROVES:** The other input opens immediately and the pending selection disappears.

**P5-02. An untouched field follows a background edit without overwriting it.**  
**Surface/rules:** Input editor plus List/day/drag writers; D641.  
**SETUP:** Open an input and change its remarks locally.  
**ACTION:** Change its dates or hours through another available page door behind the window; save the original editor.  
**EXPECTED:** The editor follows the new dates/hours and saves only the intended remarks alongside them.  
**DISPROVES:** Saving restores stale dates/hours or loses the local remark.

**P5-03. A same-field conflict blocks Save until a choice is made.**  
**Surface/rules:** Input editor conflict panel; D641.  
**SETUP:** Change Remarks locally while the editor stays open.  
**ACTION:** Change the same Remarks through the List; press Save, then test Keep mine and Take theirs in separate runs.  
**EXPECTED:** Both values are identified; Save refuses until resolved. Each choice preserves unrelated changes.  
**DISPROVES:** Silent last-writer wins, an unlabelled conflict or choosing one field overwrites another.

**P5-04. Deletion behind an editor cannot resurrect the input.**  
**Surface/rules:** Editor, opened-day Delete and Undo; D641.  
**SETUP:** Open a fresh input and type a draft change.  
**ACTION:** Delete that input through another visible door or Undo its creation. Repeat with one member of a shared entry removed.  
**EXPECTED:** A fully deleted entry closes with an explanation. A surviving shared entry follows its surviving people rather than reviving the removed record.  
**DISPROVES:** Save resurrects a deleted input or a remaining shared input closes unnecessarily.

**P5-05. Dragging from the middle of a bar uses the grab-to-drop distance.**  
**Surface/rules:** Inputs month bar drag; D632.  
**SETUP:** Create a multi-day input spanning 29 July–3 August.  
**ACTION:** Grab an interior segment and move it two days forward; Undo once, Redo, then attempt as an unrelated member.  
**EXPECTED:** Both endpoints move exactly two days; duration remains unchanged; one Undo reverses the move. Unauthorised movement refuses.  
**DISPROVES:** The start snaps to the drop date, duration changes or a member moves another person’s record.

**P5-06. Bar movement, range selection, swipe and page scroll do not steal one another.**  
**Surface/rules:** Inputs month gestures; D621, D626, D632.  
**SETUP:** Use a short phone with both occupied and empty dates.  
**ACTION:** Tap, slide-select, hold-drag empty dates, hold-drag a bar, swipe months and vertically scroll; repeat with mouse drag.  
**EXPECTED:** Each gesture gives its intended feedback and result; cancelling a gesture writes nothing.  
**DISPROVES:** Scrolling moves an input, a bar drag creates a range or a range selection changes month.

**P5-07. Bars retain their identity through overflow and calendar boundaries.**  
**Surface/rules:** Month bars, +N more and opened day; D626, D653.  
**SETUP:** Create overlapping red absences and amber commitments across a week end, month end and year end.  
**ACTION:** Inspect continuation segments and press +N more on crowded dates.  
**EXPECTED:** Each input has consistent colour/identity, the overflow count is accurate and every hidden input is reachable.  
**DISPROVES:** A continuation becomes a duplicate, a hidden item is unopenable or the count includes SANS availability.

**P5-08. Keyboard use stays on the intended calendar object.**  
**Surface/rules:** Inputs calendar and opened day; D621.  
**SETUP:** Focus the month using the keyboard.  
**ACTION:** Arrow across month/year edges, Shift+arrow a range, press Enter, select an input and use Delete/Backspace, then Escape. Repeat while typing in an editor field.  
**EXPECTED:** One grid tab stop; correct date movement/range; opening works; deletion asks first; text editing does not trigger calendar deletion/navigation.  
**DISPROVES:** Focus vanishes at an edge or a text-editing key deletes a record.

**P5-09. The opened day puts planning first and inputs afterward.**  
**Surface/rules:** Inputs opened day; D629, D641.  
**SETUP:** Choose a day with planning content, several inputs and a late input.  
**ACTION:** Open it, inspect ordering and placement lines, open LATE, then cancel and confirm Delete in separate runs.  
**EXPECTED:** Planning comes first; every input has the intended detail; LATE explains its own deadline; Delete asks and removes only the selected entry.  
**DISPROVES:** Planning disappears, deletion targets another row or placement refers to another input.

**P5-10. Calendar/List filters agree without damaging single-person List behaviour.**  
**Surface/rules:** Inputs filters and Calendar/List switch; D620, D654.  
**SETUP:** File one solo and one shared input, with different people/types.  
**ACTION:** Filter by a person appearing only in the shared entry, then type/date; switch views and edit the solo row inline.  
**EXPECTED:** Matching any included person finds the shared entry once. Solo inline editing, add, delete and sort remain available as before.  
**DISPROVES:** A shared entry disappears because its first person does not match or solo List editing is replaced unnecessarily.

**P5-11. Save, Undo and Redo keep a visible input still.**  
**Surface/rules:** Inputs month and List; D672.  
**SETUP:** Place a target fully below the top bar in a scrolled List and in the visible month.  
**ACTION:** Save an edit, Undo and Redo; repeat after moving the target outside view.  
**EXPECTED:** Visible targets stay in place and flash; hidden targets are brought clearly below the top bar or into their month.  
**DISPROVES:** Every save jumps to the top or the revealed row remains behind the header.

**P5-12. Settings validate before changing either cut-off or filing permission.**  
**Surface/rules:** Inputs gear and Logic settings doors; D628, D639, D655.  
**SETUP:** Open settings and change both the cut-off and member-filing switch.  
**ACTION:** Make the cut-off invalid and save; then correct it and save. Open the same settings through each Logic row and Undo each saved setting.  
**EXPECTED:** Invalid Save changes neither; valid changes appear through every door, with separate intended Undo steps.  
**DISPROVES:** A failed form disables member filing or a Logic button opens a different settings state.

**Piece 6 — Shared inputs and late rules**

**P6-01. One person’s refusal must refuse the whole group.**  
**Surface/rules:** Shared input save and every group renderer; D655.  
**SETUP:** As Saber, select three people for leave; give one conflicting medical/leave on the chosen dates.  
**ACTION:** Save; separately repeat where one person is recorded working instead.  
**EXPECTED:** The first case names the conflicting person and saves nobody. The working case files the permitted leave for all and flags the conflict.  
**DISPROVES:** Two people save before the third refuses or working is silently treated as a hard medical clash.

**P6-02. The filer’s OIL answer reaches every person once.**  
**Surface/rules:** Shared save, OIL question, bell and each person’s editor; D660.  
**SETUP:** File an all-day shared duty for three people on Saturday 18 July, covered by a leave period.  
**ACTION:** Answer the save-time OIL question affirmatively, then inspect each person.  
**EXPECTED:** One question sets each person’s own full-day claim; nobody receives a duplicate unanswered bell question. Credit still follows acceptance/publication.  
**DISPROVES:** Only the first person has an answer or the group creates one combined three-day claim.

**P6-03. Adding a person preserves existing OIL answers and timestamps.**  
**Surface/rules:** Shared editor and individual OIL; D629, D660.  
**SETUP:** Create a shared duty; have one subject change his own OIL answer. Record existing people’s change times.  
**ACTION:** Add a new person without changing dates/hours; answer the new person’s OIL question.  
**EXPECTED:** Only the newcomer needs the new answer; existing answers and untouched people’s lateness stamps remain unchanged.  
**DISPROVES:** Adding one person reclaims OIL for everyone or makes all existing people newly late.

**P6-04. Filer, subject and stranger have different actions.**  
**Surface/rules:** Shared editor, List, day Delete and drag; D655.  
**SETUP:** Ranger files for himself and another person. Sign in separately as filer, included non-filer, unrelated member and Saber.  
**ACTION:** Attempt whole-entry edits/deletion, Take me out and own OIL edits through every door.  
**EXPECTED:** Filer/admin can change the whole; non-filer subject can remove himself and answer his own OIL; stranger reads only.  
**DISPROVES:** A weaker door permits whole-group changes or Take me out removes everyone.

**P6-05. Turning member filing off removes authority without deleting records.**  
**Surface/rules:** Settings, open draft, saved shared entry and Undo; D655, D148.  
**SETUP:** With the switch on, Ranger files for others and leaves another such draft open.  
**ACTION:** Turn the switch off using the controlled same-world arrangement; try Save, edit/delete and Undo of the earlier filing.  
**EXPECTED:** Existing records stay; unauthorised actions refuse in words; the draft retains its selected people. Restoring the switch restores permitted authority.  
**DISPROVES:** The app silently substitutes Ranger or Undo bypasses the disabled permission.

**P6-06. Changing kind cannot smuggle forbidden people into a save.**  
**Surface/rules:** List Add and shared editor people/type controls; D655, D658.  
**SETUP:** As Ranger, select several people for an allowed duty.  
**ACTION:** Change type to leave, medical and SANS availability where a transition is reachable; attempt Save. Repeat as admin for group medical.  
**EXPECTED:** Selection remains visible with an explicit refusal/correction; no forbidden records save. Medical stays one person per document.  
**DISPROVES:** Hidden selections save under the new type or people are silently reassigned.

**P6-07. The hybrid picker preserves the first person and never becomes empty.**  
**Surface/rules:** People picker in List Add and editor; D656, D659.  
**SETUP:** Include pilots, WSOs, SANS and ground Personnel on the roster.  
**ACTION:** Switch to Several people, use each offered All, deselect groups and return to one person.  
**EXPECTED:** A-to-Z ordering; SANS appears only in its own group; Personnel appears when applicable; the last person cannot vanish; return keeps the first picked.  
**DISPROVES:** Duplicate pucks, unintended SANS selection by another group’s All or an empty saveable selection.

**P6-08. Shared display grouping must not collapse individual downstream records.**  
**Surface/rules:** Month, day, List, editor, board, week and Leave War; D654, D655.  
**SETUP:** File one shared duty for three people.  
**ACTION:** Open it through each calendar door, then inspect each person’s schedule and Leave War presence.  
**EXPECTED:** One calendar entry/editor represents the three; downstream personal records remain separately attributable and editable under their own rules.  
**DISPROVES:** Three calendar duplicates or only one person receives the downstream duty.

**P6-09. A single-person edit can split a shared entry without damaging siblings.**  
**Surface/rules:** Board/week personal edit and Inputs grouping; D655.  
**SETUP:** File one three-person shared input.  
**ACTION:** Through an authorised individual schedule door, change only one person’s shared field; inspect Inputs, then restore it.  
**EXPECTED:** The changed person’s divergent entry is distinguishable; the other two stay together and unchanged. Restoring equal shared fields regroups appropriately.  
**DISPROVES:** An individual edit changes everybody or the divergent record remains hidden inside an apparently uniform entry.

**P6-10. Removing the filer does not transfer ownership to the next admin.**  
**Surface/rules:** Shared editor and permissions; D655.  
**SETUP:** Ranger files a group including himself; Saber adds another person.  
**ACTION:** Ranger takes himself out, then attempts an allowed whole-entry edit while member filing remains on.  
**EXPECTED:** The original filer’s authority remains; the admin’s addition did not steal ownership. Subjects retain their own limited actions.  
**DISPROVES:** Ownership follows the last editor or disappears when the filer is no longer a subject.

**P6-11. Days mode retains the existing board and week deadline.**  
**Surface/rules:** Inputs/List, board, week and LATE explanations; D628, D639.  
**SETUP:** Set Inputs to 14 days. For the week beginning 13 July, use fresh writes under a controlled clock on 29 June and 30 June.  
**ACTION:** Read the same input on every surface, load another week and test a multi-week span.  
**EXPECTED:** 29 June is on time; 30 June is late. The input’s first week remains its anchor; downchits/upchits stay exempt.  
**DISPROVES:** The viewed week changes lateness or medical acquires LATE.

**P6-12. Weekday mode ends at the end of the chosen day and stays separate for SANS.**  
**Surface/rules:** Both settings, both opened days, List, board and week; D628, D639.  
**SETUP:** Set SANS to Wednesday two weeks before; keep Inputs at 14 days. Use inputs starting in the week of 13 July.  
**ACTION:** File around the controlled end of **1 July** for SANS and **29 June** for ordinary Inputs; repeat across New Year.  
**EXPECTED:** Each uses its own inclusive deadline and correct year. A later edit changes the late judgement using that edit’s date.  
**DISPROVES:** Both types share one setting or the deadline starts at midnight instead of ending that day.

**Crossings**

**X-01. A shared input on a clean published day creates per-person pending changes.**  
**Surface/rules:** Inputs, board/week, pending panels, sign-offs and Changes; D103, D178, D663.  
**SETUP:** Publish an otherwise isolated 23 July with four sign-offs and zero pending.  
**ACTION:** File one shared input for three people.  
**EXPECTED:** Inputs shows one entry; working schedule reads **3 pending**, with three named input changes and cleared sign-offs. Changes groups them as one item. Issued views retain the old content.  
**DISPROVES:** Pending reads 1, signatures remain or issued content changes immediately.

**X-02. Moving and deleting a published shared input update both days correctly.**  
**Surface/rules:** Bar drag, day Delete and published pending; D103, D178, D663.  
**SETUP:** Publish a three-person shared input on 23 July and a clean destination day.  
**ACTION:** Drag it to the destination; inspect both days. Undo, then delete it with confirmation.  
**EXPECTED:** The move produces three removals on the source and three additions on the destination; deletion produces three removals on the source. Undo returns baseline pending/signatures.  
**DISPROVES:** Only one day changes or grouped display reduces the pending count to one.

**X-03. Shared weekend duty gives each person the correct earned leave.**  
**Surface/rules:** Shared save, schedule acceptance, Leave War OIL and OIL tracker; D660, D142, D400.  
**SETUP:** Use three people with no other earning work on 18 July; record each opening OIL balance.  
**ACTION:** File an all-day shared duty, answer Yes, accept each person and publish; inspect each OIL cell and tracker row.  
**EXPECTED:** Each gains **FO/1 earned day**; Aw arded is unchanged. The filer receives no extra group credit. Repeat with a timed duty below the full-day threshold: each gains **HO/0.5**.  
**DISPROVES:** Missing, doubled or aggregated credit.

**X-04. A subject’s own OIL answer changes only his entitlement.**  
**Surface/rules:** Own OIL action, shared entry, scheduler refusal and tracker; D660.  
**SETUP:** Use X-03’s three-person duty.  
**ACTION:** One subject declines his own claim; reissue as required. Separately have the scheduler refuse another person’s credit, then let the filer answer Yes again.  
**EXPECTED:** Only the relevant person’s entitlement changes; the scheduler’s refusal still wins. Other people’s claims remain intact.  
**DISPROVES:** One answer changes all subjects or a later member answer defeats the scheduler’s refusal.

**X-05. A holiday change retags calendars immediately but respects published OIL.**  
**Surface/rules:** Holidays, Event tint, Inputs/SANS and OIL; D627, D631, D2, D21.  
**SETUP:** Publish a weekday with qualifying work but no PH. Record OIL.  
**ACTION:** Add a PH through Calendar, read all tags, then publish the amendment; remove PH and repeat. Separately use a weekday Off day.  
**EXPECTED:** Tags follow the saved holiday; published OIL changes only with reissue. Off day alone earns nothing.  
**DISPROVES:** OIL changes silently before reissue or Off day earns as PH.

**X-06. Leave War approval and editing feed the Inputs bar and attribution.**  
**Surface/rules:** Leave War approval/extension/move/cut, Inputs and placement lines; D629, D672.  
**SETUP:** Create and approve fresh leave through Leave War.  
**ACTION:** Inspect its Inputs bar; extend it by approving the next day, then move/cut it, Undo and reload.  
**EXPECTED:** Dates and remarks tails follow each operation. Approval/extension attribution follows the promised approval rule; later move/cut preserves original placement and adds change attribution.  
**DISPROVES:** A stale bar, duplicate leave or missing/wrong actor after a specialised writer.

**X-07. Available redefinition refreshes both calendars after a page revisit.**  
**Surface/rules:** Leave War definition/working and SANS; D617, D640.  
**SETUP:** Read a SANS date, then visit Leave War; choose a filter change that removes two otherwise available pilots.  
**ACTION:** Save it, reopen the working box and return to SANS without reloading. Undo and return again.  
**EXPECTED:** Available falls by two and positive still-needed rises by two; Undo restores both.  
**DISPROVES:** Page-level caching preserves either old half of the calculation.

**X-08. An editor follows Leave War and Undo writers, not only List edits.**  
**Surface/rules:** Input editor, Leave War move/cut and Undo; D641.  
**SETUP:** Open a leave editor and locally change Remarks.  
**ACTION:** Through the controlled same-world path, move/cut its leave from Leave War; separately Undo the previous saved edit.  
**EXPECTED:** Untouched fields follow those writers; competing Remarks changes require a choice. Save cannot restore removed days unnoticed.  
**DISPROVES:** Only List-originated edits are detected or Undo-created record replacement resets the draft.

**X-09. Medical splitting preserves attribution on every document page.**  
**Surface/rules:** Medical card, document viewer, Inputs and medical trim; D629.  
**SETUP:** File fresh medical entries with distinct documents, actors and times, including an overlapping episode.  
**ACTION:** Apply an upchit/medical trim, inspect resulting pieces, then page through every document from Medical and a schedule puck.  
**EXPECTED:** Each page shows the placement/change line of its own input; document identity, medical span and existing viewing permissions remain correct.  
**DISPROVES:** The viewer keeps the first document’s attribution or a split loses its supporting document.

**X-10. Undo never reverses another person’s work.**  
**Surface/rules:** Group input, requirement and holiday commands; D148.  
**SETUP:** Under the controlled actor arrangement, A changes one item, B changes a different item; retain A’s session history.  
**ACTION:** A undoes; repeat with B changing the same item after A.  
**EXPECTED:** Different-item Undo reverses only A’s change. Same-item conflict refuses and identifies the newer actor. Redo does not overwrite B either.  
**DISPROVES:** B’s work disappears or any other-person change disables all of A’s unrelated Undo.

**X-11. Grouping in Changes survives edits, deletion and amendment.**  
**Surface/rules:** New to you, All changes, To go out and Group by Who; D663.  
**SETUP:** File a fresh three-person shared input, then edit one subject alone and delete the remaining group.  
**ACTION:** Inspect every Changes tab before and after an amendment; follow each item’s available jump.  
**EXPECTED:** Shared actions group under one item with names; individual history remains attributable, including after deletion. Group by Who retains actor meaning.  
**DISPROVES:** Deleted groups lose their names, tabs group differently or a jump opens an unrelated surviving input.

**X-12. A second change on an already pending day does not reset the comparison.**  
**Surface/rules:** Published pending, Changes, sign-offs and amendment; D103, D178.  
**SETUP:** Publish a clean day; file a three-person input, giving three pending changes.  
**ACTION:** Edit that input’s remarks, add an unrelated one-person input, then publish an amendment.  
**EXPECTED:** Counts describe current differences from the issued version—not accumulated clicks. Every affected person remains represented; the amendment clears pending and issues the final content.  
**DISPROVES:** Editing creates duplicate pending identities or amendment leaves stale pending rows.

**X-13. Failed persistence remains visible and recoverable with a window open.**  
**Surface/rules:** Failed-save band, editor, settings and subsequent reload; D641.  
**SETUP:** Use the host’s controlled failed-save arrangement, with an input editor or settings window open on a short screen.  
**ACTION:** Save through the actual button, inspect the failure band and offered recovery, then retry successfully.  
**EXPECTED:** Failure is unmistakable and reachable; the app does not claim durable success or discard recoverable work. After successful retry, reload gives exactly one saved result.  
**DISPROVES:** The window covers every recovery action, the failure says “saved” or retry duplicates the input.

**X-14. Role changes close privilege gaps across every open door.**  
**Surface/rules:** Settings, Calendar, Required editor, group editor, drag and Medical actions; D655, D658, D641.  
**SETUP:** Open privileged controls as Saber; repeat under member view, SANS/non-SANS members, guest and a signed-in account without access.  
**ACTION:** Attempt each visible write and revisit a previously requested window after access changes.  
**EXPECTED:** Permissions are checked at the action, not just when the window opened. No-access users cannot enter through stale navigation; the sign-in card remains usable.  
**DISPROVES:** A retained window or drag completes an admin write after authority is gone.

**X-15. A roster/posting change reaches SANS, personal records and published pending together.**  
**Surface/rules:** People, SANS/Highlight, Leave War, Inputs and published working copy; D617, D178, D103.  
**SETUP:** Give a SANS person future commitments, another personal input and a place on a published day.  
**ACTION:** Apply a posting-out effective within those spans; separately test archive and removal of SANS status.  
**EXPECTED:** Applicable trims and count exclusions agree across surfaces; retained issued content follows publication rules and affected working content becomes pending. No unrelated person changes.  
**DISPROVES:** SANS retains an ineligible count, a trimmed bar regrows or publication is bypassed.

**X-16. Placement detail must not leak into preserved schedule and export layouts.**  
**Surface/rules:** Board Unavailable/Personal Inputs, week, print/export and late marks; D629, D655.  
**SETUP:** File fresh solo/shared absences and duties, then edit them so placement and change lines both exist.  
**ACTION:** Compare opened calendars/List with board, week, print and export before and after publication.  
**EXPECTED:** Required detail appears in calendar readers; schedule/export retain their established personal layout without placement metadata. Ordinary late mode and medical display still work.  
**DISPROVES:** A shared display change merges schedule rows or metadata changes issued/exported wording.

**X-17. Short-screen windows coexist with calendar height and unchanged controls.**  
**Surface/rules:** Both months, overflow, editor, day windows and app toolbar; D487, D648, D653, D664.  
**SETUP:** Use six-week August with crowded dates at 390 × 568 and landscape; retain a tall-phone comparison.  
**ACTION:** Open two windows, drag one low, expand the day, reach the last input and use Undo and close.  
**EXPECTED:** All actions remain reachable, the month has no trapped inner scroll and the established visible button sizes remain.  
**DISPROVES:** A demonstrated overlap/missed tap, unreachable action or unintended button resizing.

**X-18. Every publish stage survives reload and a second sign-in without rebuilding the group.**  
**Surface/rules:** Saved inputs, grouping, pending, OIL and attribution; D654, D663, D142, D178.  
**SETUP:** Take the fresh shared-duty lifecycle through draft, published clean, pending edit and amended states.  
**ACTION:** At each stage, reload, sign out, sign in as a subject, then return as Saber in the same browser world.  
**EXPECTED:** Group membership, individual OIL, pending count and attribution retain that stage’s values. Undo history clears at sign-out rather than granting another user the previous actor’s history.  
**DISPROVES:** Grouping survives only in memory, credit doubles on load or another user inherits Undo.

Only a real phone can settle native number-pad/keyboard behaviour and physical touch reliability in **P2-04, P3-09, P4-11, P5-06 and X-17**; the proposed desktop/emulated checks do not claim that evidence.

**Missing call sites**

**M1 — The input editor’s Escape handler does not check which window is in front.**

- **Location:** [inputedit.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1923), `InputEditor`, capturing `esc` handler. The shared front-window check exists in [FloatWindow.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/FloatWindow.tsx:159).
- **Concrete consequence:** In **P3-01**, an editor behind settings handles Escape first and closes, losing its unsaved draft. Because it stops propagation during document capture, the front window’s normal bubbling Escape handler does not receive the event.
- **Cause:** The editor checks only whether focus is in an external text-editing control. It does not consult `frontWin()`. A front-window button, title or container therefore fails to protect the rear editor.
- **Exact fix steps:**
  1. Make Escape ownership explicit for the editor’s window mode.
  2. When no editor-owned blocking sheet is active, return without consuming Escape unless `frontWin() === 'inputedit'`.
  3. Use the shared shell’s focus rules so a page control behind the windows retains its own Escape behaviour.
  4. Preserve the existing one-layer dismissal of the editor’s OIL, medical and document questions.
  5. Consume Escape only after this handler has established ownership.
  6. Verify both stacking orders, focus on buttons and text fields, each owned sub-sheet, and unchanged blocking-editor behaviour outside Inputs.

This is a code-supported failure path; it has not been executed in this review.

**M2 — Unsaved-change detection omits the separately held people selection.**

- **Location:** [inputedit.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1846), `InputEditor`, the record-switching layout effect; people changes enter through `PeoplePick`’s `onChange` at line 2176.
- **Concrete consequence:** In **P5-01**, adding a third person to an existing shared input, then opening another input, silently discards that unsaved addition. Removing a person while multiple people remain has the same path.
- **Cause:** The switch guard checks `WIN_FIELDS` against the base draft. The selected people live separately in `ppl` and `basePpl`. A multi-person change does not update `draft.person`, so the guard sees no dirty field and reseeds the editor.
- **Exact fix steps:**
  1. Add a people-membership dirty check comparing `ppl` with `basePpl.current`.
  2. Compare membership rather than incidental display order; removing and re-adding the same people should not create a false pending membership change.
  3. Include this check alongside the existing field comparison before switching to another input.
  4. Keep the current input and complete people selection when showing the unsaved-change question.
  5. Preserve the existing Keep editing and Discard and open actions.
  6. Verify add-only, remove-only, Several-to-one, new-input and ordinary-field changes; also verify that background membership changes already followed into the base do not produce a false warning.

This is also a code-supported failure path, not a runtime observation. Neither item is a stored-demo migration issue.

**Explicit negatives — connections found in the source**

These are evidence of wiring, not substitutes for the proposed walk.

- **Joined day facts:** `flyAnswer` connects the planning resolver with Leave War facts and SANS commitments; the main calendar and working readers call that join.
- **Available excluding SANS:** The specialised Available calculation excludes SANS before counting; it is not merely a label applied to an ordinary counter.
- **Leave War refresh:** The day-fact subscription watches the relevant Leave War state identities and invalidates its cached facts.
- **SANS deduplication:** Commitment counting uses separate person sets for F, O and A and explicit dated coverage.
- **SANS opened day:** It subscribes to both app and Leave War changes and reads the same joined answer as the month.
- **Placement readers:** Both opened days, List, editor foot, bar tooltip, Medical card and document viewer have placement-line calls.
- **Document paging:** The document viewer derives its placement line from the currently displayed document’s input.
- **Placement writers:** Editor creation/editing, List creation/OIL answers and Leave War approval/extension/change paths call the placement/change stamp helpers.
- **Shared calendar grouping:** Calendar modelling and List rendering use shared-entry grouping; the editor resolves the corresponding entry.
- **Shared drag:** The drag path resolves the entry’s records and checks permission across them.
- **People picker:** It uses the schedule puck renderer and the common permission checks; Personnel and SANS grouping are explicit.
- **Changes grouping:** The item identity uses the recorded group identifier, with named individual history retained.
- **Settings doors:** Logic opens the same Inputs/SANS settings windows used by the calendars.
- **Settings validation:** Both settings forms validate their draft values before starting their planned writes.
- **Late rule:** The calculation selects the input’s own setting and first-week anchor; downchits and upchits are explicitly exempt.
- **Window shell:** The shared shell checks front-window ownership for Escape; M1 is the editor’s additional handler bypassing that protection.

The schedule’s future single shared row, other Leave War blocking windows and the separately checked Leave War phone top are excluded as instructed. Existing-data-only migration concerns are excluded under D56.

**Rulings: none this session.**