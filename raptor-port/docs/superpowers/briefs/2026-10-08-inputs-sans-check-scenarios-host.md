# The host's additions to Astra's scenarios — the Inputs / SANS calendar check — 8 Oct 26

Astra's ninety scenarios (`2026-10-08-inputs-sans-check-scenarios-astra.md`) were set against the roll-call in the
evidence sheet (`raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §3). These are the rows they do
not reach, and two arrangements several of Astra's scenarios ask the host for. Same shape: SETUP, ACTION, EXPECTED,
and what would DISPROVE it. Every one is judged PASS or FAIL.

## Two arrangements Astra's scenarios call for

**A controlled clock** (P6-11, P6-12, P4-10's late entry, any "filed on <date>" line). Install Playwright's clock on
the browser context BEFORE the page loads — `await context.clock.install({ time: new Date('2026-06-29T10:00:00') })` —
then file through the visible form; move it with `await page.clock.setFixedTime(...)` or `page.clock.fastForward(...)`.
The app reads the browser's own date. If the clock API is refused by this Playwright, say NOT WALKED and why — never
back-date a record through the bridge and call the form tested.

**A second person in the same world, keeping the first one's Undo steps** (X-10, P6-05, X-08, P5-02 to P5-04 where
"another person" changes the record). A sign-in or sign-out clears the Undo steps (D148). To act as person B without
losing A's, stay signed in and swap identity in place: `await page.evaluate(() => { window.raptorMe('<B person id>');
window.raptorRole('member') })`, do B's act through the visible controls, then swap back
(`window.raptorMe('<A id>'); window.raptorRole('admin' | 'member')`; on the Leave War also `window.lwSetRole(...)`).
Person ids are the keys of `window.PEOPLE` (read `cs` for the callsign). Say in the row that the swap was used.

## The added scenarios

**H-01. A holiday's short form is the same tag on all three months and the Leave War.** (roll-call A1, A3, A5, A7; the
plan §3.12 — "the calendars' date tag is the short form in the kind's colour")
SETUP: as Saber, "Calendar" → Holidays → add a public holiday on Wed 5 Aug 26, Name "National Day", On grid "ND".
ACTION: read the tag on 5 Aug on the SANS month, the Inputs month, the "Calendar" window's own Month, and the Leave
War's Event row and column tint; open the date on each calendar. Repeat with an Off day named "Stand Down", On grid "SD".
EXPECTED: the same short form ("ND"; "SD") in the kind's colour on all three months and on the Leave War's row; the
full name where a day is opened and in the Holidays list.
DISPROVES: one month prints a different word for the same day (for instance a fixed "PH" or "OFF").

**H-02. Each window is in FRONT of everything it can open over.** (roll-call W1–W10; the order's §6)
SETUP: for each window — "Calendar" (from the Leave War's ⚙ with the grid drawn, and again with the Leave War's OIL
tracker open; from each calendar's gear; from the SANS day's "Calendar…"), "Every <weekday>", the holiday form, the
SANS day, the SANS settings (from the gear AND from the Logic page's row), the Inputs day, the Inputs settings (from the
gear AND from each Logic row), the input editor on the Inputs page (over the month, over the List, over an opened day),
the Required panel, the people's-days panel, the typing box and the phone's number pad, the working box.
ACTION: at phone and desktop size, read `document.elementFromPoint` at the window's centre and at each of its buttons'
centres.
EXPECTED: the element found is the window or inside it, every time; on a phone the Leave War's new-period sheet, opened
from the Holidays list, is in front of "Calendar".
DISPROVES: a window opens behind a full-screen surface, a bar or another window that it was opened from.

**H-03. The word "Days" is nowhere on screen.** (D675)
SETUP: as Saber. ACTION: open the Leave War's ⚙, both calendars' gears, the SANS day (the admin's button), the window
itself, its two parts, "How this works" on both calendars, and the Logic page's rows.
EXPECTED: the window's title and every line that opens it read "Calendar" / "Calendar…".
DISPROVES: any visible "Days" / "Days…" naming that window (a weekday name, or "14 days" in a cut-off, is not it).

**H-04. A fresh Leave War has no counters, and the buttons read as ruled.** (D669, D673, D676, D677)
SETUP: a fresh world, as Saber, Leave War. ACTION: read the Manning block; press "+ Counter", make one, open its
window; enter Rearrange.
EXPECTED: the block shows the four fixed rows and no counter until one is made; in the counter's window "Delete
counter" is red and "Save counter" is the app's filled save button — three buttons that do not look alike; in
Rearrange the counter's cross is red, the four fixed rows carry no grip and no cross.
DISPROVES: seeded counters; a grey Delete; a cross or a grip on a fixed row.

**H-05. Medical is a tab, in the page, and otherwise as it was.** (roll-call F4)
SETUP: as Saber, then as Ranger; phone and desktop. ACTION: Inputs → Medical tab; open a card, its document, the
upload door; go back to the Inputs tab and to SANS by the tabs.
EXPECTED: the three tabs stay visible above Medical (it does not cover the screen); no close cross; cards, the
episode view, the document viewer and who may see and file what are as before; each card and each document page
carries the small "Placed by …" line of its own input.
DISPROVES: the tabs are hidden under Medical; a card loses an action it had; the placed-by line is another input's.

**H-06. SANS availability an admin files for several people.** (roll-call G6; D658)
SETUP: as Saber, SANS tab, a July weekday → "+ Commitment" → "Several people" → three SANS people, Fly and OFT.
ACTION: save; read the date's F and O counts and the opened day; open the changes window; then delete it for one man
only, and then for all.
EXPECTED: F and O each rise by the people in their seats, each man counted once; the day lists each man as his own
puck line with "Placed by Saber for <him>"; the changes window shows ONE item with three names; a delete says whom it
is for and asks first.
DISPROVES: one man counted for all three; three separate items in the changes window; a delete that takes more men
than it named.

**H-07. The editor's foot, and a bar's tooltip, say who placed it.** (roll-call D3, D5)
SETUP: as Saber, file a duty for Ranger from "+ Input"; as Ranger, change its remarks.
ACTION: open "+ Input" again (a NEW input); open the saved one; on a desktop hover its bar.
EXPECTED: a new input's window has no placed-by line; the saved one's foot reads "Placed by Saber for Ranger · <date,
time>" and, after Ranger's change, the change beside it; the bar's tooltip carries the same line.
DISPROVES: a line on a new input; a missing or different line on the saved one; a tooltip with none.

**H-08. A member who is not SANS, and the admin's member view, on the SANS tab and the gears.** (roll-call H6, H7)
SETUP: as Ranger (a member, not SANS); then as Saber switched to the member view (tap the name badge).
ACTION: open the SANS tab, a date, look for "+ Commitment", the gear, "Calendar…"; open the Inputs tab's tools; go to
the Leave War and tap a Required cell and an Available row's name; go to the Logic page's three rows.
EXPECTED: the month and the opened day read; no door files a SANS commitment for him or for anyone; no gear, no
"Calendar…", no typing in a Required cell, no counter window; the Logic rows show the values with no button. The
member view has exactly a member's doors — nothing of the admin's left behind.
DISPROVES: any admin door drawn or working for either.

**H-09. The three tabs, and arriving on the page.** (D620, D626, D664)
SETUP: phone 390×844, 390×568 and desktop; as Saber and as Ranger. ACTION: go to Inputs from another page; step
Inputs → SANS → Medical → Inputs; on the Inputs tab switch Calendar ↔ List and back; reload on each tab.
EXPECTED: the page arrives at its top; the tabs are one row, less tall than the tools row under them, the picked one
marked; the Inputs tab has Calendar | List and the filters, the SANS tab has neither; a reload comes back on the
Inputs page; on a phone neither month is a short box scrolled inside the page, and no page scrolls sideways.
DISPROVES: a tab row that wraps; a List or filters on the SANS tab; a sideways scroll; a month in a box with its own
scrollbar.

**H-10. A filtered month counts only what it shows.** (roll-call F1)
SETUP: as Saber, July 2026 on the Inputs month, a day with more inputs than lines. ACTION: read "+N more"; set the
person filter to one man, then a type filter; open the day.
EXPECTED: the bars, the "+N more" figure and the opened day's list each show the filtered inputs and agree with one
another; clearing the filter brings the rest back.
DISPROVES: a "+N more" that counts hidden inputs; a day list that ignores the filter while the month obeys it.
