# Code-read brief — ALL AVAIL counts a man posted out as SANS who is planned with us, whatever "+ SANS" says ([FABLE-READ-FAULTS] (i))

**For:** each code reader, alone — you have seen no other reader's report and no walk report, and you do not look for
one. **Job:** read the FINISHED code of this fix and say what is wrong or MISSING. You did not write it. Read only;
change no file of the app. A proof test you write goes in your own scratch folder (named in your task), never under the
app's source. State each finding in your output the moment it is confirmed, so a stopped run keeps it. If a handoff
block is pasted into your chat after a compaction, do not read it, and say so in your report.
**Written:** 22 Nov 26, chat 141. The app is under `raptor-port/`. You read an exported copy of the commit named in your
task; the branch's handoff block and this round's evidence sheet are taken out of it on purpose.

## The promise — copied from the owner's rulings (full rows in `.claude/decisions-full/`)

- **[ALL-AVAIL-REDEF], carried by D27** (`scheduler.md`): the 21 Sep ruling "settled WHO counts as available (no ground
  crew, a SANS man only when planned with us, ATT B in, a time clash out)… Same membership rule, one body."
- **D283** (`people-accounts.md`): "A man posted out as SANS: on the posting-out date he becomes SANS. With "Show SANS"
  off, the Leave War still shows him, marked posted out, and does not track his leave; with "Show SANS" on, he moves
  into the SANS group that day and his leave is tracked there." ("Show SANS" is today's "+ SANS" group — D1215.)
- **D2313** (`people-accounts.md`): "A man counts as SANS only from the date his SANS starts, on every screen, and days
  before it are untouched". **D2327:** "A SANS tick an admin takes off on Quals and later puts back counts from the day
  it is put back: the days in between stay an ordinary man's".
- **D142** (`oil.md`): "A day's OIL comes from its latest published version". **D25:** OIL is earned leave, owed all the
  same. **D44, D45, D103** (`scheduler.md`): nothing on a published day changes without the scheduler acknowledging
  it; a change that shows as pending takes the four sign-offs.
- **D303:** a posting with no chip chosen is "off the manpower, nothing else". **D327, D320:** an archived man stays in
  the ALL AVAIL crowd on every day before his archive, out from it on; every stint a man has is kept.
- **The host's readings (questions, not requirements — rule each supported / contradicted / the owner's to decide):**
  (1) the Leave War's "+ SANS" switch is a display choice and must never change who ALL AVAIL counts, a published day's
  state or anyone's OIL; (2) a man posted out as SANS whose SANS tick an admin then takes off by hand is an ordinary
  man of ours again on those days and counts in ALL AVAIL, named or not, though the war with "+ SANS" off still draws
  him posted out; (3) a SANS posting dated ahead, not yet run, is still a departure for days past its date until it
  runs — as before this fix, with "+ SANS" on or off.

## What changed

One reader: `raptor-port/src/leavewar/sync.ts` `availableFor` — the lines that build `lw` before `inSquadron(lw, iso)`,
and the `postings` constant at the function's head. It now lays the man's SAVED posting (`getState().postOuts[id]`) on
the war's row the one way, `windowFor(posting, true)` (`raptor-port/src/leavewar/state/store.ts`), instead of asking the
row as the "+ SANS" switch shaped it. Tests: `raptor-port/src/leavewar/allavail-sans-posted.test.ts` (13; 5 failed
before the change). Nothing else under `src/` changed. Compare with the commit before: `git diff HEAD~1 -- raptor-port/src`
is not available in the copy — the old lines were `const lw = lwById.get(id)` then `if (lw && !inSquadron(lw, iso)) continue`.

Read with it: `store.ts` `windowFor`, `setPostOut`, `markPostingDone`, `setPeople`, and how `postOuts` is kept in step
(`windowRecord`); `sync.ts` `reprojectRoster` (the lines round `windowFor(rec, st.showSans)`), `runPoOutcomes`, `postOut`,
`undoPostOut`, the take-backs; `leavewar/engine/people.ts` `inSquadron`, `atHome`; `leavewar/state/raptorRoster.ts`
`projectPeople`; `engine/people.ts` `sansOnP`; the crowd's callers — `engine/oilev.ts` (every `HOOKS.oilSentinel`),
`ui/oilmode.ts`, `engine/publish.ts` (the kept crowd and what reads pending), `sync.ts runOilPass`. The area rules:
`.claude/rules/decisions/oil.md`, `leave-war.md`, `people-accounts.md`, `scheduler.md`; the seam:
`.claude/rules/seams/leave-war.md`.

## What to look for

1. Is the fix right and complete against each ruling above? Name any state of a posting, a person or the war in which
   the crowd is now wrong, or still depends on the "+ SANS" switch: a posting to come, one that ran, one whose date
   moved earlier or later after it ran, one undone, a second stint (post in after a posting), a man archived, restored,
   deleted, a ground-crew man, a man with no war row, a man of another squadron or moved between squadrons (his
   squadron stints, `home`), a war of another squadron loaded, a week other than the one on screen, a published day
   compared again after a reload.
2. **What is MISSING:** who else asks the war's display row (`getState().people`, its `from` / `to` / `past`), or
   anything else the switch shapes (`projectPeople(showSans)`, `displayRoster`, the groups), a question whose answer
   reaches the schedule, a published day, a warning, a count or OIL? Name each with its file and function and the
   exact steps that show the switch changing its answer.
3. Is `postOuts[id]` always the truth `windowFor` should read — can it be stale, absent while the row carries a window,
   or present while the row is not (an archived man)? What does the changed path no longer run that the old one ran?
4. Does a published day's kept crowd still compare equal after the fix in every case it did before (nothing reads
   pending that did not), and does a day published under the fault now read pending — and is that right by D44, D142?
5. The tests: do they prove what their names say, would each fail without the fix, and what case has no test?

## What is NOT a finding

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. A scheduler is always an admin (D785).
Already filed, not to be raised again (`OUTSTANDING.md` `[FABLE-READ-FAULTS]` (g), (h), (j), (k), (l)): the readers still
on today's SANS tick for past dates (the Inputs calendar's opened day, the SANS day's pucks and Highlight, the Leave
War's Available rows, the "Several people" picker); the pending list crediting a SANS change to a later untick's author;
a posting's take-back after a hand untick; "no longer SANS" of a man not SANS yet; a member's own-row command writing
SANS dates.

## What to hand back

Each finding: the concrete failure (exact steps or the exact test input), its cause (file, function, line), and exact
step-by-step fix instructions — not a direction; say whether it is new with this change or older. A claim with no
concrete failure is not a finding (D489). Explicit negatives: "I checked X and found nothing", for each numbered point
above. A tidiness note on the changed lines only, three questions (is it clear, is it in the right place, does it repeat
something), no size number — filed, not fixed. If you can run tests, say which you ran; if you cannot, name the exact
input you would run and the host will run it.
