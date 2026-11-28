# Section 2, step U2 — fix round 6: the builders' brief (chat A217, 28 Nov 26)

The read of four over U2's fix rounds 4 and 5 (tip `8599aba40`, app code as at `405a186a7`) found four faults; the
host re-ran every proof on an untouched copy and each fails as its reader said. Reports and proofs (outside the repo,
blind readers' folder): `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_3335d4ab-0253-45be-9ca2-94908fec50e0/a217/u2fix5read/`
— `{astra,fable,opus,security}/report.md`, the proofs gathered in `proofs/`, the host's runs `host-reproduction-{1,2,3}.log`.

Two builders work AT THE SAME TIME in the one worktree `C:/Users/User/projects/Raptor/.claude/worktrees/a217-s2-users`
(branch `a217-s2-users`, no upstream). Each owns only its own files (below), **commits nothing, pushes nothing,
switches no branch**; the host commits each part by its own paths. A test run that fails in the other builder's files
mid-edit is re-run, never "fixed" by you.

## The rules every part works under (People & accounts page, full rows in `.claude/decisions-full/`)
- **D2908 (narrows D2808):** a move's "Plan of 149 ended: he moved to 150" line, and the mover's own lines, go ONCE,
  the first time the app sends it, to 149's admins as they are then — normally those of the move day; late only when
  sending failed. The telling is the app's own command (`account.told`), never part of a person's Undo step.
- **D2211:** a Plan given or taken by its squadron's own admins or a master admin — its admins told on the bell.
  **D2251:** a person told on his own bell whenever his account's status changes (View or Plan given or ended among it).
- **D2903, D2907, D2910, D2911** stand as built; do not touch their behaviour.
- **What is not a fault:** the app acting as itself — nobody signed in, the projection door, a `remote` / `seed`
  command ([GATE-APP-ACTOR-DOORS]); a harm only in data already stored (D56). A hole counts where a SIGNED-IN person
  gets it, at a screen or by a hand-made command the commit gate passes.
- **Not built yet, do not require:** U2L's four lines (a Plan of 149 ended by archive, overseas posting, delete, being
  made a master admin — D2808) and the READ Plan line answered by Undo. A check of "every line owed" covers only what
  the app's own doors write today.
