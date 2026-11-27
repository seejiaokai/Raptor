# Section 1, K10 question Q1 — the drawer's brief (chat A211, 28 Nov 26)

**You are a fresh Opus helper drawing ONE question card's pictures on the real app.** You work in a working copy of your
own (the Agent tool's worktree). First: `git fetch origin` and `git switch --detach origin/claude/msq-s1-guard-6ae5e1`
(commit `f5ddbec8c` or later). If `raptor-port/node_modules` is missing, make it a junction to
`C:/Users/User/projects/Raptor/raptor-port/node_modules` (`cmd //c mklink /J`) — never delete through it. Commit nothing,
push nothing. Report as your final reply AND to `raptor-port/docs/superpowers/briefs/2026-11-28-msq-s1-k10-q1-draw-report.md`
in your copy.

## The card (the plan `raptor-port/docs/superpowers/plans/2026-11-28-msq-s1-k10-root-plan.md` §9 — read it)
**Q1 — Ranger's leave, looked at on his old squadron's list after he has moved.** Ranger (member) has leave Tue 14 –
Sat 18 Jul; on Thu 16 Jul he moves 142 → 149, so the leave goes with him to 149 (his D2847). On Fri 17 Jul Hunter
(142's admin) — with NO right in 149 — opens 142's Inputs list; Ranger's (member) leave is still listed for its first two
days; Hunter (142's admin) taps it. Choices: **A (recommended)** it opens read only — everything shown, nothing to
change; **B** it leaves 142's list altogether (142 sees it only on its schedule for those days).

## The pictures — at most TWO (his D2841), each cut to what the question is about, the place marked, the change named
on it in plain words (D1222)
1. **142's Inputs list on Fri 17 Jul**, Hunter (142's admin) signed in, Ranger's (member) leave row marked — today's app.
2. **Choice A:** that leave's window opened read only. Today's app already draws another person's input read only (his
   D364: locked fields as values, no box, buttons dimmed) — draw THAT look for Ranger's (member) leave if a press reaches
   it today; if today's app opens it editable instead, draw a mock-up on the real app in the D364 look (`.claude/skills/
   brainstorming/mockups-on-the-real-app.md`), marked "proposed". (B needs no picture: the row simply gone — say so on
   picture 1's caption.)
Desktop size, at his PC's 125% scaling where it matters (memory note); one phone picture only if it costs nothing more.

## How
- Read `raptor-port/docs/walk-scripts.md` and an existing drawing script in `raptor-port/scripts/handpass/n204/` for the
  shape (a Playwright script on the built app; the repo's browser fallback — `existsSync(CHROMIUM) ? … : {}`). The move:
  set Ranger's (member) posting to 149 from Thu 16 Jul and his leave as the app's own doors make them (Admin → Users /
  the Leave War posting sheet, the Inputs page), or the test world's helpers if no door reaches it — say which.
- Build only under the checks lock: `node raptor-port/scripts/gatelock.mjs status`; if free, `take "<your branch> —
  K10 Q1 drawing build"`, `npm run build`, release at once. If held: wait no more than 20 minutes in total, checking
  every few minutes; then report NOT RUN. Serve with `npx vite preview --port 4743`; stop it by its port when done.
- Pictures to `raptor-port/docs/mock/2026-11-28-msq-k10-q1/`, the script to `raptor-port/scripts/handpass/a211/`. Open
  every picture yourself and check it shows what its caption says.

## Report
The two pictures' paths, each one's caption (plain words), the card text as it should be published (his shape: the
example, every person named with his role in brackets after the name on EVERY mention, what he sees, the one decision,
one-line choices, the recommendation), and anything the drawing found that differs from the plan (for example: what
today's app really does when Hunter (142's admin) taps the row).
