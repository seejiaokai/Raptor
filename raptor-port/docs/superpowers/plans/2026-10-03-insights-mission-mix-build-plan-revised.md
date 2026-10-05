# Insights mission mix — revised implementation plan, 3 Oct 2026

Author: Astra, the D496 planning delegate. **Authored proposal, not self-approved.** Sol independently challenges this
revision; the owner still needs the final look. This document replaces the implementation directions in the frozen
`2026-10-03-insights-mission-mix-build-plan.md`; that file and its review records remain unchanged.

Planning checkout: `claude/planning-filing-3-oct`, reported clean at `0c0dfd1e` before this document. Source baseline
remains `34eb603f` (last source change `4cb14a98`). Frozen original SHA256:
`5889ECDC501EDFDCA982A090790DE4CFEDB66E0AF53066C4B50B93A7FB052968`.
Read the whole independent `2026-10-03-insights-opus-plan-review.md`, including its controlling §7 addendum.
The current spec and FULL D512–D531 govern; D529–D531 override earlier conflicting lifecycle/publication wording.

**Now: tier NONE, planning only.** No application code, tests or runtime evidence comes from this document. D515
reserves implementation for a NEW chat after the plan and pictures are agreed. That chat uses its own
`codex/insights-mission-mix` branch from the agreed planning branch, not the checked Rally or Discard build branches.
Bind the eventual committed plan/spec/picture hashes in its brief. Preserve those complete checked builds separately;
do not cherry-pick partial application changes between them. No merge, main push or PR for merging is authorized.
The early Opus plan read under D528 does not replace Claude's later code/scenario read before main. Under D496,
Sol builds/fixes; a fresh Astra independently inspects the resulting code, never its own authored plan as approval.

## 1. Decision boundary and review dispositions

The owner accepted O1–O3 with “1-3 as recommended”, after O2 was explained as “count at once”. The independent D138
meaning read found D529, D530 and D531 short lines faithful to their full rows and current homes: scheduler rulings,
`ui-contracts.md` §Week Insights, the spec's newest owner-answer section and `[INSIGHTS-MISSION-MIX]` in OUTSTANDING.
That meaning read is not approval of this implementation proposal. No new ruling is made here; D532 remains next.

| Review item | Disposition and where this revision resolves it |
|---|---|
| B1 | Accept. Context clauses split at both `;` and `//`; single `/`, commas and hyphens remain inside clauses (§3, S06–S07). |
| B2 | Accept. Shared transient markup is inserted directly after AREA, outside the line, preserving the identical focused node and selection. Later builders reconcile exactly one copy (§7, S22–S24). |
| B3 / O1 | D529 accepted. Own single-target source/structural edits compare formation identity AND context, and ask once for a new unresolved context, including Mission changes (§7, S08–S10). |
| B4 / O1 | D529 accepted. Unchanged Tab, reading, Escape and Later never auto-ask; temporary Choose/Change provides manual access (§7, S11). |
| B5 / O2 | Original finding/fix withdrawn by D530 and review §7. No role field or composite in canonical Mission, day keys or signed snapshots. Separate context-addressed annotation records replace that architecture (§4–§6, S13–S18). |
| I1 | Accept derived validity. Source edits never clear or rewrite saved answers; lookup selects the exact applicable context. Returning to an old context reuses its answer (§3–§5). |
| I2 | Accept. Pin context format v1, identity encoding and golden vectors; unsupported versions remain unread/applied nowhere, never guessed or rewritten (§3–§4). |
| I3 | Accept. Register the distinct feature setting in all five named seams; test the real toggle's Undo/Redo words, landing and display (§8, S27). |
| I4 | Accept, revised for D530. A distinct annotation command/store has its own Undo label and context; no `sched.mutate` role-only write (§4, §6). |
| I5 | Accept the accountability need, revise mechanism for D530/I1. Each actual answer/correction has one actor/history line; Undo/Redo has its own line. Text edits retain their existing text history; no fictional role-clear command or AL change (§6, S17). |
| I6 / O3 | D531 accepted. Non-exact Mission cues ask; bounded RED AIR spelling aliases are specified as technical normalization, not another owner ruling (§3, S01–S02). |
| I7 | Accept and expand. The falsifiable matrix includes actual writers, both editor adapters, all contexts/copies, permission bypass, sign/pending invariance and rulecheck (§10). |
| I8 | Accept. Guard missing person labels in both flyer sort and rendering, using the existing hours-list fallback style (§9, S29). |

## 2. Product scope and unchanged count contract

One person's weekly sortie bar may contain Blue and Red segments. A formation has one side, never different sides per
aircraft. Exact DS / RED / RED AIR Missions are automatic Red with no question or override; other Missions use the cue
policy in §3. Conditional answers are explicit, never inferred from DS FOR, DS FROM, unit names or support direction.
There is no persistent role field/mark on a schedule line. Existing flags, warning marks and amendment marks keep their
existing meanings. The question appears below the formation's AREA, temporarily using vertical space, not over Remarks.

The distinct squadron Logic setting is Off by default for every installation. Off means ordinary total bars, no Blue/Red
legend and no role questions; it retains saved answers. On uses split bars only when ALL counted roles for that person
are resolved. Otherwise the person's whole bar is the ordinary total, not a partial split or third colour. Enabling,
loading and Undo never launch a queue. Initially show twelve flyers, then Show all; retain existing total-descending sort,
then callsign. A newly opened modal/week resets expansion; an update within the same opening preserves it.

`computeInsights()` already obtains one `issuedWorld()` for the week. Preserve that day-by-day source: latest active
published version if issued, working day otherwise. D530 changes only where a role ANSWER comes from: its annotation
is looked up against that chosen formation's exact context and may change immediately. Working wording still waits for
AL before it changes an issued day's counts or role context. Board preview of an older version does not change this
latest-issued Insights source. Do not read working roles into a published aggregate.

