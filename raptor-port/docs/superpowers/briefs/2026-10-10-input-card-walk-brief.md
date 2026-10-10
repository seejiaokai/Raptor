# The walk brief — the input card, and the Inputs list without its pencil — 10 Oct 26

One walker, one world (D16, D588). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen
said — pictures and a filled table. You do not review code, you decide nothing, and you fix nothing.

*(This brief is handed, word for word, to three walkers working apart — each with its own share of the scenarios, its
own server, its own picture folder and its own files. Your letter, your server and your share are in the message that
gave you this brief. Walk exactly your share.)*

## What the app should now do (read once, before you start)
- **ONE input card**, drawn by the Inputs calendar's opened day and by the Inputs list on a phone. **Top line:** a colour
  square (red an absence, amber a duty or a commitment), WHO, the KIND in small grey capitals (the kind's own name,
  always — never a pill), then LATE and the hours at the right. **A shared input names EVERY person**, A to Z, the names
  wrapping round the LATE-and-hours corner — never "+N", no pucks on the card. **The words row:** the input's own TITLE
  at the left on a row of its own, a remark after it in grey (the remark alone where there is no title); both wrap at
  the card's full width, nothing is cut. **The small print is "By Saber" and nothing more** — no "for Ranger", no day,
  no time: for an input of ONE person only where someone ELSE placed it; for an input of SEVERAL people ALWAYS, even
  where the filer is one of them; for ALL AVAIL / ALL always. A card with no title, remark or small print is ONE line.
  LATE is its own button: pressed, it says the cut-off that was missed and opens nothing. A tap anywhere else on the
  card opens the input's window.
- **The Inputs list.** On a phone (820px wide and under) it is those cards under a slim heading a day — "SAT 18 JUL"
  and, at the right, "6 inputs" — in date order; an input of several days stands under its FIRST day and its corner
  says "till <last day>". NO table there. On a desktop (821px and over) it is the table, its columns and sorting as
  before. **NO PENCIL AND NO CROSS anywhere, and no row that turns into fields.** On a desktop the Name is a button and
  a click anywhere on the row opens the input's window; the paperclip and the OIL / OIL? chips stay in the last column
  and do their own work (they do not open the window). A phone's card has no paperclip and no OIL chip.
- **Everything the pencil did is done in the input's WINDOW** (`[data-testid="win-inputedit"]`), which opens from a
  card, a row, a month bar: every field, Delete, and — NEW — (a) the two-tap DATE CALENDAR (`#inpEdCal`) for every saved
  input its reader may change (a tap is the new start; a second tap the new end; one tap and Save is a one-day input;
  the line under it says what Save will write); (b) an OIL line "Not answered yet — <day>" with "Answer…" where nobody
  has answered an OIL question ("Change…" where one is answered, as before); (c) a PAPERCLIP button beside the window's
  buttons (`[data-testid="inped-docview"]`) for any saved input that has a document — it opens the document for every
  reader, also one who may not change the input; (d) for an admin changing a SAVED input, the Person list offers the
  "Posted out / archived" people in their own group.
- **Not changed, and must not be:** the SANS calendar's opened day (pucks with the CAT); the month's bars and their
  tips (the tip keeps the full "Placed by … for … · date, time"); the Medical tab's cards; the input window's own small
  print (who placed it and when, and its last change, in full); the schedule's rows; the Scheduler Board's and the
  week's dialogs (no date calendar there — their hint says the dates are changed on the Inputs page).
- **Known, put to the owner, NOT a finding:** on the DESKTOP table a shared input still reads "Saber +3" and the kind
  is still a pill; in the window's calendar on a phone a day is small (about 26 × 20) — report its size if you measure
  it, do not fail a scenario on it; a remark with no "till <date>" in it gets none added when its dates are changed in
  the window (a remark that HAS one follows the new last day at the save).
