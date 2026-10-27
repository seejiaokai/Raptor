# The M4 code read — the brief for two blind readers (the night of 27–28 Oct 26; D790, D1425)

You did not write this code and have not seen the chats that did. Two readers read it, each blind to the other: a fresh
Opus reader and Fable (his D1425 — Fable reads M4 beside the Opus reader). **Never open the other reader's report**
(`read-opus.md` / `read-fable.md`). Read the finished change and say what is WRONG or MISSING — a claim is a finding only
with a concrete failure (the steps, what the person meets), its cause in the code and its exact fix (D489).
**Read-only: change no file except your own report; do not commit; do not build or run browser tests.**

**Where to read:** a read-only copy of the branch at commit 5f0405eaf, `C:/m4r` (the working checkout may change under a
fix while you read — read there, never in the working checkout). **The change:** the Leave War overhaul's M4 (deciding),
`git -C C:/m4r diff 36b7beaa9 5f0405eaf -- raptor-port/src` (40 files, about 3,300 lines, a third of them tests). What it is
meant to do: `raptor-port/docs/superpowers/plans/2026-10-27-lw-m4-build-spec.md`. The evidence sheet — the tier, the
roll-call (§3), the security read and its fixes (§6), the scenario designer's list and its dispositions (§8), the first walk
(§9) and its findings with their dispositions (§10): `raptor-port/docs/handpass/2026-10-27-lw-m4.md`. The rulings:
`.claude/rules/decisions/leave-war.md` (D1420–D1442 are M4's; one line each — a full row: `grep -h '^| D1436 |'
.claude/decisions-full/*.md` in the shell) and `how-we-work.md`. The project's rules: `raptor-port/CLAUDE.md`.

**Read hardest where a defect would be silent:**
1. **Saved data** — a request's four stamps (who placed, when; who decided, when — `leavewar/engine/warrecs.ts`, every place a
   request is rebuilt field by field: does any drop or reset a stamp, or keep one it should not?), `lwBy` / `lwAt` on a
   war-approved Input, the notice's new fields, the `apprseen:` row (`state/apprseen.ts`, declared to the command layer in
   `state/people-settings-commit.ts` only on 27 Oct 26 — is it now saved, reloaded and per admin?), and what an older
   stored request without stamps reads as.
2. **Who may do what** — `state/perms.ts`: `LeaveApprovalsSeen`, NoticeSeen's admin read, `lw.notice` an admin's alone, the
   stamp guard (`stampForged`) and `undo/timeline.ts verifiedReplay`. Can a member forge or borrow a stamp, write a war bell
   line, or read another man's private notice? Can an admin's real Undo / Redo be refused by the guard?
3. **The one writer of a decision** — `leavewar/state/store.ts decideRequests` (Approvals' line, Approve all) beside the bid
   windows' and the day's list's paths: a line drawn from a state since changed (stale) refused; a decided line's other
   button pressable — Approved straight to Refused and back (D1428), a second tap on the lit one back to pending (D1421);
   D1436's refusal of leave after a posting-out date, before the posting runs, unless SANS — in BOTH doors (`sync.ts
   approveWhy`, `store.ts decideWhy`, `postedOutBy`): a range crossing the date, a half day on it, a SANS posting, a posting
   date moved or withdrawn after the line was drawn, Approve all over a mix.
4. **The bell's Leave War lines** — `store.ts decisionTells` / `openingTells`, `sync.ts tellWar`, `tellBidding`, `endedLines`,
   `warNoticesReversed`, `state/notices.ts`: every decision kind tells the member once, by whom (D1142); an Undo of a decision
   he has read leaves "taken back" (D1216), one he has not read simply goes; a re-type tells nothing; bidding open / closed
   for every member, "Bidding" with a capital (D1433); a stretch whose dates ended (C-F3's fix); never two lines for one act.
5. **The Approvals page** — `leavewar/approvals.ts` (a line is one request run: which days join, across a weekend, a half
   day, two kinds; the figures DAYS, LVE BAL, LOWEST AVAIL from the period holding the date), `ui/ApprovalsPage.tsx` (New and
   "Also since you last looked" counted from the saved visit; the lit lines kept until he leaves — D1421 — and through the
   slim bar's Back; Approve all armed and disarmed; Pick dates; the other period's link), `ui/cellring.ts`, the slim bar and
   `Matrix.tsx`'s soft ask skipped while the page is up.
6. **What the walk found and the chats fixed** (§10) — is each fix right and complete, and what did it break beside it?

**Absences:** check the roll-call (§3) for a place that draws a pending request, a decision, a bell line, a date tap or a
document and is not listed, or is listed as having it without proof.

**What is NOT a finding (owner, D56):** a problem that lives ONLY in data already stored (the demo data is cleared before the
database) while the code is correct going forward. Do not report it. Nor a design choice his rulings made (the readings
R12–R19 in §2 and §8 are named to him at his look).

**Your report** — saved to `raptor-port/docs/handpass/parts/lw-m4/read-<opus|fable>.md` in the WORKING checkout
(`C:/Users/User/projects/Raptor/.claude/worktrees/leave-war-m4-planning-2c0623/`) and returned as your final message: each
finding numbered, its severity (would harm a person's leave, records or permissions / a visible fault / tidiness), the
steps, what happens, the cause (file and function, at 5f0405eaf), and the exact fix. Then, in a few lines, what you read and
found sound.
