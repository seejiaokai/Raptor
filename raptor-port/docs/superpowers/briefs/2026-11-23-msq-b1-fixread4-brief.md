# The read of the refusal's last wording fix (A5): batch 1's second half of the multi-squadron build (RAPTOR), 23 Nov 26

You are one of two readers, each blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/` or any
report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov. Read-only: change no file in the repo, run nothing that
builds, commit nothing.

**The code:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`. The fix is
`git diff 781b033de..5d964e088 -- raptor-port/src` (one commit); the source at `git show 5d964e088:<path>`.

**What it fixed:** an Undo or Redo that would leave a right (View or Plan) standing on a master admin's account is
refused. D148 says Undo steps back only through the signed-in person's own changes, and where someone has since changed
the very same thing, it refuses and says who.

Before this fix, the refusal always named the writer of the ACCOUNT row. Now it names whoever wrote what blocks the step:
- when the step puts the master mark back over a right given since: the writer of that right's row;
- when the step puts a right back under a mark set since: whoever set the mark — never someone who only changed another
  field;
- when that was his own step in this session: it names nobody;
- when it was his own step in another session: it reads "You changed this somewhere else…".

Files: `state/accounts.ts masterRightLeft`, `state/undo-wire.ts masterRightRefusal`, `undo/timeline.ts outOfBandWords`
(an optional rule for which change to look for).

**Look for:**
- the wrong person named, or a person named for a change that did not block the step;
- an Undo now refused that must pass, or one passing that must be refused;
- any other refusal whose words changed through `outOfBandWords`' new option (every Undo refusal shares it);
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

**Your reply is your report:**
- findings, numbered;
- what you read;
- up to three tidiness notes (filed, not fixed — D489).

Plain and short.
