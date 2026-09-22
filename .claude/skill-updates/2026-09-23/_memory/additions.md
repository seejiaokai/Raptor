# Memory additions (machine-local, outside the repo) — install = append each block

The two-provider review tool (the claudex-loop plugin) is installed per machine,
not in the repo, so its lessons belong in this machine's memory notes, which
live beside it. Folder: `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`.

## Append to `astra-codex-cli-available.md` (observations #162, #164)

**Windows: an exit 1 AFTER a finished review is not a failed review** (seen
17-18 Sep 26, every round whose findings contained `→` or `−`). The runner
completes the review and writes a valid `result.json`, then crashes printing it
to a cp1252 console (`'charmap' codec can't encode character`). Judge the run by
`result.json`: `status: completed` with a `response` = success; only a missing
`response` or an `error` field = failure (a genuine early failure exits within
seconds). Launch with `PYTHONIOENCODING=utf-8 PYTHONUTF8=1` to stop the crash,
and keep host-written dispositions files ASCII (`->`, not `→`).

## Append to `cap-design-review-rounds.md` (observation #165)

**Convergence is judged per section, not per verdict.** Keep an append-only
review log mapping each round's findings to the design sections they hit. When
a round's new findings cluster on the section changed since the last round, the
rest has converged. A section added late (an owner reframe) needs its own one or
two rounds even after everything else is settled — say so to the owner rather
than calling the whole design unsettled.

## Append to `python-edits-crlf-trap.md` (observation #190)

**The same edit scripts have a second trap: quoting layers eat escapes.** A
Python snippet fed through a bash heredoc to write source code turned its `\n`
and `\t` into real newlines and tabs (23 Sep 26, twice) — the files still ran,
so nothing failed. Write any file whose content holds escape sequences with the
Write tool; if a script must write it, count the tab and CR bytes in the result
before committing.

## Append to `reviewer-must-give-detailed-fix-specs.md` (observation #154)

**When NOT to commission a separate pre-build "execution guide":** when the
approved spec already names the exact functions, their order and the tests, a
guide repeats it at the cost of an extra review round. Tests written first plus
one review of the real diff is the cheaper guard against drift. Commission a
guide only for a thin or vague spec, and send it to the provider whose budget
is least constrained.
