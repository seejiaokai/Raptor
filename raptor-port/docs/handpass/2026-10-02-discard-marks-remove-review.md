# D488 — fresh final Astra inspection record

Branch: `codex/discard-marks-remove`. This is the response/disposition record, not the brief.
The immutable brief was written before dispatch at
`../superpowers/briefs/2026-10-02-discard-marks-remove-astra-final.md`.

Requested model: `gpt-6-astra`, fresh `/root/astra_final_inspector` with no history fork.
Dispatched 2 Oct 26 after the final running-app walk and gates. Read-only inspection;
no Claude provider or cross-provider approval claimed. D496 supplies the temporary Codex
read, and D494's further Claude reads remain owed before main.

App snapshot: uncommitted D488 source changes over docs-only HEAD
`7c2db6072bfba30c374c0c933d6dffac85b17914`, app base
`d9492f1e3dad78cb15dc25b4fbfc8e01f6eb24df`. Host retains SHA-256 of all 13 changed
source/test files and the new runtime walker in Temp; no source/harness edit during the read.

## Initial state at dispatch

Pending. No PASS or completed FULL approval is claimed while this is pending.

## Initial host disposition

Pending. Failed, incomplete or empty review is not approval. Claude's Monday further
reads and the owner's look remain owed regardless of the Codex result.

## Earlier planning agent — complete archival recap returned 2 Oct 26

The following response is retained as returned. It is a recap, not a fabricated verbatim original transcript.

**Archival recap from retained context, not a verbatim transcript.** No new review or verification was performed for this response. Dispositions below distinguish my observed rechecks from the host’s subsequent report.

**Initial scenario review — FULL tier**

The task touches published records and saved pending marks. I identified four missing runtime scenarios, not demonstrated application defects:

1. **Mixed-day isolation.** The walker edited only one day, so it could not catch publication clearing another day’s pending work. Recommended check: edit draft days A and B and published day C; first-publish A; verify all A marks clear while B and C remain pending. Reload, leave the week and return, and verify again. Existing unit tests covered parts of this behaviour.
2. **Operate the surviving Amendments-panel button.** The walker read the panel, then published through the board. That could pass while the changed panel’s remaining publish button was unusable. Recommended check: on desktop, sign on the board, close it with Done, confirm the panel is visible, and issue AL1 there. On phone, use the existing board route.
3. **Observe the issued copy and sign-offs.** Saved-snapshot assertions did not prove what readers saw. Recommended check: View-only Sched retains the original note before AL1 and shows the amended note afterwards; an edit clears the four sign-offs and publication requires them again.
4. **Undo across publication.** The standing order explicitly includes this for published records. Recommended check: immediately undo a fresh first publication, verify the existing allowed behaviour and retained draft content/marks, then redo and verify the issued record. Retain an adjacent edited day to detect unintended clearing.

**Disposition:** the host now reports all four scenarios were covered in the final walker. I have not independently re-read or rerun that final walker.

**Correction retained**

I initially warned that the walker’s `dn:<day>.<index>` assertion might miss stable-row pending keys. After tracing the conversion, I withdrew that claim: note keys intentionally remain positional, so the assertion was valid for that note. Using `keyDay` was a stronger check of *all* marks for the day, not a repair of a demonstrated note-key defect.

The host separately identified that an outdated close helper left the board covering the panel. The host proposed using Done, waiting for closure, and asserting desktop visibility/phone hiding. This was the host’s finding, not mine.

**Initial workflow review**

One substantive finding:

- **Failure:** the temporary workflow permitted the planning agent to review Sol’s final code, allowing a later host to reuse planning context for final approval.
- **Cause:** that permission conflicted with the standing order’s fresh-session final inspection; D496 narrowed models/counts while preserving the checking order.
- **Fix:** require a separate fresh Astra final inspector; keep scenario design and reconciliation with the planning/coordinating agent.

**Disposition:** independently rechecked and confirmed fixed in the subsequent focused read.

