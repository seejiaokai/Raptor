# Discard review leftovers — independent Astra inspection, 3 Oct 26

**PASS for the seven-file cleanup only.** No concrete source defect or blocking evidence gap found.
This is a fresh independent Codex-side inspection under D496, not a new FULL approval of the original
Discard removal, approval of the planner's own work, or permission to merge. Sol built the inspected change;
this Astra inspector wrote no implementation, test, driver or gate and waited for the host's explicit
evidence-ready notice before issuing this verdict. This report is immutable; later dispositions belong elsewhere.

## Authority and snapshot

- Branch: `codex/discard-marks-remove`; HEAD/base `3e0970259cd5b6564c53dddc448d210c2dc1ae3d`.
- Exact authorized scope: the Discard section of
  `origin/codex/rally-workspan:raptor-port/docs/superpowers/briefs/2026-10-03-codex-review-fixes.md`.
  The prior targeted Claude check is an early signal under D508; its Monday obligations remain.
- Read the current handoff, AGENTS, mandatory whole rule files, project guide, scheduler rulings,
  full D488/D496 rows, D508–D511 on the pushed Rally branch, executor, bug-check order, temporary
  Codex workflow, relevant backlog entries, original Discard evidence and original inspection record.
- Examined the complete seven-file source/script diff, saved original bytes, before/after manifests,
  retained publication/history imports and history call sites, runner, final gate evidence and portable archive.
  Only accompanying filing/evidence documents changed outside the seven implementation/script paths.
  No test, fixture, schema, CSS, permission, engine body or unrelated feature changed in this cleanup.

## Findings and dispositions

| Question or prior finding | Independent result and disposition |
|---|---|
| Unused `logAction` import | **Fixed.** The original file contains exactly one identifier occurrence, the import; the current file contains none. Current bytes equal the original with precisely that import line removed. No caller was removed. |
| Import removal could stop edit-log initialization | **No defect.** The unchanged `publish` import reaches `editlog` through its retained `logEdit` import; the unchanged `history` import also reaches it through `logAction`, still called by Undo/Redo. This is not removal of the module's only evaluation route. |
| Six old walkers still name the removed button | **Fixed as authorized.** Each has exactly one first-line comment saying it was retired with Discard marks under D488 and retained as historical walk evidence. None was deleted or repurposed. |
| Historical bodies or evidence silently changed | **No defect.** Independently stripping only each newly added first line leaves its original file bytes exactly, including original line endings. Saved originals match HEAD content after normalizing Git checkout line endings. All before/after hashes agree. |
| Retired walkers still counted as current checks | **No defect.** No reference to these six scripts appears in the package gate commands, workflow definitions or gate runner. Their preserved `#alDrop` operations are historical, not current runtime proof. |
| Brief's unverified first-publication test observation | **No new finding.** The brief expressly calls this unverified and requests only the import and retirement comments. No publication behavior or test changed here; no new test gap is manufactured to expand this cleanup. The original mixed-day evidence remains historical. |
| Fresh walk or whole-feature approval overstated | **No defect.** The follow-up expressly says its walk was not done, keeps the parent FULL evidence separate, and retains all Monday reads and owner look. I did not reopen pictures or rerun a walk, and do not certify the original FULL feature afresh. |

There are no unresolved findings, deferred source fixes or required second inspection round for this snapshot.
The original feature's outstanding reads and owner look are obligations, not findings closed by this report.

## Coverage and byte proof

The incremental runtime tier **NONE** is justified for this exact delta: no money/entitlement computation,
publishing/signing/amendment/Undo writer, saved-data or reset path, shared renderer, gesture/mode, surface,
role or warning meaning changes. The source edit is unused-import removal with retained module reachability;
the six other edits are comments. This is not a waiver for later functional source edits. All five standing
automated gates plus rulecheck/docsize were still retained. Static before/after checks are not called RED
runtime tests; the original D488 feature remains FULL.

Each path below is relative to `raptor-port/`. These are independently recomputed current SHA-256 values:

