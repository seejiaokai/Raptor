# The walk brief — the design vet's changes to the Inputs calendar and list — 10 Oct 26

One walker, one world (D16, D588). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen
said — pictures and a filled table. You do not review code, you decide nothing, and you fix nothing.

*(This brief is handed, word for word, to three walkers working apart — each with its own share of the scenarios, its
own server, its own picture folder and its own files. Your letter, your server and your share are in the message that
gave you this brief. Walk exactly your share.)*

## What the app should now do (read once, before you start)
- **The Inputs LIST has no add form of its own.** One filled button, **"+ Input"** (`#inNew`), stands first in the
  list's row of tools, at the left of the dates button. It opens the input's WINDOW (`[data-testid="win-inputedit"]`)
  — the same window "+ Input" in a day opened on the calendar opens — but with **NO date picked**: the line under the
  window's calendar reads "pick a start date", and **Add with no date says "Pick a start date on the calendar first"
  before any other question** and saves nothing. The window opens on the signed-in person and the kind "Training".
  It opens FRESH every time (nothing carried from the last input) — that is known and told to the owner.
- **In that window, on the Inputs page:** a small **"?"** beside "Type" (`#inTypeHelp`) opens a card "What each type
  means" (`#inTypePop`) laid in the form itself; Escape, a press elsewhere, or the "?" again close the CARD and never
  the window; the window's Cancel / Add stay reachable. The "?" is NOT drawn in a window its reader may not change.
  An ADMIN's Person list offers "Posted out / archived" people for a NEW input too. **No paragraph of instructions**
  stands under the form — not for a new input, not for a saved one-person input; a saved SHARED input has one line,
  "Date changes apply to all N." (N its people as saved).
- **After a save from the List** the input's row (a desktop) or card (a phone) is brought into view and LIT for about
  six seconds — also when the search, the Person, the Type or the dates would hide it (it then stands first, a phone's
  under its own day's heading) — and it lets go when a filter or a column heading is next touched. A row is lit when
  it is added, changed, or put back by Undo / Redo. The passing note at the foot of the screen says "Input added"
  TOGETHER with anything the save itself had to say (for example "…replaces the LL bid…"), as one line.
- **The desktop list (821px and wider):** a shared input's Name names EVERY person, A to Z, wrapping inside its 250px
  column — never "Drifter +3". The kind is in its PILL here (and only here). The small print is **"By Saber"**, on the
  remark's own line, only where someone other than the input's own person filed it, and always for an input of several
  people or for ALL / ALL AVAIL; a man's own input has none. No day or time there — the full "Placed by … · date, time"
  is in the input's window. The last column's heading is **"Changed"**. The Remarks column shows the WHOLE remark.
- **An input's CARD** (a day opened on the Inputs calendar; the Inputs list on a phone): where its right corner says
  "till 17 Jul", the remark leaves out those same automatic words — "Medically down till 17 Jul" reads "Medically
  down"; a remark that was only those words shows no remark. Typed words stay; a "till" for ANOTHER day stays; on the
  input's LAST day (the corner then says "All day" or its hours) and on a one-day input the remark is whole. The
  record itself is never changed by this: the desktop Remarks column and the window's Remarks box keep every word.
- **The month:** a shared input's bar reads its COUNT first — "4 · Meeting", "9 · Squadron photo" — never a callsign
  and "+N". A bar of an input WITH HOURS (a half day too) is a lighter tint of its colour with a solid edge at its
  left; an all-day one is solid. The colour key reads "absence" and "duty". "How this works" is four lines.
- **Fewer words:** the gear's three helper lines ("Day, night or no-fly dates, and holidays." · "Later than this is
  LATE. Medical is never late." · the checkbox "Members may file duties for others" with "Never leave, medical or
  SANS."); an empty list under dates reads "No inputs 10–24 Oct. Try All dates." (two months: "28 Oct – 3 Nov"; a
  start alone: "from 10 Oct"); under all dates "No inputs match."; on a phone no words stand over the three filter boxes.
