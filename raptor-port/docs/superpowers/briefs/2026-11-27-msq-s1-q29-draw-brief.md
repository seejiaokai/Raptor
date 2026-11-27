# Section 1 (the guard rail) — the drawings for question 29, "could we go without the block" (chat 204, 27 Nov 26)

**A drawing job: pictures of the real app for one question put to the owner. No file under `raptor-port/src`
changes.** Use the shape of questions 24 and 25. Read `2026-11-27-msq-s1-q24-25-draw-brief.md` whole first, and the
q19–20 brief it names. Where this brief is silent, their rules hold:
- your own worktree, with `node_modules` linked by a junction and the junction removed at the end;
- the checks lock for the build, and the port;
- 2× crops with the teal ring;
- three squadrons in the picker;
- look at every picture you make.

Reuse `scripts/handpass/n204/q-lib.mjs` and `q2425-lib.mjs`. Your worktree should be at commit `a4da35a37` or later;
check it. Write your script to `raptor-port/scripts/handpass/n204/draw-q29.mjs`, your pictures to
`raptor-port/docs/mock/2026-11-26-msq-questions/q29/`, and your report to
`raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-q29-draw-report.md`, all **inside your own copy**. Leave them
uncommitted, and give the full path of your copy in your reply. **Another drawing helper (question 27) may hold the
checks lock. Wait for it; never build alongside it.**

## The question

The owner asked whether the app could go without the block. Today a pick of another squadron (and the member-view
switch, and a bell line to another squadron) is refused while something is open with typing in it. A grey note under
the control says "Blocked: …". The proposal is to let the press go through: the open row closes, its typing is
dropped, and the other squadron comes into view with no note. This matches his answer 26 B, where a bell line opens
over the typing and the typing is lost.

## The people

Kestrel is 149's admin, sign-in `ad9`. Check the password in `src/state/accounts.ts` and the seed. Osprey is a 149
member.

Kestrel must be able to pick 142. If the seed gives him no right in 142, first sign in as Saber (`ad` / `a`, master
admin) and give Kestrel Plan of 142 on Admin → Users. Say in the report what you did.

## The pictures — each at a desktop's 1536×864 AND a phone's 390×844

1. **29-row-today.**
   1. Kestrel on 149 opens Admin → Users and opens Osprey's row.
   2. He types "osprey" in its sign-in box. Do not save.
   3. He picks 142 in the squadron menu. On a phone, use ☰ and its squadron list.

   Picture the result: 149 still in view, the row still open with "osprey" in it, and the grey note
   "Blocked: save or cancel the open row, then pick 142." (or whatever it says; quote it exactly). Take a whole
   screen and a crop of the note with the row in sight.
2. **29-row-proposed**: the same press with the pick going through.
   - Reach the end state by real presses: press the row's Cancel, then pick 142.
   - The picture is 142 in view on the page the pick lands on, no note, and Osprey's row gone with its typing.
   - The caption must say plainly that this is how the proposal would look, reached here by Cancel and then the pick.
   - Take a whole screen and a crop with the squadron number in the top bar.
3. **29-window-today** and **29-window-proposed**.
   1. Kestrel on 149's Edit Schedule opens "Who's available" (ALL AVAIL).
   2. He picks 142.

   Today the window closes by itself and the pick goes through (his D2596). Picture the window open before the pick,
   and 142 in view after it. Say in the report that today and the proposal are the same here: a window that only
   shows things simply closes.

If a step cannot be done as written, picture what you found instead and say so. Never force a state through the
developer's bridge without saying so in the caption. Draw nothing else.

## The report

For each picture, give:
- its file and its size (desktop or phone);
- one plain caption: who is doing what, what he pressed, and what the screen shows;
- whether it is the real app as it is today, or the proposal reached by Cancel and then the pick.

Then reply in under 120 words.
