# The walker's brief — the small OIL job, the helper's share (14 Oct 26)

You WALK the running app and report what you SAW. You do not read source code to find bugs, you do not decide whether
a finding is real, and you change nothing under `raptor-port/src`, `raptor-port/e2e`, the documents or git. You write
only: your own scripts `raptor-port/scripts/handpass/ou-h-<n>.mjs`, pictures under
`raptor-port/docs/img/handpass/2026-10-14-oil-uncancel-load/H/`, and ONE results file
`raptor-port/docs/handpass/parts/ou-H.results.md`.

**Read first:** `raptor-port/docs/walk-scripts.md` (how a walk script is written and what each trap has cost), then the
scenario list `raptor-port/docs/superpowers/briefs/2026-10-14-oil-uncancel-load-scenarios.md` — its recipes, and the
scenarios named below with their EXPECTED and DISPROVES lines.

## The build and the tools

- The app is ALREADY SERVED at `http://localhost:4174/`. **Do not build, do not start or stop a server, do not run
  `npm test`, `npm run build`, Playwright's test runner or anything that writes `raptor-port/dist`** — the build must
  not change under you, and the PC's one lock is held by the host.
- Run every script from `raptor-port/` as
  `DL_BASE=http://localhost:4174 DL_SHOTS=docs/img/handpass/2026-10-14-oil-uncancel-load/H node scripts/handpass/ou-h-1.mjs`
  (Git Bash). Write scripts with the Write tool — a shell heredoc holding an apostrophe fails here.
- **Start from the host's library `scripts/handpass/ou-lib.mjs`** (read it whole; `ou-walk.mjs` and `ou-walk-2.mjs`
  show it in use): `L.world('desk' | 'phone')` gives a fresh browser world signed in as the admin (Saber, `ad` / `a`);
  `file`, `mark`, `moveDate`, `fixture` (an input cancelled or marked ⓘ on a Saturday with no OIL answer), `uncx`,
  `rowBtn` (the board row's `grcx` / `grinfo` / `grdel` buttons), `sheet` (the OIL question), `bar` (the "not answered"
  bar), `list` (the day's one list), `makeHoliday`, `loadVersion`, `noteNow` (the passing note), `rec` (the input as
  saved), `part` / `rowOut` (a PASS / FAIL row), `L.pic` (a picture). `scripts/handpass/lib.mjs` has
  `publish(page, di)` (call it with the Scheduler Board open on that day) and `lwCell(page, [personId], iso)` (the
  Leave War's cell). The demo week is 13–19 Jul 2026: day index 2 = Wed 15, 4 = Fri 17, 5 = Sat 18. People ids:
  `bane` = Ranger (the seeded member account `us` / `us`), `pike` = Nomad, `stiff` = Saber (the admin).
- **A member's side is the SAME browser world:** sign out with the top bar's Logout and sign in through
  `#luser` / `#lpass` / `#loginForm button[type=submit]` — a new `L.world` is a new, empty world.
- Every assertion's note prints the value it judged. A script that cannot act reports NOT WALKED with the reason —
  never a guess. Take a picture at every judged step.

## Your scenarios, in this order (stop after about ninety minutes and report what is left NOT WALKED)

S11 · S12 · S9 · S13 · S20 · S21 · S22 · S17 · S16 · S14 · S15 (the admin's drag half only) · S23 · S27 · S28 · S29.
Walk each at a desktop's size; S11, S13, S20, S22 and S27 at a phone's size as well. Where a recipe needs "the day made
a public holiday", use `makeHoliday` on Fri 17 Jul for an input filed on that Friday.

## The three conditions every walk brief carries

1. The host opens the pictures behind every FAIL and behind every high-consequence PASS (OIL, a published day, a
   role, saved data) — so name each picture in its row.
2. A scenario with an EXPECTED line is judged PASS or FAIL against that line. "RECORDED" is only for the parts the
   scenario itself marks RECORD — there, write exactly what the screen showed and said.
3. Your conclusion is a finding only after the host reproduces it: give the exact steps, in the app's own words for
   its buttons, so they can be repeated.

## What to return

`docs/handpass/parts/ou-H.results.md`: one table row per scenario part — scenario · size · what you did (the presses)
· EXPECTED · what you SAW (the words on screen, the saved values) · PASS / FAIL / RECORDED / NOT WALKED · the
picture's file name. Then a short list: every FAIL with its steps; everything NOT WALKED and why; anything on screen
that looked wrong though no scenario asked. Your final message is that same summary (not the scripts).
