# Astra's blind read of job 6, Insights and the last small ones (8 Nov 26)

Run: `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`, on the branch `claude/insights-leftovers` at its first pushed commit, by the brief `2026-11-08-insights-leftovers-read-brief.md`; blind to the Opus read. Its final report, whole:

1. **Low — The walk exits successfully even when checks fail.** In [insights-leftovers-look.mjs:31](C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port/scripts/handpass/insights-leftovers-look.mjs:31), assertion failures are caught and recorded, but the script ends without setting a failure exit status. Browser errors also only accumulate in the report. A caller relying on command success can therefore accept a failed walk. I reproduced the caught-failure path in memory: it recorded `FAIL` and returned normally with exit status zero. **Fix:** after saving the report and closing the browser, set `process.exitCode = 1` if any result is not `PASS` or any browser error was recorded.

2. **Low — The Undo check can pass with invisible or incorrect wording.** [insights-leftovers-look.mjs:113](C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port/scripts/handpass/insights-leftovers-look.mjs:113) reads `textContent` and only requires “the mission role”. The toast retains its text when hidden by opacity, so this assertion can pass without visible feedback. It also accepts the wrong callsign, wrong side, or missing side. **Fix:** wait for the toast to be visibly painted, including opacity and viewport position, then compare its complete expected Undo message.

I found no application regression in the reviewed changes:

- **Wording:** 2,754 in-memory comparisons of the actual old and new History and Undo functions produced identical labels, `from`/`to` values and descriptions. Cases included malformed or absent detail, non-string names, unusual whitespace, long names and missing or invalid sides. The different fallback wording remains intact. No remaining duplicate formatter for these two consumers was found.
- **Saved context:** 8,006 old/new comparisons matched. The refactor retains normalization, deduplication, sorting and the v1 string. Its parts are strings and arrays of strings, so the removed JSON round trip introduces no conversion difference.
- **Imports:** no new circular dependency or heavy dependency chain was found. History already imported this module; Undo already reached its existing dependencies.
- **Editing routes:** the Remarks tests use the real editors and Choose handler. Both renderers update the surrounding pending/signing indicators while preserving the caret. The template tests partly set preview state directly; the walk exercises the actual issued-version menu. Tracing saved-plan switching, keyboard routing, phone rendering, next-week peek, stale template controls and Undo/Redo revealed no route to the feared failure. Published-day refusal remains enforced.
- **Retained JSON clone:** its explanation is sound: JSON drops undefined-valued properties, while `structuredClone` preserves them.

One tidiness correction remains: [mission-role-offer.ts:189](C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port/src/ui/mission-role-offer.ts:189) incorrectly says open questions number “one or two”. There is no such cap; an existing test explicitly holds three. Correct that explanation. I found no demonstrated performance failure requiring a collection change.

This was a read-only code review with isolated in-memory checks. I did not run the UI suite or browser walk; this checkout lacks installed dependencies. No files changed, and neither prohibited review nor the walk’s evidence sheet was opened.

Rulings: none this session.