I found no other substantive safeguard loss in the AGENTS override and no meaning change between D496’s short line and full ruling. The evidence draft’s obsolete D494 deferral wording was acknowledged as unfinished, not treated as approval.

**Focused mapping recheck**

One further finding:

- **Failure:** D70’s refreshed short line omitted “one round each,” although the full ruling retained that cap.
- **Cause:** a later host could apply the general workflow’s two-round final-inspection limit to working-guide reviews.
- **Fix:** restore the one-round-per-reviewer limit in the short line and preserve it when applying the general loop to documents.

**Disposition:** the host now reports this fixed; I did not independently recheck that final correction.

The focused read found no remaining self-approval permission in the requested mappings. D496’s short/full meaning agreed, and the overrides retained running-app checks, owed Claude reads, and merge restrictions. D492, D353 and D67 retained their temporary model arrangement.

**Next product questions retained**

1. “If a flying line takes off before its wave’s in-time, should its hours use the normal reporting time for that flight? **Recommended: yes—use the reporting lead set on Logic for that line.**”
2. “Should the day also show an advisory saying its in-time is after take-off? **Recommended: yes, so the scheduler can correct it, without blocking publication.**”

Do not re-ask whether valid in-times override the normal reporting lead, whether Logic changes update published-day hours, or whether pending schedule edits count before publication. Those behaviours are settled.

**Scope and limits:** the earlier reads covered applicable rules/full rulings, workflow documents, removal-related implementation/tests, walker/evidence draft, and the negative-hours backlog entry/calculation. I performed no runtime checks, heavy tests, edits, commits or pushes. Neither review was final code approval. I have not read the fresh final inspector’s report.

Rulings: none in these reviews.

## Fresh final inspector — complete response returned 2 Oct 26

**PASS — D488 Discard marks removal.** No concrete application defect or blocking evidence gap found in the inspected change. This is the independent Codex-side final inspection under D496; Claude’s further read and the owner’s look remain owed.

Inspected snapshot:

- Branch: `codex/discard-marks-remove`.
- HEAD: `7c2db6072bfba30c374c0c933d6dffac85b17914`.
- App baseline: `d9492f1e3dad78cb15dc25b4fbfc8e01f6eb24df`; verified no app-source difference between that baseline and HEAD.
- Inspected the uncommitted changes to all 13 modified source/test files, the added walker, the three changed reference documents, the evidence sheet, final/history result files, relevant screenshots, and raw gate logs.
- Source/test/walker fingerprint: `fc9803b2481916b16f556ca92e407db6e896806f181c3e082813fc43c8149cdf`. Computed as SHA-256 of UTF-8, LF-joined, path-sorted lines `<repository-relative path> <lowercase SHA-256 of file bytes>`, covering `git diff --name-only -- raptor-port/src` plus the added walker.

The inspection traced the promise beyond the diff:

| Qualifying surface or consumer | Required sign and gesture | Inspection result |
|---|---|---|
| Phone scheduler board | Existing signing, Publish day/AL and Undo/Redo; no replacement clearing door | Existing phone rule preserved; publication and issued-copy evidence agree |
| Desktop and short-window Amendments | Draft guidance or per-day Publish AL; no Discard marks | Sole production panel changed; visible pictures show the intended result |
| Edit-week and board day renderers | Existing draft/history indications and published pending marks | No renderer or marking rule changed |
| Flying, duty, sim, ground, programme, note and structural keys | Their day’s marks remain under existing semantics; publication clears only its day | Shared `keyDay` path retained; no row-specific discard caller remains |
| Publish command and immutable issued records | Four sign-offs, first issue, later AL; frozen original until AL | Retained command wrappers, signatures and issuance logic checked |
| Pending-book storage, reload and week return | Marks and edits retained; no new shape or migration | Existing storage path retained; mixed-day tests and walk cover isolation |
| History and Undo/Redo | Ordinary edits remain; no new marks-cleared entry | Writer and obsolete undo phrase removed; ordinary history reader retained |
| Roles and overlays | Members gain no controls; panel publish remains guarded during version preview | Permission removal is complete; existing page/command/preview guards retained |

