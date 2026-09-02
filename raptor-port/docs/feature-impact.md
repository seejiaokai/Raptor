# Feature impact — the components a change touches, and how work flows

The owner's standing ask (12 Aug 26): *"any addition or feature will affect
multiple components… always ask yourself if this implementation will affect
these components. And record how things flow generically, so we don't miss
things out."*

This file is that record. It is not a list of features — it is the **map you
check a feature against before you build it and again before you call it done.**
Two halves:

1. **The surfaces** — every place a change can show up, and what feeds it.
2. **The flows** — how a single edit travels from a keystroke to the screen,
   so you can trace where any change ripples.

Then a **checklist** to run per feature, and a **robustness** section naming
which joints are single-funnel (safe to build on) and which are drift-seams
(where two copies of one rule can fall out of step — the bugs that keep
recurring in this app).

**Keep this true in the same PR** (same rule as `HANDOFF.md`). A feature that
adds a surface, a flow, or a new drift-seam adds a line here. Stale is worse
than absent — the next session trusts it.

---

## 1. The surfaces — what a change can touch

Every feature should be walked against this list out loud: *does it touch
this one, and if so, is the touch wired or missing?* The owner named nine;
the rest are the ones the code actually has.

| Surface | What it is | Where it lives | Fed by |
|---|---|---|---|
| **Warnings** | The day's checks list, the puck rings, the board issue list | `validate.ts` → `WARN`/`REST`/`EVD`; drawn in `html.ts` (day warnings), `board.ts` (issue list), `highlights.ts` (rings) | every `validate()` run; re-read, never cached. Since 23 Aug 26 the run counter and Monday's crew rest also seed from the adjacent week via `engine/weekctx.ts` (Flow F), and a loaded week's Sunday that busts NEXT week's Monday draws a forward "Breaks Monday" trace box on Sunday itself (`validate.ts`'s `crewRestDay` phantom pass, `weekctx.ts:nextMondaySeed`, rendered by `html.ts:dayTraceHTML`) — a pointer only, `di:null`, no click target; the real breach warning still lands on Monday when next week loads. Since 29 Aug 26 a scheduler can MUTE one check from BOTH the board issue list and the edit week's day-issue list — the two share one `view.WARNOFF` set (keyed by warning content, `warnMuteKey`), so a hide on either surface hides on both and undo restores it from either; gated on `editMode()`/`canEditSched()` so View-only shows the full honest list |
| **Layout / geometry** | Row heights, column widths, board node count, overflow | `scheduler.css` (measured contracts), the string builders | gated by `e2e/geometry.spec.ts` + `perf-port.cjs` DOM ceilings |
| **History (edit log)** | The list is NAMED "Edit history" on every surface since 23 Aug 26 (was "Changes"), newest first; the board bubble; opened from the topbar's `#histBtn` as well as the board | `editlog.ts` (`ELOG`), `HistoryModal.tsx`, `histbubble.ts` | `markEdit`/`logEdit`/`logAction`, only when BOTH from/to values are passed |
| **Undo / redo** | Step back/forward through snapshots | `state/history.ts` (`HIST`, `histPush`/`histApply`) | every mutation batch pushes one snapshot |
| **Scheduler board** | The full-screen day board (desktop + phone); its bar carries search + the highlight fold since 23 Aug 26 (`#searchB`, `#sbHl`/`#sbHlStrip` — the same `HLSET`/`SEARCH` pair as the weeks, phone dots hidden to make the room) | `SchedBoard.tsx`, `board.ts`, `board-html.ts`; `hlchips.tsx` (the one chip definition) | global store lane + board-only view lane (`SBDAY`) |
| **Edit Schedule** | The editable seven-day week (`CURPAGE==='editsched'`) | `EditWeek.tsx`, `EditRoster` palette | writes go through the mutation funnel; gated by `editMode()` |
| **View-only Schedule** | The read-only week (`CURPAGE==='viewsched'`, the default) | `ViewWeek.tsx` | same builders, no write controls; `editMode()` is false |
| **Desktop mode** | Wide layout — must USE the width, not just stretch | `scheduler.css` (default rules, `min-width` / `>820px`) | CSS media queries; no separate "mode" state. Above 820px the week strip's own trailing space (past the last day) is filled by the **next-week PEEK preview** (23 Aug 26) — inert, read-only, planned-programme-only day columns off `ui/peek.ts`, replacing the old JS-sized `--week-tail` spacer (`pan.ts:setWeekTail`); clicking a preview day loads that week, landing the day at the same screen x. Phone untouched — `peekKey()` returns `''` at ≤820px. **Sits outside the perf DOM-ceiling gate**: `npm run perf` (`probes/perf-port.cjs`) measures every surface at a fixed 390px phone viewport, so the preview's real nodes never mount inside it and are not counted toward the week ceiling — `peek.ts` still holds itself to the SAME rebuild-only-on-key-change discipline the gate's own perf1-B check asks of the live week (rebuild only on desktop-ness × CURWEEK, never on an ordinary repaint), it is just not gated on it |
| **Mobile mode** | Phone layout — top-to-bottom, reachable, one board window | `scheduler.css` `@media (max-width:820px)` / `480px`; `boardnav` | CSS + the phone board's arrows/dots; `sbWide` module-local |
| **Qualifications** | The Quals grid; the qual ladder the validator reads | `QualsPage.tsx`; `people.ts` (`p.quals`, qual rules in `validate.ts`) | ticks are session-only; drive `QUAL`/`SC_QUAL`/`AAR_*` checks |
| **Personal inputs** | Leave / medical / activity records | `INPUTS` in `inputs.ts`; `inputedit.tsx`; `InputsPage.tsx` | `INPUT_META` (the one table) decides every predicate |
| **Inputs month calendar** | The Inputs page's full-screen month view: the day TITLE + note/pucks sections drawn cell-first, inputs as side-by-side tone chips (SANS as its F/O/A letters, on the cell chip AND the popover row), hold-to-add, chip drag between days, the redesigned day popover (title beside the date sized to it, +Note/+Pucks full-width sections with admin drag-reorder, inputs at the bottom); the **multi-select puck picker** (category-highlight buttons via `personMatchesCat`, batch `addPuckRow(iso,ids)`/`addPuckPeople`) and three-way puck removal (✕ / right-click / drag-out) — `ui-contracts.md` §The Inputs month calendar | `InputsCal.tsx`, `caldrag.ts`, `hlchips.tsx` (`HL_CATS`), `state/plan.ts` (`PLANPUCKS`/`DAYRMK`, session-only, undo-snapshotted) | `dayEntries` reads `inputCoversDate` + the page's OWN filters (one filter logic, copied — see §4); **`inputTone` (`inputedit.tsx`) is the ONE colour source** for its chips AND the table's row stripes; **`personMatchesCat` (`state/view.ts`) is the ONE category predicate** behind both the highlight chips and the picker; chip drag writes through `commitInputEdit`, pucks/remarks/picker through `writeInputs(plan.ts mutators)` |
| **Availability / palette** | Who the crew strip offers, who is struck out, the armed reason lines, the green eligibility rings, the folded Available-crew and Personal-Inputs panels | `avail.ts` (`slotBar`, `dayOff`), `palette-html.ts`, `highlights.ts` (`paintSelRings`), `html.ts` (`availHTML` + `AVOPEN`; the Personal-Inputs fold `PIOPEN`) | `isAway`/`inputCoversDate`/`inpWin` — MUST agree with the warning list; the rings read `slotBar` itself, never a copy. `slotBar`'s busy-check now also names an unaccepted ACTIVITY commitment (`isPersonal` + the validator's own per-day `inpShow`, four midnight tails) — same drift-with-`INPUT_FLY` rule, and it reads the SAME gate the validator does so the two cannot diverge by a day |
| **Post-render decoration** | Selection/search/warning classes, the armed ring, the green eligibility rings, and the ~6s just-added blue box | `highlights.ts` (`refreshHighlights` → `paintArm`/`paintSelRings`/`paintFreshAdds`) | hung AFTER the string diff, off view state (`SELID`/`ARM`/`FRESHADD`), never baked into the builder string — so a class survives an unrelated repaint; a new one adds a paint function here, never a class in the markup |
| **Publishing / AL** | Sign-off, amendments after a day is signed | `publish.ts`, `ALPanel.tsx` | inert amendment keys through the mutation funnel |
| **Day templates / Drafts** | Whole-day master templates; per-day alternate schedules, one of which is always the live day | `engine/daytpl.ts`, `engine/drafts.ts`; `DayTplModal.tsx`, `DraftsModal.tsx`; the board's + week's Templates/Drafts buttons (`board.ts`'s `dayTplMenu`/`draftsMenu`) | direct-write to `DAYS[di]`, one undo step via the caller's `afterSchedMutate()` — the `restoreDayVersion` shape, not the ordinary funnel. Templates refuse a published day; drafts DON'T (15 Aug 26) — a switch there rebases the day's pending set against the issued snapshot (`rebaseDayPending`, engine-rules §Drafts) |
| **Duty & wave templates** | Saved duty blocks (`+ Block`) and saved flying waves (`+ Wave`), each a persisted-config library like the stores list | `engine/dutytpl.ts`, `engine/wavetpl.ts`; `DutyTplModal.tsx`, `WaveTplModal.tsx`; the pickers (`board.ts`'s `blockMenu`/`waveMenu`) and Admin → Squadron config (the wave-template CONTENT editor); `+ Wave` show/hide + template delete via its Manage sheet (`WAVEHIDE` / `ui/WaveManageSheet.tsx`) | placing COPIES the template's rows/lines onto the day (`blockFromTpl`/`waveFromTpl` → structural add through the funnel); the minted item's own flags drive checking, so `validate.ts` never reads a template. A STANDBY-kind template mints the built-in's SHAPE (26 Aug 26): consecutive lines naming the same shift (cs + msn + times) become ONE formation with a crew row per line, exactly like `makeStandalone` — so the day badge and every per-formation reader treat a template SC like + Wave → SC (a fly line stays one formation per line). Wave show/hide (`WAVEHIDE`) and template DELETE moved off Admin into the `+ Wave` menu's own Manage sheet (`ui/WaveManageSheet.tsx`, `WAVEMANAGE`, 29 Aug 26 pt.3 — the ⚙ button / "N hidden · Manage" line); show/hide only filters the picker — it changes no schedule. Same admin-only gate as the removed Admin `WaveVisibility` list. Two 26 Aug 26 guards: a fly wave KEEPS the template title as its label and the board's Go dropdown passes any non-"WAVE N" label through verbatim both ways (`board-html.ts labelToTitle`/`titleToLabel` — an any-digit match used to read "BFM 4-ship" as the 4th wave and a re-pick rewrote the label); and the editor's Clear-all wipes only the library's half of `WAVEHIDE` — the built-in kind flags are the squadron's own curation (`waveTplReset`) |
| **Export (CSV + PDF)** | Schedule, inputs and LoX downloads; the schedule's print-to-PDF export (23 Aug 26) | `export.ts` (`csvText`, `exportCSV`, `schedRows`); `printpdf.ts` (`printSchedPDF` — a print window over the same `schedRows` data); `InputsPage.tsx` | reads the model directly; formula-injection escaped at the sink; the PDF path escapes at its own sink too |
| **Roles / auth** | Admin vs member vs view-only; who may write; the Admin page (23 Aug 26 — Manage users, the template openers, the persistence honesty card) | `auth.ts`, `state/session.test.ts`; `AdminPage.tsx` (`#admDeny` is the page gate's forced-member render) | checked at the PAGE and the WRITE path, never the nav |
| **Leave War tab** | The vendored leave-bidding calendar — its own store, storage (`leavewar:` keys) and CSS (scoped `#page-leavewar`) | `src/leavewar/` (page seam: `LeaveWarPage.tsx`); boots once in `main.tsx`; role written only by `resetSession` + the admin's `toggleRole` (both write the session's EFFECTIVE role; **advancing the cycle stage is admin-only since 27 Aug 26** — `store.ts:advanceStage` refuses a member and `Chrome.tsx` hides the control; members otherwise bid exactly as before) | **the sync wires are LIVE (17 Aug 26)**: its roster is a boot projection of `PEOPLE`, approved LW leave lands in `INPUTS` as lw-tagged rows (so the Unavailable block, availability, warnings and the palette all move when a bid is approved), and leave filed on the Inputs page lands as Raptor-owned LW cells (so LW balances draw down). **Medical rides the same wires (17 Aug 26)**: an ATT B / ATT C / HL / OML input lands as a raptor-owned LW cell (AM/PM exact; a custom window ≤6h reads as a half day — `medRowPortion`, NOT leave's round-OUT rule) and an admin-marked LW medical cell lands as an lw-tagged input with no approval step. A change to Raptor's INPUT_META leave OR medical types, half-day boundaries, roster fields (seat/q/sxo), or the INPUTS write epilogue is a DRIFT-SEAM against `src/leavewar/sync.ts` — walk it. **The roster is a LIVE, CATEGORISED projection (18 Aug 26)**: `sync.ts:reprojectRoster` re-projects `PEOPLE` on every Raptor notify (so a Quals-page add appears without reload), and `engine/people.ts:groupOf`/`catClass` group and colour the grid by SXO / CAT / OCU / ground crew — so a change to Raptor's **CAT ladder (`QORDER`/`QCOLOR`/`isInstr`), the `--q-*` colour tokens, the `pers`/`GND`/`flight` ground-crew shape, or `sxo`** is a drift-seam against `state/raptorRoster.ts` + `engine/people.ts` (the colours are duplicated from `scheduler.css --q-*` into `matrix.css`, kept in lockstep by eye). Ground crew ride the roster but MUST stay out of manning: `engine/availability.ts:countsFor` skips `pers` first — a change there that dropped the skip would silently corrupt every threshold. The same wire mirrors Raptor's "View as" person (`ME`) into Leave War's `viewer` (row highlight + the counter picker's "yours" numbers), so a change to `setMe`/ME semantics reaches Leave War too. **Publishing reaches Leave War too (wire 4, 17 Aug 26; REWORKED 28 Aug 26)**: publishing/reopening/re-issuing a weekend or LW-holiday day moves raptor-owned FO/HO cells (FS/HS before the 28 Aug 26 rename) and the OIL balance there (`runOilPass` derives from the issued snapshot; since the rework the rule is ONE ≤6h/>6h test on the day's start-to-finish ENVELOPE — gaps included, 29 Aug 26 — across SC MAIN, flying seats via report→debrief, sims, duties, ground and Common-Programme rows, the SC shift-window rule deleted; and since 29 Aug 26 the schedule half reads EVERY visited week via the session stash, not just the loaded one), so a change to `setDayApproved`, the snapshot machinery, SC wave shapes, flying/sim/duty/ground/allhands written times, `VCONF.reportLead`/`VCONF.debrief`, or `VCONF.oilFullMin` is the same class of seam — `engine/oil.ts` + `docs/engine-rules.md` §Weekend/PH work earns OIL. **An acknowledged Duty-&-commitments input credits OIL WITHOUT publish (28 Aug 26)**: input saved → `oilGate` (`ui/inputedit.tsx`, all three editors) → the OilConfirm sheet → `row.oil` day decisions (one `writeInputsBatch` with the save) → `desiredOilCells`' input pass pools them with the published schedule → FO/HO cell; an unanswered applicable day instead lights the bell (`oilPendingFor` → the Shell tap → InputEditor + the OIL sheet via `pops.OILASK`) — so a change to `oilAsks`' type set, `row.oil`'s shape, or the OilConfirm gate sites is a drift-seam against `leavewar/sync.ts` (`oilAskPlan`/`desiredOilCells`/`oilPendingFor` all read the one exported `isNonWorkingISO`). **Edits/deletes flow BACK (17 Aug 26, full two-way; refined 18 Aug 26)**: `commitInputEdit`/`removeInput` on an lw-tagged row retract its war cells (`sync.ts:retractLwRow` → `withdrawLeaveCell`) and an edit THAT CHANGES THE LEAVE drops the `lw` tag so the row re-lands Raptor-owned — but a REMARKS-ONLY edit keeps the tag (`commitInputEdit` compares `sync.ts:rowSig` before/after; unchanged signature = same leave, so Leave War keeps it). A change to either write path, to the lw tag's meaning, to `rowSig`'s field set, or to the cell notation (`*CODE`/`CODE*`) must keep the retraction's exact-notation match and the signature comparison in step. **The synced-leave remark is the shared date tail (18 Aug 26)**: `sync.ts` mints `engine/inputs.ts:withRemarksTail(prior, start, end, 'on')` and the Inputs-page `withTill` (`ui/InputsPage.tsx`) calls the same helper with `'none'` — a change to the tail's wording/format is now ONE seam, not two, but the `single` argument's split (calendar suppresses a one-day tail to avoid a mid-pick flash; a settled synced leave shows "on 15 Jul") must be preserved. `withRemarksTail` rewrites the `till/on <date>` token WHEREVER it sits so a member's note before OR after it survives the date moving. **New input type `Duty` (18 Aug 26)** is grp:'act' — it behaves like Appointment in every derived predicate BY CONSTRUCTION (`isPersonal`/`canSpare`/`isUnavail`/…), so it does NOT sync to Leave War (only leave/medical do); nothing special-cases it, which is the point — a future grp change to it would silently move it. **Roster within-group order** is `engine/people.ts:CAT_RANK` (most-qualified first: FI, IR, IP, IW, A→D, OCU) — a display-only sort, `manning`/`categoryOf` untouched. **FL P / WM P manning rows (18 Aug 26)** split the pilots by CAT (`engine/people.ts:pilotLead` → availability.ts `flp`/`wmp` → seed rules, display-only at amber 0/red 0) — the ONE manning path that reads the CAT (`q`), so a change to the Raptor CAT projection or the FL/WM cat sets moves these two counts (a deliberate exception to "manning never reads q"). **The manning count rows are admin-arrangeable/hideable (18 Aug 26)**: `store.ts` `manningOrder`/`manningHidden` (persisted `manningorder`/`manninghidden`, admin-gated `moveManningRow`/`toggleManningRow`/`resetManning`), rendered by `ui/CountRows.tsx` under the same Rearrange toggle as the roster — display-only, the requirement rules and thresholds untouched. **The thresholds ARE squadron-editable since 19 Aug 26** (tap a row's name → `ui/ManningSheet.tsx`; `store.ts` `manningThresh` overlay, persisted `manningthresh`, admin-gated `setManningThreshold`/`resetManningThreshold` — numbers only, rule definitions stay code-owned), so "display-only at amber 0/red 0" is a default, not a law. **SC D / SC N team rows (19 Aug 26)**: `availability.ts:scTeams` counts complete six-body teams (2 SC pilots + 2 SC WSOs + 1 SXO + 1 crew) off `Person.scd`/`scn`, which the projection reads from Raptor's **`quals.scDay`/`quals.scNight`** — a SECOND deliberate qual read beside `q`, so a change to those Quals flags' names or semantics is a drift-seam against `state/raptorRoster.ts` + `reprojectRoster`'s signature; duty-standers count as PRESENT for these two rows only. **Post-out (PO, 18 Aug 26; reworked 19 Aug 26)**: `store.ts:setPostOut(id, fromDate|null, archive)` sets a person's posting-out date (`to = fromDate − 1`, ANY real date) plus the explicit `Person.poArchive` flag; the grey `.gone` hatch and the manning exclusion key off `to` as before. An admin taps a day (BidPicker's folded PO controls) to place it and a struck day (`PostOutSheet`) to move/flip/undo it; the last day in wears the `.polast` tag. **This is now a CROSS-APP FLOW**: `sync.ts:runPoArchive` archives the Raptor body when the date arrives (`poArchive === true` only — a seeded/demo `to` carries no flag and is never read as consent), the Quals page's Archived drawer restores through `sync.ts:restoreArchivedPerson` (clears the LW posting FIRST or the next pass re-archives), and `reprojectRoster` KEEPS an archived body that has a posting window. A change to `archived`'s meaning, to the projection's exclusions, or to the restore order is a drift-seam against all three. **The matrix roster is month-windowed (19 Aug 26)**: `Matrix.tsx` hides rows whose `[from,to]` miss every visible month, re-rendering only on row-SET changes and anchor-compensating `scrollLeft` after each (auto table layout re-narrows columns a removed row widened — the month-jump maths lands short without the correction; the phone mirror re-measures on the same signal). A change to row rendering, column sizing, or `jumpTo` must keep that anchor correction honest. **Event rows are variable-count (18 Aug 26)**: `DayInfo.events` is `string[]` and `EventBand.line` a plain index; `store.ts` `eventRows` (persisted `eventrows`, admin `addEventRow`/`removeEventRow`, cap `MAX_EVENT_ROWS`) drives how many `ui/EventRows.tsx` draws — a change to the event tuple/line shape, `columnKindFor` (now scans every line), or the read/write of `events` must keep the variable length; `dayEvent(day, line)` is the one bounds-checked reader. **Event tags are per-instance (18 Aug 26)**: `DayInfo.eventKinds[line]` / `EventBand.kind` override the type-library word match everywhere (`columnKindFor`, the red work word, wire 4's holiday answer — an instance 'off' tag makes a worked day earn OIL exactly as a library word does), so a change to classification must keep the instance-first precedence; the library changes only via Edit types. **The page is KEPT MOUNTED behind a memo firewall since 1 Sep 26** (`LeaveWarPage.tsx LwBody` + the Shell's `.doze` section — ui-contracts §The Leave War tab is kept alive): a Raptor notify no longer re-renders the LW tree at all, so ANY fact the LW UI renders MUST cross the seam through the LW store's own notify — rendering Raptor module state directly inside `src/leavewar/ui/` would sit stale behind the memo, a new drift-seam class to walk when adding a wire **The OIL TRACKER (2 Sep 26)** is a new surface inside the tab (`ui/OilTracker.tsx`, toolbar button `oil-tracker` for both roles + the Cinch sheet's OIL BAL row): it is DERIVED (`engine/oiltracker.ts` — FIFO oldest-credit-first, expiry per the admin's `oilPolicy`, persisted `oilpolicy`) and its admin writers are the first ledger writers (`grantOil`/`updateLedgerEntry`/`removeLedgerEntry`) plus `setOilPolicy` and `setBalance` (LVE BAL). Drift seams: `OIL BAL` everywhere now reads the tracker's balance through `store.ts:figureCtxOf()` — the column, picker, breakdown, Cinch row, tracker and the bid-time `wouldLeave` warning; a new figure surface must take its ctx from there. Earned FO/HO days stay grid cells (never ledger rows). `OFF USED` figure removed the same day. **Second cut the same day**: the tracker is a full-screen GRID (`Sheet full`, year lanes, one credit box per credit with its FIFO takes inside, `select.ts:wireRowSelect` on the shared `wireGesture` core — a change to the grid's drag feel constants now moves the tracker too); an earned credit's REASON is the FO/HO cell's `BidRecord.note` written by `ingestDutyCredit(…, why)` from `engine/oil.ts:dayOilWork`'s per-span kind (`FLT`/`SIM`/`Duty`, an input's type name) — so a change to which schedule rows count, or to their kind, is a seam against `oiltracker.ts`' reason line; `LedgerEntry.givenBy` (optional) rides `grantOil`/`updateLedgerEntry`; an admin's manual OIL/FO/HO write on the grid opens the tracker (`Matrix.tsx onWrote`). **Third cut**: a dead credit folds into the ARCHIVE column — a DISPLAY switch in the tracker, never a store fact, so nothing else reads it; `store.ts:installDemoOil` is a second boot-only writer beside `remapPersonKeys` (same contract — never for tests, never persisted, called before the re-key). **OFF is no longer a leave code (2 Sep 26)**: gone from `codes.ts`, `INPUT_META` and LVE USED; the management **Off day** is the `free` EVENT KIND (`eventdefs.ts`, grey `evfree` column, earns NO OIL — `isNonWorkingISO` reads only `off`), so a change to event kinds must keep `free` out of the OIL non-working test. |

Two things are NOT on this list because the app does not have them yet, and a
feature that seems to need them is a bigger change than it looks: **shared /
persisted data** (localStorage only — two devices never see each other) and
**a real per-person identity** (`HOOKS.whoami()` reads a hard-coded login, so
history names an ACCOUNT, not a person). Both are the same server-shaped hole;
`HANDOFF.md`'s first bullets carry it.

---

## 2. The flows — how one edit travels

The owner's example, in his words: *"when an input is made or changed, it goes
to the right area like unavailable, then through a warning check, then if an
edit can be made it changes the input and updates the history."* That is Flow B
below. Here are the flows that actually run, each ending at the surfaces it
repaints.

### Flow A — a schedule cell edit (a puck, a time, a note)
```
gesture (drag / type)
  → the mutation funnel: slotVal / setSlotVal / fillSlot / txtGet / txtSet
      (BYPASSING this funnel is always a bug — see Architecture rules in CLAUDE.md)
  → noteChange(key)              marks the cell pending for the next AL
  → afterSchedMutate()
      → validate()               reassigns WARN / REST / EVD  → WARNINGS repaint
      → histPush()               one undo snapshot            → UNDO/REDO
      → markEdit() / logEdit()   only with both values        → HISTORY (edit log)
  → notify()                     bumps the store version      → WEEK + BOARD repaint
                                                              → HIGHLIGHTS re-decorate
  → if the day is PUBLISHED: the pending key reaches the next AL → PUBLISHING/AL
```
Deletes renumber the live key space FIRST, then drop an inert `del:` tombstone
(`markDeletion`) — see `docs/engine-rules.md` §Key renumbering. Reorders
(`engine/reorder.ts`) remap the key space too, then record the move: on a
published day a move of an ISSUED row drops an inert `mov:` tombstone
(`markMove`, gated on `dayApproved` && not `SCHED.added`) that `reconcileIssuedMarks`
skips by name, so a move of two same-valued rows is no longer value-reconciled
away; a draft-day move, or a move of a still-draft added row, keeps the ordinary
field mark — see `docs/engine-rules.md` §Publishing.

### Flow B — a personal input added or edited (the owner's example)
```
add form / row editor / week cell / board cell / board panel adds
                                                 (three editors + the board's
                                                  context-bound adds, ONE list)
  → commitInputEdit / setInpField / removeInput / commitNewInput
                                                  (all in inputedit.tsx —
                                                   commitNewInput's toGround
                                                   also runs acceptInput in
                                                   the same batch, the Ground
                                                   Programme's + Inputs)
  → writeInputsBatch()                            one undo step, re-validates
      → the record lands in INPUTS; which BLOCK it draws in is decided by
        isUnavail (leave/medical/OD) vs isPersonal (activities) — presentational
      → validate()          every input now counts   → WARNINGS
      → availability: isAway / inpWin / inputCoversDate
                            → PALETTE strikes / offers the man
      → histPush + markEdit                            → UNDO + HISTORY
  → an ACTIVITY input auto-lands on the day: autoAcceptInput() promotes it to a
    Ground row on an editable day (`slots.ts`; every creation path + the boot
    pass call it; published days and leave/medical are no-ops)         → BOARD/WEEK
  → or a scheduler ACCEPTS/UNDOES it by hand: acceptInput()/unacceptInput()
    (`acceptedDay`, inert amendment keys — the round-trip is unchanged)  → BOARD/WEEK
```
The trap this flow exists to prevent: the **palette and the warning list read
the same input two different ways.** They must never disagree — a man struck
out of the palette but raising no warning when planted anyway is the exact bug
`inpWin`/`awayAllDay` were made to fail-closed against. Any change to how an
input is read gets checked on BOTH. **The picker closed the OTHER half of this
seam for activity inputs (Aug 26)**: `slotBar` was silent about an unaccepted
Meeting/Appointment while `validate()` raised `INPUT_FLY` on a plant, so the
busy-at-this-hour block now scans `INPUTS` for the non-away activity types with
the SAME `canWork`/flying gate and four midnight tails the off-blocks use. The
gate that decides whether an input still "counts" here is the validator's OWN
per-day `inpShow` (exported from `events.ts`), NOT a second copy — the day-blind
`inputFlags` it first used let a multi-day or orphaned accept silence the picker
on a day the validator still warned (Aug 26 audit). One shared gate now, so a
change to `inpShow` moves both readers together; a scan that reads the input any
OTHER way is a new drift-seam.
**The Admin bulk sweep rides this same flow (25 Aug 26)**: `clearHistoryBefore`
(`inputedit.tsx`, the Admin → Data "clear old data" button) removes every input
wholly before a date through the SAME `dropInputRow` body a single delete uses
(LW retract → unaccept → splice), in ONE `writeInputsBatch`, plus the planning
layer (`PLANPUCKS`/`DAYRMK`) and stashed past weeks (`stashDrop`). A change to
the single-delete semantics changes the sweep for free — that is the point; a
second removal body would be the drift-seam this line exists to forbid.
**The SC MAIN per-type grading is ONE seam spanning five files (26 Aug 26)**:
the `shiftHard` flag on `INPUT_META` (`engine/inputs.ts`) is the single source
— `shiftHardInput` (the raw-input gate in `validate.ts`), `shiftHardLabel`
(the hand-typed ground-row keyword regex, DERIVED from the same flags),
`events.ts:shiftEvHard` (the ground-row upgrade the validator's clash loop AND
`avail.ts`'s picker `live` both read), the Logic-tab prose
(`ui/logic-html.ts`, list derived via `INPUT_TYPES.filter(shiftHardInput)`),
and the reference rewrites (`testing/refwin.ts` `reinput`/`reshift`, the ONE
place the doctrine is restated as literal regexes, because the reference
cannot import: `reshift` carries the red-list keyword literal, and `reinput`
carries the AMBER complement — the MEETING literal, since 26 Aug 26 when the
default for anything off the list flipped to HARD, fail closed: an
unrecognised type now grades hard against a shift in both engines, the same
as it always did against a sortie). Adding a red type is the flag plus
`reshift`'s literal; moving a type to the amber side is the flag plus
`reinput`'s soft literal — anything else reading its own list is a new seam.
The cross-engine pin for the fail-closed default is in `parity.test.ts`.
Shift lines are excluded from the sortie "clashes with" loop (`e.shift`
guard, both engines): the graded events loop is a shift's one voice.
**A removed input's dormancy is its own one-body seam (26 Aug 26)**:
`inputDormant` (`engine/inputs.ts` — acc `'r'`, written only by
`unacceptInput`) is read by `inputFlags` (validator gate + refwin's reference
seed filter), `inpShow` (`events.ts` — day.input, tails, and through it the
picker), `weekctx.ts:workedSet` (cross-week run-in), `isAway`'s Fly leg, and
the UI's `accCtl`/`accd` reads (`'r'` renders as un-accepted). Its writers'
counterparts: `acceptInput` admits `'r'` back, `autoAcceptInput` refuses it,
`loadWeek`'s acc-clear preserves it, `commitInputEdit` clears a stray one on
a failed relink. A new consumer of "is this input live?" reads
`inputDormant`, never `acc` directly.
**A Duty-&-commitments save can carry an OIL question (28 Aug 26)**: before
the write, all three editors run ONE gate — `oilGate` (`inputedit.tsx`),
called from `InputEditor.save()`, `InputsPage.add()` and
`InputsPage.saveEdit()` — and a span covering a weekend/PH opens the
OilConfirm sheet. The flow: input saved → oilGate/OilConfirm → `row.oil`
day decisions (in the SAME `writeInputsBatch` as the save — one undo step)
→ `desiredOilCells`' input pass (`leavewar/sync.ts`) → FO/HO cell in the
war → and, for any applicable day left unanswered, the bell
(`oilPendingFor` → InputEditor with the sheet up, `pops.OILASK`). A fourth
save path that skipped `oilGate` would credit silently or never — the gate
is part of this flow's funnel now, exactly as `writeInputsBatch` is. **A
recorded answer is revisable in place (29 Aug 26)**: the InputEditor's
"OIL … Change…" row and the Inputs-page row's `.roil` chip (visibility:
`oilAnswered`) re-open the same sheet over every applicable day and Save
replaces `row.oil` wholesale — the editor path through the same gated
`doSave` batch, the chip path a bare `writeInputsBatch` oil rewrite.

### Flow C — day navigation on the phone board (view-only, no mutation)
```
arrow / dot scrub  → boardDayStep(±1)  → SBDAY changes
  → the BOARD-ONLY notification lane repaints just the board
  → it must NOT validate and must NOT wake the mounted EditWeek/EditRoster
```
`boardTab` is view-only by contract. A "navigation" feature that quietly
validates or writes has crossed from Flow C into Flow A and needs its guards.
**Continuous across weeks (22 Aug 26):** at the week's ends `boardDayStep`
instead crosses into Flow E — `loadWeek(shiftWeek(±1))` then `boardTab(0|6)` —
so an END step IS a full week load (global lane + validate), while a within-week
step stays the view-only board lane. The board's `#sbCal` calendar icon is a
Flow E entry point too (loads the tapped day's week, then opens that day).

### Flow D — publish / amendment / load-a-version
```
sign off a day          → setDayApproved / SCHED
edit a signed day       → the pending keys become an AL issue (alIssue)
edit back to issued     → reconcileIssuedMarks (afterSchedMutate) drops the now-matching pending key
                          (skips inert del:/mov:/inp: keys by name — a reorder's mov: tombstone survives)
load a version onto WC   → loadVersionToWorkingCopy (16 Aug 26; NOT a rollback — leaves SCHED.cur, so
                            viewers keep the issued AL; rebases pending vs issued, like a draft switch)
apply a day template     → applyDayTpl          (same direct-write + refuse-on-published shape)
duplicate / switch a draft → draftDup / draftSelect (same shape; the live day IS the selected draft;
                            on a PUBLISHED day the switch ends in rebaseDayPending — the diff vs
                            the issued snapshot becomes the pending set the next AL issues)
roll a day back          → restoreDayVersion   (OLD instant-rollback; probe-bridge only, no app caller)
```
Previews freeze schedule content but read live personal-inputs and day-info —
a known limitation, `docs/engine-rules.md` §Version snapshots. Day templates
and drafts inherit the same limitation for the same reason — both preview
through `daySnapOf`/`withDaySnap`, never a second path. The view page's
issued DEFAULT for a published day (`dayIssuedHTML`, 15 Aug 26) is the same
freeze again in quiet mode — one more consumer, still no second path.

### Flow E — load a week (the week selector, 21 Aug 26; reworked 22 Aug 26;
per-week session stash added 23 Aug 26)
```
a rolling week button (weekWindow, weeknav.ts) OR a WeekCal day tap OR a
  continuous board arrow / edge-swipe  → store.ts:loadWeek(v)
loadWeek           → stashPut(CURWEEK, weekStashSnap()) (weekstash.ts — the
                       OUTGOING week's DAYS + SCHED fields + WARNOFF, before
                       anything about it moves)
                   → setCurWeek(v) → applyWeekModel(v):
                       stashHas(v)? restore DAYS/SCHED IN PLACE from its stash
                       : weekBundle(v) (engine/weeks-data.ts, a fresh deep copy)
                       → DATES always from weekBundle(v).dates (pure labels)
                   → swap DAYS / DATES IN PLACE (live bindings); INPUTS is GLOBAL, NOT swapped
                   → clear every input's `acc` → reconcileLandedAcc() (re-derives
                       `acc` for rows a restore's DAYS already landed, so the
                       pass below does not try to re-add them) → mintInpIds()
                   → stashed? re-run `autoAcceptInput` per row with
                       pending/changes/added protected, SKIPPING any row this
                       week deliberately unaccepted (the stash's `un` set of
                       content keys — else the blanket re-land silently undoes
                       a scheduler's removal, 24 Aug 26) : autoAcceptSeedInputs()
                       (both land date-matching inputs on the fresh/restored days)
                   → clear day-index/iid VIEW state; WARNOFF restored from the
                       stash instead of cleared, when there is one
                   → validate() → histInit() → notify()
```
`DAYS` and `DATES` swap with the week. **`INPUTS` is GLOBAL since 22 Aug 26**
(owner — "show all inputs regardless of which week I am selected on"): it is
merged once at boot (`store.ts:initStore` + `weeks-data.ts:otherWeekInputs`) and
NOT swapped, so every week's inputs stay present for the Inputs page; each week's
SCHEDULE still shows only its own because the day builders and auto-land match by
date — by date VALUE, through each row's `yr` anchor year (`inputCoversDate` /
`dateIx`; 24 Aug 26 — bare-string matching used to land a 2026 input on the
identically-worded day of any other year, see `docs/engine-rules.md` §Every
input is anchored to a real year). `acc` is always cleared first (it
records the LOADED week's landing only) so `autoAcceptSeedInputs`/the restore
pass can re-derive it fresh for whichever DAYS this call just put in place. But
because `INPUTS` is not stashed, a row a scheduler UNACCEPTED on this week would
be re-landed by that pass on the way back in; the stash therefore also carries
`un` — the content keys (`inpKey`) of this week's personal rows that are sitting
UNLANDED on an editable day — and the restore's `autoAcceptInput` loop skips
them, so a deliberate removal survives a week round-trip while a genuinely new
input (never in `un`) still lands (`store.ts:unacceptedKeys`; 24 Aug 26).
`SCHED` is keyed by day INDEX; on a fresh (never-stashed) week `resetSched()` is
still what stops one week's approvals/AL bleeding onto another's identical
indices, and on a restored week the stash's own SCHED fields serve the same
role (they were THIS week's, saved on the way out). History re-baselines either
way so Undo can't cross a week.
**PER-WEEK SESSION STASH (23 Aug 26 — the fix for a reported bug: a duty added
on an unauthored week's Sunday vanished after scrolling a week forward and
back, and the crew-rest flag it should have raised on the next Monday never
appeared because Flow F's cross-week seed reads only ever saw the un-edited
seed).** `engine/weekstash.ts` remembers, per week-start key, the last
snapshot `loadWeek` handed it on the way OUT of that week (`state/store.ts`'s
`weekStashSnap`, sharing its eleven-field SCHED list with
`state/history.ts:schedFields` — the whole-history undo snapshot — so the two
serializers cannot drift; INPUTS/PLANPUCKS/DAYRMK are deliberately excluded,
being global) and hands a fresh copy back on the way in, restored the same
in-place technique `history.ts:histApply` uses for Undo. It is session-only on
purpose (owner, 23 Aug 26 — forget-on-exit stays the whole app's rule, in
lockstep with `INPUTS` and the Leave War): no localStorage, one synchronous
stash on the way out of a week, and a stash entry that fails to parse is
silently dropped (`stashDays` returns null and the read degrades to the pure
seed — it runs inside `validate()`, which runs on every keystroke). Flow F's `weekctx.ts:bundle()` reads through
the stash for free — `stashHas` is checked before its own seed-bundle cache
on every call — so a session edit on one week is now visible to the NEXT
week's cross-week validation exactly like an authored seed would be.
Session/page/role are untouched — this is a data swap, not a login. Nothing runs
at module load, so `DAYS` still initialises to the seed week (parity/e2e's
"seven days" hold until a user clicks a chip). Per-week publish state is NOT
persisted — the persistent multi-week end-state is server work, and `resetSched`
+ the `weekBundle` registry are its hook points. **The selector is now a rolling
window + a calendar, and navigation is continuous (22 Aug 26):** the desktop segs
draw `weekWindow(CURWEEK)` (prev·current·+1·+2, re-centring), the `WeekCal` month
picker jumps to any week, and the phone view/edit carousel crosses weeks by SWIPE
(`pan.ts` edge-overswipe → `loadWeek`, landing the scroll via `view.WEEKJUMP` in
the ViewWeek/EditWeek repaint). **That phone cross GLIDES (23 Aug 26):** the
WEEKJUMP branch calls `weekglide.ts:beginGlide`, which clones the outgoing week
and slides it off while the new one slides in — a phone-only visual layer over the
same `loadWeek`+WEEKJUMP flow, no new data path. Desktop arrow crosses stay
instant, and a within-week swipe never glides. **All week label/Monday math is one drift-seam in
`ui/weeknav.ts`** (`mondayOf`/`shiftWeek`/`weekWindow`/`dayIndexInWeek`); any date
that names a week or steps one must go through it, not a second literal. Every
`data-wk` value is still an arbitrary `dd/mm/yyyy` Monday, so the shared
`interactions.ts` handler is unchanged — the engine builds any week already.
**A DESKTOP-ONLY entry into this same flow (23 Aug 26): clicking a day in the
next-week PEEK preview** (`ui/peek.ts`, filling the week strip's trailing
space past 820px — see §1 Desktop mode) **is ALSO `loadWeek`, not a special
case.** `interactions.ts` reads `.day.peek`'s `data-peek-day` first (it runs
ahead of every other click branch, since a peek day carries none of their
attributes to fall through to), records the clicked screen position as
`view.PEEKLAND`, and calls `loadWeek(shiftWeek(CURWEEK,1))` — the ordinary
switch above, unmodified. ViewWeek/EditWeek read `PEEKLAND` the same way they
already read `WEEKJUMP`/`CARRYDAY`/`DPREV` (one more entry in that same
priority chain) to land the now-real day at the exact x it was clicked, then
clear it. The preview itself never mutates anything it shows — it reads
`stashDays`/`weekBundle` for NEXT week the same way Flow F's seed reads do,
formats with its own small pure renderers (`peekPuck`/`peekRow`, deliberately
not `html.ts`'s `puck`/`plRow` — see §4's drift-seam entry), and is rebuilt
only when `CURWEEK` or next week's stash generation changes (`peekKey()`),
never on an ordinary repaint.

### Flow F — `validate()` reads across the week line (23 Aug 26)
```
validate() (fired by any Flow A/E trigger, on the LOADED week only)
  → RUNLEN pre-pass: weekctx.ts:seedRunIn(CURWEEK, VCONF.maxRun)
      → weekBundle(prevWeek[, prevWeek-2 if maxRun>7]) + global INPUTS
        (pure reads — no live DAYS for the prior week, nothing mutated)
      → seeds each person's run-in count walking into Monday
  → CREW_REST pre-pass, Monday only: weekctx.ts:prevSundaySeed(CURWEEK)
      → weekBundle(prevWeek) + INPUTS → stands in for ev[idx-1];
        di:null so markTrace no-ops (no synthetic trace on the loaded week)
      → REST[0] (Monday's crew-picker rest-clear times) is now real
  → midnight input tails at the loaded week's Monday/Sunday edges
      → weeks-data.ts:edgeDate + events.ts:buildDay read the adjacent
        week's date labels through the SAME global INPUTS — not a second
        data source, no live DAYS for that week either
  surfaces repainted: the warnings list, pucks/chips/rings (highlights.ts),
  the crew picker's REST times (avail.ts), the Logic tab's CREW_REST/DAYS_RUN rows
```
Every flag still lands on the day it breaks: next Monday's rest bust or
run-break appears when next week is loaded and validated, not as a hint on
this Sunday. A non-loaded week's seed is only ever what `weekBundle` still
holds — its authored/remembered SEED shape (see `engine/weekctx.ts`'s header)
— `SCHED`/publish state and forgotten manual edits are not read, matching
what `loadWeek` (Flow E) itself forgets on switch. An unauthored adjacent
week seeds nothing.

**Every flow ends by repainting through `notify()` (or the board lane).** State
that lives outside the funnel + `HOOKS.storeBackend` is invisible to undo, AL
and re-validation — do not add any.

**A who-string resolves by callsign OR bare id (`engine/people.ts:nameToId`, id-tolerant since the 21 Aug scrub).** The seed stores lowercase person ids in ground/programme `who` fields; they used to double as the callsign lowercased, until the demo callsigns were rewritten to fiction. `nameToId` now falls back to a value that is already a person id, so those rows keep resolving — and `slots.ts:renameCallsign` rewrites `who` by that same resolution (old-callsign form AND bare-id form), not by string match. A change to the who-storage convention or to `nameToId` is a drift-seam against `renameCallsign` and the parity reference (`testing/refwin.ts:renm`/`recs` mirror both).

---

## 3. The per-feature checklist

Run this before building and again before calling it done. Most answers are
"no" — the value is in catching the one "yes" you would have missed.

- **Warnings** — does it change what `validate()` sees, or add a check? If a
  new rule: does it read off the same window the picker reads (below)?
- **Availability / palette** — if it touches an input, a time or a qual, does
  the palette still agree with the warning list? (The one invariant that
  breaks most often.)
- **Layout** — does it add DOM or change a measured size? Then re-measure the
  perf ceiling and add/adjust an `e2e/geometry.spec.ts` check IN THE SAME PR.
  Check BOTH desktop and phone — they are different code paths (media queries).
- **History / edit log** — is this a new schedule write? Then it must reach
  `markEdit` **with both from/to values** (a key with no values logs nothing),
  and a new text-key family wants a line in `keyOf` and, if the board can't
  draw it as a cell, in `NO_BOARD_CELL`.
- **Undo / redo** — does the write go through a `write*Batch`? If not, undo
  can't see it.
- **Board vs Edit vs View-only** — does the change render on all three
  surfaces it should, and stay OFF the ones it shouldn't (a view-only surface
  must not gain a live control)?
- **Desktop / mobile** — reachable and legible at 390px AND using the width at
  desktop? Both are owner standing concerns.
- **Qualifications** — does it read or change `p.quals` or the qual ladder?
- **Roles** — is the gate on the PAGE and the WRITE path (`editMode()` /
  `canEditSched`), never on the nav?
- **Export** — does the new field belong in the CSV, and is any free text
  escaped at the sink?
- **Publishing / AL** — on a published day, does the change mark pending and
  reach the AL correctly (add-then-delete before an AL is a no-op)?
- **Persistence** — does the feature imply data surviving a reload? Only the
  persisted-config family does: `rules`, `stores`, `dutytpl`, `daytpl` and (Aug
  26) `cxreasons` cancel-reason templates, each on the same `store.get/set` +
  untrusted-load shape. Everything else — INPUTS, publish state, the view-only
  toggles, the notification bell (`BELLLIT`) and muted checks (`WARNOFF`) — is
  session-only. Say so.
- **Reference parity** — does it change the seed `INPUTS`, `DATES`, or an
  engine body the reference computes? Then `refwin.ts` and `node reference/tfin.js`
  are in scope. (Adding a NEW capability that leaves the seed alone is not.)

---

## 4. Robustness — the single funnels and the drift-seams

**Where the wiring is robust** (one path, so it cannot fall out of step — build
ON these, don't route around them):

- **The mutation funnel** — every schedule write goes through five functions to
  `noteChange` → `afterSchedMutate`. One place validation, history and AL hang
  off.
- **`validate()` is the only judge** — `WARN`/`REST`/`EVD` are reassigned every
  run and re-read, never cached.
- **`INPUT_META` is the one input table** — every predicate (`isLeave`,
  `isAway`, `canSpare`, …) is a lookup, and the legend is generated from it, so
  the rule and its explanation cannot disagree.
- **`acceptInput` is the one promotion path**; `commitInputEdit` the one input
  commit; `export.ts` the one exporter (schedule, inputs, LoX).
- **`dayStatHTML` (`html.ts`) is the one publish-strip builder** (15 Aug 26)
  — the week's day-head and the board's sign-off panel both call it for the
  version chip, pending count, ⓘ and Publish controls, so "the board should
  edit everything the week does" cannot drift into two copies of that strip.
- **The ⓘ info-only flag reads through the engine's own primitives** (1 Sep
  26) — a `ground`/`allhands` row with `info:true` is skipped once in
  `events.ts` (so every `day.events` consumer — validator, EVD, Insights,
  cross-week seeds — follows for free) plus the three raw-model readers
  (`personBusy`, `dayEngaged`, `dayOilSpans`), and the crew picker stands
  down via `slotRules().infoRow` → `slotBar` '' — the picker mirrors the
  validator's silence rather than keeping a second copy of the rule. The
  prose lives once on the Logic page. `personCount` deliberately still
  counts it (ink on the week, like cx). Pins: `engine/infoflag.test.ts`.
- **`rosterOptions` (`inputedit.tsx`) is the one roster list** (14 Aug 26) —
  the Inputs page's add form, its row editor and the schedule's
  Unavailable-reassign dialog all call it, so the three can never disagree
  on who is offered or in what order.
- **`inputTone` (`inputedit.tsx`) is the one input colour code** (22 Aug 26)
  — the Inputs table's row stripes and the month calendar's chips both read
  it, so red/amber/purple cannot mean different things on the two surfaces.
  BUT a known SMALL drift-seam rides beside it: `InputsCal.tsx:dayEntries`
  COPIES the table's three-filter logic (person/type/search,
  `InputsPage.tsx` ~368-370) rather than importing it — a fourth filter
  added to the page must be added to `dayEntries` too, or the calendar
  quietly shows what the table hides.
