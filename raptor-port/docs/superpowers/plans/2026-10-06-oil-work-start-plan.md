# `[OIL-WORK-START]` — the build plan (D591, D592) — 6 Oct 26

Written by the builder (Opus 5.5) before any app code changed, for one round of challenge by Astra and by Sol 6.1,
each blind to the other (D353, D590). The job as filed: `OUTSTANDING.md` `[OIL-WORK-START]`. The rulings, full rows:
`grep -h '^| D59[12] |' .claude/decisions-full/*.md`. Tier: FULL (OIL, the published record, saved data).

## 1. What he ruled

- **D591:** a flying line's OIL is worked out from its actual In-time / Rally, not from the nominal report time.
- **D592** ("all 4 as recommended", and his reminder): (1) the clock is the EARLIEST in-time or Rally that applies to
  that formation — the one the work-hours bar and the long-day warning already use (D505, D506); (2) a line with no
  in-time or Rally typed keeps the nominal report (take-off less "Nominal report before T/O"); (3) a report on the
  evening before (D503) lengthens that line's OWN day and credits nothing to the day before (D42); (4) a published day
  keeps the OIL it went out with — a typed time or a Logic value changed afterwards reads as a pending change and
  moves the OIL only when the day is published again (D48, D142); (5) the day still runs from the START of his first
  event to the END of his last, gaps included (the 29 Aug 26 rule) — so from the earliest of his in-time / Rally and
  any earlier event of his.

## 2. What the app does today (read from the code, 6 Oct 26, `main` at d584a2a8)

- `engine/oil.ts dayOilWork`, the ordinary flying branch (l.219–221): the span is
  `[take-off − VCONF.reportLead, landing + VCONF.debrief]`. The wave's reporting lines (`w.intimes`) are never read.
- `engine/oil.ts uniformOil`: half / full by `VCONF.oilFullMin`, read live.
- A published day's OIL is re-worked on every pass from the ISSUED day (`snap.d`) and its frozen evidence block
  (`snap.d.oilev`: decisions, claims, who each placeholder stood for) — `leavewar/sync.ts creditFrom` →
  `engine/oilev.ts oilEarnedWork` → `oilDayWork` → `dayOilWork`, then `uniformOil(envMin(…))` at `sync.ts` l.1104. The
  three Logic values are read LIVE in that chain, so changing one moves a published day's OIL at once: nothing
  pending, the four sign-offs standing (finding W1, `docs/handpass/2026-10-05-codex-stack-check.md` §5.2).
- The same live read is behind the board's green edge and OIL Earn figures on an issued face (`ui/oilmode.ts amtOf`).

## 3. The design

### Half 1 — the start of a flying line's OIL day

In `dayOilWork`'s ordinary (not standalone) flying branch, per formation:

```
start = resolveReporting(wave, formation, takeOff, parsedLines).report   // engine/reporting.ts — the one shared reader
if (start == null) start = takeOff − reportLead                          // D592 (2): nothing typed → the nominal time
span  = [start, landing(+1440 if before take-off) + debrief]
```

- `resolveReporting` is the body the day's events, the work-hours bar, crew rest, the wave header and the button
  already read (`events.ts seatIntime`). It is pure and reads the wave's own lines, so it works on a frozen snapshot.
- Its `.report` is the earliest of the formation's in-time and Rally stages, a line naming the formation outranking a
  wave-wide one per activity (D505, D506), and a clock later than the take-off is the evening before (D503 — a
  negative minute count), which lengthens this line's own envelope and touches no other day (D42: the walk is per day).
- A typed time LATER than the nominal one SHORTENS the day (take-off 12:00, in-time 10:00 → the day starts 10:00, not
  09:00). That is D591's own words ("the actual intime/rally time … not the nominal report timing") and what the
  work-hours bar does. **Builder's reading — named for the reviewers and his look card.**
- A line the reader cannot read (no recognised clock; "rally after in-time" with no in-time) gives no report → the
  nominal time. The warning list already says so on the day (`REPORT_UNRESOLVED`).
- NOT changed: SC MAIN / SC SPARE / AVALON / BB (a standalone wave's span is its written window; an SC's typed B is
  not read here — D591 is about a flying line); sims, duty, ground, Common Programme rows; the request half; D49 (a
  nought-minute sortie still earns); which seats earn by default; the envelope; the threshold's default.
- The work-hours bar with NO line typed starts at step (take-off less one hour); OIL with no line typed starts at the
  nominal report (D592 (2)). The two differ there by ruling, and stay different.

### Half 2 — a published day keeps what its OIL was worked out from

**Kept:** the evidence block gains `rv` — the three values the calculation reads — on a day that earns:

