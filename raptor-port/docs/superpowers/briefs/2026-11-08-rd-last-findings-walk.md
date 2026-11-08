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

## Walker C — what walker B did not reach (chat 32, 8 Nov 26; folder `walkC`)

One Sonnet walker, alone, on the same two frozen builds and with everything above in force (read first, the builds, the
set-up, the clock, the sizes, sign-in, your output — your report `parts/2026-11-08-rd-last-findings-walkC.md`). Ports
**4411 and 4412** (walker B's — B has finished; check they are free). Add your parts as
`scripts/handpass/rdl1108-parts3.mjs` and import them into `rdl1108-walk.mjs` beside the other two; run it with
`docs/img/handpass/2026-11-08-rd-last-findings/walkC` as the out folder and only your parts named, so B's record is not
overwritten. Your file names start `c-` (two walkers' pictures once collided). The host holds no lock: you run one script
on builds already made — never build anything.

1. **S14 — hidden is different from closed** (her text, whole). In a roster row's editor (an active person with sign-in)
   and an archived row's editor: type an unsaved sign-in (or callsign) and arm Delete; then, one route at a time,
   reopening the editor's row after each: change Admin's category and come back; on the phone the category back button;
   leave Admin for Quals and come back; hide the row by typing in Users' search, then clear the search; fold Archived,
   unfold it. Record after each return: is the editor open, what each box holds, is Delete armed. Desktop and phone.
2. **S15 — changes elsewhere while an editor is open** (her text). Open a roster row's editor and type a draft sign-in;
   in the same tab go to Quals and rename that person (his callsign cell); come back to Users — record the row's heading,
   whether the editor is open and what it holds; then Save and record what was saved (the row line, the toast). Then:
   change something of his account (Suspend), open the editor again, type a draft, press Undo in the top bar while it is
   open — record the row and the editor. Then the archived editor: type a callsign, open a second tab, rename on Quals in
   the second tab, return to the first WITHOUT reloading and Save name — record what each tab shows, then reload both.
   Desktop and phone (the second-tab part desktop only).
3. **S19 with real clutter** (her text). Through the Inputs calendar put notes on at least three days inside the chosen
   period, one outside it, and one across its edge; put a day title on one day inside. Then in Admin → Data's "Clear old
   clutter…": "Older than" a choice that covers them, record the count the first press names; change the Period mode
   while armed — record that it disarms; arm again and confirm — record the count, then look on the Inputs calendar at
   each day (inside gone, outside and the loaded week kept, as `main` does — compare, do not assume). Then "A date range"
   over two of the days, the same. Then "Clear edit history…" once with entries on known dates, and record that the
   schedule did not change and whether Undo offers it. Desktop only, then the phone for the "A date range" pass.

EXPECTED everywhere: the same as `main`'s build. Your finishing line: `Walk: <n> steps, <n> SAME, <n> DIFF, <n> FAIL, <n> pictures`.