| File | SHA-256 |
|---|---|
| `src/state/sched-commit.ts` | `2ba375086ffe1177582f9652f9e82aa36589e1489c25829545e30c26e0a0cecc` |
| `scripts/handpass/am/w1-s33-reorder.mjs` | `328a6e92bfad43459da3fc302613f041a359f2f66ad2649f826abdd266fcc212` |
| `scripts/handpass/am/w1-s02-discard.mjs` | `99619e888676598aa75fc38a9c4db82f606290a69a8e5506485c0f679154b69f` |
| `scripts/handpass/am/hr-01-fixes.mjs` | `3d2281f7439b2c9264a1747eac3cd89e00f885c36fb6177cc2c0890636f87313` |
| `scripts/handpass/dp-walk.mjs` | `289099a3a5430bd48f6bb375d5e5e426ebb8585b13aae53193d348fd4923de1d` |
| `scripts/handpass/cr-a1-pub.mjs` | `ea006c15a319ac7ec33d8de44517eb091848c3c2653956c7c7c24d90d9e2f51f` |
| `scripts/handpass/dbrA-W1-c.mjs` | `f494a9f311e5cdbc65144cc6621ff9e8bd2b3f3a72b407e48035b93bb8669691` |

Combined source fingerprint: `771cfc7f80361ff2858889382a50670a29c76b02c7ce65c9f5d2ee6032da70c9`.
Algorithm: SHA-256 of UTF-8 path-sorted LF-joined `repository-relative-path lowercase-file-sha256`, no trailing newline.
All 19 built-file hashes independently match the frozen manifest; SHA-256 of its ordered JSON bundle array is
`147b658e75128ca1065a5f2526a40eaf6c53f634d8ecb7043fc08a2b757cbdc6`.

Portable archive: `../../handpass/2026-10-03-discard-review-fixes-evidence.zip`, 764,126 bytes;
SHA-256 `4CCD520EA21202F474352A9192E5C3219668F1BDCEB102EB7893A7C76E1BDCF6`.
I read every archive entry and independently compared all **52 entries** to its corresponding local file:
zero mismatches. It includes all seven originals and final files, manifests, exact patch, static verification,
seven raw gate logs and exit results, runner/helper scripts, and 19 built files. The report is separate from
that frozen archive. No extraction, rebuild, browser run or source mutation was performed by this inspector.

## Completed checks and limits

I read the saved raw results and runner rather than rerunning the gates. Its full-path working directory is
`C:/Users/User/projects/Raptor/raptor-port`; it takes the shared PC lock and releases it in `finally`.
All seven recorded exit codes are zero, and the raw summaries support these results:

| Command | Result |
|---|---|
| `npm test` | 7,560 passed in 474 files |
| `npm run build` | PASS; normal dynamic-import notices remain, no build error |
| `node reference/tfin.js` | 728 passed, 0 failed, no errors |
| `npm run test:e2e` | 518 passed, 49 skipped, no failed or retried test reported |
| `npm run smoke:tracker` | 445 passed, 0 failed |
| `npm run rulecheck` | OK; existing AM39d baseline cleanup note remains |
| `npm run docsize` | OK; recorded inventory copied below |

The saved after-check record also reports six successful `node --check` syntax reads. I independently checked
the comments and byte preservation, not by executing the retired walkers. `git diff --check` passed in this read.
No new performance/adapted-probe run or standalone app walk is claimed: no corresponding behavior changed.
The original 44-picture walk and its disclosed retry, navigation and physical-device limits stay historical.
The host must run the document check after this report and final status edits, and retain the source/bundle
fingerprints unchanged before committing. Any later source change requires an affected-snapshot read.

Docs: OUTSTANDING 99 items (+4 −1, −1 all in ARCHIVE) · DECISIONS D1–D496 (new: D491, D492, D493, D494, D495, D496) · homes OK
docsize: OK

**Walk: NOT DONE for this cleanup — unused import and historical comments only; no fresh runtime claim.**
**OWED: Claude's read after the reset — `codex/discard-marks-remove` — before main:** the FULL independent
walk, further code/scenario and working-guide reads, and D480 blind walker trial. Owner look remains pending.
This inspection does not authorize main, merging, a PR for merging, or beginning Insights. Rally stays on its
separate branch; this report does not review or approve its changes.

Rulings: none in this inspection; D512 remains next globally. Applied D488 and D494/D496; retained D508's limits.
