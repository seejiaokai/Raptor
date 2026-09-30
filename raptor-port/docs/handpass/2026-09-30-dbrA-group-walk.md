# Evidence sheet — `[DB-READINESS]` group A, phases 0–5b: the group-wide FULL walk (30 Sep 26)

Branch `claude/db-readiness-table-shaping-4094f6`. The plan of record:
`docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md` (§6 the checks). The per-phase sheets:
`2026-09-30-dbr-phase0.md`, `2026-09-30-dbr-phase5b.md` (and the phase-5 look in the plan's §9). **This sheet is the
group's own FULL check**: the roll-call over every writer of phases 0–5b, the walk (five walkers, each its own copy of
the app), then both reviewers' code reads with this sheet in their hands (D11, D353).

## The eight questions and the tier (bug-check order §5)

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | **YES** — the Leave War's records, its OIL credits and ledger are now saved one row each; a lost or doubled row is leave owed |
| 2 | The published record | **YES** — every issued version and every withdrawal is now its own row, append-only |
| 3 | Saved data | **YES** — the whole group |
| 4 | A shared drawer | NO — no drawing routine changed |
| 5 | A new gesture | **YES** — "Create the first period" (the empty Leave War), "+ Add a course" / "⇪ Import a file…" (the empty Tracker) |
| 6 | A new surface | **YES** — the two empty pages; "RAPTOR has been updated"; "RAPTOR is not set up yet" |
| 7 | Roles | **YES** — `perms.ts` / `data-model.md` §11: `AccessRequestSeen`, `ChangeBatch`, `AccessRequest` loses its U, `access.seen` |
| 8 | The warning list | **YES** — `reconcileIssuedMarks` now reconciles only the command's touched days |

**Tier: FULL.** The server question (D202) is carried by `perms.test.ts` / `perms-scan.test.ts` — green in every phase's gates.

## The rulings in play (a later one wins — D90)

D453 (the order to the database), D354, **D460 / D461** (no Edit person on the war; Quals is the one place), **D462 /
D463 / D464** (the Tracker one piece per thing; no course on an empty database; his charts, syllabi and ball details
kept), **D401** (the conversion must not break a load), **D56 / D54** (demo-data harm is not a finding), D148 / D350
(undo), **D450 / D355** (the day lock to come: the holder OWNS a day's row — the design these rows must fit). No ruling
here clashes with another.

## The roll-call — every writer of every saved record

Drawn from the plan's matrix (§2.5), the phase-4.1 test's battery (`state/changebatch-rollcall.test.ts`), the independent
scenario designer's roll-call (Astra — `docs/superpowers/briefs/2026-09-30-db-readiness-group-a-walk-scenarios-astra.md`
§1), and a sweep of every whiteboard writer (`wb.set` / `wb.delete` callers: the stream consumer `state/rowmap.ts`, the
Leave War's and the Tracker's own row subscribers, `persist.ts writeSeedRows` / `writeLoadedWeekAtBoot`, `boot.ts`'s first
admin, `storage/schema.ts`, the three adapters). **Has it** = the writer reaches storage only inside a command's (or the
boot's) one group, as its own row, named by that group's change-log batch. Every row below was also checked by the walk's
per-step audit (every changed row named by its batch; a reload gives the state back; a reload writes nothing).

