# Fix read 9 — Astra's read (GPT-6 Astra, `codex exec -m gpt-6-astra -s read-only`; 19–20 Nov 26, chat 118; copy at `fc0e95ecf`, code = `ae1af3806`) — DID NOT FINISH

The first start (22:47 19 Nov) never ran: the background command left its input open and `codex exec` sat at "Reading
additional input from stdin..." until stopped at 00:02 20 Nov (skill note 981). Restarted with its input closed, Astra
ran on its blind copy with the brief unchanged (its security paragraph included), used 210,130 tokens, and was then
stopped twice by its service with "This content was flagged for possible cybersecurity risk" by 00:07 — no report came
back (as in fix read 8, and as Sol 6.1 this round). Its run log is kept in chat 118's scratch, `fr9-astra-err.txt`.

Its progress notes, verbatim, the only output it gave:

- "I'll read the project rules and the full brief, then check the named changes and return the review without changing
  any files."
- "The brief covers both recent fix rounds, including whether notifications remain correct after a squadron move. I'm
  tracing who should be told and checking that the same rules reach the bell, read controls, Undo and Redo."
- "I've finished the earlier reports and the builders' explanations. I'm now checking the combined fixes for
  regressions, including messages created just before a move and changes saved through the Leave War."
- "The normal test runner cannot create its temporary folder in this read-only session, so no tests ran there. I'm
  using in-memory assertions against the source and will distinguish those results from a normal test-suite pass."
- "I'm checking two distinct risks: a legitimate change being refused, and a change notifying someone who should no
  longer receive it. I've split the supporting reads across notification visibility, permissions and screen
  connections; I'm checking the shared save sequence."
- "The normal test runner cannot start because the read-only sandbox blocks its temporary folder. I'm using assertions
  run entirely in memory, which leaves the files untouched, and will distinguish those results from a normal test run."

No claim in these notes names a fault; "a legitimate change being refused" matches the fresh Opus reader's O9-1 and
Fable's 2 (fault B of the builder's brief), already proved red by the host.
