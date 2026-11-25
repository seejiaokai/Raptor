# Build 1 plan, read round 3 — Astra (blind; chat 176, 25 Nov 26)

Read from the exported copy `C:\rc176` of `b09f67b12` by `codex exec -m gpt-6-astra`, high. Saved whole by the host from its report file.

**Copy: b09f67b12 — Astra, round 3**

**Needs revision before building.** I found three high-severity gaps, one conditional on the Calendar answer. I ignored the handoff and did not read other readers’ reports. This was a static review; no files changed and no tests or browser walks run.

1. **HIGH — Undo can still end Plan after its maker loses authority to give or end it.**  
   **Anchor: §19.2, V7; `restoreLeavesOut` and the grant permission check.**

   Kestrel gives Hunter Plan of 149. Later Kestrel becomes 142’s admin and holds only Plan of 149. Undoing his earlier grant must now be refused or left out.

   Today, verified Undo bypasses the ordinary Plan permission check. The restore check examines permission when *putting back* an admin-level grant, but returns early for deletion; a downgrade to View also escapes that check. Replacing the existing master-admin checks with the proposed predicate therefore does not cover every direction. V7’s “made a member” case misses this because ordinary admin permission already fails.

   **Plan fix:** explicitly check current authority for both the before and after images, including deletion and Plan-to-View replay. Preserve the separately ruled demotion/archive exceptions. Test Undo and Redo while the maker remains an admin through Plan but is no longer 149’s own admin.

2. **HIGH — Hiding a foreign person’s fields does not restrict what Save submits.**  
   **Anchor: §19.1, V1–V4; `PersonEditor`, `accessWant`.**

   Saber changes Ranger’s sign-in name on 142, picks 149, and opens Ranger’s foreign row. He then undoes the rename and changes Ranger’s 149 access line.

   The current editor retains the name captured when opened. Save compares that hidden value with the now-restored account and includes it in the access command. Saber’s authority permits the rename, so saving 149’s line can silently rewrite 142’s account. The existing Undo landing does not necessarily close an editor already on Users.

   The plan removes controls but explicitly leaves the underlying account doors unchanged; its tests check absence of controls and a normal save.

   **Plan fix:** give a foreign row a restricted save payload containing only the page squadron’s access change—never name, role, master status or another squadron’s line. Recheck the row’s current home and page at Save. Add the Undo sequence above and a row whose home changes while open.

3. **HIGH, conditional on E1 — The Calendar’s imported holiday sheet is missing from the guard.**  
   **Anchor: §3.2 `days`, N13; `HolidaysPanel` import preview.**

   Saber imports a holiday sheet on 142 and leaves its preview awaiting **Add**, then picks 149. If E1’s recommended answer is accepted—close the Calendar but protect unfinished work—the proposed implementation loses that preview.

   The preview is local state inside the Calendar, not a separate movable window or one of the registered unsaved forms. Closing the Calendar unmounts it. N13 describes the answer as changing one table cell and incorrectly generalises that its work saves immediately.

   **Plan fix:** map E1’s complete alternatives into the plan. For the protect-unfinished-work answer, register the import preview and distinguish the pending holiday/form states named in E1. Test Add, Cancel, a failed Add, late file completion and the preview behind the Calendar’s other tab. Do not select an answer for the owner.

4. **MEDIUM — Hunter’s own SANS reminder can open the wrong squadron’s calendar.**  
   **Anchor: §4.5 `openNotice`, §9; `sansUnfiledLines`.**

   Hunter, SANS of 142 and holding Plan of 149, picks 149 and presses his own “Your SANS availability” reminder.

   That derived notice has no squadron field. The proposed first entry check consequently enters nothing. The page check also passes because 149 already offers Inputs. The existing reminder branch then opens 149’s SANS calendar on the reminder’s date. After part G, its new commitment offers 149’s SANS people, not Hunter.

   **Plan fix:** determine and enter the reminder’s owning squadron before marking it read or changing the tab, month or day. Test Hunter from Plan-held 149 and View-only 150, with refusal and Tracker Stay preserving every mark.

