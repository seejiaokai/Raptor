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

## Current priorities — D546, 4 Oct 26

Owner: "go with all three recommendations but i think we can do it in a new chat".
D542/D543 were the first two recommendations: build/correct a day's schedule
first, and phone quick checks/small edits first while retaining full editing.
The owner now skips both (D546) and will introduce ideas during building as he
thinks of them. They are deferred, not current agreed priorities. The workflow
batch remains; no broader layout or reduced phone feature set is approved.
D544: faster keyboard entry of times and notes, keeping existing Enter/Escape.
D545: while typing on the schedule, forward Tab moves to the next open text box
on the right; at the rightmost, to the leftmost open text box in the next row.
Shift+Tab, final-row exit, opening closed cells and exact surfaces remain unsettled.

The owner then asked whether options 1/2 meant splitting long files and whether
the recommendations came from the backlog. They are usability priorities suggested
within his filed workflow/keyboard/mobile/button-placement area, not further file
splits or priorities already specified there. This distinction has been explained
in the continuing chat; the owner then deferred the first two priorities (D546).
The stylesheet split is complete; Leave War/Tracker splits keep their own batches.
The new chat is continuing this same unmerged branch. No layout or implementation design is
approved. Start from the backlog and these priorities, include filed UI faults in
the scope discussion, ask remaining product questions at most four at a time with
recommendations, and show phone/desktop pictures before any visual source change.

## Proposed Tab round — retained for later, 4 Oct 26

The usability/file-splitting distinction above has been explained in the new chat.
Astra proposes settling the concrete Tab request before wider layout choices; Sol's
independent challenge clarified the closed-editor boundary and the final-day exit.
These are recommendations only, not owner answers or an implementation plan:

1. Cover both Edit Schedule's week view and the Scheduler Board. Recommended: both.
2. May Tab open a currently closed text editor? Recommended: no; traverse only
   visible text boxes already available for typing, including empty ones. Keep
   closed editors, folded sections and pop-ups closed.
3. Should Shift+Tab reverse the route? Recommended: left across the row, then to
   the rightmost open text box in the previous row.
4. After the day's last text box, should Tab leave the text boxes for the next
   button or control? Recommended: yes, without looping or changing day.

Ordinary editable week text is already available for typing; clicking places the
caret rather than opening an editor. The Board uses already-present boxes. The
concrete design must still define rows in wrapped phone layouts, section boundaries
and focus after a commit, from the owner's answers. Preserve Enter/Escape, no-op
derived values and D529's silence on unchanged Remarks. D546 defers the first two
earlier priorities, not keyboard/Tab. These four questions remain unanswered;
they can wait until the owner returns. D547 is next.

The wider scope discussion must carry the filed desktop crew-list/header overlap
(`[PALETTE-WRAPPED-HEADER]`, assigned to this batch), blank phone Board in Desktop
layout (`[PHONE-WIDE-BOARD-BLANK]`, medium, non-blocking), and potentially cut-off
phone panels (`[VH-SHEETS-IPHONE]`, low, repair only demonstrated cutoff). These
are existing backlog items; inclusion is not repair or picture approval. No visual
source change before the owner's phone/desktop picture look. Earlier split evidence
remains qualified; the authorized focused diagnostics below do not repeat its gates.

## Heavy investigation — authorized and completed, 4 Oct 26

The owner first asked what substantial work could be done before sleep, then
authorized the proposed investigation: "U can run this yourself I'll sleep now".
Astra supplied the independent scope/order and source analysis; Sol walked the
unchanged frozen app through normal controls. Header overlap and zero-width phone
Board sections reproduced, with minimal repair candidates and resize/recovery
evidence. Eight reachable panel families were checked; type-help placement and
native scrolling were qualified separately. Availability lacked an existing seed
count chip; physical iPhone bars/keyboard remain unverified. No application edits,
automation, repair approval or repeat split gates. Full evidence and future repair
checks: `raptor-port/docs/handpass/2026-10-04-workflow-ui-investigation.md`.
Product choices and phone/desktop picture decisions still precede feature builds.
Claude's full reads remain owed after Monday 19:00.
