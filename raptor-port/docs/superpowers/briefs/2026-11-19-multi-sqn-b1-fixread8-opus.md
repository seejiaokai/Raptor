# Fix read 8 — the fresh Opus reader's report (blind; 19 Nov 26, chat 117; copy at `71fdfbfd5`)

Saved whole as handed back; not yet reproduced by the host. The reader's proofs were kept at
`fr8-opus-probe.test.ts.txt` in chat 117's scratch folder.

---

Fix read 8: the fresh Opus reader's report. Multi-squadron batch 1, the fixes U, M, P, T, F, S and Q, at 71fdfbfd5.

I read the brief, FIXES.patch, FIXES-LOG.txt and the full code of the gate's bell sections (state/perms.ts `toldBy`, `filerMarkOk`, `lineRewritten`, `lineNotNow`, `inputLineUnlike`, `noticesBefore`, `followUpOf`, `adminOwnerViolation`, and the member door). I also read state/notices.ts (`noticePass`, `filerUnits`, `toldIn`, `adminThen`, `noticeLeftBell`, `noticeAboutHim`), sched-commit.ts `tellPass`, leavewar/sync.ts `followUpsOwed` and `warNoticesReversed`, undo/timeline.ts `verifiedReplay`, units and accounts. No handoff block was pasted. I did not open any of the excluded fixread8, walk or fixes-brief files.

The proofs were put temporarily in `src/leavewar/zz-fr8probe.test.ts`, on the fixread7 test's harness. All 8 ran red, and the file has been deleted. A copy is at `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\4ba97a8c-53ce-4953-9329-22091bb17342\scratchpad\fr8-opus-probe.test.ts.txt`. The builder's `multi-sqn-fixread7.test.ts` runs green, 23 of 23.

## Findings, ranked by consequence