Keep the current traversal and units: skip standalone waves and cancelled formations/aircraft; the Sorties tile counts
eligible aircraft, including crew-empty aircraft; each occupied pilot/back seat adds one to that person's count. The
same person in both seats still counts twice. Formation totals retain their existing definition. Do not deduplicate
seats or invent crew-filled eligibility. SC / AVALON / BB standby add no flying load; SC main continues to contribute
work hours through existing EVD/workSpan rules. Hours, warnings, hidden-warning logic, idle/issued-roster identity and
D482 current Logic thresholds remain unchanged. Blue/Red categorizes sortie counts only, never hours.

## 3. Pure resolver and pinned context v1

One pure module, proposed `src/engine/mission-role.ts`, owns normalization, cue extraction, context serialization,
record validation and effective role. It takes source text and a supplied annotation reader; it never mutates a day,
annotation, signature, history, setting or published snapshot. Readers, UI triggers and copy validation use it.

1. Normalize input exactly after the established text funnel: trim, collapse whitespace, uppercase. `txtSet` in
   `engine/slots.ts` already collapses newlines; Board and Edit Schedule call it. Do not change that funnel.
2. The automatic-name set is normalized exact `DS`, `RED`, `RED AIR`. For I6, exact `REDAIR` and `RED-AIR` normalize
   to `RED AIR`; whitespace runs between RED and AIR collapse. No other misspelling or synonym is automatic Red.
3. Cues in Mission AND aircraft Remarks are bounded lexical occurrences of `DS`, `RED` or the alias `REDAIR`.
   Pin the boundary as start/end or a non-ASCII-letter on either side, so numeric designators may abut a cue:
   `DS-2`, `DS2`, `RED AIR 2`, `REDAIR2`, `RED-AIR2`, `ACM/DS` cue a question; `REDS`, `CREDIBLE`, `REDSHIFT`,
   `DSFOR` do not. This detects a reason to ASK, never a side. I6 aliases inside a clause are normalized to `RED AIR`
   only for a bounded complete `REDAIR` or `RED-AIR` token; retain adjacent designator characters in the saved context.
   Spell out this exact v1 policy in data-schema/remarks-vocabulary; no fuzzy matching, support-direction parsing or
   whole substring search. A Mission carrying extra text remains conditional even if it contains an automatic name.
4. Split every aircraft Remarks value on literal `;` or `//`. Normalize each clause; retain clauses containing a cue.
   Sort the unique retained strings with deterministic code-unit ordering, not locale-sensitive collation. Keep all
   wording within a cue-bearing clause, including FOR/FROM, unit name, digits, punctuation and a single `/`.
   Single `/`, comma and hyphen are not separators; newlines have already collapsed and are not separators either.
5. Serialize context as the exact JSON tuple `[1, normalizedMission, sortedUniqueCueClauses]`. The normalized Mission
   is the entire Mission, not just its keyword. Include Remarks from ALL aircraft of the formation, cancelled aircraft
   included: cancellation changes counting, not what the formation's support wording says. Exclude crew IDs, callsign,
   times, AREA, stores, flags, order, row IDs and duplicate equal clauses. Removing the last instance of a distinct cue
   changes context; reordering or duplicating an identical cue does not.
6. No exact automatic name and no cue anywhere means derived Blue. A cue means conditional: exact valid annotation
   for this context gives chosen Blue/Red; absent/malformed/unsupported/nonmatching annotation means unresolved.
   Automatic names ignore stored conditional choices. No automatic answers are stored.
7. Eligibility gates counting and offers, not record retention: ordinary noncancelled formation with at least one
   noncancelled aircraft is eligible, whether seats are filled or not. Excluded formations get no question/count;
   their existing annotations remain for a later matching eligible view. Eligibility-only cancellation/uncancellation
   does not invent a context or delete an answer; an unresolved newly eligible row has the temporary manual door.

Required literal golden vectors include:

| Input/action | Pinned result |
|---|---|
| ACM; `DS FOR VL // BRIEF 30 PRIOR` | `[1,"ACM",["DS FOR VL"]]` |
| Same; change 30 to 45, or use `DS FOR VL; REJOIN 1440` | Same context, retains answer, no question |
| Same; VL to RU, or FOR to FROM | Different cue context; no answer inferred |
| ACM; `DS FOR VL/RU // BRIEF 30 PRIOR` | `[1,"ACM",["DS FOR VL/RU"]]`; single slash retained |
| ACM; `DS FOR VL, REJOIN 1430` | One cue-bearing clause; comma retained |
| ACM; `DS FOR VL` plus identical clause on another aircraft | One sorted unique clause |
| `ACM/DS`; blank Remarks | `[1,"ACM/DS",[]]`, conditional unresolved without an annotation |
| `REDAIR`, `RED-AIR`, ` red  air ` | Exact normalized automatic Red, never a question |
| `REDAIR2`, `DS2`, `RED AIR 2` | Conditional cue, never automatic Red or default Blue |
| ACM; `CREDIBLE // REDS // DSFOR` | No cue, derived Blue |

**Bounded limitation:** `DS FOR VL REJOIN 1430` is one undelimited cue clause. Changing its number changes context;
the code cannot know which part of an unseparated phrase is unrelated without interpreting prose. Do not silently strip
times/numbers. The common `//` timing clause and explicit semicolon form are supported. This technical boundary must be
visible in the plan challenge and behaviour tests, not presented as semantic understanding or a new typing requirement.

Context v1 is persisted format, not a disposable cache key. Freeze its implementation/golden vectors. A later tokenizer
change requires a deliberate format/version policy; do not reinterpret v1 answers with a new tokenizer. Unknown versions
are retained as stored but not applied. This build is additive: missing records are a valid state in both old data and
NEW Off/unanswered/imported/copied data. D56 is not authority to bulk clear, migrate, seed answers or mutate issued days.

## 4. Separate annotation storage and command boundaries

