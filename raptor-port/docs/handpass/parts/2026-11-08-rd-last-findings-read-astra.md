# Astra's read (gpt-6-astra, high, read-only) — React Doctor's last findings, pull request 702, 8 Nov 26 (chat 32)

On a clean copy of the branch (no walk reports, sheet, scenarios or handoff), the read brief unchanged. His report, whole:

**1. Findings, ranked**

No concrete defect found in `git diff BASE HEAD -- raptor-port/src`.

The actual diff contains **14 files**, including tests, rather than the brief’s 13. I reviewed that complete diff. No files changed. The whitespace check passed; I did not run the app or tests. This is a static review, not a runtime pass.

**2. Explicit negatives**

Each row below records a code check against `BASE`.

| Inventory item and production behaviour | Result |
|---|---|
| **Leave War’s person window and Approvals:** opening records the viewer’s previous visit; the corresponding new-item marks use it. | I checked both command declarations and readers and found no omission. These readers access storage directly, so neither needs an injected loader. |
| **Leave War startup and posting actions:** account and roster changes must have the save layer available before they run. | I checked production boot and the Leave War test setup. Production initializes the scheduler first; the test setup imports the sync module, which imports the scheduler store. I found no newly missing registration. |
| **Tracker startup:** its roster, identity and role projection must follow the main app. | I checked the lazy page and people bridge. They retain the scheduler-store dependency; Tracker’s own commands retain their separate registration. No missing connection found. |
| **Production startup, reload, `?fresh=1` and a second tab.** | I checked the common boot path. The backend choice does not bypass registration. Each new page evaluates the store and registers again in its own module world. This does not establish live synchronization between tabs. |
| **Probe bridge.** | I checked its store dependency and installation after `bootApp`. No writer is newly exposed before registration. |
| **Test worlds and direct registration callers.** | I checked the changed direct callers and the account, history, flying-plan and member-setting fixtures. They use the new registration entry or initialize the store. No stale import of the removed registration export remains. Headless success alone was not treated as permission evidence. |
| **Registration order.** | Scheduler registration → people/settings registration → mission roles → permission resolver and invariants remains unchanged. Loaders are assigned before the settings hooks are installed. No newly introduced command runs between these steps. |
| **Account-family writers:** request, refuse, approve, add/update account, guest switch, add person, add person with account, approve as new person, request-seen, delete, restore, archive, welcome-back seen, posting and posting pass. | I checked every declared account-family type against the new wire and permission mapping. All remain registered; no writer was dropped. |
| **Other writers:** Quals edits, people persistence/projections, fixed settings, grouped settings saves, change-history seen, notice read/forget, both Leave War seen records, flying days/rules/runs, SANS colours and the member-filing switch. | I checked their routes and declarations. The fixed-settings loop, people declaration and flying-plan declaration remain in the core; the other families arrive through the wire. No missing type found. |
| **Account loader:** sign-in, Users rows, waiting requests, request bell and guest access. | The same loader is supplied and invoked in the same position. No lost reader or altered reconstruction found. |
| **Change-history and notice loaders:** new-history marks, unread bell counts and the Leave War’s read-status decisions. | Both loaders remain in rollback and undo reconstruction. No stale-cache regression found. |
| **Flying-plan loader:** Required figures and the SANS/flying-plan displays. | Cache invalidation remains in rollback and undo reconstruction. No missing invalidation found. |
| **Other settings loaders:** rules, stores, cancellation reasons, day/duty/wave templates, qualification columns, lookahead, section/wave defaults and Insights. | All remain, in their previous order. The complete reconstruction list still has the same 15 loaders. |
| **Undo, redo and failed commands.** | I checked settings capture/restore/write, people baselines, undo registration and timeline exclusions. No changed transaction boundary or replay path found. Seen marks remain outside Undo; adding, archiving, restoring, deleting and posting retain their exclusions. Own-change restrictions remain unchanged. |
| **Roles:** admin, admin in member view, member, pending, guest, suspended and headless. | I checked the page/write/gate distinction and relevant permission mappings. No permission broadened or removed. I excluded the prohibited “scheduler who is not an admin” scenario. |
| **Roster rows:** one person per row, alphabetical ordering, search, status dots, role, posting information and own-row restriction. | I compared the extracted renderers with the old markup. No sign, action, prop or wrapper was lost. `PersonSub` has no memoization that would suppress updates. |
| **Roster editor:** Save, Suspend/Enable, Give sign-in, Archive, two-tap Delete and Cancel. | All handlers, refusal handling and Enable’s qualification reminder remain. Name, role and delete-armed state moved together into the editor. |
| **Archived editor:** rename, Restore/Restore as, post-in date, refusal, two-tap Delete and Cancel. | Callsign checks, suggested free callsign, today’s initial date, restore behaviour and qualification reminder remain. Save name still leaves the editor open. |
| **Editor lifetimes:** Cancel, row toggle, another row, filtering/folding, successful save, refusal and unrelated updates while open. | The existing parent keys still reset editors on close/reopen. Refusals retain the open editor; ordinary rerenders retain typed state while refreshing props. No lost effect or changed handler found in the extraction. |
| **Waiting and Add person forms:** roster/new-person choices, approval/refusal, post-in dates and guest switch. | I checked their surrounding code. The Person heading’s element changed; their state and action paths did not. |
| **Both Data clearing forms:** period selection, dates, dry count, second-tap confirmation and disarming after a change. | I found no changed clearing logic. `admWipe` and `admLog` produce distinct select, calendar and heading IDs even when both forms are mounted. |
| **Labels, calendars and overlays.** | Period points to its own select; Dates names its calendar group. The Person choice retains its existing accessible group name. DateBox/calendar component placement and handlers remain unchanged. Actual focus and overlay geometry require a browser check. |
| **Every production `.mfield` consumer under `src/ui/`.** | The search found Admin, Users and Help. Existing label selectors retain their declarations. Only the new Dates and Person spans gain the added class selector. I found no other matching element that would acquire styling unexpectedly. |
| **Access screen:** initial caret, validation, request submission, waiting/suspended states, guest entry and failed-save band. | The only change is the autofocus explanation. No executable behaviour changed; the failed-save and “Not sent yet” paths remain intact. |
| **Remaining indirect import cycles.** | The command → actor → auth → permissions → accounts → save-layer route, and auth/permissions cycle, remain. They also exist in `BASE`. I found no concrete failure newly caused by them; this change should not be described as making the entire dependency graph acyclic. |

