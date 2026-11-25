I completed the scenario design. This session’s read-only restriction prevents saving the requested file, so the complete report follows.

# Shared absence: independent walk scenarios

**Status:** Scenario design only, from the supplied fixed-state copy and change. No app, tests or build run; no repository files changed. No other designer’s report read. No compaction or pasted post-compaction handoff occurred.

The strongest missing-path candidates are the remark window’s displayed values, Escape, Tab’s next-box refresh, and controls beside the held row. These are **walk hypotheses, not reproduced findings**.

The overall change meets **FULL** criteria: saved data, published records, availability and earned leave can be affected. This assignment supplies its walk scenarios only.

## Rules and observation method

Sources used below:

- **P — person’s part:** D737, D755 and D759 reading 4; `ui-contracts.md`, lines 2787–2794. One man’s Unavailable row changes his input alone; subsequent saves follow him; an unresolvable part saves nothing.
- **T — typing:** `ui-contracts.md`, “Inline text editing” and “Clearing a time means all day.” Enter commits; Escape restores; Tab refreshes the destination; clearing either time makes the input all day.
- **W — leave windows:** D1307, D1354, D1339, D1362; `feature-impact.md`, “A leave request’s words and papers.”
- **I — issued day:** D45’s freeze-and-pending rule, **as narrowed by D103**: pending changes clear all four sign-offs; restoring the issued state restores them.
- **U — Undo:** D148. Only the signed-in person’s changes; another person’s newer change must not be overwritten.
- **R — shared row:** D661, D735, D739, D755. Ground Programme and Personal Inputs are whole-input rows; Unavailable is the per-person exception.

**Devices:** **P** = phone 402×874; **D** = desktop 1440×900; **B** = both. On phone, repeat typing with actual taps between boxes as well as keyboard Tab. Include Chromium and WebKit; simulated phone testing does not establish native iPhone keyboard behaviour.

**Fresh setup F:** Through Inputs → + Input, create a new shared LL for Ranger and Hex, 08:00–10:00, blank remark, on a clear future day. Verify it is one shared input before starting. Use separate fresh fixtures for destructive branches.

**After every save:** picture the edited box, adjacent boxes and Hex’s row **before leaving the section**, then after leaving and returning. Compare with Inputs’ card/window, Leave War and a reload. Do not force a repaint to make a failing intermediate display pass. Capture notices and history before changing sign-in.

Where wording or a precise count lacks a source: **RECORD exactly what it says**.

## Coverage inventory

“Present” below means a production path exists in the source, not that it has passed a walk.

| Object or surface | Visible sign and working gesture | Coverage |
|---|---|---|
| Member’s own approved-leave window | Own name, dates, remark, till tick, document chips; type/Enter/blur, tick, add/remove/open document | Present; S01–02 |
| Admin’s approved-leave window; member’s closed-day window | Same words controls where applicable; decision/delete controls belong to their own state | Present; S11 |
| Leave War day’s list | Separate entry lines, correct words/documents and permitted actions | Present; S11 |
| One-person drag window | One entry’s words, or dated grey lines above an empty box; words accompany the next action | Present; S12 |
| Board Unavailable | One row per named man; start/end/remark, type button, puck target | Present in phone, desktop and desktop-layout-on-phone; S03–10 |
| Edit Schedule week Unavailable | Same rows and editable cells; Enter, Escape, Tab and Shift+Tab | Present; S03–10 |
| Inputs calendar, opened day, List and input window | Correct people, dates, times, remark, documents and filing; open/save, calendar move and delete | Present; S09–10, S14–15 |
| Ground Programme / Personal Inputs | One shared row; edits deliberately affect everyone still in that input | Present; S19 |
| View-only, issued Board, next-week preview, print/export | Correct version’s rows and marks; no inline editing | Reader controls only; S16, S20 |
| Changes window and pending list | Correct person/input, values, author and destination; tap line to locate affected row | Present; S16, S20 |
| Bell on main bar and Board | Correct recipient and affected absence; tap reaches the correct current input | Present; S20 |
| Warnings, crew lists/drawers, free count, ALL AVAIL window | Correct availability and reasons; pick a seat, inspect or place a person | Downstream readers; S17 |
| Leave War grid, day panel, manning, balances; SANS demand | Correct person’s absence, portion and resulting figures | Downstream readers; S14, S17 |
| OIL Earn, OIL question/list and earned-leave tracker | Correct claim, person, answer and issued credit | Separate actions/readers; S18 |
| Undo/Redo, navigation, persistence, other input writers | Correct restored values; no duplicate save or wrong-person continuation | S08, S10, S15, S21 |

