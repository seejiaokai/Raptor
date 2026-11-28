Read-only review of the supplied exports. No files changed; no tests run. References to “the plan” mean [2026-11-27-end-time-guard-plan.md](C:/rt/et/rulings/raptor-port/docs/superpowers/plans/2026-11-27-end-time-guard-plan.md).

1. **The Board’s flight and standby time boxes are missing from the implementation steps.**  
   **Case:** crewed flight or SC line, landing/END empty; refuse sign-off on the Board. The guard counts it, but the proposed rendering changes leave its box unoutlined.  
   **Cause:** these inputs are built inline in [ui/board.ts:339](C:/rt/et/app/raptor-port/src/ui/board.ts:339), bypassing both `sbTxt()` and `boxHTML()`. The plan identifies the inline Common Programme inputs but misses these.  
   **Fix:** add this renderer to the roll-call and step 4. Test both start and end, ordinary flight and standby, grey and red, including repeated formation fields on multiple aircraft rows. The refusal’s “each outlined in red” must match the screen.

2. **Typing “TBD” does not produce the state S3 expects.**  
   **Case:** replace an existing landing with `TBD` or `tbd`. [engine/slots.ts:354](C:/rt/et/app/raptor-port/src/engine/slots.ts:354) rejects it with “is not a time” and retains the old landing. The proposed reader never sees `TBD`; signing can proceed against that retained clock.  
   **Cause:** the plan changes the reader but leaves the time-writing path unchanged. This also conflicts with D2855’s “no words of its own” if S3 means actual typing.  
   **Fix:** specify the writing behaviour explicitly—accept the ruled token or normalize it to empty—and cover it through the real week and Board writers. Keep other words behind R2. A raw fixture containing `TBD` proves only the reader. Ruling: [decisions-full/scheduler.md:14](C:/rt/et/rulings/.claude/decisions-full/scheduler.md:14).

3. **Undo/Redo is a separate publication door; “unchanged code” is not established.**  
   **Case:** publish a complete day, empty an END in its working copy, Unpublish, then Undo the Unpublish. Undo restores the published state while the working copy still has the gap. Restoring an older incomplete issue is another case within the plan’s expressly included saved-data coverage.  
   **Cause:** history writes recorded `sched.book` and `sched.issuance` images directly. It does not call either proposed publish guard. This route is already demonstrated by [undo/integration.test.ts:149](C:/rt/et/app/raptor-port/src/undo/integration.test.ts:149). See [undo/timeline.ts](C:/rt/et/app/raptor-port/src/undo/timeline.ts), [state/undo-wire.ts:620](C:/rt/et/app/raptor-port/src/state/undo-wire.ts:620), and [state/sched-commit.ts:393](C:/rt/et/app/raptor-port/src/state/sched-commit.ts:393).  
   **Fix:** distinguish restoring an already-issued snapshot from publishing the current working copy, and resolve that scope with the owner before changing restoration semantics. Add Undo-Unpublish and Redo-publication tests, checking both the restored issue and working copy. Do not install a blanket invariant that forbids ordinary incomplete amendments. Also correct the premise that *any* new edit clears Redo: `abandonForkedRedo()` abandons overlapping records, not every undone entry.  
   This proves a missed door, **not** that a newly created incomplete snapshot bypasses the proposed ordinary publish guards.

4. **The red flag conflates different saved plans.**  
   **Case:** refuse plan A with a missing END; switch to complete plan B; return to A. Clearing the day flag when B has no gaps makes A grey although its missing time was never typed. Conversely, switching between two incomplete plans transfers A’s refusal colour to B.  
   **Cause:** §2.2 keys red only by `unit|iso`, whereas plans own separate content and signatures in [engine/drafts.ts:354](C:/rt/et/app/raptor-port/src/engine/drafts.ts:354).  
   **Fix:** put this worked example into R3/R4 and define colour ownership across plans. Test both directions. Do not silently choose shared colour or erase A’s refusal merely because another plan is complete. D2853: [decisions-full/scheduler.md:16](C:/rt/et/rulings/.claude/decisions-full/scheduler.md:16).

