# Round 3's fixes on the SANS words job — builder's report (Fable, for chat 169)

```
Status: READY FOR INDEPENDENT REVIEW
Commit: 0e59ea5f3 (local, not pushed) — "Chat 169: round 3's fixes — …"
```

**Read this first — three things the host should know before the readers start**

1. **HEAD is detached.** The checkout is not on `claude/allavail-sans-postout-141`; that branch's ref is still at
   `ee57cdf79`, and the host's own five commits since (to `a806d7372`) and my commit (`0e59ea5f3`) sit on a detached HEAD
   on top of it. I committed where the host has been committing. Nothing is lost, but the branch ref must be moved to
   `0e59ea5f3` before a push.
2. **D2560 read to the letter changes four answers the older tests pinned** (the "coordinator's reading 1", which was
   never his ruling). They are listed under "Where the new rule changes an answer" — the host should decide whether any
   needs putting to him. None was guessed silently: each is pinned by a test that says which way it changed and why.
3. **A clean full unit run is still owed** (see the last section). The first full run had one failure, in a timing test
   of a file this change does not touch, which passes alone; the second was queued behind chat 170's lock for about 20
   minutes and I stopped it unrun.

---

## Fix 1 — D2560: the hidden planning mark removed whole

**What changed**

- `src/leavewar/sansunfiled.ts` — gone: `PLAN_PFX`, `planKey`, `planOf`, `nextStamp` and `LAST_STAMP`, `sansPlanOwed`,
  `planDrops`, `planOwedBy`, `PLAN_KEY`, the `onCommit` subscriber that raised the `sans.planned` projection, and the two
  probes it installed at the gate (`setSansPlanOwed`, `setSansPlanReplay`). The file no longer imports the settings store,
  `commitProjection`, `onCommit` or `commandStream`.
