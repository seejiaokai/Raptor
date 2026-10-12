# The walk of `[ONE-DATE-CALENDAR]` step one — the walkers' brief (13 Oct 26)

You are one of three walkers. You DRIVE THE RUNNING APP in a real browser, as a person would, and report what the screen
did. You do not read the app's code to find bugs, you do not decide whether a finding is real (the host reproduces
every one), and you change no file of the app.

## What was built (in the app's own words)

- **The app's own date box.** Wherever a date is one box on a form, the box is now a button that reads its date in
  words ("Thu 5 Nov 2026"; "Pick a date" when empty). A tap opens **the app's own calendar** floating over the form:
  a title ("November 2026" with a small arrow), a Today icon right of it, two arrows at the far right, MON … SUN, the
  dates as round discs in six rows. **A tap on a date picks it and the calendar goes.** There is no tick and no Reset.
  A tap on the title swaps the dates for two scrolled lists — months beside years; a tap on the title again brings the
  dates back. The Today icon goes to today's month and picks nothing. A tap outside the calendar closes it and changes
  nothing. On a phone the calendar sits in the middle of the screen; on a desktop it is a small panel under its box.
- **Where:** "Every <weekday>" (From, and Until's "A date") in the Calendar window; a new person's **Post in** on
  Admin → Users (Add a person, Restore, Give access); Admin → Data's "Older than" and "A specific date", and its "A date
  range" — which is ONE calendar drawn in the form itself (two taps make the run, said in words under it); a medical
  input's **Upchit** date; the Leave War's posting dates ("PO from", "PI from").
- **The swipe.** In the Calendar window on a phone, a finger slid sideways on the month goes to the next month (left) or
  the last (right); on the Holidays list, the year. It must work anywhere on the month or the list and must never press
  a date's button. The arrows and "Today" stay. A mouse is untouched.

## Read first

`raptor-port/docs/walk-scripts.md` §3 to §7 — how a walk script is written. It is short; every line is a trap that
cost a walk.

## The machine, and its traps

- **The build is already served: `http://localhost:4187/`.** Do NOT build, do NOT start or stop any server, do NOT run
  the app's tests. Drive that address with Playwright scripts of your own (`@playwright/test` is installed: import
  `chromium` from it and run your script with `node` from `raptor-port/`).
- **A script is written to a file with the file tool and run from there** — never passed inline to the shell (an
  apostrophe fails to parse, backslashes are lost). A rewrite and its run are two steps. Print a version line at the
  top of every run. Write scripts only in YOUR scratch folder (below), never under `raptor-port/src` or `raptor-port/e2e`.
- **Sign in:** `#luser` / `#lpass` / `#loginForm button[type=submit]`; admin is `ad` / `a` (Saber), a member is `us` /
  `us` (Ranger). `#vWeek .day` attached means the app is up. Move between pages with `window.go('inputs' | 'admin' |
  'leavewar' | …)` or the app's own tabs. On the Leave War an admin's view is `window.lwSetRole('admin')`.
- **A fresh browser context per scenario group** (a new context is a clean world; never use `?fresh=1` for something
  you will reload). A phone is `{ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }` and is driven by
  `locator.tap()`; a desktop by `click()`.
- **The clock is left running.** Do not freeze it.
- **A WORKING RECIPE for every route** is `raptor-port/scripts/handpass/odc-look.mjs` — the host's own look: how each
  date box is reached, how the calendar is measured (`cardOnTop`), how a real finger swipes. Copy from it; do not edit it.
- **THE SWIPE TRAP.** A scripted finger must REST about 90ms before it lifts, as that script's `swipe()` does. A swipe
  that lifts at full speed makes this test browser swallow the NEXT tap, seconds later — that is the browser, not the
  app. If a tap after a swipe "does nothing", check your swipe rested before you write it down.
- **The names to press and read:** the box holds its date in `data-value` ("yyyy-mm-dd", empty when none). The open
  calendar: `[data-testid="dcal-card"]`, a date `[data-testid="dcal-day-2026-11-05"]`, `dcal-next`, `dcal-prev`,
  `dcal-title`, `dcal-today`, the lists `dcal-months` / `dcal-years` (each row is `role="option"`, the chosen one
  `aria-selected="true"`), the veil `dcal-scrim`, the month it shows in `[data-testid="dcal"]`'s `data-month`. Admin's
  range calendars carry the prefix `admWipeRun-…` and `admLogRun-…` in place of `dcal-…`.
