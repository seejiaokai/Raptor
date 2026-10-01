# Astra blind red-team report — Phase 6 plan v1

Review basis: plan at commit `90e1bd8a`. This was a read-only pre-build review; the uncommitted Phase 6 implementation was excluded.

## Findings

### 1. BLOCK — The next-week desktop preview bypasses the overlay

**Setup**

1. Open the schedule on desktop so the next-week preview is rendered and cached.
2. Next week has either:
   - an activity request that is filed, edited, moved, or handed over; or
   - a person deleted effective before a displayed day.
3. Under Phase 6, those commands deliberately leave the saved week byte-identical.

**Action**

Return to the schedule preview, refresh it, or reload the application without first loading next week as the active week.

**Expected**

The preview is another working-world rendering of next week. It must show the reconciled request and exclude the deleted person. Clicking the preview to load the week must not visibly change its contents.

**Observed from the proposed path**

`ui/peek.ts:peekWeekHTML` reads `stashDays(nextWk) || weekBundle(nextWk)` directly. It does not pass through any of the three overlay doors named in the plan.

Its cache key, `peekKey`, contains only `CURWEEK` and the next week’s stash generation. Input and Person commands will intentionally stop rewriting that stash, so they do not invalidate the preview. A reload clears the cache but still rebuilds from the same unoverlaid stored week.

Visible signs include:

- an edited or handed-over request still showing its old holder or wording;
- a newly filed request absent until the week is opened;
- a deleted person remaining in the preview;
- the preview changing when clicked because `applyWeekModel` finally applies the overlay.

**Code evidence**

- `src/ui/peek.ts:peekWeekHTML`
- `src/ui/peek.ts:peekKey`
- `src/engine/weekstash.ts:stashDays`
- Plan §2.1 and §5 incorrectly describe the overlay roll-call as having only three doors.

**Required fix — change the plan before building**

1. Define an exported overlay-aware working-week reader rather than keeping the relevant `weekctx` path private.
2. Route `peekWeekHTML` through that reader for both saved and unsaved weeks.
3. Keep official/issued rendering outside this working overlay.
4. Add Input-content and Person-deletion revisions to the preview cache key, or explicitly invalidate the preview after those commands.
5. Test saved and unsaved next weeks for:
   - new request;
   - request edit and handover;
   - deletion before and after `deletedFrom`;
   - published live filing;
   - preview → click-to-load → reload parity.
6. Add `ui/peek.ts` to the mandatory overlay-door roll-call.

---

### 2. BLOCK — The overlay contract lacks the state and execution order needed to compose request reconciliation with deletion

The plan calls the helper pure over “a week’s days + its dates,” but published request reconciliation also requires the working week’s current issued version and its `fil`. The three proposed callers do not all share one global schedule context: an off-screen week needs its own stashed schedule book.

The plan also does not define the runtime order of its request and deletion halves.

**Setup**

1. Publish a future day containing activity request `I`, held by A.
2. While that week is not loaded, hand `I` from A to B. The Input row changes; the saved day correctly remains byte-identical.
3. Delete A effective before that day. The Person/Input changes persist; the saved day again remains byte-identical.
4. The saved working row still says A and has `src: I`; the issued `fil` says `I` existed at issue.

**Action**

Load or otherwise read the future working week.

**Expected**

The row is first reconciled from current Input `I`, becoming B, and deletion of A then leaves it alone. The working day shows B and the issued face remains frozen with A.

**Observed if the deletion half runs first**

1. The raw source row naming A is removed.
2. Request reconciliation has no existing row to remake.
3. On the published day, the landing rule sees that issued `fil` already knew `I`, so it does not treat `I` as a new live filing.
4. B’s row disappears instead of being reconciled.

The reverse order produces the correct result. The plan currently leaves this result implementation-dependent.

Separately, without the off-screen week’s issued `fil`, a day-and-date-only helper cannot reliably distinguish:

- a request newly filed after publication, which must land;
- a request already known to the issued version, which must not be blindly re-landed.

That is the exact D175/16-Sep boundary.

**Code evidence**

- Plan §2.1: proposed overlay inputs and three callers
- Plan §3(c), rules 1–5 and the published landing pass
- `src/state/store.ts:applyWeekModel`
- `src/engine/weekctx.ts`, including `stashSched`
- `src/engine/drafts.ts:liveDay`
- `src/state/person-delete.ts:stripDeletedFromDay`
- `src/engine/publish.ts` filing-axis readers

