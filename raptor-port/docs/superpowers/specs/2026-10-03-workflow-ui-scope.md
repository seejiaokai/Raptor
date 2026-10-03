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
