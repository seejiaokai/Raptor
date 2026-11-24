# Walker brief — w14, chat 174 (host), the night of 24–25 Nov 26

You are a fresh Opus walker. You walk ONE part of w14 (your part is named in your first message: w14a, w14b, w14c or
w14d). You drive the real built app in a real browser and record what the screen says. You do not change any file under
`raptor-port/src`, you do not build (`npm run build` is forbidden: the build is already made and other work rests on it),
you do not commit, push or merge, and you never kill a process by name — stop only the server you started, by its port.

Checkout: `C:/Users/User/projects/Raptor/.claude/worktrees/lw-balances-hover-275293` (branch
`claude/allavail-sans-postout-141`). Paths below are relative to its `raptor-port/`. The build to walk is `dist/` as it
stands (bundle `assets/index--V1bS7d_.js`, built from commit `f3f0e7388` + `e80742fc5`). Serve it with
`npx vite preview --port <your port> --strictPort` from `raptor-port/`, started in the background by its full path.
Ports: w14a 4811, w14b 4812, w14c 4813, w14d 4814 — never 4700–4719. Prove first that the served page loads that bundle.

## Read first, in this order
1. The plan: `docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md` — §0, §0b, §1 (the common world), your part's
   row in §3 and its traps, every scenario your part lists (sections A, B, C, D, E), and the §2 probes your part needs.
2. `docs/walk-scripts.md` — the head and every trap it lists; follow it for how a script, its table and its pictures are made.
3. The earlier walkers' brief `docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md` — its set-up and §"The words
   to expect" (reuse its libraries `scripts/handpass/swd-w1{1,2,3}-lib.mjs` and the ones the plan names; copy, never edit them).
4. Before writing any EXPECTED that rests on a ruling the plan does not quote in full, read that ruling's full row:
   `grep -h '^| D2564 |' ../.claude/decisions-full/*.md` (shell grep).

## Your probes come first
Prove each route your part needs (the plan's §2: P1–P14, as your part's row lists) by a short script that passes, on this
build, before any scenario uses it. Append each proved route as a recipe — the exact presses, the selectors, what it reads
back — to `D:/raptor-work/c174-walk/recipes.md` (shared with the later parts; read what earlier parts put there first and
reuse it). A probe that finds NO door: the scenarios needing it are NOT WALKED with that reason, never FAIL.

## How to record
- One table `docs/handpass/parts/swd/<part>-walk.md`: a row per step — id, size (desktop / phone), what was pressed,
  EXPECTED (with its source), what the screen SAID (exact words, read from drawn elements, never `innerText`), PASS / FAIL /
  RECORDED / NOT WALKED, the picture's file name. A step whose expectation is "NOT RULED" or a ruling NOT BUILT (plan §0b) is
  RECORDED with the exact words, never FAIL.
- Scripts `scripts/handpass/swd-<part>*.mjs` (a version line printed at each run; never rewrite and run in one step).
- Raw pictures `D:/raptor-work/c174-walk/<part>/`; every picture that decides a PASS, FAIL or RECORDED row copied, cropped to
  what matters, into `docs/img/handpass/2026-11-24-sans-words/<part>/`. Phone: a picture within about 100 ms of each tap's lift
  beside the settled one. Open each deciding picture yourself before the step counts.
- Console errors, page errors and 4xx responses watched on every page; each listed.
- The order's lessons (plan §5): your table ends with one line per lesson that touches your part — the step that covers it.

## Not a finding (never report these as faults)
A problem only in data already stored, when the code is right going forward (D56); anything needing a scheduler who is not
an admin (D785); the demo's own unsaved weeks naming a man (D2394 Q8); WebKit's "Couldn't save that document" note; a ruled
behaviour listed NOT BUILT in plan §0b. A case no ruling names: RECORDED, with pictures, put to him (his D2611) — never judged.

## Faults
A FAIL is a fault only once you have reproduced it twice in a fresh browser context, with its picture opened. For each:
the steps, what it said, what it should say and the ruling, the picture. Do not fix it. Stop after three failed tries at one
gesture and record it as NOT WALKED (route not found), with what you tried.

## When you finish (or at about 1.5 hours, whichever first)
Stop your server by its port. Write your report to `D:/raptor-work/c174-walk/<part>-report.md`: counts (steps, PASS, FAIL,
RECORDED, NOT WALKED), each fault in full, each RECORDED finding-candidate (cases the plan flags — C7, C11, D1's order,
A2, A5, A10, B9 — and any other the screen showed), what was not walked and why, the probes proved. Your final message:
five lines at most — the report's path, the counts, the faults in one line each.
