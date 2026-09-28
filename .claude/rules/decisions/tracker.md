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

| # | Date | The rule |
|---|---|---|
| D191 | 25 Sep 26 | In the Tracker's add box, when the search matches nobody on the roster and the callsign box is empty, OK (or Enter) adds what was typed in the search as a new, unlinked crew member — and the "Nobody on the roster matches" line says so first. |
| D190 | 25 Sep 26 | [TRK-SMOKE-ADD-RACE] goes ahead of its place, on its own branch in parallel with the D175 chat — the job is the app, not the test: find out whether the Tracker can lose a typed name and fix the cause, never a longer wait that hides it. |
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
