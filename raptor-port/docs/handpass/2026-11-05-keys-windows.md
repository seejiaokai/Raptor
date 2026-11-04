# The keyboard and windows batch — the bug check (5 Nov 26, the night's job 1)

Branch `claude/keyboard-windows-batch-5eff45`, pull request 636. His answers of 5 Nov 26 on the mock-up page
`docs/mock/2026-11-05-keys-windows/`: **D1645** (the top bar stays pressable over "Jump to a date", the day details and the
document viewer), **D1646** (the Scheduler Board by the keys), **D1647** (Traffic on View-only Sched read only for everyone),
**D1648** (an unreadable clock said once); with them `[WINDOWS-KEEP-KEYS]`'s two leftovers (the keys back after the OIL
question; the red note's refresh test) and `[DOC-POINTERS-CODE]` (comments only). The builder's report:
`parts/kw1105/build-report.md`; the walker's: `parts/kw1105/walker-report.md`; the reader's: `parts/kw1105/read-opus.md`.

## 1. The eight answers and the tier

1 OIL: NO — nothing earns or is counted. 2 The published record: NO — no publish, sign or amendment path is touched. 3 Saved
data: NO — nothing stored changes (the viewer re-reads an input, it writes nothing). 4 A shared drawer: YES — one shared hook
(`ui/barfree.ts`) for four windows; one shared body for the red note's four writers. 5 A new gesture or mode: YES — the keys on
the board's menus, chips and day name; Tab kept on the board. 6 A new surface: NO. 7 Roles: YES in part — D1647 changes what
an ADMIN may do on View-only Sched (less, never more), the write path guarded; `perms.ts` untouched, so `perms.test.ts` and
`perms-scan.test.ts` stand as they were. 8 The warning list: NO — the day's issues list is unchanged (the red note under the
lines is not the list).
**Tier: WALK**, with D1647's role half walked as each role's own face (admin, member; a guest carried — §5). 7 is YES only
because a write is taken AWAY from an admin on one page; nothing is opened to anyone, so the FULL tier's second reader and
seeded case add nothing a walk of each role's face and the one Opus read do not.

## 2. The roll-call (§6)

Each row: **has it** / **must not, because…** / **MISSING** — and how it was seen. "Walk" = `scripts/handpass/kw-walk.mjs`
(pictures `docs/img/handpass/2026-11-05-keys-windows/walk/`); "LW walk" = `scripts/handpass/lw-nb-docclose.mjs` on this build
(`…/lw-docclose/`); "e2e" = `e2e/keys-windows.spec.ts`; unit = the file named.

### D1645 — each window, on every page that opens it

