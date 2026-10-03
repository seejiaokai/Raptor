# Insights mission mix — Opus 5.5 interim code read (D533), 3 Oct 26

**Scope (D533):** an independent code read of `codex/insights-mission-mix` at build commit
`4cfe81a13acf6d0afcdf9c4f2282ec7f8ce4871f` (planning baseline `5f9bf978`), with `[INSIGHTS-BOARD-DOOR]`, plus the
few riskiest paths tried in the running app. Reviewer: Claude Opus 5.5 (the code was written by Sol 6.1; Astra
planned and read it). Chosen by the owner over the full interim review because his weekly Claude allowance stood at
94% used.

**NOT done by this read — still OWED to Claude's review after the reset (Monday 5 Oct 26, 19:00):** the 33 scenarios
driven through their real routes, the frozen desktop-and-phone walk with pictures, the full gates. This read fixes
no application source and permits no merge or push to main.

## Verdict — REVISE (small): three concrete findings, none corrupts data

No finding touches what is saved, signed or counted. One is a visible regression on a published day (F1), one is a
plan departure in behaviour (F2), one is wording a scheduler will read (F3). The design the plan asked for — answers
kept apart from the signed programme, keyed by formation and wording, their own history/Undo/permissions — is what the
code does; I found nothing wrong in that core.

**The limit of this conclusion:** it rests on reading every changed source line and on three targeted runs of the
frozen build. It is not a walk. The 33 scenarios, the phone layouts, the gates and a physical iPhone were not
exercised by me; Codex's results for them were not re-run and are not endorsed or disputed here.

## Findings, most serious first

### F1 — A Remarks box changed by an amendment loses its "Changed at AL…" mark on the Board's view of the latest published version (tracking On) — BUILD REGRESSION, confirmed in the running app

- **Trigger:** Blue/Red tracking On; signed in as a scheduler; Edit Schedule → Board → "look at" the latest published
  version of a day (the plans selector); a flying formation whose mission or Remarks carries a DS/RED cue (not exactly
  DS / RED / RED AIR) and whose Remarks were changed in an amendment.
- **Expected:** every box changed at AL*n* shows that amendment's coloured outline and the "Changed at AL*n*" hover —
  as the callsign box beside it does, and as the same Remarks box does with tracking Off and did before this build.
- **Actual:** the Remarks boxes of that formation are drawn without the mark. The amendment that added "DS FOR …"
  to Remarks — the very change that makes the formation ask the question — is the one whose mark disappears.
- **Where:** `src/ui/board.ts:298`. When `roleAccess` is true (set at `:188`) the box's attributes are replaced
  wholesale by the read-only door's (`data-role-remarks … readonly aria-label`), so `alAttr(\`fr:${key}\`)` is no
  longer emitted. The plan asked only for "NO schedule-edit `data-bfld` key" (§7, published-context door); the
  amendment mark is a separate attribute and can be kept.
- **Reproduction (real controls, frozen build):** `docs/img/insights-opus-interim/probe-almark.cjs`. Tracking On →
  publish Monday → on the working copy set formation 1's Remarks to `DS FOR ALPHA` and its callsign to `PROBE` →
  publish AL1 → look at AL1. Read back: callsign `data-alc="1"`; Remarks **no** `data-alc` (2 marked boxes in view).
  Tracking Off, same view: Remarks `data-alc="1"` (3 marked boxes).
- **Pictures (both opened and inspected):** `docs/img/insights-opus-interim/build-almark-tracking-on.png` — "DS FOR
  ALPHA" has no outline while both PROBE callsigns do; `…/build-almark-tracking-off.png` — the same box outlined.
- **Likely also affected, NOT verified:** anything else that finds a Board cell by its `data-bfld` key in that view
  (the History gold dot / bubble on that Remarks box). The plan accepted dropping the key; check it when fixing.
- **Fix direction for the builder:** keep `${alAttr(\`fr:${key}\`)}` in the `roleAccess` branch; add a mounted
  regression that renders a latest-published day with a `SCHED.changes` mark on a conditional formation's Remarks,
  tracking On, and asserts `data-alc` beside `data-role-remarks`.