The following are **ranked host checks, not defect findings**. They target the remaining runtime uncertainty:

1. **Specialised permission paths.** Run `src/state/people-settings-wire-real.test.ts`, group 2. Sign in as the member; mark history and a notice read, open his own Leave War window and dismiss welcome-back. Assert the records change. Attempt Approvals and assert no record is written. Repeat the permitted admin actions and assert success. A refused legitimate write disproves the registration coverage.

2. **Rollback and subsequent recovery.** Run that file’s group 3 test beginning “an account, the changes window’s seen…”. Its setup uses the real whiteboard/Postman path. Change all four cached families inside one command, then throw. Assert memory and stored rows return, no save group is queued, and the next ordinary writes succeed. Also run its Leave War seen-moments case.

3. **Real undo/redo and reload.** Run group 1’s account-role, suspension and flying-plan tests. Then, in a persistent browser world, change those values, wait for saving, reload and verify them before undo testing in the new session. Open a second tab and verify it loads the saved values. Any stale displayed value or lost saved value fails this check.

4. **Editor continuity.** Extend `src/ui/onedoor-users.test.tsx`: open Hex, type an unsaved sign-in, arm Delete, trigger an unrelated `notify()`, and assert both remain. Close by row toggle, reopen and assert saved values plus unarmed Delete. Repeat using another row as the closing action. For an archived person, retain a typed name/date through a refused restore, then close/reopen and assert the initial values return.

5. **Both clearing forms and rendered styling.** On Admin → Data, put both forms in range mode. Check every new ID occurs once, each group is named Dates, and pressing each Period label focuses its own select. Compare Dates/Person typography and spacing against `BASE` at phone and desktop widths. The existing label unit test checks association, not actual browser focus.

**3. Tidiness note — changed lines only, filed here, not fixed**

- **Anything unnecessary?** `roleWordOf` is a single-use extraction, but harmless. I found no unnecessary functional change requiring removal.
- **Anything said twice?** The import-cycle explanation is repeated in the core and wire headers; both editor comments repeat the remount explanation. These could be shortened without losing the reason.
- **Understandable in a month?** Mostly yes. One comment needs correction: `people-settings-commit.ts:103–105` says commands cannot run before registration. `command/permissions.ts` explicitly permits the system actor before checking registration. The comment should instead state that production startup installs the loaders before these commands run, while signed-in commands require declared types. The new direct-import test also proves only the listed direct imports are absent, not that all indirect cycles are gone.

Rulings: none