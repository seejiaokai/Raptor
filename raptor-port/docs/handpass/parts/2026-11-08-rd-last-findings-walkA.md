# Walker A — the screens, React Doctor's last findings ([RD-LEFT-1108]), 8 Nov 26

Builds: `main` d8d5b1f57 (`dist-main`) and the branch 8b54a2cd5 (`dist-branch`), both in the scratchpad. Clock held at
2026-11-08 09:00 +08, animations off, desktop 1536x864 Chromium at 1.25x, phone 402x874 WebKit at 3x by touch (taps).
Served from inside the browser at origins 4401 (`main`) and 4402 (branch); no real server bound either port.
Scripts: `scripts/handpass/rdl1108-a-lib.mjs` (shared; named -a- because walker B's own `rdl1108-lib.mjs` sits beside it),
`rdl1108-same.mjs`, `rdl1108-walkA.mjs`. Fixtures were made through the app's own controls on both builds: RDACTIVE, RDWSO,
RDGROUND, RDNOSIGN, RDSUSP, RDADMIN2, three archived (RDARCH with an account, its callsign then taken by a new active RDARCH;
RDARCHF with an account and a free name; RDARCHN with no sign-in), and a waiting request RDREQUEST.

## 1. `rdl1108-same.mjs` — pictures: `main` twice, then `main` against the branch (no pixel over 24 levels)

Command: `node scripts/handpass/rdl1108-same.mjs <dist-main> <dist-branch> docs/img/handpass/2026-11-08-rd-last-findings/same`
Result: **76 screens (38 at desktop, 38 at phone): 76 SAME, 0 NOISE, 0 DIFF.** `main` against itself was identical on all 76 first.
Pictures: `docs/img/handpass/2026-11-08-rd-last-findings/same/{before,before-again,after}-{desk,phone}-<screen>.png` (228).
Screens: users-top; users-rd (the fixture rows, filtered by "RD": active, suspended, no sign-in, personnel, admin, the archived
group); ed-RDACTIVE / RDWSO / RDGROUND / RDNOSIGN / RDSUSP / RDADMIN2 (each open editor); ed-RDACTIVE-armed (Delete armed);
ed-RDNOSIGN-typed; ed-RDACTIVE-cancelled; own-row (Saber tapped); torch-row and torch-open (the demo's "posted out 13 Jan" tag);
arch-RDARCH (taken), arch-RDARCHF (free), arch-RDARCHN (no sign-in), arch-RDARCH-typed, arch-RDARCHF-armed; give-roster, give-new,
give-new-typed (14 letters); add-person, add-person-filled; data-default, wipe-on / wipe-range / wipe-before, log-on / log-range,
data-both-range; help-form (the Help form's `.mfield` headings); inputs-window (the Inputs add window); signin, access-form,
access-filled, access-long (15 letters), access-sent. No page error and no 4xx on either build in any of these worlds.

A weakness of my own first pass: in the Data pictures the page had scrolled the "Period" and "Dates" headings under the top bar. I
re-shot the 7 Data screens with the subject centred (`CENTER=1 SKIPFIX=1 ... same-data`): **24 SAME, 0 DIFF**; pictures in
`.../same-data/` (72). I opened `same-data/after-desk-wipe-range.png` and `after-phone-wipe-on.png`: Period, Dates, Older than / Date are
all drawn in one look (10px, bold, upper-case, grey). Also opened `same/after-desk-arch-RDARCH.png` and `after-phone-give-new.png`.
Note: `give-roster` and `give-new` are the same picture on both builds, because a request that matches nobody opens Give access on
"New person" by itself; the roster mode is in walk part x2 (`walkA/*-x2-roster-open.png`). `data-default` equals `wipe-before` because
"older than" is the default.

## 2. `rdl1108-walkA.mjs` — values compared, both builds, both sizes

Command: `node scripts/handpass/rdl1108-walkA.mjs <dist-main> <dist-branch> docs/img/handpass/2026-11-08-rd-last-findings/walkA [only]`
Records: `.../walkA/walkA-record.json` and `walkA-record-x2.json`. Pictures: `.../walkA/{main,branch}-{desk,phone}-*.png` (140).
First run: 334 value steps. With the app's randomly minted person ids left out of the comparison (my script's first-run failure, section 4):
**312 SAME, 22 DIFF, 0 not walked.** All 22 DIFFs are the S18 step, and are exactly the intended difference (section 3). Second run
(part x2): 24 steps, 24 SAME.

Each step wrote down what the screen said (editor fields, buttons with their armed or disabled state, notes, refusals, row lines and
dots, Undo and Redo state, toasts, Quals / Leave War / Edit Schedule text, the active element, errors, the band):
- **S12** six row kinds opened, an unsaved sign-in and role typed, Delete armed, then closed by Cancel, by the same row, by another row, and
  reopened each time: every reopen starts from the saved values with Delete unarmed; the other row shows its own values; the own row stays closed
  (button disabled, no editor); the posted-out Torch row. SAME.
- **S16** blank sign-in refused, duplicate refused (editor stays open, same words), tap away, refocus, type the same value again (same
  refusal), a correct value gives the sign-in with one Undo step; Save with nothing changed adds no Undo step; Delete armed then edit then Save;
  Delete armed then Cancel; Delete armed then another row and back (disarmed). SAME.
- **S13** the three archived editors: opening name ("RDARCH 2" suggested when taken), a taken name typed gives "RDACTIVE is already taken —
  callsigns must be unique", the same refusal again after tapping away and typing it again, Delete armed then Cancel then reopen (reset);
  Save name keeps him archived (renamed RDARCHN2); Restore re-enables the account and says "check his quals and CAT"; Restore as RDARCHB. SAME.
- **S14** a typed and armed editor: kept across another category and back (same on both), gone after leaving Admin and returning, after a 70 s
  idle, after searching it out of the list, after folding Archived. SAME.
- **S17** (reduced) Give access opened, New person, away and back keeps the typed value, Cancel and reopen resets. SAME. Roster mode: part x2.
- **S18** section 3. **S20** (both sizes, normal and `?savefail`): caret in the callsign box on arrival, typing at once lands there, Tab order,
  blank and 15-letter refusals ("at most 14 letters", nothing sent), no seat refused, personnel has no CAT box, sent screen "Waiting for an
  admin"; with `?savefail` it reads "Not sent yet" with the "Not saved — keep this page open / Retry" band; another identity starts empty with
  the caret in the box. SAME.
- **S23** Quals "+ Add person" lands on Users with the caret in the callsign box. SAME. **S24** boxes measured: paired fields (same top, 287 wide, 40 high
  at desktop), heading against rows, the armed editor's boxes, no horizontal overflow. SAME.
- **Plain-user round**: Add a person, give sign-in, suspend, enable, archive, restore, delete (first press arms, second deletes), approve a request
  as New person, refuse a request, the change history window, clear history and clear clutter over 5–7 Nov (both builds gave the "no … in that period"
  answer: the demo holds nothing there), then Quals, Leave War and Edit Schedule each showed the new people. Part x2: a request matching a roster
  man opens Give access on "On the roster" with its note, picked, role Admin, access given with one Undo step "giving access"; New person
  approval; Quals and Leave War show both. SAME.

## 3. The one intended difference (S18) — what each build showed

| Press | `main` | branch |
|---|---|---|
| a press on the word "Period" (both forms, both sizes) | keys stay on the page | keys on that form's own list; the other form untouched |
| Down key after it | nothing changes | the list moves to "A specific date" |
| the range calendar's group | no role, no name | a group named "Dates" |
| the word "Dates" | a label that points at nothing | a plain line, same look (10px, 600, 1px spacing, upper-case, same grey) |
| the word "Person" in Give access | a label | a plain line, same look |

Every other heading measured the same style on both. Pictures: `walkA/{main,branch}-{desk,phone}-s18-admWipe-period.png`, `-admLog-period.png`, `-range.png`.

## 4. The script's own first-run failures (all fixed, none the app's)

1. My first shared library was overwritten by walker B's file of the same name; renamed mine `rdl1108-a-lib.mjs` and rewrote it.
2. A trial of the picture script with an "only" filter skipped earlier steps later ones need (a tap timed out); the full run uses no filter.
3. Pictures scrolled the Period / Dates headings under the top bar: re-shot centred (section 1).
4. 165 false DIFFs on the walk's first compare: the app mints a random id per person and each editor record carried it. Compared with the id left out (script patched); the same 22 S18 rows remain.
5. The plain round's "On the roster" pick timed out because I picked a man who already had an account (not in that list, as the rule says): walked in part x2 with a man who has none.
6. S23's bell step read "Nothing new" because the admin had opened Users first; x2 asks again unseen (section 5).

## 5. What I could not walk

- A waiting posting and a held posting on Users (needs the Leave War's posting sheets); only the demo's already-run "posted out 13 Jan" tag (Torch) was walked.
- The bell's access-request line: in both builds the admin's bell read "Nothing new" after a request was made and the admin signed in again, so there was nothing to tap and no landing to walk. Reported as it stood, not as a fault.
- Clearing a period that actually holds notes (a count and a removal); both builds only gave the "no … in that period" answer (walker B's S19 or later).
- Closing every window every way on the phone beyond the date calendar (closed by Escape, the shade and a press outside: SAME); the phone's category-back button was pressed in S14 but its first frame was not recorded on its own.
- Anything needing his iPhone (keyboard, native motion): emulated touch only.

## 6. Console errors, page errors, 4xx

None on either build, either size, in any world (the record's error lists are empty for every desk and phone world, access and `?savefail` worlds included).

## 7. §2 roll-call rows these steps prove

S1 (Users rows in every state, pictures and values), S2 (open editors, typed values, armed Delete, closed every way, reopened), S3 (archived rows and
editors: free, taken, no sign-in; rename, Restore, Restore as, Delete), S4 (Give access, On the roster / New person, the "Person" line), S5 and S6 (Admin → Data both
forms, all Period modes, the range calendar, "Dates"), S7 (access screen caret, typing, Tab order, refusals, `?savefail`), S8 (Add a person, approval form, Help form,
the Inputs add window; heading styles measured). P3, P8 and P10 by the plain round (give sign-in, suspend, enable, archive, restore, delete, approve, refuse gave the
same results and Undo steps on both); the failed-save rollback and reload parts of P1–P12 are walker B's.

Walk: 458 steps, 436 SAME, 22 DIFF (all the intended S18 difference), 0 FAIL, 440 pictures