**Kinds:** LL, OL, OIL, CCL, PL, FCL, EL and CL; OD; CSE; Attach; Other under Unavailable; Training, Meeting, Appointment, Duty, Event and Personal moved there by a scheduler. Cover two and three named people, and permitted mixed named-person/ALL or ALL AVAIL commitments.

Medical HL, OML, ATT C and ATT B qualify as **single-person controls and competing writers**, not fabricated shared medical records. Upchit and SANS Availability do not belong on Unavailable.

**Writers traced:** inline saves; leave words/documents/till saves; input-window saves; reassignment and row moves; calendar moves; leave decisions/cuts; medical replacement; posting/deletion trims; Undo/Redo.

**Readers requiring separate attention:** refusal restoration, Escape restoration, Tab destination refresh, day-navigation comparison, window defaults and document-viewer identity. Fixing the saver alone does not fix these readers.

**Overlays:** input window, document viewer, leave sheets, changes/history, bell, OIL questions, confirmation cards, warning highlights, LATE/CX/pending marks, crew-rest rings, pinned bars and the phone keyboard. They must neither intercept the intended gesture nor make the edited person ambiguous.

## Scenarios, ranked by likely failure

### S01 — Repeated member remark in the specialised window
**Surface/device/role:** Leave War own approved-leave window; B; Ranger member.  
**Setup:** F. Tap Ranger’s leave.  
**Presses:** Select remark; type `Dental`; Enter. Without closing, replace with `Dental then gym`; Enter; close and reopen.  
**EXPECTED [P, W]:** Both saves reach Ranger; each saved phrase remains visible immediately. Hex remains blank with original hours.  
**Disproof:** Box snaps back to the shared remark, a second save disappears, or Hex receives either phrase. Check the visible box even if Inputs ultimately holds the correct value.

### S02 — Remark, document and till tick overwrite one another
**Surface/device/role:** Same window; B; Ranger member.  
**Setup:** F extended over three days; shared document A.  
**Presses:** Save `Dental`; add document B; untick till; replace remark with `Dental confirmed`; remove B; open A; close viewer with Escape. Repeat with document/till as the first change.  
**EXPECTED [P, W; D1150, D1159, D953]:** Ranger’s latest words, documents and tick survive unrelated saves; Hex retains his original set. Viewer identifies the intended input.  
**Disproof:** A later action restores old words/documents, copies Ranger’s changes to Hex, or the viewer opens Hex’s input.

### S03 — Escape restores the wrong man’s value
**Surface/device/role:** Board and week Unavailable; B; admin.  
**Setup:** F.  
**Presses:** Ranger start `0900`, Tab; end `1100`, Tab; Shift+Tab to end; type `1200`; Escape. Repeat cancelling a changed remark and changed start.  
**EXPECTED [P, T]:** End returns to **11:00**, start stays **09:00**, cancelled text is not saved; Hex stays 08:00–10:00.  
**Disproof:** Escape restores 10:00 from Hex, saves that restoration onto Ranger, creates a history change, or closes the Board instead of cancelling the box.

