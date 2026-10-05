**Astra — REVISE: five findings.** Read-only review of all five commits, their tests and surrounding production paths, compared with the pre-round tree. These are code-traced failures, not browser reproductions. No files changed; no builds or tests run.

**1. Findings, most serious first**

**F1 — W4: an untimed flight can still inflate someone’s work hours.**

- **Steps:** On an unpublished day, give one person a Ground commitment from 13:00–14:00 and no other work. Add that person to a flying line with both take-off and landing blank. Give its wave `08:00 IN TIME`. Open Insights → Work hours.
- **Expected:** The unfinished flight contributes no span; the day remains one hour. That is W4’s stated contract, also expressed by its new test that “a reporting clock alone is no span.”
- **Code result:** The day becomes six hours. [validate.ts:167](/C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:167) accepts valid starts and ends independently: it takes 08:00 from the unfinished flight and 14:00 from Ground. The event builder still emits the unfinished flight with its valid reporting time and invalid landing.
- **Provenance:** **W4 partly unfixed.** The round removes NaN poisoning but can replace it with a plausible, incorrect total.
- **Fix:** (1) Calculate both endpoints for each event. (2) Exclude that event from both comparisons unless both endpoints are finite. Preserve valid negative, overnight and equal times. (3) Add mixed unfinished-flight/complete-Ground cases in both event orders; check Insights and the long-day warning. The current isolated-event assertion misses this combination.

**F2 — W12: confirmation windows take focus initially, but keyboard input can escape behind them.**

- **Steps:** Create a weekend Duty input and save until the OIL question opens. Press Shift+Tab repeatedly until the underlying input’s Remarks box receives focus, then type. The question remains open while the hidden form changes. Forward Tab can also leave the question after its last enabled control.
- **Expected:** W12 requires the confirmation window to hold the keyboard while its answer is pending.
- **Cause:** [sheetfocus.ts:12](/C:/Users/User/projects/Raptor/raptor-port/src/ui/sheetfocus.ts:12) moves focus once; it neither contains subsequent Tab movement nor makes the background inert. The underlying editor remains enabled at [inputedit.tsx:1729](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1729). Declining the schedule’s custom Tab route merely restores native browser traversal.
- **Additional missing doors:** [pops.ts:143](/C:/Users/User/projects/Raptor/raptor-port/src/ui/pops.ts:143) omits the Board’s cancellation and Sort all dialogs. Open Sort all, then keyboard-navigate back into Board fields: its state does not suspend the schedule route. Sort all also does not take focus on opening.
- **Provenance:** **W12 partly unfixed**, rather than a newly introduced escape.
- **Fix:** (1) Contain Tab and Shift+Tab within the topmost blocking sheet, including when focus starts on its container. (2) Prevent background controls from receiving keyboard input. (3) Include cancellation and Sort all in blocking-window handling, keeping the intentionally nonblocking Changes and Availability windows excluded. (4) Test native forward/reverse traversal, stacked confirmations, closing and restoration—not only initial focus and a synthetic Tab event.

**F3 — W11: a legitimate spacing no-op now silently prevents a Blue/Red answer.**

- **Steps:** Turn mission tracking on. Through the Flying-waves template editor, create a template whose Mission is `ACM /  DS`—two spaces before DS—and add it to a day. Select Remarks → Choose mission role. With the question open, select that formation’s Mission box without changing it, then click Red.
- **Expected:** D530 requires the answer to save and count immediately; D103/W11 requires unchanged wording to leave pending changes and signatures alone.
- **Code result:** The question disappears without saving Red. Templates legitimately retain doubled spaces. [slots.ts:345](/C:/Users/User/projects/Raptor/raptor-port/src/engine/slots.ts:345) now correctly refuses a spacing-only write, but [mission-role-offer.ts:97](/C:/Users/User/projects/Raptor/raptor-port/src/ui/mission-role-offer.ts:97) compares stored text against folded text literally, dispatches a save, then repeats that literal comparison. It concludes the save failed and clears the question.
- **Provenance:** **Introduced by W11; breaks an answer path that previously worked**, albeit with an unwanted spacing edit.
- **Fix:** (1) Use the same whitespace/placeholder equivalence in the answer’s pre-save and post-save checks. (2) Retain refusal when substantive visible wording really failed to save. (3) Test this through a newly created template on week and Board, including a published working day: answer recorded, no text-history entry, no pending amendment and no signature change.

**F4 — W9: moving between two aircraft’s Remarks removes the active formation’s button.**