Add a logical collection `insights.role`, a guarded/enlistable annotation store, and module/scope `insights` with its
week target. Proposed state module `src/state/mission-roles.ts` owns the mutable map; the pure engine module does not
import scheduler state. Logical records map individually to physical `settings/missionrole:<encoded-id>` rows. This
uses the existing storage backend/whiteboard journal, not a separate localStorage key or an appended week blob field.
`weekrows.ts` admits only its declared week fields and holds format stamps; do not make it silently carry a sidecar.

The logical id is `encodeURIComponent(JSON.stringify([1, weekKey, dayISO, formationRid, contextV1String]))`.
Use one shared encoder/strict decoder. This is collision-free tuple encoding, not a short hash, array address, callsign,
person ID or current draft ID. Validate the week/date relationship and nonempty stable formation rid. The value contains
`{ format: 1, weekKey, dayISO, formationRid, contextVersion: 1, context: contextV1String, side: 'blue' | 'red' }`;
validate value identity against the decoded id. Clone values on capture/write/restore. Actor/time/provenance belong in
the normal command envelope and history line, not in a mutable formation. Multiple contexts for one formation coexist.

One public user intent, proposed `insights.role.set`, upserts one conditional answer. Metadata carries target view
(`working` or the exact latest-issued record identity), week/date/rid/context, prior record revision and ephemeral view
generation. Before applying, re-resolve the target and permission from authoritative state; do not trust a DOM index,
captured object or temporary snapshot swap of `DAYS`. Validate tracking On, eligible formation, conditional context,
supported week, exact view/version, exact context, current session and expected record revision. Same already-chosen
side is a no-op (no write/history/Undo). Refused/stale action changes nothing and quietly closes/re-evaluates the offer.
Do not create a warning or a publication block. A contextual title prevents confusing working and published choices.
For an issued target, carry its immutable issuance key including the withdrawal/reissue suffix (`~n`), not just the
display label or reusable Original/AL version id. Unpublish then reissue can reuse a label; it must still stale the offer.

The role command enlists ONLY the annotation store, performs one record write, then notifies relevant views at the
boundary. It MUST NOT call `schedWrite`, `commitSched`, `afterSchedMutate`, `markEdit`, `reconcilePending`, `applyEnd`,
holder-base writers, sign clear/materialization or OIL reconciliation. Do not use a generic scheduler command to gain
history. No role key enters `Formation`, `Day`, `dayKeys`, canonical Mission/composites, pending, issued snapshots or
schedule CSV/print. A role-only command's durable write set is its annotation row and normal change/history rows only.

Required integration seams, implemented together:

- `command/types.ts`: logical collection/module/scope; `registry.ts`: record registration and logical-to-physical map;
  central command permission registration; store guard registration before user writes.
- `state/persist.ts`: hydrate annotation map once from the physical prefix (reset in-memory map first); register the
  `insights.role` mapper in `wireRows` before commands can run. Each put/delete maps to precisely its own row. The normal
  row consumer and whiteboard transaction provide rollback and one durable group. Replay/failed-save tests exercise
  this actual path. Do not add this prefix to `settingsStore`: two stores must never claim the same logical record.
- Boot/reload reads all persisted contexts. Week navigation, plan selection and session changes never clear durable
  answers. Session/view resets clear transient offers; rehydrating an empty backend must clear the in-memory map.
  Register the new transient state in existing VIEW_RESET/POPS_RESET coverage. Remote/harness record application uses
  the annotation store with normal revisions and `emit:false`; no remote echo or user auto-question.
- Existing destructive schema reset keeps most settings. Classify `missionrole:` as scheduler-associated data for
  that EXISTING reset predicate and unfinished-journal filter in `storage/reset.ts`/`boot.ts`, including verify-gone.
  Do not increase the schema version or invoke a reset for this feature. Template-library sidecars remain with the
  template setting. Normal delete/unpublish/plan removal does not garbage-collect annotation history or old contexts.
- Declare a MissionRoleAnswer entity in data-model/schema, with admin scheduler read/write capabilities and viewer
  reads through existing Insights access. The setting uses existing setting permission. `COMMAND_OPS` must authorize
  explicit answer and copy intents; central `ownershipViolation` must explicitly refuse `insights.role` changes by
  member/guest/pending/off actors. Its current default for unknown collections is permissive for Tracker, so UI checks
  and a command name alone are insufficient. Test a forged otherwise-allowed member command enlisting this store.
- Public mutation methods are typed intents only. No raw annotation-map/setter export or settings-adapter back door.
  The guarded store reconstruct-and-compare/write-seam tests prove every saved answer reaches a recorded command.

## 5. Working/published selection and travel rules

Lookup is always `(week, dayISO, formation rid, context of the source being used)`. It is a current statistical
annotation, not a version of the flying programme. A later correction for the same identity/context applies wherever
that exact context is used. Do not key the answer by publication sequence or saved-plan name: that would strand a valid
answer when the same unchanged wording is republished. The question retains the immutable issuance identity only to
guard its viewed target; it is not part of the durable annotation key.

**Two-context fixture:** publish formation R with Mission ACM and `DS FOR VL` (A). Change working Remarks to `DS FROM RU`
(B), leave it pending. Answer A Red from the latest-published viewing door; answer B Blue from the working editor. Keep
both records. Insights uses Red/A immediately while working B remains pending. Correcting/Undoing B never changes A.
Publish B by the existing AL/signing route: Insights selects Blue/B without copying an answer into the issue. Undo that
publication, where the existing disclosure rules permit, selects A again; the existing sign-clear-on-Unpublish rules
still apply to the PUBLICATION action, not to either answer. Answer records and issued bytes are never rewritten by
publish/Undo/unpublish. If a day is no longer issued, Insights selects its actual working context.

