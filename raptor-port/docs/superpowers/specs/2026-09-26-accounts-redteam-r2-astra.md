# Red team of the [ACCOUNTS] plan, round 2 — Astra (Codex, verbatim), 26 Sep 26

Read of plan commit 468e31cd with both round-1 reports and the brief `raptor-port/docs/superpowers/briefs/2026-09-26-accounts-plan-redteam-r2-brief.md`.

# `[ACCOUNTS]` plan red-team report — round 2

## Findings

### 1. BLOCKER — The plan knowingly leaves the owner’s medical-visibility ruling unbuilt

**What is wrong**

The proposed `[MED-VISIBILITY]` deferral contradicts the controlling rulings:

- D169 says members may see that a medical input changed, but its details remain readable only by that person and admins (`.claude/rules/decisions/scheduler.md:58`).
- D200 expressly places “a medical input’s details excepted” inside the Accounts permissions work (`.claude/rules/decisions/how-we-work.md:17`).
- D201 requires the app, documents, and lists to be corrected when a newer ruling narrows an older one (`how-we-work.md:16`).

The plan instead marks member medical visibility as a known gap (`accounts-plan.md:176-180`), leaves it unchanged in the roll-call (`343`), files the question again (`417-419`), and calls that a valid partial acceptance (`454`). The 27 Aug attachment rule is older; D169 is the later, narrower ruling.

**Failure scenario**

Ranger files a new medical input with remarks and a document. Another member opens the issued week, Inputs page, medical view, history/pending UI, or a document door. The builder follows the plan and changes only the guest rendering. The other member still receives the medical subtype, remarks, document identifiers, filename, or bytes. Expected: only generic operational unavailability; details and attachments must fail closed.

**Exact plan fix**

1. Remove `[MED-VISIBILITY]` as a known gap from §§4, 7, 10, the roll-call, build order, questions, and round-1 disposition.
2. State that D169 narrows the 27 Aug attachment rule under D90/D201.
3. Add distinct operations to `PERMS`, including:
   - `input.read`
   - `input.readMedicalDetail`
   - `attachment.read`
   - `editLog.read`
   - `editLog.readMedicalDetail`
4. Apply them to every production reader:
   - issued-week and working-copy HTML;
   - scheduler board;
   - Inputs table, calendar, and medical view;
   - history and pending rows;
   - document-opening controls;
   - `DocViewer` itself.
5. For unauthorized readers, expose only “Unavailable” and operational times—no subtype, remarks, filenames, document IDs, bytes, or identifying history text.
6. Add admin, owner-member, other-member, guest, pending/off, and no-session tests for every reader, including stale `DOCVIEW` state and reload.
7. Make the drift test require these named sensitive-read operations with no gap marker.

---

### 2. BLOCKER — `COMMAND_OPS` still does not cover every production command, and several proposed mappings remain permissive at the real write boundary

**What is wrong**

The plan says `COMMAND_OPS` maps “EVERY registered command type” and names only scheduler, people/settings, and undo registrations (`accounts-plan.md:187-203`). That inventory is incomplete.

Other production registrations exist:

- Leave War registers `lw.edit` plus seven further `lw.*` types as `anyone` (`leavewar/state/store.ts:1154-1160`).
- Tracker registers eleven `trk.*` collection types and `trk.gesture` as `anyone` (`tracker/app/core.js:392-399`).

With the three new settings keys, the complete forward-command inventory is 56 types, not merely the scheduler/people/settings/undo group described by the plan.

The proposed scheduler mapping is also too broad. It permits members to run `sched.slot`, `sched.fill`, `sched.text`, `sched.delete`, and `sched.mutate` because an own-input cascade might touch the schedule (`accounts-plan.md:198-201`). But joined children inherit the already-authorized parent command and are not independently authorized (`command/permissions.ts:9-12`). Therefore the top-level scheduler types can remain admin-only while a permitted `inputs.write` parent performs a legitimate derived child operation. Making the top-level scheduler types member-capable removes the command boundary’s backstop.