- **Navigate by reading** the screen's own heading until it says what you want — never by a counted number of presses.
- **What a press opens is proved ON SCREEN before anything in it is pressed:** the calendar's box inside the screen,
  and the element at its centre is the calendar (`document.elementFromPoint`).
- **Stop after three failed attempts at one gesture** and report it as it stands. A check whose own set-up could not
  act is **NOT WALKED**, never FAIL — say why.

## Judging

- A scenario with an **EXPECTED** line is **PASS** or **FAIL**, with the value you observed written beside it.
- A scenario marked **RECORD** has no expected answer: write down exactly what the screen did, in the app's words, with
  a picture. The host judges it.
- Anything else you notice that looks wrong on the way: a short line under "Seen in passing", with a picture.
- **Not a finding:** a problem that exists only in data already stored when the app is right going forward (the whole
  store is demo data, cleared before the database). If the app would do it again to NEW data, report it.

## Your output

- **Pictures:** `raptor-port/docs/img/handpass/2026-10-13-one-date-calendar/w<N>/` — one per assertion that matters,
  taken AFTER the step, named `<scenario>-<what>.png`. Empty the folder at the start of a run that numbers them.
- **Scratch (scripts, logs):** `raptor-port/scripts/handpass/odc/w<N>/` — make it.
- **Your report:** `raptor-port/docs/handpass/parts/odc/w<N>.md` — a table: scenario · size · PASS / FAIL / RECORD / NOT
  WALKED · what the screen said (the observed values) · the picture. Then "Seen in passing". Then the errors the
  browser's console, page and network (4xx) reported during your walk, or "none".
- **Send your report ONCE**, after closing every browser you started. Your hand-back message is five lines at most:
  how many PASS / FAIL / RECORD / NOT WALKED, and the one or two things the host should look at first.
- Do not commit, push, or touch git.

---

## W1 — the Calendar window on a phone, by touch

Sizes: **390 × 844** for every scenario; then 13 at **320 × 568** and at **844 × 390** (a phone on its side, still
touch). Admin. Open it: Inputs → the gear → "Calendar…" (the look script's first step).

| # | Scenario | EXPECTED / RECORD |
|---|---|---|
| 1 | On the Month tab, slide a finger LEFT on the dates three times, starting from the month it opens on | EXPECTED: the heading reads the next month each time, in order, across a year's end if it comes; the two arrows and "Today" are still there |
| 2 | Slide RIGHT the same number of times | EXPECTED: back on the month it opened on |
| 3 | Start a left slide ON a date's own button (the button that steps day / night / no fly) | EXPECTED: the month turns; that date's button shows the same face as before on return; the app's Undo (top bar) is in the state it was in — RECORD its state before and after |
| 4 | Slide less than 50px sideways; then slide mostly DOWN with a little sideways | EXPECTED: the month does not turn in either |
| 5 | Slide left, slide right (finger rested), then at once TAP a date's button | EXPECTED: that date steps to its next kind (its face changes) — one tap, one change |
| 6 | Start a sideways slide on the window's own TOP BAR (the six dots and "Calendar") | EXPECTED: the month does not turn. RECORD what the bar itself did |
| 7 | Start a left slide on a weekday's heading (MON … SUN) | EXPECTED: the month turns and no "Every …" window opens |
| 8 | Slide in the empty room under the month, near the window's foot | EXPECTED: the month turns |
| 9 | Holidays tab: slide left, then right, on the list; then start a slide ON a holiday's line and ON "+ Add"; then in the empty room under the list | EXPECTED: the year goes on one, back one; no form opens from a slide; the room under the list turns the year too. Then the Month tab still shows the month you left |
| 10 | Tap a weekday's heading: "Every Thursday" opens. With it open, slide sideways ON that window | EXPECTED: nothing turns behind it (the Calendar window's month is the same). RECORD anything that moved |
| 11 | In "Every Thursday": read the From box; tap it; on the calendar read the title, which weekday stands out; tap a TUESDAY | EXPECTED: the box reads a date in words; the calendar is in the middle of the screen, wholly on it; THU is lit and the Thursdays are heavier; after the tap the calendar is gone, the box reads that Tuesday in words, and the sentence under it says "from Tue … onward". Save. RECORD on the month which dates now read NF — the first should be the first Thursday on or after that Tuesday |
| 12 | Open "Every Thursday" again; Until → "A date": the new box reads "Pick a date"; tap it | EXPECTED: dates before the From date are faint and a tap on one picks nothing; a tap on a later date picks it; the sentence reads "from … to …". Save. RECORD the month: NF only on the Thursdays inside the two dates; and that the rule is listed under "Already set for Thursdays" when the window is opened again |
| 13 | On the From box's calendar: next arrow three times; tap the title; SCROLL the year list with a finger until it rests two years on; read the title; scroll the month list down past December; tap the title; tap the Today icon; tap outside the calendar | EXPECTED: the arrows do not move as the months change; the lists take the dates' place with the card the same size; the title follows the lists; after December comes January; the Today icon shows today's month with today's date on a soft disc and picks nothing; the tap outside closes the calendar; the From box reads what it read before; "Every Thursday" is still open. Do this at 390 × 844, 320 × 568 and 844 × 390 — a picture of the dates and of the lists at each |
| 14 | With the From calendar open at 390 × 844, turn the phone: set the viewport to 844 × 390, then back | RECORD exactly what the calendar did at each turn (stayed, moved, closed), with a picture each |
| 15 | Remove a saved rule with its "Remove"; then press the app's Undo in the top bar | RECORD what each did to the month and to the list of rules |
| 16 | Save a rule, RELOAD the page, sign in again if asked, open the Calendar window and "Every Thursday" | EXPECTED: the rule is still listed, with the dates picked |

