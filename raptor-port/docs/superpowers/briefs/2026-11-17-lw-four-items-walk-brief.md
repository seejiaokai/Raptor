# The walk of the four Leave War items — the walkers' brief (17 Nov 26, chat 101)

You are a walker: you drive the real app in a scripted real browser and return pictures and a filled table. You never
read code to find bugs and never decide that something is a fault — the host does, from your pictures. Work in
`C:/Users/User/projects/Raptor-lw4/raptor-port` (branch `claude/lw-four-items`) — NEVER the folder
`C:/Users/User/projects/Raptor` (another chat's unsaved work). Do not edit, commit or push anything in the repo except
your own output folder named below. Do not run `npm run build`, any `npx playwright test`, or anything that writes
`raptor-port/dist`.

**Read first:** `docs/walk-scripts.md` §3 to §7 (how a walk script is written and what each trap has cost), and the
scenario report `docs/superpowers/briefs/2026-11-17-lw-four-items-scenarios-astra.md` (your scenarios are numbered from
it). The four changes, from the rulings:
1. **Balances (D2156):** every column set from the left, its heading starting where its box or figure starts, a long
   heading on two lines (the build wraps "INCL. CARRIED FWD" to three — known), the LVE and OTHER LEAVE labels at their
   group's start with rules over exactly their columns; LVE's pending column headed "PENDING APPROVAL", its figure a
   dashed amber tag with no minus; another kind's pending figure a small dashed amber tag on its box's top corner. The
   person window's tiles are NOT changed (they keep "Pending −1").
2. **The hover ring (D2157):** on a desktop the grid's one day under the mouse wears a thin cyan ring (inset 1px,
   rgba(59,198,232,.6)), hollow, no fill; the row's faint tint stays; a picked / dragged / just-landed day keeps its own
   stronger mark; names, headings, Events and manning rows never get it; a phone shows nothing new.
3. **The OIL award editor (D2155):** one fixed layout — amount, AM, PM, date; reason and given-by side by side; Save,
   Cancel, Delete — the AM / PM place empty (not greyed) when the amount is not 0.5, Delete always as wide as
   "Really delete?", so nothing moves. Admin only.
