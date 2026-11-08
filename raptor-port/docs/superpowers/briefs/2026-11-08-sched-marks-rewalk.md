# The re-walk of the fixes — the schedule's marks and words, chat 13, 8 Nov 26 (walker W4)

You are a walker (Sonnet). You drive the built app in a real browser and report what you SEE, with pictures. You change
no file under `raptor-port/src`, commit nothing, push nothing. Read `raptor-port/docs/walk-scripts.md` §3 to §7 before you
write a script, and the rules section of `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-walk.md`
("The rules every walker keeps") — they still hold. Your scripts go in `raptor-port/scripts/handpass/sm-w4-*.mjs`, your
pictures in `raptor-port/docs/img/handpass/2026-11-08-sched-marks/w4/` (`outDir('w4')`), your report in
`raptor-port/docs/handpass/parts/2026-11-08-sched-marks-w4.md`.

## The tools

- `raptor-port/scripts/handpass/sm-lib.mjs` — launch a PC (Chromium 1536×864 at 1.25) or a phone (WebKit 402×874 at 3)
  world, sign in, publish a day, file an input, open the board, read the marks, take a picture. Copy how
  `scripts/handpass/sm-host-f1.mjs` uses it. The clock starts at Mon 13 Jul 26 09:00.
- The build under test: `SM_DIST=C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad/dist-sm2`.
  `main`'s build before this job, for comparison only where a step says so:
  `C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad/b6e/raptor-port/dist`.
- Your origin: `http://localhost:4398` (main's build: `http://localhost:4399`). Never another port.
- Run each script from `raptor-port/` with `SM_DIST=… node scripts/handpass/sm-w4-<n>.mjs`. No checks lock is needed for
  a walk script on a build already made; never run `npm run build` or a browser test.

## What changed (so you know what you are looking at)

On a day already published, the day's "N pending" button opens the changes window on its "To go out" tab — the list of
changes waiting to go out. A line there is a button when a tap can take the schedule to the change, and a still line
otherwise. The fixes: (1) a line about an input listed under **Unavailable** (a leave, a course, a request put
"→ Unavail") is now a button, and a tap scrolls to that input's row under Unavailable and flashes it — on Edit Schedule's
week and on the Scheduler Board; (2) a **SANS availability** filed after publishing keeps a still line (it is a card, not
a row); (3) a line about a request under **Personal Inputs** opens that section if it is folded and lands on its row — on
Edit Schedule and the board; (4) **Accept, Reject and → Unavail** on a request that runs into a week whose saved copy
cannot be read now refuse in the grey "Blocked:" note: "Blocked: this week’s saved copy could not be read, so it can’t be
edited. Nothing was saved. Report it with “Report a problem” on the Help page."

## The scenarios — each on the PC AND the phone, on the week AND the board unless it says otherwise

For each: what you did, what you saw, PASS or FAIL against the expected, and a picture of the moment that decides it
(cropped to the area: the line in the list, the row it landed on with its flash, the note).

1. **A leave filed after publishing.** Publish Wednesday (`publishDay(W, 2)`), file an LL for Bolt on 15 Jul. Open the
   day's "N pending" list. Expected: "Bolt · LL" is a button; a tap scrolls to Bolt's row under Unavailable and it
   flashes; the foot reads "Tap a change to go to it." Do it from the week, then from the board (open the board on
   Wednesday, open the changes window there, tap).
2. **A course filed after publishing.** Same, a CSE for Bolt on 15 Jul. Expected: as 1 — it lands under Unavailable.
3. **A request moved "→ Unavail" after publishing.** Before publishing, file a timed Meeting for Saint on 15 Jul (it goes
   on the Ground Programme). Publish Wednesday. On its card press Reject, then → Unavail. Open the list. Expected: its line
   is a button and lands on Saint's row under Unavailable.
4. **A SANS availability filed after publishing.** Publish Wednesday, file a SANS Availability for a SANS person on 15 Jul.
   Expected: its line in the list is a still line (not a button) and nothing errors; the SANS card is drawn.
5. **A two-day meeting, PC only, the week only.** Before publishing, file an all-day Meeting for Saint on Mon 13 – Tue
   14 Jul (its row stands on Monday's Ground Programme). Publish Tuesday. Open the meeting's window and change its
   remarks. Make sure Tuesday's Personal Inputs is folded. Open Tuesday's list and tap the meeting's line. Expected:
   Personal Inputs opens and the meeting's row there flashes. Then go to View-only Sched, Tuesday: expected, the line is
   still (View-only Sched draws no Personal Inputs).
6. **A refusal on a damaged neighbouring week, PC only, the week only.** Build the case on screen: file an all-day
   Meeting for Saint on Sun 19 – Mon 20 Jul (answer the OIL question No). Go to the week of 20 Jul (the week strip),
   change something small there (a day note) so that week is saved, and back to the week of 13 Jul. Find that week's
   saved row in localStorage (as `weekRowKey` finds 13 Jul's — the same name with `20-07-2026`), then reload with that row
   damaged (`damageInit(<its key>)`, as walk W2 did for 13 Jul). On Sunday's card of the meeting press Accept or Reject
   (whichever it shows), and → Unavail if offered. Expected: each press shows the grey note in the words above, once;
   nothing on Sunday changes; the top bar's Undo does not light for it. Do the same press on `main`'s build: say what it
   showed (expected there: an amber note in other words).
7. **Leftovers to settle (PC; each also on `main`'s build, to tell whether it is older).** (a) Open an input's window from
   the Inputs page, type a remark, press Escape: does a small card "Close it and lose them?" hang from the ✕, or does the
   window close and lose the remark? (b) The wave templates window (Edit Schedule, the + Wave menu's gear): is its show /
   hide mark a drawn line eye, or a typed 👁? (c) The changes window: does Escape close it?

## The plain-user round (once, the PC)

As a scheduler would: publish a day, file two changes, open the list, tap each line, close the list, look at the day's
pending count and at the Unavailable list. Every control you open you also close. Say anything that looks wrong or reads
oddly, with its picture.

## Your report

A table: scenario · device · surface · PASS / FAIL · picture file · one line of what you saw. Then every FAIL in full
(steps, expected, seen, picture). Then page errors (`W.errs`) per script — "none" if none. Do not explain causes in the
code; say only what the screen did.
