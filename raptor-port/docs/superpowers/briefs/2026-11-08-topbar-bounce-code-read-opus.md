# [TOPBAR-BOUNCE-AWAY] (D1873) — the fresh, blind Opus code read

Reader: a fresh Opus helper, blind (wrote none of this code; has seen no walk report and no other reader's report).
Brief: `2026-11-08-topbar-bounce-code-read.md` (beside this file). Commit read: **6e8709abe**, against `b0968d50d`
(`git diff b0968d50d 6e8709abe -- raptor-port/src raptor-port/e2e`), plus every reader of `--topbar-h` and every
surface the brief lists, read at 6e8709abe with `git show 6e8709abe:<path>`.

**Caveat on the working copy.** While this read ran, the host's checkout moved past 6e8709abe (`main` brought in at
64655d92a, now 4977a3877): `Shell.tsx`, `GuestApp.tsx`, `SaveStatus.tsx`, `17-save-status.css`, `floatwin.ts` and
`accounts-ui.test.tsx` changed (D1901's `useBandUp`). Every line cited below is from 6e8709abe. I checked with
`git diff 6e8709abe -- <file>` that every other file I read is unchanged, and that the D1873 test cases in
`accounts-ui.test.tsx` are unchanged. The unit runs below ran on the working copy, so they ran the merged Shell and
guest page, not 6e8709abe's byte for byte.

## Summary

| # | Severity | One line |
|---|---|---|
| F1 | Low (Medium only if the host's width sweep finds a width he uses) | Only the bands and the fold write `--topbar-h` before paint; every other bar-height change from the Shell's own render (a page change that adds or drops the Undo pair or the changes clock, the role switch, the Admin badge, the Sync label) reaches the spacer one frame later through the ResizeObserver's rAF — round 2 introduced this; with Chromium's scroll anchoring a scrolled View↔Edit hop or the Leave War's return can then rest one bar-row off the sticky build. |
| F2 | Low | The Shell half of the new "the band moves the page in the same frame" unit case passes with the Shell's layout effect deleted (the Shell's own synthetic `resize` writes the variable inside `act`); only the guest half guards the fix. |
| I1 | Informational, pre-existing (b0968d50d did it too) | On a desktop Chromium page already scrolled, the "Not saved" band covers the first 36 px instead of moving the page down — scroll anchoring holds the content still; on his iPhone (no scroll anchoring in Safari) the page moves down as promised. |

No High or Medium finding. Explicit negatives: §4.

## 1. The roll-call — every place the brief names, at 6e8709abe

| Place | Has it / must not, because… / MISSING |
|---|---|
| The bar on each Shell page (View-only, Edit, Inputs, Quals, Logic, Leave War, Tracker, Help, Admin) | has it: the topbar memo is a direct child of `#shell` (`Shell.tsx` render `{topbar}<WelcomeBack/>{viewPage}{editPage}…`), so `#shell > .topbar` fixes it on every page; `#shell::before` precedes every child, `WelcomeBack` included (its 10 px margin cannot collapse through a block with height). |
| The guest page | has it: `#guestApp > .topbar` is a direct child; `#guestApp::before` reserves it; layout effects at `GuestApp.tsx:36,43`. |
| Sign-in and access screens | must not, because they have no `#shell`/`#guestApp` bar: no rule applies, no writer is mounted, the outgoing tree's cleanup removed the variable; `.pgclaw` falls back to 58 px there (unchanged). |
| Covers of the bar: the Scheduler Board, the Leave War's full-screen OIL tracker, grid and settings | must not change, because they are fixed overlays above z-index 60; the bar was already a stacking context (positioned, z-index 60), so `will-change: opacity` adds none; it creates no containing block for fixed children. |
| Height changers: "Not saved" band | has it (same frame): Shell `useLayoutEffect(… , [saveFailed, oilTop, navFold])` (`Shell.tsx:363`), guest `[failed]` (`GuestApp.tsx:43`). |
| "Not kept" (D1901) | not at 6e8709abe (built on `main` later). In the merged working copy both trees key the sync on `useBandUp()` (`Shell.tsx:347,364`; `GuestApp.tsx:41,43`) — checked by reading only. |
| OIL answer's bar | has it: `oilTop` in the Shell's deps; the guest page has no OIL bar. |
| Names folding into ☰ | has it: `navFold` in the deps (the fold itself lands a frame after the wrap, by `navfold.ts`'s own rAF — pre-existing). |
| The bar's buttons wrapping without a fold; a page change adding/dropping the Undo pair or clock; role switch; Admin badge; Sync label; the document scrollbar appearing | **MISSING (F1)**: written a frame late by the observer's rAF. |
| Phone on its side, a window resize, the browser's zoom | has it: the synchronous `resize` listener (`topbarvar.ts`) and the fold's `matchMedia` change, both before the next layout. |
| The claw's overlay | reads only (`index.html:66`, top `var(--topbar-h,58px)`); changes no height. |
| Readers of `--topbar-h` | `#shell::before`/`#guestApp::before`; `.pgclaw`; `03-week.css:65` `.eroster` sticky top `var+8px`; `03-week.css:141` max-height; `personwindow.css:34,40` max-height. All take the exact fractional string the writer gives; the spacer and the bar use the same number, so no sub-pixel seam. First frame: right except under F1. |
| Fixed/sticky things measured against the old sticky bar | must not change, because the bar's box is the same (top 0, same height) at every scroll position — at scroll 0 the sticky bar already sat at 0 (body margin 0, the bar first in the document): windows under the bar (`floatwin.ts`, `barfree.ts`), the side menu, the bell's list (`topbits.tsx`), passing notes (`SaveStatus.tsx` follows the bar's bottom less `fixedOrigin()`), the pinned rows (`Matrix.tsx` `barFoot` 4780 and its observer 2100–2125, `QualsPage.tsx` `barFoot` 1159 — they read the bar's height, never its place), the desktop week's ‹ › (`.week-nav` fixed at 52%), Edit Schedule's crew panel (`.eroster`, the variable), Logic's sticky heads (`LogicPage.tsx:175`, the bar's height), the Tracker (`--tr-top`, measured from the bar). |
| Scroll restoration and "into view" (Undo D672, the Approvals jump, Find) | must not change at rest, because `onscreen.ts` reads the bar's bottom from its box and `scrollIntoView({block:'center'})` ignores the bar; no `scroll-padding-top` reads the bar anywhere. Except the page-change frame of F1. |
| Keyboard on a phone | must not change: `kbscroll.ts` models fixed boxes (`fixedOrigin`, `screenBox`); the sticky bar was laid out against the same layout viewport. WebKit not run here — his iPhone look covers it. |
| Print | has it: both new rules sit inside `@media screen`; print keeps `.topbar{position:sticky}` in flow and no spacer exists, so no empty block. |
| Reduce motion | nothing added that moves: no transition on the bar or the spacer. |
| A page too short to scroll; the spring; pull-down-to-reload | nothing changes: the spacer is in flow; no `overscroll-behavior`, `overflow` or `touch-action` was added (the CSS guard checks the first two). |
| Sign-out and sign-in again; the guest page then the main app | has it: the cleanup removes the variable; a deleted tree's layout cleanups run before the new tree's layout effects, so the Shell's write lands after the guest's removal. Tested (`accounts-ui.test.tsx` D1873 describe). |
| Set-up and tear-down; React's strict double-run | has it: the same function added and removed; observer disconnected; the pending rAF cancelled (cancelling 0 is harmless); a double-run removes then rewrites the same value. |

## 2. Findings

### F1 — the bar's other height changes reach the page a frame late (Low)

**Where.** `raptor-port/src/ui/Shell.tsx:363` — `useLayoutEffect(() => syncTopbarVar(topbarRef.current), [saveFailed, oilTop, navFold])` — and `src/ui/topbarvar.ts:26–31`, the observer's write moved to the next animation frame in round 2.

**Cause.** The fixed bar's height reaches the page only through `--topbar-h`. Round 2 made the observer's write wait for
the next frame (to stop the "ResizeObserver loop" error), and the host added a before-paint write for the three
band/fold values only. Everything else the Shell's own render changes in the bar is written by the observer, one
frame late: the page tabs (an admin's Edit Schedule and Admin tabs hidden on a role switch, `Shell.tsx:~384,~404`), the
Admin waiting badge (`waiting`), the Undo pair (`pairOn`, `Shell.tsx:306`), the changes clock and its number
(`clockNew`, Edit Schedule only), the role chip's words (`mineCs`, `canSwitch`), the Sync label (`fastOn`); and the
document's scrollbar appearing (it narrows the bar). Any of these that makes the spring wrap or unwrap changes the
bar's height while the spacer keeps the old one for a frame.

**Did b0968d50d do it?** No. The sticky bar was in flow: the page moved with it in the same layout. Round 1 did not
either: its observer wrote inside the observer callback, which runs before paint.

**The failure (desktop, at a width where the Undo pair makes the spring wrap).** Whether such a width exists is not
known from reading: the compact look (821–1599, `02-shell.css`) hides the pair's words so that "no bar grows a line"
(the `topbar-css.test.ts` case, D1126), but the names-fit test in `navfold.ts` leaves the spring out of its sum, so the
names can fit beside TALON while names plus spring wrap. My rough estimate from widths: an admin's bar somewhere
around 1290–1350 CSS px (wide look, words shown), and possibly at the narrow end of the compact look — the host's
sweep (input A) decides.
1. *One frame (cosmetic).* Admin on View-only Sched, scrolled to the top. Press **Edit Schedule**. Seen: for one
   frame the bar is a row taller (≈46 px) while the spacer is not, so Edit Schedule's first ≈46 px paint under the
   bar; the next frame corrects. Should: the page starts below the bar in the first frame, as with the sticky bar.
   Softened by the page's 0.15 s fade-in from transparent (`.page.on{animation:pagein}`).
2. *At rest (Chromium/Edge only, needs input B to confirm).* Admin on View-only Sched scrolled to 600. Press
   **Edit Schedule** (the View↔Edit hop keeps the scroll, `Shell.tsx` `lastPage` effect). The hop removes the old
   scroll anchor, so frame N has no adjustment; frame N+1 the spacer grows by Δ, and scroll anchoring keeps the new
   anchor still by scrolling Δ further. Seen (predicted): Edit Schedule rests Δ (one bar row) higher than the sticky
   build put it at the same scroll — one more row under the bar. Should: where the sticky build landed. Same shape on
   the return to the **Leave War** from a page without the pair: `LeaveWarPage.tsx:183–184` restores `savedY`, then
   its synthetic `resize` makes the writer catch up, and anchoring at the next layout moves it to `savedY + Δ`.
3. *Knock-ons for one frame:* `.eroster`'s sticky top and `personwindow.css`'s max-height use the stale value;
   Inputs' reveal (`InputsPage.tsx ~304`, a layout effect) measures the row against a page laid out with the stale
   spacer when the bell's OIL question lands on Inputs from a page without the pair.

On his iPhone this is unlikely to show: the phone bar is icon-only and, by its look, one height on every page; Safari
has no scroll anchoring, so (2) cannot happen there. On his PC (1536 CSS px at 125%) D1126 says no line grows. Hence Low.

**Fix — exact steps.**
1. In `Shell.tsx`, change line 363's dependency list to every value the bar's markup draws that can change its
   width, and nothing that changes on every edit:
   `useLayoutEffect(() => syncTopbarVar(topbarRef.current), [page, admin, pairOn, waiting, clockNew, mineCs, canSwitch, fastOn, saveFailed, oilTop, navFold])`.
   Do **not** key it on `[topbar]` (the memo): the memo's deps include `uv` and `tuv`, which change on every edit, and
   `syncTopbarVar` reads `getBoundingClientRect()` — a forced layout on every edit, while Edit Schedule and View-only
   build their weeks in passive effects (`EditWeek.tsx`, `ViewWeek.tsx`), i.e. the thrash `performance.md` Part 1
   warns about. The listed values change only on a page change, a role switch, a new access request, a new change
   from someone else, or a sync change.
2. Update the comment at `Shell.tsx:361–362` and the round-2 comment in `topbarvar.ts:26–31` to say that the Shell
   writes the bar's height before paint whenever its markup changes, and that the observer covers only the window's
   own changes (the scrollbar, a font load).
3. Optional, for (3): to have the variable right before the pages' own layout effects (Inputs' reveal), move the two
   Shell layout effects into a small component rendered immediately after `{topbar}` and before `<WelcomeBack />` —
   sibling layout effects run in tree order, the parent's last — passing it `topbarRef` and the same values.
4. Red first, in `accounts-ui.test.tsx`: mock the bar's box by its class —
   `const h = this.classList.contains('has-undo') ? 104.375 : 58.375` for `#shell > .topbar` — sign in as `ad`, land on
   View-only Sched (`expect(height()).toBe('58.375px')`), `await click($('#topnav a[data-page="editsched"]'))`, then
   `expect(height()).toBe('104.375px')`. Fails today (no listener writes it in jsdom: no observer, no `resize`), passes
   after step 1. A second case: the role switch (`#roleBadge`), mocking the height on `data-admin` tabs' `hidden`.
5. Re-walk: input B at the width input A finds, both builds.

### F2 — the Shell half of the new band test cannot fail (Low)

**Where.** `raptor-port/src/ui/accounts-ui.test.tsx:380–418` (the last case of the "D1657 — the failed-save band…"
describe, "D1873 — the band moves the page in the same frame…").

**The failure.** Delete `Shell.tsx:363` (the layout effect the case is written to guard) and run the case: by reading,
its Shell half still passes. Its own comment ("jsdom has no resize watch, so only that before-paint write can pass
this") is untrue for the Shell: the Shell's passive effect (`Shell.tsx:364–368`) dispatches a synthetic `resize`
(`saveBand: true`) when the band comes or goes, `wireTopbarVar`'s `resize` listener writes the variable, and the
test's `act()` flushes passive effects before the `expect`. In the browser the difference matters — a band brought by
a failed save arrives outside a click, so its passive effects run after paint — but the test cannot see it. The guest
half is sound: `GuestApp` dispatches no synthetic `resize`, jsdom has no observer, so only the layout effect writes.

**Did b0968d50d do it?** Not applicable (new test).

**Fix — exact steps.**
1. In that case, before `await signInAs('ad', 'a')`, register
   `const atBand: string[] = []; const onBand = (e: Event) => { if ((e as Event & { saveBand?: boolean }).saveBand) atBand.push(height()) }; window.addEventListener('resize', onBand)`
   — it is registered before the Shell mounts, so it runs before `wireTopbarVar`'s listener and records what the
   layout effect alone left.
2. After `await fail()`: `expect(atBand[0], 'written before the band\'s own resize').toBe('94.375px')`; after
   `await retry(…)`: `expect(atBand[1]).toBe('58.375px')`.
3. In `finally`: `window.removeEventListener('resize', onBand)`.
4. Correct the case's comment: the Shell also writes it through its synthetic `resize`, after paint; the case checks
   the value at that moment.
5. Red check: with `Shell.tsx:363` commented out the case must fail; restored, pass (input C).

## 3. Informational, pre-existing — I1

**Not saved band on a scrolled desktop page.** Desktop Chromium, View-only Sched scrolled to 400, then a failed save.
Seen (predicted, by reading): the bar grows 36 px, the spacer grows the same in the same frame (the fix works), and
Chromium's scroll anchoring then scrolls 36 px further so the content stays still — the band covers the first 36 px
of what was below the bar. The host's reading of the promise says "never covering a line". The sticky build did the
same (a growing in-flow bar above the anchor is compensated the same way). On his iPhone, Safari has no scroll
anchoring, so the page moves down as promised. The browser test `save-note` raises the band only before scrolling.
Not a finding of this change; if he wants it on a desktop too, it is a separate job (input D first, on both builds; a
fix would be a `scrollBy(0, -Δ)` after the write when the anchor moved, or `overflow-anchor: none` on the document
scroller, which changes other behaviour and needs its own check).

**Minor test notes (no failure today).** `topbar-css.test.ts`'s guard `not.toMatch(/(?:overflow|transform|filter|contain|overscroll-behavior)\s*:/)`
does not catch `will-change: transform` (or `filter`), which would make the bar the containing block of its fixed
children (the save note, the OIL bar) — add `will-change\s*:[^;}]*(?:transform|filter|perspective|contain)`. The
browser case covers View-only, Edit, Quals and Leave War; Inputs, Logic, Tracker, Help, Admin and the guest page have
no browser case of the spacer.

## 4. Explicit negatives

I checked and found nothing wrong in: every Shell page's bar and spacer; the guest page; the sign-in and access
screens (no bar, variable cleared); the Scheduler Board, the Leave War's OIL tracker, grid and settings over the bar
(stacking unchanged; no containing block from `will-change: opacity`); the "Not saved" band and the OIL answer's bar
(same frame, both trees — the guest's verified by a test that can fail); the fold into ☰; the phone on its side; a
window resize; the browser's zoom (both through the synchronous `resize`); fractional heights (exact string, spacer
and bar equal); the claw's overlay; every reader of `--topbar-h` (`.pgclaw`, `.eroster` ×2, the person window ×2, the
spacers); windows under the bar (D1645), the side menu, the bell's list, the passing notes, the Leave War's and Quals'
pinned rows, Logic's sticky heads, the Tracker's height, the desktop week's ‹ ›, Edit Schedule's crew panel; Undo's
landing, the Approvals jump and Find at rest; the phone keyboard (by reading `kbscroll.ts`; WebKit not run); print (no
spacer, sticky kept); reduce motion; a page too short to scroll, the page's spring and pull-down-to-reload (nothing
blocks them); sign-out then sign-in, guest then main app (tested); listeners, observer, animation frame and React's
strict double-run. "Not kept" is not in this commit; in the merged copy both trees key the sync on it.

