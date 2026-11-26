Scenario-design report for the **exported copy of `claude/r4-walk-faults-170`, source commit `5b524f1ab`**, in `D:/rw4/night3/copy-b`.

This is a read-only scenario design. I did not run the app, tests or build, change files, or consult the other designer or the builder’s evidence. No builder handoff was supplied after compaction. The failures below are possibilities to test, not observed defects.

The strongest risks are a shared Unavailable input splitting while its boxes remain held, entering OIL Earn while typing, and another section growing above the caret. These exercise different boundaries from the reported Personal Inputs → Ground Programme fault.

One correction to the brief: **D831 and D840 place the unanswered-OIL reminder under the top bar**, including the Board’s own bar. The walk should preserve that current position, not restore the older foot position.

For the scenarios:

- **P:** phone 402×874, touch. **D:** desktop 1440×900.
- **A:** scheduler/admin `ad` / `a`. **M:** member `us` / `us`.
- Run P in Chromium and WebKit; WebKit matters particularly for touch focus, keyboard appearance and Undo. Desktop Chromium is the comparison.
- **Caret contract:** “While the caret is in a text box,” lines 721–740.
- **Undo contract:** “Undo and Redo never run under a caret,” lines 7919–7925.
- **Own-part contract:** Personal Inputs versus Unavailable editing, lines 2792–2809.
- “As on main today” requires a matching baseline observation; none was collected in this review.

Use newly created examples. Do not count defects confined to old stored demo records.

The coverage inventory is:

| Family | Qualifying objects and visible signs |
|---|---|
| Board day | Day bar; Overall Notes; Common Programme; every Flying wave; Duties; Sims; Ground Programme; Personal Inputs; Available crew; SANS Avail; Unavailable. Look in each displayed section, including folded and reordered forms. |
| Text renderers | Ordinary text boxes, multiline notes, editable text within rows, repeated aircraft fields, input-backed times/remarks, individual Unavailable rows. Wave selectors, cards and pucks are separate controls, not substitutes for text-box coverage. |
| Other Board readers | Warning list/count, pending count, sign-off, highlights, history marks/window, mission-role question, previous-day indication. |
| Writers and doors | Typing followed by Tab, Shift+Tab, Enter, Escape, click or touch; row actions; input windows; roster assignments; OIL controls; Undo/Redo. Enter through week day headers and the Board’s own navigation. |
| States | Normal Board; desktop layout on phone; folded/reordered sections; OIL Earn; frozen saved/published version; read-only presentation; close/reopen and another day/week. |
| Downstream readers | Edit Schedule week, published/View-only schedule, Inputs list/calendar/day/input window, change history, bell, OIL answer and credited amount. |
| Passing notes | Plain, amber warning, red kept-clash and grey refusal; shared note writers including Leave War. Inspect the note’s text, border, sign, width, lines and position. |
| Overlays | Input/day/settings/Calendar windows, history and ALL AVAIL windows, schedule question sheets, Leave War sheets, unanswered-OIL band and phone keyboard. Each needs its actual production door. |

Ranked scenarios follow.

1. **S01 — Shared Unavailable row splits, then receives another edit. P+D; WebKit essential; A.**

   **Setup:** File a new timed Unavailable input for Ranger and Hex, 08:00–10:00. Open that day’s Board and expand Unavailable.

   **Presses:** On Ranger’s row, replace Start with `0900`; Tab to End; type `1100`; Tab to remarks; type `own hours`; Enter. Inspect both people, then their input windows. Undo and Redo each change.

   **EXPECTED:** Ranger’s first edit creates his own input; subsequent edits reach that same input. Hex keeps the original hours and remarks. Personal Inputs, Unavailable and input windows agree after focus leaves. Sources: Own-part contract; Undo contract.

   **Disproves:** Second edit disappears, changes Hex, creates another split, duplicates a row, or only becomes correct after reopening.

