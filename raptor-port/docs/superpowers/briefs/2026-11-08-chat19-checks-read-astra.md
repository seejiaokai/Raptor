# The checks job (pull request 698) — Astra's read (8 Nov 26, chat 27)

Model gpt-6-astra, reasoning high, read-only; brief: `2026-11-08-chat19-checks-read-brief.md`; the read of commit `52f5823f5`. Its final answer, word for word.

---

1. **P2 — Attached `sed` options bypass the tracked-file protection.**  
   `sed -i -e's/a/b/' OUTSTANDING.md` is allowed; so is `sed -i -fscript.sed OUTSTANDING.md`. The parser ignores attached `-e`/`-f` values, then mistakes the filename for the script, leaving no files to check. **Fix:** recognise attached expression/file arguments and check the remaining filenames; add regression cases for both forms. [Source, line 232](C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/.claude/hooks/script-guard.mjs:232)

2. **P2 — Launcher arguments hide the command being checked.**  
   `env -u X sed -i 's/a/b/' OUTSTANDING.md` and `printf 'OUTSTANDING.md' | xargs -n 1 sed -i 's/a/b/'` are allowed. `env -u NODE_OPTIONS node` also bypasses the missing-input refusal. The parser mistakes `X`, `1`, or `NODE_OPTIONS` for the command because it skips option names without consuming their arguments. **Fix:** parse each supported launcher's option arguments before identifying its command; pin these examples in tests. [Source, line 186](C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/.claude/hooks/script-guard.mjs:186)

3. **P2 — Valid here-strings are refused, including inside commit messages.**  
   `cat <<< hello` and `git commit -m "$(cat <<< fix)"` are refused as conflicting inputs. The extractor skips the first `<`, then interprets the remaining `<< hello` as a here-document. Actual Git Bash runs `cat <<< hello` successfully. **Fix:** consume `<<<` as one operator before considering `<<`; test quoted and unquoted here-strings, including command substitution. [Source, line 110](C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/.claude/hooks/script-guard.mjs:110)

4. **P2 — Single-quoted inline scripts are wrongly treated as shell expansions.**  
   `node -e 'require("fs").writeFileSync("x", "$schema")'` is refused, although the shell preserves `$schema` literally. Every inline script is assigned `expands: true`, after its quoting information has been discarded. **Fix:** retain whether each script fragment can undergo shell expansion; permit literal dollars and backticks protected by single quotes while retaining the separate backslash check. Correct the corresponding header/map wording and add both safe and unsafe quoting tests. [Source, line 323](C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/.claude/hooks/script-guard.mjs:323)

5. **P3 — Help and version commands are refused as waiting for input.**  
   `cat --help` and `tee --version` are refused, although both finish successfully without input in Git Bash. The input check does not recognise these terminating options. **Fix:** recognise `--help` and `--version` before applying the missing-input refusal; test both utilities. [Source, line 305](C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/.claude/hooks/script-guard.mjs:305)

**Checked and found sound:**

- Supplied focused tests passed: script guard **20/20**; checks-passed **8/8**.
- The configured hook preserves refusal exit status; ordinary commands and malformed input retain their intended handling.
- Checks-passed matched the expected outcome across **31,250 job-result combinations** with valid change outputs.
- Classification handled 10,000 notes, a code file after those notes, an empty list, and both sides of a rename.
- Workflow routing, dependencies and notes-only lists agree; no accidental change found to deployment, caches or concurrency.
- Both design settings copies are identical; the relevant exclusions match from either working folder.
- React Doctor’s added exclusions cover mock-ups, pictures and reference material, without hiding app source.
- The board test retains its release/click assertions while holding the removal timer; this was inspected, not rerun.
- Document and ruling checks passed.

The unsafe command examples were submitted to the guard only; no edits were executed. I changed no file and read no other reviewer’s report. No live CI or browser run was performed. **Reading limitation:** the historical file map was not read completely; all its changed entries and relevant references were reviewed.

Rulings: none.

**Tidiness note:** No deletion or duplication warrants a finding. Q11’s coverage link is misleading: current text matches include an unrelated review comment and SVG coordinates. Put its identifier beside the actual approved-leave boundary test and update its description to match that test.