- The owner's rulings: `grep -h '^| D723 |' .claude/decisions-full/*.md` (D718–D724 — the shell's grep). How the screens
  are meant to behave: `raptor-port/docs/ui-contracts.md` — search `THE INPUT CARD` and read that paragraph and the
  next. The pictures he approved: `raptor-port/docs/mock/img/input-card-final/day-final.png`, `list-final.png`.
- **The demo:** the loaded week is 13–19 Jul 2026 (Sat 18 and Sun 19 the weekend); an Event for ALL titled "Sports
  afternoon" on Wed 22 Jul; a Duty for ALL AVAIL on Sat 25 Jul; a shared Meeting for four on Thu 23 Jul; medical inputs
  with documents (an OML of Vector on 13 Jul, of Gambit on 23 Jul). The Inputs list opens on today onward — press "All
  dates" to see July.

## The scenarios
`raptor-port/docs/superpowers/briefs/2026-10-10-input-card-scenarios-astra.md` — numbered 1 … 84, each with its steps
and what must be SEEN. Read its head (lines 1–16). **Walk exactly the numbers in your message, in the order given, and
cite each by its number.** The host (Opus) sized this walk and has walked some scenarios itself; yours are the rest.
- **Sizes:** where a scenario says "both sizes" (or "phone and desktop"), walk it at ONE size — a PHONE (390 × 844, by
  touch: `isMobile: true, hasTouch: true`, `locator.tap()`) for an ODD-numbered scenario, a DESKTOP (1440 × 900) for an
  EVEN one — unless your message says otherwise or the scenario names particular sizes (then those).
- **Undo and Redo:** after a scenario's MAIN save or delete, press Undo once and Redo once (the top bar: `#undoBtn`,
  `#redoBtn`) and check both, as the list's head asks. Not after every small save inside a scenario.
- A setup you cannot reach through the app's own controls is NOT RUN (say why) — never a pass.

