Seven findings, most serious first.

1. **Medium — D1179, question 3: the tests do not protect every leave and medical kind.**  
   The [full rule](/C:/Users/User/projects/Raptor/.claude/decisions-full/inputs.md:49) requires each whole family. The [filter test](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputs-docs.test.tsx:138) supplies only LL, OL, ATT C and Meeting, then expects LL/OL for leave and ATT C for medical. A filter that silently excludes CCL, HL or OML would pass.  
   **Fix:** keep the whole-family rule written out, or test every supported leave and medical kind, including documents present and absent, and exclusion of other families.

2. **Medium — D621, question 1: accepted keyboard controls become merely ideas shown.**  
   The [new page](/C:/Users/User/projects/Raptor/.claude/rules/decisions/inputs.md:181) says keyboard use was shown, but identifies only bars and dragging as chosen. The old line explicitly retained arrows, Enter, Delete and Escape; the [full row’s amendment](/C:/Users/User/projects/Raptor/.claude/decisions-full/inputs.md:159) says the instructions fold stays and “the keyboard set stands as drawn.” A fresh reader could treat those controls as unapproved proposals.  
   **Fix:** restore that the instructions fold and the approved keyboard controls remain.

3. **Medium — D646, question 1: shortening the cut-off sentence becomes a restriction on the entire help fold.**  
   The [new wording](/C:/Users/User/projects/Raptor/.claude/rules/decisions/inputs.md:168) says “How this works” states the cut-off “and nothing more.” The [full rule](/C:/Users/User/projects/Raptor/.claude/decisions-full/inputs.md:145) restricts only **the cut-off line**: remove its worked example and redundant late explanation. Following the new wording could remove the other instructions.  
   **Fix:** write “The cut-off line in ‘How this works’ states the rule as set, without a worked example or ‘later than that is marked late’.”

4. **Medium — D961/D965, question 1: Upchit Complete’s exception is missing.**  
   The [new Medical description](/C:/Users/User/projects/Raptor/.claude/rules/decisions/inputs.md:171) gives cards a kind and period, exempting Upchit Complete only from the date range. The [full rows](/C:/Users/User/projects/Raptor/.claude/decisions-full/inputs.md:64) explicitly remove both its kind and “upchitted.” The [existing assertions](/C:/Users/User/projects/Raptor/raptor-port/src/ui/medicalview.test.tsx:109) correctly require no kind, the date alone, and no “upchitted.” The page could direct a future change contrary to those assertions.  
   **Fix:** add “Upchit Complete shows its date and documents only, with no kind or ‘upchitted’.”

5. **Medium — D649/D651, question 3: class names do not protect puck size or the purple edge’s appearance.**  
   The [full rules](/C:/Users/User/projects/Raptor/.claude/decisions-full/inputs.md:140) require equal-sized pucks, an attached CAT chip, and the schedule’s purple right edge—including the correction keeping the chip and edge inside the frame. The [main test](/C:/Users/User/projects/Raptor/raptor-port/src/ui/sansday.test.tsx:141) checks `sm`, `san`, `r`, callsign and CAT text; the [other cited test](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputscal.test.tsx:206) checks that `.puck.san` exists. Different widths, a detached chip or an outside glowing stripe could pass.  
   **Fix:** retain these visual requirements, or add browser assertions for equal dimensions, attached chip geometry, purple right-edge placement and containment against the schedule puck.

6. **Low — D1622, question 3: the chosen question is not asserted.**  
   The [full rule](/C:/Users/User/projects/Raptor/.claude/decisions-full/inputs.md:23) specifies the same question as Escape: “Close it and lose them?” The [tests](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputskeys.test.tsx:260) check that the question element exists and its buttons work, but never check its words. The browser checks likewise establish visibility only. Different wording for ✕ and Escape could pass.  
   **Fix:** assert the exact question text through both routes, or keep that requirement written out.

7. **Low — D707, question 3: the shorter height is not protected as two-thirds.**  
   The [browser test](/C:/Users/User/projects/Raptor/raptor-port/e2e/inputs-sans-calendar.spec.ts:249) only requires the lowered window to be **less than 72%** of the screen. A half-height window passes. Returning to tall checks the class, without measuring the restored height. The unit tests also check classes rather than rendered heights.  
   **Fix:** assert a bounded tolerance around two-thirds, then measure the nearly full-screen height again after restoring it. Until then, classify its tests as partial.

**Question 2:** no finding of an agent-only interpretation promoted to an owner rule.

**Question 4:** confirmed. The three map updates and full-row heading record the Inputs conversion without unrelated changes. Ignoring whitespace, the other pages’ words are unchanged except for D630 in Screen design and D570, D572, D617, D618 in How we work.

All 165 original ruling numbers remain cited. Ten old “Also read” numbers do not: D18, D46, D468, D643, D700, D738, D741, D744, D745 and D780. Each is already recorded as replaced in the archive, and its replacement rulings remain cited; those omissions are not findings.

Rulings: none this session.

rulings checked: 165