- The new rule, in the same file: `readOf(ids, base)` is the set of days named by every id of that reminder in the man's
  read record; the reminder is lit when he has read none of it, or when a day it names now is not in that set. Read, it
  keeps the id he read; lit, its id is `sansdue:<pid>[:<n>]~<iso>,<iso>…` — the days it names. `dueRead` (what the
  take-back line and the gate's `sansBackCovered` ask) is the same question without the stamp: a day it names is one he
  read.
- `src/state/noticeseen.ts` — new exported `reminderDays(id)`: the dates after the `~`, each checked to be a date, anything
  else ignored (the record is the man's own to write, so nothing in it is trusted). `keepReminders` folds his reads into
  one id a reminder naming every day he has seen, with no number after each day. A record saved in the old shape
  (`2026-07-18.<stamp>`) reads as its days.
- `src/state/perms.ts` — `sansPlanViolation`, `SANSPLAN_OWED`, `SANSPLAN_REPLAY`, `setSansPlanOwed`, `setSansPlanReplay`,
  `SANSPLAN_ID` and the call in `ownershipChecks` are gone; a short note stands where they stood. The gate no longer
  reads `causedBy` for this.
- `src/state/people-settings-commit.ts` — `'sansplan:'` out of `SETTINGS_ROW_PREFIXES`; the bare-write guard for it gone.
- `src/storage/keyowner.ts` — `'sansplan:'` out of the community prefixes.

**Why this closes Astra F1, SEC-R3-1 and SEC-R3-2:** all three went through the mark — F1 by getting the gate to accept
a forged cause for a mark, the two SEC findings by freezing the stamp's value. There is no mark, no stamp, no projection
and no cause to forge. What lights a man's reminder is now only (a) the schedule itself naming him on a day he has not
seen, and (b) his own read record, which the gate lets only him write (`notices.seen`, his own row — unchanged, and
pinned again in the new tests).

**Leftover stored rows:** a `sansplan:` row an older build stored is read by nothing. Pinned: "a mark left stored from
before: his read reminder stays read, an unread one stays one line".

**Tests that failed first** (all in the new `src/leavewar/sans-reads-r3.test.tsx`, run against the code as it stood):

| Test | One line of its failure |
|---|---|
| D2560 › a day he saw, taken off and put back (its planning undone, then planned afresh): stays read, and lists the day | `AssertionError: expected 1 to be +0` |
| D2560 › his only day taken off (the reminder goes) and put back: it comes back read | `AssertionError: expected 1 to be +0` |
| D2560 › …taken off and put back by hand, no Undo: the same | `AssertionError: expected 1 to be +0` |
| D2560 › …and once he has read that too, neither day lights it again, in any order | `AssertionError: expected 1 to be +0` |
| D2560 › his date moved earlier over a day he is planned on and never saw: that day is new to him — lit | `AssertionError: expected +0 to be 1` |
| D2560 › read through his own "Mark all read", twice over: his record keeps every day he saw | `AssertionError: expected 1 to be +0` |
| no hidden mark › planning a SANS man writes no mark | `expected [ 'sansplan:rocky:2026-07-18', …(1) ] to deeply equal []` |
| no hidden mark › a mark left stored from before: his read reminder stays read… | `AssertionError: expected 1 to be +0` |
| Astra F1 › a hand-built projection naming a completed planning as its cause, the system actor named | `AssertionError: expected 1 to be +0` (Hex's read reminder was lit) |
| Astra F1 › the public projection door, the cause written into its own envelope | `AssertionError: expected 1 to be +0` |
| SEC-R3-1 › Hex saves a read record holding a day marked 1e300 and a line of Ranger's: Ranger is still told of a day new to him | `expected [ 'sansplan:rocky:2026-07-18', …(1) ] to deeply equal []` |

Guards that passed before and after (said plainly — they could not be made to fail first): "a genuinely new day lights
it", "his date moved, no day new to him: stays read", "a filing of his deleted brings back a day he saw: stays read",
"while unread there is one line, its days following the plan", "a read record in the older shape still reads as those
days", "Hex's read record is his alone: Ranger's own read command cannot empty it".

**About the re-aimed SEC-R3-1 test.** The reader's own scenario ends with "Ranger taken off Sun 19 and put back — lit",
which D2560 now says must NOT light. So the re-aimed test asks what the brief asked: Hex writes junk into his own read
record (a day marked 1e300, and two ids shaped like Ranger's reminder), and Ranger is still told of a day new to him
(Sat 18) and still not told of a day he saw put back (Sun 19). Its failing-first line is the "no mark is stored"
assertion; the "Ranger is still told" half passed on the old code too, because the old fault needed the put-back to show.

**Older tests rewritten, none deleted**

- `src/leavewar/sans-reads-156.test.tsx` — block 1 (eight cases), R2-3 (two), R2-5 (three). Each case is kept with its
  reader's name and now pins D2560: Fable F1's and Astra #4's cases flip from "lit" to "stays read"; the writes of the old
  mark's row (Astra #1, the Opus read's F4, RR-SEC-1) no longer assert "refused" — they assert that the write, refused
  or not, lights nothing and puts nothing out; Fable F6's and R2-5's cases assert no mark is left.
- `src/leavewar/sansplan-sec156.test.ts` — SEC156-1, SEC156-2 and RR-SEC-1 the same way, and they now also try the one
  thing the reminder does read: Kestrel (149's admin) and Ranger (a member) writing Hex's read record, inside a command
  and outside one — refused each time. SEC156-3 (the untick line) is untouched.
- `src/leavewar/sans-words-156.test.tsx` — the "reading 1" and "reading 2" blocks; see the next section.

### Where the new rule changes an answer (for the host to weigh — not guessed past)

D2560's words: it lights "only for a day not in it when he last read it". The code asks exactly that of each day in the
line. The old "coordinator's reading 1" asked something else — how the day came into the line — and needed the mark to
answer. Four cases the older tests pinned come out differently, each now pinned with a comment saying so:

| Case | Before | Now | Why |
|---|---|---|---|
| He is planned Sat and Sun, Sat is filed, he reads (the line names Sun only), the Sat filing is deleted | dark | **lit** | Sat was never in the line he read |
| The same, but Sat was planned after he read, while it was filed | dark | **lit** | the same |
| His SANS date moved earlier over a day he is already planned on (the demo's Thu 16) | dark | **lit**, by that day | Thu was never in the line he read; a move that brings in no such day stays read |
| A week brought on screen that names him on days no saved week holds | dark | **lit while that week is on screen**, read again once it leaves | those days are in the line only while that week is loaded — see "Found, not fixed" 1 |

And two that follow from the rule and were the ruling's own point: a day dropped and planned again is now **read**
(was lit); and where that same day planned again is followed by his date moving past it, he is now **told** "Your SANS
date moved to Sun 19 Jul." (was no line) — because the reminder standing is one he read.

The Opus reader's Q2 (a day planned while an Undo had taken his SANS away did not light after the Redo) now lights,
for the same reason.

**Kept on purpose:** "the same posting made again is news". That is not the mark — it is the reminder's base counting
the lines that ended his SANS, and fix 2 below depends on it. A man whose SANS ended and began again gets a fresh
reminder; a scheduler moving him around a week while he stays SANS does not relight it.

---

## Fix 2 — the Opus read's O3-1: Undo then Redo of an untick

**What changed:** one exported body, `sansRetracted(x)` in `src/state/notices.ts`: a line is taken back only when the
LAST word said of it is a "taken back" — among the lines of his that name it as `back` or `again`, the latest (by time,
then the list's order: `sansLater`) is a `back`. A newer "again" copy wins. `sansunfiled.ts` imports it for `dueBase`
and `sansUndoToldNow`; its own `retracted` is deleted. The bell's `sansLineOut` uses the same body, so the bell and the
reminder's count cannot disagree (Astra's tidiness note).

**Failed first:**

- O3-1 › the same, but Saber presses Undo and Redo on the untick between — the end of his SANS still counts: lit —
  `AssertionError: expected +0 to be 1`
- O3-1 › …and twice round (Undo, Redo, Undo, Redo): it still counts, once — `AssertionError: expected +0 to be 1`

Its control (untick, then tick again, no Undo) passed before and after. The existing R2-1, R2-4 and W12-1 blocks — the
cases the old rule was written for — still pass.

---

## Fix 3 — Astra F2: a man moved squadron kept a stale reminder day

**What changed**

- `src/engine/roster.ts` — the home handle gains an optional third question, `sig()`, and `homesSig()` asks it (empty
  where nobody ever moves: the headless handle and a bare function).
- `src/state/units.ts` — hands it in: every Home row as it stands (`id:pid>unit@from`, sorted) and whose a man with no
  row is, worked out once for each set of rows (the rows object is rebuilt by every write, every Undo's reload and every
  change of the seeds), so asking costs nothing between changes.
- `src/engine/overlay.ts` — new `landingSig()`: the men deleted, the requests, the loaded week's request rows and the
  homes, as ONE signature ("a shared overlay dependency signature", as Astra asked).
- `src/leavewar/sansunfiled.ts weeksHeld` — the key is now `landingSig() | week on screen | squadron in view`. A key
  that differs replaces the whole kept entry, so both the cached days and the sets of who each day names go together. The
  skip of weeks that ended before today is untouched.

**Failed first:**

- Astra F2 › Hex moved to 149 from tomorrow, 142 and this week on screen: his Meeting on Tue 28 Jul leaves 142's week,
  and his reminder — `expected [ '2026-07-15', '2026-07-16', …(1) ] to not include '2026-07-28'`
- Astra F2 › …the move undone and redone: the reminder follows each time — `expected [ '2026-07-28' ] to deeply equal []`
- Astra F2 › …and in both squadrons' views: 149's names no day for a man who is 142's today; back on 142's, fresh again —
  `expected [] to deeply equal [ '2026-07-28' ]`

Each compares the reminder's held-week days with the same days worked out afresh from `stashDays`.

---

## Fix 4 — the Opus read's O3-2 (speed)

**What changed:** `src/engine/overlay.ts loadedSrcSig` leaves out rows no request landed (the reader's step 1). A plain
briefing row added to or taken off the week on screen no longer changes the key. The day each request's row stands on is
still kept, since a row stands by its day.

**Failed first:** O3-2 › Saber adds a briefing row for Bane on Thu 16, then takes it off (no request, no saved week
touched): none read again — `AssertionError: expected 330 to be +0` (330 saved-week parses for one plain row, six weeks
held).

**Kept reacting to what it must:** a second test — a request landing a row on the week on screen still re-reads — passes,
as do Astra F2's three and every round-2 held-week case (R2-2: Astra F3, the Opus read's R1, Fable 1a, 1b, 1c).

**Not done, on purpose:** the reader's step 2 (replace the week on screen in the key with only its year). The brief asked
only for the plain-row case, and narrowing the key further is where round 2's staleness came from. So changing week still
re-reads the held weeks. Filed below.

---

## Checks — commands, where run, results

All from `C:/Users/User/projects/Raptor/raptor-port`.

| Command | Result |
|---|---|
| `npx vitest run src/leavewar/sans-reads-r3.test.tsx` — before any code change | **17 failed, 8 passed** (the red run; the 17 are the tables above) |
| `npx vitest run src/leavewar/sans-reads-r3.test.tsx src/leavewar/sans-reads-156.test.tsx src/leavewar/sansplan-sec156.test.ts src/leavewar/sans-words-156.test.tsx` — after | **PASS**, 4 files, 159 tests |
| `npx vitest run src/leavewar src/state src/storage src/engine/overlay src/engine/weekstash src/engine/roster src/ui/peek src/ui/bell src/ui/Bell src/command src/undo` | **PASS** — 543 files; 7417 passed, 5 expected fail, 20 skipped, 0 failed |
| `npm run build` (the type check), through the checks lock | **PASS** (first try FAILED on my own test file — `findLast` is not in the project's library target; replaced, then passed) |
| `node reference/tfin.js` | **PASS** — 728 passed, 0 failed |
| `npm run lint:changed` | **PASS** — "no new finding (2221 changed files read against origin/main)". Its first try answered "could not compare" (it ran while the full suite was running); that one does not count and was run again |
| `npm run rulecheck` | **PASS** — "rulecheck OK" |
| `npm run docsize` | **PASS** — "docsize OK — every record accounted for". It also prints "OVER by 376, deferred (D29)": `HANDOFF.md` over by 162 and `OUTSTANDING.md` by 214 — the host's files, not touched by me |
| `npm test` (the FULL unit suite), through the checks lock — first run | **1 FAILED** of 16,331: 1070 of 1071 files passed; 16,305 passed, 5 expected fail, 20 skipped. The one: `src/leavewar/ui/doubletap-windows.test.tsx › the counter form's Delete` — a double-tap timing test, in a file this change does not touch. **My mistake made it likely:** I ran the code check and the document check at the same moment, loading the PC. Run alone straight after: **PASS, 32 of 32**. It also passed inside the 543-file run above |
| `npm test` — second run, nothing else running | **NOT RUN** — queued behind chat 170's lock about 20 minutes, then stopped; see the last section |
| Full Playwright run | NOT RUN — not mine to do (the brief) |
| The running app | NOT WALKED — this is a build, read and tested; no screen was driven. The readers and the walk are still owed |

---

## Documents corrected (a correction, not a trim)

- `raptor-port/docs/data-schema.md` — the `sansplan:<pid>:<iso>` row now says it is no longer a record, why, and that a
  stored one is read by nothing; the `noticeseen:<pid>` row says the reminder's id names its days and his reads of it
  are kept.
- `raptor-port/docs/data-model.md` — the SANS change line's paragraph (no planning mark beside it; no table needed at the
  database step), and §11's `Setting` row (no row is "the app's alone" any more; the gate's check is gone) — changed
  together with `src/state/perms.ts` (D200).
- `raptor-port/docs/notifications-register.md` — B13: the "a newly planned day lights it again" passage replaced by
  D2560's rule and what does and does not light it.
- `raptor-port/docs/file-map.md` — a new head entry: the new test file and the changed roles.

Not touched, as told: `HANDOFF.md`, `OUTSTANDING.md`, `DECISIONS*.md`, everything under `.claude/`, the two png files.

---

## Found, not fixed

1. **The reminder's days follow the week on screen.** Cause: the line is worked out from "the weeks the app holds" — the
   week loaded and the saved (edited) weeks (`sansunfiled.ts weeksHeld`). A day he is planned on in a week nobody has
   edited is in the line only while that week is on screen. That is older than this job. What is new: with the mark gone,
   such a day is "a day not in it when he read it", so his bell lights while he looks at that week and goes dark when he
   leaves it. In the demo every week names him; in real use it needs a request (a Meeting, say) filed for him in a week
   no scheduler has edited yet. A real fix is to work his days out from every week ahead whatever is on screen — a cost
   and design question, likely the database step's. For the host: decide whether to tell him now.
2. **The next-week peek has the same gap Astra F2 found.** `src/ui/peek.ts` keys its memo on the men deleted, the
   requests and the loaded rows — not the homes. A man moved squadron could still show in the peek of his old squadron's
   next week until something else changes. `landingSig()` is there for it; I did not change the peek (outside the brief).
3. **A week change still re-reads every saved week ahead** (the Opus read's O3-2, step 2) — speed only; see fix 4.
4. **Another saved week's rows are not in the key** (the Opus read's Q1 (a)) — no failing case exists; unchanged.
5. **Past 32 saved weeks a re-read is far slower than it should be** (`engine/weekstash.ts` clears its whole memo past 32
   weeks) — the reader marked it "older"; unchanged.
6. **One more copy of "a taken back names this line" remains**, inside `setSansUndoTold` in `sansunfiled.ts`. It asks a
   different question (exactly ONE "taken back" of a line), so I left it rather than bend the shared body to it.
7. **`src/leavewar/sansplan-sec156.test.ts` keeps the old mark's name.** Renaming it is a file-map and history change
   I judged not worth making inside a fix; its head comment and the file map say what it now pins.
8. **What the gate does with a write to a `sansplan:` row is no longer asserted.** The rewritten tests assert only that
   such a write changes nobody's bell. It is now an unlisted settings name like any other.

---

## Where I departed from the brief, and why

- **Chat number:** 169, not 166, on the host's correction — the commit message and the lock labels say 169.
- **The checks lock:** taking it by hand and then building was refused by the guard (it did not see me as the holder),
  so every locked run went through `gatelock.mjs exec`, which waits, takes, runs and releases by itself.
- **SEC-R3-1's test** is re-aimed further than "Ranger still relights": its own last step is now forbidden by D2560 (see
  fix 1).
- **Four older answers changed** rather than kept — D2560 is later than the reading they pinned (D90). Listed above.
- **`findLast`** in Astra's test replaced by a reversed copy and `find` — the project's type target has no `findLast`.
- **Not BLOCKED on anything.** No requirement was missing or contradicted a ruling; the one judgement call is the table
  under fix 1, which is his ruling's own words applied, and is laid out for the host rather than decided quietly.

```
Status: READY FOR INDEPENDENT REVIEW
Changes: 17 files — src/leavewar/sansunfiled.ts, src/state/{perms,notices,noticeseen,people-settings-commit,units}.ts,
         src/storage/keyowner.ts, src/engine/{overlay,roster}.ts; tests: new src/leavewar/sans-reads-r3.test.tsx, rewritten
         cases in sans-reads-156, sansplan-sec156, sans-words-156; docs: data-schema, data-model, notifications-register,
         file-map
Checks: see the table — all PASS except the first full unit run (1 failure, an untouched timing test, passes alone)
Open items: HEAD detached (move the branch ref before a push); one clean full unit run owed; "Found, not fixed" 1 and
            the four changed answers under fix 1, for the host to weigh
```

## The second full unit run

**NOT RUN.** I queued it through the checks lock straight after the first. Chat 170 (`claude/words-pass-163`, "two
builds, then the fanned-out walk") took the lock first and still held it after about 20 minutes of waiting, so I stopped
my queued run rather than leave it to start by itself after I had handed back, against a tree the host may have changed
by then. My run never held the lock; nothing of mine is left running.

What stands in its place, and what is owed:

- The first full run: 16,305 of 16,331 passed, one failure — `doubletap-windows.test.tsx`, a double-tap timing test in a
  file this change does not touch, run while I had wrongly started two other checks beside it.
- That file alone straight after: 32 of 32 passed. It also passed inside the 543-file run of every folder this change
  touches.
- **Owed by the host:** one clean `npm test` through the lock on `0e59ea5f3` with nothing else running, before this is
  called green. I am not calling the failure "not mine" on more than that evidence.
