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
| 1 | Edit Schedule's top bar | | | | |
| 2 | View-only Sched's top bar | | | | |
| 3 | Inputs (list and calendar) | | | | |
| 4 | Quals | | | | |
| 5 | Logic | | | | |
| 6 | Leave War (its pinned dates row) | | | | |
| 7 | Tracker's top bar | | | | |
| 8 | Help | | | | |
| 9 | Admin | | | | |
| 10 | Scheduler Board (its own bar, `SaveBand active`) | | | | |
| 11 | OIL tracker (both of its bars) | | | | |
| 12 | Medical view, full screen | | | | |
| 13 | Sign-in screen | | | | |
| 14 | Access screen ("Your request is with the admins") — its pass must NOT read "Not sent yet" (D1664: failed saves only) | | | | |
| 15 | Guest page | | | | |
| 16 | Changes window and ALL AVAIL window, not yet moved — open below the band | | | | |
| 17 | An input's own window and the question boxes (cover the bar, D1645) | | | | |
| 18 | Phone side menu open with the band up | | | | |
| 19 | The Tracker's corner (`#saveStat`) — no "saved", no "saving"; an error still said | | | | |
| 20 | "Saving…" — never beside the band | | | | |
| 21 | A failed save in a browser that keeps nothing — "Not saved" with Retry wins | | | | |
| 22 | `?fresh=1`, a normal browser — no band; the Tracker corner says "saved" as before | | | | |

## The door check (the `?nostore` switch)

| Action | Control | Result |
|---|---|---|
| | | |

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

## Orders walked

## Cases carried by a test

## The drawing check

## The magnifier, before and after

## Break tests

## Errors seen

## What was NOT walked, and why

## The gates

## What the walk found, and each disposition
