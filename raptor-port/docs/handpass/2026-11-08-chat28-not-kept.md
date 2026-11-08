# Bug check — the "Not kept" band (D1901) and the Tracker's magnifier (D1900), chat 28, 8 Nov 26

Branch `claude/chat28-not-kept`, pull request 706. Pictures: `docs/img/handpass/2026-11-08-chat28-not-kept/`.

## The eight answers and the tier

1. Money — NO: nothing of OIL or presence is read or written; the band reads one flag the boot sets.
2. The published record — NO: no publish, sign or amendment path is touched.
3. Saved data — NO: the backend chosen is the same in every case as before (memory where storage is refused); only a
   flag beside the choice is new, and `?nostore` picks the memory store the refused case already used. Nothing stored,
   nothing read back differently.
4. A shared drawer — YES: the save-status drawer (`SaveStatus`, `SaveBand`) draws the band in every page's top bar and on
   every full-screen surface and bar-less screen.
5. A new gesture or mode — YES: the `?nostore` test switch is a new way the app runs.
6. A new surface — YES: a new kind of band, and the Tracker's corner gains a blank state.
7. Roles — NO: the band shows alike for every role; nothing decides who may do what.
8. The warning list — NO: the day's issues are untouched.

**Tier: WALK** (YES to 4, 5, 6 only).

## The roll-call — the "Not kept" band (and the Tracker corner beside it)

Thing: the band a browser that keeps nothing shows. Drawers: `ui/SaveStatus.tsx` `SaveStatus` (in a top bar) and `SaveBand`
(in the flow of a full-screen surface, or across a screen with no bar); the room under the bar: `.topbar.save-failed`
(Shell, GuestApp), `#shell.save-failed` (the movable windows), `.login.band-up` (sign-in, access).

