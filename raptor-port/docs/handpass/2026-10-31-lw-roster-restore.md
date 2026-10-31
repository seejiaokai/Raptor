# Evidence sheet — the posting pass's roster save and a deleted man's Undo / Redo (31 Oct 26)

**The change:** two backlog items, one batch of one area (D485, D1087) — `[SYSTEM-PASS-SAVES-ROSTER]` and
`[LW-DELETED-RESTORE-OVERREFUSE]`. Branch `claude/lw-roster-restore-fixes`, cut from `origin/main` at 36827f127. Built on the
night of 30–31 Oct 26 (an unattended run, job 2 — D596). Pull request 597. The builder wrote it up to the walk; the walker's run, the reads, two fix rounds and the closing are in §7 to §10.

1. **The posting pass saves only its own change to the roster.** The pass (`leavewar/sync.ts runPoOutcomes`, the command
   `lw.postoutRun`) runs as the app itself, which the commit gate lets through; its people store diffs against the SAVED
   roster and its finish took the whole roster in memory as saved — so a person changed in memory outside every command
   (only a browser's console can) was saved with it, past the own-row rule (D149, D218, D1510). Now, run as its own
   command (at idle, or queued behind the command that woke it), the pass first puts the roster in memory back to what is
   saved (`state/people-settings-commit.ts revertUnsavedPeople`, in place, before it enlists the people store); joined
   inside a person's own command it puts nothing back (that command's own roster change is live there, and the whole
   change is judged as that person's); woken inside a command the app itself runs (a projection), it waits and runs as its
   own command straight after. **The hard rule** is in the commit gate (`state/perms.ts ownershipViolation`): a
   `lw.postoutRun` change to a person is refused unless the same change carries that man's posting record; the database's
   table says the same (`docs/data-model.md` §11, "The posting pass").
2. **For a deleted man, Undo / Redo no longer refuses two changes the live screen allows** (the narrow read's findings A and
   B, `parts/lw-sf1030/read-fix2.md`), in `state/person-delete.ts deletedRestoreProblem`, exactly as the read gave them:
   (A) a war step's Redo is refused only when it adds war-approved days for him overall AND from the first refused day — a
   move of his approved leave across a late Delete posting's date adds none overall and goes back; (B) no Redo falls to the
   request test any more (only war steps approve — the read's writer survey), so the Redo of an Inputs-page lengthening over
   his own pending bid goes back; an Undo keeps the request test.

**Tier: FULL** — §5's questions: 1 money / leave counts — **YES by reach** (fix 2 lets a Redo put back a move or a
lengthening of approved leave, which the leave figures count; fix 1 decides what a posting's archive or delete saves);
2 published record — no (no publish, sign-off or issued copy is touched; a Delete posting's schedule step is unchanged);
**3 saved data — YES** (what the pass saves; what Undo / Redo restores); 4 shared drawer — no (nothing drawn changes);
5 new control — no; 6 new surface — no; **7 roles — YES** (the commit gate now limits what the app's own pass may write to
a person — `perms.ts`, with `data-model.md` §11 in the same change, D200; a security read is owed, D1411); 8 warnings — no.

## Questions waiting for him

None. Nothing of the build waits on him.

## 1. The rules sweep

D1510 (only an admin ticks Management — the security read that filed fix 1), D149, D218 (a member edits his own row only, the
callsign an admin's) · D200 (perms.ts and data-model §11 change together) · D1411 (a security read on a change to who may
write what) · D229, D280, D283, D287, D290, D297, D299 (a posting's outcomes on its date; a delete's mark; the past kept) ·
D321 (8) (a posting out is no Undo step) and (10) (leave may still be changed on a deleted man's past days) · D350 (a delete
is no Undo step) · D1436, D1447 R20 / R21, D1521 (the live door's posting-date rule and a deleted man's refusal, and their
words) · D1263, D148 (what Undo / Redo may put back) · D1105, D1102 (the Delete posting's words and its two taps) · D56 (a
problem living only in stored data is no finding) · D608 (a test that changes data directly never stands in for a press on
screen). **No ruling contradicted.** The agent's reading, recorded: an admin's own roster command still takes the whole roster
in memory as saved (every roster command's finish does), so a console change rides an admin's next roster command, judged
as his; a member's is refused by the gate. Fix 1 closes only the app's own pass, which nobody's role judged.

## 2. The roll-call

**Fix 1 — every place the posting pass runs, and what reads what it saves:**

| Where | Has it / must not, because… / MISSING |
|---|---|
| At boot — a sign-in, a reload (`wireLeaveWarSync`) | HAS IT — its own command; the roster just loaded is the saved one, so nothing is put back (the reload steps of RR-P1, RR-P2, RR-P4) |
| A Raptor notify at idle — a tab, any press — after the date has come | HAS IT — its own command: puts back, then the gate's rule (RR-P1, RR-P4 walked; `postout-roster.test.ts`) |
| A Leave War notify at idle | HAS IT — the same body and the same test of how it was raised (`postout-roster.test.ts` drives the pass directly at idle) |
| Queued behind a person's own command (a Quals tick — any command whose notify comes at its end) | HAS IT — that command saves first, the pass runs after it on its own (RR-P2 walked; unit "an admin ticks a qual on Quals while a posting is due") |
| Inside a person's own command, while it runs (Post out with a date already come; Restore; Undo post out; a posting changed) | MUST NOT put back, because that command's own roster change is live inside it, and the one change is judged as that person's — RR-P3 walked; unit "a posting made today runs inside the Post out command"; `postout-outcomes.test.ts` (Restore, Undo post out — 28 green) |
| Inside a command the app itself runs (the war's sync projection) | HAS IT — waits, runs as its own command after (unit "woken inside a command the app itself runs", red with the wait taken out — §4); not walked: no screen route reaches it on purpose (§6) |
| What it writes — Overseas Sqn (archive + account) | HAS IT — RR-P1, RR-P3 walked; unit |
| — SANS | HAS IT — unit (each outcome changes his person alone) |
| — Delete | HAS IT — RR-P4 walked; unit |
| — no outcome | MUST NOT write a person, because a posting with no outcome runs nothing (`poDueNow`) — unchanged |
| The commit gate's rule | HAS IT — unit (four cases, the gate's own words); `data-model.md` §11 |
| Readers of what it saved: Quals (a man's ticks) | HAS IT — RR-P1 (Management), RR-P2 (TF), after a reload |
| — Admin → Users (his row, its archived fold) | HAS IT — RR-P1, RR-P3 ("Archived 5 Nov 26 by his posting (Overseas Sqn)"), RR-P4 (no row once deleted) |
| — the Leave War grid (his row's posting marks) | HAS IT — RR-P4 pictures the row before and after |

**Fix 2 — every kind of step a deleted man's Undo or Redo can replay, and where it shows:**

| Step | After his delete | Evidence |
|---|---|---|
| A war approval (Approvals, the bid window, the day's list) — Redo | REFUSED, unchanged | RR-C1 walked; `deletednorow.test.ts` S1-6 |
| An approval of a day in a late posting's gap — Redo | REFUSED, unchanged | RR-C2 walked; unit |
| A place-and-approve (Auto-approve), an approval that extends a leave — Redo | REFUSED, unchanged | unit (the blind read's finding 1) |
| A war move that does not cross the first refused day — Redo | PASSES, unchanged | unit |
| **A war move across the first refused day — Redo** | WAS MISSING (refused for good) — **fixed: passes** | RR-A walked, its live twin RR-A0; unit (finding A) |
| An Inputs-page lengthening, no bid under it — Redo | PASSES, unchanged | unit; walked 30 Oct 26 (S1-6 d) |
| **An Inputs-page lengthening over his own pending bid — Redo** | WAS MISSING (refused for good) — **fixed: passes** | RR-B walked, its live twin RR-B0; unit (finding B) |
| An Inputs-page filing over his bid — Redo | PASSES, unchanged | unit |
| A send-back, Approve → Refuse — Undo | REFUSED, unchanged (the request test kept for Undo) | unit |
| His approved leave's delete — Undo (his past) | PASSES, unchanged | unit |
| A remarks edit — Undo / Redo | PASSES, unchanged | unit |

Where it shows: the top bar's Redo — greyed when a step is passed over for good, live otherwise (the before-Redo pictures of
RR-A, RR-B; on `origin/main` greyed); the Leave War grid (the moved leave on its new day — RR-A); the Inputs page's calendar
(the lengthened bar — RR-B); Approvals (the live refusal's words, unchanged — RR-C2); Admin → Users (a deleted man has no
row). The bell — MUST NOT change, because a Redo writes the notices the step it repeats wrote, and a deleted man has no
sign-in to read his; not walked (§6).

**Painted on the same pixels:** nothing drawn changes. **The door check:** no new control; every walked action is pressed
through its own control — the bid window (place, Move, ⋯ → Post out, its chips and its button, twice for Delete), Approvals'
Approve, the Inputs page's leave window and Save, Admin → Users' Delete (twice), Quals' Edit, a tick and Done, the top bar's
Undo / Redo, Logout and sign-in, the main tabs.

## 3. Sizing the walk (D607, `docs/walk-ledger.md`)

1. **Type:** G (saved data, Undo / Redo, a reload) leading; H (the commit gate — what the app's own pass may write to a
   person); A (one shared check — the restore refusal — read by the top bar's Undo / Redo on every page).
2. **What only a walk could find here:** whether each fault's fixture is reachable through the app's own controls (a move
   across a late Delete posting's date; a lengthening over his pending bid; a posting coming due overnight with the page
   open); whether Redo is offered on screen (greyed or live), on the Leave War and on the Inputs page; whether what the pass
   saved is what a reload shows on Quals and Admin → Users; whether an admin's ordinary tick made as the posting comes due
   survives it.
3. **The ledger:** G walks of the Leave War (the 30 Oct 26 small fixes — 21 scenarios, 6 faults reproduced on `main`, none
   after) and the Undo walks found faults in orders of action; H walks on Quals found theirs in the member's face (D149's,
   D1510's).
4. **The walk chosen:** one Sonnet walker (D787, D588), two assertion scripts, **10 scenarios** (fix 2: 6, fix 1: 4 — §5).
   The fixed build at his PC's desktop (Chromium 1536 × 730 at 1.25) for all 10, and at his iPhone's size (WebKit 402 × 874)
   for RR-A, RR-B, RR-P1 and RR-P2 — the two faults, the console case and the ordinary change kept; the others are the same
   doors at both sizes. `origin/main`'s build for the before pictures: RR-A, RR-B, RR-P1 at both sizes (expected FAIL — the
   faults), and RR-A0, RR-B0, RR-C1, RR-C2, RR-P2, RR-P3, RR-P4 at the desktop (expected PASS — what the change keeps).
   Cases carried by a test, each named in §6. Admin throughout; RR-P1's stray change is made signed in as the member (Ranger).
5. **After the walk:** its row in the ledger — the walker's host adds it.

**§7.11's lessons, each against this change:** 1 a reading in one state — RR-A (approved → moved → undone → posted → redone)
and RR-B (approved, bid, lengthened, undone, deleted, redone), the Redo button pictured before each Redo; 2 a gesture at one
speed — no new gesture; 3 feedback — the Redo button's state and every passing note recorded (`said`); 4 a press behind an
open window — cannot apply (no window changes); 5 a box brought into sight — cannot apply; 6 only the real phone draws it —
cannot apply (nothing handed to the phone); 7 a model of the phone — cannot apply; 8 an approved drawing — no screen
changes, so no drawing check; 9 alignment — cannot apply (no list's drawing changes); 10 a page hidden and shown again —
RR-P1 and RR-P2 run the pass while the Leave War and Quals swap, and every saved fact is read after a reload; 11 how much
fits — cannot apply; 12 a window from one page only — Undo / Redo pressed on the Leave War (RR-A, RR-C) and on the Inputs page
(RR-B); 13 a pinch part-way down — cannot apply; 14 the keyboard list — no box; 15 a pinned bar — cannot apply; 16 a warning
cleared only by a change of value — cannot apply (no refusal at a box); 17 a control that changes a page's width — cannot
apply. **A stand-in, calibrated:** the browser's clock is moved to the next morning (Playwright's clock) — the app reads only
the date from it; RR-P4 (a Delete posting run the next morning) must PASS on both builds, the calibration that the moved
clock runs the pass at all.

## 4. Gates

| Check | Where | Result |
|---|---|---|
| The new tests, red on the unfixed code first | his PC | `postout-roster.test.ts` 5 of 13 red — "only the man posting out: expected [ 'bane', 'rocky' ] to deeply equal [ 'bane' ]"; "expected [ 'bane', 'ghost' ] to deeply equal [ 'bane' ]"; "his console tick not saved: expected true to be falsy"; the gate's two refusals ".toMatch() expects to receive a string, but got object" (the gate answered nothing). `deletednorow.test.ts` 2 red — "Redo still offered: expected false to be true" (finding A and finding B). The guards (each outcome saves him alone; an admin's Quals tick kept; a posting made today) green before and after, as they should be |
| The deferral's test (added after the fix) | his PC | red with the wait taken out of `runPoOutcomes` — "the pass ran as its own command: expected [] to have a length of 1 but got +0" — green with it; the file restored and checked identical |
| After the fixes | his PC | the two files 52 / 52, then `postout-roster.test.ts` 14 / 14 |
| An existing test changed | his PC | `postout-outcomes.test.ts` "Fable 2": its hand archive was a bare write outside every command — exactly what the pass now puts back — so it went red; its archive is now made inside a roster command (a saved change, as every in-app roster write is); its assertions unchanged; 28 / 28 |
| The touched and posting-related files | his PC | 32 files, 786 tests, 0 failed (`leavewar/` postout-outcomes, poarchive, changelines-lw, m4decide, m4page, m4ride, onedoor, roster, scenarios-doors, scenarios-rules, whoplaced, undoaudit, ui/postout-date-delete, ui/wholeleave, postout-roster, deletednorow; `ui/bellnotices-scenarios`; `undo/timeline`, `timeline-cr`; `state/` person-delete, person-delete.wire, perms, perms-scan, people-settings-commit, accounts, accounts-rows, roster-add, roster-restore, roster-restore-inputs, rows-roster-inputs, command-write-seam, quals-write) |
| Build (typecheck + bundle) | his PC, under the lock | green |
| The documents check (`npm run docsize`); the rule check (`npm run rulecheck`) | his PC | both OK (the rule check also says Q11 is now covered and may leave its baseline — older than this change, not touched here) |
| The full set | GitHub's run of the pull request (D1086) | owed — the pull request is the host's to open |

## 5. The walk — the scenarios (EXPECTED on the fixed build, and on `origin/main`'s; the results in §9)

The world: the demo, saved in a fresh browser (never `?fresh=1`), the browser's clock from **Wed 4 Nov 26 09:00** (Singapore),
running. Days: his approved LL on Mon 26 Oct; a Delete posting dated Fri 30 Oct, run late on 4 Nov (he is deleted from 4 Nov,
his 30 Oct – 3 Nov kept but refused live); the move's landing Mon 2 Nov; a second day Tue 27 Oct. The man is **Drifter**; the
bystander on Quals is **Ace** (a pilot, so on Quals' default view).

| # | Scenario — pressed on screen | EXPECTED — fixed build | EXPECTED — `origin/main` |
|---|---|---|---|
| RR-A0 | Drifter's LL on 26 Oct placed and approved (bid window, Approvals); ⋯ → Post out → Delete from his 30 Oct (two taps); his 26 Oct opened, Move, 2 Nov pressed | the posting deletes him from 4 Nov; the leave moves to 2 Nov — the live door allows it | PASS (unchanged) |
| **RR-A** | approved 26 Oct; Move to 2 Nov; Undo (back on 26 Oct); Post out → Delete from 30 Oct; Redo | Redo LIVE before the press; the leave goes to 2 Nov, nothing on 26 Oct; "Redid: moving a bid", never "has been deleted" | **FAIL — the fault:** Redo greyed (passed over for good); the leave stays on 26 Oct |
| RR-B0 | approved 26 Oct; a pending LL on 27 Oct; Drifter deleted on Admin → Users; the Inputs page's calendar → his leave's bar → 26 → 27 Oct → Save ("No document") | saved: the leave reads 26–27 Oct — the live edit is allowed (D321 (10)) | PASS (unchanged) |
| **RR-B** | approved 26 Oct; pending LL on 27 Oct; lengthened to 26–27 Oct on the Inputs page (his 27 Oct bid taken by it); Undo; deleted on Admin → Users; Redo from the Inputs page | Redo LIVE; the leave reads 26–27 Oct again; "Redid: a personal input" | **FAIL — the fault:** Redo greyed; the leave stays 26 Oct alone |
| RR-C1 | approved 26 Oct; Undo; deleted on Admin → Users; Redo | stays refused: Redo greyed, no leave written (the fix must not open it) | PASS (unchanged) |
| RR-C2 | approved 2 Nov (a day the late posting refuses); Undo; Post out → Delete from 30 Oct; Redo; then Approvals' Approve on his 2 Nov line | no leave on 2 Nov; the live Approve says "He posted out on 30 Oct: refuse or delete it" | PASS (unchanged) |
| **RR-P1** | admin: ⋯ → Post out → Overseas Sqn from Drifter's 5 Nov; Logout; sign in as the member (Ranger); **one console step** — Ace's Management tick set in memory (`PEOPLE.dj.quals.mgmt = true`), a change no control lets a member make (D1510, D149); the clock to 5 Nov 09:00; the Quals and Leave War tabs pressed (the pass runs); reload, sign in as the admin, Quals, Admin → Users | Drifter archived by his posting; Ace's Management NOT ticked — in memory at once, and on Quals after the reload | **FAIL — the fault:** Ace's Management ticked after the reload — the pass saved it |
| RR-P2 | admin: Post out → Overseas Sqn from Drifter's 5 Nov; Quals, Edit; the clock to 5 Nov 09:00; Ace's TF pressed (the press that wakes the pass); Done; reload | Ace's TF ticked, and still after the reload; Drifter archived, and still after the reload | PASS (unchanged) |
| RR-P3 | admin: Post out → Overseas Sqn from Drifter's 4 Nov (today); reload; Admin → Users | archived at once (inside the Post out), still after the reload; his row "Archived 4 Nov 26 by his posting (Overseas Sqn)" | PASS (unchanged) |
| RR-P4 | admin: Post out → Delete from Drifter's 5 Nov (two taps); the clock to 5 Nov 09:00; a tab pressed; reload; Admin → Users | not deleted before the date; deleted the next morning, still after the reload; no row on Admin → Users | PASS (unchanged) — the clock's calibration |

**Count (10):** the faults reproduced on `origin/main`: 3 expected (RR-A, RR-B, RR-P1). **The builder's dry run** (31 Oct 26,
pictures not kept — the walker's run is the evidence): fixed build, desktop 10 / 10 PASS, phone RR-A0–RR-C2 6 / 6 and RR-P1,
RR-P2 PASS; `origin/main`'s build, desktop: RR-A FAIL ("Redo offered false … the leave on 26 Oct"), RR-B FAIL ("Redo offered
false … 26 Oct alone"), RR-P1 FAIL ("Ace's Management in memory true; after a reload, on Quals true").

### How to run it (the walker, from `raptor-port/`)

- **Read first:** `docs/walk-scripts.md` §3–§7. The scripts and their helpers: `scripts/handpass/lw-rr-s1.mjs` (fix 2),
  `lw-rr-s2.mjs` (fix 1), `lw-rr-lib.mjs` (over `lw-sf-lib.mjs`).
- **No server, so no port to check:** each script serves the built folder INSIDE the browser at `http://localhost:4377`
  (routed — nothing listens there, so another chat's preview cannot hold it or be walked by mistake); the app's localhost
  bridge answers there. `LW_DIST` names the folder (default `dist`, the fixed build).
- **The fixed build:** `node scripts/gatelock.mjs exec "claude/lw-roster-restore-fixes — build for the walk" -- npm run build`
  (the lock — a build). Check the walked build is this branch's: `git log -1 --format=%h` before building.
- **`origin/main`'s build (the before):** already built at `C:\Users\User\rrm\raptor-port\dist` from 36827f127 on 31 Oct 26.
  If it is gone, rebuild it as `docs/walk-scripts.md` §8 says: `git archive origin/main raptor-port ':(exclude)raptor-port/docs'
  ':(exclude)raptor-port/reference' ':(exclude)raptor-port/e2e' | tar -x -C /c/Users/User/rrm`, a junction
  `C:\Users\User\rrm\raptor-port\node_modules` → this checkout's `raptor-port\node_modules` (`cmd //c mklink //J …`), then
  `node scripts/gatelock.mjs exec "… origin/main build" -- npm --prefix /c/Users/User/rrm/raptor-port run build`.
- **The runs — one folder each (each script empties its own folder first):**
  ```
  LW_OUT=2026-10-31-lw-roster-restore/after/s1-desk  SIZE=desk  node scripts/handpass/lw-rr-s1.mjs
  LW_OUT=2026-10-31-lw-roster-restore/after/s1-phone SIZE=phone ONLY=rr-a,rr-b node scripts/handpass/lw-rr-s1.mjs
  LW_OUT=2026-10-31-lw-roster-restore/after/s2-desk  SIZE=desk  node scripts/handpass/lw-rr-s2.mjs
  LW_OUT=2026-10-31-lw-roster-restore/after/s2-phone SIZE=phone ONLY=rr-p1,rr-p2 node scripts/handpass/lw-rr-s2.mjs
  LW_DIST=C:/Users/User/rrm/raptor-port/dist LW_OUT=2026-10-31-lw-roster-restore/before/s1-desk  SIZE=desk  node scripts/handpass/lw-rr-s1.mjs
  LW_DIST=C:/Users/User/rrm/raptor-port/dist LW_OUT=2026-10-31-lw-roster-restore/before/s1-phone SIZE=phone ONLY=rr-a,rr-b node scripts/handpass/lw-rr-s1.mjs
  LW_DIST=C:/Users/User/rrm/raptor-port/dist LW_OUT=2026-10-31-lw-roster-restore/before/s2-desk  SIZE=desk  node scripts/handpass/lw-rr-s2.mjs
  LW_DIST=C:/Users/User/rrm/raptor-port/dist LW_OUT=2026-10-31-lw-roster-restore/before/s2-phone SIZE=phone ONLY=rr-p1 node scripts/handpass/lw-rr-s2.mjs
  ```
  The pictures land in `docs/img/handpass/<LW_OUT>/`, each script's result list beside them (`s1-desk.json` …). A desktop
  run of a script takes about two to four minutes; a phone run longer.
- **What to look at:** for RR-A and RR-B the before-Redo picture (the top bar's Redo live or greyed) and the after-Redo
  picture (the leave's row on the grid; the bar on the Inputs calendar); for RR-P1 the Quals picture after the reload (Ace's
  Management cell outlined) and Admin → Users; for RR-P2 the TF cell after the reload; for RR-P4 Drifter's row before and the
  next morning.
- **The one console step** (RR-P1) plants the stray change — it is the fault's premise, which no control can make; the pass
  that the fault is about runs from presses on screen (D608).

## 6. What is not walked, and why (§7.0)

**Carried by a test — the route on screen walked by a sibling, the behaviour the same:**
- The SANS outcome, and two men due at once — the same pass and the same put-back; `postout-roster.test.ts` "sans: its one
  command changes Ranger's person alone", "two men due at once: both, and only both".
- A man added in memory, and a change to the posting man himself — the same put-back; "a man added from a console", "a
  change from a console to the man posting out himself".
- The pass woken inside a command the app itself runs — no screen route reaches it on purpose (the war's projections run the
  pass beside them, not inside); "woken inside a command the app itself runs", proved red without the wait.
- The gate's rule — on the fixed build no screen can bring a stray change into the pass (it is put back first), so the rule
  is a second guard; "the hard rule" (four cases, the gate's own words, called directly — it proves the rule, not a route).
- Every other kind of a deleted man's Undo / Redo step (the table in §2) — `deletednorow.test.ts`, through the production
  writers and the top bar's own Undo / Redo functions; each untouched by this change except the two it fixes.

**Set aside, with the reason:**
- **The bell** — a Redo writes the notices of the step it repeats; this change only lets two such steps through, and a
  deleted man has no sign-in. Nothing of the bell's code changed.

## 7. Break tests (§8.4) — `scripts/handpass/breaks/lw-rr1031.json`

Eight breaks, one per line the draft owed (the gate's rule broken two ways; one more for the put-back's own work), run by
`node scripts/handpass/breaks.mjs scripts/handpass/breaks/lw-rr1031.json` against `leavewar/postout-roster.test.ts`,
`postout-outcomes.test.ts`, `poarchive.test.ts` (fix 1) and `leavewar/deletednorow.test.ts`, `state/person-delete.test.ts`
(fix 2). **First run: 6 of 8 caught.** Two stayed green, each a rule held in two layers (walk-scripts §9) — the gate's rule
refuses a pass carrying a stray change, its rollback puts the roster back, and the next pass runs clean, so the outcome
looked right:
- break 2 (the put-back run inside a person's own command) — reading (1), no test: no test had a posting come due inside a
  person's own command. New test "a posting that comes due inside a person's own command (an add with his post-in date):
  that command's new man is kept" (`postout-roster.test.ts`) — red on break 2 (the add's new man put back out of the
  roster), green on the fix;
- break 6 (the put-back leaves a person added in memory) — reading (1) for the put-back's own layer: new test "puts back a
  changed person in place, drops a person added in memory, brings back one removed — and says which" — red on break 6.

**Re-run of the whole list after the two tests: 8 of 8 CAUGHT** — 1 the put-back skipped (the console case on the man
himself; the projection case); 2 the put-back inside a person's command (the add); 3 the wait under a projection removed
(the projection case); 4 the gate's rule removed (both gate cases); 5 the rule narrowed to one man (the second man refused);
6 an added person left (the put-back's own test); 7 fix A's overall count removed (finding A's pin); 8 fix B's Redo sent to
the request test (finding B's pin). Every file put back as it was (`git status`: no source touched by the runner).

**Fix round 1 (31 Oct 26, after the two reads — §8):** twelve breaks added (9–20), one per condition the round added — the
done mark the posting's own date (9), its date come (10), changed by this pass (11), the person's fields (12), a SANS
posting's other qualifications (13), the outcome's marks (14), another man's account row (15), the posted man's account's
role, owner or name (16), the first-write allowance kept to the first write (17), any other settings row (18), the put-back's
ALL / ALL AVAIL only (19), the restore check's input on any day from his cutoff (20); break 5's line had been replaced by the
round, so it was retargeted at the new rule. Each new gate condition has a test only it satisfies in `postout-roster.test.ts`
(the five written for 9, 11, 13, 17 and 18 after the fix, proved by their breaks). **Whole list: 20 of 20 CAUGHT**; the runner
left no source touched.

**Fix round 2 (31 Oct 26, after the narrow read of the round-1 fix — §9):** breaks 15, 16 and 17 retargeted (their lines
were rewritten), 18 made unique, three added — 21 a first-write row need not be the seed's own, 22 its on / offBy not asked,
23 a row of no seeded account allowed. First run 20 of 23: breaks 15, 17 and 22 stayed green — reading (1), each a condition
another check answered first in its tests; a test written for each ("another man's stored account suspended …", "a seeded
account put back as seeded …", "the posted man's own row left signed in …"), each red on its break. **Whole list re-run:
23 of 23 CAUGHT**; no source touched.

## 8. The reads (D790 — Opus, fresh and blind; D1411 — a security read; D903 — no Fable; no ChatGPT reader while it is out, D761)

| Read | On | What it found | What was done |
|---|---|---|---|
| The fresh code read (`parts/lw-rr1031/read-opus.md`) | 80310343f + the tests to 7d0c12b24 | **no findings** (D489); three tidiness notes | note 2 (a stale comment in `person-delete.ts`) corrected in fix round 1; note 1 filed `[SYSTEM-ACTOR-ONE-TEST]`; note 3 left (acceptable) |
| The security read (`parts/lw-rr1031/read-security.md`) | 7d0c12b24 | 1 Medium at the database step (the gate's rule looser than the pass: matched by id alone, account rows not asked; and the pass runs in every browser); 2 Low (the war's and the inputs' own passes unchecked); 3 Low (a console body marked `special` escaped the put-back); 4 two older admin-side leads | fix round 1: the rule tightened (`postingPassViolation` — the posting's own done mark, the outcome's fields, the posted men's accounts), the put-back skips only ALL / ALL AVAIL, the restore check asks an input on any day from his cutoff (that lead reproduced); filed `[SERVER-SIDE-PASSES]` (1(b), 2) and `[LW-DELETED-REDO-NETSUM]` (the other lead, reproduced, reachable from no screen — its test `it.fails`) |
| Its narrow read of fix round 1 (`parts/lw-rr1031/read-fix1.md`) | 63e1660d6 | 1 Medium — the accounts' first-write allowance decided from the changeset alone (any new account at any role) | fix round 2: the first write tied to the seeded list (§9) |
| Its narrow read of fix round 2 (`parts/lw-rr1031/read-fix2.md`) | 5a2e552f5 | the opening closed for the database step; 1 Low, this build only — the first write checked row by row, never that the whole seeded list is there | filed `[POSTPASS-FIRSTWRITE-WHOLE-SEED]` with the reader's exact fix — not built: the cap of about three fix rounds (the order §5), out of the app's reach |

**The last round:** 5a2e552f5. What carries the rest: the four filed items.

## 9. Walk

**The walker's run, 31 Oct 26 (Sonnet 5.5; the host opens the deciding pictures — D1271).** Fixed build = this branch's head 49c8e6776, rebuilt under the lock before the run (the older build pre-dated a later change to the posting pass). `origin/main`'s build = `C:\Users\User\rrm\raptor-port\dist`. Pictures in `docs/img/handpass/2026-10-31-lw-roster-restore/{after,before}/{s1,s2}-{desk,phone}/`, each run's result list beside them. No console or page errors in any of the eight runs. Every step pressed on screen as the scripts do, bar RR-P1's one console step (the fault's premise).

| # | Fixed, desktop | Fixed, phone | `origin/main` (desktop / phone) | What the pictures show |
|---|---|---|---|---|
| RR-A0 | PASS | — | PASS / — | `after/s1-desk/rr-a0-a-postout`, `rr-a0-c-after-move`: Drifter's LL sits on 2 Nov inside the PO stripe after the live Move |
| **RR-A** | **PASS** | **PASS** | **FAIL / FAIL (the fault seen)** | `rr-a-a-before-redo`: Redo arrow lit on the fixed build, greyed on `main`; `rr-a-b-after-redo` (crop): LL on 2 Nov on the fixed build, still on 26 Oct on `main` |
| RR-B0 | PASS | — | PASS / — | `rr-b0-b-saved`: Inputs calendar bar 26–27 Oct after the live edit |
| **RR-B** | **PASS** | **PASS** | **FAIL / FAIL (the fault seen)** | `rr-b-a-before-redo`: Redo lit (fixed) / greyed (`main`); `rr-b-b-after-redo`: bar runs 26–27 Oct (fixed) / 26 Oct alone (`main`) |
| RR-C1 | PASS | — | PASS / — | `rr-c1-after-redo`: Redo greyed; Drifter's row is below the fold in the picture, so the empty leave is the script's count, not pictured |
| RR-C2 | PASS | — | PASS / — | `rr-c2-approvals`: his 2 Nov line reads "He posted out on 30 Oct: refuse or delete it", Approve not lit |
| **RR-P1** | **PASS** | **PASS** | **FAIL / FAIL (the fault seen)** | `rr-p1-c-quals-after-reload`: Ace's Management cell empty (fixed) / ticked (`main`); `rr-p1-d-users`: Drifter in the archived fold "Archived 5 Nov 26 by his posting (Overseas Sqn)" |
| RR-P2 | PASS | PASS | PASS / — | `rr-p2-b-after-reload`: Ace's TF ticked after the reload |
| RR-P3 | PASS | — | PASS / — | `rr-p3-b-users`: "Archived 4 Nov 26 by his posting (Overseas Sqn)" |
| RR-P4 | PASS | — | PASS / — | `rr-p4-a-postout` (Delete chosen, "Tap again to delete Drifter"); `rr-p4-c-users` shows only the top of Admin → Users, not Drifter's place — his absence is the script's reading, not pictured |

**Fixed build: desktop 10 / 10, phone 4 / 4.** **Breaks: 3 / 3 on `origin/main` at the desktop (RR-A, RR-B, RR-P1 fail), 3 / 3 at the phone**; the seven that must not change passed on `main` at the desktop. Not run: nothing. Notes for the host: (1) the next-morning picture of RR-P1 (`rr-p1-b-next-morning`) shows the grid's today ring still on 4 Nov although the browser clock is on 5 Nov — the stand-in clock jump, not this change; (2) RR-C1's and RR-P4's pictures do not show the thing they claim (see the rows); their scripts' counts do.

**The host's two notes, answered (31 Oct 26, the builder):**
- **RR-C1's and RR-P4's pictures, re-taken on the fixed build** (scripts v2: RR-C1 frames Drifter's row round 26 Oct; RR-P4
  brings his place in Admin → Users' A–Z list into view, the row before it outlined): `after/s1-desk-retake/rr-c1-after-redo.png`
  — his 26 Oct holds only the dashed pending LL, no approved leave; `after/s2-desk-retake/rr-p4-c-users.png` — Diesel (outlined)
  is followed by Echo, no Drifter between them. Both runs PASS; the first walk's pictures are kept as they were.
- **The today ring on 4 Nov after the clock moved** is the stand-in's jump, not a fault: the test browser's clock jump moves
  the date without firing the page's timers, and the day clock (D1266) moves the ring at its midnight timer or when the page
  is shown again. Checked on the fixed build with the browser's clock: at 23:58 the ring on 4 Nov; the clock RUN past
  midnight — on 5 Nov; a jump to 6 Nov — still 5 Nov; the page then shown again (a focus) — 6 Nov.

**Fix round 1 (31 Oct 26) — what the two reads asked, and the re-walk of what it touched.** The reads:
`parts/lw-rr1031/read-opus.md` (no findings, three tidiness notes) and `parts/lw-rr1031/read-security.md` (1 Medium at the
database step, 2–4 Low). Built red first:
- the commit gate's rule for the posting pass tightened (`state/perms.ts postingPassViolation`, security 1(a)) — the posting
  change must be that posting's own done mark (`poDone` = the day after `to`, as `markPostingDone` writes it, a date come), or
  a Delete's record removed; his person may change only in that outcome's own fields with its mark set (the lists read from
  `runPoOutcomes` and `applyDelete`; `forgetPersonFrom` writes the war only); the pass's settings rows only the posted men's
  accounts, and for a Delete the request and bell row that go with his account — with the accounts' first write (the whole
  list, from none stored) allowed only as such. Red: the six exploit tests ("a Management tick slipped onto the posted man",
  "a new callsign …", "another man's posting record touched … and his Management tick", "a delete mark cleared …", "a done
  mark not yet due …", "another man's account row …") each failed ".toMatch() expects to receive a string, but got object" —
  the gate let it through; every real outcome (Overseas with his account suspended, SANS, Delete) passes as it ran. "Transfer"
  is not an outcome the app accepts yet (D281 — its chip is greyed), so it has no run to test. `data-model.md` §11 says the
  same. *(The test's storage was given its key list, so an account is a record a change names, as on a built site — without
  it no account change had ever reached the gate's test.)*
- the put-back skips only ALL and ALL AVAIL (security 3) — red "expected [] to deeply equal [ 'ghost2' ]";
- the restore check asks an input on ANY day from his cutoff (security 4, the older lead that reproduced) — red "his input
  still ends where it did …: expected 'Jul 20' to be undefined" (a Redo of an Inputs-page lengthening past his cutoff put him
  back); the reader's one line;
- the net-sum lead also reproduced (expected false, got true) — reachable from no screen; filed `[LW-DELETED-REDO-NETSUM]`, its
  test kept as `it.fails`;
- filed: `[SERVER-SIDE-PASSES]` (security 1(b) and 2), `[SYSTEM-ACTOR-ONE-TEST]` (the code read's note 1); the stale comment of
  the code read's note 2 corrected.

**The re-walk (run by the builder — a script run; the host opens the deciding pictures):** RR-P1 to RR-P4 at the desktop on the
rebuilt fixed build, `after/s2-desk-fix1/` — **4 / 4 PASS**, no console or page errors; deciding pictures
`rr-p1-c-quals-after-reload.png` (Ace's Management empty after the reload), `rr-p4-c-users.png` (no Drifter between Diesel and
Echo). The account path of the tightened rule (a posted man with a sign-in) is carried by the unit tests' real passes — the walk's
Drifter has none.

**Fix round 2 (31 Oct 26) — the narrow read of 63e1660d6 (`parts/lw-rr1031/read-fix1.md`), one Medium:** the accounts'
first-write allowance was decided from the changeset alone, so a pass could add any account at any role, and the posted man's
own new row skipped the owner, role and name check. **Chosen fix — the reader's:** on that first write each new row must be the
seeded list's own row (`state/accounts.ts seedAccounts`): id, name, role and owner the seed's, no other field, the posted man's
suspended (`on` off, `offBy` posting), every other as seeded; a row put beside rows already stored is refused. *Why not "the
pass never makes the first write" (the accounts saved before any pass):* saving them first is itself a write the app makes
under its own name at boot, unjudged, and it changes how every store's accounts load ("no rows" means the seeded list) — a wider
change than the rule, with its own rule to write; tied to the seed, the rule is as strict, and on a shared store there are no
seeds, so it allows nothing there. Red first (each "… expects to receive a string, but got object" — the gate let it through):
the reader's exploit (a SANS pass with a new admin account), the posted man's own new row with another role, the same given to
another man, another seeded account changed on the way. Kept passing: the real first write (Overseas with his account
suspended, never saved before), stored-account suspension. §11 corrected to what the code checks, with the database-step
sentence. **A runtime path changed** (the commit gate judges every pass in the app), so RR-P1 to RR-P4 were re-run at the
desktop on the rebuilt build by the builder (a script run; the host opens the deciding pictures): **4 / 4 PASS**,
`after/s2-desk-fix2/`. None of them writes an account (Drifter has no sign-in) — the account rows are carried by the unit
tests' real passes.

## 10. Closing

**Fix rounds:** two (63e1660d6, 5a2e552f5), each red first, each followed by its narrow read; the cap reached at the third read.
**Re-walks:** RR-C1's and RR-P4's pictures re-taken framed (`after/s1-desk-retake/`, `after/s2-desk-retake/`); RR-P1 to RR-P4
at the desktop after each fix round, 4 / 4 both times (`after/s2-desk-fix1/`, `after/s2-desk-fix2/`) — script runs by the
builder, the deciding pictures the host's to open. **Breaks:** 23 / 23 (§7). **Filed:** `[LW-DELETED-REDO-NETSUM]`,
`[SERVER-SIDE-PASSES]`, `[SYSTEM-ACTOR-ONE-TEST]`, `[POSTPASS-FIRSTWRITE-WHOLE-SEED]`. **Questions for him:** none. **The
ledger:** its row added (`docs/walk-ledger.md`, 31 Oct 26). **Still to come:** GitHub's run of pull request 597 on its last
commit, his look, his "merge live".

**Walk:** `docs/handpass/2026-10-31-lw-roster-restore.md` · 86 pictures (`docs/img/handpass/2026-10-31-lw-roster-restore/`) · 7
surfaces (the Leave War grid and its bid window's Move and Post out, Approvals, the Inputs page's calendar and leave window,
Admin → Users, Quals, the top bar's Undo / Redo) · 10 scenarios — the fixed build desktop 10 / 10 and phone 4 / 4, `origin/main`
the 3 faults seen (RR-A, RR-B, RR-P1) at both sizes and the 7 unchanged as expected, re-walks 4 / 4 after each fix round · breaks
23 / 23 · the cases carried by a test listed in §6 · MISSING: none open — 4 filed

`Docs: OUTSTANDING 149 items (+4 −0) · DECISIONS D1–D1528 · homes OK`
`docsize: OK`

Rulings: none this job.
