# Astra's blind code read — React Doctor on the shell, the state and the windows (8 Nov 26)

Brief: `docs/superpowers/briefs/2026-11-08-rd-shell-state-read-brief.md` (main part). Model gpt-6-astra, reasoning high, read-only. Read of `git diff 7744e66db 969042adb -- raptor-port/src`. Saved as it came back.

**Low — An existing checking script still calls the removed save-status export.** At [lw-m4-bars.mjs:61](/C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port/scripts/handpass/lw-m4-bars.mjs:61), the failed-save picture step imports `SaveStatus.tsx` and calls `setSaveStatusSource`. That export now lives in `savestatus-source.ts`. When the script reaches this step, the call throws, so it takes no failed-save picture and stops before completing both screen sizes. **Fix:** change that dynamic import to `/src/ui/savestatus-source.ts`. The application’s own callers have been updated.

1. **List lookups changed to Sets.** No application regression found in the paths checked. The people lists in `changelines.ts`, `undo/describe.ts` and `notices.ts` are arrays with the same string conversions as before. The leave-date lists are locally produced arrays. `noticeseen.ts` normalises its stored IDs to an array. `plan.ts` and `oilwait.ts` update the Set alongside each append; `undo/timeline.ts` preserves first-seen order. The flying-plan allowed-field lists and storage converters’ collection lists are fixed arrays; none of the converters changes its collection list during conversion. The ordinary permission paths use the same half-day and allowed-field arrays. Forged-envelope cases remain for the security reader.

2. **The three extracted modules.** Apart from the script finding above, no missed caller or changed read timing found. An exact text comparison confirmed that the Insights builder and highlight definitions moved unchanged. Insights still reads `INSIGHTS_ALL` and the roster when called. The save source’s state and subscription code also moved unchanged, apart from exports. Every indicator and failed-save band still reaches that one source, and Retry calls its current `flush()`. No new early read of an uninitialised value was found.

3. **Window shades and Close buttons.** No lost focus target, dialog name or existing dialog role found. The changed shades were unnamed outer `div` elements; their contents and controls remain present. Focus handling, Escape handling and outside-click handlers are unchanged. Searches of application code, tests and checking scripts found no affected selector relying on the former cross-only accessible names. The new labels do change what assistive technology announces, while leaving the visible crosses unchanged.

4. **The top-bar mark.** No difference found. Comparing the extracted markup with both former copies confirmed identical elements, classes, SVG path, view box, accessibility attribute and lettering. The component adds no wrapping element.

5. **Disable-comment reasons.** No concrete new fault concealed by a reason was found. I checked the JSON-copy sites against their capture, restore and storage paths; the short-list exceptions against their callers; the changing question and toast lists; the confirmation sheets’ retained lists; delegated button events; and the sequential storage operations. Browser-specific claims about sandboxed PDF viewing and download timing were not independently exercised.

6. **Re-pointed comments.** No new incorrect description or broken heading found. The drag comments match the current move, join and swap paths. The input-window comments correctly describe one input record and one shared OIL answer. The board pointer reaches “Week navigation & cross-week continuity”; the input editor’s pointer reaches the Leave War’s “Architecture” heading.

This was a static read of the specified comparison. No tests, build or browser were run; the reported picture comparisons were not independently verified. No file was changed, and nothing under the excluded readers’ folder was opened.

Rulings: none this session.
