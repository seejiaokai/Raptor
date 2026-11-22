# Fix read 10 — Astra's read (GPT-6 Astra, `codex exec -m gpt-6-astra -s read-only`, its input closed; 20 Nov 26, chat 118; copy at `064079abf`, code = `945c6de69`) — DID NOT FINISH

Astra ran on its blind copy with the brief unchanged (its security paragraph kept whole), used 237,774 tokens, and was
stopped twice by its service with "This content was flagged for possible cybersecurity risk" — no report came back (as in
fix reads 8 and 9). Its run log is kept in chat 118's scratch, `fr10-astra-err.txt`.

Its progress notes, verbatim, the only output it gave:

- "I'll read the project rules and the full brief, then check the named code and return a read-only report."
- "I'm checking the less common sequences first: rights removed and restored, posting take-backs, and notifications
  around a move. I'll separate proven failures from cases I can only assess by reading the code."
- "The review has identified possible gaps in how rights follow a reassigned account and how notification writers are
  checked. I'm testing those paths before treating them as findings. I also found a conflict between the holiday wording
  in the brief and the recorded ruling, so I'm tracing what the app actually does."
- "Three cases now have failing assertions: a retired line returns after an account is reassigned, an input change can
  carry an unchecked leave-decision line, and a clock correction can hide a valid line written after a move. The resync
  changes have passed eight targeted checks so far. I'm checking the remaining exceptions and Undo/Redo behavior."
- "The six fixes improve the tested cases, but three gaps remain in adjacent routes. I'm finishing the holiday checks and
  checking that the report clearly separates confirmed faults from work already on the backlog."

The host's matching: "a retired line returns after an account is reassigned" = Fable F10-4; "an input change can carry
an unchecked leave-decision line" = Fable F10-2; "a clock correction can hide a valid line written after a move" — no
proof given; nearest is Fable's note on F's exception (a flicker while the clock catches up), to be tried by the host.
"A conflict between the holiday wording in the brief and the recorded ruling": the brief says a holiday line goes to the
schedulers at the place (D2206); D2195 says each squadron's holiday never touches another squadron's bell — the host to
check which the code follows (the per-squadron holiday list is job 4, P5, not yet built).