### F2 — An open Blue/Red question disappears after any other edit on the same day — PLAN DEPARTURE, confirmed in the running app

- **Trigger:** tracking On; type a cue into Remarks (question appears below AREA); before answering, change anything
  else on that day — in the run, another formation's take-off time.
- **Expected (revised plan §7):** "An open unanswered question remains available until Later, answer, context
  invalidation or navigation." The same section lets an offer survive a same-context unrelated edit ("may retain").
- **Actual:** the question is removed without a word. Nothing is lost or mis-counted — the formation stays unanswered
  (an ordinary total bar, D523) and "Choose mission role" comes back when its Remarks box is selected — but the
  scheduler is not asked again and has no cue that he never answered.
- **Where:** `src/state/mission-roles.ts:96` — `targetIsCurrent` requires the DAY's record revision to be unchanged
  (`t.dayRevision===now.dayRevision`), and `reconcileMissionRoleOffer` (`src/ui/mission-role-offer.ts:119`) clears the
  open question on the next repaint when that fails. Any command that touches the day bumps it.
- **Reproduction:** `docs/img/insights-opus-interim/probe-tpl.cjs`, facts `questionAfterOwnEdit` (question shown) →
  `questionAfterUnrelatedEditSameDay` (empty) → `afterRefocus` ("Choose mission role").
- **Classification:** build behaviour against the plan's stated rule; no data consequence. If the strict guard is
  wanted for safety at ANSWER time, the builder can keep it there and re-resolve a fresh target for an open question
  whose formation identity and context are unchanged — or the owner can accept the present behaviour (a product call;
  D529 already provides the Choose fallback).

### F3 — The History line for a role copied by a day template shows an internal row code instead of the formation — BUILD DEFECT (wording), confirmed in the running app

