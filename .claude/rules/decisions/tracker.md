---
paths:
  - raptor-port/src/tracker/**
  - raptor-port/docs/tracker/**
  - raptor-port/scripts/tracker/**
  - raptor-port/docs/**/*tracker*
  - raptor-port/docs/**/*tracker*/**
  - raptor-port/docs/**/*trk*
  - raptor-port/scripts/handpass/trk-*.mjs
  - raptor-port/src/ui/logout.ts
  # the seams where the Tracker meets the rest of the app (widened 24 Sep 26, the spring clean's red team):
  # its architecture below binds these files too, so a session editing them must load it
  - raptor-port/src/main.tsx
  - raptor-port/src/state/store.ts
  - raptor-port/src/storage/**
  - raptor-port/src/command/**
  - raptor-port/src/undo/**
  - raptor-port/src/ui/Shell.tsx
  - raptor-port/docs/data-schema.md
  - raptor-port/docs/data-model.md
  - raptor-port/docs/undo-contract.md
---

# Rulings — the Tracker

**Loads by itself** whenever a session reads a Tracker file (the `paths:` at the top of this file), so work that strays into the
Tracker from anywhere else picks these up too. The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md`. Newest first; each row keeps the date it was recorded.
**Also read** — in How we work, so already loaded: **D62** and **D63** (the Tracker's syllabus data is out of
every privacy sweep; the aircraft type elsewhere reads "F-15" or "fighter squadron").

**No student name, mark or date may enter the repository** (its seed data, `src/tracker/data/`, is verbatim course
content only). The reason once given was "the repository is public"; it has been PRIVATE since 23 Sep 26 (D59) and
the rule stands — collaborators will read it (`raptor-port/docs/tracker/known-gaps.md`). *(Copied here 24 Sep 26 so
it loads with the Tracker's files.)*
**Where the detail lives:** its architecture — §Architecture at the foot of this file (moved from
`raptor-port/CLAUDE.md`, 24 Sep 26); its screen — `raptor-port/docs/ui-contracts.md` §The Tracker tab; its gaps and
carried-over traps — `raptor-port/docs/tracker/known-gaps.md`; what it stores — `raptor-port/docs/data-schema.md`
§World 3; the model for the database step — `raptor-port/docs/data-model.md`; its browser suite —
`raptor-port/scripts/tracker/smoke.mjs`; its files — `raptor-port/docs/file-map.md`.

| # | Date | His ruling, in his words where short enough | What it means | Where it lives now |
|---|---|---|---|---|
| D190 | 25 Sep 26 | *"Fix [TRK-SMOKE-ADD-RACE] in OUTSTANDING.md on a new branch. First record my go-ahead as a ruling (moving it ahead of its planned place, and running in parallel with the D175 chat)"* · *"Find out whether the app itself loses the typed name (a real bug) and fix the cause, not the wait. Use ruling numbers D190–D199 and port 4180. Another chat runs in parallel: never run the full checks while it is running them. Whichever of us merges second takes main in first."* — after the smoke suite's "+ Add" step stopped GitHub's checks three times on 25 Sep 26 at the same place (after "+ Add" on the Tx 2026 syllabus the event box never opened), each passing on a re-run | **`[TRK-SMOKE-ADD-RACE]` GOES NOW, AHEAD OF ITS PLACE LINE** (which put it after `[TRK-PINCH-ASK]`, before the next Tracker change to the smoke suite), **on its own branch, IN PARALLEL with the D175 chat** (`[REQ-TWO-ROWS]` + `[REQ-DECLINED-PENDING]`). **The job is the APP, not the test:** find out whether the Tracker itself can lose a name he has typed into the add box (a real bug he would meet), and fix what causes it — never a longer wait that hides it. **The parallel conditions, part of the ruling (D86's shape):** this chat serves on port 4180 and numbers its rulings D190–D199; it never runs the full checks while the other chat is running its own; whichever of the two merges second takes `main` in first (D78). Safe in parallel because the Tracker has its own code and store | `OUTSTANDING.md` `[TRK-SMOKE-ADD-RACE]` (its Place line) and the priority list; `HANDOFF.md` §Now (this branch's block); `DECISIONS.md` (the range, beside the others) |
| D158 | 24 Sep 26 | **"12 nope never seen after testing"** — asked whether the first tap on a Tracker button after a drag or pinch has ever done nothing on his iPhone | **NOT A REAL-DEVICE PROBLEM: `[TRK-TAP-AFTER-DRAG]` IS CLOSED** as a quirk of the test browser's touch emulation, as the item itself provided. Reopen only if he sees it on a real phone | `OUTSTANDING-ARCHIVE.md` `[TRK-TAP-AFTER-DRAG]`; this row |
| D157 | 24 Sep 26 | **"7 c"** — shown the Tracker's flow chart three ways (A its own colours, B Raptor's backgrounds, C fully Raptor) | **THE TRACKER TAKES RAPTOR'S COLOURS FULLY — backgrounds, text AND the event colours** (flight, academic, test, sim, device, marginal and fail in Raptor's tones; sim turns from yellow to amber). Chosen over the agent's recommendation (B: Raptor's backgrounds, the Tracker's bright event colours kept for reading a busy chart). A small build: the Tracker's colour settings AND its fixed event colours move to Raptor's; check the chart still reads at a glance on a phone | `OUTSTANDING.md` `[TRK-PALETTE-ASK]`; on build: `raptor-port/src/tracker/tracker.css` and `raptor-port/src/tracker/app/core.js` (`TYPE_COLOR`, `GRADE_FILL`) |
| D134 | 24 Sep 26 | **"1 & 2 keep that no change"** — answering the two feel questions left by the pinch fix (`[TRK-PINCH-ASK]`; both final reads raised them) | **THE PINCH TAKE-BACK STAYS AS BUILT.** (1) In Edit chart layout, a ball dragged ON PURPOSE and then joined by a second finger goes back to where the drag began — any second finger, however long the first had been down, means a zoom. (2) After a pinch, the finger left down does nothing until it lifts, in both modes — it does not carry on scrolling. Do not re-propose either | `raptor-port/docs/ui-contracts.md` §The Tracker tab; `raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md` §11; `OUTSTANDING.md` `[TRK-PINCH-ASK]` |
| D132 | 23 Sep 26 | **"Keep them hidden (Recommended)"** — asked (re-asked in plainer words after *"If I export a syllabus it won't have any markups, so what are u talking about"*) what happens to the marks students ALREADY have in this app on a ball that an imported chart no longer has | **AN IMPORT NEVER DELETES ANYONE'S MARKS.** A chart brought in with "Replace it" that drops a ball leaves that ball's marks stored, out of sight; importing the old chart back brings the ball and its marks back. The accepted catch: a NEW ball later given that code shows the old marks. Confirms the 9 Sep rule (a chart import writes no mark) and sets D124's wipe as a Save-changes / Revert thing only, never an import thing. On his database route (wipe, then import) it never arises — there are no marks yet | `raptor-port/docs/tracker/known-gaps.md` (head note); `raptor-port/src/tracker/app/core.js` `applyCharts` (the rule's comment); `raptor-port/docs/handpass/2026-09-23-tracker.md` §4 roll-call B, §11 |
| D131 | 23 Sep 26 | **"Leave it (Recommended)"** — asked whether a backup file should carry deleted courses (the two code reads, Fable F-A: a deleted course can be restored in this browser, but not after export → wipe → import) | **A BACKUP DOES NOT CARRY DELETED COURSES — LEAVE IT.** Student data is demo data before the database step (D120); to keep a deleted course, restore it before exporting. **The agent's call, stated to him:** the delete question says the course can be brought back **in this browser**, so it promises no more than it does | `raptor-port/docs/tracker/known-gaps.md` (the course-delete entry); `raptor-port/src/tracker/app/core.js` `delCourse` (the question's words); `raptor-port/docs/handpass/2026-09-23-tracker.md` §11 |
| D130 | 23 Sep 26 | **"Delete them too (Recommended)"** — asked whether a deleted ball's typed details (name, hours, crew…) should go with it (the two code reads, Fable F-F: they stayed stored and came back on a later ball with the same code) | **DELETING A BALL ALSO DELETES THE DETAILS TYPED ON IT.** Extends D124 (its marks go): a deleted ball leaves nothing behind, and a new ball with that code starts with nothing typed on it (on a built-in chart a code the chart shipped with still shows the document's wording — that is not typed work). Same moment as the marks — at ✓ Save changes (and "Revert edits only" for the balls the edits had added); undoing the delete before the save still brings everything back | `raptor-port/docs/tracker/known-gaps.md` (head note); `raptor-port/docs/ui-contracts.md` §The Tracker tab; `raptor-port/docs/handpass/2026-09-23-tracker.md` §11 |
| D129 | 23 Sep 26 | **"Ask at logout (Recommended)"** — asked what should happen when someone logs out of the app with Tracker chart edits they have not saved (the four open questions of the Tracker's `[HUMAN-RETEST]`, §0) | **LOGGING OUT WITH UNSAVED TRACKER CHART EDITS ASKS FIRST: SAVE THEM / DISCARD THEM / STAY.** The next person on that browser never lands on someone else's half-done chart. Replaces the [HUMAN-RETEST] F10 interim, where the draft waited behind ✓ Save changes for whoever signed in next. **The agent's reading, stated to him:** it is the logout that asks (the Raptor Logout, which ends the Tracker's session through its one existing seam); a reload or a closed tab keep the browser's own leave-the-page question, as today | `raptor-port/docs/tracker/known-gaps.md` (head note); `raptor-port/docs/ui-contracts.md` §The Tracker tab (on the build); `raptor-port/docs/handpass/2026-09-23-tracker.md` §0 |
| D128 | 23 Sep 26 | **"A restore button (Recommended)"** — asked about finding F12: deleting a course says "marks remain in storage", but nothing on screen brings them back | **A DELETED COURSE CAN BE RESTORED.** Deleted courses are listed in the course ⇅ Reorder window with ↺ Restore, the way deleted built-in charts already are; restoring brings the course back with its students and marks, under its own id. A wrong tap loses nothing. The delete question's words change to say so | `raptor-port/docs/tracker/known-gaps.md` (the course-delete entry); `raptor-port/docs/ui-contracts.md` §The Tracker tab (on the build); `raptor-port/docs/handpass/2026-09-23-tracker.md` §0 |
| D127 | 23 Sep 26 | **"Remember it (Recommended)"** — asked about finding F8: a built-in chart he deleted comes back after export → wipe → import | **THE EXPORT FILE REMEMBERS A DELETED BUILT-IN CHART.** After the import it stays deleted — restorable from ⇅ Reorder, exactly as before the wipe. Part of D120: the round trip must bring back the app as he left it | `raptor-port/docs/tracker/known-gaps.md` (head note); `raptor-port/docs/handpass/2026-09-23-tracker.md` §0 |
| D126 | 23 Sep 26 | **"Only that chart (Recommended)"** — asked where event details (name, hours, crew, prerequisites) typed on one chart should show (walker finding W1-8; Astra #3/#5) | **EVENT DETAILS BELONG TO THE CHART THEY WERE TYPED ON.** A detail typed on Tx stays on Tx; 2026's event with the same code keeps its own. Why, as told to him: the same code can be a different sortie on different charts (Tx's BFM-5 flies the long course's BFM-7). The cost he accepted: a change wanted on every chart is typed once per chart. **Settles the question D122 left open**, so the D122 fix becomes: an export carries each chart's own detail edits, and an import writes only the imported charts' details. Keeps R83's recorded rule ("an edit on one chart never rewrites another chart's wording") | `raptor-port/docs/tracker/known-gaps.md` (head note); `raptor-port/docs/data-schema.md` §World 3 (the details record, on the build); `raptor-port/docs/handpass/2026-09-23-tracker.md` §0 |
| D124 | 23 Sep 26 | *"yes deleting a ball should also wipe its marks and a new ball with the same code dont come up graded"* — answering walker finding W2-F7 | **DELETING A BALL WIPES ITS MARKS.** Every student's grade, failures and dates on that event go with it, so a new ball later given the same code starts ungraded and is not counted in Overall. (Undoing the delete before it is saved still brings the ball back as it was — the chart edit's own undo.) | `raptor-port/docs/tracker/known-gaps.md` (head note); `raptor-port/docs/handpass/2026-09-23-tracker.md` §0 (the fix is next) |
| D123 | 23 Sep 26 | *"Last flown should just show the latest date flown, even if a flight that is earlier date. that is input after. So for e.g TR-2 is todays date, and TR-1 i put 21 sep. the last flown will follow the latest date which is today."* — answering walker finding W2-F3 | **LAST FLOWN IS THE LATEST DAY ACTUALLY FLOWN, WHATEVER THE ORDER THEY WERE ENTERED.** It keeps R50's "the most recent flight always wins" for entry order, and replaces the forward-only ratchet under it. **The agent's reading, stated to him:** it is worked out from the flights marked done, so correcting a flight to an earlier day, or un-marking it, pulls Last Flown back to the latest flight still flown (today it can never come back down — once to a future day). A box left briefly empty while a day is retyped is not a day flown (W2-F2 read it as today). Whether a hand-typed Last Flown still stands until the next flight mark changes it is left as it is today | `raptor-port/docs/tracker/known-gaps.md` (head note); `raptor-port/docs/handpass/2026-09-23-tracker.md` §0 (the fix is next) |
| D122 | 23 Sep 26 | *"its ok to reset the event details like dco failures etc when importing, but the details such as hours, pre requsites, crew pairing etc should not be wiped out"* — answering walker finding W1-9 (a one-chart import reset event-detail edits on OTHER charts) | **AN IMPORT MAY RESET STUDENT MARKS; IT MUST NEVER WIPE AN EVENT'S TYPED DETAILS.** Marks — grades such as DCO, failures, their dates — may be reset by an import. The details typed into an event — hours, prerequisites, crew pairing, name, type/format — must survive every import. **The agent's reading, stated to him:** an import brings in the file's OWN detail edits and never overwrites a detail here with the shipped wording (today the export carries the whole shipped table, so importing one chart put shipped values back over edits on other charts). **Not settled by this:** whether a detail typed on one chart should show on every chart with that event code (the shared-vs-per-chart question, still his) | `raptor-port/docs/tracker/known-gaps.md` (the head note "The route to the database"); `raptor-port/docs/handpass/2026-09-23-tracker.md` §0 (the fix is next) |
| D121 | 23 Sep 26 | *"For the tracker, admin and member should have the same access authority"* — said during the Tracker's `[HUMAN-RETEST]` | **IN THE TRACKER A MEMBER CAN DO EVERYTHING AN ADMIN CAN — THE FILE MENU TOO.** Supersedes the one exception in his 7 Sep 26 second word (*"…except the file portion which is admin only"*): ⇪ Import and ⤓ Export stop being admin-only, and the Tracker no longer reads the login's role at all. **The agent's reading, stated to him so he can correct it:** everything else in the Tracker was already everyone's, so "the same access authority" can only change the File menu. **What it means in practice, told to him:** a member can Import a file (replacing a chart after its question, and bringing in students and marks after its one yes) and Export a copy (with student names and marks when ticked — the Export window's warning stays). The rest of the app's roles are untouched | this file §Architecture (the Tracker paragraph, moved from `raptor-port/CLAUDE.md` 24 Sep 26) and `raptor-port/CLAUDE.md` §Where things live (its row); `raptor-port/docs/tracker/known-gaps.md` (preamble); `raptor-port/docs/ui-contracts.md` §The Tracker tab; `raptor-port/src/tracker/role.js` |
| D120 | 23 Sep 26 | *"before i bring this app into the database, i will export the syllabus that is already hand drawn by me which consist of the pokeball and all the syllabus details out. Then wipe the app, then upload the data into the tracker. So based on this workflow, i dont want u to chase bugs that is already mitigated by this"* — said as the Tracker's `[HUMAN-RETEST]` began | **THE TRACKER'S CHARTS REACH THE DATABASE BY EXPORT → WIPE → IMPORT, SO A BUG THAT ROUTE ALREADY REMOVES IS NOT A FINDING.** It is D56 applied to the Tracker, with the route named. **Dropped from every Tracker check:** anything that lives only in data stored today (every student, mark, date and course in the Tracker now is demo data); the start-up converters that upgrade OLDER stored data (course ids, chart ids, student ids, the old `ocu:` keys) — nothing written from now on passes through them; and reading OLDER file formats, because the file he imports is the one he has just exported. **What it makes MORE important — the agent's reading, stated to him so he can correct it:** that round trip is now the ONE path by which his hand-drawn charts survive, so a CURRENT export or import that loses or changes a ball, a line, a position, a font, a chart name or any event detail is a real finding, and the highest one. And marking, students, dates and everything else the Tracker does must still work — new data after the wipe goes through all of it. **The guard D56 set still holds:** if the app would do it again to NEW data, it is a finding | `raptor-port/docs/tracker/known-gaps.md` (the head note "The route to the database"); `raptor-port/docs/superpowers/briefs/2026-09-23-tracker-retest-scenarios-brief.md` (the reviewers are told); `OUTSTANDING.md` [HUMAN-RETEST] and [DB-STEP] |
| D64 | 23 Sep 26 | His instruction that the Tracker's grey hint text in the event box's format field should read the bare type too. **His exact words are not reproduced, for the same reason as D58 and D63** — in substance: "only the grey hint text in the format field, change it to F-15" | **NARROWS D62 AND D63 — the Tracker is no longer left ENTIRELY.** The one hint the event box shows in its "Type / format" field now reads "e.g. Lecture, OFT/AMT, 2 x F-15". **Everything else about the Tracker stays exactly as D62 ruled:** its syllabus data (the 52 mentions inside `raptor-port/src/tracker/data/`) and the smoke-test lines that assert that data are still out of scope and still left. The newer ruling wins where they overlap (newest-instruction-wins); the D62 and D63 rows are marked so a later reader does not follow the older "leave the whole Tracker" | `raptor-port/src/tracker/components/Modals.jsx` (the hint); the D62 and D63 rows below, now marked narrowed; memory `app-carries-no-unit-designation` |

## Architecture — moved from `raptor-port/CLAUDE.md` §Architecture rules (24 Sep 26)

The Tracker's architecture rules, MOVED WHOLE, word for word (D138), so they load with this area instead of
in every chat (D140). The rules every area shares — the store, the mutation and persistence funnels, what
persists, the one command layer — stay in `raptor-port/CLAUDE.md` §Architecture rules. Paths inside this
section are relative to `raptor-port/` (as they were in that file).

**The Tracker tab is a THIRD app with a THIRD store** (vendored 7 Sep 26,
`src/tracker/`, from `seejiaokai/Tracker` — plain JavaScript/JSX, `allowJs`,
bodies are verbatim ports like `src/engine/`). Its state is module `let`s in
`tracker/app/core.js` with its own subscribe/notify; its storage goes through
ONE doorway, `tracker/storage.js` (inside Raptor it goes through the whiteboard
under `raptor:tracker/…`; the bare `ocu:` localStorage path is the standalone/
no-target fallback, and legacy `ocu:` keys are imported once — corrected
17 Sep 26, see `docs/data-schema.md` §World 3 — the
standalone app's SharePoint/Dataverse/Firebase layers were dropped; the shared
database replaces this file when it arrives). **The store is the record; the
.json file is a FORMAT, not a store** (owner, 9 Sep 26 — "I thought it should
be auto synced … isn't it duplicating"): marks, dates, students, event
details (PER CHART — D126) and a moved ball save themselves, ✓ Save changes writes STRUCTURE
edits (events, prerequisites, lines, fonts) to the store and nothing else,
and the File menu is TWO one-way moves — ⇪ Import (a file in: charts
always, chart by chart with replace/add-as-new; students & marks only after
an explicit yes — one button for both "a chart drawn up elsewhere" and "the
whole export back in after the database move", owner's ask) and ⤓ Export (a
backup before the database move, or a handover). The old model — 📁 Open binding a live file handle that Save changes
wrote back to — is gone; don't re-add a bound file. **Nothing of it boots in
`main.tsx`** — the screen is a lazy chunk and `core.init()` runs on the tab's
first mount, which is also why the section is KEPT MOUNTED afterwards (the flow
board is drawn imperatively once). **Three seams cross the boundary, and only
three:** `resetSession` ends the Tracker's login session through `tracker/role.js`, and every Logout (`ui/logout.ts`) first asks it about unsaved chart edits (D129) (a
no-import module — importing `core.js` there would put ~280 KB of syllabus data
into every Raptor visit; `tracker.test.tsx` guards it); `TrackerPage.tsx` is
the page; and **the people bridge `tracker/people.js`** (9 Sep 26, same
no-import shape as `role.js`): `TrackerPage.tsx` wires `tracker/peoplewire.ts`
once, which projects Raptor's `PEOPLE` into the bridge on every notify
(signature-guarded, like Leave War's `reprojectRoster`) and hands it
`HOOKS.whoami()`. That is how a person from the squadron roster is picked into
a course (the Students card's `+ Add` lists the roster above the free-text box)
and how every mark and date write is stamped `by`/`at`. **A student is an
ENROLMENT ID (stable ids, 10 Sep 26)**: a roster entry is `{ id, name, pid? }`,
every per-student key (`:m:`, `:d:`, `pace:`, `lulls:`, `last:`, `lastStudent`)
takes the id, `nameOf`/`byName`/`pidOf`/`linkedPerson` read the entry, and the
`v3:links` record is gone (folded into `pid` by `migrateIds`, once per course,
resumable and read-back-verified — `app/ids.js` is the one converter, shared
with Import). Same person or same name on the course = the same enrolment
(`findEnrolment`, course-wide, hidden charts included). **A COURSE is a
COURSE ID too (stable ids, 13 Sep 26 — ARCH-STACK 1B-i)**: `COURSES` is
`{ id, name }[]`, `course` is the current course's id, every per-course key
files under the id (`v3:<courseId>:…`), so **renaming a course is a label
change that moves nothing** (`renCourse` sets the entry's name; the old
copy-verify-delete apparatus is gone). `app/courseIds.js` is the one converter
(mint/upgrade/reconcile), and `migrateCourseIds` re-bases a name-keyed browser
once — resumable, read-back-verified, a `storage.list()` prefix-move with an
explicit reserved-namespace skiplist (`courses`/`links`/`master`/`lay`/`SYLLABUS
EDIT`) and a fail-closed preflight (a reserved or colon-bearing legacy course
name stops the boot: `bootError` → App's reload panel, no board, no writers). It
also translates the `v3:links` payload (keyed by course name) to the id. Import
carries `{id,name}` courses (file v2), reconciles a file's course ids to the
store's by name (store id wins, conflicts refused), and refuses a reserved name
or a non-`^c[0-9a-z]+$` id at the file boundary. **A SYLLABUS is a SYLLABUS ID too
(stable ids, 13 Sep 26 — `[TRK-CSID]` 1B-ii, DONE).** The global chart catalogue
is `SYLS` = `{id,name,base?,userNamed?}[]` (`v3:master:sylcat`); built-ins carry a
DETERMINISTIC shipped id from the `BUILTIN_SYL` table in `app/sylIds.js`
(`sb2024`/`sb2026`/`sbtx2026`/`sbagaa2026`, the same on every browser — so an
imported built-in matches by id with no reconcile), user charts a minted `sc…`
id; grammar `^s[bc][0-9a-z]+$`. `base` (the canonical shipped SYLLABI key a
built-in draws its def/layout/event-info from) is AUTHORITATIVE from the table,
never trusted from a file. So **renaming a syllabus is a label change that moves
nothing** (`renSyl` sets the entry name + `userNamed`; the old moveSylData /
tombstone-and-shadow / SYL_ALIAS apparatus is gone), delete is a real sweep
(records under the id removed in every course + every course's plan repaired;
built-in tombstoned so the boot reconcile never re-offers it; hidden ≠ deleted),
and duplicate copies the flow+layout under a fresh id with an EMPTY student layer.
The conversion is **"keep charts, reset marks"** (owner): `migrateSylIds` (one
converter, `app/sylIds.js` shared with Import) converts the global catalogue IN
PLACE via a durable **payload journal** (compute-once, whole-object writes,
`purge = sources ∖ destinations`, verify after all purges; two flags
`kSylCatMig`/`kSylReset`) — every hand-drawn chart + layout kept, legacy layout
event-ids translated onto the shipped ids (`padId`/`SPECIAL`, incl. `__font`) —
and RESETS the per-(course,syllabus) student layer (rosters/marks/dates/pace/lulls
cleared, plan `sylName→sylId`, demo pair re-seeded). Boot reconcile
(`reconcileBuiltins`, also in `reloadFromStore`) adds newly-shipped built-ins,
repoints `base` on a shipped rename, respects `userNamed`. `plan.sylId` replaces
`plan.sylName`; `curSylId()` keys `kMarks`/`kDates`/`kLayout`. **Import guardrail
(owner, §19):** charts import from ANY backup (v1/v2 name-keyed upgrade to ids on
read, v3 reconcile by id/name); **student marks/dates/rosters/plan pointers import
ONLY from an id-native v3 file carrying a `sylcat`** — a pre-v3 or unresolved
student block is REFUSED with a plain message (no name→built-in guessing in the
file path; charts still import). File version → 3. **Colon relaxed (owner):
syllabus and chart names MAY contain a colon now** (a label, like a student name);
COURSE names keep the refusal. A student name is a label and may carry one. The
pencil on each Students-card chip renames that
label (`core.js:renameStudent`, 10 Sep 26 — everyone may, like + Add and
Remove; refuses a name another enrolment on the course already holds; the id
and every id-keyed record are untouched). **The Tracker will be
exported back out as a standalone app** (owner, 9 Sep 26), where students are
typed and nothing feeds the bridge — so every Raptor-fed feature degrades to the
old behaviour when the bridge is empty (`+ Add` with no roster IS the old
prompt, pinned), and Raptor-specific code stays in `people.js` /
`peoplewire.ts` / `TrackerPage.tsx` plus the one `people.length` branch. Design:
`docs/superpowers/specs/2026-09-09-schema-hardening-design.md`; the target
model for the database step: `docs/data-model.md`. **Everyone
does everything — marking, charts, students, courses, syllabi AND the File menu
(Import / Export): admin and member have the same access** (owner, D121,
23 Sep 26, superseding the 7 Sep "file portion is the admin's"); the Tracker
reads no role, so never add an admin gate to it. CSS is scoped under
`#page-tracker` with five Raptor collisions reset at the top of the wrapper.
Gaps and the carried-over traps: `docs/tracker/known-gaps.md`; the working loop
with the owner's chart file: `scripts/tracker/bake-user-charts.mjs`.
