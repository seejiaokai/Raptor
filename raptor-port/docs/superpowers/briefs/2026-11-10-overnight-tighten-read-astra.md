# Astra's report — the overnight skill's tightening (10 Nov 26, chat 60)

Read-only, by `codex exec -C <the chat's folder> -s read-only` on the brief
`2026-11-10-overnight-tighten-read-brief.md`, at commit `e596f448b`, blind to the fresh Opus reader's read. ONE
finding, the opening-message checklist, which was also the Opus reader's third — fixed in the Opus reader's words,
which add the ruling's number (`2026-11-10-overnight-tighten-read-opus.md`). Kept outside the checkout until both
reports were in.

Its report, as returned:

---
**1 meaning change — 0 of lost detail — 1 other: a contradictory instruction.**

1. **The opening-message checklist still requires the promise that the new exception replaces.**

   **Old words, step 6:**
   > “Nothing merges and nothing touches the live app.”

   **New words:** that sentence remains, followed by:
   > “or, where he has given ‘auto merge live’ for the night, what will merge in place of its first sentence”

   But the final check before sending that message still says, unchanged:
   > “The message says nothing merges and the live app is untouched”

   **Concrete failure:** when you have already given “auto merge live” for the night, the agent cannot satisfy both instructions. Following the final check makes it promise that nothing will go live, although step 6 correctly requires it to describe what will merge. That contradicts D1093’s permission for the run.

   **Exact fix:** replace that checklist item with:

   > - [ ] The message says nothing merges and the live app is untouched, or says what will merge if he gave "auto merge live" for the night; says nothing starts until he replies; and ends by asking for his selection ("go" = the recommended jobs and answers).

I found no other unintended meaning change.

- **Removed and shortened passages:** I compared every changed passage with the original and the approved list. No rule, qualifying condition, safeguard, necessary reason or pointer was lost. The archive preserves the original wording, with its headings lowered and its description preserved.
- **Commands and prescribed messages:** every surviving command remains unchanged, ignoring wrapping. One command was removed: `git show 81b65274b:HANDOFF.md`, within the historical worked example explicitly approved to leave. Every prescribed message and sentence written into the saved block remains unchanged apart from step 6’s approved qualification.
- **Checks and opening the pull request:** the corrections match D1086 and D1089. The instructions still require the block to be pushed before opening the pull request, opening it once built so checks run during the walk, and no further push until the running checks finish.
- **Merging at night:** apart from finding 1, the head, “Never” pointer, morning checklist, shipping rules and general page carry D1093 and D1980 correctly. The exception covers the authorised run only. Notes wait during an unattended run without that permission; their ordinary morning merge remains allowed without a separate “merge live.”
- **The four consolidations:** each retained statement carries the former copies’ conditions. The always-loaded shipping rules are available before needed. Step 8 writes the complete compaction instruction before the first job; the later pointer retains the warning against relying on the summary’s memory.
- **The general page’s two changed lines:** neither loses a rule. The approved order, corrections, archive requirement and unattended-run safeguards remain.

Reviewed the committed version requested. Later uncommitted edits were excluded. I changed no files and made no commit or push.
