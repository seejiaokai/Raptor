# Walk of People and Quals, 6 Nov 26 (branch claude/people-quals-1106) - walker's table

Script: scripts/handpass/pq1106-walk.mjs (v1). Pictures: docs/img/handpass/2026-11-06-people-quals/walk/. Build: index-6vy42WDA.js.

Counts: 68 PASS, 0 FAIL, 9 NOT WALKED, of 77 steps.

| step | engine / size | result | what was seen | picture |
|---|---|---|---|---|
| W1.0 Edit quals open, headings 2-4 in sight | Phone A (Chromium 402x874) | PASS | columns san sxo mgmt sched scDay; heading boxes l-r 152-222 \| 222-324 \| 324-440 of 402 | W1-0-edit-quals.png |
| W1.1 finger drag heading 2 on its words to heading 3 (slow) | Phone A (Chromium 402x874) | PASS | press hit SPAN.qlbl; lit mid-drag ["mgmt"] (want ["mgmt"]); order san sxo mgmt sched -> san mgmt sxo sched; heading-vs-cell left/right san:0/0 mgmt:0/0 sxo:0/0 sched:0/0 | W1-1-after.png |
| W1.2 Undo (top bar) after the move puts the order back | Phone A (Chromium 402x874) | PASS | before undo san mgmt sxo sched; after undo san sxo mgmt sched; original san sxo mgmt sched | W1-2-after-undo.png |
| W1.3 the same drag QUICK (6 moves, 10 ms apart) | Phone A (Chromium 402x874) | PASS | lit ["mgmt"]; san sxo mgmt sched -> san mgmt sxo sched; align san:0/0 mgmt:0/0 sxo:0/0 sched:0/0 |  |
| W1.4 drag RIGHT TO LEFT (heading 4 onto heading 3) | Phone A (Chromium 402x874) | PASS | press hit SPAN.qlbl; lit ["sxo"]; san mgmt sxo sched -> san mgmt sched sxo; align san:0/0 mgmt:0/0 sched:0/0 sxo:0/0 |  |
| W1.5 drag carried to the right edge and held, then lift on a heading | Phone A (Chromium 402x874) | PASS | scrollLeft 330 -> 1079 while held; lifted on heading 10; order san mgmt sched sxo scDay scNight -> san sched sxo scDay scNight daar; align san:0/0 sched:0/0 sxo:0/0 scDay:0/0 | W1-5-edge-after.png |
| W1.6 press on the heading padding (not its words) and slide | Phone A (Chromium 402x874) | PASS | press hit TH.qcol apt; lit ["sxo"]; san sched sxo scDay -> san sxo sched scDay; align san:0/0 sxo:0/0 sched:0/0 scDay:0/0 (the brief gave no expected line: judged as the words drag) |  |
| W1.7 a press on a heading's X arms "remove?" and starts no drag | Phone A (Chromium 402x874) | PASS | armed {"col":"sxo","txt":"remove?"}; lit while pressed []; order unchanged true | W1-7-x-armed.png |
| W2.1 mouse drag of heading 2 onto heading 3 in Edit quals | Desktop (Chromium 1536x864) | PASS | lit ["mgmt"]; san sxo mgmt sched -> san mgmt sxo sched; align san:0/0 mgmt:0/0 sxo:0/0 sched:0/0 scDay:0/0; mid pic W2-1-mid-drag.png | W2-1-after.png |
| W2.2 plain click on a heading in normal mode still sorts | Desktop (Chromium 1536x864) | PASS | heading initials; names before Ace,Anvil,Blade,Bolt,Cinch,Cobra,Comet,Diesel; after Ace,Anvil,Blade,Bolt,Cinch,Cobra,Comet,Diesel; heading mark before "insort\|INITIALS" after "insort on\|INITIALS▲" | W2-2-sorted.png |
| W3.sda.0 pinned heading row up (scroll-driven path: true) | Phone A (Chromium 402x874) | PASS | pinned rows 1; q-sda class on the table true |  |
| W3.sda.1 pinch IN 90 to 250, read with fingers down | Phone A (Chromium 402x874) | PASS | wrapL 20; pinned row shown true; frozen name heading [21,266.9]; own null; table's own name heading [21,266.9]; names 16, off-edge []; table transformed true; after lift pinned vs real lefts [241,382,500,622,729] vs [241,382,500,622,729] | W3-sda-1-mid-pinch-in.png |
| W3.sda.2 pinch OUT then IN at once (lesson 20) | Phone A (Chromium 402x874) | PASS | out: wrapL 20; pinned row shown false; frozen name heading null; own null; table's own name heading [20,105.5]; names 34, off-edge []; table transformed true \|\| in: wrapL 20; pinned row shown false; frozen name heading null; own null; table's own name heading [20,258.3]; names 16, off-edge []; table transformed true; after lift [-82,53,166,283,385] vs [-82,53,166,283,385] | W3-sda-2-mid-pinch-out.png |
| W3.sda.3 after the lift the pinned headings stand over their columns | Phone A (Chromium 402x874) | PASS | real lefts [285,420,533,650,752]; pinned [285,420,533,650,752] | W3-sda-3-after.png |
| W3.nosda.0 pinned heading row up (scroll-driven path: false) | Phone A (Chromium 402x874) | PASS | pinned rows 1; q-sda class on the table false |  |
| W3.nosda.1 pinch IN 90 to 250, read with fingers down | Phone A (Chromium 402x874) | PASS | wrapL 20; pinned row shown true; frozen name heading [21,266.9]; own null; table's own name heading [21,266.9]; names 16, off-edge []; table transformed true; after lift pinned vs real lefts [241,382,500,622,729] vs [241,382,500,622,729] | W3-nosda-1-mid-pinch-in.png |
| W3.nosda.2 pinch OUT then IN at once (lesson 20) | Phone A (Chromium 402x874) | PASS | out: wrapL 20; pinned row shown false; frozen name heading null; own null; table's own name heading [20,105.5]; names 34, off-edge []; table transformed true \|\| in: wrapL 20; pinned row shown false; frozen name heading null; own null; table's own name heading [20,258.3]; names 16, off-edge []; table transformed true; after lift [-82,53,166,283,385] vs [-82,53,166,283,385] | W3-nosda-2-mid-pinch-out.png |
| W3.nosda.3 after the lift the pinned headings stand over their columns | Phone A (Chromium 402x874) | PASS | real lefts [285,420,533,650,752]; pinned [285,420,533,650,752] | W3-nosda-3-after.png |
| W4.A.1 unscrolled: the table's thin left line is there (zoom 0.900) | Phone A (Chromium 402x874) | PASS | first device column rgb [42,49,58] vs 4th column [11,13,16] (differ by 42); bright pixels 0; wrapL 20 | W4-A-sl0.png |
| W4.A.2 scrolled sideways to 40: no sliver at the name column's left edge (zoom 0.900) | Phone A (Chromium 402x874) | PASS | scrollLeft 40; bright pixels in the first 3 device columns {"60":0,"61":0,"62":0} | W4-A-sl40.png |
| W4.A.2 scrolled sideways to 150: no sliver at the name column's left edge (zoom 0.900) | Phone A (Chromium 402x874) | PASS | scrollLeft 150; bright pixels in the first 3 device columns {"60":0,"61":0,"62":0} | W4-A-sl150.png |
| W4.A.2 scrolled sideways to 261: no sliver at the name column's left edge (zoom 0.900) | Phone A (Chromium 402x874) | PASS | scrollLeft 261; bright pixels in the first 3 device columns {"60":0,"61":0,"62":0} | W4-A-sl261.png |
| W4.B.0 zoom is 1 on Phone B (nothing set by hand) | Phone B (WebKit 402x874) | PASS | --qz 1 |  |
| W4.B.1 unscrolled: the table's thin left line is there (zoom 1.000) | Phone B (WebKit 402x874) | PASS | first device column rgb [42,49,58] vs 4th column [11,13,16] (differ by 42); bright pixels 0; wrapL 20 | W4-B-sl0.png |
| W4.B.2 scrolled sideways to 40: no sliver at the name column's left edge (zoom 1.000) | Phone B (WebKit 402x874) | PASS | scrollLeft 40; bright pixels in the first 3 device columns {"60":0,"61":0,"62":0} | W4-B-sl40.png |
| W4.B.2 scrolled sideways to 150: no sliver at the name column's left edge (zoom 1.000) | Phone B (WebKit 402x874) | PASS | scrollLeft 150; bright pixels in the first 3 device columns {"60":0,"61":0,"62":0} | W4-B-sl150.png |
| W4.B.2 scrolled sideways to 261: no sliver at the name column's left edge (zoom 1.000) | Phone B (WebKit 402x874) | PASS | scrollLeft 261; bright pixels in the first 3 device columns {"60":0,"61":0,"62":0} | W4-B-sl261.png |
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
| W6 member: Quals > Edit ticks only his own row; no "Edit quals" button | Phone B (WebKit 402x874) | PASS | his own bane\|san "\|qcell" -> "✓\|qcell"; another man's dj\|san "\|qcell" -> "\|qcell"; visible Edit-quals buttons 0 | W6-B-member.png |
| W6 member: Quals > Edit ticks only his own row; no "Edit quals" button | Desktop (Chromium 1536x864) | PASS | his own bane\|san "\|qcell" -> "✓\|qcell"; another man's dj\|san "\|qcell" -> "\|qcell"; visible Edit-quals buttons 0 | W6-D-member.png |

## Page errors and console errors

None seen in any run.

## Odd things beyond the steps

- (none recorded by the script)
- W3 "pinch out then in at once": after the pinch OUT the whole table fits, the page scrolls back to its top, so the pinned row is not up during the second pinch; the name heading was then judged on the table's own heading row (at the left edge, 20 px, both times). The pinned-row-with-fingers-down case is W3.1 (pinch in from the pinned state), which passed in both paths.
- W1.6 (press on a heading's padding): the brief gave no expected line; the column moved like the words drag, judged PASS on that.
- W5c.5: the holiday is found by its short mark "WD" drawn on its date (15 Nov 26) on the Inputs calendar and the Leave War grid, not by its full name; pictures W5c-*-5-*.png. The Calendar window stays open across pages (D1623), so the script closes it before opening Inputs.
- W5b.3 "Later": only one man was enabled, so no second prompt existed; not walked.
- Picture count is 65 (over the ~45 asked), mostly the three W5 rounds; all cropped, 1x.
- The first script run had three of its own faults, fixed before this final run (W1.0 judge too strict, W3 judge needing the pinned row when the page had scrolled to the top, W6 row selector, W5 phone set-up left the Calendar window open); no app fault behind any.
