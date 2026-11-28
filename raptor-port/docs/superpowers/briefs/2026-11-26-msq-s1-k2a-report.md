# Section 1 (the guard rail) — step K2a: the builder's report (chat 194, 26 Nov 26)

The brief: `2026-11-26-msq-s1-k2a-brief.md`. Nothing committed. Status: **READY FOR INDEPENDENT REVIEW** — with the
code check (`lint:changed`) NOT RUN (below) and nothing checked in a browser.

## What changed

- **`src/ui/UsersPanel.tsx`**
  - **The top row** (`#accTop`, class `od-top`): the search, Filter and a new `+ Add a person` button (`#accAddOpen`,
    the app's `.abtn`) are the first thing on Admin → Users, above "Waiting for access". The search and Filter keep
    their own row element (`.od-findrow`), so the Filter panel still hangs from it. The search filters exactly what it
    filtered before (the same state, the same `usersView` call). "People · N" keeps its own heading, now with nothing
    beside it.
  - **The form** is folded until the button is pressed (a new `adding` state). Pressed, it is drawn under the top row
    and above "Waiting for access", with an `hr.adm-sep` under it; the button is not rendered while it is open. The
    heading is an `h4.adm-sub` reading "Add a person" — the same element and class as "Waiting for access", which the
    stylesheet draws in capitals ("ADD A PERSON").
  - **Its foot:** the note `#accAddNote` (words unchanged) now stands above the buttons, as the drawing has it; then
    `div.acc-acts` holding `#accAdd` (`abtn primary`, its two wordings as before) and `#accAddCancel` (`abtn`, "Cancel")
    — the very row and classes an opened row's Save and Cancel use, so the pair is the same size and aligned by the same
    rules. The old inline `width:100%` on the add button is gone.
  - **Cancel** = `resetAddForm()`, fold, keys back on the opener once it is drawn again. **Escape** does the same while
    the form is open and Users is on screen (`escCloses`, the app's one Escape list — the newest open thing answers
    first; an open Filter panel is put above it, as for an opened row). **After a successful add** the form empties and
    stays open. Nothing else folds it.
  - **Quals' "+ Add person"** (`openNew`) now opens the form and focuses the callsign box (desktop only, as before); the
    scroll is `block: 'nearest'` instead of `'center'`, since the form is at the top.
  - **No Home squadron box:** the `home` state, the `addHomeChoices` import and the box are removed; the add is
    `addPersonAndAccount(name, np, role, postIn)` — today's call with today's arguments, the fifth (home) left out, so
    the door uses the squadron in view, as it did whenever the box was not touched. `ui/usersfilter-model.ts` is
    untouched (the function stays there).
- **`src/ui/postout.css`** — the top row: flex, 8px gaps (the search/Filter gap already used), the search taking what
  the buttons leave (so it widens into the opener's place while the form is open), the button 36px tall like Filter,
  12px under the row. Under 820px: the row wraps, the search + Filter row full width, the button full width under it.
- **`docs/file-map.md`** — one paragraph appended.

## Tests — `src/ui/msq-guard-g.test.tsx` (new, `withThird()` at its top; 13 tests)

- **Seen failing first** on the code as it stood: **13 of 13 failed** (no top row, no opener; G5 on the missing
  Cancel).
- **Then green:** 13 of 13. Three corrections on the way, each to the test's own mechanics, none to what it asserts:
  `pickDate` moved outside `act` (the calendar must draw between its two presses); G6's person comparison leaves out
  `initials` and `ord` (the person's place in the A-to-Z order, set from the callsign) as it already left out the
  callsign; G6's account comparison leaves out `seenFrom` (the newest bell line when the account was made — the twin,
  made second, sees Nova's own line: an order of the two adds, not a difference of the call), and its stint comparison
  leaves out the stint's own id and the callsign.
- G3: the row is the page's first element, holds the search, Filter and the button in that order, above "Waiting for
  access"; no form, no callsign box and no "Add a person" heading until pressed; pressed — the form between the row
  and "Waiting for access", its heading the same element and class as "Waiting for access", the callsign box focused,
  no add-a-person button anywhere on the page, the pair in one `acc-acts` row with the app's classes and no width of
  its own, the note above the pair, the second wording once a sign-in is typed.
- G4: every field changed (callsign, initials, seat, CAT, sign-in, role, the post-in date) then Cancel, and the same
  with Escape — the form gone, the opener back with the keys on it, opened again every field fresh (the role back on
  Member); nothing else folds it (a press on the page, the search, the Filter opened and shut by Escape — the Filter
  answered that Escape, the form stayed open with its typing); an add leaves it open and empty; no Home squadron box
  for Hunter on 142 and 149, nor Saber on 142, 149 and 150; Saber's add on 149's page is 149's man, his first stint on
  149's Leave War.
- G5: Quals' button — Admin → Users, Users chosen, the form open, the callsign box focused, no opener; Cancel brings it
  back.
- G6: the form's add (with a sign-in, Admin, a post-in date) and the door called straight with the same arguments make
  the same person, account and first stint but for the names; home 142, the squadron in view; the words said are
  today's ("Nova added — nova@mail can sign in now"; with no sign-in "… added to the roster — set flight and quals on
  the Quals page"); a refused add says a reason and keeps the form open as typed.

## Existing tests re-pointed — each named, none weakened

| File | What changed | Why |
|---|---|---|
| `ui/accounts-newperson.test.tsx` | A helper `openAdd()` (press `#accAddOpen` unless the form is already open — one App runs through the file) called before the form is used in NP1's three add tests, NP4's Admin → Users test and NP7's words test. No assertion changed. | The form is folded until pressed. |
| `ui/msq-users-filter.test.tsx` | The describe "Add a person's Home squadron" rewritten to his new rule, keeping its four cases: Hunter (one squadron) — no box; Saber — no box, the form starts on Callsign/Name; Saber's add of WASP on 142's page — his home 142, his post-in on 142's war, nothing on 149's (it was: picked 149 in the box → home 149); Hunter with Plan of 149 — no box (it was: 142 and 149 offered). Each opens the form first. The file's head comment says what changed and why. | D2729 Q1 — the brief: "for the Home box — changed to the new rule". The three-squadron cases are in G4. |
| `ui/onedoor-users.test.tsx` | "Add a person asks the post-in date, opening on today" presses `#accAddOpen` first. Assertions unchanged. | Folded until pressed. |
| `ui/postout-landing.test.tsx` | "what he has half-typed on Users is kept…" opens the form first (unless already open). Assertions unchanged — and the bell tap now also proves the open form survives it. | Folded until pressed. |
| `ui/reshape-b2-no-guest-switch.test.tsx` | Its control "his Admin → Users is drawn" now checks `#accAddOpen` and then opens the form, so the "no Guest view anywhere" checks still read every word the page can show, the form included. | `#accAddBlock` is no longer on the page until pressed. |

Not changed and still green: `ui/quals.test.tsx` (NP1's Quals door — the form now opens on it), `ui/accounts-ui.test.tsx`,
`ui/msq-users-row.test.tsx`, `ui/msq-guard-asis.test.tsx`, `ui/msq-guard-rollcall.test.ts` (R9 sees the new file call
`withThird()`).

## Commands and counts (from `raptor-port/`)

- Before any change: the 10 existing files above — **10 passed, 222 passed, 4 todo**.
- After: those 10 plus the new file — **11 files passed, 235 passed, 4 todo** (222 + the 13 new; nothing removed).
- One run in between failed one Quals test that has nothing to do with this page ("dropping it moves the column and
  flashes the frame where the column landed" — a timing test of Quals' column drag) while 11 files ran together; it
  passed alone right after and in the final 11-file run. Reported, not touched.
- `npm run build` (the lock free when checked): **passed** (`tsc -b && vite build`).
- `npm run lint:changed`: **NOT RUN** — the code check said it could not read `origin/main`'s side and compared
  nothing; again with `--base HEAD --include-untracked`, the same for HEAD. It needs running by the orchestrator.

## Where the build departs from a drawing, or the drawing does not say

1. **A line under the open form** (`hr.adm-sep`, the page's own separator) before "Waiting for access". The open
   drawings end at the buttons; the closed one has no line between the row and "Waiting for access", and none is drawn
   there.
2. **Spacing is the page's existing values, not measured from the drawings:** 8px between the row's parts, 12px under
   the row, the heading's own 10px under it, the note's existing `acc-note` margins above the pair. Nothing was
   measured against the pictures (no browser in this step).
3. **The brief points to `s1-add-home-d-crop.png` / `-p-crop.png` as "no Home squadron box"** — the desktop one I opened
   shows a Home squadron box (149) at the top of the form. It looks like the other answer's picture. The build follows
   the ruling (no box) and the box-less drawing `s1-add2-a-*`.
4. The closed drawings show the Admin → Users section's jumps (the left column on a desktop, the chips on a phone) and
   "People" without its search; only the top row is built here, as the brief says.
5. The Role box (shown once a sign-in is typed) is not in the drawings; it is as before, full width, above the note.

## Owed — not checked here

- **Nothing was looked at in a browser.** Unchecked: the phone layout (search + Filter one row, the button full width
  under it), every height (36px), the search widening while the form is open, the pair's measured size against an
  opened row's Save · Cancel, the gaps above, the focus ring on the opener after Cancel/Escape, the Filter panel
  hanging over an open form, the post-in calendar opening near the top of the page, his iPhone's wider letters on
  "+ Add a person".
- **The browser tests that type into the form will fail until re-pointed** — not in this step's file list, so not
  touched: `e2e/datecal.spec.ts` uses `#accAddPostIn` straight after opening Admin → Users in "Admin — a new person's
  Post in…" (line 214) and in the desktop calendar tests at lines 369, 430, 490, 620 and 791 (and wherever else it
  presses `#accAddPostIn`); each needs a press on `#accAddOpen` first. `e2e/geometry.spec.ts`'s "Quals '+ Add person'
  leaves the cursor in the Callsign/Name box" should pass as is (the Quals door opens the form) — not run.
- The walk scripts under `scripts/handpass/` that type into the old foot form are records, not gates — untouched.
- The form's report to the guard (`useGuardWork`) is K2b's, not built.
- No new on-screen words: "+ Add a person", "Add a person" (drawn "ADD A PERSON"), "Add person", "Cancel", and the
  form's existing words only.
