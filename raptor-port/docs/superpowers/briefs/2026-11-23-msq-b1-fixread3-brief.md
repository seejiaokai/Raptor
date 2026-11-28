# The read of the last small fix (A4): batch 1's second half of the multi-squadron build (RAPTOR), 23 Nov 26

You are one of two readers. Each of you is blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/`, or any report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov. This is read-only: change no file in the repo, run nothing that builds, commit nothing.

**The code:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`. The fix is `git diff 0acad2f81..781b033de -- raptor-port/src` (one commit). Read the source with `git show 781b033de:<path>`.

**What it fixed:** an Undo or Redo that would leave a right (View or Plan) standing on a master admin's account is refused (A1). That refusal said only "Something else changed this after your action — it can’t be undone now." D148 says Undo steps back through the signed-in person's own changes only, and where someone has since changed the very same thing, it refuses and says who.

The fix:
- `state/accounts.ts masterRightLeft` now only names the account.
- `state/undo-wire.ts masterRightRefusal` gives the refusal through `undo/timeline.ts outOfBandWords`, which names who last wrote that account's row, for example "Kestrel changed this after your action — it can’t be undone now."

**Look for:**
- the wrong person named (for example the signed-in person himself, or someone who changed a different row);
- an Undo now refused that must pass, or one passing that must be refused;
- the refusal reached on a path where the right is not actually left on a master admin;
- a crash;
- words that say what did not happen.

**A finding counts only with all of these:**
- the steps;
- what happens, and what should happen;
- the file and function;
- a test that would fail today, written out.

**Not a finding:**
- harm only in demo data already stored, when the code is right going forward (D56);
- style.

**Your reply is your report:** findings, numbered; what you read; then up to three tidiness notes on the changed lines (filed, not fixed — D489). Plain and short.
