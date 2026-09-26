# Red team of the [ACCOUNTS] plan, round 1 — Astra (Codex, verbatim), 26 Sep 26

Read of plan commit a9ca3463 with the brief `raptor-port/docs/superpowers/briefs/2026-09-26-accounts-plan-redteam-brief.md`. Blind to Fable's report.

# `[ACCOUNTS]` plan red-team report — round 1

## Findings

1. **BLOCKER — The production probe bridge bypasses the entire account and permissions design.**

   **Wrong/missing:** The plan states that only localhost-only `raptorRole` and new `raptorMe` remain (`accounts-plan.md:235-238`, roll-call row 34), but `main.tsx:114` installs the complete probe bridge on every host. That bridge exposes live data and unrestricted mutation functions: `PEOPLE`, `INPUTS`, `setSlotVal`, `publishALDay`, `setDayApproved`, and raw mutation epilogues (`probe-bridge.ts:44-88`), plus unguarded `lwSetRole`, `lwSetViewer`, and `lwLoadWars` (`probe-bridge.ts:118-148`). Only `raptorRole` and a few later functions are localhost-gated.

   Leave War trusts this mutable state: `setRole` and `setViewer` are unguarded (`leavewar/state/store.ts:1976-1994`), and `canEditRow` permits every row when `viewer === null` (`leavewar/engine/stages.ts:144-145`).

   **Scenario:** Set up a real deployed member session. In the console run `lwSetViewer(null)` or `lwSetRole('admin')`, then operate another person’s row or an admin-only Leave War control. Alternatively call `setSlotVal(...)` followed by `afterSchedMutate()` to alter the schedule outside the proposed permission questions. Expected: no deployed mutation bridge exists and the write is refused. Wrong result: the member changes authority or data. A guest can also read all raw medical inputs through `window.INPUTS`.

   **Required plan fix:**

   1. Amend §3, §The probe bridge, roll-call row 34, and build step 3 to cover the entire existing bridge—not only the two new functions.
   2. Gate the call to `installProbeBridge()` in `main.tsx` by `localhost`/`127.0.0.1`, so production never installs it.
   3. If production diagnostics are genuinely required, split them into a separate read-only installer containing no model arrays, state setters, loaders, roles, viewers, writers, undo/redo, or navigation setters.
   4. Add a built-site test using a non-local hostname that asserts every mutating/raw-data global is absent, including all existing bridge names.
   5. Keep a localhost E2E test proving the test bridge remains available.
   6. Correct the stale comments claiming `lwSetRole`/`lwSetViewer` are safe production seams.

2. **BLOCKER — Medical visibility is designed incorrectly, and the plan leaves a directly contradictory ruling stale.**

   **Wrong/missing:** The non-negotiable rule says a medical absence and its documents are readable only by that person and admins (`handover-dataverse.md:64-75`; `data-model.md:972-973`). D169 permits other members to see only that “a medical input” changed, without its details. The plan nevertheless says “views any attachment” is unchanged (`accounts-plan.md:44`), gives guests the ordinary View-only Schedule (`accounts-plan.md:166-167`), and defines no read questions for medical rows, remarks, edit-log details, or attachments (`accounts-plan.md:126-138`).

   Today the view schedule prints Unavailable on every page with the input type and raw remarks (`ui/html.ts:1848-1857`, `1911-1913`, `1923-1947`, `2000-2007`). `DocViewer` explicitly permits every account to read every document and renders type, remarks, and file bytes without a read gate (`ui/DocViewer.tsx:1-10`, `24-58`, `85-112`; `ui/pops.ts:68-80`).

   **Scenario:** Ranger files a new medical input containing a diagnosis and document. Another member—or a waiting guest after the guest switch is enabled—opens that week or a retained document viewer. Expected: only generic operational unavailability is visible; the medical type, remarks, and document are unavailable. Wrong result: the diagnosis, remarks, or document is rendered. The permissions drift test can still pass because it checks no read predicate.

   **Required plan fix:**

   1. Name the clash between the older “all users view attachments” rule and D169/the database non-negotiable; state that the later restriction wins under D90/D201.
   2. Extend `PERMS` with field/row-level read operations such as `mayReadInput`, `mayReadInputDetails`, `mayReadMedicalDetails`, `mayReadAttachment`, and `mayReadEditLogDetail`.
   3. Apply those predicates in every renderer and door: week view, scheduler board/working copy, Inputs table/calendar/medical view, pending/history rows, document-opening controls, and `DocViewer` itself.
   4. Render only a sanitized availability marker for unauthorized readers—no medical subtype, remarks, filenames, bytes, or document IDs.
   5. Make `DocViewer` fail closed even if `DOCVIEW` is populated by stale state or a state poke.
   6. Add admin, owner-member, other-member, guest, and no-session tests for each reader, including reload and stale-overlay cases.
   7. Add these readers to the roll-call and update every stale comment/test name under D201.

