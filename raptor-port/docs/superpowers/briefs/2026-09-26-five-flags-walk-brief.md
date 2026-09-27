# Brief — the five-flags batch: the fanned-out WALK (four Opus walkers, 26 Sep 26)

The FULL-tier walk of `raptor-port/docs/bug-check-order.md` §5 (read §6–§8 and §10 before you start), fanned out per
D16. Each walker owns ONE item and walks it in the REAL production build. The scenarios are Fable's
(`raptor-port/docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md` — read your item's F-numbers and its §2
roll-call in full); the build is described in the two commit messages on `claude/five-flags-batch-build-ef7d85`
(`git log -2`). The builder reproduces every FAIL you report before it enters the evidence sheet.

## Common to all four walkers

- **Where:** `C:\Users\User\projects\Raptor\.claude\worktrees\five-flags-batch-build-ef7d85` (branch
  `claude/five-flags-batch-build-ef7d85`). The production bundle of commit `ca5d04e3` is ALREADY SERVED at
  **http://localhost:4176/** (the root, not `/Raptor/`).
- **Never:** rebuild (`npm run build` swaps the bundle under the other walkers), run the unit / browser / smoke suites,
  edit anything under `raptor-port/src`, `raptor-port/e2e`, `.claude/`, or any document except your own parts file,
  commit, push, or start another server. Read-only on the code; `git show main:<path>` is how you compare with `main`.
- **The world:** a fresh browser CONTEXT is a fresh demo world (Mon 13 – Sun 19 Jul 26, the browser backend, so it
  persists across a reload inside that context). Sign in with `ad` / `a` (admin, the signed-in person is **Saber**) or
  `us` / `us` (member, **Ranger**) — `#luser`, `#lpass`, `#loginForm button[type=submit]`; the week is up when
  `#vWeek .day` exists. Pages: `window.go('viewsched' | 'editsched' | 'inputs' | 'quals' | 'logic' | 'leavewar' |
  'tracker' | 'admin')` (the localhost probe bridge). **Build fixtures through the app's own controls** (§7.7); you
  may READ `window.DAYS`, `window.PEOPLE`, `window.SCHED`, `window.WARN` for your table. A new account for another
  person: Admin → Users (`#accAddName`, `#accAddPid` select, `#accAdd`), then sign out and in with that name and any
  password — make at least one write before any reload on a fresh world (§7.7).
- **The drivers:** `raptor-port/scripts/handpass/lib.mjs` (`open`, `login`, `go`, `board`, `closeBoard`, `tap`, `put`,
  `shot`, `publish`, `warnings`), `am/am-lib.mjs` (`editWeek`, `signDay`, `publishDay`, `head`), `am/w1-lib.mjs`
  (`toastSpy` / `toasts`, `shotBox`, `boardType`, `dragTo`, `norm`). Set `process.env.HP_URL = 'http://localhost:4176'`
  and `process.env.HP_SHOTS = <your picture folder>` BEFORE the dynamic `import()` of lib.mjs (it reads them once).
  `lib.open()` already adds `*{scroll-behavior:auto!important}`. Run your script from `raptor-port/`:
  `node scripts/handpass/ff-<you>.mjs`.
- **Useful hooks on screen:** the board is `#schedBoard`; the caption under a dragged puck is `.dwhy` inside the ghost
  (`.dragimg`, mouse; `.tdghost`, finger) with `.dragover-why` on the target; the green "where can he go" rings on a
  selected man are `.oktake` / `.oktake-f`; the top-bar Undo is `#undoBtn`; a toast is `#toastEl` (use `toastSpy`).
- **Every check is an assertion of the RIGHT behaviour** (PASS = correct), so re-running your script is the re-walk.
  **A picture for every check** — desktop 1440×900 and phone 390×844 wherever the surface exists (a close-up at
  `deviceScaleFactor` 3 where a 1–2px ring is the subject: `am/w2-lib.mjs openHi`). **Watch the error list** (console
  errors, page errors, 4xx) throughout — any entry is a finding.
- **Fable's two traps:** (a) the purple "this is you" class is passive — clicking that puck, or any highlight chip,
  removes it; inspect by computed style and pictures, never by clicking it; (b) the desktop week has no snap, but still
  read a landing's position on the landing frame AND after it settles.
- **Demo data (D56):** a problem that lives ONLY in data already stored, with the code right going forward, is NOT a
  finding — do not report it. If the app would do it again to NEW data, it is.
