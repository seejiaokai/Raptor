# The walk brief — an input's own title — 9 Oct 26

One walker, one world (D16, D588). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen
said — pictures and a filled table. You do not review code, you decide nothing, and you fix nothing.

*(This brief is handed, word for word, to two walkers working apart — each with its own share of the scenarios, its own
server, its own picture folder and its own files. Your letter, your server and your share are in the message that gave
you this brief. Walk exactly your share.)*

## What the app should now do (read once, before you start)
- **An input of a "Duty & other commitments" kind may carry a title of its own** — Training, CSE, Meeting, Fly with,
  Personal, Appointment, Duty, Event, OD, Other. Never a leave, a medical kind, an Upchit or SANS availability.
- **The Title box** stands straight under Type in the input's window (`#inpEditTitle`), in the List's Add form
  (`#inTitle`) and in the List's pencil editor (`input[data-ed="title"]`). Until somebody types in it, it SHOWS the
  kind's own name and follows a change of kind. Once typed in it keeps what was typed; emptied, it stays empty (its
  faint hint says the kind). Saved: trimmed, runs of spaces made one, at most 40 characters — and NOTHING is stored
  when it is empty or is the kind's own name in any capitals (the input then looks exactly as it always did). A change
  to a kind that takes no title drops it.
- **The title is the input's NAME everywhere a name is printed**: the month's bar, the opened day's card, the List, the
  Personal Inputs and Unavailable cards (the week and the Scheduler Board), the row a request lands on the Ground
  Programme (in capitals), the changes window, the history, the OIL question's heading, the toasts, the warning
  sentences, the Inputs export (a `Title` column beside `Type`).
- **The kind is kept in sight, small**, only where the name is NOT the kind's own: under the row's name on the week
  (`.nm-kind`) at every width; under the name box on the Scheduler Board; beside the name on an input's card; at the head
  of the small-print line on the opened day's card (`[data-testid="idy-kindtag"]`); in the month bar's tip ("who ·
  title · kind · dates") — the bar itself has no room; in the List the title is bold above the kind.
- **The KIND goes on deciding every rule** — OIL, clashes, crew rest, who may file. A title's words decide nothing:
  a Meeting titled "Training" is still an amber advisory across a standby (SC MAIN) shift; a Training titled "Meeting"
  is still a red clash. Two different requests with the same title for one man at one hour are still TWO commitments.
- **"Other"** takes the same box. An Other nobody titled is named "Other", and its remark is a remark.
- **A published day:** a title changed after publishing is ONE pending change and the four sign-offs fall — also for an
  OD (it has no row on the programme), on every published day the input covers, and for a change of capitals alone.
  The issued face keeps the issued name until the next amendment. A title asks no OIL question again.
- **A remark is always said** under the day card's line, even when it repeats the title.
- The owner's rulings: `grep -h '^| D716 |' .claude/decisions-full/*.md` (D715, D716, D717 — the shell's grep). How
  the screens are meant to behave: `raptor-port/docs/ui-contracts.md` — search `An input's own title` and read that
  paragraph. The rules: `raptor-port/docs/engine-rules.md` §An input's own title.
- **The demo carries one titled input**: an Event for ALL titled "Sports afternoon" on Wed 22 Jul 2026 (filed by Saber).

## The scenarios
`raptor-port/docs/superpowers/briefs/2026-10-09-reads/input-own-title-scenarios-astra.md` — numbered 1 … 64, each with
its steps and what must be SEEN. Its head explains "T1–T9" (the title states) and its other shorthand: read the head.
**Walk ALL of your share, in the order given, and cite each by its number.** Where a scenario says "both sizes", do
what your message says about sizes.