5. **Two rule-function interpretations are presented as settled without an owner answer.**
   - **AMT labels:** `/DEBRIEF/i` exempts an uncrewed row labelled `BOX — DEBRIEF PRACTICE`, with START entered and END blank. `/^\s*BRIEF/i` also accepts more than the literal BRIEF row. The engine’s timing heuristic is evidence of existing behaviour, not automatically the scope of D2852’s exception.
   - **Sim free text:** the plan treats every nonempty `who`, including `EXT SQN`, as “someone”. D2852 explicitly names a person, ALL, ALL AVAIL or a typed callsign; the code describes sim `who` as free text.

   **Fix:** record these readings and their concrete examples, then use the approved predicates. Keep paired tests for the block’s own empty headers versus ordinary AMT rows, and callsigns versus descriptive sim text. Sources: [engine/events.ts:470](C:/rt/et/app/raptor-port/src/engine/events.ts:470), [engine/avail.ts:44](C:/rt/et/app/raptor-port/src/engine/avail.ts:44), [decisions-full/scheduler.md:17](C:/rt/et/rulings/.claude/decisions-full/scheduler.md:17). R1, R2 and R7 themselves are correctly labelled as questions.

6. **The proposed “someone” parity test has the wrong oracle.**  
   **Case:** SC SPARE alone, an ALL/ALL AVAIL placeholder, or sim `who: 'EXT SQN'`. The proposed guard counts these; `dayEngaged()` deliberately excludes SC SPARE, special people and sim free text.  
   **Cause:** engagement/availability and missing-time eligibility answer different questions.  
   **Fix:** reuse the structural enumeration where useful, but test eligibility against explicit ruling cases—not equality with these helpers. Include extras-only rows, placeholders and unknown typed callsigns. [engine/avail.ts:72](C:/rt/et/app/raptor-port/src/engine/avail.ts:72).

7. **S20 expects the opposite of the real input-editing behaviour.**  
   **Case:** clear END on a timed input’s promoted Ground Programme row.  
   **Actual result:** the edit goes through the input’s writer; clearing a time makes that input all day. The rule’s all-day exemption therefore applies. It does not leave a timed input with one missing end.  
   **Fix:** replace S20 with the actual transition and its expected exemption, including Undo back to timed. If the owner wants clearing that cell to create a blocked gap instead, that changes input-editing behaviour and needs a separate decision. Sources: [ui/reqrow.ts](C:/rt/et/app/raptor-port/src/ui/reqrow.ts), [ui/inputedit.tsx:2052](C:/rt/et/app/raptor-port/src/ui/inputedit.tsx:2052).

8. **Some screen scenarios cannot be performed as written.**  
   **Case:** S17 puts a man directly onto the AMT BRIEF row through ordinary controls. The Board renders an empty people cell for BRIEF/DEBRIEF and offers no seat there. S26 similarly cannot retain `ASAP` through the ordinary time writer.  
   **Fix:** separate reader fixtures from reachable UI scenarios. For the occupied AMT-header case, use a reachable sequence such as seating a BOX row and then renaming it, and verify the resulting behaviour; do not claim a fixture mutation proves the missing control. [ui/board-html.ts:520](C:/rt/et/app/raptor-port/src/ui/board-html.ts:520), [engine/slots.ts:354](C:/rt/et/app/raptor-port/src/engine/slots.ts:354).

