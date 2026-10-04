# Phone Desktop Board repair — 4 Oct 26

Author: Astra, planning and independent scenarios under D496. Sol must independently
challenge this plan before implementing; a fresh Astra reads Sol's final snapshot.
Source baseline: `codex/workflow-ui` at `e9d6ea62c7ff4a70be5d9f315b90913124e0653b`.
The concurrent uncommitted D547/D548 filing is owner-ruling documentation, not source
implementation. Product authority: the scope spec's **Selected repair — D548** at
`../specs/2026-10-03-workflow-ui-scope.md`.

## Authority and exact scope

Owner: "Just fix the desktop layout on a phone. The rest don't fix it it's fine".
Restore the existing Board Desktop layout's schedule content on phones, keeping
sideways navigation, return to Phone layout and Done. Do not repair the crew-list
header overlap, popups, type help or unrelated keyboard work. D547 accepts the New
input popup's existing scrolling. No data, role, engine, control-size or broad
responsive redesign belongs here.

D138 independent meaning read: **PASS**. Astra compared D548's generated short line
in `.claude/rules/decisions/scheduler.md` with its full row in
`.claude/decisions-full/scheduler.md`. Both authorize only this Board repair and
leave the other investigated behaviours alone. The full row correctly limits
"the rest" to this discussion; it does not cancel D544/D545 or waive checks.

D541 requires a picture before a visual build. Before source edits, show the owner
clearly labelled candidate phone and desktop pictures of this restoration. A
temporary browser-only style on the unchanged bundle may produce the candidate;
it is neither production verification nor owner picture approval. D548 already
authorizes the restoration, so showing this bounded candidate does not require a
second permission request. Any further design choice stops that expansion. Record
the picture presentation and independent candidate inspection before building.

## Cause and smallest implementation

Investigation: `../../handpass/2026-10-04-workflow-ui-investigation.md` and its raw
evidence. At widths up to820px, phone CSS leaves `.sb-boardwrap` as `display:contents`.
Wide mode makes `.sb-main` a horizontal flex row but never restores the wrapper's
display. Sign-off and schedule become sibling row items; all ten sections collapse
to0px. Above820px, the base flex column works; normal phone layout also recovers.

In `src/ui/scheduler/13-board-rows-responsive.css`, add only `display:flex` to
`.schedboard.sb-wide .sb-boardwrap`. Keep its existing direction, flex sizing,
min-width/min-height, wide minimum width, sidebar and overflow declarations.
Do not alter normal phone `display:contents`. The base wrapper already supplies
`flex-direction:column`. If this alone fails required usability, preserve the
failure and return the smallest additional proposal for independent challenge.

## Risk answers and role matrix

**Tier: WALK.** 1 money NO; 2 publishing/issued records NO; 3 saved data NO;
4 shared rendering YES, every Board section depends on this wrapper; 5 mode YES
conservatively, the existing Desktop mode's usable layout changes; 6 new surface NO;
7 permission rules NO; 8 warning meanings NO. Only layout is changed.

Admin and a scheduler-capable role use the normal Edit Schedule date/Board door.
Actual member/read-only and guest routes are exclusion checks: they must not gain
that door. `interactions.ts` gates it through `canEditSched()` and Edit Schedule;
do not bypass that gate to claim member Board coverage. Preserve existing issued
view disabled controls. No new publication or record mutation is needed to prove
this CSS repair; inspect an existing issued view where the fixture provides one.

## Independent roll-call and scenarios

1. Before repair, add a failing browser regression using normal sign-in, Edit
   Schedule date, Board and its More menu. At390x844 choose Desktop layout; assert
   every one of the ten named sections has nonzero usable width and a real row can
   be seen after ordinary navigation. A heading/class alone cannot pass. Retain red
   output and picture. Pin unchanged normal-phone and desktop geometry first.
2. Walk normal/wide at390x844 and390x568,820x700,821x700,844x390 and1280x700.
   Resize wide in both directions across820, return to Phone layout, then Done.
   Assert content widths, first/last content, sign-off above schedule and edge
   controls. Desktop normal appearance must retain its pre-repair geometry.
3. Pan horizontally both ways. Assert named schedule and side-column targets move
   into view and receive their own hits. Drive Chromium touch events and wheel;
   a changed scrollLeft alone is insufficient. Preserve failed touch evidence;
   Chromium emulation cannot establish physical iPhone Safari touch behaviour.
4. Scroll schedule and crew independently to their final items. Operate the layout
   menu, return and Done; navigate days before/after switching layouts. Check the
   populated fixture's existing section kinds, warning chips, long content and
   working/existing issued views. Record any absent fixture state explicitly.
5. Roll-call: sign-off, all ten schedule sections, side/crew column, toolbar/menu,
   Phone return and Done; give each visible/usable/overlaid results. Ordinary week,
   member and guest routes are unchanged/excluded for the reasons above. Shared
   functional proof may be reused per D499; width-specific geometry/doors may not.
6. Break the restored display once in a disposable browser override and require
   the named geometry/content regression to fail. Restore the exact build for the
   qualifying walk. Keep separate red/break/final output folders and inspect every
   counted original picture. A temporary candidate/break override is never final
   build evidence. Retain all failures and distinguish harness failures honestly.

## Gates, evidence and completion

Sol runs focused regression while iterating, then the retained five gates on the
final change: unit suite, build, reference assertions, browser suite and Tracker
smoke. UI work also retains relevant probes, all adapted probes, performance,
rulecheck and docsize. Take the PC lock for broad runs and release it afterward.
Do not repeat the completed stylesheet-split checks as a separate job; these are
the checks owed by the new repair. Do not weaken tests or broaden a failing repair.

Walk the exact final production build with errors watched. Record tier, rulings,
roll-call, named action orders, red/break proof, inspected pictures, gate results,
omissions and dispositions in a new repair evidence sheet. Sol challenges this
plan; a fresh Astra independently inspects final code with that sheet (D496).
No self-approval, no main push/merge or merging PR. **OWED: Claude's read after the
reset — `codex/workflow-ui`, Monday5Oct2026,19:00 Asia/Singapore.** Existing split
and earlier-build reads remain separately owed. Finish with the required Walk,
Docs/docsize and Rulings lines; branch shipping remains the host's responsibility.
