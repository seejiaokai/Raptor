# Fix read 11 — Astra (GPT-6 Astra): did not finish (20 Nov 26, chat 118, overnight)

Run on the unchanged brief (`…-fixread11-brief.md`, copy at `a45a1e002`, code `eb51fa689`) by
`codex exec -s read-only -m gpt-6-astra`, input closed. After about 150,000 tokens its service stopped it twice:
"This content was flagged for possible cybersecurity risk" — the fourth round running (fix reads 8, 9, 10, 11). No
report, no claim. Its three progress notes: it read the brief and the rules; it traced the Undo / Redo and restore
paths first, then the everyday account and bell actions; it was testing whether a normal delete followed by Undo still
works now that the saved record is checked as well as the working copy (fault C) — its first test run blocked by its
shell. That case is passed to the host's own re-check (an ordinary input deleted and undone, a bell line taken back and
put back). On `[NO-ASTRA-LIST]`.
host check (Astra's lead): delete + Undo + Redo of an input, and a changed input's Undo / Redo bell lines, saved each way under fault C — 2/2 green on eb51fa689 (zz-host11/c-undo.test.ts in fr11-astra)