- **Trigger:** save a day holding an answered formation as a template; apply it to another unpublished day.
- **Expected:** a line a scheduler can read, naming the formation (as the manual answer does: "VL · mission role ·
  Working copy").
- **Actual:** `rmusab94vy0dhij · mission role · copied with the day template` — the row's internal id.
- **Where:** `src/state/changelines.ts:449–453`. The name is read from the command's detail; the template apply's
  command (`src/ui/board.ts:671–673`) carries none, so the fallback `role.formationRid` is printed. The plan's
  "formation label/rid" allowed the id as a last resort, not as the normal wording.
- **Reproduction:** `probe-tpl.cjs`, fact `historyAfterApply`.
- **Fix direction:** resolve the callsign from the destination day at copy time (the formation is at hand in
  `copyMissionRoles`) or pass names in the enclosing command's detail; keep the id only when no callsign exists.

## Leads followed and dismissed (so the next reader does not repeat them)

- **The Board's "never repaint under the caret" guard was widened** (`src/ui/textedit.ts:337` now counts Board boxes).
  `board.ts` carries an old warning that widening it "would freeze the panels". Tried on the frozen build AND the
  untouched planning build (`probe-repaint.cjs`): type a take-off, click into Remarks, leave — both repaint the same,
  warnings update the same, focus behaves the same. Not a regression on that path. **Unverified remainder (low):**
  after "Choose/Change" saves dirty text with focus kept in the box, the repaint is skipped by design; whether a
  published day's "changes to go out" strip then waits for the next action was not checked.
- **History/Undo wording for a manual answer** — the command's `meta.key` does become the envelope's `detail`
  (`command/commit.ts:239`); the manual line reads correctly (seen: "VL · mission role · Working copy").
- **Dirty-text Choose (Astra R1's defect)** — `saveVisibleText` normalises exactly as the real writer `txtSet` does
  (whitespace collapsed, trimmed, "—" as empty), fires the editor's own save event, then re-resolves a fresh target;
  a failed save clears rather than answering a stale context. Read only — its twelve regressions were not re-run.
- **Row ids** are kept in published snapshots and in parked plans and survive reload (`engine/rowids.ts`), so an
  answer keyed by row id + wording reaches the published face and survives a plan switch.
- **Day templates** — crew and cancellations are stripped, ids re-minted, seeds validated by path AND wording, copied
  only to fresh ids inside the same command as the day; one Undo took back the day and the role, Redo restored both
  (seen in `probe-tpl.cjs`). **Unverified edge (low):** the weekly editor's Templates button has no "previewing a
  version" guard at the menu (`board.ts:1459`); if it can be pressed while a saved plan is being looked at, a template
  that carries seeds would be refused whole and silently (`mission-roles.ts` `copyMissionRoles` → `formation()` is
  null under a preview). The Board's own button is disabled there.
- **Automatic Red, cue matching, validation** — `engine/mission-role.ts` read line by line: exact DS / RED / RED AIR
  (and the RED-AIR / REDAIR spellings) are Red without a question; DS-2, RED AIR 2, ACM/DS, REDAIR2 ask; PODS, CREDIT,
  INFRARED do not; malformed stored answers are inert.
- **Permissions, storage, reset** — one matrix row (admin writes, others read), ownership check covers the new
  collection, the settings writer refuses the role rows, the format wipe clears them with the weeks. Read only.

## What was read

Every changed non-test source line between `5f9bf978` and `4cfe81a1` (39 files; the four new modules whole), the
callers and neighbours they touch (`alAttr`, `txtSet`, `txtCommit`, `boardChange`, `pickDayTpl`/`applyDayTpl`/
`mintBlob`, the Board and week repaint effects, `commitSched`, row ids), the revised plan §6–§7 and its scenario table
rows S19–S22/S26/S28/S31, the D512–D533 short lines and the D528/D496 full rows, `HANDOFF.md`'s build block.
**Not read in full (D533):** the Opus plan review, the revised-plan review, Codex's evidence sheet and Astra's R1/R2
reports, the test files, the handpass scripts beyond their helpers.

## The 33 scenarios

**None was exercised by this read.** Their real-route qualifications in Codex's evidence sheet were not assessed.
All 33 stay owed to Claude's review after the reset.

## Additional scenarios run here (frozen build, Chromium 1440×900, real controls, no model writes)

| # | Scenario | Result |
|---|---|---|
| X1 | Board: save a box, move straight to another, leave it — build vs planning build | Same on both; no regression |
| X2 | Publish, amend Remarks to a cue + a callsign, publish AL1, look at AL1 — tracking On vs Off | **F1** |
| X3 | Own edit asks; unrelated edit on the day; refocus; answer; save as template; apply; Undo; Redo | **F2**, **F3**; travel/Undo/Redo correct |

Browser errors in all three runs: none. The build served was the `dist` Codex froze in its build folder
(`.claude/worktrees/codex-insights-mission-mix`, clean, at `4cfe81a1`); the planning build was the `dist` kept under
`.claude/insights-baseline-check/snapshot`. I did not rebuild either.

## Gates and walk

**No gate was run and no lock was taken** (none of these runs is a full unit suite, a multi-file browser run, the
Tracker smoke or a fanned-out walk). Codex's recorded outcomes (unit 7,642 passed; FULL browser 519 passed / 1 failed
/ 49 skipped before the wrapper repair; affected re-run 197 passed; audit 24 passed / 3 failed, the same three on the
planning build) are theirs and stand as they recorded them — not re-verified here.

`Walk: not run (D533) — three targeted probes on the frozen build at desktop size; 2 pictures saved, both opened.`
Phone size, short-height layouts, the weekly editor's flows and a physical iPhone: not exercised.

## Still owed before main

Claude's review after the reset (Fable and Astra as before — D492, D353): the code read by a reviewer other than
Opus, the 33 scenarios through their real routes, the frozen desktop-and-phone walk, the gates. F1–F3 should be fixed
on the build branch first (Sol builds, Astra reads — D496), each with a failing-first regression.
