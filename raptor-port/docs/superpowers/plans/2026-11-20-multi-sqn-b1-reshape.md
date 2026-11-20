# Batch 1's open multi-squadron faults — the reshape plan (20 Nov 26)

- **Ruling:** his D2238 (20 Nov 26, *"reshape and fable."*): batch 1's open multi-squadron faults are fixed by first
  reshaping where their families come from — one which-squadron-on-a-day answer, the day always given; homes, places and
  rights as dated rows under one check; one last-admin rule; passes over every squadron — then the rest one by one.
  Astra, a fresh Opus reader and Fable read this plan, blind, before anything of it is built.
- **Status:** a plan only, **revised after round 1 (chat 125); for round 2's blind read.** Nothing here is built. Written
  on `claude/multi-sqn-b1-107` at `1c3386ec4`; round 1's text is `cbdccbd71`'s. Every round-1 finding and what this
  revision did with it: §16.
- **Inputs read:** the fault table, evidence sheet `docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17; the 40 proofs
  `docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/`; the readers' reports `…-full-review-{fable,opus}-{a,b,c}.md`,
  `…-core-read-{astra,opus,security}.md`, `…-fixread17-{astra,opus,fable,security}.md`; round 1's reports
  `…-reshape-read-{fable,astra,opus}.md`; the batch plan `plans/2026-11-17-multi-sqn-build-batches.md` §3.1, §3.4;
  `plans/2026-11-19-multi-sqn-b1-rest-files.md`; the transfer design `specs/2026-11-16-multi-sqn-detachment-design.md`
  §The transfer sheet and the round 6 and 7 drawings `docs/mock/2026-11-17-multi-sqn-r{6,7}/`; `docs/data-model.md` §11;
  the rulings pages (People & accounts §Posting out and §Many squadrons, the scheduler's bell lines D2194/D2195) and the
  full rows of D2238, D2203, D2221, D2119, D2160, D2162, D2214, D2197, D2132, D2191, D2192, D2199, D2201, D2207, D2217,
  D2184, D493; the code named in each piece below; `OUTSTANDING.md` [MSQ-FIXREAD17-OPEN].

## For him, in five lines

1. The 35 faults come from four habits in the code. This plan fixes the four habits first, and most faults go with them.
2. The four: the app asks "which squadron?" in many places and often assumes "today"; a person's squadron, a squadron's
   place and a person's View or Plan each have their own dated checks; "the last admin" is worked out in six ways; and
   some jobs, such as postings, run only for the squadron whose Leave War is open.
3. 21 faults go with the four fixes; three of those also need a small answer from you. Six more are small separate
   fixes. R1 is already fixed. The six you agreed to hold stay held, and a seventh waits too: the guest switch, until
   "Request access" asks which squadron.
4. Little changes on screen except the faults going away. Two new things get a drawing for you first: a moved man's row
   on his old squadron's Leave War, and what an open Leave War window or Tracker chart shows when its owner's move takes
   effect at midnight while he is typing. The last-admin refusal uses the words you approved on 19 Nov.
5. Your five small questions (C3, C5, A7, when a moved man's View and Plan end, and the guest switch) each change one
   small part. Until you answer, that part keeps working as it does now, or as recommended where no screen shows it yet.

---

## 0. Ground rules for every piece

- **Rulings that bind the plan:** a scheduler is always an admin (D785). Harm only in demo data already stored is not a
  fault (D56). Undo steps back only one's own changes, and his history is kept — no Undo list is cleared as a shortcut
  (D148). A move counts from the next day's start (D2119), and a transfer ends his access on its date (D2160, the
  transfer sheet). A move ends every View and Plan he holds of other squadrons (D2203). Each squadron's admins act only for
  their own squadron (D2191, D2192). Plan is a master's to give (D2199) and gives full access as its own admins have
  (D2201). A master's every page follows his pick (D2197). Each squadron owns its holiday list (D2195). The plan
  recommends the right design, not the easiest (D754).
- **`src/engine/` bodies are verbatim ports.** Only lines the multi-squadron work added there change: `inputBelongs`,
  `inputsFor`, `inputUnitOf` (step 3); `faceattrs.ts` (a project file); the `rosterShown()` call in `avail.ts` and the
  `rosterOf(UNIT)` lines in `publish.ts signPeople` and `snap.ros`, which the project added; `editlog.ts`'s home read
  (l.449, the project's). The original's 728 must stay 728/0 (`node reference/tfin.js`). With no resolver installed, every
  person is the boot unit's, so a required day changes nothing there.
- **Every existing test stays green (about 11,500)**, except the six named in §4.5, which Piece B's cut rewrites to the
  ruling's outcome (§9.3). Each fault's proof is copied into its area's real test file and run red on the code before
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
| A7 | Piece D + Piece A + **his answer** | A war takes a man's day only where that day is its squadron's. Whether the master is an exception is his question (§12 Q3). |
| B1 | Piece D | A delete takes the man off every squadron's planning calendar, inside its own command, rolled back whole on a refusal. |
| B2 | **held with B7** + his question | The guest switch needs the request's squadron, which step 5 builds; a stop-gap meanwhile is his call (§12 Q5). |
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
| C6 | Piece A (the day always given) | Pickers read the draft's day, so they offer exactly whom the save accepts. |
| C7 | **held** | With D2205's M2 (agreed). |
| C8 | one-by-one | `weekstash.ts stashDays` hands `viewOfWeek` the qualified key. |
| C9 | one-by-one, **first** | The guard counts code inside `${…}`, so it counts truly while callers move. |
| C10 | **held** (a measure) | Re-measured after Piece A, with A5's pass in the measure. Homes are indexed by person (§3.2). |
| C11 | Piece A (the page's squadron) | The Inputs page's filter and rows read one squadron, the page's. |

So: 21 close with the four pieces — Piece A 9 (A2, B4, C1, C2, C3, C4, C5, C6, C11), B 5 (R2, R3, R4, R5, K1), C 2 (B3,
B6), D 5 (A1, A5, A6, A7, B1, the last also leaning on A). Three of the 21 are finished by his answers: C3, C5 and A7.
**A count moved:** round 1 had R2 waiting on his answer too; Piece B's cut closes it by construction (§4.2). Two more
wait on his look at a drawing for their new on-screen part (A1's row, A2's band), not for the fault's closing. Six are
one-by-one: R6, K4, B5, C8, C9, A4. R1 is fixed. Seven are held: K2, K3, A3, B7, C7, C10, and B2 with a reason (§8).
21 + 6 + 1 + 7 = 35. If he wants a B2 stop-gap (§12 Q5), B2 moves from held to one-by-one; the total stays 35.

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
| Which squadron a page is about | `engine/unitview.ts UNIT` (the schedule in view); `myUnit()` read by hand at about 23 call sites in 14 files; `leavewar/state/store.ts worldUnit()` / `sync.ts warUnit()`; `tracker/storage.js storageUnit()`; `tracker/peoplewire.ts` (`storageUnit() || myUnit()`); `boot.ts`'s Tracker maker (`() => myUnit()`); `ui/InputWindow.tsx pickUnit`; `ui/inputedit.tsx rosterOptions(unit = UNIT)`; a plain setting name turned into the schedule in view's, `engine/hooks.ts storedKey` (B4); and the Inputs calendar's notes and day titles, which read the planning calendar `switchUnit` loads for the pick (`ui/InputsCal.tsx` l.123, 379, 719, 1036, 1387 — Astra 6) |
| Whose is an input | `engine/inputs.ts inputBelongs(r, unit, at?)` (first day if no `at`), `inputsFor(unit, at?)`, `inputUnitOf(r)`; `state/notices.ts inputUnit`, `filerUnits`, `inputSpan` (end before start = start alone); `state/perms.ts inputUnitViolation`'s own `daysOf`/`unitsOf` (end before start = one year later), and `adminOwnerViolation`'s `ownsHim` (falls back to `BOOT_UNIT`); `leavewar/sync.ts oilOpenOn` (l.1416, first day only). The year-wrap case already disagrees (core Opus, shape 2) |
| Which squadron the open page holds now | three variables set once at sign-in: `UNIT` (switchUnit), the war's `WORLD_UNIT` (swapWarWorld), the Tracker's `boundUnit` (bindStorageUnit — refuses a second unit once loaded). Nothing refreshes them when his own home changes at midnight (A2). Undo's `inUnitView` (`undo/timeline.ts` l.523) passes every step whose ids name no squadron — every Leave War and Tracker step (Fable F2, Astra 2) |

### 3.2 What replaces them

**A-i. A person on a day, the day always given.**
- One resolver, `homeOn(pid, iso)` in `state/units.ts`, handed to the engine as today. The handle grows from one function
  to `{ on(pid, iso), changesIn(pid, a, b) }`. The second answers "the days in a..b on which his squadron changes". Every
  body in §3.1 that scans home rows itself moves onto it: `movedSince`, `homesOver`, `noticeLeftBell`, `restoredDayHolds`
  (and with it the three re-dating hooks), 7c's `daysOf`; §8's loop and the last-admin dates move with Pieces B and C.
- `units-model.ts rowsFrom` indexes homes by person once (`Map<pid, sorted rows>`), so `homeUnitOn` stops filtering and
  sorting every home row on each call. This answers C10's measured cost, the cost of the new list question and Piece B's
  reader (§4.3).
- New, for the Leave War's year-long rosters (A1): `units-model.ts stintsIn(rows, pid, unit)` → `{ from: string|null,
  to: string|null }[]`. `from` is null for his first-ever row, which covers every day before it (`atOn`'s rule); `to` is
  the day before his next row.
- **The day becomes required:** `homeOn`, `homeUnitOf`, `onRosterOf`, `rosterOf`, `unitPeople` and `myUnit` lose their
  default. Each caller writes the day it means — `todayIso()` on purpose, or the day it draws. The compiler (`npm run
  build`; `tsc --noEmit` is hollow here) lists every typed caller.
- **The compiler's hole (Opus M6):** engine files read `any`, so a caller passing an empty day still compiles, and
  `atOn` then answers his first-ever squadron. With the contract step, `homeOn`, `homeUnitOf`, `rosterOf` and
  `inputOnDay` refuse anything but a valid date — they throw in tests and development builds.
- **Callers no round-1 list named, each given its owner and day:**
  - war side (helper "war"): `oilOpenOn` asks `inputOnDay(row, unit, d)` for each asked day `d` (Fable F10, Opus M6 — a
    duty 14–17 Jul across Ranger's 16 Jul move puts the 16–17 Jul questions on 149's list, not 142's); `holidayLeft`
    reads the reader's home today on purpose; `ownSchedulerIds` and `atWarHome` read today on purpose (who is an admin or
    at home now);
  - `engine/editlog.ts` l.449 (helper "schedule"): the line's own date, today when it has none;
  - `state/changelines.ts peopleLineUnit` (helper "undo & roles"): the day the change is filed.
- **How:** expand, then contract (§10). The defaults stay while helpers move their own files' callers, and the last
  step deletes them. About 50 production call sites in about 25 files today (counted 20 Nov 26).

**A-ii. The page's squadron.**
- One function, `pageUnit(kind: 'schedule' | 'own', iso)`, beside `myUnit` in `state/perms.ts` (inside the core file, so
  no import cycle).
  - `'schedule'` (Edit Schedule, View-only Sched, the Board, Logic) → `UNIT`, the pick.
  - `'own'` (Inputs and its calendar, Medical, the SANS calendar and day, Quals, the OIL answer list, the Leave War, the
    Tracker, Admin → Users) → `UNIT` for a master, or for an admin who holds Plan of `UNIT` (D2197, D2201). Anyone else
    → his home on `iso`. Nobody signed in, or a guest → `BOOT_UNIT`, as today (B2/B7 decide the guest later).
- Today the pick equals everyone's home (`switchUnit` has one caller, sign-in), so `pageUnit` answers exactly what each
  call site answers now. The difference becomes live with step 5's menu (P3): that change is then one place.
- **Own-page settings (B4):** `engine/hooks.ts unitSetting(unit, name, fallback)` reads `qualify(unit, name)` directly,
  and own pages **write** the same key they read (Opus L6). `membersFileOn()` reads `unitSetting(pageUnit('own'),
  'memberfile')`. The helper's first step lists every reader and writer of a unit setting (`storage/keyowner.ts
  UNIT_SETTINGS`) outside the schedule pages' files: `qualcols` (Quals), the flying plan's
  `flyday:`/`flyrule:`/`flyrun:`/`sanscalendar` (the war's need figures, the SANS calendar), the `rules` late cut-off as
  the Inputs pages read it. The host checks the list before any of them moves. A guard test fails on a plain-name read or
  write of a unit setting outside the schedule pages' files.
- **The Inputs calendar (Astra 6):** its notes, day titles, their edits, change capture and Undo belong to
  `pageUnit('own')`, never the pick. It reads that squadron's calendar — the loaded one when it is the pick's, else that
  squadron's stored rows (or `PLAN_MEM` for one left this session) — and writes through the planning writer for a named
  squadron that B1 needs (§6.2), its ids qualified by the page's squadron, so section 7 judges the writer as an admin or
  member there. Its Undo follows the own page's world (A-v). Today nothing changes (own = pick); a member or plain admin
  with View of 149 who picks 149 keeps his own calendar once step 5's menu exists.

**A-iii. An input's squadrons — one body.**
- In `engine/inputs.ts`, with the home handle given in (the gate gives its "rows before" handle, as it does now):
  - `inputSpanIso(r)` → `[first, last]`, by the one year-wrap rule the schedule itself uses (`inputCoversDate`). The
    gate, the filer test and the lists then agree on a 30 Dec → 2 Jan input.
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
  (Opus L2), so step 5's master pick is never pulled back to his home.
- `notify()` calls it when the signed-in person's home today differs from his home at entry (A2, his move at midnight).
  The existing midnight wake (`leavewar/sync.ts installPostingClock`) already calls `notify()` at 00:00:01 and whenever
  the page is shown or focused on a new day, so the swap needs no click (Fable F8, Opus L2). It does **not** reset the
  page or clear the Undo list: his steps in the old squadron wait there, by their stamp (A-v).
- **Switched on only after A-v.** Until every step carries its squadron, an Undo after the swap could write a 142 war or
  Tracker step into 149 (Fable F2, Astra 2). `enterSquadron` is built in phase 2 with the midnight trigger off and
  switched on in phase 3 (§10).
- The swap's own passes (the war's OIL, absence and posting passes on its load) run as the app's reconciliation, as at
  sign-in — never as his Undo steps (Opus L2; tested).
- **Typed work at the swap (Astra 7, Fable F9) — never saved into the new squadron, never dropped without a word.** A
  Leave War window or a Tracker chart edit open with unsaved typing holds the swap of that page. The window stays, with
  one band across its top and one button: words to be drawn and put to him (§11, §12 Q7), proposed "You are 149's from
  today. This can't be saved in 142's Leave War." and "Close"; closing it swaps the page. A save the old squadron refuses
  after midnight (its Tracker queue, his Save in that window) is named in the same band. Until his answer: the page
  waits for the window to close, without the band; a save from it shows today's refusal.
- **Tracker** (`tracker/storage.js`): `rebindStorageUnit(unit)` replaces "refuse once loaded": flush its queue, swap the
  door, and remount the Tracker page so it reads afresh (a key on `TrackerPage` naming the bound unit). It waits only
  while the band is up — never for the Tracker to be "clean", which 7f makes impossible after midnight (Fable F9).
  **Unsure:** whether the Tracker holds module-level caches beyond its React tree. It is found out by reading its load
  path before any change (§14). Step 5's master pick (D2197) needs the same swap, so it is built once here.

**A-v. Every Undo step carries its squadron (new; a prerequisite of A-iv's switch — Fable F2, Astra 2; D148).**
- At capture (`state/undo-wire.ts`) each step records, for each kind of record it wrote, the squadron that kind's world
  held: the schedule's records → `UNIT`; the Inputs calendar's records written through the planning writer (`planx`,
  §6.2) → `pageUnit('own')`; Leave War records → the war loaded; Tracker records → the Tracker bound (both read through
  the probes the gate already has, `lwUnitNow` and the Tracker's).
- `undo/timeline.ts inUnitView` takes a step only while each of those worlds holds the same squadron; the restore asks
  the same question again just before it writes. A schedule step made in 149 still waits for him in 149 (today's rule); a
  war step made in 142's war waits until 142's war is loaded.
- A step with no stamp (made before this build) is judged as today (D56: the stored history is demo data).
- Tests: Undo and Redo across the midnight swap and across a `switchUnit`, with identical record names in both worlds,
  for a war step, a Tracker step and an Inputs-calendar note; and with the pick different from his own squadron.

### 3.3 Faults it closes
- **Closes 7 outright:** A2 (with A-v), B4, C1, C2, C4, C6, C11. The C3 and C5 slots are built here; their outcome waits
  on his answers. A1 and A7 close with Piece D on this piece's stints and day rule.
- **C4:** `rosterIds(iso)` and `rosterShown(iso)`; `avail.ts availByWave` passes its day's iso; `publish.ts` freezes
  `snap.ros = rosterIds(dayIso(CURWEEK, di))`; `validate.ts issuedRoster` reads each unpublished day's own list.
- **C6:** `rosterOptions(unit, iso)`, `archivedOptions(unit, iso)`, `pickRoster` and `PeoplePick` take a day.
  `InputWindow` passes the draft's first day. The board's reassign pool (`interactions.ts` l.1343) passes the day it
  acts on.
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
- Year-wrap: one input from 30 Dec to 2 Jan, judged the same by gate 7c, `filerUnits` and the lists.
- `pageUnit`: a member with View of 149 who picks 149 keeps his own Inputs, its calendar's notes and their edits; a
  master's pick moves them (`switchUnit` in the test, as B4/B5 do); a Plan holder likewise.
- `enterSquadron`: fired by the clock alone; his home at entry, not the pick; a save waiting; a war window and a Tracker
  chart with typing at midnight (the swap waits; nothing saved into 149); the swap's passes not on his Undo list.
- A-v's tests (above); the unit-setting guard (A-ii, reads and writes); both enumeration guards, re-counted; the date
  check in development builds (A-i).

### 3.5 What could break, and what the readers must look at
- A caller handed the wrong day: the week's Monday where it meant the day, or today where it meant the draft's day. The
  fix read checks every changed call site's day source, one by one. The behaviour guard is the backstop.
- A writer moved to "touches" by mistake (F4's rule). The fix read lists every caller of `inputsTouching` and checks
  none writes.
- `pageUnit`'s master/Plan rule is dormant now. Its tests drive `switchUnit` directly.
- The midnight swap: a pending save, a war window or Tracker chart with typing, the Tracker rebind, the stamp on each
  Undo step. The fix read reads `enterSquadron`'s order, A-v's stamp and what each world does with work in flight.
- Speed: C10 re-measured with its two proofs before and after, A5's foreign pass included. A slow-down past today's
  figures (1.9× per edit at 4 × 40) is a finding.

### 3.6 Files (who writes them, §10)
- **Core:** `state/units-model.ts`, `state/units.ts`, `engine/roster.ts`, `engine/inputs.ts` (the multi-squadron lines
  only), `engine/hooks.ts` (`unitSetting`), `state/perms.ts` (`myUnit`, `pageUnit`, `membersFileOn`, 7c, `ownsHim`'s
  read, `restoredDayHolds`), `state/notices.ts` (`filerUnits`, `inputUnit`, `movedSince`, `homesOver`, `noticeLeftBell`).
- **Helper "schedule":** `engine/faceattrs.ts`, `engine/avail.ts` (one call), `engine/publish.ts` (`snap.ros`,
  `signPeople`'s slot), `engine/validate.ts` (`issuedRoster`), `engine/overlay.ts` (renamed calls, first day),
  `engine/weekstash.ts` (C8), `engine/editlog.ts` (l.449), `state/holderbase.ts` (renamed, first day), `ui/html.ts`,
  `ui/palette-html.ts`, `ui/interactions.ts`, `ui/inputedit.tsx`, `ui/PeoplePick.tsx`, `ui/peoplepick-model.ts`,
  `ui/InputWindow.tsx`, `engine/drafts.ts`, `engine/oilev.ts`, `engine/slots.ts`, `engine/weekctx.ts`, `ui/oilputback.ts`
  (the last five already pass a day: renamed calls only).
- **Helper "own pages":** `ui/InputsPage.tsx`, `ui/InputsCal.tsx` (its calendar part last, after helper "session"'s
  planning writer is committed), `ui/QualsPage.tsx`, `ui/MedicalView.tsx`, `ui/SansCal.tsx`, `ui/SansDay.tsx`,
  `ui/sansadd.ts`, `ui/oilday.ts`, `ui/OilDayList.tsx`, `tracker/peoplewire.ts`, and the own-page setting readers and
  writers the inventory names (`engine/qualcols.ts` and `state/flyplan.ts` readers, if listed).
- **Helper "session":** `boot.ts` (its one owner — the Tracker's "whose" reader, l.88–93, and the rebind; Fable F9),
  `state/store.ts` (`enterSquadron`, `notify`'s check, its input callers), `tracker/storage.js`,
  `tracker/TrackerPage.tsx`, and whatever Tracker load files step 0 names.
- **Helper "undo & roles":** `state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts` (A-v), then K4 + B5 (§7).

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
| The grant readers (round 1's 17 sites and `perms.ts` ~1243) | every one decides whether an ended row counts | 7 change to "holds on a day", 1 goes, the rest (the row loader and the readers that only name an account) unchanged | none |
| Round-1 findings it removes by construction | none; 7 to answer | 8: Astra 1, Opus H2, M1, M2, L5, Fable F6, F11's rules 4 and 5 | 7; Fable F6/Opus M2 stays |
| Fix reads 7–12's bell tests | green | 6 existing tests rewritten (§4.5): each holds a right across a move, which D2203 forbids | green |
| A new risk of its own | — | a re-link could restart a right a move ended — closed by the re-link rule below | — |

**Recommended: (ii).** It is the only cut whose timing matches the rulings that set one (the move day, the transfer's
date), it leaves batch 4 nothing to rebuild, its Undo has nothing to vouch for, and it removes the most findings without
answering them. **Its costs:** the moment a moved man's rights end shifts from the save to the move day's start — no
screen saves a move or gives a right yet, so nobody sees it today, but it is a change of built timing, so it is his
question (§12 Q4); six existing tests are rewritten (§4.5); each "holds" reader needs a day and his squadron rows (cheap
with A-i's index); ended rows stay stored, naming their account, until the account goes.

### 4.3 What replaces it

**Rows.** Homes, places and rights keep their shape. No field is added.

**The reading rule** (`units-model.ts`). `grantOn(rows, acct, unit, iso)` → the right of that account in that squadron
holding on `iso`, or none. A right holds on `iso` when:
- its start is on or before `iso` — its start is the later of its `from` and the account's `pidFrom` (the day the
  account was linked to its man; a right with no `from` counts from always, D56); and
- its account's man's squadron does not change on any day after its start up to `iso` (`changesIn`).
So a right ends at the start of the day his squadron changes — whether he leaves for another squadron or joins the
right's own — and never holds again (D2203). `levelFrom` reads `grantOn`; `LevelAccount` gains `pidFrom`, and every caller hands the account whole.

**Writes.**
- `setHome` writes his squadron rows only. No right is touched; the rule above ends them on the move day. Undo and Redo
  of a move restore squadron rows only (R3).
- `setGrant`: "He already has that" and the row it changes are `grantOn(…, today)`. Where none holds but an ended row of
  that account and squadron is stored, it writes a **new** row — an ended row is never re-dated, so its Undo removes the
  new row and the old one stays ended. The "He moves squadron tomorrow — give this after the move" refusal stays, door and
  gate (R5's proof and fix read 16's sample 1 pin it; such a right would last the rest of the day only).
- `removeGrant`: the row holding today.
- **A re-link** (`accounts.ts updateAccount` linking an account to another person — a master's where the account holds
  any right, gate l.1852): in its own command it drops every right of that account that holds nothing on the re-link
  day. Without this, a right Ranger's move had ended would start again for the next man linked to his sign-in, since its
  start becomes the link day. The rights that still hold follow the account from the link day, as built (fix read 10,
  fault D). The master is an admin of every squadron, so the drop needs no exemption.
- `dropGrantsOfAccount` (the person delete): every row of the account, ended ones too, as now.

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
   master only, is P2's — not here).

**Rights at the gate (section 6).**
- **Deleted:** the "move takes them" exemption. A move writes no right, so a right removed beside a move is an ordinary
  removal, an admin of its squadron's. No move exception survives this cut, so Astra 1's and Opus H2's bounds have
  nothing to bound (§4.7 keeps them for the other cut).
- **Changed:** "two rights for one account in one unit" → "two holding on one day".
- **New:** a re-link leaves no right of its account that holds nothing on that day (the backstop to the drop above).
- **Kept unchanged:** a right in his own home unit; the right given the day before his move; a new or changed right is
  dated today, a kept one keeps its day; a verified replay's exemption; a person delete's drop (`personDeletedHere`).
- **Round 1's rule 2 ("one change per command") is dropped:** it existed to refuse R2's forged one-day move. Under this
  cut that command's removal of 150's right needs an admin of 150, and without the removal a one-day move is a move that
  ends his rights on its day (D2203). No door writes more than one change, so it guarded nothing else. Round 1's rules 4–6
  went with the stored end.

**The bell.** `notices.ts adminThen` finds the right with `grantOn` on its day, and keeps its own "held before that day
began" (`from < iso`, its start the later of `from` and `pidFrom`, as now). A right ended by his move is not counted from
the move day; after an Undo of the move it holds again from its own day, as the restore re-dating does today. **The
re-dating hooks stay as they are** (`restoreRedated`, `grantBackHolds`, `stoodGrant`, `masterFrom`, `pidFrom`, the
timeline's `undoneOn`/`redoneOn`/`stoodBefore`). They now serve only a right removed and then undone, and the master
mark. Their retirement is filed, not done here (§15).

**Every reader of grant rows, by its choice** (the 17 and `perms.ts` ~1243, Opus M6):
- **Holds on a day → `grantOn` (7):** `units-model.ts grantIn` and `levelFrom` (l.146–157); `units.ts setGrant`'s and
  `removeGrant`'s row (l.188, l.198); `notices.ts adminThen` (l.301); `accounts.ts relinkRightsProblem` (l.339 — only
  rights that hold; Opus L4); `perms.ts` "two rights" (l.1972).
- **Goes (1):** `units.ts setHome`'s drop (l.234).
- **Names an account or only loads rows — unchanged:** `units-model.ts rowsFrom` (l.113, 119, 122); `units.ts
  grantsOf` (l.89, read by tests only) and `dropGrantsOfAccount` (l.210); `perms.ts` the posting pass's grant rows of a
  gone account (~1243), `rightNamesNew` (l.1756), the re-link check (l.1852), G5 (l.1870, l.1875), "a unit removed while
  still named" (l.1999). An ended row still names its account: G5 and the re-link read it, and the person delete drops it.
The builder lists each site with this choice, and the fix read checks every one.

### 4.4 Faults it closes, and tests
- **Closes:** R2, R3, R4 (all four cases), R5, K1. R2 by construction: no answer needed.
- **Left:** P1's own gap (an `admin` grant given by a non-master, D2199). It goes with P1.
- **Tests:**
  - Proofs R2, R3, R4, R5, K1, red first. R3's copy names the move day in its two reads of his right (`levelIn('acus',
    u150, '2026-07-16')`): the assertion words stay; the right now ends when the move counts, not when it is saved (§12
    Q4).
  - A table test of the one check: row kind × {a day begun, today, tomorrow, later} × {first row, change, take-back} ×
    {master, admin of the squadron he leaves, admin of the squadron he joins, Plan holder, member}.
  - A table test of `grantOn`: a right × {before his move, the move day, after it, a move and back, a move months ahead,
    a re-target the same day, his account re-linked}.
  - Undo then Redo of a move with a third squadron's right, by a plain admin and by the master: no right row written.
  - A new squadron's first admin moved into it (Fable F6, Opus M2): allowed; 150 has an admin on every day.
  - Undo and Redo of "+ New squadron", on its day and on a later day (Fable F7, Opus M3).
  - A re-link after a move: the ended right dropped, the new man holds nothing of it; its Undo and Redo leave it ended
    for both men.
  - A right given after a move is a new row and does not bring back a bell line the move retired (fix read 7–12's cases).
  - `levelIn` on the move day and the day after; the account delete with ended rows.
  - **The regression net:** `state/units-sqn-fixread*.test.ts` and `leavewar/multi-sqn-fixread9–12.test.ts` all green,
    but for §4.5's six.

### 4.5 Existing tests this cut rewrites (§9.3) — named, none deleted
Each holds a right across a move — its squadron rows written straight into the store, past `setHome`, which would have
deleted the right — or reads the right on the save day. D2203 forbids the first; Q4 moves the second:
1. `state/units-sqn-fixread16.test.ts`, "(control) the move undone the same day puts back the rights it dropped": "dropped
   by the move" is read on the move day instead of the save day.
2. `leavewar/multi-sqn-fixread13.test.ts`, O9-2: "his Plan went with his move" reads "no right of his holds on the 17th"
   instead of "no row stored".
3. `leavewar/multi-sqn-fixread7.test.ts`, fault P's control: "Plan of 142 held before the move keeps the line".
4. `leavewar/multi-sqn-fixread8.test.ts`, fault D's control: "Plan of 142 from the day before: still told".
5. `leavewar/multi-sqn-fixread10.test.ts`, F10-5: "kept through his move by Plan of 149".
6. `leavewar/multi-sqn-fixread11.test.ts`, F11-5b: the same.

Tests 3–4 keep their master-mark halves (a master's reach is no right and is not ended — D2203's reading) and pin that a
right held before the move day ends with it. Tests 5–6 keep what they test — an Undo of a right's removal or level change
brings its line back with its own day — with the Plan given after the move, in his new squadron. The host checks each
against its fix read's fault; the fix read reads each.

### 4.6 What could break, and what the readers must look at
- **This is the highest-risk piece:** permissions, saved data, and the bell's retired-line machinery that fix reads 7–12
  built on "a move deletes rights".
- The fix read looks for:
  - a right that holds where the rule says it ends, or ends where it should hold — above all its start for a re-linked
    account, and a right with no `from`;
  - a route that restarts an ended right (a re-link, a Redo, a restore re-dated to today);
  - any honest Undo or Redo now refused;
  - each of the 18 readers' choice;
  - a retired bell line coming back after a move is undone or a right re-given;
  - §4.5's six rewrites, each against its fault.
- **Walks:** Admin → Users — every account change, the re-link, Archive, Restore, Delete and their Undos — for the four
  seeded sign-ins, desktop and iPhone. Nothing he sees should change.
- **Files:** core only — `state/units-model.ts`, `state/units.ts`, `state/perms.ts` (§6, §8), `state/notices.ts`
  (`adminThen`), `state/accounts.ts` (the re-link's drop and its words).

### 4.7 If he picks another cut
- **"End them the moment the move is saved"** (his Q4 answered the other way): round 1's stored end comes back — `to`
  and `endedBy` written by `setHome` on every right of his that holds. It then needs: Astra 1's and Opus H2's bounds on
  the move's exception (the right's account is the moved man's as the rows stood before; `to` is the save day; `endedBy`
  is the row this command adds, removes or turns back; account, squadron, level and `from` unchanged; a reopen restores
  exactly the right that move ended); Opus M1's take-back rule (it applies only where no move is left); Fable F6/Opus M2
  (a right in the squadron he joins ends on the move day); Opus L4 and L5; and R2's question back to him (refuse a
  same-day take-back, or give the rights back). §4.5's rewrites drop to one (O9-2). Batch 4's transfer then writes its
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
  or a placeholder). **A master counts as an admin at home in his own squadron, never as a Plan holder** (Opus L1: read
  as "never counted", Hunter's Suspend in 142 would be refused).
- **The rule, per squadron and date:**
  - where a squadron has an admin **at home** before, it keeps one after (today's rule, unchanged);
  - where it has none at home, it keeps at least one non-master **Plan holder** (an admin right holding that day,
    `grantOn`);
  - a squadron new in this command needs one of either on today (B6);
  - a squadron the command removes whole is not judged (the Undo of "+ New squadron" — Fable F7, Opus M3);
  - `'app'` where the whole app is left with no admin who can sign in.
- **Callers:**
  - `lockProblem`, `postingLock`, `homeMoveLockWords`, `lastAdminIfGone` and `lastAdminLock` become thin readers of
    it;
  - `perms.ts lastAdminViolation` calls it, and now runs for commands that change grants or add a unit as well;
  - `units.ts addUnit` (the first admin required — "Name the squadron's first admin"), `removeGrant` and `setGrant`
    (lowering admin to View) ask it at the door;
  - `poHeldReason` keeps reading `lastAdminLock` unchanged.
- **One words table:**
  - today → "Kestrel is 149's last admin. Make another admin of 149 first." (D2184 Q10);
  - a later date → the approved drawing's words, "Kestrel is 149's last admin from Fri 27 Nov, when Osprey moves to
    142. Make another admin of 149 first." (D2217 Q15, picture 9b);
  - the posting pass keeps its own "The posting waits until 149 has another admin."

### 5.3 Faults it closes
- **Closes:** B3 and B6. Also the filed "refused delete's words" family (Delete, Archive, Undo of an account step).
- **A new squadron's first admin moves into it** (Fable F6, Opus M2): under Piece B's cut his Plan of 150 holds until the
  morning he becomes 150's, so 150 is never without an admin. Round 1's cut refused that move.
- **The agent's reading, to be told to him (§14):** a Plan holder counts as a squadron's admin only where it has none at
  home. D2201 gives Plan "full access as its own admins". Today's lock already counts only home admins where there are
  some.

### 5.4 Tests
- The proofs B3 (Suspend, Demote, Archive, Delete) and B6, red first.
- The lock table: dates × home admins × a Plan-only squadron × a master (counted at home, never as a Plan holder) × an
  archived admin × a first admin moving into his new squadron.
- The door's words equal the gate's code for every door: Suspend, Demote, Archive, Delete, Undo of an account step,
  `removeGrant`, `setGrant` lowering, `addUnit`, `setHome`, and a posting.
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
- the war's own door refuses a day outside his stints, so 142's grid refuses 149's days;
- the gate's war section, 7b, adds the same as a backstop **for puts only**: a war change that puts a record about man
  *P* on day *d* is refused unless `homeOn(P, d)` is the war's squadron. Removing a record is never refused by this line,
  so a 142 admin's Undo of his own earlier cell on a day now 149's still works (Opus L3; D148);
- `sync.ts` gives the gate a probe that reads `(pid, iso)` off a war change; the core writes the gate's half with a probe
  setter in phase 1, helper "war" installs the probe. The master question is §12 Q3.

**The posting pass over every squadron (A5) — its whole chain.**
1. `runPoOutcomes` first runs the loaded war as now.
2. Then, for each other squadron, it reads that squadron's stored `profile:` rows only, through `readForeign`, and runs
   each due posting through the pure halves already lifted (`stintClosed`, `personCut`, `keepsWindow`).
3. Its writes: the war half through `foreignWar(u)`; a Delete through `deleteOnForeign` / `deletePersonOnWar`, never the
   loaded war's `applyDelete` or `forgetPersonFrom` (Opus M4); its done mark, `poDone`, in that squadron's stored profile.
   When that war later loads, its own pass skips the posting: run once, never twice.
4. **Only in the pass's own command.** When the pass runs inside another command (a Post out, a member's save — `sync.ts`
   ~2785), the foreign half is left for the pass's next own run (Opus M4).
5. **Its speed:** the foreign half runs at boot, on the midnight wake, and when a squadron's stored postings change —
   not on every notify (Opus M4). C10's measure includes it.
6. Its bell lines go to **that** squadron's admins (D2194, D2214), through `accounts.ts adminsOf(unit, iso)` (core,
   phase 1).
7. **The gate (core, phase 1, before the caller is built):** `postingPassViolation` takes each `lwx.profile` change as a
   posting record too: it must match that squadron's stored posting (a probe reading the stored world of the squadron
   named in the id), the man's home before the pass must be that squadron, and each bell line's reader must be an admin
   of that squadron who can sign in. The loaded war's postings keep today's checks (Fable F3, Astra 4).

**The held note (A6):** `postingHeldNote(id)` and `poHeldReason` read the man's own squadron's posting — the loaded war
when it is his squadron's, else `readForeign` of his home unit.

**A delete reaches every squadron's planning calendar (B1).**
- **The writer:** `state/plan-foreign.ts` (new), shaped as `leavewar/state/foreign.ts`: a collection of its own
  (`planx/<unit>@pp:<id>`, `planx/<unit>@dm:<iso>`), its rows read fresh from that squadron's stored calendar just before
  the command, enlisted in the command layer so a refused command rolls it back whole, written on commit to that
  squadron's stored rows, with `PLAN_MEM`'s copy of that squadron dropped so the next read sees it. Shared with the
  Inputs calendar of a squadron that is not the pick (A-ii, Astra 6). It needs nothing in `state/persist.ts` (Opus L7).
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
- **Closes:** A1, A5, A6, B1, and A7 with Piece A, less his answer on the master.
- **Left one-by-one:** A4 (§7).

### 6.4 Tests
- The proofs A1, A5, A6, A7, B1, red first.
- A1: a saved move writes no posting record; Admin → Users shows no posting tag on a moved man; Undo of the move gives
  142's war his open months back in the same session; a saved joining window, a SANS man, two stints (one row, away
  between), a posting cancelled; a war already open when the move is saved.
- A7: a removal on a day now the other squadron's is allowed (L3); a put refused.
- A5: loaded and foreign postings in one run; the foreign war loading later (run once); repeated runs; a pass joined to
  another command (the foreign half waits); a refused foreign write rolled back whole; the bell to that squadron's admins
  only; a foreign Delete through the foreign war.
- B1: the master's case; an ordinary admin's case (Ranger moved 149 → 142, still on a future 149 note, deleted by 142's
  admin); a refused delete leaves the other calendar untouched, stored and cached; a reload; editing the cleaned note
  afterwards; a forged delete that changes anything else of the row refused.

### 6.5 Risk, walks, readers
- **Risk:** writing another squadron's stored war or calendar from a pass or a delete; a double run; lines to the wrong
  squadron; a deleted man's calendar row edited at the same moment; a stint field leaking into saved postings.
- **Walks:**
  - both wars across a saved move, three days, desktop and iPhone;
  - a 149 posting on a day only Saber signs in;
  - the master's Admin → Users held note;
  - a delete with the other squadron's calendar naming him.
- **Readers:** run-once, rollback, the audience of each line, the pass's gate chain, the planning gate line, and that no
  stint reaches a saved row.

### 6.6 Files
- **Helper "war":** `leavewar/sync.ts`, `leavewar/state/store.ts`, `leavewar/state/raptorRoster.ts`,
  `leavewar/state/foreign.ts`.
- **Helper "session":** `state/plan.ts`, `state/plan-foreign.ts` (new), `state/person-delete.ts`, and `state/store.ts`'s
  `PLAN_MEM`.
- **Core (phase 1):** the pass's gate chain, `adminsOf`, the planning gate line and 7b's put-only line in `perms.ts` and
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
  - Built in phase 3, by the core builder, once helper "war" and helper "own pages" have finished with `sync.ts` and
    `oilday.ts`.
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
- **§4.5's six**, under Piece B's cut: each sets up a right standing across a move (D2203 forbids it) or reads the right
  on the save day (his Q4). Named there, with what each keeps.
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
calls it. `boot.ts` and `state/store.ts` are helper "session"'s alone; `leavewar/state/store.ts` and `leavewar/sync.ts`
helper "war"'s in phase 2 (the core takes `sync.ts` for A4 in phase 3); `state/persist.ts` and the Undo files helper
"undo & roles"'s; `ui/InputsCal.tsx` and `ui/oilday.ts` helper "own pages"'s in phase 2 (the core takes `oilday.ts` for
A4 in phase 3).

| Phase | Who | What | Files |
|---|---|---|---|
| 0 | core | Piece 0: shared world with its midnight helper, C9, behaviour guard (green rows) | `test-support/msq-world.ts`, `testing/enumguard.ts`, guard tests, `state/msq-move-readers.test.ts` |
| 1 | core | **Piece A's bodies (expand):** home handle with `changesIn` and the per-person index, `stintsIn`; `inputSpanIso`, `inputSquadrons`, `inputOnDay`, `inputTouches`, `inputsListed`; `pageUnit`, `unitSetting`; `membersFileOn` (B4); 7c, `filerUnits`, `inputUnit`, `movedSince`/`homesOver`/`noticeLeftBell`/`restoredDayHolds` on the one body; `inputsFor` kept as a thin alias, defaults kept. **The halves later jobs build on:** the pass's gate chain for another squadron's postings and `adminsOf`; the planning gate line; 7b's put-only war-day line with its probe setter | `units-model.ts`, `units.ts`, `engine/roster.ts`, `engine/inputs.ts`, `engine/hooks.ts`, `perms.ts`, `notices.ts`, `accounts.ts` |
| 2 | core | **Piece B** (after his Q4, or as recommended if it has not come — §12), **then Piece C** (C's counting reads B's rule) | `units-model.ts`, `units.ts`, `perms.ts`, `notices.ts`, `accounts.ts`, `lastadmin.ts` (new) |
| 2, at once | helper "schedule" | A-i callers on the schedule side, C4, C6, C5's slot, C8, the landing callers renamed (first day), `editlog.ts` | §3.6's list |
| 2, at once | helper "own pages" | A-ii callers, C2, C11, the own-page setting inventory (reads and writes); **last**, once "session"'s planning writer is committed, the Inputs calendar's notes, titles and edits by the page's squadron (Astra 6) | §3.6's list |
| 2, at once | helper "war" | A1 (stints apart from postings), A5's caller (on phase 1's gate chain), A6, A7's probe, `oilOpenOn` by day and the named today readers | `leavewar/sync.ts`, `leavewar/state/store.ts`, `raptorRoster.ts`, `foreign.ts` |
| 2, at once | helper "session" | the Tracker's load path read first; the planning writer, then B1's strip; `store.ts`'s input callers (first day, F4); `enterSquadron` with its band slot and the Tracker rebind, **the midnight trigger off** | `boot.ts`, `state/store.ts`, `tracker/storage.js`, `tracker/TrackerPage.tsx`, Tracker load files, `state/plan.ts`, `state/plan-foreign.ts` (new), `state/person-delete.ts` |
| 2, at once | helper "undo & roles" | **A-v first** (every step carries its squadron), then K4 + B5 | `state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts`, §7's K4 files (`state/persist.ts`, `state/changelines.ts` among them) |
| 3 | core | **Contract:** remove the defaults and `inputsFor`'s no-day form; the date check in development (A-i); the compiler lists stragglers (each in a helper's file goes back to it, by then finished). R6. A4. The answers as they come. Docs: `data-model.md` §11 (`UnitGrant`'s rule: holds while its man stays in his squadron, one holding per account, squadron and day; `home.set` writes no right — Fable F11), `data-schema.md` (an input's `u` if C3 is answered so; no grant field changes), `file-map.md` (new files), `feature-impact.md` (the new seams: `enterSquadron`, `pageUnit`, the stamp on Undo steps, the planning writer), `notifications-register.md` (A5's lines to the man's own squadron) | core files, `leavewar/sync.ts` (A4), `ui/oilday.ts` (A4), docs |
| 3 | helper "session" | **the midnight swap switched on**, once "undo & roles" has merged: A2's proof and the Undo-across-the-swap tests red first; the band built once his Q7 is answered | `state/store.ts`, and the band's Leave War window and Tracker chart files, named at build (no other phase-3 job holds them) |
| 4 | host | Whole gate run; the combined four-reader fix read, blind; fixes red first; re-walk what the fixes touched; evidence sheet; his look | — |

- **No two jobs built at once share a file.** Phase 2's helpers start only once phase 1 is committed, because they call
  its bodies and gate halves. The core builder's phase 2 runs beside them.
- **Ordered inside phase 2:** "own pages" wires the Inputs calendar only after "session" commits the planning writer;
  "undo & roles" builds A-v before K4 + B5; "war" builds A5's caller on phase 1's gate chain, and A1 with A7's probe as
  one tested change (Astra's order note).
- **Merge order:** the core first, then each helper in turn, each bringing the core in before its own tests run.
- **Unsure, found out at the start:**
  - Whether helpers can each work in a worktree of their own (the Agent tool's worktree), given the "one checkout per
    session" guard. A trial write settles it.
  - If not, the helpers run one after another in the one checkout, still on disjoint files, the host committing between
    them, in this order: undo & roles, session, war, schedule, own pages.
- The gate lock (D228) holds for every full suite, multi-file browser run or fanned walk.

## 11. What a person sees — none of it new, except where named

| Change | On screen | Needs |
|---|---|---|
| A1 | Ranger moves 142 → 149 from Thu 16 Jul. 142's Leave War: his row as now up to Wed 15 Jul, then the war's "away" look (not in manning, no bids), with no posting hatch or tag — no posting was set. 149's Leave War: his row from Thu 16 Jul, away before it. Admin → Users: no "posting out" tag on him | **A drawing first (D1625)**, desktop and iPhone; his look §12 Q6. Checked: round 6's and round 7's transfer pictures draw only the Post out sheet (X1, X2, TA, TB, TF), never a war row after a move — a new drawing |
| A2's band | Ranger is typing a leave request in a Leave War window at 23:58 on Wed 15 Jul; his move to 149 counts from Thu 16 Jul. At midnight the window stays, with one band across its top — proposed "You are 149's from today. This can't be saved in 142's Leave War." — and one button, "Close", which opens 149's Leave War. A Tracker chart being edited: the same, "…in 142's Tracker." | **A drawing first (D1625)**, desktop and iPhone; the words his, §12 Q7. Until then the page waits for the window to close, without the band |
| A2 | A page left open across midnight of his own move shows his new squadron's schedule, war and Tracker | No new element. Named so he knows |
| B3 | Suspend, Demote, Archive or Delete of a last admin with a move saved: the approved sentence where "That did not save" stood | Built to picture 9b (D2217 Q15); drawing check (D1494) |
| A4 | 149 stops showing 142's holidays (the fault going away); the warning names only its own days, in the words he gave | The words are his, verbatim (D2207). The agent's reading: no drawing, as nothing new is drawn — the readers may disagree |
| C1, C2, C4, C6, C11, B1, A5, A6 | Lists and counts correct themselves; a 149 posting runs on its day; a held note shows for a 149 man on the master's Admin → Users (the existing look) | Faults going away |
| R2–R5, K1, B6, B4, K4/B5, C8, C9, R6, A-v, Astra 6 | Nothing today — no screen saves a move, a place, a right or a squadron yet, and no screen picks another squadron | — |

## 12. His questions — where each answer plugs in, and what happens until then

Each is put to him with its picture where it has one (D853). Q4 is asked before Piece B starts (phase 2); Q6 and Q7
are drawings shown before their part is built.

- **Q1 (C3) — does an ALL AVAIL meeting stay on the squadron it was filed on, or follow its filer's move?**
  - *Example:* Hunter files a 142 squadron meeting (ALL AVAIL) for Fri 24 Jul. His move to 149 counts from Thu 16 Jul.
    Today, from the 16th the meeting leaves 142's schedule and shows on 149's. Recommended: it stays on 142's.
  - *Recommended: stays* — a squadron's meeting is its own business (D2194), and a master who files one from the other
    squadron's schedule (D2197) does not file it into his own.
  - *Plugs into:* `inputSquadrons`' placeholder branch reads `r.u`. If "stays", filing stamps `u` — `InputWindow`'s
    save, and the demo seed's placeholder inputs.
  - *Until then:* the reader honours a stamp, but nothing writes one, so today's behaviour stands and proof C3 stays
    red, named.
- **Q2 (C5) — sign-off boxes: the day's people, or today's?**
  - *Example:* on Wed 15 Jul Hunter opens 142's week of Mon 20 Jul. Ranger is 149's from Thu 16 Jul. Today the sign-off
    boxes for Mon 20 Jul still offer Ranger. Recommended: they offer only Mon 20 Jul's 142 people — not Ranger — as the
    crew list beside them already does.
  - *Recommended: the day's* — the same as the crew list beside it, and as D2184 Q13's detachment boxes ("anyone of its
    own squadron").
  - *Plugs into:* `signPeople(schedOnly, keep, di)` reads `rosterOf(UNIT, dayIso(CURWEEK, di))` or `todayIso()`; one
    line.
  - *Until then:* today's, as now; proof C5 stays red.
- **Q3 (A7) — may the master still write a man's leave into his old squadron's war for a day that is now the new
  squadron's?**
  - *Example:* Ranger is 149's from Thu 16 Jul. Saber, the master, has 142 open and tries to put Ranger's leave on
    Fri 24 Jul into 142's Leave War. Recommended: refused, for Saber too — he picks 149 in Schedules and writes it there,
    as 149's admins and Ranger can now.
  - *Recommended: refused for everyone.* The day belongs in 149's war. D2221's reading ("only a master or the man") was
    about who may change leave across a move, not which war holds it.
  - *Plugs into:* one flag in the war-day rule (7b's backstop, and the war's own door on the master's row). Removals are
    never refused by it (Opus L3).
  - *Until then:* refused for everyone, as the proof expects.
- **Q4 (Piece B's timing) — when a man moves squadron, do his View and Plan of other squadrons end at the start of his
  move day, or the moment the move is saved?**
  - *Example:* Ranger is 142's and can view 150's schedule. On Wed 15 Jul at 10:00 Hunter saves Ranger's move to 149; it
    counts from Thu 16 Jul. Recommended: Ranger can still open 150's schedule for the rest of Wednesday, and from Thursday
    it is gone from his Schedules menu. The other way: 150 vanishes from his menu at 10:00 Wednesday, while he is still
    142's for the rest of the day.
  - *Recommended: the start of his move day* — the day his move itself counts from (D2119), and the way the transfer sheet
    he approved ends "His access to 142" on the transfer's date (D2160). So a transfer set months ahead ends his rights
    on its date, not months early; a move taken back the same day needs no rule (R2 closes without asking him); and an
    Undo of a move touches nothing but the move (§4.2).
  - *Plugs into:* Piece B's reading rule (§4.3). The other answer means round 1's stored end and its extra checks (§4.7).
  - *Until then:* nobody can see either way — no screen saves a move or gives View or Plan yet. If his answer has not come
    when Piece B starts, it is built as recommended and changed if he picks the other.
- **Q5 (B2) — the guest switch: wait for "Request access" to ask the squadron (step 5), or a stop-gap now?**
  - *Example:* Kestrel, 149's admin, turns on 149's guest switch. Today a guest still lands in 142's week, and only 142's
    switch lets him in. Either stop-gap — one switch for the whole app, or any squadron's switch letting him in — means
    Kestrel's switch would let a guest into 142's week, a choice that is 142's admins' to make.
  - *Recommended: wait for step 5,* where the request names its squadron and that squadron's switch decides (§8).
  - *Until then:* as today — 142's switch alone; proofs B2 and B2b stay red, named. A stop-gap, if he wants one, moves B2
    to one-by-one.
- **Q6 (A1's look) — a moved man's row on both Leave Wars:** the drawing §11 names. *Recommended:* his old squadron's
  row ends in the war's existing "away" look, with no posting tag, because no posting was set. *Until then:* A1's fix
  waits on his look; the war keeps today's rows.
- **Q7 (the midnight band's words):** the drawing §11 names, words proposed there. *Recommended:* the band and "Close"
  as drawn — typing is never saved into the new squadron, and never dropped without a word. *Until then:* the page waits
  for an open window to close, without the band.

## 13. The walks (Sonnet walkers, the host opening every picture that decides something; desktop 1536×864 and iPhone 402)

- **Setup:** a move is saved through the developer bridge, since no screen saves one yet. That is setup only; every
  control checked is pressed on screen (the order's §7.0). The browser clock is moved to the day before, the move day
  and the day after. Whether the walk scripts can move the clock is found out from the existing
  `scripts/handpass/msq/` scripts first.
- **The plain-user round (D1557), for each of the four seeded sign-ins:**
  - Inputs: list, calendar (its notes and day titles), filter, his own input, filing for others;
  - the schedule's day panel and crew list;
  - publish and sign;
  - Quals, Medical, the SANS calendar;
  - the Leave War, the Tracker;
  - Admin → Users with its locks and the re-link.
- **Midnight:** the clock moved to 23:58 the day before his move, then past midnight with (a) nothing open, (b) a Leave
  War window with typing, (c) a Tracker chart being edited; then Undo pressed (his old squadron's step waits). Desktop and
  iPhone.
- **R1's owed walk:** a member's refused bid shows no Move (evidence sheet §Fix read 17).
- **Each piece's own walks:** §3.5, §4.6, §5.5, §6.5.
- **Sizing:** by `walk-ledger.md` at build time; FULL tier.

## 14. What the plan could not settle, and how each will be found out

1. **A Plan holder counts as a squadron's admin only where it has none at home** (Piece C). The agent's reading of D2201
   and D2184 Q10, to be told to him with the report.
2. **A squadron whose only admin is a Plan holder from another squadron** (Fable F11): when 142's Hunter, 150's only Plan
   holder, has an Overseas posting set, it is held with 150's words on 142's Admin → Users, where 142's admins cannot fix
   it — only a master can make another admin of 150. Told to him with item 1.
3. **The Tracker's re-entry in place** (A-iv). Its load path is read before any change. If it cannot be re-read in place
   cleanly, A2's Tracker part is left as a named one-by-one: the war and the schedule still move, and the Tracker moves
   at the next sign-in.
4. **Helpers in separate worktrees, or one after another** (§10).
5. **Landing a request on each of its days across a move** (Fable F4): not one of the 35. The landing keeps today's
   first-day answer; no reader found a fault in it.

## 15. What this plan does not take from the readers' "shape" sections, and why

- **The Leave War store as one copy per squadron** (Fable A 3, Opus A 2): not taken. His D493 holds "the Leave War's
  saved-data reading" for the database step, which replaces it. `foreign.ts` stays the one way to reach a war that is
  not loaded, and the posting pass goes through it.
- **Bell lines settled when written, and the re-dating hooks retired** (Fable B 5, Opus B 3, core Opus 3): not in the
  35. Under Piece B's cut the hooks serve only a right removed and undone, and the master mark; they still carry fix
  reads 7–12's pinned cases. Filed as a follow-up to propose after the fix read, not done inside it.
- **The gate reading only the saved copy** (security core shape 1): that is K2/K3, held for the database step.
- **Every change carrying its squadron as a required field** (security core shape 2): K4 does it for the blue/red
  answers, the one collection among the 35 that lacked it; A-v stamps every Undo step with its worlds. The history's `u`
  field stays as it is.
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
| Opus L1 | "A master (never counted)" could be read as not counting Saber at home | **Taken** — §5.2: counted at home, never as a Plan holder; the lock table says so |
| Opus L2 (passes on his Undo list) | At midnight the swap's passes might land on his Undo list | **Taken** — §3.2 A-iv: they run as the app's reconciliation, tested |
| Opus L2 ("entered") | "The squadron the session entered" must be his home at entry, never the pick | **Taken** — §3.2 A-iv |
| Opus L3 | A7's backstop should not refuse removals (an admin's Undo of his own cell) | **Taken** — §6.2: puts only; a test |
| Opus L4 | Re-link words counting ended rights would say "holds a right in 150" falsely | **Taken another way** — under Piece B's cut the re-link drops the rights a move ended, and its words count only rights that hold (§4.3) |
| Opus L6 | Own pages read their squadron's settings but still write the pick's | **Taken** — §3.2 A-ii: reads and writes, one key; the guard covers both |
| Opus L7 | `state/persist.ts` touched by two phase-2 helpers | **Taken another way** — B1's writer has its own collection (as `foreign.ts`) and needs nothing in `persist.ts`; it is helper "undo & roles"'s alone (§10) |
| Opus "a safer cut" | Piece B without dated rights | **Not taken** — §4.2: R2's proof cannot go green under it (a refused take-back leaves him 149's), batch 4's transfers would lose rights months early, Fable F6/Opus M2 survives it, it adds an Undo exemption, and D2238 asks for rights as dated rows |
| Astra, order and split | Squadron-aware Undo and planning before their callers; the foreign pass's check before its caller; roster dates with the war-day check as one change; owners named | **Taken** — §10 |
| Fable, order and split | Helper "war" needs F3's gate work and `store.ts`; B1 needs F5's core change; `boot.ts` collision | **Taken** — §10 |
