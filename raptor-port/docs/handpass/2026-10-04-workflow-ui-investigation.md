# Workflow UI investigation — 4 Oct 26

Two existing faults reproduced on the unchanged built app: the desktop crew list
slides beneath a wrapped header, and the phone's Desktop layout collapses the
schedule sections. The smallest repair candidates are below. No repair is built
or approved. The tested panel footers recover through scrolling; actual iPhone
browser bars and keyboard remain unverified.

## Subsequent owner phone check — D547, 4 Oct 26

After seeing picture 3 and the agent's pinned-title/footer proposal, the owner said:
"It's not a problem on the iPhone I could still scroll to reach it". The New input
popup's existing scrolling recovery is acceptable on his iPhone. Withdraw that
proposal and leave the popup unchanged. This owner observation supplements the
original Chromium evidence; it does not assert every keyboard/browser-bar state
or clear the other panels. The two confirmed crew-list/Board faults remain separate.

Independent Astra read of D547's generated short line against its full row and
scope home, complete response (no edits):

> **PASS.** D547's short line faithfully matches the full row and scope note: accept the owner's iPhone scroll recovery, withdraw our proposed popup change, and leave it unchanged.
>
> No broader panel clearance, keyboard/browser-bar coverage, build authorization, or replacement of an earlier owner ruling is implied. No edits made.

Host disposition: accept the bounded correction; no app build or new walk.

**Selected repair — D548:** owner then said "Just fix the desktop layout on a phone.
The rest don't fix it it's fine". Only the phone Board's blank Desktop layout is
selected. Crew-list/header overlap and popup behaviours stay unchanged. Candidate
phone/desktop pictures and an independent plan challenge precede source edits;
this report remains original diagnostic evidence, not a completed repair check.

## Authority, identity and check boundary

After deferring the earlier options1/2 (D546), the owner accepted the proposed
investigation: "U can run this yourself I'll sleep now". This authorizes this run,
not a recurring automation or a visual feature build. D544/D545 remain; their
unanswered product choices wait. Phone/desktop pictures still precede visual edits.

Branch: `codex/workflow-ui`, baseline `686c799534f0e78dc0c3a9f1a69c6c72fb0561a8`.
All834 source/test/script/bundle entries in the split's source freeze matched
before and after this run. Served local assets matched their disk hashes.
The existing built bundle was served at `127.0.0.1:4220`; no build or stylesheet
override was used. Fresh isolated browser contexts, normal sign-in and actual
menu/buttons; no bridge, data injection, force click or production data writes.
Saber admin was the qualifying account. One earlier Ranger-member harness route
was incorrect and gives no member-panel clearance.

**Edit tier: NONE.** Separate targeted diagnostic walk. All eight change questions
are NO: money, issued records, saved data, shared rendering, gestures, surfaces,
roles and warnings have no implementation change. This is not a completed WALK
or FULL repair check. Earlier split gates remain qualified; none repeated.
Astra supplied the independent surface/order plan and source challenge; Sol
walked the frozen app. No writer approval or new code inspection claimed.
The PC lock covered the sequential browser runs and was released at completion;
the dedicated preview was then stopped. Console/page/HTTP-error ledgers were
empty in the completed runs.

## Desktop crew list — confirmed, still open

Normal Edit Schedule page scrolling at1280×560 gives a104px header, z60, while
the crew list sticks at y8, z5. Both ALL AVAIL at y64 and ALL at y83 are covered;
their centres hit the header's controls container. Pointer hover also reaches
that container. This is a current **Saber admin** reproduction, not a claim of
repeating the older Ranger-account setup.

At1600×900 and1440×480 the header is58px and those two controls receive their
own hits. Resizing back to1280×560 restores the104px header and the cover.
The first picture before scrolling is retained; it does not clear the fault.

**Repair candidate:** give the sticky crew list clearance based on the measured
header height, updating when it wraps/resizes or its controls change. Adjust its
available height with the same clearance. Reuse existing measurement machinery
where appropriate; do not hard-code104px or raise the list above the header.
Preserve control sizes, crew scrolling, drag targets and the parked drawer.

Before building: independently challenge the plan, show the owner the candidate
phone/desktop pictures, then add a failing geometry/hit check for this actual
scroll sequence. Verify both placeholders and the final crew control after wrap,
resize, role change, open/park and native scrolling. Keep the declared UI batch.

