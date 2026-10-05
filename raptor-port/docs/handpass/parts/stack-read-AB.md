# Stack read — piece AB (Discard marks removed · In-time / Rally and the negative work-hours fix) — 5 Oct 26

Reader: Opus 5.5, one of four, under `docs/superpowers/briefs/2026-10-05-codex-stack-read-brief.md` (D589). READ ONLY — nothing
was built, run, served or edited; this file is the one thing created. Code read as it stands at the top of the stack
(`bcc69fc8`), compared with `main` (`de470db5`). Commits: A `91b9dff1`, `be1c0bd5`; B `786d2b2c`, `94aa8913`.

**In one paragraph.** A (Discard marks) is a clean removal: the net change to the publish engine and its command wrapper
against `main` is the removal and nothing else, so first publish, AL, Unpublish and "Load onto working copy" are
byte-for-byte what `main` does. B is mostly sound — every screen and check that reads when a crew reports goes through
the one shared routine, and earned leave deliberately does not read the reporting lines — but it leaves five leads: one
about earned leave on published days moving when a Logic setting is changed (old behaviour, made easier to trigger by
D510), one new visible fault (the "RULES MODIFIED" stamp lights for a wording preference), two small reading faults in
the new line reader, and four places whose words still say "in-times".

---

## 1. Roll-call

### A — the THING: the change marks a not-yet-published day carries, and the removed door that cleared them

| Place | Shows the marks / the door | Door usable | Painted on the same pixels |
|---|---|---|---|
| Amendments box, desktop Edit Schedule (`ui/ALPanel.tsx ALPanel`) | **YES** — no button; the sentence "Changes are on unpublished days — publish the day first" still shows while a draft day holds marks (`pendDays().some(di => !dayApproved(di))`) | **NO, because D488** — nothing replaces it; "Publish AL n" per published day is untouched | the row now holds the one sentence only; the per-day Publish buttons and the issued-AL tags sit below as before |
| Amendments box on a phone | **NO, because** the box is hidden under 820px (existing) and D488 rules "no substitute on the phone" (`docs/ui-contracts.md` l.685) | NO, same | — |
| Edit Schedule week, a draft day | **NO, because** a draft day draws no marks (owner, 25 Aug 26 — `alAttr` only when `dayApproved`); its day head shows no count (`html.ts` l.1401, l.2192 gate on `ok`) | NO, D488 | — |
| Scheduler Board (both layouts) | **NO, because** it never had the door; draft marks are not drawn there either | NO | — |
| View-only Sched / a look at an older version / next-week peek | **NO, because** read-only surfaces never carried it | NO | — |
| Changes window and History (`engine/editlog.ts`, `ui/changesmodel.ts`) | **YES (absence)** — no writer of "Draft marks cleared (N)" is left (`commitDiscardPending` gone); no filter or group is keyed on that label | n/a — a line, not a door | — |
| Undo / Redo wording (`undo/describe.ts TYPE_PHRASE`) | **YES (absence)** — `sched.discard` phrase gone; an unknown type falls to the generic label, and the undo list is session-only, so none can be met | n/a | — |
| Permissions (`state/perms.ts COMMAND_OPS`) | **YES (absence)** — row gone; `docs/data-model.md` §11 never listed it | n/a | — |
| Command types (`state/sched-commit.ts SCHED_TYPES`), store re-exports (`state/store.ts`) | **YES (absence)** — no caller of `discardPending` / `commitDiscardPending` / `discardableCount` anywhere in `src`, `e2e`, `probes` | n/a | — |
| Print, CSV, Insights, Logic, Inputs, Medical, Leave War, OIL tracker, Tracker, phone drawer, pop-ups | **NO, because** none of them reads the pending marks of a draft day | NO | — |
| Help page, the IT guide, hints, toasts | **YES (absence)** — no sentence in `src` or the live docs names "Discard marks" except D488's own notes (`engine-rules.md` l.3502, `ui-contracts.md` l.685) and one past-tense code comment (`engine/slots.ts` l.440) | n/a | — |
| Test helpers / walk scripts | **YES (absence)** in `e2e/`; six old `scripts/handpass` walkers carry a "retired" head comment (`be1c0bd5`) | n/a | — |