```
OilEvidence.rv?: { reportLead: number, debrief: number, oilFullMin: number }
```

Written by `oilEvidence()` from today's Logic values (so the live candidate always carries today's, and `daySnap`
freezes them with the rest of the block at every publication — first publish, AL, EOD, Unpublish-and-publish).
The block is already the ONE place a published day's OIL is read from, already rides the snapshot, the week's saved
record and the stash, and is already stripped when a snapshot is cloned back onto a working copy (`drafts.ts liveDay`).

**Read:** every reader that works OIL out from a block uses the block's `rv` where it has one, today's values where
it has none (the working copy; a version issued before this build — demo data, D56, which must still load and read):
- `oilev.ts oilDayWork(day, ev)` passes `ev.rv` into `dayOilWork` (a new optional `opts.rv`);
- `uniformOil(min, full?)` takes the threshold; one helper `oilAmount(ev, spans)` in `oilev.ts` is what
  `sync.ts` (the credit), `ui/oilmode.ts` (`amtOf`) and `oilWouldEarn` call, so the screen and the credit cannot split;
- `sync.ts desiredOilCells` keeps the threshold per date beside its pool (one date comes from exactly one snapshot).

**Told:** a Logic change that would move a published day's OIL reads as ONE pending change on that day (D45, D103):
`publish.ts oilDelta` adds an entry `oilrv:<di>` (kind `oil`) when, for the ISSUED day and its ISSUED block, what each
man is credited under the block's kept values differs from what he would be credited under today's. Checked only when
the kept values differ from today's (the common case costs three comparisons). It rides `dayDelta`, so the count, the
"To go out" list, eligibility and the sign-offs' `pendingKey` all move together; putting the value back clears it
(D98). The line reads, in the pending list: "OIL on this day · Logic values changed" with each man's "full day → half
day" under it and the value that changed ("Nominal report before T/O 3h → 2h30").

**Builder's reading — what is compared.** The comparison is each man's AMOUNT (nothing / half / full), not the
minutes behind it. A Logic change that would shift a published day's worked times but nobody's amount raises nothing:
the published record stays exactly as it went out (the kept values keep computing it), and the app's standing rule
against an amendment with no OIL behind it holds (`oilev.ts oilEvidenceKey`: "the key records what the day credits").
The alternative — every published weekend reads pending whenever any of the three values changes — is one line
(put `rv` in `oilEvidenceKey`). Named for the reviewers and for his look card.

**A typed time changed after publishing** needs nothing new: the reporting lines are day content (`it:` keys), so the
change already reads pending, and the credit reads the issued snapshot's own lines until the day goes out again.

### What is stored (D473 — keep the table list true)

`Day.oilev.rv` on issued snapshots only. `docs/data-schema.md` §A day's OIL evidence and `docs/data-model.md` gain it
in the same change; `engine/schema.ts` picks the type up from `oilev.ts`.

## 4. The tests (red first)

- `engine/oilworkstart.test.ts` — half 1 on bare day blobs, an exact answer per case: a wave-wide in-time; a Rally
  only; both (earliest); a formation's own line against a wave-wide one, each activity apart (D505); two lines for one
  formation and activity in either order (D506); no line (nominal); an unreadable line (nominal); a time later than
  nominal (shorter); the evening before (longer; nothing on the day before); his worked Saturday from D592 (08:30 →
  6h30 full; nominal 09:00 → 6h half); another earlier event of the man's (envelope from it); cancelled line /
  cancelled jet; SC, AVALON, BB untouched; D49's nought-minute sortie; and the unchanged half pinned first — every
  existing OIL test stays green without edits except those that typed an in-time expecting it to be ignored.
- `leavewar/oilworkstart-published.test.ts` — half 2 through the real publish path: publish a Saturday, change each
  of the three values in both directions → the war's credit and its worked times do not move, the day reads one
  pending change and its sign-offs fall; put the value back → nothing pending, sign-offs back; publish again (AL) →
  the credit moves and the new values are kept; a value change that moves no amount → nothing pending; a stashed
  (off-screen) week; undo / redo of the Logic change; a typed in-time changed after publishing → pending, credit
  unchanged until the AL; a version with no `rv` (older build) still credits and reads nothing pending.
- `ui/…` — the pending line's words; the issued face's OIL figures under changed values (board and OIL Earn mode).
- `e2e/oilworkstart.spec.ts` — the finding itself in a real browser: publish, change the Logic value, the Leave War
  cell unchanged, "1 pending", publish the AL, the cell moves.
- Break tests: each wire cut once, a named test red.

## 5. Risks the builder sees

1. A typo'd in-time LATER than its take-off reads as the evening before (D503) and makes a 20-hour day — a full day
   of OIL from a slip. The long-day warning fires on it and the Rally work accepted the same reading for work hours.
