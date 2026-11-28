# Section 1 (the guard rail) — the drawings for questions 24 and 25 (chat 204, 27 Nov 26)

**A drawing job: pictures of the real app for two questions put to the owner. No file under `raptor-port/src`
changes.** He is not technical, so the pictures and the cards' words are written for him
(`.claude/rules/plain-language.md`; the rulings D2164, D2439 and D1222 on the general rulings page, §Showing him,
asking him). The shape is the one used for questions 19 and 20 (`2026-11-26-msq-s1-q19-20-draw-brief.md` and its
report). Read that brief whole first; where this brief is silent, its rules hold: the lock, the port, the 2× crops,
the teal ring, three squadrons in the picker, and looking at every picture.

## Where you work — a copy of your own

The section's working copy has another builder's unfinished changes in it, so **never build from it**. Work in the
isolated worktree you were started in, at commit `7d4965c72` (K5 landed):
1. Check with `git log --oneline -1`.
2. Link `raptor-port/node_modules` to the section's copy as a directory junction rather than installing:
   `cmd /c mklink /J raptor-port\node_modules C:\Users\User\projects\Raptor\.claude\worktrees\lw-balances-hover-275293\raptor-port\node_modules`.
3. Remove the junction (`cmd /c rmdir raptor-port\node_modules`, never a recursive delete) before you finish.

If your copy is lean, fetch the pictures you need with `node raptor-port/scripts/lean-copy.mjs get <folder>`.
Write your scripts, pictures and report at the places below **inside your own copy**. A guard may refuse writes
into another worktree. Leave them uncommitted; the orchestrator copies them across. Give the full path of your copy
in your reply.

## Question 24 — the view switch's two cases he has not seen

**24A — the words of the question on the way back.** Saber, at 1536×864:
1. Sign in as `ad` / `a`.
2. Press the badge: the member view.
3. Open the Tracker and make an unsaved chart edit. K5's report says how: `2026-11-27-msq-s1-k5-report.md` §B15, and
   the test `src/ui/msq-guard-doors-switch.test.tsx` B15. A new test event is an edit that does not save at once.
4. Press the badge.

The Tracker asks "You have unsaved chart edits on “…”. Save them before switching back to the admin view?". This
wording was read by a fresh reviewer but never drawn for him.

Pictures: the whole screen, and a crop of the question with the badge in sight. For comparison, a crop of the
question the other way, "…before switching to the member view?", which he approved as drawn on 24 Nov. Reach it the
same way, from the admin view.

**24B — the chart editor at the switch, on his own squadron.** Saber on 142, at 1536×864:
1. Open the Tracker.
2. Press "Edit chart layout" and move nothing.
3. Press the badge.

What happens today: the member view comes up and the chart editor stays open. Picture it before and after.

For comparison, what his answer of 26 Nov already does for someone who works another squadron: Hunter (`hu`, his
password from the seed files) with 149 picked, the same steps. The editor closes and the Tracker goes to his own
squadron. Picture it after.

The proposed picture for Saber: his Tracker in the member view with the editor closed. This is the state the Hunter
picture shows, so draw it on 142 as the app draws a closed editor: the same steps, then press "Done editing chart"
before the badge, and say so in the caption.

## Question 25 — "Add a person" when his own move lands at midnight

A master admin can move himself to another squadron from a set day. Draw it at 1536×864.

The state: Saber's own move from 142 to 150 is set for today, with "Add a person" open on 142's Users and a callsign
typed. A fault found on 26–27 Nov gives the steps that reach it:
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread6/opus1/zz-opus1-proof-2.test.tsx`
and the report beside it. On the running app, reach it the way the walk scripts reach a midnight move:
`raptor-port/docs/walk-scripts.md`, and the midnight walks under `raptor-port/scripts/handpass/` (search for
`midnight` or `00:00`). If no script can move the clock, say so, and draw the state by the nearest real presses.

Pictures:
- **(a) today:** after the move, the form still open with his words. Press Add: the man is added to 150 and nothing
  is said. Picture the form before Add, and the toast and 150's list after it.
- **(b) the look this would copy:** the Input window held at his own midnight move. It carries a band across its
  top, "This change could not be saved.", and a Close button, his words still visible under it. Reach it as
  `src/ui/msq-fix-sched-windows-midnight.test.tsx` does.
- **(c) proposed:** the "Add a person" form with that same band across its top and Close; Add does nothing; his words
  still there. The form is not built that way yet. Draw it on the real page as the mock-up guide shows, by a small
  overlay the script adds in the page, copying the Input window's band (its look and words) exactly.

Name it as drawn, not built.

## Where things go

- Scripts: `raptor-port/scripts/handpass/n204/` (one script per question; reuse `draw-s1-lib.mjs` from
  `…/n191/` as the 19–20 drawer did).
- Pictures: `raptor-port/docs/mock/2026-11-26-msq-questions/q24-25/`, named `q24a-…`, `q24b-…` and `q25-…`.
- **Draft cards**, in your report: 24 (two parts, A and B) and 25. Each card has:
  - one line on when this happens in real life: who is doing what, and how often;
  - what he sees today;
  - the recommendation and why, in one plain sentence;
  - the other answer;
  - which pictures go with it.

  For 24A, the recommendation is to keep the words as written. For 24B, it is that the editor closes on his own
  squadron too. **Say in the card that this is the builder's reading of his 26 Nov answer**, which was asked about
  someone working another squadron. For 25, recommend the Input window's look, the same band and Close: one rule
  for every window open across his own midnight move. The other answer for 25: the man added to the squadron the form
  was opened on, 142, with the toast saying so.

  Plain words only: no row ids, file names or ruling numbers.

## Running it

- Take the checks lock first, as the 19–20 brief says, with
  `take "claude/msq-s1-guard-6ae5e1 — drawings for questions 24 and 25"`. If it is held, check every five minutes
  for up to 40 minutes; still held → stop and report NOT RUN.
- Use port 4741, and check it is free first.
- Release the lock the moment the last picture is taken. Stop the server by its port.
- Look at every picture you made, with the Read tool, and say what you saw.

Do not commit, do not push, do not edit `HANDOFF.md`, the plan or anything under `raptor-port/src`.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-q24-25-draw-report.md`

The report gives:
- each picture's path and what it shows;
- how each state was reached;
- anything that went differently from this brief;
- the draft cards;
- what you could not draw, and why.

End your reply with the report's path and one line: are its pictures ready.
