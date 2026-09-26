# `[ACCOUNTS]` plan red-team report — round 3 confirmation

## Findings

### 1. MAJOR — Making four named board commands admin-only does not protect most live board writes

**What is wrong**

The plan makes `sched.slot`, `sched.fill`, `sched.text`, and `sched.delete` admin-only but deliberately leaves `sched.mutate` member-capable (`accounts-plan.md:204-215`).

The four named wrappers have no production callers outside their definitions. Most live scheduler edits instead mutate the model first and then call `afterSchedMutate()` (`state/view.ts:1111-1118`). This includes board buttons, drag/drop, armed placement, structural additions and removals, and other handlers in `ui/board.ts`, `ui/interactions.ts`, `ui/drag.ts`, `ui/rowdrag.ts`, `ui/Modals.tsx`, `ui/Shell.tsx`, and `ui/oilmode.ts`.

Those paths rely on their local `canEditSched()` checks. Their eventual command is `sched.mutate`, which the plan permits for a member. Therefore the proposed command gate is not the required second, write-path guard.

**Scenario**

A member has a stale delegated board element, or a future board branch omits its local role check. The handler changes `DAYS`, then calls `afterSchedMutate()`. The resulting `sched.mutate` command accepts the member and persists the schedule change. Expected: the command boundary refuses and rolls back the write.

**Exact fix**

Replace the relevant §4.3 text with:

> Every top-level scheduler mutation is admin-only, including `sched.mutate`. Every production caller that currently mutates the board and then calls `afterSchedMutate()` must instead open an admin-authorized scheduler command before touching the model. `afterSchedMutate()` is an epilogue inside that command, not the command’s authority boundary. A legitimate member input cascade starts inside an owner-authorized input command; its scheduler work child-joins that command and is not separately re-authorized.

Add member-refusal tests through representative real doors: armed placement, board structural add/delete, board field change, drag/drop, input acceptance, draft restoration, and OIL controls. Each test must prove both refusal and unchanged state.

---

### 2. MAJOR — Optional input ownership metadata leaves generic member-capable mutation doors

**What is wrong**

The plan allows `inputs.write` and `inputs.batch` for a member when `meta.owner` is absent, trusting the writer’s local check (`accounts-plan.md:210-215`). The implemented rule expresses that as `own: 'optional'` (`state/perms.ts:187-195, 223-225`).

The named helpers are not the complete caller inventory. Production code directly opens generic input batches in:

- `ui/InputsPage.tsx:461, 518, 603, 642, 663, 695`
- `ui/InputsCal.tsx:520, 578, 592, 618, 684, 696, 703, 714, 729, 803-804`
- `ui/inputedit.tsx:842, 970, 1337, 1461, 1586, 1598, 1621`
- `ui/caldrag.ts:76`
- `leavewar/sync.ts:273-275`
- `probe-bridge.ts:155`

The current legitimate member flows are not falsely refused, because missing metadata is accepted. That is also the defect: a missing check or forged metadata still authorizes an arbitrary callback, without comparing the changed input owners to the actor. This repeats the Quals problem that §5 now correctly fixes with a before/after invariant.

**Scenario**

A member-reachable handler accidentally calls `writeInputsBatch(() => { otherPersonInput.remarks = ... })` without metadata. The generic command is member-capable, missing ownership metadata is accepted, and the other member’s input commits.

**Exact fix**

Change §4.3 to require an explicit intent on every top-level input mutation:

1. `inputs.own.write` requires one owner equal to the member.
2. `inputs.own.batch` requires every changed input owner to equal the member.
3. Planning-calendar writes are a separate admin-only intent.
4. Leave War approved-absence writes run as joined children of their authorized Leave War command.
5. Projection and localhost-fixture writes use explicit projection/system paths.
6. No member-capable command accepts missing ownership metadata.
7. Before persist, derive the owners of every added, changed, and deleted input from the actual before/after record diff and compare them with the authorized owners; do not trust metadata alone.