4. **The new period's name (D2158):** the New-period window's Name fills from the dates ("JAN - MAR 27"; one month
   "JAN 27"; across a year's end "DEC 26 - FEB 27"), follows them when they change; a typed name is kept when the dates
   change after; an emptied box follows the dates again.

Astra's corrections stand: "locked" means two separate things — **bidding closed** (the Open for bidding window) and
**balances locked for members** (an admin setting); a member with balances unlocked edits his OWN non-OIL boxes, every
other row read-only to him; the admin stays editable when members are locked.

## The build and the world

- Serve the frozen build, never the repo's `dist`: from `raptor-port/`,
  `npx vite preview --outDir C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/412624af-f93d-4b92-b143-0d2f8a03fb43/scratchpad/walk-dist-01f1030c4 --port <your port> --strictPort`
  in the background. Check your port is free first (`netstat -ano | grep :<port>`); prove it serves this build: the
  page's index names `index-C4m_44z2.js`. Stop it when you finish.
- Each browser context starts fresh (its own storage = its own demo world). Sign in through the real sign-in screen:
  admin `ad` / `a`; member `us` / `us` (Ranger). The route recipes, all passing on this build: `e2e/app.ts`
  (`login`, `openLeaveWar`), `scripts/handpass/lib.mjs`, and these tests in `e2e/leavewar.spec.ts`: "the OIL award
  editor: the amount 0.5 ↔ 1 ↔ 2.5…" (the tracker and the editor), "the grid's day under the mouse wears a thin
  ring…" (the hover), "a holiday on dates no leave period covers waits" (the Holidays ask and the New-period window),
  "M5a walk A-F3" (Balances on the phone). The probe calls those tests use (`lwSetRole`, `raptorRole`) are a test's
  shortcut — sign in as the person instead, except to set up a state no control reaches (say which in your table).
- Sizes: desktop 1536×864 Chromium by mouse; phone 402×874 Chromium with touch (hasTouch, isMobile, real taps — `page.touchscreen.tap`
  or CDP touch); phone 402×874 WebKit for every layout scenario (his phone is an iPhone). Load the browser library with
  `createRequire(process.cwd() + '/package.json')('playwright')`, run from `raptor-port/`. Write every script with the
  Write tool to your scratch folder and run the file; never inline `node -e`; never a heredoc; print a version line.
- The clock: leave it running (no frozen clock).

## Rules of the walk

- One picture per assertion that matters, named `<you>-<scenario>-<step>.png`, in your output folder. On a phone, a
  picture within about 100ms of each tap's lift as well as the settled one. A mark asserted as PAINTED is proved by the
  computed style of each element it must cover AND a picture.
- Each scenario with an EXPECTED line is PASS or FAIL against it; "RECORD" scenarios say exactly what the screen shows.
  A FAIL names the picture that shows it. Stop after 3 failed attempts at one gesture and record why.
- Your report goes to `<your output folder>/REPORT.md`: one table row per scenario × size × role — scenario, size,
  role, what you did, what the screen showed, PASS / FAIL / RECORDED, pictures. Then a list of anything odd you saw
  outside your scenarios. Send your report ONCE, after stopping every server and browser you started. Your final
  message: the count of PASS / FAIL / RECORDED and each FAIL in one line.

## W1 — Balances and the hover ring (port 4401; output `docs/img/handpass/2026-11-17-lw-four-items/w1/`; scratch `…scratchpad/w1/`)

Astra's scenarios 7, 8, 9, 10, 15, 16, 17, 18, 19, 20. Plus:
- **B-a** Balances at 1536 and 2560 desktop and 402 phone (both engines), admin: picture the whole header and the first
  rows; measure each heading's left edge against its column's first box or figure (report every pair more than 2px
  apart).
- **B-b** The phone's pinned name column (402, both engines, zoom 1): slide the figures sideways to 100px and 220px;
  measure the name heading's and each name cell's width against the first column (its grid track) and picture whether
  any figure shows inside the name column. As admin, as a member with balances unlocked, and locked; and after a
  pinch out and back.
- **B-c** A ½-day PL pending request for a man (made through the real request controls), on the phone: slide the PL box
  so its right edge is about 4px inside the list's right edge, tap it; picture and measure whether its amber tag ends
  inside the list's right edge.
- **B-d** Balances' Days taken view and the person window's tiles: RECORD — they must not have changed (the tiles keep
  "Pending −N").

## W2 — the OIL award editor (port 4402; output `…/w2/`; scratch `…scratchpad/w2/`)

Astra's scenarios 1, 2, 3, 4, 11, 12, 13, 14. Plus:
- **E-a** On a phone (402, both engines), open an award from the tracker as a person would (no script scrolling):
  picture it the moment it opens; RECORD whether any of Save, Cancel, Delete is cut at the screen's edge or under the
  pinned columns, and whether a finger slide brings it whole into view; then press each with a real tap.
- **E-b** A member opening the tracker: no editor, the awards read only (EXPECTED, D2155: admin only).

## W3 — the new period's name, and the plain-user round (port 4403; output `…/w3/`; scratch `…scratchpad/w3/`)

Astra's scenarios 5, 6, 21, 22, 23, 24 (desktop and phone). Then **the plain-user round** (the order's §7.0a), as admin
then as member, desktop and phone: the Leave War's everyday tasks start to finish — open the grid, file a leave request
on a day, look at it on Balances and Approvals, approve it as admin, open a person window and the OIL tracker and close
each by each of its ways (✕, Escape, a tap outside, Cancel), switch periods, undo and redo a change, reload — pressing
EVERY control that opens or closes something, and looking at every other place that should show the result. RECORD
anything that does not close, lands on the wrong page, or leaves a mark behind.
