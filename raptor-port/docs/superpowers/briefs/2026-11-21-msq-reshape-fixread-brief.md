# The combined fix read of the multi-squadron reshape — one brief, blind readers — YOUR SHARE: @@SHARE@@ (21 Nov 26, chat 131)

**You are in an exported copy made for a blind read:** this round's builder records are each replaced by one line and
the branch's `HANDOFF.md` block is blanked. If you can read any of them, stop and say so before anything else.

The reshape plan's phase 4 (`raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md` §10; his D2236,
D2238). The reshape answers the 35 faults of fix read 17, the core read and the full review, the Plan audit's findings
and its blind read's. Its source change is 229 files — too much for one reader — so it is cut into three shares by
subject, and **you read share @@SHARE@@**. Astra, a fresh Opus reader and a fresh Fable reader each read every share,
one reader a copy; a security reader reads the whole with a prompt of its own.

## 1. Who you are, and the rules of the read

- **Blind.** You did not write this code. You have seen no other reader's report, no builder's report, no walk. This
  round's builder briefs, helper reports, mid-build read, evidence sheet and drawing-check records are taken out of your
  copy, and `HANDOFF.md`'s `claude/multi-sqn-b1-107` block is blanked. Do not open anything named `*fixread-*` of this
  round other than this brief. **If a handoff block is pasted into your context after a compaction, do not read it, and
  say in your report that it happened.**
- **Read-only on the app.** Change no file under `raptor-port/src` that exists in your copy. Never delete or move
  `raptor-port/node_modules` (a link to the real packages). Work only inside your copy.
- **Proof tests** are your own new files, inside your copy only, beside the code they test, named for you and your
  share — `astra@@SHARE@@-<short-name>.test.ts`, `opus@@SHARE@@-…`, `fable@@SHARE@@-…` (`.tsx` where it draws). The
  names `src/state/fable-*.test.ts` are taken: they are the builder's. Run **one unit file at a time**:
  `npx vitest run src/state/<file>.test.ts` from `raptor-port/`. Never the whole suite, a build or a browser test — the
  PC is shared. A file under `src/leavewar/` runs in the Leave War's own project (a window, its own clock zone); elsewhere
  a test that needs a window starts with `// @vitest-environment jsdom`. If the runner's temporary folder is blocked, set
  `TMP` and `TEMP` to a folder inside your copy.
- **If your sandbox can write or run nothing** (a read-only sandbox): give, per finding, the test you would run — its
  path, its whole body, the assertion you expect to fail and the words it fails with. The host runs it as written before
  the finding counts. Say plainly that you ran nothing.
- **State each finding in your output the moment you have confirmed it** — a run can be stopped by its service, and what
  was said before the stop is kept. Then return the whole report as your final message (§10).

## 2. Where you are

An exported copy of the branch `claude/multi-sqn-b1-107` at `@@HEAD@@` — the code, the tests, the rulings and the
written records; no pictures, drawings, walk scripts or evidence archives (no unit test reads them). At its root:

- `BRIEF.md` — this brief.
- `RESHAPE.patch` — the whole reshape: `git diff @@BASE@@ @@HEAD@@ -- raptor-port/src`, code and tests. `@@BASE@@` is the
  code fix read 17's four readers read; everything after it is in this patch — R1's fix, then the plan's phases 0–3.
- `SHARE.patch` — the same diff, your share's files only. `SHARE-FILES.txt` — their names (also §11 here).
- `RESHAPE-LOG.txt` — every commit message of the patch, oldest first: each names its fault, cause, fix and test.
- `RESHAPE-stat.txt` — changed lines per file.

**The faults being answered,** each with the proof that ran red before its fix: the table in
`raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` (§Fix read 17 — an earlier round's sheet, kept in your copy for
that table only); the proofs as text in `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/` and
`raptor-port/docs/superpowers/briefs/2026-11-20-msq-plan-audit-repro/`; the plan's §1 (the 35), §19 (the Plan audit,
PA–PH) and §19b (its blind read, R1–R13 — **not** the 35's R1–R6; this brief writes "blind-read R6" for those).
**The design and its reasons:** the plan, by piece — §3 Piece A, §4 Piece B, §5 Piece C, §6 Piece D, §7 one by one,
§10 who built what, §11 what a person sees, §12 his answers, §14 what it could not settle. Where the code and the plan
differ, his rulings win; where the plan and a ruling differ, the ruling wins — report it.

**You may read any file, but you report on your share:** behaviour that passes through your share's files, and the
bodies in another share's file that §5–§7 name as carrying your promise. A fault you meet outside your share goes in
one line under "outside my share".

## 3. The seeded test world

`src/test-support/msq-world.ts` — `useMsqWorld()` registers a fresh world for each test: two squadrons at one place
(`p1`), both Leave Wars (142's loaded, 149's behind the world door), the one Undo, the clock on **Wed 15 Jul 2026,
09:00**. The five seeded sign-ins, by `signInAs('saber' | 'hunter' | 'ranger' | 'kestrel' | 'osprey')`, with `PID` and
`ACCT`:

| Name | Who | Account | Person |
|---|---|---|---|
| Saber | master admin, 142 | `acad` | `stiff` |
| Hunter | 142's second admin, not a master admin | `acad2` | `prowler` |
| Ranger | 142's member | `acus` | `bane` |
| Kestrel | 149's admin | `acad9` | `kes9` |
| Osprey | 149's member | `acus9` | `osp9` |

Helpers: `on(day, h, m)` a day of July 2026; `at(iso, h, m)` any day; `pastMidnight()` moves the clock to 00:00:01 of
the next day and fires the app's own midnight wake (it needs a window); `moveMan(pid, unit)` saves a squadron move
through the real door (`state/units.ts setHome`), counting from tomorrow; `acrossMove(pid, from, to)` saves it and
returns the day before, the move day and the day after; `bystanderAdminOf(unit, exclude)`; `signOut()`. Nobody holds
View or Plan in the seed: a test gives one through `state/units.ts setGrant`. For the shape of a test see
`src/state/piece-b-tables.test.ts`, `src/state/msq-undo-rights.test.ts`, `src/leavewar/msq-war-a1-a7.test.ts`,
`src/ui/reshape-c6-pickers.test.ts`.

## 4. His rulings that decide this round

Each sentence in quotation marks is copied from the ruling's full row. Open a row before you call anything a breach:
`grep -h '^| D2203 |' .claude/decisions-full/*.md` (the shell). The pages: `.claude/rules/decisions/people-accounts.md`
(§Posting out, §Many squadrons and aircraft types), and for a share that touches them
`.claude/rules/decisions/leave-war.md`, `.claude/rules/decisions/inputs.md`, `.claude/rules/decisions/oil.md`,
`.claude/rules/decisions/tracker.md`, `.claude/rules/decisions/scheduler.md`. **A sentence marked "(the host's
reading)" has no row behind it: treat it as a question to judge, not as a requirement.** So too each share's "promise"
paragraph (§5–§7): it is the plan's wording of what the rulings below add up to, not a ruling. Search the rulings by a
rule's subject — the action, the screen, the word — not only by the numbers given here: a later ruling rarely names
every earlier one it changes.

**The job.** D2238 — "Batch 1's open multi-squadron faults are fixed by first reshaping where their families come from
— one which-squadron-on-a-day answer, the day always given; homes, places and rights as dated rows under one check; one
last-admin rule; passes over every squadron — then the rest one by one".

**A move of squadron, and the rights it ends.**
- D2203 — "When a person moves to another squadron, every View and Plan he holds of other squadrons is cleared; old
  rights never follow him." Its row's reading: "a master admin's reach is not a grant and is not cleared".
