# Fix read 9 — Sol 6.1's read (GPT-6.1 Sol, `codex exec -m gpt-6.1-sol -s read-only`; 19 Nov 26, chat 118; copy at `fc0e95ecf`, code = `ae1af3806`) — DID NOT FINISH

Sol ran on its blind copy with the brief unchanged (its security paragraph included), started about 22:40 and stopped
by 22:55; it used 232,564 tokens; its service then stopped it twice with "This content was flagged for possible
cybersecurity risk", so no report came back (the same stop Astra met in fix read 8). Its run log is kept in chat 118's
scratch, `fr9-sol-err.txt`.

Its progress notes, verbatim, the only output it gave:

- "The brief asks me to check whether the fixes hold across permissions, squadron moves, notifications, and Undo—not
  just whether the changed lines look right. I'll trace those routes and report only faults with a concrete failing
  case."
- "The changes affect saved notifications and who may alter them, so the parent job requires a FULL check. My assigned
  part is the read-only review; I'm checking command handling, notification visibility, and access dates in parallel,
  while preserving the blind read."
- "The normal test runner was blocked before it collected any tests. I'm using assertions run entirely in memory, which
  leave the export unchanged. Two cases are under scrutiny: transferring an old access date to a different person, and
  hiding a legitimate new notification after the clock moves backwards."
