# TRACKER — known gaps

> **Vendored into RAPTOR 7 Sep 26** (`src/tracker/`, the Tracker tab) from
> `github.com/seejiaokai/Tracker` at `bf9a47a`. This file carries over what
> that app knew about itself and did not fix, plus the three things the merge
> changed. Read it with the merge in mind:
>
> - **One role rule exists now.** The standalone app had none. Inside Raptor
>   the owner's rule (his second word, 7 Sep 26) is *everyone edits; only the
>   file portion is the admin's*: marking, charts, students, courses and
>   syllabi are open to every login, while 📁 Open, ⊕ Import syllabus and
>   ⤓ Save a copy need the admin. The flag rides the Raptor login
>   (`state/store.ts resetSession`/`toggleRole` → `tracker/role.js` → `core.js
>   fileLocked`), is enforced at those three entry points in `core.js` and
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
> - **The user's FILE stays the authoritative copy.** 📁 Open / ✓ Save changes
>   (`app/fileStore.js`, `app/fileFormat.js`) work exactly as before, Chrome
>   and Edge writing back in place, other browsers downloading. localStorage
>   is the per-browser cache that file loads into. The owner's working loop
>   still holds: he edits charts in the app, sends the file, a session bakes
>   it with `scripts/tracker/bake-user-charts.mjs` (reads only the `charts`
>   half), and he gets a charts-only sync file back to open and re-save.
> - **Students are NOT linked to Raptor's people** (owner, 7 Sep 26 —
>   "standalone first"). The roster is the Tracker's own list, as in his file.
>   Linking OCU trainees to Raptor's pucks is a later, separate step, the way
>   the Leave War sync followed its merge.
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
- Everything fits one phone screen at two students; a fifth may start it
  scrolling.
- Switching student scrolls to their last mark but does not switch syllabus.
  Deliberate.
- `SA(S)-3` on Tx: the source document contradicts itself. **User chose keep,
  twice, 8 Aug.**
- The edit-mode hint overlays the colour legend. Move it if he misses the
  legend.

## Things that will bite you (carried, still true)

- **User edits supersede map pins.** `USER_EDITS_2026` / `USER_EDITS_AGAA` in
  the smoke suite are consulted before every map comparison. Add to them;
  never "correct" the syllabus back to the map. The two course maps are
  transcribed and pinned in `scripts/tracker/course-map-*.json`; the map is
  authoritative over the document's tables — every page says so.
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
  `#openFileBtn`). Most sit inside a menu (`#courseMenuBtn`, `#sylMenuBtn`,
  `#fileMenuBtn`) — open it first. `#saveChanges` exists only while something
  is unsaved. The app uses its own confirm (`#dlgModal`), not native `prompt()`.
- **Reading the syllabus `.docx`:** do not trust chart pages unzipped from the
  document — Word overlays (red X strikes, the IEPE ellipse) are separate
  images and go missing, which produced five confidently wrong readings once.
  Ask the owner for screenshots of the rendered pages. Page-join letters are
  wires, not events.
- **The repository is public.** No student name, mark or date may enter it. The
  smoke suite checks the seed and the sample file for placeholder names only;
  `bake-user-charts.mjs` re-checks after every bake.
