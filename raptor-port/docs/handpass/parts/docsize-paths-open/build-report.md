# [DOCSIZE-PATHS-OPEN] — the builder's report (chat 49's night, 11 Nov 26), saved by the coordinator as it came back, condensed

Commit 3c0b3ac65 on `claude/docsize-paths-open` (from origin/main 230c3db93). No pull request, `main` and `HANDOFF.md` untouched.

**Changed:**
- `raptor-port/scripts/docsize-rulings.mjs` — new exported `frontmatterProblems(text)`: nothing for a file not starting
  `---`; otherwise (a) opened and never closed; (b) a `paths:` key with no list items; (c) a line between `paths:` and the
  close that is not an indented `- <glob>` item (comments and blank lines allowed — the seam files have them; another
  `key:` line ends the list). (c) also catches a lost close where a later `---` was taken for it. Uses the shared `fmEnd`;
  its item pattern matches `pathsOf` (a `- glob` at column 0 is flagged, since `pathsOf` would skip it).
- `raptor-port/scripts/docsize.mjs` `structure()` — a loop runs it on every `.md` under `.claude/rules/` (subfolders too),
  so the Stop hook covers it; `backlog-archive.mjs --rulings` runs `docsize.mjs --inventory` after writing, so it refuses
  the same shapes and puts the files back.
- `raptor-port/scripts/docsize-selftest.mjs` — 7 new cases, each from a committed page or scoped file, base HEAD.
- `OUTSTANDING.md` — the item marked BUILT on this branch, left in place.

**Red against the unchanged scripts:** five cases "expected FAIL, got OK" (never closed; `paths:` with no items; a non-item
line; a scoped non-page file never closed; `--rulings` moved a never-closed page); one "got FAIL" for misleading reasons (a
later `---` taken for the close); the pass case (comment and blank line in the list) OK before and after.
**Green:** all 7 PASS; the whole self-test 341 PASS, 0 MISS; `npm run docsize` on the real tree OK; the new reader on all 18
rules files found nothing (6 with no frontmatter, 12 scoped).

**Left:** the shared readers `isScoped`, `pathsOf`, `fmEnd` (changing them changes every caller; a passing tree never shows
them a bad shape); the inline parser of the new-file registration check (an open frontmatter there already fails); the
`--reads` reporting tool.

**Doubts:** fails a bad frontmatter even if the base already had it (main is clean today); a closed frontmatter with a misspelt
`path:` still reads as unscoped, not flagged; a `word:` line in a swallowed body ends the item scan early; `--rulings`
prints the whole gate output on a refusal.