MISSING cells in A: **0**.

### B — the THINGS: (1) a wave's In-time / Rally lines and the report time worked out from them, (2) the two new warnings, (3) the "(previous day)" wording, (4) the two Logic settings

| Place | Shows it | Control usable there | Painted on the same pixels |
|---|---|---|---|
| Edit Schedule week, desktop and phone (`ui/html.ts dayHTMLBody`, `intimesInner`) | **YES** — the lines block; the wave tab adds " · In-time / Rally 22:00 (prev day)" only when the wave's earliest report falls on the previous day; a live explanation line under the lines | **YES** — "+ In-time / Rally" (`data-itadd` → `ui/interactions.ts routeClick`), typing and blur (`ui/textedit.ts routeFocusOut`), ✕ (`data-itdel`), the explanation while typing (`routeReportingInput`, registered on `document` in `ui/Shell.tsx`) | the wave tab row: label, NIGHT, the standalone tag, Traffic, the button; on a published day the amendment mark on the block (`alAttr it:`). The explanation line is new inside the block — its fit at phone width is for the walk |
| View-only Sched | **YES** — lines and the tab's previous-day note, read only | **NO, because** read only; the explanation line is drawn only while editing (D509) — the warning list carries the fault | amendment marks |
| Scheduler Board, desktop layout (`ui/board.ts boardHTMLBody`) | **YES** — header "In-time / Rally HH:MM (prev day) · N ac", the lines block, the explanation line | **YES** — "+ In-time / Rally" in the header's control group, typing, ✕ | header row: Go n, the title picker, Traffic, sort, + Line, ✕ Wave (the wrap repair of `94aa8913`; e2e geometry covers four widths) |
| Scheduler Board, phone layout | **YES** — same builder | **YES** | as above — walk it |
| An SC wave (board and week) | **NO, because** SC's B box IS its in-time (owner, 24 Aug 26); header note and button are dropped (`sc` / `sa` guards) | NO, same | — |
| An AVALON / BB wave | **YES** — the board header reads "In-time / Rally <earliest take-off>" (the old fallback, relabelled); no lines block unless lines exist | **NO, because** standalone — button hidden and the click refused (`isStandalone`) | — |
| Next-week peek (`ui/peek.ts`) | **NO, because** the peek has its own compact drawing that has never shown these lines (same on `main`) — a previous-evening report is not visible there | NO | — |
| A look at an older version (👁), week and board | **YES** — that version's lines, read only; its warnings as issued (D187) | **NO, because** a version is a record | the read-only bar |
| Published face against the working copy | **YES** — the face draws the issued lines and tab note (worked out from the lines and take-offs only; no Logic value enters) | edits land on the working copy, mark `it:` pending and take the sign-offs down (the ordinary route, unchanged) | amendment marks |
| The warning list — week day box, board checks panel, View-only | **YES** — "In-time / Rally — timings out of order" (red) and "— check the reporting instruction" (amber), `engine/validate.ts` l.655; a tap jumps to the lines block (`data-warnkey="it:di.gi"` on both surfaces) | hide / flag again — the ordinary route | — |
| Pucks | **NO, because** the warnings name no person by design (D502: "no invented puck penalty") — no ring, no chip | NO | — |
| Print (agency PDF) and CSV (`ui/printpdf.ts`, `ui/export.ts`) | **NO, because** the 16-column flying report has never carried the lines, the tab note or the warning list (same on `main`); no ruling either way was found — see "could not settle" | NO | — |
| Changes window, History, the pending list | **YES** — the change is recorded under the `it:` key as before; **the WORDS are MISSING ×3**: "In-times" (`ui/changesmodel.ts` l.119), "· in-times" (`engine/editlog.ts` l.404), "N in-time(s)" (`ui/pendlist.ts` l.91) | n/a | — |
| Toasts | "Only a scheduler can edit In-time / Rally" **YES**; the ✕ toast still reads "In-time line removed" — **MISSING** (`ui/interactions.ts` l.785) | n/a | — |
| Undo / Redo (top bar) | **YES** — "an In-time / Rally line" (`undo/describe.ts textLabel`) | **YES** | — |
| Available-crew panel (the wave bands) | **YES** — `engine/events.ts waveWindows` → `engine/avail.ts availByWave` → `ui/html.ts availHTML`; a previous-evening wave now sorts first and an emptied band counts nobody | n/a | — |
| Crew picker / palette (the pre-drop line) | **YES** — "crew rest — not clear until 23:00 (previous day)" / "breaks next <day>" (`engine/validate.ts crossDayIfPlaced`) | n/a | under a struck name, 8.5px — walk it |
| The dotted "breaks tomorrow" mark and its row (`ui/html.ts dayTraceHTML`) | **YES** — one row per later day it breaks (`restTraceEntries`); "Next week's <day>" in the title | tap jumps as before | — |
| Insights | **YES** — work hours through the one shared span (`engine/insights.ts` → `workSpan`); the two warnings are counted in issues by type | n/a | — |
| Logic page (`ui/logic-html.ts`, `ui/LogicPage.tsx`) | **YES** — a group "In-time / Rally" (four rows) and the setting row with the time and the words | **YES** for an admin in "Edit rules"; read only for everyone else (`lgCanEdit`, `isAdmin` re-checked in the handler) | the words box sits beside the number box in one cell — width repaired in `94aa8913` |
| Week banner ("RULES MODIFIED") on Edit Schedule and View-only | **YES — and it should not for the words setting**: lead 2 | n/a | — |
| Inputs calendar | **NO, because** it holds no reporting line (a member's timed Duty/Commitment input still starts or ends a rest period, unchanged) | NO | — |
| Medical view, Tracker, phone drawer, Traffic pop-up, day pop-up | **NO, because** none can hold a wave's reporting line | NO | — |
| Leave War and its OIL tracker | **NO, because** earned leave uses the nominal report (take-off less the Logic setting), never the typed line (`engine/oil.ts` l.39–43, l.221) — but see lead 1 | NO | — |
| Day templates, wave templates, copy day, saved plans | **YES** — carried as the same strings; no new field | as before | — |

MISSING cells in B: **4** (three change-record labels and one toast — lead 5).

### Every reader of "when does this crew report" — shared routine or own arithmetic

| Reader | Goes through | Verdict |
|---|---|---|
| The day's events (`engine/events.ts buildDay` → `seatIntime` → `reporting.ts resolveReporting`) | the shared routine | shared |
| Work span — the long-day note and Insights' hours (`engine/validate.ts workSpan`) | the event's `report` | shared |
| Crew rest, the dotted mark, the pre-drop question (`crewRestDay`, `restIfPlaced`) | the event's `intime` and `brief` | shared |
| SANS window — the check (`validate.ts` l.1287) and the picker (`engine/avail.ts` l.264 → `seatIntime`) | shared | shared |
| SC in-time window advisory (`SC_INTIME`) | the event's `report` (SC's typed B) | shared, unchanged |
| Wave header and bands (`waveInTime`, `waveWindows`) | `resolveReporting` per formation | shared — except a wave with no take-off (lead 4) |
| The "+ In-time / Rally" button (`ui/interactions.ts`) | `resolveReporting`, else earliest take-off less the Logic setting (D510) | shared |
| The order check and the live explanation (`reportingIssuesForWave`) | `resolveReporting` + `flightBrief` (the same brief the events use) | shared |
| The previous or next week's days for the week's edges (`engine/weekctx.ts datedRestSeed` → `buildDay`) | shared | shared |
| 7-day run | reads only whether a day has an event — no report time | not a reader |
| Ordinary busy windows / clashes | step to dekit, by design | own, ruled (design note; register RT8) |
| Tight-turn advisory | take-off less the Logic setting, by design | own, as before |
| **Earned leave** (`engine/oil.ts dayOilWork`) | take-off less the Logic setting through landing plus debrief | **own, by design — never the typed line** |
| Print and CSV | print no report time | not a reader |
| Logic page examples | read `VCONF` live; no worked report example | not a reader |

