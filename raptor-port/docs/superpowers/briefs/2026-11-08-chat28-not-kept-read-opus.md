# Chat 28 — the fresh, blind Opus read of the "Not kept" band (D1901) and the Tracker's magnifier (D1900)

Reader: a fresh Opus that did not write the code, blind to every other reader, the walk's evidence sheet, the walkers'
reports and the pictures. Read: commit `e67107e31` against base `535fdc94f`, `raptor-port/src` only, with each changed
file's callers and neighbours at the same commit (the working tree's `raptor-port/src` was checked identical to the
commit). Held to: the brief, the design page's "Saving — the Not saved band" rulings, the full rows of D1901, D1900,
D1666, D1664, D1657, D1655, D1127, D587, the Tracker's seams page. Ran read-only: the four changed test files (38 of 38
pass) and one proof test of my own in the scratchpad (below). No file in the repo changed but this one.

## Verdict

No finding of medium or high severity. The band is wired the same way the "Not saved" band is everywhere that band is
drawn, and the store chosen is unchanged in every case. Two low findings: the `?nostore` switch still touches the
browser's storage (its comment says it touches none), and the room made for "Not kept" is guarded by no test.

## What I checked and found sound

- **The flag (brief item 2).** `refused` is reset at the top of every `chooseBackend` call and is set only in the
  `?nostore` branch and in the `catch` (the browser refusing storage: a `SecurityError` on reaching `localStorage`, or
  `localStorage` being `null`, so reading `.length` throws). It stays false for `?fresh=1`, the test mode,
  `VITE_STORAGE=memory` and the dev server, because each returns before the `try`. A storage that throws only on write
  (a full disk, an old Safari private window) gets the browser store as before, so its saves fail and the "Not saved"
  band shows, not "Not kept" — as the brief asks. `?nostorex` is not the switch (the `(=[^&]*)?(&|$)` tail).
  `?savefail&nostore` → `?savefail` wins (checked first): no band from the flag, which is reasonable. Store chosen:
  identical to the base in every case except the new `?nostore` branch (the memory store).
- **Order against a failed save.** `readBand` puts 'failed' first. When a failed save lands, the band goes from
  'failed' to 'nokeep' and the room stays the same: Shell's band count stays 1, so no false resize event, and
  `useFollowTheBar` re-runs on the change. The memory store never fails outside tests, as the head comment says.
- **The room (brief item 1).** Every place that made room for a failed save now asks `useBandUp`: the top bar and
  `#shell` (Shell — also the default spots of the changes and ALL AVAIL windows, the week's arrows and the CREW tab,
  all keyed on `.save-failed`), the guest bar, the sign-in and the three access screens (`.band-up`). Every full-screen
  surface that draws `SaveBand` — the Scheduler Board, both of the Leave War OIL tracker's places, the Medical view
  opened full — gets "Not kept" through `useBand` with no change at the caller. No CSS anywhere else selects
  `.savestat.failed` or `.save-failed`, so no rule was missed: the four band rules in `17-save-status.css` all carry
  `.nokeep`. The band is up from the first paint (`setStorageKept` runs before `render`), so whatever measures the bar
  on mount measures it with the band. One line always (`white-space:nowrap`, fixed height; the words are cut with "…"
  at worst, never wrapped). On the wide phone board the sticky rules need no button.
- **The access screen's pass (D1664)** still reads `useSaveFailed`, so "Not sent yet" shows only for a failed save.
- **The Tracker's corner (brief item 3).** `saveWords` drops 'ok' and 'saving' words while the browser keeps nothing;
  an error still shows; in a browser that keeps, nothing changes (`kept` defaults to true). The same rule hides
  confirmations such as "3 events deleted — Undo restores them" — this matches D1901's "shows nothing while it is up",
  and the failed-save path already does the same.
- **The Tracker's seams.** No new crossing: `main.tsx` already imported the storage doorway `tracker/storage.js` (for
  `setSaveHealth`), and the new setter sits on that same doorway. `core.js` is not pulled into the first load. The
  Tracker's components already imported `ui/icons`, so the lazy chunk gains nothing.
