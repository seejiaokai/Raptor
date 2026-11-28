# The code read of pull request 845 — Astra (GPT-6 Astra, the Codex CLI, read-only) (25 Nov 26)

*Saved whole by the host (chat 181) from the run's last message (`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`). Blind to the walk's reports and to the other two readers; read an exported copy of commit `9f9d0dd8c` (the branch joined with `main` `3c3789384`), this round's sheet, walk reports, scenario designs and handoff block taken out; the one brief: `docs/superpowers/briefs/2026-11-25-shared-row-code-read-brief.md`. Its sandbox could run no test (it says so); its two reproductions ran in memory.*

---

**Review result: changes required.** I reviewed the exported copy at `D:\c181\astra`, export commit `ef8c85fcbb7121d42499cb2edb1110c9405af642`, representing `9f9d0dd8cdd5869c5907a8b182fa433d343e9f16`, against `HEAD~1`.

Three findings follow. No files were changed, built, committed or pushed. I did not read the excluded reports or folder.

**1. High — splitting an already split input can still move another person under the next gesture.**

**Reproduction:** File one leave with people ordered Hex, Ranger, Outlaw. Change Ranger’s start on his Unavailable row, giving him his own input. Open that input and add a fourth person after Ranger. Close it and change Ranger’s time again.

Immediately before the second split, the displayed order is:

`Hex, Ranger, fourth person, Outlaw`

After it, the ordering functions return:

`Hex, fourth person, Outlaw, Ranger`

Ranger should retain his position. Instead, another person occupies it, recreating the wrong-person drop/click hazard this change promises to remove. I reproduced that order using the production ordering functions in memory, with minimal state and record-access adapters; this was not a browser walk.

**Cause:** [inputown.ts:143](/D:/c181/astra/raptor-port/src/engine/inputown.ts:143) records a display position only when the person is in the middle of the source record. Ranger is first in the newly shared record, so his second split gets no display-position entry. The previous entry remains attached to the record now containing the fourth person. Additionally, [rowinput.ts:60](/D:/c181/astra/raptor-port/src/engine/rowinput.ts:60) explicitly excludes a record whose anchor is itself being repositioned, preventing nested splits from composing.

**Fix steps:**

1. Before removing the person, capture both adjacent people, allowing either neighbour to be absent.
2. Record the new input’s position for first and last splits too, particularly when its source already has a recorded position.
3. Make `unavailFaces` expand anchored records recursively. Insert a child’s complete expanded block beside its recorded neighbour, rather than discarding relationships whose source is itself anchored.
4. Guard repeated visits and retain a deterministic fallback when an anchor is absent from that day.
5. Add the sequence above through the actual editor and row controls on both Board and week. Assert the complete order before and after the second split, then verify a drop onto Ranger changes Ranger alone.

**Age:** The repeated-split ordering failure is older than this change. The new position bookkeeping leaves that case unresolved; it is not a newly introduced general ordering regression.

**2. Medium — the held row’s history still reads the other people’s input.**

**Reproduction:** Enable History. Give Ranger and Hex a shared leave. On Ranger’s Unavailable row, change the start and Tab, then change the end and Tab while the row remains held. Ask for that row’s history before its address is repainted.

The history lookup still uses the shared input’s ID. Ranger’s changes recorded against his new input are omitted. Changes belonging to the remaining shared input can appear instead. The history dot makes the same unresolved lookup.

I exercised the production `storyOf` function in memory with a held `shared~Ranger` address and separate shared/own history entries: it returned the shared entry and omitted Ranger’s own entry.

**Cause:** [histbubble.ts:301](/D:/c181/astra/raptor-port/src/ui/histbubble.ts:301), `storyOf`, parses the person but queries history using the original ID. [histbubble.ts:513](/D:/c181/astra/raptor-port/src/ui/histbubble.ts:513), `refreshHistDots`, repeats that lookup. Neither asks `rowInputOf`.

**Fix steps:**

