# Walkers' brief — the "Not kept" band (D1901), chat 28, 8 Nov 26

You walk the running app, by a scripted real browser, and report what you SEE. You never read code to find bugs and never
decide a finding is real — the host does. **Read `raptor-port/docs/walk-scripts.md` first, whole** (how a walk script,
its steps and its pictures are written, and the traps each has cost).

## What changed

In a browser that refuses to store anything, every page shows a band under the top bar: a drawn warning sign, **Not kept**
in bold amber, "this browser loses your work on a reload" quieter, **no Retry button**, in the look of the "Not saved"
band. The page moves down under it so nothing is covered. The Tracker's own corner ("● saved") shows nothing while it is
up. The address switch `?nostore` makes any browser behave so (for his iPhone). A failed save ("Not saved · Retry")
still wins over it. A plain browser, and `?fresh=1`, show no band.

## Your world

- **The build:** `WALK_DIR=<the host gives it>`; it is answered inside the browser by `scripts/handpass/isr-serve.mjs`
  `serveFrozen` at `HP_URL=http://localhost:44xx` (the host gives your port; no server is started). Never build.
- **The recipe:** `scripts/handpass/nk28-route.mjs` — it passed on this build; copy its `world()` (the storage-refusing
  init script `LOCK_INIT`, the clock, the error listeners) and its `vis()`. Sign in with `L.login(page, 'a')` (admin
  `ad`/`a`); the member is `us`/`us`. Pages: `window.go('<page>')` is allowed only to REACH a page; every control the
  scenario is about is pressed on screen (a tap on the phone, a click on the desktop).
- **Your script:** `scripts/handpass/nk28-<you>.mjs`, written with the file tool, run from the file, a version line printed
  first; never edit and run in one step. Pictures to `docs/img/handpass/2026-11-08-chat28-not-kept/<you>/`; your report
  to `docs/handpass/parts/chat28/<you>.md`. Stop every browser you started before you report, and report ONCE.
- **Stop and report** after three failed tries at one gesture, naming it NOTRUN with what you saw.

## Known traps

- `LOCK_INIT` makes READING `localStorage` throw — your own script must not touch `localStorage` in that world.
- The band in a top bar is `.topbar > .savestat.nokeep`; on the board, the OIL tracker and the medical view
  `.saveband`; on the sign-in and access screens `.saveband.is-screen`. The failed-save band is `.savestat.failed`.
- The Tracker's corner is `#saveStat`. The lib's `navTracker` waits for the chart's balls.
- A picture is looked at by you before its step counts (open it).

## The scenarios — each step PASS / FAIL with its EXPECTED line, or NOTRUN with why

Every scenario runs in the storage-refusing world unless it says otherwise. "Not covered" means: the first thing of the
page (its first row, card, heading or button) has its top at or below the band's bottom; measure it.

1. **Sign-in screen.** EXPECTED: the band across the top, its words exactly "Not kept" and "this browser loses your work on
   a reload", no button; the sign-in card wholly below it; one line.
2. **Every page's bar** — Edit Schedule, View-only Sched, Inputs (list and calendar), Quals, Logic, Leave War, Tracker,
   Help, Admin, each reached from its tab on screen. EXPECTED on each: the band on the bar's last line, the bar's full
   width, one line, its line amber (the bar's cyan edge gone); not covered; scroll the page down: the band stays with the
   bar and nothing of the page shows through it or at its edges; the Leave War's pinned dates row and the week's arrows
   sit below the band.
3. **The Scheduler Board**, opened from Edit Schedule. EXPECTED: the band in the board's own bar, the board's first row not
   covered; ✓ Done back to Edit Schedule, the band in the bar again.
4. **The OIL tracker**, opened from the Leave War. EXPECTED: the band under its bar, not covered.
5. **The medical view full screen** (an input with a document, from Inputs). EXPECTED: the band under its bar. If no
   seeded input has a document, add one through the input's own window (a small image) — or NOTRUN with what you tried.
6. **The changes window and the ALL AVAIL window**, opened and not moved. EXPECTED: each window's head below the band;
   the band not covered. Move one and reopen: it keeps the place you gave it.
7. **An input's own window, and a question box.** EXPECTED: as without the band — the window covers the bar (D1645);
   record exactly what you see at the top.
8. **Sign out → an unknown sign-in** (e.g. `zz` / `zz`) → Request access, filled and sent → the screen "Your request is
   with the admins". EXPECTED: the band across the top, the screen below it; the pass in its ordinary look and words —
   it must NOT read "Not sent yet" (that is for a failed save only).
9. **The guest page:** as admin, Admin → Users, switch on the guest view; then the waiting newcomer → "View the
   schedule". EXPECTED: the band under the guest page's bar, not covered.
10. **The Tracker's corner:** mark a ball. EXPECTED: the corner shows nothing (no "saved", no "saving"), the band up.
11. **The switch:** a plain browser (no init script) opened at `/?nostore`, then `/?nostore=1`, `/?a=1&nostore`, and
    reloaded. EXPECTED: the band each time, after the reload too. `/?nostorex`: EXPECTED no band.
12. **Where storage works:** a plain browser at `/` and at `/?fresh=1`. EXPECTED: no band anywhere; the Tracker corner
    says "saved" after a mark (plain `/`).
13. **A failed save beside it:** a plain browser at `/?nostore&savefail`, change something on Edit Schedule. EXPECTED:
    "Not saved · Retry" shows — record whether "Not kept" shows before the change and what replaces it after.
14. **The plain-user round** (the order's §7.0a): in the storage-refusing world, as a user would — file an input on the
    Inputs page and find it on the schedule; change a time on Edit Schedule, then Undo and Redo from the top bar; open and
    close every window you meet by each of its ways (✕, Close, Escape, a tap outside); mark a Tracker ball and undo it;
    open the bell. EXPECTED: everything works as in a plain browser; the band stays put throughout; no page error.
15. **The magnifier:** the Tracker's Find box (the phone's Find button) beside Edit Schedule's search box, close-ups at
    4× pixels. EXPECTED: the same magnifier — its handle as long as Edit Schedule's at the same size.
16. **The page moves down by the band:** the same page in the plain world and the refusing world. EXPECTED: the first
    row lower by the band's height exactly, nothing else moved.

## Your size

- **W1 — his PC:** 1536 × 864, Chromium, mouse; scenarios 1–16; then scenario 2 (Edit Schedule and the Leave War only)
  once more at his display's 1.25 scale (`deviceScaleFactor: 1.25`).
- **W2 — his iPhone:** 402 × 874, WebKit, touch (`hasTouch`, `isMobile`); scenarios 1–16, plus the phone side menu (☰)
  opened with the band up (EXPECTED: menu and band both whole, nothing behind shows through); **a picture within about
  100 ms of every tap, the finger left where it pressed, beside the settled one** — name any tint, see-through cell or
  shifted box only the pressed one shows; then scenarios 1, 2 (Edit Schedule, Tracker) and 8 once more with letters a
  seventh wider (the lib's `wide` init script): EXPECTED one line, both phrases whole, not cut with "…".

## The report

A table, one row a step: scenario, step, PASS / FAIL / NOTRUN, what the screen showed (measured numbers), the pictures.
Then: every page error seen; what you could not reach and why; anything that looked wrong that no step asked about.