The Leave War parity test is not exhaustive. It names six functions (`accounts-plan.md:204-208`), while `leavewar/state/store.ts` contains roughly seventy role/ownership decisions across roster administration, configuration, events, bids, decisions, ledgers, balances, OIL, manning, stage changes, and movement. The source scan expressly allows the entire Leave War store/engine, so an omitted writer has no second check.

The source scan is internally inconsistent as well: it bans raw `=== ME` comparisons outside its small allow-list (`accounts-plan.md:213-218`), while §8 itself requires `ME === person` in `inputgate.ts` (`284`). Legitimate identity rendering such as `ui/highlights.ts:97` also uses `id===ME`. As written, the test either cannot go green or must gain broad exceptions that weaken its claimed guarantee.

**Failure scenarios**

- A missed delegated or keyboard path mutates a schedule value and invokes the top-level `sched.mutate` epilogue. The member is authorized because the plan deliberately maps that type member-and-admin. Expected: command refusal; wrong result: the schedule commits.
- A new guest/pending call reaches a Tracker writer. The plan says every forward command for that role is refused, but the unmentioned `trk.*` registrations remain `anyone`.
- A Leave War writer omitted from the six-function parity set loses its local admin check. Its `lw.*` command remains `anyone`, and both drift and parity tests remain green.

**Exact plan fix**

1. Generate the registered-command inventory from the actual registry after scheduler, people/settings, undo, Leave War, and Tracker initialization.
2. Require every non-system forward type in that inventory to have one `COMMAND_OPS` entry; no module exclusions.
3. Map all Tracker types to admin-or-member, explicitly refusing guest, pending, off, and no-session actors.
4. Replace every Leave War `cmdAnyone` registration with `cmdCheck` and operation metadata. Split coarse types where one type currently represents materially different permissions.
5. Make `sched.slot`, `sched.fill`, `sched.text`, `sched.delete`, `sched.mutate`, and all other user scheduler operations admin-only at top level.
6. Give `inputs.write` and `inputs.batch` required owner metadata and authorize member-own or admin. Keep derived schedule work joined beneath that authorized input command or use an explicit projection.
7. Exercise every authority-bearing Leave War export, not six representatives, as admin, member-own, member-other, guest, pending/off, and no session.
8. Replace the token-regex source scan with an import/AST boundary check that forbids raw authority sources outside `perms`, actor derivation, and narrowly named adapters. Maintain a separate, documented allow-list for non-authority identity display.
9. Add negative fixtures proving aliasing, destructuring, `state.viewer`, helper-renamed role checks, and a newly registered command without a mapping all fail the architecture tests.

---

### 3. MAJOR — `settings.accessreqs` is too coarse, and multi-key account operations are not atomic

**What is wrong**

The plan authorizes a pending principal for the entire `settings.accessreqs` command type (`accounts-plan.md:190-191`). That setting is the complete request list, not a single owned request or a create-only operation. The command boundary therefore cannot distinguish “create my request” from replacing, deleting, or editing everybody’s requests.

Approval and “add an account for a waiting name” also update both `accounts` and `accessreqs` (`accounts-plan.md:241-248,268`). The current settings hook opens one command per `store.set` (`people-settings-commit.ts:191-193,239-242`). The revised plan does not introduce an outer multi-key transaction or the failure-injection tests Astra requested.

**Failure scenario**

An admin approves a request. Writing `accounts` succeeds, then writing `accessreqs` fails. The principal now has an account but also remains in the waiting list and badge. The reverse write order can remove the request without creating access.

Separately, a missed pending-state call writes a replacement `accessreqs` array. The command sees only `settings.accessreqs` and permits it, allowing the pending principal to clear or alter other people’s requests.

**Exact plan fix**

1. Replace the pending exception for `settings.accessreqs` with intent-specific commands:
   - `access.request.create`
   - `access.request.decline`
   - `access.request.approve`
   - `account.add`
   - `account.update`
   - `guestview.update`