| # | Place | SHOWS the band | USABLE (nothing to press; the page under it reachable) | What else is PAINTED there | Proved by |
|---|---|---|---|---|---|
| 1 | Edit Schedule's top bar | has it — 36 tall, one line, full width, foot on the bar's last line, the line amber | the first row below it; scrolled, it stays and nothing shows through | the bar; no "Saving…" | route; W1 2 (and at 1.25); W2 2; the drawing check |
| 2 | View-only Sched's top bar | has it | first control below; scrolls clean | the bar | W1 2; W2 2 |
| 3 | Inputs (list and calendar) | has it | the heading below | the bar | W1 2; W2 2 |
| 4 | Quals | has it | first button below; scrolls clean | the bar | W1 2; W2 2 |
| 5 | Logic | has it | filter button below; scrolls clean | the bar | W1 2; W2 2 |
| 6 | Leave War (its pinned dates row) | has it | the year picker and the dates row below; scrolls clean | the bar | W1 2 (and at 1.25); W2 2 |
| 7 | Tracker's top bar | has it | the Tracker's own bar below | the corner empty | route; W1 2; W2 2 |
| 8 | Help | has it | the heading below | the bar | W1 2; W2 2 |
| 9 | Admin | has it | below | the bar | W1 2; W2 2 |
| 10 | Scheduler Board (its own bar, `SaveBand active`) | has it, in the board's bar | first row below; ✓ Done back to Edit Schedule, the band in its bar again | — | W1 3; W2 |
| 11 | OIL tracker (both of its bars) | has it, under its bar, inside the screen's own 8px margin — where its "Not saved" band has always stood (the one drawer) | the Show row below | — | W1 4; W2 4 |
| 12 | Medical view, full screen | has it | the document below | — | W1 5; W2 |
| 13 | Sign-in screen | has it, across the top (`is-screen`) | the card wholly below | — | route; W1 1; W2 1 (and with wide letters) |
| 14 | Access screen ("Waiting for an admin" since D1650 — the brief's older words) — its pass must NOT read "Not sent yet" (D1664: failed saves only) | has it | the screen below; the pass in its ordinary words, no "Not sent yet" | — | W1 8; W2 8 (and with wide letters) |
| 15 | Guest page | has it | below its bar | its bar keeps the room class `.save-failed` — the room's name, for either band | W1 9; W2 9 |
| 16 | Changes window and ALL AVAIL window, not yet moved — open below the band | has it | each window's head below the band; a moved window keeps no place on reopen — the same in a plain browser, older and unruled | — | W1 6 (ALL AVAIL not opened — NOTRUN); W2 6 (both) |
| 17 | An input's own window and the question boxes (cover the bar, D1645) | must not cover | phone: the window covers the bar and the band, as D1645 says; desktop: the floating window opens below the band and the bar stays pressable — as before this change (D1645's bar part still open, [VEILED-WINDOWS-BAR]) | the question box hangs from the window's ✕ | W1 7; W2 7 |
| 18 | Phone side menu open with the band up | covered by the menu, as the page is | the menu whole; nothing shows through | — | W2 |
| 19 | The Tracker's corner (`#saveStat`) — no "saved", no "saving"; an error still said | must not, because the band says it | empty after a mark and an Undo | — | route; W1 10; W2 10; the corner's test |
| 20 | "Saving…" — never beside the band | must not | none seen | — | route; W1; W2; the band's test |
| 21 | A failed save in a browser that keeps nothing — "Not saved" with Retry wins | must not show "Not kept" | `?nostore&savefail`: "Not saved · Retry" alone, from the sign-in on (the sign-in's own write is refused) | — | W1 13; W2 13; the band's test |
| 22 | `?fresh=1`, a normal browser — no band; the Tracker corner says "saved" as before | must not | no band; corner "● saved" | — | route; W1 12; W2 12 |

## The door check (the `?nostore` switch)

| Action | Control | Result |
|---|---|---|
| Open `/?nostore` in a browser that keeps | the address | the band at sign-in, signed in, and after a reload (W1 11, W2 11) |
| `/?nostore=1`, `/?a=1&nostore` | the address | the band (W1, W2) |
| `/?nostorex` | the address | no band — a longer word is not the switch (W1, W2; the boot's test) |
| `/` and `/?fresh=1` | the address | no band (route, W1, W2) |
| `/?nostore&savefail` | the address | "Not saved · Retry" wins (W1, W2) |

## The five sizing lines (§7.0)

1. **Type:** D (one band drawn by two drawers into eight kinds of place, each with its own room under it — the bar, the
   movable windows, the board's bar, the OIL tracker's bars, the sign-in, access and guest screens), E (the page moves
   down by the band), B (a new band, the Tracker corner's new blank state), C (the `?nostore` switch).
2. **Only a walk could find:** a place whose room under the bar never opens for the new band (it was keyed to a failed
   save before), so the band covers the page's first line or a window's head; a page whose pinned row (the Leave War's
   dates, the week's arrows, the roster rail) sits at the old height; the band clipped or two lines tall on an iPhone's
   wider letters; the Tracker corner still saying "saved" beside it; the access pass wrongly saying "Not sent yet"; a
   "Saving…" note beside it; the band where storage works. The unit tests prove the words, the class, the order of the two
   bands and the boot's flag; none proves any page's geometry or the real storage-refusing browser's boot.
3. **The ledger says:** the failed-save band's own walk (5 Oct 26, D, E, B) found 2 in the change — the board hid the
   warning, the note kept a stale place after a page change — with an Opus host and three scripts at six sizes; type D
   walks have found a fault in every one of 10.
4. **The walk chosen:** two Sonnet walkers in parallel on one served build, each its own browser world, both in a browser
   whose storage throws on touch (chat 20's `LOCK_INIT`) and once by `?nostore`: **W1** his PC (1536 × 864, Chromium,
   and once at the 1.25 scale his display runs at), **W2** his iPhone (402 × 874, WebKit, touch; a picture right after each
   tap; once with letters a seventh wider). Each walks rows 1–22 of the roll-call on its size, the plain-user round
   (§7.0a), the switch's door check, and the magnifier. The host runs the drawing check against chat 20's approved
   pictures and opens every deciding picture. Carried by tests: the words, the order of the two bands, the flag for each
   way the boot picks memory, the corner's blank for "saved" and "saving" (section "Cases carried by a test").
5. **After the walk:** its row is added to `docs/walk-ledger.md`.

## The lessons of §7.11, each with its cover

The brief's scenarios checked against the list (23 lessons) before the walkers started; those that bear on a band drawn
under every bar:
- **1, one state only:** the band is walked in five states — storage refused (`LOCK_INIT`), `?nostore`, a failed save
  beside it (`?nostore&savefail`), a plain browser and `?fresh=1` (scenarios 11–13, the route check).
- **5, a box never checked against what stands over it:** every window's head and every page's first row measured against
  the band's foot (scenarios 2–7, 16); the input window and question boxes recorded as covering the bar (D1645).
- **6 and 21, what only the real phone draws:** W2 in WebKit with letters a seventh wider; the band's one line on his
  own iPhone is his look, by `?nostore` on the preview link — the test browser cannot stand in for it.
- **10, a way back walked one way only:** the board left by ✓ Done back to Edit Schedule (scenario 3); the access screen
  reached by signing out (scenario 8).
- **15, a pinned bar judged by where it sits:** every page scrolled under the band, its edges looked at for what shows
  through (scenario 2); the phone side menu open over it (W2).
- **19, a window over a window never closed:** the plain-user round closes every window by each of its ways (scenario 14).
- **22, "shown" judged by being there:** every band step is a picture the walker opens, not a selector found.

## Orders walked

## Cases carried by a test

Unit tests, green on his PC before the walk (7 files, 146 tests):
- **The boot's flag** (`storage/boot.test.ts`): set only where storage was refused or under `?nostore`; never for
  `?fresh=1` or the test modes that pick memory on purpose; `?nostore` reads and writes nothing in storage; a longer word
  (`?nostorex`) is not the switch.
- **The band** (`ui/SaveStatus.test.tsx`): no band in a browser that keeps; in the bar and under a full-screen surface its
  words "Not kept — this browser loses your work on a reload", "Not kept" in bold, the sign hidden from screen readers,
  no Retry, never the failed-save class; one band only; a failed save wins over it ("Not saved" with its class); the room
  under the bar made; "Saving…" never beside it.
- **The Tracker corner** (`tracker/trk-batch-store.test.ts`, `tracker/storage.test.ts`): "saved" and "saving" step aside
  while the browser keeps nothing, an error still said, and back in a browser that keeps; the app hands the Tracker the
  flag after the boot chose its store.

The route check `scripts/handpass/nk28-route.mjs` (the host, on the served build, 30 of 30): the sign-in band; Edit
Schedule's band, its words and its foot on the bar's last line; no "Saving…"; the Tracker corner blank and the band on the
Tracker — storage refused on his PC and his iPhone (WebKit), and `?nostore` on his PC; no band, and the corner "saved",
in a plain browser and at `?fresh=1`. Its first run failed 3 checks on its own expected words (it left out the hidden
screen-reader dash between the two halves, which the "Not saved" band has too); corrected, 30 of 30.

## The drawing check

**GREEN** (an Opus helper; the host read the report and opened the pictures). Part list
`scripts/drawcheck/specs/not-kept-band.mjs` — the bar, the band, its sign, "Not kept", "this browser loses your work on a
reload" — against chat 20's approved option A (`q2-d-es-A.png` desktop 1536 Chromium, `q2-p-es-A.png` his iPhone 402
WebKit), the drawing's band `.savestat.failed` with its words swapped, the build's `.savestat.nokeep`. Recorded by
replaying chat 20's own script on a build of `fb5d18c21` (a scratch checkout, so chat 20's pictures here stayed untouched):
both replays drew the approved pictures pixel for pixel, every part found. The check of this branch's build: every part
matches on both screens within 2px — 0 unexplained, 0 kept, 0 not checked; no button in the band (the reach fails if one
shows). Records: `docs/mock/2026-11-08-not-kept-band/drawcheck/`; report and build pictures:
`docs/img/handpass/2026-11-08-chat28-not-kept/drawcheck/`.

## The magnifier, before and after

Script `scripts/handpass/nk28-mag.mjs`, once on the `fb5d18c21` build (before) and once on this branch's (after), close-ups
at 4×, pictures in `docs/img/handpass/2026-11-08-chat28-not-kept/magnifier/`. Measured from the drawing (every icon 15px,
its ring 7, its line 2px): the Tracker's handle before was 3.1px long on screen (the desktop Find box, the phone's Find
button and its Find strip alike); after, 3.8px — the same as Edit Schedule's search box on the desktop and the phone
(D1127). Nothing else of the icon or its place in the box moved (the host opened `d-trk-icon-before/after`, `d-es-icon`,
`p-trk-box-after`); the phone page was not zoomed with Find open; no page errors.

## Break tests

- The room under the band on the sign-in (`ui/Login.tsx`) put back to no room: the new "Not kept" test and the old
  failed-save test both fail; restored, all pass.
- The boot's `?nostore` check left after the store is touched: the strengthened boot test fails on `?nostore&savefail`
  (it chose the browser's store) — the red run before the fix.

## The code reads (blind to each other, at commit `e67107e31`)

- **Astra** (`docs/superpowers/briefs/2026-11-08-chat28-not-kept-read-astra.md`): P2 — `?nostore` beside `?savefail` chose
  the browser's store and let start-up writes through, and `?nostore` alone read the store's length; P3 — `?nostore` still
  reads and writes the few per-browser view choices (the Tracker's hidden bar, a panel's width). Tidiness: the pencil
  comment.
- **The fresh Opus reader** (`…-read-opus.md`): F1 low — the same as Astra's P2 and P3; F2 low — nothing guarded the room
  made for "Not kept" on the sign-in, access, guest and app screens. Tidiness: three points (below).
- **Dispositions (the host reproduced each first):** P2/F1 FIXED red-first — the switch is checked before the store is
  touched and wins over `?savefail` (`storage/boot.ts`; the boot test now counts the length read and covers both
  orders). P3 NARROWED, not widened: the switch replaces the store of records; the view choices still use the browser's
  storage, as they fall back quietly where storage is truly refused — its note now says exactly that (widening it would
  reach four areas for a test switch). F2 FIXED — three "Not kept" cases in `ui/accounts-ui.test.tsx` (the sign-in, the
  access screens with the pass's ordinary words, the guest page and the app's bar), break-tested. The pencil comment
  corrected. **Re-walked:** a fresh build, the route check 30/30, and `scripts/handpass/nk28-both.mjs` —
  `?nostore&savefail` shows "Not kept", no "Not saved", no record in the browser's storage.
- **Tidiness, filed not fixed (D489):** two "keeps nothing" flags set from one answer (the band's and the Tracker's); the
  failed / not-kept class pair written out in four style rules; the test switches' address pattern written twice;
  Shell's `saveFailed` now means "a band is up"; three head comments describe only the failed band; the Tracker's new
  setter guards a call with no value — with [TRK-COPIES-TIDY].

## Errors seen

None: no page error, console error or failed request in any run — the route check, W1, W2, the drawing check, the
magnifier.

## What was NOT walked, and why

- **His own iPhone:** the band's one line and its look on his device is his look, by `?nostore` on the preview link — the
  test browser's WebKit with wider letters stood in for it (lesson 21).
- **W1's plain-user round** was shortened (windows opened and closed, the bell, the viewer); W2 ran it whole (an input
  filed and found, a Tracker mark and its Undo).
- **The Tracker for the page's drop (16):** its chart is drawn behind the loading claw; its band and bar were measured
  in scenario 2 instead.
- **A storage that refuses only writes (a full disk):** that is the failed save's case ("Not saved"), walked many times
  since 5 Oct; here only `?nostore&savefail` beside it.

## The gates

## What the walk found, and each disposition

The walkers (Sonnet): **W1** his PC 1536 Chromium — 51 PASS, 2 FAIL, 1 NOTRUN, no page errors (report
`docs/handpass/parts/chat28/w1.md`); **W2** his iPhone 402 WebKit, touch — 66 PASS, 2 FAIL, 0 NOTRUN, no page errors
(`parts/chat28/w2.md`, 154 pictures). **Nothing found in the change.** Each FAIL and each note, as the host judged it
(the host opened the deciding pictures and reproduced the one filed):
- **A moved changes window does not keep its place when closed and reopened** (W1 6, W2 6): the same in a plain browser
  (W1's control, W2's), so older than this change; no ruling says it should — the brief's expectation was the host's own.
  Not filed.
- **Escape does not close the changes window** (W2 14; W1's note): reproduced by the host in a plain browser
  (`scripts/handpass/nk28-esc.mjs` — open, Escape, still open; a click inside, Escape, still open); its ✕ and a tap
  outside close it. Older; filed, [CHGWIN-ESCAPE].
- **W1 16 FAIL:** the walker's own selector found no day column; what it did measure — the week's bar and the Inputs page's
  first control — sat exactly 36 lower, left edges equal. W2 16 measured 8 pages, each exactly 36 lower. Not a fault.
- **W1 6 ALL AVAIL NOTRUN:** W2 opened it, its head below the band.
- **The desktop input window does not cover the bar** (W1 note): D1645's bar part is still open ([VEILED-WINDOWS-BAR]);
  the window opens below the band, as it opened below the bar before. Not of this change.
- **The OIL tracker's band is inset 8px each side** (W2 note): the one drawer's place there since the "Not saved" band.
- **The Tracker's Find button's magnifier is white, Edit Schedule's search box's grey** (W2 note): the button's own
  colour, white before this change too (`magnifier/p-btn-before.png`); the drawing is the same.
- **"Sync / slow" in the phone's side menu on the Help page** (W2 note): the sync pill's words in the menu; nothing of
  this change.
- W2's "right after the tap" pictures came 93–884 ms after the press (the picture itself takes time); none showed a tint,
  a see-through cell or a shifted box.