---

## 2. Doors

| Action | State | Admin / scheduler | Admin's member view · member · guest · no access | Desktop / phone |
|---|---|---|---|---|
| Add a reporting line | a day not published | week tab button + board header button | no button drawn (`ed` false / `mvRO`); the click handler refuses too (`canEditSched() && HOOKS.editMode()`) | both |
| | published, nothing waiting | same — writes the working copy, the day reads pending, the four sign-offs fall | none | both |
| | published, changes waiting | same | none | both |
| | a look at an older version | none (read only) — correct | none | both |
| Edit / remove a line | as above | type + blur or Enter; ✕; Escape puts the text back and re-reads the explanation | none (`contenteditable` not drawn) | both |
| See why a pair is wrong | editing | the explanation line under the lines (only when the wave HAS at least one line — a wrong brief/take-off pair on a wave with no lines is in the warning list only) | the warning list on View-only | both |
| Publish with a wrong pair (D509) | any | allowed — `publicationTimingOK` and its three calls are gone; net diff of `engine/publish.ts` against `main` is the Discard removal only | n/a | both |
| Change the button's time or words | Logic | "Edit rules" then the box; Reset to standard; Undo | read-only value (escaped) | both |
| Clear a draft day's marks (A) | not published | **no door, by D488** — first publish clears them | none | — |