### S04 — Clearing a time leaves the next box stale
**Surface/device/role:** Board and week; B; admin.  
**Setup:** F.  
**Presses:** Ranger start `0900`, Tab; clear end, Tab; Shift+Tab through both time boxes without typing; enter start `0930`, Tab. Repeat clearing start first.  
**EXPECTED [P, T]:** Clearing makes Ranger all day: both time boxes empty. Untouched traversal saves nothing. A new start defaults the other boundary to the day’s end.  
**Disproof:** The adjacent box still shows 09:00/10:00, Tab silently re-times the leave, or Hex becomes all day.

### S05 — Original three-save failure
**Surface/device/role:** Board phone layout, Board desktop layout, desktop layout on phone, week; B; admin.  
**Setup:** F.  
**Presses:** Ranger start `0900`, Tab; end `1100`, Tab; remark `own hours`, Tab.  
**EXPECTED [P]:** Ranger 09:00–11:00 with remark; Hex 08:00–10:00 blank, after every press and reload.  
**Disproof:** Any displayed/saved disagreement, wrong-person change, missing second save, or duplicate Ranger input.

### S06 — Two men edited alternately
**Surface/device/role:** Board and week; B; admin.  
**Setup:** One shared input for Ranger, Hex and Outlaw.  
**Presses:** Ranger start `0900`; Hex end `1200`; Ranger end `1100`; Hex remark `Hex only`; Ranger remark `Ranger only`, committing each by Tab.  
**EXPECTED [P]:** Two distinct edited inputs; Outlaw retains 08:00–10:00 blank.  
**Disproof:** One person follows the other’s split, a person disappears, or an unrelated row changes.

### S07 — Refusal followed by a valid change
**Surface/device/role:** Board and week; B; admin.  
**Setup:** Ranger already split to 09:00–11:00.  
**Presses:** End `0830`, Tab; end `2570`, Tab; end `1130`, Tab; remark `valid`, Tab. Repeat invalid value as the first attempted edit of F.  
**EXPECTED [P, T]:** Refusals save nothing and restore Ranger’s current value; valid retry succeeds. **RECORD exactly what the refusal says.**  
**Disproof:** Restoration shows Hex’s time, refusal splits the input, valid retry fails, or bells/history record a refused change.

### S08 — Undo and Redo while an editor survives
**Surface/device/role:** Board/week and leave remark window; B; admin, then own-member variant.  
**Setup:** F.  
**Presses:** Save first split; use the app’s Undo; edit again. Fresh branch: split, Undo, Redo, edit again. Third branch: save end and remark, Undo each separately.  
**EXPECTED [P, U]:** Undo restores shared membership or the preceding own value; the next edit reaches the correct current input. One save is one Undo step.  
**Disproof:** Wrong-person save, duplicate split, detached editor refusing an otherwise valid edit, or Undo removing another person’s work. Record whether the surface repaints; never preserve obsolete markup artificially.

### S09 — Adjacent doors on a held row
**Surface/device/role:** Board and week; B; admin.  
**Setup:** F; split Ranger with a start change.  
**Presses:** While still in Unavailable, tap Ranger’s type label; inspect people/times before saving. Separate branch: arm Ranger’s puck and select Outlaw; repeat by drag.  
**EXPECTED [P; D755]:** The door represents the row currently labelled Ranger; any replacement affects that row’s current input.  
**Disproof:** Window opens Hex, or replacing Ranger replaces Hex. If repaint prevents a stale target, record that production result.

### S10 — Original or own input disappears
**Surface/device/role:** Surviving leave window or schedule editor; B; admin.  
**Setup:** Split Ranger; keep the editor open where normal navigation permits.  
**Presses:** Through Inputs, delete Hex’s remaining original input; return and edit Ranger. Separate branch: remove/delete Ranger’s own part; attempt another held edit.  
**EXPECTED [P]:** Existing Ranger input remains editable; when his part no longer exists, nothing saves.  
**Disproof:** Deleting Hex makes Ranger’s valid editor lose him, or a missing Ranger part redirects onto another input. If the production door closes automatically, record it and reopen normally.

