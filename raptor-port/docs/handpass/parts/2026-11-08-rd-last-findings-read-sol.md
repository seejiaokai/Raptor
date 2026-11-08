# Sol 6.1's read (gpt-6.1-sol, high, read-only; D1743's window) — React Doctor's last findings, pull request 702, 8 Nov 26 (chat 32)

On a clean copy of the branch (no walk reports, sheet, scenarios or handoff), the read brief unchanged. His report, whole:

**1. Findings, ranked**

None. I found no concrete behavior regression in `git diff BASE HEAD -- raptor-port/src`.

The actual diff contains **14 files**, including seven production files and seven test files. I reviewed that full scope. I changed no file. The whitespace check passed; I ran neither the app nor tests, so this is a source-review result.

**2. Explicit negatives**

The inventory below starts with the specialised surfaces. “Nothing found” means no discrepancy found against BASE by reading the code.

| Inventory item and production location | What I checked | Result |
|---|---|---|
| Leave War person window: visit time and new-since-last-visit marks | `lw.seen` remains declared. Its writer and reader use the stored row directly, so no additional reload function is needed. | Nothing found. |
| Leave War Approvals: visit time and “New” marks | `lw.apprseen` remains declared. The admin-only permission and own-row restriction remain in the existing permission module. Its reader is also uncached. | Nothing found. |
| Welcome-back screen: dismissing the reminder | `person.backSeen` remains included through the accounts type list. | Nothing found. |
| Flying plan: Required figures, individual dates, repeating rules and running figures | All four flying-plan commands remain declared. The same reload function clears the cached plan after rollback, Undo and Redo. | Nothing found. |
| Changes window: “Mark all as seen” | `changes.seen` remains declared. Restoring settings still rebuilds seen marks and advances the version read by consumers. | Nothing found. |
| Bell: opening a notice, marking all read and retracting read marks | `notices.seen` remains declared. The same reload function rebuilds the bell’s cached read marks. | Nothing found. |
| Admin → Users and access screens: accounts, requests and guest access | The complete accounts type list is passed through, including add, update, approve, refuse, request, seen, archive, restore, delete and posting commands. The accounts reload function still restores accounts, requests and the guest switch. | Nothing found. |
| Other settings and roster writers | The fixed settings declarations, grouped wave-template save, member-filing switch, people edit and roster-add paths retain their existing declarations and save bodies. | Nothing found. |
| Registration order | Scheduler registration → people/settings registration → mission roles → permission resolver remains unchanged. The injected functions are assigned before guarded stores and write hooks are installed. Repeat registration remains harmless. | Nothing found. |
| Production start, reload, `?fresh=1` and a second tab | They retain the same application entry and registration path. `?fresh=1` changes the backend choice. Each tab evaluates its own registration state. | No missing registration found. This does not establish cross-tab synchronisation. |
| Probe bridge | It is installed after application boot and also imports the main store. Its writers therefore retain the registered layer. | Nothing found. |
| Leave War and Tracker boots | Production boot still registers the scheduler’s people/settings layer before Leave War initialisation and Tracker mounting. Their independent stores retain their own registration paths. | Nothing found. |
| Test worlds | All existing direct callers of the moved registration function were updated. The new isolated wiring tests register explicitly; the real-writer tests initialise the main store. | No abandoned caller found. |
| Roles | Admin, admin in member view, member, pending, guest, suspended and system actors retain the same permission path. Passing `anyone` still declares a command; the installed resolver decides a signed-in person’s authority. | No permission expansion found. |
| Admin → Users roster rows | Callsign, sign-in, role, seat/CAT, posting tag, held-posting explanation, status dots and own-row lock retain their markup and conditions. The extracted subtitle adds no DOM wrapper. | Nothing found. |
| Roster editor lifecycle | Sign-in, role and armed Delete move together into the editor. Cancel, tapping the row shut, opening another row and reopening retain the existing reset behavior because the parent’s changing key remains. Successful actions close it; refusals leave it open. | Nothing found. |
| Changes elsewhere while a roster editor is open | Account and callsign props refresh on rendering, while typed drafts remain local, matching the old editor. Search, category visibility and bell landing retain their existing handling. | Nothing found. |
| Archived editor lifecycle | Callsign, post-in date, error and armed Delete move together. Restore, Restore as, Save name, Delete and Cancel retain their handlers. Closing/reopening resets drafts; Save name keeps the editor open. Callsign clashes are recalculated. | Nothing found. |
| Waiting requests and Add a person | Give access’s roster/new-person choices, refusal, draft retention, post-in date and add/reset paths are unchanged. Only the “Person” heading changes element type. | Nothing found. |
| Admin → Data clearing forms | Both forms retain their period/date state, counting, two-press confirmation and disarming rules. `admWipe` and `admLog` produce distinct select, calendar and heading IDs. Each “Dates” group names its own heading. | Nothing found. |
| Shared field styling | Production `.mfield` markup occurs in Admin, Users and Help. Existing labels still match the original selector. Only the replacement “Person” and “Dates” spans gain the added selector. Help’s Category and What happened fields remain unaffected. | No wider styling change found in source. |
| Access screen and failed-save band | The change is a lint-exception comment. Autofocus, request submission, waiting/suspended screens, guest entry, Sign out, Retry and “Not sent yet” behavior are unchanged. | Nothing found. |
| Remaining indirect import cycles | The command → actor → auth → permissions → accounts route remains. I found no newly introduced eager read that makes that cycle a concrete startup failure. | Cycle existence alone is not a finding. |

