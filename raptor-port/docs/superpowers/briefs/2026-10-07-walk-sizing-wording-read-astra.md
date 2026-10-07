# Astra's read of the walk-sizing wording (version 1 of the draft) - 7 Oct 26 - verbatim

The brief: `2026-10-07-walk-sizing-wording-read-brief.md`. Run read-only through the Codex tool (model gpt-6-astra, high effort), alone. Its text is as returned, except that links written with this PC's full folder path were shortened to relative ones. What was done with each finding: the foot of `raptor-port/docs/superpowers/specs/2026-10-07-walk-sizing-guide-wording.md`.

---

CHANGES REQUIRED

1. **A named test can replace a route that still needs to be operated on screen.**

   **Where:** [Wording draft](../../../../raptor-port/docs/superpowers/specs/2026-10-07-walk-sizing-guide-wording.md), edits 3, 7, 8 and 11.

   Proposed §7.0 permits “an order or a route” to be left to a named test, without limiting what that test must prove.

   **Concrete case:** a calculation change affects an existing OIL switch after publication. The agent looks at every surface, operates the switch before publication, and assigns the reverse order to a calculation test. That test changes the value directly. It passes even if the published screen has no working switch—the same missing-door failure the guide records.

   Seeing every roll-call row does not prove its controls work. D607 sizes the walk; it does not itself approve replacing required screen operation with a test of the underlying calculation.

   **Replace the test-substitution paragraph with:**

   > A named test may carry repeated calculation cases where the sizing step explains why their screen route and behaviour are identical to a route already walked. It cannot replace seeing and operating a distinct surface, door, role, gesture or meaningful order whose screen behaviour differs. Name the test, the claim it proves and its result. A test that changes state directly does not prove that the screen offers a working route.

   Apply that boundary to edits 3, 8 and 11. Add to §9:

   > The `Walk:` line counts only surfaces and orders actually walked. Test-only results are listed separately.

2. **The eleven edits leave instructions that demand the larger walk, and introduce conflicting instructions about screen sizes.**

   **Where:** [Checking guide](../../../../raptor-port/docs/bug-check-order.md), §§0, 2a, 3, 7.2, 7.4 and 9; `guide-full.md`, “The bug-check standing order”, “Sweep the rules…” and “The rules-engine robustness doctrine”; corresponding short lines in `raptor-port/CLAUDE.md`.

   **Concrete case:** Opus assigns repeated calculation cases to tests and chooses a short walk. Another agent follows §0’s “every order it can be used”, §7.4’s unchanged “Walk every order”, or the project guide’s instruction to hand-test every applicable ruling. It repeats the full matrix.

   In the opposite direction, proposed §7.0 lets Opus choose “which sizes”, while §7.2 and §12 still require both widths, plus short-screen checks where applicable.

   **Use these replacements:**

   - §0:
     > A build is checked through the coverage required by its tier and the written sizing decision in §7.0. Every required surface is seen and operated; the evidence distinguishes walked orders from permitted test-only cases.
   - Replace §3’s walk description and §7.4’s opening, rather than appending an exception to contradictory text:
     > Drive the surfaces, doors and distinct orders required by the sizing decision, within §7.0’s limits. Record every required order’s result and how it was checked.
   - Replace “which sizes” in proposed §7.0:
     > which additional sizes are needed; the required phone, desktop and applicable short-screen checks remain.
   - §9, owner’s check 4:
     > Does every required order, including both directions across publication, have a result, with walked and permitted test-only cases clearly distinguished?
   - In the project guide’s rules-sweep and robustness passages:
     > Keep every applicable ruling and all five gotcha families in the coverage list. Use the checking order’s sizing step to assign the checks; do not start a second walk of the same coverage.

   Add the same sizing pointer to §2a and `guide-full.md`’s standing-order summary. I found no additional current fixed walker count in the executor or handoff guide; the temporary Codex arrangement does not create one.