### S11 — One-day, day-list and closed-day windows
**Surface/device/role:** Leave War; B; admin and own member.  
**Setup:** Fresh approved leave; add a second entry on the day to reach the day’s list. Separately use a closed day. Establish shared membership only through supported controls; record any door where this is impossible.  
**Presses:** Save two remarks; type a third and immediately press Move, Approved/Refuse, Delete, or Close in separate branches.  
**EXPECTED [W, P]:** Words accompany the intended entry; another entry/person is untouched. Unsupported actions remain unavailable.  
**Disproof:** Flush splits the leave but the following action uses the old entry, targets Hex, loses words, or falsely reports success.

### S12 — Drag selection over existing entries
**Surface/device/role:** Leave War drag window; B; admin, own-member permitted subset.  
**Setup:** One three-day leave, then separate adjacent leaves with different remarks.  
**Presses:** Drag Ranger’s dates; type `Ranger run`; close. Repeat before Move and a permitted decision. Reopen each day; then drag across two people.  
**EXPECTED [W: D1339, D1362]:** One entry pre-fills its words; differing entries show dated grey lines and an empty box. Typed words apply to the selected entries, not Hex.  
**Disproof:** Only first day changes, an unselected person changes, or a multi-person drag silently distributes one man’s words.

### S13 — Every qualifying kind
**Surface/device/role:** Board and week; B; admin.  
**Setup:** Fresh shared inputs of every kind listed in the inventory; use the real filing/move controls.  
**Presses:** For each, start `0900`, Tab; end `1100`, Tab; distinctive remark, Tab.  
**EXPECTED [P]:** Only the edited man splits and changes; kind, title, Attach destination and Unavailable filing survive.  
**Disproof:** An activity-kind exception changes everyone, loses filing, or drops the title/destination. Medical group refusal is a negative control, not a shared-medical fixture.

### S14 — Halves and runs across a week boundary
**Surface/device/role:** Board/week, Inputs and Leave War; B; admin.  
**Setup:** Shared AM, PM and all-day leave; separate multi-day run crossing Sunday/Monday.  
**Presses:** Change one person’s exact half boundary; change it away from the half; clear a time; add a remark; navigate every covered day.  
**EXPECTED [P, T, W]:** Correct half label or no half label; own times/remark apply across that input’s run; others retain their original span.  
**Disproof:** Stale AM/PM, changed first day only, duplicate days, wrong manning/charge, or another person’s dates shortened.

### S15 — Leave, return and reload
**Surface/device/role:** Board/day arrows, week navigation, Inputs; B; admin.  
**Setup:** F.  
**Presses:** Split Ranger; type end `1100` and immediately press next day; return; change page/week and return; reload; save a remark. Repeat with an invalid pending time.  
**EXPECTED [P, T]:** Valid change commits once; refusal persists nothing; refreshed rows continue from current saved values.  
**Disproof:** Duplicate change, phantom Undo step, invalid value saved by navigation, or continuation depends on an earlier in-memory split.

### S16 — Published day and four sign-offs
**Surface/device/role:** Board/week, issued viewer and pending list; B; admin.  
**Setup:** Publish F’s day with four sign-offs.  
**Presses:** Perform S05 one save at a time; inspect pending and issued views; Undo all changes; redo and publish an amendment.  
**EXPECTED [I]:** Working changes read pending; four sign-offs clear; issued values remain frozen. Returning exactly to issued state restores signatures. Amendment carries Ranger’s changes only.  
**Disproof:** Silent issued change, surviving signatures, wrong person in pending, or unrelated changes in the amendment. **RECORD exact counts**, distinguishing successive history events from net pending items.

### S17 — Availability consumers
**Surface/device/role:** Crew columns/drawers, ALL AVAIL, warnings, Leave War/day panel, SANS; B; admin.  
**Setup:** F and a seat overlapping 10:30–10:45.  
**Presses:** Extend Ranger to 11:00; pick the seat; inspect both men; attempt placement; inspect warnings, then the war’s figures and SANS need.  
**EXPECTED [P; feature-impact Flow B]:** Each consumer reads Ranger’s new interval and Hex’s unchanged interval according to its existing rules.  
**Disproof:** Ranger offered as free where the same rule warns he is absent, Hex falsely unavailable, or double-counted split. **RECORD exact existing eligibility wording.**

