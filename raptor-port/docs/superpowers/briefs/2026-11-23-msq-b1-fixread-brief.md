# The read of the fixes — batch 1's second half of the multi-squadron build (RAPTOR), 23 Nov 26

You are one of two readers, each blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/` or any
`*-read*` / `*fixread*` report from 23 Nov. Read-only: change no file in the repo, run nothing that builds, commit nothing.

**The code:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`. The fixes are
`git diff 992f0227a..<HEAD> -- raptor-port/src` (HEAD named in your call); the whole half for context is
`git diff origin/main...<HEAD> -- raptor-port/src`. Read the source at that commit with `git show <HEAD>:<path>`.

**What the fixes were for** — seven faults found by the walk and three earlier reads. Each now has a test that failed
before its fix:
- F1: the phone ☰ menu offered "Edit Schedule" to a View holder of 149 with 149 picked.
- F3: an Undo or Redo of "+ New squadron" moved Admin from the Squadrons panel to Users.
- R1: the bell's Show switch kept ids of squadrons undone away, so every later press was refused.
- R2: Leave War Approvals' "New" mark was one per person; it must be one per person per squadron (plan §3 item 7).
- R3: the master mark's own command (`setMaster`) kept a Plan holder's rights, and the gate let it through.
- R4: Admin → Users' Save was two commands. A refused rename left the access saved; a good one needed two Undos.
- R5: a 142 admin's hand-made account under a 149 requester's name answered that request at the gate.

**What it should do:** the plan `raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md` (§16, then
§15, win over earlier sections); the rules `.claude/rules/decisions/people-accounts.md` §Many squadrons (a ruling's full
row: `grep -h '^| D2336 |' .claude/decisions-full/*.md`); `raptor-port/CLAUDE.md`; edit rights by squadron in
`raptor-port/docs/data-schema.md` §Edit rights by squadron.

**Look for:**
- whether each fix really closes its fault, on every path: the door, the commit gate (`state/perms.ts`), Undo and Redo,
  a reload, another squadron picked;
- what each fix broke: a save now refused that must pass, a right that now survives or drops wrongly, an Undo that
  restores the wrong thing or another person's change, a record lost or doubled, a "New" mark or bell line shown under
  the wrong squadron, a crash, words that say what did not happen.

**A finding counts only with:**
- the steps (who signs in, what is pressed or called);
- what happens, and what should happen per the plan or a ruling;
- the file and function;
- a test that would fail today, written out.

**Not a finding:** harm only in demo data already stored, when the code is right going forward (D56); a scheduler who is
not an admin (D785); style.

**Your reply is your report:** findings numbered, most severe first; then what you read and what you did not; then three
tidiness notes on the changed lines (filed, not fixed — D489). Plain and concise.
