---
paths:
  - raptor-port/src/leavewar/**
  - raptor-port/docs/leavewar/**
  - raptor-port/e2e/*leavewar*
  - raptor-port/docs/**/*leavewar*
  - raptor-port/docs/**/*lw-*
  - raptor-port/docs/**/*lw-*/**
  - raptor-port/docs/**/*one-absence*
  - raptor-port/docs/**/*arch-stack-4*
  - raptor-port/scripts/handpass/lw-*.mjs
  - raptor-port/scripts/handpass/seat-lw-*.mjs
  # the seams where the Leave War meets the rest of the app (widened 24 Sep 26, the spring clean's red team):
  # its architecture below binds these files too, so a session editing them must load it
  - raptor-port/src/main.tsx
  - raptor-port/src/probe-bridge.ts
  - raptor-port/src/state/store.ts
  - raptor-port/src/state/inputgate-hook.ts
  - raptor-port/src/state/people-settings-commit.ts
  - raptor-port/src/storage/**
  - raptor-port/src/command/**
  - raptor-port/src/undo/**
  - raptor-port/src/engine/qualcols.ts
  - raptor-port/src/engine/people.ts
  - raptor-port/src/engine/inputs.ts
  - raptor-port/src/ui/QualsPage.tsx
  - raptor-port/src/ui/InputsPage.tsx
  - raptor-port/src/ui/inputedit.tsx
  - raptor-port/src/ui/Shell.tsx
  - raptor-port/docs/data-schema.md
  - raptor-port/docs/undo-contract.md
  - raptor-port/docs/performance.md
---

# The Leave War — its architecture

Moved whole from `.claude/rules/decisions/leave-war.md` on 7 Nov 26 (the rules-diet plan §2, D1735), so it loads
with the Leave War's own files and where it meets the rest of the app, while the Leave War's rulings
(`.claude/rules/decisions/leave-war.md`) load only with its own files.

## Architecture — moved from `raptor-port/CLAUDE.md` §Architecture rules (24 Sep 26)

The Leave War's architecture rules, MOVED WHOLE, word for word (D138), so they load with this area instead of
in every chat (D140). The rules every area shares — the store, the mutation and persistence funnels, what
persists, the one command layer — stay in `raptor-port/CLAUDE.md` §Architecture rules. Paths inside this
section are relative to `raptor-port/` (as they were in that file).

**The Leave War tab is a SECOND app with a SECOND store** (vendored 16 Aug
26, `src/leavewar/`). It keeps its own store/notify/useVersion, its own
`state/storage.ts` seam (NOT `HOOKS.storeBackend`), and its own vitest project
(fixed TZ + jsdom + 20s timeout — see vite.config.ts). **IT PERSISTS — the
17 Aug 26 "session-only" decision was SUPERSEDED by the 8 Sep 26 storage work
(corrected here 17 Sep 26 after both reviewers found this reading as live).**
`main.tsx` boots it on the WHITEBOARD (`lwInitStore(leavewarAdapter(wb))`), so
on a built site a world that came back from storage keeps its wars, its OIL
story and its inputs; `installDemoWorld` overlays the demo only on a
first-ever boot. `memoryBackend` is now the DEV/TEST path only (`vite` dev,
`MODE==='test'`, `?fresh=1`, or a browser whose storage can't be touched —
`storage/boot.ts chooseBackend`). **Do not "restore" session-only behaviour or
delete this persistence as unintended — it is deliberate.** The seam interface
(`state/storage.ts`, `memoryBackend`/`localBackend`) stays; the shared database
replaces the implementation behind it. What is stored: `docs/data-schema.md`. Four seams cross the boundary, and only
four: `main.tsx` boots it once *[since 30 Sep 26 through `src/boot.ts`, the boot moved whole out of `main.tsx`, which
hands it the boot policy — on a shared store no demo world and no seed war; a store may then hold NO war, and the page
says "No leave period yet" (`[DB-READINESS]` group A phase 5)]* (`lwInitStore` → `installDemoWorld` →
`wireLeaveWarSync` → a `histInit` re-baseline, in that order), `resetSession`
derives its role from the Raptor login (`store.ts:toggleRole` — the admin's
view-as-member flip, 27 Aug 26 — is the only other production writer, riding
this same seam so the war always reads the session's EFFECTIVE role; on the
Leave War itself, moving the cycle stage forward became admin-only the same
day — members still bid) *[AMENDED 26 Sep 26 by `[ACCOUNTS]` (D166 (3)): the toggle is gone — `resetSession` was then the ONE production writer
of the war's role. AMENDED AGAIN 27 Sep 26 by D292, built with `[POST-OUT-OUTCOMES]`: the admin's member view is back —
TWO production writers now, `resetSession` (every sign-in starts as admin) and the switch (`state/store.ts
switchRoleView`), both on this same seam]*, `probe-bridge.ts`
exposes `w.lwSetRole` for its e2e suite *[the whole bridge on the developer's PC only since `[ACCOUNTS]`]*, and **`src/leavewar/sync.ts`** — the
sync wires (17 Aug 26; this seam also mirrors Raptor's "View as" person *[since `[ACCOUNTS]`, 26 Sep 26 — D166 (4): the
SIGNED-IN person, `state/perms.ts viewerId()`; '' (no row) for someone signed in without access]* into
the Leave War store's `viewer` on every Raptor notify — what lights the
viewer's row and personalises the counter picker — a rider on this seam, not
a fifth): Leave War's roster is a boot-time PROJECTION of
Raptor's PEOPLE; **an absence is ONE record — the Raptor Input ([ARCH-STACK]
step 4, 20 Sep 26; SUPERSEDES the 17 Aug two-way copy: `runInbound`,
`runOutbound`, `retractLwRow`, `ingestFromRaptor` are deleted)**. The war
stores only its own records — a LIST per person/date of requests, OIL credits
and replaced-bid notices (`engine/warrecs.ts`) — and DERIVES everything it
shows about leave, medical, courses and overseas duty from the Inputs on read
(`sync.ts:refreshAbsences` → `state/merge.ts` → `engine/dayview.ts`: one main
code by the agreed ladder, grey `+n` / amber `!`, charges by halves). Approving
on the war writes the Input inside the same command (the absence door in
`sync.ts`, installed on the store, carrying `lw` = the war id as provenance).
The owner's clash rules run at ONE seat inside the Raptor inputs door
(`leavewar/inputgate.ts` via `state/inputgate-hook.ts`: sick cuts leave, no
overlapping leave / leave over a medical / leave over recorded work, a
clashing input replaces an undecided bid with a notice) — and on undo/redo, and
publishing a weekend/PH day replaces a clashing bid inside the publish command. *(SUPERSEDED 20–21 Sep 26 — marked
24 Sep 26 by the amendment re-test, per D90: "keep the bid and flag the day, both ways" — publishing KEEPS a clashing
undecided bid and flags the day; `leavewar/sync.ts` `publishFlagsBids`, pinned by `leavewar/publishdoor.test.ts`;
register AM48c.)*
Rules of record: `docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md`.
Weekend/holiday WORK — the
PUBLISHED schedule plus acknowledged Duty-&-commitments input claims
(`row.oil`, the OilConfirm ask-flow, 28 Aug 26) — credits OIL as a third
derived pass (wire 4, `runOilPass` +
`engine/oil.ts`, one ≤6h/>6h test on the day's start-to-finish ENVELOPE
since 29 Aug 26 — gaps between events count, and the schedule half reads
every visited week via the session stash, not just the loaded one — the
ownership partition is by cell vocabulary, FO/HO vs
leave codes; credits are `oil:'auto'` records with the work times). Editing
or deleting a war-approved Input on the Inputs page needs no carry-back any
more — the war simply re-reads it (a member's own date/type edit clears `lw`,
so it gains the blue "filed on the Inputs page" edge, owner 19 Sep 26). The roster is a LIVE projection since 18 Aug 26: `sync.ts:reprojectRoster`
re-projects Raptor's PEOPLE on every Raptor notify (change-guarded), so a body
added on the Quals page reaches Leave War without a reload — a rider on this
same seam. Its DISPLAY is categorised (`engine/people.ts:groupOf` — SXO / IP /
OPS P by CAT / IWSO / OPS W by CAT / OCU / Personnel, colours from Raptor's
`--q-*`), and ground crew ride it (`pers`, seat `gnd`) but are skipped by every
manning count (`countsFor`); `categoryOf` and the thresholds are untouched.
The PUBLISHED remarks editor (27 Aug 26) rides this same seam in the war→Raptor
direction: `sync.ts:leaveInputAt` finds the Raptor input a war cell derives
from (through the day view), and `RemarksSheet` saves through Raptor's own
`setLeaveRemarks → commitInputEdit` — a remarks-only edit. A day holding more
than one record opens the TAP LIST instead (`ui/DayList.tsx`), each record on
its own line with its own actions. Don't add a fifth seam casually,
and never call its `initStore` from a component — it clears the store's
subscribers.

**SAVED ONE ROW PER RECORD, FROM THE COMMAND STREAM (`[DB-READINESS]` group A, phase 3, 30 Sep 26 —
`src/leavewar/state/rows.ts`).** A war, each of its records (`rec:<war>:<recId>`, with its person, date and place
`ord`), each ledger entry, each opening and each man's profile (window + label) is its own stored row; the store
subscribes to the one command stream it already joined and writes, through its OWN door, exactly the rows each
command's changes land in — a move is one row, a row goes only for a record that command removed. Not a fifth seam:
the war still stores only through `state/storage.ts`. `rawPersist` writes nothing; a change outside every command is
not saved. **No Edit person (D460, D461):** the war keeps no seat, band or SXO of its own — `setPerson`,
`PersonSheet.tsx` and `personEdits` are gone; the projection's are the man's (Quals is the one place they change).
Detail: `raptor-port/docs/data-schema.md` §World 2.

**THE CALENDARS READ THE WAR THROUGH `sync.ts` — a rider on that seam, not a fifth (the Inputs / SANS redesign, 7 Oct 26;
D617, D627, D640; the plan `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.1).** Two stores
hold the facts of one day: its flying class and required pilots and WSOs are the scheduler's settings rows
(`state/flyplan.ts` — they outlive any one period); whether it is a public holiday or an Off day, and who is available
per seat, are the war's. `sync.ts` hands the war's half over, read only: `dayFacts(iso)` (from the period HOLDING the
date, never the one on screen), `holidaysIn(year)`, and the signal `useWarFacts()` — a version that moves when anything
those read has moved (a day's events, a band, the event types, a period, the count rows, the roster, a bid, an absence,
an Undo of any) and stands still for a look. It is NOT the OIL-only Raptor notify, which stays as narrow as it is. The
ONE place the two halves are joined is `state/flyplan-model.ts planFor`; a screen that joins them itself is a defect.
Who is available is the two Available rows (`engine/availrows.ts`, ids `availp` / `availw`): ordinary count rows an admin
renames and re-defines, summed by ONE function that never counts a SANS man, never drawn or judged with the Manning rows. *[AMENDED 8 Oct 26 by D665: they ARE drawn in the Manning block now — its last rows, with the two Required rows, by `ui/FlyRows.tsx` — still never as rows of the Manning list (`manningRowIds`), and still never judged.]* *[AMENDED 22 Oct 26 by D1213: judged now — at amber or red an Available row counts as under-manned, in the chip and the bid window's day line; built with [LW-OVERHAUL].]* *[D1190, D1191, 21 Oct 26: they are to get an amber point he sets — a number plus or minus that day's Required (D1191); that it sits in the row's own window is the agent's reading, drawn for him — built with [LW-OVERHAUL]; until then they carry no amber, and red only under Required.]* *[AND SINCE D674 (8 Oct 26) NOT ALWAYS ITS LAST ROWS: a counter may stand above the four, between any two of them, or below all four. The block's ONE order is `state/store.ts manningBlockOrder` — the counters and the four rows' tokens, read by the pure `engine/fixedrows.ts`; `manningRowIds` is still the counters alone, and the calendars still find the Available rows by their rule ids.]*
**And the war reads the flying plan through the same file — the second rider:** its Required rows reach the scheduler's
records and typed commands only through the re-export at the foot of `sync.ts`, and every screen that shows a day's
class, required figures or how many more are needed asks `sync.ts flyAnswer(iso)` / `flyMonth(y, m)` — the plan, the
war's facts and the SANS committed to fly (`state/flyplan.ts sansFly`: only a SANS man, never one archived) handed to the
ONE resolver. **The Holidays list writes the war's own record** (D638 — two doors, one record): `holidayAdd` /
`holidayChange` / `holidayRemove` (`state/store.ts`, pure half `engine/holidays.ts`) write a tagged day event or a merged
band into the period HOLDING the date, on the first Event row free across the range, each ONE named command
(`lw.holiday.*`); a change is checked whole before anything is taken away.
**WHO READS IT, AS BUILT (steps 3 to 5 of that job, 8 Oct 26) — the list a new reader is added to.** On the scheduler's
side, six screen files import the war's half (and `probe-bridge.ts`, for the browser tests), all from `leavewar/sync.ts`: the window called "Calendar" on screen
(`ui/DaysWindow.tsx` — `flyMonth`, `useWarFacts`) and its Holidays list (`ui/HolidaysPanel.tsx` — `holidaysIn`, the three
`holiday*` writers, `uncoveredIn(year)`: the runs of dates no period covers, said BEFORE a save is refused, and
`holidayWord(kind)`: the word a nameless holiday is saved under); the SANS month, its opened day and "+ Commitment"
(`ui/SansCal.tsx`, `ui/SansDay.tsx`, `ui/sansadd.ts` — `flyMonth` / `flyAnswer` for the need, `dayFacts` for the tag);
and the Inputs month (`ui/InputsCal.tsx` — the date's tag only: PH, an Off day, NF; no sun, no moon, no figures — D627).
`dayFacts` answers `covered:false` with both counts `null` for a date no period holds — who is available is then
UNKNOWN, and every reader prints a dash, never 0 — and carries `short`, what the Event row prints for that holiday
(D652), so a calendar's tag and the war's grid cannot differ. **Two doors cross the boundary, and each reaches a flag,
never a screen:** `sync.ts openDays(iso)` — the "Calendar…" line in the war's ⚙ — sets the scheduler's open-flag
(`ui/pops.ts`) and the window itself stays the gate (admins only); `sync.ts openNewPeriod(from, to)` — the Holidays
list, on dates no period covers — leaves an ask for the war's own top row (`leavewar/ui/warask.ts`, never the war's
store: an ask is not a fact about the war, so it is not saved, not undone and repaints no grid) and brings the Leave
War to the front, where the war's own sheet checks everything itself. The war's four rows repaint on two signals of
their own (`usePlanVersion`, `useWarFacts`) inside `leavewar/ui/FlyRows.tsx`; `Matrix` and the memo firewall are not
touched (`raptor-port/docs/performance.md` §E).

## The project guide's map row — moved whole from `raptor-port/CLAUDE.md` §Where things live (7 Nov 26)

| **The Leave War tab** (vendored app: engine, store, UI, tests) | `src/leavewar/` — its own store and `leavewar:` storage keys; role written by `resetSession` and by the admin's member-view switch (`state/store.ts switchRoleView` — D292, 27 Sep 26, `[POST-OUT-OUTCOMES]`; the old `toggleRole` went with `[ACCOUNTS]`, D166 (3)); a posting out says which it is and does it on its date (`sync.ts postOut` / `runPoOutcomes`, `ui/OutcomeChips.tsx` — D229); stage-advance is admin-only (27 Aug 26, members still bid); a member bids only on their OWN row — the SIGNED-IN person (D166 (4); the "View as" person until `[ACCOUNTS]`), mirrored to `viewer` — while an admin edits any row (`canEditRow`, 27 Aug 26; enforced at the write path and the grid affordance alike); an admin decides bids at closed OR published (`canDecide`, 27 Aug 26 — since the 27 Aug overnight pass the STORE enforces it too: `setBidState`/`setBidStates` refuse anyone else, `shiftBid` carries `moveCells`' whole stage/window/war-day law *(retired 28 Sep 26 — every move goes through `moveRecords`, [LW-SPARE-MOVE-DOORS])*, `moveProblem` is the one validation body the landing preview and the commit share, a chain of closed moves keeps the ORIGINAL `shiftedFrom`, and NO ONE writes a medical mark on the war — medical is MEMBER-FILED only since 13 Sep 26, reversing the 17 Aug "management's" rule: blocked at `setCell`/`setCellRange`/`setCells` for every role incl admin, the pickers removed; the war still DISPLAYS member-filed medical, read from the Inputs (step 4, 20 Sep 26)); a drag selects a block to batch fill/decide/move/delete and a plain click still opens the single-cell sheet (`select.ts`, capture taken in `arm()`); the dotted "moved" mark is recorded AND shown only for a move made once bidding is closed (`biddingClosed`, 27 Aug 26 — an open-bidding shuffle stores no `shiftedFrom`, so it never sprouts the stripe when the war later closes); the colour pop-out is "Legend"; at PUBLISHED a tap on an approved leave opens the remarks editor (`RemarksSheet` → `sync.ts:leaveInputAt` + `inputedit.ts:setLeaveRemarks`, member edits own / admin any); CSS scoped under `#page-leavewar`; gaps in `docs/leavewar/known-gaps.md`, future sync in `docs/superpowers/specs/leavewar-sync.md` |

## Moved from the rulings' §Settled — the bullet that binds a seam file (7 Nov 26)

- **The qual catalogue is Raptor's LoX column list, not the holders.** Column list
  lives in `engine/qualcols.ts`; `qualCatalogue` takes keys+headings from it,
  appending any key someone still holds after a removed column (ticks survive).
  (The old "known gap — the column list isn't saved across reload" was SUPERSEDED
  by the 8 Sep 26 storage work: `qualcols` is one of the durable settings keys,
  saved and reloaded by `engine/qualcols.ts`. Corrected 17 Sep 26.)
