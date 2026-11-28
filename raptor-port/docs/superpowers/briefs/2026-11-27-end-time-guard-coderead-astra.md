Blind read of the exported `claude/end-time-guard-202` build. **Two concrete defects**, both reproduced using the actual source functions with a minimal DOM stand-in. No files changed.

1. **[P2] Moving a row clears its red outline without filling its missing time.**

   **Failing test:** Create two Common Programme rows: A has `0900–1000`; B has `1000–blank`. Refuse signing, then move B above A through `applyMove`. Assert B’s END remains red. **Actual:** it becomes grey. Deleting A produces the same failure.

   **Cause:** [timegap-paint.ts:38](C:/rt/b-cr/build/raptor-port/src/ui/timegap-paint.ts:38) remembers positional keys such as `ap:0.1.end`. After the move, [line 57](C:/rt/b-cr/build/raptor-port/src/ui/timegap-paint.ts:57) removes that remembered key because B now occupies `ap:0.0.end`. This contradicts D2853’s “staying red until the time is typed.”

   **Fix:** Store and compare refused boxes using the existing `ridKey` stable-row addressing. Use positional keys only to locate their current screen elements. Cover reorder, preceding-row deletion, and Undo/Redo.

2. **[P2] Deleting the other saved plan clears red on the unchanged surviving plan.**

   **Failing test:** Create plans A and B. On current plan B, empty a duty END and refuse signing. Delete parked plan A. Assert B’s unchanged empty END remains red. **Actual:** it becomes grey.

   **Cause:** [timegap-paint.ts:30](C:/rt/b-cr/build/raptor-port/src/ui/timegap-paint.ts:30) includes `curDraftId` in the refusal key. Deleting the penultimate plan deliberately removes the surviving plan’s identifier at [drafts.ts:644](C:/rt/b-cr/build/raptor-port/src/engine/drafts.ts:644). The red set remains stranded under the old identifier, although no time or current-plan content changed.

   **Fix:** Preserve the surviving plan’s refusal identity when the plan list collapses. Migrate its red set to the unlabelled working-copy key, with corresponding restoration on Undo/Redo; communicate that transition through a hook without importing UI into state.

I found no concrete forward signing/publishing bypass or new state-to-UI import. Undo/Redo’s deferred Q15 behavior is not filed as a defect. All three demo-week seeds returned zero gaps. No browser, Vitest, or performance run was performed; this export lacks installed dependencies. Without a base export, I cannot certify a byte-for-byte “ends only” data diff.

**Tidiness note — filed here, not fixed:** Duplicated logic? The AMT BRIEF/DEBRIEF predicates repeat those in `events.ts`; consider one shared predicate when Q16 is settled. Names? No materially misleading new name found. Dead code? None identified; the reset exports have test callers.

**Verdict: REQUEST CHANGES — fix the two red-outline identity defects.**