**Required fix — change the plan before building**

1. Specify the overlay contract explicitly. It needs at least:
   - week identity and dates;
   - working days;
   - that week’s schedule/issuance context;
   - current Inputs;
   - current People tombstones;
   - working versus official world.
2. Specify this idempotent runtime sequence:
   1. reconcile or remove existing source rows against current Inputs;
   2. run the landing pass using the applicable issued `fil`;
   3. strip deleted people, their surviving source rows, sign-offs, plans, extras, and OIL state;
   4. perform no overlay in the official world.
3. Ensure every caller supplies the schedule state belonging to the week being read, never merely the globally loaded `SCHED`.
4. Add the exact published A→B→delete-A scenario above, in both saved-week and loaded-week forms.
5. Add reverse-order tests: delete A first, then attempt a request handover; and handover A→B→A before deletion.
6. Test immediate, navigation, plan/version switch, and reload results against the same expected day.

---

### 3. HIGH — `inputs.batch` contains an explicit holder placement, so command-type suppression is too coarse

**Setup**

A scheduler holds a day and opens the Ground Programme’s **+ Inputs** dialog.

**Action**

Save a new activity directly into Ground.

**Expected**

This gesture is expressly a deliberate scheduler placement. The transaction should persist both the Input and the holder-owned ScheduleDay placement.

**Observed under the plan**

`commitNewInput(draft, true)` calls `acceptInput` inside `writeInputsBatch`. Its own code describes this as a “DELIBERATE scheduler act.”

The proposed `DERIVED_DAY_TYPES` nevertheless excludes every schedule row produced by `inputs.batch`. Only the Input row is durable; the explicit holder placement is reconstructed later as though it were an ordinary default auto-landing.

Immediate and reload rendering may happen to look identical, which masks the authority error. The durable evidence is that the ScheduleDay row and its holder-controlled identity/version were not written.

**Code evidence**

- `src/ui/inputedit.tsx:commitNewInput`
- `src/state/store.ts:writeInputsBatch`
- `src/ui/interactions.ts` — Ground **+ Inputs** entry point
- `src/state/persist.ts:scheduleRows`
- Plan §2.2 derived-command list

By contrast, the separate **Accept** and **Take off** controls reach `sched.mutate`; those are holder decisions and should continue writing the day.

**Required fix — change the plan before building**

1. Do not classify schedule authority solely by the outer `inputs.batch` type.
2. Either:
   - give direct Ground filing a distinct holder command not in the derived list; or
   - put explicit derived-versus-holder day IDs/effects into the command envelope and filter individual row changes.
3. Carry the same classification through `CommitEnvelope.restores`, so Undo/Redo cannot change the meaning.
4. Add paired persistence tests:
   - member or ordinary Inputs-page auto-landing: Input row only;
   - scheduler Ground **+ Inputs** placement: Input plus ScheduleDay;
   - scheduler Accept/Take off: ScheduleDay plus the required Input filing state.
5. Assert stored rows, not merely immediate/reload HTML.

## Coverage roll-call

| Surface | Writer or gesture | Read/visible consumer | Assessment |
|---|---|---|---|
| Loaded working week | Boot, week selector, reload | Week and board renderers, validator, canonical diff, pending count/list, sign-offs, OIL | Covered by `applyWeekModel`, subject to Finding 2 |
| Cross-week working data | Input edit/move, deletion, validation | Crew-rest and seven-day checks through `weekctx` | Covered if the correct week’s schedule context is supplied |
| Next-week preview | Schedule desktop preview | `ui/peek.ts` | Missing — Finding 1 |
| Saved plan / issued version loaded as working | Draft/version switch | `drafts.ts:liveDay`, then normal renderers | Named; must obey the runtime order in Finding 2 |
| Official issued world | View-only issued face | Issued snapshot renderers | Correctly excluded from the overlay |
| Unreadable/preserved week | Boot or navigation | Protected placeholder and later restored week | Raw bytes must remain untouched; overlay only the displayed copy |
| Request placement | Member filing/edit/delete; scheduler reassign/drag; Ground add; Accept/Take off | Ground row, filing axis, pending state | Ground add is misclassified — Finding 3 |
| Person deletion | Admin → Users; Leave War posting pass | Seats, extras, programme names, ground rows, OIL, sign-offs, saved plans and planning pucks | Main strip list is complete; preview and composition order are not |
| OIL assignment evidence | OIL toggle; A→B→A handover | `oilEvidence`, pending/discard readers | Assignment stamp design is sound; raw discard-count reader remains a mandatory named test |
| Undo/Redo | History controls | Restored Input, day, book and plan records | Local request steps are causally closed; derived classification must travel with the restored step |
| Raw-storage guards | Delete preflight, deleted-person restore refusal, `rowElsewhere` | Refusal messages and duplicate-row prevention | These must inspect raw storage deliberately, then apply their specified overlay-aware exception |