### 1. Q brings back the case fault C closed: a filer who has moved is told again, and his old line stays on his bell. Medium. Introduced by Q.
- **Failure 1:** Hunter (142) files Ranger's LL 23–27 Jul on 15 Jul. Ranger's move to 149 is saved from 25 Jul, and Hunter moves to 149 from 16 Jul. On 17 Jul Saber changes the remark, and Hunter is told. D2225 says "a moved filer is still no longer told". Before Q, Ranger's home today (142) decided it and Hunter was not told. Probe Q-1 is red.
- **Failure 2:** a line Hunter got on 15 Jul, before his move, now carries the mark ['u142','u149']. On his move day the code asks whether he is told in those squadrons, finds his new home 149 among them, and keeps the line. D2218 says the old squadron's lines leave on the move day. Probe Q-2 is red; before Q the mark was ['u142'] and the line left.
- **Cause:** `filerUnits` now gathers the named man's homes over all the input's days, and the mark (`fu`) is that union. `toldIn` then counts the filer's own current home (`mine`) against it. On a move day his new home can be in that union.
- **Fix:**
  1. Write as the mark only the squadrons he was told through: his home today if it is in `filerUnits`, plus the squadrons there he is admin, master or Plan of.
  2. In `filerTold`, count his home only if it is the same as his home on the day the input was filed (the input's `at`). A filer who has moved since then is told only through a right he holds.
  3. In `noticeLeftBell`'s check of the mark, judge each move day with `adminThen` only, never `mine`, since on a move day he has by definition left his old home.
  4. Add Q-1 and Q-2 as tests.
- **Ruling:** this is my reading of D2225 ("a moved filer is still no longer told"). D2223's older words "while he is still that man's admin" could be read the other way, so if the agent doubts it, it is his question.

### 2. P is incomplete: a right given on the move day itself still brings the retired line back. Low to medium. P's gap.
- **Failure:** Hunter moves to 149 from 16 Jul. On the morning of the 16th the line is off his bell. That same day Saber gives him Plan of 142, or the master mark, and the line comes back, read or unread. Probe P, four cases, all red.
- **Cause:** `adminThen` uses `g.from <= iso` and `masterFrom <= iso`. A move takes effect from the start of its day, so a right given on that day was given after the move.
- **Fix:** change both comparisons to `<` (strictly before the move day). A right given the day before the move still counts. A right with no date still counts from always (D56).

### 3. Nothing checks a grant's day or the master mark's day. Low. Introduced by P, which added the fields.
- **Failure:** on 18 Jul, after Hunter's move, Saber saves a Plan grant for him backdated to 1 Jan 2000. `ownershipViolation` allows it, and Hunter's retired 142 line comes back. Probe P2 is red.
- **Cause:** the gate's unit-row check accepts any valid date in the grant's `from`. The account check lets a master write any `masterFrom`.
- **Fix:**
  1. In the unit-row check, for a grant row, require `from` to be today when the grant is new or its level changes, and unchanged otherwise. A restore's verified replay is exempt.
  2. In the account check, require `masterFrom` to be today when the mark is switched on, absent when it is off, and unchanged otherwise.
- **Who can do it:** only an admin of that squadron, or a master. The harm is limited to bringing back his own squadron's old lines.

### 4. T's backstop hides a line from a man who never moved. Low. Introduced by T.
- **Failure:** a line about Ranger's own leave dated 10 minutes ahead (the clock set back after writing, or another clock) counts as "left" for Ranger, who never moved. It is off his bell, out of his unread count, and missed by the posting take-back and the restore's `leaveOut`, until the clock catches up. Probe T is red.
- **Cause:** the date check in `noticeLeftBell` returns "left" before it asks whether he moved or whether the line is about him.
- **Fix:** return "left" for a line dated ahead only where he has a home change on or before today, and the line is a mark-carrying input line or not about him. Otherwise fall through to the normal rule.
- **Why low:** the gate already refuses a new line dated ahead, so this matters only for lines stored before the fix, which D56 sets aside, and for a clock that is set back.

## Explicit negatives, with reasons
- **U:** the member's restore delete passes only with the timeline's word on that very change, or the old `toldBy` test, and still needs his own line on an input the restore changes. A forged restore is refused, as the control test shows. A Redo that would put back a line to a filer who has since moved: `leaveOut` drops it first (D2218), so the Redo is not refused. Nothing found.
- **M:** the only writer of a line naming an input is the notice pass. Every other writer (war lines, holiday, posting and posting take-back lines) has no input on it, so `inputLineUnlike` does not touch them. No app code rewrites a line already written, so `lineRewritten` breaks no normal work. On builder choice 1, the registry:
  - It is keyed by the command's own envelope object (a WeakMap), which is also the object the gate receives.
  - It is written only by `tellPass`. Each run of the pass clears and refills it, and it dies with the envelope, so it cannot carry across commands or survive a failed command.
  - Two limits: it vouches for a line's id, not its content, and the server cannot reproduce it at the database step. So it is a stand-in for the check, not one the database can keep. To note in the file for the database step, not to fix now.
- **T:** every writer uses the current time (the posting writes now minus a few milliseconds). Restores are exempt through the timeline's word. Changes from another device run as the system, so the admin section is skipped. On choice 2, an existing line keeping its time is sound because `lineRewritten` refuses any change of that time.
- **Choice 3, the re-dated fixtures:**
  - I re-ran `m4sec` with its line undated: it goes red ("…(notices/n1)" matches /notice/), so that test still proves what it did.
  - The re-dated `job2-bell` lines are still checked against the exact refusal words.
  - `units-sqn-fixread2`: the line given `iid: ''` still proves the squadron rule; the master's line given its mark still proves the master passes.
  - Nothing lost.
- **F:** the writer and the gate call one function. The gate rebuilds the bell as it stood before the command (`noticesBefore`) and reads the read record as saved. The writer runs after the restore's deletions, so for "again" lines both see the same set. The tie-break by list order can differ from the writer's in one case only: two "again" lines with the same time, one of them touched by the command. That is too rare to rank.
- **S:** posting lines carry no input, so the new requirement never applied to them, and `lw.postoutRun` runs as the system. No regression.
- **Q, choice 5:** an input whose date cannot be read falls back to today, the same as `inputCoversDate`. An input spanning two years is out of reach of both alike.
- **P, choice 4:** `masterFrom` is kept by every rebuild of an account row (`masterOf`) and by the loader. The first-admin row written at boot has no day, which is correct because there are no earlier lines. A unit's first grant made by `units.ts` without a day can never be among an old line's squadrons.

Rulings: none this session (read only).
Not a finding, and set aside: anything only in data already stored (D56).
