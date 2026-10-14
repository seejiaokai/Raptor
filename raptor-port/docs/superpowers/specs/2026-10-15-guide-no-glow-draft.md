# The design guide's "a ring never glows" — the draft (`[GUIDE-NO-GLOW]`, his ruling D880)

**His ruling D880 (15 Oct 26, "3 yes"):** the design guide carries "a ring in this app never glows" as a rule — asked of
him under D852 after the glow job (`[GLOW-OFF]`, D877, D879). Under D852 and D70 the guide changes only after ONE fresh
reader has read the wording and he has approved it. **Version 2**, after the read
(`../briefs/2026-10-15-reads/guide-no-glow-opus.md`: two must, five should, three low — all taken; the reader: no second
read needed, as they add places and a hold rather than change what is asked).

## Version 4 — after the fresh read of version 3 (all ten findings taken), for round 3
The read: `../briefs/2026-10-15-reads/guide-no-glow-v3-opus.md` (3 must, 4 should, 3 low). It found glows the list had
missed, so round 3 puts four places to him first, with pictures (`noglow-more.mjs`): **10** the sign-in page's claw logo
(`.lb-glyph`, a cyan drop-shadow) — recommended KEPT, as the app's own sign, not a mark (the talon logo stays); **11** the
Leave War's docked balance bar and move banner (`.balbar`, `.mv-banner`: a 4px pale cyan band, his 6 Sep 26 ask that the
bar not blend in) — recommended OFF, the solid cyan edge and the raised ground keep it standing out; **12** the Fast sync
dot while on (`.fastsync.on .dot`, a 3px pale green band) and **13** Admin → Users' status dots (`#page-admin .od-c i.g /
i.r`, 3px pale green / red bands) — recommended OFF, a halo being a glow (D882's Rearrange halo). The faint cyan wash at
the top of each page and of the sign-in page (`body`, `.login` backgrounds) is the page's own light, like the logo — kept,
named in the point. The wording below assumes those recommendations; a place he keeps is named in it as his exception.

**Where it goes.** `raptor-port/docs/design-practices.md` §4, a new point directly after "One mark, one look"; §4's Cyan
row extended (no new row — S3); and one line in §0's list, after "the Raptor look stays":
> - **no mark glows** (D880–D882, D8xx) — a mark is a line, edge or fill in its colour; a dark shadow that lifts a thing is depth, not a glow (§4);

The Cyan row's meaning becomes:
> a main button (a solid fill); the picked date or tab; today's date; the focus outline; the picked-up look of a drag; and, as a pale fill with cyan words and edge, a picked filter chip and the Rearrange button and Show SANS switch while on

with "D882" added to its "Where from".

**The point (version 4):**
- **No mark in this app glows (owner D164, D860, D877, D879, D880, D881, D882, D8xx — 24 Sep and 15 Oct 26).** A mark the
  app draws to say something about a thing — a ring round a thing picked, highlighted, just added or just landed, the crew
  a tapped warning lights, a puck that earns OIL, his own puck or row, a seat a man can take, an event he can fly next or
  the one a search found, the stripe that says SANS, the box round the days open for bidding, the line where a dragged row
  will land, today's day card, a panel that pops up, a status dot — is a line, edge or fill drawn as it is, its colours
  and a stripe's shading included, with no soft light spreading out from it or into it. Its colour, its width and whether
  it is solid, dashed or dotted carry the meaning; a glow adds none and blurs the edge it marks. A shadow in the mark's own
  colour is a glow, and so is a pale, see-through band of its colour round it, blurred or not (a halo); a solid ring drawn
  as a shadow is a line. The Rearrange button and the Show SANS switch show that they are on by the filter chip's "on"
  look — a pale cyan fill, cyan words and a cyan edge — never by a glow or a halo (D882); a new on/off control takes the
  same look unless he rules otherwise, and the app's other "on" looks (Fast sync, the week buttons, OIL Earn, the bell)
  stay as they are. A dark shadow that lifts a thing off the page — a window, a menu, a thing being dragged — is depth,
  not a glow, and stays. The app's own sign is not a mark: the claw logo on the sign-in page keeps its light, and so does
  the faint wash at the top of a page (D8xx). A new glow on a mark is his to rule, never added without his word. (His
  ruling: "a ring in this app never glows" — his yes, D880. The places that lost theirs: a flagged puck, D164; the
  just-added mark, D860; the board's other marks, D877; the picked person's chip, D879; the take ring, the bidding box,
  his own row's ring and the Tracker's rings, D881; today's card, the SANS stripe's light, the landing line's light, and
  Rearrange's "on" as the chip's fill, D882; the balance bar's and move banner's band, the Fast sync dot's and Admin →
  Users' dots' bands, D8xx. That a stripe, a box, a line, a panel, a dot and a button come under the rule with the rings;
  that a shadow in the mark's own colour and a halo count as a glow; that a dark shadow under a window or a menu is depth
  too; that a new on/off control takes the chip's look; and that a new glow is his to rule, began as the agent's
  reading; he approved them as written here, D8xx.)

**Place 7, said exactly (S2):** the SANS stripe's two outer purple layers go (`0 0 5px 1px …, 0 0 12px …`); its gradient
and its 1px white inner line stay — the stripe's own highlight, inside its edge (D651: the brightest thing on the puck).

**In the same change (D201), version 4's list (M3, S4):**
- `.claude/rules/decisions/leave-war.md`'s settled point on the open-bidding border: its "glowing" and "low-opacity halo"
  corrected to the plain green outline (D881).
- `raptor-port/docs/ui-contracts.md`: §"No flag ring glows" (its closing "two glows are NOT flags and stay") and the
  just-added box passage ("inset + soft glow") corrected to the plain ring (D877, D860); the `[GLOW-OFF]` paragraph's
  "Still glowing, not ruled: the SANS puck's purple stripe" removed (D882); the passages on `.oktake`, the open-bidding
  box, the Leave War's lit row, its landing bars and the Rearrange toggle corrected to their plain line (D881, D882);
  §Bulk balance entry's "the ring and the glow" (D8xx); the section names D880–D882 and D8xx.
- `raptor-port/docs/file-map.md`'s open-bidding box line ("a glowing deep-faded-green border").
- Stylesheet comments: every one describing a glow being taken off ("ON now GLOWS, not just tints"; the bidding box's
  "low-opacity halo"; the Tracker's "carries a glow those rings do not"; `matrix.css`'s docked panels' "a solid accent ring
  and a glow"), and the ones D877 left (`04-pucks-sections.css` "the purple RING and its glow"; `18-oil-board.css` "every
  puck that earns glows. Solid glow = a full day…"; `02-shell.css` the bell "glows" → "lights").
- D270's full row (`.claude/decisions-full/scheduler.md`) marked "— changed by D877" for its purple glow.
- The leftover `.title .calview` style (place 9) removed.
The build itself — places 1 to 8 and 11 to 13 — rides the same branch, with its own check (a walk on screen, a fresh
code read — D790), the SANS calendar's pucks included (the same builder as the schedule's).

## Version 3 (as read; replaced by version 4 above)

### Version 3 — set to his answers (D881, D882, D883)
Every place found still glowing goes (D881 places 1–4, D882 places 5–8; place 9 is a leftover style nothing draws), and
the Rearrange button's "on" takes the filter chip's fill (D882). So the rule no longer needs "the places that still glow
stay until he rules", and it covers more than rings: a stripe (the SANS puck), a box (the bidding box), a line (the
landing line), a button that is on. Version 2 below is kept as it was read; version 3 replaces it.

**Where it goes.** `raptor-port/docs/design-practices.md` §4, as a new point directly after "One mark, one look"; one row
in §4's colour table; and one line in §0's list, after "the Raptor look stays":
> - **nothing glows** (D880) — a mark is a plain line or fill in its colour; a dark shadow that lifts a thing is depth, not a glow (§4);

The colour table's new row, after "Cyan (the app's one accent)":
> | A pale cyan fill with cyan words and edge | a button or switch that is on, and a picked filter chip | D882; the stylesheets |

**The point (version 3):**
- **Nothing in this app glows (owner D164, D860, D877, D879, D880, D881, D882 — 24 Sep and 15 Oct 26).** A mark the app
  draws to say something about a thing — a ring round a thing picked, highlighted, just added or just landed, the crew a
  tapped warning lights, a puck that earns OIL, his own puck or row, a seat a man can take, an event he can fly next or
  the one a search found, the stripe that says SANS, the box round the days open for bidding, the line where a dragged
  row will land, today's day card — is a plain line, edge or fill in its colour, with no soft light spreading out from it
  or into it. Its colour, its width and whether it is solid, dashed or dotted carry the meaning; a glow adds none and
  blurs the edge it marks. A shadow in the mark's own colour is a glow. A button or switch that is on shows it by the
  filter chip's "on" look — a pale cyan fill, cyan words and a cyan edge — never by a glow or a halo; a solid cyan fill
  stays the main button's (D882). A dark shadow that lifts a thing off the page — a window, a menu, a thing being
  dragged — is depth, not a glow, and stays. A new glow, on anything, is his to rule, never added without his word.
  (His words: "a ring in this app never glows", D880; the places that lost theirs: a flagged puck, D164; the just-added
  mark, D860; the board's other marks, D877; the picked person's chip, D879; the take ring, the bidding box, his own
  row's ring and the Tracker's rings, D881; today's card, the SANS stripe, the landing line, and "on" as the chip's fill,
  D882. That a stripe, a box, a line and a button come under the rule with the rings, and that a shadow in the mark's own
  colour counts as a glow, began as the agent's reading of D881 and D882; he approved them as written here, D8xx.)

**In the same change (D201):** `raptor-port/docs/ui-contracts.md` §"No flag ring glows" — its closing "two glows are NOT
flags and stay" and the just-added box passage's "inset + soft glow" are corrected to the plain ring (D877, D860), and the
section names D880–D882; every stylesheet comment that describes a glow being taken off ("ON now GLOWS, not just tints",
the bidding box's "low-opacity halo", the Tracker's "carries a glow those rings do not") is corrected with its rule; the
leftover `.title .calview` style (place 9) is removed. The build itself — the nine places — rides the same branch, with
its own check.

## Version 2 (as read; replaced by version 3 above)

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

**Places 5 to 8 RULED 15 Oct 26 — D882 ("I agree to all your recommendations"): each loses its glow; the Rearrange
button and the Show SANS switch show "on" by the filter chip's pale blue fill (`.fchip.on`), no halo, no glow. So every
place found goes, and the wording (round 3) can say nothing in the app glows. And D883: the Leave War's landing line runs
unbroken across the whole row, counters included (filed as `[LW-LANDING-LINE-FIGURES]`).**

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