- **The magnifier (brief item 4).** `SrchGlyph` is now `<SrchIcon className="srchglyph" />`: the same `viewBox`,
  stroke, caps, element order and class as the deleted drawing — only the handle's path differs (`m20 20-3.5-3.5` →
  `m21 21-4.3-4.3`). It is still sized by `.srchglyph` (15px), so the box, its padding and its colour are unchanged. Every
  other `SrchIcon` caller passes no class and keeps `btnglyph`. Nothing still imports the deleted file.

## Findings, by severity

### F1 — low: `?nostore` still reads and writes the browser's real storage; its comment says it touches none

- **The failure.** The brief promises that `?nostore` "must touch storage not at all", and the code says "Nothing is
  read or written". Two things break that:
  1. `chooseBackend` reads `localStorage.length` (`void store.length`) *before* it tests for `?nostore`.
  2. More important for the test's purpose: the app's view preferences go straight to `localStorage`, outside the
     backend, so under `?nostore` they still read and write the real storage. These are the Tracker's last course,
     last chart, last student and hidden-bar choice (`core.js` `prefGet` / `prefSet`), the Leave War's approve and
     counts toggles (`bidhelpers.ts`, `BidBits.tsx`, `Matrix.tsx`), the board's side width (`board.ts`) and the
     Inputs calendar's expanded state (`InputsCal.tsx`). So a `?nostore` tab is not quite a browser that refuses
     storage: after a reload it still reopens on the last Tracker course, where a refusing browser would not. And it
     writes into his iPhone's real storage. This is minor — it is a test switch, these are view choices, and `?fresh=1`
     has always leaked the same way — but the promise and the comment are untrue.
- **Proof** — a failing test, in the scratchpad at
  `C:\Users\User\AppData\Local\Temp\claude\f4202d016722bdbc\604f85bd-4fb7-4805-92a8-2a269b3d5a15\scratchpad\opus28\nostore-touch.test.ts`.
  It fails with "expected 1 to be +0" (run with `npx vitest run --root <that folder> nostore-touch` from `raptor-port`):
  ```ts
  let touched = 0
  const watched = { get length() { touched++; return 0 }, key: () => { touched++; return null },
    getItem: () => { touched++; return null }, setItem: () => { touched++ }, removeItem: () => { touched++ },
    clear: () => { touched++ } } as unknown as Storage
  expect(chooseBackend({ MODE: 'production', DEV: false }, '?nostore', watched)).toBeInstanceOf(MemoryBackend)
  expect(storageRefused()).toBe(true)
  expect(touched).toBe(0)   // 1: the length read
  ```
  The repo's own test has a `watched` fake that counts only `getItem` and `setItem`, so it cannot see this.
- **The fix.** (a) Test for `?nostore` before `const store = ls ?? localStorage` — first thing in the `try`, or just
  above it, after the dev-server line — and count `length` and `key` in the repo test's `watched` fake. (b) Reword the
  comment to what is true: "none of the app's records is read or written; the view choices kept on this computer still
  are, as under `?fresh=1`". If the switch should keep those away from storage too, that is a wider change (one place
  for the view choices to ask), which I would file rather than fold in.

### F2 — low (a test gap): nothing guards the room made for "Not kept", or the pass staying "Waiting" under it

- **The failure.** The four callers changed from `useSaveFailed` to `useBandUp` (Shell, the guest page, the sign-in,
  the access screens) are what moves each page down under "Not kept". Change any one back and every unit test still
  passes: the band would then lie over the page's first line, a pinned row, or a sign-in card's head.
  `accounts-ui.test.tsx` pins `.band-up` / `.save-failed` for a *failed* save only. `SaveStatus.test.tsx` tests the
  hook itself, not its callers. `e2e/save-note.spec.ts` measures the failed band's geometry and has no "Not kept" case.
  Two more are untested: D1664's half for this band (the access pass must not read "Not sent yet" for "Not kept"), and
  the band going back from "Not saved" to "Not kept" after a Retry lands.
