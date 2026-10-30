# Steadier tests — the hidden bar's seat and the failed-save warning's gaps (30 Oct 26)

The night of 30 Oct 26, job 3. **Tests only — nothing in the app changed.** Branch `claude/steady-tests-1030`. Backlog items
`[E2E-HIDE-BAR-SEAT]` and `[SAVE-NOTE-TEST-GAPS]` (the second from Astra's read of 6 Oct 26 —
`raptor-port/docs/superpowers/briefs/2026-10-06-owed-small-reads-astra.md` Part 3). Tier: NONE for the app (no app line
changed); the tests' own proof is each break below — a strengthened check shown red against a deliberate break of the
behaviour it guards, then green on the real app. `Walk: not needed — no change a person can see; the breaks are the proof.`

## 1. The phone test "Hide sends the panel to the bar…" (`e2e/changeswin.spec.ts`)

**Before.** Red on this PC every time, "nothing covers the dotted seat" (reproduced first, run alone). The test brought
Tuesday's changed seat into view with the browser's own scroll-if-needed, which leaves a seat already on screen where it is:
here at 780–795 of 844, under the hidden bar that starts at 780. GitHub's machines (other letters) had it off screen, so it
was centred and passed.

**Now.** The seat is brought into view the way the app brings it: Show ▴, then a press on the seat's own line in the list
— the app takes the schedule to the change and drops the panel to the bar (D167 (2)); measured once the glide is at rest
(the change's brief mark is waited for first). The check stays as it was (what a finger at the seat's middle lands on is the
seat), and one is added: the seat's whole box ends above the bar's top. The test runs twice: as before, and in letters about
a seventh wider (`letter-spacing:.075em` on the page — the stand-in `e2e/oilwait.spec.ts` uses for his iPhone's letters;
measured: the page grows 3953 → 4027 tall, so the stand-in really moves the layout).

**Measured:** the seat at rest at 414–429, the bar at 781–832, in both letter widths.

**Break.** The app's own reveal (`ui/highlights.ts bringIntoView`) made to leave the change at the foot of the screen
(`block:'end'` for `'center'`): the seat came to rest at 780–795 under the bar at 781 — both runs red, "nothing covers the
dotted seat". Put back; both green.

## 2. The failed-save warning (`e2e/save-note.spec.ts`)

### (1) A press on Retry, told apart from the automatic retry

**Before.** The proof that a press on Retry itself tried to save read the write counter one task later (a 0ms timer), so an
automatic retry already due could run first and pass for the press (Astra's concrete failure).

**Now.** The counter is read IN the press: once as the click is captured, again as it bubbles to the document — after the
button's own handler (React listens on the app's root, below the document) and before any timer can run. Every press on
Retry in the spec is measured this way (`pressRetry`).

**New test** (`a press on Retry is told apart from the automatic retry falling due at that moment`, at phone 390 by a finger
and desktop 1200 by a mouse, two variants each): the test notes when each automatic retry is due (a timer of a second or more
set straight after storage refused — the postman arming its backoff), presses Retry a quarter of a second before one is due,
and holds the press's own handling until past the deadline. With Retry's handler taken away (the one React reads at the
press): the reading in the press is 0, while the retry that was due has written straight after it (it re-armed). With the
handler as built: the reading in the press shows the press's own write.

**Measured on the way — the old way was not fooled in this browser.** With the old 0ms reading kept beside it, the retry that
was due at the press ran about 85 ms after the press's handling ended, after the 0ms timer: Chromium ran its immediate timer
before the overdue one. So Astra's failure does not happen in Chromium today; it depends on the order a browser runs due
timers, which the reading in the press no longer rests on. The check that would have shown the old reading fooled was
dropped for that reason, and the test asserts the retry really fell due and wrote instead.

