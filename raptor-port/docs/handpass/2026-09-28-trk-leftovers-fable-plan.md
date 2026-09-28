# Fable's round-1 report — the Tracker leftovers plan (28 Sep 26)

*(Saved verbatim from Fable 5.1's hand-back; read-only review of `docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md`
against the brief `docs/superpowers/briefs/2026-09-28-trk-leftovers-plan-redteam.md`. Blind to Astra's report,
`2026-09-28-trk-leftovers-astra-plan.md`. The dispositions are in the plan's §6.)*

Read-only; nothing run, nothing changed. Read: the plan, the five backlog items, every Tracker ruling (including D370–D375, which landed during this read), the register rows named, w1/w2/w3, the add-race sheet §8, the ten baseline step logs, and every file the brief lists (core.js's named functions, role/people/peoplewire, App.jsx, Modals/Header/SidePanel/Pop/ArrangeTools, store.ts/perms.ts/accounts.ts/logout.ts, Shell.tsx, App.tsx, retest.test.tsx, smoke.mjs, bake-user-charts.mjs, sylIds.js, eventDetails.js, fileFormat.js, data/*.js, tracker.css, scheduler.css).

**Note first:** all six of §3's questions are now answered (D370 card leaves out N.A. failures · D371 failures ordered by day · D372 pace/end dates/lulls become undo steps · D373 fold · D374 refuse a future day in four boxes · D375 keep the import's course order). Several findings below are about what those answers now require of the plan.

## PART 1 — Findings, most severe first

### F1 · HIGH · C5's "saves only a whole day" still saves wrong REAL days while a day or month is typed
**Evidence.** The plan §C5: DateBox "saves only a whole day (`isWholeDay`… a 4-digit year from 1900)". But Chrome's date box passes through *whole, real* days while the DAY or MONTH is typed: typing "17" into the day field first yields `2026-09-01` (W2-F2's own recorded series: "2026-09-01, 2026-09-17, "", 2026-09-17, 0002-09-17…"). Today every side-panel box saves on each keystroke (`SidePanel.jsx` 331–334, 365, 370; the full list's row 184–185), and the pop-up's "fixed" Done-on box does the same (`core.js` `popDoneChanged` 3917–3929 → `setDoneDate` 3931 on every whole-day value). A year-only test closes the half-typed-YEAR hole and leaves the half-typed-DAY/MONTH hole open.
**Why it now matters more.** (a) D374: typing "29" for the 29th passes "02" — accepted and saved — then "29" is refused and "put back to the saved day", which is now the 2nd, not the day before typing. (b) D371: a failure's day box in the full list re-dates on each keystroke → the list re-sorts by day → its rows are keyed by index (`SidePanel.jsx` 180 `key={x.id + ':' + x.i}`) → the box being typed into unmounts and the cursor is lost mid-word. (c) Done-on: a flight re-dated to the 1st for an instant → Last Flown settles to the 1st, then to the 17th; a slow typist (>2 s between digits) gets one undo step per whole day (R109's window).
**Scenario.** TR-2 DCO on 28 Sep; reopen; click the day part of Done on; type "1", pause 3 s, "7". Expect: the mark reads 17/09 and one ↶ returns it to 28/09. Disproof: the record shows 01/09 in between, Last Flown reads 01/09 for a moment, two steps recorded.
**Fix the plan.** (1) `DateBox` commits on **leaving the box** (blur), on **Enter**, and on **unmount** — never on each keystroke: a whole day → saved (if it differs from the saved one); a half-typed value → put back to the saved day; an emptied box → the empty saved on blur. The picker paths (Chrome's popup, iOS's wheel) also end in a blur, so they commit the same way. (2) Convert the pop-up's Done-on and Failed-on boxes too (roll-call: eight boxes, not six) — Done-on's draft still feeds the grade press as today; the re-date of an already-done mark happens on blur/Enter. (3) `isWholeDay` (with D374's "not after today" for the four boxes) is the validity test AT COMMIT. (4) The full failures list keys rows by a stable identity or, simpler, relies on commit-on-blur so a re-sort never happens under the cursor. (5) Tests: type "1", pause, "7" → nothing stored until blur; blur → one step; the smoke's four `pg.fill(...)` on date boxes (`smoke.mjs` 1529, 1564, 2219, 4068) gain a Tab/blur, and the R109 "keystrokes within 2 s are one step" pin becomes "one commit = one step". (6) Put the feel change on the look card: a date saves when you leave the box, not as you type.

### F2 · HIGH · B1(a) "answer the first as cancelled" ping-pongs with any multi-step job and takes decisions the person never made
**Evidence.** `importClick` (`core.js` 5796–5935): per-chart `uiChoice` where cancel = "Skip this one" and the loop `continue`s to the NEXT chart's question (5829–5835); then the students `uiConfirm` (5901) where cancel = students not brought in; then the closing `uiAlert` (5931). `dupSyl` 4787→4791 (choice, then the name prompt), `delSyl` 4900→4920, `addModule` 3375→3377 are the same shape.
**Scenario.** Import a backup with two existing charts. At chart 1's question a second question is raised (by the door B1(b) closes, or programmatically). Belt fires: chart 1's question is cancelled → **chart 1 is silently SKIPPED** → the import immediately asks about chart 2 → `_dlgShow` now cancels the person's *own* new question (their "+ Add" box vanishes unanswered) → chart 2's question is on screen. The person's action is lost and a chart was skipped without them choosing; with the students question it is "students not imported", silently. The brief's "could the first's continuation open a third?" — yes, every time.
**Fix the plan.** Replace (a) with a **queue**: `_dlgShow` while a question is up *waits for that question's promise* and then shows (a 3-line promise chain, `dlgChain`); order is preserved and nobody's answer is invented. `endSession` drains the queue (every waiting question answered cancelled — they belong to the outgoing person). Keep (b) the trap — with it built, the queue is belt-and-braces reached only programmatically. Tests: `uiPrompt('a')` then `uiPrompt('b')` → 'a' still on screen; `dlgClose('x')` → 'a' resolves 'x' and 'b' appears; `uiChoice` then `uiConfirm` → answered in order; `endSession` with two queued → both resolve null/false, none shown to the next session. Logout stays refused while any question is up (`onBeforeTrackerLogout` line 81 — unchanged).

### F3 · MEDIUM-HIGH · B1(b)'s door is wider than Tab from the box: Raptor's own bar is outside the shade, and Tab from there walks into the Tracker's controls
**Evidence.** The shade `#dlgOverlay` lives inside `.tr-root` (`Modals.jsx`), under Raptor's sticky top bar; the baseline's Tab path (lo-H N.2) runs body → Edit Schedule → … → Logout → the role badge → `#activeSel` → `#courseSel` → … → "+ Add". A Tab-wrap inside the box stops Tab *from the box*, but a pointer press on Raptor's bar (allowed — the Logout guard exists precisely because it is reachable) puts focus there, and the next Tab enters the Tracker's controls behind the shade → Enter → the second question.
**Fix the plan.** While a question is up, mark every `.tr-root` child except the question's overlay and box `inert` (header, tool strip, hint, legend, view tabs, layout, the other modals) — Chrome 102+/Safari 15.5+/Firefox 112+ — and add the Tab/Shift+Tab wrap inside the box; give the box `role="dialog" aria-modal="true"`. Document-level Escape and the overlay click keep working (inert blocks focus and hit-testing on the marked elements only). Test: focus Raptor's Logout by pointer, Tab → focus never lands on `#activeSel` or `#addStu`; Tab from `#dlgOk` → the box's first control (`#dlgFilter` with a list, else `#dlgInput`, else `#dlgCancel`; an alert wraps to `#dlgOk` itself).

### F4 · MEDIUM-HIGH · A: the remount draws the OLD person's chart before the reload lands, and that chart is live
**Evidence.** App.jsx's ready effect runs `core.renderBoard(); core.notify()` synchronously on mount; the plan's `resumeForPerson` reloads through `loadCourse` → `onChain` (`core.js` 1720, 674), asynchronous and store-bound. `wireBoard` (2935–2947) binds `ballTap` on whatever is drawn; `popGrade` (3859) writes to the module's `course`/`active`.
**Scenario.** Admin on course 2 / STUDENT B logs out; the member logs in on a slow phone, opens the Tracker and taps a ball at once. Expect: no pop-up until the member's own course is up. Disproof: a pop-up titled "… · STUDENT B" on the admin's course, and a DCO written to it stamped `by: Ranger`. The flash alone is the "wrong starting point" the item is about.
**Fix the plan.** `resumeForPerson()` decides synchronously: if the owner differs it sets `loading = true`, clears `active`/`pop`, returns "reloading", and the ready effect then skips `renderBoard()`; the load's end renders and lands (as `switchCourse` does). App shows its "Loading…" placeholder while `loading` on this path; `ballTap` is a no-op while `loading`. Test: mount with a different whoamiId → no `.ball` until the chain resolves; a `ballTap` in the window writes nothing.

### F5 · MEDIUM · A's tests as written cannot tell the two people apart, and never trigger the resume
**Evidence.** `retest.test.tsx` 54, 184–185, 200–201 sign in with `{ user, role }` and no `pid` → `resetSession` → `setMe(DEFAULT_ME)` (`store.ts` 326, `auth.ts` 34) → ME is `'bane'` for the admin AND the member; `HOOKS.whoamiId = () => me()` (`store.ts` 776). The test calls `C.init()` directly — no App mount, so the ready effect never runs.
**Fix the plan.** The F10 extension signs in with `pid` (`ad` → `'stiff'`, `us` → `'bane'`, `accounts.ts` 91–92), wires the bridge (`wireTrackerPeople` or `setWhoamiId` directly) and calls `C.resumeForPerson()` after each sign-in, asserting it is a no-op for the same person. The smoke's cross-person check signs in as a second real account (`outlaw`/`hex`, 93–94) and opens the Tracker after each login; its "that memory is this browser's alone" and "no such course" steps read/write the per-person key.

### F6 · MEDIUM · A: with no session, Raptor's person id is `'bane'` — which is also the seeded member's real id
**Evidence.** `perms.me()` 166–170: no session → returns ME; `resetSession(null)` → `setMe('bane')`; `accounts.ts` 92: `us` is person `bane`. The plan says "the wire returns '' when there is no session" but names no mechanism.
**Fix the plan.** The wire's `whoamiId` answers `''` unless `HOOKS.whoami() !== 'Unknown'` (exactly `whoamiForTracker`'s test), in one function; test: after `resetSession(null)`, the bridge's `whoamiId()` is `''`, and a pick written then goes to the unprefixed key. (Nothing writes a pick at logout, but the guard must exist before anyone adds one.)