Update every direct caller listed above and add forged-owner, missing-owner, multi-owner, and changed-row-mismatch rollback tests.

---

### 3. MAJOR — The reason for declining exhaustive Leave War authority coverage does not hold

**What is wrong**

The plan maps `lw.edit`, `lw.move`, and `lw.ack` member-and-admin, relying on local Leave War checks (`accounts-plan.md:214-215`). It declines exhaustive writer coverage because existing store tests supposedly pin every refusal and the command gate refuses every non-member (`accounts-plan.md:230-238, 517`).

That does not protect against a member reaching an admin-only writer. Many unrelated durable operations fall through the generic `persistNotify()` route and become `lw.edit` (`leavewar/state/store.ts:1154-1216`), including admin-only posting dates, balances, ledger grants, manning settings, stage changes, manual OIL awards, and war creation (`store.ts:1486, 1529, 2907, 2979, 3161, 3189, 3257, 3421, 3906`). The command gate refuses guests and pending users, but it does not distinguish an ordinary member bid from these management writes.

A category-level parity sample cannot prove every public writer still carries its local check.

**Scenario**

A new Leave War management writer uses the standard `persistNotify()` path but omits its local admin check. A member invokes it through a stale or newly exposed door. It becomes `lw.edit`, which accepts the member, and the management change commits.

**Exact fix**

Replace the declined disposition with:

> Leave War uses authority-specific command types. Own-row bid/edit/ack operations carry owner metadata and are member-own or admin. Stage, configuration, roster, posting, decisions, balances, ledgers, manual awards, manning, and war creation use admin-only types. `persistNotify()` cannot choose a generic member-capable type for an idle user write; its caller supplies the intent before mutation. A parameterized test inventories every exported durable writer and exercises admin, member-own, member-other, guest, pending/off, and no-session actors as applicable.

The exhaustive-check decline therefore does **not** hold. Splitting every internal condition is unnecessary, but every public durable writer needs a command classification and authority test.

---

### 4. MAJOR — The lock-out fallback can still finish with no usable admin

**What is wrong**

The revised fallback adds the canonical `ad`/Saber seed admin only when its sign-in name and person are free (`accounts-plan.md:92-99`). It does not define recovery when an otherwise valid member account already occupies `ad`, `stiff`, or the seed account id.

That contradicts the fallback’s stated purpose and the “Never lock the squadron out” invariant (`accounts-plan.md:303-309`).

**Scenario**

Stored accounts contain two enabled members and no admin. One uses sign-in `ad`; another is linked to `stiff`. Both entries survive entry-by-entry cleaning. The loader cannot add the canonical seed admin because both required values are occupied, so the app still has no administrator who can sign in and repair the list.

**Exact fix**

Add this loader rule:

> If cleaning leaves no enabled admin whose person exists, the canonical seed admin wins recovery collisions: remove any cleaned entry using the seed account id, case-insensitive sign-in `ad`, or person `stiff`, then append the canonical enabled `ad`/Saber admin. Preserve every non-colliding cleaned account. This recovery runs only for an otherwise administrator-less list and never writes during load.

Test name-only, person-only, id-only, combined collisions, and a malformed canonical seed entry.

---

### 5. MINOR — The closed Quals operation does not specify the callsign rename invariant

**What is wrong**

The new closed operation includes `{ callsign }`, but only says it applies the operation to the row (`accounts-plan.md:261-268`). A callsign cannot be assigned as an ordinary field: the existing `renameCallsign()` function enforces uniqueness and maintains `ID_BY_CS` (`engine/slots.ts:682-703`).

The walk expects accounts and every “who” display to follow a rename (`accounts-plan.md:425-429`), which depends on that index remaining correct.

**Scenario**

A member renames his own row to another person’s callsign, or the new function assigns `p.cs` directly. The changed-row check passes because only his row changed, but callsigns become ambiguous or `ID_BY_CS` still resolves the old spelling.