**Break.** Retry's handler taken away in the app (`ui/SaveStatus.tsx`, its `onClick` emptied): 8 red — "Retry as built" at
both sizes, and "a real press reaches the search box … and Retry saves" at all six sizes ("the press on Retry made an attempt
to save, itself"); the two "handler taken away" variants stayed green, as they should. Put back.

### (2) A window he has worked with keeps its box

**Before.** Pinned for a MOVED changes window only.

**Now, new tests at the three desktop sizes (1200×800, 1366×700, 1440×900):**
- **a changes window he has RESIZED** by the browser's own corner (60 px narrower, pulled down to the screen's foot — taller
  than the warning's cap would allow, asserted), then the schedule redrawn behind it: it is marked placed, and its box is the
  same with the warning up and once it has gone;
- **an ALL AVAIL window he has moved and resized** (moved sideways, then 60 px wider and pulled down): the same;
- **over the board's preview bar** (a published day looked at as its original), for each window: **not placed**, it starts
  below the preview bar, every button of the bar is reachable and its foot is on screen — before the warning, with the warning
  up (the board's band pushes the preview bar down), and once it has gone; **then placed** (dragged over the day), it keeps
  its box through the warning coming and going.

The box tests let the warning go by the app's own retry once storage works again, not a press on Retry: a placed window may lie
over the warning (D587; and see the find below).

**Breaks, each put back:**

| Break (app line) | What it stands for | Result |
|---|---|---|
| `17-save-status.css`: the warning's lowered-and-capped rule without `:not([data-placed])` | the cap reaching a window he placed | 7 red: the resized changes window (all three sizes), the moved and resized ALL AVAIL window (all three), and the old moved-window test only at 1366 — the gap Astra named |
| `Shell.tsx`: the resize the band's arrival sends, removed | windows not told the warning came | 6 red: both windows, not placed, at all three sizes — "with the warning up: the window starts below the preview bar" |
| `floatwin.ts place()`: a placed window treated as unplaced while a preview bar shows | the preview bar moving a window he placed | 6 red: both windows, placed, at all three sizes — "the placed window over the preview, with the warning up" |

## 3. Found on the way — filed

**`[WIN-RESIZED-OVER-RETRY]`** (older; low; his look first). Where the top bar is two lines (1200 and 1366 on his PC) a window
only resized, never moved, keeps its top under the bar; when a save fails the bar grows under it and the window lies over the
warning's right end, "Not saved" and Retry. Measured: what lies at Retry's middle is the changes window at 1200 and 1366, Retry
at 1440 (a one-line bar). Picture: `img/2026-10-30-steady-tests/resized-window-over-retry-1200.png`.

## 4. The runs

Each changed spec run in full (the `raptor` project — the only one either runs in), three times in a row, under the check lock:
74 tests a run (`changeswin.spec.ts` 16, `save-note.spec.ts` 58) — run 1: 74 passed (48.2 s); run 2: 74 passed (48.2 s);
run 3: 74 passed (48.7 s); none flaky, none retried. The full check is GitHub's run of the pull request (D1086).

**His answer (30 Oct 26, "Q5 ok" — D1523):** a window he has resized but never moved moves down below the failed save's band, as a window not yet placed does; `[WIN-RESIZED-OVER-RETRY]` is to build.

## 5. His D1523 built — a window only resized moves below the "Not saved" band (30 Oct 26, the day after)

**The change:** a floating window's remembered box now says whether he MOVED it by its bar (`src/ui/floatwin.ts` — `moved`, set
by a real drag; a resize keeps what the box already said). A window only resized keeps the width and height he chose and its left
edge, but its top is worked out as an unplaced window's is: the stylesheet's corner, or 8px below the lowest bar it meets — the top
bar with a failed save's band, the board's bar, the board's preview bar. Where that lowers it, a cap holds its foot on the screen,
and the size-watcher never saves the capped height as his size. A window he moved keeps its place (D587).

**Tier: WALK** — §5: 4 a shared drawer, yes (every movable window — the changes window, ALL AVAIL, the other floating windows);
the rest no (nothing saved, no roles, no warnings; the box is session memory). **Sizing (§7.0):** the walk is the two-line top bar at
his PC's widths, 1366 × 700 and 1200 × 800, and 1440 × 900 (one line), at 1.25, with a real mouse: one window resized, one moved;
a phone keeps its bottom panel (untouched — the phone branch returns before the new rule).

**Red first:** `e2e/save-note.spec.ts` "a changes window he has only resized moves below the warning, leaves Retry pressable, and
is back at its size when it goes" replaced the night's "…resized keeps its place and size…" (D1523 changed what it pins): it failed
at 1200 and 1366 on the old code ("the warning is whole and on top": false), passed at 1440 — as measured that night. **Break test:**
the guard that keeps the cap from being saved as his size taken out — caught at 1200 and 1366 ("once the warning has gone: its place
and the size he chose"). **Gates on his PC, under the lock:** `save-note.spec.ts` 58/58; `availwin.spec.ts` + `changeswin.spec.ts`
34/34; every unit test that reads a window, 48 files, 1398/1398; the build the walk drove. The full check is GitHub's run (D1086).

**The walk** (`scripts/handpass/win-resized-retry-walk.mjs`; the failing save made as the browser test makes it — storage refusing,
a crew change through the one write path — the one thing no control can do; Retry pressed with the mouse at its middle):

| Size | Resized only | Moved |
|---|---|---|
| 1366 × 700 | at 112 → 148 under the band (36), width 320 kept, foot 688; Retry at its middle; back to 112 and 576 tall | kept its box through the band |
| 1200 × 800 | at 112 → 148, width 320 kept, foot 788; Retry pressed; back to 112 and 676 tall | kept its box |
| 1440 × 900 | at 96 (the band ends at 93) — not moved, Retry already clear; size kept | kept its box |

Every picture that decides a row opened by the host. **Walk:** `docs/handpass/2026-10-30-steady-tests.md` §5 · 12 pictures
(`docs/img/handpass/2026-10-30-steady-tests/d1523/`) · 2 surfaces (the changes window resized, moved) at 3 desktop sizes · 6 checks,
6 as expected · the ALL AVAIL window carried by the browser tests (the same body)
