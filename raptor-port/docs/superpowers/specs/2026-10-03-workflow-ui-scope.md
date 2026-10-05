# Workflow UI scope — 3 Oct 26

## Owner authority

D540: the Insights build is complete and preview accepted by the owner ("Looks good").
No further work on that branch except rulings. Start `codex/workflow-ui` from
the refreshed `codex/insights-mission-mix`; merge `origin/codex/rally-workspan`
and `origin/codex/discard-marks-remove` before moving any stylesheet rule.
Keep those three built branches separate for Claude's review. Report conflicts
in plain words. No main push, merge into main or merging PR.
*(D589, 5 Oct 26: the built branches are no longer reviewed separately — Claude checks
the whole stack once, on `claude/codex-stack-review`, and it goes live on one "merge live".)*

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
D550–D553 now settle both surfaces, available text only, reverse Shift+Tab and
the final-day exit. D554 selects B for flight details; D555 settles open headings,
notes and continuation through the displayed section order.

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

## Tab round — answered D550–D553, 4 Oct 26

The usability/file-splitting distinction above has been explained in the new chat.
Astra proposes settling the concrete Tab request before wider layout choices; Sol's
independent challenge clarified the closed-editor boundary and the final-day exit.
The retained recommendations below are now accepted by the owner, "all four
recommended", after the closed-editor boundary was explained. They settle these
four choices, not a complete implementation plan:

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
earlier priorities, not keyboard/Tab. Answers: D550 covers both surfaces; D551
uses only text boxes already available for typing, including empty ones, leaving
closed editors, folded sections and popups closed; D552 reverses the route with
Shift+Tab; D553 exits the day's last box to the next ordinary button/control
without looping or changing day. Enter/Escape and D529 remain binding. The later
D554/D555 answers below complete the product scope.

Read-only Astra orientation found a remaining product ambiguity: the week stacks
Callsign/Mission in one column and Brief/Take-off in another, whereas the Board
runs those fields across a strip and moves some fields below it on a phone.
The four answers did not decide Callsign→Brief versus Callsign→Mission. The shown
comparison and subsequent D554 settle that flight sequence as B. D555's subsequent
"Yes" settles the supporting text and displayed section continuation. The retained
recommendation includes the symmetric ordinary-control reverse exit; this was not
inferred from B selection alone.
Section order is user-controlled and must follow the displayed arrangement.
This is source orientation, not new runtime proof or an agreed route.
The concrete candidates and preservation detail are in
`raptor-port/docs/superpowers/specs/2026-10-04-schedule-tab-route.md`.
**D554, 4 Oct:** owner says "lets do B flow" after seeing the comparison. Use Callsign
→ Mission → Brief → Take-off → Landing → Remarks → stores text on both screens,
with Shift+Tab in reverse. This narrows D545/D552's literal spatial reading: the week
goes down to Mission first. Shared week formation details occur once; existing Board
aircraft-row boxes are all visited. Supporting headings/notes/section boundaries are
settled by D555: owner says "Yes" to including open headings and notes through the
displayed section order. D550–D553's other boundaries and the accepted repair remain
binding. Product scope is complete; independent plan/challenge precedes the build.

**Owner picture request, 4 Oct:** numbered actual-app examples now show every affected
open section on both pages. [Week sequence](2026-10-04-tab-flow-pictures/week-flow.png)
and [Board sequence](2026-10-04-tab-flow-pictures/board-flow.png); the flying examples
also have phone variants in that folder. Numbers restart per section; other rows
repeat before the final section notes. These are design pictures, not proof of the
new keyboard behaviour. No source/test change is made in this picture turn.

The owner's subsequent `/impeccable` and "u can use impeccable to help think of
this too" authorize using the installed guide for this keyboard design work.
They do not authorize changing working guides, button sizes, other UI behaviours
or the accepted phone Desktop repair. No skill update or broad redesign is implied.

The wider scope discussion must carry the filed desktop crew-list/header overlap
(`[PALETTE-WRAPPED-HEADER]`, assigned to this batch), blank phone Board in Desktop
layout (`[PHONE-WIDE-BOARD-BLANK]`, medium, non-blocking), and potentially cut-off
phone panels (`[VH-SHEETS-IPHONE]`, low, repair only demonstrated cutoff). These
are existing backlog items; inclusion is not repair or picture approval. No visual
source change before the owner's phone/desktop picture look. Earlier split evidence
remains qualified; the authorized focused diagnostics below do not repeat its gates.

## Owner phone check — D547, 4 Oct 26

After seeing picture 3's New input popup and the proposed pinned title/action row,
the owner said: "It's not a problem on the iPhone I could still scroll to reach it".
The existing scrolling recovery is acceptable on his iPhone. Withdraw this popup's
proposed change and leave it as it is. This is an owner device observation, not an
agent-run check of every keyboard/browser-bar state or clearance for other panels.
The wider phone-panel item retains its bounded scope and remains open for other
demonstrated problems; the two confirmed crew-list/Board faults remain separate.

## Selected repair — D548, 4 Oct 26

Owner: "Just fix the desktop layout on a phone. The rest don't fix it it's fine".
Only `[PHONE-WIDE-BOARD-BLANK]` is selected for repair. Leave the crew-list/header
overlap and popup behaviour unchanged; D547's New input scrolling is acceptable.
This is the scope of the three investigated behaviours, not cancellation of all
earlier keyboard/backlog work. Restore the existing Desktop layout's schedule
content on a phone, preserving sideways navigation, return to Phone layout and
Done. No redesign or picture-gate waiver inferred: candidate phone/desktop pictures
and independent plan challenge preceded visual source changes. The selected
single-property restoration is built and checked separately:
`raptor-port/docs/handpass/2026-10-04-phone-desktop-board-repair.md`. Normal phone
and desktop layout preserved; other two behaviours unchanged. Fresh independent
code read/branch shipping status and physical-device limits are in that sheet.

## Owner repair look — D549, 4 Oct 26

Owner: "looks good, whats the next task", after the repair preview was delivered.
The owner accepts the phone Desktop layout repair preview. Owner-look step passed;
no device-specific Safari verification or broader UI approval is inferred.
Preview: https://raptor-7q0tkgdev-kai-e2f5.vercel.app, Ready for the reviewed repair
commit063806c7d2240322c1615c24a1635aa4177199ae. Claude's Monday read and an explicit
"merge live" remain owed before main. D547/D548's other-behaviour leave-it and
D544/D545's keyboard task remains pending (four choices later settled by
D550–D553); asking what is next
does not approve another feature's design or authorize its implementation.

Subsequent task instruction: "ok shall we hand off to a next chat to build this?"
Create a fresh local chat continuing `codex/workflow-ui`, without a new worktree.
Its task is the pending D544/D545 keyboard/Tab flow. The four product choices
were unanswered at handoff and have since been settled by D550–D553; finish the
concrete routing discussion, then plan and build under D496. The handoff request
itself did not answer the choices or waive pictures/checks/reviews.
Other behaviours left unchanged by D547/D548 remain so. No other batch starts.

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
