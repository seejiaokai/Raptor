# Section 1 (the guard rail) — step K7c: the report (chat 204, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k7c-brief.md`. Builder: Opus 5.5, in the working copy on `claude/msq-s1-guard-6ae5e1`, on top
of `46403468f` (the coordinator's notes commit, which landed while this step ran). Nothing committed or pushed.

## The answer: a pin, not a fault

**Pressed on the real controls, the window is held and the door never passes.** K7's finding 2 read that the window would
stop counting where it stood (D2627 A7), so the 142 line's page door would pass and the landing would bring the window
back live on 142's page. It does not happen, for either window:

- **The Input window** goes with him to 149's View-only Sched as its dialog — the guard's row `inputdlg`, drawn on any
  page — so it still counts. The 142 line is refused at the page door with "Blocked: close the open window, then press this
  line again.", 149 stays in view, and the window stays under its band.
- **The Leave War window** holds the war's swap (state/typing-hold.ts), so he stays on 149's Leave War with the window up;
  its row `lwsheet` counts on its own page. The same refusal, the same note.

So the state the brief fears — the door passing with a 149 window set — is not reached by these presses, and nothing in
the app changed. Close closes either window, and the same 142 line then goes through to 142's Inputs.

Also tried, by a scratch probe (removed): **a day opened on 149's Inputs calendar** (row `inputsday`). It closes by itself
when the lowered Plan lands him on View-only Sched, so it cannot come back on 142's Inputs either. Not pinned (outside the
brief's two windows); named here for the coordinator.

## Which band, and why

**The generic "This change could not be saved." — on both windows, read from the code's own function
(`state/store.ts heldWindowBand('u149')`, and for the war the band the store published, `typing-hold.ts warBand()`, which
equals it).** The pick's band ("This is 149's. You picked 142 — close this to go on.") never arises: it is given only
where the squadron in view is not the window's own (`heldByPick`), and here 149 — the window's own — stays in view because
the line is refused. The lowered Plan is a change he did not make, so the generic words are the built ones for it. No new
word was written.

**One difference from the brief, named on purpose:** the brief's list asked for every control dead by `data-heldro`. Under
the generic band the built rule greys nothing — only a pick's or the member view's band carries `ro` (his D2323, D2389) —
and `ui/msq-pick-windows.test.tsx`'s control already pins "the generic band, nothing greyed" for a Plan lowered under a
window. So the new tests assert **no** `data-heldro`, and hold "every control dead" by what each window actually does:
- the Input window: 149 no longer lets him change the input, so it draws no Save, Add or Delete, and every control of its
  form is inert (its own read-only form, `readOnly`); every write stops on `held` besides;
- the Leave War window: its figure boxes stay pressable, as built for this band ("his typed words stay visible under
  it"), but a figure typed and entered is refused at the box — the band's words show beside it — and nothing is stored.

Whether the generic band should also grey the window is not this step's call; nothing was changed for it.

## What changed

- `src/ui/msq-guard-doors-bell.test.tsx` — a new describe, "K7c — a window held on 149, his Plan lowered under it: a 142
  line is refused, the window stays held (K7 finding 2; pin)", two tests:
  1. **the Input window** — Hunter (142's admin, Plan of 149) picks 149 by the top bar, opens an Input window on 149's
     Inputs; Saber lowers the Plan to View; the window is still on the page, still holding the same input, still counted
     (`inputdlg`); the band's words are `heldWindowBand('u149')`'s, nothing greyed; no Save / Add / Delete, every form
     control inert; the 142 line pressed through the bell: refused, 149 and the page unchanged, the line unread, the note
     the tables' (`guardWords`); the window and band still there; `INPUTS` unchanged for 142 and 149; the band's Close
     closes it, nothing saved; the same line then goes through — 142, his Inputs.
  2. **the Leave War window** — the same, from a name on 149's Leave War grid: the war still 149's and the page the Leave
     War after the lowering; the band `heldWindowBand('u149')`'s and the store's own `warBand()`; a figure typed into
     LVE and entered: the man's figures (`leaveFiguresOf`) unchanged; the line refused the same way; Close closes it,
     nothing saved; a 142 line then goes through.
- **How the Plan is lowered:** through the squadrons' own door (`state/units.ts setGrant`, a master admin's change of a
  Plan), with Saber's session put in for the change and Hunter's given back — as `msq-pick-windows`' control and K7's
  `msq-inputscal-own-calendar` lower it. Two roads tried first and set aside, said in the test's comment: `signInAs` is a
  sign-in of his own, which takes him home and clears his windows (that is what K1b's A7 pin saw as "taken home"); and
  `saveAccess` reads its "your own account" check from his own person, which a swapped session leaves in place.
- Imports for those (no other line of the file changed).
- Nothing under `src/` but that test file. No app file, no `undo/timeline.ts`, `UsersPanel.tsx`, `AdminPage.tsx`,
  `storage/` or `src/engine/`.

**Shown to catch the fault:** with the Input window's hold switched off for a moment (`held` forced false in
`ui/InputWindow.tsx`), the Input window test fails at "the band across the window"; the file was put back by
`git checkout` at once and is unchanged.

## Checks

All run from `raptor-port/`, each one's output in `.tmp/`.

| Check | Result |
|---|---|
| the new describe alone (`vitest run src/ui/msq-guard-doors-bell.test.tsx -t K7c`) | 2 passed (`.tmp/k7c-new.txt`) |
| the same with the Input window's hold switched off for a moment (the file then put back) | the Input window test failed at "the band across the window", as it should (`.tmp/k7c-mutant.txt`) |
| the touched file plus K4–K7b's guard files and their neighbours — `src/ui/msq-guard-*`, `msq-pick-*`, `msq-fix-sched-windows-midnight`, `msq-inputscal-own-calendar`, `msq-night-held-input`, all of `src/state/` and `src/testing/` | **213 files passed; 2751 tests passed, 1 expected fail, 6 to-do; exit 0; 910 s** (`.tmp/k7c-guard.txt`) — K7's two red Inputs-calendar Undo tests are green here, as K7b left them |
| `npm run lint:changed` | the one known finding only (`ui/UsersPanel.tsx`, high complexity — not this section's file, the same as K7's report); exit 1 as before (`.tmp/k7c-lint.txt`) |
| `npm run build`, under the checks lock (waited for another chat's hold first, released at once after) | passed, exit 0 (`.tmp/k7c-build.txt`) |
| the full unit suite | **NOT RUN** — no app file changed, only one test file (the brief: "No full suite unless `src` changed" — read as the app's code; say if the coordinator reads it otherwise) |
| `npm run docsize` | passed, exit 0 — "every record accounted for"; its standing "over by 189, deferred (D29)" note is not from this step (`.tmp/k7c-docsize.txt`) |

## For the coordinator

- K7's finding 2 is closed as a pin for the Input window and the Leave War window; the inputs-calendar day closes itself on
  that road (probe, not pinned).
- The brief's `data-heldro` line does not fit the generic band as built (above): a question only if he wants the generic
  band greyed too.
- No file was added or renamed: nothing for `docs/file-map.md`.

## Walk

Nothing new on screen and no app change, so no walk of this step's own. The road is still worth a walker's minute at the
section's walk: Hunter on 149 with an Input window, Plan lowered by Saber, a 142 bell line — expect the grey "Blocked:"
note and the window still up under "This change could not be saved.".

## Rulings

Rulings: none this session.

Status: READY FOR INDEPENDENT REVIEW (a pin: one test file, no app change)
