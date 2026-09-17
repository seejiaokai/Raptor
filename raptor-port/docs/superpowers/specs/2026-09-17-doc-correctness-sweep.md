# Correctness sweep of the build-critical documents — 17 Sep 26

**Why:** the ARCH-STACK Step 2 design spec (Rev 5) was written on 16 Sep, BEFORE the 17 Sep
discovery that several always-loaded documents were wrong about the exact machinery it describes.
Building follow-up #1 from it risked baking in the same false premises silently.

**Method (the one that works):** every dated claim was checked against **the CODE it describes**,
never against another document. Fable's own diagnosis of why it missed the persistence bug first
time — *"I checked text against text, and all three files agreed with each other while disagreeing
with the source"* — is the whole reason. A document agreeing with another document is evidence of
nothing.

**Out of scope, deliberately:** dead code, unused CSS, orphaned files, general optimisation
(`[REPO-CLEANUP]` in OUTSTANDING.md). Nothing here deletes code.

**ROUND 2 (17 Sep 26, later the same day).** The 22-row table below went to Codex/GPT-6 Astra
and Fable 5.1 with one instruction: *open the code and tell me which rows I got wrong.* Both
returned **REVISE**. They confirmed 21 rows (Fable did not open the `loadVersionToWorkingCopy`
body, so it confirmed only the removal half of row 14) and found **16 further defects between
them, converging independently on the same worst one**. All 16 are accepted and fixed; §E
records them. Reviewer cost: Fable $4.36 / 253s, Astra 285s (cost not reported).

**The lesson, stated plainly:** round 1 fixed the instance it found and did not sweep OUTWARD
from it. Finding row 14's deleted function should immediately have prompted "what else did that
same phase delete, and what else does this same section describe?" — the answer was three more
removed functions and two wrong record shapes, in the paragraphs either side of the one edited.
**When a sweep finds deleted machinery described as live, the unit of repair is the SECTION, not
the sentence.**

**Gates:** vitest 4865/4865 · parity `tfin.js` 728/0 · build green — re-run after round 2.
**Gates NOT run, and why:** e2e, tracker smoke and `npm run perf`. This change is documentation
plus comment-only source edits (no executable line altered), so the three suites cannot be
affected by it; vitest + parity + build are the ones that would catch an accidental code edit.
That is an argument for THIS change only — see §C.5 for the smoke gate's own unresolved red,
which is the follow-up #1 build's problem and needs an owner decision, not a wave-through.

---

## A. Two mechanical passes worth repeating on any future sweep

Both are cheap and both found things a careful claim-by-claim read missed.