| Writer or travel route | Precise annotation treatment |
|---|---|
| Normal Remarks/Mission/crew/time/AREA/flag/store changes | Save schedule text normally. No annotation writes. The resolver derives applicability immediately; restore identical normalized context and its prior answer applies again. |
| Aircraft add/remove, reorder, cancellation; formation move within same day | Preserve annotations. Context uses distinct clauses, not indexes. Changed context selects another record or unresolved. Preserve formation rid under existing identity rules; clear any stale UI offer on structural navigation. |
| Move across day/week or copy to a genuinely new formation rid | Destination is a different identity. Capture source identity/context before the operation. After destination IDs/text are finalized, copy ONLY the current matching explicit answer if destination context is exactly equal. Create an independent destination record; never move/delete the source annotation or clone all its historical contexts. |
| Blank line/aircraft/wave creation | Automatic role derives from actual Mission; conditional missing answer is valid unresolved. No inherited guessed side. A real single-formation creation may meet §7's trigger; multi-target creation never prompts in bulk. |
| New-rid formation/day copies and supported imports | Same current-context copy rule. Preserve through a declared transport sidecar only; validate side, version, source binding and destination context. Missing/invalid sidecar is valid unresolved. No prerequisite answer, import modal or new import UI. |
| Day template capture | Extend DayTpl outside its day blob with optional versioned `missionRoleSeeds`: entries carry template-local `[waveIndex, formationIndex]`, pinned context and side. Capture a valid source answer, then verify it against the sanitized/crew-cleared template formation. No source week/date/rid is reused as a destination key. Positional paths are allowed only inside this immutable captured template, never as live identity. |
| Day template library load/edit | Sanitize the optional seed list against that exact sanitized blob: reject duplicate paths, out-of-range paths, unknown versions, malformed sides and mismatched contexts. Retain a valid independent value copy; no source-day writes. A template with no seeds remains valid. Rename/reorder of templates does not change seeds. |
| Day template apply | Keep D96 refusal on a published day. Create destination day normally, mint its new IDs, then revalidate each seed against its destination formation and create independent records in the SAME outer command/transaction as application. No role copied by a post-save effect. Crew clearing does not remove otherwise-valid role meaning. |
| Wave/duty templates | Current wave template stores Mission/times, not Remarks or chosen-role seeds. Keep that shape: automatic names derive; other Mission cues are unresolved. Standalone/duty structures remain outside flying role questions. No extra template editor control is inferred. |
| Saved-plan duplicate/select/switch | Source keeps formation rids. No annotation payload in a plan snapshot and NO record writes on switching. Same week/day/rid/context intentionally shares the current annotation across plans. Different contexts retain separate answers. A parked plan must never replay its old captured side over a later corrected published answer. |
| Load older issued version into working copy | Existing explicit version-load action changes the working schedule as before, preserving its identity rules. Resolve retained matching annotations by that version's actual text; no answer snapshot is copied or restored. Never mutate the older issue. No automatic prompt from loading. |
| Publish, unpublish, Undo/Redo schedule or plan content | No role snapshot copied/cleared. The restored source context selects its retained answer; absent means unresolved. Publication remains subject to existing authority/barriers. An annotation's own Undo is separate (§6). |
| Tracking Off, reload, old absent-field data | Retain all records; allow every ordinary writer to save unanswered data. On derives current validity and totals without backfill, normalization writes, prompts or migration. |

Copy/application transactions must enlist scheduler plus annotation store before either mutates, preserve source-to-
destination mapping while minting rids, and finalize destination identity before forming record ids. Destination IDs
must be genuinely fresh; a duplicate key is a refused copy collision, not permission to overwrite an existing answer.
Rollback restores both stores. One Undo reverses the copy/template gesture and its created annotations; the original
day/answer is unchanged. Deep-clone payloads so later changes cannot mutate a template, source, parked plan or Undo image.
Use a nested typed copy intent joining the authorized creation command; declare its extra entity permission and provenance.
Do not turn every ordinary scheduler edit into an annotation writer. Actual supported writer entry points must be listed
in the build roll-call, and any discovered copying route gets this same adapter and a production-route test.

## 6. Annotation Undo, history and isolation proof

Register the annotation store with `registerUndoStore`, include `insights` in the cutover modules, and classify its
collection in BOTH Undo module derivations. Add its explicit `describe.ts` phrase, e.g. “the mission role for RU 1”.
The side and human formation label come from escaped/normalized metadata; IDs remain stable underneath. Retain the
timeline's D148 own-actor rule and exact-record revision conflict checks. Admin is not permission to Undo another
person's answer. A later external write to context A blocks Undo of A, names the actor; context B is a different key.

Decode annotation IDs for `deriveContexts`/week navigation and the role-specific landing day. Do not add them to the
scheduler weekstash key-family or publication-barrier `dayKeysOf` set: they are not signed day content. `undo-wire`
loads the target week for presentation, then restores only annotation records, landing on Edit Schedule's correct day
(reopen Board if it was open), without an automatic role offer. If the answered context is not current working text,
the Undo label names it as a mission role; do not silently alter the day to recreate that context. Existing latest-
published viewer remains the inspection door. Off-week Undo must not persist the navigated weeks or run the scheduler
save/reconcile epilogue merely because it navigated. Verify existing `loadWeek`'s non-saving projection separately from
the annotation restore's changed records. No new `days`, book, issuance, holder-base, input or OIL writes are allowed.

The annotation store's `write()` applies cloned record values, including explicit delete when Undo removes a newly
created answer. It defers only a display update. No role forward validator runs during trusted inverse application;
an answer for an older context may legitimately be restored while that context is off-screen. Generic permission and
revision checks still run. Role-only entries have no publication boundary. Undo after a later publication remains a
role-only action and must not demand Unpublish. Copy closures that also changed days retain normal day/publication rules.

