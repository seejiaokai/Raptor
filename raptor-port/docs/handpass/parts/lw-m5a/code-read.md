# M5a — the fresh, blind code read (D790) — one Opus reader, read-only, on commit 92b43acf9 (29 Oct 26)

Kept as the reader handed it back. Scope: `git diff 230aa3b85 92b43acf9 -- raptor-port/src`, read against the build spec
(`docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md`, D1490–D1492). Read beside the evidence so far — the walk's triage,
the security read (its four holes, fixed), the builders' reports and the scenario list — so nothing below repeats those.
D56 applied: nothing below lives only in stored demo data; each failure happens to data made after the fix too. Findings
1 and 2 were PROVED by throwaway tests run against a copy of the commit's own source (the session scratchpad
`cr/raptor-port/src/leavewar/zzcoderead.test.tsx` and `…/ui/zzcoderead2.test.tsx` — not in the repo); the others are read
from the code, each with the red test that would prove it.

**Count: 5 findings — 1 MEDIUM, 1 MEDIUM-LOW, 3 LOW.**

## 1. MEDIUM (saved data) — Undo of the FIRST edit of the grades list is not saved: after a reload the undone edit is back

**The failure (proved).** A store whose grades list has never been edited (the starting five). The admin renames "Ops A"
to "Ops B" in the Grades window, then presses Undo: the page reads "Ops A". He reloads: it reads "Ops B" again. The same
with his first delete — Ranger holds Junior WSO, the admin deletes Junior WSO (Ranger "No grade"), Undo (Ranger Junior WSO
again), reload: Junior WSO is deleted again and Ranger reads "No grade". So the first rename, delete, "+ days", reorder or
add that an admin takes back comes back on the next reload — for a delete, every holder silently loses his grade and the
next 1 Jan adds him nothing.

**Cause.** `leavewar/state/store.ts lwDecompose` writes `lw.config` with `grades` only once the list has been edited
(`...(s.grades ? { grades: s.grades } : {})` — narrow read 6). The Undo of the first edit restores the before-image, a
config record with no `grades` field. `leavewar/state/rows.ts lwRows`, case `lw.config`, skips any field the after-image
lacks (`if (!(field in a)) continue`), so the stored `grades` row is never removed. In memory `applyLwRecord` reads the
absent field as `null` (the starting five) — correct until the reload, when `initStore`'s `readStored('grades', readGrades)`
reads the left-over row.

**Fix, step by step.**
1. In `rows.ts lwRows`, case `lw.config`, change the skip so a field the before-image had and the after-image lacks removes
   its row: `if (!(field in a)) { if (b && field in b) remove(key); continue }`.
2. Nothing else: `applyLwRecord` already reads an absent `grades` as `null`, and `readStored` reads no row as the starting
   five. (The other way — writing `grades: null` always — would break narrow read 6's "absent" and the tests that pin it.)
3. Check the same rule for every other `CONFIG_KEYS` field that can be absent (today only `grades`; `reqNames` is always
   written).

**Red test** (`leavewar/state/store.test.ts`, or the demo boot file): with `be = memoryBackend()`, `initStore(be)`, admin
signed in — `renameGrade('opsa', 'Ops B')`; `globalUndo()`; `expect(be.read('grades')).toBeNull()`; `initStore(be)`;
`expect(gradesList().find(g => g.id === 'opsa')!.name).toBe('Ops A')`. And the delete case: `setPersonGrade('bane','jw')`,
`deleteGrade('jw')`, `globalUndo()`, `initStore(be)`, `expect(gradeOf('bane')?.id).toBe('jw')`. Both fail on 92b43acf9.

## 2. MEDIUM-LOW (the person window) — his leave deleted or replaced FROM THE INPUTS PAGE leaves no mark: no dot, no struck line

**The failure (proved).** Ranger's LL on Mon 3 Aug is approved; Ranger opens his own window. An hour later a scheduler
deletes that leave on the Inputs page. Ranger opens his window again: the line is simply gone — no struck-through line, no
dot, no "deleted by Saber · today 09:00". The spec wants it struck through for that visit (§2.1), and its roll-call lists "an
Inputs-page change by a scheduler" among the changes a man must be told of (§5). The same for his pending bid taken away
because a scheduler filed a clashing input over it (a medical, say): it vanishes from his list without a word. The builder
named the first as left undone ("no machine mark for an Input deleted on the Inputs page"); the walk's triage did not take it.

**Cause.** The window finds what someone else deleted only by a machine mark `fld: 'deleted'` (`leavewar/ui/personleave.ts
marksOf`). Two history writers in `state/changelines.ts` write none: `inputLines`' delete branch (`if (b && !a)`, "· LL
deleted ·") logs `iid`, `sub`, `itype`, `date`, `end` but no `fld`; and `crossLines` ("bid taken away — an input covers it",
"bid removed") logs `sub` and `date` but neither `fld` nor `itype`. (The ELOG row the test saw: `"Ranger · LL deleted · 3
Aug"`, no `fld`.)

