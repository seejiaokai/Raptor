# The design guide's "a ring never glows" — the draft (`[GUIDE-NO-GLOW]`, his ruling D880)

**His ruling D880 (15 Oct 26, "3 yes"):** the design guide carries "a ring in this app never glows" as a rule — asked of
him under D852 after the glow job (`[GLOW-OFF]`, D877, D879). Under D852 and D70 the guide changes only after ONE fresh
reader has read the wording and he has approved it. This file is that wording, version 1, not yet read.

## Where it goes
`raptor-port/docs/design-practices.md` §4 (colour), as a new point directly after "One mark, one look", and one line in
§1's short list of his rulings that bound design.

## The wording (version 1)
- **A ring never glows (owner D877, D879, D880 — 15 Oct 26).** Every ring the app draws to say something about a thing —
  the just-added mark, a picked or highlighted thing, the crew a tapped warning lights, a thing picked up or just landed,
  a puck that earns OIL, his own puck — is a plain line in its colour, on the thing's edge: no soft light spreading out
  from it, and none spreading in. The colour, the width and solid, dashed or dotted carry the meaning; a glow adds none
  and blurs the edge it marks. A dark drop shadow under a thing being dragged is depth, not a glow, and stays. A new
  glow anywhere is his to rule, never added as a variant.

## Places that still glow today — each put to him with a picture before anything changes (D853)
The rule above would cover these, but none of them was in his rulings of 15 Oct 26; nothing is changed until he says:
1. **The green "he can take this seat" ring** (`.oktake`, `src/ui/scheduler/03-week.css`) — with a person picked, an empty
   seat he could take rings solid green with a green glow (owner's comp, 13 Aug 26).
2. **The Leave War's open-bidding box** (`src/leavewar/ui/matrix.css`) — "a glowing, deep, faded green rectangle" round the
   columns open for bidding (owner, 1 Sep 26).
3. **A SANS puck's purple stripe** (`.puck.san::after`, `04-pucks-sections.css`).
4. **The Inputs page's "Calendar" button** (`.title .calview`, `02-shell.css`) — a soft blue light under a filled button;
   not a ring, so outside the rule as worded; named so he can say.

## Still to do
One fresh reader reads this wording (D70, D790); then the wording and the four places, with pictures, go to him; the
guide changes only on his approval.
