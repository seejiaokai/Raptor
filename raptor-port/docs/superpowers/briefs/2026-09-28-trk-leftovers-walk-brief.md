# Walk brief — the Tracker leftovers (28 Sep 26)

You are a WALKER. The fixes are built; your job is to drive the REAL production build like a person
and report, with pictures, whether each behaviour is right — and to find what is MISSING. You do not
fix app code. The repo is the worktree `C:\Users\User\projects\Raptor\.claude\worktrees\tracker-palette-prompt-a0c90f`
(the app in `raptor-port/`; shell: Git Bash; use full paths).

## The ground rules
- The production build of this branch is ALREADY served at **http://localhost:4175**. NEVER run
  `npm run build`, `vite`, start or stop a server, or run a full test suite (the PC has one lock).
  Other walkers use the same server at the same time in their OWN browsers — fine.
- Drive it with Playwright scripts (Node ESM `.mjs`) that import `raptor-port/scripts/handpass/trk-lib.mjs`
  (read it: `open`, `login`, `logout`, `toTracker`, `toPage`, `shot`, `core`, `dlg`, `reveal`, `save`, `log`).
  Run from `raptor-port/` with
  `HP_URL=http://localhost:4175 HP_SHOTS=<repo>/raptor-port/docs/img/handpass/2026-09-28-trk-leftovers/walk HP_OUT=<repo>/raptor-port/docs/handpass/parts/trk-leftovers/walk node scripts/handpass/<script>`.
  Name your scripts `raptor-port/scripts/handpass/trk-lo-2<letter>-<topic>.mjs` (your letter is in your task).
- **Write each step as an assertion of the RIGHT behaviour** (a PASS means correct), with `log().ok(step, cond, said)`,
  so re-running the script later IS the re-walk. End with `save(...)` and exit 1 on any FAIL.
- Drive like a person: the app's own buttons, real typing (`page.keyboard.type` with delays where "slow typing"
  matters), real mouse presses at real positions, the wheel/drag to scroll. Never inject state. Reading the store
  via `core()` to CHECK what the screen claims is allowed. A state you cannot reach through the app IS a finding.
- **Every picture you cite, you open (Read it) and say what it shows.** A step that asserts a class or number
  with no picture of the thing does not count. Name pictures `lo-2<letter>-<n>-<what>.png`.
- Watch console errors, page errors, failed requests and native dialogs (trk-lib collects them); any is a finding.
- Logins: admin `ad`/`a` (Saber, person `stiff`), member `us`/`us` (Ranger, person `bane`), member `hex`/any
  password (person `rocky`). The Tracker is the same for everyone (D121).
- Trap in trk-lib's `dlg({ok:false})`: it presses the first button matching /^(Cancel|No|Keep)/ — on the + Add
  picker that can hit a roster name like "Nomad". Press `#dlgCancel` / `#dlgOk` by id instead.

## What was built (read these for detail)
- The plan and its §6 (what changed after the red team): `raptor-port/docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md`.
- The owner's rulings for this work: `.claude/rules/decisions/tracker.md` rows **D370–D376** (and the older rows below them).
- The two reviewers' scenario lists — your ORDER LIST: `raptor-port/docs/handpass/2026-09-28-trk-leftovers-fable-plan.md`
  (PART 2) and `raptor-port/docs/handpass/2026-09-28-trk-leftovers-astra-plan.md` ("Scenario list").
- The baseline walk before the fixes (what used to happen): `raptor-port/docs/handpass/parts/trk-leftovers/baseline/*.json`
  and its pictures in `raptor-port/docs/img/handpass/2026-09-28-trk-leftovers/baseline/`; its scripts `scripts/handpass/trk-lo-00-*.mjs`
  are good starting points to copy.

## What to return (your final message)
1. A table: scenario | PASS / FAIL / COULD NOT REACH | what the screen said (numbers, words) | picture names.
2. **Findings** — anything wrong or missing, each with the exact steps to reproduce it, what you expected, what you
   saw, and its picture. Say whether it is new (compare with the baseline walk's pictures/logs where you can).
3. Console / page errors seen.
4. The scripts you wrote. Do not commit anything.
