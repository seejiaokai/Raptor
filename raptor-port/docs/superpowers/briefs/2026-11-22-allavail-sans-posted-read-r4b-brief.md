# Narrow code read, round 4b — ALL AVAIL, a man posted out as SANS, the post-in date, a SANS posting set ahead (his D2328, D2329), 22 Nov 26, chat 146

You are a reviewer. Read only; change no file of the app. You have not seen any other reader's report or any walk
report, and you must not look for one. Report in plain text.

## What to read

- The change: `FIX-DIFF.patch` at the root of this copy = `git diff 1f3e52eb4 <head> -- raptor-port/src`. The copy holds
  the code AFTER it. Three parts:
  1. `raptor-port/src/leavewar/sync.ts` `availableFor` (search "WHETHER HE IS STILL OURS" down to `out.push(id)`): who the
     ALL AVAIL crowd counts on a day. `flewAsSans` and `sansAhead` are new since the last read.
  2. `raptor-port/src/engine/people.ts` `sansOnP` / `setSansAhead` / `sansSig`;
     `raptor-port/src/leavewar/sync.ts` `sansAheadOf` (installed by `wireLeaveWarSync`), `savedSansRun` and the archive's
     `sanPo` write in `archivePerson`; `raptor-port/src/engine/schema.ts` `sanPo`.
  3. `raptor-port/src/leavewar/state/store.ts` `arrivalKept` and its two callers — `forgetPersonFrom` there and
     `deleteOnForeign` in `sync.ts`: what a delete keeps of a man who never arrived.
- Their tests: `raptor-port/src/leavewar/allavail-sans-posted.test.ts`, `d2328-read.test.ts`, `d2328-astra.test.ts`,
  and the changed expectations in `deletednorow.test.ts`, `multi-sqn-a3-foreign.test.ts`, `sans-from-date.test.ts`
  (each carries a "CHANGED 22 Nov 26" note with its reason).
- What they call and who calls them: `raptor-port/src/leavewar/engine/people.ts` (`inSquadron`, `outcomeOf`),
  `raptor-port/src/leavewar/state/store.ts` (`windowFor`, `stintClosed`, `personCut`, `setPostOut`, `postOuts`),
  `raptor-port/src/leavewar/sync.ts` (`postOut`, `takeBack`, `runPoOutcomes`, `archivePerson`, `restoreArchivedPerson`).
  Every reader of `sansOnP` with a date — `engine/avail.ts`, `engine/faceattrs.ts`, `engine/publish.ts attrsOf`
  (what a published day froze of each man), `engine/validate.ts` (the SANS availability check), `state/flyplan.ts`,
  `ui/sanscal-model.ts` — now sees a SANS posting set ahead. The ALL AVAIL crowd is frozen into a day when it is
  published and decides OIL (earned leave, time off banked — never pay).

## The rules — copied from the rulings' full rows (open a row before relying on its detail:
`grep -h '^| D2329 |' .claude/decisions-full/*.md`)

- D2328 (owner): "the sans should left out until he becomes a SANS. This modality should be applied for post in and
  out. Like they should only reflect their actual status on the day itself." Recorded: a man shows on any day by what he
  actually is that day; before his post-in date he is not ours, a SANS man named on our programme included.
- D2329 (owner): "on 15 jul hex is put to post out on 17 jul. on 18 jul he is planned to be on a briefing … So from 15
  -16 jul he should be counted in all avail assuming that he available. On 18 jul if he is not planned for anything,
  hes not going to be counted in all avail. but if hes planned like briefing, hes going to be counted in the all avail.
  assuming that the timing is deconflicted." Recorded: a posting out as SANS set ahead is read by the day — before its
  date the ordinary man; from it SANS, counted only on a day a scheduler put him on our programme, times clear —
  "whenever that day is looked at" (the agent's reading, told to him): a Saturday seen or published on Wed 15 Jul
  already counts him and does not turn pending when Fri 17 Jul arrives.
- D27: a SANS man counts in the crowd only when planned on our programme that day. D283: posted out as SANS he becomes
  SANS on the posting date and still flies with us. D2313, D2327: SANS only from his SANS date, on every screen; a hand
  tick counts from the day it is made; "Undo post out" wipes the posting's SANS days, an untick or an archive keeps them;
  who may be FILED for SANS availability goes by who is SANS today. D327: an archived man stays in the crowd of every
  day before his archive. D320, D323: every stint kept; an unstarted stint was never occupied. D297: a deleted man read
  by date. D308: counted from his post-in date. D25, D44, D45: OIL is owed; nothing on a published day changes without
  the scheduler acknowledging it. The "+ SANS" switch on the Leave War is a display choice and must never change who
  ALL AVAIL counts (the host's reading).

## What changed, in words

1. A man posted out as SANS and then archived — still archived, or restored with a later post-in date — keeps the days
   he flew with us between his posting and his archive: the archive writes those days from his saved posting onto him
   (`sanPo`, in `archivePerson`), and a day inside them counts him if he is SANS and named that day (`flewAsSans`). The
   blanket "an archive's end is replaced by the archive's date" is gone. (For a Fable read, from chat 146's second
   copy: part 1 is read as it stands at the copy's head.)
2. A man deleted before he ever arrived keeps his post-in date as a saved record (`{ from, to: null, gone: true }`), so
   the days before it are not counted.
3. D2329: a SANS posting saved and not yet run makes every day from its date a SANS day for every day-reader (through
   `setSansAhead`), and in `availableFor` his posting closes no window on such a day.

## What to answer

1. Is each part right and complete for its ruling? Name every state of a man in which ALL AVAIL would count him on a
   day he is not ours, or leave him out on a day he is.
2. Part 3 widens what every day-reader of SANS sees. For each reader named above, does a SANS posting set ahead now
   change something a person sees or a published day keeps — a warning raised or dropped, a puck's SANS mark, the SANS
   calendar's need, a day turning pending — in a way the rulings above do not ask for? Is there a reader that should
   see it and does not (one that reads `p.san` or the posting by itself)?
3. What did the three parts break beside them? Walk the states the function handled: a regular with and without a
   posting record; each posting outcome (SANS run, SANS to come, Overseas Sqn, Delete, no chip), before and after its
   date; earlier stints; an archived man (after a SANS posting, after a hand tick, with no archive date kept); a deleted
   man; another squadron's man; squadron stints (`home`); the war holding no row; a posting moved, given another
   outcome, taken back.
4. Does any answer differ between "+ SANS" on and off? Name the state.
5. The kept record of a man deleted before he arrived: does any other reader of `postOuts` (the posting pass, the bell
   lines, Approvals' refusals, Admin → Users, the posting tag, undo) now behave differently for him?
6. What is missing from the tests — a state with no test, or a test that would pass with the change taken out?

For each finding give: the exact state (who, which dates, which switch), what the app does, what the rule says it
should do and which ruling says so, and the exact fix — the lines to change and the test to add, step by step.

## What is NOT a finding — do not report these

- A problem that lives only in data already stored, where the code is right for new data (D56): the store is demo data.
- Already filed and left for other work: (m) a SANS posting, then SANS unticked on Quals, then an archive days later —
  the days between lose him (an `it.fails` test holds it); (n) the crowd reads the Leave War that is loaded, not the
  schedule's own squadron's — and so does part 3's look-ahead (a posting saved on another squadron's war is not seen);
  (r) other screens that still show a man as ours before his post-in date (the crew list); `[ALL-AVAIL-WINDOW-FLAGS]`
  (the window's flags), `[ALL-AVAIL-REMOVE-BY-HAND]`.
- Tidiness, naming, comment wording.
