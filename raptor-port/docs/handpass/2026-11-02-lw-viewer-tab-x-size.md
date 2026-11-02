# Bug check — Tab round the document viewer; the full page's ✕ (2 Nov 26)

`[LW-VIEWER-TAB]`, `[LW-OPENDATES-X-SIZE]` — the Leave War's next small fixes (D994), branch `claude/lw-viewer-tab-x-size`,
pull request 614. Built by Opus 5.5; the walk by the host; one fresh blind Opus read (§8 below).
Pictures: `docs/img/handpass/2026-11-02-lw-viewer-tab-x-size/` (51) and its `docclose/` (109). Results: `walk-results-v1.json`
(the first run, all parts), `walk-results-k-v2.json` (the keyboard part re-run), `docclose/walk-results.json`.

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money / OIL | No — keyboard focus and a tap area; nothing counted. |
| 2 | The published record | No. |
| 3 | Saved data | No. |
| 4 | A shared drawer | **Yes** — `leavewar/ui/Sheet.tsx` is the one wrapper every Leave War window is built from; its Tab hold changed. |
| 5 | A new gesture or mode | **Yes** — the full page's ✕ takes a tap over a wider area. |
| 6 | A new surface | No. |
| 7 | Roles | No — the same for an admin and a member. |
| 8 | The warning list | No. |

**Tier: WALK.** Told to him before the walk: the keyboard walk on a desktop, the finger walk on two phone sizes in both engines,
GitHub's run, one fresh reader; about 45 minutes, the host alone.

## 2. The five sizing lines (§7.0, `docs/walk-ledger.md`)