3. **BLOCKER — A guest can inherit and remount an outgoing user’s sensitive overlays.**

   **Wrong/missing:** Page clamping does not secure sibling overlays. `App.tsx` currently mounts `SchedBoard`, `HistoryModal`, `InputEditor`, `DocViewer`, and every template/settings sheet for every truthy session (`ui/App.tsx:16-23`). Their flags live outside the React tree (`ui/pops.ts:1-117`). `resetSession` resets `state/view.ts` state and the edit log but does not clear `INPEDIT`, `DOCVIEW`, `HISTLIST`, or the template/modal flags (`state/store.ts:283-343`). The plan promises a “guest shell” and page clamp but does not specify an overlay allowlist or cleanup.

   **Scenario:** An admin opens another person’s medical `DocViewer` or `InputEditor`, logs out, and a waiting person signs in as guest. Expected: only the sanitized View-only Schedule, week picker, banner, and Sign out exist. Wrong result: the retained modal remounts over the guest page, exposing person-scoped data and potentially an editor. Equivalent leaks exist for history and admin template sheets; generic Shell keyboard/delegated listeners also remain active if Shell is reused.

   **Required plan fix:**

   1. Specify a separate `GuestApp`/guest render branch in `ui/App.tsx` that mounts only the sanitized schedule, week picker, banner, and logout control.
   2. Do not mount generic `Shell`, scheduler board, history, input/document overlays, templates, Leave War, Tracker, Admin, Quals, or global edit listeners for a guest.
   3. Add one `resetPopsForSession()` function covering every `ui/pops.ts` flag and component-local global overlay state; call it from `resetSession` on both sign-in and sign-out.
   4. Retain permission checks inside every overlay as defense in depth.
   5. Add a parameterized test that arms each overlay as an admin, logs out, signs in as guest, and proves neither content nor keyboard/write paths survive.
   6. Add every overlay and document-level listener to the roll-call.

4. **BLOCKER — A signed-in but unmapped person is treated as the privileged internal “system” actor.**

   **Wrong/missing:** The plan says request/waiting/switched-off screens are not sessions (`accounts-plan.md:119-120`), yet an unmapped signed-in principal must write an access request through the settings command seam. Today `deriveActor()` turns every `SESSION === null` call into the internal system actor (`command/actor.ts:15-30`), and `authorize()` unconditionally permits system actors (`command/permissions.ts:46-53`). The proposed matrix and tests cover only admin, member, and guest (`accounts-plan.md:126-139`), omitting anonymous, authenticated-unmapped/pending, and disabled identities.

   **Scenario:** An unknown defence-mail stand-in reaches Request access and submits. Expected: the command records an authenticated-but-unmapped principal authorized only to create/read their own request. Wrong result: it executes as `system`, bypasses all permission checks, and is audited as an engine operation. Any missed settings call from that surface receives the same privileged classification.

   **Required plan fix:**

   1. Add an authenticated principal state separate from an authorized Raptor session; it must retain the immutable sign-in principal while the user is unmapped, pending, guest-enabled, or disabled.
   2. Add explicit `pending`, `guest`, and `disabled` actors—or equivalent capabilities—to `command/actor.ts` and `state/perms.ts`.
   3. Reserve `system` for explicitly created internal seed/load/projection commands; never infer it merely from the absence of an app session.
   4. Add `mayRequestAccess` and own-request read/create rules. Pending users must not update accounts, roles, mappings, the guest switch, or unrelated settings.
   5. Stamp an access request with the authenticated principal, not only editable text.
   6. Test anonymous, unmapped, pending, disabled, guest, member, admin, and explicit system actors at the production command boundary.
   7. Extend §11 and the drift test to cover `AccessRequest` operations and these states.

