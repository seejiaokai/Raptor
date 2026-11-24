# [MSQ-PICK-GUARD] Build 1's plan — the writer's brief (chat 175, the night of 24–25 Nov 26)

You are a fresh Fable helper writing ONE document: the build plan for Build 1 of the guard rail — parts A, B and F of
the sizing file. You build nothing: change no file under `raptor-port/src`, run no build and no test suite, commit
nothing, push nothing. Work in `C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`, `main` brought
in tonight) by full path — your shell may start in another folder, which you must not write to.

## What you write

`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` — and nothing else in the repo. It will be
red-teamed tonight by three readers, each blind to the others (Astra, a fresh Opus, a different fresh Fable), then
built by a later chat on the owner's go. So it must be exact enough to build from and to attack: every claim about
today's code carries its file and function, checked by you in the code tonight, never taken from the sizing file's
word.

## Read first (the shell's grep for a ruling's full row — the Grep tool hides long rows)

1. `HANDOFF.md` — the `claude/msq-b1-screens-135` block: "THE NIGHT OF 24–25 Nov 26" and "CHAT 171".
2. `OUTSTANDING.md` — `[MSQ-PICK-GUARD]` and `[MSQ-NIGHT-153-OPEN]` (item (1): security F1, F2 and the reader's two
   leads — part F).
3. The full rows: `grep -h '^| D2403 |' .claude/decisions-full/*.md` — likewise D2405, D2590, D2591, D2592, D2593,
   D2594, D2595, D2402, D148, D350, D731, D1622, D1645, D1667, D1668, D2322, D2323, D2389, D2318.
4. The sizing file `raptor-port/docs/superpowers/plans/2026-11-24-msq-pick-guard-build.md` (parts A–H; yours are A, B,
   F); the pressing report `…/briefs/2026-11-24-msq-pick-guard-press-report.md`; the combined scenarios
   `…/briefs/2026-11-24-msq-pick-guard-scenarios.md` (its §2 H1–H13 and §3) and, for the rows that touch A, B, F, the
   scenario text they name in `…-scenarios-fable.md` and `…-scenarios-astra.md`; the words read
   `…/briefs/2026-11-24-msq-pick-guard-words2-fable.md`.
5. The rules a build follows: `.claude/rules/raptor-executor.md`; `raptor-port/CLAUDE.md`; the area pages
   `.claude/rules/decisions/people-accounts.md` (§Many squadrons), `inputs.md`, `leave-war.md`, `tracker.md`,
   `scheduler.md`, `design.md` (the passing note, questions, menus and the keyboard); the ripple map
   `raptor-port/docs/feature-impact.md` (the sections for the squadron pick, the bell, the member view, the passing
   note); `raptor-port/docs/bug-check-order.md` §8 ("left as it is today" pinned by a test before the changed half)
   and §7.11 (the lessons — check the plan against each).
6. A model for the shape and depth: `raptor-port/docs/superpowers/plans/2026-11-24-trk-press-reshape.md` §3–§6 (read
   those sections, not the whole file).
7. The code itself — every file the sizing file's §1 and its parts A, B, F name, and whatever they lead to.

## What the plan must hold

1. **The promise, in his words' terms** — what a person sees after Build 1 and what stays exactly as today (Builds 2
   and 3 are not yours: Logout's questions (C), the refresh card and the removal of the greyed windows (D), Undo by
   squadron (E), the Undo wordings (G)). Say plainly what Build 1 leaves half-way — e.g. the greyed windows and their
   bands still exist for a change he did not make until Build 2 — and why that interim state is safe to merge or must
   not be merged alone.
