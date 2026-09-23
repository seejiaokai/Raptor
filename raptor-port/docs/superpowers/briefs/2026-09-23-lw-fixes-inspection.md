# Inspection brief — the Leave War month/scrollbar/frozen-bar fixes, and the checks on the owner's PC

Branch `claude/lw-monthjump-phone`, 23 Sep 26. Built by Opus 5.5. You are one of two independent readers
(the other is a different provider); you will not see each other's report. Read-only: do not edit, run
or delegate anything.

## What to read

**Everything that changed since commit `416751d4`** — `git diff 416751d4` plus any uncommitted change:

1. **Commit `1475e506`: fixes to Astra's second read of the CI move, NEVER RE-INSPECTED.**
   `.github/workflows/deploy.yml` (the `pc` job and its guard, the complementary guards on the
   GitHub-machine jobs, `permissions`, `persist-credentials: false`, the pinned `PORT_URL`/`APP_URL`,
   the `|| exit /b 1` line-ending step, the Pages note), plus its notes.
2. **This session's app fixes** — `raptor-port/src/leavewar/ui/Matrix.tsx`, `colwindow.ts`,
   `matrix.css`, `raptor-port/src/ui/QualsPage.tsx` — and the tests: `raptor-port/e2e/leavewar.spec.ts`,
   `geometry.spec.ts`, `step4-leavewar.spec.ts`, `app.ts`.

The evidence sheet for the whole branch is `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md`
(§8 onward is this session: the roll-calls, the red-before/green-after runs, the walk). Read it first.

## The promises and the rulings (read `DECISIONS.md` for the full text)

- **[LW-MONTHJUMP-PHONE]** — on a phone a month button must land its month's 1st at the frozen name
  column's edge, never a day short. Measured cause: the grid caches each month's drawn width; February
  was measured while a posted-out man's row showed; once hidden, February draws 20px narrower; the
  background fill later swapped February's placeholder for the real month mid-scroll, trusting the old
  width, and on a touch screen the re-anchor is deliberately skipped in motion (a `scrollLeft` write
  kills an iOS fling — the 30 Aug 26 history). **The fix:** each cached width is stamped with a token
  (`widthGen`) that changes whenever anything that sets a column's width can have changed; only a width
  measured under the CURRENT token counts as exact (`widthExact`), so a left draw over any other width
  waits for rest, where the anchor absorbs it. Placeholders keep using the stale width (best number,
  no shift when the token changes).
- **[LW-HBAR-RESYNC]** (D150) — after the desktop bottom scrollbar is dragged, the thumb's follow is off
  for 250ms so it is never written out from under the pointer; a grid move inside that hold used to be
  dropped for good. **The fix:** one catch-up follow when the hold ends (`syncHbar`, `hbarCatchUpRef`).
- **The frozen date bar** — owner's video, 23 Sep 26: *"the frozen bar scrolling rapidly horizontally
  when they scroll the page down. Looks untidy too."* The bar mounts afresh each time the page scrolls it
  into view; its position was set in a passive effect (after the first paint), AND a freshly created CSS
  scroll-driven animation is not applied on its creation frame. Measured on the built bundle: the first
  frame showed the start of the year (5,135px off). **The fix:** the seeding effect is a layout effect;
  it sets `--lwx-max` and holds the animated table with an inline `translateX(-scrollLeft/zoom)` until
  the animation's `ready` resolves, then clears it; the `lwx-follow` keyframes gained an explicit
  `from` (an implicit one borrowed the held inline value and blended: a 1,819px one-frame jump).
  The same one-frame-late placement was found by roll-call in the desktop bottom scrollbar (`[hbar]`
  effect) and the Quals page's frozen header (`QualsPage.tsx`); both are now layout effects.
- **D87** — a browser test that fails on a slow machine waits on what it needs, never a fixed time.
- **D89 / D151 / D152 / D153** — the checks run on the owner's own Windows PC (a self-hosted runner, now a
  Windows service under `NT AUTHORITY\NETWORK SERVICE`, installed at `C:\actions-runner\actions-runner`;
  never Administrator); never push while a PR's checks run; the Leave War fixes merge together with the
  CI move; a parallel Tracker chat may run beside this one.

## Your brief

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

**For every finding give exact, step-by-step fix instructions** — the file and function, the precise
change, the edge cases it must handle, the invariant it must not break, and a test that would pin it —
not a direction. **Give explicit negatives too** ("I checked X and found nothing").

## Questions worth your time (not a limit)

1. `widthGen`'s inputs (`version`, `visWindow`, `folded`, `countsOpen`, `arranging`): is anything that
   changes a day column's width missing? Is any of them so broad it would stop the phone drawing left
   months mid-fling in ordinary use (a performance regression)?
2. Is a stale width still trusted as exact anywhere else — the view-replacement path in the fill engine
   (no anchor), the hidden-tab shrink/regrow, the war switch, the jump path's own window?
3. The catch-up timer: can it fire after unmount, fight a drag still in progress, or loop?
4. The inline hold on the frozen bar: can it go stale (the animation cancelled or never started, the
   timeline inactive when the grid does not overflow, a zoom step while stuck, the non-scroll-driven
   fallback, WebKit on an iPhone)? Does the explicit `from` keyframe change any existing behaviour?
5. Do the new tests prove what they claim (MutationObserver timing; the scrollbar test's choice of
   months; `gridAtRest` moved into `e2e/app.ts`)?
6. The CI guard: can any run execute code that is not the owner's own on his PC (forks, other actors,
   bots, `workflow_dispatch`, a future collaborator, a public repo)? Is every run still gated by
   exactly one side? With the repository variable `CI_ON_GITHUB` DELETED (the next step), which jobs run
   for a push to `main` and for a PR from the owner's own branch? Anything about the service account or
   its folder that weakens least privilege?
