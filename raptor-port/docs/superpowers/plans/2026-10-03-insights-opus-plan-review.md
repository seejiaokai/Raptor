# Insights mission mix — Opus 5.5 independent plan review, 3 Oct 2026

Reviewer: Claude Opus 5.5, under D528 (the owner's early plan review, brought by him; Codex did not dispatch it).
Plan-only. No source, test, guide, hook or frozen record was changed; nothing was built, merged or pushed to `main`.
This review does not discharge the code/scenario read owed after the build, and it approves no picture for the owner.

**Verdict: REVISE — not PASS.** Five blocking findings (B1–B5), eight useful improvements (I1–I8), three
choices that are the owner's (O1–O3). The product contract is sound and the plan's overall shape — one pure
resolver, one issued-world traversal, a separate typed setting, a separate answer command — is right. The blockers
are places where the plan, built as written, produces a wrong or missing behaviour that its own scenario matrix
would not catch.

## 0. What was read, and against what

- Artifact: `2026-10-03-insights-mission-mix-build-plan.md`, SHA256
  `5889ECDC501EDFDCA982A090790DE4CFEDB66E0AF53066C4B50B93A7FB052968` — recomputed here, matches the brief.
- Branch `claude/planning-filing-3-oct` at `22e8df38`, equal to origin after fetch; checkout clean.
  `raptor-port/src` is unchanged since the plan's baseline `34eb603f` (last source commit `4cb14a98`).
- The brief, the spec, Sol's challenge record, `HANDOFF.md`, and the FULL rows of D512–D528, D477, D478, D481,
  D482, D148, with D56.
- Source, read first-hand (paths under `raptor-port/src/`): `engine/insights.ts` (whole), `engine/slots.ts`
  `txtRef`/`txtGet`/`txtSet`, `ui/textedit.ts` (whole), `ui/board.ts` `boardChange` and the creation sites,
  `engine/restore.ts` `dayKeys` (whole), `engine/canonical.ts` (whole), `engine/rowids.ts` (whole),
  `engine/drafts.ts` `rebaseDayPending` / `reconcileIssuedMarks`, `engine/daytpl.ts` (whole), `engine/wavetpl.ts`
  (shape and mint), `state/sched-commit.ts` (the lagging baseline and record grain), `state/view.ts`
  `afterSchedMutate`, `state/store.ts` writers, `state/people-settings-commit.ts`, `engine/hooks.ts` store seam,
  `engine/rules.ts` save/load/reset, `state/perms.ts` settings ops, `undo/describe.ts`, `state/undo-wire.ts`,
  `ui/LogicPage.tsx` (whole), `ui/Modals.tsx` (whole), `ui/pops.ts`, `ui/SchedBoard.tsx` bar and ⋯ menu,
  `ui/EditWeek.tsx` repaint guard, `engine/publish.ts` signature binding, `engine/schema.ts` `Formation`,
  the demo weeks' Mission/Remarks values (`engine/data.ts`, `engine/week2.ts`).
- Not run: no gates, no app walk (plan-only; tier NONE — documents only). Not read: `publish.ts` beyond the
  signature binding, `editlog.ts`/`changelines.ts`/`pendlist.ts` bodies beyond their `ff:` handling,
  `holderbase.ts`, `weekrows.ts`. Claims below are limited to what was read.

## 1. What the plan gets right (verified in source)

- Count units (§2): the Sorties tile counts eligible aircraft, a person's count adds one per occupied seat, the
  same-person-both-seats double count stands, cancelled and standalone are skipped before any count —
  `insights.ts:36`. Sort is total-descending then callsign — `insights.ts:45`.
- One world: every figure comes from `issuedWorld()` (`insights.ts:16`), so reading the role off the same issued
  formation satisfies D478 without a second reader.
- `txtSet` collapses all whitespace and keeps punctuation (`slots.ts:318`); newlines cannot delimit. Both
  editors call it (`textedit.ts:79`, `board.ts:1195`).
- Mission is `ff:di.gi.li.msn` on the formation; Remarks is `fr:di.gi.li.ai` on the aircraft
  (`slots.ts` `txtRef`). `keyLevels('ff')` resolves any fourth component by row id (`rowids.ts`).
- A day template deep-copies waves and strips row ids and crew (`daytpl.ts` `mintBlob`), so a formation field
  travels with it and lands on new ids; it is refused on a published day (D96). A wave template carries Mission
  and times only (`wavetpl.ts`), so it can only produce derived roles. A saved plan keeps ids.
- The text edit's command captures an in-place change made before or inside it (the lagging baseline,
  `sched-commit.ts`), so "invalidation saved with the edit, answer as a later separate step" is achievable, and
  two Undo steps fall out of the day-grain records.
