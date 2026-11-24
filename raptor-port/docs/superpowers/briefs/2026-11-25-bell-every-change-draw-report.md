# Job 1 of the night (25 Nov 26): the bell's "every change" line, drawn. Report to chat 170

**Status:** drawn, page drafted, committed and pushed on `claude/night-1125-bell-pages-170`, commit `65b873ce4`. No
message to him, no pull request, nothing on `main`, nothing under `raptor-port/src` changed in the checkout.

**One thing did not go to plan: the scratch build was never made.** Chat 174 held the checks lock for the whole hour
(its walks w14a and then w14b). It released and re-took the lock between walks faster than my 30-second waiting take
could catch it. So the "every change" pictures use the fallback, which is round 4's swap method. The world is today's
frozen build (`D:/rw4/build-new3`, the same as `main`), made by the same presses. In each line that ends "and N more
change(s)", that ending is replaced in the page by the parts it left unsaid. Those parts are read from the notice's own
stored parts and worded as the app words them. The run checks the first two parts against the app's own words, and
checks the count against the stored parts. Layout, fonts and wrapping are the app's own. The page's opening line says
which method made the pictures. For a real build once the lock is free, the notes give two commands: build to
`D:/rw4/build-every`, then run `bec-draw.mjs every A` into `D:/rw4/night1/every-A`. After that, `bec-page.mjs` picks the
real run over the swap by itself. The scratch export (`D:/rw4/draw/raptor-port`, `node_modules` a junction, already
holding the one change to `firstTwo`) is ready for that build. My waiting take was stopped, along with its leftover
process, and I never held the lock.

## What was drawn (Ranger's bell, iPhone 402x874; rows = iPhone Chromium / desktop / iPhone WebKit)

| Case | Today | Rows | Every change | Rows |
|---|---|---|---|---|
| 1 two changes | Now Tue 14 Jul, remark changed · Saber | 1/1/1 | the same | 1/1/1 |
| 2 three | Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber | 2/2/2 | Now Thu 16 Jul, renamed — was Training, remark changed · Saber | 2/2/2 |
| 3a four | Now Mon 20 Jul 08:00–10:00, Ace added, and 2 more changes · Saber | 2/2/2 | Now Mon 20 Jul 08:00–10:00, Ace added, renamed — was Range brief, remark changed · Saber | 2/3/2 |
| 3b five (with a kind change) | Now Wed 22 Jul 08:00–10:00, Ace added, and 3 more changes · Saber | 2/2/2 | Now Wed 22 Jul 08:00–10:00, Ace added, Training changed to Meeting, renamed — was Range brief, remark changed · Saber | 3/3/3 |
| 3c leave, half day and kind | Now Fri 24 Jul (AM), LL changed to OL, and 1 more change · Saber | 2/2/2 | Now Fri 24 Jul (AM), LL changed to OL, remark changed · Saber | 2/2/2 |
| 4 worst, seven parts | Filed under Unavailable, now Tue 28 Jul – Thu 30 Jul 08:00–11:30, and 5 more changes · Saber | 2/2/2 | Filed under Unavailable, now Tue 28 Jul – Thu 30 Jul 08:00–11:30, Sidewinder, Talisman added, Hex, Ace taken off, Training changed to CSE, renamed — was Advanced range safety procedures brief 1, remark changed · Saber | **5/5/5** |
| 5 replaced bid | Now Fri 11 Dec, OL changed to PL, and 1 more change · replaces your LL bid · Saber | 2/2/2 | Now Fri 11 Dec, OL changed to PL, remark changed · replaces your LL bid · Saber | 2/2/2 |

The worst case is seven parts. The built order is: cancelled, then where it is filed, then when, then added, then taken
off, then the kind, then the name, then the remark. A replaced bid comes after those with " · ". The window, the in-place
boxes and the drag cannot cancel an input in the same save, so slot 1 never joins the others. The four filing parts are
an either-or chain, so they never come two at once. A person who is himself added or taken off reads only "You were
added" or "You were taken off". Case 4 uses all of slots 2 to 8: a Training made a course (a course files itself under
Unavailable), its days and hours changed, two people added and two taken off, a 40-letter old title, and a new remark.