Pictures: [covered crew list](../img/workflow-ui-investigation/layout-complete/palette-1280x560.png),
[single-row header](../img/workflow-ui-investigation/layout-complete/palette-1600x900.png),
[cover returns](../img/workflow-ui-investigation/layout-complete/palette-1280x560-return.png).

## Phone Desktop layout — confirmed, still open

At390×844, normal layout gives all ten sections346px width. Desktop layout keeps
the wrapper's phone `display:contents` while turning its parent into a horizontal
row. The sign-off and schedule become separate row items: the schedule body is
44px wide, consisting of padding, and all ten sections are **0px wide**. A wrapper's
own zero rectangle is normal for `display:contents`; the children's collapse is
the failure. Normal layout restores all ten346px sections.

At820×700 the wrapper remains `contents` and all ten sections stay0px. At821×700
and844×390 it becomes a flex column and all ten sections are832px. Returning to
390×844 restores the collapse. No zero-width schedule section is a usability PASS.

**Repair candidate:** restore `display:flex` on the wide layout's board wrapper;
retain its existing column direction, flex sizing and min-width/min-height.
The base wrapper is already a column. No normal-phone redesign is needed for
this cause. Astra independently identified this exact missing display override;
the runtime geometry confirms the boundary.

Panning qualification: a native horizontal wheel over the toolbar moves the
outer Board's scrollLeft0→700, exposing the side column, with sections still0px.
Wheel over the main content and a synthetic touch gesture there did not pan the
outer Board. This is not physical-touch clearance. The ordinary layout-menu
route returns to Phone layout, scrollLeft resets to0, and Done closes the Board.

Before building: picture look and independent plan challenge; a failing browser
regression for section widths/visible content, not merely a heading. Walk both
layouts at390/820/821/844×390, resize in both directions, native horizontal pan,
independent schedule/crew scrolling, sign-off above content, return and Done.
Keep the filed WALK repair tier unless a wider actual change raises it.

Pictures: [normal phone](../img/workflow-ui-investigation/layout-complete/board-phone-normal.png),
[blank Desktop layout](../img/workflow-ui-investigation/layout-complete/board-phone-wide.png),
[recovery](../img/workflow-ui-investigation/layout-complete/board-phone-normal-recovery.png),
[above the boundary](../img/workflow-ui-investigation/layout-complete/board-wide-821x700.png),
[panned blank sections](../img/workflow-ui-investigation/reachability-final/board-wide-native-touch-pan.png).

## Panel roll-call — bounded results

Sizes are requested Chromium viewports390×844,390×568 and844×390. Mobile emulation
can enlarge its layout viewport after landscape overflow: the input editor has
inner1035×479 and visual scale0.815. Requested size is not a physical Safari
visible-area guarantee. Raw JSON retains both requested states and actual geometry.

| Surface | Actual route and unit family | What the run establishes |
|---|---|---|
| Traffic | Board Traffic; shared80vh outer box | Opens/resizes/reopens; close receives its own hit at all three sizes. Short body needs no scroll. |
| Schedule input | Board Ground Programme + Inputs; shared80vh | Portrait Cancel reachable. Landscape footer initially clipped; native outer scroll134px makes it hit itself. Ordinary locator click closes it. Subsequent owner iPhone scroll recovery is acceptable (D547). |
| Week calendar | Board calendar; shared80vh | Close reachable; short-height reopening works. This is not a separate calc100vh panel. |
| Day details | View-only day's heading;80vh plus inner62vh | Portrait body scroll0→700, footer stays visible. Landscape inner scroll alone does not move outer box; wheel over its header scrolls outer32px, then Close works. |
| Medical document | Inputs Medical, existing Grit ATT C card; outer80vh/media58vh | Existing document rendered. Portrait Close reachable; landscape native outer scroll66px reveals Close and closes. No medical Next claim. |
| Inputs calendar day | Inputs calendar, existing current-month day | Phone75vh cap, opens/resizes/reopens and closes. Empty-day fixture does not prove a crowded calendar. |
| Inputs people picker | Day + Pucks | Already100dvh on phone, overriding desktop82vh. Title/Cancel fit at844 and568 heights; body scroll and Cancel work. No names selected or saved. |
| Changes | Admin Edit Schedule clock | Phone62vh family, title/close/footer fit; resize/reopen/close works. Empty history; crowded history and Hide/Show were not exercised. |
| Availability | Existing week count-chip door | **UNAVAILABLE:** seeded week has no ALL/ALL AVAIL count chip. Source sizing inventoried only; no runtime clearance or invented fixture. |
| Input type help | Inputs ? |60vh cap with absolute placement; below-screen card after open/resize. Page scroll brings it into view, inner scroll0→416 reaches the final SANS text, outside click closes. Same-? toggle was intercepted after resizing; no trapped-panel claim. |