- A separate settings key is the right vehicle: it stays out of `RULE_SPEC`, `rulesOffCount` and
  `rulesReset` by construction (`rules.ts:142–177`).

## 2. Blocking findings

### B1 — The clause separator does not match how Remarks are written, so timing edits will re-ask

- **Failure.** Mission ACM, Remarks `DS FOR VL // BRIEF 30 PRIOR`, answered Red. The scheduler changes `30` to
  `45`. The whole string is one clause, the context changes, the answer is dropped and the question returns —
  the exact defect Sol's R1-01 raised, surviving its fix.
- **Cause.** §4.3 splits at semicolons only. The demo weeks contain **no semicolon in any Remarks**; the house
  separator is `//` (`A: SA(S)-3 // BRIEF 30 PRIOR`, `1B: ACM // TIGHT TURN OFF WAVE 1`, `2A: BFM // MED DOWN`,
  `2 X 4-SHIP // 2TK TPOD 9X` — `engine/data.ts`, `engine/week2.ts`). M06a/M06b test a format nobody types.
- **Consequence.** D525 ("crew and timing changes do not ask again") fails for ordinary remarks; the "bounded
  limitation" is the common case, not the edge.
- **Fix.** Split at `;` **and** `//` (both survive `txtSet`). Keep single `/`, commas and dashes inside a clause
  — `DS FOR VL/RU` must stay one clause. Rewrite M06a with the `//` form as the primary case and keep the
  semicolon form beside it. Still no direction inference.

### B2 — On Edit Schedule the page cannot redraw while the caret is in a text box, so the question cannot come from the builder

