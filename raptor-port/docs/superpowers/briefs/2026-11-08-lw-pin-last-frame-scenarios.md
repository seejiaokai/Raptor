# [LW-PIN-LAST-FRAME] — scenario design brief for Astra (chat 16, 8 Nov 26)

You are designing the TEST SCENARIOS for a change, not reviewing its code for style. Read-only: you cannot run the app.
Where a scenario needs a run, name the exact inputs (screen size, scroll positions, taps, pinch steps) and the host runs
it. Report to the file you were given.

## The promise (copied from the rulings' full rows — `grep -h '^| D1870 |' .claude/decisions-full/*.md`)

- **D1870 (8 Nov 26):** "On his iPhone the Leave War's pinned dates row and Quals' heading blink for one frame on a quick
  flick on the live app and not on the trial, so the pinned row the browser shows by itself on the page's own scroll is
  built for keeps, with the full check, the trial's loose ends fixed." Its loose ends, from his question page: a screen
  reader never reads the hidden pinned row, a pinch still hides it, it moves when something above the grid changes
  height; the phone's frames at the 33 ms mark measured again.
- **D1850 / D1789 (8 Nov 26):** the pinned dates row (Leave War) and Quals' pinned heading take the real row's place in
  the same frame the row reaches the top bar, desktop and phone, never blinking cut or missing; stop if scrolling gets
  slower.
- **D1287, D1288 (Leave War pinch), D1110 (Quals pinch):** while the fingers pinch, the pinned parts stay pinned (names
  column, frozen date row under the month buttons, the corner); part-way down a pinch out scrolls the page with the
  pinch, no band opens; never two date rows; nothing drawn over the month buttons.
- **D993 (Quals) and the Leave War's own sideways follow (28 Aug 26):** the pinned row follows the table sideways by the
  browser itself.
- **D1518:** nothing pinned leaks — a pinned bar shows none of what scrolls behind it, at every zoom and scroll.
- **D587, D1657, D1666:** a failed save's "Not saved" band sits along the foot of the top bar and the page moves down
  under it; `?savefail` in the address makes every save in that tab fail, so the band can be seen.
- **D1567:** on a phone only the grids that zoom by their own pinch zoom (Leave War grid, its OIL tab, Quals).

## What changed (branch `claude/lw-pin-last-frame`, prototype commit 399d3759b; the build adds the loose ends' fixes)

Before: the pinned copy (`.mxfixed` on the Leave War, `.qfixed` on Quals) was mounted by React state from the page's
scroll listener once the real row's top passed the top bar's foot, and unmounted when it came back — always one painted
frame after the browser had already scrolled (the blink).

Now, where the browser supports a root scroll timeline (`pinSda`): the copy is mounted whenever the grid is laid out, and
SHOWN by a CSS opacity animation on the page's own scroll, `animation-timeline: scroll(root block)`, its range a 1px step
at `--lwy-s` — the page scroll at which the real row meets the top bar (`scrollY + rowTop - topBarBottom`, written by
the scroll listener on the copy's own box). Taps and the shadow follow an `.up` class the scroll listener sets a frame
late. Where unsupported: the old way, unchanged.

Files: `raptor-port/src/leavewar/ui/Matrix.tsx` (`pinSda`, `placeY`, the `pin` effect, the pinch's `onStart`/`onEnd`,
the `.mxfixed` render near the foot), `raptor-port/src/leavewar/ui/matrix.css` (`.lw-pinsda .mxfixed`, `lwy-show`,
`.mxfixed.lw-pinching`), `raptor-port/src/ui/QualsPage.tsx` (`pinSda`, `pin`, the pinch, the `.qfixed` render),
`raptor-port/src/ui/scheduler/05-quals.css` (`.qfixed.q-psda`, `.qfixed.q-pinching`). The area rulings:
`.claude/rules/decisions/leave-war.md`, `people-accounts.md` (Quals), `design.md`; contracts
`raptor-port/docs/ui-contracts.md` (search "pinned", "frozen bar", "mxfixed", "qfixed").

The loose ends the build fixes (the host's list): (1) the always-mounted copy stays in the accessibility tree and focus
order while hidden; (2) during a pinch the scroll moves but `--lwy-s` does not, so the animation can hide a copy that the
pinch rule says should show; (3) the browser tests assumed no pinned copy exists at the top; (4) `--lwy-s` goes stale
when content above the grid changes height with no scroll; (5) the phone's frames over 33 ms (6 → 20 in the trial,
re-measured in the build); (6) the "Not saved" band moves the top bar's foot, so the copy's top and `--lwy-s` must follow;
(7) Quals' copy keeps its shadow during a pinch.

## Your job

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

Think especially about everything that changes the real row's place on the page, or the top bar's foot, WITHOUT a scroll
event (a fold, a window, a band, a row set change, a zoom step, a rotate, Rearrange, the month strip, an Undo, a tab
switch and back, a page hidden and shown, the iPhone's address bar), every window or menu that sits over or under the
pinned row (z-order), every tap on the pinned row (a date heading opens the day panel; Quals' heading sorts), the member
and admin views, phone and desktop, and the browser where the timeline is unsupported (the old way must be unchanged).

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW
data, report it: that is a real finding and this exclusion does not touch it.

Give, per scenario: rank, surface (Leave War / Quals; phone 402×874 / desktop 1536×864), setup, exact steps, EXPECTED,
the observation that would disprove it. Then exact step-by-step fix instructions for any defect you can already see in
the code, and explicit negatives ("I checked X and found nothing"). At most 25 scenarios, most likely failures first.