1. **Symbol-existence pass. CORRECTED after round 2 (Fable F3) — the first version of this pass
   was broken, and that is why the worst findings slipped past it.** It asserted only that an
   identifier appeared as TEXT somewhere in `src/`. A removed function whose name survives in a
   tombstone comment (*"Phase 2 removed reissueReopened"*) or in a test asserting its removal
   therefore counted as **still existing**. `restoreDayVersion`, `unpublishAL`, `reissueReopened`
   and `publishAL` all passed a check designed to catch exactly them.

   **The pass must require a DEFINITION, with comments stripped and tests excluded.** Re-run that
   way: 884 identifiers checked, 43 unresolved. Triaged, the 43 are the future-database names
   (`data-model.md`, and `data-schema.md`'s proposed table list), browser and DevTools terms
   (`MutationObserver`, `LayerTree`), test helpers correctly attributed to their test file, names
   sitting inside sentences that already say they were removed, and `schedWrite` — the function
   the follow-up #1 plan proposes and has not built yet. **No further deleted-machinery case
   remains in the in-scope documents.**

   The original pass's conclusion — "136 unresolved, all but three expected" — was unsound and
   should not be quoted.
2. **Citation-landing pass.** For every `file.ts:NNN` reference, print the line it actually lands
   on. A citation landing on a closing brace or an unrelated comment is a reliable tripwire for a
   section that has drifted — that is exactly how finding 14 (a function deleted from the codebase
   but described as live in nine places) surfaced.

**Repair policy used for citations:** a line number still landing inside the function it names was
left alone. One landing on unrelated code was replaced with `file.ts:symbolName`, which cannot rot
again, rather than with a fresh line number that will rot in a week.

---

## B. The claims → evidence table

This is the table to hand a reviewer. For each one: what the document said, what the code says, and
the file to open. **Nothing here was taken from another document.**

| # | Document said | The code says | Open this |
|---|---|---|---|
| 1 | Spec §2.1: `markEdit` fires `renderStatus` + **toast** + `logEdit` | `markEdit` runs `logEdit` → `renderStatus()` → `histPush()`. **No toast.** `logEdit` has no toast either; `logAction`'s own comment says the *calling site* names the action "in the same words its toast already uses" | `engine/publish.ts:markEdit`, `engine/editlog.ts` |
| 2 | Spec §2.1: `runInputWrite` at `store.ts:131-155` | The file is `state/store.ts`; the body is `runInputWrite` and has moved (Step 2 added `commitInputs` above it) | `state/store.ts:runInputWrite` |
| 3 | Spec §2.1: "≥11 writers reach `HOOKS.histPush` without `afterSchedMutate`" | Exactly **12** production sites: `state/store.ts` ×3, `engine/publish.ts` ×4, `ui/interactions.ts` ×2, `ui/DraftsModal.tsx` ×2, `ui/Shell.tsx` ×1 | grep `HOOKS.histPush` across `src/`, excluding tests |
| 4 | Spec §2.1a: `setDayApproved` at `publish.ts:180-201` | `engine/publish.ts:setDayApproved` — the cited range starts inside the preceding comment | `engine/publish.ts:setDayApproved` |
| 5 | Spec §2.3: Leave War `persist()` writes "~22 keys" | **21** keys | `leavewar/state/store.ts:rawPersist` |
| 6 | Spec §3.1: the day record is `days/<wk>:<date>` | The built id is `` `${wk}#${di}` `` — week key + day **INDEX** | `state/sched-commit.ts:schedRecords` |
| 7 | Spec §3.1/§3.4: `sched.als/<wk>:<verId>` | The built id is `` `${wk}:${n}` `` — the AL **array index** | `state/sched-commit.ts:schedRecords` |
| 8 | Spec §3.1: the Leave War registry is cells + bids + six coarse records | There is also **`lw.war/<warId>`** (the period record). Without it a stage advance, rename, bidding-window change or a brand-new cell-less war diffs to nothing — added during the build (Fable-2) | `leavewar/state/store.ts:lwDecompose`, `lwRegisterCommands` |
| 9 | Spec §3.1: `lw.config` = eventdefs/figorder/rosterorder/perslabels/manning\*/group\*/showsans/personedits | Also `figureHidden`, `requirements`, `eventRows` | `leavewar/state/store.ts:lwDecompose` |
| 10 | Spec §3.1: the Tracker registers 10 collections | **11** — `trk.courses` was omitted | `tracker/app/core.js` (the `cols` array) |
| 11 | Spec §3.2/§5.1: the mid-reducer `notify`/`toast`/`logEdit` are latched | The build **deliberately did not wire toast or edit-log latching**, and says why in its own header. The model + repaint/history effects ARE latched | `state/sched-commit.ts` file header |
| 12 | `feature-impact.md`: the Drafts button is `board.ts`'s `draftsMenu` | No such function. It is **`planMenu`** (`planSelectorHTML` → `planMenu`) — the drafts menu became the Plans selector | `ui/board.ts:planMenu` |
| 13 | `feature-impact.md`: manning thresholds are "persisted `manningthresh`… rule definitions stay code-owned" | The whole rule set IS data now, persisted under **`manningdefs`**. `manningthresh` is "still READ at boot… but never written again" | `leavewar/state/store.ts` (the `requirements` field comment) |
| 14 | `engine-rules.md`, **nine places**: `restoreDayVersion` is a ROLLBACK — the version becomes the live document immediately and stamps `SCHED.cur[di]` | **The function was REMOVED at Phase 2.** The live path is `loadVersionToWorkingCopy`, which deliberately does **NOT** touch `SCHED.cur`: the issued version viewers see is unchanged, and nothing reaches them until a new AL is published. The old prose said the opposite | `engine/restore.ts` (header), `engine/drafts.ts:loadVersionToWorkingCopy` |
| 15 | `engine-rules.md` ×3: a pending **mark** is what puts the day into the next AL | `dayHasChanges` reads straight through the canonical `dayDelta` — "the one authority for eligibility, the panel counts and the stored diff". The mark drives the pending tint and the edit log | `engine/publish.ts:dayDelta`, `dayHasChanges` |
| 16 | `data-schema.md`: `iid` is minted `'i' + n`, monotonic, counter seeded past the highest stored id at boot | It is the **opaque** `newId('i')` = `'i'` + base-36 timestamp + 6 random chars. `state/persist.ts` says so in place: *"no counter to seed past stored ids"* | `engine/newid.ts`, `engine/inputs.ts:inpId` |
| 17 | `feature-impact.md`: the week stash "is session-only on purpose… no localStorage" | `persistAll` writes every stash entry into the `weeks` collection; a built site brings every visited week back | `state/persist.ts:persistAll` |
| 18 | `feature-impact.md`: `schedFields` is an **eleven**-field list | **Fourteen** fields | `state/history.ts:schedFields` |
| 19 | `feature-impact.md`: "Everything else — INPUTS, publish state, the toggles, the bell, muted checks — is session-only. Say so." | Backwards since 8 Sep 26. Only undo/redo history, the edit log and the view-state registries (`LATEOFF`, `BELLLIT`, the armed slot, selection) are session-only. `WARNOFF` persists — it rides `histSnap`/`weekStashSnap` | CLAUDE.md §"WHAT ACTUALLY PERSISTS"; `state/persist.ts`, `state/history.ts` |
| 20 | `feature-impact.md`: "no persisted blobs means no stale-schema blobs" | Gone. Stash entries persist, which is exactly why `storage/reset.ts` carries `SCHEMA_VERSION` and clears `inputs`+`weeks` on an incompatible shape change | `storage/reset.ts` |
| 21 | `engine-rules.md` ×5: inputs / qual ticks / medical document blobs / `SCHED.drafts`+`curDraft`+the AL list / the planning stores are session-only | All five persist on a built site: `inputs/all`; `persistPeople()` on every Quals write; an IndexedDB drawer behind the doc cache since 8 Sep 26; `schedFields()` → `weekStashSnap()` → `weeks/<wk>`; `plan/all` | `state/persist.ts`, `state/docs.ts`, `state/history.ts`, `ui/QualsPage.tsx` |
| 22 | `engine/publish.ts` **code comment**: "Nothing here persists past the session — neither does the AL list itself" | False since 8 Sep 26. `SCHED.orig` and `SCHED.als` ride `schedFields()` into the week record. **Comment corrected in place** — no behaviour change | `engine/publish.ts` (above `daySnap`) |

### Checked and found CORRECT — no change made
- `data-schema.md`'s persistence table (corrected 17 Sep; re-verified against `storage/backend.ts`,
  `state/persist.ts`, `storage/reset.ts`, `state/docs.ts`).
