# Phone schedule Insights menu — proposed build and scenarios

4 Oct 2026 · Astra planner/coordinator under D496. **Awaiting the owner's picture
look and Sol's independent plan challenge; not approved to build.** D557 is a
new proposal, separate from the completed D556 keyboard build. This document
does not reopen its freeze18 evidence or either completed final inspection.

## Authority and proposal boundary

Entry: `codex/workflow-ui`, `8d6ffffe2d8864d0fdc0c257ce46075a5e7a065d`.
Read D557 full/short rows, current workflow handoff, scheduler rules, executor,
Codex review workflow, relevant UI/performance contracts, source and four owner
photos. D557 full/short and its spec/backlog preserve the owner's meaning:
Photo1 supplies the Board menu appearance; Photos2/3 place a new ellipsis after
Highlight on Edit Schedule/View-only Sched; Photo4 removes the drawer's WEEK
heading, Pick a date and Week insights. No Insights arithmetic, editing rights,
Board action, desktop redesign or live release is authorized.

Design home: `../specs/2026-10-04-schedule-insights-menu.md`.
Candidate: `../specs/2026-10-04-schedule-insights-menu/phone-proposal.png`, SHA256
`D5EAAD70CA4AF7B95BCA1BD428B3C43886EC2E8481F719E855E4AA62FF9234E3`.
Independently opened at full resolution: both target ellipses follow Highlight,
both menu items read **Insights**, and the drawer retains Account, role switch
and Logout after removing the Week block. This is a **generated design
illustration**, not a running candidate or saved-data/geometry proof. Incidental
generated schedule/topbar details are not requirements: its View-only example
even contains a non-target + ADD graphic absent from Photo3. View-only stays
read-only; existing Undo/Redo/History controls stay as built.

The picture should present these recommendations together for the owner's look:

1. Phone-only additions at the existing 820px breakpoint; each new menu contains
   Insights alone. Keep desktop's direct Insights action and Board's existing
   menu/actions. Do not copy Sort all or Desktop layout to the week pages.
2. Remove the drawer block completely. Other phone pages consequently reach
   date navigation/Insights through a schedule page; do not silently add a
   replacement shortcut. Both existing schedule calendar icons still open the
   same date picker as the removed drawer button.

These are disclosed proposal details, not recorded owner answers. No further
product decision was found that must be asked separately before showing this
picture. Narrow-screen fit and dismissal mechanics are implementation duties;
escalate only a demonstrated conflict with the accepted appearance.

## Source-grounded implementation, after the look/challenge

| Location | Current behavior and proposed minimum change |
|---|---|
| `src/ui/Shell.tsx:448–495`, `:513–568` | Both memoized week pages render calendar, Highlight, chips and search; Edit adds two export buttons. Insert the same small menu component immediately after `.hl-tog`, before `.hlrow`/`.right`. Use distinct surface IDs, e.g. `editSchedMore`/`viewSchedMore`, and distinct menu/item IDs. |
| `src/ui/Drawer.tsx:75–92` | Delete only Week heading/block and now-unused date/Insights imports. Keep navigation visibility/order, Account, role switch, Logout, scroll lock and outside dismissal. |
| `src/ui/SchedBoard.tsx:71–86`, `:411–423` | Appearance/lifecycle reference only: 30×26 ellipsis, 176px menu minimum, 38px item minimum, outside-pointer dismissal and menu-only Escape. Do not refactor or change Board for this job. |
| `src/ui/scheduler/09-week-responsive.css:34–72` | Phone first line is icons plus search; expanded `.hlrow` alone uses order10/full second line. Add narrowly scoped phone menu styles; preserve that layout and D487 existing button sizes. |
| `src/ui/scheduler/18-oil-board.css:103–117` | Copy the small established visual recipe into week-specific selectors; do not reuse `.sb-*` structure to make week chrome depend on Board layout selectors. |
| `src/ui/WeekCal.tsx:72–96` | Existing view calendar performs date/week load and exact-day landing. No calendar or date-writer change. |
| `src/ui/pops.ts:6–9`, `src/ui/Modals.tsx:193–203` | Invoke existing `setInsights(true); notify()`. No second modal, calculation, new stored flag, history entry or permission rule. |

Prefer one small React child shared by the two week strips (new
`ScheduleInsightsMenu.tsx` plus focused tests), with local open state and refs.
Keep existing memoized Shell chrome and string-built schedule bodies intact.
Because both week sections remain mounted and Shell memo dependencies differ,
the child must observe current page/week/Board/drawer state itself (existing
`useVersion` subscription) or receive complete live props. Do not place a local
open flag in a memo whose dependencies omit it. Avoid a new global popup flag.
Unmount its popup while closed; hidden pages must expose neither an active menu
nor document keyboard/pointer listeners. No dense week rerender for toggling a
menu; no validate, save, command, history or persisted-view work.

