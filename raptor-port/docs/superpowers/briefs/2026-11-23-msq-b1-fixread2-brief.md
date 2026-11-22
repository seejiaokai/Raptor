# The read of the second fix round: batch 1's second half of the multi-squadron build (RAPTOR), 23 Nov 26

You are one of two readers. Each of you is blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/` or any report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov. Read-only: change no file in the repo, run nothing that builds, commit nothing.

**The code:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`. This round's fixes are `git diff 1cd46dcdb..41ca09274 -- raptor-port/src`. The earlier round, for context, is `992f0227a..1cd46dcdb`; the whole half is `origin/main...41ca09274`. Read the source at `41ca09274` with `git show 41ca09274:<path>`.

**What this round fixed:**
- **A1.** An Undo could put a Plan row back onto an account that is now a master admin. The case: Saber gives Hunter Plan of 149 and removes it, another master admin makes Hunter master, then Saber undoes his removal. The Plan sat hidden under "Full access" and came back when the mark came off. Fix: `accounts.ts accountsRestoreProblem` and `perms.ts unitRowViolation`.
- **A2 / N1.** With Leave War → Approvals open, picking the other squadron left the page drawing the old squadron's war. Fix: `leavewar/state/store.ts initStore`, whose change count restarted at 0 on a war loaded in place, and `leavewar/ui/ApprovalsPage.tsx`, which kept its state by period id alone.
- **A3.** An Undo or Redo of "+ New squadron" pressed on Admin → Data stayed on Data. Fix: `state/view.ts requestAdminSquadrons`, `ui/AdminPage.tsx`, `state/undo-wire.ts landingOf`. Every squadron or place step now lands on Admin → Squadrons.

**What it should do:**
- the plan `raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md` (§16, then §15, win over earlier sections);
- `.claude/rules/decisions/people-accounts.md` §Many squadrons; for a ruling's full row, `grep -h '^| D2336 |' .claude/decisions-full/*.md`;
- `raptor-port/CLAUDE.md`;
- `raptor-port/docs/data-schema.md` §Edit rights by squadron;
- D148: Undo steps back only through the signed-in person's own changes, and refuses where someone has since changed the very same thing;
- D672: an Undo keeps the screen only when the change is already in view, otherwise it shows it.

**Look for:**
- whether each fix closes its fault on every path: the door, the commit gate, Undo and Redo, a reload, another squadron picked;
- what each fix broke. For example: an ordinary Undo now refused; a Leave War screen that no longer redraws, or redraws wrongly (the change count feeds every Leave War page); Approvals state lost or kept wrongly; Admin opening on the wrong panel; a crash; words that say what did not happen.

**A finding counts only with:**
- the steps: who signs in, and what is pressed or called;
- what happens, and what should happen per the plan or a ruling;
- the file and function;
- a test that would fail today, written out.

**Not a finding:**
- harm only to demo data already stored, when the code is right going forward (D56);
- a scheduler who is not an admin (D785);
- style.

**Your reply is your report:**
- findings, numbered, most severe first;
- then what you read and what you did not;
- then three tidiness notes on the changed lines (filed, not fixed — D489).

Plain and concise.