9. **The OIL integration tests preserve superseded behaviour and omit the named neighbouring job.**  
   **Case:** Later signs CUR CK; the next sign-off must ask again while an OIL question remains. An answer must preserve already signed names on an unpublished day. S45’s “each as today” instead preserves the current suppression and invalidation.  
   **Cause:** D2800/D2801 supersede the comments and behaviour in [ui/oilsign.ts](C:/rt/et/app/raptor-port/src/ui/oilsign.ts). [OUTSTANDING.md:2797](C:/rt/et/rulings/OUTSTANDING.md:2797) explicitly places that job with this sign-off work, but the plan’s overlap list omits it.  
   **Fix:** state the integration order and test the combined result. Add **held Later after a gap appears**, alongside held Save; retain the existing week/unit/plan identity checks. The proposed `writeSign` backstop otherwise covers both held-write routes. Rulings: [decisions-full/oil.md:12](C:/rt/et/rulings/.claude/decisions-full/oil.md:12).

10. **“Assumed times only while drafting” needs the ruled exceptions stated alongside it.**  
    **Case:** a complete, crewed AMT BOX with uncrewed BRIEF and DEBRIEF headers, whose ends remain empty, is deliberately publishable. Its inherited AMT debrief still uses the configured duration.  
    **Cause:** the plan’s blanket documentation language exceeds its own exception table.  
    **Fix:** narrow the affected flight/open-row explanations precisely; retain the AMT-header exception and test publication plus unchanged inherited timing. Likewise, “outline only” must not suppress D605’s existing whole-day-absence warning on a newly seated person. Sources: [engine/events.ts:477](C:/rt/et/app/raptor-port/src/engine/events.ts:477), [ui/logic-html.ts:55](C:/rt/et/app/raptor-port/src/ui/logic-html.ts:55), [decisions-full/scheduler.md:408](C:/rt/et/rulings/.claude/decisions-full/scheduler.md:408).

11. **Keyboard and Amendments-panel coverage need explicit qualifications.**  
    **Keyboard case:** F4 can open a focused native select on Windows; it is absent from the proposed intercepted keys. The `change` guard can still prevent signing, but the “native list never opens” promise is unproved. Test that path.  
    **Panel case:** while previewing a version, removing `disabled` merely because the live day has a gap leaves an apparently pressable button whose existing handler immediately returns. Preserve the preview lock and its precedence explicitly. Sources: [ui/html.ts:2517](C:/rt/et/app/raptor-port/src/ui/html.ts:2517), [ui/Shell.tsx:203](C:/rt/et/app/raptor-port/src/ui/Shell.tsx:203), [ui/ALPanel.tsx:62](C:/rt/et/app/raptor-port/src/ui/ALPanel.tsx:62).

12. **FULL is right; the reader allocation is incomplete or unverifiable.**  
    Published records and earned leave justify FULL. Astra plus a fresh blind Opus, independent scenario design, Fable’s wording read and the proposed real-browser walks are appropriate. No additional security read follows merely from applying the same time rule to existing Plan holders.  
    However, §5.2 lists only two final code readers. The supplied standing rules require the high-risk Fable reader **beside** Astra and the fresh Opus reader. Even accepting the plan’s temporary substitution, its opening paragraph requires a separate fresh Opus in that Fable seat and an owed-read entry. After reset, the Fable seat returns. **D2819’s full row is absent from the supplied decisions-full files**, so its temporary authority and expiry cannot be verified here. Sources: [rules/decisions/how-we-work.md](C:/rt/et/rulings/.claude/rules/decisions/how-we-work.md), [decisions-full/how-we-work.md:21](C:/rt/et/rulings/.claude/decisions-full/how-we-work.md:21), [rules/bug-check.md:52](C:/rt/et/rulings/.claude/rules/bug-check.md:52).

The ordinary week, Board and Amendments-panel publish calls converge on the two proposed commit guards; the sign selects and held OIL sign-offs converge on the proposed sign guards. I found no additional detachment-specific sign/publish writer in this exported base. Future detachment integration needs a concrete acceptance test, rather than being marked already covered.

**Verdict: NOT BUILD-READY—repair the missed renderer and TBD writer, resolve restoration and exception semantics, correct the scenarios, and complete the reader allocation.**