### F7 · MEDIUM · C14's fix cannot fit either — the words are cut by the slot's width, not by their length
**Evidence.** `.saveslot` is a fixed 172px (`tracker.css` 324); Save is 107px + 6px gap → 59px left; "● saved" needs 57px and reads cut at 51 (lo-E K 1200 and 1440: `statBox w:51, scrollW:57`). "● unsaved" is wider still.
**Fix the plan.** Widen the slot to the longest resting words beside Save (≈107 + 6 + ~70 → ~190px; set `.saveslot` and `.savestat`'s cap together), re-measure that the bar stays one row at 1060/1150/1200 (w3-F5's widths); keep the long sentence as the tooltip via a separate `long` field (today `title={core.saveStat.text}`); an error status must still override "● unsaved" in red. Phone: `.savestat{max-width:72px}` (line 604) — check "● unsaved" at 10px fits, else the dot alone there.

### F8 · MEDIUM · D372 needs an undo-entry shape the plan does not have
**Evidence.** `markSnap` holds `m` and `d` only (2673); `applyMarkHist` restores marks/dates (2687–2705); `liveEntry` drops entries whose `who` has no marks (2706); `removeStudentNow` filters by `who` (4187); `applyLullCopy` writes many students in one gesture (3705). D372's readings: each pace/end-date/lull change is a step; Copy to… is ONE step for many.
**Fix the plan.** `markSnap` gains `p` (pace[s]) and `l` (lulls[s]); `applyMarkHist` restores and saves them (`savePace`, `saveLulls`); a GROUP entry `{ whos, snaps, what }` for Copy to…, with `liveEntry` / `whatOf` / `reverseOf` / `removeStudentNow` taught the shape (a removed student drops out of the group; an empty group is skipped); `setEpw/setTarget/setTarget2` push with a field (2 s coalescing); `removeLull` pushes before the splice; `lullDayClick` pushes at the second click. The four exports the parallel chat binds are untouched, but `undoWhat`'s text gains a form ("the lull periods for 3 students") — tell them. Say on the look card that a pace step is dropped by a syllabus switch (R110) though pace is per course.