- D2243 — "When a man moves squadron: an ALL AVAIL meeting stays on the squadron it was filed on; sign-off boxes offer
  that day's people; nobody, master admins and Plan holders included, puts his leave into his old squadron's Leave War
  for a day after his move; his View and Plan end at the start of his move day; his old war's row is striped from that
  day and the new war's before it; a window open at midnight gets the drawn band." In full, from the same row: "Q3 (A7)
  refused for everyone, removals never refused, an Undo putting leave back on such a day refused with "Ranger is 149's
  from Thu 16 Jul, so this can't go back into 142's Leave War.""; "Q4 rights hold only while their man stays in the
  squadron he was in when given — they end at the start of his move day, and a transfer set ahead ends them on its
  date"; "Q6 the striped look without "PO", no posting tag, leave approved before the move kept out of sight in the old
  war until the Transfer batch carries it"; "Q7 the band "You are 149's from today. This can't be saved in 142's Leave
  War." (or "…in 142's Tracker.") with "Close", typed words kept visible, nothing saved into either squadron".
- D2249 — "Nobody moves himself to another squadron: the refusal reads "You can't move yourself to another squadron —
  ask another admin"; a master admin is moved only by a master admin, refused to anyone else in the app's existing "Only
  a master admin can do that"."
- A person's squadron move, saved today, counts from the next day's start, and a day already begun is never rewritten
  (the host's reading — D2119 and D2160's R7 rule this for a squadron's PLACE: "a place keeps its history, a move
  counting from the next day's start"; the build applies it to a person's squadron too).

**Who may act for a squadron.**
- D2191 — "A master admin makes squadrons, names each new squadron's first admin and acts as an admin of every squadron,
  and only a master admin makes another; Admin → Users lists an admin's own squadron's people, a man of the other
  squadron found by search there to be given View, nothing else of his row changeable; View of another squadron shows
  its schedule pages and Logic read only, never its bell."
- D2192 — "A squadron's admins make admins of their own squadron only — a 149 admin makes a person an admin of 149,
  never of 142; only a master admin makes another master admin."
- D2199 — "A master admin may let one named admin edit another squadron, person by person: a switch on that person's
  row in Admin → Users, off by default, set by a master admin only; everyone else of his squadron keeps View only of
  the other." Narrowed by D2250.
- D2201 — "An admin a master admin gives "Plan" of another squadron has full access to it, everything 149's own admins
  have — every page, each his to edit, its settings and Admin → Users among them." Its row's readings: "Plan is given
  and taken away by a master admin only (D2199); with it he acts as an admin of 149 — he may make a 149 man an admin of
  149, as 149's admins may (D2192)".
- D2241 — "Wherever a master admin may act for a squadron, an admin holding Plan of that squadron may too — in what the
  app allows, in its words and in what is written for him — and both are named, never the master admin alone."
- D2250 — "An admin of a man's own squadron — at home there, by Plan of it, or a master admin — may make him a member
  though he holds Plan of another squadron; his Plan ends in the same change, as only an admin holds Plan." It replaced
  D2248 (a master admin only) the same day.
- D2205 — "Only a master admin changes a master admin's account (M3)".
- D2252 — "A person with View of another squadron sees only its View-only Sched and Logic, read only — never its Inputs,
  Quals, Leave War or Tracker, even read only."
- D2197 — "A master admin has full editing rights on every page of every squadron: a squadron he picks in the
  "Schedules" menu moves every page to it". D2132 — for anyone else "the schedule pages and Logic follow the pick, while
  Inputs, Quals, the Leave War and the Tracker stay on his own squadron", narrowed by D2201 for a Plan holder. (No screen
  picks another squadron yet — step 5's menu; the tests pick with `switchUnit`.)
- D2239 — "The guest view is removed: no admin switch lets people waiting for access see the programme, and the waiting
  screen offers no button into it; a person who asked for access sees only the waiting screen until an admin of his
  squadron approves him."

**The last admin.**
- D2184 (Q10) — "a transfer that would leave his squadron with no admin is refused at once on the sheet — "Ranger is
  142's last admin. Make another admin of 142 first." — and so is any later step that would cause it, such as removing
  another admin; it never waits".
- D2247 — "Where a squadron has an admin of its own, the last-admin check counts only its own admins: a Plan holder from
  another squadron never lets its last own admin be made a member, suspended, archived, moved or deleted; where it has
  none of its own, a Plan holder counts."
- D2246 — "The last-admin refusal, to someone who cannot make an admin of that squadron, says who can: "Hunter is 150's
  last admin. Only a master admin or an admin of 150 can make another." and, dated, "…from Fri 27 Nov, when Osprey moves
  to 142. Only a master admin or an admin of 150 can make another."; a master admin or an admin of it keeps the approved
  words."
- The dated approved words, "Kestrel is 149's last admin from Fri 27 Nov, when Osprey moves to 142. Make another admin
  of 149 first." (the host's reading of where they come from: D2217 approves "the later-date last-admin refusal" as
  drawn; the sentence is the drawing's, quoted in the plan's §5.2, not in the row).

**Inputs, sign-off and leave across a move.**
- D2221 — "a man's leave across a move may be changed by each squadron's admin for the days that are his squadron's" —
  not built; its row: "until then only a master or the man may change such leave, as built", corrected by D2240's row:
  "an admin of both squadrons — by Plan, or as a master admin — may change it too, as the save check already allows".
  The refusal's sentence (D2240): "Only Ranger or an admin of both 142 and 149 can change leave that runs across his
  move."
- D2240 — "The role is always called "master admin" — in every word on screen and in everything written for him — never
  "master" alone."
- D1667 — "A refusal of one change opens with the bold word "Blocked:", the rest after the colon in quieter words; never
  "Not saved", which stays the failed-save band's alone".
- D2245 — "A squadron's SKED CK, PLANNED BY and APPROVED BY boxes also offer, after that day's own people, an admin
  holding Plan of the squadron and a master admin who carry the Scheduler tick; CUR CK stays the squadron's own people of
  that day." Its row's reading: "offered while his Plan holds that day, a master admin always".

**The bell across squadrons.**
- D2194 — "A squadron's people get no bell line about another squadron's own business. A line crosses between squadrons
  only where the matter concerns both".
- D2202 — "While an admin holds Plan of another squadron, his bell carries that squadron's admin lines, on by default,
  his to switch off; each line shows which squadron it is from — 142 or 149." (The mark and the switch are not built.)
