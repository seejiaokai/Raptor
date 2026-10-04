# Flight leading-edge taper — D565, 4 Oct 26

Status: specific picture proposal following the owner's annotated smooth-wing image. His drawn lines
give direction, not exact coordinates or acceptance of an unseen final picture. The former three-option
question and host's separate jet-and-label recommendation are superseded. D563 batch authority remains;
the completed Logic and Insights fixes continue. No replacement source is changed by this note.

Backlog: [TRK-FLIGHT-LABEL-READABILITY]. This new addendum retains the original batch spec, options
addendum and earlier presentation evidence as historical artifacts rather than rewriting them.

## Shape for the next picture

Use the host's pictured smooth wing, retaining its nose, curved lower wing, wingtip curves and tail.
Replace only its rounded upper shoulders with straight sloping leading edges from the narrow body
toward the two wingtips. This matches the owner's marked region without reproducing the rough strokes.

Exact candidate path in the existing 58-unit ball, centred at (29,29):

```svg
<path d="M29 11 L33 22 L47 26
 Q48 29 47 32 C43 34 39 35 34 35
 L37 44 L29 40 L21 44 L24 35
 C19 35 15 34 11 32 Q10 29 11 26 L25 22 Z"
 fill="#3BC6E8" stroke="#0007" stroke-width="0.8" stroke-linejoin="round"/>
```

The right leading edge runs (33,22) to (47,26), and its mirror runs (11,26) to (25,22).
The 4-unit drop over 14 units gives a visible taper while preserving the central label band. Those
dimensions are the proposed interpretation for pictures, not an owner ruling. Keep the existing text
at (29,32), its authored font and size, dark fill, ball/rings, wedges, marks and hit behaviour.

## Focused proof and limits

The new straight segments lie inside the existing shoulder envelope. The unchanged quadratic wingtips
have maximum radius 18.5; with the 0.4 half-stroke, all shape ink remains within radius 18.90 against the
19.14 inner-hole radius. This is containment, not a guarantee of a visible gap from the selected ring's
inward stroke. No extra outline, black masking stroke, independent hit target or data change is needed.

Removing upper shoulder area can expose the upper outer corners of long text. Recheck the actual
painted glyphs for the three previously pictured representative codes at the shipped Segoe UI/Arial,
weight 600, size 8.5; earlier zero-miss backing results do not cover this new path. Use valid escaped
font markup and nonempty glyph samples. Retain the separate obligation to check the relevant authored
font range during implementation; do not shrink labels, widen the ball or claim all fonts fit by inference.

Show the specific tapered candidate at the existing phone chart scale and desktop scale, plus an
enlarged view. Independently inspect the pictures and label backing before using them as evidence.
Keep the owner's annotation and all chart pictures private. Suggested wording: "I've tapered the front
edge of each wing as you drew, keeping the blue area behind the words. This is the updated shape."
The shown direction needs the owner's picture response; no earlier option selection is inferred.

Astra supplies this proposal; Sol independently challenges it. Subsequent production changes still
need affected regression checks, refreshed evidence and a fresh independent final code read. This
design note is neither its own approval nor production verification.
