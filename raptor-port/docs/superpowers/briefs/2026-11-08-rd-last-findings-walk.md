# Walkers' brief — React Doctor's last findings ([RD-LEFT-1108]), 8 Nov 26, chat 31

You are a Sonnet 5.5 walker for the bug check of pull request 702 (branch `claude/chat22-rd-last-findings`). The host
(Opus, chat 31) sized the walk; you drive the running app with a scripted real browser and report what the screen
said. **You do not read code for bugs, decide whether a finding is real, edit anything under `src/`, commit, push, or
take or release the checks lock** — the host holds the lock for your run. You may read source files only to find a
control's selector or test id.

## What the change is (nothing a person sees should change)

- Part 1: the people-and-settings save layer is now handed, at start-up, the loaders of the accounts, the change
  history's and the bell's seen marks and the flying plan, and every command type those files declare.
- Part 2: Admin → Data's "Period" heading now names its list (a press on the word "Period" puts the keys on the list —
  **the one intended difference, branch only**); "Dates" is a plain line naming the range calendar; Admin → Users'
  "Person" heading likewise; a roster row's open editor and an archived row's editor are now their own components;
  the access screen keeps its caret in the callsign box. The CSS rule for every form heading was widened to the new
  plain line too — no heading anywhere may look different.

**EXPECTED everywhere: the same as `main`'s build**, except the press on "Period" above (and the screen-reader naming,
which you check by the page's accessibility tree, not by eye).

## Read first, whole

1. `raptor-port/docs/walk-scripts.md` — how a walk script is written here and every trap it has cost.
2. `raptor-port/docs/superpowers/briefs/2026-11-08-rd-last-findings-scenarios-astra.md` — the scenario designer's
   report: the fixtures, the inputs, the legend (R reload, T second tab, F `?savefail`, P phone; J is a test, not
   yours), and scenarios S01–S24. Use her exact inputs.
3. `raptor-port/docs/handpass/2026-11-08-rd-last-findings.md` §1 (the rulings each screen must still keep) and §2 (the
   roll-call rows — note which rows your steps prove).
4. The two scripts to model yours on: `raptor-port/scripts/handpass/rss1108-same.mjs` (pictures, both builds, the
   same build twice first) and `raptor-port/scripts/handpass/rss1108-walk.mjs` (values compared, both builds). Use
   `scripts/drawcheck/lib.mjs`'s `serveDist`, `pictureDiff`, `LAUNCH`, its browsers — never a hard-coded browser path.

## The builds and the set-up

- `main` (d8d5b1f57): `C:/Users/User/AppData/Local/Temp/claude/d7cf9849e6f3082c/ac73cab9-43da-4ba7-a2b3-440fee8625ef/scratchpad/dist-main`
- The branch (8b54a2cd5): `C:/Users/User/AppData/Local/Temp/claude/d7cf9849e6f3082c/ac73cab9-43da-4ba7-a2b3-440fee8625ef/scratchpad/dist-branch`
- Never run `npm run build`, `npm run test:e2e` or anything that builds — the other walker is running beside you.
- Your own ports (the other walker uses the other pair): **Walker A 4401 and 4402; Walker B 4411 and 4412.** Check a
  port is free before serving (`Get-NetTCPConnection -LocalPort <n>` in PowerShell); stop your servers by port at the end.
- The clock held at **2026-11-08T09:00:00+08:00** (Playwright's clock), animations off as the model scripts do.
- Sizes: desktop **1536 × 864 Chromium** (his PC runs at 125%: device scale 1.25) and iPhone **402 × 874 WebKit,
  device scale 3, by touch** (tap, never click, on the phone).
- Sign in through the real form (`#luser`, `#lpass`, `#loginForm button[type=submit]`): admin `ad` / `a`, member
  `us` / `us`. Every fixture (Astra's seven people, the taken archived name, postings, the clearing notes) is made
  through the app's own controls, the same way on both builds.
- Run from `raptor-port/`; a background command moves into `raptor-port/` by its full path first.

## Your output

- Script(s) in `raptor-port/scripts/handpass/` (names below); pictures in
  `raptor-port/docs/img/handpass/2026-11-08-rd-last-findings/<your folder>/`; your report in
  `raptor-port/docs/handpass/parts/2026-11-08-rd-last-findings-<walkA|walkB>.md`.
- The report: a table, one row per step — scenario id, build pair, size, what was pressed, what each build's screen
  said (values, words, counts), SAME / DIFF / FAIL, the picture paths. Then: every DIFF or FAIL with its pictures,
  every first-run failure that was the script's own (and how you fixed it), every scenario or part you could not walk
  and why, the console errors, page errors and 4xx seen on each build, and which §2 roll-call rows your steps prove.
- Open the pictures that decide a step yourself before you count it; list every picture by path.
- Lessons to cover in your steps (the sheet's §3 line 4 names them): a picture right after each press; each editor
  opened, closed every way, opened again; after a refusal at a box, tap away, tap it afresh, type the figure it shows;
  every window closed by each of its ways (✕, Cancel, Escape, a tap outside) on the phone and the desktop; side-by-side
  boxes measured one height and one line at both sizes; the list measured heading against rows at both sizes.
- Finish with one line: `Walk: <n> steps, <n> SAME, <n> DIFF, <n> FAIL, <n> pictures`.

## Walker A — the screens (folder `same` and `walkA`)

1. `scripts/handpass/rdl1108-same.mjs <before dist> <after dist> <out> [only]` — `main` twice first (it must report
   every screen the same), then `main` against the branch, picture for picture (no pixel more than 24 colour levels
   off, as the model script), at both sizes: Admin → Users with every row state (active, suspended, no sign-in, own
   row, a posting waiting, a held posting) and each one's open editor; the archived group and its editor (callsign
   free, taken, no sign-in); a waiting request's Give access with "On the roster" and "New person"; Admin → Data's
   "Clear old clutter…" and "Clear edit history…" in each Period mode (the range calendar shown); the access screen
   ("Request access", as a signed-in newcomer with no roster row) and the screen after asking; the sign-in screen;
   and every other form heading the widened rule draws — Add a person, the approval form, Admin's other windows with
   `.mfield` headings (find them by searching `mfield` in `src/ui/`), the input window's fields.
2. `scripts/handpass/rdl1108-walkA.mjs` — Astra's S12, S13, S14, S16, S18, S20, S23, S24 on both builds, values compared
   (S18: the press on "Period" — on the branch the keys land on its list; on `main` nothing, the one expected DIFF;
   S20: the caret in the callsign box on arrival, then Astra's keyboard inventory).
3. The plain-user round (bug-check order §7.0a): on Admin → Users and Admin → Data, the everyday tasks start to finish
   as an admin does them — give a person sign-in, suspend, enable (the "check your quals and CAT" prompt), archive,
   restore, delete (it asks twice), approve a request both ways, clear a period — pressing every control that opens or
   closes something, then looking at every other place that should show the result (Quals, the bell, the Leave War's
   roster, the schedule's people list, the change history).

## Walker B — the save layer (folder `walkB`)

`scripts/handpass/rdl1108-walk.mjs` — Astra's S01–S05, S07–S11, S15, S17, S19, S21, S22 on both builds, values compared,
each with the reload (R), second tab (T), `?savefail` (F) and phone (P) her marks name. For each writer: what it shows
after the save, after Undo, after Redo, after a reload, and after a failed save's Retry; the values must match `main`
step for step. A second tab is opened BEFORE the tested write. `?savefail` is the address switch that makes every save
in that one tab fail (the "Not saved" band and its Retry show). Record the counts and refusals `main` shows; never
invent an expected number from the branch.
