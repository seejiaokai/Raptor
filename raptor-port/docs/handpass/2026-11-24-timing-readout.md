# The hidden ?timing readout — evidence sheet ([APP-SPEED] step 1; D2481, D2483)

Branch `claude/app-speed-readout-161` (chat 161), pull request 840. Pictures: `docs/img/handpass/2026-11-24-timing-readout/`.
The approved mock-up: https://claude.ai/artifact/7bgefju2mwrGJzc2ACSExS (its words Fable's review, adopted whole).

## The eight answers and the tier

1. Money / OIL / who counts as present — NO: it reads times and the computer; it writes nothing any count reads.
2. The published record — NO: nothing published, signed, amended or exported.
3. Saved data — NO: it writes nothing to storage (no `localStorage`, no backend); the marks live in memory for the tab.
4. A shared drawer — NO: one line in `setPage` (a mark, no drawing); no routine that draws a man, a row or a day changes.
5. A new gesture or mode — YES: the `?timing` switch (a mode), Copy all, the fold ✕, the corner button.
6. A new surface — YES: the window and its corner button.
7. Roles — NO: it shows no person's details and gives no power; a member and an admin see the same window.
8. The warning list — NO.

**Tier: WALK.** Not a security change (no sign-in rule, no permission, no person's data shown) — no security read.

## The roll-call

**A. The window (a new floating surface — z 410 when built, z 405 since chat 165's R2 fix: behind the app's own windows, never in their order) and its corner button — every surface it can stand over.** Filled by chat 167 from `walk3`–`walk5`.

| Surface under it | SHOWS (window drawn, readable) | USABLE (drag, ✕, Copy all, button) | PAINTED on the same pixels |
|---|---|---|---|
| Sign-in card (desktop, phone) | has it — W4 at every size, W24 loaded in front and behind (pictured) | has it — W4 (✕, Copy all, the button, drag, at 1366, 1024×600, 390, 320) | must not cover the card: W32 PASS — its boxes and Sign in clear at 768×1024 and 800×600; at 1366 the card stands left of the window |
| View-only Sched week (desktop, phone) | has it — W5, W26, W34 (pictured) | has it — W4; W22 Copy all | W32: the week's foot clear, open and folded (desktop); on a phone the open window is a panel over the week's foot and starts folded (W4-phone-start) — as the approved mock-up |
| Edit Schedule week, the board open | has it — W20 desktop and phone, W19 (f) (pictured) | has it — its ✕ in front of the board; folded, the corner button on top and the board's Done still Done's (W20-board, -board-folded, both sizes) | W32 RECORD, corrected by chat 167 from the pictures: open at the start (bottom right, where the approved mock-up puts it), at 1366×768 it stands over the whole Aircrew list — the pilots and WSOs a scheduler drags from (`walk5/W32/03-editsched-open.png`); the two foot buttons the step named, Traffic and "+ In-time", lie behind that list anyway (`04-editsched-folded.png`) — for his look; folded, nothing covered |
| Inputs (list, calendar) | has it — W8, W26 (pictured) | has it — W8: typing in the page's box while the window arrived, the caret kept | the page under it usable: W26, an input's window opened and closed every way, the Timing window untouched |
| Quals · Logic · Help · Admin | has it — W5 each page timed with it open; W33 Admin (pictured) | has it — W23 top bar and keys | nothing of theirs at the window's corner in the walked pictures (W5) |
| Leave War grid (its own pinned bars) | has it — W5, W7, W29 (pictured) | has it — W29: with the keys in it, Escape folds it, the person window stays | the "Open for bidding" sheet over the window (W20 RECORD, the sheet's own layer), a month inside it pressable (W21 PASS, desktop and phone) |
| Tracker | has it — W5, W26, W28 (pictured) | has it — W29-tracker: Escape folds it, Show All as it was | nothing of the Tracker's under the corner (W26 picture) |
| The failed-save band, the "Not kept" band | has it — W13, W27, W34 | has it | must not cover: W13 the band's Retry free (desktop); W27 PASS on a phone with 30 rows — the window's top 93 px, under the bar's foot (85 px), Retry free; W34 PASS the "Not kept" band, desktop and phone, no point of it under the window |
| Another movable window (ALL AVAIL, changes, an input's window) | has it — W19, W20, W26 (pictured) | has it — W20-desk-two-windows: ALL AVAIL in front, the Timing window stays behind it even when pressed, its ✕ reached once ALL AVAIL closes; W20-phone: ALL AVAIL's panel over the corner button, which opens the window once ALL AVAIL is closed | must not take the app windows' place: behind every app window (W20 PASS); Escape answers the app window first (W19 c–h, W29, W30) |
| A dialog (z 470) or the ☰ drawer (z 440) | the box and the drawer over it — W33 desktop and phone, W20-phone-drawer (pictured) | the box's ✕ on top and pressable; the window's ✕ (desktop) or corner button (phone) usable again after (W33 PASS) | must not cover a box or the drawer: W33, W20-drawer PASS |
| The week's foot scroll bar (desktop) under the corner button | has it — W32 folded | has it | W32: nothing at the week's foot covered, folded (View-only Sched and Edit Schedule) |

**B. The page mark — one row per opener of a page (every caller of `setPage`).**

| Opener | Timed once, to the right page | First time / opened before right |
|---|---|---|
| Top bar link | has it — W5 (all nine pages, each within 0.05 s of the outside stopwatch, walk5), W23-top-bar, -top-bar-admin | has it — W5 "first time" then "opened before", walk5 |
| Phone ☰ drawer link | has it — W23-member-drawer (walk4: one row a page, six pages) | has it — W7-after, W11 (drawer) |
| Sign-in landing (`resetSession`) | has it — W5-signin (1.2 s against 1.25 s outside, walk5), W17-good, W13 | has it — the week's first row; W13: a second sign-in adds no row of the signed-out wait |
| Sign-out | has it — W13: no row holds the signed-out wait; W26-signout to the sign-in card | has it — O3 (chat 165): a new sign-in starts every page as first again (`timing-watch.test.ts`) |
| Role switch landing (store.ts, Edit Schedule/Admin → View-only Sched) | has it — W23-member-view-switch, one row "View-only Sched" | has it — "opened before" |
| Page reopened after a failed download's Retry (Login.tsx `takeReopen`) | has it — W7-landing (walk5: 0.5 s against 0.49 s outside), no row while the card showed | has it — "first time", no "downloaded" (the server sent nothing whole — fix 4); next visit "opened before" |
| A page left before it finished drawing | has it — W11-left: no row for the abandoned visit | has it — W11-abA RECORD (A→B→A at once: each row its own) |
| The bell, Check my quals, OIL list, Back (W23's other doors) | MISSING: the bell not walked — no notice in the admin's bell list on the demo day (W23-bell); carried by the one mark every door shares (`setPage`; `timing.test.ts` "a page change is marked with the page asked for; staying on the same page is not") | Back: RECORD — leaves the app (about:blank), no row |

**C. Without the switch — the app as before.**

| What | Proved by |
|---|---|
| No readout file downloaded, nothing drawn | W1a/W1b (walk2): a whole session, every page, 20 requests — none names the readout; no `#timingRoot`, no window, no button; W1c no error |
| The app's own first download the same as `main`'s | W1d: **FAILED on the first build** (19 files against `main`'s 15 — the readout's imports split the app's own files); fixed (`ced82eaf7`, the window handed React and the movable window); re-walked: 15 and 15, the same names. Pinned by `timing.test.ts` "the readout imports nothing the app's first download holds" (red before the fix) |
| The marks do nothing | `timing.test.ts` "off: a mark is dropped…", "off, a page change marks nothing"; `timing.ts` returns on its first line without the switch; the press listeners and the freeze counter are started only with it (`arm()`, `watchFreezes()` behind `ON`) |

## The five sizing lines (§7.0)

Written by the host (Opus, chat 164) before the walk, 24 Nov 26.

1. **The type of change:** B (a new window and its corner button), C (a new mode — the `?timing` switch — and its
   controls: ✕, Copy all, the corner button, the drag) and A-like (one stopwatch read by one window; the marks sit in
   three shared places — the start, the sign-in, `setPage`). Not D (nothing drawn in several places), not G (nothing
   saved), not H (the same for every role).
2. **What only a walk could find here:** (a) that the app WITHOUT the switch downloads, draws and does nothing new —
   only the built bundle shows how the files split; (b) whether each figure agrees with an outside stopwatch on the
   real build at 4× — the tests run a hand-stepped clock, never real frames, a real claw or a real download;
   (c) the window over every other layer (z 410 against the board 400, the drawer 440, a dialog 470, the bands), its
   presses hit-tested; (d) Escape and the keyboard with a window that is open all session; (e) the late download,
   a failed download, Retry's reload and a hidden tab — real browser events. The unit tests already carry the
   stopwatch's logic order by order (`timing-watch.test.ts`, 14 cases) and every word (`timingtext.test.ts`).
3. **What the ledger says:** B walks found a fault on 4 of 5, C on 8 of 15 (the wide ones). No earlier walk was of a
   readout that measures; the nearest is a hidden debugging switch (`?kbdebug`), never walked as its own change.
4. **The walk chosen:** the host alone, by scripts (`scripts/handpass/timing-walk*.mjs`), on the built app served by
   the script's own small server (compressed, answering "unchanged" to a repeat ask, as Vercel does), real Chromium:
   desktop 1366×768, a browser STARTED at 125% (his PC, the guide's §7), a phone 390×844 with touch, a short screen
   1024×600 and 320×568; WebKit for "not given by Safari". One world is enough — nothing is saved, every scenario starts
   in a fresh browser. Not fanned out to helpers: almost every scenario needs the developer protocol (a slowed CPU, a
   held or refused download, a hidden tab) timed to a press, and the host holds the code. 26 scenarios (W1–W26 below);
   the plain-user round is W26. Carried by a test, each named below: the stopwatch's repeated orders (two pages in a
   row, a second sign-in) — the walk drives each distinct route once. What only his look can show: Safari on a real
   iPhone, Firefox, Edge, and the office computer itself.
5. **After the walk:** its row in `docs/walk-ledger.md` — below, at the close.

## The orders walked

Each W-step below is one order, walked on the built app (the combined list's EXPECTED beside it; results in "What the
walk found"). Every order reached a result: W1–W34, walked in rounds `walk1`–`walk5`; the last round of each is the one
that counts. Nothing here is published, saved or paid, so there is no "money" side: the downstream result is the
readout's own figure, checked against an outside stopwatch armed in the page before each press (W5, every figure
within 0.05 s), and against the server's own answers (W7, W14, W28).

## Cases carried by a test

- The stopwatch's repeated orders (two pages in a row, a second sign-in, a page asked for twice) — `timing-watch.test.ts`
  (each fault of F1–F9, fixes 2–4, O2, O3, OPEN 7 pinned, each seen red first).
- Every word and figure the window shows, "not given by …", "under 0.1 s", the file counts — `timingtext.test.ts`.
- The window's Escape, keys, Copy all and its newest press — `TimingReadout.test.tsx`, `boardescape.test.tsx`.
- Nothing without the switch; the readout outside the app's first download — `timing.test.ts` (and W1 walked).
- A28 (the two-minute give-up) — the code's one constant, not walked (above).

## The scenarios (Astra's and Fable's, combined)

Designed blind to each other, 24 Nov 26, on the first build (`81f62f830`): the brief
`docs/superpowers/briefs/2026-11-24-timing-readout-scenario-brief.md`; Fable's 26 scenarios
`…-scenarios-fable.md`, Astra's 30 `…-scenarios-astra.md`. Both found, by reading, the same faults in the stopwatch
(F1 the claw on the page body, F2 the window arriving late, F3/F4 the sign-in and sign-out waits, F5 the caret, F6 a
page credited with another's download, F7 "zoom", F9 a hidden tab) — fixed red-first in `146111e63` (`timing-watch.test.ts`,
`TimingReadout.test.tsx`; F1 and F5 put back by hand and seen red). Still open, for his look: what Copy all shows
when the browser refuses to copy (both readers — something new he would see, so a mock-up first, D1625).
**The combined walk list** (chat 164; F = Fable's S-number, A = Astra's number). Sources: D2481 (the switch: nothing
without it, nothing saved, nothing about a person), D2483 (the window and its approved words — the mock-up), the plan's
§How it was measured (the end of a page's time: the page on, no claw, two frames — the host's reading of what the
readout must agree with, not a ruling), the fix commit `146111e63` (the stopwatch's intended behaviour for F1–F9 — the
host's reading), D641/D1523/D2112 (the movable windows: the page behind usable, clear of the failed-save band, Escape
closes what opened last), D1631–D1638 (a page's failed download and Retry). An EXPECTED with no source is RECORD.

| # | Scenario | From | EXPECTED (source) |
|---|---|---|---|
| W1 | No switch: the app's first download, every request through a whole session, nothing drawn | F2, A1 | no readout file asked for, no `#timingRoot`, the first download the same files as `main`'s build (D2481; "as on `main`") |
| W2 | The switch's spellings: `?timing`, `?x&timing`, `?timing=1`, `?TIMING`, `?timings`, `#timing`, `?timing=false` | A29 | on for the first three, off for the next three (the switch's own test); `=false`: RECORD |
| W3 | Nothing saved, nothing about a person: storage before and after a session with the switch, against one without; Copy all read whole as admin and as member | F3, A26 | the same keys as without the switch; the window back at its corner after a reload; no name, callsign or role in the copy (D2481) |
| W4 | The window: open bottom-right on a computer, folded bottom-left on a phone; ✕ folds to "Timing N s"; the button reopens it; drag; 30+ pages; 1024×600, 320×568; the title's second line whole | F18, A23 | as the mock-up (D2483); ✕ and Copy all always on screen; the list keeps 30 |
| W5 | Every figure against an outside stopwatch, 4× CPU: sign-in → week, the nine pages first and again, Leave War and Tracker first with the claw | F1, F4, A2, A16, A18 | each within 0.2 s or 15% of the outside time (the host's reading of the plan's end); Leave War/Tracker "first time · downloaded about 137/123 KB", the row only after the claw has gone |
| W6 | Sign in, tap Inputs before the week is drawn, wait 30 s, back to View-only Sched | F5 | the sign-in row stays "not yet" (fix F3) |
| W7 | Retry's reopen: Leave War's file refused, the card, Retry, sign in → lands on the Leave War | F6, A4 | `?timing` kept; the Leave War timed from the press; no week time later; its next visit "opened before" (fix F3; D1635) |
| W8 | The window's own file held 8 s; sign in and open two pages meanwhile; typing as it arrives | F7, A6, A25 | the rows their real times, nothing near 8 s added; the caret stays in the box being typed in (fix F2, F5) |
| W9 | Typing at once on a computer: name, Tab, password, Enter without a click | F8 | signed in; the caret was in Username (Login's standing rule; fix F5) |
| W10 | The Leave War fetched in the background (desktop, 2 s idle), then Inputs first, then Leave War | F9, A9 | Inputs "first time" with no "downloaded"; Leave War: RECORD |
| W11 | A page left before it is drawn; A→B→A at once; a tap on the page already open | F10, A7, A27 | no row for the abandoned visit; B's row B's own; the page already open no row (fix F3) |
| W12 | A failed download: the card, Retry with the file still refused; the window over the card | F11, A3, A5 | no row for the card (fix F1b); the card's Retry not covered; the window usable (D1631–D1638) |
| W13 | Sign out with a save waiting (`?savefail&timing`), 30 s, sign in again | F12, A8 | no row holding the signed-out wait; the band and its Retry not covered (fix F4; D1523) |
| W14 | A cleared first visit, a reload, a return in a new tab: the kept-files rows against the browser's own list | F13, A10 | 0 kept on the cleared visit; the counts the browser's own (D2483) |
| W15 | WebKit (Safari's engine): every row and Copy all | F14, A12, A20 | "not given by Safari" where it gives nothing; never blank, 0, "undefined", "NaN" (D2483) |
| W16 | His 125% display; a phone: Copy all's display lines | F15, A11 | "Display scale 125%" and "Screen in its own pixels" — never "zoom" (fix F7) |
| W17 | A wrong password; the ask-for-access screen; then a good sign-in | F16, A17 | no row from the wrong press; the access screen leaves "not yet"; the good sign-in its own time |
| W18 | Does the window slow what it measures: five passes open, folded, and without the switch | F17, A19 | RECORD the three medians beside each other (no figure ruled) |
| W19 | Escape, the window open: a cell being typed in, a seat picked, ALL AVAIL opened after it, the drawer, a question, the board, an input's window, a Leave War sheet | F19, A24 | what opened last answers, one Escape one thing; with nothing else open it folds the window (D2112) |
| W20 | Over and under the other layers: drawer, a day's bubble, a question, the board, ALL AVAIL with Changes, the failed-save band, a note | F20, A22 | drawer and question over the window and its button; the board under it; each window's ✕ reachable; the band never covered (D641, D1523) — every press hit-tested |
| W21 | The Leave War's blocking sheets and the Tracker's windows with the window open | F21, A21 | every picker and question inside them drawn and pressable above its sheet, as with the window folded ("as on `main`") |
| W22 | Copy all: pasted; refused by the browser; again after a new page | F22, A14 | the paste the window's rows word for word plus the developer's lines; "Copied" only for a copy that went in; refused: RECORD (his question) |
| W23 | Every door to a page, as the admin and as a member: top bar, ☰ drawer, keyboard, the bell, Check my quals, OIL list, Leave War ↔ Inputs, Undo to another page, the Admin door, the member-view switch; the browser's Back | F23, F24, A15 | one row a door, named as the app names the page; Back: RECORD |
| W24 | A hidden tab: tap Edit Schedule and switch tab at once; `?timing` loaded in a background tab | F25 | no row near the hidden time (fix F9); background load: RECORD |
| W25 | Long use: the freeze rows and the window's size line follow without a page change | F26, A13 | the figures move within a second of the change ("changed soon", the readout's own rule) |
| W26 | The plain-user round, the window open: sign in, look at the week, make and undo a change on Edit Schedule, file an input, open each window and close it by each of its ways, sign out | §7.0a | the app as without the switch; every window closes by its ✕, Escape and a tap outside as it does today |

Set aside, each with its reason: A28's two-minute give-up — carried by the code's one constant, a wait that long is
not a figure anyone reads; A30 (download time as a row of its own) — a design question, not a fault: the approved
words carry sizes only (D2483), recorded for his look.

## The pictures

`docs/img/handpass/2026-11-24-timing-readout/`: `walk1` 7, `walk2` 35, `walk3` 40, `walk4` 41, `walk5` 52 — 175 in all,
one folder a step. The deciding ones, opened by the host: `walk5/W24/background-load.png` (loaded behind another tab:
"not timed, tab not in front"), `walk5/W20-desk/04-timing-pressed-stays-behind.png` (ALL AVAIL over the window after a
press on it), `walk5/W33-desk/01-box-over-the-window.png`, `walk5/W34-phone/01-not-kept-band-and-window.png`,
`walk5/W26/01-inputwin-after-press-outside.png` (the script's old press landed on a calendar day — its own fault).

## The break tests

Each fault was pinned by a test seen to fail on the old code before its fix: fix 1 `timing.test.ts` (the first
download); fix 2 `timing-watch.test.ts` (the press's own moment, four); fix 3 `timingtext.test.ts` (a reloaded file,
five); faults 4, 6, O2, O3, A3 `timing-watch.test.ts`; fault 5, R1, O4, A1, A6 `boardescape.test.tsx`; A2, R2
`TimingReadout.test.tsx`; A5 `timing.test.ts`; OPEN 7 (chat 167) `timingtext.test.ts` and `timing-watch.test.ts` —
"a file smaller than the answer's header, told "unchanged"…", red on the old code (761 bytes counted where 461 came).

## Errors seen

None in any walked session but W7's, which are the walk's own doing: W7 refuses the Leave War's file on purpose
("Failed to fetch dynamically imported module" — the failed-download card under test). W1c, W5-errors, W26-errors: none.

## What was NOT walked, and why

- Safari on a real iPhone, Firefox, Edge and the office computer itself — only his look can show them (sizing line 4);
  WebKit stood in for Safari's words (W15).
- W23's bell door — no notice in the admin's bell list on the demo day; the door shares the one mark every door uses.
- A28's two-minute give-up — carried by the code's one constant (above).
- W24 in Playwright — it keeps every page it drives "visible", so W24 is walked by its own script (a plainly started
  Chromium, driven only through its developer port: `timing-walk-w24.mjs`), which hid the tab for real.

## The gate counts

## What the walk found, and each disposition

Chat 164's rounds: `walk1` (the first build), `walk2` (after fixes 1–2), `walk3` (after fix 3; its logs `walk3-part2.txt`,
`walk3-part3.txt` — a script writes `.log`, which the project ignores: rename before committing). Commands: from `raptor-port/`, `TW_OUT=$PWD/docs/img/handpass/2026-11-24-timing-readout/walk3
node scripts/handpass/timing-walk-2.mjs` (and `timing-walk.mjs` with `TW_MAIN=C:/t164m/dist-main`, `-3.mjs`); one step:
`ONLY=W19`. `main`'s build for W1d: `git archive origin/main -- raptor-port ':(exclude)raptor-port/docs'` into
`C:/t164m`, `node_modules` joined, `npx vite build --outDir C:/t164m/dist-main`.

| # | Found | Disposition |
|---|---|---|
| 1 | W1: without the switch the app's own first download split 15 → 19 files (the readout imported React and the movable window) | FIXED red-first `ced82eaf7`; re-walked 15 = 15 |
| 2 | W5: a press the busy computer heard late (0.86 s once at 4×) was left out of the time (also missed by both scenario designers) | FIXED red-first `ced82eaf7`; re-walked: every figure within 0.05 s of the outside stopwatch |
| 3 | W14: a reload (each file asked again, "unchanged" — Vercel's way on a return visit) read "Kept 0 of 15", "15 · 4 KB" | FIXED red-first `ad8f1ebca`; re-walked: "15 of 15", "size not given by Chrome" |
| 4 | W7: after Retry's reload the Leave War's first open read "downloaded 1 KB" — a file from the browser's memory, its small answer counted | OPEN — to fix: `timing.ts downloadedBetween` counts a file only when its body came down the line (`transferSize > encodedBodySize`), a test first |
| 5 | W19 (f): the board opened AFTER the timing window — the first Escape folds the timing window, the board needs a second (D2112: what opened last answers). The board's Escape stands aside for any movable window (`boardescape.ts`) and this one is open all session | OPEN — to fix with the code read's findings; the same question for the Leave War sheet's raised layer (`Sheet.tsx`) and the phone note's place (`toast.ts`), which also answer "a window is up" while it is open |
| 6 | W24: `?timing` opened in a tab behind another — "Sign-in shown at 36.3 s" (the browser draws nothing for a page behind another tab) | OPEN — a figure that is not this computer's speed; recommended: no start-up figure where the tab was hidden before the first screen, its words read by a fresh Fable (D2441) — for his look |
| — | W10 RECORD: the Leave War opened after its background fetch reads "first time: 0.2 s", no download | for his look (is that the figure he wants called "first time"?) |
| — | W2 RECORD: `?timing=false` switches it on | the switch's own rule (any value); left |
| — | W18 RECORD: medians, Edit Schedule / View-only Sched: no switch 1234 / 1199 ms, open 802 / 956, folded 810 / 838 — the window adds no cost (the no-switch run went first, colder) | no fault |
| — | W3: storage — the same kinds and numbers of entries with the switch as without (363 each; two runs without differ by 55 minted record numbers, so compared by kind, `timing-walk-diag4.mjs`) | PASS (the script's first judge compared names: its own fault) |

### Chat 165: the code reads, the open faults, the re-walk

**The code read** (bug-check order §4): Astra (GPT-6 Astra, high) and a fresh, blind Opus, one brief
(`docs/superpowers/briefs/2026-11-24-timing-readout-code-read-brief.md`), each in an exported copy of `fcb9ec69e` with
this sheet, the handoff block, the scenario reports and the walk scripts taken out, blind to each other. Their reports:
`handpass/parts/2026-11-24-timing/astra-read.md`, `…/opus-read.md` (its proof tests in `…/opus-proof/`). Every claim
was written as a test and seen to fail on the old code before its fix; the browser steps of walk part 4 checked them on
the build.

| # | Found (by) | Disposition |
|---|---|---|
| 4 | W7: a file the browser already held counted as "downloaded 1 KB" | FIXED red-first `23e2dddc7` (`timing-watch.test.ts`): a file counts only when what came is more than its body; W7-downloaded re-walked |
| 6 | W24: a tab behind another — "Sign-in shown at 36.3 s" | FIXED red-first `23e2dddc7`: App loaded and Sign-in shown read "not timed, tab not in front" (a fresh Fable's words, D2441 — "Site answered" and the sign-in keep their figures); W24 re-walked in a real window — for his look |
| 5 | W19 (f): the board needed two Escapes (also Opus F1) | FIXED red-first `52f360c58`, reshaped in `a893d3ca7` (below) |
| R1 | Re-walk W19 (e): the bell's list and the readout closed on ONE Escape — new; any movable window in front met the same on `main` (the list closed on the key without marking it used) | FIXED red-first `52f360c58` (`topbits.tsx`, `boardescape.test.tsx`): the list marks the key used |
| O4 | Opus F4: a seat put down AND the readout folded on one Escape | FIXED red-first `a893d3ca7` — the readout made a **bystander** (`FloatWindow.tsx`): Escape is its own only with the keys inside it, and then first, at the window's capture; opened by itself it neither comes forward nor takes the keys; W30 PASS |
| A1, A6 | Astra: with the keys in the readout, Escape closed the Leave War person window / the Tracker's Show All underneath (they listen at the page first) | FIXED by the same change; `boardescape.test.tsx` (a page listener never hears it); W29 PASS both |
| A2 | Astra: two Copy all presses at once — the older's "Copied" spoke for the newer, failed one | FIXED red-first `a893d3ca7` (`TimingReadout.test.tsx`) |
| A3 | Astra: the Tracker's "downloaded" counted the Leave War's background download | FIXED red-first: a page never counts the other page's own files; W28 PASS (Tracker 120 KB, the server sent 119 KB) |
| A4 | Astra: folded from the keys, the keys were left on nothing | FIXED red-first: they go to the corner button; W31 PASS (phone, keys alone) |
| A5 | Astra: on a phone, with 30 rows, the window covered the top bar and the failed-save band's Retry (D1523) | REPRODUCED by W27 (window top 12 px, Retry under it); FIXED red-first (`timing.test.ts`, `timing.css` capped by the bar's live height); W27 PASS (top 93 px, the bar's foot 85 px) — whether a tall phone window of the app's own does the same is filed, `[PHONE-WIN-BAND]` |
| O2 | Opus F2: a page the app changes while the tab is already hidden — a row of the hidden time | FIXED red-first (`timing-watch.test.ts`): no mark while hidden |
| O3 | Opus F3: after a sign-out that could not reload, the next sign-in's Leave War read "opened before" | FIXED red-first: a sign-in starts every page as first again |
| H1 | Opus: what the window and its button stand over — the week's foot scroll bar, the sign-in card at 768×1024 and 800×600 | walked, W32 (below) |
| H2 | Opus: does the window slow what it measures | W18 RECORD: no added cost (above) |
| — | Opus's smaller notes: "Sign-in shown" ends at the claw going, not two frames after; a refused sign-in starts a wait (W17: no row results); "first time" can be a page built in the background (W10, for his look) | no fault — left |

**The re-walk, `walk4`** (chat 165, on the build of `a893d3ca7`; logs `walk4-part1.txt`, `-part2.txt`, `-part3a/b/c.txt`,
`-part4a/b/c.txt`; one command: `scripts/handpass/timing-rewalk4.sh`): W1a–d PASS (15 files = `main`'s 15), W2 as
before, W5 every figure within 0.05 s of the outside stopwatch, W7 (no "downloaded" — the server sent nothing whole),
W8, W9, W14-first, W14-reload, W22, W27–W31 PASS; W19 (f) the board first, then nothing more (the readout a bystander);
W20 desk all PASS; W23 every door one row; W26 the change and its Undo, the input's window by ✕ and Escape PASS; W32
RECORD: open at the start, the window stands over Edit Schedule's foot buttons Traffic and "+ In-time" (bottom right,
as the approved mock-up places it — for his look; corrected by chat 167 from the pictures: what it covers is the whole
Aircrew list, those two buttons lie behind that list anyway — see roll-call A); the sign-in card clear at 768×1024 and 800×600.
**Found by the re-walk, after the readers' fixes:**
- R2 — W19 (c2): a press on the readout put it in front of the app's window order, yet it answered Escape only with
  the keys in it — ALL AVAIL, and the board under it, heard no Escape at all. FIXED red-first `e47e96775`
  (`TimingReadout.test.tsx`): the window never joins the order, stands behind the app's own windows (z 405), and a
  press puts the keys in it. **Re-walk owed** (W19, W20-desk-two-windows — its judge to be rewritten: the readout now
  stays behind ALL AVAIL; its ✕ reached once ALL AVAIL is closed or moved).
- OPEN 7 — W14-newtab: "Kept from an earlier visit 14 of 15" where the server answered all 15 "unchanged". The cause,
  the host's reading not yet proved: a file smaller than its answer's header (`undo-bridge-…js`, 221 bytes) — told
  "unchanged", what came (~300 bytes) is more than its body, so `timingtext.ts filesOf` (and `timing.ts
  downloadedBetween`, fix 4's rule) read it as sent whole. To prove with each entry's sizes printed, then fix red-first.
- Script faults to repair, then re-walk: W5-leavewar-1's judge wanted a download, but the Leave War had already come in
  the background (no claw seen — W10's case: RECORD it, as W10); W24 — even a real window placed off the screen never
  hid the tab (Playwright starts Chromium with `--disable-backgrounding-occluded-windows` and
  `--disable-renderer-backgrounding`: launch with `ignoreDefaultArgs` for both, and open the second tab with the
  developer protocol's `Target.createTarget({ background: true })`); else his look on his own PC; W20-phone — the
  corner button under ALL AVAIL's panel (fold order: close ALL AVAIL first); W26 — "a press outside" never closes a
  movable window (FloatWindow.tsx: ✕, Escape or its finishing button — D641), so its judge is wrong, and the window left
  open then covered the next step: close it by ✕ after that check.

**Script faults of part 3 (chat 164), each repaired by chat 165 and re-walked in `walk4`:** W14-reload's judge used the old
counting (compare the server's 304 answers instead); W20-phone and W23-admin stopped on a 30 s click timeout (find
which control); W23-member read rows with the window folded (open it first); W24 — the test browser never hid the tab
(walk it in a real window, placed off the screen); W19 (c)/(c2), W20 two windows — no `[data-oilsent]` line found on
Edit Schedule's week; W19 (g), W26 change and Undo — no `.ib-bar` in sight on Inputs (find the calendar's tab first);
W20-desk-board-folded's judge wanted `#sbDone` and met its inner `span.bl` (a PASS); W21 — the month selector inside
the sheet. Everything else of W1–W26 PASSED: see the logs.

### Chat 167: OPEN 7, the script faults, the last re-walk (`walk5`)

On the build of `0a6a5a304`'s app code (logs `walk5-part1.txt`, `-part2.txt`, `-w24.txt`, `-part3.txt`, `-part3-W26.txt`,
`-part4.txt`, `-part5.txt`, `-part5-W33phone.txt`; commands `scripts/handpass/timing-rewalk5.sh`, then part 5).

| # | Found | Disposition |
|---|---|---|
| 7 | W14-newtab "Kept 14 of 15" where the server answered all 15 "unchanged" | PROVED by `timing-walk-diag5.mjs`: Chrome reports an "unchanged" answer as the web standard's fixed 300 bytes for its header, beside the body's size (a file sent whole: body + 300); the app's `undo-bridge` file is 161 bytes compressed, so 300 > 161 read as "sent whole". FIXED red-first `0a6a5a304`: exactly 300 counts as "unchanged" in both places that count files (`timingtext.test.ts`, `timing-watch.test.ts`, each red first). W14-newtab re-walked: "15 of 15" PASS; W7-downloaded and W28 still PASS |
| S1 | W5-leavewar-1's judge wanted a download the Leave War had already made in the background | script FIXED: the server's own answers decide; walk5 the Leave War's own download came this time (claw seen, "downloaded 134 KB: 2.3 s" against 2.27 s outside) — PASS |
| S2 | W24: no Playwright set-up ever hid a tab (its own windows, the developer protocol's tabs, a plainly started browser it connects to, its focus emulation switched off — all "visible") | NEW script `timing-walk-w24.mjs`: a plainly started Chromium driven only through its developer port. PASS: the tab hidden then shown, no row of the hidden time (the page asked for just before is dropped — the intended rule); loaded behind another tab: "not timed, tab not in front" twice, "Site answered under 0.1 s"; the same address loaded in front: every figure given |
| S3 | W20-phone pressed the corner button through ALL AVAIL's panel | script FIXED: ALL AVAIL over the corner button recorded, closed by its ✕, then the button opens the window — PASS |
| S4 | W26's "press outside" judge wanted the window closed (D641 keeps it open) — and its point was a calendar day, which opened that day's own window over the input's | script FIXED: pressed at an empty spot, the window stays open (PASS), then closed by its ✕ (PASS) |
| S5 | W20-desk-two-windows' judge assumed a press brings the Timing window forward (before R2) | judge REWRITTEN: ALL AVAIL stays in front after a press on the window (z behind), its ✕ reached once ALL AVAIL closes, then pressed — PASS (both pictured) |
| R2 | re-walk owed (chat 165's last fix, the window outside the app's window order) | W19 RECORD: one Escape one thing — ALL AVAIL, the changes window, the bell's list, the board, an input's window, the bidding sheet each close on one Escape and the Timing window stays; with the keys in it (c2) Escape folds it and ALL AVAIL stays; with nothing else open, Escape leaves it open (the bystander rule — for his look: the combined list expected it to fold) |
| New | the two roll-call rows no part had walked | W33 (Admin → Day templates box over the window, desktop and phone) PASS; W34 (the "Not kept" band, `?nostore`) PASS, desktop and phone |
| F1 | **The fix read** (a fresh, blind Opus on chat 165's and 167's fix commits, in an exported copy without this sheet or the handoff; report `handpass/parts/2026-11-24-timing/opus-fix-read.md`): with the keys in the Timing window and one of the app's own layers open that closes one level on Escape at the same spot the window listens (the Leave War's exact-days calendar, Inputs' range calendar, the type legend…), one Escape closed both — those layers mark the key used only by stopPropagation, which never stops another listener at the same spot. Without `?timing` nothing changes (the reader checked every changed line of the shared window) | REPRODUCED by the host (`TimingReadout-layers.test.tsx`, both cases red on the old code); FIXED red-first: the window's Escape skips a key a layer already took and stops every other listener when it takes one (`FloatWindow.tsx`); the readout's 93 tests and the shared window's ten neighbouring files (321) green. W35 walked on the build: (a) the calendar open, the window opened from its button, Escape closes the calendar only, the next folds the window — PASS (pictured); (b) not reachable by a press — with the window open the Leave War's blocking sheet lifts itself over every movable window, the Timing window included — carried by the test |

Everything else in `walk5` PASSED: W1a–d (15 files = `main`'s 15), W5 (every figure within 0.05 s), W7, W14, W20 desk
and phone, W26, W27–W31; W32 as before (RECORD, for his look).

**Closed.** No fault open. For his look: the start-up words for a tab loaded behind another (W24), Copy all when the
browser refuses (the mock-up, D1625), W10's "first time: 0.2 s" for a page built in the background, W32 (open at the
start, at 1366×768 the window covers Edit Schedule's Aircrew list — chat 167's reading of the pictures; the step's two buttons lie behind that list anyway), and the Escape rule (the window folds by Escape
only with the keys in it).

**Walk:** `docs/handpass/2026-11-24-timing-readout.md` · 175 pictures (52 in the last round) · 11 surfaces · 35 orders
(W1–W35) · MISSING: 2 — the bell door, not walked (no notice on the demo day), carried by the one shared mark; W35 (b), not reachable by a press, carried by a test; every
fault fixed red-first (7 found by the walk, 2 by its re-walks, 9 by the two code reads, 1 by the fix read, F1–F9 by the scenario designers' reading); none ruled, none filed but `[PHONE-WIN-BAND]`
