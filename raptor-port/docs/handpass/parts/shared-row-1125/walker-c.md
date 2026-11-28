# Walker C — Share C, the Leave War's windows (the shared-row walk, 25 Nov 26)

*Saved by the host (chat 178) from the walker's hand-back, its table and FAIL steps word for word — the helper's file tool
refused the report file. An Opus walker on the frozen build `.tmp/build-6c7f3aac7`, bundle `index-BiU7Aj55.js`, printed
and checked at the start of every world. Totals: PASS 37 · FAIL 4 · RECORDED 25 · NOT WALKED 0 scenario rows. No page
or console error in any final run.*

- Every scenario in a fresh browser context; the fixture filed through the Inputs page's own window (Mon 13 – Wed 15 Jul
  by its own calendar, the readout "Jul 13 → Jul 15"). People take turns by signing out and in, in the same tab: Ranger
  = `us`, Hex = `hex`, admin = `ad`. What was saved was read from `window.INPUTS` after every step.
- Pictures: `docs/img/handpass/2026-11-25-shared-row/c/` — the final runs only, 256 in all: `c1-run4-phone-chromium`
  20, `c1-run4-phone-webkit` 18, `c1-run4-desk-chromium` 12, `c2-run2-phone` 34, `c2-run1-desk` 20, `c3-run1-phone`
  39, `c3-try1-desk` 22, `c4c6-run1-phone` 12, `c4c6-run1-desk` 9, `c5-run2-desk` 6, `c7-run2-phone` 18,
  `c7-run2-desk` 21, `c8-run2-phone` 15, `c8-run2-desk` 10. Earlier attempts whole in `c/_superseded/`, never cited.
  Scripts: `scripts/handpass/shr-c-lib.mjs`, `shr-c-c1.mjs` … `shr-c-c8.mjs`, the probes `shr-c-probe*.mjs`.

## What the windows are on this build

- **Ranger signed in, his own cell:** any day of the fixture opens his leave's own Remarks window (`remarks-sheet`; July
  is before today, so his dates are closed): "Ranger | 13 Jul → 15 Jul | LL (AM) | ✕ | till 15 Jul | Document".
- **The admin, Ranger's cell:** the bid window (`bid-picker`). With the timed fixture (08:00–10:00 reads as the
  morning) it is the window for the free afternoon: "PM | The morning is LL, filed on the Inputs page — change that
  there." With an all-day shared leave: "LL | Whole day · change it on the Inputs page". Both have a Remarks box, a
  till tick and Document; neither offers Delete, Refuse, Approved or Move — only CSE, OD, Grant OIL, ⋯, Pick a range
  and the portion chips, plus the leave buttons for the free afternoon on the timed one.
- **A day of two entries** (the shared morning leave plus an approved afternoon LL placed for Ranger in the war) opens
  the day's list (`daylist-sheet`): the shared leave a read-only line, "LL 08:00–10:00 · change it on the Inputs
  page", its remark in quotes, no box; the war leave has Approved · Refuse · ⇄Move · Delete and its own Remarks, till
  and Document.
- **Fable's set-up (S3) cannot be made:** adding Hex on the Inputs page to a leave of Ranger's approved in the war is
  refused — "A leave approved on the Leave War is one person's — file the other person's leave as its own input"; the
  store unchanged. The admin has no closed-day window: every past day opens the bid window for him.

## Table