Add one change-history subscriber branch for actual `insights.role` writes. Explicit answer/correction emits one line
with actor, date, formation label/rid, prior side → new side and “working copy” or the viewed publication label. Use the
normal `logAction(null, ..., {date, sect, sub, fld, from, to})` route, whose line has an actor and stable date. Keep its
key outside canonical/AL addresses; history must not create a Mission pending mark. Include copy provenance for copied
records, within that gesture's history, without also logging them as a manual answer. Extend `logReversed` to derive
the annotation's date and write one appropriate Undo/Redo line. Restores do not emit a second forward-answer line.
Refusals, same-side no-ops, rendering, toggles and derived invalidation create no answer history. Wording changes keep
their normal text history; explain their derived applicability in the contract, not with a fake saved-role-clear event.

Isolation assertions must compare bytes before/after an answer, correction, refusal, Undo, Redo and toggle: live and
stored day, holder-base, canonical/digest, pending keys/count, book/signatures, parked plans, issue/retraction bytes,
inputs and OIL. Apart from intended annotation/config/history/command rows, these remain identical. Rendering may
recompute existing derived views; it must not serialize a different scheduler world. Pin untouched signed days too.

## 7. Edit transitions, manual access and caret-safe UI

Use one transient controller for both surfaces. It tracks one offer/question, origin view, stable target and generation;
it is never saved as schedule state. Automatic eligibility is a transition over `(week, day, formation rid, context v1)`,
not just a Boolean unresolved flag. Capture the BEFORE target/context at the start of the scheduler's own gesture;
inspect the committed AFTER target only after that gesture succeeds. Ask once if tracking is On, the gesture is a
single-target Remarks/Mission edit or single-formation structural create/add/remove, and the resulting eligible target
is conditional-unresolved with a new identity/context versus before. Resolved A → unresolved B AND unanswered A →
unanswered B qualify. Unchanged unresolved A after a timing-only/noncue/no-op edit does not qualify. Mission typed after
an answered Remarks cue is included. Crew-empty eligible formations are included.

Multi-target gestures (day/wave template apply, bulk copy/import, multi-formation edits) never launch an automatic
question, even if only one resulting row is unresolved. Also suppress automatic questions for toggle, load/reload,
plan/version switch, Undo/Redo, remote/system projection, unchanged focus/Tab, Escape and Later. Do not put a generic
effect on every unresolved render. Cancellation alone is not a new Mission/Remarks/structural cue edit.

Text saves through its normal door before the offer; choosing Later or leaving the page keeps that saved text and
leaves unresolved data valid. Opening Change and leaving it unanswered keeps the prior applicable answer. A later
answer is its own action/Undo; no unsaved role-dependent buffer or publish block. No persisted dismissal is needed:
same-context/no-op visits do not trigger automatically, while a new qualifying edit may ask once again.

While a conditional formation's working Remarks box is being edited, a temporary action appears after AREA:
**Choose mission role** if unresolved; **Change mission role** if a valid answer exists. This also covers Mission-only
cues with blank Remarks. Clicking it opens the same formation-wide Blue / Red / Later question, no preselected inferred
answer. Exact automatic names have neither action nor override. Keep the action while focus moves into its own controls;
remove it after focus leaves the formation/control group. An open unanswered question remains available until Later,
answer, context invalidation or navigation; do not hide it on the blur caused by clicking its own button.

**Mechanism for both editors:** one shared markup renderer plus direct sibling insertion/removal immediately after the
formation AREA strip, outside `.sb-line` and the focused editor's subtree. Use a stable wrapper keyed by target identity;
do not use full `notify`/day rebuilding just to reveal an action. On Edit Schedule the `editingText()` guard remains;
on Board do not replace a native input/textarea on focus. A later ordinary builder reads the same transient controller
and emits/reconciles exactly one equivalent sibling node. A controller generation prevents a delayed callback from
re-inserting obsolete markup. Never clone/replace the focused node as a caret “restoration”.

After save, settle the initiating Tab/click/Enter event, then insert without stealing focus, scrolling to the question,
or intercepting the event intended for the next control. Preserve `document.activeElement` object identity and exact
selection/range. Focusing the next editor must keep typing and the mobile keyboard intact. On a short viewport the
question is reached by ordinary scrolling. The temporary vertical space is approved by D520; inserting during an
uncompleted pointer gesture or shifting a target before its click dispatch is not acceptable. A screen-reader status
announcement may report availability, without moving focus; the buttons remain in ordinary keyboard order.

Invalidate obsolete transient offers on week/day/plan/version/session navigation, structural move/delete/replacement,
Undo/Redo, toggle Off and changed target context. Reorder resolution always uses rid, never an old array position; no
old click may land on a replacement row. Same-context unrelated edits may retain an offer only if identity, authority,
view and generation still match. Compare `revisionOf` for the annotation at answer time so another answer/correction
cannot be overwritten by an old question. UI dismissal does not delete an annotation.

### Published-context door — precise visible proposal for the final owner look

D530 must remain usable when working B differs from published A. The existing Board's version selector already has
“Look at” an issued version. Use **Look at the latest active published version**, then select that formation's Remarks
display to reveal temporary Choose/Change below AREA. Today DPREV Remarks is disabled. For an authorized scheduler
admin, tracking On and eligible conditional latest-issued target ONLY, render that Remarks display as a focusable
read-only input/textarea with a dedicated annotation-view attribute and NO schedule-edit `data-bfld` key. Keep the
same visual dimensions. All other published fields remain disabled; existing DPREV schedule-write refusals remain.
This gives a keyboard/touch-accessible door without making a frozen programme editable or adding a permanent marker.

The temporary action/question explicitly says **Published · Original/ALn**; working access says **Working copy** when
the distinction matters. Target lookup reads that exact issued snapshot, never working `DAYS` under a preview swap.
Allow this only while it is still the latest active published version; a new AL/unpublish/version switch invalidates
the open offer. Older historical previews stay read-only with no annotation action, but their contexts/answers remain
stored and are reusable if that wording becomes current again. No independent version picker is added to the question.

