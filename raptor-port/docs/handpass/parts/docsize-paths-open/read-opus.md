# The fresh, blind Opus reader's read of [DOCSIZE-PATHS-OPEN] — commit 3c0b3ac65, saved by the coordinator as it came back

**REVISE.** Read-only; scratch in `C:\Users\User\AppData\Local\Temp\blindreader-docsize\`.

**Confirmed by running:** the gate passes on the branch; every live file under `.claude/rules/` passes the new check, and
`isScoped` and `docsize.mjs`'s inline parser agree on each. The full self-test passes, 0 MISS (about 17 minutes, the machine
shared). With `frontmatterProblems` stubbed to `return []`, all 6 must-fail cases MISS (the `--rulings` mover case among
them) and the pass case still passes; case 2 fails for another reason without the check too, but its `mustSay` keeps it
honest. `structure()` runs under `--inventory`, so the Stop hook and `--rulings` both refuse the new shapes. A close written
`--- ` or `----` was read differently by the inline parser and `fmEnd`; both are now refused. `paths: ["a/**"]`,
`paths: "a/**"` and items at column 0 are refused — correct for this repo, since `pathsOf` reads none of them (`[]`); Claude
Code would load the column-0 list scoped; unknown for the other two.

**Finding 1 (medium): a BOM at the start of a rules file slips through, closed or not.** Input: a committed page with
`'\uFEFF'` prefixed (and the same with its close removed). `frontmatterProblems` returns `[]` (`ls[0]` is `'\uFEFF---'`);
`fmEnd`, `isScoped` and the inline parser read no frontmatter, so the page is checked as unscoped — the item's own failure.
Both pass the real gate ("PROBE bom"). PowerShell's `Out-File` and `>` write UTF-8 with a BOM on this PC. Unknown whether
Claude Code strips it; either way the gate should fail it. Fix, at the top of `frontmatterProblems`:
```js
const ls = (text || '').split('\n').map(l => l.replace(/\r$/, ''))
if (ls[0] !== '---' && ls[0].replace(/^\uFEFF/, '').trim() === '---') return ['has "---" on its first line with a byte-order mark or spaces around it, so every reader here takes it for a file with no frontmatter: save it as UTF-8 without a BOM, line 1 exactly ---']
if (ls[0] !== '---') return []
```
Case: `scenario('a page saved with a BOM', true, c => { committedPage(c); c.edit(OTHER, t => '\uFEFF' + t) }, { base: 'HEAD', mustSay: 'byte-order mark' })`

**Finding 2 (low): a lost close can swallow body lines that are never checked.** Input: a committed scoped rules file (not
a page), `---\npaths:\n  - raptor-port/src/x/**\n---\n\n# x\n\n## y\n\n---\n\nbody text\n`, its first close removed. Passes
the real gate ("PROBE swallowed headings"): column-0 `# x`, `## y` skipped as comments; the loop stops at the first
`key:`-shaped line, so a swallowed `Status: draft\nmore prose` passes too. A swallowed page is caught anyway by its ruling
checks, so this hits only non-page scoped files (the seam files, `raptor-executor.md`, `ui-design.md`). Live frontmatter
comments are all indented, so the fix is safe. Fix — scan the whole frontmatter, a column-0 `#` counted as body:
```js
let inPaths = false
for (let i = 1; i < fm - 1; i++) {
  const l = ls[i]
  if (!l.trim() || /^\s+#/.test(l)) continue
  if (/^[A-Za-z_][\w-]*:/.test(l)) { inPaths = i === at; continue }
  if (inPaths && /^\s+-\s+\S/.test(l)) { items++; continue }
  if (!inPaths && /^\s/.test(l)) continue
  out.push(/* the existing "is not a - <glob> item" message */)
}
```
Case: the probe input, expected to fail, `mustSay: 'is not a "- <glob>" item'`.

**Finding 3 (low, wording): a close with a trailing space is refused, but the message says it "never closes" — add the
closing `---`.** Fix: in the `!fm` branch, `const near = ls.findIndex((l, i) => i > 0 && l.trim() === '---')`; if found,
"line N closes the frontmatter but has spaces around its `---`: make it exactly ---".

**Not findings:** a first line `--- `, `"paths":`, `paths :` and an indented `  paths:` all pass silently as unscoped, every
reader here agreeing; Claude Code would probably read the last three as a `paths` key (not confirmed).
