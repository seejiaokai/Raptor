# Stack read, second pass — piece D2: the Tab route and the phone ⋯ Insights menu — 6 Oct 26

Reader: Opus 5.5, read only, code as it stands at `eb8fd4d6`; nothing was run. "main" = `de470db5`. Every finding below is
by reading — each needs the red test named in its fix before it is called confirmed.

## 1. Findings

### F1 — The caret-safe redraw (W15) writes NOTHING on the week when a day gets its FIRST warning, or loses its last
*Steps.* Edit Schedule, desktop, a day with no issues at all (a fresh day, or a cleaned-up published one). Type a time
that makes a warning (an In-time later than the brief; a take-off that clashes), press Tab. *Expected (D509, W15's own
fix):* the day's warning bar appears at once; on a published day "1 pending" and "Not yet signed" too. *Code:* a day with
nothing to show draws no warning box at all (`html.ts:1098` → `soloTrace` returns `''`; the box is a direct child of
`.day-body`, `html.ts:1651`). The first warning adds a child, so the shapes no longer line up and
`dayswap.ts:137` (`if (!fits(…)) return { chunks: prev, held: true }`) holds the WHOLE day — head, sign-off strip, warning
list — until the caret leaves text. The reverse too: clearing the last warning leaves "⚠ 1 issue" standing.
`dayswap.test.ts:137` pins this as intended; the host's and walker N's runs started from days that already had
warnings (6 → 7). The board is not affected (its list is its own panel).
*main:* no caret-time redraw at all there; new as a gap in the fix.
*Fix.* (1) In `swapDayAround`, before `fits`: if the only difference is the day-body's leading `.dwbox` (present in
exactly one of live / next, every other count equal), insert `next`'s box at the front of the live body — or remove the
live one, it never holds a caret — and add / drop that entry in `prev`'s body kids; then run the ordinary positional
pass. (2) Tests, red first: `dayswap.test.ts` both directions with the caret in another block; `schedule-tab.test.tsx`
"W15 week" from a day with zero warnings, and a published clean day reading "1 pending" with the caret still in text.

### F2 — After a Tab-saved take-off or landing, a CLICK into that formation's Area time stores the old window
*Steps.* Edit Schedule (week or board), a formation showing a derived window `1240-1405`. Type take-off `1255`, press
Tab (caret now in Landing). Click straight into that formation's Area time cell; click on empty page. *Expected:* the
window follows to `1255-1405`, nothing stored (the 6 Aug 26 derived-cell rule; D45/D103 on a published day).
*Code:* the Tab save leaves the caret's block un-redrawn (week: `swapDayAround` holds it; board: `SchedBoard.tsx:293`
holds the whole `#sbBoard`). Leaving Landing unchanged fires no store tick, and the settle timer finds the caret already
in the next box (`EditWeek.tsx:112`, `SchedBoard.tsx:244`), so the cell still reads `1240-1405`. Only the Tab route
refreshes a box on arrival (`textedit.ts:292` — `refreshTextDestination` has one caller). On leaving, `textedit.ts:255-256`
sees `1240-1405` ≠ the model's `1255-1405` and stores it as a typed override: the window is frozen and wrong, one
history line, one extra pending change on a published day.
This is first-pass lead 1 by a route the walk did not take: L-10 and the host's compare were click → click, where the
changed box's blur redraws the day first. Tab → click skips that redraw.
*main:* no route; not established for main's native Tab.
*Fix (the first pass's, unbuilt).* (1) `textedit.ts`: export `routeFocusIn(e)` — `closest` of the eight box kinds,
return unless `canEditSched()` and `CURPAGE==='editsched'`, call `refreshTextDestination`; make its In-time branch
compare (`sameInner`) before rewriting. (2) `Shell.tsx:236`: register it on `focusin`, remove in the cleanup.
(3) Test: the steps above on week and board; command count and pending count unchanged.

### F3 — An open Blue/Red question vanishes when a Tab run ends without a further change
*Steps.* Tracking on. Type `DS FOR RU` in a formation's Remarks, press Tab (the question appears, caret in the stores
box). Press Escape or Enter, or click empty page. *Expected (D535):* the question stays. *Code:* the question is a node
hung inside the flying block, which was held for the caret. The settle paint (`EditWeek.tsx:114` /
`SchedBoard.tsx:246`, a local `setSettledPaint`) then replaces that block; the question is re-hung only on a STORE tick
(`mission-role-offer.ts:211,228`; `App.tsx:27` runs only when App re-renders) or on focus into a text box. It comes
back at the next change anywhere. Present since the route's pending paint (`8d6ffffe`), not caused by the fix round.
*main:* no such question. *Fix.* Call `reconcileMissionRoleOffer()` at the end of both paint effects (after
`refreshHistDots`). Test: the steps, week and board — the question's node still connected after the settle.

