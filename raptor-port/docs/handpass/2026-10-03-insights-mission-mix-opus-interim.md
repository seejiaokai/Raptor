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

**Update, same day:** all three were FIXED on the branch by Opus under D534 (F2 as he ruled it, D535), each with a
failing-first test, re-walked at desktop and phone size, full gates green — see §Fixes. The verdict below is the read of
build `4cfe81a1` as Codex left it. The fixes themselves are unreviewed until Fable and Astra read them after the reset.

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

## Fixes — D534 (3 Oct 26)

He asked Opus to fix F1–F3 on the build branch (D534) and ruled F2's behaviour (D535: the open question stays). He
also offered Sonnet for the fixes with Opus reviewing; declined — D484 sends nothing to Sonnet before the reset, and
`raptor-executor.md` keeps the implementation in the main session. **Opus wrote these fixes, so Opus does not inspect
them: Fable and Astra read them in the review after the reset.**

**Tier.** The eight questions for the fixes alone: money NO; the published record — F1 changes how an issued day's
amendment mark is DRAWN, never the record (YES, as a drawer); saved data — F3 changes the words of a new History line
only (NO new field); a shared drawer YES (the Board's Remarks box); a new gesture NO (F2 changes how long an existing
question lives); a new surface NO; roles NO; the warning list NO. They ride the Insights batch, which is FULL (D485);
this is that check's "fix → re-walk what the fixes touched → gates" step, and its two independent reads stay owed.

| Fix | What changed | Failing-first test (`src/ui/mission-role-interim-fixes.test.tsx`) |
|---|---|---|
| F1 | `src/ui/board.ts:298` — the read-only door's attributes now carry `alAttr` as the ordinary box does | "F1 — the read-only Remarks door … keeps its Changed at AL mark": real sign → approve → text → publish AL → the Board's own preview builder; was `null`, now `data-alc="1"`; tracking Off pinned the same |
| F2 | `src/state/mission-roles.ts` — `sameQuestion()` re-resolves a target when only the day's revision moved (`targetIsCurrent` unchanged in meaning: still strict at answer time); `src/ui/mission-role-offer.ts` — `reconcileMissionRoleOffer` rebuilds an open QUESTION on that fresh target when the formation still sits where it sat | "F2 (D535) — an open question stays through an unrelated edit…": mounted App, real week handlers; another formation's take-off, then the same formation's take-off, then the real Red — was 0 questions, now 1, and the answer lands on the asking formation. A second test pins what must STILL dismiss it (its own wording stops asking; tracking Off) — green before and after |
| F3 | `src/state/changelines.ts` — a copy with no name in the command reads the formation's callsign off the loaded week; the row id is the last resort | "F3 — a role copied by a day template is named in History by its formation": real `addDayTpl` → `pickDayTpl`; was the row id, now "VL · mission role · copied with the day template" |

**What still removes an open question (kept, per plan §7 and D535):** Blue / Red / Later; the formation's mission or
cue wording changing; the formation moving, losing an aircraft or going (its place on the day is compared); tracking
Off; Undo/Redo; a change of day, week, version or sign-in; someone else's answer to the same question.

**Roll-call for the fixes** (the thing each attaches to, every place it is drawn):

| Thing | Place | Has it |
|---|---|---|
| The amendment mark on Remarks | Board, working copy (editable box) | YES — unchanged (`data-bfld` + `alAttr`) |
| | Board, latest published, tracking Off / member / exact-Red or no-cue formation (disabled box) | YES — unchanged |
| | Board, latest published, tracking On, scheduler, cue formation (read-only door) | **was MISSING — fixed (F1)**; seen at desktop and phone |
| | Board, an OLDER published version | YES — unchanged (no door there) |
| | Weekly editor and View-only Sched (text spans) | YES — unchanged; the door does not exist there |
| The open question | Board, working copy | stays through an unrelated edit — seen at desktop and phone |
| | Weekly editor, working copy | stays — mounted test (real week handlers); NOT walked in the browser |
| | Board, latest published (read-only door) | same code path; NOT walked — nothing can be edited under a preview |
| The role's History line | a manual answer | named by callsign — unchanged |
| | a day-template copy | **fixed (F3)** — seen at desktop |
| | Undo/Redo of either | "Undo — …" line unchanged; not re-walked |

