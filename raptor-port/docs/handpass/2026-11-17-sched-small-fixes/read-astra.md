Four defects need fixing.

1. **MUST — Escape closes a newer menu and the window beneath it.**  
   Open ALL AVAIL, then open Edit Schedule’s phone “more” menu. Press Escape once: both close. The board’s “more” menu and navigation drawer have the same competing-handler pattern.  
   **Cause:** [floatwin.ts:49](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port/src/ui/floatwin.ts:49) does not defer to these menus. The window’s earlier document listener closes it; stopping propagation does not stop another listener on that same document.  
   **Fix:** register these menus in the shared Escape order, or explicitly defer to them. Add a test asserting that one Escape closes only the newer menu. Reproduced with the production phone-menu component and Escape hook in jsdom.

2. **MUST — Closing History can bring an older window ahead of ALL AVAIL.**  
   From the bell, open the holiday OIL-answer list. Leave it open, open ALL AVAIL, then History. Escape closes History but brings the OIL list forward ahead of ALL AVAIL. The next Escape can discard the OIL list’s unsaved choices.  
   **Cause:** [ChangesWindow.tsx:131](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port/src/ui/ChangesWindow.tsx:131) calls `gone('chg')`, but neither new participant joins the window order maintained by `forward`. That order remembers the OIL list and omits ALL AVAIL.  
   **Fix:** register both windows on opening and pressing, and unregister them on every closing path. Test three windows: History closes first, ALL AVAIL second, the OIL list last. The incorrect ordering was reproduced through the production ordering functions.

3. **MUST — Pressing the window again does not reclaim Escape from an armed seat.**  
   Open ALL AVAIL, arm a seat, then press ALL AVAIL’s title bar. Escape still disarms the seat and leaves the window open, although the window was pressed last.  
   **Cause:** [floatwin.ts:50](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port/src/ui/floatwin.ts:50) remembers the armed seat only when the window first opens; bringing it forward never refreshes that comparison.  
   **Fix:** refresh the comparison when the window is reopened or pressed. Test that Escape closes the window while leaving the earlier armed seat intact. Reproduced through the production functions.

4. **MUST — Reopening ALL AVAIL from another count returns the keyboard to the first count.**  
   Open count A, press count B while the window remains open, focus its close button, then press Escape. Focus returns to A.  
   **Cause:** [sheetfocus.ts:238](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port/src/ui/sheetfocus.ts:238) captures the opener only when `open` changes; replacing the window’s subject leaves it true.  
   **Fix:** update the remembered opener on each explicit opening, without resetting it on ordinary redraws. Test A → B → Escape, including a redraw. Reproduced with the production hook.

**Tidiness:** the new Escape callbacks duplicate each window’s existing close action. Use one closing function per window so cleanup stays consistent. No misleading new names or newly dead code found.

**Not checked:** no server, browser walk, iPhone touch check, full suite or end-to-end test was run. The in-memory checks used isolated production modules with unrelated dependencies stubbed. I did not read the evidence sheet, pictures or another reviewer’s report. D2112’s full row was absent from the searched ruling files; its requirement was taken from the brief.

No files changed. Rulings: none this session.