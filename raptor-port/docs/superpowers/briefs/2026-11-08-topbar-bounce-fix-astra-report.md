Built and left **uncommitted** on `claude/lw-pin-last-frame`. Ready for Opus’s independent review and browser checks; not live. No commit, push, stash, branch switch, merge or rebase performed.

The top bar now stays fixed to the screen, with its exact measured height reserved above the page. This follows the pinned dates row that stayed put in your recording. [WebKit’s report](https://bugs.webkit.org/show_bug.cgi?id=206227#c10) also describes fixed elements staying put during Mobile Safari’s bounce. That supports this cure; your iPhone must still confirm it.

**Does it remove the page’s spring or pull-down-to-reload? No.**

File-by-file changes:

| File | Change |
|---|---|
| `src/ui/scheduler/02-shell.css` | Fixes the main and guest bars to the screen and reserves their height. Applies only on screen; the Leave War’s own controls still scroll away. |
| `src/ui/topbarvar.ts` | Keeps the exact height, including fractional pixels; follows wrapping and warning bands; avoids unchanged writes; clears its measurement when the bar disappears. |
| `src/ui/Shell.tsx` | Measures the main bar before the first screen is painted. |
| `src/ui/GuestApp.tsx` | Gives the guest bar its own measurement and cleanup. |
| `src/ui/topbar-css.test.ts` | Adds two checks for fixed positioning, reserved space and limited scope. |
| `src/ui/topbarvar.test.ts` | Adds seven checks for height changes, cleanup and resize handling. |
| `src/ui/accounts-ui.test.tsx` | Adds a check covering guest entry, return to the main app and sign-out. |
| `src/ui/sidegrip.test.ts` | Strengthens the height check to require the fractional part. |
| `e2e/topbar-names.spec.ts` | Adds desktop and phone checks for resizing, page placement, scrolling and print. **Not run**, as instructed. |

**Roll-call:** these answers describe source and unit-test coverage, not a completed browser walk.

| Area | Result |
|---|---|
| Everything reading the bar | **Has it:** Leave War grid, sheets and person window; Quals; Logic; row visibility; floating windows; uncovered-bar windows; OIL band; crew panel; loading claw. Existing height and edge readings remain connected. |
| Pinned rows and Balances | **Has it:** existing positioning retained. The page remains the scroller, including the pinned rows’ scroll-driven appearance. Flush edges still need browser inspection. |
| Warning and access bands | **Has it:** reserved space follows the whole bar, including both warning bands. Guest measurement added; standalone access-screen bands unchanged. |
| Windows below the bar | **Has it:** existing placement and layering retained. Pressability needs the browser walk. |
| Page names and wrapping | **Has it:** existing folding retained; height changes update the reserved space. |
| Phone behavior and Scheduler Board | **Has it:** sideways scrolling, menu lead, zoom restrictions and the Board’s own bar retained. Keyboard and rotation behavior need the real phone. |
| Print and sign-in | **Must not gain extra space:** the new spacing is screen-only and limited to the main and guest pages. Sign-out clears the measurement. |

**Checks:** 722 unit tests passed across 39 files: 36 directly related checks and 686 existing regression checks. Application and browser-test TypeScript checks passed. `npm run lint:changed -- --include-untracked` reported no new findings.

Red-first evidence: the fixed-position and spacing checks failed before implementation; height checks exposed rounding; the guest check found the previous main-bar height retained instead of measuring its own.

**Opus must now check** desktop, narrow desktop, phone upright and sideways: page starting positions; wrapped names; both warning bands appearing and disappearing; pinned Leave War/Quals rows and Balances without gaps; windows and bar buttons; guest/sign-out transitions; and print.

**Only your iPhone can confirm** bouncing at both ends with Safari’s toolbar open and folded, plus smooth keyboard opening/closing and preserved pull-down-to-reload.

Walk: **NOT RUN — assigned to Opus by the brief.** No build or browser launched.  
Rulings: none new; implemented D1873.
