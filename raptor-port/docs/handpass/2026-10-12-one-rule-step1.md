# `[ALL-AVAIL-AS-MEMBER]` step 1 — the reader, with nothing changed on screen: the check (12 Oct 26)

**What was built:** the plan's step 1 (`docs/superpowers/plans/2026-10-11-one-rule-plan.md` §5, §4.2; what was built
and where it left the plan's letter — its §10). The rules about ONE MAN'S DAY — is he busy, away, owed — now read a
per-person view of the inputs (one line a named person) instead of the stored records. Every stored record is still
one a person, so a line is a copy of its record, and the step's whole promise is that **nothing a person can see, and
nothing the rules say, moved.** Branch `claude/all-avail-as-member`; nothing merged; no pull request.

**This is a step of a batch, not the job's check.** The one-rule job gets ONE full check for the lot, after its last
step (D485; the plan's §7 is its roll-call, Fable's twenty-one scenarios its walk's start). What follows is the check
of step 1 by itself, before he is shown it: he asked to be shown before step 2.

## 1. The eight questions, and the tier

| # | Question | Answer for step 1 |
|---|---|---|
| 1 | OIL / what a man is owed | **YES** — who stands behind an ALL AVAIL puck (and so who earns) and the Leave War's absences are read through the new view |
| 2 | The published record | **YES** — a published face's rules read the copies it was issued with through the new funnel |
| 3 | Saved data | NO — no record changes shape and no writer was touched (the guard test lists every writer; none is in the change) |
| 4 | A shared drawer | YES — the readers feed the warning rings and the crew list on every surface |
| 5 | A new gesture or mode | NO — no control was added or changed |
| 6 | A new surface | NO |
| 7 | Roles | NO — `state/perms.ts` is untouched |
| 8 | The warning list | **YES** — how the rules read a day's inputs |

**Tier: FULL**, by the facts. What that meant at this step, and what waits for the job's own check:

- **Done here:** the gates (the whole set, under the PC's lock); the roll-call of every reader moved (§2); the door
  check (none — no control); the sizing step (§3); a walk of the running built app, sized to what this step can break
  (§4); the break tests (§5).
- **Owed, at the job's check, not skipped:** the two independent reads of the code — Fable reads the finished code
  (D764), and at the merge he decides whether to wait for a ChatGPT read (D761, `OUTSTANDING.md` `[NO-ASTRA-LIST]`);
  the scenario walk of the new behaviour (there is none yet); his look.

## 2. The roll-call — every place the app asks about one man's day from the inputs

The THING is "one man's part of an input". Each row: who asks, where the answer shows, what it reads now, and what
proved it. No blank cells.

| The reader | Where its answer shows | Reads now | Proved by |
|---|---|---|---|
| A day's inputs as the rules read them — clashes, "on leave but planned to fly", crew rest, brief and debrief; the tails across midnight both ways (`events.ts`) | the warning list, the rings on pucks, every schedule surface | LINES | the record: events and warnings identical in three worlds · break: 14 rules test files red |
| The whole-day inputs a seat with no times is judged against (`events.ts`, D605) | the same | LINES | the record · break: `blankabsence.test.ts` 44 red |
| Who is away, for the day or for some hours (`avail.ts dayAway`) | Available crew, the day's "off" count, the crew list's fade | LINES | the record: the week and the crew list identical · break: `avail.test.ts`, `palette.test.ts` |
| "May he take this place?" — four absence blocks and the commitment scan (`avail.ts slotBar`) | the crew list with a seat armed, the note on a dragged puck, the note after a drop, the green rings | LINES | the record: every person against every place of the week (149, 150 and 72 places × 63 people) identical · break: `slotrules.test.ts`, `scshift-inputs.test.ts` |
| The crew list's two reasons — "grounded today", why his day is closed (`palette-html.ts`) | the crew list | LINES | the record · break: `palette.test.ts` |
| Who worked a neighbour day, for the 7-day run (`weekctx.ts workedSet`) | the RUN warning across a week's edge | LINES | the record: the week after, identical · break: `weekctx.test.ts` |
| Who stands behind ALL AVAIL / ALL (`leavewar/sync.ts availableFor`) | the count on the puck, the window of real pucks, OIL Earn, the credit on the Leave War | LINES (the inputs that could keep a man out are picked first, as records) | the record: each day's OIL evidence identical, the Saturday's crowd among it · break: `oilsync.test.ts`, `oilworkstart-published.test.ts` |
| The Leave War's absence index (`sync.ts refreshAbsences`) | every leave, medical, course and overseas-duty cell of the grid; the clashes | LINES | the record: the whole year's grid identical · break: 40 Leave War test files red |
| The absences an Undo or Redo will leave (`sync.ts restoreAbsencesOf`) | the war's refusal of a restore | LINES | break: `stage-undo.test.ts`, `undoaudit.test.ts` |
| "Has he a past on the war?" (`sync.ts pastOnWar`) | a deleted or archived man keeps his row | LINES | break: "a SANS man the war does not show, deleted: his past months keep his row" |
| Which SANS men have committed on a date (`state/flyplan.ts sansCommittedOn`) | the SANS calendar's month and its opened day, "still needed", the war's Required rows | LINES | the record: the SANS month and day (July) identical · break: `sansfly.test.ts`, `sanscal-model.test.ts`, `sanscal.test.tsx`, `sansday.test.tsx` |
| Is he still named in an input? (`state/roster-restore.ts`) | Undo's refusal to remove a man | LINES | **had no test** — written: `state/roster-restore-inputs.test.ts`, red with the view blanked |
| The deleted men who still have an input (`ui/InputsPage.tsx`) | the Inputs List's Person filter, "Deleted" | LINES | **had no test** — written: `ui/inputsdeleted.test.tsx`, red with the view blanked |
| What the parity tests push into the reference page (`testing/refwin.ts`) | the two parity gates | LINES | `parity.test.ts`; the original's own 728 assertions |

**MUST NOT read lines — each reads the stored input, and why** (the survey had listed the first three as per-person
readers; corrected there):

| The reader | Why it reads the record |
|---|---|
| The medical lists and trim plans (`medical.ts`) | it hands its records to the one body that trims them and tells them apart by identity; on copies a medical trim would act on the wrong input |
| The bell's OIL question (`sync.ts oilPendingFor`) | it also answers for an input filed for ALL AVAIL (no line), asks who may change the input, and hands back its id for the window — step 2 (a) rewrites it |
| One man's SANS offer; the SANS day's list (`inputs.ts sansAvailOn`, `sanscal-model.ts`) | each hands the record on — to a test that holds it as the record, to the window that changes it; both find it by who is IN it |
| The CSV export | "one row an input as stored"; the Inputs pages' step |
| Everything that draws, files, counts, freezes, saves or permits the INPUT | by the rule of the plan's §4.2 — the three lists are in `src/engine/inputs-readers.test.ts` |

## 3. The sizing step (D607 — written before the walk)

1. **The type of change:** A — a rule inside shared calculations, with no new screen, control or mark; and G in one
   respect — the published face reads its issued copies through a new funnel.
2. **What only a walk could find here:** a reader that draws from the new view on one surface and not another; a
   published face reading the live inputs, or the reverse; a screen that throws on a frozen line (a write nobody
   knew about) only when the whole app runs. What the tests already cover: each reader's own answers (§5 — 439 tests
   go red with the view blanked).
3. **What the ledger says:** nine walks of rule-only changes found two faults in the change itself, at about half a
   million tokens a walker where measured; the faults in the rule were found by a test written first, a short run, or
   the reads. The record supports a smaller walk for a rule-only change.
4. **The walk chosen:** the host alone, one scripted browser, on the built bundle — but NOT a handful of scenarios
   looked at by eye. Because the claim is "nothing moved", the walk RECORDS the running app before and after and
   compares the two records byte for byte: every schedule surface, the rules' own outputs, the Inputs pages, the SANS
   calendar, Medical and the Leave War; the demo week, the week after it, a published Monday with inputs filed after it
   went out; a desktop and a phone; the admin and the member view. No control is pressed beyond signing in, signing
   and publishing a day, and moving between pages — the step adds no control, so there is no door to operate; that is
   the one thing this walk does not do, and the job's own check does. Carried by tests, not the walk: each reader's
   answers case by case (the existing suites of §5).
5. **After the walk:** its row is in `docs/walk-ledger.md`.

## 4. The walk — the running app recorded before and after, and compared

**The scripts** (`scripts/handpass/`): `onerule-surfaces.mjs` records a build; `onerule-compare.mjs` compares two
records. The clock is held still and the random numbers are seeded, so every id the app mints and every "placed by … at
…" stamp repeats; the world is the demo plus fifteen inputs filed to make the rules speak — leave on a flying day, a
meeting across a sortie, an appointment across midnight, a man grounded who may still work, three days away, two SANS
offers, a Training for three on the Saturday, ALL AVAIL on a Saturday Duty, an all-day Meeting for ALL, ALL AVAIL on the
Sunday evening; then Monday signed and published through its own controls, and two more inputs filed on it afterwards.

**First, the comparison itself was proved quiet:** two runs of the build BEFORE the change — identical, every record.

**What is recorded, in each of three worlds (the demo week · the same with Monday published · the week after):**
the week read into events (each day's list of inputs among it); the warning list; why each of 63 people may or may not
take each place the week draws; each day's OIL evidence (the ALL AVAIL crowd in it); View-only Sched; Edit Schedule;
the crew list at rest and with a flying seat, a ground row and a duty desk armed; the Scheduler Board of each day. Once:
the member view of the published week; the Inputs calendar and List (July); the SANS calendar and an opened day
(July); Medical; the Leave War's whole year. On a phone's width: the two weeks, a board, the Inputs page.

**RESULT — IDENTICAL.** Before against after: 55 records, 5,199,604 characters, byte for byte, and three more set
apart (below). Before against before, two runs of one build: all 58 records identical.

**The one difference, set apart and shown** (the plan's §4.2 — "a placeholder entry makes no line"): an input filed
for ALL AVAIL / ALL that keeps its own voice (an all-day one; a timed one read across the week's edge) used to stand in
the rules' list of a day's inputs under the placeholder's own id, where no rule ever matched it to a man and no screen
drew it. In the record: five such entries, from two inputs, in the build before — the all-day Meeting for ALL on the Tuesday
(in Tuesday's list and its whole-day list, and as the midnight tail of the Monday before and the Wednesday after), and
Sunday evening's ALL AVAIL Training as the tail of the next week's Monday — and none in the build after. Around them every warning, every reason, every OIL figure and every screen is identical.

**What the pictures show** (`docs/img/handpass/2026-10-12-one-rule-step1/`, taken from the build AFTER; opened by the
host): Edit Schedule with Monday's 23 issues and the crew list struck where a man
is away; View-only Sched with Monday published as it went out (23 issues) while its board's working copy reads 24 with
"2 pending" — the leave filed after it went out shows on the working copy only, which is the published face reading its
own copies; the Saturday and Thursday boards; the Inputs calendar for July with the three-man Training and the ALL
AVAIL bars; the SANS calendar for July with its counts and Monday's two men committed to fly; Medical with three down;
the Leave War; four phone screens. 20 pictures; 12 opened. `steps.txt` beside them is the run's own log of what it filed
and where each step landed.

**Browser errors during the walk:** none, in every run.

## 5. The break tests — is each moved reader really covered?

The view was blanked on purpose (it answered nobody) and the whole unit suite run: **82 test files and 439 tests went
red** of 592 files and 10,119 tests — the rules (overnight, a seat with no times, the audits, parity), who is away and
"may he take it?", the 7-day run, the crew list, the ALL AVAIL crowd and OIL, forty Leave War files, the SANS counts,
the published face. Two readers turned nothing red — "is he still named in an input" and the Inputs List's "Deleted"
group: no test, by proof. Each now has one, red with the view blanked and green with it back, and each with a case for
a man who is one of several people in an input. The view was then restored byte for byte.

## 6. The timings (the plan's §4.2; Fable F10)

`docs/performance.md` ledger 27 has the table. On the built bundle, a phone's width, four times' slowdown, 8 runs of the
build before against 5 after: everything a person does is the same or faster — a puck dropped on a seat, to the screen,
251 → 247 ms (385 → 375 with 303 inputs); the whole week redrawn, level; the crew list with a seat armed 17.1 → 10.0
(68.7 → 42.9); the rules pass 16.6 → 15.3 (45.8 → 39.5). One cost is left and is not a thing the app does in bulk: a
single "may he take it?" asked on its own copies that day's inputs — about a tenth of a millisecond more at four
times' slowdown with 303 inputs. The app's own speed gate: 4 passed, the same node counts before and after.

The first cut was slower in three places — the crew list at rest, a Saturday with ALL AVAIL, the week read into events
on its own — each found by the paired runs and fixed before this sheet was written (the ledger says how).

## 7. What the check found, and each disposition

| # | What | Disposition |
|---|---|---|
| 1 | The survey listed the medical tracker as a per-person reader; it hands its records to the body that trims them | left reading the record; survey corrected; on the guard's "records" list with the reason |
| 2 | The same for the bell's OIL question, one man's SANS offer, the SANS day's list and the CSV export | the same |
| 3 | A rules reader wrote an id onto what is now a read-only line (an existing test caught it) | fixed: it asks only where the request has an id — the answer is the same, nothing is written |
| 4 | The Inputs List's "Deleted" group — a per-person reader the survey missed | moved onto the view, with a test |
| 5 | Two moved readers had no test at all | tests written, red first (§5) |
| 6 | Three places measured slower in the first cut | fixed, measured again (§6) |
| 7 | The recorder first recorded the SANS calendar on an empty April — both builds equally empty, so the comparison passed and proved nothing there; found by opening the picture | the recorder now steps to July by the calendar's own heading and says where it landed; both builds recorded again |

Nothing was found in the running app.

## 8. What was NOT walked, and why

- **No control was operated** beyond sign-in, the four sign-offs, Publish, and moving between pages: step 1 adds no
  control and changes none. Drags, drops, the armed tap, the input's window, OIL Earn's switches, the ALL AVAIL window:
  not driven here — the browser suite drives them (it passed), and the job's own check walks them.
- **The bell** — its reader was left on the record, unchanged.
- **The Tracker, Quals, Logic, Admin** — nothing they read was changed.
- **Another browser engine** (his iPhone's) — nothing drawn changed, so nothing new to see there.
- **The reads by a second model** — owed at the job's check (§1).

## 9. The gates

The whole set, in one run under the PC's lock with nothing else running, on the code of this step (12 Oct 26):

| Gate | Result |
|---|---|
| unit | **10126 / 10126** (594 files) — 37 of them new: the view (24), the guard (6), the two readers that had none (7) |
| build | clean |
| the original's own assertions (tfin) | **728 / 0** |
| the browser suite (e2e) | **768 passed, 0 failed**, 57 skipped |
| the Tracker's suite (smoke) | **445 / 0** |
| rulecheck | OK |
| docsize | OK |

And the app's own speed gate (`npm run perf`), on the build before and the build after: 4 passed each, the week 5131
nodes and the board 1018 in both. **No existing test file was changed** — the two that objected (§7, rows 2 and 3) were
right, and the code was changed to meet them.

## 10. For his look

Nothing on screen has changed, so there is nothing to look for. If he wants to look anyway, three places the changed
code feeds: a day's issues list on Edit Schedule, the crew list with a seat armed (the reason under each struck name),
and the Leave War's leave and medical cells — each should read exactly as on the live app.

`Walk: docs/handpass/2026-10-12-one-rule-step1.md · 20 pictures (12 opened) · 11 surfaces recorded in 3 worlds, before and after, and compared byte for byte · 2 orders (before publishing; after publishing, with inputs filed since) · MISSING: 2 readers with no test — fixed`
