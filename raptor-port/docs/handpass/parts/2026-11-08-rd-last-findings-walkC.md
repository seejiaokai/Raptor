# Walker C — S14, S15, S19 (React Doctor's last findings, [RD-LEFT-1108], 8 Nov 26, chat 32)

Script: `raptor-port/scripts/handpass/rdl1108-parts3.mjs` (parts C14, C15, C19), run through `rdl1108-walk.mjs` (imports it beside walker B's parts). Builds: `main` (d8d5b1f57) and the branch (8b54a2cd5), the frozen folders named in the brief. Clock 2026-11-08 09:00 +08:00, desktop 1536x864 Chromium at scale 1.25, phone 402x874 WebKit scale 3 by touch. Sign-in as `ad`/`a`. Nothing built, no lock taken, nothing committed. No server was started on 4411/4412 (the script serves each build inside the browser context), so nothing needed stopping.

Pictures: `raptor-port/docs/img/handpass/2026-11-08-rd-last-findings/walkC/<main|branch>-c-<scenario>-<D|P>-<step>.png` (112 pictures, one per build per step). Records (values both builds): `.../walkC/record-C14-C19-desk.json`, `record-C15-desk.json`, `record-C19-desk.json`, `record-C14-C15-C19-phone.json`, `record-C19-phone.json`. `record-C14-desk.json` is a superseded first run (see script problems); the C19 entries inside `record-C14-C19-desk.json` and `record-C14-C15-C19-phone.json` are superseded by `record-C19-desk.json` / `record-C19-phone.json` (the loaded-week note was added afterwards).

**Walk: 56 steps, 56 SAME, 0 DIFF, 0 FAIL, 112 pictures**

## Result in one line
Every step reads the same on `main` and the branch, at both sizes. No console errors, page errors or 4xx on either build in any run.

## What each build said (identical on both) — S14, hidden is different from closed
Fixture: RDACTIVE (active, sign-in) and RDARCH (archived, sign-in). Before each route: editor open, an unsaved box value typed, Delete armed ("Tap again to delete ..."). Record after returning, before touching anything.

| Route (editor kind) | Desktop | Phone |
|---|---|---|
| Admin category changed and back — roster | editor open, unsaved text kept, Delete armed | same |
| Admin category changed and back — archived | list open, editor open, "DRAFTCS" kept, Delete armed, button "Restore as DRAFTCS" | same |
| Category back button (phone only) — roster / archived | n/a | editor open, text kept, Delete armed (both kinds) |
| Leave Admin for Quals and back — roster | editor CLOSED; reopened: saved sign-in, Delete unarmed | same |
| Leave Admin for Quals and back — archived | list folded and editor closed; reopened: callsign back to "RDARCH", Delete unarmed | same |
| Search hides row, then cleared — roster | editor open but reset: saved sign-in, Delete unarmed | same |
| Search hides row, then cleared — archived | list folded, editor closed; after unfolding and pressing the row the editor read as not open (see problems) | same |
| Fold Archived, unfold — roster | editor open, text kept, Delete armed (the roster is not hidden) | same |
| Fold Archived, unfold — archived | list open, editor open, callsign reset to "RDARCH", Delete unarmed | same |

Deciding pictures opened: desktop `branch-c-S14-D-arch-search.png`; phone `main-c-S14-P-roster-quals.png` and `branch-c-S14-P-roster-quals.png` (identical to the eye, editor with saved sign-in).

## S15 — changes elsewhere while an editor is open (identical on both builds)
Desktop and phone (second tab desktop only).
1. Roster editor open, draft sign-in typed; renamed RDACTIVE to RDACTIVX on Quals (callsign cell, Save: toast "Quals saved").
2. Back on Users: row headed RDACTIVX (old name gone), editor CLOSED. The Save step therefore had no editor to save (recorded "had: false"); nothing saved, Undo button "Undo — RDACTIVE's callsign".
3. Suspend: row "Sign-in suspended". Editor reopened, draft typed, top-bar Undo pressed while open: toast "Undid: suspending RDACTIVX's sign-in", row back to "Can sign in", editor stays open with the draft kept. Save then writes the draft: row shows "draft-before-undo@example.test", editor closed.
4. Draft typed, Quals and back: editor closed (draft gone), row unchanged.
5. Archived editor (desktop and phone): callsign draft "RDARCHDRAFT" typed. Desktop only: second tab; Quals does not list archived people (no callsign cell holds the name), so the second tab renamed him through the archived editor's Save name (to RDARCHQ2). First tab, no reload, Save name: toast "Renamed RDARCHDRAFT"; the person now reads RDARCHDRAFT (the stale tab's name wins); after reloading both tabs both show only RDARCHDRAFT in the archived list.

