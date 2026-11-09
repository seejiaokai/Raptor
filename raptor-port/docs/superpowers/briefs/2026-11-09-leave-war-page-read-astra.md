*(Saved word for word from his final message — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`, codex-cli 0.160.0, chat 46, 9 Nov 26; brief `2026-11-09-leave-war-page-read-brief.md` with the host's one-line note on the working folder; page at `694602fac`. Blind to the fresh Opus reader's read.)*

**Changes are needed.** The findings below concern the page’s meaning and its claims about test coverage, not faults demonstrated in the running app. No files were changed; test assertions were inspected, not executed.

1. **D665 / D674 — Q1, Q6: the outgoing summary restores the old “last four rows” rule.**  
   [Page line 291](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/rules/decisions/leave-war.md:291) says the Required/Available rows stand “at the foot of the Manning block”. D674 expressly allows a counter between any two of them **or below all four**; D665’s full row records that they are no longer always last. The scheduler’s page retains that exception, but this page’s summary does not. A fresh reader could wrongly restore the fixed rows to the bottom.  
   **Fix:** say they belong in the Manning block, with counter rows allowed above, between or below them.

2. **D1177 — Q2: interpretations become unqualified standing rules.**  
   [Line 29](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/rules/decisions/leave-war.md:29) states “the admin decides bids at any time”; line 135 states the first-open-date landing behaviour. [D1177’s full row](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/decisions-full/leave-war.md:317) explicitly places both under **“The agent’s readings, drawn for him and his to strike”**. The page’s head promises that readings are never stated as his rule.  
   **Fix:** retain these behaviours but identify them as the agent’s readings, unless a later explicit acceptance is cited.

3. **D1466 / D1563 / D1565 — Q2: an exception is widened without preserving its status.**  
   [Line 184](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/rules/decisions/leave-war.md:184) applies the second-entry exception to every multi-day entry, including Inputs entries. D1466 rules it for multi-day leave; both [D1563 and D1565](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/decisions-full/leave-war.md:40) explicitly call carrying that exception over to Inputs entries **the agent’s reading**. A fresh model would treat the extension as an owner-set restriction.  
   **Fix:** distinguish the ruled leave exception from its interpreted extension to Inputs entries.

4. **D335 — Q2: the range’s expanded powers are presented as his instruction.**  
   [Line 192](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/rules/decisions/leave-war.md:192) says a picked range widens Decide, Move and Delete to every selected day. D335’s full row calls this **“the agent’s reading on the mock-up, uncorrected”**. His instruction was to keep the range picker. D1330/D1332 settle the later layout, but do not expressly adopt this reading.  
   **Fix:** mark the range-action behaviour as the agent’s reading.

5. **D1331 — Q1, Q3: “the title carries no code” is not held by the cited tests.**  
   D1331 requires no leave code in the title, as well as the correct Duration selection. [The title test](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/raptor-port/src/leavewar/ui/round3.test.tsx:94) checks that `.cur` is absent, “now” is absent, and the existing child elements remain. The other named test also checks `.cur` is absent. Adding `LL` to the existing date element would pass those assertions. The page has reduced D1331 to its number without retaining this exclusion.  
   **Fix:** restore “the title carries no leave code”, or assert the complete title contents for whole-day and half-day leave.

6. **D1476 / D1469 — Q3: matching class names do not hold the chosen colours.**  
   [The name-puck tests](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/raptor-port/src/leavewar/ui/namepuck.test.tsx:38) check `puck`, `r`, `pers`, the letter `O`, and `q-ocu`. They do not compare the displayed colours with the schedule’s. A Leave War-specific style could restore darker pucks or change the OCU colour while every assertion passes. Both full rows expressly require the schedule’s colours.  
   **Fix:** remove these numbers from the “held whole” claim until a browser assertion compares the displayed colours. Keep the colour requirements written out.

7. **D1375 — Q3: ATCH’s code is tested; its complete C1 appearance is not.**  
   [The named unit test](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/raptor-port/src/leavewar/otherunavail.test.tsx:72) checks `ATCH` and `kindOf(code) === 'unav'`. The browser Attach test checks the text inside `.c.k-unav`. The neighbouring browser test measures an **Other’s** outline width and opacity, not ATCH’s complete fill, edge colour and lettering. Those could change without these assertions failing. D1375 explicitly incorporates C1’s outlined look.  
   **Fix:** retain D1375 as partially held, or measure ATCH’s complete C1 appearance.

8. **D1360 — Q3: the mixed bubble’s per-pair colours are not tested as displayed.**  
   [The mixed-row test](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/raptor-port/src/leavewar/ui/bidbubble.test.tsx:403) checks the sentence and the helper’s `['amber', 'red']` values. The rendered tests check class names on single-colour bubbles. Making both displayed pairs red could pass them all, contrary to “each pair in its colour”.  
   **Fix:** render a bubble containing both levels and assert each pair’s displayed colour; until then, remove the “held whole” classification.

9. **D1351 — Q3: the course and Other filing paths are only checked through the wording helper.**  
   [The helper tests](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/raptor-port/src/leavewar/ui/bidbubble.test.tsx:396) supply CSE and OTH directly and check their phrases. The actual filing test presses OD and checks “This overseas duty”; another checks a subsequent bid. No corresponding assertion files a course or Other and checks the resulting bubble. A filing path that supplies the wrong kind would leave the helper tests green.  
   **Fix:** exercise both filing controls and assert “This course” and “This Other”, or classify this ruling as partially held.

10. **D1326 / D1349 / D1356 / D1378 / D1379 — Q1: the current menu cites obsolete instructions as its authority.**  
    [Line 193](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/rules/decisions/leave-war.md:193) correctly describes Grant OIL third and Attach first in the menu, including a member’s Attach-only menu. It cites only D1326, D1319 and D1320. Opening those rows leads to the older UNA-third arrangement and Grant OIL inside the menu. The rulings that actually changed these positions and permissions are absent from that line.  
    **Fix:** add D1349/D1356 and D1378/D1379 to its citations.

11. **D1947 — Q6: the head overstates when the OIL page loads.**  
    [Line 19](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/rules/decisions/leave-war.md:19) says OIL loads with this page. Leave War’s paths include `docs/**/*arch-stack-4*`; [OIL’s paths](/C:/Users/User/projects/Raptor/.claude/worktrees/epic-lehmann-06a880/.claude/rules/decisions/oil.md:1) do not. For example, the architecture clash catalogue matches Leave War’s pattern but none of OIL’s. A fresh reader working there could rely on the head and miss the OIL rules.  
    **Fix:** make the path coverage agree, or explicitly instruct readers of those documents to open OIL.

**Other checks:** Q4 produced no separate finding: this change moves no blocks into existing reference documents; the move report identifies rewrites, not completed byte-for-byte moves. The settled-section heading and old group names remain findable. Q5 produced no finding in the other-page edits or map lines; removing “in the app” does not change D410/D415’s requirement in context. The named later layout and colour rulings support their supersessions. All original ruling numbers and the old head’s outgoing references remain cited. I found no additional contradiction with the OIL page.

Rulings: none made this session.

rulings checked: 379.