3. **The new fan-out explanation weakens D16, while the floor unnecessarily requires a host-run walk.**

   **Where:** draft edits 4 and 7; parked point 2.

   Edit 4 says the paragraph merely explains “how a walk of several is run”. D16 also decides something: **a long walk must be fanned out**.

   **Concrete case:** Opus chooses 200 scenarios but assigns the whole long pass to the host. The proposed explanation permits that; D16 does not.

   Conversely, a complete helper walk with pictures inspected by the host still fails the literal floor requiring “the host’s own scripted run”. That adds a second run even when the helper found nothing. D588 requires the host to check the evidence and reproduce findings, not repeat every successful walk.

   **Replace edit 4’s added sentence with:**

   > Opus sizes the coverage for this change (§7.0). A short walk may be run by the host or one helper; if the chosen pass is long, D16 requires parallel helpers as described below.

   **Replace the floor’s first sentence, and revise the parked recommendation to match:**

   > A WALK or FULL change cannot have no walk. The host or the assigned helpers must drive the required real controls on the exact build and open the pictures. The host checks helper evidence and reproduces every finding (§4, D588).

   I support retaining a real-walk floor; the host-only requirement is the part I recommend changing.

4. **Any fault automatically expands the walk, even when it does not challenge the sizing decision.**

   **Where:** draft edit 7, “The size is reconsidered”.

   **Concrete case:** a short calculation walk encounters the already-existing clipped Tracker name recorded in the ledger. The wording says a real fault means the change was misclassified and orders a wider walk. An unrelated defect becomes a compulsory broader sweep.

   That conclusion does not follow from the finding, and D607 asks for judgment per change.

   **Replace with:**

   > A real fault or MISSING row triggers a review of the sizing assumptions. Widen the walk where the finding shows an untested surface, route or shared cause relevant to this change. Otherwise record its disposition and why the existing scope remains sufficient. An unrelated older fault does not automatically enlarge the walk.

5. **The ledger’s type descriptions and closing recommendation can become the fixed sizing table D607 expressly did not approve.**

   **Where:** [Walk ledger](../../../../raptor-port/docs/walk-ledger.md), types A, E and R; “For him, in one paragraph”.

   **Concrete cases:**

   - A says “every screen reads the one answer”. The Insights row itself records a missed roster reader; one shared calculation does not establish that every consumer is connected correctly.
   - E says “every screen” for a stylesheet change. A local credit-label fix would therefore trigger an unrelated whole-app tour.
   - R says “the area has never been driven”, although its definition includes diagnosis of a reported fault. The 4 October workflow investigation followed earlier walks.
   - “At most one walker” supplies precisely the type-based ceiling D607’s reading (4) leaves unruled.

   **Replace those cells with:**

   > **A:** Input routes, consumers and displayed results may still disagree or be unwired. Establish which share the calculation and which need separate screen proof before sizing the walk.

   > **E:** The affected surfaces at phone, desktop and applicable short-screen sizes, with pictures opened. Shared styling can make the affected set the whole app.

   > **R:** For a previously unwalked area, establish broad surface coverage. For diagnosis, follow the reported failure and plausible shared causes; previous coverage informs the scope.

   **Replace the closing sizing recommendation with:**

   > These records can support a smaller walk for some calculation changes, but set no walker ceiling. Opus chooses the coverage and staffing for each change from its routes, consumers, risks and relevant past evidence.

6. **The cost paragraph mixes two populations and gives the wrong measured range.**

   **Where:** ledger, “What a walk costs”.

   The three ordinary measured jobs contain **seven walkers and about 3.47 million tokens**. Nine walkers and about **4.54 million** includes the separate five-October trial. Therefore “all the measured walks were of type A” is wrong for the nine-walker total.

   The Sonnet range also excludes the recorded **613,000-token** Insights walker.

   **Concrete consequence:** a future sizing decision treats a planted-defect comparison as ordinary calculation-walk cost evidence and understates the observed upper cost.

   **Replace with:**

   > Seven walkers on the three ordinary measured jobs used about 3.47 million tokens. The separate five-October trial adds two walkers and about 1.07 million, making nine walkers and about 4.54 million including that trial. Measured Sonnet walkers range from about 360,000 to 613,000 tokens; measured Opus walkers from about 620,000 to 627,000. These measurements do not establish costs for the other change types or for host-only walks.