## 5. Sandbox

I ran (working copy, see the caveat):
- `npx vitest run src/ui/topbarvar.test.ts` — 10 / 10 passed.
- `npx vitest run src/ui/accounts-ui.test.tsx -t "D1873"` — the 2 cases carrying D1873 passed, 15 skipped.
- `npx vitest run src/ui/topbar-css.test.ts` — 6 / 6 passed.
- `npx vitest run src/ui/sidegrip.test.ts` — 7 / 7 passed.

I did not build, serve or drive a browser (the checks lock). For the host:

**A — the width sweep (decides F1's severity).** Built bundle of 6e8709abe, `vite preview`, Playwright Chromium. For
device scale 1 and 1.25, widths 821–1920 step 4 (then step 1 around any hit), plus 375, 390, 430: sign in as an admin,
then for each of View-only, Edit Schedule, Help, Inputs, Admin:
`await page.$eval('#topnav a[data-page="<p>"]', a => a.click()); await page.waitForTimeout(0); const h = await page.$eval('#shell > .topbar', b => b.getBoundingClientRect().height)`;
also once with the role badge pressed (member view). Report every width where the height differs between pages or
roles. The shape of `raptor-port/scripts/handpass/cr-c-barheights.mjs` fits.

**B — the frame sampler (decides F1 (2)).** At a width A found (else skip), admin on View-only scrolled to 600; in the
page install a rAF loop recording, for 12 frames, `scrollY`, `getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')`,
the bar's height, and the top of a fixed landmark (the first day's heading); click the Edit Schedule tab; read the log.
Run on 6e8709abe and on b0968d50d; compare frame 1 and the resting frame. F1 (1) is confirmed if frame 1's spacer is
the old height on 6e8709abe; F1 (2) if the resting landmark differs by Δ between the builds. Repeat for leaving the
Leave War scrolled, going to Help, and coming back.

