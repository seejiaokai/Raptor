# The walkers' brief — the schedule's marks and words (chat 13, 8 Nov 26)

Four Sonnet walkers, each in its own world, walk Astra's scenarios on ONE frozen build. Each walker reads the common part
and ITS OWN section only. The evidence sheet is `docs/handpass/2026-11-08-sched-marks.md` (the host's); the scenarios,
word for word, are `docs/handpass/parts/2026-11-08-sched-marks-scenarios.md` — read your scenarios there in full (their
steps, EXPECTED, Disproof). Where this brief changes a scenario's EXPECTED line, THIS BRIEF WINS (each change says why).

## What changed in the app (so you know what you are looking at)

1. **The waiting mark on an Unavailable row (his D1784).** "An input filed, changed or moved after its day was published
   wears the same waiting mark on its Unavailable row as on a Ground Programme row — its name underlined dotted in the
   amendment's colour on the week, its name box outlined dotted on the board — until the day's next amendment goes out."
   Not on a day never published, not in a look at a version or a plan, not in OIL Earn mode (as the Ground name), not on
   Personal Inputs or SANS cards. On View-only Sched it follows what the Ground name does there.
2. **A week whose saved copy will not read (his D1785).** Each day says, exactly:
   `This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on the Help page.`
   A change refused because of it shows the grey "Blocked:" note (red no-entry sign, bold "Blocked:", quieter words), exactly:
   `Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it with “Report a problem” on the Help page.`
   A week published by an OLDER version of the app (a different case) keeps its words: "Blocked: this week was published by
   an older version of the app, so it can’t be edited. Nothing was saved." (no "Report it").
3. **Two drawn marks (his D1792 a, d).** The 👁 on a look at a published version or a saved plan is now the app's drawn
   line eye (11 px in the plans selector, 12 px in the "Viewing …" banner, the text's own colour). A hidden warning's ↺
   is now the drawn Reset arrow (13 px); the ✕ that hides a line stays typed; both buttons keep their words on hover:
   "Flag this again" and "Hide this warning — it flags no puck and is not counted; it comes back if the situation changes".

## The rules every walker keeps (read `docs/walk-scripts.md` §3 to §7 before writing a script)

- **The build is frozen** at `SM_DIST` (default inside `scripts/handpass/sm-lib.mjs`). Never run `npm run build`,
  `vite`, `npx playwright test` or anything that builds; never edit anything under `src/`, `e2e/`, `.claude/` or any
  document but your own report. Never commit, never push. Write only: your own scripts `scripts/handpass/sm-<you>-*.mjs`,
  your pictures under `docs/img/handpass/2026-11-08-sched-marks/<you>/`, and your report
  `docs/handpass/parts/2026-11-08-sched-marks-<you>.md`.
- **Your world:** import `./sm-lib.mjs` and launch with YOUR origin (below) — `L.launch('pc'|'phone', { origin })`. It
  serves the frozen build inside the browser (no server, no port held) and starts the clock at Mon 13 Jul 26 09:00,
  left running. The PC is Chromium 1536 × 864 at 1.25; the phone is WebKit 402 × 874, touch (his iPhone's size).
- **Scripts:** write each to a file with the Write tool and run it with `node scripts/handpass/sm-<you>-….mjs` from
  `raptor-port/` (absolute path: `C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port`).
  Never pass a script inline (`node -e` loses backslashes on this PC; a heredoc with an apostrophe never parses). Never
  rewrite a script and run it in the same step. Print a version line at the top of every run. Wrap a run in
  `timeout 600 node …` so a hung browser cannot hold you.
- **Proven routes (the recipes — `scripts/handpass/sm-host.mjs` ran them on this build, all passed):**
  sign in `L.signIn(W,'a')` (Saber, admin) or `L.signIn(W,'m')` (a member); publish a day `L.publishDay(W, di)`
  (the board's sign strip; Wed 15 Jul is di 2); file an input `L.fileInput(W, { who:'Bolt', type:'LL', iso:'2026-07-15' })`
  (answers the document and OIL questions; `oil:'yes'|'no'`); open the window without saving `L.fillNew(...)` then
  press `#inpEditSave`; Edit Schedule `L.goEdit(W)`; the board `L.openBoard(W, di)` / `L.closeBoard(W)`; read the
  waiting mark AS PAINTED `L.weekUnavMark(page, di, 'Bolt')` and `L.boardUnavMark(page, 'Bolt')` (computed underline /
  outline — a `data-aln` attribute alone is NOT a mark seen); the day's count `L.dayPending(page, di)`; the plans menu on
  the board `[data-planmenu="2"]` then `.wavemenu [data-planpv]` (the issued versions, read-only); the toast
  `L.toastText(page)` (`face:'blocked'` is the grey note). Ground Programme row filed from an input:
  `#eWeek section.day[data-day="2"] .pl-row.gr-frominput`, its name `.ntx[data-aln]`.
  **The week's warning list is folded:** open it with `[data-daywarn="<di>"]` inside the day; the list is
  `[data-dwbox="<di>"]`; the demo Tuesday (di 1) has four issues (recipe: `e2e/warnhide.spec.ts`, passed 8 of 8 here).
- **The unreadable week (fixture U):** build the healthy world, take `state = await W.ctx.storageState()` and
  `key = await L.weekRowKey(W.page, 2)` (the Wednesday's saved row), close, then open a NEW world with
  `L.launch(size, { origin, state, init: L.damageInit(key) })` — the row is damaged before the app reads it (the same
  route as the approved drawings). The same origin as the state, always. A stashed U: load U, then go to another week.
  For a damaged NEXT week (S4) damage a `weeks/20-07-2026#<d>` row the same way (prove the key exists first).
- **Routes NOT proven by the host** — prove each one's first step on the screen before you build a fixture on it, and
  name in your report how you reached it: the Leave War (recipes: `e2e/app.ts` `openLeaveWar`, `lwRole`; older walk
  scripts `scripts/handpass/lw-*.mjs`); OIL Earn on the board (`scripts/handpass/oeb-w1-lib.mjs` `oilOn` — the `#sbOil`
  button or `[data-oilmode]`); a member (`L.signIn(W,'m')`, or change the role in place with
  `page.evaluate(() => window.raptorRole('member'))` — never sign in again mid-fixture on a fresh world, §7.7 of the
  order); a guest (find how in `e2e/geometry.spec.ts` near its access-screens block; if not found in 3 tries, record
  "guest not driven" and go on); View-only Sched `window.go('viewsched')`; Admin person delete; print and the
  spreadsheet export.
- **Every press on a phone:** prove on screen what it opens before pressing inside it (in the screen, not scrolled by
  the script); take one picture within about 100 ms of the lift as well as the settled one, and look at both.
- **A word is found by the element that draws it** (a box wider than zero inside the surface you check), never by a
  pattern over a container's text. A negative check first proves its subject exists ("no mark" on a row that is drawn).
- **One picture per assertion that matters, cut to it. OPEN every picture you take before you count the step as looked
  at** (the order's anti-pattern 21). A mark is judged by its computed style AND its picture.
- **PASS / FAIL** only where an EXPECTED line is given; **RECORDED** where it says "RECORD exactly what it says" — copy
  the words exactly, with a picture. **NOT DRIVEN** with the reason where a control does not exist on screen — never
  force one into existence by calling the app's code.
- **Stopping:** after 3 failed attempts at one gesture, record it NOT DRIVEN with a picture and go on. When done, close
  every browser and script you started, then write your report ONCE and hand back a short summary (counts and every
  FAIL in one line each).
- **What is not a finding (his D56):** a problem living only in data already stored is not a finding. The older-version
  week (fixture O, S15) exists only as older stored data — record what it says; never report it as a fault.
- **The report** (`docs/handpass/parts/2026-11-08-sched-marks-<you>.md`): (1) a table — scenario.step · size (PC/phone)
  · EXPECTED · what the screen said or showed · PASS / FAIL / RECORDED / NOT DRIVEN · picture file; (2) for each roll-call
  row you were given: what SHOWS there, whether its gesture WORKS, what else is DRAWN on those pixels — each with a picture
  (the host writes the roll-call from this); (3) every page error or console error seen, or "none"; (4) anything odd you
  saw that no step asked about, with a picture.

## W1a — the waiting mark: kinds and identities (origin `http://localhost:4391`, you are `w1a`)

Scenarios **S18 first** (the simple "2 pending": LL for Bolt and Saint's Meeting "Safety brief" on published Wed 15 Jul,
the Ground name and the Unavailable name both marked, both gone after Publish AL1), then **S17, S25, S6, S7, S8, S9**.
Roll-call rows: **1** (week, PC), **2** (week, phone), **3** (board, PC), **4** (board, phone), **6** (OIL Earn — must not,
as the Ground name), **9** (Personal Inputs and SANS cards — must not), **10** (the day's "N pending" and the changes window
agree with the marks).
Changes to EXPECTED lines: **S6, S7, S8, S25** — the host's reading, not a ruling: a row is marked exactly when the
changes window ("To go out") lists its input as changed; record for each row whether the changes window lists it, and
PASS/FAIL that the mark and the list agree. **S17:** at least one of each group — a leave (LL), a medical (ATT C or HL),
OD, an activity filed under Unavailable (Training or Other), a shared input; the rest RECORDED if time allows.
**S9:** the Unavailable name in OIL Earn carries no mark, as the Ground name carries none there (measure the Ground name
in the same mode first and record it).
Lessons to check in your steps (the checklist's numbers): 1 (a table of state × reading for the mark: unpublished,
published clean, pending, after AL1), 3 (after each press: what tells the person, what is out of sight), 8 (compare with
the drawings `docs/img/handpass/2026-11-07-pictures-round/q-unavmark-*-A.png`), 9 (the marked row measured against its
neighbours, phone and PC), 17 (OIL Earn both ways and back), 22 (pixels, not attributes), second 23 (side-by-side boxes on
one line, phone and PC).

## W1b — the waiting mark: orders, faces and returns (origin `http://localhost:4392`, you are `w1b`)

Scenarios **S21 first** (Undo, redo, reload, week return), then **S19, S20, S22, S23, S24, S30, S31**.
Roll-call rows: **5** (board read-only, a member), **7** (View-only Sched — must not paint, as the Ground name),
**8** (a look at a version or a plan — must not), **10** (the count and the changes window agree), **22** and **23** (the
drawn eye in the plans selector and the look banner, week and board, PC and phone).
Changes to EXPECTED lines: **S24** — the Unavailable name on each face follows what the Ground name does on the SAME face
(measure the Ground name first); a member and a guest see no ✕ and no Reset arrow. **S20** — the draft Friday never
carries the mark; for the year-end case RECORD only (skip it if no published day exists in that week). **S31** — wait at
least 15 seconds away from the page before returning; picture the first frame on return as well as the settled one.
Lessons: 1, 3, 4 (a window open: press the page behind it), 10 (a page changed while hidden, come back by every route, in
WebKit), 11 (1536 and 2560 wide for the selector's eye), 12 (every page the changes window opens from), 17, 19 (each
window closed by each of its ways), 22, 23 (what a tap on a changes-window line opens, side by side with an ordinary day).

## W2 — the unreadable and older weeks (origin `http://localhost:4393`, you are `w2`)

Scenarios **S10 first** (every day's notice, desktop and phone, View-only too; Help → "Report a problem" opened, nothing
sent), then **S11, S12, S13, S14, S1, S2, S3, S4, S5, S15**. S16 is the host's (a test fixture only).
Roll-call rows: **11** (the notice on Edit Schedule, every day, PC and phone), **12** (View-only Sched), **13** (the board
— record whether any control opens it on U), **14** (next week's desktop preview — known MISSING: picture what it shows),
**15** (print and the spreadsheet export — known MISSING: picture or save what each produces), **16** (the input window:
new, edit, medical), **17** (drag, Accept, → Unavail, Goes to on the schedule), **18** (the Leave War's approve, send
back, delete, move), **19** (deleting a person), **20** (Publish / Publish AL on an unreadable week — from the board's
sign strip if the board opens at all), **21** (the older-version week's notice and refusal).
Changes to EXPECTED lines: **S2** — the Leave War has refusals with their own true reasons, kept on purpose: PASS/FAIL
only that no protected date changes and that no refusal on an unreadable week blames "an older version of the app";
RECORD every word. **S3** — RECORD. **S4, S5** — RECORD with pictures (the host files them; they were found before this
walk). **S15** — RECORD only (D56). **S14** — the most important unknown: whether Publish or Publish AL can be pressed on
an unreadable week at all; record each control you find and what it does.
Plain-user round (the order's §7.0a), on a HEALTHY week: file an input on the Inputs page, open it, edit it, close it,
Undo — pressing every control that opens or closes something (Close, ✕, Escape, a tap outside, on the input window and
on any window over it), and look at the schedule and the bell after.
Lessons: 1, 3, 5 (a note moved into sight: is anything over it — the keyboard, a window), 10, 12 (every opener of the
input window), 14 (every text box family in the input window, tapped on the phone), 16 (after a refusal: tap away, tap the
box again, type its value), 18 (print and download: Chromium and WebKit pictures), 19, 21 (name what only his iPhone can
show), 22, 23.

## W3 — the drawn marks and the plain-user round on the schedule (origin `http://localhost:4394`, you are `w3`)

Scenarios **S26 first** (hide and flag again on both lists), then **S27, S28, S29, S32**.
Roll-call rows: **22**, **23**, **24** (the wave templates window's eye — unchanged), **25** (Reset arrow on Edit
Schedule, PC and phone), **26** (Reset arrow on the board, PC and phone), **27** (a member and a look — no ✕, no arrow).
Changes to EXPECTED lines: **S26** — the all-hidden summaries RECORD (compare with `e2e/warnhide.spec.ts`, which reads
them); the two hover words PASS/FAIL exactly as written above. **S28** — sizes measured with the element's box (11 / 12 /
13 px); History's clock compared on the same bar, both pressed. **S29** — an outside tap on a window that does not block
the page is not expected to close it; RECORD what each way of closing does, and FAIL only a close that shuts the window
underneath or loses a saved change.
Plain-user round (the order's §7.0a) on Edit Schedule and the board: file a leave on a published day, see its mark, open
it from the week and from the board, edit it, close it by each way, Undo, Redo, publish the amendment; look at the
changes window, the bell and View-only Sched after each.
Lessons: 1, 2 (keyboard: Tab to the marked name and the warning buttons, press them with Enter/Space), 3, 5, 6 (the
phone keyboard opened and closed over a text box), 8 (beside the drawings `q-r5a-*-drawn.png` and `q-r5d-*-drawn.png` in
`docs/img/handpass/2026-11-07-pictures-round/`), 9, 11 (1536 and 2560), 13 (a pinch part-way down the board on the
phone), 15 (bars over a scrolled list: nothing shows through), 17, 19, 20, 21, 22, second 23.