1. **Type:** C (a changed keyboard route and a changed tap target) and E (a touch area in the styles).
2. **What only a walk could find:** whether Tab really goes round the viewer in a real browser over each window the viewer opens
   from (a unit test sends key events the browser's own Tab order never sees); whether the window behind keeps Tab after the
   viewer closes; whether the ✕'s area is hit by a real finger, paints nothing, and stops short of the month buttons and the
   Events list's first row at a phone's width; that the floating windows' ✕ gained no area.
3. **The ledger:** the night of 1–2 Nov 26 walked this same viewer over every window (C, E — 39/39 after its fix); its lesson
   19 (a window over a window closed every way) applies here.
4. **The walk chosen:** the host alone, one script (`scripts/handpass/lw-tabx-walk.mjs`) — K: four places the viewer opens over
   a window, Tab ×6 and Shift+Tab ×3, then Escape and Tab ×4, desktop 1536 Chromium (and K1–K2 at 1440 in WebKit); X: the two
   full pages at 390 × 844 and 360 × 740, Chromium touch and WebKit, a picture right after the tap (D1281); D: the floating window
   on a desktop. The plain-user round (D1557): `lw-nb-docclose.mjs` re-run on this build — the viewer opened from every window
   and closed by Close, ✕, its surround and Escape, desktop and iPhone in both engines, admin and member. Carried by a test:
   the jsdom Tab round with the viewer over a bid window (`leavewar/ui/docviewer-sheet.test.tsx`, through the real Sheet and
   viewer components — key events, not the browser's Tab order) and the area's geometry (`e2e/leavewar.spec.ts`
   [LW-OPENDATES-X-SIZE], measured by the point a finger lands on, and a real tap).
5. **Row added** to the ledger at the close (below).

## 3. The roll-call

| Where the viewer opens over a Leave War window | Holds Tab? | Tab round the viewer | Closed every way |
|---|---|---|---|
| The bid window, a day held whole (Gambit's OML 23 Jul) | yes (blocking) | **K1** PASS, desktop Chromium and WebKit | docclose R1 PASS |
| A bid window's own Document row, two files (the pager ‹ ›) | yes | **K2** PASS, both engines — Next, the frame, Close, ✕ reached | docclose (one file) PASS |
| The person window's paperclip | must not, because it leaves the page working (D641, `modal={false}`) | **K3b** PASS — Tab round the viewer; after it closes Tab follows the page | docclose R5 PASS |
| A reopened bid window / the day's list | yes | **K4** PASS (Ranger's bid reopened; the day's list walked by docclose M1) | docclose M1 PASS |
| The Inputs page's input window | not a Leave War window — `ui/sheetfocus.ts` already went round | not changed | docclose R8 PASS |
| Approvals (a page, not a window) | no window | not changed | docclose R7 PASS |

| The ✕ | Its drawn size | A finger 14px off its centre | Over anything else |
|---|---|---|---|
| "Open for bidding", a phone (full page) | 19 × 17 (as before) | **X2** closes it, 390 and 360, both engines | no — the e2e test's clash and gap checks |
| The Events list, a phone (full page) | 19 × 17 | **X2** closes it, 390 and 360, both engines | no |
| "Open for bidding", a desktop (floating) | 19 × 17 | must not reach it, because Approve and Auto-approve sit beside the floating windows' ✕ — **D1** PASS (14px off is not the ✕) | — |

No MISSING.

## 4. What the walk found

- **First run 35/36.** The one FAIL was the script's own expectation: it asked the person window to hold Tab after the viewer
  closed, but the person window leaves the page working by his ruling (D641) and never holds Tab. The script now asks only
  "the viewer gone, the window still up" there (v2); re-run K 9/9. Not a fault.
- **The plain-user round:** 39/39.
- Errors in the browser: none (a cut-off load of a closed file's address is the browser's, as on the last walk).
- Pictures opened by the host: the viewer with the keys on its ✕ (`k-k1-1-tab.png`, the focus ring on ✕), the full page's ✕
  close-up and head (`x-webkit-390-open-dates-0-open.png`), the picture right after the tap and the settled one
  (`x-chromium-390-events-sheet-2-tap-q.png`, `…-3-after-tap.png` — the page already gone, no pressed tint left).

## 5. Break tests

- **The Tab hold's new line:** `docviewer-sheet.test.tsx` was run before the fix — red ("Tab from Close reaches the ✕": the
  keys stayed on Close).
- **The ✕'s area:** the e2e test was run on the stylesheet as it stood on `main` — red ("a finger a little off the ✕ reaches
  it": six of six points missed).

## 6. §7.11 lessons, checked for this change

Lesson 19 (a window over a window closed every way, both engines) — the docclose re-run. Lesson 14 (a keyboard roll-call from
the code, not memory) — the viewer's openers found by searching the code (`openRequestDocs`, the Document chips, the person
window's paperclip). Lesson 3 (what tells the person it happened) — the focus ring pictured on each stop. Lesson 2 (a quick
gesture) — a tap, not a drag; not applicable. The others (pinch, print, the phone's own motion, lists' alignment) do not
apply: nothing here draws a list, prints, pinches or follows the keyboard's slide.

## 7. Not walked

A real iPhone: the test browsers' WebKit takes the tap the same way, but his phone's own finger is on his look card.
The keyboard on a phone (no Tab there).

## 8. The fresh read

One fresh Opus reader, blind to the walk, handed commit f6c4eb1f8 with the finder brief and D56's exclusion (D790).
**One finding, low — confirmed, fixed red first:** the full page's head is pinned while the list scrolls under it, and its 8px
foot margin takes no room then; the 44px area, centred on the ✕, hung about 4px below the head, over the top edge of whatever
passes there — on the Events list the edit and ✕ icons at each line's right end (D1512, D1515). A tap there closed the page.
*Red:* the e2e test gained "a point 1px under the head's edge is never the ✕" — red on the first fix at 390. *Fix:* the area
runs from 20px above the ✕ to 8px below it (inside the head's foot padding and line), 44 × 45; a first try that clipped the
area to the head (`overflow: hidden`) cut it too short at the top and right (two near points missed) and was dropped.
*Green:* the full-page browser tests 6/6; the walk's ✕ part re-walked on the rebuilt bundle 22/22
(`docs/img/handpass/2026-11-02-lw-viewer-tab-x-size/rewalk/`, X1 now also asks for the point under the head).
**Negatives the reader gave:** every other keyboard-holding window (the "No document", OIL, Upchit and clash questions, the
input window, the templates and plans windows, Insights, the board's dialogs) cannot open over a Leave War window; the order of
opening, nesting, closing and re-drawing all hold; `position: relative` moves nothing; the floating windows untouched.
**Hardening note, not a finding (filed nowhere, unreachable today):** the window remembers the viewer's one box as "under" if a
war window ever mounted while the viewer was open; the Escape guard has the same shape.
**No narrow read of the fix:** two lines of geometry in one style rule, proved by the test and the re-walk (§5 asks a narrow read
of a fix that rewrites logic).

## 9. Gates

GitHub's run of pull request 614 (the full set while the repo is public, D1086) — green on `3e14bf787`. On his PC: the Leave
War UI unit files 114 / 1704 passed under the lock; the new e2e test red then green (lw-phone); the code check: no new finding.

## His look card

1. On a desktop: open a document from a bid window's chip, press Tab a few times — the ring goes Close → ✕ → Close; Escape
   closes the document only.
2. On his iPhone: open "Open for bidding" (and ⚙ → Events…), tap a little beside the ✕ — the page closes; the ✕ looks as before.