The six unruled wordings, today's build, all one row: "Now OL (AM), LL changed to OL · Saber"; "Now 00:00–12:00, LL
changed to Training · Saber"; "Now Thu 6 Aug · Saber" (a morning leave moved, no "(AM)"); "Renamed — was Training ·
Saber" (a title given, "Sim"); "Renamed — was Brief · Saber" (a title taken away); "Renamed — was Exercise Kite · 145
Sqn · Saber" (an Attach's "To" changed to 146 Sqn).

## What cuts or wraps

Nothing cuts a line. The bell's second line has no clamp, no ellipsis and no fixed height, and it wraps anywhere; this
was measured on every case. A long line wraps to as many rows as it needs, and the list scrolls with its foot kept in
sight. So no uncut variant was needed.

- **The worst line takes five rows on his iPhone.** When he agreed, he was told a line might run to a third row. Five
  changes already take three rows.
- **The desktop's bell (348px) is narrower than the phone's** (the phone's is as wide as the screen), so a line can take
  a row more there: case 3a is two rows on the phone and three on the desktop.

## The page (draft): `raptor-port/docs/mock/bell-every-change.html`, 1.3 MB, pictures embedded, light and dark, tap to enlarge

The page has 13 questions, each with its recommendation marked as mine:
- **A.** Every change as drawn: yes. It notes the five rows against the three he was told.
- **A2.** Keep today's order: yes.
- **A3.** A remark is still said only as "remark changed": yes.
- **A4.** Three or more people are still a count, "3 people added": recommend naming them all. Whether "never any other
  count" covers this is a reading, so it is put as a question. There is no picture.
- **A5.** Two names joined by a comma read like two changes ("Talisman added, Hex, Ace taken off"): recommend "and".
- **A6.** A phone message carries the same sentence: yes. There is no picture.
- **B.** An Undo sends a second phone message. This uses the worked example from the brief, with no picture, and the
  page says why.
- **C.** Recommend "Now AM, LL changed to OL".
- **D.** Recommend "LL changed to Training, 00:00–12:00" (option 2). This changes the order, so it is his call.
- **E.** Recommend "Now Thu 6 Aug (AM)".
- **F and G.** Recommend keeping "Renamed — was …".
- **H.** Recommend "145 Sqn changed to 146 Sqn".

How often each case happens is marked "my guess" wherever it is not known. The page's text has no ruling numbers and no
file names. I looked at it at phone size (402) in light and dark and on a desktop: no sideways scroll, and pictures
enlarge on tap. **Owed before it goes to him:** the fresh Fable read of its words, which is the host's step.

## Files (all in the one commit `65b873ce4`; `git show --stat` read before the push, no logs or dumps)

- `raptor-port/scripts/handpass/bec-draw.mjs` and `bec-page.mjs`.
- `raptor-port/docs/mock/bell-every-change.html`.
- `raptor-port/docs/img/handpass/2026-11-25-bell-every-change/` (23 pictures).
- `raptor-port/docs/superpowers/briefs/2026-11-25-bell-every-change-draw-brief.md` (committed as asked) and
  `…-notes.md` (the scratch diff, the built order, each case's words and rows, what cuts, what could not be drawn).
- `raptor-port/docs/file-map.md`.

`npm run docsize` passed. Raw runs and logs are in `D:/rw4/night1/` (today-A, today-B, swap-A, page-look).

## Could not do

- The real scratch build (the lock, above).
- Pictures of a phone alert: the app sends none yet.
- "Three named" for A4: the drawing copy changes only the count of changes.

Also, so nobody reads it wrong: `stiff` is Saber himself, so the worst case takes Ace off, not Stiff.

**For the host:** the scratch export `D:/rw4/draw/` (1 MB, plus the `node_modules` junction, which must be unlinked
before the folder is removed) and `D:/rw4/night1/` are scratch for the night.