- **Not changed, and must not be:** the SANS calendar and its windows; the schedule's and the Scheduler Board's own
  dialogs and their lines of words (no "?" card there); the Medical tab; the Logic page's own rows; the window's title
  (a shared input's still reads "Drifter +3 · 23 Jul"); month-first dates in the window ("Jul 14"); the button "Add".
- **Known, told to the owner, NOT a finding:** the window does not keep the last input's dates, kind, people or hours;
  it opens on "Training" where the old form opened on "LL"; the browser may show a time box as am / pm; a saved shared
  input's window opens on its whole people picker; the desktop month's columns narrow when a day opens.
- The owner's rulings: `grep -h '^| D729 |' .claude/decisions-full/*.md` (D726–D729 — the shell's grep). How the
  screens are meant to behave: `raptor-port/docs/ui-contracts.md` — search `AFTER THE DESIGN VET` and read that
  paragraph and the two after it. The pictures he approved: `raptor-port/docs/mock/img/inputs-vet/*-drawn.png` (the
  desktop list is drawn there with the kind in grey capitals — he chose the PILL instead, D727) and
  `raptor-port/docs/mock/img/card-questions/q3-*-proposed.png`.
- **The demo:** the loaded week is 13–19 Jul 2026 (Sat 18 and Sun 19 the weekend); a shared Meeting of four on Thu
  23 Jul; an Event for ALL ("Sports afternoon") on Wed 22 Jul; a Duty for ALL AVAIL on Sat 25 Jul; Grit's ATT C
  13–17 Jul with the remark "Medically down till 17 Jul". The Inputs list opens on today onward — press the dates
  button, then "All dates", to see July.

## The scenarios
`raptor-port/docs/superpowers/briefs/2026-10-10-inputs-vet-scenarios-astra.md` — numbered 1 … 69, each with its steps
and what must be SEEN. Read its head (lines 1–18). **Walk exactly the numbers in your message, in the order given, and
cite each by its number.** The host (Opus) sized this walk and has walked forty steps itself; yours are the rest.
- **Sizes and roles:** where a scenario says "both sizes", walk it at ONE size — a PHONE (390 × 844, by touch:
  `isMobile: true, hasTouch: true`, `locator.tap()`) for an ODD-numbered scenario, a DESKTOP (1440 × 900) for an EVEN
  one — unless the scenario names a particular size (then that). Where it says "both roles", walk it as ONE: the
  ADMIN (Saber) when the scenario's number divided by 4 leaves 0 or 1, the MEMBER (Ranger) when it leaves 2 or 3 —
  unless the scenario needs a particular role, or both in turn (then as it says).
- **Undo and Redo:** only where the scenario asks.
- A setup you cannot reach through the app's own controls is NOT RUN (say why) — never a pass.

## Hard rules — the method
**Every rule under "Hard rules" in `raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-walk-brief.md`
applies here, word for word** (read that section whole: read-only on the app; your own files only; scripts written with
the Write tool and run as files; every fixture through the app's own controls; a step asserts what a person SEES; a
gesture is driven for real; sizes; the error list; what is not a finding) — with these names in place of its own:
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/ivet-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-10-inputs-vet-check/<L>/`; results
  `raptor-port/docs/handpass/parts/ivet-<L>.json` and your report `raptor-port/docs/handpass/parts/ivet-<L>.md`.
  Change no file of the app (`raptor-port/src`, `e2e`, `probes`), no document but your own two, and never run a build,
  `npm test`, Playwright's own test runner or a dev server: the build you are served is FROZEN for you.
- **A worked example to copy from** (the host's own walk of this build — its sign-in, its way to the List and the
  month, "+ Input", picking a day on the window's calendar, answering the OIL question, reading a row and a card part
  by part, archiving a man on Admin → Users): `raptor-port/scripts/handpass/ivet-walk.mjs`. Read it before writing your
  first script; do not run or edit it. Scripts run from `raptor-port/` as `node scripts/handpass/<file>.mjs`; point
  yours at YOUR server (`LOOK_URL`).
- **Signing in:** `#luser` / `#lpass` / `#loginForm button[type=submit]`; `ad` / `a` is the admin Saber, `us` / `us` the
  member Ranger; `#vWeek .day` is the "week is up" signal. Open your server's address with `?fresh=1` for a clean world
  — and WITHOUT it (in a new browser context, which is clean anyway) for any scenario that reloads the page or signs in
  as a second person: a fresh world keeps nothing across a reload. **Never sign in again on a world nobody has written
  to yet** — make one saved change first.