Lifecycle requirements:

- Native button, accurate accessible name, `aria-expanded`, `aria-controls` and
  menu semantics. Enter/Space opens; keyboard entry reaches Insights and leaves
  normally. If using `role=menu`, implement its actual keyboard behavior (one
  item: ArrowDown/ArrowUp/Home/End select that item); do not fake a menu role.
- Toggle again, outside pointer, selecting Insights and Escape close the menu.
  Escape consumes only this open layer and restores focus to its visible
  opener. Outside taps must still activate their intended control and must not
  force focus back over that control. Do not use broad click suppression.
- Close/reset on page/week/session change, drawer opening, Board opening and
  crossing to desktop. Returning to the phone/page must not resurrect it.
  Render eligibility must suppress stale open state before effect cleanup.
- Opening Insights closes the small menu first. Preserve ordinary focus access
  into the existing modal and back to a connected, visible opener on dismissal;
  avoid restoring focus to the removed menu item. Inspect current modal keyboard
  handling before choosing a local adapter; do not broaden this into a modal
  rewrite. Do not override another deliberate navigation/focus action.
- Never intercept schedule typing, Enter/Escape or Tab routing. A tap from a
  dirty editor naturally blurs through the existing writer before opening the
  menu; do not commit manually or add a duplicate writer. D529 unchanged Remarks
  silence, Mission-role behavior and all freeze18 keyboard outcomes stay intact.

## Phone width risk and visual requirements

Current `.filters>*` are nonshrinking; phone input width is96px with15px icon,
6px gap, horizontal padding16px and borders. Edit adds two export buttons with
normal `.abtn` padding. Adding30px plus a5px gap can force search onto another
line around320–375px; the generated500px panel is not proof it fits. Measure
actual boxes at320,360,375,390,820,821 and1440, plus844×390 short landscape.
Keep existing buttons unchanged and the search on the first row. If necessary,
allow **only the search wrapper/input** to take remaining width (`min-width:0`
and a measured flexible basis), retaining a useful editable area. No clipping,
overlap, sideways page scroll, invisible hit target or hiding the export icons.
Do not silently change placeholder wording or button sizes to force a pass.
The expanded Highlight strip must still be the only second row.

The popup must overlay Legend/schedule rather than push content down, remain
inside the viewport at both page placements, and stay below real dialogs/drawer.
Check stacking against the legend and sticky header with `elementFromPoint` and
actual clicks. Reuse spacing/colors/radii and focus indication from the Board;
scope CSS to these week menus. Preserve D549 phone Desktop Board repair and
D547/D548 leave-it decisions. Do not alter root themes, dense schedule CSS,
engine bodies, protected working guides or reference/baseline directories.

## Planned check tier and independent roles

**WALK**, based on the proposed production diff. Eight answers:

| Question | Answer/reason |
|---|---|
|1 Money/entitlement | No: navigation only; no totals, work hours or earned leave changed. |
|2 Published record | No: only open the existing modal; no issued/working selector or publish/signing code changed. |
|3 Saved data | No: component-local popup state; no schema, persisted record or reset-data change. |
|4 Shared drawer/drawing | Yes: remove a shared drawer block and add shared week chrome. |
|5 Gesture/control | Yes: two new openers and their menu dismissal/keyboard behavior. |
|6 Surface | Yes: small new popup on both existing week pages. |
|7 Roles/access | No: same Insights available to every existing viewer; Edit Schedule remains admin-only. Tests prove preservation; no role gate changes. |
|8 Warning list/rules | No: neither warning computation nor rendering changes. |

Re-answer if the implementation crosses those bounds; WALK is not permission to
change data/roles under a smaller tier. D481 itself classified a new Insights
door as WALK. Plan review is Sol's; implementation/fixes are Sol's; final code
inspection is a separate fresh Astra session. This author never approves this
plan. Claude's post-reset branch/plan/code/scenario reads remain OWED after
Monday5Oct2026 19:00 Singapore time, before main. No merge/main push or merging PR.

## Roll-call and named proof, planned not run

| Surface/role | Required result |
|---|---|
| Edit week, admin | Phone menu has Insights only; desktop direct door retained. Exports/Highlight/search/calendar unchanged. |
| View-only, admin/member/admin-as-member/guest | Same phone Insights route; no edit/sort/layout action; published/draft view unchanged. |
| Board, admin, phone and wide-phone/desktop | Existing overflow/direct Insights, Sort/layout/Done and calendar work; no new week menu above Board. |
| Drawer, each role, from schedule and Inputs/Leave War/Tracker | Week block absent; existing permitted pages and Account actions retain order/operation. Navigate to View-only to reach calendar/Insights. |
| Other pages, desktop | Direct global Insights action unchanged; no week-specific menu appears. |
| Insights and date picker | Existing shared dialogs, data/context and dismissal; no duplicate window or stale hidden menu. |

