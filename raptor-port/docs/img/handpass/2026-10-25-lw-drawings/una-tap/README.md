# A tap on a day holding a half-day UNA (D1353, held as a question): pictures, 25 Oct 26

Drawn on the built app (this branch, served on port 4180) by `raptor-port/scripts/handpass/lw-1025-una-tap.mjs`. Every
picture comes at two sizes: `-phone` (402 × 874 at 3×, his iPhone) and `-desk` (1440 × 900 at 1×). "Today" = the real
app, only the dashed cyan mark and the label added. "Drawn" = the app's own nodes changed on the page. The run's log and
measurements: `run-phone-desk.json`.

**The question.** His D1353 says a tap on a Leave War day holding a half-day UNA opens the bid window for the free half,
as a half-day leave's day does, for an admin and a member alike. It is held because today the day's list (pictures 1
and 2) is the only place a tap reaches where an admin changes the UNA's remarks or deletes it, and where a member reads
its remarks (D1338). Drawn A keeps both: the window opens on the free half with the UNA's own entry in it.

**The fixtures**, both sizes, each checked before its picture: Thu 12 Nov 2026, on Drifter's row and on Ranger's (row
`bane`, the member `us`). November was opened for bidding as admin through "Open for bidding" (the NOV button; the chip
then reads "Open for bidding 1 Nov – 30 Nov"). Each UNA was placed as admin through the bid window: AM, "Board of
inquiry" typed in its Remarks box, then UNA. Each landed as a morning UNA on the grid, and its saved record carries the
remarks and "placed by Saber". The comparison leave in 3a and 4a (a morning LL filed on the Inputs page) was filed
through the test bridge (`window.fileInput`, the shape the Inputs page writes, as the round-3 walk's S10 did), after
each UNA had been taken away with the day's list's own Delete. It is only there to get the app's real free-half window
on the same day.

| Picture | Real / drawn | What it shows | Words and values |
|---|---|---|---|
| `1-today-admin-list` | real | As admin, a tap on Drifter's Thu 12 Nov opens the day's list. The UNA's entry is marked: its box, "Morning · out of the manning · placed by Saber", Delete, and its dark Remarks box holding "Board of inquiry" | — |
| `2-today-member-list` | real | As Ranger, a tap on his own Thu 12 Nov opens the same list, read only: the box, the same line, and "“Board of inquiry”" as words. Nothing to type in, no Delete | The whole list reads only that entry |
| `3a-today-free-half` | real | For comparison: beside a morning leave filed on the Inputs page, the admin's tap opens the bid window with only PM in Duration (marked), and the line "The morning is LL, filed on the Inputs page — change that there." | Leave buttons read LL> 25.5, OL> 25.5 (that leave charges half a day) |
| `3b-drawn-a-admin` | drawn | Drawn A, as admin: the same window on the same day, opened on PM, with the UNA's entry from picture 1 (box, line, Delete, Remarks box with "Board of inquiry") under the day line. Both changes marked | See "What was drawn" below |
| `4a-today-free-half-member` | real | For comparison, as Ranger: his window beside a morning leave filed on the Inputs page, PM only, with the same "filed on the Inputs page" line | Leave buttons read LL> −0.5, OL> −0.5 in red |
| `4b-drawn-a-member` | drawn | Drawn A, as Ranger: his window on PM, with the UNA's entry from picture 2, read only: the box, the line, "“Board of inquiry”" as words. No box to type in, no Delete | See below |

## What was drawn (3b, 4b)

- **The UNA's entry** is the day's list's own entry, cloned whole from pictures 1 and 2 (the admin's with its Delete and
  Remarks box, the member's read only). It sits inside the list's own frame, so it keeps the list's look; nothing was
  restyled. Its Delete and Remarks box are a picture only and do nothing.
- **Where it sits: under the day line**, above the new bid's Remarks row and the Duration row. The window's order today
  is day line, then the new bid's Remarks and Document row, then Duration. Putting the entry directly above Duration
  would split the new bid's Remarks row from its Duration. So the entry goes first, as what the day already holds, and
  the new bid's rows follow it unchanged. Its box row stands the window's own row gap (6 px) below the day line.
- **The held-half line was removed, not reworded.** The entry already says "Morning", so "The morning is UNA." would
  say it twice. Only PM is left in Duration, as the app already does for the free half.
- **The leave buttons** are put back as the window draws them with nothing charged that day: Drifter LL 26, OL 26,
  OIL 4, CCL 5, the rest 0; Ranger all 0. They were read from the window before the UNA was placed (Drifter) and from
  his window on Fri 13 Nov (Ranger). A UNA charges no leave. The comparison leave behind 3a and 4a charges half a day,
  which is why those read 25.5 and −0.5. Only the figures differ: the buttons' looks were checked to match.
- **The day line** reads "No manning row turns amber or red" in every window. It read the same before the UNA was
  placed. The comparison leave and a morning UNA both take the man out for the morning, so the drawn windows' day
  line is the one a UNA would give.

## Does it fit the phone

| Window | Today | Drawn A | On a phone |
|---|---|---|---|
| Admin's | 288 px tall, top at 572 | 396 px tall (+108), top at 464 | Fits, with no scrolling inside the window. The grid keeps the top 464 px |
| Member's | 288 px tall, top at 572 | 343 px tall (+55), top at 517 | Fits, with no scrolling inside the window |

On the desk the windows are the same heights (900 px screen), with the same room to spare.

Three things to know from the drawing:
1. **The entry's line may take two lines on his iPhone.** "Morning · out of the manning · placed by Saber" is 279 px
   wide in 305 px of room on the phone. With letters about a seventh wider (his iPhone's Apple font) it is about
   319 px, so it would likely wrap, and the entry grows about one line (~18 px). Today's day list has the same width,
   so it would wrap there too. The line wraps whole; nothing is cut.
2. **On the admin's window two dark Remarks boxes now stand one above the other**, about 16 px apart: the UNA's (holding
   "Board of inquiry") and the new bid's (empty, "Remarks"). Only their place and their words tell them apart.
3. **The admin's window shows "UNA" twice:** the entry's box, and the UNA button in the row under the leaves (CSE · OD ·
   UNA · ⋯). Pressed, that button would place an afternoon UNA. If D1349 is built (UNA moved into the ⋯), only the
   entry's box remains.
