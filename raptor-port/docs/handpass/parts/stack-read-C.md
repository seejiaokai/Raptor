# Stack read — piece C: Insights' mission mix (Blue/Red), the Logic switch, twelve + Show all, the Board's way into Insights

Reader: Opus 5.5, 5 Oct 26, on `claude/codex-stack-review` (app code `bcc69fc8`), against `main` `de470db5`.
Read only — nothing built, run, served or tested. Brief: `docs/superpowers/briefs/2026-10-05-codex-stack-read-brief.md`.
Codex's build `4cfe81a1` is what was read for wrong and missing lines. Opus's three commits on top (`51f5ec51`,
`5b2299c5`, `9e8ed334`) are in the roll-call and door tables as surfaces; their code was not judged — two concrete
failures met on the way are reported (Leads 3 and 4) and marked as such.

Rulings read in full rows before use: D481, D512–D514, D516–D523, D525–D527, D529–D532, D535; one-liners D148, D478, D524,
D536–D538, D551, D553, D558. OIL (earned leave) is not touched by this piece: no reader or writer of it was changed.

**Counts:** MISSING cells **5** (four windows left out of D538's helper; one door blocked in a reachable state).
Leads **5**, ranked in §4.

---

## 1. Roll-call

### 1a. THE THING: a formation's Blue/Red answer (one stored record per week + date + the line's hidden row id + its normalised Mission-and-cue wording)

| Place | SHOWS it | USABLE there | Painted on the same pixels |
|---|---|---|---|
| Insights window — flying-load rows | YES — `engine/insights.ts computeInsights` (one answer per formation, read against the copy Insights counts: each published day's latest issued version, else the working copy) → `ui/Modals.tsx insightsHTML` (split bar + two small counts only when ALL of a person's roles are resolved) | NO, because D519/D527: the answer is given at the line, never in the window | Legend + "Total-only rows include unanswered mission roles." above the rows; the sticky title bar (D562) over the top row while scrolling |
| Insights — tiles, work hours, not flying, conflicts, by day | NO, because D512 ("categorizes sortie counts only, never hours") — code unchanged from `main` | NO, same | nothing new |
| Edit Schedule week, working copy | NO mark, because D519 (no indicator on the line). `ui/html.ts dayHTMLBody` adds only an invisible anchor on `.form` when tracking is On | YES — the temporary control, §1b | §1b |
| Scheduler Board, working copy (desktop and phone layout — one builder, `ui/board.ts boardHTMLBody`) | NO mark, D519; invisible anchor on `.sb-area` | YES — §1b | §1b |
| Board, a look at the latest published version | NO mark, D519 | YES — read-only Remarks door, `board.ts` `roleAccess` | the "Changed at ALn" outline on the same box (kept — F1) |
| Board / week, a look at an OLDER version or at a saved plan | NO | NO, because plan §7 ("older historical previews stay read-only"); `state/mission-roles.ts face()` returns nothing unless the look is the current published version | — |
| Edit Schedule week, a look at the latest published version | NO | NO, because the plan (§7 "Published-context door") and D532's pictures put that door on the Board; the week's look is plain text (`html.ts dayPreviewHTML` → `dayHTML(di,false,true)`), nothing focusable. *Named for the host: on the week the only way to answer the published wording is to open the Board.* | — |
| View-only Sched (admin, member, guest) | NO, D519. The invisible anchor attribute is emitted there too (harmless; it does put the hidden row id into the page for every viewer) | NO, because D527/D529 tie the control to editing Remarks; `sameQuestion` requires Edit Schedule | — |
| The published face against the working copy | Two answers can exist — one per wording (D530). Insights reads the PUBLISHED wording's | Working wording: Edit Schedule / Board. Published wording: the Board's look only | — |
| Next-week peek | NO (anchor attribute only) | NO — not editable | — |
| Print | NO, because D519 — nothing is drawn; no print code reads the answer | NO | — |
| CSV | NO, because D519 and plan §4 ("no role key enters … schedule CSV/print") — no reference in the export | NO | — |
| Changes window / History (both groupings) | YES — one line per answer or correction (`state/changelines.ts changeLinesFor`), **but filed under the heading "Leave War · <hidden row id>"** — `ui/changesmodel.ts itemOf` (Lead 1) | Tap goes nowhere: NO, because the line has no place on the schedule (the row is drawn "still") | the "new to you" dot |
| History's gold dots / the bubble on the line | NO, because the line carries no schedule address (and D519) | NO | — |
| "To go out" tab, "N pending", the four sign-offs | NO, because D530 — the answer's command enlists only its own store; no schedule record changes (four listeners on the command stream: history lines, row writer, undo, change batch — none marks a day) | — | — |
| Undo / Redo (top bar and the Board's bar) | YES — `undo/describe.ts describeEntry`: "the mission role for RU — Red"; history line "Undo — …" via `changelines.ts logReversed` (filed under "The day") | YES — own steps only (D148, `undo/timeline.ts mayReverse`) | — |
| Day templates (saved library) | NO — a saved template silently carries the answers of its lines (`engine/daytpl.ts tplFromDay` → `missionRoleSeeds`); nothing in the Templates menu or Manage window says so. NO because the plan (§5) adds no template control | Applied with the day (`ui/board.ts pickDayTpl` → `withFreshMissionRoles`) | — |
| Wave templates, duty templates | NO, because plan §5 (a wave template stores Mission and times only; the new line is simply unanswered) | NO | — |
| Saved plans (Plans window, plan selector) | NO — plans share the answer (same line, same wording) by design, plan §5 | — | — |
| Logic page | The switch only (§1c) | — | — |
| Day panel, warning list, ALL AVAIL window, airspace pop-up, bell | NO — none reads a formation's role (searched every reference to the feature's modules and hooks) | NO | — |
| Inputs page and calendar, Medical view | NO — they hold requests, not flying lines | NO | — |
| Leave War and its OIL tracker | NO — no flying line there; the role never reaches earned leave | NO | — |
| Tracker | NO — a separate app with no flying lines | NO | — |
| Phone drawer | NO — its week block went with D558 | NO | — |
| Storage | One row per answer under the settings collection, id `missionrole:<encoded id>` (`state/persist.ts wireRows` mapper; read back by `persist.ts hydrate` → `hydrateRoles`) | — | — |

### 1b. THE THING: the temporary control — "Choose / Change mission role" (while a Remarks box is being edited) and the Blue / Red / Later question (after his own edit)

One controller for both screens, `ui/mission-role-offer.ts` (`installMissionRoleOffers`, mounted once in `ui/App.tsx`); it is inserted in the page flow directly after the formation, so it PUSHES DOWN what follows — it covers nothing.

| Place | SHOWS | USABLE | Painted on / pushed |
|---|---|---|---|
| Edit Schedule week, desktop | YES — after `.form[data-role-formation]` (`html.ts dayHTMLBody`; `offer.ts show/anchor`) | YES — pointer keeps the caret in the box (`show()` prevents the press's default) | Pushes the next line / the wave's foot down; the last line gains a 1px rule (`.form:last-child`). Floating things that can lie over it: the changes window, the ALL AVAIL window, a toast, the week's ‹ › arrows. **Only the running app can show overlap.** |
| Edit Schedule week, phone | YES — same code | YES by reading. **Device-only:** with the keyboard up the button sits BELOW the box being typed in | the on-screen keyboard; the bottom aircrew tab |
| Board working copy, desktop layout | YES — after `.sb-area[data-role-formation]` (`board.ts boardHTMLBody`) | YES | pushes the next line down; the Board's sticky bars when scrolled |
| Board working copy, phone layout | YES — same builder; the question wraps, three full-width buttons (`scheduler/21-insights.css`) | YES | as above + keyboard |
| Board in OIL Earn mode | YES by reading — the Remarks box keeps its edit key in the mode | YES by reading; not walked by anyone | the OIL switches on the same line |
| Board, look at the latest published version | YES — read-only Remarks takes focus (`data-role-remarks`), label "Published · <version>" | YES; no text can be written (the box has no edit key; `offer.ts saveVisibleText` returns early for a published target) | the amendment outline on the box |
| Board / week, older version or saved-plan look | NO, plan §7 | NO | — |
| Edit Schedule week, look at the latest published version | NO — see 1a | NO | — |
| A standalone line (SC / AVALON / BB) | NO, because D516 — `mission-roles.ts formation()` skips standalone waves; `board.ts` `!sa` | NO | — |
| A cancelled line | NO — not counted, so not asked (`formation()` needs one aircraft not cancelled) | NO | — |
| Exact DS / RED / RED AIR mission | NO, because D518 — automatic red, no question, no override | NO | — |
| While the Mission box (not Remarks) has focus | Question after the edit: YES. Button while typing: NO, because D529 names the Remarks box (`offer.ts focusedTarget` returns nothing for a Mission box) | — | — |
| **Another line's Remarks while a question is open elsewhere** | **MISSING — `offer.ts` `focus` handler returns before looking at the newly focused box (Lead 3)** | **MISSING** | — |
| By keyboard (Tab) | NO, because D551/D553 — the Tab route (`ui/schedule-tab.ts`, a later piece) steps over every button between text boxes, these three included (it names `[data-role-ui]`). Mouse and touch only. *Codex's keyboard proof (S23) predates the Tab route.* | — | — |
| View-only Sched, peek, Inputs, every other page | NO — nothing editable there | NO | — |

### 1c. THE THING: the Logic switch "Track Blue/Red sorties"

| Place | SHOWS | USABLE | Painted |
|---|---|---|---|
| Logic page, admin in "✎ Edit rules" | YES — `ui/LogicPage.tsx` (`#lgMissionMix` checkbox) | YES — `engine/insights-config.ts setMissionTracking` → the settings command (`state/people-settings-commit.ts`, key `insights`); Undo lands on Logic (`state/undo-wire.ts landingOf`) | sits above the rules list, outside the search filter |
| Logic page, admin not editing / member | YES — a dimmed read-only switch with On/Off | NO, because D524's approved look (edit mode gates every Logic control) | — |
| Admin → anything else | NO, because D521 ("on the Logic page") | NO | — |
| "Reset to standard", "N off standard" | NO, because plan §8 — the switch is not a warning rule (`rulesReset` does not touch it) | — | — |

### 1d. THE THING: the Insights window — its doors, the first twelve, Show all

| Place | SHOWS | USABLE | Painted |
|---|---|---|---|
| Desktop top bar, every page | YES — `ui/Shell.tsx` `#insightBtn` | YES | — |
| Phone, Edit Schedule and View-only Sched | YES — ⋯ → Insights (`ui/ScheduleInsightsMenu.tsx`, D558 — a later piece) | YES | — |
| Phone, every other page (Inputs, Quals, Leave War, Tracker, Logic, Admin) | NO, because D558 (the top-bar button is hidden at phone width and the drawer's week block is gone) | NO | — |
| Board, desktop layout | YES — "Insights" beside the bell (`ui/SchedBoard.tsx` `#sbInsights`, inside the desktop-only wrapper) | YES | — |
| Board, phone (both of its layouts) | YES — ⋯ → Insights (`#sbMoreInsights`); the menu closes first | YES | the window opens over the Board (`#insightModal` above the Board's layer and above the changes / ALL AVAIL windows; below pop menus and a dragged puck) — **layering is a browser fact; walk it** |
| Guest view | NO, because D204 — the guest's tree has no Insights | NO | — |
| First twelve + "Show all N ↓" / "Show less ↑" | YES — `Modals.tsx insightsHTML`, state in `ui/pops.ts` (`INSIGHTS_ALL`; reset on close, on a fresh open, on a week change and at sign-out) | YES — one delegated click on the window body | the button replaces `main`'s grey "+ N more flying" text |
| Same figures at every door | YES — one computation, no page read (`computeInsights` → `validate.ts issuedWorld`) | — | — |

### 1e. OPUS'S SURFACES (roll-call only): every window that closes on a click on its surround (D538, `ui/outside.ts clickedOutside`)

| Window | Through the helper | Note |
|---|---|---|
| Duty templates (`DutyTplModal.tsx`) | YES | |
| Day templates (`DayTplModal.tsx`) | YES | |
| Wave templates (`WaveTplModal.tsx`) | YES | |
| Plans (`DraftsModal.tsx`) | YES | |
| Insights (`Modals.tsx InsightsModal`) | YES | |
| Day panel (`Modals.tsx DayPop`) | YES | |
| Airspace pop-up (`Modals.tsx AirPop`) | YES | |
| Document viewer (`DocViewer.tsx`) | YES | |
| Menu drawer (`Drawer.tsx`) | YES | |
| Input editor (`inputedit.tsx`) | YES | |
| Cancel-reason confirm (`SchedBoard.tsx` `cxPop`) | YES | |
| Sort-all confirm (`SchedBoard.tsx` `sortAllPop`) | YES | |
| Week calendar (`WeekCal.tsx`) | YES | |
| **Upchit confirm (`UpchitConfirm.tsx:40`)** | **MISSING** | own test: "the click landed on the surround" → Cancel (Lead 4) |
| **Covered-days confirm (`MedClashConfirm.tsx:81`)** | **MISSING** | same → Cancel |
| **OIL ask (`OilConfirm.tsx:112`)** | **MISSING** | same → Cancel |
| **No-document ask (`DocConfirm.tsx:31`)** | **MISSING** | same → back to the editor |
| Inputs calendar's two pop-ups (`InputsCal.tsx:610, 851`) | NO, because they close on the PRESS itself, never on a click — the fault cannot occur | |
| Leave War sheets and its two lists (`leavewar/ui/Sheet.tsx`, `Chrome.tsx`) | NO helper — they close on a separate backdrop element; not read further (another app, outside this piece) | name for the walk |
| Tracker dialogs | not read (third app) | |

### 1f. OPUS'S SURFACES (roll-call only): every `.modal` window on a phone (D536/D537 — never taller than the visible screen, a thin strip above a tall one)

| Window | Gets the rule (`scheduler/08-windows-tools.css` `.modal-box`, survived the stylesheet split) |
|---|---|
| Insights | YES (the only one a browser test measures — `e2e/insights.spec.ts`) |
| Day templates | YES — same class, not measured by any test |
| Duty templates | YES — same class, not measured |
| Wave templates | YES — same class, not measured |
| Plans | YES — same class, not measured |
| Other pop-ups (airspace, input editor, confirms, document viewer, changes / ALL AVAIL windows, calendar, bell panel) | NO, because they are not `.modal` and are filed as `[VH-SHEETS-IPHONE]` |

---

## 2. Doors

Roles: **A** admin · **AM** the admin's member view · **M** member · **G** guest · **N** signed in, no access. "—" = no door and the write path refuses (`state/perms.ts`: command gate `COMMAND_OPS['insights.role.set'|'insights.role.copy']` → the `MissionRoleAnswer` row; changed-record guard `ownershipViolation` names `insights.role`; page gate `canEditSched()` in the controller and the Board builder). `docs/data-model.md` §11 carries the same row (admin C R U D, member R, guest R).

| Action | Day not published | Published, nothing waiting | Published, changes waiting | Look at an older version | A | AM | M | G | N | Desktop / phone |
|---|---|---|---|---|---|---|---|---|---|---|
| First answer after his own edit (the question) | Edit Schedule week; Board | same — label "Working copy"; counts at once (same wording as published) | same — answers the WAITING wording; does not count until it goes out | none (plan §7) | yes | — | — | — | — | both |
| First answer later ("Choose mission role" while editing Remarks) | week; Board | week; Board; and the Board's look at the published version ("Published · X") | working wording: week / Board. PUBLISHED wording: only the Board's look | none | yes | — | — | — | — | both; phone keyboard may cover it (device) |
| Correct an answer ("Change mission role") | as above | as above | as above | none | yes | — | — | — | — | both |
| Later | on the question | same | same | — | yes | — | — | — | — | both |
| **Put a line back to "not chosen"** | **no door** — only Undo, and only until sign-out. The table gives the admin Delete; the app offers Change only (D527). Lead 5 | same | same | — | — | — | — | — | — | — |
| Undo / Redo an answer | top bar, Board bar | same; no "unpublish first" refusal (the answer is not part of the day) | same | — | own steps only (D148) | refused: "Switch back to the admin view…" | — | — | — | both |
| Tracking On / Off | Logic → ✎ Edit rules → switch (not day-bound) | | | | yes | read-only | read-only | no Logic | — | both |
| Open Insights | every door in 1d (not day-bound) | | | | yes | yes | yes | no door (D204) | — | 1d |
| Show all / Show less | in the window | | | | yes | yes | yes | — | — | both |
| Apply a day template that carries answers | Templates menu (week day head; Board) | refused, D96 | refused, D96 | no Templates button under a look (week: a look is drawn read-only; Board: button withheld) | yes | — | — | — | — | both |
| Answer a second line while a question is open | auto-question: replaces the first. **Button for the second line: MISSING (Lead 3)** | same | same | — | yes | — | — | — | — | both; worst on the phone's week |

No control was found that is drawn where the write path refuses. A member's own edits (his inputs, his Quals row, a bid, the Tracker) cannot raise the question: the controller acts only on a flying line's Remarks or Mission box and only when `canEditSched()` holds.

---

## 3. Orders

"Rule" = what the rulings require. "By reading" = what the code will do. **WALK** = only the running app proves it.

| # | Order | Rule | By reading |
|---|---|---|---|
| 1 | Type a cue in Remarks → answer | text saved first, one question, answer its own step (D526, D529) | as ruled; two undo steps |
| 2 | Answer → retype the cue to a different one | old answer stops applying; asked once for the new wording (D525, D529) | as ruled. The old answer stays stored and comes back, unasked, if the old wording is typed again (plan §3 I1; `ui-contracts.md` "Unmatched old contexts remain saved") |
| 3 | Answer → change crew, times, area, stores, flag, order, CX and un-CX | answer kept, not asked (D525) | as ruled — the id uses no position, crew or time |
| 4 | Answer Remarks cue under BFM → Mission to ACM | asks once (D529) | as ruled |
| 5 | Mission `DS-2` typed, Remarks blank | asks (D531) | as ruled; `DS`, `RED`, `RED AIR`, `REDAIR`, `RED-AIR` automatic red |
| 6 | Tracking Off → type cues → On | no burst; button on each Remarks (D523) | as ruled; total-only rows until chosen |
| 7 | Answer → tracking Off → On | answer kept and reused (plan §8) | as ruled |
| 8 | Question open → unrelated edit on the day | stays (D535) | stays (Opus's fix; not judged) |
| 9 | Question open for line A → his own edit on line B that needs an answer | one question at a time (D523); D535 lists no such exit | B's question REPLACES A's; A falls back to its button. A reading for the host — D535 and D523 pull apart here |
| 10 | Question open for A → select B's Remarks | D529/D527: B's button shows while its Remarks is edited | **nothing shows for B** — Lead 3 |
| 11 | Question open → swipe the phone's week to another day | D535: "moves to another day" ends it | on the Board yes (the day is part of the view); **on the week no** — it stays, out of sight, and blocks every other line's button (Lead 3). WALK |
| 12 | Before publishing: answer → publish | snapshot keeps the line's row id; same wording → the answer applies to the published face | as ruled |
| 13 | After publishing, nothing waiting: answer on the working copy | counts at once; no pending, sign-offs hold (D530) | as ruled — nothing of the day is written. WALK: "0 pending" and four names still standing |
| 14 | After publishing: change the wording, answer the working wording | wording waits for its amendment; the working answer does not count yet; published wording keeps its own answer (D530, D478) | as ruled; label "Working copy" is the only sign it will not count yet |
| 15 | Same, then answer the published wording from the Board's look | counts at once, no pending | as ruled |
| 16 | Publish the amendment | Insights switches to the working wording's answer | as ruled — nothing is copied |
| 17 | Unpublish the amendment / the original | Insights reads the version now current (or the working copy) and that wording's answer | as ruled; a question opened on the withdrawn version is refused (its issue key carries the withdrawal count) |
| 18 | Answer → Undo → Redo | own step; no programme change; lands on the day | as ruled |
| 19 | Answer on week W → go to another week → Undo | loads W, lands on the day, restores only the answer | as ruled by reading (`undo-wire.ts`); WALK with the real button |
| 20 | Answer → reload, on a day someone has saved | answer back, Insights the same | as ruled (row read back at boot) |
| 21 | **Answer → reload / leave the week and return / sign out and in, on a demo line whose day nobody has saved** | answer back | **the answer no longer applies; the bar is total-only again** — Lead 2 |
| 22 | Answer → sign out → sign in (saved day) | answer kept; the undo list is empty (D148) | as ruled |
| 23 | Second week | each week's answers apart (the week is in the id) | as ruled; all weeks' answers are loaded into memory at boot |
| 24 | Storage reset (a format bump) | answers cleared with the weeks; the switch and the templates kept | as ruled (`storage/reset.ts resetEntry`, `storage/boot.ts`); a kept template still carries its answers |
| 25 | Save a day as a template → apply to another unpublished day → Undo → Redo | answers travel to the new lines; one Undo takes both back | as ruled by reading; fresh row ids are random, so the "collision" refusal cannot be met in real use |
| 26 | Apply a template to a published day | refused (D96) | refused before anything is touched |
| 27 | Plan A answered → duplicate to plan B → correct the answer in B → back to A | one shared answer per line + wording | as ruled (plans keep the line's row id) |
| 28 | "Load onto working copy" of an older version | that version's wording picks up whatever answer it has; nothing asked | as ruled |
| 29 | Answer → delete the line → Undo the delete | answer applies again | as ruled; without the Undo the answer stays stored for ever (see negatives) |
| 30 | Move the line within the day / reorder its wave / Sort all | answer kept | as ruled — keyed by the row id, never a position |
| 31 | Drag an aircraft (with its cue Remarks) into another formation | both lines' wording changes; D529: several lines changed → none asks; buttons remain | as ruled by reading; nobody has walked it |
| 32 | Another admin answers the same question first (the database era) | refused, naming who (D148-style) | `setMissionRole` names the writer; reachable today only in tests |

**Routes Codex's sheet marks as qualified (or that rest on commands, mounted tests or emulation) — a walk must now do these for real:**
S13/S14/S15 (published A / waiting B through both real doors, then the amendment and an Unpublish, reading "N pending" and the four sign-offs each time) · S16/S19/S28 (Undo/Redo with the real buttons, from another week too) · S17 (**open the changes window and read the line's heading** — Lead 1 was passed by every run) · S18 (plans, older-version load) · S19/S20 (templates through the real picker, then a reload) · S21 (**a real reload and a sign-out/in, on a saved day AND on an untouched demo line** — Lead 2) · S22/S23/S24 (caret and buttons on the WEEK in a real browser at phone, short and desktop sizes — Opus's interim read never drove the week; keyboard reach after the Tab route) · S26 (a member and the admin's member view on screen: no button, no question) · S29 (member's Insights; guest has none) · S30 (every door, incl. the phone's two schedule ⋯ menus, over an older-version look) · S31 (the long everything-day) · the Board in OIL Earn mode (no run by anyone) · orders 9–11 above.
Also unproven by any run: the five `.modal` windows on a real iPhone other than Insights; a drag-out on eleven of the thirteen helper windows and on the four in Lead 4.

---

## 4. Leads, most serious first

### Lead 1 — Every Blue/Red answer is listed in the changes window under "Leave War · <a row's hidden code>" (new in this stack; real use, every time)

- **Steps.** Tracking On. Edit Schedule, any day: type `DS FOR VL` in a line's Remarks, press Red. Open the changes window (the clock, or the day's count). Either grouping.
- **Rule.** D530 ("shows in the change history with who made it"); D340/D345 (every line led by its ITEM, named as the schedule names it); D346 (what belongs to no item sits under "The day"); plain words — never an internal code (the same class as the interim read's F3).
- **What the code does.** The line is logged with the formation's row id in the field the window reads as "the man this line is about" (`state/changelines.ts changeLinesFor`: `logAction(null, …, {date, sect:'day', sub: role.formationRid, fld:'mission-role', …})`). `ui/changesmodel.ts itemOf` then takes its no-key branch: `if (r.sub) return r.sect === 'quals' ? Quals… : { title: \`Leave War · ${csOf(r.sub)}\` }` — and `csOf` of a row id is the id itself. The bold heading reads **"Tue · Leave War · rmusab94vy0dhij"**, with "RU · mission role · Working copy  Unresolved → Red" under it. Group by Item and Group by Who both draw that heading (`whoEntry`). `ui/histbubble.ts:231` reads the same field the same way.
- **Why it was missed.** Tests assert the line's words, actor, date and sides (`mission-roles.test.ts` "D525/D530 answer/correction history…"), never its heading; the interim read's F3 fixed the name INSIDE the line.
- **`main`.** `changesmodel.ts` is byte-identical on `main`; `main` writes no such line. Introduced by `4cfe81a1`.
- **Fix.**
  1. `src/ui/changesmodel.ts itemOf`, immediately before `if (r.sub) return r.sect === 'quals' …`: `if (r.fld === 'mission-role') return { id: \`${date}|MR|${r.sub}\`, title: \`Flying · ${(r.lbl || '').split(' · ')[0] || 'line'}\`, detail: 'Mission role' }` (better still, if cheap: resolve the live formation by row id and reuse the flying item's own title and id, so the answer groups with that line's other changes).
  2. Same file, `ownWords`: for `r.fld === 'mission-role'` return only what follows "… · mission role · " ("Working copy", "Published · AL1", "copied with the day template").
  3. `src/ui/histbubble.ts:231`: the same guard, so no "Leave War · <id>" lead is tried.
  4. Red-first row in `changesmodel.test.ts`'s item table: `{ key:'', sect:'day', sub:'rabc', fld:'mission-role', lbl:'RU · mission role · Working copy', from:'Unresolved', to:'Red' }` → heading `Flying · RU`, detail `Mission role` (today: `Leave War · rabc`).
  5. A walk step: open the window after an answer, a correction, a template copy and an Undo, at both sizes.

### Lead 2 — In the demo world, an answer given on a line whose day nobody has saved stops applying after a reload, a sign-in, or leaving the week and coming back (saved data; demo weeks only)

- **Steps.** A store where the first demo week was never edited (a new preview link starts as one). Logic → ✎ Edit rules → Track Blue/Red sorties On. Edit Schedule, Tuesday 14 Jul (untouched), second wave: tap RU's Remarks — it already reads `RED AIR` — Choose mission role → Red. Insights: that line's four crew show a split. Now reload (or go one week forward and back, or sign out and in). Insights: the four are total-only again, and the button reads "Choose", not "Change". The same on Wednesday's RU (`RED AIR`) and Thursday's RU (`DS FOR VL`).
- **Rule.** D530 ("the answer is saved"); the brief's "something stored that does not come back after a reload".
- **What the code does.** The answer IS stored, under the line's hidden row id. But a day nobody has saved has no stored row (`state/persist.ts scheduleRows` writes only the days a command changed; `state/weekrows.ts rowsToParts` reads a missing day from the built-in week), the built-in week is handed out as a fresh copy every time (`engine/weeks-data.ts weekBundle`: `JSON.parse(WEEK1_DAYS_SNAP)`; the boot uses the module's own literal), and its row ids are minted RANDOM at every load (`engine/rowids.ts ensureRowIds` ← `state/store.ts initStore` / `loadWeek`). The answer's command changes no day (D530), so the day stays unsaved and its line gets a new id next time; the stored answer matches nothing. An Undo of it afterwards silently removes the orphan.
- **Reach.** Only the two built-in demo weeks (13 and 20 Jul 2026) on a day with no edit, sign-off or publish yet. A shared store has no built-in weeks (`weeks-data.ts` `AUTHORED` off) and a blank day has no lines, so a real line always exists because a command saved its day — its id is stable. It is NOT stored-data-only: every NEW answer on an untouched demo line is lost the same way, and the demo carries three such lines on first boot — so his look and every walker's reload step will meet it.
- **`main`.** The same re-minting exists on `main`, harmlessly — nothing durable was keyed by an unsaved day's row id before this build. Old code this feature made reachable.
- **Fix (recommended — makes the demo lines' ids repeatable; no day write, D530 untouched).**
  1. `src/engine/weeks-data.ts`: add `seedRids(days, wk)` — for each day index, walk `rowsOf(day)` (from `./rowids`) and the day's note objects in order and give each row that has no `rid` the id `'rs' + <the week key's digits> + <day index> + 'x' + <running number, base 36>`; return `days`.
  2. `weekBundle`: wrap both authored returns — `days: seedRids(JSON.parse(WEEK1_DAYS_SNAP), v)` and the 20 Jul one. Leave `emptyWeek` alone.
  3. `src/state/store.ts initStore`: when the booted week has no saved copy (`!stashHas(CURWEEK)`), call `seedRids(DAYS, CURWEEK)` before `ensureRowIds(DAYS)` — the boot reads the module literal, not `weekBundle`.
  4. Red-first tests: (a) answer Tuesday's RU through `setMissionRole`, `loadWeek('20/07/2026')`, `loadWeek('13/07/2026')`, expect `computeInsights()` to show that line's crew resolved; (b) the same through the real save-and-boot pipeline of `mission-role-persist.test.ts` with NO edit to the day. Check `rowids.test.ts` and the week-baseline tests for a pin on "a seed row has no id".
  - **Or his ruling "leave it"** (demo data, gone at the database step — the spirit of D54/D56): then walkers must make one edit on a demo day before answering there, and his look card must say so.

### Lead 3 — While one line's Blue/Red question is open, "Choose / Change mission role" never appears for any other line (Codex's line, made reachable by D535's fix)

- **Steps.** Tracking On. Edit Schedule (week or Board). Type `DS FOR VL` in line A's Remarks and leave: A's question appears. Do not answer. Select line B's Remarks (any line whose wording asks, answered or not — in the demo, Tuesday's RU). Nothing appears under B. On the phone's week it is worse: swipe to another day and select a Remarks box there — A's question is still open on the day left behind, unseen, and no button ever shows until he goes back and presses Later.
- **Rule.** D529 / D527: the temporary button shows while a line's Remarks is being edited. D535: the question ends when he "moves to another day" (true on the Board; the week has no such notion). D523: never two questions at once — a button is not a question.
- **What the code does.** `src/ui/mission-role-offer.ts`, the `focus` handler: `if(current?.question) {reconcileMissionRoleOffer();return}` — with a question open it never evaluates the newly focused box. In `4cfe81a1` any command on the day cleared the question, so this was brief; since `51f5ec51` the question persists (D535) and the early return blocks every other line for as long as it does. (Also: when the reconcile on that focus does clear a stale question, the same `return` skips the button for the box just focused.)
- **`main`.** No such feature. Codex's line; reachable since Opus's F2 fix — which I did not judge.
- **Fix (no new ruling needed — keep the question, add the button).**
  1. In `mission-role-offer.ts` hold two records instead of one: the open question (as `current` today) and a separate `action` for the Choose/Change button; give each its own node and its own clear.
  2. `show(t,false,…)` reads and writes only `action`; `show(t,true,…)` only the question. The `blur` and `edit` timers that clear a button clear `action` only.
  3. `focus`: reconcile the question, then ALWAYS resolve the focused box; show its button unless it belongs to the same formation as the open question.
  4. Pressing B's button opens B's question in the question slot (replacing A's — the newest-wins behaviour the automatic question already has, D523).
  5. `reconcileMissionRoleOffer` re-inserts whichever node a repaint dropped.
  6. Red-first mounted test (real week handlers): cue on A → question; focus B's Remarks → expect A's question AND a Choose/Change under B; press it → one question, B's.
  - Cheaper alternative, **needs his word** (D535 does not list it): selecting another line's Remarks ends A's question as Later does. One changed block in `focus`.
  - Separately, for the host: whether a swipe to another day on the phone's week should end the question (D535's "another day").

### Lead 4 — Four confirmation windows still close when a drag that began inside them ends on the dark surround (Opus's D538 fix left them out; pre-existing on `main`)

- **Steps.** Inputs → file a duty on a weekend so the "OIL — <name>, <type>" ask opens (or save an upchit / a medical that overlaps another status / a medical with no document). Press on the text inside the box, drag past its edge, let go on the dark surround. The window closes: the OIL ask, the upchit confirm and the covered-days confirm CANCEL the save; the no-document ask goes back to the editor.
- **Rule.** D538 — "a window closes on its surround only when the press began on the surround", and the evidence sheet's "every window that closes on a click on its surround, all thirteen".
- **What the code does.** `ui/OilConfirm.tsx:112`, `ui/UpchitConfirm.tsx:40`, `ui/MedClashConfirm.tsx:81`, `ui/DocConfirm.tsx:31` each keep their own test — `(e.target as HTMLElement).classList.contains('upconf-pop' | 'docconf-pop')` — and never ask `clickedOutside`. The guard test (`ui/outside.test.tsx`, "no window keeps its own surround test") scans only for the `.id === '` spelling, so it passes.
- **`main`.** Identical there. Not a regression; a gap in the fix's roll-call. Low: nothing is saved wrongly — a sheet closes.
- **Fix.**
  1. `src/ui/outside.ts`: add `clickedSurround(e, cls)` — true when the click's target carries class `cls` and the remembered press is absent or that same element (the body of `clickedOutside`, matching by class).
  2. Use it in the four windows in place of the bare `classList.contains(…)`.
  3. Widen the scan in `outside.test.tsx` to also fail on `classList.contains('…-pop')` inside an `onClick` on a surround; add a drag test on the OIL ask (red first).

### Lead 5 — A line can never be put back to "not chosen" once the sign-in ends (a door the permissions table allows and the app does not draw; lowest — a product question)

- **Steps.** Answer Red on a line by mistake, where the truth is not yet known. Sign out, sign in (or reload — the undo list is per sign-in). Select its Remarks → "Change mission role" → only Blue / Red / Later. The person's bar now shows a full split that rests on a guess.
- **Rule.** D523 ("do not guess colours"; unanswered roles keep the ordinary total bar); D527 offers a correction only. `perms.ts` and `data-model.md` §11 give the admin Delete on the record; the only deleters are Undo and the storage reset.
- **`main`.** No such feature.
- **Fix, only if he wants the door:** a fourth choice "Not chosen" in the question when an answer exists → a new command `insights.role.clear` (gate: `MissionRoleAnswer` D) that removes that one record through `roleStore.write`; one history line "Red → Unresolved"; Undo restores it. Otherwise record his "leave it" and leave the table as it is.

---

## 5. Explicit negatives — checked, nothing found

- **Every write is inside a command.** `roleStore.write` throws outside a running command; `setMissionRole` and the template copy are the only callers besides Undo's restore; the settings writer refuses a raw `missionrole:` write (`people-settings-commit.ts`); the row is written by the stream consumer inside the command's one saved group (`rowmap.ts`, `persist.ts wireRows`).
- **The settings store does not also claim these rows** (`settingsRecordKeys` lists fixed keys and four prefixes; `missionrole:` is not one) — no double ownership, no guard trip.
- **No day, book, sign-off, issued version, holder base, input or Leave War record is written by an answer.** The command enlists one store; the four stream listeners write a history line, the row, the undo step and the change batch. The answer's commit cannot raise "N pending" or drop a sign-off.
- **Dirty text is saved through the box's own writer before any answer** (`offer.ts saveVisibleText` normalises exactly as `engine/slots.ts txtSet` does — spaces collapsed, trimmed, "—" as empty; a failed save answers nothing). The demo weeks hold no un-normalised wording that a press could "save" unasked.
- **Insights reads the answer against the copy it counts** (D478/D530): the published wording for a published day, the working wording otherwise; never the working wording of a published day. A look at an older version changes nothing in the window.
- **Roles.** Gate, changed-record guard and page gate all ask `perms.ts`; `data-model.md` §11 has the matching row; a member's command that tries to carry an answer is refused by the changed-record guard (test names it). The admin's member view cannot answer and is told to switch back on Undo.
- **Keying.** The id holds the week, the date, the line's hidden row id and the normalised wording — no position, callsign, crew or time. Positions appear only inside a saved day template and are re-checked against the wording when applied. A move, a wave reorder, Sort all, a plan switch and an older-version load keep the row id.
- **A copy of a wave or a line:** the app has no such control (searched for every duplicate/copy route; plans keep ids, the day template is the one fresh-id copy and it carries its answers).
- **Orphaned answers do pile up for new data — by the plan's choice (§4: "does not garbage-collect"; `ui-contracts.md` says so).** Every reworded cue, deleted line and template-replaced day leaves its answer stored for ever; nothing but Undo and the storage reset removes one. I found no wrong figure from it (an orphan is read only if the same line returns to the same wording — the documented reuse). Cost, named not filed: all weeks' answers load at boot, and the command layer serialises the whole set several times on EVERY command of the app (the guarded store's snapshot and signature, `command/commit.ts guardSnapshot` / `guardCheck`). A table for the database step to bound.
- **Tracking Off leaves Insights as on `main`** in every figure and in layout (the count column keeps its 42px). Two differences, both intended or sub-visible: "Show all N ↓" replaces "+ N more flying" (D513, whatever the switch says), and the flying-load bar widths are no longer rounded to a whole percent (at most half a percent of the track). No question, button or legend appears; the schedule pages' markup is byte-for-byte without the anchor attribute.
- **Twelve and Show all:** order unchanged (total, then callsign); the scale is the top flyer's; expansion resets on close, reopen, week change and sign-out; a missing person label falls back safely.
- **D516:** standalone waves are skipped before any count or role is read; the work-hours list is untouched code.
- **The Logic switch** is a settings record with its own Undo and Logic landing; absent or malformed means Off (D522); "Reset to standard" does not touch it.
- **Templates.** Row ids are random, so a fresh line cannot collide with an old one; a refused copy rolls the whole apply back; one Undo takes back the day and its answers. `mintBlob` keeps wave and line positions, so a captured position still names its line.
- **Storage reset** clears the answers with the weeks, including the unfinished-journal filter, and verifies they are gone.
- **The interim read's two low edges, settled by reading:**
  1. *"Does the 'changes to go out' strip wait after Choose saves dirty text?"* — Yes, by design, and only the picture waits: the text's own command has already written the pending mark and dropped the sign-offs; the week (and, since the Tab-route commit, the Board) repaints when focus leaves the last text box (`EditWeek.tsx` / `SchedBoard.tsx` `resume`). Not a defect; worth one walk step (press Choose with unsaved text on a signed, published day, then click away — the strip must change then).
  2. *"Can the week's Templates button be pressed under a look, where a template with answers would be refused whole and silently?"* — No. A look on the week is drawn read-only (`dayPreviewHTML` → `dayHTML(di,false,true)`) and the Templates button is drawn only in edit rendering; the Board withholds its button under a look; opening a look closes an open menu. `pickDayTpl` itself has no guard for it, but no door reaches it.
- **The History gold dot on the read-only published Remarks** (the interim read's "likely also affected"): a look wears no dots by design, so nothing is lost there.
- **Cue matching** read line by line: digits and punctuation may touch a cue (`DS2`, `ACM/DS`), letters may not (`PODS`, `CREDIBLE`, `REDS`); the saved wording format validates on read and is idempotent under its own normaliser.

---

## 6. What I did NOT read, and why

- **The other readers' reports** (`stack-read-AB.md`, `-D1.md`, `-D2.md` are in the folder) — not opened, on purpose.
- **Test bodies.** Read the names only (to see what is pinned); one browser spec's selectors. Tests were not run.
- **Opus's three commits as code** — surfaces listed, logic not judged (the brief); Leads 3 and 4 are concrete failures met while building the tables.
- **The rest of the stack's pieces** beyond where they touch this one: the Tab route (`schedule-tab.ts` — read for its treatment of the role buttons only), the phone ⋯ menus, the stylesheet split (only the Insights and window rules), the save-failed band, Rally, Discard marks.
- **The Leave War's and the Tracker's own windows** (1e) — other apps.
- **Codex's plan reviews, coordination record and R1/R2 reports**; the first (frozen) plan; `HANDOFF.md`; `OUTSTANDING.md` beyond a subject search.
- **`engine/validate.ts` beyond `issuedWorld`**, the publish engine, `holderbase.ts`, `sched-commit.ts` — relied on their headers and on the callers shown above.
- **Nothing was run.** Every "by reading" above is a reading; layering, focus on a real phone, the keyboard over the button, repaint timing, and the exact words on screen are for the walk.
