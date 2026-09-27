# Astra red-team report — `[DRAFT-PENDING]`

Verdict: **revise before continuing the build**.

The plan gets the owner’s visible design largely right, but its data model and writer coverage are not yet safe enough for a durable shared history. I found **2 critical, 6 high, and 4 medium findings**. Every finding below affects new actions; none relies on migration or old stored data, so D56 excludes none of them.

This was a static, read-only review. I ran no tests and changed nothing. The branch already contains the first implementation commit (`67e697c5`); I used it only where it confirms a plan-level problem.

## Findings

### ASTRA-DP-01 — Critical — Two tabs can duplicate `seq` and erase each other’s history

**Evidence**

- The design stores the entire history and its next sequence number in one durable record: `raptor-port/docs/superpowers/plans/2026-09-28-draft-pending-plan.md:55-69`.
- The implementation already performs an unguarded read-modify-write of that blob: `src/engine/editlog.ts:89-125`, `src/engine/editlog.ts:286-292`.
- Each tab has its own in-memory Whiteboard loaded once: `src/storage/whiteboard.ts:43-58`.
- Browser persistence is a last-writer-wins write: `src/storage/browser.ts:70-77`.

**Concrete failure**

- Setup: tabs A and B both load history ending at `seq=100`.
- Action: A records a slot edit while B records an absence approval before either learns about the other.
- Expected: two rows, numbered and ordered uniquely, remain after reload.
- Disproof: both create `seq=101`; whichever tab writes last replaces the whole blob, so one real action disappears. “New to you,” the cap, and the audit record then all operate on the wrong history.

**Required plan fix**

1. Remove “one durable record” as the append model.
2. Add a dedicated audit persistence service in the state/storage layer.
3. Either:
   - store each history row as its own `editlog/<stable-id>` record and use a collision-proof ID plus deterministic order; or
   - allocate the numeric sequence inside a named cross-tab lock, rereading the durable head while the lock is held.
4. If numeric `seq` remains, persist the new head and row atomically in the same journaled group.
5. Propagate new rows and sweeps to other open tabs through `BroadcastChannel` or `storage` events.
6. Run cap eviction and admin sweep through the same cross-tab service; never reset the high-water mark.
7. Put `elogFlush()` before the Postman flush in `pagehide` and hidden-visibility handling. At present `guardUnload` only flushes the Postman: `src/storage/boot.ts:65-80`.
8. Add interleaving tests for two tabs appending, marking seen, sweeping, reaching the cap, page hiding before a queued microtask runs, and reloading. Assert unique identities and no missing or resurrected rows.
9. Measure the whole worst-case stored record—including seen data and transaction journal—not merely one average history row.

---

### ASTRA-DP-02 — Critical — `changeseen` cannot securely enforce “members write their own entry only”

**Evidence**

- The plan makes `changeseen` one settings map containing every person: plan `:101-110`.
- Settings are currently member-read-only: `src/state/perms.ts:65-75`.
- The hard ownership check expressly rejects every member write to `settings`: `src/state/perms.ts:385-409`.
- A generic settings command changes the whole logical `settings/changeseen` record, not one person’s sub-record: `src/state/people-settings-commit.ts:269-280`.

The plan says to add an “own entry” permission, but command metadata cannot prove that a whole-map write altered only the actor’s property. Simply exempting `settings/changeseen` would let a hand-made member command change or erase somebody else’s seen position. Two people or two tabs could also overwrite one another’s map changes.

**Concrete failure**

- Setup: Ranger and Saber have different seen positions.
- Action: Ranger submits `changes.seen` with `owner=Ranger` but a replacement map that also advances Saber.
- Expected: the command gate refuses the entire command.
- Disproof: Saber’s entry changes, or the whole command is always refused because it touched `settings`.

**Required plan fix**

1. Replace the shared settings map with a first-class logical collection such as `change.seen`.
2. Store one logical record per person, keyed by `personId`.
3. Map `changes.seen` to create/update only `change.seen/<actor.personId>`.
4. Require `meta.owner`, and validate that it equals both the actor’s person ID and every changed record ID.
5. Give admin and member own-row create/update permission; give guest, pending, off, and no-person actors none.
6. Do not authorize it through the generic settings exemption.
7. Preserve the person ID when an admin switches to member view under D292; the same record must be used in both views.
8. Test:
   - a new account with no record;
   - two people using one browser;
   - two tabs;
   - an admin switching to member view;
   - a member attempting another person’s record;
   - guest, waiting, off, and missing-person sessions;
   - cap eviction and admin sweep removing obsolete seen references.

