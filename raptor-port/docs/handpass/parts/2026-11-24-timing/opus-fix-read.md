# Fresh Opus read of the fix diff (fix-diff.patch) — ?timing readout as a "bystander"

Scope: `fix-diff.patch` read whole; then whole: `ui/FloatWindow.tsx`, `ui/floatwin.ts`, `ui/winorder.ts`,
`ui/boardescape.ts`, `ui/topbits.tsx` (BellList), `ui/timing.ts`, `ui/timingtext.ts`, `ui/timingwindow.tsx`,
`ui/TimingReadout.tsx`, `ui/timing.css`; and every keydown listener in `src/` (window/document, capture/bubble) that can
meet the readout's Escape, plus the CSS layers (`22-float-windows.css`, `19-availability.css`, `20-changes-quals.css`,
`leavewar/ui/bidpicker.css`). A production build of the copy was made (`C:/t167r/proof/dist`) to check the chunk names
the new file-counting regexes rely on.

## Findings

### F1 — One Escape closes two things: the readout's listener shares the window's capture with the app's own "peel one layer" listeners, and `stopPropagation()` does not stop them (medium — ?timing only)

**Cause.** `src/ui/FloatWindow.tsx:243-253` — the bystander's `onBystanderKey` is added with
`window.addEventListener('keydown', …, true)`, i.e. the SAME node and phase as many app listeners that close one layer
on Escape without checking `defaultPrevented` or where the keys are, and that stop the key with `stopPropagation()`
only: `leavewar/ui/OpenDatesSheet.tsx:173` (the "Open for bidding" exact-days calendar), `leavewar/ui/Matrix.tsx:1973,
2011` (popovers), `leavewar/ui/FlyEdit.tsx:203`, `leavewar/ui/SettingsSheet.tsx:195` (palette), `leavewar/ui/BidBits.tsx:81`,
`ui/InputsPage.tsx:402` (List view's range calendar), `ui/TypeLegend.tsx:58`. On one node, `stopPropagation()` never stops
the other listeners of that node, so whichever of the pair was registered second still runs:

- (a) **layer registered first** (it opened before the readout was reopened from its corner button): it closes its layer
  and calls only `stopPropagation()`; the readout's listener then runs, sees `defaultPrevented === false`, the keys in it,
  and folds the readout too.
- (b) **readout registered first** (open since the start — the normal desktop case): it folds and calls
  `preventDefault()+stopPropagation()`; the later layer's listener still runs and, not checking `defaultPrevented`,
  closes its layer too.

Before this diff the readout listened at the window's BUBBLE (the ordinary `onKey`), which the layer's capture-phase
`stopPropagation()` did stop — so (a) is new with the diff; (b) is new too (the old bubble listener ran after, and was
stopped).

**Steps (a), concrete, desktop:** `?timing`; fold the readout with its ✕; Leave War → "Open for bidding" (a blocking
sheet: scrim z 79, sheet z 80, not `raised` because no `.floatwin` was on the page when it drew); press a stretch so the
exact-days calendar shows; press the **Timing** corner button (z 409 — above the scrim, so it takes the press and nothing
closes); the readout opens over the sheet and takes the keys (`quietOpen` false). Press Escape.
Happens: the exact-days calendar closes AND the readout folds. Should: one thing — the readout (the keys are in it,
and it opened last).

**Steps (b):** `?timing` on a desktop (readout open since start); Inputs → List → open the range calendar; Tab on through
the page until the keys land in the readout (its root is appended last to `<body>`, so Tab reaches it; that calendar
closes only on a press, not on Tab). Escape. Happens: readout folds AND the range calendar closes. Should: the readout only.
(Every press on the readout closes these popovers through their document pointerdown listeners, so (b) needs the keyboard
route; (a) needs only presses.)

**Fix (tried in the copy, then reverted):** in `onBystanderKey`
```ts
if (e.key !== 'Escape' || e.defaultPrevented || e.cancelBubble || e.isComposing) return   // a layer before it stopped it: theirs
…
e.preventDefault()
e.stopImmediatePropagation()                                                             // later window-capture layers never hear it
closeRef.current()
```
`cancelBubble` reads the stop-propagation flag, so a layer heard first keeps its press; `stopImmediatePropagation()` keeps
every later window-capture listener off it. Checked safe for the board: `boardescape.ts` `down` (window capture) may then
not run for that press, but `up` (window bubble) does not run either, and `want` is reset by every other keydown — no stale
close. `timing.ts heard` and `gridguard` are registered at module load, before the readout, so they still run.

**Test:** `C:/t167r/raptor-port/src/ui/proof-bystander.test.tsx` — two cases, the listeners copied in shape from
OpenDatesSheet.tsx:173 (a) and InputsPage.tsx:402 (b). **Both FAILED** on the code as given (a: calendar closed and
readout folded; b: `{calendarOpen:false, readoutOpen:false}`). With the fix above both pass, and `TimingReadout.test.tsx`
+ `boardescape.test.tsx` stay green (33/33).

## Your four questions, answered

1. **Timing OFF — can the FloatWindow change break an ordinary window?** No. With `bystander`/`quietOpen` undefined every
   changed line reduces to the old code: `forward(id)` and the focus-in run as before; the Escape effect skips the
   bystander branch and its deps `[id, undefined]` behave as `[id]`; `data-bystander` is not rendered; the pointerdown
   branch is skipped. `boardescape.ts`: the `:not([data-bystander])` matches every app window as before, and the new
   `t.closest('.floatwin')` line is unreachable for app windows (any `.floatwin` on the page already makes `overBoard()`
   true). `topbits.tsx`'s new `preventDefault()` on the bell list's Escape does change timing-off behaviour, for the
   better: before, Escape with the bell list open over an app window (keys on the bell button) closed the list AND the
   front window (its bubble `onKey` does not check BELLLIST, and a button holds no Escape); now only the list. Nothing
   later in the path needed that press (board `up` already had `want=''` from BELLLIST; ALL AVAIL/changes read BELLLIST at
   the document capture, before). Ran `floatwindow`, `availwin`, `topbits.wire`, `bellnotices` tests: 113/113 green.
2. **Timing ON — two at once, or none?** Two at once: F1. None when something should close: not found — with the keys
   elsewhere the readout correctly stands aside (by design), and with the keys in it every listener that runs first and
   `preventDefault`s (DateBox, DateCal, InputsCal's question) is respected. **Focus/key stealing:** none found. Quiet open
   takes no focus and no front; opened from the corner button it takes focus as intended; the pointerdown focus only
   happens for a press on the readout itself (the same blur any press on the page would cause); only Escape is ever
   stopped.
3. **File counting / sizes:** correct for the stated rules. filesOf: memory (0, b) kept; 304 (300, b) kept for b<300,
   b=300, b>300; whole (b+300, b) never 300 for b>0, counted as downloaded. downloadedBetween: same rule, body >0 required,
   counts transfer (body+300). OTHER_PAGE: the build shows each page's own files are only `LeaveWarPage-*.js/.css` and
   `TrackerPage-*.js/.css` (all other chunks are in the first download, except `undo-bridge` 0.22 kB, shared by both) —
   so the regexes catch exactly the other page's own files.
4. **Anything else:** nothing further concrete (see below).

## Checked and found sound
- Readout never enters UP/FRONT: `gone('timing')` on close is a no-op; `makeEscWaits` and InputsCal/TypeLegend `frontWin()`
  readers no longer see 'timing' — ALL AVAIL/changes Escape works with the readout up.
- z-order: readout 405 under app windows 410/411 (`.floatwin`, `.availwin`, `.chgwin`), over the board 400; pill 409;
  Leave War blocking sheets drawn while the readout is open are `raised` (480/481) over it — unchanged by the diff.
- Board with the keys in the readout: `boardEscapeWants` returns '' via the new `.floatwin` line; the board stays.
- Bell list over the readout: list closes alone (keys never in the readout — a press on it closes the list first).
- Escape folds → FloatWin cleanup refocuses a still-connected opener; else the readout's effect puts the keys on the pill;
  copy-race guard (`copyReq`) and fold reset correct.
- `quiet` only flips on the pill press, while FloatWin is unmounted — the mount effect sees the right value.
- timing.ts hidden branch: a page change while hidden gives no row and leaves `seen` alone; the only automatic page moves
  (store.ts 550/562) go to View-only, already "seen", so no false "first time" later. A sign-in cannot be pressed in a
  hidden tab.
- Sign-in resets `seen`: Login is drawn only when signed out, so the pages after it are a fresh build — "first time" is right.
- Phone cap: `.floatwin.timingwin:not([data-placed])` beats the generic phone `.floatwin` rule; `.win-body` scrolls
  (flex, `min-height:0`, `overflow:auto`); `data-placed` is never set on a phone, so the cap always applies there.
- The changed files' own tests (timing-watch, timingtext, timing, TimingReadout, boardescape): 91/91 green in the copy.

## Tidiness notes (filed, not fixed)
1. `UNCHANGED_HEADER = 300` and the "unchanged" test now live twice (`timing.ts:107,118` and `timingtext.ts:21,30`); a
   one-line constants module with no words in it could be imported by both without touching the first download.
2. `boardescape.test.tsx` repeats the same `TimingView` fixture, host/root set-up and `<Readout …/>` render four times; one
   helper would cut ~30 lines.
3. `FloatWindow.tsx` 241-273: one effect now holds two unrelated listeners chosen by an early-return branch, and the
   bystander's focus-in is written twice (mount effect, pointerdown capture); two effects and one small `takeKeys()`
   would read plainer.
