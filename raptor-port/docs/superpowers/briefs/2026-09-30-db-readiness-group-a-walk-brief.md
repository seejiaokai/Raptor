# Walk brief — `[DB-READINESS]` group A, the group-wide FULL walk (30 Sep 26)

You are a walker (Opus). You drive the REAL production build in a scripted real browser and return pictures and a filled
table. **You change no app code** (`raptor-port/src` is off limits). You MAY create walk scripts under
`raptor-port/scripts/handpass/` named `dbrA-<your id>-*.mjs`, pictures under
`raptor-port/docs/img/handpass/2026-09-30-dbrA/<your id>/`, and results under `raptor-port/docs/handpass/parts/`
named `dbrA-<your id>*.json`. Nothing else. Do not run the unit tests, the build, the e2e suite or the gates (the build
you drive is already made; other walkers share this PC). Do not commit. Do not rebuild anything.

## What changed, in one paragraph

Nothing on screen was meant to change. What changed is HOW every record is saved: before, the app saved a few big bundles
(every request in one record, a whole week in one, every Leave War bid in one, the change history in one, every account
in one); now each thing is its own saved row (`raptor:<collection>/<id>` in the browser's storage), written ONLY from the
change a command made, with ONE change-log record `raptor:changes/<id>` per saved action naming every row that action
touched (`items: [{ table, key, op: 'put' | 'delete' }]`). The promise: **every change still survives a reload exactly as
before; nothing is lost, doubled, re-ordered or brought back; two people changing DIFFERENT things never overwrite each
other; a browser holding the old bundles is converted once, losing nothing.** The plan of record:
`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md` (read §2.5's matrix, §6 and §9).

## The shared driver — use it, it makes three checks a person's eye cannot

`raptor-port/scripts/handpass/dbrA-lib.mjs` (read it first). `L.step(page, name, fn, expect)` runs one gesture, waits for
the save, and checks **every row the gesture wrote is named by that gesture's change-log batch** (a row changed with no
batch = a bare write = a FINDING); `expect` can pin what it must write (`{ put: [/^inputs\//], only: true }`) or that it
writes nothing (`{ none: true }`). `L.reloadCompare(page, name, who)` reads the app's own state (the loaded week, every
request, the publish state, the planning calendar, the roster, the change history), reloads, signs in again, returns to the
same week, and checks **it is all the same** and that **the reload wrote nothing**. `L.rows(page)` is the raw storage.
Write every step as an assertion of the RIGHT behaviour (a PASS means correct), so re-running the script is the re-walk.
A difference `reloadCompare` reports is read before it is called a defect: if it is a field that is legitimately
recomputed at load (and NOT something the person made), say so and add a narrow `ignore` for it with the reason in a
comment — never a broad one.

## The world

- The production build is served at **your port** (below) — already running from `raptor-port/dist` unless your section
  says you serve something else yourself. Open the ROOT. A fresh browser context = empty storage = a fresh demo world.
  **Never** `?fresh=1` (it forces memory storage, and a reload would lose the world).
- Sign in: `#luser` / `#lpass` / `#loginForm button[type=submit]`; `ad` / `a` = Saber (admin), `us` / `us` = Ranger
  (member). Wait for `#vWeek .day` (attached). A reload returns to the sign-in card (sign in again; `L.signIn` handles it).
- The localhost probe bridge (this PC only): `window.go('<page>')` with pages `editsched`, `viewsched`, `inputs`, `quals`,
  `logic`, `leavewar`, `tracker`, `help`, `admin`; `window.CURPAGE`; `window.CURWEEK`; `window.openScheduler(di)` (the
  board, day 0–6), `window.loadWeek(wk)`; `window.INPUTS`, `window.DAYS`, `window.SCHED`, `window.PEOPLE`,
  `window.ELOG.rows`, `window.histSnap()`; `window.undo()` / `window.redo()` (the one Undo); `window.lastEnvelope()`.
  **Every gesture under test goes through the app's own controls** — the bridge is for getting to a place and READING
  state. A bridge write (`window.txtSet` + `afterSchedMutate`, `window.fileInput`) is not how a person saves anything,
  and proves nothing about saving. A change you cannot make through the app's own controls is itself a finding (a
  missing door) — say so, do not inject it.
- The demo: the week Mon 13 – Sun 19 Jul 26 (the weekend publishable), a second authored week from Mon 20 Jul; the
  calendar date is 30 Sep 26. Two Leave War periods.