- Red first: every proof below becomes a test in the app's suite that fails before your change and passes after;
  keep the readers' controls. Comments say WHY, the house style. Strict types in new code. Update in the same change
  `raptor-port/docs/notifications-register.md` (a line's doors), `raptor-port/docs/data-model.md` §11 if a permission
  or gate rule changes, `raptor-port/docs/file-map.md` for a new test file — and nothing else in the docs.
- No reading phrase ("agent's reading", "builder's reading", "read here as") in a new code comment without
  `READING D<n>` / `ruled D<n>` in the same sentence (main's readings check).
- Checks: your own test files, then the nearby suites by path FILTERS (never a list of file names) —
  `npx vitest run msq- acctlines postout notices perms onedoor src/undo/` from `raptor-port/`; `npx tsc --noEmit -p
  tsconfig.app.json` for types. No `npm run build`, no full suite, no browser test (the host runs those under the
  checks lock).
- **Hand back as TEXT** (the file tool refuses a helper's report file): what you changed, file by file; each test,
  red before (its failure line) and green after; the nearby run's counts; anything you could not close, plainly.

## Part A — the fresh Fable (a fault come back after round 5's fix: his D2233)

**Your files only:** `raptor-port/src/leavewar/sync.ts`, `raptor-port/src/state/msq-s2-u2fix4-moveday.test.ts`.
Read-only for you: everything else (call `acctlines.ts` exports; do not edit it).

**The fault (Fable's proof 1, the fresh Opus reader's proof 1 — the same root):** Wed 15 Jul, Saber (master admin)
moves Hunter (142's admin, Plan of 149) to 150 from Thu 16; with 150 in view Saber saves Hunter a Post out from the
16th, outcome Delete. The day turns with no wake. The day's first press is a door about ANOTHER man whose command
writes the loaded Leave War — Post out, Undo post out, Archive, Restore, Delete of another man, or "+ Add a person"
with a post-in date. `runLoadedPostings`, raised inside that command's reducer by the war's listener, JOINS the
person's command and runs EVERY due posting, so Hunter's Delete runs there; `runMoveLines` inside a reducer only
defers itself, and afterwards a deleted man is owed nothing. 149's admins (Kestrel, Saber) are never told. Round 5
closed the mover's own Post out and the plain Leave War press; this road stayed open.

**What must be true after:** whatever the joined command, a due, untold move is told (its own `account.told`) BEFORE
any posting that would remove the mover's evidence runs; the door's own man's posting still runs inside the door's
command when his moves are already told (round 5's `postOut` tell-first); a move refused and held today
(`MV_REFUSED`, the per-move mark) does not hold the posting back — the posting runs, as round 5 kept. Both readers
proposed the same one-place fix (their reports, "Fix"): in `runLoadedPostings`, when in a reducer and joined to a
person's command, set aside each due posting whose man still owes an unheld move, defer it (`cmdDeferEffect`) so the
deferred move pass tells first and the posting lands as the pass's own command behind it. Judge it yourself; prefer
the one place that covers every joining door over six door edits.

**Tests:** add Fable's six roads and the Opus reader's two (proofs `zz-fable-proof-1.test.ts`,
`zz-opus-proof-1.test.ts` in the readers' `proofs/` folder) to `msq-s2-u2fix4-moveday.test.ts`, each expecting
Kestrel and Saber told and `account.told` before `lw.postoutRun`; plus a control: the door's own man, moves told,
posting runs inside the door's command; and a refused move held today, posting still runs.

## Part B — a fresh Opus builder (new faults)

**Your files only:** `raptor-port/src/state/perms.ts`, `raptor-port/src/state/notices.ts`,
`raptor-port/src/state/acctlines.ts`, `raptor-port/src/state/units.ts`, `raptor-port/src/state/people-settings-commit.ts`,
and ONE new test file `raptor-port/src/state/msq-s2-u2fix6-gate.test.ts`. Never `leavewar/sync.ts` or the moveday
test (Part A's).

**B1 — a blank callsign silences a move (the security reader's proof 1, low):** a hand-made
`commitPeopleIntent('people.edit', …)` setting a mover's `cs` to `''` passes the gate; the writer names a line
`x.cs ? String(x.cs) : <id>` while the gate expects `PEOPLE[id]?.cs ?? id`, so every `account.told` for him is
refused each day — 149 never told. The same split in `noticePlanLine` / `planLineViolation` and
`noticePostingFailed` / `postingFailedViolation`. **Fix:** one exported name helper used by the three writers and
the three gate checks; and the belt — the gate refuses a person's command whose after-image callsign is not a
non-empty trimmed name within the roster's limit (`callsignProblem`'s shape) — first check that no door or the
app's own commands write a blank or missing callsign legitimately (a deleted man's tombstone, a placeholder, a
seed); exempt what must be, say which.

**B2 — deleting an expired Plan row erases an owed move (Astra's proof 1):** before the move pass tells, Kestrel
(149's admin) sends a hand-made `grant.remove` of Hunter's Plan of 149, which no longer holds today (his move ended
it); the gate checks Plan authority only for a row holding today, passes it, and the evidence the move owes is gone.
**Fix:** the simplest rule that closes it — e.g. the gate refuses a person's command that removes or rewrites a grant
row that does not hold today (a past row is history; first list every door and the Undo/Redo replay that remove or
rewrite such rows, and keep them working), or refuses any person's command that would erase an untold move's
evidence. Say which you chose and why.

**B3 — a hand-made Plan given with no bell lines (Astra's proof 2):** Kestrel sends `grant.set` giving Mako Plan of
149 with no lines; the gate checks only that supplied lines are justified, never that the owed ones are there — the
same for the person's own account lines (D2251) and the squadron's Plan lines (D2211). **Fix:** for a forward
person's command, work out from its before- and after-images the account and Plan lines the app's own doors write
for that change today, and refuse the whole command if any is missing — keeping re-links that owe no squadron line,
the Undo/Redo leave-out rules, the move telling's own checks, "+ New squadron"'s first admin, and U2L's not-yet-built
lines (above) out of it. Before building, list every door that writes grant rows and confirm each writes its lines
in the SAME command; a door that writes them in a separate command is a reason to stop and hand back, not to loosen.

**Tests:** the security reader's and Astra's three proofs (in `proofs/`) adapted into
`msq-s2-u2fix6-gate.test.ts`, each red first, plus controls: an ordinary Give access through the screen's door still
saves with its lines; an Undo of a give still works; a rename at Quals still works.