1. Add one helper for resolving an input-row history address, preserving the person suffix.
2. Resolve person-specific working rows through `rowInputOf` before selecting history entries.
3. Use that resolved identity in both the bubble and dot calculation; preserve the existing day and person filtering.
4. If resolution fails, do not fall back to the remaining people’s input.
5. Add a test retaining the original DOM address across two saves. Assert that Ranger’s new history appears and a subsequent Hex-only history entry does not. Check the dot as well as the bubble.

Keep historical/issued views bound to their displayed records; do not redirect frozen history indiscriminately through current working inputs.

**Age:** Older omission, left open by this change. The history reader was already unaware of a person’s split input.

**3. Low — the existing document-removal test can pass without testing removal.**

**Reproduction:** Run the W1 test with the document remove control missing. Its document-removal portion still passes: the initial assertion checks for `''`, and the click and both meaningful assertions are skipped.

**Cause:** [nightwalk.test.tsx:131](/D:/c181/astra/raptor-port/src/leavewar/ui/nightwalk.test.tsx:131) uses `'doc-a'.slice(0, 0)`. The following `if (chipX)` makes removal optional.

**Fix steps:**

1. Create a real document fixture through the documents test backend or `docAdd`, and attach its returned ID.
2. Assert that its named chip and removal control exist.
3. Click the control unconditionally.
4. Assert both the saved document list and rendered chips are empty.
5. Retain the two unconditional till-toggle assertions.

**Age:** Unchanged from `HEAD~1`. This is a verification defect, not evidence that production document removal fails.

**Scope and ruling assessment**

D737 separates each person’s Unavailable row from the shared Personal Inputs/Ground row governed by D739 and D748. D759’s “own input” sentence is recorded as an agent reading; I have not promoted it into a direct owner instruction.

The host’s three readings are consistent with those boundaries: controls should follow the person after a split; re-entering an unchanged time should not split; rejected overseas duty’s single Personal Inputs line should remain a whole-input edit. The no-reordering promise is not fully met because of finding 1.

The production roll-call, starting with the specialised surfaces:

| Surface or consumer | Visible sign and working gesture; result of the read |
|---|---|
| Leave War member remarks window and `LeaveWords` in other sheets | Remarks, document chips and till tick should read and save the same person’s current input. The new resolution covers successive saves. Pending text is also saved on flush/close. |
| Leave War day-list decision buttons | Approve/send-back, Refuse, Move and Delete retain record IDs rather than calling `rowInputOf`. Newly valid war-approved leave cannot be shared: `shapeProblem` rejects it, and `warLeaveRow` requires one named person. I therefore found no qualifying shared-input action failure here. |
| One-day bid window and drag-selection window | Actions flush words first. The selection window re-reads the relevant leave inputs rather than relying on a held Board address. These are separate from the new row resolver. |
| Input window opened from a row | The type-label handler resolves the person before opening. Before a split it opens the shared input; afterwards it opens the own input. The editor then uses that record’s ordinary save/delete and permission paths. |
| Board, desktop and phone | Start, end and remarks, label, Reject, LATE, puck drop and armed plant all have the relevant person identity. The changed handlers resolve it. Day selection also commits/compares the held value. |
| Edit Schedule week | The equivalent boxes and buttons use the same identity. Focus-out, Escape and destination refresh now resolve it. The row renderer uses the shared ordering reader. |
| Personal Inputs and Ground Programme | Their shared line remains a whole-input edit. `iuWhoAtt` is restricted to a person’s shared Unavailable row. Rejected overseas duty is excluded from per-person splitting by `listedUnavail`. |
| History dot and bubble | Read the held address without resolving it: finding 2. |
| Changes-window jump and Board landing | `changesjump`, `findHistCell`/`findInputCell`, and `boardland` use record IDs and rendered addresses, not `rowInputOf`. Their addresses normally agree after repaint; landing on a newly split record while the old DOM is held still needs a rendered check. |
| Armed-target existence and reassignment | Existence and the actual write both resolve person-specific targets. Reassignment retains scheduler permission, medical and OIL checks. |
| Published marks/counts, issued copies, bell and OIL | These derive from saved records and existing command/notification paths, not held DOM addresses. No separate row-address writer was found here. |

