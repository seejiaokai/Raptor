# [HUMAN-RETEST] Tracker — Fable's scenario design (23 Sep 26)

**What this is.** Bug-check order §4 rank 1: a model that did NOT build the Tracker designs the test
scenarios, hunting for what is MISSING. Fable 5.1 (a separate read-only agent), briefed with
`docs/superpowers/briefs/2026-09-23-tracker-retest-scenarios-brief.md` plus the D120 addition sent
while it ran, blind to Astra's list. Its report is kept verbatim below this paragraph; every item is
dispositioned in the evidence sheet `2026-09-23-tracker.md` §7.

---

What I read: the brief and the coordinator's D120 addition; `raptor-port/CLAUDE.md` (the Tracker paragraph and its row); `docs/tracker/known-gaps.md`; the three specs under `docs/tracker/specs/`; `DECISIONS.md` D62–D64; `docs/data-schema.md` §World 3; `docs/undo-contract.md`; `docs/bug-check-order.md`; the TRK and [HUMAN-RETEST] entries of `OUTSTANDING.md` and the archive; every file under `src/tracker/` (all 5,345 lines of `app/core.js`, the eight components, `TrackerPage.tsx`, `peoplewire.ts`, `people.js`, `role.js`, `storage.js`, `fileFormat.js`, `fileStore.js`, `ids.js`, `sylIds.js`, `eventOrder.js`, `tracker.css`); the seams (`state/store.ts` resetSession/toggleRole, `ui/Shell.tsx`, `ui/App.tsx`, `main.tsx`, `storage/boot.ts`, `storage/reset.ts`, `storage/adapters.ts`, `undo/timeline.ts`, `state/undo-wire.ts`, `undo/describe.ts`); and what is already tested (`tracker.test.tsx` in full, the smoke suite's 418 check titles plus its round-trip, import, info-override and chart-order blocks). I did not open the syllabus data files (D62) and did not look for any astra/codex file.

**Tier, stated: FULL.** Saved data (the store, the export file), roles (the file lock), shared drawers (the ball drawn from six call sites, the details bubble from four), new gestures (wedge tap, long-press, the Find strip) — questions 3, 4, 5, 6 and 7 of §5 are all YES.

**D120 applied, in one line each.** The round trip of a CURRENT export (charts) through a wipe and back is scenarios 1–7 and 15–24 and leads the ranking. The start-up converters, older file formats and anything wrong only in stored demo data are not here. Everything the app would do again to NEW data (marks, students, dates, pace, charts drawn from now on, roles, undo, every surface) is here.

**Three practical notes for whoever executes this.**

1. *The wipe.* There is no control in the app that empties the Tracker. The wipe that matches D120 is the browser's "clear site data" — in Playwright, `page.evaluate(() => localStorage.clear())` then a reload (exactly what the smoke suite's own `wipe()` does). The Tracker's records live in localStorage as `raptor:tracker/…` (the seam), its two view preferences as `ocuLocal:…`. **Do not use `?fresh=1` as the wipe** — that address runs the whole app on a memory store and forgets everything on the next reload (scenario 14).
2. *Files.* Playwright cannot drive the OS pickers, so the production bundle carries two hooks: set `window.__pickSaveForTests = async name => ({ name, createWritable: async () => ({ write: async t => { captured = t }, close: async () => {} }) })` before pressing Export, and `window.__pickOpenForTests = async () => ({ name: 'x.json', text })` before pressing Import (`core.js` lines 5061 and 5170). Walk everything through the real buttons (`#exportBtn`, `#importFileBtn`, `#copyOk`, the `#dlgModal` questions) with these hooks — then do ONE pass with the real pickers by hand on Chrome, and one on the phone (Safari: Export becomes a download into Files; Import reads it back through a file input).
3. *Navigation.* Sign-in is `#luser` / `#lpass` / `#loginForm button[type=submit]`; the tab is `nav a[data-page="tracker"]` (or `window.go('tracker')`, then wait for `#flowSvg .ball`). Logout is `#logout`; the admin's view-as-member flip is `#roleBadge` (in the drawer on a phone). The Tracker's own controls are named by id throughout below.

---

## 1. The roll-call

Every THING the Tracker attaches data to, and every place the app draws it. Three columns per place: does it SHOW the thing, can the person ACT on it there, what else is PAINTED on the same pixels. No blank cells; "—" means nothing else is painted there.

### A. A student (an enrolment on the course)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Crew dropdown `#activeSel` | YES — the name | YES — picking redraws the chart for them and lands on their latest mark (or the first event) | — (native select) |
| Students card chip `.c-students .chip` | YES — number, name, a blue dot when linked to the squadron roster (title names the callsign) | YES — ✎ rename (`.ren[data-ren]`), × remove (`.x[data-rm]`) | the linked dot sits before the number; nothing over the name |
| Key ball `.keyball svg` | YES — names around a small ring, the active one bold cyan | NO — display only (Reorder is the door) | the centre disc prints the course's HIDDEN ID, not its name (scenario 9) |
| Every ball's ring wedge `.wedge[data-wi]` | YES — their grade colour in their slice; cyan edge (`path.mine`) when active | YES — tap another's wedge picks them; tap own wedge or the centre opens grading | red failure ticks across the slice's outer rim; the yellow "next" ring just outside; the turquoise search ring further out; the blue number badge on the top-right corner; the label in the centre |
| Grading pop-up title `#popTitle` | YES — "ST-01 · NAME" | NO | — |
| Show All status badge `.sst` | YES — the ACTIVE student's grade on every row | NO (Edit there is details only) | — |
| Card headings "— NAME" `.card h3 .who` | YES on desktop; HIDDEN on a phone by CSS | NO | — |
| Details bubble `#detailBubble .mkrec` | YES — the active student's own record on that event | NO | the bubble floats over the chart, the legend, and — see scenario 10 — over other tabs |
| Reorder list `#ordModal[data-ord="crew"]` | YES — names with #1 #2 tags | YES — drag (desktop), ▲▼, A–Z, Save order | — |
| Lull copy list `#lullCopy` | YES — the other students | YES — tick, Copy | — |
| Failures full list header `#failLog`, failure bubble | YES — the name | NO | — |
| ↶ / ↷ tooltips `#trUndoBtn[title]` | YES — "…for NAME" | YES — press | — |
| Hidden-bar strip `.barpeek-who` | YES — the active name | YES — the whole strip brings the bar back | — |
| + Add dialog `#dlgList` | shows the SQUADRON roster (the source), not students | YES — pick a row, or type in `#dlgInput` | — |
| Export file `students.byCourse.<course>.bySyllabus.<chart>.roster` | YES — `{id, name, pid?}` | n/a | — |
| Phone Info tab | the same cards as desktop, two across at 80% | the same | — |

### B. A mark (grade)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Ball wedge fill | YES — black DCO, blue DPCO, green Marginal, sand N.A., white not done | YES — via the pop-up | ticks and rings as in A |
| Grading pop-up buttons `#pop .opts` | NO — the buttons do not mark which grade is current; the only hint is the caption "Done on" vs "Done on (when marked)" (observation, not a defect) | YES — set | — |
| Show All `.sst` | YES | NO | — |
| Overall card (percent, done, remaining, bar, five buckets) | YES — derived | NO | — |
| Next event chips `.branch` / Plannable now chips | YES — derived (ready vs "not yet" dashed) | YES — click jumps to the ball; hover or long-press shows the bubble | — |
| Yellow "can plan next" ring `circle.avail` | YES — derived for the active student only | NO | the search ring outside it (they never touch — smoke-tested) |
| Details bubble `.mkrec` | YES | NO | — |
| ↶ tooltip | YES — "Undo the mark on ST-01 for NAME" | YES | — |
| Export file `marks[id][event].g` | YES | n/a | — |