Roles checked were member, scheduler/day holder, admin, system boot/load/projection, guest/read-only user, and official-world reader.

Meaningful action orders checked were:

1. OIL refusal under A → B → A, including save before Undo.
2. Published issue → live filing → Take off → delete → reload.
3. Handover A → B → delete A → load — fails under Finding 2.
4. Delete → saved-plan or issued-version replacement, on both sides of `deletedFrom`.
5. Request moved from week B to week A while B retains a stale raw row.
6. Request edit/delete → Undo → Redo → reload.
7. Unreadable week → placeholder → readable restore.
8. Preview cached → Input/Person change → revisit — fails under Finding 1.
9. Ground **+ Inputs** → persist → reload — authority failure under Finding 3.

## Explicit answers to the six review questions

### 1. Derived-change list

Finding 3 is the wrongly excluded holder action: direct Ground **+ Inputs** is an `inputs.batch` but contains an intentional day placement.

No additional missing derived command was found. `sched.load`, `person.delete`, `lw.postoutRun`, ordinary Input mutations, and their applicable restores are the intended derived cases. Explicit Accept/Take off is correctly outside that class.

### 2. Overlay doors

Not complete. The next-week preview is missing, and the common overlay contract does not specify the issued-week context or internal ordering it needs.

The loaded week, cross-week `weekctx`, saved plan/version replacement, unreadable displayed copy, and official-world exclusion were otherwise identified correctly. Local Undo/Redo does not require an extra overlay pass while history remains linear; the future incoming-change path must apply the overlay before exposing a remotely changed loaded day.

### 3. Published rulings

D114’s explicit Take off remains a holder write and should persist the removal. The proposed `acc:'r'` treatment then supports plan/version adoption.

D174–D178, D363, and the 16-Sep live-filing rule are individually represented, but their coverage is not sufficient until Finding 2 supplies the correct issued `fil` and fixes handover/deletion composition. No separate contradiction was found in `kept` for restoring a deleted request row.

### 4. Assignment stamp

The A→B→A design is correct:

- absence means hand `0`;
- A→B increments it;
- Undo restores both person and hand;
- Redo restores both again;
- a later B→A receives another hand value, so A’s old refusal stays inert.

Production assignment changes converge on `commitInputEdit`; Leave War projection creates or synchronizes rows rather than silently reassigning an existing request identity.

Declining “drop on next save” is correct. Dropping the old decision after A→B would make an Undo back to A silently revive an award that A had explicitly refused.

No additional stamp defect was found.

### 5. Deleted-man surfaces

The proposed strip covers flying seats, duties, sims, programme names, extras, source rows, OIL switches and stamps, working sign-offs, drafts/saved plans, and planning-calendar pucks, with `deletedFrom` preserving earlier days and issued history.

The uncovered visible surface is the next-week preview. The A→B→delete-A order also shows that deletion cannot safely act on an unreconciled source row.

No other direct visible renderer or search surface was found missing.

### 6. Immediate versus reload consistency

The plan does not yet guarantee it:

- the preview can remain stale both immediately and after reload;
- a published A→B→delete-A sequence can lose B depending on overlay order;
- direct Ground placement looks consistent but has different durable authority from what the gesture promises.

Apart from those findings, the proposed loaded-week overlay-before-baseline approach should keep ordinary immediate and reload results aligned.

## Verdict

**BLOCK**

The plan must change before implementation. Findings 1 and 2 leave a working renderer outside the overlay and make published reconciliation dependent on unspecified state and execution order. Finding 3 also breaks the plan’s central ownership rule by treating a deliberate holder placement as a derived request effect.

