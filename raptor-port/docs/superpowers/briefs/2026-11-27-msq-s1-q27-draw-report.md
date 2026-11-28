# Section 1 (the guard rail): the drawings for question 27. The drawer's report (chat 204, 27 Nov 26)

Drawn to `2026-11-27-msq-s1-q27-draw-brief.md`, in the shape of questions 24 and 25. No file under `raptor-port/src`
changed. Nothing is committed or pushed.

## How it ran

- **The copy:** an isolated worktree at commit `28b2cd4b5` (after `9904a943f`), `node_modules` linked to the section's
  copy by a junction, removed at the end.
- **The lock:** held by another chat's walk when I started; I waited about 5 minutes for it. The build ran through
  `gatelock.mjs exec` (PASS); then the lock was taken by hand, and released straight after the last picture.
- **The server:** `npx vite preview --port 4741`, checked free first, stopped by its port.
- **The browser:** Chromium at 1536×864, 2×, Singapore time; a fresh browser for each picture's case.
- **Errors:** no console error, page error or failed request in any run.
- **Script:** `raptor-port/scripts/handpass/n204/draw-q27.mjs` (reuses `q2425-lib.mjs`). **Logs:**
  `raptor-port/.tmp/n204-q27/log-q27.txt` (27-5, 27-1) and `log-q27-14.txt` (27-14, the final run).
- **The road, all real presses:** Saber (`ad` / `a`) on Admin → Squadrons → "+ New squadron", 151, first admin
  Kestrel, Save. The Undo button then reads "Undo — adding a squadron". He picks 151 in the top bar's list, which holds
  142, 149 and 151. Then he starts the thing and presses the top bar's Undo.
- **After each Undo:** 151 is still in view, the page has not changed, and the Undo still reads "Undo — adding a
  squadron". The note is the app's own, raised by the Undo button. It stands under the Undo button, at the top right.
  Only its fade was held off, so it could be pictured.
- **The proposed words:** the words after "Blocked:" were replaced inside the note itself. The app was then asked to
  place it again, so its look and place are the app's. A longer note grows to the left.
- **The teal dashed ring** marks only the note.

## Pictures

All are in `raptor-port/docs/mock/2026-11-26-msq-questions/q27/`. Each has a whole screen `.png` and a `-crop.png`,
except 27-14.

| Picture | Caption | Real or replaced |
|---|---|---|
| `q27-5-today` / `-crop` | Saber has made 151 and is working on it. He opened "+ New squadron" again and typed 152 without saving, then switched to the Users section. He pressed Undo. The note reads "Blocked: cancel the new squadron, then press Undo again." | Real app |
| `q27-5-proposed-a` / `-crop` | The same moment. The note reads "Blocked: cancel the squadron you are adding on Squadrons, then press Undo again." | Note's words replaced |
| `q27-5-proposed-b` / `-crop` | The same moment. The note reads "Blocked: cancel the new squadron on Squadrons, then press Undo again." | Note's words replaced |
| `q27-14-today` | Saber, on 151, opened Inputs → its calendar settings → Calendar… → Holidays. He added "Founders Day" on 9 Mar 2028 and pressed Save. The form keeps it waiting: "It is kept here, and saved by itself as soon as a leave period covers it.", with "Create the 2028 leave period" and Cancel. He pressed Undo. The note reads "Blocked: cancel the new holiday, then press Undo again." | Real app |
| `q27-1-today` / `-crop` | Saber, on 151's Admin → Users, opened Kestrel's row and changed its sign-in without saving, then switched to the Squadrons section. He pressed Undo. The note reads "Blocked: cancel the open row, then press Undo again." | Real app |
| `q27-1-proposed` / `-crop` | The same moment. The note reads "Blocked: cancel the open row on Users, then press Undo again." | Note's words replaced |

The crops for 27-5 and 27-1 show:
- the top bar with 151 and the Undo button;
- the note;
- the Admin sections, with the one showing (Users for 27-5, Squadrons for 27-1) lit.

They are wide (about 1470 × 250) and cut through the "SABER · ADMIN" badge.

## Where this differs from the brief

- **27-14, the year.**
  - The first try put the holiday in November 2026, and it was **saved at once**, not kept waiting. In this demo a
    leave period already covers 2026 and 2027, even with 151 in view. (That try's browser was thrown away.)
  - The Holidays list's year arrow was then pressed until it said "No leave period covers 2028 yet.", and the holiday
    was put on 9 Mar 2028.
  - So the waiting state comes from a year no leave period reaches, not from 151 having none of its own. The words-check
    report's reading, "a new squadron never has one", does not hold in this build for the current year. Worth knowing
    for the card's "when it happens" line.
- **27-14, the way in.** A person reaches the Calendar's Holidays by Inputs → the gear (Inputs calendar settings) →
  Calendar…. That settings window stays open beside it, untouched. The note still names the holiday.
- **27-14, scrolling.** In the waiting state the form's own buttons cover "Create the … leave period" until the form is
  scrolled. It was scrolled with the mouse wheel, as a person would, so the waiting line, its offer and Cancel all show.
- **27-14 has no crop.** The waiting form is at the left and the note at the top right, so a crop would be the whole
  screen. The whole screen is the picture.
- **27-1:** Saber's own row cannot be opened (it reads "Your own account — another admin can change it"). Kestrel's
  row, the first admin of 151, was used instead.

## What could not be drawn

Nothing was left undrawn. No state was forced through the developer's bridge.