| Record → row | Writer(s) | Has it / must not, because… / MISSING | Walked |
|---|---|---|---|
| a week — `weeks/<wk>` | the schedule's commands (`schedWrite`, `commitSched*`) → `persist.ts scheduleRows` | **has it** | W1 |
| a day — `weeks/<wk>#<di>` | every schedule gesture; publish; a drag (two days); `sched.load` (a week switch's landing) | **has it** — **MISSING until fixed (H3):** a week's FIRST save wrote all seven days from the saver's own copy (two people on two days of a new week — the later wiped the earlier); fixed: a first save writes only the days it changed, a day no one saved reads as the week untouched | W1, host (H3) |
| a day at BOOT — the loaded week's re-landing | `persist.ts writeLoadedWeekAtBoot` | **MISSING until fixed (H1):** written bare, no batch; fixed: one `boot` group with its batch, only days already saved | host (H1) |
| an issued version / a withdrawal — `:is:` / `:rx:` | publish, AL, Unpublish, reissue, Undo / Redo | **has it** (append-only) | W1 |
| a request — `inputs/<iid>` | `writeInputs*`, the Inputs page, the calendar, the clash rules, the war's approve, a posting, a delete, Undo | **has it** | W2 |
| a person — `people/<pid>` | Quals, Admin → Users, a posting's run, a delete, `mintPeopleOrd`; the placeholders **must not** (code, never rows) | **has it** | W2 |
| a planning puck / day title — `plan/pp:` / `plan/dm:` | the calendar's `+ Pucks`, a title, a move, a delete | **has it** | W2 |
| a Leave War period / record / ledger / opening / profile | the war's commands → its own rows subscriber (`leavewar/state/store.ts`, `rows.ts`) | **has it** | W3 |
| the war's settings-like keys (`oilpolicy`, groups, orders, colours, rules, `showsans`, …) | ⚙ Settings, Rearrange, Reset order | **has it** | W3 |
| `leavewar/current` (which period is on screen) | a picker switch | has it — but it is shared data that should be per person: **filed for group B** (phase 4) | W3 |
| a history line — `settings/elog:<lineId>` | every logged change (held inside its command), an idle line (`elog.line`), the Admin sweep (`elog.sweep`) | **has it** — see H2 (a text box's and a board edit's line saved as a separate action, not inside its own command) | W1, W2 |
| "seen" — `settings/seen:<pid>` | the changes window's mark-seen | **has it** | W2 |
| an account / access request / an admin's bell — `settings/account:` / `accessreq:` / `reqseen:` | Admin → Users, a sign-up, approve / decline, a posting's suspend, a delete, the bell | **has it** | W2 |
| settings (`rules`, `stores`, templates, `qualcols`, defaults, `guestview`) | Admin, the Logic page, the + Wave / + Block editors (`store.set` → the settings command) | **has it** | W2 |
| the schema stamp — `settings/schema` | the boot, the fold, the first admin | has it — the boot's own group | W4 |
| the change log — `changes/<id>` | the sealer, one per saved group; the newest 200 kept | **has it** | all |
| the Tracker's course / enrolment / chart / details rows | the row door (`app/rows.js`) under every Tracker save | **has it** (phase 5b) | W5 |
| the Tracker's marks, dates, pace, lulls, layout, plan | the Tracker's gestures, its own Undo / Redo | **has it** | W5 |
| the Tracker's "last worked" pointers (`…:last:<student>`, `…:lastStudent`) | a grade (`noteLastEdit`), a removal sweep | **to check (Astra B):** written inside the grade's group but not among its command's own changes | W5 |
| the Tracker's migration flags after first mount (`…:rostermig`, `…:idmig`, `idmap`, `v3:links`) | an Import of a course this browser does not have (`applyStudents` → `migrateIds`) | **to check (Astra A):** suspected bare writes, no batch | W5 |
| the Tracker's first mount (seed, one-time migrations, their flags) | `core.js init` | **must not** be a command — the one named exempt writer (its own world, once) | W4 (shared store), W5 |
| per-browser preferences (`ocuLocal:*`, the Tracker's bar) | `prefSet` | **must not** — this browser's own view, never shared data | — |
| a medical document's bytes | `docAdd` → IndexedDB | **must not** in group A — its file store is IT's to choose (§12 q2); only the request's `docIds` ride its row | W2 |
| sign-in / sign-out / role / the admin's member view / the undo stacks | session state | **must not** — memory only | W2 |

## Who designed the scenarios

Astra (Codex, one reviewer — D353), blind to the build's own tests: `docs/superpowers/briefs/2026-09-30-db-readiness-group-a-walk-scenarios-brief.md`
→ `…-walk-scenarios-astra.md` (a roll-call, 27 ranked scenarios, two lines it judged already missing — Tracker A and B —
and five questions). The walkers started on the plan's own §6 list while Astra read (a 140-file diff took it over an
hour); each was sent Astra's scenarios for its area the moment they landed, before any code read (observation #388).
**Astra's five questions, checked against the rulings before anything went to him (D53):** Q2 (where a new person first
lands in the Tracker) is D376; Q4 (which period a person sees) is filed for group B; Q1, Q3 and Q5 are technical calls
(the Tracker's undo and its landing — R110 / D372's scope, unchanged; an Import as one group — filed
`[TRK-IMPORT-ONE-GROUP]`; an Undo back to pristine leaves the week's rows — kept, see W1-3 below). None needs him.

## The walk

The frozen production build (`dist-walk`, a copy of the build — never rebuilt while walked), `vite preview`, the Browser
backend; five walkers (Opus, D16), each its own port and fresh browsers, desktop 1440×900 and phone 390×844; the host
reproduced its own three first (`$TEMP` scripts, the checks below). **Every step, through the app's own controls, ran
three mechanical checks** (the shared driver `scripts/handpass/dbrA-lib.mjs`, observation #387): every row it changed is
named by its change-log batch with the right op; the app's state after a reload equals the state before it; the reload
itself writes nothing. Every picture opened before its step counted.

| Walker | What | Checks | Result | Scripts · results · pictures |
|---|---|---|---|---|
| W1 | the schedule: Edit Schedule, the board, publish, AL, Unpublish, reissue, Undo / Redo, plans, templates, defaults, OIL Earn, week switches, two tabs, the phone | 403 | 399 — the 4 failures are H1 and H3 (below), found and fixed by then | `dbrA-W1-*.mjs` · `parts/dbrA-W1-{a..h}.json` · `W1/` (180) |
| W2 | requests, the calendar, Quals, Admin → Users, postings, accounts and access requests, the bells, the change history, settings, roles, documents, two tabs, the phone | 708 | 704 — W2-F1, W2-F2 | `dbrA-W2-*.mjs` · `parts/dbrA-W2-{a..g}.json` · `W2/` (197) |
| W3 | the Leave War: bids, decisions, moves, deletes, two records on a day, awards, the OIL tracker, stages, the lifecycle, ⚙ config, Undo / Redo, a member, two tabs, the phone | 678 | 671 — W3-F1, W3-F2, W3-F3 | `dbrA-W3-*.mjs` · `parts/dbrA-W3-*.json` · `W3/` (140) |
| W4 | the conversion (`main`'s build → this one, same address), damaged old bundles, a schema bump, damaged rows, the shared-store build | 317 | 315 — W4-F1 | `dbrA-W4-*.mjs` · `parts/dbrA-W4-*.json` · `W4/` (109) |
| W5 | the Tracker: every writer the 5b walk left, Export → Import, its Undo / Redo, two tabs, Astra's Tracker scenarios, the phone | 470 | 462 — W5-1 … W5-4 | `dbrA-W5-*.mjs` · `parts/dbrA-W5-{a..g}.json` · `W5/` (71) |
| host | a boot on a saved week (H1); undo of an off-week edit (N1); two tabs on one new week (H3) | 13 | H1, H3 found; N1 sound | `scripts/handpass/dbrA-host-{bootland,offweek,2tab-week}.mjs` |

**What held, everywhere it was walked (2,576 checks):** every request, person, planning note, day, issued version,
withdrawal, war record, award, opening, profile, history line, "seen" mark, account, access request, bell, setting and
Tracker row reached storage as its own row, named by its action's batch, and came back exactly after a reload; no reload
wrote anything (the one exception is H1/W4-F1, fixed); two tabs changing DIFFERENT records kept both (requests, pucks,
day titles, bids, awards, students, charts, courses, accounts, bells); deletes stayed deleted against a stale tab (outside
W3-F2, fixed); **the conversion carried a `main`-written browser of every kind across whole — 18 comparisons, his kind of
Tracker work (charts, a renamed and a deleted built-in, layouts, fonts, details, students, marks, dates, pace, lulls)
identical, Export identical (D464) — and a second reload wrote nothing**; every damaged old bundle and every damaged row
still loads, its bytes untouched; a shared store seeds nothing, refuses `ad`/`a`, and holds only what its first admin made.
No console error, page error or failed request in any walker's run (the one expected: the format-8 refusal).

## What the walk found, and each disposition

| # | Found | Class | Disposition |
|---|---|---|---|
| **H3** | two people editing DIFFERENT days of a week nobody had saved: the second one's first save wrote all seven days from its own copy and wiped the first's (host; W1 E1, H24d — also through the Inputs page) | MISSING line — a first save writes rows its command did not change | **FIXED** — a first save writes the week row, its issued rows and only the days it changed; a day with no row reads as the week untouched; a landing is saved only onto days already saved (`persist.ts scheduleRows`, `weekrows.ts rowsToParts`, `rowmap.ts` hands the composer its envelope). Tests red first: `persist.test` (first save alone; a week saved a day at a time reloads whole), `weekrows.test`, `weekrows-store.test`. |
| **H1** | a boot on a saved week re-landing a request filed since wrote that day's row with no batch (host; W1 H24c); **W4-F1** — a missing week row was re-created at load the same way | MISSING line — a writer outside every group | **FIXED** — the boot's write is one `boot` group with its batch (`changebatch.ts systemGroup`), and only onto rows already stored (so a missing week row is not re-created). Test red first: `persist.test` (a boot on a saved week). |
| **H2** | an edit's history line saved as a SECOND action (`elog.line`, by the system) before the edit's own — a text box, and every board edit that makes its change and then opens its command (W1's list: notes, puck drags, seat fills, + Wave, + Line, row ✕, plans, templates, Discard & load, OIL Earn, the phone) | MISSING line — the line given before its command opened | **FIXED** — a line given with no command running is held for the turn and adopted by the person's next command (`editlog.ts hold` / `elogAdoptHeld`, `commit.ts onPipelineBegin` — origin `user` only); the board's twelve structural gestures log first (`board.ts`); a line no command claims goes through its own door at the end of the turn, as before — left: a line worded from its result (`[ELOG-LINE-AFTER-COMMAND]`). Tests red first: `elog-rows.test` (a board-style edit; a text box through its real commit; a structural edit). |
| **W5-1** | a Tracker Import bringing a course this browser never had wrote `…:rostermig` / `…:idmig` bare (Astra A) | MISSING line | **FIXED** — after the first mount the course conversions' flags, map and `v3:links` keep their raw write, run inside a `trk.meta` command of its own — one saved group, one batch (`core.js metaWrite`; `perms.ts`). Test red first: `trk-restore.test`. |
| **W5-2** | three Tracker actions saved as TWO groups: 🗑 delete a built-in, ↺ restore it, ✓ Save changes that deletes a marked ball (and Revert edits) | WRONG line — an `await` between two writes | **FIXED** — `saveSylPrefs` starts both writes in the gesture's turn; `sweepChart` runs the chart's own save inside its gesture. Tests red first: `trk-restore.test` (two). |
| **W3-F2** | deciding (Ack / Refuse) the FIRST of two records on a man's day rewrote the OTHER record's row (its place moved); from a stale tab, a record someone deleted came back | WRONG line — the decided record moved to the end of the day | **FIXED** — the decided record keeps its place (`decideRequest`), and so does an updated OIL credit (its twin). Test red first: `leavewar/rows.test`. |
| W5-3 | a stale tab can undo the FIRST save of the Tracker's chart order (only the order) | first-write-places-all | **FILED** `[TRK-FIRST-ORDER-PLACE]` (low, group B) |
| W5-4 | the first Tracker Undo of a mark stores a pace, lulls and dates nobody set (defaults; nothing on screen) | old undo snapshot (probably `main` too) | **FILED** `[TRK-UNDO-WRITES-DEFAULTS]` (low) |
| W1-2 | an Undo of a publish DELETES the issued version's row; its Redo writes the same key again — against AM4 (never erased) and AM32 (Undo of a publish = Unpublish) | known since 24 Sep (Q6), made a real delete by the rows | **FILED** `[UNDO-PUBLISH-ERASES-ISSUANCE]` — with group B, where "has the database registered it?" is answerable (`undo-contract.md` §4) |
| W1-3 | an Undo back to pristine leaves the week's rows stored | technical — the screen and the reload are exact; on a shared store the pristine week is blank; after H3 only the week row and that day remain | **kept** (no harm reaches the database) |
| W2-F1 | a fresh DEMO browser: two tabs' first account writes — the second rewrote the seeded accounts and undid the first's suspension | demo only — a shared store stores its first admin's account at boot | **FILED** `[ACCOUNTS-SEED-FIRST-WRITE]` (low) |
| W2-F2, W3-F1 | a setting that holds a list (templates…) and a Leave War period (stage, window, events) are ONE row each — two admins at once, the later write wins in the stand-in | the plan's decision (§2.5); the database refuses a stale write (`data-model.md` §9, `If-Match` — reject and reload); the stand-in has no row versions | **decided, kept** — `LeaveWar` added to §9's conflict table; `[SETTINGS-LIST-ROWS]` filed for a stage-2 split only if it bites |
| W3-F3 | the OIL tracker's correction date calendar opens hidden | screen, not storage | **FILED** `[LW-OIL-DATECHIP-HIDDEN]` |
| W1 (seen) | the "Set as default order?" offer drawn behind the board; + Block and a document's removal write no history line | screen / old behaviour | **FILED** `[SECDEFAULT-OFFER-BEHIND-BOARD]`, `[BLOCK-NO-HISTORY-LINE]` |
| W4 (seen) | a shared store opens on the demo's week; a damaged week's notice says "the device that created it"; the war's personnel label has no control | not storage; `main` the same | **FILED** `[SHARED-OPENS-DEMO-WEEK]`, `[READONLY-WEEK-WORDS]`, `[LW-LABEL-NO-DOOR]` (a question for him) |
| Astra B | the Tracker's "last worked" pointers outside the grade's own command changes | checked in the app: they ARE named by the grade's batch (W5 F2) | **no defect** (whether Undo restores the landing is D372 / R110's scope) |

**Explicit negatives (walked, sound):** an Undo of week A's edit pressed on week B saves week A's row (host N1); navigation
writes nothing; the pagehide flush keeps three quick edits across a close; every Undo / Redo writes exactly the inverse
rows with its line inside; a moved Leave War bid is one put of the same key; the member's refused saves, the admin's member
view, a guest and a waiting person write nothing; document bytes never enter the rows; the history's "seen" is per person
and survives sign-out.

## The re-walk of what the fixes touched (the fixed build, pictures `docs/img/handpass/2026-09-30-dbrA-rewalk/`, results `parts/dbrA-rewalk-*.json`)

The walkers' own scripts, re-run unchanged as assertions of the right behaviour, into a separate folder (the first walk's
pictures are the defects' evidence):

| Part | Walks | Result |
|---|---|---|
| W1-a | first saves, the board's gestures, Undo to pristine | 44 / 44 — **every gesture's history line now inside its own batch** (W1-3b + Wave and W1-3c a row ✕ included, `sched.mutate/2`) |
| W1-e | two tabs on a NEVER-saved week (H3) and on a saved one | 12 / 12 — **both edits kept** |
| W1-h | Undo / Redo / close; a request filed in another tab on another week (H1 via the Inputs page; H3 via a landing) | 34 / 34 |
| W3-f | two tabs on the war — the two-record day (W3-F2) | 77 / 81 — **W3-F2 fixed**; the 4 left are W3-F1 (one period row: the stand-in lets the later write win; the database refuses it — kept by decision) |
| W4-weekrow, W4-day | a missing week row; a damaged day row | 10 / 11 and 17 / 19 — the three left assert the OLD first save (all seven day rows stored, their ids fixed at save) or a landing's write (below): the premise the fix consumed, read against the new flow (§5 "the re-walk") — **the week row is no longer re-created at load (W4-F1 fixed)**; the damaged week's bytes untouched |
| W5-b, W5-f, W5-g | a built-in's delete / restore; an Import of a new course; ✓ Save changes that deletes a marked ball | 83 / 83 · 41 / 41 · 121 / 121 — **each one saved group; the import's bookkeeping named** |
| host | a boot on a saved week (H1); two tabs on a new week (H3) | 5 / 5 · 8 / 8 |

**Read against the new flow, said plainly:** (1) a day no one has saved re-reads as the week untouched at every load, its
rows' hidden ids minted afresh, as a never-saved week's always were — nothing durable points at them (an edit to that day
saves it, ids and all); the shared driver sets aside exactly those ids on exactly such days (`dbrA-lib.mjs`
`reloadCompare`). (2) A request landing on such a day is marked "landed" on the request itself: the first load of that
week after a reload saves that mark once, inside the load's own `sched.load` action with its batch — not a loss, not a
clash, and the plan's phase 6(c) removes the re-landing writes altogether. (3) A line worded from its action's result (the
OIL switches, a plan switch, a day template applied, a version loaded) still follows its command as its own saved group
with its batch — filed `[ELOG-LINE-AFTER-COMMAND]`; the board's twelve structural gestures now log first
(`src/ui/board.ts`, pinned by `elog-rows.test`).

## Break tests (§8.4) — each fix taken out once on purpose, its test red, then put back

| Taken out | Red |
|---|---|
| the boot's write back to bare (no `systemGroup`) | `persist.test` — a boot on a saved week saves its re-landing in one group with a batch |
| a first save of all seven days | `persist.test` — an edited week is its week row and the day edited, alone |
| the held line's adoption by the next command | `elog-rows.test` — a board-style edit; a text box through its real commit (both) |
| `saveSylPrefs` awaiting between its writes; the chart saved after the sweep; the course flags unclassified | `trk-restore.test` — delete then restore a built-in; Save changes with a marked ball gone; an Import of a new course (all three) |
| a decided record moved to the end of its day | `leavewar/rows.test` — deciding the first of two records |

## Not walked, and why

- **Scenario 26 (a shared store's first-admin configuration failures):** needs bundles rebuilt with bad settings — not
  rebuilt during the walk; six fail-closed cases in `src/boot.test.ts`.
- **Two real computers:** two tabs of one browser stand in; the app never re-reads storage while open, so live refresh
  and the same row edited twice (the database's reject and reload) are group B's.
- **Partly walked:** the phone beyond one action per area; plan rename / delete; a post-in date change; two admins
  approving one request at once; Admin → Data "Clear old clutter"; the Leave War's posting in / out sheet on the grid,
  event Move…, the OIL policy, Reset counters; the Tracker's keyboard undo and the ⇅ windows' drag (▲▼ used); a Leave
  War personnel label (no control exists — filed).
- **`main` compared on screen only by W4** (the conversion); elsewhere "on `main` too" is read from `main`'s code.

## Gates (30 Sep 26, under the PC lock — after the walk's fixes)

The first run after the fixes found 41 unit failures, every one the fixes' own doing and each read and settled: 31 in the
Tracker (a first form of the import fix routed the course conversions' flags as records, and a test that deletes a flag
behind the Tracker's mirror no longer saw it written back — reworked: the conversion's raw write kept, run inside a
`trk.meta` command of its own, `core.js metaWrite`); 9 history tests that write a line with no command running and read it
on the next line (they now wait for the end of the turn — the new contract); one person-delete test that relied on the
first save storing all seven days (its save now changes both days it reads). The second run: **unit 7310 / 7311** (459
files — the one, `leftovers.test.tsx`'s focus trap, passes 3 / 3 alone and passed in the first run: a timing flake under
the full suite's load) · **build** · **tfin 728 / 0** · **e2e 509 passed, 0 failed** (49 skipped) · **smoke 445 / 0** ·
**rulecheck** · **docsize** (OVER by 63, deferred — D29, a change touching `src`) · **perf 4 / 4** (oneEdit 1.33×, noop 1.40×,
board 1.30×, noopB 1.46× the reference — inside the phases' spread). After it, the board's structural gestures were
reordered to log first (H2's remainder) — `board.test`, `elog-rows.test`, `histbubble.test`, `editlog.test` 217 / 217; the
full set runs again with the reviewers' fixes.