2. **S02 — Enter OIL Earn while a text box still holds focus. P+D; WebKit essential; A.**

   **Setup:** A day containing Flying, Ground, Personal Inputs, Unavailable, SANS and Available crew; include an item that can earn and one that cannot.

   **Presses:** Type a changed Ground remark, then directly tap OIL Earn without first tapping elsewhere. Tap an eligible puck, then an ineligible puck. Leave OIL Earn. Repeat by entering the mode before attempting an edit.

   **EXPECTED:** The pending edit settles; the complete mode changes together; ordinary schedule editing is unavailable in OIL Earn. An ineligible tap selects nothing and gives the plain explanatory note, not “Blocked.” Sources: Board OIL Earn contract; D1783. Record the eligible item’s exact calculated answer.

   **Disproves:** Mixed old/new sections, ordinary editors left active, stale Available crew, lost remark, or incorrect refusal face.

3. **S03 — Another section grows above the caret. P+D; WebKit essential; A.**

   **Setup:** Shared Training input displayed in Personal Inputs and Ground. Put Ground above Personal Inputs; repeat with their order reversed. On P also use desktop layout, zoomed and panned.

   **Presses:** Change the input’s remark to several lines; Tab into its next available box and leave a partial value there. Repeat near the top and bottom scroll limits, with the phone keyboard open.

   **EXPECTED:** Ground updates immediately; the active box keeps its screen position, partial text, selection and caret. Only its own section may remain held. Source: Caret contract and the brief’s explicit geometry promise.

   **Disproves:** Vertical/horizontal jump, selection reset, lost partial text, or Ground remaining one edit behind. Capture before/after box coordinates and pictures.

4. **S04 — Actual Undo/Redo buttons release and flush the held section. P+D; WebKit essential; A.**

   **Setup:** New Training input, 08:00–10:00, visible in both Board sections.

   **Presses:** Set Start to `0900`, Tab, type End `1100`, then directly tap top-bar Undo. Tap Undo again, then Redo twice. Repeat with a remark changed and restored to its original value.

   **EXPECTED:** The unfinished End edit saves as its own step before Undo removes it; the next Undo removes the Start edit. Every restored value reaches the screen, including an original-looking held section. Visible changes do not cause unnecessary scrolling. Sources: Undo contract; D672.

   **Disproves:** Screen/data disagreement, undone text being saved back later, missing step or needless jump. Keyboard text undo alone does not cover this case.

5. **S05 — ALL/ALL AVAIL uses Common Programme, not Ground. P+D; WebKit relevant; A.**

   **Setup:** Create otherwise equivalent named-person, ALL and ALL AVAIL Meetings.

   **Presses:** Change each Start and remark under Personal Inputs, moving directly to the next box. Open the ALL AVAIL people display. In the input window change named people to ALL AVAIL, save, then reverse it and edit again.

   **EXPECTED:** Named inputs appear in Ground; ALL/ALL AVAIL inputs appear in Common. The other section updates while typing continues. Exactly one programme row remains after each move. Sources: D955; D739; Caret contract.

   **Disproves:** Common is stale although Ground works, duplicate/missing rows, or the expanded people display disagrees. **RECORD exactly what it shows** for the calculated availability count.

6. **S06 — Plain-user round through every reader. P+D; WebKit essential; A, then M.**

   **Setup:** File a new Training input, “Range brief,” 08:00–10:00, including the member account’s person. Accept/file it onto a fresh day’s programme through the normal controls.

   **Presses:** Open Board from the week’s day header. In Personal Inputs type Start `0900`, Tab to End, and inspect Ground without moving focus into it. Type End `1100`, Tab onward. Close Board; inspect the week; reopen Board. Visit Inputs list, calendar, opened day and input window, then change history and bell. Sign out and inspect the member’s permitted readers and bell.

   **EXPECTED:** The saved input and editable schedule agree on 09:00–11:00; Ground updates before Board closes. The scheduler’s changes are attributed in history. A shared row changes the input for everyone. Sources: D739; Caret contract.

   **Disproves:** Any live reader retains 08:00–10:00, successive edits lag, or reopening is required. For bell wording and notification count, **RECORD exactly what it shows** and compare with main.