- **Failure.** The scheduler types `DS FOR VL` in Remarks and Tabs into the next cell (D520's own case). Built
  through the day builder plus a repaint, the question does not appear: it shows only once the caret leaves
  every text box, which may be many cells later, detached from the edit that caused it.
- **Cause.** `EditWeek.tsx:110` returns before any repaint while `editingText()` is true, and `txtCommit`
  (`textedit.ts:34–45`) skips the epilogue when focus has moved into another text field. That guard is what
  protects the caret; the plan says "preserve caret guards" and "add only transient question content" (§3, §7)
  without saying how content appears under a guard that forbids the redraw. The same applies to **Change
  mission role**, which must appear while the Remarks box holds the caret.
- **Board side.** The Board repaints freely (its fields are not contenteditable), but a panel rebuild triggered
  by *focusing* a Remarks box would replace the focused field — on a phone, that drops the keyboard.
- **Fix.** State the mechanism: on both surfaces the question and the temporary action are **inserted directly
  as a sibling node** after the formation's AREA strip (never by rebuilding the block that holds the caret), and
  the builder emits the identical markup from the same transient state so a later ordinary redraw keeps exactly
  one copy. M19 must assert the **same focused node** and caret offset before and after (not an equal-looking
  replacement), that typing continues in the next cell, and that after the next redraw the question is present
  once.

### B3 — A change that invalidates the answer without a Remarks edit leaves it silently unanswered

- **Failure.** (a) Formation with Remarks `DS FOR VL`, answered Red; the scheduler changes Mission BFM → ACM.
  D525 drops the answer, but the question is only tied to leaving Remarks, so nothing asks. (b) A new line:
  Remarks typed first and answered, Mission typed after — the answer just given is dropped. (c) Deleting the one
  aircraft whose Remarks carried a different cue clause changes the clause set and drops the answer.
- **Cause.** §7 asks "for a newly saved relevant edit" and for "existing unresolved data reached later" by
  re-entering Remarks; §5 invalidates on Mission and structural writers. Nothing joins the two, and M06 asserts
  only the invalidation.
- **Consequence.** No marker exists on the line (D519), so the only trace is that person's bar losing its split.
  The scheduler believes the role is recorded.
- **Fix.** Define the automatic question by **state transition, not by which editor fired**: when the
  scheduler's own gesture leaves exactly one eligible formation conditional-and-unresolved that was not so
  before the gesture, ask once for that formation after the gesture settles (Mission box included). M06 asserts
  the question appears after a Mission change. This is a visible behaviour — see O1.

### B4 — Returning to an unanswered Remarks box re-asks on every pass, including a plain tab-through

- **Failure.** Tracking On, six formations with unanswered roles (the normal state right after enabling, D523).
  The scheduler Tabs across the row of Remarks boxes, or taps into one to read it and out again. Each pass opens
  the question and pushes the content below it down, under the next tap target. After **Later**, the next pass
  asks again; Escape (which restores the text and blurs) asks too.
- **Cause.** §7: "focusing and leaving its relevant Remarks editor offers the same question even if text is
  unchanged", with "no persisted dismissal record".
- **Consequence.** The unnecessary prompt the brief asks about, and a breach of two standing rules: a tapped
  control must not move under the user (2 Sep 26), and focus-and-leave of an untouched cell is a no-op
  (the phantom-edit guards in `textedit.ts`).
- **Fix.** Unchanged text never opens the question by itself. While the Remarks box of a conditional,
  unanswered formation holds the caret, show the same temporary action D527 already uses, worded **Choose
  mission role**; it opens the same question. With B3, the automatic question then has one trigger (your edit
  just made it need an answer) and the manual door has one (the temporary action). M07 changes accordingly.
  Visible behaviour — see O1.

### B5 — The proposed separate canonical address either disappears from the change list or disturbs every existing sign-off

- **Failure, variant 1 (key written only when an answer exists).** A role answered on a published day changes
  the digest, so the day reads publishable, but `canonicalDiff` returns no entry: a key present on one side of
  a surviving row is skipped unless `rowKeyOf` knows its prefix, and for `ff` it returns null
  (`canonical.ts` value loop and hole loop). Result: "Publish AL" beside a count of 0 — the outcome that file
  calls the one it must never produce — and an amendment stored with an empty change list.
- **Failure, variant 2 (key always written).** Every formation gains a line in the digest. A sign-off stores the
  digest it signed and is re-checked on every read (`publish.ts` `currentBind` / `signBoundOk`), so every
  sign-off already stored reads invalid after the update. D56 excludes this as a finding (stored data only), but
  the owner would see every sign-off gone on his preview, and it is avoidable.
- **Also.** A separate address has no cell to jump to or paint, so a role-only amendment marks nothing on the
  issued day (see O2).
- **Cause.** §5 proposes "for example `ff:…missionRole`" and defers the choice to "inspect the actual key/label
  readers"; the two traps are in the diff, not the label readers.
- **Fix.** Follow the house pattern `dayKeys` already uses for row state with no cell of its own (cancel, flag,
  info "ride the composite"): carry the **effective chosen side** on the existing `ff:…msn` value, appended only
  when non-empty. The key always exists, so the diff, pending marks, reconcile and rebase all see it; no existing
  digest changes; the change is attributed to the Mission cell, which gives the jump target, the history label
  and the ordinary amendment mark for free (that mark is the standing "changed in this AL" mark, not a role
  indicator, so D519 holds). `pendlist.ts`/history wording then formats the composite as it already does for
  `ff:…cs`. Add a test that a role-only change on a published day yields exactly one diff entry and one pending
  unit, and one that an untouched signed day keeps its sign-offs across the change of code.

## 3. Useful improvements

- **I1 — Make validity derived; drop the forward-write normaliser.** The plan requires both a writer-side clear
  on every route (§5) and a reader that rejects a mismatched answer (§4). The second makes the first redundant.
  Store `{ side, context }`, never clear it on unrelated writes, and compute the effective role as "the stored
  answer applies only if its context equals today's". Then every writer, structural edit, copy, template, plan
  switch and Undo is correct with no per-route wiring, and the ~40 Board sites that end in `afterSchedMutate`
  need nothing. It also removes a real wart: on a published day, mistyping the cue and typing it back leaves the
  text equal to the issued text but the answer cleared — one pending change, sign-offs down, nothing visibly
  different. Derived, the answer simply applies again. D526's "invalidate with that edit" holds: the effective
  role changes inside that one saved edit and one Undo restores both. "Toggling On never revives a stale answer"
  holds too. If the planning chat keeps explicit clearing, it must name the one place it runs (the scheduler
  epilogue, limited to the days the command touched) and prove Undo's record write does not pass through it.
- **I2 — The context string is saved data; pin its format.** The effective role of a *published* day is
  recomputed from stored text with today's rules. A later change to tokenising or clause splitting would flip
  published answers to "not chosen" with no amendment. Add golden-vector tests for the normaliser, declare the
  field in `docs/data-schema.md` as a persisted format, and carry a small version number in the stored answer.
- **I3 — The Logic switch is on the Undo list as soon as its key is registered.** The plan left this unverified.
  Every key in `SETTINGS_KEYS` is a record of the settings store, whose `write()` serves Undo; `rules` already
  has its words and its landing page. So register the new key in **five** places together: `SETTINGS_KEYS` and a
  loader in `SETTINGS_LOADERS` (`people-settings-commit.ts`), `SETTINGS_KEYS_ALL` (`perms.ts:254`),
  `SETTING_PHRASE` (`undo/describe.ts`), and the Logic landing in `landingOf` (`undo-wire.ts`). Miss the first
  and the hook writes raw (no permission check, no Undo); miss the last two and Undo says "a settings change"
  and lands nowhere. Add an M15 step: toggle, Undo, Redo — words, landing, and the Insights presentation.
- **I4 — Give the answer command its own Undo words.** A new `sched.*` type needs `COMMAND_OPS`, `SCHED_TYPES`
  and a `describe.ts` label, or Undo reads "a change to the schedule".
- **I5 — The side-effect invalidation needs its own history line.** `txtSet` logs and marks only the text key.
  Without a second line, the change history shows the Remarks edit and not that the role went back to "not
  chosen", while the amendment still carries it — the "unmarked, unexplained change" the project guide warns of.
- **I6 — Near-miss spellings count blue silently.** `REDAIR` and `RED-AIR` are neither the exact Mission name
  nor a whole `RED` token. Treat space, hyphen and no-space forms of RED AIR as the same name and the same cue.
- **I7 — Scenario rows to add.** `//` remarks (B1); Tab into the next cell and keep typing (B2); Mission change
  after an answer, and Remarks-then-Mission on a new line (B3); tab-through and Escape on unanswered formations
  (B4); role-only change on a published day — diff entry, pending count, what the issued face marks, sign-offs
  (B5, O2); a day template saved with an answered formation, then applied; a member and a guest opening Insights
  see the same split; `npm run rulecheck` — each of D512–D527 needs a test naming it.
- **I8 — Housekeeping.** `insightsHTML` reads `PEOPLE[f.id].cs` unguarded for flyers while the hours list guards
  it; the new split touches that loop — guard it the same way rather than widen the gap.

## 4. Choices that are the owner's

- **O1 — How an unanswered role is reached later, and whether a Mission change asks** (from B3, B4).
  Recommended: ask automatically only straight after an edit of yours that made the formation need an answer
  (Remarks or Mission); otherwise show **Choose mission role** while its Remarks box is being edited. Settled
  choices are untouched: placement (D520), Later and save-first (D526), remembering (D525), the temporary
  correction action (D527).
- **O2 — What answering Blue/Red on an already-published day costs.** Settled by D478/D523/D526: it waits for
  the next amendment. Not re-opened here — stated because its cost is not in those rulings' wording: the answer
  takes the day's sign-offs down, and the amendment that carries it changes nothing a reader can see on the
  schedule lines (D519). With B5's fix the Mission box wears the ordinary amendment mark. If he would rather a
  Blue/Red answer never needed an amendment or re-signing, that is a new ruling replacing part of D478's reach
  here; the plan then keeps the answer outside the signed content.
- **O3 — A Mission box that contains DS or RED without being exactly DS / RED / RED AIR** (`DS-2`,
  `RED AIR 2`, `ACM/DS`), with nothing in Remarks. By D518's letter it counts blue with no question.
  Recommended: treat it as a cue and ask, never guess.

Pending and unchanged: the complete picture look (chart, Board opener, incomplete-bar wording, Later, correction).
Nothing here approves it.

## 5. Brief checklist — result per item

| Brief item | Result |
|---|---|
| Save shape and pure resolver | Sound. I1 (derived validity), I2 (pinned format), I6, O3. |
| Context retention | **B1.** Semicolon-only splitting misses the house separator. |
| Both Remarks adapters, later access, correction, Escape/Tab | **B2, B4.** Edit Schedule cannot redraw under the caret; unchanged-text re-asking. |
| Stable identity and recheck at answer | Sound as planned (week + day + formation id + context, rechecked live). |
| Every writer, copies, templates, plans, Undo | Feasible; **B3** for silent invalidation; I1 removes the per-writer risk. |
| Canonical pending/history/signature/AL | **B5**, I5. |
| Logic setting, permissions, reset, Undo | Sound; I3 closes the unverified Undo question from source. |
| One aggregation, totals, Show all, openers | Sound. Insights window sits above the Board (`.modal` 470 over `.schedboard` 400). |
| Rally baseline kept separate | Sound as planned. |
| FULL tier, tests, gates, walk | Tier correct. Add I7's rows. |

## 6. What happens next

The findings return to the planning chat for reconciliation and an independent reassessment (Sol's challenge
used two of its three plan rounds; this is the separate Claude read). The frozen plan is not edited by this review.
The build stays in a new chat after the plan and the look are agreed (D515). Owed afterwards and unchanged:
Claude's code and scenario read of `codex/insights-mission-mix` before `main`.

Rulings: none made in this review. D529 is next if the owner answers O1–O3.

## 7. Addendum, the same day — the owner's answers (recorded as rulings, not review findings)

He answered "1-3 as recommended", after asking what was recommended for O2 and being told "count at once".
- **O1 → D529.** As recommended: the automatic question only straight after the scheduler's own edit (Remarks or
  Mission) leaves a formation needing an answer; otherwise a temporary **Choose mission role** button while its
  Remarks box is edited. This is the product side of B3 and B4; B2's mechanism still has to be planned.
- **O2 → D530.** A Blue/Red answer counts at once, published days included, with no amendment and no effect on
  sign-offs; wording changes still wait. It narrows D478, D523 and D526 for the answer only. **Effect on this
  review:** B5 no longer applies in its first form — the answer leaves the compared and signed content — and B5's
  proposed fix (the side riding on the Mission value) is withdrawn with it; I1 (derived validity) stands and fits
  this shape. What the revised plan must now settle instead:
  where the answer lives (a record beside the week, keyed by the formation's row id and its context, is the
  natural shape — the published copy is frozen and must not be written); that Insights reads, for each published
  formation, the answer whose context matches the PUBLISHED wording, and Edit Schedule's button offers the answer
  for the WORKING wording, so the two can differ while a wording change waits; how the answer travels with a day
  template, a saved plan and a loaded older version; its own command, Undo words and change-history line; and
  that a day's sign-offs and pending count are untouched by it (a test each). I2 (the context string as a pinned
  saved format) matters more under this shape, not less.
- **O3 → D531.** A Mission box containing DS or RED that is not exactly DS / RED / RED AIR asks; never a guess.
  I6 (spellings of RED AIR) stays the planner's technical call.

The frozen plan predates D529–D531 and must be revised, then read independently again, before the build.