## W2 — Admin and Medical, at a desktop and a phone

Sizes: **1440 × 900** (mouse and keyboard) and **390 × 844** (touch). Admin `ad`, and a member `us` where it says.

| # | Scenario | EXPECTED / RECORD |
|---|---|---|
| 1 | Admin → Users → "Add a person": read Post in; open it; pick a date about ten days on; fill the rest (a new callsign, Pilot, a CAT) and add | EXPECTED: Post in reads today in words before; the calendar is on top and wholly on screen; after the tap it reads the date picked; the person is added. RECORD how his row looks on the Leave War before that date |
| 2 | Archive that man (his row → Archive); open the Archived group, his row: Restore's Post in; pick a date three weeks on; Restore | EXPECTED: the box reads today first, then the date picked; he is restored. RECORD the Leave War between the two dates. Both sizes |
| 3 | Give access → "New person": this needs someone waiting — sign out, ask for access as a new name from the sign-in page, sign in as admin, Admin → Users, the waiting line → Give access → New person; its Post in | EXPECTED: the box is the same kind, opens on top, picks. If the waiting line cannot be made, NOT WALKED with what stopped you |
| 4 | Admin → Data → Old clutter, "Anything older than a date" | EXPECTED: the button cannot be pressed until a date is picked. Pick one, press. RECORD exactly what it says (a note that nothing is there, or "Tap again to clear N …"). If it armed: pick ANOTHER date — EXPECTED the button reads "Clear old clutter…" again |
| 5 | "A specific date" | EXPECTED: the same one box, under the name "Date" |
| 6 | "A date range" | EXPECTED: ONE calendar in the form itself, no second box, nothing floating; before a tap it says "Tap the first day, then the last."; one tap lights that day and names it beneath; a second tap on a later day joins them with a soft band and reads "… to …"; a tap on a new day starts over. Make a run across a month's end with the next arrow: RECORD how the band looks on each month. Press the button: RECORD |
| 7 | Edit history: first change something on Edit Schedule (type a remark on a flying line), then Admin → Data → Edit history → "A specific date" → today | RECORD what the button says on the first press and on the second |
| 8 | Pick a date under "older than", then change the Period to "A date range" | EXPECTED: that date is shown as a run of one day, named beneath, and the button can be pressed |
| 9 | Desktop only: where is the calendar? Open Post in; then make the window 1280 × 640, scroll so the box sits near the foot, open it; then turn the mouse wheel with it open | EXPECTED: a panel right under the box, lined up with its left edge; near the foot it opens ABOVE the box, wholly on screen. RECORD what the wheel did (page, panel) |
| 10 | Desktop only, keyboard: Tab to the Post in box; Enter; arrow keys; Page Down; Enter. Then open again and press Escape | EXPECTED: Enter opens it with the keyboard on a date; the arrows walk the dates, Page Down goes a month on; Enter picks and the keyboard is back on the box; Escape closes it with the date unchanged. RECORD where Tab goes inside the open calendar |
| 11 | Inputs → Medical → a card under Pending Upchit → "Upchit": its date box; open; pick the day before; save | EXPECTED: the box reads a date; the calendar is on top of the form; the form stays up after the pick, reading the new date. RECORD what Save asked for and where the man shows afterwards. Both sizes |
| 12 | The same as a member (`us`): does Ranger have an upchit of his own to file? | RECORD; NOT WALKED if he has none, saying so |
| 13 | Reload after 1 and 2 | EXPECTED: the man, and his dates on the Leave War, are as before the reload |
| 14 | Phone: a picture of each box of 1, 2, 4, 5, 6 and 11 with its calendar open | EXPECTED: each box inside its form; each calendar wholly on the screen and on top |
| 15 | Desktop: with a calendar open, make the window 800 wide, then 560 wide | RECORD what the calendar did at each |