2. Require immutable principal/request/target metadata on those commands.
3. Permit pending only for `access.request.create` where the principal matches the session and has no existing request/account.
4. Keep generic `settings.accounts`, `settings.accessreqs`, and `settings.guestview` admin-only.
5. Add `commitAccountsChange` that enlists `settingsStore` once and performs all required raw key writes inside one command.
6. Use that transaction for approval and add-for-waiting so account creation and request removal succeed or roll back together.
7. Inject failure after each constituent write and prove all three keys rehydrate to their before-image.
8. Test forged principal metadata, duplicate request, pending update/delete, approval, decline, and add-for-waiting.

---

### 4. MAJOR — The proposed Quals funnel trusts a caller-supplied owner while accepting an arbitrary mutation callback

**What is wrong**

`updatePerson(pid, change)` checks permission for `pid`, then executes the caller’s unrestricted `change` callback and stamps `meta.owner = pid` (`accounts-plan.md:223-230`). Nothing states that the callback can modify only that row, nor does the command gate verify the actual changed person IDs.

That does not satisfy D149’s write-path gate. It authorizes a claim about the owner, not the resulting mutation.

**Failure scenario**

A member is Ranger. A missed or future call executes:

`updatePerson(rangerPid, () => { PEOPLE[otherPid].sched = true })`

The permission check and command metadata both say Ranger; the actual changed row belongs to another person. The mutation commits.

**Exact plan fix**

1. Replace the arbitrary callback with a declarative operation such as `updatePersonField(pid, field, value)` or a closed union of row operations.
2. Alternatively, pass the callback only a detached clone of the authorized row, then validate and replace exactly that row.
3. Add a people-store invariant that, for member-owned commands, every changed `people/<id>` equals `actor.personId`; reject and roll back otherwise.
4. Give add, archive, restore, and qualification-column administration distinct admin-only operations instead of representing them as ownerless generic edits.
5. Test a malicious multi-row mutation, owner metadata that disagrees with the changed row, callsign rename, every D149 column, stale DOM targets, and rollback after validation failure.

---

### 5. MINOR — Moving the bridge to localhost silently invalidates existing non-local driver paths

**What is wrong**

The product-side decision to install the complete bridge only on localhost is correct. But the claim that every probe, Tracker smoke, hand-pass driver, and deployed-site check runs there is not fully true (`accounts-plan.md:290-292`).

- `scripts/handpass/live-check.mjs:9,16-25` opens a deployed URL and reads `WARN` and `WCODE` from the bridge. After the revision it will report the relevant warning checks as absent.
- `scripts/handpass/lib.mjs:13,67-68` permits an arbitrary `HP_URL` while helpers call `window.go` and `window.CURPAGE`.
- Other shared hand-pass helpers similarly accept URL overrides while depending on bridge globals.

The current live-check URL is also obsolete under the later Vercel deployment rulings, but the plan neither retires nor rewrites it.

**Failure scenario**

A reviewer points a hand-pass driver at a non-local production-equivalent host, or runs `live-check.mjs`. The page itself is correct, but the driver reports missing behaviour or fails because the bridge is intentionally absent.

**Exact plan fix**

1. Inventory bridge-dependent drivers and mark each explicitly localhost-only.
2. Make their shared helpers refuse a non-loopback hostname with a clear message.
3. Rewrite any check intended for a deployed host to use only DOM/user-visible production routes.
4. Retire or replace the obsolete GitHub Pages `live-check.mjs` under the current Vercel workflow.
5. Keep two separate tests: localhost proves the bridge is present; a non-local hostname proves every bridge global is absent.

## Round-1 disposition audit