**Fix, step by step.**
1. `changelines.ts inputLines`, the delete branch: when the input was a leave (`isLeave(b.type)`) and this is not the war's
   own "approval taken back" (`!war`), add `fld: 'deleted'` to its `at({...})`; `itype` is already the type ('LL'), `iid` and
   `sub` already there; add `days` (its exact days) where the input is not one run, as `warInputLines` does.
2. `changelines.ts crossLines`: give each request's line `fld: 'deleted'` and `itype: String(r.code || '')` (the request's
   own code, '*LL' and the like), so `personleave.ts` can rebuild the struck line and its half.
3. Nothing in `personleave.ts` changes: it already joins 'deleted' marks of one moment and one hand into one struck line,
   and drops his own.
4. Name the readers in the MACHINE MARKS comment above `cellParts` ("…and an approved leave deleted, or a bid taken away,
   from the Inputs page").

**Red test** (`leavewar/ui/personwindow.test.tsx`, its own set-up): admin `setCell(RANGER, D1, 'LL')` and approves it;
`ranger()`, `openOwnWindow(RANGER)`; `T(9)`, `saber()`, `removeInput(<that input>)`; `T(10)`, `ranger()`; `expect(
personLeave(RANGER, openOwnWindow(RANGER)).some(l => l.state === 'deleted' && l.from === D1)).toBe(true)` — fails on
92b43acf9 (the list is empty). A second case: his pending LL bid on D3, a scheduler files an ATT C over D3 on the Inputs
page → a 'deleted' line for D3.

## 3. LOW (the person window) — a machine mark lights every line on its dates, whatever the leave's kind

**The failure.** Ranger holds an approved LL on the morning of Tue 17 Mar and a pending CL bid on its afternoon. The admin
changes the CL bid to FCL. In Ranger's own window the FCL line rightly reads "changed from CL by Saber" — and so does his
untouched LL line, with a dot. The same for an admin's move of one half-day bid onto a day whose other half holds another
leave of his: both lines read "moved by Saber".

**Cause.** `personleave.ts markCands` keeps a mark for a line when its dates overlap the line's (`overlaps(r.date, r.end ??
r.date, from, to)`) — for an approved Input also when its `iid` matches — but never compares the mark's leave (`itype`) with
the line's `code`, nor its half.

**Fix, step by step.** In `markCands`, add the line's code (and, for a one-day half line, its half) as arguments, and keep a
mark only when `parseCell(r.itype ?? '')?.type === code` — for 'kind' marks `itype` is already the code after, which is the
line's — and, where both are halves, the same half (`parseCell(r.itype)?.portion`). Keep the `iid` match as it is (an
Input's own mark always counts).

**Red test** (`personwindow.test.tsx`): approved LL AM and pending CL PM on one day; open his window; admin re-types the CL
bid to FCL; reopen → the FCL line has a dot, the LL line has none.

## 4. LOW (the money — D1490) — a grade or a grade's "+ days" changed ON 1 Jan, or a grade deleted on 1 Jan, changes what that 1 Jan already added

**The failure.** 1 Jan 2027: Recon (Junior pilot, +33) has rolled over to 52. That morning the admin corrects his grade to
Senior pilot: his App bal goes to 55 at once. Or the admin changes Senior pilot from +36 to +38 that day: every senior pilot
gains 2 at once. Or he deletes Junior WSO that day: every holder loses the 18 days that 1 Jan had already added. D1490 (full
row): "the days that 1 Jan already added stay as they were, and a wrong grade put right after 1 Jan is corrected for that
year by typing his App bal"; reading 11: "past 1 Jans keep what they added". The roll-over is worked out live, so the day of
the roll-over is the one day a change reaches back.

**Cause.** `leavewar/engine/leaveyear.ts`: `gradeOn` takes an entry with `e.from <= day`, `gradeDaysOn` a days entry with
`d.from <= on` and drops a grade with `g.goneFrom <= on` — all comparing against 1 Jan itself, and the writers
(`store.ts setPersonGrade`, `setGradeDays`, `deleteGrade`, `addGrade`) date a change with the app's today.

**Fix, step by step.** In the roll-over only (not `gradeOf` / `gradeDaysNow`, which say what holds today), count what took
effect strictly BEFORE that 1 Jan: in `gradeDaysOn`, read the grade with a `before` comparison (a `gradeBefore(w, pid, on)`
that takes `e.from < on`), its days with `d.from < on`, and drop a deleted grade only when `g.goneFrom < on`. The starting
five (`from: '0001-01-01'`) and the demo's grades (dated 1 Jan 26, the typing year, which never rolls over) are unchanged.
Re-run §1.5's table — no row sets a grade on a 1 Jan.

**Red test** (`engine/leaveyear.test.ts`): a junior pilot typed 23 incl. 3 in Dec 2026; his grade history `[{jp, 2026-01-01},
{sp, 2027-01-01}]`; today 2027-01-01 → App bal 20 carried + 33 = 53 (92b43acf9 reads 56); and a grade deleted with `goneFrom: '2027-01-01'` still
adds its days on 1 Jan 2027.

## 5. LOW (the money — readers agree) — Approvals' DAYS and the window's line days ignore the seat of a man with no row

**The failure.** A SANS pilot while SANS is off the war (no row; his requests still reach Approvals — B12) bids LL for 15
days Mon 1 – Mon 15 Feb 2027. His tile's Pending and Approvals' LVE BAL count the run's weekends (a pilot's run of 15 or more
charges every day — 15), but Approvals' DAYS reads 11, and his person window's line says 11 days. Reading 24 allows the two
to part only where a bid lengthens an approved run; here the request alone is a pilot's run of 15.

**Cause.** `leavewar/approvals.ts ownDays` charges with `figureCtxOf()`, whose `people` is the war's roster only; the
engine's own world (`store.ts leaveWorld`) adds the man's off-roster identity (`HIDDEN_IDENTITY`, the spec §4), `ownDays`
does not, so `charge.ts isPilot` answers no for him.

**Fix, step by step.** Export from the store one "who is he" context for a person — e.g. `countCtxOf(pid)`: `{ eventDefs,
people: leaveWorld(pid).ctx.people }` — and have `ownDays` default to it (`ctx.people` from it, `ctx.sources` from
`figureCtxOf()` as now). Every caller (Approvals' DAYS, My leave's pending, the window's lines) then agrees with the tiles.

**Red test** (`leavewar/m5a-readers.test.ts`): SANS off, the SANS pilot's 15-day pending LL → `ownDays` 15 and
`leaveFiguresOf(pid).kinds.LVE.pending` 15.

## What I checked that held (one line each)

1. The engine (`leaveyear.ts`) against §1.3–1.5 by hand: rows 3, 5, 6 and the year's rule recomputed; carried forward first,
   days given back to this year's leave only, later-year days off the total, the never-typed start — as specified.
2. The snapshot and "now" are charged by the same `chargedDays` run; the snapshot rebuilds LL for LVE, so a pilot's run reads
   the same in both; a request can only be pending or refused, so no day is charged twice in War bal.
3. Dates no period covers: `dayRecsOf` takes absences from the war-agnostic index and `chargedDays` charges them by the
   plain rule (reading 17).
4. `leaveFiguresOf`'s cache key covers every input the engine reads: the merged wars (periods, holidays, requests), the
   absence version (any Inputs change), typed figures, grade histories, the grades list, the ledger, openings, the roster,
   event types and the app's today (midnight: `dayTurned` notifies, the key turns). The off-roster lookup clears it when set.
5. The cache is cleared by any state change at all (the merged wars array is rebuilt), but a full re-work of the demo's 50
   men measured ~2–4 ms on this PC — no finding.
6. `balanceAfterFill`: War bal before and with the fill as the engine's what-if, portion passed, OIL kept on the tracker's
   ledger; the leave buttons' "left", the one-day and drag windows' below-zero ask read it.
7. My leave: War bal, the OIL ledger, pending = the sum of `ownDays` over his pending lines only (`linesOfWar` keeps pending).
8. Approvals' LVE BAL = the War bal of the kind spent (OIL the tracker), across periods.
9. The grid's two lines: War bal and LL + OL in the View period, approved and pending; the phone's frozen copy reads the same
   `nameLines`.
10. No old reader still draws a leave balance: `FIGURES` is read only for OIL (`oilLedgerOf`) and for the grid column's
    label; `balanceOf`, `figureParts`, `takenOf`, `figureLines` have no caller on screen; Insights, the day panel and exports
    read none.
11. Saved data: `lw.balance` and `lw.grade` are in `readWorldRows`, `lwDecompose`, `applyLwRecord`, `LW_COLLS`, `lwRows`,
    `writeWorldRows`' record list, the command layer's collection list and table map; `grades` and `balLock` in `CONFIG_KEYS`,
    `lwDecompose`, `applyLwRecord` and the boot's `readStored` (but finding 1); the legacy history snapshot carries all four.
12. The demo's figures are laid only where none is held, on a demo store's first boot, and saved once; a shared store gets none.
13. Undo / Redo: a typed figure (its first typing undone is a delete — the member's own C U D), a grade, the lock, the
    grades list after its first edit — restored by `applyLwRecord` and written by `lwRows`; their history lines and Undo
    words take "to" from the saved row.
14. The gate: own row, the lock read at save (Undo and Redo too), never OIL, `cf` only on LVE, halves within ±999, the exact
    shape, typed by him today with the store's own snapshot; restores vouched by `verifiedReplay`; `lw.grade` an admin's
    record; `lwseen:` only by `lw.seen`, own pid, every role.
15. `setTypedBalance` writes the whole row afresh (§1.1), the snapshot built at the save, "from" the store's running figure;
    `saveTypedFigure` clamps the carried-forward box to the App bal as shown.
16. The grade writers' early exits: same grade, same days, same place, a deleted grade — each a no-op that writes nothing; a
    same-day second change replaces the first; ids are never reused (a deleted grade keeps its record); a deleted grade's
    holders read "No grade" and Undo restores them.
17. The last visit: written only when the signed-in person opens HIS OWN window (an admin's own included), at the tap, never
    while drawing; the previous moment kept for the visit; not an Undo step and does not clear Redo; kept across a reload.
18. "Who, when": an approval's Input carries the approver (`stampPlaced`), its placer in `lwBy` — "approved by" / "added and
    approved by" read right; his own changes never dotted; another man's window shows none.
19. The Balances page: the grid's people, order and groups for the View period; rows memoised on their figures; boxes by the
    store's own rule; a box saves to the man it was opened on (★17), an unmounted box saves or says why.
20. What left: `setBalance`, the drawer, `setBalOpen`, the drag grant and the figure-order writers have no caller left;
    `grantTo` stays for OIL only.

**As built, worth a line to him (not findings):** a figure typed equal to the running figure saves nothing (the box sees no
change), so it does not "start the count afresh" (D1479) — the figures read the same either way, except in reading 18's
corner; the Balances page lists a man posted out in the View period as the grid shows him (reading 9 says "the people on the
grid", and also "an archived man … not listed" — the two meet only for such a man).
