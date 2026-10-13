# The walk of the three builds of 14 Oct 26 — the walkers' brief (`[LW-CLASH-NOTE-PHONE]`, `[NOTES-SHORTER]`, `[LOOK-13OCT-SMALL-FIXES]`)

**For three Sonnet 5.5 walkers (D588, D787), each with one share below.** You WALK the running app and report; you do
not read code for bugs, you change no file of the app, and you do not judge whether a rule is right. The host (Opus)
opens your pictures and reproduces every finding. The evidence sheet: `docs/handpass/2026-10-14-three-builds.md`.

## Read first (in this order)

1. `docs/walk-scripts.md` §3 to §7 — how a walk script is written and what each trap has cost. It binds you.
2. `scripts/handpass/dl-lib.mjs` (107 lines) — the shared driver you use: `world(size)`, `go`, `pic`, `row`, `focusOf`.
3. Your own share below, whole, before the first step.

## The build, and the machine's traps

- **The app is already built and served at `http://localhost:4173`** (one frozen build for all three of you). Do NOT
  run `npm run build`, any `npm test`, Playwright's test runner, or start or stop any server. Do not touch `dist/`.
- **Write every script to a file with the file tool and run the file** (`node <file>`); never pass a script inline to
  the shell (backslashes are lost, an apostrophe fails to parse — often with no error). Never rewrite a script and run
  it in one step. Each script prints a version line first.
- Your scripts live in YOUR scratch folder `scripts/handpass/tb/<share>/` (`w1`, `w2` or `w3`), and import the driver
  with `import * as L from '../../dl-lib.mjs'`. Your pictures and key record go to YOUR folder: run every script with
  the environment variable `DL_SHOTS=docs/img/handpass/2026-10-14-three-builds/<share>` (set it on the command line:
  `DL_SHOTS=docs/img/handpass/2026-10-14-three-builds/w1 node scripts/handpass/tb/w1/<file>.mjs`), run from
  `raptor-port/`. Empty nothing that is not yours.
- **Sizes:** `L.world('phone')` is 390 × 844 with a finger (`w.press(sel)` taps); `L.world('desk')` is 1440 × 900 with a
  mouse and keyboard. Where a scenario names another width, make your own context the way `world` does.
- **Sign-in:** `world()` signs in as the admin (`ad` / `a`, callsign Saber). A member is `world(size, { who: ['us', 'us'] })`
  (callsign Ranger). Never sign in again mid-fixture on a fresh world (the sign-in reloads the page).