- D2218 — "On the day a person moves squadron the old squadron's bell lines leave his bell, read or unread, never later
  struck "taken back"; lines about himself stay with him; after a move, who is told of a take-back is whoever would be
  told of it today." Narrowed by D2222 ("A bell line about a moved man's own leave follows him"), D2223 ("After a move,
  a bell line about an input stays with a man only where he is named in that input (or it is his own request's line)"),
  D2225 ("A filer who has not moved stays told when the input he filed for others changes") and D2228 ("A filer who
  moved together with the man he filed for, and is now an admin of the man's new squadron, is told when that input
  changes, as any admin of the man's squadron is; the lines he had before his move still leave his bell on the move
  day.").

**Holidays and OIL.**
- D2195 — "Each squadron owns its own public-holiday list, never shared with another squadron, even at the same place; a
  holiday one squadron adds never touches another squadron's days, OIL or bell." From the same row: "the Holidays form's
  warning names only its own squadron's published days; no bell line goes to the other squadron for a holiday; the
  "Inputs need an OIL answer" line goes to its own squadron's schedulers only."
- D2207 — the warning's words: "Already published as working days: Wed 15 Jul and Thu 16 Jul. Publish them again so the
  crew on them earn OIL for the holiday." (one day: "Already published as a working day: Wed 15 Jul. Publish it again
  so the crew on it earn OIL for the holiday.")

**Undo, and a member's own bid.**
- D148 — "Undo reverses only your own changes." From the same row: "If someone else has since changed the very same
  thing, Undo refuses and says who, rather than overwrite their newer work."
- D350 — "In this build the one undo does not take back adding a person (with or without his sign-in), archive, Restore
  / Restore as, delete, or a posting (post out / post in and their sheet's undos)."
- D1177 — "a member moves his own bid while it waits and its days are open". D1225 — "A member may delete his own
  pending bid on a Leave War day that has since closed for bidding".
- D785 — "A scheduler is always an admin: the app is not built for, and no check tests, a scheduler who is not one."

## 5. Share 1 — the one answer to "which squadron, on which day", and every reader of it

**The promise.** The app asks "whose is this man, this input, this page, this setting — on THIS day" in one place, and
no reader assumes today. Across a move (the day before, the move day, the day after, a move and back) every list,
count, picker, save door, mark and setting shows and writes the right squadron's.

**What was built** (commits are in `RESHAPE-LOG.txt`):
- **Piece 0** (`b526f2f45`) — the shared test world; C9: `testing/enumguard.ts bare` counts code inside a template; the
  behaviour guard `state/msq-move-readers.test.ts`.
- **Piece A's bodies** (`093f339b7`, `303fbb5f4`, `14292bc27`, `518b675a3`, `3208bfe7e`) — the home handle's second
  question and a man's stints (`state/units-model.ts homeChangesIn`, `stintsIn`); an input's squadrons as one body
  (`engine/inputs.ts inputSpanIso`, `inputSquadrons`, `inputOnDay`, `inputTouches`, `inputsOnDay`, `inputsTouching`,
  `inputsListed`, `inputsOnFirstDay`); the page's squadron (`state/perms.ts pageUnit`, `adminOfPage`,
  `maySchedEditPage` — PE1 as blind-read R5 rewrote it; PD1: a new person's squadron, `state/units.ts setNewHomeUnit`);
  a squadron's own setting (`engine/hooks.ts unitSetting`, `unitSettingKey`; B4: `state/perms.ts membersFileOn`,
  `state/memberfile.ts`); C6's one whole-draft answer (`state/perms.ts inputWhoProblem`, `inputWhoProblemNow`, asked by
  the gate's section 7c); the bell's readers on the one body (`state/notices.ts`).
- **The schedule side** (`3756da972`, `a9b64251e`, `3a472efd2`, `27f104918`, `b7e0cf8af`, `76c6d4c91`, `ff1eb12e1`) —
  A-i: each input-day reader asks its own day, the landing writers keep the first day; C4: `engine/faceattrs.ts
  rosterIds`, `rosterShown`, the frozen roster in `engine/publish.ts`, `engine/validate.ts issuedRoster`; C5 with
  blind-read R8: `engine/publish.ts signPeople`, `setSignMore`, `state/sign-more.ts`; C3: an ALL AVAIL or ALL input
  stamped with its squadron at filing (`engine/schema.ts` `u`, `ui/inputedit.tsx settleStamp`, `state/demoseed.ts`); C6:
  the picker and the save door (`ui/inputedit.tsx offersFor`, `whoDoorRefusal`, `draftImage`, `ui/InputWindow.tsx`,
  `ui/PeoplePick.tsx`); C8: `engine/weekstash.ts`.
- **The own pages** (`4abf07740`, `cc6efa42e`, `fa45d2d5d`, `446615da0`, `734bc5d24`, `4ecfb786b`, `4e6e4e339`) — A-ii,
  B4, C1's list half, C2, C11: `ui/InputsPage.tsx`, `ui/QualsPage.tsx`, `ui/MedicalView.tsx`, `ui/SansCal.tsx`,
  `ui/SansDay.tsx`, `ui/sansadd.ts`, `tracker/peoplewire.ts`, `engine/qualcols.ts qualColsOf`, `engine/lookahead.ts
  lookaheadOf`, `state/cutoff.ts`; the Inputs calendar's notes, day titles, edits and Undo by the page's own squadron
  (`ui/owncal.ts`, `ui/InputsCal.tsx`, `ui/caldrag.ts`); the flying plan by the page's own squadron (`state/flyplan.ts`,
  `ui/DaysWindow.tsx`, `ui/EveryWeekday.tsx`).
- **The contract** (`ea7fa94cf`) — the "whose is he on a day" readers (`homeOn`, `homeUnitOf`, `onRosterOf`, `rosterOf`,
  `unitPeople`, `myUnit`, `levelIn`, `levelOfAccount`) take no default day; in tests and development builds a missing or
  malformed day throws (`engine/roster.ts needDay`); every caller, app and test, was given the day it means.
- **The late mark** (`7b5a53fea`) — an input is late by its own squadron's cut-off (`engine/inputs.ts inputOwnDueISO`,
  `setCutOfUnit`).

**Bodies in another share's file that carry this promise** (read them; report on them): `state/perms.ts myUnit`,
`pageUnit`, `adminOfPage`, `membersFileOn`, `inputWhoProblem` and section 7c; `state/units-model.ts homeChangesIn`,
`stintsIn`; `state/notices.ts` (its input readers — who is told of an input across a move); `state/store.ts` (its input
readers and `landingInputs`); `leavewar/sync.ts flyAnswer`, `flyMonth`, `getFlyPlan` (what the own pages' flying-plan
callers ask).

**The tests that carry each fault:** C9 — `engine/roster-readers.test.ts`, `engine/inputsfor-readers.test.ts`. Piece A
— `state/units-model-dated.test.ts`, `state/inputs-squadrons.test.ts`, `state/page-unit.test.ts`,
`state/unit-setting-guard.test.ts`, `state/own-setting-first-write.test.ts`, `state/msq-store-input-days.test.ts`. B4 —
`state/memberfile-own-unit.test.ts`, `ui/reshape-b04-own-pages.test.ts`. C1, C2, C11 —
`ui/reshape-inputs-own-lists.test.ts`. C3 — `state/reshape-c3-allavail-stamp.test.ts`. C4 —
`engine/reshape-c4-free-all-day.test.ts`. C5, R8 — `engine/reshape-c5-sign-boxes.test.ts`. C6 —
`state/input-who.test.ts`, `ui/reshape-c6-pickers.test.ts`, `ui/reshape-c6-window.test.tsx`. C8 —
`engine/reshape-c8-stash-key.test.ts`. The Inputs calendar — `ui/msq-inputscal-own-calendar.test.tsx`. The flying plan
and the cut-off window — `ui/msq-own-flyplan.test.tsx`, `state/flyplan-own-unit.test.ts`, `ui/cutwin-own-unit.test.tsx`.
The late mark — `engine/late-own-cutoff.test.ts`.

**The builder's choices — judge each (supported / wrong, with a failing input):**
1. **Each changed call site's day.** The plan's §3.5 asks the fix read to check every one: the week's Monday where the
   day was meant, today where the draft's day was meant. The contract's own choices: Medical counts by its as-of day; the
   SANS add by its first day; an input with no readable first day is judged on today.
2. **A writer never walks the "touches" list** (the plan's F4 rule): list every caller of `inputsTouching` and
   `inputTouches`; does any write? The landing keeps the first day's answer (`inputsOnFirstDay`,
   `engine/overlay.ts landingRequests`) — the plan's §14 item 5, the agent's reading: no reader found a fault in it. Is
   a request across a move then landed on the right squadron's week on each side?
3. **`pageUnit`** — an own page is the signed-in man's home squadron's, except that a master admin's or a Plan holder's
   follows the pick (D2197, D2201) and the member view goes home. Does any own page, setting read or setting WRITE still
   use the pick or `myUnit` where it should use the page's squadron — or the reverse? Is a View holder ever given
   another squadron's own page (D2252)?
4. **C6's whole-draft rule** — a span across a move: only the man, or an admin of every squadron it touches. Do the
   picker, the save door and the gate's 7c agree for every actor, span and move (a year-wrap input; a forged input whose
   end is before its start, judged on its first day's squadrons; an existing input changed from the other squadron's
   list)? Does any honest filing now fail?
5. **C6's refusal opens "Blocked:"**, not the drawing's "Not saved:" — the builder's reading of D1667 against D2240's
   sentence; told to him.
6. **C3's stamp** — written at filing on an input of ALL AVAIL or ALL alone, never on one naming anyone; "a member
   taking himself out of an input left with ALL AVAIL alone is not stamped" (the host's reading). Can a stamp be forged,
   lost on an edit, or left on an input that later names a man?