- **Two people = two tabs** (two pages in ONE browser context share its storage). The app never re-reads storage while
  open, so tab B does not see tab A's change until B reloads — that is exactly the case to test: B, opened BEFORE A's
  change, makes its own change to a DIFFERENT thing; then a reload of either must show BOTH (with the old bundles, B's
  save would have overwritten A's).
- Templates to copy: `dbr5b-walk.mjs` (a three-part walk incl. main's build → this build), `dp-walk.mjs` (publishing,
  signing, the changes window), `lib.mjs` (`tap`, `board`, `openInputs`, `publish` — the board is drawn TWICE, desktop and
  phone twins, so scope board selectors with `B()`), `acc-walk.mjs` / `np-walk.mjs` (accounts, a new person),
  `po-walk-a.mjs` … `-d` (posting out), `lwdz-walk.mjs` (the Leave War grid, its sheets, a drag), `trk-w3-lib.mjs` /
  `trk-lib.mjs` (the Tracker). Publishing a day: its four sign-off boxes each need a name, then "Publish day".
- Widths: desktop **1440×900**; do the phone (**390×844**, `isMobile`, `hasTouch`) where your section says.

## The rule you work by (`raptor-port/docs/bug-check-order.md` §7.2–§7.8)

Each step ASSERTS the right behaviour, saves a picture, and you OPEN every picture you save before the step counts
(anti-pattern 21 — the picture taken, not looked at). Record every console error, page error and failed request (the
driver collects them; report them). A scripted gesture that fails is looked at on its picture before it is called a
defect.

**What is NOT a finding (owner, D56):** the stored world is demo data, cleared before the database step. Do not report
harm that exists only in data already stored when the code is already correct going forward. Two limits here: the
one-time conversion must never break a load (D401), and it must carry the owner's Tracker charts, syllabi and ball
details across whole (D464).

## What you return

Your final message: a table — step · width · what you did · what the screen showed after the reload · the rows it wrote
(from the driver) · PASS / FAIL · picture file(s) — then **findings**, each with: the steps to reproduce from a fresh
world, what showed, what should have, the rows involved, the picture, and whether `main` does the same where you can tell
(the before/after walker can; otherwise say "not compared"). Then **what you could not walk and why**. Plain words.

---

## The walkers — each its own port, its own browser contexts, its own pictures

Every walker: at the start, one fresh desktop world — sign in, record the first boot's rows by collection
(`L.rows`), and check the first boot wrote ONE change-log batch of type `boot`. Then walk your list. After EVERY step:
`L.step` (the rows it wrote, named by its batch) and, unless the step says otherwise, `L.reloadCompare` (a reload gives it
all back, and writes nothing). Every Undo and Redo is its own `L.step` + `L.reloadCompare`. Set `HP_URL`, `HP_SHOTS`
(`raptor-port/docs/img/handpass/2026-09-30-dbrA/<your id>`) and `HP_OUT` (`raptor-port/docs/handpass/parts/dbrA-<your
id>.json`) for the driver.

### W1 — the schedule (Edit Schedule, the scheduler board, publishing) — port 4201, pictures `W1/`
1. Edit Monday on Edit Schedule (a day note, a crew puck on a flying line) → the first save of the week writes the week
   row + all seven day rows; then a second edit on Monday → exactly ONE day row (`weeks/<wk>#0`) and its history line;
   then an edit on Wednesday → exactly `#2`.
2. A drag of a puck from Monday to Tuesday (the week's drag) → exactly two day rows.
3. On the board (day 0): a crew seat filled from the palette, a wave added (+ Wave), a row deleted, a section dragged —
   each → only that day's row (+ its history line). **Record where each gesture's history line lands: inside the same
   batch as the day row, or a separate `elog.line` batch** (a Monday day note typed on Edit Schedule was seen, in the
   host's trial, to save its history line as a SECOND action — list every gesture that does this).
4. Edit, then Undo back to pristine (the top bar's ↶), reload → the week reads as it did before the edit; say what the
   stored week rows are then (still there, or gone) and whether the reload shows the edit (it must not).
5. Publish Saturday (the four sign-offs, Publish day) → the issuance row `weeks/<wk>:is:…` + the day row; reload → the
   ORIG seal, the four names, View-only Sched's signed line. Then edit Sunday → only Sunday's row, Saturday untouched.
   Then an edit ON Saturday → "1 pending", the four sign-offs fall. Publish AL1 → a second issuance row. Reload after each.
6. Unpublish Saturday's AL1 → a retraction row `weeks/<wk>:rx:…`, the issuance rows untouched (never deleted); reload →
   the pending change is back on the working copy, the AL tag gone. Publish AL1 again (the reissue) → a NEW issuance row
   (`~1`); reload → AL1 shows once, the four names of the reissue, the history lines of all three.
7. Undo the reissue, then Redo it (the top bar) — each a step + reload.
8. Three quick edits on three different days within one second, then an IMMEDIATE reload (no settle) → all three there.
9. Week switch: open the next week (20 Jul) — the switch itself writes nothing; edit Tuesday there → only that week's
   rows; switch back, reload → both weeks as left.
10. A saved plan on a day (duplicate the working copy as a plan, switch to it, bring it out) and a day template applied to
    an unpublished day; Discard on a day with pending changes. Each: its rows only; reload.
11. OIL Earn mode on a published weekend day: switch one man's earning off, reload (still off).
12. Phone (390×844): one board edit, reload.

### W2 — requests, people, the planning calendar, accounts, the change history — port 4202, pictures `W2/`
1. File a leave on the Inputs page → exactly one `inputs/<iid>` row (+ its history line); edit its remarks → the same row
   only; re-date it; delete it → that row removed. Reload after each; the Inputs page lists the same, in the same order.
2. File two requests in a row → two rows, the newest where the Inputs page puts it; reload → same order. Then delete the
   one in the middle of the list and reload → the order of the rest unchanged.
3. A leave over a medical (the clash rules cut it) → only its pieces' rows; reload.
4. **Two tabs:** tab A and tab B open (both signed in, both on the Inputs page); A files a request; B (NOT reloaded) files
   a different one → reload both → BOTH requests there. The same with two pucks added on ONE date of the Inputs month
   calendar (+ Pucks) and a day title (the calendar's note) — both kept.
5. Quals: tick a qualification for a man, change his CAT, tick SXO → exactly his `people/<pid>` row each time; reload →
   ticked; the Leave War shows him as SXO (read only); the war's name sheet offers NO "Edit person" (D460, D461).
6. Admin → Users: a new person with his account (one step) → his person row + his account row (`settings/account:<id>`)
   in ONE batch; archive him → his rows; restore him; delete a man (D287: it asks twice) → the rows it says. Reload after
   each; Quals and every picker keep their order.
7. Posting out (the post-out sheet) with an outcome chip whose date is today or earlier → the rows it says; reload.
8. Accounts: suspend / enable an account; a sign-up ("Request access" on the sign-in card with a new address) → one
   `settings/accessreq:<id>` row; an admin's bell → marking the waiting list seen → `settings/reqseen:<his account>` only.
   Two tabs: two admins (Saber in A, a second admin you create first, in B) each add an account → both kept.
9. The change history (Edit Schedule's clock): mark all as seen → `settings/seen:<pid>` only. Admin → Data's "Clear edit
   history…" → the lines it removes, one batch; reload → gone and not back.
10. Admin → Squadron config / the Logic page: a wave template, a duty template, a rule changed, a store added → each a
    `settings/<key>` row in a batch; reload.
11. Delete EVERY request on the Inputs page, reload → none come back (no demo request returns).
12. Phone (390×844): file a request, reload.

### W3 — the Leave War — port 4203, pictures `W3/`
1. As admin: a bid placed on a man's day, Approve it, Move it (⇄ Move) to another day, Delete it → each exactly its
   `leavewar/rec:<war>:<recId>` row (a move = ONE put, never a delete and a put), plus its history line; reload after each
   — the grid shows the same cell.
2. A day holding TWO records (a bid + an OIL award, or two bids of two halves): their order on the day's list before and
   after a reload; delete the first → the second keeps its place.
3. An OIL award by hand (+OIL on the grid) and one credited from the OIL tracker → a row each; reload; the award shows on
   its date (D402).
4. Stage moves (open → closed → published) → the war's row `leavewar/war:<id>`; reload.
5. As a member (Ranger, `us`/`us`) while bidding is open: bid on his own row → his record row; reload.
6. **Two tabs:** A approves one man's bid while B (not reloaded) places a bid for a DIFFERENT man on another day → reload
   both → both.
7. ⚙ Settings: + Counter, a group added and coloured, Show SANS, Reset order, a rearrange drag of a person row → each its
   rows (the settings-like keys stay `leavewar/<key>`); reload.
8. A new period (+ New war) → one `war:` row; reload; the picker lists it.
9. Undo and Redo of a bid, a decision, a move and a stage move (the top bar's pair) — each a step + reload.
10. At published: a member edits his approved leave's remarks → the request row (`inputs/<iid>`), not the war; reload.
11. Phone (390×844): one bid, reload.

### W4 — the conversion, damage, the shared store — port 4204 (you serve it) and 4206 (the shared-store build, already up)
**The conversion (the fold):** serve `main`'s build — from `C:\m6\raptor-port`, `npx vite preview --outDir dist-main
--port 4204 --strictPort` — and, in ONE saved browser context (keep its `storageState` file), make every kind of old
record through the app's own controls: a week with a published Saturday and an AL1, Unpublish and reissue; a saved plan;
a request taken off a day; requests filed and one deleted; a person added, one archived; a planning puck and a day title;
on the Leave War a bid, a decision, a move, an OIL award, a posting-out window, a label; the change history's lines and
"mark all seen"; an account added and a sign-up waiting; on the Tracker a student, details on a ball, a chart of his own.
Read out EVERYTHING the app holds (what `L.state` reads, every Leave War cell you touched, the Tracker's
`__coreForTests.collectCharts(null,{deleted:true})` / `collectStudents()`, the Inputs page's list order, Quals' order,
Admin → Users). Stop main's server (by its PORT — `Get-NetTCPConnection -LocalPort 4204` → `Stop-Process`), serve THIS
build — from `raptor-port/`, `npx vite preview --outDir dist-walk --port 4204 --strictPort` — on the SAME port, open the
saved context: the stamp reads format 6; NO old bundle key is left (`inputs/all`, `people/all`, `plan/all`, a whole-week
`weeks/<wk>` holding days, `leavewar/wars`, `settings/elog`, `settings/accounts`, the Tracker's old whole records); and
everything read out before reads the SAME. Then edit something and reload.
**A schema bump:** in a fresh browser on this build, write the stamp as a LATER format (8) → "RAPTOR has been updated —
reload", nothing written; as an EARLIER one (4) → the demo is back (a wipe), the stamp current.
**Damage:** in a fresh world with a saved week, hand-damage one DAY row (`weeks/<wk>#2`, invalid JSON) → reload: the whole
week reads read-only; edit a DIFFERENT week and a request → every byte of the damaged week's rows unchanged. Remove a
saved week's WEEK row (`weeks/<wk>`, keep its day rows) → reload: the week is editable, its row ids intact. Damage one
request row, one war record row, one history line, one account row, one Tracker enrolment row, each in turn → the app
loads; that row is left byte-for-byte after an edit elsewhere; say what the screen shows.
**The shared store (4206, `dist-blank`):** a fresh browser — the demo sign-in `ad`/`a` is REFUSED; the first admin signs
in as `boss@unit.example` (any password); every page opens (Edit Schedule, View-only Sched, Inputs, Quals, Logic, Help,
Admin, the Leave War — "No leave period yet", its "Create the first period" — and the Tracker — "No course yet", "+ Add a
course"); storage afterwards holds only the stamp, his person, his account, the change log and the Tracker's own
bookkeeping. Then create the first period and the first course through those buttons, file a request, add a person on
Admin → Users, reload → all there, nothing demo appears. Phone too.

### W5 — the Tracker — port 4205, pictures `W5/`
Every writer the phase-5b walk did NOT drive on screen: ⇅ Reorder crew, ⇅ Reorder courses, ⇅ Reorder syllabi, Remove a
student, Rename a student, ✓ Save changes after a structural chart edit (an event added, a prerequisite line), + Add
syllabus, ↺ Restore a deleted built-in, 🗑 Delete a course and ↺ Restore it, the File menu's ⤓ Export then ⇪ Import
(charts, then students & marks), the Tracker's own Undo / Redo (↶ / ↷ in the top bar) after a mark and after a pace
change. Each: the rows it wrote (`tracker/v3:…`), named by its batch; reload → the same (read the Tracker's picture with
`__coreForTests.collectCharts(null,{deleted:true})` / `collectStudents()` / `coursesNow()` before and after — `L.state`
does not cover the Tracker). **Two tabs:** A adds a student while B (not reloaded) renames a different student and
reorders the courses → reload → both. Phone: one mark, reload.