7. **S07 — Every text-box family participates. P+D; WebKit essential; A.**

   **Setup:** Populate every editable section, including two aircraft in one formation, a duty, AMT/OFT sims, manual Ground and input-backed Ground.

   **Presses:** In turn edit Overall Notes; Common title/times/remarks; aircraft callsign/mission/brief/take-off/landing/remarks/stores; in-time and area/time text; duty role/times/remarks/notes; sim fields; Ground fields; Personal Inputs and Unavailable times/remarks. For each: replace a value, Tab, Shift+Tab, then leave the section. Repeat one-tap replacement and second-tap digit editing in time boxes.

   **EXPECTED:** Available fields follow their approved route, including repeated Board aircraft fields and open headings/notes. Time replacement preserves second-tap digit editing. Sources: D551, D554, D555, D1047; Caret contract.

   **Disproves:** One renderer loses text, repeats/skips a field, or fails to release its held section.

8. **S08 — Section boundary, fold and immediate button press. P+D; WebKit essential; A.**

   **Setup:** Reorder sections, fold one between two open sections, and leave available empty boxes. Include a row with an existing add/remove/CX control.

   **Presses:** Tab from the last box of one section into the next; reverse. Repeat by directly tapping the next field or row button immediately after typing. Start a touch on a field, scroll instead, then resume typing. Finally Tab from the day’s last box.

   **EXPECTED:** Closed sections stay closed; displayed order governs; the intended first tap works once. No next-day jump. At day end, use the next ordinary control if present; otherwise retain the last box. Sources: D551, D555, D597; Caret contract.

   **Disproves:** Swallowed/doubled action, wrong destination, stranded caret or painting remaining suspended after scrolling.

9. **S09 — Leave the day through every door. P+D; WebKit essential; A.**

   **Setup:** Two adjacent days and another week with distinguishable new notes.

   **Presses:** After typing, separately use the day arrow, day chip where offered, Calendar date in another week, Board close/reopen, and page navigation. Repeat with untouched focus. Exercise Escape from a note, then Escape again.

   **EXPECTED:** Committed text belongs only to its original day; returning shows stored content without a delayed overwrite. Untouched focus adds no change. Sources: Caret contract; no-op contract. Planning-note Escape first leaves the box, then closes the day: D731(9).

   **Disproves:** Wrong-day content, lost edit, extra change, or stale held content arriving after reopening.

10. **S10 — Frozen and read-only presentations. P+D; WebKit relevant; A and M.**

    **Setup:** Publish a fresh day, then make a distinguishable live edit. Retain the earlier version.

    **Presses:** As A, open the earlier version through the version selector; return to live editing; type and Tab. As M, open the permitted View-only schedule and own input.

    **EXPECTED:** Frozen/read-only content does not acquire editable boxes or a typing route; live content resumes correctly. Sources: published-version/read-only contracts; D551. Compare exact visible entry controls with main.

    **Disproves:** Live changes leak into the frozen version, stale frozen content appears on return, or member editing rights widen. Do not invent a member Board door if none is offered.

11. **S11 — Decorations and questions remain current. P+D; WebKit essential; A.**

    **Setup:** A day with history marks, warnings and a published version; include a flight whose timing can cross the previous-day boundary.

    **Presses:** Open history; change a time and Tab onward. Make a change that raises the existing mission-role/OIL question. Answer and return. Inspect warnings, pending/sign-off indicators, highlights and previous-day label.

    **EXPECTED:** Indicators outside the held section are current; rings/marks inside it may wait until departure. A save opening a question stops the schedule’s Tab route and gives the question focus. Source: Caret contract.

    **Disproves:** Stale outside indicators, typing continuing behind the question, detached history display or lost caret on return. **RECORD exactly what it shows** for scenario-specific warning totals.

