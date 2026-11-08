# Walker's brief — the top bar held to the screen (D1873), 8 Nov 26

You are a Sonnet walker (D588, D787). You drive the running app, take pictures and report; you never read code for bugs
and never change app code. Paths are from `raptor-port/`. **Read first:** `docs/walk-scripts.md` whole (§8 "When nothing
on screen should change" above all) and `raptor-port/CLAUDE.md` §Build & verify. Write your scripts to
`scripts/handpass/topbar1108-*.mjs` and your pictures to `docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/topbar/`.

## The change you are checking
The app's top bar (`#shell > .topbar`, and the guest page's `#guestApp > .topbar`) was `position: sticky`; it is now
`position: fixed` on screen, with an empty block of the bar's measured height (`--topbar-h`) kept at the top of the page
in its place. **At rest nothing on screen should change.** It must stay at the screen's top through every scroll, with the
page going under it, never showing through it.

## The builds and the lock
- Before: commit `b0968d50d` (`git worktree add` a throwaway folder OUTSIDE this checkout, e.g.
  `C:/Users/User/AppData/Local/Temp/topbar-before`, `npm ci`, `npm run build`, copy `dist`). After: this checkout's HEAD
  (`npm run build`). **Take the checks lock before each build and before every browser run, and release it at once
  after:** `node scripts/gatelock.mjs exec "claude/lw-pin-last-frame — topbar walk <what>" -- <command>`. If it is held,
  wait and try again every few minutes. Serve each `dist` with `npx vite preview --port <p> --outDir <dist>` on free
  ports 4310 / 4311 (check a port is free first); stop servers by their port. Remove the throwaway worktree at the end
  (`git worktree remove`).
- Sign in as `ad` / `a` (admin). Use the repo's browser fallback (`playwright.config.ts`'s `CHROMIUM`). Watch console
  errors, page errors and 4xx on every step.

## A — the pixel check at rest (§8)
Every page at scroll 0, at 1536×900 Chromium and 402×874 WebKit (Playwright's `webkit`): View-only Sched, Edit Schedule,
the Scheduler Board open, Inputs (list and calendar), Quals, Leave War (Grid, Approvals, Balances, OIL), Tracker, Logic,
Admin, Help. The before build twice (the noise floor), then before against after, pixel for pixel. Report each screen:
identical / differs (with a marked side-by-side picture of the difference). Reuse `scripts/handpass/rss1108-same.mjs` if
it fits.

## B — scenarios on the after build (each: what you did, what you saw, PASS / FAIL, its picture)
1. Each long page (Edit Schedule, Inputs list, Quals, Leave War Grid, Admin) scrolled to its foot: the bar's top is 0 and
   it is whole; picture the top 300px.
2. The same pages mid-scroll: nothing of the page shows through or beside the bar (sample its pixels against its own
   colours; Edit Schedule's bar is blue-tinted); the Scheduler Board's own bar unchanged.
3. The first content under the bar at rest starts exactly at the bar's bottom (measure both) on every page, at 1536, 1024,
   830 (the page names fold into ☰ or wrap — note which) and 402, and on a phone on its side, 874×402.
4. The "Not saved" band: open the app with `?savefail` added to the address, make one change that saves (an input's
   remark, a Quals tick), see the band appear under the bar: the bar grows, the page moves down by the same amount, nothing
   covered; press Retry / reopen without `?savefail` and see it go and the page come back. Picture both, at 1536 and 402.
5. Leave War Grid scrolled down: the pinned dates row flush under the bar, no gap, no overlap (measure); Quals' pinned
   heading the same; the Balances page's bar the same. Desktop and phone.
6. Windows: "Jump to a date" and the day window on Edit Schedule, a document viewer if one opens from Inputs; each opens
   below the bar, and with it open, Undo and Redo on the bar can be pressed (D1645). The bell's list opens and closes.
7. Pages switched by the bar's names (and ☰ on a phone), and the window resized from 1536 to 830 and back, with a page
   scrolled: after each, step 3's measure still holds.
8. On a phone (402), the bar's own sideways scroll still moves its buttons, the ☰ and mark stay at its left.
9. A Leave War "Approvals" date tapped: the grid opens with that day ringed, the ring just under the bar, not behind it.
10. Print preview (`page.emulateMedia({ media: 'print' })`) of View-only Sched: no empty block at the top.
11. The guest page if you can reach it (Admin → Users: the guest switch on; sign out; sign in with a new email and ask for
    access; view the schedule): its bar at the top, the page under it. If you cannot reach it, say exactly why.
12–14. The plain-user round (§7.0a): on Edit Schedule scroll half way, then press every control on the bar that opens or
    closes something — ☰ (open, close by its ✕, by a tap outside, by Escape), the bell, the page names — and Undo / Redo
    after one change; then the same on the Leave War Grid at 402. Picture right after each press and when settled.

## Report (your final message)
A table of A's screens and B's scenarios with PASS / FAIL / NOT REACHED and the picture's file name; every FAIL with what
you expected, what you saw, its picture; errors seen; how long each part took. Do not judge whether a FAIL is a fault in
the app — describe it; the host decides.