- **`world()` opens the app's "start fresh" address: nothing is saved in it.** That is fine for every scenario here.
- **Known traps in the drivers (the host's own first walk met these):**
  - The Leave War's bridge `window.lwSetCell(personId, 'YYYY-MM-DD', 'LL')` writes a bid for ANY id, including someone
    with no row on the Leave War (then the clash list prints the raw id, e.g. "nick") — a fixture's own artefact, not a
    fault. Use people who have a row: read the ids from `#page-leavewar [data-testid^="row-"]`.
  - Publishing a day through the bridge (the host's own way, allowed for a FIXTURE only — say so in your report):
    `const g = W.signOf(di); g.cur='ignite'; g.sked='bane'; g.plan='stiff'; g.appr='pump'; W.setDayApproved(di, true); W.afterSchedMutate()`
    (`di` 0 = Monday … 5 = Saturday 18 Jul 26 of the seed week). Where a scenario is ABOUT the publish note, publish
    with the screen's own controls instead (the four sign-off names, then "Publish day").
  - A passing note is ONE element, `#toastEl`; it fades (opacity 0) and is reused. Read it straight after the action
    (`textContent`, and `getComputedStyle(...).opacity` must be 1 for it to count as showing). `window.clearToast()`
    hides the one on screen before the next step.
  - On the Leave War `window.lwSetRole('member' | 'admin')` changes the role in place.
  - The seed's Saturday (index 5, 18 Jul 26) has the duty officer Fable (id `plasma`) on SDO 08:00–18:00.
- **Stop and report after 3 failed attempts at one gesture** — write it down as NOT WALKED with what you tried; do not
  improvise a way round through the bridge and call the route walked.
- **Send your report ONCE**, after closing every browser you started. The full report goes to
  `docs/handpass/parts/2026-10-14-three-builds-<share>.md`: one row per scenario — its id, PASS / FAIL / NOT WALKED,
  what the screen showed in its own words (copied from what your script read, never typed from memory), the picture's
  file name. Your hand-back message is a short summary: counts, every FAIL in one line each, every NOT WALKED with why.
- **A scenario's EXPECTED line is the rule; you report PASS or FAIL against it and nothing else.** Anything you notice
  outside the scenarios goes under "Seen in passing", one line each, with a picture.
- **One picture per assertion that matters**, taken while the thing asserted is still on screen. Look at each picture
  before you cite it.

---

## Share W1 — the Leave War's clash note (phone first)

The note that lists clashes between the published schedule and the Leave War. On a phone it is a slim amber line under
the two lines of buttons — "⚠ 2 clashes with the schedule · Show" — that opens a list in place; on a tablet and a
desktop it is a strip inside the second line. Admin only. Each clash: the name, the day, an instruction (which is a
link), and a sentence saying what clashes.

| # | Size | Do | EXPECTED |
|---|---|---|---|
| C1 | phone | Fixture: on the Inputs page file, with the page's own "+ Input" form, a leave of type LL for Fable on Sat 18 Jul 2026, all day. Then publish Saturday (bridge). Go to the Leave War. | One clash, the list already open. The row reads: `Fable` · `Sat 18 Jul` · `Change the leave on Inputs ›`, and under it `Weekend/PH work earns FO, but the day holds LL`. The line reads `⚠ 1 clash with the schedule` and offers `Hide`. |
| C2 | phone | Tap that row. | The app is now on the Inputs page and that leave's own window is open (it names Fable and LL). Nothing else opened on the Leave War. |
| C3 | desk | The same fixture as C1; go to the Leave War. | The strip is inside the stage line: `Fable · Sat 18 Jul · Weekend/PH work earns FO, but the day holds LL. Change the leave on Inputs ›`. No dash in it. Clicking the instruction does what C2 says. |
| C4 | phone | Fresh world. Publish Saturday (bridge). On the Leave War tap the stage button and move the period to BIDDING CLOSED. Tap Fable's Sat 18 Jul cell, bid LL, then Approve it (the day's sheet). | A clash whose instruction is `Send the leave back or delete it ›`; its sentence `Weekend/PH work earns FO, but the day holds LL`. A tap on the row opens Fable's Sat 18 Jul sheet, and that sheet offers sending the leave back or deleting it. |
| C5 | phone | Continue C4: close the sheet, move the period on to PUBLISHED. | The same clash now reads `Weekend/PH work earns FO, but the day holds published LL` with the instruction `Step the war back to Bidding Closed ›`. A tap opens Fable's Sat 18 Jul. |
| C6 | phone | Fresh world; publish Saturday (bridge) with one more man on a Saturday programme row (bridge, as `dl-clash-built.mjs` does); give Fable a bid on the Saturday (`lwSetCell`). Then give the second man one. | With ONE clash the list is open without a tap. When the second clash arrives (and you have pressed nothing) the list is closed and the line reads `⚠ 2 clashes with the schedule` · `Show`. |
| C7 | phone | Continue C6: tap the line; tap it again; tap it once more (open). Go to Edit Schedule and back to the Leave War. | Each tap opens / closes the list in place. After the visit to another page the list is as you left it (open). |
| C8 | phone 360 × 740, then 430 × 932 | The C6 fixture with two clashes, list open. | At both widths: the note is the full width of the screen; every name starts at one edge, every day at one edge, every instruction ends at one edge; each day is on one line; the second line of buttons above keeps its height; the page does not scroll sideways. |
| C9 | 431 × 932 (one pixel past a phone) | The C6 fixture. | The strip of a desktop (inside the stage line), not the phone's line. |
| C10 | phone | The C6 fixture, list open. Ask the page what is at the centre of the line and of each row (`document.elementFromPoint`). Also take one full picture with the round menu button of the top bar in it. | Each centre belongs to the line or to its row: nothing lies over the note — not the top bar's menu button, not a passing note. |
| C11 | desk | The C6 fixture. With the keyboard only: Tab from the Legend button. | The next stop is the first clash's instruction (`Decide the bid ›`), wearing a cyan ring; Enter opens that person's Sat 18 Jul sheet with Ack, Approve and Refuse on it. |
| C12 | phone and desk | The C6 fixture, then sign in as the member in a NEW world (`us` / `us`) with the same fixture made through the bridge. | A member sees no clash note at all. |

Seen in passing: say what the list looks like when the callsign is the roster's longest, and whether the grid under an
open list of two clashes starts above the middle of the screen (give the pixel).

---

## Share W2 — the passing notes, by the gesture that raises each (phone and desktop)

The app's passing notes were reworded to the owner's approved sentences, and on a phone the note now takes the screen's
width. For each row: make the gesture on the screen's own controls, read `#toastEl` straight after, and compare WORD FOR
WORD — punctuation, capitals and full stops included. Names, days and numbers will be your fixture's; the fixed words
must match. Do each row at the size given; "both" means the phone first, then the desktop.

| # | Size | The gesture | EXPECTED words (your own day / name / number in the marked places) |
|---|---|---|---|
| N-W | phone | Any note from this table, measured: `getBoundingClientRect()` of `#toastEl` | Its left edge is 12 from the screen's left and its right edge 12 from the right (366 wide on a 390 screen); its words are centred; it stands at the foot (its bottom 26 above the screen's foot) when no window is open. |
| N-D | desk | The same note on a desktop | Centred on the screen and only as wide as its words — NOT the screen's width. |
| N1a | both | Edit Schedule: on a weekday of the seed week pick the four sign-off names, then press "Publish day". | `<Day> published and approved` — no full stop, no dash, no capitals on "approved". If a second sentence about OIL follows on your day, report the whole note (see N1b). |
| N1b | phone | Publish Saturday 18 Jul the same way (its Common Programme has no times). | If the note carries the OIL line: `Saturday 18 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL.` — the day named ONCE, with its date. Report the exact note either way. |
| N2 | both | Press "Unpublish" on the day you published in N1a (once; if it asks for a second tap, see N4). | `<Day> unpublished. It is a draft again, and publishing reissues the Original.` |
| N4 | phone | Only if Unpublish asks for a second tap: read the warning it shows. Then tap again and read the note. | The warning: `Some of <Day>’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm.` The note after the second tap: N2's words followed by ` Its OIL credits are withdrawn from the Leave War until it is republished.` |
| N3 | desk | Publish a weekday; change one thing on it (put a different man in one seat); publish the change as AL1; then press "Unpublish". | After AL1 goes out the receipt is unchanged in shape (`Published AL1 · … on <Day> only · approved by …`). After Unpublish: `<Day>: AL1 withdrawn. Its changes are back on the working copy as pending, and Original is the issued schedule. Publishing reissues AL1.` |
| N9 | both | Scheduler Board (tap a day's "board" entry), press "OIL Earn". | `OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning` |
| N11 | phone | In OIL Earn, switch the whole day off with the day's own OIL switch; then on again. | Off: `Nothing on this day earns OIL, including anything added later`. On: `This day can earn OIL again, and the marks underneath are back` |
| N12 | phone | With the day switched off (N11), tap a puck. | `Nothing on this day earns. Turn that off first.` |
| N-L | desk | In OIL Earn, having changed nothing in it, press Undo in the board's bar. | `Left OIL Earn without undoing. The next undo would change the day itself.` |
| N10 | both | Scheduler Board, a Ground Programme row: press its ⓘ; press it again. | On: `This item is info only: no longer checked against the rules, and earns nobody any OIL`. Off: `This item is checked against the rules again and can earn OIL` |
| N-R | phone | The same row's red-box button (■). | `Red box: flagged for the next scheduler` |
| N14 | desk | Add a standby wave ("+ Wave" → SC); on one of its lines press the MAIN / SPARE badge in the remarks cell; press it again. | `Line is SPARE now: standing by, checked for availability and currency only` and `Line is MAIN now: fully cross-checked` (whichever way each press goes). Adding the wave itself: the note begins `SC added: standalone,` |
| N15 | desk | Open a day's issues list and hide one warning with its own control. | `Warning hidden: no flag, not counted. It returns if the warning changes.` |
| N19 | desk | On a flying line with a take-off time, type a brief time EARLIER than take-off, then change the take-off to before that brief. | `The <hh:mm> brief was after the new take-off, so it was removed` |
| N-T | desk | Type `2590` into a time box on the board and leave it. | `2590 is not a time. Try 0900 or 09:00.` |
| N17 | phone | On the phone's Scheduler Board switch to the desktop layout (behind the ⋯). | `Desktop layout: pan sideways to read the whole day` |
| N29 | desk | Quals page, edit mode: remove one qualification column. | `<Column> removed from the LoX. Nobody's record changed. Add it back and the ticks return.` |
| N33 | both | Quals page: press "Add qualifications" in the help line. | The Admin page opens. NO note appears. |
| N24 | desk | Make an Event input for ALL AVAIL on a weekday (the Inputs page's "+ Input", "Several people" → ALL AVAIL). On the Scheduler Board drag a man's puck onto that input's row, or drag the ALL AVAIL puck off it. | If the app refuses: `An ALL AVAIL input can only be changed in its own window. Open it to change who it is for.` Report exactly what it says. |
| N-TOP | phone | Open a day on the Inputs calendar (a window is up) and do something in it that raises a note (add a note, answer an OIL question). | The note is at the TOP of the screen while the window is up, 12 from each side. |

For every other reworded note you happen to raise, report its exact words under "Seen in passing". Do not chase them.

---

## Share W3 — the ✕ in the corner, the question sheets, the OIL question's other forms, the bar under the top bar, the calendar card's name

| # | Size | Do | EXPECTED |
|---|---|---|---|
| X1–X11 | both | Open each of these small windows and measure its head (`.airpop-head`): **X1** the OIL question (file a Training on Sat 18 Jul for one man on the Inputs calendar — `dl-oil.mjs` shows how); **X2** an input's own window (tap any input); **X3** the same window on a CANCELLED input (cancel one first: its CX on the board, or the window's own control); **X4** the "No medical document" question (save a medical input — a downchit — with no document); **X5** the upchit question (save a downchit, then add an upchit date inside its span and save); **X6** the medical-clash question (file a second medical entry overlapping the first for the same man); **X7** the document viewer (attach any small picture to a medical entry, then tap it); **X8** "Jump to a date" (the calendar button beside the week buttons); **X9** the board's cancel-reason dialog (CX on a board row); **X10** the board's "Sort all" dialog; **X11** a day's pop-up on the week (tap a day's heading) or the Traffic window (tap an area). | In every one: the ✕ sits in the head's top-right corner — its right edge within 20 px of the head's right edge — and does not follow the title. Nothing in the head overlaps anything else. **X3:** the red CX mark and its reason stay beside the TITLE, not beside the ✕. **X8:** the Today icon sits just left of the ✕, both at the right. One picture each, at each size. |
| T1 | desk | On each QUESTION sheet you reached (X1, X4, X5, X6, X9, X10), by keyboard only: note where the keyboard is as it opens; press Tab until it comes round; press Shift+Tab from the first control. | X1 (the OIL question): opens with the keyboard on its first answer. The others: on the sheet itself, and the FIRST Tab lands on the sheet's first own control, never on the ✕. In all: the ✕ is the LAST stop before the round starts again; Shift+Tab from the first control goes to the ✕; Tab never leaves the sheet. Every stop shows a cyan ring. |
| O1 | both | File a Duty on Sat 18 Jul AND Sun 19 Jul (one input, two days) for one man. | The question's heading still reads `This input covers 2 non-working days (weekend / PH)`; three answers `All days` · `Only some days…` · `No OIL` sit flat under the sentence with no darker patch or line behind them; the picked one has a cyan edge and cyan words on a dark ground (not a solid cyan fill); `Only some days…` opens a small calendar. Buttons at the foot: `Back` and `Add`. |
| O2 | desk | Open a saved weekend Duty input, change its end time and save. | The question's two buttons read `Back` and `Save`. |
| O3 | desk | Inputs page, the List view: an unanswered weekend input shows an "OIL?" chip — press it. | The question opens; `Back` and `Save`. |
| O4 | both | Make a weekday with two inputs on it a public holiday (Inputs page gear → Calendar → Holidays → add that day). The day's one list of OIL questions opens. Pick Yes on one and No on the other. | Both picked buttons wear the SAME look: a cyan edge and cyan words on a dark ground. Neither is solid cyan, neither is grey-filled. |
| O5 | both | Take a close picture of the upchit question's (X5) and the medical-clash question's (X6) answer buttons, and report the computed `background-color`, `padding` and `border-bottom` of the element that wraps each pair (`.seg`). | (No PASS / FAIL — a record for the owner: say whether a darker strip or a line shows behind the buttons.) |
| B1 | both | On the Inputs calendar (the month), drag the X1 input's bar from Sat 18 Jul to Sun 19 Jul; when the OIL question comes up, press its left-hand button. | A bar reading `Not moved — OIL not answered` with `Answer OIL` and `OK` appears as ONE amber line directly under the app's top bar, edge to edge, 36 px tall; the page below it has moved down (nothing is under the bar); the input has not moved. |
| B2 | phone 390, 360 and 320 wide | With that bar up, measure it at each width (re-size the page; give it a moment). | At every width: the words and both buttons are on ONE line; no word is cut or ends in "…"; nothing sticks out of the bar. (At the narrow widths its letters may be a little smaller. Report their size.) |
| B3 | desk | With the bar up: where is the keyboard? Press Tab; Shift+Tab; then Escape. | The keyboard is on `Answer OIL` as the bar appears; Tab goes to `OK`; Escape (with the keyboard on the bar) closes the bar. The input still has not moved. |
| B4 | both | Raise the bar again; press `Answer OIL`, pick an answer, press the right-hand button. | The question comes back; after the answer the move is made and the bar is gone. |
| B5 | desk | Raise the bar again; go to another page (Quals) and back. | The bar is gone and the top bar is its usual height. |
| K1 | phone | Open the app's date calendar from each of these boxes and read the line of small capitals at the top of the card: Calendar window → a weekday's heading → "Every <weekday>" → **From**, and **Until → A date**; Admin → Users → add a person → **Post in**; a medical input's **Upchit date**; the Tracker's side panel: **Last Flown (Syllabus)**, **Upchit Date**, **End date A**; the Tracker's marking pop-up (tap an event): **Done on**, **Failed on**. | The card's first line names its box: `FROM`, `UNTIL`, `POST IN`, `UPCHIT DATE`, `LAST FLOWN (SYLLABUS)`, `UPCHIT DATE`, `END DATE A`, `DONE ON`, `FAILED ON` — one line, above the month's title, the same height on every card. |
| K2 | desk | Open the same calendar from "From" on a desktop. | No such line: the small panel hangs under its own box. |

**If the calendar's drag (B1) cannot be made at a size after three tries:** raise the bar the way `scripts/handpass/dl-oil.mjs`
does — a drag of one man's puck onto another's on the Scheduler Board, then the question's left-hand button — and press
the board's "Done": the bar stays and is then under the app's top bar on Edit Schedule (its words are then `Not swapped
— OIL not answered`). Say in your report which way you raised it.

Seen in passing: anything in a window's head that looks displaced since the ✕ moved; any bar or note lying over a
control.