## W3 — the Leave War's posting dates, at a desktop and a phone

Sizes: **1440 × 900** and **390 × 844** (touch). Admin (`window.lwSetRole('admin')`). The look script's last step
reaches the one-day sheet (the JUL month button, a tap on a day of a man's row).

| # | Scenario | EXPECTED / RECORD |
|---|---|---|
| 1 | Tap a day → "PO": the PO from box; open; pick six days on; read the line under the chips; "Post out" | EXPECTED: the box reads the tapped day in words; the calendar is on top of the sheet; after the tap the SHEET IS STILL UP and the box reads the date picked. RECORD the line's words and how the grid shows his days from that date |
| 2 | Tap one of his struck days: the Post out sheet; its date box; pick an EARLIER date. Then pick a date PAST the day you tapped | EXPECTED (earlier): the date is taken at once — the struck days follow it without another button. RECORD what happens for the later date (which sheet is up afterwards) |
| 3 | On the Post out sheet press its Undo; then try the app's Undo and Redo in the top bar after a posting | RECORD each |
| 4 | Tap a day → "PI": the PI from box; pick; "Post in". Then tap a day before it: the Post in sheet; move its date | EXPECTED: as 1 and 2 for the box and the calendar. RECORD how the days before read |
| 5 | A posting out dated BEFORE the same man's post-in | EXPECTED: the sheet stays up and says why. RECORD the words |
| 6 | PO from → the title → the year list → scroll to 2031 → the month list → March → the title → tap the 3rd | EXPECTED: the box reads "Mon 3 Mar 2031". RECORD what "Post out" then does and shows (the war on screen is 2026) |
| 7 | The panel for a dragged block: on a desktop drag across three days of ONE man's row; on a phone hold a finger on a day, then drag. In the panel: "PO" → its "PO from" box | EXPECTED: the box is the same kind; the calendar opens on top of the panel; a date picked leaves the panel up reading it. If the drag cannot be made by script: NOT WALKED, saying what you tried |
| 8 | A posting that cannot be moved: post a man out, post him in again later (Admin → Users: Archive, then Restore with a later date — or the Leave War's own PI), then tap a day at the end of his EARLIER stay | RECORD: is the date box there greyed and does a tap on it open anything; what the sheet says. NOT WALKED if the state cannot be made |
| 9 | Phone: with a calendar open over a sheet — tap the dimmed area round it. Then open again and tap a date. Then tap the grid behind the sheet | EXPECTED: the first closes the calendar only (the sheet stays, its date as it was); the second picks and the sheet stays; the third closes the sheet |
| 10 | Desktop: with a calendar open over a sheet press Escape; then Escape again | EXPECTED: first the calendar goes and the sheet stays; then the sheet goes |
| 11 | Reload after 1 and 4 | EXPECTED: the postings are as before the reload |
| 12 | Both sizes: a picture of each box of 1, 2, 4 and 7 with its calendar open | EXPECTED: each box inside its sheet; each calendar wholly on the screen and on top |
| 13 | As a member (`us`, or the admin's own member view — a tap on his name badge): tap a day of his own row | RECORD whether PO or PI is offered at all |
| 14 | The one-day sheet's "Pick a range" (How many) | EXPECTED: the Leave War's OWN small calendar, as before — NOT the new round-disc calendar with the Today icon (that change is a later step). RECORD what it looks like and that a tap, then a tap, still makes a range |
