# M5a — the readers' builder's report (29 Oct 26, ~00:30) — saved as it arrived, lightly trimmed

**Status:** built; vitest `src/leavewar src/state src/undo src/ui/changesmodel.test.ts` 296 files, 4,935 passed, 24 skipped,
0 failed; 30 more files touching the history or Undo, 984 passed; `npm run build` passes. e2e `leavewar.spec.ts` (~L2390,
~L2611–2614) read: its pins still hold, no spec edited.

**Changed (raptor-port/src/):** `leavewar/state/store.ts` — `balanceAfterFill` (signature kept; every kind but OIL reads War
bal from `leaveFiguresOf` and its what-if; OIL still the tracker through `withFill`) and a boot-only
`installDemoBalances({ balances, gradeHist })` (leaves anything stored alone; `persistBootWorld` saves the rows);
`leavewar/state/demoworld.ts` — `demoBalances(people)`, `DEMO_M5A_RECS` (Ranger's requests), `DEMO_M5A_LEAVE` (his approved
leave as Inputs), called after the re-key, before `persistBootWorld`; `leavewar/ui/MatrixRows.tsx` — `nameFigures(pid, from,
to)`, `nameLines(pid, period)`: the first line LVE War bal, the second one amber number, `annualUsedIn` over the View period;
`figSel` and `figureCtx` optional and unused; `leavewar/ui/FigureCell.tsx` — `selected` / `data-figsel` gone;
`leavewar/ui/myleave.ts` — `myLeaveOf(wars, personId, today)`: LVE = War bal, OIL = `oilLedgerOf`, "pending" = the sum of
`ownDays` over his `linesOfWar` lines (= Approvals' DAYS); `pendingDaysOf`, `nextLeaveOf`; `leavewar/ui/Chrome.tsx` — the My
leave call, `FIGURES` import dropped (`figureCtxOf` import left unused); `leavewar/approvals.ts` — `ownDays(pid, parts,
ctx?)`: one request charged on its own (the periods and holidays of the wars, the pilots' 15-day rule only within the request
itself); DAYS reads it; LVE BAL = the War bal of the kind the request spends (OIL requests the tracker);
`leavewar/ui/belowzero.ts` — `balanceLabel` by kind name; `state/changelines.ts` — the new lines, the machine marks, the
`wrote` set; `undo/describe.ts` — "Undo — LVE balance 18 → 20", "Undo — LVE balance → 20", "Undo — LVE carried fwd 2 → 3",
"Undo — Ranger’s grade", "Undo — the grades list", "Undo — the balance lock"; `leavewar/engine/counters.ts` —
`selectableFigure` removed (`FIGURES`, `figureLines`, `figureParts`, `plainBal`, `takenOf`, `lveConOf`, `medConOf` stay for
CounterSheet / Matrix until the person window replaces the sheet); `docs/file-map.md`.

**Tests:** added `leavewar/m5a-readers.test.ts` (11 — agreement: the grid line, `nameLines`, My leave, Approvals' LVE BAL, a
leave button's "left" and `leaveFiguresOf` all 9; §1.5 row 10 in June 2026: App 20, tile Pending 11, My leave 5, Approvals
DAYS 5, the grid's second line 21 — reading 24 in the name; a weekend-only bid: `ownDays` 0, `balanceAfterFill` 3 → −3,
`goesBelow` true, the ask "That takes Ranger to -3 LVE…"; CCL and OIL readers; every history line, its Undo line, the marks);
added `leavewar/demoworld-m5a.test.ts` (3 — the demo's grades and snapshots; the first boot saves `bal:` / `grade:` rows, a
reload reads them unchanged and lays nothing twice; Ranger App 15 incl. 2, Pending 2.5, War 12.5, CCL, PL, CL as drawn; a
shared store's first boot gets none). Rewritten: `ui/counters.test.tsx` (two), `ui/wars.test.tsx`, `ui/phonehead.test.tsx`
(the call), `ui/matrix-rows.test.tsx` (six recorded rows files re-recorded on purpose, dated note: only the box beside each
name changed — every top number the same; TATA's and JAGUAR's OL turn amber; RESET's and DUSK's 2027 days leave the 2026
view). Deleted: the `selectableFigure` test.

**The machine mark** (on `ELOG.rows`, by `logAction`): `sub` whose leave; `fld` 'deleted' | 'moved' | 'kind' ('withdrawn' is
M4's); `itype` the code after (for 'deleted', the code that went); `date` / `end`; `wdate` / `wend` for 'moved' (the days
left); `from` / `to` for 'kind'; `pid` who; `t` ms; `iid`, `days`, `wdays` on approved-leave and Input lines. Read:
`ELOG.rows.filter(r => r.sub === pid && ['deleted','moved','kind'].includes(r.fld) && String(r.pid) !== pid && r.t > lastSeen)`.
Carried by: a pending bid deleted by an admin ('deleted'), moved ('moved'), re-typed by an admin ('kind', one line — the old
code wrote "deleted"), re-typed in place by anyone but its member ('kind'); approved leave deleted / moved; an Input's type
change anywhere ('kind'). Documented above `cellParts` in `changelines.ts`. **The other lines** (`sect: 'abs'`, `sub: pid`):
"Leave War · Ranger · LVE balance" (`from` '18', `to` '20', `fld` 'balance', `itype` kind), first typing `to` only, "…LVE
carried fwd" (`fld` 'carried', only when cf changed), "…Grade" (`fld` 'grade'); under the day: "Balances locked / unlocked for
members", "Leave grades · <note>". The changes window draws "LVE balance 18 → 20 · Ranger".

**The row memo:** `PersonRow` reads `nameFigures` each render — cached (the store's `FIG_CACHE`; the period's days in a
WeakMap keyed on that object plus the range); `lines` is `useMemo`'d on `[war, used]`, so the memoised `FigureCell` draws
again only when that man's figures moved; `PersonRow` re-renders per version bump as before; the firewall and `PersonMonth`
untouched; nothing measured.

**The demo:** Ranger (`bane`) — LVE typed 17 incl. 4 on 5 Jan 26 (19–21 Jan in the snapshot), approved LL 19–21 and 26–27
Jan, pending 29 Jan AM and 12–13 Feb, refused 2 Feb; typed CCL 3, FCL 5, PL 2, EL 4, CL 1; pending CCL 2 Mar, PL 16 Mar AM,
CL 17 Mar. Everyone else but every seventh man — LVE typed 10 Jan 26, carried forward 0–4, some halves; Rocky (Hex) −2; every
third man and Dirty a CCL; the seed's approved leave to 10 Jan in each snapshot (JAGUAR's 16–17 Jan, DECAL's 5 Feb AM,
ROULETTE's 15 Jan CCL come off). Grades from 1 Jan 26: pilots Senior (instructors) / Junior pilot, WSOs Senior / Junior WSO,
ground Ops A; Casper (Outlaw) none. The lock off.

**Readings and leftovers:** Approvals' DAYS now charges each request on its own (ordinary cases identical; §1.5 row 10
reads 5, not 9); a single pilot bid of 15 days or more still charges its own weekends (the run rule within the request) — a
one-line change in `ownDays` if the plain rule should apply even then. Left in files not its own: `Matrix.tsx` ~L3980 — the
phone's frozen copy of the names still calls `figureLines(shown, figureCtx, p.id)` (the old balance — disagrees with the row
on a phone) → `nameLines(p.id, period)`; `figSel={null}` and `figureCtx` on `PersonRow`; `select.ts` still mentions
`data-figdrag`. Insights reads no leave balance; the day panel shows none; no export reads one.
