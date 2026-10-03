# Rally: adapted audit fixture repair — bounded plan

Author: Astra, 2 Oct 2026. Scenario/contract triage only, not final code inspection or approval. No production, adapter, test or guide edits, and no browser/test run by this author. Sol executes and verifies any repair. No owner acceptance or new product choice is inferred.

## Evidence and classification

`probes/adapted/audit-async.cjs:238–303` contains the three failing assertions. Current raw evidence is `.superpowers/rally-probes-final.log`; unchanged frozen baseline9cc5d4ff evidence is `.superpowers/rally-audit-baseline.log`. Both audit runs report24 passed/3 failed, no runtime errors:

- Step13 expects positional `SCHED.changes['dn:0.1'] === 1`, receives lost.
- Step13 expects injected issued AL keys rewritten to `dn:0.1`, receives empty.
- Step12 shows Inputs model/table46/46 →47/47 →46/0 after Undo.

The baseline result establishes that these failures predate Rally. It is not permission to waive the gate or alter expected results indiscriminately. The adapter's setup must be corrected against the current contracts below, and its meaningful mutation/Undo/issuance assertions must remain.

## Step12: wrong command scope, not yet evidence of a stale Inputs table

The adapter goes to Inputs and selects All, but adds its record by raw `INPUTS.unshift(...)` followed by `afterSchedMutate()`. `src/state/view.ts:1207–1214` describes that function as the scheduler/board mutation epilogue. `src/state/sched-commit.ts:751` wraps it in `commitSchedVoid(SCHED_TYPES.mutate, raw)`; `schedScope` at`:514` sets module `sched`.

`src/state/undo-wire.ts:landingOf` deliberately maps scheduler entries to Edit Schedule. `snapView` switches to the owning page unless the current page is an allowed alternative. Inputs entries, by contrast, have primary Inputs and their own allowed alternatives. The same scheduler landing exists in baseline9cc5d4ff. Thus this probe creates a scheduler-scoped entry and then assumes Undo must keep rendering Inputs. Querying `#inBody` after the page has changed returns zero even when model Undo correctly removed the record.

The46/0 count alone cannot prove navigation; record `CURPAGE`, presence of `#inBody`, and the entry scope in the focused repair run to close that diagnostic explicitly. The source makes navigation the concrete expected cause, not an arbitrary timing delay. Inputs' date range is component state (`src/ui/InputsPage.tsx:268`), so navigating away and back may also reset the previously selected All window; reopening the page merely to force46 rows would conceal the wrong mutation path.

### Minimal repair

Use the actual Inputs add/save controls to create one uniquely identifiable input while the All date window is active. If this adapter must use the supported command bridge, use the real Inputs-scoped writer (`commitInputs`/the production input-save command), not the scheduler epilogue. Capture the stable input id after creation.

Assert: exactly one model record and its matching visible row were added; the signed-in user's production Undo removes that same id; Inputs remains the active page; All range and other filters are unchanged; the matching DOM row disappears; total visible count returns to the captured visible baseline. Where All/everyone/no-type/no-search makes every record visible, retain the table-versus-model equality assertion too. Add Redo restoration of the same id/row if available without expanding the probe's purpose.

Do not replace this with a model-only check, manually call render after Undo, navigate back to hide a wrong landing, or assume a fixed wait proves repainting. Wait on the expected real page/row state. If a properly Inputs-scoped production action navigates away or leaves stale rows, retain it as an application defect requiring repair.

## Step13: fabricated legacy issuance and positional marks are not today's UI authority

The adapter directly replaces day notes with bare strings and injects `SCHED.changes={'dn:0.2':1}` plus `SCHED.als=[{n:1,keys:['dn:0.2'],sign:{}}]`. It then appends a synthetic span carrying the deletion attribute and invokes the real delete epilogue. This mixes a legacy internal representation with the current command/store/publication machinery, without creating the publication and row identities that machinery requires.

Current and baseline `src/engine/keys.ts:40–69` distinguish two contracts explicitly: `shiftKeys` still remaps a legacy `keys` field when actually present; a current Phase2 AL carries frozen `diff` and snapshot instead, and must not gain legacy keys/adds/structAdds fields. Frozen `snap`/`diff` are not rewritten. `src/engine/rowids.ts:93,131–197` maps positional UI addresses into stable row-identity keys for the book. `src/engine/drafts.ts:710` reconciles pending fields against the corresponding stable row in live and issued documents. A numeric `dn:0.1` lookup after a command is not a reliable assertion of the current displayed row's amendment identity.

The full D45 ruling preserves the issued document until acknowledged amendment; its old signature wording is explicitly superseded by D103. `docs/undo-contract.md` records version issuance records as written once and guarded on restore. D148 requires Undo of the current person's own change, never another person's. These do not authorize silently rewriting a current issued record to follow working-copy positions.

The precise normalization/restore step that removes this fabricated legacy record was not traced through a new runtime experiment here. Do not claim the two observed losses independently prove a particular production cleanup bug. The fixture does not establish a valid current issued world, and its current-AL rewrite expectation is wrong.

### Minimal repair

1. Through real note controls, create ALPHA, BRAVO and CHARLIE with normal stable identities. Use a valid reporting/signature fixture, publish Original through the real path, edit CHARLIE, sign and publish AL1. Capture CHARLIE's identity and the complete issued AL record/snapshot/diff.
2. Delete ALPHA through its actual rendered delete button; do not append a synthetic control. Assert the live notes are BRAVO then edited CHARLIE, CHARLIE retains its identity and issued amendment attribution at its new rendered position, and BRAVO has not inherited CHARLIE's mark.
3. Assert the deletion is pending against the issued day, while the saved AL1 record, its frozen note ordering/content and preview remain unchanged. Use stable-key/day-pending authority and rendered marks, not a raw numeric key guess.
4. Undo restores ALPHA and the live ordering; Redo removes it again. Neither changes AL1. If the scenario publishes the deletion as AL2, assert AL2 reflects the deletion while AL1 stays unchanged.

This preserves and strengthens the original user-facing purpose: deleting an earlier row must not transfer amendment history to the wrong row. It deliberately replaces the obsolete assertion that a current issued AL should be rewritten.

If the adapter also intends to retain legacy `shiftKeys` compatibility coverage, keep that as a separate, labelled helper fixture: temporarily provide a valid legacy-shaped mark/AL structure, call the helper directly, assert positional remap and removal, and restore in `finally`. It must not substitute for the real UI/current-issued-record test or be represented as actual publication proof. Existing focused legacy tests may already supply this coverage; check before duplicating it.

## Finite verification and limits

Run only the repaired audit first; preserve both24/3 raw logs. Confirm the actual scope/page result for step12 and actual stable/issued identities for step13. Then complete the adapted-probe gate as required by the host. A real unchanged-contract failure discovered with valid setup needs an application fix, not another expectation rewrite.

This plan changes no product semantics and does not exempt the failures under D56. It is not approval of a future adapter patch or the Rally implementation. The original bound plan and final inspector reports remain unchanged.

Rulings: none added.