| Window · page / opener | Bar pressable (Undo met at its middle) | Other bar control closes it first | Escape after Undo | What an Undo changes shows | Seen |
|---|---|---|---|---|---|
| Jump to a date · Edit Schedule (desktop `.wk-cal`, phone `.filt-cal`) | has it | has it (the bell) | has it (desktop; keys back on its button) | has it — nothing of the week held (the day lit is read as it draws) | Walk S1.editsched both sizes; e2e |
| Jump to a date · View-only Sched | has it (no Undo there — the bell met) | has it | has it (heard on the document) | must not — View-only has no Undo | Walk S1.viewsched |
| Jump to a date · the board (`#sbCal`) | has it (`#sbUndo`) | has it (a day chip; the phone's day arrow) | has it (unit) | has it | Walk S1.board |
| Day details · Edit Schedule's ⓘ | has it | has it (bell; a page name; ☰ on the phone) | has it (keys back on the ⓘ — unit) | has it — its title count follows Undo and Redo | Walk S2.week; unit |
| Day details · View-only Sched (day name / date) | has it (the bell met) | has it | has it | must not — no Undo | Walk S2.view |
| Day details · the board's ⓘ | has it (`#sbUndo`) | has it (a day step, a week chip) | has it | has it | Walk S2.board; e2e |
| Viewer · Inputs → Medical card | has it | has it (the bell) | has it (its own document Escape) | has it — remarks changed then undone: the viewer shows the undone remarks | Walk S3.med, S3.undo |
| Viewer · Inputs list paperclip | has it (code: same component) | has it | has it | has it | **NOT WALKED** — the demo world's list draws no paperclip until a document is filed through it; carried by the Medical card (the same viewer, the same hook) and the LW walk's R8 (the Inputs page's input window, its paperclip) |
| Viewer · Inputs page input window (movable, D641) — its paperclip | has it — the window leaves the bar free, so the viewer is free | has it | has it | has it | LW walk R8 (Close closes the viewer alone, both engines) |
| Viewer · the schedule's input window (`#inpEditPop`) — a Document chip | **must not**, because the input window keeps the bar covered (D1645) and a viewer over it keeps its whole veil | n/a — the bar cannot be pressed | has it | n/a | Walk S3.inpwin (Undo covered; Close closes the viewer alone, the input window stays — lesson 19); e2e |
| Viewer · the Leave War's papers (bid window, held half, person window, Approvals) | has it where the window under it leaves the bar free; else keeps its veil (decided by the browser, `barCovered`) | has it | has it | must not — the war's papers are read-only pages, shown as given | LW walk R1–R9 (29/29, desktop Chromium, phone Chromium and WebKit) |
| Traffic window (the way it already had) · week, board | has it (unchanged behaviour, now through the shared hook) | has it | has it | has it (re-reads its wave) | `board-escape-traffic.spec.ts`, `trafficwin.test.tsx` (green) |
| The input window itself · schedule | **must not** (D1645 — holds typing not yet saved) | — | — | — | Walk S3.inpwin.1 |
| Question sheets (OIL question, upchit, covers other days, no document, medical clash, cancel reason, Sort all) | **must not** (D1645 — they exist to stop a change until answered); code unchanged | — | — | — | Sort all pictured covered (Walk 044); the others' code untouched (they never took `useBarFree`) |
| A page / week change with a window up (an Undo landing elsewhere) | day details close on week and page; calendar and viewer on page | — | — | — | unit `barfree.test.tsx`; Walk S2 "a page name" |

### D1647 — Traffic, each page and role

| Page · role | Read list (no box, no ✕, no Add row) | Editing window | Seen |
|---|---|---|---|
| View-only Sched · admin | has it | **must not** (D1647) | Walk S4.admin both sizes; e2e; unit |
| View-only Sched · member | has it (as before) | must not | Walk S4.member both sizes |
| View-only Sched · guest | **must not** have a Traffic button at all — a guest's week draws none (`html.ts`, `isGuest()`) | — | carried by the code, unchanged by this batch (named, not walked: the guest switch is an admin setting the walk did not turn on) |
| Edit Schedule · admin | — | has it | Walk S4.admin.3 |
| The board · admin | — | has it | Walk S4.admin.4 |
| Every write from the window (typing, ✕, Add row, the blur's save) | refused off Edit Schedule (`airEditable`) | — | unit (the drawing); the writes' guard by code read (no route reaches them on View-only: no box is drawn) |

### D1646 — the board by the keys

| Control | Enter / ↓ opens on its first pick, cyan ring | ↑ ↓ move | Escape back to its button | Mouse opens as before (no ring, keys stay) | Seen |
|---|---|---|---|---|---|
| + Block (board) | has it | has it | has it | has it | Walk S5; unit; e2e |
| Templates (board `#sbTpl`; week `[data-daytplopen]`) | has it (board walked; week by unit of the shared `popMenu`) | has it | has it | has it | Walk S5; unit |
| The plans selector (board; week) | has it | has it | has it | has it | Walk S5, S5.pick.2; e2e (Enter picks, keys back) |
| A jet's stores "C" (board; week) | has it | has it; a store pressed keeps the keys | has it | has it | Walk S5; unit |
| + Wave (board) | has it | has it | has it | has it | Walk S5; unit |
| The duty role list (role box, ↓) | has it (↓ only: Enter in the box is the box's save) | has it | has it | the box's click opens it as before | unit `boardmenukeys.test.tsx` (the role box on the walked board has the same door) |
| A pick by the keys → keys back on the button | has it | — | — | — | Walk S5.pick.1 (Empty block added, keys on + Block, the block shown on the board) |
| The board's day chips | Tab stop, Enter/Space, keys kept, ring | — | — | a click as before | Walk S5.chips; unit; e2e |
| The board's week chips ‹ › | Tab stop, Enter/Space, keys kept | — | — | — | Walk S5.chips.3–4 |
| The chips on a phone | **must not** — `#sbDays` is not drawn on a phone (the day arrows stand there) | | | | — |
| Edit Schedule's day name | Tab stop (Shift+Tab from the date), Enter/Space shows that day's crew, ring | — | — | a click as before | Walk S5.dayname; unit |
| View-only Sched's day name | **must not** change — the reference's markup kept (it opens the day details) | | | | `html.test.ts` parity |
| Tab kept on the open board | last → first, first → last, keys nowhere → onto the board | | | | Walk S5.tab; unit; e2e |
| Sort all | Escape closes it, the board stays | | | | Walk S5.sortall; unit |

### D1648 — the red note's writers

| Writer · surface | Said once | Seen |
|---|---|---|
| The builder · the board | has it | Walk S6.board both sizes (a wave of 3 unnamed lines, "25:90 in time") |
| The builder · the edit week | has it | Walk S6.week both sizes |
| The builder · View-only Sched | **must not** — the view week draws no red note (no editable lines) | — |
| The line being typed (`textedit.ts` preview) | has it | unit `reportnote.test.tsx` |
| The line committed (`textedit.ts`, the blur's save and the delete path) | has it | Walk S6 (Tab commits); unit |
| The refresh (`refreshWaveReports`) | has it | unit |
| The day's issues list | **must not** change — one line for the sentence, as it always was (the engine's own `add()` keeps one per code, men and words) | Walk S6.issues |

### The keys back after a question ([WINDOWS-KEEP-KEYS] leftover)

| Route | Keys back to | Seen |
|---|---|---|
| A schedule box whose save raises the OIL question put before a change (the week) | the box (its twin after the redraw) | unit `oilkeysback.test.tsx` — **not walked**: since D739 (4) a box's own save opens no question; the one door left that raises it from a typed box (a name typed in an input's row on a non-working day) needs a fixture the demo week does not carry. Carried by the unit test, which drives the real Tab route and the real sheet with the question raised as the save raises it |
| The same on the board | the same route (`schedule-tab.ts` serves both) | unit (the week); the board's scope uses the same code path |
| Any question sheet whose answer redraws the control the keys were on | its twin, found by its marks | unit (`useSheetFocus` with a replaced control); the LW walk's 29 rows (every viewer Close returns cleanly) |

**MISSING rows: none.** Two rows NOT WALKED with their carrier named (the Inputs list's paperclip; the OIL question raised
from a typed box), one row carried by code (a guest's View-only Sched).

## 3. The five sizing lines (§7.0)

1. **Type of change:** C (new key routes and a key trap), D (one hook wired into four windows, one note body into four writers),
   H in part (D1647, an admin's write taken away on one page), E in part (the veil's place, the rings).
2. **What only a walk could find:** whether the bar is really pressable — what the browser finds at Undo's middle over each
   window, on each page, at both sizes (jsdom lets every click through); a window opened over another veil; the rings
   drawn (computed outline, `:focus-visible`) and only for the keys; the keys' real order through the board (Tab, Shift+Tab)
   and what each press shows; the red note as drawn on the board and the week; each role's own Traffic face. The tests
   cover the logic orders (Undo/Redo with each window, page and week changes, the viewer's re-read, every menu's keys, the
   note's four writers).
3. **The ledger:** type C walks found a fault about half the time, mostly on wide keyboard jobs; type D ten of ten; the last
   keyboard walk (3 Nov 26, `[BOARD-OPEN-BY-KEYS]`) found its faults in the reads, not the walk.
4. **The walk chosen:** the host's script (S1–S6, every row above that has a screen), run by ONE Sonnet walker (D787) at his PC's
   desktop size (1536 × 864) and his iPhone's (402 × 874, touch, a picture after every tap — D1281), the walker opening the
   pictures; the host opening every picture that decides something; plus the Leave War's document-close walk re-run on this
   build (Chromium desktop and phone, WebKit phone) for the viewer over the war's windows (lesson 19). The board by the keys at
   the desktop only (no keyboard on a phone; its chips are not drawn there). No size beyond the two: nothing here depends on
   how much fits on screen (lesson 11 does not apply); the short screen is carried by `board-escape-traffic.spec.ts`'s phone on
   its side (the shared hook's box held below the bar).
5. **After the walk:** its row is in `docs/walk-ledger.md`.

**The lessons of §7.11, for this change:** 1 (a reading in one state only) — the windows walked with and without a change to
undo, the viewer before and after an undo; 3 (feedback) — each close pictured, the ring pictured; 4 (a press on the page behind
an open window) — S5.tab presses Tab from the page behind; 12 (a window opened from one page only) — every page each window
opens from is a row above; 19 (a window over a window, closed by each of its ways) — S3.inpwin and the LW walk's 29 rows; 2, 5,
6, 7, 9, 10, 11, 13–18, 20–22 do not apply (no drag, no swipe, no list alignment, nothing scrolled into place, nothing the phone
draws itself, no print, no motion).

**The drawing check (D1495):** the mock-up's pictures are a transform drawn on the real app (the veil's `top` and one class;
an outline on a real element — `scripts/handpass/kw-mock.mjs`), so its parts ARE the built parts; no part list was written.
The built screens were put beside the drawn ones by eye: the bright bar over the calendar and day details (walk 002/040 beside
`1b`/`1d`), the ring on the first pick (`2b` beside walk 032), the chip (`2c` beside 043), the day name (`2d` beside 045), the
read list (`3b` beside 031/109), the note said once (`4b` beside 046). Named here as a departure from the standing step,
for the coordinator to put to him.

## 4. The walk

`WALK_DIR=<the frozen build> KW_OUT=docs/img/handpass/2026-11-05-keys-windows/walk node scripts/handpass/kw-walk.mjs` (v4), on the
build of commit `0418133b2` frozen at the walk's start.
**152 PASS · 0 FAIL · 2 NOT WALKED (the Inputs list's paperclip, both sizes) · 0 browser errors · 115 pictures.**
The Leave War's document-close walk on the same build: **29 / 29 PASS**, no browser error (`…/lw-docclose/`).
The host's own debug runs (desktop 95 PASS, 1 FAIL that was the script's — the issues list was assumed to hold one line a
formation; it never did, see the roll-call; the assertion corrected before the walker ran).

### What the walker flagged, and the host's reading of each picture
- **Phone 110 — "the top bar greyed under the editing Traffic window on Edit Schedule":** opened by the host — the bar is bright;
  Undo is dimmed because nothing is left to undo at that moment (its disabled look). Not a fault.
- **Tints in the pictures taken right after a tap (D1281):** a teal fill on the button just tapped (049, 051, …) and a teal box over
  a tapped word (084: the view week's "Tuesday", the day name tapped) — the test browser's tap highlight on the element under the
  finger, gone in the settled picture. Present on surfaces this batch did not restyle (the view week's day name is the reference's
  markup); not a fault of this change. Recorded for the phone look.
- **The passing note half see-through over the page right after a tap (069, 088) and "Saving…" over the search box (074, 100):**
  the passing notes' own fade, caught mid-way; not this change.
- **The viewer's page blank (029, 104, 105):** the walk's stand-in PDF is empty. Not a fault.
- 25 desktop pictures the walker did not open — the host opened the ones that decide something (002, 029, 030 among them).

## 5. Cases carried by a test (§7.0)

| Claim | Test | Through the real controls? |
|---|---|---|
| Undo then Redo with the day details open: it reads the day each time | `barfree.test.tsx`; also walked S2.week.4–5 | yes (the real Undo/Redo buttons) |
| A week change closes the day details; a page change the calendar and the viewer | `barfree.test.tsx` | the change is made by the app's own `loadWeek` / `setPage` (as an undo landing elsewhere makes it) — the walk's page-name press proves the visible route |
| The viewer closes when its input is gone | `barfree.test.tsx` | no — the inputs list is changed directly (no door removes an input from under an open viewer in one press; an undo of the input's filing does) |
| D1647: every write of the window refused off Edit Schedule | code read; the drawing by `barfree.test.tsx` | the drawing yes |
| The red note's typed and committed writers | `reportnote.test.tsx` | the writers' own handlers, called with the box |
| The keys back after the OIL question raised by a box's save | `oilkeysback.test.tsx` | the real Tab route and the real sheet; the question's raise stood in for (see the roll-call) |
| A sheet's way back through a redraw | `oilkeysback.test.tsx` | a harness sheet |
| The duty role list by ↓ | `boardmenukeys.test.tsx` | the real role box and keys |

## 6. Break tests

`node scripts/handpass/breaks.mjs scripts/handpass/breaks/kw1105.json` — **29 of 29 caught** (each wire of the batch broken one at a time; its named unit test went red; every file put back). What a unit test cannot see (the veil's place, what the browser finds at Undo, the rings drawn) was broken all at once: `e2e/keys-windows.spec.ts` on the build before the batch, 11 of 12 red (the 12th, the input window keeping its veil, is a pin of the old behaviour).

## 7. Errors seen

None in the walk (0 browser errors), none in the LW walk.

## 8. Gate counts

GitHub's run of `0418133b2` (pull request 636): the gate set green (both workflows — see the closing report for the last pushed
commit). On his PC: the full unit suite 13737 passed, 1 failed then fixed (`inputs-readers.test.ts`, the viewer on the records
list); `npm run build` PASS; `npm run lint:changed` no new finding; the batch's e2e 12/12 and its neighbours 137 passed.
**The last pushed code commit, `6f093f95d`:** GitHub's run green in every workflow — the gate set ("Deploy to GitHub
Pages"), the Docs guard, the Secrets scan (read by the night's chat, 5 Nov 26). The run before it, of `077e5a49b`, was red on
one unit test (`placedshown.test.tsx`: F5's close took a viewer of rows a caller made up as gone) — fixed red-first in
`6f093f95d`; the builder's closing report is `parts/kw1105/check-report.md`.

## 9. What the walk and the read found, and each disposition

**The walk (152 PASS · 0 FAIL):** no fault in the change. The walker's four flags were read by the host on their pictures
(§4): none a fault of this change. The re-walk's one FAIL (S5.F2, run 1) was the step's own: its Traffic window was asked for on
Saturday, which has standby waves only and so no Traffic button — the step now opens it on Wednesday (v6), and the re-walk is
60 PASS · 0 FAIL.

**The fresh Opus read** (`parts/kw1105/read-opus.md` — 2 MEDIUM, 3 LOW, all in the change):

| # | What | Disposition |
|---|---|---|
| F1 MEDIUM | a role picked from its list: the keys back in the old role box before the redraw, the box showing the old words | **not reproduced** in Chromium — a real mouse pick and a pick by the keys on the build before the fix both showed the pick (`e2e/keys-windows.spec.ts` "F1", run on that build: green). The keys now go back only after the redraw (`board.ts popMenu`), as the reader advised ("right either way"); pinned by two unit tests and two browser steps that pass either way |
| F2 MEDIUM | Enter/Space on a board chip skipped the document's click listeners: the Traffic window, the day details or a board menu stayed over the new day | **fixed** — the chip's key sends its click (`SchedBoard.tsx`); red first: `boardmenukeys.test.tsx` "F2" (2), and in the browser on the build before (`keys-windows.spec.ts` "F2": red there, green now); walk step S5.F2 |
| F3 LOW | Tab from a menu opened by the keys walked out of the page onto the top bar hidden under the board | **fixed** — Tab past a menu's last stop (Shift+Tab before its first) closes it, the keys on its button; inside it Tab is the browser's own (the stores menu's editor is a small form) (`sheetfocus.ts menuKeys`); red first `boardmenukeys.test.tsx` "F3"; walk step S5.F3 |
| F4 LOW | the keys' way back found another day's copy of the control (an input drawn Mon–Fri) | **fixed** — `locate` looks on the day the control stood in (`sheetfocus.ts`); red first `oilkeysback.test.tsx` "F4" |
| F5 LOW | an episode of several entries kept the page of an entry an undo took away | **fixed** — gone entries' pages dropped, none left closes the viewer (`DocViewer.tsx`); red first `barfree.test.tsx` "an episode of two" |

**The narrow read of those fixes** (`parts/kw1105/read-fixes-opus.md` — 2 LOW): **G1** the viewer slid to the next entry when a
page in front of it went → **fixed**, the page kept by what it shows (`DocViewer.tsx`), red first `barfree.test.tsx` "an episode of
three"; **G2** a control moved to another day (its input's date changed) was no longer found → **fixed**, the same week searched
after the day (`sheetfocus.ts locate`), red first `oilkeysback.test.tsx` "G2".

**The round-2 narrow read** (`parts/kw1105/read-fixes2-opus.md` — 1 MEDIUM, 1 LOW): **H1 MEDIUM** a button whose first mark names
only its kind (an input's "→ Ground": `data-acc="g"`) had another input's button of the same kind as its "twin" — the keys one
Enter from putting another input on the programme unseen (older in form within one day since F4; widened by G2) → **fixed**, the
twin must carry the same `data-acck` (`sheetfocus.ts locate`), red first `oilkeysback.test.tsx` "H1"; **H2 LOW** the shown file
itself gone: the next entry shown though the same entry had another file → **fixed**, the same entry's other page first
(`DocViewer.tsx`), red first `barfree.test.tsx` "on the second file". The reader's question — whether `locate` should know a short
list of the marks that say which item a control belongs to, instead of its first mark — is the coordinator's to file.
**Rounds:** the fixes were read twice (round 1 G1–G2, round 2 H1–H2); round 2's two fixes are a one-attribute selector and a
same-entry-first search, each with its red test, carried by those tests and the touched suites (515 passed), not read a third
time.

**GitHub's run of `077e5a49b` (red, one job):** `placedshown.test.tsx` "it shows the stamp of the input whose document is
showing…" — the viewer handed an episode of two entries that were never inputs of the list (pages made up by the test) closed,
because F5's change dropped every row whose id the list does not hold. A caller that hands a row of its own is a real case for the
viewer (a page made for it). **Fixed** (`DocViewer.tsx`): "gone" now means an input that WAS on the list when the viewer opened and
is not now; a row that never was is shown as given. Red first: that test on `077e5a49b` (GitHub), green now with the 14 test files
that touch the viewer (212 passed).

**The tidiness note** (the first read's — filed, not fixed): the opener noted three times for "Jump to a date" (its own ref,
`useEscWindow`, `useBarFree`) and twice for Traffic and the day details; `DocViewer`'s `gone` effect repeats `close`;
`boardescape.ts`'s list of stops copies `sheetfocus.ts`'s. Its two comment findings (`popMenu`'s "a mouse pick moves nothing",
the chips' "as a click does") were corrected with F1 and F2.

**Roll-call gaps the read named, and their rows now:** the viewer from the Inputs calendar's day cards (`InputsCal` — the same
component and hook as the Medical card's; carried by S3.med and the LW walk's R8, not walked); a pick from the role list (F1's
rows); a chip pressed by the keys with a window up (F2 — walked S5.F2); Tab inside a menu (F3 — walked S5.F3); a control drawn on
several days (F4, G2, H1 — unit); an undo removing one of several viewer pages (F5, G1, H2 — unit).

## 10. The re-walk

`WALK_DIR=<the fixed build> KW_OUT=docs/img/handpass/2026-11-05-keys-windows/rewalk ONLY=s3,s5 node scripts/handpass/kw-walk.mjs`
(v6), on the build of `18af1a235` (F1–F5, G1–G2): **60 PASS · 0 FAIL · 2 NOT WALKED** (the Inputs list's paperclip) · 0 browser
errors. H1–H2 (`5ce6db299`) touch no surface the walk can reach in the demo world (a control drawn on several days that turns into
another; a file taken from an entry by an undo) — carried by their unit tests, and the browser specs `keys-windows`,
`board-escape-traffic` and `medical` re-run on that commit's build: 43 passed.

## Walk line

Walk: docs/handpass/2026-11-05-keys-windows.md · 233 pictures (115 walk, 41 re-walk, 77 the Leave War viewer walk) · 24 surfaces · 152 checks walked (+ 29 Leave War rows, 60 re-walk) · MISSING: 0 (2 rows NOT WALKED and 1 by code, each with its carrier named)