### C. A failure and its date

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Wedge ticks | YES — the count, at most six drawn; none while the event is N.A. | NO | across the slice's rim |
| Pop-up `#failCount`, `#popFailMinus`, `#popFailPlus`, `#popFailDate`, `#popFailDates .fdate` | YES — count and each failure's day | YES — + records on the box's day, − takes the latest back | the N.A. refusal message is SILENT (scenario 8) |
| Failures card `#failChips .failchip`, `#failTotal` | YES — one chip per failure (ST-01, ST-01X…), worst event first | YES — hover or tap for the day; the title `#failTitle` opens the full list | — |
| Full list `#failLog .frow` date boxes | YES | YES — re-date one failure | — |
| Failure bubble | YES — which failure, the day | NO | floats |
| Details bubble `.mkrec` | YES | NO | — |
| Export file `f`, `fd` | YES | n/a | — |

### D. A done-date

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Pop-up `#popDoneDate` | YES — today before a grade, the recorded day after | YES — re-dates at once when already done | — |
| Details bubble | YES — "DCO on 16/08/26" | NO | — |
| Currency card Last Flown boxes | YES indirectly — a done FLIGHT moves both forward, never back | YES — by hand | — |
| Export file `d` | YES | n/a | — |

### E. An event (a ball)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Chart `.ball[data-id]` | YES — label, type shape and colour, number badge | YES — every arrange tool; tap (grading); double-click (poke-ball editor, arrange only) | rings, ticks, badge, the yellow/turquoise rings |
| Show All row `.sarow` | YES — code, name, type, hours, crew, prerequisites | YES — Edit (details only, inline `.saedit`) | — |
| Find predictions `#hSearchList .findrow` | YES — code, type dot, name | YES — pick | — |
| Next event / Plannable now chips | YES | YES — jump, bubble | — |
| Pop-up `#popTitle`, `#popInfo` | YES | YES — `#popEditInfo` opens the details editor | — |
| Poke-ball editor `#editModal` | YES — text, type, number, crew, links, prereq note | YES — Save, Delete ball | — |
| Raw editor `#sylModal #sylText` | YES — the JSON | YES — Save (then ✓ Save changes) | — |
| Header `#evCount` | the count | NO | hidden below 1600px and on a phone |
| Export file `charts.syllabi[chart][]` | YES — id, label, type, num, phase, seq, prereqs | n/a | — |

### F. A prerequisite (arrow)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Chart edge path (+ hop arcs, arrowhead) | YES | YES in arrange — Connect draws one; Delete tool click on the arrow → confirm; Edit lines drags its ends and bend; ➤ Arrow cycles the head; Merge / Unmerge the hops | drawn lines share the layer |
| Show All "Prerequisites:" | YES — the free-text note if any, else the chart links | YES — the NOTE only | — |
| Details bubble | YES | NO | — |
| Poke-ball editor `#edLinks` | YES — comma list | YES | — |
| `#edPre` / `#ifPre` (note) | YES | YES | — |
| Export file `prereqs` | YES | n/a | — |

### G. A drawn (free) line

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Chart path `#lp_<id>` (+ `.linehit`, amber loose-end dots in arrange) | YES | YES in arrange — Line, Edit lines (squares/ends, double-click adds a bend), Delete, Arrow, Merge | — |
| Anywhere else | NO — a line has no row or list anywhere (by design) | — | — |
| Export file `layouts[chart].__lines`, `__derived` | YES | n/a | — |

### H. A chart (syllabus)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Syllabus dropdown `#sylSel` | YES — the name, plus " ✎" when it has its own saved definition | YES — switch (asks about unsaved flow edits) | — |
| Reorder list `#ordModal[data-ord="syllabus"]` | YES — names, tag built-in / built-in ✎ edited / custom; deleted built-ins below `#ordHidden` | YES — reorder, A–Z, ↺ Restore | — |
| Export dialog `#copySylList` | YES — the VISIBLE charts only | YES — tick | — |
| Import questions `#dlgModal` | YES — the file's label | YES — Replace it / Add as new / Cancel | — |
| Export file `order`, `syllabi`, `layouts`, `sylcat` | YES | n/a | a DELETED built-in is not carried (scenario 15) |

### I. A chart's layout (positions, font, routing metadata)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Chart | YES | YES in arrange — drag, Select + group drag, Font `#fontIn`, ⤢ Fit `#fitBtn`, ↺ Reset layout `#resetLayout` | — |
| Export file `layouts[chart]` | YES — every event's position (live → saved → shipped → auto → (60,60)) plus `__edgeMeta/__merges/__unmerges/__font/__lines/__derived` | n/a | scenario 4 on the (60,60) fallback |

