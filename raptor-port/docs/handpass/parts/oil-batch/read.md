# The OIL batch: the fresh, blind code read (20 Oct 26)

Reader: a fresh Opus, not the writer (D790). Read: `git diff main...claude/oil-small-fixes-1020 -- raptor-port/src
raptor-port/e2e` and the touched files around each change (`leavewar/sync.ts` `creditFrom`, `desiredOilCells`,
`oilBlindLine`, `publishFlagsBids`, `oilCreditBidAgainst`; `engine/oil.ts` `fltOilWin`, `fltMeasuresNothing`, `dayOilWork`,
`dayOilBlind`; `engine/reporting.ts resolveReporting`; `engine/publish.ts` `priorVerId`, `unpublishBackTo`, `unpublishDay`,
`dayCurVerIn`, `warnDelta`, `hidePending`; `engine/validate.ts` the FLT_NO_LEN body and its caller, `LIVE_ON_FACE`;
`leavewar/engine/oiltracker.ts oilLedgerFor`; `leavewar/engine/credit.ts`; `state/view.ts` the arm; `ui/interactions.ts`
the Unpublish route; `ui/html.ts dayStatHTML`; `ui/board.ts`, `ui/peek.ts`, `ui/logic-html.ts`), the evidence sheet (§3,
§10), the rulings D2, D31, D49, D101, D142, D591, D592, D837, D932 (full rows), the three backlog items, and N2 / N3 / N4
in `docs/superpowers/briefs/2026-10-13-wording-recheck.md`. Ran one unit file to confirm it green:
`src/leavewar/oil-bidagainst.test.ts` (11 / 11).

## Findings

### F-1 (low) The done note after withdrawing AL1 says "Original" and "the Original’s" in the same breath
- **Failure.** A published Saturday, Original then AL1 (AL1 credits a man less than the Original and he has spent it, so
  the press asks twice). Second tap. The note reads: "Saturday: AL1 withdrawn. Its changes are back on the working copy
  as pending, and Original is the issued schedule. Publishing reissues AL1. The Leave War credits the Original’s OIL for
  the day until AL1 is republished." The version is named two ways in one note; "and Original is the issued schedule"
  is not a sentence a person says (N2 says "reissues the Original", and the new first-tap note says "the Original’s").
- **Cause.** `ui/interactions.ts` line 1470: `${verLabel(now)} is the issued schedule` prints the bare label, while the
  branch's new `verName()` helper (line 1436) adds the article for the sentence it appends. The bare-label half is
  **already on `main`** (`main` line 1460; also pinned by `scripts/handpass/tb/w2/n3-al.mjs`); this branch puts the
  article-bearing sentence beside it, which makes the mismatch show in one note. Pinned as is by
  `leavewar/unpublish-al-oil.test.tsx` lines 74 and 89.
