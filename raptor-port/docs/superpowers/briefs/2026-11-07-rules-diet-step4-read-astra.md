# The rules diet, step 4 part 1 — Astra's blind read (8 Nov 26)

Astra's report (`codex exec -m gpt-6-astra`, read-only, reasoning high) on the brief `2026-11-07-rules-diet-step4-read-brief.md`,
branch `claude/rules-diet-step-4-7b92cb` at 4b852ea42 — saved whole, as it came back (D1739). Kept out of the working
folder until the fresh Opus reader had finished, so each stayed blind to the other (`2026-11-07-rules-diet-step4-read-opus.md`).
What was done with each finding: the plan's step-4 section.

---

Found **eight remaining gaps in meaning**. All locations below are in `.claude/rules/decisions/how-we-work.md`.

1. **High — the single-reader exception is widened to plans and working guides.**  
   **Rulings:** D353, D70, D590, D790, D1734.  
   **Lines:** “An important plan’s red team…” and “A working-guide change is read…”.  
   D790 expressly limits its exception to finished code and says a plan’s read stays unchanged. D70’s single-Opus exceptions concern named reviews and design lessons, not every guide change. The page instead permits important plans and ordinary guide changes to proceed with Opus alone whenever the ChatGPT readers are not called.  
   **Fix:** Separate finished-code reads from plan and guide reads, preserving their two-reader requirement and only the expressly authorised exceptions.

2. **High — the forbidden non-admin scheduler scenario disappears.**  
   **Ruling:** D785.  
   **Line:** “A scheduler is always an admin”.  
   The full row also forbids building or testing a non-admin scheduler and says a reviewer’s finding based on that scenario is not a finding. The shortened statement can instead be read as an invariant to attack by constructing exactly that forbidden scenario. The account calls this exclusion “implied”; it is an explicit instruction.  
   **Fix:** Restore that no build, test, walk or reviewer’s brief creates a non-admin scheduler scenario, while ordinary member and guest permission checks remain in scope.

3. **Medium — the rules engine’s exemption from strict checking is missing.**  
   **Ruling:** D1537.  
   **Line:** “Strict checking of every value’s kind…”.  
   The full row requires the engine to remain word for word, with its strict checks switched off and the original app’s 728 tests protecting it. The page preserves only “word for word”. An agent could enable strict checking over the engine without editing its bodies, then encounter failures the ruling deliberately excludes. The account incorrectly labels this exception “detail”.  
   **Fix:** State explicitly that the engine remains excluded from strict checking and remains protected by the original 728 tests.

4. **Medium — the drawing check loses its measurable requirements.**  
   **Rulings:** D1494, D1495.  
   **Line:** “the drawing check is a standing step…”.  
   D1494 defines a script that measures position, size, colour and text alignment at iPhone and desktop sizes, reporting differences over about 2px with marked pictures side by side. The page retains a required “drawing check” without saying what it must measure or cover. This permits a materially narrower check. The account marks those requirements as disposable detail.  
   **Fix:** Restore the scripted measurement, both screen sizes, the measured properties and the approximate 2px reporting threshold beside the existing pass condition.

5. **Medium — the compaction guard’s exceptions and stopping limit are missing.**  
   **Rulings:** D884, D1671.  
   **Lines:** “a guard that holds the app’s compaction until the state is saved” and “Idle compaction stays on”.  
   D884 requires the guard to let idle compaction through, at its unchanged defaults. D1671 requires it never to hold beyond 102% of the configured window—about 408,000 tokens now—and never beyond 900,000. Neither limit appears. Keeping idle compaction switched on does not itself ensure the guard permits it.  
   **Fix:** Restore the idle-compaction bypass and defaults, and the guard’s maximum hold limits.

6. **Medium — the test account’s restrictions are omitted.**  
   **Ruling:** D1749, including its recorded reading.  
   **Line:** “At the database step the app and its tables go first…”.  
   The full row says the test account must match IT’s restrictions: no plug-ins, no outside connectors and the same roles; only made-up demo data goes there. It also records the matching arrangement as a question put to IT. The page retains the testing sequence but none of those conditions, allowing a successful test in an environment that does not represent the intended deployment.  
   **Fix:** Add the matching restrictions and demo-data-only condition, preserving the recorded status of IT confirmation.

7. **Medium — the automatic code check loses its pass/fail distinction.**  
   **Ruling:** D1539.  
   **Line:** “it runs on every pull request and at each session’s end”.  
   The full row requires the pull-request check to fail on a new finding; the session check reports the count without stopping the session or blocking a commit. The page merely requires a run. A report-only pull-request check, or a blocking session check, would satisfy that wording while changing the approved behaviour.  
   **Fix:** State that new findings fail the pull-request check, while the session check only reports its count.

8. **Medium — two standing compaction duties disappear.**  
   **Ruling:** D868.  
   **Lines:** “Before a compaction the state is in the repo…” and “the saved note handed back after”.  
   The full row also requires the agent to **re-read** the saved state after compaction and give the context percentage in reports. Receiving a saved note is not the same as reading it, and neither duty is stated in the page or the five always-loaded files.  
   **Fix:** Add the required re-read after compaction and the context percentage in reports.

I compared **all 216 old rulings** with the page and five files, and checked **96 distinct rulings against their full rows**, including every old “changed by” entry, D1732–D1744, all eleven proposed archivals, and D1745, D1749 and D1750.

I confirm archiving **D86, D602, D832, D972, D973, D974, D1556, D1566, D1659, D1736 and D775**. D1736 expressly expires when steps 1 and 2 land; both landed. **Keeping D136 live is correct:** D1735 narrows it rather than replacing it.

The old framing, D25 reminder and screen-design pointer remain available. The requested recording pointers recognise the page shape. I found no separate meaning change caused by the added citations or the three removed “replacing” notes.

No files changed; nothing committed or pushed. Neither other reader’s report was opened.

Rulings: none this session.