# Section 1 — three pieces of on-screen wording to draft (chat A211, 28 Nov 26)

**You are a fresh Opus helper drafting words people read in the app** (his D2441: Opus drafts, then a different fresh
Fable reviews and adjusts them before they reach him). Working copy
`C:/Users/User/projects/Raptor/.claude/worktrees/a211-s1-kr-dd0560` — read only; **change no source file**, commit
nothing. Write your drafts to `raptor-port/docs/superpowers/briefs/2026-11-28-msq-s1-words-draft.md` and give them as
your final reply.

## Read first
- `raptor-port/docs/design-practices.md` — its head, §0, §1, §1a, §1b (the writing guide) and §9 (his design lessons),
  whole. `.claude/rules/decisions/design.md` §Saving ("Blocked:" refusal look and words), `inputs.md`.
- For each piece, find the place in the code where the words would sit, and check every example you write against the
  real app's code (names, dates, what the screen already says next to it).

## The three pieces
1. **The waiting holiday's line (his D2837).** Today the Calendar's holiday form says, for a holiday added into a year
   with no leave period yet, "It is kept here, and saved by itself as soon as a leave period covers it." (find it — the
   Calendar window / holidays form). His D2837 (full row: `grep -h '^| D2837 |' .claude/decisions-full/*.md`): the form's
   words say it is kept **only while the window stays open** (it is dropped at a squadron switch and by the ✕). Draft
   the new line.
2. **K10-f's refusal at Save** (the K10 root plan `raptor-port/docs/superpowers/plans/2026-11-28-msq-s1-k10-root-plan.md`
   §7.4, §8's K10-f row, §1): in an input's own window, a change of its dates, or a man or ALL / ALL AVAIL added, that
   would move the record off the squadron it belongs to is refused at Save. A refusal takes the grey "Blocked:" note
   (design.md §Saving). Draft the words, one worked example: Ranger (member, 142's) has leave Tue 14 – Sat 18 Jul,
   moving to 149 on Thu 16 Jul; on 142's page an admin of both changes the end date so the leave would now cross into
   his 149 days — or adds a 149 man. Say what happened and how to put it right.
3. **The read-only line in an input's window when the record has gone with a moved man** (K10-d; the drawer's picture
   `raptor-port/docs/mock/2026-11-28-msq-k10-q1/q1-2-choiceA-read-only-proposed.png`, its draft "Ranger has moved to 149.
   Only Ranger, 149's admins or a master admin can change this."). Today's read-only line says "Only Ranger or an admin
   can change this." — untrue for an admin of the old squadron. Draft it, and say whether today's line needs the same fix
   elsewhere.

For each: the draft, one alternative, where it sits (file and the words beside it), the facts it must keep, and anything
you were unsure of. Every person named in an example carries his role in brackets after the name on every mention
("Hunter (142's admin)").