The following are **ranked host checks, not observed defects**. They target the remaining uncertainty:

1. **Specialised commands under real sign-ins.** Run the permission cases in `src/state/people-settings-wire-real.test.ts`. As Ranger, assert his own seen/read/visit records land and Approvals seen is refused; as Saber, assert account changes and Approvals seen land. A missing stored row after an allowed action disproves correctness. A headless actor is insufficient here.

2. **Rollback, Undo and Redo restore actual values.** Run that file’s account, flying-plan and throwing-command cases. Assert both stored rows and screen-facing readers return to their previous values; the throwing command must create no outgoing save group, and the next ordinary change must succeed. Stale account roles, bell counts or Required figures disprove correctness.

3. **Editor reset and retention orders.** Extend `src/ui/onedoor-users.test.tsx`: type an unsaved sign-in, change role and arm Delete; close by Cancel, the row toggle and another row, reopening after each. Assert saved values and an unarmed Delete. Repeat for an archived callsign/date/error. Separately force a refused save and trigger an unrelated redraw; assert the open draft remains. Unexpected draft survival or loss disproves parity.

4. **Both clearing forms together.** Extend `src/ui/adminclear.test.tsx` to render both production prefixes, select range mode in both and assert unique IDs and correct label/group targets. In a browser, press each “Period” label and assert its own select receives focus. Compare “Person” and “Dates” typography on phone and desktop; source inspection cannot prove painted geometry.

5. **Cold start and reload.** Through the production boot, create a new account, reload, sign in with it and perform an allowed write. Repeat with a fresh-memory page and a second tab. Missing registration, a startup exception or a refused legitimate write disproves correctness.

**3. Tidiness note — changed lines only, filed here, not fixed**

- **Anything unnecessary?** I found no unnecessary production behavior or extra DOM introduced by the extraction.
- **Anything said twice?** The import-cycle explanation is repeated in the new wiring file and several comments in the save layer. One authoritative explanation with shorter pointers would reduce repetition.
- **Understandable in a month?** Mostly. One comment needs correction: `people-settings-commit.ts`, beside `ModuleLoaders`, says no commands can run before registration because undeclared types are refused. System/headless actors bypass that check. The comment should state that **production startup registers the loaders before these writes**, without claiming an unconditional registry guarantee. I found no production failure caused by this wording.

Rulings: none