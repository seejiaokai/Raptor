# Evidence — `[LW-FIGSEL-FLAKE]`: the "Saving…" note moved the page (28 Sep 26)

Branch `claude/lw-figsel-flake`, cut from `main` at PR #453's merge. The Leave War desktop test "-1.5 subtracts; 0, abc
and 1.25 are refused and the run stays" failed on about half of GitHub's runs since PR #451 (5 or 1 cells selected where
the drag crossed 3), never on the PC.

## What it was — an APP fault the test caught

The top bar's save note ("Saving…", after EVERY change, for the third of a second a save takes — the postman's coalesce,
`storage/postman.ts`) came and went IN the bar's row, after the tabs. A bar with less room to spare than the note needs
(~90px) wrapped onto a second line and back:

- **Measured on GitHub's machine** (a text probe, no pictures uploaded — `[CI-FAIL-PICTURES]` is his call): the Leave War
  top bar at 1440 wide had ~18px to spare (brand 131 + tabs 747 + controls 456 + gaps and padding) — so the note wrapped
  it, and the page dropped two drawer rows (~46px) under the test's mouse mid-drag: 5 cells (it landed two rows lower)
  or 1 (two rows higher, back on the first). Their fonts are wider than this PC's; the geometry is the same.
- **Measured on this PC**, the note added to the bar: at **1366 wide** (a common laptop) View-only Sched, Inputs, Quals,
  the Leave War and Admin all went 57px → 103px; at 1440 the Tracker did. At 1280 and below the bar is two lines
  already (no jump).
- **On a phone** (390 wide) the bar scrolls sideways instead: on Edit Schedule the note pushed Undo, Redo and the changes
  clock ~46px to the right as a change landed — the owner's 2 Sep 26 rule (a control tapped again and again must not
  move under the finger).

Why it began with PR #451: the change history's own save (added there) rides every command, which moved WHEN the note
clears — into the window of that test's second drag. The fault itself is older (the storage seam, 8 Sep 26).

## The fix

The note floats just under the top bar's right end (`scheduler.css` `.topbar > .savestat`, `position:fixed`), its top
the bar's measured bottom + 6px (`ui/SaveStatus.tsx` — the bar is one line or two by page and width), in the bar's own
layer as before. It lets a press through to what it floats over (the week's search box sits there) — all but "Not
saved — Retry"'s button. The Tracker's own save note (its header) shares the class and is untouched (checked: still
`position: static` in its own slot). The test itself is unchanged.

## The tier (bug-check order §5)

1 money — no · 2 published record — no · 3 saved data — no (the note shows the save; the save is untouched) · 4 a shared
drawer — **YES** (the top bar, on every page) · 5 a new gesture — no · 6 a new surface — no (moved) · 7 roles — no ·
8 warnings — no. **WALK.**

## Roll-call — every page the top bar is drawn on

| Page | 1366 | 1440 | Phone 390 | The note | Nothing moved |
|---|---|---|---|---|---|
| Edit Schedule | ✓ (two-line bar, note at 110) | ✓ (two-line bar) | ✓ | under the bar, on top | ✓ |
| View-only Sched | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inputs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Quals | ✓ | ✓ | ✓ | ✓ | ✓ |
| Logic | ✓ | ✓ | ✓ | ✓ | ✓ |
| Leave War | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tracker | ✓ | ✓ | ✓ | ✓ (the Tracker's own note untouched) | ✓ |
| Help | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| The scheduler board | — | — | — | must not show over it: the board covers the whole top bar, as it did before (unchanged layer) | — |
| Sign-in, Request access, the guest view | — | — | — | must not: no save happens there | — |

"Not saved — Retry" (a browser refusing to store — the real route to it), 1366 and phone: shown under the bar, its
Retry takes a press, a press on its words reaches the search box beneath (1366), Retry saves and the note goes.

## The walk

`scripts/handpass/sn-walk.mjs` against the production build — every page, 1366 / 1440 / phone, a real change each time,
every frame sampled until the save lands (the bar's height and every button's place; the note seen, on screen, on top).
**ALL PASS, 92 checks, 0 FAIL; no console errors; 29 pictures.** Pictures: `raptor-port/docs/img/handpass/2026-09-28-lw-figsel-flake/`
(`<size>-<page>.png` with the note up; `<size>-editsched-not-saved.png`). Looked at: the 1366 Leave War (one-line bar,
note under its right end), the phone Edit Schedule (note under the bar, over the Publish button's corner for the moment
it is up — a press goes through), the 1366 Edit Schedule "Not saved — Retry" (over the search box's right end).

## Tests, red first, and the break

- `e2e/geometry.spec.ts` "the Saving… note never moves the top bar or its buttons, and it can be read" (1366 desktop:
  View-only, the Leave War, Quals, Edit Schedule; phone: Edit Schedule, View-only) — **RED on the old code** at both
  sizes ("nothing in the bar moved while it was up"), green on the fix.
- **Break test:** the measured top switched off (the note left at the stylesheet's 64px) → the 1366 test goes red on
  Edit Schedule's two-line bar ("the note sat on screen under the bar"). Restored → green. The fix removed (the old
  code) → red, above.
- **On GitHub's machines, the fix repeated** (a throwaway branch, deleted after): the whole Leave War desktop set five
  times side by side with no retries — **5 × 170 passed**, and the new top-bar test passed on their fonts each time.

## Not walked, and why

The board's own top bar has no save note (it covers the shell's). A real phone's keyboard over the note — the note sits
at the top; unchanged by this. Safari — the fix is layout (a fixed element), nothing engine-specific.

## Gates

One run under the PC lock on the final code (`3a02167c`): unit **6746 / 6746** (417 files) · build clean · tfin
**728 / 0** · e2e **487 passed**, 48 skipped (the two new ones included) · smoke **443 / 0** · rulecheck OK · docsize OK.
