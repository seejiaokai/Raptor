# Narrow code read — ALL AVAIL and the post-in date (his D2328), 22 Nov 26, chat 141

You are a reviewer. Read only; change no file of the app. You have not seen any other reader's report or any walk
report, and you must not look for one. Report in plain text.

## What to read

- The change: the patch `D2328.patch` at the root of this copy (two files: `raptor-port/src/leavewar/sync.ts`, function
  `availableFor`, search "WHETHER HE IS STILL OURS"; and its tests `raptor-port/src/leavewar/allavail-sans-posted.test.ts`).
  The copy holds the code AFTER the patch.
- What it calls: `raptor-port/src/leavewar/engine/people.ts` (`inSquadron`, `atHome`, `inWindow`),
  `raptor-port/src/leavewar/state/store.ts` (`windowFor`, `setPostIn`, `stintClosed`, `postOuts`, how `state.people` is
  projected and when a SANS man has no row), `raptor-port/src/engine/people.ts` (`sansOnP`).
- Who calls `availableFor`: `raptor-port/src/engine/oilev.ts`, `raptor-port/src/ui/oilmode.ts` (through
  `HOOKS.oilSentinel`). The crowd is frozen into a day when it is published and decides OIL (earned leave, time off
  banked — never pay).

## The rule the change builds — copied from the ruling's full row

D2328 (owner, 22 Nov 26), in his words: "the sans should left out until he becomes a SANS. This modality should be
applied for post in and out. Like they should only reflect their actual status on the day itself" — said of this case,
shown to him on the app: a new man whose post-in date is Fri 17 Jul, ticked SANS, named on Thu 16 Jul's briefing, whom
ALL AVAIL counted on Thursday. The rule as recorded: **a man shows on any day by what he actually is on that day, for a
posting in as for a posting out: before his post-in date he is not ours — a SANS man named on our programme included, so
ALL AVAIL leaves him out until that date — and a posting out changes him only from its own date.**

Rulings it sits beside (each from its full row in `.claude/decisions-full/`; open a row before relying on its detail,
`grep -h '^| D308 |' .claude/decisions-full/*.md`):
- D27: a SANS man counts in the ALL AVAIL crowd only when he is planned on our programme that day.
- D283: posted out as SANS, he becomes SANS on the posting date and still flies with us.
- D2313, D2327: a man counts as SANS only from the date his SANS starts; a tick by hand counts from the day it is made.
- D327: an archived man stays in the crowd of every day before his archive.
- D297: a deleted man is read by date. D303: a posting with no chip is "off the manpower" from its date.
- D308: the Leave War counts a man from his post-in date.
- D25, D44, D45: OIL is owed; nothing on a published day changes without the scheduler acknowledging it.
- The host's reading (a question, not a requirement): the "+ SANS" switch on the Leave War is a display choice and must
  never change who ALL AVAIL counts.

## What changed, in words

1. The saved posting (`getState().postOuts[id]`) is now read whether or not the war shows the man a row. Before, it was
   read only where he had a row; with "+ SANS" off an ordinary SANS man has no row, so nothing was asked of him.
2. For a man who is SANS that day and named on our programme, the post-in date and earlier stints are now asked, by
   `inSquadron`; only the END an archive wrote is still set aside, replaced by the archive's own date.

## What to answer

1. Is the change right and complete for D2328? Name every state of a man in which ALL AVAIL would still count him on a
   day before his post-in date, or leave him out on a day he is ours.
2. What did it break beside it? Walk each state the function already handled and say whether its answer changed:
   a regular with and without a posting record; a posting out with each outcome (SANS run, SANS to come, Overseas Sqn,
   Delete, no chip), before and after its date; a man with earlier stints (posted out, back with a post-in date);
   an archived man (after a SANS posting, after a hand tick, with no archive date kept); a deleted man; a man of another
   squadron; a man with squadron stints (`home`); the war holding no row for him.
3. Does any answer now differ between "+ SANS" on and off? Name the state.
4. What is missing from the tests — a state above with no test, or a test that would pass with the change taken out?
5. Reading `{ ...(lw0 || posting), ...windowFor(posting, true) }`: can the saved posting record carry a field that the
   display row would not, and that changes `inSquadron`'s answer? Can `postOuts` hold a record for a man who is not on
   this squadron's roster, or a stale one?

For each finding give: the exact state (who, which dates, which switch), what the app does, what the rule says it
should do and which ruling says so, and the exact fix — the lines to change and the test to add, step by step.

## What is NOT a finding — do not report these

- A problem that lives only in data already stored, where the code is right for new data (D56): the store is demo data.
- Already filed, known and left for other work: (m) a SANS posting, then SANS unticked on Quals, then an archive days
  later — the days between lose him (a test marked `it.fails` holds the proof); (n) the crowd reads the Leave War that
  is loaded, not the schedule's own squadron's; (p) a SANS posting dated ahead stays a departure until its date arrives
  and the posting runs — put to the owner as a question; (r) other screens that still show a man before his post-in
  date (the Scheduler Board's crew list).
- Tidiness, naming, comment wording.
