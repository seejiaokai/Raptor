# Astra's scenario design — the schedule's marks and words (chat 13, group 3; 8 Nov 26)

For the build planned in `docs/superpowers/briefs/2026-11-08-sched-marks-build.md` (D1784, D1785, D1792 (a) and (d));
evidence sheet `docs/handpass/2026-11-08-sched-marks.md`. Scenario design only (the bug-check order §4, rank 1): one
reader, Astra, before the build was written; nothing here has been walked or reproduced yet — each scenario and each
"missing" point is for the host to judge, reproduce and size (§4 "What to do with what they hand back"; §7.0).

- **Date:** Sun 8 Nov 26, run 11:24–11:41 (about 17 minutes).
- **Model:** Astra — `gpt-6-astra`, reasoning effort high, codex-cli 0.160.0, sandbox read-only (it changed no file and
  ran no app, build or test).
- **Command** (from the worktree root; the brief passed as the prompt):
  `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only -C "C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c" -o <out.md> "$(cat <brief.md>)" < /dev/null`
- **Source read:** the branch `claude/pr-sched-marks-3205d7` at `c9a38fe34` (main's code, before the build).
- **Below:** the brief as sent, then Astra's answer exactly as it came back.

## The brief, as sent

````text
You are Astra, the project's standing reviewer, asked for ONE job: DESIGN THE TEST SCENARIOS for a build that is planned but NOT YET WRITTEN. You are the scenario designer (rank 1 of the bug-check order, raptor-port/docs/bug-check-order.md section 4): hunt for what is MISSING, not whether the code is wrong. Do not edit, create or delete any file; do not commit. Your sandbox is read-only: you may read files and run read-only searches (grep, git log, git show, git diff). You cannot run the app, a build or the tests. Where you would want something run, name the exact input (the scenario's steps, or the exact command) and the host will run it.

Repo: C:\Users\User\projects\Raptor\.claude\worktrees\pr-day-start-7b064c (the app is raptor-port/, React + TypeScript; dense surfaces are HTML-string builders). Branch claude/pr-sched-marks-3205d7. The source on disk today is main's, BEFORE the build: read it to find every surface, door, writer and reader the build must reach.