This focusable read-only door and context text are a concrete UI proposal needed by the new architecture, **not an
extra ruling inferred from D529**. Include them in the final phone/desktop pictures for owner agreement, alongside
Choose and the refined automatic trigger. Do not build before that look is agreed. There is no remaining technical
save/travel policy deferred to an unspecified later decision. Existing chart/Board placement/incomplete-bar/Later/
correction final looks also remain pending; only the shown Logic switch's look is approved under D524.

## 8. Logic feature configuration and its real Undo

Proposed fixed setting `insights` stores `{ trackBlueRedSorties: boolean }`; absence/malformed value means Off. Its
loader resets to Off before overlay, including Undo/rollback. Use the existing Admin “Edit rules” permission and edit
mode for the control labeled **Track blue/red sorties**. This is separate from VCONF/RULE_SPEC, warning severity,
RULES MODIFIED, `rulesOffCount` and Reset to standard. Resetting warning rules does not reset this feature switch.

Register together: (1) SETTINGS_KEYS; (2) SETTINGS_LOADERS with the resetting loader; (3) SETTINGS_KEYS_ALL/central
settings permission map; (4) SETTING_PHRASE; (5) `undo-wire` Logic landing. Verify the actual UI toggle goes through the
settings command hook, rather than a raw store write, and the registered settings store produces a real Undo/Redo.
The undo words identify blue/red tracking and land on Logic. No guessed claim based on `ruleApply` alone.

On/Off immediately changes chart presentation and availability of temporary actions/questions, never schedule text,
role annotations or signed content. Off dismisses current offers; On never reopens them. Valid saved answers are reused;
unresolved rows use ordinary totals. Answers for contexts changed while Off remain stored but apply only to their exact
context. No special new/existing installation defaults, no backfill and no batch of prompts after enabling.

## 9. Aggregation, chart, Board entry and source touch map

Extend the existing `computeInsights` traversal once: retain `n` and accumulate Blue/Red/unresolved occupied-seat counts
per person from the resolver for that SAME source formation. Resolve once per formation, not once per seat; acquire a
read-only annotation index once per computation, not by scanning all stored rows per flyer. Resolved `blue + red = n`;
unresolved internals sum with those counts to `n`, but the UI displays the person's WHOLE ordinary total. Do not use a
partial stack plus a residual colour. Preserve common max-total scale, total at right, sort and every other section.
Guard missing `PEOPLE[id]` in flyer sorting and `insightsHTML`, using a stable escaped id fallback like the hours list.

The proposed split has Blue then Red and compact visible numeric text, e.g. `2 blue · 2 red`; one-sided/zero values
do not create phantom segments. Off has no role legend. An incomplete row's proposed text is `Role not chosen` with
ordinary total; exact final wording/look remains for the owner picture. Expand Show all through the existing modal's
transient state and reset registries, with accessible button semantics and no stored preference. Keep the hours list
complete. Do not change totals or existing period/category controls.

Board desktop entry beside the bell and phone entry in its existing overflow open the existing shared Insights modal.
No second calculation, extra toolbar row or resizing existing buttons (D487). Close the phone menu first; keep Board
open behind the modal. Preserve original day/scroll on close. Check actual z-order and `elementFromPoint` from Shell,
Drawer and BOTH Board doors; an older published preview still opens the latest-issued weekly figures.

| Seam | Planned application work (names are implementation guidance, not authority to edit now) |
|---|---|
| Pure role and config modules | New focused resolver/context module; typed feature loader; corresponding tests and file map. |
| Annotation store | New state module, schema/data-model entity, command/types/registry/perms, persist/rowmap and boot/reset integration. |
| Undo/history | undo derive/timeline module classification/describe; undo-wire store, navigation/landing; changelines role branch and reversal date. |
| Normal text/structural writers | textedit/board/store gestures capture transitions; schedule saving itself is unchanged; targeted copy adapters enlist annotation store. |
| Templates/plans | daytpl metadata capture/sanitization/application; actual new-rid copy adapters. Draft/select/version-load readers remain annotation-free writers. |
| Render/controllers | html/board/EditWeek/SchedBoard/textedit/pops/view-reset/shared temporary markup and scoped CSS; preserve caret guards and warning overlap. |
| Insights/Logic | engine/insights, Modals, LogicPage, setting seam, existing modal openers; shared scale and issued-world provenance. |
| Kept outside role content | canonical/dayKeys, issued Day/Formation shape, holderbase and sign-off digests: invariant tests, no role/composite field. |

## 10. Independent scenario matrix for the later builder

Astra authored these scenarios; that is scenario design by the non-builder, not executed evidence or approval.
Every row needs setup, real action, observed assertion, result and evidence link. Pure resolver tests may use direct
fixtures; integration claims must operate the production command/UI path. Disconnected wires must make tests fail.