---

### ASTRA-DP-03 — High — Ordinary input additions and deletions will be logged twice

**Evidence**

- The proposed subscriber emits a line unless the call site already logged the same input “in the same command”: plan `:79-91`.
- Commit subscribers run after latched effects are released: `src/command/commit.ts:285-293`.
- Several ordinary call sites log only **after** their input command has returned:
  - edit-window add: `src/ui/inputedit.tsx:852-882`;
  - delete: `src/ui/inputedit.tsx:1423-1451`;
  - Inputs-page add: `src/ui/InputsPage.tsx:457-464`.
- Medical split/trim paths log inside the batch instead: `src/ui/inputedit.tsx:328-371`, `:398-412`.

The timing therefore differs by door. For an ordinary add, the subscriber sees no existing line and creates one; the caller then creates a second one.

**Concrete failure**

- Setup: open the Inputs page.
- Action: add one LL entry.
- Expected: one history line naming the added absence.
- Disproof: two lines appear—one from the subscriber and one from `finishAdd`.

**Required plan fix**

1. Make the command-stream projector the sole writer for all input add, edit, delete, split, trim, reassign, accept, and unaccept events.
2. Add transaction-latched semantic metadata for reasons that raw before/after data cannot explain, such as:
   - “tail of a split medical entry”;
   - “overwritten by a newer medical entry”;
   - “approved on the Leave War.”
3. Attach that metadata while the command is active and carry it on the committed envelope.
4. Remove the post-command `logAction` calls for input add/delete.
5. Have the projector group changes by `iid` and emit exactly one semantic line for each intended history event.
6. Add exact-count tests for every door, including the Inputs page, edit modal, board add, acceptance, deletion, medical split/trim, and Leave War approval.

---

### ASTRA-DP-04 — High — The promised Undo/Redo lines have no writer on the actual Undo path

**Evidence**

- The plan promises one “Undo — …” or “Redo — …” line per affected day: plan `:70-73`.
- The old snapshot history does log undated lines: `src/state/history.ts:142-143`.
- Production UI now calls global Undo/Redo: `src/ui/Shell.tsx:27`, `:348`.
- Global Undo applies an `undo.restore` command with `origin:'restore'`: `src/undo/timeline.ts:490-527`, `:595-640`.
- The planned absence subscriber expressly consumes only `user`-origin envelopes: plan `:81-84`.

Thus the old `logAction` functions are not the production writer, and the restore envelope will be ignored.

**Concrete failure**

- Setup: move an input from Monday to Tuesday.
- Action: press the production Undo button.
- Expected: the schedule returns and both affected day histories say what was undone.
- Disproof: the original move remains the newest history record with no line saying it was reversed.

**Required plan fix**

1. Add the history append at the successful return point of `globalUndo` and `globalRedo`, not in the restore reducer.
2. Derive affected calendar dates from the undo entry’s before-and-after records, including input spans and Leave War cells.
3. Append only after `applyRestore` succeeds.
4. Emit no line for conflict, permission, missing-store, or rule refusals.
5. Use `undo/describe.ts` for the words and the current actor’s person ID/callsign for who pressed Undo.
6. Keep the audit append outside the undo timeline so Undo cannot undo its own record.
7. Test scheduler, input, cross-week input, and Leave War undo/redo; multi-day actions; refused Undo; and one line per affected day.

---

### ASTRA-DP-05 — High — One `date/end` interval cannot describe an absence moved or reshaped between spans

**Evidence**

- The planned row has only one `date` and one `end`: plan `:59-61`.
- It says the line appears on every day the absence covers: plan `:95-96`.
- The implemented reader treats that pair as one continuous interval: `src/engine/editlog.ts:68-86`.

An edit has both a before span and an after span. Using only the after span hides the change from the old days. Using the minimum start and maximum end falsely shows it on intervening days.

**Concrete failure**

