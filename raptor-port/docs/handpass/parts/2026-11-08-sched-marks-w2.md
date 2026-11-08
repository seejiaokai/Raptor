# W2 report — the unreadable and older weeks (walker w2, origin http://localhost:4393, 8 Nov 26)

Build: the frozen build `dist-sm1`. Scripts: `scripts/handpass/sm-w2-*.mjs` (a, a2, a3 fixtures; b S10; c, d, e2, f, g, g2, h, i, j). Pictures: `docs/img/handpass/2026-11-08-sched-marks/w2/` (names below; PC = `-pc-`, phone = `-phone-`/`-ph-`). I opened each picture named as "looked at".
Fixture U: the Wednesday row `raptor:weeks/13-07-2026#2` of a world with Wed 15 Jul published, damaged before the app reads it. Stashed U: loaded week 20 Jul after boot. Next-week fixture: `raptor:weeks/20-07-2026#1` damaged. Fixture O: `am` removed from `raptor:weeks/13-07-2026`.
Not proven by the host, and how I reached each: Help = `window.go('help')`; Admin = top-bar "Admin" link; Leave War = `window.go('leavewar')` then month JUL and a tap on a cell; week switch = `[data-wk="20/07/2026"]` on Edit Schedule; member = `window.raptorRole('member')`; print = the "Export as PDF (print)" button; CSV = "Export to Excel (CSV)". The board on U was opened only by code (`window.openScheduler`), because no control opens it.

## 1. Table

