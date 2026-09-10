# TRACKER — known gaps

> **Vendored into RAPTOR 7 Sep 26** (`src/tracker/`, the Tracker tab) from
> `github.com/seejiaokai/Tracker` at `bf9a47a`. This file carries over what
> that app knew about itself and did not fix, plus the three things the merge
> changed. Read it with the merge in mind:
>
> - **One role rule exists now.** The standalone app had none. Inside Raptor
>   the owner's rule (his second word, 7 Sep 26) is *everyone edits; only the
>   file portion is the admin's*: marking, charts, students, courses and
>   syllabi are open to every login, while ⇪ Import and ⤓ Export need the
>   admin. The flag rides the Raptor login
>   (`state/store.ts resetSession`/`toggleRole` → `tracker/role.js` → `core.js
>   fileLocked`), is enforced at those entry points in `core.js` and
>   mirrored by `Header.jsx` (the File menu not drawn). Never persisted. The
>   vendored smoke suite drives as the admin throughout;
>   `src/tracker/tracker.test.tsx` pins the member shape.
> - **The cloud-sync layers are GONE.** `sync/cloud.js` (Dataverse/Firebase)
>   and `sync/local.js` (a SharePoint file, falling back to localStorage) were
>   replaced by `src/tracker/storage.js`: the same async get/set/delete/list
>   doorway over localStorage (`ocu:` keys kept), no network. That doorway is
>   where the shared database plugs in (owner, 7 Sep 26: "I'll add the
>   database eventually") — the same role `leavewar/state/storage.ts` and
>   `HOOKS.storeBackend` play. The Cloud button and the `_api/…` 404s are gone
>   with it.
> - **The STORE is the record; the file is a format (9 Sep 26, superseding
>   "the user's FILE stays the authoritative copy").** Once the storage seam
>   made the store durable, the file-as-master model read as duplication to
>   the owner (every mark lit ✓ Save changes, and pressing it raised a
>   save-file dialog). Now marks, dates, students, event details and a moved
>   ball save themselves; ✓ Save changes writes STRUCTURE edits (events,
>   prerequisites, lines, fonts) to the store and nothing else; and the File
>   menu is ⇪ Import (ONE button for both jobs: charts in, chart by chart,
>   marks untouched — and if the file also holds students & marks it asks once
>   before merging them, which is the export → wipe → import move) and
>   ⤓ Export (a copy out — the backup before the database move, or a
>   handover; students unticked by default). No bound file, no file name on the toolbar, no
>   Charts/Students boxes on the menu. `app/fileStore.js` reads on any browser
>   (a plain file input where the native picker is missing) and writes in
>   place only on Chrome/Edge (download elsewhere). The owner's chart loop
>   still holds: he Exports charts only, sends the file, a session bakes it
>   with `scripts/tracker/bake-user-charts.mjs` (reads only the `charts`
>   half), and he Imports the charts-only file he gets back (no students
>   question — a charts-only file never asks).
> - **Students are LINKED to Raptor's people, and keyed by an enrolment id
>   since 10 Sep 26** (superseding the 7 Sep 26 "standalone first" — owner,
>   9 Sep 26: "a person is also linked to the tracker and can be selected to
>   be placed in a course"). `+ Add` in the Students card lists the squadron
>   roster (via the no-import bridge `people.js`, fed by `TrackerPage.tsx`);
>   picking one adds an entry `{ id, name, pid }` under their callsign (the
>   9 Sep 26 `v3:links` record is folded into `pid` by the once-per-course
>   migration and gone). A typed name still adds an unlinked student — and with NO
>   roster handed over the dialog IS the old `Student callsign:` prompt, byte
>   for byte. **That is the standalone rule** (owner, 9 Sep 26): the Tracker
>   goes back out to `seejiaokai/Tracker` one day, where a student is created
>   by typing a name and nothing feeds `people.js`; the picker, the link and
>   the `by` stamp exist only where Raptor hands people over, and everything
>   Raptor-specific about `+ Add` is the one `people.length` branch in
>   `core.js addStudent` (pinned in `tracker.test.tsx`). The roster,
>   marks, dates, pace, lulls and undo are all keyed by the entry's id; the
>   name is a label (no rename control yet) and may contain a colon. Nothing
>   flows back to Raptor yet (no pucks, no quals) — `pid` is the hook for
>   that. Deleting a course leaves its records in storage the way it leaves
>   its marks (a safety net): re-create a course under the same name and its
>   old roster comes back, entries, links and marks together — coherent, but
>   worth knowing. Export carries the entries (no `links` block); Import
>   reads both the entry shape and a legacy string roster with its `links`.
>   **A course whose id conversion cannot finish is HELD (10 Sep 26):** after
>   one retry on the same load, `core.js` keeps `rosterHeld` and refuses
>   `+ Add`, remove, reorder and duplicate-syllabus with a notice, so the old
>   name-keyed roster is never overwritten. The gap: no component reads the
>   flag — the Students card shows an EMPTY list and a `+ Add` that looks
>   live until pressed. A one-line notice in the card is the follow-up. The
>   way out is a reload that converts (or an Import, which converts the
>   course through the same migration). Narrow edge of that Import route: if
>   the interrupted run had already moved a mark under its parked `idmap` id
>   and the file carries the same student under a DIFFERENT id, the
>   already-moved record is left as a dead key under the old id (nothing is
>   overwritten; the file's id wins the roster). Only after an interrupted
>   conversion followed by a restore.
> - **Loads and roster writes share ONE queue (9 Sep 26).** `loadCourse`
>   reads a dozen records with an await between each and then replaces the
>   roster with what it fetched; a `+ Add` or a removal finishing inside that
>   window used to be applied over by the load's stale copy (CI showed it: two
>   adds, one student), and — the review's finding — a switch STARTING inside a
>   write's tail flipped the syllabus name under the write's later saves. So
>   `onChain(fn)` in `core.js` queues every load AND every roster-write body
>   (`addStudent`, `removeStudent`, `saveCrewOrder`) and every syllabus-name
>   flip (`switchSyllabus`, `switchSylNow` for duplicate/add/rename/delete) on
>   one promise chain. A NEW writer that touches the roster or `plan.sylName`
>   goes through `onChain` too, AFTER its dialog (a queued load must never wait
>   on a human), and must not call `loadCourse`/`onChain` from inside (it would
>   wait on itself). The mark writers read `active`, which the load sets, and
>   are not gated. `whenLoaded()` drains the queue (the smoke suite uses it).
> - **Its layout is a viewport-tall column, not a scrolling page.** The chart
>   and the side panel scroll inside their own boxes. While the tab is up the
>   document is locked and Raptor's 120px body pad is dropped (`body.tr-on`,
>   `tracker.css`); the column's height is the viewport minus whatever Raptor
>   draws above the section, measured on show and resize (`TrackerPage.tsx`).
>   The section stays mounted once visited: the flow board is drawn once,
>   imperatively, and a remount would come back empty.
> - **Five class names collide with Raptor's stylesheet** (`.day`, `.day.today`,
>   `.legend`, `.modal`, `.sub`) and are reset at the top of the `#page-tracker`
>   wrapper in `tracker.css`. A sixth collision lands there, never in
>   `scheduler.css`.