- **The fix** — tests that would fail if a caller were reverted, beside the existing ones in `accounts-ui.test.tsx`
  (they use its own `signInAs`, `$`, `setGuestView` helpers), with `setStorageKept(false)` in place of `fail()` and
  `setStorageKept(true)` after:
  - the sign-in: `.saveband.is-screen` reads "Not kept — this browser loses your work on a reload", and
    `#login.band-up` is true;
  - the access request and waiting screens: `.band-up` true, and `#accessWaiting .pass-state` reads
    "Waiting for an admin" (not "Not sent yet"), without the `unsent` class;
  - the guest page: `#guestApp .topbar.guestbar` has `save-failed`, and holds `.savestat.nokeep` with no button;
  - one Shell case: `.topbar` and `#shell` carry `save-failed` while it is up;
  - and in `SaveStatus.test.tsx`, after the "failed speaks first" step: `be.failNext(0)`, retry, and
    `.savestat.nokeep` is back with the room still up.
  An e2e case beside `save-note.spec.ts`, opened with `?nostore` on the built preview, would pin the geometry the way the
  failed band's is pinned (the page's first line under the band, not behind it, at a phone's and a desktop's width).

Not findings (checked and set aside): on a phone narrower than his iPhone the band's words end in "…" — they never wrap
or grow the band, and D1901's row says they were measured to fit at his iPhone's width. Nothing here touches stored
data (D56), and no case needs a scheduler who is not an admin (D785).

## Tidiness note (filed, not fixed — never the rules engine)

1. **Is anything left that only a standalone Tracker needed?**
   - `tracker/storage.js` `setStorageKept(k) { kept = k !== false }`, and its "With none, the records are kept, as
     before": this defends against a caller that passes nothing. Inside Raptor `main.tsx` always passes a boolean, so a
     plain `kept = k` says it.
   - `tracker.css`'s reworded line "the copy that stood here kept a standalone Tracker's date boxes dark" now describes
     a line that is gone; the comment could go with it.
   - The Tracker still draws its own Export and Import marks (`Glyphs.jsx`). That is already filed as
     [TRK-COPIES-TIDY] (4).
2. **Is anything duplicated that one source could carry?**
   - Two "does this browser keep anything" flags, one in `ui/savestatus-source.ts` and one in `tracker/storage.js`, both
     set from the one answer in `main.tsx`. This follows the doorway pattern `setSaveHealth` already uses, so it is
     defensible — but it is two copies of one fact.
   - `.savestat.failed, .savestat.nokeep` is written out as a pair in four rules of `17-save-status.css`. One class on
     the element for "a band" — say `is-band`, beside `failed` or `nokeep` — would carry all four.
   - The test-switch pattern `/[?&]name(=[^&]*)?(&|$)/` is now written twice (`savefail`, `nostore`). One small helper
     would carry both.
3. **Is any comment now untrue?**
   - `storage/boot.ts`, the `?nostore` comment: "Nothing is read or written" (F1).
   - `ui/pen.ts`, the line edited in this commit: "sized by `.pen-ic` (02-shell.css) — the Tracker's sizes by its own
     `.trkglyph.trkpen`: 1.05em, a small gap…". It now reads as if the Tracker's pencil were 1.05em. It is not: no rule
     selects `.trkpen`, and the Tracker's pencil is sized by `.trkglyph`, 15px (11px or 13px in a few places), in
     `tracker.css`. The 1.05em and the gap are `.pen-ic`'s.
   - `ui/Shell.tsx`: the variable `saveFailed` now holds "a band is up". The comment explains it, but the name misleads;
     `bandUp`, as the guest page and the sign-in now use, would match.
   - `ui/SaveStatus.tsx`'s head comment still opens with "the top bar grows by one line while a save has failed
     (`.topbar.save-failed`, set by Shell from `useBandUp`)". `useFollowTheBar`'s comment names only "the failed-save
     band", and the big comment at the head of `17-save-status.css` says the same. Each is true for "Not saved", with
     "Not kept" added in a later paragraph — a reader has to put the two together.