- Setup: LL covers 1–2 August.
- Action: move it to 6–7 August.
- Expected: the one move record is visible when filtering 1, 2, 6, or 7 August, and not on 3–5 August.
- Disproof: it appears only on 6–7 August, or appears falsely on every day from 1–7 August.

**Required plan fix**

1. Replace filtering by a single span with an explicit affected-date set, or store both `beforeSpan` and `afterSpan`.
2. For add, use the after dates.
3. For delete, use the before dates.
4. For edit/move/shorten/extend/reassign, use the union of before and after dates.
5. Preserve the before and after spans separately for honest wording.
6. Derive week inclusion and day-picker dots from the affected-date set.
7. Add tests for disjoint moves, shortening, extension, deletion, cross-week movement, and no false dates between disjoint spans.

---

### ASTRA-DP-06 — High — “An OIL credit given or taken by hand” covers only one of two manual-award models

**Evidence**

- The plan looks only at `lw.cell` and then promises manual OIL awards: plan `:92-94`.
- Leave War owns both `lw.cell` and `lw.ledger`: `src/leavewar/state/store.ts:1176-1190`.
- Pool/manual ledger grants, edits, and removals change `lw.ledger`: `src/leavewar/state/store.ts:3312-3371`.
- Day-cell manual awards change `lw.cell`: `src/leavewar/state/store.ts:2658-2676`, `:3938-4002`.

**Concrete failure**

- Setup: an admin credits Ranger two OIL days through the credit form.
- Action: save, edit the reason, then remove the grant.
- Expected: the history contains the grant, edit, and removal with who and when.
- Disproof: no line appears because the subscriber watches only `lw.cell`.

**Required plan fix**

1. Add `lw.ledger` to the subscriber’s explicit input matrix.
2. Diff ledger entries by stable ledger ID and describe add, amount/date/reason edit, and removal.
3. Continue handling manual `oil:'manual'` cell credits through `lw.cell`.
4. Distinguish manual credits from automatic schedule projections; an automatic reconciler must not be presented as a person giving an award.
5. Cover Clear/range-clear operations that remove cell awards.
6. Test ledger grant/update/remove, cell award add/edit/remove, a clear that takes several awards, and an automatic credit that must not create a manual-award sentence.

---

### ASTRA-DP-07 — High — Publication, sign-off, and qualification writers have no inclusion ruling

**Evidence**

- D168 calls this one changes window for the whole app and D169 promises full transparency: `scheduler.md:70-71`.
- The implementation design exhaustively adds only input and Leave War subscribers: plan `:79-99`.
- First publish, AL publish, discard, and unpublish are command-routed schedule changes: `src/state/sched-commit.ts:503-586`.
- A signature is a `sched.sign` command: `src/ui/Shell.tsx:167-190`.
- Qualification, CAT, appointment, SANS, SXO, and callsign edits are one `people` command: `src/state/quals-write.ts:46-100`.
- These Quals changes can alter warnings and signature validity: `src/engine/publish.ts:1243-1258`.
- Tests list absence doors but no publication, signature, or Quals case: plan `:194-210`.

**Concrete failure**

- Setup: Saber signs and publishes AL1, later retracts it; Ranger changes his own scheduler appointment or flying qualification.
- Action: a member opens the live working copy’s history.
- Expected: operational changes that altered the official state or the schedule’s validity identify who did them.
- Disproof: AL1 exists or disappears, or the day’s warnings/signatures change, while history has no corresponding line.

**Required plan fix**

1. Add a writer-classification table to the plan before implementation.
2. Include these day-scoped actions under “The day”:
   - sign or clear a sign-off;
   - first publish;
   - publish an AL;
   - unpublish/retract;
   - discard draft marks.
3. Preserve existing history for:
   - structural add/delete/reorder;
   - a plan switch;
   - loading a version onto the working copy;
   - applying a template.
4. Explicitly exclude pure preview/navigation: merely looking at an issued version is not a change.
5. Consume relevant `people/<pid>` changes for operational qualification/CAT/SANS/SXO/scheduler-appointment changes. Attach them to loaded-week days where that person’s placement or validation result is affected, and group them under “Qualifications.”
6. If qualification changes are deliberately excluded, narrow the written promise from “whole app/every change” and record that owner-facing scope decision. Do not leave it implicit.
7. Add tests for each included action and a negative test proving version preview does not produce history.