- **Fable R1-1 — CLOSED:** the decline is sound for this prototype; D166 treats the typed principal as the Microsoft-authenticated identity, the owner requires no stored password, and the brief excludes password-strength findings.
- **Fable R1-2 — CLOSED:** the separate guest tree, session popup reset, fail-closed document viewer, and unmounted Shell/overlays close the inherited-overlay path.
- **Fable R1-3 — CLOSED:** the complete bridge, rather than selected setters, is now restricted to loopback. The remaining defect is test-driver maintenance, not the production bypass.
- **Fable R1-4 — NOT CLOSED:** Leave War and Tracker registrations are omitted, and the member-capable scheduler/input mappings remain too broad.
- **Fable R1-5 — NOT CLOSED:** six Leave War writers are not exhaustive, and the proposed regex scan is both bypassable and inconsistent with planned identity comparisons.
- **Fable R1-6 — CLOSED:** ownership is now determined by person identity regardless of role, and the display name comes from the signed-in callsign.
- **Fable R1-7 — CLOSED:** `endUndoSession` is specified on every reset, and account settings are explicitly excluded from user Undo.
- **Fable R1-8 — CLOSED:** `outlaw → casper` and `hex → rocky` avoid the posted-out seed, and geometry re-baselining is explicit.
- **Fable R1-9 — CLOSED:** the SCHEDULER consequence is on the look card and roll-call.
- **Fable R1-10 — CLOSED:** guest/pending/off receive explicit actors, `viewer=''`, null `me`, and a non-empty-person undo requirement.
- **Fable R1-11 — CLOSED:** loader purity, invalid-value handling, lock-out fallback, own-account refusal, and access-screen logout are stated.
- **Fable R1-12 — CLOSED:** the required User, AccessRequest, guest, Person-own-row, and EditLog changes are listed.
- **Fable R1-13 — CLOSED:** the stale-text sweep now includes the named documents, comments, tests, and CSS.
- **Fable R1-14 — CLOSED:** the unsettled product readings are placed on the owner’s look card.

- **Astra R1-1 — CLOSED:** `main.tsx` is now directed to omit the entire bridge on non-loopback hosts, with absence testing.
- **Astra R1-2 — DISPOSITION DISAGREED:** D169 and D200 already settle member medical visibility; filing it as an unresolved clash contradicts the later rulings.
- **Astra R1-3 — CLOSED:** the guest gets a structurally separate tree and session-bound popup reset.
- **Astra R1-4 — CLOSED:** pending, guest, and off are real session/actor states; `system` is reserved for explicit internal work.
- **Astra R1-5 — NOT CLOSED:** the command inventory omits Leave War and Tracker, broad scheduler types are member-capable, and parity/source-scan coverage is incomplete.
- **Astra R1-6 — NOT CLOSED:** the new Quals service checks a claimed owner but permits an unrestricted mutation callback and has no changed-row invariant.
- **Astra R1-7 — CLOSED:** passwords are absent from records, snapshots, envelopes, and exports; seed verification is code-only.
- **Astra R1-8 — CLOSED by sound filing:** D203 explicitly places the award-record shape change in `[OIL-AWARD-IS-A-GRANT]`; the requirement is retained in §11 and that filed build.
- **Astra R1-9 — CLOSED:** reports gain stable `pid` ownership, filter by it, and resolve the live callsign for display.
- **Astra R1-10 — NOT CLOSED:** the undo-session half is closed, but atomic multi-key account transactions and failure-injection rollback/rehydration tests remain unspecified.

## Explicit negatives

- I checked D104 versus D166 and the old role-toggle ruling versus D166; later-ruling precedence is applied correctly.
- I checked the five session roles and found the pending/guest/off actor separation and `system` reservation sound.
- I checked the separate guest render tree and found its page and overlay exclusions sound.
- I checked `viewer=''` for guest/pending/off and found it safely matches no Leave War row.
- I checked the last-enabled-admin, own-account, unique sign-in, and unique-person guards and found their stated invariant logic sound.
- I checked the revised seeds against the Leave War demo world and found `casper` and `rocky` are not the posted-out demo person.
- I checked password persistence and found the code-only seed-verifier design compatible with the future `User` shape.
- I checked the stable-id changes for edit logs, bug reports, unpublish records, command actors, and Leave War approvers and found the direction sound.
- I checked `endUndoSession` as specified and found clearing entries while preserving hooks, stores, and installation state to be the correct session-boundary operation.
- I checked the OIL award deferral against D203 and found the filing sound.
- I checked every production `definePermission` call; no registration sites beyond scheduler, people/settings, undo, Leave War, and Tracker were found.
- I checked the product-side localhost bridge restriction and found it sound; only the driver/deployed-check dependency remains.
- I checked D210’s ordering and found the separate Accounts FULL check correctly precedes `[DRAFT-PENDING]`.
- The worktree remained clean; no file was edited.

Verdict: BLOCK