12. **S12 — Published pending changes and OIL consumers. P+D; WebKit relevant; A, then M.**

    **Setup:** Publish a new shared timed input with an OIL answer, then change its hours on the Board.

    **Presses:** Inspect the live programme, pending changes, input window and OIL display; inspect the issued version as M; return as A and publish through the normal confirmation.

    **EXPECTED:** The schedule-side edit retains the input’s OIL answer and recalculates from its new hours; it does not ask the filer’s question again or double-count input plus row as two pending changes. Source: D739. Issued content follows the publication contract.

    **Disproves:** Double pending count, lost answer, early issued-version change or stale hours after publication. **RECORD exactly what it shows** for credit totals.

13. **S13 — Long unbroken warning from real typing doors. P+D; WebKit essential; A.**

    **Setup:** Use this 60-character value: `abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567`.

    **Presses:** Paste it into week take-off, then Board take-off, Personal Inputs Start and Unavailable Start; commit each. Repeat at widths 320, 360, 390, 402, 620, 621, 820, 821 and 1440, plus phone landscape.

    **EXPECTED:** The entire invalid-time explanation stays within the note border; phone width retains its small margins; desktop remains centred at the foot. Sources: brief; D828. The rejected value does not become a valid saved time.

    **Disproves:** Any text fragment protrudes, is clipped or forces page overflow. Inspect every rendered line, not only the note rectangle. Do not substitute an iPhone time-wheel input for a free-text time box.

14. **S14 — All faces, especially ordinary multi-line notes. P+D; WebKit essential; A.**

    **Setup:** Prepare real actions producing an ordinary note, invalid-time warning, kept scheduling clash and refused change. Include Leave War’s refusal route.

    **Presses:** Trigger each separately. In Leave War, enter an invalid figure; test normal commit, then direct navigation away while it still holds focus. Distinguish its inline error from any passing note actually produced.

    **EXPECTED:** Ordinary notes retain baseline width, line breaks, position and colours; red still means a kept clash. Refusal uses grey with the red sign and bold white “Blocked:”. Sources: brief; D1668. An inert OIL puck uses the plain explanation: D1783.

    **Disproves:** Changed ordinary wrapping, squashed sign, red refusal box or wrong face. Include ordinary multi-line examples near a wrapping boundary. **RECORD exactly what it shows** if navigation produces no passing note.

15. **S15 — Note placement across windows and bands. P+D; WebKit essential; A, M where allowed.**

    **Setup:** Have a production warning available; separately open input, day, settings, Calendar, history and ALL AVAIL windows. Also exercise schedule question and Leave War sheets.

    **Presses:** Raise the warning with each surface open. Separately raise it first, then open a window; close the window and raise another. Repeat with the unanswered-OIL band visible.

    **EXPECTED:** On phone, a passing note with a qualifying window open is at the top, clear of foot buttons; ordinary Board alone retains its normal placement. Desktop stays centred at the foot. Sources: D731(1); brief. The OIL band remains below the relevant top bar: D831/D840.

    **Disproves:** Covered buttons, note hidden behind a window, or a band moved back to the foot. For sheet-specific placement and an already-visible note after closing/resizing, **RECORD exactly what it shows** against main.

Explicit negatives:

- Same-section rings waiting until focus leaves are intentional; they are not the reported stale-other-section fault.
- Available crew and SANS still require repaint checks, but neither should gain a fictitious text-edit route.
- Native input-window time wheels are not a valid route for typing sixty letters.
- An inline Leave War error is not evidence that its shared passing-note route works.
- No scheduler-without-admin scenario is valid.
- Ordinary week editing is a comparison and downstream reader; it does not prove Board coverage.
- Frozen/read-only sections must remain non-editable; skipped Tab destinations there are expected.
- Old demo-record repair, unrelated engine calculations and unrelated page redesigns are outside these fixes.

**Rulings:** none this session.  
**Walk:** NOT RUN — scenario design only, as instructed.