---

### ASTRA-DP-08 — High — `iu:<iid>` cannot currently locate an Unavailable row, especially on View-only Sched

**Evidence**

- The plan says an unaccepted input jumps to `iu:<iid>`: plan `:97-99`.
- Unavailable rows expose `data-inpseat`, not a history key: `src/ui/html.ts:1902-1921`.
- That attribute is emitted only on editable rows; View-only rows omit it: `src/ui/html.ts:1912-1920`.
- History’s cell selector and reverse mapper know nothing about `data-inpseat`: `src/ui/histbubble.ts:108-130`, `:171-184`.
- `jumpToChange` relies entirely on `findHistCell`: `src/ui/interactions.ts:92-116`.

**Concrete failure**

- Setup: Ranger has an unaccepted LL shown in Tuesday’s Unavailable block. Open history from member View-only Sched.
- Action: tap the LL history line.
- Expected: Tuesday scrolls to Ranger’s Unavailable row and marks it; the window remains open.
- Disproof: “shown on the scheduler board,” “no longer on this day,” or no landing.

**Required plan fix**

1. Emit the stable `data-inpseat="<iid>"` address on Unavailable rows in edit and read-only rendering. Keep drag/edit attributes separately gated.
2. Add `[data-inpseat]` to the history cell selector.
3. Map it to `iu:<iid>` in `keyOf`.
4. Extend both board and week jumpability rules.
5. For accepted inputs, build ordered candidates: current ground-row key first, then `iu:<iid>`.
6. If neither place exists, render the line as still/non-clickable or give an honest “no place on this schedule” message.
7. Test editable week, board, admin View-only, member View-only, accepted ground, unaccepted Unavailable, deleted row, desktop, and phone.

---

### ASTRA-DP-09 — Medium — Edit Schedule’s History bubble still lacks a concrete wiring task

**Evidence**

- D116 requires the same hover/tap behavior on Edit Schedule: `scheduler.md:76`.
- The plan promises it and tests only that “History mode follows the window”: plan `:150-152`, `:205-206`.
- The only current `wireHistBubble` call is on the board wrapper: `src/ui/SchedBoard.tsx:148-161`.
- The wiring itself is documented as board-specific: `src/ui/histbubble.ts:302-306`.

A boolean History-mode assertion can pass while no Edit Schedule gesture has any listener.

**Concrete failure**

- Setup: open the Changes window on Edit Schedule.
- Action: hover a changed field on desktop or tap it on phone.
- Expected: its history bubble appears while the ordinary editing gesture still works.
- Disproof: nothing appears, or the tap shows a bubble but no longer edits/arms the cell.

**Required plan fix**

1. Add `src/ui/EditWeek.tsx` to the build’s named call-site list.
2. Wire `wireHistBubble` once on the persistent edit-week root, above the day nodes replaced by string diffing.
3. Reuse the same shared `HISTMODE`; do not create a second mode.
4. Clean up the listener when the edit-week component unmounts.
5. Add browser-level gesture tests for desktop hover and phone tap on:
   - a seat;
   - a typed field;
   - an input/Unavailable row.
6. Assert both the bubble and the underlying edit gesture work.
7. Assert closing the window turns bubbles off on both the board and edit week.

---

### ASTRA-DP-10 — Medium — Fixed `z-index:410` cannot implement “last touched comes to front”

**Evidence**

- The plan assigns both windows level 410 and says the last touched window comes to front: plan `:113-117`.
- ALL AVAIL is fixed at 410: `src/ui/scheduler.css:6287`.
- The board is 400, calendar popover 420, bubble 430, drawer/pending 440, and modal 470: `src/ui/scheduler.css:2660-2666`, `:3692`, `:4033-4043`, `:3210`, `:2860`.
- Current ALL AVAIL pointer handling does not manage a shared z-order: `src/ui/AvailWindow.tsx:322-363`.
- Planned browser tests only say the window is above the board, not which of the two windows is on top: plan `:209-210`.

**Concrete failure**

- Setup: overlap ALL AVAIL and Changes.
- Action: touch the lower window.
- Expected: it becomes the front floating window but remains below bubbles, drawers, and modals.
- Disproof: DOM order keeps the other window on top, or an ever-increasing z-index puts the window over a modal.