- `performance.md`'s two enforced ceilings — `#sbBoard` ≤ **1150**, `#eWeek` ≤ **5450** — match
  `probes/perf-port.cjs` exactly.
- Spec §2.5: seven storage collections (`storage/backend.ts COLLECTIONS`); reset clears
  `['inputs','weeks']` (`storage/reset.ts RESET`); `persist.ts` carries four week invariants.
- Spec §2.3: `retractLwRow` really does run inside the `writeInputsBatch` reducer
  (`ui/inputedit.tsx:commitInputEdit`).
- Spec §3.5: ownership `personId` really does come from the ME binding (`state/auth.ts`).
- Spec §2.4's Tracker claims (no funnel; async `sSet`; `renCourse` label-only; `switchCourse`
  confirms; `applyHist`/`applyMarkHist` do save).
- `data-model.md` — it is the **designed target** schema for the database step, not a description of
  today's code, so its unresolved names are correct by construction. Nothing to sweep.

---

## C. Deliberately set aside (say so out loud)

1. **`file.ts:NNN` citations that have drifted by a line or two but still land inside the function
   they name.** Left alone: re-pointing them is churn that decays on the next edit, and they do not
   mislead. The ones that landed on unrelated code were repaired to symbol names instead.
2. **`docs/data-model.md`** — swept only for symbol existence, which it correctly fails. It is a
   to-be model; there is no code to check it against until the database step.
3. **Spec §4 / §6 / §7 / §8** — forward-looking (Steps 3/5). They describe nothing that exists yet,
   so there was nothing to verify them against. Not a pass; an absence of anything to check.
4. **The three remaining `restoreDayVersion` mentions further down `engine-rules.md`** that use the
   name as a *pattern* ("the `restoreDayVersion` direct-write shape/idiom"). Those are fine as a
   shape name and one dated note now says so; they were not individually rewritten.
5. **The tracker smoke gate failing three times running on the desktop** (noted in session-state,
   fails on clean code too). Unrelated to the docs; still unexplained; blocks nothing.
6. **Anything requiring a running app.** This sweep is static. The live-drive proof belongs to the
   follow-up #1 build (plan §5).

---

## D. What a cross-provider reviewer should be asked

Not "review these documents" — that repeats the failure mode. Ask exactly this:

> Here is a table of 22 claims. Each row names a document's assertion, my reading of the code, and
> the file to open. **Open the code and tell me which rows I got wrong**, and which claims in those
> same files I failed to check. Do not compare one document against another — that method already
> failed here on 17 Sep.

