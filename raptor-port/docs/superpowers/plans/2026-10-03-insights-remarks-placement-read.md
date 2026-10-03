# Insights after-edit question — independent placement recommendation, 3 Oct 26

Planning only. Owner asked for a picture after asking when a nonblocking question should appear. No timing,
placement, retention or save ruling follows from a request for a picture; D520 remains next. Existing D517–D519
settle formation scope, named red Missions/ambiguous Remarks cues and no extra line indicator.

## Sol challenge/request to Astra

The earlier fixed popup anchored to Mission covered written Remarks. Proposed replacement: one temporary compact
callout after the formation's aircraft rows/AREA, outside the dense row layout. It keeps Remarks visible and rows
the same height, but shifts following content while pending. Evaluate timing/focus/short-phone tradeoffs; read-only,
no new ruling, no approval of host pictures. Saving/cancel/reprompt/correction remain unanswered.

## Complete independent Astra response

I recommend showing this placement in the next picture: **one compact callout after the formation’s AREA strip**,
clearly headed with that formation’s callsign.

The Board already ends each formation with its aircraft rows followed by AREA, so this placement keeps every Remarks
box readable and avoids adding controls inside the crowded flight rows. It also reflects the approved formation-wide
answer. On a short phone screen, the callout can be reached by ordinary scrolling.

Two safeguards matter:

- Appear after the edit’s blur/change and the triggering click or Tab transition have completed. Do not steal focus,
  rebuild the active editor, or insert space halfway through a click.
- Inserting/removing the callout moves everything below it. Preserve the user’s focused field and scroll position;
  do not claim “nothing moves.” With many aircraft, the callout may initially sit below the viewport, so announce its
  presence accessibly without jumping away from the next field.

The owner’s visual choice is simply whether that **temporary extra space below the formation** is acceptable. Show
the normal screen beside the question state and explain that tradeoff. No separate approval question is needed before
preparing that requested picture.

Call it a **temporary question below the formation**, rather than implying it floats beside the edited box. Saving,
cancellation, repeating the question and correcting an answer remain unsettled; this placement does not decide them.

Read-only assessment completed; no artifact approval, edits or new ruling.

## Sol disposition and picture evidence

Accepted the placement recommendation for the requested picture, with temporary space stated explicitly. Question is
a nonmodal region with no backdrop, after AREA, not anchored over Remarks. Prototype waits after Tab/blur before
inserting, preserves next focus, and removes its temporary space after either DOM-only answer. No application writer
or role persistence is implemented. Short-screen screenshot is manually scrolled; no automatic jump is recommended.

`../../img/insights-proposal/remarks-bubble-result.json`: phone390×844, desktop1440×1000, short390×568, no Remarks
overlap, unchanged Mission box/row dimensions, both mock buttons operate/remove, zero page errors. All six saved final
PNGs opened. A disposable browser/DOM overlay on the existing bundle proves only the pictured design and these mock
checks, not real source lifecycle, mobile keyboard, save/Undo/issuing, or independent artifact approval.

Tier NONE. New full plan remains unbound until owner lifecycle/visual choices settle. OWED: Claude's read after the
reset on codex/insights-mission-mix, followed by new-chat FULL build/check/walk and independent Astra code inspection.