**Required plan fix**

1. Put activation state in `floatwin.ts`.
2. Use bounded levels, for example inactive 410 and active 411; both remain below 420/430/440/470 overlays.
3. Raise a window on pointer-down or focus anywhere inside it, not only on its grip.
4. Release its registration when closed.
5. Test both activation orders with overlapping windows using `elementFromPoint`.
6. Also assert the history bubble, drawer, input calendar, and modal retain their intended higher layer.
7. Repeat the overlap test in the phone bottom-panel form.

---

### ASTRA-DP-11 — Medium — The OG design can tag every copy of a person instead of the one changed placement

**Evidence**

- D172 says the changed puck receives OG: `scheduler.md:67`.
- The plan says the lookup is against the puck’s “place,” but specifies only an undefined `HOOKS.newToMe` lookup: plan `:158-164`.
- The renderer’s `puck()` receives a person ID, not the schedule-slot key: `src/ui/html.ts:431-509`.
- The test list covers only “a new-to-you puck,” not repeated placements: plan `:207-208`.

A person may appear in more than one place on one day. A set keyed by person would mark every copy.

**Concrete failure**

- Setup: Ranger appears in two different pucks on an unpublished day.
- Action: Saber changes only one of those placements; Ranger views the day.
- Expected: only the changed placement wears OG.
- Disproof: both Ranger pucks wear OG.

**Required plan fix**

1. Key the precomputed new-to-me set by stable schedule address, not person ID.
2. Apply OG in the seat/place wrapper where the slot key is available, or pass that key explicitly into the puck renderer.
3. Do not tag a removed placement when no puck remains; the day chip and history line carry that change.
4. Keep OG gated by viewer, unpublished state, and unseen status.
5. Test one person in multiple flying/ground/duty placements, with only one changed.
6. Test a second viewer with a different seen record.
7. Test Mark all as seen causing the affected day’s string-diff block to repaint.
8. Assert published `ALn` markup and the issued face remain byte-for-byte untouched.

---

### ASTRA-DP-12 — Medium — `sect` is promised but no writer-to-section mapping exists

**Evidence**

- The plan adds `sect` for Group by Where: plan `:59-62`.
- The window requires the exact groups Flying, Duties, Common Programme, Sims, Ground, Notes, Absences, and The day: plan `:123-126`.
- Existing structural history rows often have no key, and absence rows use a different address model: `src/engine/editlog.ts:319-332`.

Without a complete mapping, correct history rows can land in the wrong group or nowhere.

**Concrete failure**

- Setup: apply a day template, add a duty row, edit an input, and publish an AL.
- Action: select Group by Where.
- Expected: each line appears exactly once under The day, Duties, Absences, or The day/publication as defined.
- Disproof: an “Other” bucket appears, lines vanish, or the same operation groups differently depending on its door.

**Required plan fix**

1. Define a closed `HistorySection` enum in the plan.
2. Define a single `sectionOf` mapping for every schedule key prefix.
3. Require semantic history events with no key to name their section explicitly.
4. Map all input and Leave War absence events to Absences.
5. Map plan switch, template application, sign, publish, unpublish, and Undo spanning a whole day to The day unless a more specific affected object is known.
6. Map operational Quals lines as decided in ASTRA-DP-07.
7. Reject or loudly test an unmapped history event in development.
8. Add a table-driven test covering every key prefix and every keyless semantic event.

## Writer and visible-surface roll-call