Both providers, on the table only (a page, not 7,000 lines).

**This worked.** Both reviewers opened source files, both returned REVISE, both independently
identified the same highest-severity gap, and each found material defects the other missed
(Fable: the surviving `restoreDayVersion` claims in two other documents, the broken symbol pass,
the queued-commit return shape; Astra: the week-record field list, the person-reference section,
the day-template refusal, and an over-correction of mine). Neither could run a gate, and both
said so in their limitations — so the host must run them, which is the division of labour the
runner intends.

---

## E. Round-2 findings (both reviewers) — all 16 accepted and fixed

**The one they both found, independently, and rated highest.** §Version snapshots / restore in
`engine-rules.md` — the section round 1 edited — still described **three more removed functions**
(`reissueReopened`, `unpublishAL`, `publishAL`) and a replaced version-id format, as live. Fixed
by rewriting the section against `engine/publish.ts`: the verId identity, the SINGLE-DAY AL
record `{id,di,iso,seq,snap:{d,c,fil},diff,sign}`, the descending-seq fallback, no reopen, no
re-issue, no unpublish, the Original frozen forever — with each dead paragraph quoted dead rather
than deleted. **Round 1's own replacement sentence was wrong too** (`SCHED.cur` holds a version
IDENTITY for one day, not an AL number for several); corrected.

| ID | Reviewer | Sev | What was still wrong | Fixed |
|---|---|---|---|---|
| F1 / DOC-002 | both | high | §Version snapshots still described `reissueReopened`, `unpublishAL`, `publishAL` and `'orig'\|n` version ids as live; round 1's own `SCHED.cur` correction was also wrong | `engine-rules.md` §Version snapshots rewritten; §Publishing/amendments record shapes rewritten; the two earlier "unpublish" clauses quoted dead |
| F2 | Fable | high | `restoreDayVersion` still claimed to EXIST for the probe bridge in `feature-impact.md` Flow D and `ui-contracts.md` — a probe author following it gets `undefined` | both corrected; Flow D now names `loadVersionToWorkingCopy` |
| DOC-003 | Astra | high | `data-schema.md`'s week-record example listed **11** SCHED fields, omitting `sb` (signature bindings), `v` and `am`. A book persisted without `amV` is quarantined as unsupported, so a serializer built from it would freeze every week it wrote; `un` was mislabelled as content keys | example corrected to 14 fields, with a field-by-field table; `un` = stable input ids (`inpId`) |
| DOC-001 | Astra | high | Sweep row 11 named toast and the edit log as the un-latched effects. **Saving is a third.** `persist.ts` wraps the deferred `histPush` with an immediate `persistAll()`, so a rolled-back command leaves the whiteboard and the Postman queue written — a rejected edit can return after a reload | recorded as a third latching gap; it is follow-up #2's target and the plan's §7/§8 now carry it |
| DOC-004 | Astra | med | §Who a row stores still said `ground[].who`/`allhands[].who` hold CALLSIGN STRINGS and that `renameCallsign` must rewrite rows. ARCH-STACK 1C made both the opposite | rewritten: stable ids on the write side, `whoId` id-first on the read side, rename moves nothing, sim `.who` is free text only |
| DOC-005 | Astra | med | `applyDayTpl` documented (twice) as REFUSING a published day and directing the user to "Reopen the day first" | quoted dead; the guard was replaced by the rebase it pointed at — a template on a published day is a working-draft edit, issued records untouched, published as the next AL |
| F8 | Fable | med | The same false persistence premise remained in **13 code comments**, three load-bearing. Worst: `state/disclosure.ts`, a Step-2 file, justified its in-memory registry with "it matches the app's session-only INPUTS/stash persistence" | all 13 corrected in place, comment-only. The disclosure one carries a real Step-3 consequence — see §F |
| F9 / DOC-006 | both | med | Residual `feature-impact.md` text contradicting rows 15, 17 and 18 — and **round 1 over-corrected**: "a built site brings every visited week back" is too broad, a week merely looked at and never changed is deliberately never stored | all corrected, including the over-correction, with the exact rule (`stashHas \|\| weekDirty`) |
| F3 | Fable | med | The symbol-existence pass counted tombstone comments and tests as existence | §A.1 rewritten and the pass re-run properly |
| F4 | Fable | med | Spec §3.1's normative prose still carried `days/<wk>:<date>` 15 lines above the table Rev 5.1 fixed — and the prose is what defines the Change semantics Step 3 keys on | corrected |
| F5 | Fable | low | The 12-site `histPush` list mislabelled `alIssue` as `publishALDay`, and listed `markEdit`'s site under "without `afterSchedMutate`" when it IS that epilogue | relabelled; the true bypass set is 11 sites plus the four direct `markEdit` callers |
| F6 | Fable | low | Rev 5.1 cited `state/store.ts:rawPersist`; it is `leavewar/state/store.ts` — the same wrong-file class as row 2 | corrected |
| F7 | Fable | low | Spec §3.2 said a queued commit returns `{queued:true, result}`; the API paragraph and `command/types.ts` say `{queued:true, done: Promise}` | corrected, with a note that follow-up #1's synchronous `.value` helpers assume a non-queued commit |
| F10 | Fable | low | Gates were reported as vitest/parity/build with no statement of what was NOT run, and §C.5 waved off a red smoke gate | the gate line now says which suites were not run and why; §C.5 no longer claims it blocks nothing |

