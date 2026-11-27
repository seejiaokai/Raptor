# Section 1 (the guard rail), K10's root under D2834 — the planner's brief (chat A211, 28 Nov 26)

**You are a fresh Opus planner. You write a PLAN only — no source file changes, no commit, no push.** Write it to
`raptor-port/docs/superpowers/plans/2026-11-28-msq-s1-k10-root-plan.md` in this working copy
(`C:/Users/User/projects/Raptor/.claude/worktrees/a211-s1-kr-dd0560`, branch `a211-s1`). Return a short report as your
final reply (what the plan decides, its size in hours, its readings, its questions). Another helper may be writing test
files under `raptor-port/src` in this same copy — do not touch `raptor-port/src`, and do not run `npm run build`.

## Read first
- `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-k10-brief.md` and `…-k10-report.md` (K10 part one, the two
  findings that stopped the root, the patch).
- The root patch: `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_42283f19-a3cf-4e74-917f-0cbbaaf2d7de/s1-chat204/k10-root/k10-root.patch`
  (and whole copies in `k10-full/` beside it). Read it; check with `git apply --check` from `raptor-port/` whether it still
  applies on this branch (then leave the tree as it was).
- `raptor-port/src/state/inputsqn.ts` (`inputSqn`, `letOpenOn`, `INPUT_DOORS`, `listReach`, `pageIsHome`), the window
  `raptor-port/src/ui/InputWindow.tsx`, the bell doors `raptor-port/src/state/belltap.ts` and `ui/topstate.ts openNotice`,
  `engine/inputs.ts inputUnitOf` / `inputSquadrons`, the Medical tab's lister, `state/units.ts` (`homeOn`, `homeChangesOn`).
- The build plan `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` §5 (part F), §16, §21.1.
- The KR plan `raptor-port/docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md` §5 "Where K10's root meets KR"
  and §12's head (D2835–D2838).
- The rulings, whole rows (shell: `grep -h '^| D2834 |' .claude/decisions-full/*.md`): **D2834, D2835, D2845, D2846,
  D2847, D2842** (all 27 Nov), D2621, D2729 (Q8), D2243 (Q7), D2160, D2163, D2261, D2325, D2654 (E5), D2836. And the
  pages `.claude/rules/decisions/people-accounts.md`, `inputs.md`; `OUTSTANDING.md` item `[XFER]`.

## What changed since K10 stopped
K10's root (a window held when the input's own squadron is not the page's) stopped on two doors with no ruling. He has
now ruled both, and more:
- **D2834 / D2845:** at a move, everything of the man still OPEN goes with him — a pending upchit leaves 142's Medical
  tab and shows on 149's; 149's admins see and close it.
- **D2846:** a medical record CLOSED before the move stays on 142's tab and does not move (today it moves to 149's
  Upchit Complete for 30 days).
- **D2835:** a bell line about a request still open, whose man has moved since, brings his NEW squadron into view first,
  then opens it; a request closed before the move stays with the old squadron and opens there.
- **D2847:** leave across the move goes with him — one input, changed by him, the new squadron's admins or a master
  admin; the old squadron's admin no longer may; unapproved leave after the move goes to the new squadron's Leave War;
  leave wholly before the move stays in the old squadron's records.
- D2845–D2847 and D2842 are filed under `[XFER]` (the Transfer step, batch 4) for the tab listings, the Leave War and
  the Tracker.

The coordinator's direction (chat 204's block): the root follows D2834 — `inputSqn` answers the man's squadron NOW for
an OPEN record, not the squadron of its first day. That touches F0's "inputSqn has no clause for who is named" (the
plan §16 finding 2: doors and root never share an answer) — plan it with care; Astra and a fresh Opus read the plan
before anything is built.

## What the plan must settle
1. **What "open" is, per kind of input** — medical (pending upchit vs upchit complete), leave (approved / pending /
   across the move / wholly before), duties and commitments, SANS availability, an input of several people of different
   squadrons. Each answer traced to a ruling, or marked **"the planner's reading"** (never written as his rule — lesson
   32) and listed in one section of readings.
2. **The one answer** — how `inputSqn` (or a new function beside it) gives an open record's squadron; whose move and by
   which day (today's date? the page's "as of" day?); a man moved twice; a move set ahead but not yet run; a group input.
   Keep "the doors and the root never share an answer" true or replace it explicitly, with why.
3. **The two findings closed:** the Medical tab's "Edit input" (an open record on the new tab opens live there for 149's
   admins; a closed one stays 142's — and what that means for the tab's listing today: is changing the listing K10's, or
   `[XFER]`'s with K10 only holding the window right?); the bell line door entering the input's squadron (D2835) — which
   file, which line. Note: `ui/topstate.ts` is chat S2's U2 file — any code there is built only after U2 lands in the
   batch; say which sub-step waits for that.
4. **The root patch:** apply as is, change, or rewrite; its re-points; and NARROW `letOpenOn`'s home clause to K9's
   `aheadAt` (a squadron he is moving to — D2729 Q8's width).
5. **Who may write** — does `inputSqn` feed the save's own gate (permissions)? If D2847 (the old admin no longer may
   change the leave) needs a permission change, say whether it is K10's or `[XFER]`'s, and that any change to who may
   edit gets the security reader (D1411).
6. **KR overlap:** KR closes the Input window at every door (D2825); the root still matters for a window held since
   midnight (closed at his next pick, D2836), bell lines, the Medical tab, Undo/Redo across squadrons. Which lands first,
   and how each re-runs its tests on the other.
7. **Tests, red first:** the list, by file, each seen failing first; the K10 finding tests re-pointed to his answers.
8. **Sub-steps, files, hours;** what can be built before U2 lands (no code in `ui/UsersPanel.tsx`, `ui/topstate.ts`,
   `state/undo-wire.ts`, `undo/timeline.ts`, `state/accounts.ts`, `state/perms.ts`, `state/notices.ts`,
   `state/acctlines.ts`, `state/units*.ts`, `ui/useraccess-model.ts`, `ui/UserAccess.tsx` until it does).
9. **Questions for him, only if a ruling truly does not cover a case** — each as a card in his shape (D2841, D2840): one
   real example, every person named with his role in brackets after the name on every mention ("Kestrel (149's
   admin)"), what he sees, the one decision, one-line choices with a recommendation. Prefer deciding technical points
   yourself.
10. **Risks** — a record saved into the wrong squadron; a record vanishing from both tabs; a window born held where he
    expects it live; the engine's other readers of the input's squadron (OIL, Leave War, the schedule's rows).

`src/engine/` bodies are verbatim ports — a change there is the behaviour change only. Read source by `grep`/`sed` or the
Read tool as you like. Line numbers are a guide.
