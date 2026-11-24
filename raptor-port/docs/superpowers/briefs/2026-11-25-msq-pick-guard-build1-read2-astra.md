# [MSQ-PICK-GUARD] Build 1's plan — the red team, round 2: Astra (GPT-6 Astra, `codex exec -m gpt-6-astra`, high) (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-build1-read-brief.md`, its last section. Read from an exported copy of commit `df9a68f6a` (`C:c175b`; the handoff block, the writer's brief and round 1's three reports taken out). Blind to the other two readers; kept outside the checkout until all three had reported. Saved whole by the host.

---

I read an exported copy of commit df9a68f6a, round 2.

**The revised plan still needs changes before building.** I found one HIGH issue and four MEDIUM issues. This was a source review: I ran no tests, changed no files, and opened neither handoff blocks nor other readers’ reports.

1. **HIGH — The recommended answers to N2 and N8 conflict, leaving the bell’s wrong-squadron write open.**

   Hunter belongs to 142, has Plan rights in 149, and picks 149. His own 142 weekend duty needs an OIL answer. He presses the bell.

   N8 and test F1 require the bar to change to 142 before the window opens. But N2’s recommended clause makes `ownSqnOf` return **149** for any input listed there because it names Hunter. The bell uses that same answer as its destination. `enterForLine` therefore answers “here”; Inputs is already offered on 149; the window opens live and can write Hunter’s 142 record under a bar reading 149.

   This follows directly from the combination of §§5.2–5.3. Either recommendation alone conceals the conflict; building both exposes it. Step 7’s claim that the doors close F1/F2 would also cease to hold when step 8 adds N2’s clause.

   **Fix:** separate the squadron a bell tap should enter from the context in which an input may lawfully remain editable. Preserve the shared-input case explicitly. Add a test with **both recommended answers enabled**, using F1’s exact Hunter example, and retain that test through step 8. The answers remain yours to give; the plan must explain their interaction before you choose.

2. **MEDIUM — The movable-window check cannot apply its promised individual exceptions as specified.**

   An OIL list remains open after a change the person did not make. Pressing its card may need to enter the input’s squadron. The plan deliberately allows the card to ignore its own list, while another open window must still refuse that switch.

   Yet §3.2(a) defines **one aggregate row** whose answer is whether any movable window is open. R2 calls it the `float` row. Section 3.1 says exceptions skip **row IDs**, while the card supplies `oilday` and the held Input window’s return chip supplies `inputedit`. Neither names that aggregate row.

   Taken literally, the intended exception refuses. Skipping the whole aggregate instead would overlook every other movable window.

   **Fix:** apply reachability and exceptions to each live window ID before combining the results, or give each ID its own row. Specify which actual window the answer names. Test the OIL card alone, then with a second window, and make equivalent checks for the Input window’s return chip.  
   *Evidence: §§3.1, 3.2(a), 3.4 R2, 4.1 rows 5/10 and 5.3.*

3. **MEDIUM — The final entry checker does not preserve those legitimate exceptions.**

   Even after fixing finding 2, the OIL card can pass its correctly scoped check and reach the actual squadron entry while its own list remains open.

   Section 3.4 then requires the test checker to throw whenever `refusalAt` would refuse **at that moment**. It does not specify carrying the card’s exception into that check. The same problem applies to the held Input window’s return chip. The ordinary check sees the still-open window and rejects a change the door correctly allowed.

   This threatens the promise that each build step leaves the suite green. Exempting whole tests would also hide a real failure involving a second window.

   **Fix:** carry the originating door and its narrowly permitted exception through to the final entry check, including any delayed continuation. Test that the originating window is ignored, another window still refuses, and an unguarded raw entry still fails. Make this part of the checker’s design and build sequence, rather than adding broad test exemptions.  
   *Evidence: §3.4’s checker, §4.1 rows 5/10, §5.3 and §10 steps 6–7.*

4. **MEDIUM — An OIL question opened directly from an Inputs row is missing from the window count.**

   On Inputs, press a row’s **OIL** or **OIL?** button. `InputsPage.reviseOil` opens its own confirmation question, without opening an Input window. Its Save callback changes the row’s OIL answer.

   Section 3.2(e) omits a separate check because it says the OIL question sits over an already-counted Input window. That is true of one opening route, but false here. The standalone question is drawn from the Inputs page’s local state.

   The revised source scan can still accept the question component as belonging to the Input-window row; counting occurrences inside the component does not prove that every caller supplies that parent.

   **Fix:** count the OIL question independently wherever it is opened, and add an opening test through the Inputs row’s actual button, with no Input window present. The census must distinguish this standalone use from its nested use.

   I have **not** proved that a person can reach a switch through this question’s shade and keyboard protection. This is a demonstrated omission from the promised window count, not a demonstrated switch bypass.  
   *Evidence: `InputsPage.reviseOil`, its standalone confirmation near the page’s end, and §3.2(e).*

5. **MEDIUM — “Counted means drawn” still misses windows hidden inside the Tracker’s Info panel.**

   Open the Tracker on a wide screen and open a lull-period window. Narrow the screen below the Tracker’s phone-layout breakpoint. Its default Flow chart tab hides the entire Info panel, including the lull window and its shade.

   The proposed Tracker check still reports that window: the Tracker is ready, has a course, has no boot error or cover, and the window’s state remains set. A squadron pick is then refused for a window the person cannot see. Naming “the Tracker” does not explain that they must open **Info**, because they are already on the Tracker.

   Test A10 would miss this: the ancestor is hidden by its display rule, not an HTML `hidden` marker. The same enclosing panel holds the lull-copy, failures and down-days windows.

   **Fix:** extend N1’s location/recovery treatment to the Tracker’s inner tabs. Do not silently discard the window or its work. Add a real-browser test that opens the window wide, narrows the screen, presses the picker and verifies the agreed recovery. Test actual visibility, rather than only the absence of a `hidden` ancestor.  
   *Evidence: Tracker `App`’s initial Flow tab, `SidePanel`’s window children, its narrow-screen display rule, §§3.1/3.3 and A10.*

I checked the central page-door proposal against the ordinary page routes, bell branches and automatic landings. I found no additional unlisted direct squadron/view-change caller in that trace. Keeping automatic entry and session changes outside the person’s guarded page door appears consistent with retaining today’s midnight, rights-change and sign-out handling until Build 2.

I found no separate squadron-switch keyboard shortcut or browser-address route. The ordinary page tabs are constrained by which pages are offered. Leaving the Tracker’s session cleanup intact is also the safer cut; I found no reason to replace it with a window-table cleanup.

I withdrew my provisional finding about deleted-input bell lines: P16 explicitly limits its promise to lines that change neither squadron nor page. A cross-squadron line falls outside that condition.

The smallest revision is to resolve the ownership/destination conflict, make window exceptions precise end to end, and add the missing standalone and hidden-panel cases. None requires bringing Logout or squadron-specific Undo forward from later builds.

Rulings: none this session.