5. **MEDIUM — The page-entry recipe closes windows before the decision to leave.**  
   **Anchor: §4.5 step 5 versus §4.2 steps 4–6 and B30.**

   In B27’s held-Tracker state, a bell line requests the home Inputs page and raises the Tracker question. Section 4.5 explicitly calls `closeShown()` before changing the page and starting that question. Answering **Stay**, or encountering a refusal after the question, cannot restore windows already closed.

   This contradicts the promised order and B30’s preservation rule. B30 currently exercises the picker, so it does not expose the page-door discrepancy.

   **Plan fix:** close windows and end modes only inside the final successful entry, after the Tracker answer and renewed checks. Apply the same sequence to page entry, holiday entry and bell entry. Run B30 through each door.

6. **MEDIUM — Closing a people heading silently discards an access choice without an agreed rule.**  
   **Anchor: §19.3, V12.**

   Kestrel opens 142’s heading on 149’s Users page, changes Ranger’s access choice, then folds the heading. V12 requires that choice to be discarded as though Cancel was pressed, and the guard cleared.

   The rulings establish folded headings; this discard behaviour is an additional interpretation. It is not marked as such or included in E9.

   **Plan fix:** put the behaviour among the unanswered choices before implementing or asserting it. Cover reopening the heading and the guard’s state for whichever answer is given.

7. **MEDIUM — Several proposed tests cannot establish the claimed result.**  
   **Anchors: G12, V21, F14 and B20.**

   - **G12:** Hunter has View of 150, so he cannot reach its SANS calendar to inspect or drag “+ Commitment.” Use Saber or Mako for the no-SANS case; separately assert that Hunter cannot reach it.
   - **V21:** Hunter cannot switch on 150’s squadron notifications through View. Use Saber for three notification sources, and assert that Hunter sees 142/149 but no 150 squadron lines.
   - **F14:** the View-of-old-squadron listing assertion already passes today: `inputsListed` includes records naming the person regardless of that View right. Label it a preservation test, not a failing test.
   - **B20:** the saver currently awaits its backend without a terminal answer for a promise that never resolves. The plan’s acknowledged prerequisite is therefore unmet. Resolve the bounded-wait behaviour before building the waiting door; do not promise that this test passes through the present saver.

My independent entry-point check covered both squadron pickers and their keyboard paths; badge, menu and Input-window role switches; bell taps on both bars, access requests and notification families; page navigation, Admin shortcuts, Welcome Back, Leave War links and Board links; Undo landings and squadron deletion. Sign-in, sign-out, reload, midnight and rights refresh use automatic entry paths; the developer bridge is separately excluded. Apart from the SANS issue and the expressly open Undo-of-new-squadron question, I found no additional press route requiring a new guard location.

The window check covered Input editors and their questions; Inputs/SANS day and settings windows; Calendar, weekday and holiday forms; OIL lists; ALL AVAIL, Changes and Insights; template/draft dialogs; document, medical and OIL confirmations; Board questions; Admin editors; Leave War sheets; and Tracker marking, details, logs, lull, copy, reorder, syllabus, Show All, flex and question states. The concrete missing unfinished-work state is the holiday import preview. The proposed scans catch additions using recognised frames and flags; they do **not** guarantee detection of a future plain inline editor. The preview should become a regression example for that limitation.

I found no additional missing hold check in the Input window’s Save, Delete or OIL-answer paths; the planned document lock addresses its separate write control. Recording ownership once per input identity, retaining it through record replacement, and routing OIL cards through entry before opening are sound directions. I found no new reason to remove the existing automatic-change bands before Build 2.

For saved bug reports, the proposed all-admin list follows the stated ruling. Its described payload contains the submitted report and attribution, not an automatic dump of another squadron’s records. Member access, forged authorship and other admins’ seen marks still need the proposed gate checks.

Build 1 does not inherently depend on part V to provide its closing controls. Its release remains conditional on the explicit decision about Undo of “+ New squadron.” E1 and E2 need more than a table-cell change; E8 must govern saving as well as appearance. The safer implementation is one shared final-entry sequence and a separate, restricted foreign-access editor.

Phone keyboard reach, note placement, dragged-window overlap and the fades remain browser/device checks; this review supplies no visual pass.

**Rulings: none this session.**