## Still open (carried from the standalone repo, 2 Sep 26)

**Plan 9 is still blocked.** The standalone plan to empty the three data files
(`data/syllabi.js`, `data/layouts.js`, `data/eventInfo.js`) once the user's
file holds everything. **An unedited syllabus exists only in that code.** Nothing
may be deleted until the owner has saved a file, reopened it, and said in his own
words that his syllabi are inside. No check stands in for that. Stop and ask.

**The unreproduced save bug.** A second save once appeared to do nothing; never
reproduced. `writeTo` verifies by reading back; failures say `NOT SAVED`; the
toolbar shows `saved N KB at HH:MM` — if he reports it again, ask whether that
time changed.

**Worth raising when he next looks:**
- **The toolbar hides on demand** (owner, 9 Sep 26 — phone ask, "have the
  option to hide this bar so that the space can be maximised"). The ⌃ at the
  end of the bar (left of the Save corner — everything you do stays left of it)
  collapses the whole controls bar to a slim strip that names the crew you are
  on and is itself the button back (`.barpeek`, `#barShowBtn`); the chart grows
  into the freed height on its own because `.layout` is `flex:1`. The choice is
  a per-BROWSER view preference, so it rides `ocuLocal:barHidden` and NOT a
  shared `ocu:` key (one saved into the shared file/database would decide the
  bar for everyone), defaulting to SHOWN. Works on a desktop too, where the
  Flow/Info tabs aren't drawn and the strip is the only handle. `core.barHidden`
  / `core.toggleBar`; pinned in `smoke.mjs` (hide removes the bar, the strip
  names the crew, the chart grows, the choice persists under ocuLocal).
- Everything fits one phone screen at two students; a fifth may start it
  scrolling.
- Switching student LANDS ON THAT STUDENT'S LATEST WORK (owner, 9 Sep 26:
  "when u pick a crew it will land on their latest work without having to
  scroll" — the rule the app always had, briefly replaced by "keep the view"
  the same day when a snap-to-the-top from the ring redraw was read as the
  landing itself). `setActive` captures the board's scroll across the redraw,
  puts it back, then scrolls to the last mark after the frame; a student with
  no mark on this chart lands on the chart's FIRST event (owner: "if nothing
  is clocked … the first item"), never a bare top-left reset. A landing is
  CENTRED (owner: "centralise the view if its possible"): the chart wrapper
  carries half a view of slack above and below (`padBoard`, screen-constant
  across zooms; sideways only once the chart is wider than the board), so
  even the first and last events can sit in the middle; `renderBoard` parks
  a fresh draw at the chart's own corner so a chart switch looks unchanged,
  and `setFlowZoom`'s anchor maths subtracts the slack. Switching student
  still does not switch syllabus. **Placing a mark leaves the view exactly
  where it is** (owner, 9 Sep 26: skip ahead and "put DCO a pokeball down the
  flow chart. The view jumps back up to the above last empty pokeball") — the
  grade rebuilds the SVG the same way a crew pick does, so `popGrade`/`popFail`
  go through `redrawKeepView`, which captures the board scroll across the
  redraw and puts it straight back; you are looking at the ball you marked, so
  the chart must not move under you. **A tap on another student's wedge
  on any ball also picks them** (same day) — that route deliberately does NOT
  land: the user is looking at the ball they tapped. With five or six
  students the wedges get thin on a phone; the centre stays the easy target
  for the details — raise it if he reports mis-taps.
- **Every failure has a day, every mark has a day (owner, 9 Sep 26: "Failures
  will also track the date in which the student fails … the details portion
  will reflect the date accomplished automatically as the date updated. But
  the user can also manually change the date after").** The record is still
  `marks[s][id]`: `f` the count (what the ball's red ticks and the file check
  read, unchanged), `fd` one ISO day per failure oldest first, `d` the day the
  event was done. The pop-up has a *Done on* box (today; a DCO/DPCO/Marginal
  lands dated that day, changing it after re-dates the mark; Not done and
  N.A. clear it; a flight's day is still its Last Flown) and a *Failed on*
  box that the next + records on, with this student's failures listed under
  the counter. The Failures card shows EACH failure as its own chip — ST-01,
  ST-01X, ST-01XX (owner: "when someone fails twice, it should show ST-01,
  ST01X") — hover or tap for its day; the card's title opens the full list
  with a date box per failure (`#failLog`, a `.lullcal`; Escape closes it).
  The Details-mode bubble ends with the selected student's own record. A
  count from before this (or from an older file) reads as that many UNDATED
  failures — `failDates` pads with nulls, never invents a day; the file
  format needed no change (marks are opaque objects to `checkStudents`).
  Undo: a re-date is one step per box (`doneDate:` / `failDate:` fields
  coalesce keystrokes), a failure is its own step as before.
- `SA(S)-3` on Tx: the source document contradicts itself. **User chose keep,
  twice, 8 Aug.**
- The edit-mode hint overlays the colour legend. Move it if he misses the
  legend.

## Things that will bite you (carried, still true)

- **User edits supersede map pins.** `USER_EDITS_2026` / `USER_EDITS_AGAA` in
  the smoke suite are consulted before every map comparison. Add to them;
  never "correct" the syllabus back to the map. The two course maps are
  transcribed and pinned in `scripts/tracker/course-map-*.json`; the map is
  authoritative over the tables that accompany it — the owner confirmed.
- **`gen-agaa-layout.mjs` is history, not the source of truth.** The owner has
  moved 132 boxes and drawn 68 lines on top of what it generated; re-running
  it would throw his work away. Kept for the record only.
- **`EPE → AAS-04` is not a missing link and never was** — read the
  `app_keeps_links_this_map_does_not_draw` note in the map before "restoring"
  it.
- **`src/tracker/data/*.js` blobs are one line each.** Edit them by replacing
  that LINE; a regex spanning `export` to `export` once deleted
  `EVENT_INFO_BY_SYL`.
- **Browser file pickers need a live click.** No `await` before
  `showSaveFilePicker` / `showOpenFilePicker` / `requestPermission`.
- **Only `applyCharts` may touch charts and only `applyStudents` may touch
  people.** `applyBundle` no longer deletes stored syllabi — restoring that
  would wipe his charts.
- **Anything remembered per browser goes under `ocuLocal:`, never through
  `sSet`** (every `ocu:` key is what the shared file/database will carry, so a
  view preference stored there would decide what opens for everyone).
  `kLastStudent`/`kLast` stay shared on purpose.
- **`styles.css`'s two `@media(max-width:1050px)` blocks — top and END — are
  load-bearing** (now inside the `#page-tracker` wrapper in `tracker.css`):
  same specificity, later wins, and the general rules sit between them. Phone
  overrides belong in the LAST one.
- **Grid columns are always `minmax(0,1fr)`, never `1fr`** — a bare `1fr` takes
  its minimum from content and a `dd/mm/yyyy` box then pushes the panel wider
  than the screen. This bit three layouts.
- **`scrollHeight` never reports less than `clientHeight`**, so "fits exactly"
  and "fits with room" look identical — measure the content.
- **z-index ladder inside the tab:** `.modal` 60 · `.lullcal` 70 ·
  `#dlgModal`/`#ordModal` 71 · `#showAllPanel` 81 · `#infoModal` 91. Header
  menus 50, the phone search strip 52. Anything new that opens over Show All
  must clear 81. (All of these sit inside `#page-tracker`; Raptor's own
  overlays — the drawer at 440, the board at 400 — are above the lot.)
- **The desktop bar has no spare width at 1440** — one added control wraps it
  onto two rows and costs 44px of chart; the heading hides below 1600px to pay
  for the search box. The phone bar is two rows, bought by trimming captions
  and selects, not by hiding controls.
- **`#ordModal` serves syllabi, courses AND crew** — one `core.ordMode`, one set
  of ids, `data-ord` says which. Only one can ever be open.
- **Target elements by ID in tests** (`#showAllBtn`, `#detailsBtn`,
  `#saveChanges`, `#dupSyl`, `#addStu`, `#trUndoBtn`, `#editSyl`,
  `#importFileBtn`, `#exportBtn`). Most sit inside a menu
  (`#courseMenuBtn`, `#sylMenuBtn`, `#fileMenuBtn`) — open it first.
  `#saveChanges` exists only while a flow edit is unsaved. The app uses its
  own confirm (`#dlgModal`), not native `prompt()`. `#trUndoBtn` /
  `#trRedoBtn` are on the BAR (9 Sep 26) and `disabled` while their stack is
  empty — a Playwright `click()` on one then waits 30s for it to enable, so
  press an expectedly-greyed one the DOM way (`el.click()` in `evaluate`).
- **Reading the course map:** do not trust chart images exported from its
  source file — overlays (red X strikes, the IEPE ellipse) are separate layers
  and go missing, which produced five confidently wrong readings once. Ask the
  owner for pictures of the rendered pages. Page-join letters are wires, not
  events.
- **The repository is public.** No student name, mark or date may enter it. The
  smoke suite checks the seed and the sample file for placeholder names only;
  `bake-user-charts.mjs` re-checks after every bake.