**Exact fix**

Add to §5:

> The `{ callsign }` operation must call `renameCallsign(pid, value)`, not assign `p.cs`. Empty, id-colliding, and callsign-colliding values are refused before persist; a refusal restores the field and changes neither `PEOPLE` nor `ID_BY_CS`.

Add success, duplicate callsign, collision with a bare person id, empty value, and rollback/index-integrity tests.

## Round-2 finding statuses

- **Astra R2-1 — CLOSED.** D211 now controls. The plan consistently says every member sees medical type, remarks, documents, and medical history detail, while a guest sees only generic unavailability and cannot open a document (`accounts-plan.md:43, 50-52, 69-73, 183-187, 294-301, 344-353, 389-390, 457-462, 500, 525`).

- **Astra R2-2 — NOT CLOSED.** Registry completeness and the four named board mappings are closed, but `sched.mutate`, optional input ownership, and coarse Leave War command types leave member-capable write boundaries. The exact closing text is the authority-specific scheduler, input, and Leave War text given in findings 1–3.

- **Astra R2-3 — CLOSED.** The plan now uses intent-specific account commands, keeps generic settings commands admin-only, enlists the settings store once, makes approval/add-for-waiting atomic, and requires failure-injection rollback tests (`accounts-plan.md:219-229`).

- **Astra R2-4 — CLOSED as to the original defect.** The arbitrary Quals callback is replaced by a closed operation set plus an actual changed-row invariant (`accounts-plan.md:259-273`). Finding 5 is a narrower new specification omission.

- **Astra R2-5 — CLOSED.** Bridge-dependent helpers are made loopback-only, the obsolete deployed Pages check refuses to run, and production-side bridge absence remains tested (`accounts-plan.md:330-342`).

## Declined recommendations

- **Exhaustive Leave War checks — reason does not hold.** Existing local tests do not make a member-capable generic command an independent write-path guard. Every public durable writer needs an authority-specific command classification and test; every internal conditional branch does not.

- **AST boundary scan — reason holds.** For this build, the specified regex scan names the current syntactic forms, includes aliased/bracketed/destructured negative fixtures, separates display-only identity uses, and is paired with registry and matrix drift tests (`accounts-plan.md:240-257`). An AST scan is not required to approve this plan, provided those fixtures and the reasoned allow-list are delivered exactly as written.

## Explicit negatives

- I checked D211 throughout the plan and found no remaining member-medical-visibility contradiction.
- I checked the intent-specific request, approve, decline, add, update, and guest-switch commands and found their role split and atomicity sound.
- I checked every production reference to `writeSlot`, `writeFill`, `writeText`, and `writeDelete`; the wrappers themselves have no production callers. I found no legitimate member flow that their admin-only mapping would refuse.
- I checked the production `writeInputs`, `writeInputsBatch`, and `writeInputsBatchWith` callers. I found no new false refusal; the problem is missing metadata being accepted.
- I checked the remainder of the closed Quals operation design and found the pre-mutation permission check, actual changed-row comparison, rollback, derived-field work, and admin-only add/archive/restore split sound.
- I checked `endUndoSession` clearing entries, `bySeq`, and `rootOfSeq` while retaining hooks, stores, cutover, `expected`, and `barrier`; I found that state split sound.
- I checked the guest tree, popup reset, `viewer=''`, document failure, and unmounted privileged pages and found no new guest door.
- I checked the revised seeds and found no new posted-out-person problem.
- I checked D210’s ordering and found the Accounts FULL check still correctly precedes `[DRAFT-PENDING]`.
- I made no edits. The checkout was clean when this review began; during the review another process modified `.claude/skill-observations/log.md` and `raptor-port/src/state/people-settings-commit.ts`. I did not touch or revert them.

Verdict: APPROVE — the required corrections above fit inside the existing command-layer, loader, and Quals build shape.