- **Output, three things:** the script `raptor-port/scripts/handpass/ff-<you>.mjs`; pictures in
  `raptor-port/docs/img/handpass/2026-09-26-five-flags/<you>/` (file names that say what they show); and a Markdown
  table `raptor-port/docs/handpass/parts/2026-09-26-five-flags-<you>.md` — your roll-call rows (YES / NO-because /
  MISSING, no blank cells), every check (id, what, PASS/FAIL, picture), the orders walked, **what you did NOT walk and
  why**, and any error seen. **Your final message:** every FAIL with its exact reproduction steps, its picture and your
  reading (new with this branch, or already on `main` — say how you know); then your explicit negatives. Budget about
  60–90 minutes. Do not fix anything.

## W1 — [PUCK-FLAG-GLOW] (D164): the "this is you" puck with a flag ring
Fable **F13, F14, F15** and §2.1 (rows 1–14 and 18). The build: `.puck.me.boxred` draws the plain 2px red ring and
`.puck.me.boxdash` nothing behind its dashes (`src/ui/scheduler.css`). Saber (`ad`) and Ranger (`us`) both carry a
red C on Monday in the seed. **Before / after for the owner's card:** on the same page, a close-up of the flagged
"this is you" puck beside another flagged puck, then the same after injecting `main`'s two old rules with
`page.addStyleTag` (`.puck.me.boxred{box-shadow:0 0 0 2px var(--hard),0 0 10px 1px rgba(240,85,95,.7)!important}` and
`.puck.me.boxdash{outline:2px dashed var(--hard);box-shadow:0 0 10px 1px rgba(240,85,95,.7)!important}`) — label them
before / after. For the dashed ring: a crew-rest breach sanctioned by `late show` (`e2e/geometry.spec.ts` near "the
sanctioned late show" shows the seed's casper case and the crew-rest setting it needs — reach it through the Logic page
and the board's remarks, then give casper an account on Admin → Users and sign in as him). Report, as Fable asks, what
the OTHER rings (amber, thin red, grey note, dotted) look like on your own puck against another man's.

## W2 — [LW-RESET-ORDER] (D160): Reset order in the Leave War's ⚙ Settings
Fable **F10, F11, F12, F18** and §2.2. Leave War: `window.go('leavewar')`; the top row's ⚙ is
`[data-testid="settings-open"]`; the new line `[data-testid="roster-reset-order"]` and its hint
`[data-testid="roster-order-hint"]`; Rearrange `[data-testid="roster-arrange"]`; the OIL tracker
`[data-testid="oil-tracker"]`. Read the grid's row order from the frozen name column. Walk it at desktop AND phone;
the member (`us`) has no ⚙ (one picture). The Leave War's own Undo is in its chrome and the top bar's `#undoBtn` is the
one Undo — use the one a person would. Include the reload, the war switch (Period picker), Rearrange on, Show SANS on,
and F12 through the Quals page (a CAT change; a new person via the Quals add form if it is still there).

## W3 — [CROWD-SWAP-SAYS-BUSY]: "already on" when a man is moved inside his own row
Fable **F1–F6 and F20**, and §2.3's five consumers (the drag caption, the drop toast, the armed palette's strike /
reason / "N free" / "show anyway", the palette tap's toast, the green rings). Monday's Common Programme: FLIGHT SAFETY
STAND-DOWN 08:30–09:00 (Ranger on it); make every overlapping row through the app's own controls (+ row, a retyped
time on the board — `boardType`). Desktop mouse drags (`w1-lib dragTo`, or the `dragPuck` shape in
`scripts/handpass/am/hr-03-batch-reads.mjs`), and on the phone at least F2 (the arm and the drawer's struck names) and
one finger drag if the driver supports it (`scripts/handpass/trk-pinch.mjs` shows CDP touch; say so if you could not).
F4 includes publishing Monday (`am-lib signDay` / `publishDay`) and the pending count (D109: a swap is two moves).
F6 (the duplicate) is expected to be the same on `main` — confirm by reading `main`'s code and say so.

## W4 — [VIEW-ARROW-OVER-LIST]: the day at the front sits beside the ‹ arrow
Fable **F7, F8, F9, F19** and §2.4 (landings L1–L16, the edge-docked controls). Measure after every landing: the front
day's left edge against `#weekPrev`'s right edge (≥ 4px clear), `document.elementFromPoint` at a point just right of
the arrow on the front day's first lines is the day (not the arrow), and an opened "⚠ N issues" list's first letters
are visible. Widths 1440×900, 1920×1080, 1024×700 (short), and 390×844 (the phone must be untouched: no left gutter,
arrows not drawn). View-only Sched AND Edit Schedule. The "day a–b of 7" read-out (`#hsLbl`) after each press. The ›
arrow's overlaps are observations, not failures (report them).