No state was found where the data allows an action with no control, or a control is drawn where the write path refuses.

---

## 3. Orders

| Order | What the rulings require | What the code does (by reading) |
|---|---|---|
| A: edit a draft day → put it back by hand | marks stay until first publish (D488) | stays marked; the box keeps saying "Changes are on unpublished days" — as ruled |
| A: first publish / AL / EOD | clears or issues as on `main` | identical code to `main` (`setDayApproved`, `publishALDay` untouched) |
| A: Unpublish, then edit, then publish again | marks ride until the re-publish | identical to `main` |
| A: Load onto working copy | counts and replaces as on `main` | identical to `main` (`dayDiscardCount`, `drafts.ts` untouched) |
| B: add line → Undo → Redo → reload | the line and its mark come and go, and survive a reload | the unchanged `markEdit` + `afterSchedMutate` route; nothing new stored |
| B: wrong pair → publish → fix the line → AL | publish allowed; the warning goes out with the day; the fix is an ordinary amendment | as required |
| B: publish → hide the warning → AL | the hide waits for the amendment (D471) | the ordinary hide route (a person-free warning, like "Flight times — the same") |
| B: specific line then wide line, and the reverse | same answer either way (D505, D506) | order-independent (`scope`, then earliest) |
| B: in-time line then rally line, and the reverse | earliest applicable stage (D505) | order-independent |
| B: a clock later than take-off, on Monday | read as the previous week's Sunday (D503) | Monday's check reads the previous week's last four days (`restDayAt(-1…-4)`); the dotted mark for it shows on that Sunday when ITS week is loaded |
| B: change "Flight brief before T/O" after publishing | the published day keeps its printed brief and its warnings; the change reads pending and the four fall (D186, D103) | as required — the order check on the working copy uses today's value, the face keeps the issued list |
| B: change "Nominal report before T/O" after publishing | nothing printed moves; Insights' hours unaffected (a flight with no line starts at step, not at this value) | the tight-turn advisory moves at once (live by D188) — **and so does earned leave on published weekend/holiday days: lead 1** |
| B: change the button's words → Undo → Redo → reload → Reset | saved, undone and reset with the other Logic values | yes — `rulesSave` / `rulesLoad` / `rulesResetMem` treat it as text; no published day keeps it (it is only ever written into a line by the button) |
| B: second week | the demo's second week raises none of the new warnings | its five lines were moved to three hours before take-off (`engine/week2.ts`) |
| B: storage reset | settings back to standard | `store.set('rules', null)` — includes the words |

