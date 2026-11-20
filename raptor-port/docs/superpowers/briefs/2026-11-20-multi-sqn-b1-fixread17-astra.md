# Fix read 17 — Astra's read (copy at `6e08cdf25`): STOPPED by its service, no report

Reader: GPT-6 Astra (D1770, D2210), run by chat 123 as `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s
read-only --skip-git-repo-check` on its own exported copy of `6e08cdf25`, brief `2026-11-20-multi-sqn-b1-fixread17-brief.md`;
started 14:33:18, ended 14:44:41, exit 1. Its service stopped it twice with "This content was flagged for possible
cybersecurity risk"; its run log (11,106 lines) states no finding before the stop, and no `-o` report was written. Under
his D2232 the stop is accepted: no other reader takes its seat, the brief is not reworded, and the read goes on the
reads-owed list (`[NO-ASTRA-LIST]`).