- **Fix.** (1) In `interactions.ts` line 1470 replace `${verLabel(now)}` with `${verName(now)}` (move `verName` above the
  click branch if needed; it is already in scope there). (2) Change the two expectations in
  `leavewar/unpublish-al-oil.test.tsx` (lines 74, 89) and the string in `scripts/handpass/tb/w2/n3-al.mjs` line 44 to
  "…and the Original is the issued schedule…". (3) The AL2 → AL1 wording is unchanged ("and AL1 is the issued
  schedule"). (4) It touches N3, a wording of record (D837): an article only, but put it on his look card (§14) beside
  the batch's other new words and let him strike it.

### F-2 (low) The armed button's title and the first-tap note give different reasons for the same warning
- **Failure.** Same Saturday, first tap. The note says "…Some of AL1’s OIL credits are already spent on the Leave War,
  and the Original credits less. Tap again to confirm." The armed button's title (hover on a desktop) says "Withdraw AL1
  on Saturday. The Original’s OIL comes back, and some of AL1’s is already spent on the Leave War. Tap to confirm." The
  title drops the one clause that explains why bringing the Original's OIL back is a problem ("the Original credits
  less"), so read alone it says the OIL comes back and still warns, with no reason; "some of AL1’s" also leaves its noun
  out.
- **Cause.** `ui/html.ts` line 1682, the `back` branch of the armed title, written separately from the note in
  `ui/interactions.ts` lines 1446–1448.
- **Fix.** Word the title from the note's facts: "Withdraw AL1 on Saturday. The Original’s OIL comes back, but it
  credits less, and some of AL1’s OIL is already spent on the Leave War. Tap to confirm." (`${esc(backName)}’s OIL comes
  back, but it credits less, and some of ${esc(verLabel(cv))}’s OIL is already spent…`). Update the title's expectation
  in `leavewar/unpublish-al-oil.test.tsx` and the example in `docs/ui-contracts.md` (the "Unpublish says what it did"
  paragraph). New words, not of record: his look card.

No finding of medium or high severity.

## Explicit negatives

1. **The surviving version is read exactly as the pass will land it.** `oilCreditBidAgainst` calls
   `desiredOilCells({ di, ver: unpublishBackTo(di) })`. `unpublishBackTo` returns `priorVerId(di, seq)` for an ALn and
   null for the Original, and `unpublishDay` sets `SCHED.cur[di] = priorVerId(di, seq)` (AL) or deletes `dayOK` / `cur`
   (Original), keeping `dayOK` for an AL, so after the press `dayCurVer(di)` is that same version and `dayApproved(di)`
   still true. The swapped read goes through the same `daySnapOf` → `creditFrom` → `oilEarnedWork(day, ev)` →
   `oilDayWork`, which measures with `oilKeptVals(ev)` (the version's own Logic values) and the version's frozen
   evidence; the same `creditable`, `oilAmount(blocks.get(iso))` and protected-date rules; other weeks' stashes are read
   unchanged in both runs. No disagreement found.
2. **Protected dates.** `after.protectedDates.has(iso)` → no warning. The pass never reverse-collects a protected date
   (P2-IMPL-01), so the landed credit stays and nothing is stranded; correct. A draft (`ver` null) is skipped, not
   protected, so the Original's case still reckons "earns nothing". The only route to a back version that does not
   resolve is a damaged snapshot (priorVerId does not validate; dayCurVerIn would then fall back to another valid
   version) — data damage, not new data (D56).
3. **The reckoning equals the landed credit's worth.** The ledger values an automatic credit with `creditWorth({auto})`
   = `codeWorth(code)`; the substitution uses `codeWorth(stays.code)`; the substituted credit keeps its id and date, so
   FIFO order and expiry are as the pass would make them. An award on the date (source `grant`) is untouched (N16).
4. **"Only a press that lowers him warns."** `without.balance < 0 && without.balance < current` — an equal or higher
   credit after the press is silent; a man already below zero is warned only if the press takes more than it puts back;
   an expired credit's removal (balance unchanged) is now silent, which is right (nothing stranded). For the Original
   (worth 0) `without ≤ current` always, so N4's case is unchanged except for that expired-credit case.
5. **`OilOmit` returning a number.** The only other callers are `counters.ts oilLedgerOf` (passes `omit` through),
   `oilBalanceOf`, `store.ts` line 3840 and `OilTracker.tsx` — none pass an `omit`. `true` / `0` drop the credit,
   `false` keeps it, a number replaces `amount` and `left` on a fresh copy; the copy shares the discarded original's
   `used` array, which nothing else holds. No caller changed meaning.
6. **`fltOilWin` is the old window, byte for byte.** Old: `w2(rep ?? st-lead, (en<st?en+1440:en)+deb)` with `w2` adding
   1440 when end < start and returning null for zero length; new: the same arithmetic in one body, `rep` from the same
   `resolveReporting(wv, f, st, lines)` with the wave's `lines` passed from `dayOilWork` and `lead` / `deb` from `rv`
   where the caller holds one. Evening-before reports (D503: `instant()` gives `clock − 1440`, so `rep ≤ take-off`),
   overnight lines and the formation's R box (D1032) all pass through unchanged. Since `rep ≤ take-off`, the window is
   null only when take-off = landing, debrief 0 and the report is at take-off — so `fltMeasuresNothing` can never name a
   line whose times differ.
7. **`fltMeasuresNothing` / `dayOilBlind` agree with the credit.** Same exclusions as the credit (cancelled line,
   standalone wave handled by `zeroShift`), today's Logic values as the live `dayOilWork` uses. At publish
   (`publishFlagsBids` → `oilBlindLine` on the issued snapshot) today's values are the kept ones, so the publish note
   and the credit agree. The live face after a later Logic change is S-4 (recorded, D592 (4)).
8. **Every place that prints the same-time sentence reads one body.** The warning (`fltNoLenMsg`), the week's and the
   Board's marked box titles and the next-week peek's box and hide key all call `fltNoLenSays(f, wv)`; no caller still
   imports the three-argument `FLT_NO_LEN_SAYS` or works out "shift" / "measures nothing" itself.
9. **A Logic change on a published day with such a line.** FLT_NO_LEN is a frozen warning (not in `LIVE_ON_FACE`), and
   its words now depend on the debrief and report values, so changing those can make a published day carrying a
   take-off = landing line with nothing round it read pending (`warnDelta` compares the words) and can unhide a hidden
   FLT_NO_LEN (its hide key carries the words). That is how every frozen warning whose words change behaves (D45, D179,
   D471) and, on a weekend, the OIL moves too (D592 (4), (8)); reached only with a debrief or report of zero. Not a
   finding.
10. **The Logic page's line (D932).** "…still earns its OIL from the report before it and the debrief after it, and none
    if it has neither…" is true for every setting: lead or debrief non-zero → a window; both absent → none. The
    `OIL_NO_TIMES` line ("no usable times") already covers equal times since the zero-shift change.
11. **The arm is for one version.** `setUnpubArm` stores `dayCurVer(di)`; `unpubArmed` re-reads it, so an AL2 issued
    over AL1's arm makes the next tap warn afresh. Every reset of `UNPUBARM` (day change, page change, preview, week /
    session reset) makes `unpubArmed` false on its first test, so a stale `UNPUBVER` is harmless.
12. **No other door.** `data-unpub` is drawn only by `dayStatHTML` (week and Board) and handled only in
    `interactions.ts routeClick`; `commitUnpublish` has no OIL logic of its own. No missing caller of the warning or the
    words.
13. **The Original's words.** The first-tap note keeps N4 (D839 row 4) whole; the done note keeps N2's OIL sentence
    whole; only the armed title changed ("bid against" gone). The OIL sentence still shows only on the two-tap path —
    the same as `main`.
14. **The correction date calendar.** No source change; the new browser test drives the tracker's own correction, the
    date box, the floating calendar's on-top check (middle and corners) and the saved date at both widths. The backlog's
    repro used a fresh −1 correction from the bar; the walk (§5 step 4) used that path, so both are covered.

Rulings checked against the code: D2, D142 (the reckoning reads the version that will be issued after the press), D31,
D49 (the credit is unchanged; only the words follow it), D101 (an AL withdrawn keeps the day published with the version
before it — the reckoning's premise), D591, D592 (the window, kept values), D837 / D839 (N2, N3, N4 — F-1 touches N3),
D932 (the Logic line). No clash found.

Findings new in this branch: F-2. Already on `main`: F-1's bare label (made visible by this branch's added sentence).