- **Useful selectors** (verify each on the page before leaning on it): the List `#inListBtn` / the Calendar
  `#inCalBtn`; "+ Input" `#inNew`; the dates button `#inRangeBtn`, its calendar `#inRangeCal [data-cal="2026-07-01"]`,
  "All dates" `#inRangeAll`; the filters `#inFPerson` (Everyone = `all`), `#inFType`, `#inFSearch` (a phone: the
  filter button `#inFiltersBtn` first); the empty line `#inEmpty`; the desktop table `#intbl`, a row
  `#inBody tr[data-iid="<iid>"]` (a shared input stands under its FIRST record A to Z), its Name button
  `[data-testid="in-open"]`, its "By" `.in-placed`, its pill `.intag`, its lit state the class `innew`, a heading
  `#intbl thead th[data-sort="name"]` (`start`, `mod`…); a phone's card `[data-testid="inl-row-<iid>"]` and its parts
  `inl-who`, `inl-kind`, `inl-when`, `inl-title`, `inl-rmk`, `inl-by`, a day heading `[data-testid="inl-day"]`; the
  month `#inpCal`, a date `[data-icday="2026-07-18"]`, a bar `.ib-bar[data-iid]` (class `timed`), the fold
  `[data-testid="ib-how"]` and its list `[data-testid="ib-how-list"]`, the key `[data-testid="ib-legend"]`; the opened
  day `[data-testid="win-inputsday"]`, its "+ Input" `#icPopAdd`, a card `[data-testid="idy-row-<iid>"]` (`idy-when`,
  `idy-rmk`, `idy-who`, `idy-by`); the window: Person `#inpEditPerson` (a member's fixed name `#inpEditPersonFixed`),
  "Several people" `[data-testid="pp-several"]` and its pucks `[data-pp="<person id>"]`, the picker's line of words
  `[data-testid="pp-why"]`, Type `#inpEditType`, the "?" `#inTypeHelp` and its card `#inTypePop`, Title
  `#inpEditOwnTitle`, the calendar `#inpEdCal [data-cal="2026-07-21"]` (its month arrows are buttons labelled
  "Previous month" / "Next month") and the line under it `#inpEditPop .rc-read`, the span picker
  `#inpEditSpan [data-span="all|am|pm|custom"]` (leave and medical kinds) or "all day" `#inpEditAllday` (the others),
  times `#inpEditStart` / `#inpEditEnd`, Remarks `#inpEditRmk`, the line of words `.inped-hint`, who placed it
  `[data-testid="inped-placed"]`, the unsaved-changes question `[data-testid="inped-swap"]` (`inped-swap-stay`,
  `inped-swap-go`), Delete `#inpEditDel`, Cancel `#inpEditCancel`, Add / Save `#inpEditSave`; the OIL question
  `[data-testid="oilconf"]` (one day: `oil-yes` / `oil-no`; several: `oil-all` / `oil-none`; then `oilconf-save`; its
  own Cancel is a button reading "Cancel"); the document question `[data-testid="docconf"]` (`docconf-nodoc`,
  `docconf-upload`); an upchit's summary `[data-testid="upconf"]` (`upconf-save`); the medical clash
  `[data-testid="medclash"]` (`medclash-save`); the passing note `#toastEl`; the gear `#inGear` and its window
  `[data-testid="win-inputsset"]` (`iset-memberfile`, `iset-save`, `iset-cancel`, hints `.sset-hint`); the tabs
  `#inMemberMode` (Inputs), `#inSansMode`, `#inMedBtn`; pages `window.go('inputs' | 'editsched' | 'logic' | 'admin')`;
  Undo / Redo `#undoBtn` / `#redoBtn`.
- **Reading, never writing:** `window.INPUTS`, `window.PEOPLE` through `page.evaluate` only to READ what was saved.
- **Judging:** a scenario with an expected result is PASS or FAIL — never "recorded". A FAIL names the step, what the
  screen said, and the picture. Do not explain a FAIL away; the host decides whether it is real. Check your own script
  first: a selector that matched nothing is your miss, not the app's — say which it was. Where a scenario's "See"
  differs from "What the app should now do" above (Astra read the source, not the ruling), the list ABOVE is the
  expectation — say so in the row.
- **Not part of this job (D56 and the lists above):** stored demo data from before this change; the "known, told to
  the owner" items; anything of the Tracker or the Leave War grid beyond what a scenario needs.

## What to hand back
`ivet-<L>.md`: one row per scenario — its number, the size, the role, PASS / FAIL / NOT RUN, what the screen said in a
line, the picture file(s) you opened (open and LOOK at each picture you cite). Then: every console or page error seen;
anything you saw that looked wrong and was not in a scenario (a line each, with its picture). `ivet-<L>.json`: the same
rows as data. Your final message to the host: the counts, every FAIL in one line each, the NOT RUN ones with their
reason, and the extras — in under 400 words.
