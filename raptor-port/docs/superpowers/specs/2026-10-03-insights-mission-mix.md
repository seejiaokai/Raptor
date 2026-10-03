# Insights mission mix — design in progress, 3 Oct 26

Status: D512–D519 settle categories, formation scope, conditional question and no extra role label. Question lifecycle,
complete visual design and Board entry placement await his look;
no application code is built here. Astra plans under D496; Sol independently challenges before building. Claude's further
plan/code read after Monday 5 Oct 26, 19:00 is owed before main. No merge/main push.

## Current owner direction — D517–D519 supersedes the control proposals below

The whole formation is on one side (D517). Mission names DS, RED and RED AIR count red without asking (D518).
For another Mission, such as ACM, DS or RED in any aircraft's Remarks triggers a Blue/Red role question for the
formation; the cue does not decide the answer. Other eligible sorties without a cue stay blue. Do not ask again
about per-aircraft scope or a permanent/every-Mission-focus choice. D519 rejects any extra Red indicator on schedule
lines: the scheduler's Remarks are sufficient. Preserve existing mission-type dots, scheduler red flags and warnings.
Revise the picture to show only the conditional question, no line marker. Answer retention/reset, question timing,
cancellation and the complete visual look remain to bind before the new-chat build (D515). The saved choice makes
the eventual batch FULL tier; the earlier provisional WALK is superseded. Earlier mockups/read responses are historical
exploration, never implementation requirements. This section governs every older proposal/pending statement below.

## Planning here, build in a new chat

D515 (3 Oct 26): settle all Insights product questions and the firm plan in this chat; build only in a new chat once
the plan is agreed. The owner then asks to see how the proposed Blue/Red choice would look and is concerned that extra
controls could disrupt scheduling. This requests a design picture, not approval of that choice. Show a minimal change
within the existing flight editor before asking him to accept it; keep automatic named Red/DS classification as the
alternative. His reply that he answered in chat mode supplies no actual yes/no in the accessible transcript, so do not
infer a category-control approval or repeat the same question before showing the requested picture.

## Approved and preserved

- D512/D518: the existing Flying load · sorties this week chart splits each person's total bar into blue and red segments.
  Named Red/DS/Red Air missions are red; other missions are blue except an answer from the conditional question.
  Both segments show for a mixed person. D517 formation scope and D519 no line label apply.
- D481: the Scheduler Board gets an Insights opener. The proposed positions are beside the bell on desktop and in ⋯
  on a phone; the owner asked to see their placement first.
- D478: each day uses its latest published version, or the working copy only while not yet published. A waiting edit
  changes no published-day figure until issued. D482: current Logic rules still affect work hours at once.
- Existing weekly sortie eligibility, aircraft/crew counting, cancellations, standalone exclusions, person identities,
  roster handling, work hours, earned leave and permissions retain their meanings.
- D516: SC, AVALON and BB standby duties are excluded from flying load; SC main counts towards work hours. A standby
  duty must not become a blue sortie through the default category. Verify the current computation against these
  constraints; do not infer a new rule for other duties' work hours or earned leave.

## Owner's reference and next step

The supplied phone picture shows the existing Insights four tiles, weekly sortie bars, top-twelve list and work-hours
bars. It is the placement reference, not evidence that any proposed mix matches those people's actual missions.
Prepare a phone/desktop picture in the app's existing style with illustrative mixed/all-blue/all-red bars and a clear
legend. Exact bar colours, visible split counts, the expansion control's appearance/behaviour and mission-word matching are implementation/design
proposals until the actual names are checked and the useful product choices are settled. Do not add new periods,
filters or hours metrics without an owner choice. Link the finished proposed picture and Astra/Sol disposition here.

Backlog: `[INSIGHTS-MISSION-MIX]`, with `[INSIGHTS-BOARD-DOOR]` in `[FEATURE-WISHLIST]` item 3.

## Proposed picture and pending answers

Actual-app design overlays: `../../img/insights-proposal/sorties-phone.png`, `sorties-desktop.png`, `board-phone.png`,
`board-desktop.png` in that same folder. These show temporary DOM overlays on the existing local production bundle,
not built application behaviour. The twelve sortie totals are retained, but the blue/red splits are illustrative
(Relay 2+2, Echo 0+3, Hex 3+0, Static 2+1, Ace 1+1; remaining rows all blue). No missions or saved data were edited.
The source generator and measured layout results live beside the pictures. The proposed Show all control and Board
opener are inert design controls. Phone390×844 and desktop1440×1000: no chart horizontal overflow; proposed Board
controls within viewport; zero page errors. All four final pictures opened by Sol. No app gates or feature pass claimed.