- **Steps:** Have two conditional formations, A and B, with two aircraft in B. Leave A’s Blue/Red question open. Select B’s first aircraft Remarks: its Choose/Change button appears. Without editing, select B’s second aircraft Remarks.
- **Expected:** D527/D529 requires the temporary button while relevant Remarks is being edited; A’s question may remain under D535.
- **Code result:** B’s button disappears. [mission-role-offer.ts:111](/C:/Users/User/projects/Raptor/raptor-port/src/ui/mission-role-offer.ts:111) reuses an existing button solely because the formation’s answer identity matches, leaving its remembered field pointing at aircraft one. The deferred blur cleanup at line 203 sees aircraft two active and removes it.
- **Provenance:** **W9 partly unfixed.** The same-identity shortcut predates the round and survives its two-slot rewrite.
- **Fix:** (1) Rebind or rebuild the offered button whenever the active Remarks element changes, even within one formation. (2) Update the remembered caret and click-handler field together; updating the stored field alone leaves captured handlers stale. (3) Cover both aircraft directions, with another question open, and keyboard Choose/answer/Later returning to the correct box.

**F5 — W19: malformed reporting clocks still receive no warning before take-off is entered.**

- **Steps:** Add a normal flying wave, leaving its formation’s take-off blank. Add an In-time / Rally line and enter `8h00 IN TIME` or `0800IN TIME`. Leave the box and inspect its feedback and the warning list.
- **Expected:** W19 promises “no recognised clock” for these spellings. This is an advisory; it should not require a take-off or block publication.
- **Code result:** No advisory appears. [reporting.ts:96](/C:/Users/User/projects/Raptor/raptor-port/src/engine/reporting.ts:96) returns for a missing take-off before reaching the unresolved-clock messages at line 108. The parser identifies the malformed spelling correctly; its consumer discards the finding.
- **Provenance:** **W19 partly unfixed**, through an existing early return. This also leaves W5’s no-take-off entry route uncovered.
- **Fix:** (1) Evaluate applicable malformed reporting lines independently of take-off. (2) Gate only chronological comparisons on a usable take-off. (3) Test new waves before and after adding/removing take-off, through both renderers; preserve quiet handling of genuinely clockless notes.

**2. Explicit negatives**

- **Host question 1 — W15/W16:** No permanent held-block or chunk-cache failure found. Held content remains marked for catch-up; focus departure requests another paint. Week/preview/navigation guards prevent the new partial path from replacing the active editing block. Header-clock refresh changes its text separately. Actual caret position and glide geometry remain browser checks.
- **Host question 2 — W8:** No newly created-data identity collision found across the two authored weeks, reloads, partially saved weeks, two-tab identity, templates, saved plans, amendment references or Undo across week changes. Templates remint identities; saved alternative versions retain them intentionally. Repeatable IDs do not themselves provide cross-tab synchronization.
- **Host question 3 — W11:** The shared writer’s spacing equivalence is sound for the inspected text fields, and time validation remains separate. The failure is its answer-saving caller, F3; no necessary spacing-only schedule write was identified.
- **Host question 4 — W9:** Apart from F3/F4, no path found to two simultaneous questions or an answer written to a different formation. Answer-time target checks and navigation/Undo invalidation remain present.
- **Host question 5 — W12:** No permanently stuck true flag found in the inspected close/reset paths. Blocking-window coverage and continued keyboard containment are incomplete as described in F2. Excluding the modeless Changes and Availability windows is intentional.
- **Host question 6 — W3/W19:** Clocked “RALLY AFTER IN TIME” now contributes its rally time without becoming another in-time; clockless immediate rally retains its dependency. `FL240`, `2 SHIPS` and `2.5 HRS` remain quiet. No additional realistic false-positive clock spelling established.
- **W2:** The reporting-button wording is excluded from the modified-rules indicator while remaining saved and resettable.
- **W5/W6:** A valid reporting clock without take-off uses the intended day interpretation; the inspected labels, history, pending descriptions, toasts and Undo share “In-time / Rally.”
- **W7/W10:** Formation grouping retains a readable fallback after deletion; all four named confirmation surfaces use the drag-out dismissal guard.
- **W13/W18:** The phone Desktop-layout save band and menu alignment changes match their intended scope. Browser tests cover relevant positions; I read them but did not execute them.
- No demonstrated alteration of earned-leave balances or frozen published records was found in these five commits. F1 concerns work-hour aggregation; it is not evidence of an OIL-credit error.

**3. What I did not read, and why**

I did not read the other fix-round reviewer reports or `stk2-*` walker material, preserving independence. I did not audit unrelated application areas or stored-data migration scenarios; the brief excludes historical-data-only harm. I did not inspect the running app, execute tests or build, so native keyboard and visual observations remain unverified.

**4. Confidence**

Moderate confidence in the inspected paths, insufficient for a clean approval; browser reproduction of these sequences and contrary evidence about saved answers, published-day catch-up or work-hour totals would change the assessment.

Rulings: none this session.