| ID | Setup/action | Required falsifiable result |
|---|---|---|
| S01 | Exact DS/RED/RED AIR and pinned aliases; automatic name plus extra Mission text | Exact names/aliases automatic Red, no override/question. Extra-text Mission follows conditional cues, never automatic by prefix. |
| S02 | DS-2, DS2, RED AIR 2, REDAIR2, ACM/DS; REDS/CREDIBLE/DSFOR; Remarks FOR/FROM/external-unit examples | Pinned lexical boundary; every real cue asks without a guessed side; near-misses remain non-cues. |
| S03 | Two Blue + two Red seats for one person; one-sided person; one unresolved role among four | Total4 unchanged; stack2+2; unresolved whole row ordinary4, no third colour or partial stack. |
| S04 | Empty aircraft, both seats, same person twice, cancelled aircraft/formation, standalone, SC main | Existing tile/person/form counts preserved; empty eligible flight can be asked; excluded flights contribute no unresolved counts; hours unchanged. |
| S05 | Saved answer; crew/times/AREA/stores/flag/reorder changes and duplicate identical cue | Answer applies, no new question/annotation/history write; cancelling retains context and uncancelling reuses it. |
| S06 | ACM + `DS FOR VL // BRIEF 30 PRIOR`, choose Red, edit30→45 through BOTH actual Remarks editors | Same context/record, saves new text, retains Red, no question. Repeat semicolon `DS FOR VL; REJOIN 1430`→1440. |
| S07 | VL→RU, FOR→FROM, single slash, comma, newlines, clause reorder and undelimited time | Golden vectors distinguish precisely; `//`/`;` split, single `/` stays, newline collapses; no semantic inference. |
| S08 | Answer Remarks under BFM; then Mission→ACM; new line Remarks-first then Mission | New conditional context becomes unresolved and exactly one automatic question appears after the committed Mission edit. |
| S09 | Unanswered A `DS FOR VL`→unanswered B `DS FROM RU`; then B's separate timing clause changes | First edit asks once for B, despite unresolved→unresolved. Timing/no-op edit on B does not re-ask. |
| S10 | Remove/add last distinct cue aircraft; one-target creation; whole-day/template/bulk gesture | Single qualifying eligible context transition asks once; removed target or ineligible result asks none; all multi-target gestures ask none. |
| S11 | Enable over six unresolved rows; Tab/read unchanged Remarks, Later, Escape, reload/Undo/toggle | No automatic question or layout shift from passing through; temporary Choose while editing; explicit click opens question. No burst. |
| S12 | Save cue; Later; navigate/reload; reopen Choose; valid answer then Change and Later | Text saved; unresolved remains valid; manual answer works; abandoned correction retains old side; no persistent marker. |
| S13 | Already-signed published conditional formation, choose/correct role with unchanged wording | Insights updates immediately; NO AL diff, pending change, day/signature/issue/holder-base/OIL write; one annotation and actor history line. |
| S14 | Published A/working B fixture in §5; choose A Red and B Blue independently through their real doors | Insights uses A. Answer/Undo B never changes A or existing pending/signature bytes. Published door cannot edit text; working door targets B only. |
| S15 | Continue S14: publish B normally, then permitted Undo publication/unpublish | Insights selects B, then actual restored source A/working as applicable; retained context records unchanged. Existing publication sign/barrier behaviour preserved. |
| S16 | Choose after text save; Undo answer, Undo text, Redo text, Redo answer; later publish and Undo role | Separate steps/words, retained older context becomes applicable; role Undo never asks Unpublish or alters signs. No auto-question on restore. |
| S17 | Answer, same-side click, correction, refusal, copy, Undo/Redo; inspect history date/actor and changes list | Exactly intended actor lines, no duplicates, no answer line for no-op/refusal/derived context change; no canonical role key or AL mark. |
| S18 | Same-rid/context saved-plan duplicate; correct answer; switch plans; different-context parked plan; older-version load | Shared current annotation survives switching; old payload never overwrites correction. Different contexts coexist. Older issue bytes remain frozen. |
| S19 | Save answered day template, reload library, apply to another unpublished day, then correct destination | Valid independent role seed travels to new rid; no alias to source/template. Published apply still refused. One Undo restores destination action and annotations. |
| S20 | Actual fresh-rid copy/move/import routes; altered context, absent/invalid seed, duplicate key, forced second-store failure | Only exact valid current answer travels; missing answer valid unresolved; identity collision refused; atomic rollback; original answer/day untouched. |
| S21 | Save through real backend, failed group/retry/reload; two contexts; empty rehydrate; existing schema wipe fixture/journal | All contexts retained and exact; no week sidecar; no answer on stale in-memory map; existing wipe filters annotation rows/journal only when wipe already due; no new migration/reset. |
| S22 | Both editors: type cue, Tab/Shift-Tab/click next cell, continue typing | SAME focused node and exact range/selection survive insertion; question appears after intended gesture; next typing works; subsequent ordinary redraw has exactly one question. |
| S23 | Focus relevant Remarks to show Choose/Change; action click, Enter/Escape, selection within textarea/contenteditable | No whole-row replacement, no lost keyboard, no Escape-generated edit/question; action clickable after blur without ghost/duplicate nodes. |
| S24 | Phone390×844, short390×568, desktop1440×1000, short laptop, keyboard-height viewport | Remarks not covered; ordinary scrolling reaches question; existing control sizes/rows and hit targets preserved; no auto-scroll/focus theft. Open every proof image. |
| S25 | Open offer then delete/copy/move row, plan/week/day switch, context change, Undo, version advance, Off/logout | Old event cannot write by stale index/rid/view/context/generation or recreate deleted offer; no dangling DOM after navigation. |
| S26 | Another actor corrects same context while question open; direct member/guest/pending/off call; forged allowed member command | Expected-revision and central changed-record guard reject; same-actor/admin-view Undo rules hold; refusal writes nothing and names conflicting actor where applicable. |
| S27 | Missing setting; actual Logic On→Undo→Redo, reload; Reset to standard; edit cue while Off then On | Uniform Off; real stored setting/Undo/words/Logic landing; no rules-off stamp/day writes/burst; Reset warning rules leaves feature alone. |
| S28 | Answer on week W, navigate elsewhere, Undo/Redo; unrelated actor/context changes | Correct target week/day landing; exact annotation only restored, no unrelated week/day writes. Own-key conflict blocks correctly; other context does not spuriously block. |
| S29 | 0/12/13/many flyers, long/missing person labels, Show all; member and guest Insights | Stable fallback and escaped rendering, no crash; total sort/scale/expansion correct; authorized viewers see identical aggregate; hours list remains complete. |
| S30 | Shell, Drawer, Board desktop/phone overflow, older preview; open and close Insights | Same latest-issued figures, topmost hit-tested modal, menu closed first, original Board/day/scroll preserved. |
| S31 | Long everything-day; repeated type/focus/role/toggle, unrelated edits, wheel/drag/week navigation | Bounded transient nodes, no duplicate scans/listeners, no unrelated save/repaint, existing performance/geometry ceilings met. |
| S32 | Published preview annotation door with diverged working copy; new AL while it is open; old historical preview | Latest-issued A can be answered without reverting B; read-only text remains uneditable at UI and write gate. Version advance refuses stale answer; old preview has no write action. |
| S33 | Malformed record/id/version/side, context normalization edges, old absent data and NEW unanswered On/Off data | No fabricated role or mutation during read; unsupported records left stored; all missing conditional answers yield total-only rows; no D56 cleanup invented. |