**C — F2's red check.** Comment out `Shell.tsx`'s band layout effect (line 363 at 6e8709abe; 364 in the merged copy),
run `npx vitest run src/ui/accounts-ui.test.tsx -t "same frame"` — predicted: passes (the gap). Add F2's steps 1–3:
predicted fail without the line, pass with it. Restore the line.

**D — I1 on both builds.** Desktop Chromium, View-only scrolled to 400, the "Not saved" band raised (`?savefail`),
the first visible day heading's top minus the bar's bottom before and after; predicted −36 px on both builds.

## 6. Tidiness note (D489) — filed, not fixed

1. **Duplicated.** The wire-plus-sync pair is written twice (`Shell.tsx:138,363`, `GuestApp.tsx:36,43`); one hook,
   `useTopbarVar(ref, deps)`, would hold both. The bar's box is read in three places by its own query —
   `syncTopbarVar`, `Matrix.tsx` `barFoot` (4780), `QualsPage.tsx` `barFoot` (1159) — the last two could read the
   variable (pre-existing duplication, now with a third copy of the number). The test's height helper and bar mock are
   written twice in `accounts-ui.test.tsx` (lines 69–74 and 386–393).
2. **Unused.** Nothing found: the Shell's synthetic `saveBand` resize is still needed by its other listeners (the
   Tracker's `--tr-top`, the pinned rows).
3. **Untrue comments now.** "sticky" for the app bar, which is fixed on screen: `Matrix.tsx` 1921, 2014, 4775;
   `QualsPage.tsx` 801, 1154; `LogicPage.tsx` 172; `InputsPage.tsx` 323; `onscreen.ts` 10; `weekglide.ts` 172;
   `03-week.css` 181; `tracker.css` 100; `Shell.tsx` 414, 611, 613 (the conclusions drawn — "its foot is its own
   height" — still hold; only the word is wrong). `02-shell.css:19` "the root height is supplied by wireTopbarVar,
   including wrapping" — wrapping arrives a frame late (F1). `topbarvar.ts:26` "WebKit then reports undelivered
   notifications" — the "ResizeObserver loop completed with undelivered notifications" message the round fixed is the
   one Chromium prints (the browser tests run Chromium); and its header's "58 to 67 on a desktop" (D1116's text)
   predates bars that wrap a whole row (the tests use 58.375 / 104.375). `accounts-ui.test.tsx:383` "only that
   before-paint write can pass this" — untrue for the Shell (F2).