Two product questions were presented together. D513 answers the second: initial12 plus Show all.
For the first he explained the directional ambiguity (D514): DS for another formation means our flight is red air,
but a DS reference can describe external support coming to us. Real demo Mission boxes are BFM/SAT/ACM/AD; the
RED AIR / DS FOR VL examples are only in remarks. He asks whether Remarks should classify the sortie; this is a question,
not approval of a parser. Host recommends keeping Remarks free and not inferring a category from them.
That former follow-up is answered by D517–D519: ACM/BFM can count red through the conditional question, formation-wide,
without a permanent field or new line label. Do not repeat the superseded control/scope questions.

The visible proposed count line is `2 blue · 2 red`, total at right, blue then red; ordering stays descending total.
Work-hours appearance and meaning stay unchanged. Weekly scope and sortie-count metric are already supplied by the
owner's target; do not put them back as questions. Complete visual look and Board positions still await his picture look.

## Astra proposal and Sol challenge — not build approval

Full independent Astra response, including its D512 short/full meaning PASS:
`../plans/2026-10-03-insights-planning-read.md`. Sol's challenge accepted the one-world aggregate approach and the two
bounded product questions, with these constraints before implementation:
- Category counters must be incremented in the same eligible-aircraft/occupied-seat traversal as current totals.
  Blue+red=n for every person, including the existing same-person-two-seats case; do not silently deduplicate.
- Pending mission changes on a published day must not leak into the split. Test the real Original → pending → AL
  path, plus unpublished neighbours and earlier-version preview. Keep current callsign labels over stable ids.
- Proposed controls must actually work in the final build; a screenshot of an inert overlay is design only.
  Short-screen sizing, accessible counts/legend, all-blue/all-red/empty cases, list expansion and every opener route
  need live operation and hit testing. Phone menu label must include Insights and close before opening the window.
- Re-answer the eight tier questions against the final diff; provisional WALK is for a derived chart/new opener
  that changes no issued-record writer, saved shape, authority, earnings or warning calculation. Any changed boundary
  widens the tier. Keep all standing gates and required fresh Astra inspection; Claude's further read remains owed.
- Keep an independent Insights branch based on the committed planning notes, with no selected Rally fixes copied in.
  Its work hours initially retain that baseline's behaviour. Integrate the complete reviewed timing work only in the
  eventual authorized integration order with explicit rechecks; never describe this isolated preview as containing Rally.

The D518 saved Blue/Red choice supersedes the earlier provisional WALK proposal: saved data/issued
record boundaries make the build FULL. Read schema/model/undo contracts and applicable full rulings before designing it.

Current session tier: NONE (documents and design overlays; all eight application-risk questions NO because no application
source/behaviour changed). Design checks above are proportionate D499 checks, not an application bug check.

Later D513/D514 independent short/full/home comparison PASS, with complete response retained separately in
`../plans/2026-10-03-insights-follow-up-ruling-read.md`. Its clarity finding is corrected above: Show all itself is
approved, while the control's appearance/behaviour remains a design proposal. D517 subsequently settles formation scope;
D518 selects the conditional question only, and D519 rejects the proposed line label.

## Historical minimal-control pictures — superseded by D518/D519

New independent coordination/source/meaning response and Sol challenge:
`../plans/2026-10-03-insights-control-options-read.md`. D515–D516 short/full/home comparison PASS. Mission is formation-wide;
its repeated Board boxes write one value. Remarks are aircraft-specific. The requested picture remains an exploration.

- Option A, always visible: `../../img/insights-proposal/mission-visible-phone.png` and `mission-visible-desktop.png`.
  A small Blue/Red choice sits below Mission. It adds row height in these samples (10px phone,7px desktop).
- Option B, editing only, recommended for workflow: `mission-quiet-phone.png` / `mission-open-phone.png` and the
  corresponding desktop pair in that folder. Normal Mission text/box/row size stay unchanged, with a small Red label
  for the illustrative explicit exception; a compact choice appears during Mission editing. The panel says "For this
  formation" as an explicit proposed scope, not an approved requirement. Both repeated boxes show the same example.