5. **BLOCKER — The proposed permissions module is not yet “one place,” and its drift test can pass while production remains open.**

   **Wrong/missing:** The proposed test compares §11 letters with another matrix and exercises named helper functions (`accounts-plan.md:122-139`). It does not prove that production readers and writers call those helpers. Current command permissions remain broadly open: all scheduler command types use `anyone` (`state/sched-commit.ts:607-610`), while people and every settings key use `anyone` (`state/people-settings-commit.ts:226-235`). Leave War writers use independent `state.role` checks, and numerous UI paths use direct `SESSION.role`/`ME` checks. The proposed routing list names only a subset.

   **Scenario:** A member reaches one missed schedule, people, settings, or Leave War writer through a stale element, keyboard route, probe, or future call site. Expected: the central operation evaluator refuses the command. Wrong result: the command registry authorizes `anyone` or a direct local predicate permits it, while `perms.test.ts` remains green because the duplicated matrix still matches the Markdown table.

   **Required plan fix:**

   1. Define a typed `PermissionOp` vocabulary covering every table operation, ownership condition, sensitive read, account action, role, and unauthenticated/pending action.
   2. Map every production command type to a `PermissionOp` and required metadata such as owner person ID.
   3. Replace blanket `anyone` registrations for scheduler, people, and settings commands with delegation to that evaluator.
   4. Route Leave War writers and readers through the same authority source or a documented adapter that is exhaustively parity-tested.
   5. Add a repository architecture test forbidding direct authority decisions using `SESSION.role`, `LOGINROLE`, `state.role`, `ME`, or raw person comparisons outside `perms`, actor derivation, and narrowly documented adapters.
   6. Make the drift check include own-row conditions, medical field restrictions, guest/pending states, and action semantics—not only CRUD letters.
   7. Add coverage tests proving every `PermissionOp` has a production caller and every command type has a permission mapping.
   8. Keep the client/server distinction: the same operation list becomes the later server policy, while UI gates remain feedback only.

6. **MAJOR — D149 is not attached to a pre-mutation Quals write funnel.**

   **Wrong/missing:** D149 requires a page gate and a write-path gate for every column. The plan says “every Quals write function refuses” (`accounts-plan.md:141-147`), but today no such field-level write functions exist. Event handlers mutate `PEOPLE` directly before calling `persistPeople`: qualification/SANS/SXO fields (`QualsPage.tsx:400-460`), archive (`468-471`), and CAT, initials, flight, remarks, and callsign (`474-503`). `persistPeople` cannot safely authorize after the unauthorized in-memory mutation, and its command permission is currently `anyone`.

   **Scenario:** A member has editing enabled and a stale or fabricated delegated event names another person’s `data-q`, `data-lvl`, or `data-cs`. Expected: refusal occurs before any model change. Wrong result: the other person’s object changes before persistence is reached; even a later persistence refusal leaves the live world altered.

   **Required plan fix:**

   1. Add a single exported Quals mutation service, for example `updatePersonField(pid, operation)`.
   2. Call `mayEditQualsOf(pid)` before touching `PEOPLE`.
   3. Enclose authorization, mutation, derived-field updates, validation, persistence, and rollback in one `commitPeopleEdit` transaction with owner metadata.
   4. Route callsign, CAT, SXO, scheduler, SANS, every qualification, initials, flight, and remarks through it.
   5. Keep add/archive/restore and qualification-column administration as separate admin-only operations.
   6. Test each production function directly for own/member, other/member, admin, guest, pending, and no-session cases, plus stale delegated DOM events.
   7. Change build step 6 from a page modification to this funnel-first refactor followed by render wiring.