2. `resolveReporting` is now on the credit path of every published snapshot: an old snapshot's `intimes` could hold
   anything a member of an earlier build typed. It returns null rather than throwing on non-strings (`String(…)`).
3. A version issued before this build has no `rv`: it must credit as today (live values) and must NOT read pending.
4. Performance: `oilDelta` runs per published day per repaint (inside `publishReadPass` it is memoised); the new
   comparison is skipped unless a kept value differs from today's.

## 6. For the challenger

Attack the design, not the wording. In particular: (a) is `oilev.rv` the right home, against `snap.rv`
(`faceRuleVals`) or freezing each man's resolved spans; (b) is anything else read LIVE on the path from an issued day
to its OIL — a Logic value, the roster, the calendar, another day — that this plan leaves moving; (c) every reader of
OIL from an issued block: is one missing from §3's list; (d) the comparison on amounts only — a real hole, or right;
(e) a state where the new pending entry cannot be cleared, appears on a day that cannot be republished, or drops
sign-offs for nothing he can see; (f) half 1 against D503 / D505 / D506 / D42 / D49 — a case where the shared reader's
answer is wrong for OIL. Give each finding its concrete failure (setup, action, what goes wrong) and the exact fix.
**Not a finding (D56):** harm that lives only in data already stored when the code is right going forward — the whole
store is demo data, cleared before the database step.

## 7. After the challenge (6 Oct 26) — what changed, and why

Both challengers answered PROCEED WITH CHANGES, each blind to the other
(`../briefs/2026-10-06-oil-work-start-plan-challenge-astra.md`, `…-sol.md`). §1–§6 above are left as written; where
this section differs, this section is what was built. One round, as capped; nothing here re-opens a ruling.

| # | The finding | Who | Disposition |
|---|---|---|---|
| 1 | The four sign a CANDIDATE too — a day not yet published, or an amendment waiting — and a Logic change after they signed could publish OIL they never saw (signed a full day; a half goes out). `main` does the same. | Astra 1, Sol 1 | **Built.** Each sign-off's binding keeps the three values as they stood at signing (`orv`, earning days only); it holds while the day as it stands would write nobody's OIL record differently under those values than under today's (`publish.ts oilRvBoundOk` → the same `oilRuleShift` the pending comparison uses). Register OWS11. |
| 2 | "Amounts only" (§3's builder's reading) hides a change to the record's WORKED TIMES, which the Leave War's clash check and the day's sheet read; with nothing pending there is no door to put the new value through. Both: contradicted by D592's words. | Astra 2, Sol 2 | **Built, as Astra shaped it:** the comparison is each man's whole record — amount AND worked times as the record stores them. **Not as Sol shaped it** (pending whenever one of the three values differs): a day where the change would write every record exactly as it stands — a line with an entered in-time under a new nominal lead; a desk under a new debrief — raises nothing, by the same rule D186's printed brief lead follows (compared only where the day prints one). The builder's amounts-only reading is withdrawn. |
| 3 | The pending list folds every OIL entry into an edited request's own line — which would swallow the new Logic entry. | Astra 3, Sol 3 | **Built** (`publish.ts dayPendingItemsIn` folds only the evidence entry; the `oilrv:` entry is always its own item) and tested with both on one day and each put back on its own. |
| 4 | A nought-minute sortie whose entered in-time IS its take-off, under a debrief setting of zero, measures nothing — against D49. | Astra 4 | **Not built; pinned and filed.** With both Logic leads at zero the same line already measured nothing on `main`: D49's half day is the report and debrief around the sortie, and with neither there is nothing written to measure (D31 — credit never from a minimum). The boundary is pinned in `engine/oilworkstart.test.ts`; the wording it leaves ("still earns from the report and debrief" beside a line that earns nothing) is filed as `[OIL-ZERO-SPAN-SORTIE]`, low. |
| 5 | Readers to name explicitly: both callers of the figure helper, the "could he earn here" read, the two "can this row earn" helpers. | Astra (c), Sol (c) | **Built** — each takes the block's kept values. |
| 6 | §3 says the values are frozen at "EOD". There is no EOD publication yet (`[EOD]` is deferred). | Sol | **Corrected here:** first publish, an amendment, and Unpublish-then-publish — all through `daySnap`. A future EOD must use the same freeze point. |

Both confirmed: the evidence block is the right home for the kept values (not the printed-face `snap.rv`, not frozen
spans); no fourth value on the path needs keeping; the shared reporting reader is right for an ordinary flying line; a
time entered later than the nominal one shortens the day (D591's own words); nothing in SC, AVALON, BB or the other
rows should move; no migration (D56).
