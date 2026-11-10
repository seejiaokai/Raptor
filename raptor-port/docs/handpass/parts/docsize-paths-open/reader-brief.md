You are a blind code reader. Read-only: change no file, no commit, no push, no checkout or switch.

Repo: C:\Users\User\projects\Raptor, branch `claude/docsize-paths-open` at commit 3c0b3ac65 (one commit on top of
origin/main 230c3db93). Read the change with `git diff 230c3db93 3c0b3ac65`. Do not open anything under
`.claude/skill-updates/` or any file named `read-*` or `report-*`.

The job — the backlog item [DOCSIZE-PATHS-OPEN] (`grep -n -A8 '^### \[DOCSIZE-PATHS-OPEN\]' OUTSTANDING.md`): on 8 Nov 26 a
rules page's first draft lost the `---` line that closes its frontmatter (its `paths:` list). The file then would not load
by itself with the files it names, yet `npm run docsize` and `node raptor-port/scripts/backlog-archive.mjs --rulings` both
passed it — the check read it as an unscoped page, so the area-page checks never ran. The change must fail (1) a rules file
under `.claude/rules/` that opens a frontmatter (`---` on line 1) and never closes it, and (2) a `paths:` list that cannot
be parsed; with a self-test case for each, and `--rulings` refusing the same shapes.

What to find — what is MISSING or wrong, not style:
1. Run it. Construct rules-file texts (in a scratch folder outside the repo, e.g. your system temp) and call the new
   function and the gate on them: a shape that should fail but passes; a real, valid shape that is now wrongly refused
   (check every live file under `.claude/rules/`, subfolders included, and the shapes Claude Code itself accepts in a
   rules file's frontmatter — e.g. `paths:` written as one quoted string or an inline list, CRLF line endings, a BOM, a
   trailing space after `---`). Say what Claude Code would load for each, if you know; say when you do not.
2. Does the new reader agree with the shared readers the other checks use (`isScoped`, `pathsOf`, `fmEnd` in
   `raptor-port/scripts/docsize-rulings.mjs`, and the inline parser in `docsize.mjs`)? A file one calls valid and another
   reads differently is a finding.
3. Do the self-test cases prove what they claim (would each fail if the new check were removed)? Is any case passing for
   another reason?
4. Anything the change breaks elsewhere: the Stop hook's run, `--inventory`, `--rulings`, the self-test's speed.
A finding counts only with a concrete failing input, its cause and the exact fix (code). Keep it short.

Output: first line APPROVE or REVISE; then each finding: the input, what happens, what should, the fix.