The type-help card's placement is awkward: at390×568 its top is454 and bottom795,
even though the viewport ends568. Phone rules remove its local positioning ancestor
but retain an absolute top, so the card no longer reliably follows the help button. The height cap alone
does not reserve space beneath the anchor. Recovery is proven; no permanent
cutoff is proved. Carry this observation with `[VH-SHEETS-IPHONE]` and the UI pass.
If repaired, use a viewport-aware anchor and available-space height after the
owner's look; cover below/above placement,700/701, resizing, final text, same-?
toggle and outside/Escape recovery. No blanket vh replacement follows this run.

Shared80vh boxes scroll as whole panels. Initial hidden footers alone did not
prove a defect; the native recovery checks above prevent that false conclusion.
Actual iPhone expanded/collapsed bars, keyboard, long Traffic/medical documents,
crowded Changes/Inputs, availability and the History bubble remain unverified.
History outer sizing already uses100dvh minus clearance, while its inner list
uses40vh; no existing long-history route was manufactured. The notification bell
has **no notification panel**: it navigates or acknowledges with a toast. Tracker
and Leave War sizing are outside this bounded investigation.

## Evidence, orders and failures

Raw results and executed-driver snapshots: `docs/img/workflow-ui-investigation/`.
`inventory.json` retains all834 matching identities. `layout-complete/layout.json`,
`panels/panels.json`, `panels-followup/panels.json`, `reachability-final/reachability.json`
and `editor-control/editor-control.json` carry the qualifying observations.
Driver snapshots contain this PC's original absolute output path and are evidence,
not an automatically scheduled or portable test suite.

Sixteen sequences: desktop native scroll/resize; Board normal→wide→wheel→normal;
wide breakpoint/orientation round trip; native pan→normal→Done; eight separate
panel open→resize→short reopen→scroll→close sequences (Traffic, input, week calendar,
day details, document, calendar day, people picker, Changes); three landscape
footer recovery sequences; type-help page/inner scrolling and outside close.
Availability is a reasoned omission, not a seventeenth completed sequence.

Harness failures are preserved, not app failures: initial driver syntax error;
duplicate nested ALL AVAIL selector; desktop-only menu selector on a phone;
July date assumed in October calendar; nonexistent Changes ID; absent seed chip.
An initial day-detail assertion scrolled only its inner list; recovery required
the outer header. The editor's raw coordinate click did not close at mobile scale;
the final ordinary locator click maps that viewport and demonstrably closes it.
One legend same-button interception remains the qualified observation above.
Raw earlier `HARNESS-FAIL` / `closed:false` records are not rewritten as PASS.

`inspection.json` names exactly34 individually opened qualifying originals and
their SHA256 hashes. Other retained partial/failed pictures are diagnostic history,
not visual clearance. No temporary repair picture is offered as owner approval.
The independent fact-read is retained separately as `2026-10-04-workflow-ui-investigation-read.md`.
The closing document check's output is retained in the evidence folder as `docsize.log`;
its result must be read before the branch is committed.

**OWED: Claude's read after the reset — `codex/workflow-ui`.** The existing split's
plan/code/scenario/walk reads remain owed after Monday5Oct2026,19:00; likewise the
three earlier build branches. Investigation does not spend or replace them.

Rulings: D546 recorded before dependent work; no new standing ruling inferred from
the instruction to run this task. Subsequent D547 accepts the owner's New input
scroll recovery and withdraws the popup proposal. D548 selects only the phone Board
Desktop-layout repair. D549 is next. D544/D545 and D529 remain.

Walk: docs/handpass/2026-10-04-workflow-ui-investigation.md ·34 inspected pictures
·11 walked surfaces ·16 sequences ·MISSING: availability runtime and physical
iPhone bars/keyboard unverified; two confirmed faults filed, no repairs in this
investigation. Subsequent D548 phone-only repair is recorded separately in
`2026-10-04-phone-desktop-board-repair.md`; this original run's evidence is unchanged.
