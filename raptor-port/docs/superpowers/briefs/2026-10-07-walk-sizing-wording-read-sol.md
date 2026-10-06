# Sol 6.1's read of the walk-sizing wording (version 1 of the draft) - 7 Oct 26 - verbatim

The brief: `2026-10-07-walk-sizing-wording-read-brief.md`. Run read-only through the Codex tool (model gpt-6.1-sol, high effort), alone. What was done with each finding: the foot of `raptor-port/docs/superpowers/specs/2026-10-07-walk-sizing-guide-wording.md`.

---

**CHANGES REQUIRED**

1. **A named test can replace the very route the walk exists to check.**  
   Where: draft edits 3, 7, 8 and 11, especially “An order or a route the sizing leaves out … with the test that carries it.”

   Concrete case: an agent walks an earning switch before publication, then assigns its after-publication route to a unit test that changes the stored decision directly. Every screen can be seen and operated once, and the named test can pass, while the published screen has no working switch. This repeats the missing-door failure described in the guide’s §1.

   Naming a test does not establish what it proves. Replace the third bullet of proposed §7.0 with:

   > **What is left to a test is named and its reach is checked.** For each omitted order or route, name the test, the exact claim it proves, and whether it uses the app’s real controls or calls the underlying calculation or writer. A test below the screen cannot carry a claim that a visible door exists, can be reached, works in that state, or shows the right result. Those claims remain in the running-app walk. Shared calculation results may be carried by tests without repeating every combination through every screen. An uncovered claim is a gap, not a saving.

   Apply that qualification to edits 3, 8 and 11.

2. **“Which sizes” makes existing required sizes optional.**  
   Where: edit 7, proposed §7.0, “how many scenarios; which sizes”; unchanged §7.2 and §12; edit 5’s WALK row.

   Concrete case: a rule change gets a desktop-only host run because its arithmetic is shared. The agent treats “which sizes” as permission to omit the phone. That satisfies one proposed sentence but contradicts the WALK row’s “both widths,” §7.2’s phone and desktop requirement, and §12’s corresponding checkbox. A viewport-tall panel can similarly lose its required short-screen check.

   Replace “how many scenarios; which sizes” with:

   > how many scenarios; which additional sizes are useful beyond the required phone and desktop widths and §7.2’s applicable short-screen checks

   This preserves the draft’s promise that sizing changes no other requirement.

3. **Several unchanged instructions still demand the unsized walk.**  
   Where: edits 3 and 8 append qualifications but retain their original commands; additional omissions in `bug-check-order.md` and `guide-full.md`.

   Concrete case: Opus assigns repeated calculation combinations to suitable tests. The next agent reads §0’s “in every order it can be used,” §3’s “every line of the order list,” §7.3’s one mark per entitlement order, or the still-bold “Walk every order” in §7.4, and runs the entire matrix anyway. The full guide also still requires hand-testing every applicable ruling and walking “both orders of every gesture.”

   Replace the conflicting instructions, rather than appending exceptions:

   - **§0:**  
     > A build is not checked until the real app has been driven across every required surface, with the controls and states selected under §7.0, and every required claim has recorded proof from that walk or an eligible named test. The pictures and table show which proof was used.
   - **§3, walk description:**  
     > An agent drives the real production build through the surfaces, controls, states and orders selected under §7.0, using the required sizes and taking pictures.
   - **§7.3, entitlement sentence:**  
     > A ruling about earned entitlement gets one recorded result per required order, identifying the walk or eligible named test that proved it.
   - **§7.4 heading and opening:**  
     > **Account for every required order.** List each action from each relevant state, both orders of meaningful action pairs, the publish boundary, and applicable undo, redo and reload steps. Record which are driven and which are carried by eligible named tests under §7.0.
   - **`guide-full.md`, “Sweep the rules, then hand-test against them,” step 3:**  
     > Check the build against every applicable ruling under the bug-check order. Record the running-app observation or eligible named test that proves each requirement. Size the walk under §7.0; tests do not replace its required screen and control checks.
   - **`guide-full.md`, “The bug-check standing order”:** replace “both orders of every gesture” with:  
     > the controls and action orders selected under §7.0, with every required order accounted for

   The §9 `Walk:` line can remain, provided its surface and order counts describe what was actually walked. The sheet should list test-carried orders separately.

   I found no current fixed walker count imposed by the executor or handoff guide. The expired Codex arrangement is explicitly dated; it is not authority for a new fixed-size walk. The engine guide’s five gotcha families remain required coverage, not a required number of walkers.

4. **The draft adds automatic decisions that D607 did not make.**  
   Where: edit 7’s “A real fault found by a small walk … means the change is not the type it was taken for”; the ledger’s closing recommendation “at most one walker.”

   Concrete case: a short walk finds an incorrect boundary in the one calculation being changed. It is still a calculation change. The proposed sentence nevertheless declares the classification wrong and requires widening the walk. Conversely, “at most one walker” becomes a ceiling even when that calculation has several distinct consumer routes.

   D607 expressly leaves the decision to Opus for each change. Replace the widening bullet with:

   > **Reconsider the size when evidence changes.** A real fault or a MISSING prompts Opus to reconsider the remaining coverage and record its decision. Widen where the finding exposes another surface, state or route that lacks proof; do not assume that every finding changes the type or requires more walkers.

   Replace the ledger’s final recommendation with:

   > For a change confined to one shared calculation, this record supports considering a short host run or a small delegated walk. It sets no walker ceiling. For screens, controls, separately drawn results and roles, identify the distinct places and states that need runtime proof. Opus decides the coverage for the actual change; the type supplies questions, not a prescribed walk.

   I do not object to the parked minimum-walk recommendation. The findings concern additional automatic rules outside those parked choices.

