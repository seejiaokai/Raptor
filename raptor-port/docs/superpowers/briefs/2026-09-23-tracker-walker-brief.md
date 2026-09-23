# [HUMAN-RETEST] the Tracker — the walkers' shared brief (23 Sep 26)

Given to each of three parallel walkers (D16: a long hand pass is fanned out across parallel Opus
agents, partitioned so no two share a world). Each gets THIS brief plus its own list. Kept in the
repo so the next re-test re-uses it.

## What you are doing

Driving the REAL production build of the app in a real browser, as a person would, to find where
the Tracker tab does not do what it promises — above all where something is MISSING: a screen the
feature never reached, a control that is drawn but does nothing, a message nobody can see, one thing
painted over another, a promise in the words on screen that the app does not keep. Code review and
green tests already passed this tab; the owner found three missing-line defects in minutes on another
feature built the same way. Your job is the check that sees absence.

## The ground rules

1. **Drive through the app's own controls**, the way a person would: the nav tab, the menus, the
   buttons, a real pointer press. A dropdown is CLICKED first, then its option chosen. Do not set
   state through the probe bridge (`window.setPage` and friends). Reading the store to CHECK what a
   screen claims is allowed (`core()` in the driver) — never to set anything up. If a state cannot be
   reached through the app's controls, THAT is a finding (a missing door).
2. **The preview is already running** at `http://localhost:4180` — the production build of the
   branch. **Do NOT run `npm run build`, restart or stop the preview, or run any test suite (vitest,
   playwright test, smoke, e2e, perf).** Another chat shares this PC; heavy runs cause false failures
   there. One browser at a time, headless, close it when a script ends.
3. **Do not edit anything under `raptor-port/src/`** and do not commit. Write only: your scripts
   (`raptor-port/scripts/handpass/trk-<you>-*.mjs`), your pictures
   (`raptor-port/docs/img/handpass/2026-09-23-tracker/<you>-*.png`), small result files
   (`raptor-port/docs/handpass/parts/tracker/<you>-*.json`), and your sheet
   (`raptor-port/docs/handpass/parts/tracker/<you>.md`). Big regenerable things (an exported file, a
   whole-chart dump) go to the driver's `TMP` folder, never the repo.
4. **A walk that left no picture did not happen.** Photograph every surface you judge.
5. **What is NOT a finding (owner, D56 and D120):** the whole stored world is demo data, cleared before
   the database step, and his charts reach the database by export → wipe → import. So do not report:
   harm that exists only in data already stored while the code is right going forward; anything in
   the start-up converters that upgrade OLDER stored data; reading OLDER file formats. The wording of
   the syllabus data files is out of scope (D62). If the app would do the thing again to NEW data, it
   IS a finding.
6. **"Clean" means "I found nothing here"** — say what you looked at and what you did not.

## The driver — `raptor-port/scripts/handpass/trk-lib.mjs`

Read it first; the scripts `trk-01` … `trk-06` beside it are worked examples. The essentials:

- `open({ size: DESK | PHONE, who: 'a' | 'u', touch })` → `{ browser, page, errors }` — a fresh
  browser (its own empty storage — a fresh context IS "the wiped app"), signed in (`ad`/`a` admin,
  `us`/`us` member), landed on the Tracker through its tab. `errors` collects console errors, page
  errors, 4xx responses and native dialogs — report any.
- `toTracker(page)`, `toPage(page, id)`, `logout(page)`, `login(page, who)`.
- `reveal(page, eventId)` — brings a ball to the middle of the chart the way a person does. IN ARRANGE
  (EDIT) MODE THE WHEEL ZOOMS AND YOU PAN BY DRAGGING EMPTY SPACE — `reveal` knows; pan BEFORE picking
  the Line tool (with Line on, a press on empty space starts a line).
- `dlg(page, { value, ok })` — answers the app's own question box `#dlgModal` (it types into
  `#dlgInput`, the type-a-name box, when there is one — the + Add picker also has a search box).
- `shot(page, name)`, `save(name, data)`, `log()` → `L.ok(step, cond, said)` / `L.note(step, said)`.
- `core(page, c => …)` — read-only look at the Tracker's store (`window.__coreForTests`).

**Traps already paid for:** adding a ball (+ Flight/Acad/…) asks for its name first; the details
bubble is `#detailBubble`; the grading pop-up is `#pop` (`#popTitle`); a ball's label font is its
`text` element's `style.fontSize`, not an attribute; a tap on a ball's CENTRE grades the picked
student, a tap on another student's wedge picks them; rosters are per course AND per chart (Tx has no
students on the demo course); the OS file pickers cannot be driven — set
`window.showSaveFilePicker = undefined` / `window.showOpenFilePicker = undefined` first and the app
takes its other real path (a download out, a file input in — the iPhone's path): catch it with
`page.waitForEvent('download')` / `page.waitForEvent('filechooser')`.

## Already walked by the host — do not redo

The export → wipe → import round trip for balls, lines, fonts, event details, a duplicate, an empty
chart and a renamed built-in (all survive); the chart ORDER (lost — F6); the ✎ edited mark after an
import (F7); a deleted built-in returning (F8); the ball box on the short course leaking details (F5);
the key ball printing the course code (F1); the Duplicate / Add syllabus tooltips (F2, F3); Details
mode's "tap Edit details" (F4); an empty course's dead pop-up (F9); the login boundary — undo, Details
mode and an unsaved chart edit all carry over to the next user (F10); Show All's format hint (F11);
course delete (F12); the pop-up closing on an outside press, a chart switch, a student removal (clear);
a keyboard chart switch with the pop-up open (F13).

## What to hand back

Your sheet `parts/tracker/<you>.md`:

1. A table — one row per item on your list: **what you did · what the screen said · PASS / FINDING /
   COULD NOT WALK (why) · picture(s)**. No blank cells.
2. **Every finding** in plain words: what a person sees, the exact steps to reproduce it through the
   app's controls, what they should have seen, and — only if you can name it — the code location.
   Mark each CONFIRMED (you saw it happen) or SUSPECTED.
3. **Explicit negatives** — what you checked and found fine.
4. Anything you noticed OFF your list that looks wrong: note it, with a picture — do not chase it.

Then reply with only: your sheet's path, the counts (walked / findings / could not walk), and your
findings in one line each.