READ THESE (live files, by path):
1. The plan: raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-build.md (three jobs).
2. The owner's three rulings in full: grep -h '^| D1784 |\|^| D1785 |\|^| D1792 |' .claude/decisions-full/*.md  (use the shell's grep; full rows are long lines). Also open the rows the plan and the evidence sheet name beside them: D45, D93, D177, D178, D837, D1667, D1668, D1669, D1700, D1703, D1124, D469, D472, D475, D56.
3. The drawings' notes: raptor-port/docs/img/handpass/2026-11-07-pictures-round/notes-sched.md Q1 and Q2 (the headings "## Q1" and "## Q2"); notes-marks.md section "## 3." (round 5 a-d). Pictures in the same folder: q-unavmark-*, q-readonly-*, q-r5a-*, q-r5d-*.
4. The evidence sheet's eight answers and tier: raptor-port/docs/handpass/2026-11-08-sched-marks.md section 1.
5. The area rulings: .claude/rules/decisions/scheduler.md and .claude/rules/decisions/design.md (one-line rulings; read both), and search their full rows in .claude/decisions-full/scheduler.md and design.md (never whole; grep by subject: pending, amendment, AL, quarantine, protected, unreadable, older version, Blocked, eye, look at a version, plan selector, warning, hide, flag, member). The doors also fall under .claude/rules/decisions/inputs.md (the input window, raptor-port/src/ui/inputedit.tsx), oil.md (the board's OIL Earn mode, board-html.ts) and leave-war.md (the medical path): search those for the same subjects.
6. The surfaces and flows: raptor-port/docs/feature-impact.md, sections 1 (surfaces), 2 (Flow B a personal input added or edited; Flow D publish / amendment / load-a-version; Flow E load a week), 4 (the single funnels and drift-seams, especially "Deliberate second copies - week keys, the preview, the week stash, drafts").
7. The walk's rules your scenarios must satisfy: raptor-port/docs/bug-check-order.md section 7.0a (the plain-user round) and the list "## The lessons of §7.11" at the end of raptor-port/docs/bug-check-checklist.md (23 lessons plus "the second 23"). Check every scenario against that list and say which lessons each scenario covers; name any lesson that applies and no scenario covers.

THE PROMISE (copied from the owner's full rows; these are the requirements):
- D1784: "An input filed, changed or moved after its day was published wears the same waiting mark on its Unavailable row as on a Ground Programme row - its name underlined dotted in the amendment's colour on the week, its name box outlined dotted on the board - until the day's next amendment goes out. No new words and no new look." It carries D45 and D93 to the one list that never got the mark; D177 and D178 already count such an input as pending.
- D1785: "A week whose saved copy cannot be read says so on each day, says the saved copy is kept as it was and to report it with "Report a problem" on the Help page, and refuses a change in the grey "Blocked:" note in the same terms." The words drawn (with curled quotes): on each day "This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on the Help page."; the refusal, in the grey note: "Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it with “Report a problem” on the Help page." "It replaces the words that blame "an older version of the app" and send him to "the device that created it"." The grey look carries D1667-D1669 to the one refusal their build left amber.
- D1792 (a) and (d) only: the 👁 on a look at a published version (the day's plan selector label and the look's banner, on Edit Schedule's week and on the Scheduler Board) takes the wave templates window's line eye; a hidden warning's ↺ ("Flag this again") takes the Reset arrow; the ✕ stays typed. Every button keeps its words and its hover words. (b) the Inputs calendar and (c) the Tracker are NOT in this build.

THE BUILDER'S READINGS (the plan's own; NOT the owner's words). Rule each one: supported / contradicted / the owner's to decide, citing the row:
R1. A week that reads but in an older format ("published by an older version") keeps today's notice (which says "open it on the device that created it") and the refusal "Blocked: this week was published by an older version of the app, so it can’t be edited. Nothing was saved." with no "Report it…" sentence. (Compare D1785's "It replaces the words…", and notes-sched.md Q2 "cold read 14".)
R2. The refusal's words are chosen by "is ANY week (the loaded one or any stashed one) unreadable", not by the week the refused change touches.
R3. An approved day with no issued copy on an ORDINARY week keeps today's notice words (the dayIssuedHTML ver==null branch).
R4. The publish refusal (lockedDayNote) says the unreadable refusal only when the LOADED week is unreadable; otherwise words and kind unchanged. The plan also asks whether a publish can be pressed at all on a protected week.
R5. No waiting mark during a look at a version or at a saved plan; none in the board's OIL Earn mode; none on Personal Inputs or SANS rows; a member sees what he sees for a Ground row.
R6. The mark reads the same list as the day's "N pending" (dayPendingItems); kinds covered: a filing, a details change, a re-date onto the day, "→ Unavail" of a Ground input, an Other's "Goes to", a record replaced by another of the same man's (frozen id vs live id). A man split out of a shared input may lose his mark ("make his row match if you can, else report it").
R7. The eye 11 px in the selector, 12 px in the banners; the Reset arrow 13 px; colour currentColor.

WHAT TO PRODUCE. Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of actions. Assume every existing line may be correct and the defect may be a MISSING call site. For each item, state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or most specialised surface.

Cover at least, as a person would run them in the running app, on a desktop (1536 wide; his PC runs at 125% display scaling) and on his iPhone (390 wide, WebKit):
- Every surface that draws an Unavailable row (the week on Edit Schedule, the Scheduler Board's Unavailable panel, the phone board, the view page, any other you find), every plan selector, every look banner (a published version and a saved plan), every warning line with its ✕ / hidden state (the board's list and Edit Schedule's day list), and every protected week's notice (each day of the week, the board).
- Every door that can refuse a change on a protected week: the Inputs page, the input window (file, edit, delete, re-date), the week, the board, the Leave War's medical path, drag, accept, "→ Unavail", and any other writer you find (search for the current protectedWeek / LOCKED_WEEK_NOTE / QUARANTINE_NOTE readers). Both cases: a week whose saved copy will not read, and one an older version published; the loaded week and a stashed (not loaded) week.
- The orders: file after publish, then publish the amendment (mark gone, count back); undo and redo of the filing; reload; switch week and back; look at a version (Original, an amendment) and back; a saved plan's look; OIL Earn mode on and off; member vs scheduler; a draft (unpublished) day; a day with two waiting inputs (one Ground, one Unavailable) so "2 pending" must match two marks; a change that is then undone back to the published state (does the mark and the count leave together?).
- The plain-user round (section 7.0a): the area's everyday tasks end to end — file leave on a published day, open it, edit it, close it each way (Close, ✕, Escape, a tap outside), undo — then every other place that should show the result looked at (the Inputs page, the schedule, the board, the bell, the person window, the changes window).
- For the eye and the arrow: drawn not typed on every place, on his iPhone (a typed 👁 is a coloured emoji there), no wrap of the selector label on the phone, the arrow still flags the line again, hover words unchanged, a member sees no ✕ / ↺, and no confusion with History's clock on the same bar.

Each scenario: an id (S1, S2, ...), its rank, surface(s), role, device, setup (the demo data and clock it needs: the demo world is held at Mon 13 Jul 26, signed in as Saber, admin; Bolt and Saint are demo people), numbered steps, an EXPECTED line in the app's own words (the words on screen, the count, the mark), the observation that would disprove correctness, the ruling or plan part it tests, and the lessons it covers. Where an EXPECTED line names a COUNT, a REFUSAL or a PUBLISHED-DAY state you cannot derive from the rows above, write "RECORD exactly what it says" instead of guessing. Say how to make a week unreadable and how to make one "older-format" in the running app, if there is a route (the notes Q2 (b) damaged one saved row of the week of 13 Jul and reloaded).

Then a section "WHAT IS MISSING FROM THE PLAN": each item a concrete gap (a surface, door, reader, order or case the plan does not reach), why it matters, and an exact step-by-step instruction for adding it to the plan. Then "THE BUILDER'S READINGS RULED" (R1-R7). Then "EXPLICIT NEGATIVES": what you checked and found nothing in ("I checked X and found nothing").

WHAT IS NOT A FINDING (the owner, D56): This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step. Do not report a problem whose harm exists only in data already stored when the code is already correct going forward - no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. (So: a week an older version published can only exist in data already stored; say where a scenario depends on that.) Also not in scope: a scheduler who is not an admin (D785).

Write the whole answer as Markdown in your final message. No file changes.
````

## Astra's answer, verbatim

# Scenario design — schedule marks and protected-week wording

**The plan needs broader coverage before it is built.** The highest-risk omissions are shared inputs that acquire new identities, protected-week refusals outside the five named callers, the separate next-week preview, and transitions between working copies, published versions and saved plans.

This is a **read-only scenario design**, based on the current source and live documents. I did not change files or run the app, tests or build. These are proposed checks, not reported runtime failures.

The evidence sheet’s **FULL** tier is appropriate: published records, saved data, shared renderers and warning lists are involved.

## Test fixtures and evidence rules

Unless a scenario says otherwise:

- **Clock:** Monday 13 July 2026, 09:00, Singapore time.
- **Role:** Saber, signed in as admin/scheduler. Bolt and Saint are the test people.
- **Desktop:** 1536 CSS pixels wide, on the owner’s PC at 125% display scaling. Record browser zoom and actual viewport separately.
- **Phone:** 390 CSS pixels wide in WebKit, followed by the relevant checks on the owner’s actual iPhone.
- **Storage:** a disposable, persistent demo browser profile. Do not use a memory-only or `?fresh=1` world for reload checks.
- Start each independent case from its stated fixture. Do not let previous scenarios supply unexplained pending changes.

**D+I** below means both desktop and phone. Every scenario inherits this clock and demo world.

For every changed state, capture the result immediately and after settling. Inspect the pixels, not merely attributes. Record the day, selected plan/version, role and device with the picture. Compare approved drawings after every fix.

### Exact wording oracles

**U-N — unreadable-week notice**

> This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on the Help page.

**U-B — refusal caused by the unreadable week**

> Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it with “Report a problem” on the Help page.

U-B uses the approved grey note: red no-entry sign, bold “Blocked:”, quieter remaining words. It must remain readable above an open window and the phone keyboard.

Where a count, refusal or published-state label lacks a ruled oracle, the instruction below is **RECORD exactly what it says**. This is not permission to accept any result: compare its meaning with the specified unchanged or changed state.

### How the host can create the protected fixtures

There is **no ordinary app control for damaging a saved week or making it an older-format week**.

**Unreadable fixture U — the pictured production-storage route**

1. In a disposable persistent profile, publish Wednesday 15 July. Let saving finish.
2. Preserve the profile/storage state for comparison.
3. In that profile’s browser console, run:

```javascript
const keys = Object.keys(localStorage)
  .filter(k => /weeks\/13-07-2026#2$/.test(k));

if (keys.length !== 1) {
  throw new Error(`Expected one Wednesday row; found ${keys.length}`);
}

localStorage.setItem(keys[0], '{"broken');
location.reload();
```

This matches the damaged-row route in the drawings’ script. The current storage reader converts the failed join into an unreadable, preserved week.

For the **stashed** variant, navigate to a healthy week after loading U. Test inputs whose dates still touch 13–19 July. Also repeat with U never opened after boot: a refusal must not depend on first visiting the damaged week.

Retain the damaged bytes and the other saved rows for comparison after refusals, navigation and reload.

**Older-format fixture O — diagnostic only**

1. Use a separate copy of the healthy, published fixture.
2. Find the unique local-storage key ending in `weeks/13-07-2026`, without a day suffix.
3. Parse its JSON, remove only its `am` property, save it and reload. Keep the published issuance rows intact.

The week row stores the format stamps; publication content without that stamp exercises the older-format classification.

**This fixture imitates data already stored by an older build. It cannot be produced by ordinary fresh use of correct current code.** S15 below supplies the requested bounded observation; it must not become migration work or a D56-barred finding.

## Objects, surfaces and routes the build must reach

### Qualifying objects

| Object | Required treatment |
|---|---|
| Leave: LL, OL, OIL, CCL, PL, FCL, EL, CL | Every qualifying Unavailable row gets the waiting mark. |
| Medical: HL, OML, ATT C, ATT B | Same, including changes caused by medical trimming, extending and splitting. |
| OD, CSE and Attach | Exercise their automatic placement and their scheduler-controlled filing states. |
| Training, Meeting, Personal, Appointment, Duty, Event and Other filed under Unavailable | Qualify by where the input is filed, not merely its type. |
| Shared input | Check every per-person Unavailable face. One pending change need not equal one drawn row. |
| Replacement input with a different live identity | The visible replacement must not lose the mark because pending evidence names the frozen identity. |
| Input moved between dates, people or filing places | Check every affected published day and every surviving qualifying row. |
| Deleted or moved-away input | There may be no row left to mark. Its pending evidence must still be correct. Do not invent a ghost row. |
| SANS Availability and Upchit | Neither is an Unavailable row. An Upchit can nevertheless change a downchit that qualifies. |
| Cancelled, information-only, titled, late and “till date” variants | These are existing presentations, not exemptions from checking whether a visible input changed. |

### Renderers and visible gestures

| Production place | Source seam | Visible sign and working gesture |
|---|---|---|
| Edit Schedule week | `ui/html.ts`, Unavailable group and `inpEditLabel` | Dotted underline on the input’s name. Existing edit gesture and hover wording survive. |
| Scheduler Board Unavailable panel | `ui/board-html.ts`, `sbUnavailPanel` → `sbInpRow` | Dotted outline on the name box; existing tint remains. Check editable button and read-only span separately. |
| Phone board, including wide layout | Same builder, separate responsive styles | Same mark, fitted row, usable name and controls. |
| View-only schedule | `viewDayHTML`, `dayIssuedHTML`, working/draft selectors | Correct issued or working content; mark visibility follows the existing Ground-row rule for that role and face. |
| Published-version and saved-plan looks | `withDaySnap`, `dayPreviewHTML`, `SchedBoard.tsx` | Drawn eye in the relevant selector/banner; frozen content; no live waiting marks. |
| Plan selectors | `planSelectorHTML` on week and board; separate View-only selectors | Every actual selector is inventoried. The View-only native selectors contain no typed eye to replace. |
| Warning lists | `html.ts` `.witem-mute`; `board.ts` `.wln-mute` | Typed ✕ while active; drawn Reset arrow while hidden; same words, tooltip and action. |
| Protected loaded week | `dayUnsupportedHTML`, `dayIssuedHTML`, `boardHTML` | U-N on every day and in the board renderer. Do not manufacture a production board opener if none is offered. |
| Desktop next-week preview | `ui/peek.ts` | Separate reader. It must not present fallback demo rows as the unreadable saved week. It has no Unavailable list to decorate. |
| Print and CSV | `publishedDays`, `printpdf.ts`, `export.ts` | Separate consumers. Check what they expose from an unreadable week; do not assume the screen’s notice protects them. |

### Writers and downstream readers

The five constant readers named in the plan are **not the whole refusal inventory**.

| Route family | Doors to exercise |
|---|---|
| Input window | New input, edit, delete, re-date, people changes, batch save, documents, medical confirmations and removal/give-back paths. |
| Inputs page/calendar | `+ Input`, existing list/calendar entry, opened-day entry, date drag. |
| Week and board | Input name, inline start/end/remarks, Unavailable reassignment by drop or armed placement, Ground input’s people/text/marks, Accept, Reject, `→ Ground`, `→ Unavail`, Other’s “Goes to”. |
| Medical | New downchit, replacement, trim/extend, Upchit, deletion of Upchit, restored tail and retained segments; openings from Leave War and medical cards. |
| Leave War’s own guards | Direct filing, approval, sending approved leave back, deletion and moving. Several return their own locked-week reasons **before** the common input funnel. |
| Whole-day operations | Publish, amendment, saved-plan operations, load a version and apply a template. First establish whether a production control is available. |
| Person removal | Admin delete and a posting with Delete outcome; `person-delete.ts` has its own saved-week preflight and wording. |
| Undo/redo and restoration | Command restoration, filing restoration, reload, week stash and derived-row rebuilding. |
| Readers after an accepted change | Inputs list/calendar, week, board, pending/changes window, bell, person window, crew availability, warnings, Leave War and OIL. |

Pure display work must not introduce writes, new OIL credits, new notifications, altered availability or changed saved snapshots.

## Ranked scenarios

Ranks are execution priority, beginning with the least-shared routes. **High** means a missed route can violate the promise; **medium** mainly checks interaction and presentation.

### S1 — Medical change reaches an unreadable week indirectly

**Rank 1 — high. Surfaces:** Leave War medical opening, input window, Medical tab, Inputs, schedule. **Role/device:** admin; D+I.  
**Setup:** U is stashed; a medical input spans Sunday 19 to Monday 20 July. The healthy week of 20 July is loaded.

1. From Leave War’s medical route, try a replacement downchit on 20 July that trims the existing medical period.
2. Repeat with an Upchit, an extension, and deletion of an Upchit that would restore a protected tail.
3. Repeat through the calendar’s medical move/reassignment confirmation.
4. Inspect both weeks, the original medical input, retained segments, Leave War and Undo.

**EXPECTED:** U-B when the proposed cascade changes a protected date; no partial trim, new segment, withdrawal or restored tail. The editable draft remains available.  
**Disproof:** checking only the new input’s dates permits a protected tail to change; a confirmation bypasses the refusal; any part saves despite “Nothing was saved.”  
**Basis:** D1785, Job 1; medical preflight and segment guards. **Lessons:** L1, L3, L5, L12, L16, L19, L23, L23b.

### S2 — Leave War refuses before reaching the shared funnel

**Rank 2 — high. Surfaces:** Leave War day/selection windows and Approvals. **Role/device:** admin; D+I.  
**Setup:** create the relevant leave/bid records while healthy, then make their week U.

1. On protected dates, attempt direct OD/CSE/Other filing.
2. Attempt Approve, send approved leave back to waiting, Delete and Move.
3. Repeat from the single-day, selected-range and whole-leave doors that offer the action.
4. Finally select a range crossing healthy and unreadable dates.

**EXPECTED:** protected dates remain unchanged. For a wholly refused change, U-B is the required refusal. For a mixed result, **RECORD exactly what it says**, alongside exactly which dates changed; it must not claim “Nothing was saved” if some dates were saved.  
**Disproof:** only “locked week”, an unrelated date-window reason, silence, or misleading success/rollback wording; a protected date changes.  
**Basis:** D1785, D1667–D1669; `leavewar/sync.ts`’s independent guards. **Lessons:** L1, L3, L5, L12, L16, L19, L23.

### S3 — Person deletion encounters a protected saved week

**Rank 3 — high. Surfaces:** Admin person deletion and Leave War posting outcome. **Role/device:** admin; D+I.  
**Setup:** Bolt has future input/schedule records in U; repeat with U loaded and stashed. Use a disposable profile.

1. Try deleting Bolt through Admin.
2. In a fresh copy, try the equivalent posting with Delete outcome.
3. Inspect the account/person, inputs, schedule, Leave War and saved rows.
4. Try the corresponding Undo/redo path where offered.

**EXPECTED:** the protected-week preflight prevents a partial deletion. **RECORD exactly what it says**; the result must explain the unreadable-week obstruction and preserve the saved copy.  
**Disproof:** Bolt disappears from one store but remains in another; the special preflight bypasses the intended refusal presentation; a reload reverses an apparent success.  
**Basis:** D1785; `person-delete.ts` saved-week preflight. Exact wording for this wider operation needs an explicit plan disposition, not an invented sentence. **Lessons:** L1, L3, L10, L12, L19.

### S4 — Unreadable next week is visible in the separate preview

**Rank 4 — high. Surfaces:** desktop trailing next-week preview on Edit Schedule and View-only. **Role/device:** admin, then member; desktop.  
**Setup:** damage a saved row in 20–26 July; load healthy 13–19 July.

1. Pan to the next-week preview on Edit Schedule.
2. Repeat on View-only.
3. Click a preview day to load that week, then return.
4. Repeat after changing pages and waiting beyond the idle delay.

**EXPECTED:** the preview does not show seed/fallback programme rows as that saved week. Its unreadable state must be clear; the loaded week shows U-N on all seven days.  
**Disproof:** an apparently valid next-week schedule becomes “cannot be shown” only after clicking it.  
**Basis:** D1785; notes Q2 explicitly say the saved copy cannot be shown anywhere; separate `peek.ts` fallback. **Lessons:** L1, L3, L10, L11, L17, L22.

### S5 — Print and download cannot bypass the unreadable state

**Rank 5 — high. Surfaces:** schedule PDF/print and CSV controls. **Role/device:** admin; D+I.  
**Setup:** U loaded; healthy published fixture as comparison.

1. Press each export control actually offered on U.
2. Inspect any generated file or print preview.
3. Repeat on the healthy fixture while a different version or saved plan is being viewed.
4. Inspect Chromium and WebKit print pictures; record the real iPhone’s download/print behavior.

**EXPECTED:** U must not produce fallback demo content represented as its saved schedule. For its refusal or unavailable state, **RECORD exactly what it says**. Healthy exports retain their existing published-copy selection.  
**Disproof:** the page says “can’t be shown” while its export supplies an apparently valid substitute schedule.  
**Basis:** D1785; feature-impact’s downstream-reader requirement. This does **not** request adding Unavailable rows to the flying-only export. **Lessons:** L1, L3, L18, L21, L22.

### S6 — One person split from a shared input keeps his mark

**Rank 6 — high. Surfaces:** week and board Unavailable rows, input window, changes window. **Role/device:** admin; D+I.  
**Setup:** publish a shared Unavailable input for Bolt and Saint.

1. Edit only Bolt’s time or remarks through his individual schedule row.
2. Inspect Bolt’s new separate row and Saint’s surviving row.
3. Open the changes window and each input.
4. Undo, redo, reload, then publish the amendment.

**EXPECTED:** every qualifying changed visible row carries D1784’s mark, including Bolt’s new identity. **RECORD exactly what it says** for the folded pending count. Marks clear with the amendment.  
**Disproof:** Bolt’s changed row is plain while the changes window counts his change; only the original shared identity is marked.  
**Basis:** D1784; Job 2’s explicitly unresolved split; D736/D737. **Lessons:** L1, L3, L8, L9, L10, L22, L23b.

### S7 — A folded move still identifies both changed inputs

**Rank 7 — high. Surfaces:** input windows, Unavailable lists, changes window. **Role/device:** admin; D+I.  
**Setup:** publish two shared Other inputs filed under Unavailable: A contains Bolt and Saint; B contains Saber and another demo person.

1. Remove Bolt from A, leaving Saint.
2. Add Bolt to B.
3. Inspect all surviving rows of A and B, then the changes window.
4. Undo and redo the two edits individually.

**EXPECTED:** neither changed input loses its qualifying mark when the pending list folds the person’s departure and arrival. **RECORD exactly what it says** for the count.  
**Disproof:** only the destination is marked because the extractor reads the merged item’s main identity but ignores its `pp.from` evidence.  
**Basis:** D1784, D736; `dayPendingItemsIn`’s paired person move. **Lessons:** L1, L3, L9, L22.

### S8 — Frozen identity and replacement identity differ

**Rank 8 — high. Surfaces:** Inputs, week, board, changes window. **Role/device:** admin; D+I.  
**Setup:** publish Bolt’s LL or downchit.

1. Remove it and file a replacement of the same person/type with changed hours or remarks.
2. Inspect the replacement row and pending evidence.
3. Repeat with a semantically identical replacement.
4. Undo/redo and reload both cases.

**EXPECTED:** the changed replacement is marked even when the comparison names the frozen identity. A return to the published state loses both pending status and waiting mark. **RECORD exactly what it says** for each count.  
**Disproof:** a new identity defeats the mark, or an identical replacement retains a false waiting mark.  
**Basis:** D1784, D98; Job 2’s frozen/live identity case. **Lessons:** L1, L3, L10, L22.

### S9 — OIL Earn has two different Unavailable rendering paths

**Rank 9 — high. Surfaces:** board, phone board, OIL Earn. **Role/device:** admin; D+I.  
**Setup:** published day with pending LL, medical, and an OIL-eligible OD/Other input.

1. Observe their ordinary waiting marks.
2. Enter OIL Earn; inspect both non-claim rows and rows whose names become OIL controls.
3. Operate an existing OIL control, recording its ordinary result.
4. Exit and re-enter the mode; repeat in phone wide layout.

**EXPECTED:** no waiting marks in OIL Earn, on **either** rendering path. Exiting restores qualifying ordinary marks. OIL controls retain their existing behavior; **RECORD exactly what it says** for any earnings/count change.  
**Disproof:** suppression works only for `oilItemCellHTML`, leaving LL/medical read-only spans marked; marks fail to return afterward.  
**Basis:** R5, Job 2, Ground-row parity and OIL area rules. **Lessons:** L1, L3, L9, L17, L22, L23b.

### S10 — Every loaded day shows the unreadable notice

**Rank 10 — high. Surfaces:** Edit Schedule, View-only and board renderer. **Role/device:** admin, member, guest; D+I.  
**Setup:** U, with only Wednesday’s saved row damaged.

1. Inspect Monday through Sunday on both week pages.
2. Try every ordinary board opener still offered.
3. Follow Help → “Report a problem”; inspect the destination without submitting a report.
4. Reload and repeat.

**EXPECTED:** U-N on **all seven days**, including previously unpublished days. No medical details or placeholder schedule leak through. Any reachable board displays U-N.  
**Disproof:** one day uses old wording, shows seed rows, or omits the reporting instruction.

The drawings already report no ordinary board opener on this state. If still absent, record that honestly and have the host add a renderer check using `boardHTML(di)` for all seven indices under U; do not call that a production walk.  
**Basis:** D1785, Job 1. **Lessons:** L1, L3, L8, L12, L22, L23b.

### S11 — The refused input touches a stashed week

**Rank 11 — high. Surfaces:** Inputs and input window. **Role/device:** admin, then member filing his own input; D+I.  
**Setup:** healthy 20 July loaded; U stashed.

1. File on 15 July.
2. Edit an input from a healthy date into U.
3. Edit an input out of U into a healthy date.
4. Try a span crossing 19–20 July; then file an unrelated input entirely within the healthy week.

**EXPECTED:** the first four protected changes produce U-B and save nothing. The unrelated healthy filing succeeds.  
**Disproof:** only destination dates are checked; only the loaded week is checked; the presence of U blocks unrelated healthy work.  
**Basis:** D1785, Job 1; source/destination/span protection. **Lessons:** L1, L3, L12, L16, L22.

### S12 — Every ordinary input-window write refuses consistently

**Rank 12 — high. Surfaces:** Inputs list/calendar, opened day, week, board, medical opening. **Role/device:** admin; D+I.  
**Setup:** prepare each input while healthy, then make its week U.

1. From each available opener, attempt file, edit, delete and re-date.
2. Exercise person/type, start/end dates, hours, remarks, title/Attach “To”, till-date switch and documents where applicable.
3. Repeat with a shared/batch edit and with a healthy source moving into U.
4. After a refusal, tap away, reopen/refocus the field and type its displayed value again.

**EXPECTED:** U-B for protected changes; saved data unchanged; no fake success or phantom Undo entry. The form remains usable and retains the unsaved work appropriately.  
**Disproof:** one field or opener saves, closes as if successful, silently drops the edit, or leaves the field unusable.  
**Basis:** D1785, D1667–D1669; Job 1’s four UI guards plus funnel. **Lessons:** L1, L3, L5, L12, L14, L16, L19, L23b.

### S13 — Schedule gestures reach the same protection

**Rank 13 — high. Surfaces:** week, board, Inputs calendar. **Role/device:** admin; D+I.  
**Setup:** a visible input on a healthy loaded day also spans a protected stashed date.

1. Try inline time/remarks changes.
2. Try Unavailable person reassignment by drag and armed placement.
3. Try Accept, Reject, `→ Ground`, `→ Unavail` and Other’s “Goes to”, wherever offered.
4. Try Ground-input people changes and its CX/info/red-box controls; repeat a calendar re-date slowly and at ordinary speed.

**EXPECTED:** any operation changing the protected input is refused with U-B and rolls back completely. Controls genuinely unavailable are recorded as unavailable, not forced into existence.  
**Disproof:** a schedule-specific writer bypasses the input window’s protection, or a drag leaves its visual landing despite rollback.  
**Basis:** D1785; `slots`, `reqdoor`, `reqrow`, reassignment and calendar-drag routes. **Lessons:** L1, L2, L3, L5, L16, L20, L21, L22.

### S14 — Establish publish, template and plan reachability

**Rank 14 — high. Surfaces:** protected week, board, plan/template menus. **Role/device:** admin; D+I.  
**Setup:** U loaded; repeat after leaving an ordinary menu/window open before navigating.

1. Look for Publish day, Publish AL, Unpublish, template application, plan duplicate/rename/delete/switch and load-version controls.
2. Try only controls the production app actually offers.
3. Verify an old open menu cannot act on a newly protected week.
4. Ask the host to cover unreachable guarded calls in the existing quarantine/publish test harness.

**EXPECTED:** no protected change. If a publish action is reachable and refused because of U, it uses U-B. For other refusals, **RECORD exactly what it says**.  
**Disproof:** stale controls mutate the protected week; hidden controls are reported as “walked”; a reachable refusal remains silent or amber.  
**Basis:** D1785, D1667–D1669, R4; draft/template/publish guards. **Lessons:** L1, L3, L4, L12, L17, L19.

### S15 — Older-format and mixed-week diagnostics

**Rank 15 — bounded diagnostic. Surfaces:** week, Inputs, board renderer. **Role/device:** admin; D+I.  
**Setup:** O, first loaded and then stashed. Finally keep O and U together.

1. Observe O’s notices and attempt an input change on O.
2. Repeat with a healthy week loaded.
3. With both O and U present, attempt one change touching only O and another touching only U.
4. Record any accessible publish refusal separately.

**EXPECTED:** **RECORD exactly what it says** in every case and identify the week actually touched. The plan proposes grey older-format refusal wording and U-B whenever any U exists.  
**Disproof of the general reading:** a change touching only readable O is described as touching an unreadable saved copy merely because unrelated U exists.

**D56 boundary:** every O-dependent result relies on stored older-format demo data. It is not a migration or compatibility finding when forward writes are correct.  
**Basis:** D56, D1785, notes Q2(d), cold read 14, R1/R2/R4. **Lessons:** L1, L3, L22.

### S16 — Ordinary approved day with no issued copy

**Rank 16 — diagnostic. Surfaces:** View-only day renderer. **Role/device:** member; D+I renderer coverage.  
**Setup:** host-created test fixture: ordinary current-format week, day approved, no resolvable issued copy.

1. First attempt to produce the state through ordinary current UI operations.
2. If none does, mark it **test-fixture-only**.
3. Exercise `dayIssuedHTML`’s missing-version branch in the existing harness.
4. Compare it with U and a healthy issued day.

**EXPECTED:** **RECORD exactly what it says**. U’s new notice must not accidentally be selected merely because a snapshot is absent.  
**Disproof:** the new classifier treats every missing snapshot as an unreadable whole week, or a test-only state is presented as a proven production defect.  
**Basis:** R3, Job 1, D56. **Lessons:** L1, L22.

### S17 — Every qualifying input kind, including filing-state exceptions

**Rank 17 — high. Surfaces:** week and board Unavailable/Personal Inputs. **Role/device:** admin; D+I.  
**Setup:** isolated published day per case; use the qualifying-object table above.

1. File each leave and medical kind after publication.
2. Repeat for OD, CSE, Attach and each activity kind that can be filed under Unavailable.
3. Move eligible inputs through Ground, Unavailable and rejected Personal Inputs.
4. Compare with SANS Availability and Upchit negative controls.

**EXPECTED:** qualifying visible Unavailable names are marked; Personal Inputs and SANS are not given this new mark. An Upchit’s affected downchit is checked, not an invented Upchit row. **RECORD exactly what it says** for counts beyond the isolated ruled filing case.  
**Disproof:** the implementation recognises only LL, only automatic absence types, or marks rejected OD in Personal Inputs.  
**Basis:** D1784, D177/D178, Job 2; `listedUnavail` and OD filing exceptions. **Lessons:** L1, L8, L9, L22, L23b.

### S18 — The simple “2 pending” picture

**Rank 18 — high. Surfaces:** week, board and changes window. **Role/device:** admin; D+I.  
**Setup:** clean published Wednesday 15 July, with no other pending change.

1. File Bolt’s LL under Unavailable.
2. File Saint’s Meeting, “Safety brief”, onto the Ground Programme.
3. Inspect both rows and the day’s pending chip.
4. Publish the amendment.

**EXPECTED:** **“2 pending”**, one Ground waiting mark and one Unavailable waiting mark, in the next amendment’s colour. After publication both waiting marks disappear and the pending total returns to zero; **RECORD exactly what it says** for the resulting chip/status wording.  
**Disproof:** two pending changes but only the Ground row is marked; the amendment clears only one mark.  
**Basis:** D1784, D45, D93, D177/D178; notes Q1 fixture. **Lessons:** L1, L3, L8, L9, L22, L23b.

### S19 — Details change and exact return to the published state

**Rank 19 — high. Surfaces:** input window, week, board, pending/signing strip. **Role/device:** admin; D+I.  
**Setup:** published Unavailable input; capture its details and signing state.

1. Change a time, then remarks, then the till-date switch, independently.
2. Restore each original value through the same editor.
3. Repeat using the other editor: window versus inline schedule field.
4. Include an equivalent time spelling that normalises to the original time.

**EXPECTED:** a real outstanding change gains the mark; returning to the issued state removes pending status and mark together. Check signing behavior against D45/D103. **RECORD exactly what it says** for status/count wording.  
**Disproof:** a normalised equivalent or reverted edit leaves a permanent waiting mark, or the count clears while the mark remains.  
**Basis:** D1784, D98, D103, D953; canonical-value drift seam. **Lessons:** L1, L3, L14, L16, L22.

### S20 — Re-date, stretch and trim across published days

**Rank 20 — high. Surfaces:** Inputs calendar/window, both week pages, board. **Role/device:** admin; D+I.  
**Setup:** published Wednesday and Thursday; unpublished Friday.

1. Move a one-day input onto Thursday, then off it.
2. Stretch a multi-day leave/medical input to Friday; trim it again.
3. Check every still-covered published day and its “till” text.
4. Repeat across a week boundary and 31 December–1 January, with the correct year anchored to the input.

**EXPECTED:** qualifying current rows and each day’s pending evidence agree. A removed row is absent, not falsely required to carry a mark. Draft Friday receives no amendment waiting mark. **RECORD exactly what it says** for multi-day counts.  
**Disproof:** only the start day is marked; a tail/date change is missed; another year’s same date is marked or protected.  
**Basis:** D1784, D189, D953; feature-impact’s year and stash seams. **Lessons:** L1, L2, L3, L11, L20, L21.

### S21 — Undo, redo, reload and week return

**Rank 21 — high. Surfaces:** Inputs, week, board, changes window. **Role/device:** admin; D+I.  
**Setup:** clean published day; file one LL afterward.

1. Undo the filing; redo it.
2. Switch week and return, opening the board before and after.
3. Reload while the filing is pending.
4. Publish its amendment, reload, and switch away/back again.

**EXPECTED:** Undo removes the input and its waiting evidence; redo restores them. Pending survives reload; the issued amendment’s clean state survives reload. **RECORD exactly what it says** for status labels. Do not require session-only Undo history to survive reload.  
**Disproof:** stale per-pass/cache state leaves or loses a mark; reload changes its amendment colour or revives a cleared mark.  
**Basis:** D1784, D98; Job 2 cache and feature-impact’s stash/history copies. **Lessons:** L1, L3, L10, L22.

### S22 — Looking at Original and an amendment is read-only

**Rank 22 — high. Surfaces:** week selector/banner and board selector/banner. **Role/device:** admin; D+I.  
**Setup:** Original, AL1, then another pending Unavailable change.

1. Look at Original from the week.
2. Look at AL1 from the board.
3. Switch repeatedly between those looks and the working copy.
4. Open the input/changes readers available on each face.

**EXPECTED:** each look uses the drawn eye and correct existing wording, shows its frozen content, and carries no live waiting mark. Returning restores the working copy’s mark in the **next** amendment’s colour.  
**Disproof:** live inputs leak into a historical look; a warm pending cache leaks marks; returning loses pending status. For any count shown, **RECORD exactly what it says**.  
**Basis:** D179, D1784, D1792(a), R5; Job 2 preview suppression. **Lessons:** L1, L3, L8, L17, L22, L23b.

### S23 — Looking at a saved plan differs from switching to it

**Rank 23 — high. Surfaces:** plan menu, week and board banners. **Role/device:** admin; D+I.  
**Setup:** save Plan A and a distinct Plan B; publish the day and create a pending Unavailable change.

1. Look at the inactive saved plan without selecting it as the working plan.
2. Inspect both banners and selector labels.
3. Return to the working copy.
4. Separately switch to the plan, then exercise an issued-version load in an isolated copy.

**EXPECTED:** a look is read-only, uses the drawn eye and has no live waiting marks. A deliberate switch/load is a separate action; **RECORD exactly what it says** for its differences and pending total, then compare visible rows with the changes window.  
**Disproof:** a look writes/stows data, shows working marks, or corrupts the inactive plan’s saved copy.  
**Basis:** D1784, D1792(a); feature-impact’s draft-stow seam. Keep the already-filed cross-day load issue separate. **Lessons:** L1, L3, L12, L17, L19, L22.

### S24 — Member, guest and View-only faces

**Rank 24 — high. Surfaces:** View-only schedule, available board/readers, Inputs. **Role/device:** member, guest, admin comparison; D+I.  
**Setup:** published day with pending Ground and Unavailable changes, including a medical input.

1. As a member, inspect the issued face, then “Working draft — not issued”.
2. Repeat the unpublished day’s saved-plan selector.
3. Compare Unavailable treatment with the Ground row on the same face.
4. As a guest, inspect the issued face and medical wording.

**EXPECTED:** existing role and face rules remain intact; no ✕/Reset warning controls for members or guests; guest medical information remains protected. Do not infer a new mark policy from emitted attributes alone. **RECORD exactly what it says** for published-state/count labels.  
**Disproof:** CSS exposes marks where Ground hides them, medical details leak, or the glyph change adds editing permission.  
**Basis:** D1784, D179, D469/D472/D475; R5 and evidence answer 7. **Lessons:** L1, L3, L9, L17, L22.

### S25 — Shared filing counts changes, not faces

**Rank 25 — high. Surfaces:** shared input window, Unavailable lists, changes window. **Role/device:** admin; D+I.  
**Setup:** clean published day.

1. File one shared qualifying input for Bolt and Saint.
2. Inspect both per-person Unavailable rows.
3. Change its shared details; add and remove a person separately.
4. Compare the pending list with all visible faces after each action.

**EXPECTED:** all qualifying faces are marked. A shared filing/detail change is not multiplied merely because it draws several people; person changes follow D736. **RECORD exactly what it says** for combined counts.  
**Disproof:** a one-input change marks only one person, or adding marks changes the pending count itself.  
**Basis:** D1784, D736/D737. **Lessons:** L1, L3, L9, L22, L23b.

### S26 — Warning hide and flag-again on both lists

**Rank 26 — high. Surfaces:** board warning list and Edit Schedule’s day list. **Role/device:** admin; D+I.  
**Setup:** unpublished day containing a red warning, amber warning and note. Record each original line and count.

1. Hide each line using its typed ✕, once from each surface.
2. Inspect its retained position, strike/fading and drawn Reset arrow.
3. Press the arrow; inspect the warning, puck flags and counts.
4. Hide all lines, then restore them; repeat with Undo/redo.

**EXPECTED:** hidden lines stay in place; the arrow restores flagging. Tooltips remain exactly “Flag this again” and “Hide this warning — it flags no puck and is not counted; it comes back if the situation changes”. All-hidden summaries follow D475: “✓ No issues” / “No conflicts flagged ✓”. Other counts: **RECORD exactly what it says**.  
**Disproof:** an SVG is drawn but its button no longer works; the line disappears or flags remain hidden.  
**Basis:** D469, D472, D475, D1792(d). **Lessons:** L1, L3, L8, L9, L17, L22.

### S27 — Warning state across publication, looks and changed circumstances

**Rank 27 — high. Surfaces:** both warning lists, View-only, Original/AL looks. **Role/device:** admin and member; D+I.  
**Setup:** published warning-bearing day.

1. Hide a warning in the working copy.
2. Inspect the issued face and a historical look before the amendment.
3. Publish the amendment, reload and revisit.
4. Change the situation behind the hidden warning; inspect whether it flags again.

**EXPECTED:** publication/frozen-warning behavior follows D471/D187; historical looks offer no hide/restore controls. A changed situation re-flags under D469. **RECORD exactly what it says** for pending and issue counts.  
**Disproof:** hiding silently rewrites an issued record, the old look gains a live Reset button, or changed circumstances remain suppressed.  
**Basis:** D469, D471, D475, D1792(d). **Lessons:** L1, L3, L10, L17, L22.

### S28 — Every eye, its words and its surrounding controls

**Rank 28 — medium. Surfaces:** week/board plan selectors and both kinds of look banner; wave templates comparison. **Role/device:** admin; D+I.  
**Setup:** Original, AL1 and a saved plan with a long name.

1. Visit every eye-bearing state on week and board.
2. Inspect its selector tooltip, banner words and line fitting.
3. Compare the eye with the wave templates’ eye.
4. On the same board, compare Reset with History’s clock; operate each.

**EXPECTED:** drawn line eye, 11 px in selectors and 12 px in banners; Reset 13 px; `currentColor`; existing wording and hover wording unchanged. “Original” remains on one line on the phone. No coloured typed-eye emoji on the real iPhone.  
**Disproof:** one saved-plan banner is missed, a glyph inherits the wrong colour, the selector wraps, or History’s action/appearance changes.  
**Basis:** D1792(a,d), D1700/D1703, D1124; approved round-five drawings. **Lessons:** L1, L8, L9, L11, L17, L21, L22, L23b.

### S29 — Plain-user filing and every close route

**Rank 29 — high. Surfaces:** Inputs, schedule, board, bell, person window, changes window and document viewer. **Role/device:** admin, then member’s own input; D+I.  
**Setup:** clean published day; a harmless demo attachment.

1. File leave, open it, edit it and save.
2. Reopen from every offered location: list, calendar/opened day, week, board, bell and medical/Leave War route where applicable.
3. Exercise each actual Close, ✕, Escape and outside-tap behavior, with clean and dirty forms.
4. Open its document or another child window; close the child by every supported route.
5. Undo the saved edit and inspect every downstream place named above.

**EXPECTED:** the correct ruled window opens; closing a child preserves its parent. Dirty-close confirmation behaves as ruled. An outside tap on a non-blocking window is **not automatically expected to close it**. Changes and marks follow the actual save/Undo. Bell wording/counts: **RECORD exactly what it says**.  
**Disproof:** a close shuts the underlying window, a dirty edit saves silently, or one reader stays stale.  
**Basis:** §7.0a, D641, D1622/D1626, D1784. Existing bell-Undo work stays separately identified. **Lessons:** L3–L6, L12, L14, L16, L19, L21–L23, L23b.

### S30 — Changes-window jump lands on the marked input

**Rank 30 — medium. Surfaces:** changes window, week, board and person window. **Role/device:** admin; D+I.  
**Setup:** a pending Unavailable input below the current viewport, with a long remark.

1. Open “To go out”, both grouped by Item and by Who.
2. Tap the input’s change from the week, then with the board open.
3. Repeat for a shared person’s row and after an input replacement.
4. Hide/show the changes window and interact with the page behind it.

**EXPECTED:** the correct current row is brought into view and identifiable; its name still carries the waiting mark. The landing is not obscured by bars, window or keyboard. **RECORD exactly what it says** for any no-longer-present destination.  
**Disproof:** the extractor refactor fixes marks but breaks pending-list navigation, or lands on the wrong person’s face.  
**Basis:** Job 2’s shared `inputIdOf`; D1784 and the changes-window contract. **Lessons:** L3, L4, L5, L12, L17, L19, L22, L23.

### S31 — Change a page while it is hidden, then return

**Rank 31 — high. Surfaces:** kept-mounted Inputs, Edit Schedule, View-only, board and Leave War. **Role/device:** admin; D+I, WebKit essential.  
**Setup:** published day displayed once on every relevant page.

1. Leave a page, change its input from another page, then wait at least 15 seconds.
2. Return through each offered navigation route.
3. Repeat after undo, amendment publication and a warning hide/restore.
4. Capture the first painted frame as well as the settled frame.

**EXPECTED:** every returning page immediately shows the correct mark, count, glyph and version face. **RECORD exactly what it says** for counts/statuses.  
**Disproof:** one stale frame shows the previous mark or wrong published face; a page only becomes correct after another tap.  
**Basis:** Jobs 1–3; feature-impact’s cached/kept-mounted readers. **Lessons:** L1, L3, L10, L17, L21, L22.

### S32 — Drawing, keyboard and phone geometry acceptance

**Rank 32 — high acceptance check. Surfaces:** every changed screen above. **Role/device:** admin and member; D+I.  
**Setup:** short/long names; shared rows; LATE, CX, kind and till-date adornments; AL1 and a later amendment colour.

1. Compare the marked names, notices, eyes and arrows with the approved picture families.
2. Tab to the marked name and warning button; activate them with the keyboard. Check the focus ring against the dotted outline.
3. Tap every applicable text-box family identified in S12; open and close the phone keyboard.
4. Toggle phone wide layout, folds and OIL mode both ways. Pinch at the top and mid-list; scroll with bars visible.
5. Check 1536 and 2560 widths, zoomed views, and year-end date labels.

**EXPECTED:** unchanged button sizes and row alignment; readable marks on every tint; no doubled underline/outline; focus remains visible; side-by-side fields stay aligned and on one line where required; no clipping under bars.  
**Disproof:** correct attributes but invisible pixels, a focus ring replaced by the amendment outline, misaligned phone rows, emoji, or first-frame keyboard jumps.  
**Basis:** D1784/D1785/D1792; approved drawings and standing design rules. **Lessons:** L2, L5–L9, L11, L13–L17, L20–L22, L23b.

## Lesson coverage and remaining limits

The scenario references use the checklist’s numbering. **L23b** is its second “23”, concerning side-by-side field layout.

| Lessons | Principal coverage |
|---|---|
| L1 state × readings | S1–S28, S31 |
| L2 ordinary-speed gestures | S13, S20, S32 |
| L3 feedback and out-of-sight results | All action scenarios |
| L4 working page behind a window | S14, S29, S30 |
| L5 resting position and obstruction | S1, S12, S13, S29, S30, S32 |
| L6 native phone behavior | S29, S32 |
| L7 frame-steered phone motion | S32, conditionally; no new motion is proposed |
| L8 approved drawings | S6, S9, S10, S17, S18, S22, S26, S28, S32 |
| L9 row alignment | S6–S9, S17, S18, S24–S26, S28, S32 |
| L10 hidden/returned pages | S4, S21, S27, S31 |
| L11 fit, widths and year ends | S4, S20, S28, S32 |
| L12 every window opener | S1, S2, S10–S14, S23, S29, S30 |
| L13 mid-list pinch | S32 |
| L14 code-inventoried boxes | S12, S19, S29, S32 |
| L15 bars over scrolling content | S32 |
| L16 refocus after refusal | S1, S2, S11–S13, S19, S29 |
| L17 controls both ways | S4, S9, S14, S22–S24, S26–S28, S30–S32 |
| L18 print/download | S5 |
| L19 stacked closing routes | S1, S2, S12, S14, S23, S29, S30 |
| L20 realistic gesture variation | S13, S20, S32 |
| L21 real-phone limits | S5, S13, S20, S28, S29, S31, S32 |
| L22 painted pixels/first frames | All visual acceptance scenarios |
| L23 ruled opener, ordinary-day comparison | S1, S2, S29, S30 |
| L23b standing field-layout check | Every pictured screen; particularly S12, S28, S29, S32 |

**No applicable lesson is left without a scenario. None has been executed by this review.**

WebKit emulation cannot establish the real iPhone’s keyboard animation, native scrolling/bounce, pinch behavior or emoji/font rendering. Those remain explicit owner-device checks. If a reported phone fault fails to reproduce, obtain the phone’s event recording before guessing a fix.

# WHAT IS MISSING FROM THE PLAN

These are concrete coverage gaps, not claims about code that has not been written.

### 1. The split-input case is optional in the plan but mandatory in the promise

**Why it matters:** “Make his row match if you can” permits a newly separated, changed Unavailable row to remain unmarked.

**Add to the plan:**

1. Make the S6 shared-input fixture.
2. Preserve enough comparison identity to identify the resulting live pieces.
3. Assert the pending evidence and every qualifying visible face.
4. Walk undo, redo, reload and amendment publication.
5. Treat an unmarked qualifying split as unfinished D1784 work, not an acceptable limitation.

### 2. A merged person move can carry source evidence outside the main identity

**Why it matters:** the pending builder folds a departure into the arrival and retains source evidence in `pp.from`. Extracting only the main address and `now.iid` may omit a surviving changed source input.

**Add:**

1. Add S7 with two surviving shared inputs.
2. List every identity-bearing field of each pending-item shape.
3. Specify which current Unavailable rows each item marks.
4. Pin both marks and pending-list navigation after moving the extractor.

### 3. “The two surfaces” omits the separate next-week reader

**Why it matters:** `peek.ts` independently falls back to a seed bundle when a saved week cannot be read. Changing the loaded week and board notices does not reach it.

**Add:**

1. Run S4 on both week pages.
2. Record the preview and subsequent loaded state side by side.
3. Specify how the preview represents an unreadable week without pretending its fallback rows are saved content.
4. Cover cache invalidation and page return.

### 4. Print and CSV are downstream readers, not protected by the notice renderer

**Why it matters:** their published-day reader can fall back to live day data; the screen’s refusal does not itself govern export.

**Add:**

1. Run S5 against U.
2. Record actual export-control reachability.
3. Inspect every produced artifact.
4. Give any fallback-content exposure an explicit disposition under D1785. Do not silently add an unrelated export redesign.

### 5. Searching only the old constant misses independent refusal producers

**Why it matters:** Leave War approval/file/delete/move guards and person-deletion preflight can refuse before the named funnel.

**Add:**

1. Include the writer inventory above and S1–S3.
2. Classify each result as wholly refused, partly completed, or unavailable.
3. Route wholly refused unreadable-week changes to the required reason/presentation.
4. Preserve truthful partial-result wording; obtain a wording decision if the exact approved “Nothing was saved” sentence cannot apply.
5. Test the visible caller, not just the guard.

### 6. OIL Earn suppression must cover non-OIL rows too

**Why it matters:** an OD claim can use `oilItemCellHTML`, while LL/medical rows take the read-only span path.

**Add:**

1. Put all three kinds on the same board.
2. Enter and leave OIL Earn.
3. Check both rendering branches for suppression and restoration.
4. Verify focus styling, tint and OIL behavior independently.

### 7. The input-kind and filing-state inventory is incomplete

**Why it matters:** LL alone does not cover CSE/Attach defaults, rejected OD, activity inputs deliberately filed under Unavailable, medical cascades or per-person shared faces.

**Add:**

1. Adopt the qualifying-object table.
2. Parameterise S17 across the actual offered filing states.
3. Include titled, late, cancelled, info-only and till-date presentations.
4. Keep SANS, Upchit and Personal Inputs as explicit negative controls.

### 8. The plan lacks the full order-of-actions matrix

**Why it matters:** a correct initial render can still fail after a cached look, Undo, reload, plan switch or hidden-page return.

**Add:**

1. Add S19–S23 and S31.
2. Record expected input identity, selected face, pending evidence and mark after every step.
3. Warm both week and board readers before switching faces.
4. Keep look, switch-to-plan and load-version as separate operations.
5. Check publication clears marks without rewriting older issued snapshots.

### 9. Count agreement needs a stated definition

**Why it matters:** “N pending equals N marked rows” is false for shared inputs and for changes whose row has disappeared.

**Add:**

1. Keep S18 as the exact two-change/two-mark fixture.
2. Add S6–S8 and S25 for folded/shared identities.
3. Define agreement as: every qualifying current row represented by pending input evidence is marked; no unrelated row is marked.
4. Preserve the pending list’s existing counting rules.

### 10. The plain-user and closing rounds are absent

**Why it matters:** the new mark’s name is still an input opener; the refactored identity extractor also serves the changes window.

**Add:**

1. Add S29 and S30 to the host walk.
2. List every opener and each window’s actual close behavior.
3. Include dirty-close confirmation and a document over the input window.
4. Inspect Inputs, week, board, bell, person and changes readers after save and Undo.
5. Keep the already-filed bell-Undo limitation separate from this build.

### 11. Warning checks need state and publication coverage, not only SVG detection

**Why it matters:** replacing text-based assertions can leave a drawn but non-working arrow, wrong hidden state or controls in a historical/member view.

**Add:**

1. Add S26–S27 for both warning renderers.
2. Cover red, amber and note lines; all hidden; changed circumstances; undo/redo; reload.
3. Check issued versus working warning state.
4. Preserve exact hover words and typed ✕.
5. Verify absence of editing controls for members, guests and historical looks.

### 12. Reachability and visual evidence need explicit completion criteria

**Why it matters:** the board’s protected notice was not reachable through the pictured day, and DOM assertions cannot prove line fitting, colour or focus.

**Add:**

1. Record every unavailable production door under S10/S14.
2. Cover its renderer/guard in a named harness without claiming a user walk.
3. Require S28/S32 pictures against the approved families.
4. Record actual viewport, display scaling, browser zoom and device.
5. Keep real-iPhone checks outstanding until observed.

# THE BUILDER’S READINGS RULED

| Reading | Ruling |
|---|---|
| **R1 — genuinely older-format weeks keep their reason and omit the reporting tail** | **Supported for this build’s scope, with a distinction.** D1785 concerns an unreadable saved copy; notes Q2(d) explicitly retain the genuine older-format reason. Cold read 14 recommends the reporting tail, but Q2(g) calls it a possible separate small fix. It is not an additional owner ruling. D837 supports the existing reason; D56 bars turning old-only data into compatibility work. |
| **R2 — choose wording because ANY loaded/stashed week is unreadable** | **Contradicted as a general description of the refused change.** D1785 describes the week whose saved copy prevents the change. An unrelated unreadable week does not make another saved copy unreadable. However, the plan’s identified counterexample needs older-format stored data: under D56, do not create a remediation finding solely from that mixed legacy fixture. Record the limitation and keep current-data source/destination/span checks mandatory. |
| **R3 — ordinary approved day with no issued copy keeps its present notice** | **Supported as a scope boundary, not as proof that its existing sentence is truthful.** D1785 does not make every missing snapshot an unreadable whole week. No ordinary fresh-data route to that state was established by this read. S16 separates a reachable current defect from an injected/legacy fixture. |
| **R4 — publish refusal uses unreadable wording only for the loaded unreadable week; otherwise unchanged** | **Supported for choosing the target week; conditional for presentation.** Publish acts on the loaded day, unlike a global input. The reachability question is necessary. D1667–D1669 do not support leaving a reachable current refusal amber merely because it is a publish path. Older-only unreachable wording is not grounds for D56-barred work. |
| **R5 — no marks in historical/saved-plan looks, OIL Earn, Personal Inputs or SANS; member follows Ground** | **Supported.** D1784 carries the existing Ground treatment to Unavailable; it does not introduce a new viewing or permission rule. D179 governs frozen looks; the drawings and plan preserve OIL-mode parity. Check both OIL rendering branches and actual member pixels. |
| **R6 — derive marks from `dayPendingItems`; listed change kinds covered; split may lose its mark** | **Supported for the common pending source and named kinds; contradicted for the optional split.** D1784 gives no split exception. D736/D737 also mean one change can produce several faces. Frozen/live replacements, split pieces and paired source/destination evidence all need explicit coverage. |
| **R7 — eye 11/12 px, Reset 13 px, `currentColor`** | **Supported as the approved drawing’s implementation detail.** D1792 approves the drawn marks; notes-marks round five specifies those measurements. Their success still depends on actual phone fitting and painting. Do not treat the numbers alone as visual acceptance. |

# EXPLICIT NEGATIVES

- **I checked the UI’s typed-eye occurrences and found no additional production eye-bearing renderer beyond the shared selector and the week/board look banners named above.** Comments and tests also contain the character.
- **I checked View-only’s own selectors and found no typed eye there to replace.** They still require face-selection regression coverage.
- **I checked the next-week preview and found no Unavailable list.** It needs unreadable-week coverage, not a new waiting-mark renderer.
- **I checked the schedule exporter and found no Unavailable-row export.** This review does not propose adding one; that is separate recorded work.
- **I checked the warning controls and found the two production hide/flag-again builders named in the plan.** Historical looks and member/guest faces intentionally omit those editing buttons.
- **I checked SANS Availability and Upchit qualification and found neither belongs in Unavailable.** Upchit’s effect on a downchit remains in scope.
- **I checked the current history-clearing implementation and found it clears edit history, not the old bulk input/week sweep described in older feature-impact prose.** That stale prose must not create a fictitious writer scenario.
- **I checked the protected-week board route and found the source returns a notice, while the drawing notes report no ordinary day button opening it.** Runtime reachability remains for the host to establish.
- **I found no normal app route for creating corruption, downgrading the publication format or repairing the damaged saved week.** The prescribed damage is a disposable test fixture; Help is the approved user route.
- **I found no owner approval making the split-input exception acceptable, or making cold read 14’s older-format reporting tail part of this build.**
- **I found no reason to include the Inputs calendar’s expansion icons or Tracker’s Restore icon.** D1792(b,c) are explicitly outside this job.
- **I did not include scheduler-without-admin scenarios, migration work, or a defect dependent only on old stored demo data.**

**Rulings: none this session.**