| id | size / engine | verdict | what the screen said and what was saved | pictures |
|---|---|---|---|---|
| C1 | phone Chromium | PASS | Save 1: "Dental", box left by a tap on a blank part of the window — Hex's input unchanged (08:00–10:00, no remark, till unset, no document); a new input for Ranger alone, same dates and hours, remark "Dental". Save 2: "Dental then gym" + Enter → that same Ranger input. Document: on Ranger's only. Till (was ticked) → Ranger's till=false. "Dental pm" left → on Ranger's. After ✕ and reopening: "Dental pm", till off, the document chip. The box showed what he typed after every step. Hex signed in: his window empty, till ticked, no document. Inputs page: two LL rows, Hex "No document" and Ranger "Dental pm" | `c1-run4-phone-chromium/c1-phone-chromium-01…08`, `-09-hex-window`, `-12-inputs-day` |
| C1 | phone WebKit | PASS | As above without the document step (the test WebKit keeps no file): Ranger's own "Dental pm", till=false; Hex untouched, his window empty | `c1-run4-phone-webkit/` |
| C1 | desktop Chromium | PASS | Same as phone Chromium | `c1-run4-desk-chromium/` |
| C1 bell | all three | RECORDED | Hex's bell: "LL Mon 13 Jul / Ranger taken off · Ranger" and "LL Mon 13 Jul / You were added · Saber". Admin's bell: "LL Mon 13 Jul / Remark changed · Ranger" (×3 in Chromium, one per remark save) and "LL Mon 13 Jul / Ranger taken off · Ranger". Read after all saves; the "taken off" line is from the first save, the split | `…-10-hex-bell.png`, `…-11-admin-bell.png` |
| C2-O1 | phone and desktop Chromium | PASS | document → remark → till → remark + Enter: the document alone already gave Ranger his own input, Hex unchanged; every later save kept the earlier ones; reopened "O1 words again", till off, 1 document; Hex's window empty | `c2-run2-phone/…-O1-*`, `c2-run1-desk/…-O1-*` |
| C2-O2 | phone and desktop Chromium | PASS | till → document → remark → second document: the till alone gave Ranger his own (till=false); both documents and "O2 words" survive; Hex untouched | `…-O2-*` |
| C2-V | phone ×4, desktop ×4 | PASS (8) | The viewer opened from Ranger's chip shows his input ("Ranger · LL · Jul 13 → Jul 15 … Placed by Saber for Ranger …"). One Close, one ✕, one Escape or one tap on the dark surround each closed the viewer only; the Remarks window stayed open, its box "Viewer words", the store unchanged | `…-V-*-1-open.png`, `…-V-*-3-after.png` |
| C3-A | desktop and phone Chromium | **FAIL** | Timed shared leave, admin, Ranger's cell. "Dental" typed and left, "Dental, gym" + Tab, till ticked → off, ✕, reopened. Nothing saved at any step: one shared input for both men, no remark. Reopened: box empty, till ticked again. No note | `c3-try1-desk/c3-desk-chromium-A-0*.png`, `c3-run1-phone/c3-phone-chromium-A-*` |
| C3-B | desktop and phone Chromium | **FAIL** | The same on an all-day shared leave: nothing saved, reopened empty, no note | `…-B-0*.png` |
| C3-ALL | desktop and phone | RECORDED | Words typed in the timed window, then LL pressed without leaving the box: a new approved afternoon LL for Ranger alone carries "Typed then LL"; the shared leave and Hex untouched; reopening shows the day's list | `…-ALL-02-after.png`, `…-ALL-03-reopened.png` |
| C3-BLL | desktop and phone | RECORDED | The all-day window offers no leave button at all | `…-BLL-01-nobutton.png` |
| C3-C Delete / Refuse / Approved / Move | desktop ×4, phone ×4 | PASS (8) | The day's list offers the four for Ranger's war leave only; the shared line offers nothing. With words typed first: Delete → the war leave gone; Refuse → "PM · refused"; Approved (lit) → "PM · pending"; Move → no window opened, the war leave holds "Words then Move". Every time the shared leave (both men, 08:00–10:00, no remark) untouched, Hex's cell LL approved. No note for any press | `…-C*-01-list.png`, `…-C*-03-after.png` |
| C3-F | desktop and phone | RECORDED | Fable's set-up refused in words (above) | `…-F-01-refused.png` |
| C4 close | desktop and phone Chromium | PASS | Admin dragged Ranger's 13 → 15 Jul over the shared leave: "Ranger \| 13–15 Jul · 3 days \| Auto-approve \| ✕ \| No manning row is amber or red \| till 15 Jul \| Document \| Whole day \| AM \| PM \| LL 11 \| OL 11 \| … \| CSE \| OD \| Grant OIL \| ⋯" — nothing about the days already holding an approved LL, no decision buttons. "Ranger run C4close" typed, then ✕: nothing saved (the words dropped silently); the shared leave left alone | `c4c6-run1-*/c4-*-C4close-0*.png` |
| C4 move | desktop and phone | RECORDED | The drag window offers no Move | `…-C4move-0*.png` |
| C5-H | desktop Chromium | PASS | One tab. Ranger split by a remark ("Split"); the admin deleted Hex's input on the Inputs page ("Input deleted", no question); Ranger's window showed "Split", "After Hex gone" + Enter saved to his same input; the Board, his row, start 0900 + Tab → the same input, 09:00–10:00. One input left | `c5-run2-desk/c5-desk-chromium-H-0*.png` |
| C5-R | desktop Chromium | PASS | A fresh fixture, split. The admin held Ranger's Board row (caret in his end box) and pressed the row's LL: the window was Ranger's ("Ranger · 15 Jul"). Delete → "Input deleted"; the Board redrew at once with Hex's row only — no row or window still showed Ranger to type on. Leave War, 15 Jul: Ranger's cell empty, Hex's LL approved, 08:00–10:00 untouched | `c5-run2-desk/c5-desk-chromium-R-0*.png` |
| C6 | desktop and phone Chromium | PASS | A one-man LL for Ranger from his own Remarks window: "Solo words" + Enter, "Solo words again" left, ✕, reopened — all on the same input; no new input, no refusal, no note | `c4c6-run1-*/c6-*` |
| C7 grid cell | desktop + phone, Ranger + admin | PASS (4) | Ranger: `remarks-sheet`, in sight, saved on his own input. Admin: `bid-picker`, in sight, its box saved nowhere (the C3-A finding). The grid underneath as it was | `c7-run2-*/…-grid-cell-*` |
| C7 day's list | desktop + phone, Ranger + admin | PASS (4) | `daylist-sheet`, in sight; the box saved on the war leave; the shared line read-only, showing Ranger's own remark in quotes | `…-day-list-*` |
| C7 person window, MY LEAVE, Approvals | desktop + phone | RECORDED (10) | The person window (from the row's name or MY LEAVE) lists "LL Mon 13 – Wed 15 Jul 1.5 Approved"; pressing that line opens no remark window. On the phone the row-name door is not drawn. Approvals has no line for this Inputs-page leave. **The list of doors:** the shared leave's remark window opens only from the grid's cell, for the member; the day's list shows it read-only | `…-person-window-line-*`, `…-my-leave-*`, `…-approvals-*` |
| C8 | desktop and phone Chromium | RECORDED | Ranger's window: "C8 ✕" closed by ✕ → saved (which split him onto his own input); reopened, "C8 ✕". "C8 Escape" closed by Escape → saved. "C8 tap outside" → closed and saved. Inputs page: "Hex LL 08:00–10:00 No document By Saber" and "Ranger LL 08:00–10:00 C8 tap outside By Saber". Board's Unavailable list: Hex 08:00–10:00 no remark; Ranger 08:00–10:00 "C8 tap outside". Hex's bell: "LL Wed 15 Jul / Ranger taken off · Ranger", "… / You were added · Saber". Admin's bell: "Remark changed · Ranger" ×2, "Ranger taken off · Ranger" | `c8-run2-*/` |

## The FAILs, with their presses

**C3-A**, desktop 1440×900 Chromium (the phone the same, by touch): (1) sign in as `ad`; Inputs page → Wed 15 Jul →
+ Input → LL, several people: Ranger and Hex, custom 08:00–10:00 → Save. (2) Leave War → JUL → press Ranger's cell on
Wed 15 Jul: the bid window, "PM | The morning is LL, filed on the Inputs page — change that there." (3) Tap the Remarks
box, type `Dental`, click a blank part of the window (the caret leaves the box): the store unchanged. (4) Select all,
type `Dental, gym`, Tab (the caret goes to the till): unchanged. (5) Tap the till (ticked → unticked): unchanged.
(6) ✕, reopen Ranger's cell: the box empty, the till ticked. No note at any step.
**C3-B:** the same on Thu 16 Jul with the leave filed all day: "LL Whole day · change it on the Inputs page", the box
directly under that line. Same result. The walker's own note: in the timed case the box may belong to the free
afternoon (words do ride onto an afternoon LL if one is pressed, C3-ALL); in the all-day case there is no free part of
the day at all; C4 (the drag window over the shared days) drops typed words the same way.

## Caret on the phone (a button tapped while a box held the caret)

C1 phone Chromium: tapping Document moved the caret to the Document button; tapping the till put it on the till. C1
phone WebKit: tapping the till moved the caret to the page itself. So the test browsers move the caret off the box on
these taps; on his iPhone a tapped button takes no focus. The Remarks window saves when the box is left, and every
save in these runs landed.

## Not walked, and why

C3's closed-day window for the admin (none exists); the decision buttons on the shared leave's own window (it offers
none — walked on the day's list beside it); C4 "before Move" (no Move there), C4's member variant; C5 on the phone
(desktop, one tab); WebKit beyond C1; document steps in Chromium only.

## Script mistakes, set aside and never cited

C1 attempts 1–3 (the window's heading is its drag handle and keeps the caret; two judging slips); C2 phone attempt 1
(pressed the first chip, not Add); C5 and C8 attempt 1 (a picture of a hidden area); C7 attempt 1 (MY LEAVE pressed
the grid's day heading).