### S18 — Earned leave and OIL overlays
**Surface/device/role:** Board OIL Earn, question/list, tracker; B; admin.  
**Setup:** Shared weekend OD or commitment with a recorded OIL answer; publish it.  
**Presses:** Change Ranger’s hours outside OIL Earn; inspect pending/earned figures; amend; reopen OIL Earn and try typing. Repeat with unanswered OIL and its question open.  
**EXPECTED [D739 reading 4; I; OIL rules]:** Schedule-side edit keeps the answer; issued credit waits for amendment; Hex’s credit stays unchanged. OIL Earn does not permit inline edits.  
**Disproof:** Premature credit change, duplicated claim, wrong-person answer, or an overlay allowing a hidden edit.

### S19 — Whole-input controls and permissions
**Surface/device/role:** Ground Programme, Personal Inputs, Inputs window, Unavailable; B; admin, Ranger, Hex.  
**Setup:** Shared Meeting on Ground; separate shared Unavailable input.  
**Presses:** Edit Ground time/remark; repeat on Personal Inputs; as Ranger inspect own and Hex’s schedule rows and leave windows.  
**EXPECTED [R; W]:** Whole-row changes remain shared; own Unavailable edits remain personal. Member schedule controls remain read-only; own leave remarks remain available; another man’s do not become editable.  
**Disproof:** Fix splits whole-input edits or grants cross-person editing.

### S20 — History, notices and every read-only copy
**Surface/device/role:** Changes, both bells, Inputs, preview, View-only, print/export; B; admin and each member.  
**Setup:** S05 with distinct remarks.  
**Presses:** Open changes; tap each line; inspect each recipient’s bell and follow its link; inspect each read-only copy.  
**EXPECTED [P, R, I]:** Correct person, values, author and version everywhere; later Ranger-only edits produce no Hex-edit notice.  
**Disproof:** Wrong destination, stale remark, duplicate input, wrong attribution or working values leaking into issued output. First-split bell wording is already filed in the backlog: **RECORD exactly what it says**, not a new finding by itself.

### S21 — Competing change and another split writer
**Surface/device/role:** Surviving editors; B; admin/member as permitted.  
**Setup:** Fresh shared multi-day leave.  
**Presses:** Through normal controls add Ranger’s overlapping medical, or trim/remove his part; return to any surviving editor and save. Separately test another user’s intervening change when genuine shared sync is available.  
**EXPECTED [P, U]:** Never write onto Hex or resurrect removed dates. A stale editor may refuse safely. Another person’s newer work is never undone.  
**Disproof:** Wrong-person change, restored deleted span or overwritten newer work. Current two-tab browsers do not supply live shared sync: mark that branch **NOT WALKABLE**, not passed by replacing data through a developer hook.

## Explicit negatives

- **Ground Programme and Personal Inputs:** shared edits should still affect everyone; splitting these would violate D735/D739.
- **Medical groups, Upchit and SANS Availability:** no invented shared-Unavailable fixtures; medical remains relevant as a competing writer.
- **Pending/refused bids and manual OIL awards:** their own records, not shared approved inputs; check ordinary actions without assuming this resolver applies.
- **Broader Leave War editing:** already filed under D1724. Existing “change it on the Inputs page” doors are not newly missing controls caused by this fix.
- **Tracker, templates and ordinary scheduler-owned rows:** no shared-input continuation path found.
- **Old stored corruption and migration:** excluded. Every scenario creates new data.
- **Live concurrency:** deferred infrastructure is not a defect in this fix.
- **Unit coverage:** useful evidence for saver behaviour, but does not establish Escape, Tab refresh, document controls, displayed values or actual browser event order.

**Walk:** NOT RUN — scenario-design assignment only.  
**Rulings:** none this session.

