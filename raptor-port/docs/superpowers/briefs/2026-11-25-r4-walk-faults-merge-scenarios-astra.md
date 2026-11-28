<!-- Astra (gpt-6-astra, high, read-only), 25 Nov 26 — one of two blind scenario designers of the merge round (chat 183); read an exported copy of the merge commit 0ff30dbdf (D:/rw4/r183/copy-m); the brief: 2026-11-25-r4-walk-faults-merge-scenario-brief.md; its last message, whole -->

Read-only scenario design for the exported merged build `0ff30dbdf`. No app, tests or build were run; no files changed. These are failure hypotheses, not observed faults. No other designer’s report was opened; comparison with those lists remains the host’s job.

The scenarios below rank the combined risks, starting with a specialised window. Each adds a section refresh or a crossing between sections to the shared-row behaviour.

Use fresh inputs on an editable day, created through **Inputs → + Input**, the people picker and date controls. Use the Board’s own add buttons for programme items. Confirm each setup appears before continuing. “Replace” means select the whole box value before typing. Capture the immediate result and the settled result; on WebKit, record which box actually retains the caret. A run where focus left text does not prove behaviour while typing.

**Coverage**

| Where the changes meet | Visible sign and action |
|---|---|
| Unavailable: shared and separated inputs; timed/all-day leave; overseas duty; commitments moved there | Start, end, remarks, type/window/Delete, Reject, LATE, puck replacement, arm and drag; correct person and stable row order |
| Personal Inputs and Ground Programme | Shared membership, both times, remarks, acceptance and placement agree; refreshed controls remain usable |
| Common Programme and ALL AVAIL window | Count, named crowd and open window agree while another section holds the caret |
| Available crew and crew drawer | Availability, reasons, selection and armed rings follow the changed person; newly drawn pucks work |
| Flying waves, duties, sims and warnings | Saved absence changes reach affected warnings and puck marks outside the held section |
| Changes window, history bubbles, input windows, Blue/Red question | Correct subject, surviving controls, truthful anchoring and keyboard return |
| Publishing, Undo/Redo and later readers | Working and issued versions stay distinct; Inputs and the week agree after settling and reopening |

**M1 — Common Programme’s open ALL AVAIL window**  
**Device/role:** Desktop 1440×900; scheduler `ad`/`a`.

**Setup/presses:** File shared leave for Ranger and Hex, 08:00–12:00. File an ALL AVAIL Meeting at 10:00–11:00. Open its Board count window and move it aside. Replace Ranger’s leave start with `1130`; press Tab into his end.

**EXPECTED:** The Common Programme count and open window include Ranger and exclude Hex, assuming no other commitments. Ranger’s typing box stays put. **Sources:** caret contract; ALL AVAIL’s live availability contract.

**Disproof:** Stale count, disagreement with the window, Hex becoming available, or lost focus.

**M2 — A separated overseas duty moves through three sections**  
**Device/role:** Phone 402×874, touch, WebKit; scheduler `ad`/`a`.

**Setup/presses:** File shared overseas duty for Ranger and Hex, 08:00–12:00. Change Ranger’s start to `0900`, tap his end, then his Reject. Open Personal Inputs; press Ground on Ranger’s newly shown input. Change its Ground Programme end to `1100`; tap another section.

**EXPECTED:** Ranger alone moves and receives 11:00; Hex remains unavailable at 08:00–12:00. Personal Inputs and Ground Programme agree. **Sources:** own-part contract; D737, D739; overseas-duty placement contract.

**Disproof:** Wrong person moved, missing/duplicate destination row, or conflicting saved times.

**M3 — Clearing both times while crossing between two copies**  
**Device/role:** Desktop 1440×900; scheduler `ad`/`a`.

**Setup/presses:** File a shared Meeting for Ranger and Hex, 08:00–12:00. Open Personal Inputs. Clear the Meeting’s Ground Programme end; click directly into its Personal Inputs start, enter `0900`, then Tab.

**EXPECTED:** Both people remain together at 09:00–23:59. Both Ground Programme time boxes update while Personal Inputs holds the caret. **Sources:** D739; “Clearing a time means all day”; caret contract.

**Disproof:** An old start returns, one person separates, or either copy retains an incorrect paired time.

**M4 — An armed row changes its address before the next tap**  
**Device/role:** Phone 402×874, touch, WebKit; scheduler `ad`/`a`.

**Setup/presses:** Create shared leave, 08:00–12:00. Change Ranger’s start to `0900`; tap his end, then his puck. Tap an existing Ground Programme remark without typing. Tap Ranger’s puck again. Repeat the sequence, choosing Outlaw from the crew drawer instead of tapping Ranger again.

**EXPECTED:** Ranger keeps the armed ring through the section refresh; the second tap puts it down. Choosing Outlaw replaces Ranger alone. **Sources:** own-part and arm-and-plant contracts.

**Disproof:** Lost/misplaced ring, a second tap that rearms, or Hex being replaced.

**M5 — Tab crosses the section boundary after a separation**  
**Device/role:** Desktop 1440×900; scheduler `ad`/`a`.

**Setup/presses:** File shared leave for three people. Using section grips, place Unavailable immediately before Ground Programme, which contains one ordinary item. Change the last displayed person’s start. Tab through end and remarks into Ground Programme; Shift+Tab back; change that person’s leave end.

**EXPECTED:** The route visits each available box once in displayed order. Only the intended person’s leave changes; neighbours keep their order. **Sources:** D551, D554–D555; own-part and row-order contracts.

**Disproof:** Skipped/disconnected focus, wrong-person typing, or reordered neighbours.