7. **MAJOR — Persisting `pass?` deliberately violates the future `User` shape.**

   **Wrong/missing:** The plan persists `Account.pass?` in the durable `accounts` settings record (`accounts-plan.md:69-76`, `101-105`). The target model explicitly says no password is ever stored (`data-model.md:635-654`). Limiting the field to seeded accounts does not cure the schema mismatch; the database step would have to remove a credential-bearing property from the persisted prototype representation.

   This is not a complaint that the demo passwords are weak. It is a finding about storing credentials in a record expressly designed to map to `User`.

   **Scenario:** First boot seeds the accounts key, then reload/export or the later adapter reads it. Expected: account data contains identity, role, person, and enabled state only. Wrong result: the stored JSON contains `ad`/`us` passwords and cannot map cleanly to `User`.

   **Required plan fix:**

   1. Remove `pass` from `Account` and from all persisted settings.
   2. Keep the two demo verifiers in a code-only, non-persisted constant keyed by stable seed account ID.
   3. Make `signIn()` consult that verifier only for those seed IDs; admin-created accounts retain the proposed non-empty stand-in behavior.
   4. Add raw-storage tests proving `accounts`, snapshots, command envelopes, and exports never contain `pass` or password values.
   5. Test that both seeded sign-ins still work after reload while the durable account record remains password-free.
   6. Update Q-D and the database mapping section to state that no credential field reaches the adapter.

8. **MAJOR — New OIL awards still will not retain the responsible account or recording time.**

   **Wrong/missing:** D200 requires OIL awards to retain who gave each one and when, D166(5) requires “who” records to use the signed-in callsign, and the database handover requires who/when on every row (`handover-dataverse.md:68-71`). The plan explicitly adds no field and relies on future Dataverse metadata (`accounts-plan.md:200-205`). Today a manual credit contains only an effective day and optional free-text `givenBy` (`leavewar/state/store.ts:3421-3447`); editing can alter or clear that text (`3469-3490`). It contains neither the signed-in actor nor the time the award was entered.

   **Scenario:** Saber enters a new OIL award today with `givenBy` blank. Expected: the new record retains Saber’s stable person/account identity and entry timestamp, separately from the award’s effective date and optional “on whose say-so” text. Wrong result: no one can establish who entered it or when; the later database cannot reconstruct those fields for new prototype records.

   **Required plan fix:**

   1. Add immutable `createdByPid`/account ID and `createdAt` fields to new manual-award records now.
   2. Stamp them inside the authorized Leave War writer from the signed-in actor, never from editable form text.
   3. Keep `givenBy` as a distinct business-provenance field; do not silently reinterpret it as the application actor.
   4. Preserve creation fields on edit and add modified-by/time only if the existing audit contract requires it.
   5. Render the actor’s live callsign by stable ID so callsign renames move nothing.
   6. Test create, edit, reload, undo/redo, callsign rename, and DB-shape projection.
   7. Rewrite Q-A and §11 accordingly instead of deferring correctness to Dataverse.

9. **MAJOR — “Your reports” uses a callsign as an identity key, contradicting the plan’s own stable-ID promise.**

   **Wrong/missing:** The plan says callsign renames move nothing (`accounts-plan.md:59`) but explicitly keeps Help-page ownership “by his own callsign” (`accounts-plan.md:265-266`). Today a report stores only `who: HOOKS.whoami()` (`state/reports.ts:17-23`, `48-54`), and the member list filters `r.who === me` (`ui/HelpPage.tsx:46-72`). This violates the non-negotiable “never a callsign as a key” rule (`handover-dataverse.md:66-67`).

   **Scenario:** Ranger files a report, then changes his callsign to Viper. Expected: the same person still sees the report, now displayed as Viper. Wrong result: it disappears from “Your reports.” If another person later acquires “Ranger,” the callsign comparison can attribute the old report to them.

   **Required plan fix:**

   1. Add stable `pid` and account ID to every new `BugReport`.
   2. Use `pid`/account identity for ownership and “Your reports” filtering.
   3. Keep the callsign only as display text, preferably resolved live from `pid`; retain a historical label only if explicitly required.
   4. Add report filing to the permission operation list: member/guest filing policy must be explicit.
   5. Test rename, relink, logout/login, duplicate historical callsign, and admin-all/member-own views.
   6. Correct roll-call rows 19-20 and the misleading database-ready comment in `state/reports.ts:11-15`.