- **MENU01 placement/fit:** both page menus at phone widths; first-line search,
  exports, expanded Highlight row, popup hit testing, no clipping/overflow;
  desktop hiding and unchanged desktop/Board geometry.
- **MENU02 open/close orders:** open→toggle; open→outside; open→Escape;
  open→Insights→close→reopen; keyboard open→item→dismiss; repeated taps. Menu
  closes alone, no day change, no stale focus/listener or background action.
- **MENU03 navigation/reset:** menu→calendar and calendar→menu; menu→Highlight
  and Highlight→menu; search→menu and menu→search; open→drawer/page/week/Board/
  desktop resize/sign-out→return. Exactly one active menu, empty hidden surfaces.
- **MENU04 drawer/roles:** role matrix above; Account switching/logout unchanged;
  all drawer shortcuts removed; member and guest can reach View-only Insights
  without exposing Edit Schedule. No need to walk every unrelated page's body.
- **MENU05 read-only downstream:** on a fixture containing issued content plus
  unpublished changes, open new Edit and View-only routes and compare shared
  Insights values/context with the existing desktop/Board route. Check before/
  after saved schedule, history and issued state unchanged by open/close. Test
  draft context too. Retain current Blue/Red totals and Show all behavior; no
  recalculation redesign or repeated exhaustive mission-mix audit.
- **MENU06 editing isolation:** dirty edit→menu saves once through normal blur;
  unchanged Remarks→menu is silent; menu close→resume typing preserves existing
  Enter/Escape and Tab outcomes. Keyboard menu navigation must not invoke the
  schedule text collector. Focused smoke of existing tests, no third reinspection
  of the unchanged completed Tab artifact.
- **MENU07 retained date route:** both calendars still pick an exact day across
  a week boundary and Today; view remains the same page. Board calendar remains
  Board context. Escape/cancel changes no date. This proves removal of the
  duplicate drawer door did not remove date navigation.

Failing-first tests should extend/reuse `src/ui/odds.test.tsx` (replace the
deliberately removed drawer-door expectation and drive Today from a surviving
calendar), `editweek.test.tsx`, `hlfold.test.tsx`, `topbar-pair.test.tsx` and the
new menu component tests. Reuse `mission-role-offer.test.tsx` Board-door guards,
`insights-published.test.tsx`, `outside.test.tsx` and existing schedule-tab tests.
Add real browser cases to already-registered `e2e/insights.spec.ts` and relevant
`e2e/geometry.spec.ts` groups; current Playwright `raptor` testMatch is an explicit
name list, so a new arbitrary filename would not run automatically.

Focused commands after implementation (not run in this proposal turn), from
`C:/Users/User/projects/Raptor/raptor-port`: `npx vitest run` with the above
specific changed/affected test paths, then `npx playwright test e2e/insights.spec.ts
e2e/geometry.spec.ts --project=raptor` with a precise menu/retained-route grep
while fixing. Final applicable standing gates remain mandatory; D499 only
avoids duplicate identical runtime scenarios across widths. Use existing
Playwright helpers/setup, built bundle and PC gate lock for heavy runs. Do not
reuse stale served assets or count browser captures not opened. Capture distinct
phone Edit/View menus, updated drawer per distinct role layout, narrow/short
screens and desktop preservation; inspect every saved image. Phone emulation is
not physical iPhone Safari proof. Record actual results, errors and omissions in
a new evidence sheet, never in the completed Tab freeze/briefs.

## Records and stale references to reconcile on authorized build

- Update `ui-contracts.md` D557 proposed/current distinction when built, and
  `feature-impact.md` navigation/flow coverage; file-map for the new component.
- `Drawer.tsx:75–87` and `09-week-responsive.css:90–109` currently say phone
  Insights lives in the drawer; they need D557-aware correction with the build.
  `Shell.tsx:518–521` calls Highlight the last fixed icon: qualify after ellipsis.
- `odds.test.tsx:84–100` intentionally asserts/uses the removed calendar door;
  replace its purpose with drawer removal plus surviving calendar proof, not a
  weaker assertion. Preserve the date-picker Today check.
- Historical CSS-split walk helpers use `drawerPickWeek`/`drawerInsights`;
  do not rewrite frozen historical evidence. Any reused new walk helper must
  take the accepted new route and still exercise the real visible control.
- IT guide `scripts/itflow/j/read.mjs:43` and `content.mjs:301` picture the old
  drawer date door. **D403 says no automatic re-shot, rebuilt guide or new filing**;
  mention that the guide shows the older route once if useful. Do not edit those
  artifacts under this proposal or invent a guide-refresh job.

Current turn: source read and synthetic picture inspection only; no runtime
walk, production changes or gates. Only this new plan is writable by this agent;
document check follows saving. Rulings: D557 independently checked; no new owner
decision inferred or recorded by the planner.
