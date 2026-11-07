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

# The Tracker — its architecture

Moved whole from `.claude/rules/decisions/tracker.md` on 7 Nov 26 (the rules-diet plan §2, D1735), so it loads
with the Tracker's own files and where it meets the rest of the app, while the Tracker's rulings
(`.claude/rules/decisions/tracker.md`) load only with its own files.

## Architecture — moved from `raptor-port/CLAUDE.md` §Architecture rules (24 Sep 26)

The Tracker's architecture rules, MOVED WHOLE, word for word (D138), so they load with this area instead of
in every chat (D140). The rules every area shares — the store, the mutation and persistence funnels, what
persists, the one command layer — stay in `raptor-port/CLAUDE.md` §Architecture rules. Paths inside this
section are relative to `raptor-port/` (as they were in that file).

**The Tracker tab is a THIRD app with a THIRD store** (vendored 7 Sep 26,
`src/tracker/`, from `seejiaokai/Tracker` — plain JavaScript/JSX, `allowJs`,
bodies are verbatim ports like `src/engine/` *[no longer since D1534 and D1538, 31 Oct 26: the Tracker lives in Raptor
for good and its code is ordinary app code, cleaned to the code check's rules]*). Its state is module `let`s in
`tracker/app/core.js` with its own subscribe/notify; its storage goes through
ONE doorway, `tracker/storage.js` (inside Raptor it goes through the whiteboard
under `raptor:tracker/…`; legacy `ocu:` keys are imported once by the browser
backend (`src/storage/browser.ts`) — corrected 17 Sep 26, see `docs/data-schema.md`
§World 3. *[5 Nov 26, [TRK-STANDALONE-LEFTOVERS], D1538: the bare `ocu:` path is gone (no target: records in memory),
as are the bar's own Undo / Redo pair and `hosted` flag (D347).]* — the
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
`HOOKS.whoami()`. *[Since 18 Oct 26 (D1002, D1003, D1018) the same bridge carries each man's medical days — a
rider on this seam, not a fourth: `peoplewire.ts medForTracker` works his downchits out on Raptor's side into plain ISO
days (`people.js setMedInputs`, its own guard), and the Info panel counts his down days from them since his course start
(`pace.courseStart`); the Tracker reads nothing of Raptor's store.]* That is how a person from the squadron roster is picked into
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
`peoplewire.ts` / `TrackerPage.tsx` plus the one `people.length` branch. *[REPLACED 31 Oct 26 by D1538: the Tracker
will NOT be exported any more — it lives in Raptor for good. A change no longer has to keep a standalone Tracker working;
the code kept only for one is filed as [TRK-STANDALONE-LEFTOVERS], to go with the Tracker's next batch.]* Design:
`docs/superpowers/specs/2026-09-09-schema-hardening-design.md`; the target
model for the database step: `docs/data-model.md`. **Everyone
does everything — marking, charts, students, courses, syllabi AND the File menu
(Import / Export): admin and member have the same access** (owner, D121,
23 Sep 26, superseding the 7 Sep "file portion is the admin's"); the Tracker
reads no role, so never add an admin gate to it *(NARROWED 18 Oct 26 by D1014: the flex settings, opened from a settings icon in its top bar, are an admin's alone — the Tracker's one admin gate — BUILT the night of 18 Oct 26: `role.js trackerIsAdmin`, wired by `peoplewire.ts` to the sign-in, and the command gate (`state/perms.ts` `trk.flex`) refusing a member)*. CSS is scoped under
`#page-tracker` with five Raptor collisions reset at the top of the wrapper.
*[Since 13 Oct 26 (D801) two Tracker components — `components/DateBox.jsx`, `components/Pop.jsx` — draw Raptor's own date box (`ui/DateBox.tsx`, `ui/DateCal.tsx`, `ui/scheduler/26-date-calendar.css`): a standalone export carries those with it — `docs/tracker/known-gaps.md`, last sections.]*
Gaps and the carried-over traps: `docs/tracker/known-gaps.md`; the working loop
with the owner's chart file: `scripts/tracker/bake-user-charts.mjs`.

## The project guide's map row — moved whole from `raptor-port/CLAUDE.md` §Where things live (7 Nov 26)

| **The Tracker tab** (vendored OCU progress tracker: syllabus flow charts, marks, pace) | `src/tracker/` — plain JS/JSX, its own store (`app/core.js`) and storage doorway (`storage.js`, `raptor:tracker/*` keys — legacy `ocu:` brought in once by the browser backend), CSS scoped under `#page-tracker`; no role — admin and member have the same access, File menu included (D121, 23 Sep 26) — except the flex settings, an admin's alone (D1014, 18 Oct 26, to build); `role.js` carries only the login-session end from `resetSession` (the file is a format, not a store — 9 Sep 26); page seam `TrackerPage.tsx`, kept mounted once visited; its browser suite `scripts/tracker/smoke.mjs` (`npm run smoke:tracker`, a CI job); gaps `docs/tracker/known-gaps.md`; the design specs it was built from `docs/tracker/specs/` |