### J. A course

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Course dropdown `#courseSel` | YES | YES — switch (asks about unsaved flow edits; restores that course's last chart) | — |
| Header `#courseTitle` "NAME PROGRESS TRACKER" | YES | NO | hidden below 1600px and on a phone |
| Key ball centre | shows the hidden ID (scenario 9) | NO | — |
| Reorder list `#ordModal[data-ord="course"]` | YES + "current" tag | YES | — |
| Pop-up, bubble, Show All | NO — a course is never named there | — | — |
| Export file `students.courses`, `byCourse` | YES — `{id, name}` | n/a | — |

### K. Pace and the two end dates

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Pace card `#epwIn`, `#targetIn`, `#targetIn2`, projected end, req. pace | YES | YES — type; NO undo for these (door gap, §2) | — |
| Export file `pace[id]` | YES | n/a | — |

### L. Lull periods

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Lull card `#lullChips .lullchip` | YES — dd/mm/yy → dd/mm/yy | YES — tap to change (`#lullCal`), × removes with NO question and NO undo (scenario 13), `#setLullBtn`, `#copyLullBtn` | — |
| Projected end and req. pace (Pace card) | YES — the maths excludes them | NO | — |
| Export file `lulls[id]` | YES | n/a | — |

### M. Last-flown, down days, upchit, the currency and flex bars

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Currency card `#lastSyll`, `#lastCurr`, `#downDays`, `#upchit`, the two "days since" lines, the two coloured bars | YES | YES — type (one undo step per box, keystrokes within two seconds coalesce) | — |
| Export file `dates[id]` | YES | n/a | — |

### N. Event details (name, type/format, hours, crew, prerequisite note)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Show All row `.smeta`, inline editor `.saedit` | YES | YES — Save, Reset to doc, Cancel | — |
| Details bubble, pop-up `#popInfo` | YES | `#popEditInfo` | — |
| Details editor `#infoModal` | YES | YES — Save, Reset to doc | — |
| Poke-ball editor | crew and prereq note only | YES | — |
| Find predictions | the name | YES — pick | — |
| Export file `charts.eventInfo` | YES — the whole table with the user's edits merged (and the `__kept` markers) | n/a | — |

### O. "Can be planned next"

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Chart yellow ring | YES — for the active student | NO | search ring outside |
| Next event card (ready vs "not yet") / Plannable now (up to 5 rows ahead) | YES | chips as in B | — |

### P. The search hit

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Chart turquoise ring `circle.found` | YES — one ball | NO | outside the yellow ring |
| Box `#hSearch`, status `#hSearchStat`, list `#hSearchList` (phone: `#hSearchBtn` opens the strip `#hSearchPanel`) | YES | YES — type, Enter, ↑ ↓, click, ✕ `#hSearchClear`, Escape | — |

### Q. Unsaved flow edits (the one thing that waits for ✓ Save changes)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| `#saveChanges` (orange, only while dirty) and `#saveStat` | YES | YES — save | — |
| The browser's leave-page prompt | YES | — | — |
| The Export dialog, + Add syllabus, Duplicate, Import | NO — none of these look at it (scenarios 2 and 3) | — | — |
| The Syllabus dropdown and Course dropdown | YES — they ask before switching | — | — |

### R. A deleted (hidden) built-in chart

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| Reorder list `#ordHidden` | YES — "deleted" | YES — ↺ Restore | — |
| Dropdown, Export tick list, export file | NO — not listed, not carried (scenario 15) | — | — |

### S. The chart ORDER

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| `#sylSel` option order, `#copySylList` order | YES | Reorder list `#ordSyl` | — |
| Export file `charts.order` | YES | n/a | the Import BUTTON never applies it (scenario 1) |

### T. Who marked, and when (`by`, `at`)

Nowhere on screen (by design until the database step). Carried in the export file on every mark and dates record. Walk once: a member's mark exports with the member's name (scenario 45).

### U. The file lock (role)

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| The ⇪ File menu `#fileMenuBtn` | present for the admin, absent for a member and for the admin viewing as member | Import / Export | — |
| Everything else on the tab | unchanged by role | everyone edits | — |

### V. The hidden bar

| Place | Shows it | Act on it here | Painted on the same pixels |
|---|---|---|---|
| `#barHideBtn` (⌃) → strip `#barShowBtn` | YES — the strip names the active student | YES — the strip restores | remembered per browser (`ocuLocal:barHidden`) |

---

## 2. The door list

### 2a. Every action the stored data allows, and the control that performs it

| Action | Control | Phone | Arrange on | Member / view-as-member | Hidden chart | Course with no students | Student with no marks | Roster held (converter — out of scope, one line) |
|---|---|---|---|---|---|---|---|---|
| Pick a student | `#activeSel`; tap another's wedge on any ball | same | wedge tap is a TOOL click, not a pick; dropdown still works | same | n/a | dropdown empty | lands on the chart's first event, centred | same |
| Add a student | `#addStu` → `#dlgFilter` / `#dlgList .dlg-item[data-key]` / `#dlgInput` → `#dlgOk` | same | same | ALLOWED | reuses the enrolment if they sit on a hidden chart | the empty card still offers it | — | refused with a message |
| Rename a student | chip ✎ `.ren` → prompt | same | same | ALLOWED | — | — | — | refused |
| Remove a student | chip × `.x` → confirm | same | same | ALLOWED | — | — | — | refused |
| Reorder students (re-slices every ball) | `#ordCrew` (disabled under two) → `#ordModal` | ▲▼ only (drag does not work by touch) | same | ALLOWED | — | disabled | — | refused |
| Grade an event | tap ball centre / own wedge → `#pop .opts` | same | OFF — a tap is the tool | ALLOWED | — | pop-up OPENS but every button is inert (scenario 12) | works | — |
| Record / take back a failure; set its day | `#popFailPlus` / `#popFailMinus` / `#popFailDate`; re-date in `#failLog` | same | off | ALLOWED | — | inert | works | — |
| Set the done-day | `#popDoneDate` | same | off | ALLOWED | — | inert | works | — |
| Last flown / down days / upchit | Currency card boxes | boxes two-across | same | ALLOWED | — | card absent | works | — |
| Pace, End date A, End date B | Pace card boxes | three across at 80% | same | ALLOWED | — | absent | works | — |
| Set / change / remove / copy a lull period | `#setLullBtn`, chip tap, chip ×, `#copyLullBtn` → `#lullCopyOk` | same | same | ALLOWED | — | absent | works | — |
| Undo / redo | `#trUndoBtn` / `#trRedoBtn`, Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z (not inside a text box, not under a question) | buttons only | same | ALLOWED | — | — | — | — |
| Switch chart | `#sylSel` (asks about unsaved flow edits) | same | leaves arrange? NO — arrange stays on across a chart switch (walk it) | same | a hidden chart is not offered | same | same | — |
| Rename / duplicate / add / reorder / delete a chart | `#sylMenuBtn` → `#renSyl` / `#dupSyl` / `#addSyl` / `#ordSyl` / `#delSyl` | same | same | ALLOWED | restore from `#ordSyl` | same | same | duplicate refused |
| Restore a deleted built-in | `#ordSyl` → `#ordHidden` ↺ Restore | same | same | ALLOWED | that is the door | — | — | — |
| Enter / leave arrange mode | `#sylMenuBtn` → `#arrangeBtn` (the pencil lights); the strip's "✓ Done editing chart" | strip wraps to four or five rows | — | ALLOWED | — | — | — | — |
| Move a ball / group / connect / delete / text / line / edit lines / arrow / merge / unmerge / select all / font / fit / reset layout / edit the JSON | `#arrTools` buttons (by label), `#arrowBtn`, `#selectAllBtn`, `#fontIn`, `#fitBtn`, `#resetLayout`, `#editSyl`; double-click a ball; Delete / Backspace | drag by touch works (touch-action none); no keyboard | — | ALLOWED | — | — | — | — |
| Save flow edits | `#saveChanges` (present only while dirty) | same | same | ALLOWED | — | — | — | — |
| Details mode on / off | `#detailsBtn` (ⓘ); `#detailsHintOff` | same | arrange wins when both are on | ALLOWED | — | — | — | — |
| Edit event details | `#popEditInfo` → `#infoModal`; Show All → Edit → `.saedit`; poke-ball editor (crew, note) | same | — | ALLOWED | — | — | — | — |
| Show All | `#showAllBtn` (desktop) / `#showAllTab` (phone) → `#saSearch`, `#saClose` | tab | same | ALLOWED | — | no status badges | badges read "not done" | — |
| Find an event | `#hSearch` (desktop) / `#hSearchBtn` strip (phone) | strip | same | ALLOWED | — | — | — | — |
| Hide / show the bar | `#barHideBtn` / `#barShowBtn` | same | same | ALLOWED | — | — | — | — |
| Zoom the chart / the panel | `#flowZoomCtl` (hidden in arrange — wheel and pinch there) / `#sideZoomCtl` | pinch; one control at a time | wheel/pinch | same | — | — | — | — |
| Switch / add / rename / reorder / delete a course | `#courseSel`; `#courseMenuBtn` → `#addCourse` / `#renCourse` / `#ordCourse` / `#delCourse` | same | same | ALLOWED | — | — | — | — |
| Export | `#fileMenuBtn` → `#exportBtn` → `#copyModal` (`#copyCharts`, `#copyStudents`, `#copySylList`, `#copyOk`) | same | same | ADMIN ONLY — menu absent; write path refuses; the dialog closes on the view-as flip | hidden charts not offered | — | — | — |
| Import | `#fileMenuBtn` → `#importFileBtn` → picker → `#dlgModal` questions | same (file input) | same | ADMIN ONLY | — | — | — | — |
| Wipe the Tracker's data | **NO CONTROL** (see the practical note) | — | — | — | — | — | — | — |
| Phone Flow / Info / Show All | `#viewtabs [data-view="flow"]`, `[data-view="info"]`, `#showAllTab` | phone only | — | same | — | — | — | — |
| Log out; flip view-as | `#logout`; `#roleBadge` (drawer on a phone) | — | — | — | — | — | — | — |

*Before and after a login change or the view-as flip:* every row above is the same for admin and member except Export and Import. What is NOT reset by a login change is the subject of scenario 11. *With and without the squadron roster handed over:* in this app the roster is always handed over (TrackerPage wires it once); the "without" shape (+ Add as the plain "Student callsign:" prompt) is pinned by a unit test and cannot be reached from the screen, so it is not walked.

### 2b. Actions the data allows that NO screen offers

1. **Wipe the Tracker's data** — the D120 recipe needs it and only the browser's clear-site-data does it (it also clears the schedule, the Leave War and the settings, which is the plan). An admin "Reset the Tracker's data" two-tap control would make the recipe safe (fix in §5, scenario 14).
2. **Export every chart at once** — the Export dialog ticks only the current chart and has no "tick all" (scenario 5).
3. **Undo** a pace or end-date edit, a lull period added / changed / removed, a student add / remove / rename, a course or chart operation, an event-details edit, an Import — all by design except the lull × which also has no confirm (scenario 13).
4. **Save-first?** before Export, Import, + Add syllabus and Duplicate syllabus — the app asks only before a chart or course switch (scenarios 2, 3).
5. **See the current grade in the grading pop-up** — the wedge behind it is the only tell.
6. **See who last marked and when** — by design until the database.
7. **Carry a deleted built-in through the export** — deletions are not in the file (scenario 15).
8. **Reorder charts or crew by touch drag** — ▲▼ only on a phone (documented).

### 2c. Controls that are drawn but do nothing, or nothing visible

1. The grading pop-up on a course with no students — opens, every button inert (scenario 12).
2. The + on an N.A. event — refused with a message that is never shown (scenario 8).
3. The "Empty sheet ready — hit ✎ Edit…" guidance after + Add syllabus — never shown (scenario 8).
4. The Export dialog's two refusals ("Tick charts, students, or both." / "Tick at least one syllabus.") — shown BEHIND the dialog (scenario 6).
5. "Reset to doc" on an event the user created — there is no document; it wipes the details (scenario 44).

---

## 3. Ranked failure scenarios

### The fixture — the course that has everything on it, built through the app's own controls

Build this once on a fresh store (the walk starts from it; §7.1 of the order). Sign in `ad`/`a`, open the Tracker.

F1. On course **26ABSG**, chart **2026**, student **STUDENT A**: tap **ST-01** (a flight) → DCO; note Last Flown moved. Tap **ACG-01** → DPCO. Tap **ST-02** → Marginal, then + twice (change "Failed on" to an earlier date before the second +). Tap any green academic ball → N.A. Currency card: Down days 2, Upchit date. Pace card: 3 /wk, End date A. Lull card: + Set lull period, two clicks; Copy to… → STUDENT B.
F2. **STUDENT B**: touch nothing (the no-mark student).
F3. Students card **+ Add**: pick the first row of the squadron roster (a linked chip with a blue dot). **+ Add** again: type `VISITOR`, then × remove VISITOR (the student who left).
F4. Event details: ST-01 pop-up → ✎ Edit details → Name "ST-01 — Fam 1", Crew "IP / UP" → Save. Show All → BFM-5 → Edit → change Hours → Save. Switch to **Tx 2026** → BFM-5 → Edit details → change the Name → Save (the per-syllabus wording); back to 2026.
F5. Syllabus ✎ → **Duplicate** → `2026 COPY`. On the copy: ✎ Edit chart layout → Move: drag ST-02 120px right; **+ Flight** `FAM-X`; **Connect** ST-01 then FAM-X; **Line** from ACG-01's south port to empty space (loose amber end), then **➤ Arrow**; **✕ Merge** one crossing pair; **▣ Select all** → Font 10; **🗑 Delete** one academic ball (confirm); **✓ Done editing chart** → **✓ Save changes**.
F6. Syllabus ✎ → **Rename** "Tx 2026" → `TX 26` (a relabelled built-in). Syllabus ✎ → **Delete** "2024" (a built-in → deleted). Syllabus ✎ → **+ Add syllabus** `SKETCH` → ✎ Edit chart layout → **📋 Edit events** → paste `[{"id":"SK-01","type":"acad"},{"id":"SK-02","type":"flight","prereqs":["SK-01"]}]` → Save → ✓ Save changes (never drag them — the never-placed case).
F7. Syllabus ✎ → **Reorder**: `2026 COPY` first, `SKETCH` second, the built-ins after → Save order.
F8. Course ✎ → **+ Add course** `26BBSG` (lands on top); switch back to 26ABSG.
F9. Photograph and record: the `#sylSel` option texts and order; on 2026 COPY the `transform` of `.ball[data-id="ST-02"]`, the count of paths in `#edgeLayer`, the label font-size, the loose-end line; the Show All rows for ST-01 and BFM-5; the Failures card; the key ball; the Currency, Pace and Lull cards for STUDENT A.

Then the round trip: **R1** File → Export, tick EVERY chart in `#copySylList` (note the default), Charts only → capture the text. **R2** Export again with Students ticked → second file. **R3** Wipe (`localStorage.clear()` + reload) → sign in → Tracker (expect: four built-ins, 26ABSG with STUDENT A and B). **R4** Import file 1 → answer "Replace it" to each built-in question → compare with F9. **R5** Import file 2 → "Replace it" ×n → "Bring them in too?" Yes → compare marks, dates, failures, pace, lulls, students.

### The top fifteen, in full

**1. The round trip loses the chart ORDER — the Import button never applies the file's order. CONFIRMED.**
Setup: the fixture through R3. Action: R4. Expected: `#sylSel` reads `2026 COPY, SKETCH, 2026, TX 26, A/G - A/A 2026` — what was saved (the file's `order` carries it). Disproof: it reads `2026, TX 26, A/G - A/A 2026, 2026 COPY, SKETCH` — the shipped built-ins first, the hand-drawn charts appended after. Why: `importClick` brings charts in one at a time (`applyCharts(charts, { ids: [id] })`, `core.js` 5187 / 5193 / 5197) and the only code that applies a file's order runs when `ids` is absent (`applyCharts`, line 4792). The smoke check "the chart order you saved is the order you get back" (line 2916) passes because it calls `applyCharts` directly with no `ids` — the whole-file path the button never takes.

**2. Export writes the last SAVED chart, not the chart on screen — unsaved flow edits vanish from the file with no warning. CONFIRMED.**
Setup: on 2026 COPY, ✎ Edit chart layout → + Flight `LATE-1` → Connect ST-01 → LATE-1 → ✓ Done editing chart. Do NOT press the orange ✓ Save changes. Action: File → Export (all charts) → wipe → Import. Expected: either the file holds the chart as it stands, or Export asks to save first. Disproof: after the import there is no LATE-1 ball, and the file's `layouts["2026 COPY"]` still carries a position for it (positions save on the drop; the event list does not). Why: `collectCharts` reads `sylSource(id)` = the saved definition (`core.js` 4692); the on-screen draft `SYL` is not consulted, and `openCopy` / `saveCopyClick` never look at `sylDirty`.

**3. + Add syllabus, Duplicate syllabus and Import throw unsaved flow edits away without the question the chart and course switches ask — and Import leaves the Save button lit. CONFIRMED.**
Setup: as scenario 2 (LATE-1 unsaved on 2026 COPY). Action A: Syllabus ✎ → + Add syllabus `X` → OK. Expected: "You have unsaved flow edits… Discard them?" (as `#sylSel` asks). Disproof: no question; switch back to 2026 COPY — LATE-1 is gone and the Save button is dark. Action B: Duplicate → the copy has LATE-1, the original loses it, no question. Action C: File → Import any charts file → Replace → back on 2026 COPY: LATE-1 gone AND `#saveChanges` still orange over a chart with nothing unsaved. Why: `addSyl` (4352) and `dupSyl` (4319) never call `leaveFlowEdits`; `switchSylNow` (4265) calls `clearDirty()` then reloads; `applyCharts` ends in `loadCourse` (4804), which reloads the definition without clearing `sylDirty`.

**4. A custom chart's never-placed balls export at (60,60) when that chart is not on screen — after the round trip they sit stacked in the corner. CONFIRMED.**
Setup: SKETCH (two events placed by the JSON editor, never dragged); also, on 2026 COPY press ↺ Reset layout (a custom chart: its positions are emptied and the screen shows the course-map positions borrowed from 2026). Switch to 2026 so both are off-screen. Action: Export all → wipe → Import. Expected: SKETCH's two balls where the app had laid them; the reset copy where the map has every ball. Disproof: SK-01 and SK-02 (and every ball of the reset copy) drawn on top of each other at the top-left — one ball visible. Why: `layoutSnapshotFor` (724–741) for a chart that is not current has no auto positions (`auto = {}`) and no borrowed default (only `snapshotLayout`, the current-chart path, borrows), so it falls to `{ x: 60, y: 60 }`. When the chart IS on screen at export time the positions are the auto-flow ones, which is fine.

**5. The Export dialog ticks only the current chart and has no "tick all" — a backup made in good faith carries one chart. CONFIRMED (a missing door).**
Setup: fixture. Action: File → Export. Expected: for the database backup, every chart ticked, or a control that ticks all. Disproof: the line reads "Syllabi to include (1 ticked)" and there is no such control; the export made without noticing holds one chart; wipe → import → four hand-drawn charts are gone. Why: `openCopy` (5043) ticks `id === curSylId()` only; `CopyModalInner` offers no all/none.

**6. The Export dialog's own refusals are hidden BEHIND the dialog. CONFIRMED.**
Setup: File → Export. Action: untick Charts (Students already unticked) → press Export. Expected: "Tick charts, students, or both." on top. Disproof: the dialog dims, nothing readable appears; a tap anywhere closes the Export dialog and only THEN the message shows. Same with Charts ticked but every chart unticked ("Tick at least one syllabus."). Why: the question box is at z-index 71 (`Modals.jsx` 58–59); the Export dialog and its scrim are at 90/91 (`Modals.jsx` 334–335).

**7. After the round trip every built-in wears the "✎ edited" mark even if untouched. CONFIRMED.**
Setup: fixture through R4. Expected: `#sylSel` reads `2026`, `TX 26`, `A/G - A/A 2026` as before; only 2026 COPY-style edits show ✎ (well, a copy is custom — none of the built-ins should). Disproof: every built-in reads "… ✎"; Reorder tags them "built-in ✎ edited"; Delete syllabus now offers "Revert edits only" for a chart nobody edited; and a future shipped correction to that built-in would no longer reach him (the override wins). Why: `collectCharts` exports the shipped definition for an unedited built-in (`sylSource` → `SYLLABI[base]`), and `applyCharts` stores whatever it receives as an override (`customDefs[target] = …`, line 4780) — `sylHasOwnDef` then says edited.

**8. Two messages are shown on a line that is hidden outside arrange mode, so they never appear. CONFIRMED.**
A — Setup: STUDENT A, an academic ball marked N.A. Action: reopen its pop-up, press + (Fails). Expected: "“X” is marked N.A., so it cannot be failed." Disproof: nothing changes and no words appear anywhere (the count stays 0 — the smoke asserts the count only). B — Action: Syllabus ✎ → + Add syllabus `EMPTY`. Expected: the guidance "Empty sheet ready — hit ✎ Edit, then use + Flight …". Disproof: a blank board and silence. Why: both use `flashHint` (3583, 4371), which writes to `#arrhint`, and `#arrhint` is `display:none` unless arrange mode is on (`App.jsx` 168; `tracker.css` `.arrhint{display:none}` / `.arrhint.on`).

**9. The key ball prints the course's hidden id instead of its name. CONFIRMED.**
Setup: any course. Action: look at the Students card's key ball centre. Expected: "26ABSG". Disproof: a code like `cm…` (the opaque course id minted on 13 Sep) — and on a phone it overflows the yellow disc. Why: `renderKeyBall` prints `escapeId(course)` (`core.js` 3419) and `course` has been the id since course ids landed.

**10. The details bubble outlives the tab — it floats over the Info tab, over other Raptor tabs, and over the login screen. CONFIRMED.**
Setup: phone width (or touch emulation), ⓘ Details on. Action: tap ST-01 (bubble appears) → tap the "ⓘ Info" tab. Expected: the bubble goes. Disproof: it floats over the statistics. Then Flow → tap a ball → tap Raptor's "Leave War" tab → the bubble still floats over the grid. Then Logout → over the login card. Why: the bubble is appended to `document.body` (fixed, z 66) and is hidden only by a redraw, a pointer-leave (mouse), a press on the SVG outside a ball, or the ⓘ toggle; neither the phone tab switch (`App.jsx setTab`) nor `TrackerPage`'s inactive cleanup nor logout hides it. (The failure-chip and chip long-press bubbles DO dismiss on the next press anywhere — those are fine.)

**11. Logging out does not reset the Tracker — the next login inherits the previous user's open pop-up, dialog, arrange mode and undo history. CONFIRMED.**
Setup A: admin, open ST-03's grading pop-up and leave it; or turn on ✎ Edit chart layout; or press + Add and leave the dialog up. Action: `#logout` → sign in `us`/`us` → Tracker. Expected: a clean tab — the rest of the app drags every login and logout "back to a safe default" (`resetSession`), and the app's own rule is that undo is per login session. Disproof: the pop-up / the dialog / the edit strip is still up. Setup B: admin marks ST-04 DCO → logout → member login → `#trUndoBtn` lit with "Undo the mark on ST-04 for STUDENT A" — the member undoes the admin's mark, and the mark then reads as the member's own undo in the export. Why: `resetSession` and `toggleRole` write only the file lock through `role.js`; nothing in `core.js` listens for a session change (all its state is module-level and survives the Shell unmount).

**12. On a course with no students, tapping a ball opens a grading pop-up whose buttons do nothing. CONFIRMED.**
Setup: Course ✎ → + Add course `EMPTY1` (no students). Action: tap any ball. Expected: no pop-up, or a line saying to add a student first. Disproof: the pop-up opens with a blank name; DCO, +, the date boxes all do nothing (the grade guard silently closes it). Why: `ballTap` → `openPop` unconditionally (3448–3455); `popGrade` / `popFail` bail on `!s`.

**13. Removing a lull period is a single × with no question and no undo. CONFIRMED (door gap).**
Setup: STUDENT A with two lull periods. Action: press × on one. Expected: a question, or an undo step. Disproof: the period vanishes at once; `#trUndoBtn` stays greyed; the projected end date moves. Why: `removeLull` (3347) splices and saves; lulls are not in the mark snapshot.

**14. The `?fresh=1` address is not a wipe — an import made there evaporates on reload. CONFIRMED (a trap on the D120 path, not a code defect).**
Setup: open `http://localhost:4180/?fresh=1`, sign in, Tracker (looks freshly wiped). Action: Import the charts file → reload WITHOUT `?fresh=1`. Expected (if this were the wipe): the charts are there. Disproof: the old data is back and the import is gone — the address selects the memory store (`storage/boot.ts chooseBackend`). The only real wipe is the browser's clear-site-data; there is no in-app door.

**15. A deleted built-in comes back after the round trip. CONFIRMED behaviour — needs the owner's ruling.**
Setup: fixture (2024 deleted). Action: R3–R4. Observation: "2024" is back in `#sylSel` with the shipped layout; the Reorder list's "Deleted built-in syllabi" section is empty. The file carries no deletions (`collectCharts` walks visible charts only; there is no `hidden`/`tomb` block). Whether a deletion should survive the move is a product call; record it either way so nobody re-fixes it.

### Sixteen to forty-six, short form (setup → action → expected; the disproof follows from it)

16. **Rename collision refuses the whole import. PREDICTED (traced).** Rename built-in "2026" → `2026 OLD`, rename `2026 COPY` → `2026`. Export all → wipe (the fresh store's built-in is named "2026" again) → Import. Expected: both come in with their names. Predicted observation: "That file could not be brought in: the syllabus “2026” is a different chart than one already here. Rename one, then import again" — nothing imports until he renames the fresh built-in by hand (`reconcileSylIds` matches the custom's label against the store's shipped label).
17. **The demo pair stays on the imported course. PREDICTED.** R5 (students file). Expected: 26ABSG carries exactly the file's students. Predicted: STUDENT A and STUDENT B (re-seeded on every fresh store) sit beside them, and 26ABSG stays even when the file's courses are all named differently.
18. **Replace-it ×4 and a Cancel.** R4. Every built-in asks "already exists — Replace it / Add as new / Cancel". Answer Cancel to one: that chart keeps the shipped layout — every hand move on it is lost silently; the closing message lists only what came in. Walk both answers; the wording for a post-wipe import is worth the owner's eye.
19. **Same file twice.** Import file 1 again → Replace ×n. Expected: no duplicate charts, order unchanged, positions unchanged.
20. **Names survive.** After R4: `TX 26` (relabelled built-in, `userNamed`) and `2026 COPY` keep their names (the custom case is unit-tested; walk both).
21. **Tx wording survives.** After R4: Tx BFM-5 shows the F4 name; 2026's BFM-5 shows the long-course name and the F4 hours edit. (Smoke covers this in-session; walk it across the wipe.)
22. **Lines, arrowheads, hops, fonts survive.** After R4 on 2026 COPY: same `#edgeLayer` path count, the loose-end line with its arrowhead, the merged hop flat, every label at 10px, ST-02 at its moved `transform`.
23. **Event details survive, including the __kept case.** After R4: Show All ST-01 reads "ST-01 — Fam 1 / IP / UP"; on Tx, set BFM-5's Crew to exactly the 2026 wording (equal to the base, differing from the Tx profile) before export → after import it still reads the 2026 wording (the `__kept` marker must ride the file).
24. **Colon names survive.** Rename a chart to `A:B` → export → wipe → import → the name is `A:B`; a course name with a colon is refused at typing (correct).
25. **Mark then rename / rename then mark.** STUDENT A: mark ST-05 → rename to `ALPHA` → the tooltip reads "…for ALPHA", the mark stays; rename `ALPHA` → `BRAVO2` → mark ST-06 → export: one enrolment id, both marks under it.
26. **Mark, switch chart, undo.** Mark on 2026 → switch to 2026 COPY → `#trUndoBtn` greyed (history belongs to the chart) → switch back → still greyed (cleared on the switch, by design) — and `#trRedoBtn` greyed after a chart change (smoke covers).
27. **Delete then restore / restore then delete.** Delete "A/G - A/A 2026" (built-in) → Reorder → Restore → back, empty student layer, shipped layout. Delete `SKETCH` (custom) → the message says it cannot be undone → gone from Reorder too.
28. **Import then undo; the other app's Undo.** After R4: `#trUndoBtn` greyed. Go to Edit Schedule: its Undo tooltip never reads "a change to the tracker" and pressing it never touches the Tracker (the timeline records Tracker changes but the Tracker is not cut over — see §4).
29. **Course switch mid-edit, both answers.** Unsaved LATE-1 → `#courseSel` 26BBSG → "Discard them…?" No: stays, still orange. Yes: switches, Save button gone, LATE-1 gone. Same through `#sylSel`. (Smoke covers the course half.)
30. **Reload with unsaved flow edits.** The browser's leave prompt appears; leave → LATE-1 is gone; its position lingers in the layout (harmless — check the chart still draws and Fit works).
31. **Leave the tab and come back.** With arrange on / a question dialog up / a search ring: go to Inputs and back → all still there; while away, Escape on the schedule does not close the Tracker's dialog and Delete in a Raptor text box does not delete the selected balls.
32. **Logout → member login.** No ⇪ File menu; grading, editing, students, courses, charts all work; the chart is drawn (a second mount).
33. **View-as flip.** With the Export dialog open → `#roleBadge` → it closes and the File menu is gone; flip back → menu returns. With an Import "Replace it?" question up → flip → the import continues to its end (the lock is checked only at the door; the admin's own hand, acceptable — note it).
34. **Phone ↔ desktop resize.** Chart re-fits to the width unless zoomed by hand (then "reset" re-fits); Info tab open → widen → both columns show; the search strip open → widen → the box is inline; arrange strip at 390px wraps to four or five rows (photograph — how much chart is left?).
35. **Roster changes while the Tracker is open.** Quals page: add a person → back → + Add lists them (reopen the dialog; a dialog left open shows the old list). Archive the linked student's person → their chip loses the dot. Rename that person's callsign → the chip's title changes, the student's label does not (by design; check it reads sensibly).
36. **Course with no students.** Show All rows carry no status badge; the Students card shows the empty state with + Add; the pop-up case is scenario 12.
37. **Student with no marks.** Pick STUDENT B → lands on ST-01 centred; Overall 0%; Next event ST-01 ready; Failures "none".
38. **Enrolment on a hidden chart.** Delete a built-in that has a student on it → + Add that same person on 2026 → no second enrolment (unit-tested; optional walk).
39. **Failures in both orders.** + + on ST-02 → − → ↶ → ↷; mark the event N.A. → ticks vanish, + refused (silently — scenario 8); back to Marginal → ticks return.
40. **Last Flown forward-only.** Mark ST-01 done today, then ST-03 done dated last week → Last Flown stays today; then ST-04 dated tomorrow → moves.
41. **Search from the Info tab (phone).** Type `ST-1` → the app switches to Flow and rings ST-10; ✕ takes the ring off; switching chart clears the box.
42. **Arrange on a phone.** Edit chart layout → drag a ball by touch → it moves and saves; pinch zooms; Done editing → view restored where it was.
43. **Landscape phone. PREDICTED.** 844×390: open a grading pop-up on a ball near the top → the pop-up (grade buttons, two date boxes, failures, details, Edit details) is taller than the screen and does not scroll — Edit details unreachable.
44. **"Reset to doc" on a user-made event. PREDICTED trap.** FAM-X → Edit details → fill Name and Crew → Save → Edit details → Reset to doc → both fields blank (there is no document for it).
45. **The by-stamp.** Member marks ST-07 → admin exports with Students → the record's `by` is the member's display name.
46. **The phone's real file route.** iPhone Safari: Export → a download → Files; Import → the file input → Files → the same file → the closing message. (The hooks cannot stand in for this one.)

---

## 4. Explicit negatives — what I checked and found nothing

- **The file lock.** Import, Export and the Export dialog refuse at the write path (`if (fileLocked) return`, exactly three sites) and the header hides only the File menu; a member login, a logout and the admin's flip all set it; a flip closes an open Export dialog. Unit-pinned; consistent with the ruling.
- **The people bridge after a re-login.** `initStore()` runs once at boot (`main.tsx`) and Raptor's listener set is never cleared, so the Tracker's roster subscription survives logout → login; `wireTrackerPeople` is idempotent. + Add keeps listing the live roster.
- **The app-wide Undo and the Tracker.** The global timeline records Tracker changes but `setCutoverModules(['sched','lw','inputs','plan'])` leaves `trk` out, so the Edit Schedule and Leave War Undo/Redo skip every Tracker entry (`newestUndoable` → `isEligible`); no Tracker store is registered for restore; the Undo/Redo trio is drawn only on Edit Schedule. No double-undo seam exists today. (It will the day `trk` is cut over — the Tracker's own ↶ ↷ would then be a second stack over the same records; flag that in the cutover design.)
- **Keyboard shortcuts.** Only the Tracker binds Ctrl+Z / Ctrl+Y, and only while its tab is up; Raptor binds no document-level Ctrl+Z. Escape and Delete handlers are switched off while another tab is up.
- **The phone search strip's anchor.** It positions under `document.querySelector('header')`; Raptor's top bar is a `div.topbar`, not a `<header>`, so the strip finds the Tracker's own bar.
- **The measured column height.** `--tr-top` is measured on show and on resize; the top bar's height does not change on the view-as flip (the Undo trio is Edit-Schedule-only), so no stale measurement on the flip. Logout removes `body.tr-on` (effect cleanup), so page scrolling returns.
- **Layering.** Poke-ball editor (60) under a confirm (71); lull calendar and failures list (70) under a confirm; details editor (91) over Show All (81); menus (50) over the phone tabs (35). Only the Export dialog vs its own alert is wrong (scenario 6).
- **Storage funnel.** Every mark, date, failure, pace, lull, roster, chart, layout, order and event-details write goes through `sSet` → the whiteboard; only the two view preferences and the bar choice write localStorage directly, by design.
- **Round-trip carriage of the things that ARE carried.** Hand-moved positions (live → saved); `__lines`, `__edgeMeta`, `__merges`, `__unmerges`, `__font`, `__derived` for both the current and every other chart (live → saved → shipped); event details with `__kept`; an edited built-in's definition; renamed labels (`userNamed` on built-ins AND customs — the custom case pinned after a Fable finding); colon names; `base` never trusted from the file. Nothing missing there by reading.
- **Import safety.** A charts import writes no roster, mark or date key (smoke-pinned); a student block is refused whole on a person clash, a name/id contradiction, an unresolved chart or a pre-v3 shape; the course list merges and never overwrites.
- **The wedge tap, the chip long-press, the failure-chip tap, the Find list, the Reorder list, the lull calendar, the Done-on and Failed-on boxes** — each has a unit or smoke pin AND I could find no second place the app draws them that the pin does not cover.
- **The seeds.** Shipped data names nobody; the demo pair are placeholders.

---

## 5. For every scenario I believe is a defect: confirmed or predicted, and the exact fix

Numbers match §3. "Confirmed" = read in the code at the line named; "Predicted" = traced but not read to the last line.

**1 (order) — CONFIRMED, `core.js` 4792 and 5187/5193/5197.** In `importClick`, after the `if (hasCharts) { for (const id of charts.order) … }` loop, add:
```js
/* the file's chart ORDER is applied when the whole file came in — the
   export → wipe → import path (D120). A partial import (a chart declined)
   leaves the order alone, as a single-chart import always has. */
const wanted = charts ? charts.order.filter(id => (charts.syllabi || {})[id]) : []
if (hasCharts && done.length === wanted.length) {
  const inFile = charts.order.map(id => has(addAsNew, id) ? addAsNew[id] : id).filter(id => sylEntry(id))
  SYL_ORDER = [...inFile, ...SYL_ORDER.filter(id => !inFile.includes(id))]
  await saveSylOrder(); refreshSyl()
}
```
Test: a smoke check that drives `#importFileBtn` (through `__pickOpenForTests`) after `localStorage.clear()` with a file whose `order` puts a custom first, and asserts `#sylSel`'s option order equals the file's — red today.

**2 (export with unsaved edits) — CONFIRMED, `core.js` 4692 (`sylSource`) and 5040–5077.** Make `openCopy` async and gate it (the picker is raised later from the dialog's own button, so an await here is safe):
```js
export async function openCopy() { if (fileLocked) return;
  if (sylDirty) {
    if (!await uiConfirm('You have unsaved flow edits on “' + curSylName() + '”.\nSave them first, so the export includes them?')) return;
    await persistSyl();
  }
  copyOpts = { charts: true, students: false }; …
```
Test (`tracker.test.tsx`): `addModule` → `openCopy` → answer true → `collectCharts([cur])` includes the new event.

**3 (add / duplicate / import discard) — CONFIRMED, `core.js` 4352, 4319, 4265, 4804.** (a) `addSyl`: first line `if (!await leaveFlowEdits('Discard them and add a syllabus?')) return;`. (b) `dupSyl`: first lines `if (sylDirty) { if (!await uiConfirm('You have unsaved flow edits on “' + curSylName() + '”. Save them first? (The copy will be made from the saved chart.)')) return; await persistSyl(); }`. (c) `importClick`: after `if (!picked) return;` add `if (!await leaveFlowEdits('Discard them and bring the file in?')) return;` (after the pick — the picker must stay first). Tests: one per door, red today.

**4 (never-placed positions) — CONFIRMED, `core.js` 724–741.** Give `layoutSnapshotFor` the same fallbacks the current-chart path has: parameterise `computeFlow(list = SYL, map = byid)` and `bestDefaultLayout(ids = new Set(SYL.map(e => e.id)))`, then in `layoutSnapshotFor`: `const map = {}; (events || []).forEach(e => map[e.id] = e); const auto = (sylId === curSylId()) ? computeFlow().pos : computeFlow(events, map).pos; const borrow = own ? null : bestDefaultLayout(new Set((events || []).map(e => e.id)));` and the position chain `live?.[id] || saved?.[id] || own?.[id] || borrow?.[id] || auto[id] || { x: 60, y: 60 }`. Test: a chart with an unplaced event exported while another chart is current does not export `{60,60}`.

**5 (tick all) — CONFIRMED, `core.js` 5043; `Modals.jsx` 353.** Add `export function setCopyPickAll(on) { const p = {}; orderedSylIds().forEach(id => p[id] = !!on); copyPick = p; notify(); }`; in `CopyModalInner` beside "Syllabi to include": `<button className="sm" id="copyTickAll" onClick={() => core.setCopyPickAll(true)}>All</button> <button className="sm" id="copyTickNone" onClick={() => core.setCopyPickAll(false)}>None</button>`; and in `setCopyOpt`, when `students` is ticked on, tick all charts (a full backup). Smoke: "Export has a tick-all".

**6 (buried alerts) — CONFIRMED, `Modals.jsx` 58–59 vs 334–335.** Raise the question box above every other panel on the tab: `DlgModal` overlay `zIndex: 100`, modal `zIndex: 101`; update the z-ladder note in `known-gaps.md`. (Everything the Tracker draws is under 92; Raptor's own overlays stay far above at 400/440.) Smoke: Export with nothing ticked → the alert is the topmost element at the screen centre (`document.elementFromPoint`).

**7 (✎ on untouched built-ins) — CONFIRMED, `core.js` 4780, 4692.** In `applyCharts`, before writing the override: `const shipped = isBuiltinSylId(target) ? SYLLABI[builtinBaseOf(target)] : null; const strip = a => (a || []).map(({ _b, ...e }) => e); if (shipped && JSON.stringify(strip(events)) === JSON.stringify(strip(shipped))) delete customDefs[target]; else customDefs[target] = JSON.parse(JSON.stringify(events));` (the `_b` scratch field is written by `computeFlow` into saved definitions and must not count). Optional, same place in `importClick`: when the incoming definition AND layout equal what is here, skip the "already exists" question and say so in the status line. Test: export an untouched built-in → import → `sylHasOwnDef` false.

**8 (silent messages) — CONFIRMED, `App.jsx` 167–169; `core.js` 3583, 4371.** Show the hint line whenever a flash is pending, without moving the chart: `App.jsx` line 168 → `<div className={'arrhint' + ((core.arrangeMode || core.hintFlash) ? ' on' : '')} id="arrhint">…` (leave the wrapper's `.on` tied to `arrangeMode` so the 26px reservation stays arrange-only; the flash floats over the legend for 1.8 s, as the edit-mode hint used to). Smoke: "+ on an N.A. event says so on screen" and "Add syllabus shows the empty-sheet guidance".

**9 (key ball id) — CONFIRMED, `core.js` 3419.** `${escapeId(curCourseName())}`. Smoke: the key ball's centre text equals the Course dropdown's selected text.

**10 (bubble outlives the tab) — CONFIRMED, `core.js` 3651–3669; `App.jsx` 46–53; `TrackerPage.tsx` 69–72.** (a) `TrackerPage.tsx`: import `hideEventBubble` from `./app/core.js` and call it in the active-effect cleanup. (b) `App.jsx`: route the phone tabs through `const pickTab = t => { core.hideEventBubble(); setTab(t) }`. (c) the session reset of fix 11 also calls it. Smoke: Details on → tap ball → Info tab → `#detailBubble` is `display:none`; and after `window.go('leavewar')`.

**11 (session boundary) — CONFIRMED, `state/store.ts` 333 and 376; no listener in `core.js`.** Add a fourth no-import seam, `src/tracker/session.js`, the shape of `role.js`: `let n = 0; const subs = new Set(); export function bumpSession() { n++; subs.forEach(f => { try { f(n) } catch (_) {} }) } export function onSession(f) { subs.add(f); return () => subs.delete(f) }`. In `resetSession` (beside `trSetFileLocked`): `trBumpSession()`. In `core.js`: `onSession(() => { if (pop) closePop(); if (dlg) dlgClose(dlg.input ? null : false); lullPick = null; lullCopy = null; failLog = null; infoId = null; editId = null; ordMode = null; sylModalOpen = false; showAllOpen = false; copyOpen = false; if (showDetails) toggleDetails(); if (arrangeMode) toggleArrange(); undoStack = []; redoStack = []; clearSearch(); hideDetailBubble(); notify(); })`. Do NOT touch `sylDirty` or the draft — the next person sees the orange Save button and decides. Tests (`tracker.test.tsx`): mark → `resetSession(null)` → `canUndo()` false; `openPop` → `resetSession(...)` → `pop` null. Update the CLAUDE.md "three seams" sentence to four.

**12 (pop-up on an empty course) — CONFIRMED, `core.js` 3448–3455.** In `ballTap`, before `openPop`: `if (!active) { setSaveStatus('add a student first — Students card, + Add', 'ok'); return; }` (the status line is visible in every mode; the hint line is not — fix 8 would also do). Smoke: on a course with no students a ball tap opens no `#pop`.

**13 (lull ×) — CONFIRMED, `core.js` 3347–3349.** `export async function removeLull(s, i) { const l = (lulls[s] || [])[i]; if (!l) return; if (!await uiConfirm('Remove the lull period ' + fmt(parseD(l.start)) + ' → ' + fmt(parseD(l.end)) + ' for ' + nameOf(s) + '?')) return; lulls[s].splice(i, 1); await saveLulls(s); renderSide(); }`. The chip's × already stops propagation, so the calendar does not open behind the question.

**14 (no wipe door) — CONFIRMED, `storage/boot.ts` 53; no Tracker reset anywhere.** Not a code bug; the D120 recipe needs a door. Recommended: an Admin-page two-tap control (the existing `ClearControl` pattern) "Reset the Tracker's data" that calls a new `core.wipeAll()` — `const { keys } = await storage.list(); for (const k of keys) await storage.delete(k); prefSet('lastCourse', ''); location.reload()` — admin-gated at the write path like Import. Until then the recipe must say "clear site data", never `?fresh=1`.

**15 (deleted built-in returns) — CONFIRMED behaviour; owner's call.** If deletions should survive: `collectCharts` adds `deleted: BUILTIN_SYL.filter(b => SYL_TOMB[b.id]).map(b => b.id)`; `fileFormat.checkCharts` accepts an optional `deleted: string[]` of valid built-in ids; `applyCharts` on a whole-file import (the `done.length === wanted.length` condition of fix 1) re-applies each as `delSyl` does (tomb + hidden + drop the entry). If not: record "leave it" with the date.

**16 (rename collision) — PREDICTED, `sylIds.js` 189–221.** In `reconcileSylIds`, build the store's `byName` only from store entries whose id the file does NOT carry (a built-in present in the file will take the file's label on import, so its store label must not block a custom that now owns it): `const fileIds = new Set(listIn.map(e => e.id)); for (const e of existing) { if (!isSylEntry(e)) continue; storeIds.add(e.id); if (fileIds.has(e.id)) continue; if (!has(byName, e.name)) byName[e.name] = e }`. Then, because charts are upserted one at a time, the custom named "2026" may land as "2026 (2)" if it precedes the built-in in the file; a second label pass at the end of `importClick` (set every imported entry's label to its file label where `userNamed`, now that the clashes are gone) closes that. Test: the exact rename pattern above through `normalizeImport`.

**17 (demo pair after import) — PREDICTED.** Product call: either the fresh store stops seeding STUDENT A / B (the smoke's "the seed carries two students" pins would move to a fixture), or the Import dialog says the seeded pair are placeholders. No code fix proposed without the ruling.

**43 (landscape pop-up) — PREDICTED.** `.pop{max-height: calc(100vh - 16px); overflow: auto}` in `tracker.css`; `Pop.jsx`'s placement already clamps top/left.

**44 ("Reset to doc" on a user-made event) — PREDICTED.** In `InfoModalInner` and `SaEdit`, render the button only when `EVENT_INFO[id]` exists (`core.hasDoc(id)` = `!!EVENT_INFO[id] || !!(EVENT_INFO_BY_SYL[curBase()] || {})[id]`).

Everything else in §3 (18–42, 45, 46) is a walk item with an expected result, not a claimed defect.
