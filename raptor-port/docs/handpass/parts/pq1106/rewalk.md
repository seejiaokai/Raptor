# Walk of People and Quals, 6 Nov 26 (branch claude/people-quals-1106) - walker's table

Script: scripts/handpass/pq1106-walk.mjs (v1). Pictures: docs/img/handpass/2026-11-06-people-quals/walk/. Build: index-DCgRKoZY.js.

Counts: 39 PASS, 0 FAIL, 9 NOT WALKED, of 48 steps.

| step | engine / size | result | what was seen | picture |
|---|---|---|---|---|
| W5a.1 Quals: Edit, tick one man's qualification, Done - the tick is there | Desktop (Chromium 1536x864) | PASS | cell dj\|san: before "\|qcell", after tick "✓\|qcell", after Done "✓\|qcell" | W5a-D-1-ticked.png |
| W5a.2 scroll away, Undo - row comes back into view outlined, tick gone; Redo | Desktop (Chromium 1536x864) | PASS | row was out of view true ({"top":-197,"bottom":-171,"vh":864,"sy":414}); after Undo cell "\|qcell" (original "\|qcell"), outlined true, row 217-243 of 864; after Redo "✓\|qcell" (ticked was "✓\|qcell") | W5a-D-2-undo.png |
| W5b.1 Admin > Users: Suspend a man's account, then Enable it | Desktop (Chromium 1536x864) | PASS | man rocky: button read "Suspend" then "Enable" | W5b-D-1-users-enable.png |
| W5b.2 Quals: "<name> is back" with "Check his quals" - his row outlined | Desktop (Chromium 1536x864) | PASS | line "Hex is back — quals and CAT as he left them. Check his quals Later"; his row present true, outlined true; seat view qViewW | W5b-D-3-checked.png |
| W5b.3 "Later" on another prompt | Desktop (Chromium 1536x864) | NOT WALKED | only one man was enabled, no second prompt to press Later on |  |
| W5c.1 Leave War gear > Calendar... > Holidays: year steps with the arrows | Desktop (Chromium 1536x864) | PASS | year 2026 > 2027 > 2025 > 2026 | W5c-D-1-holidays.png |
| W5c.2 + Add: pick a day, name it, Save - it shows in the list | Desktop (Chromium 1536x864) | PASS | picked 2026-11-15; "Walk Day" in the list true | W5c-D-2-saved.png |
| W5c.3 open the holiday again and close it by its X | Desktop (Chromium 1536x864) | PASS | X ("Close Change a holiday") pressed; window gone true |  |
| W5c.4 close it by Escape (desktop) | Desktop (Chromium 1536x864) | PASS | window gone true |  |
| W5c.5 the holiday shows on its date on the Inputs page and on the Leave War grid | Desktop (Chromium 1536x864) | PASS | date 2026-11-15; short mark WD (the name's short form) drawn on the Inputs page true; on the Leave War grid true (pages open on today's month / the bidding window, the date may be off screen) | W5c-D-5-inputs.png W5c-D-5-leavewar.png |
| W5d.1 Inputs > List > + Input > Several people: All on Pilots, a puck off, a puck on | Desktop (Chromium 1536x864) | PASS | group "All": start {"on":1,"total":28}; after All {"on":28,"total":28}; puck off {"on":27,"total":28}; puck on {"on":28,"total":28} | W5d-D-1-several.png |
| W5d.2 drag a finger across pucks (Phone A) | Desktop (Chromium 1536x864) | NOT WALKED | Chromium phone only (WebKit touches drive no pointer events) |  |
| W5d.3 Cancel closes the input window, and so does X | Desktop (Chromium 1536x864) | PASS | Cancel closed it true; X closed it true |  |
| W5e.1 sign out and in again: caret in the username box at once | Desktop (Chromium 1536x864) | PASS | active element "luser"; typed "ad" with no tap, the box reads "ad" | W5e-D-1-signin.png |
| W5e.2 a click on the word "Password" puts the caret in the password box (desktop) | Desktop (Chromium 1536x864) | PASS | active element "lpass" |  |
| W5e.3 a wrong password says "Incorrect username or password." | Desktop (Chromium 1536x864) | PASS | message shown true; then signed in again with the right password | W5e-D-3-wrong.png |
| W5a.1 Quals: Edit, tick one man's qualification, Done - the tick is there | Phone A (Chromium 402x874) | PASS | cell dj\|san: before "\|qcell", after tick "✓\|qcell", after Done "✓\|qcell" | W5a-A-1-tap-quick.png |
| W5a.2 scroll away, Undo - row comes back into view outlined, tick gone; Redo | Phone A (Chromium 402x874) | PASS | row was out of view true ({"top":-187,"bottom":-161,"vh":874,"sy":434}); after Undo cell "\|qcell" (original "\|qcell"), outlined true, row 247-273 of 874; after Redo "✓\|qcell" (ticked was "✓\|qcell") | W5a-A-2-undo-quick.png |
| W5b.1 Admin > Users: Suspend a man's account, then Enable it | Phone A (Chromium 402x874) | PASS | man rocky: button read "Suspend" then "Enable" | W5b-A-1-users-enable.png |
| W5b.2 Quals: "<name> is back" with "Check his quals" - his row outlined | Phone A (Chromium 402x874) | PASS | line "Hex is back — quals and CAT as he left them. Check his quals Later"; his row present true, outlined true; seat view qViewW | W5b-A-3-checked.png |
| W5b.3 "Later" on another prompt | Phone A (Chromium 402x874) | NOT WALKED | only one man was enabled, no second prompt to press Later on |  |
| W5c.1 Leave War gear > Calendar... > Holidays: year steps with the arrows | Phone A (Chromium 402x874) | PASS | year 2026 > 2027 > 2025 > 2026 | W5c-A-1-holidays.png |
| W5c.2 + Add: pick a day, name it, Save - it shows in the list | Phone A (Chromium 402x874) | PASS | picked 2026-11-15; "Walk Day" in the list true | W5c-A-2-saved.png |
| W5c.3 open the holiday again and close it by its X | Phone A (Chromium 402x874) | PASS | X ("Close Change a holiday") pressed; window gone true |  |
| W5c.4 close it by Escape (desktop) | Phone A (Chromium 402x874) | NOT WALKED | desktop only |  |
| W5c.5 the holiday shows on its date on the Inputs page and on the Leave War grid | Phone A (Chromium 402x874) | PASS | date 2026-11-15; short mark WD (the name's short form) drawn on the Inputs page true; on the Leave War grid true (pages open on today's month / the bidding window, the date may be off screen) | W5c-A-5-inputs.png W5c-A-5-leavewar.png |
| W5d.1 Inputs > List > + Input > Several people: All on Pilots, a puck off, a puck on | Phone A (Chromium 402x874) | PASS | group "All": start {"on":1,"total":28}; after All {"on":28,"total":28}; puck off {"on":27,"total":28}; puck on {"on":28,"total":28} | W5d-A-1-several.png |
| W5d.2 drag a finger across pucks (Phone A) | Phone A (Chromium 402x874) | PASS | 4 pucks in a row true; states before 1111, after the finger crossed all four 0000 | W5d-A-2-finger-across.png |
| W5d.3 Cancel closes the input window, and so does X | Phone A (Chromium 402x874) | PASS | Cancel closed it true; X closed it true |  |
| W5e.1 sign out and in again: caret in the username box at once | Phone A (Chromium 402x874) | PASS | active element "luser"; typed "ad" with no tap, the box reads "ad" | W5e-A-1-signin.png |
| W5e.2 a click on the word "Password" puts the caret in the password box (desktop) | Phone A (Chromium 402x874) | NOT WALKED | desktop only |  |
| W5e.3 a wrong password says "Incorrect username or password." | Phone A (Chromium 402x874) | PASS | message shown true; then signed in again with the right password | W5e-A-3-wrong.png |
| W5a.1 Quals: Edit, tick one man's qualification, Done - the tick is there | Phone B (WebKit 402x874) | PASS | cell dj\|san: before "\|qcell", after tick "✓\|qcell", after Done "✓\|qcell" | W5a-B-1-tap-quick.png |
| W5a.2 scroll away, Undo - row comes back into view outlined, tick gone; Redo | Phone B (WebKit 402x874) | PASS | row was out of view true ({"top":-221,"bottom":-193,"vh":874,"sy":467}); after Undo cell "\|qcell" (original "\|qcell"), outlined true, row 246-274 of 874; after Redo "✓\|qcell" (ticked was "✓\|qcell") | W5a-B-2-undo-quick.png |
| W5b.1 Admin > Users: Suspend a man's account, then Enable it | Phone B (WebKit 402x874) | PASS | man rocky: button read "Suspend" then "Enable" | W5b-B-1-users-enable.png |
| W5b.2 Quals: "<name> is back" with "Check his quals" - his row outlined | Phone B (WebKit 402x874) | PASS | line "Hex is back — quals and CAT as he left them. Check his quals Later"; his row present true, outlined true; seat view qViewW | W5b-B-3-checked.png |
| W5b.3 "Later" on another prompt | Phone B (WebKit 402x874) | NOT WALKED | only one man was enabled, no second prompt to press Later on |  |
| W5c.1 Leave War gear > Calendar... > Holidays: year steps with the arrows | Phone B (WebKit 402x874) | PASS | year 2026 > 2027 > 2025 > 2026 | W5c-B-1-holidays.png |
| W5c.2 + Add: pick a day, name it, Save - it shows in the list | Phone B (WebKit 402x874) | PASS | picked 2026-11-15; "Walk Day" in the list true | W5c-B-2-saved.png |
| W5c.3 open the holiday again and close it by its X | Phone B (WebKit 402x874) | PASS | X ("Close Change a holiday") pressed; window gone true |  |
| W5c.4 close it by Escape (desktop) | Phone B (WebKit 402x874) | NOT WALKED | desktop only |  |
| W5c.5 the holiday shows on its date on the Inputs page and on the Leave War grid | Phone B (WebKit 402x874) | PASS | date 2026-11-15; short mark WD (the name's short form) drawn on the Inputs page true; on the Leave War grid true (pages open on today's month / the bidding window, the date may be off screen) | W5c-B-5-inputs.png W5c-B-5-leavewar.png |
| W5d.1 Inputs > List > + Input > Several people: All on Pilots, a puck off, a puck on | Phone B (WebKit 402x874) | PASS | group "All": start {"on":1,"total":28}; after All {"on":28,"total":28}; puck off {"on":27,"total":28}; puck on {"on":28,"total":28} | W5d-B-1-several.png |
| W5d.2 drag a finger across pucks (Phone A) | Phone B (WebKit 402x874) | NOT WALKED | Chromium phone only (WebKit touches drive no pointer events) |  |
| W5d.3 Cancel closes the input window, and so does X | Phone B (WebKit 402x874) | PASS | Cancel closed it true; X closed it true |  |
| W5e.1 sign out and in again: caret in the username box at once | Phone B (WebKit 402x874) | PASS | active element "luser"; typed "ad" with no tap, the box reads "ad" | W5e-B-1-signin.png |
| W5e.2 a click on the word "Password" puts the caret in the password box (desktop) | Phone B (WebKit 402x874) | NOT WALKED | desktop only |  |
| W5e.3 a wrong password says "Incorrect username or password." | Phone B (WebKit 402x874) | PASS | message shown true; then signed in again with the right password | W5e-B-3-wrong.png |

## Page errors and console errors

None seen in any run.

## Odd things beyond the steps

- (none recorded by the script)
