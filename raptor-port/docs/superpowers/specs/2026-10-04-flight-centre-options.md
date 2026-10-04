# Flight centre options — D564, 4 Oct 26

Status: Astra proposals for owner choice; no replacement is selected or independently approved.
D564 rejects the first blocky wide-wing design. This addendum supplies alternatives to its flight
geometry only; the original combined spec, plan and evidence remain immutable historical artifacts.
Backlog: [TRK-FLIGHT-LABEL-READABILITY]. Logic and Insights work continues unchanged.

## Brief and shared constraints

Operate surface: crew need to recognise a flight and read its event code at the chart's actual scale.
Use the existing Raptor visual language. Impeccable shape guidance is read-only advice. The rejected
rectangle across the wing is the specific anti-reference; adding decoration would compete with the code.

All candidates keep the 58-unit ball, centre (29,29), inner radius 19.14, student wedges, outer rings,
marks, numbering, selection/search cues, authored layout and fonts. Use existing flight cyan #3BC6E8,
existing dark label, and stroke #0007 at 0.8. No shadow, gradient, new colour, label truncation or automatic
font reduction. The existing label remains centred at local (0,3). Paths below use local coordinates
with a translate(29,29) wrapper; they are picture geometry, not production edits.

## 1. Swept wing — recommended

A single flowing silhouette: pointed nose, gently arched wing shoulders, curved tapered tips and a
small split tail. The label sits across the wing's broad centre without a rectangular crossbar.
This retains the strongest flight cue while removing the blocky corners.

```svg
<path d="M 0,-17
 C 2,-15 2.7,-10 4,-8
 C 8,-7.2 13,-6 16,-3.5
 C 17.5,-2.2 18,-0.8 17.5,1
 C 16.8,3.8 12,5.4 6,6
 L 7.5,12 L 0,9.7 L -7.5,12 L -6,6
 C -12,5.4 -16.8,3.8 -17.5,1
 C -18,-0.8 -17.5,-2.2 -16,-3.5
 C -13,-6 -8,-7.2 -4,-8
 C -2.7,-10 -2,-15 0,-17 Z"/>
```

Risk: the label's upper outside corners have less backing than an oval. Verify real labels and authored
font sizes in the native render; a pleasing enlarged outline alone cannot establish readability.
The short tail may resemble a bird at very small scale; compare directly with the incumbent flight cue.

## 2. Oval badge — clearest and quietest

A smooth cyan oval gives the code a generous, uninterrupted background. There is no aircraft detail.

```svg
<ellipse cx="0" cy="0" rx="18" ry="11.5"/>
```

Risk: this deliberately trades aircraft recognition for simplicity. SIM already uses an oval, so shape
alone would no longer distinguish those two types; their established colours remain different. Present
that tradeoff explicitly and require the owner's choice before abandoning the wing direction.

## 3. Jet and capsule — separate symbol and label

A small aircraft sits above a rounded cyan code capsule, with a visible gap. The code gets a consistent
backing while the upper icon carries the flight meaning. Both remain inside the same inner circle.

```svg
<path d="M 0,-17 L 1.5,-12.8 L 7,-10
 Q 7.5,-9.4 6.5,-9.1 L 2,-9.6
 L 2.5,-7.8 L 0,-8.6 L -2.5,-7.8 L -2,-9.6
 L -6.5,-9.1 Q -7.5,-9.4 -7,-10 L -1.5,-12.8 Z"/>
<rect x="-17" y="-6" width="34" height="14" rx="7"/>
```

Place the capsule immediately before the existing text so its background remains the label's colour
comparison target. Neither visual element gains a separate hit target or event handler.
Risk: the approximately 9-unit aircraft can disappear at phone chart scale, and two stacked elements
can look busier. Its capsule ends also provide less backing for unusually wide labels than their centre.

## Picture and choice protocol

Render all three in the same existing ring at identical native phone and desktop scales, plus one
equally enlarged comparison. Keep the sample codes, fonts, wedge states and background identical;
include the widest representative authored label alongside an ordinary code. Inspect native images
before presenting. Every candidate's outline and stroke must stay inside the inner hole, and every
shown label must have continuous cyan behind its glyphs. Bounds support those checks; no candidate
is declared readable or accepted by this document. If the authored range exceeds the backing, report
the specific limit without silently changing the font or ball size.

Owner-facing wording: **"Which centre do you prefer? 1: Swept wing — my recommendation; keeps the flight
shape with a softer outline. 2: Oval badge — simplest to read, but loses the aircraft shape. 3: Jet above
the label — separates the icon and words, though the little jet may be harder to see on a phone."**

The host independently challenges these options, shows numbered pictures privately and records the
owner's selection before replacing source. Actual owner photos and chart screenshots stay outside
the repository and public hosting. After replacement, recheck label backing, unchanged ring clearance
and centre/wedge actions in Flow, Details and Edit on phone and desktop, then refresh affected evidence
and commission a fresh independent final read. Earlier checked geometry is not proof for a new path.