**A behaviour change the evidence sheet states only in passing.** `crewRestDay` no longer stops when rest was already clear
by midnight (`if(earliest<=0)return` removed) and now looks back four days for the last thing a man did. So a
small-hours take-off whose brief or report falls on the evening before can now raise a red crew-rest warning that
`main` never raised (example: yesterday ended 13:00, take-off 02:00, suggested brief 23:40 the evening before = 10h40
rest). That is the 12-hour rule applied correctly, not a fault — but it is live on a published day's face (D184, D185),
so existing weeks can show new red warnings the moment this merges. Worth one line to the owner.

---

## 4. Leads (ranked)

### 1. Changing "Nominal report before T/O" on Logic moves earned leave on ALREADY-PUBLISHED weekend / holiday days at once — no amendment, nothing pending. `main` does the same; this stack makes it far easier to trigger.

- **Steps.** Fresh demo. On a Saturday covered by a Leave War period, put a man on a flying line, take-off 10:00,
  landing 11:15. Sign and publish Saturday. Leave War → OIL tracker: he has a FULL day (07:00 report to 13:15 = 6h15,
  over the 6h01 line). Now Logic → Edit rules → "Nominal report before T/O (also the time the + In-time / Rally button
  fills in)" → 2h30 — the thing D510 invites a scheduler to do to tune the button.
- **What the rulings say.** D142 / D2: a day's earned leave comes from its latest PUBLISHED version. D48: an issued day
  keeps what it went out with when a rule changes under it. D179's own reading: a rule setting's effect on a published
  day waits for a re-issue "as D48 already holds the day's OIL".
- **What the code does.** The credit is re-worked on every repaint from the issued day's content with TODAY's values:
  `leavewar/sync.ts` (the `desired` builder, l.1104 `uniformOil(envMin(spans))`) ← `creditFrom` ← `engine/oilev.ts
  oilDayWork` ← `engine/oil.ts dayOilWork` l.221 `w2(st-VCONF.reportLead, …+VCONF.debrief)`, threshold
  `VCONF.oilFullMin`. The published record freezes who was on the day (`oilev`) but no rule value (`snap.rv` holds the
  brief lead only — `engine/faceattrs.ts`). So the man's Saturday drops to a HALF day (07:30–13:15 = 5h45) the moment
  the box is changed; the day does not read pending and its sign-offs stand. The same holds for "Flight debrief after
  land" and the "Full-day OIL threshold".
- **`main`:** the same (the earned-leave files are untouched by the stack). What is new: `engine/rules.ts` l.104 now
  labels that setting as the button's time, and `ui/logic-html.ts` l.61 says so on the page — a harmless-sounding
  reason to change it.
