# The walk brief — the OIL question before the change; the one list; the holiday's bell line (`[OIL-ASK-NOTIFY]`) — 13 Oct 26

One walker, one share, your own browser worlds (D16, D588). You DRIVE THE REAL BUILT APP in a scripted real browser and
report what the screen said — pictures and a filled table. You do not review code, you decide nothing, you fix nothing.

*(This brief is handed, word for word, to five walkers working apart. Your letter and your share are named in the
message that gave you this brief. Walk exactly your share. Never open, list or read another letter's files.)*

**The served build:** `http://localhost:4231/` — one static server for everyone, FROZEN. Before your first step check
its page loads **`assets/index-Bv5bvisT.js`** (`curl -s http://localhost:4231/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'`);
STOP and say so if it does not. Each of your browser contexts is its own world (its own storage).

## Three conditions on every walker (the checking guide's §4, D588)
1. The host opens the pictures behind every FAIL and every PASS that touches OIL, a published day, a role or saved
   data — so save a picture for each step and name it in your table.
2. A scenario with an EXPECTED line is judged **PASS or FAIL** against it. "RECORD" is only for a line this brief marks
   RECORD (say what you saw, judge nothing). A setup you cannot reach through the app's own controls is **NOT WALKED**
   with the reason — never a pass. Walked in part is **PARTIAL**, with what was left.
3. Your conclusion is a finding only after the host reproduces it — so give exact steps a person could repeat.

**About the words:** where an EXPECTED line puts words in quotes, those are the words the build was written to show.
Write down the EXACT words you saw. A sentence that means the same in other words is a PASS with the words noted; one
that means something else, names the wrong person, or is missing, is a FAIL.

## What the app should now do (read once)
OIL is time off a person earns for work on a weekend or a public holiday. An input (a Training, a Meeting, a Duty…)
that falls on such a day carries ONE OIL answer for everyone in it: Yes (FO — a full day, or HO — a half day, worked
out from its hours) or No. Its card wears a small "OIL?" tag while it has no answer.

- **The question comes FIRST.** On a weekend or holiday, when a scheduler (the admin) puts a person on an input's row
  of the schedule's Ground Programme in a way that needs an OIL answer nobody has given, NOTHING is changed: the OIL
  question opens by itself with a bold first line saying what is waiting, and the change is made only when it is
  answered. Three kinds:
  - a **swap** — a man dragged from a seat elsewhere onto the puck of an input's ONLY person ("Swapping Tally and
    Ranger"; buttons "Don’t swap" / "Swap"), or a man from the crew list put on that puck ("Putting Tally in place of
    Ranger" — the same buttons). It always asks on such a day, even where the first man had answered: his answer was
    his own;
  - an **add** — a person put on "+ add", or on a puck of a row that holds several, where the input has NO answer yet
    ("Adding Tally to Range brief"; "Don’t add" / "Add");
  - a **move** — a person dragged from one input's row onto another's whose input has no answer yet ("Moving Tally to
    Range brief"; "Don’t move" / "Move").
  The right-hand button is greyed until Yes or No is picked. No window of the input opens behind the question.
- **Answered** → the change AND the answer are made together: ONE Undo step takes back both. The puck flashes where it
  landed; the note says what happened ("Tally and Ranger swapped", "Tally added to Range brief", with "— not counted
  for OIL" after a No).
- **Not answered** (the left button, the ✕, Escape, a press outside) → nothing is changed, no Undo step, nobody is
  told, nothing new waits to go out on a published day. Both pucks flash where they stand, and **a bar stays** at the
  bottom until tapped: "Not swapped — OIL not answered" / "Not added — OIL not answered" / "Not moved — OIL not
  answered", with **Answer OIL** (the question comes back; if the row has changed meanwhile it says "That row has
  changed — not swapped" and closes) and **OK** (it only closes). The bar goes when the week, the page or the sign-in
  changes. It does not go by itself after a few seconds.
- **Asks nothing, the change is made at once, as before:** a working day; an input whose answer is already Yes or No
  when a person is ADDED or MOVED in (after a No the note ends "— not counted for OIL"); a kind that never earns
  (Personal, leave, medical); a puck taken OFF a row; a time or a remark typed on the row.
- **Refused before any question:** a change the app would refuse anyway (a man already on the input, ALL AVAIL on an
  input longer than a day, a man on leave that day…) is refused in its own words and NO question is put.
- **The same rule at two more doors:** a person dragged (or armed-and-tapped) onto another man's row of the
  **Unavailable** list on such a day ("Not swapped"), and an input dragged to another date on the **Inputs calendar**
  onto a weekend or holiday ("Not moved") — the question first, the change only on an answer.
- **A day made a public holiday AFTER inputs already stand on it** (Inputs ⚙ → Calendar… → Holidays → + Add; or the
  Leave War's Event row; or an event TYPE re-tagged as a holiday): **the ONE list** opens by itself for the admin who
  made it — a window titled "OIL — Fri 17 Jul", "Public holiday · National Day" under it, the line "National Day is now
  a public holiday.", then one card for every input of that day that needs an OIL answer, each with "Yes · FO" (or
  "Yes · HO") and "No" (a second press un-picks; a chosen No is quiet grey), the count ("4 to answer" / "3 of 4
  answered"), "Yes to all", "No to all", the line "What is left goes to the schedulers’ bells", **Later** and **Save**
  (greyed until something is picked). Save writes the picked answers in ONE Undo step and closes; Later, ✕ and Escape
  write nothing. A tap on a card's name opens that input's own window. The list is a window that does not block the
  page behind it.
- **The bell:** every scheduler — every person with an ADMIN sign-in, the one who made the holiday included — gets ONE
  line on the bell for the holiday: its name in bold, its day, then "4 inputs need an OIL answer · Saber" (who made
  it), counting what is LEFT, read live ("1 input needs an OIL answer"). An unread line lights the bell. A tap on the
  line opens the one list (without the "is now a public holiday" line), closes the bell's list and reads the line.
  When nothing is left the line is gone for everyone and lights no bell — never "0 inputs". Answering in the list
  tells nobody. A member, a guest and a man who is merely IN a shared input get no holiday line. The holiday's Undo
  takes the line away; its Redo brings it back, unread. A holiday removed leaves no line; made again, ONE line.
- **A published day:** nothing reads pending and no sign-off falls until an answer is given. Declaring a holiday on a
  published day moves no pending count by itself.
- **Tells nobody and opens nothing:** a holiday with no input that needs an answer; an Off day; a holiday put on a
  Saturday or Sunday (already a day that asks).
- **A scheduler is always an admin (the owner's word, D785).** Never set up or report on a person who schedules
  without being an admin. A second scheduler is a second ADMIN sign-in: the demo has one (Saber, `ad` / `a`), so give
  **Warden** one on Admin → Users first, as the worked example does (`oilnotify-look.mjs`, "A SECOND SCHEDULER").
- **NOT a finding (D56):** harm that lives only in data stored before this build when the app is right going forward.
- **The demo:** the loaded week is Mon 13 – Sun 19 Jul 2026 (Sat 18 and Sun 19 ask the OIL question; Fri 17 is a
  working day that already holds one overseas duty of the demo's own). `ad` / `a` is the admin and scheduler **Saber**;
  `us` / `us` the member **Ranger** (person id `bane`); Tally is `nick`, Warden `nact`. Other callsigns: Hex, Grit,
  Drifter, Hunter, Anvil, Blade (read `window.PEOPLE` for ids; use another if one is not on the crew list). **The PC's
  date is 13 Oct 2026**, so set the browser's clock three weeks before the week and let it RUN:
  `await page.clock.install({ time: new Date('2026-06-22T09:00:00') })` before the page loads (never a frozen clock —
  two filings at the same instant confuse the app).

## Hard rules — the method
**Every rule under "## Hard rules" in `raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-walk-brief.md`
applies here, word for word** — read that section whole before you start (read-only on the app; your own files only;
scripts written with the Write tool and run as files; every fixture through the app's own controls; a step asserts
what a person SEES; a gesture is driven for real — a mouse drag is `mouse.down / move in steps / up`, a finger is a
real touch sequence; every picture OPENED with the Read tool before its step counts; the error list watched). With
these names in place of its own (`<L>` is your letter):
- **Your own files only:** scripts `raptor-port/scripts/handpass/on-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-13-oil-ask-notify/<L>/`; your report `raptor-port/docs/handpass/parts/on-<L>.md`
  and its data `raptor-port/docs/handpass/parts/on-<L>.json`. Change NO other file. Never run a build, `npm test`,
  Playwright's own test runner, a dev server or any git command that changes anything. Run ONE script at a time.
- **Run node from `C:/Users/User/projects/Raptor/raptor-port`** — `cd` there by its full path inside every command;
  point every script at `http://localhost:4231/` (never another port). Send long output to a file and read the file.
- **A new script launches the browser the repo's way:** `const CHROMIUM = process.env.CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium'` and `chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})`.
- **Signing in:** `#luser` / `#lpass` / `#loginForm button[type=submit]`; `#vWeek .day` is the "week is up" signal.
  Open the address with `?fresh=1` for a clean memory-only world — and WITHOUT it (a new browser context is clean
  anyway) for any scenario that reloads the page or signs in as a second person: a fresh world keeps nothing across a
  reload. **Never sign in again, or reload, on a world nobody has written to yet** — make one saved change first.
  **Undo's list clears at sign-out**, so "Saber does X, Warden looks, Saber presses Undo" in one world changes person
  IN PLACE: `window.raptorMe(<person id>)` (and `window.raptorRole('member' | 'admin')` for a role) through
  `page.evaluate` — these change only who is signed in. If that loses the Undo list, say so — NOT WALKED, with why.
- **THE worked example — read it whole before your first script, copy from it, never run or edit it:**
  `scripts/handpass/oilnotify-look.mjs`: opening a signed-in world with the clock set; filing an input through the
  Inputs calendar's day window and answering its own OIL question (`fileIt`); a plain row typed on the Scheduler
  Board; a real mouse drag of one puck onto another; the question's and the bar's test ids (`oilconf`, `oilconf-lead`,
  `oilconf-cancel`, `oilconf-save`, `oil-yes`, `oil-no`, `oilbar`, `oilbar-text`, `oilbar-answer`, `oilbar-ok`); giving
  Warden an admin sign-in; making a holiday on the Holidays list; the one list's test ids (`win-oilday`, `odl-lead`,
  `odl-count`, `odl-yes-<input id>`, `odl-no-<input id>`, `odl-yesall`, `odl-noall`, `odl-left`, `odl-later`,
  `odl-save`); the bell (`.bellbtn`, `bell-list`, `.bl-line`). **One SETUP shortcut it uses is allowed to you too, and
  only this one:** `window.fillSlot(...)` then `window.afterSchedMutate()` to put a man on a PLAIN programme row (a
  row that is not an input's) as background. Everything a scenario TESTS is done by its real gesture.
- **Other worked examples, read the ones your share needs:** `gi-w1-lib.mjs` (mouse drags on the week and the board,
  the crew list, Undo / Redo, reading a row), `gi-w2lib.mjs` (a phone by touch — long-press, arm a place and tap the
  crew list), `gi-w3-lib.mjs` (signing a day's four boxes and publishing it, the pending count, the changes window,
  loading an older version), `onerule-step7-look.mjs` (the bell, a second person in one page life, the Scheduler
  Board's own bell), `lib.mjs` (the OIL Earn mode), `or-L-lib.mjs` and `or-J-lib.mjs` (the Leave War's sheets and the
  Unavailable list). `docs/handpass/README.md` lists the traps that cost an hour (the board is drawn twice — scope
  every board selector `:visible`; "Publish day" is drawn five times; a publish is refused while the day has hard
  conflicts).
- **Reading, never writing:** `window.INPUTS`, `window.PEOPLE`, `window.DAYS` through `page.evaluate` only to READ.
- **After every scenario** read the same facts on screen AND in `window.INPUTS` (the input's `oil`, its people). Where
  a line says "U/R": press Undo once (everything back as before), Redo once (as after). Where it says "reload":
  reload the page (a world written to, not `?fresh=1`) and read again.
- **Sizes:** a desktop is 1440 × 900 with a mouse; a phone is 390 × 844 by touch (`isMobile: true, hasTouch: true`);
  the short screens are 390 × 568 and 844 × 390 by touch. Only the sizes your share names.
- **Every bar, question and list you see is MEASURED once per surface:** its box is inside the screen, and the thing
  under its centre is itself (`const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left +
  r.width / 2, r.top + r.height / 2); hit === el || el.contains(hit)`). Say the numbers.
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- You are not told whether anything is wrong with this build. Report what the screen did.

## Your report (`parts/on-<L>.md`)
A head line (who, what size, how each world was made), then one table row a scenario or mark:
`# | what I did (the real gesture) | what the screen said and showed (exact words) | what window.INPUTS said | Undo / Redo / reload | PASS / FAIL / PARTIAL / NOT WALKED / RECORD | picture(s)`,
then: the count; "Browser errors seen"; "Could not do, and why"; "Seen in passing" (anything odd that is not your
scenario — say it, do not chase it). Your final message to the host: the count, each FAIL in two lines with its steps,
the list of NOT WALKED, and how many tokens you used if you can tell. Do not paste the table into the message.

---

# The scenarios (designed by a reader who did not build the code; S-numbers are its own)

"The usual Saturday" = on Sat 18 Jul 26 (unpublished): a Training "Range brief" 09:00–12:00 filed for Ranger alone
with its OIL question answered Yes, and a plain programme row "Hangar open day" 13:00–15:00 with Tally on it — exactly
as the worked example builds them.

## Share A — the hands on the Scheduler Board and Edit Schedule's week, desktop 1440 × 900
- **A1 (S1).** The usual Saturday, on the Scheduler Board. Drag Tally's puck onto Ranger's. Pick nothing; press
  "Don’t swap". EXPECTED: the question first, with "Swapping Tally and Ranger"; then both pucks flash, the bar "Not
  swapped — OIL not answered", nobody moved, the Undo button exactly as before, Range brief's answer unchanged, no new
  bell line for anyone. Then open OIL Earn for Saturday (as `lib.mjs` does) and RECORD who it credits.
- **A2 (S2).** The same, then the bar's "Answer OIL" → Yes → "Swap". EXPECTED: Tally on Range brief, Ranger on Hangar
  open day; the landing flash; "Tally and Ranger swapped"; the input's card (Inputs calendar, Sat 18) names Tally and
  wears no "OIL?"; ONE Undo puts both men and the first answer back; Redo; reload: as after the Redo. In OIL Earn,
  Tally's puck on Range brief is credited (RECORD the words, "HO" or "FO").
- **A3 (R2 — the week).** A new world; the usual Saturday; do A1 and A2 on **Edit Schedule's week** (not the board):
  the drag from Tally's puck to Ranger's on Saturday's Ground Programme. EXPECTED as A1 and A2. Measure the bar and
  the question over the week.
- **A4 (S6, R3).** Edit Schedule's week: drag a man from the crew list (not on any Saturday row) onto Ranger's puck on
  Range brief. EXPECTED: the question with "Putting <him> in place of Ranger", "Don’t swap" / "Swap"; cancelled: the
  bar, nothing changed; answered Yes: he is on the row, and Ranger is OFF the schedule that day (on no row). The same
  once on the Scheduler Board from its crew list.
- **A5 (S7, R8).** File a one-day Training on Sat 18 for Ranger and answer its own OIL question… you cannot leave it
  unanswered at the save, so make the unanswered input this way: file a Training for Ranger on Fri 17 Jul (a working
  day asks nothing), then make Fri 17 a public holiday (the Holidays list) and press **Later** on the list. Now on
  Fri 17's row drop **ALL AVAIL** (the crew list's placeholder puck). EXPECTED: the question ("Adding ALL AVAIL to …",
  "Don’t add" / "Add"); Yes → added. Then the same with a Training that runs Fri 17 – Sat 18 (two days), unanswered:
  EXPECTED: refused, "ALL AVAIL is for one day" (or words that mean it), and NO question first.
- **A6 (S8).** Give a man leave (LL) on Sat 18 Jul (file it as an input for him). Drop him on a Saturday DUTY desk
  row. EXPECTED: refused by the leave rule in its own words, no question. Then drop him on Range brief's "+ add" where
  Range brief has no answer (made as in A5 on the Friday holiday, with his leave on that Friday): RECORD what the app
  says — refused with no question, or the question.
- **A7 (S9).** An input on Sat 18 answered **No** (file it and pick No). Drop Tally on its "+ add". EXPECTED: no
  question; added; the note ends "— not counted for OIL".
- **A8 (S10, R7).** Two unanswered inputs on the Friday made a holiday (as A5, two Trainings, "Later"), Ranger in the
  first with a second man, Tally and another in the second. Drag Ranger's puck from the first row onto the second's
  "+ add". EXPECTED: the question "Moving Ranger to <second>", "Don’t move" / "Move"; "Don’t move": he is still in the
  first, the bar "Not moved — OIL not answered"; "Answer OIL" → Yes → "Move": he is out of the first and in the
  second, the second has its answer, ONE Undo puts all back.
- **A9 (S11).** A1 up to the bar. Then delete the "Hangar open day" row (the board's ✕ on the row) — or take Tally off
  it. Press "Answer OIL". EXPECTED: "That row has changed — not swapped", the bar closes, nothing written.
- **A10 (S12).** A1 up to the bar. Make an unrelated change (type a remark on another row), press Undo once. Press
  "Answer OIL". EXPECTED: the question opens again for the same swap; answer it: the swap is made.
- **A11 (S13).** A1 up to the bar. Step to the next week and back: EXPECTED the bar is gone. Again up to the bar; go
  to another page (Inputs) and back: gone. Again; sign out and in: gone. And once: leave the bar up for 30 seconds
  doing nothing: EXPECTED still there.
- **A12 (S35 — RECORD).** The usual Saturday plus a second answered input with one man and a second plain row with
  another man. Start the first swap, "Don’t swap" (the bar is up). Without touching the bar, start the second swap on
  the other row and "Don’t swap". RECORD: what the bar says and which swap "Answer OIL" now offers.
- **A13 (R12, R13 — must NOT ask).** On the usual Saturday: type a new time and a remark on Range brief's row;
  right-click a puck off a row that holds two; drag a puck off a row to nowhere. EXPECTED: no OIL question, no bar;
  each change made at once.
- **A14 (R14 — the bar under a window).** A1 up to the bar on the week; open the changes window (the top bar's clock)
  and the Inputs day window if it can be opened over the week. RECORD with a picture which is in front where they
  overlap, and whether "Answer OIL" and "OK" can still be pressed.

## Share B — a phone by touch (390 × 844) and the short screens (390 × 568, 844 × 390)
- **B1 (S4).** 390 × 568, the usual Saturday on the Scheduler Board: a TOUCH drag (long-press, move, lift — the
  worked `gi-w2lib.mjs`) of Tally's puck onto Ranger's. EXPECTED: the question; it fits or scrolls, "Swap" can be
  reached and is greyed until a pick; "Don’t swap": the bar inside the screen, on top, its two buttons side by side
  and tappable; "Answer OIL" → Yes → "Swap": made. Measure the question and the bar. If a touch drag from seat to
  seat does not exist on a phone, say so and do it by the armed tap.
- **B2 (S5, R5).** 390 × 844. Make an unanswered input (Share A's A5 recipe: a Training on Fri 17, the Friday made a
  holiday, "Later"). On the phone's week tap its "+ add" (it arms; the crew drawer opens); tap Tally in the drawer;
  when the question opens press Escape or its ✕. EXPECTED: "+ add" is STILL armed, the drawer still open, the bar "Not
  added — OIL not answered"; nothing written. Tap Tally again → No → "Add". EXPECTED: "Tally added to … — not counted
  for OIL", the place no longer armed, the drawer put away. Then the same armed tap ONCE on a desktop (click "+ add",
  click a crew-list name).
- **B3 (R5 — the swap by armed tap).** 390 × 844, the usual Saturday: tap Ranger's puck on Range brief to arm it, tap
  a man in the drawer. EXPECTED: the question "Putting <him> in place of Ranger"; cancel: still armed, the bar "Not
  swapped — …"; answered: made, disarmed.
- **B4 (S31 — the short screens).** At 390 × 568 and again at 844 × 390: make four inputs on Fri 17 and the holiday
  (the worked example's "ON_FRI", plus one more), so the one list opens. EXPECTED: the list no taller than the screen,
  its cards scroll inside it, "Later" and "Save" reachable and tappable without the page scrolling under them; "Yes to
  all" reachable. Then the bell's list at both sizes: inside the screen, its line tappable. Then the bar and the
  question (B1's steps) at 844 × 390: both inside the screen, every button reachable. Measure each.
- **B5 (R20).** 390 × 844: after "Later", sign in place as Warden; the bell is lit; open it; the line; tap it: the one
  list opens over the phone's page; answer one with Yes and Save; the bell's line counts one fewer.
- **B6 (S14 by touch, R9).** 390 × 844: the demo has an overseas duty under Unavailable — find a weekend day that has
  a person's row under Unavailable on the week, or file an OD (overseas duty) for Ranger on Sat 18 (its own OIL
  question, if it asks one, answered Yes). Arm Ranger's Unavailable row and tap Hex in the drawer. EXPECTED: if that
  kind asks the OIL question on that day — the question first, cancel → "Not swapped — OIL not answered" and Ranger
  still there; answered → Hex, one Undo. If the kind never asks OIL: the swap is made at once (say which kind you
  used and what happened). Try a second kind if the first never asks (a Course, a Duty that shows under Unavailable).

## Share C — published days, the Unavailable row and the Inputs calendar's drag, desktop 1440 × 900
- **C1 (S3).** The usual Saturday; sign Saturday's four boxes and publish it (`gi-w3-lib.mjs`). Drag Tally onto
  Ranger's puck; "Don’t swap". EXPECTED: the day reads nothing pending ("0 pending" or no pending mark), all four
  sign-offs still stand, the changes window's "To go out" has no new line. Then "Answer OIL" → Yes → "Swap".
  EXPECTED: "1 pending", the sign-offs fall, ONE line in "To go out" for the swap. View-only Sched still shows
  Ranger on Range brief (what went out). U/R; reload.
- **C2 (S14, R9 — the drag).** Desktop week. As Share B's B6 but with the MOUSE: drag Hex's puck (from the crew list,
  then once from a seat) onto Ranger's row under Unavailable on a weekend day, for a kind that asks the OIL question
  (find one: try OD, a Course, a Duty — say which ask). EXPECTED: the question first; cancel → "Not swapped — OIL not
  answered", both flash, nothing changed; answered → Hex holds it, one Undo.
- **C3 (S15, R10 — the member's calendar drag).** Sign in as the member `us` (Ranger). File a Meeting for himself on
  Wed 15 Jul 10:00–11:00. On the Inputs calendar's MONTH drag its chip from Wed 15 onto Sat 18. EXPECTED: the
  question first ("Don’t move" / "Move"); "Don’t move": the bar "Not moved — OIL not answered" on the Inputs page,
  the chip flashes where it WAS (Wed 15), nothing moved; "Answer OIL" → Yes → "Move": a note that it moved to Sat 18,
  the input answered, one Undo. Then the same with a two-day input, whose month drawing is a BAR across two days:
  drag the bar so it lands on Sat 18. EXPECTED the same; say whether the BAR flashes when not answered (picture taken
  within 300 ms of "Don’t move"). Measure the bar over the Inputs page.
- **C4 (the admin's calendar drag).** As Saber: drag another person's weekday Training onto Sun 19. EXPECTED: the
  question first, as C3. Drag a weekday input onto another WEEKDAY: no question, moved at once.
- **C5 (S32, R24 — a published Friday made a holiday).** File two inputs on Fri 17 (a Training for two, a Duty for
  one); sign and publish Friday (Friday is the clean weekday). Note the pending count and the four sign-offs. Make
  Fri 17 a public holiday on the Holidays list. EXPECTED: the list opens; the pending count and the sign-offs have
  NOT changed by the declaring alone (RECORD exactly what the day head says — an older ruling may make the day say a
  holiday was declared after it went out; write the words). Answer one input Yes in the list and Save. EXPECTED: the
  day now reads pending with ONE line for that answer in "To go out", and the sign-offs fall. View-only Sched keeps
  what went out. Reload: the same.
- **C6 (S30 — a locked week).** Publish Friday as C5 with one input on it. Load an OLDER version of the week so the
  week is locked / read-only (`gi-w3-lib.mjs` shows loading an older version; say exactly how you made the week
  locked). Make Fri 17 a holiday. EXPECTED: no list opens and no bell line is made for a day of a locked week. If you
  cannot make a locked week through the app's controls, say NOT WALKED with what you tried.
- **C7 (R23 — the downstream OIL figure).** A Friday made a holiday with a Training for Ranger and Tally on it;
  answer it Yes in the one list; Save. Sign and publish Friday. Then read: OIL Earn for Friday (who is credited, how
  much), and the Leave War's OIL figures for Ranger and Tally (the Leave War page's OIL tracker — RECORD the earned
  figure before the holiday and after the publish). EXPECTED: both men credited for that Friday once the day is
  published; nothing credited for an input answered No.

## Share D — the holiday, the one list and the bell, desktop 1440 × 900 (one check each on a phone where named)
Give Warden an admin sign-in first in every world that needs a second scheduler.
- **D1 (S16).** Four inputs standing on Fri 17 (the worked example's three plus the demo's own); Holidays list → + Add
  "National Day" on Fri 17. EXPECTED: the list opens by itself, "National Day is now a public holiday.", "4 to
  answer", Save greyed; measured inside the screen and on top.
- **D2 (S17, R22).** Yes on two, No on one. EXPECTED: "3 of 4 answered", the No in quiet grey; Save → ONE Undo step
  (press Undo: all three answers gone, the list's inputs unanswered again; Redo: back); the fourth input's card on the
  Inputs calendar still wears "OIL?" and the three do not; Saber's own bell line reads "1 input needs an OIL answer ·
  Saber"; open OIL Earn on Friday and RECORD what it shows for the three.
- **D3 (S18).** A new world; the same four; "Yes to all" → Save. EXPECTED: no holiday line on Saber's bell or on
  Warden's; neither bell lit by it; never a line "0 inputs".
- **D4 (S19, S26).** A new world; the same four; **Later** with nothing picked. EXPECTED: nothing written; SABER's
  own bell is lit, the line unread, a tap on it opens the list; then as Warden: bell lit, "4 inputs need an OIL
  answer · Saber"; tap the bell → its list → tap the line → the one list WITHOUT "is now a public holiday"; answer all
  → Save: the line is gone for Warden AND for Saber. It must never say "That input is gone".
- **D5 (S22 — a run of two days).** A new world. On the Holidays list add a holiday that runs Thu 16 – Fri 17 Jul,
  with one Training covering both days (Thu 16 – Fri 17) and one Meeting on Fri 17 only. EXPECTED: ONE list titled
  for the run ("Thu 16 – Fri 17 Jul" or the app's own way of writing a run), two cards; Yes on the first writes an
  answer for BOTH its days (read `window.INPUTS`), and ONE bell line for the run.
- **D6 (S23 — Undo and Redo of the holiday).** D4's state after "Later" (four unanswered; Warden's line unread).
  Answer ONE in its own input window (open the input, answer its OIL question there). Then as Saber press Undo until
  the HOLIDAY itself is undone (say how many presses, and what each took back). EXPECTED: Fri 17 is a working day
  again, the holiday line is gone from every scheduler's bell. Redo the holiday. EXPECTED: the line is back, UNREAD,
  counting what is still unanswered. RECORD what happened to the one answer given in between.
- **D7 (S24).** Remove the holiday on the Holidays list: EXPECTED no line on any bell. Add it again (same day, same
  name): EXPECTED ONE line, not two.
- **D8 (S28 — the count falls live).** The list open as Saber with four. Without closing it, open one input in its own
  window (a tap on a card's name opens it — R8) and answer its OIL question there; close that window. EXPECTED: the
  list now shows three, "3 to answer". Pick one and Save: only that one is written (two left on the bell).
- **D9 (S29).** The list open with a pick made on one card; delete that input (its own window's delete) behind the
  list. EXPECTED: its card goes from the list; Save writes nothing for it and shows no error.
- **D10 (S33 — Mark all read).** Warden's bell with a live holiday line (two left): open the bell's list, "Mark all
  read". EXPECTED: the line stays listed, muted, while anything is left; the bell is no longer lit by it.
- **D11 (S34 — reload).** After D2 (three answered, one left) and after D4's "Later": reload the page. EXPECTED: the
  answers, the bell line with its count and its read / unread state all come back; the Undo button is empty.
- **D12 (the list's own doors).** In the list: ✕ and Escape write nothing (as Later); a second press on a picked Yes
  un-picks it and the count falls; "No to all" then one Yes: the count and the colours; drag the window by its title
  and use the page behind it (open another day) — the list stays up and the page works.
- **D13 (R19 — the Scheduler Board's own bell).** After a "Later" as Saber, open the Scheduler Board for any day as
  Warden. EXPECTED: the board's own bell is lit; its list opens over the board (measured on top, inside the screen)
  with the holiday line; a tap opens the one list over the board.

## Share E — the other doors that make a holiday, and who is told, desktop 1440 × 900
- **E1 (S20, R17 — the Leave War's Event row).** Three inputs on Fri 17. Go to the Leave War page. On its Event row
  for Fri 17 open the day's sheet, choose the public-holiday preset ("PH") for "This day", and save. EXPECTED: the one
  list opens OVER the Leave War page at once (not only after going to another page) — measured on top and inside the
  screen — with the holiday's line; "Later"; a second scheduler's bell has its ONE line. Then, in a new world, the
  same by TYPING a word on the Event row if the row takes typing (RECORD what word makes a holiday and what happened),
  and by a band over several days if the sheet offers one.
- **E2 (S21 — an event TYPE re-tagged).** The Leave War's "Edit types" (the event types): find or make a type (for
  example "SC") that is NOT an off day, put it on Thu 16 and on Tue 14 – Wed 15 (a run) with inputs standing on those
  days, then re-tag the type as a holiday / off day in Edit types. EXPECTED: a bell line for each day or run that now
  asks — one line a run; never silence. RECORD exactly which kinds of day the editor offers (public holiday, off
  day…) and what each did: an OFF day is expected to tell nobody.
- **E3 (S25, R21 — who must NOT be told).** A Training on Fri 17 filed by the MEMBER Ranger for himself and Hex; a
  second input by Saber for Tally. Saber makes Fri 17 a holiday and presses "Later". EXPECTED: Ranger (signed in as
  `us`): his bell is lit by his OWN input's OIL question as before (a tap goes to that question), and his bell's list
  has NO holiday line. Hex (in the input, did not file it — sign in place as Hex with the member role): no holiday
  line. A guest (the sign-in page's guest way in, if it has one — say how): no bell line, no list.
- **E4 (S27 — a NEW input on the holiday afterwards).** After the holiday is made: as Ranger file a new Meeting on
  Fri 17. EXPECTED: asked the OIL question at the save, as on a weekend. As Saber, add an input on Fri 17 from the
  Scheduler Board's own "+ Input" (or the board's Personal Inputs panel): asked in its window.
- **E5 (a member cannot open the list).** As Ranger, look for any way to open the one list (his bell, his input's
  card, the Inputs calendar). EXPECTED: none; his own input's question is answered in its own window only.
- **E6 (tells nobody).** (a) Make a holiday on a Friday with NO inputs on it: no list, no bell line. (b) Make a
  holiday on Sat 18 with inputs on it: no list, no line (a Saturday already asks). (c) On the Calendar window's Month
  tab set a weekday to "NF · no fly" with inputs on it: no list, no line (a no-fly day is not a holiday).
- **E7 (a holiday CHANGED onto new dates).** Three inputs on Thu 16. Add a holiday on a day with no inputs (Tue 14);
  then change that holiday's date to Thu 16 on the Holidays list. EXPECTED: the list opens for Thu 16 and the bell
  line names Thu 16.
- **E8 (the admin's own member view).** As Saber after a "Later": switch to the member view (the admin's "view as
  member" switch) — EXPECTED: no holiday line and no list while it is on; switch back: the line again.