## S19 — real clutter (desktop; phone for the date-range pass)
Loaded week reads 13 Jul 2026 (so 5–9 Nov are all outside it). Fixture through the Inputs calendar: notes on 3, 5, 6, 7, 9 Nov and 15 Jul (loaded week), a day title on 5 Nov.
- Older than 7 Nov, first press: "Tap again to clear 4 items" (notes 3, 5, 6 and the title on 5). Mode changed while armed: button back to "Clear old clutter…" (disarmed, date kept). Armed again, confirmed: toast "Cleared 4 items"; calendar: 3, 5, 6 and the title gone; 7 (the edge day), 9 and the 15 Jul loaded-week note kept.
- Range 5–7 Nov (after putting notes back; desktop had a second note on 7 and 9 and the loaded week from the re-seed): desktop first press "clear 5 items", confirmed "Cleared 5 items"; phone (no re-seed) "clear 4 items", "Cleared 4 items". Calendar: 5, 6, 7 empty, the title on 5 gone, 3, 9 and 15 Jul kept.
- Older than 20 Jul (covers the whole loaded week): "No old clutter in that period", the 15 Jul note stays.
- Clear edit history, specific date 8 Nov: "Tap again to clear 21 entries", confirmed "Cleared 21 entries". The schedule's data is unchanged (same length, same content within the build). Undo stays enabled throughout and still offers "Undo — a change to the calendar" (the range clear, not the history clear); pressing it brings the range-cleared notes back.

Deciding pictures opened: `main-` and `branch-c-S19-D-4-calendar-after-older.png` (identical: 7 and 9 Nov notes, toast "Cleared 4 items").

## Script problems of my own (and the fix)
- First C14 desktop run: the branch's Chromium crashed ("Target crashed") on the last three archived steps while two other walk processes ran beside it. Re-ran C14 alone: no crash, 0 FAIL. `record-C14-desk.json` is that crashed run and should be ignored.
- First C19 desktop run: the schedule hash differed between builds only because ids are random per build; the check itself (unchanged within each build) was SAME. Changed the record to compare only the length. Then added the loaded-week note and a "covers the loaded week" step and re-ran C19 desktop and phone.
- Step c-S14-*-arch-search: after the search is cleared the archived list is folded; my "reopen" helper then unfolded it and pressed the row and the editor read as not open. Same on both builds, but I could not tell whether that is the helper's timing or the screen; not walked further.

## Not walked / limits
- S14 "wait beyond idle" (the scenario text) was not walked.
- S15's archived-editor rename on Quals could not be walked as written (Quals does not list archived people); the second tab used the archived editor's Save name instead.
- S19 "A specific date" and the Admin "A date range" pass on edit history were not walked; the phone did the date-range pass of Old clutter only (the brief's wording). The history clear was walked once, with all entries dated 8 Nov (the clock's day).
- Unsaved-draft step "S15 Save after Quals rename" had no open editor to save (above).
- Pressing "Period" (S18) is not part of walker C.

## Roll-call rows proved
Not asked by me to map; steps touch the Users editors (roster and archived), Quals' callsign cell, the Inputs calendar's notes and titles and Admin → Data's two clearing forms.