### F9 · MEDIUM · D371's ordering must live in one place — the failure record is read by six surfaces
**Evidence.** `failDates` (1914) feeds the ball's ticks (2015), the card's chips (SidePanel 403), the full list (`failList` 1926), the details bubble (`markHtml` 1945), the pop-up's list (Pop 30) and the export. `popFail` pushes/pops the END (3901–3906); `setFailDate` writes by index (3945).
**Fix the plan.** Sort on write (dated by day ascending, undated last in recorded order — D371's reading), so `failDates` stays a plain read and every surface agrees; `−` removes the latest-DAY failure; the undo snapshot already restores the whole record. Test: record today then 10 Sep → chips ST-02 (10/09), ST-02X (today); − removes today's; ↶ brings it back in place.

### F10 · MEDIUM · D370's roll-call is longer than "the card and its total"
**Evidence.** Readers of the count: the card (SidePanel 388–405), `failList` (1926, the full list), `markHtml` (1945, the details bubble), the pop-up's counter and day list (Pop 30, 63), the export (kept by the ruling), the ball (already hides).
**Fix the plan.** State the call for the pop-up and the bubble (my recommendation: they KEEP showing the failures — the pop-up is where "+ is refused" and where a re-grade brings them back), hide them in the card, total and full list; put it on the look card. Test the order N.A.-then-failures (refused) and failures-then-N.A. (hidden, then back on Marginal with their days).

### F11 · LOW-MEDIUM · E: four things the bake must get right that the plan does not say
1. The file's `eventInfoBySyl[id]` holds only what DIFFERS from the shipped wording (`collectCharts` 5241–5244; `diffDetails`/`mergeBlock` in eventDetails.js) → merge per event into `EVENT_INFO_BY_SYL[<shipped name>]` and never into the base `EVENT_INFO` (D126); an override that now equals the base may drop. (`EVENT_INFO_BY_SYL` has only "Tx 2026" today — a first edit on "2026" creates its key; `shippedDetails` 24–27 already resolves any name.)
2. `charts.deleted` (D127) and a built-in absent from `order` → left untouched and REPORTED ("absence is not deletion" — the old script's rule, keep it).
3. The student-name check must read `.name` of `{id,name,pid}` entries: the old script's `written.includes(n)` on an object is a silent pass. Test: a roster entry named like an event label → the bake REFUSES.
4. Layout specials (`__edgeMeta`, `__merges`, `__unmerges`, `__lines`, `__derived`, `__font` — data/layouts.js) ride whole; the position check walks events only. Also say in the script's report that `src/tracker/data/*.js` is what the smoke suite asserts (D62's lines), so a real bake may move those assertions.

### F12 · LOW · C13: the comment is wrong AND something leans on it
**Evidence.** `scheduler.css` 424–434: "descendant rects read 0×0 … which is what every Matrix measurement guard already checks for"; the baseline shows a dozing section reads height 0 but its insides keep full boxes (lo-I); `Matrix.tsx` 2285, 3133, 3135 guard on `width === 0`.
**Fix the plan.** Correct the comment to what is measured (the SECTION reads 0 tall; descendants keep their last boxes), and file a one-line item for the Leave War side to confirm those three guards run only while its page is `.on` (not this build; tell the parallel chat).

### F13 · LOW · C7: two clocks
`openLullPicker` with no index should take "this month" from `isoToday()` (Singapore — what the calendar's `today` mark uses, SidePanel 15), not `new Date()`; at a month's turn the two differ.

### F14 · LOW · A: a person with no pick lands on the course's shared "last person anyone graded" — a third option the item never named
The item offered "no student" vs "per person"; the plan keeps `kLastStudent` (shared) as the fallback "as today". Defensible; state it on the look card as his to correct.

### F15 · LOW · A: `resumeForPerson` and an unsaved chart edit
Production is guarded by D129, the headless path is not (F10 test 2 leaves `sylDirty` true across a session swap); `loadCourseNow` replaces SYL with no `leaveFlowEdits` door. Have `resumeForPerson` keep the chart when `sylDirty` (move the pick only) or assert `!sylDirty`; the F10 test asserts the edit survives.

### F16 · LOW · C10: size the Crew box to the callsign cap
`.controls select{max-width:88px}` at ≤1050 (tracker.css 574) caps all three boxes. Give `#activeSel` its own cap sized to 14 letters (D226 — add D226 to §1) and measure the bar stays two rows at 390 with a 14-letter callsign; the Course box can give width back (course names are six letters).

### F17 · LOW · C6: say which `[data-wi]` wins
`.mine` also carries `data-wi` (pointer-events none, so never a target — say so); a press on the picked student's OWN tick opens the pop-up as before; in Details mode and Edit chart layout the tick press is unchanged (other handlers).

## PART 2 — Scenarios (Job 1), with the orders that matter

**A — the per-person pick.**
- A1 Admin: add a course (it lands FIRST — lo-G M.1), pick course 2 / STUDENT B → Logout → member signs in → opens Tracker. Expect COURSES[0] and its own default student. Disproof: course 2 / B.
- A2 Order reversed: member picks course 1 / A → Logout → admin signs in → straight to the Tracker: course 2 / B; then RELOAD as admin: still course 2 / B (stored, not memory).
- A3 Admin signs in, never opens the Tracker, logs out; member signs in and opens it → member's own pick (the owner is the last OPENER, not the last login).
- A4 The quick tap during the reload (F4): throttle the network; member opens the Tracker right after the admin; tap a ball at once → no pop-up, nothing written to the admin's course.
- A5 Remove the picked student, log out, log in as someone whose pick was that student → fallback student, no blank Crew box, no console error.
- A6 Rename the PERSON on Quals between sessions → pick still theirs (id); rename the STUDENT in the Tracker → the pick still lands (enrolment id).
- A7 The admin's member-view tap (D292) on the Tracker → no reload, pick unchanged; the next pick write goes to the admin's key; back to admin view → same.
- A8 Headless / standalone: no session → `whoamiId()` `''` → the unprefixed keys (the smoke pin, F6).
- A9 Same person out and in → engine state kept, no flash, no reload (the "reopen where YOU left it" feature).
- A10 Their `lastCourse` names a course deleted since (D128) → falls back to the first; restore the course → the next sign-in lands on it again.
- A11 Member signs in; while the resume is loading they change the Course dropdown → the loads chain; the final state is their choice; the pick written is under THEIR key.
- A12 An Import (`reloadFromStore` keeps `active`) → the pick after it is written under the importer's key.
- A13 + Add a student (sets `active` without writing the pick — pre-existing) → reload → opens on the previous pick, not the added student. Say so or fix in passing.

**B1 — the question box.**
- B1-1 (F2) Import with two existing charts; a second question raised at chart 1's → with the queue: chart 1's question stays; answered → the second appears; nothing skipped.
- B1-2 Logout by pointer while a question is up → refused, the Tracker tab comes forward; answer it → Logout works.
- B1-3 Escape with a queued question → answers the first; the second appears.
- B1-4 `endSession` (headless) with two queued → both cancelled, none shown to the next session.
- B1-5 (F3) Tab from `#dlgOk` → first control; Shift+Tab from the first → `#dlgOk`; pointer to Raptor's Logout, Tab → never `#activeSel`/`#addStu`.
- B1-6 Pointer to Raptor's Quals tab while a Tracker question is up → the page switches, the question waits; return → still up and answerable; the job finishes.
- B1-7 Enter on "⇅ Reorder" behind a question (the walk's second sighting) → no reorder window under the question.

**B2.** Enter with `isComposing` on `#dlgInput` → no OK; on `#dlgFilter` with one match → no pick, with a search-as-new name → no add; on `#hSearch` → no step; without composing each does what it did; Ctrl+Enter in Show All unchanged.

**C1** Re-walk 500 → edit → Done → 500 at desktop, upright phone (214px strip), and 844×390 with the fold (the chart's middle point kept across the fold).
**C2 (D370)** Two failures then N.A. → card, total, full list drop them; Marginal → back with their days; N.A. then + → refused with the words on screen; the pop-up/bubble per the plan's stated call; export carries `f:2` either way.
**C3 (D371)** Record today, back-date one to 10 Sep → ST-02 (10/09), ST-02X (today); − takes today's; re-date the 10/09 one to 20 Sep → order holds; empty a day → sorts last; ↶ of − restores the right one; ticks unchanged.
**C4 (D372)** Pace change → ↶ names the pace, Ctrl+Z takes it back not the mark; End date A; lull added; lull removed (asks, then a step); Copy to… three students → ONE step, ↶ restores all three, ↷ reapplies; remove one of them → the group still undoes the rest; syllabus switch greys both (R110).
**C5 (F1)** Type "1", pause, "7" into Last Flown (Currency) → nothing stored until blur; blur → 17 saved, one step; year "0002" then blur → reverted; empty then blur → empty saved; Crew switch mid-draft → not carried, the old student keeps the saved day; reload mid-draft → the saved day; ↶ while a draft shows → the undone value, draft dropped; iOS wheel → Done → saved; pop-up Done-on typed slowly → the flight is never re-dated to the 1st; Failed on half-typed → + uses today; the same day retyped → no step.
**C6** A picked; press B's tick on BFM-3 → B picked, no pop-up, view unmoved; press A's own tick → A's pop-up; Details mode tick press → bubble; Edit layout tick press → drag.
**C7** Change a period in November, close, + Set lull period → this month; a chip tap → its own month; at 23:59 local vs Singapore (F13).
**C8 (D374)** Done on tomorrow → refused, put back, a line says why; Failed on tomorrow then + → refused; both Last Flown tomorrow → refused (R50 narrowed — mark its row); Upchit / end dates tomorrow → accepted.
**C9 (D375)** Import a students file with a new course → last in the dropdown and in ⇅ Reorder courses.
**C10** A 14-letter callsign at 390 → whole; bar two rows; 844×390; 1000; 1440 unchanged.
**C11** + Add open; add ZULU9 on Admin → Users by keyboard → the open list shows him; archive → drops; rename → relabels; Enter on a sole match after the change picks by id; D191's line updates.
**C13** The corrected comment; the three Matrix guards (F12) filed.
**C14** 1200/1440 with Save showing → "● unsaved" whole; after Save → "● saved"; a failed write while dirty → red words; phone 390 corner.
**C15** Re-walk both answers of Duplicate and the + Add syllabus question (passes today).
**D (D373)** 844×390 edit → folded row (tool · its hint · ⤢ Fit · Tools ▾); Tools ▾ opens over the chart; tap outside closes; pick a tool → closes, row shows it; + Flight from it → the name question, popover closed first; rotate upright mid-edit → the full strip; back → folded; Escape closes the popover before anything else; Done editing → the tabs return; the pinch works in the freed room; a desktop window under 500px tall folds too (say so).
**E** Bake a v3 file exported through `collectCharts` holding: a moved ball, a detail edited on Tx (a diff), a custom `sc…` chart, a deleted built-in, a roster entry named like an event label → positions updated; the detail merged under "Tx 2026" only; the custom reported, not baked; the deleted built-in untouched and reported; the name check REFUSES; a v2 file → "export a fresh file"; `__lines` carried whole; the smoke's data assertions re-checked.

## PART 3 — Explicit negatives (checked, sound)
- **`whoamiId` is the right identity.** Every account carries a real, unique person (`accounts.ts` 120–126 refuse otherwise); a guest, pending or switched-off person has no pages and no pid; the admin's member view keeps `me()` (role `'main'` → `'member'`, `perms.ts` 98–103); a rename moves nothing; an archived or deleted person cannot sign in.
- **The remount is the only production door to a loaded engine:** `App.tsx` 46 swaps the Shell for the sign-in, so the Tracker unmounts at logout and mounts on the next visit with `ready` true; `switchRoleView` is not a `resetSession` (store.ts 380). The localhost probe's `raptorMe` and headless `resetSession` are test-only doors.
- **The pick's writers and readers are exactly the six lines the plan lists** (1726, 1805, 2694, 4211, 4303, 5993) plus the three boot converters it rightly leaves (D120).
- **Every dialog caller's "cancel" is a no-op or a refusal** — the logout question's cancel is Stay — except the import's per-chart skip and its students question (F2).
- **B2's roll-call is complete:** only `#dlgInput`, `#dlgFilter` and `#hSearch` act on Enter.
- **C11 needs no new notify:** `onPeople(() => notify())` (core 996) already re-renders the box on a roster change.
- **C1 and C15 are fixed on today's build** (lo-A, lo-J).
- **The tier is FULL and §0's answers are honest** (saved data; "roles — no" is fair, A is about who, not what they may do).
- **§3's recommendations were consistent with the rulings** and he took all six; D374 narrows R50's "any date typed by hand" — the D201 duty is to mark R50's row and known-gaps' Last Flown sentence in the same change.
- **The parallel-chat boundary holds:** nothing here touches `canUndo/undoWhat/doUndo/doRedo`, `init()`, Shell.tsx or Header's ↶ ↷ lines; F8 changes the tooltip's wording only.
- **§5's exclusions are right** (old unprefixed keys, older file formats — D56/D120).

## What is bigger than it needs to be / simpler
- **B1:** with `inert` + the Tab wrap (F3), the belt shrinks to a 3-line queue (F2) — simpler than per-caller "cancel the first" semantics.
- **C5:** one commit-on-blur `DateBox` makes the six per-keystroke setters and most of the "no-change guard" unnecessary for the boxes (the box only calls the setter when the value differs); keep the guard in `setDoneDate`/`setFailDate` for the pop-up path.
- **A:** right-sized; the item's other option ("every sign-in starts fresh") is a few lines but takes the reopen feature from everyone — the plan's choice is defensible.
- **E:** right-sized; build the test fixture through `collectCharts` in the retest's `C.init()` harness.
- Nit: the plan cites baseline pictures as `lo-M-*`/`lo-N-*` while the step logs are `lo-G-session.json`/`lo-H-dialogs.json` — fine if the pictures carry those names; align the sheet.