Highest-risk scenarios considered, starting with specialised surfaces:

1. **Phone publication:** edit a draft, publish, amend, sign again and publish AL. Expected: no clearing replacement and normal issuance. Disproof would be a stranded publication route or premature issued-note change. Saved results and opened phone pictures show the board publishes and View-only Sched changes from Original to AL only after issue.
2. **Mixed-day isolation:** edit draft A/B and published C, publish A, reload and return to the week. Expected: only A’s draft marks clear. Disproof would be B/C losing marks or edits. The walker checks all marks through `keyDay`; the storage replacement test also verifies reload.
3. **Publication Undo/Redo:** first-publish an edited draft, Undo, then Redo. Expected: draft marks return on Undo and clear again on Redo, with neighbouring days retained. Recorded assertions cover this sequence.
4. **Actual Amendments button:** sign a published change, close the board and press the panel’s Publish AL. Expected: the surviving visible button issues that day. Disproof would be testing a covered panel or only calling the engine. The corrected walker presses the panel button, and opened pictures show the panel before and after issuance.
5. **History preservation:** make a fresh edit and open All changes. Expected: the real edit remains, without a marks-cleared line. Opened history pictures at desktop, phone and short sizes show the new note’s before/after entry.
6. **Removed command reachability:** search exports, imports, registrations, descriptors and production strings. Expected: no executable discard path. A binary-safe source search found none; remaining mentions are regression tests and a historical explanatory comment.
7. **Guidance equivalence:** draft-only, published-only and mixed marks. Expected: retained draft guidance and unchanged publication eligibility. `pendDays().some(!dayApproved)` is equivalent for valid newly produced state; first publication and retraction maintain the corresponding original/day-approved state. No malformed old-data finding is raised.

Explicit negatives:

- I checked removed callers, exports, command registration and permission mapping and found no remaining production route.
- I checked the first-publication clearing loop and found no widening beyond the selected day.
- I checked retained AL publication, signature and preview guards and found no regression.
- I checked obsolete-test replacements and found no weakened assertion protecting surviving behaviour.
- I checked history writing/reading and found no deletion or migration of existing history.
- I checked styling and found no CSS change or resizing of remaining buttons.
- I checked the saved gate results against the raw logs and found no contradictory count or concealed final failure.

Observed evidence matches the sheet: 7,560 unit tests; 728 original comparisons; browser 517 passed plus one passed on retry, 49 skipped; 445 Tracker checks; four performance checks; build, rule coverage and document checks passed. The browser retry matches the already-filed Leave War pruning case and lies outside this change.

Limits: I read the existing run evidence rather than rerunning heavy checks. I opened ten relevant full-resolution picture targets, not all 44 pictures. The walker’s shared navigation helper changes pages through the localhost bridge, while edits, signatures, publication, Undo/Redo and history controls use actual UI operations; this supports the D488 behaviour claims, not an independent navigation-gesture claim. Phone week-switch operation and physical-device testing remain outside the recorded walk. The host must retain its exact-build/source fingerprint check before committing.

Rulings: none added by this read; D488, D487, D148, D489 and D494/D496 applied.

## Final host disposition

PASS accepted for the independent Codex-side D488 inspection. No findings require a code fix or second
inspection round. The host recomputed all 14 file hashes and the inspector's combined fingerprint after
the response; both match the inspected source/harness snapshot. Changes after the read are filing/evidence
metadata only. Full code approval by Claude and the owner's look are still owed before main.

Earlier workflow fixes: fresh-inspector wording is present; the D70 short line retains ONE ROUND EACH,
and the temporary workflow explicitly preserves that cap. Earlier four scenario gaps are now covered in
the strengthened walker, as independently checked by the fresh inspector. The note-key concern was withdrawn
by its author; no app fix was made for it. The former close/reload/sign-out harness defects were corrected
and affected flows re-walked. Original failed/covered-panel pictures remain historical, not final proof.