**M6 — Undo and Redo redraw Unavailable beside another caret**  
**Device/role:** Phone 402×874, touch, WebKit; scheduler `ad`/`a`.

**Setup/presses:** Separate Ranger from shared leave by changing his start. Tap an unchanged Ground Programme remark. Press the Board’s Undo, then Redo. Return to Ranger’s end, replace it with `1100`, and leave the box.

**EXPECTED:** Unavailable reflects the restored shared input, then Ranger’s separate input. The final change reaches Ranger alone. A caret retained in Ground Programme survives both refreshes. **Sources:** caret, own-part and Undo contracts.

**Disproof:** Mixed shared/separate rows, lost typing focus, or Hex receiving the final change.

**M7 — A refused value heals after the row has refreshed**  
**Device/role:** Phone 402×874, touch, WebKit; scheduler `ad`/`a`.

**Setup/presses:** From fresh shared leave, save Ranger’s own 09:00–11:00. Tap Ground Programme, then return to Ranger’s end. Replace it with sixty `Z` characters; tap Ground Programme again.

**EXPECTED:** Ranger’s end heals to 11:00; Hex’s times remain unchanged. The refusal fits inside the screen and leaves the next control usable. **Sources:** own-part refusal-healing contract; passing-note wrapping contract.

**Disproof:** Healing to Hex’s time, invalid data retained, clipped words, or an intercepted next tap.

**M8 — Pending-change navigation after early row replacement**  
**Device/role:** Desktop 1440×900; scheduler `ad`/`a`, then member `us`/`us`.

**Setup/presses:** Create shared leave and publish the day using its four sign-offs. Change Ranger’s start; click an unchanged Ground Programme box. Open the pending count and press Ranger’s change. Open his refreshed row’s input window. Close the Board, sign out, then sign in as the member in the same tab. Inspect View-only Sched and Ranger’s Inputs entry.

**EXPECTED:** Navigation and the window identify Ranger’s current input. Inputs shows his saved change; the issued schedule retains its published times until amendment. **Sources:** own-part, changes-window and published-face contracts.

**Disproof:** Landing on Hex, opening Hex’s input, lost saved change, or unissued times on the published face. **RECORD exactly what pending count is shown**; do not infer a count for the separation.

**M9 — Availability grows above the phone’s typing box**  
**Device/role:** Phone 402×874, touch, WebKit; repeat in Phone and pinched Desktop layouts; scheduler `ad`/`a`.

**Setup/presses:** File shared all-day leave. Add an earlier flying wave with usable times and no other commitments for Ranger or Hex. Drag Available crew above Unavailable. Type `1800` in Ranger’s leave start; tap his end and begin editing immediately.

**EXPECTED:** Ranger becomes available for the earlier wave; Hex stays away. Ranger’s saved default end is 23:59. Refreshing the taller section above does not move his box or discard subsequent typing/selection. **Sources:** caret and paired-time contracts.

**Disproof:** A jump during refresh, lost partial text/selection, wrong default end, or Hex appearing free.

**M10 — Drag directly from the newly refreshed section**  
**Device/role:** Desktop 1440×900 mouse, then phone 402×874 touch; scheduler `ad`/`a`. WebKit matters for retained focus.

**Setup/presses:** Recreate M9. After changing Ranger’s start to 18:00, drag his newly shown Available crew puck directly into the earlier wave’s empty front seat. Repeat with an ordinary-speed touch drag.

**EXPECTED:** Ranger lands once. His leave remains 18:00–23:59; Hex’s remains all day. Crew markings and warnings reflect those facts. **Sources:** own-part, drag and caret contracts.

**Disproof:** Dead drag, wrong person landing, or either leave changing because of the drop.

**M11 — A warning repaint must preserve an unanswered question**  
**Device/role:** Desktop 1440×900 and phone 402×874 touch, WebKit; scheduler `ad`/`a`.

**Setup/presses:** Enable blue/red tracking through Logic. File shared leave overlapping an earlier flight; put Ranger and Hex in its front and rear seats. Enter mission `DS-2` to open the Blue/Red question. Leave it unanswered. Change Ranger’s leave start to `1800`; move into his end. Then answer Blue.

**EXPECTED:** The question survives the wave’s refreshed warning marks and answers for that formation. Ranger’s absence conflict clears; Hex’s remains. Restoring the question does not move the typing box. **Sources:** open-question, caret and own-part contracts.

**Disproof:** Missing/duplicated question, answer applied elsewhere, stale refreshed warning marks, or a typing-box jump.

**Explicit negatives from the read**

- The week already refreshes around its held block. Its ordinary sequential shared-row edits are existing coverage; only agreement after these Board sequences is additional.
- SANS availability and upchits are expressly excluded from Unavailable’s shared-row rendering. No direct separation scenario applies there.
- Overall Notes, ordinary duty rows and sim rows do not acquire shared-input addresses. Their relevant exposure is refreshed layout, crew marks and warnings.
- Input windows take focus away from Board text. Editing behind a blocking input window is not a valid combined scenario; the actionable risk is opening the correct window during transition.
- OIL Earn changes the Board to its read-only editing shape. No scenario assumes typing and ordinary puck reassignment remain available inside that mode.
- A held section’s own rings may wait by contract. Stale rings become a failure here after that section is left, or on another section already refreshed.
- The already-filed held-row history bubble, missing-person silence and Leave War remark fallback are not new merge findings. A bubble whose anchor disappears already has an explicit dismissal check.
- No scheduler-without-admin scenario, cross-tab live-sync assumption, old-data-only defect, or database migration scenario is included.

Walk: scenario design only; runtime results remain unverified.  
Rulings: none this session.