**Re-walk on the fixed build** (`raptor-port/dist` built from this working tree; Chromium, real controls;
`docs/img/insights-opus-interim/probe-almark.cjs`, `probe-tpl.cjs`; browser errors: none):

| Check | Desktop 1440×900 | Phone 390×844 |
|---|---|---|
| F1 — Remarks changed at AL1 keeps its mark, tracking On | PASS — 3 marked boxes, as with tracking Off | PASS |
| F2 — question still there after another line's take-off is changed; then Red answers | PASS | PASS |
| F3 — History names the formation for a template copy | PASS — "VL · mission role · copied with the day template" | NOT WALKED — the probe looks for the desktop Templates button; the wording is not width-dependent |
| Template travel, one Undo, Redo (regression check) | PASS | NOT WALKED |

Pictures, all four opened: `docs/img/insights-opus-interim/fixed/fixed-desktop-almark-tracking-on.png` and
`fixed-phone-almark-tracking-on.png` (the "DS FOR ALPHA" box now outlined like the PROBE boxes),
`fixed-desktop-tpl-destination.png` ("Change mission role" on the destination day),
`fixed-phone-question-kept-then-answered.png`.

**Checks — one full gate run on the fixed working tree, the PC lock taken and released by `gatelock.mjs run`, 3 Oct 26, about 14 minutes in all, every gate watched to its result:** unit **7,646 passed, 0 failed** (481 files, 280 s — Codex's 7,642 plus these 4) · build PASS · the original's assertions **728 / 0** · browser tests **520 passed, 0 failed, 49 skipped** of 569 (3.3 min) · Tracker suite **445 / 0** · rule coverage OK (MIX17, MIX18 registered and named by a test) · document check OK. Before it, the feature's own seven test files: 84 / 84. The three new tests were RED on the unfixed build first (the report's F1–F3 wording is their failure text). `npm run perf` and the adapted probes were NOT run (no drawing or layout was added; the mark is one attribute on an existing box).

`Walk: docs/handpass/2026-10-03-insights-mission-mix-opus-interim.md · 6 pictures (2 before, 4 after) · 3 surfaces re-walked (Board working copy, Board latest published, History) · 2 orders (edit-then-answer; save-apply-undo-redo) · MISSING: 1 fixed (F1)`

## His find on the preview — D536 (3 Oct 26)

Looking at the fixed build on his iPhone he opened Insights and sent a picture: the window's title bar and ✕ sat under
the browser's address bar, and no scrolling reached them. **"Fix it thanks"** (D536).

- **Cause.** On a phone a pop-up window is a bottom sheet (29 Aug 26) limited to `90vh`. On an iPhone `vh` is the screen
  WITHOUT the browser's bars; with the address bar and toolbar showing, the sheet is taller than what is visible, and
  being pinned to the bottom it pushes its own top off the screen. The sheet itself is the scroller, so scrolling moves
  the content, never the sheet. Insights is the tall one (longer still with the Blue/Red legend and numbers), and this
  build gave the phone its own door to it (Board → ⋯ → Insights) — old code a new door made easy to reach.
- **Provenance.** The rule is older than this build (the shared `.modal-box`), so every tall pop-up window on his phone
  had it; not a regression of the Insights build, but met through it.
- **Fix.** `src/ui/scheduler.css` — the phone sheet's limit is `90%` of the fixed backdrop (which tracks the visible
  screen), then `90dvh` where the browser has the dynamic unit; the desktop/tablet card gains `84dvh` after its `84vh`.
  Every `.modal` window gets it, Insights among them.