5. **The type descriptions can send an agent in the wrong direction.**  
   Where: `walk-ledger.md`, “The types of change,” rows A, E and R.

   Concrete cases:

   - **A:** “every screen reads the one answer” assumes the wiring is correct. The recorded crew-rest and Rally walks found consumer and display faults alongside shared-calculation changes.
   - **E:** “a stylesheet change” excludes the accepted flight-wing change, which the ledger itself classifies E. “Every screen” also turns a local layout repair into an automatic whole-app pass.
   - **R:** “everything: the area has never been driven” does not describe the 4 October diagnostic walk. That was an investigation of reported faults on screens already encountered in earlier walks.

   Use these replacement cells:

   > **A — Where a walk has something to find:** whether the changed calculation reaches each distinct consumer, updates after the relevant edits and reloads, and is shown correctly. Shared arithmetic may reduce repeated combinations; it does not prove the consumers are wired.

   > **E — What it is:** Layout or appearance, including styles, markup and drawing geometry.  
   > **E — Where a walk has something to find:** affected surfaces and overlays at their required sizes, with the pictures opened; include other screens where the changed drawing or layout is shared.

   > **R — Where a walk has something to find:** for an area never checked, its unproved surfaces and flows; for diagnosis, the reported route and plausible related routes. State which case applies and use the previous evidence; do not assume the whole area was never driven.

6. **The cost summary mixes ordinary walks with the planted-fault trial.**  
   Where: `walk-ledger.md`, “The figures,” “What a walk costs.”

   Concrete consequence: the next sizing decision uses “nine walkers, 4.5 million” as ordinary type-A evidence, although the listed ordinary walks contain seven walkers and about 3.47 million tokens. The extra two walkers and about 1.073 million belong to the separately excluded trial. The claimed Sonnet range also excludes the recorded 613,000-token walker.

   Replace the cost paragraph with:

   > Seven walkers on the three ordinary measured walks used about 3.47 million tokens: 1.878 million for OIL Work Start, 0.360 million for D606, and 1.233 million for Insights Which Copy. Their leading type is A. Recorded Sonnet costs range from about 360,000 to 613,000 tokens; the ordinary Opus walker cost about 620,000. Separately, the planted-fault trial used two walkers and about 1.073 million tokens, bringing all nine measured walkers to about 4.54 million. Keep the trial separate when judging ordinary walk yield. These selected measurements do not establish a standard cost per walker.

   Also replace the draft’s claim that hours were recorded “for none” with:

   > Comparable whole-check duration figures are unavailable. The Insights comparison records individual walker durations of 76 and 64 minutes; these do not establish replacement tier estimates.

7. **The figures claim cleaner fault counts—and stronger conclusions—than the rows establish.**  
   Where: `walk-ledger.md`, summary table and closing paragraphs.

   Concrete cases: the compilation note says the first row’s 27 findings include wording items that were not separated. Another row reports “at least 6.” The summary nevertheless presents exactly 225 real faults. It also says a walk “has not been where wrong arithmetic was found,” although the Insights row records the negative Work-hours calculation found by its Opus walker.

   Replace the total claim with:

   > The rows sum to 225 reported findings using their recorded counts and counting only the stack walkers’ five independent finds. This is not an exact count of distinct real faults: some source counts include unseparated wording findings, some are lower bounds, and findings may recur across walks.

   Replace the arithmetic conclusion with:

   > None of the nine leading-type-A rows attributes a newly discovered fault to the changed calculation’s arithmetic. Those walks did find older calculation and screen faults, including negative Work hours. This record does not establish that walks cannot find arithmetic faults.

   Replace “A walk has paid for itself whenever…” with:

   > Walks frequently found faults on changes drawn in several places, new screens, controls and roles. The recorded hit rates differ by type, and these figures measure reported discovery, not whether each walk paid for itself.

I read whole: the brief, draft, checking order, always-loaded rule files, general rulings, project guide, ledger, executor, Codex workflow and handoff guide. I read the full rows of D607, D5, D7, D9, D16, D588, D56, D138, D141 and D596, plus D70, D489 and D25.

I sampled the full guide’s relevant headings and the backlog. I checked all ledger rows arithmetically: **64 non-trial rows**, **43 rows reporting a positive fault count**, and the **D group’s 10 walks / 61 recorded findings** agree with the table’s counting method. Those matches do not resolve finding 7.

I checked two ledger rows against their evidence sheets: Insights Which Copy and OIL Work Start. The recorded walkers, pictures and walk findings match the sampled walk sections; the Insights cost table exposes the cost-summary error above.

D607’s short line preserves its full row’s stated rule. Its five expressly unconfirmed readings remain interpretations, not additional owner rulings.

I did not open another reader’s report, the ledger extraction reports, application source or pictures. I ran no app walk or gates and changed no file.

Rulings: none this session.

