# Schedule Insights menu — accepted phone navigation, 4 Oct 26

**D557: new direction filed; design pictures precede production changes.**
Owner proposes removing the phone side drawer's WEEK heading, Pick a date and
Week insights, moving Insights into ellipsis menus in the circled schedule
toolbar spaces. This is separate from the accepted/built D556 keyboard route.
At proposal time no unseen picture, application build or live merge was approved.

**D558: "Looks good" accepts the corrected pictured proposal and authorizes its
build.** The phone-only820px boundary, Insights-only menus, surviving calendar
date route and removal of the drawer shortcuts on every phone tab are accepted.
The immutable Astra plan is `../plans/2026-10-04-schedule-insights-menu-plan.md`,
SHA2569A2DC60275DEEA3A83ECC65A74A0C625C8604E933385632102DC324E490E7262;
Sol's independent challenge is PASS. This acceptance fulfills its product/picture
prerequisite without rewriting either review artifact. Source build is complete;
no public picture publication or main/live approval follows.

## Photo mapping and concrete proposal

| Owner photo | Role | Proposed change |
|---|---|---|
|1 | Existing Scheduler Board overflow example | Use its ellipsis and popup appearance as the reference. |
|2 | Edit Schedule phone toolbar | Add ellipsis after Highlight, before the search area; menu item Insights. |
|3 | View-only Sched phone toolbar | Add ellipsis after Highlight, before the search area; menu item Insights. |
|4 | Phone side drawer | Remove WEEK heading and its two buttons; Account follows page navigation. |

All four owner originals, generated candidates and exact built-in-tool prompts
are retained privately outside this repository under the current local task's
visualizations folder, `schedule-insights-menu/`; no CLI/API fallback used.
Originals remain `owner-photo-{1,2,3,4}.jpg`, in that exact order, not public
branch assets. Frozen plan/challenge relative paths identify local review
history only; [privacy disposition](2026-10-04-schedule-insights-menu/privacy-disposition.md)
explains the retained location and text-only branch shipping boundary.
The first candidate is retained, with its incidental View-only Add-control/
topbar drift explicitly excluded and sent for targeted correction. The final
selected picture is the private local `phone-proposal-v2.png`,
personally inspected by Sol and independently by Astra. It corrects View-only
Add/topbar drift, retaining both target menus/Insights and drawer removal/Account.
Its incidental missing Edit-row Add is excluded: all existing schedule controls
stay as built. This is a menu-placement/removal illustration, not pixel-exact
application-source/data proof. Original/correction prompts and v1 are preserved privately.

Recommend phone-only additions at the existing820px breakpoint, keeping desktop
Insights directly reachable as currently approved. Recommend only Insights in
the two new menus; Board Sort all and Desktop layout belong to its own menu.
These preservation choices were shown together and accepted D558.
Button dimensions follow the existing toolbar and D487; no unrelated resize.

Date flow: schedule page → existing calendar icon → existing Jump to a date
picker → chosen date. Both phone schedule toolbars already call the same
`setWeekCal('view')` as the drawer duplicate. Board calendar retains its own
board context. No new picker/date/week calculation or navigation writer.

Insights flow: Edit Schedule or View-only Sched → ellipsis → Insights → existing
Week insights window. The menu closes when opening the window, outside tap or
Escape; ordinary focus and the current page/day are retained when dismissed.
Opening Insights remains read-only, reusing `setInsights(true)`; latest-issued/
working context, Blue/Red role answers, chart, work hours and permissions keep
their current contracts. Board's existing menu stays as shown in Photo1.

Removing the drawer section removes its global phone Insights/date shortcuts
on other tabs too. The shown proposal routes those users through a schedule
page's calendar/Insights controls; do not add an unrequested replacement item
or silently leave the circled drawer block behind.

## Current state and design proof boundary

Entry `codex/workflow-ui` at8d6ffffe2d8864d0fdc0c257ce46075a5e7a065d,
equal to origin after the keyboard build. Its Ready keyboard preview is
https://raptor-j9ktwbypa-kai-e2f5.vercel.app. Owner screenshots show an older
split preview but are the explicit placement/removal reference for this idea.
Current `Shell.tsx` has both calendar/Highlight/search strips and a desktop
Insights button; `Drawer.tsx` has the two WEEK shortcuts; `SchedBoard.tsx`
already has the reference Insights/Sort/layout overflow. These are source
observations, not proof that the new menu works.

Independent Astra proposed plan and Sol challenge PASS are in
`../plans/2026-10-04-schedule-insights-menu-plan.md` and the sibling challenge;
complete candidate disposition is there. Generated mockups are illustrations, not running
app screenshots or saved-data proof. No application source/test/CSS/config
changes in this proposal turn. The prior keyboard freeze/review remains intact.

Built on `codex/workflow-ui` after D558: shared phone ellipsis menus and drawer
removal. WALK12orders/15opened originals/0errors on frozen853files/19served
assets; unit7779, reference728, browser553+49existing skips, Tracker445,
adapted6/perf4/rule/docs PASS; three intentional actual wire breaks RED then
exact restored14PASS. Evidence `../../handpass/2026-10-04-schedule-insights-menu.md`.
Fresh separate Astra final R1 PASS; complete immutable report beside evidence.
Owner device/preview look and
Monday Claude plan/code/scenarios/full phone+desktop app walk remain before
live. No main push/merge/merging PR or automation; pictures remain private.

Rulings: D557 proposal; D558 picture/build acceptance filed before implementation; nextD559.