- **Tests.** `src/ui/modal-phone-height.test.ts` — RED first ("expected '90vh' to be '90dvh'"), pins the stylesheet:
  the sheet's limit ends on the dynamic height, has the `%` fallback, never plain `vh`. `e2e/insights.spec.ts` — three
  new browser cases (short phone 390×560, phone, short desktop 1440×620): Board door → Insights → Show all → the title
  bar is on screen and the ✕ is the element under a tap on it. **These three were green before the fix too** — the
  check's browser has no address bar that shrinks the screen, so it cannot show his fault; they guard the promise where
  it is measurable.
- **Tier.** A shared drawer (every pop-up window) — WALK, not LOOK. Roll-call of what is sized the same way:

| Surface sized by `vh` | Pinned to an edge on a phone? | Disposition |
|---|---|---|
| Every `.modal` window — Insights, Templates, Plans, Manage waves, day/duty/wave editors | bottom sheet, was `90vh` | **fixed (D536)** |
| The airspace pop-up (`80vh`), the input picker (`75vh` sheet; its full-screen form already `100dvh`), the History bubble's list (`40vh`), the availability and changes windows (`62vh`), the calendar and notification panels (`calc(100vh − …)`), the document viewer (`58vh`), two menus (`70vh`, `82vh`) | several are | **filed** — `OUTSTANDING.md` `[VH-SHEETS-IPHONE]`; none reported, the short ones leave room, not changed here |

- **Seen.** Fixed build, Chromium at 390×660: window top at 66 px, title bar and ✕ on screen, limit 594 px (90%) —
  `docs/img/insights-opus-interim/fixed/d536-phone-390x660-insights-window.png` (opened). Desktop 1440×900: top at
  72 px, limit 756 px (measured, no picture kept).
- **What only his phone can prove (bug-check §7.9):** that the title bar clears the address bar on his iPhone, with the
  browser's bars both showing and hidden. **This is the one line on his look card.**
- **Checks — a second full gate run after the stylesheet change, PC lock taken and released, about 14 minutes:** unit **7,649 / 0**
  (482 files) · build PASS · the original's assertions **728 / 0** · browser tests **523 passed, 0 failed, 49 skipped** (the three
  new cases among them) · Tracker suite **445 / 0** · rule coverage OK · document check OK.

## His second report — the Duty templates window "closes itself" (3 Oct 26) — FOUND, FILED, NOT FIXED

*"when I'm on this page in desktop mode, it seems like this page closes itself when I tried to type in a new row role. Something
along that line."* He did not ask for a fix and no ruling allows one (D534/D536 name their fixes), so it is filed.

- **Reproduced on a desktop (1440×900), build AND the untouched planning build:** Board → Duties → + Block → the pencil → + Add role →
  press inside the new Role box, drag to select its text, let go OUTSIDE the window: **the window closes.** The press began
  inside the box and the release landed on the dark surround, so the browser reports one click on the surround — which is the
  window's "tap outside to close" (`src/ui/DutyTplModal.tsx:74`, and the same test on at least six other windows).
- **NOT reproduced:** tapping the box, typing letter by letter, Enter, picking a suggestion, Tab — at desktop size, and on a phone
  in both Phone layout and the Board's Desktop layout (Chromium emulation: no real keyboard, so an iPhone's keyboard moving the
  window under a finger is unproven either way).
- **Provenance:** older than the Insights build (same result on the planning build); `DutyTplModal.tsx` is untouched by it.
- **Probe:** `docs/img/insights-opus-interim/probe-dutytpl.cjs`. Filed as `OUTSTANDING.md` `[MODAL-DRAG-CLOSE]`.


**Not done here, still owed:** the weekly editor's flows in a real browser, short-height layouts, a physical iPhone,
the 33 scenarios, the two independent reads of these fixes and of the build (D534, D533).

## Still owed before main

Claude's review after the reset (Fable and Astra as before — D492, D353): the code read by a reviewer other than
Opus, the 33 scenarios through their real routes, the frozen desktop-and-phone walk, the gates. F1–F3 should be fixed
on the build branch first (Sol builds, Astra reads — D496), each with a failing-first regression.