Qualifying shared records are those actually listed under Unavailable: leave, overseas duty there, and eligible commitments filed there. Medical entries remain one person each, although medical processing can split someone out of shared leave. SANS and upchits are excluded. Shared Personal/Ground records are whole-input objects. Placeholder rules must be checked before constructing an ordering scenario; invalid shared medical or war-approved records are not valid reproductions.

**Changed callers and pointer life**

`saveFromRow` has two direct callers:

- `setInpField` returns its result and, on the non-scheduler path, can ask about OIL. Board/week callers use success to normalise the displayed boxes and refresh.
- `setInpTitle` returns the result without a person, retaining a whole-input save.

The new unchanged-value return bypasses splitting and the commit path. Consequently it creates no save command, new input, history entry or split-related pending change. That comparison is limited to fields this door edits. A success response does not itself grant write permission because nothing is written on that branch.

The state/event trace gives these boundaries:

| Held-row state | Result or remaining check |
|---|---|
| Still shared | Membership wins; the current shared record is used. Unchanged time does not split. |
| Split once | Text, label, Reject, LATE, drop and plant follow the recorded own input. History is the exception above. |
| Split again | The identity chain follows further splits registered by `ownPartSave`; display ordering fails in finding 1. |
| Undo restores original membership | The membership check selects the restored shared input before consulting the pointer. Redo can use the restored own ID. |
| Own input deleted or handed to someone else | A fresh lookup cannot return it as this person’s input; the changed Board/week writers refuse rather than editing the others. |
| Own input re-timed | Resolution finds its current record rather than copying times from the old shared record. |
| Medical or posting splits it | Those `ownInputOf` callers receive the ordering change but do not register `noteOwnOf`. A held address can cease resolving; it must not guess another input. |
| Original or intermediate shared input deleted | Callers that first require that record can fail closed even if a later own record survives. The mounted `LeaveWords` fallback to its prop, and pending save closure, need a dedicated rendered test before claiming this entire case safe. |
| Reload or navigation back | Fresh rows carry fresh addresses. Page-life ordering hints are not persisted; the host explicitly permits the middle person’s different position after reload. |

The meaningful event sequences still requiring host execution are: split → edit another box → Escape; split → clear end → Shift+Tab; split → day step across a week boundary; split → Undo → Redo → button/drop; and removal of an original/intermediate record while a remarks sheet remains mounted. For each, failure means another person changes, the box displays another record’s value, or a surviving own record is silently overwritten.

**Explicit negatives**

- No permission bypass was found in the changed save path: it reaches the existing gate on the resolved input. A refused split-save still rolls back the whole command.
- No second production Board/week Unavailable renderer was found bypassing `unavailFaces`. Both relevant lists use it.
- The sibling-time update matches the same row address within the local container, re-resolves after saving, and avoids the active element. I found no changed path that deliberately overwrites the other box under its caret.
- Medical and posting remain separate split callers, rather than acquiring the UI’s save semantics accidentally.
- Issued copies are not rewritten by these changes. Actual saves retain the existing pending/sign-off machinery; the unchanged-value branch avoids a false save.
- The four new test files do not use the document test’s optional-assertion pattern. Their direct function calls prove those function paths, not browser focus, geometry or native event ordering.

**Validation limits and remaining tests**

The focused Vitest command was attempted with `npx.cmd`. Vitest failed before running any test because creating its temporary client directory was denied. **Zero tests ran.** No suite pass is claimed.

The ordering and history reproductions ran entirely in memory. They establish the function-level failures described above, not their exact appearance on a phone.

The host should run the five focused files named in the brief, plus the exact additional sequences under findings 1 and 2. The document-removal case must first be made unconditional. Published-day versions of those sequences should assert pending counts and cleared sign-offs while preserving the issued face.

**Tidiness, changed lines only**

The sibling-time refresh is duplicated between Board and week; a small shared helper could own the same-address/resolved-input rule. `OWN_OF` and `SLOT` describe different responsibilities clearly enough, although `unavailFaces`’ “riding” terminology obscures its exclusion of nested relationships. Several new comments repeat the incident narrative; the invariant and one evidence reference would be sufficient. These are filed observations, not changes made.

Rulings: none added. This was a read-only review; D759 reading 4 and the brief’s host readings remain identified as interpretations.