- The earlier named-Mission-only alternative is superseded by D518's conditional-question direction.

`mission-choice.cjs` / `mission-choice-result.json` retain the DOM-only prototype and checks. Phone390×844,
desktop1440×1000 and narrow320×568: quiet box width/row height and Mission text unchanged; popup inside viewport;
prototype toggles work; zero page errors; all nine final pictures opened. The existing bundle's14px-wide Mission box
at320 is already cramped before overlays; no readable narrow-editor approval is claimed. Phone virtual keyboard and
direct typing/Tab, saved-category/issuing/Undo and Edit Schedule's proposed control are unproven and belong to the build.

Those two product questions were answered: D517 one formation role; D518 conditional question, neither constant nor
every-Mission-focus control; D519 no extra line label. Earlier pictures show the exploration, never the chosen design.

## Earlier floating question picture

`../../img/insights-proposal/conditional-normal-phone.png` and `conditional-question-phone.png` retain an earlier proposal;
desktop and short-screen pairs, `conditional-role.cjs` and `conditional-role-result.json` live in the same folder.
Illustrative first-aircraft Remarks are DS FOR RU, existing Mission BFM. A compact question identifies formation VL,
asks Blue or Red without choosing an answer, and adds no line marker. Phone390×844, desktop1440×1000 and short390×568:
Mission text/box/row size unchanged, panel on-screen, both DOM-only buttons operate, zero page errors. All six opened.
No saved role, typing/Tab, phone keyboard, issuing or Edit Schedule control proof is claimed; this is tier NONE design.
The Mission-anchored popup covers written Remarks in the phone sample, so it is replaced by the placement proposal below.

## Current after-edit question picture and pending lifecycle

Owner requested a picture of the after-edit, nonblocking question; timing/placement is a proposal, not a new ruling.
`../../img/insights-proposal/remarks-normal-phone.png` and `remarks-question-phone.png` show the normal and question states;
desktop and short-screen pairs plus `remarks-bubble.cjs` / `remarks-bubble-result.json` are in that folder. A compact
"VL: Blue or Red?" question sits AFTER the formation's AREA strip, outside its aircraft rows, with both Remarks visible.
It adds temporary vertical space and moves following content down; either illustrative answer removes that space.
No extra line indicator or permanent choice is added. Formation scope and cue rules remain D517–D519.

Proposal: open only after leaving the completed relevant edit AND its tap/Tab transition finishing; no focus theft,
rebuilding the next editor, typing-pause prompt or automatic scroll jump. Announce a below-viewport question accessibly;
preserve focused field and scroll while opening/removing it. Large formations may require ordinary scrolling to reach it.
Saving/cancel/repeat/correction choices below remain pending and are not decided by this picture.

Design-only checks: phone390×844, desktop1440×1000, short390×568; Mission text/box and aircraft row heights unchanged,
question below Remarks without overlap, next-field focus preserved after prototype Tab, both DOM-only answers remove
the question, zero page errors. All six final pictures opened; short-screen picture manually scrolled to show Remarks
and question together. No phone keyboard, real edit lifecycle, saved role, Undo, issuing or source-build proof is claimed.
Independent placement recommendation and Sol challenge: `../plans/2026-10-03-insights-remarks-placement-read.md`.

Three owner lifecycle choices are pending: ask after finishing the relevant edit and remember until Mission/support
wording changes; closing without answering keeps newly typed wording in the editor UNCOMMITTED versus cancels that
edit; a temporary Change mission role action while editing relevant Remarks for corrections. No retention/cancel choice
is assumed from the direction ruling. If wording is retained, it must remain an edit buffer, never silently saved as
an unanswered new category. Complete chart/Board placement look still pending before the firm plan/new-chat build.

Independent coordinator responses and Sol challenge/disposition:
`../plans/2026-10-03-insights-conditional-role-read.md`. D512/D514/D517–D519 short/full/home comparison PASS after the
D512 operative sentence was corrected; conversion clean. D56 permits unchanged pre-field stored demo formations to use
the Mission default without retroactive cleanup or accuracy claims for their ambiguous Remarks. D478 forbids recolouring
an issued day from a new working answer before its AL. This old-data exception never covers NEW imports/templates/copies:
every forward writer obtains or carries a valid answer before committing a new ambiguous formation. The FULL plan
must cover canonical role comparison/restoration, one Undo action, central writers, copied context and issued snapshots.
