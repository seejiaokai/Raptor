# Astra's re-read of the fix round — 153fb74e0 (codex exec -m gpt-6-astra, reasoning high, read-only; saved word for word)

REVISE

Three remaining holes in `frontmatterProblems`. Each returns `[]` and passes both the full gate and `--inventory` with in-memory fixtures. Below, `\n` means newline.

1. **A second `paths:` bypasses validation.**  
   Input: `---\npaths:\n  - src/**\npaths: [other/**]\n---\n`  
   `inPaths = i === at` treats the second `paths:` as unrelated metadata; the readers retain only `src/**`. An empty second list or unmatched quote there also passes.  
   **Fix:** inside the key branch, reject `/^paths:/.test(l) && i !== at`.

2. **Indented text before any key passes.**  
   Input: `---\n  orphan text\npaths:\n  - src/**\n---\n`  
   `!inPaths` permits indentation even when no preceding key exists, contrary to decision 2’s “under other keys” restriction.  
   **Fix:** initialise `haveKey = false`, set it inside the key branch, and change the indentation exemption to `if (haveKey && !inPaths && /^\s/.test(l)) continue`.

3. **An escaped closing quote passes as a matching quote.**  
   Input: `---\npaths:\n  - "src/**\"\n---\n`  
   The final `"` is escaped, leaving the scalar unclosed; checking only the endpoints accepts it. This makes the builder’s quote doubt concrete.  
   **Fix:** retain endpoint matching, then require double-quoted items to match `/^"[^"\\]*"$/` and single-quoted items `/^'[^']*'$/`. Reject escapes explicitly because the unchanged readers do not decode them.

The five reported examples behave as stated. All 18 live files pass; all four readers remain unchanged. The proposed checks also pass all 18. Bare `a"b` is valid; key-only swallowed text is indistinguishable from the metadata the settled decision allows.

Fixtures stayed in memory because filesystem writes are prohibited. No files changed.

Rulings: none this session.