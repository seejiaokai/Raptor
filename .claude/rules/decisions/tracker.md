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
Tracker from anywhere else picks these up too. The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/tracker.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.
**Also read** — in How we work, so already loaded: **D62** and **D63** (the Tracker's syllabus data is out of
every privacy sweep; the aircraft type elsewhere reads "F-15" or "fighter squadron"); **D347** (every Undo / Redo
pair — the Tracker's own included — sits in the top bar, in the same place and look as Edit Schedule's).

**No student name, mark or date may enter the repository** (its seed data, `src/tracker/data/`, is verbatim course
content only). The reason once given was "the repository is public"; it has been PRIVATE since 23 Sep 26 (D59) and
the rule stands — collaborators will read it (`raptor-port/docs/tracker/known-gaps.md`). *(Copied here 24 Sep 26 so
it loads with the Tracker's files.)*
**Where the detail lives:** its architecture — §Architecture at the foot of this file (moved from
`raptor-port/CLAUDE.md`, 24 Sep 26); its screen — `raptor-port/docs/ui-contracts.md` §The Tracker tab; its gaps and
carried-over traps — `raptor-port/docs/tracker/known-gaps.md`; what it stores — `raptor-port/docs/data-schema.md`
§World 3; the model for the database step — `raptor-port/docs/data-model.md`; its browser suite —
`raptor-port/scripts/tracker/smoke.mjs`; its files — `raptor-port/docs/file-map.md`.

| # | Date | The rule |
|---|---|---|
| D566 | 4 Oct 26 | THE OWNER ACCEPTS THE SHOWN TAPERED-WING PICTURE AND AUTHORIZES USING THAT SHAPE FOR THE FLIGHT SYMBOL. |
| D564 | 4 Oct 26 | THE OWNER REJECTS THE BLOCKY WIDE-WING FLIGHT SYMBOL AS UGLY AND ASKS TO SEE BETTER DESIGN OPTIONS. — changed by D565 |
| D560 | 4 Oct 26 | THE OWNER REQUESTS CLEARER LABELS INSIDE TRACKER BLUE FLIGHT BALLS AND PROPOSES A WING WITH MORE TEXT AREA AND STRONGER CONTRAST. — changed by D564, D563 |
| D474 | 1 Oct 26 | A SYLLABUS (A CHART) IS ONE SHARED THING: AN EDIT TO IT REACHES EVERY COURSE AND EVERY STUDENT ON IT — NEVER A COPY PER COURSE — AND MARKS BELONG TO THE INDIVIDUAL STUDENT, NOT TO THE CHART. |
| D464 | 30 Sep 26 | HIS TRACKER CHARTS, SYLLABI AND THE DETAILS TYPED ON EACH BALL ARE HIS OWN WORK AND ARE KEPT: NO CHANGE MAY WIPE THEM WITHOUT PUTTING THEM BACK, AND ANY CHANGE THAT WOULD MUST BE TOLD TO HIM FIRST, SO HE CAN EXPORT A COPY. |
| D462 | 30 Sep 26 | THE TRACKER JOINS `[DB-READINESS]` GROUP A: EVERY TRACKER RECORD THAT HOLDS SEVERAL PEOPLE'S OR SEVERAL CHARTS' WORK IS SAVED ONE PIECE PER THING, LIKE THE REST OF THE APP, BEFORE THE IT TEAM SETTLES ITS TABLES. |
| D463 | 30 Sep 26 | AN EMPTY REAL DATABASE STARTS THE TRACKER WITH NO COURSE: THE FIRST PERSON TO OPEN IT ADDS ONE; THE DEMO COURSE "26ABSG" AND ITS DEMO STUDENTS NEVER REACH A SHARED STORE. |
| D377 | 29 Sep 26 | His look at the Tracker leftovers is done ("Looks good"): the chart a person last had open on a course is part of their own place (D376 reading 5), and a half-typed day in Done on or Failed on is refused, never recorded as today — an empty box still means today. |
| D376 | 28 Sep 26 | Each signed-in person reopens the Tracker on their own last course, chart on it and student, on that browser; a rename keeps it, every way of picking a student updates it, the admin's member view is the same person. Someone new starts on the first course and its last-graded student, else the first. Standalone: one place per browser. |
| D375 | 28 Sep 26 | Keep: a students import adds a course the app does not have at the bottom of the Course list, and the courses already here keep their places (⇅ Reorder moves it) — ruled, not a defect. |
| D374 | 28 Sep 26 | A day after the squadron's (Singapore) day is refused in Done on, Failed on (the full failures list's rows too), Last Flown (Syllabus) and Last Flown (Currency): the box goes back, one line says why, nothing is saved and no undo step made. Upchit and End date A / B take any day; a future day already stored is not rewritten. |
| D373 | 28 Sep 26 | Under about 500px tall (a phone on its side) Edit chart layout folds to one row: the tool in use with its hint, ⤢ Fit, and Tools ▾, which opens the whole set over the chart and closes on a choice or a tap outside; the double-click note, hint line and Flow / Info / Show All tabs step aside. Upright phones and computers keep the strip. |
| D372 | 28 Sep 26 | A change to a student's pace, either end date or his lull periods is an undo step like Last Flown and Upchit, from either bar (↶ / Ctrl+Z, ↷ / Ctrl+Y); keystrokes in one box within two seconds are one step; a lull set, changed or removed (removal still asks) is a step; Copy to… is one step for all ticked. R110's not-undoable list stands. |
| D371 | 28 Sep 26 | A student's failures on an event are kept in the order of their days: the earliest is the plain code (ST-02), the next adds an X, and so on; − takes back the one with the latest day, and re-dating re-orders them. Failures with no day follow the dated ones; failures on the same day keep the order they were recorded. |
| D370 | 28 Sep 26 | The Failures card leaves out failures on an event marked N.A., as the ball does — no chip, not in the total or the full list — and they come back, days and all, if the event is graded again. |
| D191 | 25 Sep 26 | In the Tracker's add box, when the search matches nobody on the roster and the callsign box is empty, OK (or Enter) adds what was typed in the search as a new, unlinked crew member — and the "Nobody on the roster matches" line says so first. |
| D158 | 24 Sep 26 | Not a real-device problem: [TRK-TAP-AFTER-DRAG] is closed as a quirk of the test browser's touch emulation — reopen only if he sees it on a real phone. |
| D157 | 24 Sep 26 | THE TRACKER TAKES RAPTOR'S COLOURS FULLY — backgrounds, text AND the event colours |
| D134 | 24 Sep 26 | THE PINCH TAKE-BACK STAYS AS BUILT. |
| D132 | 23 Sep 26 | AN IMPORT NEVER DELETES ANYONE'S MARKS. |
| D131 | 23 Sep 26 | A BACKUP DOES NOT CARRY DELETED COURSES — LEAVE IT. |
| D130 | 23 Sep 26 | DELETING A BALL ALSO DELETES THE DETAILS TYPED ON IT. |
| D129 | 23 Sep 26 | LOGGING OUT WITH UNSAVED TRACKER CHART EDITS ASKS FIRST: SAVE THEM / DISCARD THEM / STAY. |
| D128 | 23 Sep 26 | A DELETED COURSE CAN BE RESTORED. |
| D127 | 23 Sep 26 | THE EXPORT FILE REMEMBERS A DELETED BUILT-IN CHART. |
| D126 | 23 Sep 26 | EVENT DETAILS BELONG TO THE CHART THEY WERE TYPED ON. |
| D124 | 23 Sep 26 | DELETING A BALL WIPES ITS MARKS. |
| D123 | 23 Sep 26 | LAST FLOWN IS THE LATEST DAY ACTUALLY FLOWN, WHATEVER THE ORDER THEY WERE ENTERED. |
| D122 | 23 Sep 26 | AN IMPORT MAY RESET STUDENT MARKS; IT MUST NEVER WIPE AN EVENT'S TYPED DETAILS. |
| D121 | 23 Sep 26 | IN THE TRACKER A MEMBER CAN DO EVERYTHING AN ADMIN CAN — THE FILE MENU TOO. |
| D120 | 23 Sep 26 | THE TRACKER'S CHARTS REACH THE DATABASE BY EXPORT → WIPE → IMPORT, SO A BUG THAT ROUTE ALREADY REMOVES IS NOT A FINDING. |
| D64 | 23 Sep 26 | The Tracker's event-box hint reads the bare type ("e.g. Lecture, OFT/AMT, 2 x F-15"); its syllabus data and the smoke-test lines asserting it stay out of every sweep (D62) — narrows D62 and D63. |

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
database replaces this file when it arrives). *[Since 30 Sep 26 (`[DB-READINESS]` group A phase 5b, D462, D464) the
course list, each course and chart's student list and the chart records (definitions, names, order, hidden, deleted, and
the details typed on each ball) are STORED one row per thing, through a row door in `core.js` (`app/rows.js`, the one
conversion); a browser's old records are converted once at boot by the fold's `tracker` converter (`src/tracker/fold.ts`,
registered by `src/boot.ts` — storage, not a fourth seam). The chart a signed-in person has open is his own place (D376),
never written into the course's shared plan.]* **The store is the record; the
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
into every Raptor visit; `tracker.test.tsx` guards it); `TrackerPage.tsx` is *[since 30 Sep 26 it also hands the
Tracker the boot policy before its first mount — on a shared store no course and no demo student, D463; its screen then
says "No course yet" (`[DB-READINESS]` group A phase 5)]*
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
