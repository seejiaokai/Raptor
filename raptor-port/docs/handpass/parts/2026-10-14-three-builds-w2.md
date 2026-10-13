# W2 — the passing notes, by the gesture that raises each (walker report, 14 Oct 26)

Walker: Sonnet 5.5. App: the frozen build at http://localhost:4173. Scripts: `scripts/handpass/tb/w2/`. Pictures: `docs/img/handpass/2026-10-14-three-builds/w2/`.
Every note below was read from `#toastEl` (`textContent`) straight after the gesture, with computed opacity at 1 (or 0.995+ — the fade-in's last frames). All words are copied from what the scripts read.

Machine traps met (for the host):
- This build has **no `window.clearToast`**. A script calling it does nothing (and the brief says it exists). I wait for the note to fade (opacity 0) instead. Before I knew this, one N12 read returned the previous note; it is re-done below.
- The note slides up about 8 px as it appears: read at once, its bottom gap is 18; after 300 ms it settles at 26. N-W is measured SETTLED (and both readings are given).
- Fixtures: all weekday publishes were done with the screen's own controls (the four sign-off selects, then "Publish day"). Nothing was published through the bridge. N3's "different man in a seat" was a real mouse drag of Warden's puck onto ROutlaw's puck (a swap) on Tuesday's board. N14's wave, N24's input, N10's rows were all made with the screen's own controls.

## Scenario table

| id | size | verdict | exact words read | picture |
|---|---|---|---|---|
| N-W | phone | PASS | Settled note on the Edit Schedule week (no board, no window): left edge 12, right edge 12 (right gap 12), width 366 on a 390 screen, text-align center, bottom gap 26 (viewport 390x844). Read at once, before it settles, the bottom gap was 18 (it slides up 8 px). Also measured on the board with two-line note: left 12, right gap 12, width 366. | `n1a-phone-published.png`, `nw-phone-week-note.png` |
| N-D | desk | PASS | Note "Wednesday published and approved": left 603.3, width 233.5, centre 720.05 vs screen centre 720 (1440 wide), bottom gap 26. Only as wide as its words. (A two-line note on the desktop is 720 wide with its text left-aligned, see Seen in passing.) | `n1a-desk-published.png` |
| N1a | phone | PASS | `Wednesday published and approved` (no OIL sentence follows) | `n1a-phone-published.png` |
| N1a | desk | PASS | `Wednesday published and approved` | `n1a-desk-published.png` |
| N1b | phone | NOT AS EXPECTED, CONDITIONAL (host to judge) | Published Saturday 18 Jul with the four sign-off names and "Publish day". The note read exactly: `Saturday published and approved`. It carried NO OIL line, and no date. The brief's expected is conditional ("if the note carries the OIL line"); it did not. Saturday's Common Programme in this build reads "WEEKEND - NO FLYING / DUTY CREW ON CALL" (text rows, no times), as the brief says. | `n1b-phone-saturday-published.png` |
| N2 | phone | PASS | `Wednesday unpublished. It is a draft again, and publishing reissues the Original.` (one press, no second tap asked) | `n2-phone-unpublished.png` |
| N2 | desk | PASS | `Wednesday unpublished. It is a draft again, and publishing reissues the Original.` | `n2-desk-unpublished.png` |
| N4 | phone | NOT WALKED | Unpublish did not ask for a second tap on either day I unpublished (Wednesday, and Saturday which carries OIL): both gave N2's sentence at once (Saturday: `Saturday unpublished. It is a draft again, and publishing reissues the Original.`). The scenario is "only if Unpublish asks"; its condition (OIL credits already spent on the Leave War) was not made, and I did not make it through a bridge. | `n4-phone-saturday-unpublish.png` |
| N3 | desk | PASS | After the swap I signed again (the sign-off had cleared) and pressed "Publish AL1": receipt/note `Published AL1 · 2 items on Tue only · approved by Anvil` (shape as expected). After "Unpublish": `Tuesday: AL1 withdrawn. Its changes are back on the working copy as pending, and Original is the issued schedule. Publishing reissues AL1.` | `n3-desk-after-al1.png`, `n3-desk-after-unpublish.png` |
| N9 | phone | PASS | `OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning` (Saturday board; on a phone the button is the day card's "OIL Earn") | `n9-phone-oil-earn-on.png` |
| N9 | desk | PASS | same words (button `#sbOil`, "OIL Earn") | `n9-desk-oil-earn-on.png` |
| N11 off | phone | PASS | `Nothing on this day earns OIL, including anything added later` (the day's own "Nothing today earns" switch) | `n11-phone-day-off.png` |
| N11 on | phone | PASS | `This day can earn OIL again, and the marks underneath are back` | `n11-phone-day-on.png` |
| N12 | phone | FAIL | Day switched off; I tapped Fable's puck in Duties (tap, touchscreen tap and click all tried). NO note appeared at all (last text on the element was the previous note, opacity 0). The puck's seat is drawn inert with the title "Fable — nothing on this day earns, so this cannot be changed here". For the record, tapping the ITEM (the SDO name, `data-oilitem`) with the day off raised: `Nothing on this day earns — turn that off first` (an em dash, lower case, no full stops — not the expected `Nothing on this day earns. Turn that off first.`). | `n12-phone-puck-with-day-off.png`, `n12-phone-item-with-day-off.png` |
| N-L | desk | PASS | Made one change outside OIL Earn first (a "+ Note" line) so Undo was live; with OIL Earn on and nothing changed in it, pressed Undo: `Left OIL Earn without undoing. The next undo would change the day itself.` OIL Earn was off afterwards. (With an empty history Undo is disabled and cannot be pressed at all.) | `nl-desk-undo-leaves-oil-earn.png` |
| N10 on | phone | PASS | `This item is info only: no longer checked against the rules, and earns nobody any OIL` (Tuesday, Ground Programme row 1, its ⓘ) | `n10-phone-info-on.png` |
| N10 off | phone | PASS | `This item is checked against the rules again and can earn OIL` | `n10-phone-info-off.png` |
| N10 on | desk | PASS | same as phone | `n10-desk-info-on.png` |
| N10 off | desk | PASS | same as phone | `n10-desk-info-off.png` |
| N-R | phone | PASS | `Red box: flagged for the next scheduler` (same row's ■) | `nr-phone-red-box.png` |
| N14 add | desk | PASS | `SC added: standalone, SPARE is checked for availability, SC currency, front seat and overlapping SC seats or the SC desk only` (begins as expected) | `n14-desk-sc-added.png` |
| N14 press 1 | desk | PASS | (MAIN → SPARE) `Line is SPARE now: standing by, checked for availability and currency only` | `n14-desk-badge-press-1.png` |
| N14 press 2 | desk | PASS | (SPARE → MAIN) `Line is MAIN now: fully cross-checked` | `n14-desk-badge-press-2.png` |
| N15 | desk | PASS | `Warning hidden: no flag, not counted. It returns if the warning changes.` (the ✕ on the first row of the day's issues list) | `n15-desk-warning-hidden.png` |
| N19 | desk | PASS | Typed 0800 in the brief of 1st wave line 1 (take-off 08:40), then set the take-off to 0730: `The 08:00 brief was after the new take-off, so it was removed` (brief box empty afterwards) | `n19-desk-brief-removed.png` |
| N-T | desk | PASS | Typed 2590 in the board's start-time box of the first common-programme item and pressed Enter: `2590 is not a time. Try 0900 or 09:00.` (box went back to 0545) | `nt-desk-not-a-time.png` |
| N17 | phone | PASS | (⋯ then "🖥 Desktop layout") `Desktop layout: pan sideways to read the whole day` | `n17-phone-desktop-layout.png` |
| N29 | desk | PASS | Quals page → Enable editing → "Edit quals" (the ✕ on a column heading only appears in that mode), removed TF: `TF removed from the LoX. Nobody's record changed. Add it back and the ticks return.` (straight apostrophe) | `n29-desk-column-removed.png` |
| N33 | phone | PASS | Tapped "Add qualifications": page went to Admin; note read at 50, 300, 700 and 1500 ms: none | `n33-phone-admin-opened.png` |
| N33 | desk | PASS | same: Admin opened; no note at 50, 300, 700, 1500 ms | `n33-desk-admin-opened.png` |
| N24 | desk | FAIL (the expected sentence never appeared; the app did not refuse as described) | Event input for ALL AVAIL on Tue 14 Jul filed with "+ Input" (no OIL question on a weekday). On Tuesday's board it stands as a Ground Programme row (SQUADRON PHOTO, an ALL AVAIL puck with count 34). (a) Dragging a man (Ranger) from the roster onto that row: allowed, note `Ranger added to Squadron photo`. (b) After (a), dragging the ALL AVAIL puck off onto another ground row: allowed, note `ALL AVAIL taken out of Squadron photo`. (c) On a FRESH ALL AVAIL input (no man added), dragging the ALL AVAIL puck off: refused with `ALL AVAIL is the last on this input. Take the input off the programme, or delete it in its own window.` I did not see `An ALL AVAIL input can only be changed in its own window. Open it to change who it is for.` on any of the three. | `n24-desk-drop-a-man-on-the-row.png`, `n24-desk-drag-all-avail-off-the-row.png`, `n24-desk-drag-all-avail-off-the-row-fresh.png` |
| N-TOP | phone | PASS | Inputs calendar → Sat 18 Jul day window up → "+ Input" (Training, Range brief, one man) → OIL question → Yes → Save: note `Input added`. Settled: top edge 10 px from the top of the screen, left 12, right gap 12, width 366, height 38, bottom gap 796. While the window is up (`win-inputsday`). (First read, mid-slide, top 2.) | `ntop-phone-note-with-window-up.png` |

## Counts

Scenario rows: 32 (every id, split by size / press where the brief says both). PASS 28, FAIL 2 (N12, N24), NOT WALKED 1 (N4), 1 conditional for the host (N1b: no OIL line on Saturday's publish note).

## Seen in passing

- On a phone, the note at the top (N-TOP) lies over the window's head: the window's title and its ✕ are under the note while it shows (about 3 seconds). `ntop-phone-note-with-window-up.png`.
- On the desktop a two-line note (for example the AL1 withdrawn note, 720 px wide) has its text left-aligned (computed text-align `start`), while the phone's is centred. `n3-desk-after-unpublish.png`.
- `window.clearToast` named in the brief does not exist in this build (typeof undefined).
- On Saturday (non-working day, no OIL line in the publish note, see N1b) the Saturday board's header showed "4 to sign" in the top part after publishing in the picture: that picture was taken before the sign-off row redrew; head state read afterwards was ORIG. `n1b-phone-saturday-published.png`.
- The old wording with an em dash and no full stops is still live on the OIL Earn item tap with the day off: `Nothing on this day earns — turn that off first` (see N12).
- Quals: the page's "Add qualifications" link goes to Admin, and the column ✕ is in "Edit quals" inside "Enable editing" (not in "Enable editing" alone).
- Pictures not cited by a row but made while finding controls (`explore-*`, `dbg-*`) are scratch.
