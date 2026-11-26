# The posting sheet, redesigned — a fresh Fable through the design skill (chat 188, 26 Nov 26)

You are a fresh Fable (latest, high). His words, through the design skill, of round 6's N6 picture (the Post out sheet
hung under Cinch's row on Admin → Users): *"can we redesign this post out page. Likewise for leave war. It's so ugly"*
— his ruling D2648 (full row: `grep -h '^| D2648 |' .claude/decisions-full/*.md`). One design for both doors. He is not
technical, reads on an iPhone, schedulers work mostly at a desk (D820). You design and draw; you build nothing.

## Where and how
- Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (`git -C`; never switch, commit or push).
- Load the design skill first: Skill tool, `impeccable`, args `critique and redesign the Leave War's posting sheet (Post out / Post in) — target raptor-port`; run its setup (`context.mjs`), Operate mode. The app's look: the Raptor style made cleaner the way Apple's are (D821); smooth motion counts (D991); button sizes do not change without his word (D487); the screen-design rulings `.claude/rules/decisions/design.md`; the guide `raptor-port/docs/design-practices.md` (§9 his lessons — 68, 103, 104 at least).
- His rulings on postings (full rows by the shell): D309, D310, D2087, D2634, D2633, D1626, D1627, D1628, D1541, D1545, D1555, D2243, D2265, D2648; the Leave War page `.claude/rules/decisions/leave-war.md` §Inputs, postings and the schedule and its "From other areas" lines on the posting sheets; People & accounts `.claude/rules/decisions/people-accounts.md` §Many squadrons. What the sheet DOES stays; only its look and layout change. Anything you would change in what it does: say so, never draw it silently.
- The real sheet today: on the served app `http://localhost:4700/` (this folder's `dist`; do not rebuild or stop it; check it serves this folder first), Leave War → a man's day → ⋯ → Post out (and Post in). Picture it as it is today, desktop 1536 and phone 402×874, scale 2. The round-6 drawings that copied it: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/u6-d-postout-sheet-crop.png`, `m6-d-itshim-sheet-crop.png`; how they were drawn: `raptor-port/scripts/handpass/n176/draw-r6-users.mjs`, `draw-r6-misc-d8.mjs`, the world in `…/briefs/2026-11-25-msq-q3-draw-report.md`.

## Do
1. Critique today's sheet (both doors) for his iPhone and a desk: what makes it ugly, concretely.
2. Two or three directions, each in the app's own parts (D1496, lesson 68), each drawn on the real app — the Leave War's
   sheet and the Admin → Users one — at phone and desktop size, with the four outcomes (Overseas Sqn, Delete, SANS,
   Transfer to Sqn and its "To" squadron drop-down), PO from, the line of what happens, Post out; Post in drawn once in
   the recommended direction. Mark what is new with violet dashed rings (2px `#8B5CF6`), as round 6 does.
3. A recommendation, with its cost and the rulings it touches (D754: the right design, not the closest to today).
4. Pictures into `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/` named `p6-*` (whole + `-crop`), scripts
   `raptor-port/scripts/handpass/n176/draw-r6-posting*.mjs`, every new word in `words-r6-posting.mjs` (a second fresh
   Fable reviews them before he sees them, D2441). Open every picture you make.

## Report
Write it whole to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-posting-sheet-report.md`: the critique; each
direction with its pictures and what it changes; the recommendation; every new word; a `FACT` line per picture; what you
could not draw. Reply with a summary under 250 words.
