# Batch 1's open multi-squadron faults — the reshape plan (20 Nov 26)

- **Ruling:** his D2238 (20 Nov 26, *"reshape and fable."*): batch 1's open multi-squadron faults are fixed by first
  reshaping where their families come from — one which-squadron-on-a-day answer, the day always given; homes, places and
  rights as dated rows under one check; one last-admin rule; passes over every squadron — then the rest one by one.
  Astra, a fresh Opus reader and Fable read this plan, blind, before anything of it is built.
- **Status:** a plan only. Nothing here is built. Written on `claude/multi-sqn-b1-107` at `1c3386ec4`.
- **Inputs read:** the fault table, evidence sheet `docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17; the 40 proofs
  `docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/`; the readers' reports `…-full-review-{fable,opus}-{a,b,c}.md`,
  `…-core-read-{astra,opus,security}.md`, `…-fixread17-{astra,opus,fable,security}.md`; the batch plan
  `plans/2026-11-17-multi-sqn-build-batches.md` §3.1, §3.4; `plans/2026-11-19-multi-sqn-b1-rest-files.md`;
  `docs/data-model.md` §11; the rulings pages (People & accounts §Posting out and §Many squadrons, the scheduler's bell
  lines D2194/D2195) and the full rows of D2238, D2203, D2221, D2119, D2214, D2197, D2132, D2191, D2192, D2199, D2201,
  D2207, D2217, D2184, D493; the code named in each piece below; `OUTSTANDING.md` [MSQ-FIXREAD17-OPEN].

## For him, in five lines

1. The 35 faults come from four habits in the code. This plan fixes the four habits first, and most faults go with them.
2. The four: the app asks "which squadron?" in many places and often assumes "today"; a person's squadron, a squadron's
   place and a person's View or Plan each have their own dated checks; "the last admin" is worked out in six ways; and
   some jobs, such as postings, run only for the squadron whose Leave War is open.
3. 21 faults go with the four fixes; four of those also need one of your small answers. Six more are small separate
   fixes. R1 is being fixed separately. The six you agreed to hold stay held, and a seventh waits too: the guest switch,
   until "Request access" asks which squadron.
4. Little changes on screen except the faults going away. The one exception is a moved man's row on his old Leave War,
   which gets a mock-up for you first. The last-admin refusal uses the words you approved on 19 Nov.
5. Your four small questions (C3, C5, R2, A7) each change one small part. Until you answer, that part keeps working as
   it does now, and the plan says which.

---

## 0. Ground rules for every piece

- **Rulings that bind the plan:** a scheduler is always an admin (D785). Harm only in demo data already stored is not a
  fault (D56). Undo steps back only one's own changes (D148). A move counts from the next day (D2119). A move ends every
  View and Plan (D2203). Each squadron's admins act only for their own squadron (D2191, D2192). Plan is a master's to give
  (D2199) and gives full access as its own admins have (D2201). A master's every page follows his pick (D2197). Each
  squadron owns its holiday list (D2195). The plan recommends the right design, not the easiest (D754).
- **`src/engine/` bodies are verbatim ports.** Only lines the multi-squadron work added there change: `inputBelongs`,
  `inputsFor`, `inputUnitOf` (step 3); `faceattrs.ts` (a project file); the `rosterShown()` call in `avail.ts` and the
  `rosterOf(UNIT)` lines in `publish.ts signPeople` and `snap.ros`, which the project added. The original's 728 must stay
  728/0 (`node reference/tfin.js`). With no resolver installed, every person is the boot unit's, so a required day
  changes nothing there.
- **Every existing test stays green (about 11,500).** Each fault's proof is copied into its area's real test file and run
  red on the code before its fix, then green. Where a proof calls a signature the reshape renames, the copy keeps the
  proof's assertion word for word and changes only the call. The host reruns both runs and checks the two read the same.
- **Bug-check tier: FULL.** It touches permissions, saved data, OIL and the published record. One combined fix read by
  all four readers (D2236): Astra, a fresh blind Opus reader, Fable and the security reader. Then a walk of everything
  that changed (§13).

## 1. The 35 at a glance — where each one goes

| Id | Goes with | One line |
|---|---|---|
| R1 | **beside the plan** (D2238) | Another chat is fixing it now in `leavewar/state/store.ts`. The reshape writes nothing in that file. |
| R2 | Piece B + **his answer** | A move ends his rights and records which move ended them. Taking the move back must give them back, or is refused (§12). |
| R3 | Piece B | Undo of the move gives the rights back: the right's row stays, ended, and Undo clears the end. |
| R4 | Piece B | One rule for every row: no right holds across a change of its man's squadron. |
| R5 | Piece B | "+ New squadron" asks the same check before saving and gives its words. |
| R6 | one-by-one | The member rule in `stampForged` compares the refusal's who and when in both directions. Built after R1 lands. |
| K1 | Piece B | Place rows come under the same "never a day already begun" rule as homes. |
| K2 | **held** | Database step (the host's call, agreed). |
| K3 | **held** | Database step (the host's call, agreed). |
| K4 | one-by-one (with B5) | A blue/red answer's change id carries its squadron (`u149@…`). The gate and Undo then see the squadron. |
| A1 | Piece D (on Piece A's stints) | Each war's roster comes from his home rows by date. 142's war keeps his months; 149's counts him from his move day. **Mock-up first** (§11). |
| A2 | Piece A (entering a squadron) | At midnight of his own move, the open page moves schedule, Leave War and Tracker to his new squadron. |
| A3 | **held** | Database step's first boot (agreed). |
| A4 | one-by-one (= rest-file P5, D2195) | Each squadron's holidays only. The warning uses the words he ruled (D2207). |
| A5 | Piece D | The posting pass runs every squadron's due postings, whichever war is open. |
| A6 | Piece D | The "posting could not run" note reads the man's own squadron's posting. |
| A7 | Piece D + Piece A + **his answer** | A war takes a man's day only where that day is its squadron's. Whether the master is an exception is his question (§12). |
| B1 | Piece D | A delete strips the man from every squadron's planning calendar, inside its own command. |
| B2 | **held with B7** (reason, §8) | The guest switch needs the request's squadron, which step 5 builds. |
| B3 | Piece C | One lock over every date. The door gives the approved words (D2217 Q15) where it now says "That did not save". |
| B4 | Piece A (the page's squadron) | Own-squadron pages read their own squadron's settings, never the pick's. |
| B5 | one-by-one (with K4) | Same fix as K4. |
| B6 | Piece C | A squadron always keeps an admin, from the day it is made. |
| B7 | **held** | Built with step 5 (agreed). |
| C1 | Piece A (an input's squadrons) | A list shows an input on every squadron whose days it touches. |
| C2 | Piece A (an input's squadrons) | His own Inputs page always lists his own inputs. |
| C3 | Piece A slot + **his answer** | The reader honours a squadron stamped on a placeholder-only input. Whether filing stamps one is his question. |
| C4 | Piece A (the day always given) | "Free all day" and the frozen roster read the day, not today. |
| C5 | Piece A slot + **his answer** | Sign-off boxes: the day's people or today's (§12). |
| C6 | Piece A (the day always given) | Pickers read the draft's day, so they offer exactly whom the save accepts. |
| C7 | **held** | With D2205's M2 (agreed). |
| C8 | one-by-one | `weekstash.ts stashDays` hands `viewOfWeek` the qualified key. |
| C9 | one-by-one, **first** | The guard counts code inside `${…}`, so it counts truly while callers move. |
| C10 | **held** (a measure) | Re-measured after Piece A. Homes are indexed by person so lists do not get slower (§3.6). |
| C11 | Piece A (the page's squadron) | The Inputs page's filter and rows read one squadron, the page's. |

So: 21 close with the four pieces — Piece A 9 (A2, B4, C1, C2, C3, C4, C5, C6, C11), B 5 (R2, R3, R4, R5, K1), C 2 (B3,
B6), D 5 (A1, A5, A6, A7, B1, the last also leaning on A). Four of the 21 are finished by his answers: C3, C5, R2 and
A7. Six are one-by-one: R6, K4, B5, C8, C9, A4. R1 is fixed beside the plan. Seven are held: K2, K3, A3, B7, C7, C10,
and B2 with a reason (§8). 21 + 6 + 1 + 7 = 35.

---

## 2. Piece 0 — one shared test world, and the guard fixed first (my addition; why)

**Why:** each of the three proof sets carries its own harness (`a-_harness`, `b-_harness`, `c-harness`), and every piece
needs the same thing: one man moved 142 → 149, with the day before, the move day and the day after. Several helpers would
each write their own world. One shared world means they test against the same thing, and each walker's scenarios read
the same. C9 is fixed first so the enumeration guards count truly while some 50 call sites move.

- `src/test-support/msq-world.ts` (new): one world drawn from the three harnesses. The four seeded sign-ins, a clock
  (`on(day, h, m)`), `moveMan(pid, unit)` through the real `setHome`, `bystanderAdminOf(unit)` (§9.2), and a table
  helper `acrossMove(pid, from, to)` returning the day before, the move day and the day after.
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
| Whose is a person on a day | `state/units.ts homeOn(pid, iso = today)`, `homeBefore`; `units-model.ts homeUnitOn`; `engine/roster.ts homeUnitOf(pid, iso = rosterToday())`, `onRosterOf(…, iso = today)`, `rosterOf(unit, iso = today)`, `unitPeople(unit, iso = today)`; `state/perms.ts myUnit(iso = today)` (falls back to `BOOT_UNIT`); `state/store.ts sessionUnit(pid)`; `state/notices.ts movedSince` (l.187), `homesOver` (l.276) — two private "his home changes in a span" bodies |
| Which squadron a page is about | `engine/unitview.ts UNIT` (the schedule in view); `myUnit()` read by hand at about 23 call sites in 14 files; `leavewar/state/store.ts worldUnit()` / `sync.ts warUnit()`; `tracker/storage.js storageUnit()`; `tracker/peoplewire.ts` (`storageUnit() || myUnit()`); `ui/InputWindow.tsx pickUnit`; `ui/inputedit.tsx rosterOptions(unit = UNIT)`; and a plain setting name turned into the schedule in view's, `engine/hooks.ts storedKey` (B4) |
| Whose is an input | `engine/inputs.ts inputBelongs(r, unit, at?)` (first day if no `at`), `inputsFor(unit, at?)`, `inputUnitOf(r)`; `state/notices.ts inputUnit`, `filerUnits`, `inputSpan` (end before start = start alone); `state/perms.ts inputUnitViolation`'s own `daysOf`/`unitsOf` (end before start = one year later), and `adminOwnerViolation`'s `ownsHim` (falls back to `BOOT_UNIT`). Six bodies; the year-wrap case already disagrees (core Opus, shape 2) |
| Which squadron the open page holds now | three variables set once at sign-in: `UNIT` (switchUnit), the war's `WORLD_UNIT` (swapWarWorld), the Tracker's `boundUnit` (bindStorageUnit — refuses a second unit once loaded). Nothing refreshes them when his own home changes at midnight (A2) |

### 3.2 What replaces them

**A-i. A person on a day, the day always given.**
- One resolver, `homeOn(pid, iso)` in `state/units.ts`, handed to the engine as today. The handle grows from one function
  to `{ on(pid, iso), changesIn(pid, a, b) }`. The second answers "the days in a..b on which his squadron changes", so
  `notices.ts movedSince`/`homesOver` and the gate's `daysOf` stop scanning home rows themselves.
- `units-model.ts rowsFrom` indexes homes by person once (`Map<pid, sorted rows>`), so `homeUnitOn` stops filtering and
  sorting every home row on each call. This answers C10's measured cost and the cost of the new list question.
- New, for the Leave War's year-long rosters (A1): `units-model.ts stintsIn(rows, pid, unit)` → `{ from: string|null,
  to: string|null }[]`. `from` is null for his first-ever row, which covers every day before it (`atOn`'s rule); `to` is
  the day before his next row.
- **The day becomes required:** `homeOn`, `homeUnitOf`, `onRosterOf`, `rosterOf`, `unitPeople` and `myUnit` lose their
  default. Each caller writes the day it means — `todayIso()` on purpose, or the day it draws. The compiler (`npm run
  build`; `tsc --noEmit` is hollow here) lists every caller.
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
- **Own-page settings (B4):** `engine/hooks.ts unitSetting(unit, name, fallback)` reads `qualify(unit, name)` directly.
  `membersFileOn()` reads `unitSetting(pageUnit('own'), 'memberfile')`. The helper's first step lists every reader of a
  unit setting (`storage/keyowner.ts UNIT_SETTINGS`) outside the schedule pages' files: `qualcols` (Quals), the flying
  plan's `flyday:`/`flyrule:`/`flyrun:`/`sanscalendar` (the war's need figures, the SANS calendar), the `rules` late
  cut-off as the Inputs pages read it. The host checks the list before any of them moves. A guard test fails on a
  plain-name read of a unit setting outside the schedule pages' files.

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
- **Callers moved to the one body:**
  - `perms.ts inputUnitViolation` (7c): `daysOf`/`unitsOf` deleted; it asks `inputSquadrons(r, homeBeforeHandle)`.
  - `notices.ts filerUnits` (each image's own men over its own days) and `inputUnit`.
  - `adminOwnerViolation`'s `ownsHim`: its home read through the handle; the `BOOT_UNIT` fallback stays, held with A3.
- **The callers with no day today** (Opus B's note; a latent case not in the 35, closed by the same contract):
  - `engine/overlay.ts` (l.430, 481) and `state/holderbase.ts` (l.209) land a week. These ask `inputOnDay` per day
    landed, so a man's input never lands on a day that is another squadron's.
  - `state/store.ts` (l.171, 686, 1114) and `tracker/peoplewire.ts` (l.123) ask `inputsTouching`.

**A-iv. Entering a squadron — one entry for the open page.**
- `state/store.ts enterSquadron(scheduleUnit)` moves the three variables together, in a fixed order:
  1. `switchUnit(scheduleUnit)`;
  2. `swapWarWorld(pageUnit('own'))`;
  3. the Tracker's rebind to `pageUnit('own')`, held while it has unsent saves or an open unsaved chart edit, and done
     the moment it is clean.
- `resetSession` calls it at sign-in, as it calls the first two now.
- `notify()` calls it when the signed-in person's home today differs from the squadron the session entered (A2, his move
  at midnight). It does **not** reset the page or the Undo list: the page stays where it is and its contents become his
  squadron's. His steps in the old squadron wait there, as `inUnitView` already treats them.
- **Tracker** (`tracker/storage.js`): `rebindStorageUnit(unit)` replaces "refuse once loaded": flush its queue, swap the
  door, and remount the Tracker page so it reads afresh (a key on `TrackerPage` naming the bound unit). **Unsure:**
  whether the Tracker holds module-level caches beyond its React tree. It is found out by reading its load path before
  any change (§14). Step 5's master pick (D2197) needs the same swap, so it is built once here.

### 3.3 Faults it closes
- **Closes 7 outright:** A2, B4, C1, C2, C4, C6, C11. The C3 and C5 slots are built here; their outcome waits on his
  answers. A1 and A7 close with Piece D on this piece's stints and day rule.
- **C4:** `rosterIds(iso)` and `rosterShown(iso)`; `avail.ts availByWave` passes its day's iso; `publish.ts` freezes
  `snap.ros = rosterIds(dayIso(CURWEEK, di))`; `validate.ts issuedRoster` reads each unpublished day's own list.
- **C6:** `rosterOptions(unit, iso)`, `archivedOptions(unit, iso)`, `pickRoster` and `PeoplePick` take a day.
  `InputWindow` passes the draft's first day. The board's reassign pool (`interactions.ts` l.1343) passes the day it
  acts on.
- **C11:** the Inputs page's filter, rows, deleted and archived groups all read `pageUnit('own')`.
- **Left one-by-one:** C8 (`stashDays` passes `qk(v)` to `viewOfWeek`; the bare week only for `weekBundle`'s dates).

### 3.4 Tests
- The proofs C1, C2, C4, C6, C11, B4, A2, and C3/C5 once answered, red first.
- `msq-move-readers.test.ts` rows (Piece 0): crew palette, free all day, ALL AVAIL crowd, reassign pool, sign-off (once
  C5 is answered), Inputs pickers by the draft's day, the Inputs list and month bars, his own input after his move,
  Quals, Medical counts, the SANS calendar and day, the war roster (with D), Tracker people, OIL eligibility.
- Year-wrap: one input from 30 Dec to 2 Jan, judged the same by gate 7c, `filerUnits` and the lists.
- `pageUnit`: a member with View of 149 who picks 149 keeps his own Inputs; a master's pick moves them (`switchUnit` in
  the test, as B4/B5 do); a Plan holder likewise.
- `enterSquadron` order: a save waiting, an open Tracker edit (the rebind waits), a war window open at midnight.
- The unit-setting guard (A-ii) and both enumeration guards, re-counted.

### 3.5 What could break, and what the readers must look at
- A caller handed the wrong day: the week's Monday where it meant the day, or today where it meant the draft's day. The
  fix read checks every changed call site's day source, one by one. The behaviour guard is the backstop.
- The landing callers (`overlay.ts`, `holderbase.ts`) change what lands where across a move. A wrong day there puts
  leave on the wrong squadron's day. The walk checks one week across a move on both squadrons.
- `pageUnit`'s master/Plan rule is dormant now. Its tests drive `switchUnit` directly.
- The midnight swap: a pending save, a half-dragged war window, the Tracker rebind. The fix read reads `enterSquadron`'s
  order and what each world does with work in flight.
- Speed: C10 re-measured with its two proofs before and after. A slow-down past today's figures (1.9× per edit at 4 × 40)
  is a finding.

### 3.6 Files (who writes them, §10)
- **Core:** `state/units-model.ts`, `state/units.ts`, `engine/roster.ts`, `engine/inputs.ts` (the multi-squadron lines
  only), `engine/hooks.ts` (`unitSetting`), `state/perms.ts` (`myUnit`, `pageUnit`, `membersFileOn`, 7c, `ownsHim`'s
  read), `state/notices.ts` (`filerUnits`, `inputUnit`, `movedSince`, `homesOver`).
- **Helper "schedule":** `engine/faceattrs.ts`, `engine/avail.ts` (one call), `engine/publish.ts` (`snap.ros`,
  `signPeople`'s slot), `engine/validate.ts` (`issuedRoster`), `engine/overlay.ts`, `engine/weekstash.ts` (C8),
  `state/holderbase.ts`, `ui/html.ts`, `ui/palette-html.ts`, `ui/interactions.ts`, `ui/inputedit.tsx`,
  `ui/PeoplePick.tsx`, `ui/peoplepick-model.ts`, `ui/InputWindow.tsx`, `engine/drafts.ts`, `engine/oilev.ts`,
  `engine/slots.ts`, `engine/weekctx.ts`, `ui/oilputback.ts` (the last five already pass a day: renamed calls only).
- **Helper "own pages":** `ui/InputsPage.tsx`, `ui/InputsCal.tsx`, `ui/QualsPage.tsx`, `ui/MedicalView.tsx`,
  `ui/SansCal.tsx`, `ui/SansDay.tsx`, `ui/sansadd.ts`, `ui/oilday.ts`, `ui/OilDayList.tsx`, `tracker/peoplewire.ts`,
  `boot.ts` (the Tracker's "whose" reader), and the own-page setting readers the inventory names (`engine/qualcols.ts`
  and `state/flyplan.ts` readers, if listed).
- **Helper "session":** `state/store.ts` (`enterSquadron`, `notify`'s check, its `inputsFor` callers),
  `tracker/storage.js`, `tracker/TrackerPage.tsx`, and whatever Tracker load files step 0 names.

## 4. Piece B — homes, places and rights as dated rows, under one check

### 4.1 What exists today
- **Homes:** `perms.ts homeUnitViolation` (§8) compares each man's squadron day by day: never a day already begun, first
  placing from today, and an admin of the squadron he leaves. It allows any day from tomorrow on, so a forged move dated
  past tomorrow passes (R4 a, b).
- **Places:** `perms.ts unitRowViolation` §6 checks only a place row's shape and its unit's admin, never its date (K1).
  `units.ts moveUnit` writes tomorrow.
- **Rights:** a grant has no end. `setHome` **deletes** every grant at save time. Around that sit:
  - `setGrant`'s "He moves squadron tomorrow" window, and the gate's copy ("a right given the day before his move");
  - the gate's "move takes them" exemption (R2, R3) and the delete's exemption (`personDeletedHere`);
  - "dated today" (`grantKept`, `grantBackHolds`, `restoreRedated`, `stoodGrant`);
  - the bell's `adminThen`, which reads `from`.
- Each command is judged alone. So a move then a same-day move back strips a third squadron's right with no move (R2).
  The Undo's put-back of a deleted grant is judged as a new right by a non-admin of its squadron (R3). And nothing says
  a right must not outlive a move (R4 c, d).

### 4.2 What replaces it
**Rows.** Homes and places keep their shape. A grant gains two fields:
- `to?: string` — the first day it no longer holds. A right holds on day *d* when `from ≤ d < to` (no `from`: always
  before; no `to`: open).
- `endedBy?: string` — the id of the home row whose move ended it.

`units-model.ts holdsOn(g, iso)`. `grantIn(rows, account, unit)` becomes `grantOn(rows, account, unit, iso)`, the row
holding on that day. `levelFrom` reads only a right that holds on its day.

**The move ends rights. It no longer deletes them.**
- `setHome` writes `to = today` and `endedBy = <its home row id>` on every grant of his that holds. Ending on save day
  keeps today's timing, so the tests that pin "rights gone the moment the move is saved" stay green. The rule below also
  allows `to` = the move day: batch 4's transfer, set months ahead, can then end rights on its date (D2162) without
  another change here.
- **Undo of the move** puts back the grants' before-images, so `to` and `endedBy` are cleared. The rows stand, so this
  is the same right kept — no re-dating and no new right (R3).
- **A move taken back the same day** (setHome writing his tomorrow back to today's squadron) must reopen every right
  with `endedBy` = the row it removes — his answer (b) — or be refused at the door with "Take the move back with Undo —
  that gives back his rights" — his answer (a). §12: until he answers, the door refuses (a).
- A plain removal (`removeGrant`) and a person delete (`dropGrantsOfAccount`) still **delete** rows, as now. Only the
  move ends them.

**One check.** A pure function in `units-model.ts`: `datedRowsBreach(before, after, today, who) → { code, …facts } | null`.
The gate calls it once in place of §6's date parts, §6's grant exemptions and §8's home loop. The doors (`setHome`,
`setGrant`, `addUnit`, `moveUnit`) call it on their draft and turn its code into words through one table, so the screen
never shows the gate's own reason (R5, and the "That did not save" family). Its rules:
1. **Never a day already begun** — homes and places alike. For each man or squadron a command touches, compare before
   and after on today and every `from` in either image. A difference on a day before tomorrow is refused, except a first
   placing from today (K1, and §8 as now).
2. **One change per command** — a command changes a man's squadron, or a squadron's place, at most once. No door writes
   more. This refuses R2's forged one-day move. That third proof accepts a refusal; a one-day move is no door's.
3. **Who:**
   - a man's squadron changing on *d* → an admin, on today, of the squadron he leaves on *d* (as now); the squadron he
     joins → an admin of it (§6, as now);
   - a place row → an admin of its squadron (the shared place's time zone, master only, is P2's — not here);
   - a right given, changed or removed → an admin of its squadron;
   - a right **ended or reopened in step with a move** — its `endedBy` names a home row this same command adds, or
     removes, or changes back — → whoever may make or unmake that move (R2's take-back, R3's Undo);
   - a right removed inside a person delete that takes that account away → the delete's maker (as now).
4. **No right outlives its man's squadron** (D2203, R4): in the rows after the command, a right holds only inside one
   stint of its man's home — no change of his squadron on any day in `(from, to)` — and never in his own home squadron on
   a day it holds. This one line replaces:
   - the "tomorrow window" in `setGrant` and the gate (its door words now say "He moves squadron on Fri 17 Jul — give
     this after the move");
   - the gate's "right given the day before his move";
   - the "move takes them" exemption.
5. **A move taken back gives back what it ended:** removing or replacing a home row before its day, while a right with
   `endedBy` = that row stays ended, is refused. Undo always reopens; the door's (a) or (b) above decides the rest.
6. **One right per account, unit and day:** "two rights for one account in one unit" becomes "two holding on one day".
   A right given after a move is a new row, never a reused ended one.
7. **Kept from today, unchanged:** a new or changed right is dated today; a kept right keeps its day; a verified replay
   is exempt where it is now.

**The bell.** `notices.ts adminThen` finds the grant holding on its day (`grantOn`) and reads `to` as well as `from`, so a
right ended by a move is not counted after it. **The re-dating hooks stay as they are** — `restoreRedated`,
`grantBackHolds`, `stoodGrant`, `masterFrom`, `pidFrom`, the timeline's `undoneOn`/`redoneOn`/`stoodBefore`. They still
serve a grant removed by `removeGrant` and then undone, and the master mark. Their retirement is filed, not done here
(§15).

**Every reader of grant rows must decide whether an ended row counts.** There are 17 sites (§3.6's core files):
- `accounts.ts` l.339;
- `notices.ts` l.301;
- `perms.ts` l.1756, 1852, 1870, 1875 — a right naming an account, G5 and the re-link check;
- `perms.ts` l.1972, 1999;
- `units.ts` l.89, 188, 198, 210, 234;
- `units-model.ts` l.113–157.

The rule: an ended row still **names** its account (G5 and the re-link read it, and the person delete drops ended rows
with the rest), but grants **nothing**. The builder lists each site with its choice, and the fix read checks every one.

### 4.3 Faults it closes
- **Closes:** R3, R4 (all four cases), R5, K1, and R2 once he answers (§12).
- **Left:** P1's own gap (an `admin` grant given by a non-master, D2199). It goes with P1, and plugs into rule 3 when
  built.

### 4.4 Tests
- Proofs R2, R3, R4, R5, K1, red first. R2's second case waits on his answer (§12).
- A table test of the one check: each row kind × {a day begun, today, tomorrow, later} × {first row, change, take-back}
  × {master, admin of the squadron he leaves, admin of the squadron he joins, Plan holder, member}.
- Undo then Redo of a move with a third squadron's right, by a plain admin and by the master.
- A right given after a move is a new row and does not bring back a bell line the move retired (fix read 7–12's cases).
- `levelIn` on the move day and the day after.
- The account delete with ended rows.
- **The regression net:** `state/units-sqn-fixread*.test.ts` and `leavewar/multi-sqn-fixread9–12.test.ts` all green.

### 4.5 What could break, and what the readers must look at
- **This is the highest-risk piece:** permissions, saved data, and the bell's retired-line machinery that fix reads 7–12
  built on "a move deletes rights".
- The fix read looks for:
  - any route that lets a non-admin of a squadron end or reopen its right without a real move or take-back in the same
    command;
  - any honest Undo or Redo now refused;
  - each of the 17 readers' choice;
  - a retired bell line coming back after a move is undone or a right re-given;
  - stored grants without `to` (they read as open — correct, and D56 covers the demo).
- **Walks:** Admin → Users — every account change, Archive, Restore, Delete and their Undos — for the four seeded
  sign-ins, desktop and iPhone. Nothing he sees should change.

### 4.6 Files
Core only: `state/units-model.ts`, `state/units.ts`, `state/perms.ts` (§6, §8), `state/notices.ts` (`adminThen`),
`state/accounts.ts` (its grant reader).

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
- **Dates:** today, every home `from` from today on, and every grant `from`/`to` from today on — either side.
- **Who counts:** an account that can sign in — admin role, switched on, its man on the roster (not archived, deleted
  or a placeholder).
- **The rule, per squadron and date:**
  - where a squadron has an admin **at home** before, it keeps one after (today's rule, unchanged);
  - where it has none at home, it keeps at least one non-master **Plan holder** (an admin grant holding that day);
  - a squadron new in this command needs one of either on today (B6);
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
- **The agent's reading, to be told to him (§14):** a Plan holder counts as a squadron's admin only where it has none at
  home. D2201 gives Plan "full access as its own admins". Today's lock already counts only home admins where there are
  some.

### 5.4 Tests
- The proofs B3 (Suspend, Demote, Archive, Delete) and B6, red first.
- The lock table: dates × home admins × a Plan-only squadron × a master (never counted) × an archived admin.
- The door's words equal the gate's code for every door: Suspend, Demote, Archive, Delete, Undo of an account step,
  `removeGrant`, `setGrant` lowering, `addUnit`, `setHome`, and a posting.
- **Setup-only test changes** (a ruling now refuses what they set up), §9.2: 15 `addUnit('150','p1')` calls in six test
  files, and the R2, R3 and R4 proofs. Each names a bystander first admin. The host checks that no assertion moved.

### 5.5 Risk, walks, readers
- **Risk:** a false refusal of an honest step — above all on a squadron that has only a Plan holder — and a posting held
  for ever.
- **Walk:** Admin → Users — Suspend, Demote, Archive, Delete of the last admin and of a second admin, on today and with
  a later move saved (bridge setup). Desktop and iPhone. The drawing check against picture 9b (D1494).
- **Readers:** the counting rule, the dates, the words table against the gate's codes.

### 5.6 Files
Core only: `state/lastadmin.ts` (new), `state/accounts.ts`, `state/perms.ts` (`lastAdminViolation`), `state/units.ts`.

## 6. Piece D — passes and lists over every squadron

### 6.1 What exists today
- The posting pass, `leavewar/sync.ts runPoOutcomes`, reads the **loaded** war's postings. So 149's postings run only
  when a 149 man opens the app (A5).
- `postingHeldNote` reads the loaded war only (A6).
- `raptorRoster.ts projectPeople` asks `onRosterOf(id, unit)` on today for a year-long grid (A1).
- A war takes a cell for a day that is not its squadron's (A7).
- `person-delete.ts applyDelete` step 3c strips only the in-view `PLANPUCKS` (B1).
- `leavewar/state/foreign.ts` already reads and writes another squadron's stored war for Admin → Users' four doors.

### 6.2 What replaces it
- **The posting pass over every squadron (A5).**
  1. `runPoOutcomes` first runs the loaded war as now.
  2. Then, for each other squadron, it reads its stored profiles through `readForeign`. Each due posting runs through
     the pure halves already lifted (`stintClosed`, `personCut`, `keepsWindow`). It writes through `foreignWar(u)`,
     enlisted in the pass's one command, as `archivePerson` and `deleteOnForeign` already do.
  3. It marks `poDone` in that squadron's stored profile. When that war later loads, its own pass skips the posting:
     run once, never twice.
  4. Its bell lines go to **that** squadron's admins (D2194, D2214).
- **The held note (A6):** `postingHeldNote(id)` and `poHeldReason` read the man's own squadron's posting — the loaded
  war when it is his squadron's, else `readForeign` of his home unit.
- **Each war's roster by date (A1):** `projectPeople(includeSans, unit)` takes a man who has any stint in `unit`
  (`stintsIn`, Piece A). Where the war holds no stored window for him, it sets `from`/`to` from the stint. 142's war
  keeps his months to the move and shows him posted out after; 149's counts him from his move day. The stored posting
  windows still lie over it (`setPeople`, `reprojectRoster`, as now).
- **A war takes a man's day only where that day is its squadron's (A7):**
  - the war's own door already refuses a day outside a man's window, so with A1's window 142's grid refuses 149's days;
  - the gate's war section, 7b, adds the same as a backstop: a war change about man *P* on day *d* is refused unless
    `homeOn(P, d)` is the war's squadron;
  - `sync.ts` gives the gate a probe that reads `(pid, iso)` off a war change. The master question is in §12.
- **A delete reaches every squadron's planning calendar (B1):**
  - `state/plan.ts` gains `stripGoneFrom(unit, pid, deletedFrom)`, run inside the delete's own command. It covers his
    home squadron's calendar and any squadron's calendar that names him: the stored `plan/<unit>@pp:` rows, plus
    `PLAN_MEM` for a squadron left this session.
  - The gate's section 7 allows it: the delete's maker is an admin of his squadron (§8).
  - Written through, not laid over at read, so the stored copy is true and a later edit of that note saves cleanly — the
    case Fable could not test.
- **What stays per loaded war, and why:** the OIL pass and the absence pass. Their results are seen only on that war,
  which runs both every time it loads (`swapWarWorld`). The posting pass is the one whose effects reach beyond its war:
  archive, suspend, delete. The plan readers may challenge this line.

### 6.3 Faults it closes
- **Closes:** A1, A5, A6, B1, and A7 with Piece A, less his answer on the master.
- **Left one-by-one:** A4 (§7).

### 6.4 Tests
- The proofs A1, A5, A6, A7, B1, red first.
- The pass runs once when the other war loads later.
- A refused foreign write rolls back whole, nothing half done.
- The bell goes to that squadron's admins only.
- A man moved there and back: two stints, two rows of months.
- A deleted man's note: a reload variant, and an edit of the stripped note that still saves.

### 6.5 Risk, walks, readers
- **Risk:** writing another squadron's stored war from a pass; a double run; lines to the wrong squadron; a deleted
  man's calendar row edited at the same moment.
- **Walks:**
  - both wars across a saved move, three days, desktop and iPhone;
  - a 149 posting on a day only Saber signs in;
  - the master's Admin → Users held note;
  - a delete with the other squadron's calendar naming him.
- **Readers:** run-once, rollback, the audience of each line, and the gate's 7b probe.

### 6.6 Files
- **Helper "war":** `leavewar/sync.ts`, `leavewar/state/raptorRoster.ts`, `leavewar/state/foreign.ts`.
- **Helper "session"**, after A-iv: `state/plan.ts`, `state/person-delete.ts`, and `state/store.ts`'s `PLAN_MEM`.
- **Core:** the one gate line in `perms.ts` 7b.
- Nothing in `leavewar/state/store.ts` (R1's file). If A1 turns out to need it, that part waits for R1 to merge.

## 7. The one-by-one fixes, each red first

- **R6:** `perms.ts stampForged`'s member rule compares the refusal's who and when in both directions: removing either
  stamp, or both, is refused. A verified replay and R1's lawful move are exempt. Core builder, after R1's fix merges —
  both touch the member decision rule.
- **K4 + B5:**
  - The blue/red answer's change id carries its squadron: `<unit>@<encodedRoleId>`, split in the role store and the
    decoder.
  - The `persist.ts` mapper writes `ensureUnit(id)` instead of `qualify(UNIT, …)`. The stored key is unchanged
    (`u142@missionrole:…`), so no saved data moves.
  - The gate's section 7 then sees the squadron, and Undo's `inUnitView` filters the step by it.
  - Files: `engine/mission-role.ts`, `engine/insights.ts`, `state/mission-roles.ts`, `state/persist.ts` (the mapper
    line), `state/changelines.ts`, `state/undo-wire.ts`, `undo/derive.ts`, `ui/mission-role-offer.ts` — helper
    "roles".
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
  - Rewrite `leavewar/holidays-by-place.test.ts`'s first case to D2195. It asserts the behaviour he overturned — the
    only assertion change in the plan, and named here.
  - Built in phase 3, by the core builder, once helper "war" and helper "own pages" have finished with `sync.ts` and
    `oilday.ts`.
- **R1:** beside the plan, now (D2238); not this plan's.

## 8. Held — and one added, with its reason

- **K2, K3, A3, B7, C7, C10:** held as the host filed them (`OUTSTANDING.md` [MSQ-FIXREAD17-OPEN]). Nothing in the
  reshape needs them. C10 is re-measured after Piece A (§3.5).
- **B2 — added to the held list, with B7.** The guest's squadron can only come from his request ("Request access asks
  the squadron first", D2094, step 5 — B7). Until then a waiting person has no squadron:
  - his session sits in 142 and sees 142's week, so 142's switch is the only one that can consistently govern what he
    sees;
  - both readers' stop-gaps are product choices: one switch for the whole app (Opus), or "any squadron's switch lets
    him in" (Fable). Either would let one squadron's admin decide for another's guests.
  So the right fix is B7's: the request names its squadron, the guest session starts there, and that squadron's switch
  decides. The proofs B2 and B2b stay red and named until then. **If he wants a stop-gap meanwhile, that is a fifth
  question for him (§14).**

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
- `holidays-by-place.test.ts`: the one assertion rewrite (§7, A4), under D2195.

### 9.3 Anything else that turns red
It is understood before it is touched. A test that pins only a way of doing something no ruling requires — for
instance a grant's re-dated `from` after the Undo of a move, which Piece B no longer goes through — is rewritten to pin
the ruling's outcome: the retired line stays retired, and the right holds again. Each such test is named in the report
and read by the fix read. None is deleted.

### 9.4 New tests
- §3.4, §4.4, §5.4 and §6.4.
- The behaviour guard (Piece 0) and the setting guard (A-ii).

### 9.5 Gates
- The whole gate set on GitHub's run (the repo is public).
- `npm run build`, for the type check.
- `node reference/tfin.js` 728/0.

## 10. File ownership, build order, and what is built at the same time

**The split of the shared files.** `state/perms.ts`, `state/units.ts`, `state/units-model.ts`, `state/accounts.ts` and
`state/notices.ts` are written by **one builder only, the core builder**, in order. That is D2238's reading: "the core
reshape is one job, its files shared". Helpers never write them. Where a helper needs one line there — the war probe's
call in 7b — the core builder writes it after the helper lands.

| Phase | Who | What | Files |
|---|---|---|---|
| 0 | core | Piece 0: shared world, C9, behaviour guard (green rows) | `test-support/msq-world.ts`, `testing/enumguard.ts`, guard tests, `state/msq-move-readers.test.ts` |
| 1 | core | **Piece A's bodies (expand):** home handle with `changesIn` and the per-person index, `stintsIn`; `inputSpanIso`, `inputSquadrons`, `inputOnDay`, `inputTouches`, `inputsListed`; `pageUnit`, `unitSetting`; `membersFileOn` (B4); 7c, `filerUnits`, `inputUnit`, `movedSince`/`homesOver` on the one body; `inputsFor` kept as a thin alias, defaults kept | `units-model.ts`, `units.ts`, `engine/roster.ts`, `engine/inputs.ts`, `engine/hooks.ts`, `perms.ts`, `notices.ts` |
| 2 | core | **Piece B, then Piece C**, in that order (C's counting reads B's dated grants) | `units-model.ts`, `units.ts`, `perms.ts`, `notices.ts`, `accounts.ts`, `lastadmin.ts` |
| 2, at the same time | helper "schedule" | A-i callers on the schedule side, C4, C6, C5's slot, C8, the landing callers | §3.6's list |
| 2, at the same time | helper "own pages" | A-ii callers, C2, C11, the own-page setting inventory then moves | §3.6's list |
| 2, at the same time | helper "war" | A1, A5, A6, A7's probe | `leavewar/sync.ts`, `raptorRoster.ts`, `foreign.ts` |
| 2, at the same time | helper "session" | A-iv (A2), then B1, then `store.ts`'s `inputsFor` callers | `state/store.ts`, `tracker/storage.js`, Tracker load files, `state/plan.ts`, `state/person-delete.ts` |
| 2, at the same time | helper "roles" | K4 + B5 | §7's eight files |
| 3 | core | **Contract:** remove the defaults and `inputsFor`'s no-day form; the compiler lists stragglers (each in a helper's file goes back to it, by then finished). 7b's war-day line (A7). R6 (after R1 merges). A4. The four answers as they come. Docs: `data-model.md` §11 (`UnitGrant`'s row rewritten to the dated rule — shorter), `data-schema.md` (`grant:` gains `to`, `endedBy`; an input's `u` if C3 is answered so), `file-map.md` (new files), `feature-impact.md` (the new seams: `enterSquadron`, `pageUnit`), `notifications-register.md` (A5's lines to the man's own squadron) | core files, `leavewar/sync.ts` (A4), `ui/oilday.ts` (A4), docs |
| 4 | host | Whole gate run; the combined four-reader fix read, blind; fixes red first; re-walk what the fixes touched; evidence sheet; his look | — |

- **No two phase-2 jobs share a file.** Phase 2's helpers start only once phase 1 is committed, because they call its
  bodies. The core builder's phase 2 runs beside them.
- **Merge order:** the core first, then each helper in turn, each bringing the core in before its own tests run.
- **Unsure, found out at the start:**
  - Whether helpers can each work in a worktree of their own (the Agent tool's worktree), given the "one checkout per
    session" guard. A trial write settles it.
  - If not, the helpers run one after another in the one checkout, still on disjoint files, the host committing between
    them.
- The gate lock (D228) holds for every full suite, multi-file browser run or fanned walk.

## 11. What a person sees — none of it new, except where named

| Change | On screen | Needs |
|---|---|---|
| B3 | Suspend, Demote, Archive or Delete of a last admin with a move saved: the approved sentence where "That did not save" stood | Built to picture 9b (D2217 Q15); drawing check (D1494) |
| A1 | A man moved 142 → 149: on 142's war his row stays for his months and reads posted out after the move; on 149's war his row starts on the move day | **A mock-up first (D1625)** — it shows a row where he now disappears. First check whether round 6's transfer drawings already draw the old squadron's war row (D2160 Q7); if they do, build to them |
| A4 | 149 stops showing 142's holidays (the fault going away); the warning names only its own days, in the words he gave | The words are his, verbatim (D2207). The agent's reading: no mock-up, as nothing new is drawn — the readers may disagree |
| A2 | A page left open across midnight of his own move shows his new squadron's schedule, war and Tracker | No new element. Named so he knows |
| C1, C2, C4, C6, C11, B1, A5, A6 | Lists and counts correct themselves; a 149 posting runs on its day; a held note shows for a 149 man on the master's Admin → Users (the existing look) | Faults going away |
| R2–R5, K1, B6, B4, K4/B5, C8, C9, R6 | Nothing — no screen saves a move, a place, a right or a squadron yet | — |

## 12. His four questions — where each answer plugs in, and what happens until then

- **C3 — does an ALL AVAIL meeting stay with the squadron it was filed in, or follow its filer's move?**
  - *Plugs into:* `inputSquadrons`' placeholder branch reads `r.u`. If "stays", filing stamps `u` — `InputWindow`'s
    save, and the demo seed's placeholder inputs.
  - *Until then:* the reader honours a stamp, but nothing writes one, so today's behaviour stands and proof C3 stays
    red, named.
  - *Recommended: stays* — a squadron's meeting is its own business (D2194). It also stops a master who files one from
    the other squadron's schedule (D2197) filing it into his own.
- **C5 — sign-off boxes: the day's people, or today's?**
  - *Plugs into:* `signPeople(schedOnly, keep, di)` reads `rosterOf(UNIT, dayIso(CURWEEK, di))` or `todayIso()`; one
    line.
  - *Until then:* today's, as now; proof C5 stays red.
  - *Recommended: the day's* — the same as the crew list beside it, and as D2184 Q13's detachment boxes ("anyone of its
    own squadron").
- **R2 — a move taken back the same day: refuse it and require Undo, or give the rights back?**
  - *Plugs into:* `setHome`'s take-back branch only. The gate's rule 5 (§4.2) serves both answers.
  - *Until then:* refused, with words. This is the narrower choice, and Undo gives everything back (R3 fixed). Proof
    R2's second case stays red until he answers.
  - *Recommended: give them back.* Otherwise only the admin who made the move can take it back (D148), and a mistake
    another admin finds costs the man his rights until a squadron gives them again.
- **A7 — may the master still write a man's leave into his old squadron's war for a day that is now the new
  squadron's?**
  - *Plugs into:* one flag in the war-day rule (7b's backstop, and the war's own window on the master's row).
  - *Until then:* refused for everyone, as the proof expects.
  - *Recommended: refused for everyone.* The day belongs in 149's war, where 149's admins and the man can write it now.
    The master can once his pick moves the war (D2197). D2221's own reading ("only a master or the man") was about who
    may change leave across a move, not which war holds it.

## 13. The walks (Sonnet walkers, the host opening every picture that decides something; desktop 1536×864 and iPhone 402)

- **Setup:** a move is saved through the developer bridge, since no screen saves one yet. That is setup only; every
  control checked is pressed on screen (the order's §7.0). The browser clock is moved to the day before, the move day
  and the day after. Whether the walk scripts can move the clock is found out from the existing
  `scripts/handpass/msq/` scripts first.
- **The plain-user round (D1557), for each of the four seeded sign-ins:**
  - Inputs: list, calendar, filter, his own input, filing for others;
  - the schedule's day panel and crew list;
  - publish and sign;
  - Quals, Medical, the SANS calendar;
  - the Leave War, the Tracker;
  - Admin → Users with its locks.
- **Each piece's own walks:** §3.5, §4.5, §5.5, §6.5.
- **Sizing:** by `walk-ledger.md` at build time; FULL tier.

## 14. What the plan could not settle, and how each will be found out

1. **B2 held with B7.** If he wants a stop-gap before step 5, it is a product choice — a fifth question (§8).
2. **A Plan holder counts as a squadron's admin only where it has none at home** (Piece C). The agent's reading of D2201
   and D2184 Q10, to be told to him with the report.
3. **A move ends rights on the day it is saved, now as a dated end (`to`) rather than a deletion** (Piece B). This keeps
   today's timing. The readers check it against D2203 ("old rights never follow him").
4. **The Tracker's re-entry in place** (A-iv). Its load path is read before any change. If it cannot be re-read in place
   cleanly, A2's Tracker part is left as a named one-by-one: the war and the schedule still move, and the Tracker moves
   at the next sign-in.
5. **A1's look:** a mock-up, or round 6's transfer drawing if one exists (§11).
6. **Helpers in separate worktrees, or one after another** (§10).
7. **What a war window open across midnight does when its world is swapped:** found by the A2 walk. If it misbehaves,
   the swap closes it the way sign-out does.

## 15. What this plan does not take from the readers' "shape" sections, and why

- **The Leave War store as one copy per squadron** (Fable A 3, Opus A 2): not taken. His D493 holds "the Leave War's
  saved-data reading" for the database step, which replaces it. `foreign.ts` stays the one way to reach a war that is
  not loaded, and the posting pass goes through it.
- **Bell lines settled when written, and the re-dating hooks retired** (Fable B 5, Opus B 3, core Opus 3): not in the
  35. Dated rights make it possible, but the hooks carry fix reads 7–12's pinned cases. Filed as a follow-up to propose
  after the fix read, not done inside it.
- **The gate reading only the saved copy** (security core shape 1): that is K2/K3, held for the database step.
- **Every change carrying its squadron as a required field** (security core shape 2): K4 does it for the blue/red
  answers, the one collection among the 35 that lacked it. The history's `u` field stays as it is.
- **No "u142" fallback** (Fable B 2, core Opus 4): held with A3. Removing the demo's fallback home would make every
  test-made person homeless; it goes at the database step's first boot.
- **One "today"** (`todayIso`, `rosterToday`, `localIsoToday`, the war's `effectiveToday`): no fault needs it. Under
  Piece A every caller names which today it means, which is what matters.