## Hard rules — the method
**Every rule under "Hard rules" in `raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-walk-brief.md`
applies here, word for word** (read that section whole: read-only on the app; your own files only; scripts written with
the Write tool and run as files; every fixture through the app's own controls; a step asserts what a person SEES; a
gesture is driven for real; sizes; the error list; what is not a finding) — with these names in place of its own:
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/it-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-09-input-title-check/<L>/`; results
  `raptor-port/docs/handpass/parts/it-<L>.json` and your report `raptor-port/docs/handpass/parts/it-<L>.md`.
- **A worked example to copy from** (the host's own walk of this feature — its sign-in, its way of opening the month, a
  day, the window, the List, the week, the board, and of bringing a phone's week to a day):
  `raptor-port/scripts/handpass/it-host-walk.mjs`. Read it before writing your first script; do not run or edit it.
- **Signing in:** `#luser` / `#lpass` / `#loginForm button[type=submit]`; `ad` / `a` is the admin Saber, `us` / `us` the
  member Ranger; `#vWeek .day` is the "week is up" signal. The demo week is 13–19 Jul 2026 (Sat 18, Sun 19 the weekend).
  Open your server's address with `?fresh=1` for a clean world — and WITHOUT it (in a new browser context, which is
  clean anyway) for any scenario that reloads the page: a fresh world keeps nothing across a reload.
- **Useful selectors** (verify each on the page before leaning on it): the Inputs month `#inpCal`, a date
  `[data-icday="2026-07-18"]`, a bar `.ib-bar[data-iid]`, "+ Input" in the opened day `#icPopAdd`, the opened day
  `[data-testid="win-inputsday"]`, a card `[data-testid="idy-row-<iid>"]`; the window `[data-testid="win-inputedit"]`,
  Person `#inpEditPerson`, Type `#inpEditType`, Title `#inpEditTitle`, times `#inpEditStart` / `#inpEditEnd`, remark
  `#inpEditRmk`, Save `#inpEditSave`, "Several people" `[data-testid="pp-several"]`; the OIL question
  `[data-testid="oilconf"]` (its heading `.airpop-head`; `oil-yes` / `oil-no` / `oilconf-save`); the List `#inListBtn`
  (show every date: `#inRangeBtn` then `#inRangeAll`), its form `#inType` / `#inTitle` / `#inRemarks` / `#inAdd`, a
  row's pencil `[data-edit]`, the open row `tr.ined`, its save `[data-save]`, the search `#inFSearch`, a row's title
  `[data-testid="in-title"]`; pages `window.go('inputs' | 'editsched' | 'viewsched')`; the week `#eWeek` (view: `#vWeek`),
  a request's row `.pl-row.gr-frominput`, its name `.nm .ntx`, its kind `.nm .nm-kind`; the Scheduler Board
  `#schedBoard` (opened from a day's `[data-sbday="<0-6>"]` on Edit Schedule), a row's name box `[data-bfld$=".prog"]`,
  the Personal Inputs fold `[data-pitog]`, OIL Earn `#sbOil` (weekend days only); the day's pending chip
  `.dpend:not(.dnew):not(.dchg)`.
- **Publishing a day** is done through the app's own controls on Edit Schedule (the four sign-offs, then Publish) —
  find them on the page; if you cannot reach a state through the controls, say so: that is a finding, not a reason to
  write the state in.
- **Reading, never writing:** `window.INPUTS`, `window.DAYS`, `window.validate().all` through `page.evaluate` only to
  READ what was saved or flagged.
- **Judging:** a scenario with an expected result is PASS or FAIL — never "recorded". A FAIL names the step, what the
  screen said, and the picture. Do not explain a FAIL away; the host decides whether it is real. Check your own script
  first: a selector that matched nothing is your miss, not the app's — say which it was.
- **Not part of this job:** stored demo data from before this change; one row for a group input on the schedule (D661);
  anything of the Tracker or the Leave War grid.

## What to hand back
`it-<L>.md`: one row per scenario — its number, the size, the role, PASS / FAIL, what the screen said in a line, the
picture file(s) you opened (open and LOOK at each picture you cite). Then: every console or page error seen; anything
you saw that looked wrong and was not in a scenario (a line each, with its picture). `it-<L>.json`: the same rows as
data. Your final message to the host: the counts, every FAIL in one line each, and the extras.
