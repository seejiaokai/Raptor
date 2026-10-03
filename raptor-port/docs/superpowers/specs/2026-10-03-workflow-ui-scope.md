# Workflow UI scope — 3 Oct 26

## Owner authority

D540: the Insights build is complete and preview accepted by the owner ("Looks good").
No further work on that branch except rulings. Start `codex/workflow-ui` from
the refreshed `codex/insights-mission-mix`; merge `origin/codex/rally-workspan`
and `origin/codex/discard-marks-remove` before moving any stylesheet rule.
Keep those three built branches separate for Claude's review. Report conflicts
in plain words. No main push, merge into main or merging PR.

D541: the stylesheet split changes nothing visible. After the split walk EVERY
screen at phone and desktop sizes and open every saved picture, including screens
outside the computed-style measurement samples. Keep selectors, declarations,
rule ordering and button sizes unchanged (D493, D487). Record admin/member
computed styles before and after at phone, laptop and desktop widths and prove
that every part loads once and in order before moving rules.

## Build and review

D539/D496: Astra plans and coordinates; Sol 6.1 independently challenges the
plan, implements and runs the applicable checks; a fresh Astra independently
reads the finished snapshot with its evidence. The planner never approves its
own artifact. Claude's full review after Monday 5 Oct 26, 19:00 Asia/Singapore
remains OWED before main for the three earlier builds and this batch.

## Next design

D541 reaffirms D495: after the mechanical split, no later workflow UI feature
is designed. Search the complete rulings and backlog, then ask product questions
in rounds of at most four with recommendations. Show the owner a picture before
any visual build. Do not guess keyboard, mobile navigation or button changes.

The split plan, independent challenge and running-app evidence will be linked
from `[CSS-SPLIT-BY-SCREEN]`. This note records scope, not an implementation plan.

## Approved priorities and next chat — 4 Oct 26

Owner: "go with all three recommendations but i think we can do it in a new chat".
D542: prioritise building and correcting a day's schedule.
D543: phone quick checks and small edits first, while retaining full editing.
D544: faster keyboard entry of times and notes, keeping existing Enter/Escape.
D545: while typing on the schedule, forward Tab moves to the next open text box
on the right; at the rightmost, to the leftmost open text box in the next row.
Shift+Tab, final-row exit, opening closed cells and exact surfaces remain unsettled.

The owner then asked whether options 1/2 meant splitting long files and whether
the recommendations came from the backlog. They are usability priorities suggested
within his filed workflow/keyboard/mobile/button-placement area, not further file
splits or priorities already specified there. Clarify this before further design.
The stylesheet split is complete; Leave War/Tracker splits keep their own batches.
Continue this unmerged branch in a new chat. No layout or implementation design is
approved. Start from the backlog and these priorities, include filed UI faults in
the scope discussion, ask remaining product questions at most four at a time with
recommendations, and show phone/desktop pictures before any visual source change.
