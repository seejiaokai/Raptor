# The design guide's "a ring never glows" — the draft (`[GUIDE-NO-GLOW]`, his ruling D880)

**His ruling D880 (15 Oct 26, "3 yes"):** the design guide carries "a ring in this app never glows" as a rule — asked of
him under D852 after the glow job (`[GLOW-OFF]`, D877, D879). Under D852 and D70 the guide changes only after ONE fresh
reader has read the wording and he has approved it. **Version 2**, after the read
(`../briefs/2026-10-15-reads/guide-no-glow-opus.md`: two must, five should, three low — all taken; the reader: no second
read needed, as they add places and a hold rather than change what is asked).

## Where it goes
`raptor-port/docs/design-practices.md` §4 (colour), as a new point directly after "One mark, one look"; and one line in
§0's list of his rulings that bound almost every design choice, after "the Raptor look stays":
> - **a ring never glows** (D880) — a plain line in its colour; a dark shadow that lifts a thing is depth, not a glow (§4);

In the same change (D201): `raptor-port/docs/ui-contracts.md` §"No flag ring glows" — its closing "two glows are NOT flags
and stay" — and its just-added box passage's "inset + soft glow" are corrected to the plain ring, pointing to D877 / D860.

## The wording (version 2)
- **A ring never glows (owner D164, D860, D877, D879, D880 — 24 Sep and 15 Oct 26).** A ring the app draws to say
  something about a thing — the just-added mark, a picked or highlighted thing, the crew a tapped warning lights, a
  thing picked up or just landed, a puck that earns OIL, his own puck — is a plain line in its colour, with no soft
  light spreading out from it or into it. Its colour, its width and whether it is solid, dashed or dotted carry the
  meaning; a glow adds none and blurs the edge it marks. A dark shadow that lifts a thing off the page — a window, a
  menu, a thing being dragged — is depth, not a glow, and stays. The places that still glow today (the backlog's
  `[GUIDE-NO-GLOW]`), two of them looks he chose — the green "he can take this seat" ring and the Leave War's
  open-bidding box — stay as they are until he rules on each from its picture; a look names them and changes none. A
  new glow, on a ring or anything else, is his to rule, never added without his word. (His words: "a ring in this app
  never glows", D880; a flagged puck, D164, the just-added mark, D860, the board's other marks, D877, and the picked
  person's chip, D879, lost theirs. That the rule covers rings that say something about a thing, that a dark shadow
  is depth and stays, and that a new glow anywhere is his to rule, began as the agent's reading; he approved them as
  written here, D8xx.)

## Places that still glow today — each put to him with a picture before anything changes (D853)
None was in his rulings of 15 Oct 26; nothing is changed until he says.

**Places 1 to 4 RULED 15 Oct 26 — D881 ("No glow for all looks good"): each loses its glow and keeps its line; built with
the guide change, after the wording's approval (round 3).**

**Rings the rule as worded covers:**
1. **The green "he can take this seat" ring** (`.oktake`, `src/ui/scheduler/03-week.css`) — with a person picked, an empty
   seat he could take rings solid green with a green glow (his approved comp, 13 Aug 26).
2. **The Leave War's open-bidding box** (`src/leavewar/ui/matrix.css`) — a green rectangle round the columns open for
   bidding, with a soft green light (his pick of 1 Sep 26; "a glowing, deep, faded green rectangle" is the code
   comment's description, not his words). If he rules it off, the colour table's row for it is corrected in the same
   change (D90, D201).
3. **The Leave War's "this row is you" ring** (`.mx tbody tr.me .who .whoedit .cs`, `matrix.css`) — the thin blue ring on
   the seat bar of his own row glows blue past it (6 Sep 26). The same meaning as his own puck, whose glow went (D877).
4. **The Tracker's two rings** (`.avail`, `.found`, `src/tracker/tracker.css`) — gold round an event he can fly next,
   turquoise round the event a search found; the glow was chosen to tell the found ring from the selection ring.
5. **Today's day card on the week** (`.day.today`, `03-week.css`) — its blue edge casts a soft blue light below it.
6. **The Leave War's Rearrange button while on** (`.rtbtn.on`, `matrix.css`) — a pale blue halo and a blue glow round it.

**Not rings — outside the rule as worded; named so he can say:**
7. **A SANS puck's purple stripe** (`.puck.san::after`, `04-pucks-sections.css`) — a stripe, not a ring.
8. **The Leave War's landing line while a row or a heading is dragged** (`tr.dragover .who`, `tr.grp.dragover td.grphd`,
   `matrix.css`) — the blue line glows on the name column.
9. **The Inputs page's "Calendar" button** (`.title .calview`, `02-shell.css`) — a soft blue light under a filled button.
   **Found 15 Oct 26 while picturing it: nothing draws it.** The Inputs title row has no `calview` button since the
   calendars' rebuild (`1bf27de17`); the List / Calendar switch is ordinary `.abtn` buttons. Counted on the running app:
   0 on Edit Schedule, 0 on Inputs. Not his to rule — a leftover style; it is removed with the guide change, nothing seen moves.

## Still to do
The wording and the nine places, each with a picture (D853), go to him; the guide changes only on his approval, and
none of the nine places changes before he rules on it.
**Pictures taken 15 Oct 26** (`raptor-port/scripts/handpass/noglow-look.mjs`, both sizes, on the built app): places 1–8 in
`raptor-port/docs/mock/2026-10-15-noglow-places/` (`N1`–`N8`, each today / noglow / where); the page put to him is that
folder's `index.html` (an Artifact, round 1 = places 1–4). Round 2 = places 5–8; round 3 = the wording, set to his answers.
