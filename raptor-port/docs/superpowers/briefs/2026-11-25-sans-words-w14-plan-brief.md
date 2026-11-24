# w14 planning brief — chat 174 (host), the night of 24–25 Nov 26

You are a fresh Opus helper. You plan a walk; you do not walk it, build anything, or change any file in the repo.
The only file you write is `D:/raptor-work/c174-w14plan/w14-plan.md` — write it as you go, so nothing is lost if you stop.
Your final message: three lines — where the file is, how many scenarios, anything you could not settle.

Repo checkout (read only for you): `C:/Users/User/projects/Raptor/.claude/worktrees/lw-balances-hover-275293`
(branch `claude/allavail-sans-postout-141`, pull request 825). Paths below are relative to its `raptor-port/`.

## The job being checked
The new SANS words and rules on the bell and the SANS calendar (round 7 of this branch): his rulings D2388, D2390, D2391,
D2394, D2420, D2421, D2437, D2560, D2561 (recorded, mostly NOT built — check), D2562, D2563 (not built), D2564, D2565,
D2566 (not built), D2568. Read each one's full row before writing an EXPECTED line that rests on it:
`grep -h '^| D2564 |' ../.claude/decisions-full/*.md` (shell grep — the Grep tool hides long rows). The scheduler
page `../.claude/rules/decisions/scheduler.md` §Crew and pucks and §History and undo states them as they stand.
The evidence sheet is `docs/handpass/2026-11-22-allavail-sans-posted.md` §18 (the roll-call R1–R21 is there).

Three walks were already done on earlier builds: w11, w12, w13 — their tables `docs/handpass/parts/swd/w1{1,2,3}-walk.md`
(large: grep them for scenario ids and headings, never read whole). w11–w13 walked Astra's 24 scenarios
(`docs/superpowers/briefs/2026-11-24-sans-words-scenarios-astra.md`). Fable's 24 scenarios and 12 open points are
`docs/superpowers/briefs/2026-11-24-sans-words-scenarios-fable.md`. The earlier walkers' brief:
`docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md` (reuse its set-up: the clock, sizes, sign-ins, ports).

Since those walks, five rounds of fixes landed (each its commit; read `git show --stat <id>` and the commit message,
and the builder's report where one exists):
- round 1: `f73602f9f` (the four reads of 0eaacc411, walk faults W11-1 and W12-1)
- round 2: `2391f9dfa`
- round 3: `0e59ea5f3` (report `docs/superpowers/briefs/2026-11-24-sans-words-fix3-build-fable.md`)
- round 4: `264a1f3d4` (report `…-fix4-build-fable.md`; the claims `…-reread4-claims.md`)
- round 5: `1d2ed3415` (report `…-fix5-build-fable.md`) — one shared definition of "planned" (D2564, D2568)
- also `41c811259` (a man whose hand tick came off with his posting still ahead) and `330ded7df`.
Tonight main was brought in (`f3f0e7388`): chat 170's words pass round 4 (his D2521) now shares the bell with these
lines — a changed input's line says "LL changed to OL", "Now LL (AM)", "…, and 1 more change".

## What w14 must cover (write each as a scenario with steps and an EXPECTED line)
A. Every Fable scenario that no w11–w13 table already covers — for each of Fable's 24, one line: COVERED by <w1x id>
   (name the row) or NOT COVERED → a w14 scenario. Its 12 open points: say which a walk can show and make those
   scenarios; the rest say "his question, not a walk".
B. A re-walk of every fix of rounds 1–5 that a person could see on screen, at BOTH sizes (desktop Chromium 1536×864;
   his iPhone in WebKit 402×874, by touch). One scenario per fix, or grouped where one sequence shows several. A fix
   only a test can show: name the test and say why no screen shows it.
C. D2564 and D2568 on each side, for a SANS man planned with nothing filed on that day: on a ground row only, on a duty
   desk only, on a flight (cockpit seat), on a sim, on a cancelled flight (CX), on a flight row with no times yet. What
   counts lights the reminder and names the day; what does not, never does (and D2565: his own deleted filing).
D. The merge: a SANS bell line beside one of the words pass's changed-input lines in the same bell (order, look, the
   unread mark, a tap on each) — two or three scenarios.
E. The plain-user round (order §7.0a) for the bell and the SANS calendar, short, on this build.
Each EXPECTED line rests on a ruling's words (cite it) or the drawing page `docs/mock/2026-11-24-sans-words/`;
never on what the code does. Where the rulings do not say, write "NOT RULED — record what the screen says" (his D2611:
a case his rulings do not name is put to him, never guessed).
Not a finding (put this in every walker part you draft): a problem only in data already stored, when the code is right
going forward (D56); a scheduler who is not an admin (D785).

## Then
Group the scenarios into walker parts that one Opus walker each can do in about 1–1.5 hours, both sizes, and say for
each part: its scenarios, how many steps roughly, what it needs set up. Read `docs/walk-scripts.md` §the head and its
traps list, and the order's lessons list in `docs/bug-check-checklist.md` "The lessons of §7.11": for each lesson,
the scenario that covers it or why it cannot apply (one line each).