7. **The ledger’s conclusions claim more than the rows establish.**

   **Where:** ledger, “What the rows say”, “What a walk missed” and “For him, in one paragraph”.

   “No walk found a fault in a rule’s arithmetic” and “it has not been where wrong arithmetic was found” conflict with the Insights walk’s negative work-hours finding. Its evidence sheet explicitly identifies the shared work-span calculation and says new data can reproduce it.

   “Paid for itself whenever” also exceeds the evidence: new-control walks found faults in only eight of fifteen rows, new-screen walks in four of five, and comparative costs are mostly absent.

   **Concrete consequence:** an agent discounts arithmetic checks in the running app or treats broad walks as proven cost-effective solely because of the assigned type.

   **Replace those conclusions with:**

   > Among the nine leading-type-A rows, two counted findings concern the changed warning’s output; twelve are recorded as older faults. The older findings include negative work hours, so walks have found calculation faults too. These records do not show how often a different-sized walk would have caught them.

   > Several surface-heavy jobs produced findings, but the rows do not establish that every walk paid for itself. Most lack cost measurements, and the largest jobs received the most walkers.

   Also qualify the aggregate fault totals:

   > Fault totals reproduce the sheets’ reported counts rather than a fully reconciled count of distinct application defects. In particular, the first row’s 27 includes an unresolved mixture of wording and other findings.

   Without that qualification, the precise “61 faults” and “225 faults” totals conceal uncertainty the ledger itself acknowledges.

8. **The draft treats a document tripwire as a line target.**

   **Where:** draft edit 1 and “What is deliberately NOT proposed”.

   “Two lines over its size marker, so … no line is added” and “gains no line” make staying within an existing line count a design constraint.

   **Concrete case:** the necessary boundary between a test-only calculation check and operating a screen route needs another sentence in the always-loaded reminder. The draft’s constraint encourages leaving it out or compressing it to preserve the count. D141 expressly rejects that trade.

   **Replace both statements with:**

   > Keep the reminder brief and point to the full sizing rule. Its size marker is a tripwire, not a target; retain necessary conditions and raise the marker with a reason if that material belongs here.

**Checks of the figures and source rows:** I checked the A count—nine walks, five finding faults, fourteen counted findings—and the H count—two walks, five findings—against their rows. Those arithmetic totals agree. The cost calculation fails as described in finding 6. I also summed D’s reported counts to 61; its classification uncertainty remains as described in finding 7.

I checked the Insights row against its complete evidence sheet: the nineteen scenarios, negative-hours finding, pictures and two token figures agree. I checked the original OIL work-start row against its walk table and dispositions: four walkers, 47 scenarios, 120 pairs, 1,917 saved pictures, one wording fix and eight other dispositions agree. Those sampled OIL sections do not substantiate the per-walker token figures.

**D138 check:** D607’s short line preserves the operative ruling in its full row. I found no added condition or lost condition in that sentence. The full row separately labels its five implementation readings as awaiting the owner’s answer; those must retain that status.

**Reading coverage:** Read whole: the brief, wording draft, checking order, walk ledger, required general rule files, project guide, executor rule, session-handoff guide and Codex review workflow; all requested full ruling rows; the Insights evidence sheet. Read the supplied repository instructions and current handoff context. Sampled: relevant `guide-full.md` passages, backlog entries, ruling/archive searches and the OIL evidence sections named above.

I did not open either reader’s report for this wording review, the ledger helpers’ reports, the remaining evidence sheets or walk pictures. I ran no application checks and changed no file.

Rulings: none this session.