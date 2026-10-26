# The M3 build's FULL check — what both walkers share (25 Oct 26)

You are a walker for a bug check of a scheduling web app (a fighter squadron's flying programme, with a second app inside
it, the **Leave War** — a year grid of who is on leave). You drive the RUNNING app with scripted real browsers
(Playwright), take pictures, and report PASS / FAIL / RECORD / NOT WALKED per scenario. You never change the app's source.

## Read first
- `raptor-port/docs/walk-scripts.md` §3 to §7 — how a walk script is written and every trap it has cost. Follow it.
- `raptor-port/docs/handpass/parts/lw-m3-build/designer.md` — the scenarios (numbers below refer to its table (b)), and
  its roll-call rows R1–R16 (§(a)).
- Your own scenario list: `brief-w1.md` or `brief-w2.md` beside this file.

## The build
- Served at `http://localhost:4180/` — already running; **never build, never start or stop a server, never run `npm`
  tests**. The served bundle is `index-BayEj7kB.js`; check once at the start that the page's script is that file.
- Sign in: admin `ad` / `a` (callsign Saber, id `stiff`); member `us` / `us` (callsign Ranger, id `bane`). Use
  `signInPlain` from `scripts/handpass/lw-r3-lib.mjs` (it goes to `http://localhost:${LW_PORT}/`, real storage, and lands on
  the Leave War). Set `process.env.LW_PORT = '4180'` and `process.env.LW_OUT` to YOUR picture folder BEFORE importing the
  lib (it reads them at import): W1 → `2026-10-25-lw-m3-build/w1`, W2 → `2026-10-25-lw-m3-build/w2` (under
  `raptor-port/docs/img/handpass/`).