- **Fix, step by step.** (a) In `engine/faceattrs.ts`, add `reportLead`, `debrief` and `oilFullMin` to what
  `faceRuleVals` stores in `snap.rv` for a day that can earn, and to `faceRuleValsCompared`; (b) give `engine/oil.ts
  dayOilWork` and `uniformOil` the day's kept values — pass them in from `oilDayWork` (`engine/oilev.ts` l.655), which
  holds the issued day, falling back to `VCONF` for a working day and for a version issued before the change; (c) the
  pending comparison then reads a changed value as "what this day earns changed" and the four fall (D103), exactly as
  the brief lead does under D186; (d) tests in `leavewar/oilsync.test.ts`: publish, change each of the three values,
  assert the credit and the tracker line are unchanged and the day reads pending; republish, assert the credit moves.
  Before building: this is the first Logic-driven case of D48 — put the reading to him in one line ("a published
  weekend keeps the leave it went out with until re-published — yes?"); D48 already says yes, the build has never
  existed.

### 2. Setting the button's words lights "RULES MODIFIED" on every week banner, and Logic says the schedule "is being checked against these values". New in this stack.

- **Steps.** Logic → Edit rules → "Words the + In-time / Rally button fills in" → `RALLY` (D511's own example) → Done.
  Open Edit Schedule or View-only Sched, as anyone.
- **Expected.** D511: a wording preference for the squadron. The stamp exists so that a changed RULE is never silent
  (`engine/rules.ts` l.91–94).
- **Actual.** `rulesOffCount()` counts every key of `RULE_SPEC` that differs from standard, the new text key included
  (`engine/rules.ts` l.145). So the red "RULES MODIFIED" stamp shows on both week banners for every user
  (`ui/Shell.tsx` l.260, l.511, l.591; `ui/scheduler/01-logic.css` l.78), and Logic's amber strip reads "1 rule changed
  from the squadron standard. The schedule is being checked against these values, not the published ones"
  (`ui/LogicPage.tsx` l.198–201) — untrue, no check reads the words. A squadron that says RALLY wears the stamp for
  good, and it can then no longer tell them when a real rule has been changed.
- **`main`:** cannot happen (no text setting).
- **Fix.** In `engine/rules.ts` add `export function rulesCheckedOffCount(){ return Object.keys(RULE_SPEC).filter(k =>
  RULE_SPEC[k].kind!=='text' && ruleOff(k)).length + Object.keys(KIND_LABEL).filter(kindOff).length }`. Use it for the
  stamp and the strip: `ui/Shell.tsx` l.260, l.298, l.511, l.591 and `ui/LogicPage.tsx` l.104 (the body class) and the
  `#lgOff` strip. Keep `rulesOffCount()` for the "Reset to standard" button, its toast and the "N off standard" count,
  and keep the cell's own "changed · standard …" tag. Tests: `ui/logic.test.tsx` — words changed alone → no
  `page-rules-off`, no strip, Reset still offered; a number changed → both back.

### 3. "RALLY AFTER IN TIME" typed WITH a clock on a formation's line is read as that formation's in-time too, and replaces the wave's in-time for it — against D505. New.

- **Steps.** A wave with formations VL and RU, take-off 11:00. Lines: `08:00H: IN TIME + WX/NOTAMS` and
  `08:30H: VL RALLY AFTER IN TIME`.
- **Expected (D505, his own example).** A formation's rally does not cancel the whole-wave in-time: VL reports 08:00.
- **Actual.** `engine/reporting.ts parseReportingLines` l.42–47: "immediate" is recognised only when the line has NO
  clock; with a clock the line falls to the word tests, "IN TIME" matches, and the line is given BOTH activities. Being
  VL's own in-time line it replaces the wave-wide one (`scope`), so VL's report, work hours and crew rest start 08:30.
- **`main`:** different reader (last named line won) — it also gave VL 08:30; the stack promised D505 and misses this
  spelling.
- **Fix.** In `parseReportingLines`: `const after=immediateWord.test(text), immediate=clock==null&&after;` and
  `const activities:Activity[]=after?['rally']:[]; if(!after){ …the three existing tests… }`. Test in
  `engine/rally-workspan.test.ts`: the two lines above → VL in-time 08:00, rally 08:30, report 08:00; and the same with
  the lines swapped.

### 4. A wave that has a reporting line but no take-off yet shows "In-time / Rally —" and drops out of Available crew, while the checks already use the typed clock. New against `main`.

- **Steps.** Board → + Wave (its first line comes up blank) → + In-time / Rally (no clock is filled, there is no
  take-off) → type `0800` at the front of the line and leave it.
- **Expected.** As `main`: the header reads the line's time and the wave has its band (the header is "the earliest
  in-time"); the day's checks and the header agree.
- **Actual.** `engine/events.ts waveInTime` l.504–509 skips every formation with no take-off, so it answers nothing:
  header "—", no band in the Available-crew panel. `buildDay` meanwhile gives the crew an 08:00 report from the same
  line (`seatIntime` with no take-off keeps the clock as typed). Two readings of one line until a take-off is typed.
- **Fix.** In `waveInTime`, do not skip a formation for a missing take-off: `const to=parseHM(f.to); const
  t=resolveReporting(w,f,to==null?NaN:to,parsed).report;` (with no take-off `instant` leaves the clock on its own day —
  exactly what `buildDay` does); and when the wave has lines but no uncancelled formation, fall back to the earliest
  clock of `parsed` before the earliest-take-off fallback. Test in `engine/intimes.test.ts`.

### 5. Four places still call the lines "in-times" — the wording changed on the box, the button, the warning and Undo, not on the change records. New (a wording roll-call miss).

- **Steps.** Edit a reporting line on a published day; open the changes window (All changes and To go out), tap the
  gold dot, read the day's pending list; remove a line with ✕.
- **Expected.** D498 / D504: the box is "In-time / Rally" — one name everywhere (bug-check order §6: a wording ruling
  gets every place that draws the text).
- **Actual.** "In-times" (`ui/changesmodel.ts` l.119), "<wave> · in-times" (`engine/editlog.ts` l.404), "2 in-times"
  (`ui/pendlist.ts` l.91), toast "In-time line removed" (`ui/interactions.ts` l.785) — beside Undo's "an In-time /
  Rally line".
- **`main`:** consistent ("in-time" everywhere).
- **Fix.** One shared constant (e.g. `REPORTING_LABEL='In-time / Rally'` in `engine/reporting.ts`) used by the four
  strings and by the existing ones; one test that renders each place.

---

## 5. Explicit negatives — checked, nothing found

- **A — callers.** Searched all of `src`, `e2e`, `scripts`, `probes` for `discard`, `alDrop`, `marks cleared`,
  `sched.discard`: no caller, no History/changes line type, no undo phrase, no permission row, no hint or toast, no
  e2e helper. The many "Discard N edits" hits are the Load-onto-working-copy confirm — a different thing, untouched.
- **A — publishing.** `git diff de470db5 bcc69fc8 -- src/engine/publish.ts src/state/sched-commit.ts`: only the removed
  function, its counter, its command and the unused import. `engine/drafts.ts` and `engine/restore.ts`: no change.
- **A — a stored `sched.discard` envelope or an old "Draft marks cleared" history line** reads back as plain text /
  the generic label; it lives only in stored demo data (not a finding, D56).
- **A — the box's sentence.** It now asks `dayApproved` where it asked "has an Original"; both are true together for
  every state the app can reach; the sentence is the same.
- **B — D509.** No refusal is left anywhere: `publicationTimingOK`, the `checkTiming` parameter and the "Cannot
  publish" toast are gone; the warning is red in the working list and frozen into the issued one like any other.
- **B — D503 and earned leave.** A previous-evening report does NOT move earned leave onto another day or lengthen
  the day's envelope: `engine/oil.ts` never reads the lines (its own header says so, l.39–43), and the stack did not
  touch `oil.ts`, `oilev.ts` or `leavewar/sync.ts`. D42 stands as on `main`.
- **B — D503 across Monday.** Monday's crew rest reads the previous week's Sunday (and three days before it) through
  the same day builder and the same published-or-working world as before; the published-face pass's check for a
  changed neighbour already covers all seven days of the neighbouring weeks (`weekctx.ts windowDiverges`).
- **B — the published-copy pass.** `validate.ts` l.655 reads `DAYS[di]`, which IS the issued day during that pass;
  every validator global, the crew-rest body and its day lookup included, is put back afterwards
  (`snapGlobals` / `restoreGlobals`).
- **B — D505 / D506 / D507.** Own-over-wide per activity, earliest duplicate after the day is resolved, rally equal to
  brief allowed — all as ruled in `resolveReporting` / `reportingIssuesForWave`.
- **B — SC, AVALON, BB.** The order check skips standalone waves; SC keeps its typed-B in-time and the old bounded
  midnight rule; AVALON/BB crews never enter the event stream; the button is hidden and refused on all three.
- **B — a cancelled line** is skipped by the events, the order check, the header and the button; **an empty
  formation** is still order-checked (D502) and gives no pre-drop rest hint — filed `[REST-FIRST-CREW-HINT]`.
- **B — the crew-rest clearance map now holds zero or negative values** for a man whose report reaches yesterday; its
  one reader (`avail.ts` l.420, the SC picker) compares it with a shift start ≥ 0, so nothing misreads it.
- **B — the settings.** Saved only when off standard; reloaded as untrusted text (trimmed, one line, 60 characters,
  empty → the default); undone through the same settings writer (`state/command-write-seam.test.ts` names it); reset
  with the rest; nothing on a published day depends on either value except lead 1.
- **B — escaping (question 5).** The words are escaped everywhere they are drawn: the Logic box (`value="${esc(…)}"`),
  the read-only value, the "standard …" tag, the source line (`esc(src)`); the row's sentence does not contain them;
  the change toast uses `textContent` (`ui/toast.ts` l.46); a line the button writes is drawn through
  `intimeLineHTML` (`esc` first); the explanation line is `esc(…)` at build and `textContent` while typing; the
  warning's formation name reaches the list through the existing escaped route.
- **B — the funnel.** The button, the ✕ and the typed commit are the unchanged `markEdit` → `afterSchedMutate` /
  `commitText` routes under the `it:` key; no new write path.
- **B — negative work hours.** A flight's report can no longer be later than its take-off, a shift takes the earlier
  of report and start, so `workSpan` cannot go negative for anything the app can hold.
- **B — typed brief on a small-hours take-off** keeps its old, narrower midnight rule (ruled: "do not extend this to
  typed-brief date rules"); the editor already refuses a brief later than take-off, so the new "brief later than
  take-off" pair is not reachable by typing.

---

## 6. What I did NOT read, and why

- **No test, no spec file, no CSS** beyond three selectors — a read of what ships; whether the tests prove what they
  name is not judged here.
- **`ui/board.ts` and `ui/html.ts`** only around the changed hunks and the callers the roll-call needed (both are
  over 2,000 lines); **`leavewar/sync.ts`** only the credit builder; **`weekctx.ts bundle()`** internals not re-read.
- **Codex's plans, inspection reports and evidence archives** — starting material only; the two sheets, the register,
  the design note and the small-review brief were read whole.
- **The later pieces of the stack** (Insights, the UI pass, the save band) except where they touch these files.
- **Speed.** The four-day look-back builds up to eight extra days of neighbouring weeks per check run; Codex measured
  about +0.1s on the slowest phone setting. Not judged by reading.

## 7. Could not settle by reading — for the walk or the owner

1. Lead 1 in the running app: the tracker's figure before and after the Logic change, and that nothing reads pending.
2. Lead 2: that the stamp really shows on both banners at phone and desktop width.
3. The explanation line and the "(prev day)" header at 390px and 320px, and on his iPhone — does typing in a line on
   Safari refresh the explanation as it does in Chromium (it relies on the `input` event of an editable line).
4. The new crew-rest warnings on existing weeks (§3's note): how many appear on the demo's published days.
5. **Print and CSV** carry no reporting line, so a "report 22:00 the evening before" is not on the printed schedule.
   Same on `main`; no ruling found for or against. A question for him, low.