Exercise important action pairs in both meaningful orders on draft and issued days: wording↔answer, Mission↔answer,
Off/On↔edit, copy/template↔answer, plan switch↔correction, published/working answers↔AL, navigation↔Undo, cancel↔answer.
Use actual available controls; do not invent routes to satisfy a scenario. Add a matrix row for any newly discovered
writer/counterexample. Shared backend proof may run once under D499; each distinct editor/control still gets operated.
Tests naming applicable D512–D531 behaviour must satisfy rulecheck; don't fabricate a runtime test for a workflow-only
ruling merely to fill a list. Preserve existing explicit workflow exemptions and record the relevant behavioural pins.

## 11. Later implementation sequence and FULL verification

1. In the new chat, read AGENTS/HANDOFF/general rules/project guide, area rulings with full rows, OUTSTANDING, executor,
   bug-check order, Undo/data contracts and performance Part1. Bind approved plan/look/source baseline. Establish FULL
   evidence sheet, complete caller/writer/surface roll-call and untouched-behaviour assertions BEFORE source changes.
2. Write meaningful first-failing resolver/golden-vector/count tests, implement the pure module and typed config.
3. Write first-failing record/permission/persistence/Undo/history/isolation tests, including S14's two-context case.
   Implement annotation store/command/mapping/hydration and exact five-setting registrations. No UI shortcut/raw writes.
4. Write failing production-route travel tests; implement source/destination mapping and atomic copy/template enlistment.
   Verify all normal writers need only derived lookup, and plan/version restoration never replays stale annotation data.
5. Write failing adapter/focus/state-transition tests, implement both transient DOM adapters and published viewing door
   ONLY in its owner-agreed form. Preserve the same focused node. Test stale callbacks and permissions, not just markup.
6. Write failing aggregate/chart/opener tests; implement the shared modal, Show all, guarded labels and Board entry.
   Exercise the actual controls, counts and changed text/roles, with preserved hours/warnings/OIL assertions.
7. Complete the required gates, frozen running-app walk and fresh independent code inspection; fixes start with a
   meaningful failing regression and get affected rechecks/re-walk. Do not weaken tests or refactor unrelated engine code.

Risk: saved data, current published statistics, shared rendering, new controls/temporary row and permission paths
make the application build **FULL**, even though role records are deliberately outside signed content. No earning or
warning-rule change is intended; verify their invariance. Before execution tell the owner the checks and a rough
3–5 hour allowance, not a guaranteed finish time. Tests/gates have NOT run for this plan-only change.

The roll-call must include Logic read/edit/Undo, both schedule editors, Board working/latest-published/older previews,
member/guest/view-only/print/CSV, every modal opener and copy/template/plan/version writer, changes/history and Undo,
persistence/reload/reset, pending/signs/publication, and overlapping warning/toolbar pixels. Every row says has it,
must not (with reason), or missing, with its real usable door. Keep an everything-day fixture with ordinary/automatic/
conditional/unanswered/mixed formations, all seat/cancel/standalone cases, >12 flyers, warnings, signed issued A with
pending B, AL and parked plans. Normal walk setup uses real controls; direct injection is not proof of a UI door.

Read current gates-and-deploy instructions and execute required `npm test`, `npm run build`, `node reference/tfin.js`,
`npm run test:e2e`, `npm run smoke:tracker`, `npm run rulecheck`, `npm run docsize`, `npm run perf`, plus applicable
adapted probes. Take the PC gate lock before full suite, multi-file browser, Tracker or fanned-out walk; one such check
across all checkouts. Release immediately on success/failure. Use absolute background working directories. Do not
report old gate counts as this build's evidence.

Freeze the production bundle and source fingerprint for the scripted running-app walk; do not rebuild beneath walkers.
Operate each distinct route and meaningful action pair, inspect page errors, focus, hit testing, geometry and outcomes,
capture phone/desktop/short-viewport states and open EVERY saved picture. Pin a deliberately disconnected-wire failing
test per wired surface, restore the wire afterwards. Explain real-device/mobile-keyboard limits instead of claiming
desktop emulation proves them. Re-walk affected routes after new source fixes. The Claude cheaper-walker trial remains
owed under its standing rules; an early plan read does not run it.

Record source/bundle fingerprints, rule sweep, scenario results/failures/dispositions, gates, `Walk:` line, picture
links and device limits in `docs/handpass/<build-date>-insights-mission-mix.md`. Fresh Astra gets final code/evidence
and the standing finder brief including D56's two-condition exclusion; it never approves this Astra-authored plan.
Follow max two code-inspection rounds (initial plus fresh after fixes); unresolved findings stay explicit. Claude's
further code/scenario read is **OWED: Claude's read after the reset — codex/insights-mission-mix**, before main.

During the build, update lasting ui/engine contracts, behaviour register/rule tests as applicable, remarks vocabulary,
data-schema/data-model/permission map, feature-impact, file-map, backlog and the build chat's own HANDOFF. Do not trim
documents with source edits or edit protected working guides/reviewer briefs. Branch commit/push follows the standing
checks; no main/merge/PR-for-merging. Host owns this planning turn's spec/backlog/handoff and final owner picture work.

Final-look checklist, still pending: full split and total-only bars; Board desktop/phone doors; temporary Choose/Change
and Later; working versus latest-published context text and read-only Remarks access. D524's shown Off Logic card is
already approved. No claim of a blanket visual approval, executed verification or build permission is made here.

Rulings: none made by this plan. D529–D531 are recorded owner answers; D532 is next.
