# Batch 1's open multi-squadron faults — the reshape plan (20 Nov 26)

- **Ruling:** his D2238 (20 Nov 26, *"reshape and fable."*): batch 1's open multi-squadron faults are fixed by first
  reshaping where their families come from — one which-squadron-on-a-day answer, the day always given; homes, places and
  rights as dated rows under one check; one last-admin rule; passes over every squadron — then the rest one by one.
  Astra, a fresh Opus reader and Fable read this plan, blind, before anything of it is built.
- **Status:** a plan only, **revised after round 3 (chat 125); the plan's red team is closed; his eight answers marked
  (§12) and the Plan audit's findings folded in (§19, chat 126) — next, the build.** Nothing here is built. Written on `claude/multi-sqn-b1-107`; round 1's text is `cbdccbd71`'s, round 2's
  `f70594194`'s, round 3's `de5de891d`'s. Every round-1 finding and what was done with it: §16; round 2's: §17; round 3's,
  with the host's two guardrails: §18.
- **Inputs read:** the fault table, evidence sheet `docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17; the 40 proofs
  `docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/`; the readers' reports `…-full-review-{fable,opus}-{a,b,c}.md`,
  `…-core-read-{astra,opus,security}.md`, `…-fixread17-{astra,opus,fable,security}.md`; round 1's reports
  `…-reshape-read-{fable,astra,opus}.md`, round 2's `…-reshape-read2-{fable,astra,opus}.md` and round 3's
  `…-reshape-read3-{astra,fable,opus}.md`; the batch plan
  `plans/2026-11-17-multi-sqn-build-batches.md` §3.1, §3.4;
  `plans/2026-11-19-multi-sqn-b1-rest-files.md`; the transfer design `specs/2026-11-16-multi-sqn-detachment-design.md`
  §The transfer sheet and the round 6 and 7 drawings `docs/mock/2026-11-17-multi-sqn-r{6,7}/`; `docs/data-model.md` §11;
  the rulings pages (People & accounts §Posting out and §Many squadrons, the scheduler's bell lines D2194/D2195) and the
  full rows of D2238, D2203, D2221, D2119, D2160, D2162, D2214, D2197, D2132, D2191, D2192, D2199, D2201, D2207, D2217,
  D2184, D493, D306, D2194; the code named in each piece below; `OUTSTANDING.md` [MSQ-FIXREAD17-OPEN].

## For him, in five lines

1. The 35 faults come from four habits in the code. This plan fixes the four habits first, and most faults go with them.
2. The four: the app asks "which squadron?" in many places and often assumes "today"; a person's squadron, a squadron's
   place and a person's View or Plan each have their own dated checks; "the last admin" is worked out in six ways; and
   some jobs, such as postings, run only for the squadron whose Leave War is open.
3. 21 faults go with the four fixes; three of those also need a small answer from you. Six more are small separate
   fixes. R1 is already fixed. The six you agreed to hold stay held, and a seventh waits too: the guest switch, until
   "Request access" asks which squadron.
4. Little changes on screen except the faults going away. Three new things get a drawing for you first: a moved man's
   row on his old squadron's Leave War; what an open Leave War window or Tracker chart shows when its owner's move takes
   effect at midnight; and the sentence the leave window gives when someone saves leave that runs across a man's move
   without the right to. The last-admin refusal uses the words you approved on 19 Nov.
5. Your five small questions (C3, C5, A7, when a moved man's View and Plan end, and the guest switch) each change one
   small part. Until you answer, that part keeps working as it does now, or as recommended where no screen shows it yet.

---

## 0. Ground rules for every piece

- **Rulings that bind the plan:** a scheduler is always an admin (D785). Harm only in demo data already stored is not a
  fault (D56). Undo steps back only one's own changes, and his history is kept — no Undo list is cleared as a shortcut
  (D148). A move counts from the next day's start (D2119), and a transfer ends his access on its date (D2160, the
  transfer sheet). A move ends every View and Plan he holds of other squadrons (D2203). Each squadron's admins act only for
  their own squadron (D2191, D2192). Plan is a master admin's to give (D2199) and gives full access as its own admins have
  (D2201). A master admin's every page follows his pick (D2197). Each squadron owns its holiday list (D2195). The plan
  recommends the right design, not the easiest (D754).
- **`src/engine/` bodies are verbatim ports.** Only lines the multi-squadron work added there change: `inputBelongs`,
  `inputsFor`, `inputUnitOf` (step 3); `faceattrs.ts` (a project file); the `rosterShown()` call in `avail.ts` and the
  `rosterOf(UNIT)` lines in `publish.ts signPeople` and `snap.ros`, which the project added; `editlog.ts`'s home read
  (l.449, the project's). The original's 728 must stay 728/0 (`node reference/tfin.js`). With no resolver installed, every
  person is the boot unit's, so a required day changes nothing there.
- **Every existing test stays green (about 11,500)**, except the fourteen named in §4.5, which Piece B's cut and its two
  guardrails rewrite to the ruling's outcome (§9.3). Each fault's proof is copied into its area's real test file and run red on the code before
  its fix, then green. Where a proof calls a signature the reshape renames, the copy keeps the proof's assertion word for
  word and changes only the call; R3's copy also names the move day in its two reads of his right (§4.4). The host reruns
  both runs and checks the two read the same.
- **Bug-check tier: FULL.** It touches permissions, saved data, OIL and the published record. One combined fix read by
  all four readers (D2236): Astra, a fresh blind Opus reader, Fable and the security reader. Then a walk of everything
  that changed (§13).

## 1. The 35 at a glance — where each one goes

| Id | Goes with | One line |
|---|---|---|
| R1 | **fixed** beside the plan (`19608876a`) | A member's refused bid offers no Move. Its walk is owed to this plan's walk (§13). |
| R2 | Piece B | A move writes no right, so taking it back the same day leaves every right as it was. No answer needed. |
| R3 | Piece B | Undo of a move touches only his squadron rows; nothing of any right to put back. |
| R4 | Piece B | A right holds only while its man stays in the squadron he was in when it was given — read, never stored. |
| R5 | Piece B | "+ New squadron" asks the same check before saving and gives its words. |
| R6 | one-by-one | The member rule in `stampForged` compares the refusal's who and when in both directions. |
| K1 | Piece B | Place rows come under the same "never a day already begun" rule as homes. |
| K2 | **held** | Database step (the host's call, agreed). |
| K3 | **held** | Database step (the host's call, agreed). |
| K4 | one-by-one (with B5) | A blue/red answer's change id carries its squadron (`u149@…`). The gate and Undo then see the squadron. |
| A1 | Piece D (on Piece A's stints) | Each war counts him only inside his squadron stints, kept apart from postings. **Drawing first** (§11). |
| A2 | Piece A (entering a squadron) | At midnight of his own move the open page moves schedule, Leave War and Tracker to his new squadron — after Undo steps carry their squadron (A-v). |
| A3 | **held** | Database step's first boot (agreed). |
| A4 | one-by-one (= rest-file P5, D2195) | Each squadron's holidays only. The warning uses the words he ruled (D2207). |
| A5 | Piece D | The posting pass runs every squadron's due postings, whichever war is open, its whole chain checked. |
| A6 | Piece D | The "posting could not run" note reads the man's own squadron's posting. |
| A7 | Piece D + Piece A + **his answer** | A war takes a man's day only where that day is its squadron's; a change that only removes passes. Whether the master admin is an exception is his question (§12 Q3). Built with A1, so it waits on A1's drawing too (§11). |
| B1 | Piece D | A delete takes the man off every squadron's planning calendar, inside its own command, rolled back whole on a refusal. |
| B2 | one-by-one (his D2239, 20 Nov 26) | The guest view is removed: no switch, no button into it (§8). Was held with B7. |
| B3 | Piece C | One lock over every date. The door gives the approved words (D2217 Q15) where it now says "That did not save". |
| B4 | Piece A (the page's squadron) | Own-squadron pages read and write their own squadron's settings, never the pick's. |
| B5 | one-by-one (with K4) | Same fix as K4. |
| B6 | Piece C | A squadron always keeps an admin, from the day it is made. |
| B7 | **held** | Built with step 5 (agreed). |
| C1 | Piece A (an input's squadrons) | A list shows an input on every squadron whose days it touches. |
| C2 | Piece A (an input's squadrons) | His own Inputs page always lists his own inputs. |
| C3 | Piece A slot + **his answer** | The reader honours a squadron stamped on a placeholder-only input. Whether filing stamps one is his question (§12 Q1). |
| C4 | Piece A (the day always given) | "Free all day" and the frozen roster read the day, not today. |
| C5 | Piece A slot + **his answer** | Sign-off boxes: the day's people or today's (§12 Q2). |
| C6 | Piece A (the day always given) | The picker and the save ask one whole-draft question — whom may he file this draft for — so they offer exactly whom the save accepts. Its refusal's sentence is drawn first (§12 Q8). |
| C7 | **held** | With D2205's M2 (agreed). |
| C8 | one-by-one | `weekstash.ts stashDays` hands `viewOfWeek` the qualified key. |
| C9 | one-by-one, **first** | The guard counts code inside `${…}`, so it counts truly while callers move. |
| C10 | **held** (a measure) | Re-measured after Piece A, with A5's pass in the measure. Homes are indexed by person (§3.2). |
| C11 | Piece A (the page's squadron) | The Inputs page's filter and rows read one squadron, the page's. |

So: 21 close with the four pieces — Piece A 9 (A2, B4, C1, C2, C3, C4, C5, C6, C11), B 5 (R2, R3, R4, R5, K1), C 2 (B3,
B6), D 5 (A1, A5, A6, A7, B1, the last also leaning on A). Three of the 21 are finished by his answers: C3, C5 and A7.
**A count moved:** round 1 had R2 waiting on his answer too; Piece B's cut closes it by construction (§4.2). A1 and A7,
built together, wait on his look at A1's drawing. A2 and C6 close without their drawings (the midnight band, the leave
window's sentence); each new part waits on its own drawing (§11). Six are one-by-one: R6, K4, B5, C8, C9, A4. R1 is
fixed. Seven are held: K2, K3, A3, B7, C7, C10, and B2 with a reason (§8). 21 + 6 + 1 + 7 = 35; round 2 moved no
fault. If he wants a B2 stop-gap (§12 Q5), B2 moves from held to one-by-one; the total stays 35.

---

## 2. Piece 0 — one shared test world, and the guard fixed first (my addition; why)

**Why:** each of the three proof sets carries its own harness (`a-_harness`, `b-_harness`, `c-harness`), and every piece
needs the same thing: one man moved 142 → 149, with the day before, the move day and the day after. Several helpers would
each write their own world. One shared world means they test against the same thing, and each walker's scenarios read
the same. C9 is fixed first so the enumeration guards count truly while some 50 call sites move.

- `src/test-support/msq-world.ts` (new): one world drawn from the three harnesses. The four seeded sign-ins, a clock
  (`on(day, h, m)`) and `pastMidnight()`, which moves the clock and fires the app's own midnight wake (A2's proof never
  calls `notify()` itself — Fable F8), `moveMan(pid, unit)` through the real `setHome`, `bystanderAdminOf(unit)` (§9.2),
  and a table helper `acrossMove(pid, from, to)` returning the day before, the move day and the day after.
- `src/testing/enumguard.ts` (C9): `bare` keeps the code inside `${…}` and blanks only the literal parts. The red case
  goes into both guard tests, `engine/roster-readers.test.ts` and `engine/inputsfor-readers.test.ts`, red first. Every
  count re-measured; a file whose count rises names its new walk or is fixed.
- **A behaviour guard** (Fable C shape 4: "the guards count spellings, not behaviour"): `state/msq-move-readers.test.ts`.
  Each row is one reader on the three days. The rows green today go in now. The rows of open faults go in red-first with
  their fix, so the test is never committed red.

## 3. Piece A — one answer to "which squadron, on which day"

### 3.1 What answers the question today

| Question | Bodies today (file → function) |
|---|---|
| Whose is a person on a day | `state/units.ts homeOn(pid, iso = today)`, `homeBefore`; `units-model.ts homeUnitOn`; `engine/roster.ts homeUnitOf(pid, iso = rosterToday())`, `onRosterOf(…, iso = today)`, `rosterOf(unit, iso = today)`, `unitPeople(unit, iso = today)`; `state/perms.ts myUnit(iso = today)` (falls back to `BOOT_UNIT`); `state/store.ts sessionUnit(pid)`. Bodies that scan home rows themselves: `notices.ts movedSince` (l.187), `homesOver` (l.276), `noticeLeftBell` (l.701, l.712); `perms.ts restoredDayHolds` (l.1678, read by `markBackHolds`, `grantBackHolds`, `relinkBackHolds`), 7c's `daysOf` (l.1338), §8's home loop (l.2131), `lastAdminViolation`'s dates (l.1899); `accounts.ts postingLock`'s dates (l.631). Readers of today with no day of their own: `leavewar/sync.ts holidayLeft`, `ownSchedulerIds`, `atWarHome`; `engine/editlog.ts` l.449; `state/changelines.ts peopleLineUnit` (l.635) |
| Which squadron a page is about | `engine/unitview.ts UNIT` (the schedule in view); `myUnit()` read by hand at about 23 call sites in 14 files; `leavewar/state/store.ts worldUnit()` / `sync.ts warUnit()`; `tracker/storage.js storageUnit()`; `tracker/peoplewire.ts` (`storageUnit() || myUnit()`); `boot.ts`'s Tracker maker (`() => myUnit()`); `ui/InputWindow.tsx pickUnit`; `ui/inputedit.tsx rosterOptions(unit = UNIT)`; a plain setting name turned into the schedule in view's, `engine/hooks.ts storedKey` (B4); and the Inputs calendar's notes and day titles, which read the planning calendar `switchUnit` loads for the pick (`ui/InputsCal.tsx` l.123, 379, 719, 1036, 1387 — Astra 6 of round 1) |
| Whose is an input | `engine/inputs.ts inputBelongs(r, unit, at?)` (first day if no `at`), `inputsFor(unit, at?)`, `inputUnitOf(r)`; `state/notices.ts inputUnit`, `filerUnits`, `inputSpan` (end before start = start alone); `state/perms.ts inputUnitViolation`'s own `daysOf`/`unitsOf` (end before start = one year later), and `adminOwnerViolation`'s `ownsHim` (falls back to `BOOT_UNIT`); `leavewar/sync.ts oilOpenOn` (l.1416, first day only). The year-wrap case already disagrees (core Opus, shape 2) |
| Which squadron the open page holds now | three variables set once at sign-in: `UNIT` (switchUnit), the war's `WORLD_UNIT` (swapWarWorld), the Tracker's `boundUnit` (bindStorageUnit — refuses a second unit once loaded). Nothing refreshes them when his own home changes at midnight (A2). Undo's `inUnitView` (`undo/timeline.ts` l.523) passes every step whose ids name no squadron — every Leave War and Tracker step (Fable F2, Astra 2) |

### 3.2 What replaces them

**A-i. A person on a day, the day always given.**
- One resolver, `homeOn(pid, iso)` in `state/units.ts`, handed to the engine as today. The handle grows from one function
  to `{ on(pid, iso), changesIn(pid, a, b) }`. The second answers "the days in a..b on which his resolved squadron
  differs from the day before" — never a row's date as such (Fable 7): the baseline row `setHome` writes for a man with
  none (`units.ts` l.239), a same-day take-back's second row and a first placing from no squadron are no change. Every
  body in §3.1 that scans home rows itself moves onto it: `movedSince`, `homesOver`, `noticeLeftBell`, `restoredDayHolds`
  (and with it the three re-dating hooks), 7c's `daysOf`; §8's loop and the last-admin dates move with Pieces B and C.
- `units-model.ts rowsFrom` indexes homes by person once (`Map<pid, sorted rows>`), so `homeUnitOn` stops filtering and
  sorting every home row on each call. This answers C10's measured cost, the cost of the new list question and Piece B's
  reader (§4.3).
- New, for the Leave War's year-long rosters (A1): `units-model.ts stintsIn(rows, pid, unit)` → `{ from: string|null,
  to: string|null }[]`. `from` is null for his first-ever row, which covers every day before it (`atOn`'s rule); `to` is
  the day before his next row.
- **The day becomes required:** `homeOn`, `homeUnitOf`, `onRosterOf`, `rosterOf`, `unitPeople`, `myUnit`, and the two
  level readers `levelIn` and `levelOfAccount` (`accounts.ts` l.299, `units.ts` l.91 — Fable 8; their callers are core
  files only) lose their default. Each caller writes the day it means — `todayIso()` on purpose, or the day it draws.
  The compiler (`npm run build`; `tsc --noEmit` is hollow here) lists every typed caller.
- **The compiler's hole (Opus M6):** engine files read `any`, so a caller passing an empty day still compiles, and
  `atOn` then answers his first-ever squadron. With the contract step, `homeOn`, `homeUnitOf`, `rosterOf` and
  `inputOnDay` refuse anything but a valid date — they throw in tests and development builds.
- **Callers no round-1 list named, each given its owner and day:**
  - war side (helper "war"): `oilOpenOn` asks `inputOnDay(row, unit, d)` for each asked day `d` (Fable F10, Opus M6 — a
    duty 14–17 Jul across Ranger's 16 Jul move puts the 16–17 Jul questions on 149's list, not 142's); `holidayLeft`
    reads the reader's home today on purpose; `atWarHome` reads today on purpose (who is at home now), and
    `ownSchedulerIds` becomes `adminsOf(the war's squadron, today)` (§6.2 step 6);
  - `engine/editlog.ts` l.449 (helper "schedule"): the line's own date, today when it has none;
  - `state/changelines.ts peopleLineUnit` (helper "undo & roles"): the day the change is filed.
- **How:** expand, then contract (§10). The defaults stay while helpers move their own files' callers, and the last
  step deletes them. About 50 production call sites in about 25 files today (counted 20 Nov 26).

**A-ii. The page's squadron.**
- One function, `pageUnit(kind: 'schedule' | 'own', iso)`, beside `myUnit` in `state/perms.ts` (inside the core file, so
  no import cycle).
  - `'schedule'` (Edit Schedule, View-only Sched, the Board, Logic) → `UNIT`, the pick.
  - `'own'` (Inputs and its calendar, Medical, the SANS calendar and day, Quals, the OIL answer list, the Leave War, the
    Tracker, Admin → Users) → `UNIT` for a master admin, or for an admin who holds Plan of `UNIT` (D2197, D2201). Anyone else
    → his home on `iso`. Nobody signed in → `BOOT_UNIT`, as today (the guest view is removed — D2239, §8).
  - **A Plan holder is read on the day** (the Plan audit, D2242): `UNIT` is his only while his Plan of it holds on `iso`
    (Piece B's `grantOn`); a View holder is never let in by this branch (D2191 — View follows the pick on the schedule
    pages and Logic only).
- Today the pick equals everyone's home (`switchUnit` has one caller, sign-in), so `pageUnit` answers exactly what each
  call site answers now. The difference becomes live with step 5's menu (P3): that change is then one place.
- **Own-page settings (B4):** `engine/hooks.ts unitSetting(unit, name, fallback)` reads `qualify(unit, name)` directly,
  and own pages **write** the same key they read (Opus L6). `membersFileOn()` reads `unitSetting(pageUnit('own'),
  'memberfile')`. The helper's first step lists every reader and writer of a unit setting (`storage/keyowner.ts
  UNIT_SETTINGS`) outside the schedule pages' files: `qualcols` (Quals), the flying plan's
  `flyday:`/`flyrule:`/`flyrun:`/`sanscalendar` (the war's need figures, the SANS calendar), the `rules` late cut-off as
  the Inputs pages read it. The list is read only, at phase 2's start, and each line it names goes to its file's owner
  (Opus L7): `state/flyplan.ts`, `state/flyplan-model.ts` and `engine/qualcols.ts` to helper "own pages"; the flying
  plan's calls in `leavewar/sync.ts` to helper "war"; a value read found in `perms.ts` or `undo-wire.ts` (today both only
  name the keys) to the core or helper "undo & roles". A reader that gains a squadron argument keeps its old form beside
  the new until phase 3's contract, so no helper waits on another. The host checks the list before any of them moves. A
  guard test fails on a plain-name read or write of a unit setting outside the schedule pages' files.
- **The Inputs calendar (Astra 6 of round 1):** its notes, day titles, their edits, change capture and Undo belong to
  `pageUnit('own')`, never the pick. **One record, one identity** (Astra 2, Opus M1): a note or title stays the record it
  is today, `plan/<unit>@pp:<id>` or `plan/<unit>@dm:<iso>` — its id already names its squadron — whichever page writes
  it. The schedule store's `plan` case (`state/sched-commit.ts` l.327), which today refuses another squadron's planning
  record (l.333), **routes** it instead: the squadron loaded → the loaded calendar (`PLANPUCKS`, `DAYRMK`), as now; any
  other → that squadron's stored calendar through `state/plan-foreign.ts` (§6.2), for its before-image and its write
  alike. So capture, revisions, conflict checks, storage and restore see one record whichever calendar holds it, and a
  note edited while 149 is picked and undone after 142 is loaded writes the loaded calendar and the screen. **Through
  Undo, in both directions** (Fable 3, Opus 4 of round 3): the timeline maps a record to its store by collection alone
  (`undo/timeline.ts` l.125–127) and enlists only that store (l.807–812, l.849), and the `plan` case above is the schedule
  store's write — so a restore routed from inside it would change the stored half un-enlisted (the whole-world guard
  throws, `command/commit.ts` guardCheck) with no before-image. So **the timeline picks the store per record**: a `plan`
  record of a squadron not loaded goes to the stored half directly, enlisted as its own store. The stored half, asked to
  join a command or a restore, **first loads that squadron's stored rows for the ids it will write**, so its before-image
  is the note as stored — an edit is a change, never "created", and its Undo never deletes the note — and a refused
  restore rolls back whole, stored and cached copies untouched. Helper "undo & roles" builds the per-record choice after
  helper "session" commits the stored half (§10). No second
  collection: the member rule's `case 'plan'`, `person-delete.ts` l.454, `changelines.ts`, `undo-wire.ts`, `describe.ts`
  and the registry read it unchanged. Section 7 judges the writer as an admin of the squadron in the id (members never
  write the planning calendar). Today nothing changes (own = pick); a member or plain admin with View of 149 who picks
  149 keeps his own calendar once step 5's menu exists.

**A-iii. An input's squadrons — one body.**
- In `engine/inputs.ts`, with the home handle given in (the gate gives its "rows before" handle, as it does now):
  - `inputSpanIso(r)` → `[first, last]`. The app writes an input over the year's end with its end carrying its year
    (`Dec 30` → `Jan 2 2027`, `engine/crossyear.test.ts`), so the gate, the filer test and the lists agree on it. An end
    before its start (never written by the app) counts as the first day alone (`notices.ts inputSpan`'s rule), never as
    no day (`inputCoversDate` covers none) nor a year later (7c's `daysOf` today): the first day's squadrons are always
    judged (Opus L6).
  - `inputSquadrons(r, home)` → the squadrons the input touches. Each named man's home on the first day, and on every day
    inside the span where his squadron changes (`changesIn`). For a placeholder-only input (ALL AVAIL / ALL): its stamped
    squadron `r.u` when present (the C3 slot), else its filer's home on its first day, as today.
  - Two questions, no default: `inputOnDay(r, unit, iso)` for day readers, the same answer as today's `inputBelongs`
    with `at`. And `inputTouches(r, unit)` for list readers (C1).
  - `inputsOnDay(unit, iso)` and `inputsTouching(unit)` replace `inputsFor(unit, at?)`. `inputsListed(unit, pid)` =
    `inputsTouching(unit)` plus every input naming `pid` (C2: his own inputs are always on his own page).
  - `inputUnitOf(r)` = the squadron of the first day, through the same body (whose people the window offers).
- **A body that writes never iterates the "touches" list (Fable F4).** One input across a move is two squadrons'; a
  writer run over "touches" from each squadron's load undoes the other's. So the bodies that rewrite an input's accepted
  mark or land it keep today's answer under its new name, `inputOnDay(r, unit, its first day)` — the day a request lands:
  `state/store.ts` l.686 and l.1114, `state/holderbase.ts` l.209, `engine/overlay.ts` l.430 and l.481. `store.ts` l.171
  (the protected days' signature) asks `inputOnDay` per protected date. Only list readers ask `inputsTouching`:
  `tracker/peoplewire.ts` l.123 and the Inputs pages. (Round 1 sent the landing callers to "per day landed"; Fable found
  no latent fault in the landing, which is first-day by nature, so it stays as it is.)
- **Callers moved to the one body:**
  - `perms.ts inputUnitViolation` (7c): `daysOf`/`unitsOf` deleted; it asks `inputSquadrons(r, homeBeforeHandle)`.
  - `notices.ts filerUnits` (each image's own men over its own days) and `inputUnit`.
  - `adminOwnerViolation`'s `ownsHim`: its home read through the handle; the `BOOT_UNIT` fallback stays, held with A3.

**A-iv. Entering a squadron — one entry for the open page.**
- `state/store.ts enterSquadron(scheduleUnit)` moves the three variables together, in a fixed order:
  1. `switchUnit(scheduleUnit)`;
  2. `swapWarWorld(pageUnit('own'))`;
  3. the Tracker's rebind to `pageUnit('own')` (below).
- `resetSession` calls it at sign-in, as it calls the first two now, and records **his home at entry** — never the pick
  (Opus L2), so step 5's master admin pick is never pulled back to his home.
- `notify()` calls it when the signed-in person's home today differs from his home at entry (A2, his move at midnight).
  The existing midnight wake (`leavewar/sync.ts installPostingClock`) already calls `notify()` at 00:00:01 and whenever
  the page is shown or focused on a new day, so the swap needs no click (Fable F8, Opus L2). It does **not** reset the
  page or clear the Undo list: his steps in the old squadron wait there, by their stamp (A-v). **The pick at midnight**
  (Fable 9): it moves to his new home only where it stood on his old home; a pick of another squadron stays — a
  master admin's always — and the own pages follow `pageUnit('own')`. **A pick of a squadron reached by View or Plan
  stays only where that right still holds on the new day** (the Plan audit, D2242): his own move ends every View and Plan
  he held (D2203, at the start of his move day — D2243 Q4), so Hunter, 142's admin holding Plan of 149 with 149 picked,
  whose move to 150 counts at midnight, is moved to 150 — never left on 149's pages with no right there; `pageUnit` reads
  his Plan on the day, so his own pages go home the same moment. Dormant until step 5's menu.
- **Switched on only after A-v.** Until every step carries its squadron, an Undo after the swap could write a 142 war or
  Tracker step into 149 (Fable F2, Astra 2). `enterSquadron` is built in phase 2 with the midnight trigger off and
  switched on in phase 3 (§10).
- The swap's own passes (the war's OIL, absence and posting passes on its load) run as the app's reconciliation, as at
  sign-in — never as his Undo steps (Opus L2; tested).
- **Typed work at the swap (Astra 7, Fable F9) — never saved into the new squadron, never dropped without a word.** An
  open Leave War window or Tracker edit pop-up holds the swap of that page, whatever is typed in it — so no form has to
  report its typing. The probe (Fable 9 of round 2): `state/typing-hold.ts` (new) asks the Leave War's one window frame,
  `leavewar/ui/Sheet.tsx`, which already keeps its open windows (`OPEN`), and the Tracker's pop-ups
  (`tracker/components/Pop.jsx`, `Modals.jsx` — step 0's read of the Tracker confirms they are where a chart is edited);
  all helper "session"'s, built in phase 3 with the band (§10). In phase 2 `enterSquadron` reads a hold that answers
  "none", its trigger off. The window stays, with one band across its top and
  one button: words to be drawn and put to him (§11, §12 Q7), proposed "You are 149's from today. This can't be saved in
  142's Leave War." and "Close"; closing it swaps the page. A save the old squadron refuses after midnight (its Tracker
  queue, his Save in that window) is named in the same band. Until his answer: the page waits for the window to close,
  without the band; a save from it shows today's refusal.
- **Tracker** (`tracker/storage.js`): `rebindStorageUnit(unit)` replaces "refuse once loaded": flush its queue, swap the
  door, and remount the Tracker page so it reads afresh (a key on `TrackerPage` naming the bound unit). It waits only
  while the band is up — never for the Tracker to be "clean", which 7f makes impossible after midnight (Fable F9).
  **Unsure:** whether the Tracker holds module-level caches beyond its React tree. It is found out by reading its load
  path before any change (§14). Step 5's master admin pick (D2197) needs the same swap, so it is built once here.

**A-v. Every Undo step carries its squadron, through every part of Undo (a prerequisite of A-iv's switch — Fable F2,
Astra 2 of round 1; Astra 3, Fable 5 of round 2; D148).**
- **Which records get a stamp** (Fable 5). Records whose ids already name their squadron — the schedule's, the planning
  calendar's (`plan/<unit>@…`, A-ii), a unit's settings — are read as today. Records of no squadron's world — inputs,
  notices, people, accounts, requests — stay unstamped and eligible anywhere, as today: Ranger's leave filed at 23:50 is
  still his to undo after his midnight swap. Only the two worlds chosen per squadron whose record ids name none get one —
  the Leave War's (`lw.*`) and the Tracker's (`trk.*`): at commit, each envelope records the squadron each held, read
  through the gate's probes `lwUnitNow` and `trkUnitNow`.
- **One key for such a record, everywhere Undo compares records** (Astra 3). Today the command layer counts revisions by
  `collection/id` (`command/commit.ts` l.337, `revisionOf` l.563), so 142's and 149's `lw.config/x` are one record to
  Undo: an Undo in 142 is told "a later change touches the same thing — undo that first" for a 149 change, and a 149
  background change bars a 142 step for good. For `lw.*` and `trk.*` the key becomes `<collection>/<unit>@<id>`, the
  unit the envelope's stamp: in the revision counter (a key hook in `commit.ts`, installed by `undo-wire.ts`), the
  envelope's `revs`, and `undo/derive.ts recordKey` — so `keySet`/`sharesKeys`, `expected`, the background barrier,
  `writerOf`, `liveRevision`, folded steps and `stoodBefore` all tell the two apart. Keys a hook hands the timeline by
  hand (`closedAtStep`, from `perms.ts lwClosedKeys` l.820) are qualified by the timeline with the step's stamp. **The
  second store's posting row** (`lwx.profile/<unit>@<pid>`, written by A5's foreign pass and Admin → Users' doors) has
  the key of that war's own posting record, `lw.postouts/<unit>@<pid>` (`foreign.ts` l.15 names them the same record), so
  a posting the foreign pass ran is a later change to the step that set it (found while checking Astra 3). **So do the
  second store's other two rows** (Opus 5 of round 3; `foreign.ts` l.16–17, `leavewar/state/rows.ts` l.123–133):
  `lwx.ledger/<unit>@<id>` is the war's own ledger row, keyed `lw.ledger/<unit>@<id>`; `lwx.rec/<unit>@<warId>:<recId>`
  is one row inside a war cell, keyed as that cell, `lw.cell/<unit>@<warId>:<pid>:<date>`, its man and day read from the
  row's image. So the master admin who picks 149 and clears Viper's OIL award, picks 142 and deletes Viper from Admin → Users,
  then picks 149 and presses Undo is refused, in today's words, as a later change — the award is never written back for
  a deleted man. Stored keys, the ids the stores and the gate read, and saved data do not change.
- **The two other places Undo compares records by key** (Opus 6 of round 3): `verifiedWarRestore` (`timeline.ts`
  l.613–628 — `closed.has(recordKey(c))`) and `carrySeen` (l.233–246) compare through the same qualified key, the
  `closedAt` keys qualified with the step's stamp as above. Their tests — D1263's member Undo of his own bid on a closed
  day, and a seen mark carried into an older step's images — run in the two-squadron world as well as without a world
  door: with no door the stamp is empty (`perms.ts lwUnitNow`, l.1457), so the old tests never reach the qualified path.
- **Eligibility.** `inUnitView` keeps today's rule for the squadrons a step's ids name — none, or the one in view; a step
  naming two is eligible in either — and adds: each stamped world it wrote holds now the squadron it was written in. The
  restore asks again just before it writes. "In view" is the page's squadron: the pick on schedule pages,
  `pageUnit('own')` on own pages (equal today).
- **A step left in a squadron he can no longer enter** (Fable 5) is passed over silently, as a step in another squadron
  is today — no new words. **It can still share a key with a step he can reach** (Fable 4 of round 3): a war door writes
  an input and a war record in one step (`leavewar/sync.ts doorMoveApproved` re-files the moved leave), inputs keep
  unstamped keys, and `undoConflictOf`/`redoConflictOf` (`timeline.ts` l.726–780) judge every later step sharing a key,
  whatever its squadron. Osprey files leave for Viper on Inputs at 23:30 and moves it in 142's Leave War at 23:50; his move
  to 149 counts at midnight; in 149 every Undo press would say "A later change touches the same thing — undo that first"
  about a step he can never reach. So, in both functions, a step sharing a key whose stamped world he can no longer enter
  — not his own page's squadron now, and he neither a master admin nor holding Plan of it today, so no pick reaches it — is
  **blocked for good**: today's sticky words, passed over by the next press, which names the step it takes (`sayBlocked`) —
  Undo "A later change touches the same thing and can’t be undone."; Redo "An earlier undone change touches the same
  thing and can’t be redone." (and "A later change touches the same thing — it can’t be redone over.", made sticky in this
  case only). A master admin, or a Plan holder, who can go back keeps today's "undo that first". No new words.
- A step with no stamp (made before this build) is judged as today (D56: the stored history is demo data).
- **Files:** helper "undo & roles" — `state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts` and `command/commit.ts`'s
  key hook (no other job touches it); with them, the timeline's per-record store choice for the planning record (A-ii).
- **Tests:** the master admin changes 142's war settings, then 149's, returns to 142 and presses Undo: 142's step is taken;
  a background change in 149's war does not bar it; a later change in 142's war still does. Identical record names in
  both worlds for a war step, a Tracker step and an Inputs-calendar note, with later changes, background changes, Undo
  and Redo, across the midnight swap and a `switchUnit`, and with the pick different from his own squadron. His 142 war
  step after his move: passed over, blocking nothing in 149. His leave input filed at 23:50: undone after midnight.
  Fable 4's case (round 3): Osprey's 23:30 filing and 23:50 war move, his move at midnight — in 149 the filing's Undo is
  blocked for good, said once, and the next press takes the step before it; the same steps for a master admin, or for an admin
  with Plan of 142: "undo that first". A 149 posting changed through an Admin → Users door (the second store, which exists today), then Kestrel's Undo
  of setting it: refused as a later change (Opus 7 of round 3 — the foreign pass's own version is the host's at merge,
  §10). Opus 5's ledger sequence, and a cell row through `lwx.rec`: refused as a later change. D1263's closed-day Undo and
  a seen mark, in the two-squadron world (above).

### 3.3 Faults it closes
- **Closes 7 outright:** A2 (with A-v), B4, C1, C2, C4, C6, C11. The C3 and C5 slots are built here; their outcome waits
  on his answers. A1 and A7 close with Piece D on this piece's stints and day rule.
- **C4:** `rosterIds(iso)` and `rosterShown(iso)`; `avail.ts availByWave` passes its day's iso; `publish.ts` freezes
  `snap.ros = rosterIds(dayIso(CURWEEK, di))`; `validate.ts issuedRoster` reads each unpublished day's own list.
- **C6 — one whole-draft answer to "whom may he file this draft for"** (Astra 5, Opus M5). A day is not enough: Ranger is
  142's on a draft's first day and 149's after it, so a first-day picker offers him to Prowler, 142's plain admin, and the
  save refuses (gate 7c reads every day). So 7c's who-rule is lifted into one pure body in `perms.ts` (core, phase 1),
  `inputWhoProblem(actor, rows, before, after)` → null or `{ pid, unit }`, with today's exceptions kept (his own input,
  his own take-out, a member's filing for others) and D2221 as built (a span across a move: only the man, or an admin of every squadron it touches — at home there, by
  Plan of it, or a master admin; D2240's correction).
  7c calls it; so do the picker (a man is offered where the draft with him added passes), the save door (before the
  gate), and an existing input's save (Kestrel changing, from 149's Inputs list, leave that C1 now shows him). It is
  asked again whenever the draft's dates or people change. `rosterOptions(unit, iso)`, `archivedOptions(unit, iso)`,
  `pickRoster` and `PeoplePick` still take the draft's first day for whose roster to list. The board's reassign pool
  (`interactions.ts` l.1343) passes the day it acts on. **Its refusal's words are new** — a drawing and §12 Q8; until
  his answer the door refuses with the generic refusal the gate gives today.
- **C11:** the Inputs page's filter, rows, deleted and archived groups all read `pageUnit('own')`.
- **Left one-by-one:** C8 (`stashDays` passes `qk(v)` to `viewOfWeek`; the bare week only for `weekBundle`'s dates).

### 3.4 Tests
- The proofs C1, C2, C4, C6, C11, B4, A2, and C3/C5 once answered, red first. A2's proof drives the clock past midnight
  through `pastMidnight()`.
- `msq-move-readers.test.ts` rows (Piece 0): crew palette, free all day, ALL AVAIL crowd, reassign pool, sign-off (once
  C5 is answered), Inputs pickers by the draft's day, the Inputs list and month bars, his own input after his move,
  Quals, Medical counts, the SANS calendar and day, the war roster (with D), Tracker people, OIL eligibility, the OIL
  answer list's days across a move (`oilOpenOn`).
- A leave across a move, loaded on 142's week then 149's and back: its accepted mark unchanged (Fable F4).
- Year-wrap: one input from 30 Dec to 2 Jan 2027, judged the same by gate 7c, `filerUnits` and the lists; a forged
  input with its end before its start: 7c judges its first day's squadrons (Opus L6).
- C6 across a move (Astra 5, Opus M5): Prowler's draft for Ranger on 14 Jul offers him; stretched to 17 Jul, the save
  door refuses before the gate; Ranger's own and Saber's drafts pass; Kestrel saving a change to that leave from 149's
  Inputs list is refused at the door; the picker and the save agree for every row of a table of actor × span × move.
- The planning calendar's one identity (Astra 2): a note edited on 142's calendar while 149 is picked, then 142 loaded,
  then a newer edit, then Undo — refused as a later change; edit, load, Undo, Redo, reload — the stored copy, the loaded
  calendar and the screen agree. **The other direction** (Fable 3, Opus 4 of round 3): a 142 plain admin with View of
  149 picks 149, edits an existing note on his own (142's, not loaded) Inputs calendar — saved as a change, its
  before-image the stored note — and presses Undo: the note as it was, stored and cached; Redo; a restore refused part-way
  leaves the stored and cached copies untouched. Written by helper "undo & roles" at its per-record store's commit (§10).
- `pageUnit`: a member with View of 149 who picks 149 keeps his own Inputs, its calendar's notes and their edits; a
  master admin's pick moves them (`switchUnit` in the test, as B4/B5 do); a Plan holder likewise.
- `enterSquadron`: fired by the clock alone; his home at entry, not the pick; a master admin's pick of 149 stays at his own
  midnight move, and a Plan holder's pick moves to his new home, his Plan ended by the move (D2203, D2243 Q4); a save waiting; a war window and a Tracker pop-up open at midnight (the swap waits; nothing saved into
  149); the swap's passes not on his Undo list.
- A-v's tests (above); the unit-setting guard (A-ii, reads and writes); both enumeration guards, re-counted; the date
  check in development builds (A-i).

### 3.5 What could break, and what the readers must look at
- A caller handed the wrong day: the week's Monday where it meant the day, or today where it meant the draft's day. The
  fix read checks every changed call site's day source, one by one. The behaviour guard is the backstop.
- A writer moved to "touches" by mistake (F4's rule). The fix read lists every caller of `inputsTouching` and checks
  none writes.
- `pageUnit`'s master admin/Plan rule is dormant now. Its tests drive `switchUnit` directly.
- The midnight swap: a pending save, an open war window or Tracker pop-up, the Tracker rebind, the stamp and the
  squadron-qualified key on each Undo step. The fix read reads `enterSquadron`'s order, A-v's stamp and what each world does with work in flight.
- Speed: C10 re-measured with its two proofs before and after, A5's foreign pass included. A slow-down past today's
  figures (1.9× per edit at 4 × 40) is a finding.

### 3.6 Files (who writes them, §10)
- **Core:** `state/units-model.ts`, `state/units.ts`, `engine/roster.ts`, `engine/inputs.ts` (the multi-squadron lines
  only), `engine/hooks.ts` (`unitSetting`), `state/perms.ts` (`myUnit`, `pageUnit`, `membersFileOn`, 7c and
  `inputWhoProblem`, `ownsHim`'s read, `restoredDayHolds`), `state/notices.ts` (`filerUnits`, `inputUnit`, `movedSince`,
  `homesOver`, `noticeLeftBell`).
- **Helper "schedule":** `engine/faceattrs.ts`, `engine/avail.ts` (one call), `engine/publish.ts` (`snap.ros`,
  `signPeople`'s slot), `engine/validate.ts` (`issuedRoster`), `engine/overlay.ts` (renamed calls, first day),
  `engine/weekstash.ts` (C8), `engine/editlog.ts` (l.449), `state/holderbase.ts` (renamed, first day), `ui/html.ts`,
  `ui/palette-html.ts`, `ui/interactions.ts`, `ui/inputedit.tsx`, `ui/PeoplePick.tsx`, `ui/peoplepick-model.ts`,
  `ui/InputWindow.tsx` (C6's picker and save door), `engine/drafts.ts`, `engine/oilev.ts`, `engine/slots.ts`,
  `engine/weekctx.ts`, `ui/oilputback.ts` (the last five already pass a day: renamed calls only).
- **Helper "own pages":** `ui/InputsPage.tsx`, `ui/InputsCal.tsx` (its calendar part last, after helper "session"'s
  routed planning writer is committed), `ui/QualsPage.tsx`, `ui/MedicalView.tsx`, `ui/SansCal.tsx`, `ui/SansDay.tsx`,
  `ui/sansadd.ts`, `ui/oilday.ts`, `ui/OilDayList.tsx`, `tracker/peoplewire.ts`, `state/flyplan.ts`,
  `state/flyplan-model.ts`, `engine/qualcols.ts` (A-ii's inventory decides which lines change).
- **Helper "session":** `boot.ts` (its one owner — the Tracker's "whose" reader, l.88–93, and the rebind; Fable F9),
  `state/store.ts` (`enterSquadron`, `notify`'s check, its input callers), `state/sched-commit.ts` (the `plan` case's
  routing, A-ii), `tracker/storage.js`, `tracker/TrackerPage.tsx`, whatever Tracker load files step 0 names; in phase 3,
  `state/typing-hold.ts` (new), `leavewar/ui/Sheet.tsx`, `tracker/components/Pop.jsx` and `Modals.jsx` (A-iv).
- **Helper "undo & roles":** `state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts`, `command/commit.ts`'s key hook
  (A-v, with the blocked-for-good rule for a world he can no longer enter), then K4 + B5 (§7), then the per-record store
  for the planning record (A-ii, after helper "session"'s stored half), then Piece B's restore lines (§4.3: the
  leave-out, the step's recorded holders, a step the leave-out empties, a re-link's standing right).

## 4. Piece B — homes, places and rights as dated rows, under one check

### 4.1 What exists today
- **Homes:** `perms.ts homeUnitViolation` (§8) compares each man's squadron day by day: never a day already begun, first
  placing from today, and an admin of the squadron he leaves. It allows any day from tomorrow on, so a forged move dated
  past tomorrow passes (R4 a, b).
- **Places:** `perms.ts unitRowViolation` §6 checks only a place row's shape and its unit's admin, never its date (K1).
  `units.ts moveUnit` writes tomorrow.
- **Rights:** a grant row is `{ id, account, unit, level, from }`, with no end. `setHome` **deletes** every grant of his
  at save time, though the move counts from tomorrow. Around that sit `setGrant`'s "He moves squadron tomorrow" refusal
  and the gate's copy (l.1992); the gate's "a move takes them" exemption (l.2019–2029); the delete's exemption
  (`personDeletedHere`); the re-dating hooks (`grantKept`, `grantBackHolds`, `restoreRedated`, `stoodGrant`); and the
  bell's `adminThen`, which reads `from`.
- Each command is judged alone. So a move then a same-day move back strips a third squadron's right with no move (R2).
  The Undo's put-back of a deleted grant is judged as a new right by a non-admin of its squadron (R3). And nothing says
  a right must not outlive a move (R4 c, d).

### 4.2 The cut — chosen from three, and why

Three cuts were on the table: (i) round 1's — a move writes a dated end (`to`, `endedBy`) on save; (ii) Fable F12's — no
end stored, a reading rule: a right holds only while its man stays in the squadron he was in when it was given; (iii) the
Opus reader's — no dated rights at all; R3 by the Undo vouching for a verified restore, R2 refused, R4 by refusing any
right for a man with a move ahead.

| Weighed against | (i) end stored on save | **(ii) the reading rule — chosen** | (iii) no dated rights |
|---|---|---|---|
| D2203: no old right follows him | yes | yes | yes |
| D2119, D2160: a move counts from the next day's start; on a transfer his access ends on its date | ends a day early, on save | ends on the move day | ends on save |
| Batch 4's transfer, set months ahead | its save must write the date's end | ends on its date with no more code | rights go when it is saved, none given for months; Piece B redone then |
| D148: Undo and Redo of a move | put back stored ends; need a bounded exception (Astra 1, Opus H2) and a take-back rule (Opus M1) | touch his squadron rows only | a new exemption: the Undo vouches for its restore |
| D2238: "rights as dated rows under one check" | yes; the end stored beside the squadron row that makes it | yes; the end read from the squadron rows — no fact stored twice (`units-model.ts`'s own rule) | no |
| R2 | his answer | closes by construction | refused; its proof's second case stays red (he stays 149's) |
| The grant readers (round 1's 17 sites and `perms.ts` ~1243) | every one decides whether an ended row counts | 9 change to "holds on a day", 1 goes, the rest (the row loader and the readers that only name an account) unchanged; 7 hand-built accounts pass `pidFrom` | none |
| Round-1 findings it removes by construction | none; 7 to answer | 8: Astra 1, Opus H2, M1, M2, L5, Fable F6, F11's rules 4 and 5 | 7; Fable F6/Opus M2 stays |
| Fix reads 7–12's bell tests | green | 14 existing tests rewritten (§4.5): each holds a right across a move, which D2203 forbids, reads it on the save day, or pins a right carried by a re-link or put back after a move — the two guardrails below | green |
| A new risk of its own | — | a re-link, or a restore re-dated to today, could restart a right a move ended — closed by the two guardrails below: a sign-in linked to another person carries no right; no restore puts back a right whose man has moved since its start | — |

**Recommended: (ii).** It is the only cut whose timing matches the rulings that set one (the move day, the transfer's
date), it leaves batch 4 nothing to rebuild, its Undo has nothing to vouch for, and it removes the most findings without
answering them. **Its costs:** the moment a moved man's rights end shifts from the save to the move day's start — no
screen saves a move or gives a right yet, so nobody sees it today, but it is a change of built timing, so it is his
question (§12 Q4); fourteen existing tests are rewritten (§4.5); each "holds" reader needs a day and his squadron rows
(cheap with A-i's index); ended rows stay stored, naming their account, until a re-link or the account's delete drops
them.

### 4.3 What replaces it

**Rows.** Homes, places and rights keep their shape. No field is added.

**The reading rule** (`units-model.ts`). `grantOn(rows, acct, unit, iso)` → the right of that account in that squadron
holding on `iso`, or none. A right holds on `iso` when:
- its start is on or before `iso` — its start is the later of its `from` and the account's `pidFrom` (the day the
  account was linked to its man; a right with no `from` counts from always, D56); and
- its account's man's squadron does not change on any day after its start up to `iso` (`changesIn`).
So a right ends at the start of the day his squadron changes — whether he leaves for another squadron or joins the
right's own — and never holds again (D2203). `levelFrom` reads `grantOn`. `LevelAccount` gains `pidFrom` as a
**required** key (`pidFrom: string | undefined` — Fable 3, Opus L1), so the build lists every account built by hand;
each is handed the account's own link day. Today's: `perms.ts` l.403, `levelInForce` (l.1302), section 6's actor
(l.1947–1950), §8's actor (l.2074); `accounts.ts` l.328, l.341, l.359. Without it the gate starts a re-linked account's
right on its `from`, not its link day, and refuses every save of a man whose move came before the link.

**Writes.**
- `setHome` writes his squadron rows only. No right is touched; the rule above ends them on the move day. Undo and Redo
  of a move restore squadron rows only (R3).
- `setGrant`: "He already has that" and the row it changes are `grantOn(…, today)`. Where none holds but an ended row of
  that account and squadron is stored, it writes a **new** row — an ended row is never re-dated, so its Undo removes the
  new row and the old one stays ended. The "He moves squadron tomorrow — give this after the move" refusal stays for a
  put that **gives or raises** a right (a new row, View to Plan), door and gate (R5's proof pins it; such a right would
  last the rest of the day only). A lowering passes, and at the gate a verified replay passes (Fable 4, Opus L3): under
  this cut the rights stand until midnight, so Saber lowering a Plan he gave in error, or undoing and redoing a giving,
  the day Ranger's move is saved, is honest — whatever it leaves ends at midnight by the rule.
- `removeGrant`: the row holding today.
- **Plan is a master admin's, and an admin's (the Plan audit, §19 PA1, PA2 — D2199, D2211, D2201):** `setGrant` and
  `removeGrant`, door and gate, refuse a non-master any `admin`-level row — new, raised, lowered or removed — and refuse an
  `admin` grant on an account whose role is not admin; making a Plan holder a member drops his Plan rows in that
  command; `levelFrom` reads an `admin` grant on a non-admin account as no right.
- **A re-link** (`accounts.ts updateAccount` linking an account to another person). **Guardrail 1 — the host's decision
  after round 3, in place of a fourth patch: a sign-in linked to another person carries no access to other squadrons.**
  It replaces "the rights that still hold follow the account from the link day" — a build choice of fix read 10, fault D,
  which no ruling names (checked: no row of `.claude/decisions-full/` or the rulings pages speaks of a re-link carrying a
  right). Every round found a new way for a carried right to outlive a move through the re-link's Undo or Redo (round 3:
  Astra 2, Fable 1, Opus 1); carrying none closes the family by construction.
  - **The drop:** in its own command the re-link removes **every** right of that account, holding or ended, whoever
    re-links. The man now on the sign-in is given what he needs anew, by whoever may give it — an admin of that squadron,
    at home there or by Plan of it, or a master admin (Plan itself, a master admin's alone to give — D2199, D2211). Dropping an ended row takes no bell line a move has not already taken
    today: today's move deletes the row on save.
  - **Refined by the Plan audit (§19 PA3, D2199):** a sign-in holding a **Plan** that holds today is re-linked only by a
    master admin — the drop takes the Plan, and taking Plan is a master admin's alone. The line below then governs a
    sign-in holding only View.
  - **Who may re-link — kept as it stands, for a new reason** (the host's question, decided): an admin of the man's own
    squadron, where the account holds no right **today** in a squadron he is no admin of — at home there or by Plan of it
    (D2201, D2241) — else only a master admin. Nothing is
    carried any more, so the line no longer guards a right handed to another man; it guards the drop. Dropping a right
    that holds is a removal in its squadron, which only that squadron's admins — at home or by Plan — or a master admin make (D2191, D2192, D2201); without
    the line, a 149 admin could strip a 150 right from his own man's sign-in by re-linking it away and back. A right that
    holds nothing gives nothing, so dropping one is no act for its squadron, and the man's own admin may (§14 item 6). The
    door (`relinkRightsProblem`), the gate's G4 (l.1852) and the drop judge alike, all reading only rights that hold today
    on the rows before (Fable 2, Astra 7, Opus M2): Kestrel, 149's plain admin, may re-link the sign-in of Ranger, now
    149's, though Ranger's ended View of 150 is still stored. **The door's words still read true** (`accounts.ts` l.343,
    "This sign-in holds a right in 150. Only a master admin can link it to another person."): they name only a right that
    holds, and are shown only to one who is neither a master admin nor an admin of 150. **Their words change (D2241,
    found by the Plan audit):** they name only the master admin, where an admin of 150 — at home or by Plan — may link it
    too; they become "This sign-in holds a right in 150. Only a master admin or an admin of 150 can link it to another
    person.", in Q8's approved pattern, shown to him with the build's look (§11).
  - **At the gate (section 6, new — the re-link line):** a command that changes an account's man — G4's own test: a row
    whose person changes, or a new row under an id a right still names (`rightNamesNew`) — leaves no grant row naming that
    account stored after it, whoever makes it, a master admin and a restore included. Placed after G4, so G4's words come first
    for one who may not re-link at all.
  - **Undo and Redo of a re-link restore the link only** — the account row, its days dated by `restoreRedated` as today —
    and **never put a right back**: the restore leaves out every grant row the step's images hold (below). A right
    standing on that account when Undo or Redo is pressed was given since, to the man then on the sign-in; the restore
    would carry it to the other man, so the gate's line would refuse it. The timeline says so first: the step is **blocked
    for good** in that direction (`sayBlocked`, as a sticky barrier is), in today's words for a change someone made after
    the action, naming who wrote that right where the timeline knows (`outOfBandWords`, `timeline.ts` l.697: "‹callsign›
    changed this after your action — it can’t be undone now.", "You changed this somewhere else after this action — it
    can’t be undone now.", or "Something else changed this after your action — it can’t be undone now."). D148's own
    rule: a later change by another to the same thing refuses, and says who. His own giving since is a newer step of his,
    undone first. (The body that finds the standing right is core's, in `perms.ts`; the block, the timeline's.)
  - **The cost, said plainly:** an Undo of a mistaken re-link gives the sign-in back **without its other-squadron
    access**. Saber links Ranger's sign-in, which holds View of 150, to Viper by mistake and presses Undo at once: the
    sign-in is Ranger's again, with no View of 150, until 150's admins — at home or by Plan — or a master admin give it again. Nobody sees this today —
    no screen gives View or Plan, and only tests hold one (§11).
- `dropGrantsOfAccount` (the person delete): every row of the account, ended ones too, as now.

**An ended right never comes back, and no restore puts back a right whose man has moved** (Fable 1, Astra 1, Opus M3
of round 2; Astra 1, Fable 7 of round 3). A row that holds nothing on today is dead for good: the move that ended it is
on a day already begun, which rule 1 below never lets change. The only ways back would be its start moving later — a
re-link, or a restore re-dating the link or the row to today. Guardrail 1 closes the first (a re-link carries no right).
**Guardrail 2 — the host's second decision after round 3: no restore ever puts back a right whose man has changed
squadron since that right's own start.** Round 2's rule (leave out a row that held nothing when its step took it off)
still let an Undo after a move put a right back re-dated today, so a removal → move → Undo → Redo → Undo run dropped a
right its own Redo had taken (Astra 1), and an Undo of a lowering after the move re-dated the stored row (Fable 7).
- **At the restore** (`perms.ts restoreLeavesOut`, core; wired into the timeline's `leaveOut` hook, which already leaves
  out a bell line put back to no one, D2218 — helper "undo & roles", after the core's Piece B is committed). In an Undo
  or a Redo:
  1. **a step that changed an account's man** (a re-link, its Undo, its Redo) puts back **no** grant row — the link only
     (guardrail 1);
  2. **any other grant row is put back only where** its account still names the man it named when the step was made, and
     that man's squadron has not changed (`changesIn`) between the row's start and today — the row judged **as it stood
     when it was taken off**: its `from` as the step's image has it or, after an earlier restore, as the row that
     restore's reverse took away (`stoodBefore`, which the timeline already keeps), and the account's link day as it stood
     at the step (guardrail 2). So an Undo of a removal or a lowering after his move puts nothing back, in every order of
     Undo and Redo: the move is on a day already begun and never changes, so the answer never changes either. (The two
     readings of "its start" — the step's image, or a day an earlier restore gave it — cannot disagree about a move: a
     restore that re-dated a row was itself left out had a move fallen between.)
  3. it never removes a grant row not stored.

  The man and the link day of each grant row's account a step touches are **recorded on the step as it is recorded** — a
  hook the timeline asks once and
  keeps on the entry, as it keeps `closedAt` (`timeline.ts` l.326–348; the hook's body core's, its wiring "undo &
  roles"'s). Without them, a removal, then a re-link of the sign-in to Viper the same day, then the removal's Undo would
  put Ranger's right back on Viper's sign-in: the link day alone cannot tell two acts of one day apart. The hook is handed
  the restore's other changes (to see a re-link in the same step) and `stoodBefore`. The rest of the step goes through.
  An ended row lost from storage loses nothing a person can use.
- **A step the leave-out empties.** Where it takes out a grant row and nothing of the step is left to write — an Undo of
  a removal or a lowering after his move (`removeGrant` and `setGrant` each write one row) — nothing is committed and the
  step is **blocked for good** in that direction (`sayBlocked`; the next press names the step it takes), in today's
  words: "Something else changed this after your action — it can’t be undone now." (`timeline.ts` l.696). No new words;
  nobody sees it today (§11).
- **At the gate, before against after** (Opus M3 of round 2), kept as the backstop: for each account and squadron, a
  right that holds nothing on today before the command — none stored, or stored and ended — holds after it only where the
  command puts it **dated today**, judged as a giving by the who-rule; or where a verified restore puts it back with its
  recorded day and the one body above (`restoreLeavesOut`) lets it through — asked by the gate through the timeline's
  probe, as it asks `restoreOffAt` and `restoreDir` today. And a verified restore that puts back a row the body leaves out
  is refused outright, so "never" holds at the gate as well as at the restore. With the re-link line above, this catches
  a forged re-link that keeps a right, and any restore that would revive one.
- **The cost, said plainly:** Saber removes Ranger's View of 150 on 12 Jul by mistake; Ranger moves to 149 from 16 Jul;
  Saber presses Undo on 18 Jul: nothing comes back, and Undo says "Something else changed this after your action — it
  can’t be undone now." That is the world the move would have left anyway — D2203 ends every View and Plan at his move,
  so the View, never removed, would have ended on 16 Jul. Wanted after the move, it is given anew, by an admin of 150 or a
  master admin. The same for a lowering (Fable 7). On the day the move is saved, before it counts, the Undo puts the right back
  as before; it ends at midnight by the rule. **The master admin mark is no right** (§4.5's reading of D2203): its Undo and Redo
  keep today's re-dating (`markBackHolds`), untouched.
- **What a person sees of the re-link:** Saber re-links Ranger's sign-in to Viper by mistake on 18 Jul and presses Undo —
  at once, after Ranger moves again, after Viper moves, or after both: the sign-in is Ranger's again, holding nothing of
  150 or of any squadron but his own; Redo re-links, dated today (fix read 10's F10-4), and removes nothing (the rows are
  gone). Kestrel's re-link of a sign-in holding only ended rows, and its Undo and Redo, pass the same way.

**One check for homes and places.** A pure function in `units-model.ts`: `datedRowsBreach(before, after, today, who) →
{ code, …facts } | null`. The gate calls it once in place of §6's date parts and §8's home loop. The doors (`setHome`,
`setGrant`'s move-tomorrow test, `addUnit`, `moveUnit`) call it on their draft and turn its code into words through one
table, so the screen never shows the gate's own reason (R5, and the "That did not save" family). Its rules:
1. **Never a day already begun** — homes and places alike. For each man or squadron a command touches, compare before
   and after on today and every `from` in either image. A difference on a day before tomorrow is refused, except a first
   placing from today (K1, and §8 as now). A squadron that does not exist on one side of the command — made or removed
   whole by it: "+ New squadron", its Undo and its Redo — is not judged here; the master-only rule and "a unit removed
   while still named" judge it (Fable F7, Opus M3).
2. **Who:** a man's squadron changing on *d* → an admin, on today, of the squadron he leaves on *d* (as now); the
   squadron he joins → an admin of it (§6, as now); a place row → an admin of its squadron (the shared place's time zone,
   master admin only, is P2's — not here).

**A deliberate split, said plainly** (Opus L9): D2238's one check covers homes and places, and a right's **end**, read
from the squadron rows by the rule above. A right's **start** keeps its own check — section 6's grant branch (dated
today, kept, or a verified restore's day) and the re-dating hooks — because a start is set by whoever gives the right
and is judged with the giving, not with any squadron row.

**Rights at the gate (section 6).**
- **Deleted:** the "move takes them" exemption. A move writes no right, so a right removed beside a move is an ordinary
  removal, an admin of its squadron's. No move exception survives this cut, so Astra 1's and Opus H2's bounds have
  nothing to bound (§4.7 keeps them for the other cut).
- **Changed:** "two rights for one account in one unit" → "two holding on one day". "A right given the day before his
  move" → only a put that gives or raises, a verified replay exempt (above). G4, the re-link's who → only rights holding
  today on the rows before. "A unit removed while still named" (l.1999) → counts only rights holding today (Fable 6):
  an ended row names nothing a person can use, and no door can remove one, so it must never block the Undo of
  "+ New squadron".
- **New:** "an ended right never comes back" and the restore's guardrail 2 (above); the re-link line (guardrail 1,
  above). And the drop's who: the removal of a grant row that holds nothing on today in the before-image passes, whoever
  makes the command, where the same command changes that account's person; the removal of one that holds is an ordinary
  removal — an admin of its squadron, at home or by Plan, or a master admin — which G4 already demands of whoever re-links such a sign-in; a bare
  removal stays an admin's of that squadron.
- **Kept unchanged:** a right in his own home unit; a new or changed right is dated today, a kept one keeps its day; a
  verified replay's exemption; a person delete's drop (`personDeletedHere`).
- **Round 1's rule 2 ("one change per command") is dropped:** it existed to refuse R2's forged one-day move. Under this
  cut that command's removal of 150's right needs an admin of 150, and without the removal a one-day move is a move that
  ends his rights on its day (D2203). No door writes more than one change, so it guarded nothing else. Round 1's rules 4–6
  went with the stored end.

**The bell.** `notices.ts adminThen` finds the right with `grantOn` on its day, and keeps its own "held before that day
began" (`from < iso`, its start the later of `from` and `pidFrom`, as now). A right ended by his move is not counted from
the move day; after an Undo of the move it holds again from its own day, as the restore re-dating does today. **The
re-dating hooks stay** (`restoreRedated`, `grantBackHolds`, `stoodGrant`, `masterFrom`, `pidFrom`, the timeline's
`undoneOn`/`redoneOn`/`stoodBefore`), with the restore's leave-out above in front of them: a grant row reaches
`restoreRedated` only where its man has not moved since its start, so for a grant the "dated today because of a move"
branch is no longer reached — it stays for the master admin mark and the link's own day. They now serve a right removed and
then undone with no move since, a level put back (an Undo of a raising still dates the View today, as built), the link
day and the master admin mark. Their retirement is filed, not done here (§15).

**Every reader of grant rows, by its choice** (the 17 and `perms.ts` ~1243, Opus M6 of round 1):
- **Holds on a day → `grantOn` (9):** `units-model.ts grantIn` and `levelFrom` (l.146–157); `units.ts setGrant`'s and
  `removeGrant`'s row (l.188, l.198); `notices.ts adminThen` (l.301); `accounts.ts relinkRightsProblem` (l.339); `perms.ts`
  "two rights" (l.1972), G4 (l.1852) and "a unit removed while still named" (l.1999).
- **Goes (1):** `units.ts setHome`'s drop (l.234).
- **Names an account or only loads rows — unchanged:** `units-model.ts rowsFrom` (l.113, 119, 122); `units.ts
  grantsOf` (l.89, read by tests only) and `dropGrantsOfAccount` (l.210); `perms.ts` the posting pass's grant rows of a
  gone account (~1243), `rightNamesNew` (l.1756), G5 (l.1870, l.1875), and the new re-link line (every row naming the
  account, holding or ended). An ended row still names its account: G5 reads it, and the person delete and the re-link
  drop it.
- **Hands an account to a level reader — passes `pidFrom`:** the seven hand-built sites above.
The builder lists each site with this choice, and the fix read checks every one.

### 4.4 Faults it closes, and tests
- **Closes:** R2, R3, R4 (all four cases), R5, K1. R2 by construction: no answer needed.
- **Left:** P1's own gap (an `admin` grant given by a non-master admin, D2199). It goes with P1.
- **Tests:**
  - Proofs R2, R3, R4, R5, K1, red first. R3's copy names the move day in its two reads of his right (`levelIn('acus',
    u150, '2026-07-16')`): the assertion words stay; the right now ends when the move counts, not when it is saved (§12
    Q4).
  - A table test of the one check: row kind × {a day begun, today, tomorrow, later} × {first row, change, take-back} ×
    {master admin, admin of the squadron he leaves, admin of the squadron he joins, Plan holder, member}.
  - A table test of `grantOn`: a right × {before his move, the move day, after it, a move and back, a move months ahead,
    a re-target the same day, his account re-linked, the new man moved before the link (read through the gate's
    hand-built account and the screen's alike — Fable 3), a demo man's baseline row, a same-day take-back's two rows, a
    first placing (Fable 7)}.
  - Undo then Redo of a move with a third squadron's right, by a plain admin and by the master admin: no right row written.
  - A new squadron's first admin moved into it (Fable F6, Opus M2): allowed; 150 has an admin on every day.
  - Undo and Redo of "+ New squadron", on its day and on a later day (Fable F7, Opus M3), and with an ended row naming
    150 (Fable 6).
  - **The re-link** (Fable 1–3, Astra 1, 7, Opus M2, M3 of round 2; guardrail 1 — Astra 2, Fable 1, Opus 1 of round
    3): by the master admin, a sign-in holding a right that **still holds** (Plan of 149) and one that has ended (View of 150):
    both dropped in the re-link's own command. Its Undo at once, after Ranger moves, after Viper moves, and after both,
    each then Redo: the sign-in back on Ranger, no right of that account stored, the Redo removing nothing; nothing
    refused. The same by Kestrel, 149's plain admin, for a sign-in holding only ended rows — door and gate agree; for one
    holding a right of 150 that holds: refused at the door in its words, and at G4. **A right given since:** 150's admin
    gives Viper's sign-in View of 150 after Saber's re-link; Saber's Undo is blocked for good in today's words naming that
    admin ("‹callsign› changed this after your action — it can’t be undone now."), the next press naming the step it
    takes; the same right given and then ended by Viper's move: the same; Saber's own giving since: undone first, then the
    re-link's Undo passes. **The gate:** a
    forged re-link keeping any right — holding or ended — refused, a master admin's too; a new row under an id a right names,
    likewise, unless the same command removes the right; a forged restore putting a right back: refused.
  - **Guardrail 2** (Astra 1, Fable 7 of round 3): Saber removes Ranger's View of 150; Ranger moves; Undo — nothing back,
    the step blocked in today's words; removal → Undo → move → Redo → Undo, and removal → move → Undo, repeated at once
    and on later days: no right ever put back after the move, no step left half done, a right truly ended still out; the
    same for a lowering (Plan to View) and a raising undone; removal → re-link to Viper **the same day** → the removal's
    Undo: nothing put on Viper's sign-in (the step's recorded man); removal → re-link away and back to Ranger → Undo:
    the View back on Ranger, who has not moved; on the day his move is saved, an Undo of a removal still puts it back,
    and it ends at midnight. Written by helper "undo & roles" at the commit that wires the leave-out (§10); the core's
    phase-2 commit carries `restoreLeavesOut`'s own table, as a pure function.
  - **"Moves tomorrow"** (Fable 4, Opus L3): on the day his move is saved, a lowering of Plan to View passes; a giving
    and a raising are refused at the door and the gate; an Undo then Redo of a giving, and an Undo of a removal, pass.
  - A right given after a move is a new row and does not bring back a bell line the move retired (fix read 7–12's cases).
  - `levelIn` on the move day and the day after; the account delete with ended rows.
  - **The regression net:** `state/units-sqn-fixread*.test.ts` and `leavewar/multi-sqn-fixread9–12.test.ts` all green,
    but for §4.5's fourteen.

### 4.5 Existing tests this cut rewrites (§9.3) — named, none deleted
Tests 1–7 each hold a right across a move — its squadron rows written straight into the store, past `setHome`, which
would have deleted the right — or read the right on the save day. D2203 forbids the first; Q4 moves the second:
1. `state/units-sqn-fixread16.test.ts`, "(control) the move undone the same day puts back the rights it dropped": "dropped
   by the move" is read on the move day instead of the save day.
2. `leavewar/multi-sqn-fixread13.test.ts`, O9-2: "his Plan went with his move" reads "no right of his holds on the 17th"
   instead of "no row stored".
3. `leavewar/multi-sqn-fixread7.test.ts`, fault P's control: "Plan of 142 held before the move keeps the line".
4. `leavewar/multi-sqn-fixread8.test.ts`, fault D's control: "Plan of 142 from the day before: still told".
5. `leavewar/multi-sqn-fixread10.test.ts`, F10-5: "kept through his move by Plan of 149".
6. `leavewar/multi-sqn-fixread11.test.ts`, F11-5b: the same.
7. `state/units-sqn-fixread2.test.ts` l.358, "Ranger… moved to 149: no right of his is left, and Undo puts the View
   back" (Opus L2): `grantsOf('acus')` is `[]` right after `setHome`; it reads "his View of 149 holds nothing from the
   move day", and after the Undo "holds on the move day again".

Tests 3–4 keep their master-mark halves (a master admin's reach is no right and is not ended — D2203's reading) and pin that a
right held before the move day ends with it. Tests 5–6 keep what they test — an Undo of a right's removal or level change
brings its line back with its own day — with the Plan given after the move, in his new squadron.

**Added in round 3, under the two guardrails** (checked one by one in the code, 20 Nov 26). Each pins a right an Undo or
Redo puts back after its man's move, dated today, or a right a re-link leaves standing — a build choice of fix reads 9–12,
never a ruling: D2218 and D2223, which those reads served, are about bell lines, and each test keeps its line half. The
Undo or Redo now puts nothing back and is refused in today's words, "Something else changed this after your action — it
can’t be undone now." (§4.3):

8. `leavewar/multi-sqn-fixread9.test.ts` l.132, "(a grant) Plan of 149 given and removed on 15 Jul, Hunter moves … the
   Undo of the removal on 17 Jul: dated the 17th": the Undo puts nothing back; "the line stays retired" kept.
9. `leavewar/multi-sqn-fixread10.test.ts` l.392, "(Redo, no move since its Undo) Plan of 149 given 13 Jul, he moves 16
   Jul; on 17 Jul its Undo and Redo: the Redo puts back 13 Jul": it holds a right across a move, so it was already red
   under round 2's rule and missed by round 2's list (found while checking). Rewritten as tests 5–6 are: the Plan given on
   17 Jul, after the move, its Undo and Redo on 18 Jul — the Redo puts back 17 Jul.
10. the same file l.402, "(Redo, a move since its Undo) … the Redo on 17 Jul: a right given today": the Redo puts nothing
    back.
11. the same file l.411, "(control — a move between) the Plan taken off 15 Jul, he moves 16 Jul, the Undo on 17 Jul: a
    right given today": the Undo puts nothing back.
12. `leavewar/multi-sqn-fixread11.test.ts` l.631, "(Fable F11-5b, a move between) Plan set to View on 15 Jul, he moves 16
    Jul, the Undo on 17 Jul: a right given today": the Undo puts nothing back; the stored View stays, ended (Fable 7).
13. `leavewar/multi-sqn-fixread12.test.ts` l.407, "(Plan / View) … Undo 17 Jul (17 Jul); 18 Jul Redo then Undo: still 17
    Jul": the Undo on 17 Jul puts nothing back, so there is no Redo; the repeated-restore rule it pinned (fix read 12,
    fault E) keeps its master-mark tests in the same block (l.379–405, l.418), unchanged.
14. `leavewar/multi-sqn-fixread11.test.ts` l.465, "(the gate) a new account row whose id a standing right names is a
    re-link: Kestrel refused; Saber only dated today": Kestrel's half unchanged (G4's words come first); Saber's reads
    "dated today, refused while the right stands; allowed with that right removed in the same command" (guardrail 1).

Checked and left green: fix read 10's F10-4 (l.321) and fix read 11's F11-4 (l.564) re-link a sign-in holding Plan and
undo it, but assert only the link, its day and the line — all unchanged; O10-4 and O10-4b (l.292, l.308) are still
refused, in the same words. The host checks each of the fourteen against its fix read's fault; the fix read reads each.

### 4.6 What could break, and what the readers must look at
- **This is the highest-risk piece:** permissions, saved data, and the bell's retired-line machinery that fix reads 7–12
  built on "a move deletes rights".
- The fix read looks for:
  - a right that holds where the rule says it ends, or ends where it should hold — above all its start for a re-linked
    account, and a right with no `from`;
  - a route that restarts an ended right (a re-link, a Redo, a restore re-dated to today) — the gate's before/after rule
    and the restore's leave-out, each on its own;
  - guardrail 1: any right left on a sign-in a command or a restore has linked to another man — the drop, the re-link
    line, the restore's "link only", and a right given since (blocked, never carried);
  - guardrail 2: any restore putting back a right whose man has moved since its start, in any order of Undo and Redo;
    the man recorded on the step; a step the leave-out empties, blocked and never committed half;
  - any honest Undo or Redo now refused; the re-link's door, drop and G4 judging alike;
  - each reader's choice, and every hand-built account carrying `pidFrom`;
  - a retired bell line coming back after a move is undone or a right re-given;
  - §4.5's fourteen rewrites, each against its fault.
- **Walks:** Admin → Users — every account change, the re-link, Archive, Restore, Delete and their Undos — for the four
  seeded sign-ins, desktop and iPhone. Nothing he sees should change.
- **Files:** core — `state/units-model.ts`, `state/units.ts`, `state/perms.ts` (§6, §8, G4, the re-link line,
  `restoreLeavesOut` and the bodies of the step's recorded holders and of a re-link's standing right), `state/notices.ts`
  (`adminThen`), `state/accounts.ts` (the re-link's who, its drop of every right, and words); helper "undo & roles" wires
  them (`state/undo-wire.ts`; `undo/timeline.ts`: the leave-out's inputs, the holders kept on the step, the probe the gate
  asks, a step the leave-out empties and a re-link's standing right, each blocked for good) once the core's Piece B is
  committed.

### 4.7 If he picks another cut
- **"End them the moment the move is saved"** (his Q4 answered the other way): round 1's stored end comes back — `to`
  and `endedBy` written by `setHome` on every right of his that holds. It then needs: Astra 1's and Opus H2's bounds on
  the move's exception (the right's account is the moved man's as the rows stood before; `to` is the save day; `endedBy`
  is the row this command adds, removes or turns back; account, squadron, level and `from` unchanged; a reopen restores
  exactly the right that move ended); Opus M1's take-back rule (it applies only where no move is left); Fable F6/Opus M2
  (a right in the squadron he joins ends on the move day); Opus L4 and L5; and R2's question back to him (refuse a
  same-day take-back, or give the rights back). §4.5's first seven rewrites drop to two (O9-2 and test 7, which read "no
  row stored"); 8–14 stay, since the two guardrails stand under this cut too — a re-link carries no right, and no
  restore puts back a right a move has ended (here, by its stored end). Batch 4's transfer then writes its
  end on its date. About a day more of core work and one more round of reading.
- **"No dated rights"** (the Opus reader's cut): not recommended — R2's proof cannot go green, batch 4's transfers would
  lose a man's rights months early and bar any new one meanwhile, and Fable F6/Opus M2 then needs a fix of its own in
  Piece C.

## 5. Piece C — one last-admin rule

### 5.1 Six bodies today
- `accounts.ts lockProblem`: today only; home admins only.
- `accounts.ts postingLock`: every saved date.
- `accounts.ts homeMoveLockWords`: one date.
- `accounts.ts lastAdminIfGone` / `lastAdminLock`, read by `leavewar/sync.ts poHeldReason`.
- `perms.ts lastAdminViolation`: before and after, every date.
- Nothing at all in `units.ts removeGrant`, in `setGrant` lowering a right, or in `addUnit` (`firstAdmin` optional).

### 5.2 One body
`state/lastadmin.ts` (new, pure, imports only `units-model.ts`):
`lastAdminBreach({ rowsB, rowsA, acctB, acctA, personB, personA, today }) → null | 'app' | { unit, date, gone, cause? }`.
- **Dates:** today, every home `from` from today on, and every grant `from` from today on — either side. (A right ends
  on a home `from`, so no other date is needed.)
- **Who counts:** an account that can sign in — admin role, switched on, its man on the roster (not archived, deleted
  or a placeholder). **A master admin counts as an admin at home in his own squadron, never as a Plan holder** (Opus L1: read
  as "never counted", Hunter's Suspend in 142 would be refused).
- **The rule, per squadron and date:**
  - where a squadron has an admin **at home** before, it keeps one after (today's rule, unchanged);
  - where it has none at home before, it keeps **an admin at home or a non-master admin Plan holder** after (Opus L4: so the
    first admin moving into 150, whose Plan ends as he becomes its admin at home, passes). A Plan holder is an account
    whose level there that day is admin by a right — read through `levelFrom`, never `grantOn` alone, so a sign-in
    holding Plan of 150 re-linked to a 150 member counts as the member he is (Opus L5);
  - a squadron new in this command needs one of either **on every judged date** — today and every home or grant `from`
    from today on (Opus M4; B6): a first admin whose move away is saved for a later date leaves 150 with none from that
    date, and is refused now;
  - a squadron the command removes whole is not judged (the Undo of "+ New squadron" — Fable F7, Opus M3);
  - `'app'` where the whole app is left with no admin who can sign in.
- **Callers:**
  - `lockProblem`, `postingLock`, `homeMoveLockWords`, `lastAdminIfGone` and `lastAdminLock` become thin readers of
    it;
  - `perms.ts lastAdminViolation` calls it, and now runs for commands that change grants or add a unit as well;
  - `units.ts addUnit` (the first admin required — "Name the squadron's first admin"), `removeGrant` and `setGrant`
    (lowering admin to View) ask it at the door;
  - `accounts.ts updateAccount`'s re-link asks it with its drop of every right in the draft (guardrail 1, §4.3): a
    sign-in holding 150's only Plan, re-linked by the master admin, would leave 150 with no admin — refused in the table's
    words, as a removal of that Plan is. (Today its `lockProblem`, l.508, reads the accounts list alone.)
  - `poHeldReason` keeps reading `lastAdminLock` unchanged.
- **One words table:**
  - today → "Kestrel is 149's last admin. Make another admin of 149 first." (D2184 Q10);
  - a later date → the approved drawing's words, "Kestrel is 149's last admin from Fri 27 Nov, when Osprey moves to
    142. Make another admin of 149 first." (D2217 Q15, picture 9b);
  - to one who cannot make an admin of that squadron — neither a master admin nor its admin at home or by Plan (D2246, 21 Nov 26): "Hunter is 150's last admin. Only a master admin or an admin of 150 can make another.", and dated "Hunter is 150's last admin from Fri 27 Nov, when Osprey moves to 142. Only a master admin or an admin of 150 can make another.";
  - the posting pass keeps its own "The posting waits until 149 has another admin."

### 5.3 Faults it closes
- **Closes:** B3 and B6. Also the filed "refused delete's words" family (Delete, Archive, Undo of an account step).
- **A new squadron's first admin moves into it** (Fable F6, Opus M2): under Piece B's cut his Plan of 150 holds until the
  morning he becomes 150's, so 150 is never without an admin. Round 1's cut refused that move.
- **The agent's reading, to be told to him (§14):** a Plan holder counts as a squadron's admin only where it has none at
  home. D2201 gives Plan "full access as its own admins". Today's lock already counts only home admins where there are
  some. **ANSWERED 21 Nov 26 by his D2247, "As recommended": built as it stands.**

### 5.4 Tests
- The proofs B3 (Suspend, Demote, Archive, Delete) and B6, red first.
- The lock table: dates × home admins × a Plan-only squadron × a master admin (counted at home, never as a Plan holder) × an
  archived admin × a first admin moving into his new squadron × a new squadron whose first admin has a move saved for a
  later date (refused) × a Plan sign-in re-linked to a member at home there (not counted).
- The door's words equal the gate's code for every door: Suspend, Demote, Archive, Delete, Undo of an account step,
  `removeGrant`, `setGrant` lowering, `addUnit`, `setHome`, the re-link (its drop taking a squadron's only Plan), and a
  posting.
- Undo and Redo of "+ New squadron" and of `addUnit`'s first-admin right.
- **Setup-only test changes** (a ruling now refuses what they set up), §9.2: 15 `addUnit('150','p1')` calls in six test
  files, and the R2, R3 and R4 proofs. Each names a bystander first admin. The host checks that no assertion moved.

### 5.5 Risk, walks, readers
- **Risk:** a false refusal of an honest step — above all on a squadron that has only a Plan holder — and a posting held
  for ever.
- **Walk:** Admin → Users — Suspend, Demote, Archive, Delete of the last admin and of a second admin, on today and with
  a later move saved (bridge setup). Desktop and iPhone. The drawing check against picture 9b (D1494).
- **Readers:** the counting rule, the dates, the words table against the gate's codes.
- **Files:** core only — `state/lastadmin.ts` (new), `state/accounts.ts`, `state/perms.ts` (`lastAdminViolation`),
  `state/units.ts`.

## 6. Piece D — passes and lists over every squadron

### 6.1 What exists today
- The posting pass, `leavewar/sync.ts runPoOutcomes`, reads the **loaded** war's postings. So 149's postings run only
  when a 149 man opens the app (A5). Its gate check, `perms.ts postingPassViolation`, knows only the loaded war's posting
  records (l.1121–1129), checks them against the loaded war's saved copy, compares the man's home with the loaded war
  (l.1134–1141), and lets its bell lines reach any admin who can sign in (Fable F3, Astra 4).
- `postingHeldNote` reads the loaded war only (A6).
- `raptorRoster.ts projectPeople` asks `onRosterOf(id, unit)` on today for a year-long grid (A1). The war's
  `setPeople` (`leavewar/state/store.ts` l.2501–2504) saves any window that arrives with the roster as a posting
  ("`projectPeople` emits no window"), and `reprojectRoster`'s carry-over (`sync.ts` l.2576) keeps an old window over the
  projection (Fable F1, Astra 3, Opus H1).
- A war takes a cell for a day that is not its squadron's (A7).
- `person-delete.ts applyDelete` step 3c strips only the in-view `PLANPUCKS` (B1). The schedule's own store refuses
  another squadron's planning row (`sched-commit.ts` l.333), and section 7 needs an admin of the squadron in each id
  (l.1278–1292) (Fable F5, Astra 5, Opus M5).
- `leavewar/state/foreign.ts` already reads and writes another squadron's stored war for Admin → Users' four doors.

### 6.2 What replaces it
**Each war's roster by date (A1) — the squadron stints kept apart from postings.**
- The war's state gains `homeStints: Record<pid, {from, to}[]>`, laid fresh by `projectPeople(includeSans, unit)` from
  `stintsIn` (Piece A) on every projection. It is **never persisted, never captured by `setPeople` into `postOuts`, and
  never read by the posting tag** (`postingPendingTag`), so Admin → Users shows no posting for a moved man.
- Every reader of a man's months — the grid's month filter, manning, availability, the war's day door — reads his stints
  cut by his posting window, where one is saved. A saved joining window with no leaving date no longer outlasts his move;
  a saved posting dated past the move no longer lets his old war count him after it.
- `setPeople`'s capture, `reprojectRoster`'s carry-over branch and its kept-man paths (posted out, archived, deleted)
  change to match. `leavewar/state/store.ts` is free since R1's fix (`19608876a`).
- A man moved there and back has two stints in 142: one row, "away" between them, as a man posted out and restored reads
  (D320) — not two rows (round 1's §6.4 was wrong: a war person holds one row).
- 142's war keeps his months to the move and shows him away after it; 149's counts him from his move day.

**A war takes a man's day only where that day is its squadron's (A7).**
- the war's own door refuses a day outside his stints, as it skips a posted-out man's days today, so 142's grid refuses
  149's days;
- the gate's war section, 7b, adds the same as a backstop, **judging a record's contents before and after** (Astra 6 of
  round 2): a war cell holds a list (`lw.cell`, id `<period>:<pid>:<date>`, `leavewar/state/store.ts` l.1095), so
  removing one entry of two is a put of the shorter list. A change about man *P* on day *d* outside the war's squadron (`homeOn(P, d)`)
  passes only where it removes and changes nothing else — a delete, or a list whose every surviving entry is unchanged.
  Any addition or change there is refused. So a 142 admin's Undo of his own earlier entry on a day now 149's still works,
  from a two-entry cell or of its last entry (Opus L3 of round 1; D148); an Undo that would put leave back on such a day
  is refused, in words drawn with A1 (§11). **Their owner** (Opus 7 of round 3): helper "war" writes the sentence beside
  its day probe in `leavewar/sync.ts`, which knows the man and his move day; the timeline says it before the apply
  through its existing `restoreRefusal` hook, one line wired in `state/undo-wire.ts` by helper "undo & roles" once
  war's change is committed. Until his answer to Q6 the sentence is not written, and the gate's refusal reads as today,
  "That couldn’t be completed just now.";
- `sync.ts` gives the gate a probe that reads `(pid, iso)` off a war change; the core writes the gate's half with a probe
  setter in phase 1 — it judges nothing until the probe is installed — and helper "war" installs it with A1, as one
  tested change. So A7 waits on A1's drawing with it (Opus L8). The master admin question is §12 Q3.

**The posting pass over every squadron (A5) — its whole chain.**
1. `runPoOutcomes` first runs the loaded war as now.
2. Then, for each other squadron, it reads that squadron's stored `profile:` rows only, through `readForeign`, and runs
   each due posting through the pure halves already lifted (`stintClosed`, `personCut`, `keepsWindow`).
   - **One posting per command** (Opus 2 of round 3): each due foreign posting runs in a command of its own, so one that
     is refused never rolls back another squadron's. A refused one is **not tried again this session**, as the loaded
     pass's `PO_REFUSED` does today (`sync.ts` l.2680–2686, l.2883–2893: one retry, then one at a time, then given up
     for the session); it runs on the next boot, once what refused it is put right. A held one (its reason,
     `poHeldReason`, still stands) is no refusal: it commits nothing and is tried again by step 5.
   - **A posting whose man is not at home in that squadron today is skipped by both passes** — the loaded one through
     today's `atWarHome` (l.1467), the foreign one by his home in the squadron whose war holds it. The gate (step 7) would
     refuse it; skipped, it is neither run, nor marked done, nor tried again on every command, and nothing is said — as
     today, where the loaded pass's refusal of such a posting is silent. It runs if he comes back; what a posting set
     before a move means is the Transfer batch's (batch 4). A1's stints make such postings possible ("a saved posting
     dated past the move").
3. **Both halves, as the loaded pass runs them** (Opus H1). The Raptor half runs as now — Overseas: archive and suspend;
   SANS; Delete: `state/person-delete.ts applyDelete`, the Raptor half of a delete (it marks him deleted, drops his
   account, cuts his inputs and, with B1, strips every calendar naming him), as `runPoOutcomes` calls it today
   (`sync.ts` l.2841). The war half goes through that squadron's stored war — `foreignWar(u)`, and for a Delete
   `deletePersonOnWar` → `deleteOnForeign` — never the loaded war's `forgetPersonFrom`. Its done mark, `poDone`, goes in
   that squadron's stored profile, in the same command. When that war later loads, its own pass skips the posting: run
   once, never twice.
   - **It says nothing on screen** (Fable 2, Opus 3 of round 3). The loaded pass tells a held posting by a passing note
     to whoever is signed in (`tellOnce` → `HOOKS.toast`, `sync.ts` l.2674, l.2770); run from the foreign half, a 142
     member would read "Kestrel is 149's last admin. The posting waits until 149 has another admin." So the foreign half
     writes no passing note: a held foreign posting shows only as Admin → Users' held note on that man's row (A6, below),
     which only that squadron's admins — at home or by Plan — and a master admin see. One exception, today's words for the man himself: a Delete that
     removes the signed-in person says "You have been deleted by your posting out — please sign out" (l.2845) — dormant
     while every own page is his home's.
   - **Its command type is the loaded pass's own, `lw.postoutRun`** (Fable 6 of round 3). The timeline keeps a posting
     run out of every person's step by that type alone (`timeline.ts` l.193), and the gate lets the app's own posting
     run write with no maker by it (`notices.ts APP_ACTS`, l.326); phase 1's gate chain (step 7) admits the second
     store's rows under the same type. A new type would fold the run into the step that woke it — the master admin's "make
     another 149 admin" — and his Undo would carry the archive.
4. **Only in its own command, and never lost** (Astra 4; D306 — "it runs by itself once the reason goes"). The foreign
   half never runs inside another command; one that would (a Post out, a member's save — `sync.ts` ~2785) leaves it
   **owed**. Owed work is kept until a foreign run completes; a stopped run leaves it owed; a refused posting is given up
   for the session (step 2), never retried after every later command.
5. **When it runs:** at boot; on the midnight wake; and once, coalesced, after any committed command that changes
   accounts, people, homes or rights — what a held posting's reason reads (`poHeldReason` → `lastAdminLock`) — or a
   squadron's stored postings, or leaves work owed. So 149's posting, held at midnight as its last admin's, runs by
   itself the moment the master admin makes another 149 admin, with 142 loaded and no posting touched. Not on every notify
   (Opus M4 of round 1); it reads other squadrons' stored `profile:` rows only. C10's measure includes it.
6. **One audience** (Opus M6 of round 2; Astra 3, Fable 5, Opus 8 of round 3; D2194, D2214, D2202, D2198): a posting's
   bell lines go to `accounts.ts adminsOf(unit, today)` (core, phase 1). **Who:** the accounts that count under §5.2's
   one rule — admin role, switched on, the man on the roster — that are (a) at home in that squadron today, or (b) not a
   master admin and holding Plan of it today by a right (`levelFrom`): D2202 — "while an admin holds Plan of another squadron,
   his bell carries that squadron's admin lines, on by default", and no switch to turn them off is built yet. A master admin
   counts through his home only (D2198: his other squadrons' lines are off by default); a View holder never. Today the
   loaded pass tells (a) alone (`ownSchedulerIds`, `sync.ts` l.1462), so a squadron whose one admin is a Plan holder at
   home elsewhere (§5.2 allows it) heard nothing of its postings. **"That day" is the run's day — today — read after the
   outcomes,** as the loaded pass reads it (l.2853–2859: an admin archived by his own posting is not told). Both passes
   and the gate call it with the same day, so a pass run late is never refused for reading the posting's date.
   `ownSchedulerIds`' two other readers — the "off the manpower" line each admin's bell works out (`postedLines`,
   l.1624) and a posting's take-back lines (l.3317) — are posting lines too and read the same set. D2202's mark of which
   squadron a line is from is not built (its row: "Not built: filed under [MULTI-SQN-DESIGN]"); nobody holds Plan today,
   so no bell shows such a line before it is (§11, §14).
7. **The gate (core, phase 1, before the caller is built):** `postingPassViolation` takes each `lwx.profile` change as a
   posting record too: it must match that squadron's stored posting (a probe reading the stored world of the squadron
   named in the id), the man's home before the pass must be that squadron, and each bell line's reader must be in
   `adminsOf` for that squadron and **today**. The loaded war's postings keep today's checks, their readers read the same
   way (Fable F3, Astra 4 of round 1).

**The held note (A6):** `postingHeldNote(id)` and `poHeldReason` read the man's own squadron's posting — the loaded war
when it is his squadron's, else `readForeign` of his home unit.

**A delete reaches every squadron's planning calendar (B1).**
- **The writer:** the one `plan` record, routed (A-ii — Astra 2, Opus M1). `state/plan-foreign.ts` (new) is its stored
  half: for a squadron not loaded it reads that squadron's stored calendar fresh for the record's before-image — asked to
  join a command or a restore, it first loads the stored rows of the ids it will write (Opus 4 of round 3), as
  `foreign.ts`'s `load(pid)` does for its doors — is enlisted in the command layer so a refused command rolls it back
  whole, writes on commit to that squadron's stored rows and drops `PLAN_MEM`'s copy, so the next read sees it; a page
  showing that squadron's calendar re-reads on the commit's notify. An Undo or Redo reaches it through the timeline's
  per-record store (A-ii, helper "undo & roles"), never through the schedule store's write. No collection of its own,
  and nothing in `state/persist.ts` (Opus L7 of round 1). Shared with the Inputs calendar of a squadron that is not the
  pick (A-ii).
- **The strip:** `state/plan.ts stripGoneFrom(unit, pid, cutoff)`, run inside the delete's own command, for his home
  squadron's calendar and any squadron's calendar that names him.
- **The gate line (core, phase 1):** section 7 lets a delete change another squadron's planning row it holds no admin
  right in only when (a) the same command deletes that man (`personDeletedHere`), and (b) each such row is dated on or
  after his cutoff and its after-image is its before-image with his id blanked and trailing blanks trimmed — or the row
  is removed where that leaves it neither words nor people (step 3c's own rule). Nothing else of any row may change
  (compare fix read 12's fault B).
- Written through, not laid over at read, so the stored copy is true and a later edit of that note saves cleanly.

**What stays per loaded war, and why:** the OIL pass and the absence pass. Their results are seen only on that war,
which runs both every time it loads (`swapWarWorld`). The posting pass is the one whose effects reach beyond its war:
archive, suspend, delete. Astra found no failure in this choice.

### 6.3 Faults it closes
- **Closes:** A1, A5, A6, B1, and A7 with Piece A, less his answer on the master admin.
- **Left one-by-one:** A4 (§7).

### 6.4 Tests
- The proofs A1, A5, A6, A7, B1, red first.
- A1: a saved move writes no posting record; Admin → Users shows no posting tag on a moved man; Undo of the move gives
  142's war his open months back in the same session; a saved joining window, a SANS man, two stints (one row, away
  between), a posting cancelled; a war already open when the move is saved.
- A7: on a day now the other squadron's — removing one entry of a two-entry cell, and the last entry, each by a verified
  Undo, allowed; adding or changing an entry, and an Undo putting one back, refused.
- A5: loaded and foreign postings in one run; the foreign war loading later (run once); repeated runs; a pass joined to
  another command (the foreign half owed, then run after it); a refused foreign write rolled back whole; a held 149
  posting run by itself when the master admin makes another 149 admin, no posting touched and 149's war never loaded; a
  foreign Delete: the man marked deleted, his account gone, his war half through the foreign war, and the done mark
  written only with both. **Round 3:** two squadrons' due postings with one bad one (Viper's 149 posting, Viper moved to
  142): the others run, each in its own command; the bad one skipped by both passes, never retried after later commands
  (Opus 2); a refused foreign posting not tried again this session, run on the next boot; a held foreign posting — a 142
  member sees no passing note, the master admin's Admin → Users shows the held note (Fable 2, Opus 3); the run's type is
  `lw.postoutRun`, so the master admin's Undo after the held posting ran takes back only his "make another admin" (Fable 6);
  the audience — a home admin, a non-master admin Plan holder (told), a View holder, an unrelated admin and a master admin at home
  elsewhere (not told), from either pass and at the gate, with a pass run days after its posting's date (Astra 3,
  Fable 5, Opus 8).
- B1: the master admin's case; an ordinary admin's case (Ranger moved 149 → 142, still on a future 149 note, deleted by 142's
  admin); a refused delete leaves the other calendar untouched, stored and cached; a reload; editing the cleaned note
  afterwards; a forged delete that changes anything else of the row refused.

### 6.5 Risk, walks, readers
- **Risk:** writing another squadron's stored war or calendar from a pass or a delete; a double run; lines to the wrong
  squadron; a deleted man's calendar row edited at the same moment; a stint field leaking into saved postings.
- **Walks:**
  - both wars across a saved move, three days, desktop and iPhone;
  - a 149 posting on a day only Saber signs in;
  - the master admin's Admin → Users held note, then another 149 admin made: the posting runs with no other step;
  - a delete with the other squadron's calendar naming him.
- **Readers:** run-once, both halves of a foreign Delete, owed work never lost, one posting per command and a refused
  one given up, a moved man's posting skipped by both passes, nothing said by the foreign half, the run's type, rollback,
  the audience of each line and its day, the pass's gate chain, the planning gate line and the stored half's load before
  it joins, the war line's contents rule, and that no stint reaches a saved row.

### 6.6 Files
- **Helper "war":** `leavewar/sync.ts`, `leavewar/state/store.ts`, `leavewar/state/raptorRoster.ts`,
  `leavewar/state/foreign.ts`.
- **Helper "session":** `state/plan.ts`, `state/plan-foreign.ts` (new), `state/sched-commit.ts` (the `plan` routing),
  `state/person-delete.ts`, and `state/store.ts`'s `PLAN_MEM`.
- **Core (phase 1):** the pass's gate chain, `adminsOf`, the planning gate line and 7b's contents line in `perms.ts` and
  `accounts.ts`.

## 7. The one-by-one fixes, each red first

- **R6:** `perms.ts stampForged`'s member rule compares the refusal's who and when in both directions: removing either
  stamp, or both, is refused. A verified replay and R1's lawful move are exempt. Core builder, phase 3 (R1's fix is on
  this branch, `19608876a`).
- **K4 + B5** (helper "undo & roles", after A-v):
  - The blue/red answer's change id carries its squadron: `<unit>@<encodedRoleId>`, split in the role store and the
    decoder.
  - The `persist.ts` mapper writes `ensureUnit(id)` instead of `qualify(UNIT, …)`. The stored key is unchanged
    (`u142@missionrole:…`), so no saved data moves.
  - The gate's section 7 then sees the squadron, and Undo's `inUnitView` filters the step by it.
  - Files: `engine/mission-role.ts`, `engine/insights.ts`, `state/mission-roles.ts`, `state/persist.ts` (the mapper
    line), `state/changelines.ts` (with l.635's day, A-i), `ui/mission-role-offer.ts`; `state/undo-wire.ts` and
    `undo/derive.ts` after A-v in the same helper.
- **C8:** `engine/weekstash.ts stashDays` passes `qk(v)` to `viewOfWeek`. Helper "schedule".
- **C9:** in Piece 0, first.
- **A4 (= rest-file P5, D2195, D2207):**
  - Remove `setPlaceHolidays`, `withPlaceHolidays`, `PLACE_PH`/`PLACE_VER`, `placeHolidaysFor`, `ownPublicHolidays` and
    `PLACE_CACHE`.
  - `nonWorkingFor(unit, iso)` reads only that squadron's own list. `holidayOutOfDate` gives only the war's own
    squadron's days. `holidayTodo` tells its own schedulers only. `oilOpenOn` → `oilAskPlan` → `isNonWorkingISO` judges
    each squadron's input by its own squadron's holidays — the call site Opus A says is easy to miss.
  - In `perms.ts` 7e, remove the holiday line's crossing exemption.
  - `ui/oilday.ts`'s warning takes the words he ruled (D2207).
  - Rewrite `leavewar/holidays-by-place.test.ts`'s first case to D2195. It asserts the behaviour he overturned — named
    here and in §9.2.
  - Files: `leavewar/state/store.ts` (where `PLACE_PH`, `setPlaceHolidays` and `withPlaceHolidays` live — Opus L7),
    `leavewar/sync.ts`, `state/perms.ts`, `ui/oilday.ts`. Built in phase 3, by the core builder, once helper "war" and
    helper "own pages" have finished with them.
- **R1:** fixed beside the plan (`19608876a`); its walk rides §13.

## 8. Held — and one added, with its reason

- **K2, K3, A3, B7, C7, C10:** held as the host filed them (`OUTSTANDING.md` [MSQ-FIXREAD17-OPEN]). Nothing in the
  reshape needs them, and no round-1 reader showed the reshape making one worse. C10 is re-measured after Piece A (§3.5).
- **B2 — added to the held list, with B7.** The guest's squadron can only come from his request ("Request access asks
  the squadron first", D2094, step 5 — B7). Until then a waiting person has no squadron:
  - his session sits in 142 and sees 142's week, so 142's switch is the only one that can consistently govern what he
    sees;
  - both readers' stop-gaps are product choices: one switch for the whole app (Opus), or "any squadron's switch lets
    him in" (Fable). Either would let one squadron's admin decide for another's guests.
  So the right fix is B7's: the request names its squadron, the guest session starts there, and that squadron's switch
  decides. The proofs B2 and B2b stay red and named until then. Whether he wants a stop-gap meanwhile is §12 Q5.
  **— Changed 20 Nov 26 by his D2239: the guest view is removed, so B2 is no longer held.** A one-by-one job (core
  builder, phase 3, after the helpers): the Admin "Guest view" switch, the waiting screen's "View the schedule" button,
  the guest session and its app (`ui/GuestApp.tsx`), the guest role's cells in `perms.ts` and `data-model.md` §11, and
  their tests — each test that pins the guest view rewritten to pin its absence, named in the report; B2's and B2b's
  proofs rewritten to "no squadron's switch exists" and green. B7 (the request names its squadron) stays with step 5.
  The documents' pointers (`ui-contracts.md` §The access screens and the guest view) are then rewritten to the app.

## 9. Tests, overall

### 9.1 The red-first protocol
For each fault:
1. Copy its proof into the area's real test file.
2. Run it on the code before its fix — red.
3. Fix, and run again — green.
4. The host reruns both runs.

The 40 proof files keep their `.txt` copies in the briefs folder as evidence. The measuring files (C10, C10b) stay
measures, not gates.

### 9.2 Existing tests that change their setup, never their assertions
- **B6** makes `addUnit` require a first admin. Fifteen calls in six files make squadron 150 with none:
  `leavewar/multi-sqn-fixread9.test.ts`, `…fixread10.test.ts`, `…fixread11.test.ts`, `…fixread12.test.ts`,
  `state/units-sqn-fixread16.test.ts`, `state/units.test.ts` (l.147–162, which tests `addUnit` itself — its two refusal
  cases stay). So do the proofs R2, R3 and R4.
- Each names `bystanderAdminOf(…)` from Piece 0: a seeded admin who plays no part in that scenario. The host checks,
  file by file, that the chosen account is not one the assertions read.
- `holidays-by-place.test.ts`: the one assertion rewrite under a ruling he gave (§7, A4, D2195).

### 9.3 Existing tests rewritten to a ruling's outcome
- **§4.5's fourteen**, under Piece B's cut and its two guardrails: each sets up a right standing across a move (D2203
  forbids it), reads the right on the save day (his Q4), or pins a right put back after its man's move or left standing
  by a re-link (a build choice no ruling names). Named there, with what each keeps.
- **Anything else that turns red** is understood before it is touched. A test that pins only a way of doing something
  no ruling requires is rewritten to pin the ruling's outcome. Each such test is named in the report and read by the fix
  read. None is deleted.

### 9.4 New tests
- §3.4, §4.4, §5.4 and §6.4.
- The behaviour guard (Piece 0) and the setting guard (A-ii).

### 9.5 Gates
- The whole gate set on GitHub's run (the repo is public).
- `npm run build`, for the type check.
- `node reference/tfin.js` 728/0.

## 10. File ownership, build order, and what is built at the same time

**Who owns each shared file.** `state/perms.ts`, `state/units.ts`, `state/units-model.ts`, `state/accounts.ts`,
`state/notices.ts` and `state/lastadmin.ts` are written by **one builder only, the core builder**, in order — D2238's
reading, "the core reshape is one job, its files shared". Where a helper needs a line there (the war's day probe, the
pass's chain, the planning gate line), the core writes the gate's half first, in phase 1, and the helper installs or
calls it. `boot.ts`, `state/store.ts` and `state/sched-commit.ts` are helper "session"'s alone, and in phase 3 the band's
files (`state/typing-hold.ts`, `leavewar/ui/Sheet.tsx`, `tracker/components/Pop.jsx`, `Modals.jsx`);
`leavewar/state/store.ts` and `leavewar/sync.ts` helper "war"'s in phase 2 (the core takes both for A4 in phase 3);
`state/persist.ts`, the Undo files and `command/commit.ts` helper "undo & roles"'s; `ui/InputsCal.tsx`, `ui/oilday.ts`,
`state/flyplan.ts`, `state/flyplan-model.ts` and `engine/qualcols.ts` helper "own pages"'s in phase 2 (the core takes
`oilday.ts` for A4 in phase 3); `ui/InputWindow.tsx`, `ui/inputedit.tsx` and `ui/PeoplePick.tsx` helper "schedule"'s,
in phase 2 and for Q8's words in phase 3.

| Phase | Who | What | Files |
|---|---|---|---|
| 0 | core | Piece 0: shared world with its midnight helper, C9, behaviour guard (green rows) | `test-support/msq-world.ts`, `testing/enumguard.ts`, guard tests, `state/msq-move-readers.test.ts` |
| 1 | core | **Piece A's bodies (expand):** home handle with `changesIn` and the per-person index, `stintsIn`; `inputSpanIso`, `inputSquadrons`, `inputOnDay`, `inputTouches`, `inputsListed`; `pageUnit`, `unitSetting`; `membersFileOn` (B4); 7c, `filerUnits`, `inputUnit`, `movedSince`/`homesOver`/`noticeLeftBell`/`restoredDayHolds` on the one body; `inputsFor` kept as a thin alias, defaults kept. **The halves later jobs build on:** the pass's gate chain for another squadron's postings and `adminsOf` (home admins and non-master admin Plan holders, today — §6.2 step 6); the planning gate line; 7b's war-day contents line with its probe setter; `inputWhoProblem`, 7c's who-rule lifted (C6) | `units-model.ts`, `units.ts`, `engine/roster.ts`, `engine/inputs.ts`, `engine/hooks.ts`, `perms.ts`, `notices.ts`, `accounts.ts` |
| 2 | core | **Piece B** (after his Q4, or as recommended if it has not come — §12): the reading rule with `pidFrom` required and every hand-built account; **guardrail 1:** the re-link's who, its drop of every right, the re-link line at the gate, the body that finds a right standing on a re-linked sign-in; **guardrail 2:** `restoreLeavesOut` (with the step's recorded holders and the row as it stood when taken off) and the gate's before/after rule asking it, with `restoreLeavesOut`'s own table tests; "moves tomorrow" for gives and raises; G4 and l.1999 on holding rights. **Then Piece C** (C's counting reads B's rule), a new squadron judged on every date, the re-link's door asking it with its drop | `units-model.ts`, `units.ts`, `perms.ts`, `notices.ts`, `accounts.ts`, `lastadmin.ts` (new) |
| 2, at once | helper "schedule" | A-i callers on the schedule side, C4, C6's whole-draft picker and save door (on phase 1's `inputWhoProblem`), C5's slot, C8, the landing callers renamed (first day), `editlog.ts` | §3.6's list |
| 2, at once | helper "own pages" | the own-page setting inventory first (read only; each line to its file's owner — A-ii), A-ii callers, C2, C11, the setting reads and writes in its files; **last**, once "session"'s routed planning writer and "undo & roles"' per-record store are committed, the Inputs calendar's notes, titles and edits by the page's squadron | §3.6's list |
| 2, at once | helper "war" | A1 (stints apart from postings) with A7's probe, one tested change; A5's caller (on phase 1's gate chain): both halves of a foreign Delete, owed work, the coalesced run after accounts, people, homes or rights change, one posting per command and a refused one given up for the session, a moved man's posting skipped by both passes, no passing note from the foreign half, the run typed `lw.postoutRun`, `adminsOf` with today for both passes and `ownSchedulerIds`' other readers; A7's Undo sentence beside its probe, once Q6 is answered; A6; `oilOpenOn` by day and the named today readers; the flying plan's calls the inventory names | `leavewar/sync.ts`, `leavewar/state/store.ts`, `raptorRoster.ts`, `foreign.ts` |
| 2, at once | helper "session" | the Tracker's load path read first; the routed `plan` writer (`sched-commit.ts`'s `plan` case and its stored half, which loads the ids it will write before it joins), then B1's strip; `store.ts`'s input callers (first day, F4); `enterSquadron` with its band slot, the pick rule and the Tracker rebind, **the midnight trigger off**, its hold answering "none" | `boot.ts`, `state/store.ts`, `state/sched-commit.ts`, `tracker/storage.js`, `tracker/TrackerPage.tsx`, Tracker load files, `state/plan.ts`, `state/plan-foreign.ts` (new), `state/person-delete.ts` |
| 2, at once | helper "undo & roles" | **A-v first** (the stamp, the squadron-qualified key in `commit.ts` and the timeline — `lwx.profile`, `lwx.ledger` and `lwx.rec` keyed as the war's own records — `verifiedWarRestore` and `carrySeen` on it, eligibility, a step in a world he can no longer enter blocked for good), then K4 + B5; then — once "session" commits the stored half — the timeline's per-record store for the planning record, with its two-direction tests; then — once the core's Piece B is committed — the leave-out wired into the timeline's hook, the holders recorded on each step, the gate's probe, a step the leave-out empties and a re-link's standing right, each blocked for good, with §4.4's re-link and guardrail-2 tests through the real timeline; then — once "war" commits A7's sentence — its one `restoreRefusal` line | `state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts`, `command/commit.ts`, §7's K4 files (`state/persist.ts`, `state/changelines.ts` among them) |
| 3 | core | **Contract:** remove the defaults (with `levelIn`, `levelOfAccount`) and `inputsFor`'s no-day form; the date check in development (A-i); the compiler lists stragglers (each in a helper's file goes back to it, by then finished). R6. A4. The answers as they come. Docs: `data-model.md` §11 (`UnitGrant`'s rule: holds while its man stays in his squadron, one holding per account, squadron and day, an ended one never back, none put back by a restore after its man's move; `home.set` writes no right — Fable F11; the re-link's who, and its drop of every right — guardrail 1), `data-schema.md` (an input's `u` if C3 is answered so; no grant field changes), `file-map.md` (new files), `feature-impact.md` (the new seams: `enterSquadron`, `pageUnit`, the stamp and the squadron-qualified key on Undo, the routed planning record, `inputWhoProblem`), `notifications-register.md` (A5's lines to the man's own squadron's admins and its Plan holders, D2202; the foreign half's held posting said only by Admin → Users' note) | core files, `leavewar/sync.ts`, `leavewar/state/store.ts` and `ui/oilday.ts` (A4), docs |
| 3 | helper "session" | **the midnight swap switched on**, once "undo & roles" has merged: A2's proof and the Undo-across-the-swap tests red first; the hold on an open window; the band built once his Q7 is answered | `state/store.ts`, `state/typing-hold.ts` (new), `leavewar/ui/Sheet.tsx`, `tracker/components/Pop.jsx`, `Modals.jsx` |
| 3 | helper "schedule" | Q8's sentence, once he has answered | `ui/InputWindow.tsx`, `ui/inputedit.tsx` |
| 4 | host | Whole gate run; the combined four-reader fix read, blind; fixes red first; re-walk what the fixes touched; evidence sheet; his look | — |

- **The Plan audit's items (§19), each by its file's owner:** phase 1, core — PC1 (§7e passes a line to a reader in
  `adminsOf`), PD1 (`putNewHome` by the page's squadron), PE1's core half (`mayEditSched` and the page's admin
  question); phase 2, core with Piece B — PA1, PA2, PA3, PH1; phase 2, helper "war" — PB1, PB2 (on phase 1's `adminsOf`
  and PC1); phase 3, core with A4 — PB3, PB4, PB5. Each proof copied from `…/briefs/2026-11-20-msq-plan-audit-repro/`
  red first (§9.1). PF1, PG1, PK1 are not this build's (filed with step 5, P2 and P1). **The blind read's items (§19b):**
  phase 1, core — R5 (PE1 rewritten, O3 in its tests); phase 2, core with Piece B — R1, R7; phase 2, helper "session" —
  R6 (dormant); phase 3, core with A4 — R3, R4; phase 3, documents — R13. R2, R9, R10 filed with P3/P4; R8 and R12
  wait on him; R11 is K4 + B5.
- **Who builds and reads (his D2244, 20 Nov 26):** Opus, high thinking, builds — the chat started in Opus, not Fable;
  **Fable reads the core's rights change — Piece B with Piece C, phase 2's core commit — blind, on an exported copy,
  before any helper builds on it**, every claim reproduced red before it counts; Sonnet walks; the four-reader fix read
  of phase 4 stands (D2236).
- **No two jobs built at once share a file.** Phase 2's helpers start only once phase 1 is committed, because they call
  its bodies and gate halves. The core builder's phase 2 runs beside them.
- **Ordered inside phase 2:** "own pages" wires the Inputs calendar only after "session" commits the routed planning
  writer and "undo & roles" its per-record store; "undo & roles" builds A-v before K4 + B5, its per-record store only
  after "session" commits the stored half, its Piece B lines only after the core commits Piece B, and A7's
  `restoreRefusal` line only after "war" commits the sentence; "war" builds A5's caller on phase 1's gate chain, and A1
  with A7's probe as one tested change (Astra's order note of round 1). No phase-3 job shares a file with another: the
  core's A4 files, session's band files and schedule's window files are disjoint.
- **Tests that rest on two jobs — who writes each, and when** (Fable 8, Opus 7 of round 3). A test is committed green by
  the job that makes it pass, never red by one waiting on another:
  - §4.4's re-link and guardrail-2 tests through the real Undo (core's Piece B + the leave-out's wiring): helper "undo &
    roles", at the commit that wires the leave-out; the core's phase-2 commit carries only the pure body's table and the
    gate's own tests, which need no wiring.
  - §3.4's planning-calendar Undo in both directions (session's stored half + undo & roles' per-record store): helper
    "undo & roles", at the per-record store's commit; the same through the Inputs calendar's page, helper "own pages" at
    its last commit.
  - A-v's "a 149 posting, then Kestrel's Undo of setting it: refused as a later change": helper "undo & roles", through
    an Admin → Users door, which exists today (Opus 7); the same with the foreign pass running the posting (undo & roles
    + war's A5): the host, at merge.
  - A5's "a foreign Delete strips every calendar naming him" (war's foreign Delete + session's B1 strip): the host, at
    merge, after both.
  - A7's Undo sentence through the top bar's Undo (war's sentence + undo & roles' wiring): helper "undo & roles", at
    its wiring commit.
  - The midnight swap's Undo tests (session's switch + undo & roles' A-v): helper "session" in phase 3, as now.
  The host's merge tests are written and run on the branch that holds every phase-2 job, before phase 4's fix read, and
  named in the evidence sheet.
- **Merge order:** the core first, then each helper in turn, each bringing the core in before its own tests run.
- **Unsure, found out at the start:**
  - Whether helpers can each work in a worktree of their own (the Agent tool's worktree), given the "one checkout per
    session" guard. A trial write settles it.
  - If not, the helpers run one after another in the one checkout, still on disjoint files, the host committing between
    them, in this order: undo & roles (A-v, K4 + B5), session, war, undo & roles again (the per-record store, Piece B's
    lines, A7's line), schedule, own pages.
- The gate lock (D228) holds for every full suite, multi-file browser run or fanned walk.

## 11. What a person sees — none of it new, except where named

| Change | On screen | Needs |
|---|---|---|
| A1 | Ranger moves 142 → 149 from Thu 16 Jul. 142's Leave War: his row as now up to Wed 15 Jul, then the war's "away" look (not in manning, no bids), with no posting hatch or tag — no posting was set. 149's Leave War: his row from Thu 16 Jul, away before it. Admin → Users: no "posting out" tag on him | **A drawing first (D1625)**, desktop and iPhone; his look §12 Q6. Checked: round 6's and round 7's transfer pictures draw only the Post out sheet (X1, X2, TA, TB, TF), never a war row after a move — a new drawing |
| A7 | On 142's Leave War, Ranger's days from Thu 16 Jul take no new leave: they read as a posted-out man's days do today (the "away" look, no bids, a range skipping them) — no new words there. New: Prowler's Undo that would put Ranger's leave back on Fri 17 Jul in 142's war is refused, proposed "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War." | Drawn with A1's drawing (§12 Q6); built with A1, so it waits with it. Until then Undo's existing "That couldn't be completed just now." |
| A2's band | Ranger has a Leave War window open at 23:58 on Wed 15 Jul; his move to 149 counts from Thu 16 Jul. At midnight the window stays, with one band across its top — proposed "You are 149's from today. This can't be saved in 142's Leave War." — and one button, "Close", which opens 149's Leave War. A Tracker pop-up open: the same, "…in 142's Tracker." | **A drawing first (D1625)**, desktop and iPhone; the words his, §12 Q7. Until then the page waits for the window to close, without the band |
| C6, C1 across a move | Ranger is 149's from Thu 16 Jul. Prowler, 142's admin, files leave for him on Tue 14 Jul, then stretches it to Fri 17 Jul and taps Save: the window stays open and the app's passing note says, proposed, "Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move." The same when Kestrel, 149's admin, saves a change to that leave from 149's Inputs list (C1 now shows it there). The picker already leaves Ranger out of a 14–17 Jul draft of Prowler's | **A drawing first (D1625)**, desktop and iPhone; §12 Q8. Until then the save door refuses with today's generic words |
| A2 | A page left open across midnight of his own move shows his new squadron's schedule, war and Tracker. If a step he can still undo shares a record with one left in his old squadron's war (Osprey's leave filed at 23:30, then moved in 142's Leave War at 23:50), his Undo says once today's "A later change touches the same thing and can’t be undone." and the next press takes the step before it — never "undo that first" again and again | No new element; today's words (Fable 4 of round 3). Named so he knows |
| B3 | Suspend, Demote, Archive or Delete of a last admin with a move saved: the approved sentence where "That did not save" stood | Built to picture 9b (D2217 Q15); drawing check (D1494) |
| A4 | 149 stops showing 142's holidays (the fault going away); the warning names only its own days, in the words he gave | The words are his, verbatim (D2207). The agent's reading: no drawing, as nothing new is drawn — the readers may disagree |
| C1, C2, C4, C6, C11, B1, A5, A6 | Lists and counts correct themselves; a 149 posting runs on its day, and a held one runs by itself once 149 has another admin; a held note shows for a 149 man on the Admin → Users of a master admin or an admin with Plan of 149 (the existing look). No passing note about another squadron's held posting reaches anyone — a 142 member never reads that 149's admin is its last (Fable 2, Opus 3 of round 3) | Faults going away |
| R2–R5, K1, B6, B4, K4/B5, C8, C9, R6, A-v, the Inputs calendar's squadron, the re-link's who | Nothing today — no screen saves a move, a place, a right or a squadron yet, and no screen picks another squadron. A step left in a squadron he can no longer enter is passed over by Undo, as a step in another squadron is today | — |
| The two guardrails (§4.3) | Nothing today: no screen gives or takes View or Plan, and outside the tests nobody holds one, so a re-link on Admin → Users has nothing to drop. Once one can: a re-link takes the sign-in's View and Plan away, and its Undo gives the sign-in back without them; an Undo of a right's removal or lowering after its man's move puts nothing back and says "Something else changed this after your action — it can’t be undone now."; an Undo of a re-link while a right given since stands says "‹callsign› changed this after your action — it can’t be undone now." | Today's words, no new element. Whether Admin → Users' re-link should say first what it takes away is a new thing on screen — drawn when a screen first gives a right, not here (§14) |
| A5's audience (§6.2 step 6) | Nothing today: nobody holds Plan. Once one can, a Plan holder's bell carries that squadron's posting lines, as D2202 rules | D2202's mark of which squadron a line is from is drawn and built before any screen gives Plan (its row, [MULTI-SQN-DESIGN]) |

## 12. His questions — where each answer plugs in, and what happens until then

Each is put to him with its picture where it has one (D853). Q4 is asked before Piece B starts (phase 2); Q6, Q7 and
Q8 are drawings shown before their part is built.

**ALL EIGHT ANSWERED, 20 Nov 26** (marked by chat 126): Q5 by D2239 (remove the guest view); Q8 by D2240 and D2241
(the words name "an admin of both 142 and 149", never "master" alone); Q1–Q4, Q6 and Q7 by D2243 (*"The rest of the
questions as recommended"*). The drawings on the questions page are the approved looks (D1478;
`raptor-port/docs/mock/2026-11-20-multi-sqn-reshape/`). No "until then" stands: each part below is built as answered.

- **Q1 (C3) — does an ALL AVAIL meeting stay on the squadron it was filed on, or follow its filer's move?**
  - *Example:* Hunter files a 142 squadron meeting (ALL AVAIL) for Fri 24 Jul. His move to 149 counts from Thu 16 Jul.
    Today, from the 16th the meeting leaves 142's schedule and shows on 149's. Recommended: it stays on 142's.
  - *Recommended: stays* — a squadron's meeting is its own business (D2194), and a master admin or an admin with Plan of it who files one from the other
    squadron's schedule (D2197) does not file it into his own.
  - *Plugs into:* `inputSquadrons`' placeholder branch reads `r.u`. If "stays", filing stamps `u` — `InputWindow`'s
    save, and the demo seed's placeholder inputs.
  - ~~*Until then:* the reader honours a stamp, but nothing writes one, so today's behaviour stands and proof C3 stays
    red, named.~~ **ANSWERED 20 Nov 26 by D2243: it stays on the squadron it was filed on.** Filing stamps `u` on a
    placeholder-only input (`InputWindow`'s save and the demo seed's placeholder inputs); proof C3 goes green.
- **Q2 (C5) — sign-off boxes: the day's people, or today's?**
  - *Example:* on Wed 15 Jul Hunter opens 142's week of Mon 20 Jul. Ranger is 149's from Thu 16 Jul. Today the sign-off
    boxes for Mon 20 Jul still offer Ranger. Recommended: they offer only Mon 20 Jul's 142 people — not Ranger — as the
    crew list beside them already does.
  - *Recommended: the day's* — the same as the crew list beside it, and as D2184 Q13's detachment boxes ("anyone of its
    own squadron").
  - *Plugs into:* `signPeople(schedOnly, keep, di)` reads `rosterOf(UNIT, dayIso(CURWEEK, di))` or `todayIso()`; one
    line.
  - ~~*Until then:* today's, as now; proof C5 stays red.~~ **ANSWERED 20 Nov 26 by D2243: the day's people,** as the
    crew list beside them; proof C5 goes green.
- **Q3 (A7) — may the master admin still write a man's leave into his old squadron's war for a day that is now the new
  squadron's?**
  - *Example:* Ranger is 149's from Thu 16 Jul. Saber, the master admin, has 142 open and tries to put Ranger's leave on
    Fri 24 Jul into 142's Leave War. Recommended: refused, for Saber too — he picks 149 in Schedules and writes it there,
    as 149's admins and Ranger can now.
  - *Recommended: refused for everyone.* The day belongs in 149's war. D2221's reading ("only the man, or an admin of both" — D2240's correction) was
    about who may change leave across a move, not which war holds it.
  - *Plugs into:* one flag in the war-day rule (7b's backstop, and the war's own door on the master admin's row). A change that
    only removes is never refused by it; an Undo that would put leave back on such a day is (§11, words with Q6).
  - ~~*Until then:* refused for everyone, as the proof expects.~~ **ANSWERED 20 Nov 26 by D2243: refused for
    everyone,** master admins and Plan holders included; a removal is never refused; an Undo that would put leave back on
    such a day is refused with "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War."
- **Q4 (Piece B's timing) — when a man moves squadron, do his View and Plan of other squadrons end at the start of his
  move day, or the moment the move is saved?**
  - *Example:* Ranger is 142's and holds Plan of 150 — full admin of 150. On Wed 15 Jul at 10:00 Hunter saves Ranger's
    move to 149; it counts from Thu 16 Jul. Recommended: Ranger keeps full admin of 150 for the rest of Wednesday — he
    can still change 150's schedule, people and leave — and from Thursday 150 is gone from his Schedules menu. A transfer
    saved months ahead works the same: he keeps it until the transfer's date. The other way: 150 vanishes from his menu
    at 10:00 Wednesday, while he is still 142's for the rest of the day.
  - *Recommended: the start of his move day* — the day his move itself counts from (D2119), and the way the transfer sheet
    he approved ends "His access to 142" on the transfer's date (D2160). So a transfer set months ahead ends his rights
    on its date, not months early; a move taken back the same day needs no rule (R2 closes without asking him); and an
    Undo of a move touches nothing but the move (§4.2).
  - *Plugs into:* Piece B's reading rule (§4.3). The other answer means round 1's stored end and its extra checks (§4.7).
  - ~~*Until then:* nobody can see either way — no screen saves a move or gives View or Plan yet. If his answer has not come
    when Piece B starts, it is built as recommended and changed if he picks the other.~~ **ANSWERED 20 Nov 26 by D2243:
    the start of his move day** — Piece B's reading rule (§4.3) as written; a transfer set ahead ends them on its date;
    §4.7's other cut is not built.
- **Q5 (B2) — the guest switch: wait for "Request access" to ask the squadron (step 5), or a stop-gap now?**
  - *Example:* Kestrel, 149's admin, turns on 149's guest switch. Today a guest still lands in 142's week, and only 142's
    switch lets him in. Either stop-gap — one switch for the whole app, or any squadron's switch letting him in — means
    Kestrel's switch would let a guest into 142's week, a choice that is 142's admins' to make.
  - *Recommended: wait for step 5,* where the request names its squadron and that squadron's switch decides (§8).
  - **ANSWERED 20 Nov 26 by his D2239: remove the guest view.** No switch, no button into it, no guest session: a person
    waiting sees only the waiting screen until an admin of his squadron approves him. B2 moves to one-by-one (§7, §8).
- **Q6 (A1's look) — a moved man's row on both Leave Wars:** the drawing §11 names, with A7's Undo sentence beside it.
  *Recommended:* his old squadron's row ends in the war's existing "away" look, with no posting tag, because no posting
  was set. *What he will see of leave already approved* (Fable 10): Ranger's leave approved in 142's war for Mon 20 Jul,
  before his move, stays stored in 142's war but out of sight in the "away" stretch; 149's war does not have it until
  the Transfer batch carries it across. The schedule still shows the leave itself (the input stands). ~~*Until then:*
  A1's fix, and A7 with it, waits on his look; the war keeps today's rows.~~ **ANSWERED 20 Nov 26 by D2243: as drawn** —
  the old war's row striped from the move day, the new war's before it, without "PO" and with no posting tag; the drawing
  is the approved look (D1478), built to it and checked beside it (D1494).
- **Q7 (the midnight band's words):** the drawing §11 names, words proposed there. *Recommended:* the band and "Close"
  as drawn — typing is never saved into the new squadron, and never dropped without a word. ~~*Until then:* the page waits
  for an open window to close, without the band.~~ **ANSWERED 20 Nov 26 by D2243: as drawn** — "You are 149's from
  today. This can't be saved in 142's Leave War." (or "…in 142's Tracker.") with "Close"; the typed words stay visible;
  nothing is saved into either squadron. The drawing is the approved look (D1478).
- **Q8 (C6 and C1's sentence) — leave that runs across a man's move, saved by someone who may not change it.**
  - *Example:* Ranger is 149's from Thu 16 Jul. Prowler, 142's admin, files leave for Ranger on Tue 14 Jul, then
    stretches it to Fri 17 Jul and taps Save. For now only Ranger or an admin of both squadrons (a master admin, or an admin holding Plan of the other) may change leave across his move (D2221, as
    built). Today Save fails with a general refusal that does not say why.
  - *Recommended:* the window stays open and says "Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move." The same when Kestrel, 149's admin, saves a change to that leave from 149's
    Inputs list. (The picker already leaves Ranger out of a 14–17 Jul draft of Prowler's, so this shows only when the
    dates change after he is picked, or on an existing leave.)
  - *Plugs into:* the save door's words for the one whole-draft rule (§3.3 C6); one sentence.
  - ~~*Until then:* the door refuses with today's general words; the fault itself — the picker offering whom Save refuses
    — is closed. Named in the walk.~~ **ANSWERED 20 Nov 26 by D2240 and D2241:** "Not saved: Ranger is 149's from Thu 16
    Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move." — never "master" alone;
    an admin of both by Plan or as a master admin. Named in the walk. **Its opening word is "Blocked:", not "Not saved:"
    (chat 128, 21 Nov 26): his D1667 — a refused change opens with "Blocked:", never "Not saved", the failed-save band's
    alone; D2240/D2241 ruled the sentence's role words, not its opening, and the drawing had none — told to him.**

## 13. The walks (Sonnet walkers, the host opening every picture that decides something; desktop 1536×864 and iPhone 402)

- **Setup:** a move is saved through the developer bridge, since no screen saves one yet. That is setup only; every
  control checked is pressed on screen (the order's §7.0). The browser clock is moved to the day before, the move day
  and the day after. Whether the walk scripts can move the clock is found out from the existing
  `scripts/handpass/msq/` scripts first.
- **The plain-user round (D1557), for each of the four seeded sign-ins:**
  - Inputs: list, calendar (its notes and day titles), filter, his own input, filing for others — a leave picked for a
    man, then stretched across his move (Q8's sentence, or today's words until answered), and 149's admin saving a
    change to it;
  - the schedule's day panel and crew list;
  - publish and sign;
  - Quals, Medical, the SANS calendar;
  - the Leave War — an Undo of an entry on a day now the other squadron's, from a cell of two and of one — and the
    Tracker;
  - Admin → Users with its locks and the re-link — by the master admin and by a plain admin, each then Undo and Redo.
- **Midnight:** the clock moved to 23:58 the day before his move, then past midnight with (a) nothing open, (b) a Leave
  War window open, (c) a Tracker pop-up open; then Undo pressed (his old squadron's step is passed over, his leave filed
  at 23:50 is taken; a leave filed at 23:30 and moved in the old Leave War at 23:50 is said blocked once, in today's
  words, and the next press goes on — Fable 4 of round 3). Desktop and iPhone.
- **R1's owed walk:** a member's refused bid shows no Move (evidence sheet §Fix read 17).
- **Each piece's own walks:** §3.5, §4.6, §5.5, §6.5.
- **Sizing:** by `walk-ledger.md` at build time; FULL tier.

## 14. What the plan could not settle, and how each will be found out

1. **A Plan holder counts as a squadron's admin only where it has none at home** (Piece C). The agent's reading of D2201
   and D2184 Q10, to be told to him with the report. **ANSWERED 21 Nov 26 by his D2247, "As recommended".**
2. **A squadron whose only admin is a Plan holder from another squadron** (Fable F11): when 142's Hunter, 150's only Plan
   holder, has an Overseas posting set, it is held with 150's words on 142's Admin → Users, where 142's admins cannot fix
   it — only a master admin, or Hunter himself while his Plan of 150 holds (D2201: he may make a 150 man an admin of
   150), can make another admin of 150. Told to him with item 1.
3. **The Tracker's re-entry in place** (A-iv). Its load path is read before any change. If it cannot be re-read in place
   cleanly, A2's Tracker part is left as a named one-by-one: the war and the schedule still move, and the Tracker moves
   at the next sign-in.
4. **Helpers in separate worktrees, or one after another** (§10).
5. **Landing a request on each of its days across a move** (Fable F4): not one of the 35. The landing keeps today's
   first-day answer; no reader found a fault in it.
6. **Who may re-link a sign-in that holds only ended rights** (§4.3): the agent's reading of D2191, D2192 and D2199 — an
   ended right gives nothing in its squadron, so dropping it is no act for that squadron, and the man's own admin may
   re-link. One that holds a right in a squadron he is no admin of — at home or by Plan — stays a master admin's: under guardrail 1 the re-link drops
   it, a removal in that squadron. Told to him with item 1.
7. **The two guardrails' cost** (§4.3, the host's decisions after round 3 — technical, nobody can see either today):
   an Undo of a mistaken re-link gives the sign-in back without its View and Plan of other squadrons; an Undo of a
   right's removal or lowering after its man's move puts nothing back — what D2203 would have left anyway. In each, the
   right is given again by whoever may give it. Told to him with item 1, in those words.
8. **The master admin mark is outside guardrail 1** — the agent's reading: it is no right (§4.5's reading of D2203), and a
   master admin's account is changed only by a master admin (D2205), who may make another master admin; a re-link of a master admin's account
   keeps today's rule (the mark moves, dated that day — fix read 10's F10-3, unchanged). Told to him with item 1.
9. **What a person sees once a screen gives View or Plan** — not built here, each a later job's: whether Admin →
   Users' re-link says first that it takes the sign-in's View and Plan away (a new thing on screen, drawn first, D1625),
   and D2202's mark of which squadron a bell line is from, which a Plan holder's posting lines need (§11).

## 15. What this plan does not take from the readers' "shape" sections, and why

- **The Leave War store as one copy per squadron** (Fable A 3, Opus A 2): not taken. His D493 holds "the Leave War's
  saved-data reading" for the database step, which replaces it. `foreign.ts` stays the one way to reach a war that is
  not loaded, and the posting pass goes through it.
- **Bell lines settled when written, and the re-dating hooks retired** (Fable B 5, Opus B 3, core Opus 3): not in the
  35. Under Piece B's cut and its two guardrails the hooks serve only a right removed and undone with no move since, a
  level put back, the link's day and the master admin mark; they still carry fix reads 7–12's pinned cases. Filed as a
  follow-up to propose after the fix read, not done inside it.
- **The gate reading only the saved copy** (security core shape 1): that is K2/K3, held for the database step.
- **Every change carrying its squadron as a required field** (security core shape 2): K4 does it for the blue/red
  answers, the one collection among the 35 that lacked it; A-v stamps the Leave War's and the Tracker's steps and keys
  their records by squadron. The history's `u` field stays as it is.
- **No "u142" fallback** (Fable B 2, core Opus 4): held with A3. Removing the demo's fallback home would make every
  test-made person homeless; it goes at the database step's first boot.
- **One "today"** (`todayIso`, `rosterToday`, `localIsoToday`, the war's `effectiveToday`): no fault needs it. Under
  Piece A every caller names which today it means, which is what matters.

## 16. Round 1's findings and what the plan did

Readers: Fable (F1–F12), Astra (1–7), the fresh Opus reader (H1, H2, M1–M6, L1–L7). Each claim was checked in the code
before it was folded in; the line it rests on is named.

| Reader, id | Found | What the plan did |
|---|---|---|
| Fable F1, Astra 3, Opus H1 | A1's stint written into the war's posting fields is saved as a posting by `setPeople` (l.2501–2504); `reprojectRoster`'s carry-over (l.2576) keeps an old window; a saved window lies over the stint | **Taken** — §6.2 A1: stints in a field of their own, never stored, captured or read by the posting tag; readers use stints cut by the posting window; `setPeople`, the carry-over and kept-man paths changed; `leavewar/state/store.ts` free since R1's fix; tests §6.4; §11 adds "no posting tag" |
| Fable F2, Astra 2, Opus L2 (Undo at midnight) | Undo after the swap writes the old squadron's war or Tracker step into the new one: `inUnitView` (`timeline.ts` l.523) passes steps whose ids name no squadron | **Taken** — §3.2 A-v: every step carries its worlds' squadrons, checked at selection and again before the restore; the swap switched on only after it (§10 phase 3). His history kept, not cleared (D148) |
| Fable F3, Astra 4, Opus M4 | The foreign pass is refused: `postingPassViolation` reads only `lw.postouts` (l.1121–1129), the loaded war's saved copy and home (l.1134–1141), and any admin's bell (l.1180+); it can join another's command; it runs on every notify; its Delete hits the loaded war | **Taken** — §6.2 A5's chain: the gate reads `lwx.profile` against that squadron's stored posting, his home there, that squadron's admins; own command only; bounded runs, profile rows only; Delete through the foreign war; the gate in core phase 1, before the caller |
| Fable F4 | The accepted-mark writers (`store.ts` l.686, l.1114, l.171; `holderbase.ts` l.209) sent to "touches" undo each other's marks | **Taken** — §3.2 A-iii: they and `overlay.ts` keep the first-day answer under its new name; l.171 per protected date; a body that writes never iterates "touches"; test §3.4 |
| Fable F5, Astra 5, Opus M5 | B1's strip has no writer for another squadron's calendar (`sched-commit.ts` l.333 refuses) and section 7 refuses it (l.1278–1292); a loose allowance would let a delete rewrite notes | **Taken** — §6.2 B1: `plan-foreign.ts`, rolled back whole; a gate line bounded to blanking that man from rows on or after his cutoff, inside his real delete; core phase 1; tests §6.4 |
| Fable F6, Opus M2 | With rights ended on save, a new squadron's first admin can never move into it | **Taken another way** — removed by Piece B's cut: his Plan of 150 holds until the morning he becomes 150's (§5.3); a test and a lock-table row |
| Fable F7, Opus M3 | Undo of "+ New squadron" refused by the place-date rule and the last-admin rule | **Taken** — §4.3 rule 1 and §5.2 skip a squadron made or removed whole by the command; Undo and Redo tested on its day and a later day |
| Fable F8, Opus L2 (what fires at midnight) | A2 closes only after a first refused tap: nothing calls `notify()` | **Taken another way** — the code shows the midnight wake (`installPostingClock`) already calls the Raptor side's `notify()` at 00:00:01 and on show or focus of a new day, so the check in `notify()` fires with no tap; A2's proof drives the clock through `pastMidnight()`, never `notify()` (§2, §3.2) |
| Fable F9 | The held Tracker rebind can hold for ever (7f refuses every save after midnight); `boot.ts` shared by two helpers | **Taken** — §3.2 A-iv: the rebind waits only while the band is up, never for "clean"; the band drawn first (§11, §12 Q7); `boot.ts` helper "session"'s alone |
| Fable F10, Opus M6 (`oilOpenOn`) | `oilOpenOn` (l.1416) and `holidayLeft` judge an input by its first day or today | **Taken** — §3.2 A-i: `oilOpenOn` per asked day; `holidayLeft`, `ownSchedulerIds`, `atWarHome` name today on purpose; helper "war"; a behaviour-guard row |
| Fable F11 (rule 5), Opus M1 | Rule 5 refuses an honest re-target of a move (149 → 150 the same day) | **Taken another way** — no rule 5 under Piece B's cut: a re-target replaces the squadron row and touches no right. Kept for the other cut in §4.7 |
| Fable F11 (rule 4), Opus L5 | Rule 4 judging every stored row lets one bad row block every command | **Taken another way** — rule 4 is now a reading rule, not a check on stored rows: nothing to block |
| Fable F11 (`editlog`, `changelines`) | `editlog.ts` l.449 and `changelines.ts` l.635 read a man's squadron with no day, and have no owner | **Taken** — §3.2 A-i: helper "schedule" and helper "undo & roles" respectively, each with its day |
| Fable F11 (`home.set` in §11) | `data-model.md` §11 lists a grant delete under `home.set` | **Taken** — phase 3 docs: `home.set` writes no right; `UnitGrant`'s rule rewritten |
| Fable F11 (Plan-only admin's posting) | A 142 man who is 150's only Plan holder: his posting held with 150's words on 142's page, where 142's admins cannot fix it | **Taken** — told to him, §14 item 2 |
| Fable F12 | A simpler Piece B: no stored end; a right holds only inside the stint holding its `from` | **Taken** — §4.2's chosen cut, with one addition found while checking it: a re-link drops rights a move ended (§4.3); its timing is his Q4 |
| Astra 1, Opus H2 | The move's exception lets a forged command end or reopen an unrelated man's right, or change its level or dates | **Taken another way** — under Piece B's cut a move writes no right and the exception is deleted; a right removed beside a move is an ordinary removal (§4.3). The exact bounds stand in §4.7 if he picks the other cut |
| Astra 6 | The Inputs calendar's notes and day titles follow the pick (`InputsCal.tsx` l.123, 379, 719, 1036, 1387 read the pick's calendar), and its edits are saved under the pick's squadron, which section 7 refuses | **Taken** — §3.2 A-ii: the calendar's reads, writes, capture and Undo belong to the page's squadron, through B1's planning writer; tests §3.4 |
| Astra 7 | Closing an open war window at midnight leaves typed work undefined — a new thing on screen | **Taken** — §3.2 A-iv defines it (never saved into the new squadron, never dropped without a word); §11 drawing; §12 Q7; §13 midnight walk |
| Opus M6 (other callers) | `noticeLeftBell` (l.701, l.712), `restoredDayHolds`, `atWarHome`, `ownSchedulerIds`, `holidayLeft`, `perms.ts` ~1243 missed | **Taken** — each confirmed and owned (§3.1, §3.2 A-i, §4.3's reader list); also found: `relinkBackHolds`, `markBackHolds`, `grantBackHolds` (through `restoredDayHolds`), `accounts.ts postingLock`'s dates (l.631, Piece C) |
| Opus M6 (the compiler's hole) | Engine files read `any`: a caller passing no day still compiles, and `atOn` answers his first squadron | **Taken** — §3.2 A-i: a date check in the resolvers, thrown in tests and development builds, with the contract |
| Opus L1 | "A master admin (never counted)" could be read as not counting Saber at home | **Taken** — §5.2: counted at home, never as a Plan holder; the lock table says so |
| Opus L2 (passes on his Undo list) | At midnight the swap's passes might land on his Undo list | **Taken** — §3.2 A-iv: they run as the app's reconciliation, tested |
| Opus L2 ("entered") | "The squadron the session entered" must be his home at entry, never the pick | **Taken** — §3.2 A-iv |
| Opus L3 | A7's backstop should not refuse removals (an admin's Undo of his own cell) | **Taken** — §6.2: puts only; a test |
| Opus L4 | Re-link words counting ended rights would say "holds a right in 150" falsely | **Taken another way** — under Piece B's cut the re-link drops the rights a move ended, and its words count only rights that hold (§4.3) |
| Opus L6 | Own pages read their squadron's settings but still write the pick's | **Taken** — §3.2 A-ii: reads and writes, one key; the guard covers both |
| Opus L7 | `state/persist.ts` touched by two phase-2 helpers | **Taken another way** — B1's writer has its own collection (as `foreign.ts`) and needs nothing in `persist.ts`; it is helper "undo & roles"'s alone (§10) |
| Opus "a safer cut" | Piece B without dated rights | **Not taken** — §4.2: R2's proof cannot go green under it (a refused take-back leaves him 149's), batch 4's transfers would lose rights months early, Fable F6/Opus M2 survives it, it adds an Undo exemption, and D2238 asks for rights as dated rows |
| Astra, order and split | Squadron-aware Undo and planning before their callers; the foreign pass's check before its caller; roster dates with the war-day check as one change; owners named | **Taken** — §10 |
| Fable, order and split | Helper "war" needs F3's gate work and `store.ts`; B1 needs F5's core change; `boot.ts` collision | **Taken** — §10 |

## 17. Round 2's findings and what the plan did

Readers: Fable (1–10), Astra (1–7), the fresh Opus reader (H1, M1–M6, L1–L9). Each claim was checked in the code before
it was folded in; the line it rests on is named. Nothing was left out.

| Reader, id | Found | What the plan did |
|---|---|---|
| Fable 1, Astra 1, Opus M3 | The Undo of a re-link either revives a right a move ended — the restore re-dates the link (`relinkBackHolds`, `perms.ts` l.1734) or the row (`grantBackHolds`, l.1716–1720) to today, so the reading rule sees no move after its start — or is refused by the plan's own backstop, a re-link leaving an ended row | **Taken** — §4.3 "An ended right never comes back": Opus M3's before/after rule at the gate replaces the backstop; the restore leaves out a row that held nothing when its step took it off, through the timeline's existing `leaveOut` hook (`timeline.ts` l.102–106); `grantBackHolds`' kept day needs the right to have held then. Fable's narrower fix (put rows back only where the link keeps its day) taken another way: one rule whichever way the link is dated, since an ended row gives nothing. Tests: Undo at once, after either man moves, after both, Redo of each (§4.4) |
| Fable 2, Astra 7, Opus M2 | A plain admin's re-link passes the door (rights that hold) and is refused by G4 (l.1852, every stored row) and by section 6's who-check on the drop | **Taken** — §4.3: one who-rule — door, G4 and drop read only rights holding today; section 6 lets the drop's removal pass inside the re-link's command, whoever re-links; Kestrel's case tested door against gate; the reading told to him (§14 item 6). Astra's "say master-only at the form" not needed: it is not master-only |
| Fable 3, Opus L1 | The gate and doors build accounts by hand without `pidFrom` (`perms.ts` l.403, l.1302, l.1947–1950, l.2074; `accounts.ts` l.328, l.341, l.359), so a re-linked account's right starts on its `from` there | **Taken** — §4.3: `pidFrom` a required key of `LevelAccount`, the seven sites named in the reader list; a `grantOn` table row read through the gate and the screen |
| Fable 4, Opus L3 | "He moves squadron tomorrow" (door `units.ts` l.187, gate l.1992) now refuses lowering a right, a Redo of a giving and an Undo of a removal — rights stand till midnight under this cut | **Taken** — §4.3: only a put that gives or raises; a verified replay exempt at the gate; tests. Checked: the Undo of a giving is a removal, which the line never judged; the Undo of a removal and a Redo of a giving were refused |
| Fable 5, Astra 3 | A-v leaves unsaid which records get a stamp (an input filed at 23:50 would wait for ever); and a stamp does not separate the identities Undo compares — `command/commit.ts` counts revisions by `collection/id` (l.337), so 142's and 149's war records share revisions, newer-change checks, barriers and folds | **Taken** — §3.2 A-v: only `lw.*` and `trk.*` stamped; their key `<collection>/<unit>@<id>` in the revision counter, `revs` and `recordKey`; owner "undo & roles", `commit.ts` included; tests with later and background changes. Also found while checking: the second store's posting row keyed as the war's own posting record, so a foreign pass's run bars the step that set it. Fable's "words for a step waiting for good" taken another way: passed over silently, as today — it blocks nothing, and new words would need a drawing |
| Fable 6 | `removeGrant` takes only the row holding today, so an ended row can never go, and "a unit removed while still named" (l.1999) counts it, blocking the Undo of "+ New squadron" | **Taken** — §4.3: l.1999 counts only rights holding today (Fable's first option); a test |
| Fable 7 | `changesIn` read as row dates would end rights on a demo man's baseline row (`units.ts` l.239), a same-day take-back or a first placing | **Taken** — §3.2 A-i: resolved squadron against the day before; three `grantOn` table rows |
| Fable 8 | `levelIn` and `levelOfAccount` keep a default of today | **Taken** — A-i and the phase-3 contract; their callers are core files only (checked) |
| Fable 9 | No owner for the "unsaved typing" probe; which unit a master admin's pick gets at midnight | **Taken another way** for the probe: an open Leave War window or Tracker pop-up holds the swap, whatever is typed — `state/typing-hold.ts` reading `Sheet.tsx`'s `OPEN` list and the Tracker's pop-ups, helper "session", phase 3. **Taken** for the pick: it stays for a master admin (A-iv) |
| Fable 10 | Q4's example shows only viewing; Q6 does not say what happens to leave already approved after the move | **Taken** — §12 Q4 names full admin until the move day or a transfer's date; Q6 names the leave kept out of sight in 142's war and not in 149's until the Transfer batch |
| Astra 2, Opus M1 | B1's new `planx` collection gives one note two identities (Undo's conflicts, a stale screen after a load) and slips past the member rule's `case 'plan'` (l.2901) and every reader keyed on `'plan'` | **Taken another way** — §3.2 A-ii, §6.2: no second collection. `plan` ids already name their squadron (`sched-commit.ts` l.882); its store routes a record to the loaded calendar or that squadron's stored one instead of refusing it (l.333). Opus M1's readers then need nothing; "admin or member there" corrected to "admin there"; tests |
| Astra 4 | A held foreign posting is not retried when its reason goes (D306); work deferred from another command has no run that is sure to come | **Taken** — §6.2 steps 4–5: a coalesced run after any command changing accounts, people, homes, rights or stored postings; owed work kept until a run completes; tests |
| Astra 5, Opus M5 | C6 survives across a move: the picker checks the first day, the save every day; C1 adds 149's admin to those refused with words that don't say why | **Taken** — §3.3 C6: one whole-draft body, `inputWhoProblem`, lifted from 7c and asked by picker, save door and gate, again as dates or people change. Its sentence is new: §11 row, §12 Q8 (Opus M5's "or name it in the until-then" kept as Q8's until-then) |
| Astra 6 | A7's "puts only" refuses an Undo that removes one entry of a two-entry cell, saved as a put of the shorter list | **Taken** — §6.2 A7: the line judges contents before and after (checked: `lw.cell` holds a list, `leavewar/state/store.ts` l.1095); removal-only passes; an Undo putting leave back is refused, its words drawn with A1 (§11) |
| Opus H1 | "Never the loaded war's `applyDelete`" — but `applyDelete` is the Raptor half (`person-delete.ts` l.187, called at `sync.ts` l.2841): a builder following it marks a 149 Delete done with the man still on the roster | **Taken** — §6.2 step 3: both halves as the loaded pass runs them; the done mark only with both; a test |
| Opus M4 | A new squadron's first admin judged on today only: a move saved for later leaves it without one | **Taken** — §5.2: every judged date; a lock-table row |
| Opus M6 | `adminsOf` has no stated audience; the two passes could tell different people | **Taken** — §6.2 step 6: admins at home there that day, switched on — the loaded pass's set today; both passes and the gate's reader check use it |
| Opus L2 | `state/units-sqn-fixread2.test.ts` l.358 expects no rights stored after `setHome` | **Taken** — §4.5 test 7; a search of the other tests that move a man and read rights found no more |
| Opus L4 | Piece C's "keeps a non-master admin Plan holder" refuses the first admin moving into 150 | **Taken** — §5.2: "an admin at home or a non-master admin Plan holder" |
| Opus L5 | Counting Plan holders by `grantOn` counts a Plan sign-in re-linked to a member at home there | **Taken** — §5.2: through `levelFrom`; a lock-table row |
| Opus L6 | An end before its start can leave 7c judging nothing | **Taken** — §3.2 A-iii: such an input counts as its first day; the plan's claim that `inputCoversDate` is the year-wrap rule corrected (the app writes the end's year in its label); a test |
| Opus L7 | A4 omits `leavewar/state/store.ts`; B4's inventory reaches other helpers' files | **Taken** — §7 A4's files; A-ii: the inventory read only, each line to its file's owner, a changed reader keeping its old form until the contract |
| Opus L8 | A7 missing from §11; its timing is A1's, not Q3's alone | **Taken** — §11 row; §1 and §6.2 say it waits with A1 |
| Opus L9 | Rights' start dates keep their own check | **Taken** — §4.3 "A deliberate split, said plainly" |

## 18. Round 3's findings and what the plan did

Readers: Astra (1–3), Fable (1–8), the fresh Opus reader (1–8), each blind, on the copy at `de5de891d`. Round 3 was the
last plan read (D70's cap of about three); the build's combined four-reader fix read takes what is left. Each claim was
checked in the code before it was folded in; the line it rests on is named. The re-link and the Undo of a right had drawn
findings in every round, so in place of a fourth patch the host made two technical decisions — the two guardrails, §4.3
— which close the first two rows by construction. Nothing was left out.

| Reader, id | Found | What the plan did |
|---|---|---|
| Astra 1, Fable 7 | Removal → move → Undo (the right back, dated today) → Redo → Undo: the omission reads the row's first start, so the last Undo drops a right its Redo took; and an Undo of a lowering after the move re-dates the stored row as a giving (`grantBackHolds` false → today, `perms.ts` l.1719) | **Taken another way — guardrail 2** (§4.3): no restore puts back a right whose man has changed squadron since its start, judged from the row as it stood when taken off (`stoodBefore` after an earlier restore), with the account's man and link day recorded on the step. An Undo or Redo after the move puts nothing back, in every order — so no "legitimately restored" right exists to drop. A step the leave-out empties is blocked for good in today's words, "Something else changed this after your action — it can’t be undone now." The cost said plainly: what D2203 would have left anyway. Astra's "pass the actual prior image" is kept as the "as it stood" reading; tests §4.4; existing tests 8–13 of §4.5 |
| Astra 2, Fable 1, Opus 1 | A right that still held at the re-link followed the account; a later move of either man then makes its Undo or Redo revive it (`restoreRedated` re-dates the link, l.1734) or the gate refuse it — the step never wrote that grant row | **Taken another way — guardrail 1** (§4.3): a sign-in linked to another person carries no access to other squadrons — the re-link drops every right, holding or ended; a new gate line refuses any command (a restore too) that changes an account's man and leaves a right of that account stored; Undo and Redo restore the link only. With no right ever carried, all three readers' sequences have nothing to revive. "Rights that still hold follow the account" was fix read 10's build choice (fault D), checked: no ruling names it. Astra's and Fable's "run the drop again inside the restore" not taken: the only rows a restore could meet are rights given **since** the re-link, by someone; removing them would undo another's change (D148), so the step is blocked for good in D148's own words naming who. The cost said plainly: the sign-in comes back without its other-squadron access. **Who may re-link** (the host's question): kept as it stands — the drop of a holding right is a removal in its squadron (D2191, D2192), and without the line a re-link away and back would strip it; the door's words still read true |
| Astra 3 | A squadron whose only admin is a Plan holder at home elsewhere (§5.2 allows it) is told nothing of its postings: the audience was home admins only | **Taken** — §6.2 step 6: `adminsOf` = §5.2's who-counts, at home today or a non-master admin Plan holder today (D2202, checked in its full row: "his bell carries that squadron's admin lines, on by default"); a master admin through his home only (D2198); View holders never; both passes and the gate; a test of each kind. D2202's squadron mark is not built (§11, §14 item 9) |
| Fable 2, Opus 3 | A held foreign posting's passing note (`tellOnce` → `HOOKS.toast`, `sync.ts` l.2674, l.2770) would tell a 142 member about 149's last admin | **Taken** — §6.2 step 3: the foreign half says nothing; Admin → Users' held note (A6) alone; the signed-in man's own deletion line kept; a test; §11 |
| Fable 3, Opus 4 | The routed planning record has no safe path through Undo when its squadron is not loaded: the timeline maps a collection to one store (`timeline.ts` l.125–127) and enlists only it (l.807–812, l.849); the stored half changes un-enlisted (`commit.ts` guardCheck throws) with no before-image — an edit saved as "created", its Undo deleting the note | **Taken** — §3.2 A-ii, §6.2 B1: the timeline picks the store per record; the stored half loads the ids it will write before it joins a command or a restore; helper "undo & roles" after "session"; tests in both directions, a refused restore leaving stored and cached copies untouched (§3.4) |
| Fable 4 | A-v's "it never blocks a step in his new squadron" is false: a war door writes an input and a war record in one step (`doorMoveApproved`), and `undoConflictOf`/`redoConflictOf` (l.726–780) judge every later step sharing a key whatever its squadron — "undo that first" about a step he can never reach, on every press | **Taken** — §3.2 A-v: a step sharing a key whose world he can no longer enter makes the other blocked for good, in today's sticky words; a master admin or Plan holder who can go back keeps "undo that first"; a test; §11 A2's row; §13's midnight walk |
| Fable 5, Opus 8 | "That day" in `adminsOf` unnamed: a gate reading the posting's date and a pass reading today would refuse a late pass for good | **Taken** — §6.2 steps 6–7: the run's day, today, read after the outcomes (as `sync.ts` l.2853–2859), in both passes and the gate; a test with a pass run days late |
| Fable 6 | The foreign run's command type unnamed; the timeline keeps a posting run out of a person's step only by `lw.postoutRun` (`timeline.ts` l.193) | **Taken** — §6.2 step 3: it is `lw.postoutRun`; a test of the master admin's Undo after the held posting ran |
| Fable 8, Opus 7 | §10's tests resting on two jobs built at once have no writer (Piece B's Undo tests need the leave-out's wiring; A5's foreign Delete strip needs B1; A-v's foreign-pass test needs A5); A7's refusal words have no file owner | **Taken** — §10 "Tests that rest on two jobs": each named with its writer and commit, the two that need war and session or war and undo & roles written by the host at merge; A-v's test through an Admin → Users door, which exists today (Opus's own fix). A7's sentence: helper "war" beside its probe, said through the timeline's existing `restoreRefusal` hook by helper "undo & roles" (§6.2) |
| Opus 2 | One bad foreign posting (its man moved out of that squadron) refuses the whole foreign run and is retried after every later command; the loaded pass guards itself today (`PO_RETRIED`, `PO_REFUSED`, `sync.ts` l.2680–2686, l.2883–2893) | **Taken** — §6.2 step 2: one posting per command; a refused one given up for the session; a posting whose man is not at home in that squadron skipped by both passes (the loaded one through `atWarHome`, l.1467), silently, as today's refusal is; tests |
| Opus 5 | `lwx.ledger/<u>@<id>` and `lwx.rec` are the loaded war's ledger and cell rows under another identity (`foreign.ts` l.16–17; `rows.ts` l.123–133): the master admin's Undo of clearing Viper's award after deleting Viper writes the award back | **Taken** — §3.2 A-v: both keyed as the war's own records (a `lwx.rec` row as the cell holding it, its man and day from its image); the sequence tested |
| Opus 6 | `verifiedWarRestore` (l.613–628) and `carrySeen` (l.233–246) compare by the Undo key; the stamp is empty with no world door (`perms.ts lwUnitNow`, l.1457), so old tests never reach the qualified path | **Taken** — §3.2 A-v: both named, on the qualified key; D1263's closed-day Undo and the seen mark tested in the two-squadron world |
| Found while checking (guardrail 2) | A removal, a re-link of that sign-in the same day, then the removal's Undo: the link day alone cannot tell the two acts apart, so the right would land on the new man's sign-in | **Taken** — §4.3: the step records its rows' account's man and link day as it is recorded, as `closedAt` is kept (`timeline.ts` l.326–348); a test |
| Found while checking (guardrail 1) | The re-link's drop can take a squadron's only Plan holder; the re-link door's `lockProblem` (`accounts.ts` l.508) reads the accounts list alone | **Taken** — §5.2: the re-link's door asks the one last-admin body with its drop in the draft; §5.4's words row |
| Found while checking (guardrail 2) | A restore the leave-out empties would commit nothing and still say "Undid: …" (`describe.ts bubbleText`) | **Taken** — §4.3: blocked for good, in today's words; nothing committed |
| Found while checking (§4.5) | `multi-sqn-fixread10.test.ts` l.392 holds Plan across a move and expects its Redo to put back 13 Jul — already red under round 2's rule, missed by round 2's list | **Taken** — §4.5 test 9, rewritten as tests 5–6 are; with tests 8, 10–14 (the guardrails), §4.5 now names fourteen |
| Found while checking (step 6) | `ownSchedulerIds` has two other readers, both posting lines (`sync.ts` l.1624, l.3317) | **Taken** — §6.2 step 6: they read the same set |
| Found while checking (§14) | The master admin mark rides a re-link today (fix read 10's F10-3) | **Not changed** — the agent's reading, §14 item 8: no right (D2203's reading), a master admin's alone (D2205); told to him |

## 19. The Plan audit's findings and what the plan did ([MSQ-PLAN-AUDIT], his D2242 — chat 126, 20 Nov 26)

The roll-call of every place that decides who may act for, see, or be told about a squadron — 171 places, the code's by
three Opus helpers (`…/briefs/2026-11-20-msq-plan-audit-rollcall-{gate,doors,bell-war}.md`, brief beside them), the
plan's, documents' and drawings' by the host; every left-out, wrongly-let-in and wording row checked by the host in the
code. The evidence sheet: `docs/handpass/2026-11-20-msq-plan-audit.md`. The proofs PA1–PA3, run red by the host:
`…/briefs/2026-11-20-msq-plan-audit-repro/` (8 red, the control green). **Kept out on purpose, named and not changed:**
giving and taking Plan, making a squadron or a master admin, a master admin's account, the last-admin count where a
squadron has admins at home (§5.2).

| Id | Found | Where it goes |
|---|---|---|
| PA1 | **Plan given, taken, lowered or passed on by a non-master admin** — Kestrel (149's admin) gives Hunter Plan of 149; Hunter passes it to Ranger; Kestrel takes or lowers a Plan Saber gave. Door (`units.ts setGrant`, `removeGrant`) and gate (`perms.ts` §6's grant branch, l.1953, l.2030) alike. Breaks D2199, D2211. Known as P1's gap; pinned by `state/units.test.ts` l.217–219, written a day before D2199 | **Piece B, core, phase 2.** A grant row whose level is `admin` on either side — new, raised, lowered or removed — needs a master admin, at the door and the gate; excepted only a person delete's drop (`personDeletedHere`), PA2's drop and a verified replay. The door's words are the approved drawing's, "Only a master admin gives Plan or makes a master admin." (picture 1b of 19 Nov, D2217). View stays its squadron's admins' — at home or by Plan — or a master admin's. `units.test.ts` l.217–219 rewritten to the ruling (§9.3), named in the report |
| PA2 | **Plan held by a member** — Saber gives Ranger (a member) Plan of 149; an admin given Plan and then made a member is still a full admin of 149 (`units-model.ts levelFrom` reads a grant whatever the account's role) | **Piece B, core, phase 2.** Plan is an admin's (D2201: "an admin a master admin gives Plan"; D785): the door and the gate refuse an `admin` grant on an account whose role is not admin; making a Plan holder a member drops his Plan rows **in the same command** — a drop allowed to whoever may make him a member, as a delete's drop is, and put back with the role by a verified Undo of that step; `levelFrom` reads an `admin` grant on a non-admin account as no right (the backstop). The agent's decision, technical — nobody holds Plan today; told to him |
| PA3 | **A sign-in holding Plan, re-linked by a non-master admin, carries the Plan to another man** — Kestrel, with Plan of 142, re-links Hunter's sign-in (Plan of 149) to another 142 man: allowed today, the Plan moves (`accounts.ts relinkRightsProblem` counts Kestrel an admin of 149) | **Piece B's guardrail 1 (§4.3), its who-rule refined:** the drop takes Plan, which is a master admin's alone (D2199) — so **a sign-in holding a Plan that holds today is re-linked only by a master admin**; one holding only View that holds today, by an admin of the man's own squadron who is an admin — at home or by Plan — of every squadron the View is in, or a master admin; ended rows decide nothing. Door, G4 and the drop judge alike |
| PB1 | **The posting take-back skips a Plan holder's line** — `sync.ts postingLinesOf` l.3316 (`atWarHome(n.to)`) and `retractPostingLines` l.3332: once §6.2 step 6 tells Hunter of Osprey's posting, Kestrel's "Undo post out" leaves Hunter's line standing, not struck | **Helper "war", phase 2, with §6.2 step 6:** both read `adminsOf(the war's squadron, today)` or a line about the man himself, never the reader's home alone |
| PB2 | **The "off the manpower" line is never worked out for a Plan holder** — `sync.ts postedLines` (l.1623–1645) derives it from the loaded war's postings for its home admins only; Hunter's page holds 142's war | **Helper "war", phase 2:** a reader is given the line of every squadron he is in `adminsOf` for — the loaded war's from its postings, another squadron's from its stored postings through `readForeign` (as the foreign pass reads them, §6.2) |
| PB3 | **A holiday's OIL question never reaches a Plan holder** — `sync.ts holidayTodo`'s `toFor` (l.1511–1512) tells a scheduler by his home only (D2202: that squadron's admin lines) | **With A4 (§7), core, phase 3:** the audience is `adminsOf(the squadron whose input asks, today)` |
| PB4 | **…and once told, the line counts and opens the wrong squadron** — `holidayLeft` (l.1434–1442) counts the reader's home, so a 149 line reads 0 for Hunter and `noticeLive` hides it; `ui/OilDayList.tsx` l.48 opens on `myUnit()` | **With A4, core, phase 3:** a holiday line carries the squadron it was written for (stored on the line, as `fu` is on an input's); `holidayLeft` counts that squadron; `OilDayList` opens on it for any admin of it — at home, by Plan, or a master admin |
| PB5 | **The OIL list's foot promises a line from another squadron** — `notices.ts holidayLineAny` (l.785–788) counts any squadron's scheduler line (not a Plan fault; found by the roll-call) | **With A4:** it asks only lines whose reader is an admin of the list's squadron |
| PC1 | **The gate refuses an admin line to a Plan holder** — §7e's `ownsHim(reader)` (`perms.ts` l.2415–2419, l.2498) passes a line only where the actor is an admin of the reader's home; every `adminsOf` audience above would refuse its whole command | **Core, phase 1, with `adminsOf`:** §7e also passes a line to a reader in `adminsOf(u, today)` for a squadron `u` the actor is an admin of (`levelInForce`) |
| PD1 | **A new person is made the adder's home's** — `units.ts putNewHome` (l.120–130), called by New person, Give access and approving a request: once step 5's menu moves Hunter's (Plan of 149) or Saber's Admin → Users to 149, the man he adds lands in 142 | **Core, phase 1 (A-ii), dormant until step 5:** the home is `pageUnit('own', today)` where the adder is an admin of it, else his own; today the same answer |
| PE1 | **A View holder is offered the schedule pages' edit controls** — `perms.ts isAdmin()` (l.231) and `mayEditSched()` (l.258) read the role alone; behind them Edit Schedule, Logic, the templates, the changes window and Admin's squadron settings (doors roll-call row 34). Unreachable until step 5's menu; each save already refused by §7 | **Core half in phase 1 (A-ii):** `mayEditSched` and a new "admin of the page's squadron" question read `levelIn(account, pageUnit(kind, today), today) === 'admin'`; today the same answer. The call sites move with P3 (step 5's menu), filed there |
| PF1 | **Admin → Users shows and offers every squadron's men** — its list and count (`ui/UsersPanel.tsx` l.520–533), the Give access picker (`accounts.ts linkablePeople`), and every row's buttons whatever his squadron (D2191) | **Not this build:** O3, step 5 (the list by `pageUnit('own')`); the picker and the row's buttons added to O3 in `OUTSTANDING.md` [MULTI-SQN-DESIGN] |
| PG1 | **A shared place's time zone changed by one squadron's admin** — `units.ts setPlace`, gate l.2033–2035 (D2196: a master admin alone) | **Not this build:** P2's (the rest-pieces map). The agent's reading of D2241 there: a master admin, or an admin — at home or by Plan — of every squadron at the place; told to him with P2 |
| PH1 | **Words naming only the master admin** — the re-link refusal (`accounts.ts` l.343, pinned by `leavewar/multi-sqn-fixread10.test.ts` l.318), 7c's and G4's code notes (l.1320–1323, l.1839–1856) | **Piece B (core):** the refusal reads "…Only a master admin or an admin of 150 can link it to another person." for a View (§4.3), and stays the master admin's alone for a Plan (PA3); the notes rewritten |
| PI1 | **The plan's own sentences** naming only the master admin (§3.2, §3.3, §4.3, §6.2, §11, §12, §14), the midnight pick that kept a Plan holder on a squadron his move took from him (A-iv), the stale guest line (A-ii) | **Done** in this pass |
| PJ1 | **Documents:** `data-model.md` §11's UnitGrant (Plan "by its own admins or a master") and the leave across a move ("only a master or the man"); the scheduler page's "an admin of a squadron is made only by its own admins or a master admin"; the register's bare "master" | **Done** in this pass (D2241) |
| PK1 | **A drawing:** picture 1c of 19 Nov (approved, D2217) says "Only 149's admins or a master admin give access to 149." — it leaves out an admin with Plan of 149 | **Not this build:** P1's; at P1's build the departure is named to him with its picture (D1478, D1426): "Only 149's admins, an admin with Plan of 149, or a master admin give access to 149." |

**Questions found, not ruled — for him with P4 and P1, not before:** whether a squadron's bell lines leave a Plan holder's
bell when his Plan is taken away without a move (D2218 rules it for a move); whether a man archived, posted Overseas or
suspended keeps his View and Plan for his return (D2203 ends them on a move only — kept as built).

### 19b. The blind read's findings (Astra and a fresh Opus reader, blind to each other, on `a5271a17c`)

Reports: `…/briefs/2026-11-20-msq-plan-audit-read-{astra,opus}.md` (brief beside them). The Opus reader's proofs, run red by
the host: `…/2026-11-20-msq-plan-audit-repro/o-opus-plan-audit-read.*` (O1 a, b, O2, O4 red; its control and the O3 guard
green). Where both readers found one thing it is one row.

| Id | Found (by) | Where it goes |
|---|---|---|
| R1 | **A Plan holder moves himself, or the master admin, to another squadron** — `units.ts setHome` asks neither; the gate's §8 and §6 pass, G1 never compares a master admin's homes (Opus F1; proved O1 a, b — real today through the door) | **Core, phase 2, with Piece B:** `setHome` asks `masterChangeProblem` first (D2205: a master admin's account is a master admin's alone); moving the signed-in person himself is refused (the agent's reading, as Archive and Delete refuse "yourself" — told to him), its words drawn first (D1625); §8 refuses a squadron change of the actor's own person; G1 compares each master admin's homes before and after |
| R2 | **Approvals' "New" marks kept once per person, not per squadron** — `state/apprseen.ts` (Opus F5; proved O2, through a pick) | **With P3 (step 5's menu)** — the page follows the pick only then; one time per squadron. Filed under [MULTI-SQN-DESIGN] |
| R3 | **The OIL list saves only the reader's home squadron's answers** — `ui/oilday.ts saveOilDay` l.30–31 and `sync.ts tellHoliday` l.1482 read `myUnit()` (Astra F6, Opus F3; proved O4) | **PB4 widened, core, phase 3 with A4:** the list's squadron on `OILLIST`, through `Body` to `saveOilDay`; Save's door asks "admin of that squadron" with the role in force; the window's identity carries it; `tellHoliday` reads the line's squadron |
| R4 | **A holiday line's span, name, duplicate check and footer read the loaded war** — `noticeSpan`/`HOL_SPAN`, `holidaySpan` l.1446, `holidayOwnName` l.1456, `holidayLineOn`/`Any` (Astra F5, Opus F4) | **PB4/PB5 widened, core, phase 3:** every one reads the line's own squadron (its stored war when not loaded, `nonWorkingFor(unit, d)`); a line supersedes only lines of the same squadron; PB5 compares the line's squadron with the list's, not the reader's rights |
| R5 | **PE1 as written breaks the bell, the OIL list and the member view** — `mayEditSched` has ~160 readers beyond the schedule pages, and `levelIn` reads the stored role, not the role in force (Astra F4, Opus F2; O3 the guard) | **PE1 rewritten (core, phase 1):** `mayEditSched` keeps its body for its other readers; a new schedule-edit question is the role in force AND `levelIn(pick) === 'admin'`; bell lines and the OIL list ask about the line's squadron (R3, R4); `pageUnit('own')` answers his home in the member view (A-ii); O3 goes into phase 1's tests. Call sites move with P3 |
| R6 | **A right lowered, removed or raised mid-day leaves the loaded war, Tracker and pick behind** — A-iv re-enters only on his own move (Astra F7, Opus F6) | **A-iv widened, helper "session", dormant until P1/P3:** `notify()` re-enters when `pageUnit('own')` differs from the loaded war's or Tracker's squadron, or the pick has no readable right behind it; the hold on an open window as at midnight |
| R7 | **PA2's drop lets a non-master end a Plan** — making a Plan holder a member, by whoever may make him a member, takes his Plan; PA3 says taking Plan is a master admin's (Opus F7) | **PA2 refined (core, phase 2):** making a member of an account holding a Plan in force needs a master admin (D2199, D2211); its refusal's words drawn first (D1625). The backstop reads the role in force (Opus's challenge to the doors' row 41) |
| R8 | **The sign-off boxes never offer a Plan holder** — `engine/publish.ts signPeople` (Opus F8): D2201, D2211 ("its schedule and publishing") against D2184 Q13 and D2243 Q2 ("that day's people") | **ANSWERED 21 Nov 26 by D2245: yes** — SKED CK, PLANNED BY and APPROVED BY offer, after that day's own people, a Plan holder of the squadron (while his Plan holds that day) and a master admin, each carrying the Scheduler tick; CUR CK stays the day's own people. Built with C5 by helper "schedule" (`engine/publish.ts signPeople`) |
| R9 | **A bell line's tap does not enter its squadron** — posting lines to Admin → Users, Leave War lines search the loaded war (Astra F8, Opus F9) | **With P3 and P4:** each line kind resolves its squadron, the page enters it, then lands; D1691's deleted man opens nothing. Filed under [MULTI-SQN-DESIGN] (with PF1) |
| R10 | **A Plan holder's lines leave his bell when he moves into that squadron** — `noticeLeftBell` judges by the reader's home on the line's day (Opus F10) | **With P4**, once a line carries its squadron: judged by it |
| R11 | **The mission-role answers: the gate roll-call's row 25 marked HAS IT** — the record's id names no squadron, so §7 sees none; a View holder passes the door (Astra F2) | **Already K4 + B5 (§7);** row 25's verdict is WRONG, not HAS IT — corrected here. K4's tests add Hunter with View and with Plan |
| R12 | **The last-admin words send a 142 admin to a fix he cannot make** — "Make another admin of 150 first." where only a master admin or an admin of 150 can (Opus F12) | **ANSWERED 21 Nov 26 by D2246:** to one who cannot make an admin of that squadron, "Hunter is 150's last admin. Only a master admin or an admin of 150 can make another." (and its dated form); a master admin or an admin of it — at home or by Plan — keeps the approved words. §5.2's words table carries both |
| R13 | **Documents and drawings** — the rest-pieces map's P3 and P4 name only the master admin; the questions page's re-link note (wrong after PA3); the pieces page's bare "master" (l.80, l.103) and its View line; `data-model.md` l.1845 and its bare "master"s; the register's B12 against D2202; the batch plan's stale l.77–91 and l.123; the People & accounts page's l.139; this plan's §0, §1 A7 row, l.253, l.284, tests naming only the master admin, and §13's "four" sign-ins with no Plan holder's round (Astra F1, F3, F9; Opus F11) | **Core, phase 3's documents step** (D2240, D2241); §13's walk gains a round as Hunter with Plan of 149 (five seeded sign-ins). The questions page's correction is told to him in chat 126's report |
