# Astra's read of [DOCSIZE-PATHS-OPEN] — commit 3c0b3ac65 (codex exec -m gpt-6-astra, reasoning high, read-only; brief scratchpad docsize-reader-brief.md, copied to reader-brief.md here; saved word for word)

REVISE

1. **The regex accepts broken YAML and rejects supported YAML.** These inputs reproduce through the function, full gate, `--inventory`, and `--rulings`:

   | Input (`\n` means newline) | Actual | Required |
   |---|---|---|
   | `---\npaths:\n  - "src/**\n---\n` | Pass | Fail: unclosed quote |
   | `---\npaths: "src/**"\n---\n` | Fail | Pass |
   | `---\npaths: ["src/**"]\n---\n` | Fail | Pass |
   | `---\npaths:\n# comment\n  - "src/**"\n---\n` | Pass; `pathsOf()` returns `[]` | Pass; return `["src/**"]` |

   The new reader counts item prefixes without parsing YAML; the old reader stops at the unindented comment. Claude documents string/list support and says malformed YAML becomes **unscoped**, rather than loading nowhere. [Claude documentation](https://code.claude.com/docs/en/memory#rule-frontmatter-reference)

   **Fix:** parse the complete frontmatter once, validate its syntax and value types, and make all readers consume that result. Replace regex counting with:
   ```js
   const doc = parseDocument(ls.slice(1, fm - 1).join('\n'))
   if (doc.errors.length) return doc.errors.map(e => e.message)
   const p = doc.toJS()?.paths
   if (p !== undefined &&
       !(typeof p === 'string' ||
         (Array.isArray(p) && p.every(x => typeof x === 'string'))))
     return ['paths must be a string or a list of strings']
   ```
   Normalize string paths using Claude-compatible comma splitting, respecting braces. Vendor the YAML parser and copy it into the self-test fixtures: the document workflow performs no dependency installation. Add the four cases above.

2. **Delimiter handling disagrees and can bypass the check.**

   - `---\npaths:\n  - src/**\n--- \n`: the inline reader says scoped; `fmEnd()` says no frontmatter; the new check reports an unclosed block.
   - `\uFEFF---\npaths:\n  - src/**\n`: the unclosed block passes every tested route because the BOM defeats the opening-line comparison.

   **Fix:** share normalization and delimiter recognition, including the new function’s opening check:
   ```js
   const ruleLines = t =>
     t.replace(/^\uFEFF/, '').split(/\r?\n/)
   const delimiter = l => /^---[ \t]*$/.test(l)
   const fmEnd = ls => {
     if (!delimiter(ls[0])) return 0
     const end = ls.findIndex((l, i) => i > 0 && delimiter(l))
     return end < 0 ? 0 : end + 1
   }
   ```
   Replace the inline scope expression with `RL.isScoped(head)`. I have not established Claude’s precise BOM/trailing-space behavior; the internal disagreement is reproduced.

All 18 live rules and CRLF passed. All new negative tests depend on the new diagnostic; the later-divider case also triggers older failures, but `mustSay` prevents false success.

Fixtures used in-memory filesystem/Git substitutes because this session prohibits writes. Stock self-test speed and the actual Stop-hook invocation remain unverified. No files changed.

Rulings: none this session.