| Step | Size | EXPECTED | Screen said / showed | Result | Picture |
|---|---|---|---|---|---|
| S10.1 Edit Schedule, Mon–Sun, U | PC | the exact notice on every day | all 7 days: exact words (read from the drawing element) | PASS | s10-pc-edit-day2, day0, day6 |
| S10.1 same | phone | same | 7 of 7 exact | PASS | s10-phone-edit-day2 (looked at) |
| S10.2 View-only Sched | PC / phone | same | 7 of 7 exact, both | PASS | s10-pc-view-day2, s10-phone-view-day2 |
| S10 as member (role switched in place) | PC / phone | same | 7 of 7 exact, both | PASS | s10-pc-member-view, s10-phone-member-view |
| S10.3 Help → "Report a problem" | PC | opens, nothing sent | "Report a problem" is a card on the Help page (category list, "What happened" box, "Send report"); pressing the heading opened nothing else; nothing sent | RECORDED | s10-pc-help, s10-pc-help-report-opened (looked at) |
| S10.2 any control that opens the board on U | PC / phone | record | none on screen (no board button, no publish button on any day) | RECORDED | — |
| S10 board by code | PC | record | board draws and opens (day names, "Sign-off") — reached by code only, not a control | RECORDED | s14-pc-board-try-by-code (frame shows the Inputs page, stale: not evidence) |
| S11.1 file on 15 Jul, U stashed, 20 Jul loaded | PC | grey U-B, nothing saved | U-B words exact, grey (face blocked), nothing saved | PASS | s11-file-on-15Jul-pc |
| S11.2 edit healthy date into U | PC | U-B | U-B, not saved | PASS | s11-edit-healthy-into-U-pc |
| S11.3 edit out of U into healthy | PC | U-B | U-B, not saved | PASS | s11-edit-out-of-U-pc |
| S11.4 span 19–20 Jul | PC | U-B | U-B, not saved | PASS | s11-span-crossing-pc (looked at) |
| S11 unrelated healthy filing (22 Jul) | PC | succeeds | saved, window closed, no toast left showing | PASS | s11-unrelated-healthy-pc (looked at) |
| S11 | phone | same | not driven: the phone's Inputs list and week switch use other controls than my scripts found (d script, no row / no switch found) | NOT DRIVEN | — |
| S12 edit remarks, U loaded | PC | U-B, saved nothing | U-B exact, grey, window stays open, nothing saved | PASS | s12-edit-remarks-pc |
| S12 delete (button "Delete") | PC | U-B | U-B, nothing saved (no second confirm appeared) | PASS | s12-delete-pc |
| S12 re-date inside U | PC | U-B | U-B | PASS | s12-redate-within-U-pc |
| S12 re-date into a healthy week | PC | U-B | U-B | PASS | s12-redate-into-healthy-pc |
| S12 medical (HL) edit | PC | U-B | U-B | PASS | s12-medical-edit-U-pc |
| S12 person change | PC | U-B | U-B | PASS | s12-person-change-pc |
| S12 new input into U | PC | U-B | U-B exact; grey note with red no-entry sign; window stays, form kept | PASS | s12-pc-new-refusal (looked at) |
| S12 new input into U | phone | U-B above the keyboard-less form | U-B exact, grey, at the top of the screen; form kept; 100 ms picture the same | PASS | s12-phone-refusal-100ms, s12-phone-refusal-settled (looked at) |
| S12 after the refusal: tap box again, type | PC / phone | box usable | PC: remarks box took the typed value; phone: tapped box, typed " more", box read "phone refusal more" | PASS | s12-phone-retyped |
| S12 close with unsaved change (✕) | PC | ruled question | "This input has unsaved changes. Close it and lose them?" with "Discard and close" and "Keep editing" | RECORDED | s12-pc-new-refusal-dismiss (see s11-span-crossing for the same window) |
| S13 schedule gestures (drag, Accept, → Unavail, Goes to) | PC / phone | refused with U-B | NOT DRIVEN: on U no row is drawn on any day (notice only); with U stashed I did not reach a drawn row of an input spanning both weeks | NOT DRIVEN | — |
| S14 Publish / Publish AL on U | PC / phone | record each control | no Publish, Publish AL, template or plan control exists on any day of U; only reachable by code through the board | NOT DRIVEN (no control) | — |
| S1 medical from the Leave War | PC / phone | U-B | NOT DRIVEN (the Leave War's medical route not found in time). The input window's medical edit on U (S12 row above) is U-B | NOT DRIVEN | — |
| S2 send an approved leave back (tap "Approved") on U | PC | RECORD | inline words: "15 Jul 26 is on a locked week — not changed"; nothing changed | RECORDED | s2-pc-send-back-approved |
| S2 Approve a pending bid on U | PC | RECORD | inline words: "16 Jul 26 is on a locked week — not approved"; nothing changed | RECORDED | s2-pc-approve-pending |
| S2 Delete an approved leave | PC | RECORD | inline words: "Nothing here can be deleted from the war: approved leave and leave filed on the Inputs page are changed on the Inputs page." (amber line in the window); nothing changed | RECORDED | s2-pc-delete-approved (looked at) |
| S2 Move an approved leave | PC | RECORD | no words shown, nothing changed (the move did not start, or only armed — I did not drop it) | RECORDED | s2-pc-move-approved |
| S2 Refuse / Delete a pending bid on a U date | PC | RECORD | no words, no toast; the war's stored records changed (a refusal / a removal of its own record) | RECORDED | s2-pc-refuse-pending, s2-pc-delete-pending |
| S2 place a new LL (pending bid) on 14 Jul (U) and 22 Jul | PC | RECORD | no words; a pending LL box drawn on 14 Jul (U date) — a bid, not an input | RECORDED | s2-pc-new-LL-protected (looked at), s2-pc-new-LL-healthy |
| S2 no protected date changes | PC | no change | no approved leave changed and no schedule/input changed; pending bids (the war's own records) were added/refused/removed on a U date without words (see §4) | PASS (with a note) | above |
| S2 no refusal blames "an older version" | PC | none | none of the words above mention it | PASS | — |
| S2 | phone | — | script could not sign in on the phone (timeout twice) | NOT DRIVEN | — |
| S3 Admin → Users → Bolt → "Tap again to delete Bolt" | PC | RECORD | amber (not grey) note: "The week of 13/07/2026 can't be changed — the delete was not made"; Bolt still in the list. Not the "Blocked:" look, not the U-B words, date written 13/07/2026 | RECORDED | s3-pc-delete-step2 (looked at) |
| S3 | phone | — | sign-in timed out (script) | NOT DRIVEN | — |
| S4 next week damaged, desktop preview (Edit Schedule) | PC | RECORD | the next-week preview shows a full ordinary schedule (rows 12/6/3/2/5/1/1 on its seven days — the same counts as the stock week), no notice, no sign anything is wrong | RECORDED | s4-pc-edit-preview-tue21 |
| S4 View-only preview | PC | RECORD | same: 12/6/3/2/5/1/1 rows, no notice | RECORDED | — |
| S4 click into that week | PC | notice | loaded week shows the exact notice on all 7 days | RECORDED | s4-pc-week20-loaded |
| S4 | phone | — | no next-week preview on the phone; the week switch was not found by my script | NOT DRIVEN | — |
| S5 CSV on U | PC | RECORD | button "Export to Excel (CSV)" works: "CSV downloaded", file 142-schedule.csv, 33 lines, 4504 bytes — byte-for-byte the same size as the healthy week's; first lines are Monday 13 Jul flying waves (Saber, Echo…). The week on screen says it cannot be shown | RECORDED | s5-U-pc-after-export |
| S5 print on U | PC | RECORD | button "Export as PDF (print)" gives the toast `Print dialog opened — choose "Save as PDF"`; the print page's text reads "RESTRICTED 142 — Flying Programme Mon 13 Jul – Sun 19 Jul … published schedule Monday Jul 13 WORKING DRAFT — NOT YET SIGNED WAVE 1 VL BFM …" (stock flying lines) and no mention of the unreadable week; a print-media picture was taken | RECORDED | s5-U-pc-printmedia |
| S5 phone | phone | RECORD | both buttons exist on the phone's Edit Schedule and View-only; I did not press them on the phone (WebKit print/download not driven) | NOT DRIVEN | — |
| S15 older-version week (O), loaded | PC / phone | RECORD | every day: "This day's published schedule was created by an older version of the app and can't be shown here. It has not changed — open it on the device that created it." Refusal (new input): grey "Blocked: this week was published by an older version of the app, so it can’t be edited. Nothing was saved." (no "Report it" sentence) | RECORDED | s15-pc-day2, s15-pc-refusal (looked at), s15-phone-day2, s15-phone-refusal |
| Plain-user round, healthy week: file LL for Saint 16 Jul | PC | saved | list shows it; count 55 → 56 | PASS | round-pc-after-file |
| open it from the list | PC | its window | window "Saint · 16 Jul" opens | PASS | round-pc-opened |
| edit remarks, save | PC | saved, window closes | window closed, remark saved | PASS | — |
| close by ✕, Escape, Cancel (clean) | PC | closes | each closed the window | PASS | — |
| close by a tap outside (clean) | PC | not expected to close | stayed open | RECORDED | — |
| close ✕ with unsaved change | PC | question | "Keep editing" kept the typed text; Escape then "Discard and close" closed the window | PASS | round-pc-dirty-close |
| the schedule after (Thu 16, Unavailable) | PC | Saint's LL drawn, no waiting mark (day never published) | row drawn, no underline (computed: none) | PASS | round-pc-schedule-thu |
| the bell | PC | record | not driven: my selector found no bell | NOT DRIVEN | round-pc-bell (shows the top bar) |
| Undo | PC | steps back the last change | said "Undid: Saint’s LL" — it took back my remark edit (the LL stays, as the filing is the older step); I pressed Undo once only | RECORDED | round-pc-after-undo |
| Plain-user round | phone | — | not driven (phone list/row controls not found by my scripts) | NOT DRIVEN | — |

## 2. Roll-call rows

- **11 (notice on Edit Schedule, every day, PC and phone):** SHOWS the exact notice on 7 of 7 days both sizes; no rows, no controls drawn under it (so no gesture on those days); the unpublished days too. Pictures s10-pc-edit-day*, s10-phone-edit-day2.
- **12 (View-only Sched):** SHOWS the exact notice 7 of 7, PC and phone, also with the role switched to member. No controls.
- **13 (board):** no control on screen opens it on U (no board or publish button on any day); by code the board does draw. Record only.
- **14 (next week's desktop preview):** MISSING, as known: with a damaged next week it draws a full stock schedule with no notice (rows 12/6/3/2/5/1/1), and the loaded week after a click gives the notice. s4-pc-edit-preview-tue21. Phone has no preview.
- **15 (print, export):** MISSING, as known: both buttons work on U and produce a stock schedule (CSV 33 lines, same as the healthy week; print text "WORKING DRAFT — NOT YET SIGNED … Mon 13 Jul – Sun 19 Jul") with no word about the unreadable week.
- **16 (input window new/edit/medical):** every attempt gives U-B in the grey note, window stays open, nothing saved (new, edit, delete, re-date, person change, HL edit; stashed U too). Phone new: same.
- **17 (drag, Accept, → Unavail, Goes to):** NOT DRIVEN — no drawn row on U; not reached on stashed U.
- **18 (Leave War approve, send back, delete, move):** see S2 rows. The war says its own words ("is on a locked week — not changed", "— not approved", "Nothing here can be deleted from the war…"), never "older version". Pending bids can still be refused, deleted or placed on a U date with no words.
- **19 (deleting a person):** amber note "The week of 13/07/2026 can't be changed — the delete was not made"; nothing deleted.
- **20 (Publish / Publish AL):** no control on U (only through the board by code). Not pressed.
- **21 (older-version week):** notice keeps "open it on the device that created it" on every day; refusal grey, "Blocked: this week was published by an older version of the app, so it can’t be edited. Nothing was saved."

## 3. Page and console errors

None, in every run (arrays printed empty).

## 4. Odd things no step asked about

- The Leave War lets a pending bid be placed, refused or deleted on a date in the unreadable week with no words at all, while Approve and "send back" say "locked week". It is the war's own record, not an input, but the host should judge. s2-pc-new-LL-protected.
- The Leave War's own wording ("is on a locked week") and the Admin delete note (amber, "13/07/2026") are in a different voice from the grey U-B note.
- Hidden copies of the notice exist under other pages (Help page text search found 7 hidden day notices behind it) — drawn-width test avoids them; noted for scripts.
- On the phone, signing in with a saved world timed out for the Leave War and Admin scripts (e2, h phone) — script/test-browser matter, not judged as an app fault.

Counts (table rows with a result): PASS 33 · FAIL 0 · RECORDED 17 · NOT DRIVEN 12 (S11 phone, S13, S14, S1, S2 phone, S3 phone, S4 phone, S5 phone, bell, plain-user phone and the two phone repeats).