**Not accepted as stated — one scope boundary.** Fable's F2 also surfaces that `ui-contracts.md`
(~6,400 lines) was never in this sweep's scope. The one false claim it named there is fixed, but
that file has NOT been swept, and the tightened symbol pass shows ~20 more unresolved identifiers
in it. **Flagged, not done** — sweeping it is its own task, and expanding into it now would be the
scope creep the owner explicitly ruled out.

## F. The finding that turned out to be a wrong PREMISE, not a bug (owner, 17 Sep 26)

Round 2 (Fable F8) raised this as the one finding bigger than a documentation defect:
`state/disclosure.ts` recorded which issued versions had "left the machine" — a send, a PDF or CSV
export, the session ending — in memory only. Step 3 reads that signal to choose between silently
reversing an amendment and putting a correction on the record. So an amendment exported as a PDF
would read as never-disclosed after a reload, and Step 3 would erase it quietly.

**The owner rejected the premise rather than the persistence, and he was right.**

His ruling: *"as long as if I publish and undo and it didn't hit the database there isn't a need to
put it in the records history, but if it's published and the database registers and I undo, it will
be recorded as this was undone in the history to prevent silent bugs."* And on the export:
*"my end goal is to export the current day only's published schedule … it's only purpose is to
export the snapshot of the current schedule … this is a scheduler only function and they know
what's the latest copy to use. Don't need to be so complicated."*

So the boundary is ONE fact — **has the shared database registered this issued version?** An export
is a scheduler's own snapshot, not a publication to the squadron, and does not constrain undo.

**This dissolves the finding.** There is no local record whose loss could matter: the database holds
the fact, and a fact the database holds cannot be lost to a reload. **Done:** the three reporting
call sites (`printpdf.ts`, the Shell's CSV button, `resetSession`) are removed, `state/disclosure.ts`
now carries the database rule and names the superseded one, spec §3.4 is rewritten, and
`publish-commit.test.ts` pins the new contract. It also SUPERSEDES an accepted round-4 review
finding (Codex R4-003), quoted dead in the Rev-5 change-list rather than deleted.

**Worth recording as method.** Two reviewers and I all treated a fragile mechanism as something to
make robust. The owner asked why it existed. The standing rule — *when several defects trace back to
one decision, question the decision before patching the defects* — applied here and none of the
three of us reached for it. The reviewers could not have: they were handed a claims table and asked
whether the code matched it, which is a question about correctness, not about whether the feature
should exist. **A correctness review cannot tell you a mechanism is unnecessary.** That judgement
needs whoever owns the intent.

**Answered the same day (owner, 17 Sep 26):** on the registered side the artefact is **just a line
in the history saying it was undone** — NOT a correcting amendment. That sets aside the 16 Sep
"forward withdrawal" wording, which is named as superseded in spec §3.4 rather than deleted. The
never-erase / never-reuse-an-issued-id rule is untouched. Build record: `[GLOBAL-UNDO]` in
OUTSTANDING.md.

## G. Flagged, not fixed — the PDF export's scope

The owner stated the intent: *"export the current day only's published schedule."* Today
`ui/printpdf.ts:printSchedPDF` exports **the whole loaded week** — `publishedDays()` with a
Monday-to-Sunday label. That is a product gap, not a documentation defect, so it is recorded here
and NOT changed: narrowing it is a deliberate behaviour change with its own live check, and it is
not part of this sweep or of follow-up #1. **QUEUED** on `[FLAG-EXPORT]` in OUTSTANDING.md — per
the owner's standing rule of 17 Sep 26, a deferred task goes into that file in the same pass and
takes its place in the priority order, because a note anywhere else gets lost.