10. **MAJOR — Login boundaries do not clear global Undo, and account-setting Undo semantics are left undecided.**

   **Wrong/missing:** The plan asserts that sign-in/sign-out still end undo history (`accounts-plan.md:55`), but `resetSession` never clears the global timeline (`state/store.ts:283-343`). The only complete timeline reset is test-only `_resetTimeline()` (`undo/timeline.ts:625-638`). An admin may reverse any entry (`undo/timeline.ts:344-355`), so a second admin can inherit and undo the first admin’s previous-session work.

   Separately, the plan says the three settings keys “ride the command layer,” without distinguishing transaction rollback from user Undo. `settingsStore` supports rollback, but global Undo registers only scheduler, Leave War, and weekstash stores and cuts over only `sched`, `lw`, `inputs`, and `plan` (`state/undo-wire.ts:135-145`). Account changes therefore will not be user-undoable unless the plan adds them—an owner-visible product choice the plan must not make implicitly.

   **Scenario:** Admin A changes the schedule and logs out; Admin B logs in and presses Undo. Expected: the new login has no inherited undo entries. Wrong result: Admin B can reverse A’s prior-session change. Separately, an admin changes an account and presses Undo expecting the command-layer change to reverse, but no account entry exists.

   **Required plan fix:**

   1. Add a production `endUndoSession()` that clears session entries while preserving installed subscribers and registered stores; call it from `resetSession` on every login/logout.
   2. Test admin→admin, admin→member, member→same member, and logout→login boundaries.
   3. Split the plan’s terminology: command rollback and durable reload are mandatory; user Undo is a separate feature.
   4. Ask the owner whether account administration should enter user Undo. Until answered, explicitly keep it out and test that no account Undo entry appears.
   5. If later approved, register `settingsStore`/the account module and revalidate last-admin and self-demotion invariants during restore; an inverse must never recreate a zero-admin state.
   6. Add failure-injection tests proving all three settings keys roll back atomically and rehydrate after a refused or failed command.

## Explicit negatives

I checked the D104-versus-D166 and role-toggle-versus-D166 clashes and found the plan names the later-ruling precedence correctly.

I checked both D204 joining routes, typed-callsign non-linking, waiting state, and the off-by-default guest switch and found nothing beyond the authority-state issue above.

I checked the proposed last-enabled-admin, self-demotion, self-disable, unique sign-in, and unique person guards and found nothing in their stated invariant logic; they remain dependent on fixing the bypasses above.

I checked the guest Leave War sentinel `viewer = ''` and found it sound; unlike `null`, it cannot match or un-scope a row.

I checked the archived-person account rule against automatic posting-out and found keeping the account usable is justified.

I checked the settings store’s snapshot, rollback rehydration, reload seam, first-boot defaults, storage reset, and legacy-import boundaries and found the existing machinery can support the three keys once password and Undo semantics are corrected.

I checked `us → Ranger` and `ad → Saber` under D56 and found no data-migration objection; the functional identity changes are already named and require the planned broad test updates.

I checked the plan’s refusal to pre-build Dataverse tables, adapters, Microsoft sign-in, or Teams integration and found it respects the parked database boundary.

I checked the sign-off-self question and found it correctly filed rather than silently decided in this build.

I checked D210’s ordering and found the plan correctly requires Accounts to receive its own FULL check before the changes window.

**Verdict: BLOCK**

