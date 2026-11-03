# [INPUT-WIN-X-ASKS] — an input's window asks before its ✕ throws away typed words (D1622), 3 Nov 26

**The change:** `src/ui/InputWindow.tsx` — the window's ✕ calls `askClose`: with anything of his not saved (a field, or
who it is for — the same test Escape uses) it puts up the window's own question, "This input has unsaved changes. Close
it and lose them?" (Discard and close · Keep editing); with nothing unsaved it closes at once. Cancel keeps `close` and
never asks. A second ✕ while the question stands changes nothing; over the "open the other input?" question it asks the
close question instead. Branch `claude/input-win-x-asks`, from main after pull request 625.

## Tier — WALK
The eight questions: money no (nothing earned or paid); the published record no; saved data no (nothing stored changes —
the question only stands between a press and the window's own close); a shared drawer no (one window); a new gesture
**yes** (✕ gains a step); a new surface no (the question is the one Escape already shows); roles no; the warning list no.

## Roll-call — every place this window's ✕ is drawn
| Place | ✕ asks with typed words |
|---|---|
| The input's window on the Inputs page (calendar day, list, "+ Input", Medical's "+ Medical") | has it — one window, one ✕ (`FloatWin onClose`) |
| The schedule's own input pop-up (Edit Schedule, the Scheduler Board) | must not, because it is not a window: it closes on a tap outside and has no ✕ of the window's (`win` false — the Escape question is the Inputs page's only, as built) |
| The window's Cancel | must not, because Cancel already means "throw this away" (D1622) |

## Door check
The question's two buttons are the Escape question's own (`inped-escask-go`, `inped-escask-stay`, Keep editing focused);
Escape on it is Keep editing, as before. The shell's own Escape for this window calls the same `askClose`.

## Tests (red first)
`src/ui/inputskeys.test.tsx` — five D1622 cases: ✕ with typed words asks, Keep editing keeps them, ✕ then Discard closes;
nothing typed closes; Cancel closes at once; a second ✕ keeps the question; the window behind the day still asks. Three
were red on main's code (the two guards — nothing typed, Cancel — passed before and after). Touched files green: 4 files,
68 tests; `editorwindow.test.tsx` 22. Browser tests that press this ✕ after changing a form now answer the question:
`e2e/inputs-calendar.spec.ts` (a new input's type changed), `e2e/inputs-sans-calendar.spec.ts` (a date tapped in the
form), `e2e/feedback-marks.spec.ts` (two half-filled medicals) — the four files run: 114 passed, 2 failed on the new question; after the update the
three re-run green (14 tests).

## Walk
`scripts/handpass/ixa-walk.mjs` on a frozen build of the change, desktop (1440) and his iPhone's size (402, taps):
**20 PASS · 0 FAIL · 1 NOT WALKED** (X4, Escape, on the phone — no key) · 0 browser errors. Pictures:
`docs/img/handpass/2026-11-03-input-win-x-asks/A/` — X1 the question after ✕ (ringed, with the ✕), and the card
unchanged after Discard; X5 a save still saving; X6 a new input's ✕ asking. The host opened X1 at both sizes: the
question stands under the window's bar, its two buttons whole, the typed words below it.

## Code read
None at this tier (§5: WALK has no model read); the change is one guard in one window.

## His look
The preview link and X1's two pictures; then his "merge live".