2. **Part A — one answer to "what is open".** The complete list of windows, found by YOU in the code (not copied from
   the press report's table): each with its file, how it opens and closes today, where its open-flag lives, and how it
   registers with the new guard. Name the design: a registry each window joins and leaves, or one function that asks
   each existing flag — choose, and say why the other breeds faults (the missing-call-site risk: a window added later
   that never registers; the Tracker's windows, known only inside the Tracker's own code). Name the test that fails
   when a window is added without registering. An opened Admin → Users row with typing (D2595) and a change not saved
   (D2594, `ui/savestatus-source.ts readFailed()`) are answers of the same function.
3. **Part B — the three doors refuse.** The pick (`state/pick.ts pickSquadron`; the bar's list and the ☰ menu's), the
   view switch (`state/store.ts switchRoleView`, both ways), a bell line and a bell tap (`state/belltap.ts
   enterForLine`, `openBellRequest`; `ui/topstate.ts bellTap`, `openNotice`) — and EVERY other way the squadron in view
   or the view can change by his own press: find them all (a page tab that enters his home squadron, a link, a key, the
   Scheduler Board, "Back to the admin view" chips, any `enterSquadron` or `switchRoleView` caller) and give each a row:
   refused by the guard / must not be, because… / MISSING. No blank cells. The order of the checks at each door (a
   refusal always before the Tracker's question); the Tracker's question at the view switch, both ways (words N7 of the
   words read); the note handed to the control pressed — how `ui/toast.ts placeToast` learns the control, on a desktop
   and on a phone (D2590), and what it does at the sizes between.
4. **Part F — the Input window records the input's own squadron** (security F1, F2): what is recorded, where, what
   every read of "the page's squadron" inside the window becomes, the two doors closed, the two leads.
5. **For each part: the failing tests, named first** — the test file (new or existing), each test's name and its one
   line of what it asserts, in the order they are written; then the change, file by file, function by function. Unit
   tests that drive the real stores and components where the repo's own tests do; say which need a browser test.
6. **The twin paths, listed** — for every behaviour, its twins, each with its own test: the bar's picker and the ☰
   menu's; a bell line and a tap on the bell itself; to and from the member view; mouse, touch and keys; desktop and
   phone; an admin at home, an admin by Plan, a master admin, a member with View; 142→149 and 149→142.
7. **What must stay as today**, each pinned by a test written BEFORE the changed half: a pick with nothing open; the
   Tracker's question at a pick, its three answers; menus and lists closing as today; the squadron already in view
   picked; a change he did not make (until Build 2); "Not kept" blocking nothing; sign-out.
8. **The open questions as switch points.** The owner has NOT answered H1–H13 or the host's calls of the scenarios
   file §3 that word a note or read what a ruling covers (his D2611: none is built on the agent's own reading). Build 1
   waits on H2 (what counts as a window), H3 (how far the Users row reaches), H7 (a refused tap on the bell itself),
   H8 (a save still going), H11 (where the note stands; the ☰ menu after a refused pick; D731 (1) against D2590), and
   on: which reason the note names first when two apply; a refused bell line left unread with its list open; the
   row's press refused rather than the list's opening; the adjusted words (R3, N3a, N3b, N4 of the words read). For
   each: the recommended answer, exactly what in the plan changes if he answers the other way (which tests, which
   lines), and how the code is shaped so that either answer is a small change — a table of windows with a flag each,
   never a rule scattered through the files. Mark every sentence of the plan that words a note as "words not settled".
9. **The overlap with other open work, named:** pull request 840 (the speed readout — it changes `ui/FloatWindow.tsx`,
   `ui/topbits.tsx`, `state/view.ts`, `ui/boardescape.ts`; it adds a timing readout window — say whether the guard
   counts it and why); pull request 825 and the readings-lapse branch (they change `state/notices.ts`, the engine's
   inputs, the notifications register); the words pass, merged tonight (`state/notices.ts`, `ui/InputsPage.tsx`).
   Read the other branches with `git diff origin/main...origin/<branch> -- <file>`; change nothing.
10. **The build order** — commits small enough that each leaves the app working, the tests of each named; what is
    checked on his PC after each (the touched tests and `npm run build`), and what the FULL check then needs from
    Build 1 (the roll-call's rows this build adds).
11. **The risks, each with how the plan answers it** — at least: a window that opens after the guard has looked; two
    switches at once; a refusal that leaves a half-entered squadron; the note pointing at a control that has scrolled
    or folded away; a refused door that later runs by itself; a guard that refuses with nothing visibly open (a stale
    flag) and how he gets out; the Tracker's own windows; a helper window another branch adds.
12. **Size** — hours per part, as an estimate, said to be one.

## How to write it

Plain, exact prose and tables; code names in backticks; no code blocks longer than a signature. State what you could
not verify. Where the sizing file is wrong about today's code, say so and give the right reading. Do not decide a
product question — name it, with the recommendation and the switch point. Aim for a plan a builder can follow without
re-deriving it, not for length.

## Your hand-back

Your final message, under 400 words: the file written; the three things in the code that most surprised you; every
place the sizing file was wrong; every question for the owner you found that is NOT already H1–H13 or in the
scenarios file §3 (each in one line, with a worked example); what you could not verify. Also write that same text to
`C:\Users\User\AppData\Local\Temp\claude\e2bface01731fdd2\3f35f52f-80e8-41e0-a951-e8a0fa3cf3ab\scratchpad\n175\plan-writer.md`.