| Change writer | Should enter history? | Visible sign and working gesture | Plan result |
|---|---:|---|---|
| Slot/text edit through `noteChange`/`markEdit` | Yes | Day chip; window line; OG on the exact unseen unpublished puck; hover/tap bubble; line jumps to cell | Covered |
| Structural add/delete/reorder | Yes | Day chip and window line; jump only when a surviving place exists | Existing call sites retained, but must join the one-authority design |
| Drag between days or people | Yes | One line visible under the union of old and new days; jump to current place | Date model is wrong |
| Switch live plan | Yes | Day history under The day; usually a still line because a whole-day swap has no one cell | Existing `logAction` covers it |
| Load issued version onto working copy | Yes | Day history under The day; issued face remains untouched | Existing call site covers it |
| Merely preview a version | No | No chip or history line; it is navigation | Must be stated explicitly |
| Apply a day template | Yes | Day history under The day | Existing call site covers it |
| First publish / AL publish / unpublish | Yes | Day history, actor and time; publication state remains visible in the heading | Missing |
| Sign or clear a sign-off | Yes | Day history under The day; no cell jump required | Missing |
| Discard marks | Yes | Day history saying what was discarded | Missing |
| Input add/edit/delete from every door | Yes | Absences group; jump to ground or Unavailable | Duplicate and jump defects |
| Medical cut/split/tail | Yes | Full details for admin/member; affected old and new dates | Reason metadata and span fix required |
| Leave War bid/approve/refuse/Ack/back-to-bid/move/delete | Yes | Absences group; jump if an Input/place exists, otherwise a still line | Broadly covered |
| Manual OIL cell award | Yes | History line with person/date/amount/reason; normally still | Covered only incompletely |
| Manual OIL ledger grant/edit/remove | Yes | Same, in the relevant day/week | Missing |
| Quals change affecting a loaded schedule | Yes, or explicitly rule it out | Affected day history and resulting warnings/signatures; no false cell jump | No decision or implementation |
| Undo/Redo | Yes | One line on every affected day after a successful action | Promise exists, writer missing |

The production doors should be:

- Edit week, desktop and phone: day chip, admin week icon, window, OG, bubbles.
- Scheduler board, desktop and phone: sign-strip chip, `#sbHist`, window, OG, bubbles.
- View-only Sched, admin/member: chip on live draft or working copy, read-only window, OG; no bubbles.
- Admin top bar: icon only, counting unseen changes across the loaded week.
- Member top bar: no door.
- Guest: no chip, window, or OG.
- Issued face/version preview: no chip or OG from the live working history.
- Print and CSV: no OG or interactive history marks.
- Day panel: the same `pending/new/changes` words as the heading, not the old touched-key count.

## Explicit negatives — checked and found sound

- The plan correctly applies the later rulings over stale mock-up text:
  - D171 removes the member top-bar button despite `changes-doors.html:1`.
  - D211 shows medical history in full to members despite `changes-window.html:45-48`.
  - D172 selects OG and keeps the existing header seals/tags unchanged.
- D99/D100’s net pending list remains distinct from the append-only working history. Putting a change back removes it from “To go out” but leaves both history actions.
- D105 and D107 are represented correctly: bubbles remain, and a jump stays on the current page.
- D116/D117’s shared History mode and whole-week day picker are correctly stated; the remaining issue is the missing concrete EditWeek wiring/test.
- D118’s misleading unpublished “pending” count is correctly replaced with `new/changes`.
- D119’s newest-first rule, with untimed pending items below timed ones, is correctly preserved.
- D167’s window staying open after a jump, phone collapse-to-bar behavior, and close-on-page/week/sign-out lifecycle are correctly stated.
- D170 correctly removes Hand over and makes seen state per person.
- D171 correctly gives the admin icon a whole-loaded-week unseen count and gives members only per-day doors.
- D263 correctly requires every absence transition and full medical details for members.
- D336 correctly keeps history through sign-out and reload.
- Using calendar dates captured at write time fixes the current same-weekday/different-week alias.
- Keeping history outside Undo is sound. In the current architecture an unknown raw settings key bypasses the generic settings command hook: `src/state/people-settings-commit.ts:269-275`.
- Holding history effects until command success is the right rollback model.
- Retaining both `pid` and a frozen fallback callsign is sound:
  - a rename can render the live callsign;
  - a deleted person can still be named by the frozen value;
  - current behavior is at `src/engine/editlog.ts:410-415`.
- The existing admin sweep preserves the rising head when it removes rows: `src/engine/editlog.ts:135-152`. It needs the cross-tab/durable treatment in ASTRA-DP-01, but its basic semantics are right.
- D292’s admin/member-view switch is compatible with per-person seen state because the person is unchanged.
- A person without a person ID having no seen record and no window is sound for guest/waiting/off views; D215 already says guests receive no buttons or pending list.
- A published day taking the “N pending” wording before “N new/N changes” is sound.
- OG being viewer-specific, unpublished-only, on-screen-only, and absent from print/CSV/version previews is sound.
- I found no migration, back-compatibility, or existing-demo-data-only issue and have not reported one.

