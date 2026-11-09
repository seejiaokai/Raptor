# [DOCSIZE-PATHS-OPEN] — the builder's fix round (11 Nov 26), saved by the coordinator as it came back, condensed

Commit 80b1c1ae6 on top of e46b02dc3. Only `frontmatterProblems` (`raptor-port/scripts/docsize-rulings.mjs`) changed; the
shared readers `fmEnd`, `isScoped`, `pathsOf` and `docsize.mjs`'s inline reader unchanged.

| The coordinator's decision (from both reads) | Done |
|---|---|
| 1. A byte-order mark or spaces around `---` refused with plain messages (Opus 1, 3; Astra 2) | First line `---` only after stripping a mark or spaces → "save it as UTF-8 without a byte-order mark, line 1 exactly ---" (the mark written as an escape in the source); a spaced close → "line N closes the frontmatter but has spaces around its ---… make it exactly ---". CRLF still accepted (a pass case through the whole gate). |
| 2. The whole header scanned (Opus 2; Astra row 4) | Blank lines and indented comments skipped; any `key:` accepted, indented lines under other keys accepted; under `paths:` only indented `- <glob>`; anything else refused, a column-0 `#` included. |
| 3. An item whose quotes do not match (Astra row 1) | Refused (a quote at one end only, or different quotes at the two ends). |
| 4. One-line `paths:` forms (Astra rows 2–3) | Still refused, the message now: "write paths: as indented `- <glob>` lines, one per line — the project's checks read only that shape"; `paths:   # comment` is not a one-line form. |
| 5. `key:`-shaped lines in a swallowed body (Opus 2) | Covered by the whole scan — the `Status: draft` case catches the prose after it. |

**Red** (the 10 new cases against 3c0b3ac65's checker, exit 1): a page with a byte-order mark (got OK); the same with its close
removed (got OK); a close with a trailing space (FAIL but without the new message); a scoped file's lost close swallowing
headings — Opus 2's own input (got OK); the same with "Status: draft" and prose (got OK); a column-0 "# comment" in the paths
list (got OK); an item with unmatched quotes (got OK); `paths:` as a one-line string and as a bracketed list (FAIL but without
the new message). The pass case (CRLF, quoted items) OK before and after.
**Green:** all 10 new and the 7 first-round cases PASS; the whole self-test 351 PASS, 0 MISS, exit 0, on the final code;
`npm run docsize` OK; the checker on all 18 live rules files: no false alarm, the same glob counts as before, 6 without a
frontmatter, none with CRLF, a byte-order mark or a column-0 `#` in its frontmatter.

**Doubts:** a swallowed body made only of `key:`-shaped lines still passes (refusing every key but `paths:` would close it — not
settled); the quote check looks only at an item's two ends (`a"b` passes); a first line of spaces only gets the message naming
the byte-order mark as well; Claude Code's own handling of a byte-order mark, a spaced `---` and one-line `paths:` is not
established — the checks enforce what this project's readers read.