## Hard rules — the method
**Every rule under "Hard rules" in `raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-walk-brief.md`
applies here, word for word** (read that section whole: read-only on the app; your own files only; scripts written with
the Write tool and run as files; every fixture through the app's own controls; a step asserts what a person SEES; a
gesture is driven for real; sizes; the error list; what is not a finding) — with these names in place of its own:
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/icard-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-10-input-card-check/<L>/`; results
  `raptor-port/docs/handpass/parts/icard-<L>.json` and your report `raptor-port/docs/handpass/parts/icard-<L>.md`.
  Change no file of the app (`raptor-port/src`, `e2e`, `probes`), no document but your own two, and never run a build,
  `npm test`, Playwright's own test runner or a dev server: the build you are served is FROZEN for you.
- **A worked example to copy from** (the host's own walk of this feature — its sign-in, its way of opening the month, a
  day, the window, the list on a phone and a desktop, of filing an input and answering the OIL question, of reading a
  card part by part): `raptor-port/scripts/handpass/icard-host-walk.mjs`. Read it before writing your first script;
  do not run or edit it. It runs from `raptor-port/` as `node scripts/handpass/<file>.mjs`; point yours at YOUR server
  (`LOOK_URL`).
- **Signing in:** `#luser` / `#lpass` / `#loginForm button[type=submit]`; `ad` / `a` is the admin Saber, `us` / `us` the
  member Ranger; `#vWeek .day` is the "week is up" signal. Open your server's address with `?fresh=1` for a clean world
  — and WITHOUT it (in a new browser context, which is clean anyway) for any scenario that reloads the page or signs in
  as a second person: a fresh world keeps nothing across a reload. **Never sign in again on a world nobody has written
  to yet** — make one saved change first (the scenarios' head says so too).
- **Useful selectors** (verify each on the page before leaning on it): the Inputs month `#inpCal`, a date
  `[data-icday="2026-07-18"]`, a bar `.ib-bar[data-iid]`, "+ Input" in the opened day `#icPopAdd`, the opened day
  `[data-testid="win-inputsday"]`; a card on the day `[data-testid="idy-row-<iid>"]` and its parts `idy-open`,
  `idy-who`, `idy-kind`, `idy-when`, `idy-late`, `idy-latenote`, `idy-title`, `idy-rmk`, `idy-by`; the same on the
  phone's list with `inl-` (`[data-testid="inl-row-<iid>"]` …), a day heading `[data-testid="inl-day"]` (its `b` the
  day, its `i` the count), the list's box `#inList`; the desktop table `#intbl`, a row `#inBody tr[data-iid="<iid>"]`,
  its Name button `[data-testid="in-open"]`, its paperclip `.rclip`, its OIL chips `[data-oilrev]` (answered) and
  `[data-oilask]` (nobody answered); the List `#inListBtn` / the Calendar `#inCalBtn` (show every date: `#inRangeBtn`
  then `#inRangeAll`), the filters `#inFPerson`, `#inFType`, `#inFSearch`, the form `#inType` / `#inTitle` /
  `#inRemarks` / `#inAdd`, Export `#inExport`; the window `[data-testid="win-inputedit"]`: Person `#inpEditPerson` (a
  member: `#inpEditPersonFixed`), "Several people" `[data-testid="pp-several"]` and its pucks `[data-pp="<person
  id>"]`, Type `#inpEditType`, Title `#inpEditOwnTitle`, the calendar `#inpEdCal [data-cal="2026-07-21"]` and the line
  under it `.rc-read`, "all day" `#inpEditAllday`, times `#inpEditStart` / `#inpEditEnd`, remark `#inpEditRmk`, the
  OIL lines `[data-testid="oil-revise"]` / `[data-testid="oil-unanswered"]` + `[data-testid="oil-answer"]`, the small
  print `[data-testid="inped-placed"]`, the hint `.inped-hint`, the paperclip `[data-testid="inped-docview"]`, Delete
  `#inpEditDel`, Cancel `#inpEditCancel`, Save `#inpEditSave`, the read-only line `[data-testid="inped-ro"]`, "Take me
  out" `[data-testid="inped-takeout"]`; the OIL question `[data-testid="oilconf"]` (one day: `oil-yes` / `oil-no`;
  several days: `oil-all` / `oil-some` / `oil-none`; then `oilconf-save`); the document viewer `#docViewPop` (close
  `#docViewClose`); the tabs `#inMemberMode` (Inputs), `#inSansMode`, `#inMedBtn`; pages `window.go('inputs' |
  'editsched' | 'viewsched')`; Undo / Redo `#undoBtn` / `#redoBtn`.
- **Publishing a day**, declaring a holiday (the "Calendar" window behind the Inputs or SANS gear, or the Leave War's
  event row), archiving a person (Admin → Users) are done through the app's own controls — find them on the page; if
  you cannot reach a state through the controls, say so (NOT RUN): never write the state in.
- **Reading, never writing:** `window.INPUTS`, `window.PEOPLE`, `window.DAYS` through `page.evaluate` only to READ what
  was saved.
- **Judging:** a scenario with an expected result is PASS or FAIL — never "recorded". A FAIL names the step, what the
  screen said, and the picture. Do not explain a FAIL away; the host decides whether it is real. Check your own script
  first: a selector that matched nothing is your miss, not the app's — say which it was.
- **Not part of this job (D56 and the list above):** stored demo data from before this change; the "known, put to the
  owner" items above; anything of the Tracker or the Leave War grid beyond what a scenario needs.

## What to hand back
`icard-<L>.md`: one row per scenario — its number, the size, the role, PASS / FAIL / NOT RUN, what the screen said in a
line, the picture file(s) you opened (open and LOOK at each picture you cite). Then: every console or page error seen;
anything you saw that looked wrong and was not in a scenario (a line each, with its picture). `icard-<L>.json`: the same
rows as data. Your final message to the host: the counts, every FAIL in one line each, the NOT RUN ones with their
reason, and the extras.