- Every new browser context is a fresh demo world (real storage, empty). Never sign in twice in one context mid-fixture
  (walk-scripts §3; the order §7.7). A member who must bid on a day: the app's today is 25 Oct 2026 and a member never bids
  on a day before today (D1211) — use November or December 2026 dates, and make sure the date is open for bidding: as the
  admin, through the real controls (the grid bar's open-dates chip → "Open for bidding" window → a month button), or pass
  `today` to `signInPlain(w, 'member', '2026-01-01')` (the localhost test bridge) and use dates in 2026 that are open — say
  in the report which you did.
- Sizes: phone 402 × 874 (`L.newCtx('phone')`, Chromium) — and, for the phone taps that matter, the same in WebKit
  (`L.newCtx('phone', 'webkit')`); desktop 1536 × 864 (his PC; `L.newCtx` takes a size name — if 'desk' gives 1440 × 900,
  make the context yourself at 1536 × 864 with `L.launchOptions`). Report which.

## Pictures
- One picture per assertion that matters, cut to the area (`clip`), opened by YOU before you call it PASS or FAIL.
- On a phone, every tap that matters gets a picture within about 100 ms of the lift, the pointer left where it pressed
  (`L.finger(w, x, y, 0, name)` / `L.press(w, sel, name)` take one — "after-tap"), besides the settled picture; open both
  and name any tint, see-through cell or shifted box only the pressed one shows (the order §7.10).
- Folder per walker; your script empties it at the start of a run or writes a sub-folder per run.

## Known traps (met by the host today)
- **The Manning rows open folded on a phone** (D1258): the Available / Required rows (`[data-testid="avail-p-<iso>"]`) do
  not exist until `[data-testid="counts-toggle"]` is pressed. Press it, then read.
- The input window (Inputs page): `window.go('inputs')`; if `[data-testid="in-new"]` is not visible press `#inListBtn`;
  then `in-new` → `[data-testid="win-inputedit"]`. Person `#inpEditPerson` (selectOption by label, e.g. 'Drifter'), kind
  `#inpEditType` (value, e.g. 'Other', 'Attach', 'CSE', 'Training'), Attach's To `#inpEditTo`, remarks `#inpEditRmk`,
  dates by tapping `[data-testid="inpEdCal-day-YYYY-MM-DD"]` (a range: the start, then the end), Save `#inpEditSave`. After
  a save a question may open: a document ask (`docconf-nodoc`), an OIL question on a weekend or holiday — answer it with its
  real buttons and say what it was. The calendar inside opens on the loaded week's month (July 2026).
- An Other's Goes to: `inpEdit-goes-g` / `inpEdit-goes-u` (aria-pressed), the grey line `inpEdit-goes-line`.
- The Leave War: a cell is `[data-testid="cell-<personId>-<iso>"]`; reach it with `L.reachCell(w, id, iso)` (it turns the
  months). Person ids from callsigns: `page.evaluate(() => Object.entries(window.PEOPLE).find(([, v]) => v.cs === 'Drifter')[0])`.
  The bid window `bid-picker`; Duration `portion-full` / `portion-am` / `portion-pm`; leave buttons `bid-LL` …; decided
  buttons `decide-approve` / `decide-refuse` (their words read "Approved" / "Refused" when lit); the row under the leaves
  `bid-extra-row` (`bid-file-CSE`, `bid-file-OD`, `bid-oil`, `bid-more`); the ⋯ menu `bid-more-menu` with `bid-file-ATCH`,
  `bid-file-OTH`, `bid-postout`, `bid-postin`. The drag window `select-sheet`, its ⋯ `sel-more` / `sel-more-menu` /
  `sel-file-ATCH` / `sel-file-OTH` / `sel-postout`. A member's closed day opens `closed-note`, its ⋯ `closed-more` /
  `closed-more-menu` / `closed-file-ATCH`. The day's list `daylist` (`dl-approve-<id>`, `dl-refuse-<id>`). Close a window
  with `L.closeAny(w)`. The manning bubble `manning-bubble` (its words in its `aria-label`; `data-level` red / amber), its
  Show `manning-bubble-show`.
- Edit Schedule (W2): `window.go('editsched')`; a day is `#eWeek section.day[data-day="<0-6>"]` (the loaded week is Mon
  13 – Sun 19 Jul 2026, day 0 = Monday); its lists `.sec-unav` (Unavailable), `.sec-grnd` (Ground Programme), `.sec-inp`
  (Personal Inputs — folded: press `[data-pitog="<di>"]`); an input's buttons `.accb` ("→ Ground", "→ Unavail", "Reject").
  The Scheduler Board: `scripts/handpass/lib.mjs` `board(page, di)` / `closeBoard`; publishing a day there: `lib.mjs`
  `publish(page, di)` (it picks the four sign-offs). `lib.mjs` reads `HP_URL` — set it to `http://localhost:4180`.
- Worked examples of every step above: `scripts/handpass/lw-1025-attach-look.mjs` (an Attach filed through the Inputs
  window, then pictured on the war, the Manning rows opened, the ⋯ opened) and `scripts/handpass/lw-1025-q7.mjs`.
- Scripts: write each with the file tool to `raptor-port/scripts/handpass/lw-m3b-<w1|w2>-<part>.mjs`, run it with `node`
  from `raptor-port/`; never pass a script inline to the shell (an apostrophe breaks it); never rewrite and run a script in
  one step. Print a version line at the top of each run.

## What is not a finding (D56)
A problem that lives only in data already stored — a "Fly with" or UNA record already in the demo store — is not a finding
when the code is right going forward. Do not report it.

## Stopping
- Stop and report after 3 failed attempts at one gesture (say what you tried).
- Watch the console errors, page errors and failed requests in every context; any is a finding.
- When done: stop every script and browser you started; write your report ONCE to
  `raptor-port/docs/handpass/parts/lw-m3-build/<w1|w2>.md` — a table: scenario · size/engine · what the screen did (from
  what you READ) · PASS / FAIL / RECORD / NOT WALKED · pictures; then the roll-call marks you can give (row · SHOWS · USABLE
  · WHAT ELSE IS PAINTED), errors seen, and a list of anything you could not do. Hand back a short summary (counts and the
  FAILs, one line each). Do not commit.