- **`draftVerLabel`/`daySnapOf` are the one version-label/resolve path**
  (15 Aug 26) — a `'d:<id>'` draft version and an AL/ORIG version both
  label and resolve through these two, so a new preview consumer (a picker,
  a banner) never needs a second branch for "is this a draft".
- **`dayApproved(di)` decides the view page's whole shape twice** (15 Aug
  26) — `viewVerSelHTML` picks WHICH picker a day gets (drafts-only vs
  issued/working) and `ViewWeek.tsx`'s render branch picks WHAT the day
  shows (live/draft-preview vs `dayIssuedHTML`/working). Two copies of one
  publish-state test, in two files: a change to either must walk the other,
  or a day can render one answer under the other one's picker.
- **Dates now carry a year when it is not the loaded week's** (12 Aug 26), so
  `dateOrd`/`fmt`/`unfmt`/`inputCoversDate` all read one representation and a
  span into the new year sorts and covers correctly. Before this there were two
  readings of a yearless label and they disagreed across a year boundary.
  **And a bare label on an INPUT is anchored by the row's own `yr`** (24 Aug
  26): every creation path stamps it, `commitInputEdit` re-stamps it, and
  every reader (`inputCoversDate`, `dateIx`, `draftOf`/`unfmt`,
  `sansOverlapRefusal`, the Leave War sync's `labelToISO`, `inpKey`) resolves
  through it — a new reader of `inp.date`/`inp.endDate` must pass the row's
  `yr` too, or it re-inherits the "Jul 13 of whatever year is loaded" bug.
  Week labels themselves follow the same convention (`weekLabels` stamps a
  day outside the loaded year), and the two cross-year label caches re-derive
  per loaded year (`weekctx` bundle cache, `stashDays`). Rules:
  `docs/engine-rules.md` §Every input is anchored; pins:
  `engine/crossyear.test.ts`.

**Where the wiring is a drift-seam** (two copies of one truth that a change can
split — these are where this app's recurring bugs come from; touch one side and
check the other):

- **The Leave War batch writers vs their single-cell parents** (27 Aug 26,
  drag-select). `setCells`/`clearCells`/`setBidStates`/`moveCells` MUST call
  through the exact per-cell guards `setCell`/`setBidState`/`shiftBid` use
  (`raptorOwns`, `canEditCell`, `isBiddable`, `inSquadron`) — a batch API that
  grew its OWN copy of "may this cell be written" is the seam that would let a
  drag write where a click could not. They also all batch to one save-notify
  through the store's single `quiet` flag; a second batching owner is the
  other half of this seam (`setCellRange` is the precedent, save/restore keeps
  them safe if nested). Pinned in `store.test.ts` §the batch writers.
  **`movableCells` is the third face of the same guard** (27 Aug 26, loose-box
  move): "which cells of a selection hold a movable bid" is read in THREE places
  — the sheet (offer Move at all), the anchor (`earliestDate` of the movers, so
  the first input lands on the tapped day), and the mover itself. It is one
  exported body over the same `!raptorOwns && isBiddable && canEditCell &&
  canEditRow` guards `moveCells` guards each source by; a second copy is the
  seam. The move now
  ignores the empty cells swept up around the inputs (a loose box no longer
  refuses as "nothing") — but the ATOMIC target guards still refuse an occupied
  / Raptor / out-of-window landing, so nothing is overwritten.
  **The ROW guard `canEditRow` is the fourth face** (27 Aug 26 — "viewing as
  ranger, I shouldn't be able to input on other people's row except mine"). A
  member writes only their own row (the `viewer`/"View as" person), an admin
  any; `canEditRow(role, viewer, personId)` (engine/stages.ts) is read at the
  write path (`setCell`, the range/batch writers, `moveCells`/`isMovableSource`,
  `shiftBid`) AND the grid affordance (`Matrix.tsx` `openable`, the drag `order`
  restricted to the viewer, the BidPicker's edit gate) — the same drift-seam
  rule as `canEditCell`: whatever the grid stops offering, the store must
  independently refuse. `viewer === null` (raw store / tests only — production
  always mirrors a real `ME`) imposes no row rule. Pinned in `store.test.ts`
  §a member edits only their own row.
- **The 27 Aug overnight pass added three more one-body seams to watch.**
  `canDecide` is now read by the DecisionSheet/SelectSheet AND both store
  decision writers (`setBidState`/`setBidStates`) — a decision gate grown in
  only one of those places is the seam. `moveProblem` is the validation half
  of `moveCells`, read by the commit AND the landing preview (`previewAt`) —
  a preview that stopped asking it would show landings the commit refuses.
  And the member-own Inputs backstop reads `canEditSched()` (the render
  gate's predicate), never a role literal — the literal `'member'` matched
  no real session and left the gate inert while its fixtures matched it.
- **The two role reads: `LOGINROLE` (the ceiling) vs `SESSION.role` (the
  effective role)** (27 Aug 26, the admin's view toggle). DELIBERATELY two
  values, not a drift bug — but a seam to respect: every PERMISSION gate
  (`canEditSched`, `lgCanEdit`, `HOOKS.editMode`, the Leave War's
  `state.role`) must read the EFFECTIVE role, and only the toggle's own
  affordance/refusal (`canToggleRole`, `toggleRole`) may read `LOGINROLE`.
  A gate that read `LOGINROLE` would let a parked admin edit from member
  view; a toggle that read `SESSION.role` would strand an admin in member
  view forever. `roletoggle.test.tsx` pins both directions. The Leave War
  role is a third COPY (its store's `state.role`), kept in step by exactly
  two writers — `resetSession` and `toggleRole` — through the one
  `lwSetRole` seam; a role change added anywhere else must walk all three.
- **The working day: the LONGDAY note vs the Insights work-hours total**
  (20 Aug 26). Both answer "how long is this person at work", and until the
  work-hours section was built the answer existed only inside `validate()`'s
  long-day block. It is `validate.ts:workSpan` now — report (the published
  in-time, else T/O − reportLead) through last landing + debrief, or start →
  end for anything that is not flying — and BOTH read it: the note raises off
  one day's span, the panel sums the week out of `EVD`. Deliberately not a
  second copy: a week total that disagreed with the note calling a day long is
  the exact failure this list is about, and `insights.test.ts` puts the two
  numbers side by side. A change to what counts as the working day (the
  report rule, the debrief pad, which event kinds are in `EVD`) moves both, as
  it should — but anything that re-derives a span WITHOUT `workSpan` is a new
  seam.
- **The trailing drop zone: one `ADDZ` body, two surfaces** (26 Aug 26). Every
  append-capable people cell needs a drop target that ISN'T over a seated puck, or
  a full row's drop resolves to a `.seat` and swaps it. `html.ts` exports the one
  `ADDZ` span; the week's `lCell` and every board `.ppl[data-fill]` cell
  (`board-html.ts`) both emit it, so the two cannot drift. The only surface
  difference is CSS, not markup: the week's strip is an always-present full-width
  bar below the pucks; the board's is `.schedboard`-scoped to a PERMANENT,
  steady-height TRAILING zone (`flex:1 1 var(--puck-w)`) that grows into the row's
  leftover width and wraps to its own line only once the pucks pack it — so the
  pucks never fill the full width and nothing reflows when a drag starts (the
  earlier board strip opened from `height:0` on `body.dnd`/`body.arming` and
  jumped the whole board — owner, 26 Aug 26). Its "+ add" text stays hidden on the
  board; an empty board cell shows a bare dashed box, a filled one bare space. The
  `.fcprcp` seat grid `display:none`s its zone (it auto-adds rows, never swaps). A
  new append cell that hand-rolls its own `.ppl` without `ADDZ` is the seam this
  entry forbids.
- **The LATE mark: passive printers read one gate, the board draws the control**
  (21 Aug 26, was a global switch on 20 Aug). `lateTag`, `lateTagOf`,
  `lateRowCls` and `lateRowTitle` (`ui/html.ts`) each print the mark on a READ
  surface, and each reads `lateShown(inp)` once — so dropping an input's mark
  (`LATEOFF` in `state/view.ts`) covers the board's passive badge, the edit week
  and the view-only week together rather than three-quarters of them. The board's
  LIVE input rows instead draw `lateChip`, the always-present clickable control,
  so a dropped mark stays reachable to restore. The Inputs page reads
  `isLateInput` DIRECTLY and is deliberately outside the gate — the paperwork
  record still says when an input was filed. A new READ surface that prints the
  mark must go through one of the four passive printers, or it will keep printing
  after a scheduler drops it; a new EDIT surface wants the chip.
- **Palette vs warning list.** `slotBar`/`avail.ts` and `validate.ts` read the
  same input independently. They must give the same answer about who is
  available. Failing closed (`inpWin`, `awayAllDay`) is how they are kept honest.
  Since 13 Aug 26 the GREEN ELIGIBILITY RINGS (`paintSelRings`, highlights.ts)
  are a third reader of the same question — deliberately NOT a third copy: they
  call `slotBar` itself per slot, memoised against WARN's identity, so they can
  only ever disagree with the palette by a stale repaint, never by a diverged
  rule. Keep it that way: a ring rule that does not go through `slotBar` is a
  new drift-seam. (`selrings.test.tsx` pins DOM-agrees-with-slotBar directly.)
  The 31 Aug 26 two-SC-seats rule follows the same law from the other side:
  `events.ts:scSeatHit` is the ONE body — the validator's spare-overlap
  warning and `slotBar`'s "already on …" refusal both call it (spares are
  absent from EVD, so neither could have read the shared event stream). A
  future SC-seat rule goes through it, not beside it.
- **Three editors over one list.** The Inputs page, the week cell and the board
  cell all edit `INPUTS`; they are kept from drifting only because all three
  funnel through `commitInputEdit`/`setInpField`. Add a fourth the same way.
- **What a write STORES vs what a snapshot HOLDS** (16 Aug 26). `txtSet`
  normalises on the way in (`0700` stored as `07:00`) and `setSlotVal` stores a
  callsign where the seed holds an id — so a value can be semantically equal to
  a frozen snapshot's while being byte-different, and every raw compare against
  a snapshot (`dayKeys` feeding `reconcileIssuedMarks`/`rebaseDayPending`) read
  a respelling as an edit. `dayKeys` now folds person and time cells to one
  canonical spelling (`P()`/`T()` in restore.ts). A NEW normalising write path
  (a new value family the editor reformats) needs a matching fold there, or a
  reverted edit on a published day wears a mark that never clears.
- **The edit-week day-head diverges from the reference (15 Aug 26).** The day
  NAME is a crew-day picker (`.dow.crewday`) while the reference's whole day-head
  opened the board; the two are held in sync by `html.test.ts`'s `normDow`, which
  maps the port's `.dow` back to the reference's before the byte-compare. Change
  the port's `.dow` markup and `normDow` must move with it, or the parity gate
  fails on a difference that is deliberate. (The `.dt` date is byte-identical to
  the reference and needs no idiom.)
- **The history bubble is wired to the board wrap.** Cells that render only on
  the WEEK (`ar:`/`at:`/`it:`) list in history but cannot show a bubble or be
  jumped to — `NO_BOARD_CELL` records which. A new week-only cell inherits this.
- **The reference push.** `refwin.ts` pushes the port's seed `INPUTS` into the
  read-only original for parity. Change the seed's SHAPE and the reference must
  be patched too — which is why new date-years live in USER data, not the seed.
- **Duties are decoupled from waves (13 Aug 26).** A duty desk is minted from a
  template (`dutytpl.ts`), not built from a wave, and nothing links the two —
  a removed seam. The template library is a new persisted-config surface beside
  the stores list; a change to its seed shapes or its load/save path is
  per-device state, so treat it exactly like stores.
- **AMT brief/box/debrief is label-driven.** `events.ts` splits an AMT block by
  matching `/^BRIEF/` and `/DEBRIEF/` on the row labels a scheduler types, so the
  row LABELS and the engine's window maths are two copies of one truth — a
  renamed AMT row silently changes which window it feeds. (The debrief END is
  read off its own cell since 13 Aug 26; the three-way SPLIT is still by label.)
- **Desktop and phone are separate CSS paths.** A fix measured on one is
  unproven on the other; the geometry gate checks both because a change often
  lands on only one.
- **`whoami()` / `whoAmI` names an account, not a person.** Any feature that
  wants "who did this" inherits the prototype-auth limitation until a server
  fills that hook.
- **SANS availability — one gate, three surfaces (14 Aug 26; reworked to one
  window the same day).** `sansGate` (`avail.ts`, backed by
  `sansAvailOn`/`sansWindow`/`sansLetters`/`sansBadge` in `inputs.ts`) is
  read by `slotBar` (the palette grey-out + both plant/drag toasts, PLUS the
  unarmed default strike `rosterPuck` gives a record-less SANS), by
  `validate()` (the `SANS_AVAIL` advisory), and by three badge surfaces — the
  palette's `.rall.rsans` band (badge + remarks), the shared card grid the
  week group and the board panel both render, and the Available-crew header's
  "N SANS offering" count. Change what a status means, or add a fourth
  domain, and check all of them; a badge or a grey-out reader that stops
  calling `sansGate`/`sansBadge` and starts reading the record itself is a
  new drift-seam the moment it happens. The record now carries ordinary
  top-level `s`/`e`/`half` — the exclusion from the absence/clash machinery
  is TYPE-based (`inpShow`, `isAway`), pinned by `sansavail.test.ts`'s leak
  guard; any new consumer of input times must decide whether SANS rows
  belong in it. The flying-seat window SANS is judged against is its own
  seam since 26 Aug 26 (in-time→dekit, not the step→dekit pad the absence
  checks keep): the front edge lives ONCE in `seatIntime` (`events.ts`),
  read by `collectEvents` (→ `e.report`, the validator's
  `min(e.report,e.step)`) and by `slotRules` (→ `sansStart`, the picker) —
  a third reader must call the same body.
- **A person's category is read in many places (`p.pers` / `seat:'GND'`).**
  Personnel (ground crew, Aug 26) must be handled the same at every joint: the
  front-seat bar in BOTH `slotBar` (`avail.ts`) and `validate.ts`; the flying
  exemptions in `validate.ts` (crew rest, turns, matrix, AAR, brief/debrief);
  the puck (`html.ts`, white, no CAT chip); the palette column and the quals
  table; the flying-count exclusions (`availByWave`, `insights.ts`). Add a rule
  that iterates aircrew and ask whether a `pers` body belongs in it. They are
  seeded but kept OUT of the seed schedule, which is what keeps parity clean.

- **`shiftWeekKey` (`engine/weeks-data.ts`) vs `shiftWeek` (`ui/weeknav.ts`)
  — a DELIBERATE second copy (23 Aug 26).** Both step a `dd/mm/yyyy` Monday
  key by whole weeks; the engine needs one to walk `weekctx.ts`'s seed reads
  back without importing `ui/` (an engine→ui import would be a layering
  violation worse than the duplication). Not yet pinned by a test asserting
  the two agree across month/year/leap boundaries — change either's date
  math and walk the other by hand until that test exists.
- **`ui/peek.ts`'s `peekPuck`/`peekRow` mirror `html.ts`'s `puck`/`plRow`
  visual shape, deliberately as a SECOND copy (23 Aug 26).** The next-week
  preview cannot call the live builders directly — `puck`/`plRow` key their
  amendment/warn classes off the SAME 0–6 day-index namespace the loaded
  week uses (`ff:0.0.0` addresses `SCHED.changes`/`pending` by day index), so
  calling them for a preview day would paint THIS week's pending marks and
  warn rings onto NEXT week's programme. `peekPuck`/`peekRow` reproduce only
  the visual identity (qual chip, RCP tint, SANS line, the row's five-cell
  shape) with none of that state-reading. A future change to what a puck or
  a row LOOKS like — a new qual chip, a new tint, a reshaped row — must touch
  both files or the preview quietly falls out of visual sync with the real
  week; nothing currently tests the two agree, so check by eye.
- **`weekStashSnap` (`state/store.ts`) shares its SCHED field list with
  `state/history.ts:schedFields` (23 Aug 26) — the anti-drift device, not an
  accident.** Both serialize "the same eleven SCHED fields" for two different
  purposes (the per-week stash vs. the whole-history undo snapshot); calling
  the shared function rather than listing the fields twice is what stops a
  new SCHED field from silently reaching one snapshot and not the other. A
  future SCHED field that skips `schedFields` breaks this guarantee for
  BOTH readers at once, not just the one that forgot it.
- **`engine/weekstash.ts`'s snapshot shape is `weekStashSnap`'s to change
  (23 Aug 26).** A stash entry is JSON built by `weekStashSnap`, read back
  by `applyWeekModel` in the same session — the two live in one codebase, so
  they move together; the seam to respect is `schedFields` above, and the
  session-only rule (no persisted blobs means no stale-schema blobs).
- **A draft's stow can lag the live day (15 Aug 26).** `SCHED.drafts[di]`
  holds each entry's own blob; the live `DAYS[di]` is only the SELECTED
  entry's working copy, and every OTHER entry's blob is refreshed solely by
  `draftDup`/`draftSelect`'s own stow step — nothing keeps a non-selected
  draft's stored blob live-synced to anything. A future whole-day writer
  that assigns `DAYS[di]` directly, bypassing `draftDup`/`draftSelect`
  (a bulk import, a second template-apply path), leaves the OTHER drafts'
  blobs describing a day that has already moved on, silently, until the
  next switch reads one back in. Any new whole-day writer has to decide
  whether it stows first or accepts that staleness.

When you add a feature that creates a NEW drift-seam — two places that must now
agree — name it here so the next session knows to check both.

- **The medical tracker's drift-seams (27 Aug 26).** Three named pairs, each
  ONE body on purpose — check both ends when touching either:
  - `needsDoc` (`engine/inputs.ts`) decides BOTH the upload control's
    visibility (`DocField` render sites: the Inputs add form, its row editor,
    the shared modal) and the write path's refusal (`normalizeInputDraft` +
    `InputsPage.add`). A new doc-needing type is one edit there; a second
    predicate is the seam.
  - `typeGroup` maps grp `'upchit'` → `'med'` so the dropdown heading, the
    legend and `defaultAllday` all file Upchit under Medical — but
    `restsInput` and `isDownchit` read `m.grp` DIRECTLY, so Upchit is
    excluded there explicitly. A future marker group must walk both readers.
  - The trim planners (`engine/medical.ts`) are pure and the ONE applier is
    `applyMedPlan` (`ui/inputedit.tsx`), called inside the same
    `writeInputsBatch` from all three creation funnels and both edit paths.
    A new input-creation path that skips the planner silently un-invents the
    overwrite rule.
  - `upchitEffects` (`engine/medical.ts`) is the ONE body behind the upchit
    save-time summary sheet (`ui/UpchitConfirm.tsx`, 27 Aug 26): what the
    sheet shows and what the save then trims come from the same call, and
    ALL THREE form paths (Inputs add, its row editor, `InputEditor`) gate an
    upchit save through the sheet — a fourth form path that saves an upchit
    without it re-opens the silent-save hole; the calendar re-date drag
    (`caldrag.ts`) is the one documented direct path.
  - `medClashes` (`engine/medical.ts`) is the same pattern for the clash
    sheet (`ui/MedClashConfirm.tsx`, 27 Aug 26): it selects the rows BOTH
    for the sheet's questions and for `newMedTrimPlan`'s knife, and the
    "keep the old status" answer resolves through `medKeptSegments` /
    `mintMedSegments` (`ui/inputedit.tsx`) — kept rows are protected by
    segment construction, not by a second guard, so a new writer that
    bypasses the segments silently reverts to new-always-wins. Same
    three-form-paths rule, same caldrag exception. The clash sheet also
    carries a LEFTOVER decision (28 Aug 26): when the new entry takes the
    days of a row running PAST it, `medTailBeyond` (one body for sheet and
    planner) surfaces the tail as Remove (default) / Keep, whose answer
    threads through `newMedTrimPlan`/`mintMedSegments` as `keepTail`. The tail
    is measured past the WHOLE entry's end (`newMedTrimPlan`'s `entryEnd` arg,
    defaulting to the segment end for single-segment and direct callers) —
    measuring it per-segment let a kept leftover reach into a later segment
    that then re-trimmed and dropped it, once a kept MIDDLE status had split
    the entry (28 Aug review). A new write path that resolves a clash but
    forgets to pass the filer's `keepTail` reverts to tail-always-kept — safe,
    but it drops the owner's Remove default and the sheet's promise silently,
    so pass it (and `entryEnd` with it).
  - `medEpisode` (`engine/medical.ts`, 1 Sep 26) is a THIRD read of the same
    rows — the person's overlapping-or-touching medical entries as one episode,
    so the Medical card can show every document together and the viewer can
    page them (`ui/DocViewer.tsx`'s optional `{rows,idx}`, additive to the
    single-row `{row,up}`). It mints nothing and adds no rule — a pure
    partition — so it cannot open a seam; the only thing to keep true is the
    connect rule (overlap OR touch, closer folded in), which lives in that one
    function and is pinned in `medical.test.ts`. It is DISPLAY layered on the
    derived reads, not a fourth data path.
  - A record's DOCUMENTS are a pair `docId`/`docIds` since 1 Sep 26 (several
    files on one entry): minted ONLY by `state/docs.ts:docFields`, read ONLY
    through `rowDocIds` — a new writer that sets either field by hand, or a
    reader that looks at `r.docId` alone, reopens the drift this pair-rule
    closes. The Leave-War retain (`sync.ts` RETAINED/prior maps) carries the
    FULL list across a war-side date change for the same reason. The rules
    engine never reads either field, so parity is untouched by construction.
  Plus one known demo wrinkle, documented in `state/demoseed.ts`: reloading
  week 1 restores the pristine INPUTS snapshot and drops the seeded demo
  docIds — the viewer's "No document on file" state covers it; not a bug to
  chase. The Medical view itself is DERIVED (`engine/medical.ts` over
  `INPUTS` + an as-of ordinal, default the notional `weeknav.TODAY`), so it
  cannot drift from the table; anything stored would be the seam.

- **Section display order (29 Aug 26; dragged in place 30 Aug 26; crew panels folded in
  31 Aug 26) — one order, two builders.** A day's `d.secOrder` is read by BOTH
  `ui/board.ts boardHTML` and `ui/html.ts dayHTML` through the one `engine/order.ts
  secOrder(d)`, so the two surfaces cannot disagree. `SECTIONS` has TEN keys now: the
  six schedule panels (`notes prog waves duty sims ground`) PLUS the four crew
  working-aid panels (`inputs avail sans unav` — Personal Inputs, Available crew, SANS,
  Unavailable) that joined the board's one draggable list (owner, 31 Aug 26 — "one list,
  drag anywhere"). **The crew four are BOARD-ONLY:** `board.ts` maps all ten to panel
  strings, but `html.ts`'s week slices bits only for the schedule keys with content
  (`notes` is merged into `prog`), so the crew keys — like any key with no week bit —
  are skipped there and the week APPENDS its crew panels separately; reordering a crew
  key changes the board and nothing on the week. The drift-seam to mind if the set grows
  again: a new SCHEDULE key must be added to `SECTIONS` AND mapped to a panel string in
  BOTH builders AND given a week slice bit; a new BOARD-ONLY key needs only the
  `board.ts` map (and must stay bit-less on the week, or it stops being board-only). The
  section grip is a bare `⠿` reading `data-secmove="di.key"`, so there is no per-grip
  label to keep in step (though Admin's Default-arrangement carries one label per key,
  `ADEF_SEC_LABEL`, all ten). It is display-only: it
  never enters a slot key, `SCHED.*`, or an AL, so it is invisible to `validate()`/
  publish/history (guard: `engine/secorder.test.ts`); the write path is a DRAG on the
  section grip (`.sb-sec`/`.dsec[data-secmove]`, `ui/rowdrag.ts` → `store.moveSectionTo`
  → `engine/order.ts reorderSectionTo`, histPush, no markEdit), and a whole-day
  template carries it (`engine/daytpl.ts`). After a section drag an admin is offered
  the house default (`ui/SecDefaultSnackbar.tsx` → `setSecDefault`/`secDefaultSave`).
  **Parity seam:** the grip + `.dsec` wrapper are EDIT-MODE ONLY on the week, so the
  view builder is byte-identical (`html.test.ts` pins both directions; the byte-compare
  unwraps `.dsec` via `noDsec`). A crew reorder is byte-safe on the week too — the crew
  keys carry no week slice bit, so `dayHTML` is unchanged after one (pinned in
  `ui/board.test.tsx`).

- **Wave-block order (29 Aug 26; dragged in place 30 Aug 26) — a REAL reorder, not a
  display order.** Each wave block carries a header grip (`.wvgrip`) + `data-move=
  "mv:w.di.gi"`; `ui/rowdrag.ts` walks up to the enclosing block, so a wave drops onto
  another wave (not a line inside it), on BOTH surfaces (wired on the board wrap and
  the edit-week root — the edit week has no inline ROW reorder; only section/wave
  grips exist there). Unlike section order, a wave move mutates the real model and IS
  an amendment: `applyMove` kind `w` → `engine/reorder.ts moveWave` → `afterSchedMutate`,
  the manual sibling of `sortWaves` sharing its nine-head key remap. **Drift-seam to
  mind:** that nine-head list appears in `moveWave`, `sortWaves` and `keys.ts
  shiftWave` — a wave gaining a tenth key head must reach all three, or a moved/
  sorted/deleted wave leaves an orphaned key. Wave order rides `d.waves` itself, so
  undo, the week-stash and the day template capture it with no extra field. A wave
  move touches rule KEYS — but only their indices, never their substance, so
  `validate()`'s warning set is invariant under it (`engine/reorder.test.ts`,
  `ui/rowdrag.test.tsx`).

- **The DEFAULT arrangement (29 Aug 26 pt.2) — admin-set global defaults for both
  orders.** `ui/AdminPage.tsx ArrangeDefaults` (Squadron config) sets two persisted
  singletons, each on the `wavehide` footing (in-memory value, `*Save` writes `null`
  at the baseline, `*Load` sanitises, boot-loaded in `initStore`):
  - `engine/order.ts SEC_DEFAULT` (key `secdefault`) is the fallback `secOrder(d)`
    fills un-arranged sections from — so the whole week follows the house order
    without per-day arranging, while a hand-arranged day still wins. Display-only;
    canonical baseline ⇒ parity 728/0 untouched. **Drift-seam:** `secOrder` now
    reads this global, so anything that clones a day and expects raw-canonical
    default order must go through `secOrder`, not re-implement the fallback.
  - `engine/reorder.ts WAVE_DEFAULT` (key `wavedefault`, off by default) orders the
    built-in wave kinds and is applied at ADD time on not-signed-off days only
    (`board.ts placeAddedWave`, in BOTH `addWave` and `addWaveFromTpl`), reusing the
    tested `moveWave`. It never re-orders an existing day and never amends a
    published one ("new schedules only", owner). **Drift-seam:** any NEW wave-add
    path must call `placeAddedWave` too, or template/built-in adds would place
    inconsistently. Guards: `engine/arrdefaults.test.ts`, `ui/wavedefault-add.test.tsx`.