## 2. A — absences

- **A2 board wave title** — sound: a `<select>` fails `textField` (`schedule-tab.ts:29-31`).
- **A27 next-week peek** — sound: `peek.ts` draws read-only (no route attribute, no `data-move`), so the route, the
  caret-time redraw and `refreshWaveReports` all pass it by; the redraw indexes only the seven live days.
- **A30 OIL Earn on** — sound: `scopeOf` and `sameScope` both ask `oilModeOn`; the board is read-only there.
- **A31 History on / changes window / ALL AVAIL open** — sound for saving; `refreshHistDots` under the caret sets an
  attribute only. Whether a box under a floating window jerks 20% per arrival cannot be read — one look.
- **A19 as written (no window)** — sound: `setInpField` opens only the OIL question, through `INPEDIT`.
- **A33 admin's member view** — sound: `canEditSched()` is asked at `scopeOf`, `routeFocusOut` and `boardChange`.
- **B4 Quals / Logic / Admin / Help** — sound: the drawer's WEEK block is gone on every page alike.
- **D3 put-back clears its mark** — not settled: see §5.
- **Roll-call itself** — searched every emitter of the eight attributes: `html.ts`, `board.ts`, `board-html.ts` only.
  Insights doors: top bar, the two ⋯ menus, the board's button and ⋯. Nothing unlisted.

## 3. B — siblings

- **Redraw held while the caret is in text (W15, W16):** F1; and the red words under a wave's In-time / Rally lines
  (`[data-reporting-feedback]`) are refreshed only by typing in or leaving a LINE (`textedit.ts:51-61,166,183`) — a
  take-off or brief changed by Tab leaves them stale beside a correct warning list. Fix: rewrite them in
  `refreshWaveReports` from `reportingIssuesForWave`. Low.
- **A save opens a window / keys walk behind it (W12, RF2):** only the six sheets keep the keys. The request's own edit
  window, Insights, the document viewer and the template windows let the browser's Tab walk into the schedule behind
  them (the route stands down, the boxes still save on blur). Same on main; file low.
- **One spelling asked, another missed (W10, RF2):** `schedule-tab.ts:61` still excludes four attributes that exist
  nowhere (real: `#sbPrevDay,#sbNextDay,#sbCal`) — no reachable failure. `windowOverSchedule` against every flag in
  `pops.ts`: none missing that a text save can open.
- **Spacing is no change (W11):** searched every `txtSet` caller (`board.ts:1203,1664`, `store.ts:106`,
  `interactions.ts:856`, `textedit.ts:100`): none takes "unchanged" for a failure now; the board box quietly goes back
  to the stored words. In-time lines: Logic's words are trimmed at the setter — none.
- **Returns before it looks (W9, W14a):** W14 (a) only, parked.
- **Not-a-number / key that does not persist / wording:** searched the route, the two effects, `dayswap.ts`: none.

## 4. C — the fixes in my piece

- `dayswap.ts` — F1. The `HELD` mark and kept chunks are sound; no block is left owed for good.
- `EditWeek.tsx`, `SchedBoard.tsx` — sound for the caret. The sheet's "rings catch up when the caret leaves that
  section" is not exact: they catch up at the next SAVE after it leaves, or when it leaves text (nothing repaints on a
  plain move between sections). F3's missing call sits here.
- `schedule-tab.ts`, `pops.ts` — sound.
- `sheetfocus.ts` — sound; after the OIL question is answered the caret is on nothing (it was already off the box when
  the sheet opened), so his place in the run is lost. Low.
- `slots.ts` (W11) — sound for the route; a deliberate tidy of a doubled space is now silently refused. Harmless.
- `html.ts refreshWaveReports` — sound, text nodes only.

## 5. Not read, and how sure

Not read: `engine/drafts.ts` / `publish.ts` (whether a put-back to words whose PUBLISHED copy holds a doubled space
clears its mark, now that the writer folds); `wavetpl.ts` In-time text; stylesheets; main's native Tab timing; any
browser. F1: sure (the test pins the behaviour; only its consequence was missed). F2, F3: confident by reading — one
scripted run of each step list would settle them; a store tick I did not find on a plain blur would undo both.