7. **The sign-off boxes** — a master admin is always offered in SKED CK, PLANNED BY and APPROVED BY (the reading in
   D2245's row); a Plan holder only on days his Plan holds; never a View holder; CUR CK the day's own people.
8. **A settings window edits the squadron of the page it was opened from** (the host's reading): the late cut-off's
   window and the Calendar window — the Logic page's door the pick, a calendar's gear its own squadron
   (`state/cutoff.ts openWinFor`, `winUnit`, `forgetWin`). Can a draft or a save reach the wrong squadron's record?
9. **`ui/owncal.ts` lends the stored calendar into the loaded one inside a command and puts the loaded one back as it
   stood** (`ui/caldrag.ts`' note drag goes through it too). Does every exit put it back — a refused save, a thrown
   error, a nested call? Do the stored copy, the loaded calendar and the screen agree after edit, Undo, Redo and reload?
10. **The SANS day's flying answer is asked for the page's squadron as it is today, not as on the day shown; the
    Calendar window shows the squadron it edits** (own pages' readings).
11. **The late mark by the input's own squadron's cut-off** (the host's reading — no ruling names it).
12. **`src/engine/` bodies are verbatim ports** (the plan's §0): only the multi-squadron lines may have changed. Name
    any ported body the patch changed beyond them.

## 6. Share 2 — rights, homes and places as dated rows under one check; the one last-admin rule; the re-link; the gate; Undo and Redo across squadrons

**The promise.** Who may act for a squadron, on each day, is read from dated rows by one rule; no View or Plan survives
its man's move, a re-link, or any order of Undo and Redo; a squadron always keeps an admin, on every date, said in the
approved words at every door; the commit gate refuses every forged command the doors would not make; and Undo steps
back only what its owner may still reach.

**What was built:**
- **Piece B** (`f601a7823` … `6a3ca222d`) — the reading rule (`state/units-model.ts grantStart`, `grantHolds`,
  `grantOn`, `levelFrom`): a right is read as holding only while its man stays in the squadron he was in at its start;
  a move writes and deletes no right. Closes R2, R3, R4, R5. K1: homes and places under one "never a day already begun"
  check (`datedRowsBreach`). PA1: Plan given, raised, lowered or taken only by a master admin, at the door
  (`state/units.ts setGrant`, `removeGrant`) and the gate. PA2: Plan only on an admin's sign-in. PA3 and **guardrail
  1**: a re-link drops every right of the sign-in in its own command (`state/accounts.ts updateAccount`,
  `relinkRightsProblem`; the gate's G4 and re-link line). **Guardrail 2**: no restore puts back a right whose man has
  moved since its start (`state/perms.ts restoreLeavesOut`, `movedSinceStart`). Blind-read R1: nobody moves himself; a
  master admin is moved only by a master admin (`state/units.ts setHome`). PH1: the re-link refusal's words.
- **Piece C** (`be0dc7e13`) — `state/lastadmin.ts lastAdminBreach`, one rule over today and every later home or grant
  date; its thin readers and one words table (`state/accounts.ts lockProblemFor`, `lockWords`, `postingLock`,
  `lastAdminIfGone`); the gate's `lastAdminViolation`. Closes B3, B6; blind-read R12's words (D2246).
- **The mid-build read's four fixes** (`5f4696432`) — item 12 below.
- **R7 as ruled twice** (`ce20a609b`, then `6b3fda53c`, `57708aa04`) — D2248's refusal built, then removed for D2250:
  the gate's member's drop (`state/perms.ts accountMadeMember`), and rule 4 of `restoreLeavesOut`.
- **PC1 and the audience** (`144120d08`) — `state/accounts.ts adminsOf`; the gate's section 7e passes an admin line to
  a reader in it.
- **Undo across squadrons** (`873c5293c`, `b28468659`, `af2442b60`, `f0711d831`, `d8f7a47f2`, `22edbbda6`, `8d913f78b`)
  — A-v: every Leave War and Tracker step carries the squadron its world held (`command/commit.ts setRecordKeyHook`,
  `undo/derive.ts stampOf`, `recordKeyIn`, `stampKey`; `undo/timeline.ts stampHolds`, `unreachable`, `inUnitView`,
  `ownStepInView`); K4 + B5 (blind-read R11): a blue/red answer's change id carries its squadron
  (`state/mission-roles.ts roleRecordId`, `state/persist.ts`, `engine/mission-role.ts`); Piece B's restore lines wired
  into the real Undo and Redo (`state/undo-wire.ts grantCtx`, `grantLeftOut`, `holdersOf`, `standingRightKey`; `undo/timeline.ts keptOf`,
  `emptiedBy`, `standingConflict`, `refusedFor`); a Quals change's line by the man's own squadron's columns
  (`state/changelines.ts`); an own-page step undone while another squadron is picked.
- **B2** (`f031c157f`, `0ea1b4342`) — the guest view removed, whole: the guest app's own file deleted, the Admin
  switch, the waiting screen's button, the guest session, the guest role's cells (`state/perms.ts`, `command/actor.ts`,
  `command/types.ts`, `state/accounts.ts`, `ui/App.tsx`, `ui/AccessScreen.tsx`, `ui/UsersPanel.tsx`).

**Bodies in another share's file that carry this promise:** `state/notices.ts adminThen` (who was an admin when a line
was written, on the reading rule); `leavewar/sync.ts` (Archive's lock words through `lastAdminIfGone`; the posting
pass's held reason); `state/store.ts` (the Undo of a step across the midnight change — share 3 reads the change itself).
**Your file, another share's subject** — read by that share too, do not skip them: in `state/perms.ts`, section 7c and
`inputWhoProblem` (share 1), the posting pass's chain, `deleteStripsOnly`, the war-day line (`setLwManDayProbe`), the
holiday line in 7e and `stampForged` (share 3).

**The tests that carry each fault:** R2–R5, K1 — `state/reshape-r2-move-back.test.ts`,
`state/reshape-r3-undo-move.test.ts`, `state/reshape-r4-no-old-right.test.ts`,
`state/reshape-r5-first-admin-moving.test.ts`, `state/reshape-k1-place-day.test.ts`. PA1–PA3, blind-read R1 —
`state/reshape-plan-audit.test.ts`, `state/reshape-plan-audit-read.test.ts`, `state/reshape-r1-r7-words.test.ts`. The
tables — `state/piece-b-tables.test.ts`. Piece C, B3, B6 — `state/lastadmin.test.ts`,
`state/reshape-piece-c-doors.test.ts`, `state/reshape-b3-lock-door-vs-gate.test.ts`,
`state/reshape-b6-squadron-without-admin.test.ts`. The mid-build read — `state/fable-first-admin-takeback.test.ts`,
`state/fable-master-mark-lock.test.ts`, `state/fable-unit-doors-raw-reason.test.ts`,
`state/fable-move-undo-after-midnight.test.ts`. PC1 — `state/admins-of.test.ts`. A-v — `state/msq-undo-worlds.test.ts`.
K4, B5 — `state/msq-k4-mission-role.test.ts`, `state/msq-b5-role-undo.test.ts`. The restore lines, the re-link and
D2250 through the real Undo — `state/msq-undo-rights.test.ts`. `state/msq-quals-line-cols.test.ts`,
`state/msq-undo-own-page.test.ts`. B2 — `ui/reshape-b2-no-guest-switch.test.tsx`,
`state/reshape-b2b-no-guest-switch-shared-store.test.ts`. The regression net of fix reads 2–16 —
`state/units-sqn-fixread2.test.ts`, `state/units-sqn-fixread16.test.ts`, `state/units.test.ts` and
`leavewar/multi-sqn-fixread7.test.ts` to `leavewar/multi-sqn-fixread13.test.ts`.

**The builder's choices — judge each (supported / wrong, with a failing input):**
1. **The reading rule itself** (the plan's §4.2 cut; D2243 ruled the timing, not the mechanism): no end is stored. Can
   a right hold where the rule says it has ended, or end where it should hold — a right with no start date, a sign-in
   re-linked (its start is the later of the right's and the link's day, `pidFrom`), a hand-built account without
   `pidFrom`, a man moved before the link, a move and back, a same-day retarget, a first placing, a demo man's baseline
   row? "One holding per account, squadron and day; an ended right never comes back — a new giving is a new row" (the
   host's reading).
2. **Guardrail 1** (the host's decision after the plan's third read — no row): a re-link carries no right; its Undo
   gives the sign-in back without its View and Plan; a right given since blocks that Undo for good in today's words. Who
   may re-link (the agent's reading of D2191, D2192, D2199 — the plan's §14 item 6, §19 PA3): a sign-in holding a Plan
   that holds today, a master admin only; one holding only a View that holds today, an admin of the man's squadron who
   is an admin of every squadron the View is in, or a master admin; ended rows decide nothing. Do the door, the drop and
   G4 judge alike? Can a forged re-link keep a right, or a new account row under an id a right names pass?
3. **Guardrail 2** (the host's decision — no row): any order of removal, lowering, raising, move, re-link, Undo and
   Redo — at once and on later days — never puts back a right that holds after its man's move, never leaves a step half
   done, and never refuses an honest Undo. The man recorded on the step as it lands; a step the leave-out empties is
   blocked for good and commits nothing.
4. **Rule 4 of `restoreLeavesOut`** (the agent's reading of D2199; to tell him): a Plan row is put back only by a
   master admin's restore — so a plain admin's Undo of making a Plan holder a member gives back the role only, a master
   admin's the Plan too.
5. **The gate's member's drop** (`accountMadeMember`, D2250): a Plan row removed beside the same account made a member
   passes whoever makes it — Plan rows only. Can a command use it to drop a Plan WITHOUT really making him a member (the
   role put back in the same command, another account's row, a View, a forged before-image)?
6. **PA2's backstop**: `levelFrom` reads an `admin` grant on a sign-in whose role is not admin as no right.
7. **The master admin mark is outside guardrail 1** (the agent's reading, the plan's §14 item 8): it is no right; a
   re-link of a master admin's account keeps the earlier rule — the mark moves, dated that day.
8. **"Moves tomorrow"** (a build rule from Fable's sample review — the host's reading): between a move saved and its
   day, a right given or raised is refused at the door and the gate; a lowering, a removal, and the Undo or Redo of a
   giving pass.
9. **The last-admin count** — D2247 rules the Plan holder. The builder's: a master admin counts as an admin at home in
   his own squadron, never as a Plan holder (the host's reading); a squadron new in the command needs an admin on every
   judged date; a squadron the command removes whole is not judged; the judged dates are today and every home or grant
   start from today on. Is any date a right can end on missed? Does any honest step now fail — above all on a squadron
   with only a Plan holder, the first admin moving into his new squadron, and a posting held for ever?
10. **A squadron whose only admin is a Plan holder from another squadron** (the plan's §14 item 2, told to him): his
    Overseas posting is held with that squadron's words on his own squadron's Admin → Users, where its admins cannot
    fix it.
11. **The words table** — does every door give the gate's verdict in the table's words (Suspend, Demote, Archive,
    Delete, the Undo of an account step, a right removed or lowered, "+ New squadron", a move, the re-link, the master
    mark, a posting)? Is "who cannot make an admin" (D2246) judged for the right person?
12. **The mid-build read's four findings, each fixed as its reader specified** — is each fix complete and narrow?
    (a) the first admin's move into his new squadron could not be taken back or undone → `lastadmin.ts`: a home admin of
    that date who still counts there by his own Plan after the step keeps the squadron; (b) making a squadron's only
    Plan admin a master admin passed the door and failed the gate → `accounts.ts setMaster` asks the lock; (c) six
    squadron doors showed the gate's raw reason → `units.ts said`: a refusal raised inside a command keeps its words,
    anything else says "This change could not be saved."; (d) a move's Undo after its day began jammed his Undo list →
    `undo/timeline.ts refusedFor`: "changed for a day already begun" is blocked for good.
13. **A-v's rules** (the builder's design under D148 — the host's reading): only Leave War and Tracker steps are
    stamped; a step in a world he can no longer enter is passed over; a step sharing a record with one he can no longer
    reach is blocked for good, said once. The own-page records list an Undo may take under another pick (`plan`,
    `qualcols`, `sanscalendar`, `memberfile`, `guestview`, `flyday:`, `flyrule:`, `flyrun:`); `rules` and `lookahead`
    kept schedule records. Two tests' shapes: the "later change" case runs as the master admin and asserts the
    timeline's refusal (the Undo list clears at sign-in); another uses an award given then deleted and makes its
    midnight swap by hand. Does either shape hide the case it was written for?
14. **Undo pass 2's readings**: the body that finds a right standing on a re-linked sign-in sits in
    `state/undo-wire.ts standingRightKey` (the plan put it in `perms.ts`); the holders are read as a step lands; a Quals
    change's line uses the columns of the man's home TODAY, not the change's day.
15. **K4 + B5**: the change id is `<unit>@<encodedRoleId>`, the stored key unchanged. Does the gate's section 7 now see
    the squadron for a View holder and a Plan holder? Does any old id still pass unqualified?
16. **The fourteen rewritten tests** (the plan's §4.5, plus `state/units.test.ts`'s Plan lines and the setup-only
    first-admin changes of §5.4): each asserted, before, that a right survives or returns across a move. Read each
    against the fault its fix read closed: did a rewrite drop a guard that fault needed (rewrites 5 and 6 note their
    bell-line half as "spent")? Did any "setup only" change move an assertion?
17. **The guest view's removal**: `perms.ts actorRole` answers `'off'` for a role it does not know (it answered `null`,
    read as the app itself and let through); a session still carrying `guest` is an actor switched off; a stored
    `guestview` value is read by nothing; `PERMS` keeps a Guest column no role reads. Tests that pinned the guest view
    now pin its absence, a waiting person standing in where a guest stood for "no access"; the waiting screen loses
    its "look at the schedule" line and button — a named departure from its approved drawing, by D2239. Is any way into
    the programme left for a person waiting? Did a rewritten test lose what it guarded?

## 7. Share 3 — the Leave War and its posting passes over every squadron; holidays and the OIL answer list per squadron; the routed planning record; the squadron change at midnight; the Tracker

**The promise.** Each squadron's Leave War, postings, holidays, OIL answers and planning calendar are its own whoever
opens the app and whichever war is loaded; a day that is now another squadron's takes no new leave in the old war; a
delete or a posting reaches every squadron's records whole or not at all; and a page left open across the midnight of
his own move enters his new squadron without saving anything typed into either.

**What was built:**
- **R1 and R6 of the 35** (`19608876a`, `c0a856d83`) — a member is not offered Move on his own refused bid
  (`leavewar/state/store.ts`); the gate's member rule keeps who refused his bid and when, both ways
  (`state/perms.ts stampForged`).
- **A1 with A7** (`e89c7833a`, gate half `f12c09d56`, the Undo's line `d8f7a47f2`) — each war counts a man only inside
  his squadron stints, apart from postings (`leavewar/state/raptorRoster.ts homeStintsFor`, `laidHome`;
  `leavewar/engine/people.ts atHome`, `awayFromHome`, `firstDayHere`; `leavewar/state/store.ts stripHome`,
  `notThisWarsDay`, `setWarHomeProbe`; the rows in `leavewar/ui/MatrixRows.tsx`); a war's change to a man's day that is
  not its squadron's only removes (`leavewar/sync.ts warCellDay`, `warDayRefusal`, `warDaySentence`;
  `state/perms.ts setLwManDayProbe`).
- **A5, A6, PB1, PB2** (`3788e7e50`, gate `7ada453ba`) — postings run for every squadron whoever opens the app
  (`leavewar/sync.ts runForeignPostings`, `runForeignPosting`, `storedPostings`, `foreignPostingSaved`;
  `leavewar/state/store.ts readStoredPost`, `samePosting`; `state/perms.ts setLwxPostingProbe`); the held note reads the
  man's own squadron's posting; the posting's take-back and the "off the manpower" line reach a Plan holder.
  `oilOpenOn` by day.
- **B1 and the routed planning record** (`106374c19`, `005894051`, gate `81092264c`, merge test `c9026b27b`) — a
  planning-calendar record goes to its own squadron's stored calendar (`state/plan-foreign.ts storedPlan`,
  `storedPlanJoined`, `keepPlan`, `storedCalendar`; `state/sched-commit.ts`); a delete takes the man off every
  squadron's planning calendar inside its own command (`state/person-delete.ts stripOtherCalendars`,
  `state/plan.ts stripGoneFrom`; the gate's `deleteStripsOnly`); the Undo of a note of a squadron not loaded
  (`af2442b60` — the timeline's per-record store; `state/msq-undo-plan-store.test.ts`).
- **A2 and the midnight change** (`a51754b96`, `548f7426a`, `52159d559`, `85d020968`, `f613f1b90`, `0a98f2ae1`,
  `61d2926f5`) — one entry for the open page (`state/store.ts enterSquadron`, `maybeReenter`, `entryDue`,
  `pickAfterMove`, `setEntryTrigger`); the hold on an open Leave War window and the band, built to the approved drawing
  (`state/typing-hold.ts`, `ui/MoveBand.tsx`, `leavewar/ui/Sheet.tsx`, `leavewar/ui/Matrix.tsx`,
  `tracker/TrackerPage.tsx`, `tracker/storage.js rebindStorageUnit`); blind-read R6: the page re-enters his own squadron
  when the pick has no right behind it (`state/perms.ts pickStandsOn`, `c0a856d83`) or the Tracker is bound elsewhere.
- **A4 with PB3, PB4, PB5 and blind-read R3, R4** (`40321d9ab`, `b6e60c91c`, `7ea050e19`, `d5c86a299`, `cc77b061f`,
  `09602d118`) — each squadron's public holidays its own (`leavewar/sync.ts unitDayFacts`, `holidayTodo`,
  `holidayOwnNameOf`); a holiday's OIL line goes to its own squadron's admins, a Plan holder among them, through the
  gate's ordinary check; the line carries its squadron (`engine/schema.ts` `u`; `state/notices.ts noticeHoliday`,
  `noticeSpan`, `noticeLeft`, `holidayLineAny`); the list it opens and the list's save are that squadron's
  (`ui/OilDayList.tsx`, `ui/oilday.ts saveOilDay`, `adminOfList`, `ui/pops.ts`); the warning in D2207's words; the
  flying plan reads the page's own squadron's holidays.
- **The war's own settings** (`5a03332bd`) — the Leave War reads its own squadron's flying plan, SANS colours and Quals
  columns whatever schedule is picked.

**Bodies in another share's file that carry this promise:** in `state/perms.ts` — `stampForged`, the posting pass's
gate chain, `deleteStripsOnly`, the war-day line, `pickStandsOn`, section 7e's bell-line rules and 7f (the Tracker);
`state/accounts.ts adminsOf`; `undo/timeline.ts` (the per-record store for a planning note; `restoreRefusal` saying
A7's sentence); `state/flyplan.ts`. **Your file, another share's subject:** `state/notices.ts`' input readers (share 1) and `adminThen`
(share 2); `state/store.ts`' input readers (share 1).

**The tests that carry each fault:** R1 — `leavewar/multi-sqn-fixread17.test.ts`. R6 —
`state/reshape-r6-refusal-stamps.test.ts`. A1, A7 — `leavewar/msq-war-a1-a7.test.ts`,
`state/war-day-not-its-squadron-gate.test.ts`, `leavewar/msq-undo-a7-line.test.ts`. A5, A6 —
`leavewar/msq-war-a5-a6.test.ts`, `state/posting-pass-every-squadron-gate.test.ts`. PB1, PB2 —
`leavewar/msq-war-pb1-pb2.test.ts`. `leavewar/msq-war-oilopen-by-day.test.ts`. B1 —
`state/msq-b1-delete-calendars.test.ts`, `state/msq-b1-delete-calendars-stored.test.ts`,
`state/delete-strips-other-calendar-gate.test.ts`, `leavewar/msq-merge-foreign-delete-calendars.test.ts`. The planning
record — `state/plan-foreign.test.ts`, `state/msq-undo-plan-store.test.ts`. A2 and the midnight change —
`state/reshape-a02-midnight.test.ts`, `state/enter-squadron.test.ts`, `state/midnight-swap-undo.test.ts`,
`state/typing-hold.test.tsx`, `state/typing-hold-grid.test.tsx`, `state/reshape-r6-reenter.test.tsx`,
`state/pick-stands.test.ts`. A4, PB3–PB5,
blind-read R3, R4 — `leavewar/msq-holidays-own-sqn.test.tsx`, `leavewar/holidays-by-place.test.ts` (its first case
rewritten to D2195), `leavewar/holnotice.test.tsx`, `ui/oilwait.test.tsx`. `leavewar/msq-war-flyplan-by-war.test.ts`.
`leavewar/multi-sqn-fixread16.test.ts`. One test is marked an expected failure on purpose: A2's Tracker case (item 9).

**The builder's choices — judge each (supported / wrong, with a failing input):**
1. **A stint is worked out, never saved**: does a stint field reach a saved posting or person row
   (`stripHome`, `laidHome`)? A1's row: a saved joining window, a SANS man, two stints with a gap, a posting cancelled,
   a war already open when the move is saved, an Undo of the move giving 142's war his months back in the same session.
2. **A7** — refused for everyone, a removal never (D2243). Is "removes only" sound for a cell of two entries, a half
   day, a join, a cut, a Move? Does the door (`notThisWarsDay`) agree with the gate's line and with the Undo's sentence?
   Can a command put leave on such a day through another writer (an approval, a join, a carry-over, the bridge)?
3. **`leavewar/multi-sqn-fixread16.test.ts`, Fable 2, was rewritten to D2243 Q3**: the join is gone, and Ranger is now
   told twice, once a leave — is that right, or did the rewrite lose what fix read 16 guarded?
4. **The foreign posting pass** — the builder's design (the host's reading throughout): one posting a command; a
   refused foreign posting is given up for the session and tried on the next boot; a moved man's posting is skipped by
   both passes; the foreign half says no passing note — a held foreign posting is said only by Admin → Users' note to a
   master admin or an admin with Plan of that squadron; the run is typed `lw.postoutRun`, so an Undo after it takes back
   only the step that released it; the audience is `adminsOf` of the man's own squadron, read with TODAY for both passes
   even where the pass runs days after the posting's date. Check run-once, both halves of a foreign Delete (the man
   marked deleted, his account gone, his war half, the done mark only with both), owed work never lost, a refused write
   rolled back whole, and that the pass can never write a record the gate's chain does not check.
5. **B1** — the strip runs inside the delete's own command and rolls back whole; the session keeps the plan's kept
   copy updated in place on commit (not dropped), and `stripGoneFrom` takes notes. Can a forged delete change anything
   else of another squadron's calendar? Is a note edited at the same moment lost?
6. **The routed planning record** — the stored half loads the ids it will write before it joins. Do the stored copy,
   the kept copy and the loaded calendar ever disagree after a refused write, a reload or a switch of squadron?
7. **`enterSquadron`'s order** — a pending save, the Tracker rebind, the Undo stamp, the swap's passes kept off his
   Undo list; it restores the war's admin role (`lwSetRole`) after the swap. Whose pick survives: a master admin's pick
   stays; a Plan holder's pick of a squadron his move took from him moves home (`pickAfterMove`).
8. **The hold and the band** — only an open Leave War window holds the swap (`state/typing-hold.ts holdNow`); for a
   moved master admin the window's own buttons stay live under the band, and a save after midnight is the old squadron's
   gate's to refuse; `Matrix.tsx
   BID_AT_BAND` is module state read at each draw — a tap on another cell while the band is up is the band's to refuse;
   "from today" shows only on the move day; where his home did not change that day (blind-read R6's re-entry) the band
   has no approved words and says "This change could not be saved." Can anything typed be saved into either squadron,
   or lost without a word?
9. **The Tracker is not re-read in place** (the plan's §14 item 3 — known, told to him): after his own move it keeps
   the old squadron's records until he signs in again, section 7f refusing his changes; only "Edit chart layout" carries
   the band. **Judge what follows from it:** a moved master admin still passes 7f into the old squadron's Tracker — is
   that a write into a squadron he should now reach only by picking it, or harmless?
10. **A4's lines** — holiday lines now take the gate's ordinary war-line check (7e's crossing skip gone): does an
    honest line now fail, or a forged one pass? A line saved before the `u` stamp reads as its reader's home squadron
    (D56). `ui/oilday.ts adminOfList(unit)` asks "an admin of that squadron" with the role in force — at home, by Plan,
    or a master admin. A line supersedes only lines of its own squadron. Is any reader of holidays left on the loaded
    war — above all `oilOpenOn`, `oilAskPlan` and `isNonWorkingISO`, judging another squadron's input?
11. **The holiday follow-ups** (`cc77b061f`): the bell's tap, the record's field, the put-back's list.
12. **R1 and R6 of the 35** — a member's command may not change who refused his bid or when, in either direction; a
    verified replay and his lawful move of a waiting bid are exempt. Does any honest member action now fail (re-typing a
    pending bid, deleting his pending bid on a closed day — D1225, his own Undo and Redo)?
13. **Found while drawing, never settled** (not one of the 35): a Delete posting set but not yet run did not refuse an
    Undo that put a man's approved leave back on a day after the posting's date. By design, or a fault? Say which, with
    the ruling.
14. **Setup only:** `state/units-switch.test.ts` switches the midnight trigger off (`setEntryTrigger(false)`) so a
    plain admin's pick of 149 stands for its gate tests. Did that hide a case the trigger now changes?

## 8. The ask

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it.

For your share:
1. **Is each fix complete** — every door the same harm comes through: every reader and writer of a man's squadron, an
   input, a right, a home, a place, a posting, a holiday, a planning note, a bell line; Undo and Redo; the Leave War's
   windows, approvals, joins, cuts and moves; Admin → Users; the developer bridge; a second squadron's admin, the master
   admin and a member in turn; the day before, the move day and the day after?
2. **Is each check narrow and sound** — can a command still write a made-up record, keep or bring back a right past a
   move or a re-link, leave a squadron with no admin on some date, put leave into the wrong squadron's war, or tell
   someone of another squadron's business? Does any check fail open — an unset probe or hook, a missing record, a row
   without a date, a day not given, the saved copy not yet whole?
3. **Do the rules match the rulings of §4 exactly** — and does any sentence marked "(the host's reading)" contradict a
   ruling you can name?
4. **Do the pieces fit together** — did the reshape undo what fix reads 7–17 guarded (the bell's retired lines, a
   record made up in memory, a delete that is final, a filer's squadrons, a member's own bid)? Does a body one share
   changed break a caller in another?
5. **What did it break** in each squadron's admins', the master admin's and a member's normal work — anything that ran
   before and is now refused, wrong or slower; Undo and Redo (D148); the bell?

**A finding needs** a concrete failure, its cause and its exact fix step by step — the lines to change and what to
change them to (D489) — with the input that proves it (a test you ran, red; or, if you can run nothing, the whole test
to run) and whether the reshape introduced it or made old code newly reachable. **Give explicit negatives** ("I checked
X and found nothing"). For each of your share's "builder's choices": supported, or wrong with a failing input, or his
to decide.

## 9. Known, not a finding

- A problem whose harm exists only in data already stored, where the code is right going forward (D56 — §8's second
  paragraph). A scheduler who is not an admin (D785). Style, naming, comments.
- **No screen saves a move, gives View or Plan, makes a squadron or picks another squadron yet** — judge the code as if
  one did. The words a door gives where none is drawn are the generic "This change could not be saved." on purpose.
- **Held, the host's calls** (the backlog's `[MSQ-FIXREAD17-OPEN]`): K2, K3 — the gate trusting the page's own memory,
  for the database step; A3 — people made on a shared store before its first boot; B7 — "Request access" names no
  squadron (step 5); C7 — sign-out's reload can sign out the next person; C10 — speed, a measure, not a fault at batch
  size.
- **Not built, on purpose:** step 5 — the "Schedules" menu, so `pageUnit`'s pick rule, PD1, PE1's call sites,
  blind-read R6's re-entry, R2 (the approvals' "New" marks per squadron), R9 and R10 (a bell line's tap entering its
  squadron) are dormant or filed; Admin → Users listing one squadron's people (PF1); P1 — the screen that gives Plan
  (PK1), and D2202's mark of which squadron a bell line is from; P2 — a shared place's time zone changed by a plain
  admin (PG1, D2196); D2221's end state (each squadron's admin changing his own days of a leave across a move); D2251
  (a person told of his own account's changes); D2253 (the member view of a Plan holder); detachments, borrowing,
  shared waves, Transfer to Sqn, Post out from Admin → Users, holidays for a detachment.
- **Filed already:** a second live tab not seeing a change made in another, and a remote edit applied to memory only
  (the database step); a bell line dated minutes ahead; a war line's content field beyond its kind and signer;
  `openNotice` not re-checking a line on a stale tap; a two-squadron Transfer take-back not yet a saved route; a war
  join writing the approver as the leave's filer (D629, as ruled); a deleted man's Leave War row in the months he was
  here (D299), and whether Balances lists a deleted man's OIL; four double-tap timing tests that fail under load and
  pass alone.
- **The Tracker cannot be re-read in place** (the plan's §14 item 3): after his own move it moves at his next sign-in.
  Not a finding that it does not move at midnight; what happens meanwhile is share 3's item 9.
- **Owed by the host, known:** Admin → Data's "clear the period" clears only the loaded calendar (dormant until step
  5); the flying plan for another squadron reads who is available from the loaded war; `perms.ts ownPart` does not yet
  accept a `u` stamp on a member's own take-out; stale notes naming the guest view in three files and
  `storage/keyowner.ts`'s `lookahead` note; the documents not yet rewritten (blind-read R13; the guest view's removal;
  a holiday line's `u`); the looks beside their approved drawings, which are the drawing check's; the walk of the whole
  reshape, which follows this read.

## 10. Your report

Your final message IS the report — under about 2,000 words. Begin with the token `FIXREAD-RESHAPE-@@SHARE@@`, your
name (Astra, Opus, Fable) and whether you ran tests or ran nothing. Then:

1. **Findings, most severe first.** For each: a title and HIGH (a person gets, keeps or loses a right, OIL, a published
   record or saved data wrongly; a squadron left with no admin; one squadron's data written or shown to another; an
   honest step refused with no way round), MED or LOW; **the case** — who, which day, what was pressed, what the app
   does, what it should do, the ruling; **cause** — file and function; **fix** — exact, step by step; **proof** — your
   test's path and the failing assertion as it ran red (or the whole test to run); **introduced by the reshape, or
   older code made reachable.**
2. **The builder's choices** of your share, one line each: supported / wrong (the finding's number) / his to decide.
3. **Checked and found sound** — what you tested or read that held, named precisely.
4. **Outside my share** — one line each.
5. **A tidiness note, last and short (D489) — filed, never fixed, never about `src/engine/`:** of the changed lines
   only — a new responsibility put into an already busy file; a feature-only branch put into a shared flow; a helper
   written where one exists.

## 11. The files of each share

Every file the reshape changed under `raptor-port/src` is in exactly one share (paths from `raptor-port/src/`; app
files, then tests). The copies script reads these three lists to cut `SHARE.patch`, and stops if a changed file is in
none or in two.
Share 1: 45 app files, 40 test files. Share 2: 38 app files, 51 test files. Share 3: 25 app files, 30 test files.

**Share 1**

<!-- share-1-files -->
engine/avail.ts engine/drafts.ts engine/editlog.ts engine/faceattrs.ts engine/hooks.ts engine/inputs.ts
engine/lookahead.ts engine/oilev.ts engine/overlay.ts engine/publish.ts engine/qualcols.ts engine/roster.ts
engine/schema.ts engine/slots.ts engine/validate.ts engine/weekctx.ts engine/weekstash.ts state/cutoff.ts
state/demoseed.ts state/flyplan.ts state/holderbase.ts state/memberfile.ts state/sign-more.ts testing/enumguard.ts
tracker/peoplewire.ts ui/DaysWindow.tsx ui/EveryWeekday.tsx ui/InputWindow.tsx ui/InputsCal.tsx ui/InputsPage.tsx
ui/InputsSettings.tsx ui/MedicalView.tsx ui/PeoplePick.tsx ui/QualsPage.tsx ui/SansCal.tsx ui/SansDay.tsx
ui/SansSettings.tsx ui/caldrag.ts ui/html.ts ui/inputedit.tsx ui/interactions.ts ui/oilputback.ts ui/owncal.ts
ui/peoplepick-model.ts ui/sansadd.ts

boot.test.ts engine/inputs-readers.test.ts engine/inputsfor-readers.test.ts engine/late-own-cutoff.test.ts
engine/reshape-c4-free-all-day.test.ts engine/reshape-c5-sign-boxes.test.ts engine/reshape-c8-stash-key.test.ts
engine/roster-readers.test.ts engine/schema.test.ts leavewar/multi-sqn-fixread3-retract-moved.test.ts
leavewar/multi-sqn-fixread3-undo-moved.test.ts leavewar/multi-sqn-fixread4-bells.test.ts
leavewar/multi-sqn-fixread6-allavail.test.ts leavewar/multi-sqn-fixread6-followups.test.ts
leavewar/multi-sqn-fixread6-retired.test.ts leavewar/multi-sqn-job2-retract.test.ts
leavewar/multi-sqn-job2-warbell.test.ts state/flyplan-own-unit.test.ts state/input-who.test.ts
state/inputs-squadrons.test.ts state/memberfile-own-unit.test.ts state/msq-move-readers.test.ts
state/msq-store-input-days.test.ts state/multi-sqn-step4.test.ts state/own-setting-first-write.test.ts
state/page-unit.test.ts state/reshape-c3-allavail-stamp.test.ts state/unit-setting-guard.test.ts
state/units-sqn-fixread.test.ts state/units-sqn-guard.test.ts test-support/msq-world.ts tracker/tracker.test.tsx
ui/cutwin-own-unit.test.tsx ui/msq-inputscal-own-calendar.test.tsx ui/msq-own-flyplan.test.tsx
ui/peoplepick.test.tsx ui/reshape-b04-own-pages.test.ts ui/reshape-c6-pickers.test.ts ui/reshape-c6-window.test.tsx
ui/reshape-inputs-own-lists.test.ts
<!-- /share-1-files -->

**Share 2**

<!-- share-2-files -->
command/actor.ts command/commit.ts command/types.ts engine/mission-role.ts state/accounts.ts state/auth.ts
state/changebatch.ts state/changelines.ts state/changes.ts state/lastadmin.ts state/mission-roles.ts
state/people-settings-commit.ts state/perms.ts state/persist.ts state/reports.ts state/roster-restore.ts
state/undo-wire.ts state/units-model.ts state/units.ts storage/keyowner.ts tracker/app/core.js ui/AccessScreen.tsx
ui/AdminPage.tsx ui/App.tsx ui/GuestApp.tsx ui/Login.tsx ui/SaveStatus.tsx ui/UsersPanel.tsx ui/WelcomeBack.tsx
ui/icons.tsx ui/scheduler/00-foundation-login.css ui/scheduler/02-shell.css ui/scheduler/15-admin-help.css
ui/topbarvar.ts undo/derive.ts undo/describe.ts undo/timeline.ts undo/types.ts

leavewar/groupinput.test.ts leavewar/multi-sqn-fixread10.test.ts leavewar/multi-sqn-fixread11.test.ts
leavewar/multi-sqn-fixread12.test.ts leavewar/multi-sqn-fixread13.test.ts leavewar/multi-sqn-fixread7.test.ts
leavewar/multi-sqn-fixread8.test.ts leavewar/multi-sqn-fixread9.test.ts leavewar/permsparity.test.ts
state/accounts.test.ts state/admins-of.test.ts state/changebatch-rollcall.test.ts
state/fable-first-admin-takeback.test.ts state/fable-master-mark-lock.test.ts
state/fable-move-undo-after-midnight.test.ts state/fable-unit-doors-raw-reason.test.ts state/lastadmin.test.ts
state/mission-roles.test.ts state/msq-b5-role-undo.test.ts state/msq-k4-mission-role.test.ts
state/msq-quals-line-cols.test.ts state/msq-undo-own-page.test.ts state/msq-undo-rights.test.ts
state/msq-undo-worlds.test.ts state/perms.test.ts state/piece-b-tables.test.ts state/quals-write.test.ts
state/reshape-b2b-no-guest-switch-shared-store.test.ts state/reshape-b3-lock-door-vs-gate.test.ts
state/reshape-b6-squadron-without-admin.test.ts state/reshape-k1-place-day.test.ts
state/reshape-piece-c-doors.test.ts state/reshape-plan-audit-read.test.ts state/reshape-plan-audit.test.ts
state/reshape-r1-r7-words.test.ts state/reshape-r2-move-back.test.ts state/reshape-r3-undo-move.test.ts
state/reshape-r4-no-old-right.test.ts state/reshape-r5-first-admin-moving.test.ts state/stores-boot.test.ts
state/units-model-dated.test.ts state/units-sqn-fixread16.test.ts state/units-sqn-fixread2.test.ts
state/units.test.ts ui/accounts-ui.test.tsx ui/bellnotices-scenarios.test.tsx ui/insights-mix.test.tsx
ui/memberview.test.tsx ui/reshape-b2-no-guest-switch.test.tsx ui/schedule-insights-menu.test.tsx
ui/topbar-css.test.ts
<!-- /share-2-files -->

**Share 3**

<!-- share-3-files -->
boot.ts leavewar/engine/people.ts leavewar/state/foreign.ts leavewar/state/raptorRoster.ts leavewar/state/store.ts
leavewar/sync.ts leavewar/ui/Matrix.tsx leavewar/ui/MatrixRows.tsx leavewar/ui/Sheet.tsx leavewar/ui/rowinwindow.ts
state/notices.ts state/person-delete.ts state/plan-foreign.ts state/plan.ts state/sched-commit.ts state/store.ts
state/typing-hold.ts tracker/TrackerPage.tsx tracker/storage.js ui/MoveBand.tsx ui/OilDayList.tsx ui/oilday.ts
ui/pops.ts ui/scheduler/17-save-status.css ui/topstate.ts

leavewar/holidays-by-place.test.ts leavewar/holnotice.test.tsx leavewar/msq-holidays-own-sqn.test.tsx
leavewar/msq-merge-foreign-delete-calendars.test.ts leavewar/msq-undo-a7-line.test.ts leavewar/msq-war-a1-a7.test.ts
leavewar/msq-war-a5-a6.test.ts leavewar/msq-war-flyplan-by-war.test.ts leavewar/msq-war-oilopen-by-day.test.ts
leavewar/msq-war-pb1-pb2.test.ts leavewar/multi-sqn-fixread16.test.ts leavewar/multi-sqn-fixread17.test.ts
state/delete-strips-other-calendar-gate.test.ts state/enter-squadron.test.ts state/midnight-swap-undo.test.ts
state/msq-b1-delete-calendars-stored.test.ts state/msq-b1-delete-calendars.test.ts state/msq-undo-plan-store.test.ts
state/pick-stands.test.ts state/plan-foreign.test.ts state/posting-pass-every-squadron-gate.test.ts
state/reshape-a02-midnight.test.ts state/reshape-r6-reenter.test.tsx state/reshape-r6-refusal-stamps.test.ts
state/typing-hold-grid.test.tsx state/typing-hold.test.tsx state/units-switch.test.ts
state/war-day-not-its-squadron-gate.test.ts tracker/trk-per-unit.test.ts ui/oilwait.test.tsx
<!-- /share-3-files -->
